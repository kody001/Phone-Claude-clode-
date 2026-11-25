"""Procedural underscore: one generator per mood, rendered per segment and crossfaded."""
import numpy as np
from dsp import *

# ------------------------------------------------------------------ instruments
def epiano(n, dur, vel=0.6, rng=None):
    f = note(n); d = max(dur, 0.6)
    y = fm(f, 1.0, 1.6 * vel + 0.4, d, 0.35, 0.9) + 0.18 * fm(f * 2, 7.0, 1.0, d, 0.05, 0.25)
    y *= np.clip((d - t_axis(d)) / 0.08, 0, 1)
    return y * vel


def pluck(n, dur, vel=0.6, rng=None):
    y = ks_fast(note(n), max(dur, 0.5), 0.995, 0.45, rng or RNG)
    return lp(y, 4500, 2) * vel


def pizz(n, dur, vel=0.6, rng=None):
    d = 0.45; y = ks_fast(note(n), d, 0.985, 0.25, rng or RNG)
    return lp(y, 2200, 2) * vel * np.exp(-t_axis(d) / 0.18)


def marimba(n, dur, vel=0.6, rng=None):
    f = note(n); d = 0.9
    return modal([f, f * 3.93, f * 9.2], [0.35, 0.08, 0.02], [1, 0.35, 0.08], d, rng or RNG) * vel


def glock(n, dur, vel=0.5, rng=None):
    f = note(n); d = 1.4; t = t_axis(d)
    y = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.5) + 0.3 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / 0.12) + 0.12 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t / 0.05)
    return y * vel * np.clip(t / 0.001, 0, 1)


def bass(n, dur, vel=0.7, rng=None):
    f = note(n); d = max(0.2, dur); t = t_axis(d)
    y = np.sin(2 * np.pi * f * t) + 0.25 * osc(f, d, 'tri')
    return lp(y, 450, 2) * env_adsr(d, 0.008, 0.15, 0.7, min(0.15, d * 0.4)) * vel


def pad(notes, dur, vel=0.4, cutoff=1300, attack=0.8, rng=None):
    rng = rng or RNG; d = dur; t = t_axis(d)
    l = np.zeros_like(t); r = np.zeros_like(t)
    for n in notes:
        for k, det in enumerate([-0.07, 0.0, 0.06]):
            y = osc(note(n) * 2 ** (det / 12), d, 'saw', rng.uniform(0, 6.28))
            if k == 0: l += y
            elif k == 2: r += y
            else: l += 0.6 * y; r += 0.6 * y
    e = env_adsr(d, attack, 0.3, 0.85, min(1.0, d * 0.4))
    out = np.stack([lp(l, cutoff, 2), lp(r, cutoff, 2)], 1) * e[:, None]
    return out * vel / (len(notes) * 2.2)


def strings(notes, dur, vel=0.4, rng=None):
    rng = rng or RNG; t = t_axis(dur); l = np.zeros_like(t); r = np.zeros_like(t)
    for n in notes:
        for k in range(2):
            vib = 1 + 0.004 * np.sin(2 * np.pi * (5 + rng.uniform(-0.5, 0.5)) * t + rng.uniform(0, 6))
            y = osc(note(n) * vib * (1 + (k - 0.5) * 0.003), dur, 'saw')
            (l if k == 0 else r)[:] += y
    e = env_adsr(dur, 0.5, 0.3, 0.85, min(1.2, dur * 0.4))
    out = np.stack([lp(l, 2400, 2), lp(r, 2400, 2)], 1) * e[:, None]
    return out * vel / (len(notes) * 1.6)


def kick(vel=0.8):
    d = 0.35; return (osc(glide(150, 42, 0.12), d) * env_exp(d, 0.12, 0.002)) * vel


def clap(vel=0.5):
    d = 0.2; y = bp(noise(d, 'white'), 900, 5000) * env_exp(d, 0.05, 0.002)
    return y * vel * 0.6


def hat(vel=0.3):
    d = 0.05; return hp(noise(d, 'white'), 7000) * env_exp(d, 0.012) * vel


def shaker(vel=0.25):
    d = 0.09; return bp(noise(d, 'white'), 4000, 11000) * np.sin(np.pi * np.linspace(0, 1, int(d * SR))) ** 2 * vel


def woodblock(vel=0.4, hi=True):
    f = 1050 if hi else 820; return modal([f, f * 2.6], [0.05, 0.02], [1, 0.4], 0.15) * vel


# ------------------------------------------------------------------ helpers
C = {  # chord tones as MIDI (root position triads around octave 4)
    'C': [48, 55, 60, 64, 67], 'Am': [45, 52, 57, 60, 64], 'F': [41, 48, 53, 57, 60], 'G': [43, 50, 55, 59, 62],
    'Dm': [38, 45, 50, 53, 57], 'Em': [40, 47, 52, 55, 59], 'Bb': [46, 53, 58, 62, 65], 'A7': [45, 52, 55, 61, 64],
    'Gsus': [43, 50, 55, 60, 62], 'Fmaj7': [41, 48, 52, 57, 60], 'Cadd9': [48, 55, 60, 62, 64], 'E': [40, 47, 52, 56, 59],
}


class Track:
    def __init__(self, dur):
        self.L = np.zeros((int((dur + 4) * SR), 2))

    def add(self, y, t, gain=1.0, pan=0.0):
        if y.ndim == 1:
            y = stereo(y, pan, 0.2)
        place(self.L, y, t, gain)


def mood_render(mood, dur, seed):
    rng = np.random.default_rng(seed)
    T = Track(dur)
    cfg = MOODS[mood]
    bpm = cfg['bpm']; beat = 60 / bpm; bar = beat * 4
    prog = cfg['prog']; nb = int(np.ceil(dur / bar)) + 1
    mel_scale = cfg.get('scale', [60, 62, 64, 67, 69, 72, 74, 76])
    for b in range(nb):
        t0 = b * bar; ch = C[prog[b % len(prog)]]; root = ch[0]
        if t0 > dur + 1:
            break
        for part in cfg['parts']:
            kind = part[0]; g = part[1]
            if kind == 'pad':
                T.add(pad([n + 12 for n in ch[1:4]], bar + 0.6, 0.5, part[2] if len(part) > 2 else 1300, rng=rng), t0, g)
            elif kind == 'strings':
                if b % 2 == 0:
                    T.add(strings([n + 12 for n in ch[1:4]], bar * 2 + 0.5, 0.5, rng), t0, g)
            elif kind == 'bass':
                pat = part[2] if len(part) > 2 else [0, 2]
                for k in pat:
                    T.add(bass(root - 12 + (7 if k == 3 and len(pat) > 2 else 0), beat * 0.9, 0.7), t0 + k * beat, g)
            elif kind == 'arp':
                inst = part[2]; step = part[3]; seq = part[4]
                notes = [n + 12 for n in ch[1:]]
                for i in range(int(4 / step)):
                    nn = notes[seq[i % len(seq)] % len(notes)]
                    v = 0.55 + 0.15 * ((i % 2) == 0) + rng.uniform(-0.05, 0.05)
                    T.add(INST[inst](nn, beat * step, v, rng), t0 + i * beat * step + rng.uniform(0, 0.006), g, pan=rng.uniform(-0.4, 0.4))
            elif kind == 'mel':
                inst = part[2]
                if b % 2 == 1 and rng.uniform() < 0.35:
                    continue
                rhythm = [[0, 1.5, 2, 3], [0, 0.5, 1, 2.5], [0.5, 1, 2, 3.5], [0, 2], [0, 1, 1.5, 3]][rng.integers(0, 5)]
                tones = [n + 24 for n in ch[1:4]]
                for k, rb in enumerate(rhythm):
                    nn = tones[rng.integers(0, 3)] if k == 0 else mel_scale[rng.integers(0, len(mel_scale))] + part[3]
                    T.add(INST[inst](nn, beat, 0.45 + rng.uniform(0, 0.15), rng), t0 + rb * beat, g, pan=rng.uniform(-0.3, 0.3))
            elif kind == 'pizzwalk':
                for k in range(4):
                    if rng.uniform() < part[2]:
                        nn = ch[1 + (k + b) % 4] + 12
                        T.add(pizz(nn, beat, 0.7, rng), t0 + k * beat + (beat * 0.5 if k % 2 else 0), g, pan=rng.uniform(-0.5, 0.5))
            elif kind == 'drums':
                style = part[2]
                for k in range(4):
                    tb = t0 + k * beat
                    if style in ('pop', 'soft') and (k == 0 or (style == 'pop' and k == 2)):
                        T.add(kick(0.7 if style == 'pop' else 0.45), tb, g)
                    if style == 'pop' and k in (1, 3):
                        T.add(clap(0.45), tb, g, pan=0.1)
                    for h in range(2):
                        T.add(shaker(0.22 if h else 0.15) if style != 'tick' else hat(0.12), tb + h * beat / 2, g, pan=0.3)
                    if style == 'tick':
                        for h in range(4):
                            T.add(hat(0.09 + 0.05 * (h == 0)), tb + h * beat / 4, g, pan=-0.2)
            elif kind == 'wood':
                for k in range(4):
                    if rng.uniform() < part[2]:
                        T.add(woodblock(0.35, k % 2 == 0), t0 + k * beat + rng.choice([0, beat / 2]), g, pan=rng.uniform(-0.6, 0.6))
            elif kind == 'drone':
                if b % 2 == 0:
                    d = bar * 2 + 0.5; tt = t_axis(d)
                    y = sum(osc(note(n), d, 'saw') for n in part[2]); y = lp(y, 380) * env_adsr(d, 1.0, 0.3, 0.9, 1.0) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.25 * tt))
                    T.add(stereo(y * 0.25, 0, 0.6), t0, g)
            elif kind == 'pulse':
                for k in range(8):
                    T.add(bass(part[2] - 12, beat * 0.4, 0.55 if k % 2 == 0 else 0.35), t0 + k * beat / 2, g)
            elif kind == 'cluster':
                if b % 2 == 1:
                    T.add(strings(part[2], bar * 1.5, 0.35, rng), t0, g)
            elif kind == 'piano':
                notes = [n + 12 for n in ch[1:]]
                for i, k in enumerate([0, 1, 2, 3, 2, 1]):
                    if rng.uniform() < part[2]:
                        T.add(epiano(notes[k], beat, 0.5, rng), t0 + i * beat * 0.66, g, pan=rng.uniform(-0.3, 0.3))
                T.add(epiano(root, bar, 0.45, rng), t0, g * 0.8)
    out = T.L[:int((dur + 2.5) * SR)]
    return reverb(out, 0.22, 2.2, 0.7)[:len(out)]


INST = {'epiano': epiano, 'pluck': pluck, 'pizz': pizz, 'marimba': marimba, 'glock': glock}

MOODS = {
    'playful': dict(bpm=104, prog=['C', 'Am', 'F', 'G'], parts=[('arp', 0.55, 'marimba', 0.5, [0, 2, 1, 3, 2, 1, 3, 2]), ('bass', 0.7, [0, 2]), ('drums', 0.5, 'soft'), ('mel', 0.35, 'glock', 0)]),
    'quirky': dict(bpm=100, prog=['Dm', 'G', 'C', 'A7'], parts=[('pizzwalk', 0.9, 0.85), ('bass', 0.6, [0, 2]), ('wood', 0.5, 0.45), ('mel', 0.3, 'marimba', -12)]),
    'upbeat': dict(bpm=108, prog=['C', 'G', 'Am', 'F'], parts=[('arp', 0.5, 'pluck', 0.5, [0, 1, 2, 3, 2, 1, 0, 2]), ('bass', 0.7, [0, 2, 3]), ('drums', 0.55, 'pop'), ('pad', 0.35, 1600), ('mel', 0.3, 'glock', 0)]),
    'awkward': dict(bpm=86, prog=['Dm', 'G', 'Dm', 'E'], parts=[('pizzwalk', 0.85, 0.55), ('wood', 0.4, 0.3), ('bass', 0.55, [0])]),
    'tender': dict(bpm=72, prog=['F', 'C', 'Dm', 'Bb'], parts=[('arp', 0.5, 'epiano', 0.5, [0, 1, 2, 3, 2, 1, 2, 3]), ('pad', 0.45, 1100), ('bass', 0.5, [0])]),
    'hopeful': dict(bpm=78, prog=['C', 'G', 'Am', 'F'], parts=[('arp', 0.5, 'epiano', 0.5, [0, 2, 1, 3, 2, 1, 3, 2]), ('pad', 0.45, 1400), ('bass', 0.55, [0, 2]), ('drums', 0.35, 'soft')]),
    'romance': dict(bpm=70, prog=['F', 'Am', 'Bb', 'C'], parts=[('arp', 0.45, 'epiano', 0.5, [0, 1, 2, 3, 2, 1, 2, 3]), ('strings', 0.45), ('bass', 0.5, [0]), ('mel', 0.3, 'glock', 0)]),
    'longing': dict(bpm=68, prog=['Dm', 'Bb', 'F', 'C'], parts=[('arp', 0.45, 'epiano', 0.5, [0, 2, 3, 2, 1, 2, 3, 2]), ('pad', 0.45, 1000), ('bass', 0.5, [0])]),
    'reflect': dict(bpm=70, prog=['Fmaj7', 'C', 'Dm', 'Bb'], parts=[('piano', 0.5, 0.7), ('pad', 0.4, 1000)]),
    'pad': dict(bpm=60, prog=['F', 'Dm', 'Bb', 'C'], parts=[('pad', 0.5, 900)]),
    'sad': dict(bpm=66, prog=['Am', 'F', 'C', 'G'], parts=[('piano', 0.5, 0.6), ('pad', 0.3, 900)]),
    'tense': dict(bpm=70, prog=['Dm', 'Dm', 'Bb', 'A7'], parts=[('drone', 0.6, [26, 33]), ('pulse', 0.45, 38), ('drums', 0.4, 'tick'), ('cluster', 0.25, [62, 63, 69])]),
    'suspense': dict(bpm=64, prog=['Dm', 'Bb', 'Dm', 'A7'], parts=[('drone', 0.55, [26, 33]), ('pulse', 0.3, 38), ('cluster', 0.2, [62, 63, 67])]),
    'explain': dict(bpm=96, prog=['C', 'G', 'Am', 'F'], parts=[('arp', 0.45, 'pluck', 0.5, [0, 2, 1, 3, 0, 2, 1, 3]), ('pad', 0.35, 1200), ('bass', 0.5, [0, 2]), ('drums', 0.3, 'soft')]),
    'theme': dict(bpm=112, prog=['C', 'G', 'Am', 'F'], parts=[('arp', 0.5, 'pluck', 0.5, [0, 1, 2, 3, 2, 1, 2, 3]), ('pad', 0.4, 1800), ('bass', 0.7, [0, 2, 3]), ('drums', 0.55, 'pop'), ('mel', 0.35, 'glock', 0)]),
    'joy': dict(bpm=108, prog=['F', 'C', 'Dm', 'Bb'], parts=[('arp', 0.5, 'marimba', 0.5, [0, 2, 1, 3, 2, 1, 3, 2]), ('pad', 0.35, 1600), ('bass', 0.65, [0, 2]), ('drums', 0.5, 'pop'), ('mel', 0.35, 'glock', 0)]),
    'morning': dict(bpm=100, prog=['C', 'Em', 'F', 'G'], parts=[('arp', 0.5, 'pluck', 0.5, [0, 2, 1, 3, 2, 1, 3, 2]), ('pad', 0.35, 1500), ('bass', 0.6, [0, 2]), ('drums', 0.4, 'soft'), ('mel', 0.3, 'glock', 0)]),
    'outro': dict(bpm=108, prog=['F', 'C', 'Dm', 'Bb'], parts=[('arp', 0.5, 'pluck', 0.5, [0, 1, 2, 3, 2, 1, 2, 3]), ('pad', 0.4, 1800), ('bass', 0.65, [0, 2, 3]), ('drums', 0.5, 'pop'), ('mel', 0.35, 'glock', 0)]),
}
MOODS['none'] = None


def render_score(moods, total):
    """moods: list of {t, mood, gain}; returns stereo array of length total seconds."""
    out = np.zeros((int(total * SR) + SR, 2))
    ms = sorted(moods, key=lambda m: m['t'])
    for i, m in enumerate(ms):
        t0 = m['t']; t1 = ms[i + 1]['t'] if i + 1 < len(ms) else total
        if m['mood'] == 'none' or t1 - t0 < 0.5:
            continue
        seg = mood_render(m['mood'], t1 - t0, seed=int(t0 * 10))
        n = len(seg); fi = int(0.5 * SR)
        hard = i + 1 < len(ms) and ms[i + 1]['mood'] == 'none'
        fo = int((0.25 if hard else 1.4) * SR)
        e = np.ones(n)
        e[:fi] = np.linspace(0, 1, fi)
        end = int((t1 - t0) * SR)
        a = max(0, end - (fo // 2 if hard else fo // 3)); b = min(n, a + fo)
        e[a:b] *= np.linspace(1, 0, b - a); e[b:] = 0
        seg = seg * e[:, None] * m.get('gain', 1.0)
        place(out, seg, t0)
    return out[:int(total * SR)]

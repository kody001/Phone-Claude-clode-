"""Procedural SFX library. Every cue id used by the shots maps to a recipe that renders a 48 kHz stereo WAV.
Families: synthesized foley/UI/vehicles/animals (numpy), orchestral stingers (FluidSynth + GM soundfont),
voice-based clips (Kokoro pool from voices.py, processed here)."""
import os, sys, json, glob, pathlib, random, subprocess, tempfile
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, lfilter, resample_poly
from pedalboard import Pedalboard, Reverb, PitchShift, Compressor, Distortion, LowpassFilter, HighpassFilter, Chorus, Gain

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'audio' / 'sfx'; OUT.mkdir(parents=True, exist_ok=True)
POOL = ROOT / 'audio' / 'voicepool'
SF2 = '/usr/share/sounds/sf2/FluidR3_GM.sf2'
SR = 48000
R = np.random.default_rng(7)

# ------------------------------------------------------------------ DSP helpers
class Sig(np.ndarray):
    """float array that pads (+) / crops (*) to match lengths and upmixes mono to stereo when combined"""
    def _fit(self, o, pad=True):
        a = np.asarray(self); b = np.asarray(o)
        if b.ndim == 0: return a, b
        if a.ndim != b.ndim:
            if a.ndim == 1: a = np.stack([a, a], 1)
            if b.ndim == 1: b = np.stack([b, b], 1)
        if a.shape[0] != b.shape[0]:
            if pad:
                n = max(a.shape[0], b.shape[0])
                a = np.concatenate([a, np.zeros((n - a.shape[0],) + a.shape[1:], a.dtype)]); b = np.concatenate([b, np.zeros((n - b.shape[0],) + b.shape[1:], b.dtype)])
            else:
                n = min(a.shape[0], b.shape[0]); a = a[:n]; b = b[:n]
        return a, b
    def __add__(self, o): a, b = self._fit(o); return np.add(a, b).astype(np.float32).view(Sig)
    __radd__ = __add__
    def __sub__(self, o): a, b = self._fit(o); return np.subtract(a, b).astype(np.float32).view(Sig)
    def __mul__(self, o): a, b = self._fit(o, pad=False); return np.multiply(a, b).astype(np.float32).view(Sig)
    __rmul__ = __mul__
def sg(x): return np.asarray(x, dtype=np.float32).view(Sig)
def T(d): return sg(np.arange(int(d * SR)) / SR)
def N(d, seed=None): return sg(np.random.default_rng(seed).standard_normal(int(d * SR)) if seed is not None else R.standard_normal(int(d * SR)))
def sos(kind, f, order=2):
    nyq = SR / 2
    if kind == 'bp': return butter(order, [max(20, f[0]) / nyq, min(f[1], nyq * 0.98) / nyq], 'band', output='sos')
    return butter(order, min(f, nyq * 0.98) / nyq, kind, output='sos')
def lp(x, f, o=2): return sg(sosfilt(sos('low', f, o), np.asarray(x), axis=0))
def hp(x, f, o=2): return sg(sosfilt(sos('high', f, o), np.asarray(x), axis=0))
def bp(x, f1, f2, o=2): return sg(sosfilt(sos('bp', (f1, f2), o), np.asarray(x), axis=0))
def env_exp(n, tau, a=0.002):
    t = np.arange(n) / SR; e = np.exp(-t / tau); k = int(a * SR)
    if k > 0: e[:k] *= np.linspace(0, 1, k)
    return sg(e)
def env_ad(n, a, d, curve=2.0):
    t = np.arange(n) / SR; e = np.where(t < a, (t / max(a, 1e-4)), np.clip(1 - (t - a) / max(d, 1e-4), 0, 1) ** curve)
    return sg(e)
def env_hann(n): return sg(np.hanning(n))
def osc(freq, kind='sine', phase0=0.0):
    f = np.asarray(freq, dtype=np.float64); ph = phase0 + 2 * np.pi * np.cumsum(f) / SR
    if kind == 'sine': return sg(np.sin(ph))
    if kind == 'saw': return sg(2 * ((ph / (2 * np.pi)) % 1) - 1)
    if kind == 'square': return sg(np.sign(np.sin(ph)))
    if kind == 'tri': return sg(2 * np.abs(2 * ((ph / (2 * np.pi)) % 1) - 1) - 1)
def fade(x, fi=0.005, fo=0.02):
    x = np.array(x, copy=True); a, b = min(int(fi * SR), len(x) // 3), min(int(fo * SR), len(x) // 3)
    if a: x[:a] *= np.linspace(0, 1, a)[:, None] if x.ndim == 2 else np.linspace(0, 1, a)
    if b: x[-b:] *= np.linspace(1, 0, b)[:, None] if x.ndim == 2 else np.linspace(1, 0, b)
    return x
def norm(x, peak=0.89):
    m = np.abs(x).max(); return (x / m * peak).astype(np.float32) if m > 0 else x.astype(np.float32)
def st(x, pan=0.0, width=0.0):
    """mono -> stereo with constant-power pan (pan may be an array) and optional decorrelated width"""
    if x.ndim == 2: return sg(x)
    x = np.asarray(x, np.float32)
    p = np.clip((np.asarray(pan) + 1) / 2, 0, 1); l = np.cos(p * np.pi / 2) * x; r = np.sin(p * np.pi / 2) * x
    if width > 0:
        d = int(0.011 * SR); r2 = np.concatenate([np.zeros(d, np.float32), x[:-d]]) if len(x) > d else x
        l = l * (1 - width * 0.3); r = r * (1 - width * 0.3) + r2 * width * 0.3 * np.sin(p * np.pi / 2)
    return sg(np.stack([np.asarray(l), np.asarray(r)], 1))
def mix(*parts):
    n = max(len(p[1]) + int(p[0] * SR) for p in parts)
    out = np.zeros((n, 2), np.float32)
    for off, a, *g in parts:
        a = st(a) if a.ndim == 1 else a; o = int(off * SR); gg = g[0] if g else 1.0
        out[o:o + len(a)] += np.asarray(a) * gg
    return sg(out)
def verb(x, room=0.5, wet=0.25, damp=0.5, width=1.0, tail=1.0):
    x = st(x) if x.ndim == 1 else x
    x = np.concatenate([np.asarray(x), np.zeros((int(tail * SR), 2), np.float32)])
    y = Pedalboard([Reverb(room_size=room, damping=damp, wet_level=wet, dry_level=1 - wet * 0.5, width=width)])(np.ascontiguousarray(np.asarray(x).T), SR).T
    return sg(y)
def pitch(x, semis):
    x = st(x) if x.ndim == 1 else x
    return sg(Pedalboard([PitchShift(semitones=semis)])(np.asarray(x).T.copy(), SR).T)
def speed(x, k):
    """resample-based speed/pitch change (k>1 faster/higher)"""
    from fractions import Fraction
    fr = Fraction(1 / k).limit_denominator(50);
    if x.ndim == 1: return resample_poly(x, fr.numerator, fr.denominator).astype(np.float32)
    return np.stack([resample_poly(x[:, i], fr.numerator, fr.denominator) for i in range(2)], 1).astype(np.float32)
def trim_tail(x, thr=1e-4):
    a = np.abs(x).max(1) if x.ndim == 2 else np.abs(x); idx = np.where(a > thr)[0]
    return x[: idx[-1] + 1] if len(idx) else x
def seq(fn, times, jitter=0.0, seed=1):
    r = np.random.default_rng(seed); parts = []
    for i, t in enumerate(times): parts.append((max(0, t + r.uniform(-jitter, jitter)), fn(i, r)))
    return mix(*parts)

# ------------------------------------------------------------------ building blocks
def click(dur=0.012, f=3000, q=1.0, amp=1.0, seed=None):
    x = N(dur, seed) * env_exp(int(dur * SR), dur / 4); return bp(x, f / (1 + q), f * (1 + q)) * amp
def thump(f=70, dur=0.35, drop=0.5, amp=1.0):
    t = T(dur); fr = f * (1 + drop * np.exp(-t / 0.03)); x = osc(fr) * env_exp(len(t), dur / 4)
    return (x + lp(N(dur), 300) * env_exp(len(t), 0.02) * 0.3) * amp
def bell(f=880, dur=1.5, partials=((1, 1), (2.76, 0.5), (5.4, 0.25), (8.93, 0.12)), decay=0.5):
    t = T(dur); x = np.zeros(len(t), np.float32)
    for m, a in partials: x += np.asarray(a * osc(np.full(len(t), f * m)) * env_exp(len(t), decay / (m ** 0.5)))
    return sg(x)
def pluck(f=440, dur=0.6, bright=0.6):
    n = int(dur * SR); period = int(SR / f); buf = N(period / SR + 0.001)[:period]; out = np.zeros(n, np.float32)
    for i in range(n):
        out[i] = buf[i % period]; buf[i % period] = bright * 0.5 * (buf[i % period] + buf[(i + 1) % period]) + (1 - bright) * buf[i % period] * 0.996
    return sg(out)
def whoosh(dur=0.6, f0=400, f1=3500, peak=0.5, pan0=-0.6, pan1=0.6, seed=None, q=0.8):
    n = int(dur * SR); x = N(dur, seed); out = np.zeros(n, np.float32); blk = 512
    for i in range(0, n, blk):
        k = i / n; fc = f0 * (f1 / f0) ** k; s = sos('bp', (fc / (1 + q), fc * (1 + q)))
        out[i:i + blk] = sosfilt(s, x[i:i + blk])
    e = np.where(np.arange(n) / n < peak, (np.arange(n) / n / peak) ** 2, ((1 - np.arange(n) / n) / (1 - peak)) ** 1.5)
    return st(out * e, np.linspace(pan0, pan1, n), 0.4)
def noise_burst(dur, f1, f2, a=0.003, tau=None):
    n = int(dur * SR); return bp(N(dur), f1, f2) * (env_exp(n, tau or dur / 3, a))
def bubble(f=600, dur=0.06, rise=2.0):
    t = T(dur); fr = f * (1 + rise * t / dur); return osc(fr) * env_exp(len(t), dur / 3)
def creak(dur=0.8, f=90, seed=3):
    r = np.random.default_rng(seed); n = int(dur * SR); fr = f * (1 + 0.3 * np.sin(np.linspace(0, 6, n)) + 0.1 * r.standard_normal(n).cumsum() / np.sqrt(n))
    pulses = (osc(fr, 'saw') > 0.95).astype(np.float32) * 0.8 + N(dur, seed) * 0.05
    return bp(pulses, 300, 2500) * env_hann(n)
def engine(dur, rpm0, rpm1, cyl=6, rough=0.3, bright=900, seed=4):
    n = int(dur * SR); rpm = np.linspace(rpm0, rpm1, n); f = rpm / 60 * cyl / 2
    x = osc(f, 'saw') * 0.6 + osc(f * 0.5, 'sine') * 0.5 + osc(f * 2, 'square') * 0.1
    x = x * (1 + rough * (np.random.default_rng(seed).standard_normal(n) * 0.5)); return lp(x, bright, 2)
def modal(f0=420, dur=1.2, ratios=(1, 2.32, 4.25, 6.63, 9.38), decays=(0.6, 0.35, 0.22, 0.15, 0.1)):
    t = T(dur); x = np.zeros(len(t), np.float32)
    for r_, d in zip(ratios, decays): x += np.asarray(osc(np.full(len(t), f0 * r_)) * env_exp(len(t), d)) / r_ ** 0.3
    return sg(x)
def footstep(kind='shoe', seed=0):
    r = np.random.default_rng(seed)
    if kind == 'boot': return thump(55 + r.uniform(-5, 5), 0.18, 0.4, 0.9) + noise_burst(0.08, 300, 2200, 0.001, 0.02) * 0.6
    if kind == 'grass': return noise_burst(0.12, 800, 5000, 0.004, 0.04) * 0.5 + thump(60, 0.1, 0.2, 0.3)
    return thump(80 + r.uniform(-8, 8), 0.12, 0.3, 0.5) + noise_burst(0.05, 1200, 5000, 0.0005, 0.012) * 0.7
def steps(dur, rate=2.0, kind='shoe', seed=0):
    return seq(lambda i, r: st(footstep(kind, seed + i), (-0.15 if i % 2 else 0.15)), np.arange(0, dur, 1 / rate), 0.02, seed)

# ------------------------------------------------------------------ fluidsynth stingers
def fs_render(notes, prog_map, dur, tempo=120, gain=0.9):
    """notes: list of (start_beat, dur_beats, midi_note, velocity, channel); prog_map: {channel: program}"""
    import mido
    mid = mido.MidiFile(ticks_per_beat=480); tr = mido.MidiTrack(); mid.tracks.append(tr)
    tr.append(mido.MetaMessage('set_tempo', tempo=mido.bpm2tempo(tempo)))
    for ch, pg in prog_map.items():
        tr.append(mido.Message('program_change', channel=ch, program=pg, time=0))
        tr.append(mido.Message('control_change', channel=ch, control=91, value=50, time=0))
    ev = []
    for s, d, n, v, ch in notes: ev.append((int(s * 480), 'on', n, v, ch)); ev.append((int((s + d) * 480), 'off', n, 0, ch))
    ev.sort(key=lambda e: (e[0], e[1] == 'on')); now = 0
    for tk, kind, n, v, ch in ev:
        tr.append(mido.Message('note_on' if kind == 'on' else 'note_off', channel=ch, note=n, velocity=v, time=tk - now)); now = tk
    with tempfile.TemporaryDirectory() as d:
        mp = os.path.join(d, 'a.mid'); wp = os.path.join(d, 'a.wav'); mid.save(mp)
        subprocess.run(['fluidsynth', '-ni', '-g', str(gain), '-r', str(SR), '-F', wp, SF2, mp], check=True, capture_output=True)
        a, sr = sf.read(wp, dtype='float32')
    return sg(a[: int((dur + 0.5) * SR)])
def chord(root, kind='maj'):
    iv = {'maj': [0, 4, 7], 'min': [0, 3, 7], 'dim': [0, 3, 6], 'sus': [0, 5, 7], 'maj7': [0, 4, 7, 11], 'min7': [0, 3, 7, 10], '7': [0, 4, 7, 10], 'add9': [0, 4, 7, 14], '6': [0, 4, 7, 9]}[kind]
    return [root + i for i in iv]

# ------------------------------------------------------------------ voice pool helpers
def vp(pattern):
    fs = sorted(glob.glob(str(POOL / pattern))); return fs
def vload(path):
    a, sr = sf.read(path, dtype='float32'); return sg(a)
def crowd(patterns, n=10, spread=0.5, seed=1, room=0.5, lpf=6000, gain_jitter=0.4):
    r = np.random.default_rng(seed); files = []
    for p in patterns: files += vp(p)
    if not files: return np.zeros((SR, 2), np.float32)
    parts = []
    for i in range(n):
        a = vload(files[r.integers(len(files))]); a = a * (1 - gain_jitter * r.random())
        parts.append((r.uniform(0, spread), st(a, r.uniform(-0.8, 0.8))))
    x = mix(*parts); x = lp(x, lpf); return verb(x, room, 0.22, 0.6, tail=0.6)
def phone_voice(x):
    x = bp(x, 350, 3400, 3); x = Pedalboard([Distortion(drive_db=12), HighpassFilter(400), LowpassFilter(3200), Gain(-6)])(x[None, :].copy(), SR)[0]
    return x
def whisperize(x, order=18):
    """LPC vocoder with white-noise excitation -> whisper"""
    n = len(x); frame = 1024; hop = 512; out = np.zeros(n + frame, np.float32); win = np.hanning(frame)
    for i in range(0, n - frame, hop):
        seg = x[i:i + frame] * win
        if np.abs(seg).max() < 1e-4: continue
        r_ = np.correlate(seg, seg, 'full')[frame - 1: frame + order]
        a = np.zeros(order + 1); a[0] = 1; e = r_[0] + 1e-9
        for k in range(1, order + 1):
            acc = r_[k] + np.dot(a[1:k], r_[k - 1:0:-1]); kk = -acc / e
            a[1:k + 1] = a[1:k + 1] + kk * np.concatenate([a[k - 1:0:-1], [1.0]]); e *= (1 - kk * kk)
        g = np.sqrt(max(e, 1e-12) / frame)
        ex = np.random.default_rng(i).standard_normal(frame)
        out[i:i + frame] += (lfilter([g], a, ex) * win).astype(np.float32)
    return hp(out[:n], 600)

# ------------------------------------------------------------------ recipes
def rec():
    S = {}
    # --- whooshes / transitions
    S['whoosh_soft'] = lambda: whoosh(0.55, 300, 2500, 0.55) * 0.7
    S['whoosh_big'] = lambda: verb(whoosh(1.0, 150, 4000, 0.6) + st(thump(45, 1.0, 0.2, 0.6) * env_hann(int(SR * 1.0))), 0.6, 0.2)
    S['whoosh_multi'] = lambda: mix(*[(i * 0.07, whoosh(0.35, 500 + i * 120, 3500, 0.5, -0.8 + i * 0.3, 0.8 - i * 0.2, seed=i) * 0.55) for i in range(6)])
    S['whoosh_digital'] = lambda: whoosh(0.5, 800, 6000, 0.4) * 0.6 + st(osc(np.linspace(300, 2400, int(SR * 0.5)), 'square') * env_hann(int(SR * 0.5)) * 0.06)
    S['shrug_whoosh'] = lambda: whoosh(0.35, 500, 1800, 0.5, -0.2, 0.2) * 0.5
    S['card_whoosh'] = lambda: whoosh(0.4, 600, 4000, 0.45, -0.7, 0.4) * 0.7 + st(click(0.01, 2500), 0.3) * 0.0
    S['swish_stealth'] = lambda: whoosh(0.45, 1500, 300, 0.3, 0.6, -0.6) * 0.6
    S['shrink_whoosh'] = lambda: whoosh(0.7, 3000, 200, 0.2, 0, 0) * 0.7 + st(osc(np.linspace(1200, 150, int(SR * 0.7))) * env_ad(int(SR * 0.7), 0.05, 0.65) * 0.15)
    S['release_whoosh'] = lambda: verb(whoosh(1.2, 200, 5000, 0.35, -0.3, 0.6) * 0.7, 0.7, 0.3)
    S['space_whoosh'] = lambda: verb(whoosh(1.1, 120, 2500, 0.5, -0.8, 0.8) * 0.8, 0.9, 0.35, tail=1.5)
    S['eye_roll'] = lambda: whoosh(0.4, 900, 2600, 0.5, -0.4, 0.4) * 0.35 + st(osc(np.linspace(500, 900, int(SR * 0.3))) * env_hann(int(SR * 0.3)) * 0.12)
    S['echo_memory'] = lambda: verb(st(bell(1046, 1.2, decay=0.4) * 0.3) + whoosh(1.0, 2500, 300, 0.8) * 0.4, 0.9, 0.5, tail=2)
    S['reverse_swell'] = lambda: fs_render([(0, 3, 60, 110, 0)], {0: 119}, 2.4, 60, 1.0)
    S['riser_soft'] = lambda: (lambda n: st(sum(osc(np.linspace(f, f * 2, n)) * 0.1 for f in (220, 277, 330)) * np.linspace(0, 1, n) ** 2) + whoosh(2.2, 200, 6000, 0.95) * 0.5)(int(SR * 2.2))
    S['zipper'] = lambda: st(seq(lambda i, r: click(0.006, 4000 + r.uniform(-500, 500), 0.6), np.arange(0, 0.5, 0.012)) [:, 0] * env_hann(int(SR * 0.52))[: len(seq(lambda i, r: click(0.006, 4000), np.arange(0, 0.5, 0.012)))]) * 0.5
    # --- impacts / hits
    S['impact_low'] = lambda: verb(st(thump(42, 1.4, 1.2, 1.0)) + st(noise_burst(0.3, 60, 600, 0.002, 0.1) * 0.5), 0.7, 0.25, tail=1.5)
    S['boom_soft'] = lambda: verb(st(thump(50, 1.2, 0.6, 0.8)), 0.8, 0.3, tail=1.5)
    S['thud'] = lambda: st(thump(65, 0.4, 0.8, 1.0) + noise_burst(0.15, 100, 1500, 0.001, 0.04) * 0.6)
    S['box_thud'] = lambda: st(thump(110, 0.25, 0.4, 0.7) + noise_burst(0.12, 200, 2500, 0.001, 0.03) * 0.6)
    S['boxes_crash'] = lambda: verb(mix(*[(i * 0.11 + R.uniform(0, 0.05), st(thump(90 + i * 7, 0.3, 0.4, 0.8) + noise_burst(0.18, 150, 3500, 0.001, 0.05) * 0.7, R.uniform(-0.7, 0.7))) for i in range(9)]), 0.5, 0.2)
    S['title_hit'] = lambda: mix((0, fs_render([(0, 3, n, 120, 0) for n in chord(48, 'maj') + [60, 64]] + [(0, 3, 36, 127, 1), (0, 0.5, 49, 120, 9), (0, 0.5, 57, 100, 9)], {0: 55, 1: 47}, 3.0, 100, 1.0)), (0, verb(st(thump(40, 2.0, 0.8, 0.9)), 0.8, 0.3, tail=2), 0.7))
    S['title_hit_soft'] = lambda: fs_render([(0, 2, n, 90, 0) for n in chord(60, 'add9')] + [(0, 2, 84, 70, 1)], {0: 0, 1: 14}, 2.5, 90)
    S['warm_hit'] = lambda: fs_render([(0, 3, n, 90, 0) for n in chord(53, 'add9')] + [(0, 3, 77, 80, 1)], {0: 48, 1: 9}, 3, 90)
    S['decision_hit'] = lambda: fs_render([(0, 2, 41, 120, 0), (0, 2, 29, 110, 1), (0, 2, 53, 90, 1)], {0: 47, 1: 48}, 2.5, 90)
    S['dun_dun'] = lambda: fs_render([(0, 0.4, 36, 120, 0), (0, 0.4, 48, 110, 1), (0.75, 1.6, 35, 127, 0), (0.75, 1.6, 47, 120, 1), (0.75, 1.6, 41, 120, 2)], {0: 48, 1: 61, 2: 47}, 2.2, 100)
    S['villain_sting'] = lambda: fs_render([(0, 2, n, 110, 0) for n in [36, 39, 42, 48]] + [(0, 2, 30, 120, 1), (0, 0.3, 49, 90, 9)], {0: 61, 1: 47}, 2.3, 100)
    S['success_sting'] = lambda: fs_render([(i * 0.25, 1.5 - i * 0.2, n, 110, 0) for i, n in enumerate([72, 76, 79, 84])] + [(i * 0.25, 1.4, n - 12, 90, 1) for i, n in enumerate([72, 76, 79, 84])] + [(0.75, 1.0, 49, 90, 9)], {0: 9, 1: 61}, 2.2, 120)
    S['brass_sting'] = lambda: fs_render([(0, 0.5, n, 120, 0) for n in chord(55, 'maj') + [67]] + [(0.5, 1.2, n, 120, 0) for n in chord(60, 'maj') + [72]] + [(0.5, 0.5, 49, 110, 9)], {0: 61}, 2.0, 110)
    S['triumph_sting'] = lambda: fs_render([(0, 0.5, 67, 120, 0), (0.5, 0.5, 72, 120, 0), (1, 2.5, 76, 127, 0)] + [(1, 2.5, n, 110, 1) for n in chord(48, 'maj') + [60]] + [(0, 1, 41, 100, 2), (1, 1.5, 36, 127, 2), (1, 0.5, 49, 120, 9)], {0: 56, 1: 61, 2: 47}, 3.5, 110)
    S['reveal_sting'] = lambda: fs_render([(i * 0.06, 2, n, 90, 0) for i, n in enumerate(range(60, 84, 2))] + [(0.8, 2.2, n, 100, 1) for n in chord(60, 'add9')], {0: 46, 1: 48}, 3.2, 90)
    S['friend_sting'] = lambda: fs_render([(0, 0.5, 79, 100, 0), (0.5, 0.5, 84, 100, 0), (1, 1.6, 88, 110, 0)] + [(0, 2.6, n, 70, 1) for n in chord(60, '6')], {0: 9, 1: 48}, 3, 100)
    S['end_sting'] = lambda: fs_render([(0, 0.25, 72, 100, 0), (0.25, 0.25, 74, 100, 0), (0.5, 0.25, 76, 100, 0), (1.0, 1.5, 84, 110, 0), (1.0, 1.5, 60, 100, 1), (1.0, 1.5, 48, 110, 2), (1, 0.5, 49, 100, 9)], {0: 9, 1: 45, 2: 45}, 2.8, 120)
    S['tada'] = lambda: fs_render([(0, 0.3, 67, 120, 0), (0.33, 1.4, 72, 127, 0), (0.33, 1.4, 64, 110, 1), (0.33, 1.4, 60, 110, 1), (0.33, 0.5, 49, 100, 9)], {0: 56, 1: 61}, 2.0, 120)
    S['sad_trombone'] = lambda: fs_render([(0, 0.6, 58, 110, 0), (0.7, 0.6, 57, 110, 0), (1.4, 0.6, 56, 110, 0), (2.1, 1.8, 55, 110, 0)], {0: 57}, 4.0, 100)
    S['sad_trombone_short'] = lambda: fs_render([(0, 0.4, 58, 100, 0), (0.45, 1.2, 55, 100, 0)], {0: 57}, 1.8, 110)
    S['dad_joke_drum'] = lambda: fs_render([(0, 0.2, 38, 110, 9), (0.33, 0.2, 45, 110, 9), (0.66, 1.2, 49, 110, 9), (0.66, 0.4, 36, 100, 9)], {}, 2.0, 120)
    S['brass_stab'] = S['brass_sting']
    S['choir_aah'] = lambda: fs_render([(0, 4, n, 80, 0) for n in chord(60, 'add9') + [48]] + [(0.5, 3.5, n, 60, 1) for n in chord(72, 'maj')], {0: 52, 1: 91}, 4.5, 60)
    S['choir_hit'] = lambda: fs_render([(0, 1.5, n, 120, 0) for n in chord(60, 'maj') + [72]] + [(0, 1.5, 48, 120, 1)], {0: 52, 1: 55}, 2, 100)
    S['emotional_swell'] = lambda: fs_render([(0, 4, n, 70, 0) for n in chord(57, 'min') + [69]] + [(1, 3, 76, 80, 1)], {0: 48, 1: 40}, 4.5, 60)
    S['inspire_swell'] = lambda: fs_render([(0, 4, n, 80, 0) for n in chord(48, 'maj') + chord(60, 'add9')] + [(i * 0.25, 0.5, 72 + [0, 4, 7, 12, 16, 19, 24][i % 7], 70, 1) for i in range(12)], {0: 48, 1: 46}, 4.5, 80)
    S['warm_swell'] = lambda: fs_render([(0, 3.5, n, 70, 0) for n in chord(53, 'add9')], {0: 49}, 4, 70)
    S['outro_swell'] = lambda: fs_render([(0, 4, n, 75, 0) for n in chord(48, 'maj') + chord(60, 'maj7')] + [(2, 2, 84, 70, 1)], {0: 48, 1: 9}, 4.5, 70)
    S['gold_shimmer'] = lambda: verb(mix(*[(i * 0.045, st(bell(R.choice([1568, 1760, 2093, 2349, 2637, 3136]), 0.9, decay=0.35) * 0.25, R.uniform(-0.8, 0.8))) for i in range(18)]), 0.7, 0.35)
    S['shimmer'] = lambda: verb(mix(*[(i * 0.06, st(bell(R.choice([2093, 2637, 3136, 3520, 4186]), 0.8, decay=0.3) * 0.2, R.uniform(-0.8, 0.8))) for i in range(12)]), 0.8, 0.4)
    S['sparkle'] = lambda: verb(mix(*[(i * 0.035, st(bell(R.choice([2637, 3136, 3520, 4186, 4699]), 0.5, decay=0.18) * 0.22, R.uniform(-0.6, 0.6))) for i in range(9)]), 0.6, 0.3)
    S['magic_chime'] = lambda: verb(mix(*[(i * 0.07, st(bell(f, 1.2, decay=0.5) * 0.3, -0.6 + i * 0.2)) for i, f in enumerate([1047, 1319, 1568, 2093, 2637, 3136])]), 0.7, 0.35)
    S['sweet_chime'] = lambda: verb(mix(*[(i * 0.12, st(bell(f, 1.2, decay=0.6) * 0.32)) for i, f in enumerate([1568, 2093, 2637])]), 0.6, 0.3)
    S['friend_chime'] = lambda: verb(mix(*[(i * 0.1, st(bell(f, 1.4, decay=0.6) * 0.3, 0.3 * (i - 1))) for i, f in enumerate([1319, 1661, 1976, 2637])]), 0.6, 0.3)
    S['thought_chime'] = lambda: verb(mix(*[(i * 0.09, st(bell(f, 1.0, decay=0.4) * 0.25)) for i, f in enumerate([2637, 2349, 2093])]), 0.7, 0.35)
    S['idea_ding'] = lambda: verb(st(bell(2093, 1.2, decay=0.6) * 0.45 + bell(3136, 1.0, decay=0.4) * 0.2), 0.4, 0.2)
    S['ding_soft'] = lambda: st(bell(1760, 0.8, decay=0.35) * 0.35)
    S['ding_price'] = lambda: mix((0, st(bell(1568, 0.9, decay=0.4) * 0.4)), (0.08, st(bell(2093, 1.0, decay=0.5) * 0.4)))
    S['fancy_ding'] = lambda: verb(mix((0, st(bell(1319, 1.2, decay=0.6) * 0.35)), (0.12, st(bell(1976, 1.2, decay=0.6) * 0.3))), 0.6, 0.3)
    S['clock_ding'] = lambda: verb(st(bell(880, 2.0, decay=1.0) * 0.5), 0.5, 0.25)
    S['register_ding'] = lambda: mix((0, st(modal(2200, 0.9, (1, 1.5, 2.7), (0.4, 0.3, 0.2)) * 0.4)), (0.0, st(click(0.03, 2000, 1.0) * 0.6)), (0.08, st(noise_burst(0.15, 1500, 6000, 0.002, 0.04) * 0.2)))
    S['bell_ding'] = lambda: verb(st(bell(1661, 1.5, decay=0.7) * 0.5), 0.5, 0.2)
    S['school_bell'] = lambda: verb(st((osc(np.full(int(SR * 2.0), 1100), 'square') * 0.3 + osc(np.full(int(SR * 2.0), 2200)) * 0.2) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 30 * T(2.0)))) * env_ad(int(SR * 2.0), 0.01, 1.99, 0.3) * 0.35), 0.7, 0.3)
    S['alarm_beep'] = lambda: mix(*[(i * 0.25, st(osc(np.full(int(SR * 0.12), 2400), 'square') * 0.12 * env_ad(int(SR * 0.12), 0.003, 0.11, 0.2))) for i in range(6) if i % 4 != 3])
    S['tick'] = lambda: st(click(0.012, 2800, 0.4, 0.8) + osc(np.full(int(SR * 0.04), 1800)) * env_exp(int(SR * 0.04), 0.01) * 0.25)
    S['blink'] = lambda: st(bubble(1500, 0.05, 0.6) * 0.25)
    S['pop'] = lambda: st(bubble(500, 0.09, 3.0) * 0.6 + click(0.006, 3000, 0.5, 0.3))
    S['pop_big'] = lambda: verb(st(bubble(300, 0.16, 3.5) * 0.7 + thump(90, 0.2, 0.5, 0.5) + click(0.008, 2500, 0.5, 0.4)), 0.4, 0.15)
    S['mouth_pop'] = lambda: st(bubble(350, 0.07, 2.0) * 0.4)
    S['question_pop'] = lambda: st(bubble(700, 0.08, 1.5) * 0.4 + bubble(1000, 0.08, 1.5) * 0.2)
    S['question_pops'] = lambda: mix(*[(i * 0.12, st(bubble(600 + i * 120, 0.08, 1.5) * 0.4, -0.6 + i * 0.25)) for i in range(6)])
    S['hearts_pop'] = lambda: mix(*[(i * 0.07, st(bubble(800 + i * 90, 0.07, 1.8) * 0.35, R.uniform(-0.6, 0.6))) for i in range(10)])
    S['msg_pop'] = lambda: st(bubble(900, 0.07, 1.4) * 0.5 + bell(1760, 0.25, decay=0.08) * 0.15)
    S['msg_pop_rapid'] = lambda: mix(*[(i * 0.09 + R.uniform(0, 0.03), st(bubble(800 + R.uniform(0, 400), 0.07, 1.4) * 0.4, R.uniform(-0.5, 0.5))) for i in range(30)])
    S['msg_send'] = lambda: mix((0, whoosh(0.25, 800, 4000, 0.6, 0, 0.3) * 0.5), (0.2, st(bubble(1100, 0.08, 1.6) * 0.4)))
    S['notif_ping'] = lambda: mix((0, st(bell(1319, 0.5, decay=0.18) * 0.4)), (0.11, st(bell(1976, 0.6, decay=0.22) * 0.4)))
    S['notif_spam'] = lambda: mix(*[(i * 0.11 + R.uniform(0, 0.05), st(bell(R.choice([1319, 1568, 1760, 1976]), 0.4, decay=0.15) * 0.3, R.uniform(-0.7, 0.7))) for i in range(24)])
    S['reactions_burst'] = lambda: mix(*[(i * 0.035, st(bubble(1000 + R.uniform(-300, 600), 0.05, 1.5) * 0.3, R.uniform(-0.6, 0.6))) for i in range(30)])
    S['phone_slide'] = lambda: whoosh(0.35, 1200, 3500, 0.5, -0.2, 0.2) * 0.35
    S['phone_tap'] = lambda: st(click(0.008, 2200, 0.5, 0.5))
    S['phone_down'] = lambda: st(thump(180, 0.12, 0.3, 0.5) + noise_burst(0.05, 800, 4000, 0.001, 0.01) * 0.3)
    S['phone_buzz'] = lambda: (lambda n: st((osc(np.full(n, 170), 'square') * 0.3 + noise_burst(n / SR, 100, 600) * 0.1) * (np.sin(2 * np.pi * T(n / SR) * 1.25) > -0.2) * 0.5))(int(SR * 1.6))
    S['phone_buzz_rapid'] = lambda: (lambda n: st(lp(osc(np.full(n, 170), 'square'), 900) * 0.35 * (np.sin(2 * np.pi * T(n / SR) * 4) > 0)))(int(SR * 3.0))
    S['camera_shutter'] = lambda: mix((0, st(click(0.01, 3000, 0.8, 1.0) + thump(400, 0.04, 0.2, 0.2))), (0.07, st(click(0.012, 2200, 0.8, 0.8) + noise_burst(0.05, 2000, 8000, 0.001, 0.015) * 0.4)))
    S['glass_crack'] = lambda: mix(*[(i * 0.02 + R.uniform(0, 0.02), st(click(0.008, R.uniform(3000, 8000), 0.4, R.uniform(0.3, 1.0)), R.uniform(-0.5, 0.5))) for i in range(18)]) + 0
    S['charge_beep'] = lambda: mix((0, st(osc(np.full(int(SR * 0.08), 1400)) * 0.2 * env_hann(int(SR * 0.08)))), (0.1, st(osc(np.full(int(SR * 0.1), 1900)) * 0.2 * env_hann(int(SR * 0.1)))))
    S['charge_off'] = lambda: st(osc(np.full(int(SR * 0.15), 700)) * 0.18 * env_hann(int(SR * 0.15)))
    S['console_beep'] = lambda: mix(*[(i * 0.09, st(osc(np.full(int(SR * 0.08), f), 'square') * 0.1 * env_hann(int(SR * 0.08)))) for i, f in enumerate([880, 1320, 1760])])
    S['typing_phone'] = lambda: seq(lambda i, r: st(click(0.007, 2500 + r.uniform(-300, 300), 0.5, 0.35)), np.arange(0, 1.6, 0.12), 0.03)
    S['typing'] = lambda: seq(lambda i, r: st(click(0.01, 1800 + r.uniform(-400, 600), 0.6, 0.7) + thump(260 + r.uniform(-30, 30), 0.03, 0.2, 0.25) + (click(0.02, 900, 0.5, 0.5) if i % 9 == 8 else 0), r.uniform(-0.3, 0.3)), np.cumsum(np.random.default_rng(3).uniform(0.06, 0.16, 60)), 0.0)
    S['pin_drop'] = lambda: mix((0, whoosh(0.45, 2500, 600, 0.7, 0, 0) * 0.4), (0.42, st(thump(120, 0.2, 0.6, 0.6) + click(0.01, 2500, 0.5, 0.4))), (0.45, st(bell(2093, 0.8, decay=0.3) * 0.25)))
    S['coins'] = lambda: mix(*[(i * 0.05 + R.uniform(0, 0.03), st(modal(R.uniform(2800, 4200), 0.35, (1, 2.3, 3.9), (0.12, 0.08, 0.05)) * 0.25, R.uniform(-0.6, 0.6))) for i in range(14)])
    S['coins_small'] = lambda: mix(*[(i * 0.06, st(modal(R.uniform(3000, 4200), 0.3, (1, 2.3, 3.9), (0.1, 0.07, 0.05)) * 0.25)) for i in range(5)])
    S['coin_single'] = lambda: verb(st(modal(3500, 0.8, (1, 2.4, 4.1), (0.35, 0.2, 0.1)) * 0.4), 0.3, 0.15)
    S['keys_jingle'] = lambda: mix(*[(i * 0.04 + R.uniform(0, 0.02), st(modal(R.uniform(3500, 6000), 0.25, (1, 2.7, 5.2), (0.08, 0.05, 0.03)) * 0.25, R.uniform(-0.4, 0.4))) for i in range(16)])
    # --- body / foley
    S['footsteps_shoe'] = lambda: steps(2.4, 2.3, 'shoe', 1) * 0.6
    S['footstep_shoe'] = lambda: st(footstep('shoe', 3)) * 0.7
    S['footsteps_boot'] = lambda: steps(1.6, 2.0, 'boot', 2) * 0.7
    S['footsteps_confident'] = lambda: verb(steps(6.0, 1.9, 'shoe', 5) * 0.7, 0.3, 0.15)
    S['cloth_flap'] = lambda: st(noise_burst(0.25, 400, 3000, 0.02, 0.08) * env_hann(int(SR * 0.25)) * 0.6, R.uniform(-0.3, 0.3))
    S['cloth_rustle'] = lambda: st(bp(N(0.7), 500, 4000) * env_hann(int(SR * 0.7)) * 0.3 * (1 + 0.5 * np.sin(2 * np.pi * 9 * T(0.7))))
    S['cloth_rip'] = lambda: st(hp(N(0.5), 800) * env_ad(int(SR * 0.5), 0.01, 0.48, 1.0) * 0.4 * (np.random.default_rng(2).random(int(SR * 0.5)) > 0.3))
    S['pocket'] = lambda: st(bp(N(0.35), 300, 2500) * env_hann(int(SR * 0.35)) * 0.3)
    S['kiss'] = lambda: st(click(0.015, 1500, 0.8, 0.8) + bubble(1200, 0.04, -0.5) * 0.3)
    S['gulp'] = lambda: st(bubble(180, 0.18, -0.4) * 0.8 + thump(90, 0.15, 0.3, 0.4))
    S['sniffle'] = lambda: mix((0, st(bp(N(0.18), 1500, 5000) * env_hann(int(SR * 0.18)) * 0.35)), (0.3, st(bp(N(0.25), 1200, 4500) * env_hann(int(SR * 0.25)) * 0.4)))
    S['blink_soft'] = S['blink']
    S['clap_single'] = lambda: verb(st(noise_burst(0.06, 800, 4000, 0.0005, 0.012) * 0.9), 0.4, 0.2)
    S['glasses_slide'] = lambda: st(bp(N(0.3), 2000, 7000) * env_hann(int(SR * 0.3)) * 0.15) + st(click(0.01, 3000, 0.5, 0.3)) * 0
    # --- paper
    S['paper_bag'] = lambda: seq(lambda i, r: st(bp(N(0.05 + r.uniform(0, 0.05)), 800, 7000) * env_exp(int(SR * 0.1), 0.02)[: int(SR * (0.05))].sum() * 0 + noise_burst(0.07, 900, 7000, 0.002, 0.02) * r.uniform(0.3, 0.8), r.uniform(-0.3, 0.3)), np.cumsum(np.random.default_rng(4).uniform(0.02, 0.07, 18)), 0.0)
    S['paper_flip'] = lambda: whoosh(0.25, 1500, 5000, 0.4, -0.2, 0.2) * 0.4
    S['page_flip'] = lambda: whoosh(0.3, 1200, 6000, 0.45, -0.3, 0.3) * 0.45
    S['paper_rustle'] = lambda: seq(lambda i, r: st(noise_burst(0.05, 1500, 7000, 0.002, 0.015) * r.uniform(0.2, 0.5)), np.cumsum(np.random.default_rng(5).uniform(0.02, 0.06, 14)))
    S['envelope_slide'] = lambda: st(bp(N(0.5), 1500, 6000) * env_hann(int(SR * 0.5)) * 0.25)
    S['book_open'] = lambda: mix((0, st(thump(150, 0.15, 0.3, 0.4))), (0.05, whoosh(0.35, 1200, 4000, 0.4) * 0.4))
    S['pen_sign'] = lambda: seq(lambda i, r: st(bp(N(0.12 + r.uniform(0, 0.1)), 2500, 8000) * env_hann(int(SR * (0.12))) [: 1] .sum() * 0 + bp(N(0.15), 2500, 8000) * env_hann(int(SR * 0.15)) * 0.25), [0, 0.18, 0.36, 0.5, 0.7, 0.85])
    S['pencil_write'] = lambda: seq(lambda i, r: st(bp(N(0.2), 2000, 7000) * env_hann(int(SR * 0.2)) * 0.15), np.arange(0, 3, 0.28))
    S['gift_rustle'] = lambda: S['paper_rustle']() * 1.0
    # --- kitchen / food
    S['knife_cut'] = lambda: mix((0, st(thump(220, 0.08, 0.4, 0.6) + click(0.01, 2500, 0.5, 0.5))), (0.0, st(noise_burst(0.12, 400, 3000, 0.003, 0.04) * 0.3)))
    S['knife_chop'] = lambda: seq(lambda i, r: st(thump(240, 0.07, 0.3, 0.5) + click(0.008, 2800, 0.5, 0.4)), np.arange(0, 1.8, 0.16), 0.01)
    S['knife_drop'] = lambda: verb(mix((0, st(modal(1800, 1.2, (1, 2.4, 3.9, 5.6), (0.5, 0.3, 0.2, 0.1)) * 0.4)), (0.12, st(modal(1900, 0.8, (1, 2.4, 3.9), (0.3, 0.2, 0.1)) * 0.25))), 0.5, 0.2)
    S['bread_tear'] = lambda: st(bp(N(0.45), 500, 4000) * env_ad(int(SR * 0.45), 0.08, 0.37) * 0.35 * (1 + 0.6 * (np.random.default_rng(3).random(int(SR * 0.45)) > 0.7)))
    S['crunch_bite'] = lambda: mix((0, st(noise_burst(0.12, 600, 6000, 0.001, 0.03) * 0.7)), (0.05, st(noise_burst(0.1, 400, 4000, 0.001, 0.03) * 0.4)))
    S['cereal_crunch'] = lambda: seq(lambda i, r: st(noise_burst(0.08, 500, 6000, 0.001, 0.02) * r.uniform(0.3, 0.6)), np.arange(0, 2.0, 0.22), 0.03)
    S['chewing'] = lambda: seq(lambda i, r: st(lp(noise_burst(0.1, 200, 2000, 0.01, 0.04), 1500) * r.uniform(0.3, 0.5)), np.arange(0, 2.5, 0.26), 0.02)
    S['horse_chew'] = lambda: seq(lambda i, r: st(lp(noise_burst(0.14, 150, 2500, 0.01, 0.05), 1800) * 0.6 + thump(110, 0.08, 0.2, 0.2)), np.arange(0, 2.0, 0.3), 0.02)
    S['giraffe_chew'] = lambda: seq(lambda i, r: st(lp(noise_burst(0.12, 150, 2000, 0.01, 0.05), 1500) * 0.4), np.arange(0, 2.0, 0.35), 0.03)
    S['boiling'] = lambda: seq(lambda i, r: st(bubble(r.uniform(300, 900), 0.05, 1.5) * r.uniform(0.1, 0.3), r.uniform(-0.5, 0.5)), np.cumsum(np.random.default_rng(6).uniform(0.02, 0.09, 40)))
    S['sizzle'] = lambda: st(hp(N(2.0), 3000) * 0.15 * (1 + 0.8 * (np.random.default_rng(1).random(int(SR * 2)) > 0.995).astype(np.float32).cumsum() % 2)) * env_hann(int(SR * 2.0))[:, None]
    S['choc_flow'] = lambda: (lambda n: st(lp(N(3.0), 700) * 0.4 * (1 + 0.3 * np.sin(2 * np.pi * 3 * T(3.0))) * env_hann(n), 0, 0.8) + seq(lambda i, r: st(bubble(r.uniform(150, 400), 0.08, 1.2) * 0.15), np.arange(0, 2.8, 0.17), 0.05))(int(SR * 3.0))
    S['plate_set'] = lambda: st(modal(2600, 0.5, (1, 2.1, 3.6), (0.15, 0.1, 0.06)) * 0.3 + thump(200, 0.06, 0.2, 0.3))
    S['plate_stack'] = lambda: mix(*[(i * 0.35, st(modal(2400 + i * 150, 0.5, (1, 2.1, 3.6), (0.15, 0.1, 0.06)) * 0.3 + thump(200, 0.06, 0.2, 0.3))) for i in range(3)])
    S['slide_plate'] = lambda: st(bp(N(0.5), 800, 4000) * env_hann(int(SR * 0.5)) * 0.2)
    S['dinner_clatter'] = lambda: seq(lambda i, r: st(modal(r.uniform(2500, 5000), 0.25, (1, 2.4, 3.9), (0.08, 0.05, 0.03)) * r.uniform(0.1, 0.25), r.uniform(-0.6, 0.6)), np.cumsum(np.random.default_rng(8).uniform(0.1, 0.5, 14)))
    S['knife_board'] = S['knife_cut']
    # --- water
    S['water_spray'] = lambda: st(hp(N(2.5), 2000) * 0.25 * env_hann(int(SR * 2.5)), 0, 0.8)
    S['water_running'] = lambda: st(bp(N(4.0), 500, 6000) * 0.22 * (1 + 0.2 * np.sin(2 * np.pi * 7 * T(4.0))) * env_hann(int(SR * 4.0)), 0, 0.8)
    S['scrub'] = lambda: seq(lambda i, r: st(bp(N(0.16), 800, 5000) * env_hann(int(SR * 0.16)) * 0.4, -0.2 + 0.4 * (i % 2)), np.arange(0, 2.0, 0.18))
    S['soap_squirt'] = lambda: st(bp(N(0.35), 600, 3500) * env_ad(int(SR * 0.35), 0.02, 0.33) * 0.4 + bubble(400, 0.2, 1.0) * 0.2)
    S['bubbles_grow'] = lambda: seq(lambda i, r: st(bubble(r.uniform(400, 1600), 0.05, 2.0) * r.uniform(0.1, 0.35), r.uniform(-0.8, 0.8)), np.sort(np.random.default_rng(9).uniform(0, 3.0, 90)) ** 1.0)
    S['washer_start'] = lambda: mix((0, S['console_beep']()), (0.4, st(lp(osc(np.linspace(30, 60, int(SR * 1.5)), 'saw'), 300) * 0.25 * env_ad(int(SR * 1.5), 0.5, 1.0, 0.5))))
    S['washer_spin'] = lambda: st(lp(osc(np.linspace(40, 90, int(SR * 4)), 'saw'), 500) * 0.2 * env_hann(int(SR * 4)) + bp(N(4), 300, 1500) * 0.05)
    # --- doors / furniture
    S['door_open'] = lambda: mix((0, st(click(0.02, 1500, 0.5, 0.6) + thump(140, 0.08, 0.3, 0.3))), (0.1, st(creak(0.9, 110, 2) * 0.35)))
    S['door_slam'] = lambda: verb(st(thump(80, 0.5, 0.6, 1.0) + noise_burst(0.15, 200, 3000, 0.001, 0.05) * 0.6), 0.5, 0.25)
    S['door_slide'] = lambda: mix((0, st(bp(N(0.7), 300, 2500) * env_hann(int(SR * 0.7)) * 0.3)), (0.65, st(thump(120, 0.15, 0.3, 0.5) + click(0.01, 2000, 0.5, 0.4))))
    S['mailbox_creak'] = lambda: mix((0, st(creak(0.6, 260, 4) * 0.4)), (0.55, st(modal(900, 0.5, (1, 2.7, 4.4), (0.2, 0.1, 0.06)) * 0.3)))
    S['chair_creak'] = lambda: st(creak(0.6, 140, 5) * 0.3)
    S['chair_scrape'] = lambda: st(bp(osc(np.linspace(220, 160, int(SR * 0.45)), 'saw') * (1 + 0.5 * N(0.45)), 300, 2500) * env_hann(int(SR * 0.45)) * 0.25)
    S['couch_creak'] = lambda: st(creak(1.0, 70, 6) * 0.4 + lp(N(1.0), 400) * 0.1 * env_hann(int(SR * 1.0)))
    S['slide_wood'] = lambda: st(bp(N(0.4), 300, 3000) * env_hann(int(SR * 0.4)) * 0.25)
    S['radiator_clank'] = lambda: verb(mix(*[(i * 0.23 + R.uniform(0, 0.05), st(modal(R.uniform(300, 520), 0.6, (1, 2.6, 4.7, 7.1), (0.3, 0.2, 0.1, 0.06)) * 0.4)) for i in range(5)]), 0.4, 0.2)
    S['window_roll'] = lambda: st(lp(osc(np.full(int(SR * 1.4), 140), 'saw'), 1200) * 0.15 * (1 + 0.2 * N(1.4)) * env_hann(int(SR * 1.4)))
    S['wobble'] = lambda: st(osc(300 + 80 * np.sin(2 * np.pi * 7 * T(0.9))) * env_ad(int(SR * 0.9), 0.02, 0.88, 1.0) * 0.3)
    # --- cartoon
    S['boing'] = lambda: st(osc(np.linspace(180, 420, int(SR * 0.5)) * (1 + 0.1 * np.sin(2 * np.pi * 22 * T(0.5)))) * env_exp(int(SR * 0.5), 0.18) * 0.5)
    S['boing_shock'] = lambda: mix((0, S['boing']()), (0, st(osc(np.linspace(400, 1200, int(SR * 0.25))) * env_exp(int(SR * 0.25), 0.1) * 0.3)))
    S['slide_whistle'] = lambda: st(osc(np.linspace(1800, 350, int(SR * 0.8)) * (1 + 0.02 * np.sin(2 * np.pi * 6 * T(0.8)))) * env_ad(int(SR * 0.8), 0.03, 0.77, 0.6) * 0.35)
    S['record_scratch'] = lambda: (lambda n: st(bp(N(0.45), 300, 4000) * (np.abs(np.sin(2 * np.pi * np.cumsum(np.linspace(9, 2, n)) / SR)) ) * env_ad(n, 0.01, 0.44) * 0.7))(int(SR * 0.45))
    S['buzzer'] = lambda: st(lp(osc(np.full(int(SR * 0.6), 110), 'square') + osc(np.full(int(SR * 0.6), 113), 'square'), 2500) * 0.2 * env_ad(int(SR * 0.6), 0.01, 0.59, 0.2))
    S['stop_whistle'] = lambda: st(osc(2900 + 120 * np.sign(np.sin(2 * np.pi * 28 * T(0.5)))) * env_ad(int(SR * 0.5), 0.01, 0.49, 0.3) * 0.2 + hp(N(0.5), 3000) * 0.05)
    S['airhorn_cute'] = lambda: st(lp(sum(osc(np.full(int(SR * 0.7), f), 'saw') for f in (466, 587, 698)), 3000) * 0.12 * env_ad(int(SR * 0.7), 0.02, 0.68, 0.4))
    S['party_horn'] = lambda: st(lp(osc(np.linspace(300, 520, int(SR * 0.7)) * (1 + 0.01 * N(0.7)), 'saw'), 2500) * 0.25 * env_ad(int(SR * 0.7), 0.03, 0.67, 0.5))
    S['confetti'] = lambda: mix((0, st(thump(150, 0.15, 0.5, 0.5) + click(0.01, 2000, 0.6, 0.6))), *[(0.05 + i * 0.03, st(noise_burst(0.03, 3000, 9000, 0.001, 0.008) * R.uniform(0.1, 0.3), R.uniform(-0.8, 0.8))) for i in range(30)])
    S['cartoon_tweet'] = lambda: mix(*[(i * 0.18, st(osc(np.linspace(3000, 4200, int(SR * 0.09)) + 400 * np.sin(2 * np.pi * 40 * T(0.09))) * env_hann(int(SR * 0.09)) * 0.2, 0.5 * np.sin(i))) for i in range(10)])
    S['dodgeball'] = lambda: mix((0, whoosh(0.3, 400, 1500, 0.8) * 0.4), (0.28, st(thump(140, 0.15, 0.5, 0.7) + bubble(250, 0.1, 1.5) * 0.4)))
    S['sneak_away'] = lambda: fs_render([(i * 0.25, 0.2, n, 90, 0) for i, n in enumerate([67, 66, 65, 64, 63, 62])], {0: 45}, 2.0, 120)
    S['sneaky_pluck'] = lambda: fs_render([(i * 0.25, 0.2, n, 90, 0) for i, n in enumerate([52, 53, 54, 55, 0, 59])] , {0: 45}, 1.8, 120)
    S['curious_pluck'] = lambda: fs_render([(0, 0.4, 72, 90, 0), (0.5, 0.4, 76, 90, 0), (1.0, 1.0, 78, 90, 0)], {0: 8}, 2.2, 100)
    S['awkward_pluck'] = lambda: fs_render([(0, 0.3, 62, 90, 0), (0.6, 0.6, 61, 90, 0)], {0: 45}, 1.6, 100)
    S['tender_pluck'] = lambda: fs_render([(i * 0.3, 1.5, n, 80, 0) for i, n in enumerate([64, 68, 71, 76])], {0: 46}, 2.6, 90)
    S['hopeful_pluck'] = lambda: fs_render([(i * 0.25, 0.8, n, 85, 0) for i, n in enumerate([60, 64, 67, 72, 76])], {0: 46}, 2.4, 100)
    S['music_soft_turn'] = lambda: fs_render([(i * 0.07, 1.2, n, 70, 0) for i, n in enumerate([72, 74, 76, 79, 81, 84])], {0: 8}, 1.8, 90)
    S['sad_note'] = lambda: fs_render([(0, 2.5, 45, 70, 0), (0, 2.5, 57, 60, 0), (0, 2.5, 60, 55, 0)], {0: 0}, 3.0, 60)
    S['music_drop'] = lambda: st(osc(np.geomspace(220, 30, int(SR * 0.7)), 'saw') * env_ad(int(SR * 0.7), 0.01, 0.69, 1) * 0.1 + lp(N(0.7), 400) * 0.05)
    S['dun_dun_soft'] = S['dun_dun']
    # --- animals
    S['horse_snort'] = lambda: st(bp(N(0.5), 200, 1800) * env_ad(int(SR * 0.5), 0.02, 0.48, 1.4) * (1 + 0.8 * (np.sin(2 * np.pi * 38 * T(0.5)) > 0.4)) * 0.6)
    S['horse_neigh'] = lambda: (lambda n: verb(st(bp((osc((520 + 260 * np.sin(np.linspace(0, np.pi, n)) * np.linspace(1.2, 0.5, n)) * (1 + 0.05 * np.sin(2 * np.pi * 14 * T(n / SR))), 'saw') * 0.5 + bp(N(n / SR), 800, 3000) * 0.2) * env_ad(n, 0.05, n / SR - 0.05, 1.2), 400, 3500) * 0.7), 0.4, 0.2))(int(SR * 1.3))
    S['hoof_step'] = lambda: mix((0, st(modal(900, 0.15, (1, 2.6), (0.04, 0.02)) * 0.5 + thump(160, 0.08, 0.3, 0.4))), (0.12, st(modal(820, 0.15, (1, 2.6), (0.04, 0.02)) * 0.4 + thump(150, 0.08, 0.3, 0.3))))
    S['horse_walk'] = lambda: seq(lambda i, r: st(modal(r.uniform(750, 950), 0.15, (1, 2.6), (0.04, 0.02)) * 0.4 + thump(150, 0.08, 0.3, 0.3)), np.arange(0, 4, 0.33), 0.03)
    S['goose_honk'] = lambda: mix(*[(i * 0.32, st(bp(osc(np.linspace(380, 330, int(SR * 0.25)) * (1 + 0.04 * np.sin(2 * np.pi * 30 * T(0.25))), 'saw'), 500, 2800) * env_ad(int(SR * 0.25), 0.02, 0.23, 0.6) * 0.6)) for i in range(3)])
    S['seagull'] = lambda: mix(*[(i * 0.45, st(bp(osc(np.linspace(1800, 1100, int(SR * 0.35)), 'saw'), 900, 4000) * env_ad(int(SR * 0.35), 0.03, 0.32) * 0.2, 0.4)) for i in range(3)])
    # --- vehicles
    S['heli_land'] = lambda: (lambda n: st(lp(N(n / SR), 900) * (0.55 + 0.45 * np.sin(2 * np.pi * 7.5 * T(n / SR))) ** 3 * np.linspace(0.3, 1.0, n) ** 1.5 * 0.9 + lp(osc(np.full(n, 42), 'saw'), 200) * 0.35 * np.linspace(0.3, 1, n) + bp(N(n / SR), 1500, 4000) * 0.06 * np.linspace(0.2, 1, n), np.linspace(-0.4, 0.1, n), 0.6) * env_ad(n, 0.4, n / SR - 0.4, 0.15))(int(SR * 5.2))
    S['heli_idle'] = lambda: (lambda n: st(lp(N(n / SR), 800) * (0.6 + 0.4 * np.sin(2 * np.pi * 6.0 * T(n / SR))) ** 3 * 0.6 + lp(osc(np.full(n, 38), 'saw'), 160) * 0.2, 0, 0.6) * env_hann(n)[:, None])(int(SR * 5.0))
    S['bus_arrive'] = lambda: (lambda n: mix((0, st(engine(n / SR, 1400, 700, 6, 0.4, 600, 1) * 0.45 * np.linspace(0.3, 1, n) * env_ad(n, 0.3, n / SR - 0.3, 0.3), np.linspace(-0.8, 0.1, n), 0.5)), (1.4, st(bp(osc(np.linspace(2600, 2300, int(SR * 0.5)), 'saw'), 2000, 4000) * env_hann(int(SR * 0.5)) * 0.05)), (1.75, st(hp(N(0.6), 2500) * env_ad(int(SR * 0.6), 0.005, 0.59, 1.5) * 0.35))))(int(SR * 2.2))
    S['bus_door'] = lambda: mix((0, st(hp(N(0.5), 2000) * env_ad(int(SR * 0.5), 0.005, 0.49, 1.2) * 0.35)), (0.45, st(thump(130, 0.15, 0.3, 0.5) + click(0.01, 1800, 0.5, 0.3))))
    S['bus_leave'] = lambda: (lambda n: st(engine(n / SR, 700, 1600, 6, 0.4, 700, 2) * 0.45 * env_ad(n, 0.2, n / SR - 0.2, 1.4), np.linspace(0.1, 0.9, n), 0.5))(int(SR * 3.2))
    S['bus_idle'] = lambda: (lambda n: st(engine(n / SR, 650, 650, 6, 0.5, 500, 3) * 0.3 * env_hann(n), 0.2, 0.5))(int(SR * 5.0))
    S['bus_interior'] = lambda: (lambda n: st(engine(n / SR, 900, 1000, 6, 0.4, 400, 4) * 0.3 + lp(N(n / SR), 250) * 0.25 + seq(lambda i, r: modal(r.uniform(1500, 3000), 0.1, (1, 2.4), (0.03, 0.02)) * 0.05, np.arange(0, n / SR, 0.37))[: n, 0], 0, 0.6) * env_hann(n)[:, None])(int(SR * 5.0))
    S['car_pass'] = lambda: (lambda n: st((engine(n / SR, 1800, 1500, 6, 0.3, 1200, 5) * 0.4 + bp(N(n / SR), 300, 3000) * 0.25) * np.exp(-((T(n / SR) - n / SR / 2) / 0.45) ** 2), np.linspace(-0.9, 0.9, n), 0.5))(int(SR * 2.2))
    S['supercar_pass'] = lambda: (lambda n: verb(st((engine(n / SR, 5200, 4000, 8, 0.2, 3500, 6) * 0.5 + bp(N(n / SR), 400, 4000) * 0.3) * np.exp(-((T(n / SR) - n / SR / 2) / 0.3) ** 2), np.linspace(-1, 1, n), 0.6), 0.3, 0.12))(int(SR * 1.8))
    S['car_slow'] = lambda: (lambda n: st(engine(n / SR, 1800, 800, 8, 0.2, 1500, 7) * 0.4 * env_ad(n, 0.4, n / SR - 0.4, 0.6) + bp(N(n / SR), 300, 2000) * 0.1 * env_hann(n), np.linspace(-0.8, 0, n), 0.4))(int(SR * 2.2))
    S['car_idle'] = lambda: (lambda n: st(engine(n / SR, 800, 800, 8, 0.2, 600, 8) * 0.25 * env_hann(n)))(int(SR * 4.0))
    S['limo_leave'] = lambda: (lambda n: st(engine(n / SR, 900, 1700, 8, 0.2, 900, 9) * 0.3 * env_ad(n, 0.3, n / SR - 0.3, 1.2), np.linspace(0, 0.9, n), 0.4))(int(SR * 3.0))
    S['lawnmower'] = lambda: (lambda n: st(bp(osc(np.full(n, 52) * (1 + 0.02 * np.sin(2 * np.pi * 0.7 * T(n / SR))), 'square'), 200, 3000) * 0.18 * (1 + 0.3 * N(n / SR) * 0.3) * env_hann(n), np.sin(np.linspace(0, 3, n)) * 0.4, 0.4))(int(SR * 8.0))
    S['jet_flyby'] = lambda: (lambda n: st(bp(N(n / SR), 200, 5000) * np.exp(-((T(n / SR) - n / SR * 0.55) / 1.0) ** 2) * 0.6 + lp(N(n / SR), 300) * 0.3 * env_hann(n), np.linspace(-0.9, 0.9, n), 0.6))(int(SR * 4.5))
    S['plane_flyby'] = lambda: S['jet_flyby']() * 0.6
    S['rocket_rumble'] = lambda: (lambda n: st(lp(N(n / SR), 180) * 0.7 * env_hann(n) + bp(N(n / SR), 300, 1200) * 0.1 * env_hann(n), 0, 0.8))(int(SR * 4.0))
    S['yacht_horn'] = lambda: verb(st(lp(osc(np.full(int(SR * 1.6), 98), 'saw') + osc(np.full(int(SR * 1.6), 147), 'saw') * 0.6, 800) * 0.2 * env_ad(int(SR * 1.6), 0.05, 1.55, 0.3)), 0.9, 0.35, tail=2.0)
    S['ferris_creak'] = lambda: st(creak(2.5, 70, 9) * 0.25)
    S['glass_tink'] = S['ding_soft']
    # --- ambiences (long, looping beds)
    def bed(d, f1, f2, amp, wob=0.1, seed=11):
        n = int(d * SR); return st(bp(N(d, seed), f1, f2) * amp * (1 + wob * np.sin(2 * np.pi * 0.13 * T(d))), 0, 0.9)
    def birds(d, dens=1.2, seed=12):
        r = np.random.default_rng(seed); times = np.sort(r.uniform(0, d - 0.5, int(d * dens))); parts = []
        for t0 in times:
            k = r.integers(3); f = r.uniform(2500, 5200); ln = r.uniform(0.05, 0.14); nn = int(ln * SR)
            fr = f * (1 + (0.3 if k == 0 else -0.25) * np.linspace(0, 1, nn)) + 300 * np.sin(2 * np.pi * r.uniform(20, 60) * T(ln))
            for rep in range(r.integers(1, 4)): parts.append((t0 + rep * ln * 1.3, st(osc(fr) * env_hann(nn) * r.uniform(0.04, 0.12), r.uniform(-0.8, 0.8))))
        return mix((0, np.zeros((int(d * SR), 2), np.float32)), *parts)[: int(d * SR)]
    S['amb_birds'] = lambda: birds(20) + bed(20, 200, 1200, 0.03)
    S['amb_morning'] = lambda: birds(20, 0.8, 13) * 0.6 + bed(20, 60, 400, 0.05, 0.2, 14)
    S['amb_countryside'] = lambda: birds(20, 1.0, 15) + bed(20, 150, 1500, 0.06, 0.3, 16)
    S['amb_autumn'] = lambda: birds(20, 0.5, 17) * 0.6 + bed(20, 300, 3000, 0.05, 0.4, 18)
    S['leaves_rustle'] = lambda: st(bp(N(6), 1500, 7000) * 0.06 * (1 + 0.7 * np.sin(2 * np.pi * 0.4 * T(6)) ** 2), 0, 0.9)
    S['amb_city'] = lambda: bed(20, 60, 900, 0.12, 0.3, 19) + mix(*[(t0, S['car_pass']() * 0.25) for t0 in (2, 9, 15)])[: int(20 * SR)]
    S['amb_ocean'] = lambda: (lambda d: st(bp(N(d, 20), 200, 4000) * 0.2 * (0.4 + 0.6 * np.sin(2 * np.pi * 0.12 * T(d)) ** 2), 0, 0.9))(20)
    S['amb_classroom'] = lambda: bed(20, 100, 600, 0.03, 0.1, 21)
    S['room_tone'] = lambda: bed(12, 80, 500, 0.025, 0.05, 22)
    S['room_silence'] = lambda: bed(4, 80, 400, 0.01, 0.0, 23)
    S['amb_apartment'] = lambda: bed(20, 50, 200, 0.05, 0.1, 24) + st(osc(np.full(int(SR * 20), 60)) * 0.006)
    S['big_room_echo'] = lambda: verb(bed(8, 80, 400, 0.03, 0.1, 25), 0.95, 0.5)
    S['crickets'] = lambda: (lambda d: mix(*[(i * 0.37 + R.uniform(0, 0.2), st(osc(np.full(int(SR * 0.18), R.uniform(4200, 4700))) * (np.sin(2 * np.pi * 30 * T(0.18)) > 0) * env_hann(int(SR * 0.18)) * 0.05, R.uniform(-0.8, 0.8))) for i in range(int(d / 0.37))]) + bed(d, 100, 600, 0.02))(16)
    S['rain_window'] = lambda: (lambda d: st(bp(N(d, 26), 800, 8000) * 0.12, 0, 0.9) + seq(lambda i, r: st(click(0.006, r.uniform(2000, 6000), 0.5, r.uniform(0.05, 0.2)), r.uniform(-0.8, 0.8)), np.sort(R.uniform(0, d, int(d * 12))))[: int(d * SR)])(14)
    S['space_drone'] = lambda: (lambda d: st(sum(osc(np.full(int(SR * d), f) * (1 + 0.003 * np.sin(2 * np.pi * 0.1 * T(d) * (i + 1)))) * 0.06 for i, f in enumerate([55, 82.4, 110, 164.8])) * env_hann(int(SR * d)), 0, 0.8))(8)
    S['tension_drone'] = lambda: (lambda d: st((osc(np.full(int(SR * d), 41.2), 'saw') * 0.2 + osc(np.full(int(SR * d), 43.6), 'saw') * 0.15) * np.linspace(0.3, 1, int(SR * d)), 0, 0.6))(10)
    S['tension_drone'] = (lambda f: (lambda: st(lp(f()[:, 0], 300) * 0.8)))(S['tension_drone'])
    # --- voice-based
    S['cafeteria_walla'] = lambda: walla(24, 2.2, 31, room=0.75, lpf=4500) * 0.8 + S['dinner_clatter']()[: int(24 * SR)].sum() * 0 + clatter_bed(24)
    S['hallway_walla'] = lambda: walla(16, 1.3, 32, room=0.85, lpf=4000) * 0.7
    S['party_walla'] = lambda: walla(20, 2.8, 33, room=0.5, lpf=5000)
    S['crowd_murmur'] = lambda: walla(10, 1.5, 34, room=0.7, lpf=2500) * 0.7
    S['crowd_gasp'] = lambda: crowd(['gasp_0_*', 'gasp_1_*', 'gasp_3_*'], 12, 0.12, 41, 0.5)
    S['gasp_single'] = lambda: crowd(['gasp_1_af_*', 'gasp_0_af_*'], 1, 0.0, 42, 0.3)
    S['crowd_laugh'] = lambda: crowd(['laugh_*'], 22, 0.6, 43, 0.6)
    S['kids_laugh'] = lambda: crowd(['laugh_*'], 7, 0.35, 44, 0.5)
    S['kids_laugh_two'] = lambda: crowd(['laugh_0_am_puck*', 'laugh_2_af_bella*', 'laugh_5_am_liam*'], 2, 0.15, 45, 0.4)
    S['friends_laugh'] = lambda: crowd(['laugh_*'], 5, 0.3, 46, 0.5)
    S['fake_laugh'] = lambda: crowd(['fake_laugh*'], 1, 0, 47, 0.3)
    S['kids_snicker'] = lambda: crowd(['snicker_*'], 4, 0.3, 48, 0.4)
    S['snicker'] = lambda: crowd(['snicker_0_*'], 1, 0, 49, 0.3)
    S['laugh_fade'] = lambda: (lambda x: x * np.linspace(1, 0, len(x))[:, None])(crowd(['laugh_*', 'dad_laugh*'], 4, 0.2, 50, 0.4))
    S['kid_cheer'] = lambda: crowd(['cheer_*', 'kid_cheer_bro*'], 3, 0.15, 51, 0.4)
    S['kid_giggle'] = lambda: crowd(['giggle_bro*'], 1, 0, 52, 0.3)
    S['kid_chatter'] = lambda: crowd(['chatter_bro*'], 1, 0, 53, 0.3)
    S['mom_laugh'] = lambda: crowd(['mom_laugh*'], 1, 0, 54, 0.35)
    S['family_laugh'] = lambda: mix((0, crowd(['mom_laugh*'], 1, 0, 55, 0.3)), (0.1, crowd(['dad_laugh.wav'], 1, 0, 56, 0.3)), (0.2, crowd(['laugh_0_am_puck*', 'laugh_3_af_bella*'], 2, 0.2, 57, 0.3)))
    S['yawn'] = lambda: crowd(['yawn*'], 1, 0, 58, 0.3)
    S['sigh_relief'] = lambda: crowd(['sigh*'], 1, 0, 59, 0.3)
    S['whisper'] = lambda: (lambda a: verb(st(whisperize(a) * 3.0), 0.3, 0.2))(vload(POOL / 'whisper_src.wav'))
    S['nature_doc'] = lambda: (lambda a: st(lp(hp(a, 120), 6000) * 0.8))(vload(POOL / 'nature_doc.wav'))
    S['video_msg'] = lambda: mix((0, st(phone_voice(vload(POOL / 'video_msg_dad.wav')) * 1.4)), (1.4, st(phone_voice(vload(POOL / 'video_msg_mom.wav')) * 1.2)))
    # --- diegetic music
    S['band_live'] = lambda: verb(band_loop(8, 118, 0.9), 0.4, 0.2)
    S['party_music_far'] = lambda: (lambda x: st(lp(x[:, 0] + x[:, 1], 900) * 0.4))(band_loop(16, 118, 0.7))
    S['carnival_music'] = lambda: (lambda x: verb(x, 0.6, 0.3))(fs_render([(i * 0.5, 0.45, [72, 76, 79, 76, 74, 77, 81, 77][i % 8], 80, 0) for i in range(32)] + [(i * 1.0, 0.4, [48, 55][i % 2], 80, 1) for i in range(16)] + [(i * 1.0 + 0.5, 0.4, n, 60, 1) for i in range(16) for n in (64, 67)], {0: 20, 1: 20}, 8, 120, 0.8))
    S['build_drums'] = lambda: fs_render([(b * 0.5, 0.3, 45 if b % 4 < 2 else 47, 60 + b * 2, 9) for b in range(16)] + [(b * 0.25 + 4, 0.2, 38, 70 + b * 2, 9) for b in range(16)] + [(8, 0.5, 49, 120, 9), (8, 0.5, 36, 127, 9)], {}, 4.6, 120)
    S['heartbeat'] = lambda: seq(lambda i, r: st(thump(52, 0.22, 0.6, 1.0) + (np.concatenate([np.zeros(int(SR * 0.17)), np.asarray(thump(48, 0.25, 0.6, 0.8))]))), np.arange(0, 4.0, 0.85))
    S['heartbeat_fast'] = lambda: seq(lambda i, r: st(thump(55, 0.18, 0.6, 1.0) + (np.concatenate([np.zeros(int(SR * 0.13)), np.asarray(thump(50, 0.2, 0.6, 0.8))]))), np.arange(0, 4.0, 0.5))
    S['clock_tick'] = lambda: seq(lambda i, r: st(click(0.01, 3500 if i % 2 else 2600, 0.4, 0.5) + modal(2600 if i % 2 else 2000, 0.05, (1, 2.3), (0.01, 0.008)) * 0.3), np.arange(0, 6, 0.5))
    S['burp_cartoon'] = lambda: st(bp(osc(np.linspace(110, 80, int(SR * 0.5)) * (1 + 0.08 * np.asarray(N(0.5))), 'saw'), 150, 1500) * env_ad(int(SR * 0.5), 0.02, 0.48, 0.8) * 0.6)
    S['nostalgic_piano'] = lambda: np.zeros((SR // 10, 2), np.float32)  # handled by the score
    for k in ['warm_pad', 'warm_theme', 'soft_piano', 'tender_piano', 'sad_piano', 'joy_theme', 'outro_theme', 'new_day_pad', 'reflective_pad']:
        S[k] = lambda: np.zeros((SR // 10, 2), np.float32)
    return S

def walla(d, density, seed, room=0.7, lpf=4500):
    r = np.random.default_rng(seed); files = vp('walla_*'); n = int(d * SR); out = np.zeros((n + SR * 4, 2), np.float32)
    t = 0.0
    while t < d:
        a = vload(files[r.integers(len(files))]) * r.uniform(0.25, 0.7)
        o = int(t * SR); a = st(a, r.uniform(-0.9, 0.9)); m = min(len(a), len(out) - o); out[o:o + m] += a[:m]
        t += r.exponential(1.0 / density)
    out = lp(out, lpf); out = verb(out, room, 0.35, 0.5, tail=0.5)
    out = out[:n]; xf = int(1.0 * SR)  # loopable crossfade
    out[:xf] = out[:xf] * np.linspace(0, 1, xf)[:, None] + out[-xf:] * np.linspace(1, 0, xf)[:, None]
    return sg(out[: n - xf])
def clatter_bed(d):
    r = np.random.default_rng(77); n = int(d * SR) - SR; parts = []
    for t0 in np.sort(r.uniform(0, d - 2, int(d * 1.5))): parts.append((t0, st(modal(r.uniform(2500, 5500), 0.25, (1, 2.4, 3.9), (0.08, 0.05, 0.03)) * r.uniform(0.02, 0.06), r.uniform(-0.8, 0.8))))
    x = mix((0, np.zeros((n, 2), np.float32)), *parts)[:n]; return verb(x, 0.7, 0.3, tail=0)[:n]
def band_loop(bars, tempo, gain):
    notes = []; prog = [(55, 'maj'), (60, 'maj'), (62, 'maj'), (60, 'maj')]
    for b in range(bars):
        root, kind = prog[b % 4]; s = b * 4
        for beat in range(4):
            notes.append((s + beat, 0.2, 36 if beat % 2 == 0 else 38, 100, 9)); notes.append((s + beat + 0.5, 0.2, 42, 70, 9))
            notes.append((s + beat, 0.45, root - 24 + (7 if beat % 2 else 0), 95, 1))
            for n in chord(root, kind): notes.append((s + beat + 0.5, 0.3, n, 70, 2))
        mel = [0, 4, 7, 9, 7, 4, 2, 4]
        for i, m in enumerate(mel): notes.append((s + i * 0.5, 0.45, root + 12 + m, 85, 3))
    return fs_render(notes, {1: 33, 2: 27, 3: 56}, bars * 4 * 60 / tempo, tempo, gain)

if __name__ == '__main__':
    S = rec()
    want = sys.argv[1:] or sorted(S.keys())
    cues = json.loads((ROOT / 'data' / 'cues.json').read_text())
    ids = sorted({c['id'] for c in cues})
    missing = [i for i in ids if i not in S]
    if missing: print('MISSING recipes:', missing)
    for k in want:
        if k not in S: continue
        p = OUT / f'{k}.wav'
        if p.exists() and len(sys.argv) == 1: continue
        try:
            a = S[k](); a = st(a) if a.ndim == 1 else a
            a = trim_tail(fade(a.astype(np.float32), 0.002, 0.03)); a = np.nan_to_num(a)
            m = np.abs(a).max()
            if m > 0.98: a = a / m * 0.98
            sf.write(p, a, SR, subtype='PCM_24'); print('ok', k, f'{len(a) / SR:.2f}s peak {m:.2f}', flush=True)
        except Exception as e:
            import traceback; print('FAIL', k, repr(e)); traceback.print_exc(limit=1)

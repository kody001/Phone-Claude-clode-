"""Build the full soundtrack: narration (+ character voices), ambience, music, SFX, ducking, master.

usage: python3 audio/mix.py   (expects build/cues.json from render/validate.js --cues=build/cues.json)
writes build/mix.wav (48 kHz float) and build/stems/*.wav
"""
import json, re, subprocess, tempfile, os, sys, time
import numpy as np
import soundfile as sf
sys.path.insert(0, os.path.dirname(__file__))
from dsp import *
import sfx as SFXLIB
import music

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B = os.path.join(ROOT, 'build')
os.makedirs(os.path.join(B, 'stems'), exist_ok=True)

tl = json.load(open(os.path.join(ROOT, 'data', 'timeline.json')))
WORDS = json.loads(re.search(r'WORDS=(\[.*?\]);', open(os.path.join(ROOT, 'data', 'words.js')).read()).group(1))
CUES = json.load(open(os.path.join(B, 'cues.json')))
TOTAL = tl['total']
NT = N(TOTAL)


def v2t(v):
    return tl['preRoll'] + v + sum(i['dur'] for i in tl['inserts'] if i['vo'] <= v)


def load_vo():
    raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', os.path.join(ROOT, 'input', 'vo.mp3'), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'])
    return np.frombuffer(raw, np.float32).astype(np.float64)


# ---------------- phrase lookup (VO time) ----------------
def norm_txt(s):
    return re.sub(r"[^a-z0-9]+", ' ', re.sub(r"['’\"“”]", '', s.lower())).strip()


TOK, TOKW = [], []
for i, w in enumerate(WORDS):
    for t in norm_txt(w[0]).split():
        TOK.append(t); TOKW.append(i)


def phrase_span(start_phrase, end_phrase, after_word=0):
    def find(p, frm):
        p = norm_txt(p).split()
        for i in range(len(TOK) - len(p) + 1):
            if TOKW[i] < frm:
                continue
            if TOK[i:i + len(p) - 1] == p[:-1] and TOK[i + len(p) - 1].startswith(p[-1]):
                return TOKW[i], TOKW[i + len(p) - 1]
        raise SystemExit('phrase not found: ' + ' '.join(p))
    a = find(start_phrase, after_word)
    b = find(end_phrase, a[0])
    return WORDS[a[0]][5], WORDS[b[1]][6], b[1]


# ---------------- character voices ----------------
def rb(x, semis, formant=False):
    with tempfile.TemporaryDirectory() as d:
        a, b = os.path.join(d, 'a.wav'), os.path.join(d, 'b.wav')
        sf.write(a, x.astype(np.float32), SR)
        cmd = ['rubberband', '-3', '-q', '-p', str(semis)] + (['-F'] if formant else []) + [a, b]
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        y, _ = sf.read(b)
    y = y if y.ndim == 1 else y.mean(axis=1)
    if len(y) < len(x):
        y = np.concatenate([y, np.zeros(len(x) - len(y))])
    return y[:len(x)]


def delayed(x, d):
    k = N(d)
    return np.concatenate([np.zeros(k), x[:-k]])


def voice_fx(kind, x):
    """returns (dry replacement same length as x, extra stereo tail/wet to add)"""
    if kind == 'you_high':
        y = rb(x, 3.0, False)
        y = peak(hp(y, 160), 3000, 1.2, 3)
        return y * 0.95, None
    if kind == 'pass_low':
        y = rb(x, -4.0, False)
        y = np.tanh(1.4 * peak(y, 140, 1.0, 4)) / 1.1
        return y, reverb(y * 0.25, 0.5, 1.0, 4000)
    if kind == 'phone':
        y = rb(x, -2.0, True)
        y = bp(y, 380, 3200, 4)
        y = np.tanh(3.0 * y / (np.abs(y).max() + 1e-9)) * 0.5
        y = lp(y, 2800)
        y += 0.004 * np.random.default_rng(5).standard_normal(len(y)) * (np.abs(y) > 0.01)
        return y * 0.9, None
    if kind == 'god':
        y = rb(x, -5.0, False)
        y2 = rb(x, -12.0, True)
        z = y + 0.35 * y2
        z = z / (np.abs(z).max() + 1e-9) * np.abs(x).max()
        wet = reverb(z * 0.55, 3.2, 1.0, 5000, seed=9)
        return z * 0.85, wet
    if kind in ('cato', 'cato_yell'):
        y = rb(x, -3.0, False)
        y = np.tanh(1.6 * peak(y, 2400, 1.5, 3)) / 1.2
        y = y / (np.abs(y).max() + 1e-9) * np.abs(x).max()
        return y, reverb(y * (0.5 if kind == 'cato_yell' else 0.25), 1.6 if kind == 'cato_yell' else 0.6, 1.0, 4500)
    if kind == 'chant':
        y = rb(x, -3.0, False)
        d1 = delayed(rb(x, -3.2, False), 0.025)
        d2 = delayed(rb(x, -2.8, False), 0.041)
        lo = rb(x, -15.0, True)
        z = y + 0.6 * d1 + 0.6 * d2 + 0.3 * lo
        z = z / (np.abs(z).max() + 1e-9) * np.abs(x).max()
        return z * 0.8, reverb(z * 0.6, 2.8, 1.0, 4000, seed=11)
    if kind == 'chorus':
        d1 = delayed(rb(x, 0.15, True), 0.019)
        d2 = delayed(rb(x, -0.15, True), 0.031)
        lo = delayed(rb(x, -12.0, True), 0.012)
        z = x + 0.55 * d1 + 0.55 * d2 + 0.3 * lo
        z = z / (np.abs(z).max() + 1e-9) * np.abs(x).max()
        return z, reverb(z * 0.3, 1.2, 1.0, 6000)
    return x, None


VOICES = [
    ('you_high', 'Hi, sorry', 'three days', 0),
    ('pass_low', 'Oh, my wife', 'being cursed', 0),
    ('phone', 'Good news', 'Grandpa', 0),
    ('cato_yell', 'Carthage must be', 'destroyed', 'some version of'),
    ('cato', 'I forbid you', 'I forbid you', 0),
    ('cato', 'to have anything', 'with doctors', 'he told his son'),
    ('god', "sure, I'll heal", 'a fee', 0),
    ('god', 'You have to dedicate', 'ignorance', 0),
    ('chant', 'motas', 'dissunapiter', 0),
    ('chorus', 'Got a wound', 'Cabbage, cabbage, cabbage', 0),
]


def build_vo(vo):
    """returns narration track in video time (mono) + stereo wet track for voice FX tails"""
    vo = vo.copy()
    wet_vo = np.zeros((len(vo) + N(5), 2))
    for kind, a, b, after in VOICES:
        aw = 0
        if after:
            aw = phrase_span(after, after)[2]
        s, e, _ = phrase_span(a, b, aw)
        s0, e0 = N(s - 0.06), N(e + 0.12)
        seg = vo[s0:e0]
        dry, wet = voice_fx(kind, seg)
        f = N(0.015)
        w = np.ones(len(seg)); w[:f] = np.linspace(0, 1, f); w[-f:] = np.linspace(1, 0, f)
        vo[s0:e0] = seg * (1 - w) + dry * w
        if wet is not None:
            mix_into(wet_vo, wet, s0)
        print(f'  voice {kind:9s} {s:7.2f}-{e:7.2f}  "{a}" .. "{b}"')
    # place into video timeline with inserts
    out = np.zeros(NT)
    wet_out = np.zeros((NT, 2))
    cuts = [0.0] + [i['vo'] for i in tl['inserts']] + [len(vo) / SR]
    for k in range(len(cuts) - 1):
        a, b = cuts[k], cuts[k + 1]
        seg = vo[N(a):N(b)].copy()
        seg = fade(seg, 0.01, 0.01)
        mix_into(out[:, None], seg[:, None], N(v2t(a + 1e-6) - (1e-6)))
        wseg = wet_vo[N(a):N(b) + N(3)]
        mix_into(wet_out, wseg, N(v2t(a + 1e-6)))
    return out, wet_out


# ---------------- ambience ----------------
def amb_render(kind, d, rng):
    S = SFXLIB.S
    n = N(d)
    out = np.zeros((n, 2))

    def scatter(fn, rate, g, jitter=True):
        t = rng.uniform(0, 1.0 / rate)
        while t < d:
            x = fn(rng)
            mix_into(out, x * g * rng.uniform(0.6, 1.0), N(t))
            t += rng.exponential(1.0 / rate) + 0.3
    room = lambda c=600: st(lp(pink(d, rng), c) * 0.25, 0, 0.8)
    if kind == 'wind':
        x = tv_bandpass(noise(d, rng), lambda u: 320 + 140 * np.sin(u * 9) + 80 * np.sin(u * 23), 0.9)
        out += st(norm(x) * 0.6, 0, 0.8)
    elif kind == 'fire':
        out += st(norm(lp(noise(d, rng), 250)) * 0.25, 0, 0.6)
        for _ in range(int(d * 18)):
            p = N(rng.uniform(0, d - 0.02)); c = bp(noise(0.006, rng), 1500, 7000) * rng.uniform(0.1, 0.8)
            mix_into(out, st(c, rng.uniform(-0.5, 0.5)), p)
    elif kind in ('clinic',):
        out += room(800)
        out += st(sum(np.sin(2 * np.pi * f * tt(d)) * g for f, g in ((60, 0.02), (120, 0.012), (180, 0.006))), 0)
    elif kind in ('palace', 'throne', 'surgery', 'tomb', 'study'):
        out += room(500)
        for _ in range(int(d * 8)):
            p = N(rng.uniform(0, d - 0.02)); c = bp(noise(0.005, rng), 1500, 6000) * rng.uniform(0.05, 0.3)
            mix_into(out, st(c, rng.uniform(-0.6, 0.6)), p)
        if kind == 'tomb':
            scatter(lambda r: st(SFXLIB.bubble(r, r.uniform(900, 1500), 0.05) * 0.4, r.uniform(-0.5, 0.5)), 0.3, 0.5)
        out = reverb(out, 1.4, 0.3)[:n]
    elif kind == 'nile':
        x = bp(noise(d, rng), 200, 1500) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.3 * tt(d)) ** 2)
        out += st(norm(x) * 0.4, 0, 0.8)
        mix_into(out, S['birds'](rng, d) * 0.6, 0)
    elif kind in ('market', 'senate', 'feast', 'city_old'):
        x = SFXLIB.babble(rng, d, layers=14 if kind != 'city_old' else 8)
        out += st(x * 0.5, 0, 0.9)
        if kind in ('market', 'feast'):
            scatter(lambda r: S['chisel'](r) * 0.15 if kind == 'market' else S['coins'](r) * 0.1, 0.5, 0.6)
        if kind == 'city_old':
            mix_into(out, S['birds'](rng, d) * 0.4, 0)
        if kind == 'senate':
            out = reverb(out, 1.6, 0.3)[:n]
    elif kind == 'spooky':
        x = tv_bandpass(noise(d, rng), lambda u: 400 + 300 * np.sin(u * 7), 0.4)
        out += st(norm(x) * 0.4, 0, 0.8)
        out += st(sine(55, d) * 0.08 + sine(58.3, d) * 0.06, 0)
    elif kind in ('birds', 'farm'):
        out += st(norm(lp(noise(d, rng), 400)) * 0.15, 0, 0.8)
        mix_into(out, S['birds'](rng, d), 0)
    elif kind == 'night':
        mix_into(out, S['crickets'](rng, d) * 1.4, 0)
        out += st(norm(lp(noise(d, rng), 300)) * 0.12, 0, 0.8)
    elif kind == 'city':
        out += st(norm(lp(noise(d, rng), 500)) * 0.4, 0, 0.8)
    elif kind == 'plague':
        x = tv_bandpass(noise(d, rng), lambda u: 250 + 200 * np.sin(u * 5), 0.8)
        out += st(norm(x) * 0.5, 0, 0.8)
        scatter(lambda r: S['cough'](r) * 0.3, 0.35, 0.6)
    elif kind == 'river':
        mix_into(out, S['water_flow'](rng, d) * 1.2, 0)
        mix_into(out, S['birds'](rng, d) * 0.4, 0)
    elif kind == 'none':
        return out
    pk = np.sqrt((out ** 2).mean()) + 1e-9
    return out / pk * 0.1


AMB_GAIN = dict(wind=0.9, fire=0.9, clinic=0.6, palace=0.6, tomb=0.6, nile=0.8, market=0.9, spooky=0.8, throne=0.6, surgery=0.6, birds=0.7,
                night=0.8, farm=0.7, city=0.6, city_old=0.7, senate=0.8, feast=0.8, study=0.5, plague=0.8, river=0.8)

# per-SFX level trims (relative), most effects normalized to 0.9 peak by design
SFX_GAIN = dict(pop=0.55, pop_char=0.5, whoosh=0.55, swoosh=0.45, swoosh_up=0.45, zoom_whoosh=0.6, flash_hit=0.55, impact=0.75, punch=0.6,
                thud=0.6, stamp=0.7, hop=0.4, fall_whistle=0.45, paper_in=0.45, ding=0.5, choir=0.55, ta_da=0.6, boing=0.55, chisel=0.6,
                splash=0.6, notify=0.55, sparkle=0.5, rec_scratch=0.7, scribble=0.6, quill=0.6, keys=0.85, crowd_gasp=0.9, crowd_murmur=0.5,
                heartbeat=0.85, phone_muffled=0.55, phone_ring=0.6, braam=0.7, rumble=0.6, thunder=0.7, magic=0.55, harp=0.5, snore=0.6,
                ghost_ooo=0.55, snake_hiss=0.6, siren=0.45, riser=0.6, dialup=0.4, counter=0.5, footsteps=0.6, crowd_cheer=0.6, gong=0.6)


def rec_scratch(rng, d=None):
    D = 0.6
    f = np.concatenate([glide(300, 1400, 0.18), glide(1400, 200, 0.25), glide(200, 900, D - 0.43)])
    x = np.tanh(3 * saw(f, D)) * 0.5 + bp(noise(D, rng), 800, 5000) * 0.6
    return st(norm(bp(x, 200, 6000) * adsr(D, 0.01, 0.05, 0.9, 0.1)) * 0.8)


def siren(rng, d=None):
    D = d or 4.0
    f = 700 + 300 * np.sin(2 * np.pi * 0.9 * tt(D))
    x = (sine(f, D) + 0.3 * sine(f * 2, D)) * adsr(D, 0.5, 0.2, 1, 1.0)
    return reverb(st(norm(bp(x, 400, 3000)) * 0.5, 0.3), 1.2, 0.3)


SFXLIB.S['rec_scratch'] = rec_scratch
SFXLIB.S['siren'] = siren


def envelope(x, att=0.03, rel=0.35, hop=480):
    n = len(x) // hop
    r = np.sqrt((x[:n * hop].reshape(n, hop) ** 2).mean(1))
    e = np.zeros(n)
    a1, r1 = np.exp(-hop / (att * SR)), np.exp(-hop / (rel * SR))
    v = 0
    for i in range(n):
        c = a1 if r[i] > v else r1
        v = c * v + (1 - c) * r[i]
        e[i] = v
    return np.interp(np.arange(len(x)), np.arange(n) * hop + hop / 2, e)


def main():
    t0 = time.time()
    vo = load_vo()
    SFXLIB.set_vo(vo)
    vo = hp(vo, 70)
    vo = vo / np.abs(vo).max() * 0.6
    print('narration + voices...')
    voice, voice_wet = build_vo(vo)
    venv = envelope(voice, 0.05, 0.9)
    vact = np.clip(venv / 0.035, 0, 1)                # 0..1 "someone is talking" (slow release: no pumping between words)

    # ---------- music ----------
    print('music...')
    mus = np.zeros((NT, 2))
    mc = [c for c in CUES if c.get('music')]
    mc.sort(key=lambda c: c['t'])
    segs = []
    for c in mc:
        name = c['id'][4:]
        if segs and segs[-1][0] == name and name not in ('sting',):
            continue
        segs.append([name, c['t']])
    TARGET = dict(none=0, whisper=0.025, somber=0.04, sad=0.05, night=0.045, lullaby=0.045, spooky=0.05, dream=0.05, awe=0.055, title=0.11, sting=0.09,
                  tension=0.06, party=0.05, jingle=0.07, chant=0.06, cabbage=0.08)
    for i, (name, t) in enumerate(segs):
        end = segs[i + 1][1] if i + 1 < len(segs) else TOTAL
        d = end - t
        if name == 'none' or d <= 0.05:
            continue
        y = music.render_style(name, d + 0.8, seed=i)
        rms = np.sqrt((y[:N(max(0.5, min(d, 8)))] ** 2).mean()) + 1e-9
        y = y / rms * TARGET.get(name, 0.065) * 0.92
        L = min(len(y), N(d + 0.8))
        y = y[:L]
        fi = 0.004 if name in ('title', 'sting') or music.STYLES.get(name, {}).get('hit') else 0.25
        y = fade(y, fi, 0.8)
        mix_into(mus, y, N(t))
    if os.environ.get('FINAL_FADE', '1') == '1':
        mus[-N(2.5):] *= np.linspace(1, 0, N(2.5))[:, None]
    duck = 1 - 0.72 * vact
    mus *= duck[:, None]

    # ---------- ambience ----------
    print('ambience...')
    amb = np.zeros((NT, 2))
    ac = sorted([c for c in CUES if c.get('bed')], key=lambda c: c['t'])
    merged = []
    for c in ac:
        k = c['id'][4:]
        if merged and merged[-1][0] == k and abs(merged[-1][2] - c['t']) < 0.6:
            merged[-1][2] = c['t'] + c['dur']
        else:
            merged.append([k, c['t'], c['t'] + c['dur']])
    rng = np.random.default_rng(42)
    for k, a, b in merged:
        if k == 'none':
            continue
        y = amb_render(k, b - a + 0.8, rng) * AMB_GAIN.get(k, 0.7) * 0.32
        y = fade(y, 0.4, 0.8)
        mix_into(amb, y, N(a - 0.2))
    amb *= (1 - 0.35 * vact)[:, None]

    # ---------- sfx ----------
    print('sfx...')
    fx = np.zeros((NT, 2))
    last = {}
    cnt = 0
    for c in sorted([c for c in CUES if not c.get('bed') and not c.get('music')], key=lambda c: c['t']):
        k = c['id']
        if not isinstance(k, str) or k not in SFXLIB.S:
            print('   (missing sfx)', k)
            continue
        if k in last and c['t'] - last[k] < 0.09:
            continue
        last[k] = c['t']
        r = np.random.default_rng(int(c['t'] * 1000) ^ hash(k) & 0xffff)
        try:
            y = SFXLIB.S[k](r, c.get('dur'))
        except TypeError:
            y = SFXLIB.S[k](r)
        if y.ndim == 1:
            y = st(y)
        g = c.get('v', 1) * SFX_GAIN.get(k, 0.55) * 0.55
        mix_into(fx, y * g, N(c['t']))
        cnt += 1
    print('   placed', cnt, 'sfx')
    fx *= (1 - 0.3 * vact)[:, None]

    # ---------- master ----------
    print('master...')
    vst = st(voice) * 1.0 + voice_wet
    for nm, arr in (('voice', vst), ('music', mus), ('amb', amb), ('sfx', fx)):
        bad = ~np.isfinite(arr)
        if bad.any():
            print('   WARNING non-finite samples in', nm, bad.sum())
            arr[bad] = 0
    mixd = vst + mus + amb + fx
    mixd = hp(mixd, 25)
    # gentle bus compression (envelope follower on mid)
    env = envelope(mixd.mean(axis=1), 0.01, 0.25)
    thr = 0.18
    gain = np.where(env > thr, (thr + (env - thr) * 0.4) / np.maximum(env, 1e-9), 1.0)
    mixd *= gain[:, None]
    pk = np.abs(mixd).max()
    mixd = mixd / pk * 0.89
    sf.write(os.path.join(B, 'mix.wav'), mixd.astype(np.float32), SR, subtype='FLOAT')
    for name, arr in (('voice', vst), ('music', mus), ('amb', amb), ('sfx', fx)):
        sf.write(os.path.join(B, 'stems', name + '.wav'), (arr / pk * 0.89).astype(np.float32), SR, subtype='FLOAT')
    print('done in %.0fs  ->  build/mix.wav (%.1fs)' % (time.time() - t0, len(mixd) / SR))


if __name__ == '__main__':
    main()

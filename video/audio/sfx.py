"""Synthesized sound-effect library. Every effect: fn(rng, dur) -> stereo float array (n, 2)."""
import numpy as np
from dsp import *

VO = None          # mono 48k narration, used to build crowd babble / muffled voices


def set_vo(x):
    global VO
    VO = x


def R(rng, a, b):
    return rng.uniform(a, b)


def babble(rng, d, layers=10, lo=-4, hi=4, grain=(0.18, 0.45)):
    """unintelligible crowd chatter built from many re-pitched grains of the narration"""
    n = N(d)
    out = np.zeros(n)
    for _ in range(layers):
        pos = 0
        pitch = 2 ** (R(rng, lo, hi) / 12)
        while pos < n:
            g = R(rng, *grain)
            src0 = int(R(rng, 5, len(VO) / SR - 2) * SR)
            gl = N(g * pitch)
            seg = VO[src0:src0 + gl]
            idx = np.linspace(0, len(seg) - 1, N(g))
            seg = np.interp(idx, np.arange(len(seg)), seg) * np.hanning(len(idx))
            m = min(len(seg), n - pos)
            out[pos:pos + m] += seg[:m] * R(rng, 0.4, 1.0)
            pos += int(len(seg) * R(rng, 0.55, 0.95)) + int(R(rng, 0, 0.12) * SR)
    out = lp(hp(out, 180), 3500)
    return out / (np.abs(out).max() + 1e-9)


def whoosh_core(rng, d=0.45, f0=300, f1=2600, f2=700, pan=(-0.6, 0.6), tone=0.0):
    x = noise(d, rng)
    peakpos = R(rng, 0.45, 0.6)
    y = tv_bandpass(x, lambda u: f0 * (f1 / f0) ** (u / peakpos) if u < peakpos else f1 * (f2 / f1) ** ((u - peakpos) / (1 - peakpos)), 0.55)
    e = bell_curve(d, peakpos, 0.28)
    y = y * e
    if tone:
        y += tone * sine(glide(f0 * 0.4, f1 * 0.25, d), d) * e
    y = norm(y)
    pans = np.linspace(pan[0], pan[1], len(y))
    out = np.stack([y * np.cos((pans + 1) * np.pi / 4), y * np.sin((pans + 1) * np.pi / 4)], axis=1)
    return out


S = {}


def sfx(name):
    def deco(f):
        S[name] = f
        return f
    return deco


@sfx('pop')
def _pop(rng, d=None):
    f = R(rng, 700, 1000)
    x = sine(glide(f, f * 0.35, 0.07), 0.07) * env_exp(0.07, 0.025)
    click = np.zeros_like(x); click[:N(0.004)] = hp(noise(0.004, rng), 3000) * 0.3
    return reverb(st(norm(x + click), R(rng, -0.3, 0.3)), 0.4, 0.12)


@sfx('pop_char')
def _popc(rng, d=None):
    f = R(rng, 420, 560)
    x = sine(glide(f, f * 1.6, 0.09), 0.09) * env_exp(0.09, 0.04)
    w = whoosh_core(rng, 0.22, 600, 3000, 1500) * 0.35
    out = np.zeros((max(len(x), len(w)), 2)); mix_into(out, w, 0); mix_into(out, st(norm(x)) * 0.8, N(0.06))
    return out


@sfx('whoosh')
def _whoosh(rng, d=None):
    return reverb(whoosh_core(rng, R(rng, 0.38, 0.5), R(rng, 200, 350), R(rng, 1800, 3200), 600, (-0.8, 0.8), 0.15), 0.6, 0.15)


@sfx('swoosh')
def _swoosh(rng, d=None):
    return whoosh_core(rng, R(rng, 0.22, 0.3), 500, 4000, 1500, (R(rng, -0.6, 0), R(rng, 0, 0.6)))


@sfx('swoosh_up')
def _swup(rng, d=None):
    y = whoosh_core(rng, 0.32, 400, 5000, 4000, (-0.2, 0.2), 0.0)
    t = sine(glide(500, 1600, 0.3), 0.3) * bell_curve(0.3, 0.7, 0.3) * 0.15
    mix_into(y, st(t), 0)
    return y


@sfx('zoom_whoosh')
def _zoom(rng, d=None):
    y = whoosh_core(rng, 0.65, 150, 3500, 400, (-0.3, 0.3), 0.3)
    sub = sine(glide(90, 40, 0.5), 0.5) * env_exp(0.5, 0.2) * 0.5
    mix_into(y, st(sub), N(0.25))
    return reverb(y, 0.8, 0.2)


@sfx('flash_hit')
def _flash(rng, d=None):
    n = hp(noise(0.25, rng), 3000) * env_exp(0.25, 0.05)
    parts = sum(np.sin(2 * np.pi * f * tt(1.2)) * np.exp(-tt(1.2) / R(rng, 0.2, 0.6)) for f in [2100, 3350, 4700, 6200])
    x = np.zeros(N(1.2)); x[:len(n)] += n; x += 0.25 * parts
    return reverb(st(norm(x), 0, 0.5), 1.4, 0.35)


@sfx('impact')
def _impact(rng, d=None):
    D = 1.2
    sub = sine(glide(R(rng, 70, 85), 38, D), D) * env_exp(D, 0.28)
    thump = np.tanh(3 * sine(glide(160, 60, 0.15), 0.15) * env_exp(0.15, 0.05))
    crack = lp(noise(0.12, rng), 2500) * env_exp(0.12, 0.03)
    x = np.zeros(N(D)); x += sub; x[:len(thump)] += 0.8 * thump; x[:len(crack)] += 0.6 * crack
    return reverb(st(norm(x), 0, 0.3), 1.6, 0.25, 3000)


@sfx('punch')
def _punch(rng, d=None):
    w = whoosh_core(rng, 0.14, 400, 2500, 1200, (-0.2, 0.2)) * 0.5
    th = padd(sine(glide(150, 55, 0.18), 0.18) * env_exp(0.18, 0.06), lp(noise(0.05, rng), 1500) * env_exp(0.05, 0.015) * 0.6)
    out = np.zeros((N(0.4), 2)); mix_into(out, w, 0); mix_into(out, st(norm(th)), N(0.1))
    return out


@sfx('thud')
def _thud(rng, d=None):
    x = padd(sine(glide(R(rng, 110, 140), 50, 0.25), 0.25) * env_exp(0.25, 0.07), 0.4 * lp(noise(0.06, rng), 900) * env_exp(0.06, 0.02))
    return reverb(st(norm(x)), 0.5, 0.12)


@sfx('thud_soft')
def _thuds(rng, d=None):
    return _thud(rng) * 0.5


@sfx('ding')
def _ding(rng, d=None):
    f = R(rng, 1250, 1400)
    x = sum(g * np.sin(2 * np.pi * f * k * tt(1.5)) * np.exp(-tt(1.5) / dec) for k, g, dec in [(1, 1, 0.6), (2.0, 0.4, 0.3), (3.01, 0.25, 0.18), (4.2, 0.12, 0.1)])
    return reverb(st(norm(x * env_exp(1.5, 10, 0.002))), 1.2, 0.25)


@sfx('correct')
def _correct(rng, d=None):
    out = np.zeros((N(1.2), 2))
    for i, f in enumerate([1046.5, 1568]):
        x = sum(g * np.sin(2 * np.pi * f * k * tt(0.8)) * np.exp(-tt(0.8) / dec) for k, g, dec in [(1, 1, 0.3), (4, 0.2, 0.05), (10, 0.05, 0.02)])
        mix_into(out, st(norm(x) * 0.8), N(i * 0.11))
    return reverb(out, 0.9, 0.2)


@sfx('buzzer')
def _buzzer(rng, d=None):
    x = (square(140, 0.55) + square(147, 0.55)) * adsr(0.55, 0.01, 0.05, 0.9, 0.08)
    return st(norm(lp(x, 2500)) * 0.7)


@sfx('stamp')
def _stamp(rng, d=None):
    th = _thud(rng)
    sl = bp(noise(0.06, rng), 900, 5000) * env_exp(0.06, 0.015)
    mix_into(th, st(norm(sl) * 0.7), 0)
    return th


@sfx('hop')
def _hop(rng, d=None):
    x = sine(glide(280, 760, 0.13), 0.13) * env_exp(0.13, 0.06)
    return st(norm(x) * 0.6, R(rng, -0.3, 0.3))


@sfx('boing')
def _boing(rng, d=None):
    D = 0.7
    t = tt(D)
    f = 180 * (1 + 0.5 * np.exp(-t / 0.15) * np.sin(2 * np.pi * 28 * t)) * (1 + 0.15 * np.exp(-t / 0.3))
    x = (sine(f, D) + 0.3 * tri(f * 2, D)) * env_exp(D, 0.25)
    return reverb(st(norm(x)), 0.5, 0.1)


@sfx('fall_whistle')
def _fall(rng, d=None):
    D = 0.55
    f = glide(1900, 650, D) * (1 + 0.012 * np.sin(2 * np.pi * 7 * tt(D)))
    x = (sine(f, D) + 0.05 * noise(D, rng)) * adsr(D, 0.03, 0.1, 0.8, 0.12)
    return st(norm(x) * 0.6)


def _refwhistle(rng, d=0.6):
    D = d or 0.6
    am = 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * R(rng, 26, 34) * tt(D)))
    x = (sine(2900, D) + 0.2 * sine(5800, D) + 0.3 * bp(noise(D, rng), 2600, 3400)) * (0.6 + 0.4 * am) * adsr(D, 0.01, 0.05, 0.9, 0.05)
    return reverb(st(norm(x) * 0.6), 0.6, 0.15)


S['whistle'] = _refwhistle
S['whistle_ref'] = lambda rng, d=None: _refwhistle(rng, 0.35)


@sfx('paper_in')
def _paper(rng, d=None):
    D = 0.32
    x = bp(noise(D, rng), 1500, 7000) * bell_curve(D, 0.35, 0.3) * (0.7 + 0.3 * np.abs(np.sin(2 * np.pi * 37 * tt(D))))
    return whoosh_core(rng, 0.3, 800, 3000, 2000) * 0.4 + st(norm(x) * 0.7, R(rng, -0.3, 0.3))[:N(0.3)]


@sfx('scroll')
def _scroll(rng, d=None):
    D = 0.9
    x = bp(noise(D, rng), 1200, 6000) * bell_curve(D, 0.4, 0.4)
    for _ in range(14):
        p = int(R(rng, 0, D - 0.02) * SR)
        x[p:p + N(0.01)] += hp(noise(0.01, rng), 2500) * R(rng, 0.5, 1.5)
    return st(norm(x) * 0.7, 0, 0.4)


@sfx('flip_pages')
def _flip(rng, d=None):
    out = np.zeros((N(1.2), 2))
    for i in range(6):
        mix_into(out, _paper(rng) * 0.6, N(i * 0.14))
    return out


def _scratch(rng, D, rate):
    x = bp(noise(D, rng), 2000, 6500)
    am = np.abs(np.sin(2 * np.pi * rate * tt(D) + rng.uniform(0, 3) * np.sin(2 * np.pi * 1.3 * tt(D))))
    return st(norm(x * am ** 2 * adsr(D, 0.02, 0.1, 0.9, 0.1)) * 0.5)


S['quill'] = lambda rng, d=None: _scratch(rng, d or 1.2, 3)
S['scribble'] = lambda rng, d=None: _scratch(rng, 0.7, 7)


@sfx('keys')
def _keys(rng, d=None):
    D = (d or 1.5) + 0.2
    out = np.zeros((N(D), 2))
    t = 0.0
    while t < D - 0.2:
        space = rng.random() < 0.12
        cl = bp(noise(0.03, rng), 1800, 5500) * env_exp(0.03, 0.006)
        cl = peak(cl, R(rng, 2400, 3200), 6, 6)
        th = sine(R(rng, 170, 260) if not space else 120, 0.04) * env_exp(0.04, 0.01) * (0.8 if space else 0.4)
        k = np.zeros(N(0.05)); k[:len(cl)] += cl; k[:len(th)] += th
        mix_into(out, st(norm(k) * R(rng, 0.5, 1.0), R(rng, -0.4, 0.4)), N(t))
        t += R(rng, 0.06, 0.17) + (0.15 if rng.random() < 0.08 else 0)
    return reverb(out, 0.35, 0.12, 6000)


@sfx('notify')
def _notify(rng, d=None):
    out = np.zeros((N(0.8), 2))
    for i, f in enumerate([1318.5, 1760]):
        x = sine(f, 0.25) * env_exp(0.25, 0.08, 0.005) + 0.2 * sine(f * 2, 0.25) * env_exp(0.25, 0.04)
        mix_into(out, st(x * 0.6), N(i * 0.09))
    return reverb(out, 0.6, 0.2)


@sfx('dialup')
def _dialup(rng, d=None):
    out = np.zeros(N(2.6))
    pos = 0
    for k in range(7):
        a, b = rng.choice([697, 770, 852, 941]), rng.choice([1209, 1336, 1477])
        x = (sine(a, 0.09) + sine(b, 0.09)) * 0.4
        out[pos:pos + len(x)] += x; pos += N(0.13)
    sc = saw(glide(1200, 2400, 1.4) * (1 + 0.3 * np.sign(np.sin(2 * np.pi * 15 * tt(1.4)))), 1.4) * 0.3 + bp(noise(1.4, rng), 1500, 3500) * 0.4
    out[pos:pos + len(sc)] += sc[:len(out) - pos]
    return st(norm(bp(out, 300, 3400)) * 0.5)


@sfx('phone_ring')
def _ring(rng, d=None):
    out = np.zeros(N(3.2))
    for start in (0.0, 0.0 + 1.6):
        x = (sine(440, 1.0) + sine(480, 1.0)) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 20 * tt(1.0))))
        x = np.tanh(2 * x) * adsr(1.0, 0.005, 0.05, 0.9, 0.05)
        out[N(start):N(start) + len(x)] += x
    return reverb(st(norm(bp(out, 350, 4000)) * 0.6), 0.7, 0.2)


@sfx('phone_muffled')
def _phmuff(rng, d=None):
    D = d or 7.0
    x = babble(rng, D, layers=1, lo=-3, hi=-1, grain=(0.25, 0.6))
    x = lp(x, 650) * adsr(D, 0.5, 0.1, 1, 0.8)
    return reverb(st(norm(x) * 0.5, -0.5), 0.9, 0.5, 2000)


@sfx('clock_fast')
def _clockf(rng, d=None):
    D = 3.0
    out = np.zeros(N(D))
    t, iv = 0.0, 0.5
    while t < D:
        c = hp(noise(0.01, rng), 3000) * env_exp(0.01, 0.002) * (1 if int(t / iv) % 2 else 0.7)
        out[N(t):N(t) + len(c)] += c[:len(out) - N(t)]
        t += iv; iv = max(0.03, iv * 0.85)
    return reverb(st(norm(out) * 0.6), 0.4, 0.15)


@sfx('door_slam')
def _door(rng, d=None):
    D = 1.0
    x = np.tanh(2 * (sine(glide(110, 60, D), D) * env_exp(D, 0.12) + 0.8 * bp(noise(D, rng), 150, 900) * env_exp(D, 0.05)))
    x[:N(0.01)] += hp(noise(0.01, rng), 2000)
    return reverb(st(norm(x)), 1.0, 0.25, 4000)


@sfx('riser')
def _riser(rng, d=None):
    D = 1.3
    x = tv_bandpass(noise(D, rng), lambda u: 300 * (8000 / 300) ** u, 0.7) * np.linspace(0, 1, N(D)) ** 2
    ton = sum(saw(glide(f, f * 2, D), D) for f in (110, 165, 220)) * np.linspace(0, 1, N(D)) ** 3 * 0.15
    return reverb(st(norm(x + lp(ton, 3000)), 0, 0.5), 1.0, 0.3)


@sfx('braam')
def _braam(rng, d=None):
    D = 2.6
    f = 36.7
    x = sum(saw(f * m * (1 + R(rng, -0.004, 0.004)), D) for m in (1, 1, 2, 1.5, 3))
    env = adsr(D, 0.08, 0.5, 0.6, 1.2)
    y = np.tanh(1.8 * tv_lowpass(x, 300 + 1500 * env_exp(D, 0.5))) * env
    return reverb(st(norm(y), 0, 0.4), 2.0, 0.35, 3000)


@sfx('dun_dun')
def _dundun(rng, d=None):
    out = np.zeros(N(2.6))
    for t0, f, L in ((0, 146.8, 0.3), (0.38, 146.8, 0.3), (0.76, 110, 1.6)):
        x = sum(saw(f * m, L) / m for m in (1, 2, 3)) * adsr(L, 0.01, 0.1, 0.7, 0.3)
        x = lp(x, 1400) + 0.6 * sine(f / 2, L) * env_exp(L, 0.4)
        out[N(t0):N(t0) + len(x)] += x
    return reverb(st(norm(out)), 1.6, 0.3)


@sfx('tension_hit')
def _tension(rng, d=None):
    h = _impact(rng)
    D = 1.6
    s = sum(saw(f, D) for f in (1760, 1864.7, 2093)) * (0.6 + 0.4 * np.sin(2 * np.pi * 12 * tt(D))) * adsr(D, 0.05, 0.3, 0.5, 0.8)
    mix_into(h, st(lp(s, 5000) * 0.08, 0, 0.5), 0)
    return h


@sfx('sad_trombone')
def _sadtb(rng, d=None):
    out = np.zeros(N(2.6))
    notes = [(0, 233.1, 0.45), (0.5, 220, 0.45), (1.0, 207.7, 0.45), (1.5, 196, 1.1)]
    for t0, f, L in notes:
        vib = 1 + (0.02 * np.sin(2 * np.pi * 6 * tt(L)) if L > 1 else 0)
        x = saw(f * vib, L)
        wah = tv_bandpass(x, lambda u: 500 + 900 * np.sin(np.pi * min(1, u * 1.5)) if L < 1 else 500 + 700 * abs(np.sin(u * 12)), 0.9)
        out[N(t0):N(t0) + len(wah)] += wah * adsr(L, 0.03, 0.1, 0.8, 0.15)[:len(wah)]
    return reverb(st(norm(out) * 0.8), 1.0, 0.2)


@sfx('rimshot')
def _rimshot(rng, d=None):
    out = np.zeros(N(1.6))
    for t0, f in ((0, 220), (0.16, 160)):
        x = sine(glide(f, f * 0.8, 0.2), 0.2) * env_exp(0.2, 0.07) + 0.5 * bp(noise(0.2, rng), 1000, 5000) * env_exp(0.2, 0.04)
        out[N(t0):N(t0) + len(x)] += x
    cy = hp(noise(1.2, rng), 4000) * env_exp(1.2, 0.4)
    out[N(0.34):N(0.34) + len(cy)] += 0.6 * cy[:len(out) - N(0.34)]
    return reverb(st(norm(out), 0, 0.4), 0.8, 0.15)


def brass(f, L, rng):
    x = sum(saw(f * (1 + R(rng, -0.003, 0.003)), L) for _ in range(3))
    env = adsr(L, 0.02, 0.15, 0.75, 0.2)
    return tv_lowpass(x, 900 + 2500 * env) * env


@sfx('ta_da')
def _tada(rng, d=None):
    out = np.zeros(N(2.2))
    chord = [261.6, 329.6, 392, 523.3]
    for t0, L in ((0, 0.16), (0.2, 1.2)):
        x = sum(brass(f, L, rng) for f in chord)
        out[N(t0):N(t0) + len(x)] += x
    cy = hp(noise(1.6, rng), 5000) * env_exp(1.6, 0.6)
    out[N(0.2):N(0.2) + len(cy)] += 0.8 * cy[:len(out) - N(0.2)]
    return reverb(st(norm(out), 0, 0.5), 1.4, 0.25)


@sfx('cash')
def _cash(rng, d=None):
    out = np.zeros(N(1.4))
    bell = sum(np.sin(2 * np.pi * f * tt(1.2)) * np.exp(-tt(1.2) / 0.3) for f in (2960, 4130, 5270, 6630))
    out[:len(bell)] += 0.6 * bell
    dr = bp(noise(0.35, rng), 400, 2500) * bell_curve(0.35, 0.5, 0.3)
    out[N(0.15):N(0.15) + len(dr)] += dr * 0.4
    c = _coins(rng)
    o = st(norm(out))
    mix_into(o, c * 0.6, N(0.2))
    return reverb(o, 0.6, 0.15)


@sfx('coins')
def _coins(rng, d=None):
    out = np.zeros((N(1.6), 2))
    for i in range(14):
        f0 = R(rng, 3000, 7000)
        x = sum(np.sin(2 * np.pi * f0 * m * tt(0.3)) * np.exp(-tt(0.3) / R(rng, 0.03, 0.1)) for m in (1, 1.37, 2.13))
        mix_into(out, st(x * R(rng, 0.3, 1), R(rng, -0.6, 0.6)), N(R(rng, 0, 1.1)))
    return reverb(norm(out) * 0.7, 0.5, 0.15)


@sfx('choir')
def _choir(rng, d=None):
    D = 2.4
    out = np.zeros(N(D))
    for f in (261.6, 329.6, 392, 523.3, 196):
        for _ in range(2):
            out += formant_voice(f * (1 + R(rng, -0.006, 0.006)), D, 'a', 0.1, rng, 0.006, R(rng, 4.5, 6))
    out *= adsr(D, 0.5, 0.3, 0.8, 0.9)
    return reverb(st(norm(out), 0, 0.6), 2.2, 0.45)


@sfx('harp')
def _harp(rng, d=None):
    out = np.zeros(N(2.5))
    scale = [261.6, 293.7, 329.6, 392, 440, 523.3, 587.3, 659.3, 784, 880, 1046.5, 1174.7]
    for i, f in enumerate(scale):
        x = karplus(f, 1.6, 0.997, 0.7, rng)
        out[N(i * 0.07):N(i * 0.07) + len(x)] += x[:len(out) - N(i * 0.07)]
    return reverb(st(norm(out), 0, 0.5), 1.8, 0.35)


@sfx('magic')
def _magic(rng, d=None):
    out = np.zeros((N(2.0), 2))
    for i in range(18):
        f = 1200 * 2 ** (R(rng, 0, 2.2) + i * 0.04)
        x = sine(f, 0.5) * env_exp(0.5, 0.12, 0.004)
        mix_into(out, st(x * 0.4, R(rng, -0.7, 0.7)), N(i * 0.06 + R(rng, 0, 0.03)))
    sh = hp(noise(1.6, rng), 6000) * bell_curve(1.6, 0.4, 0.35) * 0.15
    mix_into(out, st(sh, 0, 0.6), 0)
    return reverb(norm(out) * 0.8, 1.8, 0.4)


@sfx('magic_bad')
def _magicbad(rng, d=None):
    out = np.zeros((N(1.8), 2))
    notes = [880, 830.6, 739.99, 698.5, 622.3, 554.4, 523.3]
    for i, f in enumerate(notes):
        x = (sine(f, 0.5) + 0.3 * sine(f * 1.5, 0.5)) * env_exp(0.5, 0.15)
        mix_into(out, st(x * 0.4, R(rng, -0.5, 0.5)), N(i * 0.09))
    mix_into(out, whoosh_core(rng, 0.8, 150, 800, 150) * 0.5, 0)
    return reverb(norm(out) * 0.8, 1.5, 0.35)


@sfx('sparkle')
def _sparkle(rng, d=None):
    out = np.zeros((N(0.9), 2))
    for i in range(6):
        f = R(rng, 3500, 7000)
        mix_into(out, st(sine(f, 0.25) * env_exp(0.25, 0.05, 0.002) * 0.4, R(rng, -0.6, 0.6)), N(R(rng, 0, 0.5)))
    return reverb(out, 1.2, 0.35)


@sfx('ghost_ooo')
def _ghost(rng, d=None):
    D = 2.2
    f = 520 * (1 + 0.25 * np.sin(np.pi * np.linspace(0, 1, N(D)))) * (1 + 0.02 * np.sin(2 * np.pi * 6 * tt(D)))
    x = formant_voice(f, D, 'u', 0.05, rng) + 0.5 * sine(f, D)
    return reverb(st(norm(x * adsr(D, 0.4, 0.2, 0.9, 0.8)) * 0.7, 0, 0.5), 2.2, 0.5)


@sfx('snore')
def _snore(rng, d=None):
    out = np.zeros(N(4.2))
    for c0 in (0.0, 2.1):
        ins = bp(noise(1.1, rng), 200, 1100) * np.linspace(0, 1, N(1.1)) * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 32 * tt(1.1))))
        exh = bp(noise(0.7, rng), 1500, 5000) * np.linspace(1, 0, N(0.7)) * 0.3
        out[N(c0):N(c0) + len(ins)] += ins
        out[N(c0 + 1.15):N(c0 + 1.15) + len(exh)] += exh
    return st(norm(lp(out, 3000)) * 0.6)


@sfx('snake_hiss')
def _hiss(rng, d=None):
    D = 1.3
    x = bp(noise(D, rng), 3500, 9500) * adsr(D, 0.15, 0.2, 0.8, 0.5) * (0.85 + 0.15 * np.sin(2 * np.pi * 9 * tt(D)))
    return reverb(st(norm(x) * 0.6, 0, 0.5), 0.6, 0.2)


@sfx('question')
def _question(rng, d=None):
    D = 0.35
    x = (sine(glide(380, 950, D), D) + 0.3 * tri(glide(760, 1900, D), D)) * adsr(D, 0.02, 0.05, 0.8, 0.1)
    return reverb(st(norm(x) * 0.6), 0.5, 0.15)


@sfx('alert')
def _alert(rng, d=None):
    out = np.zeros(N(0.6))
    for i, f in enumerate((1567, 2093)):
        x = sine(f, 0.18) * env_exp(0.18, 0.06) + 0.3 * sine(f * 3, 0.18) * env_exp(0.18, 0.02)
        out[N(i * 0.07):N(i * 0.07) + len(x)] += x
    return reverb(st(norm(out) * 0.7), 0.5, 0.15)


def bubble(rng, f0=None, L=0.09):
    f0 = f0 or R(rng, 250, 700)
    return sine(glide(f0, f0 * R(rng, 1.8, 2.6), L), L) * env_exp(L, L / 3, 0.002)


@sfx('gurgle')
def _gurgle(rng, d=None):
    D = 1.4
    out = np.zeros(N(D))
    for _ in range(28):
        b = bubble(rng, R(rng, 120, 400), R(rng, 0.05, 0.14))
        p = N(R(rng, 0, D - 0.15)); out[p:p + len(b)] += b * R(rng, 0.3, 1)
    out += 0.2 * lp(noise(D, rng), 400) * bell_curve(D, 0.5, 0.4)
    return reverb(st(norm(lp(out, 2500)) * 0.7), 0.5, 0.2)


@sfx('plop')
def _plop(rng, d=None):
    b = bubble(rng, R(rng, 200, 320), 0.12)
    sp = bp(noise(0.08, rng), 800, 3000) * env_exp(0.08, 0.02) * 0.4
    x = np.zeros(N(0.2)); x[:len(b)] += b; x[:len(sp)] += sp
    return reverb(st(norm(x) * 0.7), 0.4, 0.15)


@sfx('squelch')
def _squelch(rng, d=None):
    D = 0.45
    x = tv_bandpass(noise(D, rng), lambda u: 300 + 1200 * np.sin(np.pi * u), 0.5) * adsr(D, 0.02, 0.1, 0.8, 0.15)
    x += 0.5 * sine(glide(90, 200, D), D) * env_exp(D, 0.15)
    for _ in range(4):
        b = bubble(rng, R(rng, 200, 500), 0.06); p = N(R(rng, 0, D - 0.07)); x[p:p + len(b)] += b * 0.4
    return st(norm(x) * 0.8)


@sfx('splash')
def _splash(rng, d=None):
    D = 1.2
    x = bp(noise(D, rng), 300, 9000) * env_exp(D, 0.18, 0.004)
    for _ in range(25):
        b = bubble(rng, R(rng, 400, 1500), R(rng, 0.03, 0.08)); p = N(R(rng, 0.05, D - 0.1)); x[p:p + len(b)] += b * R(rng, 0.1, 0.4)
    return reverb(st(norm(x), 0, 0.5), 0.6, 0.15)


@sfx('water_flow')
def _flow(rng, d=None):
    D = d or 3.0
    x = bp(noise(D, rng), 400, 3000) * (0.6 + 0.4 * np.abs(lp(noise(D, rng), 6)) * 4)
    for _ in range(int(D * 15)):
        b = bubble(rng, R(rng, 500, 1500), 0.05); p = N(R(rng, 0, D - 0.06)); x[p:p + len(b)] += b * 0.3
    return st(norm(x * adsr(D, 0.4, 0.1, 1, 0.6)) * 0.4, 0, 0.6)


@sfx('flush')
def _flush(rng, d=None):
    D = 2.2
    x = tv_bandpass(noise(D, rng), lambda u: 300 + 1500 * u * (1 - u) * 4, 0.9) * adsr(D, 0.2, 0.4, 0.8, 0.8)
    g = mono(_gurgle(rng)); x[N(0.8):N(0.8) + len(g)] += 0.5 * g[:len(x) - N(0.8)]
    return reverb(st(norm(x), 0, 0.5), 0.6, 0.2)


@sfx('suck')
def _suck(rng, d=None):
    D = 0.6
    x = tv_bandpass(noise(D, rng), lambda u: 300 * 12 ** u, 0.5) * np.linspace(0.2, 1, N(D)) ** 2
    x[-N(0.04):] += bubble(rng, 600, 0.04)
    return st(norm(fade(x, 0.01, 0.03)) * 0.7)


@sfx('fizz')
def _fizz(rng, d=None):
    D = 1.6
    x = hp(noise(D, rng), 5000) * 0.15
    for _ in range(220):
        p = N(R(rng, 0, D - 0.01)); c = hp(noise(0.004, rng), 4000) * R(rng, 0.2, 1); x[p:p + len(c)] += c
    return st(norm(x * adsr(D, 0.05, 0.2, 0.8, 0.5)) * 0.5, 0, 0.7)


@sfx('sizzle')
def _sizzle(rng, d=None):
    D = 1.4
    x = bp(noise(D, rng), 3000, 9000) * (0.7 + 0.3 * np.abs(lp(noise(D, rng), 20)) * 8)
    for _ in range(80):
        p = N(R(rng, 0, D - 0.01)); c = hp(noise(0.003, rng), 2000); x[p:p + len(c)] += c * 0.6
    return st(norm(x * adsr(D, 0.05, 0.2, 0.8, 0.5)) * 0.5, 0, 0.6)


@sfx('crunch')
def _crunch(rng, d=None):
    out = np.zeros(N(1.0))
    for c0 in (0, 0.35):
        x = bp(noise(0.18, rng), 800, 7000) * env_exp(0.18, 0.05)
        for _ in range(30):
            p = N(R(rng, 0, 0.15)); cl = hp(noise(0.003, rng), 2000) * R(rng, 0.5, 2); x[p:p + len(cl)] += cl
        out[N(c0):N(c0) + len(x)] += x
    return st(norm(out) * 0.8)


@sfx('gulp')
def _gulp(rng, d=None):
    out = np.zeros(N(0.9))
    for c0 in (0, 0.42):
        x = sine(glide(230, 110, 0.12), 0.12) * env_exp(0.12, 0.05)
        out[N(c0):N(c0) + len(x)] += x
    return st(norm(lp(out, 1200)) * 0.8)


@sfx('pour')
def _pour(rng, d=None):
    D = 1.6
    x = bp(noise(D, rng), 500, 2500) * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * tt(D)) ** 2) * adsr(D, 0.1, 0.1, 1, 0.3)
    for _ in range(30):
        b = bubble(rng, R(rng, 600, 1400), 0.04); p = N(R(rng, 0, D - 0.05)); x[p:p + len(b)] += b * 0.3
    return st(norm(x) * 0.6)


@sfx('bandage')
def _bandage(rng, d=None):
    out = np.zeros((N(1.2), 2))
    for i in range(3):
        mix_into(out, whoosh_core(rng, 0.25, 1000, 5000, 3000, (-0.4, 0.4)) * 0.6, N(i * 0.3))
    return out


@sfx('bird_squawk')
def _squawk(rng, d=None):
    out = np.zeros(N(0.9))
    for c0 in (0, 0.35):
        L = 0.24
        f = glide(950, 700, L) * (1 + 0.05 * np.sin(2 * np.pi * 70 * tt(L)))
        x = np.tanh(3 * saw(f, L)) * adsr(L, 0.01, 0.05, 0.8, 0.08)
        x = peak(bp(x, 600, 5000), 1800, 3, 8)
        out[N(c0):N(c0) + len(x)] += x
    return reverb(st(norm(out) * 0.7), 0.8, 0.2)


@sfx('birds')
def _birds(rng, d=None):
    D = d or 3.0
    out = np.zeros((N(D), 2))
    for i in range(int(D * 2.5)):
        L = R(rng, 0.06, 0.14)
        f0 = R(rng, 2500, 5000)
        x = sine(glide(f0, f0 * R(rng, 0.6, 1.6), L) * (1 + 0.1 * np.sin(2 * np.pi * 40 * tt(L))), L) * bell_curve(L, 0.5, 0.35)
        reps = int(R(rng, 1, 4))
        p0 = R(rng, 0, D - 0.6)
        for k in range(reps):
            mix_into(out, st(x * 0.25, R(rng, -0.8, 0.8)), N(p0 + k * (L + 0.04)))
    return reverb(out, 0.9, 0.25)


@sfx('croc_growl')
def _croc(rng, d=None):
    D = 1.5
    x = lp(noise(D, rng), 260) * (0.6 + 0.4 * np.sin(2 * np.pi * 23 * tt(D))) + 0.5 * sine(glide(75, 60, D), D) * (0.5 + 0.5 * np.sin(2 * np.pi * 23 * tt(D)))
    x = np.tanh(2 * x) * adsr(D, 0.1, 0.2, 0.8, 0.5)
    return reverb(st(norm(x)), 0.6, 0.15, 2500)


@sfx('strike')
def _strike(rng, d=None):
    out = np.zeros((N(2.2), 2))
    roll = lp(noise(0.8, rng), 300) * np.linspace(0.3, 1, N(0.8))
    mix_into(out, st(norm(roll) * 0.5), 0)
    for i in range(12):
        f = R(rng, 700, 2200)
        x = bp(noise(0.12, rng), f * 0.8, f * 1.25) * env_exp(0.12, 0.03)
        mix_into(out, st(norm(x) * R(rng, 0.4, 1), R(rng, -0.6, 0.6)), N(0.8 + R(rng, 0, 0.35)))
    return reverb(out, 1.0, 0.2)


@sfx('flies')
def _flies(rng, d=None):
    D = 2.4
    f = 200 * (1 + 0.15 * np.sin(2 * np.pi * 3 * tt(D)) + 0.05 * lp(noise(D, rng), 10) * 10)
    x = saw(f, D) * (0.5 + 0.5 * np.sin(np.pi * np.linspace(0, 1, N(D))))
    pans = np.sin(2 * np.pi * 0.7 * tt(D))
    y = bp(x, 200, 3000) * 0.4
    return np.stack([y * (1 - pans) / 2, y * (1 + pans) / 2], axis=1)


@sfx('beep')
def _beep(rng, d=None):
    return st(sine(1000, 0.7) * adsr(0.7, 0.005, 0.01, 1, 0.01) * 0.45)


@sfx('creepy')
def _creepy(rng, d=None):
    D = 1.8
    x = sum(saw(f, D) for f in (1046.5, 1108.7, 1479.98)) * (0.7 + 0.3 * np.sin(2 * np.pi * 9 * tt(D)))
    x = lp(x, 4000) * adsr(D, 0.6, 0.3, 0.7, 0.6)
    return reverb(st(norm(x) * 0.4, 0, 0.6), 1.8, 0.4)


@sfx('deflate')
def _deflate(rng, d=None):
    D = 1.1
    f = glide(700, 180, D) * (1 + 0.08 * np.sin(2 * np.pi * 25 * tt(D)))
    x = np.tanh(2 * saw(f, D)) * adsr(D, 0.02, 0.1, 0.9, 0.2)
    return st(norm(bp(x, 300, 3000)) * 0.6)


@sfx('squeak')
def _squeak(rng, d=None):
    out = np.zeros(N(0.6))
    for c0 in (0, 0.28):
        L = 0.18
        f = glide(1700, 2500, L) * (1 + 0.04 * np.sin(2 * np.pi * 40 * tt(L)))
        x = (sine(f, L) + 0.4 * sine(f * 2, L)) * bell_curve(L, 0.5, 0.35)
        out[N(c0):N(c0) + len(x)] += x
    return st(norm(out) * 0.6)


def _voc(rng, f0, D, vowel, breath=0.2, env=None):
    x = formant_voice(f0, D, vowel, breath, rng)
    return x * (env if env is not None else adsr(D, 0.02, 0.1, 0.8, 0.1))


@sfx('ha')
def _ha(rng, d=None):
    out = np.zeros(N(0.7))
    for c0, f in ((0, 210), (0.25, 190)):
        L = 0.18
        h = bp(noise(0.05, rng), 1000, 4000) * 0.3
        v = _voc(rng, glide(f, f * 0.85, L), L, 'a', 0.3)
        out[N(c0):N(c0) + len(h)] += h
        out[N(c0 + 0.04):N(c0 + 0.04) + len(v)] += v
    return reverb(st(norm(out) * 0.6), 0.5, 0.15)


@sfx('yawn')
def _yawn(rng, d=None):
    D = 1.6
    a = _voc(rng, glide(220, 130, D), D, 'a', 0.4, adsr(D, 0.2, 0.3, 0.8, 0.5))
    o = _voc(rng, glide(220, 130, D), D, 'o', 0.4, adsr(D, 0.2, 0.3, 0.8, 0.5))
    m = np.linspace(0, 1, N(D))
    return reverb(st(norm(a * (1 - m) + o * m) * 0.6), 0.5, 0.15)


@sfx('cough')
def _cough(rng, d=None):
    out = np.zeros(N(1.0))
    for c0 in (0, 0.35):
        L = 0.2
        x = bp(noise(L, rng), 300, 3000) * env_exp(L, 0.06) + 0.5 * _voc(rng, 160, L, 'a', 0.8, env_exp(L, 0.05))
        out[N(c0):N(c0) + len(x)] += x
    return reverb(st(norm(out) * 0.6, R(rng, -0.5, 0.5)), 0.7, 0.2)


@sfx('ahh')
def _ahh(rng, d=None):
    D = 1.3
    x = _voc(rng, glide(190, 120, D), D, 'a', 0.5, adsr(D, 0.1, 0.3, 0.7, 0.6))
    return reverb(st(norm(x) * 0.5), 0.6, 0.15)


@sfx('crowd_gasp')
def _gasp(rng, d=None):
    D = 1.4
    out = np.zeros((N(D), 2))
    for _ in range(22):
        L = R(rng, 0.35, 0.6)
        f0 = R(rng, 140, 320)
        e = np.concatenate([np.linspace(0, 1, N(0.09)) ** 2, np.exp(-np.arange(N(L) - N(0.09)) / (0.12 * SR))])
        br = bp(noise(L, rng), R(rng, 500, 900), R(rng, 1800, 3200)) * e
        v = formant_voice(glide(f0, f0 * 1.15, L), L, rng.choice(['a', 'o']), 0.9, rng) * e * 0.4
        mix_into(out, st((br + v) * R(rng, 0.4, 1), R(rng, -0.8, 0.8)), N(R(rng, 0, 0.12)))
    return reverb(norm(out) * 0.9, 1.2, 0.3)


@sfx('crowd_cheer')
def _cheer(rng, d=None):
    D = 2.4
    out = np.zeros((N(D), 2))
    for _ in range(18):
        L = R(rng, 0.6, 1.6)
        f0 = R(rng, 180, 420)
        v = formant_voice(glide(f0, f0 * R(rng, 1.1, 1.4), L), L, rng.choice(['e', 'a', 'o']), 0.6, rng) * adsr(L, 0.05, 0.2, 0.7, 0.4)
        mix_into(out, st(v * R(rng, 0.3, 0.8), R(rng, -0.9, 0.9)), N(R(rng, 0, 0.5)))
    for _ in range(60):
        cl = bp(noise(0.02, rng), 900, 3500) * env_exp(0.02, 0.006)
        mix_into(out, st(cl * R(rng, 0.3, 1), R(rng, -0.9, 0.9)), N(R(rng, 0.1, D - 0.1)))
    return reverb(norm(out) * 0.8, 1.2, 0.3)


@sfx('crowd_murmur')
def _murmur(rng, d=None):
    D = d or 4.0
    x = babble(rng, D, layers=12)
    return reverb(st(norm(x * adsr(D, 0.5, 0.2, 1, 0.8)) * 0.6, 0, 0.7), 1.0, 0.3)


@sfx('footsteps')
def _steps(rng, d=None):
    D = d or 2.6
    out = np.zeros((N(D), 2))
    t = 0.0
    while t < D - 0.2:
        x = padd(sine(R(rng, 80, 110), 0.08) * env_exp(0.08, 0.02), 0.4 * bp(noise(0.06, rng), 300, 3000) * env_exp(0.06, 0.015))
        mix_into(out, st(x * R(rng, 0.6, 1), R(rng, -0.3, 0.3)), N(t))
        t += R(rng, 0.36, 0.44)
    return reverb(norm(out) * 0.6, 0.4, 0.15)


@sfx('rumble')
def _rumble(rng, d=None):
    D = 2.0
    x = lp(noise(D, rng), 140) * adsr(D, 0.2, 0.3, 0.8, 0.8) * 6 + 0.4 * sine(42, D) * adsr(D, 0.3, 0.2, 0.8, 0.8)
    for _ in range(8):
        p = N(R(rng, 0, D - 0.1)); c = bp(noise(0.05, rng), 300, 2000) * env_exp(0.05, 0.015); x[p:p + len(c)] += c * 0.3
    return reverb(st(norm(x), 0, 0.5), 1.0, 0.2, 2000)


@sfx('thunder')
def _thunder(rng, d=None):
    D = 3.5
    crack = bp(noise(0.3, rng), 400, 8000) * env_exp(0.3, 0.06)
    roll = lp(noise(D, rng), 300) * (0.5 + 0.5 * np.abs(lp(noise(D, rng), 4)) * 10) * env_exp(D, 1.0, 0.05)
    x = np.zeros(N(D)); x[:len(crack)] += crack; x += roll * 3
    return reverb(st(norm(np.tanh(x)), 0, 0.6), 2.5, 0.35, 2500)


@sfx('stone_grind')
def _grind(rng, d=None):
    D = 1.7
    x = bp(noise(D, rng), 250, 2500) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 14 * tt(D) + 2 * np.sin(2 * np.pi * 2 * tt(D))))) * adsr(D, 0.05, 0.2, 0.9, 0.2)
    sq = saw(glide(900, 1300, D) * (1 + 0.05 * np.sin(2 * np.pi * 30 * tt(D))), D) * 0.08
    return reverb(st(norm(x + bp(sq, 700, 3000)) * 0.8), 0.5, 0.15)


@sfx('stone_slide')
def _slide(rng, d=None):
    D = 1.0
    x = lp(noise(D, rng), 900) * adsr(D, 0.1, 0.2, 0.8, 0.1) * (0.7 + 0.3 * np.sin(2 * np.pi * 9 * tt(D)))
    th = mono(_thud(rng))
    out = np.zeros(N(D + 0.6)); out[:len(x)] += x; out[N(D - 0.05):N(D - 0.05) + len(th)] += th[:len(out) - N(D - 0.05)]
    return reverb(st(norm(out)), 0.7, 0.2)


@sfx('chisel')
def _chisel(rng, d=None):
    ping = sum(np.sin(2 * np.pi * f * tt(0.5)) * np.exp(-tt(0.5) / R(rng, 0.04, 0.12)) for f in (2300, 3420, 4810))
    chip = bp(noise(0.08, rng), 1500, 7000) * env_exp(0.08, 0.02)
    x = ping * 0.5; x[:len(chip)] += chip
    return reverb(st(norm(x) * 0.7, R(rng, -0.3, 0.3)), 0.7, 0.2)


@sfx('bone_crack')
def _crack(rng, d=None):
    x = np.zeros(N(0.5))
    for i in range(5):
        p = N(R(rng, 0, 0.08)); c = hp(noise(0.006, rng), 1500) * R(rng, 0.6, 1.4); x[p:p + len(c)] += c
    x += 0.6 * sine(glide(140, 60, 0.5), 0.5) * env_exp(0.5, 0.06)
    return reverb(st(norm(x)), 0.5, 0.15)


@sfx('sword_shing')
def _shing(rng, d=None):
    D = 1.6
    ring = sum(g * np.sin(2 * np.pi * f * tt(D)) * np.exp(-tt(D) / dec) for f, g, dec in ((2650, 1, 0.8), (3720, 0.6, 0.6), (5110, 0.4, 0.4), (7350, 0.25, 0.3)))
    sw = mono(whoosh_core(rng, 0.25, 1500, 7000, 4000))
    x = ring * 0.4; x[:len(sw)] += sw * 0.8
    return reverb(st(norm(x), 0, 0.5), 1.4, 0.3)


@sfx('pot_break')
def _potbreak(rng, d=None):
    out = np.zeros((N(1.0), 2))
    mix_into(out, _thud(rng) * 0.6, 0)
    for _ in range(20):
        f = R(rng, 1500, 6000)
        x = sum(np.sin(2 * np.pi * f * m * tt(0.15)) * np.exp(-tt(0.15) / 0.03) for m in (1, 1.6))
        mix_into(out, st(x * R(rng, 0.2, 0.6), R(rng, -0.7, 0.7)), N(R(rng, 0, 0.4)))
    mix_into(out, st(bp(noise(0.3, rng), 1000, 7000) * env_exp(0.3, 0.06) * 0.6), 0)
    return reverb(norm(out) * 0.7, 0.6, 0.2)


@sfx('creak')
def _creak(rng, d=None):
    D = 1.2
    rate = glide(28, 55, D)
    ph = np.cumsum(rate) / SR
    pulses = (np.diff(np.floor(ph), prepend=0) > 0).astype(float)
    x = bp(pulses + 0.05 * noise(D, rng), 300, 1500)
    x = peak(x, 650, 5, 12)
    return reverb(st(norm(x * adsr(D, 0.1, 0.2, 0.9, 0.2)) * 0.7), 0.6, 0.2)


@sfx('gavel')
def _gavel(rng, d=None):
    out = np.zeros(N(1.0))
    for c0 in (0, 0.28):
        x = padd(sine(R(rng, 380, 420), 0.15) * env_exp(0.15, 0.03), 0.6 * bp(noise(0.05, rng), 1000, 4000) * env_exp(0.05, 0.01))
        out[N(c0):N(c0) + len(x)] += x
    return reverb(st(norm(out)), 1.2, 0.3)


@sfx('gong')
def _gong(rng, d=None):
    D = 4.5
    f = 98
    x = sum(g * np.sin(2 * np.pi * f * m * tt(D) + R(rng, 0, 6)) * np.exp(-tt(D) / dec) for m, g, dec in ((1, 1, 2.5), (1.52, 0.7, 2.0), (2.23, 0.5, 1.5), (2.87, 0.4, 1.2), (3.94, 0.3, 0.9), (5.1, 0.2, 0.6)))
    x *= np.minimum(1, tt(D) / 0.05)
    return reverb(st(norm(x) * 0.8, 0, 0.4), 2.5, 0.3)


@sfx('bells')
def _bells(rng, d=None):
    out = np.zeros(N(3.0))
    for i, f in enumerate((659.3, 523.3, 784, 659.3)):
        x = sum(g * np.sin(2 * np.pi * f * m * tt(1.8)) * np.exp(-tt(1.8) / dec) for m, g, dec in ((1, 1, 1.2), (2.0, 0.5, 0.8), (2.4, 0.4, 0.6), (3.0, 0.3, 0.4), (4.2, 0.2, 0.3)))
        out[N(i * 0.32):N(i * 0.32) + len(x)] += x[:len(out) - N(i * 0.32)]
    return reverb(st(norm(out) * 0.7, 0, 0.4), 2.0, 0.35)


@sfx('oink')
def _oink(rng, d=None):
    out = np.zeros(N(0.8))
    for c0 in (0, 0.32):
        L = 0.22
        src = (np.sign(np.sin(2 * np.pi * glide(95, 120, L) * tt(L))) * 0.5 + noise(L, rng) * 0.6)
        x = (bp(src, 450, 800) + 0.6 * bp(src, 1000, 1500)) * adsr(L, 0.01, 0.05, 0.8, 0.06)
        out[N(c0):N(c0) + len(x)] += x
    return reverb(st(norm(out) * 0.8), 0.5, 0.15)


@sfx('quack')
def _quack(rng, d=None):
    out = np.zeros(N(0.7))
    for c0 in (0, 0.3):
        L = 0.2
        x = np.tanh(2 * saw(glide(380, 300, L), L))
        x = peak(bp(x, 500, 3500), 1100, 2, 10) * adsr(L, 0.01, 0.05, 0.8, 0.05)
        out[N(c0):N(c0) + len(x)] += x
    return st(norm(out) * 0.7)


@sfx('coo')
def _coo(rng, d=None):
    out = np.zeros(N(1.0))
    for c0 in (0, 0.4):
        L = 0.32
        x = formant_voice(glide(420, 360, L), L, 'u', 0.1, rng) * bell_curve(L, 0.4, 0.3)
        out[N(c0):N(c0) + len(x)] += x
    return reverb(st(norm(out) * 0.6), 0.5, 0.15)


@sfx('heartbeat')
def _heart(rng, d=None):
    D = d or 6.0
    out = np.zeros(N(D))
    t = 0.0
    while t < D - 0.5:
        for k, g in ((0, 1.0), (0.24, 0.7)):
            x = sine(glide(62, 40, 0.14), 0.14) * env_exp(0.14, 0.045) * g
            out[N(t + k):N(t + k) + len(x)] += x
        t += 0.86
    return st(norm(np.tanh(1.5 * out)) * 0.9)


@sfx('pin_drop')
def _pin(rng, d=None):
    out = np.zeros((N(1.0), 2))
    mix_into(out, _fall(rng) * 0.4, 0)
    mix_into(out, _thud(rng) * 0.5, N(0.45))
    mix_into(out, _ding(rng) * 0.3, N(0.47))
    return out


@sfx('counter')
def _counter(rng, d=None):
    D = (d or 1.0)
    out = np.zeros(N(D + 0.1))
    t, iv = 0.0, 0.03
    while t < D:
        c = sine(2400, 0.012) * env_exp(0.012, 0.003)
        out[N(t):N(t) + len(c)] += c
        t += iv; iv *= 1.04
    return st(out * 0.4)


@sfx('waves')
def _waves(rng, d=None):
    D = d or 5.0
    x = lp(noise(D, rng), 1500) * (0.4 + 0.6 * np.sin(np.pi * ((tt(D) / 2.5) % 1)) ** 2)
    return st(norm(x) * 0.5, 0, 0.7)


@sfx('crickets')
def _crickets(rng, d=None):
    D = d or 3.0
    out = np.zeros((N(D), 2))
    for _ in range(int(D * 2)):
        f = R(rng, 4200, 5200)
        p0 = R(rng, 0, D - 0.4)
        pan = R(rng, -0.8, 0.8)
        for k in range(3):
            x = sine(f, 0.03) * np.hanning(N(0.03))
            mix_into(out, st(x * 0.2, pan), N(p0 + k * 0.05))
    return reverb(out, 0.8, 0.3)

"""Procedurally designed SFX library. Every function returns a stereo float array at 48 kHz."""
import numpy as np
from dsp import *

R = np.random.default_rng(11)
S = {}


def sfx(name):
    def deco(f):
        S[name] = f
        return f
    return deco


def mono_hit(x, pan=0.0, width=0.3):
    return stereo(x, pan, width)


# ------------------------------------------------------------------ transitions
def _whoosh(dur=0.55, f0=250, f1=2600, q=1.6, pan=(-0.6, 0.6), sub=0.0):
    n = noise(dur, 'pink', R)
    y = sweep_bp(n, f0, f1, q)
    t = np.linspace(0, 1, len(y)); e = np.sin(np.pi * t ** 0.8) ** 2
    y = y * e
    if sub:
        y += sub * np.sin(2 * np.pi * np.cumsum(glide(90, 40, dur)) / SR) * e
    return fade(pan_sweep(norm(y, 0.8), *pan), 0.01, 0.05)


@sfx('whoosh')
def _(d=None): return _whoosh()
@sfx('whoosh_small')
def _(d=None): return _whoosh(0.32, 500, 3000) * 0.7
@sfx('whoosh_big')
def _(d=None): return reverb(_whoosh(0.9, 150, 2200, 1.3, (-0.8, 0.8), sub=0.6), 0.25, 1.4, 0.45)
@sfx('whoosh_low')
def _(d=None): return _whoosh(0.8, 90, 700, 1.4, (0.4, -0.4), sub=0.3)
@sfx('zoom_whoosh')
def _(d=None): return _whoosh(0.32, 400, 5000, 2.2, (0, 0))
@sfx('ghost_whoosh')
def _(d=None):
    w = _whoosh(1.0, 300, 1800, 2.0, (-0.3, 0.3))
    tone = osc(glide(700, 1400, 1.0), 1.0) * np.sin(np.pi * np.linspace(0, 1, int(SR))) * 0.15
    return reverb(w + stereo(tone, 0, 0.5), 0.45, 2.0, 0.7)
@sfx('floor_tick')
def _(d=None): return reverb(stereo(norm(bell(1568, 0.6, 0.4), 0.3)), 0.2, 0.8, 0.25)
@sfx('whoosh_hit')
def _(d=None):
    w = _whoosh(0.45, 300, 3000, 1.8, (-0.5, 0.3)); k = stereo(osc(glide(120, 45, 0.25), 0.5) * env_exp(0.5, 0.12) + 0.4 * lp(noise(0.5, 'white', R), 3000) * env_exp(0.5, 0.02))
    out = np.zeros((int(1.0 * SR), 2)); place(out, w, 0); place(out, k * 0.8, 0.38)
    return reverb(out, 0.2, 1.0, 0.3)
@sfx('flip')
def _(d=None): return mix(_whoosh(0.18, 800, 4000, 2, (0.3, -0.3)) * 0.6, S['tick']() * 0.5)


# ------------------------------------------------------------------ UI
@sfx('pop')
def _(d=None):
    x = osc(glide(950, 420, 0.07), 0.09) * env_exp(0.09, 0.03, 0.001)
    x += 0.3 * hp(noise(0.09, 'white', R), 3000) * env_exp(0.09, 0.006)
    return stereo(norm(x, 0.7), 0, 0.2)
@sfx('pop_word')
def _(d=None):
    x = osc(glide(620, 300, 0.1), 0.13) * env_exp(0.13, 0.045, 0.001) + 0.4 * osc(glide(1240, 600, 0.1), 0.13) * env_exp(0.13, 0.02)
    return reverb(stereo(norm(x, 0.7)), 0.12, 0.5, 0.15)
@sfx('tick')
def _(d=None):
    x = osc(2600, 0.03) * env_exp(0.03, 0.006) + 0.3 * hp(noise(0.03, 'white', R), 5000) * env_exp(0.03, 0.003)
    return stereo(norm(x, 0.5))
@sfx('soft_tick')
def _(d=None):
    x = osc(1600, 0.06) * env_exp(0.06, 0.015)
    return reverb(stereo(norm(x, 0.5)), 0.2, 0.6, 0.2)
@sfx('click')
def _(d=None):
    x = hp(noise(0.02, 'white', R), 1500) * env_exp(0.02, 0.002) + 0.5 * osc(1800, 0.02) * env_exp(0.02, 0.004)
    return stereo(norm(x, 0.7))
@sfx('counter_roll')
def _(d=None):
    out = np.zeros(int(1.2 * SR))
    t = 0.0; k = 0
    while t < 1.1:
        tk = S['tick']()[:, 0] * (0.5 + 0.5 * (1 - t / 1.1)); place(out, tk, t); t += 0.025 + 0.12 * (t / 1.1) ** 2; k += 1
    return stereo(out, 0, 0.2)
@sfx('ding_correct')
def _(d=None):
    a = fm(note(84), 2.0, 1.5, 0.9, 0.2, 0.35); b = fm(note(88), 2.0, 1.5, 0.9, 0.2, 0.45)
    out = np.zeros(int(1.2 * SR)); place(out, a, 0); place(out, b, 0.11)
    return reverb(stereo(norm(out, 0.6)), 0.2, 1.0, 0.3)
@sfx('rec_beep')
def _(d=None):
    out = np.zeros(int(0.5 * SR)); b = osc(2000, 0.08) * env_adsr(0.08, 0.002, 0.01, 0.9, 0.01)
    place(out, b, 0); place(out, b, 0.15)
    return stereo(out * 0.4)
@sfx('computer_beeps')
def _(d=None):
    out = np.zeros(int(1.8 * SR))
    for i in range(9):
        f = R.choice([880, 1175, 1320, 1568, 1760]); b = lp(osc(f, 0.07, 'square'), 4000) * env_adsr(0.07, 0.002, 0.02, 0.6, 0.02)
        place(out, b * 0.25, i * 0.17 + R.uniform(0, 0.03))
    return stereo(out, 0, 0.3)
@sfx('error_buzz')
def _(d=None):
    x = lp(osc(110, 0.45, 'square') + 0.5 * osc(116, 0.45, 'square'), 1800) * env_adsr(0.45, 0.005, 0.05, 0.8, 0.08)
    return stereo(norm(x, 0.5))


# ------------------------------------------------------------------ elevator
def bell(f, dur=2.2, bright=1.0):
    parts = [(1.0, 1.0, dur), (2.0, 0.45, dur * 0.6), (2.76, 0.35 * bright, dur * 0.4), (5.4, 0.18 * bright, dur * 0.2), (8.93, 0.08 * bright, dur * 0.12)]
    t = t_axis(dur); y = np.zeros_like(t)
    for r, a, d in parts:
        y += a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / (d * 0.35))
    return y * np.clip(t / 0.002, 0, 1)
@sfx('ding')
def _(d=None):
    out = np.zeros(int(2.6 * SR)); place(out, bell(1318.5), 0); place(out, bell(1046.5) * 0.9, 0.38)
    return reverb(stereo(norm(out, 0.7), 0, 0.3), 0.22, 1.2, 0.35)
@sfx('clock_chime')
def _(d=None): return reverb(stereo(norm(bell(784, 2.5, 0.6), 0.5)), 0.3, 1.5, 0.5)
@sfx('bell')
def _(d=None):
    out = np.zeros(int(1.4 * SR))
    for i in range(3): place(out, bell(2093, 1.0) * (0.8 - i * 0.2), i * 0.09)
    return reverb(stereo(norm(out, 0.5)), 0.2, 1.0, 0.3)
@sfx('door_slide')
def _(d=None):
    dur = 1.5; t = t_axis(dur)
    rumble = bp(noise(dur, 'brown', R), 80, 700) * 0.7
    whine = osc(220 + 15 * np.sin(2 * np.pi * 3 * t), dur, 'saw'); whine = lp(whine, 900) * 0.15
    roll = bp(noise(dur, 'white', R), 1500, 4000) * 0.05
    e = np.clip(t / 0.15, 0, 1) * np.clip((dur - 0.15 - t) / 0.3, 0, 1)
    y = (rumble + whine + roll) * e
    thud = np.zeros_like(t); th = osc(glide(110, 60, 0.15), 0.15) * env_exp(0.15, 0.05); place(thud, th * 0.6, dur - 0.2)
    return reverb(stereo(norm(y + thud, 0.7), 0, 0.4), 0.15, 0.7, 0.2, metallic=True)
@sfx('door_shut')
def _(d=None):
    x = osc(glide(95, 55, 0.25), 0.3) * env_exp(0.3, 0.07) + 0.3 * lp(noise(0.3, 'white', R), 1200) * env_exp(0.3, 0.02)
    return reverb(stereo(norm(x, 0.7)), 0.15, 0.6, 0.2, metallic=True)
@sfx('door_thunk')
def _(d=None):
    m = modal([182, 421, 866, 1390], [0.25, 0.15, 0.08, 0.05], [1, 0.6, 0.4, 0.2], 0.6, R)
    k = osc(glide(120, 50, 0.12), 0.6) * env_exp(0.6, 0.06)
    x = 0.6 * m + k + 0.3 * lp(noise(0.6, 'white', R), 2000) * env_exp(0.6, 0.01)
    return reverb(stereo(norm(sat(x, 1.5), 0.8)), 0.18, 0.8, 0.25, metallic=True)
@sfx('door_push')
def _(d=None): return mix(_whoosh(0.3, 300, 1500) * 0.4, S['click']() * 0.4)
@sfx('elev_start')
def _(d=None):
    dur = 1.6; t = t_axis(dur)
    k = osc(glide(80, 45, 0.3), dur) * env_exp(dur, 0.12)
    hum = (osc(glide(50, 62, dur), dur) * 0.5 + osc(glide(100, 124, dur), dur) * 0.3) * np.clip(t / 1.0, 0, 1)
    y = k + hum * 0.6 + 0.2 * lp(noise(dur, 'brown', R), 300) * np.clip(t / 0.8, 0, 1)
    return stereo(norm(y, 0.7), 0, 0.3)
@sfx('elev_hum')
def _(d=None):
    dur = d or 10; t = t_axis(dur)
    y = osc(62 + 0.8 * np.sin(2 * np.pi * 0.3 * t), dur) * 0.5 + osc(124, dur) * 0.22 + osc(186, dur) * 0.08
    y += 0.35 * lp(noise(dur, 'brown', R), 250) + 0.04 * bp(noise(dur, 'pink', R), 2000, 6000) * (1 + 0.3 * np.sin(2 * np.pi * 7 * t))
    return fade(stereo(norm(y, 0.6), 0, 0.5), 0.6, 0.3)
@sfx('impact_big')
def _(d=None):
    dur = 2.5
    m = modal([71, 143, 211, 389, 547, 812, 1250, 1733], [0.9, 0.7, 0.6, 0.45, 0.35, 0.25, 0.18, 0.12], [1, .8, .7, .55, .45, .3, .2, .12], dur, R, 0.01)
    sub = osc(glide(60, 32, 0.6), dur) * env_exp(dur, 0.35)
    crack = lp(noise(dur, 'white', R), 4000) * env_exp(dur, 0.03)
    x = sat(0.6 * m + 1.0 * sub + 0.7 * crack, 2.0)
    return reverb(stereo(norm(x, 0.95), 0, 0.5), 0.3, 1.8, 0.5, metallic=True)
@sfx('sub_boom')
def _(d=None):
    x = osc(glide(55, 28, 1.6), 1.8) * env_exp(1.8, 0.6, 0.005) + 0.2 * lp(noise(1.8, 'brown', R), 120) * env_exp(1.8, 0.5)
    return stereo(norm(x, 0.9))
@sfx('grind')
def _(d=None):
    dur = 2.6; t = t_axis(dur)
    base = noise(dur, 'pink', R)
    y = np.zeros_like(t)
    for f in [310, 470, 690, 1130]:
        fm_ = f * (1 + 0.08 * np.sin(2 * np.pi * (3 + R.uniform(0, 4)) * t + R.uniform(0, 6)))
        y += bp(base, f * 0.9, f * 1.1, 2) * 0.6
    scr = osc(1850 + 300 * np.sin(2 * np.pi * 5.3 * t) + 120 * np.sin(2 * np.pi * 37 * t), dur) * 0.12
    am = 0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 9 * t + 2 * np.sin(2 * np.pi * 1.3 * t)))
    e = np.clip(t / 0.2, 0, 1) * np.clip((dur - t) / 0.8, 0, 1)
    x = sat((y + scr) * am * e, 1.8)
    return reverb(stereo(norm(x, 0.8), 0, 0.5), 0.25, 1.2, 0.4, metallic=True)
@sfx('shudder')
def _(d=None):
    dur = 1.4; t = t_axis(dur)
    r = lp(noise(dur, 'brown', R), 180) * (0.6 + 0.4 * np.sin(2 * np.pi * 13 * t)) * env_adsr(dur, 0.05, 0.3, 0.6, 0.6)
    rat = np.zeros_like(t)
    for i in range(14):
        c = modal([900 + R.uniform(0, 900), 2100 + R.uniform(0, 900)], [0.03, 0.02], [1, 0.5], 0.06, R); place(rat, c * 0.15, R.uniform(0, dur - 0.1))
    return reverb(stereo(norm(r + rat, 0.8), 0, 0.5), 0.2, 1.0, 0.3, metallic=True)
@sfx('rumble')
def _(d=None):
    dur = d or 2.6; t = t_axis(dur)
    r = lp(noise(dur, 'brown', R), 140) * (0.7 + 0.3 * np.sin(2 * np.pi * 11 * t)) * env_adsr(dur, 0.1, 0.3, 0.7, 0.8)
    return stereo(norm(sat(r, 1.5), 0.8), 0, 0.5)
@sfx('flicker')
def _(d=None):
    dur = d or 4; t = t_axis(dur)
    buzz = lp(osc(120, dur, 'saw') + 0.5 * osc(240, dur, 'square'), 3000) * 0.3
    gate = (np.array([noise1_det(x * 14) for x in t]) > 0.1).astype(float)
    gate = lp(gate, 200, 2)
    zaps = np.zeros_like(t)
    edges = np.where(np.abs(np.diff(gate > 0.5)) > 0)[0]
    for e in edges[:40]:
        z = hp(noise(0.04, 'white', R), 2000) * env_exp(0.04, 0.008); place(zaps, z * 0.5, e / SR)
    y = buzz * gate * np.clip((dur - t) / 1.0, 0, 1) + zaps
    return stereo(norm(y, 0.6), 0, 0.3)
def noise1_det(x):
    i = np.floor(x); f = x - i; u = f * f * (3 - 2 * f)
    h = lambda n: (np.sin(n * 127.1 + 311.7) * 43758.5453123) % 1
    return ((1 - u) * h(i + 5 * 57.3) + u * h(i + 1 + 5 * 57.3)) * 2 - 1
@sfx('lights_on')
def _(d=None):
    out = np.zeros(int(1.6 * SR))
    for k, tt in enumerate([0.0, 0.12, 0.3]): place(out, modal([3100, 4700], [0.05, 0.03], [1, 0.5], 0.1, R) * (0.4 - 0.1 * k), tt)
    hum = osc(120, 1.3) * 0.08 * np.clip(t_axis(1.3) / 0.3, 0, 1) * np.clip((1.3 - t_axis(1.3)) / 0.6, 0, 1); place(out, hum, 0.3)
    return stereo(out, 0, 0.3)
@sfx('button')
def _(d=None):
    x = hp(noise(0.04, 'white', R), 1200) * env_exp(0.04, 0.004) * 0.6 + modal([2400, 3900], [0.012, 0.008], [1, 0.5], 0.04, R) * 0.5 + osc(glide(300, 150, 0.03), 0.04) * env_exp(0.04, 0.008) * 0.4
    return reverb(stereo(norm(x, 0.7)), 0.12, 0.4, 0.1, metallic=True)
@sfx('button_hard')
def _(d=None):
    out = np.zeros((int(0.25 * SR), 2)); place(out, S['button'](), 0); place(out, stereo(osc(glide(140, 60, 0.12), 0.2) * env_exp(0.2, 0.05)) * 0.7, 0)
    return out
@sfx('button_mash')
def _(d=None):
    dur = d or 2.5; out = np.zeros((int(dur * SR), 2)); t = 0.0
    while t < dur - 0.05:
        place(out, S['button']() * R.uniform(0.4, 0.9), t); t += R.uniform(0.05, 0.11)
    return out
@sfx('alarm_bell')
def _(d=None):
    dur = 1.0; t = t_axis(dur)
    b = bell(1480, dur, 1.2) + bell(1520, dur, 1.2)
    y = b * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 22 * t))) * np.clip((dur - t) / 0.2, 0, 1)
    return reverb(stereo(norm(y, 0.6)), 0.2, 0.8, 0.3, metallic=True)
@sfx('static')
def _(d=None):
    dur = d or 1.4; t = t_axis(dur)
    s = bp(noise(dur, 'white', R), 600, 4500) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 3.1 * t))) * 0.35
    cr = np.zeros_like(t)
    for i in range(int(dur * 40)):
        cr[R.integers(0, len(t))] += R.uniform(-1, 1)
    cr = bp(cr, 800, 6000) * 2
    y = (s + cr) * env_adsr(dur, 0.02, 0.1, 0.9, 0.3)
    return stereo(norm(y, 0.5), 0, 0.2)
@sfx('intercom_click')
def _(d=None):
    c = hp(noise(0.02, 'white', R), 800) * env_exp(0.02, 0.003)
    s = bp(noise(0.25, 'white', R), 600, 4000) * env_exp(0.25, 0.05) * 0.3
    out = np.zeros(int(0.3 * SR)); place(out, c, 0); place(out, s, 0.01)
    return stereo(norm(out, 0.6))
@sfx('fan_stop')
def _(d=None):
    dur = 2.6; t = t_axis(dur); rate = 38 * np.exp(-t / 0.9)
    y = osc(rate * 5, dur, 'tri') * 0.3 + bp(noise(dur, 'pink', R), 300, 1500) * (0.5 + 0.5 * np.sin(2 * np.pi * np.cumsum(rate) / SR)) * 0.4
    y *= np.exp(-t / 1.1)
    return stereo(norm(y, 0.5), 0.2, 0.3)
@sfx('cable_creak')
def _(d=None):
    dur = 1.4; t = t_axis(dur); f = 38 + 20 * np.sin(2 * np.pi * 0.7 * t) + 8 * R.standard_normal(len(t)).cumsum() / np.sqrt(len(t))
    y = bp(osc(f, dur, 'saw'), 300, 2500) * env_adsr(dur, 0.2, 0.3, 0.7, 0.4)
    return reverb(stereo(norm(y, 0.5)), 0.3, 1.2, 0.4, metallic=True)
@sfx('clamp')
def _(d=None):
    h = modal([260, 640, 1330, 2200], [0.3, 0.2, 0.1, 0.05], [1, .6, .4, .2], 1.0, R)
    hiss = bp(noise(1.0, 'white', R), 3000, 9000) * env_exp(1.0, 0.25) * 0.15
    k = osc(glide(140, 60, 0.15), 1.0) * env_exp(1.0, 0.06)
    return reverb(stereo(norm(sat(0.6 * h + k + hiss, 1.4), 0.8)), 0.2, 1.0, 0.3, metallic=True)
@sfx('wrench')
def _(d=None):
    dur = d or 3.0; out = np.zeros(int(dur * SR)); t = 0.0
    while t < dur - 0.3:
        for k in range(6):
            c = modal([2800 + R.uniform(-200, 200), 4600], [0.01, 0.006], [1, 0.4], 0.03, R); place(out, c * 0.4, t + k * 0.035)
        t += R.uniform(0.45, 0.8)
    return reverb(stereo(out, 0.3, 0.3), 0.3, 1.2, 0.4, metallic=True)


# ------------------------------------------------------------------ body / foley
@sfx('step')
def _(d=None):
    x = osc(glide(110, 70, 0.06), 0.09) * env_exp(0.09, 0.02) + 0.5 * bp(noise(0.09, 'white', R), 400, 2500) * env_exp(0.09, 0.012)
    return stereo(norm(x, 0.5), R.uniform(-0.2, 0.2))
@sfx('step_run')
def _(d=None):
    x = osc(glide(130, 70, 0.05), 0.08) * env_exp(0.08, 0.015) + 0.7 * bp(noise(0.08, 'white', R), 800, 4000) * env_exp(0.08, 0.008)
    return stereo(norm(x, 0.6), R.uniform(-0.2, 0.2))
@sfx('step_stair')
def _(d=None): return reverb(S['step']() * 1.1, 0.25, 1.0, 0.35)
@sfx('stumble')
def _(d=None):
    out = np.zeros((int(0.7 * SR), 2)); place(out, S['step_run'](), 0); place(out, S['step_run']() * 0.8, 0.13); place(out, S['step'](), 0.3)
    sc = bp(noise(0.35, 'pink', R), 600, 3000) * env_adsr(0.35, 0.02, 0.1, 0.5, 0.15) * 0.3; place(out, stereo(sc), 0.32)
    return out
@sfx('pant')
def _(d=None):
    dur = 2.2; out = np.zeros(int(dur * SR))
    for i in range(6):
        b = bp(noise(0.28, 'pink', R), 700, 2600) * np.sin(np.pi * np.linspace(0, 1, int(0.28 * SR))) ** 2 * (0.6 if i % 2 else 0.4); place(out, b, i * 0.36)
    return stereo(norm(out, 0.35), 0, 0.3)
@sfx('breath_in')
def _(d=None):
    dur = 0.9; e = np.linspace(0, 1, int(dur * SR)) ** 1.5 * np.clip((dur - t_axis(dur)) / 0.1, 0, 1)
    return stereo(norm(bp(noise(dur, 'pink', R), 900, 3000) * e, 0.3), 0, 0.3)
@sfx('breath_fast')
def _(d=None):
    out = np.zeros(int(0.5 * SR))
    for k, (l, a) in enumerate([(0.18, 0.5), (0.2, 0.35)]):
        b = bp(noise(l, 'pink', R), 900 + 500 * k, 3000) * np.sin(np.pi * np.linspace(0, 1, int(l * SR))) ** 2 * a; place(out, b, k * 0.22)
    return stereo(norm(out, 0.3), 0, 0.3)
@sfx('gasp')
def _(d=None):
    dur = 0.45; e = np.sin(np.pi * np.clip(np.linspace(0, 1.4, int(dur * SR)), 0, 1)) ** 0.6
    y = bp(noise(dur, 'pink', R), 1000, 3500) * e
    return stereo(norm(y, 0.4), 0, 0.4)
@sfx('cloth')
def _(d=None):
    dur = 0.35; y = bp(noise(dur, 'pink', R), 1200, 6000) * env_adsr(dur, 0.03, 0.1, 0.5, 0.15) * (0.6 + 0.4 * np.abs(noise(dur, 'white', R)) ** 0.5)
    return stereo(norm(y, 0.35), R.uniform(-0.3, 0.3), 0.3)
@sfx('slide_wall')
def _(d=None):
    dur = 1.2; y = lp(noise(dur, 'pink', R), 1800) * env_adsr(dur, 0.1, 0.3, 0.6, 0.4)
    return stereo(norm(y, 0.35), 0.2, 0.3)
@sfx('scoot')
def _(d=None): return S['slide_wall']()[: int(0.8 * SR)] * 0.9
@sfx('sit_thud')
def _(d=None):
    x = osc(glide(90, 50, 0.12), 0.25) * env_exp(0.25, 0.05) + 0.3 * lp(noise(0.25, 'pink', R), 900) * env_exp(0.25, 0.03)
    return stereo(norm(x, 0.5))
@sfx('grab')
def _(d=None):
    x = bp(noise(0.12, 'pink', R), 500, 4000) * env_exp(0.12, 0.02) + osc(glide(140, 80, 0.08), 0.12) * env_exp(0.12, 0.03) * 0.5
    return reverb(stereo(norm(x, 0.5)), 0.15, 0.6, 0.2)
@sfx('heartbeat')
def _(d=None):
    out = np.zeros(int(0.6 * SR))
    for k, (f, a) in enumerate([(58, 1.0), (50, 0.75)]):
        b = osc(glide(f * 1.6, f, 0.09), 0.18) * env_exp(0.18, 0.05, 0.004) * a; place(out, b, k * 0.17)
    y = lp(sat(out, 1.6), 220)
    return stereo(norm(y, 0.9))
@sfx('stomach_growl')
def _(d=None):
    dur = 2.2; t = t_axis(dur)
    f0 = 70 + 25 * np.sin(2 * np.pi * 0.8 * t) + 18 * np.sin(2 * np.pi * 2.7 * t + 1) + 12 * noise1_det(t * 6)
    src = osc(f0, dur, 'saw')
    y = bp(src, 120, 520, 2) * 0.9 + bp(src, 600, 900, 2) * 0.25
    am = 0.55 + 0.45 * np.abs(np.sin(2 * np.pi * (3 + 2 * np.sin(2 * np.pi * 0.5 * t)) * t))
    bub = np.zeros_like(t)
    for i in range(18):
        f = R.uniform(180, 650); b = osc(glide(f, f * 1.5, 0.05), 0.06) * env_exp(0.06, 0.015); place(bub, b * R.uniform(0.2, 0.5), R.uniform(0.1, dur - 0.2))
    y = (y * am + bub) * env_adsr(dur, 0.15, 0.4, 0.8, 0.6)
    return reverb(stereo(norm(sat(y, 1.3), 0.85), 0, 0.3), 0.18, 0.8, 0.25, metallic=True)
@sfx('stomach_growl2')
def _(d=None): return S['stomach_growl']()[: int(1.4 * SR)] * np.linspace(1, 0.3, int(1.4 * SR))[:, None] * 0.8
@sfx('echo_growl')
def _(d=None):
    g = S['stomach_growl']()
    out = np.zeros((len(g) + int(1.5 * SR), 2))
    for k, (dl, a) in enumerate([(0.0, 0.35), (0.28, 0.25), (0.55, 0.16), (0.85, 0.1)]):
        place(out, lp(g, 1800 - k * 300) * a, dl)
    return reverb(out, 0.4, 1.6, 0.6, metallic=True)
@sfx('whale')
def _(d=None):
    dur = 2.2; t = t_axis(dur)
    f = np.interp(t, [0, 0.6, 1.3, 2.2], [190, 420, 300, 150]) * (1 + 0.01 * np.sin(2 * np.pi * 5.5 * t))
    y = osc(f, dur) + 0.4 * osc(f * 2, dur) + 0.15 * osc(f * 3.02, dur)
    y = lp(y, 1600) * env_adsr(dur, 0.25, 0.3, 0.8, 0.7)
    return reverb(stereo(norm(y, 0.6), 0, 0.5), 0.45, 2.5, 0.9)


# ------------------------------------------------------------------ props
@sfx('typing')
def _(d=None):
    dur = d or 1.6; out = np.zeros(int(dur * SR)); t = 0.0
    while t < dur - 0.05:
        f = R.uniform(2000, 4200); k = modal([f, f * 1.7], [0.008, 0.005], [1, 0.4], 0.03, R) * 0.5 + bp(noise(0.03, 'white', R), 1500, 7000) * env_exp(0.03, 0.004) * 0.6
        k += osc(glide(260, 180, 0.02), 0.03) * env_exp(0.03, 0.006) * 0.35
        place(out, k * R.uniform(0.6, 1), t); t += R.uniform(0.06, 0.15)
        if R.uniform() < 0.08: t += 0.15
    return reverb(stereo(out, 0.1, 0.3), 0.12, 0.5, 0.15)
@sfx('phone_typing')
def _(d=None):
    dur = d or 2; out = np.zeros(int(dur * SR)); t = 0.0
    while t < dur - 0.04:
        k = osc(glide(180, 140, 0.015), 0.02) * env_exp(0.02, 0.005) * 0.6 + hp(noise(0.02, 'white', R), 3000) * env_exp(0.02, 0.002) * 0.3
        place(out, k, t); t += R.uniform(0.09, 0.16)
    return stereo(out * 0.8, 0.2)
@sfx('phone_buzz')
def _(d=None):
    out = np.zeros(int(0.9 * SR))
    for k in range(2):
        dur = 0.32; t = t_axis(dur); b = lp(osc(165, dur, 'square'), 600) * (0.7 + 0.3 * np.sign(np.sin(2 * np.pi * 30 * t))) * env_adsr(dur, 0.01, 0.05, 0.9, 0.04)
        place(out, b, k * 0.42)
    return stereo(norm(out, 0.6), 0.2, 0.2)
@sfx('msg_pop')
def _(d=None):
    out = np.zeros(int(0.5 * SR)); place(out, fm(1318.5, 1.0, 0.8, 0.25, 0.05, 0.08), 0); place(out, fm(1760, 1.0, 0.8, 0.3, 0.05, 0.1), 0.07)
    return reverb(stereo(norm(out, 0.55), 0.15), 0.15, 0.6, 0.2)
@sfx('msg_send')
def _(d=None):
    w = _whoosh(0.22, 800, 5000, 2.2, (-0.2, 0.4)) * 0.5
    p = np.zeros((int(0.4 * SR), 2)); place(p, w, 0); place(p, stereo(fm(1046, 1.0, 0.6, 0.2, 0.05, 0.06) * 0.4), 0.16)
    return p
@sfx('low_battery')
def _(d=None):
    out = np.zeros(int(0.7 * SR)); place(out, osc(880, 0.12) * env_adsr(0.12, 0.005, 0.02, 0.7, 0.03), 0); place(out, osc(659, 0.2) * env_adsr(0.2, 0.005, 0.02, 0.7, 0.05), 0.16)
    return stereo(out * 0.35, 0.15)
@sfx('power_down')
def _(d=None):
    dur = 0.9; t = t_axis(dur)
    y = osc(glide(900, 70, dur), dur, 'tri') * np.exp(-t / 0.35)
    y = sweep_lp(y, 6000, 200)
    c = np.zeros_like(t); place(c, hp(noise(0.015, 'white', R), 1000), dur - 0.1)
    return stereo(norm(y + c * 0.3, 0.55), 0.1)
def sweep_lp(y, f0, f1, steps=24):
    out = np.zeros_like(y); n = len(y); hop = n // steps
    for k in range(steps):
        a, b = k * hop, n if k == steps - 1 else (k + 1) * hop
        out[a:b] = lp(y, f0 * (f1 / f0) ** (k / steps), 2)[a:b]
    return out
@sfx('zipper')
def _(d=None):
    dur = 0.65; out = np.zeros(int(dur * SR)); t = 0.0; k = 0
    while t < dur - 0.01:
        f = 2500 + 3000 * (t / dur); c = modal([f], [0.003], [1], 0.008, R) + hp(noise(0.008, 'white', R), 3000) * 0.5
        place(out, c * 0.5, t); t += 0.011 + 0.004 * R.uniform()
    return stereo(norm(out, 0.45), -0.1, 0.2)
@sfx('wrapper')
def _(d=None):
    dur = 0.9; out = np.zeros(int(dur * SR))
    for i in range(70):
        l = R.uniform(0.003, 0.02); c = hp(noise(l, 'white', R), 2500) * env_exp(l, l / 3); place(out, c * R.uniform(0.2, 1), R.uniform(0, dur - 0.03))
    return stereo(norm(out, 0.4), 0.1, 0.4)
@sfx('snap')
def _(d=None):
    c = hp(noise(0.05, 'white', R), 1500) * env_exp(0.05, 0.006) + modal([620, 1500], [0.03, 0.015], [1, 0.5], 0.05, R) * 0.4
    return reverb(stereo(norm(c, 0.6)), 0.12, 0.5, 0.15)
@sfx('crunch')
def _(d=None):
    out = np.zeros(int(0.5 * SR))
    for i in range(10):
        l = R.uniform(0.005, 0.03); c = bp(noise(l, 'white', R), 1500, 7000) * env_exp(l, l / 3); place(out, c * R.uniform(0.3, 1), R.uniform(0, 0.4))
    return stereo(norm(out, 0.35))
@sfx('cardboard_crash')
def _(d=None):
    dur = 1.8; out = np.zeros(int(dur * SR))
    for i in range(15):
        f = R.uniform(140, 380); k = modal([f, f * 2.3, f * 4.1], [0.06, 0.03, 0.015], [1, 0.5, 0.25], 0.15, R) + bp(noise(0.15, 'pink', R), 300, 3000) * env_exp(0.15, 0.02) * 0.8
        place(out, k * R.uniform(0.4, 1.0), 0.05 + (i / 15) ** 1.3 * 1.3 + R.uniform(0, 0.06))
    return reverb(stereo(norm(out, 0.75), 0, 0.6), 0.2, 1.0, 0.3)
@sfx('guitar_bad')
def _(d=None): return _strum([40, 45, 50, 55, 59, 64], detune=0.35, buzz=0.2)
@sfx('guitar_bad2')
def _(d=None): return _strum([41, 46, 49, 56, 58, 65], detune=0.6, buzz=0.35)
@sfx('guitar_bad3')
def _(d=None):
    a = _strum([40, 47, 51, 54, 61, 63], detune=0.8, buzz=0.5); b = _strum([42, 44, 51, 53, 60, 66], detune=0.9, buzz=0.5)
    out = np.zeros((max(len(a), len(b)) + int(0.4 * SR), 2)); place(out, a, 0); place(out, b * 0.9, 0.35)
    return out
def _strum(notes, detune=0.3, buzz=0.2):
    dur = 2.0; out = np.zeros(int(dur * SR))
    for i, n in enumerate(notes):
        f = note(n + 12 + R.uniform(-detune, detune))
        s = ks_fast(f, dur - i * 0.02, 0.9965, 0.6, R)
        s = s + buzz * np.sign(s) * np.abs(s) ** 0.5 * 0.3
        place(out, s * 0.4, i * 0.025)
    out = lp(out, 5000) * np.clip((dur - t_axis(dur)) / 0.6, 0, 1)
    return reverb(stereo(norm(out, 0.55), -0.15, 0.3), 0.2, 1.0, 0.35)
@sfx('cat_yowl')
def _(d=None): return _meow(1.1, [520, 820, 760, 420])
@sfx('cat_meow')
def _(d=None): return _meow(0.6, [600, 900, 520]) * 0.8
def _meow(dur, curve):
    t = t_axis(dur); f0 = np.interp(t, np.linspace(0, dur, len(curve)), curve) * (1 + 0.02 * np.sin(2 * np.pi * 6 * t))
    src = osc(f0, dur, 'saw')
    f1 = np.interp(t, [0, dur * 0.3, dur], [500, 1200, 700])
    y = np.zeros_like(t)
    for k in range(12):
        a, b = int(k * len(t) / 12), int((k + 1) * len(t) / 12)
        fc = f1[(a + b) // 2]
        y[a:b] = (bp(src, fc * 0.7, fc * 1.3, 2) + 0.5 * bp(src, 2600, 3400, 2))[a:b]
    y *= env_adsr(dur, 0.05, 0.1, 0.9, 0.25)
    return reverb(stereo(norm(y, 0.45), 0.2), 0.2, 0.8, 0.3)


# ------------------------------------------------------------------ cartoon / comedy
@sfx('boing')
def _(d=None):
    dur = 0.6; t = t_axis(dur); f = 240 + 140 * np.sin(2 * np.pi * 14 * t) * np.exp(-t / 0.25) + 160 * t
    return stereo(norm(osc(f, dur) * env_exp(dur, 0.25), 0.5))
@sfx('slide_down')
def _(d=None):
    dur = 1.1; f = glide(1300, 280, dur) * (1 + 0.015 * np.sin(2 * np.pi * 7 * t_axis(dur)))
    return stereo(norm(osc(f, dur) * env_adsr(dur, 0.03, 0.1, 0.8, 0.2), 0.4))
@sfx('cartoon_stretch')
def _(d=None):
    dur = 0.6; f = glide(300, 1500, dur); return stereo(norm(osc(f, dur) * env_adsr(dur, 0.02, 0.1, 0.8, 0.1), 0.4))
@sfx('cartoon_shrink')
def _(d=None):
    dur = 0.4; f = glide(1400, 250, dur); x = osc(f, dur) * env_adsr(dur, 0.01, 0.1, 0.8, 0.05)
    out = np.zeros(int(0.55 * SR)); place(out, x, 0); place(out, S['pop']()[:, 0] * 0.6, 0.4)
    return stereo(norm(out, 0.4))
@sfx('blink')
def _(d=None): return reverb(stereo(norm(modal([3300, 5200], [0.08, 0.04], [1, 0.4], 0.25, R), 0.25)), 0.2, 0.6, 0.2)
@sfx('record_scratch')
def _(d=None):
    dur = 0.45; t = t_axis(dur)
    sp = np.interp(t, [0, 0.12, 0.2, 0.32, 0.45], [1, -1.6, 1.8, -0.8, 0.2])
    ph = np.cumsum(np.abs(sp)) / SR
    tone = np.sin(2 * np.pi * 300 * ph * 3) + 0.5 * np.sin(2 * np.pi * 770 * ph * 3)
    nz = bp(noise(dur, 'white', R), 500, 5000) * (np.abs(sp) / 2) * 0.7
    y = (tone * 0.4 * np.abs(sp) + nz) * env_adsr(dur, 0.005, 0.1, 0.9, 0.08)
    return stereo(norm(y, 0.6))
@sfx('sad_trombone')
def _(d=None):
    out = np.zeros(int(2.4 * SR))
    for k, (n, l) in enumerate([(55, 0.35), (54, 0.35), (53, 0.35), (52, 1.1)]):
        t = t_axis(l); f = note(n - 12) * (1 + (0.02 * np.sin(2 * np.pi * 5.5 * t) if l > 1 else 0))
        y = osc(f, l, 'saw'); y = sweep_lp(y, 400, 1600, 8) if l < 1 else lp(y, 900)
        place(out, y * env_adsr(l, 0.03, 0.05, 0.8, 0.12), k * 0.38)
    return reverb(stereo(norm(out, 0.45)), 0.2, 1.0, 0.3)
@sfx('fail_honk')
def _(d=None):
    out = np.zeros(int(0.7 * SR))
    for k, f in enumerate([370, 349]):
        l = 0.22; y = bp(osc(f, l, 'saw') + osc(f * 1.01, l, 'square') * 0.5, 300, 2200) * env_adsr(l, 0.01, 0.05, 0.8, 0.04); place(out, y, k * 0.26)
    return stereo(norm(sat(out, 2), 0.5))
@sfx('sad_drop')
def _(d=None):
    dur = 0.8; f = glide(500, 120, dur); y = osc(f, dur, 'tri') * env_adsr(dur, 0.01, 0.1, 0.8, 0.3)
    return reverb(stereo(norm(y, 0.4)), 0.25, 1.0, 0.4)
@sfx('crickets')
def _(d=None):
    dur = d or 2.5; t = t_axis(dur); out = np.zeros((len(t), 2))
    for c, (f, pan, off) in enumerate([(4600, -0.5, 0.0), (5100, 0.5, 0.35)]):
        y = np.zeros(len(t)); k = off
        while k < dur - 0.3:
            for j in range(3):
                l = 0.045; ch = osc(f, l) * (0.5 + 0.5 * np.sin(2 * np.pi * 45 * t_axis(l))) * np.sin(np.pi * np.linspace(0, 1, int(l * SR))); place(y, ch, k + j * 0.07)
            k += 0.75 + R.uniform(-0.1, 0.1)
        out += stereo(y * 0.25, pan)
    out += stereo(lp(noise(dur, 'pink', R), 900) * 0.02, 0, 0.5)
    return fade(out, 0.2, 0.4)
@sfx('clock_tick')
def _(d=None):
    x = modal([3200, 5400, 1800], [0.01, 0.006, 0.02], [1, 0.5, 0.4], 0.08, R) + hp(noise(0.08, 'white', R), 4000) * env_exp(0.08, 0.002)
    return reverb(stereo(norm(x, 0.5)), 0.2, 0.6, 0.2)
@sfx('clock_tick_slow')
def _(d=None):
    dur = d or 3; out = np.zeros((int(dur * SR), 2)); t = 0.0; k = 0
    while t < dur - 0.1: place(out, S['clock_tick']() * (0.8 if k % 2 else 0.55), t); t += 0.5; k += 1
    return out
@sfx('clock_fast')
def _(d=None):
    dur = 2.6; out = np.zeros((int(dur * SR), 2)); t = 0.0
    while t < dur - 0.1: place(out, S['clock_tick']() * 0.5, t); t += 0.09
    return fade(out, 0.05, 0.4)
@sfx('flatline')
def _(d=None):
    dur = 1.4; y = osc(1000, dur) * env_adsr(dur, 0.01, 0.05, 0.9, 0.3)
    return stereo(y * 0.25)
@sfx('tinnitus')
def _(d=None):
    dur = 2.2; y = osc(7200, dur) * env_adsr(dur, 0.4, 0.3, 0.6, 1.0) * 0.12 + osc(5100, dur) * env_adsr(dur, 0.6, 0.3, 0.5, 1.0) * 0.05
    return stereo(y)
@sfx('game_jump')
def _(d=None):
    dur = 0.25; y = lp(osc(glide(300, 900, dur), dur, 'square'), 6000) * env_adsr(dur, 0.005, 0.05, 0.7, 0.05)
    return stereo(y * 0.3)
@sfx('game_over')
def _(d=None):
    out = np.zeros(int(1.6 * SR))
    for k, n in enumerate([76, 72, 67, 64, 60]):
        l = 0.14 if k < 4 else 0.6; y = lp(osc(note(n), l, 'square'), 5000) * env_adsr(l, 0.005, 0.03, 0.7, 0.05); place(out, y, k * 0.16)
    return stereo(out * 0.3)
@sfx('gameshow')
def _(d=None):
    out = np.zeros(int(1.6 * SR))
    for k, n in enumerate([67, 72, 76]):
        l = 0.14; y = lp(osc(note(n), l, 'saw') + osc(note(n) * 1.005, l, 'square') * 0.5, 4000) * env_adsr(l, 0.005, 0.03, 0.8, 0.03); place(out, y, k * 0.13)
    for n in [72, 76, 79, 84]:
        l = 0.8; y = lp(osc(note(n), l, 'saw'), 3500) * env_adsr(l, 0.01, 0.1, 0.7, 0.4); place(out, y * 0.6, 0.42)
    return reverb(stereo(norm(out, 0.5), 0, 0.4), 0.2, 1.0, 0.3)
@sfx('movie_boom')
def _(d=None):
    dur = 2.0; t = t_axis(dur)
    y = sum(osc(note(n), dur, 'saw') for n in [26, 33, 38, 41])
    y = sweep_lp(y, 200, 1800, 16) * env_adsr(dur, 0.01, 0.4, 0.6, 1.0)
    return reverb(stereo(norm(sat(y, 1.5), 0.8), 0, 0.5), 0.3, 2.0, 0.7)


# ------------------------------------------------------------------ musical stings
def chord_stab(notes, dur=1.6, kind='saw', cutoff=3000, decay=0.4):
    t = t_axis(dur); y = sum(osc(note(n) * (1 + R.uniform(-0.003, 0.003)), dur, kind) for n in notes)
    return lp(y, cutoff) * env_exp(dur, decay, 0.004)
@sfx('sting_shock')
def _(d=None):
    y = chord_stab([57, 60, 64, 69, 72], 1.4, 'saw', 4500, 0.25) + 1.5 * osc(glide(90, 40, 0.3), 1.4) * env_exp(1.4, 0.15) + 0.5 * hp(noise(1.4, 'white', R), 2000) * env_exp(1.4, 0.05)
    return reverb(stereo(norm(y, 0.75), 0, 0.5), 0.3, 1.6, 0.5)
@sfx('sting_low')
def _(d=None):
    y = chord_stab([33, 40, 45], 1.8, 'saw', 900, 0.6) + osc(glide(70, 40, 0.5), 1.8) * env_exp(1.8, 0.4)
    return reverb(stereo(norm(y, 0.7), 0, 0.4), 0.3, 1.8, 0.6)
@sfx('sting_dun')
def _(d=None):
    out = np.zeros(int(3.0 * SR))
    for k, (ns, l, at) in enumerate([([38, 45, 50], 0.25, 0.0), ([38, 45, 50], 0.25, 0.3), ([37, 44, 49], 1.8, 0.62)]):
        y = chord_stab(ns, l + 0.4, 'saw', 1400, l * 0.8) + 1.2 * osc(glide(85, 45, 0.25), l + 0.4) * env_exp(l + 0.4, 0.15)
        place(out, y, at)
    return reverb(stereo(norm(out, 0.8), 0, 0.5), 0.3, 1.8, 0.6)
@sfx('sting_soft')
def _(d=None):
    dur = 2.4; y = sum(fm(note(n), 1.0, 1.2, dur, 0.4, 0.9) for n in [57, 60, 64]) * env_adsr(dur, 0.02, 0.2, 0.8, 1.0)
    return reverb(stereo(norm(y, 0.5), 0, 0.4), 0.4, 2.2, 0.8)
@sfx('suspense_hit')
def _(d=None):
    dur = 2.2; t = t_axis(dur)
    low = osc(glide(65, 45, 0.4), dur) * env_exp(dur, 0.5)
    hi = (osc(note(88), dur, 'saw') + osc(note(89), dur, 'saw')) * (0.5 + 0.5 * np.sin(2 * np.pi * 12 * t)) * env_adsr(dur, 0.05, 0.3, 0.5, 1.2) * 0.12
    return reverb(stereo(norm(low + lp(hi, 6000), 0.6), 0, 0.5), 0.35, 2.0, 0.7)
@sfx('drone_hit')
def _(d=None):
    dur = 2.8; y = sum(osc(note(n), dur, 'saw') for n in [33, 40, 44.5]) ; y = lp(y, 700) * env_adsr(dur, 0.4, 0.4, 0.7, 1.2)
    return reverb(stereo(norm(y, 0.6), 0, 0.6), 0.35, 2.0, 0.8)
def _riser(dur, f0, f1, dark=False):
    t = t_axis(dur)
    n = sweep_bp(noise(dur, 'pink', R), f0 * 2, f1 * 3, 1.5)
    tone = osc(glide(f0, f1, dur), dur, 'saw') * 0.25 + osc(glide(f0 * 1.5, f1 * 1.5, dur), dur, 'saw') * 0.15
    tone = lp(tone, 3000 if not dark else 1200)
    e = (t / dur) ** 2.2
    return stereo(norm((n + tone) * e, 0.7), 0, 0.6)
@sfx('riser')
def _(d=None): return reverb(_riser(2.4, 110, 880), 0.25, 1.2, 0.4)
@sfx('riser_short')
def _(d=None): return reverb(_riser(1.2, 180, 1100), 0.2, 1.0, 0.3)
@sfx('riser_dark')
def _(d=None): return reverb(_riser(2.6, 55, 330, True), 0.3, 1.5, 0.5)
@sfx('title_hit')
def _(d=None):
    y = chord_stab([48, 55, 60, 64, 67, 72], 2.5, 'saw', 5000, 0.6) + 1.6 * osc(glide(70, 35, 0.6), 2.5) * env_exp(2.5, 0.5) + 0.4 * hp(noise(2.5, 'white', R), 3000) * env_exp(2.5, 0.08)
    sh = sum(bell(note(n), 2.5, 0.8) for n in [84, 88, 91]) * 0.2
    return reverb(stereo(norm(y + sh, 0.85), 0, 0.6), 0.35, 2.4, 0.8)
@sfx('chime_magic')
def _(d=None):
    out = np.zeros(int(2.6 * SR))
    for k, n in enumerate([79, 83, 86, 91, 95, 98]): place(out, bell(note(n), 1.8, 0.7) * 0.5, k * 0.07)
    return reverb(stereo(norm(out, 0.55), 0, 0.6), 0.45, 2.2, 0.8)
@sfx('sparkle')
def _(d=None):
    out = np.zeros(int(1.6 * SR))
    for k in range(9): place(out, bell(note(R.choice([91, 95, 98, 100, 103])), 0.8, 0.6) * R.uniform(0.2, 0.5), R.uniform(0, 0.5))
    return reverb(stereo(norm(out, 0.45), 0, 0.7), 0.4, 1.6, 0.6)
@sfx('chime_soft')
def _(d=None): return reverb(stereo(norm(mix(bell(note(84), 2.0, 0.5), 0.6 * bell(note(91), 1.6, 0.4)), 0.4)), 0.4, 2.0, 0.7)
@sfx('harp_gliss')
def _(d=None):
    out = np.zeros(int(2.8 * SR))
    for k, n in enumerate([60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84]): place(out, ks_fast(note(n), 1.8, 0.998, 0.5, R) * 0.3, k * 0.06)
    return reverb(stereo(norm(out, 0.5), 0, 0.6), 0.4, 2.0, 0.7)


# ------------------------------------------------------------------ crowds / ambience
@sfx('crowd_gasp')
def _(d=None):
    dur = 1.6; out = np.zeros((int(dur * SR), 2))
    for i in range(14):
        l = R.uniform(0.3, 0.6); e = np.sin(np.pi * np.clip(np.linspace(0, 1.3, int(l * SR)), 0, 1)) ** 0.7
        v = bp(noise(l, 'pink', R), R.uniform(700, 1100), R.uniform(2200, 3600)) * e
        place(out, stereo(v, R.uniform(-0.8, 0.8)) * R.uniform(0.4, 1), R.uniform(0, 0.25))
    return reverb(norm(out, 0.45), 0.25, 1.0, 0.35)
@sfx('crowd_aww')
def _(d=None):
    dur = 1.8; out = np.zeros((int(dur * SR), 2))
    for i in range(10):
        f0 = R.uniform(180, 320); t = t_axis(dur); f = f0 * (1 - 0.18 * t / dur)
        src = osc(f, dur, 'saw'); v = bp(src, 600, 900, 2) + 0.6 * bp(src, 1000, 1300, 2)
        v *= env_adsr(dur, 0.2, 0.3, 0.7, 0.7)
        place(out, stereo(v, R.uniform(-0.8, 0.8)) * R.uniform(0.3, 0.7), R.uniform(0, 0.15))
    out += stereo(bp(noise(dur, 'pink', R), 400, 2500) * env_adsr(dur, 0.2, 0.3, 0.6, 0.7) * 0.3, 0, 0.6)
    return reverb(norm(out, 0.4), 0.3, 1.2, 0.4)
@sfx('amb_street')
def _(d=None):
    dur = d or 9; t = t_axis(dur)
    traffic = lp(noise(dur, 'brown', R), 400) * 0.25 * (0.7 + 0.3 * np.sin(2 * np.pi * 0.11 * t))
    birds = np.zeros(len(t))
    k = 0.3
    while k < dur - 0.5:
        n = R.integers(2, 5); f = R.uniform(2800, 4800)
        for j in range(n):
            l = R.uniform(0.05, 0.12); ch = osc(glide(f * R.uniform(0.9, 1.1), f * R.uniform(1.1, 1.5), l), l) * np.sin(np.pi * np.linspace(0, 1, int(l * SR))) ** 2
            place(birds, ch * R.uniform(0.1, 0.25), k + j * (l + 0.03))
        k += R.uniform(0.4, 1.3)
    out = stereo(traffic, 0, 0.6) + stereo(birds, R.uniform(-0.5, 0.5), 0.6)
    return fade(out, 0.3, 1.0)
@sfx('cafeteria')
def _(d=None):
    dur = d or 30; t = t_axis(dur)
    walla = np.zeros(len(t))
    for v in range(8):
        src = noise(dur, 'pink', R); am = np.clip(lp(R.standard_normal(len(t)), 4, 2) * 40, 0, 1)
        fm_ = R.uniform(400, 900); walla += bp(src, fm_, fm_ * 2.2, 2) * am
    clink = np.zeros(len(t))
    for i in range(int(dur * 0.8)):
        c = modal([R.uniform(2500, 4500), R.uniform(5000, 7000)], [0.08, 0.04], [1, 0.4], 0.2, R); place(clink, c * R.uniform(0.05, 0.15), R.uniform(0, dur - 0.3))
    out = stereo(lp(walla, 2500) * 0.25, 0, 0.8) + stereo(clink, R.uniform(-0.5, 0.5), 0.6)
    return fade(reverb(norm(out, 0.4), 0.3, 1.2, 0.45)[:len(t)], 0.8, 1.5)

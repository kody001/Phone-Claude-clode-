"""Procedural score: a small arranger that renders a style (mood) for a given duration."""
import numpy as np
from dsp import *

A4 = 440.0


def hz(m):
    return A4 * 2 ** ((m - 69) / 12)


MAJ = [0, 2, 4, 5, 7, 9, 11]
MIN = [0, 2, 3, 5, 7, 8, 10]
HIJAZ = [0, 1, 4, 5, 7, 8, 10]
PHRYG = [0, 1, 3, 5, 7, 8, 10]
DOR = [0, 2, 3, 5, 7, 9, 10]
MIX = [0, 2, 4, 5, 7, 9, 10]


# ---------------- instruments (mono) ----------------
def i_pluck(f, L, v, rng):
    x = karplus(f, L + 0.6, 0.994, 0.55, rng)
    return peak(x, 300, 1.5, 4) * v


def i_harp(f, L, v, rng):
    return karplus(f, L + 1.5, 0.9975, 0.45, rng) * v


def i_pizz(f, L, v, rng):
    return karplus(f, min(L, 0.5) + 0.25, 0.985, 0.35, rng) * v


def i_santur(f, L, v, rng):
    return (karplus(f, L + 1.0, 0.996, 0.95, rng) + 0.6 * karplus(f * 1.003, L + 1.0, 0.996, 0.95, rng)) * v * 0.7


def i_bell(f, L, v, rng):
    d = 1.4
    t = tt(d)
    x = sum(g * np.sin(2 * np.pi * f * m * t) * np.exp(-t / dc) for m, g, dc in ((1, 1, 0.8), (2.76, 0.35, 0.3), (5.4, 0.15, 0.12)))
    return x * v * 0.5


def i_musicbox(f, L, v, rng):
    d = 1.6
    t = tt(d)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.9) + 0.25 * np.sin(2 * np.pi * f * 3 * t) * np.exp(-t / 0.2) + 0.1 * np.sin(2 * np.pi * f * 6.1 * t) * np.exp(-t / 0.05)
    return x * v * 0.5


def i_epiano(f, L, v, rng):
    d = L + 0.8
    t = tt(d)
    idx = 1.8 * np.exp(-t / 0.25)
    x = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * t)) * np.exp(-t / 1.2)
    x += 0.2 * np.sin(2 * np.pi * f * 14 * t) * np.exp(-t / 0.02)
    return x * adsr(d, 0.003, 0.1, 1, 0.3) * v * 0.45


def i_piano(f, L, v, rng):
    d = L + 1.2
    t = tt(d)
    x = sum(np.sin(2 * np.pi * f * k * np.sqrt(1 + 0.0004 * k * k) * t) * np.exp(-t / (1.4 / k ** 0.7)) / k ** 1.1 for k in range(1, 8))
    x[:N(0.01)] += lp(noise(0.01, rng), 3000) * 0.1
    return x * adsr(d, 0.002, 0.1, 1, 0.4) * v * 0.5


def i_pad(f, L, v, rng):
    d = L + 0.6
    x = sum(saw(f * (1 + dt), d) for dt in (-0.006, 0.0, 0.007))
    return lp(x, 1400) * adsr(d, min(0.5, L * 0.4), 0.2, 0.8, 0.6) * v * 0.25


def i_strings(f, L, v, rng):
    d = L + 0.5
    vib = 1 + 0.004 * np.sin(2 * np.pi * 5.5 * tt(d))
    x = sum(saw(f * vib * (1 + dt), d) for dt in (-0.004, 0.0, 0.005, 0.009))
    return lp(x, 2600) * adsr(d, min(0.25, L * 0.3), 0.2, 0.85, 0.4) * v * 0.18


def i_brass(f, L, v, rng):
    d = L + 0.25
    x = sum(saw(f * (1 + dt), d) for dt in (-0.003, 0.003))
    env = adsr(d, 0.03, 0.15, 0.75, 0.2)
    return tv_lowpass(x, 700 + 2600 * env) * env * v * 0.3


def i_tuba(f, L, v, rng):
    d = min(L, 0.45) + 0.1
    env = adsr(d, 0.015, 0.1, 0.6, 0.08)
    return lp(saw(f, d), 500) * env * v * 0.6


def i_sub(f, L, v, rng):
    d = L + 0.1
    return np.sin(2 * np.pi * f * tt(d)) * adsr(d, 0.01, 0.1, 0.8, 0.08) * v * 0.6


def i_organ(f, L, v, rng):
    d = L + 0.15
    t = tt(d)
    x = sum(g * np.sin(2 * np.pi * f * m * t) for m, g in ((0.5, 0.5), (1, 1), (2, 0.5), (3, 0.25), (4, 0.2)))
    return x * adsr(d, 0.02, 0.05, 0.9, 0.12) * v * 0.18


def i_choir(f, L, v, rng):
    d = L + 0.8
    x = formant_voice(f, d, 'a', 0.08, rng, 0.006) + formant_voice(f * 1.004, d, 'o', 0.08, rng, 0.006)
    return x * adsr(d, min(0.5, L * 0.4), 0.2, 0.85, 0.7) * v * 0.35


def i_accordion(f, L, v, rng):
    d = L + 0.1
    vib = 1 + 0.003 * np.sin(2 * np.pi * 6 * tt(d))
    x = square(f * vib, d, 0.4) + 0.6 * saw(f * vib * 1.004, d)
    return bp(x, 300, 3500) * adsr(d, 0.03, 0.05, 0.9, 0.08) * v * 0.18


def i_theremin(f, L, v, rng):
    d = L + 0.3
    vib = 1 + 0.012 * np.sin(2 * np.pi * 6 * tt(d))
    return np.sin(2 * np.pi * np.cumsum(f * vib) / SR) * adsr(d, 0.15, 0.1, 0.9, 0.3) * v * 0.4


INST = dict(pluck=i_pluck, harp=i_harp, pizz=i_pizz, santur=i_santur, bell=i_bell, musicbox=i_musicbox, epiano=i_epiano, piano=i_piano,
            pad=i_pad, strings=i_strings, brass=i_brass, tuba=i_tuba, sub=i_sub, organ=i_organ, choir=i_choir, accordion=i_accordion, theremin=i_theremin)


# ---------------- drums ----------------
def d_kick(rng):
    return sine(glide(130, 42, 0.3), 0.3) * env_exp(0.3, 0.09) * 0.9


def d_snare(rng):
    return padd(bp(noise(0.2, rng), 1200, 7000) * env_exp(0.2, 0.05) * 0.6, sine(190, 0.1) * env_exp(0.1, 0.03) * 0.5)


def d_hat(rng):
    return hp(noise(0.05, rng), 7000) * env_exp(0.05, 0.012) * 0.35


def d_shaker(rng):
    return bp(noise(0.08, rng), 4000, 10000) * bell_curve(0.08, 0.35, 0.3) * 0.25


def d_clap(rng):
    x = np.zeros(N(0.2))
    for k in range(3):
        b = bp(noise(0.03, rng), 900, 3500) * env_exp(0.03, 0.007)
        x[N(k * 0.011):N(k * 0.011) + len(b)] += b
    return x * 0.6


def d_doum(rng):
    return padd(sine(glide(110, 75, 0.35), 0.35) * env_exp(0.35, 0.12), bp(noise(0.03, rng), 300, 1200) * env_exp(0.03, 0.01) * 0.4) * 0.8


def d_tek(rng):
    return bp(noise(0.06, rng), 1800, 6000) * env_exp(0.06, 0.012) * 0.5 + 0.0


def d_frame(rng):
    j = hp(noise(0.25, rng), 6000) * env_exp(0.25, 0.08) * 0.3
    return padd(sine(glide(90, 60, 0.3), 0.3) * env_exp(0.3, 0.1) * 0.6, j)


def d_taiko(rng):
    return padd(np.tanh(2 * sine(glide(80, 45, 0.9), 0.9) * env_exp(0.9, 0.25)), lp(noise(0.12, rng), 1500) * env_exp(0.12, 0.03) * 0.5) * 0.9


def d_fingercym(rng):
    t = tt(1.2)
    return sum(np.sin(2 * np.pi * f * t) * np.exp(-t / 0.5) for f in (3520, 5280, 7130)) * 0.08


def d_tamb(rng):
    return padd(hp(noise(0.12, rng), 5000) * env_exp(0.12, 0.04), sum(np.sin(2 * np.pi * f * tt(0.1)) * np.exp(-tt(0.1) / 0.03) for f in (6000, 7700)) * 0.2) * 0.3


def d_timp(rng):
    return sine(glide(98, 92, 1.0), 1.0) * env_exp(1.0, 0.35) * 0.7 + 0.0


DRUM = dict(kick=d_kick, snare=d_snare, hat=d_hat, shaker=d_shaker, clap=d_clap, doum=d_doum, tek=d_tek, frame=d_frame, taiko=d_taiko,
            fingercym=d_fingercym, tamb=d_tamb, timp=d_timp)


def P(s):
    """16-step pattern string -> list of (step, velocity)"""
    out = []
    for i, ch in enumerate(s.replace(' ', '')):
        if ch in 'xX':
            out.append((i, 1.0 if ch == 'X' else 0.6))
        elif ch == '.':
            pass
        elif ch == 'o':
            out.append((i, 0.35))
    return out


# ---------------- styles ----------------
STYLES = {
    'tension': dict(bpm=70, root=38, scale=MIN, prog=[0, 0, 5, 4], drone=('pad', [0, 7], 0.5), chords=None,
                    drums={'taiko': P('X.........x.....'), 'timp': P('........o.......')}, lpf=4000),
    'clinic': dict(bpm=92, root=53, scale=MAJ, prog=[0, 5, 1, 4], sev=True, chords=('epiano', [0, 6], 0.55, 1.4),
                   bass=('pluck', [(0, 0), (8, 4)], 0.5), mel=('bell', 0.18, 2, (72, 86), 0.28), drums={'shaker': P('o.x.o.x.o.x.o.x.')}),
    'intro': dict(bpm=100, root=57, scale=MIN, prog=[0, 5, 3, 4], chords=('pad', [0], 0.35, 4), arp=('pizz', 2, 0.55, (64, 81)),
                  bass=('sub', [(0, 0), (8, 0)], 0.6), drums={'kick': P('x.......x.......'), 'hat': P('..o...o...o...o.')}),
    'whisper': dict(bpm=60, root=64, scale=MIN, prog=[0], drone=('pad', [7, 12], 0.25), mel=('bell', 0.08, 1, (76, 88), 0.18)),
    'title': dict(bpm=120, root=50, scale=MIN, prog=[0, 5, 6, 0], chords=('brass', [0], 0.6, 1.8), drone=('choir', [0, 7], 0.35),
                  drums={'taiko': P('X...x...X...x.x.'), 'snare': P('............xxxx')}, hit=True),
    'sting': dict(bpm=100, root=62, scale=MAJ, prog=[0], oneshot='sting'),
    'egypt': dict(bpm=104, root=62, scale=HIJAZ, prog=[0, 0, 6, 0], drone=('pad', [0, 7], 0.3), bass=('pluck', [(0, 0), (6, 0), (10, 4)], 0.55),
                  mel=('pluck', 0.55, 2, (62, 79), 0.45), drums={'doum': P('X.....x...x.....'), 'tek': P('....x.....x.x.x.'), 'shaker': P('o.o.o.o.o.o.o.o.')}),
    'twist': dict(bpm=104, root=62, scale=HIJAZ, prog=[0, 0, 6, 0], drone=('pad', [0, 7], 0.3), bass=('pluck', [(0, 0), (6, 0), (10, 4)], 0.5),
                  mel=('santur', 0.5, 2, (66, 83), 0.4), drums={'doum': P('X.....x...x.....'), 'tek': P('....x.....x.x.x.'), 'tamb': P('..o...o...o...o.')}, hit=True),
    'romance': dict(bpm=72, root=65, scale=MAJ, prog=[0, 5, 3, 4], chords=('strings', [0], 0.45, 4), arp=('harp', 2, 0.5, (65, 84))),
    'ad': dict(bpm=118, root=60, scale=MAJ, prog=[0, 4, 5, 3], chords=('pluck', [2, 6, 10, 14], 0.35, 0.3), mel=('bell', 0.5, 2, (72, 88), 0.32),
               bass=('sub', [(0, 0), (8, 0)], 0.5), drums={'kick': P('x.......x.......'), 'clap': P('....x.......x...'), 'shaker': P('o.o.o.o.o.o.o.o.')}),
    'babylon': dict(bpm=88, root=52, scale=PHRYG, prog=[0, 0, 1, 0], drone=('organ', [0, 7], 0.35), bass=('pluck', [(0, 0), (10, 0)], 0.5),
                    mel=('santur', 0.4, 4, (64, 83), 0.33), drums={'frame': P('X.......x.......'), 'tek': P('....x.......x.x.'), 'fingercym': P('..............x.')}),
    'spooky': dict(bpm=60, root=49, scale=MIN, prog=[0, 1], drone=('pad', [0, 6], 0.35), mel=('theremin', 0.6, 0.5, (68, 80), 0.3), lpf=5000),
    'regal': dict(bpm=70, root=43, scale=MIN, prog=[0, 5, 6, 0], chords=('brass', [0], 0.5, 4), drone=('strings', [0], 0.3), drums={'timp': P('X.......x.......')}),
    'none': dict(silent=True),
    'somber': dict(bpm=60, root=57, scale=MIN, prog=[0, 5, 3, 4], chords=('strings', [0], 0.3, 4), mel=('piano', 0.25, 1, (64, 76), 0.25)),
    'greece': dict(bpm=92, root=62, scale=DOR, prog=[0, 3, 0, 6], chords=('pad', [0], 0.25, 4), arp=('harp', 2, 0.5, (62, 81)),
                   bass=('pluck', [(0, 0), (8, 4)], 0.45), drums={'frame': P('x.......o.......'), 'fingercym': P('........x.......')}),
    'night': dict(bpm=66, root=58, scale=MAJ, prog=[0, 3, 0, 4], chords=('pad', [0], 0.3, 4), arp=('harp', 1, 0.45, (65, 82))),
    'dream': dict(bpm=70, root=63, scale=MAJ, prog=[0, 5, 3, 4], chords=('pad', [0], 0.35, 4), arp=('musicbox', 2, 0.55, (75, 91)), verb=0.5),
    'lullaby': dict(bpm=70, root=65, scale=MAJ, prog=[0, 3, 4, 0], chords=('pad', [0], 0.25, 4), mel=('musicbox', 0.7, 1, (72, 86), 0.45)),
    'rome': dict(bpm=112, root=60, scale=MAJ, prog=[0, 3, 4, 0], chords=('pizz', [4, 12], 0.45, 0.3), bass=('tuba', [(0, 0), (8, 4)], 0.6),
                 mel=('bell', 0.35, 2, (72, 88), 0.25), drums={'snare': P('x.......x...o.o.'), 'kick': P('x.......x.......')}),
    'party': dict(bpm=124, root=57, scale=MIN, prog=[0, 5, 6, 4], chords=('organ', [2, 6, 10, 14], 0.4, 0.2), bass=('sub', [(0, 0), (2, 0), (4, 0), (6, 0), (8, 0), (10, 0), (12, 0), (14, 0)], 0.5),
                  drums={'kick': P('x...x...x...x...'), 'clap': P('....x.......x...'), 'hat': P('..x...x...x...x.')}, lpf=1100),
    'conspiracy': dict(bpm=96, root=50, scale=MIN, prog=[0, 0, 5, 4], drone=('strings', [0], 0.3), arp=('pizz', 2, 0.6, (57, 74)), drums={'kick': P('x.........x.....')}),
    'cabbage': dict(bpm=72, root=60, scale=MAJ, prog=[0, 3, 0, 4], chords=('choir', [0], 0.5, 4), drone=('brass', [0], 0.25), mel=('bell', 0.3, 1, (72, 84), 0.3),
                    drums={'timp': P('X.......x.......')}, hit=True),
    'jingle': dict(bpm=124, root=52, scale=MAJ, prog=[0, 4, 0, 4], bass=('tuba', [(0, 0), (4, 4), (8, 0), (12, 4)], 0.6),
                   drums={'clap': P('....x.......x...'), 'tamb': P('x.x.x.x.x.x.x.x.'), 'kick': P('x.......x.......')}),
    'chant': dict(bpm=60, root=45, scale=MIN, prog=[0], drone=('choir', [0, 7], 0.45), drums={'taiko': P('X...............')}, oneshot='gong', lpf=6000),
    'sad': dict(bpm=66, root=57, scale=MIN, prog=[0, 5, 2, 6], chords=('strings', [0], 0.22, 4), arp=('piano', 1, 0.6, (60, 76))),
    'plague': dict(bpm=70, root=36, scale=MIN, prog=[0, 1], drone=('pad', [0, 1, 7], 0.4), drums={'taiko': P('X.......x.......')}, mel=('strings', 0.2, 0.5, (80, 88), 0.15)),
    'voyage': dict(bpm=100, root=62, scale=MAJ, prog=[0, 4, 0, 4], steps=12, mel=('accordion', 0.6, 3, (66, 81), 0.35), bass=('pizz', [(0, 0), (6, 4)], 0.5),
                   drums={'tamb': [(0, 0.6), (6, 0.4)]}),
    'awe': dict(bpm=64, root=62, scale=MAJ, prog=[0, 4, 5, 3], chords=('strings', [0], 0.4, 4), drone=('choir', [0], 0.25), mel=('bell', 0.15, 1, (74, 86), 0.25)),
    'finale': dict(bpm=116, root=62, scale=MAJ, prog=[0, 4, 5, 3], chords=('brass', [0, 8], 0.4, 1.2), bass=('tuba', [(0, 0), (8, 4)], 0.55),
                   mel=('bell', 0.45, 2, (74, 90), 0.3), drums={'snare': P('x...x...x...x.xx'), 'kick': P('x.......x.......'), 'tamb': P('..x...x...x...x.')}),
    'outro': dict(bpm=116, root=62, scale=MAJ, prog=[0, 4, 5, 3], chords=('strings', [0], 0.4, 4), arp=('harp', 2, 0.5, (66, 84)), bass=('pluck', [(0, 0), (8, 4)], 0.45),
                  drums={'kick': P('x.......x.......'), 'tamb': P('..x...x...x...x.')}),
}


def chord_notes(st, deg, seventh=False):
    sc = st['scale']
    notes = [st['root'] + sc[(deg + k) % 7] + 12 * ((deg + k) // 7) for k in (0, 2, 4)]
    if seventh:
        notes.append(st['root'] + sc[(deg + 6) % 7] + 12 * ((deg + 6) // 7))
    return notes


def scale_notes(st, lo, hi):
    out = []
    for octv in range(-3, 5):
        for s in st['scale']:
            m = st['root'] + s + 12 * octv
            if lo <= m <= hi:
                out.append(m)
    return sorted(out)


def render_style(name, dur, seed=0):
    st = STYLES.get(name, STYLES['none'])
    n = N(dur + 2.0)
    L = np.zeros(n)
    Rt = np.zeros(n)
    if st.get('silent'):
        return np.zeros((N(dur), 2))
    rng = np.random.default_rng(seed + sum(map(ord, name)))
    bpm = st['bpm']
    beat = 60 / bpm
    steps = st.get('steps', 16)
    stepdur = beat * 4 / steps
    bar = beat * 4
    nbars = int(np.ceil(dur / bar)) + 1

    def put(x, t, pan=0.0, g=1.0):
        a = N(t)
        if a >= n:
            return
        m = min(len(x), n - a)
        l = np.cos((pan + 1) * np.pi / 4) * 1.414
        r = np.sin((pan + 1) * np.pi / 4) * 1.414
        L[a:a + m] += x[:m] * g * l
        Rt[a:a + m] += x[:m] * g * r

    if st.get('oneshot') == 'sting':
        # chapter sting: low hit + harp flourish + gong shimmer
        put(d_taiko(rng), 0.0, 0, 0.9)
        notes = [62, 66, 69, 74, 78, 81, 86]
        for i, m in enumerate(notes):
            put(i_harp(hz(m), 0.6, 0.6, rng), 0.05 + i * 0.06, -0.4 + i * 0.13)
        for m in (50, 57, 62, 66):
            put(i_strings(hz(m), 2.0, 0.6, rng), 0.0, 0)
        out = np.stack([L, Rt], axis=1)
        return reverb(out, 2.0, 0.35)[:N(dur + 1.5)]
    if st.get('oneshot') == 'gong':
        t = tt(4.5)
        g = sum(gg * np.sin(2 * np.pi * 98 * m * t) * np.exp(-t / dc) for m, gg, dc in ((1, 1, 2.5), (1.52, 0.7, 2), (2.23, 0.5, 1.5), (2.87, 0.4, 1.2)))
        put(g * 0.25, 0.0)

    if st.get('hit'):
        put(d_taiko(rng) * 1.0, 0.0)
        for m in chord_notes(st, st['prog'][0]):
            put(i_brass(hz(m), 1.2, 0.7, rng), 0.0, rng.uniform(-0.3, 0.3))

    sc_mel = None
    prev_mel = None
    for b in range(nbars):
        t0 = b * bar
        if t0 > dur + 0.5:
            break
        deg = st['prog'][b % len(st['prog'])]
        cn = chord_notes(st, deg, st.get('sev', False))
        # drone
        if st.get('drone'):
            inst, ints, v = st['drone']
            if b % 2 == 0:
                for k in ints:
                    put(INST[inst](hz(st['root'] - 12 + k), bar * 2, v, rng), t0, rng.uniform(-0.4, 0.4))
        # chords
        if st.get('chords'):
            inst, hits, v, L_ = st['chords']
            for h in hits:
                for i, m in enumerate(cn):
                    mm = m + (12 if m < st['root'] else 0)
                    put(INST[inst](hz(mm), L_ if L_ < bar else bar, v / len(cn) * 2, rng), t0 + h * stepdur + i * 0.008, -0.5 + i * 0.33)
        # bass
        if st.get('bass'):
            inst, pat, v = st['bass']
            for (s, off) in pat:
                m = st['root'] - 12 + st['scale'][(deg + off) % 7] + (12 if (deg + off) >= 7 else 0)
                if m > st['root'] - 3:
                    m -= 12
                put(INST[inst](hz(m), stepdur * 3, v, rng), t0 + s * stepdur, 0)
        # arpeggio
        if st.get('arp'):
            inst, per_beat, v, (lo, hi) = st['arp']
            pool = sorted({m + 12 * o for m in cn for o in range(-2, 3) if lo <= m + 12 * o <= hi})
            k = 0
            for s in range(int(4 * per_beat)):
                if not pool:
                    break
                idx = [0, 1, 2, 1, 2, 3, 2, 1][s % 8] % len(pool)
                m = pool[min(len(pool) - 1, idx + (b % 2))]
                put(INST[inst](hz(m), beat / per_beat, v * (1 if s % per_beat == 0 else 0.7), rng), t0 + s * beat / per_beat, rng.uniform(-0.5, 0.5))
        # melody (random walk on the scale, chord tones on strong beats)
        if st.get('mel'):
            inst, dens, per_beat, (lo, hi), v = st['mel']
            pool = scale_notes(st, lo, hi)
            if prev_mel is None:
                prev_mel = len(pool) // 2
            for s in range(int(4 * per_beat)):
                strong = s % per_beat == 0
                if rng.random() > dens * (1.3 if strong else 0.8):
                    continue
                step = rng.choice([-2, -1, -1, 1, 1, 2, 0, 3, -3])
                prev_mel = int(np.clip(prev_mel + step, 0, len(pool) - 1))
                m = pool[prev_mel]
                if strong and (m % 12) not in [c % 12 for c in cn]:
                    cands = [i for i, p in enumerate(pool) if p % 12 in [c % 12 for c in cn]]
                    if cands:
                        prev_mel = min(cands, key=lambda i: abs(i - prev_mel))
                        m = pool[prev_mel]
                Ld = beat / per_beat * rng.choice([1, 1, 2])
                put(INST[inst](hz(m), Ld, v, rng), t0 + s * beat / per_beat, rng.uniform(-0.3, 0.3))
        # drums
        for dn, pat in (st.get('drums') or {}).items():
            for (s, vel) in pat:
                if s >= steps:
                    continue
                swing = stepdur * 0.12 if (s % 2 == 1 and st.get('swing')) else 0
                put(DRUM[dn](rng), t0 + s * stepdur + swing, rng.uniform(-0.2, 0.2) if dn not in ('kick', 'taiko', 'doum', 'timp') else 0, vel)

    out = np.stack([L, Rt], axis=1)
    if st.get('lpf'):
        out = lp(out, st['lpf'])
    out = reverb(out, 1.6, st.get('verb', 0.22), 6000, seed=7)
    return out[:N(dur + 1.5)]

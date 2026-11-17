"""Original score: sectioned cues that follow the story beats, rendered with FluidSynth (GM soundfont).
Each section is fitted exactly to the narration timing; a recurring theme ties the film together."""
import json, pathlib, subprocess, tempfile, os
import numpy as np, soundfile as sf, mido

ROOT = pathlib.Path(__file__).resolve().parent.parent
SF2 = '/usr/share/sounds/sf2/FluidR3_GM.sf2'
SR = 48000
OUT = ROOT / 'audio' / 'music'; OUT.mkdir(parents=True, exist_ok=True)

MAJ = [0, 2, 4, 5, 7, 9, 11]; MIN = [0, 2, 3, 5, 7, 8, 10]
def deg(key, scale, d, octv=0):
    """scale degree (1-based, may exceed 7) -> midi"""
    d0 = d - 1; return key + scale[d0 % 7] + 12 * (d0 // 7 + octv)
def triad(key, scale, d, octv=0, ext=()):
    return [deg(key, scale, d, octv), deg(key, scale, d + 2, octv), deg(key, scale, d + 4, octv)] + [deg(key, scale, d + e - 1, octv) for e in ext]

THEME = [(0, .5, 3), (.5, .5, 5), (1, 1, 6), (2, 1, 5), (3, 1, 3), (4, 1, 2), (5, 1, 1), (6, 2, 0),
         (8, .5, 2), (8.5, .5, 3), (9, 1, 5), (10, 1, 3), (11, 1, 2), (12, 3, 2), (15, 1, 0)]
THEME_B = [(0, .5, 3), (.5, .5, 5), (1, 1, 6), (2, 1, 8), (3, 1, 6), (4, 1, 5), (5, .5, 3), (5.5, .5, 2), (6, 2, 3),
           (8, .5, 4), (8.5, .5, 3), (9, 1, 2), (10, 1, 5), (11, 1, 7), (12, 4, 8)]

class Song:
    def __init__(s, key, scale, bpb=4): s.key, s.scale, s.bpb, s.notes, s.progs = key, scale, bpb, [], {}
    def n(s, start, dur, note, vel, ch): s.notes.append((start, dur, int(note), int(max(1, min(127, vel))), ch))
    def prog(s, ch, p): s.progs[ch] = p
    def chords(s, degs, bars):
        return [degs[b % len(degs)] for b in range(bars)]
    # ---- layers
    def pad(s, ch, cd, octv=0, vel=55, ext=(), dur=None):
        for b, d in enumerate(cd):
            for nt in triad(s.key, s.scale, d, octv, ext): s.n(b * s.bpb, dur or s.bpb, nt, vel, ch)
    def bass(s, ch, cd, pattern=((0, 1),), octv=-2, vel=80, fifth=False):
        for b, d in enumerate(cd):
            for i, (o, l) in enumerate(pattern):
                nt = deg(s.key, s.scale, d, octv) + (7 if fifth and i % 2 == 1 else 0); s.n(b * s.bpb + o, l, nt, vel, ch)
    def arp(s, ch, cd, rate=.5, shape=(0, 1, 2, 1), octv=1, vel=60, dur=None, ext=()):
        for b, d in enumerate(cd):
            tones = triad(s.key, s.scale, d, octv, ext); steps = int(s.bpb / rate)
            for i in range(steps):
                k = shape[i % len(shape)]; nt = tones[k % len(tones)] + 12 * (k // len(tones)); s.n(b * s.bpb + i * rate, dur or rate * 0.95, nt, vel - (0 if i % 2 == 0 else 8), ch)
    def stabs(s, ch, cd, beats=(1, 3), dur=.3, octv=0, vel=60):
        for b, d in enumerate(cd):
            for bt in beats:
                for nt in triad(s.key, s.scale, d, octv): s.n(b * s.bpb + bt, dur, nt, vel, ch)
    def melody(s, ch, motif, bars, start_bar=0, octv=1, vel=85, every=4, legato=0.95, jitter=0):
        span = every * s.bpb; b0 = start_bar * s.bpb
        while b0 < bars * s.bpb:
            for o, l, d in motif:
                if d == 0 or b0 + o >= bars * s.bpb: continue
                s.n(b0 + o, l * legato, deg(s.key, s.scale, d, octv), vel + (5 if o % 2 == 0 else 0), ch)
            b0 += span
    def drums(s, bars, kit, start_bar=0, vel=1.0):
        """kit: dict note -> list of beat offsets within a bar (or (offset, vel))"""
        for b in range(start_bar, bars):
            for note, hits in kit.items():
                for h in hits:
                    o, v = (h if isinstance(h, tuple) else (h, 90)); s.n(b * s.bpb + o, .2, note, v * vel, 9)
    def render(s, tempo, seconds, gain=0.7):
        mid = mido.MidiFile(ticks_per_beat=480); tr = mido.MidiTrack(); mid.tracks.append(tr)
        tr.append(mido.MetaMessage('set_tempo', tempo=mido.bpm2tempo(tempo)))
        for ch, pg in s.progs.items():
            tr.append(mido.Message('program_change', channel=ch, program=pg, time=0)); tr.append(mido.Message('control_change', channel=ch, control=91, value=60, time=0)); tr.append(mido.Message('control_change', channel=ch, control=93, value=20, time=0))
        ev = []
        for st_, du, nt, v, ch in s.notes: ev.append((int(st_ * 480), 1, nt, v, ch)); ev.append((int((st_ + du) * 480), 0, nt, 0, ch))
        ev.sort(key=lambda e: (e[0], e[1])); now = 0
        for tk, on, nt, v, ch in ev:
            tr.append(mido.Message('note_on' if on else 'note_off', channel=ch, note=nt, velocity=v, time=tk - now)); now = tk
        with tempfile.TemporaryDirectory() as d:
            mp, wp = os.path.join(d, 'a.mid'), os.path.join(d, 'a.wav'); mid.save(mp)
            subprocess.run(['fluidsynth', '-ni', '-g', str(gain), '-r', str(SR), '-F', wp, SF2, mp], check=True, capture_output=True)
            a, _ = sf.read(wp, dtype='float32')
        n = int(seconds * SR); a = a[:n + int(2.5 * SR)]
        return a

# ------------------------------------------------------------------ moods
def m_whimsy(bars, k=60):
    s = Song(k, MAJ); cd = s.chords([1, 6, 4, 5], bars)
    s.prog(0, 45); s.prog(1, 9); s.prog(2, 8); s.prog(3, 32)
    s.bass(3, cd, ((0, .9), (2, .9)), -2, 70); s.stabs(0, cd, (1, 3), .25, 0, 55); s.melody(1, THEME, bars, 0, 1, 80, every=4)
    s.arp(2, cd, 1, (0, 1, 2, 1), 2, 38); s.drums(bars, {76: [(1, 50), (3, 50)], 70: [(i * .5, 30) for i in range(8)]}); return s
def m_wonder(bars, k=60):
    s = Song(k, MAJ); cd = s.chords([1, 5, 6, 4], bars); s.prog(0, 48); s.prog(1, 46); s.prog(2, 52); s.prog(3, 60)
    s.pad(0, cd, 0, 52, (8,)); s.arp(1, cd, .5, (0, 1, 2, 3, 2, 1), 1, 55); s.pad(2, cd, 1, 38)
    s.melody(3, [(o * 2, l * 2, d) for o, l, d in THEME[:8]], bars, 0, 0, 70, every=4); s.bass(4, cd, ((0, 4),), -2, 60); s.prog(4, 48); return s
def m_warm(bars, k=65):
    s = Song(k, MAJ); cd = s.chords([1, 5, 6, 4], bars); s.prog(0, 0); s.prog(1, 48); s.prog(2, 73)
    s.arp(0, cd, .5, (0, 1, 2, 3, 2, 1, 0, 2), 0, 55); s.pad(1, cd, 0, 40); s.bass(0, cd, ((0, 2), (2, 2)), -1, 55)
    s.melody(2, THEME, bars, 2, 1, 62, every=4); return s
def m_comedy(bars, k=65):
    s = Song(k, MAJ); cd = s.chords([1, 5, 1, 5, 4, 1, 5, 1], bars); s.prog(0, 58); s.prog(1, 45); s.prog(2, 70); s.prog(3, 71)
    s.bass(0, cd, ((0, .5), (2, .5)), -2, 90, fifth=True); s.stabs(1, cd, (1, 3), .2, 0, 70)
    mot = [(0, .5, 1), (.5, .5, 3), (1, .5, 5), (1.5, .5, 3), (2, 1, 8), (3, .5, 7), (3.5, .5, 5), (4, .5, 4), (4.5, .5, 2), (5, .5, 7), (5.5, .5, 5), (6, 1, 1)]
    s.melody(2, mot, bars, 0, 0, 78, every=2); s.melody(3, [(o + 8, l, d + 2) for o, l, d in mot[:6]], bars, 0, 1, 60, every=4)
    s.drums(bars, {76: [(1, 60), (3, 60)], 42: [(0, 40), (2, 40)]}); return s
def m_awkward(bars, k=62):
    s = Song(k, MIN); cd = s.chords([1, 5, 1, 4, 5], bars); s.prog(0, 45); s.prog(1, 71); s.prog(2, 70)
    s.bass(0, cd, ((0, .4), (2.5, .4)), -1, 70); s.stabs(0, cd, (1.5,), .2, 0, 45)
    mot = [(0, .5, 5), (1, .5, 4), (1.5, .5, 3), (3, 1, 2), (5, .5, 5), (5.5, .5, 6), (6, 1.5, 5)]
    s.melody(1, mot, bars, 1, 1, 58, every=2); s.drums(bars, {75: [(0, 35), (2.5, 30)]}); return s
def m_fancy(bars, k=62):
    s = Song(k, MAJ); cd = s.chords([1, 5, 6, 3, 4, 1, 4, 5], bars); s.prog(0, 6); s.prog(1, 48); s.prog(2, 42)
    s.arp(0, cd, .25, (0, 1, 2, 3, 2, 1, 2, 1), 1, 60); s.pad(1, cd, 0, 48); s.bass(2, cd, ((0, 1), (1, 1), (2, 1), (3, 1)), -1, 60); return s
def m_curious(bars, k=57):
    s = Song(k, MIN); cd = s.chords([1, 6, 3, 7], bars); s.prog(0, 8); s.prog(1, 45); s.prog(2, 89)
    s.pad(2, cd, 0, 42); s.bass(1, cd, ((0, .4), (2, .4)), -1, 60)
    mot = [(0, 1, 5), (1, .5, 6), (1.5, .5, 5), (2, 1, 3), (4, .5, 2), (4.5, .5, 3), (5, 2, 5)]
    s.melody(0, mot, bars, 0, 1, 70, every=2); return s
def m_chase(bars, k=67):
    s = Song(k, MAJ); cd = s.chords([1, 5, 6, 4], bars); s.prog(0, 45); s.prog(1, 13); s.prog(2, 70)
    s.bass(0, cd, tuple((i * .5, .25) for i in range(8)), -1, 72); s.arp(1, cd, .25, (0, 1, 2, 3, 4, 3, 2, 1), 1, 60, .2)
    s.melody(2, [(0, .5, 1), (.5, .5, 2), (1, .5, 3), (1.5, .5, 5), (2, 1, 6), (3, 1, 5)], bars, 0, 0, 70, every=1)
    s.drums(bars, {38: [(1, 55), (3, 55)], 42: [(i * .5, 40) for i in range(8)], 36: [(0, 70), (2, 60)]}); return s
def m_triumph(bars, k=60):
    s = Song(k, MAJ); cd = s.chords([1, 4, 5, 1], bars); s.prog(0, 61); s.prog(1, 56); s.prog(2, 47); s.prog(3, 48)
    s.pad(3, cd, 0, 70); s.stabs(0, cd, (0, 2.5), .8, 0, 95); s.melody(1, THEME_B, bars, 0, 1, 100, every=4); s.bass(2, cd, ((0, 1), (2, 1)), -2, 100)
    s.drums(bars, {49: [(0, 90)], 36: [(0, 100), (2, 80)]}); return s
def m_sneaky(bars, k=64):
    s = Song(k, MIN); s.prog(0, 45); s.prog(1, 59); s.prog(2, 11); cd = s.chords([1, 1, 4, 5], bars)
    for b in range(bars):
        for i, off in enumerate([0, 1, 2, 3]): s.n(b * 4 + off, .3, k - 24 + [0, 1, 2, 3][i] + (5 if b % 4 == 2 else 0), 80, 0)
    s.stabs(1, cd, (1.5, 3.5), .15, 0, 55); s.arp(2, cd, 1, (0, 2, 1, 2), 1, 45)
    s.drums(bars, {37: [(1, 60), (3, 60)], 42: [(i * .5, 30) for i in range(8)]}); return s
def m_chat(bars, k=57):
    s = Song(k, MIN); cd = s.chords([1, 6, 3, 7], bars); s.prog(0, 4); s.prog(1, 38); s.prog(2, 12)
    s.stabs(0, cd, (0, 1.5, 3), .4, 0, 55); s.bass(1, cd, ((0, .75), (1.5, .5), (2.5, .75)), -2, 75)
    s.arp(2, cd, .5, (2, 1, 0, 1, 2, 3, 2, 1), 1, 50); s.drums(bars, {36: [(0, 80), (1.5, 60), (2.5, 70)], 39: [(1, 60), (3, 60)], 42: [(i * .5, 35) for i in range(8)]}); return s
def m_heavy(bars, k=62):
    s = Song(k, MIN); cd = s.chords([1, 6, 4, 5], bars); s.prog(0, 45); s.prog(1, 48); s.prog(2, 47)
    s.bass(0, cd, tuple((i * .5, .25) for i in range(8)), -1, 70); s.pad(1, cd, -1, 50); s.drums(bars, {47: [(0, 60)]})
    for b in range(bars): s.n(b * 4, 1, k - 24, 60 + b * 3, 2)
    return s
def m_tension(bars, k=52):
    s = Song(k, MIN); s.prog(0, 44); s.prog(1, 47); s.prog(2, 48); cd = s.chords([1, 1, 6, 5], bars)
    s.pad(0, cd, -1, 55); s.bass(2, cd, ((0, 4),), -2, 60)
    for b in range(bars): s.n(b * 4, .5, k - 12, 70, 1); s.n(b * 4 + 2.5, .5, k - 12, 50, 1)
    return s
def m_sad(bars, k=57):
    s = Song(k, MIN); cd = s.chords([1, 6, 3, 7], bars); s.prog(0, 0); s.prog(1, 42)
    s.arp(0, cd, .5, (0, 1, 2, 1, 3, 1, 2, 1), 0, 45); s.bass(0, cd, ((0, 4),), -1, 50)
    mot = [(0, 1.5, 5), (1.5, .5, 3), (2, 2, 2), (4, 1.5, 3), (5.5, .5, 2), (6, 2, 1)]
    s.melody(0, mot, bars, 1, 1, 62, every=2); s.pad(1, cd, -1, 35); return s
def m_build(bars, k=57):
    s = Song(k, MIN); cd = s.chords([1, 6, 3, 7], bars); s.prog(0, 48); s.prog(1, 61); s.prog(2, 47); s.prog(3, 33)
    for b, d in enumerate(cd):
        for i in range(8):
            for nt in triad(k, MIN, d, 0)[:2]: s.n(b * 4 + i * .5, .3, nt, 55 + int(30 * b / max(1, bars)), 0)
    s.bass(3, cd, tuple((i * .5, .3) for i in range(8)), -2, 80); s.stabs(1, cd, (0,), 1.0, 0, 70)
    toms = {45: [(0, 70), (.75, 60)], 43: [(1.5, 70), (2.25, 60)], 41: [(3, 80), (3.5, 80)]}
    s.drums(bars, toms); s.drums(bars, {36: [(0, 90), (2, 90)], 38: [(1, 80), (3, 80)]}, start_bar=max(0, bars // 2)); return s
def m_uplift(bars, k=60):
    s = Song(k, MAJ); cd = s.chords([1, 5, 6, 4], bars); s.prog(0, 48); s.prog(1, 9); s.prog(2, 61); s.prog(3, 33)
    s.pad(0, cd, 0, 60, (8,)); s.melody(1, THEME, bars, 0, 1, 80, every=4); s.stabs(2, cd, (0,), 1.5, 0, 60); s.bass(3, cd, ((0, 1), (1.5, .5), (2, 1)), -2, 80)
    s.drums(bars, {36: [(0, 80), (2, 70)], 38: [(1, 60), (3, 60)], 42: [(i * .5, 35) for i in range(8)]}); return s
def m_friend(bars, k=67):
    s = Song(k, MAJ); cd = s.chords([1, 5, 6, 4], bars); s.prog(0, 25); s.prog(1, 9); s.prog(2, 33)
    for b, d in enumerate(cd):
        for o, v in [(0, 70), (1, 50), (1.5, 55), (2.5, 55), (3, 50), (3.5, 45)]:
            for j, nt in enumerate(triad(k, MAJ, d, 0, (8,))): s.n(b * 4 + o + j * .015, .4, nt, v, 0)
    s.melody(1, THEME, bars, 1, 1, 70, every=4); s.bass(2, cd, ((0, 1), (2, 1)), -2, 70); s.drums(bars, {39: [(1, 55), (3, 55)], 54: [(i * .5, 30) for i in range(8)]}); return s
def m_montage(bars, k=65):
    s = Song(k, MAJ); cd = s.chords([1, 4, 5, 1, 6, 4, 5, 5], bars); s.prog(0, 45); s.prog(1, 13); s.prog(2, 71); s.prog(3, 32)
    s.stabs(0, cd, (0, 1, 2, 3), .2, 0, 55); s.bass(3, cd, ((0, .5), (2, .5)), -2, 70)
    s.melody(1, THEME_B, bars, 0, 1, 70, every=4); s.melody(2, [(o + 2, l, d - 2) for o, l, d in THEME[:6] if d], bars, 2, 1, 55, every=4)
    s.drums(bars, {42: [(i * .5, 35) for i in range(8)], 39: [(1, 50), (3, 50)]}); return s
def m_party(bars, k=58):
    s = Song(k, MAJ); cd = s.chords([1, 4, 1, 5], bars); s.prog(0, 61); s.prog(1, 33); s.prog(2, 17)
    s.stabs(0, cd, (.5, 2.5, 3.5), .2, 1, 70); s.bass(1, cd, ((0, .4), (.75, .25), (1.5, .4), (2.5, .4), (3.25, .25)), -2, 85); s.stabs(2, cd, (1, 3), .4, 0, 45)
    s.drums(bars, {36: [(0, 90), (1.5, 70), (2, 90)], 38: [(1, 80), (3, 80)], 42: [(i * .5, 50) for i in range(8)]}); return s
def m_bitter(bars, k=64):
    s = Song(k, MAJ); cd = s.chords([1, 3, 4, 5], bars); s.prog(0, 10); s.prog(1, 48)
    s.melody(0, [(o, l, d) for o, l, d in THEME], bars, 0, 1, 60, every=4); s.pad(1, cd, 0, 40); return s
def m_tender(bars, k=64):
    s = Song(k, MAJ); cd = s.chords([1, 3, 4, 5], bars); s.prog(0, 10); s.prog(1, 48); s.prog(2, 46)
    s.melody(0, THEME, bars, 0, 1, 62, every=4); s.pad(1, cd, 0, 45); s.arp(2, cd, .5, (0, 1, 2, 3, 2, 1, 2, 1), 0, 45); return s
def m_home(bars, k=62):
    s = Song(k, MAJ, 3); cd = s.chords([1, 5, 6, 4], bars); s.prog(0, 21); s.prog(1, 24); s.prog(2, 9); s.prog(3, 32)
    s.bass(3, cd, ((0, 1),), -2, 65); s.stabs(1, cd, (1, 2), .5, 0, 50)
    s.melody(0, [(0, 1, 3), (1, 1, 5), (2, 1, 6), (3, 2, 5), (5, 1, 3), (6, 1, 2), (7, 1, 3), (8, 1, 5), (9, 3, 1)], bars, 0, 1, 58, every=4)
    s.melody(2, [(0, 1, 5), (3, 1, 6), (6, 1, 5), (9, 2, 3)], bars, 2, 1, 40, every=4); return s
def m_sadturn(bars, k=64):
    s = Song(k, MIN); cd = s.chords([1, 6, 3, 7], bars); s.prog(0, 0); s.prog(1, 48); s.prog(2, 42)
    s.arp(0, cd, 1, (0, 1, 2, 1), 0, 42); s.pad(1, cd, 0, 38); s.melody(2, [(0, 2, 5), (2, 2, 3), (4, 2, 4), (6, 2, 2)], bars, 2, 0, 55, every=2); return s
def m_bubbles(bars, k=65):
    s = Song(k, MAJ); cd = s.chords([1, 4, 5, 1], bars); s.prog(0, 45); s.prog(1, 9)
    s.stabs(0, cd, (0, 1, 2, 3), .15, 0, 55); s.melody(1, [(0, .5, 5), (.5, .5, 6), (1, .5, 8), (2, .5, 6), (3, 1, 5)], bars, 0, 1, 65, every=1); return s
def m_reflect(bars, k=60):
    s = Song(k, MAJ); cd = s.chords([1, 3, 6, 4], bars); s.prog(0, 0); s.prog(1, 42); s.prog(2, 89)
    s.arp(0, cd, .5, (0, 1, 2, 1, 3, 2, 1, 2), 0, 45); s.pad(2, cd, 0, 32); s.melody(1, [(0, 2, 3), (2, 2, 2), (4, 4, 1)], bars, 1, 0, 50, every=2); return s
def m_nostalgic(bars, k=65):
    s = Song(k, MAJ); cd = s.chords([1, 3, 4, 5], bars); s.prog(0, 0); s.prog(1, 48); s.prog(2, 46); s.prog(3, 9)
    s.arp(2, cd, .5, (0, 1, 2, 3, 2, 1, 2, 1), 0, 45); s.pad(1, cd, 0, 48); s.melody(0, THEME, bars, 0, 1, 70, every=4); s.melody(3, THEME, bars, 4, 2, 45, every=8); s.bass(1, cd, ((0, 4),), -2, 50); return s
def m_joy(bars, k=60):
    s = Song(k, MAJ); cd = s.chords([1, 5, 6, 4], bars); s.prog(0, 45); s.prog(1, 9); s.prog(2, 48); s.prog(3, 60); s.prog(4, 33)
    s.stabs(0, cd, (1, 3), .2, 0, 60); s.melody(1, THEME, bars, 0, 1, 85, every=4); s.pad(2, cd, 0, 50); s.melody(3, [(o, l, d) for o, l, d in THEME_B], bars, 4, 0, 65, every=8)
    s.bass(4, cd, ((0, 1), (2, 1)), -2, 75); s.drums(bars, {36: [(0, 70), (2, 60)], 39: [(1, 50), (3, 50)], 42: [(i * .5, 30) for i in range(8)]}); return s
def m_inspire(bars, k=60):
    s = Song(k, MAJ); cd = s.chords([6, 4, 1, 5], bars); s.prog(0, 0); s.prog(1, 48); s.prog(2, 52); s.prog(3, 47)
    s.arp(0, cd, .5, (0, 1, 2, 1), 0, 50); s.pad(1, cd, 0, 50); s.pad(2, cd, 1, 35); s.melody(0, [(o * 1, l, d) for o, l, d in THEME], bars, 2, 1, 65, every=4)
    for b in range(bars // 2, bars): s.n(b * 4, 1, s.key - 24, 50 + 3 * (b - bars // 2), 3)
    return s
def m_outro(bars, k=60):
    s = m_whimsy(bars, k); s.drums(bars, {36: [(0, 70), (2, 60)], 38: [(1, 60), (3, 60)]}); s.prog(5, 61)
    s.stabs(5, s.chords([1, 6, 4, 5], bars), (0,), .5, 0, 50); return s

MOODS = {'whimsy': (m_whimsy, 108), 'wonder': (m_wonder, 84), 'warm': (m_warm, 80), 'comedy': (m_comedy, 126), 'awkward': (m_awkward, 100), 'fancy': (m_fancy, 96),
         'curious': (m_curious, 88), 'chase': (m_chase, 138), 'triumph': (m_triumph, 112), 'sneaky': (m_sneaky, 108), 'chat': (m_chat, 104), 'heavy': (m_heavy, 92),
         'tension': (m_tension, 70), 'sad': (m_sad, 62), 'build': (m_build, 116), 'uplift': (m_uplift, 112), 'friend': (m_friend, 100), 'montage': (m_montage, 116),
         'party': (m_party, 120), 'bitter': (m_bitter, 72), 'tender': (m_tender, 72), 'home': (m_home, 96), 'sadturn': (m_sadturn, 64), 'bubbles': (m_bubbles, 120),
         'reflect': (m_reflect, 72), 'nostalgic': (m_nostalgic, 80), 'joy': (m_joy, 112), 'inspire': (m_inspire, 84), 'outro': (m_outro, 116)}
# (start line, mood, level dB)
PLAN = [(0, 'whimsy', -3), (5, 'wonder', -2), (10, None, 0), (11, 'warm', -2), (14, 'comedy', -4), (23, 'awkward', -3), (35, 'fancy', -3), (40, 'curious', -3),
        (49, 'chase', -4), (54, 'triumph', -2), (56, 'sneaky', -3), (63, 'chat', -4), (69, 'heavy', -3), (71, 'tension', -2), (80, 'sad', -1), (81, 'build', -3),
        (85, 'uplift', -3), (89, 'friend', -3), (96, 'montage', -4), (105, 'party', -5), (108, 'bitter', -2), (109, 'party', -6), (110, 'tender', -2), (116, 'home', -3),
        (120, 'sadturn', -2), (128, 'bubbles', -4), (129, 'reflect', -2), (135, 'nostalgic', -2), (140, 'joy', -3), (147, 'inspire', -2), (154, 'outro', -2)]

if __name__ == '__main__':
    timing = json.loads((ROOT / 'data/timing.json').read_text()); L = timing['lines']
    total = timing['duration'] + 6.5
    cues = []
    for i, (li, mood, db) in enumerate(PLAN):
        t0 = max(0.0, L[li]['start'] - 0.35) if li else 0.0
        t1 = (L[PLAN[i + 1][0]]['start'] - 0.35) if i + 1 < len(PLAN) else total
        if mood is None: continue
        fn, tempo0 = MOODS[mood]; dur = t1 - t0
        bpb = 3 if mood == 'home' else 4
        bars = max(1, round(dur / (bpb * 60 / tempo0))); tempo = bars * bpb * 60 / dur
        s = fn(bars); a = s.render(tempo, dur)
        p = OUT / f'{i:02d}_{mood}.wav'; sf.write(p, a, SR, subtype='PCM_24')
        cues.append({'file': str(p.relative_to(ROOT)), 't0': round(t0, 3), 't1': round(t1, 3), 'mood': mood, 'db': db, 'tempo': round(tempo, 1), 'bars': bars})
        print(f'{mood:10s} {t0:7.2f}-{t1:7.2f} bars {bars:3d} tempo {tempo:6.1f}', flush=True)
    (ROOT / 'data/music_cues.json').write_text(json.dumps(cues, indent=1))

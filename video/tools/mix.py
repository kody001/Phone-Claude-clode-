"""Final audio mix: narration + score (sidechain-ducked) + SFX cues (with per-room reverb sends) + automatic
ambience beds per location. Loudness-normalised to -14 LUFS integrated with a -1 dBTP ceiling (YouTube)."""
import json, pathlib, sys
import numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.signal import butter, sosfilt
from pedalboard import Pedalboard, Reverb, Compressor, Limiter, HighpassFilter, LowShelfFilter, HighShelfFilter, PeakFilter, Gain

ROOT = pathlib.Path(__file__).resolve().parent.parent
SR = 48000
def db(x): return 10 ** (x / 20)
def load(p):
    a, sr = sf.read(p, dtype='float32', always_2d=True)
    if sr != SR: raise SystemExit(f'bad sr {p}')
    return a if a.shape[1] == 2 else np.repeat(a, 2, 1)
def place(bus, a, t, gain=1.0):
    o = int(round(t * SR))
    if o >= len(bus): return
    if o < 0: a = a[-o:]; o = 0
    m = min(len(a), len(bus) - o); bus[o:o + m] += a[:m] * gain
def fades(a, fi=0.01, fo=0.05):
    a = a.copy(); i, o = min(int(fi * SR), len(a) // 2), min(int(fo * SR), len(a) // 2)
    if i: a[:i] *= np.linspace(0, 1, i)[:, None]
    if o: a[-o:] *= np.linspace(1, 0, o)[:, None]
    return a
def loop_to(a, n):
    if len(a) >= n: return a[:n]
    xf = min(int(0.5 * SR), len(a) // 4); out = a.copy()
    while len(out) < n:
        nxt = a.copy(); out[-xf:] = out[-xf:] * np.linspace(1, 0, xf)[:, None] + nxt[:xf] * np.linspace(0, 1, xf)[:, None]; out = np.concatenate([out, nxt[xf:]])
    return out[:n]
def pan(a, p):
    if not p: return a
    l, r = np.cos((p + 1) * np.pi / 4), np.sin((p + 1) * np.pi / 4); m = a.mean(1)
    return np.stack([m * l * 1.41, m * r * 1.41], 1).astype(np.float32)
def env_follow(x, att=0.03, rel=0.35, win=0.05):
    m = np.abs(x).astype(np.float64); k = int(win * SR); c = np.convolve(m, np.ones(k) / k, 'same')
    out = np.zeros_like(c); a1, r1 = np.exp(-1 / (att * SR)), np.exp(-1 / (rel * SR)); v = 0.0
    step = 64
    for i in range(0, len(c), step):
        tgt = c[i]; co = a1 if tgt > v else r1; v = tgt + (v - tgt) * co ** step; out[i:i + step] = v
    return out

def lookahead_limit(x, ceil, look=0.005, rel=0.12):
    pk = np.abs(x).max(1); g = np.minimum(1.0, ceil / np.maximum(pk, 1e-9))
    k = int(look * SR)
    from scipy.ndimage import minimum_filter1d
    g = minimum_filter1d(g, size=2 * k + 1, mode='nearest')
    a = np.exp(-1 / (rel * SR)); out = np.empty_like(g); v = 1.0
    for i in range(0, len(g), 32):
        seg = g[i:i + 32]; m = seg.min()
        v = m if m < v else m + (v - m) * a ** 32
        out[i:i + 32] = np.minimum(v, seg)
    # smooth attack edges
    out = np.convolve(out, np.ones(k) / k, 'same')
    return (x * np.minimum(out, g * 1.0 + (out - g).clip(0))[:, None]).astype(np.float32)

LOOP_IDS = {'amb_birds', 'amb_city', 'amb_morning', 'amb_countryside', 'amb_autumn', 'amb_ocean', 'amb_classroom', 'amb_apartment', 'room_tone', 'room_silence', 'big_room_echo',
            'cafeteria_walla', 'hallway_walla', 'party_walla', 'crowd_murmur', 'crickets', 'rain_window', 'space_drone', 'tension_drone', 'bus_interior', 'bus_idle', 'heli_idle',
            'lawnmower', 'water_running', 'water_spray', 'leaves_rustle', 'washer_spin', 'typing', 'band_live', 'party_music_far', 'carnival_music', 'clock_tick', 'heartbeat',
            'heartbeat_fast', 'scrub', 'chewing', 'horse_walk', 'car_idle', 'pencil_write', 'boiling', 'sizzle', 'rocket_rumble'}
# ambience beds per set: (id, dB)
BEDS = {'schoolExt': [('amb_birds', -21)], 'avenue': [('amb_city', -24), ('amb_birds', -25)], 'street': [('amb_city', -21)], 'street:fall': [('amb_autumn', -21), ('amb_city', -27)],
        'apartment:dawn': [('amb_morning', -23)], 'apartment:night': [('amb_apartment', -27), ('crickets', -31)], 'bedroom': [('room_tone', -27)], 'classroom': [('amb_classroom', -22)],
        'cafeteria': [('cafeteria_walla', -21)], 'stables': [('amb_countryside', -20)], 'hallway': [('hallway_walla', -23)], 'mansion': [('party_walla', -21), ('party_music_far', -26)],
        'theoDining': [('big_room_echo', -22), ('clock_tick', -30)], 'busInterior': [('bus_interior', -17)], 'island': [('amb_ocean', -18)], 'ocean': [('amb_ocean', -18)],
        'edgeSpace': [('space_drone', -20)], 'carwash': [('water_spray', -24)], 'laundry': [('washer_spin', -28)], 'lawnYard': [('amb_birds', -22)], 'sky': [('amb_ocean', -30)]}
VERB = {'classroom': 'room', 'apartment:dawn': 'small', 'apartment:night': 'small', 'bedroom': 'small', 'laundry': 'small', 'busInterior': 'small', 'hallway': 'hall', 'cafeteria': 'hall',
        'theoDining': 'hall', 'mansion': 'out', 'schoolExt': 'out', 'avenue': 'out', 'street': 'out', 'street:fall': 'out', 'stables': 'out', 'lawnYard': 'out', 'carwash': 'room'}
VERB_P = {'small': (0.25, 0.18), 'room': (0.45, 0.2), 'hall': (0.8, 0.26), 'out': (0.3, 0.08)}
# musical dips (line, end-line-or-None, dB)
DIPS = [(31, 31, -14), (79, 79, -6), (10, 10, -40), (120, 121, -5), (125, 125, 2)]

def main():
    timing = json.loads((ROOT / 'data/timing.json').read_text()); L = timing['lines']
    shots = json.loads((ROOT / 'data/shots.json').read_text()); cues = json.loads((ROOT / 'data/cues.json').read_text())
    mcues = json.loads((ROOT / 'data/music_cues.json').read_text())
    total = shots[-1]['end']; n = int(total * SR) + SR
    vo_path = ROOT / (sys.argv[1] if len(sys.argv) > 1 else 'audio/vo.wav')
    vo = load(vo_path); vo_bus = np.zeros((n, 2), np.float32); vo_bus[:min(n, len(vo))] = vo[:n]
    vo_bus = Pedalboard([HighpassFilter(75), LowShelfFilter(180, -1.5), PeakFilter(3200, 2.0, 0.8), Compressor(-20, 2.5, 8, 120), Gain(0)])(vo_bus.T.copy(), SR).T
    vo_env = env_follow(vo_bus.mean(1)); thr = np.percentile(vo_env[vo_env > 1e-4], 30) if (vo_env > 1e-4).any() else 0.01
    act = np.clip(vo_env / (thr * 2.0), 0, 1) ** 0.7  # 0..1 narration activity

    # ---- music
    mus = np.zeros((n, 2), np.float32)
    for i, c in enumerate(mcues):
        a = load(ROOT / c['file']); dur = c['t1'] - c['t0']
        a = a[: int((dur + 1.2) * SR)]; a = fades(a, 0.25 if i else 0.02, 1.2)
        place(mus, a, c['t0'], db(c['db']))
    auto = np.ones(n, np.float32)
    for l0, l1, d in DIPS:
        t0 = L[l0]['start'] - 0.3; t1 = L[l1]['end'] + 0.3; a0, a1 = int(t0 * SR), int(t1 * SR); r = int(0.4 * SR)
        g = np.ones(a1 - a0 + 2 * r); g[r:-r] = db(d); g[:r] = np.linspace(1, db(d), r); g[-r:] = np.linspace(db(d), 1, r)
        s0 = max(0, a0 - r); auto[s0:s0 + len(g)] = np.minimum(auto[s0:s0 + len(g)], g[: len(auto[s0:s0 + len(g)])]) if d < 0 else auto[s0:s0 + len(g)] * g[: len(auto[s0:s0 + len(g)])]
    mus *= auto[:, None]
    mus *= (1 - act * (1 - db(-9)))[:, None]  # duck ~9 dB under narration

    # ---- sfx cues
    sfx_dry = np.zeros((n, 2), np.float32); sends = {k: np.zeros((n, 2), np.float32) for k in VERB_P}
    shot_by_t = lambda t: next((s for s in reversed(shots) if s['start'] <= t), shots[0])
    cache = {}
    for c in cues:
        p = ROOT / 'audio/sfx' / f"{c['id']}.wav"
        if not p.exists(): print('missing sfx', c['id']); continue
        if c['id'] not in cache: cache[c['id']] = load(p)
        a = cache[c['id']]
        if np.abs(a).max() < 1e-5: continue
        sh = shot_by_t(c['t'] + 0.01)
        if c['id'] in LOOP_IDS:
            dur = max(0.6, sh['end'] - c['t']); a = fades(loop_to(a, int(dur * SR)), 0.25, min(0.6, dur / 3))
        a = pan(a, c.get('pan', 0)) * db(c.get('gain', 0))
        place(sfx_dry, a, c['t'])
        v = VERB.get(sh['set'])
        if v: place(sends[v], a, c['t'], VERB_P[v][1])
    wet = np.zeros((n, 2), np.float32)
    for k, bus in sends.items():
        if np.abs(bus).max() < 1e-6: continue
        room = VERB_P[k][0]; wet += Pedalboard([Reverb(room_size=room, damping=0.55, wet_level=1.0, dry_level=0.0, width=1.0)])(bus.T.copy(), SR).T
    sfx = (sfx_dry + wet) * (1 - act * (1 - db(-3.5)))[:, None]

    # ---- ambience beds per set run (skip ids explicitly cued inside the run)
    amb = np.zeros((n, 2), np.float32); runs = []
    for s in shots:
        if runs and runs[-1]['set'] == s['set'] and abs(runs[-1]['end'] - s['start']) < 0.05: runs[-1]['end'] = s['end']
        else: runs.append({'set': s['set'], 'start': s['start'], 'end': s['end']})
    for r in runs:
        beds = BEDS.get(r['set'], [])
        cued = {c['id'] for c in cues if r['start'] - 0.05 <= c['t'] < r['end']}
        for bid, g in beds:
            if bid in cued: continue
            p = ROOT / 'audio/sfx' / f'{bid}.wav'
            if not p.exists(): continue
            if bid not in cache: cache[bid] = load(p)
            dur = r['end'] - r['start'] + 0.3; a = fades(loop_to(cache[bid], int(dur * SR)), 0.15, 0.3)
            off = (hash(bid) % 1000) / 1000 * 0  # deterministic
            place(amb, a, r['start'], db(g))
    amb *= (1 - act * (1 - db(-5)))[:, None]

    # ---- master
    mixb = vo_bus * db(0) + mus * db(-3.0) + sfx * db(-5.5) + amb * db(5)
    mixb = Pedalboard([Compressor(-14, 1.6, 15, 200)])(mixb.T.copy(), SR).T
    meter = pyln.Meter(SR); lufs = meter.integrated_loudness(mixb)
    for _ in range(3):
        cur = meter.integrated_loudness(mixb); mixb = mixb * db(-14.0 - cur); mixb = lookahead_limit(mixb, db(-1.3))
    mixb = mixb[: int(total * SR)]
    out = ROOT / 'audio' / 'mix.wav'; sf.write(out, mixb, SR, subtype='PCM_24')
    stems = ROOT / 'audio' / 'stems'; stems.mkdir(exist_ok=True)
    for name, x in [('music', mus * db(-3.0)), ('sfx', sfx * db(-5.5)), ('amb', amb * db(5)), ('vo', vo_bus)]: sf.write(stems / f'{name}.wav', x[: int(total * SR)], SR, subtype='PCM_16')
    for name, x in [('vo', vo_bus), ('music', mus * db(-3.0)), ('sfx', sfx * db(-5.5)), ('amb', amb * db(5))]:
        try: print(name, 'LUFS', round(meter.integrated_loudness(x[: int(total * SR)]), 1))
        except Exception as e: print(name, e)
    print('mix', out, f'{total:.1f}s', 'pre-norm LUFS', round(lufs, 2), 'final LUFS', round(meter.integrated_loudness(mixb), 2), 'peak', round(float(np.abs(mixb).max()), 3))

if __name__ == '__main__': main()

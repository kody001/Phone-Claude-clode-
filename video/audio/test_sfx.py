import sys, time, json, numpy as np, soundfile as sf
sys.path.insert(0, '.')
import sfx
from dsp import SR
cues = json.load(open('../data/audio_cues.json'))
ids = sorted(set(c['id'] for c in cues['sfx']))
missing = [i for i in ids if i not in sfx.S]
print('missing:', missing)
bad = []; t0 = time.time()
for k, f in sfx.S.items():
    try:
        y = f(None)
        if y.ndim != 2 or y.shape[1] != 2 or not np.isfinite(y).all(): bad.append((k, 'shape/nan', y.shape))
        pk = np.max(np.abs(y)); 
        if pk > 1.2 or pk < 0.02: bad.append((k, 'peak', round(float(pk), 3)))
    except Exception as e:
        bad.append((k, repr(e)[:120]))
print('bad:', bad); print('n', len(sfx.S), 'time', round(time.time() - t0, 1))

# VO loudness envelope at 60 fps (for lip-flap) -> data/env.json
import json, sys, numpy as np, soundfile as sf
x, sr = sf.read(sys.argv[1]); x = x.mean(axis=1) if x.ndim > 1 else x
hop = sr // 60; n = len(x) // hop
rms = np.sqrt(np.array([np.mean(x[i*hop:(i+1)*hop]**2) for i in range(n)]) + 1e-12)
db = 20*np.log10(rms); v = np.clip((db + 45) / 35, 0, 1)
json.dump({"fps": 60, "v": [round(float(a), 3) for a in v]}, open(sys.argv[2], 'w'))
print(n, v.mean())

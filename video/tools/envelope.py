"""Per-frame (60fps) loudness envelope of the voiceover for lip sync -> build/env.json"""
import json, wave
import numpy as np
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
with wave.open(str(ROOT / "build" / "vo16k.wav")) as w:
    sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
hop = sr // 60
n = len(x) // hop
rms = np.sqrt(np.mean(x[: n * hop].reshape(n, hop) ** 2, axis=1))
db = 20 * np.log10(rms + 1e-5)
lo, hi = -45.0, np.percentile(db, 97)
v = np.clip((db - lo) / (hi - lo), 0, 1)
# light smoothing (attack fast, release slower)
out = np.zeros_like(v); a = 0.0
for i, s in enumerate(v):
    a = s if s > a else a * 0.72 + s * 0.28
    out[i] = a
(ROOT / "build" / "env.json").write_text(json.dumps([round(float(s), 2) for s in out]))
print(n, "frames", "mean", float(out.mean()))

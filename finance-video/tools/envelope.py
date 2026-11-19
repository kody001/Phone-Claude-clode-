"""Voice-over loudness per video frame (60 fps) -> scenes/data/env.js (base64 uint8), drives lip flap."""
import subprocess, base64, pathlib, numpy as np
ROOT = pathlib.Path(__file__).resolve().parent.parent
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(ROOT / 'audio/voiceover.mp3'), '-ac', '1', '-ar', '48000', '-f', 'f32le', '-'], capture_output=True, check=True).stdout
a = np.frombuffer(raw, np.float32)
hop = 800  # 48000 / 60
n = len(a) // hop
rms = np.sqrt((a[:n * hop].reshape(n, hop) ** 2).mean(1))
ref = np.percentile(rms[rms > 1e-4], 95)
v = np.clip(rms / ref, 0, 1) ** 0.7
v = np.convolve(v, np.ones(3) / 3, 'same')
b = (v * 255).astype(np.uint8)
(ROOT / 'scenes/data/env.js').write_text('const ENV_B64 = "' + base64.b64encode(b.tobytes()).decode() + '";\n')
print(n, 'frames', round(n / 60, 2), 's')

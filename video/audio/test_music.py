import sys, time, numpy as np, soundfile as sf
sys.path.insert(0, '.')
from music import mood_render, MOODS
from dsp import SR
out = []
t0 = time.time()
for m in sys.argv[1:]:
    y = mood_render(m, 12, 1); print(m, y.shape, round(float(np.max(np.abs(y))), 3), round(float(np.sqrt(np.mean(y ** 2))), 4), round(time.time() - t0, 1)); out.append(y[:12 * SR])
sf.write(sys.argv[0].replace('test_music.py', 'music_test.wav'), np.concatenate(out) / max(1e-9, np.max(np.abs(np.concatenate(out)))) * 0.8, SR)

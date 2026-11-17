"""Stand-in narration with Kokoro (local, free). Produces audio/vo.wav (48 kHz mono)
and data/timing.json with line + word timings. Replace with align_vo.py once the
real voice-over file is available."""
import json, re, sys, pathlib
import numpy as np, soundfile as sf
from scipy.signal import resample_poly
from kokoro_onnx import Kokoro

ROOT = pathlib.Path(__file__).resolve().parent.parent
VOICE = sys.argv[1] if len(sys.argv) > 1 else 'af_heart'
BASE_SPEED = 0.99
TAG_SPEED = {'enthusiasm': 1.08, 'elation': 1.06, 'surprise': 1.04, 'more expressive': 1.02,
             'sadness': 0.93, 'longing': 0.94, 'contentment': 0.97, 'less expressive': 0.98,
             'fear': 1.03, 'amusement': 1.03, 'affection': 0.97, 'relief': 0.98}
P_ELL, P_SENT, P_LINE, P_COMMA_Q = 0.42, 0.26, 0.5, 0.18
SR = 24000

kok = Kokoro(str(ROOT/'models/kokoro-v1.0.onnx'), str(ROOT/'models/voices-v1.0.bin'))
lines = json.loads((ROOT/'data/script.json').read_text())

def tts_text(tokens):
    out = []
    for t in tokens:
        t = t.replace('"', '').replace('“', '').replace('”', '')
        if re.search(r'[A-Z]{2,}', t) and t.upper() == t:
            t = t.lower()
        out.append(t)
    s = ' '.join(out)
    return s

def syllables(w):
    w = re.sub(r'[^a-z]', '', w.lower())
    if not w: return 1
    n = len(re.findall(r'[aeiouy]+', w))
    if w.endswith('e') and n > 1 and not w.endswith('le'): n -= 1
    return max(1, n) + 0.15 * len(w) / 4

def trim(a, thr_db=-42):
    if len(a) == 0: return a, 0
    env = np.abs(a)
    thr = 10 ** (thr_db / 20) * max(1e-6, env.max())
    idx = np.where(env > thr)[0]
    if len(idx) == 0: return a[:0], 0
    s = max(0, idx[0] - int(0.012 * SR)); e = min(len(a), idx[-1] + int(0.03 * SR))
    return a[s:e], s

audio = [np.zeros(int(0.35 * SR), np.float32)]
t = 0.35
timing = []
for L in lines:
    speed = BASE_SPEED * TAG_SPEED.get(L['tag'], 1.0)
    toks = [w['t'] for w in L['words']]
    frags, cur = [], []
    for i, tok in enumerate(toks):
        cur.append(i)
        bare = tok.rstrip('"”\'')
        if bare.endswith('...'):
            frags.append((cur, P_ELL)); cur = []
        elif re.search(r'[.?!]$', bare):
            frags.append((cur, P_SENT)); cur = []
    if cur: frags.append((cur, P_SENT))
    line_start = t; words_t = [None] * len(toks)
    for fi, (idxs, pause) in enumerate(frags):
        text = tts_text([toks[i] for i in idxs])
        samples, sr = kok.create(text, voice=VOICE, speed=speed, lang='en-us')
        assert sr == SR
        seg, _ = trim(samples.astype(np.float32))
        dur = len(seg) / SR
        wts = np.array([syllables(toks[i]) for i in idxs]); cum = np.concatenate([[0], np.cumsum(wts)]) / wts.sum()
        for k, i in enumerate(idxs):
            words_t[i] = [round(t + cum[k] * dur, 3), round(t + cum[k + 1] * dur, 3)]
        audio.append(seg); t += dur
        if fi < len(frags) - 1:
            audio.append(np.zeros(int(pause * SR), np.float32)); t += pause
    timing.append({'id': L['id'], 'start': round(line_start, 3), 'end': round(t, 3), 'words': words_t})
    gap = P_LINE + (0.18 if L['tag'] in ('sadness', 'longing') else 0)
    audio.append(np.zeros(int(gap * SR), np.float32)); t += gap
    print(f"{L['id']:3d} {line_start:7.2f}-{t:7.2f} {L['text'][:60]}", flush=True)

audio.append(np.zeros(int(1.0 * SR), np.float32))
a = np.concatenate(audio)
a = a / max(1e-6, np.abs(a).max()) * 0.89
a48 = resample_poly(a, 2, 1).astype(np.float32)
sf.write(ROOT/'audio/vo.wav', a48, 48000, subtype='PCM_24')
total = len(a) / SR
(ROOT/'data/timing.json').write_text(json.dumps({'source': f'kokoro:{VOICE}', 'duration': round(total, 3), 'lines': timing}))
print('TOTAL', round(total, 2), 'sec')

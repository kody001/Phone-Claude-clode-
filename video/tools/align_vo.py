"""Align a recorded voice-over to the script and rewrite data/timing.json (line + word timings).
usage: python3 tools/align_vo.py path/to/voiceover.(wav|mp3|m4a) [--out data/timing.json] [--no-copy]
The audio is also copied to audio/vo.wav (48 kHz mono) for the mix unless --no-copy is given.
Recognition: sherpa-onnx offline zipformer (word timestamps) + sequence alignment against the script text."""
import sys, json, re, pathlib, subprocess, tempfile, difflib
import numpy as np, soundfile as sf
import sherpa_onnx

ROOT = pathlib.Path(__file__).resolve().parent.parent
MD = ROOT / 'models' / 'sherpa-onnx-zipformer-en-2023-06-26'

def load16(path):
    with tempfile.TemporaryDirectory() as d:
        w = pathlib.Path(d) / 'a.wav'
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(path), '-ac', '1', '-ar', '16000', str(w)], check=True)
        a, sr = sf.read(w, dtype='float32')
    return a

def split_points(a, sr=16000, target=18.0):
    """cut near target length at the quietest 300 ms window"""
    hop = int(0.05 * sr); e = np.sqrt(np.convolve(a ** 2, np.ones(hop) / hop, 'same'))[::hop]
    cuts = [0]; t = 0
    while t + target * 1.4 < len(a) / sr:
        lo, hi = int((t + target * 0.7) / 0.05), int((t + target * 1.3) / 0.05)
        k = lo + int(np.argmin(np.convolve(e[lo:hi], np.ones(6), 'same'))); t = k * 0.05; cuts.append(int(t * sr))
    cuts.append(len(a)); return cuts

def recognize(a, sr=16000):
    rec = sherpa_onnx.OfflineRecognizer.from_transducer(
        encoder=str(MD / 'encoder-epoch-99-avg-1.int8.onnx'), decoder=str(MD / 'decoder-epoch-99-avg-1.onnx'),
        joiner=str(MD / 'joiner-epoch-99-avg-1.int8.onnx'), tokens=str(MD / 'tokens.txt'), num_threads=4, decoding_method='greedy_search')
    words = []; cuts = split_points(a, sr)
    for c0, c1 in zip(cuts[:-1], cuts[1:]):
        s = rec.create_stream(); s.accept_waveform(sr, a[c0:c1]); rec.decode_stream(s); r = s.result
        off = c0 / sr; cur = None
        for tok, ts in zip(r.tokens, r.timestamps):
            if tok.startswith(('▁', ' ')) or cur is None:
                if cur: words.append(cur)
                cur = {'w': tok.replace('▁', '').strip().lower(), 't': off + ts}
            else: cur['w'] += tok.lower()
        if cur: words.append(cur)
    return words

def norm(w): return re.sub(r"[^a-z0-9']", '', w.lower().replace('’', "'"))

def main():
    src = pathlib.Path(sys.argv[1]); out = ROOT / 'data' / 'timing.json'
    if '--out' in sys.argv: out = pathlib.Path(sys.argv[sys.argv.index('--out') + 1])
    script = json.loads((ROOT / 'data/script.json').read_text())
    a = load16(src); dur = len(a) / 16000
    rw = recognize(a); print(len(rw), 'recognized words over', round(dur, 1), 's')
    sw = [(li, wi, norm(w['n'])) for li, L in enumerate(script) for wi, w in enumerate(L['words'])]
    A = [x[2] for x in sw]; B = [norm(x['w']) for x in rw]
    sm = difflib.SequenceMatcher(a=A, b=B, autojunk=False)
    t = [None] * len(sw)
    for i, j, n in sm.get_matching_blocks():
        for k in range(n): t[i + k] = rw[j + k]['t']
    # fill gaps by linear interpolation by character length
    known = [i for i, v in enumerate(t) if v is not None]
    if not known: raise SystemExit('alignment failed: no matching words')
    matched = len(known) / len(t); print(f'matched {matched:.0%} of script words')
    for i in range(len(t)):
        if t[i] is None:
            p = max([k for k in known if k < i], default=None); q = min([k for k in known if k > i], default=None)
            if p is None: t[i] = max(0.0, t[q] - 0.3 * (q - i))
            elif q is None: t[i] = t[p] + 0.3 * (i - p)
            else:
                w = np.cumsum([1 + len(A[k]) for k in range(p, q + 1)]); t[i] = t[p] + (t[q] - t[p]) * (w[i - p - 1] / w[-2] if w[-2] else 0)
    # refine: recogniser timestamps run early; snap words that follow a pause to the acoustic onset, nudge the rest
    hop = 160; env = np.sqrt(np.convolve(a ** 2, np.ones(hop * 2) / (hop * 2), 'same'))[::hop] + 1e-7; edb = 20 * np.log10(env)
    floor = np.percentile(edb, 8)
    for i in range(len(t)):
        gap = t[i] - t[i - 1] if i else 9
        if gap > 0.3 or i == 0 or sw[i][1] == 0:
            k0, k1 = int(max(0, t[i] - 0.12) * 100), int(min(dur, t[i] + 0.6) * 100)
            seg = edb[k0:k1]
            if len(seg) > 3:
                thr = max(floor + 14, seg.max() - 24); on = np.where(seg > thr)[0]
                if len(on): t[i] = max(t[i], (k0 + on[0]) / 100 - 0.02)
        else:
            t[i] = t[i] + 0.09
    for i in range(1, len(t)): t[i] = max(t[i], t[i - 1] + 0.05)
    lines = []
    for li, L in enumerate(script):
        idx = [k for k, x in enumerate(sw) if x[0] == li]; words = []
        for n_, k in enumerate(idx):
            s0 = t[k]; nxt = t[k + 1] if k + 1 < len(t) else s0 + 0.4
            e0 = min(nxt, s0 + 0.12 + 0.07 * len(A[k])) if nxt > s0 else s0 + 0.25
            words.append([round(s0, 3), round(max(e0, s0 + 0.08), 3)])
        lines.append({'id': li, 'start': round(words[0][0] - 0.03, 3), 'end': words[-1][1], 'words': words})
    for i in range(1, len(lines)):  # keep lines monotonic
        if lines[i]['start'] < lines[i - 1]['end']: lines[i]['start'] = lines[i - 1]['end'] + 0.01
    out.write_text(json.dumps({'source': f'aligned:{src.name}', 'duration': round(dur + 0.5, 3), 'match': round(matched, 3), 'lines': lines}))
    print('wrote', out)
    if '--no-copy' not in sys.argv:
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(src), '-ac', '1', '-ar', '48000', '-c:a', 'pcm_s24le', str(ROOT / 'audio' / 'vo.wav')], check=True)
        print('copied voice-over to audio/vo.wav')

if __name__ == '__main__': main()

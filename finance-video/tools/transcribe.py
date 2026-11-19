"""Transcribe the voice-over into punctuated text with word timings.

usage: python3 tools/transcribe.py audio/voiceover.mp3 [--models DIR]
writes data/transcript.json: {"duration": s, "words": [{"w": "Hello,", "t0": 1.23, "t1": 1.5}, ...]}

Whisper (small.en) gives the punctuated, cased words; a zipformer transducer gives
per-token timestamps. The two word streams are aligned with difflib and any
unmatched Whisper word gets an interpolated time inside its chunk.
"""
import sys, json, re, pathlib, subprocess, tempfile, difflib, os
import numpy as np, soundfile as sf
import sherpa_onnx

ROOT = pathlib.Path(__file__).resolve().parent.parent
MODELS = pathlib.Path(sys.argv[sys.argv.index('--models') + 1]) if '--models' in sys.argv else pathlib.Path(os.environ.get('VO_MODELS', 'models'))
SR = 16000


def load16(path):
    with tempfile.TemporaryDirectory() as d:
        w = pathlib.Path(d) / 'a.wav'
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(path), '-ac', '1', '-ar', str(SR), str(w)], check=True)
        a, _ = sf.read(w, dtype='float32')
    return a


def split_points(a, target=20.0):
    """chunk boundaries near `target` seconds, placed in the quietest 300 ms window"""
    hop = int(0.05 * SR)
    e = np.sqrt(np.convolve(a ** 2, np.ones(hop) / hop, 'same'))[::hop]
    cuts, t = [0], 0.0
    while t + target * 1.35 < len(a) / SR:
        lo, hi = int((t + target * 0.65) / 0.05), int((t + target * 1.25) / 0.05)
        k = lo + int(np.argmin(np.convolve(e[lo:hi], np.ones(6), 'same')))
        t = k * 0.05
        cuts.append(int(t * SR))
    cuts.append(len(a))
    return cuts


def norm(w):
    return re.sub(r"[^a-z0-9']", '', w.lower().replace('’', "'"))


def main():
    src = pathlib.Path(sys.argv[1])
    a = load16(src)
    dur = len(a) / SR
    zd = MODELS / 'sherpa-onnx-zipformer-en-2023-06-26'
    wd = MODELS / 'sherpa-onnx-whisper-small.en'
    zip_rec = sherpa_onnx.OfflineRecognizer.from_transducer(
        encoder=str(zd / 'encoder-epoch-99-avg-1.int8.onnx'), decoder=str(zd / 'decoder-epoch-99-avg-1.onnx'),
        joiner=str(zd / 'joiner-epoch-99-avg-1.int8.onnx'), tokens=str(zd / 'tokens.txt'),
        num_threads=4, decoding_method='greedy_search')
    wh_rec = sherpa_onnx.OfflineRecognizer.from_whisper(
        encoder=str(wd / 'small.en-encoder.int8.onnx'), decoder=str(wd / 'small.en-decoder.int8.onnx'),
        tokens=str(wd / 'small.en-tokens.txt'), num_threads=4, language='en', task='transcribe')

    out_words = []
    cuts = split_points(a)
    for ci, (c0, c1) in enumerate(zip(cuts[:-1], cuts[1:])):
        seg = a[c0:c1]
        off = c0 / SR
        # zipformer: token timestamps -> words
        s = zip_rec.create_stream(); s.accept_waveform(SR, seg); zip_rec.decode_stream(s)
        zw, cur = [], None
        for tok, ts in zip(s.result.tokens, s.result.timestamps):
            if tok.startswith(('▁', ' ')) or cur is None:
                if cur: zw.append(cur)
                cur = {'w': tok.replace('▁', '').strip().lower(), 't': off + ts}
            else:
                cur['w'] += tok.lower()
        if cur: zw.append(cur)
        for i, w in enumerate(zw):
            w['e'] = zw[i + 1]['t'] if i + 1 < len(zw) else min(w['t'] + 0.5, c1 / SR)
        # whisper: punctuated text
        s = wh_rec.create_stream(); s.accept_waveform(SR, seg); wh_rec.decode_stream(s)
        ww = s.result.text.strip().split()
        A = [norm(x) for x in ww]; B = [norm(x['w']) for x in zw]
        t0 = [None] * len(ww); t1 = [None] * len(ww)
        sm = difflib.SequenceMatcher(a=A, b=B, autojunk=False)
        for i, j, n in sm.get_matching_blocks():
            for k in range(n):
                t0[i + k] = zw[j + k]['t']; t1[i + k] = zw[j + k]['e']
        # interpolate gaps by character length between known anchors
        anchors = [(-1, off)] + [(i, t0[i]) for i in range(len(ww)) if t0[i] is not None] + [(len(ww), c1 / SR)]
        for (ia, ta), (ib, tb) in zip(anchors[:-1], anchors[1:]):
            gap = list(range(ia + 1, ib))
            if not gap: continue
            start = t1[ia] if ia >= 0 and t1[ia] else ta
            L = [max(1, len(ww[g])) for g in gap]; tot = sum(L); acc = 0
            for g, l in zip(gap, L):
                t0[g] = start + (tb - start) * acc / tot; acc += l
                t1[g] = start + (tb - start) * acc / tot
        for i, w in enumerate(ww):
            end = min(t1[i], t0[i + 1]) if i + 1 < len(ww) else t1[i]
            out_words.append({'w': w, 't0': round(t0[i], 3), 't1': round(max(end, t0[i] + 0.05), 3), 'chunk': ci})
        matched = sum(1 for i in range(len(ww)) if A[i] in B)
        print(f'chunk {ci:3d} {off:7.1f}s  whisper {len(ww):3d} words, zip {len(zw):3d}, ~matched {matched}', flush=True)

    (ROOT / 'data').mkdir(exist_ok=True)
    (ROOT / 'data' / 'transcript.json').write_text(json.dumps({'duration': dur, 'words': out_words}, indent=0))
    (ROOT / 'data' / 'transcript.txt').write_text(' '.join(w['w'] for w in out_words))
    print(len(out_words), 'words,', round(dur, 1), 's')


if __name__ == '__main__':
    main()

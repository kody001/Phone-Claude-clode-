"""Run pocketsphinx speech recognition over the voiceover in parallel chunks.

Output: build/recognized.json  -> [{"w": word, "s": start_sec, "e": end_sec}, ...]
Chunks are cut at detected silences so no word is split.
"""
import json, re, subprocess, sys, wave
from multiprocessing import Pool
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WAV = ROOT / "build" / "vo16k.wav"
OUT = ROOT / "build" / "recognized.json"


def silences():
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(WAV), "-af",
                        "silencedetect=noise=-35dB:d=0.25", "-f", "null", "-"],
                       capture_output=True, text=True)
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", r.stderr)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", r.stderr)]
    return list(zip(starts, ends))


def chunk_bounds(total, sil, target=25.0):
    mids = [(a + b) / 2 for a, b in sil]
    bounds, last = [0.0], 0.0
    for m in mids:
        if m - last >= target:
            bounds.append(m)
            last = m
    bounds.append(total)
    return list(zip(bounds[:-1], bounds[1:]))


def work(args):
    a, b = args
    from pocketsphinx import Decoder
    with wave.open(str(WAV)) as w:
        sr = w.getframerate()
        w.setpos(int(a * sr))
        data = w.readframes(int((b - a) * sr))
    d = Decoder(samprate=sr, loglevel="FATAL")
    d.start_utt()
    d.process_raw(data, full_utt=True)
    d.end_utt()
    out = []
    for seg in d.seg():
        word = re.sub(r"\(\d+\)$", "", seg.word)
        if word.startswith("<") or word.startswith("[") or word == "<sil>":
            continue
        out.append({"w": word.lower(), "s": round(a + seg.start_frame / 100, 3),
                    "e": round(a + (seg.end_frame + 1) / 100, 3)})
    return out


if __name__ == "__main__":
    with wave.open(str(WAV)) as w:
        total = w.getnframes() / w.getframerate()
    limit = float(sys.argv[1]) if len(sys.argv) > 1 else total
    chunks = [c for c in chunk_bounds(total, silences()) if c[0] < limit]
    with Pool(4) as p:
        res = p.map(work, chunks)
    words = [x for r in res for x in r]
    OUT.write_text(json.dumps(words))
    print(len(chunks), "chunks,", len(words), "words")
    print(" ".join(x["w"] for x in words[:80]))

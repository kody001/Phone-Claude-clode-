"""Forced-align the voiceover to the script with PocketSphinx.

Produces words.json: one entry per caption word of the script (tags and "..." removed),
with start/end times in seconds taken from the audio.

usage: python3 align.py script.txt vo16k.wav out/words.json
"""
import json, re, sys, wave, time

ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()


def int_words(n):
    n = int(n)
    if n < 20:
        return ONES[n]
    if n < 100:
        return TENS[n // 10] + ("" if n % 10 == 0 else " " + ONES[n % 10])
    if n < 1000:
        r = ONES[n // 100] + " hundred"
        return r + ("" if n % 100 == 0 else " " + int_words(n % 100))
    if n < 1_000_000:
        r = int_words(n // 1000) + " thousand"
        return r + ("" if n % 1000 == 0 else " " + int_words(n % 1000))
    r = int_words(n // 1_000_000) + " million"
    return r + ("" if n % 1_000_000 == 0 else " " + int_words(n % 1_000_000))


def year_words(y):
    y = int(y)
    if 2000 <= y <= 2009:
        return int_words(y)
    hi, lo = divmod(y, 100)
    if lo == 0:
        return int_words(hi) + " hundred"
    if lo < 10:
        return int_words(hi) + " oh " + ONES[lo]
    return int_words(hi) + " " + int_words(lo)


def num_words(s):
    s = s.replace(",", "")
    if "." in s:
        a, b = s.split(".")
        return int_words(a) + " point " + " ".join(ONES[int(c)] for c in b)
    return int_words(s)


SPECIAL = {
    "ICE": "ice", "IRS": "i r s", "Niskanen": "nis can in", "Insurify": "in sure if i",
    "Redfin": "red fin", "Redfin's": "red fins", "Bankrate": "bank rate", "Freddie": "freddie",
    "Wharton": "wharton", "co-sponsors": "co sponsors", "30-year": "thirty year",
    "rent-controlled": "rent controlled", "first-quarter": "first quarter",
    "higher-income": "higher income", "higher-paying": "higher paying",
    "single-family": "single family", "four-bedroom": "four bedroom",
    "Empty-nest": "empty nest", "first-time": "first time", "Eighty-two": "eighty two",
    "80s": "eighties", "90s": "nineties", "1960s": "nineteen sixties", "Realtors'": "realtors",
    "Lines'": "lines", "Mac's": "macs", "Association's": "associations",
}


def spoken(tok):
    """Spoken-word form for one caption token (punctuation already present)."""
    core = re.sub(r"^[\"“(]+|[\"”)\.,!?;:]+$", "", tok)
    if not core:
        return ""
    if core in SPECIAL:
        return SPECIAL[core]
    m = re.fullmatch(r"\$([\d,]+(?:\.\d+)?)", core)
    if m:
        return num_words(m.group(1)) + " dollars"
    m = re.fullmatch(r"([\d,]+(?:\.\d+)?)%", core)
    if m:
        return num_words(m.group(1)) + " percent"
    if re.fullmatch(r"(19|20)\d\d", core):
        return year_words(core)
    if re.fullmatch(r"[\d,]+(?:\.\d+)?", core):
        return num_words(core)
    return core.lower().replace("’", "'")


def caption_tokens(script):
    text = re.sub(r"\[[^\]]+\]", " ", script)
    text = text.replace("...", " ")
    return [t for t in text.split() if re.search(r"[A-Za-z0-9]", t)]


def build_sequence(tokens):
    """spoken word list + index of the caption token each spoken word belongs to.
    "$1.1 million" and "$N" before million/trillion move the word 'dollars' after the unit."""
    seq, owner = [], []
    i = 0
    while i < len(tokens):
        tok = tokens[i]
        core = re.sub(r"[\.,!?;:]+$", "", tok)
        nxt = re.sub(r"[\.,!?;:]+$", "", tokens[i + 1]).lower() if i + 1 < len(tokens) else ""
        m = re.fullmatch(r"\$([\d,]+(?:\.\d+)?)", core)
        if m and nxt in ("million", "trillion"):
            for w in num_words(m.group(1)).split():
                seq.append(w); owner.append(i)
            seq.append(nxt); owner.append(i + 1)
            seq.append("dollars"); owner.append(i + 1)
            i += 2
            continue
        for w in spoken(tok).split():
            seq.append(w); owner.append(i)
        i += 1
    return seq, owner


def main():
    script_path, wav_path, out_path = sys.argv[1:4]
    from pocketsphinx import Decoder
    tokens = caption_tokens(open(script_path, encoding="utf-8").read())
    seq, owner = build_sequence(tokens)

    dec = Decoder(samprate=16000, bestpath=False, loglevel="ERROR")
    clean = []
    for w in seq:
        w2 = re.sub(r"[^a-z']", "", w)
        if not w2:
            w2 = "a"
        if dec.lookup_word(w2) is None:
            alt = w2.rstrip("s").rstrip("'")
            if alt and dec.lookup_word(alt):
                w2 = alt
            else:
                print("OOV:", w, file=sys.stderr)
                w2 = "uh"
        clean.append(w2)

    with wave.open(wav_path) as wf:
        audio = wf.readframes(wf.getnframes())

    t0 = time.time()
    dec.set_align_text(" ".join(clean))
    dec.start_utt()
    dec.process_raw(audio, full_utt=True)
    dec.end_utt()
    segs = [s for s in dec.seg() if s.word not in ("<s>", "</s>", "<sil>", "[NOISE]") and not s.word.startswith("+")]
    print("aligned", len(segs), "of", len(clean), "in", round(time.time() - t0, 1), "s", file=sys.stderr)

    times = [None] * len(seq)
    j = 0
    for s in segs:
        w = re.sub(r"\(\d+\)$", "", s.word)
        while j < len(clean) and clean[j] != w:
            j += 1
        if j >= len(clean):
            break
        times[j] = (s.start_frame / 100.0, (s.end_frame + 1) / 100.0)
        j += 1

    out = []
    for k, tok in enumerate(tokens):
        ts = [times[i] for i in range(len(seq)) if owner[i] == k and times[i]]
        out.append({"w": tok, "s": round(ts[0][0], 3) if ts else None, "e": round(ts[-1][1], 3) if ts else None})
    # fill any gaps by interpolation
    for k, o in enumerate(out):
        if o["s"] is None:
            prev = next((out[x]["e"] for x in range(k - 1, -1, -1) if out[x]["e"] is not None), 0.0)
            nxt = next((out[x]["s"] for x in range(k + 1, len(out)) if out[x]["s"] is not None), prev + 0.3)
            o["s"], o["e"] = prev, max(prev + 0.05, nxt)
    json.dump(out, open(out_path, "w"), indent=0)
    print("missing:", sum(1 for t in times if t is None), file=sys.stderr)


if __name__ == "__main__":
    main()

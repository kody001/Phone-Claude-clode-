"""Align script tokens to recognized speech -> build/words.json

Each script token (as displayed in captions) gets start/end seconds.
Matched words anchor the timeline; unmatched words are interpolated
between anchors proportionally to their length.
"""
import difflib, json, re
from pathlib import Path
from num2words import num2words

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "script.txt"
REC = ROOT / "build" / "recognized.json"
OUT = ROOT / "build" / "words.json"

LETTERS = {"HOA": "h o a", "FHA": "f h a", "VA": "v a", "ATTOM": "atom"}


def n2w(n, **kw):
    s = num2words(n, **kw)
    return re.sub(r"[,-]", " ", s).replace(" and ", " ")


def spoken(tok):
    t = tok.strip('"“”.,;:!?…()')
    t = t.replace("...", " ").strip('".,')
    if not t:
        return []
    if t.upper() in LETTERS and t.isupper():
        return LETTERS[t.upper()].split()
    out = []
    for part in re.split(r"[-–]", t):
        part = part.strip('".,…')
        if not part:
            continue
        m = re.fullmatch(r"(\d[\d,]*)(\.\d+)?(%?)", part)
        o = re.fullmatch(r"(\d+)(st|nd|rd|th)", part)
        if o:
            out += n2w(int(o.group(1)), to="ordinal").split()
        elif m:
            whole = m.group(1).replace(",", "")
            if m.group(2):
                out += n2w(float(whole + m.group(2))).split()
            elif "," not in m.group(1) and len(whole) == 4 and 1900 <= int(whole) <= 2099:
                out += n2w(int(whole), to="year").split()
            else:
                out += n2w(int(whole)).split()
            if m.group(3):
                out.append("percent")
        else:
            w = re.sub(r"[^a-z']", "", part.lower())
            w = w.rstrip("'")
            if w.endswith("'s") and False:
                w = w
            if w:
                out.append(w)
    return out


def tokens():
    toks, mood, para = [], "neutral", 0
    for line in SCRIPT.read_text().splitlines():
        if not line.strip():
            continue
        for piece in re.split(r"(\[[^\]]+\])", line):
            if piece.startswith("["):
                mood = piece[1:-1].strip()
                continue
            for raw in piece.split():
                toks.append({"text": raw, "mood": mood, "para": para,
                             "emph": bool(re.search(r"[A-Z]{2,}", raw)) and raw.strip('".,…?!').upper() not in LETTERS and not raw.startswith("ATTOM"),
                             "sp": spoken(raw)})
        para += 1
    return toks


def main():
    toks = tokens()
    rec = json.loads(REC.read_text())
    sw, owner = [], []
    for i, t in enumerate(toks):
        for w in t["sp"]:
            sw.append(w)
            owner.append(i)
    rw = [r["w"] for r in rec]
    sm = difflib.SequenceMatcher(None, sw, rw, autojunk=False)
    times = [None] * len(sw)
    matched = 0
    for a, b, size in sm.get_matching_blocks():
        for k in range(size):
            times[a + k] = (rec[b + k]["s"], rec[b + k]["e"])
            matched += 1
    # interpolate gaps
    n = len(sw)
    i = 0
    total_end = rec[-1]["e"] + 0.5
    while i < n:
        if times[i] is not None:
            i += 1
            continue
        j = i
        while j < n and times[j] is None:
            j += 1
        t0 = times[i - 1][1] if i > 0 else 0.0
        t1 = times[j][0] if j < n else total_end
        lens = [max(2, len(sw[k])) for k in range(i, j)]
        tot = sum(lens)
        cur = t0
        for k, L in zip(range(i, j), lens):
            d = (t1 - t0) * L / tot
            times[k] = (round(cur, 3), round(cur + d, 3))
            cur += d
        i = j
    for t in toks:
        t["s"] = t["e"] = None
    for k, i in enumerate(owner):
        s, e = times[k]
        t = toks[i]
        t["s"] = s if t["s"] is None else min(t["s"], s)
        t["e"] = e if t["e"] is None else max(t["e"], e)
    # tokens with no spoken words (pure punctuation) inherit neighbor time
    for i, t in enumerate(toks):
        if t["s"] is None:
            prev = toks[i - 1]
            t["s"], t["e"] = prev["e"], prev["e"]
        del t["sp"]
    OUT.write_text(json.dumps(toks, indent=0))
    print(f"{len(sw)} script words, {len(rw)} recognized, {matched} matched ({100*matched/len(sw):.1f}%)")
    print("last token", toks[-1])


if __name__ == "__main__":
    main()

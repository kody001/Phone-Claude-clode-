"""Turn the narration script into tokens.

Each token = one word of the script as written (display form) plus the
list of words the narrator actually says (used for forced alignment).
Delivery tags like [awe] are dropped.  Line index is kept so scenes can
be keyed to script lines.
"""
import json, re, sys

SRC = sys.argv[1]
OUT = sys.argv[2]

YEARS = {
    "2013": "twenty thirteen", "2018": "twenty eighteen",
    "2025": "twenty twenty five",
}
LETTERS = {"IPO": "i p o", "NYU": "n y u"}

def spoken(word):
    w = word.strip()
    w = w.replace("“", "").replace("”", "").replace("’", "'")
    core = re.sub(r"^[^\w$]+|[^\w']+$", "", w)
    core = core.strip("'")
    if not core:
        return []
    if core in YEARS:
        return YEARS[core].split()
    if re.fullmatch(r"[Ee]x-A-I(?:'s)?", core):
        return ["ex", "a", "i"]
    base = core[:-2] if core.endswith("'s") else core
    if base.upper() in LETTERS and base.isupper():
        return LETTERS[base.upper()].split()
    parts = [p for p in re.split(r"-", core) if p]
    out = []
    for p in parts:
        p = p.lower()
        out.append(p)
    return out

tokens = []
lines = open(SRC, encoding="utf-8").read().split("\n")
for li, line in enumerate(lines):
    if not line.strip():
        continue
    line = re.sub(r"\[[^\]]*\]", " ", line)
    for raw in line.split():
        sp = spoken(raw)
        if not sp:
            # pure punctuation like "..." attached separately; glue to prev
            if tokens:
                tokens[-1]["text"] += raw
            continue
        tokens.append({"text": raw, "spoken": sp, "line": li})

json.dump(tokens, open(OUT, "w"), indent=0)
words = [w for t in tokens for w in t["spoken"]]
print(len(tokens), "tokens", len(words), "spoken words", len(set(lines)) )

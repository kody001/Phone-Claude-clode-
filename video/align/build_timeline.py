"""Build timeline.json: timed tokens (for scene cues) and caption chunks.

Captions show tidy text: numbers as numerals ($75 billion, 19%), xAI,
AI, Nasdaq-100.  Words the script writes in CAPS are flagged as
emphasis.
"""
import json, re

toks = json.load(open("tokens.json"))
aligned = json.load(open("words_aligned.json"))

# token timing from aligned words
for t in toks:
    t["s"] = None
for w in aligned:
    t = toks[w["tok"]]
    if t["s"] is None:
        t["s"] = w["s"]
    t["e"] = w["e"]

def core(text):
    return re.sub(r"^[^\w$]+|[^\w']+$", "", text.replace("“", "").replace("”", "").replace("’", "'"))

def norm(text):
    return re.sub(r"[^a-z0-9' ]", "", core(text).lower().replace("-", " "))

# ---------------- number parsing for captions ----------------
UNITS = {w: i for i, w in enumerate("zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split())}
TENS = {w: 10 * (i + 2) for i, w in enumerate("twenty thirty forty fifty sixty seventy eighty ninety".split())}
SCALES = {"million": 10**6, "billion": 10**9, "trillion": 10**12}
ORD = {"first": 1, "second": 2, "third": 3, "fifth": 5, "seventh": 7, "eighth": 8, "fifteenth": 15, "twentieth": 20, "thirtieth": 30}
MONTHS = {"january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"}

def parse_number(ws, i):
    """Parse number words starting at ws[i]. Returns (value_str, consumed, scale_word) or None."""
    j = i
    def small(j):
        # parses 1..99 -> (val, j)
        if j < len(ws) and ws[j] in TENS:
            v = TENS[ws[j]]; j += 1
            if j < len(ws) and ws[j] in UNITS and 0 < UNITS[ws[j]] < 10:
                v += UNITS[ws[j]]; j += 1
            return v, j
        if j < len(ws) and ws[j] in UNITS:
            return UNITS[ws[j]], j + 1
        return None, j
    def group(j):
        # up to 999
        if j < len(ws) and ws[j] == "a" and j + 1 < len(ws) and ws[j + 1] == "hundred":
            v = 100; j += 2
        else:
            v, j2 = small(j)
            if v is None:
                return None, j
            j = j2
            if j < len(ws) and ws[j] == "hundred":
                v *= 100; j += 1
            else:
                return v, j
        # after hundred
        k = j
        if k < len(ws) and ws[k] == "and":
            k += 1
        r, k2 = small(k)
        if r is not None and r < 100:
            return v + r, k2
        return v, j
    v, j = group(j)
    if v is None:
        return None
    if j < len(ws) and ws[j] == "thousand":
        j += 1
        r, j2 = group(j)
        v = v * 1000 + (r or 0)
        if r is not None:
            j = j2
    val = str(v)
    if j + 1 < len(ws) and ws[j] == "point":
        digs = []
        k = j + 1
        while k < len(ws) and ws[k] in UNITS and UNITS[ws[k]] < 10:
            digs.append(str(UNITS[ws[k]])); k += 1
        if digs:
            val += "." + "".join(digs); j = k
    if j + 2 < len(ws) and ws[j] == "and" and ws[j + 1] == "a" and ws[j + 2] == "half":
        val = str(v) + ".5"; j += 3
    scale = None
    if j < len(ws) and ws[j] in SCALES:
        scale = ws[j]; j += 1
    return val, j - i, scale

def fmt_int(s):
    if "." in s:
        return s
    return f"{int(s):,}"

# Build display tokens: list of dicts {text, s, e, emph, src:[token idx]}
disp = []
i = 0
N = len(toks)
EMPH_SKIP = {"IPO", "NYU", "AI", "X", "I", "A", "OK"}

def is_emph(text):
    c = core(text)
    c2 = re.sub(r"'S$", "", c)
    return len(c2) >= 2 and c2.isupper() and c2 not in EMPH_SKIP and not re.match(r"^EX-A-I", c2)

def trailing_punct(text):
    m = re.search(r"[^\w'%$]+$", text.replace("’", "'"))
    return m.group(0) if m else ""

def leading_punct(text):
    m = re.match(r"^[“\"]+", text)
    return m.group(0) if m else ""

while i < N:
    t = toks[i]
    text = t["text"]
    c = core(text)
    # xAI
    if re.fullmatch(r"[Ee]x-A-I(?:'s)?", c):
        disp.append({"text": leading_punct(text) + ("xAI's" if c.endswith("'s") else "xAI") + trailing_punct(text), "s": t["s"], "e": t["e"], "emph": False, "src": [i]})
        i += 1; continue
    # A I -> AI
    if c == "A" and i + 1 < N and core(toks[i + 1]["text"]) == "I" and toks[i]["line"] == toks[i + 1]["line"]:
        n2 = toks[i + 1]
        disp.append({"text": leading_punct(text) + "AI" + trailing_punct(n2["text"]), "s": t["s"], "e": n2["e"], "emph": False, "src": [i, i + 1]})
        i += 2; continue
    # Nasdaq one hundred
    if c == "Nasdaq" and i + 2 < N and core(toks[i + 1]["text"]).lower() == "one" and core(toks[i + 2]["text"]).lower() == "hundred":
        n2 = toks[i + 2]
        disp.append({"text": "Nasdaq-100" + trailing_punct(n2["text"]), "s": t["s"], "e": n2["e"], "emph": False, "src": [i, i + 1, i + 2]})
        i += 3; continue
    # month + ordinal
    if c.lower() in MONTHS and i + 1 < N and core(toks[i + 1]["text"]).lower() in ORD:
        n2 = toks[i + 1]
        disp.append({"text": leading_punct(text) + c + " " + str(ORD[core(n2["text"]).lower()]) + trailing_punct(n2["text"]), "s": t["s"], "e": n2["e"], "emph": False, "src": [i, i + 1]})
        i += 2; continue
    # number phrases: gather words across tokens (hyphen-split) with token map
    wl = []
    wmap = []
    k = i
    while k < N and k < i + 14:
        for w in core(toks[k]["text"]).lower().split("-"):
            wl.append(w); wmap.append(k)
        if trailing_punct(toks[k]["text"]).strip(" ") not in ("", "'"):
            break  # don't run across sentence punctuation
        k += 1
    p = parse_number(wl, 0) if wl and (wl[0] in UNITS or wl[0] in TENS or (wl[0] == "a" and len(wl) > 1 and wl[1] == "hundred")) else None
    if p:
        val, used, scale = p
        rest = wl[used:]
        dollars = False; percent = False; cents = None; suffix = ""
        extra = 0
        if rest[:1] in (["dollars"], ["dollar"]):
            dollars = True; extra = 1
            # dollars and seventy-nine cents
            if rest[1:2] == ["and"]:
                q = parse_number(rest, 2)
                if q and rest[2 + q[1]:3 + q[1]] == ["cents"]:
                    cents = q[0]; extra = 2 + q[1] + 1
        elif rest[:1] == ["percent"]:
            percent = True; extra = 1
        elif rest[:1] in (["day"],):
            suffix = "-day"; extra = 1
        used_total = used + extra
        # only convert when meaningful
        num = float(val)
        convert = bool(scale or dollars or percent or num >= 10 or suffix)
        last_tok = wmap[used_total - 1]
        # hyphenated token partially consumed? (e.g. 'six-billion-dollar' fully consumed ok)
        if convert and all(wmap[x] <= last_tok for x in range(used_total)):
            # ensure we end on a token boundary
            if used_total < len(wmap) and wmap[used_total] == last_tok:
                convert = False
        if convert:
            s = fmt_int(val)
            if cents:
                s = s + "." + cents.zfill(2)
            if scale:
                sc = scale
                # keep caps emphasis on scale word if script had it
                src_scale_tok = [toks[x]["text"] for x in range(i, last_tok + 1) if core(toks[x]["text"]).lower() == scale]
                if src_scale_tok and core(src_scale_tok[0]).isupper():
                    sc = scale.upper()
                s = s + " " + sc
            if dollars:
                s = "$" + s
                if "-" in toks[last_tok]["text"] and core(toks[last_tok]["text"]).lower().endswith("dollar"):
                    s = s.replace(" ", "-")
            if percent:
                s = s + "%"
            s += suffix
            emph = any(is_emph(toks[x]["text"]) for x in range(i, last_tok + 1))
            disp.append({"text": leading_punct(text) + s + trailing_punct(toks[last_tok]["text"]), "s": t["s"], "e": toks[last_tok]["e"], "emph": emph, "src": list(range(i, last_tok + 1))})
            i = last_tok + 1
            continue
    disp.append({"text": text, "s": t["s"], "e": t["e"], "emph": is_emph(text), "src": [i]})
    i += 1

# ---------------- caption chunks ----------------
chunks = []
cur = []
def flush():
    global cur
    if cur:
        chunks.append(cur); cur = []
for k, d in enumerate(disp):
    cur.append(k)
    txt = " ".join(disp[x]["text"] for x in cur)
    nxt = disp[k + 1] if k + 1 < len(disp) else None
    end_punct = re.search(r"(\.\.\.|[.?!,:;…])[”\"]?$", d["text"])
    gap = (nxt["s"] - d["e"]) if nxt else 9
    newline = nxt is not None and toks[nxt["src"][0]]["line"] != toks[d["src"][0]]["line"]
    nxt_ends = nxt is not None and re.search(r"(\.\.\.|[.?!,:;\u2026])[\u201d\"]?$", nxt["text"]) and len(txt) + 1 + len(nxt["text"]) <= 40 and gap < 0.45 and not newline
    if newline or (len(cur) >= 6 and not nxt_ends) or (len(txt) >= 30 and not nxt_ends) or len(cur) >= 7 or (end_punct and len(cur) >= 2) or gap > 0.45 or (end_punct and re.search(r"[.?!]$", d["text"])):
        flush()
flush()

caps = []
for ci, ch in enumerate(chunks):
    words = [{"t": disp[k]["text"], "s": round(disp[k]["s"], 3), "e": round(disp[k]["e"], 3), "em": disp[k]["emph"]} for k in ch]
    start = words[0]["s"]
    end = words[-1]["e"] + 0.25
    if ci + 1 < len(chunks):
        nstart = disp[chunks[ci + 1][0]]["s"]
        end = min(max(end, words[-1]["e"] + 0.05), nstart) if nstart - words[-1]["e"] < 0.8 else words[-1]["e"] + 0.35
    caps.append({"s": round(start, 3), "e": round(end, 3), "w": words})

out = {
    "duration": 1098.14,
    "tokens": [{"n": norm(t["text"]), "s": round(t["s"], 3), "e": round(t["e"], 3), "l": t["line"]} for t in toks],
    "captions": caps,
}
json.dump(out, open("timeline.json", "w"), separators=(",", ":"))
print(len(disp), "display tokens;", len(caps), "caption chunks")
# show a sample of converted numbers
for d in disp:
    if re.search(r"[0-9]", d["text"]) or d["text"].startswith(("xAI", "AI", "Nasdaq")):
        print(repr(d["text"]), end="  ")
print()

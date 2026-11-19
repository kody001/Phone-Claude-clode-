"""Apply caption corrections to the machine transcript and write data/words.js.

Each fix replaces a run of recognized words with corrected caption text; the new words
share the original run's time span (split by character length), so timing stays tied to
the voice-over. A replacement of None keeps the words as timing anchors but hides them
from the captions (used for two garbled bits of the voice-over).
"""
import json, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent

FIXES = [
    ("Not chat GPT,", "Not ChatGPT,"),
    ("Now, There are", "Now, there are"),
    ("jumps faster, the new power plants can get built. The price shoots up.", "jumps faster than new power plants can get built, the price shoots up."),
    ("Oh, but two!", None),
    ("in the building. including", "in the building, including"),
    ("The party is the growth. and the bill", "The party is the growth. And the bill"),
    ("Moto Energy found that without", "Modo Energy found that without"),
    ("Moto Energy found that utilities", "Modo Energy found that utilities"),
    ("fits the restaurant in the auction before this one the monitor found data centers drove about six point five billion dollars in costs and about six point two billion of that",
     "fits the restaurant. In the auction before this one, the monitor found data centers drove about $6.5 billion in costs, and about $6.2 billion of that"),
    ("Office of People's Council,", "Office of People's Counsel,"),
    ("Yep, yeah.", None),
    ("homes in america as of the middle of twenty twenty five americans owed more than twenty three billion dollars in past two energy bills and when you fall far enough behind the power gets cut.",
     "homes in America. As of the middle of 2025, Americans owed more than $23 billion in past-due energy bills, and when you fall far enough behind, the power gets cut."),
    ("Pjm only accepted thirty four it cut the guest list by more than forty percent", "PJM only accepted 34. It cut the guest list by more than 40%"),
    ("phantom data center demand request for power", "phantom data center demand, requests for power"),
    ("since twenty eighteen and the dealership", "since 2018. And the dealership"),
    ("When wisconsin watch asked about the data center boom tod stewart who runs", "When Wisconsin Watch asked about the data center boom, Todd Stuart, who runs"),
    ("the rest of us gets stuck", "the rest of us get stuck"),
    ("the Bill's House sponsor", "the bill's House sponsor"),
    ("and an industry that could", "And an industry that could"),
]


def norm(w):
    return re.sub(r"[^a-z0-9$%.]", '', w.lower()).strip('.')


def main():
    src = json.loads((ROOT / 'data' / 'transcript.json').read_text())
    words = [dict(w=w['w'], t0=w['t0'], t1=w['t1'], cap=True) for w in src['words']]
    for find, repl in FIXES:
        ft = [norm(x) for x in find.split()]
        hit = None
        for i in range(len(words) - len(ft) + 1):
            if all(norm(words[i + k]['w']) == ft[k] for k in range(len(ft))):
                hit = i; break
        if hit is None:
            raise SystemExit(f'fix not found: {find!r}')
        span = words[hit:hit + len(ft)]
        if repl is None:
            for w in span: w['cap'] = False
            continue
        new = repl.split()
        t0, t1 = span[0]['t0'], span[-1]['t1']
        # keep the original word times where counts match, else spread by length
        if len(new) == len(span):
            for w, n in zip(span, new): w['w'] = n
            continue
        L = [max(1, len(n)) for n in new]; tot = sum(L); acc = 0; out = []
        for n, l in zip(new, L):
            a = t0 + (t1 - t0) * acc / tot; acc += l
            out.append(dict(w=n, t0=round(a, 3), t1=round(t0 + (t1 - t0) * acc / tot, 3), cap=True))
        words[hit:hit + len(ft)] = out
    for w in words:
        w['w'] = w['w'].replace('"', '').replace('“', '').replace('”', '')
    data = {'duration': src['duration'], 'words': [[w['w'], w['t0'], w['t1'], 1 if w['cap'] else 0] for w in words]}
    (ROOT / 'data' / 'words.json').write_text(json.dumps(data))
    (ROOT / 'scenes' / 'data').mkdir(exist_ok=True)
    (ROOT / 'scenes' / 'data' / 'words.js').write_text('const WORDS = ' + json.dumps(data) + ';\n')
    (ROOT / 'data' / 'captions_text.txt').write_text(' '.join(w['w'] for w in words if w['cap']))
    print(len(words), 'words written')


if __name__ == '__main__':
    main()

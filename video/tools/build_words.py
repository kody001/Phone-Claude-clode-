# Map forced-alignment output back onto script tokens -> data/words.json
import json, re, sys, os
D = os.path.join(os.path.dirname(__file__), '..', 'data')
paras = json.load(open(f'{D}/paras.json'))
al = [x for x in json.load(open(f'{D}/full_align.json')) if x['w'] not in ('<sil>','<s>','</s>','(NULL)','[NOISE]')]
k = 0
out = []
for p in paras:
    toks = []
    for w in p['words']:
        if not w['n']:
            continue
        seg = al[k:k+len(w['n'])]
        for n, a in zip(w['n'], seg):
            assert re.sub(r'\(\d+\)$', '', a['w']) == n, (n, a)
        k += len(w['n'])
        toks.append({'t': w['t'], 's': seg[0]['s'], 'e': seg[-1]['e']})
    out.append({'i': p['i'], 'tags': p['tags'], 'text': p['text'], 's': toks[0]['s'], 'e': toks[-1]['e'], 'w': toks} if toks else
               {'i': p['i'], 'tags': p['tags'], 'text': p['text'], 's': None, 'e': None, 'w': []})
# fill timing for token-less paragraphs (e.g. "...")
for i, p in enumerate(out):
    if p['s'] is None:
        prev = out[i-1]['e']; nxt = out[i+1]['s']
        p['s'], p['e'] = prev + 0.1, nxt - 0.1
assert k == len(al)
json.dump(out, open(f'{D}/words.json', 'w'), indent=0)
for p in out:
    print(f"{p['i']:3d} {p['s']:7.2f}-{p['e']:7.2f} {p['text'][:70]}")

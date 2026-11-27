"""Write YouTube-ready .srt captions from build/words.json (same chunking rules as the burned-in captions)."""
import json, re, sys
words = json.load(open(sys.argv[1]))
clean = lambda w: re.sub(r'[,;:."”)]+$', '', re.sub(r'^["“(]+', '', w))
chunks, cur = [], []
for i, w in enumerate(words):
    cur.append(w)
    nxt = words[i + 1] if i + 1 < len(words) else None
    gap = nxt['s'] - w['e'] if nxt else 9
    chars = sum(len(x['w']) + 1 for x in cur)
    if not nxt or gap > 0.32 or re.search(r'[.!?]["”]?$', w['w']) or len(cur) >= 6 or chars > 30 or (re.search(r'[,;:]$', w['w']) and len(cur) >= 3):
        chunks.append(cur); cur = []
def ts(t):
    h, r = divmod(t, 3600); m, s = divmod(r, 60)
    return f"{int(h):02d}:{int(m):02d}:{int(s):02d},{int(round((s - int(s)) * 1000)) % 1000:03d}"
out = []
for k, c in enumerate(chunks):
    s = c[0]['s']; e = min(chunks[k + 1][0]['s'], c[-1]['e'] + 0.7) if k + 1 < len(chunks) else c[-1]['e'] + 1
    out.append(f"{k + 1}\n{ts(s)} --> {ts(e)}\n{' '.join(clean(x['w']) for x in c)}\n")
open(sys.argv[2], 'w').write('\n'.join(out))
print(len(chunks), 'captions')

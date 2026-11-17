"""Parse the narration script into lines (paragraphs) with emotion tag and word tokens."""
import json, re, sys, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
src = ROOT.parent / 'script' / 'poor-kid-billionaire-school.txt'
lines = []
for para in [p.strip() for p in src.read_text().split('\n') if p.strip()]:
    m = re.match(r'^\[([^\]]+)\]\s*', para)
    tag = m.group(1) if m else None
    text = para[m.end():] if m else para
    words = []
    for tok in text.split():
        core = re.sub(r'^[^\w$]+|[^\w%]+$', '', tok.replace('’', "'"))
        emph = bool(re.search(r'[A-Z]{2,}', core)) and core.upper() == core
        words.append({'t': tok, 'n': core.lower(), 'emph': emph})
    lines.append({'id': len(lines), 'tag': tag, 'text': text, 'words': words})
out = ROOT / 'data' / 'script.json'
out.write_text(json.dumps(lines, indent=1))
print(len(lines), 'lines,', sum(len(l['words']) for l in lines), 'words ->', out)

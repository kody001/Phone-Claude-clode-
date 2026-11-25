import re, json, sys, os, pocketsphinx
src = sys.argv[1]
paras = [p.strip() for p in open(src).read().split("\n\n") if p.strip()]
d = os.path.join(os.path.dirname(pocketsphinx.__file__),'model','en-us','cmudict-en-us.dict')
vocab=set()
for line in open(d):
    w=line.split()[0]; vocab.add(re.sub(r'\(\d+\)$','',w))
out=[]; oov=set()
for i,p in enumerate(paras):
    tags = re.findall(r'\[([^\]]+)\]', p)
    disp = re.sub(r'\[[^\]]+\]\s*','',p).strip()
    toks = disp.split()
    words=[]
    for t in toks:
        ns=[]
        for part in re.split(r'[-–—/]', t.lower().replace('’',"'")):
            n = re.sub(r"[^a-z']", '', part).strip("'")
            if n:
                ns.append(n)
                if n not in vocab: oov.add(n)
        words.append({"t":t,"n":ns})
    out.append({"i":i,"tags":tags,"text":disp,"words":words})
json.dump(out, open(sys.argv[2],'w'), indent=1)
print(len(out),"paras; OOV:",sorted(oov))

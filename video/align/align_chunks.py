import json, time, os
from pocketsphinx import Decoder, get_model_path
toks=json.load(open("tokens.json"))
words=[]; owner=[]
for i,x in enumerate(toks):
    for w in x["spoken"]:
        words.append(w); owner.append(i)
raw=open("vo16k.raw","rb").read()
total=len(raw)/2/16000
mp=get_model_path()
# build dictionary = CMU dict + our extra pronunciations
with open("custom.dict","w") as out:
    out.write(open(os.path.join(mp,"en-us/cmudict-en-us.dict")).read())
    out.write(open("extra.dict").read())
dec=Decoder(hmm=os.path.join(mp,"en-us/en-us"), dict="custom.dict", samprate=16000, loglevel="FATAL", beam=1e-80, wbeam=1e-60, pbeam=1e-80)
WIN=45.0
cur_w=0; cur_t=0.0; out=[]
t0=time.time()
attempt=0
WINS=[45.0,30.0,60.0,20.0,75.0,25.0,50.0]
while cur_w < len(words):
    WIN=WINS[attempt%len(WINS)]
    end_t=min(total, cur_t+WIN)
    last = end_t>=total-0.01
    K=min(len(words)-cur_w, int(WIN*4.2))
    seq=words[cur_w:cur_w+K]
    trans=[(i,i+1,1.0,w) for i,w in enumerate(seq)]
    final=K+1
    trans+= [(i,final,0.001) for i in range(1,K+1)]
    name="g%d"%cur_w
    fsg=dec.create_fsg(name,0,final,trans)
    dec.add_fsg(name,fsg)
    dec.activate_search(name)
    chunk=raw[int(cur_t*16000)*2:int(end_t*16000)*2]
    dec.start_utt(); dec.process_raw(chunk, full_utt=True); dec.end_utt()
    sg=dec.seg()
    if sg is None:
        attempt+=1; print("retry",attempt,"at",cur_t); 
        if attempt>12: break
        continue
    attempt=0
    segs=[(s.word, cur_t+s.start_frame/100, cur_t+(s.end_frame+1)/100) for s in sg]
    ws=[s for s in segs if not s[0].startswith("<") and not s[0].startswith("[") and s[0]!="(NULL)"]
    if not ws:
        print("no words at", cur_t); break
    if last:
        acc=ws
    else:
        acc=[s for s in ws if s[2] < end_t-5.0]
        if not acc: acc=ws[:max(1,len(ws)//2)]
    for k,s in enumerate(acc):
        base=s[0].split("(")[0]
        exp=words[cur_w+k]
        if base!=exp:
            print("MISMATCH", base, exp, s); 
        out.append({"w":exp,"s":s[1],"e":s[2],"tok":owner[cur_w+k]})
    cur_w+=len(acc)
    cur_t=acc[-1][2]
    print(f"t={cur_t:7.2f} words={cur_w}/{len(words)} ({time.time()-t0:.0f}s)", flush=True)
    if last and cur_w<len(words):
        print("ran out of audio with", len(words)-cur_w, "words left"); break
json.dump(out, open("words_aligned.json","w"))

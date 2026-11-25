import json, sys, time, wave
from pocketsphinx import Decoder
paras=json.load(open(sys.argv[1])); wav=sys.argv[2]; out=sys.argv[3]
t0=float(sys.argv[4]) if len(sys.argv)>4 else 0; t1=float(sys.argv[5]) if len(sys.argv)>5 else 1e9
p0=int(sys.argv[6]) if len(sys.argv)>6 else 0; p1=int(sys.argv[7]) if len(sys.argv)>7 else len(paras)
dec=Decoder(samprate=16000, bestpath=False, beam=1e-100, wbeam=1e-80, pbeam=1e-100)
dec.add_word("unzips","AH N Z IH P S", True)
toks=[]
for p in paras[p0:p1]:
    for w in p["words"]:
        toks += w["n"]
text=" ".join(toks)
w=wave.open(wav); sr=w.getframerate()
w.setpos(int(t0*sr)); raw=w.readframes(int((min(t1,w.getnframes()/sr)-t0)*sr))
t=time.time()
dec.set_align_text(text)
dec.start_utt(); dec.process_raw(raw, full_utt=True); dec.end_utt()
res=[]
if dec.hyp() is None: print("FAILED"); sys.exit(1)
for sg in dec.seg():
    res.append({"w":sg.word,"s":round(t0+sg.start_frame/100,3),"e":round(t0+(sg.end_frame+1)/100,3)})
json.dump(res,open(out,'w'))
print("words",len([r for r in res if r['w'] not in('<sil>','<s>','</s>','(NULL)')]),"of",len(toks),"time",round(time.time()-t,1))

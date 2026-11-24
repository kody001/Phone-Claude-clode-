import numpy as np, json
from PIL import Image
im=np.asarray(Image.open("elon_original.jpg").convert("RGB")).astype(np.float32)
H,W,_=im.shape
bg=np.array([63,128,177],np.float32)
# local bg estimate: blur-free, use global but allow slight variation
d=np.sqrt(((im-bg)**2).sum(-1))
a=np.clip((d-28)/(75-28),0,1)
# unmix colour
rgb=im.copy()
m=(a>0)&(a<1)
aa=a[m][:,None]
rgb[m]=np.clip((im[m]-(1-aa)*bg)/np.maximum(aa,0.15),0,255)
alpha=a.copy()
cx=697
# find rows where gap between suit and arm exists
def span(y):
    row=alpha[y]
    l=cx
    while l>0 and row[l-1]>0.35: l-=1
    r=cx
    while r<W-1 and row[r+1]>0.35: r+=1
    return l,r
gap_start=None
for y in range(395,520):
    l,r=span(y)
    left_outer=(alpha[y,500:l]>0.5).any()
    right_outer=(alpha[y,r+1:900]>0.5).any()
    if left_outer and right_outer:
        gap_start=y; break
print("gap_start",gap_start)
body=alpha.copy()
for y in range(gap_start,H):
    l,r=span(y)
    body[y,:l]=0; body[y,r+1:]=0
# suit bottom per column with median filter
bottom=np.zeros(W,int)
for x in range(560,840):
    y=600
    while y<H and alpha[y,x]>0.35: y+=1
    bottom[x]=y
bm=bottom.copy()
for x in range(575,825):
    bm[x]=int(np.median(bottom[x-14:x+15]))
for x in range(560,840):
    body[bm[x]+1:,x]=0
body[:, :560]=0; body[:,840:]=0
# remove arm stubs above gap: cut along suit edge lines
def cut_line(p0,p1,side):
    (x0_,y0_),(x1_,y1_)=p0,p1
    for y in range(int(y0_),int(y1_)+1):
        t=(y-y0_)/(y1_-y0_); xe=x0_+(x1_-x0_)*t
        if side<0: body[y,:int(np.floor(xe))]=0; body[y,int(np.floor(xe))]*= (1-(xe-np.floor(xe)))
        else: body[y,int(np.ceil(xe))+1:]=0
LCUT=((641,397),(612,476)); RCUT=((754,397),(785,476))
cut_line(*LCUT,-1); cut_line(*RCUT,1)
# outline colour on all partial-alpha silhouette pixels
navy=np.array([4,7,20],np.float32)
edge=(body>0.01)&(body<0.97)
rgb[edge]=navy
ys,xs=np.where(body>0.02)
x0,x1,y0,y1=xs.min()-2,xs.max()+3,ys.min()-2,ys.max()+3
print("bbox",x0,y0,x1,y1)
out=np.dstack([rgb,body*255]).astype(np.uint8)[y0:y1,x0:x1]
img=Image.fromarray(out,"RGBA")
from PIL import ImageDraw
dr=ImageDraw.Draw(img)
for (p0,p1) in (LCUT,RCUT):
    dr.line([(p0[0]-x0,p0[1]-y0+4),(p1[0]-x0,p1[1]-y0)],fill=(4,7,20,255),width=5)
img.save("elon_body.png")
# centerlines of limbs (from original alpha, outside the body)
limb=alpha*(body<0.02)
def centers(x_lo,x_hi,ys_):
    res=[]
    for y in ys_:
        xs_=np.where(limb[y,x_lo:x_hi]>0.5)[0]
        if len(xs_): res.append((y,float(xs_.mean()+x_lo),int(len(xs_))))
    return res
info={"bbox":[int(x0),int(y0),int(x1),int(y1)],"gap_start":int(gap_start),
 "leftArm":centers(560,cx-60,range(gap_start,655,8)),
 "rightArm":centers(cx+60,840,range(gap_start,655,8)),
 "leftLeg":centers(630,690,range(645,768,8)),
 "rightLeg":centers(705,770,range(645,768,8)),
 "suitBottom":{int(x):int(bm[x]) for x in range(600,800,10)}}
json.dump(info,open("elon_body.json","w"),indent=1)
print(json.dumps(info))

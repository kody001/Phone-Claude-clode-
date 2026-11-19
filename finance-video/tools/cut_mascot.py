"""Cut the channel mascot out of its blue background into puppet pieces, WITHOUT redrawing it.

usage: python3 tools/cut_mascot.py assets/mascot_ref.jpg
writes assets/mascot/{core,armL,armR,legL,legR}.png and scenes/data/mascot.js

- Only the blue background is removed (alpha from how blue each pixel is; the blue fringe on
  outline pixels is un-mixed). Every visible pixel of the character is the original image.
- Head, face, hair and suit stay one untouched piece ("core").
- The thin stick arms and legs are separated with a morphological opening and saved as their
  own pieces so the renderer can swing them at the shoulders and hips.
"""
import sys, json, base64, io, pathlib
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = pathlib.Path(__file__).resolve().parent.parent
src = Image.open(sys.argv[1] if len(sys.argv) > 1 else ROOT / 'assets/mascot_ref.jpg').convert('RGB')
im = np.asarray(src).astype(np.float32)
H, W, _ = im.shape
R, G, B = im[..., 0], im[..., 1], im[..., 2]
br = B - R
# background colour from the image border
edge = np.concatenate([im[:24].reshape(-1, 3), im[-24:].reshape(-1, 3), im[:, :24].reshape(-1, 3), im[:, -24:].reshape(-1, 3)])
bg = np.median(edge, 0)
bg_br = float(bg[2] - bg[0])
hi, lo = bg_br - 16, 10.0
alpha = np.clip((hi - br) / (hi - lo), 0, 1) ** 1.6  # firmer edge falloff, no halo
# keep only the character: biggest connected blob of solid pixels (+ everything attached)
solid = alpha > 0.5
lab, n = ndi.label(solid, structure=np.ones((3, 3)))
sizes = ndi.sum(solid, lab, range(1, n + 1))
keep = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s > 400])
near = ndi.binary_dilation(keep, iterations=3)
alpha = np.where(near, alpha, 0)
# semi-transparent edge pixels take the colour of the nearest solid character pixel, so no blue
# (or JPEG-ringing) fringe survives; solid pixels keep their original colour
solid_px = alpha >= 0.9
_, (iy, ix) = ndi.distance_transform_edt(~solid_px, return_indices=True)
rgb = np.where(solid_px[..., None], im, im[iy, ix])

# split thin limbs from the solid body
fgm = alpha > 0.45
yy, xx = np.mgrid[-10:11, -10:11]
disk = (xx ** 2 + yy ** 2) <= 90
opened = ndi.binary_opening(fgm, structure=disk)
lab2, n2 = ndi.label(opened)
sizes2 = ndi.sum(opened, lab2, range(1, n2 + 1))
body = lab2 == (int(np.argmax(sizes2)) + 1)
core_mask = ndi.binary_dilation(body, iterations=3)
thin = (alpha > 0.02) & ~core_mask
lab3, n3 = ndi.label(thin, structure=np.ones((3, 3)))
parts = {}
ys_all, xs_all = np.nonzero(alpha > 0.5)
cx = float(np.median(xs_all))
hem = None
for i in range(1, n3 + 1):
    m = lab3 == i
    cnt = int(m.sum())
    if cnt < 60:
        continue
    ys, xs = np.nonzero(m)
    my, mx = ys.mean(), xs.mean()
    if ys.max() - ys.min() < 60:
        continue
    kind = ('leg' if my > 650 else 'arm') + ('L' if mx < cx else 'R')
    parts.setdefault(kind, np.zeros_like(m))
    parts[kind] |= m
print('pieces:', {k: int(v.sum()) for k, v in parts.items()})
assert set(parts) == {'armL', 'armR', 'legL', 'legR'}, parts.keys()

limb_union = np.zeros((H, W), bool)
for m in parts.values():
    limb_union |= m
core_alpha = np.where(limb_union, 0, alpha)

ys, xs = np.nonzero(alpha > 0.5)
feet_y = int(ys.max())
origin = [cx, float(feet_y)]
out_dir = ROOT / 'assets' / 'mascot'
out_dir.mkdir(parents=True, exist_ok=True)
meta = {'origin': origin, 'size': [W, H], 'pieces': {}}


def save(name, a):
    ys, xs = np.nonzero(a > 0.01)
    x0, x1, y0, y1 = max(0, xs.min() - 2), min(W, xs.max() + 3), max(0, ys.min() - 2), min(H, ys.max() + 3)
    rgba = np.dstack([rgb[y0:y1, x0:x1], a[y0:y1, x0:x1, None] * 255]).astype(np.uint8)
    img = Image.fromarray(rgba, 'RGBA')
    img.save(out_dir / f'{name}.png')
    buf = io.BytesIO(); img.save(buf, 'PNG')
    return {'x': int(x0), 'y': int(y0), 'w': int(x1 - x0), 'h': int(y1 - y0), 'png': base64.b64encode(buf.getvalue()).decode()}


meta['pieces']['core'] = save('core', core_alpha)
for k, m in parts.items():
    ys, xs = np.nonzero(m)
    touch0 = m & ndi.binary_dilation(core_mask, iterations=2)
    ty0, tx0 = np.nonzero(touch0)
    jx, jy = (float(tx0.mean()), float(ty0.min())) if len(ty0) else (float(xs.mean()), float(ys.min()))
    # overlap: copy the original stub pixels just above the joint into the limb piece so the
    # rotated limb keeps covering the joint (no gap), they stay in the body piece as well
    gy, gx = np.mgrid[0:H, 0:W]
    near_joint = ((gx - jx) ** 2 + (gy - jy) ** 2 <= 16 ** 2) & (alpha > 0.3) & (gy >= jy - 16)
    a = np.where(m | near_joint, alpha, 0)
    info = save(k, a)
    # joint = limb pixels touching the body; hand/foot = farthest point from the joint
    touch = m & ndi.binary_dilation(core_mask, iterations=2)
    ty, tx = np.nonzero(touch)
    if len(ty):
        top = np.argmin(ty)
        joint = [float(tx[ty <= ty.min() + 6].mean()), float(ty.min() + 4)]
    else:
        joint = [float(xs[ys == ys.min()].mean()), float(ys.min())]
    d = (xs - joint[0]) ** 2 + (ys - joint[1]) ** 2
    far = np.argsort(d)[-40:]
    tip = [float(xs[far].mean()), float(ys[far].mean())]
    info['joint'] = joint
    info['tip'] = tip
    meta['pieces'][k] = info
    print(k, 'joint', [round(v) for v in joint], 'tip', [round(v) for v in tip])
# full cut-out (all pieces, unchanged pose) for reference
Image.fromarray(np.dstack([rgb, alpha[..., None] * 255]).astype(np.uint8), 'RGBA').save(out_dir / 'full.png')
(ROOT / 'scenes' / 'data' / 'mascot.js').write_text('const MASCOT_IMG = ' + json.dumps(meta) + ';\n')
print('origin', origin, 'height', feet_y - ys.min())

"""Cut the channel mascot out of the user's image WITHOUT redrawing it.

Produces (in assets/):
  mascot_head.png  - head exactly as in the source (hair, face, ears)
  mascot_body.png  - suit/shirt/tie torso exactly as in the source, with the thin
                     stick arms and legs removed so they can be re-posed
  mascot.json      - pixel anchors (shoulders, hips, neck pivot, face features),
                     sampled colors and limb thickness, in source pixel units.
The stick limbs are re-drawn at render time with the same color/thickness/shape.
"""
import json
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "mascot_original.jpg"
im = np.asarray(Image.open(SRC).convert("RGB")).astype(np.float32)
H, W, _ = im.shape
r, g, b = im[..., 0], im[..., 1], im[..., 2]

# --- background (blue) detection -------------------------------------------
bg = (b > 120) & (b - r > 60) & (g > 90)
bg = ndi.binary_opening(bg, iterations=1)
# local background color by normalized convolution
sig = 25
wsum = ndi.gaussian_filter(bg.astype(np.float32), sig) + 1e-6
bgcol = np.stack([ndi.gaussian_filter(im[..., c] * bg, sig) / wsum for c in range(3)], -1)

OUT_COL = np.array([14, 18, 32], np.float32)  # outline navy-black
# alpha from distance between pixel and local bg, relative to outline vs bg
d_px = np.linalg.norm(im - bgcol, axis=-1)
d_ol = np.linalg.norm(OUT_COL - bgcol, axis=-1)
alpha = np.clip(d_px / d_ol, 0, 1)
alpha[bg & (alpha < 0.35)] = 0
fg_core = ndi.binary_erosion(alpha > 0.95, iterations=1)

# figure region: largest connected component of non-bg
lab, n = ndi.label(alpha > 0.25)
sizes = ndi.sum(np.ones_like(alpha), lab, range(1, n + 1))
fig = lab == (1 + int(np.argmax(sizes)))
fig = ndi.binary_fill_holes(fig)

# color: interior pixels keep their real color; only the thin anti-aliased rim
# touching the background is recolored to the outline color (removes blue halo)
rgb = im.copy()
rim = fig & ndi.binary_dilation(~fig, iterations=2)
rgb[rim] = OUT_COL
A = np.where(rim, alpha, fig.astype(np.float32))

# --- split head / body --------------------------------------------------------
ys, xs = np.nonzero(fig)
# skin mask to find chin per column
skin = (r > 180) & (g > 140) & (b > 110) & (r - b > 40)
head_cols = range(600, 800)
chin = {}
for x in head_cols:
    col = np.nonzero(skin[:420, x])[0]
    if len(col):
        chin[x] = col.max()
chin_y = max(v for x, v in chin.items() if 650 <= x <= 745)
NECK_Y = int(chin_y) + 6           # just below the chin outline
print("chin y", chin_y)

yy, xx = np.mgrid[0:H, 0:W]
head_mask = np.zeros_like(fig)
for x in range(W):
    cy = chin.get(x)
    cut = int(max(cy, 380)) + 7 if cy is not None and 600 <= x <= 795 else 392
    if 640 <= x <= 755 and cy is not None:
        cut = int(cy) + 7
    head_mask[:cut, x] = fig[:cut, x]

body_mask = fig & ~head_mask
# remove thin limbs: opening with disk larger than limb width
limb_free = ndi.binary_opening(body_mask, structure=np.ones((3, 3)), iterations=9)
limb_free = ndi.binary_dilation(limb_free, iterations=3) & body_mask
lab2, n2 = ndi.label(limb_free)
s2 = ndi.sum(np.ones_like(alpha), lab2, range(1, n2 + 1))
torso = lab2 == (1 + int(np.argmax(s2)))
# the area under the chin is covered by the head; extend torso up under it a bit
torso_ext = torso.copy()

# jaw outline fragments that fell between head and torso go back to the head
extra = fig & ~head_mask & ~torso & (yy < 412) & (xx > 612) & (xx < 785)
head_mask |= extra
body_mask &= ~extra
# trim the stubs where the original stick arms left the suit (they are re-drawn)
torso &= ~(((xx < 611) | (xx > 785)) & (yy > 446))
limbs = body_mask & ~torso


def save(mask, name):
    ys, xs = np.nonzero(mask)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    rgba = np.dstack([rgb, A * mask * 255]).astype(np.uint8)[y0:y1, x0:x1]
    Image.fromarray(rgba, "RGBA").save(ROOT / "assets" / name)
    return [int(x0), int(y0), int(x1 - x0), int(y1 - y0)]


head_box = save(head_mask, "mascot_head.png")
body_box = save(torso, "mascot_body.png")
limbs_box = save(limbs, "debug_limbs.png")

# --- anchors ------------------------------------------------------------------
tys, txs = np.nonzero(torso)
top = tys.min()
bottom = tys.max()
# limb thickness: median run width of limb pixels per row
lys, lxs = np.nonzero(limbs & (yy > 470) & (yy < 600))
runs = []
for y in np.unique(lys):
    row = np.nonzero(limbs[y])[0]
    if len(row):
        splits = np.split(row, np.nonzero(np.diff(row) > 1)[0] + 1)
        runs += [len(s) for s in splits]
thick = float(np.median(runs)) if runs else 9.0


def first_row_extent(mask, y):
    row = np.nonzero(mask[y])[0]
    return (int(row.min()), int(row.max())) if len(row) else None


# shoulders: the torso outer edges ~25px below its top
sh_y = int(top + 28)
sl, sr = first_row_extent(torso, sh_y)
# hips: legs start at the torso bottom; find the leg columns just below torso
leg_y = int(bottom + 12)
legrow = np.nonzero(limbs[leg_y])[0]
legruns = np.split(legrow, np.nonzero(np.diff(legrow) > 1)[0] + 1)
legruns = [r_ for r_ in legruns if len(r_) > 3]
hips = [float(r_.mean()) for r_ in legruns][:2]
# feet: lowest limb pixels left/right of center
cx = W / 2
fys, fxs = np.nonzero(limbs & (yy > bottom + 40))
foot_y = int(fys.max())
# hands: lowest limb pixel on each side outside torso extent, above torso bottom
hys, hxs = np.nonzero(limbs & (yy < bottom + 5) & ((xx < sl + 10) | (xx > sr - 10)))
lh = hys[hxs < cx].max(); rh = hys[hxs > cx].max()
lhx = hxs[(hxs < cx)][np.argmax(hys[hxs < cx])]
rhx = hxs[(hxs > cx)][np.argmax(hys[hxs > cx])]

samp = lambda x, y, s=3: [int(v) for v in im[y - s:y + s, x - s:x + s].reshape(-1, 3).mean(0)]
meta = {
    "src_size": [W, H],
    "head_box": head_box,
    "body_box": body_box,
    "neck_pivot": [697, int(chin_y)],
    "shoulder_l": [sl + 6, sh_y - 14],
    "shoulder_r": [sr - 6, sh_y - 14],
    "hip_l": [hips[0], int(bottom) - 6] if len(hips) > 1 else [670, int(bottom)],
    "hip_r": [hips[1], int(bottom) - 6] if len(hips) > 1 else [725, int(bottom)],
    "hand_l": [int(lhx), int(lh)],
    "hand_r": [int(rhx), int(rh)],
    "foot_y": foot_y,
    "limb_thickness": thick,
    "line_color": [int(v) for v in OUT_COL],
    "skin": samp(700, 330),
    "skin_cheek": samp(650, 310),
    "brow_color": samp(650, 255, 1),
    "eye_l": [658, 274], "eye_r": [730, 274],
    "brow_l": [[632, 256], [672, 253]], "brow_r": [[715, 253], [757, 256]],
    "mouth": {"x0": 655, "x1": 745, "y": 345},
}
(ROOT / "assets" / "mascot.json").write_text(json.dumps(meta, indent=1))
print(json.dumps(meta, indent=1))

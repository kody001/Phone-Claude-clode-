"""Cut the channel mascot out of its blue background into rig pieces.

The head and torso art are kept pixel-for-pixel; only the blue background is removed.
Arms and legs are plain black strokes in the original, so they are erased here and
redrawn as animated strokes of the same width and colour by the renderer.

usage: python3 cut_mascot.py mascot.jpg out_dir
"""
import json, sys
import numpy as np
from PIL import Image, ImageDraw

src, out = sys.argv[1:3]
im = Image.open(src).convert("RGB")
a = np.asarray(im).astype(np.float32)
H, W, _ = a.shape

BG = np.array([64, 128, 176], np.float32)
INK = np.array([14, 17, 28], np.float32)

dist = np.sqrt(((a - BG) ** 2).sum(2))
cand = (dist < 62).astype(np.uint8) * 255
flood = Image.fromarray(cand).copy()
for seed in [(0, 0), (W - 1, 0), (0, H - 1), (W - 1, H - 1), (W // 2, 0), (5, H // 2), (W - 6, H // 2)]:
    if flood.getpixel(seed) == 255:
        ImageDraw.floodfill(flood, seed, 128)
# also clear enclosed background pockets (e.g. between the legs under the jacket)
for y in range(0, H, 3):
    for x in range(0, W, 3):
        if dist[y, x] < 15 and flood.getpixel((x, y)) == 255:
            ImageDraw.floodfill(flood, (x, y), 128)
bg = np.asarray(flood) == 128
fg = ~bg

# ---- head / torso split ----
cut = np.full(W, 400)
for x in range(W):
    col = bg[330:401, x]
    hits = np.flatnonzero(col)
    if len(hits):
        cut[x] = 330 + hits[0]
yy, xx = np.mgrid[0:H, 0:W]
head = fg & (yy < cut[None, :]) & (yy > 100) & (xx > 585) & (xx < 812)
head &= yy < 398

# ---- torso: per row keep only wide runs (drops arms and legs) ----
torso = np.zeros_like(fg)
for y in range(380, 655):
    row = fg[y].copy()
    edges = np.flatnonzero(np.diff(np.r_[0, row.astype(np.int8), 0]))
    for s, e in zip(edges[::2], edges[1::2]):
        if e - s >= 20 and 595 <= (s + e) / 2 <= 800:
            torso[y, s:e] = True

# The original arms hug the jacket from the shoulder down to ~y=480 and merge with its
# outline there. Trim them off along the jacket's own outer edge, then re-ink that edge.
EDGE_L = [(636, 396), (630, 410), (627, 420), (623, 430), (620, 440), (617, 450), (615, 460), (614, 470), (612, 480), (610, 500)]
EDGE_R = [(759, 396), (765, 410), (770, 420), (774, 430), (777, 440), (779, 450), (781, 460), (782, 470), (783, 480), (787, 500)]


def edge_x(poly, y):
    for (x0, y0), (x1, y1) in zip(poly, poly[1:]):
        if y0 <= y <= y1:
            return x0 + (x1 - x0) * (y - y0) / max(1, y1 - y0)
    return None


for y in range(386, 501):
    xl, xr = edge_x(EDGE_L, y), edge_x(EDGE_R, y)
    if xl is not None:
        torso[y, : int(round(xl))] = False
    if xr is not None:
        torso[y, int(round(xr)) + 1:] = False


def soft_alpha(mask):
    """alpha=1 inside; anti-aliased ring by unmixing ink against the blue background."""
    m = mask.copy()
    ring = np.zeros_like(m)
    for dy in (-2, -1, 0, 1, 2):
        for dx in (-2, -1, 0, 1, 2):
            ring |= np.roll(np.roll(m, dy, 0), dx, 1)
    ring &= ~m & bg
    near_bg = bg & ~m
    edge_in = m & (np.roll(near_bg, 1, 0) | np.roll(near_bg, -1, 0) | np.roll(near_bg, 1, 1) | np.roll(near_bg, -1, 1))
    alpha = m.astype(np.float32)
    v = INK - BG
    t = ((a - BG) * v).sum(2) / (v * v).sum()
    t = np.clip(t, 0, 1)
    alpha[ring] = t[ring]
    alpha[edge_in] = np.maximum(t[edge_in], 0.85)
    rgb = a.copy()
    sel = ring | edge_in
    # pure ink colour on the edges so no blue fringe survives
    for c in range(3):
        ch = rgb[..., c]
        ch[ring] = INK[c]
        mixed = (a[..., c] - (1 - alpha) * BG[c]) / np.maximum(alpha, 1e-3)
        ch[edge_in] = np.clip(mixed[edge_in], 0, 255)
    return rgb, alpha


def ink_polyline(rgb, alpha, poly, width):
    SS = 4
    lay = Image.new("L", (W * SS, H * SS), 0)
    ImageDraw.Draw(lay).line([(x * SS, y * SS) for x, y in poly], fill=255, width=int(width * SS), joint="curve")
    for x, y in (poly[0], poly[-1]):
        r = width * SS / 2
        ImageDraw.Draw(lay).ellipse([x * SS - r, y * SS - r, x * SS + r, y * SS + r], fill=255)
    cov = np.asarray(lay.resize((W, H), Image.LANCZOS)).astype(np.float32) / 255
    for c in range(3):
        rgb[..., c] = rgb[..., c] * (1 - cov) + INK[c] * cov
    np.maximum(alpha, cov, out=alpha)


def save_piece(mask, name, outlines=()):
    rgb, alpha = soft_alpha(mask)
    for poly in outlines:
        ink_polyline(rgb, alpha, poly, 3.6)
    ys, xs = np.nonzero(alpha > 0.02)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    rgba = np.dstack([rgb, alpha * 255]).astype(np.uint8)[y0:y1, x0:x1]
    Image.fromarray(rgba, "RGBA").save(f"{out}/{name}.png")
    return [int(x0), int(y0), int(x1 - x0), int(y1 - y0)]


rig = {
    "source_size": [W, H],
    "head": save_piece(head, "head"),
    "torso": save_piece(torso, "torso", [[(x + 1.5, y) for x, y in EDGE_L], [(x - 1.5, y) for x, y in EDGE_R]]),
    # anchor points in source pixels
    "neck": [697, 396],
    "shoulderL": [633, 404], "shoulderR": [762, 404],
    "hipL": [664, 646], "hipR": [732, 646],
    "handRestL": [577, 642], "handRestR": [818, 642],
    "elbowRestL": [586, 520], "elbowRestR": [807, 520],
    "footL": [662, 758], "footR": [737, 758],
    "armWidth": 11, "legWidth": 12.5, "ink": [14, 17, 28],
    # face features (source px) for expression overlays
    "mouth": [697, 346], "mouthW": 84,
    "browL": [[633, 257], [672, 252]], "browR": [[716, 252], [757, 256]],
    "browColor": [101, 64, 38], "browWidth": 6.5,
    "eyeL": [658, 276], "eyeR": [733, 275], "eyeW": 38,
    "skin": [234, 181, 150],
}
json.dump(rig, open(f"{out}/rig.json", "w"), indent=1)
print(json.dumps(rig))

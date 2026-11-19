// Hand-drawn ink primitives. Shapes are built from point lists that get a small,
// seeded wobble so lines look drawn by hand but stay identical from frame to frame.
'use strict';

const INK = {
  // subdivide a polyline and push points sideways with smooth noise
  wob(pts, o = {}) {
    const amp = o.amp == null ? 1.6 : o.amp, step = o.step || 14, seed = o.seed || 1, closed = !!o.closed;
    if (amp <= 0) return pts;
    const src = closed ? pts.concat([pts[0]]) : pts;
    const out = [];
    let along = 0;
    for (let i = 0; i < src.length - 1; i++) {
      const [x0, y0] = src[i], [x1, y1] = src[i + 1];
      const L = Math.hypot(x1 - x0, y1 - y0);
      const n = Math.max(1, Math.round(L / step));
      const nx = L ? -(y1 - y0) / L : 0, ny = L ? (x1 - x0) / L : 0;
      for (let k = 0; k < n; k++) {
        const f = k / n, d = U.noise(seed, (along + L * f) / 38) * amp;
        out.push([x0 + (x1 - x0) * f + nx * d, y0 + (y1 - y0) * f + ny * d]);
      }
      along += L;
    }
    if (!closed) {
      const [xl, yl] = src[src.length - 1];
      out.push([xl, yl]);
    }
    return out;
  },
  // smooth path through points with quadratic midpoints
  path(pts, closed, smooth = true) {
    const p = new Path2D();
    if (pts.length < 2) return p;
    if (!smooth || pts.length < 3) {
      p.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]);
      if (closed) p.closePath();
      return p;
    }
    if (closed) {
      const n = pts.length, m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const s = m(pts[n - 1], pts[0]);
      p.moveTo(s[0], s[1]);
      for (let i = 0; i < n; i++) { const c = pts[i], e = m(c, pts[(i + 1) % n]); p.quadraticCurveTo(c[0], c[1], e[0], e[1]); }
      p.closePath();
    } else {
      p.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length - 1; i++) {
        const c = pts[i], e = [(c[0] + pts[i + 1][0]) / 2, (c[1] + pts[i + 1][1]) / 2];
        p.quadraticCurveTo(c[0], c[1], e[0], e[1]);
      }
      const l = pts[pts.length - 1]; p.lineTo(l[0], l[1]);
    }
    return p;
  },
  ellipsePts(cx, cy, rx, ry, o = {}) {
    const seed = o.seed || 7, irr = o.irr == null ? 0.025 : o.irr;
    const n = Math.max(14, Math.round((rx + ry) * 0.35));
    const out = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (o.rot || 0);
      const k = 1 + U.noise(seed, i * 0.7) * irr;
      out.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
    }
    return out;
  },
  rectPts(x, y, w, h, r = 0) {
    if (!r) return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
    const out = [], seg = 4;
    const corner = (cx, cy, a0) => { for (let i = 0; i <= seg; i++) { const a = a0 + (i / seg) * Math.PI / 2; out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
    corner(x + w - r, y + r, -Math.PI / 2); corner(x + w - r, y + h - r, 0); corner(x + r, y + h - r, Math.PI / 2); corner(x + r, y + r, Math.PI);
    return out;
  },
  bez(p0, c1, c2, p3, n = 16) {
    const out = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, u = 1 - t;
      out.push([u * u * u * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p3[0],
        u * u * u * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p3[1]]);
    }
    return out;
  },
  quad(p0, c, p1, n = 12) {
    const out = [];
    for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; out.push([u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]]); }
    return out;
  },
  // fraction of a polyline (for "drawing on" animations)
  partial(pts, k) {
    if (k >= 1) return pts;
    if (k <= 0) return [pts[0]];
    let total = 0; const seg = [];
    for (let i = 0; i < pts.length - 1; i++) { const d = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); seg.push(d); total += d; }
    let want = total * k; const out = [pts[0]];
    for (let i = 0; i < seg.length; i++) {
      if (want >= seg[i]) { out.push(pts[i + 1]); want -= seg[i]; continue; }
      const f = seg[i] ? want / seg[i] : 0;
      out.push([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f]);
      break;
    }
    return out;
  },
};

// Pen: draws immediately on a ctx, or records Path2D ops for cached replay.
class Pen {
  constructor(ctx, seed = 1, amp = 1.6) { this.ctx = ctx; this.seed = seed; this.amp = amp; this.ops = null; this.n = 0; }
  static recorder(seed, amp) { const p = new Pen(null, seed, amp); p.ops = []; return p; }
  _seed() { return (this.seed * 31 + (this.n++) * 7919) | 0; }
  _emit(op) {
    if (this.ops) { this.ops.push(op); return; }
    Pen.run(this.ctx, op);
  }
  static run(ctx, op) {
    if (op.text != null) {
      ctx.save();
      ctx.font = op.font; ctx.textAlign = op.align || 'center'; ctx.textBaseline = op.base || 'middle';
      ctx.translate(op.x, op.y); if (op.rot) ctx.rotate(op.rot);
      if (op.stroke) { ctx.lineWidth = op.lw || 6; ctx.strokeStyle = op.stroke; ctx.lineJoin = 'round'; ctx.strokeText(op.text, 0, 0); }
      ctx.fillStyle = op.fill || COL.ink; ctx.fillText(op.text, 0, 0);
      ctx.restore();
      return;
    }
    if (op.fill) { ctx.fillStyle = op.fill; ctx.fill(op.p); }
    if (op.stroke) {
      ctx.lineWidth = op.lw; ctx.strokeStyle = op.stroke; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.stroke(op.p);
    }
  }
  static replay(ctx, ops) { for (const op of ops) Pen.run(ctx, op); }
  // closed filled+outlined shape
  shape(pts, o = {}) {
    const w = INK.wob(pts, { amp: o.amp == null ? this.amp : o.amp, seed: this._seed(), closed: true, step: o.step });
    this._emit({ p: INK.path(w, true, o.smooth !== false), fill: o.fill, stroke: o.stroke === undefined ? COL.ink : o.stroke, lw: o.lw || 5 });
  }
  line(pts, o = {}) {
    const w = INK.wob(pts, { amp: o.amp == null ? this.amp : o.amp, seed: this._seed(), step: o.step });
    this._emit({ p: INK.path(w, false, o.smooth !== false), stroke: o.stroke || COL.ink, lw: o.lw || 5 });
  }
  seg(x1, y1, x2, y2, o) { this.line([[x1, y1], [x2, y2]], o); }
  ellipse(cx, cy, rx, ry, o = {}) { this.shape(INK.ellipsePts(cx, cy, rx, ry, { seed: this._seed(), irr: o.irr }), o); }
  circle(cx, cy, r, o) { this.ellipse(cx, cy, r, r, o); }
  rect(x, y, w, h, o = {}) { this.shape(INK.rectPts(x, y, w, h, o.r || 0), Object.assign({ smooth: !!o.r }, o)); }
  text(str, x, y, o = {}) {
    this._emit({ text: String(str), x, y, font: o.font || `700 ${o.size || 40}px Kalam`, fill: o.fill || COL.ink, align: o.align, base: o.base, rot: o.rot, stroke: o.stroke, lw: o.lw });
  }
}

// cache of recorded vector drawings, keyed by name + params
const SPRITES = new Map();
function sprite(key, seed, fn) {
  let ops = SPRITES.get(key);
  if (!ops) { const p = Pen.recorder(seed == null ? U.hash(key) : seed, 1.6); fn(p); ops = p.ops; SPRITES.set(key, ops); }
  return ops;
}

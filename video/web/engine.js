// ============================================================
//  2D stickman finance video engine (deterministic, time-based)
//  renderAt(t) draws the frame for time t (seconds) on #c.
// ============================================================
'use strict';
const W = 1920, H = 1080, FPS = 60;
const INK = '#16171d';
const canvas = document.getElementById('c');
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext('2d');

// ---------------- math / easing ----------------
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = {
  out: t => 1 - Math.pow(1 - t, 3),
  in: t => t * t * t,
  inOut: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  back: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  backBig: t => { const c1 = 2.6, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  bounce: t => { const n1 = 7.5625, d1 = 2.75; if (t < 1 / d1) return n1 * t * t; if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + .75; if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + .9375; return n1 * (t -= 2.625 / d1) * t + .984375; },
};
function rnd(seed) { let s = (seed * 2654435761) >>> 0; return () => { s += 0x6D2B79F5; let t = s; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
const rad = d => d * Math.PI / 180;
function rot2(v, a) { const c = Math.cos(a), s = Math.sin(a); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c]; }

// ---------------- hand-drawn primitives ----------------
let SEED = 1;
function jitter(pts, closed, amp, seed, step = 16) {
  const R = rnd(seed); const out = []; const n = pts.length;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    const d = Math.hypot(b[0] - a[0], b[1] - a[1]); const k = Math.max(1, Math.ceil(d / step));
    for (let j = 0; j < k; j++) { const t = j / k; out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
  }
  if (!closed) out.push(pts[n - 1]);
  const off = out.map(() => [(R() - .5) * 2 * amp, (R() - .5) * 2 * amp]);
  const m = off.length;
  return out.map((p, i) => {
    const a = off[(i - 1 + m) % m], o = off[i], b = off[(i + 1) % m];
    let ox = (a[0] + 2 * o[0] + b[0]) / 4, oy = (a[1] + 2 * o[1] + b[1]) / 4;
    if (!closed && (i === 0 || i === m - 1)) { ox *= .4; oy *= .4; }
    return [p[0] + ox, p[1] + oy];
  });
}
function tracePts(c, pts, closed) {
  c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
  if (closed) c.closePath();
}
// shape: polygon with optional fill + wobbly stroke
function shape(c, pts, o = {}) {
  const seed = o.seed ?? (SEED++);
  const amp = o.amp ?? 1.3;
  const closed = o.closed ?? true;
  const jp = amp > 0 ? jitter(pts, closed, amp, seed, o.step || 16) : pts;
  c.lineJoin = 'round'; c.lineCap = 'round';
  if (o.fill && closed) { tracePts(c, jp, true); c.fillStyle = o.fill; c.fill(); }
  if (o.stroke !== null && o.stroke !== false) {
    tracePts(c, jp, closed); c.strokeStyle = o.stroke || INK; c.lineWidth = o.lw ?? 5; c.stroke();
  }
}
function ellPts(cx, cy, rx, ry, n, a0 = 0, a1 = Math.PI * 2) {
  n = n || Math.max(18, Math.round((rx + ry) / 3));
  const pts = []; const full = Math.abs(a1 - a0 - Math.PI * 2) < 1e-6;
  const cnt = full ? n : n + 1;
  for (let i = 0; i < cnt; i++) { const a = a0 + (a1 - a0) * i / n; pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
  return pts;
}
function circle(c, cx, cy, r, o = {}) { shape(c, ellPts(cx, cy, r, r), { step: 12, ...o }); }
function ellipse(c, cx, cy, rx, ry, o = {}) { shape(c, ellPts(cx, cy, rx, ry), { step: 12, ...o }); }
function rrPts(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2); const pts = []; const k = 4;
  const corner = (cx, cy, a0) => { for (let i = 0; i <= k; i++) { const a = a0 + Math.PI / 2 * i / k; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  if (r <= 0) return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  corner(x + w - r, y + r, -Math.PI / 2); corner(x + w - r, y + h - r, 0); corner(x + r, y + h - r, Math.PI / 2); corner(x + r, y + r, Math.PI);
  return pts;
}
function rect(c, x, y, w, h, o = {}) { shape(c, rrPts(x, y, w, h, o.r ?? 0), o); }
function line(c, pts, o = {}) { shape(c, pts, { closed: false, amp: o.amp ?? 1.0, ...o }); }
function curve(c, pts, o = {}) {
  // smooth open stroke through pts (catmull-rom)
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let j = 0; j < 10; j++) {
      const t = j / 10, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map(k => .5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)));
    }
  }
  out.push(pts[pts.length - 1]);
  shape(c, out, { closed: o.closed ?? false, amp: o.amp ?? .8, step: 30, ...o });
}
function arrowHead(c, x, y, ang, size, o = {}) {
  const a = [x + Math.cos(ang + 2.55) * size, y + Math.sin(ang + 2.55) * size];
  const b = [x + Math.cos(ang - 2.55) * size, y + Math.sin(ang - 2.55) * size];
  if (o.filled) shape(c, [a, [x, y], b], { fill: o.color || INK, stroke: o.color || INK, lw: o.lw ?? 6, seed: o.seed });
  else line(c, [a, [x, y], b], { stroke: o.color || INK, lw: o.lw ?? 6, seed: o.seed });
}
const FONTS = { hand: '"Patrick Hand"', marker: '"Permanent Marker"', gochi: '"Gochi Hand"', cap: 'Fredoka' };
function text(c, str, x, y, o = {}) {
  const size = o.size || 48;
  c.save();
  c.translate(x, y); if (o.rot) c.rotate(rad(o.rot));
  c.font = `${o.weight || 400} ${size}px ${FONTS[o.font || 'hand']}`;
  c.textAlign = o.align || 'center'; c.textBaseline = o.base || 'middle';
  const lines = String(str).split('\n'); const lh = size * (o.lh || 1.1);
  lines.forEach((ln, i) => {
    const yy = (i - (lines.length - 1) / 2) * lh;
    if (o.outline) { c.lineJoin = 'round'; c.strokeStyle = o.outline; c.lineWidth = o.olw || 8; c.strokeText(ln, 0, yy); }
    c.fillStyle = o.color || INK; c.fillText(ln, 0, yy);
  });
  c.restore();
}
function textWidth(str, size, font = 'hand', weight = 400) { ctx.save(); ctx.font = `${weight} ${size}px ${FONTS[font]}`; const w = ctx.measureText(str).width; ctx.restore(); return w; }

// ---------------- sprite cache ----------------
const SPR = new Map();
const PROPS = {};
function defProp(name, w, h, draw) { PROPS[name] = { w, h, draw }; }
function getSprite(name, p = {}) {
  const key = name + '|' + JSON.stringify(p);
  let s = SPR.get(key); if (s) return s;
  const def = PROPS[name]; if (!def) throw new Error('no prop ' + name);
  const w = typeof def.w === 'function' ? def.w(p) : def.w, h = typeof def.h === 'function' ? def.h(p) : def.h;
  const SC = 2, pad = 16;
  const cv = document.createElement('canvas'); cv.width = Math.ceil((w + pad * 2) * SC); cv.height = Math.ceil((h + pad * 2) * SC);
  const c = cv.getContext('2d'); c.scale(SC, SC); c.translate(pad, pad);
  SEED = hashStr(key) % 100000 + 1;
  def.draw(c, p, w, h);
  s = { cv, w, h, pad }; SPR.set(key, s); return s;
}
function drawSprite(c, name, p, x, y, s = 1) { const sp = getSprite(name, p); c.drawImage(sp.cv, x - (sp.w / 2 + sp.pad) * s, y - (sp.h / 2 + sp.pad) * s, (sp.w + sp.pad * 2) * s, (sp.h + sp.pad * 2) * s); }

// ============================================================
//  ELON MASCOT RIG  (body image is the user's artwork, untouched)
// ============================================================
const ELON_IMG = new Image(); ELON_IMG.src = 'elon_body.png';
const EL = {
  ox: 589 - 697, oy: 126 - 768,          // body image top-left (local)
  shL: [638 - 697, 410 - 768], shR: [757 - 697, 410 - 768],
  hipL: [663 - 697, 643 - 768], hipR: [731 - 697, 643 - 768],
  footL: [655 - 697, 757 - 768], footR: [740 - 697, 757 - 768],
  L1: 108, L2: 100, lw: 11.5, ink: '#05081a',
  hipC: [697 - 697, 640 - 768],
  skin: 'rgb(232,182,150)', brow: 'rgb(104,62,32)',
  // rest hand positions relative to shoulder, outward-positive x
  rest: [62, 193],
};
const F = (x, y) => [x - 697, y - 768]; // source px -> local
function solveIK(S, T, L1, L2, bendSign) {
  let dx = T[0] - S[0], dy = T[1] - S[1]; let d = Math.hypot(dx, dy);
  const maxd = (L1 + L2) * 0.999, mind = Math.abs(L1 - L2) + 2;
  if (d > maxd) { dx *= maxd / d; dy *= maxd / d; d = maxd; }
  if (d < mind) { const k = mind / Math.max(d, 1e-3); dx *= k; dy *= k; d = mind; }
  const th = Math.atan2(dy, dx);
  const al = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  const a = th + bendSign * al;
  const E = [S[0] + Math.cos(a) * L1, S[1] + Math.sin(a) * L1];
  return { E, Wr: [S[0] + dx, S[1] + dy] };
}
function solveIKPref(S, T, L1, L2, pref) {
  const a = solveIK(S, T, L1, L2, 1), b = solveIK(S, T, L1, L2, -1);
  const sc = E => (E[0] - S[0]) * pref[0] + (E[1] - S[1]) * pref[1];
  return sc(a.E) >= sc(b.E) ? a : b;
}
function prefFor(bend, side) {
  if (bend === 'in') return [-side, 0.4];
  if (bend === 'up') return [side * 0.4, -1];
  if (bend === 'down') return [0, 1];
  return [side, 0.75];
}
function limbPath(c, S, E, Wr, lw, color) {
  c.beginPath(); c.moveTo(S[0], S[1]);
  const cp = [2 * E[0] - (S[0] + Wr[0]) / 2, 2 * E[1] - (S[1] + Wr[1]) / 2];
  c.quadraticCurveTo(cp[0], cp[1], Wr[0], Wr[1]);
  c.lineWidth = lw; c.strokeStyle = color; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke();
}
function drawHand(c, E, Wr, type, side, lw, color, extra = {}) {
  // side: -1 left (outward = -x), +1 right
  let u = [Wr[0] - E[0], Wr[1] - E[1]]; const ul = Math.hypot(u[0], u[1]) || 1; u = [u[0] / ul, u[1] / ul];
  let n = [-u[1], u[0]]; if (n[0] * side < 0 || (Math.abs(n[0]) < 0.2 && n[1] > 0)) n = [-n[0], -n[1]];
  if (Math.abs(n[0]) < 0.25) { // arm mostly horizontal: thumb points up
    n = n[1] < 0 ? n : [-n[0], -n[1]];
  }
  const P = (k, m) => [Wr[0] + u[0] * k + n[0] * m, Wr[1] + u[1] * k + n[1] * m];
  const stroke = (pts, w = lw * 0.85) => { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.lineWidth = w; c.strokeStyle = color; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(); };
  c.save();
  if (type === 'rest') {
    c.beginPath(); c.moveTo(Wr[0], Wr[1]); const a = P(22, -2), b = P(44, 1); c.quadraticCurveTo(a[0], a[1], b[0], b[1]); c.lineWidth = lw; c.strokeStyle = color; c.lineCap = 'round'; c.stroke();
    stroke([P(8, 0), P(22, 11), P(28, 15)]);
  } else if (type === 'point') {
    stroke([Wr, P(48, 0)], lw * 0.9);
    c.beginPath(); c.arc(...P(8, 0), lw * 0.95, 0, Math.PI * 2); c.fillStyle = color; c.fill();
    stroke([P(6, 2), P(16, 13)]);
  } else if (type === 'open') {
    stroke([Wr, P(10, 0)], lw);
    for (const [ang, len] of [[-38, 20], [-13, 25], [12, 24], [36, 19]]) {
      const v = rot2(u, rad(ang)); const b = P(9, 0); stroke([b, [b[0] + v[0] * len, b[1] + v[1] * len]], lw * 0.75);
    }
    const tv = [u[0] * .35 + n[0] * .94, u[1] * .35 + n[1] * .94]; const b = P(4, 0); stroke([b, [b[0] + tv[0] * 22, b[1] + tv[1] * 22]], lw * 0.75);
  } else if (type === 'fist' || type === 'hold') {
    c.beginPath(); c.arc(...P(7, 0), lw * 1.15, 0, Math.PI * 2); c.fillStyle = color; c.fill();
  } else if (type === 'thumb') {
    c.beginPath(); c.arc(...P(7, 0), lw * 1.15, 0, Math.PI * 2); c.fillStyle = color; c.fill();
    const up = [0, -1]; const b = P(7, 0); stroke([b, [b[0] + up[0] * 30, b[1] + up[1] * 30]], lw * 0.85);
  }
  if (extra.stick) { // pointer stick
    const b = P(8, 0); const L = extra.stick;
    c.beginPath(); c.moveTo(b[0] - u[0] * 18, b[1] - u[1] * 18); c.lineTo(b[0] + u[0] * L, b[1] + u[1] * L);
    c.lineWidth = 6; c.strokeStyle = '#3b2a1a'; c.lineCap = 'round'; c.stroke();
    c.beginPath(); c.arc(b[0] + u[0] * L, b[1] + u[1] * L, 4, 0, 7); c.fillStyle = '#3b2a1a'; c.fill();
  }
  c.restore();
}

// ---- face overlays (expressions) drawn on top of original face ----
function skinPatch(c, cx, cy, rx, ry) {
  c.save(); c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); c.fillStyle = EL.skin; c.fill(); c.restore();
}
function strokeCurve(c, pts, w, color) {
  c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
  if (pts.length === 3) c.quadraticCurveTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1]);
  else for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
  c.lineWidth = w; c.strokeStyle = color; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke();
}
function brow(c, side, dy, tilt) {
  // side -1 left, +1 right; tilt (deg) positive = inner end raised (worried)
  const cx = side < 0 ? 653 : 736, cy = 252;
  const p0 = side < 0 ? [633, 257] : [716, 251], pm = side < 0 ? [651, 247] : [738, 246], p1 = side < 0 ? [674, 252] : [758, 257];
  const inner = side < 0 ? p1 : p0;
  c.save(); c.translate(...F(cx, cy + dy)); c.rotate(rad(tilt * (side < 0 ? 1 : -1) * -1)); c.translate(-F(cx, cy)[0], -F(cx, cy)[1]);
  const q = [p0, pm, p1].map(p => F(p[0], p[1]));
  c.beginPath(); c.moveTo(q[0][0], q[0][1]); c.quadraticCurveTo(q[1][0], q[1][1] - 2, q[2][0], q[2][1]);
  c.quadraticCurveTo(q[1][0], q[1][1] + 9, q[0][0], q[0][1]); c.fillStyle = EL.brow; c.fill();
  c.lineWidth = 2; c.strokeStyle = EL.brow; c.stroke();
  c.restore();
}
function drawElonFace(c, f) {
  // f: {mouth, brows, eyes, blink}
  const mouthCol = 'rgb(58,22,14)';
  if (f.brows && f.brows !== 'normal') {
    skinPatch(c, ...F(653, 253), 25, 10); skinPatch(c, ...F(737, 252), 26, 10);
    const b = { up: [-7, 0, -7, 0], up2: [-11, 0, -11, 0], worried: [-3, 14, -3, 14], angry: [3, -14, 3, -14], one: [0, 0, -10, -6], down: [3, -6, 3, -6] }[f.brows] || [0, 0, 0, 0];
    brow(c, -1, b[0], b[1]); brow(c, 1, b[2], b[3]);
  }
  const eyes = f.blink ? 'closed' : (f.eyes || 'normal');
  if (eyes !== 'normal') {
    for (const s of [-1, 1]) {
      const cx = s < 0 ? 657 : 731, cy = 277;
      if (eyes === 'closed' || eyes === 'happy') {
        skinPatch(c, ...F(cx, cy), 22, 13);
        const pts = eyes === 'happy' ? [F(cx - 16, cy + 4), F(cx, cy - 9), F(cx + 16, cy + 4)] : [F(cx - 17, cy - 1), F(cx, cy + 6), F(cx + 17, cy - 1)];
        strokeCurve(c, pts, 3.4, 'rgb(40,24,18)');
      } else if (eyes === 'wide') {
        skinPatch(c, ...F(cx, cy), 22, 13);
        c.beginPath(); c.ellipse(...F(cx, cy - 1), 15, 13, 0, 0, Math.PI * 2); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 2.6; c.strokeStyle = 'rgb(40,24,18)'; c.stroke();
        c.beginPath(); c.arc(...F(cx + (f.look || 0) * 4, cy), 5.5, 0, Math.PI * 2); c.fillStyle = '#060606'; c.fill();
      } else if (eyes === 'side') {
        // pupils look sideways (repaint whites)
        c.beginPath(); c.ellipse(...F(cx, cy - 1), 11, 6.5, 0, 0, Math.PI * 2); c.fillStyle = 'rgb(245,240,236)'; c.fill();
        c.beginPath(); c.arc(...F(cx + (f.look || 1) * 6, cy - 1), 5.2, 0, Math.PI * 2); c.fillStyle = '#060606'; c.fill();
      }
    }
  }
  const m = f.mouth || 'normal';
  if (m !== 'normal') {
    skinPatch(c, ...F(699, 344), 52, 20);
    if (m === 'O' || m === 'o') {
      const r = m === 'O' ? 1 : 0.7;
      c.beginPath(); c.ellipse(...F(699, 350), 12 * r, 15 * r, 0, 0, Math.PI * 2); c.fillStyle = 'rgb(80,26,20)'; c.fill(); c.lineWidth = 3; c.strokeStyle = mouthCol; c.stroke();
    } else if (m === 'frown') strokeCurve(c, [F(670, 354), F(699, 336), F(728, 354)], 3.6, mouthCol);
    else if (m === 'flat') strokeCurve(c, [F(675, 347), F(700, 348), F(724, 347)], 3.6, mouthCol);
    else if (m === 'smirk') strokeCurve(c, [F(672, 349), F(712, 352), F(732, 336)], 3.6, mouthCol);
    else if (m === 'wavy') strokeCurve(c, [F(672, 349), F(684, 343), F(696, 350), F(708, 343), F(720, 350), F(728, 346)], 3.2, mouthCol);
    else if (m === 'grin' || m === 'open' || m === 'laugh') {
      const depth = m === 'laugh' ? 24 : m === 'grin' ? 18 : 14;
      const P0 = F(664, 338), P1 = F(734, 336);
      c.beginPath(); c.moveTo(...P0); c.quadraticCurveTo(...F(699, 345), ...P1);
      c.quadraticCurveTo(...F(699, 345 + depth * 2), ...P0); c.closePath();
      c.fillStyle = 'rgb(92,28,22)'; c.fill();
      if (m !== 'open') { c.save(); c.clip(); c.fillStyle = '#fff'; c.fillRect(F(660, 0)[0], F(0, 336)[1], 80, 9); c.restore(); }
      c.beginPath(); c.moveTo(...P0); c.quadraticCurveTo(...F(699, 345), ...P1); c.quadraticCurveTo(...F(699, 345 + depth * 2), ...P0); c.closePath();
      c.lineWidth = 3.2; c.strokeStyle = mouthCol; c.stroke();
    } else if (m === 'sadopen') {
      const P0 = F(672, 356), P1 = F(726, 356);
      c.beginPath(); c.moveTo(...P0); c.quadraticCurveTo(...F(699, 330), ...P1); c.quadraticCurveTo(...F(699, 350), ...P0); c.closePath();
      c.fillStyle = 'rgb(92,28,22)'; c.fill(); c.lineWidth = 3.2; c.strokeStyle = mouthCol; c.stroke();
    }
  }
  if (f.sweat) {
    c.save(); c.translate(...F(785, 250)); c.beginPath(); c.moveTo(0, -14); c.quadraticCurveTo(10, 4, 0, 8); c.quadraticCurveTo(-10, 4, 0, -14);
    c.fillStyle = '#7cc7ff'; c.fill(); c.lineWidth = 2.5; c.strokeStyle = '#2b6aa0'; c.stroke(); c.restore();
  }
  if (f.blush) { for (const x of [640, 758]) { c.beginPath(); c.ellipse(...F(x, 318), 16, 8, 0, 0, 7); c.fillStyle = 'rgba(240,110,110,0.35)'; c.fill(); } }
}
const EXPR = {
  neutral: {},
  happy: { eyes: 'happy' },
  grin: { mouth: 'grin', brows: 'up' },
  laugh: { mouth: 'laugh', eyes: 'happy', brows: 'up' },
  surprised: { mouth: 'O', brows: 'up2' },
  shocked: { mouth: 'O', brows: 'up2', eyes: 'wide' },
  wow: { mouth: 'open', brows: 'up' },
  sad: { mouth: 'frown', brows: 'worried' },
  worried: { mouth: 'wavy', brows: 'worried', sweat: true },
  nervous: { mouth: 'wavy', brows: 'worried', sweat: true, eyes: 'side', look: 1 },
  confused: { mouth: 'flat', brows: 'one' },
  smug: { mouth: 'smirk', brows: 'one' },
  serious: { mouth: 'flat', brows: 'down' },
  angry: { mouth: 'frown', brows: 'angry' },
  determined: { mouth: 'normal', brows: 'angry' },
  skeptical: { mouth: 'smirk', brows: 'down', eyes: 'side', look: -1 },
  side: { eyes: 'side', look: 1 },
  sideL: { eyes: 'side', look: -1 },
  open: { mouth: 'open' },
  unimpressed: { mouth: 'flat', brows: 'down', eyes: 'side', look: -1 },
  sadopen: { mouth: 'sadopen', brows: 'worried' },
};

// ---- pose library ----
// pose fn returns {L:{h:[ox,oy], hand, bend, stick}, R:{...}, lean, hop}
// h is the hand target relative to shoulder in "outward" frame (+x away from body, +y down)
const POSES = {
  rest: () => ({ L: { h: EL.rest, hand: 'rest' }, R: { h: EL.rest, hand: 'rest' } }),
  shrug: () => ({ L: { h: [100, 28], hand: 'open', bend: 'down' }, R: { h: [100, 28], hand: 'open', bend: 'down' }, lean: 0 }),
  armsUp: () => ({ L: { h: [95, -170], hand: 'open' }, R: { h: [95, -170], hand: 'open' } }),
  cheer: () => ({ L: { h: [70, -175], hand: 'fist' }, R: { h: [70, -175], hand: 'fist' } }),
  presentL: () => ({ L: { h: [190, 30], hand: 'open' }, R: { h: EL.rest, hand: 'rest' } }),
  presentR: () => ({ R: { h: [190, 30], hand: 'open' }, L: { h: EL.rest, hand: 'rest' } }),
  thinkR: () => ({ R: { h: [-52, 2], hand: 'fist' }, L: { h: EL.rest, hand: 'rest' } }),
  thinkL: () => ({ L: { h: [-52, 2], hand: 'fist' }, R: { h: EL.rest, hand: 'rest' } }),
  scratch: () => ({ R: { h: [25, -165], hand: 'open', bend: 1 }, L: { h: EL.rest, hand: 'rest' } }),
  facepalm: () => ({ R: { h: [-62, -140], hand: 'open' }, L: { h: EL.rest, hand: 'rest' } }),
  hold: () => ({ L: { h: [-25, 120], hand: 'hold' }, R: { h: [-25, 120], hand: 'hold' } }),
  holdUp: () => ({ L: { h: [10, -10], hand: 'hold', bend: 'down' }, R: { h: [10, -10], hand: 'hold', bend: 'down' } }),
  thumbsUp: () => ({ R: { h: [120, 20], hand: 'thumb', bend: 'down' }, L: { h: EL.rest, hand: 'rest' } }),
  waveR: () => ({ R: { h: [120, -120], hand: 'open', wave: true }, L: { h: EL.rest, hand: 'rest' } }),
  stopR: () => ({ R: { h: [175, -40], hand: 'open' }, L: { h: EL.rest, hand: 'rest' } }),
  countR: () => ({ R: { h: [110, -60], hand: 'point', bend: 'down' }, L: { h: EL.rest, hand: 'rest' } }),
  hips: () => ({ L: { h: [-6, 150], hand: 'fist' }, R: { h: [-6, 150], hand: 'fist' } }),
  bothOut: () => ({ L: { h: [180, 40], hand: 'open' }, R: { h: [180, 40], hand: 'open' } }),
};

class Elon {
  constructor(o) {
    const { pose: _p, expr: _e, args: _a, ...rest } = o;
    Object.assign(this, { x: 960, y: 1000, s: 0.9, rot: 0, t0: 0, t1: 1e9, z: 5, enter: 'pop', blinkSeed: 3 }, rest);
    this.keys = [];
    this.pose(this.t0, o.pose || 'rest', o.args || {});
    if (o.expr) this.face(this.t0, o.expr);
    this.fkeys = this.fkeys || [];
  }
  pose(t, name, args = {}) { this.keys.push({ t, name, args }); this.keys.sort((a, b) => a.t - b.t); return this; }
  face(t, e) { (this.fkeys = this.fkeys || []).push({ t, e }); this.fkeys.sort((a, b) => a.t - b.t); return this; }
  worldToLocal(p) {
    const v = rot2([(p[0] - this.x) / this.s, (p[1] - this.y) / this.s], -rad(this.rot));
    return v;
  }
  resolve(key) {
    let P;
    const a = key.args || {};
    if (key.name === 'point' || key.name === 'pointer') {
      const tgt = this.worldToLocal(a.at || [0, 0]);
      const side = a.arm ? (a.arm === 'L' ? -1 : 1) : (tgt[0] < 0 ? -1 : 1);
      const S = side < 0 ? EL.shL : EL.shR;
      const dx = tgt[0] - S[0], dy = tgt[1] - S[1]; const d = Math.hypot(dx, dy) || 1;
      const reach = key.name === 'pointer' ? 175 : 196;
      const hp = [dx / d * reach, dy / d * reach];
      const h = [hp[0] * side, hp[1]];
      const stick = key.name === 'pointer' ? clamp(d - reach - 30, 80, a.maxStick || 330) : 0;
      const arm = { h, hand: key.name === 'pointer' ? 'hold' : 'point', bend: 'down', stick };
      const other = { h: EL.rest, hand: 'rest' };
      P = side < 0 ? { L: arm, R: other } : { R: arm, L: other };
      if (a.other) { const o2 = POSES[a.other](); const k2 = side < 0 ? 'R' : 'L'; P[k2] = o2[k2]; }
    } else {
      P = POSES[key.name](a);
    }
    P.lean = a.lean ?? P.lean ?? 0; P.hop = a.hop || 0;
    return P;
  }
  stateAt(t) {
    let i = 0; while (i + 1 < this.keys.length && this.keys[i + 1].t <= t) i++;
    const cur = this.resolve(this.keys[i]);
    if (i === 0) return cur;
    const prev = this.resolve(this.keys[i - 1]);
    const dur = this.keys[i].args.dur || 0.32;
    const p = clamp((t - this.keys[i].t) / dur); const e = ease.back(p);
    const mix = (A, B) => ({ h: [lerp(A.h[0], B.h[0], e), lerp(A.h[1], B.h[1], e)], hand: p < .5 ? A.hand : B.hand, bend: p < .5 ? A.bend : B.bend, stick: lerp(A.stick || 0, B.stick || 0, ease.out(p)), wave: B.wave });
    return { L: mix(prev.L, cur.L), R: mix(prev.R, cur.R), lean: lerp(prev.lean || 0, cur.lean || 0, ease.inOut(p)), hop: cur.hop };
  }
  faceAt(t) {
    let e = 'neutral';
    for (const k of this.fkeys) if (k.t <= t) e = k.e;
    const f = { ...(EXPR[e] || {}) };
    // blink
    const R = rnd(this.blinkSeed); let bt = R() * 2;
    while (bt < t + 1) { if (t >= bt && t < bt + 0.13) { f.blink = true; break; } bt += 2.6 + R() * 2.6; }
    if (f.eyes === 'happy' || f.eyes === 'wide') f.blink = false;
    return f;
  }
  draw(c, t) {
    if (!ELON_IMG.complete) return;
    const st = this.stateAt(t);
    const lt = t - this.t0;
    const breath = Math.sin(lt * 2 * Math.PI * 0.45) * 2.2;
    let hopY = 0;
    if (st.hop) { const hp = (lt % 0.6) / 0.6; hopY = -Math.abs(Math.sin(hp * Math.PI)) * 40; }
    c.save();
    c.translate(this.x, this.y); c.rotate(rad(this.rot)); c.scale(this.s, this.s);
    c.translate(0, hopY);
    const by = breath;
    const lean = rad(st.lean || 0);
    const pivot = EL.hipC;
    const tr = p => { const q = rot2([p[0] - pivot[0], p[1] - pivot[1] + by], lean); return [q[0] + pivot[0], q[1] + pivot[1]]; };
    // legs (behind)
    const walk = this.walk && t >= this.walk[0] && t < this.walk[1];
    for (const side of [-1, 1]) {
      const hip = tr(side < 0 ? EL.hipL : EL.hipR);
      let foot = (side < 0 ? EL.footL : EL.footR).slice();
      let lift = 0;
      if (walk) { const ph = (t - this.walk[0]) * 2 * Math.PI * 1.8 + (side < 0 ? 0 : Math.PI); foot[0] += Math.sin(ph) * 24; lift = Math.max(0, Math.cos(ph)) * 16; foot[1] -= lift; }
      if (hopY) { foot[1] -= 0; }
      const { E } = solveIKPref(hip, foot, 58, 58, [side, 0]);
      limbPath(c, hip, E, foot, EL.lw, EL.ink);
      c.beginPath(); c.moveTo(foot[0], foot[1]); c.quadraticCurveTo(foot[0] + side * 14, foot[1] + 6, foot[0] + side * 30, foot[1] + 7);
      c.lineWidth = EL.lw; c.strokeStyle = EL.ink; c.lineCap = 'round'; c.stroke();
    }
    // upper body (image) with lean
    c.save();
    c.translate(pivot[0], pivot[1] + by); c.rotate(lean); c.translate(-pivot[0], -pivot[1]);
    c.imageSmoothingQuality = 'high';
    c.drawImage(ELON_IMG, EL.ox, EL.oy);
    drawElonFace(c, this.faceAt(t));
    // arms
    for (const side of [-1, 1]) {
      const A = side < 0 ? st.L : st.R; const S = side < 0 ? EL.shL : EL.shR;
      let h = A.h.slice();
      if (A.wave) { const w = Math.sin(lt * 2 * Math.PI * 2.2) * 28; h = [h[0] + w, h[1] + Math.abs(w) * 0.2]; }
      const sway = Math.sin(lt * 2 * Math.PI * 0.45 + side) * 2;
      const T = [S[0] + h[0] * side + sway * 0.5, S[1] + h[1] + sway];
      const { E, Wr } = solveIKPref(S, T, EL.L1, EL.L2, prefFor(A.bend, side));
      limbPath(c, S, E, Wr, EL.lw, EL.ink);
      drawHand(c, E, Wr, A.hand, side, EL.lw, EL.ink, { stick: A.stick > 1 ? A.stick : 0 });
    }
    c.restore();
    c.restore();
  }
}

// ============================================================
//  GENERIC HAND-DRAWN STICKMAN (other characters)
// ============================================================
const SKINS = ['#f6cfa6', '#e9b48a', '#c68a5e', '#8d5a3b', '#f3d2b6', '#dba77c'];
class Stick {
  constructor(o) {
    Object.assign(this, {
      x: 960, y: 1000, s: 1, rot: 0, t0: 0, t1: 1e9, z: 4, enter: 'pop', seed: 7,
      skin: '#f6cfa6', hair: 'messy', hairColor: '#1b1b1b', outfit: null, tie: null, glasses: null,
      hat: null, beard: null, lw: 6, headR: 58, flip: 1, prop: null, label: null,
    }, (({ pose, expr, args, ...r }) => r)(o));
    this.keys = []; this.fkeys = [];
    this.pose(this.t0, o.pose || 'rest', o.args || {});
    if (o.expr) this.face(this.t0, o.expr);
  }
  pose(t, name, args = {}) { this.keys.push({ t, name, args }); this.keys.sort((a, b) => a.t - b.t); return this; }
  face(t, e) { this.fkeys.push({ t, e }); this.fkeys.sort((a, b) => a.t - b.t); return this; }
  resolve(k) {
    const a = k.args || {};
    const rest = { h: [28, 118], hand: 'none' };
    const P = {
      rest: { L: rest, R: rest },
      shrug: { L: { h: [72, 30] }, R: { h: [72, 30] } },
      armsUp: { L: { h: [60, -110] }, R: { h: [60, -110] } },
      presentL: { L: { h: [118, 10] }, R: rest },
      presentR: { R: { h: [118, 10] }, L: rest },
      thinkR: { R: { h: [-30, -50] }, L: rest },
      hold: { L: { h: [-6, 70] }, R: { h: [-6, 70] } },
      holdUp: { L: { h: [20, -20] }, R: { h: [20, -20] } },
      hips: { L: { h: [6, 100] }, R: { h: [6, 100] } },
      waveR: { R: { h: [70, -80], wave: true }, L: rest },
      pointR: { R: { h: [120, -10] }, L: rest },
      pointL: { L: { h: [120, -10] }, R: rest },
      pointUpR: { R: { h: [70, -100] }, L: rest },
      cower: { L: { h: [-20, -40], bend: 'down' }, R: { h: [-20, -40], bend: 'down' } },
      run: { L: { h: [60, 50] }, R: { h: [-30, 60] } },
      grab: { L: { h: [110, 30] }, R: { h: [110, 30] } },
      give: { R: { h: [115, 25] }, L: rest },
    }[k.name] || { L: rest, R: rest };
    return { L: { ...rest, ...P.L }, R: { ...rest, ...P.R }, lean: a.lean || 0, hop: a.hop };
  }
  stateAt(t) {
    let i = 0; while (i + 1 < this.keys.length && this.keys[i + 1].t <= t) i++;
    const cur = this.resolve(this.keys[i]); if (i === 0) return cur;
    const prev = this.resolve(this.keys[i - 1]);
    const p = clamp((t - this.keys[i].t) / 0.3); const e = ease.back(p);
    const mix = (A, B) => ({ h: [lerp(A.h[0], B.h[0], e), lerp(A.h[1], B.h[1], e)], bend: B.bend, wave: B.wave });
    return { L: mix(prev.L, cur.L), R: mix(prev.R, cur.R), lean: lerp(prev.lean, cur.lean, ease.inOut(p)), hop: cur.hop };
  }
  exprAt(t) { let e = this.expr0 || 'neutral'; for (const k of this.fkeys) if (k.t <= t) e = k.e; return e; }
  draw(c, t) {
    const lt = t - this.t0; const st = this.stateAt(t);
    const R = rnd(this.seed);
    c.save(); c.translate(this.x, this.y); c.rotate(rad(this.rot)); c.scale(this.s * this.flip, this.s);
    let hopY = 0; if (st.hop) { const hp = (lt % 0.55) / 0.55; hopY = -Math.abs(Math.sin(hp * Math.PI)) * 34; }
    c.translate(0, hopY);
    const breath = Math.sin(lt * 2 * Math.PI * 0.5 + this.seed) * 1.8;
    const hip = [0, -118 + breath * .3];
    const lean = rad(st.lean);
    const neck = [Math.sin(lean) * 128, hip[1] - Math.cos(lean) * 128 + breath];
    const headC = [neck[0] + Math.sin(lean) * (this.headR - 4), neck[1] - this.headR + 6];
    const ink = INK; const lw = this.lw;
    const L = (pts, w = lw, col = ink) => { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); if (pts.length === 3) c.quadraticCurveTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1]); else for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.lineWidth = w; c.strokeStyle = col; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(); };
    // legs
    const walk = this.walk && t >= this.walk[0] && t < this.walk[1];
    for (const side of [-1, 1]) {
      let foot = [side * 30, -2]; if (this.legs === 'together') foot = [side * 12, -2];
      if (walk) { const ph = (t - this.walk[0]) * 2 * Math.PI * 2 + (side < 0 ? 0 : Math.PI); foot = [foot[0] + Math.sin(ph) * 26, foot[1] - Math.max(0, Math.cos(ph)) * 14]; }
      const knee = [lerp(hip[0], foot[0], .5) + side * 6 + (R() - .5) * 4, lerp(hip[1], foot[1], .5)];
      L([hip, knee, foot]);
      L([foot, [foot[0] + side * 22, foot[1] + 2]]);
    }
    // outfit torso
    if (this.outfit) drawOutfit(c, this, hip, neck);
    else L([hip, [lerp(hip[0], neck[0], .5) + (R() - .5) * 5, lerp(hip[1], neck[1], .5)], neck]);
    // arms
    const sh = [lerp(neck[0], hip[0], .12), lerp(neck[1], hip[1], .12)];
    for (const side of [-1, 1]) {
      const A = side < 0 ? st.L : st.R;
      let h = A.h.slice();
      if (A.wave) { const w = Math.sin(lt * 2 * Math.PI * 2.2) * 22; h = [h[0] + w, h[1]]; }
      const T = [sh[0] + h[0] * side, sh[1] + h[1] + Math.sin(lt * 2.8 + side) * 1.5];
      const { E, Wr } = solveIKPref(sh, T, 64, 60, prefFor(A.bend, side));
      L([sh, [2 * E[0] - (sh[0] + Wr[0]) / 2, 2 * E[1] - (sh[1] + Wr[1]) / 2], Wr]);
      if (this.sleeve) L([sh, [2 * E[0] - (sh[0] + Wr[0]) / 2, 2 * E[1] - (sh[1] + Wr[1]) / 2], Wr], lw + 6, this.sleeve), L([Wr, Wr], lw + 2);
      // tiny hands
      const u = [Wr[0] - E[0], Wr[1] - E[1]]; const ul = Math.hypot(...u) || 1;
      L([Wr, [Wr[0] + u[0] / ul * 12 + 4 * side, Wr[1] + u[1] / ul * 12]], lw - 1);
      if (this.holds && side === (this.holdSide || 1)) { c.save(); c.translate(Wr[0], Wr[1]); drawSprite(c, this.holds.name, this.holds.p || {}, 0, -10, this.holds.s || 0.5); c.restore(); }
    }
    // head
    c.save(); c.translate(headC[0], headC[1]); c.rotate(lean * 0.6);
    drawStickHead(c, this, this.exprAt(t), t);
    c.restore();
    c.restore();
  }
}
function drawOutfit(c, m, hip, neck) {
  const o = m.outfit; const col = o.color || '#3d7a3d';
  const w1 = o.w || 34, w2 = o.w2 || 44;
  const top = [neck[0], neck[1] + 4];
  const pts = o.type === 'dress'
    ? [[top[0] - 14, top[1]], [top[0] + 14, top[1]], [hip[0] + 52, hip[1] + 26], [hip[0] - 52, hip[1] + 26]]
    : o.type === 'tie'
      ? [[top[0] - 8, top[1]], [top[0] + 8, top[1]], [top[0] + 6, top[1] + 12], [hip[0] + 16, hip[1] - 22], [hip[0], hip[1] - 4], [hip[0] - 16, hip[1] - 22], [top[0] - 6, top[1] + 12]]
      : [[top[0] - w1, top[1] + 4], [top[0] + w1, top[1] + 4], [hip[0] + w2, hip[1] + 6], [hip[0] - w2, hip[1] + 6]];
  c.save();
  if (o.type === 'tie') {
    c.beginPath(); c.moveTo(hip[0], hip[1]); c.lineTo(neck[0], neck[1]); c.lineWidth = m.lw; c.strokeStyle = INK; c.lineCap = 'round'; c.stroke();
  }
  shape(c, pts, { fill: col, lw: 4, amp: .8, seed: m.seed + 11 });
  if (o.type === 'suit') { // lapels + shirt
    shape(c, [[top[0] - 12, top[1] + 4], [top[0], top[1] + 40], [top[0] + 12, top[1] + 4]], { fill: '#fff', lw: 3, amp: .4, seed: m.seed + 3 });
    if (o.tie) shape(c, [[top[0] - 4, top[1] + 6], [top[0] + 4, top[1] + 6], [top[0] + 5, top[1] + 34], [top[0], top[1] + 42], [top[0] - 5, top[1] + 34]], { fill: o.tie, lw: 2.5, amp: .3, seed: m.seed + 4 });
  }
  c.restore();
}
function drawStickHead(c, m, expr, t) {
  const r = m.headR; const ink = INK;
  // hair behind (long)
  if (m.hair === 'long' || m.hair === 'bob') {
    shape(c, m.hair === 'long' ? [[-r - 6, -10], [-r + 4, -r + 6], [0, -r - 10], [r - 4, -r + 6], [r + 6, -10], [r + 10, r + 30], [r - 18, r + 36], [-r + 18, r + 36], [-r - 10, r + 30]]
      : [[-r - 8, 0], [-r + 2, -r + 4], [0, -r - 10], [r - 2, -r + 4], [r + 8, 0], [r + 6, r * .55], [-r - 6, r * .55]], { fill: m.hairColor, lw: 4, seed: m.seed + 21 });
  }
  if (m.hair === 'bun') circle(c, 0, -r - 18, 24, { fill: m.hairColor, lw: 4, seed: m.seed + 22 });
  circle(c, 0, 0, r, { fill: m.skin, lw: 5, seed: m.seed + 1, amp: 1.2 });
  // hair front
  const hc = m.hairColor;
  if (m.hair === 'messy') {
    const R = rnd(m.seed + 5); c.save(); c.lineCap = 'round'; c.strokeStyle = hc; c.lineWidth = 6;
    for (let i = 0; i < 16; i++) { const a = rad(-160 + i * 140 / 15 + (R() - .5) * 6); const x0 = Math.cos(a) * r * .9, y0 = Math.sin(a) * r * .9; const L = 14 + R() * 14; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0 + Math.cos(a + (R() - .5)) * L, y0 + Math.sin(a + (R() - .5)) * L); c.stroke(); }
    shape(c, ellPts(0, -r * .62, r * .82, r * .42, 20, Math.PI, Math.PI * 2), { fill: hc, stroke: hc, lw: 3, seed: m.seed + 6 });
    c.restore();
  } else if (m.hair === 'side') {
    shape(c, [[-r - 2, -6], [-r + 6, -r * .7], [-r * .2, -r - 6], [r * .7, -r * .78], [r + 2, -r * .2], [r * .5, -r * .5], [-r * .1, -r * .42], [-r * .65, -r * .3], [-r * .8, -2]], { fill: hc, lw: 4, seed: m.seed + 7 });
  } else if (m.hair === 'curly') {
    for (let i = 0; i < 9; i++) { const a = rad(-175 + i * 170 / 8); circle(c, Math.cos(a) * r * .92, Math.sin(a) * r * .92 - 4, 18, { fill: hc, lw: 3.5, seed: m.seed + 30 + i }); }
  } else if (m.hair === 'long' || m.hair === 'bob') {
    shape(c, [[-r - 2, -2], [-r * .6, -r * .8], [0, -r - 6], [r * .6, -r * .8], [r + 2, -2], [r * .55, -r * .5], [0, -r * .62], [-r * .55, -r * .5]], { fill: hc, lw: 4, seed: m.seed + 8 });
  } else if (m.hair === 'bun') {
    shape(c, [[-r - 2, -6], [-r * .6, -r * .82], [0, -r - 4], [r * .6, -r * .82], [r + 2, -6], [r * .5, -r * .55], [-r * .5, -r * .55]], { fill: hc, lw: 4, seed: m.seed + 9 });
  } else if (m.hair === 'slick') {
    shape(c, [[-r - 2, -8], [-r * .7, -r * .78], [0, -r - 8], [r * .75, -r * .78], [r + 2, -8], [r * .7, -r * .5], [-r * .7, -r * .5]], { fill: hc, lw: 4, seed: m.seed + 10 });
    line(c, [[-r * .4, -r * .8], [r * .3, -r * .62]], { stroke: '#666', lw: 2.5 });
  } else if (m.hair === 'bald') {
    shape(c, [[-r - 1, 4], [-r + 4, -r * .45], [-r * .7, -r * .55], [-r * .78, 6]], { fill: hc, lw: 3, seed: m.seed + 11 });
    shape(c, [[r + 1, 4], [r - 4, -r * .45], [r * .7, -r * .55], [r * .78, 6]], { fill: hc, lw: 3, seed: m.seed + 12 });
  } else if (m.hair === 'mohawk') {
    shape(c, [[-12, -r + 4], [-8, -r - 30], [0, -r - 40], [8, -r - 30], [12, -r + 4]], { fill: hc, lw: 4, seed: m.seed + 13 });
  }
  // face
  const e = expr;
  const eyeY = -2, ex = r * .34;
  const wide = ['shocked', 'surprised', 'scared'].includes(e);
  const blinkR = rnd(m.seed * 7); let bt = blinkR() * 3, blink = false;
  while (bt < t + 1) { if (t >= bt && t < bt + 0.12) { blink = true; break; } bt += 2.4 + blinkR() * 3; }
  c.save(); c.lineCap = 'round';
  if (m.glasses === 'shades') {
    shape(c, [[-ex - 20, eyeY - 12], [-6, eyeY - 12], [-8, eyeY + 10], [-ex - 16, eyeY + 10]], { fill: '#111', lw: 3, seed: m.seed + 40 });
    shape(c, [[6, eyeY - 12], [ex + 20, eyeY - 12], [ex + 16, eyeY + 10], [8, eyeY + 10]], { fill: '#111', lw: 3, seed: m.seed + 41 });
    line(c, [[-6, eyeY - 8], [6, eyeY - 8]], { lw: 3 });
  } else {
    for (const s of [-1, 1]) {
      if (blink && !wide) { line(c, [[s * ex - 7, eyeY], [s * ex + 7, eyeY]], { lw: 4, amp: 0 }); continue; }
      if (wide) { circle(c, s * ex, eyeY, 13, { fill: '#fff', lw: 3.5, amp: .5, seed: m.seed + 50 + s }); c.beginPath(); c.arc(s * ex, eyeY + 1, 5, 0, 7); c.fillStyle = ink; c.fill(); }
      else if (e === 'happy' || e === 'laugh') { line(c, [[s * ex - 8, eyeY + 3], [s * ex, eyeY - 5], [s * ex + 8, eyeY + 3]], { lw: 4, amp: 0 }); }
      else if (e === 'angry') { c.beginPath(); c.arc(s * ex, eyeY + 2, 5.5, 0, 7); c.fillStyle = ink; c.fill(); line(c, [[s * ex - s * 12, eyeY - 16], [s * ex + s * 10, eyeY - 8]], { lw: 4, amp: 0 }); }
      else { c.beginPath(); c.arc(s * ex + (e === 'side' ? 4 : 0), eyeY, 6, 0, 7); c.fillStyle = ink; c.fill(); }
      if (e === 'worried' || e === 'sad') line(c, [[s * ex - s * 10, eyeY - 12], [s * ex + s * 8, eyeY - 18]], { lw: 3.5, amp: 0 });
      if (e === 'skeptical' && s > 0) line(c, [[s * ex - 10, eyeY - 18], [s * ex + 10, eyeY - 14]], { lw: 3.5, amp: 0 });
    }
    if (m.glasses === 'round' || m.glasses === 'square') {
      for (const s of [-1, 1]) { if (m.glasses === 'round') circle(c, s * ex, eyeY, 16, { lw: 3.5, amp: .4, seed: m.seed + 60 + s }); else rect(c, s * ex - 17, eyeY - 12, 34, 24, { lw: 3.5, r: 4, amp: .4, seed: m.seed + 62 + s }); }
      line(c, [[-ex + 16, eyeY], [ex - 16, eyeY]], { lw: 3, amp: 0 });
    }
  }
  // mouth
  const my = r * .45;
  const M = { lw: 4, amp: 0 };
  if (e === 'happy' || e === 'neutral' || e === 'smile') curve(c, [[-16, my - 6], [0, my + 2], [16, my - 6]], M);
  else if (e === 'laugh' || e === 'grin') { shape(c, [[-20, my - 8], [20, my - 8], [12, my + 10], [-12, my + 10]], { fill: '#7a2622', lw: 3.5, amp: .3, seed: m.seed + 70 }); }
  else if (e === 'sad' || e === 'angry') curve(c, [[-15, my + 4], [0, my - 5], [15, my + 4]], M);
  else if (wide) ellipse(c, 0, my, 9, 12, { fill: '#7a2622', lw: 3.5, amp: .3, seed: m.seed + 71 });
  else if (e === 'worried') line(c, [[-15, my], [-7, my - 4], [0, my], [7, my - 4], [15, my]], M);
  else if (e === 'flat' || e === 'side') line(c, [[-13, my], [13, my]], M);
  else if (e === 'skeptical' || e === 'smug') curve(c, [[-14, my + 2], [4, my + 2], [16, my - 7]], M);
  else if (e === 'talk') ellipse(c, 0, my, 12, 6 + Math.abs(Math.sin(t * 18)) * 6, { fill: '#7a2622', lw: 3, amp: .3, seed: m.seed + 72 });
  if (m.beard === 'stubble') { c.fillStyle = 'rgba(40,40,40,.35)'; for (let i = 0; i < 26; i++) { const R2 = rnd(m.seed + 90 + i); const a = rad(25 + R2() * 130); const rr = r * (.68 + R2() * .25); c.fillRect(Math.cos(a) * rr, Math.sin(a) * rr, 2.5, 2.5); } }
  if (m.beard === 'full') shape(c, [[-r * .82, r * .1], [-r * .5, r * .78], [0, r + 10], [r * .5, r * .78], [r * .82, r * .1], [r * .45, r * .3], [0, r * .25], [-r * .45, r * .3]], { fill: m.hairColor, lw: 4, seed: m.seed + 80 });
  if (m.beard === 'mustache') shape(c, [[-20, my - 8], [0, my - 14], [20, my - 8], [10, my - 4], [0, my - 8], [-10, my - 4]], { fill: m.hairColor, lw: 3, seed: m.seed + 81 });
  c.restore();
  // hats
  if (m.hat === 'cap') { shape(c, [[-r + 4, -r * .45], [-r * .5, -r - 4], [r * .5, -r - 4], [r - 4, -r * .45]], { fill: m.hatColor || '#d33', lw: 4, seed: m.seed + 85 }); shape(c, [[r - 10, -r * .48], [r + 34, -r * .4], [r + 30, -r * .3], [r - 10, -r * .36]], { fill: m.hatColor || '#d33', lw: 4, seed: m.seed + 86 }); }
  if (m.hat === 'top') { rect(c, -r * .6, -r - 70, r * 1.2, 70, { fill: '#222', lw: 4, seed: m.seed + 87 }); rect(c, -r - 6, -r - 8, r * 2 + 12, 12, { fill: '#222', lw: 4, r: 4, seed: m.seed + 88 }); }
  if (m.hat === 'hardhat') { shape(c, ellPts(0, -r * .45, r + 6, r * .75, 22, Math.PI, Math.PI * 2), { fill: '#f2c230', lw: 4, seed: m.seed + 89 }); }
  if (m.hat === 'chef') { shape(c, [[-r * .6, -r * .7], [-r * .9, -r * 1.4], [-r * .4, -r * 1.75], [0, -r * 1.55], [r * .4, -r * 1.75], [r * .9, -r * 1.4], [r * .6, -r * .7]], { fill: '#fff', lw: 4, seed: m.seed + 91 }); }
  if (m.hat === 'veil') { shape(c, [[-r * .7, -r * .8], [0, -r - 10], [r * .7, -r * .8], [r + 20, r * 1.2], [-r - 20, r * 1.2]], { fill: 'rgba(255,255,255,.55)', lw: 3, seed: m.seed + 92 }); }
  if (m.hat === 'helmet') { circle(c, 0, 0, r + 14, { fill: 'rgba(190,225,255,.35)', lw: 4, seed: m.seed + 93 }); }
  if (m.headband) { shape(c, [[-r, -r * .45], [r, -r * .45], [r - 2, -r * .3], [-r + 2, -r * .3]], { fill: m.headband, lw: 3, seed: m.seed + 94 }); }
  if (m.earring) { circle(c, -r - 2, r * .2, 6, { fill: '#f5c542', lw: 2.5 }); }
}

// ============================================================
//  ELEMENTS / SHOTS
// ============================================================
// generic element: {t0,t1,x,y,s,rot,z,enter,exit,edur,render(c,t,el)}
function E(o) { return Object.assign({ x: 960, y: 540, s: 1, rot: 0, z: 1, enter: 'pop', exit: null, edur: 0.38, t0: 0, t1: 1e9, alpha: 1, float: 0 }, o); }
function enterTransform(c, el, t) {
  const p = clamp((t - el.t0) / el.edur);
  let sx = 1, sy = 1, dx = 0, dy = 0, a = 1, rot = 0;
  switch (el.enter) {
    case 'pop': { const e = ease.back(p); sx = sy = e; break; }
    case 'popBig': { const e = ease.backBig(p); sx = sy = e; break; }
    case 'fade': a = ease.out(p); break;
    case 'slideL': dx = -(1 - ease.out(p)) * (el.slideDist || 1300); break;
    case 'slideR': dx = (1 - ease.out(p)) * (el.slideDist || 1300); break;
    case 'slideU': dy = -(1 - ease.out(p)) * (el.slideDist || 900); break;
    case 'slideD': dy = (1 - ease.out(p)) * (el.slideDist || 900); break;
    case 'drop': dy = -(1 - ease.bounce(p)) * 900; break;
    case 'grow': sy = ease.back(p); sx = 1; break;
    case 'spin': { const e = ease.back(p); sx = sy = e; rot = (1 - ease.out(p)) * -2.2; break; }
    case 'swing': { rot = Math.sin((1 - p) * 9) * (1 - p) * 0.4; sx = sy = ease.out(Math.min(1, p * 3)); break; }
    case 'none': default: break;
  }
  if (el.exit && t >= el.t1) {
    const q = clamp((t - el.t1) / (el.xdur || 0.3));
    if (el.exit === 'pop') { const e = 1 - ease.in(q); sx *= e; sy *= e; }
    else if (el.exit === 'fade') a *= 1 - q;
    else if (el.exit === 'slideL') dx -= ease.in(q) * 1400;
    else if (el.exit === 'slideR') dx += ease.in(q) * 1400;
    else if (el.exit === 'slideD') dy += ease.in(q) * 900;
    else if (el.exit === 'slideU') dy -= ease.in(q) * 900;
    else if (el.exit === 'fall') { dy += ease.in(q) * 1200; rot += q * 0.8; }
  }
  return { sx, sy, dx, dy, a, rot, p };
}
function drawElement(c, el, t) {
  if (t < el.t0) return;
  if (t >= el.t1 + (el.exit ? (el.xdur || 0.3) : 0)) return;
  const tf = enterTransform(c, el, t);
  if (tf.sx <= 0.001 || tf.sy <= 0.001 || tf.a <= 0.001) return;
  c.save();
  c.globalAlpha = tf.a * el.alpha;
  const fl = el.float ? Math.sin((t - el.t0) * 2 * Math.PI * 0.5 + el.x) * el.float : 0;
  c.translate(el.x + tf.dx, el.y + tf.dy + fl);
  c.rotate(rad(el.rot) + tf.rot);
  c.scale(tf.sx * el.s, tf.sy * el.s);
  if (el.wipe) { // reveal left->right
    const p = clamp((t - el.t0) / el.wipe); const ww = el.ww || 2000, hh = el.wh || 2000;
    c.beginPath(); c.rect(-ww / 2 - 20, -hh / 2 - 20, (ww + 40) * ease.inOut(p), hh + 40); c.clip();
  }
  el.render(c, t, el);
  c.restore();
}
// Element factories
function spr(name, p, o) { return E({ ...o, render: (c, t, el) => drawSprite(c, name, p, 0, 0, 1), ww: PROPS[name] ? (typeof PROPS[name].w === 'function' ? PROPS[name].w(p) : PROPS[name].w) : 0, wh: PROPS[name] ? (typeof PROPS[name].h === 'function' ? PROPS[name].h(p) : PROPS[name].h) : 0 }); }
function txt(str, o) { const st = { size: 64, font: 'hand', color: INK, ...o.style }; return E({ enter: 'pop', ...o, render: (c) => text(c, str, 0, 0, st) }); }
function custom(fn, o) { return E({ ...o, render: fn }); }
function charEl(ch) {
  return E({ t0: ch.t0, t1: ch.t1, x: 0, y: 0, s: 1, z: ch.z, enter: ch.enter, exit: ch.exit, edur: ch.edur || 0.38, slideDist: ch.slideDist, render: (c, t) => { c.translate(-0, -0); ch.draw(c, t); }, isChar: true, ch });
}
// characters pop around their feet: wrap so scale origin is at feet
function charElement(ch) {
  const el = E({ t0: ch.t0, t1: ch.t1, x: ch.x, y: ch.y, z: ch.z, enter: ch.enter ?? 'pop', exit: ch.exit, edur: ch.edur || 0.4, slideDist: ch.slideDist, xdur: ch.xdur });
  el.render = (c, t) => {
    if (ch.path) {
      const P = ch.path; let x = P[0][1], y = P[0][2];
      for (let i = 1; i < P.length; i++) { if (t >= P[i][0]) { x = P[i][1]; y = P[i][2]; } else if (t > P[i - 1][0]) { const k = ease.inOut((t - P[i - 1][0]) / (P[i][0] - P[i - 1][0])); x = lerp(P[i - 1][1], P[i][1], k); y = lerp(P[i - 1][2], P[i][2], k); break; } else break; }
      c.translate(x - el.x, y - el.y); ch.x = x; ch.y = y;
    }
    c.translate(-ch.x, -ch.y); ch.draw(c, t);
  };
  el.ch = ch; return el;
}

// ---------------- shot list ----------------
const SHOTS = [];
let TL = null, TOK = null;
let CUR_TOK = 0;
function findPhrase(phrase, from) {
  const ws = phrase.toLowerCase().replace(/[^a-z0-9' ]/g, ' ').split(/\s+/).filter(Boolean);
  for (let i = from; i < TOK.length; i++) {
    let ok = true;
    for (let j = 0; j < ws.length; j++) { if (!TOK[i + j] || TOK[i + j].n.replace(/ /g, '') !== ws[j].replace(/ /g, '')) { ok = false; break; } }
    if (ok) return i;
  }
  throw new Error('phrase not found: ' + phrase + ' after token ' + from + ' (' + (TOK[from] && TOK[from].n) + ')');
}
// tokens whose text contains a space after hyphen-normalisation (e.g. "seventy five") are matched as joined strings
function prepTokens() { TOK = TL.tokens.map(t => ({ ...t, n: t.n.replace(/ /g, '') })); }
function T(phrase, off = 0) { const i = findPhrase(phrase.replace(/-/g, ''), SHOT_TOK); return TOK[i].s + off; }
function Tend(phrase, off = 0) { const ws = phrase.replace(/-/g, '').toLowerCase().replace(/[^a-z0-9' ]/g, ' ').split(/\s+/).filter(Boolean); const i = findPhrase(phrase.replace(/-/g, ''), SHOT_TOK); return TOK[i + ws.length - 1].e + off; }
let SHOT_TOK = 0;
function shot(phrase, build, o = {}) {
  const i = findPhrase(phrase.replace(/-/g, ''), CUR_TOK);
  CUR_TOK = i; SHOT_TOK = i;
  const t0 = SHOTS.length === 0 ? 0 : TOK[i].s - (o.lead ?? 0.12);
  const sh = { t0, t1: 1e9, els: [], bg: o.bg || '#ffffff', zoom: o.zoom || null, phrase };
  if (SHOTS.length) SHOTS[SHOTS.length - 1].t1 = t0;
  SHOTS.push(sh);
  const add = (...els) => { for (const e of els.flat()) { if (e instanceof Elon || e instanceof Stick) sh.els.push(charElement(e)); else sh.els.push(e); } return els[0]; };
  build(add, t0);
  sh.els.forEach((e, k) => e._k = k);
  sh.els.sort((a, b) => (a.z - b.z) || (a._k - b._k));
}

// ---------------- captions ----------------
function drawCaptions(c, t) {
  const caps = TL.captions;
  // binary search
  let lo = 0, hi = caps.length - 1, idx = -1;
  while (lo <= hi) { const m = (lo + hi) >> 1; if (caps[m].s <= t) { idx = m; lo = m + 1; } else hi = m - 1; }
  if (idx < 0) return; const cap = caps[idx]; if (t > cap.e) return;
  const size = 54; c.save();
  c.font = `600 ${size}px Fredoka`; c.textBaseline = 'middle';
  const space = size * 0.28;
  const ws = cap.w.map(w => ({ ...w, wd: c.measureText(w.t).width }));
  const total = ws.reduce((a, w) => a + w.wd, 0) + space * (ws.length - 1);
  let x = W / 2 - total / 2; const y = 1012;
  const appear = clamp((t - cap.s) / 0.12);
  c.globalAlpha = appear;
  // words
  for (const w of ws) {
    const active = t >= w.s - 0.02 && t < w.e + 0.08;
    const spoken = t >= w.s - 0.02;
    if (active) {
      c.save(); c.fillStyle = '#ffd93b'; c.beginPath();
      const px = 8, py = 6; const rx = x - px, ry = y - size * 0.52, rw = w.wd + px * 2, rh = size * 1.04;
      c.moveTo(rx + 8, ry + 2); c.lineTo(rx + rw - 4, ry); c.lineTo(rx + rw, ry + rh - 6); c.lineTo(rx + 4, ry + rh); c.closePath(); c.fill(); c.restore();
    }
    c.lineJoin = 'round'; c.lineWidth = 11; c.strokeStyle = '#ffffff';
    if (!active) c.strokeText(w.t, x, y + 2);
    c.fillStyle = w.em ? '#d7263d' : (spoken ? '#111' : '#2a2a2a');
    c.fillText(w.t, x, y + 2);
    x += w.wd + space;
  }
  c.restore();
}

// ---------------- frame render ----------------
let lastShot = 0;
function renderAt(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  let si = lastShot; if (si >= SHOTS.length || SHOTS[si].t0 > t) si = 0;
  while (si + 1 < SHOTS.length && SHOTS[si + 1].t0 <= t) si++;
  lastShot = si; const sh = SHOTS[si];
  ctx.fillStyle = sh.bg; ctx.fillRect(0, 0, W, H);
  const cut = sh.cuts && sh.cuts.find(c => t >= c.t0 && t < c.t1);
  if (cut) { for (const el of cut.els) drawElement(ctx, el, t); drawCaptions(ctx, t); return; }
  ctx.save();
  if (sh.zoom) { const p = clamp((t - sh.t0) / Math.max(0.5, Math.min(sh.t1, TL.duration) - sh.t0)); const z = lerp(sh.zoom[0], sh.zoom[1], ease.inOut(p)); const cx = sh.zoom[2] ?? 960, cy = sh.zoom[3] ?? 500; ctx.translate(cx, cy); ctx.scale(z, z); ctx.translate(-cx, -cy); }
  for (const el of sh.els) drawElement(ctx, el, t);
  ctx.restore();
  drawCaptions(ctx, t);
}
window.renderAt = renderAt;
window.renderFrame = n => renderAt(n / FPS);

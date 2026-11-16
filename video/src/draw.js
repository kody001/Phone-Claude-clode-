// Hand-drawn primitives, text, cards and effects.
'use strict';
let BOILF = 0;          // boil frame index (12 fps line boil)
let NOW = 0;            // current absolute time while drawing
const INK = '#16110e';

// ---- point generators ----
function ellPts(cx, cy, rx, ry, n = 44, a0 = 0, a1 = TAU) {
  const p = [];
  const full = Math.abs(a1 - a0) >= TAU - 1e-6;
  const m = full ? n : n + 1;
  for (let i = 0; i < m; i++) { const a = a0 + (a1 - a0) * (i / n); p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
  return p;
}
function rrectPts(x, y, w, h, r, n = 6) {
  r = Math.min(r, w / 2, h / 2);
  const p = [];
  const corner = (cx, cy, a0) => { for (let i = 0; i <= n; i++) { const a = a0 + (Math.PI / 2) * (i / n); p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  corner(x + w - r, y + r, -Math.PI / 2); corner(x + w - r, y + h - r, 0); corner(x + r, y + h - r, Math.PI / 2); corner(x + r, y + r, Math.PI);
  return p;
}
// trapezoid-ish body: top width tw, bottom width bw, height h; origin bottom-center
function trapPts(tw, bw, h, rt = 40, rb = 26, y0 = 0) {
  const p = [];
  const n = 7;
  const tl = [-tw / 2, y0 - h], tr = [tw / 2, y0 - h], br = [bw / 2, y0], bl = [-bw / 2, y0];
  const arc = (cx, cy, r, a0, a1) => { for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  arc(tr[0] - rt, tr[1] + rt, rt, -Math.PI / 2, 0.12);
  arc(br[0] - rb, br[1] - rb, rb, 0.12, Math.PI / 2);
  // slightly curved bottom
  for (let i = 1; i < 6; i++) { const u = i / 6; p.push([lerp(br[0] - rb, bl[0] + rb, u), y0 + Math.sin(u * Math.PI) * 4]); }
  arc(bl[0] + rb, bl[1] - rb, rb, Math.PI / 2, Math.PI - 0.12);
  arc(tl[0] + rt, tl[1] + rt, rt, Math.PI - 0.12, Math.PI * 1.5);
  return p;
}

// ---- hand-inked lines ----
// Lines are static (no boil, like the reference): each shape gets a fixed, seeded hand-drawn irregularity
// and its outline is drawn as a brush stroke whose width swells and tapers.
let BOIL_ON = false;
function wob(pts, closed, seed, amp, step = 13) {
  if (amp <= 0) return pts;
  const out = [];
  const n = pts.length, segs = closed ? n : n - 1;
  let acc = 0;
  const bf = BOIL_ON ? BOILF : 0;
  const ph1 = seed * 1.7 + bf * 2.39, ph2 = seed * 3.1 + bf * 1.13;
  for (let i = 0; i < segs; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const L = Math.hypot(dx, dy) || 0.001;
    const m = Math.max(1, Math.ceil(L / step));
    const nx = -dy / L, ny = dx / L;
    for (let k = 0; k < m; k++) {
      const u = k / m, d = acc + u * L;
      const j = amp * (Math.sin(d * 0.019 + ph1) * 0.62 + Math.sin(d * 0.047 + ph2) * 0.38);
      out.push([a[0] + dx * u + nx * j, a[1] + dy * u + ny * j]);
    }
    acc += L;
  }
  if (!closed) out.push(pts[n - 1].slice());
  return out;
}
function chaikin(p, closed, it = 2) {
  for (let k = 0; k < it; k++) {
    const q = [];
    const n = p.length;
    if (n < 3) return p;
    if (!closed) q.push(p[0]);
    const lim = closed ? n : n - 1;
    for (let i = 0; i < lim; i++) {
      const a = p[i], b = p[(i + 1) % n];
      q.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
    }
    if (!closed) q.push(p[n - 1]);
    p = q;
  }
  return p;
}
function trace(c, p, closed) {
  c.beginPath();
  if (p.length < 2) return;
  c.moveTo(p[0][0], p[0][1]);
  for (let i = 1; i < p.length; i++) c.lineTo(p[i][0], p[i][1]);
  if (closed) c.closePath();
}
// brush outline as a filled ribbon
function ink(c, q, closed, lw, color, seed) {
  const n = q.length;
  if (n < 2) return;
  const len = [0];
  for (let i = 1; i < n; i++) len.push(len[i - 1] + Math.hypot(q[i][0] - q[i - 1][0], q[i][1] - q[i - 1][1]));
  const total = len[n - 1] + (closed ? Math.hypot(q[0][0] - q[n - 1][0], q[0][1] - q[n - 1][1]) : 0) || 1;
  const ph = seed * 2.17;
  const L = [], Rr = [];
  for (let i = 0; i < n; i++) {
    const a = q[closed ? (i - 1 + n) % n : Math.max(0, i - 1)], b = q[closed ? (i + 1) % n : Math.min(n - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1];
    const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
    const u = len[i] / total;
    // pressure: slow swell along the stroke (brush look)
    let w = lw * (0.86 + 0.16 * Math.sin(u * 6.283 * (closed ? 2 : 1.3) + ph) + 0.1 * Math.sin(u * 6.283 * 5 + ph * 1.7));
    if (!closed) w *= 0.42 + 0.58 * Math.pow(Math.min(1, u / 0.18), 0.6) * Math.pow(Math.min(1, (1 - u) / 0.18), 0.6);
    const h = w / 2;
    L.push([q[i][0] - ty * h, q[i][1] + tx * h]);
    Rr.push([q[i][0] + ty * h, q[i][1] - tx * h]);
    if (i === 0) q._w0 = h; if (i === n - 1) q._w1 = h;
  }
  c.beginPath();
  if (closed) {
    c.moveTo(L[0][0], L[0][1]); for (let i = 1; i < n; i++) c.lineTo(L[i][0], L[i][1]); c.closePath();
    c.moveTo(Rr[n - 1][0], Rr[n - 1][1]); for (let i = n - 2; i >= 0; i--) c.lineTo(Rr[i][0], Rr[i][1]); c.closePath();
    c.fillStyle = color; c.fill('nonzero');
    // seam safety: thin stroke along the centre line hides any ribbon cracks at sharp corners
    c.lineWidth = lw * 0.55; c.strokeStyle = color; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(q[0][0], q[0][1]); for (let i = 1; i < n; i++) c.lineTo(q[i][0], q[i][1]); c.closePath(); c.stroke();
  } else {
    c.moveTo(L[0][0], L[0][1]); for (let i = 1; i < n; i++) c.lineTo(L[i][0], L[i][1]);
    for (let i = n - 1; i >= 0; i--) c.lineTo(Rr[i][0], Rr[i][1]);
    c.closePath(); c.fillStyle = color; c.fill('nonzero');
    c.beginPath(); c.arc(q[0][0], q[0][1], q._w0, 0, TAU); c.arc(q[n - 1][0], q[n - 1][1], q._w1, 0, TAU); c.fill();
    c.lineWidth = lw * 0.35; c.strokeStyle = color; c.lineJoin = 'round'; c.lineCap = 'round';
    c.beginPath(); c.moveTo(q[0][0], q[0][1]); for (let i = 1; i < n; i++) c.lineTo(q[i][0], q[i][1]); c.stroke();
  }
}
// draw a shape: o = {fill, stroke, lw, closed, seed, amp}
function shp(c, pts, o = {}) {
  const closed = o.closed !== false;
  const seed = o.seed || 1;
  const p = wob(pts, closed, seed, o.amp === undefined ? 1.6 : o.amp);
  const q = p.length > 3 ? chaikin(p, closed, 2) : p;
  if (o.fill && closed) { trace(c, q, true); c.fillStyle = o.fill; c.fill(); }
  if (o.stroke !== null && o.lw !== 0) ink(c, q, closed, o.lw || 8, o.stroke || INK, seed);
}
const circ = (c, x, y, r, o = {}) => shp(c, ellPts(x, y, r, r, Math.max(18, Math.min(60, r * 0.6))), o);
const ell = (c, x, y, rx, ry, o = {}) => shp(c, ellPts(x, y, rx, ry, Math.max(18, Math.min(60, Math.max(rx, ry) * 0.6))), o);
const rrect = (c, x, y, w, h, r, o = {}) => shp(c, rrectPts(x, y, w, h, r), o);
const line = (c, pts, o = {}) => shp(c, pts, Object.assign({ closed: false }, o));
function poly(c, pts, o = {}) { shp(c, pts, o); }
// simple filled blob without outline
function blob(c, pts, fill, seed = 1, amp = 1) { shp(c, pts, { fill, stroke: null, lw: 0, seed, amp }); }

// ---- text ----
function txt(c, s, x, y, o = {}) {
  const size = o.size || 80;
  c.save();
  c.translate(x, y);
  if (o.rot) c.rotate(o.rot);
  if (o.scale !== undefined) c.scale(o.scale, o.scale);
  c.globalAlpha *= o.alpha === undefined ? 1 : o.alpha;
  c.font = `${o.weight || ''} ${size}px ${o.font || '"Lilita One"'}`;
  c.textAlign = o.align || 'center';
  c.textBaseline = 'middle';
  c.lineJoin = 'round';
  const lines = String(s).split('\n');
  const lh = size * (o.lh || 1.08);
  lines.forEach((ln, i) => {
    const yy = (i - (lines.length - 1) / 2) * lh + (!o.font || o.font.includes('Lilita') ? size * 0.05 : 0);
    if (o.shadow !== false) { c.save(); c.shadowColor = o.shadowColor || 'rgba(0,0,0,0.75)'; c.shadowBlur = size * 0.18; c.shadowOffsetY = size * 0.05; c.fillStyle = 'rgba(0,0,0,0.55)'; c.fillText(ln, size * 0.02, yy + size * 0.05); c.restore(); }
    if (o.lw !== 0) { c.lineWidth = o.lw || size * 0.1; c.strokeStyle = o.stroke || 'rgba(20,12,8,0.9)'; c.strokeText(ln, 0, yy); }
    c.fillStyle = o.fill || '#ffd23f';
    c.fillText(ln, 0, yy);
  });
  c.restore();
}
// animated text pop: registers a sound cue
function popText(c, st, s, x, y, t0, o = {}) {
  if (o.sfx !== false) cue(o.sfx === undefined ? 'pop' : o.sfx, t0, o.vol || 0.7);
  if (st.t < t0) return;
  const kind = o.anim || 'pop';
  let sc = 1, a = 1, dy = 0, rot = o.rot || 0;
  const p = clamp((st.t - t0) / (o.d || 0.35));
  if (kind === 'pop') sc = E.back(p);
  else if (kind === 'slam') { sc = lerp(2.6, 1, E.out(clamp((st.t - t0) / 0.16))); a = clamp((st.t - t0) / 0.08); }
  else if (kind === 'rise') { dy = (1 - E.out(p)) * 60; a = p; }
  else if (kind === 'drop') { dy = -(1 - E.back(p)) * 220; }
  if (o.out !== undefined && st.t > o.out) { const q = clamp((st.t - o.out) / 0.2); sc *= 1 - E.in(q); }
  if (o.wiggle) rot += Math.sin(st.t * 9) * 0.03;
  txt(c, s, x, y + dy, Object.assign({}, o, { scale: sc * (o.scale || 1), alpha: a * (o.alpha === undefined ? 1 : o.alpha), rot }));
}
// typewriter text, registers keyboard clacks
function typeText(c, st, s, x, y, t0, o = {}) {
  const cps = o.cps || 22;
  const dur = s.length / cps;
  if (o.sfx !== false) cue('keys', t0, o.vol || 0.55, { dur });
  const n = Math.floor(clamp((st.t - t0) * cps, 0, s.length));
  if (n <= 0) return;
  const shown = s.slice(0, n) + (n < s.length && Math.floor(st.t * 4) % 2 ? '|' : '');
  txt(c, shown, x, y, Object.assign({ align: 'left', shadow: false, lw: 0, fill: INK, font: '"Patrick Hand"', size: 40 }, o));
}

// list card like "CREDENTIALS": title + items appearing at times
function listCard(c, st, title, items, times, o = {}) {
  const x = o.x || 1260, y0 = o.y || 150, gap = o.gap || 118;
  popText(c, st, title, x, y0, o.t0 !== undefined ? o.t0 : st.s.start + 0.15, { size: o.ts || 74, anim: 'rise', sfx: 'swoosh_up' });
  items.forEach((it, i) => {
    popText(c, st, it, x, y0 + gap * (i + 1) + 20, times[i], { size: o.is || 70, anim: 'slam', sfx: 'thud', vol: 0.8, fill: o.itemFill || '#ffd23f' });
    if (o.strike && o.strike[i] !== undefined && st.t > o.strike[i]) {
      const p = prog(st.t, o.strike[i], 0.25);
      c.save(); c.font = `${o.is || 70}px "Lilita One"`; const w = c.measureText(it).width; c.restore();
      line(c, [[x - w / 2 - 10, y0 + gap * (i + 1) + 26], [x - w / 2 - 10 + (w + 20) * p, y0 + gap * (i + 1) + 14]], { lw: 12, stroke: '#e0262d', seed: i });
      cue('scribble', o.strike[i], 0.7);
    }
  });
}

// ---- cards (tilted photo / document) ----
function card(c, st, x, y, w, h, t0, inner, o = {}) {
  cue(o.sfx === undefined ? 'paper_in' : o.sfx, t0, 0.8);
  if (st.t < t0) return;
  const p = prog(st.t, t0, 0.5, E.back);
  let rot = (o.rot === undefined ? -0.05 : o.rot) + (1 - p) * 0.25;
  const drift = (st.t - t0) * (o.drift === undefined ? 4 : o.drift);
  let yy = y + (1 - p) * (o.from === 'top' ? -900 : 900);
  let out = 1;
  if (o.out !== undefined && st.t > o.out) { const q = E.in(clamp((st.t - o.out) / 0.35)); yy += q * 1100; rot += q * 0.3; }
  rot += Math.sin((st.t - t0) * 0.6) * 0.012;
  c.save();
  c.translate(x + drift, yy);
  c.rotate(rot);
  const sc = (o.scale || 1) * (1 + (st.t - t0) * 0.004);
  c.scale(sc, sc);
  c.fillStyle = 'rgba(0,0,0,0.45)';
  c.fillRect(-w / 2 + 16, -h / 2 + 22, w, h);
  const bw = o.border === undefined ? 16 : o.border;
  c.fillStyle = o.borderColor || '#f1e8d0';
  c.fillRect(-w / 2, -h / 2, w, h);
  c.save();
  c.beginPath(); c.rect(-w / 2 + bw, -h / 2 + bw, w - 2 * bw, h - 2 * bw); c.clip();
  c.translate(-w / 2 + bw, -h / 2 + bw);
  inner(c, w - 2 * bw, h - 2 * bw);
  c.restore();
  if (o.sepia !== false) { c.fillStyle = 'rgba(120,80,30,0.08)'; c.fillRect(-w / 2, -h / 2, w, h); }
  c.restore();
}

// ---- effects ----
function sweat(c, x, y, s, t, seed = 1) {
  const ph = ((t * 0.9 + rnd(seed)) % 1);
  const yy = y + ph * 40 * s;
  c.save(); c.globalAlpha = Math.sin(ph * Math.PI);
  const p = [[0, -22], [9, -2], [9, 8], [0, 15], [-9, 8], [-9, -2]].map(q => [x + q[0] * s, yy + q[1] * s]);
  shp(c, p, { fill: '#7fd0ff', lw: 4 * s, seed });
  c.restore();
}
function shockLines(c, x, y, r, t, n = 7, color = INK) {
  const k = Math.floor(t * 12);
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i - (n - 1) / 2) * 0.32;
    const r0 = r + (k % 2) * 6, r1 = r0 + 34;
    line(c, [[x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a) * r1, y + Math.sin(a) * r1]], { lw: 7, stroke: color, seed: i });
  }
}
function mark(c, st, ch, x, y, t0, o = {}) { popText(c, st, ch, x, y, t0, Object.assign({ size: 150, fill: ch === '?' ? '#ffd23f' : '#ff4d3a', sfx: ch === '?' ? 'question' : 'alert', wiggle: true }, o)); }
function sparkle(c, x, y, s, t, seed = 1, color = '#fff6b0') {
  const ph = (t * 1.6 + rnd(seed) * 3) % 1;
  const k = Math.sin(ph * Math.PI) * s;
  if (k <= 0.02) return;
  c.save(); c.translate(x, y); c.rotate(ph * 1.2); c.fillStyle = color;
  c.beginPath();
  for (let i = 0; i < 8; i++) { const r = i % 2 ? 7 * k : 26 * k; const a = i * Math.PI / 4; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
  c.closePath(); c.fill(); c.restore();
}
function sparkles(c, x, y, w, h, t, n = 8, color) { for (let i = 0; i < n; i++) sparkle(c, x + rnd(i, 4) * w, y + rnd(i, 5) * h, 0.6 + rnd(i, 6) * 0.8, t, i, color); }
function speedLines(c, t, color = 'rgba(255,255,255,0.55)', n = 46, cx = W / 2, cy = H / 2) {
  const k = Math.floor(t * 20);
  c.save(); c.fillStyle = color;
  for (let i = 0; i < n; i++) {
    const a = rnd(i, k) * TAU, r0 = 380 + rnd(i, k + 1) * 260, wdt = 0.006 + rnd(i, 3) * 0.012;
    c.beginPath(); c.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
    c.lineTo(cx + Math.cos(a - wdt) * 1400, cy + Math.sin(a - wdt) * 1400); c.lineTo(cx + Math.cos(a + wdt) * 1400, cy + Math.sin(a + wdt) * 1400); c.fill();
  }
  c.restore();
}
function zzz(c, x, y, t, s = 1) {
  for (let i = 0; i < 3; i++) {
    const ph = (t * 0.45 + i / 3) % 1;
    txt(c, 'Z', x + ph * 70 * s + Math.sin(ph * 6) * 10, y - ph * 140 * s, { size: (30 + ph * 40) * s, alpha: Math.sin(ph * Math.PI), fill: '#fff', lw: 8 * s, shadow: false });
  }
}
function stink(c, x, y, t, color = '#8fbf3a', n = 3, s = 1) {
  for (let i = 0; i < n; i++) {
    const ph = (t * 0.5 + i / n) % 1;
    const pts = [];
    for (let k = 0; k < 8; k++) pts.push([x + (i - 1) * 40 * s + Math.sin(k * 1.2 + t * 3 + i) * 12 * s, y - k * 16 * s - ph * 40 * s]);
    c.save(); c.globalAlpha = Math.sin(ph * Math.PI) * 0.9;
    line(c, pts, { lw: 7 * s, stroke: color, seed: i, amp: 0.5 });
    c.restore();
  }
}
function flies(c, x, y, t, n = 4, s = 1) {
  for (let i = 0; i < n; i++) {
    const a = t * (3 + i) + i * 2, fx = x + Math.cos(a) * (40 + i * 12) * s, fy = y + Math.sin(a * 1.3) * (25 + i * 6) * s;
    c.fillStyle = INK; c.beginPath(); c.arc(fx, fy, 5 * s, 0, TAU); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.7)';
    const fl = Math.floor(t * 30 + i) % 2 ? 6 : 3;
    c.beginPath(); c.ellipse(fx - 3 * s, fy - 6 * s, 4 * s, fl * s, -0.5, 0, TAU); c.fill();
    c.beginPath(); c.ellipse(fx + 3 * s, fy - 6 * s, 4 * s, fl * s, 0.5, 0, TAU); c.fill();
  }
}
function arrow(c, x1, y1, x2, y2, o = {}) {
  const col = o.color || '#e0262d', lw = o.lw || 12;
  const p = o.p === undefined ? 1 : o.p;
  if (p <= 0) return;
  const mx = (x1 + x2) / 2 + (o.bend || 0), my = (y1 + y2) / 2 - Math.abs(o.bend || 0) * 0.5;
  const pts = [];
  for (let i = 0; i <= 16 * p; i++) { const u = i / 16; pts.push([(1 - u) * (1 - u) * x1 + 2 * (1 - u) * u * mx + u * u * x2, (1 - u) * (1 - u) * y1 + 2 * (1 - u) * u * my + u * u * y2]); }
  if (pts.length < 2) return;
  line(c, pts, { lw, stroke: col, seed: 3 });
  if (p >= 1) {
    const a = Math.atan2(y2 - pts[pts.length - 2][1], x2 - pts[pts.length - 2][0]);
    line(c, [[x2 - Math.cos(a - 0.5) * 40, y2 - Math.sin(a - 0.5) * 40], [x2, y2], [x2 - Math.cos(a + 0.5) * 40, y2 - Math.sin(a + 0.5) * 40]], { lw, stroke: col, seed: 4 });
  }
}
function bubble(c, x, y, w, h, tx, ty, s, o = {}) {
  c.save();
  const p = rrectPts(x - w / 2, y - h / 2, w, h, Math.min(48, h / 2));
  shp(c, p, { fill: '#fff', lw: 7, seed: 9 });
  const bx = clamp(tx, x - w / 2 + 40, x + w / 2 - 40);
  const by = ty > y ? y + h / 2 - 4 : y - h / 2 + 4;
  shp(c, [[bx - 22, by], [tx, ty], [bx + 26, by]], { fill: '#fff', lw: 7, closed: false, seed: 10 });
  c.fillStyle = '#fff'; c.fillRect(bx - 18, by - 8, 40, 14);
  txt(c, s, x, y, Object.assign({ size: 46, font: '"Patrick Hand"', fill: INK, lw: 0, shadow: false }, o));
  c.restore();
}
function thoughtCloud(c, x, y, w, h, tx, ty, seed = 2) {
  const pts = [];
  const n = 12;
  for (let i = 0; i < n; i++) {
    const a0 = i / n * TAU, a1 = (i + 1) / n * TAU;
    for (let k = 0; k <= 6; k++) { const a = lerp(a0, a1, k / 6); const bump = Math.sin(k / 6 * Math.PI) * 0.16; pts.push([x + Math.cos(a) * w / 2 * (1 + bump), y + Math.sin(a) * h / 2 * (1 + bump)]); }
  }
  shp(c, pts, { fill: '#fff', lw: 7, seed });
  for (let i = 0; i < 3; i++) { const u = (i + 1) / 4; circ(c, lerp(x, tx, 0.55 + u * 0.45), lerp(y + h / 2, ty, u), 22 - i * 6, { fill: '#fff', lw: 6, seed: seed + i }); }
}
function bigX(c, x, y, s, p = 1, color = '#e0262d') {
  const r = 110 * s;
  if (p > 0) line(c, [[x - r, y - r], [x - r + 2 * r * clamp(p * 2), y - r + 2 * r * clamp(p * 2)]], { lw: 30 * s, stroke: color });
  if (p > 0.5) line(c, [[x + r, y - r], [x + r - 2 * r * clamp(p * 2 - 1), y - r + 2 * r * clamp(p * 2 - 1)]], { lw: 30 * s, stroke: color });
}
function check(c, x, y, s, p = 1, color = '#2fbf4a') {
  const pts = [[x - 90 * s, y], [x - 25 * s, y + 70 * s], [x + 110 * s, y - 90 * s]];
  const L1 = 1, q = p * 2;
  const out = [pts[0]];
  if (q > 0) out.push([lerp(pts[0][0], pts[1][0], clamp(q)), lerp(pts[0][1], pts[1][1], clamp(q))]);
  if (q > 1) out.push([lerp(pts[1][0], pts[2][0], clamp(q - 1)), lerp(pts[1][1], pts[2][1], clamp(q - 1))]);
  if (out.length > 1) line(c, out, { lw: 32 * s, stroke: color });
}
function glow(c, x, y, r, color, a = 1) {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.save(); c.globalAlpha *= a; c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); c.restore();
}
function shadowEll(c, x, y, w, a = 0.28) { c.save(); c.fillStyle = `rgba(0,0,0,${a})`; c.beginPath(); c.ellipse(x, y, w, w * 0.16, 0, 0, TAU); c.fill(); c.restore(); }
function grad(c, stops, x0 = 0, y0 = 0, x1 = 0, y1 = H) { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach((s, i) => g.addColorStop(s[0], s[1])); return g; }
function radial(c, x, y, r0, r1, stops) { const g = c.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(s => g.addColorStop(s[0], s[1])); return g; }
// enter/exit helper: returns {dx, dy, sc, a}
function enter(st, t0, kind = 'pop', d = 0.4, o = {}) {
  const r = { dx: 0, dy: 0, sc: 1, a: 1, rot: 0 };
  const lt = st.t - t0;
  if (o.sfx !== false && kind !== 'none') cue(o.sfx || ({ pop: 'pop_char', left: 'swoosh', right: 'swoosh', up: 'swoosh_up', drop: 'fall_whistle', fade: null })[kind] || 'swoosh', t0, o.vol || 0.6);
  if (lt < 0) { r.a = 0; r.sc = 0; return r; }
  const p = clamp(lt / d);
  if (kind === 'pop') r.sc = E.back(p);
  else if (kind === 'left') r.dx = -(1 - E.out(p)) * 1300;
  else if (kind === 'right') r.dx = (1 - E.out(p)) * 1300;
  else if (kind === 'up') r.dy = (1 - E.back(p)) * 900;
  else if (kind === 'drop') { r.dy = -(1 - E.in(p)) * 1100; }
  else if (kind === 'fade') r.a = p;
  if (o.out !== undefined && st.t > o.out) {
    const q = clamp((st.t - o.out) / (o.od || 0.35));
    const ok = o.outKind || 'right';
    if (ok === 'right') r.dx += E.in(q) * 1400; else if (ok === 'left') r.dx -= E.in(q) * 1400; else if (ok === 'pop') r.sc *= 1 - E.in(q); else if (ok === 'fade') r.a *= 1 - q; else if (ok === 'down') r.dy += E.in(q) * 1100;
    if (o.outSfx !== false && q === 0) {}
  }
  if (o.out !== undefined && o.outSfx !== false) cue(o.outSfx || 'swoosh', o.out, 0.5);
  return r;
}

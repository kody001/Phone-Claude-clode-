// ============================================================
//  Scene-building kit: animated helpers on top of engine.js
// ============================================================
'use strict';
let SHOT_T0 = 0;
const _shot = shot;
// wrap shot() so helpers know the shot start
function S(phrase, build, o = {}) {
  _shot(phrase, (add, t0) => { SHOT_T0 = t0; build(add, t0); }, o);
}
const tt = t => (t === undefined || t === null) ? SHOT_T0 : t;

// ---- characters ----
let ELON_N = 0;
function elon(o = {}) {
  ELON_N++;
  // reference-style variety: every third standing-right shot, the mascot leans in from the corner instead
  if (!o.peek && (o.x || 0) >= 1600 && o.y === undefined && ELON_N % 3 === 1) o = { ...o, peek: 'R' };
  if (o.peek === 'R') o = { ...o, x: 1790, y: 1185, s: 1.0, rot: -24 };
  if (o.peek === 'L') o = { ...o, x: 130, y: 1185, s: 1.0, rot: 24 };
  return new Elon({ x: 1500, y: 955, s: 0.82, t0: SHOT_T0, enter: 'none', ...o, t0: tt(o.t0) });
}
function stick(o = {}) { return new Stick({ x: 960, y: 955, s: 1, t0: SHOT_T0, enter: 'pop', ...o, t0: tt(o.t0) }); }

// ---- props / text ----
function P(name, p, x, y, s = 1, t0, o = {}) { return spr(name, p || {}, { x, y, s, t0: tt(t0), ...o }); }
function big(str, x, y, t0, o = {}) { return txt(str, { x, y, t0: tt(t0), enter: o.enter || 'popBig', z: o.z ?? 6, rot: o.rot || 0, t1: o.t1, exit: o.exit, style: { size: o.size || 110, font: o.font || 'marker', color: o.color || INK, outline: o.outline ?? '#fff', olw: o.olw || 10, lh: o.lh } }); }
function note(str, x, y, t0, o = {}) { return txt(str, { x, y, t0: tt(t0), enter: o.enter || 'pop', z: o.z ?? 6, rot: o.rot || 0, t1: o.t1, exit: o.exit, style: { size: o.size || 54, font: o.font || 'hand', color: o.color || INK, outline: o.outline, olw: o.olw, align: o.align, lh: o.lh } }); }

// ---- partial polyline drawing ----
function polyLen(pts) { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; }
function partial(pts, p) {
  if (p >= 1) return pts.slice();
  const L = polyLen(pts) * p; let acc = 0; const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (acc + d >= L) { const k = (L - acc) / d; out.push([lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]); return out; }
    acc += d; out.push(pts[i]);
  }
  return out;
}
function strokePts(c, pts, lw, color) {
  if (pts.length < 2) return;
  c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
  c.lineWidth = lw; c.strokeStyle = color; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke();
}
function densify(pts, step = 10, amp = 1.4, seed = 5) { return jitter(pts, false, amp, seed, step); }
// draw-on stroke (absolute coords)
function drawOn(pts, o = {}) {
  const jp = o.smooth ? smoothPts(pts) : densify(pts, 10, o.amp ?? 1.2, o.seed || 9);
  const dur = o.dur || 0.6;
  return E({ t0: tt(o.t0), t1: o.t1, x: 0, y: 0, enter: 'none', exit: o.exit, z: o.z ?? 7, render: (c, t, el) => {
    const p = ease.inOut(clamp((t - el.t0) / dur)); const pp = partial(jp, p);
    strokePts(c, pp, o.lw || 8, o.color || COL.red);
    if (o.head && pp.length > 1) { const a = pp[pp.length - 1], b = pp[Math.max(0, pp.length - 4)]; if (p > 0.05) arrowHead(c, a[0], a[1], Math.atan2(a[1] - b[1], a[0] - b[0]), o.headSize || 30, { color: o.color || COL.red, lw: o.lw || 8, seed: 3 }); }
  } });
}
function smoothPts(pts) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let j = 0; j < 12; j++) { const t = j / 12, t2 = t * t, t3 = t2 * t; out.push([0, 1].map(k => .5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3))); }
  }
  out.push(pts[pts.length - 1]); return out;
}
function arrowTo(x1, y1, x2, y2, t0, o = {}) {
  const mx = (x1 + x2) / 2 + (o.bend || 0) * (y2 - y1) * 0.25, my = (y1 + y2) / 2 - (o.bend || 0) * (x2 - x1) * 0.25;
  return drawOn(o.bend ? smoothPts([[x1, y1], [mx, my], [x2, y2]]) : [[x1, y1], [x2, y2]], { t0, head: true, dur: o.dur || 0.45, lw: o.lw || 10, color: o.color || COL.red, headSize: o.headSize || 34, z: o.z, t1: o.t1 });
}
function circleMark(x, y, rx, ry, t0, o = {}) {
  const pts = []; const n = 60; const R = rnd(o.seed || 17);
  for (let i = 0; i <= n * 1.12; i++) { const a = -2.2 + i / n * Math.PI * 2; const k = 1 + (R() - .5) * 0.04 + i / n * 0.06; pts.push([x + Math.cos(a) * rx * k, y + Math.sin(a) * ry * k]); }
  return drawOn(pts, { t0, dur: o.dur || 0.5, lw: o.lw || 8, color: o.color || COL.red, amp: 0.6, z: o.z ?? 8, t1: o.t1 });
}
function underline(x1, x2, y, t0, o = {}) { return drawOn([[x1, y], [x2, y + 4]], { t0, dur: o.dur || .35, lw: o.lw || 9, color: o.color || COL.red, z: o.z ?? 8 }); }
function strike(x1, y1, x2, y2, t0, o = {}) { return drawOn([[x1, y1], [x2, y2]], { t0, dur: o.dur || .3, lw: o.lw || 12, color: o.color || COL.red, z: o.z ?? 9 }); }
function crossOut(x, y, w, h, t0, o = {}) {
  return [strike(x - w / 2, y - h / 2, x + w / 2, y + h / 2, t0, o), strike(x + w / 2, y - h / 2, x - w / 2, y + h / 2, t0 + .18, o)];
}
// translucent highlighter swipe
function highlight(x, y, w, h, t0, o = {}) {
  const dur = o.dur || 0.45; const R = rnd(o.seed || 77);
  return E({ t0: tt(t0), x: 0, y: 0, enter: 'none', z: o.z ?? 2, t1: o.t1, render: (c, t, el) => {
    const p = ease.out(clamp((t - el.t0) / dur)); if (p <= 0) return;
    c.save(); c.globalAlpha *= o.alpha ?? 0.55; c.fillStyle = o.color || '#ffd84a';
    c.beginPath(); c.moveTo(x, y + 3); c.lineTo(x + w * p, y); c.lineTo(x + w * p + 4, y + h - 2); c.lineTo(x - 2, y + h); c.closePath(); c.fill(); c.restore();
  } });
}
// animated counter
function counter(x, y, from, to, fmt, t0, dur, o = {}) {
  return E({ t0: tt(t0), x, y, enter: o.enter || 'pop', z: o.z ?? 6, t1: o.t1, render: (c, t, el) => {
    const p = ease.out(clamp((t - el.t0) / dur)); const v = lerp(from, to, p);
    text(c, fmt(v), 0, 0, { size: o.size || 120, font: o.font || 'marker', color: o.color || INK, outline: o.outline ?? '#fff', olw: o.olw || 10 });
  } });
}
const fmtB = (d = 0, pre = '$', suf = 'B') => v => pre + v.toFixed(d) + suf;
// line chart drawn progressively. data in [0..1] normalized coords
function lineChart(o) {
  const { x, y, w, h } = o; const t0 = tt(o.t0); const dur = o.dur || 1.4;
  const pts = o.data.map(([a, b]) => [x + a * w, y + h - b * h]);
  const jp = o.straight ? pts.slice() : smoothPts(pts);
  const els = [];
  if (o.frame !== false) els.push(E({ t0, x: 0, y: 0, enter: 'fade', edur: .2, z: 3, render: (c) => {
    SEED = 900; line(c, [[x, y - 20], [x, y + h], [x + w + 20, y + h]], { lw: 5 });
    for (let i = 1; i <= 4; i++) { c.save(); c.strokeStyle = '#e6e6e6'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 4, y + h - i * h / 4.4); c.lineTo(x + w, y + h - i * h / 4.4); c.stroke(); c.restore(); }
    if (o.xlabels) o.xlabels.forEach(([a, s]) => text(c, s, x + a * w, y + h + 30, { size: 30, color: '#555' }));
    if (o.title) text(c, o.title, x + w / 2, y - 40, { size: 40 });
  } }));
  if (o.ref !== undefined) els.push(E({ t0: tt(o.refT ?? t0), x: 0, y: 0, enter: 'fade', z: 3, render: (c) => {
    const yy = y + h - o.ref * h; c.save(); c.setLineDash([14, 12]); c.strokeStyle = o.refColor || '#666'; c.lineWidth = 4; c.beginPath(); c.moveTo(x, yy); c.lineTo(x + w, yy); c.stroke(); c.restore();
    if (o.refLabel) text(c, o.refLabel, x + w + 10, yy, { size: 32, align: 'left', color: o.refColor || '#555' });
  } }));
  els.push(E({ t0, x: 0, y: 0, enter: 'none', z: 4, render: (c, t) => {
    let p;
    if (o.keys) { // piecewise reveal by time: keys [[t, frac]]
      p = o.from || 0; for (const [kt, kf] of o.keys) { if (t < kt) break; p = lerp(p, kf, ease.inOut(clamp((t - kt) / (o.segDur || 0.9)))); }
    } else p = ease.inOut(clamp((t - t0) / dur));
    const pp = partial(jp, p);
    strokePts(c, pp, o.lw || 9, o.color || COL.green);
    if (o.dot !== false && pp.length) { const a = pp[pp.length - 1]; c.beginPath(); c.arc(a[0], a[1], (o.lw || 9) * 0.9, 0, 7); c.fillStyle = o.color || COL.green; c.fill(); }
  } }));
  return els;
}
// bar chart
function bars(o) {
  const { x, y, w, h, vals } = o; const n = vals.length; const bw = w / n * (o.fill || 0.6); const mx = o.max || Math.max(...vals);
  return vals.map((v, i) => {
    const bh = v / mx * h; const bx = x + (i + .5) * w / n;
    const t0 = tt(o.t0) + (o.times ? o.times[i] - tt(o.t0) : i * (o.stagger ?? .25));
    return E({ t0, x: bx, y: y + h, enter: 'none', z: 4, render: (c, t, el) => {
      const p = ease.back(clamp((t - el.t0) / .5)); const hh = bh * p;
      SEED = 500 + i; rect(c, -bw / 2, -hh, bw, hh, { fill: (o.colors || [])[i] || COL.blue, lw: 5, amp: .8 });
      if (o.labels) text(c, o.labels[i], 0, 36, { size: o.lsize || 36 });
      if (o.vlabels && p > .6) text(c, o.vlabels[i], 0, -hh - 34, { size: o.vsize || 46, font: 'marker', color: (o.vcolors || [])[i] || INK });
    } });
  });
}
// pie that sweeps in
function pie(o) {
  const { x, y, r, slices } = o; const tot = slices.reduce((s, q) => s + q.v, 0);
  return E({ t0: tt(o.t0), x, y, enter: 'pop', z: 4, render: (c, t, el) => {
    let a = -Math.PI / 2;
    slices.forEach((sl, i) => {
      const st = sl.t !== undefined ? sl.t : el.t0;
      const p = ease.out(clamp((t - st) / (o.dur || .7))); if (p <= 0) { a += sl.v / tot * Math.PI * 2; return; }
      const a1 = a + sl.v / tot * Math.PI * 2 * p;
      SEED = 700 + i;
      const pts = [[0, 0], ...ellPts(0, 0, r, r, Math.max(3, Math.round(60 * sl.v / tot)), a, a1)];
      const off = sl.pop ? ease.back(clamp((t - (sl.popT || st)) / .4)) * 26 : 0; const mid = (a + a1) / 2;
      c.save(); c.translate(Math.cos(mid) * off, Math.sin(mid) * off); shape(c, pts, { fill: sl.color, lw: 5 }); c.restore();
      a += sl.v / tot * Math.PI * 2;
    });
  } });
}
// stamp effect (big text slams in rotated)
function stamp(str, x, y, t0, o = {}) {
  return E({ t0: tt(t0), x, y, rot: o.rot ?? -12, enter: 'none', z: o.z ?? 9, t1: o.t1, render: (c, t, el) => {
    const p = clamp((t - el.t0) / .25); const s = lerp(2.4, 1, ease.out(p)); const a = p;
    c.globalAlpha *= a; c.scale(s, s);
    const w = o.w || (textWidth(str, o.size || 80, 'marker') + 60), h = (o.size || 80) * 1.35;
    SEED = 4242; rect(c, -w / 2, -h / 2, w, h, { fill: o.bg || 'rgba(255,255,255,.85)', stroke: o.color || COL.red, lw: 8, r: 10 });
    text(c, str, 0, 4, { size: o.size || 80, font: 'marker', color: o.color || COL.red });
  } });
}
// starfield background (for space shots)
function stars(o = {}) {
  // reference style: plain white background (no starfield)
  return E({ t0: SHOT_T0 - 1, x: 0, y: 0, enter: 'none', z: -10, render: () => { } });
  const R = rnd(o.seed || 11); const st = [...Array(o.n || 140)].map(() => [R() * W, R() * H, R() * 2.6 + .8, R() * 6]);
  return E({ t0: SHOT_T0 - 1, x: 0, y: 0, enter: 'none', z: -10, render: (c, t) => {
    c.fillStyle = o.bg || '#0e1530'; c.fillRect(-100, -100, W + 200, H + 200);
    for (const [x, y, r, ph] of st) { c.globalAlpha = 0.55 + 0.45 * Math.sin(t * 2 + ph); c.beginPath(); c.arc(x, y, r, 0, 7); c.fillStyle = '#fff'; c.fill(); }
    c.globalAlpha = 1;
  } });
}
function bgColor(col) { return E({ t0: SHOT_T0 - 1, x: 0, y: 0, enter: 'none', z: -10, render: c => { c.fillStyle = col; c.fillRect(-100, -100, W + 200, H + 200); } }); }
// moving element along a path over time
function mover(name, p, path, t0, dur, o = {}) {
  return E({ t0: tt(t0), x: 0, y: 0, enter: 'none', z: o.z ?? 5, t1: o.t1, render: (c, t, el) => {
    const k = (o.ease || ease.inOut)(clamp((t - el.t0) / dur));
    const seg = (path.length - 1) * k; const i = Math.min(path.length - 2, Math.floor(seg)); const f = seg - i;
    const a = path[i], b = path[i + 1];
    const x = lerp(a[0], b[0], f), y = lerp(a[1], b[1], f), s = lerp(a[2] ?? 1, b[2] ?? 1, f), r = lerp(a[3] ?? 0, b[3] ?? 0, f);
    c.save(); c.translate(x, y); c.rotate(rad(r)); drawSprite(c, name, p, 0, 0, s); c.restore();
    if (o.after) o.after(c, t, x, y, k);
  } });
}
// shaking wrapper for an element
function shake(el, t0, dur = 0.5, amp = 10) {
  const r0 = el.render;
  el.render = (c, t, e) => { if (t >= t0 && t < t0 + dur) { const k = 1 - (t - t0) / dur; c.translate(Math.sin(t * 90) * amp * k, Math.cos(t * 70) * amp * .5 * k); } r0(c, t, e); };
  return el;
}
// rocket with flame flicker flying along a path
function rocketFly(path, t0, dur, o = {}) {
  return E({ t0: tt(t0), x: 0, y: 0, enter: 'none', z: o.z ?? 5, t1: o.t1, render: (c, t, el) => {
    const k = (o.ease || ease.in)(clamp((t - el.t0) / dur));
    const seg = (path.length - 1) * k; const i = Math.min(path.length - 2, Math.floor(seg)); const f = seg - i;
    const a = path[i], b = path[i + 1]; const x = lerp(a[0], b[0], f), y = lerp(a[1], b[1], f); const s = o.s || 0.6;
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]) + Math.PI / 2;
    c.save(); c.translate(x, y); c.rotate(o.fixedRot !== undefined ? rad(o.fixedRot) : ang);
    if (t > el.t0 - 0.01 && o.flame !== false) { const fl = 1 + Math.sin(t * 40) * .12; c.save(); c.translate(0, 215 * s); c.scale(s * fl, s * fl * (1 + Math.sin(t * 33) * .1)); drawSprite(c, 'flame', {}, 0, 75, 1); c.restore(); }
    drawSprite(c, o.kind || 'rocket', o.p || {}, 0, 0, s);
    c.restore();
  } });
}
// group of money bills raining
function moneyRain(t0, dur, o = {}) {
  const R = rnd(o.seed || 31); const n = o.n || 18;
  const items = [...Array(n)].map(() => ({ x: (o.x0 ?? 100) + R() * ((o.x1 ?? 1820) - (o.x0 ?? 100)), d: R() * dur * 0.7, sp: 500 + R() * 400, r: R() * 360, vr: (R() - .5) * 200, s: .45 + R() * .3 }));
  return E({ t0: tt(t0), x: 0, y: 0, enter: 'none', z: o.z ?? 8, t1: o.t1, render: (c, t, el) => {
    for (const it of items) { const lt = t - el.t0 - it.d; if (lt < 0) continue; const y = -100 + lt * it.sp; if (y > 1200) continue; c.save(); c.translate(it.x + Math.sin(lt * 3) * 30, y); c.rotate(rad(it.r + it.vr * lt)); drawSprite(c, o.name || 'bill', {}, 0, 0, it.s); c.restore(); }
  } });
}
// simple "speed lines"/emphasis burst behind something
function burst(x, y, t0, o = {}) {
  return E({ t0: tt(t0), x, y, enter: 'pop', z: o.z ?? 0, render: (c, t) => {
    const n = 16; c.save(); c.rotate(t * 0.3);
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; c.beginPath(); c.moveTo(Math.cos(a) * (o.r0 || 120), Math.sin(a) * (o.r0 || 120)); c.lineTo(Math.cos(a + .1) * (o.r1 || 330), Math.sin(a + .1) * (o.r1 || 330)); c.lineTo(Math.cos(a - .1) * (o.r1 || 330), Math.sin(a - .1) * (o.r1 || 330)); c.closePath(); c.fillStyle = o.color || 'rgba(255,216,74,.45)'; c.fill(); }
    c.restore();
  } });
}

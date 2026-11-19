// Helpers shared by the shot files + a few extra props/cards used by them.
'use strict';
const FY = 930; // feet line for standing characters

const mascot = (x, pose = 'rest', face = 'neutral', o = {}) => M(Object.assign({ x, y: FY, s: 0.8, pose, face }, o));
const stick = (cast, x, pose = 'rest', face = 'neutral', o = {}) => K(cast, Object.assign({ x, y: FY, s: 1, pose, face }, o));
// mascot leaning in from a bottom corner (big head + one arm), like the reference channel
const peek = (side, pose = 'point>960,420', face = 'neutral', o = {}) => M(Object.assign(side === 'L'
  ? { x: 130, y: 1235, s: 1.45, rot: 0.38 }
  : { x: 1790, y: 1235, s: 1.45, rot: -0.38 }, { pose, face, in: side === 'L' ? 'slideL' : 'slideR', inDur: 0.3 }, o));
const big = (text, x, y, o = {}) => T(text, Object.assign({ x, y, size: 130, color: COL.red }, o));
const label = (text, x, y, o = {}) => T(text, Object.assign({ x, y, size: 58, color: COL.ink }, o));
const doc = (o) => C('doc', Object.assign({ x: 760, y: 450, w: 1000 }, o));
const stamp = (text, x, y, o = {}) => C('stamp', Object.assign({ x, y, text, in: 'none' }, o));
const arrow = (from, to, o = {}) => C('arrow', Object.assign({ x: 0, y: 0, from, to }, o));
const circ = (x, y, rx, ry, o = {}) => C('circle', Object.assign({ x, y, rx, ry }, o));
const trend = (x, y, o = {}) => C('trend', Object.assign({ x, y, in: 'none' }, o));
const houses = (n, x0, y, gap, s = 0.6, o = {}) => Array.from({ length: n }, (_, i) => P('house', Object.assign({ x: x0 + i * gap, y, s, a: { wall: [COL.wall, '#cfe3f2', '#f6d1c4', '#dff0d0', '#efe2f7'][i % 5], roof: [COL.roof, '#5c7fa6', '#7a4a2a', '#4f8a5a', '#8a5aa6'][i % 5] } }, typeof o === 'function' ? o(i) : o)));
const restaurantBg = () => ({ pre(ctx) { ctx.fillStyle = '#fbf3e6'; ctx.fillRect(0, 0, 1920, 1080); ctx.fillStyle = '#efe0c8'; ctx.fillRect(0, 760, 1920, 320); ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 3; for (let x = 0; x < 1920; x += 160) { ctx.beginPath(); ctx.moveTo(x, 760); ctx.lineTo(x - 120, 1080); ctx.stroke(); } } });

// ---------- extra props ----------
defProp('corkboard', (p) => {
  p.rect(-260, -170, 520, 340, { fill: '#c99a62', lw: 6 });
  p.rect(-240, -150, 480, 300, { fill: '#d9ae78', lw: 3 });
  const spots = [[-170, -80], [0, -100], [160, -60], [-120, 70], [90, 80]];
  for (const [x, y] of spots) { p.rect(x - 46, y - 36, 92, 72, { fill: '#fff', lw: 3 }); p.circle(x, y - 34, 7, { fill: COL.red, lw: 2 }); p.text('?', x, y + 6, { font: '700 40px Kalam' }); }
  for (let i = 0; i < spots.length; i++) for (let k = i + 1; k < spots.length; k += 2) p.seg(spots[i][0], spots[i][1] - 34, spots[k][0], spots[k][1] - 34, { lw: 3, stroke: COL.red, amp: 0.4 });
});
defProp('door', (p, a) => {
  p.rect(-100, -190, 200, 380, { fill: '#8a5a3c', lw: 6 });
  p.rect(-70, -160, 140, 130, { fill: '#9a6a4a', lw: 3 }); p.rect(-70, 0, 140, 150, { fill: '#9a6a4a', lw: 3 });
  p.circle(70, 10, 9, { fill: COL.gold, lw: 3 });
  if (a.sign) { p.rect(-90, -260, 180, 56, { fill: '#fff8e1', lw: 4 }); p.text(a.sign, 0, -232, { font: '700 32px Kalam' }); }
});
defProp('chefHat', (p) => {
  p.rect(-40, 10, 80, 40, { fill: '#fff', lw: 4 });
  for (const [x, y, r] of [[-30, -10, 28], [0, -26, 32], [30, -10, 28]]) p.circle(x, y, r, { fill: '#fff', lw: 4 });
});
defProp('tag', (p, a) => {
  p.shape([[-90, -50], [80, -50], [120, 0], [80, 50], [-90, 50]], { fill: a.fill || COL.yellow, lw: 5, smooth: false });
  p.circle(84, 0, 9, { fill: '#fff', lw: 3 });
  p.text(a.text || '$$$', -10, 4, { font: `700 ${a.size || 52}px Kalam`, fill: a.color || COL.red });
});
defProp('tv', (p) => {
  p.rect(-130, -90, 260, 170, { fill: '#2f353d', lw: 5, r: 10 });
  p.rect(-114, -76, 228, 142, { fill: '#7fc8ff', stroke: null });
  p.seg(-40, 80, -60, 120, { lw: 5 }); p.seg(40, 80, 60, 120, { lw: 5 });
});
defProp('couch', (p) => {
  p.rect(-200, -60, 400, 90, { fill: '#c0504a', lw: 5, r: 18 });
  p.rect(-230, -10, 460, 80, { fill: '#d0605a', lw: 5, r: 18 });
  p.seg(-200, 70, -200, 100, { lw: 7 }); p.seg(200, 70, 200, 100, { lw: 7 });
});
defProp('stove', (p) => {
  p.rect(-130, -60, 260, 200, { fill: '#e6ecf0', lw: 5, r: 8 });
  for (const x of [-60, 60]) p.ellipse(x, -60, 44, 10, { fill: '#2f353d', lw: 4 });
  p.rect(-100, 0, 200, 110, { fill: '#c9ced3', lw: 4, r: 6 });
});
defProp('tableSmall', (p) => {
  p.ellipse(0, -10, 70, 14, { fill: '#fff', lw: 4 });
  p.shape([[-70, -10], [70, -10], [74, 26], [-74, 26]], { fill: '#fff', lw: 4 });
  p.seg(0, 26, 0, 80, { lw: 6 }); p.seg(-26, 80, 26, 80, { lw: 5 });
  p.shape([[-8, -34], [8, -34], [5, -12], [-5, -12]], { fill: COL.red, lw: 2.5, smooth: false });
  p.shape([[30, -44], [42, -44], [40, -14], [32, -14]], { fill: '#d9f0ff', lw: 2.5, smooth: false });
});
defProp('cooks', (p) => {});

// ---------- extra cards ----------
function drawStamp(ctx, a, t, tt) {
  const k = U.clamp((tt - a.t0) / 0.22);
  if (k <= 0) return;
  const s = U.lerp(2.4, 1, U.easeOutCubic(k));
  ctx.save(); ctx.rotate(a.rot == null ? -0.12 : a.rot); ctx.scale(s, s); ctx.globalAlpha *= U.clamp(k * 2);
  ctx.font = `700 ${a.size || 90}px Kalam`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(a.text).width + 60, h = (a.size || 90) * 1.25;
  ctx.strokeStyle = a.color || COL.red; ctx.lineWidth = 9; ctx.strokeRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = a.color || COL.red; ctx.fillText(a.text, 0, 6);
  ctx.restore();
}
function drawTrend(ctx, a, t, tt) {
  const k = U.easeInOut(U.clamp((tt - a.t0) / (a.dur || 0.7)));
  if (k <= 0) return;
  const w = a.w || 420, h = a.h || 300, up = a.down ? -1 : 1, n = a.n || 6;
  const pts = [];
  const r = U.rng(a.seed || 4);
  for (let i = 0; i <= n; i++) { const f = i / n; const lin = up > 0 ? h / 2 - h * f : -h / 2 + h * f; const zig = (i > 0 && i < n) ? (i % 2 ? 1 : -1) * h * 0.12 * (0.6 + r() * 0.6) : 0; pts.push([-w / 2 + w * f, lin + zig]); }
  const part = INK.partial(pts, k);
  const pen = new Pen(ctx, 61, 1.2);
  const col = a.color || (a.down ? COL.red : COL.green);
  pen.line(part, { lw: a.lw || 14, stroke: col });
  if (k > 0.9) {
    const e = part[part.length - 1], q = part[part.length - 2] || pts[0];
    const ang = Math.atan2(e[1] - q[1], e[0] - q[0]), hs = 46;
    pen.shape([[e[0] + Math.cos(ang) * 20, e[1] + Math.sin(ang) * 20], [e[0] + Math.cos(ang + 2.5) * hs, e[1] + Math.sin(ang + 2.5) * hs], [e[0] + Math.cos(ang - 2.5) * hs, e[1] + Math.sin(ang - 2.5) * hs]], { fill: col, stroke: col, lw: 4, smooth: false });
  }
}
// ring of items or a "money flow" of bills moving along a path
function drawFlow(ctx, a, t, tt) {
  const n = a.n || 5, [x0, y0] = a.from, [x1, y1] = a.to, dur = a.dur || 1.6;
  if (tt < a.t0) return;
  for (let i = 0; i < n; i++) {
    const k = ((tt - a.t0) / dur + i / n) % 1;
    const x = U.lerp(x0, x1, k), y = U.lerp(y0, y1, k) - Math.sin(k * Math.PI) * (a.arc || 80);
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(tt * 3 + i) * 0.2); ctx.scale(a.s || 0.35, a.s || 0.35);
    ctx.globalAlpha *= Math.min(1, Math.min(k, 1 - k) * 6);
    drawProp(ctx, a.prop || 'cash', a.a, tt);
    ctx.restore();
  }
}
// grid of small items (e.g. 40 empty tables)
function drawGridOf(ctx, a, t, tt) {
  const cols = a.cols || 8, rows = a.rows || 5, gx = a.gx || 150, gy = a.gy || 110, s = a.s || 0.5, per = a.per || 0.03;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const i = r * cols + c;
    const k = U.easeOutBack(U.clamp((tt - a.t0 - i * per) / 0.25), 2);
    if (k <= 0) continue;
    ctx.save(); ctx.translate((c - (cols - 1) / 2) * gx + (r % 2) * (a.stagger || 0), (r - (rows - 1) / 2) * gy); ctx.scale(s * k, s * k);
    drawProp(ctx, a.prop, a.a, tt);
    ctx.restore();
  }
}
// small stick people in a row (cheap crowd that can wear party hats / be faded)
function drawPeople(ctx, a, t, tt) {
  const n = a.n || 6, gap = a.gap || 120;
  const names = a.cast || ['joe', 'diner2', 'diner3', 'diner4', 'mom', 'dad', 'kid', 'grandma', 'student', 'neighbor', 'worker', 'analyst'];
  for (let i = 0; i < n; i++) {
    const k = U.easeOutBack(U.clamp((tt - a.t0 - i * (a.per || 0.06)) / 0.3), 2);
    if (k <= 0) continue;
    const c = CAST[names[i % names.length]];
    const pose = a.pose || 'rest';
    const st = { x: (i - (n - 1) / 2) * gap, y: (i % 2) * (a.zig || 0), s: (a.s || 0.5) * k, expr: a.face || 'neutral', look: [0, 0], talk: 0, blink: false, bob: Math.sin(tt * 2 + i) * 2, tilt: 0 };
    st.hands = { L: posedHand(STICK_GEO, 'L', pose), R: posedHand(STICK_GEO, 'R', pose) };
    ctx.save(); if (a.alpha) ctx.globalAlpha *= a.alpha;
    drawStick(ctx, c, st, tt);
    if (a.hats) { ctx.save(); ctx.translate(st.x, st.y + (STICK_GEO.head.y - 70) * st.s); ctx.scale(st.s * 0.7, st.s * 0.7); drawProp(ctx, 'partyHat', {}, tt); ctx.restore(); }
    if (a.chef) { ctx.save(); ctx.translate(st.x, st.y + (STICK_GEO.head.y - 80) * st.s); ctx.scale(st.s * 1.1, st.s * 1.1); drawProp(ctx, 'chefHat', {}, tt); ctx.restore(); }
    ctx.restore();
  }
}
Object.assign(CARDS, { stamp: drawStamp, trend: drawTrend, flow: drawFlow, gridOf: drawGridOf, people: drawPeople });

// sagging power line between two screen points, drawn on
function drawWire(ctx, a, t, tt) {
  const k = U.easeInOut(U.clamp((tt - a.t0) / (a.dur || 0.5)));
  if (k <= 0) return;
  const [x0, y0] = a.from, [x1, y1] = a.to, sag = a.sag == null ? 40 : a.sag;
  const pts = INK.quad([x0, y0], [(x0 + x1) / 2, (y0 + y1) / 2 + sag * 2], [x1, y1], 20);
  new Pen(ctx, 5, 0.8).line(INK.partial(pts, k), { lw: a.lw || 4, stroke: a.color || COL.ink });
}
CARDS.wire = drawWire;
const wire = (from, to, o = {}) => C('wire', Object.assign({ x: 0, y: 0, from, to, in: 'none' }, o));
defProp('napkin', (p) => {
  p.shape([[-50, 30], [0, -60], [50, 30]], { fill: COL.red, lw: 4, smooth: false });
  p.seg(0, -60, 0, 30, { lw: 2.5, stroke: COL.redDark });
});
// map helpers: a map element at (mx, my) scale ms -> screen point for lon/lat
const mapPt = (lon, lat, mx, my, ms) => { const [x, y] = mapXY(lon, lat); return [mx + x * ms, my + y * ms]; };
defProp('target', (p) => {
  p.circle(0, 0, 120, { fill: COL.red, lw: 5 }); p.circle(0, 0, 86, { fill: '#fff', lw: 4 });
  p.circle(0, 0, 54, { fill: COL.red, lw: 4 }); p.circle(0, 0, 22, { fill: '#fff', lw: 4 });
});
defProp('eye', (p) => {
  p.shape(INK.quad([-140, 0], [0, -110], [140, 0]).concat(INK.quad([140, 0], [0, 110], [-140, 0]).slice(1)), { fill: '#fff', lw: 6 });
  p.circle(0, 0, 52, { fill: '#5a8fd0', lw: 5 }); p.circle(0, 0, 24, { fill: COL.ink, stroke: null }); p.circle(14, -14, 9, { fill: '#fff', stroke: null });
});
defProp('rocket', (p) => {
  p.shape([[0, -140], [44, -60], [44, 70], [-44, 70], [-44, -60]], { fill: '#e9edf1', lw: 5 });
  p.circle(0, -30, 20, { fill: COL.blueLight, lw: 4 });
  p.shape([[-44, 20], [-84, 90], [-44, 70]], { fill: COL.red, lw: 4, smooth: false }); p.shape([[44, 20], [84, 90], [44, 70]], { fill: COL.red, lw: 4, smooth: false });
});
defProp('quote', (p, a) => {
  p.text('“', -0, 0, { font: '700 260px Merriweather', fill: a.color || COL.orange });
});
defProp('ghost', (p, a) => {
  const pts = [[-110, 130], [-120, -20], [-90, -110], [0, -150], [90, -110], [120, -20], [110, 130], [75, 100], [40, 135], [0, 100], [-40, 135], [-75, 100]];
  p.shape(pts, { fill: 'rgba(255,255,255,0.92)', lw: 6 });
  p.ellipse(-38, -40, 16, 24, { fill: COL.ink, stroke: null }); p.ellipse(38, -40, 16, 24, { fill: COL.ink, stroke: null });
  p.ellipse(0, 20, 18, 22, { fill: COL.ink, stroke: null });
  if (a.label) p.text(a.label, 0, 80, { font: '700 30px Kalam', fill: COL.grey });
});
defProp('oldPC', (p) => {
  p.rect(-130, -120, 260, 200, { fill: '#e9e2cf', lw: 5, r: 14 });
  p.rect(-104, -96, 208, 150, { fill: '#2a4a3a', lw: 4, r: 10 });
  p.text('www', 0, -22, { font: '700 46px Kalam', fill: '#7cff9a' });
  p.rect(-90, 80, 180, 30, { fill: '#e9e2cf', lw: 4 });
  p.rect(-160, 110, 320, 50, { fill: '#e9e2cf', lw: 5, r: 8 });
  for (let i = 0; i < 6; i++) p.rect(-140 + i * 48, 122, 36, 14, { fill: '#cfc6ad', lw: 2 });
});
defProp('rsvp', (p, a) => {
  p.rect(-110, -150, 220, 300, { fill: '#fffaf0', lw: 5, r: 8 });
  p.text('RSVP', 0, -105, { font: '700 46px Kalam', fill: COL.purple });
  for (let i = 0; i < 3; i++) { p.rect(-80, -50 + i * 60, 32, 32, { fill: '#fff', lw: 3 }); p.seg(-30, -34 + i * 60, 80, -34 + i * 60, { lw: 3, stroke: '#9aa3ad' }); }
  if (a.q) p.text('?', 60, 110, { font: '700 70px Kalam', fill: COL.red });
});
defProp('heart', (p, a) => {
  const pts = [];
  for (let i = 0; i < 40; i++) { const t = (i / 40) * Math.PI * 2; pts.push([16 * Math.pow(Math.sin(t), 3) * 7, -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 7]); }
  p.shape(pts, { fill: a.color || COL.red, lw: 6 });
});
defProp('casinoTable', (p) => {
  p.ellipse(0, 0, 260, 70, { fill: '#2e7d4f', lw: 6 });
  p.ellipse(0, 0, 220, 54, { fill: null, stroke: '#f2e7b1', lw: 3 });
  p.rect(-200, 60, 30, 90, { fill: '#7a4a2a', lw: 4 }); p.rect(170, 60, 30, 90, { fill: '#7a4a2a', lw: 4 });
  for (const [x, c] of [[-120, COL.red], [-80, COL.blue], [110, '#222']]) { p.ellipse(x, -6, 22, 8, { fill: c, lw: 3 }); p.ellipse(x, -14, 22, 8, { fill: c, lw: 3 }); }
});

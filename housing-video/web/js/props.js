'use strict';
// Hand-drawn prop library. Each prop draws around (0,0), roughly within a 200px box at s=1.
const PROPS = {};
const ink = (w, seed) => ({ w: w || 5, seed: seed || 1 });

PROPS.house = (ctx, o) => {
  const v = o.v || 'basic', sd = o.seed || 3;
  const wall = o.wall || COL.tan, roof = o.roof || COL.roof, win = COL.lblue;
  const window = (x, y, w, h, s) => { rect(ctx, x, y, w, h, { fill: win, w: 4, seed: s }); line(ctx, x + w / 2, y, x + w / 2, y + h, { w: 3, seed: s + 1 }); line(ctx, x, y + h / 2, x + w, y + h / 2, { w: 3, seed: s + 2 }); };
  if (v === 'basic' || v === 'small') {
    rect(ctx, 52, -112, 22, 50, { fill: '#9a5b3c', w: 4.5, seed: sd + 9 });
    rect(ctx, -80, -20, 160, 120, { fill: wall, w: 5, seed: sd });
    poly(ctx, [[-102, -16], [0, -104], [102, -16]], { fill: roof, w: 5, seed: sd + 1 });
    rect(ctx, -20, 28, 40, 72, { fill: '#7a4a2a', w: 4.5, seed: sd + 2 }); dot(ctx, 12, 66, 3.5);
    window(-66, 10, 34, 34, sd + 3); window(32, 10, 34, 34, sd + 6);
  } else if (v === 'big') {
    circ(ctx, -150, 85, 32, 24, { fill: COL.green, w: 4, seed: sd + 20 }); circ(ctx, 152, 85, 30, 22, { fill: COL.green, w: 4, seed: sd + 21 });
    rect(ctx, -130, -60, 260, 160, { fill: wall, w: 5, seed: sd });
    poly(ctx, [[-150, -56], [-40, -140], [70, -56]], { fill: roof, w: 5, seed: sd + 1 });
    poly(ctx, [[40, -56], [100, -110], [152, -56]], { fill: roof, w: 5, seed: sd + 4 });
    rect(ctx, -18, 30, 42, 70, { fill: '#7a4a2a', w: 4.5, seed: sd + 2 });
    for (const [x, y] of [[-110, -40], [-62, -40], [60, -40], [100, -40], [-110, 30], [-62, 30], [70, 30]]) window(x, y, 32, 34, sd + x);
  } else if (v === 'mansion') {
    rect(ctx, -190, -30, 90, 130, { fill: wall, w: 5, seed: sd + 7 }); rect(ctx, 100, -30, 90, 130, { fill: wall, w: 5, seed: sd + 8 });
    poly(ctx, [[-200, -26], [-145, -80], [-90, -26]], { fill: roof, w: 5, seed: sd + 9 }); poly(ctx, [[90, -26], [145, -80], [200, -26]], { fill: roof, w: 5, seed: sd + 10 });
    rect(ctx, -100, -90, 200, 190, { fill: '#efe3c8', w: 5, seed: sd });
    poly(ctx, [[-115, -86], [0, -160], [115, -86]], { fill: roof, w: 5, seed: sd + 1 });
    for (const x of [-80, -40, 40, 80]) rect(ctx, x - 7, -60, 14, 160, { fill: '#fff', w: 3.5, seed: sd + x });
    rect(ctx, -18, 34, 36, 66, { fill: '#7a4a2a', w: 4, seed: sd + 2 });
    for (const [x, y] of [[-170, 0], [-130, 0], [120, 0], [160, 0]]) window(x - 12, y, 24, 30, sd + x);
  } else if (v === 'condo') {
    rect(ctx, -90, -120, 180, 220, { fill: o.wall || '#d9b38c', w: 5, seed: sd });
    poly(ctx, [[-100, -118], [100, -118], [90, -140], [-90, -140]], { fill: o.roof || '#7b5c4a', w: 5, seed: sd + 1 });
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) window(-70 + c * 52, -100 + r * 58, 36, 38, sd + r * 3 + c);
    rect(ctx, -18, 50, 36, 50, { fill: '#7a4a2a', w: 4, seed: sd + 2 });
  }
  if (o.sale || o.sold) PROPS.sign(ctx, { ox: 125, oy: 40, os: 0.7, sold: o.sold });
};
PROPS.building = (ctx, o) => {
  const sd = o.seed || 4, h = o.h || 260, w = o.w || 110, c = o.c || '#7d858c';
  rect(ctx, -w / 2, -h + 100, w, h, { fill: c, w: 5, seed: sd });
  const cols = Math.max(2, Math.round(w / 40)), rows = Math.round(h / 46);
  for (let r = 0; r < rows - 1; r++) for (let k = 0; k < cols; k++) {
    const x = -w / 2 + 12 + k * ((w - 24) / cols), y = -h + 116 + r * 46;
    rect(ctx, x, y, (w - 24) / cols - 10, 26, { fill: (r + k) % 3 ? '#e9f2f7' : '#f6e7a8', w: 3, seed: sd + r * 7 + k });
  }
};
PROPS.apartment = (ctx, o) => {
  PROPS.building(ctx, { h: 300, w: 170, c: o.c || '#b9705a', seed: o.seed || 8 });
  if (o.label) { rect(ctx, -95, -170, 190, 44, { fill: '#fff8d6', w: 4, seed: 3 }); txt(ctx, o.label, 0, -148, { size: 26, font: 'hand' }); }
};
PROPS.sign = (ctx, o) => {
  ctx.save(); if (o.ox) ctx.translate(o.ox, o.oy); if (o.os) ctx.scale(o.os, o.os);
  line(ctx, -40, -10, -40, 90, { w: 7, c: '#6b4226' }); line(ctx, 40, -10, 40, 90, { w: 7, c: '#6b4226', seed: 3 });
  rect(ctx, -80, -60, 160, 70, { fill: o.sold ? '#2f6fb5' : COL.red, w: 5, seed: 5 });
  txt(ctx, o.text || (o.sold ? 'SOLD!' : 'FOR SALE'), 0, -24, { size: o.sold ? 44 : 34, font: 'marker', c: '#fff' });
  ctx.restore();
};
PROPS.dollar = (ctx, o) => {
  txt(ctx, '$', 0, 0, { size: o.size || 170, font: 'marker', c: o.c || COL.green, stroke: COL.ink, sw: 14 });
  txt(ctx, '$', 0, 0, { size: o.size || 170, font: 'marker', c: o.c || COL.green });
};
PROPS.bill = (ctx, o) => {
  ctx.save(); ctx.rotate((o.r || 0) * D2R);
  rect(ctx, -80, -40, 160, 80, { fill: '#9ccc84', w: 4.5, seed: o.seed || 2 });
  rect(ctx, -68, -29, 136, 58, { fill: 'rgba(0,0,0,0)', w: 2.5, c: COL.dgreen, seed: 3 });
  circ(ctx, 0, 0, 22, null, { fill: '#c9e6b7', w: 3, c: COL.dgreen, seed: 4 });
  txt(ctx, '$', 0, 2, { size: 34, font: 'marker', c: COL.dgreen });
  ctx.restore();
};
PROPS.cash = (ctx, o) => {
  const n = o.n || 4;
  for (let i = 0; i < n; i++) { ctx.save(); ctx.translate((i % 2) * 12 - 6, -i * 14); PROPS.bill(ctx, { r: (i % 3 - 1) * 4, seed: i + 1 }); ctx.restore(); }
};
PROPS.moneyBag = (ctx, o) => {
  shape(ctx, [[-30, -70], [30, -70], [18, -45], [70, 0], [72, 60], [40, 90], [-40, 90], [-72, 60], [-70, 0], [-18, -45]], { fill: '#d8b26a', w: 5, seed: 3 });
  rline(ctx, [[-24, -46], [24, -46]], { w: 6, c: '#8a5a2b' });
  txt(ctx, '$', 0, 28, { size: 80, font: 'marker', c: COL.dgreen });
};
PROPS.coin = (ctx, o) => { circ(ctx, 0, 0, o.r || 50, null, { fill: '#f2c14e', w: 5, seed: 3 }); circ(ctx, 0, 0, (o.r || 50) * 0.72, null, { w: 3, c: '#b8860b', seed: 4 }); txt(ctx, '$', 0, 3, { size: (o.r || 50) * 1.1, font: 'marker', c: '#9a6b00' }); };
PROPS.pct = (ctx, o) => {
  circ(ctx, 0, 0, o.r || 70, null, { fill: COL.orange, w: 5, seed: 6 });
  circ(ctx, 0, 0, (o.r || 70) * 0.8, null, { w: 3.5, c: '#fff3', seed: 7 });
  txt(ctx, o.label || '%', 0, 4, { size: (o.r || 70) * (o.label ? 0.62 : 1.25), font: 'marker', c: '#fff', stroke: '#b4521c', sw: 6 });
};
PROPS.lock = (ctx, o) => {
  const open = o.open;
  rline(ctx, [[-34, -20], [-34, -62], [0, -92], [34, -62], [34, open ? -80 : -20]], { w: 13, c: '#555b61', seed: 2 });
  rect(ctx, -58, -24, 116, 100, { fill: '#2f3439', w: 5, seed: 3 });
  dot(ctx, 0, 14, 11, '#cfd4d8'); rect(ctx, -4, 14, 8, 28, { fill: '#cfd4d8', noStroke: 1, amp: 0 });
};
PROPS.key = (ctx, o) => {
  circ(ctx, -50, 0, 28, null, { fill: '#f2c14e', w: 5, seed: 2 }); circ(ctx, -50, 0, 10, null, { fill: '#fff', w: 4, seed: 3 });
  poly(ctx, [[-24, -8], [70, -8], [70, 8], [-24, 8]], { fill: '#f2c14e', w: 5, seed: 4 });
  poly(ctx, [[40, 8], [40, 28], [52, 28], [52, 8]], { fill: '#f2c14e', w: 4, seed: 5 }); poly(ctx, [[58, 8], [58, 22], [68, 22], [68, 8]], { fill: '#f2c14e', w: 4, seed: 6 });
};
PROPS.ice = (ctx, o) => {
  ctx.save(); ctx.globalAlpha *= 0.85;
  poly(ctx, [[-80, -70], [70, -86], [86, 70], [-70, 84]], { fill: '#bfe9f7', w: 4.5, c: '#5aa9c9', seed: 2 });
  ctx.restore();
  ctx.save(); ctx.globalAlpha *= 0.8; PROPS.dollar(ctx, { size: 110 }); ctx.restore();
  rline(ctx, [[-60, -55], [-30, -62]], { w: 6, c: '#fff', seed: 3 }); rline(ctx, [[-64, -38], [-58, -10]], { w: 6, c: '#fff', seed: 4 });
};
PROPS.doc = (ctx, o) => {
  const t = o.title || 'MORTGAGE';
  poly(ctx, [[-70, -95], [60, -95], [80, -75], [80, 95], [-70, 95]], { fill: '#fbf6e6', w: 5, seed: 2 });
  txt(ctx, t, 4, -66, { size: t.length > 9 ? 22 : 28, font: 'marker', c: o.c || COL.red });
  for (let i = 0; i < 5; i++) rline(ctx, [[-52, -30 + i * 20], [-10 + (i % 2) * 20, -32 + i * 20], [58 - (i % 3) * 10, -30 + i * 20]], { w: 3, c: '#555', seed: 10 + i });
  rline(ctx, [[-50, 72], [-30, 58], [-20, 76], [0, 60], [12, 74], [40, 64]], { w: 3.5, c: '#22409a', seed: 20 });
};
PROPS.bank = (ctx, o) => {
  poly(ctx, [[-140, -80], [0, -150], [140, -80]], { fill: '#c9ccd0', w: 5, seed: 2 });
  if (o.label) txt(ctx, o.label, 0, -100, { size: 34, font: 'marker', c: COL.ink });
  rect(ctx, -130, -80, 260, 20, { fill: '#b7bbc0', w: 4.5, seed: 3 });
  for (const x of [-100, -50, 0, 50, 100]) rect(ctx, x - 13, -60, 26, 130, { fill: '#e6e8ea', w: 4, seed: x + 9 });
  rect(ctx, -150, 70, 300, 26, { fill: '#b7bbc0', w: 4.5, seed: 4 });
};
PROPS.calendar = (ctx, o) => {
  rect(ctx, -80, -80, 160, 170, { fill: '#fff', w: 5, seed: 2 });
  rect(ctx, -80, -80, 160, 46, { fill: COL.red, w: 5, seed: 3 });
  txt(ctx, o.month || 'SEP', 0, -56, { size: 34, font: 'marker', c: '#fff' });
  txt(ctx, o.day || '16', 0, 30, { size: 84, font: 'marker', c: COL.ink });
  for (const x of [-40, 40]) rline(ctx, [[x, -98], [x, -66]], { w: 8, c: '#555' });
};
PROPS.clock = (ctx, o, lt) => {
  circ(ctx, 0, 0, 80, null, { fill: '#fff', w: 6, seed: 2 });
  for (let i = 0; i < 12; i++) { const a = i * 30 * D2R; line(ctx, Math.cos(a) * 62, Math.sin(a) * 62, Math.cos(a) * 70, Math.sin(a) * 70, { w: 4, amp: 0 }); }
  const a1 = ((lt || 0) * (o.speed || 120) - 90) * D2R, a2 = ((lt || 0) * (o.speed || 120) / 12 + 30) * D2R;
  line(ctx, 0, 0, Math.cos(a1) * 58, Math.sin(a1) * 58, { w: 5, amp: 0 }); line(ctx, 0, 0, Math.cos(a2) * 38, Math.sin(a2) * 38, { w: 7, amp: 0 }); dot(ctx, 0, 0, 7);
};
PROPS.hourglass = (ctx, o, lt) => {
  const k = clamp(((lt || 0) % 4) / 4);
  rect(ctx, -60, -100, 120, 16, { fill: '#8b5a2b', w: 4 }); rect(ctx, -60, 84, 120, 16, { fill: '#8b5a2b', w: 4, seed: 3 });
  poly(ctx, [[-45, -84], [45, -84], [6, 0], [45, 84], [-45, 84], [-6, 0]], { fill: '#eaf6fb', w: 4.5, seed: 2 });
  poly(ctx, [[-38 * (1 - k), -76 + 70 * k], [38 * (1 - k), -76 + 70 * k], [4, -4], [-4, -4]], { fill: '#e8c069', noStroke: 1, amp: 0 });
  poly(ctx, [[-40, 80], [40, 80], [30 * k + 4, 80 - 60 * k], [-30 * k - 4, 80 - 60 * k]], { fill: '#e8c069', noStroke: 1, amp: 0 });
};
// zigzag trend arrow. o: {dir:'up'|'down', c, reveal(auto with lt), w, h}
PROPS.zig = (ctx, o, lt) => {
  const w = o.w || 520, h = o.h || 300, up = o.dir !== 'down';
  const pts = [[-w / 2, up ? h / 2 : -h / 2]];
  const n = 5;
  for (let i = 1; i <= n; i++) {
    const x = -w / 2 + (w * i) / n, base = up ? h / 2 - (h * i) / n : -h / 2 + (h * i) / n;
    pts.push([x - w / n * 0.35, base + (up ? 1 : -1) * h * 0.18]);
    pts.push([x, base]);
  }
  const rv = o.reveal != null ? o.reveal : E.out(P(lt || 0, 0, o.dt || 0.9));
  const c = o.c || (up ? COL.green : COL.red);
  rline(ctx, pts, { w: o.lw || 16, c, seed: 4, amp: 0, reveal: rv });
  if (rv > 0.97) {
    const a = pts[pts.length - 1], b = pts[pts.length - 2];
    const ang = Math.atan2(a[1] - b[1], a[0] - b[0]);
    const L = 50;
    rline(ctx, [[a[0] - Math.cos(ang - 0.5) * L, a[1] - Math.sin(ang - 0.5) * L], a, [a[0] - Math.cos(ang + 0.5) * L, a[1] - Math.sin(ang + 0.5) * L]], { w: o.lw || 16, c, amp: 0 });
  }
};
// arrow from (x1,y1) to (x2,y2) in prop-local coords, drawn on
PROPS.arrow = (ctx, o, lt) => {
  const rv = o.reveal != null ? o.reveal : E.out(P(lt || 0, 0, 0.4));
  const pts = o.pts || [[-100, 0], [100, 0]];
  const c = o.c || COL.red, w = o.lw || 10;
  rline(ctx, pts, { w, c, seed: 5, amp: o.amp != null ? o.amp : 1.5, reveal: rv });
  if (rv > 0.95) {
    const a = pts[pts.length - 1], b = pts[pts.length - 2];
    const ang = Math.atan2(a[1] - b[1], a[0] - b[0]), L = o.head || 34;
    rline(ctx, [[a[0] - Math.cos(ang - 0.55) * L, a[1] - Math.sin(ang - 0.55) * L], a, [a[0] - Math.cos(ang + 0.55) * L, a[1] - Math.sin(ang + 0.55) * L]], { w, c, amp: 0 });
  }
};
PROPS.board = (ctx, o, lt) => {
  const w = o.w || 620, h = o.h || 380;
  rect(ctx, -w / 2 - 22, -h / 2 - 22, w + 44, h + 44, { fill: COL.frame, w: 5, seed: 2 });
  rect(ctx, -w / 2, -h / 2, w, h, { fill: COL.chalk, w: 4, seed: 3 });
  if (o.text) txt(ctx, o.text, 0, o.ty || 0, { size: o.size || 78, font: 'chalk', c: '#f4f4ee', reveal: o.write === false ? 1 : E.lin(P(lt || 0, o.wt || 0.15, o.wd || 0.7)), lh: 1.1 });
};
PROPS.bubble = (ctx, o, lt) => {
  const w = o.w || 300, h = o.h || 170, think = o.think;
  const tail = o.tail || 'bl';
  const tx = tail.includes('l') ? -w * 0.28 : w * 0.28, ty = tail.includes('t') ? -h / 2 - 50 : h / 2 + 50;
  if (think) {
    circ(ctx, tx * 0.9, ty * 0.92, 12, null, { fill: '#fff', w: 4, seed: 7 }); circ(ctx, tx * 0.7, ty * 0.75, 18, null, { fill: '#fff', w: 4, seed: 8 });
    const r = mulberry(4); const pts = [];
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; pts.push([Math.cos(a) * w / 2, Math.sin(a) * h / 2]); }
    for (const p of pts) circ(ctx, p[0] * 0.86, p[1] * 0.8, 44 + r() * 10, 36, { fill: '#fff', w: 4.5, seed: 9 + p[0] });
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
  } else {
    ctx.save();
    ctx.beginPath(); ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, 7);
    ctx.moveTo(tx - 26, ty * 0.6); ctx.lineTo(tx, ty); ctx.lineTo(tx + 22, ty * 0.6);
    ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
    circ(ctx, 0, 0, w / 2, h / 2, { w: 5, seed: 5, noStroke: false, fill: '#fff' });
    shape(ctx, [[tx - 24, ty * 0.62], [tx, ty], [tx + 24, ty * 0.66]], { fill: '#fff', w: 5, seed: 6, amp: 0.5, noStroke: true });
    rline(ctx, [[tx - 26, ty * 0.6], [tx, ty], [tx + 24, ty * 0.64]], { w: 5, seed: 6, amp: 0 });
  }
  if (o.text) txt(ctx, o.text, 0, 0, { size: o.size || 52, font: o.font || 'hand', c: o.c || COL.ink, lh: 1.05, reveal: o.write ? E.lin(P(lt || 0, 0.1, 0.5)) : 1 });
};
PROPS.crib = (ctx, o) => {
  rect(ctx, -130, -60, 260, 120, { fill: '#fdf3e1', w: 5, seed: 2 });
  for (let i = -105; i <= 105; i += 30) line(ctx, i, -60, i, 60, { w: 4, seed: i + 30 });
  line(ctx, -140, -70, -140, 100, { w: 7, seed: 3 }); line(ctx, 140, -70, 140, 100, { w: 7, seed: 4 });
  if (o.baby !== false) { circ(ctx, -40, -66, 30, null, { fill: COL.skin, w: 4.5, seed: 5 }); dot(ctx, -50, -70, 3.5); dot(ctx, -30, -70, 3.5); rline(ctx, [[-48, -55], [-40, -50], [-32, -55]], { w: 3 }); }
};
PROPS.radiator = (ctx, o) => {
  for (let i = 0; i < 7; i++) rect(ctx, -105 + i * 30, -70, 26, 140, { fill: '#d8d2c4', w: 4, seed: i + 3 });
  line(ctx, -110, 60, 110, 60, { w: 6, seed: 2 });
  for (let i = 0; i < 3; i++) rline(ctx, [[-60 + i * 50, -90], [-70 + i * 50, -110], [-56 + i * 50, -128], [-66 + i * 50, -146]], { w: 4, c: '#e07a5f', seed: i + 9 });
};
PROPS.hammer = (ctx) => { line(ctx, -10, 90, 10, -40, { w: 16, c: '#8b5a2b' }); poly(ctx, [[-50, -70], [60, -60], [58, -30], [-48, -38]], { fill: '#6c757d', w: 5 }); };
PROPS.roller = (ctx) => { rect(ctx, -70, -80, 140, 50, { fill: '#5aa9e6', w: 5 }); rline(ctx, [[70, -55], [90, -55], [90, -10], [0, 0], [0, 30]], { w: 6 }); rect(ctx, -10, 30, 20, 70, { fill: '#8b5a2b', w: 4.5 }); };
PROPS.box = (ctx, o) => {
  poly(ctx, [[-90, -40], [90, -40], [90, 80], [-90, 80]], { fill: '#c99a5b', w: 5, seed: 2 });
  poly(ctx, [[-90, -40], [-60, -80], [120, -80], [90, -40]], { fill: '#dcb071', w: 5, seed: 3 }); poly(ctx, [[90, -40], [120, -80], [120, 40], [90, 80]], { fill: '#b8844a', w: 5, seed: 4 });
  rect(ctx, -12, -40, 24, 120, { fill: '#e8d3a8', w: 3, seed: 5 });
  if (o.label) txt(ctx, o.label, 0, 30, { size: 30, font: 'marker', c: '#6b3d12' });
};
PROPS.truck = (ctx, o) => {
  rect(ctx, -170, -100, 230, 150, { fill: '#f2f2f2', w: 5, seed: 2 });
  if (o.label) txt(ctx, o.label, -55, -25, { size: 34, font: 'marker', c: COL.blue });
  poly(ctx, [[60, -50], [130, -50], [170, 0], [170, 50], [60, 50]], { fill: COL.orange, w: 5, seed: 3 });
  poly(ctx, [[80, -38], [124, -38], [150, -4], [80, -4]], { fill: COL.lblue, w: 4, seed: 4 });
  for (const x of [-120, 120]) { circ(ctx, x, 58, 28, null, { fill: '#333', w: 5, seed: x }); circ(ctx, x, 58, 10, null, { fill: '#bbb', w: 3, seed: x + 1 }); }
};
PROPS.ship = (ctx) => {
  poly(ctx, [[-240, 0], [240, 0], [200, 70], [-210, 70]], { fill: '#2b2b2b', w: 5, seed: 2 });
  rect(ctx, -200, -40, 380, 40, { fill: '#f4f4f4', w: 5, seed: 3 });
  for (let i = 0; i < 4; i++) { rect(ctx, -140 + i * 80, -120, 40, 80, { fill: '#e4a23a', w: 5, seed: i + 4 }); rect(ctx, -140 + i * 80, -120, 40, 22, { fill: '#2b2b2b', w: 4, seed: i + 9 }); }
  for (let i = 0; i < 12; i++) dot(ctx, -180 + i * 30, -20, 5, '#2b2b2b');
};
PROPS.iceberg = (ctx) => { poly(ctx, [[-120, 60], [-60, -40], [-20, -10], [20, -90], [70, -20], [120, 60]], { fill: '#e8f7fd', w: 5, c: '#4b8fb3', seed: 2 }); };
PROPS.grave = (ctx, o) => {
  shape(ctx, [[-70, 100], [-70, -40], [-50, -90], [0, -108], [50, -90], [70, -40], [70, 100]], { fill: '#b8bcc0', w: 5, seed: 2 });
  txt(ctx, o.text || 'RIP', 0, -30, { size: 46, font: 'marker', c: '#555' });
  rline(ctx, [[-110, 100], [110, 100]], { w: 6, c: COL.green, seed: 3 });
};
PROPS.gift = (ctx) => {
  rect(ctx, -80, -30, 160, 110, { fill: '#e85d75', w: 5, seed: 2 }); rect(ctx, -90, -60, 180, 34, { fill: '#e85d75', w: 5, seed: 3 });
  rect(ctx, -12, -60, 24, 140, { fill: COL.yellow, w: 4, seed: 4 });
  circ(ctx, -26, -76, 22, 14, { fill: COL.yellow, w: 4, seed: 5 }); circ(ctx, 26, -76, 22, 14, { fill: COL.yellow, w: 4, seed: 6 });
};
PROPS.shield = (ctx, o) => {
  shape(ctx, [[-80, -90], [0, -110], [80, -90], [76, 10], [0, 100], [-76, 10]], { fill: o.c || '#4f86c6', w: 5, seed: 2 });
  if (o.text) txt(ctx, o.text, 0, -10, { size: o.size || 40, font: 'marker', c: '#fff' });
};
PROPS.umbrella = (ctx) => {
  shape(ctx, [[-130, 0], [-110, -60], [-50, -100], [0, -110], [50, -100], [110, -60], [130, 0], [87, -10], [43, 0], [0, -10], [-43, 0], [-87, -10]], { fill: COL.red, w: 5, seed: 2 });
  rline(ctx, [[0, -10], [0, 110], [-10, 128], [-28, 122]], { w: 7, seed: 3 });
};
PROPS.hurricane = (ctx, o, lt) => {
  ctx.save(); ctx.rotate(-(lt || 0) * 2.5);
  for (let k = 0; k < 3; k++) {
    const pts = []; for (let i = 0; i < 40; i++) { const a = i * 0.22 + k * 2.09, r = 10 + i * 2.6; pts.push([Math.cos(a) * r, Math.sin(a) * r]); }
    rline(ctx, pts, { w: 9, c: '#5b7c99', seed: k, amp: 0 });
  }
  ctx.restore();
};
PROPS.palm = (ctx) => {
  rline(ctx, [[0, 120], [8, 40], [20, -40], [30, -100]], { w: 16, c: '#8b5a2b', seed: 2 });
  for (const a of [-160, -120, -60, -20, 20]) { const r = a * D2R; shape(ctx, [[30, -100], [30 + Math.cos(r) * 60, -100 + Math.sin(r) * 60 - 18], [30 + Math.cos(r) * 110, -100 + Math.sin(r) * 110 + 10], [30 + Math.cos(r) * 60, -100 + Math.sin(r) * 60 + 8]], { fill: COL.green, w: 4, seed: a }); }
};
PROPS.sun = (ctx, o, lt) => { ctx.save(); ctx.rotate((lt || 0) * 0.4); for (let i = 0; i < 10; i++) { const a = i * 36 * D2R; line(ctx, Math.cos(a) * 70, Math.sin(a) * 70, Math.cos(a) * 100, Math.sin(a) * 100, { w: 7, c: '#f2a73b', seed: i }); } ctx.restore(); circ(ctx, 0, 0, 58, null, { fill: '#ffd24a', w: 5, c: '#e08e1b', seed: 3 }); };
PROPS.capitol = (ctx) => {
  rect(ctx, -220, 20, 440, 80, { fill: '#f2f0ea', w: 5, seed: 2 });
  for (let i = -200; i <= 200; i += 40) rect(ctx, i - 6, 30, 12, 60, { fill: '#fff', w: 3, seed: i });
  rect(ctx, -90, -30, 180, 52, { fill: '#f2f0ea', w: 5, seed: 3 });
  shape(ctx, [[-80, -30], [-70, -100], [-30, -138], [0, -146], [30, -138], [70, -100], [80, -30]], { fill: '#f7f6f1', w: 5, seed: 4 });
  rect(ctx, -10, -176, 20, 34, { fill: '#f7f6f1', w: 4, seed: 5 }); dot(ctx, 0, -182, 6);
  rline(ctx, [[-240, 102], [240, 102]], { w: 6, seed: 6 });
};
PROPS.gavel = (ctx) => { line(ctx, -40, 80, 50, -20, { w: 14, c: '#8b5a2b' }); ctx.save(); ctx.translate(60, -40); ctx.rotate(-48 * D2R); rect(ctx, -60, -26, 120, 52, { fill: '#6b4226', w: 5 }); ctx.restore(); rect(ctx, -110, 90, 120, 20, { fill: '#6b4226', w: 4 }); };
PROPS.bill_scroll = (ctx, o) => {
  poly(ctx, [[-80, -100], [80, -100], [80, 100], [-80, 100]], { fill: '#fbf6e6', w: 5, seed: 2 });
  txt(ctx, o.title || 'H.R.', 0, -68, { size: 34, font: 'marker', c: COL.blue });
  for (let i = 0; i < 6; i++) rline(ctx, [[-56, -30 + i * 20], [56 - (i % 3) * 12, -30 + i * 20]], { w: 3, c: '#666', seed: i });
};
PROPS.hatch = (ctx) => {
  poly(ctx, [[-120, 20], [120, 20], [150, 80], [-150, 80]], { fill: '#2b2b2b', w: 5, seed: 2 });
  poly(ctx, [[-120, 20], [120, 20], [110, -110], [-130, -90]], { fill: '#9aa3ab', w: 5, seed: 3 });
  for (let i = 0; i < 3; i++) line(ctx, -40 + i * 40, 30, -40 + i * 40, 70, { w: 5, c: '#c9a56a', seed: i });
  txt(ctx, 'EXIT', -10, -40, { size: 48, font: 'marker', c: COL.green });
};
PROPS.cage = (ctx, o) => {
  if (o.inner) { ctx.save(); ctx.translate(0, 30); ctx.scale(0.6, 0.6); PROPS[o.inner](ctx, {}); ctx.restore(); }
  for (let x = -120; x <= 120; x += 30) line(ctx, x, -120, x, 130, { w: 6, seed: x + 200, c: '#3b3f45' });
  shape(ctx, [[-130, -118], [-90, -170], [0, -190], [90, -170], [130, -118]], { w: 7, c: '#3b3f45', seed: 3 });
  rect(ctx, -140, 120, 280, 26, { fill: '#555b61', w: 5, seed: 4 });
};
PROPS.ladder = (ctx, o) => {
  const h = o.h || 520;
  line(ctx, -70, -h / 2, -80, h / 2, { w: 9, c: '#8b5a2b', seed: 2 }); line(ctx, 70, -h / 2, 80, h / 2, { w: 9, c: '#8b5a2b', seed: 3 });
  for (let y = -h / 2 + 40; y < h / 2; y += 70) line(ctx, -74, y, 74, y, { w: 7, c: '#a8743f', seed: y });
};
PROPS.chair = (ctx, o) => {
  const c = o.c || '#c0392b';
  rect(ctx, -50, -120, 100, 90, { fill: c, w: 5, seed: 2 }); rect(ctx, -60, -32, 120, 26, { fill: c, w: 5, seed: 3 });
  line(ctx, -50, -6, -54, 70, { w: 7, seed: 4 }); line(ctx, 50, -6, 54, 70, { w: 7, seed: 5 });
};
PROPS.note = (ctx) => { txt(ctx, '♪', 0, 0, { size: 110, font: 'sans', c: COL.ink }); };
PROPS.bed = (ctx) => {
  rect(ctx, -140, -10, 280, 60, { fill: '#5b7fb5', w: 5, seed: 2 }); rect(ctx, -150, -70, 22, 150, { fill: '#8b5a2b', w: 5, seed: 3 });
  rect(ctx, 128, -30, 22, 110, { fill: '#8b5a2b', w: 5, seed: 4 }); circ(ctx, -95, -28, 36, 18, { fill: '#fff', w: 4, seed: 5 });
};
PROPS.hospital = (ctx) => {
  rect(ctx, -140, -120, 280, 220, { fill: '#eef2f5', w: 5, seed: 2 });
  rect(ctx, -30, -200, 60, 80, { fill: '#fff', w: 5, seed: 3 }); rect(ctx, -10, -190, 20, 60, { fill: COL.red, noStroke: 1, amp: 0 }); rect(ctx, -25, -170, 50, 20, { fill: COL.red, noStroke: 1, amp: 0 });
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) rect(ctx, -115 + c * 62, -100 + r * 55, 40, 32, { fill: COL.lblue, w: 3.5, seed: r * 4 + c });
  rect(ctx, -26, 50, 52, 50, { fill: '#9ad1e8', w: 4, seed: 9 });
};
PROPS.briefcase = (ctx) => { rect(ctx, -90, -50, 180, 120, { fill: '#6b4226', w: 5, seed: 2 }); rline(ctx, [[-30, -50], [-28, -80], [28, -80], [30, -50]], { w: 6, seed: 3 }); line(ctx, -90, 0, 90, 0, { w: 4, seed: 4 }); };
PROPS.calc = (ctx) => {
  rect(ctx, -70, -100, 140, 200, { fill: '#4a4f55', w: 5, seed: 2 }); rect(ctx, -54, -84, 108, 44, { fill: '#cfe8c4', w: 3.5, seed: 3 });
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) rect(ctx, -52 + c * 36, -26 + r * 30, 28, 22, { fill: '#e9ecef', w: 2.5, seed: r * 3 + c });
};
PROPS.check = (ctx) => { rline(ctx, [[-60, 0], [-15, 50], [70, -60]], { w: 22, c: COL.green, amp: 0 }); };
PROPS.cross = (ctx) => { line(ctx, -55, -55, 55, 55, { w: 22, c: COL.red, amp: 0 }); line(ctx, 55, -55, -55, 55, { w: 22, c: COL.red, amp: 0 }); };
PROPS.q = (ctx, o) => { txt(ctx, o.ch || '?', 0, 0, { size: o.size || 160, font: 'marker', c: o.c || COL.orange, stroke: COL.ink, sw: 10 }); txt(ctx, o.ch || '?', 0, 0, { size: o.size || 160, font: 'marker', c: o.c || COL.orange }); };
PROPS.heart = (ctx, o) => {
  const hp = [[0, 80], [-80, 0], [-90, -50], [-60, -82], [-20, -78], [0, -50], [20, -78], [60, -82], [90, -50], [80, 0]];
  if (!o.broken) { shape(ctx, hp, { fill: '#e0464f', w: 5, seed: 2 }); return; }
  ctx.save(); ctx.translate(-14, 0); ctx.rotate(-0.12); shape(ctx, [[0, 80], [-80, 0], [-90, -50], [-60, -82], [-20, -78], [0, -50], [-14, -20], [8, 10], [-10, 40]], { fill: '#e0464f', w: 5, seed: 2 }); ctx.restore();
  ctx.save(); ctx.translate(14, 0); ctx.rotate(0.12); shape(ctx, [[0, 80], [-10, 40], [8, 10], [-14, -20], [0, -50], [20, -78], [60, -82], [90, -50], [80, 0]], { fill: '#e0464f', w: 5, seed: 3 }); ctx.restore();
};
PROPS.ballchain = (ctx, o) => {
  for (let i = 0; i < 6; i++) circ(ctx, -150 + i * 24, -6 + Math.sin(i) * 4, 12, 8, { w: 5, c: '#555b61', seed: i });
  if (o.house) { ctx.save(); ctx.translate(40, -60); ctx.scale(0.9, 0.9); PROPS.house(ctx, {}); ctx.restore(); }
  else { circ(ctx, 30, 0, 70, null, { fill: '#2f3439', w: 5, seed: 9 }); rline(ctx, [[0, -40], [20, -52]], { w: 6, c: '#888' }); }
};
PROPS.piggy = (ctx) => {
  circ(ctx, 0, 0, 110, 80, { fill: '#f6a5c0', w: 5, seed: 2 }); circ(ctx, 105, -6, 26, 22, { fill: '#f48fb1', w: 4.5, seed: 3 });
  dot(ctx, 98, -8, 4); dot(ctx, 112, -8, 4); dot(ctx, 55, -30, 6);
  poly(ctx, [[30, -70], [50, -104], [62, -64]], { fill: '#f48fb1', w: 4 });
  for (const x of [-60, -20, 30, 60]) rect(ctx, x - 12, 60, 24, 36, { fill: '#f6a5c0', w: 4, seed: x });
  rect(ctx, -26, -84, 52, 10, { fill: '#333', noStroke: 1, amp: 0 });
};
PROPS.ticket = (ctx, o) => {
  ctx.save(); ctx.rotate(-6 * D2R);
  poly(ctx, [[-120, -70], [120, -70], [120, 70], [-120, 70]], { fill: '#fff7c2', w: 5, seed: 2 });
  txt(ctx, o.text || 'PENALTY', 0, -26, { size: 46, font: 'marker', c: COL.red });
  txt(ctx, o.sub || '', 0, 30, { size: 36, font: 'hand', c: COL.ink });
  ctx.restore();
};
PROPS.flag = (ctx) => {
  line(ctx, -120, -110, -120, 130, { w: 7, c: '#6b4226' });
  ctx.save(); ctx.beginPath(); ctx.rect(-116, -110, 220, 140); ctx.clip();
  for (let i = 0; i < 7; i++) { ctx.fillStyle = i % 2 ? '#fff' : '#c8323a'; ctx.fillRect(-116, -110 + i * 20, 220, 20); }
  ctx.fillStyle = '#2b4a8b'; ctx.fillRect(-116, -110, 90, 80);
  ctx.fillStyle = '#fff'; for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { ctx.beginPath(); ctx.arc(-104 + c * 22, -98 + r * 19, 3.5, 0, 7); ctx.fill(); }
  ctx.restore(); rect(ctx, -116, -110, 220, 140, { w: 5, seed: 3 });
};
PROPS.clipboard = (ctx, o) => {
  rect(ctx, -80, -100, 160, 210, { fill: '#b88a55', w: 5, seed: 2 }); rect(ctx, -64, -78, 128, 172, { fill: '#fff', w: 3.5, seed: 3 });
  rect(ctx, -30, -112, 60, 26, { fill: '#9aa3ab', w: 4, seed: 4 });
  if (o.title) txt(ctx, o.title, 0, -52, { size: 26, font: 'marker', c: COL.blue });
  for (let i = 0; i < 4; i++) { rect(ctx, -50, -22 + i * 28, 14, 14, { w: 3, seed: i }); rline(ctx, [[-28, -15 + i * 28], [48, -15 + i * 28]], { w: 3, c: '#777', seed: i + 9 }); }
};
PROPS.pin = (ctx, o) => {
  shape(ctx, [[0, 70], [-46, 0], [-50, -40], [-28, -72], [0, -80], [28, -72], [50, -40], [46, 0]], { fill: o.c || COL.red, w: 5, seed: 2 });
  circ(ctx, 0, -34, 18, null, { fill: '#fff', w: 4, seed: 3 });
};
PROPS.flowers = (ctx) => {
  for (const [x, c] of [[-30, '#e85d75'], [0, '#f2c14e'], [30, '#9b6dd6']]) { line(ctx, x * 0.4, 90, x, -20, { w: 5, c: COL.dgreen, seed: x }); for (let i = 0; i < 5; i++) { const a = i * 72 * D2R; circ(ctx, x + Math.cos(a) * 14, -30 + Math.sin(a) * 14, 11, null, { fill: c, w: 3, seed: i + x }); } dot(ctx, x, -30, 7, '#f6d743'); }
  poly(ctx, [[-50, 40], [50, 40], [20, 100], [-20, 100]], { fill: '#f1e3c6', w: 4.5, seed: 9 });
};
PROPS.baby = (ctx) => {
  shape(ctx, [[-60, -10], [60, -20], [70, 40], [-50, 50]], { fill: '#bfe2f2', w: 5, seed: 2 });
  circ(ctx, -50, -30, 34, null, { fill: COL.skin, w: 5, seed: 3 }); dot(ctx, -60, -34, 3.5); dot(ctx, -40, -34, 3.5); rline(ctx, [[-56, -18], [-50, -14], [-44, -18]], { w: 3 });
};
PROPS.rings = (ctx, o) => { circ(ctx, -30, 0, 50, null, { w: 12, c: '#e0b53c', seed: 2 }); circ(ctx, 35, 0, 50, null, { w: 12, c: '#e0b53c', seed: 3 }); if (o.broken) { line(ctx, -10, -80, 20, 80, { w: 10, c: COL.red, seed: 4 }); } };
PROPS.laptop = (ctx, o) => {
  rect(ctx, -110, -90, 220, 140, { fill: '#2f3439', w: 5, seed: 2 }); rect(ctx, -96, -76, 192, 112, { fill: '#eaf4fb', w: 3, seed: 3 });
  poly(ctx, [[-140, 50], [140, 50], [160, 76], [-160, 76]], { fill: '#9aa3ab', w: 5, seed: 4 });
  if (o.text) txt(ctx, o.text, 0, -22, { size: o.size || 30, font: 'hand', c: COL.ink, lh: 1.0 });
};
PROPS.phone = (ctx, o) => { rect(ctx, -26, -48, 52, 96, { fill: '#2f3439', w: 4, seed: 2 }); rect(ctx, -19, -38, 38, 72, { fill: '#cfe8ff', w: 2, seed: 3 }); };
PROPS.kitchen = (ctx) => {
  rect(ctx, -200, -20, 400, 120, { fill: '#e8dcc6', w: 5, seed: 2 }); rect(ctx, -210, -34, 420, 20, { fill: '#9aa3ab', w: 5, seed: 3 });
  for (let i = 0; i < 4; i++) { rect(ctx, -190 + i * 96, 0, 84, 90, { fill: '#f3ecdf', w: 4, seed: i + 4 }); dot(ctx, -120 + i * 96, 44, 4); }
  rect(ctx, -180, -190, 150, 110, { fill: '#e8dcc6', w: 5, seed: 9 }); rect(ctx, 40, -190, 150, 110, { fill: '#e8dcc6', w: 5, seed: 10 });
  rect(ctx, -60, -80, 70, 46, { fill: '#bbb', w: 4, seed: 11 }); rline(ctx, [[-25, -80], [-25, -110], [5, -110]], { w: 5, seed: 12 });
};
PROPS.wallMoney = (ctx) => { // money trapped inside the walls (cut-away house)
  rect(ctx, -150, -40, 300, 170, { fill: '#e9d3b0', w: 5, seed: 2 });
  poly(ctx, [[-175, -36], [0, -170], [175, -36]], { fill: COL.roof, w: 5, seed: 3 });
  ctx.save(); ctx.beginPath(); ctx.rect(-130, -20, 260, 130); ctx.clip();
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { ctx.save(); ctx.translate(-100 + c * 66, 0 + r * 34); ctx.scale(0.42, 0.42); PROPS.bill(ctx, { r: (r + c) % 2 ? 8 : -6, seed: r * 4 + c }); ctx.restore(); }
  ctx.restore();
  for (let x = -130; x <= 130; x += 40) line(ctx, x, -20, x, 110, { w: 5, c: '#555b61', seed: x });
};
PROPS.welcome = (ctx, o) => {
  line(ctx, -80, 20, -80, 130, { w: 9, c: '#6b4226' }); line(ctx, 80, 20, 80, 130, { w: 9, c: '#6b4226', seed: 3 });
  rect(ctx, -150, -60, 300, 100, { fill: o.c || COL.green, w: 5, seed: 2 });
  txt(ctx, o.small || 'WELCOME TO', 0, -36, { size: 24, font: 'sans', weight: 700, c: '#fff' });
  txt(ctx, o.text || 'FLORIDA', 0, 4, { size: 46, font: 'marker', c: '#fff' });
};
PROPS.stamp = (ctx, o) => {
  ctx.save(); ctx.rotate(-12 * D2R);
  rect(ctx, -170, -55, 340, 110, { w: 9, c: o.c || COL.red, seed: 2 });
  txt(ctx, o.text || 'DENIED', 0, 4, { size: 74, font: 'marker', c: o.c || COL.red });
  ctx.restore();
};
PROPS.taxForm = (ctx) => PROPS.doc(ctx, { title: 'TAX BILL', c: COL.dgreen });
PROPS.will = (ctx) => PROPS.doc(ctx, { title: 'WILL', c: '#6b4226' });
PROPS.tag = (ctx, o) => { // price tag
  ctx.save(); ctx.rotate((o.r || -18) * D2R);
  poly(ctx, [[-120, -50], [80, -50], [130, 0], [80, 50], [-120, 50]], { fill: o.c || COL.yellow, w: 5, seed: 2 });
  circ(ctx, 84, 0, 10, null, { fill: '#fff', w: 4, seed: 3 });
  txt(ctx, o.text || '$$$', -20, 4, { size: o.size || 50, font: 'marker', c: o.tc || COL.red });
  ctx.restore();
};

function prop(name, o = {}) {
  if (!PROPS[name]) throw new Error('no prop ' + name);
  return el(o, (ctx, lt) => PROPS[name](ctx, o, lt));
}

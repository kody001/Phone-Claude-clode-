// ============================================================
//  Hand-drawn prop library. Each prop draws inside [0,w]x[0,h].
// ============================================================
'use strict';
const COL = {
  green: '#6db04f', dgreen: '#3f7d3a', lgreen: '#a8d58a', money: '#86c06a', moneyD: '#4d8a3c',
  red: '#d9463e', dred: '#a62c26', blue: '#5b9bd5', dblue: '#2f6aa3', lblue: '#cfe8f7', sky: '#bfe3f5',
  yellow: '#ffd84a', orange: '#f39a34', brown: '#9a6234', dbrown: '#6b4021', gray: '#a3a8ad', lgray: '#dfe2e5', dgray: '#5d6166',
  paper: '#fffdf6', skin: '#f6cfa6', purple: '#8e5bc8', pink: '#f08cb0', steel: '#c9ced3', black: '#202227',
};
const lab = (c, s, x, y, size, o = {}) => text(c, s, x, y, { size, ...o });

defProp('rocket', 150, 430, (c, p, w, h) => {
  const body = p.color || '#f4f4f4';
  // fins
  shape(c, [[18, 330], [42, 262], [42, 372], [10, 405]], { fill: p.fin || COL.dgray });
  shape(c, [[132, 330], [108, 262], [108, 372], [140, 405]], { fill: p.fin || COL.dgray });
  shape(c, [[42, 110], [75, 4], [108, 110], [108, 380], [42, 380]], { fill: body, lw: 5 });
  shape(c, [[42, 110], [75, 4], [108, 110]], { fill: p.nose || '#2b2d33', lw: 5 });
  rect(c, 42, 360, 66, 24, { fill: COL.dgray });
  circle(c, 75, 170, 18, { fill: COL.sky, lw: 5 });
  if (p.label) lab(c, p.label, 75, 270, 26, { rot: -90, font: 'marker', color: '#333' });
});
defProp('starship', 130, 470, (c, p) => {
  shape(c, [[20, 410], [8, 460], [36, 452], [38, 400]], { fill: '#8f969c' });
  shape(c, [[110, 410], [122, 460], [94, 452], [92, 400]], { fill: '#8f969c' });
  shape(c, [[30, 120], [30, 450], [100, 450], [100, 120], [92, 50], [65, 6], [38, 50]], { fill: '#c7ccd1', lw: 5 });
  shape(c, [[30, 88], [14, 120], [30, 150]], { fill: '#8f969c', lw: 4 });
  shape(c, [[100, 88], [116, 120], [100, 150]], { fill: '#8f969c', lw: 4 });
  for (const y of [200, 280, 360]) line(c, [[34, y], [96, y]], { stroke: '#8f969c', lw: 3 });
});
defProp('flame', 90, 150, (c) => {
  shape(c, [[5, 0], [85, 0], [70, 60], [60, 110], [45, 150], [30, 110], [20, 60]], { fill: COL.orange, stroke: '#d4661c', lw: 4 });
  shape(c, [[22, 0], [68, 0], [58, 50], [45, 95], [32, 50]], { fill: COL.yellow, stroke: null });
});
defProp('droneship', 440, 150, (c) => {
  shape(c, [[10, 40], [430, 40], [405, 95], [35, 95]], { fill: '#4a4f57' });
  rect(c, 30, 26, 380, 18, { fill: '#2d3137' });
  for (let i = 0; i < 3; i++) shape(c, [[0, 105 + i * 16], [70, 98 + i * 16], [150, 108 + i * 16], [230, 98 + i * 16], [310, 108 + i * 16], [440, 100 + i * 16]], { closed: false, stroke: COL.blue, lw: 5 });
});
defProp('booster', 90, 300, (c) => {
  rect(c, 25, 10, 40, 250, { fill: '#f1f1f1', lw: 5 });
  rect(c, 25, 10, 40, 30, { fill: '#2b2d33' });
  line(c, [[25, 250], [0, 295]], { lw: 6 }); line(c, [[65, 250], [90, 295]], { lw: 6 });
  line(c, [[45, 255], [45, 298]], { lw: 6 });
});
defProp('planet', 300, 300, (c, p, w) => {
  const col = p.color || '#d0643b';
  circle(c, 150, 150, 140, { fill: col, lw: 6 });
  const cr = p.craters ?? true;
  if (p.kind === 'earth') {
    shape(c, [[60, 80], [120, 50], [150, 90], [120, 140], [80, 150], [50, 120]], { fill: COL.green, lw: 4 });
    shape(c, [[170, 160], [230, 140], [260, 190], [220, 250], [180, 230]], { fill: COL.green, lw: 4 });
    shape(c, [[90, 200], [130, 210], [120, 250], [90, 240]], { fill: COL.green, lw: 4 });
  } else if (cr) {
    circle(c, 100, 110, 22, { fill: 'rgba(0,0,0,.12)', lw: 3 }); circle(c, 190, 180, 30, { fill: 'rgba(0,0,0,.12)', lw: 3 }); circle(c, 120, 210, 14, { fill: 'rgba(0,0,0,.12)', lw: 3 }); circle(c, 200, 90, 12, { fill: 'rgba(0,0,0,.12)', lw: 3 });
  }
  if (p.label) lab(c, p.label, 150, 150, 54, { font: 'marker', color: '#fff', outline: INK, olw: 7 });
});
defProp('saturn', 380, 240, (c) => {
  shape(c, ellPts(190, 120, 180, 44, 40, Math.PI, Math.PI * 2), { closed: false, stroke: '#b98d4b', lw: 12 });
  circle(c, 190, 120, 95, { fill: '#e8c27a', lw: 6 });
  line(c, [[100, 95], [280, 95]], { stroke: '#c99a4f', lw: 6 }); line(c, [[98, 140], [282, 140]], { stroke: '#c99a4f', lw: 6 });
  shape(c, ellPts(190, 120, 180, 44, 40, 0, Math.PI), { closed: false, stroke: '#b98d4b', lw: 12 });
});
defProp('satellite', 330, 160, (c) => {
  rect(c, 8, 40, 120, 70, { fill: COL.dblue, lw: 5 });
  for (let i = 1; i < 4; i++) line(c, [[8 + i * 30, 40], [8 + i * 30, 110]], { stroke: '#cfe4ff', lw: 2.5 });
  rect(c, 202, 40, 120, 70, { fill: COL.dblue, lw: 5 });
  for (let i = 1; i < 4; i++) line(c, [[202 + i * 30, 40], [202 + i * 30, 110]], { stroke: '#cfe4ff', lw: 2.5 });
  line(c, [[128, 75], [202, 75]], { lw: 6 });
  rect(c, 138, 45, 54, 62, { fill: '#e8e8e8', lw: 5, r: 6 });
  line(c, [[165, 45], [165, 14]], { lw: 4 }); circle(c, 165, 12, 7, { fill: COL.red, lw: 3 });
});
defProp('dish', 200, 200, (c) => {
  shape(c, [[30, 40], [170, 40], [160, 120], [40, 120]], { fill: '#f2f2f2', lw: 5 });
  line(c, [[100, 120], [100, 180]], { lw: 7 }); line(c, [[60, 190], [140, 190]], { lw: 7 });
});
defProp('bill', 230, 110, (c) => {
  rect(c, 4, 4, 222, 102, { fill: COL.money, lw: 5, r: 6 });
  rect(c, 18, 16, 194, 78, { fill: null, stroke: COL.moneyD, lw: 3, r: 4 });
  circle(c, 115, 55, 30, { fill: '#a7d58f', stroke: COL.moneyD, lw: 3 });
  lab(c, '$', 115, 57, 46, { font: 'marker', color: COL.moneyD });
});
defProp('cash', 280, 170, (c) => {
  for (let i = 4; i >= 0; i--) { rect(c, 10 + i * 4, 20 + i * 22, 250, 70, { fill: i % 2 ? '#7ab65e' : COL.money, lw: 5, r: 5 }); }
  rect(c, 105, 18, 50, 74, { fill: '#e9d9a6', lw: 4 });
  circle(c, 60, 55, 18, { fill: '#a7d58f', stroke: COL.moneyD, lw: 3 }); lab(c, '$', 60, 56, 28, { font: 'marker', color: COL.moneyD });
  circle(c, 210, 55, 18, { fill: '#a7d58f', stroke: COL.moneyD, lw: 3 }); lab(c, '$', 210, 56, 28, { font: 'marker', color: COL.moneyD });
});
defProp('moneybag', 220, 250, (c, p) => {
  shape(c, [[70, 70], [40, 40], [80, 20], [110, 36], [140, 20], [180, 40], [150, 70], [200, 140], [205, 210], [160, 245], [60, 245], [15, 210], [20, 140]], { fill: p.color || '#5f9e4f', lw: 6 });
  line(c, [[68, 74], [152, 74]], { lw: 6, stroke: '#3c6b31' });
  lab(c, p.sym || '$', 112, 165, 92, { font: 'marker', color: '#e9f6d9', outline: INK, olw: 6 });
});
defProp('coins', 200, 120, (c) => {
  for (let i = 0; i < 4; i++) ellipse(c, 70, 100 - i * 18, 58, 18, { fill: '#f2c230', lw: 4 });
  for (let i = 0; i < 3; i++) ellipse(c, 140, 100 - i * 18, 54, 17, { fill: '#f2c230', lw: 4 });
});
defProp('bank', 340, 320, (c, p) => {
  shape(c, [[10, 90], [170, 10], [330, 90]], { fill: '#d9dcdf', lw: 6 });
  rect(c, 20, 90, 300, 30, { fill: '#c9cdd1', lw: 5 });
  for (let i = 0; i < 4; i++) rect(c, 40 + i * 72, 120, 40, 150, { fill: '#e7e9eb', lw: 5 });
  rect(c, 10, 270, 320, 40, { fill: '#b9bec3', lw: 6 });
  if (p.label) lab(c, p.label, 170, 105, 30, { font: 'marker', color: '#333' });
});
defProp('tower', 170, 340, (c, p) => {
  rect(c, 10, 10, 150, 325, { fill: p.color || '#7d8a96', lw: 6 });
  for (let r = 0; r < 7; r++) for (let k = 0; k < 3; k++) rect(c, 28 + k * 42, 30 + r * 42, 26, 26, { fill: (r + k) % 3 ? '#e8f2fb' : '#ffe58a', lw: 3.5 });
});
defProp('chartFrame', 640, 400, (c, p, w, h) => {
  rect(c, 0, 0, w, h, { fill: '#fff', lw: 5, r: 6 });
  line(c, [[60, 30], [60, h - 50], [w - 30, h - 50]], { lw: 5 });
  for (let i = 1; i < 5; i++) line(c, [[64, h - 50 - i * (h - 90) / 5], [w - 30, h - 50 - i * (h - 90) / 5]], { stroke: '#e3e3e3', lw: 2, amp: 0 });
  if (p.title) lab(c, p.title, w / 2, 26, 32, { font: 'hand' });
});
defProp('arrowUp', 420, 300, (c, p) => {
  const col = p.color || COL.green;
  const pts = [[10, 280], [130, 170], [200, 210], [360, 60]];
  shape(c, pts, { closed: false, stroke: col, lw: 22 });
  arrowHead(c, 380, 42, Math.atan2(-150, 160), 60, { color: col, lw: 22 });
});
defProp('arrowDown', 420, 300, (c, p) => {
  const col = p.color || COL.red;
  const pts = [[10, 20], [130, 130], [200, 90], [360, 240]];
  shape(c, pts, { closed: false, stroke: col, lw: 22 });
  arrowHead(c, 380, 258, Math.atan2(150, 160), 60, { color: col, lw: 22 });
});
defProp('arrow', p => p.len || 260, 60, (c, p, w) => {
  const col = p.color || COL.red;
  shape(c, [[8, 30], [w - 20, 30]], { closed: false, stroke: col, lw: p.lw || 14 });
  arrowHead(c, w - 8, 30, 0, 36, { color: col, lw: p.lw || 14 });
});
defProp('curvedArrow', 260, 200, (c, p) => {
  const col = p.color || COL.red;
  curve(c, [[20, 180], [60, 60], [170, 30], [230, 70]], { stroke: col, lw: 12 });
  arrowHead(c, 236, 76, rad(40), 34, { color: col, lw: 12 });
});
defProp('doc', p => p.w || 520, p => p.h || 620, (c, p, w, h) => {
  rect(c, 0, 0, w, h, { fill: COL.paper, lw: 5, r: 4 });
  shape(c, [[w - 60, 0], [w, 60], [w - 60, 60]], { fill: '#e9e4d6', lw: 4 });
  let y = 60;
  if (p.title) { lab(c, p.title, 34, y, p.tsize || 40, { align: 'left', font: 'marker' }); y += (p.tsize || 40) * .6 + 20 + ((p.title.match(/\n/g) || []).length * (p.tsize || 40) * .55); }
  if (p.sub) { lab(c, p.sub, 34, y + 6, 26, { align: 'left', color: '#666' }); y += 40; }
  line(c, [[34, y], [w - 34, y]], { lw: 3, stroke: '#999' }); y += 30;
  for (const ln of (p.lines || [])) {
    if (ln === '-') { for (let k = 0; k < 2; k++) { const R = rnd(y); line(c, [[34, y], [34 + (w - 68) * (.6 + R() * .4), y]], { stroke: '#bbb', lw: 6, amp: 1.5 }); y += 24; } y += 6; continue; }
    const hl = ln.startsWith('!');
    const s2 = hl ? ln.slice(1) : ln;
    const fsz = p.fsize || 32;
    if (hl && !p.noHl) { c.fillStyle = 'rgba(255,216,74,0.0)'; }
    lab(c, s2, 34, y + 6, fsz, { align: 'left', color: '#222' });
    y += fsz * 1.35;
  }
  if (p.stamp) { c.save(); c.translate(w * .62, h * .78); c.rotate(rad(-14)); rect(c, -150, -46, 300, 92, { fill: null, stroke: p.stampColor || COL.red, lw: 7, r: 8 }); lab(c, p.stamp, 0, 2, 54, { font: 'marker', color: p.stampColor || COL.red }); c.restore(); }
});
defProp('chalkboard', p => p.w || 780, p => p.h || 470, (c, p, w, h) => {
  rect(c, 0, 0, w, h, { fill: '#7a4a24', lw: 6, r: 6 });
  rect(c, 26, 26, w - 52, h - 52, { fill: '#2f6b3a', lw: 4 });
  if (p.text) lab(c, p.text, w / 2, h / 2, p.size || 72, { font: 'gochi', color: '#f3f6ee', lh: 1.15 });
});
defProp('bubble', p => p.w || 380, p => p.h || 220, (c, p, w, h) => {
  const tail = p.tail || 'left'; const bh = h - 50;
  const pts = rrPts(4, 4, w - 8, bh, 60);
  shape(c, pts, { fill: '#fff', lw: 5 });
  const tx = tail === 'left' ? w * .25 : tail === 'right' ? w * .75 : w * .5;
  const dir = tail === 'left' ? -1 : tail === 'right' ? 1 : 0;
  shape(c, [[tx - 22, bh - 2], [tx + dir * 46, h - 4], [tx + 24, bh - 2]], { fill: '#fff', lw: 5, closed: false });
  c.fillStyle = '#fff'; c.fillRect(tx - 18, bh - 10, 40, 10);
  lab(c, p.text || '', w / 2, bh / 2 + 4, p.size || 48, { font: p.font || 'hand', lh: 1.05, color: p.color || INK });
});
defProp('thought', p => p.w || 400, p => p.h || 260, (c, p, w, h) => {
  const bh = h - 70;
  for (const [x, y, r] of [[w * .25, bh * .55, bh * .42], [w * .5, bh * .42, bh * .5], [w * .75, bh * .55, bh * .42], [w * .5, bh * .72, bh * .38]]) circle(c, x, y, r, { fill: '#fff', lw: 5 });
  c.fillStyle = '#fff'; c.beginPath(); c.ellipse(w * .5, bh * .56, w * .36, bh * .34, 0, 0, 7); c.fill();
  circle(c, w * .3, h - 40, 16, { fill: '#fff', lw: 4 }); circle(c, w * .22, h - 14, 9, { fill: '#fff', lw: 4 });
  lab(c, p.text || '', w / 2, bh * .56, p.size || 44, { lh: 1.05 });
});
defProp('sign', p => p.w || 360, p => p.h || 220, (c, p, w, h) => {
  if (p.post !== false) rect(c, w / 2 - 8, h * .55, 16, h * .45, { fill: COL.brown, lw: 4 });
  rect(c, 4, 4, w - 8, h * .62, { fill: p.color || '#fff', lw: 6, r: 6 });
  lab(c, p.text || '', w / 2, h * .32, p.size || 56, { font: p.font || 'marker', color: p.tcolor || INK, lh: 1.05 });
});
defProp('label', p => p.w || 300, p => p.h || 90, (c, p, w, h) => {
  rect(c, 4, 4, w - 8, h - 8, { fill: p.color || '#fff', lw: 5, r: 14 });
  lab(c, p.text || '', w / 2, h / 2 + 2, p.size || 44, { font: p.font || 'hand', color: p.tcolor || INK });
});
defProp('tag', 260, 140, (c, p) => {
  shape(c, [[50, 10], [250, 10], [250, 130], [50, 130], [8, 70]], { fill: p.color || COL.yellow, lw: 6 });
  circle(c, 40, 70, 10, { fill: '#fff', lw: 4 });
  lab(c, p.text || '$$$', 150, 72, p.size || 56, { font: 'marker', color: p.tcolor || COL.red });
});
defProp('pie', 360, 360, (c, p) => {
  const cx = 180, cy = 180, r = 165; let a = -Math.PI / 2; const tot = p.slices.reduce((s, x) => s + x.v, 0);
  for (const sl of p.slices) {
    const a1 = a + sl.v / tot * Math.PI * 2;
    const pts = [[cx, cy], ...ellPts(cx, cy, r, r, Math.max(3, Math.round(60 * sl.v / tot)), a, a1)];
    shape(c, pts, { fill: sl.color, lw: 5 }); a = a1;
  }
});
defProp('robot', 220, 330, (c, p) => {
  line(c, [[110, 40], [110, 8]], { lw: 5 }); circle(c, 110, 8, 9, { fill: COL.red, lw: 3 });
  rect(c, 35, 40, 150, 120, { fill: '#9aa1a8', lw: 6, r: 26 });
  circle(c, 80, 98, 24, { fill: p.eye || COL.red, lw: 5 }); circle(c, 140, 98, 24, { fill: p.eye || COL.red, lw: 5 });
  circle(c, 80, 98, 8, { fill: '#fff', lw: 2 }); circle(c, 140, 98, 8, { fill: '#fff', lw: 2 });
  rect(c, 50, 168, 120, 120, { fill: '#8a9198', lw: 6, r: 10 });
  rect(c, 75, 190, 70, 70, { fill: '#e8e8e8', lw: 4 }); for (let i = 0; i < 3; i++) line(c, [[85, 205 + i * 18], [135, 205 + i * 18]], { lw: 3 });
  line(c, [[50, 190], [12, 260]], { lw: 8 }); line(c, [[170, 190], [208, 260]], { lw: 8 });
  line(c, [[80, 288], [80, 325]], { lw: 8 }); line(c, [[140, 288], [140, 325]], { lw: 8 });
  if (p.label) lab(c, p.label, 110, 225, 30, { font: 'marker', color: COL.dblue });
});
defProp('chip', 240, 240, (c, p) => {
  for (let i = 0; i < 6; i++) { const k = 48 + i * 29; line(c, [[k, 8], [k, 40]], { lw: 6 }); line(c, [[k, 200], [k, 232]], { lw: 6 }); line(c, [[8, k], [40, k]], { lw: 6 }); line(c, [[200, k], [232, k]], { lw: 6 }); }
  rect(c, 36, 36, 168, 168, { fill: '#2d6b39', lw: 6, r: 10 });
  rect(c, 70, 70, 100, 100, { fill: '#1d1f22', lw: 4, r: 6 });
  lab(c, p.text || 'GPU', 120, 122, 38, { font: 'marker', color: COL.lgreen });
});
defProp('server', 180, 330, (c) => {
  rect(c, 6, 6, 168, 318, { fill: '#3a3f46', lw: 6, r: 8 });
  for (let i = 0; i < 6; i++) { rect(c, 22, 24 + i * 50, 136, 36, { fill: '#555c64', lw: 3.5, r: 4 }); circle(c, 140, 42 + i * 50, 5, { fill: i % 2 ? '#6df06d' : '#4dd2ff', lw: 2 }); line(c, [[34, 42 + i * 50], [100, 42 + i * 50]], { stroke: '#8a939c', lw: 3 }); }
});
defProp('datacenter', 560, 320, (c, p) => {
  rect(c, 10, 90, 540, 220, { fill: '#cfd4d9', lw: 6 });
  rect(c, 10, 70, 540, 30, { fill: '#9aa1a8', lw: 6 });
  for (let i = 0; i < 6; i++) rect(c, 36 + i * 86, 140, 60, 120, { fill: '#3a3f46', lw: 4 });
  for (let i = 0; i < 3; i++) { rect(c, 80 + i * 150, 30, 60, 42, { fill: '#a9b0b6', lw: 4 }); for (let k = 0; k < 3; k++) curve(c, [[100 + i * 150 + k * 10, 24], [92 + i * 150 + k * 10, 10], [104 + i * 150 + k * 10, -6]], { stroke: '#bbb', lw: 3 }); }
  if (p.label) { rect(c, 150, 100, 260, 36, { fill: '#fff', lw: 4, r: 5 }); lab(c, p.label, 280, 119, 30, { font: 'marker' }); }
});
defProp('phone', 200, 370, (c, p) => {
  rect(c, 6, 6, 188, 358, { fill: '#25272c', lw: 6, r: 28 });
  rect(c, 20, 40, 160, 290, { fill: p.bg || '#f4f8ff', lw: 3, r: 8 });
  if (p.screen === 'chart') { lab(c, p.title || 'SPCX', 100, 72, 30, { font: 'marker' }); shape(c, [[34, 270], [70, 230], [100, 250], [130, 170], [168, 130]], { closed: false, stroke: COL.green, lw: 7 }); rect(c, 40, 290, 120, 30, { fill: COL.green, lw: 3, r: 8 }); lab(c, 'BUY', 100, 306, 24, { font: 'marker', color: '#fff' }); }
  if (p.screen === 'chartDown') { lab(c, p.title || 'SPCX', 100, 72, 30, { font: 'marker' }); shape(c, [[34, 130], [70, 160], [100, 150], [130, 240], [168, 270]], { closed: false, stroke: COL.red, lw: 7 }); }
  if (p.screen === 'chat') { rect(c, 34, 70, 110, 40, { fill: '#e3e7ee', lw: 3, r: 14 }); rect(c, 60, 130, 108, 40, { fill: COL.blue, lw: 3, r: 14 }); rect(c, 34, 190, 120, 40, { fill: '#e3e7ee', lw: 3, r: 14 }); lab(c, p.title || 'Grok', 100, 290, 34, { font: 'marker' }); }
  if (p.screen === 'text') lab(c, p.text || '', 100, 185, p.size || 34, { font: 'marker', lh: 1.1 });
});
defProp('laptop', 380, 250, (c, p) => {
  rect(c, 40, 6, 300, 190, { fill: '#2b2e33', lw: 6, r: 10 });
  rect(c, 56, 20, 268, 160, { fill: p.bg || '#1e2a3a', lw: 3 });
  shape(c, [[10, 200], [370, 200], [350, 240], [30, 240]], { fill: '#9aa1a8', lw: 6 });
  if (p.code) { const cl = ['#7fd1ff', '#ffd36b', '#9ef07f', '#ff8fb0']; for (let i = 0; i < 6; i++) { const R = rnd(i + 3); line(c, [[76 + (i % 3) * 14, 42 + i * 22], [76 + (i % 3) * 14 + 60 + R() * 120, 42 + i * 22]], { stroke: cl[i % 4], lw: 7, amp: .5 }); } }
  if (p.text) lab(c, p.text, 190, 100, p.size || 54, { font: 'marker', color: '#fff' });
});
defProp('xlogo', 170, 170, (c) => {
  circle(c, 85, 85, 78, { fill: '#111', lw: 5 });
  lab(c, 'X', 87, 90, 104, { font: 'marker', color: '#fff' });
});
defProp('bird', 200, 170, (c) => {
  shape(c, [[30, 100], [60, 60], [110, 50], [150, 70], [185, 40], [178, 80], [196, 82], [160, 110], [130, 140], [80, 150], [40, 140], [10, 150], [24, 120]], { fill: '#5bb5f0', lw: 5 });
  circle(c, 140, 78, 6, { fill: INK, lw: 2 });
  shape(c, [[60, 100], [110, 90], [100, 125]], { fill: '#8fd0f7', lw: 4 });
});
defProp('creditcard', 320, 200, (c, p) => {
  rect(c, 6, 6, 308, 188, { fill: p.color || '#2f4f8f', lw: 6, r: 18 });
  rect(c, 34, 60, 56, 42, { fill: '#f2c230', lw: 4, r: 6 });
  lab(c, p.text || '**** **** **** 6000', 160, 140, 28, { font: 'hand', color: '#fff' });
  rect(c, 6, 20, 308, 24, { fill: '#1d1d1d', lw: 0, stroke: null, amp: 0 });
});
defProp('rings', 240, 150, (c) => {
  circle(c, 85, 85, 55, { fill: null, stroke: '#e0b13a', lw: 14 });
  circle(c, 155, 85, 55, { fill: null, stroke: '#e0b13a', lw: 14 });
  shape(c, [[70, 30], [85, 10], [100, 30], [85, 44]], { fill: '#bfe9ff', lw: 4 });
});
defProp('heart', 200, 180, (c, p) => {
  shape(c, [[100, 170], [20, 90], [10, 50], [40, 15], [80, 15], [100, 45], [120, 15], [160, 15], [190, 50], [180, 90]], { fill: p.color || COL.red, lw: 6 });
  if (p.broken) line(c, [[100, 45], [85, 80], [110, 100], [92, 130], [100, 170]], { lw: 6, stroke: '#fff' });
});
defProp('bridge', 620, 240, (c, p) => {
  shape(c, ellPts(310, 230, 290, 170, 40, Math.PI, Math.PI * 2), { closed: false, stroke: COL.dred, lw: 12 });
  rect(c, 10, 150, 600, 26, { fill: '#b8483f', lw: 6 });
  for (let i = 1; i < 10; i++) { const x = 10 + i * 60; const y = 230 - Math.sqrt(Math.max(0, 1 - Math.pow((x - 310) / 290, 2))) * 170; line(c, [[x, y], [x, 150]], { lw: 4, stroke: COL.dred }); }
  rect(c, 0, 176, 40, 64, { fill: COL.gray, lw: 5 }); rect(c, 580, 176, 40, 64, { fill: COL.gray, lw: 5 });
  if (p.label) lab(c, p.label, 310, 210, 40, { font: 'marker', color: COL.dred });
});
defProp('bond', 380, 250, (c, p) => {
  rect(c, 6, 6, 368, 238, { fill: '#f3ecd2', lw: 6, r: 6 });
  rect(c, 22, 22, 336, 206, { fill: null, stroke: '#b59b55', lw: 4, r: 4 });
  lab(c, p.text || 'BOND', 190, 80, 56, { font: 'marker', color: '#7a6630' });
  lab(c, p.sub || 'pays you back + interest', 190, 140, 28, { color: '#555' });
  circle(c, 300, 190, 26, { fill: COL.red, lw: 4 });
});
defProp('wheel', 240, 240, (c) => {
  circle(c, 120, 120, 105, { fill: null, stroke: '#2b2d33', lw: 22 });
  circle(c, 120, 120, 30, { fill: '#55585e', lw: 5 });
  line(c, [[30, 120], [90, 120]], { lw: 16, stroke: '#2b2d33' }); line(c, [[150, 120], [210, 120]], { lw: 16, stroke: '#2b2d33' }); line(c, [[120, 150], [120, 215]], { lw: 16, stroke: '#2b2d33' });
});
defProp('crown', 220, 150, (c) => {
  shape(c, [[10, 140], [20, 30], [70, 90], [110, 10], [150, 90], [200, 30], [210, 140]], { fill: '#f2c230', lw: 6 });
  circle(c, 110, 105, 14, { fill: COL.red, lw: 4 }); circle(c, 55, 115, 10, { fill: COL.blue, lw: 3 }); circle(c, 165, 115, 10, { fill: COL.blue, lw: 3 });
});
defProp('ballot', 150, 170, (c, p) => {
  rect(c, 6, 6, 138, 158, { fill: '#fff', lw: 5, r: 4 });
  lab(c, p.text || 'VOTE', 75, 44, 34, { font: 'marker' });
  rect(c, 30, 80, 30, 30, { fill: '#fff', lw: 4 }); line(c, [[34, 94], [44, 106], [62, 76]], { lw: 5, stroke: COL.green });
  line(c, [[72, 96], [120, 96]], { stroke: '#bbb', lw: 5 }); line(c, [[30, 135], [120, 135]], { stroke: '#bbb', lw: 5 });
});
defProp('share', 320, 210, (c, p) => {
  rect(c, 6, 6, 308, 198, { fill: '#e6f2ff', lw: 6, r: 6 });
  rect(c, 20, 20, 280, 170, { fill: null, stroke: COL.dblue, lw: 3, r: 4 });
  lab(c, p.text || 'SHARE', 160, 80, 50, { font: 'marker', color: COL.dblue });
  lab(c, p.sub || 'SpaceX', 160, 140, 34, { color: '#333' });
});
defProp('padlock', 170, 220, (c, p) => {
  const open = p.open;
  shape(c, ellPts(85, open ? 60 : 85, 55, 60, 24, Math.PI, Math.PI * 2), { closed: false, lw: 16, stroke: '#8a9097' });
  if (open) line(c, [[140, 60], [140, 30]], { lw: 16, stroke: '#8a9097' }); else { line(c, [[30, 85], [30, 100]], { lw: 16, stroke: '#8a9097' }); line(c, [[140, 85], [140, 100]], { lw: 16, stroke: '#8a9097' }); }
  rect(c, 10, 100, 150, 112, { fill: '#f2c230', lw: 6, r: 12 });
  circle(c, 85, 145, 14, { fill: INK, lw: 2 }); line(c, [[85, 150], [85, 180]], { lw: 10 });
});
defProp('calendar', 230, 240, (c, p) => {
  rect(c, 6, 20, 218, 214, { fill: '#fff', lw: 6, r: 10 });
  rect(c, 6, 20, 218, 62, { fill: COL.red, lw: 6, r: 10 });
  line(c, [[60, 6], [60, 40]], { lw: 8 }); line(c, [[170, 6], [170, 40]], { lw: 8 });
  lab(c, p.month || 'JUNE', 115, 52, 40, { font: 'marker', color: '#fff' });
  lab(c, p.day || '', 115, 160, p.dsize || 96, { font: 'marker' });
});
defProp('stopwatch', 220, 250, (c, p) => {
  rect(c, 92, 6, 36, 26, { fill: COL.gray, lw: 5 });
  circle(c, 110, 140, 100, { fill: '#fff', lw: 7 });
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; line(c, [[110 + Math.cos(a) * 80, 140 + Math.sin(a) * 80], [110 + Math.cos(a) * 92, 140 + Math.sin(a) * 92]], { lw: 4, amp: 0 }); }
  if (p.text) lab(c, p.text, 110, 150, p.size || 60, { font: 'marker', color: COL.red });
  else { line(c, [[110, 140], [110, 70]], { lw: 6 }); line(c, [[110, 140], [160, 160]], { lw: 6 }); }
});
defProp('hourglass', 150, 230, (c) => {
  rect(c, 6, 6, 138, 20, { fill: COL.brown, lw: 5 }); rect(c, 6, 204, 138, 20, { fill: COL.brown, lw: 5 });
  shape(c, [[24, 26], [126, 26], [80, 115], [126, 204], [24, 204], [70, 115]], { fill: '#e8f4ff', lw: 5 });
  shape(c, [[40, 40], [110, 40], [78, 100], [72, 100]], { fill: '#f2c230', lw: 0, stroke: null });
  shape(c, [[75, 150], [110, 200], [40, 200]], { fill: '#f2c230', lw: 0, stroke: null });
});
defProp('piggy', 280, 210, (c, p) => {
  ellipse(c, 140, 110, 115, 80, { fill: '#f6a6c1', lw: 6 });
  circle(c, 238, 100, 30, { fill: '#f48fb1', lw: 5 }); circle(c, 230, 96, 4, { fill: INK, lw: 1 }); circle(c, 246, 96, 4, { fill: INK, lw: 1 });
  shape(c, [[90, 40], [110, 10], [130, 40]], { fill: '#f48fb1', lw: 5 });
  rect(c, 70, 172, 30, 34, { fill: '#f48fb1', lw: 5 }); rect(c, 180, 172, 30, 34, { fill: '#f48fb1', lw: 5 });
  line(c, [[110, 40], [170, 40]], { lw: 7 }); circle(c, 200, 80, 5, { fill: INK, lw: 1 });
  if (p.text) lab(c, p.text, 135, 120, p.size || 40, { font: 'marker', color: '#a0335c' });
});
defProp('basket', 320, 240, (c, p) => {
  shape(c, [[10, 80], [310, 80], [280, 230], [40, 230]], { fill: '#c98a4b', lw: 6 });
  for (let i = 1; i < 6; i++) line(c, [[10 + i * 50, 82], [40 + i * 40, 228]], { lw: 3, stroke: '#8b5a2b' });
  shape(c, ellPts(160, 80, 120, 70, 24, Math.PI, Math.PI * 2), { closed: false, lw: 8, stroke: '#8b5a2b' });
  if (p.text) { rect(c, 50, 120, 220, 64, { fill: '#fff', lw: 4, r: 8 }); lab(c, p.text, 160, 153, p.size || 38, { font: 'marker' }); }
});
defProp('cart', 300, 230, (c) => {
  line(c, [[10, 20], [50, 20], [80, 160], [250, 160]], { lw: 8 });
  shape(c, [[60, 50], [280, 50], [258, 140], [76, 140]], { fill: '#e8ecef', lw: 6 });
  for (let i = 1; i < 5; i++) line(c, [[60 + i * 44, 52], [66 + i * 38, 138]], { lw: 3 });
  circle(c, 100, 195, 22, { fill: '#555', lw: 5 }); circle(c, 230, 195, 22, { fill: '#555', lw: 5 });
});
defProp('scoreboard', 420, 240, (c, p) => {
  rect(c, 6, 6, 408, 200, { fill: '#202227', lw: 6, r: 10 });
  lab(c, p.title || 'SCORE', 210, 46, 36, { font: 'marker', color: COL.yellow });
  rect(c, 40, 80, 340, 100, { fill: '#0e1a10', lw: 4, r: 6 });
  lab(c, p.text || '$$$', 210, 132, 64, { font: 'marker', color: '#7dff7a' });
  rect(c, 190, 206, 40, 30, { fill: '#555', lw: 5 });
});
defProp('trophy', 200, 240, (c) => {
  shape(c, [[40, 20], [160, 20], [150, 110], [100, 140], [50, 110]], { fill: '#f2c230', lw: 6 });
  shape(c, ellPts(36, 60, 30, 30, 14, Math.PI * .5, Math.PI * 1.5), { closed: false, lw: 8, stroke: '#d9a21a' });
  shape(c, ellPts(164, 60, 30, 30, 14, -Math.PI * .5, Math.PI * .5), { closed: false, lw: 8, stroke: '#d9a21a' });
  rect(c, 88, 140, 24, 50, { fill: '#d9a21a', lw: 5 }); rect(c, 50, 190, 100, 40, { fill: COL.brown, lw: 6 });
});
defProp('target', 240, 240, (c) => {
  circle(c, 120, 120, 110, { fill: COL.red, lw: 6 }); circle(c, 120, 120, 78, { fill: '#fff', lw: 5 }); circle(c, 120, 120, 46, { fill: COL.red, lw: 5 }); circle(c, 120, 120, 16, { fill: '#fff', lw: 4 });
});
defProp('restaurant', 400, 330, (c, p) => {
  rect(c, 20, 110, 360, 210, { fill: p.color || '#f4e3c3', lw: 6 });
  shape(c, [[10, 110], [40, 50], [360, 50], [390, 110]], { fill: p.awning || COL.red, lw: 6 });
  for (let i = 0; i < 6; i++) shape(c, [[40 + i * 54, 50], [64 + i * 54, 50], [54 + i * 54, 110], [24 + i * 54, 110]], { fill: '#fff', lw: 3, stroke: null });
  rect(c, 50, 160, 120, 90, { fill: COL.sky, lw: 5 }); rect(c, 230, 170, 90, 150, { fill: COL.brown, lw: 5 });
  rect(c, 90, 6, 220, 48, { fill: '#fff', lw: 5, r: 8 }); lab(c, p.text || 'DINER', 200, 31, 34, { font: 'marker' });
});
defProp('towtruck', 440, 220, (c) => {
  rect(c, 150, 90, 270, 80, { fill: '#f2c230', lw: 6, r: 6 });
  shape(c, [[300, 90], [310, 30], [400, 30], [420, 90]], { fill: '#f2c230', lw: 6 });
  rect(c, 325, 42, 70, 40, { fill: COL.sky, lw: 4 });
  line(c, [[180, 90], [90, 20], [40, 120]], { lw: 8 }); line(c, [[40, 120], [40, 150]], { lw: 5 });
  shape(c, [[30, 150], [50, 150], [50, 170], [40, 160], [30, 170]], { closed: false, lw: 5 });
  circle(c, 200, 180, 30, { fill: '#333', lw: 5 }); circle(c, 370, 180, 30, { fill: '#333', lw: 5 });
  rect(c, 330, 10, 40, 22, { fill: COL.orange, lw: 4 });
});
defProp('domes', 520, 260, (c) => {
  shape(c, [[0, 230], [520, 230], [520, 260], [0, 260]], { fill: '#c45a33', lw: 5 });
  for (const [x, r] of [[110, 90], [280, 120], [430, 70]]) { shape(c, ellPts(x, 232, r, r, 26, Math.PI, Math.PI * 2), { fill: 'rgba(190,230,255,.75)', lw: 6 }); rect(c, x - r * .4, 232 - r * .45, r * .25, r * .45, { fill: '#fff', lw: 3 }); rect(c, x + r * .1, 232 - r * .35, r * .25, r * .35, { fill: '#fff', lw: 3 }); }
});
defProp('car', 420, 180, (c, p) => {
  shape(c, [[20, 120], [30, 80], [120, 70], [170, 20], [290, 20], [350, 70], [400, 82], [405, 125], [20, 128]], { fill: p.color || COL.red, lw: 6 });
  shape(c, [[180, 30], [280, 30], [320, 70], [150, 70]], { fill: COL.sky, lw: 4 }); line(c, [[232, 30], [232, 70]], { lw: 4 });
  circle(c, 110, 130, 34, { fill: '#333', lw: 5 }); circle(c, 320, 130, 34, { fill: '#333', lw: 5 });
  circle(c, 110, 130, 12, { fill: '#bbb', lw: 3 }); circle(c, 320, 130, 12, { fill: '#bbb', lw: 3 });
  if (p.text) lab(c, p.text, 215, 100, 34, { font: 'marker', color: '#fff' });
});
defProp('mask', 220, 260, (c) => {
  shape(c, [[20, 40], [110, 10], [200, 40], [195, 150], [160, 230], [110, 252], [60, 230], [25, 150]], { fill: '#fbfbf7', lw: 6 });
  shape(c, [[45, 95], [75, 80], [95, 100], [65, 110]], { fill: INK, lw: 3 }); shape(c, [[175, 95], [145, 80], [125, 100], [155, 110]], { fill: INK, lw: 3 });
  line(c, [[40, 70], [95, 60]], { lw: 6, stroke: COL.red }); line(c, [[180, 70], [125, 60]], { lw: 6, stroke: COL.red });
  shape(c, [[80, 185], [110, 175], [140, 185], [110, 200]], { fill: COL.red, lw: 4 });
  line(c, [[40, 140], [70, 170]], { lw: 5, stroke: COL.red }); line(c, [[180, 140], [150, 170]], { lw: 5, stroke: COL.red });
});
defProp('ticket', 440, 210, (c, p) => {
  shape(c, [[6, 6], [434, 6], [434, 80], [414, 105], [434, 130], [434, 204], [6, 204], [6, 130], [26, 105], [6, 80]], { fill: p.color || '#ffe58a', lw: 6 });
  line(c, [[320, 20], [320, 190]], { lw: 3, stroke: '#a88d2a' });
  lab(c, p.text || 'TICKET', 170, 80, 50, { font: 'marker', color: '#7a5a0a' });
  lab(c, p.sub || 'to MARS', 170, 145, 38, { color: '#333' });
  lab(c, p.no || 'No. 001', 378, 105, 26, { rot: -90, color: '#7a5a0a' });
});
defProp('newspaper', 420, 320, (c, p) => {
  shape(c, [[10, 14], [410, 6], [414, 312], [6, 316]], { fill: '#f7f5ee', lw: 6 });
  lab(c, p.name || 'THE DAILY', 210, 54, p.nsize || 40, { font: 'marker' });
  line(c, [[24, 84], [396, 82]], { lw: 4 });
  lab(c, p.head || '', 210, 136, p.hsize || 38, { font: 'hand', lh: 1.05 });
  for (let i = 0; i < 4; i++) { line(c, [[26, 200 + i * 26], [196, 200 + i * 26]], { stroke: '#aaa', lw: 6 }); line(c, [[224, 200 + i * 26], [394, 200 + i * 26]], { stroke: '#aaa', lw: 6 }); }
});
defProp('magnifier', 200, 220, (c) => {
  line(c, [[120, 130], [190, 210]], { lw: 18, stroke: COL.brown });
  circle(c, 80, 80, 66, { fill: 'rgba(200,235,255,.6)', lw: 10, stroke: '#555' });
});
defProp('check', 180, 160, (c) => { line(c, [[20, 90], [70, 140], [165, 20]], { lw: 26, stroke: COL.green }); });
defProp('cross', 170, 170, (c) => { line(c, [[20, 20], [150, 150]], { lw: 24, stroke: COL.red }); line(c, [[150, 20], [20, 150]], { lw: 24, stroke: COL.red }); });
defProp('dollar', 170, 230, (c, p) => { lab(c, '$', 85, 120, 220, { font: 'marker', color: p.color || COL.green, outline: INK, olw: 8 }); });
defProp('boom', 380, 320, (c, p) => {
  const pts = []; for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; const r = i % 2 ? 90 : 170; pts.push([190 + Math.cos(a) * r, 160 + Math.sin(a) * r * .8]); }
  shape(c, pts, { fill: COL.orange, lw: 6 });
  const p2 = pts.map(([x, y]) => [190 + (x - 190) * .6, 160 + (y - 160) * .6]); shape(c, p2, { fill: COL.yellow, lw: 4 });
  if (p.text) lab(c, p.text, 190, 162, 60, { font: 'marker', color: COL.dred });
});
defProp('cloud', 320, 190, (c, p) => {
  for (const [x, y, r] of [[90, 120, 60], [160, 85, 75], [235, 120, 58], [160, 135, 60]]) circle(c, x, y, r, { fill: p.color || '#fff', lw: 6 });
  c.fillStyle = p.color || '#fff'; c.fillRect(80, 110, 170, 60);
  if (p.text) lab(c, p.text, 160, 125, p.size || 44, { font: 'marker', color: p.tcolor || COL.dblue });
});
defProp('exchange', 520, 330, (c, p) => {
  rect(c, 10, 60, 500, 260, { fill: '#2a3340', lw: 6, r: 6 });
  rect(c, 10, 20, 500, 50, { fill: p.color || COL.blue, lw: 6, r: 6 });
  lab(c, p.text || 'NASDAQ', 260, 46, 40, { font: 'marker', color: '#fff' });
  const R = rnd(4);
  for (let r = 0; r < 4; r++) for (let k = 0; k < 3; k++) { const up = R() > .4; lab(c, (up ? '▲ ' : '▼ ') + (R() * 9).toFixed(1) + '%', 100 + k * 160, 110 + r * 55, 32, { color: up ? '#6df06d' : '#ff6b6b' }); }
});
defProp('book', 240, 280, (c, p) => {
  rect(c, 20, 10, 200, 260, { fill: p.color || COL.red, lw: 6, r: 8 });
  rect(c, 210, 18, 18, 246, { fill: '#fff', lw: 4 });
  lab(c, p.text || 'RULES', 115, 120, p.size || 50, { font: 'marker', color: '#fff', lh: 1.05 });
});
defProp('briefcase', 240, 190, (c) => {
  rect(c, 85, 10, 70, 40, { fill: null, stroke: '#4a2f17', lw: 10, r: 10 });
  rect(c, 10, 40, 220, 140, { fill: '#7a4a24', lw: 6, r: 12 });
  line(c, [[10, 90], [230, 90]], { lw: 5 }); rect(c, 105, 80, 30, 22, { fill: '#f2c230', lw: 4 });
});
defProp('bulb', 160, 230, (c) => {
  circle(c, 80, 80, 66, { fill: '#fff38a', lw: 6 });
  rect(c, 50, 140, 60, 50, { fill: '#aaa', lw: 5 }); line(c, [[52, 158], [108, 158]], { lw: 4 }); line(c, [[52, 174], [108, 174]], { lw: 4 });
});
defProp('qmark', 140, 200, (c, p) => { lab(c, '?', 70, 100, 200, { font: 'marker', color: p.color || '#e94f37', outline: INK, olw: 7 }); });
defProp('emark', 120, 200, (c, p) => { lab(c, '!', 60, 100, 200, { font: 'marker', color: p.color || '#e94f37', outline: INK, olw: 7 }); });
defProp('scale', 440, 320, (c, p) => {
  rect(c, 200, 60, 40, 220, { fill: COL.brown, lw: 5 }); rect(c, 130, 280, 180, 30, { fill: COL.brown, lw: 5 });
  const tl = p.tilt || 0;
  c.save(); c.translate(220, 70); c.rotate(rad(tl));
  line(c, [[-190, 0], [190, 0]], { lw: 10 });
  for (const s of [-1, 1]) { line(c, [[s * 170, 0], [s * 130, 90]], { lw: 3 }); line(c, [[s * 170, 0], [s * 210, 90]], { lw: 3 }); shape(c, ellPts(s * 170, 90, 50, 18, 16, 0, Math.PI), { fill: '#d9dcdf', lw: 5 }); }
  c.restore();
});
defProp('fire', 200, 240, (c) => {
  shape(c, [[100, 10], [150, 90], [180, 60], [190, 160], [150, 230], [50, 230], [10, 160], [30, 80], [60, 110]], { fill: COL.orange, lw: 6 });
  shape(c, [[100, 90], [135, 160], [125, 220], [75, 220], [65, 160]], { fill: COL.yellow, lw: 0, stroke: null });
});
defProp('kitchen', 360, 280, (c) => {
  rect(c, 10, 120, 340, 150, { fill: '#cfd4d9', lw: 6 });
  rect(c, 30, 140, 130, 110, { fill: '#7d8a96', lw: 5 }); circle(c, 95, 195, 30, { fill: '#2b2d33', lw: 4 });
  for (const x of [210, 290]) { ellipse(c, x, 120, 34, 10, { fill: '#555', lw: 4 }); rect(c, x - 30, 70, 60, 50, { fill: '#9aa1a8', lw: 5, r: 6 }); }
  for (let k = 0; k < 3; k++) curve(c, [[200 + k * 14, 60], [192 + k * 14, 40], [204 + k * 14, 18]], { stroke: '#bbb', lw: 4 });
});
defProp('nest', 520, 360, (c, p) => {
  // nesting boxes labeled
  const labels = p.labels || ['A', 'B', 'C']; const cols = p.colors || ['#f5d76e', '#9fd0f5', '#b5e39a', '#f5a3a3'];
  labels.forEach((l, i) => {
    const pad = i * 40; rect(c, 10 + pad, 10 + pad, 500 - pad * 2, 340 - pad * 2, { fill: cols[i % cols.length], lw: 6, r: 14 });
    lab(c, l, 260, 30 + pad + 14, 34, { font: 'marker' });
  });
});
defProp('kunai', 10, 10, () => { });
defProp('gavel', 260, 200, (c) => {
  c.save(); c.translate(130, 100); c.rotate(rad(-30));
  rect(c, -80, -36, 120, 72, { fill: COL.brown, lw: 6, r: 10 }); rect(c, 0, -10, 150, 20, { fill: '#b07a46', lw: 5 });
  c.restore(); rect(c, 30, 160, 140, 30, { fill: COL.dbrown, lw: 5 });
});
defProp('pctcoin', 170, 170, (c) => { circle(c, 85, 85, 76, { fill: COL.orange, lw: 6 }); circle(c, 85, 85, 56, { fill: '#f7b565', lw: 4 }); lab(c, '%', 85, 90, 80, { font: 'marker', color: '#fff', outline: '#7a4513', olw: 5 }); });
defProp('battery', 260, 130, (c, p) => { rect(c, 6, 10, 226, 110, { fill: '#fff', lw: 6, r: 12 }); rect(c, 232, 44, 22, 42, { fill: '#555', lw: 5 }); rect(c, 18, 22, 202 * (p.level ?? .2), 86, { fill: (p.level ?? .2) < .3 ? COL.red : COL.green, lw: 0, stroke: null, r: 6 }); });
defProp('star', 140, 140, (c, p) => { const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5; const r = i % 2 ? 28 : 64; pts.push([70 + Math.cos(a) * r, 72 + Math.sin(a) * r]); } shape(c, pts, { fill: p.color || COL.yellow, lw: 5 }); });
defProp('sparkle', 80, 80, (c) => { shape(c, [[40, 0], [48, 32], [80, 40], [48, 48], [40, 80], [32, 48], [0, 40], [32, 32]], { fill: COL.yellow, lw: 4 }); });
defProp('ruler', 600, 80, (c, p) => { rect(c, 6, 6, 588, 68, { fill: '#f6e3a1', lw: 5, r: 4 }); for (let i = 1; i < 30; i++) line(c, [[6 + i * 20, 6], [6 + i * 20, i % 5 ? 28 : 44]], { lw: 3, amp: 0 }); });
defProp('ladder', 160, 420, (c) => { line(c, [[20, 10], [20, 410]], { lw: 8, stroke: COL.brown }); line(c, [[140, 10], [140, 410]], { lw: 8, stroke: COL.brown }); for (let i = 0; i < 8; i++) line(c, [[20, 40 + i * 50], [140, 40 + i * 50]], { lw: 6, stroke: COL.brown }); });
defProp('house', 220, 210, (c) => { shape(c, [[10, 90], [110, 10], [210, 90]], { fill: COL.red, lw: 6 }); rect(c, 30, 90, 160, 110, { fill: '#f4e3c3', lw: 6 }); rect(c, 90, 130, 40, 70, { fill: COL.brown, lw: 5 }); });
defProp('stocktick', 760, 120, (c, p) => {
  rect(c, 6, 6, 748, 108, { fill: '#15181d', lw: 6, r: 8 });
  lab(c, p.text || 'SPCX  $150.00  ▲', 380, 62, 58, { font: 'marker', color: p.color || '#7dff7a' });
});
defProp('podium', 420, 220, (c) => {
  rect(c, 150, 40, 120, 170, { fill: '#f2c230', lw: 6 }); lab(c, '1', 210, 100, 70, { font: 'marker' });
  rect(c, 30, 100, 120, 110, { fill: '#c9cdd1', lw: 6 }); lab(c, '2', 90, 150, 56, { font: 'marker' });
  rect(c, 270, 130, 120, 80, { fill: '#d9a066', lw: 6 }); lab(c, '3', 330, 168, 50, { font: 'marker' });
});
defProp('pile', 460, 220, (c) => {
  const R = rnd(9);
  for (let i = 0; i < 26; i++) { const x = 40 + R() * 380, y = 200 - R() * (150 - Math.abs(x - 230) * .5); c.save(); c.translate(x, Math.max(60, y)); c.rotate((R() - .5) * 1.2); rect(c, -50, -22, 100, 44, { fill: i % 3 ? COL.money : '#7ab65e', lw: 4, r: 4, seed: 200 + i }); lab(c, '$', 0, 1, 26, { font: 'marker', color: COL.moneyD }); c.restore(); }
});
defProp('receipt', 230, 330, (c, p) => {
  const pts = [[10, 6], [220, 6], [220, 310]]; for (let i = 0; i <= 10; i++) pts.push([220 - i * 21, 310 + (i % 2 ? 14 : 0)]); pts.push([10, 310]);
  shape(c, pts, { fill: '#fff', lw: 5 });
  lab(c, p.title || 'FEES', 115, 46, 40, { font: 'marker' });
  (p.lines || ['-', '-', '-']).forEach((l, i) => { if (l === '-') line(c, [[30, 100 + i * 40], [190, 100 + i * 40]], { stroke: '#bbb', lw: 6 }); else lab(c, l, 115, 100 + i * 40, 30); });
  if (p.total) { line(c, [[30, 240], [200, 240]], { lw: 3 }); lab(c, p.total, 115, 272, 40, { font: 'marker', color: COL.red }); }
});
defProp('iceberg', 620, 560, (c, p) => {
  rect(c, 0, 150, 620, 410, { fill: '#5a9fd6', lw: 0, stroke: null, amp: 0 });
  shape(c, [[0, 150], [80, 140], [160, 156], [240, 144], [320, 154], [400, 142], [480, 156], [560, 146], [620, 152]], { closed: false, stroke: '#2f6aa3', lw: 5 });
  shape(c, [[230, 152], [270, 70], [300, 20], [330, 60], [360, 110], [390, 152]], { fill: '#f2fbff', lw: 5 });
  shape(c, [[230, 152], [390, 152], [470, 230], [520, 340], [470, 450], [360, 530], [240, 520], [130, 440], [100, 320], [150, 220]], { fill: 'rgba(225,245,255,.85)', lw: 5 });
  if (p.top) lab(c, p.top, 310, 118, 34, { font: 'marker' });
  if (p.bottom) lab(c, p.bottom, 310, 340, 90, { font: 'marker', color: COL.dblue });
});
defProp('email', 640, 400, (c, p) => {
  rect(c, 4, 4, 632, 392, { fill: '#fff', lw: 6, r: 12 });
  rect(c, 4, 4, 632, 60, { fill: '#e8eef6', lw: 6, r: 12 });
  for (const [x, col] of [[34, '#ff5f57'], [62, '#febc2e'], [90, '#28c840']]) circle(c, x, 34, 9, { fill: col, lw: 2.5 });
  lab(c, p.to || 'To: All employees', 34, 98, 32, { align: 'left', color: '#555' });
  lab(c, p.subj || 'Subject: IPO', 34, 140, 34, { align: 'left', font: 'marker' });
  line(c, [[30, 170], [610, 170]], { lw: 3, stroke: '#bbb' });
  lab(c, p.body || '', 320, 280, p.bsize || 38, { lh: 1.15 });
});
defProp('live', 200, 80, (c) => { rect(c, 4, 4, 192, 72, { fill: COL.red, lw: 5, r: 12 }); circle(c, 40, 40, 12, { fill: '#fff', lw: 3 }); lab(c, 'LIVE', 115, 42, 44, { font: 'marker', color: '#fff' }); });
defProp('screen', 560, 360, (c, p) => {
  rect(c, 4, 4, 552, 330, { fill: '#2b2e33', lw: 6, r: 12 });
  rect(c, 24, 24, 512, 290, { fill: p.bg || '#bfe3f5', lw: 3 });
  rect(c, 240, 334, 80, 24, { fill: '#555', lw: 5 });
});
defProp('table', 640, 200, (c) => {
  shape(c, ellPts(320, 70, 300, 60, 40), { fill: '#a7adb3', lw: 6 });
  rect(c, 300, 120, 40, 80, { fill: '#7d848b', lw: 5 });
  rect(c, 160, 40, 70, 40, { fill: '#fff', lw: 4 }); rect(c, 400, 46, 70, 40, { fill: '#fff', lw: 4 });
});
defProp('mic', 90, 200, (c) => { rect(c, 20, 6, 50, 80, { fill: '#555', lw: 5, r: 24 }); rect(c, 38, 86, 14, 110, { fill: '#333', lw: 4 }); });
defProp('badge', 260, 300, (c, p) => {
  shape(c, [[130, 6], [250, 50], [240, 170], [130, 294], [20, 170], [10, 50]], { fill: p.color || '#f2c230', lw: 7 });
  shape(c, [[130, 30], [228, 66], [220, 164], [130, 266], [40, 164], [32, 66]], { fill: null, stroke: '#fff', lw: 4 });
  lab(c, p.text || '', 130, 140, p.size || 46, { font: 'marker', color: p.tcolor || INK, lh: 1 });
});
defProp('card', 300, 200, (c, p) => {
  rect(c, 6, 6, 288, 188, { fill: p.color || '#fff', lw: 6, r: 16 });
  lab(c, p.text || '', 150, p.icon ? 150 : 100, p.size || 50, { font: 'marker', color: p.tcolor || INK, lh: 1.05 });
});
defProp('wallet', 260, 190, (c, p) => {
  rect(c, 10, 30, 240, 150, { fill: '#7a4a24', lw: 6, r: 14 });
  rect(c, 150, 80, 100, 50, { fill: '#5c3519', lw: 5, r: 10 }); circle(c, 200, 105, 8, { fill: '#f2c230', lw: 3 });
  if (p.empty) { line(c, [[40, 20], [60, 0]], { lw: 3, stroke: '#999' }); line(c, [[70, 24], [74, 2]], { lw: 3, stroke: '#999' }); }
  else { rect(c, 30, 10, 100, 40, { fill: COL.money, lw: 4 }); }
});
defProp('construction', 380, 260, (c, p) => {
  rect(c, 30, 160, 16, 100, { fill: '#888', lw: 4 }); rect(c, 334, 160, 16, 100, { fill: '#888', lw: 4 });
  rect(c, 6, 40, 368, 130, { fill: '#f2c230', lw: 6, r: 6 });
  for (let i = 0; i < 6; i++) shape(c, [[20 + i * 60, 44], [50 + i * 60, 44], [30 + i * 60, 72], [0 + i * 60, 72]].map(([x, y]) => [Math.min(370, Math.max(10, x)), y]), { fill: INK, lw: 0, stroke: null });
  lab(c, p.text || 'UNDER CONSTRUCTION', 190, 120, p.size || 38, { font: 'marker', lh: 1 });
});
defProp('bell', 220, 230, (c) => {
  shape(c, [[110, 20], [160, 50], [175, 140], [205, 180], [15, 180], [45, 140], [60, 50]], { fill: '#f2c230', lw: 6 });
  circle(c, 110, 198, 20, { fill: '#d9a21a', lw: 5 }); rect(c, 98, 2, 24, 22, { fill: '#d9a21a', lw: 4 });
});
// layout helper: world y of each doc line centre, given doc centre (x,y) and scale
function docLines(p, cx, cy, s = 1) {
  const w = p.w || 520, h = p.h || 620; let y = 60; const out = [];
  if (p.title) { y += (p.tsize || 40) * .6 + 20 + ((p.title.match(/\n/g) || []).length * (p.tsize || 40) * .55); }
  if (p.sub) y += 40;
  y += 30;
  for (const ln of (p.lines || [])) {
    if (ln === '-') { out.push(null); y += 54; continue; }
    const fsz = p.fsize || 32; out.push(cy + (y + 6 - h / 2) * s); y += fsz * 1.35;
  }
  return { ys: out, left: cx + (34 - w / 2) * s, fs: (p.fsize || 32) * s };
}
defProp('gift', 380, 360, (c, p) => {
  rect(c, 20, 110, 340, 240, { fill: p.color || '#4a7bd1', lw: 6 });
  rect(c, 6, 70, 368, 60, { fill: p.color2 || '#3b66b3', lw: 6 });
  rect(c, 165, 70, 50, 280, { fill: '#f2c230', lw: 5 });
  shape(c, [[190, 70], [120, 10], [100, 50], [190, 70], [260, 10], [280, 50]], { fill: '#f2c230', lw: 5 });
  if (p.text) { rect(c, 40, 190, 120, 70, { fill: '#fff', lw: 4, r: 8 }); lab(c, p.text, 100, 226, p.size || 34, { font: 'marker' }); }
});
defProp('sun', 200, 200, (c) => { for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; line(c, [[100 + Math.cos(a) * 70, 100 + Math.sin(a) * 70], [100 + Math.cos(a) * 96, 100 + Math.sin(a) * 96]], { lw: 7, stroke: '#f2a52b' }); } circle(c, 100, 100, 56, { fill: COL.yellow, lw: 6 }); });
defProp('palm', 260, 420, (c) => {
  curve(c, [[150, 410], [140, 260], [120, 120]], { lw: 22, stroke: '#9a6234' });
  for (const [dx, dy] of [[-110, 20], [-90, -50], [0, -80], [90, -50], [110, 30]]) shape(c, [[120, 110], [120 + dx * .5, 110 + dy * .5 - 20], [120 + dx, 110 + dy], [120 + dx * .5, 110 + dy * .5 + 10]], { fill: COL.green, lw: 5 });
});
defProp('door', 300, 420, (c, p) => {
  rect(c, 30, 40, 240, 370, { fill: '#5b3a1e', lw: 6, r: 6 });
  rect(c, 50, 60, 200, 330, { fill: '#7a4f2a', lw: 4 });
  circle(c, 220, 230, 12, { fill: '#f2c230', lw: 4 });
  rect(c, 10, 4, 280, 56, { fill: p.color || '#1f5fbf', lw: 6, r: 8 }); lab(c, p.text || 'NASDAQ-100', 150, 33, p.size || 38, { font: 'marker', color: '#fff' });
});
defProp('rope', 420, 200, (c) => {
  for (const x of [30, 390]) { rect(c, x - 10, 60, 20, 130, { fill: '#d4af37', lw: 5 }); circle(c, x, 56, 16, { fill: '#d4af37', lw: 4 }); }
  curve(c, [[40, 80], [210, 150], [380, 80]], { lw: 14, stroke: '#b3202a' });
});
defProp('puzzle', 220, 220, (c, p) => {
  shape(c, [[20, 50], [80, 50], [80, 30], [100, 14], [120, 30], [120, 50], [190, 50], [190, 110], [210, 110], [222, 130], [210, 150], [190, 150], [190, 210], [20, 210]], { fill: p.color || COL.orange, lw: 6 });
});
defProp('updown', p => p.w || 520, p => p.h || 560, (c, p, w, h) => {
  // two bars: up (green) and down (red) from a middle baseline
  const mid = h * (p.mid ?? .5); const mx = p.max || Math.max(p.up, p.down);
  const bw = w * .3;
  rect(c, w * .14, mid - p.up / mx * (h * .45), bw, p.up / mx * (h * .45), { fill: COL.green, lw: 5 });
  rect(c, w * .56, mid, bw, p.down / mx * (h * .45), { fill: COL.red, lw: 5 });
  line(c, [[0, mid], [w, mid]], { lw: 6 });
});

// YouTube thumbnails in the reference channel's style: white card, huge characters with crazy faces,
// stacked condensed title with one grungy red keyword. Rendered with render/still.js (--scenes=scenes0,thumbs).
'use strict';
BGS.thumb_white = c => { c.fillStyle = '#fbfaf7'; c.fillRect(0, 0, W, H); return 0; };
BGS.thumb_sand = c => {
  c.fillStyle = '#d9c39a'; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 9000; i++) { c.fillStyle = `rgba(${120 + rnd(i, 1) * 80},${90 + rnd(i, 2) * 60},${50 + rnd(i, 3) * 40},${0.08 + rnd(i, 4) * 0.12})`; c.fillRect(rnd(i, 5) * W, rnd(i, 6) * H, 2 + rnd(i, 7) * 5, 2 + rnd(i, 8) * 5); }
  c.fillStyle = radial(c, W * 0.3, H * 0.4, 100, W * 0.9, [[0, 'rgba(255,240,210,0.35)'], [1, 'rgba(80,50,20,0.25)']]); c.fillRect(0, 0, W, H);
  return 0;
};

// distressed title word: hard dark shadow + eroded (grungy) fill, like the reference thumbnails
function grungeWord(c, s, x, y, size, color, o = {}) {
  const cv = document.createElement('canvas');
  c.save(); c.font = `${size}px "Anton"`; const w = c.measureText(s).width; c.restore();
  const pad = size * 0.3;
  cv.width = Math.ceil(w + pad * 2) * 2; cv.height = Math.ceil(size * 1.6) * 2;
  const g = cv.getContext('2d');
  g.scale(2, 2);
  g.font = `${size}px "Anton"`; g.textBaseline = 'middle'; g.textAlign = 'left';
  g.fillStyle = color; g.fillText(s, pad, size * 0.8);
  if (o.grunge !== false) {
    g.globalCompositeOperation = 'destination-out';
    const seed = strSeed(s);
    for (let i = 0; i < (o.grunge || 1) * 260; i++) { g.fillStyle = `rgba(0,0,0,${0.35 + rnd(seed + i, 1) * 0.65})`; const r = 0.6 + rnd(seed + i, 2) * 3.2; g.beginPath(); g.arc(pad + rnd(seed + i, 3) * w, size * 0.1 + rnd(seed + i, 4) * size * 1.4, r, 0, TAU); g.fill(); }
    g.lineWidth = 1.4; for (let i = 0; i < (o.grunge || 1) * 18; i++) { g.strokeStyle = 'rgba(0,0,0,0.8)'; const sx = pad + rnd(seed + i, 5) * w, sy = size * 0.15 + rnd(seed + i, 6) * size * 1.3; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + (rnd(seed + i, 7) - 0.5) * size * 0.5, sy + (rnd(seed + i, 8) - 0.5) * size * 0.12); g.stroke(); }
  }
  const dw = cv.width / 2, dh = cv.height / 2;
  const left = o.align === 'left' ? x - pad : x - dw / 2;
  c.save();
  if (o.rot) { c.translate(x, y); c.rotate(o.rot); c.translate(-x, -y); }
  // chunky dark shadow (offset copies), then the word
  c.globalAlpha = 1;
  c.filter = 'brightness(0)';
  for (let k = 1; k <= 3; k++) c.drawImage(cv, left + k * size * 0.012, y - dh / 2 + k * size * 0.016, dw, dh);
  c.filter = 'none';
  c.drawImage(cv, left, y - dh / 2, dw, dh);
  c.restore();
}
function splat(c, x, y, s, seed, color = '#b3121b') {
  c.save(); c.fillStyle = color;
  c.beginPath(); c.arc(x, y, 26 * s, 0, TAU); c.fill();
  for (let i = 0; i < 14; i++) { const a = rnd(seed, i) * TAU, d = (30 + rnd(seed, i + 20) * 90) * s, r = (4 + rnd(seed, i + 40) * 12) * s; c.beginPath(); c.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, r, 0, TAU); c.fill(); c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a - 0.08) * d, y + Math.sin(a - 0.08) * d); c.lineTo(x + Math.cos(a + 0.08) * d, y + Math.sin(a + 0.08) * d); c.fill(); }
  c.restore();
}
const RED = '#e2231a', BLK = '#141010';
const thumbBase = { cam: null, vig: false, nocap: true };

// 1) WEIRD ANCIENT MEDICINE — Stone Age surgeon with his rock, and the patient with two holes in his skull
shot(Object.assign({ at: 0, bg: 'thumb_white', draw: (c, st) => {
  ch(c, st, 'cavedoc', { x: 690, y: 1150, s: 1.85, flip: true, face: 'crazy', pose: 'holdUp', hold: { R: ['rock', { s: 1.25 }] }, lean: -8, noShadow: true });
  ch(c, st, 'caveman', { x: 300, y: 1260, s: 2.05, face: 'dizzy', holes: true, pose: 'scared', lean: 6, noShadow: true, sweat: true });
  splat(c, 560, 280, 0.7, 11);
  grungeWord(c, 'WEIRD', 1430, 250, 300, RED, { rot: -0.03 });
  grungeWord(c, 'ANCIENT', 1430, 560, 210, BLK, { grunge: 0.25 });
  grungeWord(c, 'MEDICINE', 1430, 820, 210, BLK, { grunge: 0.25 });
} }, thumbBase));

// 2) HISTORY'S WORST DOCTORS — Cato with his jar of cabbage pee and a cabbage
shot(Object.assign({ at: 100, bg: 'thumb_white', draw: (c, st) => {
  ch(c, st, 'cato', { x: 500, y: 1180, s: 2.25, face: 'crazy', arms: [[70, 150], [70, 150]], hold: { R: ['jar', { s: 1.15 }], L: ['cabbage', { s: 1.05 }] }, lean: 3, noShadow: true });
  stink(c, 830, 230, 3, '#b8a530', 3, 1.5);
  flies(c, 860, 250, 4.2, 5, 1.5);
  grungeWord(c, "HISTORY'S", 1440, 200, 180, BLK, { grunge: 0.25 });
  grungeWord(c, 'WORST', 1440, 470, 330, RED, { rot: -0.02 });
  grungeWord(c, 'DOCTORS', 1440, 780, 220, BLK, { grunge: 0.25 });
} }, thumbBase));

// 3) DUMBEST CURES IN HISTORY — Irynakhty with the enema horn, green-faced patient, crocodile-dung remedy
shot(Object.assign({ at: 200, bg: 'thumb_sand', draw: (c, st) => {
  ch(c, st, 'egy_pat', { x: 300, y: 1290, s: 2.05, face: 'scared', green: true, tears: true, pose: 'scared', lean: 7, noShadow: true });
  ch(c, st, 'iry', { x: 820, y: 1180, s: 1.85, flip: true, face: 'crazy', arms: [[12, 4], [75, 95]], hold: { R: ['horn', { s: 1.5, rot: 0.15 }] }, lean: -8, noShadow: true });
  prop(c, st, 'dung', 600, 1030, { s: 1.4 });
  grungeWord(c, 'DUMBEST', 1430, 230, 270, RED, { rot: -0.03 });
  grungeWord(c, 'CURES', 1430, 520, 230, BLK, { grunge: 0.25 });
  grungeWord(c, 'IN', 1430, 700, 110, BLK, { grunge: 0.2 });
  grungeWord(c, 'HISTORY', 1430, 880, 220, BLK, { grunge: 0.25 });
} }, thumbBase));

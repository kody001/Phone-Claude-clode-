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

// 4) DISGUSTING CURES IN HISTORY — modelled on the reference "BRUTAL SPORTS IN HISTORY" thumbnail
BGS.thumb_ripples = c => {
  c.fillStyle = '#d6bf96'; c.fillRect(0, 0, W, H);
  for (let y = -30, k = 0; y < H + 40; y += 30, k++) {
    const amp = 10 + rnd(k, 1) * 12, f = 0.0035 + rnd(k, 2) * 0.003, ph = rnd(k, 3) * 6;
    const path = (dy) => { c.beginPath(); for (let x = -20; x <= W + 20; x += 16) c.lineTo(x, y + dy + Math.sin(x * f + ph) * amp + Math.sin(x * f * 2.7 + ph * 2) * amp * 0.4); };
    path(7); c.strokeStyle = 'rgba(110,80,40,0.30)'; c.lineWidth = 12; c.stroke();
    path(0); c.strokeStyle = 'rgba(255,246,222,0.32)'; c.lineWidth = 8; c.stroke();
  }
  for (let i = 0; i < 12000; i++) { c.fillStyle = `rgba(${90 + rnd(i, 4) * 100},${70 + rnd(i, 5) * 70},${40 + rnd(i, 6) * 40},${0.05 + rnd(i, 7) * 0.08})`; c.fillRect(rnd(i, 8) * W, rnd(i, 9) * H, 2, 2); }
  c.fillStyle = radial(c, W * 0.45, H * 0.45, 200, W * 0.75, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(60,35,10,0.45)']]); c.fillRect(0, 0, W, H);
  return 3.5;
};
function roundWord(c, s, x, y, size, fill) {
  c.save(); c.font = `${size}px "Lilita One"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  c.fillStyle = 'rgba(0,0,0,0.55)'; c.strokeStyle = 'rgba(0,0,0,0.55)'; c.lineWidth = size * 0.2; c.strokeText(s, x + size * 0.04, y + size * 0.07); c.fillText(s, x + size * 0.04, y + size * 0.07);
  c.strokeStyle = '#140c0a'; c.lineWidth = size * 0.17; c.strokeText(s, x, y);
  c.fillStyle = fill; c.fillText(s, x, y);
  c.restore();
}
function vomitSpray(c, x0, y0, seed) {
  const cols = ['#9cc63a', '#86b02c', '#b8d850', '#6f9422'];
  c.save();
  for (let i = 0; i < 260; i++) {
    const a = Math.PI + (rnd(seed, i) - 0.5) * 0.9 - 0.28, d = 20 + Math.pow(rnd(seed, i + 300), 0.7) * 520, r = (3 + rnd(seed, i + 600) * 15) * (1 - d / 700);
    c.fillStyle = cols[i % 4]; c.globalAlpha = 0.75 + rnd(seed, i + 900) * 0.25;
    c.beginPath(); c.ellipse(x0 + Math.cos(a) * d, y0 + Math.sin(a) * d, r * 1.4, r, a, 0, TAU); c.fill();
  }
  c.globalAlpha = 1; c.fillStyle = '#8ab832';
  c.beginPath(); c.moveTo(x0 + 10, y0 - 14); c.quadraticCurveTo(x0 - 150, y0 - 70, x0 - 300, y0 - 30); c.quadraticCurveTo(x0 - 160, y0 - 10, x0 + 10, y0 + 14); c.fill();
  for (let i = 0; i < 16; i++) { const x = x0 - 60 - rnd(seed, i + 1200) * 380, y = y0 - 70 + rnd(seed, i + 1300) * 90, L = 30 + rnd(seed, i + 1400) * 160; c.fillStyle = cols[i % 3]; c.fillRect(x, y, 4 + rnd(seed, i) * 4, L); c.beginPath(); c.arc(x + 4, y + L, 5, 0, TAU); c.fill(); }
  c.restore();
}
shot(Object.assign({ at: 300, bg: 'thumb_ripples', draw: (c, st) => {
  roundWord(c, 'DISGUSTING', 520, 200, 168, '#e8332a');
  roundWord(c, 'CURES', 520, 430, 220, '#e8332a');
  roundWord(c, 'IN', 520, 625, 110, '#ffffff');
  roundWord(c, 'HISTORY', 520, 850, 210, '#ffffff');
  prop(c, st, 'jar', 1140, 840, { s: 1.75, rot: -0.12 });
  flies(c, 1150, 640, 4.7, 5, 1.7);
  ch(c, st, 'roman_pat', { x: 1610, y: 1010, s: 2.05, lean: -16, face: 'gross', bruise: true, pre: { skin: '#fbf9f4', color: '#c62a22', hair: 'none', bags: 0 }, arms: [[95, 35], [40, -60]], noShadow: true,
    after: (cc, info) => {
      // forehead wound and body stitches like the reference
      cc.save(); cc.translate(30, info.hy - 62); line(cc, [[-10, -10], [10, 10]], { lw: 5, stroke: '#c0302a' }); line(cc, [[10, -10], [-10, 10]], { lw: 5, stroke: '#c0302a' }); cc.restore();
      line(cc, [[40, -120], [56, -96]], { lw: 4 }); line(cc, [[56, -122], [40, -96]], { lw: 4 });
    } });
  vomitSpray(c, 1440, 525, 77);
  stink(c, 1140, 640, 3.3, '#b8a530', 3, 1.3);
} }, thumbBase));

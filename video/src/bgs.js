// Painted backgrounds (rendered once, cached, softly blurred for depth like the reference).
'use strict';
const BGS = {};
const saveBoil = () => { const b = BOILF; BOILF = 0; return b; };
function sky(c, top, bot, horizon = H) { c.fillStyle = grad(c, [[0, top], [1, bot]], 0, 0, 0, horizon); c.fillRect(0, 0, W, horizon); }
function hills(c, y, amp, col, seed, n = 5) { c.beginPath(); c.moveTo(0, H); for (let i = 0; i <= 80; i++) { const x = i / 80 * W; c.lineTo(x, y - Math.abs(Math.sin(i / 80 * n * Math.PI + seed)) * amp - Math.sin(i * 0.35 + seed) * amp * 0.15); } c.lineTo(W, H); c.closePath(); c.fillStyle = col; c.fill(); }
function cloud(c, x, y, s, col = 'rgba(255,255,255,0.9)') { c.fillStyle = col; c.beginPath(); for (const [dx, dy, r] of [[0, 0, 60], [60, -20, 70], [130, 0, 55], [70, 20, 60], [-50, 15, 45]]) { c.moveTo(x + dx * s + r * s, y + dy * s); c.arc(x + dx * s, y + dy * s, r * s, 0, TAU); } c.fill(); }
function palm(c, x, y, s, col = '#3e7a2a', trunk = '#7a5230') {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.strokeStyle = trunk; c.lineWidth = 26; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(30, -200, 10, -400); c.stroke();
  c.fillStyle = col;
  for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.45; c.save(); c.translate(10, -400); c.rotate(a + Math.PI / 2); c.beginPath(); c.ellipse(0, -110, 34, 130, 0, 0, TAU); c.fill(); c.restore(); }
  c.restore();
}
function column(c, x, y, w, h, col, shade = 'rgba(0,0,0,0.18)', capital = 'doric') {
  c.fillStyle = col; c.fillRect(x - w / 2, y - h, w, h);
  c.fillStyle = shade; c.fillRect(x + w * 0.15, y - h, w * 0.35, h);
  c.fillStyle = 'rgba(0,0,0,0.08)'; for (let i = -2; i <= 2; i++) c.fillRect(x + i * w / 6 - 2, y - h, 4, h);
  c.fillStyle = col;
  if (capital === 'lotus') { c.beginPath(); c.moveTo(x - w * 0.5, y - h); c.lineTo(x - w * 0.9, y - h - w * 0.8); c.lineTo(x + w * 0.9, y - h - w * 0.8); c.lineTo(x + w * 0.5, y - h); c.fill(); c.fillStyle = '#2f7fc1'; c.fillRect(x - w * 0.55, y - h - 16, w * 1.1, 10); }
  else { c.fillRect(x - w * 0.75, y - h - 26, w * 1.5, 26); c.fillRect(x - w * 0.65, y - 20, w * 1.3, 20); }
}
function bricks(c, x0, y0, x1, y1, bw, bh, col, mortar) {
  c.fillStyle = mortar; c.fillRect(x0, y0, x1 - x0, y1 - y0);
  for (let y = y0, r = 0; y < y1; y += bh, r++) for (let x = x0 - (r % 2) * bw / 2; x < x1; x += bw) { c.fillStyle = col(r, x); c.fillRect(x + 3, y + 3, bw - 6, bh - 6); }
}
function noiseDots(c, n, col, seed, x0 = 0, y0 = 0, x1 = W, y1 = H, r = 3) { c.fillStyle = col; for (let i = 0; i < n; i++) { c.beginPath(); c.arc(lerp(x0, x1, rnd(i, seed)), lerp(y0, y1, rnd(i, seed + 1)), r * (0.5 + rnd(i, seed + 2)), 0, TAU); c.fill(); } }
function floorPersp(c, y, col1, col2, lines = 14) { c.fillStyle = grad(c, [[0, col1], [1, col2]], 0, y, 0, H); c.fillRect(0, y, W, H - y); c.strokeStyle = 'rgba(0,0,0,0.12)'; c.lineWidth = 2; for (let i = -lines; i <= lines; i++) { c.beginPath(); c.moveTo(W / 2 + i * 60, y); c.lineTo(W / 2 + i * 260, H); c.stroke(); } for (let k = 1; k < 8; k++) { const yy = y + (H - y) * Math.pow(k / 8, 1.6); c.beginPath(); c.moveTo(0, yy); c.lineTo(W, yy); c.stroke(); } }
function torchGlow(c, x, y) { glow(c, x, y, 260, 'rgba(255,170,70,0.45)'); c.fillStyle = '#5a3a1a'; c.fillRect(x - 8, y, 16, 60); c.fillStyle = '#ffb22e'; c.beginPath(); c.ellipse(x, y - 10, 16, 30, 0, 0, TAU); c.fill(); c.fillStyle = '#fff1a8'; c.beginPath(); c.ellipse(x, y - 4, 7, 14, 0, 0, TAU); c.fill(); }

// ---- solid / radial backdrops (reference: colored gradient cards) ----
const voids = { black: ['#2a2a2e', '#000'], purple: ['#7a2cff', '#16003d'], red: ['#b3121b', '#2a0003'], green: ['#1f9a3a', '#03240c'], blue: ['#1e5bd6', '#020b3a'], gold: ['#e3a21a', '#4a2a00'], teal: ['#14a3a3', '#012a2e'], pink: ['#ff5fa2', '#4a0024'], navy: ['#2a3a8a', '#05071c'], brown: ['#8a5a2b', '#1e0f04'], white: ['#ffffff', '#cfd6dd'] };
for (const k in voids) BGS['v_' + k] = c => { c.fillStyle = radial(c, W / 2, H / 2, 50, W * 0.7, [[0, voids[k][0]], [1, voids[k][1]]]); c.fillRect(0, 0, W, H); return 0; };

BGS.clinic = c => {
  c.fillStyle = '#cfe6dc'; c.fillRect(0, 0, W, H);
  c.fillStyle = '#b9d8cb'; c.fillRect(0, 620, W, 120);
  c.fillStyle = '#9fc4b5'; c.fillRect(0, 612, W, 10);
  floorPersp(c, 740, '#d9d4c7', '#a9a294', 0);
  c.fillStyle = 'rgba(0,0,0,0.06)'; for (let x = 0; x < W; x += 120) c.fillRect(x, 740, 3, 340);
  // door
  c.fillStyle = '#9a7a55'; c.fillRect(1420, 200, 300, 540); c.fillStyle = '#7d6040'; c.fillRect(1440, 220, 260, 520); c.fillStyle = '#d9c3a0'; c.beginPath(); c.arc(1670, 480, 14, 0, TAU); c.fill();
  c.fillStyle = '#e8f4ff'; c.fillRect(1500, 260, 140, 100);
  // poster
  c.fillStyle = '#fff'; c.fillRect(280, 200, 260, 340); c.fillStyle = '#e0626a'; c.beginPath(); c.arc(410, 330, 70, 0, TAU); c.fill(); c.fillStyle = '#fff'; c.fillRect(398, 280, 24, 100); c.fillRect(360, 318, 100, 24);
  c.fillStyle = '#555'; for (let i = 0; i < 4; i++) c.fillRect(310, 430 + i * 22, 200 - i * 30, 8);
  // clock
  c.fillStyle = '#fff'; c.beginPath(); c.arc(960, 220, 80, 0, TAU); c.fill(); c.lineWidth = 10; c.strokeStyle = '#333'; c.stroke();
  c.lineWidth = 8; c.beginPath(); c.moveTo(960, 220); c.lineTo(960, 160); c.moveTo(960, 220); c.lineTo(1005, 240); c.stroke();
  // chairs
  for (let i = 0; i < 4; i++) { const x = 160 + i * 170; c.fillStyle = '#5a7f9a'; c.fillRect(x, 700, 130, 26); c.fillRect(x, 600, 22, 110); c.fillStyle = '#3e5a6e'; c.fillRect(x + 10, 726, 10, 70); c.fillRect(x + 110, 726, 10, 70); }
  c.fillStyle = '#3c8d5a'; c.beginPath(); c.ellipse(1280, 640, 60, 90, 0, 0, TAU); c.fill(); c.fillStyle = '#b5651d'; c.fillRect(1250, 680, 60, 70);
  return 3;
};
BGS.cave = c => {
  c.fillStyle = '#1a120d'; c.fillRect(0, 0, W, H);
  c.fillStyle = radial(c, 960, 760, 50, 1100, [[0, '#a85a22'], [0.35, '#5a2e14'], [1, '#120a06']]); c.fillRect(0, 0, W, H);
  c.fillStyle = 'rgba(20,10,5,0.85)';
  trace(c, [[0, 0], [W, 0], [W, 300], [1700, 220], [1500, 140], [1200, 120], [900, 160], [600, 110], [300, 180], [0, 260]], true); c.fill();
  trace(c, [[0, 260], [180, 400], [140, 700], [0, 900]], true); c.fill();
  trace(c, [[W, 300], [1760, 460], [1820, 760], [W, 900]], true); c.fill();
  // cave paintings
  c.strokeStyle = 'rgba(200,90,40,0.55)'; c.lineWidth = 8; c.lineCap = 'round';
  for (const [x, y] of [[520, 330], [1280, 300]]) { c.beginPath(); c.ellipse(x, y, 60, 30, 0, 0, TAU); c.moveTo(x - 40, y + 20); c.lineTo(x - 50, y + 70); c.moveTo(x + 40, y + 20); c.lineTo(x + 46, y + 70); c.moveTo(x + 55, y - 10); c.lineTo(x + 90, y - 40); c.stroke(); }
  c.fillStyle = 'rgba(220,120,60,0.45)'; for (const [x, y] of [[760, 260], [800, 250], [1500, 360]]) { c.beginPath(); c.arc(x, y, 22, 0, TAU); c.fill(); }
  c.fillStyle = '#2a1a10'; c.fillRect(0, 860, W, 220);
  c.fillStyle = 'rgba(160,80,30,0.3)'; c.beginPath(); c.ellipse(960, 880, 700, 60, 0, 0, TAU); c.fill();
  return 4;
};
BGS.desert = c => {
  sky(c, '#f3a24a', '#ffe0a3', 700);
  c.fillStyle = '#c99a58'; c.fillRect(0, 640, W, 440);
  c.fillStyle = 'rgba(255,240,200,0.9)'; c.beginPath(); c.arc(1500, 250, 90, 0, TAU); c.fill(); glow(c, 1500, 250, 400, 'rgba(255,230,160,0.6)');
  // pyramids
  const pyr = (x, base, h, l, d) => { c.fillStyle = l; c.beginPath(); c.moveTo(x - base / 2, 640); c.lineTo(x, 640 - h); c.lineTo(x + base * 0.1, 640); c.fill(); c.fillStyle = d; c.beginPath(); c.moveTo(x + base * 0.1, 640); c.lineTo(x, 640 - h); c.lineTo(x + base / 2, 640); c.fill(); };
  pyr(560, 640, 380, '#e2b46d', '#b8864a'); pyr(1000, 480, 300, '#dcae66', '#b07d42'); pyr(1280, 300, 190, '#d8a964', '#a87842');
  hills(c, 640, 30, '#e8c27c', 1.2, 3);
  c.fillStyle = '#3d8fb8'; trace(c, [[0, 760], [500, 720], [1100, 740], [1500, 700], [W, 720], [W, 800], [1400, 790], [900, 820], [300, 800], [0, 830]], true); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.3)'; for (let i = 0; i < 18; i++) c.fillRect(rr(i, 0, W), rr(i + 9, 730, 800), rr(i + 4, 40, 120), 4);
  hills(c, 860, 20, '#d9b16e', 3.1, 2);
  c.fillStyle = '#c99a58'; c.fillRect(0, 900, W, 180);
  palm(c, 180, 820, 0.8); palm(c, 1760, 840, 0.9); palm(c, 1640, 800, 0.6);
  return 3;
};
BGS.palace = c => {
  c.fillStyle = grad(c, [[0, '#caa06a'], [1, '#8a6235']]); c.fillRect(0, 0, W, H);
  c.fillStyle = '#e0bb80'; c.fillRect(0, 0, W, 150);
  c.fillStyle = '#2f7fc1'; c.fillRect(0, 150, W, 20); c.fillStyle = '#c0392b'; c.fillRect(0, 170, W, 12); c.fillStyle = '#e2b13c'; c.fillRect(0, 182, W, 10);
  c.fillStyle = 'rgba(60,40,15,0.5)'; for (let k = 0; k < 40; k++) glyph(c, 40 + k * 48, 90, k * 13, 16);
  for (const x of [200, 560, 1360, 1720]) column(c, x, 860, 120, 680, '#e6c28c', 'rgba(0,0,0,0.15)', 'lotus');
  c.fillStyle = 'rgba(60,40,15,0.4)'; for (let r = 0; r < 6; r++) for (let k = 0; k < 9; k++) glyph(c, 760 + k * 50, 330 + r * 60, r * 9 + k, 18);
  torchGlow(c, 380, 420); torchGlow(c, 1540, 420);
  floorPersp(c, 860, '#b88a4e', '#6b4a24', 0);
  return 3;
};
BGS.tomb = c => {
  c.fillStyle = grad(c, [[0, '#6a5034'], [1, '#2a1c10']]); c.fillRect(0, 0, W, H);
  bricks(c, 0, 0, W, 900, 240, 110, (r, x) => `hsl(32,${30 + (rnd(r, x) * 10)}%,${30 + rnd(x, r) * 8}%)`, '#2a1c10');
  glow(c, 960, 500, 800, 'rgba(255,190,110,0.35)');
  floorPersp(c, 900, '#4a3520', '#1e140a', 0);
  return 4;
};
BGS.parchment = c => {
  c.fillStyle = '#ead7a8'; c.fillRect(0, 0, W, H);
  c.fillStyle = radial(c, W / 2, H / 2, 200, W * 0.75, [[0, 'rgba(255,250,230,0.5)'], [1, 'rgba(120,80,30,0.45)']]); c.fillRect(0, 0, W, H);
  c.fillStyle = 'rgba(120,80,30,0.08)'; for (let x = 0; x < W; x += 26) c.fillRect(x + rnd(x) * 6, 0, 3, H);
  return 0;
};
BGS.market = c => {
  sky(c, '#7ec4ef', '#f6e0b5', 680);
  c.fillStyle = '#c9a77a'; c.fillRect(0, 660, W, 420);
  // ziggurat
  c.fillStyle = '#c9a073'; for (let i = 0; i < 4; i++) { const w = 760 - i * 160, h = 90; c.fillRect(960 - w / 2, 560 - i * h - h, w, h); c.fillStyle = i % 2 ? '#c9a073' : '#b88f62'; }
  c.fillStyle = '#5a3f26'; c.fillRect(940, 230, 40, 330);
  c.fillStyle = '#d8b88a'; c.fillRect(0, 520, W, 160);
  // blue glazed gate band
  c.fillStyle = '#1f5fa8'; c.fillRect(0, 560, W, 60); c.fillStyle = '#f1c40f'; for (let x = 30; x < W; x += 120) { c.beginPath(); c.arc(x, 590, 14, 0, TAU); c.fill(); }
  // stalls
  const stall = (x, col) => { c.fillStyle = '#7a5230'; c.fillRect(x - 130, 650, 12, 200); c.fillRect(x + 118, 650, 12, 200); c.fillStyle = col; c.beginPath(); c.moveTo(x - 160, 650); c.lineTo(x + 160, 650); c.lineTo(x + 140, 600); c.lineTo(x - 140, 600); c.fill(); for (let k = -140; k < 140; k += 40) { c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(x + k, 602, 20, 46); } c.fillStyle = '#a0703c'; c.fillRect(x - 140, 780, 280, 60); for (let k = 0; k < 6; k++) { c.fillStyle = ['#e74c3c', '#f39c12', '#27ae60', '#8e44ad'][k % 4]; c.beginPath(); c.arc(x - 110 + k * 44, 772, 18, 0, TAU); c.fill(); } };
  stall(260, '#c0392b'); stall(1660, '#2e86c1');
  palm(c, 620, 700, 0.55); palm(c, 1320, 690, 0.6);
  c.fillStyle = '#c9a77a'; c.fillRect(0, 840, W, 240);
  noiseDots(c, 300, 'rgba(120,90,50,0.25)', 3, 0, 850, W, H, 3);
  return 3;
};
BGS.throne = c => {
  c.fillStyle = grad(c, [[0, '#2a1f3a'], [1, '#0d0914']]); c.fillRect(0, 0, W, H);
  bricks(c, 0, 0, W, 860, 160, 80, (r, x) => (r % 4 === 2 ? '#1f4f9a' : `hsl(260,15%,${18 + rnd(r, x) * 6}%)`), '#120c1a');
  c.fillStyle = '#f1c40f'; for (let x = 60; x < W; x += 160) { c.beginPath(); c.arc(x, 240 + 40, 16, 0, TAU); c.fill(); }
  glow(c, 960, 420, 700, 'rgba(255,200,120,0.25)');
  torchGlow(c, 300, 380); torchGlow(c, 1620, 380);
  floorPersp(c, 860, '#3a2a20', '#120c08', 0);
  c.fillStyle = '#7a1f1f'; c.beginPath(); c.moveTo(860, 860); c.lineTo(1060, 860); c.lineTo(1260, H); c.lineTo(660, H); c.fill();
  return 3;
};
BGS.surgery = c => {
  c.fillStyle = grad(c, [[0, '#4a3826'], [1, '#1c140c']]); c.fillRect(0, 0, W, H);
  bricks(c, 0, 0, W, 820, 200, 90, (r, x) => `hsl(30,25%,${22 + rnd(r, x) * 6}%)`, '#16100a');
  for (const x of [320, 1600]) { glow(c, x, 360, 360, 'rgba(255,170,70,0.4)'); c.fillStyle = '#5a3a1a'; c.fillRect(x - 60, 400, 120, 20); c.fillStyle = '#ffb22e'; c.beginPath(); c.ellipse(x + 40, 380, 10, 22, 0, 0, TAU); c.fill(); }
  c.fillStyle = 'rgba(140,100,60,0.6)'; for (let i = 0; i < 8; i++) { c.fillRect(700 + i * 70, 260, 40, 60); }
  floorPersp(c, 820, '#3a2c1e', '#120c06', 0);
  return 4;
};
BGS.sanctuary = c => {
  sky(c, '#6db6ef', '#dff1ff', 700);
  cloud(c, 300, 180, 1.1); cloud(c, 1400, 140, 0.9); cloud(c, 980, 260, 0.6, 'rgba(255,255,255,0.7)');
  hills(c, 560, 120, '#7aa66a', 0.5, 2); hills(c, 640, 70, '#5f8f52', 2.2, 3);
  // temple
  c.save(); c.translate(1260, 640); c.fillStyle = '#efe8da'; c.beginPath(); c.moveTo(-300, -330); c.lineTo(0, -440); c.lineTo(300, -330); c.fill(); c.fillStyle = '#e2d9c6'; c.fillRect(-310, -340, 620, 34); for (let i = 0; i < 7; i++) { c.fillStyle = '#f4efe4'; c.fillRect(-270 + i * 90 - 18, -306, 36, 290); c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(-270 + i * 90 + 4, -306, 12, 290); } c.fillStyle = '#d9cfba'; c.fillRect(-330, -18, 660, 30); c.restore();
  for (const [x, s] of [[200, 1], [330, 0.8], [1700, 0.9]]) { c.fillStyle = '#2f5a2a'; c.beginPath(); c.ellipse(x, 640 - 160 * s, 46 * s, 190 * s, 0, 0, TAU); c.fill(); }
  c.fillStyle = '#d6c8a6'; c.fillRect(0, 660, W, 420);
  c.fillStyle = 'rgba(0,0,0,0.06)'; for (let r = 0; r < 6; r++) for (let x = (r % 2) * 90; x < W; x += 180) c.fillRect(x, 680 + r * 70, 170, 4);
  return 3;
};
BGS.abaton = c => {
  c.fillStyle = grad(c, [[0, '#0e1838'], [1, '#04060f']]); c.fillRect(0, 0, W, H);
  for (let i = 0; i < 7; i++) { const x = 140 + i * 280; c.fillStyle = 'rgba(160,190,255,0.10)'; c.beginPath(); c.moveTo(x + 40, 120); c.lineTo(x + 140, 120); c.lineTo(x + 260, 860); c.lineTo(x - 60, 860); c.fill(); }
  for (let i = 0; i < 8; i++) column(c, 60 + i * 280, 860, 70, 760, '#2a3354', 'rgba(0,0,0,0.3)');
  c.fillStyle = '#1c2340'; c.fillRect(0, 60, W, 70);
  floorPersp(c, 860, '#1d2440', '#070912', 0);
  for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(255,255,255,${0.2 + rnd(i) * 0.5})`; c.beginPath(); c.arc(rr(i, 0, W), rr(i + 3, 0, 60), 2, 0, TAU); c.fill(); }
  return 3;
};
BGS.rome = c => {
  sky(c, '#7cc0f0', '#eaf6ff', 720);
  cloud(c, 1500, 160, 1); cloud(c, 400, 120, 0.8);
  // buildings with red roofs
  const bld = (x, w, h, col) => { c.fillStyle = col; c.fillRect(x, 700 - h, w, h); c.fillStyle = '#b5482e'; c.beginPath(); c.moveTo(x - 20, 700 - h); c.lineTo(x + w / 2, 700 - h - 60); c.lineTo(x + w + 20, 700 - h); c.fill(); c.fillStyle = 'rgba(60,40,30,0.5)'; for (let k = 0; k < Math.floor(w / 70); k++) c.fillRect(x + 25 + k * 70, 700 - h + 50, 30, 50); };
  bld(40, 360, 280, '#e8c99a'); bld(1480, 400, 300, '#e3b98a'); bld(1100, 280, 220, '#efd6b0');
  // forum columns
  c.fillStyle = '#efe8da'; c.fillRect(560, 300, 560, 40); c.beginPath(); c.moveTo(540, 300); c.lineTo(840, 210); c.lineTo(1140, 300); c.fill();
  for (let i = 0; i < 6; i++) column(c, 600 + i * 96, 700, 44, 360, '#f4efe4');
  c.fillStyle = '#cfc4ae'; c.fillRect(0, 700, W, 380);
  c.fillStyle = 'rgba(0,0,0,0.08)'; for (let r = 0; r < 8; r++) for (let x = (r % 2) * 60; x < W; x += 120) c.fillRect(x, 710 + r * 46, 112, 40);
  return 3;
};
BGS.farm = c => {
  sky(c, '#88c9f2', '#fdf3d6', 640);
  cloud(c, 1300, 150, 0.9); cloud(c, 300, 200, 0.7);
  hills(c, 520, 90, '#8fb55a', 1.1, 2);
  c.fillStyle = '#efe0c2'; c.fillRect(1320, 330, 360, 200); c.fillStyle = '#b5482e'; c.beginPath(); c.moveTo(1300, 330); c.lineTo(1500, 250); c.lineTo(1700, 330); c.fill();
  c.fillStyle = '#6a8a3a'; c.fillRect(0, 560, W, 520);
  for (let r = 0; r < 7; r++) for (let k = 0; k < 16; k++) { const y = 600 + r * r * 12 + r * 30, x = k * 130 + (r % 2) * 65; const s = 0.4 + r * 0.12; c.fillStyle = '#4f8f2a'; c.beginPath(); c.arc(x, y, 34 * s, 0, TAU); c.fill(); c.fillStyle = '#86c94a'; c.beginPath(); c.arc(x - 6 * s, y - 6 * s, 22 * s, 0, TAU); c.fill(); }
  return 3;
};
BGS.curia = c => {
  c.fillStyle = grad(c, [[0, '#d9c7a3'], [1, '#8a7652']]); c.fillRect(0, 0, W, H);
  for (let i = 0; i < 6; i++) column(c, 160 + i * 320, 800, 90, 700, '#efe6d4');
  c.fillStyle = '#7a1f3d'; c.fillRect(0, 80, W, 40);
  floorPersp(c, 800, '#a6916a', '#4a3c26', 0);
  for (let r = 0; r < 3; r++) { c.fillStyle = `hsl(30,20%,${50 - r * 8}%)`; c.fillRect(0, 760 + r * 60, W, 40); }
  return 4;
};
BGS.tiber = c => {
  sky(c, '#f5b06a', '#ffe7c4', 640);
  glow(c, 300, 300, 500, 'rgba(255,220,160,0.6)');
  hills(c, 520, 70, '#b88a5a', 0.4, 3);
  c.fillStyle = '#c99a6a'; for (let i = 0; i < 8; i++) c.fillRect(100 + i * 230, 470 - rnd(i) * 80, 160, 100 + rnd(i) * 80);
  c.fillStyle = grad(c, [[0, '#4f8fb0'], [1, '#1f4f6a']], 0, 560, 0, H); c.fillRect(0, 560, W, 520);
  c.fillStyle = 'rgba(255,255,255,0.25)'; for (let i = 0; i < 40; i++) c.fillRect(rr(i, 0, W), rr(i + 5, 590, H), rr(i + 2, 40, 140), 4);
  return 3;
};
BGS.street = c => {
  sky(c, '#1b2a4a', '#4a5a8a', 680);
  for (let i = 0; i < 9; i++) { const x = i * 230, h = 260 + rnd(i) * 280; c.fillStyle = `hsl(225,20%,${18 + rnd(i, 3) * 8}%)`; c.fillRect(x, 640 - h, 210, h); c.fillStyle = 'rgba(255,220,130,0.6)'; for (let r = 0; r < h / 50 - 1; r++) for (let k = 0; k < 4; k++) if (rnd(i * 31 + r, k) > 0.45) c.fillRect(x + 20 + k * 48, 640 - h + 20 + r * 50, 26, 28); }
  c.fillStyle = '#3a3f4a'; c.fillRect(0, 640, W, 100); c.fillStyle = '#2a2d33'; c.fillRect(0, 740, W, 340);
  c.fillStyle = '#e8e8e8'; for (let x = 0; x < W; x += 200) c.fillRect(x, 900, 110, 12);
  return 3;
};
BGS.sky = c => { sky(c, '#3d8be0', '#cfe8ff', H); for (let i = 0; i < 9; i++) cloud(c, rr(i, -100, W), rr(i + 7, 80, 1000), 0.8 + rnd(i) * 1.2, 'rgba(255,255,255,0.85)'); return 6; };
BGS.dream = c => {
  c.fillStyle = radial(c, W / 2, H / 2, 50, W * 0.7, [[0, '#c48bff'], [0.6, '#5a2aa8'], [1, '#1a0840']]); c.fillRect(0, 0, W, H);
  c.strokeStyle = 'rgba(255,255,255,0.12)'; c.lineWidth = 30; for (let r = 120; r < 1400; r += 120) { c.beginPath(); c.arc(W / 2, H / 2, r, r * 0.01, r * 0.01 + 4.2); c.stroke(); }
  for (let i = 0; i < 80; i++) { c.fillStyle = `rgba(255,255,255,${0.3 + rnd(i) * 0.6})`; c.beginPath(); c.arc(rr(i, 0, W), rr(i + 1, 0, H), 1 + rnd(i, 2) * 3, 0, TAU); c.fill(); }
  return 2;
};
BGS.study = c => {
  c.fillStyle = grad(c, [[0, '#5a4026'], [1, '#22170c']]); c.fillRect(0, 0, W, H);
  for (let s = 0; s < 4; s++) { c.fillStyle = '#3a2614'; c.fillRect(100, 140 + s * 170, 700, 18); for (let k = 0; k < 9; k++) { c.fillStyle = ['#e8d7a8', '#d9c48f', '#f0e2bc'][k % 3]; c.beginPath(); c.ellipse(140 + k * 72, 120 + s * 170, 30, 30, 0, 0, TAU); c.fill(); c.fillStyle = '#7a5230'; c.beginPath(); c.arc(140 + k * 72, 120 + s * 170, 10, 0, TAU); c.fill(); } }
  glow(c, 1400, 500, 500, 'rgba(255,190,100,0.35)');
  c.fillStyle = '#4a3220'; c.fillRect(0, 860, W, 220);
  return 4;
};
BGS.waves = c => { sky(c, '#7cc0f0', '#d6eefc', 600); c.fillStyle = grad(c, [[0, '#2f7fb8'], [1, '#0d3a5c']], 0, 520, 0, H); c.fillRect(0, 520, W, 560); c.fillStyle = 'rgba(255,255,255,0.35)'; for (let i = 0; i < 50; i++) c.fillRect(rr(i, 0, W), rr(i + 1, 540, H), rr(i + 2, 30, 120), 5); cloud(c, 400, 160, 1); cloud(c, 1500, 220, 0.8); return 3; };
BGS.plague = c => { c.fillStyle = grad(c, [[0, '#3a4a2a'], [1, '#0e140a']]); c.fillRect(0, 0, W, H); c.fillStyle = 'rgba(160,200,90,0.12)'; for (let i = 0; i < 12; i++) { c.beginPath(); c.ellipse(rr(i, 0, W), rr(i + 1, 200, 900), 300, 80, 0, 0, TAU); c.fill(); } c.fillStyle = '#1a2010'; for (let i = 0; i < 9; i++) { const x = i * 230, h = 200 + rnd(i) * 200; c.fillRect(x, 700 - h, 200, h); c.beginPath(); c.moveTo(x - 10, 700 - h); c.lineTo(x + 100, 640 - h); c.lineTo(x + 210, 700 - h); c.fill(); } c.fillStyle = '#20281a'; c.fillRect(0, 700, W, 380); return 3; };

// ---- maps (simplified real coastlines; lon/lat projected) ----
const medP = (lon, lat) => [(lon + 10) * 32, (48 - lat) * 40];
const frP = (lon, lat) => [(lon + 4.8) * 75 + 470, (51.3 - lat) * 108 + 60];
const COAST = {
  med: [[-5.6, 36.0], [-4.4, 36.7], [-2.2, 36.7], [-1, 37.6], [-0.4, 39.5], [0.9, 40.8], [2.2, 41.4], [3.1, 42.4], [3.0, 42.9], [4.0, 43.5], [5.4, 43.3], [6.6, 43.2], [7.3, 43.7], [8.9, 44.4], [9.8, 44.1], [10.3, 43.5], [11.1, 42.4], [12.2, 41.8], [13.0, 41.25], [14.2, 40.8], [14.9, 40.3], [15.6, 40.0], [16.0, 39.0], [15.6, 37.95], [16.1, 38.0], [16.6, 38.5], [17.1, 39.0], [16.6, 40.0], [17.2, 40.45], [18.0, 40.1], [18.4, 39.8], [18.5, 40.15], [17.9, 40.65], [16.9, 41.1], [16.0, 41.4], [16.2, 41.9], [15.0, 42.0], [14.2, 42.5], [13.5, 43.6], [12.6, 44.1], [12.3, 45.4], [13.8, 45.6], [13.9, 44.8], [14.4, 45.3], [15.5, 44.0], [16.4, 43.5], [18.1, 42.6], [19.4, 41.3], [19.5, 40.4], [20.0, 39.7], [20.7, 39.0], [21.1, 38.3], [21.7, 38.3], [21.3, 37.6], [21.7, 36.8], [22.4, 36.4], [22.6, 36.9], [23.2, 36.45], [22.9, 37.5], [23.7, 37.9], [24.0, 37.65], [24.3, 38.3], [23.2, 38.9], [22.9, 39.3], [22.6, 40.3], [22.9, 40.6], [23.8, 40.0], [24.4, 40.9], [25.9, 40.85], [26.4, 40.1], [26.2, 39.5], [27.1, 38.4], [27.3, 37.4], [27.4, 37.0], [28.3, 36.8], [29.5, 36.2], [30.7, 36.9], [32.0, 36.5], [32.8, 36.0], [34.6, 36.8], [36.1, 36.6], [35.8, 35.5], [35.9, 34.9], [35.5, 33.9], [35.0, 32.8], [34.4, 31.5], [33.5, 31.1], [32.3, 31.3], [31.0, 31.6], [29.9, 31.2], [27.2, 31.4], [25.2, 31.6], [24.0, 32.1], [22.0, 32.9], [20.1, 32.1], [19.0, 30.4], [17.0, 31.2], [15.1, 32.4], [13.2, 32.9], [11.0, 33.7], [10.1, 33.9], [10.8, 34.7], [10.6, 35.8], [10.5, 36.4], [11.0, 37.0], [9.9, 37.3], [7.8, 36.9], [5.1, 36.7], [3.0, 36.8], [-0.6, 35.7], [-2.9, 35.3], [-4.0, 35.2], [-5.3, 35.9]],
  atl: [[-12, 49], [-4.6, 48.4], [-2.1, 47.2], [-1.2, 46.0], [-1.2, 44.6], [-1.6, 43.4], [-3.8, 43.5], [-8.0, 43.7], [-9.3, 43.0], [-8.8, 41.0], [-9.2, 38.7], [-9.0, 37.0], [-6.3, 36.8], [-5.6, 36.0], [-5.9, 35.8], [-6.0, 35.5], [-6.8, 34.0], [-7.6, 33.6], [-9.6, 32.3], [-9.8, 30.4], [-10.5, 28.5], [-12, 20]],
  black: [[29.0, 41.1], [28.0, 41.6], [27.5, 42.5], [28.0, 43.2], [28.6, 44.2], [29.7, 45.2], [30.7, 46.5], [31.8, 46.6], [32.6, 46.0], [33.5, 45.2], [32.5, 44.5], [33.5, 44.4], [34.5, 44.8], [36.6, 45.2], [37.8, 44.7], [39.7, 43.6], [41.6, 41.6], [39.7, 41.0], [37.5, 41.1], [35.1, 42.0], [33.3, 42.0], [31.5, 41.3]],
  red: [[32.5, 30.0], [33.0, 28.6], [33.9, 27.3], [34.6, 26.1], [35.5, 24.0], [36.9, 22.0], [37.3, 20.0], [40.0, 20.0], [39.2, 21.5], [38.5, 23.6], [37.5, 25.0], [36.6, 26.5], [35.2, 28.0], [34.9, 29.5], [34.5, 28.3], [34.2, 27.8], [33.6, 28.3], [32.7, 29.6]],
  gulf: [[47.9, 30.0], [48.6, 30.0], [49.5, 29.9], [50.4, 29.2], [51.5, 27.5], [52, 25], [52, 20], [51, 20], [50.2, 25.5], [49.6, 26.8], [48.5, 28.0], [48.0, 29.3]],
  caspian: [[47.0, 44.5], [47.5, 43.0], [48.5, 41.8], [49.2, 40.5], [49.0, 38.8], [49.0, 37.5], [51.0, 36.8], [53.0, 37.0], [53.0, 45.0], [50.0, 46.5]],
};
const ISLES = {
  sicily: [[12.4, 37.8], [13.4, 38.2], [15.6, 38.3], [15.1, 37.3], [15.1, 36.7], [14.4, 36.8], [12.6, 37.6]],
  sardinia: [[8.4, 41.1], [9.6, 41.0], [9.8, 40.0], [9.6, 39.1], [8.5, 38.9], [8.4, 39.9]],
  corsica: [[9.4, 43.0], [9.6, 42.3], [9.2, 41.4], [8.6, 41.9], [8.6, 42.6]],
  crete: [[23.5, 35.6], [26.3, 35.3], [26.1, 35.0], [24.7, 34.9], [23.5, 35.2]],
  cyprus: [[32.3, 35.1], [34.6, 35.7], [34.0, 35.0], [33.0, 34.6], [32.4, 34.7]],
  mallorca: [[2.4, 39.6], [3.4, 39.8], [3.2, 39.3], [2.6, 39.4]],
  euboea: [[22.9, 38.9], [24.2, 38.2], [24.6, 38.1], [23.4, 38.7]],
};
const RIVERS = {
  nile: [[31.0, 31.3], [31.2, 30.1], [31.3, 29.0], [30.8, 28.0], [31.3, 27.0], [32.7, 25.8], [32.9, 24.1], [33.0, 22.0], [31.5, 21.0], [31.0, 19.0]],
  euph: [[38.8, 38.9], [38.0, 36.8], [40.1, 35.3], [42.0, 34.4], [43.3, 33.4], [44.4, 32.5], [46.0, 31.0], [47.5, 30.5], [48.0, 30.0]],
  tigris: [[40.2, 38.2], [42.0, 37.1], [43.1, 36.3], [43.7, 34.5], [44.4, 33.3], [45.8, 32.2], [47.2, 31.0], [47.5, 30.5]],
  tiber: [[12.2, 41.75], [12.5, 41.9], [12.6, 42.4], [12.4, 43.0]],
};
const PLACES = { egypt: [31.1, 30.0], giza: [31.13, 29.98], babylon: [44.42, 32.54], epidaurus: [23.08, 37.6], athens: [23.73, 37.98], rome: [12.5, 41.9], france: [5.0, 46.5] };
function drawMed(c) {
  c.fillStyle = '#efc65a'; c.fillRect(0, 0, W, H);
  c.fillStyle = 'rgba(160,120,40,0.10)'; for (let i = 0; i < 260; i++) { c.beginPath(); c.arc(rr(i, 0, W), rr(i + 1, 0, H), 4 + rnd(i) * 10, 0, TAU); c.fill(); }
  for (const k in COAST) shp(c, COAST[k].map(p => medP(p[0], p[1])), { fill: '#2f8fd8', lw: 9, seed: 7, amp: 0 });
  c.save(); c.globalAlpha = 0.18; c.strokeStyle = '#fff'; c.lineWidth = 3;
  for (const k in COAST) { trace(c, COAST[k].map(p => medP(p[0], p[1])), true); c.save(); c.clip(); for (let y = 20; y < H; y += 46) { c.beginPath(); for (let x = 0; x <= W; x += 30) c.lineTo(x, y + Math.sin(x * 0.02 + y) * 5); c.stroke(); } c.restore(); }
  c.restore();
  for (const k in ISLES) shp(c, ISLES[k].map(p => medP(p[0], p[1])), { fill: '#efc65a', lw: 7, seed: 8, amp: 0 });
  for (const k in RIVERS) line(c, RIVERS[k].map(p => medP(p[0], p[1])), { lw: k === 'tiber' ? 5 : 8, stroke: '#2f8fd8', amp: 0 });
}
BGS.map_med = c => { drawMed(c); return 0; };
BGS.map_france = c => {
  c.fillStyle = '#e8d9a6'; c.fillRect(0, 0, W, H);
  const FR = [[2.4, 51.05], [4.2, 50.0], [5.9, 49.5], [6.4, 49.45], [8.2, 49.0], [7.6, 47.6], [6.9, 47.4], [6.1, 46.15], [7.0, 45.9], [6.6, 45.1], [7.0, 44.2], [7.5, 43.8], [7.2, 43.7], [5.9, 43.1], [5.3, 43.3], [4.6, 43.4], [3.9, 43.5], [3.1, 42.9], [3.15, 42.43], [1.4, 42.6], [-0.6, 42.8], [-1.8, 43.35], [-1.55, 43.5], [-1.25, 44.65], [-1.2, 45.8], [-1.15, 46.15], [-2.1, 46.8], [-2.2, 47.3], [-3.0, 47.5], [-3.4, 47.75], [-4.4, 47.9], [-4.6, 48.4], [-3.5, 48.8], [-2.0, 48.65], [-1.6, 48.8], [-1.9, 49.7], [-1.2, 49.4], [0.1, 49.5], [1.4, 50.1], [1.6, 50.7], [1.85, 50.95]];
  const westCoast = FR.slice(21).reverse();
  const atl = [[-12, 41.5], [-8.0, 43.7], [-3.8, 43.5], ...FR.slice(21).concat([[2.4, 51.05]]), [3.2, 51.35], [4.5, 52.0], [4.5, 54], [1.6, 54], [1.7, 52.6], [1.4, 51.4], [0.2, 50.8], [-1.4, 50.8], [-3.5, 50.4], [-5.7, 50.0], [-12, 50.2]];
  const med = [[3.15, 42.43], [3.1, 42.9], [3.9, 43.5], [4.6, 43.4], [5.3, 43.3], [5.9, 43.1], [7.2, 43.7], [7.5, 43.8], [8.9, 44.4], [10.0, 44.0], [10.5, 43.0], [11.5, 42.0], [12.5, 39.0], [1.0, 39.0], [0.9, 40.8], [2.2, 41.4], [3.2, 42.1]];
  for (const w of [atl, med]) shp(c, w.map(p => frP(p[0], p[1])), { fill: '#2f8fd8', lw: 9, seed: 4, amp: 0 });
  shp(c, FR.map(p => frP(p[0], p[1])), { fill: '#7bc96f', lw: 10, seed: 3, amp: 0 });
  c.save(); trace(c, FR.map(p => frP(p[0], p[1])), true); c.clip(); c.fillStyle = 'rgba(40,90,40,0.15)'; for (let i = 0; i < 160; i++) { const p = frP(rr(i, -5, 9), rr(i + 1, 42, 51)); c.beginPath(); c.arc(p[0], p[1], 6 + rnd(i) * 10, 0, TAU); c.fill(); } c.restore();
  return 0;
};
window.BGS = BGS;

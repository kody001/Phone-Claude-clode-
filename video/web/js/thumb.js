// YouTube thumbnails (1280x720 logical, rendered at 2x) built from the video's own characters and sets.
// Usage: /web/thumb.html?n=1|2|3   ->  window.thumbReady once drawn.
import * as THREE from 'three';
import { makeCast } from './chars.js';
import * as SETS from './sets.js';
import { heart } from './overlay.js';

const Q = new URLSearchParams(location.search);
const N = +(Q.get('n') || 1);
const W = 1280, H = 720, PR = 2;
await Promise.all(['30px "Lilita One"', '700 30px Fredoka', '500 30px Fredoka'].map(f => document.fonts.load(f)));

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gl'), antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(PR); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
const uiCanvas = document.getElementById('ui'); uiCanvas.width = W * PR; uiCanvas.height = H * PR;
const c = uiCanvas.getContext('2d'); c.scale(PR, PR);

const cast = makeCast();
const camera = new THREE.PerspectiveCamera(40, W / H, 0.05, 200);
const T = 3.7; // fixed time (idle noise / breathing phase)

function place(scene, name, st) {
  const ch = cast[name]; scene.add(ch.root); ch.root.visible = true;
  ch.apply({ idle: 0, breathe: 0, blink: false, ...st }, T);
  ch.root.updateMatrixWorld(true);
  return ch;
}
function headScreen(name, up = 0) {
  const p = new THREE.Vector3(); cast[name].head.getWorldPosition(p); p.y += up; p.project(camera);
  return [(p.x * 0.5 + 0.5) * W, (-p.y * 0.5 + 0.5) * H];
}
function worldScreen(v) { const p = new THREE.Vector3(...v).project(camera); return [(p.x * 0.5 + 0.5) * W, (-p.y * 0.5 + 0.5) * H]; }

// ------------------------------------------------------------------ 2D graphics
function bigText(text, x, y, size, o = {}) {
  c.save(); c.translate(x, y); c.rotate(o.rot || 0);
  c.font = `${size}px "Lilita One"`; c.textAlign = o.align || 'left'; c.textBaseline = 'alphabetic';
  c.lineJoin = 'round'; c.miterLimit = 2;
  // drop shadow block
  c.fillStyle = 'rgba(10,4,30,0.55)'; c.fillText(text, size * 0.05, size * 0.07);
  c.strokeStyle = o.outline || '#120a26'; c.lineWidth = size * (o.ow ?? 0.2); c.strokeText(text, 0, 0);
  if (o.inner) { c.strokeStyle = o.inner; c.lineWidth = size * 0.07; c.strokeText(text, 0, 0); }
  if (o.grad) { const g = c.createLinearGradient(0, -size * 0.8, 0, size * 0.05); o.grad.forEach(([k, col]) => g.addColorStop(k, col)); c.fillStyle = g; }
  else c.fillStyle = o.fill || '#ffffff';
  c.fillText(text, 0, 0);
  c.restore();
}
function arrow(pts, o = {}) {
  // thick hand-drawn style arrow along a quadratic curve [x0,y0,cx,cy,x1,y1]
  const [x0, y0, cx, cy, x1, y1] = pts, w = o.w || 22, col = o.color || '#ff2d3d';
  const ang = Math.atan2(y1 - cy, x1 - cx), hl = w * 2.3;
  const ex = x1 - Math.cos(ang) * hl * 0.6, ey = y1 - Math.sin(ang) * hl * 0.6;
  const head = () => { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x1 - Math.cos(ang - 0.5) * hl, y1 - Math.sin(ang - 0.5) * hl); c.lineTo(x1 - Math.cos(ang + 0.5) * hl, y1 - Math.sin(ang + 0.5) * hl); c.closePath(); };
  c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
  for (const [lw, st] of [[w + 14, '#ffffff'], [w, col]]) {
    c.strokeStyle = st; c.lineWidth = lw; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(cx, cy, ex, ey); c.stroke();
    c.fillStyle = st; head(); if (lw > w) { c.lineWidth = 14; c.stroke(); } c.fill();
  }
  c.restore();
}
function ring(x, y, rx, ry, o = {}) {
  c.save(); c.translate(x, y); c.rotate(o.rot || -0.12);
  for (const [lw, st] of [[(o.w || 12) + 10, '#ffffff'], [o.w || 12, o.color || '#ff2d3d']]) { c.strokeStyle = st; c.lineWidth = lw; c.beginPath(); c.ellipse(0, 0, rx, ry, 0, 0.15, Math.PI * 2 + 0.05); c.stroke(); }
  c.restore();
}
function pill(text, x, y, o = {}) {
  c.save(); c.font = `${o.size || 40}px "Lilita One"`; const tw = c.measureText(text).width, ph = (o.size || 40) * 1.45, pw = tw + ph * 0.9 + (o.icon ? ph * 0.75 : 0);
  c.translate(x, y); c.rotate(o.rot || 0);
  c.fillStyle = 'rgba(10,4,30,0.45)'; rr(-pw / 2 + 5, -ph / 2 + 7, pw, ph, ph / 2); c.fill();
  c.fillStyle = '#120a26'; rr(-pw / 2 - 5, -ph / 2 - 5, pw + 10, ph + 10, ph / 2 + 5); c.fill();
  c.fillStyle = o.bg || '#ff2d3d'; rr(-pw / 2, -ph / 2, pw, ph, ph / 2); c.fill();
  let tx = -pw / 2 + ph * 0.45;
  if (o.icon === 'clock') { const r = ph * 0.3, cx = tx + r, cy = 0; c.strokeStyle = o.fg || '#fff'; c.lineWidth = 5; c.beginPath(); c.arc(cx, cy, r, 0, 7); c.stroke(); c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx, cy - r * 0.62); c.moveTo(cx, cy); c.lineTo(cx + r * 0.5, cy + r * 0.1); c.stroke(); tx += ph * 0.75; }
  c.fillStyle = o.fg || '#ffffff'; c.textBaseline = 'middle'; c.textAlign = 'left'; c.fillText(text, tx, ph * 0.04);
  c.restore();
}
function rr(x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
function bubble(text, x, y, tailTo, o = {}) {
  c.save(); c.font = `${o.size || 46}px "Lilita One"`; const tw = c.measureText(text).width, ph = (o.size || 46) * 1.7, pw = tw + 60;
  const bx = x - pw / 2, by = y - ph / 2;
  const path = () => { rr(bx, by, pw, ph, 28); c.moveTo(x - 30, by + ph - 2); c.lineTo(tailTo[0], tailTo[1]); c.lineTo(x + 10, by + ph - 2); };
  c.fillStyle = 'rgba(10,4,30,0.45)'; c.save(); c.translate(6, 8); path(); c.fill(); c.restore();
  c.lineJoin = 'round'; c.strokeStyle = '#120a26'; c.lineWidth = 12; path(); c.stroke();
  c.fillStyle = '#ffffff'; path(); c.fill();
  c.fillStyle = o.color || '#1d1240'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, x, y + 3);
  c.restore();
}
function burstLines(x, y, r0, r1, n, col, rot = 0) {
  c.save(); c.strokeStyle = col; c.lineCap = 'round';
  for (let i = 0; i < n; i++) { const a = rot + i / n * Math.PI * 2; c.lineWidth = 9; c.beginPath(); c.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); c.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); c.stroke(); }
  c.restore();
}
function vignette(strength = 0.55, col = '10,4,30') {
  const g = c.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95);
  g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(1, `rgba(${col},${strength})`); c.fillStyle = g; c.fillRect(0, 0, W, H);
}
function wavyText(text, x, y, size, o = {}) {
  // sound-effect lettering: each glyph bounces and tilts
  c.save(); c.font = `${size}px "Lilita One"`;
  let cx = x;
  [...text].forEach((ch, i) => {
    const w = c.measureText(ch).width; const dy = Math.sin(i * 1.3) * size * 0.1, r = 0;
    c.save(); c.translate(cx + w / 2, y + dy); c.rotate((o.rot || 0) + r); c.scale(1 + i * (o.grow || 0), 1 + i * (o.grow || 0));
    c.textAlign = 'center'; c.lineJoin = 'round';
    c.fillStyle = 'rgba(10,4,30,0.5)'; c.fillText(ch, size * 0.05, size * 0.07);
    c.strokeStyle = '#120a26'; c.lineWidth = size * 0.2; c.strokeText(ch, 0, 0);
    c.fillStyle = o.fill || '#ffd23a'; c.fillText(ch, 0, 0);
    c.restore();
    cx += w * (1 + i * (o.grow || 0)) * 1.04;
  });
  c.restore();
}

// ------------------------------------------------------------------ scenes
function render(scene, set, S) { set.update(T, S, camera); camera.updateProjectionMatrix(); renderer.render(scene, camera); }

if (N === 1) {
  // STUCK: cutaway of the shaft, car jammed between floors 6 and 7 on its cables, brakes glowing
  const set = SETS.buildShaft(); const scene = set.scene;
  const carY = set.FH * 6.45, fy = carY + 0.06;
  place(scene, 'you', { pos: [-0.5, fy, 0.3], rot: 0.2, pose: 'scared', expr: 'scared', head: { pitch: -0.08, roll: 0.06 } });
  place(scene, 'alex', { pos: [0.55, fy, 0.1], rot: -0.3, pose: 'handsFace', expr: 'shocked', head: { yaw: -0.12, pitch: -0.05 } });
  camera.fov = 40; camera.position.set(-0.15, carY + 0.75, 6.3); camera.lookAt(-1.3, carY + 1.72, 0);
  render(scene, set, { carY, brakeGlow: 1, cableHi: true });
  vignette(0.62);
  bigText('STUCK', 30, 200, 190, { grad: [[0, '#ffe066'], [1, '#ff8a1f']], rot: -0.05, ow: 0.17 });
  bigText('WITH MY', 44, 292, 80, { fill: '#ffffff', rot: -0.05 });
  bigText('CRUSH', 38, 408, 138, { grad: [[0, '#ff9fd0'], [1, '#ff3d8b']], rot: -0.05, ow: 0.18 });
  const [ax, ay] = headScreen('alex', 0.1);
  arrow([445, 330, ax - 170, ay - 235, ax - 70, ay - 40], { w: 20 });
}

if (N === 2) {
  // THE GROWL: mortified you, Alex pointing and losing it laughing
  const set = SETS.buildBuilding(); const scene = set.scene;
  place(scene, 'you', { pos: [0.3, 0, 0.32], rot: -0.18, pose: 'handsFace', expr: 'embarrassed', head: { pitch: 0.05, roll: -0.08 } });
  place(scene, 'alex', { pos: [-0.55, 0, -0.5], rot: 1.0, pose: 'point', expr: 'laugh', head: { roll: 0.16, pitch: -0.1, yaw: -0.6 } });
  camera.fov = 40; camera.position.set(-0.75, 1.42, 3.5); camera.lookAt(-0.62, 1.2, 0);
  render(scene, set, { door: 0, floor: '6', cutFront: true, light: 1 });
  vignette(0.5);
  const [sx, sy] = worldScreen([0.28, 0.9, 0.62]);
  burstLines(sx, sy, 128, 168, 12, '#ffd23a', 0.12);
  ring(sx, sy, 112, 88, { w: 13 });
  bigText('WORST', 34, 150, 128, { fill: '#ffffff', rot: -0.05 });
  bigText('TIMING', 30, 268, 128, { grad: [[0, '#ffe066'], [1, '#ff8a1f']], rot: -0.05 });
  bigText('EVER', 40, 380, 118, { grad: [[0, '#ff9fd0'], [1, '#ff3d8b']], rot: -0.05 });
  wavyText('GRRRWL!', 40, 560, 92, { fill: '#ffd23a' });
}

if (N === 3) {
  // THE CONFESSION: five minutes left, say it or not
  const set = SETS.buildBuilding(); const scene = set.scene;
  place(scene, 'you', { pos: [-0.42, 0, -0.72], rot: 0.32, pose: 'sitKnees', expr: 'embarrassed', blush: 1, sweat: 1, head: { yaw: 0.35, roll: 0.08 } });
  place(scene, 'alex', { pos: [0.48, 0, -0.72], rot: -0.3, pose: 'sitHands', expr: 'love', head: { yaw: -0.25, roll: -0.1 } });
  camera.fov = 40; camera.position.set(0.05, 1.05, 2.15); camera.lookAt(0.05, 0.98, -0.7);
  render(scene, set, { door: 0, floor: '6', cutFront: true, light: 0.9, tint: '#ffe0ee' });
  vignette(0.55, '40,6,40');
  const [hx, hy] = headScreen('alex', 0.6);
  for (const [dx, dy, s, col] of [[-10, -30, 52, '#ff4d8d'], [105, 5, 38, '#ff7eb6'], [40, -105, 30, '#ff9fd0'], [160, -75, 26, '#ff4d8d']]) heart(c, hx + dx, hy + dy, s, col);
  const [yx, yy] = headScreen('you', 0.62);
  bubble('I... LIKE YOU', Math.max(200, yx - 60), Math.max(64, yy - 70), [yx + 5, yy - 5], { size: 44 });
  bigText('5 MINUTES', 640, 600, 112, { fill: '#ffffff', align: 'center', rot: -0.02 });
  bigText('LEFT', 640, 680, 76, { grad: [[0, '#ffe066'], [1, '#ff8a1f']], align: 'center', rot: -0.02, ow: 0.22 });
  pill('04:59', 1120, 78, { size: 52, bg: '#ff2d3d', icon: 'clock', rot: 0.04 });
}

window.thumbReady = true;

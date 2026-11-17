// Face painter: draws cartoon facial features on a transparent canvas that is mapped
// onto a sphere patch spanning lon -50..50 deg, lat +45..-55 deg (square degrees).
import * as THREE from 'three';

const S = 1024;                 // texture size
const SPAN = 100;               // degrees covered
const px = (lon, lat) => [((lon + 50) / SPAN) * S, ((45 - lat) / SPAN) * S];
const d = (deg) => (deg / SPAN) * S;

const INK = '#1c1233';

export const EXPR = {
  neutral:   { eyes: 'normal', brows: 'neutral', mouth: 'smile_s' },
  happy:     { eyes: 'normal', brows: 'raised', mouth: 'smile' },
  joy:       { eyes: 'happy', brows: 'raised', mouth: 'grin' },
  grin:      { eyes: 'normal', brows: 'raised', mouth: 'grin' },
  content:   { eyes: 'happy', brows: 'neutral', mouth: 'smile' },
  surprised: { eyes: 'wide', brows: 'high', mouth: 'o' },
  shocked:   { eyes: 'tiny', brows: 'high', mouth: 'O', extras: ['sweat'] },
  awe:       { eyes: 'sparkle', brows: 'high', mouth: 'O' },
  worried:   { eyes: 'normal', brows: 'worried', mouth: 'wavy', extras: ['sweat'] },
  nervous:   { eyes: 'normal', brows: 'worried', mouth: 'teeth', extras: ['sweat'] },
  sad:       { eyes: 'sad', brows: 'worried', mouth: 'frown' },
  cry:       { eyes: 'closed_sad', brows: 'worried', mouth: 'frown_open', extras: ['tears'] },
  teary:     { eyes: 'teary', brows: 'worried', mouth: 'wavy' },
  confused:  { eyes: 'normal', brows: 'one', mouth: 'wavy', extras: [] },
  blank:     { eyes: 'dot', brows: 'none', mouth: 'flat' },
  deadpan:   { eyes: 'half', brows: 'flat', mouth: 'flat' },
  smug:      { eyes: 'half', brows: 'smug', mouth: 'smirk' },
  angry:     { eyes: 'normal', brows: 'angry', mouth: 'frown' },
  determined:{ eyes: 'normal', brows: 'angry', mouth: 'smile_s' },
  confident: { eyes: 'half', brows: 'raised', mouth: 'smirk' },
  dizzy:     { eyes: 'spiral', brows: 'worried', mouth: 'wavy' },
  scared:    { eyes: 'tiny', brows: 'worried', mouth: 'teeth', extras: ['sweat'] },
  embarrassed:{ eyes: 'closed_happy', brows: 'worried', mouth: 'wavy', blush: 1.6, extras: ['sweat'] },
  sleepy:    { eyes: 'closed', brows: 'neutral', mouth: 'flat' },
  wince:     { eyes: 'wince', brows: 'worried', mouth: 'teeth' },
  chew:      { eyes: 'happy', brows: 'neutral', mouth: 'chew' },
  loving:    { eyes: 'happy', brows: 'raised', mouth: 'smile', blush: 1.5 },
  laugh:     { eyes: 'closed_happy', brows: 'raised', mouth: 'laugh' },
  bored:     { eyes: 'half', brows: 'flat', mouth: 'smile_s' },
  thinking:  { eyes: 'up', brows: 'one', mouth: 'flat' },
  quiet:     { eyes: 'down', brows: 'worried', mouth: 'flat' },
};

function ellipse(ctx, x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); }

function drawEye(ctx, side, kind, blink) {
  const lon = 13.5 * side, lat = -4;
  const [x, y] = px(lon, lat);
  ctx.save();
  ctx.fillStyle = INK; ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const lw = d(1.5); ctx.lineWidth = lw;
  if (blink && !['happy', 'closed', 'closed_happy', 'closed_sad', 'wince', 'spiral'].includes(kind)) kind = 'closed';
  switch (kind) {
    case 'normal': case 'sad': case 'teary': case 'up': case 'down': {
      const rx = d(4.3), ry = d(6.2);
      ellipse(ctx, x, y, rx, ry); ctx.fill();
      let hx = 1.5, hy = 2.4;
      if (kind === 'up') hy = 3.0; if (kind === 'down') hy = 0.6;
      ctx.fillStyle = '#fff';
      ellipse(ctx, x + d(hx), y - d(hy), d(1.7), d(2.0)); ctx.fill();
      ellipse(ctx, x - d(1.3), y + d(2.9), d(0.75), d(0.75)); ctx.fill();
      if (kind === 'sad' || kind === 'teary') { // droopy upper lid
        ctx.fillStyle = 'rgba(0,0,0,0)';
      }
      if (kind === 'teary') {
        ctx.fillStyle = 'rgba(140,200,255,0.85)';
        ellipse(ctx, x, y + d(4.6), d(3.6), d(1.4)); ctx.fill();
      }
      break; }
    case 'wide': {
      ctx.fillStyle = '#fff'; ctx.lineWidth = d(1.1);
      ellipse(ctx, x, y, d(4.6), d(6.2)); ctx.fill(); ctx.stroke();
      ctx.fillStyle = INK; ellipse(ctx, x, y + d(0.5), d(2.7), d(3.6)); ctx.fill();
      ctx.fillStyle = '#fff'; ellipse(ctx, x + d(0.9), y - d(1.2), d(0.9), d(1.0)); ctx.fill();
      break; }
    case 'tiny': {
      ctx.fillStyle = '#fff'; ctx.lineWidth = d(1.1);
      ellipse(ctx, x, y, d(4.6), d(6.0)); ctx.fill(); ctx.stroke();
      ctx.fillStyle = INK; ellipse(ctx, x, y, d(1.2), d(1.5)); ctx.fill();
      break; }
    case 'dot': ellipse(ctx, x, y, d(1.6), d(2.2)); ctx.fill(); break;
    case 'sparkle': {
      const rx = d(3.8), ry = d(5.4);
      ellipse(ctx, x, y, rx, ry); ctx.fill();
      ctx.fillStyle = '#fff';
      star(ctx, x + d(0.8), y - d(1.2), d(2.4), d(0.7)); ctx.fill();
      ellipse(ctx, x - d(1.3), y + d(2.6), d(0.8), d(0.8)); ctx.fill();
      break; }
    case 'happy': case 'closed_happy': {
      ctx.lineWidth = d(1.7);
      ctx.beginPath(); ctx.arc(x, y + d(2.0), d(3.6), Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
      break; }
    case 'closed': {
      ctx.lineWidth = d(1.5);
      ctx.beginPath(); ctx.arc(x, y - d(1.5), d(3.4), Math.PI * 0.2, Math.PI * 0.8); ctx.stroke();
      break; }
    case 'closed_sad': {
      ctx.lineWidth = d(1.5);
      ctx.beginPath(); ctx.moveTo(x - d(3.4), y - d(side > 0 ? 0.5 : -0.5) ); ctx.lineTo(x + d(3.4), y + d(side > 0 ? 0.5 : -0.5)); ctx.stroke();
      break; }
    case 'half': {
      ctx.save(); ellipse(ctx, x, y, d(3.4), d(5.0)); ctx.clip();
      ctx.fillRect(x - d(4), y - d(0.4), d(8), d(6));
      ctx.fillStyle = '#fff'; ellipse(ctx, x + d(1.0), y + d(1.2), d(1.0), d(1.0)); ctx.fill();
      ctx.restore();
      ctx.lineWidth = d(1.4); ctx.beginPath(); ctx.moveTo(x - d(4.2), y - d(0.6)); ctx.lineTo(x + d(4.2), y - d(0.6)); ctx.stroke();
      break; }
    case 'spiral': {
      ctx.lineWidth = d(1.0); ctx.beginPath();
      for (let a = 0; a < Math.PI * 6; a += 0.15) { const r = d(0.4 + a * 0.24); const X = x + Math.cos(a * side) * r, Y = y + Math.sin(a * side) * r; a === 0 ? ctx.moveTo(X, Y) : ctx.lineTo(X, Y); }
      ctx.stroke(); break; }
    case 'wince': {
      ctx.lineWidth = d(1.6); ctx.beginPath();
      ctx.moveTo(x + d(3.2) * side, y - d(3)); ctx.lineTo(x - d(2.2) * side, y); ctx.lineTo(x + d(3.2) * side, y + d(3)); ctx.stroke();
      break; }
  }
  ctx.restore();
}

function star(ctx, x, y, R, r) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2; const rr = i % 2 ? r : R; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.closePath();
}

function drawBrows(ctx, kind) {
  if (kind === 'none') return;
  ctx.save(); ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.lineWidth = d(1.25);
  for (const side of [-1, 1]) {
    const [x, y] = px(13.5 * side, 8.5);
    let inner = 0, outer = 0, lift = 0; // positive = up (in degrees)
    switch (kind) {
      case 'neutral': inner = 0; outer = 0.3; break;
      case 'raised': inner = 0.8; outer = 0.8; lift = 1.0; break;
      case 'high': inner = 1.8; outer = 1.4; lift = 2.4; break;
      case 'worried': inner = 2.0; outer = -0.8; lift = 0.6; break;
      case 'angry': inner = -1.6; outer = 1.0; break;
      case 'flat': inner = -0.3; outer = -0.3; lift = -0.6; break;
      case 'smug': inner = side > 0 ? 1.4 : -0.6; outer = side > 0 ? 1.4 : 0.3; break;
      case 'one': inner = side > 0 ? 2.2 : -0.4; outer = side > 0 ? 2.0 : -0.2; lift = side > 0 ? 1.4 : 0; break;
    }
    const xi = x - d(3.6) * side, xo = x + d(3.6) * side;
    ctx.beginPath();
    ctx.moveTo(xi, y - d(inner + lift));
    ctx.quadraticCurveTo(x, y - d((inner + outer) / 2 + lift + 0.7), xo, y - d(outer + lift));
    ctx.stroke();
  }
  ctx.restore();
}

function drawMouth(ctx, kind) {
  const [x, y] = px(0, -18);
  ctx.translate(x, y); ctx.scale(1.25, 1.25); ctx.translate(-x, -y);
  ctx.save(); ctx.strokeStyle = INK; ctx.fillStyle = INK; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = d(1.2);
  const tongue = '#ff7a93', inside = '#4a1430';
  switch (kind) {
    case 'smile_s': ctx.beginPath(); ctx.arc(x, y - d(2.0), d(2.6), Math.PI * 0.25, Math.PI * 0.75); ctx.stroke(); break;
    case 'smile': ctx.beginPath(); ctx.arc(x, y - d(3.0), d(4.4), Math.PI * 0.2, Math.PI * 0.8); ctx.stroke(); break;
    case 'grin': case 'laugh': {
      const w = kind === 'laugh' ? 5.2 : 4.6, h = kind === 'laugh' ? 5.2 : 4.0;
      ctx.beginPath(); ctx.moveTo(x - d(w), y - d(1)); ctx.quadraticCurveTo(x, y - d(1.6), x + d(w), y - d(1));
      ctx.quadraticCurveTo(x + d(w * 0.8), y + d(h), x, y + d(h)); ctx.quadraticCurveTo(x - d(w * 0.8), y + d(h), x - d(w), y - d(1)); ctx.closePath();
      ctx.fillStyle = inside; ctx.fill(); ctx.save(); ctx.clip();
      ctx.fillStyle = tongue; ellipse(ctx, x, y + d(h), d(w * 0.6), d(h * 0.5)); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.fillRect(x - d(w), y - d(1.8), d(w * 2), d(1.6)); ctx.restore();
      ctx.lineWidth = d(1.0); ctx.stroke(); break; }
    case 'o': ctx.fillStyle = inside; ellipse(ctx, x, y, d(1.7), d(2.1)); ctx.fill(); ctx.lineWidth = d(0.9); ctx.stroke(); break;
    case 'O': ctx.fillStyle = inside; ellipse(ctx, x, y + d(0.5), d(2.8), d(3.8)); ctx.fill();
      ctx.save(); ctx.clip(); ctx.fillStyle = tongue; ellipse(ctx, x, y + d(3.6), d(2.2), d(1.6)); ctx.fill(); ctx.restore();
      ctx.lineWidth = d(1.0); ellipse(ctx, x, y + d(0.5), d(2.8), d(3.8)); ctx.stroke(); break;
    case 'flat': ctx.beginPath(); ctx.moveTo(x - d(2.4), y); ctx.lineTo(x + d(2.4), y); ctx.stroke(); break;
    case 'frown': ctx.beginPath(); ctx.arc(x, y + d(3.2), d(3.4), Math.PI * 1.25, Math.PI * 1.75); ctx.stroke(); break;
    case 'frown_open': ctx.fillStyle = inside; ctx.beginPath(); ctx.moveTo(x - d(3.4), y + d(2)); ctx.quadraticCurveTo(x, y - d(3.5), x + d(3.4), y + d(2)); ctx.closePath(); ctx.fill(); ctx.lineWidth = d(1); ctx.stroke(); break;
    case 'wavy': ctx.beginPath(); ctx.moveTo(x - d(3.4), y);
      for (let i = 1; i <= 4; i++) ctx.quadraticCurveTo(x - d(3.4) + d(1.7) * (i - 0.5), y + d(i % 2 ? -1.0 : 1.0), x - d(3.4) + d(1.7) * i, y); ctx.stroke(); break;
    case 'smirk': ctx.beginPath(); ctx.moveTo(x - d(2.6), y + d(0.3)); ctx.quadraticCurveTo(x + d(0.6), y + d(1.2), x + d(3.0), y - d(1.6)); ctx.stroke(); break;
    case 'teeth': {
      const w = d(4.6), h = d(3.4);
      ctx.fillStyle = '#fff'; roundRect(ctx, x - w / 2, y - h / 2, w, h, d(1.2)); ctx.fill(); ctx.lineWidth = d(0.9); ctx.stroke();
      ctx.lineWidth = d(0.55); ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.lineTo(x + w / 2, y);
      for (let i = 1; i < 4; i++) { ctx.moveTo(x - w / 2 + w * i / 4, y - h / 2); ctx.lineTo(x - w / 2 + w * i / 4, y + h / 2); } ctx.stroke(); break; }
    case 'talkA': ctx.fillStyle = inside; ctx.beginPath(); ctx.moveTo(x - d(3.2), y - d(0.8)); ctx.quadraticCurveTo(x, y - d(1.4), x + d(3.2), y - d(0.8)); ctx.quadraticCurveTo(x + d(2.4), y + d(3.6), x, y + d(3.6)); ctx.quadraticCurveTo(x - d(2.4), y + d(3.6), x - d(3.2), y - d(0.8)); ctx.fill();
      ctx.save(); ctx.clip(); ctx.fillStyle = tongue; ellipse(ctx, x, y + d(3.4), d(2), d(1.3)); ctx.fill(); ctx.restore(); ctx.lineWidth = d(0.9); ctx.stroke(); break;
    case 'talkB': ctx.fillStyle = inside; ellipse(ctx, x, y + d(0.4), d(2.6), d(1.5)); ctx.fill(); ctx.lineWidth = d(0.9); ctx.stroke(); break;
    case 'chew': ctx.beginPath(); ctx.moveTo(x - d(3), y); ctx.lineTo(x - d(1), y + d(1)); ctx.lineTo(x + d(1), y - d(0.2)); ctx.lineTo(x + d(3), y + d(0.8)); ctx.stroke(); break;
  }
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

function drawExtras(ctx, extras) {
  for (const e of extras || []) {
    if (e === 'sweat') {
      const [x, y] = px(31, 14);
      ctx.save(); ctx.fillStyle = '#8fd3ff'; ctx.strokeStyle = '#3a7bd5'; ctx.lineWidth = d(0.5);
      ctx.beginPath(); ctx.moveTo(x, y - d(4)); ctx.quadraticCurveTo(x + d(2.6), y + d(0.5), x, y + d(1.8)); ctx.quadraticCurveTo(x - d(2.6), y + d(0.5), x, y - d(4)); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.8)'; ellipse(ctx, x - d(0.6), y + d(0.2), d(0.5), d(0.8)); ctx.fill(); ctx.restore();
    }
    if (e === 'tears') {
      ctx.save(); ctx.fillStyle = 'rgba(120,190,255,0.9)';
      for (const s of [-1, 1]) { const [x, y] = px(12.5 * s, -6); roundRect(ctx, x - d(1.1), y, d(2.2), d(16), d(1.1)); ctx.fill(); }
      ctx.restore();
    }
  }
}

function drawBlush(ctx, k = 1) {
  ctx.save();
  for (const s of [-1, 1]) {
    const [x, y] = px(22 * s, -12);
    const g = ctx.createRadialGradient(x, y, 0, x, y, d(5.5));
    g.addColorStop(0, `rgba(255,140,175,${0.55 * k})`); g.addColorStop(1, 'rgba(255,140,175,0)');
    ctx.fillStyle = g; ellipse(ctx, x, y, d(5.5), d(3.6)); ctx.fill();
  }
  ctx.restore();
}

const cache = new Map();
export function faceTexture(exprName, { blink = false, mouth = null, glasses = false } = {}) {
  const e = EXPR[exprName] || EXPR.neutral;
  const key = `${exprName}|${blink}|${mouth}|${glasses}`;
  if (cache.has(key)) return cache.get(key);
  const c = document.createElement('canvas'); c.width = c.height = S;
  const ctx = c.getContext('2d');
  drawBlush(ctx, e.blush ?? 1);
  drawEye(ctx, -1, e.eyes, blink); drawEye(ctx, 1, e.eyes, blink);
  drawBrows(ctx, e.brows);
  drawMouth(ctx, mouth || e.mouth);
  drawExtras(ctx, e.extras);
  if (glasses) { ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = d(0.9); for (const sd of [-1, 1]) { const [x, y] = px(12.5 * sd, -3); ctx.beginPath(); ctx.arc(x, y, d(7.2), 0, Math.PI * 2); ctx.stroke(); }
    const [a] = px(-5.3, -3), [b] = px(5.3, -3), [, yy] = px(0, -1.5); ctx.beginPath(); ctx.moveTo(a, yy); ctx.quadraticCurveTo((a + b) / 2, yy - d(1.6), b, yy); ctx.stroke(); ctx.restore(); }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 1;
  cache.set(key, tex);
  return tex;
}

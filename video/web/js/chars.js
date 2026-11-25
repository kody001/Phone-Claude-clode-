// Original round-head cartoon characters with painted 2D faces on a 3D body.
import * as THREE from 'three';
import { clamp, lerp, noise1, rand } from './util.js';

const OUTLINE = new THREE.MeshBasicMaterial({ color: '#2b2140', side: THREE.BackSide });
const WHITE = new THREE.MeshLambertMaterial({ color: '#f4f0f7' });
const HEAD_R = 0.5;

// ---------------------------------------------------------------- face painter
const FW = 640, FH = 512;
function ell(c, x, y, rx, ry, fill, rot = 0) { c.beginPath(); c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, Math.PI * 2); c.fillStyle = fill; c.fill(); }
const INK = '#1d1630';

export const EXPR = {
  neutral: { eyes: 'oval', mouth: 'smallsmile', blush: 0.35 },
  smile: { eyes: 'oval', mouth: 'smile', blush: 0.5 },
  happy: { eyes: 'arc', mouth: 'open', blush: 0.6 },
  laugh: { eyes: 'arc', mouth: 'laugh', blush: 0.75 },
  surprised: { eyes: 'ring', brows: 'raised', mouth: 'o', blush: 0.3 },
  shocked: { eyes: 'ring', brows: 'raised', mouth: 'O', blush: 0.2, big: 1.18 },
  nervous: { eyes: 'oval', brows: 'worried', mouth: 'wavy', blush: 0.5, sweat: 1 },
  awkward: { eyes: 'oval', brows: 'flat', mouth: 'flat', blush: 0.35, look: [0.55, 0], sweat: 1 },
  sad: { eyes: 'oval', brows: 'sad', mouth: 'frown', blush: 0.3, small: 0.9 },
  scared: { eyes: 'ring', brows: 'worried', mouth: 'wavyopen', blush: 0.2, sweat: 1, small: 0.85 },
  determined: { eyes: 'oval', brows: 'angry', mouth: 'smirk', blush: 0.3 },
  love: { eyes: 'sparkle', mouth: 'smile', blush: 1 },
  dizzy: { eyes: 'spiral', mouth: 'wavy', blush: 0.4 },
  soulless: { eyes: 'blank', mouth: 'o', blush: 0 },
  embarrassed: { eyes: 'tight', mouth: 'wavy', blush: 1, sweat: 1 },
  teeth: { eyes: 'oval', mouth: 'teeth', blush: 0.4 },
  bored: { eyes: 'half', mouth: 'flat', blush: 0.15 },
  content: { eyes: 'closed', mouth: 'smile', blush: 0.7 },
  peek: { eyes: 'oval', mouth: 'smallsmile', blush: 1 },
  wince: { eyes: 'tight', brows: 'worried', mouth: 'flat', blush: 0.4 },
  thinking: { eyes: 'oval', brows: 'raised1', mouth: 'smirk', blush: 0.3, look: [-0.4, -0.6] },
  grin: { eyes: 'oval', mouth: 'grin', blush: 0.6 },
  tired: { eyes: 'half', brows: 'sad', mouth: 'flat', blush: 0.1 },
  sing: { eyes: 'closed', mouth: 'O', blush: 0.7 },
};

function drawFace(c, st) {
  const E = { ...EXPR[st.expr || 'neutral'] };
  const cx = FW / 2, ey = 236, sp = 104;
  c.save(); c.translate(cx, 270); c.scale(1.28, 1.28); c.translate(-cx, -270);
  const lx = (st.look ? st.look[0] : E.look ? E.look[0] : 0) * 16;
  const ly = (st.look ? st.look[1] : E.look ? E.look[1] : 0) * 12;
  const sc = (E.big || 1) * (E.small || 1);
  c.clearRect(0, 0, FW, FH);
  // blush
  const bl = st.blush != null ? st.blush : E.blush;
  if (bl > 0) {
    for (const s of [-1, 1]) {
      const g = c.createRadialGradient(cx + s * 128, 300, 2, cx + s * 128, 300, 44);
      g.addColorStop(0, `rgba(255,120,150,${0.55 * bl})`); g.addColorStop(1, 'rgba(255,120,150,0)');
      c.fillStyle = g; c.fillRect(cx + s * 128 - 50, 250, 100, 100);
    }
  }
  // eyes
  let eyes = E.eyes;
  if (st.blink && ['oval', 'ring', 'sparkle'].includes(eyes)) eyes = 'closed';
  c.lineCap = 'round'; c.lineJoin = 'round';
  for (const s of [-1, 1]) {
    const x = cx + s * sp + lx, y = ey + ly;
    c.strokeStyle = INK; c.lineWidth = 7;
    switch (eyes) {
      case 'oval': ell(c, x, y, 17 * sc, 29 * sc, INK); ell(c, x + 5, y - 11 * sc, 6 * sc, 8 * sc, '#fff'); break;
      case 'sparkle':
        ell(c, x, y, 20, 32, INK); ell(c, x + 5, y - 12, 8, 10, '#fff'); ell(c, x - 6, y + 12, 4, 4, '#fff');
        break;
      case 'ring':
        ell(c, x, y, 27 * sc, 29 * sc, '#ffffff'); c.beginPath(); c.ellipse(x, y, 27 * sc, 29 * sc, 0, 0, Math.PI * 2); c.lineWidth = 6; c.stroke();
        ell(c, x + lx * 0.3, y + ly * 0.3, 9 * sc, 10 * sc, INK); break;
      case 'blank':
        ell(c, x, y, 26, 28, '#ffffff'); c.beginPath(); c.ellipse(x, y, 26, 28, 0, 0, Math.PI * 2); c.lineWidth = 5; c.stroke(); break;
      case 'arc': c.beginPath(); c.arc(x, y + 12, 22, Math.PI * 1.1, Math.PI * 1.9); c.lineWidth = 8; c.stroke(); break;
      case 'closed': c.beginPath(); c.arc(x, y - 6, 20, Math.PI * 0.15, Math.PI * 0.85); c.lineWidth = 7; c.stroke(); break;
      case 'tight': c.beginPath(); c.moveTo(x - s * 18, y - 16); c.lineTo(x + s * 14, y); c.lineTo(x - s * 18, y + 16); c.lineWidth = 7; c.stroke(); break;
      case 'half':
        ell(c, x, y + 6, 17, 22, INK); ell(c, x + 5, y, 5, 6, '#fff');
        c.fillStyle = '#f4eef7'; c.fillRect(x - 30, y - 40, 60, 40); c.beginPath(); c.moveTo(x - 24, y); c.lineTo(x + 24, y); c.lineWidth = 7; c.stroke();
        break;
      case 'spiral':
        c.beginPath(); for (let a = 0; a < 14; a += 0.2) { const r = a * 2; c.lineTo(x + Math.cos(a * s) * r, y + Math.sin(a * s) * r); } c.lineWidth = 4.5; c.stroke(); break;
      case 'line': c.beginPath(); c.moveTo(x - 18, y); c.lineTo(x + 18, y); c.lineWidth = 7; c.stroke(); break;
    }
  }
  // brows
  const br = E.brows; c.lineWidth = 6.5; c.strokeStyle = INK;
  if (br) for (const s of [-1, 1]) {
    const x = cx + s * sp + lx * 0.6, y = ey - 52 + ly * 0.5;
    c.beginPath();
    if (br === 'raised') { c.arc(x, y + 6, 22, Math.PI * 1.2, Math.PI * 1.8); }
    else if (br === 'raised1') { if (s > 0) c.arc(x, y + 2, 22, Math.PI * 1.2, Math.PI * 1.8); else { c.moveTo(x - 18, y + 10); c.lineTo(x + 18, y + 10); } }
    else if (br === 'worried') { c.moveTo(x - s * 20, y + 10); c.lineTo(x + s * 18, y - 4); c.moveTo(x - s * 20, y + 10); }
    else if (br === 'sad') { c.moveTo(x - s * 20, y + 12); c.quadraticCurveTo(x, y - 6, x + s * 20, y - 2); }
    else if (br === 'angry') { c.moveTo(x - s * 20, y - 4); c.lineTo(x + s * 18, y + 12); }
    else if (br === 'flat') { c.moveTo(x - 18, y + 6); c.lineTo(x + 18, y + 6); }
    c.stroke();
  }
  // mouth
  const my = 330 + ly * 0.5, mx = cx + lx * 0.5;
  let m = E.mouth;
  const open = st.mouth || 0;
  c.lineWidth = 7; c.strokeStyle = INK;
  if (open > 0.05 && m !== 'teeth') {
    const h = 6 + open * 30, w = 16 + open * 10;
    ell(c, mx, my + 4, w, h, '#4a1d34'); ell(c, mx, my + 4 + h * 0.45, w * 0.6, h * 0.42, '#e86a8a');
    c.beginPath(); c.ellipse(mx, my + 4, w, h, 0, 0, Math.PI * 2); c.lineWidth = 5; c.stroke();
    m = null;
  }
  switch (m) {
    case 'smallsmile': c.beginPath(); c.arc(mx, my - 14, 18, Math.PI * 0.2, Math.PI * 0.8); c.stroke(); break;
    case 'smile': c.beginPath(); c.arc(mx, my - 22, 30, Math.PI * 0.2, Math.PI * 0.8); c.stroke(); break;
    case 'open':
      c.beginPath(); c.moveTo(mx - 28, my - 6); c.quadraticCurveTo(mx, my + 40, mx + 28, my - 6); c.closePath(); c.fillStyle = '#4a1d34'; c.fill(); c.lineWidth = 5; c.stroke(); break;
    case 'laugh':
      c.beginPath(); c.moveTo(mx - 40, my - 12); c.quadraticCurveTo(mx, my + 62, mx + 40, my - 12); c.closePath(); c.fillStyle = '#4a1d34'; c.fill();
      c.save(); c.clip(); ell(c, mx, my + 34, 24, 16, '#e86a8a'); c.restore(); c.lineWidth = 6; c.stroke(); break;
    case 'o': ell(c, mx, my, 10, 13, '#4a1d34'); break;
    case 'O': ell(c, mx, my + 6, 19, 26, '#4a1d34'); ell(c, mx, my + 18, 11, 10, '#e86a8a'); break;
    case 'wavy': case 'wavyopen':
      c.beginPath(); for (let i = 0; i <= 24; i++) { const x = mx - 30 + i * 2.5; c.lineTo(x, my + Math.sin(i / 24 * Math.PI * 4) * 6); } c.lineWidth = 6; c.stroke();
      if (m === 'wavyopen') ell(c, mx, my + 16, 9, 7, '#4a1d34'); break;
    case 'flat': c.beginPath(); c.moveTo(mx - 22, my); c.lineTo(mx + 22, my); c.stroke(); break;
    case 'frown': c.beginPath(); c.arc(mx, my + 26, 22, Math.PI * 1.25, Math.PI * 1.75); c.stroke(); break;
    case 'smirk': c.beginPath(); c.moveTo(mx - 22, my + 2); c.quadraticCurveTo(mx + 8, my + 10, mx + 26, my - 10); c.stroke(); break;
    case 'grin':
      c.beginPath(); c.moveTo(mx - 44, my - 10); c.quadraticCurveTo(mx, my + 44, mx + 44, my - 10); c.closePath(); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 6; c.stroke();
      c.beginPath(); c.moveTo(mx - 40, my + 2); c.quadraticCurveTo(mx, my + 14, mx + 40, my + 2); c.lineWidth = 3; c.stroke(); break;
    case 'teeth': {
      // big awkward grin with a granola crumb stuck on a tooth
      c.beginPath(); c.roundRect(mx - 46, my - 18, 92, 40, 14); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 6; c.stroke();
      c.lineWidth = 3; c.beginPath(); c.moveTo(mx - 44, my + 2); c.lineTo(mx + 44, my + 2);
      for (let i = -2; i <= 2; i++) { c.moveTo(mx + i * 17, my - 16); c.lineTo(mx + i * 17, my + 20); } c.stroke();
      ell(c, mx + 9, my - 6, 8, 6, '#8a5a2b'); ell(c, mx + 13, my - 9, 3, 2.5, '#b07a40'); break;
    }
  }
  c.restore();
  // sweat drop
  if ((st.sweat != null ? st.sweat : E.sweat)) {
    const x = cx + 190, y = 150;
    c.beginPath(); c.moveTo(x, y - 30); c.quadraticCurveTo(x + 22, y + 4, x, y + 14); c.quadraticCurveTo(x - 22, y + 4, x, y - 30);
    c.fillStyle = '#7fd0ff'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#2a6aa8'; c.stroke();
    ell(c, x - 5, y + 2, 4, 6, '#e8f7ff');
  }
}

// ---------------------------------------------------------------- geometry helpers
const geoCache = new Map();
function G(key, make) { if (!geoCache.has(key)) geoCache.set(key, make()); return geoCache.get(key); }
function mesh(geo, mat, cast = true) { const m = new THREE.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = false; return m; }
function limb(len, r, mat) {
  // capsule hanging down from pivot
  const g = G(`limb${len}_${r}`, () => { const g = new THREE.CapsuleGeometry(r, len, 6, 14); g.translate(0, -len / 2, 0); return g; });
  return mesh(g, mat);
}

function hoodieGeo() {
  return G('hoodie', () => {
    const pts = [[0, 0], [0.2, 0], [0.255, 0.02], [0.27, 0.07], [0.27, 0.3], [0.255, 0.44], [0.215, 0.53], [0.15, 0.58], [0, 0.6]].map(([x, y]) => new THREE.Vector2(x, y));
    const g = new THREE.LatheGeometry(pts, 28); g.scale(1, 1, 0.82); return g;
  });
}

// ---------------------------------------------------------------- hair builders
function hairMat(color) { return new THREE.MeshPhongMaterial({ color, shininess: 40, specular: '#4a3a5a' }); }
function cap(r, theta, mat, tiltX = -0.38) {
  const g = new THREE.SphereGeometry(r, 36, 18, 0, Math.PI * 2, 0, theta);
  const m = mesh(g, mat); m.rotation.x = tiltX; return m;
}
function blob(mat, sx, sy, sz, x, y, z, rx = 0, ry = 0, rz = 0) {
  const m = mesh(G('blob', () => new THREE.SphereGeometry(1, 24, 16)), mat);
  m.scale.set(sx, sy, sz); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); return m;
}
const HAIR = {
  messy(color) {
    const g = new THREE.Group(), m = hairMat(color);
    g.add(cap(HEAD_R * 1.045, 1.32, m, -0.42));
    const tufts = [[-0.22, 0.42, 0.22, 0.6], [0, 0.47, 0.24, 0.1], [0.2, 0.43, 0.22, -0.5], [-0.08, 0.5, 0.05, 0.2], [0.12, 0.49, 0.1, -0.2]];
    tufts.forEach(([x, y, z, rz]) => g.add(blob(m, 0.17, 0.11, 0.16, x, y, z, 0.5, 0, rz)));
    g.add(blob(m, 0.09, 0.2, 0.12, -0.45, 0.08, 0.05, 0, 0, 0.1));
    g.add(blob(m, 0.09, 0.2, 0.12, 0.45, 0.08, 0.05, 0, 0, -0.1));
    return g;
  },
  swoop(color) {
    const g = new THREE.Group(), m = hairMat(color);
    g.add(cap(HEAD_R * 1.05, 1.42, m, -0.36));
    g.add(blob(m, 0.36, 0.13, 0.2, 0.1, 0.38, 0.3, 0.55, 0, -0.45));
    g.add(blob(m, 0.2, 0.12, 0.16, -0.25, 0.36, 0.28, 0.6, 0, 0.6));
    g.add(blob(m, 0.11, 0.26, 0.15, -0.46, 0.02, 0.02, 0, 0, 0.08));
    g.add(blob(m, 0.11, 0.26, 0.15, 0.46, 0.02, 0.02, 0, 0, -0.08));
    g.add(blob(m, 0.42, 0.3, 0.3, 0, 0.05, -0.25));
    return g;
  },
  curls(color) {
    const g = new THREE.Group(), m = hairMat(color);
    g.add(cap(HEAD_R * 1.05, 1.35, m, -0.4));
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2, rr = 0.42 + 0.06 * Math.sin(i * 3);
      g.add(blob(m, 0.13, 0.13, 0.13, Math.cos(a) * rr * 0.95, 0.32 + 0.12 * Math.sin(i * 1.7) + (Math.sin(a) < 0 ? 0.08 : 0), Math.sin(a) * rr * 0.9 - 0.08));
    }
    g.add(blob(m, 0.17, 0.17, 0.17, -0.42, 0.42, -0.05)); g.add(blob(m, 0.17, 0.17, 0.17, 0.42, 0.42, -0.05));
    return g;
  },
  bun(color) {
    const g = new THREE.Group(), m = hairMat(color);
    g.add(cap(HEAD_R * 1.04, 1.35, m, -0.3));
    g.add(blob(m, 0.2, 0.18, 0.2, 0, 0.5, -0.22));
    return g;
  },
  beanie(color) {
    const g = new THREE.Group(), m = new THREE.MeshLambertMaterial({ color });
    g.add(cap(HEAD_R * 1.07, 1.25, m, -0.3));
    const rim = mesh(new THREE.TorusGeometry(HEAD_R * 1.0, 0.06, 10, 36), m); rim.rotation.x = Math.PI / 2 - 0.3; rim.position.set(0, 0.16, -0.05); g.add(rim);
    g.add(blob(m, 0.1, 0.1, 0.1, 0, 0.56, -0.15));
    return g;
  },
  hardhat(color) {
    const g = new THREE.Group(), m = new THREE.MeshPhongMaterial({ color, shininess: 80 });
    g.add(cap(HEAD_R * 1.08, 1.3, m, -0.1));
    const brim = mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.03, 32), m); brim.position.set(0, 0.14, 0.04); brim.rotation.x = -0.1; g.add(brim);
    return g;
  },
  cap(color, hairColor = '#3b2a22') {
    const g = new THREE.Group(), m = new THREE.MeshLambertMaterial({ color });
    g.add(cap(HEAD_R * 1.06, 1.2, m, -0.25));
    const brim = mesh(new THREE.BoxGeometry(0.42, 0.03, 0.3), m); brim.position.set(0, 0.3, 0.5); brim.rotation.x = 0.25; g.add(brim);
    g.add(blob(hairMat(hairColor), 0.1, 0.18, 0.12, -0.46, 0.0, 0.0)); g.add(blob(hairMat(hairColor), 0.1, 0.18, 0.12, 0.46, 0.0, 0.0));
    return g;
  },
};

// ---------------------------------------------------------------- poses
// angles: arm {f: forward swing, o: outward, e: elbow bend, t: twist}, leg {f: hip flex, k: knee bend}
export const POSES = {
  stand: { lean: 0, hip: 0.66, aL: { f: 0.05, o: 0.2, e: 0.15 }, aR: { f: 0.05, o: 0.2, e: 0.15 }, lL: { f: 0, k: 0 }, lR: { f: 0, k: 0 } },
  relaxed: { lean: 0.02, hip: 0.66, aL: { f: -0.05, o: 0.08, e: 0.3 }, aR: { f: 0.1, o: 0.1, e: 0.4 }, lL: { f: 0.04, k: 0.05 }, lR: { f: -0.02, k: 0 } },
  armsCrossed: { lean: 0, hip: 0.66, aL: { f: 0.55, o: 0.25, e: 2.0, t: 0.9 }, aR: { f: 0.6, o: 0.25, e: 2.0, t: -0.9 }, lL: { f: 0, k: 0 }, lR: { f: 0, k: 0 } },
  pockets: { lean: 0, hip: 0.66, aL: { f: 0.32, o: 0.28, e: 0.85, t: 0.5 }, aR: { f: 0.32, o: 0.28, e: 0.85, t: -0.5 }, lL: { f: 0, k: 0 }, lR: { f: 0, k: 0 } },
  pressButton: { lean: 0.04, hip: 0.66, aL: { f: 0.05, o: 0.12, e: 0.2 }, aR: { f: 1.45, o: 0.1, e: 0.25 }, lL: { f: 0, k: 0 }, lR: { f: 0.1, k: 0.1 } },
  pressBoth: { lean: 0.06, hip: 0.66, aL: { f: 1.4, o: 0.05, e: 0.3 }, aR: { f: 1.5, o: 0.05, e: 0.2 }, lL: { f: 0, k: 0 }, lR: { f: 0.1, k: 0.1 } },
  phone: { lean: 0.05, hip: 0.66, aL: { f: 0.05, o: 0.12, e: 0.2 }, aR: { f: 0.55, o: 0.05, e: 1.7, t: -0.4 }, lL: { f: 0, k: 0 }, lR: { f: 0, k: 0 } },
  phoneBoth: { lean: 0.06, hip: 0.66, aL: { f: 0.6, o: 0.0, e: 1.6, t: 0.5 }, aR: { f: 0.6, o: 0.0, e: 1.6, t: -0.5 }, lL: { f: 0, k: 0 }, lR: { f: 0, k: 0 } },
  handsFace: { lean: 0.02, hip: 0.66, aL: { f: 0.6, o: 0.32, e: 2.45, t: 0.3 }, aR: { f: 0.6, o: 0.32, e: 2.45, t: -0.3 }, lL: { f: 0, k: 0 }, lR: { f: 0, k: 0 } },
  coverFace: { lean: 0.12, hip: 0.66, aL: { f: 0.95, o: 0.12, e: 2.3, t: 0.2 }, aR: { f: 0.95, o: 0.12, e: 2.3, t: -0.2 }, lL: { f: 0, k: 0 }, lR: { f: 0, k: 0 } },
  shrug: { lean: 0, hip: 0.66, aL: { f: 0.2, o: 0.6, e: 1.4, t: -0.6 }, aR: { f: 0.2, o: 0.6, e: 1.4, t: 0.6 }, lL: { f: 0, k: 0 }, lR: { f: 0, k: 0 } },
  wave: { lean: 0, hip: 0.66, aL: { f: 0.05, o: 0.12, e: 0.15 }, aR: { f: 0.1, o: 1.25, e: 1.6, t: 0 }, lL: { f: 0, k: 0 }, lR: { f: 0, k: 0 } },
  point: { lean: 0, hip: 0.66, aL: { f: 0.05, o: 0.12, e: 0.15 }, aR: { f: 1.35, o: 0.25, e: 0.1 }, lL: { f: 0, k: 0 }, lR: { f: 0, k: 0 } },
  scared: { lean: -0.05, hip: 0.62, aL: { f: 0.7, o: 0.3, e: 1.9, t: 0.4 }, aR: { f: 0.7, o: 0.3, e: 1.9, t: -0.4 }, lL: { f: 0.15, k: 0.3 }, lR: { f: 0.15, k: 0.3 } },
  cheer: { lean: 0, hip: 0.66, aL: { f: 0.2, o: 2.6, e: 0.3 }, aR: { f: 0.2, o: 2.6, e: 0.3 }, lL: { f: 0, k: 0 }, lR: { f: 0, k: 0 } },
  sitKnees: { lean: 0.18, hip: 0.13, sit: 1, aL: { f: 1.15, o: 0.25, e: 0.9, t: 0.6 }, aR: { f: 1.15, o: 0.25, e: 0.9, t: -0.6 }, lL: { f: 1.95, k: 2.55 }, lR: { f: 1.95, k: 2.55 } },
  sitHug: { lean: 0.3, hip: 0.13, sit: 1, aL: { f: 1.25, o: 0.05, e: 1.3, t: 0.9 }, aR: { f: 1.25, o: 0.05, e: 1.3, t: -0.9 }, lL: { f: 2.15, k: 2.7 }, lR: { f: 2.15, k: 2.7 } },
  sitRelax: { lean: -0.05, hip: 0.13, sit: 1, aL: { f: -0.3, o: 0.35, e: 0.2 }, aR: { f: 0.35, o: 0.2, e: 0.9 }, lL: { f: 1.45, k: 0.5 }, lR: { f: 1.7, k: 1.3 } },
  sitHands: { lean: 0.1, hip: 0.13, sit: 1, aL: { f: 0.9, o: 0.15, e: 1.2, t: 0.4 }, aR: { f: 0.9, o: 0.15, e: 1.2, t: -0.4 }, lL: { f: 1.6, k: 1.2 }, lR: { f: 1.6, k: 1.2 } },
  sitFaceHands: { lean: 0.45, hip: 0.13, sit: 1, aL: { f: 1.0, o: 0.15, e: 2.3, t: 0.3 }, aR: { f: 1.0, o: 0.15, e: 2.3, t: -0.3 }, lL: { f: 2.0, k: 2.55 }, lR: { f: 2.0, k: 2.55 } },
  sitCoverFace: { lean: 0.15, hip: 0.13, sit: 1, aL: { f: 1.0, o: 0.1, e: 2.35, t: 0.2 }, aR: { f: 1.0, o: 0.1, e: 2.35, t: -0.2 }, lL: { f: 1.9, k: 2.4 }, lR: { f: 1.9, k: 2.4 } },
  sitReach: { lean: 0.05, hip: 0.13, sit: 1, aL: { f: 0.3, o: 0.9, e: 0.2 }, aR: { f: 0.3, o: 0.9, e: 0.2 }, lL: { f: 1.6, k: 1.2 }, lR: { f: 1.6, k: 1.2 } },
  sitChair: { lean: 0.05, hip: 0.5, sit: 1, aL: { f: 0.9, o: 0.15, e: 0.9, t: 0.3 }, aR: { f: 0.9, o: 0.15, e: 0.9, t: -0.3 }, lL: { f: 1.55, k: 1.55 }, lR: { f: 1.55, k: 1.55 } },
  guitar: { lean: 0.05, hip: 0.5, sit: 1, aL: { f: 0.9, o: 0.5, e: 1.2, t: 0.3 }, aR: { f: 0.6, o: 0.2, e: 1.5, t: -0.6 }, lL: { f: 1.55, k: 1.55 }, lR: { f: 1.55, k: 1.55 } },
  reachSide: { lean: 0, hip: 0.66, aL: { f: 0.1, o: 0.55, e: 0.1 }, aR: { f: 0.1, o: 0.55, e: 0.1 }, lL: { f: 0, k: 0 }, lR: { f: 0, k: 0 } },
  holdOut: { lean: 0.02, hip: 0.66, aL: { f: 0.05, o: 0.12, e: 0.2 }, aR: { f: 1.1, o: 0.05, e: 0.6, t: -0.3 }, lL: { f: 0, k: 0 }, lR: { f: 0, k: 0 } },
  slump: { lean: 0.25, hip: 0.64, aL: { f: 0.0, o: 0.06, e: 0.05 }, aR: { f: 0.0, o: 0.06, e: 0.05 }, lL: { f: 0, k: 0.05 }, lR: { f: 0, k: 0.05 } },
};
export function mixPose(a, b, u) {
  const A = typeof a === 'string' ? POSES[a] : a, B = typeof b === 'string' ? POSES[b] : b;
  const mixLimb = (x, y) => ({ f: lerp(x.f || 0, y.f || 0, u), o: lerp(x.o || 0, y.o || 0, u), e: lerp(x.e || 0, y.e || 0, u), t: lerp(x.t || 0, y.t || 0, u), k: lerp(x.k || 0, y.k || 0, u) });
  return { lean: lerp(A.lean, B.lean, u), hip: lerp(A.hip, B.hip, u), sit: lerp(A.sit || 0, B.sit || 0, u), aL: mixLimb(A.aL, B.aL), aR: mixLimb(A.aR, B.aR), lL: mixLimb(A.lL, B.lL), lR: mixLimb(A.lR, B.lR) };
}

// ---------------------------------------------------------------- character
export class Character {
  constructor(o) {
    this.o = o; this.seed = o.seed || 1;
    const root = this.root = new THREE.Group();
    const body = this.body = new THREE.Group(); root.add(body);
    const hood = new THREE.MeshPhongMaterial({ color: o.hoodie, shininess: 55, specular: '#5a4a6a' });
    const hoodDark = new THREE.MeshLambertMaterial({ color: new THREE.Color(o.hoodie).multiplyScalar(0.82) });
    this.mats = { hood };
    // torso
    const torso = mesh(hoodieGeo(), hood); body.add(torso);
    const tOut = mesh(hoodieGeo(), OUTLINE, false); tOut.scale.set(1.04, 1.02, 1.05); tOut.position.y = -0.005; body.add(tOut);
    // pocket + drawstrings + hood
    const pocket = mesh(G('pocket', () => new THREE.CylinderGeometry(0.2, 0.24, 0.16, 20, 1, false, -0.75, 1.5)), hoodDark, false);
    pocket.position.set(0, 0.12, 0.012); pocket.scale.set(1.12, 1, 0.92); body.add(pocket);
    for (const s of [-1, 1]) { const d = mesh(G('string', () => new THREE.CapsuleGeometry(0.012, 0.1, 4, 8)), WHITE, false); d.position.set(s * 0.045, 0.45, 0.205); d.rotation.x = -0.25; body.add(d); }
    const hoodRing = mesh(G('hoodRing', () => new THREE.TorusGeometry(0.17, 0.07, 10, 24)), hood); hoodRing.position.set(0, 0.56, -0.07); hoodRing.rotation.x = Math.PI / 2 + 0.5; body.add(hoodRing);
    if (o.backpack) {
      const bp = mesh(G('bp', () => new THREE.CapsuleGeometry(0.17, 0.18, 6, 14)), new THREE.MeshLambertMaterial({ color: o.backpack }));
      bp.scale.set(1.15, 1, 0.6); bp.position.set(0, 0.32, -0.27); body.add(bp); this.backpack = bp;
      for (const s of [-1, 1]) { const st = mesh(G('strap', () => new THREE.TorusGeometry(0.16, 0.022, 6, 16, Math.PI)), new THREE.MeshLambertMaterial({ color: o.backpack })); st.position.set(s * 0.15, 0.36, -0.03); st.rotation.y = Math.PI / 2; st.scale.set(1.3, 1.3, 1); body.add(st); }
    }
    if (o.vest) { const v = mesh(hoodieGeo(), new THREE.MeshLambertMaterial({ color: o.vest })); v.scale.set(1.025, 0.8, 1.03); v.position.y = 0.1; body.add(v); }
    // head
    const neck = this.neck = new THREE.Group(); neck.position.y = 0.55; body.add(neck);
    const head = this.head = new THREE.Group(); head.position.y = 0.38; neck.add(head);
    const headMat = new THREE.MeshLambertMaterial({ color: o.skin || '#f6f0f8' });
    const hm = mesh(G('head', () => new THREE.SphereGeometry(HEAD_R, 48, 32)), headMat); head.add(hm);
    const ho = mesh(G('head', () => new THREE.SphereGeometry(HEAD_R, 48, 32)), OUTLINE, false); ho.scale.setScalar(1.035); head.add(ho);
    // face shell
    this.faceCanvas = document.createElement('canvas'); this.faceCanvas.width = FW; this.faceCanvas.height = FH;
    this.faceTex = new THREE.CanvasTexture(this.faceCanvas); this.faceTex.colorSpace = THREE.SRGBColorSpace; this.faceTex.anisotropy = 4;
    this.faceCache = new Map();
    const faceGeo = G('face', () => new THREE.SphereGeometry(HEAD_R * 1.006, 48, 36, Math.PI / 2 - 0.95, 1.9, Math.PI / 2 - 0.8, 1.6));
    this.faceMesh = new THREE.Mesh(faceGeo, new THREE.MeshLambertMaterial({ map: this.faceTex, transparent: true, depthWrite: false }));
    this.faceMesh.renderOrder = 2; head.add(this.faceMesh);
    if (o.glasses) {
      const gm = new THREE.MeshBasicMaterial({ color: '#2b2140' });
      for (const s of [-1, 1]) { const r = mesh(new THREE.TorusGeometry(0.085, 0.012, 8, 24), gm, false); r.position.set(s * 0.125, 0.03, 0.49); r.rotation.y = s * 0.25; head.add(r); }
    }
    const hairB = HAIR[o.hair || 'messy'];
    if (hairB) { this.hair = hairB(o.hairColor || '#4a2f25', o.hairColor2); head.add(this.hair); }
    // arms
    this.arms = {};
    for (const [side, s] of [['L', 1], ['R', -1]]) {
      const sh = new THREE.Group(); sh.position.set(s * 0.245, 0.45, 0); body.add(sh);
      const up = limb(0.2, 0.062, hood); sh.add(up);
      const el = new THREE.Group(); el.position.y = -0.24; sh.add(el);
      const lo = limb(0.16, 0.058, hood); el.add(lo);
      const hand = new THREE.Group(); hand.position.y = -0.24; el.add(hand);
      const hs = mesh(G('hand', () => new THREE.SphereGeometry(0.075, 18, 14)), WHITE); hand.add(hs);
      this.arms[side] = { sh, el, hand, s };
    }
    // legs (attached to root so torso lean doesn't swing them)
    this.legs = {};
    for (const [side, s] of [['L', 1], ['R', -1]]) {
      const hp = new THREE.Group(); hp.position.set(s * 0.1, 0.66, 0); root.add(hp);
      const th = limb(0.28, 0.042, WHITE); hp.add(th);
      const kn = new THREE.Group(); kn.position.y = -0.31; hp.add(kn);
      const sn = limb(0.26, 0.04, WHITE); kn.add(sn);
      const ft = mesh(G('foot', () => { const g = new THREE.SphereGeometry(1, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2); return g; }), new THREE.MeshLambertMaterial({ color: o.shoes || '#ffffff' }));
      ft.scale.set(0.07, 0.06, 0.11); ft.position.set(0, -0.33, 0.03); kn.add(ft);
      this.legs[side] = { hp, kn, s };
    }
    // blob shadow
    const sh = new THREE.Mesh(G('shadow', () => new THREE.CircleGeometry(0.42, 32)), SHADOW_MAT);
    sh.rotation.x = -Math.PI / 2; sh.position.y = 0.006; sh.renderOrder = 1; root.add(sh); this.shadow = sh;
    this.props = {};
    this.apply({ pose: 'stand' }, 0);
  }

  attach(name, obj, side = 'R') { const h = this.arms[side].hand; h.add(obj); this.props[name] = obj; return obj; }
  showProp(name, v) { if (this.props[name]) this.props[name].visible = v; }

  setFace(st) {
    const mq = st.mouth ? Math.round(clamp(st.mouth) * 3) / 3 : 0;
    const key = `${st.expr}|${st.blink ? 1 : 0}|${mq}|${st.look ? st.look.map(v => Math.round(v * 4)).join(',') : ''}|${st.blush ?? ''}|${st.sweat ?? ''}`;
    if (key === this.faceKey) return;
    this.faceKey = key;
    let tex = this.faceCache.get(key);
    if (!tex) {
      const cv = document.createElement('canvas'); cv.width = FW; cv.height = FH;
      drawFace(cv.getContext('2d'), { ...st, mouth: mq });
      tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
      this.faceCache.set(key, tex);
      if (this.faceCache.size > 60) { const k0 = this.faceCache.keys().next().value; this.faceCache.get(k0).dispose(); this.faceCache.delete(k0); }
    }
    this.faceMesh.material.map = tex; this.faceMesh.material.needsUpdate = true;
  }

  // state: {pos:[x,y,z], rot, pose|poseMix:{a,b,u}, walk:{phase,amt}, head:{yaw,pitch,roll}, expr, mouth, look, blush, sweat, breathe, bob, scale}
  apply(st, t) {
    let P = st.poseMix ? mixPose(st.poseMix.a, st.poseMix.b, st.poseMix.u) : mixPose(st.pose || 'stand', st.pose || 'stand', 0);
    const root = this.root;
    if (st.pos) root.position.set(st.pos[0], st.pos[1] || 0, st.pos[2]);
    root.rotation.y = st.rot || 0;
    root.scale.setScalar(st.scale || 1);
    // walk/run cycle overlay
    let bob = 0;
    const W = st.walk;
    const lim = (k) => ({ ...P[k] });
    const aL = lim('aL'), aR = lim('aR'), lL = lim('lL'), lR = lim('lR');
    if (W && W.amt > 0) {
      const ph = W.phase, a = W.amt, run = W.run ? 1.6 : 1;
      const sL = Math.sin(ph), sR = Math.sin(ph + Math.PI);
      lL.f += sL * 0.45 * a * run; lR.f += sR * 0.45 * a * run;
      lL.k += Math.max(0, Math.sin(ph - 1.2)) * 0.9 * a * run; lR.k += Math.max(0, Math.sin(ph + Math.PI - 1.2)) * 0.9 * a * run;
      aL.f += sR * 0.5 * a * run; aR.f += sL * 0.5 * a * run;
      if (W.run) { aL.e += 1.2 * a; aR.e += 1.2 * a; P.lean += 0.25 * a; }
      bob = Math.abs(Math.cos(ph)) * 0.035 * a * run;
    }
    const br = (st.breathe ?? 1) * Math.sin(t * 2.1 + this.seed) * 0.008;
    this.body.position.y = P.hip + bob + br + (st.bob || 0);
    this.body.rotation.x = P.lean + (st.lean || 0);
    this.body.rotation.z = st.tilt || 0;
    this.body.position.z = P.sit ? -0.05 * P.sit : 0;
    for (const [side, L] of [['L', aL], ['R', aR]]) {
      const A = this.arms[side];
      A.sh.rotation.set(-L.f, (L.t || 0) * 0.5, A.s * L.o, 'XZY');
      A.el.rotation.set(-L.e, (L.t || 0) * 0.5, 0);
    }
    for (const [side, L] of [['L', lL], ['R', lR]]) {
      const G2 = this.legs[side];
      G2.hp.position.y = P.hip + bob * 0.5;
      G2.hp.position.z = P.sit ? -0.05 * P.sit : 0;
      G2.hp.rotation.set(-L.f, 0, G2.s * (L.o || 0) * 0.3);
      G2.kn.rotation.set(L.k, 0, 0);
    }
    const H = st.head || {};
    const idle = st.idle ?? 1;
    this.neck.rotation.set((H.pitch || 0) + noise1(t * 0.35, this.seed) * 0.03 * idle - P.lean * 0.5 * (P.sit ? 0.3 : 1),
      (H.yaw || 0) + noise1(t * 0.27, this.seed + 3) * 0.05 * idle, (H.roll || 0) + noise1(t * 0.3, this.seed + 7) * 0.025 * idle);
    // blink: deterministic schedule
    let blink = false;
    if (st.blink !== false) {
      const period = 3.3 + rand(this.seed) * 1.6; const ph = (t + this.seed * 0.77) % period;
      blink = ph < 0.11 || (rand(Math.floor((t + this.seed * 0.77) / period), this.seed) > 0.7 && ph > 0.24 && ph < 0.34);
    }
    if (st.forceBlink) blink = true;
    this.setFace({ expr: st.expr || 'neutral', blink, mouth: st.mouth || 0, look: st.look, blush: st.blush, sweat: st.sweat });
    this.shadow.visible = st.shadow !== false;
    this.shadow.scale.setScalar(P.sit ? 1.25 : 1);
  }
}
export const SHADOW_MAT = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 4, 64, 64, 64); g.addColorStop(0, 'rgba(20,10,40,0.42)'); g.addColorStop(0.6, 'rgba(20,10,40,0.18)'); g.addColorStop(1, 'rgba(20,10,40,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  return new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false });
})();

// ---------------------------------------------------------------- cast
export function makeCast() {
  return {
    you: new Character({ name: 'you', hoodie: '#ff9a52', hair: 'messy', hairColor: '#5a3524', seed: 1, shoes: '#ffffff' }),
    alex: new Character({ name: 'alex', hoodie: '#8d86f2', hair: 'swoop', hairColor: '#2c2547', seed: 2, backpack: '#5fd4b4', shoes: '#ffffff' }),
    friend: new Character({ name: 'friend', hoodie: '#ff7eb6', hair: 'curls', hairColor: '#3a2318', seed: 3, skin: '#f3e6ea' }),
    tech: new Character({ name: 'tech', hoodie: '#5d7fa3', hair: 'hardhat', hairColor: '#ffcc33', seed: 4, vest: '#ff8a2a' }),
    patterson: new Character({ name: 'patterson', hoodie: '#b77ad8', hair: 'bun', hairColor: '#cfcbd6', seed: 5, glasses: true }),
    newkid: new Character({ name: 'newkid', hoodie: '#ffd84d', hair: 'beanie', hairColor: '#5bb7e8', seed: 6 }),
    maint: new Character({ name: 'maint', hoodie: '#7d8a99', hair: 'cap', hairColor: '#3f5f8a', seed: 7 }),
    npc1: new Character({ name: 'npc1', hoodie: '#6fd3a8', hair: 'messy', hairColor: '#2c2547', seed: 8 }),
    npc2: new Character({ name: 'npc2', hoodie: '#ff8f8f', hair: 'bun', hairColor: '#6a3b22', seed: 9 }),
    npc3: new Character({ name: 'npc3', hoodie: '#7ab8ff', hair: 'curls', hairColor: '#1d1630', seed: 10 }),
    npc4: new Character({ name: 'npc4', hoodie: '#c9a0ff', hair: 'swoop', hairColor: '#8a5a2b', seed: 11 }),
  };
}

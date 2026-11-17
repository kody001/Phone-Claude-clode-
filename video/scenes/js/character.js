// Toy-like cartoon character: big glossy round head, bell-shaped torso, stick legs, two-segment arms.
import * as THREE from 'three';
import { faceTexture } from './faces.js';
import { hash, noise1 } from './util.js';

const mats = new Map();
export function mat(color, rough = 0.6, metal = 0, extra = {}) {
  const key = color + '|' + rough + '|' + metal + JSON.stringify(extra);
  if (!mats.has(key)) {
    const m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: Math.min(metal, 0.35), ...extra });
    if (metal > 0.5) { m.roughness = Math.min(rough, 0.35); m.emissive = new THREE.Color(color).multiplyScalar(0.18); }
    mats.set(key, m);
  }
  return mats.get(key);
}

const blobTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'); const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(20,0,50,0.55)'); gr.addColorStop(0.5, 'rgba(20,0,50,0.28)'); gr.addColorStop(1, 'rgba(20,0,50,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); return t;
})();
export function blobShadow(w = 1, d = 1, op = 1) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, opacity: op }));
  m.rotation.x = -Math.PI / 2; m.renderOrder = -1; return m;
}

// ---------- torso texture painter ----------
const torsoCache = new Map();
function torsoTexture(o) {
  const key = JSON.stringify(o);
  if (torsoCache.has(key)) return torsoCache.get(key);
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = o.color; g.fillRect(0, 0, 1024, 512);
  const cx = 512; // front center
  // subtle fabric shading at bottom hem
  const hem = g.createLinearGradient(0, 380, 0, 512); hem.addColorStop(0, 'rgba(0,0,0,0)'); hem.addColorStop(1, 'rgba(0,0,0,0.18)');
  g.fillStyle = hem; g.fillRect(0, 380, 1024, 132);
  if (o.type === 'blazer') {
    // shirt V
    g.fillStyle = o.shirt || '#f4f1fb';
    g.beginPath(); g.moveTo(cx - 70, 0); g.lineTo(cx + 70, 0); g.lineTo(cx, 230); g.closePath(); g.fill();
    if (o.tie) { g.fillStyle = o.tie; g.beginPath(); g.moveTo(cx - 14, 20); g.lineTo(cx + 14, 20); g.lineTo(cx + 20, 180); g.lineTo(cx, 215); g.lineTo(cx - 20, 180); g.closePath(); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.25)'; for (let y = 40; y < 200; y += 34) { g.fillRect(cx - 18, y, 36, 8); } }
    // lapels
    g.strokeStyle = o.trim || 'rgba(0,0,0,0.25)'; g.lineWidth = 10;
    g.beginPath(); g.moveTo(cx - 90, 0); g.lineTo(cx - 6, 250); g.moveTo(cx + 90, 0); g.lineTo(cx + 6, 250); g.stroke();
    // buttons
    g.fillStyle = o.button || '#d9b24c'; for (const y of [290, 360]) { g.beginPath(); g.arc(cx, y, 9, 0, 7); g.fill(); }
    // pockets
    g.strokeStyle = 'rgba(0,0,0,0.22)'; g.lineWidth = 6; g.beginPath(); g.moveTo(cx - 170, 330); g.lineTo(cx - 80, 330); g.moveTo(cx + 80, 330); g.lineTo(cx + 170, 330); g.stroke();
    if (o.crest) { // gold crest on wearer's left chest (screen right)
      g.fillStyle = '#f2c14e'; g.beginPath(); g.moveTo(cx + 110, 120); g.lineTo(cx + 160, 120); g.lineTo(cx + 160, 160); g.quadraticCurveTo(cx + 135, 195, cx + 110, 160); g.closePath(); g.fill();
      g.fillStyle = o.color; g.font = 'bold 30px serif'; g.textAlign = 'center'; g.fillText('G', cx + 135, 158);
    }
    if (o.patch) { g.fillStyle = o.patch; g.save(); g.translate(cx - 150, 250); g.rotate(-0.2); g.fillRect(-26, -20, 52, 40); g.strokeStyle = 'rgba(255,255,255,0.6)'; g.setLineDash([6, 6]); g.lineWidth = 3; g.strokeRect(-26, -20, 52, 40); g.restore(); }
  } else if (o.type === 'hoodie') {
    g.strokeStyle = 'rgba(0,0,0,0.18)'; g.lineWidth = 8;
    g.beginPath(); g.moveTo(cx - 120, 330); g.quadraticCurveTo(cx, 300, cx + 120, 330); g.lineTo(cx + 140, 440); g.lineTo(cx - 140, 440); g.closePath(); g.stroke();
    g.strokeStyle = o.color2 || '#ffffff'; g.lineWidth = 7; g.beginPath(); g.moveTo(cx - 34, 30); g.lineTo(cx - 40, 150); g.moveTo(cx + 34, 30); g.lineTo(cx + 40, 150); g.stroke();
    if (o.logo) { g.fillStyle = o.color2 || '#fff'; g.font = 'bold 54px sans-serif'; g.textAlign = 'center'; g.fillText(o.logo, cx, 250); }
  } else if (o.type === 'tee' || o.type === 'shirt') {
    if (o.stripes) { g.fillStyle = o.color2; for (let y = 60; y < 512; y += 70) g.fillRect(0, y, 1024, 26); }
    if (o.type === 'shirt') { g.fillStyle = 'rgba(255,255,255,0.8)'; for (const y of [130, 220, 310, 400]) { g.beginPath(); g.arc(cx, y, 7, 0, 7); g.fill(); } g.strokeStyle = 'rgba(0,0,0,0.2)'; g.lineWidth = 5; g.beginPath(); g.moveTo(cx, 0); g.lineTo(cx, 512); g.stroke(); }
    if (o.plaid) { g.strokeStyle = o.color2; g.globalAlpha = 0.5; g.lineWidth = 18; for (let x = 0; x < 1024; x += 90) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 512); g.stroke(); } for (let y = 0; y < 512; y += 90) { g.beginPath(); g.moveTo(0, y); g.lineTo(1024, y); g.stroke(); } g.globalAlpha = 1; }
    if (o.logo) { g.fillStyle = o.color2 || '#fff'; g.font = 'bold 60px sans-serif'; g.textAlign = 'center'; g.fillText(o.logo, cx, 230); }
  } else if (o.type === 'apron') { // diner uniform with apron
    g.fillStyle = o.color2 || '#ffffff'; g.beginPath(); g.moveTo(cx - 150, 512); g.lineTo(cx - 120, 170); g.lineTo(cx + 120, 170); g.lineTo(cx + 150, 512); g.fill();
    g.fillRect(cx - 80, 90, 160, 90);
    g.strokeStyle = 'rgba(0,0,0,0.15)'; g.lineWidth = 5; g.strokeRect(cx - 70, 300, 140, 70);
    g.fillStyle = '#ff6b8b'; g.beginPath(); g.arc(cx + 50, 125, 16, 0, 7); g.fill();
  } else if (o.type === 'uniform') { // security / chef / teacher cardigan etc.
    g.fillStyle = o.color2 || '#fff';
    if (o.badge) { g.fillStyle = '#f2c14e'; star5(g, cx + 130, 150, 34); g.fill(); }
    g.fillStyle = 'rgba(255,255,255,0.7)'; for (const y of [140, 230, 320, 410]) { g.beginPath(); g.arc(cx, y, 8, 0, 7); g.fill(); }
    g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 5; g.beginPath(); g.moveTo(cx, 60); g.lineTo(cx, 512); g.stroke();
    if (o.tie) { g.fillStyle = o.tie; g.beginPath(); g.moveTo(cx - 12, 30); g.lineTo(cx + 12, 30); g.lineTo(cx + 16, 170); g.lineTo(cx, 200); g.lineTo(cx - 16, 170); g.closePath(); g.fill(); }
  } else if (o.type === 'chef') {
    g.fillStyle = 'rgba(0,0,0,0.12)'; for (const [x, y] of [[cx - 60, 140], [cx + 60, 140], [cx - 60, 240], [cx + 60, 240], [cx - 60, 340], [cx + 60, 340]]) { g.beginPath(); g.arc(x, y, 12, 0, 7); g.fill(); }
  } else if (o.type === 'jacket') { // riding jacket
    g.fillStyle = o.color2 || '#fff'; g.beginPath(); g.moveTo(cx - 60, 0); g.lineTo(cx + 60, 0); g.lineTo(cx, 170); g.fill();
    g.fillStyle = '#e8d9a8'; for (const y of [230, 300, 370]) { g.beginPath(); g.arc(cx, y, 9, 0, 7); g.fill(); }
  } else if (o.type === 'dress') {
    if (o.dots) { g.fillStyle = o.color2; for (let y = 20; y < 512; y += 60) for (let x = (y / 60) % 2 * 40; x < 1024; x += 80) { g.beginPath(); g.arc(x, y, 10, 0, 7); g.fill(); } }
    if (o.pearls) { g.fillStyle = '#fff6ee'; for (let i = -6; i <= 6; i++) { const x = cx + i * 22, y = 40 + i * i * 2.4; g.beginPath(); g.arc(x, y, 10, 0, 7); g.fill(); } }
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 1;
  torsoCache.set(key, t); return t;
}
function star5(g, x, y, r) { g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5; const rr = i % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); }

// ---------- shared geometry ----------
const G = {};
function geo() {
  if (G.head) return G;
  G.head = new THREE.SphereGeometry(0.4, 48, 36);
  // face patch: phi centred on +Z (pi/2), 100 deg wide; theta from 45 deg above equator to 55 below
  const toR = Math.PI / 180;
  G.face = new THREE.SphereGeometry(0.4015, 32, 32, Math.PI / 2 - 50 * toR, 100 * toR, (90 - 45) * toR, 100 * toR);
  // Three's sphere maps phi increasing toward +X when seen from +Z? (u grows with phi). We need canvas left->right = screen left->right.
  const pts = [[0, 0], [0.16, 0.0], [0.205, 0.04], [0.218, 0.13], [0.212, 0.3], [0.195, 0.44], [0.16, 0.54], [0.1, 0.6], [0.0, 0.62]];
  G.torso = new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), 48, Math.PI, Math.PI * 2);
  G.upper = new THREE.CapsuleGeometry(0.052, 0.17, 6, 16); G.upper.translate(0, -0.11, 0);
  G.fore = new THREE.CapsuleGeometry(0.048, 0.15, 6, 16); G.fore.translate(0, -0.1, 0);
  G.cuff = new THREE.CylinderGeometry(0.066, 0.078, 0.12, 20, 1, true); G.cuff.translate(0, -0.2, 0);
  G.hand = new THREE.SphereGeometry(0.062, 24, 16);
  G.leg = new THREE.CylinderGeometry(0.034, 0.034, 1, 12); G.leg.translate(0, -0.5, 0);
  G.shoe = new THREE.SphereGeometry(1, 24, 16);
  G.sphere = new THREE.SphereGeometry(1, 32, 24);
  G.cap = (theta) => new THREE.SphereGeometry(0.424, 40, 24, 0, Math.PI * 2, 0, theta);
  return G;
}

const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const onHead = (lonDeg, latDeg, r = 0.4) => { const lo = lonDeg * Math.PI / 180, la = latDeg * Math.PI / 180; return v3(Math.sin(lo) * Math.cos(la) * r, Math.sin(la) * r, Math.cos(lo) * Math.cos(la) * r); };

export const POSES = {
  idle:      { aL: [0.12, 0.05, 0.15], aR: [0.12, 0.05, 0.15] },
  relaxed:   { aL: [0.18, 0.0, 0.25], aR: [0.18, 0.0, 0.25] },
  armsUp:    { aL: [2.6, 0.2, 0.2], aR: [2.6, 0.2, 0.2], head: [-0.15, 0, 0] },
  cheer:     { aL: [2.2, 0.5, 0.6], aR: [2.2, 0.5, 0.6], head: [-0.2, 0, 0] },
  shrug:     { aL: [0.55, 0.35, 1.6], aR: [0.55, 0.35, 1.6], head: [0, 0, 0.15] },
  handsHead: { aL: [1.9, 0.9, 2.2], aR: [1.9, 0.9, 2.2] },
  cheeks:    { aL: [0.9, 1.0, 2.5], aR: [0.9, 1.0, 2.5] },
  mouthCover:{ aL: [0.25, 1.1, 2.5], aR: [0.12, 0.05, 0.15] },
  chin:      { aL: [0.2, 0.9, 2.6], aR: [0.25, 0.4, 1.4], head: [0.05, 0, 0.12] },
  point:     { aL: [0.12, 0.05, 0.15], aR: [0.1, 1.45, 0.05] },
  wave:      { aL: [0.12, 0.05, 0.15], aR: [2.4, 0.2, 0.6] },
  holdFront: { aL: [0.25, 0.75, 1.1], aR: [0.25, 0.75, 1.1] },
  holdOne:   { aL: [0.12, 0.05, 0.15], aR: [0.2, 0.7, 1.2] },
  holdUp:    { aL: [0.12, 0.05, 0.15], aR: [0.25, 1.5, 0.6] },
  phone:     { aL: [0.12, 0.05, 0.15], aR: [0.25, 0.8, 1.6], head: [0.35, 0, 0] },
  phoneBoth: { aL: [0.3, 0.7, 1.6], aR: [0.3, 0.7, 1.6], head: [0.35, 0, 0] },
  type:      { aL: [0.3, 0.75, 1.4], aR: [0.3, 0.75, 1.4], head: [0.25, 0, 0] },
  hips:      { aL: [0.75, -0.2, 1.5], aR: [0.75, -0.2, 1.5] },
  cross:     { aL: [0.2, 0.7, 1.9], aR: [0.2, 0.75, 1.95] },
  behind:    { aL: [0.25, -0.5, 0.6], aR: [0.25, -0.5, 0.6] },
  hug:       { aL: [0.9, 1.2, 0.9], aR: [0.9, 1.2, 0.9] },
  facepalm:  { aL: [0.12, 0.05, 0.15], aR: [0.4, 1.1, 2.6], head: [0.3, 0, 0] },
  sit:       { aL: [0.2, 0.55, 0.9], aR: [0.2, 0.55, 0.9], lL: 1.5, lR: 1.5, sit: 1 },
  sitIdle:   { aL: [0.15, 0.2, 0.3], aR: [0.15, 0.2, 0.3], lL: 1.5, lR: 1.5, sit: 1 },
  sitSad:    { aL: [0.2, 0.6, 1.0], aR: [0.2, 0.6, 1.0], lL: 1.5, lR: 1.5, sit: 1, head: [0.4, 0, 0], lean: [0.25, 0] },
  eat:       { aL: [0.2, 0.5, 0.8], aR: [0.25, 0.9, 2.5], lL: 1.5, lR: 1.5, sit: 1 },
  ride:      { aL: [0.3, 0.9, 1.0], aR: [0.3, 0.9, 1.0], lL: 0.3, lR: 0.3, spread: 0.55, sit: 1, kL: -1.2, kR: -1.2 },
  flail:     { aL: [2.3, 0.2, 0.3], aR: [1.6, 0.8, 0.5] },
  bow:       { aL: [0.12, 0.05, 0.15], aR: [0.12, 0.05, 0.15], lean: [0.5, 0], head: [0.3, 0, 0] },
  sleep:     { aL: [0.12, 0.05, 0.15], aR: [0.12, 0.05, 0.15], head: [0.2, 0, 0.3] },
  lookDown:  { aL: [0.12, 0.05, 0.15], aR: [0.12, 0.05, 0.15], head: [0.45, 0, 0] },
  wash:      { aL: [0.3, 0.9, 1.2], aR: [0.3, 0.95, 1.0], head: [0.35, 0, 0], lean: [0.12, 0] },
  give:      { aL: [0.12, 0.05, 0.15], aR: [0.2, 1.2, 0.4] },
  clap:      { aL: [0.1, 1.1, 1.0], aR: [0.1, 1.1, 1.0] },
};

export class Character {
  constructor(opt) {
    geo();
    this.opt = opt; this.name = opt.name;
    this.seed = hash(opt.name || 'x');
    const s = opt.scale || 1;
    this.root = new THREE.Group(); this.root.name = opt.name;
    this.body = new THREE.Group(); this.root.add(this.body);
    this.root.scale.setScalar(s);
    const legLen = opt.legLen || 0.78; this.legLen = legLen;
    const skin = mat(opt.skin || '#f8f2ff', 0.38);
    const top = opt.top || { type: 'hoodie', color: '#7bd66b' };
    const topMat = new THREE.MeshStandardMaterial({ map: torsoTexture(top), roughness: 0.75 });
    const sleeveMat = mat(top.sleeve || top.color, 0.75);
    const legMat = mat(opt.legs || '#f2eef8', 0.5);
    const shoeMat = mat(opt.shoes || '#e6e1ef', 0.45);
    const over = top.oversized ? 1 : 0; this.over = over;

    // torso
    this.torsoGroup = new THREE.Group(); this.torsoGroup.position.y = legLen - 0.06; this.body.add(this.torsoGroup);
    const torso = new THREE.Mesh(G.torso, topMat);
    const tw = (opt.wide || 1) * (over ? 1.12 : 1);
    torso.scale.set(tw, opt.torsoH || 1, tw * 0.92); this.torsoGroup.add(torso); this.torso = torso;
    const tH = 0.62 * (opt.torsoH || 1);
    // skirt / dress flare
    if (opt.skirt) { const sk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 0.26, 32, 1, true), mat(opt.skirt, 0.7, 0, { side: THREE.DoubleSide })); sk.position.y = 0.02; this.torsoGroup.add(sk); }

    // neck/head
    this.neck = new THREE.Group(); this.neck.position.y = tH + 0.27 * (opt.headScale || 1); this.torsoGroup.add(this.neck);
    this.head = new THREE.Group(); this.neck.add(this.head);
    const hs = opt.headScale || 1; this.head.scale.setScalar(hs);
    const headMesh = new THREE.Mesh(G.head, skin); this.head.add(headMesh);
    this.faceMat = new THREE.MeshStandardMaterial({ transparent: true, roughness: 0.38, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
    this.faceMesh = new THREE.Mesh(G.face, this.faceMat); this.head.add(this.faceMesh);
    this.buildHair(opt.hair || { style: 'short', color: '#5b3420' });
    // arms
    this.arms = [];
    for (const side of [1, -1]) {
      const sh = new THREE.Group(); sh.position.set(side * (0.2 * tw + 0.01), tH - 0.12, 0); this.torsoGroup.add(sh);
      const up = new THREE.Mesh(G.upper, sleeveMat); sh.add(up);
      const el = new THREE.Group(); el.position.y = -0.22; sh.add(el);
      const fo = new THREE.Mesh(G.fore, sleeveMat); el.add(fo);
      let hand;
      if (over) { const cuff = new THREE.Mesh(G.cuff, mat(top.sleeve || top.color, 0.75, 0, { side: THREE.DoubleSide })); el.add(cuff); hand = new THREE.Mesh(G.hand, skin); hand.position.y = -0.27; hand.scale.setScalar(0.75); el.add(hand); }
      else { hand = new THREE.Mesh(G.hand, opt.gloves ? mat(opt.gloves, 0.6) : skin); hand.position.y = -0.22; el.add(hand); }
      const grip = new THREE.Group(); grip.position.y = over ? -0.3 : -0.25; el.add(grip);
      this.arms.push({ side, sh, el, hand, grip });
    }
    // legs: thigh + knee + shin
    this.legs = [];
    for (const side of [1, -1]) {
      const hip = new THREE.Group(); hip.position.set(side * 0.085, legLen, 0); this.body.add(hip);
      const half = legLen / 2;
      const thigh = new THREE.Mesh(G.leg, legMat); thigh.scale.y = half + 0.01; hip.add(thigh);
      const knee = new THREE.Group(); knee.position.y = -half; hip.add(knee);
      const shin = new THREE.Mesh(G.leg, legMat); shin.scale.y = half; knee.add(shin);
      const kj = new THREE.Mesh(G.hand, legMat); kj.scale.setScalar(0.55); knee.add(kj);
      if (opt.pants) { const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.066, half, 14), mat(opt.pants, 0.7)); p1.position.y = -half / 2; hip.add(p1); const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.068, half * 0.85, 14), mat(opt.pants, 0.7)); p2.position.y = -half * 0.42; knee.add(p2); }
      const shoe = new THREE.Mesh(G.shoe, shoeMat); shoe.scale.set(0.065, 0.048, 0.105); shoe.position.set(0, -half + 0.03, 0.035); knee.add(shoe);
      this.legs.push({ side, hip, knee });
    }
    if (opt.backpack) {
      const bp = new THREE.Group(); bp.position.set(0, legLen + 0.3, -0.2); this.body.add(bp);
      const b = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), mat(opt.backpack, 0.7)); b.scale.set(0.18, 0.22, 0.1); bp.add(b);
      const pin = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.006, 6, 16), mat('#d8dde8', 0.2, 1)); pin.position.set(0.04, 0.06, -0.1); pin.rotation.y = Math.PI / 2; pin.scale.set(1, 1.8, 1); bp.add(pin);
      this.backpack = bp;
    }
    this.buildAcc(opt.acc || []);
    this.shadow = blobShadow(0.9, 0.7, 0.9);
    this.state = { pose: 'idle', pose2: null, mix: 0, expr: 'neutral', walk: 0, walkPhase: 0, talk: false, look: [0, 0], tremble: 0, bounce: 0, blink: true };
    this.custom = null;
  }

  buildHair(h) {
    const m = mat(h.color, 0.32);
    const add = (mesh) => { this.head.add(mesh); return mesh; };
    const cap = (theta, tilt, sx = 1, sy = 1, sz = 1, col = m) => { const c = add(new THREE.Mesh(G.cap(theta), col)); c.rotation.x = tilt; c.scale.set(sx, sy, sz); return c; };
    const blob = (x, y, z, sx, sy, sz, col = m, rx = 0, ry = 0, rz = 0) => { const b = add(new THREE.Mesh(G.sphere, col)); b.position.set(x, y, z); b.scale.set(sx, sy, sz); b.rotation.set(rx, ry, rz); return b; };
    switch (h.style) {
      case 'none': break;
      case 'short': cap(1.5, -0.45); blob(0.0, 0.25, 0.25, 0.3, 0.1, 0.16, m, 0.7); break;
      case 'messy': cap(1.52, -0.42);
        blob(0.1, 0.25, 0.26, 0.24, 0.1, 0.15, m, 0.75, 0, -0.25); blob(-0.12, 0.26, 0.25, 0.2, 0.09, 0.14, m, 0.75, 0, 0.35);
        for (const [x, z, r] of [[0.04, -0.2, 0.5], [-0.06, -0.24, -0.4]]) { const s = add(new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.16, 8), m)); s.position.set(x, 0.43, z); s.rotation.set(-0.9, 0, r); }
        break;
      case 'swoop': cap(1.5, -0.45); blob(-0.08, 0.3, 0.2, 0.32, 0.11, 0.2, m, 0.6, 0.3, 0.3); break;
      case 'slick': cap(1.45, -0.55); blob(0.0, 0.34, 0.2, 0.3, 0.15, 0.24, m, 0.9); break;
      case 'buzz': cap(1.5, -0.45, 0.985, 0.985, 0.985); break;
      case 'bob': cap(1.5, -0.4); { const s = add(new THREE.Mesh(new THREE.SphereGeometry(0.43, 48, 24, Math.PI / 2 + 0.9, Math.PI * 2 - 1.8, 0.5, 1.5), mat(h.color, 0.32, 0, { side: THREE.DoubleSide }))); s.scale.set(1.03, 1.0, 1.0); }
        blob(0, 0.26, 0.25, 0.3, 0.1, 0.16, m, 0.7); break;
      case 'long': cap(1.5, -0.4); { const s = add(new THREE.Mesh(new THREE.SphereGeometry(0.44, 48, 24, Math.PI / 2 + 0.85, Math.PI * 2 - 1.7, 0.5, 1.9), mat(h.color, 0.32, 0, { side: THREE.DoubleSide }))); s.scale.set(1.04, 1.12, 1.0); s.position.y = -0.06; }
        blob(0, 0.26, 0.25, 0.3, 0.1, 0.16, m, 0.7); break;
      case 'puffs': cap(1.5, -0.4); blob(0.3, 0.3, -0.05, 0.17, 0.17, 0.17); blob(-0.3, 0.3, -0.05, 0.17, 0.17, 0.17); blob(0, 0.26, 0.25, 0.3, 0.1, 0.16, m, 0.7); break;
      case 'pony': cap(1.5, -0.42); blob(0, 0.15, -0.44, 0.13, 0.26, 0.13, m, -0.5); blob(0, 0.26, 0.25, 0.3, 0.1, 0.16, m, 0.7); break;
      case 'bun': cap(1.5, -0.42); blob(0, 0.42, -0.2, 0.17, 0.15, 0.17); break;
      case 'curly': { for (let i = 0; i < 26; i++) { const a = i * 2.39996, r = Math.sqrt(i / 26); const lo = Math.cos(a) * r * 100, la = 40 + (1 - r) * 45 - Math.max(0, Math.sin(a)) * 25; const p = onHead(lo, la, 0.4); blob(p.x, p.y, p.z - 0.02, 0.12, 0.12, 0.12); } } break;
      case 'bald': break;
    }
  }

  buildAcc(list) {
    for (const a of list) {
      if (a === 'sunglasses' || a === 'sunglassesUp') {
        const g = new THREE.Group(); const lens = mat('#1a1530', 0.08, 0.6);
        for (const s of [-1, 1]) { const l = new THREE.Mesh(G.sphere, lens); l.scale.set(0.085, 0.06, 0.03); l.position.copy(onHead(12.5 * s, -2, 0.41)); l.lookAt(onHead(12.5 * s, -2, 2)); g.add(l); }
        const br = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.07), mat('#d4af37', 0.3, 1)); br.rotation.z = Math.PI / 2; br.position.copy(onHead(0, 0, 0.415)); g.add(br);
        if (a === 'sunglassesUp') { g.rotation.x = -0.55; }
        this.head.add(g); this.sunglasses = g;
      }
      if (a === 'cap') { const c = new THREE.Mesh(G.cap(1.25), mat('#1d1d3a', 0.6)); c.rotation.x = -0.3; c.scale.setScalar(1.03); this.head.add(c); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.02, 24, 1, false, -Math.PI / 2, Math.PI), mat('#141428', 0.6)); b.position.set(0, 0.24, 0.3); b.rotation.x = 0.15; this.head.add(b);
        const bd = new THREE.Mesh(new THREE.CircleGeometry(0.05, 6), mat('#f2c14e', 0.3, 0.8)); bd.position.copy(onHead(0, 32, 0.44)); bd.lookAt(onHead(0, 32, 2)); this.head.add(bd); }
      if (a === 'helmet') { const c = new THREE.Mesh(G.cap(1.3), mat('#1a1a26', 0.3)); c.rotation.x = -0.3; c.scale.setScalar(1.05); this.head.add(c); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.02, 24, 1, false, -Math.PI / 2, Math.PI), mat('#1a1a26', 0.3)); b.position.set(0, 0.26, 0.31); b.rotation.x = 0.2; this.head.add(b); }
      if (a === 'chefhat') { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.24, 0.22, 32), mat('#ffffff', 0.8)); c.position.y = 0.42; this.head.add(c); for (let i = 0; i < 6; i++) { const p = new THREE.Mesh(G.sphere, mat('#ffffff', 0.85)); p.scale.setScalar(0.14); p.position.set(Math.cos(i) * 0.14, 0.6, Math.sin(i) * 0.14); this.head.add(p); } }
      if (a === 'bow') { for (const s of [-1, 1]) { const b = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.14, 12), mat('#ff5d8f', 0.5)); b.rotation.z = s * Math.PI / 2; b.position.set(0.18 + s * 0.06, 0.38, 0.1); this.head.add(b); } }
      if (a === 'watch') { const w = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.016, 8, 20), mat('#f5c542', 0.2, 1)); w.rotation.x = Math.PI / 2; w.position.y = -0.17; this.arms[0]?.el.add(w); this._watch = w; }
      if (a === 'headphones') { const b = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.025, 8, 32, Math.PI), mat('#2c2c44', 0.4)); this.head.add(b); for (const s of [-1, 1]) { const e = new THREE.Mesh(G.sphere, mat('#ff5d8f', 0.4)); e.scale.set(0.05, 0.1, 0.1); e.position.set(s * 0.43, 0, 0); this.head.add(e); } }
      if (a === 'mustache') { const m = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.025, 8, 20, Math.PI), mat('#4a2a1a', 0.5)); m.position.copy(onHead(0, -11, 0.4)); m.rotation.z = Math.PI; m.lookAt(onHead(0, -11, 3)); m.rotateZ(Math.PI); this.head.add(m); }
      if (a === 'glasses') this.glasses = true;
    }
  }

  // world-space head top for overlays
  headTop(out = new THREE.Vector3()) { this.head.updateWorldMatrix(true, false); return out.set(0, 0.55, 0).applyMatrix4(this.head.matrixWorld); }
  headPos(out = new THREE.Vector3()) { this.head.updateWorldMatrix(true, false); return out.set(0, 0, 0).applyMatrix4(this.head.matrixWorld); }
  gripWorld(i = 0, out = new THREE.Vector3()) { const g = this.arms[i].grip; g.updateWorldMatrix(true, false); return out.setFromMatrixPosition(g.matrixWorld); }

  place(x, z, rot = 0, y = 0) { this.root.position.set(x, y, z); this.root.rotation.set(0, rot, 0); return this; }
  face(x, z) { const p = this.root.position; this.root.rotation.y = Math.atan2(x - p.x, z - p.z); return this; }
  pose(a, b = null, k = 0) { this.state.pose = a; this.state.pose2 = b; this.state.mix = k; return this; }
  expr(e) { this.state.expr = e; return this; }

  apply(t) {
    const st = this.state, P = POSES;
    const A = typeof st.pose === 'object' ? st.pose : (P[st.pose] || P.idle);
    const B = st.pose2 ? (typeof st.pose2 === 'object' ? st.pose2 : P[st.pose2]) : null;
    const k = B ? THREE.MathUtils.clamp(st.mix, 0, 1) : 0;
    const lerpA = (a, b) => { if (!b) return a; return a.map((v, i) => v + (b[i] - v) * k); };
    const lerpN = (a = 0, b) => a + ((B && b !== undefined ? b : a) - a) * k;
    const sd = this.seed;
    const breathe = Math.sin(t * 2.1 + sd) * 0.012;
    const walk = st.walk, ph = st.walkPhase;
    const sw = Math.sin(ph) * walk;
    // body
    const sit = lerpN(A.sit || 0, B ? B.sit : undefined);
    const seat = (st.seatH ?? 0.5) / this.root.scale.x;
    this.body.position.y = Math.abs(Math.sin(ph)) * 0.05 * walk + (st.bounce || 0) - sit * (this.legLen - seat) + (st.yOff || 0);
    const lean = lerpA(A.lean || [0, 0], B ? (B.lean || A.lean || [0, 0]) : null);
    this.body.rotation.set(lean[0] + walk * 0.06 + (st.leanX || 0), 0, lean[1] + (st.leanZ || 0));
    this.torsoGroup.scale.y = 1 + breathe;
    if (st.tremble) { this.body.position.x = (noise1(t * 40 + sd) - 0.5) * 0.03 * st.tremble; }
    else this.body.position.x = 0;
    // arms
    const arms = [lerpA(A.aL, B?.aL), lerpA(A.aR, B?.aR)];
    for (let i = 0; i < 2; i++) {
      const a = this.arms[i], p = arms[i] || [0.1, 0, 0.1];
      let side = p[0], fwd = p[1], bend = p[2];
      if (st.armFn) { const o = st.armFn(i, t); if (o) { side += o[0] || 0; fwd += o[1] || 0; bend += o[2] || 0; } }
      fwd += (i === 0 ? -sw : sw) * 0.55;
      a.sh.rotation.set(-fwd, 0, a.side * side);
      a.el.rotation.set(-bend, 0, 0);
    }
    // legs
    const lL = lerpN(A.lL || 0, B?.lL), lR = lerpN(A.lR || 0, B?.lR);
    const spread = lerpN(A.spread || 0, B?.spread);
    this.legs[0].hip.rotation.set(-(lL + sw * 0.6), 0, spread * 0.6);
    this.legs[1].hip.rotation.set(-(lR - sw * 0.6), 0, -spread * 0.6);
    const kneeSit = sit * (st.legsOut ? 0.15 : 1.45);
    this.legs[0].knee.rotation.x = kneeSit + Math.max(0, -Math.sin(ph)) * 0.7 * walk + (A.kL || 0);
    this.legs[1].knee.rotation.x = kneeSit + Math.max(0, Math.sin(ph)) * 0.7 * walk + (A.kR || 0);
    // head
    const hd = lerpA(A.head || [0, 0, 0], B ? (B.head || A.head || [0, 0, 0]) : null);
    const look = st.look || [0, 0];
    this.neck.rotation.set(hd[0] + look[1] + Math.sin(t * 1.3 + sd) * 0.015, hd[1] + look[0], hd[2] + (st.tilt || 0));
    // face
    let blink = false;
    if (st.blink) { const period = 3.2 + (sd % 7) * 0.35; const ph2 = (t + sd * 0.37) % period; blink = ph2 < 0.11; }
    let mouth = null;
    if (st.talk) { const n = noise1(t * 9 + sd * 3.1); mouth = n > 0.62 ? 'talkA' : n > 0.36 ? 'talkB' : null; if (mouth === null && !['smile', 'smile_s', 'grin'].includes((this.exprMouth || ''))) mouth = 'flat'; }
    if (st.chew) { mouth = Math.sin(t * 12) > 0 ? 'chew' : 'flat'; }
    const tex = faceTexture(st.expr, { blink, mouth, glasses: !!this.glasses });
    if (this.faceMat.map !== tex) { this.faceMat.map = tex; this.faceMat.needsUpdate = true; }
    // shadow follows root on ground
    const rp = this.root.position;
    this.shadow.position.set(rp.x, (st.groundY ?? 0) + 0.012, rp.z);
    const s = this.root.scale.x * (1 - Math.min(0.5, (this.body.position.y + rp.y - (st.groundY ?? 0)) * 0.3));
    this.shadow.scale.set(s, s, s);
    this.shadow.visible = this.root.visible && !st.noShadow;
  }
}

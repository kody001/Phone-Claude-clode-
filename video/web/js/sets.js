// All 3D sets. Each builder returns { scene, update(t, s), ...anchors }.
import * as THREE from 'three';
import { clamp, lerp, noise1, rand } from './util.js';

// ---------------------------------------------------------------- material + texture helpers
export const lam = (color, o = {}) => new THREE.MeshLambertMaterial({ color, ...o });
export const phong = (color, sh = 40, o = {}) => new THREE.MeshPhongMaterial({ color, shininess: sh, specular: '#666677', ...o });
export const basic = (color, o = {}) => new THREE.MeshBasicMaterial({ color, ...o });
function M(geo, mat, x = 0, y = 0, z = 0, o = {}) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
  if (o.rx) m.rotation.x = o.rx; if (o.ry) m.rotation.y = o.ry; if (o.rz) m.rotation.z = o.rz;
  m.castShadow = o.cast ?? true; m.receiveShadow = o.recv ?? true; return m;
}
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
export function canvasTex(w, h, draw, repeat) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}
function checker(a, b, n = 8, line) {
  return (x, w, h) => { const s = w / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { x.fillStyle = (i + j) % 2 ? a : b; x.fillRect(i * s, j * s, s, s); } if (line) { x.strokeStyle = line; x.lineWidth = 2; for (let i = 0; i <= n; i++) { x.beginPath(); x.moveTo(i * s, 0); x.lineTo(i * s, h); x.moveTo(0, i * s); x.lineTo(w, i * s); x.stroke(); } } };
}
function planks(base, dark, n = 6) {
  return (x, w, h) => { x.fillStyle = base; x.fillRect(0, 0, w, h); const s = h / n; for (let i = 0; i < n; i++) { x.fillStyle = i % 2 ? base : shade(base, -0.06); x.fillRect(0, i * s, w, s); x.fillStyle = dark; x.fillRect(0, i * s, w, 2); const o = (i * 97) % w; x.fillRect(o, i * s, 2, s); } };
}
export function shade(hex, f) { const c = new THREE.Color(hex); if (f < 0) c.multiplyScalar(1 + f); else c.lerp(new THREE.Color('#ffffff'), f); return '#' + c.getHexString(); }
function gradientSky(top, bottom) {
  return canvasTex(16, 256, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, top); g.addColorStop(1, bottom); x.fillStyle = g; x.fillRect(0, 0, w, h); });
}
function skyDome(top, bottom, r = 60) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 16), new THREE.MeshBasicMaterial({ map: gradientSky(top, bottom), side: THREE.BackSide, fog: false, depthWrite: false }));
  m.renderOrder = -10; return m;
}
function lights(scene, o = {}) {
  const hemi = new THREE.HemisphereLight(o.sky || '#ffffff', o.ground || '#a58ce0', o.hemi ?? 1.5); scene.add(hemi);
  const key = new THREE.DirectionalLight(o.keyColor || '#fff4ea', o.key ?? 1.7);
  key.position.set(...(o.keyPos || [3, 7, 5])); key.castShadow = o.shadow !== false;
  const sc = o.shadowSize || 6;
  key.shadow.mapSize.set(o.shadowRes || 1024, o.shadowRes || 1024); key.shadow.camera.left = -sc; key.shadow.camera.right = sc; key.shadow.camera.top = sc; key.shadow.camera.bottom = -sc;
  key.shadow.camera.near = 0.5; key.shadow.camera.far = 40; key.shadow.bias = -0.0008; key.shadow.normalBias = 0.02; key.shadow.radius = 4;
  if (o.keyTarget) key.target.position.set(...o.keyTarget);
  scene.add(key); scene.add(key.target);
  const fill = new THREE.DirectionalLight(o.fillColor || '#d8ccff', o.fill ?? 0.55); fill.position.set(...(o.fillPos || [-4, 3, 6])); scene.add(fill);
  return { hemi, key, fill };
}
function lollipop(color, trunk = '#8a5fd0', h = 2.2, s = 1) {
  const g = new THREE.Group(); const mat = phong(color, 25); const tm = lam(trunk);
  g.add(M(new THREE.CylinderGeometry(0.05 * s, 0.08 * s, h, 8), tm, 0, h / 2, 0));
  const bg = new THREE.SphereGeometry(1, 18, 14);
  for (const [x, y, z, r] of [[0, h + 0.1, 0, 0.55], [0.32, h - 0.12, 0.1, 0.4], [-0.32, h - 0.08, -0.05, 0.42], [0.05, h + 0.48, 0.05, 0.36]]) { const m = M(bg, mat, x * s, y, z * s); m.scale.setScalar(r * s); g.add(m); }
  return g;
}

// ---------------------------------------------------------------- shared props
export function makePhone(screenColor = '#1b1530') {
  const g = new THREE.Group();
  g.add(M(new THREE.BoxGeometry(0.16, 0.3, 0.025), phong('#2a2338', 80), 0, 0, 0));
  const scr = M(new THREE.PlaneGeometry(0.14, 0.27), basic(screenColor), 0, 0, 0.0135, { cast: false }); g.add(scr); g.userData.screen = scr;
  return g;
}
export function makeGranola() {
  const g = new THREE.Group();
  const tex = canvasTex(256, 96, (x, w, h) => { x.fillStyle = '#ffcf4a'; x.fillRect(0, 0, w, h); x.fillStyle = '#e0543c'; x.fillRect(0, 0, w, 22); x.fillRect(0, h - 22, w, 22); x.fillStyle = '#5a2d12'; x.font = 'bold 40px Fredoka, sans-serif'; x.textAlign = 'center'; x.fillText('OAT BAR', w / 2, 64); });
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.09, 0.035), [lam('#ffcf4a'), lam('#ffcf4a'), lam('#ffcf4a'), lam('#ffcf4a'), new THREE.MeshLambertMaterial({ map: tex }), new THREE.MeshLambertMaterial({ map: tex })]);
  g.add(m); return g;
}
export function makeGuitar() {
  const g = new THREE.Group(); const wood = phong('#d9813a', 60), dark = lam('#5a2d12');
  const b1 = M(new THREE.CylinderGeometry(0.2, 0.2, 0.09, 28), wood, 0, -0.1, 0, { rx: Math.PI / 2 }); g.add(b1);
  const b2 = M(new THREE.CylinderGeometry(0.15, 0.15, 0.09, 28), wood, 0, 0.14, 0, { rx: Math.PI / 2 }); g.add(b2);
  g.add(M(new THREE.CylinderGeometry(0.055, 0.055, 0.1, 20), basic('#2a1408'), 0, 0.03, 0.01, { rx: Math.PI / 2 }));
  g.add(M(box(0.06, 0.55, 0.035), dark, 0, 0.5, 0.02)); g.add(M(box(0.1, 0.12, 0.04), dark, 0, 0.82, 0.02));
  return g;
}

// ================================================================ BUILDING (elevator cab + lobby/hallway)
export function buildBuilding() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#2a1a55');
  const L = lights(scene, { hemi: 1.25, key: 0.0, fill: 0.5, shadow: false, ground: '#b9a6ee' });
  const CW = 1.35, CD = 1.25, CH = 3.0;
  // --- cab
  const cab = new THREE.Group(); scene.add(cab);
  const steelTex = canvasTex(512, 512, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, '#cfcbe0'); g.addColorStop(0.5, '#e6e3f2'); g.addColorStop(1, '#c4c0d8'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(255,255,255,${Math.random() * 0.08})`; x.fillRect(Math.random() * w, 0, 1, h); }
    x.fillStyle = '#9a95b8'; x.fillRect(0, 0, 6, h); x.fillRect(w - 6, 0, 6, h);
  });
  const panelMat = phong('#ffffff', 70, { map: steelTex });
  const floorTex = canvasTex(512, 512, checker('#5a4c7a', '#4c406a', 6, '#3a3156'), [2, 2]);
  const floor = M(box(CW * 2, 0.1, CD * 2), lam('#ffffff', { map: floorTex }), 0, -0.05, 0, { cast: false }); cab.add(floor);
  const walls = [];
  const wallBack = M(box(CW * 2, CH, 0.08), panelMat, 0, CH / 2, -CD - 0.04, { cast: false }); cab.add(wallBack); walls.push({ m: wallBack, n: [0, 0, 1], p: -CD });
  const wallL = M(box(0.08, CH, CD * 2), panelMat, CW + 0.04, CH / 2, 0, { cast: false }); cab.add(wallL); walls.push({ m: wallL, n: [-1, 0, 0], p: CW });
  const wallR = M(box(0.08, CH, CD * 2), panelMat, -CW - 0.04, CH / 2, 0, { cast: false }); cab.add(wallR); walls.push({ m: wallR, n: [1, 0, 0], p: -CW });
  const ceil = M(box(CW * 2 + 0.16, 0.08, CD * 2 + 0.1), lam('#d9d4ea'), 0, CH + 0.04, 0, { cast: false }); cab.add(ceil);
  // wall panel seams + wooden lower band
  for (const w of [wallBack, wallL, wallR]) {
    const band = M(box(w === wallBack ? CW * 2 : 0.02, 0.9, w === wallBack ? 0.02 : CD * 2), lam('#8f6bc9'), 0, -CH / 2 + 0.45, 0, { cast: false });
    if (w === wallBack) band.position.z = 0.05; else band.position.x = w === wallL ? -0.05 : 0.05; w.add(band);
  }
  // handrails
  const railMat = phong('#f2efff', 120);
  const railB = M(new THREE.CylinderGeometry(0.025, 0.025, CW * 1.7, 12), railMat, 0, 1.0, -CD + 0.09, { rz: Math.PI / 2 }); cab.add(railB);
  for (const s of [-1, 1]) { const r = M(new THREE.CylinderGeometry(0.025, 0.025, CD * 1.5, 12), railMat, s * (CW - 0.09), 1.0, 0, { rx: Math.PI / 2 }); cab.add(r); }
  // ceiling light panel
  const lightTex = canvasTex(256, 192, (x, w, h) => { x.fillStyle = '#fffdf6'; x.fillRect(0, 0, w, h); x.strokeStyle = '#d6d0e6'; x.lineWidth = 6; for (let i = 1; i < 4; i++) { x.beginPath(); x.moveTo(i * w / 4, 0); x.lineTo(i * w / 4, h); x.stroke(); } for (let j = 1; j < 3; j++) { x.beginPath(); x.moveTo(0, j * h / 3); x.lineTo(w, j * h / 3); x.stroke(); } });
  const lightMat = basic('#ffffff', { map: lightTex });
  const lightPanel = M(new THREE.PlaneGeometry(1.5, 1.1), lightMat, 0, CH - 0.005, 0, { rx: Math.PI / 2, cast: false }); cab.add(lightPanel);
  // ceiling fan vent
  const fan = new THREE.Group(); fan.position.set(0.85, CH - 0.02, -0.75); cab.add(fan);
  fan.add(M(new THREE.CylinderGeometry(0.22, 0.22, 0.02, 32), lam('#3e3658'), 0, 0, 0, { cast: false }));
  const blades = new THREE.Group(); fan.add(blades);
  for (let i = 0; i < 5; i++) { const b = M(box(0.18, 0.01, 0.06), lam('#bdb6d6'), 0.09, -0.02, 0, { cast: false }); const p = new THREE.Group(); p.rotation.y = i / 5 * Math.PI * 2; p.add(b); blades.add(p); }
  fan.add(M(new THREE.TorusGeometry(0.22, 0.015, 6, 32), lam('#d9d4ea'), 0, -0.02, 0, { rx: Math.PI / 2, cast: false }));
  // --- front wall (shared with lobby) with door opening
  const DW = 0.68, DH = 2.35, FZ = CD + 0.05;
  const front = new THREE.Group(); scene.add(front);
  const lobbyWallMat = lam('#e9dcff');
  const fl = M(box(6, CH + 0.6, 0.12), panelMat, -(DW + 3), (CH + 0.6) / 2, FZ); front.add(fl);
  const fr = M(box(6, CH + 0.6, 0.12), panelMat, DW + 3, (CH + 0.6) / 2, FZ); front.add(fr);
  const ft = M(box(DW * 2, CH + 0.6 - DH, 0.12), panelMat, 0, DH + (CH + 0.6 - DH) / 2, FZ); front.add(ft);
  // lobby-side skin on the front wall (purple paint) – slightly in front
  const skinL = M(box(6, CH + 0.6, 0.02), lobbyWallMat, -(DW + 3) - 0.0, (CH + 0.6) / 2, FZ + 0.07, { cast: false }); front.add(skinL);
  const skinR = M(box(6, CH + 0.6, 0.02), lobbyWallMat, DW + 3, (CH + 0.6) / 2, FZ + 0.07, { cast: false }); front.add(skinR);
  const skinT = M(box(DW * 2, CH + 0.6 - DH, 0.02), lobbyWallMat, 0, DH + (CH + 0.6 - DH) / 2, FZ + 0.07, { cast: false }); front.add(skinT);
  // door frame (lobby side)
  const frameMat = phong('#7b5cd6', 60);
  front.add(M(box(0.12, DH + 0.1, 0.06), frameMat, -DW - 0.06, DH / 2, FZ + 0.1)); front.add(M(box(0.12, DH + 0.1, 0.06), frameMat, DW + 0.06, DH / 2, FZ + 0.1));
  front.add(M(box(DW * 2 + 0.24, 0.12, 0.06), frameMat, 0, DH + 0.06, FZ + 0.1));
  // doors
  const doorTex = canvasTex(256, 512, (x, w, h) => { const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, '#d8d4ea'); g.addColorStop(1, '#bcb6d4'); x.fillStyle = g; x.fillRect(0, 0, w, h); for (let i = 0; i < 300; i++) { x.fillStyle = `rgba(255,255,255,${Math.random() * 0.1})`; x.fillRect(Math.random() * w, 0, 1, h); } x.fillStyle = '#8f89ad'; x.fillRect(0, 0, 4, h); x.fillRect(w - 4, 0, 4, h); });
  const doorMat = phong('#ffffff', 90, { map: doorTex });
  const doorL = M(box(DW, DH, 0.05), doorMat, -DW / 2, DH / 2, FZ, { cast: true });
  const doorR = M(box(DW, DH, 0.05), doorMat, DW / 2, DH / 2, FZ, { cast: true });
  scene.add(doorL, doorR);
  // inside floor indicator (above door, cab side) + lobby side indicator
  const indCanvas = document.createElement('canvas'); indCanvas.width = 256; indCanvas.height = 96;
  const indTex = new THREE.CanvasTexture(indCanvas); indTex.colorSpace = THREE.SRGBColorSpace;
  const drawInd = (txt, arrow, glow = 1) => {
    const x = indCanvas.getContext('2d'); x.fillStyle = '#140d22'; x.fillRect(0, 0, 256, 96);
    x.strokeStyle = '#3c2f5c'; x.lineWidth = 6; x.strokeRect(3, 3, 250, 90);
    x.shadowColor = '#ff7a2f'; x.shadowBlur = 18 * glow; x.fillStyle = `rgba(255,140,60,${0.25 + 0.75 * glow})`; x.font = 'bold 70px "Lilita One", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(txt, 150, 52);
    if (arrow) { x.beginPath(); if (arrow === 'up') { x.moveTo(50, 28); x.lineTo(72, 62); x.lineTo(28, 62); } else { x.moveTo(50, 66); x.lineTo(72, 32); x.lineTo(28, 32); } x.fill(); }
    x.shadowBlur = 0; indTex.needsUpdate = true;
  };
  let indKey = '';
  const indIn = M(new THREE.PlaneGeometry(0.6, 0.225), basic('#ffffff', { map: indTex }), 0, DH + 0.35, FZ - 0.065, { ry: Math.PI, cast: false }); scene.add(indIn);
  const indOut = M(new THREE.PlaneGeometry(0.6, 0.225), basic('#ffffff', { map: indTex }), 0, DH + 0.42, FZ + 0.085, { cast: false }); scene.add(indOut);
  // control panel inside (right of doors when facing them = -x side)
  const panelCanvas = document.createElement('canvas'); panelCanvas.width = 256; panelCanvas.height = 640;
  const panelTex = new THREE.CanvasTexture(panelCanvas); panelTex.colorSpace = THREE.SRGBColorSpace; panelTex.anisotropy = 8;
  let panelKey = '';
  const BTN = []; // layout
  const labels = ['9', '8', '7', '6', '5', '4', '3', '2', '1', 'L'];
  labels.forEach((l, i) => BTN.push({ l, x: i % 2 ? 176 : 80, y: 150 + Math.floor(i / 2) * 70 }));
  BTN.push({ l: '<|>', x: 80, y: 510 }, { l: '>|<', x: 176, y: 510 }, { l: 'BELL', x: 128, y: 585 });
  const drawPanel = (lit) => {
    const x = panelCanvas.getContext('2d'); const g = x.createLinearGradient(0, 0, 256, 0); g.addColorStop(0, '#b9b3d2'); g.addColorStop(0.5, '#e4e0f2'); g.addColorStop(1, '#b0aac8');
    x.fillStyle = g; x.fillRect(0, 0, 256, 640); x.strokeStyle = '#7e779e'; x.lineWidth = 8; x.strokeRect(4, 4, 248, 632);
    // speaker grille
    x.fillStyle = '#5a5378'; for (let i = 0; i < 6; i++) for (let j = 0; j < 9; j++) { x.beginPath(); x.arc(64 + j * 16, 40 + i * 14, 4, 0, Math.PI * 2); x.fill(); }
    BTN.forEach(b => {
      const on = lit === 'all' || (Array.isArray(lit) && lit.includes(b.l));
      x.beginPath(); x.arc(b.x, b.y, 26, 0, Math.PI * 2); x.fillStyle = '#8c86a8'; x.fill();
      x.beginPath(); x.arc(b.x, b.y, 21, 0, Math.PI * 2); x.fillStyle = on ? '#ffb347' : '#f1eef9'; x.fill();
      if (on) { x.shadowColor = '#ffa133'; x.shadowBlur = 22; x.beginPath(); x.arc(b.x, b.y, 21, 0, Math.PI * 2); x.fill(); x.shadowBlur = 0; }
      x.fillStyle = on ? '#5a2000' : '#3d3555'; x.textAlign = 'center'; x.textBaseline = 'middle';
      if (b.l === 'BELL') { x.font = 'bold 26px sans-serif'; x.beginPath(); x.moveTo(b.x - 11, b.y + 8); x.quadraticCurveTo(b.x - 11, b.y - 13, b.x, b.y - 13); x.quadraticCurveTo(b.x + 11, b.y - 13, b.x + 11, b.y + 8); x.closePath(); x.fill(); x.beginPath(); x.arc(b.x, b.y + 11, 3.5, 0, 7); x.fill(); x.fillStyle = on ? '#5a2000' : '#c0392b'; }
      else if (b.l === '<|>' || b.l === '>|<') { x.font = 'bold 22px sans-serif'; x.fillText(b.l === '<|>' ? '◀|▶' : '▶|◀', b.x, b.y + 1); }
      else { x.font = 'bold 26px Fredoka, sans-serif'; x.fillText(b.l, b.x, b.y + 1); }
    });
    panelTex.needsUpdate = true;
  };
  const panel = M(box(0.32, 0.8, 0.03), [lam('#9c96b8'), lam('#9c96b8'), lam('#9c96b8'), lam('#9c96b8'), new THREE.MeshPhongMaterial({ map: panelTex, shininess: 60 }), lam('#9c96b8')], -0.98, 1.35, FZ - 0.075, { ry: Math.PI, cast: false });
  scene.add(panel);
  // --- lobby / hallway outside
  const lobby = new THREE.Group(); scene.add(lobby);
  const lobbyFloorTex = canvasTex(512, 512, checker('#f3e9ff', '#d9c6f5', 4), [6, 4]);
  lobby.add(M(box(14, 0.1, 9), lam('#ffffff', { map: lobbyFloorTex }), 0, -0.05, FZ + 4.5, { cast: false }));
  lobby.add(M(box(0.12, 3.6, 9), lam('#d8c6ff'), -6.5, 1.8, FZ + 4.5, { cast: false }));
  lobby.add(M(box(0.12, 3.6, 9), lam('#d8c6ff'), 6.5, 1.8, FZ + 4.5, { cast: false }));
  // baseboard + wainscot on front wall lobby side
  lobby.add(M(box(12, 0.9, 0.04), lam('#b79cf0'), 0, 0.45, FZ + 0.09, { cast: false }));
  // call button plate
  const cbTex = canvasTex(64, 128, (x, w, h) => { x.fillStyle = '#d9d4ea'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; x.beginPath(); x.arc(32, 44, 16, 0, 7); x.fill(); x.beginPath(); x.arc(32, 88, 16, 0, 7); x.fill(); x.fillStyle = '#5a5378'; x.beginPath(); x.moveTo(32, 34); x.lineTo(42, 52); x.lineTo(22, 52); x.fill(); x.beginPath(); x.moveTo(32, 98); x.lineTo(42, 80); x.lineTo(22, 80); x.fill(); });
  const callBtn = M(box(0.14, 0.28, 0.03), [lam('#9c96b8'), lam('#9c96b8'), lam('#9c96b8'), lam('#9c96b8'), new THREE.MeshPhongMaterial({ map: cbTex }), lam('#9c96b8')], DW + 0.45, 1.2, FZ + 0.1, { cast: false });
  lobby.add(callBtn);
  // floor plaque
  const plaqueCanvas = document.createElement('canvas'); plaqueCanvas.width = 256; plaqueCanvas.height = 256;
  const plaqueTex = new THREE.CanvasTexture(plaqueCanvas); plaqueTex.colorSpace = THREE.SRGBColorSpace;
  let plaqueKey = ''; const drawPlaque = (txt) => { if (txt === plaqueKey) return; plaqueKey = txt; const x = plaqueCanvas.getContext('2d'); x.fillStyle = '#3b2a7a'; x.beginPath(); x.roundRect(0, 0, 256, 256, 40); x.fill(); x.fillStyle = '#fff'; x.font = 'bold 170px "Lilita One", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, 128, 140); plaqueTex.needsUpdate = true; };
  drawPlaque('L');
  lobby.add(M(new THREE.PlaneGeometry(0.5, 0.5), basic('#fff', { map: plaqueTex, transparent: true }), -DW - 0.7, 2.0, FZ + 0.11, { cast: false }));
  // mailboxes on left side wall
  const mbTex = canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#c8b8ec'; x.fillRect(0, 0, w, h); x.strokeStyle = '#8a74c4'; x.lineWidth = 6; for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { x.strokeRect(10 + i * 60, 12 + j * 80, 52, 70); x.fillStyle = '#8a74c4'; x.fillRect(26 + i * 60, 36 + j * 80, 20, 6); } });
  lobby.add(M(box(0.08, 1.0, 1.6), [new THREE.MeshLambertMaterial({ map: mbTex }), lam('#c8b8ec'), lam('#c8b8ec'), lam('#c8b8ec'), lam('#c8b8ec'), lam('#c8b8ec')], -6.42, 1.5, FZ + 2.5));
  // plants
  const pot = (x, z) => { const g = new THREE.Group(); g.add(M(new THREE.CylinderGeometry(0.22, 0.17, 0.4, 20), lam('#ffffff'), 0, 0.2, 0)); const b = M(new THREE.SphereGeometry(0.35, 18, 14), phong('#3fbf8f', 20), 0, 0.68, 0); b.scale.y = 1.2; g.add(b); g.position.set(x, 0, z); return g; };
  lobby.add(pot(2.3, FZ + 0.5)); lobby.add(pot(-2.3, FZ + 0.5));
  // ceiling lights in lobby (emissive strips)
  for (let i = 0; i < 3; i++) lobby.add(M(box(1.6, 0.04, 0.3), basic('#fffaf0'), 0, 3.58, FZ + 1.5 + i * 2.5, { cast: false }));
  lobby.add(M(box(14, 0.1, 9), lam('#efe6ff'), 0, 3.65, FZ + 4.5, { cast: false }));
  // stairs door sign
  const stTex = canvasTex(256, 96, (x, w, h) => { x.fillStyle = '#2bb673'; x.beginPath(); x.roundRect(0, 0, w, h, 16); x.fill(); x.fillStyle = '#fff'; x.font = 'bold 56px "Lilita One", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('STAIRS', w / 2, h / 2 + 3); });
  lobby.add(M(box(1.1, 2.2, 0.06), phong('#a98be8', 40), 4.6, 1.1, FZ + 0.1));
  lobby.add(M(new THREE.PlaneGeometry(0.8, 0.3), basic('#fff', { map: stTex }), 4.6, 2.45, FZ + 0.14, { cast: false }));
  // key light for lobby + cab spot
  const spot = new THREE.SpotLight('#fff6ea', 18, 6, 1.15, 0.6, 1.2); spot.position.set(0, CH - 0.05, 0.2); spot.target.position.set(0, 0, 0.1);
  spot.castShadow = true; spot.shadow.mapSize.set(1024, 1024); spot.shadow.bias = -0.0005; spot.shadow.radius = 5; spot.shadow.camera.near = 0.3;
  scene.add(spot, spot.target);
  const lobbyKey = new THREE.DirectionalLight('#fff3e8', 1.1); lobbyKey.position.set(2.5, 6, FZ + 6); lobbyKey.target.position.set(0, 0, FZ + 1);
  lobbyKey.castShadow = true; lobbyKey.shadow.mapSize.set(1024, 1024); Object.assign(lobbyKey.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 0.5, far: 20 }); lobbyKey.shadow.bias = -0.0008; lobbyKey.shadow.radius = 4;
  scene.add(lobbyKey, lobbyKey.target);
  const fillIn = new THREE.PointLight('#ffeedd', 2.2, 5, 1.5); fillIn.position.set(0, 1.7, 0.9); scene.add(fillIn);

  const base = { hemi: L.hemi.intensity, spot: spot.intensity, fill: L.fill.intensity, fillIn: fillIn.intensity };
  const tmpV = new THREE.Vector3();
  return {
    scene, cab, doorL, doorR, panel, spot, fan, blades, lobby, BTN, DW, FZ, CW, CD, CH,
    callBtn, drawPlaque, front, indIn, indOut,
    // s: {door: 0 closed..1 open, floor:'6', arrow, lit, light: 0..1, tint:'#hex', flicker, fan: rotation, cut: bool, camera}
    update(t, s, camera) {
      const open = clamp(s.door ?? 0);
      doorL.position.x = -DW / 2 - open * (DW - 0.02); doorR.position.x = DW / 2 + open * (DW - 0.02);
      const k = `${s.floor ?? '1'}|${s.arrow || ''}|${(s.indGlow ?? 1).toFixed(2)}`; if (k !== indKey) { indKey = k; drawInd(s.floor ?? '1', s.arrow, s.indGlow ?? 1); }
      const pk = JSON.stringify(s.lit || []); if (pk !== panelKey) { panelKey = pk; drawPanel(s.lit || []); }
      const lv = s.light ?? 1;
      const tint = new THREE.Color(s.tint || '#ffffff');
      spot.intensity = base.spot * lv; spot.color.copy(new THREE.Color('#fff6ea').multiply(tint));
      L.hemi.intensity = base.hemi * (0.45 + 0.55 * lv); L.hemi.color.copy(tint);
      fillIn.intensity = base.fillIn * lv; fillIn.color.copy(new THREE.Color('#ffeedd').multiply(tint));
      lightMat.color.setScalar(0.35 + 0.65 * lv).multiply(tint);
      lobbyKey.intensity = s.lobbyLight ?? 1.1;
      blades.rotation.y = s.fan ?? t * 9;
      // cutaway: hide walls between camera and interior
      if (camera) {
        for (const w of walls) {
          const c = camera.position; const d = w.n[0] ? (c.x - w.p) * w.n[0] : (c.z - w.p) * w.n[2];
          w.m.visible = d > -0.02 || s.noCut;
        }
        ceil.visible = camera.position.y < CH + 0.02 || s.noCut;
        lightPanel.visible = ceil.visible;
        const inside = camera.position.z < FZ;
        lobby.visible = s.lobby ?? (!inside || open > 0.02);
        const cutF = !!s.cutFront && !inside;
        front.visible = !cutF; doorL.visible = doorR.visible = !cutF; indOut.visible = !cutF; indIn.visible = !cutF; panel.visible = !cutF;
        if (cutF) lobby.visible = false;
      }
    },
  };
}

// ================================================================ STREET (opening)
export function buildStreet() {
  const scene = new THREE.Scene();
  scene.add(skyDome('#8a6cf0', '#ffc6e8'));
  scene.fog = new THREE.Fog('#d6b8f2', 18, 55);
  lights(scene, { hemi: 1.3, key: 1.9, keyPos: [6, 9, 6], shadowSize: 12, sky: '#fff3ff', ground: '#9c86e0' });
  // ground / sidewalk / road
  scene.add(M(box(80, 0.1, 6), lam('#5d4f86'), 0, -0.06, 6, { cast: false }));
  const dash = lam('#fff4d6');
  for (let i = -20; i < 20; i++) scene.add(M(box(1.2, 0.02, 0.15), dash, i * 2.4, 0.0, 6, { cast: false }));
  const swTex = canvasTex(256, 256, checker('#e9ddff', '#d8c8f6', 2, '#bfaee6'), [40, 2]);
  scene.add(M(box(80, 0.2, 4), lam('#ffffff', { map: swTex }), 0, 0.0, 1, { cast: false }));
  scene.add(M(box(80, 0.1, 30), lam('#7fdcc0'), 0, -0.07, -16, { cast: false }));
  // apartment building
  const bld = new THREE.Group(); bld.position.set(-6, 0, -5); scene.add(bld);
  const winTex = canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#f4b6c9'; x.fillRect(0, 0, w, h); x.fillStyle = '#5c4b9a'; x.fillRect(40, 30, 176, 190); x.fillStyle = '#8fd6ff'; x.fillRect(50, 40, 74, 170); x.fillRect(132, 40, 74, 170); x.fillStyle = 'rgba(255,255,255,0.5)'; x.fillRect(58, 48, 14, 150); x.fillStyle = '#e48fb0'; x.fillRect(30, 220, 196, 16); }, [6, 10]);
  bld.add(M(box(9, 24, 6), lam('#ffffff', { map: winTex }), 0, 12, 0));
  bld.add(M(box(9.4, 0.5, 6.4), lam('#d9709c'), 0, 24.2, 0));
  bld.add(M(box(2.0, 2.6, 0.3), phong('#6a4cc8', 50), 0, 1.3, 3.05));
  bld.add(M(box(2.6, 0.2, 1.2), lam('#ff8fb1'), 0, 2.8, 3.5));
  const glass = M(box(1.6, 2.2, 0.1), phong('#a8e8ff', 100, { transparent: true, opacity: 0.7 }), 0, 1.1, 3.25); bld.add(glass);
  const signTex = canvasTex(512, 128, (x, w, h) => { x.fillStyle = '#3b2a7a'; x.beginPath(); x.roundRect(0, 0, w, h, 30); x.fill(); x.fillStyle = '#fff'; x.font = 'bold 72px "Lilita One", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('MAPLE APTS', w / 2, h / 2 + 4); });
  bld.add(M(new THREE.PlaneGeometry(2.4, 0.6), basic('#fff', { map: signTex, transparent: true }), 0, 3.4, 3.12, { cast: false }));
  // other buildings
  [[6, -7, 7, 14, '#ffd38a'], [14, -8, 6, 18, '#9fe3ff'], [-16, -9, 6, 16, '#c9a9ff'], [22, -9, 7, 12, '#ffb0c8']].forEach(([x, z, w, h, c]) => { scene.add(M(box(w, h, 5), lam(c), x, h / 2, z)); });
  // trees
  for (let i = -6; i < 8; i++) { const tr = lollipop(i % 2 ? '#4fa3ff' : '#7a6cff', '#9a6ad8', 2.4, 1.1); tr.position.set(i * 4 + 1.5, 0, -1.3 + (i % 3) * 0.2); scene.add(tr); }
  // bus stop
  const bs = new THREE.Group(); bs.position.set(9, 0, 1.6); scene.add(bs);
  bs.add(M(new THREE.CylinderGeometry(0.05, 0.05, 2.6, 10), lam('#5a5378'), 0, 1.3, 0));
  const bsTex = canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#2b6cf0'; x.beginPath(); x.arc(128, 128, 124, 0, 7); x.fill(); x.fillStyle = '#fff'; x.font = 'bold 110px "Lilita One"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('BUS', 128, 136); });
  bs.add(M(new THREE.CircleGeometry(0.4, 32), basic('#fff', { map: bsTex }), 0, 2.7, 0.06, { cast: false }));
  bs.add(M(box(2.4, 0.08, 0.5), phong('#ff7eb6'), 1.5, 0.55, -0.3)); bs.add(M(box(0.08, 0.55, 0.08), lam('#5a5378'), 0.5, 0.27, -0.3)); bs.add(M(box(0.08, 0.55, 0.08), lam('#5a5378'), 2.5, 0.27, -0.3));
  bs.add(M(box(2.8, 0.08, 1.2), phong('#ffffff', 60, { transparent: true, opacity: 0.55 }), 1.5, 2.3, -0.4));
  const sun = M(new THREE.SphereGeometry(2.4, 24, 16), basic('#fff2b0', { fog: false }), 18, 16, -40, { cast: false }); scene.add(sun);
  return { scene, buildingDoor: new THREE.Vector3(-6, 0, -1.9), busStop: new THREE.Vector3(9, 0, 1.6), update() { } };
}

// ================================================================ PURPLE VOID STUDIO
export function buildVoid(color = '#4425c8') {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(color);
  scene.fog = new THREE.Fog(color, 9, 26);
  const L = lights(scene, { hemi: 1.35, key: 1.6, keyPos: [2, 8, 6], shadowSize: 7, sky: '#fff6ff', ground: '#7b5ae8' });
  const floorMat = lam(color); floorMat.color.multiplyScalar(1.12);
  scene.add(M(new THREE.PlaneGeometry(80, 80), floorMat, 0, 0, 0, { rx: -Math.PI / 2, cast: false }));
  // horizon glow
  const glowTex = canvasTex(16, 256, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.75, 'rgba(160,130,255,0.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
  const glow = M(new THREE.PlaneGeometry(80, 10), basic('#fff', { map: glowTex, transparent: true, depthWrite: false, fog: false }), 0, 2.5, -20, { cast: false }); scene.add(glow);
  // spotlight pool
  const poolTex = canvasTex(256, 256, (x, w, h) => { const g = x.createRadialGradient(128, 128, 10, 128, 128, 128); g.addColorStop(0, 'rgba(255,240,255,0.35)'); g.addColorStop(1, 'rgba(255,240,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
  const pool = M(new THREE.PlaneGeometry(6, 6), basic('#fff', { map: poolTex, transparent: true, depthWrite: false }), 0, 0.005, 0, { rx: -Math.PI / 2, cast: false }); scene.add(pool);
  return { scene, L, pool, setColor(c) { scene.background.set(c); scene.fog.color.set(c); floorMat.color.set(c).multiplyScalar(1.12); }, update(t, s) { pool.visible = s.pool !== false; L.key.intensity = s.key ?? 1.6; L.hemi.intensity = s.hemi ?? 1.35; } };
}

// ================================================================ SHAFT CUTAWAY
export function buildShaft() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#1c1240');
  scene.fog = new THREE.Fog('#1c1240', 14, 40);
  const L = lights(scene, { hemi: 1.0, key: 1.4, keyPos: [5, 20, 10], shadow: false, sky: '#e8dcff', ground: '#4a2e9a' });
  const FH = 3.6; // floor height
  const shaft = new THREE.Group(); scene.add(shaft);
  // back wall of shaft
  const wallTex = canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#4a3a86'; x.fillRect(0, 0, w, h); x.strokeStyle = '#3c2e70'; x.lineWidth = 4; for (let j = 0; j < 8; j++) for (let i = 0; i < 4; i++) x.strokeRect(i * 64 + (j % 2) * 32, j * 32, 64, 32); }, [3, 12]);
  shaft.add(M(box(3.4, FH * 12, 0.2), lam('#ffffff', { map: wallTex }), 0, FH * 6, -1.6, { cast: false }));
  // side walls of building with floors
  const slabMat = lam('#b9a3f0'), sideMat = lam('#6a54b8');
  for (let f = 0; f <= 11; f++) {
    const y = f * FH;
    for (const s of [-1, 1]) {
      shaft.add(M(box(4, 0.35, 3.4), slabMat, s * 3.7, y, 0, { cast: false }));
      shaft.add(M(box(4, FH - 0.35, 0.2), lam('#e3d6ff'), s * 3.7, y + FH / 2, -1.6, { cast: false }));
      // floor number
      const nt = canvasTex(128, 128, (x, w, h) => { x.fillStyle = '#ffd34d'; x.beginPath(); x.arc(64, 64, 60, 0, 7); x.fill(); x.fillStyle = '#2a1a55'; x.font = 'bold 84px "Lilita One"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(f === 0 ? 'L' : String(f), 64, 70); });
      if (s === -1) shaft.add(M(new THREE.PlaneGeometry(0.7, 0.7), basic('#fff', { map: nt, transparent: true }), -2.2, y + 1.7, -1.45, { cast: false }));
    }
    // landing doors on the right side
    shaft.add(M(box(0.08, 2.3, 1.3), phong('#cfc8ea', 60), 1.72, y + 1.33, 0));
  }
  // rails
  const railMat = phong('#d9d2f2', 80);
  for (const s of [-1, 1]) shaft.add(M(box(0.08, FH * 12, 0.1), railMat, s * 1.62, FH * 6, -0.2));
  // car
  const car = new THREE.Group(); scene.add(car);
  const carW = 2.6, carH = 3.0;
  car.add(M(box(carW, 0.12, 2.4), lam('#5a4c7a'), 0, 0, 0));
  car.add(M(box(carW, 0.12, 2.4), lam('#cfcbe0'), 0, carH, 0));
  car.add(M(box(carW, carH, 0.08), phong('#d6d2ea', 60), 0, carH / 2, -1.2));
  car.add(M(box(0.08, carH, 2.4), phong('#d6d2ea', 60), -carW / 2, carH / 2, 0));
  car.add(M(box(0.08, carH, 2.4), phong('#d6d2ea', 60), carW / 2, carH / 2, 0));
  car.add(M(box(1.6, 0.04, 1.1), basic('#fffaf0'), 0, carH - 0.07, 0, { cast: false }));
  // sling + brakes
  const sling = phong('#ffcf4a', 50);
  car.add(M(box(carW + 0.3, 0.18, 0.3), sling, 0, carH + 0.3, -0.2));
  for (const s of [-1, 1]) car.add(M(box(0.15, carH + 0.5, 0.18), sling, s * (carW / 2 + 0.08), carH / 2 + 0.05, -0.2));
  const brakes = [];
  for (const s of [-1, 1]) for (const y of [0.25, carH + 0.15]) { const b = M(box(0.18, 0.25, 0.28), phong('#ff5f5f', 60), s * 1.52, y, -0.2); car.add(b); brakes.push({ b, s }); }
  // cables
  const cables = [];
  const cableMat = phong('#e6e0ff', 100);
  for (let i = 0; i < 6; i++) { const c = M(new THREE.CylinderGeometry(0.022, 0.022, 1, 8), cableMat, -0.35 + i * 0.14, 0, -0.2, { cast: false }); scene.add(c); cables.push(c); }
  // machine room at top
  const top = FH * 11.4;
  const sheave = M(new THREE.CylinderGeometry(0.55, 0.55, 0.9, 28), phong('#8a7ad8', 50), 0, top, -0.2, { rz: Math.PI / 2 }); scene.add(sheave);
  scene.add(M(box(3.4, 0.4, 3), lam('#5a4c9a'), 0, top - 0.8, 0));
  // counterweight
  const cw = M(box(0.9, 2.2, 0.3), phong('#7a7290', 40), 0, 0, -1.3); scene.add(cw);
  const glowCanvasTex = canvasTex(64, 64, (x, w, h) => { const g = x.createRadialGradient(32, 32, 2, 32, 32, 32); g.addColorStop(0, 'rgba(255,90,90,1)'); g.addColorStop(1, 'rgba(255,90,90,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
  const brakeGlow = brakes.map(({ b }) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowCanvasTex, transparent: true, depthWrite: false, opacity: 0 })); s.scale.setScalar(0.9); b.add(s); return s; });
  // tiny window people (silhouettes) inside car front: just two small heads visible through cut
  return {
    scene, car, FH, cables, brakes, brakeGlow, sheave, top,
    update(t, s) {
      const y = s.carY ?? FH * 6.5; car.position.y = y + (s.shake || 0);
      for (const c of cables) { const y0 = y + carH + 0.4, y1 = top; c.scale.y = y1 - y0; c.position.y = (y0 + y1) / 2; c.material.emissive = new THREE.Color(s.cableGlow ? '#3a2a00' : '#000000'); }
      cw.position.y = top - 1 - (y - FH * 2) * 0.9;
      sheave.rotation.x = -y * 1.2;
      brakeGlow.forEach(g => g.material.opacity = s.brakeGlow || 0);
      brakes.forEach(({ b, s: sd }) => b.position.x = sd * (1.52 + (s.brakeOpen ?? 0) * 0.15));
      cables.forEach(c => c.material.color.set(s.cableHi ? '#fff2a8' : '#e6e0ff'));
    },
  };
}

// ================================================================ CROSS-SECTION BUILDING (bedrooms stacked)
export function buildStack() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#1a1040');
  scene.add(skyDome('#120a35', '#3a2470'));
  const L = lights(scene, { hemi: 0.95, key: 0.9, keyPos: [3, 12, 8], shadowSize: 10, sky: '#cfc0ff', ground: '#3a2a80' });
  const RH = 3.0, RW = 5, RD = 3.2;
  const rooms = {};
  const mk = (name, y, wall, floorC) => {
    const g = new THREE.Group(); g.position.y = y; scene.add(g);
    g.add(M(box(RW, 0.25, RD), lam(floorC), 0, -0.125, 0));
    g.add(M(box(RW, RH, 0.15), lam(wall), 0, RH / 2, -RD / 2));
    g.add(M(box(0.15, RH, RD), lam(shade(wall, -0.12)), -RW / 2, RH / 2, 0));
    g.add(M(box(0.15, RH, RD), lam(shade(wall, -0.12)), RW / 2, RH / 2, 0));
    const lamp = new THREE.PointLight('#ffd9a8', 3.5, 6, 1.6); lamp.position.set(-1.2, 2.2, 0.5); g.add(lamp);
    rooms[name] = g; return g;
  };
  // floor 3 (Patterson), 8 (you), 9 (alex) — floors in between implied by gaps
  const r3 = mk('patterson', -RH - 1.6, '#c9e7c3', '#8b6a4a');
  const r8 = mk('you', 0, '#ffd0a8', '#9b6b4a');
  const r9 = mk('alex', RH + 0.25, '#c9c3ff', '#7a5a9a');
  // gap ladders (floors 4–7) as dark slabs with dots
  scene.add(M(box(RW + 0.4, 1.2, RD), lam('#2a1d5a'), 0, -1.0, 0));
  // furniture
  const bed = (g, x, c) => { g.add(M(box(1.8, 0.4, 1.1), lam('#ffffff'), x, 0.3, -0.9)); g.add(M(box(1.8, 0.12, 1.1), lam(c), x + 0.1, 0.56, -0.9)); g.add(M(box(0.4, 0.15, 0.7), lam('#ffffff'), x - 0.65, 0.6, -0.9)); };
  bed(r8, 1.4, '#ff9a52'); bed(r9, 1.4, '#8d86f2');
  // posters / window
  const win = (g, x) => { g.add(M(box(1.0, 1.0, 0.05), lam('#3a2a80'), x, 1.8, -RD / 2 + 0.1)); g.add(M(new THREE.CircleGeometry(0.15, 20), basic('#fff6c8'), x + 0.2, 2.0, -RD / 2 + 0.14, { cast: false })); };
  win(r8, -1.2); win(r9, -1.2);
  // Patterson's armchair
  r3.add(M(box(1.2, 0.5, 0.9), lam('#b05a7a'), -0.6, 0.25, -0.7)); r3.add(M(box(1.2, 0.8, 0.2), lam('#b05a7a'), -0.6, 0.8, -1.1));
  r3.add(M(box(0.9, 0.6, 0.5), lam('#5a4c7a'), 1.5, 0.3, -1.2)); // tv stand
  // chair for you
  r8.add(M(box(0.6, 0.08, 0.6), lam('#5a4c9a'), -0.9, 0.48, 0)); for (const [x, z] of [[-1.15, -0.25], [-0.65, -0.25], [-1.15, 0.25], [-0.65, 0.25]]) r8.add(M(box(0.06, 0.48, 0.06), lam('#5a4c9a'), x, 0.24, z));
  // floor labels
  return { scene, rooms, RH, update() { } };
}

// ================================================================ CLASSROOM
export function buildClassroom() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#2a1a55');
  lights(scene, { hemi: 1.3, key: 1.5, keyPos: [-5, 8, 4], shadowSize: 9 });
  const fTex = canvasTex(512, 512, planks('#d9773d', '#a8552a', 8), [3, 3]);
  scene.add(M(box(14, 0.1, 12), lam('#fff', { map: fTex }), 0, -0.05, 0, { cast: false }));
  scene.add(M(box(14, 4, 0.2), lam('#c8b4ff'), 0, 2, -5, { cast: false }));
  scene.add(M(box(0.2, 4, 12), lam('#b49cf2'), -7, 2, 0, { cast: false }));
  scene.add(M(box(0.2, 4, 12), lam('#b49cf2'), 7, 2, 0, { cast: false }));
  const bTex = canvasTex(1024, 384, (x, w, h) => { x.fillStyle = '#2f5a4a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#8a6a4a'; x.lineWidth = 24; x.strokeRect(0, 0, w, h); x.fillStyle = 'rgba(255,255,255,0.85)'; x.font = '64px "Fredoka"'; x.fillText('MATH', 60, 100); x.font = '52px "Fredoka"'; x.fillText('x² + 2x − 8 = 0', 60, 200); x.fillText('a² + b² = c²', 520, 200); x.fillText('HOMEWORK DUE TODAY!', 60, 300); });
  scene.add(M(new THREE.PlaneGeometry(6, 2.2), lam('#fff', { map: bTex }), 0, 2.2, -4.88, { cast: false }));
  const desks = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
    const g = new THREE.Group(); g.position.set((c - 1) * 2.4, 0, -2.5 + r * 1.9);
    g.add(M(box(1.0, 0.06, 0.6), lam('#ffffff'), 0, 0.78, 0)); for (const [x, z] of [[-0.45, -0.25], [0.45, -0.25], [-0.45, 0.25], [0.45, 0.25]]) g.add(M(box(0.05, 0.78, 0.05), lam('#5a4c9a'), x, 0.39, z));
    g.add(M(box(0.55, 0.06, 0.5), lam('#7a6cd8'), 0, 0.5, 0.55)); scene.add(g); desks.push(g);
  }
  // windows
  for (let i = 0; i < 3; i++) scene.add(M(box(0.05, 1.6, 1.4), basic('#bfe9ff'), 6.88, 2.2, -3 + i * 2.6, { cast: false }));
  return { scene, desks, update() { } };
}

// ================================================================ STORE AISLE
export function buildStore() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#f3ecff');
  lights(scene, { hemi: 1.45, key: 1.3, keyPos: [2, 9, 6], shadowSize: 8 });
  const fTex = canvasTex(256, 256, checker('#ffffff', '#ece4fa', 2), [12, 8]);
  scene.add(M(box(24, 0.1, 16), lam('#fff', { map: fTex }), 0, -0.05, 0, { cast: false }));
  scene.add(M(box(24, 5, 0.2), lam('#e6d8ff'), 0, 2.5, -6, { cast: false }));
  const brands = [['CRUNCH O\'S', '#ff5f5f', '#ffd34d'], ['LOOPS', '#4fa3ff', '#fff'], ['FROSTY', '#7a6cff', '#bfe9ff'], ['HONEY B', '#ffb347', '#5a2d12'], ['CHOCO', '#8a4a2a', '#ffcf9a']];
  const boxMats = brands.map(([n, bg, fg]) => { const tex = canvasTex(256, 360, (x, w, h) => { x.fillStyle = bg; x.fillRect(0, 0, w, h); x.fillStyle = fg; x.font = 'bold 44px "Lilita One"'; x.textAlign = 'center'; x.fillText(n, w / 2, 70); x.beginPath(); x.ellipse(w / 2, 230, 80, 60, 0, 0, 7); x.fillStyle = '#fff'; x.fill(); for (let i = 0; i < 9; i++) { x.beginPath(); x.arc(w / 2 - 50 + (i % 3) * 50, 200 + Math.floor(i / 3) * 28, 12, 0, 7); x.fillStyle = fg === '#fff' ? '#ffd34d' : fg; x.fill(); } }); const side = lam(bg); return [side, side, side, side, new THREE.MeshLambertMaterial({ map: tex }), new THREE.MeshLambertMaterial({ map: tex })]; });
  const bg = box(0.42, 0.6, 0.16);
  // shelves along back
  for (let s = 0; s < 3; s++) {
    scene.add(M(box(8, 0.06, 0.8), lam('#ffffff'), 0, 0.5 + s * 0.9, -5.4));
    for (let i = 0; i < 16; i++) scene.add(M(bg, boxMats[(i + s) % 5], -3.6 + i * 0.48, 0.83 + s * 0.9, -5.3));
  }
  // display pyramid of cereal boxes (index for collapse)
  const pyramid = [];
  let k = 0;
  for (let row = 0; row < 5; row++) for (let i = 0; i < 5 - row; i++) {
    const m = M(bg, boxMats[(k++) % 5], (i - (4 - row) / 2) * 0.46, 0.3 + row * 0.6, 0);
    m.userData.home = m.position.clone(); m.userData.k = k; scene.add(m); pyramid.push(m);
  }
  const signTex = canvasTex(512, 128, (x, w, h) => { x.fillStyle = '#ff5f5f'; x.beginPath(); x.roundRect(0, 0, w, h, 24); x.fill(); x.fillStyle = '#fff'; x.font = 'bold 70px "Lilita One"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('CEREAL SALE!', w / 2, h / 2 + 4); });
  scene.add(M(new THREE.PlaneGeometry(2.4, 0.6), basic('#fff', { map: signTex }), 0, 3.6, 0.0, { cast: false }));
  return {
    scene, pyramid,
    update(t, s) {
      const c = s.collapse ?? 0; // seconds since collapse start, or <0
      pyramid.forEach((m, i) => {
        const h = m.userData.home;
        if (c <= 0) { m.position.copy(h); m.rotation.set(0, 0, 0); return; }
        const d = Math.max(0, c - (h.y * 0.12) - rand(i) * 0.1);
        const vx = (rand(i, 2) - 0.5) * 2.4 + (h.x) * 1.4, vz = 0.6 + rand(i, 3) * 1.6;
        const fall = Math.min(d, 1.2);
        const y = Math.max(0.08, h.y + 1.2 * fall - 4.9 * fall * fall * 1.6);
        m.position.set(h.x + vx * fall, y, h.z + vz * fall);
        m.rotation.set(rand(i, 4) * 3 * fall, rand(i, 5) * 2 * fall, (rand(i, 6) - 0.5) * 5 * fall);
        if (y <= 0.08) { m.rotation.x = Math.PI / 2; }
      });
    },
  };
}

// ================================================================ STAIRWELL
export function buildStairs() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#2a1a55');
  lights(scene, { hemi: 1.35, key: 1.6, keyPos: [4, 12, 6], shadowSize: 10 });
  const stepMat = lam('#d9c8ff'), railMat = phong('#ffcf4a', 60);
  const flights = 3, stepsN = 10, rise = 0.3, run = 0.42;
  for (let f = 0; f < flights; f++) {
    const y0 = -f * stepsN * rise, dir = f % 2 ? -1 : 1, z = f % 2 ? -1.2 : 0;
    for (let i = 0; i < stepsN; i++) scene.add(M(box(run, rise, 1.2), stepMat, dir * (i * run - 2), y0 - i * rise - rise / 2, z));
    scene.add(M(box(1.4, 0.2, 2.6), lam('#c4b2f2'), dir * (-2 - 0.9), y0 - 0.1, -0.6));
    const rl = M(new THREE.CylinderGeometry(0.03, 0.03, Math.hypot(stepsN * run, stepsN * rise), 8), railMat, dir * (stepsN * run / 2 - 2), y0 - stepsN * rise / 2 + 1.0, z - 0.62);
    rl.rotation.z = dir * Math.atan2(stepsN * rise, stepsN * run) + Math.PI / 2 * dir; rl.rotation.z = Math.PI / 2 - dir * Math.atan2(stepsN * rise, stepsN * run); scene.add(rl);
  }
  scene.add(M(box(14, 14, 0.2), lam('#efe3ff'), 0, -3, -2.0, { cast: false }));
  const sTex = canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#ffd34d'; x.beginPath(); x.arc(128, 128, 120, 0, 7); x.fill(); x.fillStyle = '#2a1a55'; x.font = 'bold 150px "Lilita One"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('8', 128, 140); });
  scene.add(M(new THREE.CircleGeometry(0.4, 32), basic('#fff', { map: sTex }), -2.2, 1.5, -1.88, { cast: false }));
  scene.add(M(box(1.2, 1.4, 0.05), basic('#bfe9ff'), 1.5, 1.0, -1.88, { cast: false }));
  return { scene, stepPos(f, i) { const dir = f % 2 ? -1 : 1; return [dir * (i * run - 2), -f * stepsN * rise - i * rise, f % 2 ? -1.2 : 0]; }, rise, run, stepsN, update() { } };
}

// ================================================================ CAFETERIA
export function buildCafeteria() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#2a1a55');
  lights(scene, { hemi: 1.35, key: 1.5, keyPos: [3, 9, 6], shadowSize: 10 });
  const fTex = canvasTex(256, 256, checker('#ffe6b8', '#ffd49a', 2), [10, 10]);
  scene.add(M(box(20, 0.1, 16), lam('#fff', { map: fTex }), 0, -0.05, 0, { cast: false }));
  scene.add(M(box(20, 4.5, 0.2), lam('#c9e7ff'), 0, 2.25, -7, { cast: false }));
  const tables = [];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
    const g = new THREE.Group(); g.position.set(-4 + i * 4, 0, -3 + j * 4);
    g.add(M(box(2.6, 0.08, 1.0), lam('#ffffff'), 0, 0.75, 0)); g.add(M(box(0.1, 0.75, 0.6), lam('#5a4c9a'), -1.1, 0.375, 0)); g.add(M(box(0.1, 0.75, 0.6), lam('#5a4c9a'), 1.1, 0.375, 0));
    for (const s of [-1, 1]) g.add(M(box(2.6, 0.08, 0.35), lam('#7a6cd8'), 0, 0.46, s * 0.75));
    g.add(M(box(0.5, 0.03, 0.35), lam('#8fd6ff'), 0.4, 0.8, 0.2)); scene.add(g); tables.push(g);
  }
  const bTex = canvasTex(512, 128, (x, w, h) => { x.fillStyle = '#ff7eb6'; x.beginPath(); x.roundRect(0, 0, w, h, 24); x.fill(); x.fillStyle = '#fff'; x.font = 'bold 70px "Lilita One"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('CAFETERIA', w / 2, h / 2 + 4); });
  scene.add(M(new THREE.PlaneGeometry(3, 0.75), basic('#fff', { map: bTex }), 0, 3.4, -6.88, { cast: false }));
  return { scene, tables, update() { } };
}

// ================================================================ MAINTENANCE OFFICE
export function buildOffice() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#251848');
  lights(scene, { hemi: 1.1, key: 1.2, keyPos: [-3, 7, 5], shadowSize: 6, sky: '#ffe9c8' });
  scene.add(M(box(10, 0.1, 8), lam('#6a5c8a'), 0, -0.05, 0, { cast: false }));
  scene.add(M(box(10, 4, 0.2), lam('#9e95c0'), 0, 2, -2.5, { cast: false }));
  // desk + monitor + keyboard + mug
  scene.add(M(box(2.4, 0.08, 1.0), lam('#c48a5a'), 0, 0.85, -1.2)); scene.add(M(box(0.1, 0.85, 0.9), lam('#8a5a3a'), -1.1, 0.42, -1.2)); scene.add(M(box(0.1, 0.85, 0.9), lam('#8a5a3a'), 1.1, 0.42, -1.2));
  const monTex = canvasTex(512, 320, (x, w, h) => { x.fillStyle = '#10223a'; x.fillRect(0, 0, w, h); x.fillStyle = '#39ff9a'; x.font = '28px monospace'; ['BLDG: MAPLE APTS', 'CAR 1: FAULT', 'POS: FL 6-7', 'STATUS: STOPPED', 'TECH ETA: 2:00:00'].forEach((l, i) => x.fillText(l, 24, 50 + i * 50)); });
  scene.add(M(box(1.0, 0.65, 0.06), lam('#2a2338'), 0, 1.35, -1.45)); scene.add(M(new THREE.PlaneGeometry(0.9, 0.56), basic('#fff', { map: monTex }), 0, 1.35, -1.415, { cast: false }));
  scene.add(M(box(0.1, 0.3, 0.1), lam('#2a2338'), 0, 1.0, -1.45));
  const kb = M(box(0.7, 0.04, 0.22), lam('#3a3348'), 0, 0.91, -0.95); scene.add(kb);
  scene.add(M(new THREE.CylinderGeometry(0.07, 0.06, 0.16, 16), lam('#ff7eb6'), 0.8, 0.97, -1.0));
  // microphone
  scene.add(M(new THREE.CylinderGeometry(0.01, 0.01, 0.35, 8), lam('#2a2338'), -0.6, 1.05, -1.1, { rz: 0.4 }));
  scene.add(M(new THREE.SphereGeometry(0.05, 12, 10), lam('#2a2338'), -0.67, 1.22, -1.1));
  // chair
  scene.add(M(box(0.6, 0.08, 0.6), lam('#3a3348'), 0, 0.5, -0.2)); scene.add(M(box(0.6, 0.7, 0.08), lam('#3a3348'), 0, 0.9, 0.12));
  const lamp = new THREE.PointLight('#a8ffd0', 2.5, 3, 1.5); lamp.position.set(0, 1.4, -0.9); scene.add(lamp);
  return { scene, update() { } };
}

// ================================================================ LAVA GAME LEVEL
export function buildLava() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#1a0a18');
  scene.fog = new THREE.Fog('#2a0a18', 8, 30);
  scene.add(new THREE.HemisphereLight('#ffb07a', '#ff3a1a', 1.2));
  const key = new THREE.DirectionalLight('#ffd0a0', 0.8); key.position.set(2, 6, 4); scene.add(key);
  const lavaTex = canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#ff4a12'; x.fillRect(0, 0, w, h); for (let i = 0; i < 60; i++) { x.fillStyle = `rgba(255,${180 + Math.random() * 70},40,${0.4 + Math.random() * 0.4})`; x.beginPath(); x.ellipse(Math.random() * w, Math.random() * h, 10 + Math.random() * 30, 6 + Math.random() * 14, Math.random() * 3, 0, 7); x.fill(); } }, [6, 6]);
  const lava = M(new THREE.PlaneGeometry(60, 60), basic('#ffffff', { map: lavaTex }), 0, -1, 0, { rx: -Math.PI / 2, cast: false }); scene.add(lava);
  const stone = lam('#5a4a6a');
  const planksA = [];
  for (let i = 0; i < 12; i++) { const p = M(box(0.9, 0.2, 1.4), stone, 0, 0, -i * 1.1); if (i === 7 || i === 8) p.visible = false; scene.add(p); planksA.push(p); }
  // little avatar
  const av = new THREE.Group(); av.add(M(new THREE.SphereGeometry(0.22, 16, 12), lam('#fff'), 0, 0.55, 0)); av.add(M(box(0.3, 0.35, 0.2), lam('#4fa3ff'), 0, 0.2, 0)); scene.add(av);
  for (let i = 0; i < 6; i++) { const r = M(new THREE.ConeGeometry(0.8, 4 + i % 3, 6), lam('#3a2a3a'), (i % 2 ? 4 : -4) + (i % 3), 0.5, -i * 3); scene.add(r); }
  return {
    scene, av,
    update(t, s) {
      lavaTex.offset.set(t * 0.02, t * 0.03);
      const u = s.run ?? 0; // 0..1 progress
      const z = -u * 9; let y = 0.1;
      if (z < -7.2) { const d = (-7.2 - z) / 1.8; y = 0.1 + 1.2 * d - 3.5 * d * d; }
      av.position.set(0, y, z);
    },
  };
}

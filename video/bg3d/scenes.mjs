// 3D-rendered environments (retro game-render look, like the reference backgrounds).
// Each scene builds geometry with procedural textures, lights and fog, rendered once to an image.
import * as THREE from '/vendor/three.module.js';

// ---------- procedural textures ----------
const TEXCACHE = {};
function rand(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function noiseCanvas(w, h, seed, scale, oct = 4) {
  // value-noise fBm into a Float32 array
  const r = rand(seed);
  const G = 64, grid = new Float32Array(G * G);
  for (let i = 0; i < G * G; i++) grid[i] = r();
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let v = 0, amp = 0.5, f = scale;
    for (let o = 0; o < oct; o++) {
      const fx = x * f / w * G, fy = y * f / h * G;
      const x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx - x0, ty = fy - y0;
      const g = (a, b) => grid[((b % G + G) % G) * G + ((a % G + G) % G)];
      const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
      const a = g(x0, y0) + (g(x0 + 1, y0) - g(x0, y0)) * sx, b = g(x0, y0 + 1) + (g(x0 + 1, y0 + 1) - g(x0, y0 + 1)) * sx;
      v += (a + (b - a) * sy) * amp; amp *= 0.5; f *= 2;
    }
    out[y * w + x] = v;
  }
  return out;
}
function hex(c) { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function tex(key, w, h, paint, rep = [1, 1]) {
  if (!TEXCACHE[key]) {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    paint(cv.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(cv);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    TEXCACHE[key] = t;
  }
  const t = TEXCACHE[key].clone(); t.repeat.set(rep[0], rep[1]); t.needsUpdate = true; return t;
}
function noisy(c, w, h, base, var_, seed, scale = 6) {
  const n = noiseCanvas(w, h, seed, scale);
  const im = c.createImageData(w, h); const b = hex(base);
  for (let i = 0; i < w * h; i++) { const k = (n[i] - 0.5) * var_; im.data[i * 4] = b[0] + k; im.data[i * 4 + 1] = b[1] + k * 0.9; im.data[i * 4 + 2] = b[2] + k * 0.8; im.data[i * 4 + 3] = 255; }
  c.putImageData(im, 0, 0);
}
function bricksPaint(c, w, h, base, mortar, bw, bh, seed, var_ = 40) {
  noisy(c, w, h, base, var_, seed, 8);
  const r = rand(seed + 7);
  c.strokeStyle = mortar; c.lineWidth = Math.max(2, bh * 0.12);
  for (let y = 0, row = 0; y < h; y += bh, row++) {
    c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke();
    for (let x = (row % 2) * bw / 2; x < w + bw; x += bw) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + bh); c.stroke(); }
    for (let x = (row % 2) * bw / 2; x < w; x += bw) { c.fillStyle = `rgba(0,0,0,${r() * 0.18})`; c.fillRect(x + 2, y + 2, bw - 4, bh - 4); }
  }
}
const T = {
  sand: rep => tex('sand', 512, 512, (c, w, h) => { noisy(c, w, h, '#d8b072', 60, 11, 5); c.globalAlpha = 0.25; for (let i = 0; i < 40; i++) { c.strokeStyle = '#b88a4a'; c.beginPath(); const y = Math.random() * h; c.moveTo(0, y); c.bezierCurveTo(w * 0.3, y + 10, w * 0.6, y - 10, w, y); c.stroke(); } }, rep),
  stone: rep => tex('stone', 512, 512, (c, w, h) => bricksPaint(c, w, h, '#c9a26b', 'rgba(90,60,30,0.6)', 128, 64, 3), rep),
  limestone: rep => tex('limestone', 512, 512, (c, w, h) => bricksPaint(c, w, h, '#d8c4a0', 'rgba(110,90,60,0.5)', 170, 85, 5, 30), rep),
  mud: rep => tex('mud', 512, 512, (c, w, h) => bricksPaint(c, w, h, '#b98d5c', 'rgba(80,50,25,0.55)', 96, 40, 9, 50), rep),
  blueBrick: rep => tex('bluebrick', 512, 512, (c, w, h) => bricksPaint(c, w, h, '#1f4f9a', 'rgba(10,20,50,0.7)', 96, 48, 13, 45), rep),
  darkStone: rep => tex('darkstone', 512, 512, (c, w, h) => bricksPaint(c, w, h, '#5a4a3a', 'rgba(20,15,10,0.7)', 128, 64, 17, 50), rep),
  marble: rep => tex('marble', 512, 512, (c, w, h) => { noisy(c, w, h, '#e9e3d6', 22, 21, 3); c.globalAlpha = 0.18; c.strokeStyle = '#9a9488'; for (let i = 0; i < 18; i++) { c.lineWidth = 1 + Math.random() * 2; c.beginPath(); let x = Math.random() * w, y = 0; c.moveTo(x, y); while (y < h) { x += (Math.random() - 0.5) * 30; y += 20; c.lineTo(x, y); } c.stroke(); } }, rep),
  tiles: rep => tex('tiles', 512, 512, (c, w, h) => bricksPaint(c, w, h, '#cfc4ae', 'rgba(80,70,60,0.5)', 128, 128, 23, 25), rep),
  paving: rep => tex('paving', 512, 512, (c, w, h) => bricksPaint(c, w, h, '#a89a86', 'rgba(50,45,40,0.6)', 110, 70, 29, 45), rep),
  grass: rep => tex('grass', 512, 512, (c, w, h) => { noisy(c, w, h, '#5e8a35', 70, 31, 9); c.globalAlpha = 0.5; for (let i = 0; i < 2500; i++) { c.strokeStyle = Math.random() > 0.5 ? '#4b7426' : '#7aa64a'; const x = Math.random() * w, y = Math.random() * h; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (Math.random() - 0.5) * 4, y - 6); c.stroke(); } }, rep),
  dirt: rep => tex('dirt', 512, 512, (c, w, h) => noisy(c, w, h, '#a8875f', 70, 37, 7), rep),
  rock: rep => tex('rock', 512, 512, (c, w, h) => noisy(c, w, h, '#6a4e36', 90, 41, 4), rep),
  plaster: (col, rep) => tex('plaster' + col, 256, 256, (c, w, h) => noisy(c, w, h, col, 22, 43, 3), rep),
  wood: rep => tex('wood', 512, 512, (c, w, h) => { noisy(c, w, h, '#7a4f2c', 30, 47, 2); c.strokeStyle = 'rgba(40,20,10,0.35)'; for (let y = 0; y < h; y += 64) { c.lineWidth = 3; c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } }, rep),
  roof: rep => tex('roof', 512, 512, (c, w, h) => { noisy(c, w, h, '#b5482e', 40, 53, 4); c.strokeStyle = 'rgba(60,15,5,0.5)'; c.lineWidth = 6; for (let y = 0; y < h; y += 42) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } for (let x = 0; x < w; x += 36) { c.lineWidth = 2; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); } }, rep),
  water: (col, rep) => tex('water' + col, 512, 512, (c, w, h) => { noisy(c, w, h, col, 40, 59, 6); c.globalAlpha = 0.35; c.strokeStyle = '#ffffff'; for (let i = 0; i < 80; i++) { const x = Math.random() * w, y = Math.random() * h; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 20 + Math.random() * 40, y); c.stroke(); } }, rep),
  glyphs: rep => tex('glyphs', 1024, 128, (c, w, h) => { noisy(c, w, h, '#d9b47a', 30, 61, 4); c.fillStyle = '#2f7fc1'; c.fillRect(0, 0, w, 14); c.fillRect(0, h - 14, w, 14); c.fillStyle = 'rgba(70,40,15,0.75)'; const r = rand(5); for (let x = 20; x < w; x += 46) { const k = Math.floor(r() * 5); c.beginPath(); if (k === 0) c.ellipse(x, 64, 14, 9, 0, 0, 7); else if (k === 1) { c.moveTo(x - 14, 84); c.lineTo(x, 44); c.lineTo(x + 14, 84); } else if (k === 2) c.rect(x - 4, 40, 8, 46); else if (k === 3) { c.arc(x, 56, 10, 0, 7); c.rect(x - 14, 78, 28, 6); } else { c.moveTo(x - 14, 70); c.quadraticCurveTo(x, 36, x + 14, 70); c.lineTo(x + 14, 78); c.lineTo(x - 14, 78); } c.fill(); } }, rep),
  carpet: rep => tex('carpet', 256, 256, (c, w, h) => { noisy(c, w, h, '#8a1f1f', 30, 67, 6); c.strokeStyle = '#d4a017'; c.lineWidth = 8; c.strokeRect(14, 14, w - 28, h - 28); }, rep),
  cityWin: rep => tex('citywin', 512, 512, (c, w, h) => { noisy(c, w, h, '#2b3348', 25, 71, 4); const r = rand(9); for (let y = 20; y < h; y += 46) for (let x = 16; x < w; x += 40) { c.fillStyle = r() > 0.45 ? `rgba(255,${200 + r() * 40},${110 + r() * 60},0.9)` : 'rgba(20,25,40,0.9)'; c.fillRect(x, y, 22, 28); } }, rep),
  shelves: rep => tex('shelves', 512, 512, (c, w, h) => { noisy(c, w, h, '#4a3220', 25, 73, 3); for (let y = 0; y < h; y += 128) { c.fillStyle = '#2e1e10'; c.fillRect(0, y + 110, w, 18); for (let x = 10; x < w; x += 46) { c.fillStyle = ['#e8d7a8', '#d9c48f', '#f0e2bc'][(x / 46 | 0) % 3]; c.beginPath(); c.ellipse(x + 18, y + 80, 20, 28, 0, 0, 7); c.fill(); c.fillStyle = '#7a5230'; c.beginPath(); c.arc(x + 18, y + 80, 7, 0, 7); c.fill(); } } }, rep),
};
function sprite(key, w, h, paint) {
  if (!TEXCACHE['spr' + key]) {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h; paint(cv.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; TEXCACHE['spr' + key] = t;
  }
  return TEXCACHE['spr' + key];
}
const SPR = {
  palm: () => sprite('palm', 512, 1024, (c, w, h) => {
    c.strokeStyle = '#6b4a2b'; c.lineWidth = 34; c.lineCap = 'round'; c.beginPath(); c.moveTo(w / 2, h); c.quadraticCurveTo(w / 2 + 50, h * 0.55, w / 2 + 10, 260); c.stroke();
    c.strokeStyle = 'rgba(40,25,10,0.5)'; c.lineWidth = 3; for (let y = 300; y < h; y += 26) { c.beginPath(); c.moveTo(w / 2 - 14 + (y - 300) * 0.03, y); c.lineTo(w / 2 + 18, y + 6); c.stroke(); }
    for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.42; c.save(); c.translate(w / 2 + 10, 260); c.rotate(a + Math.PI / 2); c.fillStyle = i % 2 ? '#3f6f2a' : '#4f8636'; c.beginPath(); c.ellipse(0, -120, 34, 140, 0, 0, 7); c.fill(); c.strokeStyle = '#2c4d1c'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -250); c.stroke(); c.restore(); }
  }),
  cypress: () => sprite('cypress', 256, 1024, (c, w, h) => { c.fillStyle = '#2b4a24'; c.beginPath(); c.ellipse(w / 2, h * 0.55, w * 0.42, h * 0.45, 0, 0, 7); c.fill(); c.fillStyle = 'rgba(80,120,60,0.35)'; for (let i = 0; i < 60; i++) { c.beginPath(); c.arc(w / 2 + (Math.random() - 0.5) * w * 0.6, h * 0.15 + Math.random() * h * 0.8, 10 + Math.random() * 14, 0, 7); c.fill(); } c.fillStyle = '#4a3020'; c.fillRect(w / 2 - 8, h - 40, 16, 40); }),
  bush: () => sprite('bush', 512, 256, (c, w, h) => { for (let i = 0; i < 40; i++) { c.fillStyle = ['#3f6f2a', '#4f8636', '#2f5520'][i % 3]; c.beginPath(); c.arc(60 + Math.random() * (w - 120), h * 0.45 + Math.random() * h * 0.45, 30 + Math.random() * 40, 0, 7); c.fill(); } }),
  flame: () => sprite('flame', 128, 256, (c, w, h) => { const g = c.createRadialGradient(w / 2, h * 0.7, 4, w / 2, h * 0.6, h * 0.5); g.addColorStop(0, 'rgba(255,250,200,1)'); g.addColorStop(0.3, 'rgba(255,190,60,0.95)'); g.addColorStop(0.7, 'rgba(255,90,20,0.6)'); g.addColorStop(1, 'rgba(255,60,0,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(w / 2, 10); c.quadraticCurveTo(w, h * 0.7, w / 2, h - 10); c.quadraticCurveTo(0, h * 0.7, w / 2, 10); c.fill(); }),
  glow: () => sprite('glow', 256, 256, (c, w, h) => { const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(255,200,120,0.9)'); g.addColorStop(1, 'rgba(255,140,40,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); }),
  cloud: () => sprite('cloud', 512, 256, (c, w, h) => { for (let i = 0; i < 18; i++) { const g = c.createRadialGradient(0, 0, 0, 0, 0, 1); c.fillStyle = `rgba(255,255,255,${0.35 + Math.random() * 0.3})`; c.beginPath(); c.arc(80 + Math.random() * (w - 160), h * 0.4 + Math.random() * h * 0.35, 40 + Math.random() * 50, 0, 7); c.fill(); } }),
};

// ---------- scene helpers ----------
let scene, camera;
function mat(map, opts = {}) { return new THREE.MeshStandardMaterial(Object.assign({ map, roughness: 0.92, metalness: 0 }, opts)); }
function add(mesh, x = 0, y = 0, z = 0, ry = 0, shadow = true) { mesh.position.set(x, y, z); mesh.rotation.y = ry; mesh.castShadow = shadow; mesh.receiveShadow = true; scene.add(mesh); return mesh; }
function box(w, h, d, m, x, y, z, ry) { return add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m), x, y + h / 2, z, ry); }
function cyl(r, h, m, x, y, z, seg = 16, r2) { return add(new THREE.Mesh(new THREE.CylinderGeometry(r2 === undefined ? r : r2, r, h, seg), m), x, y + h / 2, z); }
function ground(m, size = 200) { const g = new THREE.Mesh(new THREE.PlaneGeometry(size, size, 64, 64), m); g.rotation.x = -Math.PI / 2; g.receiveShadow = true; scene.add(g); return g; }
function column(x, z, h, r, m, capM) { cyl(r, h, m, x, 0, z, 16); box(r * 2.6, r * 0.5, r * 2.6, capM || m, x, h, z); box(r * 2.4, r * 0.35, r * 2.4, capM || m, x, 0, z); }
function bill(spr, w, h, x, y, z) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: spr, transparent: true, alphaTest: 0.35, side: THREE.DoubleSide, roughness: 1 })); m.position.set(x, y + h / 2, z); m.lookAt(camera.position.x, y + h / 2, camera.position.z); m.castShadow = true; scene.add(m); return m; }
function glowSprite(x, y, z, s, color = 0xffaa55) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: SPR.glow(), color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); sp.position.set(x, y, z); sp.scale.set(s, s, 1); scene.add(sp); }
function torch(x, y, z, power = 18) { cyl(0.06, 0.6, mat(T.wood([1, 1])), x, y - 0.6, z, 8); const f = new THREE.Sprite(new THREE.SpriteMaterial({ map: SPR.flame(), transparent: true, depthWrite: false })); f.position.set(x, y + 0.2, z); f.scale.set(0.35, 0.7, 1); scene.add(f); glowSprite(x, y + 0.2, z, 2.2); const l = new THREE.PointLight(0xffa04a, power, 14, 1.6); l.position.set(x, y + 0.3, z + 0.3); scene.add(l); }
function sky(top, bottom, opts = {}) {
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 512; const c = cv.getContext('2d');
  const g = c.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, top); g.addColorStop(1, bottom); c.fillStyle = g; c.fillRect(0, 0, 1024, 512);
  if (opts.sun) { const sg = c.createRadialGradient(opts.sun[0], opts.sun[1], 0, opts.sun[0], opts.sun[1], 180); sg.addColorStop(0, 'rgba(255,250,220,1)'); sg.addColorStop(0.12, 'rgba(255,240,200,0.9)'); sg.addColorStop(1, 'rgba(255,220,160,0)'); c.fillStyle = sg; c.fillRect(0, 0, 1024, 512); }
  if (opts.clouds) for (let i = 0; i < opts.clouds; i++) { const x = Math.random() * 1024, y = 40 + Math.random() * 220; for (let k = 0; k < 9; k++) { c.fillStyle = `rgba(255,255,255,${0.18 + Math.random() * 0.25})`; c.beginPath(); c.ellipse(x + (Math.random() - 0.5) * 160, y + (Math.random() - 0.5) * 30, 40 + Math.random() * 60, 18 + Math.random() * 22, 0, 0, 7); c.fill(); } }
  if (opts.stars) for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(255,255,255,${Math.random()})`; c.fillRect(Math.random() * 1024, Math.random() * 300, 1.5, 1.5); }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; scene.background = t;
}
function sunLight(color, intensity, x, y, z, hemiSky, hemiGround, hemiI = 0.7) {
  const d = new THREE.DirectionalLight(color, intensity); d.position.set(x, y, z); d.castShadow = true;
  d.shadow.mapSize.set(2048, 2048); const s = d.shadow.camera; s.left = -40; s.right = 40; s.top = 40; s.bottom = -40; s.far = 200; d.shadow.bias = -0.0005; scene.add(d);
  scene.add(new THREE.HemisphereLight(hemiSky, hemiGround, hemiI));
}
function terrain(m, amp, seed, size = 240, seg = 120) {
  const g = new THREE.PlaneGeometry(size, size, seg, seg); g.rotateX(-Math.PI / 2);
  const r = rand(seed); const ph = [r() * 6, r() * 6, r() * 6];
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), z = pos.getZ(i); const d = Math.max(0, -z - 6); pos.setY(i, (Math.sin(x * 0.05 + ph[0]) * Math.cos(z * 0.04 + ph[1]) + 0.5 * Math.sin(x * 0.13 + z * 0.09 + ph[2])) * amp * Math.min(1, d / 30)); }
  g.computeVertexNormals();
  const mesh = new THREE.Mesh(g, m); mesh.receiveShadow = true; scene.add(mesh); return mesh;
}
function pyramid(base, h, m, x, z) { const g = new THREE.ConeGeometry(base * 0.7071, h, 4, 1); g.rotateY(Math.PI / 4); return add(new THREE.Mesh(g, m), x, h / 2, z); }
function roomShell(w, h, d, wallM, floorM, ceilM) {
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(w, d), floorM); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; scene.add(fl);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallM); back.position.set(0, h / 2, -d / 2); back.receiveShadow = true; scene.add(back);
  for (const sd of [-1, 1]) { const s = new THREE.Mesh(new THREE.PlaneGeometry(d, h), wallM); s.position.set(sd * w / 2, h / 2, 0); s.rotation.y = -sd * Math.PI / 2; s.receiveShadow = true; scene.add(s); }
  if (ceilM) { const cl = new THREE.Mesh(new THREE.PlaneGeometry(w, d), ceilM); cl.rotation.x = Math.PI / 2; cl.position.y = h; scene.add(cl); }
}

// ---------- scenes ----------
const SCENES = {
  desert() {
    sky('#e9963f', '#ffe2a6', { sun: [760, 170], clouds: 3 }); scene.fog = new THREE.Fog(0xf5cf92, 30, 190);
    sunLight(0xffe0b0, 2.6, -30, 40, -20, 0xffe6c0, 0xb98a4a, 0.8);
    terrain(mat(T.sand([24, 24])), 3.5, 2);
    const st = mat(T.limestone([6, 6]), { color: 0xffe8c8 });
    pyramid(70, 46, st, -34, -110); pyramid(56, 38, st, 26, -128); pyramid(26, 18, st, 60, -90);
    const water = new THREE.Mesh(new THREE.PlaneGeometry(300, 10), mat(T.water('#3f86ad', [20, 1]), { roughness: 0.25, metalness: 0.1 })); water.rotation.x = -Math.PI / 2; water.position.set(0, 0.25, -26); scene.add(water);
    for (const [x, z, s] of [[-14, -20, 7], [-19, -24, 6], [13, -22, 6.5], [18, -30, 5.5], [-30, -32, 6], [30, -34, 7]]) bill(SPR.palm(), s * 0.55, s, x, 0, z);
    camera.position.set(0, 1.7, 9); camera.lookAt(0, 3.2, -30);
  },
  palace() {
    scene.background = new THREE.Color(0x1a1008); scene.fog = new THREE.Fog(0x2a1a0c, 12, 40);
    roomShell(26, 9, 30, mat(T.glyphs([3, 9])), mat(T.tiles([8, 8]), { color: 0xd8c09a }), mat(T.plaster('#6b4e2a', [4, 4])));
    const back = new THREE.Mesh(new THREE.PlaneGeometry(26, 9), mat(T.stone([5, 2]), { color: 0xf0d8b0 })); back.position.set(0, 4.5, -14.9); scene.add(back);
    const band = new THREE.Mesh(new THREE.PlaneGeometry(26, 1.2), mat(T.glyphs([4, 1]))); band.position.set(0, 7.2, -14.85); scene.add(band);
    const colM = mat(T.limestone([1, 3]), { color: 0xf6dfb8 }), capM = mat(T.plaster('#2f7fc1', [1, 1]));
    for (const x of [-9, -4.5, 4.5, 9]) for (const z of [-11, -5]) column(x, z, 8.2, 0.55, colM, capM);
    torch(-6.5, 3.2, -14.5); torch(6.5, 3.2, -14.5); torch(-12.6, 3.2, -4); torch(12.6, 3.2, -4);
    scene.add(new THREE.AmbientLight(0x6a4a2a, 0.9));
    const carpet = new THREE.Mesh(new THREE.PlaneGeometry(4, 24), mat(T.carpet([1, 6]))); carpet.rotation.x = -Math.PI / 2; carpet.position.set(0, 0.02, -3); scene.add(carpet);
    camera.position.set(0, 1.7, 10); camera.lookAt(0, 3.0, -10);
  },
  tomb() {
    scene.background = new THREE.Color(0x0e0905); scene.fog = new THREE.Fog(0x140c06, 6, 24);
    roomShell(12, 6, 16, mat(T.stone([3, 2]), { color: 0xd8b888 }), mat(T.dirt([4, 4])), mat(T.darkStone([3, 3])));
    torch(-3.5, 2.6, -7.5, 14); torch(3.5, 2.6, -7.5, 14);
    scene.add(new THREE.AmbientLight(0x4a3018, 0.8));
    camera.position.set(0, 1.6, 6); camera.lookAt(0, 2.2, -8);
  },
  cave() {
    scene.background = new THREE.Color(0x070402); scene.fog = new THREE.Fog(0x120a05, 6, 26);
    const g = new THREE.SphereGeometry(14, 64, 32); const p = g.attributes.position; const r = rand(7);
    for (let i = 0; i < p.count; i++) { const v = new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i)); const k = 1 + (Math.sin(v.x * 0.9 + 1) * Math.cos(v.y * 1.1) * Math.sin(v.z * 0.7)) * 0.12 + (r() - 0.5) * 0.04; v.multiplyScalar(k); p.setXYZ(i, v.x, Math.max(-0.5, v.y), v.z); }
    g.computeVertexNormals();
    const cave = new THREE.Mesh(g, mat(T.rock([4, 4]), { side: THREE.BackSide })); cave.position.y = 0; cave.receiveShadow = true; scene.add(cave);
    ground(mat(T.dirt([6, 6]), { color: 0x9a7650 }), 40);
    const fire = new THREE.PointLight(0xff8a3a, 60, 30, 1.4); fire.position.set(0, 1, -2); fire.castShadow = true; scene.add(fire);
    glowSprite(0, 0.8, -2, 5);
    for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; add(new THREE.Mesh(new THREE.DodecahedronGeometry(0.28), mat(T.rock([1, 1]))), Math.cos(a) * 0.8, 0.12, -2 + Math.sin(a) * 0.8); }
    scene.add(new THREE.AmbientLight(0x3a2010, 0.5));
    camera.position.set(0, 1.7, 7); camera.lookAt(0, 2.2, -6);
  },
  market() {
    sky('#79b8e8', '#f2dcb0', { clouds: 5 }); scene.fog = new THREE.Fog(0xe8d6b0, 30, 150);
    sunLight(0xfff0d0, 2.4, 25, 40, 20, 0xcfe6ff, 0xb08a5a, 0.8);
    ground(mat(T.dirt([30, 30])), 260);
    const mud = mat(T.mud([3, 3]), { color: 0xf0d8b8 });
    for (let i = 0; i < 4; i++) box(60 - i * 13, 7, 60 - i * 13, mat(T.mud([8 - i, 2])), 0, i * 7, -120);
    box(4, 28, 3, mud, 0, 0, -88);
    for (const [x, z, w, h] of [[-26, -40, 14, 7], [-24, -60, 10, 9], [24, -42, 16, 6], [28, -62, 12, 10], [-40, -25, 10, 6], [40, -26, 10, 7]]) { box(w, h, 8, mud, x, 0, z); box(w, 0.8, 8.4, mat(T.blueBrick([2, 1])), x, h - 1.6, z); }
    const cloth = [0xc0392b, 0x2e86c1, 0xd4a017, 0x27ae60];
    for (const [x, z, k] of [[-10, -14, 0], [10, -16, 1], [-16, -30, 2], [16, -32, 3]]) { box(5, 0.15, 3, new THREE.MeshStandardMaterial({ color: cloth[k], roughness: 0.9 }), x, 2.6, z); for (const sx of [-2.3, 2.3]) for (const sz of [-1.3, 1.3]) cyl(0.07, 2.6, mat(T.wood([1, 1])), x + sx, 0, z + sz, 6); box(4.4, 1, 2.4, mat(T.wood([2, 1])), x, 0, z); for (let j = 0; j < 6; j++) add(new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), new THREE.MeshStandardMaterial({ color: [0xe74c3c, 0xf39c12, 0x27ae60, 0x8e44ad][j % 4] })), x - 1.6 + j * 0.62, 1.15, z); }
    for (const [x, z, s] of [[-6, -46, 9], [7, -50, 10], [-34, -50, 8], [36, -54, 9]]) bill(SPR.palm(), s * 0.55, s, x, 0, z);
    camera.position.set(0, 1.7, 10); camera.lookAt(0, 3.6, -40);
  },
  throne() {
    scene.background = new THREE.Color(0x0a0812); scene.fog = new THREE.Fog(0x120c1a, 14, 42);
    roomShell(24, 10, 32, mat(T.blueBrick([4, 2])), mat(T.tiles([8, 8]), { color: 0x6a5a48 }), mat(T.darkStone([4, 4])));
    const carpet = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 28), mat(T.carpet([1, 6]))); carpet.rotation.x = -Math.PI / 2; carpet.position.set(0, 0.02, -2); scene.add(carpet);
    box(5, 1, 3, mat(T.marble([1, 1]), { color: 0xd4b070 }), 0, 0, -14); box(2.4, 4, 1, mat(T.plaster('#5b2a86', [1, 1])), 0, 1, -15);
    for (const x of [-8, 8]) for (const z of [-12, -4]) column(x, z, 9, 0.6, mat(T.mud([1, 3]), { color: 0xd8b88a }), mat(T.plaster('#d4a017', [1, 1])));
    torch(-11.6, 3.5, -8); torch(11.6, 3.5, -8); torch(-4, 3.5, -15.6); torch(4, 3.5, -15.6);
    scene.add(new THREE.AmbientLight(0x2a2040, 1.2));
    camera.position.set(0, 1.7, 10); camera.lookAt(0, 3.0, -10);
  },
  surgery() {
    scene.background = new THREE.Color(0x0c0805); scene.fog = new THREE.Fog(0x1a1008, 8, 26);
    roomShell(14, 6, 16, mat(T.mud([3, 2])), mat(T.dirt([4, 4]), { color: 0x8a6a48 }), mat(T.wood([3, 3])));
    box(4, 0.2, 1.6, mat(T.wood([2, 1])), 0, 1.1, -5); for (const sx of [-1.8, 1.8]) for (const sz of [-0.7, 0.7]) box(0.15, 1.1, 0.15, mat(T.wood([1, 1])), sx, 0, -5 + sz);
    for (let i = 0; i < 5; i++) box(0.6, 0.8, 0.4, mat(T.plaster('#a8642e', [1, 1])), -5 + i * 0.9, 1.2, -7.6);
    box(5, 0.15, 0.6, mat(T.wood([2, 1])), -3.2, 1.2, -7.6);
    torch(-5.5, 2.4, -7.6, 12); torch(5.5, 2.4, -7.6, 12);
    scene.add(new THREE.AmbientLight(0x3a2614, 0.8));
    camera.position.set(0, 1.6, 6); camera.lookAt(0, 2.0, -8);
  },
  sanctuary() {
    sky('#5ea8e8', '#dcefff', { clouds: 7 }); scene.fog = new THREE.Fog(0xcfe4f4, 40, 220);
    sunLight(0xfff4e0, 2.6, -20, 40, 15, 0xd6ecff, 0x7a8a5a, 0.85);
    terrain(mat(T.grass([30, 30]), { color: 0xc8d8a0 }), 8, 5);
    const pav = new THREE.Mesh(new THREE.PlaneGeometry(60, 50), mat(T.paving([10, 8]), { color: 0xe8dcc0 })); pav.rotation.x = -Math.PI / 2; pav.position.set(0, 0.05, -10); pav.receiveShadow = true; scene.add(pav);
    const marble = mat(T.marble([1, 2]));
    box(24, 1.2, 12, marble, 10, 0, -50);
    for (let i = 0; i < 7; i++) column(0 + i * 3.4 - 0.2, -46, 9, 0.55, marble);
    box(24, 1.5, 12, marble, 10, 10.2, -50);
    const roofG = new THREE.CylinderGeometry(0.01, 7, 24, 3, 1); roofG.rotateZ(Math.PI / 2); roofG.rotateX(Math.PI); const roof = add(new THREE.Mesh(roofG, marble), 10, 13.3, -50); roof.scale.set(1, 0.42, 1);
    for (const [x, z, s] of [[-14, -30, 12], [-19, -38, 14], [-26, -26, 11], [30, -34, 12]]) bill(SPR.cypress(), s * 0.25, s, x, 0, z);
    for (const [x, z] of [[-8, -20], [24, -22]]) bill(SPR.bush(), 6, 3, x, 0, z);
    camera.position.set(0, 1.7, 12); camera.lookAt(2, 4.0, -30);
  },
  abaton() {
    sky('#05081a', '#1b2850', { stars: true }); scene.fog = new THREE.Fog(0x0a1028, 10, 46);
    const moon = new THREE.DirectionalLight(0x8fb0ff, 1.4); moon.position.set(-20, 30, 10); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048); const sc = moon.shadow.camera; sc.left = -30; sc.right = 30; sc.top = 30; sc.bottom = -30; scene.add(moon);
    scene.add(new THREE.HemisphereLight(0x3050a0, 0x101020, 0.6));
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), mat(T.tiles([12, 12]), { color: 0x8a8aa0 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const marble = mat(T.marble([1, 2]), { color: 0xb8bed8 });
    for (let i = -4; i <= 4; i++) { column(i * 4, -12, 8, 0.5, marble); }
    box(40, 1, 3, marble, 0, 8, -12); box(40, 9, 1, mat(T.plaster('#2a3050', [6, 2])), 0, 0, -20);
    for (let i = -3; i <= 3; i++) box(2.2, 0.12, 1, mat(T.plaster('#a88a5a', [1, 1])), i * 3.2, 0, -6);
    torch(-14, 3, -19.4, 8); torch(14, 3, -19.4, 8);
    camera.position.set(0, 1.7, 9); camera.lookAt(0, 3, -12);
  },
  rome() {
    sky('#6db2ea', '#e6f3ff', { clouds: 6 }); scene.fog = new THREE.Fog(0xd8eaf8, 40, 200);
    sunLight(0xfff2dc, 2.6, 25, 45, 18, 0xd0e8ff, 0x9a8a70, 0.85);
    ground(mat(T.paving([30, 30])), 260);
    const walls = [['#e8c99a', -24, -40, 14, 12], ['#e3b98a', -26, -64, 12, 16], ['#efd6b0', 26, -42, 14, 11], ['#e1b48a', 28, -66, 14, 15]];
    for (const [col, x, z, w, h] of walls) { box(w, h, 10, mat(T.plaster(col, [3, 3])), x, 0, z); const r = add(new THREE.Mesh(new THREE.CylinderGeometry(0.01, w * 0.75, 4, 4, 1), mat(T.roof([4, 2]))), x, h + 2, z, Math.PI / 4); r.scale.set(1, 1, 0.72); }
    const marble = mat(T.marble([1, 2]));
    box(30, 1.4, 14, marble, 0, 0, -80); for (let i = 0; i < 8; i++) column(-12.25 + i * 3.5, -74, 12, 0.6, marble); box(30, 1.6, 14, marble, 0, 13.4, -80);
    const tri = new THREE.CylinderGeometry(0.01, 9, 30, 3, 1); tri.rotateZ(Math.PI / 2); const ped = add(new THREE.Mesh(tri, marble), 0, 17, -80); ped.scale.set(1, 0.45, 1);
    camera.position.set(0, 1.7, 12); camera.lookAt(0, 4.5, -40);
  },
  farm() {
    sky('#7fc0ee', '#fbf0d0', { clouds: 6 }); scene.fog = new THREE.Fog(0xe8efd8, 40, 200);
    sunLight(0xfff0d0, 2.5, -20, 40, 15, 0xd8ecff, 0x6a7a3a, 0.8);
    terrain(mat(T.grass([30, 30])), 9, 9);
    const soil = new THREE.Mesh(new THREE.PlaneGeometry(60, 40), mat(T.dirt([12, 8]), { color: 0x8a6a40 })); soil.rotation.x = -Math.PI / 2; soil.position.set(0, 0.03, -12); soil.receiveShadow = true; scene.add(soil);
    const cab = new THREE.MeshStandardMaterial({ color: 0x6fae3a, roughness: 0.8 }), cab2 = new THREE.MeshStandardMaterial({ color: 0x9ccd5a, roughness: 0.8 });
    const g = new THREE.IcosahedronGeometry(0.42, 1);
    for (let row = 0; row < 14; row++) for (let k = -18; k <= 18; k++) { const m = new THREE.Mesh(g, (row + k) % 3 ? cab : cab2); m.position.set(k * 1.6 + (row % 2) * 0.8, 0.3, -2 - row * 2.2); m.scale.set(1, 0.8, 1); m.castShadow = true; scene.add(m); }
    box(16, 6, 9, mat(T.plaster('#efe0c2', [3, 2])), 22, 0, -60); const r = add(new THREE.Mesh(new THREE.CylinderGeometry(0.01, 12, 4, 4, 1), mat(T.roof([4, 2]))), 22, 8, -60, Math.PI / 4); r.scale.set(1, 1, 0.65);
    for (const [x, z, s] of [[-30, -60, 12], [-24, -66, 10], [40, -70, 12]]) bill(SPR.cypress(), s * 0.25, s, x, 0, z);
    camera.position.set(0, 1.8, 10); camera.lookAt(0, 3.0, -30);
  },
  curia() {
    scene.background = new THREE.Color(0x1c160e); scene.fog = new THREE.Fog(0x2a2216, 16, 48);
    roomShell(30, 12, 36, mat(T.marble([4, 2]), { color: 0xe6d8bc }), mat(T.tiles([10, 10]), { color: 0xc8b490 }), mat(T.plaster('#6a5a40', [4, 4])));
    const marble = mat(T.marble([1, 2]));
    for (const x of [-11, -5.5, 5.5, 11]) for (const z of [-14, -6]) column(x, z, 11, 0.6, marble);
    for (let r = 0; r < 3; r++) for (const sd of [-1, 1]) box(8, 0.5 + r * 0.5, 2, mat(T.wood([3, 1])), sd * 10, 0, -2 + r * 2.2);
    const band = new THREE.Mesh(new THREE.PlaneGeometry(30, 0.8), new THREE.MeshStandardMaterial({ color: 0x7a1f3d })); band.position.set(0, 10, -17.9); scene.add(band);
    const win = new THREE.DirectionalLight(0xfff0d0, 2.2); win.position.set(10, 20, 10); win.castShadow = true; win.shadow.mapSize.set(2048, 2048); scene.add(win);
    scene.add(new THREE.AmbientLight(0x8a7a60, 0.9));
    camera.position.set(0, 1.7, 12); camera.lookAt(0, 3.4, -10);
  },
  tiber() {
    sky('#f0a060', '#ffe6c0', { sun: [240, 220], clouds: 4 }); scene.fog = new THREE.Fog(0xf2c99a, 30, 170);
    sunLight(0xffd7a0, 2.2, -40, 20, -40, 0xffd8b0, 0x6a5040, 0.7);
    const water = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), mat(T.water('#3a7ea0', [30, 30]), { roughness: 0.2, metalness: 0.15 })); water.rotation.x = -Math.PI / 2; water.receiveShadow = true; scene.add(water);
    const isl = new THREE.Mesh(new THREE.CylinderGeometry(9, 10, 1.4, 24), mat(T.paving([4, 2]), { color: 0xc0aa88 })); isl.scale.set(2.4, 1, 0.8); add(isl, 14, 0.2, -50);
    const marble = mat(T.marble([1, 2]));
    box(12, 0.8, 7, marble, 14, 1, -50); for (let i = 0; i < 5; i++) column(9 + i * 2.5, -47, 6, 0.35, marble); box(12, 0.9, 7, marble, 14, 7, -50);
    for (let i = 0; i < 14; i++) { const x = -90 + i * 13, h = 5 + (i * 37 % 9); box(11, h, 8, mat(T.plaster(['#d9a878', '#e8c49a', '#cf9a6a'][i % 3], [2, 2])), x, 0, -95); }
    camera.position.set(0, 2.2, 12); camera.lookAt(0, 2.6, -40);
  },
  street() {
    sky('#0e1630', '#2a3a66', { stars: true }); scene.fog = new THREE.Fog(0x1a2240, 30, 140);
    scene.add(new THREE.HemisphereLight(0x4060a0, 0x101018, 0.7));
    const road = new THREE.Mesh(new THREE.PlaneGeometry(300, 30), mat(T.plaster('#2a2c33', [40, 4]), { roughness: 0.6 })); road.rotation.x = -Math.PI / 2; road.position.z = -6; road.receiveShadow = true; scene.add(road);
    for (let i = -10; i <= 10; i++) { const d = new THREE.Mesh(new THREE.PlaneGeometry(3, 0.25), new THREE.MeshBasicMaterial({ color: 0xdddddd })); d.rotation.x = -Math.PI / 2; d.position.set(i * 7, 0.02, -2); scene.add(d); }
    const walk = new THREE.Mesh(new THREE.PlaneGeometry(300, 10), mat(T.paving([60, 2]), { color: 0x777777 })); walk.rotation.x = -Math.PI / 2; walk.position.set(0, 0.15, -26); scene.add(walk);
    for (let i = 0; i < 12; i++) { const h = 12 + (i * 53 % 22); box(11, h, 10, mat(T.cityWin([2, Math.round(h / 6)]), { emissive: 0xffffff, emissiveMap: T.cityWin([2, Math.round(h / 6)]), emissiveIntensity: 0.55 }), -66 + i * 12, 0, -38); }
    for (const x of [-24, 0, 24]) { cyl(0.12, 7, new THREE.MeshStandardMaterial({ color: 0x333333 }), x, 0, -22); const l = new THREE.PointLight(0xffd59a, 30, 26, 1.5); l.position.set(x, 7, -21); scene.add(l); glowSprite(x, 7, -21.5, 3, 0xffcc88); }
    camera.position.set(0, 1.7, 12); camera.lookAt(0, 3.4, -30);
  },
  clinic() {
    scene.background = new THREE.Color(0xdde8e2); scene.fog = new THREE.Fog(0xdde8e2, 18, 40);
    roomShell(16, 5, 16, mat(T.plaster('#cfe6dc', [4, 2])), mat(T.tiles([8, 8]), { color: 0xe0dccc }), mat(T.plaster('#f0f2ee', [3, 3])));
    const wain = new THREE.Mesh(new THREE.PlaneGeometry(16, 1.2), mat(T.plaster('#a8cbbd', [4, 1]))); wain.position.set(0, 0.6, -7.98); scene.add(wain);
    box(1.6, 3, 0.1, mat(T.wood([1, 2]), { color: 0xb08860 }), 4.8, 0, -7.95);
    for (let i = 0; i < 4; i++) { box(0.9, 0.12, 0.9, new THREE.MeshStandardMaterial({ color: 0x5a7f9a }), -5.5 + i * 1.1, 0.8, -7); box(0.9, 0.9, 0.1, new THREE.MeshStandardMaterial({ color: 0x5a7f9a }), -5.5 + i * 1.1, 0.85, -7.45); }
    const poster = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.9), new THREE.MeshStandardMaterial({ color: 0xffffff })); poster.position.set(-3.4, 2.7, -7.95); scene.add(poster);
    const cross = new THREE.Mesh(new THREE.CircleGeometry(0.4, 24), new THREE.MeshStandardMaterial({ color: 0xe0626a })); cross.position.set(-3.4, 3.1, -7.93); scene.add(cross);
    bill(SPR.bush(), 1.4, 1.2, 2.4, 0, -7.3);
    const l = new THREE.PointLight(0xffffff, 40, 30, 1.2); l.position.set(0, 4.6, -2); l.castShadow = true; scene.add(l);
    scene.add(new THREE.AmbientLight(0xc8d8d0, 1.6));
    camera.position.set(0, 1.6, 7); camera.lookAt(0, 2.0, -8);
  },
  plague() {
    sky('#1e2a14', '#4a5a30', { clouds: 5 }); scene.fog = new THREE.Fog(0x3a4a26, 14, 80);
    sunLight(0x9ab070, 0.9, 20, 30, 10, 0x7a9050, 0x202814, 0.6);
    ground(mat(T.paving([30, 30]), { color: 0x6a7058 }), 200);
    for (let i = 0; i < 10; i++) { const h = 7 + (i * 31 % 8); const x = -45 + i * 10; box(9, h, 8, mat(T.plaster('#7a7a60', [2, 2])), x, 0, -36); const r = add(new THREE.Mesh(new THREE.CylinderGeometry(0.01, 6.6, 3, 4, 1), mat(T.roof([3, 1]), { color: 0x6a5040 })), x, h + 1.5, -36, Math.PI / 4); r.scale.set(1, 1, 0.75); }
    camera.position.set(0, 1.7, 10); camera.lookAt(0, 3, -30);
  },
  study() {
    scene.background = new THREE.Color(0x120b06); scene.fog = new THREE.Fog(0x1a1008, 10, 26);
    roomShell(14, 6, 14, mat(T.shelves([3, 1.5])), mat(T.wood([4, 4])), mat(T.wood([3, 3])));
    box(4, 0.15, 1.8, mat(T.wood([2, 1])), 2, 1.0, -4); for (const sx of [-1.8, 1.8]) box(0.15, 1, 1.6, mat(T.wood([1, 1])), 2 + sx, 0, -4);
    const lamp = new THREE.PointLight(0xffb060, 30, 18, 1.5); lamp.position.set(2.5, 2, -3.5); lamp.castShadow = true; scene.add(lamp); glowSprite(2.5, 1.5, -3.6, 1.6);
    scene.add(new THREE.AmbientLight(0x4a3018, 0.7));
    camera.position.set(0, 1.6, 6); camera.lookAt(0, 2.2, -7);
  },
  waves() {
    sky('#6fb4ea', '#d6eefc', { clouds: 6 }); scene.fog = new THREE.Fog(0xcfe6f6, 30, 180);
    sunLight(0xfff4e0, 2.4, -20, 40, 10, 0xd0e8ff, 0x204060, 0.8);
    const g = new THREE.PlaneGeometry(400, 400, 160, 160); g.rotateX(-Math.PI / 2); const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, Math.sin(x * 0.3) * 0.25 + Math.cos(z * 0.45 + x * 0.1) * 0.35); }
    g.computeVertexNormals(); const w = new THREE.Mesh(g, mat(T.water('#2f7fb8', [40, 40]), { roughness: 0.25, metalness: 0.1 })); scene.add(w);
    camera.position.set(0, 2.2, 10); camera.lookAt(0, 2.4, -30);
  },
};

export async function render(id, w, h) {
  const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(w, h, false);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0; renderer.outputColorSpace = THREE.SRGBColorSpace;
  scene = new THREE.Scene(); camera = new THREE.PerspectiveCamera(48, w / h, 0.1, 1000);
  camera.position.set(0, 1.7, 10);
  SCENES[id]();
  renderer.render(scene, camera);
  const url = canvas.toDataURL('image/jpeg', 0.95);
  renderer.dispose();
  return url;
}
export const IDS = Object.keys(SCENES);

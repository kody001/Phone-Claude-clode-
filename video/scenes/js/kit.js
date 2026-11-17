// Modeling helpers for low-poly toy sets.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mat } from './character.js';
export { mat };

export const grp = (...ch) => { const g = new THREE.Group(); ch.forEach(c => c && g.add(c)); return g; };
export function at(o, x = 0, y = 0, z = 0, ry = 0, rx = 0, rz = 0) { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); return o; }
const rbCache = new Map();
export function rbox(w, h, d, color, r = 0.04, rough = 0.6, metal = 0) {
  const k = [w, h, d, r].join(',');
  if (!rbCache.has(k)) rbCache.set(k, new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2.01, h / 2.01, d / 2.01)));
  const m = new THREE.Mesh(rbCache.get(k), typeof color === 'string' ? mat(color, rough, metal) : color); m.castShadow = true; m.receiveShadow = true; return m;
}
export function box(w, h, d, color, rough = 0.7, metal = 0) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof color === 'string' ? mat(color, rough, metal) : color); m.castShadow = true; m.receiveShadow = true; return m; }
export function cyl(rt, rb, h, color, seg = 16, rough = 0.6, metal = 0) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), typeof color === 'string' ? mat(color, rough, metal) : color); m.castShadow = true; m.receiveShadow = true; return m; }
export function sph(r, color, rough = 0.5, metal = 0, seg = 16) { const m = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.ceil(seg * 0.7)), typeof color === 'string' ? mat(color, rough, metal) : color); m.castShadow = true; m.receiveShadow = true; return m; }
export function cone(r, h, color, seg = 16, rough = 0.6) { const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), typeof color === 'string' ? mat(color, rough) : color); m.castShadow = true; m.receiveShadow = true; return m; }
export function torus(r, t, color, rough = 0.4, metal = 0, arc = Math.PI * 2) { const m = new THREE.Mesh(new THREE.TorusGeometry(r, t, 12, 48, arc), typeof color === 'string' ? mat(color, rough, metal) : color); m.castShadow = true; return m; }
export function plane(w, h, color, rough = 0.8) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), typeof color === 'string' ? mat(color, rough) : color); m.receiveShadow = true; return m; }

export function canvasTex(w, h, draw, repeat) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 1;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}
export function texMat(tex, rough = 0.7, extra = {}) { return new THREE.MeshStandardMaterial({ map: tex, roughness: rough, ...extra }); }
export function gradientBg(stops, w = 16, h = 512) {
  return canvasTex(w, h, (g) => { const gr = g.createLinearGradient(0, 0, 0, h); stops.forEach(([o, c]) => gr.addColorStop(o, c)); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
}
export function radialFloor(size, inner, outer, color = '#ffffff') {
  const t = canvasTex(512, 512, (g) => { const gr = g.createRadialGradient(256, 256, 0, 256, 256, 256); gr.addColorStop(0, inner); gr.addColorStop(1, outer); g.fillStyle = gr; g.fillRect(0, 0, 512, 512); });
  const m = new THREE.Mesh(new THREE.CircleGeometry(size, 64), new THREE.MeshStandardMaterial({ map: t, roughness: 0.9 })); m.rotation.x = -Math.PI / 2; m.receiveShadow = true; return m;
}
export function woodFloor(w, d, c1 = '#d0603a', c2 = '#b94f2e') {
  const t = canvasTex(512, 512, (g) => { g.fillStyle = c1; g.fillRect(0, 0, 512, 512); for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? c2 : c1; g.fillRect(0, i * 64, 512, 62); g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(0, i * 64 + 62, 512, 2); g.fillRect(((i * 197) % 512), i * 64, 2, 64); } }, [w / 3, d / 3]);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), texMat(t, 0.55)); m.rotation.x = -Math.PI / 2; m.receiveShadow = true; return m;
}
export function tileFloor(w, d, c1 = '#efe9ff', c2 = '#d9cff5', size = 1.2) {
  const t = canvasTex(256, 256, (g) => { g.fillStyle = c1; g.fillRect(0, 0, 256, 256); g.fillStyle = c2; g.fillRect(0, 0, 128, 128); g.fillRect(128, 128, 128, 128); g.strokeStyle = 'rgba(0,0,0,0.06)'; g.strokeRect(0, 0, 256, 256); }, [w / (size * 2), d / (size * 2)]);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), texMat(t, 0.35)); m.rotation.x = -Math.PI / 2; m.receiveShadow = true; return m;
}
export function marbleFloor(w, d) {
  const t = canvasTex(512, 512, (g) => { g.fillStyle = '#f4f0ff'; g.fillRect(0, 0, 512, 512); g.strokeStyle = 'rgba(160,140,200,0.25)'; g.lineWidth = 2; for (let i = 0; i < 14; i++) { g.beginPath(); let x = (i * 71) % 512, y = 0; g.moveTo(x, y); while (y < 512) { x += (Math.sin(y * 0.05 + i) * 14); y += 20; g.lineTo(x, y); } g.stroke(); } g.strokeStyle = 'rgba(200,170,90,0.6)'; g.lineWidth = 4; g.strokeRect(0, 0, 512, 512); }, [w / 4, d / 4]);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), texMat(t, 0.18, { metalness: 0.05 })); m.rotation.x = -Math.PI / 2; m.receiveShadow = true; return m;
}
// room: floor + 3 walls (back, left, right) with optional baseboard; open front
export function room({ w = 12, d = 10, h = 4.2, wall = '#d9c4f2', wallL, wallR, floor, base = '#ffffff', ceiling }) {
  const g = new THREE.Group();
  g.add(floor || woodFloor(w, d));
  const wm = (c) => mat(c, 0.92);
  const back = plane(w, h, wm(wall)); back.position.set(0, h / 2, -d / 2); g.add(back);
  const L = plane(d, h, wm(wallL || wall)); L.rotation.y = Math.PI / 2; L.position.set(-w / 2, h / 2, 0); g.add(L);
  const R = plane(d, h, wm(wallR || wall)); R.rotation.y = -Math.PI / 2; R.position.set(w / 2, h / 2, 0); g.add(R);
  if (base) { const b1 = box(w, 0.16, 0.05, base); b1.position.set(0, 0.08, -d / 2 + 0.03); g.add(b1); const b2 = box(0.05, 0.16, d, base); b2.position.set(-w / 2 + 0.03, 0.08, 0); g.add(b2); const b3 = box(0.05, 0.16, d, base); b3.position.set(w / 2 - 0.03, 0.08, 0); g.add(b3); }
  if (ceiling) { const c = plane(w, d, mat(ceiling, 0.95)); c.rotation.x = Math.PI / 2; c.position.y = h; g.add(c); }
  const F = plane(w, h, wm(wall)); F.rotation.y = Math.PI; F.position.set(0, h / 2, d / 2); g.add(F);
  return g;
}
export function windowFrame(w, h, sky = ['#bfe3ff', '#ffe2f2'], frame = '#ffffff', night = false) {
  const g = new THREE.Group();
  const t = gradientBg(night ? [[0, '#1a1050'], [1, '#4a2a9a']] : sky.map((c, i) => [i / (sky.length - 1), c]));
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t })); glass.position.z = 0.01; g.add(glass);
  if (night) { for (let i = 0; i < 6; i++) { const s = sph(0.02, '#ffffff'); s.material = new THREE.MeshBasicMaterial({ color: '#fff' }); s.position.set((i * 0.37 % 1 - 0.5) * w * 0.9, (i * 0.61 % 1 - 0.3) * h * 0.8, 0.02); g.add(s); } }
  const fw = 0.08;
  for (const [x, y, ww, hh] of [[0, h / 2, w + fw, fw], [0, -h / 2, w + fw, fw], [-w / 2, 0, fw, h], [w / 2, 0, fw, h], [0, 0, fw * 0.6, h], [0, 0, w, fw * 0.6]]) { const b = box(ww, hh, 0.08, frame, 0.5); b.position.set(x, y, 0.04); g.add(b); }
  const sill = box(w + 0.3, 0.06, 0.25, frame); sill.position.set(0, -h / 2 - 0.03, 0.12); g.add(sill);
  return g;
}
export function poster(w, h, draw) { const t = canvasTex(256, Math.round(256 * h / w), draw); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), texMat(t, 0.8)); m.position.z = 0.012; return m; }
export function abstractArt(w, h, cols) { return poster(w, h, (g, W, H) => { g.fillStyle = cols[0]; g.fillRect(0, 0, W, H); g.fillStyle = cols[1]; g.beginPath(); g.arc(W * 0.3, H * 0.4, W * 0.25, 0, 7); g.fill(); g.fillStyle = cols[2]; g.fillRect(W * 0.45, H * 0.2, W * 0.4, H * 0.5); g.fillStyle = cols[3] || '#fff'; g.fillRect(W * 0.1, H * 0.75, W * 0.8, H * 0.06); g.strokeStyle = '#fff'; g.lineWidth = 10; g.strokeRect(0, 0, W, H); }); }
export function tree(h = 2.4, col = '#3fb6e8', trunk = '#8a5a3a') {
  const g = new THREE.Group(); const t = cyl(0.07, 0.1, h * 0.55, trunk, 10); t.position.y = h * 0.27; g.add(t);
  const blobs = [[0, h * 0.7, 0, h * 0.28], [h * 0.15, h * 0.6, 0.05, h * 0.2], [-h * 0.14, h * 0.62, -0.05, h * 0.2], [0, h * 0.86, 0, h * 0.18]];
  for (const [x, y, z, r] of blobs) { const s = sph(r, col, 0.55, 0, 12); s.position.set(x, y, z); g.add(s); }
  return g;
}
export function bush(r = 0.5, col = '#5ad6a0') { const g = new THREE.Group(); for (const [x, y, s] of [[0, r * 0.6, 1], [r * 0.7, r * 0.45, 0.75], [-r * 0.7, r * 0.45, 0.8]]) { const b = sph(r * s, col, 0.6, 0, 12); b.position.set(x, y, 0); g.add(b); } return g; }
export function cloud(s = 1, col = '#ffffff') { const g = new THREE.Group(); const m = new THREE.MeshStandardMaterial({ color: col, roughness: 1, emissive: col, emissiveIntensity: 0.25 }); for (const [x, y, r] of [[0, 0, 1], [1.1, -0.2, 0.75], [-1.1, -0.25, 0.7], [0.5, 0.35, 0.7]]) { const b = new THREE.Mesh(new THREE.SphereGeometry(r * s, 12, 8), m); b.position.set(x * s, y * s, 0); b.scale.z = 0.6; g.add(b); } return g; }
export function lightRig(group, { hemi = ['#d8ccff', '#6a4aa8', 1.0], key = ['#fff4e6', 2.2, [5, 9, 6]], fill = null, rim = null, shadow = true, shadowSize = 14, target = [0, 0, 0] } = {}) {
  const h = new THREE.HemisphereLight(hemi[0], hemi[1], hemi[2]); group.add(h);
  const k = new THREE.DirectionalLight(key[0], key[1]); k.position.set(...key[2]); k.target.position.set(...target); group.add(k); group.add(k.target);
  if (shadow) { k.castShadow = true; k.shadow.mapSize.set(2048, 2048); const c = k.shadow.camera; c.left = -shadowSize; c.right = shadowSize; c.top = shadowSize; c.bottom = -shadowSize; c.near = 0.5; c.far = 60; k.shadow.bias = -0.0004; k.shadow.normalBias = 0.02; k.shadow.radius = 4; }
  if (fill) { const f = new THREE.DirectionalLight(fill[0], fill[1]); f.position.set(...fill[2]); group.add(f); }
  if (rim) { const r = new THREE.DirectionalLight(rim[0], rim[1]); r.position.set(...rim[2]); group.add(r); }
  return k;
}
export function labelTex(text, { w = 1024, h = 256, bg = null, color = '#f2c14e', font = '120px "DM Serif Display"', stroke = null } = {}) {
  return canvasTex(w, h, (g) => { if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); } g.font = font; g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle'; if (stroke) { g.lineWidth = 8; g.strokeStyle = stroke; g.strokeText(text, w / 2, h / 2); } g.fillText(text, w / 2, h / 2 + 6); });
}
export function sign(text, w, h, opts = {}) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: labelTex(text, opts), transparent: !opts.bg, roughness: 0.5, metalness: opts.metal || 0 })); return m; }

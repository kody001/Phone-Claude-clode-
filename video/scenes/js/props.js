// Props: vehicles, animals, furniture and small hand props. makeProp(kind) -> { obj, update?(t), reset?(), ...parts }
import * as THREE from 'three';
import { grp, at, rbox, box, cyl, sph, cone, torus, plane, canvasTex, texMat, mat, sign, labelTex } from './kit.js';
import { blobShadow } from './character.js';

const wheel = (r = 0.38, w = 0.26) => { const g = new THREE.Group(); const t = cyl(r, r, w, '#1d1a2b', 24, 0.8); t.rotation.z = Math.PI / 2; g.add(t); const h = cyl(r * 0.55, r * 0.55, w + 0.02, '#d9dbe8', 16, 0.3, 0.8); h.rotation.z = Math.PI / 2; g.add(h); return g; };

function vehicle({ len = 4.6, wid = 1.9, body = '#2a2a3a', cabin = '#1b1b2a', glass = '#6a7cc9', hBody = 0.7, hCab = 0.55, cabLen = 0.5, cabOff = -0.05, wheelR = 0.36, metal = 0.5, rough = 0.25, low = 0.2 }) {
  const g = new THREE.Group(); const wheels = [];
  const b = rbox(wid, hBody, len, body, 0.18, rough, metal); b.position.y = low + hBody / 2 + 0.05; g.add(b);
  const c = rbox(wid * 0.86, hCab, len * cabLen, glass, 0.2, 0.1, 0.6); c.position.set(0, low + hBody + hCab / 2, len * cabOff); g.add(c);
  const roof = rbox(wid * 0.88, 0.08, len * cabLen * 0.9, body, 0.04, rough, metal); roof.position.set(0, low + hBody + hCab, len * cabOff); g.add(roof);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const w = wheel(wheelR); w.position.set(sx * wid / 2, wheelR, sz * len * 0.33); g.add(w); wheels.push(w); }
  for (const sx of [-1, 1]) { const hl = sph(0.1, '#fff6c8', 0.2); hl.material = new THREE.MeshStandardMaterial({ color: '#fff6c8', emissive: '#fff2b0', emissiveIntensity: 0.8 }); hl.position.set(sx * wid * 0.35, low + hBody * 0.65, len / 2); hl.scale.z = 0.4; g.add(hl); const tl = sph(0.08, '#ff3355'); tl.material = new THREE.MeshStandardMaterial({ color: '#ff3355', emissive: '#ff2244', emissiveIntensity: 0.6 }); tl.position.set(sx * wid * 0.38, low + hBody * 0.65, -len / 2); tl.scale.z = 0.4; g.add(tl); }
  const sh = blobShadow(wid * 1.6, len * 1.15, 0.8); sh.position.y = 0.01; g.add(sh);
  return { g, wheels };
}

const P = {
  limo() { const v = vehicle({ len: 7.4, wid: 2.0, body: '#14121f', glass: '#2d2a4a', cabLen: 0.7, cabOff: -0.02, metal: 0.6, rough: 0.18 }); return { obj: v.g, wheels: v.wheels }; },
  sportsCar() { const v = vehicle({ len: 4.6, wid: 2.0, body: '#ff2e7a', glass: '#2d2a4a', hBody: 0.5, hCab: 0.42, cabLen: 0.38, cabOff: -0.08, wheelR: 0.36, metal: 0.7, rough: 0.15, low: 0.12 });
    const sp = box(1.9, 0.06, 0.4, '#14121f'); sp.position.set(0, 1.0, -2.1); v.g.add(sp); for (const s of [-1, 1]) { const p = box(0.06, 0.25, 0.1, '#14121f'); p.position.set(s * 0.7, 0.85, -2.1); v.g.add(p); }
    return { obj: v.g, wheels: v.wheels }; },
  goldCar() { const v = vehicle({ len: 4.6, wid: 2.0, body: '#f2c14e', glass: '#2d2a4a', hBody: 0.5, hCab: 0.42, cabLen: 0.38, cabOff: -0.08, metal: 0.9, rough: 0.12, low: 0.12 }); return { obj: v.g, wheels: v.wheels }; },
  bowCar() { // red sports car with giant bow
    const v = vehicle({ len: 4.6, wid: 2.0, body: '#e11d48', glass: '#2d2a4a', hBody: 0.5, hCab: 0.42, cabLen: 0.38, cabOff: -0.08, metal: 0.7, rough: 0.15, low: 0.12 });
    const rib = mat('#ffd36b', 0.35, 0.3);
    const r1 = box(0.25, 0.02, 4.7, rib); r1.position.set(0, 1.16, 0); v.g.add(r1); const r2 = box(2.05, 0.02, 0.25, rib); r2.position.set(0, 0.95, -0.4); v.g.add(r2);
    for (const s of [-1, 1]) { const l = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.12, 12, 24), rib); l.position.set(s * 0.32, 1.35, -0.4); l.rotation.set(0, Math.PI / 2, s * 0.5); l.scale.set(1, 0.7, 1); v.g.add(l); }
    const k = sph(0.14, rib); k.position.set(0, 1.3, -0.4); v.g.add(k);
    return { obj: v.g, wheels: v.wheels }; },
  bus() {
    const g = new THREE.Group(); const wheels = [];
    const len = 10, wid = 2.6, h = 2.7;
    const body = rbox(wid, h, len, '#ffb627', 0.3, 0.45, 0.1); body.position.y = 0.45 + h / 2; g.add(body);
    const stripe = box(wid + 0.02, 0.18, len * 0.98, '#e85d3a'); stripe.position.y = 1.1; g.add(stripe);
    const win = mat('#5b78c9', 0.1, 0.5);
    for (const s of [-1, 1]) for (let i = 0; i < 6; i++) { const w = rbox(0.04, 0.9, 1.25, win, 0.02); w.position.set(s * (wid / 2 + 0.005), 2.15, -3.8 + i * 1.45); g.add(w); }
    const ws = rbox(wid * 0.9, 1.2, 0.05, win, 0.04); ws.position.set(0, 2.1, len / 2 + 0.01); g.add(ws);
    const door = rbox(0.05, 2.0, 1.0, '#3d4a7a', 0.03); door.position.set(wid / 2 + 0.01, 1.5, 3.6); g.add(door);
    const sign_ = sign('42  GOLDCREST AVE', 2.2, 0.32, { bg: '#111', color: '#ffb000', font: 'bold 120px monospace' }); sign_.position.set(0, 3.0, len / 2 + 0.03); g.add(sign_);
    for (const z of [-3.2, 3.2]) for (const s of [-1, 1]) { const w_ = wheel(0.5, 0.35); w_.position.set(s * wid / 2, 0.5, z); g.add(w_); wheels.push(w_); }
    for (const s of [-1, 1]) { const hl = sph(0.14, '#fff6c8'); hl.material = new THREE.MeshStandardMaterial({ color: '#fff6c8', emissive: '#fff2b0', emissiveIntensity: 0.9 }); hl.position.set(s * 0.9, 0.95, len / 2 + 0.02); hl.scale.z = 0.3; g.add(hl); }
    const sh = blobShadow(3.6, 11.5, 0.9); sh.position.y = 0.01; g.add(sh);
    return { obj: g, wheels, door };
  },
  helicopter() {
    const g = new THREE.Group();
    const body = sph(1.3, '#22307a', 0.2, 0.3, 32); body.scale.set(1.0, 0.85, 1.5); body.position.y = 1.5; g.add(body);
    const glass = sph(1.0, '#5b78c9', 0.05, 0.6, 32); glass.scale.set(0.95, 0.7, 0.9); glass.position.set(0, 1.75, 0.95); g.add(glass);
    const stripe = torus(1.32, 0.05, '#f2c14e', 0.3, 0.9); stripe.rotation.y = Math.PI / 2; stripe.scale.set(1.5, 0.85, 1); stripe.position.y = 1.4; g.add(stripe);
    const tail = cyl(0.12, 0.3, 4.0, '#22307a', 16, 0.25, 0.3); tail.rotation.x = Math.PI / 2; tail.position.set(0, 1.8, -3.4); g.add(tail);
    const fin = box(0.08, 1.0, 0.6, '#f2c14e'); fin.position.set(0, 2.2, -5.3); g.add(fin);
    const trot = new THREE.Group(); trot.position.set(0.15, 2.2, -5.3); for (let i = 0; i < 2; i++) { const b = box(0.03, 1.1, 0.12, '#2a2a3a'); b.rotation.x = i * Math.PI / 2; trot.add(b); } g.add(trot);
    for (const s of [-1, 1]) { const sk = cyl(0.05, 0.05, 3.2, '#c0c4d6', 10, 0.3, 0.8); sk.rotation.x = Math.PI / 2; sk.position.set(s * 0.9, 0.1, 0.1); g.add(sk); for (const z of [-0.8, 0.8]) { const st = cyl(0.04, 0.04, 0.8, '#c0c4d6', 8); st.position.set(s * 0.8, 0.45, z); st.rotation.z = s * 0.3; g.add(st); } }
    const mast = cyl(0.1, 0.1, 0.5, '#2a2a3a'); mast.position.y = 2.75; g.add(mast);
    const rotor = new THREE.Group(); rotor.position.y = 3.0; for (let i = 0; i < 4; i++) { const b = box(0.28, 0.03, 5.2, '#2a2a3a', 0.4); b.position.z = 2.6; const arm = new THREE.Group(); arm.add(b); arm.rotation.y = i * Math.PI / 2; rotor.add(arm); } g.add(rotor);
    const blur = new THREE.Mesh(new THREE.CircleGeometry(5.3, 48), new THREE.MeshBasicMaterial({ color: '#1a1530', transparent: true, opacity: 0.12, depthWrite: false })); blur.rotation.x = -Math.PI / 2; blur.position.y = 3.02; g.add(blur);
    const doorL = rbox(0.06, 1.2, 1.1, '#1b1930', 0.05, 0.2, 0.5); doorL.position.set(1.28, 1.5, 0.2); g.add(doorL);
    const sh = blobShadow(4, 6, 0.8); sh.position.y = 0.01; g.add(sh);
    const p = { obj: g, rotor, trot, door: doorL, spin: 1, update(t) { rotor.rotation.y = t * 22 * p.spin; trot.rotation.x = t * 30 * p.spin; blur.material.opacity = 0.12 * p.spin; } };
    return p;
  },
  horse() {
    const g = new THREE.Group(); const coat = mat('#b9774a', 0.55), dark = mat('#5a3420', 0.5), white = mat('#fff7ee', 0.5);
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.55, 1.3, 8, 20), coat); body.rotation.x = Math.PI / 2; body.position.y = 1.55; body.castShadow = true; g.add(body);
    const neck = new THREE.Group(); neck.position.set(0, 1.85, 0.85); g.add(neck);
    const nk = new THREE.Mesh(new THREE.CapsuleGeometry(0.27, 0.7, 8, 16), coat); nk.position.set(0, 0.32, 0.3); nk.rotation.x = 0.85; neck.add(nk);
    const head = new THREE.Group(); head.position.set(0, 0.68, 0.62); neck.add(head);
    const hd = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.5, 8, 16), coat); hd.rotation.x = 2.2; hd.position.set(0, -0.12, 0.2); head.add(hd);
    const muzzle = sph(0.2, white); muzzle.position.set(0, -0.38, 0.43); muzzle.scale.set(1, 0.85, 1); head.add(muzzle);
    for (const s of [-1, 1]) { const e = sph(0.06, '#1c1233', 0.2); e.position.set(s * 0.21, 0.1, 0.22); head.add(e); const hi = sph(0.02, '#ffffff', 0.1); hi.position.set(s * 0.24, 0.13, 0.26); head.add(hi); const ear = cone(0.08, 0.22, coat); ear.position.set(s * 0.13, 0.32, 0.05); ear.rotation.z = -s * 0.2; head.add(ear); const n = sph(0.03, '#3a2014'); n.position.set(s * 0.08, -0.42, 0.6); head.add(n); }
    const mane = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.75, 6, 12), dark); mane.position.set(0, 0.5, 0.12); mane.rotation.x = 0.85; neck.add(mane);
    const legs = [];
    for (const [x, z] of [[-0.3, 0.6], [0.3, 0.6], [-0.3, -0.6], [0.3, -0.6]]) { const hip = new THREE.Group(); hip.position.set(x, 1.3, z); g.add(hip); const l = cyl(0.11, 0.09, 1.2, coat, 12); l.position.y = -0.6; hip.add(l); const hoof = cyl(0.11, 0.13, 0.14, dark, 12); hoof.position.y = -1.22; hip.add(hoof); legs.push(hip); }
    const tail = new THREE.Group(); tail.position.set(0, 1.75, -1.15); g.add(tail); const tl = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.7, 6, 12), dark); tl.position.set(0, -0.35, -0.15); tl.rotation.x = -0.4; tail.add(tl);
    const saddle = rbox(0.75, 0.12, 0.7, '#3a1f14', 0.05, 0.4); saddle.position.set(0, 2.12, -0.05); g.add(saddle);
    const sh = blobShadow(1.6, 2.8, 0.8); sh.position.y = 0.01; g.add(sh);
    const p = { obj: g, neck, head, legs, tail, chew: 0, walk: 0, update(t) { const w = p.walk; legs.forEach((l, i) => l.rotation.x = Math.sin(t * 6 + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI / 2 : 0)) * 0.35 * w); tail.rotation.z = Math.sin(t * 2.3) * 0.25; neck.rotation.x = (p.neckX || 0) + Math.sin(t * 1.4) * 0.03; head.rotation.x = (p.headX || 0) + (p.chew ? Math.sin(t * 14) * 0.05 : 0); } };
    return p;
  },
  giraffe() {
    const g = new THREE.Group();
    const tex = canvasTex(256, 256, (c) => { c.fillStyle = '#f7c65a'; c.fillRect(0, 0, 256, 256); c.fillStyle = '#b8642e'; for (let i = 0; i < 26; i++) { const x = (i * 97) % 256, y = (i * 61) % 256; c.beginPath(); c.ellipse(x, y, 20 + (i % 3) * 6, 16 + (i % 4) * 4, i, 0, 7); c.fill(); } }, [2, 2]);
    const coat = texMat(tex, 0.6);
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.6, 1.1, 8, 20), coat); body.rotation.x = Math.PI / 2; body.position.y = 2.4; body.castShadow = true; g.add(body);
    for (const [x, z] of [[-0.3, 0.55], [0.3, 0.55], [-0.3, -0.55], [0.3, -0.55]]) { const l = cyl(0.1, 0.08, 2.0, coat, 10); l.position.set(x, 1.1, z); g.add(l); }
    const neck = new THREE.Group(); neck.position.set(0, 2.7, 0.8); g.add(neck);
    const nk = cyl(0.18, 0.3, 3.0, coat, 14); nk.position.set(0, 1.4, 0.35); nk.rotation.x = 0.25; neck.add(nk);
    const head = new THREE.Group(); head.position.set(0, 2.95, 0.75); neck.add(head);
    const hd = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.45, 8, 14), coat); hd.rotation.x = 1.45; hd.position.z = 0.2; head.add(hd);
    for (const s of [-1, 1]) { const e = sph(0.055, '#1c1233', 0.2); e.position.set(s * 0.2, 0.08, 0.2); head.add(e); const o = cyl(0.03, 0.04, 0.3, '#b8642e'); o.position.set(s * 0.1, 0.35, -0.02); head.add(o); const ob = sph(0.06, '#8a4a20'); ob.position.set(s * 0.1, 0.52, -0.02); head.add(ob); }
    // party hat
    const hat = cone(0.15, 0.4, '#ff5d8f'); hat.position.set(0, 0.55, 0.15); head.add(hat); const pom = sph(0.06, '#ffd36b'); pom.position.set(0, 0.77, 0.15); head.add(pom);
    const sh = blobShadow(1.8, 2.6, 0.8); sh.position.y = 0.01; g.add(sh);
    const p = { obj: g, neck, head, update(t) { neck.rotation.x = Math.sin(t * 0.7) * 0.05 + (p.bend || 0); head.rotation.y = Math.sin(t * 0.5) * 0.2 + (p.look || 0); } };
    return p;
  },
  ferrisWheel() {
    const g = new THREE.Group(); const R = 7, wheel_ = new THREE.Group(); wheel_.position.y = R + 1.5; g.add(wheel_);
    const rim = torus(R, 0.12, '#f4efff', 0.3, 0.4); wheel_.add(rim); const rim2 = torus(R * 0.96, 0.08, '#ff5d8f', 0.3, 0.4); wheel_.add(rim2);
    const bulbs = new THREE.MeshStandardMaterial({ color: '#fff3b0', emissive: '#ffd36b', emissiveIntensity: 1.4 });
    const cars = [];
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; const sp = box(0.08, R, 0.08, '#f4efff'); sp.position.set(Math.cos(a) * R / 2, Math.sin(a) * R / 2, 0); sp.rotation.z = a - Math.PI / 2; wheel_.add(sp);
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), bulbs); b.position.set(Math.cos(a) * R, Math.sin(a) * R, 0.15); wheel_.add(b);
      const car = rbox(0.9, 0.8, 0.9, ['#ff5d8f', '#7ad3ff', '#ffd36b', '#9d7bff'][i % 4], 0.15); const holder = new THREE.Group(); holder.position.set(Math.cos(a) * R, Math.sin(a) * R, 0.6); car.position.y = -0.5; holder.add(car); wheel_.add(holder); cars.push(holder); }
    for (const s of [-1, 1]) { const leg = cyl(0.15, 0.2, R + 2.5, '#f4efff', 10); leg.position.set(s * 2.4, (R + 1.5) / 2, -0.6); leg.rotation.z = s * 0.3; g.add(leg); }
    const p = { obj: g, update(t) { wheel_.rotation.z = t * 0.12; cars.forEach(c => c.rotation.z = -wheel_.rotation.z); } };
    return p;
  },
  chocoFountain() {
    const g = new THREE.Group(); const gold = mat('#e8c15a', 0.25, 0.9), choc = new THREE.MeshStandardMaterial({ color: '#5a2a14', roughness: 0.15, metalness: 0.1 });
    const base = cyl(1.2, 1.4, 0.4, gold, 32); base.position.y = 0.2; g.add(base);
    const tiers = [[1.1, 0.6], [0.8, 1.4], [0.55, 2.1], [0.35, 2.7]];
    const flows = [];
    for (const [r, y] of tiers) { const bowl = cyl(r, r * 0.6, 0.25, gold, 32); bowl.position.y = y; g.add(bowl); const c = cyl(r * 0.96, r * 0.96, 0.05, choc, 32); c.position.y = y + 0.13; g.add(c); const curtain = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.98, r * 1.04, 0.62, 32, 4, true), choc); curtain.position.y = y - 0.3; g.add(curtain); flows.push(curtain); }
    const pole = cyl(0.08, 0.08, 3.0, gold); pole.position.y = 1.6; g.add(pole);
    const top = sph(0.2, gold); top.position.y = 3.15; g.add(top);
    const p = { obj: g, update(t) { flows.forEach((f, i) => { f.scale.x = f.scale.z = 1 + Math.sin(t * 6 + i) * 0.01; }); } };
    return p;
  },
  desk() {
    const g = new THREE.Group();
    const top = rbox(1.3, 0.08, 0.75, '#a0643c', 0.03, 0.35); top.position.y = 0.95; g.add(top);
    const trim = box(1.32, 0.03, 0.77, '#f2c14e', 0.3, 0.8); trim.position.y = 0.9; g.add(trim);
    for (const [x, z] of [[-0.58, -0.3], [0.58, -0.3], [-0.58, 0.3], [0.58, 0.3]]) { const l = cyl(0.03, 0.03, 0.9, '#3a2a40', 8); l.position.set(x, 0.45, z); g.add(l); }
    const chair = new THREE.Group(); chair.position.set(0, 0, 0.75); g.add(chair);
    const seat = rbox(0.6, 0.07, 0.55, '#6b3fa0', 0.03); seat.position.y = 0.5; chair.add(seat);
    const back = rbox(0.6, 0.6, 0.07, '#6b3fa0', 0.03); back.position.set(0, 0.85, 0.27); chair.add(back);
    for (const [x, z] of [[-0.25, -0.22], [0.25, -0.22], [-0.25, 0.22], [0.25, 0.22]]) { const l = cyl(0.025, 0.025, 0.5, '#3a2a40', 8); l.position.set(x, 0.25, z); chair.add(l); }
    return { obj: g, chair };
  },
  phone() { const g = new THREE.Group(); const b = rbox(0.12, 0.22, 0.018, '#17122a', 0.02, 0.3); g.add(b); const s = new THREE.Mesh(new THREE.PlaneGeometry(0.105, 0.2), new THREE.MeshStandardMaterial({ color: '#8fd3ff', emissive: '#5b78c9', emissiveIntensity: 0.9 })); s.position.z = 0.0095; g.add(s);
    const cr = new THREE.Mesh(new THREE.PlaneGeometry(0.105, 0.2), new THREE.MeshBasicMaterial({ map: canvasTex(128, 256, (c) => { c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 2; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(40, 70); let x = 40, y = 70; for (let j = 0; j < 5; j++) { x += Math.cos(i * 1.1 + j * 0.3) * 22; y += Math.sin(i * 1.1 + j * 0.3) * 22; c.lineTo(x, y); } c.stroke(); } }), transparent: true })); cr.position.z = 0.01; g.add(cr);
    return { obj: g, screen: s, cracks: cr }; },
  paperBag() { const g = new THREE.Group(); const b = rbox(0.24, 0.32, 0.15, '#c99a62', 0.02, 0.9); b.position.y = 0.16; g.add(b); const top = rbox(0.24, 0.07, 0.15, '#b98a52', 0.02, 0.9); top.position.y = 0.34; top.rotation.x = 0.25; g.add(top); return { obj: g }; },
  sandwich() { // diagonal cut halves
    const g = new THREE.Group(); const halves = [];
    for (const s of [-1, 1]) { const h = new THREE.Group(); const shape = new THREE.Shape(); shape.moveTo(0, 0); shape.lineTo(0.22, 0); shape.lineTo(0, 0.22); shape.closePath();
      const bread = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.035, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.01, bevelSegments: 2 }), mat('#f3d29a', 0.85));
      const crust = bread.clone(); crust.material = mat('#c98a4a', 0.8);
      const b1 = bread; b1.position.z = 0; const pb = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.02, bevelEnabled: false }), mat('#a8642e', 0.6)); pb.position.z = 0.04; pb.scale.setScalar(0.96);
      const jelly = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.012, bevelEnabled: false }), mat('#b0204a', 0.3)); jelly.position.z = 0.058; jelly.scale.setScalar(0.94);
      const b2 = bread.clone(); b2.position.z = 0.072;
      h.add(b1, pb, jelly, b2); h.rotation.x = -Math.PI / 2; const holder = new THREE.Group(); holder.add(h); h.position.set(-0.05, 0, 0.05);
      holder.rotation.y = s > 0 ? 0 : Math.PI; holder.position.x = s * 0.02; g.add(holder); halves.push(holder); }
    return { obj: g, halves };
  },
  plate() { const g = new THREE.Group(); const p = cyl(0.3, 0.24, 0.04, '#ffffff', 32, 0.3); g.add(p); return { obj: g }; },
  spaghetti() { const g = new THREE.Group(); const p = cyl(0.32, 0.25, 0.04, '#ffffff', 32, 0.3); g.add(p); const pasta = sph(0.22, '#f3d29a', 0.7); pasta.scale.y = 0.4; pasta.position.y = 0.06; g.add(pasta); const sauce = sph(0.14, '#c0392b', 0.4); sauce.scale.y = 0.4; sauce.position.y = 0.12; g.add(sauce); for (let i = 0; i < 3; i++) { const m = sph(0.045, '#7a3b1e', 0.6); m.position.set(Math.cos(i * 2) * 0.08, 0.15, Math.sin(i * 2) * 0.08); g.add(m); } return { obj: g }; },
  sushi() { const g = new THREE.Group(); const p = rbox(0.6, 0.05, 0.3, '#2a2238', 0.02); g.add(p); for (let i = 0; i < 4; i++) { const r = cyl(0.06, 0.06, 0.08, '#fdfdfd', 16); r.position.set(-0.2 + i * 0.13, 0.06, 0); g.add(r); const f = rbox(0.12, 0.03, 0.07, i % 2 ? '#ff8a5c' : '#ff5d6c', 0.01); f.position.set(-0.2 + i * 0.13, 0.11, 0); g.add(f); } return { obj: g }; },
  comic() { // open-able comic book
    const g = new THREE.Group(); const coverTex = canvasTex(256, 360, (c, W, H) => { const gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#ffd36b'); gr.addColorStop(1, '#ff7a3d'); c.fillStyle = gr; c.fillRect(0, 0, W, H); c.fillStyle = '#1d2a6b'; c.font = 'bold 44px "Baloo 2"'; c.textAlign = 'center'; c.fillText('CAPTAIN', W / 2, 60); c.fillText('THEO', W / 2, 104);
      c.fillStyle = '#f8f2ff'; c.beginPath(); c.arc(W / 2, 200, 50, 0, 7); c.fill(); c.fillStyle = '#2b1a12'; c.beginPath(); c.arc(W / 2, 190, 52, Math.PI, 0); c.fill(); c.fillStyle = '#e11d48'; c.beginPath(); c.moveTo(W / 2 - 60, 250); c.lineTo(W / 2 + 60, 250); c.lineTo(W / 2 + 90, 350); c.lineTo(W / 2 - 90, 350); c.fill(); c.fillStyle = '#1d2a6b'; c.fillRect(W / 2 - 40, 245, 80, 100); c.fillStyle = '#ffd36b'; c.font = 'bold 50px serif'; c.fillText('T', W / 2, 310);
      c.fillStyle = '#1c1233'; c.beginPath(); c.arc(W / 2 - 17, 205, 6, 0, 7); c.arc(W / 2 + 17, 205, 6, 0, 7); c.fill(); c.strokeStyle = '#000'; c.lineWidth = 6; c.strokeRect(0, 0, W, H); });
    const cover = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.36, 0.012), [mat('#ffffff'), mat('#ffffff'), mat('#ffffff'), mat('#ffffff'), texMat(coverTex, 0.6), mat('#f4efe6')]); cover.position.x = 0.13; const hinge = new THREE.Group(); hinge.add(cover); g.add(hinge);
    const pages = box(0.25, 0.35, 0.01, '#f8f4ea'); pages.position.set(0.13, 0, -0.012); g.add(pages);
    return { obj: g, hinge };
  },
  envelope() { const g = new THREE.Group(); const t = canvasTex(512, 320, (c, W, H) => { c.fillStyle = '#fbf6ea'; c.fillRect(0, 0, W, H); c.strokeStyle = '#d9b24c'; c.lineWidth = 10; c.strokeRect(12, 12, W - 24, H - 24); c.fillStyle = '#d9b24c'; c.beginPath(); c.arc(W / 2, H / 2, 60, 0, 7); c.fill(); c.fillStyle = '#fbf6ea'; c.font = 'bold 72px "DM Serif Display"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('G', W / 2, H / 2 + 4); c.fillStyle = '#1d2a6b'; c.font = '30px "DM Serif Display"'; c.fillText('GOLDCREST ACADEMY', W / 2, H - 50); });
    const e = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.26, 0.01), [mat('#fbf6ea'), mat('#fbf6ea'), mat('#fbf6ea'), mat('#fbf6ea'), texMat(t, 0.6), mat('#efe6d0')]); g.add(e); return { obj: g }; },
  backpack() { const g = new THREE.Group(); const b = sph(1, '#e2453c', 0.7); b.scale.set(0.2, 0.25, 0.12); b.position.y = 0.25; g.add(b); const pin = torus(0.03, 0.006, '#d8dde8', 0.2, 1); pin.position.set(0.05, 0.32, 0.12); pin.scale.set(1, 1.8, 1); g.add(pin); return { obj: g }; },
  lawnmower() { const g = new THREE.Group(); const d = rbox(0.8, 0.3, 0.6, '#2ecc71', 0.08, 0.4); d.position.y = 0.3; g.add(d); const e = rbox(0.35, 0.25, 0.3, '#333', 0.05); e.position.y = 0.55; g.add(e); for (const [x, z] of [[-0.35, -0.25], [0.35, -0.25], [-0.35, 0.25], [0.35, 0.25]]) { const w = wheel(0.12, 0.08); w.position.set(x, 0.12, z); g.add(w); } const h = cyl(0.025, 0.025, 1.2, '#888'); h.position.set(0, 0.85, -0.55); h.rotation.x = 0.7; g.add(h); return { obj: g }; },
  washer() { const g = new THREE.Group(); const b = rbox(0.9, 1.0, 0.85, '#f4f2fa', 0.06, 0.3); b.position.y = 0.5; g.add(b); const door = torus(0.28, 0.05, '#b0b4c8', 0.2, 0.8); door.position.set(0, 0.48, 0.43); g.add(door); const glass = new THREE.Mesh(new THREE.CircleGeometry(0.28, 32), new THREE.MeshStandardMaterial({ color: '#8fd3ff', roughness: 0.05, metalness: 0.3 })); glass.position.set(0, 0.48, 0.432); g.add(glass); const panel = box(0.9, 0.12, 0.05, '#d9d6e6'); panel.position.set(0, 0.92, 0.42); g.add(panel); const knob = cyl(0.05, 0.05, 0.04, '#5b3df5'); knob.rotation.x = Math.PI / 2; knob.position.set(0.3, 0.92, 0.45); g.add(knob);
    const clothes = new THREE.Group(); for (let i = 0; i < 4; i++) { const c = sph(0.08, ['#ff5d8f', '#ffd36b', '#7ad3ff', '#fff'][i]); c.position.set(Math.cos(i * 1.6) * 0.14, Math.sin(i * 1.6) * 0.14, 0); clothes.add(c); } clothes.position.set(0, 0.48, 0.35); g.add(clothes);
    const p = { obj: g, spin: 0, update(t) { clothes.rotation.z = t * 6 * p.spin; } }; return p; },
  mailbox() { const g = new THREE.Group(); const post = cyl(0.05, 0.05, 1.1, '#8a5a3a', 10); post.position.y = 0.55; g.add(post); const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.4, 6, 16), mat('#4a6fd6', 0.4, 0.3)); b.rotation.x = Math.PI / 2; b.position.y = 1.25; g.add(b); const flag = box(0.03, 0.25, 0.08, '#e11d48'); flag.position.set(0.22, 1.4, -0.1); g.add(flag); return { obj: g, flag }; },
  yacht() { const g = new THREE.Group(); const hull = rbox(2.6, 1.1, 9, '#ffffff', 0.4, 0.3); hull.position.y = 0.5; g.add(hull); const deck = rbox(2.2, 0.9, 5, '#f4efff', 0.3); deck.position.set(0, 1.4, -0.6); g.add(deck); const top = rbox(1.8, 0.7, 3, '#2d2a4a', 0.2, 0.1, 0.5); top.position.set(0, 2.2, -0.8); g.add(top); const stripe = box(2.62, 0.12, 9, '#1d2a6b'); stripe.position.y = 0.8; g.add(stripe); return { obj: g }; },
  jet() { const g = new THREE.Group(); const f = new THREE.Mesh(new THREE.CapsuleGeometry(0.9, 8, 8, 24), mat('#f8f6ff', 0.25, 0.3)); f.rotation.x = Math.PI / 2; g.add(f); for (const s of [-1, 1]) { const w = box(6, 0.12, 1.6, '#e8e4f5', 0.3); w.position.set(s * 3, -0.2, 0.3); w.rotation.y = s * -0.25; g.add(w); } const t = box(0.12, 1.8, 1.4, '#f2c14e'); t.position.set(0, 1.0, -4.4); g.add(t); const st = box(3, 0.1, 1, '#e8e4f5'); st.position.set(0, 0.3, -4.4); g.add(st); for (let i = 0; i < 8; i++) for (const s of [-1, 1]) { const w = sph(0.13, '#2d2a4a', 0.1); w.position.set(s * 0.86, 0.25, 3 - i * 0.8); w.scale.x = 0.3; g.add(w); } return { obj: g }; },
  capsule() { const g = new THREE.Group(); const b = cone(1.4, 2.4, '#f4efff', 32); b.position.y = 1.2; g.add(b); const top = cyl(0.5, 0.6, 0.4, '#d8d4e8'); top.position.y = 2.5; g.add(top); const win = new THREE.Mesh(new THREE.CircleGeometry(0.45, 32), new THREE.MeshStandardMaterial({ color: '#8fd3ff', emissive: '#4a78c9', emissiveIntensity: 0.4 })); win.position.set(0, 1.2, 0.85); win.rotation.x = -0.5; g.add(win); const ring = torus(0.47, 0.06, '#9aa0b8', 0.3, 0.8); ring.position.copy(win.position); ring.rotation.x = -0.5; g.add(ring); return { obj: g }; },
  globe() { const g = new THREE.Group(); const tex = canvasTex(1024, 512, (c, W, H) => { c.fillStyle = '#58b8f0'; c.fillRect(0, 0, W, H); c.fillStyle = '#7fe0a8'; const blobs = [[200, 150, 120, 90], [250, 330, 70, 110], [520, 140, 90, 70], [560, 300, 80, 120], [760, 160, 170, 90], [850, 350, 70, 50]]; for (const [x, y, rx, ry] of blobs) { c.beginPath(); c.ellipse(x, y, rx, ry, 0.3, 0, 7); c.fill(); } c.fillStyle = '#ffffff'; c.fillRect(0, 0, W, 30); c.fillRect(0, H - 30, W, 30); });
    const e = new THREE.Mesh(new THREE.SphereGeometry(2, 64, 48), texMat(tex, 0.5)); g.add(e); const atm = new THREE.Mesh(new THREE.SphereGeometry(2.08, 48, 32), new THREE.MeshBasicMaterial({ color: '#bfe3ff', transparent: true, opacity: 0.18, side: THREE.BackSide })); g.add(atm);
    const pin = new THREE.Group(); const head = sph(0.16, '#f2c14e', 0.2, 0.8); head.position.y = 0.55; pin.add(head); const needle = cone(0.05, 0.5, '#f2c14e'); needle.rotation.x = Math.PI; needle.position.y = 0.25; pin.add(needle); pin.position.set(0, 2.0, 0); const pivot = new THREE.Group(); pivot.add(pin); pivot.rotation.set(0.5, 0, -0.35); g.add(pivot);
    return { obj: g, earth: e, pin, pivot }; },
  island() { const g = new THREE.Group(); const sea = new THREE.Mesh(new THREE.CircleGeometry(60, 64), new THREE.MeshStandardMaterial({ color: '#3fc1e8', roughness: 0.15, metalness: 0.1 })); sea.rotation.x = -Math.PI / 2; g.add(sea);
    const sand = sph(3, '#ffe0a3', 0.9); sand.scale.set(1.6, 0.25, 1.2); g.add(sand); const grass = sph(2.2, '#5ad6a0', 0.7); grass.scale.set(1.3, 0.3, 1.0); grass.position.set(-0.8, 0.25, -0.4); g.add(grass);
    const trunk = cyl(0.1, 0.16, 3, '#a87a4a', 10); trunk.position.set(1.2, 1.8, 0.4); trunk.rotation.z = -0.2; g.add(trunk); for (let i = 0; i < 6; i++) { const l = sph(0.9, '#3dbb6a', 0.6); l.scale.set(1, 0.15, 0.35); l.position.set(1.5 + Math.cos(i) * 0.6, 3.3, 0.4 + Math.sin(i) * 0.6); l.rotation.y = i; l.rotation.z = -0.3; g.add(l); }
    const villa = rbox(1.6, 1.0, 1.2, '#ffffff', 0.08); villa.position.set(-1.0, 0.9, -0.6); g.add(villa); const roof = rbox(1.8, 0.15, 1.4, '#ff8a5c', 0.05); roof.position.set(-1.0, 1.45, -0.6); g.add(roof);
    return { obj: g }; },
  bubbles() { const g = new THREE.Group(); const m = new THREE.MeshStandardMaterial({ color: '#e8f6ff', roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.55 }); const list = []; for (let i = 0; i < 70; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.06 + (i % 5) * 0.04, 14, 10), m); b.userData = { x: Math.sin(i * 12.9) * 1.6, z: Math.cos(i * 7.3) * 1.2, s: 0.25 + (i % 7) * 0.08, p: i * 0.37 }; g.add(b); list.push(b); }
    const p = { obj: g, amount: 1, update(t) { list.forEach((b, i) => { const u = b.userData; const y = ((t * u.s + u.p) % 3); b.position.set(u.x + Math.sin(t + i) * 0.1, y * p.amount, u.z); b.visible = i / list.length < p.amount; }); } }; return p; },
  balloons() { const g = new THREE.Group(); const cols = ['#ff5d8f', '#ffd36b', '#7ad3ff', '#9d7bff', '#6ee7b7']; for (let i = 0; i < 7; i++) { const b = sph(0.32, cols[i % 5], 0.25); b.scale.y = 1.2; b.position.set(Math.sin(i * 2.1) * 0.6, 2.6 + Math.cos(i * 1.7) * 0.4, Math.cos(i * 2.1) * 0.5); g.add(b); const s = cyl(0.005, 0.005, 2.4, '#ffffff', 4); s.position.set(b.position.x / 2, 1.3, b.position.z / 2); g.add(s); } return { obj: g }; },
  giftBox() { const g = new THREE.Group(); const b = rbox(0.4, 0.35, 0.4, '#9d7bff', 0.03); b.position.y = 0.175; g.add(b); const r1 = box(0.42, 0.36, 0.06, '#ffd36b'); r1.position.y = 0.18; g.add(r1); const r2 = box(0.06, 0.36, 0.42, '#ffd36b'); r2.position.y = 0.18; g.add(r2); return { obj: g }; },
  watchBox() { const g = new THREE.Group(); const b = rbox(0.3, 0.12, 0.25, '#1d1d3a', 0.02); g.add(b); const w = torus(0.07, 0.02, '#f5c542', 0.2, 1); w.rotation.x = Math.PI / 2; w.position.y = 0.08; g.add(w); return { obj: g }; },
  console_() { const g = new THREE.Group(); const b = rbox(0.5, 0.12, 0.35, '#f4efff', 0.03); g.add(b); const s = box(0.3, 0.02, 0.2, '#2d2a4a'); s.position.y = 0.07; g.add(s); return { obj: g }; },
  sponge() { const g = new THREE.Group(); const s = rbox(0.16, 0.08, 0.1, '#ffd36b', 0.02, 0.9); g.add(s); return { obj: g }; },
  soap() { const g = new THREE.Group(); const b = rbox(0.12, 0.25, 0.08, '#6ee7b7', 0.03, 0.3); b.position.y = 0.125; g.add(b); const n = cyl(0.015, 0.02, 0.06, '#fff'); n.position.y = 0.28; g.add(n); return { obj: g }; },
  clipboard() { const g = new THREE.Group(); const b = rbox(0.24, 0.32, 0.015, '#8a5a3a', 0.01); g.add(b); const p = box(0.2, 0.26, 0.005, '#ffffff'); p.position.z = 0.01; g.add(p); const t = canvasTex(128, 160, (c) => { c.fillStyle = '#fff'; c.fillRect(0, 0, 128, 160); c.fillStyle = '#9a96b8'; for (let i = 0; i < 9; i++) c.fillRect(14, 18 + i * 15, 70 + (i * 13) % 30, 5); c.strokeStyle = '#2ecc71'; c.lineWidth = 4; c.beginPath(); c.moveTo(96, 132); c.lineTo(104, 140); c.lineTo(118, 122); c.stroke(); }); const pp = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.26), texMat(t)); pp.position.z = 0.013; g.add(pp); return { obj: g }; },
  textbook() { const g = new THREE.Group(); const b = rbox(0.3, 0.05, 0.38, '#5b3df5', 0.01); g.add(b); const p = box(0.28, 0.04, 0.36, '#f8f4ea'); p.position.x = 0.01; g.add(p); return { obj: g }; },
  cable() { const g = new THREE.Group(); const c = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -0.2, 0.05), new THREE.Vector3(0.1, -0.5, 0.1), new THREE.Vector3(0.3, -0.8, 0)]), 20, 0.008, 6), mat('#f4efff', 0.4)); g.add(c); return { obj: g }; },
  carwashCar() { const v = vehicle({ len: 4.2, wid: 1.9, body: '#7ad3ff', glass: '#2d2a4a', metal: 0.4, rough: 0.3 }); return { obj: v.g, wheels: v.wheels }; },
  familyCar() { const v = vehicle({ len: 4.0, wid: 1.8, body: '#b0a89a', glass: '#4a5a8a', metal: 0.2, rough: 0.6 }); return { obj: v.g, wheels: v.wheels }; },
};

export function makeProp(kind) {
  const f = P[kind] || P[kind + '_'];
  if (!f) throw new Error('unknown prop ' + kind);
  return f();
}

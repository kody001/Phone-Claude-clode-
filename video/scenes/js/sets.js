// Environments. buildSet(name) -> { group, bg, fog, env, exposure, spots, update?(t), parts }
import * as THREE from 'three';
import { grp, at, rbox, box, cyl, sph, cone, torus, plane, mat, canvasTex, texMat, gradientBg, radialFloor, woodFloor, tileFloor, marbleFloor, room, windowFrame, poster, abstractArt, tree, bush, cloud, lightRig, sign, labelTex } from './kit.js';
import { makeProp } from './props.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const SKY_DAY = [[0, '#8f7bff'], [0.45, '#c9b8ff'], [0.8, '#ffd6ec'], [1, '#ffe9f2']];
const SKY_DUSK = [[0, '#2a1a7a'], [0.5, '#8a3fc0'], [0.85, '#ff8fa3'], [1, '#ffb88a']];
const SKY_NIGHT = [[0, '#0d0838'], [0.6, '#2a1670'], [1, '#4a2a9a']];

function addProp(g, kind, x, y, z, ry = 0, s = 1) { const p = makeProp(kind); at(p.obj, x, y, z, ry); p.obj.scale.setScalar(s); g.add(p.obj); return p; }

function voidSet(top, bottom, floorIn, floorOut, fog) {
  const g = new THREE.Group();
  g.add(radialFloor(60, floorIn, floorOut));
  lightRig(g, { hemi: ['#d9ccff', '#3a1aa0', 1.25], key: ['#fff1e6', 2.4, [4, 8, 7]], rim: ['#ff9ed8', 1.4, [-6, 5, -8]], fill: ['#9fb0ff', 0.5, [-6, 3, 4]], shadowSize: 8 });
  return { group: g, bg: gradientBg([[0, top], [1, bottom]]), fog: new THREE.Fog(fog, 18, 45), env: 0.5 };
}

const B = {
  void: () => voidSet('#4a16d8', '#2c0a96', '#5a2ae6', '#300ca8', '#300ca8'),
  voidDark: () => { const s = voidSet('#1a0c5a', '#0a0428', '#2a1670', '#0c0530', '#0c0530'); s.exposure = 0.95; return s; },
  voidGold: () => voidSet('#7a3cff', '#3d0fb0', '#ffcf5a', '#5a1fd0', '#3d0fb0'),
  voidPink: () => voidSet('#ff7ab8', '#8a3fd8', '#ffa8d0', '#9a4ae0', '#9a4ae0'),

  schoolExt() {
    const g = new THREE.Group();
    const lawn = plane(220, 220, mat('#86dfc0', 0.9)); lawn.rotation.x = -Math.PI / 2; g.add(lawn);
    const drive = plane(9, 120, mat('#d6d0ea', 0.7)); drive.rotation.x = -Math.PI / 2; drive.position.set(0, 0.01, 10); g.add(drive);
    for (const s of [-1, 1]) { const kerb = box(0.3, 0.12, 120, '#f4efff'); kerb.position.set(s * 4.6, 0.06, 10); g.add(kerb); }
    // gate
    const stone = '#f2ecff', gold = mat('#f2c14e', 0.28, 0.9);
    for (const s of [-1, 1]) { const p = rbox(1.4, 5.2, 1.4, stone, 0.05, 0.6); p.position.set(s * 5.4, 2.6, 0); g.add(p); const cap = sph(0.55, gold); cap.position.set(s * 5.4, 5.6, 0); g.add(cap); const capb = rbox(1.6, 0.3, 1.6, stone, 0.05); capb.position.set(s * 5.4, 5.25, 0); g.add(capb); }
    const arch = torus(5.4, 0.12, gold, 0.28, 0.9, Math.PI); arch.position.set(0, 5.0, 0); g.add(arch);
    const crest = new THREE.Mesh(new THREE.CircleGeometry(1.1, 48), new THREE.MeshStandardMaterial({ map: labelTex('G', { w: 256, h: 256, bg: '#1f2a6e', color: '#f2c14e', font: '170px "DM Serif Display"' }), roughness: 0.4 })); crest.position.set(0, 9.6, 0.05); g.add(crest);
    const crestRing = torus(1.1, 0.1, gold); crestRing.position.set(0, 9.6, 0.05); g.add(crestRing);
    const nameSign = sign('GOLDCREST ACADEMY', 8.4, 1.0, { w: 2048, h: 244, color: '#f2c14e', font: '150px "DM Serif Display"' }); nameSign.position.set(0, 7.0, 0.1); g.add(nameSign);
    const sbar = box(9.6, 0.12, 0.12, gold); sbar.position.set(0, 6.4, 0); g.add(sbar);
    // open gate leaves
    for (const s of [-1, 1]) { const leaf = new THREE.Group(); leaf.position.set(s * 4.65, 0, 0); for (let i = 0; i < 9; i++) { const bar = cyl(0.04, 0.04, 4.2, gold, 8); bar.position.set(-s * (0.2 + i * 0.45), 2.2, 0); leaf.add(bar); const tip = cone(0.08, 0.25, gold, 8); tip.position.set(-s * (0.2 + i * 0.45), 4.4, 0); leaf.add(tip); } const rail = box(4.2, 0.08, 0.08, gold); rail.position.set(-s * 2.0, 1.0, 0); leaf.add(rail); const rail2 = rail.clone(); rail2.position.y = 3.6; leaf.add(rail2); leaf.rotation.y = s * 1.25; g.add(leaf); }
    // fence
    for (const s of [-1, 1]) for (let i = 0; i < 40; i++) { const x = s * (6.5 + i * 0.7); const bar = cyl(0.035, 0.035, 2.4, gold, 6); bar.position.set(x, 1.2, 0); g.add(bar); }
    for (const s of [-1, 1]) { const r = box(28, 0.07, 0.07, gold); r.position.set(s * 20.3, 2.2, 0); g.add(r); const r2 = r.clone(); r2.position.y = 0.4; g.add(r2); const hedge = rbox(28, 1.2, 1.2, '#4fcf9a', 0.5, 0.8); hedge.position.set(s * 20.3, 0.6, -1.2); g.add(hedge); }
    // guard booth
    const booth = rbox(2.2, 2.8, 2.2, '#f4efff', 0.08); booth.position.set(7.8, 1.4, 2.6); g.add(booth); const bw = box(2.24, 1.0, 1.6, mat('#7a8cff', 0.1, 0.4)); bw.position.set(7.8, 1.8, 2.7); g.add(bw); const broof = rbox(2.6, 0.25, 2.6, '#1f2a6e', 0.05); broof.position.set(7.8, 2.9, 2.6); g.add(broof);
    // main building
    const bld = new THREE.Group(); bld.position.set(0, 0, -34); g.add(bld);
    const main = rbox(46, 14, 12, '#f6f1ff', 0.2, 0.7); main.position.y = 7; bld.add(main);
    const roofB = rbox(47, 0.8, 13, '#e3d6ff', 0.1); roofB.position.y = 14.4; bld.add(roofB);
    const winM = mat('#8f9cff', 0.08, 0.5);
    for (let r = 0; r < 3; r++) for (let i = -9; i <= 9; i++) { if (Math.abs(i) < 3 && r < 2) continue; const w = rbox(1.2, 2.2, 0.2, winM, 0.15); w.position.set(i * 2.4, 2.6 + r * 4, 6.05); bld.add(w); const fr = box(1.5, 0.15, 0.4, '#ffffff'); fr.position.set(i * 2.4, 1.4 + r * 4, 6.1); bld.add(fr); }
    for (let i = -3; i <= 3; i++) { const c = cyl(0.55, 0.65, 11, '#ffffff', 20, 0.5); c.position.set(i * 2.2, 5.9, 8.2); bld.add(c); }
    const step = rbox(16, 0.5, 4, '#efe9ff', 0.05); step.position.set(0, 0.25, 8.6); bld.add(step);
    const porchRoof = rbox(17, 1.0, 4.2, '#ffffff', 0.1); porchRoof.position.set(0, 11.8, 8.2); bld.add(porchRoof);
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 9.5, 3.5, 3, 1), mat('#ffffff', 0.6)); ped.rotation.set(Math.PI / 2, 0, 0); ped.scale.set(1, 0.4, 1); ped.position.set(0, 13.5, 8.6); ped.rotation.z = Math.PI; ped.rotation.x = -Math.PI / 2;
    const pedShape = new THREE.Shape(); pedShape.moveTo(-9, 0); pedShape.lineTo(9, 0); pedShape.lineTo(0, 3.6); pedShape.closePath(); const pedM = new THREE.Mesh(new THREE.ExtrudeGeometry(pedShape, { depth: 1.2, bevelEnabled: false }), mat('#ffffff', 0.6)); pedM.position.set(0, 12.3, 7.6); bld.add(pedM);
    const pc = new THREE.Mesh(new THREE.CircleGeometry(1.1, 40), new THREE.MeshStandardMaterial({ map: labelTex('G', { w: 256, h: 256, bg: '#f2c14e', color: '#1f2a6e', font: '170px "DM Serif Display"' }), metalness: 0.5, roughness: 0.3 })); pc.position.set(0, 13.6, 8.85); bld.add(pc);
    const door = rbox(3.6, 5.5, 0.3, '#1f2a6e', 0.1); door.position.set(0, 3.0, 6.1); bld.add(door);
    const drum = cyl(5, 5, 3, '#f6f1ff', 40); drum.position.set(0, 16.5, 0); bld.add(drum);
    const dome = sph(5.2, gold, 0.25, 0.9, 40); dome.scale.y = 0.85; dome.position.set(0, 18, 0); bld.add(dome);
    const spire = cone(0.3, 3, gold); spire.position.set(0, 23.8, 0); bld.add(spire);
    for (const s of [-1, 1]) { const tower = rbox(8, 18, 10, '#f1eaff', 0.2); tower.position.set(s * 27, 9, 1); bld.add(tower); const tr = cone(5.5, 5, '#1f2a6e', 4); tr.rotation.y = Math.PI / 4; tr.position.set(s * 27, 20.5, 1); bld.add(tr); for (let r = 0; r < 4; r++) for (let i = -1; i <= 1; i++) { const w = rbox(1.1, 2.0, 0.2, winM, 0.15); w.position.set(s * 27 + i * 2.4, 3 + r * 4, 6.05); bld.add(w); } }
    // fountain
    const f = new THREE.Group(); f.position.set(0, 0, -16); g.add(f);
    const basin = cyl(4, 4.2, 0.8, '#f6f1ff', 40); basin.position.y = 0.4; f.add(basin); const water = cyl(3.7, 3.7, 0.05, mat('#7fd6ff', 0.05, 0.2), 40); water.position.y = 0.78; f.add(water);
    const col = cyl(0.4, 0.6, 2.4, '#f6f1ff', 16); col.position.y = 1.6; f.add(col); const bowl = cyl(1.6, 0.6, 0.5, '#f6f1ff', 32); bowl.position.y = 2.9; f.add(bowl); const gball = sph(0.5, gold); gball.position.y = 3.6; f.add(gball);
    // circle drive
    const ring = new THREE.Mesh(new THREE.RingGeometry(5, 9.5, 64), mat('#d6d0ea', 0.7)); ring.rotation.x = -Math.PI / 2; ring.position.set(0, 0.012, -16); g.add(ring);
    // trees
    const tc = ['#3fb6e8', '#5a8cff', '#7a6cff', '#3fd1c8'];
    for (let i = 0; i < 16; i++) for (const s of [-1, 1]) { const t = tree(3.2 + (i % 3) * 0.5, tc[(i + (s > 0 ? 1 : 0)) % 4]); t.position.set(s * (7.5 + (i % 2) * 2), 0, 30 - i * 4.5 - (i > 6 ? 12 : 0)); if (Math.abs(t.position.z) < 3) continue; g.add(t); }
    for (let i = 0; i < 12; i++) { const b = bush(0.7, '#4fcf9a'); b.position.set((i % 2 ? 1 : -1) * (12 + i * 1.7), 0, -8 - (i % 4) * 3); g.add(b); }
    // helipad
    const pad = new THREE.Mesh(new THREE.CircleGeometry(5, 48), mat('#3a3550', 0.6)); pad.rotation.x = -Math.PI / 2; pad.position.set(14, 0.015, -7); g.add(pad);
    const H = sign('H', 4, 4, { w: 512, h: 512, color: '#ffffff', font: 'bold 420px sans-serif' }); H.rotation.x = -Math.PI / 2; H.position.set(14, 0.03, -7); g.add(H);
    const padRing = new THREE.Mesh(new THREE.RingGeometry(4.3, 4.6, 48), mat('#f2c14e', 0.4)); padRing.rotation.x = -Math.PI / 2; padRing.position.set(14, 0.025, -7); g.add(padRing);
    for (let i = 0; i < 6; i++) { const c = cloud(2.5 + (i % 3), '#ffffff'); c.position.set(-60 + i * 25, 30 + (i % 2) * 8, -90); g.add(c); }
    lightRig(g, { hemi: ['#e6dcff', '#6a8a7a', 1.15], key: ['#fff1dc', 2.5, [18, 26, 20]], fill: ['#b0a0ff', 0.5, [-15, 8, 10]], shadowSize: 30, target: [0, 0, -5] });
    return { group: g, bg: gradientBg(SKY_DAY), fog: new THREE.Fog('#e8dcff', 60, 160), env: 0.5 };
  },

  avenue() { // the long walk from the bus stop to the gate
    const g = new THREE.Group();
    const grass = plane(400, 200, mat('#86dfc0', 0.9)); grass.rotation.x = -Math.PI / 2; g.add(grass);
    const road = plane(400, 8, mat('#5a5470', 0.85)); road.rotation.x = -Math.PI / 2; road.position.set(0, 0.01, 0); g.add(road);
    for (let i = -40; i < 40; i++) { const dash = plane(2, 0.18, mat('#ffffff', 0.6)); dash.rotation.x = -Math.PI / 2; dash.position.set(i * 5, 0.02, 0); g.add(dash); }
    const walk = plane(400, 2.8, mat('#e4def5', 0.75)); walk.rotation.x = -Math.PI / 2; walk.position.set(0, 0.015, -5.6); g.add(walk);
    const kerb = box(400, 0.16, 0.3, '#f4efff'); kerb.position.set(0, 0.08, -4.1); g.add(kerb);
    const gold = mat('#f2c14e', 0.28, 0.9);
    for (let i = -120; i < 120; i++) { const bar = cyl(0.035, 0.035, 2.2, gold, 6); bar.position.set(i * 0.8, 1.1, -7.4); g.add(bar); }
    const rail = box(200, 0.07, 0.07, gold); rail.position.set(0, 2.0, -7.4); g.add(rail);
    const hedge = rbox(200, 1.4, 1.2, '#4fcf9a', 0.5, 0.8); hedge.position.set(0, 0.7, -8.6); g.add(hedge);
    const tc = ['#3fb6e8', '#5a8cff', '#7a6cff'];
    for (let i = -14; i < 14; i++) { const t = tree(3.4 + (i % 2) * 0.6, tc[(i + 30) % 3]); t.position.set(i * 7, 0, -10.5); g.add(t); const t2 = tree(3.0, tc[(i + 31) % 3]); t2.position.set(i * 7 + 3.5, 0, 6.5); g.add(t2); }
    for (let i = -10; i < 10; i++) { const lamp = new THREE.Group(); const p = cyl(0.06, 0.08, 4, '#2a2240', 8); p.position.y = 2; lamp.add(p); const l = sph(0.25, mat('#fff3c4', 0.3)); l.material = new THREE.MeshStandardMaterial({ color: '#fff3c4', emissive: '#ffe8a0', emissiveIntensity: 0.6 }); l.position.y = 4.1; lamp.add(l); lamp.position.set(i * 10 + 5, 0, -4.4); g.add(lamp); }
    // distant dome
    const dome = sph(6, gold, 0.25, 0.9, 32); dome.scale.y = 0.85; dome.position.set(90, 16, -60); g.add(dome); const dbase = cyl(6, 6, 16, '#f6f1ff', 32); dbase.position.set(90, 8, -60); g.add(dbase);
    for (let i = 0; i < 6; i++) { const c = cloud(2.5 + (i % 3), '#ffffff'); c.position.set(-80 + i * 35, 28 + (i % 2) * 6, -90); g.add(c); }
    lightRig(g, { hemi: ['#e6dcff', '#6a8a7a', 1.15], key: ['#fff1dc', 2.4, [20, 25, 18]], fill: ['#b0a0ff', 0.5, [-15, 8, 10]], shadowSize: 26 });
    return { group: g, bg: gradientBg(SKY_DAY), fog: new THREE.Fog('#e8dcff', 50, 150), env: 0.5 };
  },

  street(variant = 'day') {
    const g = new THREE.Group(); const fall = variant === 'fall';
    const ground = plane(300, 200, mat('#a99fc4', 0.9)); ground.rotation.x = -Math.PI / 2; g.add(ground);
    const road = plane(300, 8, mat('#4f4a66', 0.85)); road.rotation.x = -Math.PI / 2; road.position.set(0, 0.01, 1); g.add(road);
    for (let i = -30; i < 30; i++) { const dash = plane(2, 0.18, mat('#fff4b0', 0.6)); dash.rotation.x = -Math.PI / 2; dash.position.set(i * 5, 0.02, 1); g.add(dash); }
    const walk = plane(300, 4, mat('#d9d2ea', 0.75)); walk.rotation.x = -Math.PI / 2; walk.position.set(0, 0.015, -5); g.add(walk);
    const kerb = box(300, 0.16, 0.3, '#efe9ff'); kerb.position.set(0, 0.08, -3); g.add(kerb);
    // bus stop shelter
    const sh = new THREE.Group(); sh.position.set(0, 0, -5.6); g.add(sh);
    const roof_ = rbox(4.2, 0.15, 1.8, '#3b2f6a', 0.05); roof_.position.y = 2.8; sh.add(roof_);
    for (const x of [-1.9, 1.9]) { const p = cyl(0.06, 0.06, 2.8, '#3b2f6a', 8); p.position.set(x, 1.4, -0.7); sh.add(p); }
    const glass = box(4.0, 2.2, 0.04, mat('#bfe3ff', 0.05, 0.1, { transparent: true, opacity: 0.35 })); glass.position.set(0, 1.5, -0.75); sh.add(glass);
    const bench = rbox(2.6, 0.12, 0.5, '#8a5a3a', 0.03); bench.position.set(0, 0.55, -0.4); sh.add(bench); for (const x of [-1.1, 1.1]) { const l = box(0.08, 0.55, 0.4, '#3b2f6a'); l.position.set(x, 0.27, -0.4); sh.add(l); }
    const stopSign = new THREE.Group(); const sp = cyl(0.05, 0.05, 3.2, '#9aa0b8', 8); sp.position.y = 1.6; stopSign.add(sp); const disc = new THREE.Mesh(new THREE.CircleGeometry(0.42, 32), new THREE.MeshStandardMaterial({ map: labelTex('BUS', { w: 256, h: 256, bg: '#2e8bff', color: '#ffffff', font: 'bold 110px sans-serif' }) })); disc.position.set(0, 3.0, 0.06); stopSign.add(disc); stopSign.position.set(2.7, 0, -3.6); g.add(stopSign);
    const ad = poster(1.6, 1.4, (c, W, H) => { const gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#ffd36b'); gr.addColorStop(1, '#ff7aa2'); c.fillStyle = gr; c.fillRect(0, 0, W, H); c.fillStyle = '#1d2a6b'; c.font = 'bold 40px "Baloo 2"'; c.textAlign = 'center'; c.fillText('FRESH', W / 2, 90); c.fillText('DONUTS', W / 2, 135); c.font = '120px "Noto Color Emoji"'; c.fillText('\u{1F369}', W / 2, 270); });
    ad.position.set(-1.0, 1.5, -0.72); sh.add(ad);
    // buildings
    const cols = ['#ff9eb5', '#9fb0ff', '#ffd08a', '#a8e6cf', '#c9a8ff', '#ffb3a0', '#8fd3ff'];
    for (let i = -10; i < 10; i++) { const w = 6 + (i * 7 % 3), h = 7 + ((i * 13) % 5) * 2.2; const b = rbox(w, h, 6, cols[(i + 20) % cols.length], 0.1, 0.8); b.position.set(i * 7.2, h / 2, -12); g.add(b);
      for (let r = 0; r < Math.floor(h / 2.4) - 1; r++) for (let c = 0; c < 2; c++) { const win = box(1.2, 1.4, 0.1, mat(r === 0 && c === 0 ? '#ffe9a8' : '#5b6fc9', 0.15, 0.3)); win.position.set(i * 7.2 - w / 4 + c * w / 2, 2.4 + r * 2.4, -8.95); g.add(win); }
      const shop = box(w * 0.8, 0.5, 0.15, cols[(i + 23) % cols.length]); shop.position.set(i * 7.2, 3.6, -8.9); g.add(shop); }
    const tc = fall ? ['#ff9a3d', '#e85d3a', '#ffc24a'] : ['#3fb6e8', '#5ad6a0', '#7a6cff'];
    for (let i = -8; i < 8; i++) { const t = tree(3.2, tc[(i + 20) % 3]); t.position.set(i * 9 + 4.5, 0, -7.6); g.add(t); }
    if (fall) { for (let i = 0; i < 60; i++) { const l = new THREE.Mesh(new THREE.CircleGeometry(0.08, 6), mat(tc[i % 3], 0.8)); l.rotation.x = -Math.PI / 2; l.position.set((Math.sin(i * 12.9) * 0.5) * 30, 0.03, -5 + Math.cos(i * 7.7) * 1.8); g.add(l); } }
    for (let i = 0; i < 5; i++) { const c = cloud(2.5 + (i % 3), '#ffffff'); c.position.set(-50 + i * 25, 26 + (i % 2) * 6, -70); g.add(c); }
    lightRig(g, { hemi: ['#e6dcff', '#7a6a9a', 1.1], key: [fall ? '#ffe2b8' : '#fff1dc', 2.4, [10, 18, 14]], fill: ['#b0a0ff', 0.5, [-15, 8, 10]], shadowSize: 22 });
    return { group: g, bg: gradientBg(fall ? [[0, '#7a6cff'], [0.6, '#ffc2a8'], [1, '#ffe2c8']] : SKY_DAY), fog: new THREE.Fog(fall ? '#ffd8c8' : '#e8dcff', 40, 120), env: 0.5 };
  },

  apartment(variant = 'dawn') {
    const g = new THREE.Group(); const night = variant === 'night';
    const wallTex = canvasTex(256, 256, (c) => { c.fillStyle = '#f1d6ae'; c.fillRect(0, 0, 256, 256); c.fillStyle = 'rgba(200,140,90,0.18)'; for (let x = 0; x < 256; x += 32) c.fillRect(x, 0, 12, 256); c.fillStyle = 'rgba(120,80,40,0.08)'; c.beginPath(); c.ellipse(190, 60, 40, 22, 0.3, 0, 7); c.fill(); }, [4, 2]);
    const wm = texMat(wallTex, 0.95);
    const floorT = canvasTex(256, 256, (c) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { c.fillStyle = (i + j) % 2 ? '#e3d8bd' : '#cfc29f'; c.fillRect(i * 64, j * 64, 64, 64); } c.fillStyle = 'rgba(90,70,40,0.1)'; c.fillRect(30, 140, 80, 30); }, [4, 3]);
    const fl = plane(8, 6, texMat(floorT, 0.6)); fl.rotation.x = -Math.PI / 2; g.add(fl);
    const back = plane(8, 3.4, wm); back.position.set(0, 1.7, -3); g.add(back);
    const L = plane(6, 3.4, wm); L.rotation.y = Math.PI / 2; L.position.set(-4, 1.7, 0); g.add(L);
    const R = plane(6, 3.4, wm); R.rotation.y = -Math.PI / 2; R.position.set(4, 1.7, 0); g.add(R);
    const ceil = plane(8, 6, mat('#efe2c8', 0.95)); ceil.rotation.x = Math.PI / 2; ceil.position.y = 3.4; g.add(ceil);
    // crack in wall
    const crack = poster(0.6, 0.9, (c, W, H) => { c.clearRect(0, 0, W, H); c.strokeStyle = 'rgba(80,50,30,0.7)'; c.lineWidth = 4; c.beginPath(); c.moveTo(W * 0.5, 0); c.lineTo(W * 0.4, H * 0.3); c.lineTo(W * 0.6, H * 0.5); c.lineTo(W * 0.45, H * 0.8); c.lineTo(W * 0.55, H); c.stroke(); }); crack.material.transparent = true; crack.position.set(2.6, 2.6, -2.98); g.add(crack);
    // kitchen counter + stove + sink + fridge along back wall
    const counter = rbox(3.6, 0.95, 0.7, '#a7c4b5', 0.03); counter.position.set(-1.6, 0.475, -2.6); g.add(counter); const top = rbox(3.7, 0.06, 0.75, '#f4efe0', 0.02); top.position.set(-1.6, 0.97, -2.6); g.add(top);
    for (let i = 0; i < 4; i++) { const d = box(0.8, 0.7, 0.02, '#94b3a3'); d.position.set(-3.0 + i * 0.92, 0.45, -2.24); g.add(d); const k = sph(0.03, '#e8e2d0'); k.position.set(-2.7 + i * 0.92, 0.7, -2.22); g.add(k); }
    const stove = rbox(0.8, 0.95, 0.7, '#f4f2ea', 0.03); stove.position.set(0.6, 0.475, -2.6); g.add(stove); for (const [x, z] of [[0.42, -2.75], [0.78, -2.75], [0.42, -2.45], [0.78, -2.45]]) { const b = cyl(0.12, 0.12, 0.02, '#2a2238', 16); b.position.set(x, 0.96, z); g.add(b); }
    const pot = cyl(0.2, 0.18, 0.25, '#c0c4d6', 20, 0.3, 0.7); pot.position.set(0.42, 1.1, -2.45); g.add(pot);
    const sink = box(0.7, 0.05, 0.45, '#cfd4e0'); sink.position.set(-1.6, 1.0, -2.6); g.add(sink); const tap = cyl(0.025, 0.025, 0.3, '#c0c4d6', 8, 0.2, 0.8); tap.position.set(-1.6, 1.15, -2.85); g.add(tap);
    const fridge = rbox(0.9, 1.9, 0.75, '#fff6e0', 0.08, 0.4); fridge.position.set(1.65, 0.95, -2.55); g.add(fridge); const fl2 = box(0.04, 0.4, 0.04, '#c8c0a8'); fl2.position.set(1.3, 1.3, -2.15); g.add(fl2);
    const drawing = poster(0.35, 0.3, (c, W, H) => { c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); c.strokeStyle = '#ff5d8f'; c.lineWidth = 6; c.beginPath(); c.arc(W * 0.3, H * 0.5, 30, 0, 7); c.stroke(); c.strokeStyle = '#3fb6e8'; c.beginPath(); c.arc(W * 0.7, H * 0.55, 24, 0, 7); c.stroke(); c.fillStyle = '#ffd36b'; c.beginPath(); c.arc(W * 0.85, H * 0.2, 18, 0, 7); c.fill(); }); drawing.position.set(1.65, 1.35, -2.17); g.add(drawing);
    // window above sink
    const win = windowFrame(1.4, 1.1, variant === 'dawn' ? ['#4a6ad8', '#ffb08a'] : ['#bfe3ff', '#ffe2f2'], '#f4efe0', night); win.position.set(-1.6, 2.0, -2.98); g.add(win);
    // radiator on right wall
    const rad = new THREE.Group(); for (let i = 0; i < 9; i++) { const f = rbox(0.08, 0.8, 0.22, '#d6cfc0', 0.03, 0.4, 0.4); f.position.set(0, 0.55, -0.6 + i * 0.15); rad.add(f); } const pipe = cyl(0.03, 0.03, 1.4, '#a8a090'); pipe.rotation.x = Math.PI / 2; pipe.position.set(0, 0.2, 0); rad.add(pipe); rad.position.set(3.85, 0, -0.5); g.add(rad);
    // table + chairs
    const tbl = new THREE.Group(); tbl.position.set(0, 0, 0.3); g.add(tbl);
    const tt = cyl(0.85, 0.85, 0.06, '#d9a46a', 32, 0.5); tt.position.y = 0.92; tbl.add(tt); const cloth = cyl(0.87, 0.87, 0.02, mat('#ff8a8a', 0.8), 32); cloth.position.y = 0.955; tbl.add(cloth);
    const tl = cyl(0.08, 0.12, 0.9, '#8a5a3a', 12); tl.position.y = 0.45; tbl.add(tl);
    const chairCols = ['#5bc0be', '#ffd36b', '#ff8a5c', '#9d7bff'];
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; const ch = new THREE.Group(); ch.position.set(Math.sin(a) * 1.2, 0, Math.cos(a) * 1.2); ch.rotation.y = a + Math.PI; const s = rbox(0.5, 0.06, 0.5, chairCols[i], 0.03); s.position.y = 0.5; ch.add(s); const b = rbox(0.5, 0.5, 0.06, chairCols[i], 0.03); b.position.set(0, 0.78, -0.24); ch.add(b); for (const [x, z] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) { const l = cyl(0.02, 0.02, 0.5, '#5a4a3a', 6); l.position.set(x, 0.25, z); ch.add(l); } tbl.add(ch); }
    // couch on left
    const couch = new THREE.Group(); couch.position.set(-3.3, 0, 0.8); couch.rotation.y = Math.PI / 2; g.add(couch);
    const cseat = rbox(2.2, 0.45, 0.85, '#c9a34a', 0.15, 0.95); cseat.position.y = 0.42; couch.add(cseat); const cback = rbox(2.2, 0.7, 0.25, '#b8923e', 0.12, 0.95); cback.position.set(0, 0.8, -0.35); couch.add(cback);
    for (const s of [-1, 1]) { const arm = rbox(0.25, 0.65, 0.85, '#b8923e', 0.1, 0.95); arm.position.set(s * 1.1, 0.55, 0); couch.add(arm); }
    const patch = box(0.4, 0.02, 0.35, '#7aa6ff'); patch.position.set(0.5, 0.655, 0.1); couch.add(patch);
    // door + hooks + clock + photo
    const door = rbox(0.08, 2.2, 1.0, '#a8754f', 0.02); door.position.set(3.95, 1.1, 1.8); g.add(door); const knob = sph(0.05, '#e8c15a', 0.3, 0.8); knob.position.set(3.88, 1.05, 1.45); g.add(knob);
    const clock = cyl(0.25, 0.25, 0.05, '#ffffff', 32); clock.rotation.x = Math.PI / 2; clock.position.set(-0.4, 2.6, -2.97); g.add(clock); const hand = box(0.02, 0.18, 0.01, '#222'); hand.position.set(-0.4, 2.66, -2.94); g.add(hand);
    const photo = poster(0.5, 0.4, (c, W, H) => { c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); c.fillStyle = '#ffd9a8'; c.fillRect(10, 10, W - 20, H - 20); for (const [x, r, col] of [[0.25, 30, '#5a2e1c'], [0.45, 34, '#3a2214'], [0.65, 24, '#4a2817'], [0.8, 18, '#4a2817']]) { c.fillStyle = '#f8f2ff'; c.beginPath(); c.arc(W * x, H * 0.5, r, 0, 7); c.fill(); c.fillStyle = col; c.beginPath(); c.arc(W * x, H * 0.47, r, Math.PI, 0); c.fill(); } }); photo.position.set(-3.98, 1.9, -1.2); photo.rotation.y = Math.PI / 2; g.add(photo);
    // lamp
    const cord = cyl(0.01, 0.01, 0.8, '#222'); cord.position.set(0, 3.0, 0.3); g.add(cord); const shade = cone(0.3, 0.25, mat('#ffe2a8', 0.6), 20); shade.position.set(0, 2.55, 0.3); g.add(shade);
    const bulb = new THREE.PointLight(night ? '#ffc27a' : '#ffd8a0', night ? 9 : 4, 9, 1.6); bulb.position.set(0, 2.4, 0.3); g.add(bulb);
    if (night) lightRig(g, { hemi: ['#ffd6a8', '#5a3a6a', 0.7], key: ['#ffcf9a', 1.4, [2, 6, 5]], fill: ['#6a5aff', 0.3, [-5, 3, 4]], shadowSize: 6 });
    else lightRig(g, { hemi: ['#c9c4ff', '#7a5a5a', 0.9], key: ['#ffd2b0', 1.8, [-3, 5, 4]], fill: ['#7a8cff', 0.5, [4, 3, 5]], shadowSize: 6 });
    return { group: g, bg: new THREE.Color('#1a1030'), env: 0.45, exposure: night ? 1.0 : 1.05 };
  },

  bedroom() {
    const g = new THREE.Group();
    const wallT = canvasTex(256, 256, (c) => { c.fillStyle = '#8f9ad8'; c.fillRect(0, 0, 256, 256); c.fillStyle = 'rgba(255,255,255,0.08)'; for (let i = 0; i < 20; i++) { c.beginPath(); c.arc((i * 53) % 256, (i * 97) % 256, 6, 0, 7); c.fill(); } }, [3, 2]);
    const wm = texMat(wallT, 0.95);
    const fl = woodFloor(5, 4.5, '#8a5a3a', '#7a4e32'); g.add(fl);
    const back = plane(5, 3.2, wm); back.position.set(0, 1.6, -2.25); g.add(back);
    const L = plane(4.5, 3.2, wm); L.rotation.y = Math.PI / 2; L.position.set(-2.5, 1.6, 0); g.add(L);
    const R = plane(4.5, 3.2, wm); R.rotation.y = -Math.PI / 2; R.position.set(2.5, 1.6, 0); g.add(R);
    const bed = new THREE.Group(); bed.position.set(-1.3, 0, -0.9); g.add(bed);
    const frame = rbox(1.3, 0.4, 2.3, '#c9a34a', 0.05); frame.position.y = 0.2; bed.add(frame); const matt = rbox(1.2, 0.2, 2.2, '#f4efff', 0.08); matt.position.y = 0.5; bed.add(matt);
    const blanket = rbox(1.25, 0.12, 1.4, '#ff8a5c', 0.06, 0.95); blanket.position.set(0, 0.62, 0.35); bed.add(blanket); const pillow = rbox(0.8, 0.18, 0.4, '#ffffff', 0.08); pillow.position.set(0, 0.68, -0.85); bed.add(pillow);
    const desk = rbox(1.2, 0.06, 0.6, '#d9a46a', 0.02); desk.position.set(1.6, 0.85, -1.8); g.add(desk); for (const [x, z] of [[1.05, -2.0], [2.15, -2.0], [1.05, -1.6], [2.15, -1.6]]) { const l = cyl(0.025, 0.025, 0.85, '#5a4a3a', 6); l.position.set(x, 0.42, z); g.add(l); }
    const lampP = cyl(0.02, 0.02, 0.4, '#2a2240'); lampP.position.set(2.0, 1.08, -1.95); g.add(lampP); const lampS = cone(0.15, 0.18, mat('#ffd36b', 0.5)); lampS.position.set(2.0, 1.3, -1.95); g.add(lampS);
    const dl = new THREE.PointLight('#ffc27a', 5, 6, 1.6); dl.position.set(2.0, 1.25, -1.8); g.add(dl);
    const paper = box(0.3, 0.005, 0.4, '#ffffff'); paper.position.set(1.5, 0.89, -1.75); paper.rotation.y = 0.2; g.add(paper);
    const win = windowFrame(1.2, 1.0, null, '#f4efff', true); win.position.set(0.3, 1.9, -2.24); g.add(win);
    const post = poster(0.7, 1.0, (c, W, H) => { c.fillStyle = '#1d1050'; c.fillRect(0, 0, W, H); c.fillStyle = '#ffd36b'; c.beginPath(); c.arc(W / 2, H * 0.4, 60, 0, 7); c.fill(); c.fillStyle = '#ff5d8f'; c.font = 'bold 40px "Baloo 2"'; c.textAlign = 'center'; c.fillText('DREAM', W / 2, H * 0.78); c.fillText('BIG', W / 2, H * 0.9); }); post.position.set(-2.48, 1.9, 0.6); post.rotation.y = Math.PI / 2; g.add(post);
    const mirror = new THREE.Group(); const mf = rbox(0.75, 1.3, 0.05, '#e8c15a', 0.04, 0.3, 0.7); mirror.add(mf); const mg = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 1.2), new THREE.MeshStandardMaterial({ color: '#cfe0ff', roughness: 0.02, metalness: 0.9 })); mg.position.z = 0.03; mirror.add(mg); mirror.position.set(2.47, 1.6, 0.8); mirror.rotation.y = -Math.PI / 2; g.add(mirror);
    lightRig(g, { hemi: ['#8a9cff', '#3a2a6a', 0.65], key: ['#9fb4ff', 1.0, [1, 5, 3]], fill: ['#ffb08a', 0.35, [3, 2, 2]], shadowSize: 5 });
    return { group: g, bg: new THREE.Color('#0d0838'), env: 0.35, exposure: 1.0, spots: { bed: [-1.3, 0, -0.9], mirror: [1.6, 0, 0.8] } };
  },

  classroom() {
    const g = new THREE.Group();
    g.add(room({ w: 16, d: 13, h: 5, wall: '#d9c4f2', floor: woodFloor(16, 13, '#b0643c', '#9c5734'), base: '#7a4a2a' }));
    const panel = mat('#8a5a3a', 0.6);
    const wb = box(16, 1.3, 0.06, panel); wb.position.set(0, 0.65, -6.46); g.add(wb); const wl = box(0.06, 1.3, 13, panel); wl.position.set(-7.96, 0.65, 0); g.add(wl); const wr = box(0.06, 1.3, 13, panel); wr.position.set(7.96, 0.65, 0); g.add(wr);
    const trimM = mat('#f2c14e', 0.3, 0.8); const t1 = box(16, 0.06, 0.08, trimM); t1.position.set(0, 1.32, -6.44); g.add(t1);
    const board = rbox(6.5, 2.4, 0.1, '#20304a', 0.03, 0.4); board.position.set(0, 2.7, -6.42); g.add(board); const bframe = rbox(6.8, 2.7, 0.06, '#f2c14e', 0.03, 0.3, 0.8); bframe.position.set(0, 2.7, -6.47); g.add(bframe);
    const writing = sign('History: Empires & Dynasties', 5.6, 0.7, { w: 1600, h: 200, color: '#f4efff', font: '110px "DM Serif Display"' }); writing.position.set(0, 3.3, -6.36); g.add(writing);
    const chart = sign('• Rome  • Egypt  • Ming', 4.4, 0.5, { w: 1400, h: 160, color: '#ffd36b', font: '90px "DM Serif Display"' }); chart.position.set(0, 2.5, -6.36); g.add(chart);
    for (let i = -1; i <= 1; i++) { const w = windowFrame(2.0, 2.8, ['#9fd8ff', '#ffe2f2'], '#ffffff'); w.position.set(-7.95, 2.9, i * 3.6); w.rotation.y = Math.PI / 2; g.add(w); }
    const chand = new THREE.Group(); chand.position.set(0, 4.3, 0); const ring_ = torus(0.9, 0.05, trimM); ring_.rotation.x = Math.PI / 2; chand.add(ring_); for (let i = 0; i < 8; i++) { const b = sph(0.1, mat('#fff4c8', 0.2)); b.material = new THREE.MeshStandardMaterial({ color: '#fff4c8', emissive: '#ffe08a', emissiveIntensity: 1.2 }); b.position.set(Math.cos(i * Math.PI / 4) * 0.9, 0.1, Math.sin(i * Math.PI / 4) * 0.9); chand.add(b); } const ch = cyl(0.02, 0.02, 0.7, trimM); ch.position.y = 0.35; chand.add(ch); g.add(chand);
    const tdesk = rbox(2.4, 1.0, 1.0, '#7a4a2a', 0.04, 0.5); tdesk.position.set(4.0, 0.5, -4.8); g.add(tdesk); const globe = makeProp('globe'); globe.obj.scale.setScalar(0.14); globe.obj.position.set(4.6, 1.3, -4.8); g.add(globe.obj);
    const art = abstractArt(1.4, 1.0, ['#ff9eb5', '#ffd36b', '#7a6cff', '#fff']); art.position.set(5.5, 3.0, -6.44); g.add(art);
    const art2 = abstractArt(1.0, 1.3, ['#9fd8ff', '#ff5d8f', '#6ee7b7', '#fff']); art2.position.set(7.94, 3.0, -2); art2.rotation.y = -Math.PI / 2; g.add(art2);
    const portrait = poster(1.1, 1.4, (c, W, H) => { c.fillStyle = '#3a2a1a'; c.fillRect(0, 0, W, H); c.fillStyle = '#f2c14e'; c.lineWidth = 12; c.strokeStyle = '#f2c14e'; c.strokeRect(6, 6, W - 12, H - 12); c.fillStyle = '#f8f2ff'; c.beginPath(); c.arc(W / 2, H * 0.4, 60, 0, 7); c.fill(); c.fillStyle = '#9a9aa8'; c.beginPath(); c.arc(W / 2, H * 0.36, 62, Math.PI, 0); c.fill(); c.fillStyle = '#1d2a6b'; c.fillRect(W / 2 - 70, H * 0.6, 140, H * 0.4); });
    portrait.position.set(-5.2, 3.1, -6.44); g.add(portrait);
    // desks: 4 rows x 6 (students face -z)
    const desks = [];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) { const d = makeProp('desk'); const x = -5.0 + c * 2.0, z = -2.6 + r * 2.1; d.obj.position.set(x, 0, z); g.add(d.obj); desks.push({ x, z: z + 0.75, r, c }); }
    lightRig(g, { hemi: ['#e6dcff', '#8a5a5a', 0.95], key: ['#fff1dc', 2.3, [-12, 9, 2]], fill: ['#c0b0ff', 0.4, [6, 5, 8]], shadowSize: 12 });
    const sun = new THREE.PointLight('#ffe6c8', 6, 14, 1.5); sun.position.set(0, 4, 1); g.add(sun);
    return { group: g, bg: new THREE.Color('#2a1a50'), env: 0.5, spots: { desks } };
  },

  cafeteria() {
    const g = new THREE.Group();
    g.add(room({ w: 30, d: 22, h: 8, wall: '#f4e6d4', floor: marbleFloor(30, 22), base: '#f2c14e' }));
    const gold = mat('#f2c14e', 0.25, 0.9);
    for (let i = -3; i <= 3; i++) { const arch = torus(1.4, 0.12, gold, 0.25, 0.9, Math.PI); arch.position.set(i * 4, 4.6, -10.95); g.add(arch); const w = windowFrame(2.6, 3.2, ['#9fd8ff', '#ffe2f2'], '#f2c14e'); w.position.set(i * 4, 2.9, -10.94); g.add(w); }
    for (let i = -2; i <= 2; i++) { const p = cyl(0.35, 0.4, 8, '#ffffff', 20, 0.4); p.position.set(-14.6, 4, i * 4.2); g.add(p); const p2 = p.clone(); p2.position.x = 14.6; g.add(p2); }
    // chandeliers
    for (const x of [-8, 0, 8]) { const c = new THREE.Group(); c.position.set(x, 6.4, -1); for (let k = 0; k < 3; k++) { const r = torus(1.2 - k * 0.35, 0.05, gold); r.rotation.x = Math.PI / 2; r.position.y = -k * 0.35; c.add(r); for (let i = 0; i < 10 - k * 3; i++) { const a = i / (10 - k * 3) * Math.PI * 2; const b = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), new THREE.MeshStandardMaterial({ color: '#fff6d8', emissive: '#ffe08a', emissiveIntensity: 1.5 })); b.position.set(Math.cos(a) * (1.2 - k * 0.35), -k * 0.35 + 0.1, Math.sin(a) * (1.2 - k * 0.35)); c.add(b); } } const chn = cyl(0.03, 0.03, 1.6, gold); chn.position.y = 0.8; c.add(chn); g.add(c); const pl = new THREE.PointLight('#ffe2a8', 10, 14, 1.4); pl.position.set(x, 5.6, -1); g.add(pl); }
    // long tables
    const tables = [];
    for (const [x, z] of [[-6, 2], [6, 2], [-6, -3.5], [6, -3.5]]) { const t = new THREE.Group(); t.position.set(x, 0, z); const top = rbox(7.5, 0.1, 1.6, '#ffffff', 0.03, 0.7); top.position.y = 0.95; t.add(top); const cloth = box(7.6, 0.5, 1.7, mat('#ffffff', 0.8)); cloth.position.y = 0.72; t.add(cloth); const runner = box(7.6, 0.02, 0.4, gold); runner.position.y = 1.01; t.add(runner);
      for (let i = 0; i < 6; i++) for (const s of [-1, 1]) { const ch = new THREE.Group(); ch.position.set(-3 + i * 1.2, 0, s * 1.15); ch.rotation.y = s > 0 ? Math.PI : 0; const seat = rbox(0.55, 0.08, 0.5, '#8a2a4a', 0.03); seat.position.y = 0.52; ch.add(seat); const back = rbox(0.55, 0.75, 0.08, '#f2c14e', 0.03, 0.3, 0.8); back.position.set(0, 0.92, -0.25); ch.add(back); t.add(ch); }
      for (let i = 0; i < 5; i++) { const cand = cyl(0.03, 0.03, 0.3, gold); cand.position.set(-3 + i * 1.5, 1.15, 0); t.add(cand); }
      g.add(t); tables.push(t); }
    // sushi bar (left)
    const sushi = new THREE.Group(); sushi.position.set(-11.5, 0, -7.5); sushi.rotation.y = 0.5; g.add(sushi);
    const sb = rbox(5, 1.1, 1.2, '#2a2238', 0.05); sb.position.y = 0.55; sushi.add(sb); const sbt = rbox(5.2, 0.08, 1.4, '#d9a46a', 0.03); sbt.position.y = 1.14; sushi.add(sbt);
    for (let i = 0; i < 6; i++) { const s = makeProp('sushi'); s.obj.position.set(-2 + i * 0.8, 1.2, 0.2); sushi.add(s.obj); }
    const ss = sign('SUSHI', 3, 0.7, { w: 1024, h: 240, bg: '#1f2a6e', color: '#f2c14e', font: '150px "DM Serif Display"' }); ss.position.set(0, 3.2, -0.5); sushi.add(ss);
    const lant = sph(0.3, mat('#ff5d6c', 0.5)); lant.position.set(-1.8, 2.7, -0.4); sushi.add(lant); const lant2 = lant.clone(); lant2.position.x = 1.8; sushi.add(lant2);
    // pasta station (right)
    const pasta = new THREE.Group(); pasta.position.set(11.5, 0, -7.5); pasta.rotation.y = -0.5; g.add(pasta);
    const pb = rbox(5, 1.1, 1.2, '#f4efff', 0.05); pb.position.y = 0.55; pasta.add(pb); const pbt = rbox(5.2, 0.08, 1.4, '#3a2a1a', 0.03); pbt.position.y = 1.14; pasta.add(pbt);
    for (let i = 0; i < 3; i++) { const pot = cyl(0.35, 0.3, 0.5, '#c0c4d6', 20, 0.25, 0.8); pot.position.set(-1.6 + i * 1.6, 1.43, 0); pasta.add(pot); }
    const ps = sign('PASTA', 3, 0.7, { w: 1024, h: 240, bg: '#1f2a6e', color: '#f2c14e', font: '150px "DM Serif Display"' }); ps.position.set(0, 3.2, -0.5); pasta.add(ps);
    // chocolate fountain center back
    const cf = makeProp('chocoFountain'); cf.obj.userData.keep = true; cf.obj.position.set(0, 0, -8.2); cf.obj.scale.setScalar(1.25); g.add(cf.obj);
    const cfTable = cyl(2.2, 2.2, 0.9, mat('#ffffff', 0.7), 40); cfTable.position.set(0, 0.45, -8.2); g.add(cfTable); cf.obj.position.y = 0.9;
    for (let i = 0; i < 8; i++) { const st = sph(0.08, '#ff3b5c', 0.4); st.position.set(Math.cos(i) * 1.9, 0.98, -8.2 + Math.sin(i) * 1.9); g.add(st); }
    // plants
    for (const [x, z] of [[-13.5, 9], [13.5, 9], [-13.5, -9.5], [13.5, -9.5]]) { const pot = cyl(0.5, 0.4, 0.8, '#f2c14e', 16, 0.3, 0.8); pot.position.set(x, 0.4, z); g.add(pot); const b = bush(0.7, '#3dbb6a'); b.position.set(x, 0.7, z); g.add(b); }
    lightRig(g, { hemi: ['#fff1dc', '#b08a6a', 1.0], key: ['#fff1dc', 1.9, [6, 14, 10]], fill: ['#d0c0ff', 0.4, [-10, 6, 8]], shadowSize: 18 });
    return { group: g, bg: new THREE.Color('#2a1a50'), env: 0.6, parts: { cf, tables }, update(t) { cf.update(t); } };
  },

  stables() {
    const g = new THREE.Group();
    const grass = plane(200, 200, mat('#86dfc0', 0.9)); grass.rotation.x = -Math.PI / 2; g.add(grass);
    const sandT = canvasTex(256, 256, (c) => { c.fillStyle = '#ecd2a2'; c.fillRect(0, 0, 256, 256); c.fillStyle = 'rgba(160,110,60,0.12)'; for (let i = 0; i < 300; i++) c.fillRect((i * 73) % 256, (i * 151) % 256, 3, 3); }, [6, 6]);
    const sand = new THREE.Mesh(new THREE.CircleGeometry(16, 64), texMat(sandT, 0.95)); sand.rotation.x = -Math.PI / 2; sand.position.y = 0.01; sand.receiveShadow = true; g.add(sand);
    for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2; const p = cyl(0.08, 0.08, 1.4, '#ffffff', 8); p.position.set(Math.cos(a) * 16, 0.7, Math.sin(a) * 16); g.add(p); const r = box(2.15, 0.1, 0.08, '#ffffff'); r.position.set(Math.cos(a + Math.PI / 48) * 16, 1.2, Math.sin(a + Math.PI / 48) * 16); r.rotation.y = -(a + Math.PI / 48) + Math.PI / 2; g.add(r); const r2 = r.clone(); r2.position.y = 0.7; g.add(r2); }
    const barn = new THREE.Group(); barn.position.set(0, 0, -24); g.add(barn);
    const bb = rbox(14, 7, 8, '#c8344a', 0.1, 0.8); bb.position.y = 3.5; barn.add(bb);
    const roofS = new THREE.Shape(); roofS.moveTo(-7.6, 0); roofS.lineTo(7.6, 0); roofS.lineTo(0, 4.2); roofS.closePath(); const roof = new THREE.Mesh(new THREE.ExtrudeGeometry(roofS, { depth: 8.6, bevelEnabled: false }), mat('#4a3a6a', 0.6)); roof.position.set(0, 7, -4.3); barn.add(roof);
    for (const x of [-3.5, 3.5]) { const door = box(3, 4.2, 0.1, '#ffffff'); door.position.set(x, 2.1, 4.02); barn.add(door); const x1 = box(3.6, 0.15, 0.12, '#c8344a'); x1.rotation.z = 0.95; x1.position.set(x, 2.1, 4.08); barn.add(x1); const x2 = x1.clone(); x2.rotation.z = -0.95; barn.add(x2); }
    const crest = sign('GOLDCREST EQUESTRIAN', 8, 0.9, { w: 2048, h: 230, bg: '#1f2a6e', color: '#f2c14e', font: '120px "DM Serif Display"' }); crest.position.set(0, 6.2, 4.06); barn.add(crest);
    for (let i = 0; i < 5; i++) { const hb = rbox(1.2, 0.8, 0.8, '#f2d27a', 0.1, 0.95); hb.position.set(-12 + i * 1.3 + (i > 2 ? 18 : 0), 0.4, -16 + (i % 2)); g.add(hb); }
    const tc = ['#3fb6e8', '#5ad6a0', '#7a6cff'];
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; const t = tree(3.6 + (i % 3) * 0.6, tc[i % 3]); t.position.set(Math.cos(a) * 30, 0, Math.sin(a) * 30); g.add(t); }
    for (let i = 0; i < 5; i++) { const c = cloud(2.5 + (i % 3), '#ffffff'); c.position.set(-50 + i * 25, 26 + (i % 2) * 6, -70); g.add(c); }
    lightRig(g, { hemi: ['#e6dcff', '#7a8a6a', 1.1], key: ['#ffe8c8', 2.5, [12, 18, 10]], fill: ['#b0a0ff', 0.45, [-10, 6, 8]], shadowSize: 18 });
    return { group: g, bg: gradientBg(SKY_DAY), fog: new THREE.Fog('#e8dcff', 45, 120), env: 0.5 };
  },

  hallway() {
    const g = new THREE.Group();
    const len = 40;
    g.add(tileFloor(8, len, '#efe9ff', '#d4c8f2', 0.9).translateZ(0));
    const wm = mat('#d9c4f2', 0.92);
    for (const s of [-1, 1]) { const w = plane(len, 5, wm); w.rotation.y = -s * Math.PI / 2; w.position.set(s * 4, 2.5, 0); g.add(w);
      for (let i = 0; i < 40; i++) { const lk = rbox(0.5, 1.9, 0.9, i % 7 === 3 ? '#f2c14e' : '#1f2a6e', 0.03, 0.35, i % 7 === 3 ? 0.8 : 0.2); lk.position.set(s * 3.72, 0.95 + 0.1, -len / 2 + 1 + i * 0.95); g.add(lk); const hdl = box(0.04, 0.18, 0.05, '#f2c14e', 0.3, 0.9); hdl.position.set(s * 3.45, 1.1, -len / 2 + 1.25 + i * 0.95); g.add(hdl); for (let v = 0; v < 3; v++) { const vent = box(0.02, 0.02, 0.4, '#141c4a'); vent.position.set(s * 3.46, 1.75 - v * 0.06, -len / 2 + 1 + i * 0.95); g.add(vent); } } }
    const ceil = plane(8, len, mat('#f4efff', 0.95)); ceil.rotation.x = Math.PI / 2; ceil.position.y = 5; g.add(ceil);
    for (let i = 0; i < 8; i++) { const l = box(1.6, 0.06, 0.6, mat('#ffffff', 0.3)); l.material = new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#fff4e0', emissiveIntensity: 1.2 }); l.position.set(0, 4.96, -len / 2 + 2.5 + i * 5); g.add(l); }
    for (let i = 0; i < 4; i++) { const ban = sign(i % 2 ? 'EXCELLENCE' : 'GOLDCREST', 0.9, 2.2, { w: 256, h: 620, bg: '#1f2a6e', color: '#f2c14e', font: '60px "DM Serif Display"' }); ban.position.set((i % 2 ? 1 : -1) * 3.95, 3.6, -14 + i * 8); ban.rotation.y = (i % 2 ? -1 : 1) * Math.PI / 2; g.add(ban); }
    const end = plane(8, 5, mat('#c9b0f0', 0.9)); end.position.set(0, 2.5, -len / 2); g.add(end); const endWin = windowFrame(3, 3.2, ['#9fd8ff', '#ffe2f2'], '#f2c14e'); endWin.position.set(0, 2.6, -len / 2 + 0.02); g.add(endWin);
    lightRig(g, { hemi: ['#f0e8ff', '#8a7aa8', 1.1], key: ['#fff4e6', 1.6, [2, 8, 6]], shadowSize: 12 });
    return { group: g, bg: new THREE.Color('#1a1030'), env: 0.55 };
  },

  mansion() {
    const g = new THREE.Group();
    const lawn = plane(240, 240, mat('#5fc7a3', 0.9)); lawn.rotation.x = -Math.PI / 2; g.add(lawn);
    const path = plane(8, 60, mat('#d6d0ea', 0.7)); path.rotation.x = -Math.PI / 2; path.position.set(0, 0.01, 0); g.add(path);
    const house = new THREE.Group(); house.position.set(0, 0, -34); g.add(house);
    const lit = new THREE.MeshStandardMaterial({ color: '#ffe4a0', emissive: '#ffcf70', emissiveIntensity: 1.0 });
    const hm = rbox(56, 16, 14, '#f6f1ff', 0.2, 0.7); hm.position.y = 8; house.add(hm);
    for (let r = 0; r < 3; r++) for (let i = -10; i <= 10; i++) { const w = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.6), lit); w.position.set(i * 2.6, 3 + r * 4.6, 7.02); house.add(w); }
    for (let i = -4; i <= 4; i++) { const c = cyl(0.6, 0.7, 13, '#ffffff', 20, 0.5); c.position.set(i * 2.5, 6.5, 9.5); house.add(c); }
    const pr = rbox(24, 1.2, 4.5, '#ffffff', 0.1); pr.position.set(0, 13.4, 9.2); house.add(pr);
    const roof = rbox(58, 1, 15, '#3a3060', 0.1); roof.position.y = 16.5; house.add(roof);
    for (const s of [-1, 1]) { const w = rbox(14, 12, 12, '#efe8ff', 0.2); w.position.set(s * 36, 6, 2); house.add(w); for (let r = 0; r < 2; r++) for (let i = -2; i <= 2; i++) { const ww = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 2.4), lit); ww.position.set(s * 36 + i * 2.5, 3 + r * 4.6, 8.02); house.add(ww); } }
    // ferris wheel left
    const fw = makeProp('ferrisWheel'); fw.obj.userData.keep = true; fw.obj.position.set(-22, 0, -14); fw.obj.rotation.y = 0.4; g.add(fw.obj);
    // stage right
    const stage = new THREE.Group(); stage.position.set(16, 0, -10); stage.rotation.y = -0.5; g.add(stage);
    const st = rbox(9, 1.0, 5, '#2a2238', 0.05); st.position.y = 0.5; stage.add(st);
    const truss = box(9.4, 0.3, 0.3, '#c0c4d6', 0.3, 0.8); truss.position.set(0, 5, -1); stage.add(truss); for (const x of [-4.5, 4.5]) { const tp = box(0.3, 5, 0.3, '#c0c4d6', 0.3, 0.8); tp.position.set(x, 2.5, -1); stage.add(tp); }
    const stageLights = []; for (let i = 0; i < 5; i++) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), new THREE.MeshStandardMaterial({ color: '#fff', emissive: ['#ff5d8f', '#7ad3ff', '#ffd36b', '#9d7bff', '#6ee7b7'][i], emissiveIntensity: 2 })); l.position.set(-3.6 + i * 1.8, 4.7, -1); l.userData.keep = true; stage.add(l); stageLights.push(l); }
    const drum = cyl(0.5, 0.5, 0.6, '#ff5d8f', 20); drum.position.set(1.5, 1.3, -1); drum.rotation.x = Math.PI / 2; stage.add(drum); const amp = rbox(1, 1.2, 0.6, '#222', 0.05); amp.position.set(-3, 1.6, -1.5); stage.add(amp);
    // string lights
    const bulbs = [];
    for (let k = 0; k < 6; k++) { const a = k / 6; for (let i = 0; i < 24; i++) { const x = -18 + i * 1.6, z = -4 - k * 4; const y = 6 - Math.sin(i / 23 * Math.PI) * 1.2; const b = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), new THREE.MeshStandardMaterial({ color: '#fff', emissive: ['#ffd36b', '#ff9ed8', '#9fd8ff'][(i + k) % 3], emissiveIntensity: 2 })); b.position.set(x, y, z); g.add(b); bulbs.push(b); } }
    for (const x of [-18.5, 19]) for (let k = 0; k < 6; k++) { const p = cyl(0.06, 0.06, 6.2, '#2a2240', 8); p.position.set(x, 3.1, -4 - k * 4); g.add(p); }
    // food stand with chef
    const stand = new THREE.Group(); stand.position.set(-9, 0, -2); stand.rotation.y = 0.6; g.add(stand); const sc = rbox(3.4, 1.1, 1.2, '#f4efff', 0.05); sc.position.y = 0.55; stand.add(sc); const awn = rbox(3.8, 0.12, 1.6, '#ff5d8f', 0.04); awn.position.set(0, 2.6, 0); stand.add(awn); for (const x of [-1.6, 1.6]) { const p = cyl(0.05, 0.05, 2.6, '#f4efff', 8); p.position.set(x, 1.3, 0.5); stand.add(p); }
    for (let i = 0; i < 6; i++) { const t = new THREE.Group(); const tt = cyl(0.6, 0.6, 0.05, '#ffffff', 24); tt.position.y = 1.0; t.add(tt); const tl = cyl(0.05, 0.05, 1.0, '#c0c4d6', 8); tl.position.y = 0.5; t.add(tl); t.position.set(-6 + (i % 3) * 6, 0, 4 + Math.floor(i / 3) * 5); g.add(t); const b = makeProp('balloons'); b.obj.position.copy(t.position); b.obj.scale.setScalar(0.7); g.add(b.obj); }
    const pile = new THREE.Group(); pile.position.set(5, 0, 2); g.add(pile); const gtable = rbox(3, 0.1, 1.4, '#ffffff', 0.03); gtable.position.y = 0.9; pile.add(gtable); for (let i = 0; i < 6; i++) { const gb = makeProp('giftBox'); gb.obj.position.set(-1.1 + (i % 3) * 1.0, 0.95 + Math.floor(i / 3) * 0.36, -0.2 + (i % 2) * 0.3); gb.obj.rotation.y = i; pile.add(gb.obj); }
    for (let i = 0; i < 8; i++) { const c = cloud(3 + (i % 3), '#ffc8e8'); c.position.set(-80 + i * 22, 30 + (i % 2) * 8, -110); g.add(c); }
    lightRig(g, { hemi: ['#ffb8d8', '#2a3a6a', 0.9], key: ['#ffb88a', 1.9, [-20, 14, 18]], fill: ['#7a6cff', 0.8, [15, 10, 10]], shadowSize: 30 });
    const warm = new THREE.PointLight('#ffcf8a', 30, 40, 1.5); warm.position.set(0, 7, -8); g.add(warm);
    return { group: g, bg: gradientBg(SKY_DUSK), fog: new THREE.Fog('#c86aa8', 60, 170), env: 0.45, exposure: 1.05, parts: { fw, stageLights, bulbs }, update(t) { fw.update(t); stageLights.forEach((l, i) => l.material.emissiveIntensity = 1.5 + Math.sin(t * 4 + i * 1.3) * 1.2); } };
  },

  theoDining() {
    const g = new THREE.Group();
    g.add(room({ w: 20, d: 14, h: 6.5, wall: '#4a3a7a', floor: marbleFloor(20, 14), base: '#f2c14e' }));
    const table = rbox(14, 0.15, 1.8, '#3a2216', 0.04, 0.3); table.position.set(0, 1.0, 0); g.add(table);
    for (const x of [-6.5, 6.5]) for (const z of [-0.7, 0.7]) { const l = cyl(0.08, 0.08, 1.0, '#2a1810'); l.position.set(x, 0.5, z); g.add(l); }
    for (let i = 0; i < 12; i++) for (const s of [-1, 1]) { const ch = new THREE.Group(); ch.position.set(-6 + i * 1.1, 0, s * 1.4); ch.rotation.y = s > 0 ? Math.PI : 0; const back = rbox(0.6, 1.4, 0.1, '#8a2a4a', 0.04); back.position.set(0, 1.2, -0.25); ch.add(back); const seat = rbox(0.6, 0.1, 0.55, '#8a2a4a', 0.03); seat.position.y = 0.55; ch.add(seat); g.add(ch); }
    const cand = new THREE.Group(); for (let i = -2; i <= 2; i++) { const c = cyl(0.04, 0.04, 0.4, '#f2c14e', 8, 0.3, 0.8); c.position.set(i * 2.5, 1.3, 0); cand.add(c); const fl = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), new THREE.MeshStandardMaterial({ color: '#fff', emissive: '#ffb84a', emissiveIntensity: 3 })); fl.position.set(i * 2.5, 1.55, 0); cand.add(fl); } g.add(cand);
    for (let i = -2; i <= 2; i++) { const w = windowFrame(2.2, 4, null, '#f2c14e', true); w.position.set(i * 3.8, 3.2, -6.98); g.add(w); }
    lightRig(g, { hemi: ['#8a7aff', '#2a1a40', 0.9], key: ['#ffcf9a', 1.9, [3, 8, 6]], shadowSize: 10 });
    const pl = new THREE.PointLight('#ffb870', 8, 12, 1.5); pl.position.set(5.5, 3, 1); g.add(pl);
    return { group: g, bg: new THREE.Color('#0d0838'), env: 0.35, exposure: 0.95 };
  },

  busInterior() {
    const g = new THREE.Group();
    const floor = plane(3, 12, mat('#5a5470', 0.8)); floor.rotation.x = -Math.PI / 2; g.add(floor);
    const wallM = mat('#f4efe0', 0.8);
    for (const s of [-1, 1]) { const w = plane(12, 1.0, wallM); w.rotation.y = -s * Math.PI / 2; w.position.set(s * 1.3, 0.5, 0); g.add(w); const top = plane(12, 0.6, wallM); top.rotation.y = -s * Math.PI / 2; top.position.set(s * 1.3, 2.4, 0); g.add(top); }
    const ceil = plane(3, 12, mat('#f4efe0', 0.9)); ceil.rotation.x = Math.PI / 2; ceil.position.y = 2.7; g.add(ceil);
    // windows with scrolling city
    const cityT = canvasTex(2048, 256, (c, W, H) => { const gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#b9a7ff'); gr.addColorStop(1, '#ffd1e8'); c.fillStyle = gr; c.fillRect(0, 0, W, H); const cols = ['#ff9eb5', '#9fb0ff', '#ffd08a', '#a8e6cf', '#c9a8ff']; for (let i = 0; i < 40; i++) { const h = 80 + (i * 37) % 140; c.fillStyle = cols[i % 5]; c.fillRect(i * 52, H - h, 48, h); c.fillStyle = 'rgba(255,255,255,0.4)'; for (let y = H - h + 12; y < H - 10; y += 24) c.fillRect(i * 52 + 8, y, 10, 12); } c.fillStyle = '#3fb6e8'; for (let i = 0; i < 12; i++) { c.beginPath(); c.arc(i * 170 + 60, H - 40, 34, 0, 7); c.fill(); } });
    cityT.wrapS = THREE.RepeatWrapping; cityT.repeat.set(0.35, 1);
    const winM = new THREE.MeshBasicMaterial({ map: cityT });
    for (const s of [-1, 1]) { const w = plane(12, 1.4, winM); w.rotation.y = -s * Math.PI / 2; w.position.set(s * 1.32, 1.55, 0); g.add(w); for (let i = 0; i < 7; i++) { const f = box(0.06, 1.5, 0.08, '#c0c4d6', 0.3, 0.6); f.position.set(s * 1.28, 1.55, -5.5 + i * 1.8); g.add(f); } }
    for (let i = 0; i < 5; i++) for (const s of [-1, 1]) { const seat = new THREE.Group(); seat.position.set(s * 0.75, 0, -4 + i * 2); const b = rbox(0.9, 0.15, 0.6, '#4a6fd6', 0.05); b.position.y = 0.55; seat.add(b); const bk = rbox(0.9, 0.8, 0.12, '#4a6fd6', 0.05); bk.position.set(0, 0.95, 0.3); seat.add(bk); g.add(seat); }
    const pole = cyl(0.03, 0.03, 2.7, '#ffd36b', 8, 0.3, 0.8); pole.position.set(0.25, 1.35, -1); g.add(pole);
    lightRig(g, { hemi: ['#fff4e6', '#7a6a9a', 1.0], key: ['#fff1dc', 1.6, [-3, 5, 2]], shadowSize: 6 });
    return { group: g, bg: new THREE.Color('#1a1030'), env: 0.45, parts: { cityT }, update(t) { cityT.offset.x = (t * 0.06) % 1; } };
  },

  island() { const g = new THREE.Group(); const isl = makeProp('island'); g.add(isl.obj); for (let i = 0; i < 5; i++) { const c = cloud(2 + (i % 3), '#ffffff'); c.position.set(-30 + i * 15, 14 + (i % 2) * 4, -40); g.add(c); } lightRig(g, { hemi: ['#e6f6ff', '#3fa0c8', 1.1], key: ['#fff1dc', 2.4, [10, 15, 10]], shadowSize: 10 }); return { group: g, bg: gradientBg([[0, '#4aa8ff'], [0.7, '#bfe6ff'], [1, '#ffe9f2']]), fog: new THREE.Fog('#cfefff', 30, 90), env: 0.5 }; },
  edgeSpace() { const g = new THREE.Group(); const earth = new THREE.Mesh(new THREE.SphereGeometry(60, 64, 48), new THREE.MeshStandardMaterial({ color: '#3a8cff', roughness: 0.5, emissive: '#1a3a8a', emissiveIntensity: 0.3 })); earth.position.set(0, -62, -10); g.add(earth); const atm = new THREE.Mesh(new THREE.SphereGeometry(61.5, 64, 48), new THREE.MeshBasicMaterial({ color: '#9fd8ff', transparent: true, opacity: 0.25, side: THREE.BackSide })); atm.position.copy(earth.position); g.add(atm);
    for (let i = 0; i < 120; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.04 + (i % 3) * 0.02, 6, 4), new THREE.MeshBasicMaterial({ color: '#ffffff' })); s.position.set(Math.sin(i * 12.9) * 40, 4 + Math.abs(Math.cos(i * 7.7)) * 25, -30 + Math.sin(i * 3.3) * 10); g.add(s); }
    const cap = makeProp('capsule'); cap.obj.userData.keep = true; cap.obj.position.set(0, 0.5, 0); g.add(cap.obj);
    lightRig(g, { hemi: ['#9fb4ff', '#1a1050', 0.6], key: ['#ffffff', 2.6, [8, 6, 8]], shadow: false });
    return { group: g, bg: gradientBg([[0, '#000005'], [0.7, '#0a0a3a'], [1, '#2a4aa8']]), env: 0.4, parts: { cap } }; },
  carwash() { const g = new THREE.Group(); const fl = plane(30, 30, mat('#9a96b8', 0.8)); fl.rotation.x = -Math.PI / 2; g.add(fl);
    const bay = new THREE.Group(); const roof = rbox(8, 0.3, 7, '#3fb6e8', 0.05); roof.position.y = 4; bay.add(roof); for (const [x, z] of [[-3.8, -3.3], [3.8, -3.3], [-3.8, 3.3], [3.8, 3.3]]) { const p = cyl(0.12, 0.12, 4, '#f4efff', 10); p.position.set(x, 2, z); bay.add(p); } g.add(bay);
    const s = sign("UNCLE RAY'S CAR WASH", 6, 0.9, { w: 2048, h: 300, bg: '#ffd36b', color: '#1d2a6b', font: 'bold 150px "Baloo 2"' }); s.position.set(0, 4.7, 3.4); g.add(s);
    const back = plane(30, 10, mat('#ffb3c8', 0.9)); back.position.set(0, 5, -8); g.add(back);
    const bucket = cyl(0.25, 0.2, 0.4, '#ff5d6c', 16); bucket.position.set(2.2, 0.2, 1.5); g.add(bucket);
    lightRig(g, { hemi: ['#e6dcff', '#7a6a9a', 1.15], key: ['#fff1dc', 2.4, [8, 12, 10]], shadowSize: 10 });
    return { group: g, bg: gradientBg(SKY_DAY), fog: new THREE.Fog('#e8dcff', 20, 60), env: 0.5 }; },
  laundry() { const g = new THREE.Group(); g.add(room({ w: 9, d: 7, h: 3.6, wall: '#bfe6ff', floor: tileFloor(9, 7, '#ffffff', '#e0f2ff', 0.6) })); for (let i = 0; i < 4; i++) { const w = makeProp('washer'); w.obj.position.set(-2.7 + i * 1.1, 0, -3.0); g.add(w.obj); } const sh = rbox(6, 0.08, 0.5, '#ffffff', 0.02); sh.position.set(0, 2.4, -3.2); g.add(sh); for (let i = 0; i < 5; i++) { const b = rbox(0.35, 0.45, 0.25, ['#ff5d8f', '#7ad3ff', '#ffd36b', '#9d7bff', '#6ee7b7'][i], 0.04); b.position.set(-2 + i * 1, 2.68, -3.2); g.add(b); }
    lightRig(g, { hemi: ['#f0f8ff', '#8a9ab8', 1.1], key: ['#ffffff', 1.8, [2, 6, 5]], shadowSize: 6 }); return { group: g, bg: new THREE.Color('#1a1030'), env: 0.55 }; },
  lawnYard() { const g = new THREE.Group(); const grass = plane(60, 60, mat('#7fd98a', 0.9)); grass.rotation.x = -Math.PI / 2; g.add(grass);
    for (let i = 0; i < 12; i++) { const stripe = plane(1.5, 20, mat(i % 2 ? '#8fe39a' : '#72cf80', 0.9)); stripe.rotation.x = -Math.PI / 2; stripe.position.set(-9 + i * 1.5, 0.005, -2); g.add(stripe); }
    const house = rbox(10, 5, 6, '#ffd8a8', 0.1); house.position.set(0, 2.5, -14); g.add(house); const roofS = new THREE.Shape(); roofS.moveTo(-5.6, 0); roofS.lineTo(5.6, 0); roofS.lineTo(0, 3); roofS.closePath(); const roof = new THREE.Mesh(new THREE.ExtrudeGeometry(roofS, { depth: 6.4, bevelEnabled: false }), mat('#7a6cff', 0.6)); roof.position.set(0, 5, -17.2); g.add(roof);
    for (let i = 0; i < 14; i++) { const p = box(0.15, 1.0, 0.1, '#ffffff'); p.position.set(-10 + i * 1.5, 0.5, -9); g.add(p); } const fr = box(21, 0.08, 0.06, '#ffffff'); fr.position.set(0.5, 0.75, -9); g.add(fr);
    const tr = tree(4, '#3fb6e8'); tr.position.set(7, 0, -8); g.add(tr);
    const sgn = new THREE.Group(); const sp = cyl(0.04, 0.04, 1.4, '#8a5a3a'); sp.position.y = 0.7; sgn.add(sp); const board = sign("DAD'S LAWN CARE", 2.2, 0.8, { w: 1024, h: 370, bg: '#ffffff', color: '#2f8a3a', font: 'bold 120px "Baloo 2"' }); board.position.y = 1.5; sgn.add(board); const sub = sign('Employees: 1', 1.6, 0.3, { w: 1024, h: 190, bg: '#ffffff', color: '#1d2a6b', font: 'bold 110px "Baloo 2"' }); sub.position.set(0, 1.0, 0.01); sgn.add(sub); sgn.position.set(-4, 0, 1); sgn.rotation.y = 0.35; g.add(sgn);
    lightRig(g, { hemi: ['#e6dcff', '#6a8a6a', 1.15], key: ['#fff1dc', 2.4, [8, 12, 10]], shadowSize: 12 });
    return { group: g, bg: gradientBg(SKY_DAY), fog: new THREE.Fog('#e8dcff', 25, 70), env: 0.5 }; },
  ocean() { const g = new THREE.Group(); const sea = plane(400, 400, new THREE.MeshStandardMaterial({ color: '#2fa8e0', roughness: 0.12, metalness: 0.1 })); sea.rotation.x = -Math.PI / 2; g.add(sea); const y = makeProp('yacht'); y.obj.position.set(0, -0.2, 0); y.obj.rotation.y = 0.6; g.add(y.obj);
    for (let i = 0; i < 8; i++) { const h = rbox(3, 2 + (i % 3) * 2, 3, ['#ffffff', '#ffe2b8', '#ffc8d8'][i % 3], 0.1); h.position.set(-30 + i * 6, 1 + (i % 3), -40 - (i % 2) * 4); g.add(h); }
    const hill = sph(30, '#5ad6a0', 0.8); hill.scale.set(2, 0.5, 0.6); hill.position.set(0, -8, -55); g.add(hill);
    lightRig(g, { hemi: ['#e6f6ff', '#3fa0c8', 1.1], key: ['#fff1dc', 2.4, [10, 15, 10]], shadowSize: 12 }); return { group: g, bg: gradientBg([[0, '#4aa8ff'], [0.7, '#bfe6ff'], [1, '#ffe9f2']]), fog: new THREE.Fog('#cfefff', 40, 120), env: 0.5 }; },
  sky() { const g = new THREE.Group(); for (let i = 0; i < 10; i++) { const c = cloud(3 + (i % 3) * 1.5, '#ffffff'); c.position.set(-40 + i * 9, -8 + (i % 3) * 3, -20 - (i % 4) * 10); g.add(c); } const j = makeProp('jet'); j.obj.userData.keep = true; g.add(j.obj); lightRig(g, { hemi: ['#e6f6ff', '#8a9ad8', 1.2], key: ['#fff1dc', 2.4, [10, 15, 10]], shadow: false }); return { group: g, bg: gradientBg([[0, '#5a8cff'], [1, '#ffd6ec']]), env: 0.5, parts: { jet: j } }; },
};

const LAMBERT = new URLSearchParams(location.search).get('lambert') !== '0';
const lamb = new Map();
function lambertOf(m) {
  if (!m.isMeshStandardMaterial || m.roughness < 0.3) return m;   // keep glossy/metal surfaces physically shaded
  if (!lamb.has(m.uuid)) lamb.set(m.uuid, new THREE.MeshLambertMaterial({ color: m.color, map: m.map, emissive: m.emissive, emissiveIntensity: m.emissiveIntensity, emissiveMap: m.emissiveMap, side: m.side }));
  return lamb.get(m.uuid);
}
// Merge every static mesh of a set by material to cut draw calls (SwiftShader is draw-call bound).
function mergeStatic(group) {
  group.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(group.matrixWorld).invert();
  const buckets = new Map(); const remove = [];
  group.traverse(o => {
    if (!o.isMesh || o.userData.keep) return;
    let p = o, dyn = false; while (p && p !== group) { if (p.userData.keep) { dyn = true; break; } p = p.parent; }
    if (dyn || Array.isArray(o.material) || o.material.transparent || o.isSkinnedMesh) return;
    let gg = o.geometry.clone(); const idx = !!gg.index;
    for (const k of Object.keys(gg.attributes)) if (!['position', 'normal', 'uv'].includes(k)) gg.deleteAttribute(k);
    gg.morphAttributes = {};
    if (!gg.attributes.uv) gg.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(gg.attributes.position.count * 2), 2));
    if (!gg.attributes.normal) gg.computeVertexNormals();
    gg.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld));
    const key = o.material.uuid + '|' + o.castShadow + '|' + idx;
    if (!buckets.has(key)) buckets.set(key, { mat: o.material, cast: o.castShadow, geos: [] });
    buckets.get(key).geos.push(gg); remove.push(o);
  });
  for (const o of remove) o.parent.remove(o);
  for (const b of buckets.values()) {
    const merged = mergeGeometries(b.geos, false); if (!merged) continue;
    // only ground-like (flat, wide) buckets receive shadows: shadow lookups are the costliest fragment work under SwiftShader
    merged.computeBoundingBox(); const bb = merged.boundingBox; const flat = (bb.max.y - bb.min.y) < 0.35 && (bb.max.x - bb.min.x) > 4;
    const m = new THREE.Mesh(merged, LAMBERT ? lambertOf(b.mat) : b.mat); m.castShadow = b.cast; m.receiveShadow = flat; m.matrixAutoUpdate = false; group.add(m);
  }
}
export function buildSet(name) {
  const [base, variant] = name.split(':');
  const f = B[base]; if (!f) throw new Error('unknown set ' + name);
  const s = f(variant);
  s.group.traverse(o => { if (o.isMesh && !o.material.transparent) { o.receiveShadow = true; } });
  mergeStatic(s.group);
  s.spots = s.spots || {};
  return s;
}

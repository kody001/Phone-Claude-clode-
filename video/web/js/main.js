// Engine: deterministic renderAt(t) for frame-accurate offline capture.
import * as THREE from 'three';
import { makeCast } from './chars.js';
import * as SETS from './sets.js';
import { drawOverlay, W, H } from './overlay.js';
import { buildTimeline } from './shots.js';
import { clamp, noise1 } from './util.js';

const Q = new URLSearchParams(location.search);
const words = await (await fetch('/data/words.json')).json();
const env = await (await fetch('/data/env.json')).json();
await Promise.all(['700 30px "Libre Baskerville"', '400 30px "Libre Baskerville"', '30px "Lilita One"', '700 30px Fredoka', '500 30px Fredoka'].map(f => document.fonts.load(f)));

const scale = +(Q.get('scale') || 1);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gl'), antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1); renderer.setSize(W * scale, H * scale, false);
document.getElementById('gl').style.width = W + 'px'; document.getElementById('gl').style.height = H + 'px';
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.08;
const ui = document.getElementById('ui').getContext('2d');
const grain = document.getElementById('grain').getContext('2d');

const sets = {
  building: SETS.buildBuilding(), street: SETS.buildStreet(), void: SETS.buildVoid(), shaft: SETS.buildShaft(), stack: SETS.buildStack(),
  classroom: SETS.buildClassroom(), store: SETS.buildStore(), stairs: SETS.buildStairs(), cafeteria: SETS.buildCafeteria(), office: SETS.buildOffice(), lava: SETS.buildLava(),
};
const cast = makeCast();
const camera = new THREE.PerspectiveCamera(40, W / H, 0.05, 200);

const TL = buildTimeline({ words, env, sets, cast, THREE, SETS });
const { shots, overlays, captions, speech } = TL;
shots.sort((a, b) => a.t0 - b.t0);
for (let i = 0; i < shots.length; i++) shots[i].t1 = shots[i].t1 ?? (shots[i + 1] ? shots[i + 1].t0 : TL.duration);

const envAt = (t) => { const i = Math.floor(t * 60); return env.v[Math.max(0, Math.min(env.v.length - 1, i))] || 0; };
// mouth openness for a character at time t (only when they are the active speaker)
function mouthFor(name, t) {
  for (const s of speech) if (t >= s.s - 0.05 && t <= s.e + 0.05 && s.who === name) {
    const v = envAt(t); return clamp((v - 0.08) * 2.6);
  }
  return 0;
}
const tmp = new THREE.Vector3();
function project(p) {
  const v = p.isVector3 ? tmp.copy(p) : p.isObject3D ? p.getWorldPosition(tmp) : tmp.set(p[0], p[1], p[2]);
  v.project(camera); return [(v.x * 0.5 + 0.5) * W, (-v.y * 0.5 + 0.5) * H];
}
function headPos(name, up = 0.75) { const c = cast[name]; c.root.updateMatrixWorld(true); const p = new THREE.Vector3(); c.head.getWorldPosition(p); p.y += up * c.root.scale.y; return p; }

let lastShot = null;
function findShot(t) { let lo = 0, hi = shots.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (shots[m].t0 <= t) lo = m; else hi = m - 1; } return shots[lo]; }
function captionAt(t) { for (const c of captions) if (t >= c.t0 && t <= c.t1) return c; return null; }

const afterShots = shots.filter(s => s.after);
const vtmp = new THREE.Vector3();
function resolveAnchors(t, castNow) {
  for (const e of overlays) {
    if (t < e.t0 - 0.05 || t > (e.t1 ?? e.t0) + 0.3) continue;
    const who = e.whoA ? e.whoA.who : (e.type === 'bubble' ? e.who : null);
    if (!who) continue;
    const up = e.whoA ? e.whoA.up : 0.62;
    let p = null;
    if (who === 'both') { if (castNow.includes('you') && castNow.includes('alex')) p = headPos('you', up).lerp(headPos('alex', up), 0.5); }
    else if (castNow.includes(who) && cast[who].root.visible) p = headPos(who, up);
    if (p) { vtmp.copy(p).project(camera); const x = (vtmp.x * 0.5 + 0.5) * W, y = (-vtmp.y * 0.5 + 0.5) * H; if (vtmp.z > 1 || x < -80 || x > W + 80 || y < -120 || y > H + 80) p = null; }
    e.anchor = p;
  }
}
window.renderAt = (t) => {
  const shot = findShot(t);
  const set = sets[shot.set];
  const scene = set.scene;
  TL.preFrame();
  for (const s of afterShots) if (s !== shot) s.after();
  const castNow = shot.castFn ? shot.castFn(t) : (shot.cast || []);
  // cast membership
  for (const [n, c] of Object.entries(cast)) {
    const used = castNow.includes(n);
    if (used) { if (c.root.parent !== scene) scene.add(c.root); c.root.visible = true; }
    else c.root.visible = false;
  }
  const ctx = {
    t, lt: t - shot.t0, u: clamp((t - shot.t0) / Math.max(0.001, shot.t1 - shot.t0)), shot, set, cast, cam: camera, S: {}, THREE,
    mouth: (n) => mouthFor(n, t), env: envAt, headPos,
  };
  camera.fov = 40; camera.up.set(0, 1, 0); camera.zoom = 1;
  shot.fn(ctx);
  TL.post(ctx);
  // camera shake
  if (ctx.shake) { const a = ctx.shake; camera.position.x += noise1(t * 30, 1) * a * 0.05; camera.position.y += noise1(t * 30, 2) * a * 0.05; camera.rotation.z += noise1(t * 25, 3) * a * 0.02; }
  camera.updateProjectionMatrix();
  set.update(t, ctx.S, camera);
  renderer.render(scene, camera);
  lastShot = shot;
  resolveAnchors(t, castNow);
  drawOverlay(ui, t, overlays, captionAt(t), { project, headPos, hideCaption: ctx.hideCaption || TL.bubbleAt(t) }, grain);
};
window.TL_INFO = { duration: TL.duration, shots: shots.length }; window.__dbgCam = camera; window.__dbgSets = sets;
window.TL_AUDIO = { sfx: TL.sfx, music: TL.music, speech: TL.speech, duration: TL.duration };
window.ready = true;

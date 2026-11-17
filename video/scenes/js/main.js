import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Character } from './character.js';
import { CAST, makeExtra } from './cast.js';
import { buildSet } from './sets.js';
import { makeProp } from './props.js';
import { Overlay } from './overlay.js';
import { Timeline } from './timeline.js';
import { noise1, kf, E, clamp } from './util.js';
import { defineShots } from './shots.js';

export const W = 1920, H = 1080, FPS = 60;
const QS = new URLSearchParams(location.search);
const SCALE = parseFloat(QS.get('scale') || '0.8333');

const glCanvas = document.createElement('canvas');
glCanvas.width = W * SCALE; glCanvas.height = H * SCALE;
const renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: QS.get('aa') !== '0', preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1); renderer.setSize(W * SCALE, H * SCALE, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = QS.get('shadows') !== '0';
renderer.shadowMap.type = THREE.PCFShadowMap;

const scene = new THREE.Scene();
renderer.shadowMap.autoUpdate = false;
if (QS.get('env') === '1') { const pmrem = new THREE.PMREMGenerator(renderer); scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; }
const camera = new THREE.PerspectiveCamera(40, W / H, 0.05, 400);

const comp = document.getElementById('out');
comp.width = W; comp.height = H;
const cx = comp.getContext('2d', { alpha: false });

// ---------- registries ----------
const sets = new Map();
function getSet(name) {
  if (!sets.has(name)) { const s = buildSet(name); s.group.visible = false; scene.add(s.group); sets.set(name, s); }
  return sets.get(name);
}
const actors = new Map();
function getActor(name) {
  if (!actors.has(name)) {
    const def = CAST[name] || makeExtra(name);
    const c = new Character({ name, ...def });
    c.root.traverse(o => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } });
    scene.add(c.root); scene.add(c.shadow); actors.set(name, c);
  }
  return actors.get(name);
}
const props = new Map();
function getProp(kind, idx = 0) {
  const key = kind + '#' + idx;
  if (!props.has(key)) { const p = makeProp(kind); p.obj.traverse(o => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = true; } }); scene.add(p.obj); props.set(key, p); }
  return props.get(key);
}

// ---------- camera controller ----------
class Cam {
  reset() { this.keys = null; this.shake = 0.006; this.follow = null; this.punches = []; this.roll = 0; this.fov = 40; this.p = [0, 1.6, 6]; this.l = [0, 1.2, 0]; this.fn = null; return this; }
  at(p, l, fov = 40) { this.p = p; this.l = l; this.fov = fov; this.keys = null; return this; }
  path(keys, ease = E.io) { this.keys = keys; this.ease = ease; return this; }   // keys: [t, p, l, fov]
  punch(t0, amt = 0.85, dur = 0.25) { this.punches.push([t0, amt, dur]); return this; }
  apply(t, gt) {
    let p = this.p, l = this.l, fov = this.fov;
    if (this.keys) {
      p = kf(t, this.keys.map(k => [k[0], k[1], k[4]]), this.ease);
      l = kf(t, this.keys.map(k => [k[0], k[2], k[4]]), this.ease);
      fov = kf(t, this.keys.map(k => [k[0], k[3] ?? this.fov, k[4]]), this.ease);
    }
    if (this.fn) { const o = this.fn(t); if (o) { p = o.p || p; l = o.l || l; fov = o.fov || fov; } }
    for (const [t0, amt, dur] of this.punches) { if (t >= t0) fov *= 1 + (amt - 1) * E.out((t - t0) / dur); }
    const s = this.shake;
    const nx = (noise1(gt * 0.7) - 0.5) * s, ny = (noise1(gt * 0.6 + 40) - 0.5) * s, nz = (noise1(gt * 0.5 + 80) - 0.5) * s;
    camera.position.set(p[0] + nx * 2, p[1] + ny * 2, p[2] + nz);
    camera.lookAt(l[0] + nx, l[1] + ny, l[2]);
    if (this.roll) camera.rotateZ(this.roll);
    camera.fov = fov; camera.updateProjectionMatrix();
  }
}
const cam = new Cam().reset();

// ---------- app ----------
const APP = window.APP = { ready: false };
let TL, shots = [], overlay, cur = -1, curUpdate = null, curCtx = null;

function enterShot(i) {
  if (curCtx && curCtx.onExit) { try { curCtx.onExit(); } catch (e) {} }
  for (const s of sets.values()) s.group.visible = false;
  for (const a of actors.values()) { a.root.visible = false; a.shadow.visible = false; }
  for (const p of props.values()) p.obj.visible = false;
  overlay.clearShot();
  cam.reset();
  const sh = shots[i];
  const set = sh.set ? getSet(sh.set) : null;
  if (set) { set.group.visible = true; scene.background = set.bg || null; scene.fog = set.fog || null; renderer.toneMappingExposure = set.exposure ?? 1.05; }
  renderer.shadowMap.needsUpdate = true;
  if (QS.get('fog') === '0') scene.fog = null;
  if (QS.get('tm') === '0') renderer.toneMapping = THREE.NoToneMapping;
  if (QS.get('lights') === 'min' && set) { let n = 0; set.group.traverse(o => { if (o.isDirectionalLight) { n++; if (n > 1) o.visible = false; } }); }
  const ctx = {
    shot: sh, set, T: sh.end - sh.start, cam, ov: overlay.shotApi(sh.start), THREE, scene,
    at: (a) => TL.time(a) - sh.start,
    actor: (name) => { const c = getActor(name); c.root.visible = true; c.root.position.set(0, 0, 0); c.root.rotation.set(0, 0, 0); c.body.rotation.set(0, 0, 0); c.root.scale.setScalar(c.opt.scale || 1);
      Object.assign(c.state, { seatH: 0.5, legsOut: false, pose: 'idle', pose2: null, mix: 0, expr: 'neutral', walk: 0, walkPhase: 0, talk: false, look: [0, 0], tremble: 0, bounce: 0, blink: true, armFn: null, chew: false, leanX: 0, leanZ: 0, tilt: 0, yOff: 0, groundY: 0, noShadow: false });
      for (const a of c.arms) for (const ch of [...a.grip.children]) a.grip.remove(ch);
      return c; },
    prop: (kind, idx = 0) => { const p = getProp(kind, idx); p.obj.visible = true; p.obj.position.set(0, 0, 0); p.obj.rotation.set(0, 0, 0); p.obj.scale.setScalar(1); p.reset && p.reset(); if (p.obj.parent !== scene) scene.add(p.obj); return p; },
    hold: (actor, prop, hand = 1) => { actor.arms[hand].grip.add(prop.obj); prop.obj.position.set(0, 0, 0); prop.obj.rotation.set(0, 0, 0); return prop; },
  };
  curCtx = ctx;
  curUpdate = sh.run(ctx) || null;
  cur = i;
}

function findShot(t) { let lo = 0, hi = shots.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (shots[m].start <= t) lo = m; else hi = m - 1; } return lo; }

APP.init = async () => {
  const [script, timing] = await Promise.all([fetch('../data/script.json').then(r => r.json()), fetch('../data/timing.json').then(r => r.json())]);
  TL = new Timeline(script, timing);
  overlay = new Overlay(cx, W, H, TL, camera);
  shots = defineShots(TL);
  APP.duration = TL.total; APP.frames = Math.ceil(TL.total * FPS); APP.shots = shots.map(s => ({ start: s.start, end: s.end, set: s.set, at: s.at, id: s.id }));
  await document.fonts.ready;
  APP.ready = true;
  return { duration: APP.duration, frames: APP.frames, shots: shots.length };
};

APP.render = (frame) => {
  const t = frame / FPS;
  const i = findShot(t);
  if (i !== cur) enterShot(i);
  const sh = shots[i], lt = t - sh.start;
  curCtx.t = lt; curCtx.gt = t;
  if (curCtx.set && curCtx.set.update) curCtx.set.update(t, lt);
  if (curUpdate) curUpdate(lt, t);
  for (const a of actors.values()) if (a.root.visible) a.apply(t);
  for (const p of props.values()) if (p.obj.visible && p.update) p.update(t);
  cam.apply(lt, t);
  if (QS.get('hideSet') === '1' && curCtx.set) curCtx.set.group.visible = false;
  if (QS.get('hideActors') === '1') for (const a of actors.values()) { a.root.visible = false; a.shadow.visible = false; }
  if (QS.get('noShadowRecv') === '1') renderer.shadowMap.enabled = false;
  const p0 = performance.now();
  renderer.render(scene, camera);
  if (APP.profile) { const gl = renderer.getContext(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4)); }
  const p1 = performance.now();
  overlay.compose(glCanvas, t, lt, sh);
  if (APP.profile) cx.getImageData(0, 0, 1, 1);
  const p2 = performance.now();
  APP.lastProf = { gl: p1 - p0, comp: p2 - p1, calls: renderer.info.render.calls, tris: renderer.info.render.triangles };
};
APP.frame = (frame, q = 0.92) => { APP.render(frame); const p = performance.now(); const d = comp.toDataURL('image/jpeg', q); if (APP.lastProf) APP.lastProf.enc = performance.now() - p; return d; };
APP.info = () => ({ shots: APP.shots, total: APP.duration });
APP.cues = () => shots.flatMap(s => (s.sfx || []).map(([a, id, gain, pan]) => ({ t: +(typeof a === 'number' ? s.start + a : TL.time(a)).toFixed(3), id, gain: gain ?? 0, pan: pan ?? 0, shot: s.at, set: s.set })));
APP.shotTable = () => shots.map(s => ({ id: s.id, at: s.at, set: s.set, start: +s.start.toFixed(3), end: +s.end.toFixed(3) }));

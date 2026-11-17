// Core engine: timing, shots, camera, transitions, captions, sound cues, render loop.
'use strict';
const W = 1920, H = 1080, FPS = 60;
const TAU = Math.PI * 2;

// ---------- math ----------
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const inv = (a, b, v) => clamp((v - a) / (b - a));
const E = {
  lin: t => t,
  in: t => t * t * t,
  out: t => 1 - Math.pow(1 - t, 3),
  io: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  back: t => { const c1 = 2.2, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  elastic: t => (t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (TAU / 3)) + 1),
  sine: t => -(Math.cos(Math.PI * t) - 1) / 2,
};
// progress of an animation that starts at t0 and lasts d
const prog = (t, t0, d = 0.4, ease = E.out) => ease(clamp((t - t0) / d));
function hash(a, b = 0) {
  let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return ((h >>> 0) % 100000) / 100000;
}
const rnd = (a, b = 0) => hash(a * 7919 + 13, b * 104729 + 7);
const rr = (seed, lo, hi) => lo + (hi - lo) * rnd(seed, 3);
function strSeed(s) { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h) % 100000; }

// ---------- words / timing ----------
const WORDS = window.WORDS;
const normTxt = s => s.toLowerCase().replace(/['’"“”]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const TOK = [], TOKW = [], WFIRST = [];
WORDS.forEach((w, i) => { WFIRST[i] = TOK.length; for (const t of normTxt(w[0]).split(' ')) if (t) { TOK.push(t); TOKW.push(i); } });
function findPhrase(phrase, fromIdx = 0) {
  const p = normTxt(phrase).split(' ');
  const n = p.length;
  for (let i = WFIRST[Math.min(fromIdx, WORDS.length - 1)] || 0; i <= TOK.length - n; i++) {
    let ok = true;
    for (let j = 0; j < n - 1 && ok; j++) if (TOK[i + j] !== p[j]) ok = false;
    if (ok && TOK[i + n - 1].startsWith(p[n - 1])) return [TOKW[i], TOKW[i + n - 1]];
  }
  return null;
}
function wordAt(t) { // index of first word starting at/after t
  let lo = 0, hi = WORDS.length - 1;
  while (lo < hi) { const m = (lo + hi) >> 1; if (WORDS[m][1] < t - 0.001) lo = m + 1; else hi = m; }
  return lo;
}
function envAt(t) { const i = Math.round(t * FPS); const ch = window.ENV.charCodeAt(i); return isNaN(ch) ? 0 : (ch - 48) / 40; }

// ---------- sound cues ----------
const CUES = new Map();
function cue(id, time, vol = 1, opt = {}) {
  if (!(time >= 0) || !isFinite(time)) return;
  const k = id + '@' + time.toFixed(3);
  if (!CUES.has(k)) CUES.set(k, Object.assign({ id, t: +time.toFixed(4), v: vol }, opt));
}

// ---------- shots ----------
const SHOTS = [];
let _cursor = 0;
function insertStart(kind) { return window.INSERTS.find(i => i.kind === kind).start; }
// shot({at:'phrase'|number|{insert}, off, bg, cam, trans, draw, sfx, nocap})
function shot(o) {
  let start;
  if (typeof o.at === 'number') start = o.at;
  else if (o.at && o.at.insert) start = insertStart(o.at.insert) + (o.at.plus || 0);
  else if (o.at && o.at.end) { const r = findPhrase(o.at.end, _cursor); if (!r) throw new Error('phrase not found: ' + o.at.end); start = WORDS[r[1]][2]; _cursor = r[1]; }
  else {
    const r = findPhrase(o.at, _cursor);
    if (!r) throw new Error('shot phrase not found: "' + o.at + '" after word ' + _cursor + ' (' + WORDS[_cursor][0] + ')');
    start = WORDS[r[0]][1]; _cursor = r[0];
  }
  start += o.off || 0;
  const s = Object.assign({ trans: 'cut', td: 0.32 }, o, { start, _k: {}, wi: _cursor });
  SHOTS.push(s);
  return s;
}
// resolve a phrase to time within a shot (searches from the shot's first word)
function K(s, phrase, which = 0) {
  if (typeof phrase === 'number') return s.start + phrase;
  const key = phrase + '|' + which;
  if (s._k[key] !== undefined) return s._k[key];
  let from = Math.max(0, wordAt(s.start - 0.6));
  const r = findPhrase(phrase, from);
  if (!r) throw new Error('K phrase not found: "' + phrase + '" in shot at ' + s.start.toFixed(2));
  const v = which === 1 ? WORDS[r[1]][2] : WORDS[r[0]][1];
  s._k[key] = v;
  return v;
}

function finalizeShots() {
  SHOTS.sort((a, b) => a.start - b.start);
  for (let i = 0; i < SHOTS.length; i++) {
    SHOTS[i].end = i + 1 < SHOTS.length ? SHOTS[i + 1].start : window.TOTAL;
    SHOTS[i].dur = SHOTS[i].end - SHOTS[i].start;
    SHOTS[i].idx = i;
  }
}

// ---------- camera ----------
// cam: array of keyframes [when, z, x, y, ease]; when = number(local s) | 'phrase' ; or {push:0.06}
function camAt(s, t) {
  let z = 1, x = 0, y = 0;
  const cam = s.cam === undefined ? { push: 0.05 } : s.cam;
  if (cam && !Array.isArray(cam) && cam.push !== undefined) {
    const p = E.sine(clamp((t - s.start) / Math.max(1, s.dur)));
    z = 1 + (cam.z0 || 0) + cam.push * p; x = lerp(cam.x0 || 0, cam.x1 || cam.x0 || 0, p); y = lerp(cam.y0 || 0, cam.y1 || cam.y0 || 0, p);
  } else if (Array.isArray(cam)) {
    const kf = cam.map(k => [typeof k[0] === 'number' ? s.start + k[0] : K(s, k[0]), k[1], k[2] || 0, k[3] || 0, k[4] || E.io, k[5] || 0.5]);
    let cur = kf[0];
    z = cur[1]; x = cur[2]; y = cur[3];
    for (let i = 1; i < kf.length; i++) {
      const k = kf[i];
      if (t >= k[0]) {
        const p = k[4](clamp((t - k[0]) / k[5]));
        z = lerp(z, k[1], p); x = lerp(x, k[2], p); y = lerp(y, k[3], p);
      }
    }
  }
  { const zz = Math.max(1, z); const mx = (W / 2) * (1 - 1 / zz), my = (H / 2) * (1 - 1 / zz); x = clamp(x, -mx, mx); y = clamp(y, -my, my); }
  // punches (quick zoom pulses)
  for (const p of s.punch || []) {
    const t0 = typeof p === 'number' ? s.start + p : K(s, Array.isArray(p) ? p[0] : p);
    const amt = Array.isArray(p) ? p[1] : 0.07;
    const d = t - t0;
    if (d >= 0 && d < 0.5) z *= 1 + amt * Math.exp(-d * 9) * (1 - Math.exp(-d * 60));
    if (d >= -0.01 && d < 0.6) z *= 1 + amt * 0.6 * E.out(clamp(d / 0.12)) * clamp(1 - (d - 0.12) / 0.4);
  }
  let sx = 0, sy = 0;
  for (const sh of s.shake || []) {
    const t0 = typeof sh[0] === 'number' ? s.start + sh[0] : K(s, sh[0]);
    const d = t - t0, dur = sh[1] || 0.4, amp = sh[2] || 14;
    if (d >= 0 && d < dur) {
      const f = (1 - d / dur) * amp;
      const k = Math.floor(t * 30);
      sx += (rnd(k, 1) - 0.5) * 2 * f; sy += (rnd(k, 2) - 0.5) * 2 * f;
    }
  }
  return { z: Math.max(1, z), x, y, sx, sy };
}
function registerCamCues(s) {
  for (const p of s.punch || []) {
    const t0 = typeof p === 'number' ? s.start + p : K(s, Array.isArray(p) ? p[0] : p);
    cue(Array.isArray(p) && p[2] ? p[2] : 'punch', t0 - 0.02, 0.8);
  }
  for (const sh of s.shake || []) {
    const t0 = typeof sh[0] === 'number' ? s.start + sh[0] : K(s, sh[0]);
    if (sh[3] !== false) cue(sh[3] || 'rumble', t0, 0.8);
  }
  for (const x of s.sfx || []) {
    const t0 = typeof x[1] === 'number' ? s.start + x[1] : K(s, x[1], x[3] === 'end' ? 1 : 0) + (x[4] || 0);
    cue(x[0], t0, x[2] === undefined ? 1 : x[2]);
  }
  if (s.amb) cue('amb_' + s.amb, s.start, s.ambVol || 1, { dur: s.dur, bed: true });
  if (s.mus) cue('mus_' + s.mus, s.start + (s.musOff || 0), s.musVol || 1, { music: true });
  const transSfx = { whip: 'whoosh', zoom: 'zoom_whoosh', flash: 'flash_hit', smash: 'impact', spin: 'whoosh' };
  if (s.idx > 0 && transSfx[s.trans] && !s.quiet) cue(transSfx[s.trans], s.start - s.td * 0.5, 0.75);
}

// ---------- canvas ----------
const canvas = document.getElementById('c');
// supersampling: ?res=4k renders 3840x2160 natively (logical coordinates stay 1920x1080)
const SS = new URLSearchParams(location.search).get('res') === '4k' ? 2 : 1;
canvas.width = W * SS; canvas.height = H * SS;
const ctx = canvas.getContext('2d');
function mk(w = W, h = H) { const cv = document.createElement('canvas'); cv.width = w * SS; cv.height = h * SS; cv.getContext('2d').setTransform(SS, 0, 0, SS, 0, 0); return cv; }
const bufA = mk(), bufB = mk(), bufC = mk();
const BG_CACHE = {};
const BG_ORDER = [];
function bgCanvas(id) {
  if (BG_CACHE[id]) { const i = BG_ORDER.indexOf(id); if (i >= 0) BG_ORDER.splice(i, 1); BG_ORDER.push(id); }
  if (!BG_CACHE[id]) {
    // keep memory bounded (a 4K background is ~33 MB): evict least-recently-used caches
    while (BG_ORDER.length >= (SS > 1 ? 7 : 40)) { const old = BG_ORDER.shift(); const cv = BG_CACHE[old]; if (cv) { cv.width = 1; cv.height = 1; } delete BG_CACHE[old]; }
    BG_ORDER.push(id);
    const fn = window.BGS[id];
    if (!fn) throw new Error('no bg ' + id);
    const cv = mk(W, H), c = cv.getContext('2d');
    const blur = fn(c) ;
    if (blur) {
      const cv2 = mk(W, H), c2 = cv2.getContext('2d');
      c2.save(); c2.setTransform(1, 0, 0, 1, 0, 0);
      c2.filter = 'blur(' + blur * SS + 'px)';
      c2.drawImage(cv, 0, 0);
      c2.filter = 'none'; c2.restore();
      addGrainTo(c2, 0.05);
      BG_CACHE[id] = cv2;
    } else { addGrainTo(c, 0.05); BG_CACHE[id] = cv; }
  }
  return BG_CACHE[id];
}
let GRAIN = null;
function addGrainTo(c, a) {
  if (!GRAIN) {
    GRAIN = mk(256, 256);
    const g = GRAIN.getContext('2d'), im = g.createImageData(256, 256);
    for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (rnd(i, 9) - 0.5) * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
    g.putImageData(im, 0, 0);
  }
  c.save(); c.setTransform(SS, 0, 0, SS, 0, 0); c.globalAlpha = a; c.globalCompositeOperation = 'overlay';
  c.fillStyle = c.createPattern(GRAIN, 'repeat'); c.fillRect(0, 0, W, H); c.restore();
}
let VIGNETTE = null;
function vignette(c, a = 1) {
  if (!VIGNETTE) {
    VIGNETTE = mk();
    const g = VIGNETTE.getContext('2d');
    const gr = g.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 1.05);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.55)');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
  }
  c.save(); c.globalAlpha = a; c.drawImage(VIGNETTE, 0, 0, W, H); c.restore();
}

// draw one shot (with its camera) into context c at time t
function drawShot(c, s, t) {
  BOILF = Math.floor(t * 12); NOW = t;
  const cam = camAt(s, t);
  c.save();
  c.translate(W / 2 + cam.sx, H / 2 + cam.sy);
  c.scale(cam.z, cam.z);
  c.translate(-W / 2 - cam.x, -H / 2 - cam.y);
  if (s.bg) {
    const bgs = typeof s.bg === 'function' ? s.bg(t) : s.bg;
    c.drawImage(bgCanvas(bgs), 0, 0, W, H);
  }
  const st = { s, t, lt: t - s.start, dur: s.dur, k: (p, w) => K(s, p, w), cam };
  if (s.draw) s.draw(c, st);
  c.restore();
  if (s.over) s.over(c, st); // screen-space overlays
  if (s.vig !== false) vignette(c, s.vig === undefined ? 0.8 : s.vig);
}

// ---------- transitions ----------
function composite(t) {
  const i = shotIndexAt(t);
  const s = SHOTS[i];
  // in-transition of current shot
  if (i > 0 && s.trans !== 'cut' && t < s.start + s.td / 2) return trans(SHOTS[i - 1], s, t, (t - (s.start - s.td / 2)) / s.td);
  const n = SHOTS[i + 1];
  if (n && n.trans !== 'cut' && t >= n.start - n.td / 2) return trans(s, n, t, (t - (n.start - n.td / 2)) / n.td);
  drawShot(ctx, s, t);
}
function shotIndexAt(t) {
  let lo = 0, hi = SHOTS.length - 1;
  while (lo < hi) { const m = (lo + hi + 1) >> 1; if (SHOTS[m].start <= t) lo = m; else hi = m - 1; }
  return lo;
}
function trans(a, b, t, p) {
  p = clamp(p);
  const ca = bufA.getContext('2d'), cb = bufB.getContext('2d');
  const kind = b.trans;
  if (kind === 'fade') {
    drawShot(ca, a, t); drawShot(cb, b, t);
    ctx.drawImage(bufA, 0, 0, W, H); ctx.globalAlpha = E.io(p); ctx.drawImage(bufB, 0, 0, W, H); ctx.globalAlpha = 1; return;
  }
  if (kind === 'flash') {
    if (p < 0.5) drawShot(ctx, a, t); else drawShot(ctx, b, t);
    ctx.fillStyle = '#fff'; ctx.globalAlpha = Math.pow(1 - Math.abs(p - 0.5) * 2, 1.5); ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; return;
  }
  if (kind === 'whip' || kind === 'spin') {
    const e = E.io(p);
    const dir = b.dir || 1;
    drawShot(ca, a, t); drawShot(cb, b, t);
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    const off = e * W * dir;
    const blur = Math.sin(p * Math.PI);
    const taps = 6;
    for (let k = 0; k < taps; k++) {
      const o = (k / (taps - 1) - 0.5) * 160 * blur * dir;
      ctx.globalAlpha = k === 0 ? 1 : 1 / (k + 1);
      ctx.drawImage(bufA, -off + o, 0, W, H);
      ctx.drawImage(bufB, W * dir - off + o, 0, W, H);
    }
    ctx.globalAlpha = 1; return;
  }
  if (kind === 'zoom') {
    const e = E.io(p);
    const src = p < 0.5 ? a : b;
    drawShot(ca, src, t);
    const z = p < 0.5 ? 1 + e * 1.6 : 1 + (1 - e) * 0.9;
    const blur = Math.sin(p * Math.PI);
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    for (let k = 0; k < 5; k++) {
      const zz = z * (1 + k * 0.035 * blur);
      ctx.globalAlpha = k === 0 ? 1 : 0.35 / k;
      ctx.drawImage(bufA, W / 2 - W * zz / 2, H / 2 - H * zz / 2, W * zz, H * zz);
    }
    ctx.globalAlpha = 1; return;
  }
  if (kind === 'smash') { // hard cut with a tiny white frame + shake handled by shot
    drawShot(ctx, p < 0.5 ? a : b, t);
    if (p > 0.45 && p < 0.65) { ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillRect(0, 0, W, H); }
    return;
  }
  drawShot(ctx, p < 0.5 ? a : b, t);
}

// ---------- captions ----------
let CHUNKS = null;
function buildChunks() {
  CHUNKS = [];
  let cur = [];
  const flush = () => { if (cur.length) CHUNKS.push(cur); cur = []; };
  for (let i = 0; i < WORDS.length; i++) {
    const w = WORDS[i];
    if (cur.length) {
      const prev = WORDS[cur[cur.length - 1]];
      const chars = cur.reduce((a, j) => a + WORDS[j][0].length + 1, 0);
      if (w[1] - prev[2] > 0.32 || /[.?!:;]["”]?$/.test(prev[0]) || (/,$/.test(prev[0]) && cur.length >= 2) || cur.length >= 4 || chars + w[0].length > 24 || prev[3] !== w[3]) flush();
    }
    cur.push(i);
  }
  flush();
  CHUNKS = CHUNKS.map((ix, k) => ({ ix, start: WORDS[ix[0]][1] - 0.04, end: WORDS[ix[ix.length - 1]][2] + 0.35 }));
  for (let k = 0; k < CHUNKS.length - 1; k++) CHUNKS[k].end = Math.min(CHUNKS[k].end, CHUNKS[k + 1].start);
}
const VOICE_TAGS = { 'high pitch': '#8fe3ff', 'low pitch': '#ffb070', 'singing': '#b8ff8a' };
function drawCaptions(c, t) {
  if (!CHUNKS) buildChunks();
  const s = SHOTS[shotIndexAt(t)];
  if (s.nocap) return;
  let lo = 0, hi = CHUNKS.length - 1, k = -1;
  while (lo <= hi) { const m = (lo + hi) >> 1; if (CHUNKS[m].start <= t) { k = m; lo = m + 1; } else hi = m - 1; }
  if (k < 0) return;
  const ch = CHUNKS[k];
  if (t > ch.end) return;
  const fs = 66;
  c.save();
  c.font = `${fs}px "Lilita One"`;
  c.textBaseline = 'alphabetic';
  const texts = ch.ix.map(i => WORDS[i][0].replace(/^["“]|["”]$/g, '').toUpperCase());
  const space = fs * 0.28;
  const widths = texts.map(s => c.measureText(s).width);
  const total = widths.reduce((a, b) => a + b, 0) + space * (texts.length - 1);
  let x = W / 2 - total / 2;
  const y = H - 92;
  const appear = prog(t, ch.start, 0.12, E.back);
  const yy = y + (1 - appear) * 18;
  c.lineJoin = 'round';
  for (let j = 0; j < texts.length; j++) {
    const wi = ch.ix[j];
    const w = WORDS[wi];
    const active = t >= w[1] - 0.03 && t < (j + 1 < ch.ix.length ? WORDS[ch.ix[j + 1]][1] : ch.end);
    const said = t >= w[1] - 0.03;
    const voice = VOICE_TAGS[w[4]];
    const sc = active ? 1 + 0.1 * (1 - prog(t, w[1], 0.18)) : 1;
    c.save();
    c.translate(x + widths[j] / 2, yy);
    c.scale(sc, sc);
    c.lineWidth = 15; c.strokeStyle = '#000';
    c.shadowColor = 'rgba(0,0,0,0.55)'; c.shadowOffsetY = 6; c.shadowBlur = 0;
    c.strokeText(texts[j], -widths[j] / 2, 0);
    c.shadowColor = 'transparent';
    c.fillStyle = active ? (voice || '#ffd83d') : said ? '#ffffff' : '#ffffff';
    c.globalAlpha = appear;
    c.fillText(texts[j], -widths[j] / 2, 0);
    c.restore();
    x += widths[j] + space;
  }
  c.restore();
}

// ---------- frame ----------
let fontsReady = false;
function renderAt(t) {
  ctx.setTransform(SS, 0, 0, SS, 0, 0);
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  composite(t);
  drawCaptions(ctx, t);
  if (window.FADE_OUT !== false) {
    const fo = clamp((t - (window.TOTAL - 1.2)) / 1.2);
    if (fo > 0) { ctx.fillStyle = `rgba(0,0,0,${fo})`; ctx.fillRect(0, 0, W, H); }
    const fi = 1 - clamp(t / 0.35);
    if (fi > 0) { ctx.fillStyle = `rgba(0,0,0,${fi})`; ctx.fillRect(0, 0, W, H); }
  }
}

function collectCues() {
  CUES.clear();
  const cv = mk(), c = cv.getContext('2d');
  for (const s of SHOTS) {
    registerCamCues(s);
    const n = Math.max(3, Math.ceil(s.dur / 0.25));
    for (let i = 0; i <= n; i++) {
      const t = s.start + (s.dur * i) / n;
      c.setTransform(SS, 0, 0, SS, 0, 0);
      drawShot(c, s, Math.min(t, s.end - 0.001));
    }
  }
  return [...CUES.values()].sort((a, b) => a.t - b.t);
}

async function boot() {
  await document.fonts.load('60px "Lilita One"');
  await document.fonts.load('60px "Anton"');
  await preloadBG3D();
  await document.fonts.load('60px "Patrick Hand"');
  await document.fonts.load('700 60px "Cinzel"');
  finalizeShots();
  fontsReady = true;
  window.READY = true;
  const q = new URLSearchParams(location.search);
  if (q.has('t')) { renderAt(parseFloat(q.get('t'))); return; }
  if (q.has('render')) return;
  // preview player
  const audio = new Audio(q.get('audio') || 'build/mix.wav');
  const ui = document.getElementById('ui');
  ui.style.display = 'block';
  const seek = document.getElementById('seek');
  seek.max = window.TOTAL;
  let playing = false, t0 = 0, wall = 0;
  const now = () => (playing ? (audio.readyState > 2 && !audio.error ? audio.currentTime : t0 + (performance.now() - wall) / 1000) : t0);
  document.getElementById('play').onclick = () => {
    playing = !playing;
    if (playing) { wall = performance.now(); audio.currentTime = t0; audio.play().catch(() => {}); }
    else { t0 = now(); audio.pause(); }
  };
  seek.oninput = () => { t0 = +seek.value; audio.currentTime = t0; wall = performance.now(); };
  const loop = () => { const t = now(); if (playing) seek.value = t; renderAt(t); document.getElementById('tc').textContent = t.toFixed(2); requestAnimationFrame(loop); };
  loop();
}
window.renderAt = renderAt;
window.collectCues = collectCues;
window.shotList = () => SHOTS.map(s => ({ start: s.start, end: s.end, bg: typeof s.bg === 'string' ? s.bg : '', name: s.name || '' }));

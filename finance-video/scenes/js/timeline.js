// Shot DSL + resolver + frame renderer.
// Shots and elements are anchored to phrases in the voice-over transcript, so every cut
// and pop-in lands on the spoken word.
'use strict';

const SHOTS = [];
const ERRORS = [];
function shot(anchor, a, b) {
  const opts = Array.isArray(a) ? {} : (a || {});
  const els = Array.isArray(a) ? a : (b || []);
  SHOTS.push({ anchor, opts, els: els.flat(4).filter(Boolean) });
}
// element constructors
const M = (o = {}) => Object.assign({ kind: 'mascot', in: 'none' }, o);
const K = (cast, o = {}) => Object.assign({ kind: 'stick', cast, in: 'none' }, o);
const P = (name, o = {}) => Object.assign({ kind: 'prop', name, in: 'pop' }, o);
const T = (text, o = {}) => Object.assign({ kind: 'text', text, in: 'pop' }, o);
const C = (type, o = {}) => Object.assign({ kind: 'card', type, in: type === 'arrow' || type === 'circle' || type === 'underline' || type === 'marker' || type === 'timeline' ? 'none' : 'pop' }, o);

// ---------- words ----------
const NW = WORDS.words.map(w => normTok(w[0]));
function normTok(s) { return String(s).toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9$%.']/g, '').replace(/^\.+|\.+$/g, '').replace(/'/g, ''); }
function findPhrase(phrase, from, to = NW.length) {
  const toks = phrase.split(/\s+/).map(normTok).filter(Boolean);
  if (!toks.length) return -1;
  for (let i = Math.max(0, from); i + toks.length <= Math.min(NW.length, to + toks.length); i++) {
    let ok = true;
    for (let k = 0; k < toks.length; k++) if (NW[i + k] !== toks[k]) { ok = false; break; }
    if (ok) return i;
  }
  return -1;
}
const LEAD = 0.1;

function resolveAll() {
  let cursor = 0;
  const R = [];
  SHOTS.forEach((s, si) => {
    let idx = findPhrase(s.anchor, cursor, cursor + 400);
    if (idx < 0) { ERRORS.push(`shot ${si} anchor not found: "${s.anchor}" after word ${cursor} (${NW.slice(cursor, cursor + 8).join(' ')})`); idx = cursor; }
    s.wi = idx; cursor = idx + 1;
    R.push(s);
  });
  R.forEach((s, i) => {
    s.t0 = i === 0 ? 0 : WORDS.words[s.wi][1] - LEAD;
    s.wEnd = i + 1 < R.length ? R[i + 1].wi : NW.length;
  });
  R.forEach((s, i) => { s.t1 = i + 1 < R.length ? R[i + 1].t0 : WORDS.duration + 0.5; });
  for (const s of R) {
    const at = (v, def) => resolveAt(v, s, def);
    for (const e of s.els) resolveEl(e, s, at);
  }
  return R;
}

function resolveAt(v, s, def) {
  if (v == null) return def == null ? s.t0 : def;
  if (typeof v === 'number') return s.t0 + v;
  let str = String(v), off = 0;
  const m = str.match(/^(.*?)([+-]\d+(\.\d+)?)$/);
  if (m) { str = m[1].trim(); off = parseFloat(m[2]); }
  if (!str) return s.t0 + off;
  let idx = findPhrase(str, s.wi, s.wEnd + 3);
  if (idx < 0) { idx = findPhrase(str, s.wi, s.wi + 300); if (idx >= 0) ERRORS.push(`note: "${str}" found past shot end (shot "${s.anchor}")`); }
  if (idx < 0) { ERRORS.push(`anchor not found in shot "${s.anchor}": "${str}"`); return s.t0 + off; }
  return Math.max(s.t0, WORDS.words[idx][1] - 0.05) + off;
}

function parseSeq(v, s, at) {
  if (v == null) return null;
  const arr = Array.isArray(v) ? v : [v];
  return arr.map((item, i) => {
    if (typeof item === 'object') return Object.assign({}, item, { t: i === 0 && item.at == null ? -1e9 : at(item.at) });
    let str = String(item), anchor = null, to = null;
    const ai = str.indexOf('@');
    if (ai >= 0) { anchor = str.slice(ai + 1); str = str.slice(0, ai); }
    const ti = str.indexOf('>');
    if (ti >= 0) { to = str.slice(ti + 1).split(',').map(Number); str = str.slice(0, ti); }
    return { name: str.trim(), to, t: i === 0 && anchor == null ? -1e9 : at(anchor == null ? null : (/^[+-]?\d+(\.\d+)?$/.test(anchor) ? parseFloat(anchor) : anchor)) };
  });
}

function resolveEl(e, s, at) {
  e.t0 = at(e.at);
  e.t1 = e.out != null ? at(e.out) : s.t1 + 1;
  if (e.kind === 'mascot' || e.kind === 'stick') {
    e.poseSeq = parseSeq(e.pose || 'rest', s, at);
    e.faceSeq = parseSeq(e.face || 'neutral', s, at);
    if (Array.isArray(e.talk)) e.talkR = e.talk.map(([a, b]) => [at(a), at(b)]);
  }
  if (e.move) e.moves = e.move.map(m => ({ x: m[0], y: m[1], t: at(m[2]), dur: m[3] || 0.7 }));
  // nested anchors (highlights, bars, marks ...)
  for (const key of ['hl', 'bars', 'rows', 'marks', 'spans', 'segments']) {
    if (Array.isArray(e[key])) e[key].forEach(it => { it.t = at(it.at, e.t0); });
  }
  if (e.kind === 'card') { e.drawT = e.drawAt != null ? at(e.drawAt) : e.t0; e.writeT = e.drawT; }
  if (e.hold) e.hold.t0 = at(e.hold.at, e.t0);
  if (e.tip) e.tipT = at(e.tipAt, e.t0 + 0.3);
  if (e.kids) e.kids.forEach(k => resolveEl(k, s, at));
}

// ---------- per-frame element evaluation ----------
function seqAt(seq, t) {
  let i = 0;
  for (let k = 0; k < seq.length; k++) if (t >= seq[k].t) i = k;
  return { cur: seq[i], prev: seq[Math.max(0, i - 1)], k: i === 0 ? 1 : U.clamp((t - seq[i].t) / 0.22) };
}

function envAt(t) { const i = Math.floor(t * 60); return i >= 0 && i < ENV.length ? ENV[i] / 255 : 0; }

function posAt(e, t) {
  let x = e.x || 0, y = e.y || 0, moving = false, dir = 0;
  if (e.moves) for (const m of e.moves) {
    if (t < m.t) break;
    const k = U.clamp((t - m.t) / m.dur);
    const nx = U.lerp(x, m.x, U.easeInOut(k)), ny = U.lerp(y, m.y, U.easeInOut(k));
    if (k < 1) { moving = true; dir = Math.sign(m.x - x); }
    x = nx; y = ny;
  }
  return { x, y, moving, dir };
}

function enterFx(e, t) {
  const k = U.clamp((t - e.t0) / (e.inDur || (e.in === 'pop' ? 0.32 : 0.4)));
  const fx = { dx: 0, dy: 0, s: 1, a: 1, r: 0 };
  const kind = e.in || 'none';
  if (kind === 'pop') fx.s = U.easeOutBack(k, 2.2);
  else if (kind === 'fade') fx.a = k;
  else if (kind === 'slideL') fx.dx = (1 - U.easeOutCubic(k)) * -1100;
  else if (kind === 'slideR') fx.dx = (1 - U.easeOutCubic(k)) * 1100;
  else if (kind === 'slideU') fx.dy = (1 - U.easeOutCubic(k)) * -900;
  else if (kind === 'rise' || kind === 'slideD') fx.dy = (1 - U.easeOutCubic(k)) * 900;
  else if (kind === 'drop') { fx.dy = -(1 - U.easeOutBack(k, 1.6)) * 700; }
  else if (kind === 'spin') { fx.s = U.easeOutBack(k); fx.r = (1 - k) * -3; }
  else if (kind === 'grow') fx.s = U.easeOutCubic(k);
  // exit
  if (e.outAnim && t > e.t1 - 0.25) {
    const q = U.clamp((e.t1 - t) / 0.25);
    if (e.outAnim === 'pop') fx.s *= U.easeInCubic(q) * 0.999 + 0.001;
    if (e.outAnim === 'fade') fx.a *= q;
    if (e.outAnim === 'slideR') fx.dx += (1 - q) * 1100;
    if (e.outAnim === 'slideL') fx.dx -= (1 - q) * 1100;
    if (e.outAnim === 'drop') fx.dy += (1 - q) * 900;
  }
  return fx;
}

function idleFx(e, t, fx) {
  const ph = (e._ph == null ? (e._ph = (U.hash(JSON.stringify([e.name || e.text || e.cast || e.kind, e.x, e.y])) % 1000) / 159) : e._ph);
  switch (e.idle) {
    case 'bob': fx.dy += Math.sin(t * 2.4 + ph) * 7; break;
    case 'float': fx.dy += Math.sin(t * 1.4 + ph) * 14; fx.r += Math.sin(t * 1.1 + ph) * 0.03; break;
    case 'wiggle': fx.r += Math.sin(t * 6 + ph) * 0.06; break;
    case 'pulse': fx.s *= 1 + Math.sin(t * 6 + ph) * 0.045; break;
    case 'shake': fx.dx += Math.sin(t * 47 + ph) * 4; fx.dy += Math.cos(t * 53 + ph) * 3; break;
    case 'spin': fx.r += t * 2; break;
    case 'sway': fx.r += Math.sin(t * 2 + ph) * 0.08; break;
    case 'beat': { const k = (t * 1.6 + ph) % 1; fx.s *= 1 + Math.max(0, 0.08 - k * 0.3); break; }
  }
}

function drawCharacter(ctx, e, t, fx) {
  const isM = e.kind === 'mascot';
  const cast = isM ? null : (CAST[e.cast] || CAST.joe);
  const g = isM ? MASCOT.geo() : STICK_GEO;
  const pos = posAt(e, t);
  const st = {
    x: pos.x + fx.dx, y: pos.y + fx.dy, s: (e.s || (isM ? 0.85 : 1)) * fx.s,
    rot: (e.rot || 0) + fx.r, flip: e.flip, alpha: fx.a,
  };
  const walking = (e.walk && pos.moving) || e.walking;
  if (walking) { st.walk = 1; st.walkPhase = t * 9; }
  st.sit = e.sit;
  // face
  const fs = seqAt(e.faceSeq, t);
  st.expr = fs.cur.name;
  const ex = EXPR[st.expr] || EXPR.neutral;
  // look
  let look = e.look === 'cam' || !e.look ? (ex.look || [0, 0]) : null;
  if (!look) {
    const head = toScreen(st, g.head.x, g.head.y);
    const dx = e.look[0] - head.x, dy = e.look[1] - head.y, L = Math.hypot(dx, dy) || 1;
    look = [dx / L * (st.flip ? -1 : 1), dy / L * 0.8];
  }
  st.look = look;
  // talking
  let talk = 0;
  const talking = e.talkR ? e.talkR.some(([a, b]) => t >= a && t <= b) : (e.talk == null ? isM : !!e.talk);
  if (talking) talk = envAt(t);
  st.talk = talk;
  const seed = isM ? 3 : (cast.seed || 1);
  st.blink = ((t + seed * 0.77) % (3.1 + (seed % 5) * 0.3)) < 0.11;
  st.bob = walking ? -Math.abs(Math.sin(t * 9)) * 8 : Math.sin(t * 2.1 + seed) * 2.2 - talk * 2;
  st.tilt = (e.tilt || 0) + (talking ? Math.sin(t * 2.7 + seed) * 0.03 : Math.sin(t * 0.9 + seed) * 0.015);
  if (fs.cur.name === 'confused' || fs.cur.name === 'thinking') st.tilt += 0.08;
  if (fs.cur.name === 'sad' || fs.cur.name === 'crying') st.tilt += 0.05;
  if (e.squash) st.squash = e.squash;
  // pose
  const ps = seqAt(e.poseSeq, t);
  let out;
  if (isM) out = drawMascotPuppet(ctx, e, t, fx, st, ps, fs.cur, talk, walking);
  else {
  const hands = {};
  for (const side of ['L', 'R']) {
    const mk = (entry) => {
      const name = entry.name;
      let tgt = null;
      if (name === 'point' || name === 'pointer') {
        const to = entry.to || e.point || [st.x + (side === 'R' ? 400 : -400), st.y - 400];
        tgt = toLocal(st, to[0], to[1]);
        // point with the arm on the side of the target unless forced
        const useSide = e.pointSide || (tgt.x >= 0 ? 'R' : 'L');
        if (side !== useSide) return POSES[e.otherPose || 'rest'](g, side);
      }
      return posedHand(g, side, name, tgt);
    };
    let h = lerpHand(mk(ps.prev), mk(ps.cur), U.easeOutCubic(ps.k));
    if (h.wave) h = Object.assign({}, h, { x: h.x + Math.sin(t * 11) * g.arm * 0.16 });
    if (talking && (ps.cur.name === 'explain' || ps.cur.name === 'shrug' || ps.cur.name === 'present' || ps.cur.name === 'presentL')) h = Object.assign({}, h, { y: h.y + Math.sin(t * 5 + (side === 'L' ? 1 : 0)) * 10 * talk });
    if (walking && ps.cur.name === 'rest') h = Object.assign({}, h, { x: h.x + Math.sin(t * 9 + (side === 'L' ? 0 : Math.PI)) * 40 });
    hands[side] = h;
  }
  st.hands = hands;
  out = drawStick(ctx, cast, st, t);
  }
  // held prop
  if (e.hold && t >= e.hold.t0) {
    const side = e.hold.side || 'R';
    const H = out[side].H, Ein = out[side].E;
    const p = toScreen(st, H.x, H.y);
    ctx.save(); ctx.translate(p.x + (e.hold.dx || 0) * st.s, p.y + (e.hold.dy || 0) * st.s);
    ctx.rotate(e.hold.rot || 0);
    const hs = (e.hold.s || 0.5) * st.s * U.easeOutBack(U.clamp((t - e.hold.t0) / 0.3), 2);
    ctx.scale(hs, hs);
    if (e.hold.text) drawTextEl(ctx, e.hold, t);
    else drawProp(ctx, e.hold.prop, e.hold.a, t);
    ctx.restore();
  }
}

function drawTextEl(ctx, e, t) {
  const size = e.size || 80;
  const font = `${e.weight || 700} ${size}px ${e.font || 'Kalam'}`;
  ctx.font = font; ctx.textAlign = e.align || 'center'; ctx.textBaseline = 'middle';
  let text = e.text;
  if (e.count) {
    const k = U.easeOutCubic(U.clamp((t - e.t0) / (e.countDur || 1.0)));
    const v = U.lerp(e.count[0], e.count[1], k);
    text = (e.prefix || '') + v.toFixed(e.dec || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (e.suffix || '');
  }
  if (e.type) { const n = Math.floor(text.length * U.clamp((t - e.t0) / (e.typeDur || text.length * 0.045))); text = text.slice(0, n); }
  const lines = String(text).split('\n'), LH = size * 1.1;
  lines.forEach((l, i) => {
    const y = (i - (lines.length - 1) / 2) * LH;
    if (e.stroke !== false) { ctx.lineWidth = e.lw || Math.max(6, size * 0.12); ctx.strokeStyle = e.stroke || '#fff'; ctx.lineJoin = 'round'; ctx.strokeText(l, 0, y); }
    ctx.fillStyle = e.color || COL.ink; ctx.fillText(l, 0, y);
  });
}

const SELF_SCALED = { flow: 1, gridOf: 1, people: 1 };
function drawEl(ctx, e, t) {
  if (t < e.t0 || t >= e.t1) return;
  const fx = enterFx(e, t);
  idleFx(e, t, fx);
  if (e.kind === 'mascot' || e.kind === 'stick') { ctx.save(); drawCharacter(ctx, e, t, fx); ctx.restore(); return; }
  const pos = posAt(e, t);
  ctx.save();
  ctx.globalAlpha *= fx.a * (e.alpha == null ? 1 : e.alpha);
  ctx.translate(pos.x + fx.dx, pos.y + fx.dy);
  if (e.tip) {
    const tp = e._tipT == null ? (e._tipT = 0) : e._tipT;
    const k = U.easeInCubic(U.clamp((t - e.tipT) / (e.tipDur || 0.45)));
    if (k > 0) { const py = e.pivot || 0; ctx.translate(0, py * (e.s || 1)); ctx.rotate(e.tip * k); ctx.translate(0, -py * (e.s || 1)); }
  }
  if (e.rot || fx.r) ctx.rotate((e.rot || 0) + fx.r);
  const s = (e.kind === 'card' && SELF_SCALED[e.type] ? 1 : (e.s || 1)) * fx.s;
  ctx.scale(s * (e.flip ? -1 : 1), s);
  if (e.kind === 'prop') drawProp(ctx, e.name, e.a, t);
  else if (e.kind === 'text') drawTextEl(ctx, e, t);
  else if (e.kind === 'card') {
    const f = CARDS[e.type];
    if (f) f(ctx, e, t, t);
  }
  if (e.kids) for (const k of e.kids) drawEl(ctx, k, t);
  ctx.restore();
}

// ---------- captions ----------
let CAP_PAGES = null;
function buildCaptions() {
  const ws = WORDS.words.map((w, i) => ({ w: w[0], t0: w[1], t1: w[2], cap: w[3], i })).filter(w => w.cap);
  const pages = []; let cur = [];
  const flush = () => { if (cur.length) pages.push(cur); cur = []; };
  for (let i = 0; i < ws.length; i++) {
    const w = ws[i], prev = cur[cur.length - 1];
    if (prev) {
      const chars = cur.reduce((s, x) => s + x.w.length + 1, 0) + w.w.length;
      const endP = /[.?!]$/.test(prev.w), comma = /[,;:]$/.test(prev.w);
      if (cur.length >= 6 || chars > 32 || endP || (comma && cur.length >= 3) || w.t0 - prev.t1 > 0.5) flush();
    }
    cur.push(w);
  }
  flush();
  return pages.map((p, k) => {
    const next = pages[k + 1];
    return { words: p, t0: p[0].t0 - 0.05, t1: next ? Math.min(next[0].t0 - 0.05, p[p.length - 1].t1 + 0.7) : p[p.length - 1].t1 + 1.2 };
  });
}
function capText(w) { return w.replace(/[.,;:]+$/, '').replace(/^["“]|["”]$/g, ''); }
function drawCaptions(ctx, t) {
  if (!CAP_PAGES) CAP_PAGES = buildCaptions();
  let lo = 0, hi = CAP_PAGES.length - 1, pg = null;
  while (lo <= hi) { const m = (lo + hi) >> 1; if (CAP_PAGES[m].t0 <= t) { pg = CAP_PAGES[m]; lo = m + 1; } else hi = m - 1; }
  if (!pg || t > pg.t1) return;
  const size = 58;
  ctx.font = `700 ${size}px Kalam`; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  const items = pg.words.map(w => ({ w, s: capText(w.w), width: 0 }));
  const space = ctx.measureText(' ').width;
  items.forEach(it => { it.width = ctx.measureText(it.s).width; });
  const total = items.reduce((s, it) => s + it.width, 0) + space * (items.length - 1);
  let x = 960 - total / 2;
  const y = 1012;
  const pop = U.easeOutBack(U.clamp((t - pg.t0) / 0.18), 2);
  ctx.save();
  ctx.translate(960, y); ctx.scale(0.9 + 0.1 * pop, 0.9 + 0.1 * pop); ctx.translate(-960, -y);
  items.forEach((it, i) => {
    const nxt = items[i + 1];
    const active = t >= it.w.t0 - 0.03 && (nxt ? t < nxt.w.t0 - 0.03 : t < it.w.t1 + 0.3);
    if (active) {
      ctx.fillStyle = COL.yellow;
      ctx.save(); ctx.translate(x + it.width / 2, y + 2); ctx.rotate(-0.025);
      ctx.beginPath(); ctx.roundRect(-it.width / 2 - 10, -size * 0.5, it.width + 20, size * 0.98, 10); ctx.fill();
      ctx.restore();
    }
    ctx.lineWidth = 11; ctx.strokeStyle = '#fff'; ctx.lineJoin = 'round';
    if (!active) ctx.strokeText(it.s, x, y);
    ctx.fillStyle = COL.ink; ctx.fillText(it.s, x, y);
    x += it.width + space;
  });
  ctx.restore();
}

// ---------- frame ----------
let RESOLVED = null;
function shotAt(t) {
  let lo = 0, hi = RESOLVED.length - 1, r = 0;
  while (lo <= hi) { const m = (lo + hi) >> 1; if (RESOLVED[m].t0 <= t) { r = m; lo = m + 1; } else hi = m - 1; }
  return RESOLVED[r];
}
function renderFrame(ctx, t, opts = {}) {
  if (!RESOLVED) RESOLVED = resolveAll();
  const s = shotAt(t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.fillStyle = s.opts.bg || '#ffffff';
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  // camera
  const o = s.opts;
  let z = 1, cx = 960, cy = 470;
  if (o.zoom) { const k = U.easeInOut(U.clamp((t - s.t0) / Math.max(0.5, s.t1 - s.t0))); z = U.lerp(o.zoom[0], o.zoom[1], k); }
  if (o.punch) { const tp = resolveAt(o.punch[0], s); if (t >= tp) z *= U.lerp(1, o.punch[1], U.easeOutCubic(U.clamp((t - tp) / 0.18))); }
  if (o.focus) { cx = o.focus[0]; cy = o.focus[1]; }
  if (o.shake) { const k = Math.max(0, 1 - (t - resolveAt(o.shake, s)) / 0.5); if (k > 0 && k < 1) ctx.translate(Math.sin(t * 90) * 10 * k, Math.cos(t * 77) * 8 * k); }
  if (z !== 1) { ctx.translate(cx, cy); ctx.scale(z, z); ctx.translate(-cx, -cy); }
  if (o.pre) o.pre(ctx, t, s);
  for (const e of s.els) drawEl(ctx, e, t);
  ctx.restore();
  if (opts.captions !== false) drawCaptions(ctx, t);
}

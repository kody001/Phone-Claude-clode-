// The whole film, shot by shot, anchored to word timings of the voiceover.
// Pure data + functions of time. Also emits SFX cues and music moods for the audio mix.
import { clamp, lerp, range, ease, keys, pulse, noise1, rand } from './util.js';

// who says each quoted line, per paragraph (in order of quotes)
const SPEAKERS = {
  26: ['alex'], 29: ['maint'], 30: ['alex', 'alex'], 32: ['maint'], 34: ['maint'], 43: ['you'], 44: ['alex'], 59: ['alex'], 61: ['alex', 'alex'],
  75: ['alex'], 76: ['you'], 82: ['alex', 'alex'], 84: ['you', 'you'], 85: ['alex'], 88: ['you'], 89: ['alex'], 91: ['alex'], 92: ['you'], 93: ['alex'],
  96: ['you'], 97: ['alex'], 104: ['you'], 105: ['alex', 'alex'], 111: ['you'], 115: ['you'], 116: ['alex'], 117: ['you'], 119: ['you'], 121: ['alex', 'alex'],
  124: ['you'], 125: ['alex'], 126: ['you'], 127: ['alex', 'alex'], 131: 'alex', 142: ['alex'], 143: ['you'], 145: ['maint'], 148: ['alex'], 151: ['you'],
  153: ['alex'], 156: ['you'], 157: ['alex'], 162: ['alex'], 164: ['alex'], 165: ['you'], 166: ['alex'], 168: ['alex', 'alex'], 170: ['you', 'you'],
  171: ['alex'], 175: ['maint'], 185: ['you'], 192: ['alex'], 193: ['you'], 194: ['alex'], 197: ['friend', 'friend'], 199: ['both'], 203: ['alex'], 204: ['you'], 211: ['you'],
};
const clean = s => s.toLowerCase().replace(/[^a-z0-9']/g, '');
const isEmph = s => { const l = s.replace(/[^A-Za-z]/g, ''); return l.length >= 2 && l === l.toUpperCase() && !['OMG'].includes(l); };
const disp = s => s.replace(/["“”]/g, '').replace(/\.\.\./g, '…');

export function buildTimeline({ words, sets, cast, THREE }) {
  const DUR = 1006.5;
  const shots = [], overlays = [], sfx = [], music = [], speech = [], captions = [], bubbles = [];
  // ---------------------------------------------------------- time anchors
  const PS = i => words[i].s, PE = i => words[i].e;
  const tok = (i, w, n = 0) => {
    const q = clean(w); let k = 0; for (const t of words[i].w) if (clean(t.t) === q) { if (k === n) return t; k++; }
    k = 0; for (const t of words[i].w) if (clean(t.t).replace(/'s$/, '') === q || (q.length >= 4 && clean(t.t).startsWith(q))) { if (k === n) return t; k++; }
    (globalThis.__anchorErrors ||= []).push(`P${i}:${w}#${n}`); return words[i].w[0];
  };
  const T = (i, w, n = 0) => tok(i, w, n).s, EW = (i, w, n = 0) => tok(i, w, n).e;

  // ---------------------------------------------------------- dialogue vs narration
  words.forEach((p, i) => {
    const spk = SPEAKERS[i]; let q = -1, inQ = false; const segs = []; let cur = null;
    p.w.forEach((w, k) => {
      const opens = /^["“]/.test(w.t), closes = /["”][,.!?]*$/.test(w.t) && !(opens && w.t.length === 1);
      let dlg = false;
      if (spk === 'alex') dlg = true;
      else if (spk) { if (opens && !inQ) { inQ = true; q++; } dlg = inQ; if (closes) inQ = false; if (opens && closes) inQ = false; }
      const who = spk === 'alex' ? 'alex' : dlg ? spk[q] : null;
      const key = who ? `d${q}` : 'n';
      if (!cur || cur.key !== key || (who && cur.who !== who)) { cur = { key, who, w: [] }; segs.push(cur); }
      cur.w.push({ t: disp(w.t), s: w.s, e: w.e, emph: isEmph(w.t) });
    });
    for (const sg of segs) {
      if (sg.who) {
        speech.push({ who: sg.who, s: sg.w[0].s, e: sg.w[sg.w.length - 1].e });
        let ch = [];
        sg.w.forEach((w, k) => { ch.push(w); const last = k === sg.w.length - 1; if (last || (/[.?!…]$/.test(w.t) && ch.length >= 7 && sg.w.length - k > 3) || (ch.length >= 16 && /,$/.test(w.t))) { bubbles.push({ who: sg.who, words: ch, p: i }); ch = []; } });
      }
      else {
        // narration -> caption chunks
        let ch = [];
        const flush = () => { if (ch.length) captions.push({ words: ch, t0: ch[0].s - 0.1, t1: ch[ch.length - 1].e + 0.35 }); ch = []; };
        sg.w.forEach((w, k) => {
          const prev = ch[ch.length - 1];
          const len = ch.reduce((a, x) => a + x.t.length + 1, 0);
          if (prev && (/[.!?…]$/.test(prev.t) || w.s - prev.e > 0.32 || ch.length >= 6 || len + w.t.length > 34 || (/,$/.test(prev.t) && ch.length >= 3))) flush();
          ch.push(w);
        });
        flush();
      }
    }
  });
  captions.sort((a, b) => a.t0 - b.t0);
  for (let i = 0; i < captions.length - 1; i++) captions[i].t1 = Math.min(captions[i].t1, captions[i + 1].t0 - 0.02);
  bubbles.forEach((b, i) => {
    const nb = bubbles[i + 1];
    overlays.push({ type: 'bubble', who: b.who, words: b.words, t0: b.words[0].s - 0.18, t1: Math.min(b.words[b.words.length - 1].e + 0.7, nb ? nb.words[0].s - 0.12 : 1e9), style: b.who === 'maint' ? 'radio' : null, size: b.who === 'you' && b.p === 151 ? 30 : 36 });
  });
  const bubbleAt = t => { for (const b of bubbles) if (t >= b.words[0].s - 0.12 && t <= b.words[b.words.length - 1].e + 0.12) return true; return false; };

  // ---------------------------------------------------------- authoring helpers
  const cut = (t, set, castList, fn, o = {}) => shots.push({ t0: t, set, cast: castList, fn, ...o });
  const fx = (t, id, gain = 1, o = {}) => sfx.push({ t: +t.toFixed(3), id, gain, ...o });
  const mood = (t, name, gain = 1) => music.push({ t, mood: name, gain });
  const ov = (o) => overlays.push(o);
  const pill = (t0, t1, text, x, y, o = {}) => ov({ type: 'pill', t0, t1, text, x, y, ...o });
  const pop = (t0, t1, text, o = {}) => { ov({ type: 'pop', t0, t1, text, x: 0.5, y: 0.42, ...o }); if (o.sfx !== false) fx(t0, o.snd || 'pop', o.gain || 0.7); };
  const card = (t0, t1, text) => ov({ type: 'time', t0, t1, text });
  const sym = (t0, t1, who, s, o = {}) => ov({ type: 'symbol', t0, t1, whoA: who, sym: s, ...o });
  const think = (t0, t1, who, text, o = {}) => ov({ type: 'thought', t0, t1, whoA: who, text, ...o });
  const flash = (t, o = {}) => ov({ type: 'flash', t0: t, ...o });
  const wash = (t0, t1, color, amt = 0.2, o = {}) => ov({ type: 'wash', t0, t1, color, amt, ...o });
  const list = (t0, t1, items, x = 0.04, y = 0.1, o = {}) => { ov({ type: 'list', t0, t1, items, x, y, ...o }); items.forEach(it => fx(it.t ?? t0, 'tick', 0.45)); };
  const step = (t, ks) => { let v = ks[0][1]; for (const [kt, kv] of ks) if (t >= kt) v = kv; return v; };
  const tp = (t, t0, a, b, d = 0.45) => ({ a, b, u: ease.inOut(range(t, t0, t0 + d)) });
  const P3 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
  const look = (c, p, l, fov = 40) => { c.position.set(p[0], p[1], p[2]); c.lookAt(l[0], l[1], l[2]); c.fov = fov; };
  const dolly = (ctx, a, b, e = ease.inOut, u = ctx.u) => { const k = e(u); look(ctx.cam, P3(a[0], b[0], k), P3(a[1], b[1], k), lerp(a[2] ?? 40, b[2] ?? 40, k)); };
  const drift = (ctx, p, l, fov = 40, amt = 0.06) => { const t = ctx.t; look(ctx.cam, [p[0] + noise1(t * 0.3, 11) * amt, p[1] + noise1(t * 0.25, 12) * amt * 0.5, p[2] + noise1(t * 0.2, 13) * amt], l, fov); };
  const act = (ctx, n, st) => { const c = cast[n]; c.apply({ mouth: ctx.mouth(n), ...st }, ctx.t); };
  const hp = (ctx, n, up = 0) => { const p = ctx.headPos(n, up); return [p.x, p.y, p.z]; };
  // close-up: camera in front of a character's head (dir = yaw offset)
  const cu = (ctx, n, o = {}) => {
    const c = cast[n]; c.root.updateMatrixWorld(true); const h = hp(ctx, n, o.up ?? -0.05);
    let yaw = (c.root.rotation.y || 0) + (o.yaw || 0);
    if (o.free !== true) { const facing = Math.abs(((c.root.rotation.y % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI); if (facing > Math.PI / 2) yaw = Math.PI + clamp(yaw - Math.PI, -0.6, 0.6); else { const x = c.root.position.x; yaw = x > 0.15 ? clamp(yaw, -0.15, 0.5) : x < -0.15 ? clamp(yaw, -0.5, 0.15) : clamp(yaw, -0.6, 0.6); } }
    const d = (o.dist ?? 1.55) * 1.75;
    const p = [h[0] + Math.sin(yaw) * d + (o.dx || 0), h[1] + (o.dy ?? 0.08), h[2] + Math.cos(yaw) * d];
    const push = o.push ? ease.inOut(ctx.u) * o.push * 0.7 : 0;
    const pp = [lerp(p[0], h[0], push), lerp(p[1], h[1], push), lerp(p[2], h[2], push)];
    const rx = Math.cos(yaw), rz = -Math.sin(yaw); // camera-right vector for lateral framing offset
    const lx = o.lx || 0;
    drift(ctx, pp, [h[0] + rx * lx, h[1] + (o.ly || 0) - 0.05, h[2] + rz * lx], o.fov || 34, o.drift ?? 0.025);
    if (ctx.shot.set === 'building' && h[2] < FZ - 0.1) ctx.S.cutFront = true;
  };
  // anchor positions for overlays (resolved per frame in main via whoA)
  const aw = (n, up = 0.7) => ({ who: n, up });

  // ---------------------------------------------------------- elevator constants
  const B = sets.building; const FZ = B.FZ;
  const STAND_YOU = [-0.42, 0, 0.2], STAND_ALEX = [0.72, 0, -0.62];
  const SIT_YOU = [-0.68, 0, -0.8], SIT_ALEX = [0.62, 0, -0.8], SIT_YOU2 = [-0.48, 0, -0.8], SIT_ALEX2 = [0.58, 0, -0.8];
  const LIGHT = { normal: 1.0, dim: 0.62 };
  // elevator state over the whole story
  const elevState = (t) => {
    const S = { door: 0, floor: '6', arrow: null, light: LIGHT.dim, tint: '#e8e4ff', lit: [], fan: null };
    // floor numbers while moving
    if (t < 58.6) S.floor = t < 52 ? 'L' : t < 54.5 ? '1' : '2';
    else if (t < 64.6) S.floor = step(t, [[0, '3'], [T(11, 'four'), '4'], [T(11, 'five'), '5'], [T(11, 'six'), '6']]);
    if (t >= 52 && t < 64.6) S.arrow = 'up';
    // lighting
    if (t < 64.6) { S.light = LIGHT.normal; S.tint = '#ffffff'; }
    else if (t < 71) { const f = noise1(t * 14, 5) > 0.1 ? 1 : 0.15; S.light = lerp(f, LIGHT.dim, range(t, 69, 71)); S.tint = '#f2eaff'; }
    else if (t >= T(195, 'flicker') && t < T(195, 'doors')) { S.light = noise1(t * 16, 3) > -0.2 ? 1.1 : 0.3; S.tint = '#ffffff'; }
    else if (t >= T(195, 'doors')) { S.light = 1.1; S.tint = '#ffffff'; }
    else if (t >= 333 && t < 422) { S.light = 0.72; S.tint = '#ffe9d8'; } // warmer, cosier
    else if (t >= 422 && t < 545) { S.light = 0.66; S.tint = '#ffd9b8'; } // hot
    else if (t >= 545 && t < 651) { S.light = 0.72; S.tint = '#fff0e0'; }
    else if (t >= 651) { S.light = 0.68; S.tint = '#efe4ff'; }
    S.indGlow = t < 64.6 ? 1 : t < 71 ? (noise1(t * 14, 5) > 0.1 ? 1 : 0.2) : 0.55;
    // fan: spinning until it stops at P101
    const fs = T(101, 'stopped');
    S.fan = t < fs ? t * 9 : fs * 9 + 9 * 1.2 * (1 - Math.exp(-(t - fs) / 1.2));
    if (t >= T(195, 'doors')) S.fan = t * 9;
    return S;
  };
  const E = (ctx, extra = {}) => Object.assign(ctx.S, elevState(ctx.t), extra);

  // ---------------------------------------------------------- props
  const SETS_ = sets;
  const phoneYou = (() => { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.28, 0.025), new THREE.MeshPhongMaterial({ color: '#2a2338', shininess: 80 }))); const s = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.25), new THREE.MeshBasicMaterial({ color: '#bfa8ff' })); s.position.z = 0.014; g.add(s); g.userData.scr = s; g.position.set(0, -0.06, 0.06); g.rotation.x = -0.5; return g; })();
  cast.you.attach('phone', phoneYou, 'R'); phoneYou.visible = false;
  const phoneAlex = phoneYou.clone(); phoneAlex.children[1].material = new THREE.MeshBasicMaterial({ color: '#ffb3b3' }); cast.alex.attach('phone', phoneAlex, 'R'); phoneAlex.visible = false;
  const phoneFriend = phoneYou.clone(); cast.friend.attach('phone', phoneFriend, 'R'); phoneFriend.rotation.set(0.2, 0, 0); phoneFriend.visible = false;
  const mkBar = (half) => { const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.BoxGeometry(half ? 0.13 : 0.26, 0.08, 0.035), new THREE.MeshLambertMaterial({ color: '#ffcf4a' })); g.add(m); const c = new THREE.Mesh(new THREE.BoxGeometry(half ? 0.12 : 0.25, 0.06, 0.04), new THREE.MeshLambertMaterial({ color: '#c98a3a' })); c.position.x = half ? 0.0 : 0; g.add(c); m.material.transparent = false; g.position.set(0, -0.05, 0.05); return g; };
  const barAlex = mkBar(false); cast.alex.attach('bar', barAlex, 'R'); barAlex.visible = false;
  const halfAlex = mkBar(true); cast.alex.attach('half', halfAlex, 'L'); halfAlex.visible = false;
  const halfYou = mkBar(true); cast.you.attach('half', halfYou, 'L'); halfYou.visible = false;
  const guitar = (() => { const g = new THREE.Group(); const wood = new THREE.MeshPhongMaterial({ color: '#d9813a', shininess: 60 }); const b1 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.09, 24), wood); b1.rotation.x = Math.PI / 2; g.add(b1); const b2 = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.09, 24), wood); b2.rotation.x = Math.PI / 2; b2.position.y = 0.22; g.add(b2); const n = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.6, 0.035), new THREE.MeshLambertMaterial({ color: '#5a2d12' })); n.position.y = 0.6; g.add(n); const hole = new THREE.Mesh(new THREE.CircleGeometry(0.06, 16), new THREE.MeshBasicMaterial({ color: '#2a1408' })); hole.position.set(0, 0.08, 0.047); g.add(hole); g.position.set(-0.05, 0.66, 0.28); g.rotation.set(0.1, 0, 1.05); return g; })();
  cast.you.body.add(guitar); guitar.visible = false;
  const props = (ctx, o) => { phoneYou.visible = !!o.phoneYou; phoneAlex.visible = !!o.phoneAlex; phoneFriend.visible = !!o.phoneFriend; barAlex.visible = !!o.bar; halfAlex.visible = !!o.halfAlex; halfYou.visible = !!o.halfYou; guitar.visible = !!o.guitar; if (o.phoneScr) phoneYou.userData.scr.material.color.set(o.phoneScr); else phoneYou.userData.scr.material.color.set('#bfa8ff'); };
  const resetScale = () => { for (const c of Object.values(cast)) { for (const s of ['L', 'R']) { c.arms[s].hand.scale.setScalar(1); c.legs[s].hp.scale.set(1, 1, 1); } } };
  // void extras: whale, pedestal, lollipop trees for dream
  const V = sets.void;
  const whale = (() => { const g = new THREE.Group(); const m = new THREE.MeshPhongMaterial({ color: '#5a7bff', shininess: 30 }); const body = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), m); body.scale.set(2.2, 1.1, 1.2); g.add(body); const belly = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), new THREE.MeshLambertMaterial({ color: '#dfe6ff' })); belly.scale.set(1.9, 0.7, 1.0); belly.position.set(0.2, -0.4, 0.15); g.add(belly); const tail = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.4, 4), m); tail.rotation.z = Math.PI / 2; tail.position.set(-2.6, 0.3, 0); tail.scale.set(1, 1, 0.3); g.add(tail); for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), new THREE.MeshBasicMaterial({ color: '#1d1630' })); e.position.set(1.5, 0.2, s * 0.95); g.add(e); } g.position.set(0, 1.8, -1.5); g.visible = false; V.scene.add(g); return g; })();
  const pedestal = (() => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.85, 0.6, 32), new THREE.MeshPhongMaterial({ color: '#ffd34d', shininess: 90 })); m.position.y = 0.3; m.castShadow = m.receiveShadow = true; m.visible = false; V.scene.add(m); return m; })();
  const dreamTrees = []; for (let i = 0; i < 8; i++) { const g = new THREE.Group(); const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 2.2, 8), new THREE.MeshLambertMaterial({ color: '#c08ae8' })); tr.position.y = 1.1; g.add(tr); const top = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 12), new THREE.MeshPhongMaterial({ color: i % 2 ? '#ff9ad5' : '#8fd6ff', shininess: 20 })); top.position.y = 2.3; g.add(top); g.position.set((i - 3.5) * 2.2, 0, -4 - (i % 3)); g.visible = false; V.scene.add(g); dreamTrees.push(g); }
  const voidMode = (o = {}) => { whale.visible = !!o.whale; pedestal.visible = !!o.pedestal; dreamTrees.forEach(d => d.visible = !!o.trees); V.setColor(o.color || '#4425c8'); };
  // cat for Mrs. Patterson
  const cat = (() => { const g = new THREE.Group(); const m = new THREE.MeshLambertMaterial({ color: '#ff9f43' }); const b = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), m); b.scale.set(1.3, 0.9, 0.9); b.position.y = 0.22; g.add(b); const h = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 12), m); h.position.set(0.28, 0.4, 0); g.add(h); for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 4), m); e.position.set(0.3, 0.56, s * 0.08); g.add(e); } const tl = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.4, 6), m); tl.position.set(-0.3, 0.42, 0); tl.rotation.z = 0.5; g.add(tl); return g; })();
  sets.stack.rooms.patterson.add(cat); cat.position.set(0.2, 0, 0.2);
  const catHall = cat.clone(); sets.building.scene.add(catHall); catHall.visible = false;

  // ======================================================================== ACT 0 — the morning
  const ST = sets.street;
  mood(0, 'playful', 0.9);
  fx(0, 'amb_street', 0.55, { dur: 9.4 });
  card(0.4, 4.6, '7:52 AM · MONDAY');
  // P0 walking to bus stop
  cut(0, 'street', ['you'], ctx => {
    const t = ctx.t, stopT = T(0, 'realize');
    const x = lerp(2.5, 6.2, ease.out(range(t, 0, stopT)));
    const walking = t < stopT;
    act(ctx, 'you', { pos: [x, 0.1, 1.2], rot: walking ? Math.PI / 2 : lerp(Math.PI / 2, 0.4, ease.outBack(range(t, stopT, stopT + 0.35))), walk: { phase: t * 7.5, amt: walking ? 1 : 0 }, pose: 'stand', expr: t < stopT ? 'content' : t < T(0, 'homework') ? 'surprised' : 'shocked', head: { pitch: t > stopT ? -0.05 : 0 } });
    dolly(ctx, [[x - 1.0, 1.5, 6.6], [x + 0.6, 1.2, 1.2], 38], [[x + 0.2, 1.4, 5.3], [x + 0.3, 1.3, 1.2], 34]);
    if (t > stopT) ctx.shake = pulse(t, stopT, stopT + 0.4) * 0.6;
  });
  for (let k = 0; k < 9; k++) fx(0.3 + k * 0.42, 'step', 0.25);
  fx(T(0, 'realize') - 0.05, 'sting_shock', 0.75);
  pop(T(0, 'homework'), PE(0) + 0.4, 'MATH\nHOMEWORK!', { y: 0.3, x: 0.7, size: 92, colors: ['#ffffff', '#ffd34d'], rot: 5 });
  // P1 turn + sprint
  cut(PS(1) - 0.1, 'street', ['you'], ctx => {
    const t = ctx.t, t0 = PS(1), sp = T(1, 'sprint');
    const turned = range(t, t0, t0 + 0.4);
    const run = range(t, sp - 0.1, PE(1) + 0.4);
    const x = lerp(6.2, -4.5, ease.in(run) * 0.6 + run * 0.4);
    act(ctx, 'you', { pos: [x, 0.1, 1.2], rot: lerp(0.4, -Math.PI / 2, ease.out(turned)), walk: { phase: t * 13, amt: run > 0 ? 1 : 0, run: true }, expr: run > 0 ? 'determined' : 'scared' });
    look(ctx.cam, [x + 2.4, 1.0, 5.2], [x - 0.6, 1.2, 1.2], 42);
  });
  fx(PS(1) + 0.1, 'whoosh', 0.6); for (let k = 0; k < 14; k++) fx(T(1, 'sprint') + k * 0.23, 'step_run', 0.3);
  pop(T(1, 'sprint'), T(1, 'apartment'), 'SPRINT!', { y: 0.3, size: 140, rot: -8, colors: ['#fff27a', '#ff6b3d'], snd: 'whoosh_hit' });
  cut(T(1, 'apartment') - 0.15, 'street', ['you'], ctx => {
    const t = ctx.t, u = range(t, ctx.shot.t0, PE(1) + 0.3);
    act(ctx, 'you', { pos: [lerp(-1.5, -6, u), 0.1, lerp(1.2, -1.6, u)], rot: -Math.PI / 2 - u * 0.9, walk: { phase: t * 13, amt: 1, run: true }, expr: 'determined' });
    dolly(ctx, [[2, 3.5, 12], [-5, 4, -4], 50], [[0, 2.5, 9], [-6, 3, -4], 46]);
  });
  fx(PE(1) - 0.1, 'door_push', 0.5);
  // P2 lobby — doors closing
  cut(PS(2) - 0.3, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t, sl = T(2, 'slowly');
    const door = t < sl ? 1 : 1 - ease.inOut(range(t, sl, sl + 3.6)) * 0.9;
    E(ctx, { door, floor: 'L', light: 1, tint: '#ffffff', lit: [], lobby: true });
    const stopT = PS(2) + 0.6;
    act(ctx, 'you', { pos: [lerp(-1.2, 0.2, ease.out(range(t, ctx.shot.t0, stopT))), 0, lerp(7.2, 5.2, ease.out(range(t, ctx.shot.t0, stopT)))], rot: Math.PI, walk: { phase: t * 12, amt: t < stopT ? 1 : 0, run: true }, expr: 'shocked', head: { pitch: 0 } });
    act(ctx, 'alex', { pos: STAND_ALEX, rot: -0.2, expr: 'neutral', look: [0.3, 0] });
    dolly(ctx, [[1.2, 1.7, 8.6], [0, 1.3, FZ], 42], [[0.6, 1.5, 6.9], [0, 1.2, FZ], 36]);
  });
  fx(PS(2) + 0.2, 'ding', 0.5); fx(T(2, 'slowly'), 'door_slide', 0.7);
  cut(T(2, 'elevator') - 0.1, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t, sl = T(2, 'slowly');
    const door = t < sl ? 1 : 1 - ease.inOut(range(t, sl, sl + 3.6)) * 0.9;
    E(ctx, { door, floor: 'L', light: 1, tint: '#ffffff', lobby: true });
    act(ctx, 'you', { pos: [0.2, 0, 5.2], rot: Math.PI, expr: 'shocked' });
    act(ctx, 'alex', { pos: STAND_ALEX, rot: -0.2, expr: 'neutral' });
    dolly(ctx, [[0, 1.3, 3.6], [0, 1.2, FZ], 40], [[0, 1.25, 2.6], [0, 1.2, FZ], 34], ease.sine);
  });
  // P3 determined
  cut(PS(3) - 0.15, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t;
    E(ctx, { door: 0.1 + 0.9 * (1 - ease.inOut(range(t, T(2, 'slowly'), T(2, 'slowly') + 3.6))) * 0 + 0.24 - range(t, PS(3), PE(3) + 1) * 0.12, floor: 'L', light: 1, tint: '#fff', lobby: true });
    act(ctx, 'you', { pos: [0.2, 0, 5.2], rot: Math.PI, expr: 'determined', head: { pitch: 0.05 } });
    act(ctx, 'alex', { pos: STAND_ALEX, rot: -0.2 });
    cu(ctx, 'you', { yaw: Math.PI, dist: 1.4, push: 0.25, dy: -0.05 });
  });
  fx(PS(3), 'riser_short', 0.45);
  pop(T(3, 'not'), T(3, 'stairs') - 0.1, 'NOT TODAY.', { y: 0.28, x: 0.5, size: 110, rot: -3, colors: ['#ffffff', '#ff8fb1'] });
  cut(T(3, 'eight') - 0.05, 'building', [], ctx => { E(ctx, { door: 0.12, lobby: true, light: 1, tint: '#fff' }); dolly(ctx, [[3.2, 1.6, 4.4], [4.6, 1.6, FZ], 40], [[3.6, 1.7, 3.4], [4.6, 1.9, FZ], 30]); });
  pill(T(3, 'eight'), PE(3) + 0.3, '8 FLIGHTS OF STAIRS', 0.62, 0.72, { icon: 'x' });
  fx(T(3, 'eight'), 'sting_low', 0.5);
  // P4 hand in the doors
  cut(PS(4) - 0.2, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t, sh = T(4, 'shove'), bo = T(4, 'bounce');
    const door = t < bo ? lerp(0.24, 0.07, range(t, ctx.shot.t0, sh + 0.2)) : 0.07 + ease.outBack(range(t, bo, bo + 0.6)) * 0.93;
    E(ctx, { door, floor: 'L', light: 1, tint: '#fff', lobby: true });
    const dash = ease.out(range(t, ctx.shot.t0, sh + 0.15));
    act(ctx, 'you', { pos: [lerp(0.2, 0.05, dash), 0, lerp(5.2, FZ + 0.6, dash)], rot: Math.PI, walk: { phase: t * 13, amt: dash < 1 ? 1 : 0, run: true }, pose: t > sh - 0.1 ? 'pressButton' : 'stand', expr: 'determined' });
    act(ctx, 'alex', { pos: STAND_ALEX, rot: -0.2 });
    dolly(ctx, [[2.7, 1.9, FZ + 3.4], [0, 1.25, FZ], 40], [[2.3, 1.8, FZ + 2.8], [0, 1.2, FZ], 36]);
    ctx.shake = pulse(t, bo, bo + 0.35) * 0.5;
  });
  fx(T(4, 'shove'), 'door_thunk', 0.9); fx(T(4, 'bounce'), 'door_slide', 0.8);
  pop(T(4, 'bounce'), T(4, 'bounce') + 1.3, 'BOING!', { x: 0.36, y: 0.32, size: 90, rot: -10, colors: ['#bdf6ff', '#4fa3ff'], sfx: false });
  cut(T(4, 'stumble') - 0.1, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t, st = T(4, 'stumble');
    E(ctx, { door: 1, floor: 'L', light: 1, tint: '#fff' });
    const u = ease.out(range(t, st, st + 1.1));
    act(ctx, 'you', { pos: [lerp(0.05, -0.3, u), 0, lerp(FZ + 0.6, 0.3, u)], rot: Math.PI - u * 0.2, walk: { phase: t * 10, amt: u < 1 ? 0.8 : 0 }, pose: u < 1 ? 'stand' : 'slump', expr: 'tired', mouth: u >= 1 ? 0.35 + 0.25 * Math.sin(t * 9) : 0, sweat: 1, bob: u >= 1 ? Math.sin(t * 9) * 0.01 : 0 });
    act(ctx, 'alex', { pos: STAND_ALEX, rot: -0.2, expr: 'neutral', look: [0.3, 0] });
    drift(ctx, [-0.9, 1.7, -0.95], [0.1, 1.2, 0.9], 52);
  });
  fx(T(4, 'stumble'), 'stumble', 0.6); fx(T(4, 'stumble') + 1.3, 'pant', 0.35);
  cut(T(4, 'notice') - 0.1, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t;
    E(ctx, { door: 1, floor: 'L', light: 1, tint: '#fff' });
    act(ctx, 'you', { pos: [-0.3, 0, 0.3], rot: Math.PI - 0.2 + ease.inOut(range(t, T(4, 'notice'), T(4, 'notice') + 0.8)) * -2.2, pose: 'slump', expr: t > T(4, 'corner') ? 'surprised' : 'tired', sweat: 1 });
    act(ctx, 'alex', { pos: STAND_ALEX, rot: -0.35, expr: 'neutral' });
    dolly(ctx, [[-0.95, 1.55, 1.1], [0.72, 1.3, -0.62], 44], [[-0.45, 1.5, 0.75], [0.72, 1.45, -0.62], 30], ease.sine);
  });
  fx(T(4, 'notice'), 'suspense_hit', 0.5);
  mood(T(4, 'notice'), 'none');
  // P5 It's Alex
  cut(PS(5) - 0.1, 'building', ['alex'], ctx => {
    E(ctx, { door: 1, floor: 'L', light: 1, tint: '#fff' });
    act(ctx, 'alex', { pos: STAND_ALEX, rot: -0.35, expr: ctx.t < PS(5) + 0.4 ? 'neutral' : 'smile', head: { roll: 0.08 } });
    cu(ctx, 'alex', { dist: 1.7, push: 0.3, yaw: -0.15, fov: 32 });
  });
  fx(PS(5) - 0.05, 'chime_magic', 0.65); fx(PS(5), 'heartbeat', 0.65);
  wash(PS(5), PS(5) + 1.4, '#ff7eb6', 0.16, { inD: 0.2, outD: 0.8 });
  pill(PS(5) + 0.1, PS(6) + 0.4, 'ALEX', 0.5, 0.775, { icon: 'heart' });
  ov({ type: 'symbol', t0: PS(5) + 0.1, t1: PS(6), whoA: aw('alex', 0.75), sym: 'hearts', scale: 1.0 });
  mood(PS(5), 'tender', 0.8);
  // P6 who Alex is
  voidMode();
  cut(PS(6) - 0.15, 'void', ['alex'], ctx => {
    voidMode(); ctx.S.pool = true;
    act(ctx, 'alex', { pos: [0, 0, 0], rot: 0.15, expr: 'smile', pose: 'relaxed' });
    const a = lerp(-0.4, 0.3, ease.inOut(ctx.u)); look(ctx.cam, [Math.sin(a) * 5.4, 1.6, Math.cos(a) * 5.4], [0, 1.15, 0], 36);
  });
  pill(T(6, 'ninth'), T(6, 'alex', 1), '9TH FLOOR', 0.5, 0.78, { icon: 'bolt' });
  fx(T(6, 'ninth'), 'pop', 0.5);
  cut(T(6, 'alex', 1) - 0.1, 'classroom', ['you', 'alex', 'npc1', 'npc2', 'npc3'], ctx => {
    const D = sets.classroom.desks; const dp = (i) => [D[i].position.x, 0, D[i].position.z + 0.55];
    act(ctx, 'alex', { pos: dp(1), rot: Math.PI, pose: 'sitChair', expr: 'neutral' });
    act(ctx, 'you', { pos: dp(7), rot: Math.PI, pose: 'sitChair', expr: 'love', head: { roll: 0.1 } });
    act(ctx, 'npc1', { pos: dp(4), rot: Math.PI, pose: 'sitChair' }); act(ctx, 'npc2', { pos: dp(0), rot: Math.PI, pose: 'sitChair' }); act(ctx, 'npc3', { pos: dp(5), rot: Math.PI, pose: 'sitChair' });
    dolly(ctx, [[1.6, 2.2, 5.2], [0, 1.1, -1.5], 40], [[0.9, 1.9, 4.4], [0, 1.0, -1.6], 36]);
  });
  pill(T(6, 'math'), T(6, 'alex', 2), 'MATH CLASS · 2 ROWS AHEAD', 0.5, 0.775, { icon: 'clock' });
  ov({ type: 'symbol', t0: T(6, 'sits'), t1: T(6, 'alex', 2), whoA: aw('you', 0.7), sym: 'hearts' });
  fx(T(6, 'alex', 1), 'whoosh', 0.45); fx(T(6, 'math'), 'pop', 0.45);
  cut(T(6, 'alex', 2) - 0.1, 'void', ['you', 'alex'], ctx => {
    voidMode({ color: '#5a2bc8' });
    act(ctx, 'you', { pos: [-1.0, 0, 0], rot: 0.5, expr: 'love', pose: 'handsFace' });
    act(ctx, 'alex', { pos: [1.1, 0, -0.4], rot: -0.2, expr: 'neutral' });
    dolly(ctx, [[0, 1.5, 6.2], [0, 1.1, 0], 36], [[0, 1.4, 5.2], [0, 1.1, 0], 34]);
  });
  ov({ type: 'meter', t0: T(6, 'crush'), t1: PE(6) + 0.6, label: 'CRUSH LEVEL', x: 0.5 - 0.11, y: 0.14, w: 420, value: t => range(t, T(6, 'crush'), T(6, 'very')) * 1.0, icon: 'heart', valueText: t => t < T(6, 'very') ? `${Math.round(range(t, T(6, 'crush'), T(6, 'very')) * 100)}%` : 'MAX' });
  ov({ type: 'counter', t0: T(6, 'very'), t1: PE(6) + 0.6, x: 0.38, y: 0.78, size: 60, box: true, text: t => `${Math.round(lerp(1, 487, ease.out(range(t, T(6, 'very'), PE(6)))))} DAYS` });
  fx(T(6, 'very'), 'counter_roll', 0.45);
  // P7 four words
  cut(PS(7) - 0.15, 'void', ['you', 'alex'], ctx => {
    voidMode();
    act(ctx, 'you', { pos: [-2.0, 0, 0], rot: 0.3, expr: 'awkward', look: [0.6, 0] });
    act(ctx, 'alex', { pos: [2.0, 0, 0], rot: -0.3, expr: 'neutral' });
    dolly(ctx, [[0, 1.6, 7.6], [0, 1.0, 0], 38], [[0, 1.5, 7.0], [0, 1.0, 0], 38]);
  });
  ov({ type: 'meter', t0: PS(7), t1: PS(9), label: 'WORDS SAID TO ALEX', x: 0.39, y: 0.16, w: 420, value: t => step(t, [[0, 0.02], [T(8, 'hi'), 0.06], [T(8, 'hey'), 0.1], [T(8, 'sorry'), 0.14], [T(8, 'bye'), 0.18]]), icon: 'heart', valueText: t => String(step(t, [[0, 0], [T(7, 'four'), 4]])) });
  pop(T(7, 'four'), PE(7) + 0.3, '4 WORDS', { y: 0.72, size: 100 });
  // P8 Hi. Hey. Sorry. Bye.
  cut(PS(8) - 0.1, 'void', ['you'], ctx => {
    const t = ctx.t; voidMode({ color: '#4a2bd8' });
    const w = step(t, [[0, 0], [T(8, 'hey'), 1], [T(8, 'sorry'), 2], [T(8, 'bye'), 3]]);
    const poses = ['wave', 'point', 'shrug', 'wave'], exprs = ['grin', 'awkward', 'embarrassed', 'nervous'];
    act(ctx, 'you', { pos: [0, 0, 0], rot: [0.3, -0.3, 0.2, -0.2][w], poseMix: tp(t, [PS(8), T(8, 'hey'), T(8, 'sorry'), T(8, 'bye')][w] - 0.1, 'stand', poses[w], 0.2), expr: exprs[w] });
    const zs = [3.6, 3.2, 2.8, 2.4]; look(ctx.cam, [[-0.6, 0.5, 0.6, -0.4][w], 1.55, zs[w]], [0, 1.35, 0], 38);
  });
  [['HI.', 'hi', 0.3, 0.3, -8], ['HEY.', 'hey', 0.7, 0.3, 6], ['SORRY.', 'sorry', 0.28, 0.62, 4], ['…BYE.', 'bye', 0.7, 0.6, -5]].forEach(([s, w, x, y, r]) => pop(T(8, w), PE(8) + 0.5, s, { x, y, size: 96, rot: r, colors: ['#ffffff', '#c9b8ff'], snd: 'pop_word' }));
  // P9 the whole relationship
  cut(PS(9) - 0.1, 'void', ['you'], ctx => {
    voidMode({ color: '#3a22a8' });
    act(ctx, 'you', { pos: [0, 0, 0], rot: 0, expr: 'awkward', pose: 'stand' });
    dolly(ctx, [[0, 1.6, 4.2], [0, 1.0, 0], 36], [[0, 2.6, 9.5], [0, 0.9, 0], 36]);
  });
  pill(T(9, 'whole'), PE(9) + 0.5, 'RELATIONSHIP STATUS: 4 WORDS', 0.5, 0.775, { icon: 'x' });
  fx(PS(9) + 0.1, 'crickets', 0.55, { dur: 2.6 });

  // ======================================================================== ACT 1 — going up, the jolt
  mood(PS(10), 'awkward', 0.75);
  cut(PS(10) - 0.15, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t, cl = T(10, 'close');
    E(ctx, { door: 1 - ease.inOut(range(t, cl - 0.2, cl + 1.4)), cutFront: true });
    act(ctx, 'you', { pos: [-0.25, 0, 0.35], rot: lerp(Math.PI - 2.4, -0.05, ease.inOut(range(t, PS(10), PS(10) + 0.7))), pose: 'stand', expr: 'awkward', look: [0, -0.5] });
    act(ctx, 'alex', { pos: STAND_ALEX, rot: -0.2, expr: 'neutral' });
    dolly(ctx, [[0.4, 1.5, 4.6], [0, 1.2, -0.2], 34], [[0.2, 1.5, 4.0], [0, 1.2, -0.2], 36]);
  });
  fx(T(10, 'close') - 0.2, 'door_slide', 0.7); fx(T(10, 'close') + 1.2, 'door_shut', 0.6); fx(T(10, 'moving'), 'elev_start', 0.65); fx(T(10, 'moving'), 'elev_hum', 0.35, { dur: T(12, 'jolts') - T(10, 'moving') });
  cut(T(10, 'stare') - 0.1, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t; E(ctx);
    act(ctx, 'you', { pos: [-0.25, 0, 0.35], rot: 0, expr: t > T(10, 'fascinating') ? 'love' : 'awkward', head: { pitch: -0.45 }, look: [0, -1] });
    act(ctx, 'alex', { pos: STAND_ALEX, rot: -0.35, expr: 'neutral', head: { yaw: -0.3 } });
    dolly(ctx, [[-0.1, 1.05, 1.2], [-0.25, 1.75, 0.3], 44], [[-0.15, 1.15, 1.05], [-0.25, 1.75, 0.3], 40]);
  });
  ov({ type: 'symbol', t0: T(10, 'fascinating'), t1: PE(10) + 0.3, whoA: aw('you', 0.7), sym: '✦', color: '#fff7b0', size: 70 });
  fx(T(10, 'fascinating'), 'sparkle', 0.5);
  // P11 3 4 5 6
  cut(PS(11) - 0.15, 'building', ['you', 'alex'], ctx => {
    E(ctx); act(ctx, 'you', { pos: [-0.25, 0, 0.35], rot: 0, expr: 'awkward', head: { pitch: -0.45 } }); act(ctx, 'alex', { pos: STAND_ALEX, rot: -0.35 });
    dolly(ctx, [[0, 1.85, 0.15], [0, 2.7, FZ], 30], [[0, 1.95, 0.45], [0, 2.7, FZ], 24]);
  });
  ['three', 'four', 'five', 'six'].forEach(w => fx(T(11, w), 'floor_tick', 0.5));
  cut(T(11, 'five') - 0.1, 'building', ['you', 'alex'], ctx => {
    E(ctx); act(ctx, 'you', { pos: [-0.25, 0, 0.35], rot: 0, expr: 'awkward', look: [0.8, -0.4], sweat: 1 }); act(ctx, 'alex', { pos: STAND_ALEX, rot: -0.35, expr: 'awkward', look: [-0.8, 0] });
    drift(ctx, [0.15, 1.5, 3.9], [0.2, 1.3, -0.2], 34); ctx.S.cutFront = true;
  });
  cut(T(11, 'six') - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); act(ctx, 'you', { pos: [-0.25, 0, 0.35] }); act(ctx, 'alex', { pos: STAND_ALEX }); look(ctx.cam, [0, 1.95, 0.45], [0, 2.7, FZ], 24); });
  // P12 JOLT
  const jolt = T(12, 'jolts');
  cut(PS(12) - 0.1, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t; E(ctx); ctx.S.cutFront = true;
    const j = t > jolt; const jump = j ? Math.max(0, Math.sin(range(t, jolt, jolt + 0.45) * Math.PI)) * 0.18 : 0;
    act(ctx, 'you', { pos: [-0.25, jump, 0.35], rot: 0, expr: j ? 'shocked' : 'awkward', pose: j ? 'scared' : 'stand', look: j ? [0, 0] : [0.8, -0.4] });
    act(ctx, 'alex', { pos: [0.72, jump * 0.8, -0.62], rot: -0.35, expr: j ? 'shocked' : 'neutral', pose: j ? 'scared' : 'stand' });
    dolly(ctx, [[0.1, 1.5, 4.2], [0.2, 1.3, -0.2], 34], [[0.1, 1.45, 3.4], [0.2, 1.3, -0.2], 38], ease.in);
    ctx.shake = j ? Math.max(0, 1 - (t - jolt) / 1.6) * 2.2 : 0;
  });
  mood(jolt - 0.05, 'none');
  fx(jolt, 'impact_big', 1.0); fx(jolt, 'sub_boom', 0.8);
  flash(jolt, { dur: 0.18, amt: 0.7 });
  pop(jolt, jolt + 1.4, 'JOLT!', { size: 170, rot: -6, colors: ['#ffffff', '#ff5f5f'], y: 0.4, sfx: false });
  // P13 flicker / grinding
  cut(PS(13) - 0.1, 'building', ['you', 'alex'], ctx => {
    E(ctx); act(ctx, 'you', { pos: [-0.25, 0, 0.35], rot: 0, expr: 'scared', pose: 'scared', head: { pitch: -0.5 } }); act(ctx, 'alex', { pos: STAND_ALEX, rot: -0.35, expr: 'scared', pose: 'scared', head: { pitch: -0.5 } });
    drift(ctx, [0.6, 1.05, 1.0], [0, 2.9, -0.2], 46, 0.04); ctx.shake = 0.3;
  });
  fx(PS(13), 'flicker', 0.7, { dur: 4 });
  cut(T(13, 'grinding') - 0.1, 'shaft', ['you', 'alex'], ctx => {
    const t = ctx.t; const SH = sets.shaft; ctx.S.carY = SH.FH * 6.45 + Math.max(0, 1 - range(t, T(13, 'grinding'), PE(13))) * 0.25;
    ctx.S.shake = noise1(t * 40, 2) * 0.03 * (1 - range(t, T(13, 'shudder'), PE(13) + 0.5));
    dolly(ctx, [[3.6, SH.FH * 6.45 + 4.2, 6.5], [0, SH.FH * 6.45 + 1.8, 0], 40], [[3.0, SH.FH * 6.45 + 3.6, 5.6], [0, SH.FH * 6.45 + 2, 0], 40]);
    ctx.shake = 0.4;
  }, { inCar: 'stand' });
  fx(T(13, 'grinding'), 'grind', 0.75); fx(T(13, 'shudder'), 'shudder', 0.7);
  cut(T(13, 'then') - 0.3, 'building', ['you', 'alex'], ctx => {
    E(ctx); ctx.S.cutFront = true; act(ctx, 'you', { pos: [-0.25, 0, 0.35], rot: 0, expr: 'scared', pose: 'scared', idle: 0 }); act(ctx, 'alex', { pos: STAND_ALEX, rot: -0.35, expr: 'scared', pose: 'scared', idle: 0 });
    look(ctx.cam, [0.1, 1.5, 4.4], [0.2, 1.3, -0.2], 32);
  });
  // P14 Nothing. P15 stopped between floors
  cut(PS(15) - 0.15, 'shaft', ['you', 'alex'], ctx => {
    const SH = sets.shaft; const y = SH.FH * 6.45; ctx.S.carY = y;
    dolly(ctx, [[2.8, y + 2.2, 5.0], [0, y + 1.6, 0], 40], [[5.5, y + 2.4, 15.5], [0, y + 1.6, 0], 40]);
  }, { inCar: 'stand' });
  fx(PS(15), 'whoosh_low', 0.4);
  pill(T(15, 'sixth'), PE(15) + 0.6, 'FLOOR 6', 0.3, 0.68, { icon: 'dot' });
  pill(T(15, 'seventh'), PE(15) + 0.6, 'FLOOR 7', 0.3, 0.32, { icon: 'dot' });
  pill(T(15, 'completely'), PE(15) + 0.6, 'STUCK', 0.66, 0.5, { icon: 'x', size: 30 });
  // P16 look at each other
  cut(PS(16) - 0.1, 'building', ['you', 'alex'], ctx => {
    E(ctx); act(ctx, 'you', { pos: [-0.25, 0, 0.35], rot: lerp(0, 0.75, ease.out(range(ctx.t, PS(16), PS(16) + 0.4))), expr: 'shocked', pose: 'stand' }); act(ctx, 'alex', { pos: STAND_ALEX, rot: -0.35, pose: 'stand' });
    cu(ctx, 'you', { dist: 1.3, yaw: 0.2, push: 0.2 });
  });
  fx(PS(16), 'zoom_whoosh', 0.55);
  cut(T(16, 'alex', 1) - 0.1, 'building', ['you', 'alex'], ctx => {
    E(ctx); act(ctx, 'you', { pos: [-0.25, 0, 0.35], rot: 0.75 }); act(ctx, 'alex', { pos: STAND_ALEX, rot: lerp(-0.35, -1.0, ease.out(range(ctx.t, T(16, 'alex', 1), T(16, 'alex', 1) + 0.4))), expr: 'shocked' });
    cu(ctx, 'alex', { dist: 1.3, yaw: 0.25, push: 0.2 });
  });
  fx(T(16, 'alex', 1), 'zoom_whoosh', 0.55);
  // P17-18 same thought
  cut(PS(17) - 0.15, 'building', ['you', 'alex'], ctx => {
    E(ctx); ctx.S.cutFront = true;
    act(ctx, 'you', { pos: [-0.25, 0, 0.35], rot: 0.6, expr: 'awkward', look: [0.6, 0], sweat: 1 }); act(ctx, 'alex', { pos: STAND_ALEX, rot: -0.75, expr: ctx.t > T(18, 'not') ? 'dizzy' : 'awkward', look: [-0.6, 0] });
    dolly(ctx, [[0.2, 1.6, 3.9], [0.2, 1.4, -0.2], 34], [[0.2, 1.6, 3.4], [0.2, 1.45, -0.2], 34]);
    if (ctx.t > T(18, 'not')) act(ctx, 'you', { pos: [-0.25, 0, 0.35], rot: 0.6, expr: 'dizzy' });
  });
  think(T(17, 'same'), PE(18) + 0.4, aw('you', 0.9), '!!!', { dx: -30 });
  think(T(17, 'same') + 0.15, PE(18) + 0.4, aw('alex', 0.9), '!!!', { dx: 30 });
  pop(T(18, 'not'), PE(18) + 0.5, 'NOT HAPPENING', { y: 0.7, size: 104, rot: 3, colors: ['#ffffff', '#ff6b9a'] });
  // P19 the big question — title
  mood(PS(19), 'theme', 0.9);
  cut(PS(19) - 0.15, 'shaft', ['you', 'alex'], ctx => {
    const SH = sets.shaft; const y = SH.FH * 6.45; ctx.S.carY = y;
    const a = lerp(0.5, -0.3, ctx.u); look(ctx.cam, [Math.sin(a) * 13, y + 3 + ctx.u * 1.5, Math.cos(a) * 13], [0, y + 1.5, 0], 40);
  }, { inCar: 'stand' });
  ov({ type: 'title', t0: PS(19) + 0.3, t1: T(19, 'would') - 0.2, kicker: 'WHAT WOULD ACTUALLY HAPPEN', text: 'STUCK IN AN ELEVATOR\nWITH YOUR CRUSH?', y: 0.42, size: 96 });
  fx(PS(19) + 0.2, 'title_hit', 0.8);
  cut(T(19, 'would') - 0.15, 'void', ['you'], ctx => {
    const t = ctx.t; voidMode();
    act(ctx, 'you', { pos: [0.9, 0, 0], rot: -0.25, expr: step(t, [[0, 'thinking'], [T(19, 'embarrass'), 'embarrassed'], [T(19, 'survive'), 'nervous']]), pose: step(t, [[0, 'stand'], [T(19, 'embarrass'), 'handsFace'], [T(19, 'survive'), 'armsCrossed']]) });
    dolly(ctx, [[0.2, 1.6, 6.0], [0.2, 1.1, 0], 36], [[0.4, 1.5, 4.8], [0.4, 1.15, 0], 36]);
  });
  list(T(19, 'would'), PE(19) + 0.6, [{ text: 'A REAL CONVERSATION?', icon: 'q', t: T(19, 'real') }, { text: 'EMBARRASS YOURSELF?', icon: 'q', t: T(19, 'embarrass') }, { text: 'MOVE COUNTRIES?', icon: 'q', t: T(19, 'country') }, { text: 'SURVIVE THE SILENCE?', icon: 'q', t: T(19, 'survive') }], 0.06, 0.24);
  // P20 let's find out
  cut(PS(20) - 0.2, 'building', ['you', 'alex'], ctx => {
    E(ctx); ctx.S.cutFront = true; act(ctx, 'you', { pos: STAND_YOU, rot: 0.1, expr: 'awkward' }); act(ctx, 'alex', { pos: STAND_ALEX, rot: -0.35 });
    dolly(ctx, [[2.5, 4.5, 9], [0, 1.3, 0], 40], [[0.3, 1.6, 3.6], [0.1, 1.25, -0.2], 34], ease.inOut);
  });
  fx(PS(20) - 0.2, 'whoosh_big', 0.7);
  pop(PS(20), PE(20) + 0.5, "LET'S FIND OUT!", { size: 120, y: 0.4, colors: ['#fff27a', '#ff9a3d'], sfx: false });
  mood(PS(21) - 0.3, 'awkward', 0.75);

  // ======================================================================== ACT 2 — buttons + intercom
  const panelCam = (ctx, z = 0) => drift(ctx, [-1.18 + z * 0.05, 1.5, 0.22 + z * 0.25], [-0.86, 1.36, FZ - 0.08], 46 - z * 6, 0.015);
  cut(PS(21) - 0.1, 'building', ['you'], ctx => {
    const t = ctx.t, pr = T(21, 'press') + 0.2;
    E(ctx, { lit: t > pr + 0.15 ? ['8'] : [] });
    act(ctx, 'you', { pos: [-0.5, 0, 0.62], rot: -0.62, poseMix: tp(t, pr - 0.3, 'stand', 'pressButton', 0.3), expr: 'determined' });
    panelCam(ctx);
  });
  fx(T(21, 'press') + 0.35, 'button', 0.8);
  cut(PS(22) - 0.1, 'building', ['you', 'alex'], ctx => {
    E(ctx, { lit: [] }); ctx.S.cutFront = true;
    act(ctx, 'you', { pos: [-0.5, 0, 0.62], rot: -0.4, pose: 'stand', expr: 'awkward' }); act(ctx, 'alex', { pos: STAND_ALEX, rot: -0.3, expr: 'neutral', look: [-0.6, 0] });
    look(ctx.cam, [0.3, 1.55, 3.9], [0, 1.3, -0.1], 34);
  });
  cut(PS(23) - 0.1, 'building', ['you'], ctx => {
    const t = ctx.t; const p1 = T(23, 'press') + 0.15, p2 = T(23, 'harder');
    const pressing = (t > p1 && t < p1 + 0.35) || (t > p2 && t < p2 + 0.5);
    E(ctx, { lit: pressing ? ['8'] : [] });
    act(ctx, 'you', { pos: [-0.5, 0, 0.62], rot: -0.62, pose: pressing ? 'pressButton' : 'holdOut', expr: t > p2 ? 'determined' : 'awkward' });
    panelCam(ctx, t > p2 ? 1 : 0); ctx.shake = pulse(t, p2, p2 + 0.3) * 0.8;
  });
  fx(T(23, 'press') + 0.2, 'button', 0.8); fx(T(23, 'harder'), 'button_hard', 0.9);
  cut(T(23, 'apparently') - 0.1, 'building', ['you'], ctx => {
    E(ctx); act(ctx, 'you', { pos: [-0.5, 0, 0.62], rot: -0.35, pose: 'pressButton', expr: 'determined', head: { yaw: 0.4 } });
    cu(ctx, 'you', { yaw: 0.6, dist: 1.4 });
  });
  pill(T(23, 'elevators') - 0.2, PE(23) + 0.4, 'NOT HOW ELEVATORS WORK', 0.5, 0.775, { icon: 'x' });
  cut(PS(24) - 0.1, 'building', ['you', 'alex'], ctx => {
    E(ctx); ctx.S.cutFront = true; act(ctx, 'you', { pos: [-0.5, 0, 0.62], rot: -0.4, pose: 'stand', expr: 'bored' }); act(ctx, 'alex', { pos: STAND_ALEX, rot: -0.3, expr: 'thinking', look: [-0.6, 0] });
    look(ctx.cam, [0.3, 1.55, 3.6], [0, 1.3, -0.1], 34);
  });
  fx(PS(24), 'crickets', 0.4, { dur: 1.2 });
  cut(PS(25) - 0.1, 'building', ['you'], ctx => {
    const t = ctx.t; const o = T(25, 'open'), c = T(25, 'close'), ev = T(25, 'every');
    const mash = t > ev + 0.1;
    E(ctx, { lit: mash ? (Math.floor(t * 10) % 3 ? 'all' : ['3', '7', '1', 'BELL', '<|>']) : t > c ? ['>|<'] : t > o ? ['<|>'] : [] });
    act(ctx, 'you', { pos: [-0.5, 0, 0.62], rot: -0.62, pose: mash ? 'pressBoth' : (t > o - 0.2 ? 'pressButton' : 'stand'), expr: mash ? 'determined' : 'awkward', bob: mash ? Math.abs(Math.sin(t * 25)) * 0.02 : 0, tilt: mash ? Math.sin(t * 22) * 0.05 : 0 });
    panelCam(ctx, mash ? 1 : 0); ctx.shake = mash ? 0.35 : 0;
  });
  fx(T(25, 'open'), 'button', 0.7); fx(T(25, 'close'), 'button', 0.7); fx(T(25, 'every') + 0.1, 'button_mash', 0.75, { dur: PE(25) - T(25, 'every') + 0.2 });
  pop(T(25, 'single'), PE(25) + 0.4, 'EVERY. SINGLE.\nBUTTON.', { size: 92, y: 0.3, x: 0.62, colors: ['#ffffff', '#ffd34d'], sfx: false });
  // P26 password
  cut(PS(26) - 0.1, 'building', ['alex', 'you'], ctx => {
    E(ctx, { lit: [] }); act(ctx, 'you', { pos: [-0.5, 0, 0.62], rot: -0.62, pose: 'pressBoth' });
    act(ctx, 'alex', { pos: STAND_ALEX, rot: -0.55, expr: ctx.t > T(26, 'password') ? 'smile' : 'bored', pose: 'armsCrossed', head: { roll: 0.06 } });
    cu(ctx, 'alex', { dist: 1.45, yaw: 0.1, push: 0.15 });
  });
  cut(PS(27) - 0.1, 'building', ['you'], ctx => {
    const t = ctx.t; E(ctx);
    act(ctx, 'you', { pos: [-0.5, 0, 0.62], rot: -0.4, poseMix: { a: 'pressBoth', b: 'stand', u: ease.inOut(range(t, PS(27), T(27, 'okay'))) }, expr: 'embarrassed' });
    cu(ctx, 'you', { yaw: 0.45, dist: 1.6, push: 0.15 });
  });
  pill(T(27, 'great'), PE(27) + 0.4, 'GREAT START', 0.5, 0.775, { icon: 'check' });
  fx(T(27, 'great'), 'sad_trombone', 0.35);
  // P28 Alex presses the bell
  cut(PS(28) - 0.1, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t, r = T(28, 'reaches'), pr = T(28, 'presses');
    E(ctx, { lit: t > pr + 0.3 && t < T(28, 'crackle') ? ['BELL'] : [] }); ctx.S.cutFront = true;
    const u = ease.inOut(range(t, r, pr + 0.2));
    act(ctx, 'alex', { pos: [lerp(0.72, -0.5, u), 0, lerp(-0.62, 0.62, u)], rot: lerp(-0.3, -0.62, u), walk: { phase: t * 8, amt: u > 0 && u < 1 ? 0.7 : 0 }, poseMix: tp(t, pr, 'stand', 'pressButton', 0.3), expr: 'neutral' });
    act(ctx, 'you', { pos: [lerp(-0.5, 0.15, u), 0, lerp(0.62, 0.0, u)], rot: lerp(-0.62, -0.9, u), expr: 'awkward', pose: 'stand' });
    dolly(ctx, [[0.6, 1.6, 4.2], [-0.2, 1.3, 0], 34], [[0.2, 1.6, 3.8], [-0.4, 1.3, 0], 34]);
  });
  fx(T(28, 'presses') + 0.3, 'alarm_bell', 0.45); fx(T(28, 'crackle'), 'static', 0.6, { dur: 1.4 });
  cut(T(28, 'bored') - 0.15, 'office', ['maint'], ctx => {
    act(ctx, 'maint', { pos: [0, 0.0, -0.25], rot: 0, pose: 'sitChair', expr: 'bored', head: { roll: 0.15, pitch: 0.1 } });
    dolly(ctx, [[0.9, 1.5, 2.3], [0, 1.2, -0.6], 36], [[0.7, 1.45, 1.9], [0, 1.25, -0.6], 34]);
  });
  pill(T(28, 'bored'), PS(30) - 0.2, 'BUILDING MAINTENANCE', 0.5, 0.775, { icon: 'bolt' });
  // P29 maintenance voice (office)
  cut(PS(29) - 0.1, 'office', ['maint'], ctx => {
    act(ctx, 'maint', { pos: [0, 0, -0.25], rot: 0, pose: 'sitChair', expr: 'bored', head: { roll: 0.12 } });
    cu(ctx, 'maint', { dist: 1.5, yaw: -0.25, dy: 0.02 });
  });
  // P30 Alex answers
  cut(PS(30) - 0.1, 'building', ['you', 'alex'], ctx => {
    E(ctx); act(ctx, 'alex', { pos: [-0.5, 0, 0.62], rot: -0.62, pose: 'stand', expr: 'neutral', head: { pitch: -0.1 } }); act(ctx, 'you', { pos: [0.15, 0, 0.0], rot: -0.9, expr: 'awkward' });
    drift(ctx, [-0.95, 1.85, 2.9], [-0.35, 1.7, 0.4], 36); ctx.S.cutFront = true;
  });
  cut(PS(31) - 0.1, 'office', ['maint'], ctx => {
    const t = ctx.t, ty = T(31, 'typing');
    act(ctx, 'maint', { pos: [0, 0, -0.25], rot: 0, pose: 'sitChair', expr: 'bored', bob: t > ty ? Math.abs(Math.sin(t * 22)) * 0.008 : 0 });
    if (t > ty) { cast.maint.arms.L.el.rotation.x -= Math.abs(Math.sin(t * 20)) * 0.15; cast.maint.arms.R.el.rotation.x -= Math.abs(Math.sin(t * 23 + 1)) * 0.15; }
    dolly(ctx, [[-0.4, 1.7, 1.2], [0, 1.25, -1.3], 40], [[-0.2, 1.55, 0.6], [0, 1.3, -1.4], 36]);
  });
  fx(T(31, 'typing') - 0.1, 'typing', 0.7, { dur: 1.6 });
  pill(T(31, 'then'), PS(32) + 1.0, 'TECH ETA: 2:00:00', 0.5, 0.775, { icon: 'clock' });
  cut(PS(32) - 0.1, 'office', ['maint'], ctx => {
    act(ctx, 'maint', { pos: [0, 0, -0.25], rot: 0, pose: 'sitChair', expr: 'bored', head: { yaw: 0.2 } });
    cu(ctx, 'maint', { dist: 1.7, yaw: 0.3 });
  });
  // P33 two HOURS?
  cut(PS(33) - 0.15, 'building', ['you', 'alex'], ctx => {
    E(ctx); ctx.S.cutFront = true;
    act(ctx, 'you', { pos: [-0.15, 0, 0.1], rot: 0.3, expr: 'shocked', pose: 'handsFace' }); act(ctx, 'alex', { pos: [-0.75, 0, 0.55], rot: 0.9, expr: 'shocked', pose: 'scared' });
    dolly(ctx, [[-0.3, 1.5, 3.6], [-0.4, 1.4, 0.2], 36], [[-0.35, 1.5, 2.7], [-0.4, 1.45, 0.2], 32], ease.out);
    ctx.shake = pulse(ctx.t, PS(33), PS(33) + 0.4) * 0.6;
  });
  pop(T(33, 'hours') - 0.05, PE(33) + 0.6, '2 HOURS?!', { size: 150, rot: -5, colors: ['#ffffff', '#ff4f5e'], snd: 'sting_dun' });
  mood(PS(33), 'none');
  cut(PS(34) - 0.1, 'office', ['maint'], ctx => {
    const t = ctx.t; act(ctx, 'maint', { pos: [0, 0, -0.25], rot: 0, pose: t > T(34, 'click') - 0.2 ? 'pressButton' : 'sitChair', expr: 'bored' });
    dolly(ctx, [[0.9, 1.5, 2.3], [0, 1.2, -0.6], 36], [[0.8, 1.45, 2.0], [0, 1.2, -0.6], 34]);
  });
  fx(T(34, 'click'), 'intercom_click', 0.9);
  // P35 stare at speaker
  mood(PS(35), 'awkward', 0.7);
  cut(PS(35) - 0.1, 'building', ['you', 'alex'], ctx => {
    E(ctx); act(ctx, 'you', { pos: [-0.3, 0, 0.3], rot: -0.7, expr: 'soulless', idle: 0.3, head: { pitch: -0.15 } }); act(ctx, 'alex', { pos: [0.4, 0, -0.5], rot: -0.4, expr: 'awkward' });
    drift(ctx, [-1.05, 1.75, 2.9], [-0.3, 1.75, 0.3], 36); ctx.S.cutFront = true;
  });
  pill(T(35, 'two'), T(35, 'metal'), '02:00:00', 0.5, 0.775, { icon: 'clock' });
  cut(T(35, 'metal') - 0.1, 'building', ['you', 'alex'], ctx => {
    E(ctx); ctx.S.cutFront = true; ctx.S.noCut = false; act(ctx, 'you', { pos: [-0.3, 0, 0.3], rot: 0.3, expr: 'awkward' }); act(ctx, 'alex', { pos: [0.4, 0, -0.5], rot: -0.4, expr: 'awkward' });
    dolly(ctx, [[2.2, 4.4, 6.0], [0, 1.2, 0], 34], [[2.8, 5.2, 7.2], [0, 1.2, 0], 34]);
  });
  pill(T(35, 'metal'), T(35, 'crush'), 'METAL BOX', 0.5, 0.775, { icon: 'x' });
  cut(T(35, 'crush') - 0.1, 'building', ['alex'], ctx => {
    E(ctx); act(ctx, 'alex', { pos: [0.4, 0, -0.5], rot: -0.4, expr: 'neutral', head: { roll: 0.05 } }); cu(ctx, 'alex', { dist: 1.6, push: 0.25 });
  });
  pill(T(35, 'crush'), PE(35) + 0.3, 'YOUR CRUSH', 0.5, 0.775, { icon: 'heart' }); fx(T(35, 'crush'), 'heartbeat', 0.45);
  // P36 the dream vs reality
  cut(PS(36) - 0.1, 'void', ['you', 'alex'], ctx => {
    voidMode({ trees: true, color: '#c86ad8' });
    act(ctx, 'you', { pos: [-0.55, 0, 0], rot: 0.6, expr: 'love', pose: 'relaxed' }); act(ctx, 'alex', { pos: [0.55, 0, 0], rot: -0.6, expr: 'happy', pose: 'relaxed' });
    const a = lerp(-0.3, 0.3, ctx.u); look(ctx.cam, [Math.sin(a) * 4.6, 1.7, Math.cos(a) * 4.6], [0, 1.2, 0], 36);
  });
  wash(PS(36), T(36, 'definitely'), '#ffb3e6', 0.18);
  ov({ type: 'symbol', t0: PS(36) + 0.2, t1: T(36, 'definitely'), whoA: aw('you', 0.7), sym: 'hearts' });
  card(PS(36) + 0.2, T(36, 'definitely') - 0.1, 'YOUR DAYDREAM');
  fx(PS(36), 'harp_gliss', 0.55);
  cut(T(36, 'definitely') - 0.1, 'building', ['you', 'alex'], ctx => {
    E(ctx); ctx.S.cutFront = true; act(ctx, 'you', { pos: [-0.3, 0, 0.3], rot: 0.2, expr: 'awkward', sweat: 1, look: [0.6, 0] }); act(ctx, 'alex', { pos: [0.4, 0, -0.5], rot: -0.4, expr: 'awkward', look: [-0.6, 0] });
    look(ctx.cam, [0.1, 1.5, 3.7], [0.05, 1.3, -0.1], 34);
  });
  fx(T(36, 'definitely') - 0.05, 'record_scratch', 0.6);
  card(T(36, 'definitely'), PE(36) + 0.5, 'REALITY');

  // ======================================================================== ACT 3 — the silence
  mood(PS(37), 'quirky', 0.7);
  cut(PS(37) - 0.1, 'void', ['you'], ctx => {
    voidMode(); act(ctx, 'you', { pos: [0.8, 0, 0], rot: -0.2, expr: 'determined', pose: 'armsCrossed' });
    dolly(ctx, [[0.4, 1.5, 5.0], [0.4, 1.2, 0], 36], [[0.6, 1.5, 4.4], [0.6, 1.2, 0], 36]);
  });
  cut(PS(38) - 0.1, 'void', ['you'], ctx => {
    const t = ctx.t; voidMode({ color: step(t, [[0, '#4425c8'], [T(38, 'two', 0), '#1c1a5a']]) });
    act(ctx, 'you', { pos: [0.8, 0, 0], rot: -0.4 + Math.sin(t * 1.5) * 0.2, expr: step(t, [[0, 'grin'], [T(38, 'shower'), 'smile'], [T(38, 'bus'), 'grin'], [T(38, 'two'), 'tired']]), pose: step(t, [[0, 'wave'], [T(38, 'shower'), 'point'], [T(38, 'bus'), 'shrug'], [T(38, 'two'), 'stand']]), mouth: 0.3 + 0.3 * Math.sin(t * 11) });
    dolly(ctx, [[0.4, 1.5, 4.8], [0.4, 1.2, 0], 36], [[0.6, 1.5, 4.2], [0.6, 1.2, 0], 36]);
  });
  think(PS(38) + 0.3, T(38, 'shower'), aw('you', 0.95), '"Hey Alex! Nice weather!"', { dx: -120 });
  list(T(38, 'shower'), PE(38) + 0.5, [{ text: 'IN THE SHOWER', icon: 'check', t: T(38, 'shower') }, { text: 'ON THE BUS', icon: 'check', t: T(38, 'bus') }, { text: 'AT 2 A.M.', icon: 'check', t: T(38, 'two') }], 0.06, 0.24, { title: 'REHEARSALS: 847' });
  cut(PS(39) - 0.1, 'void', ['you'], ctx => {
    voidMode({ color: '#3a22a8' }); act(ctx, 'you', { pos: [0, 0, 0], rot: 0, expr: ctx.t > T(39, 'deleted') ? 'dizzy' : 'nervous' });
    dolly(ctx, [[0, 1.5, 3.4], [0, 1.4, 0], 36], [[0, 1.5, 2.8], [0, 1.45, 0], 36]);
  });
  ov({ type: 'deleting', t0: T(39, 'brain') - 0.2, t1: PE(39) + 0.5, x: 0.5, y: 0.36, dur: 2.0 });
  fx(T(39, 'brain'), 'computer_beeps', 0.5); fx(T(39, 'all'), 'error_buzz', 0.55);
  // P40 the silence stretches
  mood(PS(40), 'none');
  cut(PS(40) - 0.1, 'building', ['you', 'alex'], ctx => {
    E(ctx); ctx.S.cutFront = true;
    act(ctx, 'you', { pos: [-0.3, 0, 0.3], rot: 0.05, expr: 'awkward', look: [0.5, -0.3], idle: 0.3 }); act(ctx, 'alex', { pos: [0.55, 0, -0.55], rot: -0.25, expr: 'awkward', look: [-0.5, -0.3], idle: 0.3 });
    dolly(ctx, [[0.1, 1.5, 4.4], [0.1, 1.25, -0.2], 34], [[0.1, 1.5, 3.2], [0.1, 1.3, -0.2], 34], ease.linear);
  });
  ov({ type: 'counter', t0: PS(40) + 0.2, t1: PE(40) + 0.6, x: 0.72, y: 0.14, size: 64, box: true, text: t => `${step(t, [[0, 0], [T(40, 'five'), 5], [T(40, 'ten'), 10], [T(40, 'thirty'), 30]])} SEC` });
  fx(PS(40), 'crickets', 0.45, { dur: 5.4 }); ['five', 'ten', 'thirty'].forEach(w => fx(T(40, w), 'clock_tick', 0.6));
  cut(PS(41) - 0.1, 'building', ['you'], ctx => {
    E(ctx); act(ctx, 'you', { pos: [-0.3, 0, 0.3], rot: 0.1, expr: 'nervous', sweat: 1 }); cu(ctx, 'you', { dist: 1.25, push: 0.3, fov: 34 });
  });
  think(PS(41) + 0.1, PE(42), aw('you', 0.9), 'say something!!', { dx: -260, dy: -110, seed: 1 });
  think(T(41, 'anything') - 0.1, PE(42), aw('you', 0.9), 'ANYTHING!', { dx: 240, dy: -60, seed: 2 });
  think(T(41, 'anything') + 0.4, PE(42), aw('you', 0.9), 'words??', { dx: -200, dy: 120, seed: 3, size: 26 });
  fx(PS(41) + 0.1, 'pop', 0.4); fx(T(41, 'anything') - 0.1, 'pop', 0.4); fx(T(41, 'anything') + 0.4, 'pop', 0.35);
  cut(PS(42) - 0.05, 'building', ['you'], ctx => {
    E(ctx); act(ctx, 'you', { pos: [-0.3, 0, 0.3], rot: 0.1, expr: 'nervous', mouth: ease.inOut(range(ctx.t, PS(42), PE(42))) * 0.7 }); cu(ctx, 'you', { dist: 1.0, push: 0.35, fov: 30, up: -0.12 });
  });
  fx(PS(42), 'riser_short', 0.45);
  cut(PS(43) - 0.1, 'building', ['you', 'alex'], ctx => {
    E(ctx); act(ctx, 'you', { pos: [-0.3, 0, 0.3], rot: 0.6, expr: 'grin', pose: 'shrug', head: { roll: -0.08 } }); act(ctx, 'alex', { pos: [0.55, 0, -0.55], rot: -0.6, expr: 'neutral' });
    cu(ctx, 'you', { dist: 1.7, yaw: 0.3 });
  });
  cut(PS(44) - 0.1, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t; E(ctx); act(ctx, 'you', { pos: [-0.3, 0, 0.3], rot: 0.6 }); act(ctx, 'alex', { pos: [0.55, 0, -0.55], rot: -0.6, expr: t > T(44, 'yeah') ? 'awkward' : 'neutral', forceBlink: t > T(44, 'blinks') && t < T(44, 'blinks') + 0.15 });
    cu(ctx, 'alex', { dist: 1.5, yaw: -0.15 });
  });
  fx(T(44, 'blinks'), 'blink', 0.6);
  fx(PE(44) + 0.1, 'crickets', 0.35, { dur: 0.8 });
  // P45 sink through the floor
  cut(PS(45) - 0.1, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t; E(ctx); ctx.S.cutFront = true; const sk = T(45, 'sink'), un = T(45, 'unfortunately');
    const y = t < un ? -ease.inOut(range(t, sk, sk + 1.2)) * 0.9 : -0.9 + ease.outBack(range(t, un + 0.1, un + 0.5)) * 0.9;
    act(ctx, 'you', { pos: [-0.3, y, 0.3], rot: 0.1, expr: t < un ? 'embarrassed' : 'shocked', shadow: y > -0.1 }); act(ctx, 'alex', { pos: [0.55, 0, -0.55], rot: -0.3, expr: 'awkward' });
    look(ctx.cam, [-0.1, 1.3, 3.6], [-0.1, 1.0, -0.1], 36);
  });
  fx(T(45, 'sink'), 'slide_down', 0.55); fx(T(45, 'unfortunately') + 0.15, 'boing', 0.6);
  pill(T(45, 'floor', 1), PE(45) + 0.3, 'THE FLOOR: 1 JOB', 0.5, 0.775, { icon: 'check' });
  // P46 phone out
  cut(PS(46) - 0.1, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t; E(ctx); const pu = T(46, 'pull');
    props(ctx, { phoneYou: t > pu + 0.3 });
    act(ctx, 'you', { pos: [-0.3, 0, 0.3], rot: 0.15, poseMix: tp(t, pu, 'stand', 'phone', 0.45), expr: 'awkward', head: { pitch: 0.35 } }); act(ctx, 'alex', { pos: [0.55, 0, -0.55], rot: -0.3, expr: 'neutral', head: { yaw: -0.3 } });
    dolly(ctx, [[-0.9, 1.6, 1.2], [-0.25, 1.3, 0.3], 40], [[-0.85, 1.55, 1.0], [-0.25, 1.35, 0.3], 36]);
  });
  pill(T(46, 'look'), PE(46) + 0.3, 'LOOK BUSY', 0.5, 0.775, { icon: 'bolt' });
  // P47–58 phone UI
  const tSend = T(50, 'send'), tDie = T(57, 'dies');
  const chat = {
    type: 'phone', dx: 430, sc: 0.9, buzzAt: [T(50, 'buzzes'), PS(52), PS(54)], t0: PS(47) - 0.3, t1: T(58, 'reflection') - 0.2, battery: t => t < T(57, 'start') ? 4 : t < tDie - 0.5 ? 2 : 1, signal: 1, contact: 'Jay (Bestie)',
    messages: [{ from: 'me', text: 'stuck in elevator. with Alex', t: tSend }, { from: 'them', text: 'What.', t: PS(51) - 0.05 }, { from: 'them', text: 'O M G', big: true, t: PS(53) - 0.05 }, { from: 'them', text: 'DO NOT be weird.', t: PS(55) - 0.05 }],
    typing: [{ t0: T(49, 'stuck'), t1: tSend - 0.1, text: 'stuck in elevator. with Alex' }, { t0: T(57, 'typing'), t1: tDie + 0.3, text: 'too late lol' }],
    warnAt: T(47, 'four') + 0.2, deadAt: tDie,
  };
  // warn dialog only briefly
  chat.warnAt = T(47, 'four'); const warnEnd = PE(48) + 0.2;
  ov({ ...chat, warnAt: undefined, t1: PS(56) - 0.1 });
  ov({ type: 'custom', t0: T(47, 'four'), t1: warnEnd, draw: (c, t) => { const a = Math.min(1, (t - T(47, 'four')) / 0.25, (warnEnd - t) / 0.25); c.save(); c.globalAlpha = a; c.fillStyle = 'rgba(25,16,45,0.94)'; c.beginPath(); c.roundRect(960 - 200, 470, 400, 160, 30); c.fill(); c.fillStyle = '#ff4f5e'; c.font = 'bold 36px Fredoka'; c.textAlign = 'center'; c.fillText('Low Battery', 960, 535); c.fillStyle = '#fff'; c.font = '26px Fredoka'; c.fillText('4% remaining', 960, 585); c.restore(); } });
  cut(PS(47) - 0.3, 'building', ['you'], ctx => { E(ctx); props(ctx, { phoneYou: true }); act(ctx, 'you', { pos: [-0.3, 0, 0.3], rot: 0.15, pose: 'phone', expr: 'awkward', head: { pitch: 0.35 } }); cu(ctx, 'you', { dist: 1.25, yaw: 0.3, up: -0.25, lx: 0.62 }); });
  pill(T(47, 'bar'), T(47, 'four'), 'SIGNAL: 1 BAR', 0.73, 0.22, { icon: 'x' }); pill(T(47, 'four'), PE(48) + 0.2, 'BATTERY: 4%', 0.73, 0.3, { icon: 'x' });
  fx(T(47, 'four'), 'low_battery', 0.5);
  [T(49, 'stuck')].forEach(t0 => fx(t0, 'phone_typing', 0.6, { dur: tSend - t0 - 0.1 }));
  fx(tSend, 'msg_send', 0.7);
  fx(T(50, 'buzzes'), 'phone_buzz', 0.8); fx(PS(51) - 0.05, 'msg_pop', 0.7);
  fx(PS(52), 'phone_buzz', 0.7); fx(PS(53) - 0.05, 'msg_pop', 0.75);
  fx(PS(54), 'phone_buzz', 0.7); fx(PS(55) - 0.05, 'msg_pop', 0.8);
  cut(PS(56) - 0.1, 'building', ['you', 'alex'], ctx => {
    E(ctx); props(ctx, { phoneYou: true }); act(ctx, 'you', { pos: [-0.3, 0, 0.3], rot: 0.15, pose: 'phone', expr: 'awkward', head: { pitch: 0.2 }, sweat: 1 }); act(ctx, 'alex', { pos: [0.55, 0, -0.55], rot: -0.6, expr: 'neutral', look: [-0.6, 0] });
    look(ctx.cam, [-0.2, 1.75, 1.15], [0.1, 1.45, -0.3], 44);
  });
  ov({ ...chat, t0: T(57, 'start') - 0.2, t1: T(58, 'reflection') - 0.2, messages: chat.messages, dx: 0 });
  fx(T(57, 'typing'), 'phone_typing', 0.55, { dur: tDie - T(57, 'typing') });
  fx(tDie, 'power_down', 0.8);
  pop(tDie + 0.05, PE(57) + 0.6, 'DEAD.', { size: 120, y: 0.82, colors: ['#ffffff', '#9aa0b8'], sfx: false });
  cut(T(57, 'start') - 0.2, 'building', ['you'], ctx => { E(ctx); props(ctx, { phoneYou: true }); act(ctx, 'you', { pos: [-0.3, 0, 0.3], rot: 0.15, pose: 'phone', expr: 'nervous', head: { pitch: 0.35 } }); cu(ctx, 'you', { dist: 1.25, yaw: 0.3, up: -0.25, lx: 0.62 }); });
  // P58 reflection in black glass
  cut(T(58, 'reflection') - 0.2, 'building', ['you'], ctx => {
    E(ctx); props(ctx, { phoneYou: false }); act(ctx, 'you', { pos: [-0.3, 0, 0.3], rot: 0, expr: ctx.t > T(58, 'exactly') ? 'shocked' : 'nervous', head: { pitch: 0.2 }, idle: 0.2 });
    cu(ctx, 'you', { dist: 1.15, fov: 34, push: 0.12, up: -0.08 });
  });
  ov({ type: 'glass', t0: T(58, 'reflection') - 0.2, t1: PE(58) + 0.4, dark: 0.5 });
  pop(T(58, 'exactly'), PE(58) + 0.4, 'PANIC.', { size: 120, y: 0.78, colors: ['#ffffff', '#ff6b9a'], sfx: false });
  fx(T(58, 'exactly'), 'sting_shock', 0.5);
  // P59-61 Alex's phone
  mood(PS(59), 'awkward', 0.6);
  cut(PS(59) - 0.15, 'building', ['you', 'alex'], ctx => {
    E(ctx); act(ctx, 'alex', { pos: [0.55, 0, -0.55], rot: -0.55, expr: 'neutral', look: [-0.7, 0] }); act(ctx, 'you', { pos: [-0.3, 0, 0.3], rot: 0.5, expr: 'nervous' });
    cu(ctx, 'alex', { dist: 1.5, yaw: -0.1 });
  });
  cut(PS(60) - 0.1, 'building', ['you'], ctx => {
    E(ctx); act(ctx, 'you', { pos: [-0.3, 0, 0.3], rot: 0.5, expr: 'sad', head: { pitch: 0.18 * Math.max(0, Math.sin(range(ctx.t, PS(60), PE(60) + 0.2) * Math.PI * 2)) } });
    cu(ctx, 'you', { dist: 1.45, yaw: -0.25 });
  });
  cut(PS(61) - 0.1, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t; E(ctx); props(ctx, { phoneAlex: t < T(61, 'guess') });
    act(ctx, 'alex', { pos: [0.55, 0, -0.55], rot: -0.55, pose: t < T(61, 'guess') ? 'holdOut' : 'stand', expr: t < T(61, 'guess') ? 'awkward' : 'smile' }); act(ctx, 'you', { pos: [-0.3, 0, 0.3], rot: 0.5, expr: 'nervous' });
    ctx.S.cutFront = true; dolly(ctx, [[0.3, 1.55, 3.4], [0.15, 1.3, -0.2], 34], [[0.4, 1.55, 2.9], [0.25, 1.35, -0.25], 32]);
  });
  pill(T(61, 'two'), T(61, 'guess'), "ALEX'S PHONE: 2%", 0.5, 0.775, { icon: 'x' });
  // P62 heart pounding
  cut(PS(62) - 0.1, 'building', ['you'], ctx => {
    E(ctx); act(ctx, 'you', { pos: [-0.3, 0, 0.3], rot: 0.5, expr: ctx.t > T(62, 'heart') ? 'love' : 'surprised', blush: 1, bob: ctx.t > T(62, 'heart') ? Math.max(0, Math.sin(ctx.t * 17)) * 0.01 : 0 });
    cu(ctx, 'you', { dist: 1.3, yaw: -0.3, push: 0.2 });
  });
  ov({ type: 'ecg', t0: T(62, 'heart') - 0.2, t1: PE(62) + 0.5, x: 0.72, y: 0.12, bpm: t => lerp(90, 178, range(t, T(62, 'heart'), PE(62))) });
  { let t = T(62, 'heart'); while (t < PE(62) + 0.3) { fx(t, 'heartbeat', 0.55); t += 60 / lerp(90, 178, range(t, T(62, 'heart'), PE(62))); } }
  pill(PS(62) + 0.1, T(62, 'two'), 'JUST US', 0.5, 0.775, { icon: 'heart' });

  // ======================================================================== ACT 4 — the body betrays you
  card(PS(63), PS(64), '10 MINUTES IN');
  fx(PS(63), 'whoosh_low', 0.4);
  cut(PS(63) - 0.1, 'building', ['you', 'alex'], ctx => {
    E(ctx); ctx.S.cutFront = true; act(ctx, 'you', { pos: [-0.75, 0, 0.1], rot: 0.1, expr: 'awkward', pose: 'stand', idle: 0.2 }); act(ctx, 'alex', { pos: [0.85, 0, -0.65], rot: -0.2, expr: 'awkward', pose: 'armsCrossed', idle: 0.2 });
    dolly(ctx, [[0, 1.6, 4.6], [0, 1.2, -0.2], 34], [[0, 1.6, 4.0], [0, 1.2, -0.2], 34]);
  });
  pop(T(63, 'loud'), PE(63) + 0.5, 'LOUD.', { size: 160, colors: ['#ffffff', '#c9b8ff'], snd: 'tinnitus' });
  cut(PS(64) - 0.1, 'building', ['you'], ctx => {
    const t = ctx.t; E(ctx); const br = T(64, 'breathing'), wd = T(64, 'weird');
    const rate = t < wd ? 3.2 : 7.5; const amp = t < wd ? 0.012 : 0.022;
    act(ctx, 'you', { pos: [-0.75, 0, 0.1], rot: 0.1, expr: t > T(64, 'worse') ? 'dizzy' : t > br ? 'nervous' : 'awkward', bob: t > br ? Math.sin(t * rate) * amp : 0, mouth: t > br ? 0.2 + 0.2 * Math.sin(t * rate) : 0, sweat: t > wd ? 1 : 0 });
    cu(ctx, 'you', { dist: 1.3, push: 0.35, fov: 34 });
  });
  ov({ type: 'meter', t0: T(64, 'breathing') - 0.1, t1: PE(64) + 0.4, label: 'BREATHING VOLUME', x: 0.39, y: 0.14, w: 420, value: t => range(t, T(64, 'breathing'), PE(64)) * 1.0, icon: 'bolt', c0: '#8fd6ff', c1: '#ff4f5e' });
  { const b0 = T(64, 'breathing'), w0 = T(64, 'weird'); for (let t = b0; t < PE(64); t += t < w0 ? 1.9 : 0.85) fx(t, t < w0 ? 'breath_in' : 'breath_fast', t < w0 ? 0.3 : 0.38); }
  pop(T(64, 'worse'), PE(64) + 0.5, 'WORSE.', { size: 120, y: 0.74, colors: ['#ffffff', '#ff4f5e'] });
  cut(PS(65) - 0.1, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t; E(ctx);
    const ps = [[0, 'stand', 'stand'], [T(65, 'pockets'), 'stand', 'pockets'], [T(65, 'out'), 'pockets', 'shrug'], [T(65, 'cross'), 'shrug', 'armsCrossed']];
    let cur = ps[0]; for (const p of ps) if (t >= p[0] - 0.15) cur = p;
    act(ctx, 'you', { pos: [-0.5, 0, 0.1], rot: 0.15, poseMix: tp(t, cur[0] - 0.15, cur[1], cur[2], 0.3), expr: 'awkward', look: [0, 0.4] }); act(ctx, 'alex', { pos: [0.85, 0, -0.65], rot: -0.35, expr: 'neutral', head: { yaw: -0.4 }, look: [-0.7, 0] });
    drift(ctx, [-0.35, 1.25, 2.9], [-0.25, 1.05, 0], 38); ctx.S.cutFront = true;
  });
  [['pockets', 'POCKETS?'], ['out', 'OUT?'], ['cross', 'CROSSED?']].forEach(([w, s], i) => { pill(T(65, w), PE(65) + 0.4, s, 0.2 + i * 0.3, 0.2, { icon: i === 2 ? 'q' : 'x' }); fx(T(65, w), 'cloth', 0.45); });
  cut(PS(66) - 0.1, 'building', ['you'], ctx => {
    E(ctx); act(ctx, 'you', { pos: [-0.5, 0, 0.1], rot: 0, pose: 'stand', expr: 'nervous', sweat: 1, idle: 0, aL: 0 });
    cast.you.arms.L.sh.rotation.z = 0.05; cast.you.arms.R.sh.rotation.z = -0.05; cast.you.arms.L.el.rotation.x = 0; cast.you.arms.R.el.rotation.x = 0;
    dolly(ctx, [[-0.5, 1.2, 2.3], [-0.5, 1.05, 0.1], 38], [[-0.5, 1.2, 2.6], [-0.5, 1.05, 0.1], 40]);
  });
  pop(T(66, 'hard'), PE(66) + 0.4, 'SO HARD?!', { size: 110, x: 0.7, y: 0.3, rot: 5 });
  // P67-72 stomach growl
  mood(PS(67), 'none');
  cut(PS(67) - 0.1, 'building', ['you'], ctx => {
    E(ctx); act(ctx, 'you', { pos: [-0.5, 0, 0.1], rot: 0, pose: 'stand', expr: 'awkward', idle: 0.2 });
    dolly(ctx, [[-0.5, 1.4, 2.0], [-0.5, 1.2, 0.1], 40], [[-0.5, 1.0, 1.15], [-0.5, 0.95, 0.1], 36], ease.inOut);
  });
  fx(PS(67), 'suspense_hit', 0.4);
  cut(PS(68) - 0.1, 'building', ['you'], ctx => {
    E(ctx); act(ctx, 'you', { pos: [-0.5, 0, 0.1], rot: 0, pose: 'stand', expr: 'shocked', tilt: Math.sin(ctx.t * 30) * 0.01 });
    look(ctx.cam, [-0.5, 0.95, 1.0], [-0.5, 0.9, 0.1], 36); ctx.shake = 0.15;
  });
  fx(T(68, 'growls') - 0.15, 'stomach_growl', 0.9);
  ov({ type: 'custom', t0: T(68, 'growls'), t1: PE(69) + 0.3, draw: (c, t) => { for (let i = 0; i < 3; i++) { const p = ((t - T(68, 'growls')) * 0.8 + i / 3) % 1; c.save(); c.globalAlpha = (1 - p) * 0.8; c.strokeStyle = '#ffffff'; c.lineWidth = 6; c.beginPath(); c.arc(960, 560, 80 + p * 420, 0, Math.PI * 2); c.stroke(); c.restore(); } } });
  cut(PS(69) - 0.1, 'building', ['you', 'alex'], ctx => {
    E(ctx); ctx.S.cutFront = true; act(ctx, 'you', { pos: [-0.5, 0, 0.1], rot: 0, pose: 'coverFace', expr: 'embarrassed' }); act(ctx, 'alex', { pos: [0.85, 0, -0.65], rot: -0.5, expr: 'surprised', look: [-0.7, 0] });
    look(ctx.cam, [0.1, 1.55, 3.8], [0.1, 1.25, -0.2], 34);
  });
  list(PS(69), PE(69) + 0.4, [{ text: 'A SMALL GROWL', icon: 'x', t: PS(69) }, { text: 'A POLITE RUMBLE', icon: 'x', t: T(69, 'polite') }], 0.06, 0.2);
  fx(PS(69) + 0.4, 'stomach_growl2', 0.55);
  cut(PS(70) - 0.15, 'void', [], ctx => {
    voidMode({ whale: true, color: '#1d4fc8' }); whale.rotation.y = 0.3 + ctx.u * 0.3; whale.position.y = 1.8 + Math.sin(ctx.t * 1.5) * 0.15;
    dolly(ctx, [[0, 2.0, 8.5], [0, 1.8, -1.5], 40], [[0, 2.0, 7.0], [0, 1.8, -1.5], 40]);
  });
  fx(PS(70), 'whale', 0.7);
  pop(T(70, 'whale'), PE(70) + 0.4, 'WHALE?!', { size: 140, y: 0.72, colors: ['#bdf6ff', '#4fa3ff'], sfx: false });
  cut(PS(71) - 0.1, 'building', ['you', 'alex'], ctx => {
    E(ctx); ctx.S.cutFront = true; act(ctx, 'you', { pos: [-0.5, 0, 0.1], rot: 0, pose: 'coverFace', expr: 'embarrassed' }); act(ctx, 'alex', { pos: [0.85, 0, -0.65], rot: -0.5, expr: 'surprised' });
    dolly(ctx, [[1.6, 3.4, 5.4], [0, 1.2, 0], 36], [[2.0, 4.2, 6.6], [0, 1.2, 0], 36]);
  });
  fx(PS(71), 'echo_growl', 0.45);
  ov({ type: 'custom', t0: PS(71), t1: PE(71) + 0.3, draw: (c, t) => { for (let i = 0; i < 4; i++) { const p = ((t - PS(71)) * 0.6 + i / 4) % 1; c.save(); c.globalAlpha = (1 - p) * 0.5; c.strokeStyle = '#ffffff'; c.lineWidth = 5; c.beginPath(); c.arc(870, 600, 60 + p * 500, 0, Math.PI * 2); c.stroke(); c.restore(); } } });
  cut(PS(72) - 0.1, 'building', ['you'], ctx => {
    E(ctx); act(ctx, 'you', { pos: [-0.5, 0, 0.1], rot: 0, pose: 'stand', expr: ctx.t > T(72, 'accept') ? 'content' : 'wince', idle: 0.3 }); cu(ctx, 'you', { dist: 1.4, push: 0.15 });
  });
  ov({ type: 'meter', t0: T(72, 'accept') - 0.2, t1: PE(72) + 0.5, label: 'ACCEPTING FATE…', x: 0.39, y: 0.16, w: 420, value: t => ease.out(range(t, T(72, 'accept'), PE(72))), icon: 'check', c0: '#b8a8ff', c1: '#6c4cf0' });
  // P73-79 Alex laughs, granola
  mood(PS(73), 'playful', 0.75);
  cut(PS(73) - 0.1, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t, lg = T(73, 'laughing'); E(ctx); act(ctx, 'alex', { pos: [0.85, 0, -0.65], rot: -0.5, expr: t > lg - 0.3 ? 'laugh' : 'surprised', pose: t > lg ? 'handsFace' : 'stand', bob: t > lg ? Math.abs(Math.sin(t * 14)) * 0.02 : 0 }); act(ctx, 'you', { pos: [-0.5, 0, 0.1], rot: 0.3 });
    cu(ctx, 'alex', { dist: 1.6, yaw: -0.1 });
  });
  cut(PS(74) - 0.1, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t; E(ctx); ctx.S.cutFront = true; act(ctx, 'alex', { pos: [0.85, 0, -0.65], rot: -0.5, expr: 'laugh', pose: 'scared', lean: 0.3 + Math.sin(t * 12) * 0.05, bob: Math.abs(Math.sin(t * 14)) * 0.03 }); act(ctx, 'you', { pos: [-0.5, 0, 0.1], rot: 0.4, expr: 'embarrassed' });
    look(ctx.cam, [0.2, 1.55, 3.4], [0.2, 1.25, -0.25], 34);
  });
  pop(T(74, 'real'), PE(74) + 0.4, 'A REAL ONE.', { size: 104, y: 0.26, colors: ['#ffffff', '#ffd34d'] });
  cut(PS(75) - 0.1, 'building', ['you', 'alex'], ctx => {
    E(ctx); act(ctx, 'alex', { pos: [0.85, 0, -0.65], rot: -0.6, expr: 'grin' }); act(ctx, 'you', { pos: [-0.5, 0, 0.1], rot: 0.5, expr: 'embarrassed' });
    cu(ctx, 'alex', { dist: 1.7, yaw: -0.2 });
  });
  cut(PS(76) - 0.1, 'building', ['you', 'alex'], ctx => {
    E(ctx); act(ctx, 'alex', { pos: [0.85, 0, -0.65], rot: -0.6, expr: 'smile' }); act(ctx, 'you', { pos: [-0.5, 0, 0.1], rot: 0.5, expr: 'embarrassed', pose: 'handsFace' });
    cu(ctx, 'you', { dist: 1.6, yaw: 0.25 });
  });
  cut(PS(77) - 0.1, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t; E(ctx); ctx.S.cutFront = true; const uz = T(77, 'unzips'), pu = T(77, 'pulls'), br = T(77, 'breaks'), ha = T(77, 'hands');
    const walkU = ease.inOut(range(t, ha - 0.6, ha + 0.2));
    props(ctx, { bar: t > pu && t < br, halfAlex: t > br, halfYou: t > ha + 0.5 });
    if (cast.alex.props.half) cast.alex.props.half.visible = t > br && t < ha + 0.5;
    act(ctx, 'alex', { pos: [lerp(0.85, 0.4, walkU), 0, lerp(-0.65, -0.2, walkU)], rot: -0.6 - walkU * 0.4, poseMix: t < br ? tp(t, uz, 'stand', 'holdOut', 0.4) : t < ha ? tp(t, br, 'holdOut', 'phoneBoth', 0.2) : tp(t, ha, 'phoneBoth', 'holdOut', 0.3), expr: 'smile' });
    act(ctx, 'you', { pos: [-0.5, 0, 0.1], rot: 0.6, poseMix: tp(t, ha + 0.2, 'stand', 'holdOut', 0.35), expr: t > ha ? 'surprised' : 'awkward' });
    dolly(ctx, [[0.2, 1.4, 3.0], [0.15, 1.15, -0.2], 36], [[0.1, 1.35, 2.5], [0.0, 1.15, -0.1], 34]);
  });
  fx(T(77, 'unzips'), 'zipper', 0.7); fx(T(77, 'pulls'), 'wrapper', 0.6); fx(T(77, 'breaks'), 'snap', 0.8); fx(T(77, 'hands'), 'whoosh_small', 0.35);
  cut(PS(78) - 0.1, 'building', ['you'], ctx => {
    E(ctx); props(ctx, { halfYou: true }); act(ctx, 'you', { pos: [-0.5, 0, 0.1], rot: 0.6, pose: 'holdOut', expr: ctx.t > T(78, 'crush') ? 'love' : 'surprised', head: { pitch: 0.15 } });
    cu(ctx, 'you', { dist: 1.4, yaw: 0.05, push: 0.25 });
  });
  ov({ type: 'symbol', t0: T(78, 'crush'), t1: PE(78) + 0.5, whoA: aw('you', 0.7), sym: 'hearts' }); fx(T(78, 'shared'), 'sparkle', 0.6);
  pop(T(78, 'shared'), PE(78) + 0.4, 'SHARED FOOD', { size: 90, y: 0.78, colors: ['#ffffff', '#ff7eb6'] });
  mood(PS(79), 'tender', 0.75);
  cut(PS(79) - 0.1, 'building', ['you'], ctx => {
    const t = ctx.t; E(ctx); props(ctx, { halfYou: t < T(79, 'best') });
    const bite = Math.max(0, Math.sin((t - PS(79)) * 2.2));
    act(ctx, 'you', { pos: [-0.5, 0, 0.1], rot: 0.3, poseMix: { a: 'holdOut', b: 'handsFace', u: bite * 0.6 }, expr: t > T(79, 'best') ? 'love' : 'content', mouth: bite > 0.5 ? 0.3 : 0 });
    cu(ctx, 'you', { dist: 1.5, yaw: 0.1 });
  });
  list(PS(79), PE(79) + 0.6, [{ text: 'SLIGHTLY CRUSHED', icon: 'check', t: PS(79) + 0.1 }, { text: 'SLIGHTLY STALE', icon: 'check', t: T(79, 'stale') }, { text: 'BEST THING EVER', icon: 'heart', t: T(79, 'best') }], 0.06, 0.22);
  fx(PS(79) + 0.4, 'crunch', 0.5); fx(PS(79) + 3.1, 'crunch', 0.45);

  // ======================================================================== ACT 5 — talking
  cut(PS(80) - 0.1, 'building', ['you', 'alex'], ctx => {
    E(ctx); ctx.S.cutFront = true; act(ctx, 'you', { pos: [-0.5, 0, 0.1], rot: 0.4, expr: 'content' }); act(ctx, 'alex', { pos: [0.6, 0, -0.5], rot: -0.4, expr: 'smile' });
    dolly(ctx, [[0, 1.6, 4.2], [0, 1.2, -0.2], 34], [[0, 1.5, 3.7], [0, 1.2, -0.2], 34]);
  });
  cut(PS(81) - 0.1, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t, as = T(81, 'slides'), ys = T(81, 'you', 0);
    E(ctx); ctx.S.cutFront = true;
    const ua = ease.inOut(range(t, as - 0.2, as + 1.2)), uy = ease.inOut(range(t, ys - 0.1, ys + 1.0));
    act(ctx, 'alex', { pos: [lerp(0.6, SIT_ALEX[0], ua), 0, lerp(-0.5, SIT_ALEX[2], ua)], rot: lerp(-0.4, -0.2, ua), poseMix: { a: 'stand', b: 'sitKnees', u: ua }, expr: 'content' });
    act(ctx, 'you', { pos: [lerp(-0.5, SIT_YOU[0], uy), 0, lerp(0.1, SIT_YOU[2], uy)], rot: lerp(0.4, 0.2, uy), poseMix: { a: 'stand', b: 'sitKnees', u: uy }, expr: 'smile' });
    dolly(ctx, [[0, 1.5, 3.8], [0, 1.0, -0.3], 34], [[0, 1.2, 3.4], [0, 0.85, -0.4], 34]);
  });
  fx(T(81, 'slides'), 'slide_wall', 0.5); fx(T(81, 'sit'), 'sit_thud', 0.45);
  const sitBoth = (ctx, ye = 'smile', ae = 'smile', o = {}) => {
    act(ctx, 'you', { pos: o.youPos || SIT_YOU, rot: o.yr ?? 0.3, pose: o.yp || 'sitKnees', expr: ye, ...(o.you || {}) });
    act(ctx, 'alex', { pos: o.alexPos || SIT_ALEX, rot: o.ar ?? -0.3, pose: o.ap || 'sitKnees', expr: ae, ...(o.alex || {}) });
  };
  const twoSit = (ctx, z = 3.2, fov = 34) => { ctx.S.cutFront = true; drift(ctx, [0, 1.15, z], [0, 0.85, -0.6], fov); };
  cut(PS(82) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); sitBoth(ctx, 'neutral', 'smile', { ar: -0.6 }); cu(ctx, 'alex', { dist: 1.6, yaw: -0.2, up: -0.05 }); });
  cut(PS(83) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); sitBoth(ctx, 'shocked', 'smile', { ar: -0.6, yr: 0.5 }); cu(ctx, 'you', { dist: 1.3, yaw: 0.1, push: 0.25 }); ctx.shake = pulse(ctx.t, PS(83), PS(83) + 0.3) * 0.4; });
  pop(T(83, 'knows'), PE(83) + 0.5, 'ALEX KNOWS?!', { size: 110, y: 0.26, colors: ['#ffffff', '#ffd34d'] });
  cut(PS(84) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); sitBoth(ctx, 'determined', 'smile', { ar: -0.6, yr: 0.5, you: { head: { roll: -0.1 } } }); cu(ctx, 'you', { dist: 1.6, yaw: 0.25 }); });
  cut(PS(85) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); sitBoth(ctx, 'neutral', ctx.t > T(85, 'guitar') ? 'grin' : 'smile', { ar: -0.6, yr: 0.5, alex: { head: { pitch: 0.1 * Math.max(0, Math.sin((ctx.t - PS(85)) * 8)) * (ctx.t < PS(85) + 0.8 ? 1 : 0) } } }); cu(ctx, 'alex', { dist: 1.6, yaw: -0.2 }); });
  cut(PS(86) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); sitBoth(ctx, 'soulless', 'grin', { ar: -0.6, yr: 0.5, you: { idle: 0 } }); cu(ctx, 'you', { dist: 1.8, yaw: 0.15, ly: 0.3 }); });
  ov({ type: 'soul', t0: PS(86) - 0.05, t1: PE(86) + 0.8, whoA: aw('you', 0.2) }); fx(PS(86), 'ghost_whoosh', 0.6);
  // P87 the stacked rooms
  mood(PS(87), 'quirky', 0.7);
  const stack = sets.stack;
  cut(PS(87) - 0.1, 'stack', ['you', 'alex'], ctx => {
    const t = ctx.t; props(ctx, { guitar: true });
    const strum = t > T(87, 'badly') ? Math.sin(t * 14) * 0.15 : Math.sin(t * 6) * 0.1;
    stack.rooms.you.add(cast.you.root); stack.rooms.alex.add(cast.alex.root);
    act(ctx, 'you', { pos: [-0.9, 0, 0.15], rot: 0.2, pose: 'guitar', expr: t > T(87, 'badly') ? 'grin' : 'content' }); cast.you.arms.R.sh.rotation.x += strum;
    act(ctx, 'alex', { pos: [1.4, 0.65, -0.55], rot: 0, pose: 'handsFace', expr: t > T(87, 'teaching') ? 'wince' : 'bored', lean: -1.4, bob: 0 });
    dolly(ctx, [[0.3, 3.4, 13.5], [0, 3.1, 0], 38], [[0.2, 3.2, 11.8], [0, 3.1, 0], 38]);
  }, { onCast: true });
  pill(PS(87) + 0.2, T(87, 'six'), 'YOU · 8TH FLOOR', 0.3, 0.83, { icon: 'dot' }); pill(PS(87) + 0.5, T(87, 'six'), 'ALEX · 9TH FLOOR', 0.3, 0.17, { icon: 'heart' });
  fx(T(87, 'guitar') - 0.1, 'guitar_bad', 0.55); fx(T(87, 'badly'), 'guitar_bad2', 0.6); fx(T(87, 'very'), 'guitar_bad3', 0.65);
  ov({ type: 'symbol', t0: T(87, 'guitar'), t1: PE(87) + 0.3, whoA: aw('you', 0.5), sym: 'notes' });
  pill(T(87, 'six'), PE(87) + 0.3, '6 MONTHS OF PRACTICE', 0.5, 0.5, { icon: 'clock' });
  pop(T(87, 'very'), PE(87) + 0.4, 'VERY BADLY', { size: 100, y: 0.72, x: 0.62, colors: ['#ffffff', '#ff4f5e'], sfx: false });
  cut(PS(88) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); sitBoth(ctx, 'embarrassed', 'grin', { ar: -0.6, yr: 0.5 }); cu(ctx, 'you', { dist: 1.6, yaw: 0.2 }); });
  cut(PS(89) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); sitBoth(ctx, 'embarrassed', 'grin', { ar: -0.6, yr: 0.5 }); cu(ctx, 'alex', { dist: 1.6, yaw: -0.2 }); });
  cut(T(89, 'patterson') - 0.1, 'stack', ['patterson', 'you'], ctx => {
    const t = ctx.t; props(ctx, { guitar: true }); stack.rooms.patterson.add(cast.patterson.root); stack.rooms.you.add(cast.you.root);
    act(ctx, 'patterson', { pos: [-0.6, 0.25, -0.5], rot: 0.2, pose: 'sitChair', expr: t > T(89, 'torturing') ? 'shocked' : 'surprised', head: { pitch: -0.4 }, scale: 0.92 });
    act(ctx, 'you', { pos: [-0.9, 0, 0.15], rot: 0.2, pose: 'guitar', expr: 'content' }); cast.you.arms.R.sh.rotation.x += Math.sin(t * 14) * 0.15;
    cat.rotation.y = Math.sin(t * 2) * 0.3; cat.position.y = Math.max(0, Math.sin(range(t, T(89, 'cat'), T(89, 'cat') + 0.5) * Math.PI)) * 0.4;
    dolly(ctx, [[0.0, -2.4, 8.6], [0, -3.2, 0], 38], [[0.0, -0.6, 13.0], [0, -1.2, 0], 40]);
  });
  pill(T(89, 'patterson'), PE(89) + 0.4, 'MRS. PATTERSON · 3RD FLOOR', 0.5, 0.12, { icon: 'dot' });
  fx(T(89, 'patterson'), 'guitar_bad', 0.4); fx(T(89, 'cat'), 'cat_yowl', 0.6);
  cut(PS(90) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); sitBoth(ctx, 'embarrassed', 'grin', { yp: 'sitFaceHands', ar: -0.5 }); twoSit(ctx); });
  cut(PS(91) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); sitBoth(ctx, 'embarrassed', 'smile', { yp: 'sitFaceHands', ar: -0.6 }); cu(ctx, 'alex', { dist: 1.6, yaw: -0.2 }); });
  cut(PS(92) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); sitBoth(ctx, 'love', 'smile', { yr: 0.5, ar: -0.6 }); cu(ctx, 'you', { dist: 1.5, yaw: 0.2 }); });
  cut(PS(93) - 0.1, 'building', ['you', 'alex'], ctx => { const t = ctx.t; E(ctx); sitBoth(ctx, t > T(93, 'no') ? 'bored' : 'love', t > T(93, 'no') ? 'grin' : 'smile', { yr: 0.5, ar: -0.6 }); twoSit(ctx, 3.0); });
  fx(T(93, 'no'), 'record_scratch', 0.5);
  cut(PS(94) - 0.1, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t; E(ctx); sitBoth(ctx, 'laugh', t > T(94, 'alex') ? 'laugh' : 'smile', { yr: 0.5, ar: -0.6, you: { bob: Math.abs(Math.sin(t * 13)) * 0.015 }, alex: { bob: t > T(94, 'alex') ? Math.abs(Math.sin(t * 12)) * 0.015 : 0 } }); twoSit(ctx, 3.0);
  });
  ov({ type: 'meter', t0: T(94, 'flow') - 0.3, t1: PE(94) + 0.6, label: 'CONVERSATION', x: 0.39, y: 0.14, w: 420, value: t => ease.out(range(t, T(94, 'conversation'), PE(94) + 0.4)), icon: 'heart', c0: '#7cf3c2', c1: '#2bd47d' });
  mood(T(94, 'flow'), 'upbeat', 0.75);
  cut(PS(95) - 0.1, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t; E(ctx); sitBoth(ctx, step(t, [[0, 'smile'], [T(95, 'video'), 'happy'], [T(95, 'both'), 'shocked']]), step(t, [[0, 'grin'], [T(95, 'video'), 'happy'], [T(95, 'both'), 'shocked']]), { yr: 0.5, ar: -0.6, yp: 'sitHands', ap: t > T(95, 'pineapple') && t < T(95, 'video') ? 'sitReach' : 'sitKnees' });
    twoSit(ctx, 2.8, 36);
  });
  list(PS(95) + 0.2, PE(95) + 0.6, [{ text: 'PINEAPPLE PIZZA', icon: 'x', t: T(95, 'pineapple') }, { text: 'SAME VIDEO GAME', icon: 'check', t: T(95, 'video') }, { text: 'SAME LEVEL · 2 WEEKS', icon: 'check', t: T(95, 'stuck') }], 0.06, 0.2, { title: 'THINGS YOU FIND OUT' });
  cut(PS(96) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); sitBoth(ctx, 'surprised', 'surprised', { yr: 0.55, ar: -0.6 }); cu(ctx, 'you', { dist: 1.5, yaw: 0.2 }); });
  cut(T(96, 'lava') - 0.1, 'lava', [], ctx => { ctx.S.run = range(ctx.t, T(96, 'lava') - 0.1, PS(97) + 0.4); dolly(ctx, [[2.2, 2.4, 3.0], [0, 0, -4], 44], [[1.6, 2.0, 1.4], [0, 0, -6], 44]); });
  ov({ type: 'custom', t0: T(96, 'lava') - 0.1, t1: PS(97) + 0.45, draw: (c, t) => { c.save(); c.strokeStyle = '#fff'; c.lineWidth = 6; c.globalAlpha = 0.9; c.strokeRect(40, 40, 1840, 1000); c.fillStyle = '#fff'; c.font = 'bold 40px "Lilita One"'; c.fillText('LEVEL 7-3 · THE LAVA BRIDGE', 80, 100); c.fillText('♥ ♥ ♡', 1660, 100); if (t > PS(97) - 0.1) { c.font = '120px "Lilita One"'; c.textAlign = 'center'; c.lineWidth = 16; c.strokeStyle = '#2a0a18'; c.strokeText('GAME OVER', 960, 560); c.fillStyle = '#ff4f5e'; c.fillText('GAME OVER', 960, 560); } c.restore(); } });
  fx(T(96, 'lava') - 0.1, 'game_jump', 0.55); fx(PS(97) - 0.1, 'game_over', 0.6);
  cut(PS(97) + 0.45, 'building', ['you', 'alex'], ctx => { E(ctx); sitBoth(ctx, 'happy', 'laugh', { yr: 0.55, ar: -0.6, ap: 'sitReach', alex: { bob: Math.abs(Math.sin(ctx.t * 10)) * 0.02 } }); cu(ctx, 'alex', { dist: 1.7, yaw: -0.2 }); });
  pop(T(97, 'bridge'), PE(97) + 0.5, 'THE LAVA BRIDGE!', { size: 104, y: 0.26, colors: ['#fff27a', '#ff6b3d'], sfx: false });
  cut(PS(98) - 0.1, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t; E(ctx); sitBoth(ctx, 'happy', 'laugh', { yr: 0.5, ar: -0.55, youPos: SIT_YOU, you: { mouth: Math.max(0, Math.sin(t * 9)) * 0.5 }, alex: { mouth: Math.max(0, Math.sin(t * 8 + 2)) * 0.5 } });
    ctx.S.cutFront = true; dolly(ctx, [[0, 1.2, 2.9], [0, 0.85, -0.6], 34], [[0.6, 2.4, 5.4], [0, 0.9, -0.5], 34]);
  });
  cut(PS(99) - 0.1, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t; E(ctx); sitBoth(ctx, 'happy', 'smile', { yr: 0.5, ar: -0.55, you: { mouth: Math.max(0, Math.sin(t * 9)) * 0.45, expr: 'happy' }, alex: { mouth: Math.max(0, Math.sin(t * 8 + 2)) * 0.45 } });
    ctx.S.noCut = true; dolly(ctx, [[0.9, 2.8, 6.5], [0, 1.2, 0], 34], [[1.2, 3.6, 8.0], [0, 1.2, 0], 34]); ctx.S.cutFront = true;
  });
  pill(T(99, 'two'), PE(99) + 0.5, 'JUST TWO PEOPLE', 0.5, 0.775, { icon: 'heart' });

  // ======================================================================== ACT 6 — the heat, the fear
  mood(PS(100), 'tense', 0.65);
  card(PS(100), PS(101), '40 MINUTES IN');
  cut(PS(100) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); sitBoth(ctx, 'neutral', 'neutral', { yr: 0.2, ar: -0.2 }); twoSit(ctx, 3.6, 34); });
  wash(PS(101) - 0.5, PE(104), '#ff8a3d', 0.1, { mode: 'multiply' });
  cut(PS(101) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); sitBoth(ctx, 'tired', 'tired', { you: { sweat: 1 } }); look(ctx.cam, [0.4, 2.2, -0.3], [0.85, 3.0, -0.75], 40); });
  pill(T(101, 'fan'), PE(101) + 0.6, 'VENT FAN: OFF', 0.5, 0.7, { icon: 'x' });
  ov({ type: 'meter', t0: T(101, 'warmer') - 0.2, t1: PE(101) + 0.6, label: 'TEMPERATURE', x: 0.39, y: 0.14, w: 420, value: t => 0.45 + range(t, T(101, 'warmer'), PE(101)) * 0.35, c0: '#ffd34d', c1: '#ff4f5e', icon: 'bolt' });
  fx(T(101, 'stopped') - 0.2, 'fan_stop', 0.6);
  cut(PS(102) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); sitBoth(ctx, ctx.t > T(102, 'wrong') ? 'surprised' : 'tired', 'scared', { yr: lerp(0.2, 0.6, range(ctx.t, PS(102), PS(102) + 0.5)), ap: 'sitHug' }); cu(ctx, 'you', { dist: 1.5, yaw: 0.25 }); });
  fx(T(102, 'wrong'), 'drone_hit', 0.45);
  cut(PS(103) - 0.1, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t; E(ctx); const fast = t > T(103, 'breathing');
    sitBoth(ctx, 'sad', 'scared', { yr: 0.6, ar: -0.05, ap: 'sitHug', alex: { bob: fast ? Math.sin(t * 13) * 0.012 : Math.sin(t * 4) * 0.008, mouth: fast ? 0.25 + 0.2 * Math.sin(t * 13) : 0, look: [0, 0.2], idle: 0.2 } });
    cu(ctx, 'alex', { dist: 1.9, yaw: 0.1, push: 0.35 });
  });
  { for (let t = T(103, 'breathing'); t < PE(103) + 0.5; t += 0.48) fx(t, 'breath_fast', 0.3); for (let t = PS(103); t < PE(104); t += 0.62) fx(t, 'heartbeat', 0.28); }
  cut(PS(104) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); sitBoth(ctx, 'sad', 'scared', { yr: 0.6, ap: 'sitHug' }); cu(ctx, 'you', { dist: 1.5, yaw: 0.25 }); });
  cut(PS(105) - 0.1, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t; E(ctx); sitBoth(ctx, 'sad', 'scared', { yr: 0.6, ar: -0.1, ap: 'sitHug', alex: { tilt: Math.sin(t * 20) * 0.01 } });
    // dolly-zoom (walls closing in)
    const u = ease.inOut(range(t, T(105, 'small') - 1.2, PE(105) + 0.3)); const h = hp(ctx, 'alex', -0.05);
    const fov = lerp(30, 62, u); const dist = 0.62 / Math.tan(fov * Math.PI / 360) * 0.95;
    look(ctx.cam, [h[0] + Math.sin(-0.15) * dist, h[1] + 0.02, h[2] + Math.cos(-0.15) * dist], [h[0], h[1], h[2]], fov); ctx.S.cutFront = true;
  });
  fx(T(105, 'small') - 1.2, 'riser_dark', 0.55);
  cut(PS(106) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); sitBoth(ctx, 'surprised', 'scared', { yr: 0.6, ap: 'sitHug' }); cu(ctx, 'you', { dist: 1.3, yaw: 0.25, push: 0.2 }); });
  cut(PS(107) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); sitBoth(ctx, 'sad', 'scared', { yr: 0.6, ap: 'sitHug' }); ctx.S.cutFront = true; dolly(ctx, [[0.9, 2.6, 2.6], [0.55, 0.7, -0.8], 30], [[0.9, 2.9, 2.2], [0.55, 0.7, -0.8], 26]); });
  wash(PS(107), PE(107) + 0.3, '#1d1640', 0.35);
  cut(PS(108) - 0.1, 'void', ['alex'], ctx => {
    voidMode({ pedestal: true, color: '#3c2ab0' }); act(ctx, 'alex', { pos: [0, 0.6, 0], rot: 0, pose: 'cheer', expr: 'grin' });
    const a = lerp(-0.25, 0.25, ctx.u); look(ctx.cam, [Math.sin(a) * 5.4, 1.2, Math.cos(a) * 5.4], [0, 1.7, 0], 38);
  });
  ov({ type: 'symbol', t0: PS(108) + 0.2, t1: PE(108), whoA: aw('alex', 0.9), sym: '✦', color: '#fff7b0', size: 80 });
  fx(PS(108), 'chime_magic', 0.45);
  list(T(108, 'calm') - 0.2, PE(109) + 0.4, [{ text: 'ALWAYS CALM', icon: 'check', t: T(108, 'calm'), strike: T(109, 'person') }, { text: 'ALWAYS COOL', icon: 'check', t: T(108, 'cool'), strike: T(109, 'person') + 0.2 }, { text: 'ALWAYS CONFIDENT', icon: 'check', t: T(108, 'confident'), strike: T(109, 'person') + 0.4 }], 0.06, 0.22, { title: 'PERFECT. UNTOUCHABLE.' });
  cut(PS(109) - 0.1, 'void', ['alex'], ctx => {
    voidMode({ pedestal: false, color: '#2a1f70' }); act(ctx, 'alex', { pos: [0, 0, 0], rot: 0, pose: 'scared', expr: 'scared' });
    dolly(ctx, [[0, 1.6, 5.4], [0, 1.1, 0], 38], [[0, 3.4, 6.4], [0, 0.9, 0], 38]);
  });
  fx(PS(109), 'whoosh_low', 0.4);
  pill(T(109, 'scared'), PE(109) + 0.4, 'JUST A PERSON', 0.5, 0.78, { icon: 'heart' });
  mood(PS(110), 'hopeful', 0.65);
  cut(PS(110) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); sitBoth(ctx, 'determined', 'scared', { yr: 0.6, ap: 'sitHug' }); cu(ctx, 'you', { dist: 1.3, yaw: 0.2, push: 0.25 }); });
  // P111 breathing exercise
  cut(PS(111) - 0.1, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t, sc = T(111, 'scoot'); const u = ease.inOut(range(t, sc, sc + 0.9));
    E(ctx); sitBoth(ctx, 'smile', 'scared', { yr: 0.75, ap: 'sitHug', youPos: [lerp(SIT_YOU[0], SIT_YOU2[0], u), 0, SIT_YOU[2]] });
    twoSit(ctx, 2.8, 34);
  });
  fx(T(111, 'scoot'), 'scoot', 0.5);
  const bIn = T(111, 'in', 1), bHold = T(111, 'hold'), bOut = T(111, 'out');
  ov({ type: 'custom', t0: bIn - 0.3, t1: PE(111) + 0.8, draw: (c, t) => {
    const a = Math.min(1, (t - bIn + 0.3) / 0.3, (PE(111) + 0.8 - t) / 0.4); let r;
    if (t < bHold) r = lerp(70, 170, ease.inOut(range(t, bIn, bHold))); else if (t < bOut) r = 170; else r = lerp(170, 70, ease.inOut(range(t, bOut, PE(111))));
    const lab = t < bHold ? 'BREATHE IN' : t < bOut ? 'HOLD' : 'BREATHE OUT';
    c.save(); c.globalAlpha = a; const x = 1560, y = 330;
    const g = c.createRadialGradient(x, y, r * 0.2, x, y, r); g.addColorStop(0, 'rgba(160,230,255,0.55)'); g.addColorStop(1, 'rgba(120,160,255,0.15)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
    c.lineWidth = 4; c.strokeStyle = 'rgba(255,255,255,0.9)'; c.stroke(); c.fillStyle = '#fff'; c.font = 'bold 28px "Libre Baskerville"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(lab, x, y); c.restore();
  } });
  cut(bIn - 0.2, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t; E(ctx); const ch = t < bHold ? range(t, bIn, bHold) : t < bOut ? 1 : 1 - range(t, bOut, PE(111));
    sitBoth(ctx, 'content', 'scared', { yr: 0.75, youPos: SIT_YOU2, ap: 'sitHug', you: { lean: -ch * 0.12, bob: ch * 0.02 } });
    cu(ctx, 'you', { dist: 1.6, yaw: 0.35 });
  });
  cut(PS(112) - 0.1, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t; E(ctx); const ch = Math.max(0, Math.sin(range(t, T(112, 'does'), PE(112) + 1.2) * Math.PI));
    sitBoth(ctx, 'content', t > T(112, 'does') ? 'content' : 'scared', { yr: 0.75, youPos: SIT_YOU2, ap: 'sitHug', alex: { lean: -ch * 0.15, bob: ch * 0.02 } });
    cu(ctx, 'alex', { dist: 1.7, yaw: -0.1 });
  });
  cut(PS(113) - 0.1, 'building', ['you', 'alex'], ctx => { const t = ctx.t; E(ctx); const ch = Math.max(0, Math.sin((t - PS(113)) * 2.6)); sitBoth(ctx, 'content', 'content', { yr: 0.75, youPos: SIT_YOU2, ap: 'sitKnees', alex: { lean: -ch * 0.12 }, you: { lean: -ch * 0.12 } }); twoSit(ctx, 2.7, 34); });
  ov({ type: 'counter', t0: PS(113), t1: PE(113) + 0.5, x: 0.7, y: 0.14, size: 60, box: true, icon: 'heart', text: t => `BREATHS: ${step(t, [[0, 1], [T(113, 'twice'), 2], [T(113, 'five'), 5]])}` });
  ['once', 'twice', 'five'].forEach(w => fx(T(113, w), 'soft_tick', 0.45));
  cut(PS(114) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); sitBoth(ctx, 'smile', 'content', { yr: 0.75, youPos: SIT_YOU2, yp: 'sitHands' }); cu(ctx, 'you', { dist: 1.6, yaw: 0.35 }); });
  pop(T(114, 'elevators'), PE(114) + 0.4, 'ELEVATORS.', { size: 100, y: 0.26 });
  // P115 safety explainer in the shaft
  mood(PS(115), 'explain', 0.6);
  cut(PS(115) - 0.1, 'shaft', ['you', 'alex'], ctx => {
    const t = ctx.t; const SH = sets.shaft; const y = SH.FH * 6.45; ctx.S.carY = y;
    ctx.S.cableHi = t > T(115, 'cables') && t < T(115, 'brakes'); ctx.S.brakeGlow = t > T(115, 'brakes') ? 0.9 : 0; ctx.S.brakeOpen = t > T(115, 'brakes') ? 0 : 1;
    if (t < T(115, 'cables') - 0.2) dolly(ctx, [[4, y + 3.5, 9.5], [0, y + 2, 0], 40], [[3.4, y + 3.2, 8.0], [0, y + 2, 0], 40], ease.inOut, range(t, PS(115), T(115, 'cables')));
    else if (t < T(115, 'brakes') - 0.2) dolly(ctx, [[2.2, y + 5.2, 4.4], [0, y + 6, -0.2], 44], [[1.8, y + 7.5, 3.6], [0, y + 9, -0.2], 44], ease.inOut, range(t, T(115, 'cables'), T(115, 'brakes')));
    else dolly(ctx, [[2.8, y + 1.2, 2.4], [1.52, y + 0.3, -0.2], 40], [[2.4, y + 1.0, 1.8], [1.52, y + 0.3, -0.2], 36], ease.inOut, range(t, T(115, 'brakes'), PE(115)));
  }, { inCar: 'sit' });
  list(T(115, 'cables') - 0.1, PE(115) + 0.6, [{ text: 'SEVERAL STEEL CABLES', icon: 'check', t: T(115, 'cables') }, { text: 'ONE CAN HOLD THE CAR', icon: 'check', t: T(115, 'one') }, { text: 'EMERGENCY BRAKES', icon: 'check', t: T(115, 'brakes') }], 0.06, 0.18, { title: 'ELEVATOR SAFETY' });
  fx(T(115, 'cables'), 'cable_creak', 0.45); fx(T(115, 'brakes') + 0.3, 'clamp', 0.7);
  cut(PS(116) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); sitBoth(ctx, 'smile', 'surprised', { yr: 0.75, youPos: SIT_YOU2, ar: -0.6 }); cu(ctx, 'alex', { dist: 1.6, yaw: -0.2 }); });
  cut(PS(117) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); sitBoth(ctx, 'grin', 'surprised', { yr: 0.75, youPos: SIT_YOU2, ar: -0.6, you: { head: { roll: -0.1 } } }); cu(ctx, 'you', { dist: 1.6, yaw: 0.3 }); });
  pill(T(117, 'three'), PE(117) + 0.4, '3:00 A.M. RABBIT HOLE', 0.5, 0.775, { icon: 'clock' });
  cut(PS(118) - 0.1, 'building', ['you', 'alex'], ctx => { const t = ctx.t; E(ctx); sitBoth(ctx, 'smile', 'happy', { yr: 0.75, youPos: SIT_YOU2, ar: -0.6, alex: { sweat: 1, bob: Math.abs(Math.sin(t * 10)) * 0.008 } }); cu(ctx, 'alex', { dist: 1.7, yaw: -0.15 }); });
  mood(PS(118), 'hopeful', 0.6);
  // P119 not airtight / don't climb out
  cut(PS(119) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); sitBoth(ctx, 'smile', 'content', { yr: 0.75, youPos: SIT_YOU2, ar: -0.4, yp: 'sitHands' }); ctx.S.cutFront = true; dolly(ctx, [[1.8, 1.6, 3.6], [0, 1.0, -0.3], 36], [[1.4, 1.5, 3.0], [0, 1.0, -0.3], 36]); });
  ov({ type: 'custom', t0: T(119, 'airtight') - 0.2, t1: T(119, 'worst'), draw: (c, t) => { for (let i = 0; i < 5; i++) { const p = ((t * 0.5) + i / 5) % 1; c.save(); c.globalAlpha = Math.sin(p * Math.PI) * 0.8; c.strokeStyle = '#bdf6ff'; c.lineWidth = 6; c.lineCap = 'round'; const x = 520 + i * 180, y = 980 - p * 760; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 30, y - 40, x, y - 80); c.stroke(); c.beginPath(); c.moveTo(x - 14, y - 64); c.lineTo(x, y - 82); c.lineTo(x + 16, y - 66); c.stroke(); c.restore(); } } });
  list(T(119, 'airtight'), PE(119) + 0.5, [{ text: 'NOT AIRTIGHT', icon: 'check', t: T(119, 'airtight') }, { text: 'NOT RUNNING OUT OF AIR', icon: 'check', t: T(119, 'running') }, { text: 'CLIMB OUT THE CEILING', icon: 'x', t: T(119, 'climb') }, { text: 'STAY PUT · WAIT FOR HELP', icon: 'check', t: T(119, 'safest') }], 0.06, 0.18, { title: 'STUCK? DO THIS' });
  cut(T(119, 'ceiling') - 0.1, 'building', ['you'], ctx => {
    E(ctx, { light: 0.4, tint: '#ffb3b3' }); act(ctx, 'you', { pos: [0, 1.55 + ease.out(range(ctx.t, T(119, 'ceiling'), T(119, 'movies'))) * 0.6, -0.1], rot: 0, pose: 'cheer', expr: 'determined' });
    dolly(ctx, [[0.2, 0.6, 1.6], [0, 2.6, -0.1], 50], [[0.3, 0.5, 1.3], [0, 2.8, -0.1], 46]);
  });
  ov({ type: 'bars', t0: T(119, 'ceiling') - 0.1, t1: T(119, 'real') - 0.1 });
  pop(T(119, 'movies'), T(119, 'real') - 0.1, 'ONLY IN MOVIES', { size: 96, y: 0.5, colors: ['#ffffff', '#ff4f5e'], snd: 'movie_boom' });
  cut(T(119, 'real') - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); sitBoth(ctx, 'smile', 'content', { yr: 0.75, youPos: SIT_YOU2, ar: -0.4, yp: 'sitHands' }); cu(ctx, 'you', { dist: 1.6, yaw: 0.3 }); });
  cut(PS(120) - 0.1, 'building', ['you', 'alex'], ctx => { const t = ctx.t; E(ctx); const u = ease.inOut(range(t, T(120, 'shoulders'), PE(120))); sitBoth(ctx, 'smile', 'content', { yr: 0.75, youPos: SIT_YOU2, ar: -0.35, alex: { poseMix: { a: 'sitHug', b: 'sitKnees', u } } }); cu(ctx, 'alex', { dist: 1.8, yaw: -0.1 }); });
  pill(T(120, 'little') - 0.2, PE(120) + 0.4, 'PANIC: ↓ A LITTLE', 0.5, 0.775, { icon: 'check' });
  cut(PS(121) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); sitBoth(ctx, 'smile', 'smile', { yr: 0.75, youPos: SIT_YOU2, ar: -0.6 }); cu(ctx, 'alex', { dist: 1.6, yaw: -0.25 }); });

  // ======================================================================== ACT 7 — would you rather
  mood(PS(122), 'playful', 0.75);
  cut(PS(122) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); sitBoth(ctx, 'grin', 'smile', { yr: 0.75, youPos: SIT_YOU2, ar: -0.55 }); twoSit(ctx, 2.9); });
  ov({ type: 'title', t0: PS(123) - 0.1, t1: PS(124) + 0.3, text: 'WOULD YOU RATHER?', y: 0.3, size: 110 }); fx(PS(123), 'gameshow', 0.6);
  cut(PS(124) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); sitBoth(ctx, 'grin', 'thinking', { yr: 0.75, youPos: SIT_YOU2, ar: -0.55, yp: 'sitReach' }); twoSit(ctx, 3.0); });
  ov({ type: 'vs', t0: PS(124) + 0.3, t1: PE(126) + 0.3, y: 0.08, cards: [{ text: 'STUCK HERE\n1 MORE HOUR', t: PS(124) + 0.4, win: T(125, 'elevator') }, { text: '1 HOUR OF\nYOUR GUITAR', t: T(124, 'listen') }] });
  fx(T(125, 'elevator'), 'ding_correct', 0.6);
  cut(PS(125) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); sitBoth(ctx, 'grin', 'bored', { yr: 0.75, youPos: SIT_YOU2, ar: -0.55 }); cu(ctx, 'alex', { dist: 1.6, yaw: -0.25 }); });
  cut(PS(126) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); sitBoth(ctx, 'shocked', 'grin', { yr: 0.75, youPos: SIT_YOU2, ar: -0.55, yp: 'sitReach' }); cu(ctx, 'you', { dist: 1.4, yaw: 0.3, push: 0.25 }); });
  ov({ type: 'symbol', t0: PS(126), t1: PE(126) + 0.6, whoA: aw('you', 0.75), sym: 'anger', dx: 70 });
  cut(PS(127) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); sitBoth(ctx, 'neutral', 'grin', { yr: 0.75, youPos: SIT_YOU2, ar: -0.55, ap: 'sitReach' }); cu(ctx, 'alex', { dist: 1.7, yaw: -0.25 }); });
  ov({ type: 'vs', t0: T(127, 'would'), t1: PE(128) + 0.4, y: 0.08, cards: [{ text: 'FINGERS AS LONG\nAS YOUR LEGS', t: T(127, 'fingers') }, { text: 'LEGS AS LONG\nAS YOUR FINGERS', t: T(127, 'legs', 1) }] });
  cut(T(127, 'fingers') + 0.2, 'void', ['you'], ctx => {
    const t = ctx.t; voidMode({ color: '#5a2bc8' }); const big = t < T(127, 'legs', 1);
    act(ctx, 'you', { pos: [0, 0, 0], rot: 0, pose: big ? 'reachSide' : 'stand', expr: big ? 'shocked' : 'dizzy' });
    for (const s of ['L', 'R']) { cast.you.arms[s].hand.scale.setScalar(big ? 1 + ease.outBack(range(t, ctx.shot.t0, ctx.shot.t0 + 0.4)) * 2.2 : 1); cast.you.legs[s].hp.scale.set(1, big ? 1 : lerp(1, 0.18, ease.outBack(range(t, T(127, 'legs', 1), T(127, 'legs', 1) + 0.4))), 1); }
    if (!big) cast.you.root.position.y = 0; if (!big) { cast.you.body.position.y -= 0.66 * (1 - cast.you.legs.L.hp.scale.y); for (const s of ['L', 'R']) cast.you.legs[s].hp.position.y = cast.you.body.position.y; }
    dolly(ctx, [[0, 1.3, 4.2], [0, 1.0, 0], 38], [[0, 1.3, 3.8], [0, 1.0, 0], 38]);
  }, { after: () => resetScale() });
  fx(T(127, 'fingers') + 0.2, 'cartoon_stretch', 0.55); fx(T(127, 'legs', 1), 'cartoon_shrink', 0.55);
  cut(PS(128) - 0.1, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t; E(ctx); resetScale(); const ser = t > T(128, 'seriously') - 0.3;
    sitBoth(ctx, ser ? 'thinking' : 'surprised', ser ? 'thinking' : 'surprised', { yr: 0.4, youPos: SIT_YOU2, ar: -0.4, yp: 'sitHands', ap: 'sitHands', you: { head: { pitch: 0.4 } }, alex: { head: { pitch: 0.4 } } });
    twoSit(ctx, 2.6, 34);
  });
  ov({ type: 'counter', t0: T(128, 'debate') - 0.2, t1: PE(128) + 0.6, x: 0.68, y: 0.84, size: 60, box: true, text: t => { const m = lerp(0, 11, ease.inOut(range(t, T(128, 'debate'), PE(128)))); return `DEBATE: ${Math.floor(m)}:${String(Math.floor((m % 1) * 60)).padStart(2, '0')}`; } });
  fx(T(128, 'debate'), 'clock_fast', 0.45);
  cut(PS(129) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); sitBoth(ctx, 'grin', 'thinking', { yr: 0.75, youPos: SIT_YOU2, ar: -0.55 }); twoSit(ctx, 3.0); });
  ov({ type: 'vs', t0: PS(129) + 0.1, t1: PE(130) + 0.3, y: 0.08, cards: [{ text: 'SING\nEVERYTHING', t: PS(129) + 0.2, win: PS(130) + 0.3 }, { text: 'DANCE\nEVERYWHERE', t: T(129, 'dance') }] });
  cut(PS(130) - 0.1, 'building', ['you', 'alex'], ctx => { const t = ctx.t; E(ctx); const u = ease.inOut(range(t, PS(130), PE(130) + 0.3)); sitBoth(ctx, 'surprised', 'determined', { yr: 0.75, youPos: SIT_YOU2, ar: -0.4, alex: { poseMix: { a: 'sitKnees', b: 'stand', u }, pos: [SIT_ALEX[0], 0, lerp(SIT_ALEX[2], -0.4, u)] } }); twoSit(ctx, 3.3); });
  cut(PS(131) - 0.15, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t; E(ctx, { light: 0.85, tint: '#ffe0f4' });
    act(ctx, 'alex', { pos: [0.5, 0, -0.35], rot: -0.3 + Math.sin(t * 2.2) * 0.25, pose: 'cheer', expr: 'sing', bob: Math.abs(Math.sin(t * 4.4)) * 0.03, tilt: Math.sin(t * 2.2) * 0.08 });
    act(ctx, 'you', { pos: SIT_YOU2, rot: 0.75, pose: 'sitKnees', expr: 'surprised' });
    cu(ctx, 'alex', { dist: 2.2, yaw: -0.2, up: -0.35 });
  });
  ov({ type: 'symbol', t0: PS(131), t1: PE(131) + 0.5, whoA: aw('alex', 0.7), sym: 'notes' });
  wash(PS(131), PE(131), '#ff7eb6', 0.1);
  cut(PS(132) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); act(ctx, 'alex', { pos: [0.5, 0, -0.35], rot: -0.4, pose: 'cheer', expr: 'sing' }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.75, pose: 'sitCoverFace', expr: 'wince' }); cu(ctx, 'you', { dist: 1.6, yaw: 0.2 }); });
  pop(T(132, 'so'), PE(132) + 0.4, 'SO TERRIBLE', { size: 104, y: 0.26, colors: ['#ffffff', '#ff4f5e'] });
  cut(PS(133) - 0.1, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t; E(ctx); const sm = T(133, 'somewhere'); const slow = t > sm;
    const lu = ease.inOut(range(t, PS(133), PS(133) + 1.0));
    act(ctx, 'alex', { pos: [lerp(0.5, SIT_ALEX2[0], lu), 0, lerp(-0.35, SIT_ALEX2[2], lu)], rot: -0.4, poseMix: { a: 'stand', b: 'sitKnees', u: lu }, expr: slow ? 'smile' : 'laugh', bob: slow ? 0 : Math.abs(Math.sin(t * 12)) * 0.02 });
    act(ctx, 'you', { pos: SIT_YOU2, rot: 0.6, pose: 'sitKnees', expr: slow ? 'happy' : 'laugh', bob: slow ? 0 : Math.abs(Math.sin(t * 13)) * 0.02 });
    twoSit(ctx, slow ? lerp(2.8, 2.2, range(t, sm, PE(133))) : 2.8, 34);
  });
  mood(T(133, 'somewhere'), 'tender', 0.7);
  cut(PS(134) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.75, pose: 'sitKnees', expr: 'love', blush: 0.9 }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.6, pose: 'sitKnees', expr: 'happy' }); cu(ctx, 'alex', { dist: 1.4, yaw: -0.3, push: 0.25 }); });
  fx(PS(134), 'heartbeat', 0.55); fx(PS(134) + 0.1, 'chime_soft', 0.5);
  wash(PS(134), PE(134) + 0.5, '#ff9ad5', 0.14);

  // ======================================================================== ACT 8 — the drop
  card(PS(135), PS(136), '1 HOUR IN');
  const shk = T(135, 'shakes'), clunk = T(136, 'clunk');
  cut(PS(135) - 0.1, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t; E(ctx); const s = t > shk;
    act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.5, pose: s ? 'sitHug' : 'sitKnees', expr: s ? 'shocked' : 'smile' }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.5, pose: s ? 'sitHug' : 'sitKnees', expr: s ? 'shocked' : 'happy' });
    twoSit(ctx, 3.0); ctx.shake = s ? 1.4 : 0;
  });
  mood(shk - 0.05, 'none');
  fx(shk, 'rumble', 0.8, { dur: 2.6 });
  cut(PS(136) - 0.1, 'shaft', ['you', 'alex'], ctx => {
    const t = ctx.t; const SH = sets.shaft; const y0 = SH.FH * 6.45; const d = ease.in(range(t, clunk - 0.25, clunk));
    ctx.S.carY = y0 - d * 0.25 + (t > clunk ? Math.sin((t - clunk) * 30) * 0.03 * Math.exp(-(t - clunk) * 5) : 0); ctx.S.brakeGlow = t > clunk ? Math.exp(-(t - clunk) * 1.5) : 0;
    look(ctx.cam, [3.4, y0 + 2.4, 6.6], [0, y0 + 1.4, 0], 40); ctx.shake = t > clunk ? Math.exp(-(t - clunk) * 3) * 2.4 : 0.6;
  }, { inCar: 'sit' });
  fx(clunk, 'impact_big', 1.0); fx(clunk, 'sub_boom', 0.9); flash(clunk, { dur: 0.2, amt: 0.6 });
  pop(clunk, clunk + 1.4, 'CLUNK!', { size: 170, rot: 7, colors: ['#ffffff', '#ff7a2f'], sfx: false });
  const grab = T(137, 'grabs');
  cut(PS(137) - 0.1, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t; E(ctx); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.3, pose: 'sitHug', expr: 'scared', mouth: t < PS(137) + 0.9 ? 0.8 : 0 }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.3, pose: 'sitHug', expr: 'scared', mouth: t < PS(137) + 0.9 ? 0.8 : 0 });
    twoSit(ctx, 2.8); ctx.shake = Math.max(0, 1 - (t - PS(137)) / 1.5) * 1.2;
  });
  fx(PS(137) + 0.05, 'gasp', 0.55);
  const handShot = (ctx, held = 1) => {
    E(ctx);
    act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.45, pose: 'sitKnees', expr: 'scared' }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.45, pose: 'sitKnees', expr: 'surprised' });
    const ya = cast.you.arms.L, aa = cast.alex.arms.R; // you's left (toward +x), alex's right (toward -x)
    ya.sh.rotation.set(-0.35, 0, 0.95 * held + 0.15); ya.el.rotation.set(-0.25, 0, 0);
    aa.sh.rotation.set(-0.35, 0, -(0.95 * held + 0.15)); aa.el.rotation.set(-0.25, 0, 0);
  };
  cut(grab - 0.15, 'building', ['you', 'alex'], ctx => {
    const u = ease.out(range(ctx.t, grab - 0.1, grab + 0.25)); handShot(ctx, u);
    ctx.S.cutFront = true; look(ctx.cam, [0.05, 0.75, 0.9], [0.05, 0.6, -0.6], 40);
  });
  fx(grab, 'grab', 0.75); fx(grab + 0.05, 'heartbeat', 0.7);
  cut(PS(138) - 0.1, 'building', ['you', 'alex'], ctx => { handShot(ctx); twoSit(ctx, 3.4); });
  cut(PS(139) - 0.1, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t; handShot(ctx); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.45, pose: 'sitKnees', expr: t > T(139, 'still') ? 'love' : 'surprised', blush: 1 });
    handShot.call(null, { ...ctx, S: ctx.S }); cast.you.setFace({ expr: t > T(139, 'still') ? 'love' : 'surprised', blush: 1 });
    if (t < T(139, 'still')) cu(ctx, 'you', { dist: 1.4, yaw: 0.25 }); else { ctx.S.cutFront = true; look(ctx.cam, [0.05, 0.75, 0.9], [0.05, 0.6, -0.6], 36); }
  });
  ov({ type: 'ecg', t0: PS(139) - 0.1, t1: PE(140) + 0.4, x: 0.72, y: 0.12, bpm: t => lerp(150, 172, range(t, PS(139), PE(139))) });
  { for (let t = PS(139); t < PE(140); t += 60 / 160) fx(t, 'heartbeat', 0.42); }
  wash(T(139, 'still'), PE(139) + 0.3, '#ff7eb6', 0.12);
  pill(T(139, 'still'), PE(139) + 0.3, 'STILL HOLDING HANDS', 0.5, 0.775, { icon: 'heart' });
  cut(PS(140) - 0.1, 'building', ['you', 'alex'], ctx => { handShot(ctx); twoSit(ctx, 2.6); });
  ov({ type: 'counter', t0: PS(140), t1: PE(140) + 0.4, x: 0.42, y: 0.16, size: 64, box: true, text: t => `${step(t, [[0, 3], [T(140, 'four'), 4], [T(140, 'five'), 5]])} SEC` });
  ['three', 'four', 'five'].forEach(w => fx(T(140, w), 'clock_tick', 0.55));
  cut(PS(141) - 0.1, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t; handShot(ctx); cast.alex.neck.rotation.x += ease.out(range(t, PS(141), PS(141) + 0.4)) * 0.5; cast.you.neck.rotation.x += ease.out(range(t, T(141, 'you'), T(141, 'you') + 0.4)) * 0.5;
    ctx.S.cutFront = true; look(ctx.cam, [0.05, 1.6, 1.6], [0.05, 0.6, -0.6], 38);
  });
  cut(PS(142) - 0.1, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t; const u = ease.inOut(range(t, PS(142), T(142, 'sorry'))); handShot(ctx, 1 - u);
    act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.45, pose: 'sitKnees', expr: 'embarrassed' }); const aa = cast.alex.arms.R; aa.sh.rotation.set(-0.35, 0, -(0.95 * (1 - u) + 0.15));
    cu(ctx, 'alex', { dist: 1.6, yaw: -0.2 });
  });
  cut(PS(143) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.45, pose: 'sitKnees', expr: 'embarrassed' }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.45, pose: 'sitKnees', expr: 'embarrassed', blush: 1 }); cu(ctx, 'you', { dist: 1.6, yaw: 0.25 }); });
  mood(PS(144), 'quirky', 0.65);
  cut(PS(144) - 0.1, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t; E(ctx); const u = ease.out(range(t, PS(144), PS(144) + 0.5));
    act(ctx, 'alex', { pos: SIT_ALEX2, rot: lerp(-0.45, 0.9, u), pose: 'sitKnees', expr: 'embarrassed', sweat: 1, look: [0.6, -0.3] }); act(ctx, 'you', { pos: SIT_YOU2, rot: lerp(0.45, -0.9, u), pose: 'sitKnees', expr: 'embarrassed', sweat: 1, look: [-0.6, -0.3] });
    twoSit(ctx, 3.0);
  });
  fx(PS(144), 'whoosh_small', 0.4);
  ov({ type: 'meter', t0: T(144, 'very') - 0.2, t1: PE(144) + 0.5, label: 'PRETENDING SKILL', x: 0.39, y: 0.14, w: 420, value: 0.03, icon: 'x', valueText: '3%' });
  // P145 speaker crackles — technician at the motor
  cut(PS(145) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); act(ctx, 'alex', { pos: SIT_ALEX2, rot: 0.2, pose: 'sitKnees', expr: 'surprised', head: { pitch: -0.3 } }); act(ctx, 'you', { pos: SIT_YOU2, rot: -0.2, pose: 'sitKnees', expr: 'surprised', head: { pitch: -0.3 } }); drift(ctx, [-0.7, 1.3, 0.9], [-0.98, 1.6, FZ], 40); });
  fx(PS(145), 'static', 0.6, { dur: 1.0 });
  cut(T(145, 'technician') - 0.1, 'shaft', ['tech', 'you', 'alex'], ctx => {
    const t = ctx.t; const SH = sets.shaft; ctx.S.carY = SH.FH * 6.45 - 0.25;
    SH.scene.add(cast.tech.root); act(ctx, 'tech', { pos: [1.1, SH.top - 0.6, 0.8], rot: -0.9, pose: 'pressButton', expr: 'tired', bob: Math.abs(Math.sin(t * 8)) * 0.01 });
    cast.tech.arms.R.sh.rotation.x += Math.sin(t * 9) * 0.3;
    dolly(ctx, [[3.6, SH.top + 1.5, 5.0], [0.6, SH.top + 0.5, 0.3], 40], [[3.2, SH.top + 1.3, 4.4], [0.6, SH.top + 0.55, 0.3], 38]);
  }, { inCar: 'sit' });
  pill(T(145, 'technician'), PE(145) + 0.3, 'TECHNICIAN · ON THE MOTOR', 0.5, 0.775, { icon: 'bolt' });
  fx(T(145, 'technician'), 'wrench', 0.55, { dur: 3.0 });
  cut(PS(146) - 0.1, 'building', ['you', 'alex'], ctx => { const t = ctx.t; E(ctx); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.2, pose: 'sitKnees', expr: 'neutral' }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.2, pose: 'sitKnees', expr: step(t, [[0, 'neutral'], [T(146, 'relieved'), 'smile'], [T(146, 'disappointed'), 'sad']]) }); cu(ctx, 'you', { dist: 1.5, yaw: 0.15 }); });
  pill(T(146, 'relieved'), PE(146) + 0.4, 'RELIEVED?', 0.3, 0.22, { icon: 'check' }); pill(T(146, 'disappointed'), PE(146) + 0.4, 'DISAPPOINTED?', 0.7, 0.22, { icon: 'q' });

  // ======================================================================== ACT 9 — granola teeth
  mood(PS(147), 'suspense', 0.6);
  cut(PS(147) - 0.1, 'building', ['you', 'alex'], ctx => { const t = ctx.t; E(ctx); const u = ease.inOut(range(t, PS(147), PS(147) + 0.7)); act(ctx, 'alex', { pos: SIT_ALEX2, rot: lerp(-0.2, -0.8, u), pose: 'sitKnees', expr: t > T(147, 'serious') ? 'determined' : 'neutral' }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.5, pose: 'sitKnees', expr: 'surprised' }); cu(ctx, 'alex', { dist: 1.6, yaw: -0.25, push: 0.15 }); });
  fx(T(147, 'serious'), 'suspense_hit', 0.45);
  cut(PS(148) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.8, pose: 'sitKnees', expr: 'determined' }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.6, pose: 'sitKnees', expr: 'surprised', blush: 0.8 }); twoSit(ctx, 2.5, 32); });
  cut(PS(149) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.8, pose: 'sitKnees', expr: 'determined' }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.6, pose: 'sitKnees', expr: 'soulless', idle: 0 }); cu(ctx, 'you', { dist: 1.2, yaw: 0.3 }); });
  ov({ type: 'ecg', t0: PS(149) - 0.1, t1: PE(149) + 0.6, x: 0.72, y: 0.12, bpm: t => t < PS(149) + 0.3 ? 140 : 0.0001 });
  fx(PS(149), 'heartbeat', 0.8); fx(PS(149) + 0.4, 'flatline', 0.35);
  cut(PS(150) - 0.1, 'void', ['you'], ctx => { const t = ctx.t; voidMode({ trees: true, color: '#b04ad0' }); act(ctx, 'you', { pos: [0, 0, 0], rot: 0, expr: step(t, [[0, 'love'], [T(150, 'try'), 'grin'], [T(150, 'fail'), 'dizzy']]), sweat: t > T(150, 'try') ? 1 : 0, pose: t > T(150, 'fail') ? 'scared' : 'stand', tilt: t > T(150, 'fail') ? Math.sin(t * 30) * 0.03 : 0 }); dolly(ctx, [[0, 1.5, 4.4], [0, 1.25, 0], 36], [[0, 1.45, 3.4], [0, 1.35, 0], 34]); });
  pop(PS(150), T(150, 'moment'), 'THIS IS IT.', { size: 110, y: 0.26 });
  ov({ type: 'counter', t0: T(150, 'thousand') - 0.1, t1: T(150, 'try') - 0.1, x: 0.36, y: 0.78, size: 64, box: true, icon: 'heart', text: t => `${Math.round(lerp(1, 1000, ease.out(range(t, T(150, 'thousand'), T(150, 'thousand') + 0.8))))} VERSIONS` });
  pop(T(150, 'fail'), PE(150) + 0.4, 'FAIL.', { size: 140, y: 0.74, colors: ['#ffffff', '#ff4f5e'], snd: 'fail_honk' });
  cut(PS(151) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.8, pose: 'sitKnees', expr: 'determined' }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.6, pose: 'sitKnees', expr: 'nervous', blush: 1 }); cu(ctx, 'you', { dist: 1.3, yaw: 0.3 }); });
  cut(PS(152) - 0.1, 'building', ['you', 'alex'], ctx => { const t = ctx.t; E(ctx); const ch = Math.sin(range(t, PS(152), PE(152) + 0.4) * Math.PI); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.8, pose: 'sitKnees', expr: 'determined', lean: -ch * 0.12 }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.6, pose: 'sitKnees', expr: 'nervous' }); cu(ctx, 'alex', { dist: 1.3, yaw: -0.25, push: 0.3 }); });
  fx(PS(152), 'riser', 0.5);
  const gran = T(153, 'granola');
  cut(PS(153) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.8, pose: 'sitKnees', expr: 'bored' }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.6, pose: 'sitKnees', expr: 'nervous' }); cu(ctx, 'alex', { dist: 1.4, yaw: -0.25 }); });
  mood(gran - 0.1, 'none');
  cut(gran + 0.15, 'building', ['you', 'alex'], ctx => { E(ctx); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.8, pose: 'sitKnees', expr: 'bored' }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.6, pose: 'sitKnees', expr: 'teeth', idle: 0.1 }); cu(ctx, 'you', { dist: 1.05, yaw: 0.3, push: 0.3, up: -0.12, fov: 32 }); });
  fx(gran - 0.05, 'record_scratch', 0.7);
  ov({ type: 'custom', t0: gran + 0.5, t1: PE(154), draw: (c, t) => { const a = Math.min(1, (t - gran - 0.5) / 0.3); c.save(); c.globalAlpha = a; c.strokeStyle = '#ffd34d'; c.lineWidth = 10; c.beginPath(); c.arc(1000, 700, 110 + Math.sin(t * 6) * 6, 0, 7); c.stroke(); c.fillStyle = '#ffd34d'; c.font = '54px "Lilita One"'; c.textAlign = 'left'; c.lineWidth = 10; c.strokeStyle = '#2a1048'; c.strokeText('GRANOLA', 1140, 620); c.fillText('GRANOLA', 1140, 620); c.restore(); } });
  fx(PS(154), 'crickets', 0.55, { dur: 1.6 });
  cut(PS(155) - 0.1, 'building', ['you'], ctx => { const t = ctx.t; E(ctx); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.6, pose: 'sitKnees', expr: t > T(155, 'slowly') + 0.2 ? 'embarrassed' : t > T(155, 'very') ? 'awkward' : 'teeth', idle: 0 }); const z = step(t, [[0, 0], [T(155, 'very'), 1], [T(155, 'slowly'), 2]]); cu(ctx, 'you', { dist: [1.5, 1.2, 0.95][z], yaw: 0.3 }); });
  ['very', 'slowly'].forEach(w => fx(T(155, w), 'zoom_whoosh', 0.45));
  cut(PS(156) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.8, pose: 'sitKnees', expr: 'grin' }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.6, pose: 'sitReach', expr: 'shocked' }); cu(ctx, 'you', { dist: 1.5, yaw: 0.3 }); ctx.shake = pulse(ctx.t, PS(156), PS(156) + 0.3) * 0.5; });
  pop(T(156, 'hour'), PE(156) + 0.6, 'AN HOUR?!', { size: 140, y: 0.26, colors: ['#ffffff', '#ffd34d'] });
  mood(PS(157), 'playful', 0.7);
  cut(PS(157) - 0.1, 'building', ['you', 'alex'], ctx => { const t = ctx.t; E(ctx); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.8, pose: 'sitCoverFace', expr: 'laugh', bob: Math.abs(Math.sin(t * 12)) * 0.015 }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.6, pose: 'sitKnees', expr: 'embarrassed' }); cu(ctx, 'alex', { dist: 1.6, yaw: -0.25 }); });
  cut(PS(158) - 0.1, 'building', ['you', 'alex'], ctx => { const t = ctx.t; E(ctx); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.6, pose: 'sitKnees', expr: 'laugh', bob: Math.abs(Math.sin(t * 12)) * 0.02 }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.6, pose: 'sitKnees', expr: t > T(158, 'so') ? 'laugh' : 'embarrassed', bob: t > T(158, 'so') ? Math.abs(Math.sin(t * 13)) * 0.02 : 0 }); twoSit(ctx, 2.8); });
  cut(PS(159) - 0.1, 'building', ['you', 'alex'], ctx => { const t = ctx.t; E(ctx); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.6, pose: 'sitKnees', expr: 'happy' }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.6, pose: 'sitKnees', expr: 'happy' }); twoSit(ctx, 3.2); });
  ov({ type: 'meter', t0: T(159, 'embarrassing') - 0.2, t1: PE(160) + 0.4, label: 'EMBARRASSMENT', x: 0.39, y: 0.14, w: 420, value: t => t < PS(160) ? range(t, T(159, 'embarrassing') - 0.2, T(159, 'embarrassing') + 0.6) : 1 - ease.inOut(range(t, PS(160), PE(160))) * 0.85, icon: 'x', valueText: t => t < PS(160) ? 'MAX' : 'LOL' });
  cut(PS(160) - 0.1, 'building', ['you', 'alex'], ctx => { const t = ctx.t; E(ctx); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.6, pose: 'sitKnees', expr: 'laugh', bob: Math.abs(Math.sin(t * 12)) * 0.015 }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.6, pose: 'sitKnees', expr: 'laugh', bob: Math.abs(Math.sin(t * 13)) * 0.015 }); twoSit(ctx, 2.6); });

  // ======================================================================== ACT 10 — why do you avoid me
  mood(PS(161), 'sad', 0.6);
  cut(PS(161) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.3, pose: 'sitKnees', expr: 'content' }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.3, pose: 'sitKnees', expr: 'content' }); ctx.S.cutFront = true; dolly(ctx, [[0, 1.3, 2.8], [0, 0.85, -0.6], 34], [[0.4, 2.2, 5.2], [0, 0.85, -0.6], 34]); });
  cut(PS(162) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.3, pose: 'sitHands', expr: 'sad', head: { pitch: 0.4 } }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.5, pose: 'sitKnees', expr: 'neutral' }); cu(ctx, 'alex', { dist: 1.6, yaw: -0.15, ly: -0.1 }); });
  cut(PS(163) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.6, pose: 'sitHands', expr: 'sad' }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.6, pose: 'sitKnees', expr: 'neutral', head: { pitch: 0.15 * Math.max(0, Math.sin((ctx.t - PS(163)) * 10)) } }); cu(ctx, 'you', { dist: 1.5, yaw: 0.3 }); });
  cut(PS(164) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.8, pose: 'sitHands', expr: 'sad' }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.6, pose: 'sitKnees' }); cu(ctx, 'alex', { dist: 1.35, yaw: -0.3, push: 0.2 }); });
  fx(PS(164), 'sting_soft', 0.45);
  cut(PS(165) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.8, pose: 'sitHands', expr: 'sad' }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.6, pose: 'sitKnees', expr: 'shocked', idle: 0 }); cu(ctx, 'you', { dist: 1.4, yaw: 0.3 }); });
  // P166 flashbacks
  const fb = (t0, t1) => { wash(t0, t1, '#6a8cff', 0.16, { inD: 0.2, outD: 0.2, mode: 'multiply' }); card(t0 + 0.1, t1 - 0.1, 'FLASHBACK'); };
  cut(PS(166) - 0.1, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t; E(ctx, { door: 0, floor: '8', lobby: true, lobbyLight: 1.1 }); const u = range(t, PS(166), T(166, 'whenever'));
    act(ctx, 'you', { pos: [lerp(-4, 1.5, u), 0, 4.2], rot: Math.PI / 2, walk: { phase: t * 8, amt: 1 }, expr: 'nervous', head: { pitch: 0.55 }, look: [0, 1] });
    act(ctx, 'alex', { pos: [lerp(3.5, -2, u), 0, 3.4], rot: -Math.PI / 2 + (u > 0.4 ? 0.6 : 0), walk: { phase: t * 8, amt: 1 }, pose: u > 0.4 && u < 0.75 ? 'wave' : 'stand', expr: 'smile' });
    look(ctx.cam, [0.4, 1.6, 8.4], [0, 1.1, 3.6], 36);
  });
  fb(PS(166) - 0.1, T(166, 'whenever') - 0.1);
  cut(T(166, 'whenever') - 0.1, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t; E(ctx, { door: 0, floor: 'L', lobby: true }); const u = ease.inOut(range(t, T(166, 'suddenly'), T(166, 'mail')));
    act(ctx, 'alex', { pos: [0.4, 0, FZ + 0.8], rot: Math.PI, pose: 'stand', expr: 'smile' });
    act(ctx, 'you', { pos: [lerp(-0.9, -5.9, u), 0, lerp(FZ + 1.0, FZ + 2.4, u)], rot: lerp(Math.PI * 0.8, -Math.PI / 2, ease.out(range(t, T(166, 'suddenly') - 0.3, T(166, 'suddenly') + 0.2))), walk: { phase: t * 10, amt: u > 0 && u < 1 ? 1 : 0 }, expr: 'nervous', pose: u >= 1 ? 'pressButton' : 'stand' });
    look(ctx.cam, [0.8, 2.2, FZ + 7.4], [-3.0, 1.0, FZ + 1.8], 46);
  });
  fb(T(166, 'whenever') - 0.1, T(166, 'last') - 0.1);
  cut(T(166, 'last') - 0.1, 'store', ['you', 'alex'], ctx => {
    const t = ctx.t; const cb = T(166, 'cereal'); ctx.S.collapse = t > cb - 0.15 ? t - (cb - 0.15) : -1;
    const u = ease.inOut(range(t, T(166, 'last'), cb - 0.1));
    act(ctx, 'alex', { pos: [2.4, 0, 2.4], rot: -0.9, pose: 'wave', expr: 'smile' });
    act(ctx, 'you', { pos: [lerp(1.2, 0.1, u), 0, lerp(2.6, 0.55, u)], rot: lerp(0.6, 2.6, ease.out(range(t, T(166, 'last'), T(166, 'last') + 0.6))), walk: { phase: t * 9, amt: u < 1 ? 0.9 : 0 }, expr: t > cb ? 'dizzy' : 'nervous', pose: t > cb ? 'scared' : 'stand' });
    look(ctx.cam, [-2.6, 1.8, 5.6], [0.6, 1.0, 1.0], 40); ctx.shake = pulse(t, cb - 0.1, cb + 0.5) * 0.6;
  });
  fb(T(166, 'last') - 0.1, PE(166) + 0.2); card(T(166, 'last'), T(166, 'cereal'), 'LAST WEEK');
  fx(T(166, 'cereal') - 0.1, 'cardboard_crash', 0.8);
  cut(PS(167) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.8, pose: 'sitHands', expr: 'sad' }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.4, pose: 'sitKnees', expr: 'wince' }); cu(ctx, 'you', { dist: 1.5, yaw: 0.2 }); });
  think(T(167, 'cereal', 1) - 0.4, PE(167) + 0.3, aw('you', 0.85), 'the cereal boxes…', { dx: -150 });
  cut(PS(168) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.5, pose: 'sitHug', expr: 'sad', head: { pitch: 0.25 } }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.6, pose: 'sitKnees', expr: 'sad' }); cu(ctx, 'alex', { dist: 1.6, yaw: -0.15 }); });
  cut(T(168, 'moved') - 0.1, 'cafeteria', ['alex', 'npc1', 'npc2', 'npc3', 'npc4'], ctx => {
    const tb = sets.cafeteria.tables; const tp0 = (i, s) => [tb[i].position.x + (s || 0), 0, tb[i].position.z - 0.75];
    act(ctx, 'alex', { pos: tp0(4, 0), rot: 0, pose: 'sitChair', expr: 'sad', head: { pitch: 0.3 } });
    act(ctx, 'npc1', { pos: tp0(0, -0.5), rot: 0, pose: 'sitChair', expr: 'laugh' }); act(ctx, 'npc2', { pos: tp0(0, 0.5), rot: 0, pose: 'sitChair', expr: 'happy' }); act(ctx, 'npc3', { pos: tp0(2, -0.4), rot: 0, pose: 'sitChair', expr: 'smile' }); act(ctx, 'npc4', { pos: tp0(2, 0.5), rot: 0, pose: 'sitChair', expr: 'happy' });
    dolly(ctx, [[0.4, 3.0, 6.5], [0, 0.8, 0.5], 40], [[0.2, 2.6, 5.8], [0, 0.8, 0.6], 38]);
  });
  wash(T(168, 'moved') - 0.1, T(168, 'thought') - 0.1, '#6a8cff', 0.18, { inD: 0.2, outD: 0.2, mode: 'multiply' });
  pill(T(168, 'know'), T(168, 'thought') - 0.1, 'NEW KID · MID-YEAR', 0.5, 0.775, { icon: 'dot' });
  cut(T(168, 'thought') - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.5, pose: 'sitHug', expr: 'sad', head: { pitch: 0.25 } }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.6, pose: 'sitKnees', expr: 'sad' }); cu(ctx, 'alex', { dist: 1.45, yaw: -0.15, push: 0.2 }); });
  cut(PS(169) - 0.1, 'void', ['you', 'alex'], ctx => {
    const t = ctx.t; voidMode({ color: t > T(169, 'lonely') - 0.2 ? '#1f2a7a' : '#4425c8' });
    act(ctx, 'you', { pos: [-1.3, 0, 0], rot: 0.2, expr: 'nervous', pose: 'pockets', look: [0, 0.6] }); act(ctx, 'alex', { pos: [1.3, 0, 0], rot: -0.2, expr: t > T(169, 'lonely') - 0.2 ? 'sad' : 'neutral', pose: 'stand' });
    dolly(ctx, [[0, 1.6, 6.2], [0, 1.1, 0], 36], [[0, 1.6, 5.4], [0, 1.1, 0], 36]);
  });
  pill(T(169, 'shy'), PE(169) + 0.5, 'WHAT YOU FELT: SHY', 0.3, 0.2, { icon: 'dot' });
  pill(T(169, 'differently'), PE(169) + 0.5, 'WHAT ALEX SAW: ?', 0.7, 0.2, { icon: 'q' });
  pop(T(169, 'lonely'), PE(169) + 0.6, 'LONELY.', { size: 120, x: 0.7, y: 0.75, colors: ['#ffffff', '#8fb6ff'], snd: 'sting_soft' });
  cut(PS(170) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.6, pose: 'sitHug', expr: 'sad' }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.7, pose: 'sitHands', expr: ctx.t > T(170, 'nervous') ? 'embarrassed' : 'sad', blush: ctx.t > T(170, 'nervous') ? 1 : 0.4 }); cu(ctx, 'you', { dist: 1.6, yaw: 0.3, push: 0.15 }); });
  mood(PS(170), 'tender', 0.6);
  cut(PS(171) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.75, pose: 'sitKnees', expr: 'surprised', head: { roll: ease.out(range(ctx.t, PS(171), PS(171) + 0.5)) * 0.25 } }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.7, pose: 'sitKnees', expr: 'embarrassed' }); cu(ctx, 'alex', { dist: 1.5, yaw: -0.25 }); });
  ov({ type: 'symbol', t0: T(171, 'nervous'), t1: PE(171) + 0.5, whoA: aw('alex', 0.8), sym: '?', dx: 90, color: '#ffd34d' });
  mood(PS(172), 'none');
  cut(PS(172) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.75, pose: 'sitKnees', expr: 'surprised' }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.7, pose: 'sitKnees', expr: 'nervous', idle: 0 }); cu(ctx, 'you', { dist: 1.5, yaw: 0.3, push: 0.45 }); });
  fx(PS(172), 'drone_hit', 0.4); fx(PS(173), 'heartbeat', 0.7);
  cut(PS(173) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.75, pose: 'sitKnees' }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.7, pose: 'sitKnees', expr: 'nervous', idle: 0 }); cu(ctx, 'you', { dist: 0.95, yaw: 0.3, fov: 30 }); });
  cut(PS(174) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.2, pose: 'sitKnees', expr: 'surprised', head: { pitch: -0.3 } }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.1, pose: 'sitKnees', expr: 'surprised', head: { pitch: -0.3 } }); drift(ctx, [-0.6, 1.35, 0.85], [-0.98, 1.6, FZ], 38); });
  fx(T(174, 'crackles'), 'static', 0.6, { dur: 1.0 });
  cut(PS(175) - 0.1, 'office', ['maint'], ctx => { act(ctx, 'maint', { pos: [0, 0, -0.25], rot: 0, pose: 'sitChair', expr: 'smile' }); cu(ctx, 'maint', { dist: 1.6, yaw: -0.2 }); });
  cut(PS(176) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.2, pose: 'sitKnees', expr: 'neutral' }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.2, pose: 'sitKnees', expr: 'neutral' }); twoSit(ctx, 3.0); });
  const countdown = (t0, t1, from = 300) => ov({ type: 'counter', t0, t1, x: 0.05, y: 0.12, size: 60, box: true, icon: 'clock', text: t => { const s = Math.max(0, from - (t - t0)); return `0${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`; } });
  countdown(T(175, 'five'), PE(185) + 1.0);

  // ======================================================================== ACT 11 — the confession
  mood(PS(177), 'longing', 0.7);
  cut(PS(177) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.1, pose: 'sitKnees', expr: 'content' }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.1, pose: 'sitKnees', expr: 'sad' }); ctx.S.cutFront = true; dolly(ctx, [[0, 1.0, 2.6], [0, 0.85, -0.6], 34], [[0, 1.0, 2.2], [0, 0.85, -0.6], 34]); });
  // P178 montage of "normal"
  const grey = (t0, t1) => wash(t0, t1, '#8a8aa8', 0.35, { mode: 'saturation', inD: 0.2, outD: 0.2 });
  cut(PS(178) - 0.1, 'building', ['you', 'alex'], ctx => { const t = ctx.t; E(ctx, { door: ease.inOut(range(t, PS(178), T(178, 'normal'))), light: 1.0, tint: '#ffffff' }); ctx.S.lobby = true; act(ctx, 'alex', { pos: [0.45, 0, 0.25], rot: 0, pose: 'stand' }); act(ctx, 'you', { pos: [-0.45, 0, 0.25], rot: 0 }); look(ctx.cam, [0, 2.7, -2.6], [0, 1.3, 3], 44); });
  cut(T(178, 'alex') - 0.1, 'stack', ['alex'], ctx => { stack.rooms.alex.add(cast.alex.root); act(ctx, 'alex', { pos: [-0.5, 0, 0.2], rot: 0.3, pose: 'stand', expr: 'sad' }); dolly(ctx, [[0, 4.6, 6.0], [0, 4.2, 0], 36], [[0, 4.6, 5.2], [0, 4.2, 0], 36]); }, { onCast: true });
  grey(T(178, 'alex') - 0.1, T(178, 'you') - 0.1);
  cut(T(178, 'you') - 0.1, 'classroom', ['you', 'alex', 'npc1', 'npc2', 'npc3'], ctx => {
    const D = sets.classroom.desks; const dp = (i) => [D[i].position.x, 0, D[i].position.z + 0.55];
    act(ctx, 'alex', { pos: dp(1), rot: Math.PI, pose: 'sitChair' }); act(ctx, 'you', { pos: dp(7), rot: Math.PI, pose: 'sitChair', expr: 'sad', head: { pitch: 0.5 } });
    act(ctx, 'npc1', { pos: dp(4), rot: Math.PI, pose: 'sitChair' }); act(ctx, 'npc2', { pos: dp(0), rot: Math.PI, pose: 'sitChair' }); act(ctx, 'npc3', { pos: dp(5), rot: Math.PI, pose: 'sitChair' });
    dolly(ctx, [[-1.8, 2.9, 4.4], [0, 0.8, -0.6], 40], [[-1.6, 2.8, 4.0], [0, 0.8, -0.6], 38]);
  });
  grey(T(178, 'you') - 0.1, T(178, 'and', 0) - 0.1);
  cut(T(178, 'strange') - 0.3, 'building', ['you', 'alex'], ctx => { E(ctx, { light: 0.85, tint: '#ffe8f2' }); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.5, pose: 'sitKnees', expr: 'laugh' }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.5, pose: 'sitKnees', expr: 'laugh' }); ctx.S.cutFront = true; dolly(ctx, [[0.5, 2.6, 5.4], [0, 1.0, -0.4], 34], [[0.3, 1.8, 4.0], [0, 0.9, -0.5], 34]); });
  list(T(178, 'strange'), T(178, 'funny') - 0.1, [{ text: 'STRANGE', icon: 'q', t: T(178, 'strange') }, { text: 'AWFUL', icon: 'x', t: T(178, 'awful') }, { text: 'AMAZING', icon: 'heart', t: T(178, 'amazing') }], 0.06, 0.2);
  cut(T(178, 'funny') - 0.1, 'void', ['you', 'alex'], ctx => { voidMode({ color: '#3a22a8' }); act(ctx, 'you', { pos: [-0.9, 0, 0], rot: 0.2, expr: 'smile' }); act(ctx, 'alex', { pos: [0.9, 0, 0], rot: -0.2, expr: 'smile' }); dolly(ctx, [[0, 1.5, 5.0], [0, 1.1, 0], 36], [[0, 2.8, 8.0], [0, 1.0, 0], 36]); });
  pill(T(178, 'funny'), PE(178) + 0.4, 'JUST A FUNNY STORY', 0.5, 0.775, { icon: 'dot' });
  cut(PS(179) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.1, pose: 'sitKnees', expr: 'content' }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.3, pose: 'sitKnees', expr: 'determined' }); cu(ctx, 'you', { dist: 1.4, yaw: 0.3, push: 0.3 }); });
  fx(T(179, 'say'), 'riser_short', 0.45);
  cut(PS(180) - 0.1, 'void', ['you'], ctx => { const t = ctx.t; voidMode({ color: '#2a1f70' }); act(ctx, 'you', { pos: [0.8, 0, 0], rot: -0.3, expr: t > T(180, 'years') ? 'dizzy' : 'nervous', pose: step(t, [[0, 'armsCrossed'], [T(180, 'awkward'), 'handsFace'], [T(180, 'same'), 'scared']]), sweat: 1 }); dolly(ctx, [[0.4, 1.5, 5.2], [0.4, 1.15, 0], 36], [[0.6, 1.5, 4.2], [0.6, 1.2, 0], 36]); });
  list(PS(180) + 0.5, PE(180) + 0.5, [{ text: "DOESN'T FEEL THE SAME", icon: 'x', t: T(180, 'feel') }, { text: 'AWKWARD FOREVER', icon: 'x', t: T(180, 'awkward') }, { text: 'SAME BUILDING', icon: 'x', t: T(180, 'same') }, { text: 'SAME ELEVATOR · FOR YEARS', icon: 'x', t: T(180, 'riding') }], 0.06, 0.2, { title: 'WHAT COULD GO WRONG' });
  ov({ type: 'counter', t0: T(180, 'years') - 0.1, t1: PE(180) + 0.5, x: 0.6, y: 0.82, size: 60, box: true, icon: 'clock', text: t => `${2026 + Math.floor(ease.out(range(t, T(180, 'years'), PE(180))) * 6)}` });
  fx(T(180, 'years'), 'counter_roll', 0.45);
  cut(PS(181) - 0.1, 'void', ['you'], ctx => { voidMode({ color: '#4a2bd8' }); act(ctx, 'you', { pos: [0, 0, 0], rot: 0, expr: 'thinking' }); dolly(ctx, [[0, 1.5, 4.0], [0, 1.25, 0], 36], [[0, 1.5, 3.4], [0, 1.3, 0], 36]); });
  fx(PS(181), 'whoosh', 0.4);
  // P182 alt timeline: you say nothing
  cut(PS(182) - 0.1, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t; const op = T(182, 'doors'); E(ctx, { door: ease.inOut(range(t, op, op + 1.0)), light: 1, tint: '#ffffff', lobby: true });
    const w = range(t, op + 0.6, op + 3.0);
    act(ctx, 'alex', { pos: [lerp(0.45, 0.6, w), 0, lerp(0.25, FZ + 3.0, w)], rot: w > 0 ? 0 : -0.2, walk: { phase: t * 8, amt: w > 0 && w < 1 ? 1 : 0 }, expr: 'neutral' });
    act(ctx, 'you', { pos: [-0.45, 0, 0.25], rot: 0.1, expr: 'sad', pose: 'pockets' });
    look(ctx.cam, [-0.1, 2.7, -2.6], [0.2, 1.3, 3], 44);
  });
  grey(PS(182) - 0.1, T(182, 'wondering') - 0.1); card(PS(182), T(182, 'wondering'), 'IF YOU SAY NOTHING…');
  fx(T(182, 'doors'), 'ding', 0.45); fx(T(182, 'doors') + 0.1, 'door_slide', 0.5);
  cut(T(182, 'wondering') - 0.1, 'classroom', ['you', 'alex', 'npc2'], ctx => {
    const D = sets.classroom.desks; const dp = (i) => [D[i].position.x, 0, D[i].position.z + 0.55];
    act(ctx, 'alex', { pos: dp(1), rot: Math.PI, pose: 'sitChair' }); act(ctx, 'you', { pos: dp(7), rot: Math.PI, pose: 'sitChair', expr: 'sad', head: { pitch: -0.1, roll: 0.1 } });
    act(ctx, 'npc2', { pos: dp(0), rot: Math.PI, pose: 'sitChair' });
    cu(ctx, 'you', { dist: 1.5, yaw: 0.25, push: 0.2 });
  });
  grey(T(182, 'wondering') - 0.1, PE(182) + 0.2);
  think(T(182, 'wondering') + 0.3, PE(182) + 0.2, aw('you', 0.9), 'what if…?', { dx: -120 });
  pop(T(182, 'ten'), PE(182) + 0.5, '10 SECONDS', { size: 110, y: 0.26, colors: ['#ffffff', '#ffd34d'] });
  cut(PS(183) - 0.1, 'void', ['you', 'alex'], ctx => { const t = ctx.t; voidMode({ color: '#3a22a8' }); act(ctx, 'you', { pos: [-1.1, 0, 0], rot: 0.35, expr: 'surprised' }); act(ctx, 'alex', { pos: [1.1, 0, 0], rot: -0.35, expr: 'sad', look: [0, 0.4] }); dolly(ctx, [[0, 1.5, 5.4], [0, 1.1, 0], 36], [[0, 1.5, 4.6], [0, 1.15, 0], 36]); });
  ov({ type: 'symbol', t0: T(183, 'guessing') - 0.3, t1: PE(183) + 0.4, whoA: aw('alex', 0.8), sym: '?', color: '#ffd34d', dx: 70 });
  pill(T(183, 'quiet'), T(183, 'sometimes'), 'QUIET ≠ SAFE', 0.5, 0.775, { icon: 'x' });
  // P184 deep breath — courage
  mood(PS(184), 'none');
  cut(PS(184) - 0.1, 'building', ['you', 'alex'], ctx => { const t = ctx.t; E(ctx); const ch = Math.sin(range(t, PS(184), PE(184) + 0.5) * Math.PI); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.3, pose: 'sitKnees', expr: 'surprised' }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.6, pose: 'sitKnees', expr: 'determined', lean: -ch * 0.15 }); cu(ctx, 'you', { dist: 1.3, yaw: 0.3, push: 0.25 }); });
  ov({ type: 'meter', t0: PS(184) - 0.1, t1: PS(185) + 0.8, label: 'COURAGE', x: 0.39, y: 0.14, w: 420, value: t => ease.inOut(range(t, PS(184), PE(184) + 0.3)), icon: 'heart', c0: '#ffd34d', c1: '#ff7eb6' });
  fx(PS(184) - 0.1, 'riser', 0.55);
  cut(PS(185) - 0.1, 'building', ['you', 'alex'], ctx => { const t = ctx.t; E(ctx, { light: 0.75, tint: '#ffe4f0' }); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.75, pose: 'sitKnees', expr: 'surprised' }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.75, pose: 'sitHands', expr: t > T(185, 'like', 1) ? 'embarrassed' : 'nervous', blush: 1 }); cu(ctx, 'you', { dist: 1.6, yaw: 0.35, push: 0.35 }); });
  mood(PS(185) + 0.5, 'pad', 0.45);
  cut(PS(186) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx, { light: 0.75, tint: '#ffe4f0' }); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.75, pose: 'sitKnees', expr: 'surprised', idle: 0 }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.75, pose: 'sitHands', expr: 'embarrassed', idle: 0 }); twoSit(ctx, 2.6, 32); });
  ov({ type: 'custom', t0: PS(186), t1: PE(189), draw: (c, t) => { const a = Math.min(1, (t - PS(186)) / 0.6, (PE(189) - t) / 0.5) * 0.85; c.save(); c.globalAlpha = a; c.font = 'italic bold 40px "Libre Baskerville"'; c.textAlign = 'center'; c.fillStyle = '#fff'; c.shadowColor = 'rgba(0,0,0,0.6)'; c.shadowBlur = 12; c.fillText('"…I kind of like you."', 960, 300 + Math.sin(t * 1.2) * 8); c.restore(); } });
  cut(PS(187) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx, { light: 0.75, tint: '#ffe4f0' }); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.75, pose: 'sitKnees', expr: 'surprised', idle: 0, blink: false }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.75, pose: 'sitHands' }); cu(ctx, 'alex', { dist: 1.5, yaw: -0.3, push: 0.2 }); });
  cut(PS(188) - 0.1, 'building', ['you', 'alex'], ctx => { const t = ctx.t; E(ctx, { light: 0.75, tint: '#ffe4f0' }); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.75, pose: 'sitKnees', expr: 'surprised', idle: 0 }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.75, pose: 'sitHands', expr: 'nervous', sweat: 1, idle: 0 }); const z = step(t, [[0, 0], [T(188, 'two'), 1], [T(188, 'three'), 2]]); cu(ctx, 'you', { dist: [1.6, 1.3, 1.05][z], yaw: 0.35 }); });
  ['one', 'two', 'three'].forEach(w => { fx(T(188, w), 'heartbeat', 0.75); fx(T(188, w), 'clock_tick', 0.4); });
  ov({ type: 'counter', t0: PS(188), t1: PE(188) + 0.3, x: 0.42, y: 0.16, size: 64, box: true, text: t => `${step(t, [[0, 1], [T(188, 'two'), 2], [T(188, 'three'), 3]])} SEC` });
  cut(PS(189) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx, { light: 0.75, tint: '#ffe4f0' }); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.75, pose: 'sitKnees', expr: 'surprised', idle: 0 }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.75, pose: 'sitHands', expr: 'nervous', idle: 0 }); ctx.S.cutFront = true; dolly(ctx, [[0, 0.95, 2.0], [0, 0.95, -0.6], 34], [[0, 0.95, 1.5], [0, 0.95, -0.6], 34], ease.linear); });
  { for (let t = PS(189); t < PE(189); t += 0.55) fx(t, 'heartbeat', 0.5); fx(PS(189), 'clock_tick_slow', 0.5, { dur: 2.4 }); }
  cut(PS(190) - 0.1, 'building', ['you', 'alex'], ctx => { const t = ctx.t; E(ctx, { light: 0.78, tint: '#ffe4f0' }); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.75, pose: 'sitKnees', expr: t > T(190, 'laughing') - 0.3 ? 'laugh' : 'surprised', bob: t > T(190, 'laughing') ? Math.abs(Math.sin(t * 12)) * 0.015 : 0 }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.75, pose: 'sitHands' }); cu(ctx, 'alex', { dist: 1.6, yaw: -0.3 }); });
  cut(PS(191) - 0.1, 'building', ['you', 'alex'], ctx => { const t = ctx.t; E(ctx, { light: 0.78, tint: '#ffe4f0' }); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.75, pose: t > T(191, 'covers') ? 'sitCoverFace' : 'sitKnees', expr: t > T(191, 'covers') ? 'embarrassed' : 'laugh', blush: 1 }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.75, pose: 'sitHands', expr: t > T(191, 'until') ? 'surprised' : 'sad' }); if (t < T(191, 'until')) cu(ctx, 'you', { dist: 1.4, yaw: 0.35 }); else cu(ctx, 'alex', { dist: 1.6, yaw: -0.3 }); });
  fx(T(191, 'sinks'), 'sad_drop', 0.5);
  ov({ type: 'custom', t0: T(191, 'sinks'), t1: T(191, 'until'), draw: (c, t) => { const p = ease.in(range(t, T(191, 'sinks'), T(191, 'until'))); c.save(); c.globalAlpha = 1 - p * 0.5; c.translate(1500, 300 + p * 520); c.rotate(p * 0.5); c.beginPath(); c.moveTo(0, 30); c.bezierCurveTo(-90, -30, -50, -100, 0, -50); c.bezierCurveTo(50, -100, 90, -30, 0, 30); c.fillStyle = '#ff5f8f'; c.fill(); c.lineWidth = 6; c.strokeStyle = '#2a1048'; c.stroke(); c.restore(); } });
  cut(PS(192) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx, { light: 0.8, tint: '#ffe4f0' }); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.75, pose: 'sitCoverFace', expr: 'embarrassed', blush: 1 }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.75, pose: 'sitHands', expr: 'surprised' }); cu(ctx, 'alex', { dist: 1.6, yaw: -0.3 }); });
  pill(T(192, 'eight'), T(192, 'don\'t'), 'EVERY DAY · 8:00 AM', 0.5, 0.775, { icon: 'clock' });
  pill(T(192, 'thirty') - 0.4, PE(192) + 0.4, 'NEEDS TO LEAVE: 8:30', 0.5, 0.28, { icon: 'clock' });
  cut(PS(193) - 0.1, 'building', ['you', 'alex'], ctx => { const t = ctx.t; E(ctx, { light: 0.8, tint: '#ffe4f0' }); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.75, pose: 'sitCoverFace' }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.75, pose: 'sitHands', expr: 'shocked', forceBlink: t > PS(193) && t < PS(193) + 0.14 }); cu(ctx, 'you', { dist: 1.4, yaw: 0.35 }); });
  fx(PS(193), 'blink', 0.6);
  mood(PS(194), 'romance', 0.8);
  cut(PS(194) - 0.1, 'building', ['you', 'alex'], ctx => { const t = ctx.t; E(ctx, { light: 0.85, tint: '#ffe0f0' }); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.75, pose: t > T(194, 'like') ? 'sitKnees' : 'sitCoverFace', expr: t > T(194, 'like') ? 'love' : 'peek', blush: 1 }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.75, pose: 'sitHands', expr: 'surprised' }); cu(ctx, 'alex', { dist: 1.45, yaw: -0.3, push: 0.2 }); });
  ov({ type: 'symbol', t0: T(194, 'too'), t1: PE(194) + 1.2, whoA: aw('alex', 0.7), sym: 'hearts', scale: 1.4 });
  wash(T(194, 'too'), PE(194) + 1.0, '#ff7eb6', 0.16);
  fx(T(194, 'too'), 'sparkle', 0.7); fx(T(194, 'too'), 'heartbeat', 0.6);

  // ======================================================================== ACT 12 — doors open
  cut(PS(195) - 0.1, 'building', ['you', 'alex', 'tech', 'patterson', 'friend'], ctx => {
    const t = ctx.t; const op = T(195, 'doors'); E(ctx, { door: ease.inOut(range(t, op + 0.3, op + 1.5)), floor: '7' }); ctx.S.lobby = true;
    const st = ease.inOut(range(t, PS(195), T(195, 'lights')));
    act(ctx, 'alex', { pos: [lerp(SIT_ALEX2[0], 0.5, st), 0, lerp(SIT_ALEX2[2], 0.15, st)], rot: lerp(-0.75, 0, st), poseMix: { a: 'sitKnees', b: 'stand', u: st }, expr: 'surprised' });
    act(ctx, 'you', { pos: [lerp(SIT_YOU2[0], -0.5, st), 0, lerp(SIT_YOU2[2], 0.15, st)], rot: lerp(0.75, 0, st), poseMix: { a: 'sitHands', b: 'stand', u: st }, expr: 'surprised' });
    act(ctx, 'tech', { pos: [0.9, 0, FZ + 1.6], rot: Math.PI, expr: 'tired' }); act(ctx, 'patterson', { pos: [-1.0, 0, FZ + 1.9], rot: Math.PI, expr: 'surprised', scale: 0.92 }); act(ctx, 'friend', { pos: [0, 0, FZ + 2.4], rot: Math.PI, pose: 'phone', expr: 'grin' });
    drift(ctx, [0.1, 2.5, -2.2], [0, 1.25, FZ + 1.5], 44); ctx.shake = pulse(t, PS(195), PS(195) + 0.8) * 0.5;
  });
  fx(PS(195), 'shudder', 0.55); fx(T(195, 'lights'), 'lights_on', 0.6); fx(T(195, 'doors') - 0.1, 'ding', 0.8); fx(T(195, 'doors') + 0.3, 'door_slide', 0.8);
  mood(T(195, 'doors'), 'joy', 0.75);
  cut(PS(196) - 0.1, 'building', ['you', 'alex', 'tech', 'patterson', 'friend'], ctx => {
    const t = ctx.t; E(ctx, { door: 1, floor: '7' }); ctx.S.lobby = true; props(ctx, { phoneFriend: true });
    catHall.visible = true; catHall.position.set(-1.3, 0, FZ + 1.6); catHall.rotation.y = 2.4;
    act(ctx, 'alex', { pos: [0.5, 0, 0.15], rot: 0, pose: 'stand', expr: 'awkward' }); act(ctx, 'you', { pos: [-0.5, 0, 0.15], rot: 0, pose: 'stand', expr: 'awkward' });
    act(ctx, 'tech', { pos: [0.9, 0, FZ + 1.6], rot: Math.PI - 0.2, expr: 'tired', pose: 'slump' }); act(ctx, 'patterson', { pos: [-1.0, 0, FZ + 1.9], rot: Math.PI + 0.2, expr: 'surprised', scale: 0.92 }); act(ctx, 'friend', { pos: [0, 0, FZ + 2.4], rot: Math.PI, pose: 'phone', expr: 'grin' });
    const sh = step(t, [[0, 0], [T(196, 'technician'), 1], [T(196, 'patterson'), 2], [T(196, 'best'), 3]]);
    const tg = [[0, 1.3, FZ + 1.6], [0.9, 1.4, FZ + 1.6], [-1.0, 1.35, FZ + 1.9], [0, 1.4, FZ + 2.4]][sh];
    const cp = [[0.1, 2.5, -2.2], [0.25, 1.75, FZ + 0.1], [-0.45, 1.7, FZ + 0.2], [0.15, 1.75, FZ + 0.5]][sh];
    drift(ctx, cp, tg, [44, 36, 36, 34][sh]);
  }, { after: () => { catHall.visible = false; } });
  fx(T(196, 'crowd'), 'crowd_gasp', 0.55);
  pill(T(196, 'technician'), T(196, 'patterson'), 'VERY TIRED TECHNICIAN', 0.5, 0.775, { icon: 'bolt' }); pill(T(196, 'patterson'), T(196, 'best'), 'MRS. PATTERSON (+ CAT)', 0.5, 0.775, { icon: 'heart' }); pill(T(196, 'best'), PE(196) + 0.3, 'YOUR BEST FRIEND', 0.5, 0.775, { icon: 'dot' });
  fx(T(196, 'recording'), 'rec_beep', 0.6); fx(T(196, 'patterson') + 0.6, 'cat_meow', 0.45);
  const rec = (t0, t1) => ov({ type: 'custom', t0, t1, draw: (c, t) => { c.save(); c.strokeStyle = '#fff'; c.lineWidth = 8; const m = 90, L = 90; [[m, m, 1, 1], [1920 - m, m, -1, 1], [m, 1080 - m, 1, -1], [1920 - m, 1080 - m, -1, -1]].forEach(([x, y, sx, sy]) => { c.beginPath(); c.moveTo(x, y + sy * L); c.lineTo(x, y); c.lineTo(x + sx * L, y); c.stroke(); }); if (Math.floor(t * 2) % 2 === 0) { c.fillStyle = '#ff3b3b'; c.beginPath(); c.arc(170, 160, 16, 0, 7); c.fill(); } c.fillStyle = '#fff'; c.font = 'bold 36px Fredoka'; c.fillText('REC', 200, 172); const s = Math.floor(t - t0 + 12); c.fillText(`00:00:${String(s).padStart(2, '0')}`, 1560, 172); c.restore(); } });
  cut(PS(197) - 0.1, 'building', ['you', 'alex', 'friend'], ctx => {
    E(ctx, { door: 1, floor: '7' }); ctx.S.lobby = true;
    act(ctx, 'alex', { pos: [0.5, 0, 0.15], rot: 0, pose: 'stand', expr: 'awkward' }); act(ctx, 'you', { pos: [-0.5, 0, 0.15], rot: 0, pose: 'stand', expr: 'awkward' }); act(ctx, 'friend', { pos: [0, 0, FZ + 2.4], rot: Math.PI, pose: 'phone', expr: 'grin' });
    look(ctx.cam, [0.05, 1.55, FZ + 2.0], [0, 1.45, 0.15], 40);
  });
  rec(PS(197) - 0.1, PS(198) - 0.1);
  cut(PS(198) - 0.1, 'building', ['you', 'alex'], ctx => { const t = ctx.t; E(ctx, { door: 1, floor: '7' }); act(ctx, 'alex', { pos: [0.5, 0, 0.15], rot: t > T(198, 'alex', 1) ? -0.8 : 0, pose: 'stand', expr: 'smile' }); act(ctx, 'you', { pos: [-0.5, 0, 0.15], rot: t > PS(198) + 0.2 ? 0.8 : 0, pose: 'stand', expr: 'smile' }); ctx.S.cutFront = true; look(ctx.cam, [0, 1.75, 3.4], [0, 1.5, 0.15], 36); });
  cut(PS(199) - 0.1, 'building', ['you', 'alex', 'friend', 'tech', 'patterson'], ctx => {
    const t = ctx.t; E(ctx, { door: 1, floor: '7' }); ctx.S.lobby = true; props(ctx, { phoneFriend: true });
    act(ctx, 'alex', { pos: [0.5, 0, 0.15], rot: -0.3, pose: 'stand', expr: 'grin' }); act(ctx, 'you', { pos: [-0.5, 0, 0.15], rot: 0.3, pose: 'stand', expr: 'grin' });
    act(ctx, 'friend', { pos: [0, 0, FZ + 2.4], rot: Math.PI, pose: 'cheer', expr: 'laugh' }); act(ctx, 'tech', { pos: [0.9, 0, FZ + 1.6], rot: Math.PI - 0.2, expr: 'smile' }); act(ctx, 'patterson', { pos: [-1.0, 0, FZ + 1.9], rot: Math.PI + 0.2, expr: 'happy', scale: 0.92 });
    drift(ctx, [0.3, 1.7, FZ + 4.2], [0, 1.3, 0.4], 40);
  });
  pop(T(199, 'weird') + 0.1, PE(199) + 0.8, 'SO WEIRD.', { size: 130, y: 0.26, colors: ['#ffffff', '#ff7eb6'] });
  fx(T(199, 'weird') + 0.2, 'crowd_aww', 0.5);

  // ======================================================================== ACT 13 — next morning, stairs, lunch
  mood(PS(200), 'morning', 0.75);
  card(PS(200) + 0.1, PS(201), 'THE NEXT MORNING · 8:00 AM');
  cut(PS(200) - 0.2, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t; const pr = T(200, 'press'); E(ctx, { door: 0, floor: '9', arrow: 'down', light: 1, tint: '#fff', lobby: true });
    sets.building.drawPlaque('8');
    act(ctx, 'you', { pos: [0.85, 0, FZ + 0.75], rot: 2.75, poseMix: tp(t, pr, 'stand', 'pressButton', 0.3), expr: 'content' });
    act(ctx, 'alex', { pos: [0.4, 0, -0.3], rot: 0, expr: 'smile' });
    dolly(ctx, [[2.9, 2.6, FZ + 4.8], [0.5, 1.3, FZ], 38], [[2.6, 2.5, FZ + 4.2], [0.5, 1.3, FZ], 36]);
  }, { after: () => sets.building.drawPlaque('L') });
  fx(T(200, 'press') + 0.2, 'button', 0.7); fx(T(200, 'eight', 1), 'clock_chime', 0.35);
  cut(PS(201) - 0.1, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t; E(ctx, { door: ease.inOut(range(t, PS(201), PS(201) + 1.2)), floor: '8', light: 1, tint: '#fff', lobby: true });
    sets.building.drawPlaque('8');
    act(ctx, 'you', { pos: [0.75, 0, FZ + 1.2], rot: Math.PI + 0.35, expr: 'content' }); act(ctx, 'alex', { pos: [0.1, 0, -0.2], rot: 0, expr: t > T(201, 'smiling') - 0.2 ? 'grin' : 'smile', pose: 'wave' });
    dolly(ctx, [[-0.4, 2.3, FZ + 4.0], [0.1, 1.4, -0.2], 36], [[-0.3, 2.2, FZ + 3.5], [0.1, 1.45, -0.2], 32]);
  }, { after: () => sets.building.drawPlaque('L') });
  fx(PS(201) - 0.1, 'ding', 0.7); fx(PS(201), 'door_slide', 0.65); fx(T(201, 'smiling'), 'sparkle', 0.45);
  cut(PS(202) - 0.1, 'building', ['you', 'alex'], ctx => {
    const t = ctx.t; E(ctx, { door: 1, floor: '8', light: 1, tint: '#fff', lobby: true });
    act(ctx, 'you', { pos: [0.75, 0, FZ + 1.2], rot: Math.PI + 0.35, expr: t > T(202, 'alex') ? 'smile' : 'thinking', head: { pitch: t > T(202, 'alex') ? 0 : -0.35, yaw: t > T(202, 'alex') ? 0 : 0.5 } }); act(ctx, 'alex', { pos: [0.1, 0, -0.2], rot: 0, expr: 'grin' });
    cu(ctx, 'you', { dist: 1.6, yaw: 0.3 });
  });
  cut(PS(203) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx, { door: 1, floor: '8', light: 1, tint: '#fff', lobby: true }); act(ctx, 'you', { pos: [0.75, 0, FZ + 1.2], rot: Math.PI + 0.35, expr: 'smile' }); act(ctx, 'alex', { pos: [0.1, 0, -0.2], rot: 0, expr: 'grin', pose: 'point', head: { roll: 0.1 } }); cu(ctx, 'alex', { dist: 1.7, yaw: 0.2 }); });
  cut(PS(204) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx, { door: 1, floor: '8', light: 1, tint: '#fff', lobby: true }); act(ctx, 'you', { pos: [0.75, 0, FZ + 1.2], rot: Math.PI + 0.35, expr: 'content' }); act(ctx, 'alex', { pos: [0.1, 0, -0.2], rot: 0, expr: 'grin' }); cu(ctx, 'you', { dist: 1.6, yaw: -0.2 }); });
  cut(PS(205) - 0.1, 'stairs', ['you', 'alex'], ctx => {
    const t = ctx.t; const SS = sets.stairs; const u = range(t, PS(205) - 0.1, PE(205) + 0.8); const n = SS.stepsN;
    const k = u * n * 0.95; const a = SS.stepPos(0, k), b = SS.stepPos(0, Math.max(0, k - 0.6));
    act(ctx, 'you', { pos: [a[0], a[1], 0.25], rot: Math.PI / 2, walk: { phase: t * 8, amt: 0.9 }, expr: 'happy' });
    act(ctx, 'alex', { pos: [b[0] - 0.3, b[1], -0.3], rot: Math.PI / 2, walk: { phase: t * 8 + 1.5, amt: 0.9 }, expr: 'laugh', head: { yaw: -0.4 } });
    look(ctx.cam, [a[0] + 1.6, a[1] + 1.8, 4.6], [a[0], a[1] + 1.0, 0], 40);
  });
  { for (let t = PS(205); t < PE(205) + 0.5; t += 0.39) fx(t, 'step_stair', 0.28); }
  mood(PS(206), 'reflect', 0.65);
  cut(PS(206) - 0.1, 'void', ['you'], ctx => { voidMode({ color: '#4425c8' }); act(ctx, 'you', { pos: [0, 0, 0], rot: 0, expr: 'thinking' }); dolly(ctx, [[0, 1.5, 4.4], [0, 1.2, 0], 36], [[0, 1.5, 3.8], [0, 1.25, 0], 36]); });
  fx(PS(206), 'whoosh', 0.45);
  const caf = sets.cafeteria; const ctab = (i, dx = 0, s = 1) => [caf.tables[i].position.x + dx, 0, caf.tables[i].position.z - 0.75 * s];
  cut(PS(207) - 0.1, 'cafeteria', ['you', 'newkid', 'npc1', 'npc2', 'npc3', 'npc4'], ctx => {
    act(ctx, 'newkid', { pos: ctab(4), rot: 0, pose: 'sitChair', expr: 'sad', head: { pitch: 0.3 } });
    act(ctx, 'npc1', { pos: ctab(0, -0.5), rot: 0, pose: 'sitChair', expr: 'laugh' }); act(ctx, 'npc2', { pos: ctab(0, 0.5), rot: 0, pose: 'sitChair', expr: 'happy' }); act(ctx, 'npc3', { pos: ctab(2, -0.4), rot: 0, pose: 'sitChair', expr: 'smile' }); act(ctx, 'npc4', { pos: ctab(2, 0.5), rot: 0, pose: 'sitChair', expr: 'happy' });
    act(ctx, 'you', { pos: [-5.5, 0, 3.6], rot: Math.PI * 0.75, expr: 'neutral' });
    dolly(ctx, [[-7.6, 2.9, 6.6], [0, 0.9, 1.0], 40], [[-7.2, 2.7, 6.1], [0, 0.9, 1.0], 36]);
  });
  card(PS(207), PS(208), 'LUNCH'); fx(PS(207), 'cafeteria', 0.35, { dur: PE(212) - PS(207) + 1 });
  cut(PS(208) - 0.1, 'cafeteria', ['you', 'newkid', 'npc1', 'npc2'], ctx => { act(ctx, 'newkid', { pos: ctab(4), rot: 0, pose: 'sitChair', expr: 'sad', head: { pitch: 0.3 } }); act(ctx, 'npc1', { pos: ctab(0, -0.5), rot: 0, pose: 'sitChair', expr: 'laugh' }); act(ctx, 'npc2', { pos: ctab(0, 0.5), rot: 0, pose: 'sitChair', expr: 'happy' }); act(ctx, 'you', { pos: [-5.5, 0, 3.6], rot: Math.PI * 0.75, expr: 'thinking' }); cu(ctx, 'you', { dist: 1.7, yaw: 0.3 }); });
  think(T(208, 'assumed') - 0.2, PE(208) + 0.3, aw('you', 0.85), 'they want to be alone.', { dx: -200 });
  cut(PS(209) - 0.1, 'cafeteria', ['you', 'newkid'], ctx => { act(ctx, 'newkid', { pos: ctab(4), rot: 0, pose: 'sitChair', expr: 'sad' }); act(ctx, 'you', { pos: [-5.5, 0, 3.6], rot: Math.PI * 0.75, expr: 'determined' }); cu(ctx, 'you', { dist: 1.5, yaw: 0.2, push: 0.2 }); });
  ov({ type: 'custom', t0: PS(209), t1: PE(209) + 0.4, draw: (c, t) => { const a = Math.min(1, (t - PS(209)) / 0.2, (PE(209) + 0.4 - t) / 0.2); c.save(); c.globalAlpha = a; c.strokeStyle = '#ff4f5e'; c.lineWidth = 10; c.beginPath(); c.moveTo(560, 150); c.lineTo(1300, 230); c.stroke(); c.restore(); } });
  cut(PS(210) - 0.1, 'void', ['newkid', 'alex', 'you'], ctx => {
    const t = ctx.t; voidMode({ color: '#4a2bd8' });
    const k = step(t, [[0, 0], [T(210, 'sometimes', 1), 1], [T(210, 'sometimes', 2), 2]]);
    act(ctx, 'newkid', { pos: [-2.2, 0, 0], rot: 0.2, expr: k === 0 && t > T(210, 'nervous') ? 'nervous' : 'neutral' });
    act(ctx, 'alex', { pos: [0, 0, 0], rot: 0, expr: k >= 1 && t > T(210, 'lonely') ? 'sad' : 'neutral' });
    act(ctx, 'you', { pos: [2.2, 0, 0], rot: -0.2, expr: k === 2 && t > T(210, 'just') ? 'nervous' : 'neutral' });
    const x = [-2.2, 0, 2.2][k]; dolly(ctx, [[x * 0.6, 1.55, 5.6], [x * 0.7, 1.2, 0], 34], [[x * 0.8, 1.5, 4.4], [x, 1.25, 0], 32], ease.inOut, range(t, [PS(210), T(210, 'sometimes', 1), T(210, 'sometimes', 2)][k], [T(210, 'sometimes', 1), T(210, 'sometimes', 2), PE(210)][k]));
  });
  [['quiet', 'nervous', 'QUIET', 'NERVOUS'], ['distant', 'lonely', 'DISTANT', 'LONELY'], ['scared', 'scared', 'SCARY TO TALK TO', 'SCARED TOO']].forEach(([a, b, A, Bw], i) => {
    const ta = T(210, a), tb = i === 2 ? T(210, 'scared', 1) : T(210, b), te = i < 2 ? T(210, 'sometimes', i + 1) - 0.1 : PE(210) + 0.5;
    ov({ type: 'pill', t0: ta, t1: tb - 0.05, text: `SEEMS ${A}`, x: 0.5, y: 0.2, icon: 'dot' });
    ov({ type: 'pill', t0: tb, t1: te, text: `ACTUALLY ${Bw}`, x: 0.5, y: 0.2, icon: 'heart' }); fx(tb, 'flip', 0.45);
  });
  cut(PS(211) - 0.1, 'cafeteria', ['you', 'newkid', 'npc1', 'npc2'], ctx => {
    const t = ctx.t; const w = ease.inOut(range(t, PS(211), T(211, 'sit') + 0.2)); const s = ease.inOut(range(t, T(211, 'sit'), T(211, 'sit') + 0.6));
    act(ctx, 'newkid', { pos: ctab(4), rot: 0, pose: 'sitChair', expr: 'sad', head: { pitch: 0.3 } }); act(ctx, 'npc1', { pos: ctab(0, -0.5), rot: 0, pose: 'sitChair', expr: 'laugh' }); act(ctx, 'npc2', { pos: ctab(0, 0.5), rot: 0, pose: 'sitChair', expr: 'happy' });
    const tgt = ctab(4, 0, -1);
    act(ctx, 'you', { pos: [lerp(1.6, tgt[0], w), 0, lerp(0.4, tgt[2], w)], rot: lerp(Math.PI * 0.8, Math.PI, w), walk: { phase: t * 8, amt: w < 1 ? 1 : 0 }, poseMix: { a: 'stand', b: 'sitChair', u: s }, expr: 'smile' });
    dolly(ctx, [[6.8, 2.4, 1.2], [3.8, 0.9, -2.6], 40], [[6.4, 2.2, 0.6], [3.9, 0.95, -2.8], 38]);
  });
  cut(PS(212) - 0.1, 'cafeteria', ['you', 'newkid'], ctx => { const t = ctx.t; const u = ease.out(range(t, PS(212), PS(212) + 0.6)); act(ctx, 'newkid', { pos: ctab(4), rot: 0, pose: 'sitChair', expr: t > T(212, 'smiles') - 0.2 ? 'happy' : 'surprised', head: { pitch: lerp(0.3, -0.1, u) } }); act(ctx, 'you', { pos: ctab(4, 0, -1), rot: Math.PI, pose: 'sitChair', expr: 'smile' }); cu(ctx, 'newkid', { dist: 1.7, yaw: 0.25, push: 0.15 }); });
  fx(T(212, 'smiles'), 'chime_soft', 0.55);

  // ======================================================================== OUTRO
  mood(PS(213), 'theme', 0.8);
  cut(PS(213) - 0.15, 'shaft', ['you', 'alex'], ctx => { const SH = sets.shaft; const y = SH.FH * 6.45; ctx.S.carY = y; const a = lerp(-0.4, 0.4, ctx.u); look(ctx.cam, [Math.sin(a) * 12, y + 2.5, Math.cos(a) * 12], [0, y + 1.5, 0], 40); }, { inCar: 'stand' });
  ov({ type: 'title', t0: PS(213) + 0.2, t1: PE(213) + 0.3, kicker: 'SO…', text: 'WHAT IF YOU GOT STUCK\nWITH YOUR CRUSH?', y: 0.42, size: 90 });
  fx(PS(213), 'title_hit', 0.6);
  cut(PS(214) - 0.1, 'building', ['you', 'alex'], ctx => { const t = ctx.t; E(ctx, { light: 0.7 }); ctx.S.cutFront = true; act(ctx, 'you', { pos: [-0.4, 0, 0.1], rot: 0.1, expr: step(t, [[0, 'awkward'], [T(214, 'talk'), 'nervous'], [T(214, 'stomach'), 'embarrassed']]), pose: step(t, [[0, 'stand'], [T(214, 'hands'), 'pockets'], [T(214, 'hands') + 0.6, 'armsCrossed'], [T(214, 'stomach'), 'coverFace']]) }); act(ctx, 'alex', { pos: [0.7, 0, -0.6], rot: -0.3, expr: 'awkward' }); dolly(ctx, [[0, 1.6, 4.4], [0, 1.25, -0.2], 34], [[0, 1.5, 3.4], [0, 1.25, -0.2], 34]); });
  list(T(214, 'forget') - 0.1, PE(214) + 0.5, [{ text: 'FORGET HOW TO TALK', icon: 'check', t: T(214, 'forget') }, { text: 'FORGET YOUR HANDS', icon: 'check', t: T(214, 'forget', 1) }, { text: 'STOMACH BETRAYAL', icon: 'check', t: T(214, 'stomach') }], 0.06, 0.22, { title: 'GUARANTEED' });
  fx(T(214, 'betray'), 'stomach_growl2', 0.45);
  cut(PS(215) - 0.1, 'void', ['you'], ctx => { voidMode({ color: '#4425c8' }); act(ctx, 'you', { pos: [0, 0, 0], rot: 0, expr: 'thinking' }); dolly(ctx, [[0, 1.5, 4.6], [0, 1.2, 0], 36], [[0, 1.5, 3.8], [0, 1.25, 0], 36]); });
  cut(PS(216) - 0.1, 'void', ['alex', 'you'], ctx => {
    const t = ctx.t; voidMode({ color: t > T(216, 'wondering') ? '#7a2bc8' : '#4425c8' }); const both = t > T(216, 'exactly');
    act(ctx, 'alex', { pos: [both ? 1.0 : 0, 0, 0], rot: both ? -0.4 : 0, expr: step(t, [[0, 'neutral'], [T(216, 'nervous'), 'nervous'], [T(216, 'scared'), 'scared'], [T(216, 'wondering'), 'love']]) });
    act(ctx, 'you', { pos: [-1.0, 0, 0], rot: 0.4, expr: 'love' });
    dolly(ctx, [[0, 1.5, 4.0], [0, 1.25, 0], 36], [[0, 1.6, 5.6], [0, 1.15, 0], 36], ease.inOut);
  }, { castFn: t => t > T(216, 'exactly') ? ['alex', 'you'] : ['alex'] });
  pill(T(216, 'person'), T(216, 'nervous'), 'JUST A PERSON', 0.5, 0.775, { icon: 'heart' });
  list(T(216, 'nervous') - 0.1, T(216, 'exactly'), [{ text: 'GETS NERVOUS', icon: 'check', t: T(216, 'nervous') }, { text: 'GETS SCARED', icon: 'check', t: T(216, 'scared') }, { text: 'WONDERS ABOUT YOU', icon: 'heart', t: T(216, 'wondering') }], 0.06, 0.22);
  ov({ type: 'symbol', t0: T(216, 'exactly'), t1: PE(216) + 0.5, whoA: aw('alex', 0.8), sym: 'heart' }); ov({ type: 'symbol', t0: T(216, 'exactly') + 0.2, t1: PE(216) + 0.5, whoA: aw('you', 0.8), sym: 'heart' });
  fx(T(216, 'exactly'), 'chime_soft', 0.5);
  cut(PS(217) - 0.1, 'building', ['you', 'alex'], ctx => { const t = ctx.t; E(ctx, { door: ease.inOut(range(t, T(217, 'amazing') - 0.4, T(217, 'amazing') + 1.0)), light: 1.0, tint: '#fff4fa', lobby: true }); act(ctx, 'you', { pos: [-0.45, 0, 0.25], rot: 0, expr: 'determined' }); act(ctx, 'alex', { pos: [0.45, 0, 0.25], rot: 0, expr: 'smile' }); dolly(ctx, [[0, 2.7, -2.6], [0, 1.3, 3], 44], [[0, 2.5, -2.1], [0, 1.3, 3], 42]); });
  ov({ type: 'meter', t0: T(217, 'ten') - 0.3, t1: PE(217) + 0.6, label: 'TEN SECONDS OF BRAVE', x: 0.39, y: 0.14, w: 420, value: t => ease.inOut(range(t, T(217, 'ten'), PE(217))), icon: 'heart', c0: '#ffd34d', c1: '#ff7eb6' });
  pop(T(217, 'brave'), PE(217) + 0.6, 'BE BRAVE.', { size: 130, y: 0.74, colors: ['#ffffff', '#ffd34d'] });
  mood(PS(218), 'theme', 0.75);
  cut(PS(218) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx, { light: 0.75 }); ctx.S.cutFront = true; act(ctx, 'you', { pos: SIT_YOU2, rot: 0.6, pose: 'sitKnees', expr: 'nervous' }); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.6, pose: 'sitKnees', expr: 'smile' }); dolly(ctx, [[0, 2.2, 5.0], [0, 0.9, -0.6], 34], [[0, 1.2, 3.0], [0, 0.9, -0.6], 34]); });
  ov({ type: 'vs', t0: T(219, 'tell') - 0.1, t1: PE(219) + 0.6, y: 0.08, cards: [{ text: 'TELL THEM\nHOW YOU FEEL', t: T(219, 'tell') }, { text: 'STAY QUIET\n& LET THE DOORS OPEN', t: T(219, 'stay') }] });
  countdown(T(219, 'five') - 0.2, T(219, 'tell') - 0.2);
  fx(T(219, 'tell'), 'pop', 0.5); fx(T(219, 'stay'), 'pop', 0.5);
  cut(PS(219) - 0.1, 'building', ['you', 'alex'], ctx => { E(ctx, { light: 0.75 }); act(ctx, 'you', { pos: SIT_YOU2, rot: 0.6, pose: 'sitKnees', expr: 'nervous' }); act(ctx, 'alex', { pos: SIT_ALEX2, rot: -0.6, pose: 'sitKnees', expr: 'smile' }); twoSit(ctx, 2.7, 34); });
  // end card
  mood(PS(220), 'outro', 0.8);
  cut(PS(220) - 0.1, 'void', ['you', 'alex'], ctx => { const t = ctx.t; voidMode({ color: '#4425c8' }); act(ctx, 'you', { pos: [-0.8, 0, 0], rot: 0.2, pose: 'wave', expr: 'happy' }); act(ctx, 'alex', { pos: [0.8, 0, 0], rot: -0.2, pose: t > T(220, 'subscribe') ? 'point' : 'wave', expr: 'grin' }); cast.you.arms.R.el.rotation.z = Math.sin(t * 8) * 0.4; dolly(ctx, [[0, 1.5, 6.0], [0, 1.2, 0], 36], [[0, 1.5, 5.2], [0, 1.2, 0], 36]); });
  ov({ type: 'custom', t0: T(220, 'subscribe') - 0.3, t1: DUR, draw: (c, t) => {
    const t0 = T(220, 'subscribe') - 0.3; const a = ease.outBack(Math.min(1, (t - t0) / 0.4)); const click = T(220, 'subscribe') + 0.5; const done = t > click;
    c.save(); c.translate(960, 820); c.scale(a * (t > click && t < click + 0.15 ? 0.92 : 1), a);
    c.beginPath(); c.roundRect(-230, -60, 460, 120, 60); c.fillStyle = done ? '#3a3350' : '#ff2d2d'; c.fill();
    c.fillStyle = '#fff'; c.font = '56px "Lilita One"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(done ? 'SUBSCRIBED' : 'SUBSCRIBE', 0, 4);
    // bell
    c.translate(300, 0); c.rotate(done ? Math.sin((t - click) * 18) * 0.4 * Math.exp(-(t - click) * 2) : 0); c.fillStyle = '#ffd34d'; c.beginPath(); c.moveTo(-28, 22); c.quadraticCurveTo(-28, -34, 0, -34); c.quadraticCurveTo(28, -34, 28, 22); c.closePath(); c.fill(); c.beginPath(); c.arc(0, 30, 8, 0, 7); c.fill();
    c.restore();
    // cursor
    if (t > t0 + 0.2) { const u = ease.inOut(Math.min(1, (t - t0 - 0.2) / 0.5)); c.save(); c.translate(lerp(1400, 990, u), lerp(1060, 840, u)); c.fillStyle = '#fff'; c.strokeStyle = '#1d1630'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 46); c.lineTo(12, 34); c.lineTo(24, 58); c.lineTo(32, 54); c.lineTo(20, 30); c.lineTo(36, 30); c.closePath(); c.fill(); c.stroke(); c.restore(); }
  } });
  fx(T(220, 'subscribe') + 0.5, 'click', 0.8); fx(T(220, 'subscribe') + 0.6, 'bell', 0.6);
  ov({ type: 'custom', t0: T(220, 'comments') - 0.2, t1: DUR, draw: (c, t) => { const a = Math.min(1, (t - T(220, 'comments') + 0.2) / 0.3); c.save(); c.globalAlpha = a; c.translate(330, 260); c.beginPath(); c.roundRect(-150, -60, 300, 110, 30); c.fillStyle = '#fff'; c.fill(); c.beginPath(); c.moveTo(-60, 48); c.lineTo(-90, 90); c.lineTo(-20, 48); c.fill(); c.fillStyle = '#1d1630'; c.font = 'bold 30px "Libre Baskerville"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('COMMENT ↓', 0, -4); c.restore(); } });
  fx(T(220, 'comments'), 'pop', 0.5);
  ov({ type: 'fade', t0: DUR - 1.2, t1: DUR + 1, inD: 1.1 });
  fx(PS(220), 'whoosh', 0.4);

  const post = (ctx) => {
    if (!ctx.shot.inCar) return;
    const SH = sets.shaft; const y = (ctx.S.carY ?? SH.FH * 6.45) + 0.06; const sit = ctx.shot.inCar === 'sit';
    const sc = ctx.t > 600 && ctx.t < 640;
    act(ctx, 'you', { pos: [sit ? -0.32 : -0.45, y, sit ? -0.6 : 0.0], rot: sit ? 0.3 : 0.2, pose: sit ? (sc ? 'sitHug' : 'sitKnees') : (ctx.t < 70 || ctx.t > 940 ? 'stand' : 'scared'), expr: sc ? 'scared' : ctx.t > 940 ? 'awkward' : ctx.t > 490 && ctx.t < 510 ? 'smile' : 'shocked' });
    act(ctx, 'alex', { pos: [sit ? 0.38 : 0.6, y, sit ? -0.6 : -0.3], rot: sit ? -0.3 : -0.3, pose: sit ? (sc ? 'sitHug' : 'sitKnees') : (ctx.t < 70 || ctx.t > 940 ? 'stand' : 'scared'), expr: sc ? 'scared' : ctx.t > 940 ? 'awkward' : ctx.t > 490 && ctx.t < 510 ? 'content' : 'shocked' });
  };
  const preFrame = () => { props(null, {}); resetScale(); catHall.visible = false; };
  return { duration: DUR, shots, overlays, captions, speech, sfx, music, bubbleAt, words, preFrame, post };
}

// Character rig in the reference's hand-inked style: big lopsided heads, leaning sock-shaped bodies,
// thin curvy stick limbs, small close-set dot eyes, expressive asymmetric faces. Lines are static brush ink.
'use strict';
const SKIN = { light: '#f7d9bd', fair: '#f1c9a5', tan: '#d9a274', olive: '#c48d5e', brown: '#9c6236', dark: '#6e4224', white: '#fbf8f2' };

// presets: outfit + hair + face personality (bags, buck teeth, blush, lean)
const P = {
  you: { skin: SKIN.light, body: 'gown', color: '#bfe1f3', hair: 'tuft', hairColor: '#5b3a20', legs: 'bare', lean: -2 },
  you_modern: { skin: SKIN.light, body: 'bean', color: '#3f7fd6', hair: 'tuft', hairColor: '#5b3a20', lean: 2 },
  doctor: { skin: SKIN.fair, body: 'coat', color: '#ffffff', hair: 'short', hairColor: '#3b2a1e', acc: ['stetho', 'glasses'], lean: -3 },
  caveman: { skin: SKIN.tan, body: 'fur', color: '#9a5e2e', hair: 'wild', hairColor: '#2a1c12', beard: 'stubble', bags: 1, lean: 3 },
  cavedoc: { skin: SKIN.olive, body: 'fur', color: '#d9a43b', spots: '#7a4a17', hair: 'wild', hairColor: '#4a2a12', brows: 'uni', buck: 1, lean: -4 },
  iry: { skin: SKIN.brown, body: 'kilt', color: '#f7f3e6', hair: 'wig', hairColor: '#141414', acc: ['collar'], brows: 'serious', lean: -1 },
  egy: { skin: SKIN.brown, body: 'kilt', color: '#f7f3e6', hair: 'wig', hairColor: '#141414', lean: 2 },
  egyw: { skin: SKIN.brown, body: 'dress', color: '#f4efe0', hair: 'wiglong', hairColor: '#141414', acc: ['collar'], blush: 1, lean: -2 },
  rod: { skin: SKIN.fair, body: 'chiton', color: '#efe3c4', trim: '#2c5aa0', hair: 'curly', hairColor: '#6b4a2f', beard: 'big', beardColor: '#6b4a2f', legs: 'sandals', bags: 1, lean: 4 },
  bab_sick: { skin: SKIN.olive, body: 'robe', color: '#c0392b', trim: '#f1c40f', hair: 'curly', hairColor: '#2e2018', beard: 'square', beardColor: '#3a2618', bags: 1, lean: -3 },
  bab_pass: { skin: SKIN.brown, body: 'robe', color: '#2e6fb5', trim: '#f1c40f', hair: 'cone', hairColor: '#2e2018', hatColor: '#d4a017', beard: 'square', beardColor: '#2e2018', buck: 1, lean: 4 },
  bab_w: { skin: SKIN.olive, body: 'dress', color: '#8e44ad', trim: '#f1c40f', hair: 'long', hairColor: '#2e2018', blush: 1, lean: -2 },
  bab: { skin: SKIN.olive, body: 'robe', color: '#16a085', trim: '#f1c40f', hair: 'curly', hairColor: '#2e2018', beard: 'square', beardColor: '#2e2018', lean: 2 },
  asu: { skin: SKIN.olive, body: 'robe', color: '#4f8a3a', trim: '#e8d36a', hair: 'curly', hairColor: '#2e2018', beard: 'square', beardColor: '#2e2018', lean: -2 },
  ashipu: { skin: SKIN.brown, body: 'robe', color: '#3d2b5c', trim: '#c9a227', hair: 'horned', hatColor: '#2a1d3f', beard: 'square', beardColor: '#111', bags: 1, lean: 3 },
  hamm: { skin: SKIN.olive, body: 'robe', color: '#5b2a86', trim: '#f0c419', hair: 'kingcap', hatColor: '#3a1c5a', beard: 'square', beardColor: '#120c08', acc: ['necklace'], lean: -2 },
  noble: { skin: SKIN.olive, body: 'robe', color: '#d35400', trim: '#f4d03f', hair: 'curly', hairColor: '#2e2018', beard: 'square', beardColor: '#2e2018', acc: ['necklace'] },
  slave: { skin: SKIN.brown, body: 'bean', color: '#9b8b72', hair: 'short', hairColor: '#2e2018' },
  bab_doc: { skin: SKIN.brown, body: 'robe', color: '#ece2c6', trim: '#2c7fb8', hair: 'curly', hairColor: '#2e2018', beard: 'square', beardColor: '#2e2018', bags: 1, lean: 3 },
  asclepius: { skin: SKIN.fair, body: 'toga', color: '#f6f3ea', stripe: '#3a78c2', hair: 'curlyw', hairColor: '#e9e4da', beard: 'white', beardColor: '#eeeae2', tall: 1.1, lean: -3 },
  greek: { skin: SKIN.fair, body: 'chiton', color: '#dfe7f0', trim: '#b5462e', hair: 'curly', hairColor: '#3a2716', beard: 'stubble', lean: 2 },
  greekw: { skin: SKIN.light, body: 'dress', color: '#e98ba3', trim: '#fff1c9', hair: 'bun', hairColor: '#5a3418', blush: 1 },
  kleo: { skin: SKIN.light, body: 'dress', color: '#f29bb0', trim: '#fff1c9', hair: 'bun', hairColor: '#3a2213', acc: ['belly'], bags: 1, lean: -4 },
  ambrosia: { skin: SKIN.fair, body: 'dress', color: '#2fa39a', trim: '#f6e7b0', hair: 'bun', hairColor: '#24160d', acc: ['blindL'], lean: 3 },
  baby: { skin: SKIN.light, body: 'bean', color: '#ffffff', hair: 'babycurl', hairColor: '#8a5a2b', small: 0.55, blush: 1 },
  cato: { skin: SKIN.tan, body: 'toga', color: '#f4f0e6', stripe: '#7a1f3d', hair: 'balding', hairColor: '#9a9590', brows: 'angry', acc: ['tan'], bags: 1, lean: -3 },
  marcus: { skin: SKIN.fair, body: 'toga', color: '#f4f0e6', stripe: '#7a1f3d', hair: 'short', hairColor: '#2a1a10', lean: 2 },
  catowife: { skin: SKIN.light, body: 'dress', color: '#9b59b6', trim: '#f6e7b0', hair: 'bun', hairColor: '#4a2a14', lean: -2 },
  youngwife: { skin: SKIN.light, body: 'dress', color: '#f5b041', trim: '#fff', hair: 'long', hairColor: '#7a3f12', blush: 1, lean: 3 },
  caesar: { skin: SKIN.fair, body: 'toga', color: '#f4f0e6', stripe: '#6c2a8c', hair: 'laurel', hairColor: '#4a3828', lean: -2 },
  plutarch: { skin: SKIN.fair, body: 'chiton', color: '#e8dcc0', trim: '#7a5230', hair: 'balding', hairColor: '#cfc8bd', beard: 'white', beardColor: '#e3ded4', bags: 1, lean: 3 },
  roman: { skin: SKIN.fair, body: 'toga', color: '#f4f0e6', stripe: '#7a1f3d', hair: 'short', hairColor: '#3a2716', lean: 2 },
  romanb: { skin: SKIN.tan, body: 'bean', color: '#a0522d', hair: 'short', hairColor: '#2a1a10', buck: 1, lean: -2 },
  senator: { skin: SKIN.fair, body: 'toga', color: '#f4f0e6', stripe: '#7a1f3d', hair: 'balding', hairColor: '#7a756f', bags: 1 },
  narr: { skin: SKIN.light, body: 'bean', color: '#e74c3c', hair: 'tuft', hairColor: '#3b2a1e' },
  egy_pat: { skin: SKIN.brown, body: 'kilt', color: '#efe6cf', hair: 'short', hairColor: '#141414', bags: 1, lean: 3 },
  roman_pat: { skin: SKIN.fair, body: 'bean', color: '#c9a77a', hair: 'short', hairColor: '#4a2e18', bags: 1, lean: -3 },
  greek_pat: { skin: SKIN.fair, body: 'chiton', color: '#e8d6c0', trim: '#4a7a3a', hair: 'curly', hairColor: '#1a1a1a', buck: 1, lean: 2 },
  ghost: { skin: '#e8f4ff', body: 'ghost', color: '#e8f4ff', hair: 'balding', hairColor: '#ffffff', beard: 'white', beardColor: '#ffffff', ghost: true },
  medic: { skin: SKIN.brown, body: 'bean', color: '#1f7a4a', hair: 'short', hairColor: '#1a1a1a' },
};

const FACES = {
  neutral: ['dot', null, 'line'], happy: ['dot', null, 'smile'], grin: ['dot', 'up', 'grin'], smug: ['half', 'flat', 'smirk'],
  serious: ['dot', 'serious', 'line'], angry: ['dot', 'angry', 'frown'], furious: ['dot', 'angry', 'yell'], sad: ['dot', 'sad', 'frown'],
  shock: ['wide', 'up', 'o'], scared: ['wide', 'sad', 'wavy'], disgust: ['half', 'angry', 'blech'], nervous: ['dot', 'sad', 'wavy'],
  sleep: ['closed', null, 'sleep'], laugh: ['happy', 'up', 'open'], dead: ['x', null, 'line'], confused: ['dot', 'raise', 'squiggle'],
  proud: ['happy', null, 'smile'], cry: ['closed', 'sad', 'frown'], blank: ['dot', null, null], talk: ['dot', null, 'talk'],
  bored: ['sleepy', null, 'line'], wince: ['squint', 'angry', 'teeth'], awe: ['wide', 'up', 'smallo'], content: ['happy', null, 'smile'],
  yell: ['dot', 'angry', 'yell'], sly: ['half', 'raise', 'smirk'], smugtalk: ['half', 'flat', 'talk'], angrytalk: ['dot', 'angry', 'talk'],
  sadtalk: ['dot', 'sad', 'talk'], happytalk: ['dot', null, 'talk'], dizzy: ['spiral', null, 'wavy'], teeth: ['wide', 'sad', 'teeth'],
  crazy: ['crazy', null, 'grin'], derp: ['crazy', null, 'buck'],
  gross: ['bulge', null, 'puke'],
};

const POSES = {
  idle: [[12, 4], [12, 4]], hips: [[48, -52], [48, -52]], point: [[12, 4], [96, 92]], pointUp: [[12, 4], [150, 165]],
  shrug: [[62, 140], [62, 140]], armsUp: [[150, 168], [150, 168]], hold: [[12, 4], [28, -70]], hold2: [[28, -70], [28, -70]],
  think: [[12, 4], [24, -150]], facepalm: [[12, 4], [18, -172]], cross: [[22, -96], [22, -96]], present: [[12, 4], [62, 70]],
  holdUp: [[12, 4], [150, 165]], scared: [[34, -150], [34, -150]], reach: [[12, 4], [80, 80]], wave: [[12, 4], [140, 170]],
  shrugL: [[62, 140], [12, 4]], both: [[60, 75], [60, 75]], cheer: [[150, 168], [12, 4]], fists: [[40, 160], [40, 160]],
  holdBoth: [[38, -48], [38, -48]], lean: [[12, 4], [12, 4]], carry: [[12, 4], [36, -40]], beg: [[30, -60], [30, -60]],
  holdL: [[28, -70], [12, 4]], pointL: [[96, 92], [12, 4]], stop: [[12, 4], [70, 175]], headhold: [[60, -175], [60, -175]],
};

function lerpPose(a, b, p) { return [[lerp(a[0][0], b[0][0], p), lerp(a[0][1], b[0][1], p)], [lerp(a[1][0], b[1][0], p), lerp(a[1][1], b[1][1], p)]]; }

// ---------- shape helpers ----------
// lopsided hand-drawn oval
function blobPts(cx, cy, rx, ry, seed, n = 36, lump = 1) {
  const p = [];
  const a2 = (0.025 + rnd(seed, 1) * 0.03) * lump, a3 = (0.012 + rnd(seed, 2) * 0.018) * lump, f2 = rnd(seed, 3) * TAU, f3 = rnd(seed, 4) * TAU;
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU;
    const r = 1 + a2 * Math.cos(2 * a + f2) + a3 * Math.cos(3 * a + f3);
    p.push([cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]);
  }
  return p;
}
function qbez(a, b, c2, n = 8) { const o = []; for (let i = 0; i <= n; i++) { const u = i / n; o.push([(1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * b[0] + u * u * c2[0], (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * b[1] + u * u * c2[1]]); } return o; }
// sock-shaped body: origin bottom-centre, narrow top, wider rounded bottom, slightly bulging sides
function sockPts(tw, bw, h, seed, bottom = 0) {
  const j = k => (rnd(seed, k) - 0.5);
  const tl = [-tw / 2 + j(1) * 6, -h], tr = [tw / 2 + j(2) * 6, -h - 4 * j(3)];
  const br = [bw / 2 + j(4) * 8, bottom - 6], bl = [-bw / 2 + j(5) * 8, bottom - 6];
  const pts = [];
  pts.push(...qbez(tl, [0, -h - 14 - j(6) * 6], tr, 6));                                   // rounded shoulders/top
  pts.push(...qbez(tr, [bw / 2 + 10 + j(7) * 8, -h * 0.45], br, 8).slice(1));              // right side bulge
  pts.push(...qbez(br, [bw / 2 - 4, bottom + 6], [bw * 0.25, bottom + 4], 4).slice(1));      // bottom right corner
  pts.push(...qbez([bw * 0.25, bottom + 4], [0, bottom + 8 + j(8) * 4], [-bw * 0.25, bottom + 4], 4).slice(1));
  pts.push(...qbez([-bw * 0.25, bottom + 4], [-bw / 2 + 4, bottom + 6], bl, 4).slice(1));
  pts.push(...qbez(bl, [-bw / 2 - 10 + j(9) * 8, -h * 0.45], tl, 8).slice(1, -1));
  return pts;
}
// scalloped arc (curly hair, beards): bumps outward along an elliptical arc
function scallop(cx, cy, rx, ry, a0, a1, bumps, bh, seed) {
  const p = [];
  const n = bumps * 6;
  for (let i = 0; i <= n; i++) {
    const u = i / n, a = a0 + (a1 - a0) * u;
    const b = Math.abs(Math.sin(u * bumps * Math.PI)) * bh * (0.75 + 0.5 * rnd(seed, Math.floor(u * bumps)));
    p.push([cx + Math.cos(a) * (rx + b), cy + Math.sin(a) * (ry + b)]);
  }
  return p;
}

// main character draw. o: x,y,s,flip,face,pose,poses:[[t,pose]...],hold:{L,R},talk,look:[x,y],enter:[t0,kind],out,lie,rot,alpha,...
function ch(c, st, name, o = {}) {
  const pr = Object.assign({}, P[name] || P.narr, o.pre || {});
  const seedBase = strSeed(name + (o.id || ''));
  const t = st.t;
  let x = o.x === undefined ? W / 2 : o.x, y = o.y === undefined ? 930 : o.y, s = (o.s || 1) * (pr.small || 1);
  let alpha = o.alpha === undefined ? 1 : o.alpha, sc = 1, rot = (o.rot || 0) * Math.PI / 180;
  if (o.enter) {
    const t0 = typeof o.enter[0] === 'number' ? st.s.start + o.enter[0] : st.k(o.enter[0]);
    const e = enter(st, t0, o.enter[1] || 'pop', o.enter[2] || 0.4, { out: o.out === undefined ? undefined : (typeof o.out[0] === 'number' ? st.s.start + o.out[0] : st.k(o.out[0])), outKind: o.out && o.out[1], sfx: o.enterSfx, outSfx: o.outSfx });
    x += e.dx; y += e.dy; sc *= e.sc; alpha *= e.a;
    if (e.sc <= 0.001 || e.a <= 0.001) return;
  } else if (o.out) {
    const t1 = typeof o.out[0] === 'number' ? st.s.start + o.out[0] : st.k(o.out[0]);
    const e = enter(st, st.s.start - 5, 'none', 0.1, { out: t1, outKind: o.out[1], outSfx: o.outSfx, sfx: false });
    x += e.dx; y += e.dy; sc *= e.sc; alpha *= e.a;
    if (e.sc <= 0.001 || e.a <= 0.001) return;
  }
  if (o.move) for (const m of o.move) {
    const t0 = typeof m[0] === 'number' ? st.s.start + m[0] : st.k(m[0]);
    const p = E.io(clamp((t - t0) / (m[3] || 0.6)));
    if (t >= t0) { x = lerp(x, m[1], p); y = lerp(y, m[2], p); }
  }
  let jump = 0, squash = 1;
  for (const h of o.hops || []) {
    const t0 = typeof h === 'number' ? st.s.start + h : st.k(h);
    const d = t - t0;
    if (d >= 0 && d < 0.45) jump += Math.sin(d / 0.45 * Math.PI) * 70;
    if (d >= 0.42 && d < 0.6) squash *= 1 - 0.1 * Math.sin((d - 0.42) / 0.18 * Math.PI);
    cue('hop', t0, 0.35);
  }
  let shx = 0;
  if (o.tremble) shx = Math.sin(t * 70) * 3 * s;
  const talking = o.talk && (o.talk === true || (t >= (typeof o.talk[0] === 'number' ? st.s.start + o.talk[0] : st.k(o.talk[0])) && t <= (typeof o.talk[1] === 'number' ? st.s.start + o.talk[1] : st.k(o.talk[1], 1))));
  let bob = 0;
  if (talking) bob = Math.sin(t * 13) * 3;
  if (o.walk) bob += Math.abs(Math.sin(t * 9)) * -10;
  // gentle hand-animated life: sway + breathing
  const sway = Math.sin(t * 1.3 + seedBase) * 1.4 + (talking ? Math.sin(t * 6.5) * 1.5 : 0);
  const lean = (o.lean === undefined ? (pr.lean || 0) : o.lean) + sway;
  const breathe = 1 + Math.sin(t * 2.1 + seedBase) * 0.014;

  c.save();
  c.globalAlpha *= alpha;
  c.translate(x + shx, y - jump);
  c.scale(s * sc * (o.flip ? -1 : 1), s * sc);
  if (o.lie) { c.translate(0, -60); c.rotate(-Math.PI / 2 * (o.lie === 'r' ? -1 : 1)); c.translate(0, 120); }
  if (rot) { c.translate(0, -200); c.rotate(rot); c.translate(0, 200); }
  c.scale(1, squash);
  const tall = pr.tall || 1;
  if (!o.noShadow && !o.lie && !pr.ghost) shadowEll(c, 0, 2, 95 + jump * 0.2, 0.25);

  let face = o.face || 'neutral';
  if (o.faces) for (const f of o.faces) { const t0 = typeof f[0] === 'number' ? st.s.start + f[0] : st.k(f[0]); if (t >= t0) face = f[1]; }
  let pose = POSES[o.pose || 'idle'] || POSES.idle;
  if (o.arms) pose = o.arms;
  if (o.poses) for (const pz of o.poses) {
    const t0 = typeof pz[0] === 'number' ? st.s.start + pz[0] : st.k(pz[0]);
    if (t >= t0) { const np = Array.isArray(pz[1]) ? pz[1] : POSES[pz[1]]; pose = lerpPose(pose, np, E.back(clamp((t - t0) / 0.22))); }
  }
  if (o.wave) { const w = Math.sin(t * 10) * 18; pose = [pose[0], [pose[1][0] + w * 0.3, pose[1][1] + w]]; }
  if (o.flail) { const w = Math.sin(t * 16); pose = [[90 + w * 50, 140 + w * 40], [90 - w * 50, 140 - w * 40]]; }
  // idle arm drift so nobody stands like a robot
  const drift = Math.sin(t * 1.7 + seedBase * 0.3) * 3;
  pose = [[pose[0][0] + drift, pose[0][1] + drift * 1.5], [pose[1][0] - drift * 0.6, pose[1][1] - drift]];

  const legTop = -62;
  const ghost = pr.ghost;
  const robe = pr.body === 'robe' || pr.body === 'dress';
  // ---- legs: thin inked sticks, slightly splayed ----
  if (!ghost) {
    for (const sd of [-1, 1]) {
      const lx = sd * (17 + rnd(seedBase, sd + 5) * 6), swing = o.walk ? Math.sin(t * 9 + (sd > 0 ? Math.PI : 0)) * 16 : 0;
      if (o.sit) { line(c, [[lx, legTop], [lx + 36, legTop + 10], [lx + 42, 0]], { lw: 8, seed: seedBase + 3 + sd }); continue; }
      const top = robe ? -12 : legTop;
      line(c, [[lx, top], [lx + sd * 2 + swing * 0.5, top * 0.45], [lx + sd * 4 + swing, 0]], { lw: 8, seed: seedBase + 3 + sd, amp: 1 });
      if (pr.legs === 'sandals') line(c, [[lx + swing - 8, -10], [lx + swing + 8, -14]], { lw: 4, stroke: '#8a5a2b', amp: 0.4 });
    }
  }
  // ---- upper body (leans as a unit: body, arms, head) ----
  c.save();
  c.translate(0, legTop + 4);
  c.rotate(lean * Math.PI / 180);
  c.translate(0, -(legTop + 4));
  c.save();
  c.translate(0, legTop + 4);
  c.scale(1, breathe * tall);
  drawBody(c, pr, seedBase, t, o);
  c.restore();
  const bodyH = 190;
  const shY = (legTop + 4 - bodyH * 0.84) * tall * breathe;

  const shoulders = [[-36, shY], [36, shY]];
  const hands = [];
  const armCol = ghost ? '#9fb5cf' : INK;
  for (let i = 0; i < 2; i++) {
    const sd = i === 0 ? -1 : 1;
    const [a1, a2] = pose[i];
    const r1 = a1 * Math.PI / 180, r2 = a2 * Math.PI / 180;
    const sp = shoulders[i];
    const el = [sp[0] + sd * Math.sin(r1) * 70, sp[1] + Math.cos(r1) * 70];
    const hd = [el[0] + sd * Math.sin(r2) * 66, el[1] + Math.cos(r2) * 66];
    hands.push({ p: hd, ang: Math.atan2(hd[1] - el[1], hd[0] - el[0]), sd });
    // curvy arm: bend the elbow a touch outward so arms read as drawn, not rigid
    const mid = [(sp[0] + el[0]) / 2 + sd * 4, (sp[1] + el[1]) / 2 - 3];
    line(c, [sp, mid, el, hd], { lw: 8, seed: seedBase + 20 + i, stroke: armCol, amp: 1.2 });
  }

  const hy = shY - 88 - (talking ? bob : 0) + (o.headDy || 0);
  const hx = (o.headDx || 0) + lean * 0.6;
  c.save();
  c.translate(hx, hy);
  const tilt = (o.headTilt || 0) + Math.sin(t * 0.9 + seedBase * 0.7) * 2.2 + (talking ? Math.sin(t * 7) * 2 : 0);
  c.rotate(tilt * Math.PI / 180);
  drawHead(c, st, pr, seedBase, t, face, o, talking);
  c.restore();

  for (let i = 0; i < 2; i++) {
    const side = i === 0 ? 'L' : 'R';
    const item = o.hold && o.hold[side];
    if (!item) continue;
    const h = hands[i];
    c.save();
    c.translate(h.p[0], h.p[1]);
    const nm = typeof item === 'string' ? item : item[0];
    const io = typeof item === 'string' ? {} : item[1] || {};
    if (io.rot !== undefined) c.rotate(io.rot);
    if (o.flip) c.scale(-1, 1);
    drawProp(c, st, nm, Object.assign({ s: io.s || 1, seed: seedBase + 40 + i }, io));
    c.restore();
  }
  if (o.after) o.after(c, { hy, hands, shY });
  c.restore();
  c.restore();
}

function drawBody(c, pr, seed, t, o) {
  const b = pr.body;
  const col = pr.color;
  const LW = 10;
  if (b === 'ghost') {
    const pts = [];
    for (let i = 0; i <= 20; i++) { const u = i / 20; pts.push([lerp(70, -70, u), 10 + Math.sin(u * 8 + t * 6) * 10]); }
    shp(c, [[-55, -190], [55, -190], [70, -60], ...pts, [-70, -60]], { fill: 'rgba(232,244,255,0.85)', lw: 7, stroke: '#9fb5cf', seed });
    return;
  }
  const robe = b === 'robe' || b === 'dress';
  const bp = robe ? sockPts(104, 182, 214, seed, 36) : sockPts(98, 146, 190, seed);
  const clipTo = () => { trace(c, chaikin(wob(bp, true, seed + 11, 1.6), true, 2), true); c.clip(); };
  if (b === 'kilt') {
    shp(c, bp, { fill: pr.skin, lw: 0, stroke: null, seed: seed + 11 });
    c.save(); clipTo();
    c.fillStyle = col; c.fillRect(-120, -84, 240, 140);
    c.strokeStyle = 'rgba(0,0,0,0.22)'; c.lineWidth = 3;
    for (let i = -60; i <= 60; i += 20) { c.beginPath(); c.moveTo(i * 0.6, -80); c.lineTo(i, 30); c.stroke(); }
    c.fillStyle = '#d4a017'; c.fillRect(-120, -92, 240, 12);
    c.restore();
    line(c, [[-70, -88], [70, -86]], { lw: 5, seed });
  } else if (b === 'gown') {
    shp(c, bp, { fill: col, lw: 0, stroke: null, seed: seed + 11 });
    c.save(); clipTo();
    c.fillStyle = 'rgba(40,90,140,0.35)';
    for (let yy = -200; yy < 30; yy += 24) for (let xx = -90; xx < 90; xx += 24) { const ox = (Math.floor(yy / 24) % 2) * 12; c.beginPath(); c.arc(xx + ox, yy, 3.5, 0, TAU); c.fill(); }
    c.restore();
    line(c, [[-24, -190], [0, -160], [24, -190]], { lw: 5, seed });
  } else if (b === 'toga' || b === 'chiton') {
    shp(c, bp, { fill: col, lw: 0, stroke: null, seed: seed + 11 });
    c.save(); clipTo();
    if (b === 'toga') {
      c.fillStyle = 'rgba(0,0,0,0.07)';
      c.beginPath(); c.moveTo(-60, -200); c.lineTo(90, 20); c.lineTo(40, 20); c.lineTo(-90, -150); c.fill();
      c.strokeStyle = pr.stripe || '#7a1f3d'; c.lineWidth = 15; c.lineCap = 'round'; c.beginPath(); c.moveTo(-56, -204); c.quadraticCurveTo(10, -110, 90, 10); c.stroke();
      c.strokeStyle = 'rgba(0,0,0,0.22)'; c.lineWidth = 3;
      for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-80 + i * 12, -120 + i * 20); c.quadraticCurveTo(0, -60 + i * 18, 60 - i * 10, -6); c.stroke(); }
    } else {
      c.fillStyle = pr.trim || '#2c5aa0'; c.fillRect(-120, -18, 240, 40);
      c.fillStyle = 'rgba(255,255,255,0.25)'; for (let i = -110; i < 110; i += 20) c.fillRect(i, -12, 9, 9);
      c.strokeStyle = 'rgba(0,0,0,0.18)'; c.lineWidth = 3; for (let i = -40; i <= 40; i += 20) { c.beginPath(); c.moveTo(i * 0.5, -180); c.lineTo(i, -22); c.stroke(); }
    }
    c.restore();
    if (b === 'chiton') line(c, [[-48, -110], [48, -106]], { lw: 6, stroke: '#7a5232', seed });
  } else if (b === 'fur') {
    shp(c, bp, { fill: col, lw: 0, stroke: null, seed: seed + 11 });
    c.save(); clipTo();
    c.fillStyle = pr.spots || 'rgba(60,30,10,0.45)';
    for (let i = 0; i < 10; i++) { c.beginPath(); c.ellipse(rr(seed + i, -60, 60), rr(seed + i + 50, -180, -10), 11, 8, i, 0, TAU); c.fill(); }
    c.restore();
    // jagged hem
    const jag = []; for (let i = 0; i <= 8; i++) jag.push([lerp(-70, 70, i / 8), (i % 2 ? -14 : 2)]);
    line(c, jag, { lw: 5, seed: seed + 3, amp: 0.6 });
  } else if (b === 'coat') {
    shp(c, bp, { fill: '#ffffff', lw: 0, stroke: null, seed: seed + 11 });
    shp(c, [[-20, -190], [0, -140], [20, -190]], { fill: '#7fb3e6', lw: 5, seed });
    line(c, [[0, -140], [2, -6]], { lw: 4, seed });
    line(c, [[-20, -190], [-8, -110]], { lw: 4, seed }); line(c, [[20, -190], [8, -110]], { lw: 4, seed: seed + 1 });
  } else if (robe) {
    shp(c, bp, { fill: col, lw: 0, stroke: null, seed: seed + 11 });
    if (pr.trim) { c.save(); clipTo(); c.fillStyle = pr.trim; c.fillRect(-130, 4, 260, 26); c.fillStyle = 'rgba(0,0,0,0.13)'; for (let i = -110; i < 110; i += 16) c.fillRect(i, 18, 7, 10); c.restore(); }
    if (b === 'dress') line(c, [[-46, -118], [46, -114]], { lw: 6, stroke: pr.trim || INK, seed });
    // fabric fold lines (hand-drawn detail)
    line(c, [[-28, -60], [-34, 10]], { lw: 3.5, seed: seed + 6, stroke: 'rgba(0,0,0,0.35)' });
    line(c, [[30, -40], [36, 14]], { lw: 3.5, seed: seed + 7, stroke: 'rgba(0,0,0,0.35)' });
  } else {
    shp(c, bp, { fill: col, lw: 0, stroke: null, seed: seed + 11 });
    line(c, [[-22, -40], [-26, -10]], { lw: 3.5, seed: seed + 6, stroke: 'rgba(0,0,0,0.3)' });
  }
  if (pr.acc && pr.acc.includes('belly')) ell(c, 20, -76, 86, 74, { fill: col, lw: LW, seed: seed + 3 });
  // body outline last so it sits on top of the clothing details
  shp(c, bp, { lw: LW, seed: seed + 11 });
  if (pr.acc && pr.acc.includes('collar')) {
    const cols = ['#2f7fc1', '#e2b13c', '#c0392b', '#1abc9c', '#e2b13c'];
    for (let i = cols.length - 1; i >= 0; i--) { const r = 54 + i * 11; shp(c, ellPts(0, -190, r, r * 0.6, 26, 0.12, Math.PI - 0.12), { fill: cols[i], lw: 3.5, seed: seed + 60 + i }); }
  }
  if (pr.acc && pr.acc.includes('stetho')) { line(c, [[-28, -186], [-34, -120], [0, -94], [34, -120], [28, -186]], { lw: 5, stroke: '#333', seed }); circ(c, 0, -90, 12, { fill: '#bbb', lw: 4, seed }); }
  if (pr.acc && pr.acc.includes('necklace')) shp(c, ellPts(0, -188, 46, 26, 22, 0.25, Math.PI - 0.25), { closed: false, lw: 7, stroke: '#f1c40f', seed });
}

function drawHead(c, st, pr, seed, t, face, o, talking) {
  const R = 100;
  const lx = (o.look ? o.look[0] : 0), ly = (o.look ? o.look[1] : 0);
  const hair = pr.hair, hc = pr.hairColor || INK;
  const HLW = 11;
  const headPts = blobPts(0, 0, 104, 97, seed + 31);
  // back hair / hat backs
  if (hair === 'wig' || hair === 'wiglong') {
    const L = hair === 'wiglong' ? 150 : 92;
    shp(c, [[-112, -30], [-116, L], [-60, L + 8], [60, L + 8], [116, L], [112, -30], ...ellPts(0, -12, 114, 108, 24, TAU, Math.PI).slice(1)], { fill: hc, lw: 10, seed: seed + 30 });
  }
  if (hair === 'long') shp(c, [[-104, -10], [-110, 150], [110, 150], [104, -10], ...ellPts(0, -10, 108, 110, 20, TAU, Math.PI).slice(1)], { fill: hc, lw: 10, seed: seed + 30 });
  if (hair === 'bun') circ(c, 8, -108, 42, { fill: hc, lw: 10, seed: seed + 32 });
  // head
  shp(c, headPts, { fill: pr.skin, lw: HLW, seed: seed + 31, stroke: pr.ghost ? '#9fb5cf' : INK, amp: 1.2 });
  if (pr.acc && pr.acc.includes('tan')) { c.save(); trace(c, headPts, true); c.clip(); c.fillStyle = 'rgba(120,60,20,0.16)'; c.fillRect(-R, -R, 2 * R, 1.2 * R); c.restore(); }
  // front hair
  const capPts = (top, sideY, edgeSeed) => {
    const p = [];
    for (let i = 0; i <= 20; i++) { const a = Math.PI + i / 20 * Math.PI; p.push([Math.cos(a) * 106, Math.sin(a) * 100 * top]); }
    // jagged/uneven fringe going back
    for (let i = 0; i <= 8; i++) { const u = i / 8; p.push([lerp(106, -106, u), sideY + Math.sin(u * Math.PI) * -12 + (rnd(edgeSeed, i) - 0.5) * 14]); }
    return p;
  };
  if (hair === 'tuft') { for (let i = -1; i <= 1; i++) line(c, [[i * 16, -94], [i * 22 + 4, -122], [i * 30 + 10, -140 - (i === 0 ? 8 : 0)]], { lw: 8, stroke: hc, seed: seed + 40 + i }); shp(c, capPts(0.98, -34, seed + 44), { fill: hc, lw: 10, seed: seed + 44 }); }
  if (hair === 'short') shp(c, capPts(1.0, -30, seed + 45), { fill: hc, lw: 10, seed: seed + 45 });
  if (hair === 'curly' || hair === 'curlyw') shp(c, [...scallop(0, -8, 104, 102, Math.PI * 1.02, Math.PI * 1.98, 8, 15, seed + 50), [80, -26], [40, -46], [-40, -46], [-80, -26]], { fill: hc, lw: 10, seed: seed + 50 });
  if (hair === 'babycurl') line(c, [[-6, -98], [6, -116], [20, -108], [10, -96]], { lw: 7, stroke: hc, seed });
  if (hair === 'wild') { shp(c, [...scallop(0, -10, 112, 106, Math.PI * 0.92, Math.PI * 2.08, 11, 30, seed + 60), [96, 10], [60, -40], [-60, -40], [-96, 10]], { fill: hc, lw: 10, seed: seed + 60 }); }
  if (hair === 'wig' || hair === 'wiglong') { shp(c, [[-108, -6], ...ellPts(0, -10, 110, 104, 22, Math.PI, TAU).slice(1, -1), [108, -6], [74, -30], [-74, -30]], { fill: hc, lw: 10, seed: seed + 30 }); c.save(); c.globalAlpha *= 0.55; c.strokeStyle = '#3c6fae'; c.lineWidth = 6; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * 28, -94); c.lineTo(i * 32, -40); c.stroke(); } c.restore(); }
  if (hair === 'bun' || hair === 'long') shp(c, capPts(1.0, -24, seed + 46), { fill: hc, lw: 10, seed: seed + 46 });
  if (hair === 'balding') { for (const sd of [-1, 1]) shp(c, scallop(sd * 92, -4, 18, 40, sd > 0 ? -Math.PI / 2 : Math.PI / 2, sd > 0 ? Math.PI / 2 : Math.PI * 1.5, 3, 8, seed + sd), { fill: hc, lw: 7, seed: seed + sd }); line(c, [[-14, -98], [-4, -112], [8, -100]], { lw: 5, stroke: hc, seed }); }
  if (hair === 'laurel') { shp(c, capPts(0.98, -30, seed + 47), { fill: hc, lw: 9, seed: seed + 47 }); for (let i = 0; i < 12; i++) { const a = Math.PI * (1.0 + i / 11); ell(c, Math.cos(a) * 104, Math.sin(a) * 76 - 16, 16, 8, { fill: '#5aa832', lw: 4, seed: seed + i }); } }
  if (hair === 'cone') { shp(c, [[-82, -54], [-6, -196], [6, -196], [82, -54]], { fill: pr.hatColor, lw: 10, seed: seed + 48 }); line(c, [[-86, -56], [86, -52]], { lw: 13, stroke: '#8a6a10', seed }); }
  if (hair === 'horned') { shp(c, [[-84, -44], [-70, -148], [70, -148], [84, -44]], { fill: pr.hatColor, lw: 10, seed: seed + 48 }); for (const sd of [-1, 1]) line(c, [[sd * 68, -90], [sd * 124, -110], [sd * 140, -160]], { lw: 12, stroke: '#d9c39a', seed: seed + sd }); line(c, [[-80, -66], [80, -64]], { lw: 8, stroke: '#c9a227', seed }); }
  if (hair === 'kingcap') { shp(c, rrectPts(-80, -188, 160, 138, 26), { fill: pr.hatColor, lw: 10, seed: seed + 48 }); line(c, [[-84, -70], [84, -68]], { lw: 15, stroke: '#f0c419', seed }); for (let i = -2; i <= 2; i++) circ(c, i * 30, -128, 7, { fill: '#f0c419', lw: 3, seed: seed + i }); }

  // ---- eyes (small, close-set, slightly uneven like the reference) ----
  let [eyes, brows, mouth] = FACES[face] || FACES.neutral;
  const blinkPh = (t + rnd(seed) * 4) % 4.1;
  const blink = blinkPh < 0.1 && (eyes === 'dot' || eyes === 'half' || eyes === 'wide' || eyes === 'sleepy');
  const ex = 28, ey = -6 + ly * 6, exo = lx * 13;
  if (!brows && pr.brows) brows = pr.brows;
  const asym = [1 + (rnd(seed, 71) - 0.5) * 0.14, 1 + (rnd(seed, 72) - 0.5) * 0.14];
  const eyY = [(rnd(seed, 73) - 0.5) * 5, (rnd(seed, 74) - 0.5) * 5];
  for (let k = 0; k < 2; k++) {
    const sd = k === 0 ? -1 : 1;
    const x = sd * ex + exo, y = ey + eyY[k], z = asym[k];
    const blindEye = pr.acc && pr.acc.includes(sd < 0 ? 'blindL' : 'blindR') && !o.healed;
    if (blindEye) { c.fillStyle = '#e6ecf0'; c.beginPath(); c.ellipse(x, y, 12, 14, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(150,170,190,0.6)'; c.beginPath(); c.arc(x + 2, y + 2, 6, 0, TAU); c.fill(); line(c, [[x - 14, y - 13], [x + 13, y - 10]], { lw: 5, seed: seed + 70 }); continue; }
    if (blink) { line(c, [[x - 11, y + 1], [x, y + 3], [x + 11, y + 1]], { lw: 5.5, seed: seed + 71 + sd }); continue; }
    if (eyes === 'dot') { c.fillStyle = INK; c.beginPath(); c.ellipse(x + lx * 3, y + ly * 3, 9.5 * z, 12 * z, sd * 0.06, 0, TAU); c.fill(); }
    else if (eyes === 'wide') { ell(c, x, y - 3, 18 * z, 21 * z, { fill: '#fff', lw: 4.5, seed: seed + 72 + sd }); c.fillStyle = INK; c.beginPath(); c.arc(x + lx * 7, y - 2 + ly * 6, 6, 0, TAU); c.fill(); }
    else if (eyes === 'bulge') {
      const ox = sd * 6;
      ell(c, x + ox, y + 4, 27, 21, { fill: '#f2e3a2', lw: 6, seed: seed + 72 + sd });
      c.fillStyle = INK; c.beginPath(); c.ellipse(x + ox - 9, y + 10, 8.5, 7.5, 0, 0, TAU); c.fill();
      c.save(); c.beginPath(); c.ellipse(x + ox, y + 4, 27, 21, 0, 0, TAU); c.clip(); c.fillStyle = pr.skin; c.fillRect(x + ox - 30, y - 22, 60, 15 + (sd > 0 ? 3 : 0)); c.restore();
      line(c, [[x + ox - 30, y - 6 + (sd < 0 ? 4 : -2)], [x + ox, y - 9], [x + ox + 30, y - 6 + (sd > 0 ? 6 : -1)]], { lw: 8, seed: seed + 73 + sd });
      line(c, [[x + ox - 22, y + 30], [x + ox, y + 34], [x + ox + 20, y + 29]], { lw: 3.5, seed: seed + 76 + sd, stroke: 'rgba(40,20,10,0.6)' });
      if (o.bruise && sd > 0) { c.fillStyle = 'rgba(88,40,150,0.8)'; c.beginPath(); c.ellipse(x + ox + 4, y + 22, 26, 9, -0.1, 0, Math.PI); c.fill(); }
      continue;
    }
    else if (eyes === 'crazy') { const r = k ? 20 : 14; ell(c, x, y - 3, r, r * 1.1, { fill: '#fff9c4', lw: 4.5, seed: seed + 72 + sd }); c.fillStyle = INK; c.beginPath(); c.arc(x + (k ? 4 : -3), y - 1, k ? 4 : 5, 0, TAU); c.fill(); }
    else if (eyes === 'half' || eyes === 'sleepy') {
      c.fillStyle = INK; c.beginPath(); c.ellipse(x + lx * 3, y + 2, 10 * z, 11 * z, 0, 0, TAU); c.fill();
      const lid = eyes === 'sleepy' ? 6 : 1;
      c.fillStyle = pr.skin; c.fillRect(x - 15, y - 16, 30, 16 + lid);
      line(c, [[x - 15, y + lid + 1], [x + 15, y + lid - 1]], { lw: 6.5, seed: seed + 73 + sd });
    }
    else if (eyes === 'closed') line(c, [[x - 12, y], [x, y + 7], [x + 12, y]], { lw: 5.5, seed: seed + 74 + sd });
    else if (eyes === 'happy') line(c, [[x - 12, y + 4], [x, y - 7], [x + 12, y + 4]], { lw: 5.5, seed: seed + 75 + sd });
    else if (eyes === 'squint') line(c, [[x - sd * 12, y - 7], [x + sd * 8, y], [x - sd * 12, y + 7]], { lw: 5.5, seed: seed + 75 + sd });
    else if (eyes === 'x') { line(c, [[x - 10, y - 10], [x + 10, y + 10]], { lw: 5.5, seed }); line(c, [[x + 10, y - 10], [x - 10, y + 10]], { lw: 5.5, seed: seed + 1 }); }
    else if (eyes === 'spiral') { c.strokeStyle = INK; c.lineWidth = 3.5; c.beginPath(); for (let a = 0; a < 12; a += 0.3) c.lineTo(x + Math.cos(a + t * 8) * a * 1.3, y + Math.sin(a + t * 8) * a * 1.3); c.stroke(); }
    // eye bags (tired, funny look)
    if ((pr.bags || o.bags) && eyes !== 'closed' && eyes !== 'happy' && eyes !== 'x') line(c, [[x - 10, y + 17], [x, y + 21], [x + 9, y + 16]], { lw: 3.2, seed: seed + 76 + sd, stroke: 'rgba(40,20,10,0.55)' });
  }
  if (brows) {
    for (const sd of [-1, 1]) {
      const x = sd * ex + exo, y = ey - 27;
      let a = [x - 14, y], b = [x + 14, y];
      if (brows === 'angry') { a = [x - sd * 16, y - 8]; b = [x + sd * 13, y + 5]; }
      else if (brows === 'sad') { a = [x - sd * 16, y + 5]; b = [x + sd * 13, y - 8]; }
      else if (brows === 'up') { a = [x - 13, y - 9]; b = [x + 13, y - 11]; }
      else if (brows === 'serious' || brows === 'flat') { a = [x - 14, y + 4]; b = [x + 14, y + 3]; }
      else if (brows === 'raise') { if (sd > 0) { a = [x - 13, y - 12]; b = [x + 13, y - 6]; } }
      else if (brows === 'uni') { a = [x - 20, y + 3]; b = [x + 20, y + 6]; }
      line(c, [a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 2], b], { lw: brows === 'uni' ? 10 : 6, seed: seed + 80 + sd });
    }
  }
  // beard
  const bc = pr.beardColor || hc;
  if (pr.beard === 'big') shp(c, [[-92, 4], [-88, 60], [-70, 120], [-34, 152], [0, 162], [34, 152], [70, 120], [88, 60], [92, 4], [56, 42], [0, 28], [-56, 42]], { fill: bc, lw: 9, seed: seed + 90 });
  if (pr.beard === 'square') { shp(c, [[-66, 40], [-62, 138], [-26, 146], [26, 146], [62, 138], [66, 40], [42, 68], [22, 76], [-22, 76], [-42, 68]], { fill: bc, lw: 8, seed: seed + 90 }); c.strokeStyle = 'rgba(255,255,255,0.18)'; c.lineWidth = 3; for (let yy = 96; yy < 140; yy += 15) { c.beginPath(); c.moveTo(-52, yy); c.quadraticCurveTo(0, yy + 8, 52, yy); c.stroke(); } line(c, [[-28, 30], [-4, 26], [4, 26], [28, 30]], { lw: 8, stroke: bc, seed: seed + 91 }); }
  if (pr.beard === 'white') shp(c, [[-86, 12], [-58, 134], [0, 192], [58, 134], [86, 12], [48, 46], [0, 32], [-48, 46]], { fill: bc, lw: 8, seed: seed + 90 });
  if (pr.beard === 'stubble') { c.fillStyle = 'rgba(0,0,0,0.3)'; for (let i = 0; i < 26; i++) { const a = 0.4 + i / 26 * 2.3; c.fillRect(Math.cos(a) * 76 + rr(i, -6, 6), Math.sin(a) * 66 + 12, 3, 3); } }
  // mouth
  const my = 42 + ly * 4, mx = lx * 11 + (rnd(seed, 77) - 0.5) * 8;
  let mm = mouth;
  let open = 0;
  if (mm === 'talk' || (talking && mm !== 'sleep')) {
    open = clamp(envAt(t) * 1.5 - 0.15);
    open = open > 0.08 ? 0.3 + open * 0.7 : 0;
    mm = 'talkm';
  }
  if (pr.buck && (mm === 'line' || mm === 'smile' || mm === 'smirk' || mm === 'wavy')) mm = mm === 'line' ? 'buck' : mm;
  const ml = { lw: 5.5, seed: seed + 95 };
  const red = '#a8322e', tongue = '#e57373';
  const openMouth = (w, h, teeth, tng) => {
    shp(c, [[mx - w, my - 4], [mx - w * 0.4, my - 8], [mx + w * 0.4, my - 8], [mx + w, my - 4], ...ellPts(mx, my - 4, w, h, 14, 0, Math.PI).slice(1, -1)], { fill: red, lw: 5.5, seed: seed + 97 });
    if (teeth) { c.fillStyle = '#fff'; c.fillRect(mx - w * 0.75, my - 6, w * 1.5, 9); }
    if (tng) { c.fillStyle = tongue; c.beginPath(); c.ellipse(mx + 2, my + h - 12, w * 0.45, 8, 0, 0, TAU); c.fill(); }
  };
  if (mm === 'line') line(c, [[mx - 15, my], [mx, my + 1], [mx + 14, my - 1]], ml);
  else if (mm === 'smile') line(c, [[mx - 22, my - 6], [mx - 8, my + 6], [mx + 9, my + 6], [mx + 22, my - 7]], ml);
  else if (mm === 'frown') line(c, [[mx - 18, my + 7], [mx - 6, my - 3], [mx + 7, my - 3], [mx + 18, my + 8]], ml);
  else if (mm === 'smirk') line(c, [[mx - 18, my + 3], [mx + 4, my + 4], [mx + 20, my - 7]], ml);
  else if (mm === 'wavy') line(c, [[mx - 22, my], [mx - 11, my - 5], [mx, my + 3], [mx + 11, my - 5], [mx + 22, my]], ml);
  else if (mm === 'squiggle') line(c, [[mx - 18, my + 2], [mx - 5, my - 5], [mx + 7, my + 5], [mx + 18, my - 2]], ml);
  else if (mm === 'buck') { line(c, [[mx - 18, my - 2], [mx, my + 2], [mx + 18, my - 3]], ml); shp(c, rrectPts(mx - 11, my - 1, 10, 13, 2), { fill: '#fff', lw: 3.5, seed }); shp(c, rrectPts(mx + 1, my - 1, 10, 13, 2), { fill: '#fff', lw: 3.5, seed: seed + 1 }); }
  else if (mm === 'o') ell(c, mx, my + 4, 12, 16, { fill: red, lw: 5, seed: seed + 96 });
  else if (mm === 'smallo') ell(c, mx, my + 4, 7, 9, { fill: red, lw: 4.5, seed: seed + 96 });
  else if (mm === 'puke') {
    shp(c, [[mx - 34, my - 2], [mx - 10, my - 12], [mx + 14, my - 10], [mx + 32, my - 4], [mx + 26, my + 20], [mx, my + 28], [mx - 26, my + 20]], { fill: '#9a2a24', lw: 6, seed: seed + 97 });
    for (const [tx, tw, th] of [[-24, 11, 12], [-10, 10, 9], [14, 11, 13]]) shp(c, rrectPts(mx + tx, my - 9, tw, th, 2), { fill: '#fffbe6', lw: 3, seed: seed + tx });
    c.save(); c.beginPath(); c.ellipse(mx - 2, my + 13, 26, 12, 0, 0, TAU); c.clip(); c.fillStyle = '#9cc63a'; c.fillRect(mx - 30, my + 4, 60, 30); c.restore();
  }
  else if (mm === 'grin') openMouth(34, 26, true, false);
  else if (mm === 'open') openMouth(32, 30, false, true);
  else if (mm === 'yell') openMouth(28, 42, true, true);
  else if (mm === 'teeth') { shp(c, rrectPts(mx - 28, my - 12, 56, 24, 8), { fill: '#fff', lw: 5, seed: seed + 98 }); line(c, [[mx - 26, my], [mx + 26, my]], { lw: 3.5, seed }); }
  else if (mm === 'blech') { line(c, [[mx - 22, my], [mx - 8, my - 6], [mx + 6, my + 2], [mx + 22, my - 4]], ml); shp(c, [[mx - 2, my], [mx + 14, my], [mx + 16, my + 22], [mx + 6, my + 30], [mx - 4, my + 22]], { fill: tongue, lw: 4.5, seed }); }
  else if (mm === 'sleep') ell(c, mx, my + 4, 8, 5 + Math.sin(t * 2) * 3, { fill: red, lw: 4, seed });
  else if (mm === 'talkm') {
    if (open <= 0) line(c, [[mx - 16, my], [mx + 15, my - 1]], ml);
    else { const h = 6 + open * 28; shp(c, ellPts(mx, my + h * 0.3, 18 + open * 6, h, 16), { fill: red, lw: 5, seed: seed + 99 }); if (h > 16) { c.fillStyle = tongue; c.beginPath(); c.ellipse(mx, my + h * 0.3 + h * 0.55, 10, 5, 0, 0, TAU); c.fill(); } }
  }
  // cheeks / extras
  if (pr.blush || o.blush) { c.fillStyle = 'rgba(255,110,120,0.35)'; c.beginPath(); c.ellipse(-58, 26, 16, 9, 0, 0, TAU); c.ellipse(58, 26, 16, 9, 0, 0, TAU); c.fill(); }
  if (pr.acc && pr.acc.includes('glasses')) { for (const sd of [-1, 1]) circ(c, sd * ex + exo, ey, 22, { lw: 4.5, seed: seed + 100 + sd }); line(c, [[-8 + exo, ey], [8 + exo, ey]], { lw: 4.5, seed }); }
  if (o.bandage) { c.save(); trace(c, headPts, true); c.clip(); c.fillStyle = '#f5f1e6'; c.fillRect(-R - 10, -R + 4, 2 * R + 20, 42); c.restore(); line(c, [[-100, -32], [100, -32]], { lw: 4.5, seed }); }
  if (o.holes) {
    const healed = o.holes === 'healed' ? 1 : 0;
    ell(c, 0, -72, 74, 28, { fill: pr.skin, lw: 0, stroke: null, seed: seed + 5 });
    for (const hp of [[-32, -70, 14], [30, -76, 11]].slice(0, o.holeN || 2)) {
      ell(c, hp[0], hp[1], hp[2] + 6, hp[2] + 3, { fill: healed ? '#e8c9a8' : '#c97d6a', lw: 3.5, seed: seed + hp[0] });
      ell(c, hp[0], hp[1], hp[2] - (healed ? 5 : 0), hp[2] - 3 - (healed ? 4 : 0), { fill: '#3b1f1a', lw: 4, seed: seed + hp[1] });
    }
  }
  if (o.sweat) sweat(c, 96, -40, 1, t, seed);
  if (o.green) { c.save(); trace(c, headPts, true); c.clip(); c.fillStyle = 'rgba(110,170,40,0.42)'; c.fillRect(-R - 10, -10, 2 * R + 20, R + 20); c.restore(); }
  if (o.tears) { c.fillStyle = '#7fd0ff'; for (const sd of [-1, 1]) { const ph = (t * 1.2 + (sd > 0 ? 0.5 : 0)) % 1; c.beginPath(); c.ellipse(sd * ex + exo, ey + 18 + ph * 70, 5, 9, 0, 0, TAU); c.fill(); } }
}

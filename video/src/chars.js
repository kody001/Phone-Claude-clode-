// Character rig: round-head bean-body cartoon people.
'use strict';
const SKIN = { light: '#f6d2ae', fair: '#efc39b', tan: '#dca06e', olive: '#c98e5b', brown: '#a8693a', dark: '#7d4b28' };

// presets: outfit + hair + accessories
const P = {
  you: { skin: SKIN.light, body: 'gown', color: '#bfe1f3', hair: 'tuft', hairColor: '#5b3a20', legs: 'bare' },
  you_modern: { skin: SKIN.light, body: 'bean', color: '#3f7fd6', hair: 'tuft', hairColor: '#5b3a20' },
  doctor: { skin: SKIN.fair, body: 'coat', color: '#ffffff', hair: 'short', hairColor: '#3b2a1e', acc: ['stetho', 'glasses'] },
  caveman: { skin: SKIN.tan, body: 'fur', color: '#9a5e2e', hair: 'wild', hairColor: '#2a1c12', beard: 'stubble' },
  cavedoc: { skin: SKIN.olive, body: 'fur', color: '#d9a43b', spots: '#7a4a17', hair: 'wild', hairColor: '#4a2a12', brows: 'uni' },
  iry: { skin: SKIN.brown, body: 'kilt', color: '#f7f3e6', hair: 'wig', hairColor: '#141414', acc: ['collar'], brows: 'serious' },
  egy: { skin: SKIN.brown, body: 'kilt', color: '#f7f3e6', hair: 'wig', hairColor: '#141414' },
  egyw: { skin: SKIN.brown, body: 'dress', color: '#f4efe0', hair: 'wiglong', hairColor: '#141414', acc: ['collar'] },
  rod: { skin: SKIN.fair, body: 'chiton', color: '#efe3c4', trim: '#2c5aa0', hair: 'curly', hairColor: '#6b4a2f', beard: 'big', beardColor: '#6b4a2f', legs: 'sandals' },
  bab_sick: { skin: SKIN.olive, body: 'robe', color: '#c0392b', trim: '#f1c40f', hair: 'curly', hairColor: '#2e2018', beard: 'square', beardColor: '#2e2018' },
  bab_pass: { skin: SKIN.brown, body: 'robe', color: '#2e6fb5', trim: '#f1c40f', hair: 'cone', hairColor: '#2e2018', hatColor: '#d4a017', beard: 'square', beardColor: '#2e2018' },
  bab_w: { skin: SKIN.olive, body: 'dress', color: '#8e44ad', trim: '#f1c40f', hair: 'long', hairColor: '#2e2018' },
  bab: { skin: SKIN.olive, body: 'robe', color: '#16a085', trim: '#f1c40f', hair: 'curly', hairColor: '#2e2018', beard: 'square', beardColor: '#2e2018' },
  asu: { skin: SKIN.olive, body: 'robe', color: '#4f8a3a', trim: '#e8d36a', hair: 'curly', hairColor: '#2e2018', beard: 'square', beardColor: '#2e2018' },
  ashipu: { skin: SKIN.brown, body: 'robe', color: '#3d2b5c', trim: '#c9a227', hair: 'horned', hatColor: '#2a1d3f', beard: 'square', beardColor: '#111' },
  hamm: { skin: SKIN.olive, body: 'robe', color: '#5b2a86', trim: '#f0c419', hair: 'kingcap', hatColor: '#3a1c5a', beard: 'square', beardColor: '#120c08', acc: ['necklace'] },
  noble: { skin: SKIN.olive, body: 'robe', color: '#d35400', trim: '#f4d03f', hair: 'curly', hairColor: '#2e2018', beard: 'square', beardColor: '#2e2018', acc: ['necklace'] },
  slave: { skin: SKIN.brown, body: 'bean', color: '#9b8b72', hair: 'short', hairColor: '#2e2018' },
  bab_doc: { skin: SKIN.brown, body: 'robe', color: '#ece2c6', trim: '#2c7fb8', hair: 'curly', hairColor: '#2e2018', beard: 'square', beardColor: '#2e2018' },
  asclepius: { skin: SKIN.fair, body: 'toga', color: '#f6f3ea', stripe: '#3a78c2', hair: 'curlyw', hairColor: '#e9e4da', beard: 'white', beardColor: '#eeeae2', tall: 1.12 },
  greek: { skin: SKIN.fair, body: 'chiton', color: '#dfe7f0', trim: '#b5462e', hair: 'curly', hairColor: '#3a2716', beard: 'stubble' },
  greekw: { skin: SKIN.light, body: 'dress', color: '#e98ba3', trim: '#fff1c9', hair: 'bun', hairColor: '#5a3418' },
  kleo: { skin: SKIN.light, body: 'dress', color: '#f29bb0', trim: '#fff1c9', hair: 'bun', hairColor: '#3a2213', acc: ['belly'] },
  ambrosia: { skin: SKIN.fair, body: 'dress', color: '#2fa39a', trim: '#f6e7b0', hair: 'bun', hairColor: '#24160d', acc: ['blindL'] },
  baby: { skin: SKIN.light, body: 'bean', color: '#ffffff', hair: 'babycurl', hairColor: '#8a5a2b', small: 0.55 },
  cato: { skin: SKIN.tan, body: 'toga', color: '#f4f0e6', stripe: '#7a1f3d', hair: 'balding', hairColor: '#9a9590', brows: 'angry', acc: ['tan'] },
  marcus: { skin: SKIN.fair, body: 'toga', color: '#f4f0e6', stripe: '#7a1f3d', hair: 'short', hairColor: '#2a1a10' },
  catowife: { skin: SKIN.light, body: 'dress', color: '#9b59b6', trim: '#f6e7b0', hair: 'bun', hairColor: '#4a2a14' },
  youngwife: { skin: SKIN.light, body: 'dress', color: '#f5b041', trim: '#fff', hair: 'long', hairColor: '#7a3f12' },
  caesar: { skin: SKIN.fair, body: 'toga', color: '#f4f0e6', stripe: '#6c2a8c', hair: 'laurel', hairColor: '#4a3828' },
  plutarch: { skin: SKIN.fair, body: 'chiton', color: '#e8dcc0', trim: '#7a5230', hair: 'balding', hairColor: '#cfc8bd', beard: 'white', beardColor: '#e3ded4' },
  roman: { skin: SKIN.fair, body: 'toga', color: '#f4f0e6', stripe: '#7a1f3d', hair: 'short', hairColor: '#3a2716' },
  romanb: { skin: SKIN.tan, body: 'bean', color: '#a0522d', hair: 'short', hairColor: '#2a1a10' },
  senator: { skin: SKIN.fair, body: 'toga', color: '#f4f0e6', stripe: '#7a1f3d', hair: 'balding', hairColor: '#7a756f' },
  narr: { skin: SKIN.light, body: 'bean', color: '#e74c3c', hair: 'tuft', hairColor: '#3b2a1e' },
  egy_pat: { skin: SKIN.brown, body: 'kilt', color: '#efe6cf', hair: 'short', hairColor: '#141414' },
  roman_pat: { skin: SKIN.fair, body: 'bean', color: '#c9a77a', hair: 'short', hairColor: '#4a2e18' },
  greek_pat: { skin: SKIN.fair, body: 'chiton', color: '#e8d6c0', trim: '#4a7a3a', hair: 'curly', hairColor: '#1a1a1a' },
  ghost: { skin: '#e8f4ff', body: 'ghost', color: '#e8f4ff', hair: 'balding', hairColor: '#ffffff', beard: 'white', beardColor: '#ffffff', ghost: true },
  medic: { skin: SKIN.brown, body: 'bean', color: '#1f7a4a', hair: 'short', hairColor: '#1a1a1a' },
};

const FACES = {
  neutral: ['dot', null, 'line'], happy: ['dot', null, 'smile'], grin: ['dot', 'up', 'grin'], smug: ['half', 'flat', 'smirk'],
  serious: ['dot', 'serious', 'line'], angry: ['dot', 'angry', 'frown'], furious: ['dot', 'angry', 'yell'], sad: ['dot', 'sad', 'frown'],
  shock: ['wide', 'up', 'o'], scared: ['wide', 'sad', 'wavy'], disgust: ['half', 'angry', 'blech'], nervous: ['dot', 'sad', 'wavy'],
  sleep: ['closed', null, 'sleep'], laugh: ['happy', 'up', 'open'], dead: ['x', null, 'line'], confused: ['dot', 'raise', 'squiggle'],
  proud: ['happy', null, 'smile'], cry: ['closed', 'sad', 'frown'], blank: ['dot', null, null], talk: ['dot', null, 'talk'],
  bored: ['half', null, 'line'], wince: ['squint', 'angry', 'teeth'], awe: ['wide', 'up', 'smallo'], content: ['happy', null, 'smile'],
  yell: ['dot', 'angry', 'yell'], sly: ['half', 'raise', 'smirk'], smugtalk: ['half', 'flat', 'talk'], angrytalk: ['dot', 'angry', 'talk'],
  sadtalk: ['dot', 'sad', 'talk'], happytalk: ['dot', null, 'talk'], dizzy: ['spiral', null, 'wavy'], teeth: ['wide', 'sad', 'teeth'],
};

const POSES = {
  idle: [[10, 6], [10, 6]], hips: [[48, -52], [48, -52]], point: [[10, 6], [96, 92]], pointUp: [[10, 6], [150, 165]],
  shrug: [[62, 140], [62, 140]], armsUp: [[150, 168], [150, 168]], hold: [[10, 6], [28, -70]], hold2: [[28, -70], [28, -70]],
  think: [[10, 6], [24, -150]], facepalm: [[10, 6], [18, -172]], cross: [[22, -96], [22, -96]], present: [[10, 6], [62, 70]],
  holdUp: [[10, 6], [150, 165]], scared: [[34, -150], [34, -150]], reach: [[10, 6], [80, 80]], wave: [[10, 6], [140, 170]],
  shrugL: [[62, 140], [10, 6]], both: [[60, 75], [60, 75]], cheer: [[150, 168], [10, 6]], fists: [[40, 160], [40, 160]],
  holdBoth: [[38, -48], [38, -48]], lean: [[10, 6], [10, 6]], carry: [[10, 6], [36, -40]], beg: [[30, -60], [30, -60]],
  holdL: [[28, -70], [10, 6]], pointL: [[96, 92], [10, 6]], stop: [[10, 6], [70, 175]], headhold: [[60, -175], [60, -175]],
};

function lerpPose(a, b, p) { return [[lerp(a[0][0], b[0][0], p), lerp(a[0][1], b[0][1], p)], [lerp(a[1][0], b[1][0], p), lerp(a[1][1], b[1][1], p)]]; }

// main character draw. o: x,y,s,flip,face,pose,poses:[[t,pose]...],hold:{L,R},talk,look:[x,y],enter:[t0,kind],out,lie,rot,alpha,acc
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
  // move path: o.move = [[t0, x, y, dur], ...]
  if (o.move) for (const m of o.move) {
    const t0 = typeof m[0] === 'number' ? st.s.start + m[0] : st.k(m[0]);
    const p = E.io(clamp((t - t0) / (m[3] || 0.6)));
    if (t >= t0) { x = lerp(x, m[1], p); y = lerp(y, m[2], p); }
  }
  // hop/jump: o.hops = [t,...]
  let jump = 0, squash = 1;
  for (const h of o.hops || []) {
    const t0 = typeof h === 'number' ? st.s.start + h : st.k(h);
    const d = t - t0;
    if (d >= 0 && d < 0.45) { jump += Math.sin(d / 0.45 * Math.PI) * 70; }
    if (d >= 0.42 && d < 0.6) squash *= 1 - 0.08 * Math.sin((d - 0.42) / 0.18 * Math.PI);
    cue('hop', t0, 0.35);
  }
  // shiver/tremble
  let shx = 0;
  if (o.tremble) shx = Math.sin(t * 70) * 3 * s;
  const breathe = 1 + Math.sin(t * 2.2 + seedBase) * 0.012;
  const talking = o.talk && (o.talk === true || (t >= (typeof o.talk[0] === 'number' ? st.s.start + o.talk[0] : st.k(o.talk[0])) && t <= (typeof o.talk[1] === 'number' ? st.s.start + o.talk[1] : st.k(o.talk[1], 1))));
  let bob = 0;
  if (talking) bob = Math.sin(t * 14) * 2;
  if (o.walk) bob += Math.abs(Math.sin(t * 9)) * -10;

  c.save();
  c.globalAlpha *= alpha;
  c.translate(x + shx, y - jump);
  c.scale(s * sc * (o.flip ? -1 : 1), s * sc);
  if (o.lie) { c.translate(0, -60); c.rotate(-Math.PI / 2 * (o.lie === 'r' ? -1 : 1)); c.translate(0, 120); }
  if (rot) { c.translate(0, -200); c.rotate(rot); c.translate(0, 200); }
  c.scale(1, squash);
  const tall = pr.tall || 1;
  // ground shadow
  if (!o.noShadow && !o.lie && !pr.ghost) shadowEll(c, 0, 4, 120 + jump * 0.2, 0.22);

  // face/pose resolve (timed)
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

  const ms = { seed: seedBase + 1, lw: 9 };
  const k = pr.ghost ? 0 : 1;

  // ---- legs ----
  const legY0 = -36;
  if (pr.body !== 'ghost') {
    const lc = pr.legs === 'bare' || pr.body === 'kilt' || pr.body === 'fur' || pr.body === 'toga' || pr.body === 'chiton' ? pr.skin : INK;
    for (const sd of [-1, 1]) {
      let lx = sd * 30, swing = o.walk ? Math.sin(t * 9 + (sd > 0 ? Math.PI : 0)) * 18 : 0;
      if (o.sit) { line(c, [[lx, legY0 - 10], [lx + sd * 6 + 40, legY0 + 6], [lx + sd * 6 + 46, 0]], { lw: 11, seed: seedBase + 3 + sd }); continue; }
      line(c, [[lx, legY0 - 6], [lx + swing, -2]], { lw: 11, seed: seedBase + 3 + sd });
      if (lc !== INK) line(c, [[lx, legY0 - 4], [lx + swing, -6]], { lw: 4, stroke: lc, seed: seedBase + 5 + sd, amp: 0.5 });
      // foot
      line(c, [[lx + swing - (sd < 0 ? 14 : 0), 0], [lx + swing + (sd > 0 ? 14 : 0), 0]], { lw: 11, seed: seedBase + 7 + sd });
      if (pr.legs === 'sandals') line(c, [[lx + swing - 9, -14], [lx + swing + 9, -18]], { lw: 4, stroke: '#8a5a2b', amp: 0 });
    }
  }

  // ---- body ----
  c.save();
  c.translate(0, legY0 + 2);
  c.scale(1, breathe * tall);
  drawBody(c, pr, seedBase, t, o);
  c.restore();
  const shY = (legY0 - 186) * tall * breathe;

  // ---- arms (behind-body items first) ----
  const shoulders = [[-54, shY + 22], [54, shY + 22]];
  const hands = [];
  for (let i = 0; i < 2; i++) {
    const sd = i === 0 ? -1 : 1;
    const [a1, a2] = pose[i];
    const r1 = a1 * Math.PI / 180, r2 = a2 * Math.PI / 180;
    const sp = shoulders[i];
    const el = [sp[0] + sd * Math.sin(r1) * 80, sp[1] + Math.cos(r1) * 80];
    const hd = [el[0] + sd * Math.sin(r2) * 74, el[1] + Math.cos(r2) * 74];
    hands.push({ p: hd, ang: Math.atan2(hd[1] - el[1], hd[0] - el[0]), sd });
    line(c, [sp, el, hd], { lw: 11, seed: seedBase + 20 + i, stroke: pr.ghost ? '#b8c8dc' : INK });
  }

  // ---- head ----
  const hy = shY - 92 - (talking ? bob : 0) + (o.headDy || 0);
  const hx = (o.headDx || 0);
  c.save();
  c.translate(hx, hy);
  if (o.headTilt) c.rotate(o.headTilt * Math.PI / 180);
  drawHead(c, st, pr, seedBase, t, face, o, talking);
  c.restore();

  // ---- held props ----
  for (let i = 0; i < 2; i++) {
    const side = i === 0 ? 'L' : 'R';
    const item = o.hold && o.hold[side];
    if (!item) continue;
    const h = hands[i];
    c.save();
    c.translate(h.p[0], h.p[1]);
    const name = typeof item === 'string' ? item : item[0];
    const io = typeof item === 'string' ? {} : item[1] || {};
    if (io.rot !== undefined) c.rotate(io.rot);
    if (o.flip) c.scale(-1, 1);
    drawProp(c, st, name, Object.assign({ s: io.s || 1, seed: seedBase + 40 + i }, io));
    c.restore();
  }
  // accessories after everything
  if (o.after) o.after(c, { hy, hands, shY });
  c.restore();
}

function drawBody(c, pr, seed, t, o) {
  const b = pr.body;
  const col = pr.color;
  const ms = { seed: seed + 11, lw: 9 };
  if (b === 'ghost') {
    const pts = [];
    for (let i = 0; i <= 20; i++) { const u = i / 20; pts.push([lerp(70, -70, u), -190 + 40 + Math.sin(u * 8 + t * 6) * 10 + 150]); }
    const full = [[-60, -200], [60, -200], [72, -60], ...pts.map(p => [p[0], p[1] - 30]), [-72, -60]];
    shp(c, full, { fill: 'rgba(232,244,255,0.85)', lw: 6, stroke: '#9fb5cf', seed });
    return;
  }
  if (b === 'robe' || b === 'dress') {
    const bp = trapPts(118, 196, 222, 44, 18, 34);
    shp(c, bp, { fill: col, ...ms });
    if (pr.trim) { c.save(); trace(c, wob(bp, true, seed + 11, 1.3), true); c.clip(); c.fillStyle = pr.trim; c.fillRect(-120, 10, 240, 24); c.fillStyle = 'rgba(0,0,0,0.12)'; for (let i = -100; i < 100; i += 16) c.fillRect(i, 26, 8, 12); c.restore(); shp(c, bp, { stroke: INK, lw: 9, seed: seed + 11 }); }
    if (b === 'dress') line(c, [[-50, -120], [50, -120]], { lw: 6, stroke: pr.trim || INK, seed });
    if (pr.acc && pr.acc.includes('belly')) { ell(c, 18, -80, 96, 84, { fill: col, lw: 9, seed: seed + 3 }); }
    return;
  }
  const bp = trapPts(118, 168, 206, 42, 26);
  if (b === 'kilt') {
    shp(c, bp, { fill: pr.skin, ...ms });
    c.save(); trace(c, wob(bp, true, seed + 11, 1.3), true); c.clip();
    c.fillStyle = col; c.fillRect(-100, -86, 200, 100);
    c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 3;
    for (let i = -60; i <= 60; i += 22) { c.beginPath(); c.moveTo(i * 0.6, -84); c.lineTo(i, 0); c.stroke(); }
    c.fillStyle = '#d4a017'; c.fillRect(-100, -92, 200, 12);
    c.restore();
    shp(c, bp, { stroke: INK, lw: 9, seed: seed + 11 });
    line(c, [[-84, -86], [84, -86]], { lw: 5, seed });
  } else if (b === 'gown') {
    shp(c, bp, { fill: col, ...ms });
    c.save(); trace(c, wob(bp, true, seed + 11, 1.3), true); c.clip();
    c.fillStyle = 'rgba(40,90,140,0.35)';
    for (let yy = -200; yy < 10; yy += 26) for (let xx = -90; xx < 90; xx += 26) { const ox = (Math.floor(yy / 26) % 2) * 13; c.beginPath(); c.moveTo(xx + ox, yy - 5); c.lineTo(xx + ox + 5, yy); c.lineTo(xx + ox, yy + 5); c.lineTo(xx + ox - 5, yy); c.fill(); }
    c.restore();
    shp(c, bp, { stroke: INK, lw: 9, seed: seed + 11 });
    line(c, [[-30, -206], [0, -170], [30, -206]], { lw: 5, seed });
  } else if (b === 'toga' || b === 'chiton') {
    shp(c, bp, { fill: col, ...ms });
    c.save(); trace(c, wob(bp, true, seed + 11, 1.3), true); c.clip();
    if (b === 'toga') {
      c.fillStyle = 'rgba(0,0,0,0.08)';
      c.beginPath(); c.moveTo(-70, -210); c.lineTo(90, 0); c.lineTo(40, 0); c.lineTo(-90, -160); c.fill();
      c.strokeStyle = pr.stripe || '#7a1f3d'; c.lineWidth = 16; c.beginPath(); c.moveTo(-64, -214); c.lineTo(100, 4); c.stroke();
      c.strokeStyle = 'rgba(0,0,0,0.2)'; c.lineWidth = 3;
      for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-90 + i * 12, -120 + i * 20); c.quadraticCurveTo(0, -60 + i * 18, 60 - i * 10, -10); c.stroke(); }
      if (pr.acc && pr.acc.includes('tan')) {}
    } else {
      c.fillStyle = pr.trim || '#2c5aa0'; c.fillRect(-120, -16, 240, 18);
      c.fillStyle = '#fff3'; for (let i = -110; i < 110; i += 20) c.fillRect(i, -12, 10, 10);
      c.strokeStyle = 'rgba(0,0,0,0.18)'; c.lineWidth = 3; for (let i = -50; i <= 50; i += 25) { c.beginPath(); c.moveTo(i * 0.5, -190); c.lineTo(i, -20); c.stroke(); }
      line(c, [[-60, -120], [60, -120]], { lw: 6, stroke: '#8a5a2b', seed });
    }
    c.restore();
    shp(c, bp, { stroke: INK, lw: 9, seed: seed + 11 });
  } else if (b === 'fur') {
    const jag = [];
    for (let i = 0; i <= 8; i++) jag.push([lerp(84, -84, i / 8), i % 2 ? -8 : 6]);
    const fp = [...trapPts(118, 168, 206, 42, 26).filter(p => p[1] < -20), ...jag];
    shp(c, fp, { fill: col, ...ms });
    c.save(); trace(c, fp, true); c.clip();
    c.fillStyle = pr.spots || 'rgba(60,30,10,0.45)';
    for (let i = 0; i < 9; i++) { c.beginPath(); c.ellipse(rr(seed + i, -70, 70), rr(seed + i + 50, -190, -20), 12, 9, i, 0, TAU); c.fill(); }
    c.restore();
    shp(c, fp, { stroke: INK, lw: 9, seed: seed + 11 });
  } else if (b === 'coat') {
    shp(c, bp, { fill: '#ffffff', ...ms });
    shp(c, [[-24, -206], [0, -150], [24, -206]], { fill: '#7fb3e6', lw: 6, seed });
    line(c, [[0, -150], [0, 0]], { lw: 5, seed });
    line(c, [[-24, -206], [-10, -120]], { lw: 5, seed }); line(c, [[24, -206], [10, -120]], { lw: 5, seed });
    rrect(c, 30, -110, 36, 30, 4, { lw: 5, seed });
  } else {
    shp(c, bp, { fill: col, ...ms });
  }
  if (pr.acc && pr.acc.includes('collar')) {
    const cols = ['#2f7fc1', '#e2b13c', '#c0392b', '#1abc9c', '#e2b13c'];
    for (let i = cols.length - 1; i >= 0; i--) {
      const r = 66 + i * 13;
      shp(c, ellPts(0, -206, r, r * 0.62, 30, 0.08, Math.PI - 0.08), { fill: cols[i], lw: 4, seed: seed + 60 + i, closed: true });
    }
  }
  if (pr.acc && pr.acc.includes('stetho')) { line(c, [[-34, -200], [-40, -130], [0, -100], [40, -130], [34, -200]], { lw: 6, stroke: '#333', seed }); circ(c, 0, -96, 13, { fill: '#bbb', lw: 5, seed }); }
  if (pr.acc && pr.acc.includes('necklace')) { shp(c, ellPts(0, -200, 54, 30, 24, 0.2, Math.PI - 0.2), { closed: false, lw: 8, stroke: '#f1c40f', seed }); }
}

function drawHead(c, st, pr, seed, t, face, o, talking) {
  const R = 100;
  const lx = (o.look ? o.look[0] : 0), ly = (o.look ? o.look[1] : 0);
  const hair = pr.hair, hc = pr.hairColor || INK;
  const ms = { seed: seed + 30, lw: 9 };
  // back hair
  if (hair === 'wig' || hair === 'wiglong') {
    const L = hair === 'wiglong' ? 150 : 95;
    shp(c, [[-112, -40], [-118, L], [118, L], [112, -40], ...ellPts(0, -12, 116, 112, 24, Math.PI * 2, Math.PI).slice(1)], { fill: hc, ...ms });
  }
  if (hair === 'long') shp(c, [[-108, -10], [-112, 150], [112, 150], [108, -10], ...ellPts(0, -10, 110, 112, 20, TAU, Math.PI).slice(1)], { fill: hc, ...ms });
  if (hair === 'bun') circ(c, 0, -112, 44, { fill: hc, ...ms });
  if (hair === 'kingcap') { /* drawn after head */ }
  // head
  const skin = pr.skin;
  circ(c, 0, 0, R, { fill: skin, lw: 9, seed: seed + 31, stroke: pr.ghost ? '#9fb5cf' : INK });
  if (pr.acc && pr.acc.includes('tan')) { c.save(); c.beginPath(); c.arc(0, 0, R - 5, 0, TAU); c.clip(); c.fillStyle = 'rgba(120,60,20,0.18)'; c.fillRect(-R, -R, 2 * R, 1.25 * R); c.restore(); }
  // front hair
  if (hair === 'tuft') { for (let i = -1; i <= 1; i++) line(c, [[i * 18, -96], [i * 28 + 6, -138 - (i === 0 ? 10 : 0)]], { lw: 10, stroke: hc, seed: seed + 40 + i }); shp(c, ellPts(0, -40, 98, 64, 24, Math.PI * 1.08, Math.PI * 1.92), { fill: hc, lw: 9, seed: seed + 44 }); }
  if (hair === 'short') shp(c, ellPts(0, -36, 101, 70, 24, Math.PI * 1.02, Math.PI * 1.98), { fill: hc, ...ms });
  if (hair === 'curly' || hair === 'curlyw' || hair === 'babycurl') {
    const n = hair === 'babycurl' ? 3 : 9;
    for (let i = 0; i < n; i++) { const a = Math.PI * (1.08 + 0.84 * i / (n - 1)); circ(c, Math.cos(a) * 92, Math.sin(a) * 92 + 6, hair === 'babycurl' ? 16 : 26, { fill: hc, lw: 7, seed: seed + 50 + i }); }
    if (hair !== 'babycurl') shp(c, ellPts(0, -30, 96, 66, 24, Math.PI * 1.04, Math.PI * 1.96), { fill: hc, lw: 0, stroke: null, seed });
  }
  if (hair === 'wild') { for (let i = 0; i < 11; i++) { const a = Math.PI * (0.95 + 1.1 * i / 10); line(c, [[Math.cos(a) * 80, Math.sin(a) * 80], [Math.cos(a + 0.12) * 150, Math.sin(a + 0.12) * 140]], { lw: 22, stroke: hc, seed: seed + 60 + i }); } shp(c, ellPts(0, -26, 104, 82, 24, Math.PI * 1.0, Math.PI * 2.0), { fill: hc, lw: 9, seed }); }
  if (hair === 'wig' || hair === 'wiglong') { shp(c, [[-106, -14], ...ellPts(0, -14, 108, 104, 22, Math.PI, TAU).slice(1, -1), [106, -14], [70, -40], [-70, -40]], { fill: hc, ...ms }); c.save(); c.globalAlpha *= 0.5; c.strokeStyle = '#2d5d9a'; c.lineWidth = 6; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * 30, -96); c.lineTo(i * 34, -46); c.stroke(); } c.restore(); }
  if (hair === 'bun' || hair === 'long') shp(c, ellPts(0, -30, 100, 72, 24, Math.PI * 1.02, Math.PI * 1.98), { fill: hc, ...ms });
  if (hair === 'balding') { for (const sd of [-1, 1]) shp(c, ellPts(sd * 88, -6, 26, 46, 14), { fill: hc, lw: 6, seed: seed + sd }); }
  if (hair === 'laurel') { shp(c, ellPts(0, -28, 99, 66, 24, Math.PI * 1.05, Math.PI * 1.95), { fill: hc, lw: 7, seed }); for (let i = 0; i < 12; i++) { const a = Math.PI * (1.0 + i / 11); ell(c, Math.cos(a) * 100, Math.sin(a) * 74 - 18, 16, 9, { fill: '#5aa832', lw: 4, seed: seed + i }); } }
  if (hair === 'cone') { shp(c, [[-80, -60], [0, -190], [80, -60]], { fill: pr.hatColor, ...ms }); line(c, [[-84, -60], [84, -60]], { lw: 14, stroke: '#8a6a10', seed }); }
  if (hair === 'horned') { shp(c, [[-86, -50], [-70, -150], [70, -150], [86, -50]], { fill: pr.hatColor, ...ms }); for (const sd of [-1, 1]) line(c, [[sd * 70, -90], [sd * 130, -110], [sd * 140, -160]], { lw: 12, stroke: '#d9c39a', seed: seed + sd }); line(c, [[-80, -70], [80, -70]], { lw: 8, stroke: '#c9a227', seed }); }
  if (hair === 'kingcap') { shp(c, rrectPts(-82, -190, 164, 140, 26), { fill: pr.hatColor, ...ms }); line(c, [[-86, -72], [86, -72]], { lw: 16, stroke: '#f0c419', seed }); for (let i = -2; i <= 2; i++) circ(c, i * 30, -130, 7, { fill: '#f0c419', lw: 3, seed: seed + i }); }

  // eyes
  let [eyes, brows, mouth] = FACES[face] || FACES.neutral;
  const blinkPh = (t + rnd(seed) * 4) % 3.9;
  const blink = blinkPh < 0.11 && (eyes === 'dot' || eyes === 'half' || eyes === 'wide');
  const ex = 34, ey = -6 + ly * 6;
  const exo = lx * 14;
  const pb = pr.brows;
  if (!brows && pb) brows = pb;
  for (const sd of [-1, 1]) {
    const x = sd * ex + exo, y = ey;
    const blindEye = pr.acc && pr.acc.includes(sd < 0 ? 'blindL' : 'blindR') && !o.healed;
    if (blindEye) { c.fillStyle = '#e9eef1'; c.beginPath(); c.ellipse(x, y, 13, 15, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(150,170,190,0.55)'; c.beginPath(); c.arc(x + 2, y + 2, 7, 0, TAU); c.fill(); line(c, [[x - 15, y - 13], [x + 15, y - 9]], { lw: 5, seed: seed + 70 }); continue; }
    if (blink) { line(c, [[x - 12, y], [x + 12, y]], { lw: 6, seed: seed + 71 + sd }); continue; }
    if (eyes === 'dot') { c.fillStyle = INK; c.beginPath(); c.ellipse(x + lx * 4, y + ly * 3, 10.5, 13, 0, 0, TAU); c.fill(); }
    else if (eyes === 'wide') { circ(c, x, y - 4, 22, { fill: '#fff', lw: 5, seed: seed + 72 + sd }); c.fillStyle = INK; c.beginPath(); c.arc(x + lx * 8, y - 4 + ly * 6, 7, 0, TAU); c.fill(); }
    else if (eyes === 'half') { c.fillStyle = INK; c.beginPath(); c.ellipse(x + lx * 4, y + 2, 11, 9, 0, 0, Math.PI); c.fill(); line(c, [[x - 16, y], [x + 16, y - 1]], { lw: 6, seed: seed + 73 + sd }); }
    else if (eyes === 'closed') line(c, [[x - 13, y], [x, y + 6], [x + 13, y]], { lw: 6, seed: seed + 74 + sd });
    else if (eyes === 'happy') line(c, [[x - 13, y + 4], [x, y - 8], [x + 13, y + 4]], { lw: 6, seed: seed + 75 + sd });
    else if (eyes === 'squint') line(c, [[x - 13, y - 6 * sd * -1], [x + 10 * sd, y], [x - 13, y + 6]], { lw: 6, seed: seed + 75 + sd });
    else if (eyes === 'x') { line(c, [[x - 11, y - 11], [x + 11, y + 11]], { lw: 6, seed }); line(c, [[x + 11, y - 11], [x - 11, y + 11]], { lw: 6, seed: seed + 1 }); }
    else if (eyes === 'spiral') { c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); for (let a = 0; a < 12; a += 0.3) c.lineTo(x + Math.cos(a + t * 8) * a * 1.4, y + Math.sin(a + t * 8) * a * 1.4); c.stroke(); }
  }
  // brows
  if (brows) {
    for (const sd of [-1, 1]) {
      const x = sd * ex + exo, y = ey - 30;
      let a = [x - 16, y], b = [x + 16, y];
      if (brows === 'angry') { a = [x - sd * 18, y - 8]; b = [x + sd * 16, y + 6]; }
      else if (brows === 'sad') { a = [x - sd * 18, y + 6]; b = [x + sd * 16, y - 8]; }
      else if (brows === 'up') { a = [x - 15, y - 10]; b = [x + 15, y - 10]; }
      else if (brows === 'serious' || brows === 'flat') { a = [x - 16, y + 4]; b = [x + 16, y + 4]; }
      else if (brows === 'raise') { if (sd > 0) { a = [x - 15, y - 14]; b = [x + 15, y - 8]; } }
      else if (brows === 'uni') { a = [x - 20, y + 2]; b = [x + 20, y + 6]; }
      line(c, [a, b], { lw: brows === 'uni' ? 12 : 7, seed: seed + 80 + sd });
    }
  }
  // beard
  const bc = pr.beardColor || hc;
  if (pr.beard === 'big') shp(c, [[-96, 10], [-70, 120], [-30, 150], [0, 160], [30, 150], [70, 120], [96, 10], [60, 46], [0, 30], [-60, 46]], { fill: bc, lw: 8, seed: seed + 90 });
  if (pr.beard === 'square') { shp(c, [[-84, 26], [-76, 156], [76, 156], [84, 26], [50, 64], [26, 74], [-26, 74], [-50, 64]], { fill: bc, lw: 8, seed: seed + 90 }); c.strokeStyle = 'rgba(255,255,255,0.22)'; c.lineWidth = 3; for (let yy = 92; yy < 150; yy += 16) { c.beginPath(); c.moveTo(-62, yy); c.quadraticCurveTo(0, yy + 8, 62, yy); c.stroke(); } line(c, [[-30, 30], [-4, 26], [4, 26], [30, 30]], { lw: 9, stroke: bc, seed: seed + 91 }); }
  if (pr.beard === 'white') shp(c, [[-90, 16], [-60, 140], [0, 196], [60, 140], [90, 16], [50, 48], [0, 34], [-50, 48]], { fill: bc, lw: 7, seed: seed + 90 });
  if (pr.beard === 'stubble') { c.fillStyle = 'rgba(0,0,0,0.35)'; for (let i = 0; i < 26; i++) { const a = 0.35 + i / 26 * 2.4; c.fillRect(Math.cos(a) * 78 + rr(i, -6, 6), Math.sin(a) * 70 + 10, 3, 3); } }
  // mouth
  const my = 46 + ly * 4, mx = lx * 12;
  let mm = mouth;
  let open = 0;
  if (mm === 'talk' || (talking && mm !== 'sleep')) {
    open = clamp(envAt(t) * 1.5 - 0.15);
    open = open > 0.08 ? 0.3 + open * 0.7 : 0;
    mm = 'talkm';
  }
  const ml = { lw: 7, seed: seed + 95 };
  if (mm === 'line') line(c, [[mx - 20, my], [mx + 20, my]], ml);
  else if (mm === 'smile') line(c, [[mx - 26, my - 8], [mx - 10, my + 6], [mx + 10, my + 6], [mx + 26, my - 8]], ml);
  else if (mm === 'frown') line(c, [[mx - 22, my + 8], [mx - 8, my - 4], [mx + 8, my - 4], [mx + 22, my + 8]], ml);
  else if (mm === 'smirk') line(c, [[mx - 22, my + 4], [mx + 6, my + 4], [mx + 24, my - 8]], ml);
  else if (mm === 'wavy') line(c, [[mx - 26, my], [mx - 13, my - 6], [mx, my + 4], [mx + 13, my - 6], [mx + 26, my]], ml);
  else if (mm === 'squiggle') line(c, [[mx - 22, my + 2], [mx - 6, my - 6], [mx + 8, my + 6], [mx + 22, my - 2]], ml);
  else if (mm === 'o') ell(c, mx, my + 4, 14, 18, { fill: '#5a1f1f', lw: 6, seed: seed + 96 });
  else if (mm === 'smallo') ell(c, mx, my + 4, 8, 10, { fill: '#5a1f1f', lw: 5, seed: seed + 96 });
  else if (mm === 'grin' || mm === 'open' || mm === 'yell') {
    const w = mm === 'yell' ? 34 : 38, h = mm === 'yell' ? 44 : 30;
    shp(c, [[mx - w, my - 6], [mx + w, my - 6], ...ellPts(mx, my - 6, w, h, 16, 0, Math.PI).slice(1, -1)], { fill: '#5a1f1f', lw: 7, seed: seed + 97 });
    if (mm === 'grin') { c.fillStyle = '#fff'; c.fillRect(mx - w + 8, my - 4, (w - 8) * 2, 10); }
    if (mm === 'open' || mm === 'yell') { c.fillStyle = '#e66a6a'; c.beginPath(); c.ellipse(mx, my + h - 16, 16, 8, 0, 0, TAU); c.fill(); }
  } else if (mm === 'teeth') { rrect(c, mx - 30, my - 12, 60, 26, 8, { fill: '#fff', lw: 6, seed: seed + 98 }); line(c, [[mx - 28, my], [mx + 28, my]], { lw: 4, seed }); }
  else if (mm === 'blech') { line(c, [[mx - 24, my], [mx - 10, my - 6], [mx + 6, my + 2], [mx + 24, my - 4]], ml); shp(c, [[mx - 2, my], [mx + 14, my], [mx + 16, my + 22], [mx + 6, my + 30], [mx - 4, my + 22]], { fill: '#e66a6a', lw: 5, seed }); }
  else if (mm === 'sleep') { ell(c, mx, my + 4, 9, 6 + Math.sin(t * 2) * 3, { fill: '#5a1f1f', lw: 5, seed }); }
  else if (mm === 'talkm') {
    if (open <= 0) line(c, [[mx - 20, my], [mx + 20, my]], ml);
    else { const h = 6 + open * 30; shp(c, ellPts(mx, my + h * 0.3, 22 + open * 6, h, 18), { fill: '#5a1f1f', lw: 6, seed: seed + 99 }); if (h > 18) { c.fillStyle = '#e66a6a'; c.beginPath(); c.ellipse(mx, my + h * 0.3 + h * 0.55, 12, 5, 0, 0, TAU); c.fill(); } }
  }
  // accessories on head
  if (pr.acc && pr.acc.includes('glasses')) { for (const sd of [-1, 1]) circ(c, sd * ex + exo, ey, 24, { lw: 5, seed: seed + 100 + sd }); line(c, [[-10 + exo, ey], [10 + exo, ey]], { lw: 5, seed }); }
  if (o.bandage) { c.save(); c.beginPath(); c.arc(0, 0, R - 2, 0, TAU); c.clip(); c.fillStyle = '#f5f1e6'; c.fillRect(-R, -R + 6, 2 * R, 44); c.strokeStyle = '#d8cfbf'; c.lineWidth = 3; for (let i = -R; i < R; i += 18) { c.beginPath(); c.moveTo(i, -R + 6); c.lineTo(i + 10, -R + 50); c.stroke(); } c.restore(); line(c, [[-96, -36], [96, -36]], { lw: 5, seed }); }
  if (o.holes) {
    const healed = o.holes === 'healed' ? 1 : 0;
    ell(c, 0, -74, 78, 30, { fill: pr.skin, lw: 0, stroke: null, seed: seed + 5 });
    for (const hp of [[-34, -70, 15], [30, -76, 12]].slice(0, o.holeN || 2)) {
      circ(c, hp[0], hp[1], hp[2] + 6, { fill: healed ? '#eadbc4' : '#c97d6a', lw: 4, seed: seed + hp[0] });
      circ(c, hp[0], hp[1], hp[2] - (healed ? 6 : 0), { fill: '#3b1f1a', lw: 5, seed: seed + hp[1] });
    }
  }
  if (o.sweat) sweat(c, 96, -50, 1, t, seed);
  if (o.blush) { c.fillStyle = 'rgba(255,90,90,0.35)'; c.beginPath(); c.ellipse(-62, 28, 20, 10, 0, 0, TAU); c.ellipse(62, 28, 20, 10, 0, 0, TAU); c.fill(); }
  if (o.green) { c.save(); c.beginPath(); c.arc(0, 0, R - 4, 0, TAU); c.clip(); c.fillStyle = 'rgba(110,170,40,0.45)'; c.fillRect(-R, 0, 2 * R, R); c.restore(); }
  if (o.tears) { c.fillStyle = '#7fd0ff'; for (const sd of [-1, 1]) { const ph = (t * 1.2 + (sd > 0 ? 0.5 : 0)) % 1; c.beginPath(); c.ellipse(sd * ex + exo, ey + 20 + ph * 70, 6, 10, 0, 0, TAU); c.fill(); } }
}

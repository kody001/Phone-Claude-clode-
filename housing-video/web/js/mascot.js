'use strict';
// Channel mascot rig. Head and jacket are the original artwork (cut from the supplied
// image, unaltered). Arms and legs are re-drawn as strokes matching the original's
// width/colour so they can move. Expressions are painted as overlays on the face.
const IMG = {};
let RIG = null;
const MINK = '#0e111c';
const MOUTH_INK = '#3b2219';

// hand targets in source-image pixels (shoulders at 633,404 / 762,404)
const POSES = {
  rest: { L: [577, 642], R: [818, 642] },
  hips: { L: [612, 585], R: [784, 585], bL: 1, bR: 1 },
  shrug: { L: [540, 425], R: [855, 425] },
  up: { L: [548, 160], R: [846, 160] },
  upV: { L: [470, 230], R: [925, 230] },
  chin: { L: [577, 642], R: [708, 402] },
  facepalm: { L: [577, 642], R: [705, 290], bR: 1 },
  scratch: { L: [577, 642], R: [790, 205], bR: 1 },
  pointR: { L: [577, 642], R: [1060, 380] },
  pointUR: { L: [577, 642], R: [990, 170] },
  pointDR: { L: [577, 642], R: [1000, 600] },
  pointL: { L: [335, 380], R: [818, 642] },
  pointUL: { L: [405, 170], R: [818, 642] },
  pointDL: { L: [395, 600], R: [818, 642] },
  stickR: { L: [577, 642], R: [880, 470], stick: 'R', stickAng: -28 },
  stickUR: { L: [577, 642], R: [870, 420], stick: 'R', stickAng: -55 },
  stickDR: { L: [577, 642], R: [880, 520], stick: 'R', stickAng: 5 },
  stickL: { L: [515, 470], R: [818, 642], stick: 'L', stickAng: -152 },
  stickUL: { L: [525, 420], R: [818, 642], stick: 'L', stickAng: -125 },
  presentR: { L: [577, 642], R: [905, 500] },
  presentL: { L: [490, 500], R: [818, 642] },
  presentBoth: { L: [480, 500], R: [915, 500] },
  hold: { L: [655, 545], R: [740, 545], bL: 1, bR: 1 },
  holdR: { L: [577, 642], R: [880, 545] },
  wave: { L: [577, 642], R: [880, 250], wave: 'R' },
  count: { L: [577, 642], R: [860, 330] },
  stop: { L: [577, 642], R: [930, 330] },
  thumbs: { L: [577, 642], R: [870, 440] },
  cover: { L: [660, 300], R: [735, 300], bL: 1, bR: 1 },
  sad: { L: [600, 650], R: [795, 650] },
  fists: { L: [560, 470], R: [835, 470] },
};

const FACES = {
  neutral: {},
  smile: {},
  happy: { mouth: 'grin' },
  laugh: { mouth: 'grin', eyes: 'happy', brows: 'up' },
  surprise: { brows: 'up', mouth: 'o' },
  shock: { brows: 'up2', mouth: 'O', sweat: 1 },
  sad: { brows: 'sad', mouth: 'frown', tilt: -4 },
  worried: { brows: 'sad', mouth: 'wavy', sweat: 1 },
  confused: { brows: 'quizz', mouth: 'side', tilt: 6 },
  disgust: { brows: 'angry', mouth: 'grimace', tilt: -3 },
  determined: { brows: 'angry', mouth: 'flat' },
  smirk: { brows: 'quizz', mouth: 'smirk' },
  skeptic: { brows: 'quizz', mouth: 'flat', tilt: 4 },
  serious: { brows: 'down', mouth: 'flat' },
  talk: { mouth: 'talk' },
  ooh: { brows: 'up', mouth: 'O' },
};

function loadMascot(base) {
  return Promise.all(['head', 'torso'].map(n => new Promise((res, rej) => {
    const im = new Image(); im.onload = () => { IMG[n] = im; res(); }; im.onerror = rej; im.src = base + n + '.png';
  }))).then(() => fetch(base + 'rig.json')).then(r => r.json()).then(j => { RIG = j; });
}

function ik(S, T, L1, L2, outward) {
  const dx = T[0] - S[0], dy = T[1] - S[1];
  let d = Math.hypot(dx, dy);
  const base = Math.atan2(dy, dx);
  if (d >= L1 + L2 - 0.5) {
    const e = [S[0] + Math.cos(base) * L1, S[1] + Math.sin(base) * L1];
    return [e, [S[0] + Math.cos(base) * (L1 + L2), S[1] + Math.sin(base) * (L1 + L2)]];
  }
  d = Math.max(d, Math.abs(L1 - L2) + 1);
  const a = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  const c1 = [S[0] + Math.cos(base + a) * L1, S[1] + Math.sin(base + a) * L1];
  const c2 = [S[0] + Math.cos(base - a) * L1, S[1] + Math.sin(base - a) * L1];
  const e = outward(c1) > outward(c2) ? c1 : c2;
  return [e, T];
}

function lerpPose(a, b, k) {
  return {
    L: [lerp(a.L[0], b.L[0], k), lerp(a.L[1], b.L[1], k)], R: [lerp(a.R[0], b.R[0], k), lerp(a.R[1], b.R[1], k)],
    bL: k < 0.5 ? a.bL : b.bL, bR: k < 0.5 ? a.bR : b.bR,
    stick: k < 0.5 ? a.stick : b.stick, stickAng: b.stick && a.stick ? lerp(a.stickAng, b.stickAng, k) : (k < 0.5 ? a.stickAng : b.stickAng),
    wave: k < 0.5 ? a.wave : b.wave,
  };
}
// keyframes: string | [[t, value], ...]
function keyAt(keys, t, dflt) {
  if (keys == null) return [dflt, dflt, 1];
  if (!Array.isArray(keys)) return [keys, keys, 1];
  let prev = keys[0][1], cur = keys[0][1], k = 1;
  for (let i = 0; i < keys.length; i++) {
    if (t >= keys[i][0]) { prev = i > 0 ? keys[i - 1][1] : keys[i][1]; cur = keys[i][1]; k = P(t, keys[i][0], 0.28); }
  }
  return [prev, cur, k];
}
function resolvePose(p) { return typeof p === 'string' ? (POSES[p] || POSES.rest) : Object.assign({}, POSES.rest, p); }

function drawArm(ctx, S, T, side, bend, t, pose) {
  const L1 = 125, L2 = 122;
  const outward = side === 'L' ? (p => -p[0] + (bend ? 0 : p[1] * 1.1)) : (p => p[0] + (bend ? 0 : p[1] * 1.1));
  let target = T;
  if (pose.wave === side) target = [T[0] + Math.sin(t * 9) * 28, T[1] + Math.cos(t * 9) * 6];
  const [e, h] = ik(S, target, L1, L2, outward);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = MINK; ctx.lineWidth = 10.5;
  ctx.beginPath(); ctx.moveTo(S[0], S[1]);
  ctx.quadraticCurveTo(e[0], e[1], (e[0] + h[0]) / 2, (e[1] + h[1]) / 2);
  ctx.lineTo(h[0], h[1]); ctx.stroke();
  // forked mitten hand like the original: short thumb branch toward the inside
  const dx = h[0] - e[0], dy = h[1] - e[1], dl = Math.hypot(dx, dy) || 1;
  const ux = dx / dl, uy = dy / dl;
  const bx = h[0] - ux * 15, by = h[1] - uy * 15;
  const th = (side === 'L' ? -38 : 38) * D2R;
  const tx = ux * Math.cos(th) - uy * Math.sin(th), ty = ux * Math.sin(th) + uy * Math.cos(th);
  ctx.lineWidth = 10;
  ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + tx * 16, by + ty * 16); ctx.stroke();
  return { e, h, ux, uy };
}

function drawLegs(ctx, t, walk, jump) {
  const hips = [[664, 648], [732, 648]];
  const len = 108;
  const ph = t * 7.5;
  ctx.lineCap = 'round'; ctx.strokeStyle = MINK;
  hips.forEach((hp, i) => {
    const sgn = i === 0 ? -1 : 1;
    let ang = sgn * 4.5 * D2R; // slight outward splay like the original
    let lift = 0;
    if (walk) { const sw = Math.sin(ph + i * Math.PI); ang += sw * 17 * D2R; lift = Math.max(0, Math.cos(ph + i * Math.PI)) * 10; }
    if (jump) { ang += sgn * 10 * D2R; }
    const ax = hp[0] - Math.sin(ang) * len * -1 * 0 + Math.sin(ang) * len, ay = hp[1] + Math.cos(ang) * len - lift;
    ctx.lineWidth = 12.5;
    ctx.beginPath(); ctx.moveTo(hp[0], hp[1]); ctx.lineTo(ax, ay); ctx.stroke();
    ctx.lineWidth = 11;
    ctx.beginPath(); ctx.moveTo(ax, ay + 2); ctx.quadraticCurveTo(ax + sgn * 22, ay + 6, ax + sgn * 44, ay + 4); ctx.stroke();
  });
}

function skinPatch(ctx, cx, cy, rx, ry, col) {
  ctx.save();
  ctx.filter = 'blur(1.6px)';
  ctx.fillStyle = col || 'rgb(234,181,150)';
  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
function brow(ctx, a, b, arch) {
  ctx.save(); ctx.strokeStyle = 'rgb(101,64,38)'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - (arch || 4), b[0], b[1]); ctx.stroke();
  ctx.restore();
}
function drawFace(ctx, f, t, blinkSeed) {
  const F = FACES[f] || FACES.neutral;
  // brows
  if (F.brows) {
    skinPatch(ctx, 652, 255, 27, 9, 'rgb(235,182,149)');
    skinPatch(ctx, 737, 254, 27, 9, 'rgb(235,182,149)');
    const L = { o: [633, 257], i: [672, 252] }, R = { i: [716, 252], o: [757, 256] };
    let dLo = 0, dLi = 0, dRi = 0, dRo = 0, arch = 4;
    switch (F.brows) {
      case 'up': dLo = dLi = dRi = dRo = -9; arch = 6; break;
      case 'up2': dLo = dLi = dRi = dRo = -14; arch = 8; break;
      case 'sad': dLo = 4; dLi = -9; dRi = -9; dRo = 4; arch = 1; break;
      case 'angry': dLo = -5; dLi = 7; dRi = 7; dRo = -5; arch = 0; break;
      case 'quizz': dLo = -12; dLi = -10; dRi = 4; dRo = 3; arch = 6; break;
      case 'down': dLo = 2; dLi = 4; dRi = 4; dRo = 2; arch = 1; break;
    }
    brow(ctx, [L.o[0], L.o[1] + dLo], [L.i[0], L.i[1] + dLi], arch);
    brow(ctx, [R.i[0], R.i[1] + dRi], [R.o[0], R.o[1] + dRo], arch);
  }
  // eyes (blink or happy arcs)
  const bt = ((t + (blinkSeed || 0)) % 3.9);
  const blink = bt < 0.13;
  if (blink || F.eyes === 'happy') {
    for (const [cx, cy] of [[658, 276], [733, 275]]) {
      skinPatch(ctx, cx, cy, 24, 12, 'rgb(233,182,150)');
      ctx.save(); ctx.strokeStyle = MINK; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
      ctx.beginPath();
      if (F.eyes === 'happy') { ctx.moveTo(cx - 16, cy + 4); ctx.quadraticCurveTo(cx, cy - 12, cx + 16, cy + 4); }
      else { ctx.moveTo(cx - 17, cy - 1); ctx.quadraticCurveTo(cx, cy + 7, cx + 17, cy - 1); }
      ctx.stroke(); ctx.restore();
    }
  }
  // mouth
  if (F.mouth) {
    skinPatch(ctx, 697, 342, 55, 15, 'rgb(234,181,150)');
    ctx.save(); ctx.strokeStyle = MOUTH_INK; ctx.lineWidth = 3.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const dark = '#5a211d';
    ctx.beginPath();
    switch (F.mouth) {
      case 'grin':
        ctx.moveTo(660, 336); ctx.quadraticCurveTo(697, 344, 734, 334); ctx.quadraticCurveTo(724, 372, 697, 373); ctx.quadraticCurveTo(668, 372, 660, 336);
        ctx.fillStyle = dark; ctx.fill(); ctx.save(); ctx.clip();
        ctx.fillStyle = '#fff'; ctx.fillRect(650, 330, 100, 17); ctx.fillStyle = '#d9545a'; ctx.beginPath(); ctx.ellipse(697, 376, 22, 10, 0, 0, 7); ctx.fill(); ctx.restore();
        ctx.beginPath(); ctx.moveTo(660, 336); ctx.quadraticCurveTo(697, 344, 734, 334); ctx.quadraticCurveTo(724, 372, 697, 373); ctx.quadraticCurveTo(668, 372, 660, 336); ctx.stroke();
        break;
      case 'o': ctx.ellipse(697, 350, 11, 14, 0, 0, 7); ctx.fillStyle = dark; ctx.fill(); ctx.stroke(); break;
      case 'O': ctx.ellipse(697, 354, 15, 21, 0, 0, 7); ctx.fillStyle = dark; ctx.fill(); ctx.stroke(); break;
      case 'talk': ctx.ellipse(697, 348, 16, 8, 0, 0, 7); ctx.fillStyle = dark; ctx.fill(); ctx.stroke(); break;
      case 'frown': ctx.moveTo(668, 356); ctx.quadraticCurveTo(697, 334, 726, 356); ctx.stroke(); break;
      case 'flat': ctx.moveTo(672, 347); ctx.lineTo(722, 346); ctx.stroke(); break;
      case 'wavy': ctx.moveTo(668, 349); ctx.bezierCurveTo(680, 340, 690, 357, 697, 348); ctx.bezierCurveTo(705, 340, 714, 357, 726, 347); ctx.stroke(); break;
      case 'side': ctx.moveTo(676, 352); ctx.quadraticCurveTo(700, 350, 720, 340); ctx.stroke(); break;
      case 'smirk': ctx.moveTo(672, 349); ctx.quadraticCurveTo(706, 354, 728, 334); ctx.stroke(); break;
      case 'grimace':
        ctx.moveTo(668, 344); ctx.lineTo(728, 340); ctx.lineTo(724, 358); ctx.lineTo(672, 358); ctx.closePath();
        ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke();
        ctx.lineWidth = 2; ctx.beginPath();
        for (const x of [682, 697, 712]) { ctx.moveTo(x, 342); ctx.lineTo(x, 358); }
        ctx.moveTo(670, 350); ctx.lineTo(726, 349); ctx.stroke();
        break;
    }
    ctx.restore();
  }
  if (F.sweat) {
    ctx.save(); ctx.fillStyle = '#8fd3ff'; ctx.strokeStyle = '#2b6a9b'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(782, 222); ctx.quadraticCurveTo(794, 246, 782, 252); ctx.quadraticCurveTo(770, 246, 782, 222); ctx.fill(); ctx.stroke(); ctx.restore();
  }
}

function drawStick(ctx, h, ang) {
  const a = ang * D2R, len = 330;
  const x0 = h[0] - Math.cos(a) * 30, y0 = h[1] - Math.sin(a) * 30;
  const x1 = h[0] + Math.cos(a) * len, y1 = h[1] + Math.sin(a) * len;
  ctx.save(); ctx.lineCap = 'round';
  ctx.strokeStyle = '#5c3a1c'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.strokeStyle = '#a87443'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.restore();
}

// Mascot element. o: {x,y,s,t,enter, pose, face, tilt, walk, jump, hold:{R:fn,L:fn}, blink}
function mascot(o) {
  o = Object.assign({ s: 1, enter: 'none' }, o);
  const blinkSeed = (hstr(JSON.stringify([o.x, o.y, o.t])) % 1000) / 300;
  return el(o, (ctx, lt) => {
    const [pa, pb, pk] = keyAt(o.pose, lt, 'rest');
    const pose = lerpPose(resolvePose(pa), resolvePose(pb), E.io(pk));
    const [fa, fb, fk] = keyAt(o.face, lt, 'neutral');
    const face = fk > 0.35 ? fb : fa;
    const F = FACES[face] || {};
    const breathe = Math.sin(lt * 2.1) * 1.6;
    const tilt = (o.tilt || 0) + (F.tilt || 0) + Math.sin(lt * 1.25 + 1) * 1.1;
    const walk = typeof o.walk === 'function' ? o.walk(lt) : o.walk;
    const jumpY = o.jump ? -Math.abs(Math.sin(lt * 5.5)) * 60 : 0;
    ctx.translate(-697, -760 + jumpY);
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    drawLegs(ctx, lt, walk, o.jump);
    const bob = walk ? Math.abs(Math.sin(lt * 7.5)) * -5 : breathe;
    ctx.translate(0, bob);
    const tr = RIG.torso; ctx.drawImage(IMG.torso, tr[0], tr[1], tr[2], tr[3]);
    // head with tilt around the neck
    ctx.save();
    ctx.translate(697, 396); ctx.rotate(tilt * D2R); ctx.translate(-697, -396);
    const hd = RIG.head; ctx.drawImage(IMG.head, hd[0], hd[1], hd[2], hd[3]);
    drawFace(ctx, face, lt, blinkSeed);
    ctx.restore();
    // arms in front
    const SL = [633, 404], SR = [762, 404];
    const aL = drawArm(ctx, SL, pose.L, 'L', pose.bL, lt, pose);
    const aR = drawArm(ctx, SR, pose.R, 'R', pose.bR, lt, pose);
    if (pose.stick === 'R') drawStick(ctx, aR.h, pose.stickAng + Math.sin(lt * 3) * 2);
    if (pose.stick === 'L') drawStick(ctx, aL.h, pose.stickAng + Math.sin(lt * 3) * 2);
    if (o.hold) {
      for (const side of ['L', 'R']) if (o.hold[side]) { const a = side === 'L' ? aL : aR; ctx.save(); ctx.translate(a.h[0], a.h[1]); o.hold[side](ctx, lt); ctx.restore(); }
    }
  });
}

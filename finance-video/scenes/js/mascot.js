// The channel mascot, drawn from the creator's own image (cut out of its blue background by
// tools/cut_mascot.py). The head, face and suit are one untouched picture; the image's own stick
// arms and legs are separate pieces that swing at the shoulders and hips. Nothing is redrawn.
// Feelings are shown with body language and small symbols BESIDE the head, never on the face.
'use strict';

const MP = (() => {
  const o = MASCOT_IMG.origin, imgs = {};
  const loc = p => ({ x: p[0] - o[0], y: p[1] - o[1] });
  const pieces = {};
  for (const [k, p] of Object.entries(MASCOT_IMG.pieces)) {
    pieces[k] = Object.assign({}, p, { lx: p.x - o[0], ly: p.y - o[1] });
    if (p.joint) { pieces[k].J = loc(p.joint); pieces[k].T = loc(p.tip); }
  }
  const ready = Promise.all(Object.entries(MASCOT_IMG.pieces).map(([k, p]) => new Promise((res, rej) => {
    const im = new Image(); im.onload = () => res(); im.onerror = rej; im.src = 'data:image/png;base64,' + p.png; imgs[k] = im;
  })));
  return { pieces, imgs, ready, hip: { x: 0, y: -110 }, head: { x: 0, y: -505 }, headTop: -640 };
})();

// arm swing per pose, degrees outward from the image's resting arm (L = screen-left arm)
const ARM_POSE = {
  rest: [0, 0], hips: [18, 18], cross: [4, 4], shrug: [72, 72], up: [150, 150], headhands: [165, 165], tpose: [90, 90],
  present: [0, 82], presentL: [82, 0], explain: [35, 62], one: [0, 150], stop: [0, 100], fist: [0, 140], wave: [0, 150],
  think: [0, 165], scratch: [0, 170], facepalm: [0, 168], hold: [30, 30], holdR: [0, 35], holdL: [35, 0],
  holdUpR: [0, 135], holdUpL: [135, 0], rub: [10, 10], type: [25, 25], phone: [0, 160],
};

// facial-expression names from the shot list -> body language + emanata
const EMOTE = {
  happy: { bounce: 1, fx: 'sparkle' }, excited: { bounce: 1.4, fx: 'sparkle' }, laughing: { bounce: 1.6, fx: 'sparkle' }, proud: { bounce: 0.6, lean: -0.03, fx: 'sparkle' },
  shocked: { jump: 1, lean: -0.04, fx: '!' }, scared: { shake: 1, fx: 'sweat' }, worried: { shake: 0.5, fx: 'sweat' }, cringe: { lean: 0.03, fx: 'sweat' },
  sad: { lean: 0.05, slump: 1, fx: 'cloud' }, crying: { lean: 0.06, slump: 1, fx: 'cloud' }, tired: { lean: 0.04, slump: 1 },
  angry: { shake: 1, fx: 'anger' }, annoyed: { fx: 'anger' }, serious: {}, calm: {}, neutral: {},
  thinking: { lean: 0.03, fx: '?' }, confused: { lean: -0.03, fx: '?' }, skeptical: { lean: 0.025 }, smug: { lean: -0.035 },
  bored: { fx: 'z' }, sleepy: { fx: 'z' }, greedy: { bounce: 0.6, fx: '$' },
};

function mascotArmRot(side, entry, st, e, g) {
  const P = MP.pieces['arm' + side];
  const name = entry.name;
  if (name === 'point' || name === 'pointer') {
    const to = entry.to || e.point || [st.x + (side === 'R' ? 400 : -400), st.y - 400];
    const L = toLocal(st, to[0], to[1]);
    const useSide = e.pointSide || (L.x >= 0 ? 'R' : 'L');
    if (useSide !== side) return { rot: 0, pointer: false };
    const v0 = Math.atan2(P.T.y - P.J.y, P.T.x - P.J.x);
    let r = Math.atan2(L.y - P.J.y, L.x - P.J.x) - v0;
    while (r > Math.PI) r -= 2 * Math.PI; while (r < -Math.PI) r += 2 * Math.PI;
    return { rot: r, pointer: name === 'pointer' };
  }
  const a = (ARM_POSE[name] || ARM_POSE.rest)[side === 'L' ? 0 : 1];
  return { rot: (side === 'L' ? 1 : -1) * a * Math.PI / 180, pointer: false };
}

function drawPiece(ctx, k, rot) {
  const p = MP.pieces[k];
  if (rot) { ctx.save(); ctx.translate(p.J.x, p.J.y); ctx.rotate(rot); ctx.translate(-p.J.x, -p.J.y); }
  ctx.drawImage(MP.imgs[k], p.lx, p.ly, p.w, p.h);
  if (rot) ctx.restore();
}

function drawEmanata(ctx, fx, t, since) {
  const k = U.clamp((t - since) / 0.25), pop = U.easeOutBack(k, 2);
  if (k <= 0) return;
  const pen = new Pen(ctx, 9, 1.0);
  ctx.save();
  if (fx === '!' || fx === '?') {
    ctx.translate(150, -640); ctx.scale(pop, pop); ctx.rotate(Math.sin(t * 6) * 0.06);
    pen.text(fx, 0, 0, { font: '700 150px Kalam', fill: fx === '!' ? COL.red : COL.ink, stroke: '#fff', lw: 10 });
  } else if (fx === 'sweat') {
    const y = -590 + ((t - since) * 60) % 60;
    ctx.translate(142, y); ctx.scale(pop, pop);
    pen.shape([[0, -28], [16, 4], [0, 18], [-16, 4]], { fill: '#8fd0ff', lw: 4 });
  } else if (fx === 'anger') {
    const s = pop * (1 + Math.sin(t * 9) * 0.08);
    ctx.translate(150, -610); ctx.scale(s, s);
    for (const [a, b, c, d] of [[-24, -6, -6, -22], [24, -6, 6, -22], [-24, 10, -6, 26], [24, 10, 6, 26]]) pen.seg(a, b, c, d, { stroke: COL.red, lw: 8 });
  } else if (fx === 'cloud') {
    ctx.translate(0, -735 + Math.sin(t * 2) * 6); ctx.scale(pop, pop);
    pen.shape([[-80, 20], [-95, -5], [-70, -35], [-30, -40], [-10, -62], [30, -60], [50, -38], [85, -30], [98, 0], [80, 22]], { fill: '#9aa3ad', lw: 5 });
    ctx.fillStyle = '#6fb6ff';
    for (let i = 0; i < 4; i++) { const yy = 34 + ((t * 120 + i * 30) % 80); ctx.beginPath(); ctx.ellipse(-50 + i * 33, yy, 5, 9, 0, 0, 7); ctx.fill(); }
  } else if (fx === 'z') {
    for (let i = 0; i < 3; i++) { const q = ((t - since) * 0.6 + i / 3) % 1; ctx.save(); ctx.globalAlpha *= 1 - q; ctx.translate(130 + q * 60, -600 - q * 120); pen.text('z', 0, 0, { font: `700 ${50 + i * 14}px Kalam`, fill: COL.ink }); ctx.restore(); }
  } else if (fx === '$') {
    for (let i = 0; i < 3; i++) { const q = ((t - since) * 0.5 + i / 3) % 1; ctx.save(); ctx.globalAlpha *= 1 - q; ctx.translate(-150 + i * 150, -640 - q * 100); pen.text('$', 0, 0, { font: '700 70px Kalam', fill: COL.green, stroke: '#fff', lw: 6 }); ctx.restore(); }
  } else if (fx === 'sparkle') {
    for (const [x, y, s, ph] of [[-165, -600, 1, 0], [165, -640, 1.2, 1.3], [140, -470, 0.8, 2.2]]) {
      const tw = 0.6 + 0.4 * Math.abs(Math.sin(t * 4 + ph));
      ctx.save(); ctx.translate(x, y); ctx.scale(pop * s * tw, pop * s * tw);
      for (const [a, b, c, d] of [[0, -26, 0, 26], [-26, 0, 26, 0]]) pen.seg(a, b, c, d, { stroke: COL.gold, lw: 7 });
      ctx.restore();
    }
  }
  ctx.restore();
}

// draws the mascot for a resolved character element; returns hand tips (rig-local) for held props
function drawMascotPuppet(ctx, e, t, fx, st, poseSeq, faceCur, talk, walking) {
  const em = EMOTE[faceCur.name] || {};
  const since = faceCur.t < -1e8 ? e.t0 : faceCur.t;
  const dt = t - since;
  // body language
  let bob = Math.sin(t * 2.1) * 2.2 - talk * 5 * (0.6 + 0.4 * Math.sin(t * 11));
  let lean = (em.lean || 0) + (e.lean || 0) + (talk ? Math.sin(t * 2.7) * 0.012 : Math.sin(t * 0.9) * 0.006);
  let squash = em.slump ? 0.985 : 1;
  if (em.bounce) bob -= Math.abs(Math.sin(t * 6)) * 9 * em.bounce;
  if (em.jump) bob -= Math.max(0, Math.sin(Math.min(1, dt / 0.35) * Math.PI)) * 40;
  let sx = 0;
  if (em.shake) sx = Math.sin(t * 40) * 2.5 * em.shake;
  if (walking) bob -= Math.abs(Math.sin(t * 9)) * 9;
  // arms
  const arms = {};
  for (const side of ['L', 'R']) {
    const a = mascotArmRot(side, poseSeq.prev, st, e), b = mascotArmRot(side, poseSeq.cur, st, e);
    const k = U.easeOutCubic(poseSeq.k);
    let rot = U.lerp(a.rot, b.rot, k);
    const n = poseSeq.cur.name;
    if (n === 'wave' && side === 'R') rot += Math.sin(t * 11) * 0.3;
    if ((n === 'explain' || n === 'present' || n === 'presentL' || n === 'shrug') && talk) rot += (side === 'L' ? 1 : -1) * Math.sin(t * 5 + (side === 'L' ? 1 : 0)) * 0.12 * talk;
    if (walking && n === 'rest') rot += Math.sin(t * 9 + (side === 'L' ? 0 : Math.PI)) * 0.25;
    arms[side] = { rot, pointer: k > 0.5 ? b.pointer : a.pointer };
  }
  ctx.save();
  ctx.translate(st.x + sx * st.s, st.y);
  if (st.rot) ctx.rotate(st.rot);
  ctx.scale(st.s * (st.flip ? -1 : 1), st.s);
  ctx.globalAlpha *= st.alpha == null ? 1 : st.alpha;
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  // legs (stepping when walking)
  const step = walking ? Math.sin(t * 9) * 0.32 : 0;
  drawPiece(ctx, 'legL', step);
  drawPiece(ctx, 'legR', -step);
  // upper body: lean about the hips, bob, slump
  ctx.translate(MP.hip.x, MP.hip.y + bob); ctx.rotate(lean); ctx.scale(1, squash); ctx.translate(-MP.hip.x, -MP.hip.y);
  const tips = {};
  for (const side of ['L', 'R']) {
    const P = MP.pieces['arm' + side], r = arms[side].rot;
    drawPiece(ctx, 'arm' + side, r);
    const dx = P.T.x - P.J.x, dy = P.T.y - P.J.y, c = Math.cos(r), s = Math.sin(r);
    const tip = { x: P.J.x + dx * c - dy * s, y: P.J.y + dx * s + dy * c };
    if (arms[side].pointer) {
      const ang = Math.atan2(tip.y - P.J.y, tip.x - P.J.x);
      new Pen(ctx, 77, 0.4).seg(tip.x - Math.cos(ang) * 10, tip.y - Math.sin(ang) * 10, tip.x + Math.cos(ang) * 200, tip.y + Math.sin(ang) * 200, { lw: 5, stroke: '#3a2a20' });
    }
    // tip in rig-local space (undo the upper-body transform for the hold code)
    const lx = tip.x - MP.hip.x, ly = (tip.y - MP.hip.y) * squash, cl = Math.cos(lean), sl = Math.sin(lean);
    tips[side] = { H: { x: MP.hip.x + lx * cl - ly * sl, y: MP.hip.y + bob + lx * sl + ly * cl }, E: { x: P.J.x, y: P.J.y } };
  }
  drawPiece(ctx, 'core', 0);
  if (em.fx) drawEmanata(ctx, em.fx, t, since);
  ctx.restore();
  return tips;
}

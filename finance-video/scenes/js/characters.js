// Characters: the Elon channel mascot (cartoon head + black suit + stick limbs) and
// generated hand-drawn stickmen. Both share the same pose and expression system.
'use strict';

// ---------- expressions ----------
const EXPR = {
  neutral: { brows: 'n', eyes: 'open', mouth: 'smile' },
  calm: { brows: 'n', eyes: 'open', mouth: 'flat' },
  happy: { brows: 'up', eyes: 'happy', mouth: 'grin' },
  excited: { brows: 'up', eyes: 'wide', mouth: 'grin' },
  smug: { brows: 'one', eyes: 'half', mouth: 'smirk' },
  sad: { brows: 'sad', eyes: 'open', mouth: 'frown', look: [0, 0.6] },
  worried: { brows: 'sad', eyes: 'open', mouth: 'wavy', sweat: true },
  shocked: { brows: 'up', eyes: 'wide', mouth: 'o' },
  angry: { brows: 'angry', eyes: 'squint', mouth: 'teeth', vein: true },
  annoyed: { brows: 'angry', eyes: 'half', mouth: 'flat' },
  thinking: { brows: 'one', eyes: 'open', mouth: 'side', look: [0.7, -0.7] },
  skeptical: { brows: 'one', eyes: 'half', mouth: 'flat' },
  bored: { brows: 'n', eyes: 'half', mouth: 'flat' },
  confused: { brows: 'one', eyes: 'open', mouth: 'wavy', look: [-0.5, -0.3] },
  laughing: { brows: 'up', eyes: 'closed', mouth: 'open' },
  cringe: { brows: 'sad', eyes: 'squint', mouth: 'teeth' },
  scared: { brows: 'sad', eyes: 'wide', mouth: 'teeth', sweat: true },
  crying: { brows: 'sad', eyes: 'closed', mouth: 'frown', tears: true },
  greedy: { brows: 'angry', eyes: 'dollar', mouth: 'grin' },
  sleepy: { brows: 'n', eyes: 'closed', mouth: 'flat' },
  proud: { brows: 'up', eyes: 'closed', mouth: 'smile' },
  tired: { brows: 'sad', eyes: 'half', mouth: 'flat', bags: true },
  serious: { brows: 'angry', eyes: 'open', mouth: 'flat' },
};

// ---------- poses ----------
// Each side returns a hand target in the rig's local space: {x, y, bend, finger, open}
function _off(g, side, ox, oy, bend = 1, extra = {}) {
  const sh = g.sh[side], o = side === 'L' ? -1 : 1;
  return Object.assign({ x: sh.x + o * ox * g.arm, y: sh.y + oy * g.arm, bend }, extra);
}
const POSES = {
  rest: (g, s) => _off(g, s, 0.12, 0.96),
  hips: (g, s) => _off(g, s, 0.30, 0.62, 1),
  shrug: (g, s) => _off(g, s, 0.62, -0.18, 1, { open: true }),
  up: (g, s) => _off(g, s, 0.38, -0.88, 1, { open: true }),
  present: (g, s) => (s === 'R' ? _off(g, s, 0.82, 0.22, 1, { open: true }) : _off(g, s, 0.12, 0.96)),
  presentL: (g, s) => (s === 'L' ? _off(g, s, 0.82, 0.22, 1, { open: true }) : _off(g, s, 0.12, 0.96)),
  hold: (g, s) => _off(g, s, -0.28, 0.56, 1),
  holdR: (g, s) => (s === 'R' ? _off(g, s, 0.30, 0.42, 1) : _off(g, s, 0.12, 0.96)),
  holdL: (g, s) => (s === 'L' ? _off(g, s, 0.30, 0.42, 1) : _off(g, s, 0.12, 0.96)),
  holdUpR: (g, s) => (s === 'R' ? _off(g, s, 0.34, -0.62, 1) : _off(g, s, 0.12, 0.96)),
  holdUpL: (g, s) => (s === 'L' ? _off(g, s, 0.34, -0.62, 1) : _off(g, s, 0.12, 0.96)),
  think: (g, s) => (s === 'R' ? { x: g.chin.x + 18, y: g.chin.y + 14, bend: 1, finger: true } : _off(g, s, -0.22, 0.6, 1)),
  scratch: (g, s) => (s === 'R' ? { x: g.headSide.x + 8, y: g.headSide.y - 10, bend: 1 } : _off(g, s, 0.12, 0.96)),
  facepalm: (g, s) => (s === 'R' ? { x: g.face.x + 10, y: g.face.y - 4, bend: 1, open: true } : _off(g, s, 0.12, 0.96)),
  headhands: (g, s) => { const o = s === 'L' ? -1 : 1; return { x: g.face.x + o * g.headR * 0.95, y: g.face.y - g.headR * 0.2, bend: 1, open: true }; },
  wave: (g, s) => (s === 'R' ? _off(g, s, 0.45, -0.78, 1, { open: true, wave: true }) : _off(g, s, 0.12, 0.96)),
  fist: (g, s) => (s === 'R' ? _off(g, s, 0.38, -0.55, 1) : _off(g, s, 0.12, 0.96)),
  one: (g, s) => (s === 'R' ? _off(g, s, 0.42, -0.70, 1, { finger: true }) : _off(g, s, 0.12, 0.96)),
  stop: (g, s) => (s === 'R' ? _off(g, s, 0.70, -0.30, 1, { open: true }) : _off(g, s, 0.12, 0.96)),
  cross: (g, s) => _off(g, s, -0.55, 0.40, 1),
  rub: (g, s) => _off(g, s, -0.20, 0.42, 1),
  explain: (g, s) => (s === 'R' ? _off(g, s, 0.55, 0.05, 1, { open: true }) : _off(g, s, 0.40, 0.25, 1, { open: true })),
  tpose: (g, s) => _off(g, s, 0.98, 0.02, 1),
  phone: (g, s) => (s === 'R' ? { x: g.face.x + g.headR * 0.95, y: g.face.y + 6, bend: 1 } : _off(g, s, 0.12, 0.96)),
  type: (g, s) => _off(g, s, -0.10, 0.62, 1),
  // 'point' is resolved in posedHand() because it needs a target
};

function ik(S, T, a, b, bendScore) {
  let dx = T.x - S.x, dy = T.y - S.y, d = Math.hypot(dx, dy);
  const maxd = (a + b) * 0.999, mind = Math.abs(a - b) + 1;
  if (d > maxd) { dx *= maxd / d; dy *= maxd / d; d = maxd; }
  if (d < mind) { const k = mind / (d || 1); dx *= k; dy *= k; d = mind; }
  const base = Math.atan2(dy, dx);
  const cosA = U.clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1);
  const A = Math.acos(cosA);
  const e1 = { x: S.x + Math.cos(base + A) * a, y: S.y + Math.sin(base + A) * a };
  const e2 = { x: S.x + Math.cos(base - A) * a, y: S.y + Math.sin(base - A) * a };
  const pick = bendScore(e1) >= bendScore(e2) ? e1 : e2;
  return { E: pick, H: { x: S.x + dx, y: S.y + dy } };
}

// resolve the hand target of one arm for a pose name / object
function posedHand(g, side, pose, pointLocal) {
  if (pose === 'point' || pose === 'pointer' || (pose && pose.point)) {
    const sh = g.sh[side];
    const tgt = pointLocal || { x: sh.x + (side === 'L' ? -1 : 1) * 200, y: sh.y };
    const ang = Math.atan2(tgt.y - sh.y, tgt.x - sh.x);
    const reach = g.arm * 0.94;
    return { x: sh.x + Math.cos(ang) * reach, y: sh.y + Math.sin(ang) * reach, bend: 1, finger: pose !== 'pointer', pointer: pose === 'pointer', ang };
  }
  const f = POSES[pose] || POSES.rest;
  return f(g, side);
}

function lerpHand(a, b, k) {
  return Object.assign({}, k < 0.5 ? a : b, { x: U.lerp(a.x, b.x, k), y: U.lerp(a.y, b.y, k) });
}

// ---------- shared face feature drawing (stickmen) ----------
function drawEyesSimple(ctx, pen, f, ex, ey, er, look, blink) {
  const kind = blink ? 'closed' : f.eyes;
  for (const sx of [-1, 1]) {
    const x = ex * sx + look[0] * er * 0.5, y = ey + look[1] * er * 0.4;
    if (kind === 'closed' || kind === 'happy') {
      const up = kind === 'happy' ? -1 : 1;
      pen.line([[x - er * 1.2, y], [x, y + up * er * 0.9 * (kind === 'happy' ? 1 : 0.15)], [x + er * 1.2, y]], { lw: 4 });
    } else if (kind === 'half') {
      pen.seg(x - er * 1.3, y - 1, x + er * 1.3, y - 1, { lw: 4 });
      ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.arc(x, y + er * 0.35, er * 0.65, 0, Math.PI); ctx.fill();
    } else if (kind === 'squint') {
      pen.seg(x - er * 1.2, y, x + er * 1.2, y + (sx < 0 ? 2 : -2), { lw: 4 });
    } else if (kind === 'wide') {
      ctx.fillStyle = '#fff'; pen.circle(x, y, er * 1.9, { fill: '#fff', lw: 3.5 });
      ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.arc(x + look[0] * er * 0.5, y + look[1] * er * 0.5, er * 0.75, 0, 7); ctx.fill();
    } else if (kind === 'dollar') {
      pen.text('$', x, y, { font: `700 ${er * 4.2}px Kalam`, fill: COL.greenDark });
    } else {
      ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.ellipse(x, y, er * 0.85, er * 1.05, 0, 0, 7); ctx.fill();
    }
  }
}

function drawBrows(pen, f, bx, by, bw, lw, color) {
  const b = f.brows;
  for (const sx of [-1, 1]) {
    let inner = 0, outer = 0, lift = 0;
    if (b === 'up') lift = -9;
    if (b === 'angry') { inner = 9; outer = -5; }
    if (b === 'sad') { inner = -9; outer = 4; }
    if (b === 'one' && sx > 0) lift = -11;
    if (b === 'one' && sx < 0) { inner = 2; }
    const xi = bx * sx - sx * bw * 0.5, xo = bx * sx + sx * bw * 0.5;
    pen.line([[xi, by + inner + lift], [(xi + xo) / 2, by - 3 + lift + (inner + outer) / 2], [xo, by + outer + lift]], { lw, stroke: color });
  }
}

function drawMouth(ctx, pen, f, mx, my, mw, talk, opts = {}) {
  const lw = opts.lw || 4, dark = opts.inside || '#5a1f1f';
  let m = f.mouth;
  const soft = { smile: 'talk', flat: 'talk', side: 'talk', smirk: 'talk', grin: 'talk', frown: 'talkSad', wavy: 'talkSad' };
  if (talk > 0.22 && soft[m]) m = soft[m];
  if (m === 'smile') pen.line(INK.quad([mx - mw, my - 4], [mx, my + mw * 0.45], [mx + mw, my - 5]), { lw });
  else if (m === 'flat') pen.seg(mx - mw * 0.7, my, mx + mw * 0.7, my + 1, { lw });
  else if (m === 'side') pen.line(INK.quad([mx - mw * 0.4, my + 2], [mx + mw * 0.2, my + 4], [mx + mw * 0.8, my - 4]), { lw });
  else if (m === 'frown') pen.line(INK.quad([mx - mw * 0.8, my + 6], [mx, my - mw * 0.35], [mx + mw * 0.8, my + 6]), { lw });
  else if (m === 'smirk') pen.line(INK.quad([mx - mw * 0.6, my + 2], [mx + mw * 0.2, my + 6], [mx + mw * 0.8, my - 8]), { lw });
  else if (m === 'wavy') pen.line([[mx - mw * 0.8, my + 2], [mx - mw * 0.4, my - 4], [mx, my + 3], [mx + mw * 0.4, my - 4], [mx + mw * 0.8, my + 2]], { lw, smooth: true });
  else if (m === 'o') pen.ellipse(mx, my + 4, mw * 0.32, mw * 0.42, { fill: dark, lw });
  else if (m === 'grin' || m === 'open') {
    const h = m === 'open' ? mw * 0.75 : mw * 0.55;
    const pts = INK.quad([mx - mw, my - 6], [mx, my + h * 1.9], [mx + mw, my - 6]).concat([[mx, my - 8]]);
    pen.shape(pts, { fill: dark, lw });
    ctx.save(); ctx.beginPath(); const p = INK.path(pts, true, true); ctx.clip(p);
    ctx.fillStyle = '#fff'; ctx.fillRect(mx - mw, my - 10, mw * 2, h * 0.32 + 4); ctx.restore();
  } else if (m === 'teeth') {
    const pts = INK.rectPts(mx - mw * 0.8, my - mw * 0.22, mw * 1.6, mw * 0.5, mw * 0.18);
    pen.shape(pts, { fill: '#fff', lw });
    pen.seg(mx - mw * 0.75, my + mw * 0.03, mx + mw * 0.75, my + mw * 0.03, { lw: 2.5 });
    for (let i = -2; i <= 2; i++) pen.seg(mx + i * mw * 0.27, my - mw * 0.2, mx + i * mw * 0.27, my + mw * 0.26, { lw: 2 });
  } else if (m === 'talk' || m === 'talkSad') {
    const o = U.clamp((talk - 0.18) * 1.5, 0.12, 0.85);
    const sad = m === 'talkSad' ? -1 : 1;
    const top = INK.quad([mx - mw * 0.62, my - 2 * sad], [mx, my + 4 * sad], [mx + mw * 0.62, my - 2 * sad], 8);
    const bot = INK.quad([mx + mw * 0.62, my - 2 * sad], [mx, my + mw * (0.25 + o * 0.75)], [mx - mw * 0.62, my - 2 * sad], 8);
    const pts = top.concat(bot.slice(1));
    pen.shape(pts, { fill: dark, lw, amp: 0.3 });
    ctx.save(); ctx.clip(INK.path(pts, true, true));
    ctx.fillStyle = '#fff'; ctx.fillRect(mx - mw, my - 10, mw * 2, 8 + o * 3);
    ctx.fillStyle = '#d9707a'; ctx.beginPath(); ctx.ellipse(mx, my + mw * (0.25 + o * 0.75), mw * 0.36, mw * 0.2 * (0.4 + o), 0, 0, 7); ctx.fill();
    ctx.restore();
  }
}

function drawExtras(ctx, pen, f, hx, hy, r, t) {
  if (f.sweat) {
    const x = hx + r * 0.82, y = hy - r * 0.35 + ((t * 40) % 18);
    pen.shape([[x, y - 16], [x + 9, y + 2], [x, y + 10], [x - 9, y + 2]], { fill: '#8fd0ff', lw: 3, smooth: true });
  }
  if (f.vein) {
    const x = hx + r * 0.55, y = hy - r * 0.62;
    for (const [a, b, c, d] of [[-10, -2, -3, -9], [10, -2, 3, -9], [-10, 6, -3, 13], [10, 6, 3, 13]]) pen.seg(x + a, y + b, x + c, y + d, { stroke: COL.red, lw: 4 });
  }
  if (f.tears) {
    for (const sx of [-1, 1]) {
      const k = (t * 1.6 + (sx > 0 ? 0.5 : 0)) % 1;
      ctx.fillStyle = 'rgba(110,190,255,0.9)'; ctx.beginPath(); ctx.ellipse(hx + sx * r * 0.42, hy + r * 0.05 + k * r * 0.7, 5, 8, 0, 0, 7); ctx.fill();
    }
  }
}

// ---------- the Elon mascot ----------
const MASCOT = {
  skin: '#ecc3a6', skinShade: '#d9a98d', cheek: 'rgba(255,236,226,0.45)', line: '#241a16',
  hair: '#6e4a33', hairDark: '#45291b', brow: '#6b4630', suit: '#232427', suitLine: '#4d4f55',
  geo() {
    // rig-local units: feet at (0,0), y up is negative
    const head = { x: 0, y: -504 };
    return {
      arm: 228, a: 118, b: 112, headR: 100,
      sh: { L: { x: -88, y: -346 }, R: { x: 88, y: -346 } },
      head, face: { x: head.x, y: head.y + 20 }, chin: { x: head.x + 10, y: head.y + 128 },
      headSide: { x: head.x + 92, y: head.y - 40 }, hip: { x: 0, y: -128 },
    };
  },
};

function drawHand(ctx, pen, H, E, opt, lw, fill) {
  const ang = Math.atan2(H.y - E.y, H.x - E.x);
  ctx.save(); ctx.translate(H.x, H.y); ctx.rotate(ang);
  const w = lw * 0.55;
  if (opt.finger || opt.pointer) {
    pen.shape([[-6, -10], [8, -11], [14, -6], [30, -6], [32, -1], [14, 1], [12, 9], [-4, 11], [-10, 2]], { fill, lw: w, amp: 0.3 });
  } else if (opt.open) {
    pen.shape([[-6, -12], [6, -14], [16, -16], [20, -11], [14, -6], [24, -4], [24, 2], [14, 3], [22, 9], [18, 14], [8, 12], [-4, 12], [-11, 2]], { fill, lw: w, amp: 0.3 });
  } else {
    pen.shape([[-7, -11], [9, -12], [16, -4], [14, 8], [2, 13], [-9, 8], [-11, -2]], { fill, lw: w, amp: 0.3 });
  }
  ctx.restore();
}

function drawArm(ctx, pen, g, side, hand, lw, halo, handFill, a, b) {
  const S = g.sh[side], o = side === 'L' ? -1 : 1;
  const bend = hand.bend || 1;
  const score = e => bend * (o * (e.x - S.x) + 0.45 * (e.y - S.y));
  const { E, H } = ik(S, hand, a, b, score);
  const pts = [[S.x, S.y], [E.x, E.y], [H.x, H.y]];
  if (halo) pen.line(pts, { lw: lw + 7, stroke: '#ffffff', amp: 0.6 });
  pen.line(pts, { lw, amp: 0.8 });
  if (hand.pointer) {
    const ang = Math.atan2(H.y - E.y, H.x - E.x);
    pen.seg(H.x - Math.cos(ang) * 14, H.y - Math.sin(ang) * 14, H.x + Math.cos(ang) * 190, H.y + Math.sin(ang) * 190, { lw: 4, stroke: '#3a2a20', amp: 0.4 });
  }
  if (handFill !== null) drawHand(ctx, pen, H, E, hand, lw, handFill);
  return { E, H };
}

function drawLegs(pen, g, st, lw, hipW, legLen, spread = 4) {
  const walk = st.walk || 0, ph = st.walkPhase || 0;
  for (const sx of [-1, 1]) {
    const sw = walk ? Math.sin(ph + (sx < 0 ? 0 : Math.PI)) * 0.42 : 0;
    const hip = { x: sx * hipW, y: -legLen };
    let knee, foot;
    if (st.sit) {
      knee = { x: sx * hipW + 95, y: -legLen + 8 };
      foot = { x: sx * hipW + 100, y: -4 };
    } else {
      foot = { x: hip.x + Math.sin(sw) * legLen + sx * spread, y: -Math.max(0, Math.sin(ph + (sx < 0 ? 0 : Math.PI))) * (walk ? 18 : 0) };
      knee = { x: (hip.x + foot.x) / 2 + (walk ? Math.abs(sw) * 14 : 0), y: (hip.y + foot.y) / 2 };
    }
    pen.line([[hip.x, hip.y], [knee.x, knee.y], [foot.x, foot.y]], { lw, amp: 0.8 });
    const dir = st.sit ? 1 : sx;
    pen.seg(foot.x, foot.y, foot.x + dir * 26, foot.y + 2, { lw, amp: 0.4 });
  }
}

function drawMascotHead(ctx, pen, f, st, t) {
  const M = MASCOT, lw = 4.5, look = st.look || [0, 0];
  const fx = look[0] * 7, fy = look[1] * 3; // features shift for a tiny head-turn
  // ears
  for (const sx of [-1, 1]) {
    pen.ellipse(sx * 99 + fx * 0.2, 34, 15, 27, { fill: M.skin, stroke: M.line, lw: 4 });
    pen.line(INK.quad([sx * 96, 22], [sx * 106, 34], [sx * 98, 48]), { lw: 2.5, stroke: '#a7735c' });
  }
  // face
  const face = [[-86, -72], [-90, -20], [-90, 30], [-85, 70], [-70, 105], [-45, 124], [0, 131], [45, 124], [70, 105], [86, 70], [91, 30], [91, -20], [86, -72], [60, -96], [0, -103], [-60, -96]];
  pen.shape(face, { fill: M.skin, stroke: M.line, lw: lw + 0.5, amp: 0.7 });
  ctx.fillStyle = M.cheek;
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sx * 60 + fx, 50, 14, 20, sx * 0.2, 0, 7); ctx.fill(); }
  // hair
  const hair = [[-99, 14], [-107, -30], [-106, -80], [-92, -118], [-56, -142], [-6, -150], [44, -146], [86, -126], [106, -88], [109, -34], [101, 12], [91, -10], [88, -44], [70, -62], [40, -71], [5, -69], [-30, -64], [-60, -56], [-80, -38], [-89, -10]];
  pen.shape(hair, { fill: M.hair, stroke: M.line, lw, amp: 0.9 });
  for (const s of [[[-84, -92], [-60, -112], [-22, -104]], [[-40, -118], [0, -122], [44, -98]], [[10, -128], [56, -118], [86, -86]], [[-92, -48], [-80, -80], [-48, -92]], [[60, -78], [84, -66], [96, -36]], [[-20, -88], [20, -94], [62, -78]]]) {
    pen.line(INK.quad(s[0], s[1], s[2]), { lw: 3, stroke: M.hairDark, amp: 0.6 });
  }
  // brows
  ctx.save(); ctx.translate(fx, fy);
  drawBrows(pen, f, 37, -8, 46, 7, M.brow);
  // eyes
  const blink = st.blink;
  const kind = blink ? 'closed' : f.eyes;
  for (const sx of [-1, 1]) {
    const ex = sx * 35, ey = 14;
    if (kind === 'closed' || kind === 'happy') {
      const up = kind === 'happy' ? -1 : 1;
      pen.line(INK.quad([ex - 17, ey], [ex, ey + up * (kind === 'happy' ? 10 : 2)], [ex + 17, ey]), { lw: 4, stroke: M.line });
    } else if (kind === 'squint') {
      pen.line(INK.quad([ex - 17, ey + 1], [ex, ey - 3], [ex + 17, ey + 1]), { lw: 4, stroke: M.line });
      pen.line(INK.quad([ex - 15, ey + 4], [ex, ey + 7], [ex + 15, ey + 4]), { lw: 2.5, stroke: M.line });
    } else if (kind === 'dollar') {
      pen.text('$', ex, ey + 2, { font: '700 40px Kalam', fill: COL.greenDark });
    } else {
      const wide = kind === 'wide', half = kind === 'half';
      const top = wide ? -15 : -11, bot = wide ? 11 : 8, wx = wide ? 20 : 17;
      const up = INK.quad([ex - wx, ey], [ex, ey + top * 1.6], [ex + wx, ey]);
      const dn = INK.quad([ex + wx, ey], [ex, ey + bot * 1.5], [ex - wx, ey]);
      const shape = up.concat(dn.slice(1));
      const p = INK.path(shape, true, true);
      ctx.fillStyle = '#fff'; ctx.fill(p);
      ctx.save(); ctx.clip(p);
      ctx.fillStyle = '#4a2c1e'; ctx.beginPath(); ctx.arc(ex + look[0] * 6, ey - 1 + look[1] * 3, wide ? 6.5 : 8, 0, 7); ctx.fill();
      ctx.fillStyle = '#0d0907'; ctx.beginPath(); ctx.arc(ex + look[0] * 6, ey - 1 + look[1] * 3, wide ? 3.5 : 4.6, 0, 7); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex + look[0] * 6 + 2, ey - 3 + look[1] * 3, 1.6, 0, 7); ctx.fill();
      if (half) { ctx.fillStyle = M.skin; ctx.fillRect(ex - wx - 2, ey - 20, wx * 2 + 4, 18); }
      ctx.restore();
      if (half) pen.seg(ex - wx, ey - 2, ex + wx, ey - 2, { lw: 4, stroke: M.line });
      else pen.line(up, { lw: 4, stroke: M.line, amp: 0.4 });
      pen.line(INK.quad([ex - wx + 3, ey + 2], [ex, ey + bot * 1.3], [ex + wx - 3, ey + 2]), { lw: 2, stroke: '#7a5544', amp: 0.3 });
    }
    // eye bags + crow's feet (the mascot's signature tired-genius look)
    pen.line(INK.quad([ex - 13, ey + 15], [ex, ey + 19], [ex + 13, ey + 15]), { lw: 1.8, stroke: '#b98a73', amp: 0.3 });
    pen.seg(ex + sx * 24, ey - 2, ex + sx * 32, ey - 5, { lw: 2, stroke: '#7a5544', amp: 0.2 });
    pen.seg(ex + sx * 24, ey + 4, ex + sx * 32, ey + 7, { lw: 2, stroke: '#7a5544', amp: 0.2 });
  }
  // nose
  pen.line([[-5, 2], [-8, 24], [-12, 46]], { lw: 3.5, stroke: M.line, amp: 0.4 });
  pen.line([[-12, 46], [-19, 54], [-14, 63], [-6, 64], [0, 60], [6, 64], [14, 63], [19, 54], [13, 46]], { lw: 3.5, stroke: M.line, amp: 0.3 });
  // mouth + chin dimple
  drawMouth(ctx, pen, f, 2, 86, 42, st.talk || 0, { lw: 4 });
  pen.line(INK.quad([-12, 105], [0, 109], [12, 105]), { lw: 2.5, stroke: '#a7735c', amp: 0.2 });
  if (f.blush) { ctx.fillStyle = 'rgba(240,110,110,0.35)'; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sx * 58, 48, 20, 11, 0, 0, 7); ctx.fill(); } }
  ctx.restore();
  drawExtras(ctx, pen, f, 0, 0, 100, t);
}

function drawMascot(ctx, st, t) {
  const g = MASCOT.geo(), M = MASCOT;
  const pen = new Pen(ctx, 4242, 1.0);
  const f = Object.assign({}, EXPR[st.expr] || EXPR.neutral, st.faceOver || {});
  ctx.save();
  ctx.translate(st.x, st.y);
  if (st.rot) ctx.rotate(st.rot);
  ctx.scale(st.s * (st.flip ? -1 : 1), st.s * (st.squash || 1));
  ctx.globalAlpha *= st.alpha == null ? 1 : st.alpha;
  const bob = st.bob || 0;
  // legs
  drawLegs(pen, g, st, 6.5, 33, 128);
  ctx.translate(0, bob);
  // suit body
  const suit = [[-90, -362], [-101, -334], [-103, -230], [-105, -125], [0, -122], [105, -125], [103, -230], [101, -334], [90, -362], [40, -372], [-40, -372]];
  pen.shape(suit, { fill: M.suit, lw: 5, amp: 0.7 });
  pen.shape([[-30, -370], [30, -370], [3, -300], [-3, -300]], { fill: '#fff', lw: 3, amp: 0.4 });
  pen.shape([[-9, -368], [9, -368], [6, -350], [-6, -350]], { fill: '#111', stroke: '#111', lw: 2, amp: 0.2 });
  pen.shape([[-6, -350], [6, -350], [12, -298], [0, -284], [-12, -298]], { fill: '#111', stroke: '#111', lw: 2, amp: 0.2 });
  pen.line([[-31, -369], [-12, -300], [-6, -268]], { lw: 3, stroke: M.suitLine, amp: 0.4 });
  pen.line([[31, -369], [12, -300], [6, -268]], { lw: 3, stroke: M.suitLine, amp: 0.4 });
  pen.seg(0, -268, 0, -126, { lw: 2.5, stroke: M.suitLine, amp: 0.4 });
  ctx.fillStyle = '#55575d';
  for (const by of [-238, -206]) { ctx.beginPath(); ctx.arc(10, by, 4.5, 0, 7); ctx.fill(); }
  // head
  ctx.save();
  ctx.translate(g.head.x, g.head.y);
  ctx.rotate((st.tilt || 0));
  drawMascotHead(ctx, pen, f, st, t);
  ctx.restore();
  // arms (on top of the suit, with a white halo so they read over black)
  const hands = {};
  for (const side of ['L', 'R']) hands[side] = drawArm(ctx, pen, g, side, st.hands[side], 6.5, true, '#ffffff', g.a, g.b);
  ctx.restore();
  return hands;
}

// ---------- generated stickmen ----------
const STICK_GEO = {
  arm: 176, a: 90, b: 86, headR: 64,
  sh: { L: { x: -4, y: -262 }, R: { x: 4, y: -262 } },
  head: { x: 0, y: -352 }, face: { x: 0, y: -350 }, chin: { x: 6, y: -296 }, headSide: { x: 58, y: -380 }, hip: { x: 0, y: -132 },
};

const SKINS = ['#f6cfa9', '#efc19a', '#e2a97c', '#c88b5f', '#a26a45', '#7c4f33', '#f3d6bf'];

function drawStickHair(ctx, pen, c, r) {
  const hc = c.hairColor || COL.ink, k = c.hair;
  if (k === 'messy') {
    const pts = [];
    for (let i = 0; i <= 14; i++) { const a = Math.PI * (1.05 + i / 14 * 0.9); const rr = r * (1.02 + (i % 2 ? 0.28 : 0.06)); pts.push([Math.cos(a) * rr, Math.sin(a) * rr - 4]); }
    pen.shape(pts.concat([[r * 0.7, -r * 0.45], [0, -r * 0.62], [-r * 0.75, -r * 0.42]]), { fill: hc, stroke: hc, lw: 3, smooth: false });
  } else if (k === 'spiky') {
    const pts = [];
    for (let i = 0; i <= 10; i++) { const a = Math.PI * (1.08 + i / 10 * 0.84); const rr = r * (i % 2 ? 1.42 : 0.96); pts.push([Math.cos(a) * rr, Math.sin(a) * rr]); }
    pen.shape(pts, { fill: hc, stroke: COL.ink, lw: 3, smooth: false });
  } else if (k === 'curly') {
    for (let i = 0; i < 11; i++) { const a = Math.PI * (0.95 + i / 10 * 1.1); pen.circle(Math.cos(a) * r * 0.98, Math.sin(a) * r * 0.98 - 4, r * 0.3, { fill: hc, lw: 3 }); }
  } else if (k === 'afro') {
    pen.ellipse(0, -r * 0.35, r * 1.35, r * 1.05, { fill: hc, lw: 4, irr: 0.08 });
  } else if (k === 'bun') {
    pen.circle(0, -r * 1.12, r * 0.38, { fill: hc, lw: 4 });
    pen.shape(INK.ellipsePts(0, -r * 0.35, r * 1.02, r * 0.7, { seed: 5 }).filter(p => p[1] < -r * 0.25), { fill: hc, lw: 4 });
  } else if (k === 'long') {
    pen.shape([[-r * 1.05, r * 0.9], [-r * 1.12, -r * 0.2], [-r * 0.7, -r * 0.95], [0, -r * 1.12], [r * 0.7, -r * 0.95], [r * 1.12, -r * 0.2], [r * 1.05, r * 0.9], [r * 0.82, r * 0.9], [r * 0.85, -r * 0.3], [0, -r * 0.62], [-r * 0.85, -r * 0.3], [-r * 0.82, r * 0.9]], { fill: hc, lw: 4 });
  } else if (k === 'ponytail') {
    pen.shape([[r * 0.85, -r * 0.5], [r * 1.6, -r * 0.1], [r * 1.5, r * 0.5], [r * 1.0, -r * 0.05]], { fill: hc, lw: 4 });
    pen.shape(INK.ellipsePts(0, -r * 0.3, r * 1.03, r * 0.75, { seed: 9 }).filter(p => p[1] < -r * 0.2), { fill: hc, lw: 4 });
  } else if (k === 'side') {
    pen.shape([[-r * 0.98, -r * 0.05], [-r * 0.9, -r * 0.7], [-r * 0.3, -r * 1.06], [r * 0.5, -r * 1.0], [r * 1.0, -r * 0.45], [r * 0.98, -r * 0.05], [r * 0.6, -r * 0.55], [-r * 0.2, -r * 0.62], [-r * 0.75, -r * 0.4]], { fill: hc, lw: 4 });
  } else if (k === 'buzz') {
    pen.shape(INK.ellipsePts(0, -r * 0.08, r * 1.02, r * 1.0, { seed: 4 }).filter(p => p[1] < -r * 0.45), { fill: hc, stroke: hc, lw: 3 });
  } else if (k === 'mohawk') {
    pen.shape([[-r * 0.2, -r * 0.92], [-r * 0.1, -r * 1.55], [r * 0.12, -r * 1.48], [r * 0.25, -r * 0.92]], { fill: hc, lw: 4 });
  } else if (k === 'bald') {
    pen.line(INK.quad([-r * 0.4, -r * 0.62], [0, -r * 0.78], [r * 0.4, -r * 0.62]), { lw: 2, stroke: 'rgba(0,0,0,0.25)' });
  } else if (k === 'comb') {
    pen.shape([[-r * 1.0, -r * 0.1], [-r * 0.95, -r * 0.75], [-r * 0.2, -r * 1.12], [r * 0.85, -r * 0.9], [r * 1.02, -r * 0.2], [r * 0.7, -r * 0.6], [-r * 0.6, -r * 0.6]], { fill: hc, lw: 4 });
    pen.line(INK.quad([-r * 0.6, -r * 0.82], [0, -r * 1.0], [r * 0.6, -r * 0.82]), { lw: 2.5, stroke: 'rgba(255,255,255,0.5)' });
  }
}

function drawStickHat(ctx, pen, c, r) {
  const k = c.hat;
  if (!k) return;
  if (k === 'cap') {
    pen.shape(INK.ellipsePts(0, -r * 0.45, r * 1.0, r * 0.65, { seed: 3 }).filter(p => p[1] < -r * 0.4), { fill: c.hatColor || COL.red, lw: 4 });
    pen.shape([[r * 0.4, -r * 0.5], [r * 1.55, -r * 0.42], [r * 1.5, -r * 0.3], [r * 0.4, -r * 0.36]], { fill: c.hatColor || COL.red, lw: 4 });
  } else if (k === 'top') {
    pen.rect(-r * 0.62, -r * 1.85, r * 1.24, r * 1.1, { fill: '#222', lw: 4 });
    pen.rect(-r * 0.95, -r * 0.82, r * 1.9, r * 0.16, { fill: '#222', lw: 4 });
    pen.rect(-r * 0.62, -r * 1.0, r * 1.24, r * 0.16, { fill: c.hatColor || COL.red, lw: 2 });
  } else if (k === 'beanie') {
    pen.shape(INK.ellipsePts(0, -r * 0.35, r * 1.02, r * 0.78, { seed: 8 }).filter(p => p[1] < -r * 0.3), { fill: c.hatColor || COL.blue, lw: 4 });
    pen.circle(0, -r * 1.15, r * 0.18, { fill: c.hatColor || COL.blue, lw: 3 });
  } else if (k === 'hardhat') {
    pen.shape(INK.ellipsePts(0, -r * 0.4, r * 0.95, r * 0.7, { seed: 8 }).filter(p => p[1] < -r * 0.35), { fill: COL.yellow, lw: 4 });
    pen.rect(-r * 1.15, -r * 0.48, r * 2.3, r * 0.16, { fill: COL.yellow, lw: 4 });
  } else if (k === 'grad') {
    pen.shape([[-r * 1.2, -r * 0.95], [0, -r * 1.35], [r * 1.2, -r * 0.95], [0, -r * 0.6]], { fill: '#222', lw: 4 });
    pen.seg(r * 0.6, -r * 0.95, r * 0.9, -r * 0.35, { stroke: COL.gold, lw: 4 });
  } else if (k === 'headband') {
    pen.shape([[-r * 1.0, -r * 0.55], [r * 1.0, -r * 0.55], [r * 1.0, -r * 0.35], [-r * 1.0, -r * 0.35]], { fill: c.hatColor || COL.red, lw: 3 });
  } else if (k === 'crown') {
    pen.shape([[-r * 0.7, -r * 0.8], [-r * 0.75, -r * 1.4], [-r * 0.35, -r * 1.1], [0, -r * 1.5], [r * 0.35, -r * 1.1], [r * 0.75, -r * 1.4], [r * 0.7, -r * 0.8]], { fill: COL.gold, lw: 4, smooth: false });
  }
}

function drawStickFace(ctx, pen, c, f, st, t) {
  const r = STICK_GEO.headR, look = st.look || [0, 0];
  if (c.hair === 'long' || c.hair === 'afro') drawStickHair(ctx, pen, c, r);
  pen.circle(0, 0, r, { fill: c.skin, lw: 5, irr: 0.035 });
  if (c.hair !== 'long' && c.hair !== 'afro') drawStickHair(ctx, pen, c, r);
  drawStickHat(ctx, pen, c, r);
  const fx = look[0] * 8;
  ctx.save(); ctx.translate(fx, 0);
  if (c.browsAlways || f.brows !== 'n') drawBrows(pen, f, 22, -26, 20, 4, c.hairColor && c.hair !== 'bald' ? COL.ink : COL.ink);
  drawEyesSimple(ctx, pen, f, 21, -6, 5.2, look, st.blink);
  if (c.glasses) {
    const gc = c.glasses === 'sun' ? '#111' : COL.ink;
    for (const sx of [-1, 1]) {
      if (c.glasses === 'sun') pen.rect(sx * 21 - 15, -16, 30, 20, { fill: '#111', lw: 3, r: 5 });
      else pen.circle(sx * 21, -6, 14, { stroke: gc, lw: 3 });
    }
    pen.seg(-7, -7, 7, -7, { lw: 3 });
  }
  if (c.mustache) pen.shape([[-20, 18], [0, 12], [20, 18], [12, 24], [0, 20], [-12, 24]], { fill: c.hairColor || COL.ink, lw: 2.5 });
  if (c.beard) pen.shape([[-r * 0.85, r * 0.15], [-r * 0.6, r * 0.8], [0, r * 1.08], [r * 0.6, r * 0.8], [r * 0.85, r * 0.15], [r * 0.4, r * 0.55], [0, r * 0.62], [-r * 0.4, r * 0.55]], { fill: c.hairColor || COL.ink, lw: 3 });
  drawMouth(ctx, pen, f, 0, 26, 18, st.talk || 0, { lw: 4 });
  if (c.lipstick) { ctx.fillStyle = 'rgba(214,49,43,0.55)'; ctx.beginPath(); ctx.ellipse(0, 28, 10, 5, 0, 0, 7); ctx.fill(); }
  if (c.freckles) { ctx.fillStyle = 'rgba(150,80,40,0.6)'; for (const [a, b] of [[-30, 12], [-36, 6], [-26, 4], [30, 12], [36, 6], [26, 4]]) { ctx.beginPath(); ctx.arc(a, b, 2, 0, 7); ctx.fill(); } }
  if (f.blush || c.blush) { ctx.fillStyle = 'rgba(240,110,110,0.35)'; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sx * 36, 16, 11, 6, 0, 0, 7); ctx.fill(); } }
  ctx.restore();
  drawExtras(ctx, pen, f, 0, 0, r, t);
}

function drawStick(ctx, c, st, t) {
  const g = STICK_GEO;
  const pen = new Pen(ctx, c.seed || 77, 1.5);
  const f = Object.assign({}, EXPR[st.expr] || EXPR.neutral, st.faceOver || {});
  ctx.save();
  ctx.translate(st.x, st.y);
  if (st.rot) ctx.rotate(st.rot);
  ctx.scale(st.s * (st.flip ? -1 : 1) * (c.wide || 1), st.s * (st.squash || 1) * (c.tall || 1));
  ctx.globalAlpha *= st.alpha == null ? 1 : st.alpha;
  const lw = c.lw || 6;
  drawLegs(pen, g, st, lw, 3, 132, 24);
  ctx.translate(0, st.bob || 0);
  // body
  if (c.dress) pen.shape([[0, -282], [-62, -128], [62, -128]], { fill: c.dress, lw: 5 });
  pen.seg(0, -288, 0, -130, { lw, amp: 1.2 });
  if (c.belly) pen.ellipse(8, -200, 44, 52, { fill: c.shirt || '#ffffff', lw: 5 });
  if (c.tie) pen.shape([[-7, -286], [7, -286], [11, -230], [0, -212], [-11, -230]], { fill: c.tie, lw: 3.5 });
  if (c.bowtie) pen.shape([[0, -282], [-15, -292], [-15, -272], [0, -282], [15, -292], [15, -272]], { fill: c.bowtie, lw: 3, smooth: false });
  if (c.scarf) pen.shape([[-22, -292], [22, -292], [18, -276], [8, -276], [14, -236], [0, -236], [-4, -276], [-20, -276]], { fill: c.scarf, lw: 3.5, smooth: false });
  if (c.necklace) { pen.line(INK.quad([-14, -290], [0, -262], [14, -290]), { lw: 3, stroke: COL.gold }); }
  if (c.badge) pen.rect(6, -250, 26, 18, { fill: '#fff', lw: 3 });
  // head
  ctx.save(); ctx.translate(g.head.x, g.head.y); ctx.rotate(st.tilt || 0);
  drawStickFace(ctx, pen, c, f, st, t);
  ctx.restore();
  const hands = {};
  for (const side of ['L', 'R']) hands[side] = drawArm(ctx, pen, g, side, st.hands[side], lw, false, c.mitts ? c.skin : null, g.a, g.b);
  ctx.restore();
  return hands;
}

// convert a screen point into a rig's local space (for pointing / looking)
function toLocal(st, px, py) {
  let x = px - st.x, y = py - st.y;
  if (st.rot) { const c = Math.cos(-st.rot), s = Math.sin(-st.rot); [x, y] = [x * c - y * s, x * s + y * c]; }
  x /= st.s * (st.flip ? -1 : 1); y /= st.s;
  return { x, y };
}
function toScreen(st, lx, ly) {
  let x = lx * st.s * (st.flip ? -1 : 1), y = ly * st.s;
  if (st.rot) { const c = Math.cos(st.rot), s = Math.sin(st.rot); [x, y] = [x * c - y * s, x * s + y * c]; }
  return { x: x + st.x, y: y + st.y };
}

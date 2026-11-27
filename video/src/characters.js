/* Characters: the channel mascot rig (built from the user's artwork, unaltered)
 * and hand-drawn extra stickmen. */
(function (root) {
  const E = typeof module !== 'undefined' && module.exports ? require('./engine.js') : root.Engine;
  const { clamp, lerp, ease, rnd } = E;
  const INK = E.INK;

  // ======================================================================
  //  MASCOT  (all coordinates are pixels of the user's source image)
  // ======================================================================
  const MO = [697, 767];                 // origin = between the feet
  const NECK = [697, 399];               // head pivot (chin)
  const SH = { l: [610, 447], r: [786, 447] };
  const ARM = 85;                         // each arm segment
  const LIMB = 12.5;                      // limb thickness, as in the artwork
  const NAVY = 'rgb(14,18,32)';
  const SKIN_MOUTH = [229, 179, 149], SKIN_BROW = [214, 170, 143], SKIN_EYE = [222, 178, 156];
  const BROW = '#5e3a22';

  // hand targets (wrist positions) in source pixels
  const MPOSE = {
    rest:     { l: [583, 612, 'open'], r: [812, 612, 'open'] },
    pointR:   { l: [588, 612, 'open'], r: [985, 395, 'point'] },
    pointRlow:{ l: [588, 612, 'open'], r: [985, 520, 'point'] },
    pointRup: { l: [588, 612, 'open'], r: [930, 250, 'point'] },
    pointL:   { l: [410, 395, 'point'], r: [806, 612, 'open'] },
    pointLlow:{ l: [410, 520, 'point'], r: [806, 612, 'open'] },
    pointLup: { l: [465, 250, 'point'], r: [806, 612, 'open'] },
    pointUp:  { l: [588, 612, 'open'], r: [840, 170, 'point'] },
    presentR: { l: [588, 612, 'open'], r: [930, 470, 'palm'] },
    presentL: { l: [465, 470, 'palm'], r: [806, 612, 'open'] },
    both:     { l: [470, 480, 'palm'], r: [925, 480, 'palm'] },
    shrug:    { l: [500, 380, 'palm'], r: [895, 380, 'palm'] },
    think:    { l: [588, 612, 'open'], r: [722, 410, 'fist'] },
    hips:     { l: [618, 540, 'fist'], r: [778, 540, 'fist'] },
    fist:     { l: [588, 612, 'open'], r: [880, 230, 'fist'] },
    bothUp:   { l: [500, 200, 'open'], r: [895, 200, 'open'] },
    cheeks:   { l: [610, 330, 'open'], r: [786, 330, 'open'] },
    whisper:  { l: [588, 612, 'open'], r: [790, 345, 'palm'] },
    scratch:  { l: [588, 612, 'open'], r: [800, 290, 'open'] },
    hold:     { l: [640, 520, 'fist'], r: [755, 520, 'fist'] },
    holdR:    { l: [588, 612, 'open'], r: [905, 420, 'fist'] },
    holdL:    { l: [490, 420, 'fist'], r: [806, 612, 'open'] },
    count:    { l: [588, 612, 'open'], r: [880, 330, 'point'] },
    stop:     { l: [588, 612, 'open'], r: [900, 360, 'palm'] },
    wave:     { l: [588, 612, 'open'], r: [905, 250, 'palm'] },
    chin:     { l: [640, 540, 'fist'], r: [722, 410, 'fist'] },
  };

  // expression -> brows, rest mouth, talking mouth
  const EXPR = {
    neutral:  { brow: null,                  mouth: 'orig',  talk: 'open' },
    happy:    { brow: { dy: -3, tilt: 0 },   mouth: 'orig',  talk: 'open' },
    grin:     { brow: { dy: -5, tilt: 0 },   mouth: 'grin',  talk: 'grin' },
    surprise: { brow: { dy: -10, tilt: 0, arch: 4 }, mouth: 'o', talk: 'o' },
    sad:      { brow: { dy: -3, tilt: 7 },   mouth: 'frown', talk: 'sadopen' },
    worried:  { brow: { dy: -4, tilt: 6 },   mouth: 'wavy',  talk: 'sadopen' },
    fear:     { brow: { dy: -7, tilt: 8 },   mouth: 'wavy',  talk: 'o' },
    angry:    { brow: { dy: 3, tilt: -7 },   mouth: 'flat',  talk: 'flatopen' },
    determined:{ brow: { dy: 2, tilt: -5 },  mouth: 'flat',  talk: 'flatopen' },
    serious:  { brow: { dy: 2, tilt: -3 },   mouth: 'flat',  talk: 'flatopen' },
    confused: { brow: { dy: -8, tilt: 0, asym: true }, mouth: 'wavy', talk: 'flatopen' },
    smirk:    { brow: { dy: -2, tilt: 0, asym: true }, mouth: 'smirk', talk: 'open' },
    calm:     { brow: null,                  mouth: 'orig',  talk: 'open' },
    relief:   { brow: { dy: -2, tilt: 3 },   mouth: 'orig',  talk: 'open' },
    whisper:  { brow: { dy: -2, tilt: 2 },   mouth: 'o',     talk: 'o' },
  };

  const rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  function softPatch(ctx, x, y, rx, ry, col) {
    ctx.save(); ctx.translate(x, y); ctx.scale(rx, ry);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    g.addColorStop(0, rgb(col, 1)); g.addColorStop(0.72, rgb(col, 1)); g.addColorStop(1, rgb(col, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 1, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }

  function ik(S, T, a, b, side) {
    let dx = T[0] - S[0], dy = T[1] - S[1];
    let d = Math.hypot(dx, dy);
    const maxd = (a + b) * 0.985;
    if (d > maxd) { T = [S[0] + dx / d * maxd, S[1] + dy / d * maxd]; dx = T[0] - S[0]; dy = T[1] - S[1]; d = maxd; }
    d = Math.max(d, Math.abs(a - b) + 1);
    const base = Math.atan2(dy, dx);
    const off = Math.acos(clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1));
    const e1 = [S[0] + Math.cos(base + off) * a, S[1] + Math.sin(base + off) * a];
    const e2 = [S[0] + Math.cos(base - off) * a, S[1] + Math.sin(base - off) * a];
    const score = (e) => side * e[0] + 0.6 * e[1];
    return { E: score(e1) > score(e2) ? e1 : e2, T };
  }

  function blendPose(p0, p1, k) {
    const o = {};
    for (const s of ['l', 'r']) {
      const a = p0[s], b = p1[s];
      o[s] = [lerp(a[0], b[0], k), lerp(a[1], b[1], k), k < 0.5 ? a[2] : b[2]];
    }
    return o;
  }

  // poses: string | {l,r} | array of [time, pose] keys (eased 0.28s transitions)
  function resolvePose(poses, t, lib) {
    const get = (p) => (typeof p === 'string' ? lib[p] || lib.rest : p);
    if (!Array.isArray(poses)) return get(poses || 'rest');
    let cur = get(poses[0][1]), prev = cur, tk = -1e9;
    for (const [pt, p] of poses) { if (t >= pt) { prev = cur; cur = get(p); tk = pt; } }
    const k = ease.inOut(clamp((t - tk) / 0.28));
    return blendPose(prev, cur, k);
  }

  function drawHand(D, W, dir, kind, side, w, col, id) {
    const c = D.ctx; const a = Math.atan2(dir[1], dir[0]);
    const seg = (ang, len, ww) => { c.beginPath(); c.moveTo(W[0], W[1]); c.lineTo(W[0] + Math.cos(ang) * len, W[1] + Math.sin(ang) * len); c.lineWidth = ww || w; c.strokeStyle = col; c.lineCap = 'round'; c.stroke(); };
    // "inward" = toward the body center; for left arm side=-1
    const inward = -side;
    if (kind === 'point') { seg(a, 46, w * 0.92); seg(a + inward * 0.75, 20, w * 0.85); }
    else if (kind === 'fist') { c.beginPath(); c.arc(W[0] + Math.cos(a) * 6, W[1] + Math.sin(a) * 6, w * 0.95, 0, Math.PI * 2); c.fillStyle = col; c.fill(); }
    else if (kind === 'palm') { seg(a - 0.45, 30, w * 0.85); seg(a, 36, w * 0.85); seg(a + 0.45, 30, w * 0.85); }
    else { // 'open' - the original two-prong hand
      seg(a - inward * 0.12, 40, w * 0.95); seg(a + inward * 0.62, 23, w * 0.88);
    }
  }

  function limb(D, P0, P1, P2, w, col) {
    // smooth curve through elbow
    const c = D.ctx;
    const C = [2 * P1[0] - (P0[0] + P2[0]) / 2, 2 * P1[1] - (P0[1] + P2[1]) / 2];
    c.beginPath(); c.moveTo(P0[0], P0[1]); c.quadraticCurveTo(C[0], C[1], P2[0], P2[1]);
    c.lineWidth = w; c.strokeStyle = col; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke();
  }

  /* o: {x, y, s, pose, expr, talk(0-1 env), t, tilt, lean, blinkSeed, walk(phase|undefined),
         jump(0-1), fx: 'sweat'|'question'|'exclaim'|'sparkle'|'shock', wave:bool} */
  function mascot(D, o) {
    const A = D.assets, c = D.ctx, t = D.t;
    const M = A.mascotMeta;
    const ex = EXPR[o.expr || 'neutral'] || EXPR.neutral;
    const breathe = Math.sin(t * 2.2 + (o.x || 0) * 0.01);
    const talkAmt = o.talk || 0;
    let jumpY = 0;
    if (o.jump) jumpY = -Math.sin(clamp(o.jump) * Math.PI) * 60;
    c.save();
    c.translate(o.x, o.y + jumpY * o.s);
    c.scale(o.s, o.s);
    c.rotate((o.lean || 0) + Math.sin(t * 0.9) * 0.006);
    c.translate(-MO[0], -MO[1]);

    // ---- legs (behind torso) ----
    const hipL = [662, 640], hipR = [732, 640];
    let ankL = [657, 757], ankR = [743, 757], toeL = [613, 763], toeR = [783, 763];
    if (o.walk != null) {
      const ph = o.walk * Math.PI * 2;
      const sw = 26, lift = 16;
      ankL = [657 + Math.sin(ph) * sw, 757 - Math.max(0, Math.cos(ph)) * lift];
      ankR = [743 - Math.sin(ph) * sw, 757 - Math.max(0, -Math.cos(ph)) * lift];
      toeL = [ankL[0] - 44, ankL[1] + 6]; toeR = [ankR[0] + 40, ankR[1] + 6];
    }
    if (o.walk != null) c.translate(0, -Math.abs(Math.sin(o.walk * Math.PI * 2)) * 6);
    for (const [h, a, to] of [[hipL, ankL, toeL], [hipR, ankR, toeR]]) {
      limb(D, h, [(h[0] + a[0]) / 2 + (h[0] < 697 ? -2 : 2), (h[1] + a[1]) / 2], a, LIMB, NAVY);
      c.beginPath(); c.moveTo(a[0], a[1]); c.quadraticCurveTo((a[0] + to[0]) / 2, a[1] + 8, to[0], to[1]);
      c.lineWidth = LIMB; c.strokeStyle = NAVY; c.lineCap = 'round'; c.stroke();
    }

    // ---- torso (original artwork) ----
    const bb = M.body_box, hb = M.head_box;
    c.save();
    c.translate(697, 640); c.scale(1, 1 + breathe * 0.006); c.translate(-697, -640);
    c.drawImage(A.mascotBody, bb[0], bb[1]);
    c.restore();

    // ---- head (original artwork) + face overlays ----
    const nod = talkAmt > 0.2 ? Math.sin(t * 7.3) * 0.012 * talkAmt : 0;
    const tilt = (o.tilt || 0) + Math.sin(t * 1.3) * 0.012 + nod;
    c.save();
    c.translate(NECK[0], NECK[1] - breathe * 1.2); c.rotate(tilt); c.translate(-NECK[0], -NECK[1]);
    c.drawImage(A.mascotHead, hb[0], hb[1]);
    face(D, ex, o, talkAmt);
    c.restore();

    // ---- arms (in front) ----
    const pose = resolvePose(o.pose, t, MPOSE);
    for (const side of ['l', 'r']) {
      const sgn = side === 'l' ? -1 : 1;
      const S = SH[side];
      let T = [pose[side][0], pose[side][1]];
      if (o.wave && side === 'r') T = [T[0] + Math.sin(t * 12) * 30, T[1]];
      // gentle idle drift
      T = [T[0] + Math.sin(t * 1.7 + sgn) * 3, T[1] + Math.cos(t * 1.4 + sgn) * 3];
      const r = ik(S, T, ARM, ARM, sgn);
      limb(D, S, r.E, r.T, LIMB, NAVY);
      const dir = [r.T[0] - r.E[0], r.T[1] - r.E[1]]; const L = Math.hypot(dir[0], dir[1]) || 1;
      drawHand(D, r.T, [dir[0] / L, dir[1] / L], pose[side][2], sgn, LIMB, NAVY);
    }
    // ---- effects ----
    if (o.fx) mascotFx(D, o.fx, t);
    c.restore();
  }

  function face(D, ex, o, talkAmt) {
    const c = D.ctx, t = D.t;
    // blink: every ~3.7s, 0.13s long, deterministic per character
    const seed = o.blinkSeed || 1;
    const period = 3.4 + rnd(seed, 1) * 1.6;
    const ph = ((t + rnd(seed, 2) * period) % period);
    const blink = o.eyesClosed || ph < 0.13;
    if (blink) {
      for (const [x, y] of [[658, 274], [730, 274]]) {
        softPatch(c, x, y, 21, 12, SKIN_EYE);
        c.beginPath(); c.moveTo(x - 17, y + 1); c.quadraticCurveTo(x, y + 7, x + 17, y + 1);
        c.lineWidth = 3.4; c.strokeStyle = NAVY; c.lineCap = 'round'; c.stroke();
      }
    }
    // brows
    if (ex.brow) {
      const b = ex.brow;
      softPatch(c, 652, 254, 27, 8.5, SKIN_BROW);
      softPatch(c, 736, 254, 27, 8.5, SKIN_BROW);
      const br = (x0, y0, x1, y1, xm, ym) => {
        c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(xm, ym, x1, y1);
        c.lineWidth = 6; c.strokeStyle = BROW; c.lineCap = 'round'; c.stroke();
      };
      const dyL = b.dy, dyR = b.asym ? -b.dy * 0.2 + 2 : b.dy;
      const tl = b.tilt || 0, arch = b.arch || 0;
      // left brow: outer end at 632, inner at 672
      br(633, 257 + dyL + tl * 0.3, 671, 253 + dyL - tl, 652, 249 + dyL - arch - tl * 0.3);
      // right brow: inner at 715, outer at 757
      const tr = b.asym ? -4 : tl;
      br(715, 253 + dyR - tr, 756, 257 + dyR + tr * 0.3, 736, 249 + dyR - arch - tr * 0.3);
    }
    // mouth
    const open = clamp((talkAmt - 0.3) / 0.55);
    let kind = open > 0.06 ? ex.talk : ex.mouth;
    if (kind === 'orig') return;
    softPatch(c, 699, 349, 49, 17, SKIN_MOUTH);
    const ol = () => { c.lineWidth = 4.2; c.strokeStyle = NAVY; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); };
    const fillDark = () => { c.fillStyle = '#5b1d22'; c.fill(); };
    const tongue = (x, y, rx, ry, clipFn) => {
      c.save(); clipFn(); c.clip(); c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fillStyle = '#d8727c'; c.fill(); c.restore();
    };
    if (kind === 'open' || kind === 'grin') {
      const big = kind === 'grin' ? 1.25 : 1;
      const x0 = 700 - 34 * big, x1 = 700 + 33 * big, yT = 341;
      const yB = 349 + (kind === 'grin' ? 14 : 4) + 26 * open;
      const path = () => { c.beginPath(); c.moveTo(x0, yT + 1); c.quadraticCurveTo(700, yT + 7, x1, yT - 1); c.quadraticCurveTo(700, yB + 10, x0, yT + 1); c.closePath(); };
      path(); fillDark();
      if (open > 0.25 || kind === 'grin') { c.save(); path(); c.clip(); c.fillStyle = '#ffffff'; c.fillRect(x0, yT - 4, x1 - x0, 11); c.restore(); }
      tongue(700, yB + 4, 16, 8, path);
      path(); ol();
    } else if (kind === 'o') {
      const rx = 9 + 8 * open, ry = 11 + 12 * open;
      const path = () => { c.beginPath(); c.ellipse(700, 352, rx, ry, 0, 0, Math.PI * 2); };
      path(); fillDark(); path(); ol();
    } else if (kind === 'frown') {
      c.beginPath(); c.moveTo(670, 357); c.quadraticCurveTo(700, 336, 730, 357); ol();
    } else if (kind === 'sadopen') {
      const yB = 350 + 6 + 18 * open;
      const path = () => { c.beginPath(); c.moveTo(672, 354); c.quadraticCurveTo(700, 337, 728, 354); c.quadraticCurveTo(700, yB, 672, 354); c.closePath(); };
      path(); fillDark(); path(); ol();
    } else if (kind === 'flat') {
      c.beginPath(); c.moveTo(673, 348); c.quadraticCurveTo(700, 350, 727, 347); ol();
    } else if (kind === 'flatopen') {
      const h = 5 + 18 * open;
      const path = () => { c.beginPath(); c.moveTo(674, 345); c.quadraticCurveTo(700, 346, 726, 344); c.quadraticCurveTo(728, 345 + h, 700, 346 + h); c.quadraticCurveTo(672, 346 + h, 674, 345); c.closePath(); };
      path(); fillDark(); path(); ol();
    } else if (kind === 'wavy') {
      c.beginPath(); c.moveTo(670, 350);
      for (let i = 1; i <= 12; i++) { const x = 670 + i * 5, y = 350 + Math.sin(i * 1.2 + t * 6) * 3; c.lineTo(x, y); }
      ol();
    } else if (kind === 'smirk') {
      c.beginPath(); c.moveTo(672, 350); c.quadraticCurveTo(705, 354, 730, 338); ol();
    }
  }

  function mascotFx(D, fx, t) {
    const c = D.ctx;
    if (fx === 'sweat') {
      const y = 230 + ((t * 40) % 40);
      c.beginPath(); c.moveTo(806, y - 22); c.quadraticCurveTo(822, y, 806, y + 8); c.quadraticCurveTo(792, y, 806, y - 22);
      c.fillStyle = '#7cc4f2'; c.fill(); c.lineWidth = 3; c.strokeStyle = NAVY; c.stroke();
    } else if (fx === 'question') {
      D.text('?', 840, 150 + Math.sin(t * 3) * 6, { size: 120, font: 'Permanent Marker', color: '#1e66d0', rot: 0.15 });
    } else if (fx === 'exclaim') {
      D.text('!', 835, 150 + Math.sin(t * 9) * 4, { size: 130, font: 'Permanent Marker', color: '#d32f2f', rot: 0.12 });
    } else if (fx === 'shock') {
      for (let i = 0; i < 5; i++) {
        const a = -2.6 + i * 0.5; const r0 = 150 + Math.sin(t * 20 + i) * 5;
        D.line(697 + Math.cos(a) * r0, 250 + Math.sin(a) * r0, 697 + Math.cos(a) * (r0 + 40), 250 + Math.sin(a) * (r0 + 40), { w: 6, color: '#d32f2f', id: 900 + i });
      }
    } else if (fx === 'sparkle') {
      for (let i = 0; i < 3; i++) {
        const x = [560, 840, 820][i], y = [180, 160, 330][i], s = 14 + Math.sin(t * 5 + i * 2) * 5;
        D.poly([[x - s, y], [x + s, y]], { w: 4, color: '#f5b400', id: 950 + i }); D.poly([[x, y - s], [x, y + s]], { w: 4, color: '#f5b400', id: 960 + i });
      }
    }
  }

  // ======================================================================
  //  EXTRA STICKMEN (hand-drawn, intentionally imperfect)
  // ======================================================================
  // local units: feet at y=0, head center (0,-335), r=66
  const SPOSE = {
    rest:   { l: [-58, -150, 'h'], r: [58, -150, 'h'] },
    wave:   { l: [-58, -150, 'h'], r: [120, -390, 'h'] },
    point:  { l: [-58, -150, 'h'], r: [150, -270, 'h'] },
    pointUp:{ l: [-58, -150, 'h'], r: [100, -420, 'h'] },
    shrug:  { l: [-120, -270, 'h'], r: [120, -270, 'h'] },
    up:     { l: [-110, -400, 'h'], r: [110, -400, 'h'] },
    hold:   { l: [-40, -200, 'h'], r: [40, -200, 'h'] },
    holdR:  { l: [-58, -150, 'h'], r: [120, -240, 'h'] },
    holdUp: { l: [-58, -150, 'h'], r: [100, -390, 'h'] },
    hips:   { l: [-60, -165, 'h'], r: [60, -165, 'h'] },
    think:  { l: [-58, -150, 'h'], r: [25, -280, 'h'] },
    head:   { l: [-80, -390, 'h'], r: [80, -390, 'h'] },
    cheeks: { l: [-62, -310, 'h'], r: [62, -310, 'h'] },
    reach:  { l: [-58, -150, 'h'], r: [150, -220, 'h'] },
    both:   { l: [-130, -240, 'h'], r: [130, -240, 'h'] },
    cross:  { l: [30, -205, 'h'], r: [-30, -205, 'h'] },
    sad:    { l: [-40, -140, 'h'], r: [40, -140, 'h'] },
  };

  /* look: {skin, hair:{style,color}, acc:[...], shirt?, height?} */
  function stick(D, o) {
    const c = D.ctx, t = D.t;
    const lk = o.look || {};
    const id = o.id || 50;
    const flip = o.flip ? -1 : 1;
    c.save(); c.translate(o.x, o.y); c.scale((o.s || 1) * flip, o.s || 1);
    if (o.rot) c.rotate(o.rot);
    let bob = 0;
    if (o.walk != null) bob = -Math.abs(Math.sin(o.walk * Math.PI * 2)) * 8;
    if (o.jump) bob = -Math.sin(clamp(o.jump) * Math.PI) * 70;
    c.translate(0, bob);
    const hx = 0, hy = -335, R = lk.headR || 66;
    const sw = 6.5;
    const ink = lk.ink || INK;
    const hip = [0, -150], neck = [0, -268], shoulder = [0, -245];
    // legs
    let fL = [-34, 0], fR = [34, 0];
    if (o.walk != null) { const p = o.walk * Math.PI * 2; fL = [Math.sin(p) * 45, -Math.max(0, Math.cos(p)) * 14]; fR = [-Math.sin(p) * 45, -Math.max(0, -Math.cos(p)) * 14]; }
    if (o.sit) { fL = [-60, -20]; fR = [-20, -20]; }
    const lw = { w: sw, color: ink };
    if (o.sit) {
      D.poly([hip, [55, -150], [55, -20]], Object.assign({ id: id + 1 }, lw));
      D.poly([hip, [35, -150], [30, -20]], Object.assign({ id: id + 2 }, lw));
    } else {
      D.poly([hip, [(hip[0] + fL[0]) / 2 - 3, -75], fL], Object.assign({ id: id + 1 }, lw));
      D.poly([hip, [(hip[0] + fR[0]) / 2 + 3, -75], fR], Object.assign({ id: id + 2 }, lw));
    }
    // dress / shirt / torso accessories
    const acc = lk.acc || [];
    if (lk.dress) D.shape([[0, -262], [-58, -110], [58, -110]], { fill: lk.dress, w: sw, id: id + 3 });
    // body
    if (!lk.dress) D.poly([neck, hip], Object.assign({ id: id + 4 }, lw));
    if (lk.shirt) D.shape([[-20, -262], [20, -262], [30, -160], [-30, -160]], { fill: lk.shirt, w: sw, id: id + 5 });
    for (const a of acc) {
      if (a.startsWith('tie:')) { const col = a.slice(4); D.shape([[-7, -262], [7, -262], [11, -205], [0, -185], [-11, -205]], { fill: col, w: 4, id: id + 6 }); }
      if (a.startsWith('bowtie:')) { const col = a.slice(7); D.shape([[0, -258], [-20, -270], [-20, -246]], { fill: col, w: 4, id: id + 7 }); D.shape([[0, -258], [20, -270], [20, -246]], { fill: col, w: 4, id: id + 8 }); }
      if (a.startsWith('necklace:')) { D.arc(0, -262, 22, 0.3, Math.PI - 0.3, { w: 4, color: a.slice(9), id: id + 9 }); }
      if (a === 'cane') { D.poly([[90, 0], [92, -175], [70, -190]], { w: 6, color: '#7a4a21', id: id + 10 }); }
      if (a.startsWith('vest:')) D.shape([[-24, -262], [24, -262], [32, -165], [-32, -165]], { fill: a.slice(5), w: sw, id: id + 11 });
      if (a.startsWith('apron:')) D.shape([[-22, -230], [22, -230], [30, -130], [-30, -130]], { fill: a.slice(6), w: 5, id: id + 12 });
    }
    // long hair goes behind the head
    const hair = lk.hair || { style: 'spiky', color: ink };
    if (hair.style === 'long' || hair.style === 'ponytail') {
      D.shape([[-R - 6, hy - 20], [R + 6, hy - 20], [R + 14, hy + 85], [-R - 14, hy + 85]], { fill: hair.color, w: sw, id: id + 13 });
    }
    // arms
    const pose = resolvePose(o.pose || 'rest', t, SPOSE);
    for (const side of ['l', 'r']) {
      const sgn = side === 'l' ? -1 : 1;
      let T = [pose[side][0], pose[side][1]];
      if (o.wave && side === 'r') T = [T[0] + Math.sin(t * 12) * 22, T[1]];
      if (o.walk != null && !o.pose) T = [T[0] - sgn * 0 + Math.sin(o.walk * Math.PI * 2) * 30 * sgn, T[1]];
      const r = ik(shoulder, T, 78, 78, sgn);
      D.poly([shoulder, r.E, r.T], Object.assign({ id: id + 14 + (side === 'l' ? 0 : 1) }, lw));
    }
    // head
    D.circle(hx, hy, R, { fill: lk.skin || '#f7cfa6', w: sw, id: id + 20, color: ink });
    hairDraw(D, hair, hx, hy, R, id, sw, ink);
    // face
    stickFace(D, o, hx, hy, R, id, ink);
    // head accessories
    for (const a of acc) {
      if (a === 'glasses' || a === 'sunglasses') {
        const f = a === 'sunglasses' ? '#222' : null;
        D.circle(-24, hy - 4, 17, { w: 4.5, fill: f, id: id + 30 }); D.circle(24, hy - 4, 17, { w: 4.5, fill: f, id: id + 31 }); D.line(-7, hy - 6, 7, hy - 6, { w: 4, id: id + 32 });
      }
      if (a === 'beard') D.poly([[-R + 10, hy + 15], [-30, hy + 58], [0, hy + 70], [30, hy + 58], [R - 10, hy + 15]], { w: 0, fill: lk.beardColor || '#5a3a22', id: id + 33 });
      if (a === 'mustache') D.poly([[-22, hy + 24], [0, hy + 18], [22, hy + 24]], { w: 7, color: lk.beardColor || '#3b2716', id: id + 34 });
      if (a.startsWith('cap:')) { const col = a.slice(4); D.shape([[-R + 4, hy - 30], [-R + 12, hy - 66], [0, hy - 76], [R - 12, hy - 66], [R - 4, hy - 30]], { fill: col, w: 5, id: id + 35 }); D.shape([[R - 10, hy - 34], [R + 46, hy - 26], [R + 40, hy - 18], [R - 10, hy - 22]], { fill: col, w: 5, id: id + 36 }); }
      if (a === 'hardhat') { D.shape([[-R - 6, hy - 28], [-R + 6, hy - 70], [0, hy - 84], [R - 6, hy - 70], [R + 6, hy - 28]], { fill: '#f6c21c', w: 5, id: id + 37 }); D.line(-R - 14, hy - 28, R + 14, hy - 28, { w: 7, id: id + 38 }); }
      if (a.startsWith('headband:')) D.shape([[-R + 2, hy - 38], [R - 2, hy - 38], [R - 1, hy - 24], [-R + 1, hy - 24]], { fill: a.slice(9), w: 4, id: id + 39 });
      if (a.startsWith('hat:')) { const col = a.slice(4); D.shape([[-R - 22, hy - 44], [R + 22, hy - 44], [R + 18, hy - 54], [-R - 18, hy - 54]], { fill: col, w: 5, id: id + 40 }); D.shape([[-44, hy - 52], [-40, hy - 104], [40, hy - 104], [44, hy - 52]], { fill: col, w: 5, id: id + 41 }); }
      if (a === 'earrings') { D.circle(-R + 2, hy + 18, 6, { fill: '#f5b400', w: 3, id: id + 42 }); D.circle(R - 2, hy + 18, 6, { fill: '#f5b400', w: 3, id: id + 43 }); }
      if (a === 'wrinkles') { D.line(-R + 16, hy - 26, -R + 30, hy - 22, { w: 3, id: id + 44 }); D.line(R - 16, hy - 26, R - 30, hy - 22, { w: 3, id: id + 45 }); }
      if (a === 'bandaid') D.shape([[18, hy + 8], [44, hy + 2], [46, hy + 12], [20, hy + 18]], { fill: '#f2c38b', w: 3, id: id + 46 });
    }
    if (o.fx === 'sweat') { const y = hy - 20 + ((t * 40) % 30); D.circle(R + 14, y, 10, { fill: '#7cc4f2', w: 3, id: id + 50 }); }
    if (o.fx === 'question') D.text('?', R + 30, hy - R - 10, { size: 90, font: 'Permanent Marker', color: '#1e66d0' });
    if (o.fx === 'exclaim') D.text('!', R + 26, hy - R - 10, { size: 100, font: 'Permanent Marker', color: '#d32f2f' });
    if (o.fx === 'heart') D.text('❤', R + 26, hy - R, { size: 60, color: '#e53950' });
    if (o.fx === 'zzz') D.text('z z', R + 40, hy - R - 10 + Math.sin(t * 2) * 5, { size: 60, font: 'Permanent Marker', color: '#555' });
    c.restore();
  }

  function hairDraw(D, hair, hx, hy, R, id, sw, ink) {
    const col = hair.color || ink;
    const st = hair.style;
    if (st === 'bald') { D.arc(hx - 18, hy - 36, 14, 3.6, 4.6, { w: 4, color: '#fff', id: id + 60 }); return; }
    if (st === 'spiky' || st === 'messy') {
      const pts = []; const n = st === 'spiky' ? 13 : 10;
      for (let i = 0; i <= n; i++) {
        const a = Math.PI * (1.08 + 0.84 * i / n);
        const rr = R + (i % 2 ? (st === 'spiky' ? 22 : 15) : 2) + rnd(id, i) * 6;
        pts.push([hx + Math.cos(a) * rr, hy + Math.sin(a) * rr]);
      }
      D.poly(pts, { w: st === 'spiky' ? 9 : 8, color: col, sharp: true, id: id + 61 });
      if (st === 'messy') D.poly(pts.map((p, i) => [p[0] + 4, p[1] + 9 + (i % 2) * 3]), { w: 6, color: col, sharp: true, id: id + 62 });
      return;
    }
    const cap = (y0, extra) => {
      const pts = [];
      for (let i = 0; i <= 14; i++) { const a = Math.PI * (1 + i / 14); pts.push([hx + Math.cos(a) * (R + 4 + extra), hy + Math.sin(a) * (R + 4 + extra)]); }
      return pts;
    };
    if (st === 'flat' || st === 'side' || st === 'bob' || st === 'long' || st === 'ponytail' || st === 'bun') {
      const top = cap(0, st === 'bob' ? 6 : 2);
      const fringe = st === 'side'
        ? [[hx + R + 4, hy - 8], [hx + 30, hy - 34], [hx - 10, hy - 40], [hx - R - 4, hy - 12]]
        : st === 'flat' ? [[hx + R + 4, hy - 10], [hx + 20, hy - 30], [hx - 10, hy - 24], [hx - 35, hy - 34], [hx - R - 4, hy - 10]]
        : [[hx + R + 8, hy + 40], [hx + R - 6, hy - 22], [hx, hy - 38], [hx - R + 6, hy - 22], [hx - R - 8, hy + 40]];
      D.shape(top.concat(fringe), { fill: col, w: sw, id: id + 63 });
      if (st === 'bun') D.circle(hx, hy - R - 22, 24, { fill: col, w: sw, id: id + 64 });
      if (st === 'ponytail') D.shape([[hx + R - 6, hy - 30], [hx + R + 50, hy + 10], [hx + R + 30, hy + 60], [hx + R + 6, hy]], { fill: col, w: sw, id: id + 65 });
      return;
    }
    if (st === 'curly') {
      for (let i = 0; i < 9; i++) { const a = Math.PI * (1.02 + 0.96 * i / 8); D.circle(hx + Math.cos(a) * (R + 6), hy + Math.sin(a) * (R + 6), 17, { fill: col, w: 4.5, id: id + 70 + i }); }
      return;
    }
    if (st === 'gray') {
      D.arc(hx - R + 6, hy - 6, 22, 1.9, 4.2, { w: 12, color: '#bdbdbd', id: id + 80 }); D.arc(hx + R - 6, hy - 6, 22, -1.1, 1.2, { w: 12, color: '#bdbdbd', id: id + 81 });
      return;
    }
    if (st === 'mohawk') { D.shape([[hx - 14, hy - R + 4], [hx - 8, hy - R - 46], [hx + 8, hy - R - 40], [hx + 14, hy - R + 4]], { fill: col, w: 5, id: id + 82 }); }
  }

  function stickFace(D, o, hx, hy, R, id, ink) {
    const t = D.t, c = D.ctx;
    const ex = o.expr || 'neutral';
    const seed = id;
    const period = 3.1 + rnd(seed, 1) * 2;
    const blink = ((t + rnd(seed, 2) * period) % period) < 0.12;
    const ey = hy - 6, exo = 23;
    const look = o.lookX || 0;
    // eyes
    for (const sx of [-1, 1]) {
      const x = hx + sx * exo + look;
      if (blink || ex === 'happyClosed') { D.arc(x, ey + 2, 9, Math.PI * 1.15, Math.PI * 1.85, { w: 4.5, id: id + 90 + sx }); continue; }
      if (ex === 'surprise' || ex === 'fear') { D.circle(x, ey, 13, { fill: '#fff', w: 4, id: id + 92 + sx }); c.beginPath(); c.arc(x, ey, 5.5, 0, 7); c.fillStyle = ink; c.fill(); continue; }
      c.beginPath(); c.arc(x, ey, 7.5, 0, Math.PI * 2); c.fillStyle = ink; c.fill();
      c.beginPath(); c.arc(x - 2.5, ey - 2.5, 2.2, 0, Math.PI * 2); c.fillStyle = '#fff'; c.fill();
    }
    // brows
    const B = { angry: 7, determined: 5, serious: 3, sad: -7, worried: -7, fear: -8, surprise: 0, confused: 0 };
    if (ex in B) {
      const tl = B[ex], up = ex === 'surprise' ? -10 : ex === 'fear' ? -6 : 0;
      D.line(hx - exo - 13, ey - 22 + up - tl * 0.4, hx - exo + 12, ey - 22 + up + tl, { w: 5, id: id + 95 });
      if (ex === 'confused') D.line(hx + exo - 12, ey - 30, hx + exo + 13, ey - 34, { w: 5, id: id + 96 });
      else D.line(hx + exo - 12, ey - 22 + up + tl, hx + exo + 13, ey - 22 + up - tl * 0.4, { w: 5, id: id + 96 });
    }
    // mouth
    const my = hy + 28;
    const talking = o.talk && o.talk > 0.35;
    const op = talking ? clamp((o.talk - 0.3) / 0.6) : 0;
    if (talking) {
      c.save(); c.beginPath(); c.ellipse(hx + look * 0.5, my, 14, 5 + 12 * op, 0, 0, Math.PI * 2); c.fillStyle = '#5b1d22'; c.fill();
      c.lineWidth = 4.5; c.strokeStyle = ink; c.stroke(); c.restore();
      return;
    }
    const m = { id: id + 97, w: 5 };
    switch (ex) {
      case 'happy': case 'happyClosed': D.arc(hx, my - 14, 22, 0.35, Math.PI - 0.35, m); break;
      case 'grin': { c.beginPath(); c.moveTo(hx - 26, my - 6); c.quadraticCurveTo(hx, my + 36, hx + 26, my - 6); c.closePath(); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 5; c.strokeStyle = ink; c.stroke(); break; }
      case 'sad': case 'worried': D.arc(hx, my + 16, 18, Math.PI + 0.5, Math.PI * 2 - 0.5, m); break;
      case 'surprise': case 'fear': { c.beginPath(); c.ellipse(hx, my + 4, 10, 14, 0, 0, 7); c.fillStyle = '#5b1d22'; c.fill(); c.lineWidth = 4.5; c.strokeStyle = ink; c.stroke(); break; }
      case 'angry': case 'determined': case 'serious': D.line(hx - 16, my + 2, hx + 16, my + 2, m); break;
      case 'confused': D.poly([[hx - 18, my + 2], [hx - 6, my - 3], [hx + 6, my + 4], [hx + 18, my - 1]], m); break;
      case 'smirk': D.poly([[hx - 16, my + 2], [hx + 4, my + 3], [hx + 18, my - 6]], m); break;
      case 'cry': D.arc(hx, my + 16, 18, Math.PI + 0.5, Math.PI * 2 - 0.5, m); D.circle(hx - exo, ey + 22 + ((t * 50) % 30), 6, { fill: '#7cc4f2', w: 2.5, id: id + 98 }); break;
      default: D.line(hx - 14, my, hx + 14, my - 1, m);
    }
  }

  const Characters = { mascot, stick, MPOSE, SPOSE, EXPR };
  if (typeof module !== 'undefined' && module.exports) module.exports = Characters; else root.Characters = Characters;
})(typeof window !== 'undefined' ? window : globalThis);

'use strict';
// Hand-drawn stick-figure extras. Each character in CAST has a unique look.
// Local coords: origin on the ground between the feet; ~535px tall at s=1.
const SK = { R: 70, headY: -482, neckY: -416, shY: -388, hipY: -232, L1: 92, L2: 92, G1: 118, G2: 118 };

const STICK_POSES = {
  rest: { L: [-62, -215], R: [62, -215] },
  pointR: { L: [-62, -215], R: [205, -395] },
  pointL: { L: [-205, -395], R: [62, -215] },
  pointUR: { L: [-62, -215], R: [150, -540] },
  wave: { L: [-62, -215], R: [125, -520], wave: 'R' },
  up: { L: [-95, -560], R: [95, -560] },
  shrug: { L: [-120, -405], R: [120, -405] },
  hips: { L: [-10, -258], R: [10, -258], bL: 1, bR: 1 },
  chin: { L: [-62, -215], R: [12, -428] },
  facepalm: { L: [-62, -215], R: [10, -485] },
  cover: { L: [-18, -480], R: [18, -480] },
  hold: { L: [-48, -318], R: [48, -318] },
  holdR: { L: [-62, -215], R: [118, -330] },
  holdUp: { L: [-62, -215], R: [100, -470] },
  carry: { L: [-60, -300], R: [60, -300] },
  sad: { L: [-30, -210], R: [30, -210] },
  cheer: { L: [-140, -530], R: [140, -530] },
  scratch: { L: [-62, -215], R: [55, -520], bR: 1 },
  present: { L: [-62, -215], R: [160, -330] },
  stop: { L: [-62, -215], R: [170, -440] },
  think: { L: [-20, -300], R: [12, -428] },
  phone: { L: [-62, -215], R: [40, -440] },
  hug: { L: [-140, -330], R: [140, -330] },
  run: { L: [-90, -330], R: [80, -280] },
};

// Unique cast. skin: 1..4, hair: style, hc: hair colour, top: clothing, etc.
const CAST = {
  husband: { skin: COL.skin, hair: 'side', hc: '#5a3a1e', top: 'tee', tc: '#3d7fc2', face: 'smile' },
  wife: { skin: COL.skin2, hair: 'long', hc: '#9c4a1f', top: 'dress', tc: '#3e9a5a', face: 'smile', lips: 1 },
  boomer: { skin: COL.skin, hair: 'bald', hc: '#bdbdbd', top: 'cardigan', tc: '#8e2f3c', glasses: 'round', wrinkles: 1, mustache: '#bdbdbd' },
  boomerWife: { skin: COL.skin, hair: 'bun', hc: '#e3e3e3', top: 'dress', tc: '#7d4cb3', glasses: 'cat', wrinkles: 1, lips: 1 },
  dad: { skin: COL.skin3, hair: 'beanie', hc: '#2a1d12', hat: '#d1493f', beard: '#2a1d12', top: 'hoodie', tc: '#6f7a84' },
  mom: { skin: COL.skin3, hair: 'ponytail', hc: '#1d1410', top: 'tee', tc: '#f08a5d', lips: 1 },
  kid: { skin: COL.skin3, hair: 'curly', hc: '#1d1410', top: 'tee', tc: '#f2c94c', kid: 1 },
  firstBuyer: { skin: COL.skin2, hair: 'cap', hc: '#3a2617', hat: '#2f6fb5', top: 'tee', tc: '#e05a47', face: 'smile' },
  econA: { skin: COL.skin, hair: 'messy', hc: '#c9c9c9', glasses: 'round', top: 'bowtie', tc: '#c0392b', wrinkles: 1 },
  econB: { skin: COL.skin4, hair: 'flattop', hc: '#141414', top: 'vest', tc: '#7a5a3a', mustache: '#141414', glasses: 'square' },
  realtor: { skin: COL.skin2, hair: 'slick', hc: '#1b1b1b', top: 'blazer', tc: '#c23b3b', face: 'grin' },
  mbaEcon: { skin: COL.skin, hair: 'bob', hc: '#e0b04a', top: 'blazer', tc: '#2c4a7a', glasses: 'square', lips: 1 },
  nurse: { skin: COL.skin4, hair: 'ponytail', hc: '#1d1410', top: 'scrubs', tc: '#2ba59a', hat: 'nurse' },
  oldMom: { skin: COL.skin2, hair: 'curly', hc: '#d6d6d6', top: 'cardigan', tc: '#5f8f6f', glasses: 'round', wrinkles: 1, cane: 1 },
  oldDad: { skin: COL.skin2, hair: 'bald', hc: '#d6d6d6', top: 'shirt', tc: '#b8a26a', wrinkles: 1, cane: 1 },
  taxman: { skin: COL.skin, hair: 'combover', hc: '#4a3a2a', hat: 'visor', top: 'shirtTie', tc: '#e9e4d0', tie: '#2c6e31', glasses: 'round' },
  insurer: { skin: COL.skin2, hair: 'side', hc: '#1b1b1b', top: 'suit', tc: '#3b4650', tie: '#2f6fb5', sunglasses: 1 },
  heirA: { skin: COL.skin, hair: 'spiky', hc: '#e2b33c', top: 'hoodie', tc: '#7d4cb3' },
  heirB: { skin: COL.skin, hair: 'pigtails', hc: '#6b3e1f', top: 'tee', tc: '#2ba59a', lips: 1 },
  repA: { skin: COL.skin, hair: 'side', hc: '#9a9a9a', top: 'suit', tc: '#1f2a44', tie: '#c0392b', flagpin: 1, wrinkles: 1 },
  repB: { skin: COL.skin3, hair: 'flattop', hc: '#1b1b1b', top: 'suit', tc: '#2b2b2b', tie: '#2f6fb5', flagpin: 1 },
  worker: { skin: COL.skin2, hair: 'messy', hc: '#2a1d12', top: 'shirtTie', tc: '#cfe3f5', tie: '#7d4cb3', lanyard: 1 },
  jobSeeker: { skin: COL.skin4, hair: 'buzz', hc: '#141414', top: 'suit', tc: '#4b5563', tie: '#e0a030', briefcase: 1 },
  buyer: { skin: COL.skin, hair: 'spiky', hc: '#1b1b1b', top: 'none', tie: '#3e9440' },
  seller: { skin: COL.skin2, hair: 'afro', hc: '#2a1d12', top: 'tee', tc: '#e0a030' },
  newYorker: { skin: COL.skin, hair: 'beanie', hc: '#3a2617', hat: '#4a4f55', top: 'jacket', tc: '#7b5134', scarf: '#c0392b', beard: '#3a2617' },
  floridian: { skin: COL.skin2, hair: 'bald', hc: '#888', top: 'hawaii', tc: '#3fb6d8', sunglasses: 1 },
  californian: { skin: COL.skin, hair: 'long', hc: '#e8c25a', top: 'tee', tc: '#f28c38', sunglasses: 1 },
  census: { skin: COL.skin3, hair: 'bob', hc: '#2a1d12', top: 'vest', tc: '#2f6fb5', glasses: 'square', lips: 1 },
  divorceeA: { skin: COL.skin, hair: 'side', hc: '#7a4a24', top: 'shirt', tc: '#9aa5b1' },
  divorceeB: { skin: COL.skin2, hair: 'bob', hc: '#2a1d12', top: 'dress', tc: '#c2577a', lips: 1 },
  mourner: { skin: COL.skin3, hair: 'slick', hc: '#2a1d12', top: 'suit', tc: '#1b1b1b', tie: '#1b1b1b' },
  retiree: { skin: COL.skin, hair: 'messy', hc: '#ffffff', top: 'cardigan', tc: '#a0522d', glasses: 'round', wrinkles: 1, beard: '#efefef' },
  chair1: { skin: COL.skin, hair: 'spiky', hc: '#c0392b', top: 'tee', tc: '#2f6fb5' },
  chair2: { skin: COL.skin4, hair: 'afro', hc: '#141414', top: 'tee', tc: '#3e9440' },
  chair3: { skin: COL.skin2, hair: 'ponytail', hc: '#e2b33c', top: 'dress', tc: '#f29aae' },
  chair4: { skin: COL.skin3, hair: 'cap', hc: '#141414', hat: '#e0a030', top: 'hoodie', tc: '#4a4f55' },
  chair5: { skin: COL.skin, hair: 'bald', hc: '#aaa', top: 'cardigan', tc: '#6b8e23', glasses: 'round', wrinkles: 1 },
  agentB: { skin: COL.skin4, hair: 'bun', hc: '#141414', top: 'blazer', tc: '#3e9440', lips: 1 },
};

function stickIK(S, T, L1, L2, pref) {
  const dx = T[0] - S[0], dy = T[1] - S[1];
  let d = Math.hypot(dx, dy); const base = Math.atan2(dy, dx);
  if (d >= L1 + L2 - 0.5) return [[S[0] + Math.cos(base) * L1, S[1] + Math.sin(base) * L1], [S[0] + Math.cos(base) * (L1 + L2), S[1] + Math.sin(base) * (L1 + L2)]];
  d = Math.max(d, 1);
  const a = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  const c1 = [S[0] + Math.cos(base + a) * L1, S[1] + Math.sin(base + a) * L1];
  const c2 = [S[0] + Math.cos(base - a) * L1, S[1] + Math.sin(base - a) * L1];
  return [pref(c1) > pref(c2) ? c1 : c2, T];
}

function drawHair(ctx, c, back, seed) {
  const R = SK.R, hy = SK.headY, hc = c.hc || COL.ink;
  const o = { fill: hc, w: 4.5, seed, amp: 1.2 };
  switch (c.hair) {
    case 'long':
      if (back) shape(ctx, [[-R - 8, hy - 10], [-R + 2, hy - R + 5], [0, hy - R - 10], [R - 2, hy - R + 5], [R + 8, hy - 10], [R + 12, hy + R + 20], [R - 12, hy + R + 28], [-R + 12, hy + R + 28], [-R - 12, hy + R + 20]], o);
      else shape(ctx, [[-R - 2, hy - 6], [-R + 6, hy - R + 4], [0, hy - R - 9], [R - 6, hy - R + 4], [R + 2, hy - 6], [R - 18, hy - R + 22], [-4, hy - R + 26], [-R + 22, hy - R + 28]], o);
      break;
    case 'bob':
      if (back) shape(ctx, [[-R - 10, hy], [-R, hy - R + 2], [0, hy - R - 10], [R, hy - R + 2], [R + 10, hy], [R + 8, hy + 34], [-R - 8, hy + 34]], o);
      else shape(ctx, [[-R - 2, hy - 4], [-R + 8, hy - R + 2], [0, hy - R - 8], [R - 8, hy - R + 2], [R + 2, hy - 4], [R - 12, hy - 30], [-R + 10, hy - 28]], o);
      break;
    case 'ponytail':
      if (back) { shape(ctx, [[R - 10, hy - 30], [R + 40, hy - 5], [R + 50, hy + 45], [R + 25, hy + 60], [R + 20, hy + 10], [R - 8, hy - 8]], o); }
      else shape(ctx, [[-R + 2, hy - 14], [-R + 10, hy - R + 8], [0, hy - R - 6], [R - 8, hy - R + 6], [R, hy - 16], [10, hy - R + 24], [-R + 20, hy - R + 30]], o);
      break;
    case 'bun':
      if (!back) { circ(ctx, 0, hy - R - 18, 24, 20, o); shape(ctx, [[-R + 2, hy - 18], [-R + 12, hy - R + 4], [0, hy - R - 5], [R - 12, hy - R + 4], [R - 2, hy - 18], [0, hy - R + 18]], o); }
      break;
    case 'pigtails':
      if (back) { circ(ctx, -R - 16, hy + 2, 18, 26, o); circ(ctx, R + 16, hy + 2, 18, 26, o); }
      else shape(ctx, [[-R + 2, hy - 16], [-R + 12, hy - R + 4], [0, hy - R - 5], [R - 12, hy - R + 4], [R - 2, hy - 16], [0, hy - R + 20]], o);
      break;
    case 'side':
      if (!back) shape(ctx, [[-R - 2, hy - 2], [-R + 4, hy - R + 6], [-10, hy - R - 8], [R - 4, hy - R + 2], [R + 3, hy - 10], [R - 16, hy - R + 22], [-24, hy - R + 18], [-R + 12, hy - 22]], o);
      break;
    case 'slick':
      if (!back) shape(ctx, [[-R, hy - 10], [-R + 8, hy - R + 2], [8, hy - R - 9], [R - 2, hy - R + 8], [R + 2, hy - 14], [R - 22, hy - R + 18], [-R + 14, hy - R + 22]], Object.assign({}, o, { fill: hc }));
      break;
    case 'flattop':
      if (!back) poly(ctx, [[-R + 4, hy - R + 20], [-R + 6, hy - R - 16], [R - 6, hy - R - 16], [R - 4, hy - R + 20], [R - 16, hy - R + 14], [-R + 16, hy - R + 14]], o);
      break;
    case 'buzz':
      if (!back) shape(ctx, [[-R + 3, hy - 18], [-R + 14, hy - R + 4], [0, hy - R - 2], [R - 14, hy - R + 4], [R - 3, hy - 18], [0, hy - R + 12]], Object.assign({}, o, { w: 3 }));
      break;
    case 'combover':
      if (!back) { for (let i = 0; i < 5; i++) rline(ctx, [[-R + 12, hy - R + 26 + i * 3], [0, hy - R - 2 + i * 4], [R - 10, hy - R + 18 + i * 3]], { w: 3.5, c: hc, seed: seed + i }); }
      break;
    case 'messy':
      if (!back) {
        const r = mulberry(seed);
        for (let i = 0; i < 13; i++) {
          const a = (200 + i * 11.5) * D2R, rr = R - 4;
          const x0 = Math.cos(a) * rr, y0 = hy + Math.sin(a) * rr;
          const x1 = Math.cos(a + (r() - 0.5) * 0.5) * (rr + 18 + r() * 14), y1 = hy + Math.sin(a) * (rr + 18 + r() * 14);
          rline(ctx, [[x0, y0], [x1, y1]], { w: 5, c: hc, seed: seed + i, amp: 0 });
        }
      }
      break;
    case 'spiky': {
      if (!back) {
        const pts = []; const r = mulberry(seed);
        for (let i = 0; i <= 14; i++) {
          const a = (195 + i * 10.7) * D2R;
          const rr = i % 2 ? R + 14 + r() * 14 : R - 3;
          pts.push([Math.cos(a) * rr, hy + Math.sin(a) * rr]);
        }
        pts.push([R * 0.55, hy - R * 0.55]); pts.push([-R * 0.2, hy - R * 0.72]); pts.push([-R * 0.75, hy - R * 0.4]);
        poly(ctx, pts, Object.assign({}, o, { w: 3 }));
      }
      break;
    }
    case 'curly':
    case 'afro': {
      const big = c.hair === 'afro' ? 1.35 : 1;
      if (back) {
        const r = mulberry(seed);
        for (let i = 0; i < 11; i++) {
          const a = (170 + i * 20) * D2R;
          circ(ctx, Math.cos(a) * R * 0.98 * big, hy + Math.sin(a) * R * 0.95 * big - (big - 1) * 20, 20 * big + r() * 6, null, { fill: hc, w: 4, seed: seed + i });
        }
      }
      break;
    }
    case 'cap':
      if (!back) {
        shape(ctx, [[-R - 2, hy - 12], [-R + 6, hy - R + 2], [0, hy - R - 8], [R - 6, hy - R + 2], [R + 2, hy - 12]], { fill: c.hat || COL.blue, w: 4.5, seed });
        shape(ctx, [[R - 10, hy - 18], [R + 52, hy - 14], [R + 50, hy - 4], [R - 10, hy - 6]], { fill: c.hat || COL.blue, w: 4.5, seed: seed + 3 });
      }
      break;
    case 'beanie':
      if (!back) {
        shape(ctx, [[-R - 3, hy - 14], [-R + 4, hy - R + 2], [0, hy - R - 12], [R - 4, hy - R + 2], [R + 3, hy - 14]], { fill: c.hat || COL.red, w: 4.5, seed });
        rect(ctx, -R - 5, hy - 26, 2 * R + 10, 20, { fill: c.hat || COL.red, w: 4.5, seed: seed + 2 });
        circ(ctx, 0, hy - R - 18, 12, null, { fill: '#fff', w: 4, seed: seed + 4 });
      }
      break;
    case 'bald':
      if (!back && c.hc) { rline(ctx, [[-R + 2, hy + 6], [-R - 4, hy - 16], [-R + 6, hy - 30]], { w: 6, c: c.hc, seed }); rline(ctx, [[R - 2, hy + 6], [R + 4, hy - 16], [R - 6, hy - 30]], { w: 6, c: c.hc, seed: seed + 1 }); }
      break;
  }
}

function drawHat(ctx, c, seed) {
  const R = SK.R, hy = SK.headY;
  if (c.hat === 'nurse') {
    poly(ctx, [[-30, hy - R - 4], [30, hy - R - 4], [24, hy - R - 30], [-24, hy - R - 30]], { fill: '#fff', w: 4, seed });
    rect(ctx, -4, hy - R - 26, 8, 18, { fill: COL.red, noStroke: 1, amp: 0 }); rect(ctx, -9, hy - R - 21, 18, 8, { fill: COL.red, noStroke: 1, amp: 0 });
  } else if (c.hat === 'visor') {
    rline(ctx, [[-R + 2, hy - 22], [0, hy - 30], [R - 2, hy - 22]], { w: 6, c: '#2c6e31', seed });
    ctx.save(); ctx.globalAlpha *= 0.75;
    shape(ctx, [[-R + 6, hy - 24], [R - 6, hy - 24], [R + 10, hy - 2], [-R - 10, hy - 2]], { fill: '#4caf50', w: 3.5, seed: seed + 1 });
    ctx.restore();
  }
}

function drawFaceStick(ctx, c, face, t, seed) {
  const R = SK.R, hy = SK.headY;
  const ex = 20, ey = hy - 6;
  const blink = ((t + (seed % 97) / 31) % 3.3) < 0.12;
  ctx.save();
  // eyes
  if (face === 'laugh' || face === 'sleep' || blink) {
    for (const s of [-1, 1]) { ctx.beginPath(); if (face === 'laugh') { ctx.moveTo(s * ex - 8, ey + 3); ctx.quadraticCurveTo(s * ex, ey - 8, s * ex + 8, ey + 3); } else { ctx.moveTo(s * ex - 8, ey); ctx.quadraticCurveTo(s * ex, ey + 6, s * ex + 8, ey); } strokeStyle(ctx, { w: 4 }); ctx.stroke(); }
  } else if (face === 'shock' || face === 'O') {
    for (const s of [-1, 1]) { circ(ctx, s * ex, ey, 9, 10, { fill: '#fff', w: 3, seed: seed + s }); dot(ctx, s * ex, ey + 1, 4); }
  } else {
    dot(ctx, -ex, ey, 5.2); dot(ctx, ex + 1, ey - 1, 5.2);
  }
  // brows
  const bw = { w: 4, seed };
  if (face === 'angry' || face === 'determined') { line(ctx, -ex - 10, ey - 22, -ex + 9, ey - 14, bw); line(ctx, ex + 10, ey - 22, ex - 9, ey - 14, bw); }
  else if (face === 'worried' || face === 'sad' || face === 'cry') { line(ctx, -ex - 10, ey - 14, -ex + 9, ey - 21, bw); line(ctx, ex + 10, ey - 14, ex - 9, ey - 21, bw); }
  else if (face === 'shock' || face === 'O' || face === 'o') { line(ctx, -ex - 9, ey - 26, -ex + 9, ey - 28, bw); line(ctx, ex + 9, ey - 26, ex - 9, ey - 28, bw); }
  else if (face === 'confused' || face === 'smirk') { line(ctx, -ex - 9, ey - 26, -ex + 9, ey - 29, bw); line(ctx, ex + 9, ey - 17, ex - 9, ey - 17, bw); }
  // glasses
  if (c.glasses) {
    const gw = { w: 3.5, seed: seed + 9 };
    if (c.glasses === 'square') { rect(ctx, -ex - 14, ey - 11, 28, 22, gw); rect(ctx, ex - 14, ey - 11, 28, 22, gw); }
    else if (c.glasses === 'cat') { poly(ctx, [[-ex - 16, ey - 13], [-ex + 13, ey - 9], [-ex + 11, ey + 10], [-ex - 12, ey + 9]], gw); poly(ctx, [[ex + 16, ey - 13], [ex - 13, ey - 9], [ex - 11, ey + 10], [ex + 12, ey + 9]], gw); }
    else { circ(ctx, -ex, ey, 14, null, gw); circ(ctx, ex, ey, 14, null, gw); }
    line(ctx, -ex + 13, ey - 2, ex - 13, ey - 2, gw);
  }
  if (c.sunglasses) {
    poly(ctx, [[-ex - 17, ey - 10], [-ex + 13, ey - 10], [-ex + 10, ey + 9], [-ex - 14, ey + 9]], { fill: '#111', w: 3, seed });
    poly(ctx, [[ex + 17, ey - 10], [ex - 13, ey - 10], [ex - 10, ey + 9], [ex + 14, ey + 9]], { fill: '#111', w: 3, seed: seed + 1 });
    line(ctx, -ex + 12, ey - 6, ex - 12, ey - 6, { w: 3.5, seed });
  }
  if (c.wrinkles) { for (const s of [-1, 1]) { line(ctx, s * (ex + 16), ey + 4, s * (ex + 24), ey + 1, { w: 2.2, seed }); line(ctx, s * (ex + 16), ey + 9, s * (ex + 23), ey + 10, { w: 2.2, seed: seed + 1 }); } }
  // facial hair (under mouth)
  if (c.beard) shape(ctx, [[-R + 6, hy + 4], [-R + 14, hy + 36], [0, hy + R + 8], [R - 14, hy + 36], [R - 6, hy + 4], [R - 22, hy + 24], [0, hy + 34], [-R + 22, hy + 24]], { fill: c.beard, w: 3.5, seed: seed + 5 });
  // mouth
  const my = hy + 26, mw = c.lips ? '#b0383f' : COL.ink;
  const m = { w: 4.2, c: mw, seed: seed + 2, amp: 0.6 };
  ctx.beginPath();
  switch (face) {
    case 'grin': case 'laugh': {
      ctx.moveTo(-22, my - 5); ctx.quadraticCurveTo(0, my + 4, 22, my - 6); ctx.quadraticCurveTo(14, my + 22, 0, my + 22); ctx.quadraticCurveTo(-16, my + 20, -22, my - 5);
      ctx.fillStyle = '#6a1f1f'; ctx.fill(); ctx.save(); ctx.clip(); ctx.fillStyle = '#fff'; ctx.fillRect(-25, my - 10, 50, 11); ctx.restore();
      strokeStyle(ctx, { w: 4 }); ctx.stroke(); break;
    }
    case 'frown': case 'sad': case 'cry': rline(ctx, [[-16, my + 8], [0, my - 2], [16, my + 8]], m); break;
    case 'flat': case 'determined': case 'angry': rline(ctx, [[-14, my + 2], [14, my + 1]], m); break;
    case 'o': circ(ctx, 0, my + 4, 7, 8, { fill: '#6a1f1f', w: 3.5, seed }); break;
    case 'O': case 'shock': circ(ctx, 0, my + 6, 11, 14, { fill: '#6a1f1f', w: 3.5, seed }); break;
    case 'worried': rline(ctx, [[-16, my + 4], [-8, my - 1], [0, my + 4], [8, my - 1], [16, my + 4]], Object.assign({}, m, { amp: 0 })); break;
    case 'confused': rline(ctx, [[-14, my + 6], [14, my - 2]], m); break;
    case 'smirk': rline(ctx, [[-12, my + 3], [6, my + 4], [17, my - 6]], m); break;
    case 'sleep': rline(ctx, [[-8, my + 2], [8, my + 2]], m); break;
    default: rline(ctx, [[-17, my - 1], [0, my + 9], [17, my - 2]], m); // smile
  }
  if (c.mustache) shape(ctx, [[-20, my - 6], [0, my - 12], [20, my - 6], [10, my - 3], [0, my - 7], [-10, my - 3]], { fill: c.mustache, w: 3, seed: seed + 7 });
  if (face === 'cry') { ctx.fillStyle = '#7fc6f0'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * (ex + 4), ey + 18 + ((t * 40) % 30), 4, 7, 0, 0, 7); ctx.fill(); } }
  if (face === 'worried' || face === 'shock') { ctx.fillStyle = '#8fd3ff'; ctx.beginPath(); ctx.moveTo(R - 10, hy - 34); ctx.quadraticCurveTo(R, hy - 14, R - 10, hy - 10); ctx.quadraticCurveTo(R - 20, hy - 14, R - 10, hy - 34); ctx.fill(); strokeStyle(ctx, { w: 2, c: '#2b6a9b' }); ctx.stroke(); }
  ctx.restore();
}

function drawTop(ctx, c, seed) {
  const top = c.top, col = c.tc || COL.gray;
  const sy = SK.neckY, hy = SK.hipY;
  const o = { fill: col, w: 4.5, seed };
  switch (top) {
    case 'tee': case 'shirt': case 'hoodie': case 'scrubs': case 'jacket': case 'hawaii': {
      const wS = top === 'hoodie' || top === 'jacket' ? 50 : 44, wH = top === 'hoodie' ? 46 : 40;
      shape(ctx, [[-wS, sy + 22], [-18, sy + 2], [18, sy + 2], [wS, sy + 22], [wH, hy + 12], [-wH, hy + 12]], o);
      if (top === 'hoodie') { rline(ctx, [[-20, sy + 6], [0, sy + 40], [20, sy + 6]], { w: 3.5, seed }); rect(ctx, -26, hy - 50, 52, 30, { w: 3.5, seed: seed + 1 }); }
      if (top === 'scrubs') rline(ctx, [[-16, sy + 4], [0, sy + 36], [16, sy + 4]], { w: 3.5, seed });
      if (top === 'jacket') { line(ctx, 0, sy + 10, 0, hy + 10, { w: 3.5, seed }); }
      if (top === 'hawaii') { for (let i = 0; i < 6; i++) circ(ctx, -26 + (i % 3) * 26, sy + 50 + Math.floor(i / 3) * 70, 9, null, { fill: '#f6d743', w: 2.5, seed: seed + i }); }
      if (top === 'shirt') rline(ctx, [[-14, sy + 4], [0, sy + 20], [14, sy + 4]], { w: 3.5, seed });
      break;
    }
    case 'dress':
      shape(ctx, [[-34, sy + 18], [-16, sy + 2], [16, sy + 2], [34, sy + 18], [26, hy - 30], [70, hy + 70], [-70, hy + 70], [-26, hy - 30]], o);
      break;
    case 'cardigan': case 'vest': case 'blazer': case 'suit': case 'shirtTie': {
      const shirt = top === 'suit' || top === 'blazer' || top === 'shirtTie' ? '#fff' : (top === 'cardigan' ? '#f1ede2' : '#ffffff');
      shape(ctx, [[-44, sy + 22], [-18, sy + 2], [18, sy + 2], [44, sy + 22], [40, hy + 12], [-40, hy + 12]], { fill: top === 'shirtTie' ? col : shirt, w: 4.5, seed });
      if (top !== 'shirtTie') {
        shape(ctx, [[-44, sy + 22], [-18, sy + 2], [-6, sy + 70], [-8, hy + 12], [-40, hy + 12]], { fill: col, w: 4.5, seed: seed + 1 });
        shape(ctx, [[44, sy + 22], [18, sy + 2], [6, sy + 70], [8, hy + 12], [40, hy + 12]], { fill: col, w: 4.5, seed: seed + 2 });
      }
      break;
    }
    case 'bowtie': break;
  }
  const tie = c.tie || (top === 'suit' || top === 'blazer' ? null : null);
  if (tie || top === 'shirtTie') {
    const tc = tie || COL.dgreen;
    shape(ctx, [[-9, sy + 6], [9, sy + 6], [5, sy + 20], [14, sy + 120], [0, sy + 140], [-14, sy + 120], [-5, sy + 20]], { fill: tc, w: 3.5, seed: seed + 4 });
  }
  if (top === 'bowtie') { poly(ctx, [[-26, sy - 2], [0, sy + 8], [-26, sy + 20]], { fill: col, w: 3.5, seed }); poly(ctx, [[26, sy - 2], [0, sy + 8], [26, sy + 20]], { fill: col, w: 3.5, seed: seed + 1 }); circ(ctx, 0, sy + 8, 6, null, { fill: col, w: 3, seed }); }
  if (c.flagpin) { rect(ctx, 20, sy + 40, 14, 9, { fill: '#fff', w: 1.5, amp: 0 }); ctx.fillStyle = COL.red; ctx.fillRect(21, sy + 44, 12, 2); ctx.fillStyle = COL.blue; ctx.fillRect(21, sy + 41, 5, 4); }
  if (c.lanyard) { rline(ctx, [[-14, sy + 4], [0, sy + 80], [14, sy + 4]], { w: 3, c: COL.blue, seed }); rect(ctx, -12, sy + 78, 24, 30, { fill: '#fff', w: 3, seed }); }
  if (c.scarf) { shape(ctx, [[-30, sy - 2], [30, sy - 2], [28, sy + 14], [-28, sy + 14]], { fill: c.scarf, w: 3.5, seed }); rect(ctx, 8, sy + 10, 18, 60, { fill: c.scarf, w: 3.5, seed: seed + 1 }); }
}

// o: {who|look, x,y,s,t,enter, pose, face, walk, sit, flip, hold:{R:fn}, talk}
function stick(o) {
  o = Object.assign({ s: 1, enter: 'pop' }, o);
  const c = Object.assign({}, CAST[o.who] || {}, o.look || {});
  const seed = hstr(o.who || JSON.stringify(c));
  return el(o, (ctx, lt) => {
    const [pa, pb, pk] = keyAt(o.pose, lt, 'rest');
    const A = STICK_POSES[pa] || STICK_POSES.rest, B = STICK_POSES[pb] || STICK_POSES.rest, k = E.io(pk);
    const pose = { L: [lerp(A.L[0], B.L[0], k), lerp(A.L[1], B.L[1], k)], R: [lerp(A.R[0], B.R[0], k), lerp(A.R[1], B.R[1], k)], bL: B.bL, bR: B.bR, wave: B.wave };
    const [fa, fb, fk] = keyAt(o.face, lt, c.face || 'smile');
    const face = fk > 0.35 ? fb : fa;
    const walk = typeof o.walk === 'function' ? o.walk(lt) : o.walk;
    if (c.kid) ctx.scale(0.68, 0.68);
    const bob = walk ? -Math.abs(Math.sin(lt * 7.5)) * 6 : Math.sin(lt * 2.3 + seed) * 1.5;
    const jump = o.jump ? -Math.abs(Math.sin(lt * 5.5)) * 60 : 0;
    ctx.translate(0, jump);
    const lw = 5.5;
    const sw = { w: lw, seed };
    // legs
    const hip = [0, SK.hipY + bob];
    let feet;
    if (o.sit) feet = [[-30, -10], [30, -10]];
    else if (walk) { const ph = lt * 7.5; feet = [[-20 + Math.sin(ph) * 60, -Math.max(0, Math.cos(ph)) * 18], [20 + Math.sin(ph + Math.PI) * 60, -Math.max(0, Math.cos(ph + Math.PI)) * 18]]; }
    else feet = [[-46, 0], [46, 0]];
    const sitHip = o.sit ? [0, -150] : hip;
    feet.forEach((f, i) => {
      const [kn, ft] = stickIK(sitHip, f, SK.G1, SK.G2, p => (i ? p[0] : -p[0]) + (o.sit ? -p[1] * 2 : 0));
      rline(ctx, [sitHip, kn, ft], Object.assign({}, sw, { seed: seed + 20 + i, amp: 1.4 }));
      rline(ctx, [ft, [ft[0] + (i ? 16 : -16), ft[1] + 1]], { w: lw, seed: seed + 30 + i, amp: 0 });
    });
    const neck = [0, SK.neckY + bob];
    // back hair, body
    ctx.save(); ctx.translate(0, bob); drawHair(ctx, c, true, seed + 1); ctx.restore();
    if (!c.top || c.top === 'none' || c.top === 'bowtie') rline(ctx, [[neck[0], neck[1] + 4], [sitHip[0], sitHip[1]]], Object.assign({}, sw, { seed: seed + 3 }));
    else { ctx.save(); ctx.translate(0, bob + (o.sit ? 70 : 0)); drawTop(ctx, c, seed + 40); ctx.restore(); }
    if (c.top === 'none' && c.tie) { ctx.save(); ctx.translate(0, bob); drawTop(ctx, { tie: c.tie }, seed + 40); ctx.restore(); }
    // head
    ctx.save(); ctx.translate(0, bob);
    const tilt = Math.sin(lt * 1.4 + seed) * 1.5 + (face === 'confused' ? 7 : 0) + (o.tilt || 0);
    ctx.translate(0, SK.neckY); ctx.rotate(tilt * D2R); ctx.translate(0, -SK.neckY);
    circ(ctx, 0, SK.headY, SK.R, SK.R * 1.02, { fill: c.skin || COL.skin, w: 5.5, seed: seed + 5 });
    drawHair(ctx, c, false, seed + 1);
    drawFaceStick(ctx, c, o.talk && Math.sin(lt * 14) > 0 ? 'o' : face, lt, seed);
    drawHat(ctx, c, seed + 8);
    ctx.restore();
    // arms
    const sh = [0, SK.shY + bob];
    const sides = [['L', pose.L, -1], ['R', pose.R, 1]];
    const hands = {};
    for (const [side, T0, sg] of sides) {
      let T = T0;
      if (walk && !o.pose) T = [sg * 40 + Math.sin(lt * 7.5 + (sg > 0 ? Math.PI : 0)) * 50 * -1, -215];
      if (pose.wave === side) T = [T[0] + Math.sin(lt * 9) * 26, T[1]];
      const bend = side === 'L' ? pose.bL : pose.bR;
      const [e, h] = stickIK(sh, T, SK.L1, SK.L2, p => sg * p[0] + (bend ? 0 : p[1] * 1.1));
      rline(ctx, [sh, e, h], { w: lw, seed: seed + (sg > 0 ? 50 : 60), amp: 1.4 });
      hands[side] = h;
    }
    if (c.cane) { line(ctx, hands.L[0] - 4, hands.L[1], hands.L[0] - 14, 0, { w: 6, c: COL.brown, seed }); }
    if (c.briefcase) { ctx.save(); ctx.translate(hands.L[0], hands.L[1]); rect(ctx, -34, 6, 60, 44, { fill: '#6b4226', w: 4, seed }); rline(ctx, [[-14, 6], [-12, -6], [6, -6], [8, 6]], { w: 4, seed }); ctx.restore(); }
    if (o.hold) for (const side of ['L', 'R']) if (o.hold[side]) { ctx.save(); ctx.translate(hands[side][0], hands[side][1]); o.hold[side](ctx, lt); ctx.restore(); }
  });
}

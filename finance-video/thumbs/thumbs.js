// YouTube thumbnails in the channel style: serif hook top-left, a clean data chart on the right
// (tiny title, red highlight, red serif year), the mascot bottom-left. Numbers come from the script.
'use strict';
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const mascotImg = new Image();
mascotImg.src = '../assets/mascot/full.png';

const THUMBS = [
  {
    hook: ["You're Paying", 'For It.'],
    title: 'PJM capacity auction cost, year starting June 2028',
    max: 32, ticks: [0, 10, 20, 30], fmt: v => `$${v}B`,
    bars: [
      { label: 'With the price cap', value: 16.4, text: '$16.4B', color: '#b9c0c8', inner: { value: 6.3, color: '#f0a29c', text: 'data centers $6.3B' } },
      { label: 'Without the cap', value: 29.5, text: '~$30B', color: COL.red },
    ],
    year: '2028', yearAt: [1390, 330],
    source: 'Source: PJM, Monitoring Analytics',
    extra(ctx) {
      mapChar(590, 790, 0.7, { mood: 'worried', sweat: true, arm: 'point', look: [0.5, -0.4] });
      stickman('joe', 835, 1050, 0.52, 'worried', 'holdR', { prop: 'bill', a: { total: '$$$' }, s: 0.45 });
    },
  },
  {
    hook: ["They'd Rather", 'Have Nuclear.'],
    title: 'Americans who oppose one being built in their area',
    max: 80, ticks: [0, 20, 40, 60, 80], fmt: v => `${v}%`,
    bars: [
      { label: 'Nuclear power plant', value: 53, text: '53%', color: '#b9c0c8' },
      { label: 'AI data center', value: 71, text: '71%', color: COL.red },
    ],
    year: '2026', yearAt: [1390, 300],
    source: 'Source: Gallup',
    extra(ctx) {
      mapChar(605, 805, 0.74, { mood: 'angry', arm: 'up', look: [0.6, 0], hold: { prop: 'sign', a: { text: 'NO!', size: 84, w: 230, h: 140, color: COL.red }, s: 0.5, dy: -40 } });
    },
  },
  {
    hook: ['Nobody', 'Ordered This.'],
    title: "Expected peak demand growth on PJM's grid, 2024 to 2030",
    max: 32, ticks: [0, 10, 20, 30], fmt: v => `${v} GW`,
    bars: [
      { label: 'Everything else', value: 2, text: '~2 GW', color: '#b9c0c8' },
      { label: 'Data centers', value: 30, text: '~30 GW', color: COL.red },
    ],
    year: '2030', yearAt: [1390, 320],
    source: 'Source: PJM 2025 load forecast',
    extra(ctx) {
      mapChar(605, 805, 0.74, { mood: 'shocked', arm: 'point', look: [0.4, -0.6], onTop: () => { prop('dataCenter', 175, -95, 0.36); prop('partyHat', 180, -175, 0.42, 0.2); } });
    },
  },
];

function prop(name, x, y, s, rot = 0, a) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); drawProp(ctx, name, a || {}, 1.0); ctx.restore();
}
function stickman(cast, x, y, s, expr, pose, hold) {
  const c = CAST_T[cast];
  const st = { x, y, s, expr, look: [0, 0], talk: 0, blink: false, bob: 0, tilt: 0 };
  st.hands = { L: posedHand(STICK_GEO, 'L', 'rest'), R: posedHand(STICK_GEO, 'R', pose) };
  const out = drawStick(ctx, c, st, 1);
  if (hold) {
    const H = out.R.H;
    ctx.save(); ctx.translate(x + H.x * s, y + H.y * s); ctx.scale(hold.s * s, hold.s * s);
    drawProp(ctx, hold.prop, hold.a || {}, 1); ctx.restore();
  }
}
// Our own green US-map character (drawn here, in the style of the reference channel):
// green map, googly eyes, a mouth for the mood, stick arms and legs.
function mapChar(x, y, s, o = {}) {
  const pen = new Pen(ctx, 321, 1.1);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // legs + arms first so the map body overlaps their roots
  for (const [hx, dir] of [[-70, -1], [60, 1]]) pen.line([[hx, 100], [hx + dir * 6, 228], [hx + dir * 34, 232]], { lw: 8 });
  pen.line([[-285, -30], [-335, 40], [-350, 95]], { lw: 8 });
  const hand = o.arm === 'up' ? [330, -210] : o.arm === 'point' ? [390, -150] : [345, 40];
  const elbow = o.arm === 'up' ? [300, -110] : o.arm === 'point' ? [310, -90] : [300, -5];
  pen.line([[228, -40], elbow, hand], { lw: 8 });
  if (o.arm === 'point') pen.seg(hand[0], hand[1], hand[0] + 34, hand[1] - 16, { lw: 7 });
  // the map
  pen.shape(US_OUTLINE.map(([lo, la]) => mapXY(lo, la)), { fill: '#5a9a45', lw: 7, smooth: false, amp: 1.4 });
  pen.shape([[-345, 130], [-300, 112], [-262, 128], [-252, 168], [-282, 182], [-318, 176], [-350, 200], [-382, 204], [-362, 176], [-372, 150]], { fill: '#5a9a45', lw: 6, amp: 1 });
  // face
  const lk = o.look || [0, 0];
  for (const ex of [-52, 22]) {
    pen.ellipse(ex, -18, 32, 40, { fill: '#fff', lw: 6, irr: 0.04 });
    ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.arc(ex + lk[0] * 13, -14 + lk[1] * 16, 14, 0, 7); ctx.fill();
  }
  if (o.mood === 'angry') { pen.seg(-88, -78, -26, -58, { lw: 9 }); pen.seg(58, -78, -4, -58, { lw: 9 }); }
  if (o.mood === 'worried') { pen.seg(-86, -62, -30, -80, { lw: 8 }); pen.seg(56, -62, 0, -80, { lw: 8 }); }
  if (o.mood === 'worried') pen.line([[-50, 62], [-34, 52], [-18, 62], [-2, 52], [14, 62]], { lw: 7 });
  else if (o.mood === 'angry') { pen.rect(-52, 46, 72, 32, { fill: '#fff', lw: 6, r: 8 }); for (const tx of [-28, -4]) pen.seg(tx, 48, tx, 76, { lw: 3 }); pen.seg(-50, 62, 18, 62, { lw: 3 }); }
  else if (o.mood === 'shocked') pen.ellipse(-16, 64, 22, 28, { fill: '#5a1f1f', lw: 6 });
  if (o.sweat) pen.shape([[118, -120], [134, -86], [118, -70], [102, -86]], { fill: '#8fd0ff', lw: 4 });
  if (o.onTop) o.onTop();
  if (o.hold) {
    ctx.save(); ctx.translate(hand[0] + (o.hold.dx || 0), hand[1] + (o.hold.dy || 0)); ctx.rotate(o.hold.rot || 0); ctx.scale(o.hold.s, o.hold.s);
    drawProp(ctx, o.hold.prop, o.hold.a || {}, 1); ctx.restore();
  }
  ctx.restore();
}
const CAST_T = { joe: { seed: 11, skin: '#f6cfa9', hair: 'side', hairColor: '#7a4a2a', freckles: true, browsAlways: true } };

function drawThumb(T) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 1920, 1080);
  // hook
  ctx.fillStyle = '#111'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  let fs = 118;
  ctx.font = `700 ${fs}px Merriweather`;
  const widest = Math.max(...T.hook.map(l => ctx.measureText(l).width));
  if (widest > 790) fs = Math.floor(fs * 790 / widest);
  ctx.font = `700 ${fs}px Merriweather`;
  T.hook.forEach((l, i) => ctx.fillText(l, 76, 80 + fs + i * fs * 1.24));
  // chart
  const x0 = 1010, x1 = 1840, yb = 880, yt = 330, ph = yb - yt;
  ctx.font = '700 31px Inter'; ctx.fillStyle = '#1d232b';
  ctx.fillText(T.title, 940, 140);
  ctx.lineWidth = 2;
  for (const v of T.ticks) {
    const y = yb - (v / T.max) * ph;
    ctx.strokeStyle = v === 0 ? '#9aa3ad' : '#e6e8eb';
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    ctx.fillStyle = '#8a929b'; ctx.font = '600 24px Inter'; ctx.textAlign = 'right';
    ctx.fillText(T.fmt(v), x0 - 14, y + 8);
  }
  const bw = 250, centers = [x0 + (x1 - x0) * 0.27, x0 + (x1 - x0) * 0.75];
  T.bars.forEach((b, i) => {
    const cx = centers[i], h = (b.value / T.max) * ph;
    ctx.fillStyle = b.color; ctx.fillRect(cx - bw / 2, yb - h, bw, h);
    if (b.inner) {
      const hi = (b.inner.value / T.max) * ph;
      ctx.fillStyle = b.inner.color; ctx.fillRect(cx - bw / 2, yb - hi, bw, hi);
      ctx.fillStyle = '#7a1612'; ctx.font = '800 26px Inter'; ctx.textAlign = 'center';
      const [w1, w2] = b.inner.text.split(/ (?=\$)/);
      ctx.fillText(w1, cx, yb - hi / 2 - 4); ctx.fillText(w2 || '', cx, yb - hi / 2 + 28);
    }
    ctx.font = '800 52px Inter'; ctx.textAlign = 'center';
    if (b.color === COL.red) {
      ctx.fillStyle = '#fff'; ctx.fillText(b.text, cx, yb - h + 70);
      ctx.fillStyle = COL.red; ctx.font = '700 104px Merriweather'; ctx.fillText(T.year, cx, yb - h - 26);
    } else { ctx.fillStyle = '#3a4048'; ctx.fillText(b.text, cx, yb - h - 22); }
    ctx.fillStyle = '#3a4048'; ctx.font = '700 30px Inter';
    ctx.fillText(b.label, cx, yb + 44);
  });
  ctx.fillStyle = '#9aa3ad'; ctx.font = '600 20px Inter'; ctx.textAlign = 'right';
  ctx.fillText(T.source, x1, yb + 84);
  // characters: the mascot image as given (cut out of its blue background, original pose)
  if (T.extra) T.extra(ctx);
  const sx = 567, sy = 128, sw = 261, sh = 640, s = 1.06;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(mascotImg, sx, sy, sw, sh, 56, 455, sw * s, sh * s);
}

window.READY = (async () => {
  await Promise.all(['700 132px Merriweather', '700 31px Inter', '600 24px Inter', '800 52px Inter', '700 40px Kalam'].map(f => document.fonts.load(f)));
  await mascotImg.decode();
  return THUMBS.length;
})();
window.render = i => { drawThumb(THUMBS[i]); return canvas.toDataURL('image/png'); };

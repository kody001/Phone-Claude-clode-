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
      stickman('joe', 640, 1000, 0.62, 'worried', 'holdR', { prop: 'bill', a: { total: '$$$' }, s: 0.45 });
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
      prop('nuclear', 560, 900, 0.5);
      prop('check', 560, 735, 0.55);
      prop('dataCenter', 790, 960, 0.48);
      prop('xmark', 790, 935, 0.6);
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
      prop('dataCenter', 660, 940, 0.62);
      prop('partyHat', 660, 795, 0.55, 0.15);
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
  ctx.drawImage(mascotImg, sx, sy, sw, sh, 160, 455, sw * s, sh * s);
}

window.READY = (async () => {
  await Promise.all(['700 132px Merriweather', '700 31px Inter', '600 24px Inter', '800 52px Inter', '700 40px Kalam'].map(f => document.fonts.load(f)));
  await mascotImg.decode();
  return THUMBS.length;
})();
window.render = i => { drawThumb(THUMBS[i]); return canvas.toDataURL('image/png'); };

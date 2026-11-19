// Doodle props. Each prop draws around (0,0) at roughly 200 px size with a Pen; static
// props are recorded once and replayed, props with `anim` also get a per-frame overlay.
'use strict';

const PROPS = {};
function defProp(name, draw, extra = {}) { PROPS[name] = Object.assign({ draw }, extra); }

// ---------- money ----------
defProp('dollar', (p, a) => {
  p.text('$', 0, 8, { font: `700 ${a.size || 210}px Kalam`, fill: a.color || COL.green, stroke: COL.ink, lw: 12 });
});
defProp('cash', (p) => {
  p.rect(-115, -58, 230, 116, { fill: COL.cash, lw: 5, r: 6 });
  p.rect(-98, -44, 196, 88, { fill: null, stroke: COL.cashDark, lw: 3, r: 4 });
  p.ellipse(0, 0, 30, 34, { fill: '#c4e3ac', stroke: COL.cashDark, lw: 3 });
  p.text('$', 0, 4, { font: '700 54px Kalam', fill: COL.greenDark });
  for (const sx of [-1, 1]) p.text('$', sx * 75, -22, { font: '700 26px Kalam', fill: COL.greenDark });
});
defProp('cashStack', (p) => {
  for (let i = 3; i >= 0; i--) {
    const y = i * -16;
    p.rect(-110, y - 40, 220, 80, { fill: COL.cash, lw: 4.5, r: 5 });
    p.ellipse(0, y, 22, 24, { fill: '#c4e3ac', stroke: COL.cashDark, lw: 2.5 });
  }
  p.rect(-24, -96, 48, 96, { fill: '#e8d9a8', lw: 4 });
  p.text('$', 0, -70, { font: '700 34px Kalam', fill: COL.greenDark });
});
defProp('moneyBag', (p) => {
  p.shape([[-30, -70], [30, -70], [22, -52], [70, -10], [82, 50], [50, 90], [-50, 90], [-82, 50], [-70, -10], [-22, -52]], { fill: '#6f9b5a', lw: 5 });
  p.shape([[-34, -96], [-12, -78], [12, -78], [34, -96], [24, -66], [-24, -66]], { fill: '#6f9b5a', lw: 5 });
  p.seg(-30, -58, 30, -58, { lw: 6, stroke: '#3f5f33' });
  p.text('$', 0, 26, { font: '700 92px Kalam', fill: '#f2e7b1', stroke: COL.ink, lw: 6 });
});
defProp('coin', (p) => {
  p.circle(0, 0, 70, { fill: COL.gold, lw: 5 });
  p.circle(0, 0, 52, { fill: null, stroke: '#b8901a', lw: 3 });
  p.text('$', 0, 6, { font: '700 74px Kalam', fill: '#9c7a12' });
});
defProp('pctCoin', (p) => {
  p.circle(0, 0, 72, { fill: COL.orange, lw: 5 });
  p.text('%', 0, 6, { font: '700 92px Kalam', fill: '#fff', stroke: COL.ink, lw: 5 });
});
defProp('wallet', (p, a) => {
  p.rect(-110, -70, 220, 140, { fill: '#7a4a2a', lw: 5, r: 18 });
  p.rect(10, -34, 110, 68, { fill: '#8f5a35', lw: 5, r: 14 });
  p.circle(44, 0, 10, { fill: COL.gold, lw: 3 });
  if (a.cash) { p.rect(-90, -96, 150, 50, { fill: COL.cash, lw: 4 }); }
});
defProp('creditCard', (p) => {
  p.rect(-120, -76, 240, 152, { fill: COL.blue, lw: 5, r: 14 });
  p.rect(-120, -40, 240, 26, { fill: '#1d3f66', stroke: null });
  p.rect(-96, 6, 40, 30, { fill: COL.gold, lw: 3, r: 4 });
});
defProp('piggy', (p) => {
  p.ellipse(0, 0, 100, 72, { fill: COL.pink, lw: 5 });
  p.ellipse(98, 6, 22, 26, { fill: '#f6b3c6', lw: 4 });
  p.circle(92, 2, 4, { fill: COL.ink, stroke: null }); p.circle(104, 2, 4, { fill: COL.ink, stroke: null });
  p.shape([[30, -62], [56, -100], [62, -58]], { fill: COL.pink, lw: 4 });
  for (const x of [-60, -20, 30, 60]) p.rect(x - 12, 52, 24, 40, { fill: COL.pink, lw: 4 });
  p.circle(56, -24, 6, { fill: COL.ink, stroke: null });
  p.seg(-20, -72, 20, -72, { lw: 6 });
});

// ---------- buildings ----------
defProp('house', (p, a) => {
  const wall = a.wall || COL.wall, roof = a.roof || COL.roof;
  p.rect(-95, -40, 190, 140, { fill: wall, lw: 5 });
  p.rect(48, -128, 28, 60, { fill: '#9a6a4a', lw: 4 });
  p.shape([[-120, -32], [0, -130], [120, -32]], { fill: roof, lw: 5, smooth: false });
  p.rect(-24, 26, 48, 74, { fill: '#8a5a3c', lw: 4 });
  p.circle(14, 64, 4, { fill: COL.ink, stroke: null });
  for (const x of [-72, 42]) { p.rect(x, -12, 34, 32, { fill: '#bfe3f7', lw: 4 }); p.seg(x + 17, -12, x + 17, 20, { lw: 2.5 }); }
  if (a.lightOff) { p.rect(-72, -12, 34, 32, { fill: '#3b4250', lw: 4 }); p.rect(42, -12, 34, 32, { fill: '#3b4250', lw: 4 }); }
});
defProp('houseFancy', (p) => {
  p.rect(-140, -40, 280, 140, { fill: '#e9b989', lw: 5 });
  p.shape([[-160, -32], [-60, -120], [40, -32]], { fill: '#a8452f', lw: 5, smooth: false });
  p.shape([[10, -32], [90, -100], [170, -32]], { fill: '#a8452f', lw: 5, smooth: false });
  p.rect(-20, 30, 44, 70, { fill: '#6e4a33', lw: 4 });
  for (const x of [-120, -80, 60, 100]) p.rect(x, -10, 26, 34, { fill: '#bfe3f7', lw: 3.5 });
  p.circle(-160, 80, 26, { fill: COL.green, lw: 4 }); p.circle(165, 82, 24, { fill: COL.green, lw: 4 });
});
defProp('apartment', (p, a) => {
  const c = a.color || '#c97b54';
  p.rect(-80, -150, 160, 250, { fill: c, lw: 5 });
  for (let r = 0; r < 5; r++) for (let k = 0; k < 3; k++) p.rect(-60 + k * 44, -130 + r * 44, 30, 28, { fill: a.dark ? '#3b4250' : '#bfe3f7', lw: 3 });
  p.rect(-18, 60, 36, 40, { fill: '#6e4a33', lw: 4 });
});
defProp('office', (p) => {
  p.rect(-70, -160, 140, 260, { fill: COL.grey, lw: 5 });
  for (let r = 0; r < 6; r++) for (let k = 0; k < 3; k++) p.rect(-52 + k * 38, -142 + r * 40, 26, 26, { fill: '#2d3238', stroke: null });
  p.rect(-20, 70, 40, 30, { fill: '#2d3238', lw: 4 });
});
defProp('restaurant', (p, a) => {
  p.rect(-170, -90, 340, 190, { fill: '#f4e2c4', lw: 5 });
  p.shape([[-190, -90], [190, -90], [170, -40], [-170, -40]], { fill: COL.red, lw: 5, smooth: false });
  for (let i = -3; i <= 3; i++) p.seg(i * 50, -90, i * 48, -40, { lw: 3, stroke: '#fff' });
  p.rect(-150, -150, 300, 56, { fill: '#fff8e8', lw: 5, r: 10 });
  p.text(a.name || 'DINER', 0, -121, { font: '700 40px Kalam', fill: COL.redDark });
  p.rect(-30, 10, 60, 90, { fill: '#8a5a3c', lw: 4 });
  for (const x of [-140, 60]) p.rect(x, -20, 80, 60, { fill: '#bfe3f7', lw: 4 });
});
defProp('dataCenter', (p, a) => {
  const c = a.color || '#aeb7c2';
  p.rect(-210, -80, 420, 180, { fill: c, lw: 5 });
  p.rect(-210, -80, 420, 26, { fill: '#8d97a3', lw: 5 });
  for (const x of [-170, -90, -10, 70, 150]) { p.rect(x - 26, -122, 52, 42, { fill: '#d4d9de', lw: 4 }); p.circle(x, -101, 15, { fill: '#9aa3ad', lw: 3 }); p.seg(x - 12, -101, x + 12, -101, { lw: 2.5 }); p.seg(x, -113, x, -89, { lw: 2.5 }); }
  for (let k = 0; k < 6; k++) { const x = -186 + k * 60; p.rect(x, -40, 42, 120, { fill: '#2f353d', lw: 4 }); for (let r = 0; r < 5; r++) p.seg(x + 6, -26 + r * 22, x + 36, -26 + r * 22, { lw: 2, stroke: '#59626d', amp: 0.3 }); }
  if (a.label) p.text(a.label, 0, -158, { font: '700 40px Kalam', fill: COL.ink });
}, {
  anim(ctx, t, a) {
    const colors = ['#5cff7a', '#46c8ff', '#ffdc4a'];
    for (let k = 0; k < 6; k++) for (let r = 0; r < 5; r++) {
      const on = Math.sin(t * 7 + k * 1.7 + r * 2.3) > 0.1;
      if (!on) continue;
      ctx.fillStyle = colors[(k + r) % 3];
      ctx.fillRect(-186 + k * 60 + 30, -33 + r * 22, 6, 6);
    }
  },
});
defProp('serverRack', (p) => {
  p.rect(-60, -140, 120, 280, { fill: '#2f353d', lw: 5, r: 6 });
  for (let r = 0; r < 8; r++) { p.rect(-46, -124 + r * 32, 92, 22, { fill: '#454c55', lw: 2.5 }); }
}, {
  anim(ctx, t) {
    for (let r = 0; r < 8; r++) for (let k = 0; k < 3; k++) {
      if (Math.sin(t * 9 + r * 1.9 + k * 2.7) < 0) continue;
      ctx.fillStyle = ['#5cff7a', '#46c8ff', '#ffdc4a'][k]; ctx.fillRect(16 + k * 10, -117 + r * 32, 6, 6);
    }
  },
});
defProp('chip', (p, a) => {
  for (let i = -2; i <= 2; i++) { for (const s of [-1, 1]) { p.seg(i * 26, s * 70, i * 26, s * 92, { lw: 6, stroke: '#9aa3ad' }); p.seg(s * 70, i * 26, s * 92, i * 26, { lw: 6, stroke: '#9aa3ad' }); } }
  p.rect(-72, -72, 144, 144, { fill: '#2f353d', lw: 5, r: 10 });
  p.rect(-46, -46, 92, 92, { fill: '#454c55', lw: 3, r: 6 });
  p.text(a.text || 'AI', 0, 4, { font: '700 52px Kalam', fill: '#7fe0ff' });
});
defProp('chatBubble', (p, a) => {
  const w = a.w || 240, h = a.h || 130;
  p.shape(INK.rectPts(-w / 2, -h / 2, w, h, 26).concat([]), { fill: a.fill || '#fff', lw: 5 });
  p.shape([[-w * 0.25, h / 2 - 4], [-w * 0.32, h / 2 + 40], [-w * 0.08, h / 2 - 4]], { fill: a.fill || '#fff', lw: 5, smooth: false });
  p.rect(-w * 0.25 + 4, h / 2 - 9, w * 0.17 - 4, 10, { fill: a.fill || '#fff', stroke: null });
  if (a.text) p.text(a.text, 0, 4, { font: `700 ${a.size || 48}px Kalam`, fill: a.color || COL.ink });
  else for (let i = 0; i < 3; i++) p.circle(-50 + i * 50, 0, 12, { fill: COL.ink, stroke: null });
});
defProp('factory', (p) => {
  p.shape([[-170, 100], [-170, -20], [-110, -60], [-110, -20], [-50, -60], [-50, -20], [10, -60], [10, 100]], { fill: '#a8604a', lw: 5, smooth: false });
  p.rect(10, -40, 160, 140, { fill: '#8d5240', lw: 5 });
  for (const x of [60, 110]) p.rect(x - 14, -150, 28, 112, { fill: COL.grey, lw: 4 });
  for (const x of [-140, -80, -20]) p.rect(x, 20, 34, 30, { fill: '#ffd25e', lw: 3.5 });
}, {
  anim(ctx, t) { smoke(ctx, t, [[60, -160], [110, -160]]); },
});
function smoke(ctx, t, tops) {
  ctx.save();
  for (const [x, y] of tops) for (let i = 0; i < 4; i++) {
    const k = ((t * 0.45 + i / 4 + x * 0.001) % 1);
    ctx.globalAlpha = 0.75 * (1 - k);
    ctx.fillStyle = '#9aa0a6'; ctx.strokeStyle = COL.ink; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(x + Math.sin(k * 5 + i) * 10 + k * 40, y - k * 150, 18 + k * 26, 0, 7); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}
defProp('coalPlant', (p, a) => {
  p.rect(-190, -40, 260, 140, { fill: '#8f8f8f', lw: 5 });
  p.rect(70, -80, 120, 180, { fill: '#7a7a7a', lw: 5 });
  for (const x of [-140, -80]) p.rect(x - 18, -200, 36, 162, { fill: '#b7b2ac', lw: 4 });
  p.shape([[100, 100], [100, -10], [140, -40], [180, -10], [180, 100]], { fill: '#3a3a3a', lw: 4 });
  for (const x of [-170, -110, -50, 10]) p.rect(x, 0, 36, 30, { fill: a.off ? '#4a4f55' : '#ffd25e', lw: 3.5 });
  if (a.closed) { p.rect(-130, 40, 180, 50, { fill: '#fff', lw: 4 }); p.text('CLOSED', -40, 66, { font: '700 38px Kalam', fill: COL.red }); }
}, {
  anim(ctx, t, a) { if (!a.off) smoke(ctx, t, [[-140, -210], [-80, -210]]); },
});
defProp('nuclear', (p) => {
  p.shape([[-90, 100], [-62, 0], [-70, -110], [70, -110], [62, 0], [90, 100]], { fill: '#d9dde1', lw: 5 });
  p.ellipse(0, -110, 70, 14, { fill: '#c3c9cf', lw: 4 });
  p.seg(-80, 70, 80, 70, { lw: 3, stroke: '#9aa3ad' });
}, {
  anim(ctx, t) {
    ctx.save();
    for (let i = 0; i < 4; i++) { const k = (t * 0.3 + i / 4) % 1; ctx.globalAlpha = 0.9 * (1 - k); ctx.fillStyle = '#f2f4f6'; ctx.strokeStyle = '#9aa3ad'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(Math.sin(i * 2 + k * 3) * 16, -130 - k * 130, 36 + k * 30, 0, 7); ctx.fill(); ctx.stroke(); }
    ctx.restore();
  },
});
defProp('gasPlant', (p) => {
  p.rect(-170, -40, 300, 140, { fill: '#9fb0bf', lw: 5 });
  p.rect(130, -130, 46, 230, { fill: '#c0c7cf', lw: 5 });
  for (const x of [-140, -60, 20]) { p.circle(x + 25, 30, 26, { fill: '#e7ecef', lw: 4 }); }
  p.rect(-100, -76, 120, 36, { fill: '#c0c7cf', lw: 4 });
});
defProp('flame', (p, a) => {}, {
  anim(ctx, t, a) {
    const pen = new Pen(ctx, 99, 0.8);
    const f = 1 + Math.sin(t * 13) * 0.06 + Math.sin(t * 7.3) * 0.05;
    ctx.save(); ctx.scale(1, f);
    const blue = a.color !== 'orange';
    pen.shape([[0, -110], [44, -30], [52, 30], [0, 80], [-52, 30], [-44, -30]], { fill: blue ? '#4aa3ff' : COL.orange, lw: 5 });
    pen.shape([[0, -40], [24, 10], [20, 50], [0, 66], [-20, 50], [-24, 10]], { fill: blue ? '#c9ecff' : COL.yellow, lw: 3.5 });
    ctx.restore();
    if (a.burner) { pen.rect(-80, 80, 160, 26, { fill: COL.grey, lw: 4 }); }
  },
});
defProp('fire', (p) => {}, {
  anim(ctx, t) {
    const pen = new Pen(ctx, 17, 1.2);
    for (const [x, s, ph] of [[-50, 0.8, 0], [40, 0.9, 1.3], [0, 1.15, 2.1]]) {
      ctx.save(); ctx.translate(x, 60); ctx.scale(s, s * (1 + Math.sin(t * 11 + ph) * 0.08));
      pen.shape([[0, -150], [40, -80], [62, -20], [40, 20], [-40, 20], [-62, -20], [-40, -80], [-10, -60]], { fill: COL.orange, lw: 5 });
      pen.shape([[0, -80], [24, -30], [20, 10], [-20, 10], [-24, -30]], { fill: COL.yellow, lw: 3.5 });
      ctx.restore();
    }
  },
});

// ---------- grid ----------
defProp('tower', (p) => {
  const L = (pts) => p.line(pts, { lw: 4.5 });
  L([[-60, 150], [-18, -150], [18, -150], [60, 150]]);
  L([[-60, 150], [60, 150]]);
  for (let i = 0; i < 5; i++) { const y0 = 150 - i * 60, y1 = y0 - 60; const w0 = 60 - i * 8.4, w1 = 60 - (i + 1) * 8.4; L([[-w0, y0], [w1, y1]]); L([[w0, y0], [-w1, y1]]); }
  for (const [y, w] of [[-120, 90], [-70, 110]]) { L([[-w, y], [w, y]]); for (const s of [-1, 1]) { p.seg(s * w, y, s * w, y + 22, { lw: 3.5 }); } }
});
defProp('pole', (p, a) => {
  p.rect(-11, -170, 22, 330, { fill: a.old ? '#7b5e47' : '#9a6a4a', lw: 4.5 });
  p.rect(-80, -150, 160, 16, { fill: '#9a6a4a', lw: 4 });
  for (const x of [-66, 0, 66]) p.rect(x - 6, -172, 12, 22, { fill: '#e6e6e6', lw: 3 });
  p.rect(14, -100, 44, 60, { fill: '#a9b2bb', lw: 4, r: 8 });
  if (a.old) {
    for (const [x, y] of [[-6, -60], [4, 20], [-3, 90]]) p.line([[x - 8, y], [x, y + 12], [x + 6, y + 4], [x + 10, y + 18]], { lw: 2.5 });
    p.text('50+ yrs', 90, 70, { font: '700 40px Kalam', fill: COL.red });
  }
});
defProp('substation', (p) => {
  p.rect(-180, 20, 360, 80, { fill: null, stroke: '#7d858d', lw: 3 });
  for (let x = -170; x <= 170; x += 20) p.seg(x, 20, x, 100, { lw: 2, stroke: '#7d858d' });
  for (const x of [-110, 0, 110]) { p.rect(x - 40, -40, 80, 100, { fill: '#a9b2bb', lw: 4.5, r: 6 }); for (const k of [-20, 0, 20]) { p.rect(x + k - 4, -80, 8, 40, { fill: '#e6e6e6', lw: 3 }); } }
  p.line([[-170, -84], [-110, -84], [-90, -84], [0, -84], [110, -84], [170, -84]], { lw: 3 });
});
defProp('bulb', (p, a) => {
  if (a.on) for (let i = 0; i < 8; i++) { const ang = i / 8 * Math.PI * 2; p.seg(Math.cos(ang) * 92, Math.sin(ang) * 92 - 20, Math.cos(ang) * 120, Math.sin(ang) * 120 - 20, { lw: 5, stroke: COL.orange }); }
  p.shape(INK.ellipsePts(0, -24, 66, 66, { seed: 3 }).filter(q => q[1] < 20).concat([[34, 40], [-34, 40]]), { fill: a.on ? '#ffe36b' : '#e4e4e4', lw: 5 });
  p.rect(-34, 40, 68, 46, { fill: '#a9b2bb', lw: 4.5, r: 6 });
  p.seg(-34, 56, 34, 56, { lw: 3 }); p.seg(-34, 70, 34, 70, { lw: 3 });
  p.line([[-16, 30], [-10, -10], [0, 6], [10, -10], [16, 30]], { lw: 3, stroke: a.on ? COL.orange : '#888' });
});
defProp('bolt', (p, a) => {
  p.shape([[20, -120], [-60, 10], [-6, 10], [-30, 120], [62, -20], [8, -20], [40, -120]], { fill: a.color || COL.yellow, lw: 5, smooth: false });
});
defProp('outlet', (p) => {
  p.rect(-70, -100, 140, 200, { fill: '#f4f1ea', lw: 5, r: 16 });
  for (const y of [-40, 46]) { p.rect(-22, y - 22, 10, 28, { fill: COL.ink, stroke: null }); p.rect(12, y - 22, 10, 28, { fill: COL.ink, stroke: null }); p.circle(0, y + 22, 7, { fill: COL.ink, stroke: null }); }
});
defProp('meter', (p) => {
  p.circle(0, 0, 90, { fill: '#e6e9ec', lw: 5 });
  p.circle(0, 0, 70, { fill: '#fff', lw: 3 });
  p.rect(-46, 26, 92, 26, { fill: '#2f353d', lw: 3 });
  p.text('kWh', 0, -36, { font: '700 26px Kalam' });
}, {
  anim(ctx, t) {
    ctx.save(); ctx.rotate(t * 6); ctx.strokeStyle = COL.red; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -50); ctx.stroke(); ctx.restore();
    ctx.fillStyle = '#7fff8a'; ctx.font = '700 22px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(10000 + Math.floor(t * 37) % 90000).padStart(5, '0'), 0, 40);
  },
});
defProp('cloudStorm', (p) => {
  p.shape([[-120, 30], [-140, -10], [-110, -50], [-60, -60], [-30, -100], [30, -100], [70, -60], [120, -50], [140, -10], [120, 30]], { fill: '#8a939c', lw: 5 });
  p.shape([[10, 30], [-30, 100], [0, 100], [-20, 160], [40, 80], [10, 80], [30, 30]], { fill: COL.yellow, lw: 4, smooth: false });
});
defProp('sun', (p) => {
  for (let i = 0; i < 10; i++) { const ang = i / 10 * Math.PI * 2; p.seg(Math.cos(ang) * 72, Math.sin(ang) * 72, Math.cos(ang) * 104, Math.sin(ang) * 104, { lw: 7, stroke: COL.orange }); }
  p.circle(0, 0, 60, { fill: COL.yellow, lw: 5 });
});
defProp('snowflake', (p) => {
  for (let i = 0; i < 3; i++) { const ang = i / 3 * Math.PI; const c = Math.cos(ang), s = Math.sin(ang); p.seg(-c * 90, -s * 90, c * 90, s * 90, { lw: 8, stroke: '#4aa3ff' });
    for (const sg of [-1, 1]) for (const d of [50, -50]) { const x = c * d * sg, y = s * d * sg; p.seg(x, y, x + Math.cos(ang + 0.7) * 26 * sg, y + Math.sin(ang + 0.7) * 26 * sg, { lw: 6, stroke: '#4aa3ff' }); } }
});
defProp('acUnit', (p) => {
  p.rect(-110, -80, 220, 160, { fill: '#dfe4e8', lw: 5, r: 10 });
  p.circle(-20, 0, 58, { fill: '#c3c9cf', lw: 4 });
  for (let x = 54; x <= 90; x += 12) p.seg(x, -60, x, 60, { lw: 3 });
}, {
  anim(ctx, t) { ctx.save(); ctx.translate(-20, 0); ctx.rotate(t * 12); ctx.fillStyle = '#7d858d'; for (let i = 0; i < 3; i++) { ctx.rotate(Math.PI * 2 / 3); ctx.beginPath(); ctx.ellipse(0, -24, 12, 24, 0, 0, 7); ctx.fill(); } ctx.restore(); },
});
defProp('thermometer', (p, a) => {
  p.rect(-20, -120, 40, 180, { fill: '#fff', lw: 5, r: 20 });
  p.circle(0, 80, 38, { fill: a.cold ? '#4aa3ff' : COL.red, lw: 5 });
  p.rect(-8, a.cold ? 20 : -100, 16, a.cold ? 50 : 170, { fill: a.cold ? '#4aa3ff' : COL.red, stroke: null });
});

// ---------- documents ----------
defProp('bill', (p, a) => {
  const w = a.w || 300, h = a.h || 380, x0 = -w / 2, y0 = -h / 2;
  if (a.receipt) {
    const pts = [[x0, y0], [x0 + w, y0]];
    const n = 10; for (let i = 0; i <= n; i++) pts.push([x0 + w - (w * i) / n, y0 + h + (i % 2 ? -14 : 0)]);
    p.shape(pts, { fill: '#fffdf6', lw: 4.5, smooth: false });
  } else {
    p.rect(x0, y0, w, h, { fill: '#fff', lw: 4.5, r: 6 });
    p.rect(x0, y0, w, 64, { fill: a.color || COL.blue, lw: 4.5, r: 6 });
  }
  p.text(a.title || 'ELECTRIC BILL', 0, y0 + 34, { font: `700 ${a.titleSize || 36}px Kalam`, fill: a.receipt ? COL.ink : '#fff' });
  let y = y0 + 100;
  for (const it of (a.items || [])) {
    p.text(it[0], x0 + 22, y, { font: `700 ${a.itemSize || 28}px Kalam`, align: 'left', fill: it[2] || COL.ink });
    if (it[1]) p.text(it[1], x0 + w - 22, y, { font: `700 ${a.itemSize || 28}px Kalam`, align: 'right', fill: it[2] || COL.ink });
    y += a.gap || 46;
  }
  if (!a.items) for (let i = 0; i < 4; i++) { p.seg(x0 + 22, y, x0 + w - 70, y, { lw: 3.5, stroke: '#9aa3ad' }); p.seg(x0 + w - 60, y, x0 + w - 22, y, { lw: 3.5, stroke: '#9aa3ad' }); y += 40; }
  if (a.total) {
    p.seg(x0 + 16, y - 16, x0 + w - 16, y - 16, { lw: 3 });
    p.text('TOTAL', x0 + 22, y + 14, { font: '700 32px Kalam', align: 'left' });
    p.text(a.total, x0 + w - 22, y + 14, { font: '700 36px Kalam', align: 'right', fill: a.totalColor || COL.red });
  }
});
defProp('paper', (p, a) => {
  const w = a.w || 220, h = a.h || 280;
  p.shape([[-w / 2, -h / 2], [w / 2 - 40, -h / 2], [w / 2, -h / 2 + 40], [w / 2, h / 2], [-w / 2, h / 2]], { fill: a.fill || '#fff', lw: 4.5, smooth: false });
  p.shape([[w / 2 - 40, -h / 2], [w / 2 - 40, -h / 2 + 40], [w / 2, -h / 2 + 40]], { fill: '#e9e9e9', lw: 3.5, smooth: false });
  if (a.title) p.text(a.title, 0, -h / 2 + 50, { font: `700 ${a.size || 40}px Kalam`, fill: a.titleColor || COL.ink });
  for (let i = 0; i < (a.lines == null ? 4 : a.lines); i++) p.line([[-w / 2 + 24, -h / 2 + 100 + i * 34], [-w / 2 + 70, -h / 2 + 96 + i * 34], [w / 2 - 40, -h / 2 + 102 + i * 34]], { lw: 3, stroke: '#7d858d' });
  if (a.sign) p.line([[-w / 2 + 30, h / 2 - 40], [-w / 2 + 50, h / 2 - 60], [-w / 2 + 70, h / 2 - 35], [-w / 2 + 95, h / 2 - 62], [-w / 2 + 120, h / 2 - 38]], { lw: 3.5, stroke: COL.blue });
  if (a.stamp) { p.rect(-w / 2 + 14, -10, w - 28, 66, { fill: null, stroke: COL.red, lw: 6, r: 6 }); p.text(a.stamp, 0, 24, { font: `700 ${a.stampSize || 40}px Kalam`, fill: COL.red, rot: -0.08 }); }
});
defProp('calendar', (p, a) => {
  p.rect(-110, -100, 220, 210, { fill: '#fff', lw: 5, r: 10 });
  p.rect(-110, -100, 220, 56, { fill: COL.red, lw: 5, r: 10 });
  for (const x of [-60, 60]) p.rect(x - 7, -122, 14, 40, { fill: COL.greyDark, lw: 3, r: 6 });
  p.text(a.top || '', 0, -70, { font: '700 32px Kalam', fill: '#fff' });
  p.text(a.text || '', 0, 30, { font: `700 ${a.size || 64}px Kalam`, fill: COL.ink });
});
defProp('clock', (p) => {
  p.circle(0, 0, 90, { fill: '#fff', lw: 6 });
  for (let i = 0; i < 12; i++) { const ang = i / 12 * Math.PI * 2; p.seg(Math.cos(ang) * 72, Math.sin(ang) * 72, Math.cos(ang) * 82, Math.sin(ang) * 82, { lw: 4 }); }
}, {
  anim(ctx, t) {
    ctx.strokeStyle = COL.ink; ctx.lineCap = 'round';
    ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(t * 0.5 - 1.57) * 44, Math.sin(t * 0.5 - 1.57) * 44); ctx.stroke();
    ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(t * 4 - 1.57) * 64, Math.sin(t * 4 - 1.57) * 64); ctx.stroke();
  },
});
defProp('hourglass', (p) => {
  p.rect(-80, -120, 160, 20, { fill: '#8a5a3c', lw: 4 }); p.rect(-80, 100, 160, 20, { fill: '#8a5a3c', lw: 4 });
  p.shape([[-60, -100], [60, -100], [10, 0], [60, 100], [-60, 100], [-10, 0]], { fill: '#e8f4ff', lw: 4.5 });
  p.shape([[-40, 100], [40, 100], [0, 50]], { fill: COL.gold, stroke: null });
  p.shape([[-36, -80], [36, -80], [6, -10], [-6, -10]], { fill: COL.gold, stroke: null });
});
defProp('gavel', (p) => {
  p.rect(-20, -20, 200, 30, { fill: '#9a6a4a', lw: 5, r: 8 });
  p.rect(-110, -80, 90, 150, { fill: '#7a4a2a', lw: 5, r: 14 });
  p.rect(-140, 110, 160, 34, { fill: '#7a4a2a', lw: 5, r: 8 });
});
defProp('magnifier', (p) => {
  p.seg(52, 52, 130, 130, { lw: 18, stroke: '#7a4a2a' });
  p.circle(0, 0, 76, { fill: 'rgba(200,235,255,0.55)', lw: 9 });
});
defProp('lawScroll', (p, a) => {
  p.rect(-120, -150, 240, 300, { fill: '#fff8e1', lw: 5 });
  p.rect(-140, -170, 280, 36, { fill: '#e8d6a6', lw: 5, r: 16 }); p.rect(-140, 134, 280, 36, { fill: '#e8d6a6', lw: 5, r: 16 });
  p.text(a.title || 'LAW', 0, -96, { font: '700 46px Kalam' });
  for (let i = 0; i < 4; i++) p.seg(-90, -40 + i * 34, 90, -40 + i * 34, { lw: 3, stroke: '#9a8a6a' });
  p.circle(70, 104, 26, { fill: COL.red, lw: 4 });
});
defProp('contract', (p, a) => {
  p.rect(-110, -140, 220, 280, { fill: '#fff', lw: 5 });
  p.text(a.title || 'CONTRACT', 0, -100, { font: '700 36px Kalam' });
  for (let i = 0; i < 4; i++) p.seg(-80, -50 + i * 32, 80, -50 + i * 32, { lw: 3, stroke: '#9aa3ad' });
  p.line([[-80, 100], [-60, 80], [-40, 104], [-14, 78], [16, 100]], { lw: 3.5, stroke: COL.blue });
  if (a.years) p.text(a.years, 0, 160, { font: '700 40px Kalam', fill: COL.red });
});
defProp('phone', (p, a) => {
  p.rect(-80, -150, 160, 300, { fill: '#2f353d', lw: 5, r: 22 });
  p.rect(-66, -128, 132, 250, { fill: a.screen || '#f4f7fb', stroke: null, r: 10 });
  if (a.request) {
    p.rect(-60, -80, 120, 150, { fill: '#fff', lw: 3, r: 10 });
    p.text('Split request', 0, -56, { font: '700 20px Inter', fill: COL.greyDark });
    p.text(a.request, 0, -6, { font: '800 38px Inter', fill: COL.ink });
    p.rect(-46, 26, 92, 32, { fill: COL.blue, stroke: null, r: 8 });
    p.text('PAY', 0, 43, { font: '800 20px Inter', fill: '#fff' });
  }
});
defProp('laptop', (p, a) => {
  p.rect(-120, -110, 240, 160, { fill: '#2f353d', lw: 5, r: 10 });
  p.rect(-106, -96, 212, 132, { fill: a.screen || '#e9f3ff', stroke: null });
  p.shape([[-150, 50], [150, 50], [170, 80], [-170, 80]], { fill: '#9aa3ad', lw: 5, smooth: false });
  if (a.text) p.text(a.text, 0, -30, { font: `700 ${a.size || 34}px Kalam`, fill: COL.ink });
});

// ---------- restaurant ----------
defProp('table', (p, a) => {
  p.seg(0, 0, 0, 120, { lw: 8 }); p.seg(-50, 120, 50, 120, { lw: 7 });
  p.shape([[-150, -10], [150, -10], [160, 50], [-160, 50]], { fill: a.cloth || '#fff', lw: 5 });
  p.ellipse(0, -10, 150, 22, { fill: a.cloth || '#fff', lw: 5 });
  if (a.set) {
    for (const x of [-80, 70]) { p.ellipse(x, -14, 38, 9, { fill: '#f4f4f4', lw: 3 }); p.shape([[x + 40, -50], [x + 58, -50], [x + 55, -14], [x + 43, -14]], { fill: '#d9f0ff', lw: 3, smooth: false }); }
    p.shape([[-14, -40], [14, -40], [6, -14], [-6, -14]], { fill: COL.red, lw: 3, smooth: false });
  }
  if (a.reserved) { p.shape([[-40, -18], [40, -18], [30, -64], [-30, -64]], { fill: '#fff8e1', lw: 3.5, smooth: false }); p.text('RESERVED', 0, -40, { font: '700 15px Inter', fill: COL.redDark }); }
});
defProp('chair', (p) => {
  p.rect(-40, -10, 80, 16, { fill: '#9a6a4a', lw: 4 });
  p.seg(34, -10, 40, -110, { lw: 7, stroke: '#7a4a2a' }); p.seg(-34, 6, -38, 80, { lw: 6, stroke: '#7a4a2a' }); p.seg(34, 6, 38, 80, { lw: 6, stroke: '#7a4a2a' });
  p.rect(26, -110, 22, 70, { fill: '#9a6a4a', lw: 4 });
});
defProp('burger', (p) => {
  p.shape(INK.ellipsePts(0, -10, 100, 70, { seed: 2 }).filter(q => q[1] < -12), { fill: '#e2a14a', lw: 5 });
  p.shape([[-108, 0], [-80, 14], [-50, 2], [-20, 14], [10, 2], [40, 14], [70, 2], [108, 12], [100, -16], [-100, -16]], { fill: '#5fb84a', lw: 4 });
  p.rect(-104, 4, 208, 30, { fill: '#6b3b22', lw: 5, r: 14 });
  p.shape([[-98, 4], [98, 4], [70, 22], [40, 8], [-20, 20], [-60, 6]], { fill: COL.yellow, lw: 3.5 });
  p.rect(-96, 34, 192, 30, { fill: '#e2a14a', lw: 5, r: 14 });
  for (const [x, y] of [[-40, -52], [0, -60], [36, -48], [-10, -36], [60, -30]]) p.ellipse(x, y, 5, 3, { fill: '#fff5d6', stroke: null });
});
defProp('glass', (p) => {
  p.shape([[-30, -60], [30, -60], [24, 60], [-24, 60]], { fill: '#e6f6ff', lw: 4.5, smooth: false });
  p.shape([[-27, -30], [27, -30], [24, 56], [-24, 56]], { fill: '#bfe3f7', stroke: null, smooth: false });
});
defProp('partyHat', (p) => {
  p.shape([[-50, 70], [0, -90], [50, 70]], { fill: COL.purple, lw: 5, smooth: false });
  for (let i = 0; i < 3; i++) { const y = -40 + i * 40; p.seg(-14 - i * 12, y, 14 + i * 12, y + 10, { lw: 6, stroke: COL.yellow }); }
  p.circle(0, -94, 16, { fill: COL.yellow, lw: 4 });
});
defProp('balloon', (p, a) => {
  p.line([[0, 70], [10, 120], [-6, 170], [6, 220]], { lw: 3 });
  p.ellipse(0, 0, 54, 66, { fill: a.color || COL.red, lw: 5 });
  p.shape([[-8, 64], [8, 64], [0, 76]], { fill: a.color || COL.red, lw: 3 });
  p.ellipse(-18, -24, 10, 16, { fill: 'rgba(255,255,255,0.6)', stroke: null });
});
defProp('plate', (p) => {
  p.ellipse(0, 0, 110, 30, { fill: '#fafafa', lw: 5 });
  p.ellipse(0, 0, 70, 18, { fill: null, stroke: '#c9ced3', lw: 3 });
  p.seg(-150, -20, -150, 30, { lw: 6, stroke: '#9aa3ad' }); p.seg(150, -20, 150, 30, { lw: 6, stroke: '#9aa3ad' });
});
defProp('sign', (p, a) => {
  const w = a.w || 300, h = a.h || 170;
  p.seg(0, h / 2, 0, h / 2 + 160, { lw: 8, stroke: '#7a4a2a' });
  p.rect(-w / 2, -h / 2, w, h, { fill: a.fill || '#fff', lw: 5 });
  p.text(a.text || '', 0, 4, { font: `700 ${a.size || 52}px Kalam`, fill: a.color || COL.ink });
});

// ---------- home life ----------
defProp('fridge', (p, a) => {
  p.rect(-90, -180, 180, 360, { fill: '#e6ecf0', lw: 5, r: 14 });
  p.seg(-90, -60, 90, -60, { lw: 4 });
  p.rect(54, -150, 12, 60, { fill: '#9aa3ad', lw: 3 }); p.rect(54, -30, 12, 80, { fill: '#9aa3ad', lw: 3 });
  if (a.empty) { p.text('?', 0, 60, { font: '700 90px Kalam', fill: '#9aa3ad' }); }
});
defProp('groceries', (p) => {
  p.circle(-30, -100, 24, { fill: COL.red, lw: 4 }); p.rect(10, -150, 40, 80, { fill: '#fff', lw: 4 }); p.ellipse(-60, -86, 18, 40, { fill: '#f3c34a', lw: 4 });
  p.shape([[-90, -80], [90, -80], [76, 100], [-76, 100]], { fill: '#c99a62', lw: 5 });
  p.shape([[-90, -80], [90, -80], [86, -56], [-86, -56]], { fill: '#b8874f', lw: 4 });
});
defProp('family', (p) => {});
defProp('candle', (p) => {
  p.rect(-24, -40, 48, 120, { fill: '#fff8e1', lw: 5, r: 6 });
  p.seg(0, -40, 0, -56, { lw: 3 });
}, {
  anim(ctx, t) { const f = 1 + Math.sin(t * 15) * 0.1; ctx.save(); ctx.translate(0, -70); ctx.scale(1, f); ctx.fillStyle = COL.orange; ctx.beginPath(); ctx.ellipse(0, 0, 12, 22, 0, 0, 7); ctx.fill(); ctx.fillStyle = COL.yellow; ctx.beginPath(); ctx.ellipse(0, 6, 6, 12, 0, 0, 7); ctx.fill(); ctx.restore(); },
});
defProp('car', (p, a) => {
  const c = a.color || COL.blue;
  if (a.wreck) {
    p.shape([[-170, 40], [-150, -10], [-80, -30], [-40, -80], [60, -60], [110, 0], [170, 10], [160, 50]], { fill: '#8d7a6a', lw: 5 });
    for (const x of [-100, 100]) p.ellipse(x, 60, 34, 22, { fill: '#2f353d', lw: 4 });
    for (const [x, y] of [[-40, -10], [40, 10], [100, 30]]) p.circle(x, y, 10, { fill: '#a0522d', stroke: null });
    p.line([[-30, -70], [-10, -40], [10, -66]], { lw: 3 });
    return;
  }
  p.shape([[-170, 40], [-170, -10], [-110, -20], [-60, -80], [60, -80], [110, -20], [170, -10], [170, 40]], { fill: c, lw: 5 });
  p.shape([[-50, -70], [-10, -70], [-10, -24], [-90, -24]], { fill: '#bfe3f7', lw: 4, smooth: false });
  p.shape([[10, -70], [52, -70], [90, -24], [10, -24]], { fill: '#bfe3f7', lw: 4, smooth: false });
  for (const x of [-100, 100]) { p.circle(x, 44, 34, { fill: '#2f353d', lw: 4 }); p.circle(x, 44, 14, { fill: '#c9ced3', lw: 3 }); }
});
defProp('domino', (p, a) => {
  p.rect(-36, -90, 72, 180, { fill: '#fafafa', lw: 5, r: 10 });
  p.seg(-30, 0, 30, 0, { lw: 4 });
  for (const [x, y] of a.dots || [[0, -45], [0, 45], [-16, 30], [16, 60]]) p.circle(x, y, 7, { fill: COL.ink, stroke: null });
  if (a.label) p.text(a.label, 0, -130, { font: '700 30px Kalam', fill: COL.ink });
});
defProp('bubble', (p) => {
  p.circle(0, 0, 110, { fill: 'rgba(170,220,240,0.45)', stroke: '#5aa7c8', lw: 5 });
  p.line(INK.quad([-70, -40], [-60, -76], [-26, -88]), { lw: 8, stroke: 'rgba(255,255,255,0.9)' });
});
defProp('fiberCoil', (p) => {
  for (let i = 0; i < 7; i++) p.ellipse(0, 0, 120 - i * 8, 70 - i * 5, { fill: i === 0 ? '#ffb347' : null, stroke: i % 2 ? '#e07b00' : '#ffb347', lw: 7 });
  p.ellipse(0, 0, 50, 26, { fill: '#fff', lw: 4 });
});
defProp('darkFiber', (p) => {
  p.rect(-300, -120, 600, 40, { fill: '#6d747c', lw: 5 });
  for (const x of [-220, -80, 60, 200]) p.seg(x, -100, x + 50, -100, { lw: 5, stroke: '#ffd94a' });
  p.rect(-300, -80, 600, 230, { fill: '#8a5a3c', lw: 5 });
  for (let i = 0; i < 5; i++) p.line([[-290, 0 + i * 26], [-150, 6 + i * 26], [0, -4 + i * 26], [150, 8 + i * 26], [290, 0 + i * 26]], { lw: 8, stroke: '#2a2a2a' });
  for (const [x, y] of [[-200, 110], [120, 120], [240, 40]]) p.ellipse(x, y, 20, 12, { fill: '#a87a5a', lw: 3 });
});
defProp('whiteHouse', (p) => {
  p.rect(-230, -40, 460, 140, { fill: '#fafafa', lw: 5 });
  p.shape([[-80, -40], [0, -100], [80, -40]], { fill: '#fafafa', lw: 5, smooth: false });
  for (let x = -60; x <= 60; x += 30) p.rect(x - 6, -36, 12, 136, { fill: '#e8e8e8', lw: 3 });
  for (const x of [-200, -150, 120, 170]) { p.rect(x, -10, 30, 40, { fill: '#bfe3f7', lw: 3 }); p.rect(x, 50, 30, 40, { fill: '#bfe3f7', lw: 3 }); }
  p.seg(0, -100, 0, -170, { lw: 4 }); p.rect(0, -170, 54, 34, { fill: COL.red, lw: 3 });
  p.rect(0, -170, 22, 16, { fill: COL.blue, stroke: null });
});
defProp('podium', (p, a) => {
  p.shape([[-90, -60], [90, -60], [70, 140], [-70, 140]], { fill: '#8a5a3c', lw: 5, smooth: false });
  p.rect(-110, -84, 220, 30, { fill: '#7a4a2a', lw: 5, r: 6 });
  p.seg(30, -84, 50, -140, { lw: 4 }); p.ellipse(54, -150, 12, 16, { fill: '#2f353d', lw: 3 });
  if (a.text) p.text(a.text, 0, 30, { font: '700 40px Kalam', fill: '#fff' });
});
defProp('guardrail', (p) => {
  for (const x of [-220, -80, 60, 200]) p.rect(x - 10, -40, 20, 130, { fill: '#9aa3ad', lw: 4 });
  p.rect(-260, -50, 520, 50, { fill: '#c9ced3', lw: 5, r: 10 });
  p.seg(-250, -25, 250, -25, { lw: 3, stroke: '#7d858d' });
});
defProp('ballotBox', (p) => {
  p.rect(-110, -60, 220, 170, { fill: '#e6ecf0', lw: 5, r: 8 });
  p.rect(-60, -66, 120, 14, { fill: COL.ink, stroke: null });
  p.rect(-40, -150, 80, 100, { fill: '#fff', lw: 4 });
  p.line([[-20, -110], [-6, -94], [20, -130]], { lw: 5, stroke: COL.green });
  p.text('VOTE', 0, 40, { font: '700 52px Kalam', fill: COL.blue });
});
defProp('lock', (p) => {
  p.line(INK.quad([-50, -10], [-50, -110], [0, -110]).concat(INK.quad([0, -110], [50, -110], [50, -10]).slice(1)), { lw: 18, stroke: '#9aa3ad' });
  p.rect(-80, -20, 160, 130, { fill: COL.gold, lw: 5, r: 12 });
  p.circle(0, 30, 14, { fill: COL.ink, stroke: null }); p.rect(-5, 30, 10, 36, { fill: COL.ink, stroke: null });
});
defProp('wrench', (p) => {
  p.rect(-130, -14, 220, 28, { fill: '#9aa3ad', lw: 5, r: 12 });
  p.shape([[90, -40], [140, -40], [150, -10], [124, -10], [124, 10], [150, 10], [140, 40], [90, 40]], { fill: '#9aa3ad', lw: 5, smooth: false });
});
defProp('cobweb', (p) => {
  for (let i = 0; i < 5; i++) { const ang = i / 4 * Math.PI / 2; p.seg(0, 0, Math.cos(ang) * 120, Math.sin(ang) * 120, { lw: 2, stroke: '#888' }); }
  for (const r of [40, 70, 100]) { const pts = []; for (let i = 0; i <= 4; i++) { const ang = i / 4 * Math.PI / 2; pts.push([Math.cos(ang) * r * 0.9, Math.sin(ang) * r * 0.9]); } p.line(pts, { lw: 2, stroke: '#888' }); }
});
defProp('question', (p, a) => { p.text('?', 0, 0, { font: `700 ${a.size || 160}px Kalam`, fill: a.color || COL.ink, stroke: '#fff', lw: 8 }); });
defProp('exclaim', (p, a) => { p.text('!', 0, 0, { font: `700 ${a.size || 160}px Kalam`, fill: a.color || COL.red, stroke: '#fff', lw: 8 }); });
defProp('check', (p) => { p.line([[-70, 0], [-20, 56], [80, -70]], { lw: 22, stroke: COL.green }); });
defProp('xmark', (p) => { p.seg(-70, -70, 70, 70, { lw: 20, stroke: COL.red }); p.seg(70, -70, -70, 70, { lw: 20, stroke: COL.red }); });
defProp('pin', (p, a) => {
  p.shape([[0, 60], [-34, 0], [-40, -36], [-20, -64], [20, -64], [40, -36], [34, 0]], { fill: a.color || COL.red, lw: 4.5 });
  p.circle(0, -30, 14, { fill: '#fff', lw: 3 });
});
defProp('crowd', (p, a) => {
  const n = a.n || 9;
  const r = U.rng(a.seed || 5);
  for (let i = 0; i < n; i++) {
    const x = (i - (n - 1) / 2) * (a.gap || 48) + (r() - 0.5) * 10, y = (i % 2) * 18;
    p.circle(x, y - 70, 20, { fill: U.pick(r, SKINS), lw: 3.5 });
    p.seg(x, y - 50, x, y + 10, { lw: 4 }); p.seg(x, y + 10, x - 12, y + 44, { lw: 4 }); p.seg(x, y + 10, x + 12, y + 44, { lw: 4 });
    p.seg(x, y - 36, x - 18, y - 6, { lw: 4 }); p.seg(x, y - 36, x + 18, y - 6, { lw: 4 });
    if (a.hats) p.shape([[x - 12, y - 86], [x, y - 120], [x + 12, y - 86]], { fill: [COL.purple, COL.orange, COL.blue, COL.pink][i % 4], lw: 3, smooth: false });
  }
});
defProp('cake', (p) => {
  p.rect(-110, -20, 220, 110, { fill: '#f6d6e0', lw: 5, r: 8 });
  p.line([[-110, 10], [-80, 30], [-50, 10], [-20, 30], [10, 10], [40, 30], [70, 10], [110, 30]], { lw: 5, stroke: '#fff' });
  for (const x of [-60, 0, 60]) { p.rect(x - 6, -70, 12, 50, { fill: COL.blueLight, lw: 3 }); p.ellipse(x, -82, 6, 12, { fill: COL.orange, stroke: null }); }
});
defProp('confetti', (p) => {}, {
  anim(ctx, t, a) {
    const r = U.rng(7); const cols = [COL.red, COL.blue, COL.yellow, COL.green, COL.purple, COL.orange];
    for (let i = 0; i < 40; i++) { const x = (r() - 0.5) * (a.w || 700), sp = 80 + r() * 120, y = -300 + ((r() * 600 + t * sp) % 600); ctx.save(); ctx.translate(x + Math.sin(t * 2 + i) * 20, y); ctx.rotate(t * 3 + i); ctx.fillStyle = cols[i % 6]; ctx.fillRect(-7, -4, 14, 8); ctx.restore(); }
  },
});
defProp('usMap', (p, a) => {
  const P = ([lon, lat]) => [(lon + 96) * 0.79 * 14, (38.5 - lat) * 14];
  p.shape(US_OUTLINE.map(P), { fill: a.fill || '#cfe8c2', lw: 5, smooth: false, amp: 1.2 });
  if (a.pjm) p.shape(PJM_REGION.map(P), { fill: a.pjmFill || 'rgba(240,138,36,0.85)', lw: 4, smooth: true, amp: 1.2 });
  if (a.pjm && a.pjmLabel !== false) p.text('PJM', P([-80.6, 39.4])[0], P([-80.6, 39.4])[1], { font: '700 34px Kalam', fill: '#fff', stroke: COL.ink, lw: 6 });
});
const US_OUTLINE = [[-124.7, 48.4], [-124.0, 46.3], [-124.1, 43.0], [-124.4, 42.0], [-123.8, 39.8], [-122.5, 37.8], [-121.9, 36.6], [-120.6, 34.6], [-118.5, 34.0], [-117.1, 32.5], [-114.7, 32.7], [-111.0, 31.3], [-108.2, 31.3], [-106.5, 31.8], [-104.5, 29.6], [-103.0, 29.0], [-101.4, 29.8], [-99.5, 27.5], [-97.4, 25.9], [-97.4, 27.8], [-95.0, 29.3], [-93.8, 29.7], [-91.0, 29.2], [-89.4, 29.0], [-89.6, 30.2], [-88.0, 30.7], [-86.5, 30.4], [-85.0, 29.6], [-83.0, 29.0], [-82.6, 27.5], [-81.8, 26.1], [-80.9, 25.1], [-80.1, 25.8], [-80.0, 26.7], [-80.6, 28.4], [-81.3, 30.3], [-81.1, 31.9], [-79.2, 33.2], [-77.9, 33.9], [-75.5, 35.2], [-76.0, 36.9], [-75.0, 38.5], [-74.0, 39.8], [-74.0, 40.6], [-72.0, 41.0], [-70.0, 41.6], [-70.6, 43.1], [-70.0, 43.8], [-68.0, 44.4], [-67.0, 44.8], [-67.8, 47.1], [-69.2, 47.4], [-71.5, 45.0], [-74.9, 45.0], [-76.5, 44.2], [-79.0, 43.3], [-79.8, 42.2], [-82.5, 41.7], [-83.1, 42.0], [-82.4, 43.0], [-82.5, 45.3], [-84.6, 45.9], [-84.4, 46.5], [-88.0, 48.0], [-89.6, 48.0], [-95.2, 49.0], [-123.0, 49.0], [-122.8, 48.0]];
const PJM_REGION = [[-74.0, 40.5], [-74.0, 39.4], [-75.5, 38.4], [-76.0, 36.6], [-77.5, 36.0], [-81.5, 36.4], [-83.5, 36.6], [-85.0, 36.6], [-87.5, 37.5], [-88.5, 39.0], [-89.5, 41.5], [-88.3, 42.4], [-87.5, 42.4], [-86.5, 41.7], [-84.8, 41.7], [-83.5, 41.7], [-82.5, 41.6], [-80.5, 42.0], [-79.8, 42.0], [-75.3, 42.0], [-75.0, 41.4], [-74.7, 41.3], [-74.0, 41.0]];
function mapXY(lon, lat) { return [(lon + 96) * 0.79 * 14, (38.5 - lat) * 14]; }

// draw a prop at the current transform
function drawProp(ctx, name, args, t, seed) {
  const P = PROPS[name];
  if (!P) { ctx.fillStyle = 'magenta'; ctx.fillRect(-40, -40, 80, 80); return; }
  const key = name + '|' + JSON.stringify(args || {}) + '|' + (seed || 0);
  const ops = sprite(key, U.hash(key), pen => P.draw(pen, args || {}));
  Pen.replay(ctx, ops);
  if (P.anim) P.anim(ctx, t, args || {});
}

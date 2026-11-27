/* Three YouTube thumbnails (1280x720) in the clean "headline + chart + big
   character" style, using the channel mascot. usage: node tools/thumbs.js <outDir> */
const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
const fs = require('fs'); const path = require('path');
const E = require('../src/engine.js'); const C = require('../src/characters.js'); const P = require('../src/props.js');
const { loadAssets, ROOT } = require('../src/assets.js');

const RED = '#e0242b', GRAY = '#b9b9b9', INK = '#111111';
const SERIF = 'Libre Baskerville';

function headline(ctx, lines, x, y, size, align = 'left') {
  ctx.save(); ctx.fillStyle = INK; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  ctx.font = `bold ${size}px "${SERIF}"`;
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * size * 1.18));
  ctx.restore();
}
function small(ctx, str, x, y, size, color = '#222', align = 'left', bold = false) {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle';
  ctx.font = `${bold ? 'bold ' : ''}${size}px "${SERIF}"`; ctx.fillText(str, x, y); ctx.restore();
}

// clean line chart like a news graphic: thin grid, gray + red lines, red year tag
function lineChart(ctx, o) {
  const { x, y, w, h } = o;
  small(ctx, o.title, x, y - 28, 30);
  ctx.save();
  ctx.strokeStyle = '#ececec'; ctx.lineWidth = 2;
  for (let i = 0; i <= 4; i++) { const yy = y + (h * i) / 4; ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + w, yy); ctx.stroke(); }
  ctx.strokeStyle = '#9a9a9a'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x + w, y + h); ctx.stroke();
  const pts = (d) => d.map((v, i) => [x + (w * i) / (d.length - 1), y + h - (h * (v - o.min)) / (o.max - o.min)]);
  for (const s of o.series) {
    const p = pts(s.data);
    if (s.fill) {
      ctx.beginPath(); ctx.moveTo(p[s.fillFrom][0], y + h);
      for (let i = s.fillFrom; i < p.length; i++) ctx.lineTo(p[i][0], p[i][1]);
      ctx.lineTo(p[p.length - 1][0], y + h); ctx.closePath(); ctx.fillStyle = 'rgba(224,36,43,0.16)'; ctx.fill();
    }
    ctx.beginPath(); p.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
    ctx.strokeStyle = s.color; ctx.lineWidth = s.width; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke();
    if (s.dot) { const [px, py] = p[p.length - 1]; ctx.beginPath(); ctx.arc(px, py, 9, 0, Math.PI * 2); ctx.fillStyle = s.color; ctx.fill(); }
    s.pts = p;
  }
  (o.xl || []).forEach(([i, label]) => small(ctx, label, x + (w * i) / (o.series[0].data.length - 1), y + h + 26, 22, '#8a8a8a', 'center'));
  ctx.restore();
  return o.series.map((s) => s.pts);
}

// horizontal bars with a label above each bar and the value inside it
function hBars(ctx, o) {
  small(ctx, o.title, o.x, o.y - 62, 30);
  o.bars.forEach((b, i) => {
    const yy = o.y + i * o.gap;
    small(ctx, b.label, o.x, yy, 26, '#222', 'left', true);
    const bw = (o.w * b.v) / o.max, bh = o.barH;
    ctx.save(); ctx.fillStyle = b.color; ctx.strokeStyle = INK; ctx.lineWidth = 3;
    ctx.fillRect(o.x, yy + 22, bw, bh); ctx.strokeRect(o.x, yy + 22, bw, bh); ctx.restore();
    small(ctx, b.text, o.x + 16, yy + 22 + bh / 2, 34, b.textColor || '#fff', 'left', true);
  });
  ctx.save(); ctx.strokeStyle = '#9a9a9a'; ctx.lineWidth = 2.5; ctx.beginPath();
  ctx.moveTo(o.x, o.y + 10); ctx.lineTo(o.x, o.y + (o.bars.length - 1) * o.gap + 22 + o.barH + 14); ctx.stroke(); ctx.restore();
}

// Florida drawn as a character: green map with eyes, arms and legs
function floridaGuy(D, x, y, s, o = {}) {
  const ctx = D.ctx;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const limb = (pts) => D.poly(pts, { w: 9, color: INK, id: 9100 + pts[0][0] });
  // legs from the bottom of the peninsula
  limb([[350, 300], [330, 400], [300, 420]]); limb([[410, 300], [420, 400], [452, 420]]);
  // arms
  if (o.suitcase) { limb([[430, 40], [500, 120], [520, 180]]); D.rect(470, 180, 110, 80, { fill: '#8d6e63', w: 7, id: 9150 }); D.rect(500, 160, 50, 22, { w: 7, id: 9151 }); }
  else limb([[430, 40], [510, 0], [540, -60]]);
  limb([[150, 60], [70, 120], [40, 170]]);
  P.florida(D, { fill: '#5fae4f', label: false, id: 9200 });
  if (o.crack) D.poly([[260, -250], [230, -170], [275, -110], [235, -30], [280, 40], [250, 120]], { w: 8, sharp: true, id: 9300 });
  // eyes
  for (const ex of [170, 262]) {
    ctx.beginPath(); ctx.ellipse(ex, -170, 30, 38, 0, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
    ctx.beginPath(); ctx.arc(ex + (o.look || 8), -165, 12, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
  }
  // brows + mouth
  if (o.worried) { D.line(140, -228, 192, -218, { w: 7, id: 9310 }); D.line(240, -218, 292, -228, { w: 7, id: 9311 }); }
  ctx.beginPath(); ctx.ellipse(218, -95, 16, o.worried ? 20 : 8, 0, 0, Math.PI * 2); ctx.fillStyle = '#5b1d22'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
  if (o.sweat) { ctx.beginPath(); ctx.moveTo(330, -250); ctx.quadraticCurveTo(352, -215, 330, -205); ctx.quadraticCurveTo(308, -215, 330, -250); ctx.fillStyle = '#7cc4f2'; ctx.fill(); ctx.lineWidth = 4; ctx.stroke(); }
  ctx.restore();
}

const THUMBS = [
  {
    name: 'thumb1_florida_is_cracking',
    draw(D, ctx) {
      headline(ctx, ['Florida Is', 'Cracking.'], 70, 165, 118);
      const [, red] = lineChart(ctx, { x: 1000, y: 150, w: 840, h: 380, title: 'Punta Gorda Home Prices vs. U.S.', min: 40, max: 125,
        series: [{ data: [70, 73, 80, 88, 91, 94, 96, 98], color: GRAY, width: 5 },
                 { data: [64, 68, 86, 112, 104, 96, 90, 85], color: RED, width: 7, fill: true, fillFrom: 5, dot: true }],
        xl: [[0, '2019'], [3, '2022'], [5, '2024']] });
      small(ctx, '2026', red[7][0], red[7][1] + 48, 48, RED, 'right', true);
      small(ctx, '-24%', (red[4][0] + red[5][0]) / 2, (red[4][1] + red[5][1]) / 2 - 52, 48, RED, 'center', true);
      floridaGuy(D, 1330, 830, 0.52, { crack: true, worried: true, sweat: true, look: -8 });
      C.mascot(D, { x: 470, y: 1330, s: 1.32, pose: 'pointR', expr: 'worried', talk: 0, blinkSeed: 7 });
    },
  },
  {
    name: 'thumb2_the_bill_came_due',
    draw(D, ctx) {
      hBars(ctx, { x: 70, y: 150, w: 820, max: 8800, gap: 170, barH: 80, title: 'Average Home Insurance, 2026',
        bars: [{ label: 'Florida', v: 8471, text: '$8,471', color: RED }, { label: 'U.S. Average', v: 2872, text: '$2,872', color: '#cfcfcf', textColor: INK }] });
      small(ctx, '~3x more', 400, 422, 72, RED, 'left', true);
      floridaGuy(D, 250, 800, 0.5, { worried: true, sweat: true, look: 10 });
      headline(ctx, ['The Bill', 'Came Due.'], 1850, 165, 118, 'right');
      P.draw(D, 'doc', 1110, 700, 1.75, { title: 'INSURANCE', amount: '$8,471/yr', amountColor: RED, lines: 3, rot: -0.12, id: 9400 });
      C.mascot(D, { x: 1560, y: 1330, s: 1.32, pose: 'holdL', expr: 'surprise', talk: 0, blinkSeed: 7, fx: 'exclaim' });
    },
  },
  {
    name: 'thumb3_everyone_wants_out',
    draw(D, ctx) {
      headline(ctx, ['Everyone', 'Wants Out.'], 70, 165, 118);
      hBars(ctx, { x: 1010, y: 170, w: 640, max: 42000, gap: 160, barH: 76, title: 'Florida Condos For Sale (August)',
        bars: [{ label: '2023', v: 23494, text: '23.5K', color: '#cfcfcf', textColor: INK }, { label: '2026', v: 40809, text: '40.8K', color: RED }] });
      small(ctx, '+74%', 1680, 170 + 160 + 22 + 38, 60, RED, 'left', true);
      floridaGuy(D, 1250, 720, 0.6, { suitcase: true, worried: true, look: 10 });
      P.draw(D, 'signPost', 1760, 900, 1.5, { text: 'FOR SALE' });
      C.mascot(D, { x: 470, y: 1330, s: 1.32, pose: 'shrug', expr: 'worried', talk: 0, blinkSeed: 7 });
    },
  },
];

(async () => {
  const out = process.argv[2] || path.join(ROOT, 'youtube_thumbs');
  fs.mkdirSync(out, { recursive: true });
  GlobalFonts.registerFromPath(path.join(ROOT, 'assets/fonts/LibreBaskerville_700.ttf'), SERIF);
  GlobalFonts.registerFromPath(path.join(ROOT, 'assets/fonts/LibreBaskerville_400.ttf'), SERIF);
  const A = await loadAssets();
  for (const th of THUMBS) {
    const cv = createCanvas(1280, 720); const ctx = cv.getContext('2d');
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 1280, 720);
    ctx.scale(1280 / 1920, 720 / 1080);
    const D = new E.Draw(ctx, A); D.setTime(1.0); D.amp = 1.2;
    th.draw(D, ctx);
    fs.writeFileSync(path.join(out, th.name + '.png'), cv.toBuffer('image/png'));
    fs.writeFileSync(path.join(out, th.name + '.jpg'), cv.toBuffer('image/jpeg', 92));
  }
  console.log('wrote', THUMBS.length, 'thumbnails to', out);
})();

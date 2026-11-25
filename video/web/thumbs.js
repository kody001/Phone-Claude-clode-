// ============================================================
//  YouTube thumbnails (drawn at 1920x1080, exported at 1280x720).
//  Style: white background, bold serif hook text top-left, a simple red
//  chart, the channel mascot reacting, one small extra stickman.
// ============================================================
'use strict';
FONTS.serif = 'ThumbSerif';
const RED = '#e3191c', GRAY = '#c9cdd1';
function clear() { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); SEED = 1; }
function title(lines, o = {}) {
  ctx.save(); ctx.font = `700 ${o.size || 158}px ThumbSerif`; ctx.fillStyle = INK; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  lines.forEach((l, i) => ctx.fillText(l, o.x || 70, (o.y || 190) + i * (o.lh || 158)));
  ctx.restore();
}
function serif(str, x, y, size, o = {}) { text(ctx, str, x, y, { size, font: 'serif', weight: o.w || 700, color: o.color || INK, align: o.align || 'center', base: o.base || 'middle', lh: 1.05 }); }
function mascot(o) {
  const e = new Elon({ x: o.x, y: o.y, s: o.s, rot: o.rot || 0, t0: 0, enter: 'none' });
  e.pose(0, o.pose || 'rest', o.args || {});
  const f = { ...(EXPR[o.expr] || {}), ...(o.face || {}) }; e.faceAt = () => f;
  e.draw(ctx, 2.0);
}
function extra(o) { const s = new Stick({ t0: 0, enter: 'none', ...o }); s.draw(ctx, o.t ?? 2.0); }
function dashed(x1, y1, x2, y2, col = RED, lw = 5) { ctx.save(); ctx.setLineDash([18, 14]); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore(); }
function bar(x, y, w, h, fill) { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeRect(x, y, w, h); }
function plainLine(pts, col, lw) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); ctx.restore(); }

// ---------- 1: "Only 1% Space." ----------
function thumb1() {
  clear();
  title(['Only 1%', 'Space.']);
  // chart: what the $28.5T pitch is made of
  const base = 930;
  serif('The $28.5T pitch', 1530, 120, 50, { w: 400 });
  plainLine([[1170, base], [1880, base]], INK, 5);
  bar(1220, 230, 260, base - 230, RED);
  serif('$26.5T', 1350, 300, 76, { color: '#fff' });
  serif('AI', 1350, base + 50, 54);
  bar(1580, base - 12, 260, 12, GRAY);
  serif('Space', 1710, base + 50, 54);
  serif('$370B', 1710, base - 300, 62);
  dashed(1480, 230, 1880, 230);
  // little rocket standing on the tiny bar
  drawSprite(ctx, 'rocket', {}, 1710, base - 12 - 95, .42);
  // red callout
  serif('1%', 1710, base - 430, 140, { color: RED });
  // mascot, big, leaning in from bottom-left, pointing at the tiny bar
  mascot({ x: 640, y: 1530, s: 1.8, rot: 4, expr: 'skeptical', pose: 'point', args: { at: [1700, 860] } });
  extra({ x: 150, y: 1080, s: .72, seed: 51, hair: 'side', hairColor: '#7a4a24', outfit: { type: 'tie', color: COL.blue }, expr: 'confused', pose: 'shrug' });
}

// ---------- 2: "Below IPO. Again." ----------
function thumb2() {
  clear();
  title(['Below IPO.', 'Again.']);
  const X = 1010, Y = 210, Wd = 830, Ht = 520, lo = 90, hi = 240;
  const px = [[0.0, 150], [0.05, 190], [0.1, 224], [0.18, 172], [0.25, 133], [0.36, 108], [0.5, 138], [0.64, 147], [0.7, 158], [0.82, 136], [0.95, 127.79]];
  const pt = ([f, p]) => [X + f / .95 * Wd, Y + Ht - (p - lo) / (hi - lo) * Ht];
  plainLine([[X, Y - 10], [X, Y + Ht], [X + Wd + 20, Y + Ht]], INK, 4);
  serif('SpaceX stock', X + 10, Y - 40, 46, { align: 'left' });
  serif('2026', X + Wd - 40, Y - 40, 58, { color: RED });
  const ipoY = Y + Ht - (135 - lo) / (hi - lo) * Ht;
  dashed(X, ipoY, X + Wd, ipoY, '#777', 5);
  serif('IPO price', X + 560, ipoY + 36, 40, { w: 400, color: '#555' });
  plainLine(px.map(pt), RED, 12);
  const [ex, ey] = pt(px[px.length - 1]);
  ctx.beginPath(); ctx.arc(ex, ey, 18, 0, 7); ctx.fillStyle = RED; ctx.fill();
  serif('$127.79', ex - 150, ey + 72, 64, { color: RED });
  const [hx, hy] = pt(px[2]); serif('$220+', hx + 10, hy - 40, 52);
  serif('June', X + 30, Y + Ht + 40, 36, { w: 400 }); serif('Nov', X + Wd - 30, Y + Ht + 40, 36, { w: 400 });
  // mascot: worried, crown falling off
  mascot({ x: 600, y: 1540, s: 1.8, rot: -3, expr: 'worried', face: { mouth: 'sadopen' }, pose: 'shrug' });
  ctx.save(); ctx.translate(900, 470); ctx.rotate(rad(38)); drawSprite(ctx, 'crown', {}, 0, 0, .85); ctx.restore();
  plainLine([[860, 380], [890, 420]], INK, 5); plainLine([[930, 365], [945, 410]], INK, 5);
  extra({ x: 1120, y: 1080, s: .72, seed: 182, hair: 'curly', hairColor: '#6b3b1b', skin: SKINS[2], outfit: { type: 'shirt', color: '#9fd0f5' }, expr: 'shocked', pose: 'cower' });
}

// ---------- 3: "You Never Clicked Buy." ----------
function thumb3() {
  clear();
  title(['You Never', 'Clicked Buy.']);
  // index fund basket getting SpaceX shares pushed in
  drawSprite(ctx, 'basket', { text: 'INDEX FUND', size: 31 }, 1480, 700, 1.35);
  drawSprite(ctx, 'share', { text: 'SpaceX', sub: 'auto-bought' }, 1560, 300, .8);
  ctx.save(); ctx.strokeStyle = RED; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(1380, 330); ctx.quadraticCurveTo(1250, 460, 1370, 560); ctx.stroke(); ctx.restore();
  arrowHead(ctx, 1372, 562, rad(40), 40, { color: RED, lw: 12 });
  serif('$4.3B', 1110, 360, 96, { color: RED });
  serif('forced buying', 1110, 440, 44, { w: 400 });
  // phone with a BUY button that was never pressed
  drawSprite(ctx, 'phone', { screen: 'text', text: 'BUY', size: 64 }, 1000, 640, .62);
  plainLine([[940, 570], [1060, 710]], RED, 10); plainLine([[1060, 570], [940, 710]], RED, 10);
  // mascot, smug
  mascot({ x: 520, y: 1540, s: 1.8, rot: 3, expr: 'smug', pose: 'point', args: { at: [1480, 650] } });
  extra({ x: 1190, y: 1080, s: .72, seed: 231, hair: 'curly', hairColor: '#ccc', glasses: 'round', outfit: { type: 'dress', color: '#a07cc5' }, expr: 'shocked', pose: 'cower' });
}

window.THUMBS = [thumb1, thumb2, thumb3];
window.READY = (async () => {
  await Promise.all(['700 40px ThumbSerif', '400 40px ThumbSerif', '400 40px "Patrick Hand"', '400 40px "Permanent Marker"'].map(f => document.fonts.load(f)));
  await new Promise(r => ELON_IMG.complete ? r() : (ELON_IMG.onload = r));
  return true;
})();
window.exportThumb = (i, w = 1280, h = 720) => {
  THUMBS[i]();
  const out = document.createElement('canvas'); out.width = w; out.height = h;
  const c = out.getContext('2d'); c.imageSmoothingQuality = 'high'; c.drawImage(canvas, 0, 0, w, h);
  return out.toDataURL('image/jpeg', 0.93);
};

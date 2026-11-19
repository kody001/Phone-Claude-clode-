// Cards and annotations drawn per frame: article cards with animated highlighter,
// bar / poll charts, chalkboard, speech bubbles, arrows, scribble circles, timelines.
'use strict';

const LAYOUT = new Map();
function wrapWords(ctx, text, font, maxW) {
  const key = font + '|' + maxW + '|' + text;
  let L = LAYOUT.get(key);
  if (L) return L;
  ctx.save(); ctx.font = font;
  const space = ctx.measureText(' ').width;
  const words = text.split(/\s+/).filter(Boolean);
  const lines = []; let line = [], x = 0;
  for (const w of words) {
    const ww = ctx.measureText(w).width;
    if (line.length && x + ww > maxW) { lines.push(line); line = []; x = 0; }
    line.push({ w, x, ww }); x += ww + space;
  }
  if (line.length) lines.push(line);
  ctx.restore();
  L = { lines, space };
  LAYOUT.set(key, L);
  return L;
}

function shadowCard(ctx, x, y, w, h, r = 10) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.10)';
  ctx.beginPath(); ctx.roundRect(x + 8, y + 10, w, h, r); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.strokeStyle = '#d5d9de'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); ctx.stroke();
  ctx.restore();
}

const HL_COLORS = { y: COL.hl, o: COL.hlOrange, p: COL.hlPink, t: COL.hlTeal };

// article / report card, centered on (0,0)
function drawDoc(ctx, a, t, tt) {
  const w = a.w || 900, pad = 44;
  const titleFont = `700 ${a.titleSize || 46}px Merriweather`;
  const bodyFont = `400 ${a.bodySize || 27}px Inter`;
  const T = wrapWords(ctx, a.title || '', titleFont, w - pad * 2);
  const B = wrapWords(ctx, a.body || '', bodyFont, w - pad * 2);
  const tLH = (a.titleSize || 46) * 1.3, bLH = (a.bodySize || 27) * 1.62;
  let h = pad + (a.kicker ? 40 : 0) + T.lines.length * tLH + 26 + B.lines.length * bLH + (a.source ? 56 : 18) + pad * 0.5;
  if (a.h) h = Math.max(h, a.h);
  const x0 = -w / 2, y0 = -h / 2;
  shadowCard(ctx, x0, y0, w, h, 8);
  let y = y0 + pad;
  ctx.textBaseline = 'top'; ctx.textAlign = 'left';
  if (a.kicker) {
    ctx.fillStyle = a.kickerColor || COL.red; ctx.font = '800 22px Inter';
    ctx.fillText(a.kicker.toUpperCase(), x0 + pad, y); y += 40;
  }
  ctx.fillStyle = '#1d232b'; ctx.font = titleFont;
  for (const line of T.lines) { for (const wd of line) ctx.fillText(wd.w, x0 + pad + wd.x, y); y += tLH; }
  y += 10;
  ctx.fillStyle = '#e1e4e8'; ctx.fillRect(x0 + pad, y, w - pad * 2, 2); y += 16;
  // highlights under body words
  const flat = []; B.lines.forEach((line, li) => line.forEach(wd => flat.push({ wd, li })));
  const norm = s => s.toLowerCase().replace(/[^a-z0-9$%.]/g, '');
  for (const h0 of (a.hl || [])) {
    const k = U.clamp((tt - h0.t) / (h0.dur || 0.6));
    if (k <= 0) continue;
    const ph = h0.text.split(/\s+/).map(norm);
    let start = -1;
    for (let i = 0; i + ph.length <= flat.length && start < 0; i++) if (ph.every((p, j) => norm(flat[i + j].wd.w) === p)) start = i;
    if (start < 0) continue;
    const span = flat.slice(start, start + ph.length);
    const total = span.reduce((s, x) => s + x.wd.ww + B.space, 0);
    let budget = total * U.easeInOut(k);
    ctx.fillStyle = HL_COLORS[h0.color || 'y'] || h0.color;
    for (const { wd, li } of span) {
      if (budget <= 0) break;
      const ww = Math.min(wd.ww + B.space, budget); budget -= ww;
      ctx.fillRect(x0 + pad + wd.x - 3, y + li * bLH - 3, ww + 2, (a.bodySize || 27) * 1.28);
    }
  }
  ctx.fillStyle = '#3a4048'; ctx.font = bodyFont;
  B.lines.forEach((line, li) => { for (const wd of line) ctx.fillText(wd.w, x0 + pad + wd.x, y + li * bLH); });
  y += B.lines.length * bLH;
  if (a.source) { ctx.fillStyle = '#7d858d'; ctx.font = '600 20px Inter'; ctx.fillText(a.source, x0 + pad, y + 18); }
  ctx.textBaseline = 'alphabetic';
  return { w, h };
}

// bar chart card; bars: [{label, value, color, t (appear), text}]
function drawBars(ctx, a, t, tt) {
  const w = a.w || 820, h = a.h || 560, pad = 50;
  const x0 = -w / 2, y0 = -h / 2;
  if (a.card !== false) shadowCard(ctx, x0, y0, w, h, 8);
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillStyle = '#1d232b'; ctx.font = `700 ${a.titleSize || 34}px Inter`;
  ctx.fillText(a.title || '', x0 + pad, y0 + 34);
  if (a.sub) { ctx.fillStyle = '#7d858d'; ctx.font = '500 22px Inter'; ctx.fillText(a.sub, x0 + pad, y0 + 80); }
  const bars = a.bars || [];
  const gx0 = x0 + pad, gx1 = x0 + w - pad, gy0 = y0 + (a.sub ? 140 : 110), gy1 = y0 + h - 76;
  const max = a.max || Math.max(...bars.map(b => b.value)) * 1.12;
  ctx.strokeStyle = '#c9ced3'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(gx0, gy1); ctx.lineTo(gx1, gy1); ctx.stroke();
  const n = bars.length, slot = (gx1 - gx0) / n, bw = Math.min(slot * 0.6, a.barW || 150);
  bars.forEach((b, i) => {
    const k = U.easeOutCubic(U.clamp((tt - (b.t || 0)) / 0.7));
    const cx = gx0 + slot * (i + 0.5);
    const bh = (gy1 - gy0) * (b.value / max) * k;
    if (k > 0) {
      ctx.fillStyle = b.color || COL.blue;
      ctx.fillRect(cx - bw / 2, gy1 - bh, bw, bh);
      ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 2; ctx.strokeRect(cx - bw / 2, gy1 - bh, bw, bh);
      ctx.fillStyle = '#1d232b'; ctx.font = `800 ${a.valueSize || 34}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.save(); ctx.globalAlpha *= U.clamp(k * 2 - 1);
      ctx.fillText(b.text || String(b.value), cx, gy1 - bh - 10);
      ctx.restore();
    }
    ctx.fillStyle = '#3a4048'; ctx.font = `600 ${a.labelSize || 24}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(b.label, cx, gy1 + 14);
  });
  if (a.source) { ctx.textAlign = 'left'; ctx.fillStyle = '#9aa3ad'; ctx.font = '600 18px Inter'; ctx.textBaseline = 'bottom'; ctx.fillText(a.source, x0 + pad, y0 + h - 14); }
  ctx.textBaseline = 'alphabetic';
}

// horizontal poll bars
function drawPoll(ctx, a, t, tt) {
  const w = a.w || 860, rows = a.rows || [], rh = a.rowH || 92, pad = 46;
  const h = a.h || (pad * 2 + 70 + rows.length * rh);
  const x0 = -w / 2, y0 = -h / 2;
  shadowCard(ctx, x0, y0, w, h, 8);
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillStyle = '#1d232b'; ctx.font = `700 ${a.titleSize || 32}px Inter`;
  ctx.fillText(a.title || '', x0 + pad, y0 + pad - 6);
  const bx0 = x0 + pad + (a.labelW || 250), bx1 = x0 + w - pad - 110;
  rows.forEach((r, i) => {
    const y = y0 + pad + 70 + i * rh;
    const k = U.easeOutCubic(U.clamp((tt - (r.t || 0)) / 0.8));
    ctx.fillStyle = '#3a4048'; ctx.font = `600 ${a.labelSize || 26}px Inter`; ctx.textBaseline = 'middle';
    ctx.fillText(r.label, x0 + pad, y + rh * 0.4);
    ctx.fillStyle = '#eef0f2'; ctx.fillRect(bx0, y + rh * 0.12, bx1 - bx0, rh * 0.56);
    ctx.fillStyle = r.color || COL.blue; ctx.fillRect(bx0, y + rh * 0.12, (bx1 - bx0) * (r.pct / 100) * k, rh * 0.56);
    ctx.fillStyle = '#1d232b'; ctx.font = '800 34px Inter';
    ctx.fillText(Math.round(r.pct * k) + '%', bx1 + 18, y + rh * 0.4);
  });
  if (a.source) { ctx.fillStyle = '#9aa3ad'; ctx.font = '600 18px Inter'; ctx.textBaseline = 'bottom'; ctx.fillText(a.source, x0 + pad, y0 + h - 14); }
  ctx.textBaseline = 'alphabetic';
}

function drawBoard(ctx, a, t, tt) {
  const w = a.w || 760, h = a.h || 440;
  const pen = new Pen(ctx, 31, 1.2);
  pen.rect(-w / 2 - 24, -h / 2 - 24, w + 48, h + 48, { fill: COL.chalkFrame, lw: 6 });
  pen.rect(-w / 2, -h / 2, w, h, { fill: COL.chalk, lw: 4 });
  const text = a.text || '';
  const n = Math.floor(text.length * U.clamp((tt - (a.writeT || 0)) / (a.writeDur || Math.max(0.6, text.length * 0.035))));
  const shown = text.slice(0, n);
  ctx.fillStyle = '#f4f7f2'; ctx.font = `700 ${a.size || 72}px Kalam`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const lines = shown.split('\n');
  const LH = (a.size || 72) * 1.15;
  const full = text.split('\n').length;
  lines.forEach((l, i) => ctx.fillText(l, 0, (i - (full - 1) / 2) * LH));
}

function drawBubble(ctx, a, t, tt) {
  const w = a.w || 360, h = a.h || 180, tail = a.tail || 'bl';
  const pen = new Pen(ctx, 55, 1.3);
  const tx = tail.includes('l') ? -w * 0.22 : w * 0.22, dir = tail.includes('l') ? -1 : 1;
  const up = tail[0] === 't';
  if (a.thought) {
    pen.ellipse(0, 0, w / 2, h / 2, { fill: '#fff', lw: 5, irr: 0.06 });
    pen.circle(tx + dir * 30, (up ? -1 : 1) * (h / 2 + 24), 16, { fill: '#fff', lw: 4 });
    pen.circle(tx + dir * 54, (up ? -1 : 1) * (h / 2 + 56), 10, { fill: '#fff', lw: 4 });
  } else {
    const ty = up ? -h / 2 : h / 2, s = up ? -1 : 1;
    pen.shape([[tx - 26, ty - s * 6], [tx + dir * 48, ty + s * 66], [tx + 26, ty - s * 6]], { fill: '#fff', lw: 5, smooth: false });
    pen.shape(INK.ellipsePts(0, 0, w / 2, h / 2, { seed: 4, irr: 0.02 }), { fill: '#fff', lw: 5 });
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(tx, ty - s * 10, 24, 12, 0, 0, 7); ctx.fill();
  }
  ctx.fillStyle = a.color || COL.ink; ctx.font = `700 ${a.size || 46}px Kalam`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const lines = (a.text || '').split('\n'), LH = (a.size || 46) * 1.12;
  lines.forEach((l, i) => ctx.fillText(l, 0, (i - (lines.length - 1) / 2) * LH + 2));
}

// hand-drawn arrow from a.from to a.to (screen coords, relative to element origin = 0,0)
function drawArrow(ctx, a, t, tt) {
  const k = U.easeOutCubic(U.clamp((tt - (a.drawT || 0)) / (a.drawDur || 0.45)));
  if (k <= 0) return;
  const [x0, y0] = a.from, [x1, y1] = a.to;
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
  const nx = -(y1 - y0), ny = x1 - x0, L = Math.hypot(nx, ny) || 1;
  const bend = a.bend == null ? 0.15 : a.bend;
  const c = [mx + nx / L * L * bend, my + ny / L * L * bend];
  const pts = INK.partial(INK.quad([x0, y0], c, [x1, y1], 24), k);
  const pen = new Pen(ctx, 71, 1.4);
  const col = a.color || COL.red, lw = a.lw || 9;
  pen.line(pts, { lw, stroke: col });
  if (k > 0.85) {
    const e = pts[pts.length - 1], p2 = pts[Math.max(0, pts.length - 3)];
    const ang = Math.atan2(e[1] - p2[1], e[0] - p2[0]), hs = a.head || 34;
    pen.line([[e[0] + Math.cos(ang + 2.6) * hs, e[1] + Math.sin(ang + 2.6) * hs], [e[0], e[1]], [e[0] + Math.cos(ang - 2.6) * hs, e[1] + Math.sin(ang - 2.6) * hs]], { lw, stroke: col });
  }
}

function drawCircleMark(ctx, a, t, tt) {
  const k = U.easeInOut(U.clamp((tt - (a.drawT || 0)) / (a.drawDur || 0.5)));
  if (k <= 0) return;
  const rx = a.rx || 120, ry = a.ry || 70, pts = [];
  for (let i = 0; i <= 44; i++) { const ang = -0.6 + (i / 44) * Math.PI * 2.15; const r = 1 + i * 0.002; pts.push([Math.cos(ang) * rx * r, Math.sin(ang) * ry * r]); }
  new Pen(ctx, 13, 1.6).line(INK.partial(pts, k), { lw: a.lw || 7, stroke: a.color || COL.red });
}

function drawUnderline(ctx, a, t, tt) {
  const k = U.easeOutCubic(U.clamp((tt - (a.drawT || 0)) / (a.drawDur || 0.35)));
  if (k <= 0) return;
  const w = a.w || 300;
  new Pen(ctx, 19, 1.5).line(INK.partial([[-w / 2, 0], [0, 4], [w / 2, -2]], k), { lw: a.lw || 8, stroke: a.color || COL.red });
}

// highlighter swipe over an area (used over drawn text)
function drawMarker(ctx, a, t, tt) {
  const k = U.easeInOut(U.clamp((tt - (a.drawT || 0)) / (a.drawDur || 0.5)));
  if (k <= 0) return;
  const w = a.w || 300, h = a.h || 60;
  ctx.fillStyle = HL_COLORS[a.color || 'y'] || a.color;
  ctx.fillRect(-w / 2, -h / 2, w * k, h);
}

// horizontal timeline with year marks
function drawTimeline(ctx, a, t, tt) {
  const w = a.w || 1300, pen = new Pen(ctx, 23, 1.2);
  const k = U.easeOutCubic(U.clamp((tt - (a.drawT || 0)) / 0.6));
  pen.line(INK.partial([[-w / 2, 0], [w / 2, 0]], k), { lw: 8 });
  for (const m of (a.marks || [])) {
    const mk = U.easeOutBack(U.clamp((tt - (m.t || 0)) / 0.35));
    if (mk <= 0) continue;
    const x = -w / 2 + w * m.pos;
    ctx.save(); ctx.translate(x, 0); ctx.scale(mk, mk);
    pen.circle(0, 0, 18, { fill: m.color || COL.ink, lw: 4 });
    ctx.fillStyle = m.color || COL.ink; ctx.font = `700 ${m.size || 54}px Kalam`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(m.label, 0, -62);
    if (m.sub) { ctx.font = '700 32px Kalam'; ctx.fillStyle = COL.ink; ctx.fillText(m.sub, 0, 62); }
    ctx.restore();
  }
  for (const s of (a.spans || [])) {
    const sk = U.easeInOut(U.clamp((tt - (s.t || 0)) / 0.7));
    if (sk <= 0) continue;
    const xa = -w / 2 + w * s.from, xb = -w / 2 + w * s.to;
    ctx.fillStyle = s.color || COL.hlOrange; ctx.fillRect(xa, -10, (xb - xa) * sk, 20);
    if (sk > 0.9 && s.label) { ctx.fillStyle = s.textColor || COL.red; ctx.font = '700 44px Kalam'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s.label, (xa + xb) / 2, s.dy || 70); }
  }
}

function drawPie(ctx, a, t, tt) {
  const r = a.r || 170, k = U.easeOutCubic(U.clamp((tt - (a.drawT || 0)) / 0.8));
  const pen = new Pen(ctx, 37, 1.2);
  pen.circle(0, 0, r, { fill: a.base || '#e3e7eb', lw: 5 });
  if (k > 0) {
    ctx.fillStyle = a.color || COL.red;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r - 3, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (a.pct / 100) * k); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 4; ctx.stroke();
  }
  if (a.label && k > 0.6) { ctx.fillStyle = '#fff'; ctx.font = '700 64px Kalam'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 8; ctx.strokeStyle = COL.ink; const ang = -Math.PI / 2 + Math.PI * (a.pct / 100); ctx.strokeText(a.label, Math.cos(ang) * r * 0.55, Math.sin(ang) * r * 0.55); ctx.fillText(a.label, Math.cos(ang) * r * 0.55, Math.sin(ang) * r * 0.55); }
}

// stacked comparison bar: segments [{v, color, label}]
function drawSplitBar(ctx, a, t, tt) {
  const w = a.w || 1000, h = a.h || 90, tot = a.segments.reduce((s, x) => s + x.v, 0);
  let x = -w / 2;
  for (const s of a.segments) {
    const k = U.easeOutCubic(U.clamp((tt - (s.t || 0)) / 0.6));
    const sw = w * s.v / tot;
    if (k > 0) {
      ctx.fillStyle = s.color; ctx.fillRect(x, -h / 2, sw * k, h);
      if (k > 0.9 && s.label) { ctx.fillStyle = s.textColor || '#fff'; ctx.font = `700 ${s.size || 40}px Kalam`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s.label, x + sw / 2, 2); }
    }
    x += sw;
  }
  new Pen(ctx, 3, 1).rect(-w / 2, -h / 2, w, h, { fill: null, lw: 5 });
}

const CARDS = { doc: drawDoc, bars: drawBars, poll: drawPoll, board: drawBoard, bubble: drawBubble, arrow: drawArrow, circle: drawCircleMark, underline: drawUnderline, marker: drawMarker, timeline: drawTimeline, pie: drawPie, splitbar: drawSplitBar };

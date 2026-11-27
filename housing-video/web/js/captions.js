'use strict';
// Word-synced captions built from the forced-alignment timings.
// Chunks break at pauses, sentence ends and a max length; the spoken word gets a highlighter swipe.
let CAP_CHUNKS = [];
function buildCaptions(words) {
  const chunks = []; let cur = [];
  const clean = w => w.replace(/^["“(]+/, '').replace(/[,;:."”)]+$/, '');
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    cur.push({ w: clean(w.w), s: w.s, e: w.e });
    const next = words[i + 1];
    const gap = next ? next.s - w.e : 9;
    const chars = cur.reduce((a, x) => a + x.w.length + 1, 0);
    const endS = /[.!?]["”]?$/.test(w.w);
    if (!next || gap > 0.32 || endS || cur.length >= 6 || chars > 30 || (/[,;:]$/.test(w.w) && cur.length >= 3)) {
      chunks.push({ words: cur, s: cur[0].s, e: cur[cur.length - 1].e });
      cur = [];
    }
  }
  // hold each chunk until the next one starts (max +0.7s)
  for (let i = 0; i < chunks.length; i++) {
    const n = chunks[i + 1];
    chunks[i].hold = n ? Math.min(n.s, chunks[i].e + 0.7) : chunks[i].e + 1.0;
  }
  CAP_CHUNKS = chunks;
  return chunks;
}
function drawCaptions(ctx, t) {
  let lo = 0, hi = CAP_CHUNKS.length - 1, idx = -1;
  while (lo <= hi) { const m = (lo + hi) >> 1; if (CAP_CHUNKS[m].s - 0.05 <= t) { idx = m; lo = m + 1; } else hi = m - 1; }
  if (idx < 0) return;
  const ch = CAP_CHUNKS[idx];
  if (t > ch.hold) return;
  const size = 60, font = { size, font: 'kalam', weight: 700 };
  ctx.save();
  setFont(ctx, font);
  const space = ctx.measureText(' ').width;
  const widths = ch.words.map(w => ctx.measureText(w.w).width);
  const total = widths.reduce((a, b) => a + b, 0) + space * (ch.words.length - 1);
  let x = W / 2 - total / 2;
  const y = 1012;
  // soft backing plate for legibility over drawings
  const pad = 26;
  ctx.fillStyle = 'rgba(255,255,255,0.86)';
  const r = 22, bx = x - pad, by = y - 46, bw = total + pad * 2, bh = 86;
  ctx.beginPath(); ctx.moveTo(bx + r, by); ctx.arcTo(bx + bw, by, bx + bw, by + bh, r); ctx.arcTo(bx + bw, by + bh, bx, by + bh, r); ctx.arcTo(bx, by + bh, bx, by, r); ctx.arcTo(bx, by, bx + bw, by, r); ctx.closePath(); ctx.fill();
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ch.words.forEach((w, i) => {
    const active = t >= w.s - 0.03 && (t < w.e + 0.02 || (i === ch.words.length - 1 && t <= ch.hold));
    const spoken = t >= w.s - 0.03;
    if (active) {
      const k = E.out(P(t, w.s - 0.03, 0.12));
      ctx.fillStyle = 'rgba(255,214,0,0.85)';
      ctx.fillRect(x - 6, y - 30, (widths[i] + 12) * k, 62);
    }
    ctx.lineJoin = 'round'; ctx.lineWidth = 7; ctx.strokeStyle = '#fff'; ctx.strokeText(w.w, x, y + 4);
    ctx.fillStyle = spoken ? '#14161c' : '#59606a';
    ctx.fillText(w.w, x, y + 4);
    x += widths[i] + space;
  });
  ctx.restore();
}

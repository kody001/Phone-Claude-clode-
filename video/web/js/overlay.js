// 2D overlay layer: captions, speech bubbles, labels, checklists, pop words, phone UI, cards.
import { clamp, ease, lerp, range, rand, noise1 } from './util.js';

export const W = 1920, H = 1080;
const SERIF = '"Libre Baskerville", Georgia, serif';
const ROUND = 'Fredoka, sans-serif';
const DISPLAY = '"Lilita One", sans-serif';
const NAVY = 'rgba(22,16,48,0.86)';

function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
// standard in/out envelope for overlay items
function life(t, t0, t1, inD = 0.28, outD = 0.22) {
  if (t < t0 || t > t1) return null;
  const a = clamp((t - t0) / inD), b = clamp((t1 - t) / outD);
  return { a, b, k: Math.min(ease.outBack(a), 1 + (ease.outBack(a) - 1)), alpha: Math.min(a * 1.6, b, 1), pop: ease.outBack(a), out: ease.in(1 - b) };
}
function spacedText(c, text, x, y, sp) { // letter-spaced text, left aligned
  let cx = x; for (const ch of text) { c.fillText(ch, cx, y); cx += c.measureText(ch).width + sp; } return cx - x - sp;
}
function measureSpaced(c, text, sp) { let w = 0; for (const ch of text) w += c.measureText(ch).width + sp; return w - sp; }

// ---------------------------------------------------------------- icons
function icon(c, kind, x, y, r) {
  c.save(); c.translate(x, y);
  const disc = (col) => { c.beginPath(); c.arc(0, 0, r, 0, 7); c.fillStyle = col; c.fill(); };
  c.lineCap = 'round'; c.lineJoin = 'round';
  if (kind === 'check') { disc('#2bd47d'); c.strokeStyle = '#fff'; c.lineWidth = r * 0.32; c.beginPath(); c.moveTo(-r * 0.45, 0); c.lineTo(-r * 0.1, r * 0.38); c.lineTo(r * 0.5, -r * 0.35); c.stroke(); }
  else if (kind === 'x') { disc('#ff4f5e'); c.strokeStyle = '#fff'; c.lineWidth = r * 0.3; c.beginPath(); c.moveTo(-r * 0.38, -r * 0.38); c.lineTo(r * 0.38, r * 0.38); c.moveTo(r * 0.38, -r * 0.38); c.lineTo(-r * 0.38, r * 0.38); c.stroke(); }
  else if (kind === 'q') { disc('#ffb020'); c.fillStyle = '#fff'; c.font = `bold ${r * 1.5}px ${ROUND}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', 0, r * 0.08); }
  else if (kind === 'dot') { disc('#8fd6ff'); }
  else if (kind === 'heart') { heart(c, 0, 0, r * 1.1, '#ff5f8f'); }
  else if (kind === 'clock') { disc('#ffffff'); c.strokeStyle = '#1d1630'; c.lineWidth = r * 0.18; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -r * 0.55); c.moveTo(0, 0); c.lineTo(r * 0.4, 0); c.stroke(); }
  else if (kind === 'bolt') { disc('#ffd34d'); c.fillStyle = '#1d1630'; c.beginPath(); c.moveTo(r * 0.1, -r * 0.6); c.lineTo(-r * 0.35, r * 0.1); c.lineTo(0, r * 0.1); c.lineTo(-r * 0.1, r * 0.6); c.lineTo(r * 0.35, -r * 0.1); c.lineTo(0, -r * 0.1); c.fill(); }
  c.restore();
}
export function heart(c, x, y, s, col) {
  c.save(); c.translate(x, y); c.scale(s / 20, s / 20); c.beginPath(); c.moveTo(0, 6); c.bezierCurveTo(-18, -6, -10, -20, 0, -10); c.bezierCurveTo(10, -20, 18, -6, 0, 6); c.closePath();
  c.fillStyle = col; c.fill(); c.restore();
}

// ---------------------------------------------------------------- element drawers
const D = {};
// pill label (dark navy, white serif caps) — like "POPULATION: 2"
D.pill = (c, e, t, ctx) => {
  const L = life(t, e.t0, e.t1); if (!L) return;
  let [x, y] = e.anchor ? ctx.project(e.anchor) : [e.x * W, e.y * H];
  if (e.anchor && e.dy) y += e.dy;
  c.save(); c.globalAlpha = L.alpha; c.font = `bold ${e.size || 26}px ${SERIF}`;
  const sp = 3, tw = measureSpaced(c, e.text, sp), ic = e.icon ? 40 : 0;
  const w = tw + 56 + ic, h = (e.size || 26) * 1.95;
  c.translate(x, y); c.scale(lerp(0.6, 1, L.pop), lerp(0.6, 1, L.pop));
  rr(c, -w / 2, -h / 2, w, h, h / 2); c.fillStyle = NAVY; c.fill(); c.lineWidth = 3; c.strokeStyle = 'rgba(255,255,255,0.85)'; c.stroke();
  if (e.icon) icon(c, e.icon, -w / 2 + 34, 0, 14);
  c.fillStyle = '#fff'; c.textBaseline = 'middle'; spacedText(c, e.text, -w / 2 + 28 + ic, 2, sp);
  c.restore();
};
// checklist panel — like "NO SCHOOL / NO HOMEWORK"
D.list = (c, e, t) => {
  const L = life(t, e.t0, e.t1, 0.25, 0.25); if (!L) return;
  const items = e.items.filter(it => t >= (it.t ?? e.t0));
  if (!items.length) return;
  const fs = e.size || 28; c.font = `bold ${fs}px ${SERIF}`;
  const sp = 2, lh = fs * 1.75, padX = 28, padY = 20, ic = 44;
  const titleH = e.title ? fs * 1.6 : 0;
  const w = Math.max(...e.items.map(it => measureSpaced(c, it.text, sp))) + padX * 2 + ic, h = items.length * lh + padY * 2 + titleH;
  const x = e.x * W, y = e.y * H;
  c.save(); c.globalAlpha = L.alpha; c.translate(x + (1 - L.pop) * -40 * (e.right ? -1 : 1), y);
  rr(c, e.right ? -w : 0, 0, w, h, 18); c.fillStyle = NAVY; c.fill(); c.lineWidth = 2; c.strokeStyle = 'rgba(255,255,255,0.25)'; c.stroke();
  const x0 = e.right ? -w : 0;
  if (e.title) { c.fillStyle = '#ffd34d'; c.font = `bold ${fs * 0.8}px ${SERIF}`; c.textBaseline = 'middle'; spacedText(c, e.title, x0 + padX, padY + fs * 0.6, 4); c.font = `bold ${fs}px ${SERIF}`; }
  items.forEach((it, i) => {
    const a = clamp((t - (it.t ?? e.t0)) / 0.25), yy = padY + titleH + i * lh + lh / 2;
    c.save(); c.globalAlpha *= a; c.translate((1 - ease.out(a)) * -24, 0);
    icon(c, it.icon || 'dot', x0 + padX + 14, yy, 14 * ease.outBack(a));
    c.fillStyle = it.dim ? 'rgba(255,255,255,0.55)' : '#fff'; c.textBaseline = 'middle'; spacedText(c, it.text, x0 + padX + ic, yy + 2, sp);
    if (it.strike && t > it.strike) { const sw = measureSpaced(c, it.text, sp) * clamp((t - it.strike) / 0.3); c.fillStyle = '#ff4f5e'; c.fillRect(x0 + padX + ic, yy - 1, sw, 4); }
    c.restore();
  });
  c.restore();
};
// pop word — chunky outlined display text that bounces in
D.pop = (c, e, t, ctx) => {
  const L = life(t, e.t0, e.t1, 0.32, 0.2); if (!L) return;
  let [x, y] = e.anchor ? ctx.project(e.anchor) : [e.x * W, e.y * H];
  const fs = e.size || 110;
  c.save(); c.translate(x, y + (e.anchor ? (e.dy || -40) : 0)); c.rotate((e.rot ?? -4) * Math.PI / 180);
  const s = lerp(0.2, 1, ease.outElastic(Math.min(1, L.a * 1.15))) * (1 + 0.03 * Math.sin(t * 9)) * (1 + L.out * 0.3);
  c.scale(s, s); c.globalAlpha = L.alpha;
  c.font = `${fs}px ${e.font === 'serif' ? SERIF : DISPLAY}`; c.textAlign = 'center'; c.textBaseline = 'middle';
  const lines = e.text.split('\n');
  lines.forEach((ln, i) => {
    const yy = (i - (lines.length - 1) / 2) * fs * 1.0;
    c.lineJoin = 'round'; c.lineWidth = fs * 0.2; c.strokeStyle = e.stroke || '#2a1048'; c.strokeText(ln, 0, yy + fs * 0.06);
    c.strokeText(ln, 0, yy);
    const g = c.createLinearGradient(0, yy - fs / 2, 0, yy + fs / 2); const [a, b] = e.colors || ['#ffe66d', '#ff8a3d']; g.addColorStop(0, a); g.addColorStop(1, b);
    c.fillStyle = g; c.fillText(ln, 0, yy);
    c.globalAlpha *= 0.35; c.fillStyle = '#fff'; c.save(); c.beginPath(); c.rect(-2000, yy - fs * 0.5, 4000, fs * 0.28); c.clip(); c.fillText(ln, 0, yy); c.restore(); c.globalAlpha = L.alpha;
  });
  c.restore();
};
// time card — top-left small serif caps (like "6 HOURS LATER")
D.time = (c, e, t) => {
  const L = life(t, e.t0, e.t1, 0.5, 0.5); if (!L) return;
  c.save(); c.globalAlpha = L.alpha * 0.92; c.font = `bold ${e.size || 24}px ${SERIF}`; c.fillStyle = '#fff'; c.textBaseline = 'top';
  c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 8; spacedText(c, e.text, 70, 56, 6); c.restore();
};
// centered serif title card (big)
D.title = (c, e, t) => {
  const L = life(t, e.t0, e.t1, 0.6, 0.5); if (!L) return;
  c.save(); c.globalAlpha = L.alpha; c.textAlign = 'center'; c.textBaseline = 'middle';
  if (e.kicker) { c.font = `bold 30px ${SERIF}`; c.fillStyle = '#ffd34d'; const k = e.kicker; const w = measureSpaced(c, k, 8); c.textAlign = 'left'; spacedText(c, k, W / 2 - w / 2, (e.y || 0.42) * H - 80, 8); c.textAlign = 'center'; }
  const lines = e.text.split('\n'); const fs = e.size || 84;
  lines.forEach((ln, i) => {
    const a = clamp((t - e.t0 - 0.15 * i) / 0.5); c.globalAlpha = L.alpha * a;
    c.font = `${fs}px ${DISPLAY}`; c.lineJoin = 'round'; c.lineWidth = 16; c.strokeStyle = '#2a1048';
    const yy = (e.y || 0.42) * H + i * fs * 1.08 + (1 - ease.out(a)) * 30;
    c.strokeText(ln, W / 2, yy); const g = c.createLinearGradient(0, yy - fs / 2, 0, yy + fs / 2); g.addColorStop(0, i % 2 ? '#ffe66d' : '#ffffff'); g.addColorStop(1, i % 2 ? '#ff8a3d' : '#e6dcff'); c.fillStyle = g; c.fillText(ln, W / 2, yy);
  });
  c.restore();
};
// speech bubble anchored over a character; text revealed with word timing
D.bubble = (c, e, t, ctx) => {
  const L = life(t, e.t0, e.t1, 0.22, 0.2); if (!L) return;
  const hasA = !!e.anchor;
  let [ax, ay] = hasA ? ctx.project(e.anchor) : [W / 2, H - 150];
  const fs = e.size || 36; c.font = `bold ${fs}px ${SERIF}`;
  // wrap
  const maxW = e.maxW || 660; const words = e.words; const lines = []; let cur = [], cw = 0; const spW = c.measureText(' ').width;
  words.forEach(w => { const ww = c.measureText(w.t).width; if (cw + ww > maxW && cur.length) { lines.push(cur); cur = []; cw = 0; } cur.push({ ...w, ww }); cw += ww + spW; });
  if (cur.length) lines.push(cur);
  const lh = fs * 1.38; const bw = Math.max(...lines.map(l => l.reduce((a, w) => a + w.ww + spW, -spW))) + 56; const bh = lines.length * lh + 34;
  let bx = hasA ? ax + (ax > W * 0.6 ? -bw + 60 : -60) : W / 2 - bw / 2, by = hasA ? ay - bh - 46 - (e.lift || 0) : H - bh - 70;
  bx = clamp(bx, 40, W - bw - 40); by = hasA ? clamp(by, 30, H - bh - 200) : by;
  c.save(); c.globalAlpha = L.alpha;
  const sc = lerp(0.5, 1, L.pop); const px = clamp(ax, bx + 40, bx + bw - 40);
  c.translate(px, by + bh); c.scale(sc, sc); c.translate(-px, -(by + bh));
  const radio = e.style === 'radio';
  c.shadowColor = 'rgba(20,10,40,0.35)'; c.shadowBlur = 18; c.shadowOffsetY = 6;
  rr(c, bx, by, bw, bh, 26); c.fillStyle = radio ? '#e8fff4' : '#ffffff'; c.fill(); c.shadowColor = 'transparent';
  // tail
  if (hasA) { c.beginPath(); c.moveTo(px - 18, by + bh - 2); c.lineTo(clamp(ax, px - 60, px + 60), Math.min(ay - 10, by + bh + 40)); c.lineTo(px + 18, by + bh - 2); c.closePath(); c.fill(); }
  c.lineWidth = 3.5; c.strokeStyle = radio ? '#2bb673' : '#1d1630'; rr(c, bx, by, bw, bh, 26); c.stroke();
  if (radio) { c.setLineDash([10, 8]); rr(c, bx + 7, by + 7, bw - 14, bh - 14, 20); c.lineWidth = 2; c.stroke(); c.setLineDash([]); }
  if (!hasA && e.who) { const nm = { you: 'YOU', alex: 'ALEX', maint: 'MAINTENANCE', friend: 'BEST FRIEND', both: 'BOTH' }[e.who] || ''; c.font = `bold 20px ${SERIF}`; const nw = measureSpaced(c, nm, 3) + 30; rr(c, bx + 20, by - 16, nw, 32, 16); c.fillStyle = radio ? '#2bb673' : '#1d1630'; c.fill(); c.fillStyle = '#fff'; c.textBaseline = 'middle'; spacedText(c, nm, bx + 35, by + 1, 3); c.font = `bold ${fs}px ${SERIF}`; }
  c.textBaseline = 'middle';
  lines.forEach((ln, i) => {
    let x = bx + 28; const y = by + 17 + lh * (i + 0.5);
    ln.forEach(w => {
      const vis = e.reveal === false ? 1 : clamp((t - w.s + 0.05) / 0.12);
      c.globalAlpha = L.alpha * (0.12 + 0.88 * vis);
      c.fillStyle = w.emph ? '#e23a6e' : '#1d1630'; c.fillText(w.t, x, y); x += w.ww + spW;
    });
  });
  c.restore();
};
// thought cloud
D.thought = (c, e, t, ctx) => {
  const L = life(t, e.t0, e.t1, 0.3, 0.25); if (!L) return;
  if (e.whoA && !e.anchor) return;
  let [x, y] = e.anchor ? ctx.project(e.anchor) : [e.x * W, e.y * H];
  x += e.dx || 0; y += e.dy || -150;
  const fs = e.size || 30; c.font = `bold ${fs}px ${SERIF}`; const tw = c.measureText(e.text).width; const w = tw + 70, h = fs * 2.3;
  c.save(); c.globalAlpha = L.alpha; c.translate(x, y); c.scale(lerp(0.3, 1, L.pop), lerp(0.3, 1, L.pop)); c.translate(0, Math.sin(t * 2 + (e.seed || 0)) * 4);
  c.fillStyle = e.bg || '#fff'; c.strokeStyle = '#1d1630'; c.lineWidth = 3;
  const n = Math.max(6, Math.round(w / 45));
  c.beginPath();
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; c.moveTo(Math.cos(a) * w / 2 + h * 0.32, Math.sin(a) * h / 2); c.arc(Math.cos(a) * w / 2, Math.sin(a) * h / 2, h * 0.32, 0, 7); }
  c.fill(); c.stroke();
  c.beginPath(); c.ellipse(0, 0, w / 2, h / 2, 0, 0, 7); c.fill();
  c.beginPath(); c.arc(-w * 0.25, h * 0.75, 10, 0, 7); c.fill(); c.stroke(); c.beginPath(); c.arc(-w * 0.32, h * 1.05, 6, 0, 7); c.fill(); c.stroke();
  c.fillStyle = e.color || '#1d1630'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(e.text, 0, 2);
  c.restore();
};
// floating symbols above a head: ? ! ... ♥ notes
D.symbol = (c, e, t, ctx) => {
  const L = life(t, e.t0, e.t1, 0.25, 0.25); if (!L) return;
  if (e.whoA && !e.anchor) return;
  let [x, y] = e.anchor ? ctx.project(e.anchor) : [e.x * W, e.y * H];
  x += e.dx || 0; y += (e.dy ?? -40) + Math.sin((t - e.t0) * 4) * 6;
  c.save(); c.globalAlpha = L.alpha; c.translate(x, y); const s = ease.outBack(L.a) * (e.scale || 1); c.scale(s, s); c.rotate(Math.sin(t * 3) * 0.08);
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  const S = e.sym;
  if (S === 'heart') { heart(c, 0, 0, 44, '#ff5f8f'); }
  else if (S === 'hearts') { for (let i = 0; i < 3; i++) { const p = ((t - e.t0) * 0.6 + i / 3) % 1; c.globalAlpha = L.alpha * (1 - p); heart(c, (i - 1) * 50 + Math.sin(p * 6 + i) * 10, -p * 120, 30, '#ff5f8f'); } }
  else if (S === 'notes') { for (let i = 0; i < 3; i++) { const p = ((t - e.t0) * 0.5 + i / 3) % 1; c.globalAlpha = L.alpha * (1 - p); c.font = `72px ${ROUND}`; c.fillStyle = ['#ffd34d', '#8fd6ff', '#ff7eb6'][i]; c.strokeStyle = '#2a1048'; c.lineWidth = 8; const xx = (i - 1) * 60 + Math.sin(p * 7 + i) * 18, yy = -p * 160; c.strokeText(i % 2 ? '♫' : '♪', xx, yy); c.fillText(i % 2 ? '♫' : '♪', xx, yy); } }
  else if (S === 'dots') { for (let i = 0; i < 3; i++) { const on = Math.floor((t - e.t0) * 3) % 4 > i; if (on) { c.beginPath(); c.arc((i - 1) * 30, 0, 9, 0, 7); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#2a1048'; c.stroke(); } } }
  else if (S === 'anger') { c.strokeStyle = '#ff4f5e'; c.lineWidth = 10; for (let i = 0; i < 4; i++) { c.save(); c.rotate(i * Math.PI / 2); c.beginPath(); c.moveTo(8, -26); c.quadraticCurveTo(8, -8, 26, -8); c.stroke(); c.restore(); } }
  else if (S === 'sweat') { c.fillStyle = '#7fd0ff'; c.strokeStyle = '#2a6aa8'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, -30); c.quadraticCurveTo(22, 4, 0, 16); c.quadraticCurveTo(-22, 4, 0, -30); c.fill(); c.stroke(); }
  else if (S === 'stink') { c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 6; for (let i = 0; i < 3; i++) { c.beginPath(); for (let k = 0; k < 20; k++) c.lineTo((i - 1) * 34 + Math.sin(k * 0.6 + t * 6 + i) * 8, -k * 5); c.stroke(); } }
  else { c.font = `${e.size || 96}px ${DISPLAY}`; c.lineWidth = 14; c.strokeStyle = '#2a1048'; c.strokeText(S, 0, 0); c.fillStyle = e.color || '#ffd34d'; c.fillText(S, 0, 0); }
  c.restore();
};
// meter / progress bar (like "TIMES YOU TALKED TO HER")
D.meter = (c, e, t) => {
  const L = life(t, e.t0, e.t1, 0.3, 0.3); if (!L) return;
  const v = typeof e.value === 'function' ? e.value(t) : e.value;
  const x = e.x * W, y = e.y * H, w = e.w || 420;
  c.save(); c.globalAlpha = L.alpha;
  c.font = `bold 20px ${SERIF}`; c.fillStyle = '#fff'; c.textBaseline = 'bottom'; c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 6; spacedText(c, e.label, x, y - 10, 4); c.shadowBlur = 0;
  rr(c, x, y, w, 22, 11); c.fillStyle = 'rgba(22,16,48,0.75)'; c.fill(); c.lineWidth = 2.5; c.strokeStyle = 'rgba(255,255,255,0.9)'; c.stroke();
  const fw = Math.max(0, (w - 8) * clamp(v)); if (fw > 1) { rr(c, x + 4, y + 4, fw, 14, 7); const g = c.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, e.c0 || '#ff7eb6'); g.addColorStop(1, e.c1 || '#ff4f5e'); c.fillStyle = g; c.fill(); }
  if (e.icon) icon(c, e.icon, x + w + 26, y + 11, 18 * (1 + 0.12 * Math.sin(t * 8)));
  if (e.valueText) { c.font = `bold 22px ${SERIF}`; c.fillStyle = '#fff'; c.textAlign = 'right'; c.textBaseline = 'bottom'; c.fillText(typeof e.valueText === 'function' ? e.valueText(t) : e.valueText, x + w, y - 10); }
  c.restore();
};
// big counter readout (e.g. silence timer) — like "⏱ 0 SEC"
D.counter = (c, e, t) => {
  const L = life(t, e.t0, e.t1, 0.25, 0.25); if (!L) return;
  const txt = typeof e.text === 'function' ? e.text(t) : e.text;
  c.save(); c.globalAlpha = L.alpha; c.font = `${e.size || 64}px ${DISPLAY}`; c.textBaseline = 'middle';
  const x = e.x * W, y = e.y * H; const tw = c.measureText(txt).width;
  if (e.box) { rr(c, x - 30, y - 50, tw + 110, 100, 22); c.fillStyle = NAVY; c.fill(); }
  icon(c, e.icon || 'clock', x + 20, y, 24);
  c.lineJoin = 'round'; c.lineWidth = 10; c.strokeStyle = '#2a1048'; c.strokeText(txt, x + 60, y + 3); c.fillStyle = e.color || '#fff'; c.fillText(txt, x + 60, y + 3);
  c.restore();
};
// ECG heartbeat strip with BPM
D.ecg = (c, e, t) => {
  const L = life(t, e.t0, e.t1, 0.3, 0.3); if (!L) return;
  const bpm = typeof e.bpm === 'function' ? e.bpm(t) : e.bpm; const x = e.x * W, y = e.y * H, w = 380, h = 110;
  c.save(); c.globalAlpha = L.alpha; rr(c, x, y, w, h, 18); c.fillStyle = NAVY; c.fill();
  c.beginPath(); c.rect(x + 10, y + 10, w - 20, h - 20); c.clip();
  c.strokeStyle = '#ff5f8f'; c.lineWidth = 4; c.shadowColor = '#ff5f8f'; c.shadowBlur = 10; c.beginPath();
  const per = 60 / bpm;
  for (let i = 0; i <= 240; i++) {
    const tt = t - (240 - i) / 240 * 2.2; const ph = ((tt % per) + per) % per / per;
    let v = 0; if (ph < 0.06) v = -Math.sin(ph / 0.06 * Math.PI) * 0.9; else if (ph < 0.1) v = Math.sin((ph - 0.06) / 0.04 * Math.PI) * 0.35; else if (ph > 0.3 && ph < 0.42) v = -Math.sin((ph - 0.3) / 0.12 * Math.PI) * 0.18;
    c.lineTo(x + 10 + i / 240 * (w - 20) * 0.62, y + h / 2 + v * h * 0.42);
  }
  c.stroke(); c.shadowBlur = 0;
  c.fillStyle = '#fff'; c.font = `52px ${DISPLAY}`; c.textAlign = 'right'; c.textBaseline = 'middle'; c.fillText(Math.round(bpm), x + w - 20, y + h / 2 - 6);
  c.font = `bold 16px ${SERIF}`; c.fillText('BPM', x + w - 22, y + h / 2 + 30);
  heart(c, x + w - 150, y + h / 2, 26 * (1 + 0.25 * Math.max(0, 1 - ((t % per) / per) * 6)), '#ff5f8f');
  c.restore();
};
// computer window "deleting file" gag
D.deleting = (c, e, t) => {
  const L = life(t, e.t0, e.t1, 0.3, 0.3); if (!L) return;
  const x = e.x * W, y = e.y * H, w = 640, h = 250;
  c.save(); c.globalAlpha = L.alpha; c.translate(x, y); c.scale(lerp(0.7, 1, L.pop), lerp(0.7, 1, L.pop));
  c.shadowColor = 'rgba(0,0,0,0.4)'; c.shadowBlur = 30; rr(c, -w / 2, -h / 2, w, h, 20); c.fillStyle = '#f6f2ff'; c.fill(); c.shadowBlur = 0;
  rr(c, -w / 2, -h / 2, w, 52, 20); c.fillStyle = '#5a3fd0'; c.fill(); c.fillRect(-w / 2, -h / 2 + 30, w, 22);
  ['#ff5f5f', '#ffd34d', '#2bd47d'].forEach((col, i) => { c.beginPath(); c.arc(-w / 2 + 30 + i * 28, -h / 2 + 26, 9, 0, 7); c.fillStyle = col; c.fill(); });
  c.fillStyle = '#fff'; c.font = `bold 22px ${SERIF}`; c.textBaseline = 'middle'; c.fillText('BRAIN.EXE', -w / 2 + 130, -h / 2 + 27);
  const p = clamp((t - e.t0 - 0.4) / (e.dur || 2.2));
  c.fillStyle = '#1d1630'; c.font = `bold 26px ${SERIF}`; c.fillText(p < 1 ? 'Deleting: rehearsed_conversations' : 'All conversations deleted.', -w / 2 + 40, -10);
  c.font = `20px ${SERIF}`; c.fillStyle = '#6a5c8a'; c.fillText(p < 1 ? `${Math.floor(p * 847)} of 847 files...` : '0 files remaining  :(', -w / 2 + 40, 26);
  rr(c, -w / 2 + 40, 60, w - 80, 26, 13); c.fillStyle = '#ded6f5'; c.fill(); rr(c, -w / 2 + 40, 60, (w - 80) * p, 26, 13); c.fillStyle = '#ff4f5e'; c.fill();
  c.restore();
};
// phone UI (full screen chat, like reference phone screens)
D.phone = (c, e, t) => {
  const L = life(t, e.t0, e.t1, 0.35, 0.3); if (!L) return;
  const pw = 540, ph = 980; const x = W / 2 - pw / 2, y = H / 2 - ph / 2 + 20 + (1 - ease.out(L.a)) * 500 + ease.in(1 - L.b) * 500;
  c.save(); c.globalAlpha = Math.min(1, L.a * 3);
  const sc = e.sc || 1; c.translate(W / 2 + (e.dx || 0), H / 2); c.scale(sc, sc); c.translate(-W / 2, -H / 2);
  if (e.buzzAt) { for (const b of e.buzzAt) if (t > b && t < b + 0.45) c.translate(Math.sin(t * 90) * 7 * (1 - (t - b) / 0.45), 0); }
  // body
  c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 50; rr(c, x, y, pw, ph, 64); c.fillStyle = '#231c33'; c.fill(); c.shadowBlur = 0;
  const sx = x + 20, sy = y + 20, sw = pw - 40, sh = ph - 40;
  rr(c, sx, sy, sw, sh, 48); c.save(); c.clip();
  const dead = e.deadAt != null && t >= e.deadAt;
  if (!dead) {
    const g = c.createLinearGradient(0, sy, 0, sy + sh); g.addColorStop(0, '#f6f1ff'); g.addColorStop(1, '#eae2ff'); c.fillStyle = g; c.fillRect(sx, sy, sw, sh);
    // status bar
    c.fillStyle = '#1d1630'; c.font = `bold 24px ${ROUND}`; c.textBaseline = 'middle'; c.fillText('7:52', sx + 40, sy + 40);
    for (let i = 0; i < 4; i++) { c.fillStyle = i < (e.signal ?? 1) ? '#1d1630' : 'rgba(29,22,48,0.2)'; c.fillRect(sx + sw - 170 + i * 12, sy + 48 - (i + 1) * 6, 8, (i + 1) * 6); }
    const bat = typeof e.battery === 'function' ? e.battery(t) : e.battery;
    const low = bat <= 5; const blink = low && Math.floor(t * 2.5) % 2 === 0;
    rr(c, sx + sw - 104, sy + 28, 54, 26, 6); c.lineWidth = 3; c.strokeStyle = '#1d1630'; c.stroke(); c.fillStyle = '#1d1630'; c.fillRect(sx + sw - 48, sy + 36, 4, 10);
    c.fillStyle = low ? (blink ? '#ff4f5e' : '#ff8a8a') : '#2bd47d'; c.fillRect(sx + sw - 100, sy + 32, Math.max(3, 46 * bat / 100), 18);
    c.fillStyle = low ? '#ff4f5e' : '#1d1630'; c.font = `bold 20px ${ROUND}`; c.textAlign = 'right'; c.fillText(`${bat}%`, sx + sw - 112, sy + 41); c.textAlign = 'left';
    // header
    c.fillStyle = '#fff'; c.fillRect(sx, sy + 70, sw, 100); c.fillStyle = 'rgba(29,22,48,0.08)'; c.fillRect(sx, sy + 170, sw, 2);
    c.beginPath(); c.arc(sx + 70, sy + 120, 32, 0, 7); c.fillStyle = '#ff7eb6'; c.fill(); c.fillStyle = '#fff'; c.font = `bold 30px ${ROUND}`; c.textAlign = 'center'; c.fillText('J', sx + 70, sy + 122); c.textAlign = 'left';
    c.fillStyle = '#1d1630'; c.font = `bold 30px ${ROUND}`; c.fillText(e.contact || 'Bestie', sx + 120, sy + 108); c.font = `20px ${ROUND}`; c.fillStyle = '#2bb673'; c.fillText('online', sx + 120, sy + 140);
    // messages (bottom-up)
    const msgs = e.messages.filter(m => t >= m.t);
    let yy = sy + sh - 130;
    const laid = [];
    const wrap = (txt, maxW) => { const ws = txt.split(' '); const ls = []; let cur = ''; for (const w of ws) { const tst = cur ? cur + ' ' + w : w; if (c.measureText(tst).width > maxW && cur) { ls.push(cur); cur = w; } else cur = tst; } if (cur) ls.push(cur); return ls; };
    for (let i = msgs.length - 1; i >= 0; i--) {
      const m = msgs[i]; c.font = `bold ${m.big ? 46 : 32}px ${ROUND}`; const lines = wrap(m.text, sw - 170); const tw = Math.max(...lines.map(l => c.measureText(l).width)); const lh = m.big ? 54 : 40; const bh = lines.length * lh + (m.big ? 34 : 28);
      yy -= bh + 16; laid.push({ m, tw, bh, yy, lines, lh });
    }
    laid.forEach(({ m, tw, bh, yy, lines, lh }) => {
      const a = clamp((t - m.t) / 0.22); const me = m.from === 'me';
      const bx = me ? sx + sw - 40 - tw - 48 : sx + 40;
      c.save(); c.globalAlpha *= a; c.translate(me ? bx + tw + 48 : bx, yy + bh); c.scale(ease.outBack(a), ease.outBack(a)); c.translate(-(me ? bx + tw + 48 : bx), -(yy + bh));
      rr(c, bx, yy, tw + 48, bh, 30); c.fillStyle = me ? '#6c4cf0' : '#ffffff'; c.fill(); if (!me) { c.lineWidth = 2; c.strokeStyle = 'rgba(29,22,48,0.1)'; c.stroke(); }
      c.fillStyle = me ? '#fff' : '#1d1630'; c.font = `bold ${m.big ? 46 : 32}px ${ROUND}`; c.textBaseline = 'middle'; lines.forEach((ln, k) => c.fillText(ln, bx + 24, yy + bh / 2 + 2 + (k - (lines.length - 1) / 2) * lh));
      c.restore();
    });
    // composer
    c.fillStyle = '#fff'; rr(c, sx + 30, sy + sh - 110, sw - 60, 70, 35); c.fill();
    const typing = e.typing ? e.typing.find(k => t >= k.t0 && t <= k.t1) : null;
    c.font = `28px ${ROUND}`; c.fillStyle = typing ? '#1d1630' : 'rgba(29,22,48,0.35)';
    let tx = 'Message…';
    if (typing) { const n = Math.floor(clamp((t - typing.t0) / (typing.t1 - typing.t0 - 0.2)) * typing.text.length); tx = typing.text.slice(0, n) + (Math.floor(t * 3) % 2 ? '|' : ''); }
    c.fillText(tx, sx + 60, sy + sh - 74);
    // low battery warning
    if (e.warnAt != null && t >= e.warnAt && t < (e.deadAt ?? 1e9)) {
      const a = clamp((t - e.warnAt) / 0.3); c.globalAlpha = a; rr(c, sx + 50, sy + sh / 2 - 90, sw - 100, 180, 30); c.fillStyle = 'rgba(30,20,50,0.92)'; c.fill();
      c.fillStyle = '#ff4f5e'; c.font = `bold 34px ${ROUND}`; c.textAlign = 'center'; c.fillText('Low Battery', sx + sw / 2, sy + sh / 2 - 30); c.fillStyle = '#fff'; c.font = `24px ${ROUND}`; c.fillText(`${typeof e.battery === 'function' ? e.battery(t) : e.battery}% remaining`, sx + sw / 2, sy + sh / 2 + 20); c.textAlign = 'left'; c.globalAlpha = 1;
    }
  } else {
    // dead: black glass + reflection hint + glare
    c.fillStyle = '#07050c'; c.fillRect(sx, sy, sw, sh);
    const fl = clamp((t - e.deadAt) / 0.12); if (fl < 1) { c.fillStyle = `rgba(255,255,255,${0.7 * (1 - fl)})`; c.fillRect(sx, sy + sh / 2 - 3, sw, 6); }
    if (e.reflection) e.reflection(c, sx, sy, sw, sh, t);
  }
  // glass glare
  const gg = c.createLinearGradient(sx, sy, sx + sw, sy + sh); gg.addColorStop(0.0, 'rgba(255,255,255,0)'); gg.addColorStop(0.35, 'rgba(255,255,255,0.08)'); gg.addColorStop(0.42, 'rgba(255,255,255,0)'); c.fillStyle = gg; c.fillRect(sx, sy, sw, sh);
  c.restore();
  // notch
  rr(c, x + pw / 2 - 70, y + 34, 140, 34, 17); c.fillStyle = '#231c33'; c.fill();
  c.restore();
};
// glass frame overlay (close-up behind a black phone screen: like reference mirror frames)
D.glass = (c, e, t) => {
  const L = life(t, e.t0, e.t1, 0.2, 0.2); if (!L) return;
  c.save(); c.globalAlpha = L.alpha;
  const m = 70, x = m * 1.6, y = m * 0.6, w = W - 2 * x, h = H - 2 * y;
  c.fillStyle = '#e9e4f5'; c.beginPath(); c.rect(0, 0, W, H); c.roundRect(x, y, w, h, 46); c.fill('evenodd');
  c.lineWidth = 10; c.strokeStyle = '#231c33'; rr(c, x, y, w, h, 46); c.stroke();
  c.fillStyle = `rgba(10,6,20,${e.dark ?? 0.45})`; rr(c, x, y, w, h, 46); c.fill();
  const g = c.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0.25, 'rgba(255,255,255,0)'); g.addColorStop(0.32, 'rgba(255,255,255,0.18)'); g.addColorStop(0.36, 'rgba(255,255,255,0.03)'); g.addColorStop(0.42, 'rgba(255,255,255,0.12)'); g.addColorStop(0.46, 'rgba(255,255,255,0)');
  c.fillStyle = g; rr(c, x, y, w, h, 46); c.fill();
  c.restore();
};
// soul leaving body
D.soul = (c, e, t, ctx) => {
  const L = life(t, e.t0, e.t1, 0.2, 0.3); if (!L || !e.anchor) return;
  let [x, y] = ctx.project(e.anchor); const p = ease.out(clamp((t - e.t0) / (e.t1 - e.t0)));
  c.save(); c.globalAlpha = L.alpha * 0.85; c.translate(x + Math.sin(t * 3) * 20, y - 40 - p * 260);
  c.fillStyle = 'rgba(235,245,255,0.92)'; c.strokeStyle = 'rgba(150,170,255,0.9)'; c.lineWidth = 4;
  c.beginPath(); c.arc(0, 0, 60, Math.PI, 0); c.lineTo(60, 70); for (let i = 0; i < 4; i++) c.quadraticCurveTo(60 - i * 30 - 15, 90 + (i % 2 ? -10 : 10), 60 - (i + 1) * 30, 70); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#1d1630'; c.beginPath(); c.ellipse(-20, -6, 8, 13, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(20, -6, 8, 13, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(0, 24, 9, 12, 0, 0, 7); c.fill();
  c.restore();
};
// flash / fade / color wash
D.flash = (c, e, t) => { if (t < e.t0 || t > e.t0 + (e.dur || 0.25)) return; const a = 1 - (t - e.t0) / (e.dur || 0.25); c.fillStyle = `rgba(${e.color || '255,255,255'},${a * (e.amt || 0.85)})`; c.fillRect(0, 0, W, H); };
D.fade = (c, e, t) => { const a = Math.max(clamp((t - e.t0) / (e.inD || 0.4)) * (t <= e.t1 ? 1 : 0), 0); if (t < e.t0 || t > e.t1 + (e.outD || 0.4)) return; const v = t <= e.t1 ? clamp((t - e.t0) / (e.inD || 0.4)) : 1 - clamp((t - e.t1) / (e.outD || 0.4)); c.fillStyle = `rgba(${e.color || '8,4,20'},${v * (e.amt ?? 1)})`; c.fillRect(0, 0, W, H); };
D.wash = (c, e, t) => { const L = life(t, e.t0, e.t1, e.inD || 0.6, e.outD || 0.6); if (!L) return; c.save(); c.globalAlpha = L.alpha * (e.amt || 0.2); c.globalCompositeOperation = e.mode || 'source-over'; c.fillStyle = e.color; c.fillRect(0, 0, W, H); c.restore(); };
D.bars = (c, e, t) => { const L = life(t, e.t0, e.t1, 0.5, 0.5); if (!L) return; const h = 110 * ease.inOut(Math.min(L.a, L.b)); c.fillStyle = '#000'; c.fillRect(0, 0, W, h); c.fillRect(0, H - h, W, h); };
D.split = (c, e, t) => { // "split-screen" divider line
  const L = life(t, e.t0, e.t1, 0.3, 0.3); if (!L) return; c.save(); c.globalAlpha = L.alpha; c.fillStyle = '#fff'; c.fillRect(W / 2 - 4, 0, 8, H * ease.out(L.a)); c.restore();
};
D.vs = (c, e, t) => { // two option cards ("would you rather")
  const L = life(t, e.t0, e.t1, 0.35, 0.3); if (!L) return;
  c.save(); c.globalAlpha = L.alpha;
  const cards = e.cards; const cw = 620, ch = 150;
  cards.forEach((cd, i) => {
    const a = clamp((t - (cd.t ?? e.t0)) / 0.3); if (a <= 0) return;
    const x = W / 2 + (i ? 40 : -cw - 40), y = (e.y || 0.16) * H;
    c.save(); c.globalAlpha *= a; c.translate(x + cw / 2, y + ch / 2); c.scale(ease.outBack(a), ease.outBack(a)); c.translate(-(x + cw / 2), -(y + ch / 2));
    rr(c, x, y, cw, ch, 28); c.fillStyle = i ? '#ff7eb6' : '#6c8cff'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#fff'; c.stroke();
    if (cd.win && t > cd.win) { c.lineWidth = 10; c.strokeStyle = '#ffd34d'; rr(c, x - 8, y - 8, cw + 16, ch + 16, 34); c.stroke(); }
    c.fillStyle = '#fff'; c.font = `46px ${DISPLAY}`; c.textAlign = 'center'; c.textBaseline = 'middle';
    cd.text.split('\n').forEach((ln, k, arr) => c.fillText(ln, x + cw / 2, y + ch / 2 + (k - (arr.length - 1) / 2) * 50));
    c.restore();
  });
  c.fillStyle = '#fff'; c.font = `54px ${DISPLAY}`; c.textAlign = 'center'; c.lineWidth = 10; c.strokeStyle = '#2a1048'; c.strokeText('OR', W / 2, (e.y || 0.16) * H + 75); c.fillText('OR', W / 2, (e.y || 0.16) * H + 75);
  c.restore();
};
D.custom = (c, e, t, ctx) => { if (t >= e.t0 && t <= e.t1) e.draw(c, t, ctx); };

// ---------------------------------------------------------------- captions (narration)
export function drawCaption(c, chunk, t) {
  if (!chunk) return;
  const fs = 56; c.save(); c.font = `700 ${fs}px ${ROUND}`; c.textBaseline = 'middle';
  const spW = fs * 0.3 + 6;
  const ws = chunk.words.map(w => ({ ...w, ww: c.measureText(w.t).width }));
  const tot = ws.reduce((a, w) => a + w.ww + spW, -spW);
  let x = W / 2 - tot / 2; const y = H - 118;
  const a = clamp((t - chunk.t0) / 0.12) * clamp((chunk.t1 - t) / 0.12);
  c.globalAlpha = a; c.lineJoin = 'round';
  ws.forEach(w => {
    const active = t >= w.s - 0.03 && t < w.e + 0.08; const said = t >= w.s - 0.03;
    const sc = active ? 1 + 0.12 * ease.outBack(clamp((t - w.s + 0.03) / 0.12)) : 1;
    c.save(); c.translate(x + w.ww / 2, y); c.scale(sc, sc);
    c.lineWidth = 11; c.strokeStyle = '#1e1038'; c.textAlign = 'center'; c.strokeText(w.t, 0, 3);
    c.fillStyle = w.emph ? (said ? '#ff6b9a' : '#ffc2d6') : active ? '#ffe066' : said ? '#ffffff' : 'rgba(255,255,255,0.78)';
    c.fillText(w.t, 0, 0);
    c.restore(); x += w.ww + spW;
  });
  c.restore();
}

// ---------------------------------------------------------------- frame finishing: vignette + grain
let vig = null; const grains = [];
function initFx() {
  vig = document.createElement('canvas'); vig.width = W; vig.height = H; const x = vig.getContext('2d');
  const g = x.createRadialGradient(W / 2, H / 2, H * 0.38, W / 2, H / 2, H * 1.02); g.addColorStop(0, 'rgba(20,8,40,0)'); g.addColorStop(1, 'rgba(20,8,40,0.55)');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  for (let k = 0; k < 6; k++) { const n = document.createElement('canvas'); n.width = n.height = 256; const nx = n.getContext('2d'); const id = nx.createImageData(256, 256); for (let i = 0; i < id.data.length; i += 4) { const v = 128 + (Math.random() - 0.5) * 120; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } nx.putImageData(id, 0, 0); grains.push(n); }
}
export function drawOverlay(c, t, elements, caption, ctx, grainCtx) {
  if (!vig) initFx();
  c.clearRect(0, 0, W, H);
  c.drawImage(vig, 0, 0);
  for (const e of elements) { if (t >= e.t0 - 0.01 && t <= (e.t1 ?? e.t0 + (e.dur || 0.3)) + 1.2) { const f = D[e.type]; if (f) f(c, e, t, ctx); } }
  if (caption && !ctx.hideCaption) drawCaption(c, caption, t);
  // grain on separate soft-light canvas
  if (grainCtx) {
    const f = Math.floor(t * 30); const g = grains[f % grains.length]; const pat = grainCtx.createPattern(g, 'repeat');
    grainCtx.setTransform(1, 0, 0, 1, (rand(f) * 256) | 0, (rand(f, 1) * 256) | 0); grainCtx.fillStyle = pat; grainCtx.fillRect(-256, -256, W + 512, H + 512); grainCtx.setTransform(1, 0, 0, 1, 0, 0);
  }
}

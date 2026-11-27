'use strict';
// Core helpers: canvas constants, easing, seeded randomness, hand-drawn strokes, text.
const W = 1920, H = 1080, FPS = 60;

const COL = {
  ink: '#16181f', paper: '#ffffff', skin: '#F6C9A3', skin2: '#E2A97E', skin3: '#B7794F', skin4: '#83553A',
  red: '#D3262B', green: '#3E9440', dgreen: '#2C6E31', blue: '#2F6FB5', lblue: '#BFE2F2', yellow: '#FFE14D',
  orange: '#EE7B32', gray: '#8A9096', dgray: '#4A4F55', lgray: '#D9DCDF', brown: '#8B5A2B', tan: '#D3A26B',
  roof: '#C0392B', purple: '#7D4CB3', pink: '#F29AAE', teal: '#2BA59A', hl: 'rgba(255,214,0,0.55)', hlo: 'rgba(255,150,40,0.55)',
  chalk: '#2E6B3F', frame: '#7A4A26', money: '#7FB069',
};

function mulberry(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hstr(s) { let h = 2166136261; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const P = (t, t0, d) => clamp((t - t0) / d);
const E = {
  lin: t => t,
  out: t => 1 - Math.pow(1 - t, 3),
  in: t => t * t * t,
  io: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  back: t => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  el: t => (t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1),
};
const D2R = Math.PI / 180;

// ---------- hand-drawn geometry ----------
// Subdivide a polyline and push interior points sideways with smooth seeded noise.
function wobble(pts, seed, amp = 2, closed = false, step = 34) {
  const r = mulberry(seed);
  const out = [];
  const n = pts.length;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const k = Math.max(1, Math.round(len / step));
    const nx = -dy / len, ny = dx / len;
    const bow = (r() - 0.5) * amp * Math.min(2.2, len / 60);
    for (let j = 0; j < k; j++) {
      const t = j / k;
      const off = (j === 0 ? 0 : (r() - 0.5) * amp) + Math.sin(t * Math.PI) * bow;
      out.push([a[0] + dx * t + nx * off, a[1] + dy * t + ny * off]);
    }
  }
  if (!closed) out.push(pts[n - 1].slice());
  return out;
}
function tracePts(ctx, pts, closed) {
  const n = pts.length;
  if (n < 2) return;
  if (n === 2) { ctx.moveTo(pts[0][0], pts[0][1]); ctx.lineTo(pts[1][0], pts[1][1]); if (closed) ctx.closePath(); return; }
  if (closed) {
    const m0 = [(pts[n - 1][0] + pts[0][0]) / 2, (pts[n - 1][1] + pts[0][1]) / 2];
    ctx.moveTo(m0[0], m0[1]);
    for (let i = 0; i < n; i++) {
      const p = pts[i], q = pts[(i + 1) % n];
      ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
    }
    ctx.closePath();
  } else {
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < n - 1; i++) {
      const p = pts[i], q = pts[i + 1];
      ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
    }
    ctx.lineTo(pts[n - 1][0], pts[n - 1][1]);
  }
}
function strokeStyle(ctx, o) {
  ctx.lineWidth = o.w != null ? o.w : 5;
  ctx.strokeStyle = o.c || COL.ink;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
}
// Open wobbly line through points. o: {w,c,seed,amp,reveal}
function rline(ctx, pts, o = {}) {
  let p = o.amp === 0 ? pts : wobble(pts, o.seed || 7, o.amp != null ? o.amp : 2.2, false, o.step || 34);
  if (o.reveal != null && o.reveal < 1) p = partial(p, o.reveal);
  ctx.beginPath(); tracePts(ctx, p, false); strokeStyle(ctx, o); ctx.stroke();
}
function partial(pts, f) {
  if (f <= 0) return [pts[0], pts[0]];
  let total = 0; const L = [];
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); total += d; }
  let need = total * f; const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    if (need >= L[i - 1]) { out.push(pts[i]); need -= L[i - 1]; continue; }
    const t = need / L[i - 1];
    out.push([lerp(pts[i - 1][0], pts[i][0], t), lerp(pts[i - 1][1], pts[i][1], t)]);
    break;
  }
  return out;
}
function line(ctx, x1, y1, x2, y2, o = {}) { rline(ctx, [[x1, y1], [x2, y2]], o); }
// Closed wobbly shape with optional fill. o: {fill, w, c, seed, amp, noStroke}
function shape(ctx, pts, o = {}) {
  const p = o.amp === 0 ? pts : wobble(pts, o.seed || 11, o.amp != null ? o.amp : 2, true, o.step || 34);
  ctx.beginPath(); tracePts(ctx, p, true);
  if (o.fill) { ctx.fillStyle = o.fill; ctx.fill(); }
  if (!o.noStroke) { strokeStyle(ctx, o); ctx.stroke(); }
}
function poly(ctx, pts, o = {}) { // straight-edged polygon with slight wobble (keeps corners crisp)
  const p = o.amp === 0 ? pts : wobble(pts, o.seed || 13, o.amp != null ? o.amp : 1.6, true, 9999);
  ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); for (let i = 1; i < p.length; i++) ctx.lineTo(p[i][0], p[i][1]); ctx.closePath();
  if (o.fill) { ctx.fillStyle = o.fill; ctx.fill(); }
  if (!o.noStroke) { strokeStyle(ctx, o); ctx.stroke(); }
}
function rect(ctx, x, y, w, h, o = {}) { poly(ctx, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], o); }
// Wobbly ellipse; hand-drawn look via low-frequency radius noise and a small overlap at the seam.
function circ(ctx, cx, cy, rx, ry, o = {}) {
  ry = ry || rx;
  const r = mulberry(o.seed || 5);
  const a1 = (r() - 0.5) * 0.06, a2 = (r() - 0.5) * 0.05, ph1 = r() * 6.28, ph2 = r() * 6.28;
  const amp = o.amp != null ? o.amp : 1;
  const pts = [];
  const N = 40;
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2;
    const k = 1 + amp * (a1 * Math.sin(2 * t + ph1) + a2 * Math.sin(3 * t + ph2));
    pts.push([cx + Math.cos(t) * rx * k, cy + Math.sin(t) * ry * k]);
  }
  ctx.beginPath(); tracePts(ctx, pts, true);
  if (o.fill) { ctx.fillStyle = o.fill; ctx.fill(); }
  if (!o.noStroke) { strokeStyle(ctx, o); ctx.stroke(); }
}
function dot(ctx, x, y, r, c = COL.ink) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = c; ctx.fill(); }

// ---------- text ----------
const FONTS = {
  hand: '"Patrick Hand"', marker: '"Permanent Marker"', chalk: '"Caveat Brush"', kalam: '"Kalam"', gochi: '"Gochi Hand"',
  arch: '"Architects Daughter"', sans: 'Inter, "DejaVu Sans", sans-serif', serif: '"DejaVu Serif", "Liberation Serif", serif',
};
function setFont(ctx, o) {
  const f = FONTS[o.font || 'hand'] || o.font;
  ctx.font = `${o.weight || ''} ${o.size || 48}px ${f}`.trim();
}
// o: {size,font,c,align('center'),base('middle'),stroke(color),sw,reveal(0..1),maxW,lh,weight,rot}
function txt(ctx, s, x, y, o = {}) {
  ctx.save();
  setFont(ctx, o);
  ctx.textAlign = o.align || 'center';
  ctx.textBaseline = o.base || 'middle';
  ctx.translate(x, y);
  if (o.rot) ctx.rotate(o.rot * D2R);
  const lines = String(s).split('\n');
  const lh = (o.lh || 1.15) * (o.size || 48);
  const y0 = -((lines.length - 1) * lh) / 2;
  let rv = o.reveal != null ? clamp(o.reveal) : 1;
  const totalChars = lines.reduce((a, l) => a + l.length, 0);
  let budget = rv * totalChars;
  lines.forEach((ln, i) => {
    if (budget <= 0) return;
    const yy = (o.base === 'alphabetic' || o.base === 'top') ? i * lh : y0 + i * lh;
    let show = ln;
    let clipW = null;
    if (budget < ln.length) {
      // reveal like a pen sweep: clip partway through the line
      const wFull = ctx.measureText(ln).width;
      clipW = wFull * (budget / ln.length);
    }
    budget -= ln.length;
    ctx.save();
    if (clipW != null) {
      const wFull = ctx.measureText(ln).width;
      const left = ctx.textAlign === 'center' ? -wFull / 2 : ctx.textAlign === 'right' ? -wFull : 0;
      ctx.beginPath(); ctx.rect(left - 10, yy - lh, clipW + 10, lh * 2); ctx.clip();
    }
    if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = o.sw || 8; ctx.strokeStyle = o.stroke; ctx.strokeText(show, 0, yy); }
    ctx.fillStyle = o.c || COL.ink;
    ctx.fillText(show, 0, yy);
    ctx.restore();
  });
  ctx.restore();
}
function measure(ctx, s, o) { ctx.save(); setFont(ctx, o); const w = ctx.measureText(s).width; ctx.restore(); return w; }
// Word-wrap a string to a max width; returns lines
function wrap(ctx, s, o, maxW) {
  ctx.save(); setFont(ctx, o);
  const words = s.split(' '); const lines = []; let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
  }
  if (cur) lines.push(cur);
  ctx.restore();
  return lines;
}

// ---------- element placement ----------
// Every visual is an element: (ctx, t) => void, t = seconds since shot start.
// o: {x,y,s,rot,t,enter,dur,out,outFx,move:{x,y,t,d,e},bob,wig,alpha,flip,sx,sy,spin}
function el(o, draw) {
  o = Object.assign({ x: 0, y: 0, s: 1, rot: 0, t: 0, enter: 'pop', dur: null }, o);
  return function (ctx, t, sh) {
    const lt = t - o.t;
    if (lt < 0) return;
    if (o.out != null && t >= o.out + (o.outFx === 'none' ? 0 : 0.22)) return;
    let x = o.x, y = o.y, s = o.s, rot = o.rot, alpha = o.alpha != null ? o.alpha : 1, sx = 1, sy = 1;
    if (o.move) {
      const mv = Array.isArray(o.move) ? o.move : [o.move];
      for (const m of mv) {
        const k = (m.e ? E[m.e] : E.io)(P(t, m.t != null ? m.t : o.t, m.d || 0.6));
        const fx = m.fromX != null ? m.fromX : x, fy = m.fromY != null ? m.fromY : y;
        if (m.x != null) x = lerp(fx, m.x, k);
        if (m.y != null) y = lerp(fy, m.y, k);
        if (m.s != null) s = lerp(s, m.s, k);
        if (m.rot != null) rot = lerp(rot, m.rot, k);
      }
    }
    const d = o.dur || (o.enter === 'grow' ? 0.5 : o.enter === 'drop' ? 0.5 : 0.3);
    const p = P(lt, 0, d);
    switch (o.enter) {
      case 'pop': { const k = E.back(p); s *= lerp(0.15, 1, k); alpha *= clamp(p * 3); break; }
      case 'fade': alpha *= E.out(p); break;
      case 'slideL': x -= (1 - E.out(p)) * 900; break;
      case 'slideR': x += (1 - E.out(p)) * 900; break;
      case 'slideU': y -= (1 - E.out(p)) * 700; break;
      case 'slideD': y += (1 - E.out(p)) * 700; break;
      case 'drop': { y -= (1 - E.el(p)) * 500; alpha *= clamp(p * 4); break; }
      case 'grow': sy = E.out(p); break;
      case 'growX': sx = E.out(p); break;
      case 'spin': { rot += (1 - E.out(p)) * -360; s *= E.back(p); break; }
      default: break;
    }
    if (o.out != null && t >= o.out) {
      const q = P(t, o.out, 0.22);
      if (o.outFx === 'slideL') x -= E.in(q) * 1200; else if (o.outFx === 'slideR') x += E.in(q) * 1200; else if (o.outFx === 'fade') alpha *= 1 - q; else s *= 1 - E.in(q);
    }
    if (o.bob) y += Math.sin((t + o.x * 0.01) * 2.4) * o.bob;
    if (o.wig) rot += Math.sin((t + o.y * 0.01) * 3.1) * o.wig;
    if (o.spin) rot += lt * o.spin;
    if (o.pulse) s *= 1 + Math.sin(lt * 6) * o.pulse;
    if (alpha <= 0.001 || s <= 0.001) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y);
    if (rot) ctx.rotate(rot * D2R);
    ctx.scale(s * sx * (o.flip ? -1 : 1), s * sy);
    draw(ctx, lt, t, sh);
    ctx.restore();
  };
}
// group several elements under one placement
function grp(o, kids) { return el(o, (ctx, lt, t, sh) => { for (const k of kids) k(ctx, lt, sh); }); }

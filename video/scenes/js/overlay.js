// 2D overlay layer: captions, speech bubbles, info panels, title cards, phone UIs, pops, transitions, grain.
import * as THREE from 'three';
import { E, clamp, tw, noise1, rng } from './util.js';
import { PHONE_SCREENS } from './phone.js';

const INK = '#1b0b3f';
export function rr(g, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
const FSERIF = '"DM Serif Display", serif', FROUND = 'Fredoka, sans-serif', FPOP = '"Baloo 2", Fredoka, sans-serif', FUI = 'Inter, "Noto Color Emoji", sans-serif';

function spaced(g, text, x, y, spacing, align = 'center') {
  const chars = [...text]; const widths = chars.map(c => g.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  const prev = g.textAlign; g.textAlign = 'left';
  chars.forEach((c, i) => { g.fillText(c, cx, y); cx += widths[i] + spacing; });
  g.textAlign = prev; return total;
}

function popScale(lt, t0, t1, inDur = 0.22, outDur = 0.14) {
  if (lt < t0 || lt > t1) return 0;
  const a = (lt - t0) / inDur, b = (t1 - lt) / outDur;
  return Math.min(a < 1 ? E.back(a) : 1, b < 1 ? E.out(b) : 1);
}

export class Overlay {
  constructor(g, W, H, TL, camera) {
    this.g = g; this.W = W; this.H = H; this.TL = TL; this.camera = camera;
    this.items = []; this.post = { blur: [], dim: [], box: [], trans: [] };
    this.captionsOn = true;
    this.caps = TL.captions();
    // grain tiles
    this.grain = [];
    const r = rng(7.7);
    for (let k = 0; k < 4; k++) { const c = document.createElement('canvas'); c.width = c.height = 256; const gg = c.getContext('2d'); const im = gg.createImageData(256, 256);
      for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (r() - 0.5) * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } gg.putImageData(im, 0, 0); this.grain.push(gg.createPattern(c, 'repeat')); }
    const v = document.createElement('canvas'); v.width = W; v.height = H; const vg = v.getContext('2d');
    const grd = vg.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 1.0);
    grd.addColorStop(0, 'rgba(10,0,30,0)'); grd.addColorStop(1, 'rgba(10,0,30,0.42)'); vg.fillStyle = grd; vg.fillRect(0, 0, W, H);
    this.vignette = v;
    this.tmp = document.createElement('canvas'); this.tmp.width = W; this.tmp.height = H; this.tg = this.tmp.getContext('2d');
    this.v = new THREE.Vector3();
  }
  clearShot() { this.items = []; this.post = { blur: [], dim: [], box: [], trans: [] }; }
  proj(p) { const v = this.v.copy(p).project(this.camera); return [(v.x + 1) / 2 * this.W, (1 - v.y) / 2 * this.H, v.z]; }
  headScreen(actor, up = 0.55) { const p = actor.headPos(new THREE.Vector3()); const s = actor.root.scale.x * actor.head.scale.x; p.y += up * s; return this.proj(p); }

  shotApi(shotStart) {
    const O = this, T = (a) => typeof a === 'number' ? a : O.TL.time(a) - shotStart;
    const add = (t0, t1, draw, layer = 0) => { O.items.push({ t0: T(t0), t1: T(t1), draw, layer }); };
    return {
      T,
      bubble(actor, text, t0, t1, o = {}) { add(t0, t1, (g, lt, it) => O.drawBubble(g, actor, text, lt, it, o)); },
      icon(actor, kind, t0, t1, o = {}) { add(t0, t1, (g, lt, it) => O.drawIcon(g, actor, kind, lt, it, o)); },
      panel(items, t0, t1, o = {}) { add(t0, t1, (g, lt, it) => O.drawPanel(g, items.map(x => ({ ...x, at: x.at !== undefined ? T(x.at) : it.t0 })), lt, it, o)); },
      title(kicker, title, t0, t1, o = {}) { add(t0, t1, (g, lt, it) => O.drawTitle(g, kicker, title, lt, it, o), 2); if (o.blur !== false) O.post.blur.push({ t0: T(t0), t1: T(t1), amt: o.blur ?? 7 }); },
      corner(text, t0, t1, o = {}) { add(t0, t1, (g, lt, it) => O.drawCorner(g, text, lt, it, o)); },
      pill(text, t0, t1, o = {}) { add(t0, t1, (g, lt, it) => O.drawPill(g, text, lt, it, o)); },
      pop(text, t0, t1, o = {}) { add(t0, t1, (g, lt, it) => O.drawPop(g, text, lt, it, o), 1); },
      big(text, sub, t0, t1, o = {}) { add(t0, t1, (g, lt, it) => O.drawBig(g, text, sub, lt, it, o), 1); },
      tag(target, text, t0, t1, o = {}) { add(t0, t1, (g, lt, it) => O.drawTag(g, target, text, lt, it, o)); },
      phone(screen, t0, t1, o = {}) { const it = { t0: T(t0), t1: T(t1), layer: 1, data: o }; it.draw = (g, lt, it2) => O.drawPhone(g, screen, lt, it2, o, T); O.items.push(it); if (o.dim !== false) O.post.dim.push({ t0: T(t0), t1: T(t1), amt: o.dim ?? 0.35 }); if (o.blur) O.post.blur.push({ t0: T(t0), t1: T(t1), amt: o.blur }); },
      notif(app, title, text, t0, t1, o = {}) { add(t0, t1, (g, lt, it) => O.drawNotif(g, app, title, text, lt, it, o), 2); },
      counter(fmt, from, to, t0, t1, o = {}) { add(t0, t1, (g, lt, it) => O.drawCounter(g, fmt, from, to, lt, it, o), 1); },
      choice(a, b, t0, t1, o = {}) { add(t0, t1, (g, lt, it) => O.drawChoice(g, a, b, lt, it, o), 1); },
      custom(t0, t1, fn, layer = 1) { add(t0, t1, fn, layer); },
      flash(t0, dur = 0.3, color = '#fff', peak = 0.9) { const a = T(t0); O.post.trans.push({ kind: 'flash', t0: a, t1: a + dur, color, peak }); },
      fadeIn(dur = 0.4, color = '#000', t0 = 0) { const a = T(t0); O.post.trans.push({ kind: 'fadein', t0: a, t1: a + dur, color }); },
      fadeOut(t0, dur = 0.4, color = '#000') { const a = T(t0); O.post.trans.push({ kind: 'fadeout', t0: a, t1: a + dur, color }); },
      whipIn(dur = 0.18, dir = 1) { O.post.trans.push({ kind: 'whipin', t0: 0, t1: dur, dir }); },
      whipOut(t0, dur = 0.16, dir = 1) { const a = T(t0); O.post.trans.push({ kind: 'whipout', t0: a, t1: a + dur, dir }); },
      zoomIn(dur = 0.22) { O.post.trans.push({ kind: 'zoomin', t0: 0, t1: dur }); },
      blur(t0, t1, amt = 6) { O.post.blur.push({ t0: T(t0), t1: T(t1), amt }); },
      dim(t0, t1, amt = 0.4) { O.post.dim.push({ t0: T(t0), t1: T(t1), amt }); },
      letterbox(t0, t1, h = 110) { O.post.box.push({ t0: T(t0), t1: T(t1), h }); },
      noCaptions() { O.post.nocap = true; },
      tint(t0, t1, color, amt = 0.25) { add(t0, t1, (g, lt, it) => { const k = Math.min(1, (lt - it.t0) / 0.4, (it.t1 - lt) / 0.4); g.save(); g.globalAlpha = amt * k; g.fillStyle = color; g.fillRect(0, 0, O.W, O.H); g.restore(); }, -1); },
    };
  }

  // ---------------- composition ----------------
  compose(gl, t, lt, shot) {
    const g = this.g, W = this.W, H = this.H, P = this.post;
    let blur = 0; for (const b of P.blur) if (lt >= b.t0 && lt <= b.t1) blur = Math.max(blur, b.amt * Math.min(1, (lt - b.t0) / 0.25, (b.t1 - lt) / 0.25));
    // transitions that transform the 3D plate
    let sx = 0, scale = 1, smear = 0, dir = 1;
    for (const tr of P.trans) {
      if (lt < tr.t0 || lt > tr.t1) continue; const k = (lt - tr.t0) / (tr.t1 - tr.t0);
      if (tr.kind === 'whipin') { sx = (1 - E.out(k)) * -W * 0.35 * tr.dir; smear = (1 - k); dir = tr.dir; }
      if (tr.kind === 'whipout') { sx = E.in(k) * W * 0.35 * tr.dir; smear = k; dir = tr.dir; }
      if (tr.kind === 'zoomin') { scale = 1 + (1 - E.out(k)) * 0.25; blur = Math.max(blur, (1 - k) * 8); }
    }
    g.save();
    if (blur > 0.3) g.filter = `blur(${blur.toFixed(1)}px)`;
    if (scale !== 1) { g.translate(W / 2, H / 2); g.scale(scale, scale); g.translate(-W / 2, -H / 2); }
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    g.drawImage(gl, sx, 0, W, H);
    if (smear > 0.02) { g.globalAlpha = 0.22 * smear; for (let i = 1; i <= 5; i++) g.drawImage(gl, sx - dir * i * 40 * smear, 0, W, H); g.globalAlpha = 1; }
    g.restore();
    if (blur > 0.3) { /* slight scale to hide blurred edges */ }
    let dim = 0; for (const d of P.dim) if (lt >= d.t0 && lt <= d.t1) dim = Math.max(dim, d.amt * Math.min(1, (lt - d.t0) / 0.25, (d.t1 - lt) / 0.25));
    if (dim > 0) { g.fillStyle = `rgba(14,4,40,${dim})`; g.fillRect(0, 0, W, H); }
    const items = this.items.filter(it => lt >= it.t0 && lt <= it.t1).sort((a, b) => a.layer - b.layer);
    for (const it of items) { g.save(); it.draw(g, lt, it); g.restore(); }
    // letterbox
    for (const b of P.box) if (lt >= b.t0 && lt <= b.t1) { const k = Math.min(1, (lt - b.t0) / 0.4, (b.t1 - lt) / 0.4); const h = b.h * E.io(k); g.fillStyle = '#05010f'; g.fillRect(0, 0, W, h); g.fillRect(0, H - h, W, h); }
    if (this.captionsOn && !P.nocap) this.drawCaption(g, t);
    for (const tr of P.trans) {
      if (lt < tr.t0 || lt > tr.t1) continue; const k = (lt - tr.t0) / (tr.t1 - tr.t0);
      if (tr.kind === 'flash') { g.globalAlpha = tr.peak * (1 - E.out(k)); g.fillStyle = tr.color; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
      if (tr.kind === 'fadein') { g.globalAlpha = 1 - E.sine(k); g.fillStyle = tr.color; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
      if (tr.kind === 'fadeout') { g.globalAlpha = E.sine(k); g.fillStyle = tr.color; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
    }
    for (const tr of P.trans) if (tr.kind === 'fadeout' && lt > tr.t1) { g.fillStyle = tr.color; g.fillRect(0, 0, W, H); }
    // film finish
    const QS = new URLSearchParams(location.search);
    if (QS.get('vig') !== '0') g.drawImage(this.vignette, 0, 0);
    if (QS.get('grain') !== '1') return;
    g.save(); g.globalAlpha = 0.055; g.globalCompositeOperation = 'overlay';
    const fr = Math.floor(t * 60); g.fillStyle = this.grain[fr % 4]; g.translate((fr * 37) % 256, (fr * 91) % 256); g.fillRect(-256, -256, W + 512, H + 512);
    g.restore();
  }

  // ---------------- captions ----------------
  drawCaption(g, t) {
    const caps = this.caps; let c = null;
    for (let i = 0; i < caps.length; i++) { if (t >= caps[i].start - 0.04 && t < caps[i].hold) { c = caps[i]; break; } if (caps[i].start > t) break; }
    if (!c) return;
    const size = 62; g.font = `600 ${size}px ${FROUND}`; g.textBaseline = 'alphabetic'; g.letterSpacing = '1px';
    const words = c.words.map(w => ({ ...w, disp: w.emph ? w.text.toUpperCase() : w.text }));
    const space = size * 0.36; const widths = words.map(w => g.measureText(w.disp).width);
    const total = widths.reduce((a, b) => a + b, 0) + space * (words.length - 1);
    const k = E.back(clamp((t - c.start + 0.04) / 0.16)); const y = 968;
    let x = this.W / 2 - total / 2;
    g.save(); g.translate(this.W / 2, y); g.scale(0.9 + 0.1 * k, 0.9 + 0.1 * k); g.translate(-this.W / 2, -y); g.globalAlpha = clamp((t - c.start + 0.04) / 0.08);
    g.lineJoin = 'round'; g.miterLimit = 2;
    words.forEach((w, i) => {
      const active = t >= w.start - 0.02 && t < w.end + 0.06;
      const said = t >= w.start - 0.02;
      const cx = x + widths[i] / 2; const pk = active ? 1 + 0.12 * Math.sin(Math.PI * clamp((t - w.start) / 0.22)) : 1;
      g.save(); g.translate(cx, y); g.scale(pk, pk); g.textAlign = 'center';
      g.lineWidth = 15; g.strokeStyle = 'rgba(10,0,30,0.55)'; g.strokeText(w.disp, 0, 7);
      g.lineWidth = 12; g.strokeStyle = INK; g.strokeText(w.disp, 0, 0);
      g.fillStyle = w.emph ? (said ? '#ffcf3a' : '#ffe6a0') : active ? '#ffe14d' : said ? '#ffffff' : 'rgba(255,255,255,0.92)';
      g.fillText(w.disp, 0, 0);
      g.restore();
      x += widths[i] + space;
    });
    g.restore();
  }

  // ---------------- bubbles & icons ----------------
  drawBubble(g, actor, text, lt, it, o) {
    const s = popScale(lt, it.t0, it.t1); if (s <= 0) return;
    let [hx, hy] = o.pos || this.headScreen(actor, 0.5);
    const fs = o.size || 38; g.font = `${fs}px ${FSERIF}`;
    const lines = wrap(g, text, o.w || 520); const lh = fs * 1.18;
    const bw = Math.max(...lines.map(l => g.measureText(l).width)) + fs * 1.3, bh = lines.length * lh + fs * 0.75;
    const side = o.side ?? (hx > this.W * 0.6 ? -1 : 1);
    let bx = hx + side * (40 + bw * 0.15) - (side < 0 ? bw : 0), by = hy - bh - 70 + (o.dy || 0);
    bx = clamp(bx, 30, this.W - bw - 30); by = clamp(by, 30, this.H - bh - 200);
    const ax = bx + bw / 2, ay = by + bh;
    g.translate(ax, ay); g.scale(s, s); g.translate(-ax, -ay);
    g.lineWidth = 5; g.strokeStyle = INK; g.fillStyle = o.fill || '#fff';
    if (o.thought) {
      g.beginPath(); const n = 9; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; const ex = bx + bw / 2 + Math.cos(a) * bw * 0.5, ey = by + bh / 2 + Math.sin(a) * bh * 0.55; g.moveTo(ex + bw * 0.16, ey); g.ellipse(ex, ey, bw * 0.16, bh * 0.3, 0, 0, Math.PI * 2); } g.fill();
      g.beginPath(); g.ellipse(bx + bw / 2, by + bh / 2, bw * 0.52, bh * 0.56, 0, 0, Math.PI * 2); g.fill(); g.stroke();
      g.beginPath(); g.ellipse(bx + bw / 2, by + bh / 2, bw * 0.5, bh * 0.54, 0, 0, Math.PI * 2); g.fill();
      for (const [dx, dy, r] of [[0.0, 22, 11], [side * -18, 48, 7]]) { g.beginPath(); g.arc(hx + (ax - hx) * 0.5 + dx, ay + dy, r, 0, 7); g.fill(); g.stroke(); }
    } else {
      rr(g, bx, by, bw, bh, Math.min(28, bh / 2)); g.fill(); g.stroke();
      // tail
      const tx = clamp(hx, bx + 40, bx + bw - 40);
      g.beginPath(); g.moveTo(tx - 18, by + bh - 3); g.lineTo(hx + (tx - hx) * 0.2, hy - 18); g.lineTo(tx + 18, by + bh - 3); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(tx - 18, by + bh); g.lineTo(hx + (tx - hx) * 0.2, hy - 18); g.lineTo(tx + 18, by + bh); g.stroke();
      g.fillRect(tx - 16, by + bh - 6, 32, 5);
    }
    g.fillStyle = o.color || INK; g.textAlign = 'center'; g.textBaseline = 'middle';
    lines.forEach((l, i) => g.fillText(l, bx + bw / 2, by + fs * 0.4 + lh * (i + 0.5)));
  }

  drawIcon(g, actor, kind, lt, it, o) {
    const s = popScale(lt, it.t0, it.t1, 0.25); if (s <= 0) return;
    let [x, y] = o.pos || this.headScreen(actor, 0.62);
    x += (o.dx || 0); y += (o.dy || 0) + Math.sin(lt * 5) * 6;
    g.translate(x, y); g.scale(s, s); g.rotate(Math.sin(lt * 4) * 0.08);
    g.lineJoin = 'round'; g.textAlign = 'center'; g.textBaseline = 'middle';
    const sz = o.size || 1;
    const glyph = (ch, fill, f = 110) => { g.font = `800 ${f * sz}px ${FPOP}`; g.lineWidth = 12; g.strokeStyle = INK; g.strokeText(ch, 0, 0); g.fillStyle = fill; g.fillText(ch, 0, 0); };
    switch (kind) {
      case '?': glyph('?', '#ffd43b'); break;
      case '??': glyph('??', '#ffd43b'); break;
      case '!': glyph('!', '#ff4d6d'); break;
      case '!!': glyph('!!', '#ff4d6d'); break;
      case '?!': glyph('?!', '#ffd43b'); break;
      case '...': glyph('...', '#ffffff', 90); break;
      case 'zzz': glyph('z', '#bfa8ff', 70); g.translate(40, -40); glyph('z', '#bfa8ff', 50); break;
      case 'heart': g.scale(sz, sz); g.fillStyle = '#ff5d8f'; g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(0, 30); g.bezierCurveTo(-60, -10, -30, -60, 0, -30); g.bezierCurveTo(30, -60, 60, -10, 0, 30); g.fill(); g.stroke(); break;
      case 'sweat': g.scale(sz * 1.4, sz * 1.4); g.fillStyle = '#8fd3ff'; g.strokeStyle = '#2d6bc9'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, -30); g.quadraticCurveTo(22, 5, 0, 18); g.quadraticCurveTo(-22, 5, 0, -30); g.fill(); g.stroke(); break;
      case 'anger': g.scale(sz, sz); g.strokeStyle = '#ff3b5c'; g.lineWidth = 10; g.lineCap = 'round'; for (let i = 0; i < 4; i++) { g.save(); g.rotate(i * Math.PI / 2); g.beginPath(); g.moveTo(10, -30); g.quadraticCurveTo(12, -12, 30, -10); g.stroke(); g.restore(); } break;
      case 'sparkle': g.scale(sz, sz); for (const [dx, dy, r] of [[0, 0, 34], [44, -30, 18], [-40, -24, 14]]) { g.save(); g.translate(dx, dy); g.fillStyle = '#ffe56b'; g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; const q = i % 2 ? r * 0.32 : r; g.lineTo(Math.cos(a) * q, Math.sin(a) * q); } g.closePath(); g.fill(); g.stroke(); g.restore(); } break;
      case 'music': glyph('♪', '#9df2ff', 90); break;
      case 'bulb': glyph('★', '#ffe56b', 90); break;
      case 'dollar': glyph('$', '#7dff9a'); break;
      case 'skull': g.font = `${90 * sz}px "Noto Color Emoji"`; g.fillText('\u{1F480}', 0, 0); break;
      default: g.font = `${90 * sz}px "Noto Color Emoji"`; g.fillText(kind, 0, 0);
    }
  }

  // ---------------- panels, titles, labels ----------------
  drawPanel(g, items, lt, it, o) {
    const x = o.x ?? 60, y = o.y ?? 60; const fs = o.size || 30;
    g.font = `${fs}px ${FSERIF}`;
    const vis = items.filter(i => lt >= i.at);
    if (!vis.length) return;
    const w = (o.w || Math.max(...items.map(i => g.measureText(i.text.toUpperCase()).width + i.text.length * 2.2)) + fs * 2.6);
    const lh = fs * 1.55; const h = vis.length * lh + fs * 0.9;
    const k = Math.min(1, (lt - it.t0) / 0.2, (it.t1 - lt) / 0.2);
    g.globalAlpha = k;
    g.fillStyle = 'rgba(16,8,38,0.82)'; rr(g, x, y, w, h, 14); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.10)'; g.lineWidth = 2; g.stroke();
    vis.forEach((i, n) => {
      const kk = E.back(clamp((lt - i.at) / 0.25));
      const cy = y + fs * 0.45 + lh * (n + 0.5);
      g.save(); g.translate(x + fs * 1.0, cy); g.scale(kk, kk);
      const col = i.mark === 'check' ? '#2ecc71' : i.mark === 'x' ? '#ff4d5e' : i.mark === 'dot' ? '#ffd43b' : '#8c7bff';
      g.fillStyle = col; g.beginPath(); g.arc(0, 0, fs * 0.42, 0, 7); g.fill();
      g.strokeStyle = '#fff'; g.lineWidth = fs * 0.12; g.lineCap = 'round'; g.beginPath();
      if (i.mark === 'check') { g.moveTo(-fs * 0.18, 0); g.lineTo(-fs * 0.04, fs * 0.15); g.lineTo(fs * 0.2, -fs * 0.14); }
      else if (i.mark === 'x') { const q = fs * 0.15; g.moveTo(-q, -q); g.lineTo(q, q); g.moveTo(q, -q); g.lineTo(-q, q); }
      g.stroke(); g.restore();
      g.save(); g.globalAlpha = k * clamp((lt - i.at) / 0.2); g.fillStyle = i.color || '#f4efff'; g.textBaseline = 'middle'; g.font = `${fs}px ${FSERIF}`;
      spaced(g, i.text.toUpperCase(), x + fs * 1.9, cy + 2, 2.2, 'left'); g.restore();
    });
  }

  drawTitle(g, kicker, title, lt, it, o) {
    const k = clamp((lt - it.t0) / 0.5), out = clamp((it.t1 - lt) / 0.35);
    const a = Math.min(E.out(k), out);
    const cx = this.W / 2, cy = o.y ?? this.H / 2 - 30;
    g.globalAlpha = a; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `34px ${FSERIF}`; g.fillStyle = '#ffd36b';
    g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 18;
    spaced(g, kicker.toUpperCase(), cx, cy - 64 - (1 - E.out(k)) * 20, 12);
    const fs = o.size || 92; g.font = `${fs}px ${FSERIF}`; g.fillStyle = '#ffffff';
    const sc = 0.94 + 0.06 * E.out(k); g.save(); g.translate(cx, cy + 22); g.scale(sc, sc); spaced(g, title.toUpperCase(), 0, 0, 5); g.restore();
    g.shadowBlur = 0; g.fillStyle = '#ffd36b'; g.fillRect(cx - 60 * E.out(k), cy + 100, 120 * E.out(k), 3);
  }

  drawCorner(g, text, lt, it, o) {
    const n = Math.floor(clamp((lt - it.t0) / 0.6) * text.length);
    const a = Math.min(1, (it.t1 - lt) / 0.3);
    g.globalAlpha = a; g.font = `26px ${FSERIF}`; g.fillStyle = 'rgba(255,255,255,0.92)'; g.textBaseline = 'top';
    g.shadowColor = 'rgba(0,0,0,0.6)'; g.shadowBlur = 10;
    spaced(g, text.toUpperCase().slice(0, n), o.x ?? 56, o.y ?? 48, 5, 'left');
  }

  drawPill(g, text, lt, it, o) {
    const s = popScale(lt, it.t0, it.t1, 0.25); if (s <= 0) return;
    let x, y;
    if (o.at3d) { [x, y] = this.proj(typeof o.at3d === 'function' ? o.at3d() : o.at3d); } else { x = o.x ?? this.W / 2; y = o.y ?? 120; }
    const fs = o.size || 26; g.font = `${fs}px ${FSERIF}`;
    const tw_ = g.measureText(text.toUpperCase()).width + text.length * 3; const w = tw_ + fs * 1.6, h = fs * 1.7;
    g.translate(x, y); g.scale(s, s);
    g.fillStyle = o.fill || 'rgba(16,8,38,0.85)'; rr(g, -w / 2, -h / 2, w, h, h / 2); g.fill();
    g.strokeStyle = o.stroke || 'rgba(255,255,255,0.85)'; g.lineWidth = 2.5; rr(g, -w / 2 + 5, -h / 2 + 5, w - 10, h - 10, h / 2 - 5); g.stroke();
    g.fillStyle = o.color || '#fff'; g.textBaseline = 'middle'; spaced(g, text.toUpperCase(), 0, 2, 3);
  }

  drawPop(g, text, lt, it, o) {
    const k = (lt - it.t0) / 0.32; const s = Math.min(k < 1 ? E.elastic(k) : 1, clamp((it.t1 - lt) / 0.15));
    if (s <= 0) return;
    let x = o.x ?? this.W / 2, y = o.y ?? this.H * 0.3;
    if (o.actor) { [x, y] = this.headScreen(o.actor, 0.75); x += o.dx || 0; y += o.dy || 0; }
    const fs = o.size || 130;
    g.translate(x + (noise1(lt * 30) - 0.5) * (o.shake || 0), y + (noise1(lt * 30 + 9) - 0.5) * (o.shake || 0)); g.rotate(o.rot ?? -0.06); g.scale(s, s);
    g.font = `800 ${fs}px ${FPOP}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.lineWidth = fs * 0.24; g.strokeStyle = INK; g.strokeText(text, 0, fs * 0.05);
    g.lineWidth = fs * 0.12; g.strokeStyle = o.rim || '#ffffff'; g.strokeText(text, 0, 0);
    const gr = g.createLinearGradient(0, -fs / 2, 0, fs / 2); const c = o.colors || ['#ff8fb3', '#ff2f6d'];
    gr.addColorStop(0, c[0]); gr.addColorStop(1, c[1]); g.fillStyle = gr; g.fillText(text, 0, 0);
  }

  drawBig(g, text, sub, lt, it, o) {
    const s = popScale(lt, it.t0, it.t1, 0.3); if (s <= 0) return;
    const x = o.x ?? this.W / 2, y = o.y ?? this.H / 2 - 40;
    g.translate(x, y); g.scale(s, s); g.textAlign = 'center'; g.textBaseline = 'middle';
    if (o.card !== false) { const w = o.w || 820, h = o.h || 330; const gr = g.createLinearGradient(0, -h / 2, 0, h / 2); gr.addColorStop(0, '#2a1a8f'); gr.addColorStop(1, '#170c5c'); g.fillStyle = gr; rr(g, -w / 2, -h / 2, w, h, 26); g.fill(); g.strokeStyle = '#ffd36b'; g.lineWidth = 4; rr(g, -w / 2 + 10, -h / 2 + 10, w - 20, h - 20, 20); g.stroke(); }
    g.font = `${o.size || 150}px ${FSERIF}`; g.fillStyle = o.color || '#ffd36b'; g.shadowColor = 'rgba(0,0,0,0.4)'; g.shadowBlur = 20;
    g.fillText(typeof text === 'function' ? text(lt - it.t0) : text, 0, sub ? -20 : 0);
    if (sub) { g.shadowBlur = 0; g.font = `34px ${FSERIF}`; g.fillStyle = '#f4efff'; spaced(g, sub.toUpperCase(), 0, 95, 6); }
  }

  drawTag(g, target, text, lt, it, o) {
    const s = popScale(lt, it.t0, it.t1, 0.3); if (s <= 0) return;
    const [px_, py_] = this.proj(typeof target === 'function' ? target() : target);
    const dx = o.dx ?? 160, dy = o.dy ?? -120;
    const lx = px_ + dx, ly = py_ + dy;
    const fs = o.size || 30; g.font = `${fs}px ${FSERIF}`;
    const w = g.measureText(text.toUpperCase()).width + text.length * 2.5 + fs * 1.4, h = fs * 1.7;
    const k = E.out(clamp((lt - it.t0) / 0.3));
    g.strokeStyle = '#fff'; g.lineWidth = 3; g.setLineDash([]);
    g.beginPath(); g.moveTo(px_, py_); g.lineTo(px_ + (lx - px_) * k, py_ + (ly - py_) * k); g.stroke();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(px_, py_, 7, 0, 7); g.fill();
    g.translate(lx + (dx > 0 ? w / 2 : -w / 2), ly); g.scale(s, s);
    g.fillStyle = o.fill || 'rgba(16,8,38,0.88)'; rr(g, -w / 2, -h / 2, w, h, 10); g.fill(); g.strokeStyle = o.stroke || '#ffd36b'; g.lineWidth = 2.5; g.stroke();
    g.fillStyle = o.color || '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; spaced(g, text.toUpperCase(), 0, 2, 2.5);
  }

  drawNotif(g, app, title, text, lt, it, o) {
    const k = Math.min(E.back(clamp((lt - it.t0) / 0.35)), E.out(clamp((it.t1 - lt) / 0.25)));
    const w = 760, h = 138, x = this.W / 2 - w / 2, y = -h + (h + 46) * k;
    g.shadowColor = 'rgba(0,0,0,0.35)'; g.shadowBlur = 30; g.fillStyle = 'rgba(250,248,255,0.97)'; rr(g, x, y, w, h, 30); g.fill(); g.shadowBlur = 0;
    g.fillStyle = o.iconColor || '#6c4cff'; rr(g, x + 24, y + 30, 78, 78, 18); g.fill();
    g.font = `44px "Noto Color Emoji"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(o.icon || '\u{1F4AC}', x + 63, y + 71);
    g.textAlign = 'left'; g.fillStyle = '#7a7290'; g.font = `600 22px ${FUI}`; g.fillText(app.toUpperCase(), x + 124, y + 38); g.fillText('now', x + w - 70, y + 38);
    g.fillStyle = '#1b1530'; g.font = `800 30px ${FUI}`; g.fillText(title, x + 124, y + 74);
    g.font = `400 27px ${FUI}`; g.fillStyle = '#3b3550'; g.fillText(text, x + 124, y + 110);
  }

  drawCounter(g, fmt, from, to, lt, it, o) {
    const k = clamp((lt - it.t0) / (o.dur || (it.t1 - it.t0) * 0.7));
    const v = from + (to - from) * (o.ease ? o.ease(k) : E.out(k));
    this.drawBig(g, fmt(v), o.sub, lt, it, o);
  }

  drawChoice(g, a, b, lt, it, o) {
    const W = this.W, H = this.H;
    [[a, -1], [b, 1]].forEach(([c, side], i) => {
      const s = popScale(lt, it.t0 + i * 0.25, it.t1, 0.3); if (s <= 0) return;
      g.save(); g.translate(W / 2 + side * 330, H / 2 - 60); g.scale(s, s); g.rotate(side * 0.03);
      const w = 520, h = 330; const gr = g.createLinearGradient(0, -h / 2, 0, h / 2); gr.addColorStop(0, c.c1); gr.addColorStop(1, c.c2);
      g.shadowColor = 'rgba(0,0,0,0.4)'; g.shadowBlur = 30; g.fillStyle = gr; rr(g, -w / 2, -h / 2, w, h, 28); g.fill(); g.shadowBlur = 0;
      g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 3; rr(g, -w / 2 + 10, -h / 2 + 10, w - 20, h - 20, 22); g.stroke();
      g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `110px "Noto Color Emoji"`; g.fillText(c.icon, 0, -50);
      g.font = `46px ${FSERIF}`; g.fillStyle = '#fff'; spaced(g, c.title.toUpperCase(), 0, 80, 3);
      if (c.sub) { g.font = `24px ${FSERIF}`; g.fillStyle = 'rgba(255,255,255,0.85)'; spaced(g, c.sub.toUpperCase(), 0, 125, 3); }
      g.restore();
    });
    const k = popScale(lt, it.t0 + 0.4, it.t1, 0.3);
    if (k > 0) { g.save(); g.translate(W / 2, H / 2 - 60); g.scale(k, k); g.fillStyle = '#ffd36b'; g.beginPath(); g.arc(0, 0, 62, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 6; g.stroke(); g.fillStyle = INK; g.font = `800 56px ${FPOP}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('OR', 0, 6); g.restore(); }
  }

  // ---------------- phone ----------------
  drawPhone(g, screen, lt, it, o, T) {
    const inD = o.inDur ?? 0.45, outD = o.outDur ?? 0.3;
    const kin = E.out(clamp((lt - it.t0) / inD)), kout = E.in(clamp((lt - (it.t1 - outD)) / outD));
    const sw = 470, sh = 960; const sc = o.scale || 0.95;
    const x = (o.x ?? this.W / 2), y = (o.y ?? this.H / 2) + (1 - kin) * this.H * 0.9 + kout * this.H * 0.9;
    if (!this.pc) { this.pc = document.createElement('canvas'); this.pc.width = sw; this.pc.height = sh; this.pg = this.pc.getContext('2d'); }
    const pg = this.pg; pg.setTransform(1, 0, 0, 1, 0, 0); pg.clearRect(0, 0, sw, sh); pg.save();
    const fn = typeof screen === 'function' ? screen : PHONE_SCREENS[screen];
    fn(pg, lt - it.t0, sw, sh, o, (a) => T(a) - it.t0);
    pg.restore();
    g.translate(x, y); g.rotate((o.tilt ?? -0.04) + (1 - kin) * 0.15); g.scale(sc, sc);
    if (o.shake) { g.translate((noise1(lt * 40) - 0.5) * o.shake, (noise1(lt * 40 + 5) - 0.5) * o.shake); }
    const fw = sw + 36, fh = sh + 36;
    g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 50; g.shadowOffsetY = 20;
    g.fillStyle = o.caseColor || '#17122a'; rr(g, -fw / 2, -fh / 2, fw, fh, 64); g.fill(); g.shadowBlur = 0; g.shadowOffsetY = 0;
    g.strokeStyle = 'rgba(255,255,255,0.15)'; g.lineWidth = 3; rr(g, -fw / 2 + 3, -fh / 2 + 3, fw - 6, fh - 6, 62); g.stroke();
    g.save(); rr(g, -sw / 2, -sh / 2, sw, sh, 48); g.clip(); g.drawImage(this.pc, -sw / 2, -sh / 2);
    if (o.cracked) drawCracks(g, sw, sh);
    // glass sheen
    const sh_ = g.createLinearGradient(-sw / 2, -sh / 2, sw / 2, sh / 2); sh_.addColorStop(0, 'rgba(255,255,255,0.10)'); sh_.addColorStop(0.45, 'rgba(255,255,255,0)'); g.fillStyle = sh_; g.fillRect(-sw / 2, -sh / 2, sw, sh);
    g.restore();
    g.fillStyle = '#05030c'; rr(g, -60, -sh / 2 + 14, 120, 34, 17); g.fill();
  }
}

function drawCracks(g, sw, sh) {
  g.save(); g.strokeStyle = 'rgba(255,255,255,0.75)'; g.lineWidth = 1.6;
  const r = rng(3.3); const cx = sw * 0.18, cy = -sh * 0.28;
  for (let i = 0; i < 9; i++) { let x = cx, y = cy; const a = i / 9 * Math.PI * 2 + r() * 0.4; g.beginPath(); g.moveTo(x, y); for (let j = 0; j < 7; j++) { x += Math.cos(a + (r() - 0.5) * 0.9) * (40 + r() * 70); y += Math.sin(a + (r() - 0.5) * 0.9) * (40 + r() * 70); g.lineTo(x, y); } g.stroke(); }
  g.beginPath(); g.arc(cx, cy, 26, 0, 7); g.stroke(); g.restore();
}

export function wrap(g, text, maxW) {
  const words = text.split(' '); const lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (g.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur); return lines;
}

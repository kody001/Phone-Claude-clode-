/* Hand-drawn 2D engine: wobbly lines, shapes, text, easing, captions.
 * Works in the browser (window.Engine) and in Node (module.exports).
 * All drawing is deterministic for a given time t, so any frame can be
 * rendered independently (needed for parallel rendering). */
(function (root) {
  const W = 1920, H = 1080, FPS = 60;
  const INK = '#151515';

  // ---------- deterministic randomness ----------
  function hash(n) {
    n = (n ^ 61) ^ (n >>> 16); n = (n + (n << 3)) | 0; n = n ^ (n >>> 4);
    n = Math.imul(n, 0x27d4eb2d); n = n ^ (n >>> 15); return (n >>> 0) / 4294967296;
  }
  const rnd = (a, b = 0, c = 0) => hash((a * 7919 + b * 104729 + c * 1299709) | 0);
  const strSeed = (s) => { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); };

  // ---------- easing ----------
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const ease = {
    linear: (k) => k,
    inOut: (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2),
    out: (k) => 1 - Math.pow(1 - k, 3),
    in: (k) => k * k * k,
    outBack: (k) => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); },
    outElastic: (k) => (k === 0 ? 0 : k === 1 ? 1 : Math.pow(2, -10 * k) * Math.sin((k * 10 - 0.75) * (2 * Math.PI) / 3) + 1),
  };

  // ---------- drawing context wrapper ----------
  class Draw {
    constructor(ctx, assets) { this.ctx = ctx; this.assets = assets || {}; this.t = 0; this.boil = 0; this.amp = 1.6; }
    setTime(t) { this.t = t; this.boil = Math.floor(t * 8); }

    // smooth noise offset for point i of element id at current boil step
    jit(id, i, amp) {
      const a = amp == null ? this.amp : amp;
      return [(rnd(id, i, this.boil) - 0.5) * 2 * a, (rnd(id + 17, i, this.boil) - 0.5) * 2 * a];
    }

    // subdivide a polyline and wobble it
    wobblePts(pts, id, amp, closed) {
      const out = [];
      const n = pts.length;
      const segs = closed ? n : n - 1;
      let k = 0;
      for (let s = 0; s < segs; s++) {
        const [x1, y1] = pts[s], [x2, y2] = pts[(s + 1) % n];
        const len = Math.hypot(x2 - x1, y2 - y1);
        const steps = Math.max(1, Math.min(8, Math.round(len / 60)));
        for (let j = 0; j < steps; j++) {
          const u = j / steps;
          const [jx, jy] = this.jit(id, k++, amp);
          out.push([x1 + (x2 - x1) * u + jx, y1 + (y2 - y1) * u + jy]);
        }
      }
      if (!closed) { const [jx, jy] = this.jit(id, k, amp); const p = pts[n - 1]; out.push([p[0] + jx, p[1] + jy]); }
      return out;
    }

    tracePath(pts, closed, smooth = true) {
      const c = this.ctx;
      c.beginPath();
      if (!smooth || pts.length < 3) {
        c.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
        if (closed) c.closePath();
        return;
      }
      // Catmull-Rom-ish via quadratic midpoints
      const n = pts.length;
      if (closed) {
        const m0 = mid(pts[n - 1], pts[0]);
        c.moveTo(m0[0], m0[1]);
        for (let i = 0; i < n; i++) { const p = pts[i], m = mid(p, pts[(i + 1) % n]); c.quadraticCurveTo(p[0], p[1], m[0], m[1]); }
        c.closePath();
      } else {
        c.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < n - 1; i++) { const m = mid(pts[i], pts[i + 1]); c.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]); }
        c.lineTo(pts[n - 1][0], pts[n - 1][1]);
      }
    }

    stroke(w = 6, color = INK, alpha = 1) {
      const c = this.ctx; c.lineWidth = w; c.strokeStyle = color; c.lineCap = 'round'; c.lineJoin = 'round';
      if (alpha !== 1) { c.save(); c.globalAlpha *= alpha; c.stroke(); c.restore(); } else c.stroke();
    }
    fillP(color, alpha = 1) {
      const c = this.ctx; c.fillStyle = color;
      if (alpha !== 1) { c.save(); c.globalAlpha *= alpha; c.fill(); c.restore(); } else c.fill();
    }

    // polyline / polygon with hand-drawn wobble
    poly(pts, o = {}) {
      const id = o.id == null ? 1 : o.id;
      const amp = o.amp == null ? this.amp : o.amp;
      const wp = amp > 0 ? this.wobblePts(pts, id, amp, !!o.closed) : pts;
      this.tracePath(wp, !!o.closed, o.smooth !== false && !o.sharp);
      if (o.fill) this.fillP(o.fill, o.fillAlpha == null ? 1 : o.fillAlpha);
      if (o.w !== 0) this.stroke(o.w || 6, o.color || INK, o.alpha == null ? 1 : o.alpha);
    }
    // draw only the first fraction k (0-1) of a polyline, by length
    polyK(pts, k, o = {}) {
      if (k <= 0) return;
      if (k >= 1) return this.poly(pts, o);
      let total = 0; const L = [];
      for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); total += d; }
      let rem = total * k; const out = [pts[0]];
      for (let i = 1; i < pts.length; i++) {
        if (rem >= L[i - 1]) { out.push(pts[i]); rem -= L[i - 1]; continue; }
        const u = rem / L[i - 1]; out.push([pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * u, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * u]); break;
      }
      if (out.length >= 2) this.poly(out, Object.assign({}, o, { fill: null, closed: false }));
    }
    line(x1, y1, x2, y2, o = {}) { this.poly([[x1, y1], [x2, y2]], Object.assign({ sharp: true }, o)); }
    // sharp-cornered closed shape (corners wobble, edges straight-ish)
    shape(pts, o = {}) { this.poly(pts, Object.assign({ closed: true, sharp: true }, o)); }
    rect(x, y, w, h, o = {}) { this.shape([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], o); }
    circle(x, y, r, o = {}) {
      const n = Math.max(10, Math.min(28, Math.round(r / 3)));
      const id = o.id == null ? 3 : o.id;
      const pts = [];
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const rr = r + (rnd(id, i, this.boil) - 0.5) * (o.amp == null ? this.amp : o.amp) * 1.4;
        pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * (o.sy || 1)]);
      }
      this.tracePath(pts, true, true);
      if (o.fill) this.fillP(o.fill, o.fillAlpha == null ? 1 : o.fillAlpha);
      if (o.w !== 0) this.stroke(o.w || 6, o.color || INK);
    }
    arc(x, y, r, a0, a1, o = {}) {
      const n = Math.max(6, Math.round(Math.abs(a1 - a0) * r / 25));
      const pts = [];
      for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r * (o.sy || 1)]); }
      this.poly(pts, o);
    }
    // arrow with hand-drawn head
    arrow(x1, y1, x2, y2, o = {}) {
      const w = o.w || 8, col = o.color || '#d32f2f';
      const bend = o.bend || 0;
      const mx = (x1 + x2) / 2 - (y2 - y1) * bend, my = (y1 + y2) / 2 + (x2 - x1) * bend;
      this.poly([[x1, y1], [mx, my], [x2, y2]], { w, color: col, id: o.id || 9 });
      const a = Math.atan2(y2 - my, x2 - mx), hl = o.head || w * 3.6;
      this.poly([[x2 + Math.cos(a + 2.55) * hl, y2 + Math.sin(a + 2.55) * hl], [x2, y2], [x2 + Math.cos(a - 2.55) * hl, y2 + Math.sin(a - 2.55) * hl]], { w, color: col, sharp: true, id: (o.id || 9) + 1 });
    }

    // ---------- text ----------
    font(size, fam = 'Patrick Hand', weight = '') { this.ctx.font = `${weight ? weight + ' ' : ''}${size}px "${fam}"`; }
    text(str, x, y, o = {}) {
      const c = this.ctx;
      this.font(o.size || 48, o.font || 'Patrick Hand', o.weight || '');
      c.textAlign = o.align || 'center'; c.textBaseline = o.base || 'middle';
      c.save();
      if (o.rot) { c.translate(x, y); c.rotate(o.rot); x = 0; y = 0; }
      if (o.alpha != null) c.globalAlpha *= o.alpha;
      if (o.outline) { c.lineWidth = o.outline; c.strokeStyle = o.outlineColor || '#fff'; c.lineJoin = 'round'; c.strokeText(str, x, y); }
      c.fillStyle = o.color || INK; c.fillText(str, x, y);
      c.restore();
    }
    fit(str, maxW, size, fam = 'Patrick Hand', weight = '') { const w = this.measure(str, size, fam, weight); return w > maxW ? size * maxW / w : size; }
    measure(str, size, fam = 'Patrick Hand', weight = '') { this.font(size, fam, weight); return this.ctx.measureText(str).width; }
    // wrap text into lines within width
    wrap(str, width, size, fam = 'Patrick Hand', weight = '') {
      this.font(size, fam, weight);
      const words = str.split(' '); const lines = []; let cur = '';
      for (const w of words) {
        const test = cur ? cur + ' ' + w : w;
        if (this.ctx.measureText(test).width > width && cur) { lines.push(cur); cur = w; } else cur = test;
      }
      if (cur) lines.push(cur);
      return lines;
    }

    // ---------- transforms ----------
    push(x = 0, y = 0, s = 1, rot = 0, alpha = 1) {
      const c = this.ctx; c.save(); c.translate(x, y); if (rot) c.rotate(rot); if (s !== 1) c.scale(s, s); if (alpha !== 1) c.globalAlpha *= alpha;
    }
    pop() { this.ctx.restore(); }

    // ---------- animation helpers ----------
    // 0 before t0, overshooting pop to 1
    popK(t0, dur = 0.35) { if (this.t < t0) return 0; return ease.outBack(clamp((this.t - t0) / dur)); }
    inK(t0, dur = 0.4, e = ease.out) { if (this.t < t0) return 0; return e(clamp((this.t - t0) / dur)); }
    // progress through [t0,t1]
    prog(t0, t1, e = ease.inOut) { return e(clamp((this.t - t0) / Math.max(0.001, t1 - t0))); }
    // draw a child with pop-in scaling at its anchor
    popIn(t0, x, y, fn, o = {}) {
      const k = this.popK(t0, o.dur || 0.35);
      if (k <= 0) return false;
      this.push(x, y, Math.max(0.001, k) * (o.s || 1), o.rot || 0); fn(); this.pop();
      return true;
    }
  }
  function mid(a, b) { return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; }

  // ---------- captions ----------
  // groups: [{words:[{text,s,e,emph}], s, e}]
  function buildCaptions(words) {
    const clean = (t) => t.replace(/\.\.\./g, '').replace(/[.,;:]+$/g, '').replace(/^["“]|["”]$/g, '"').trim();
    const groups = []; let cur = [];
    const flush = () => { if (cur.length) groups.push(cur); cur = []; };
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      const txt = clean(w.text);
      if (!txt) continue;
      if (cur.length && w.para !== cur[cur.length - 1].para) flush();
      cur.push({ text: txt, s: w.s, e: w.e, emph: w.emph, para: w.para });
      const len = cur.reduce((a, x) => a + x.text.length + 1, 0);
      const brk = /(\.\.\.|[.?!;:])["”]?$/.test(w.text) || (/,$/.test(w.text) && cur.length >= 3);
      const next = words[i + 1];
      const gap = next ? next.s - w.e : 1;
      if (brk || cur.length >= 6 || len > 34 || gap > 0.45) flush();
    }
    flush();
    const out = groups.map((g) => ({ words: g, s: g[0].s, e: g[g.length - 1].e }));
    for (let i = 0; i < out.length; i++) {
      const nx = out[i + 1];
      out[i].hold = nx ? Math.min(nx.s, out[i].e + 0.6) : out[i].e + 1;
    }
    return out;
  }

  function drawCaptions(D, caps, t) {
    // binary search active group
    let lo = 0, hi = caps.length - 1, idx = -1;
    while (lo <= hi) { const m = (lo + hi) >> 1; if (caps[m].s <= t) { idx = m; lo = m + 1; } else hi = m - 1; }
    if (idx < 0) return;
    const g = caps[idx];
    if (t > g.hold) return;
    const c = D.ctx; const size = 62; const fam = 'Kalam'; const weight = 'bold';
    D.font(size, fam, weight);
    const space = c.measureText(' ').width;
    const widths = g.words.map((w) => c.measureText(w.text).width);
    const total = widths.reduce((a, b) => a + b, 0) + space * (g.words.length - 1);
    let x = W / 2 - total / 2; const y = 1006;
    const k = ease.outBack(clamp((t - g.s) / 0.18));
    c.save(); c.translate(W / 2, y); c.scale(0.85 + 0.15 * k, 0.85 + 0.15 * k); c.translate(-W / 2, -y);
    c.textAlign = 'left'; c.textBaseline = 'middle';
    g.words.forEach((w, i) => {
      const active = t >= w.s - 0.02 && (i === g.words.length - 1 ? true : t < g.words[i + 1].s - 0.02);
      const spoken = t >= w.s - 0.02;
      c.lineJoin = 'round'; c.lineWidth = 14; c.strokeStyle = '#ffffff'; c.strokeText(w.text, x, y);
      let col = spoken ? '#151515' : '#151515';
      if (w.emph) col = '#d32f2f';
      if (active) {
        // highlighter swipe behind the active word
        c.save(); c.globalAlpha = 0.85; c.fillStyle = '#ffe14d';
        const hw = widths[i] + 16; c.beginPath();
        c.moveTo(x - 8, y - 30); c.lineTo(x - 8 + hw, y - 33); c.lineTo(x - 8 + hw + 3, y + 27); c.lineTo(x - 10, y + 30); c.closePath(); c.fill(); c.restore();
      }
      c.fillStyle = col; c.fillText(w.text, x, y);
      x += widths[i] + space;
    });
    c.restore();
  }

  const Engine = { W, H, FPS, INK, hash, rnd, strSeed, clamp, lerp, ease, Draw, buildCaptions, drawCaptions };
  if (typeof module !== 'undefined' && module.exports) module.exports = Engine; else root.Engine = Engine;
})(typeof window !== 'undefined' ? window : globalThis);

/* Scene framework: cue lookup on the voiceover word timings, shot runner,
 * and reusable layout helpers (narrator, cards, charts, map, pop-ins). */
(function (root) {
  const isNode = typeof module !== 'undefined' && module.exports;
  const E = isNode ? require('./engine.js') : root.Engine;
  const C = isNode ? require('./characters.js') : root.Characters;
  const P = isNode ? require('./props.js') : root.Props;
  const { clamp, lerp, ease, rnd } = E;
  const INK = E.INK;

  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9%$' ]/g, ' ').split(/\s+/).filter(Boolean);

  class Timeline {
    constructor(words, env) {
      this.words = words; this.env = env;
      this.keys = words.map((w) => norm(w.text).join(''));
      this.end = words[words.length - 1].e + 0.9;
    }
    find(phrase, from = 0) {
      const toks = norm(phrase).map((x) => x); // phrase tokens
      // phrase tokens may span word tokens; compare joined strings
      const target = toks.join('');
      for (let i = from; i < this.words.length; i++) {
        let acc = '';
        for (let j = i; j < this.words.length && acc.length < target.length; j++) {
          acc += this.keys[j];
          if (acc === target || (acc.startsWith(target) && j === i + 0) || (acc.startsWith(target) && acc.length - target.length < this.keys[j].length)) return i;
          if (!target.startsWith(acc)) break;
        }
      }
      return -1;
    }
    talk(t) { const i = Math.floor(t * 60); return this.env[Math.max(0, Math.min(this.env.length - 1, i))] || 0; }
  }

  const MOOD_EXPR = {
    'more expressive': 'happy', 'whispering': 'whisper', 'surprise': 'surprise', 'less expressive': 'calm',
    'relief': 'relief', 'sadness': 'sad', 'determination': 'determined', 'low pitch': 'serious', 'fear': 'worried',
    'amusement': 'smirk', 'confusion': 'confused',
  };

  // ---------------------------------------------------------------- shots
  function buildShots(TL, defs) {
    const shots = []; let cursor = 0;
    for (const d of defs) {
      const idx = d.cue === 0 ? 0 : TL.find(d.cue, cursor);
      if (idx < 0) throw new Error('cue not found: "' + d.cue + '" after word ' + cursor + ' (' + (TL.words[cursor] || {}).text + ')');
      shots.push({ def: d, idx, t0: idx === 0 ? 0 : Math.max(0, TL.words[idx].s - 0.12) });
      cursor = idx + 1;
    }
    for (let i = 0; i < shots.length; i++) { shots[i].t1 = i + 1 < shots.length ? shots[i + 1].t0 : TL.end; shots[i].endIdx = i + 1 < shots.length ? shots[i + 1].idx : TL.words.length; }
    return shots;
  }

  class Shot {
    constructor(TL, s) { Object.assign(this, s); this.TL = TL; this.cache = {}; this.mood = TL.words[s.idx].mood; }
    // time of a phrase within (or just after) this shot
    w(phrase, which = 0) {
      const key = phrase + '#' + which;
      if (this.cache[key] != null) return this.cache[key];
      let from = this.idx, idx = -1;
      for (let n = 0; n <= which; n++) { idx = this.TL.find(phrase, from); if (idx < 0) break; from = idx + 1; }
      if (idx < 0 || idx > this.endIdx + 40) throw new Error('phrase not found in shot "' + this.def.cue + '": ' + phrase);
      return (this.cache[key] = this.TL.words[idx].s);
    }
    we(phrase) { // end time of phrase
      const i = this.TL.find(phrase, this.idx); const n = norm(phrase).length;
      let j = i, acc = '', target = norm(phrase).join('');
      while (j < this.TL.words.length && acc.length < target.length) { acc += this.TL.keys[j]; j++; }
      return this.TL.words[j - 1].e;
    }
    get dur() { return this.t1 - this.t0; }
  }

  // ---------------------------------------------------------------- helpers
  const H = {};
  H.bg = (D, col = '#ffffff') => { D.ctx.fillStyle = col; D.ctx.fillRect(-200, -200, E.W + 400, E.H + 400); };

  // auto "beat" gestures for the narrator through a shot
  H.autoPoses = (S, seedN = 1) => {
    const lib = ['rest', 'presentR', 'both', 'rest', 'presentL', 'count', 'rest', 'shrug', 'presentR', 'hips'];
    const keys = [[S.t0 - 1, 'rest']];
    const words = S.TL.words;
    let last = S.t0;
    for (let i = S.idx; i < S.endIdx; i++) {
      const w = words[i];
      if (w.emph && w.s - last > 0.6) { keys.push([w.s - 0.15, rnd(seedN, i) > 0.5 ? 'fist' : 'count']); keys.push([w.e + 0.5, 'rest']); last = w.e + 0.5; continue; }
      if (w.s - last > 2.2) { keys.push([w.s, lib[Math.floor(rnd(seedN, i, 3) * lib.length)]]); last = w.s; }
    }
    return keys;
  };

  // narrator mascot; o.pose may be omitted (auto gestures)
  H.M = (D, S, o = {}) => {
    const talk = o.mute ? 0 : S.TL.talk(D.t);
    let expr = o.expr;
    if (!expr) {
      const moodE = MOOD_EXPR[S.mood] || 'neutral';
      // strong moods soften after a few seconds into the shot
      const mild = { surprise: 'happy', whisper: 'neutral', worried: 'worried', confused: 'confused' };
      expr = D.t - S.t0 > 3.5 && mild[moodE] ? mild[moodE] : moodE;
    }
    if (typeof expr === 'function') expr = expr(D.t);
    if (Array.isArray(expr)) { let e = expr[0][1]; for (const [et, ee] of expr) if (D.t >= et) e = ee; expr = e; }
    const pose = o.pose || (S._auto || (S._auto = H.autoPoses(S, S.idx)));
    let x = o.x == null ? 400 : o.x, y = o.y == null ? 935 : o.y;
    if (o.enter != null) { const k = D.inK(o.enter, 0.6); x = lerp(o.fromX == null ? -300 : o.fromX, x, k); }
    let fx = o.fx; if (Array.isArray(fx)) { let f = null; for (const [ft, ff] of fx) if (D.t >= ft) f = ff; fx = f; }
    C.mascot(D, { x, y, s: o.s || 0.95, pose, expr, talk, tilt: o.tilt || 0, fx, walk: o.walk, jump: o.jump, wave: o.wave, blinkSeed: 7, lean: o.lean });
  };

  // extra stickman with pop-in
  H.guy = (D, S, at, o) => {
    const k = at == null ? 1 : D.popK(at, 0.35);
    if (k <= 0) return;
    let x = o.x;
    if (o.walkFrom != null) { const kk = D.inK(at, o.walkDur || 1.2, ease.inOut); x = lerp(o.walkFrom, o.x, kk); if (kk < 1) o = Object.assign({}, o, { walk: (D.t - at) * 1.6 }); }
    if (o.walkTo != null && D.t > o.walkAt) { const kk = D.inK(o.walkAt, o.walkDur || 1.4, ease.in); x = lerp(o.x, o.walkTo, kk); o = Object.assign({}, o, { walk: (D.t - o.walkAt) * 1.6, flip: o.walkTo < o.x ? !o.flipBase : o.flipBase }); }
    const s = (o.s || 1) * (o.walkFrom != null ? 1 : k);
    let talk = 0; if (o.talks) talk = S.TL.talk(D.t);
    C.stick(D, Object.assign({}, o, { x, s, talk }));
  };

  H.prop = (D, at, name, x, y, s = 1, o = {}) => {
    const k = at == null ? 1 : D.popK(at, o.dur || 0.38);
    if (k <= 0) return;
    let yy = y; if (o.float) yy += Math.sin(D.t * 2 + x) * 6;
    if (o.slideFrom) { const kk = D.inK(at, 0.5); P.draw(D, name, lerp(o.slideFrom[0], x, kk), lerp(o.slideFrom[1], yy, kk), s, o); return; }
    if (o.drop) { const kk = D.inK(at, 0.5, ease.outBack); P.draw(D, name, x, lerp(yy - 500, yy, kk), s, o); return; }
    P.draw(D, name, x, yy, s * k, o);
  };

  // big handwritten text that pops in
  H.big = (D, at, str, x, y, o = {}) => {
    const k = D.popK(at, 0.32); if (k <= 0) return;
    D.push(x, y, k, o.rot == null ? -0.04 : o.rot);
    const size = o.size || 110; const fam = o.font || 'Permanent Marker';
    if (o.box) { const w = D.measure(str, size, fam) + 50; D.rect(-w / 2, -size * 0.62, w, size * 1.24, { fill: o.box, w: 6, id: 7000 + Math.round(x) }); }
    D.text(str, 0, 0, { size, font: fam, color: o.color || '#d32f2f', outline: o.outline, outlineColor: o.outlineColor });
    if (o.underline) { const w = D.measure(str, size, fam); D.polyK([[-w / 2, size * 0.55], [0, size * 0.6], [w / 2, size * 0.5]], D.prog(at + 0.2, at + 0.5), { w: 8, color: o.ulColor || o.color || '#d32f2f', id: 7100 }); }
    D.pop();
  };
  H.label = (D, at, str, x, y, o = {}) => {
    const k = at == null ? 1 : D.inK(at, 0.25); if (k <= 0) return;
    D.text(str, x, y, { size: o.size || 44, font: o.font || 'Patrick Hand', color: o.color || INK, alpha: k, align: o.align || 'center', rot: o.rot, outline: o.outline, weight: o.weight });
  };

  // counting number
  H.count = (D, at, dur, from, to, fmt, x, y, o = {}) => {
    if (D.t < at) return;
    const k = ease.out(clamp((D.t - at) / dur));
    const v = lerp(from, to, k);
    H.big(D, at, fmt(v), x, y, o);
  };
  H.fmt = {
    int: (v) => Math.round(v).toLocaleString('en-US'),
    usd: (v) => '$' + Math.round(v).toLocaleString('en-US'),
    pct: (d = 0) => (v) => v.toFixed(d) + '%',
  };

  // hand-drawn red circle around (x,y)
  H.ring = (D, at, x, y, rx, ry, o = {}) => {
    if (D.t < at) return;
    const k = D.prog(at, at + (o.dur || 0.45), ease.out);
    const pts = []; for (let i = 0; i <= 30; i++) { const a = -1.9 + (i / 30) * Math.PI * 2.15; pts.push([x + Math.cos(a) * rx * (1 + i * 0.002), y + Math.sin(a) * ry]); }
    D.polyK(pts, k, { w: o.w || 7, color: o.color || '#d32f2f', id: 7200 + Math.round(x + y) });
  };
  H.arrow = (D, at, x1, y1, x2, y2, o = {}) => {
    if (D.t < at) return;
    const k = D.prog(at, at + (o.dur || 0.35), ease.out);
    D.arrow(x1, y1, lerp(x1, x2, k), lerp(y1, y2, k), o);
  };
  H.cross = (D, at, x, y, r, o = {}) => {
    if (D.t < at) return;
    const k1 = D.prog(at, at + 0.18), k2 = D.prog(at + 0.18, at + 0.36);
    D.polyK([[x - r, y - r], [x + r, y + r]], k1, { w: o.w || 12, color: o.color || '#d32f2f', id: 7300 });
    D.polyK([[x + r, y - r], [x - r, y + r]], k2, { w: o.w || 12, color: o.color || '#d32f2f', id: 7301 });
  };
  H.check = (D, at, x, y, r, o = {}) => {
    if (D.t < at) return;
    D.polyK([[x - r, y], [x - r * 0.3, y + r * 0.7], [x + r, y - r * 0.8]], D.prog(at, at + 0.3), { w: o.w || 12, color: o.color || '#2e7d32', id: 7310 });
  };

  // article / data card with highlighter sweeps
  H.card = (D, at, o) => {
    const k = D.popK(at, 0.35); if (k <= 0) return;
    const x = o.x, y = o.y, w = o.w || 760;
    const tsize = o.tsize || 46, bsize = o.bsize || 36;
    const tl = D.wrap(o.title || '', w - 60, tsize, 'Kalam', 'bold');
    const body = []; (o.body || []).forEach((b, i) => D.wrap(b, w - 70, bsize).forEach((ln) => body.push({ ln, i })));
    const h = 50 + tl.length * tsize * 1.15 + (body.length ? 24 : 0) + body.length * bsize * 1.3 + (o.src ? 54 : 10) + (o.extraH || 0);
    D.push(x, y, k, o.rot || 0);
    const c = D.ctx;
    c.save(); c.fillStyle = 'rgba(0,0,0,0.10)'; c.fillRect(-w / 2 + 10, -h / 2 + 12, w, h); c.restore();
    D.rect(-w / 2, -h / 2, w, h, { fill: '#ffffff', w: 4, color: '#cfcfcf', amp: 0.6, id: 7400 });
    if (o.tag) { D.rect(-w / 2, -h / 2, w, 12, { fill: o.tag, w: 0, amp: 0, id: 7401 }); }
    let yy = -h / 2 + 38 + tsize / 2;
    tl.forEach((ln) => { D.text(ln, -w / 2 + 30, yy, { size: tsize, font: 'Kalam', weight: 'bold', align: 'left', color: o.tcolor || '#1b1b1b' }); yy += tsize * 1.15; });
    yy += 14;
    body.forEach((b) => {
      const hl = (o.hl || []).find((h2) => h2[0] === b.i);
      if (hl && D.t >= hl[1]) {
        const tw = D.measure(b.ln, bsize);
        const kk = D.prog(hl[1], hl[1] + 0.55, ease.out);
        c.save(); c.globalAlpha = 0.75; c.fillStyle = hl[2] || '#ffeb3b';
        c.fillRect(-w / 2 + 30, yy - bsize * 0.55, tw * kk + 6, bsize * 1.1); c.restore();
      }
      D.text(b.ln, -w / 2 + 34, yy + 2, { size: bsize, align: 'left', color: '#333' });
      yy += bsize * 1.3;
    });
    if (o.src) D.text(o.src, -w / 2 + 30, h / 2 - 28, { size: 26, align: 'left', color: '#8a8a8a' });
    if (o.inner) o.inner(D, w, h);
    D.pop();
  };

  // line chart drawn progressively. data: array of numbers
  H.lineChart = (D, at, o) => {
    const k = D.popK(at, 0.3); if (k <= 0) return;
    const { x, y } = o; const w = o.w || 700, h = o.h || 380;
    D.push(x, y, k);
    if (o.frame !== false) {
      const c = D.ctx; c.save(); c.fillStyle = 'rgba(0,0,0,0.08)'; c.fillRect(-w / 2 + 10, -h / 2 + 10, w + 20, h + 90); c.restore();
      D.rect(-w / 2 - 10, -h / 2 - 70, w + 40, h + 140, { fill: '#fff', w: 4, color: '#cfcfcf', amp: 0.6, id: 7500 });
    }
    if (o.title) D.text(o.title, -w / 2 + 10, -h / 2 - 30, { size: o.tsize || 38, font: 'Kalam', weight: 'bold', align: 'left' });
    const x0 = -w / 2 + 40, x1 = w / 2 - 10, y0 = h / 2 - 20, y1 = -h / 2 + 20;
    D.line(x0, y0, x1, y0, { w: 4, id: 7501 }); D.line(x0, y0, x0, y1, { w: 4, id: 7502 });
    const data = o.data; const mn = o.min == null ? Math.min(...data) : o.min, mx = o.max == null ? Math.max(...data) : o.max;
    const pts = data.map((v, i) => [x0 + (x1 - x0) * i / (data.length - 1), y0 - (y0 - y1) * (v - mn) / (mx - mn || 1)]);
    const kk = D.prog(at + 0.2, at + 0.2 + (o.dur || 1.6), ease.inOut);
    D.polyK(pts, kk, { w: o.lw || 8, color: o.color || '#1e88e5', id: 7503, amp: 0.8 });
    (o.xl || []).forEach((l, i, arr) => D.text(l, x0 + (x1 - x0) * i / (arr.length - 1), y0 + 30, { size: 28, color: '#666' }));
    if (o.after) o.after(D, pts, { x0, x1, y0, y1 });
    D.pop();
  };

  // bar chart; items [{label, v, color, at, txt}]
  H.bars = (D, o) => {
    const { x, y } = o; const w = o.w || 700, h = o.h || 380; const n = o.items.length;
    const mx = o.max || Math.max(...o.items.map((i) => i.v));
    const bw = (w - 40) / n * 0.62;
    D.line(x - w / 2, y, x + w / 2, y, { w: 5, id: 7600 });
    o.items.forEach((it, i) => {
      if (D.t < it.at) return;
      const kk = D.inK(it.at, 0.6, ease.outBack);
      const cx = x - w / 2 + 20 + (w - 40) * (i + 0.5) / n;
      const bh = h * it.v / mx * kk;
      D.rect(cx - bw / 2, y - bh, bw, bh, { fill: it.color || '#1e88e5', w: 5, id: 7610 + i });
      D.text(it.label, cx, y + 36, { size: o.lsize || 34, font: 'Patrick Hand' });
      if (kk > 0.6) D.text(it.txt || String(it.v), cx, y - bh - 32, { size: o.vsize || 42, font: 'Permanent Marker', color: it.tcolor || INK });
    });
    if (o.title) D.text(o.title, x, y - h - 90, { size: o.tsize || 46, font: 'Kalam', weight: 'bold' });
  };

  // florida map with pins: [{city, at, color, label, side}]
  H.fl = (D, at, o) => {
    const k = at == null ? 1 : D.popK(at, 0.4); if (k <= 0) return;
    D.push(o.x, o.y, (o.s || 1) * k);
    P.florida(D, { fill: o.fill, label: o.label == null ? !(o.pins && o.pins.length) && !(o.shade && o.shade.length) : o.label });
    (o.shade || []).forEach((sh) => { if (D.t >= sh.at) { const [cx, cy] = P.flCity(sh.city); const kk = D.inK(sh.at, 0.4); D.circle(cx, cy, (sh.r || 60) * kk, { fill: sh.color || 'rgba(229,57,53,0.35)', w: 0, id: 7700 }); } });
    (o.pins || []).forEach((p, i) => {
      if (D.t < p.at) return;
      const [cx, cy] = P.flCity(p.city); const kk = D.popK(p.at, 0.35);
      D.push(cx, cy, kk / (o.s || 1) * (o.pinS || 1));
      P.pin(D, { color: p.color || '#e53935', id: 7710 + i });
      if (p.label) { const side = p.side || 1; D.text(p.label, side * 26, -50, { size: p.size || 40, font: 'Kalam', weight: 'bold', align: side > 0 ? 'left' : 'right', outline: 8, color: p.tcolor || INK }); }
      D.pop();
    });
    D.pop();
  };

  // row of tiny people icons (e.g. sellers vs buyers)
  H.crowd = (D, at, n, x, y, o = {}) => {
    for (let i = 0; i < n; i++) {
      const t = at + i * (o.stagger == null ? 0.05 : o.stagger); if (D.t < t) continue;
      const kk = D.popK(t, 0.25);
      const col = o.cols ? o.cols : n; const r = Math.floor(i / col), c2 = i % col;
      D.push(x + c2 * (o.dx || 46), y + r * (o.dy || 90), kk * (o.s || 1)); P.person(D, { color: o.color, fill: o.fill, id: 7800 + i }); D.pop();
    }
  };

  // full-screen flash title card
  H.title = (D, at, str, o = {}) => {
    const k = D.popK(at, 0.4); if (k <= 0) return;
    H.big(D, at, str, o.x || E.W / 2, o.y || 420, Object.assign({ size: 130, color: o.color || INK }, o));
  };

  const Scenes = { Timeline, buildShots, Shot, H, MOOD_EXPR, norm };
  if (isNode) module.exports = Scenes; else root.Scenes = Scenes;
})(typeof window !== 'undefined' ? window : globalThis);

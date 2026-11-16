// Props & creatures. drawProp draws at origin (hand / anchor point), scaled by o.s.
'use strict';
const PROPS = {};
function drawProp(c, st, name, o = {}) {
  const f = PROPS[name];
  if (!f) throw new Error('no prop ' + name);
  c.save();
  if (o.s && o.s !== 1) c.scale(o.s, o.s);
  f(c, st, o, o.seed || strSeed(name));
  c.restore();
}
// place a prop in the scene with optional enter animation: o.enter=[when,kind], o.rot, o.s
function prop(c, st, name, x, y, o = {}) {
  let dx = 0, dy = 0, sc = 1, a = 1;
  if (o.enter) {
    const t0 = typeof o.enter[0] === 'number' ? st.s.start + o.enter[0] : st.k(o.enter[0]);
    const e = enter(st, t0, o.enter[1] || 'pop', o.enter[2] || 0.4, { sfx: o.sfx, out: o.out === undefined ? undefined : (typeof o.out[0] === 'number' ? st.s.start + o.out[0] : st.k(o.out[0])), outKind: o.out && o.out[1], outSfx: o.outSfx });
    dx = e.dx; dy = e.dy; sc = e.sc; a = e.a;
    if (sc <= 0.001 || a <= 0.001) return;
  }
  if (o.move) for (const m of o.move) {
    const t0 = typeof m[0] === 'number' ? st.s.start + m[0] : st.k(m[0]);
    const p = (m[4] || E.io)(clamp((st.t - t0) / (m[3] || 0.6)));
    if (st.t >= t0) { x = lerp(x, m[1], p); y = lerp(y, m[2], p); }
  }
  c.save();
  c.globalAlpha *= a * (o.alpha === undefined ? 1 : o.alpha);
  c.translate(x + dx, y + dy);
  if (o.rot) c.rotate(o.rot);
  if (o.bob) c.translate(0, Math.sin(st.t * (o.bobF || 3)) * o.bob);
  if (o.spin) c.rotate(st.t * o.spin);
  c.scale(sc * (o.flip ? -1 : 1), sc);
  drawProp(c, st, name, o);
  c.restore();
}

// ---------- small handheld ----------
PROPS.rock = (c, st, o, sd) => { shp(c, [[-10, 20], [-36, -10], [-20, -60], [6, -96], [22, -50], [28, -6], [12, 22]], { fill: '#9aa0a6', lw: 7, seed: sd }); line(c, [[-20, -60], [4, -30], [6, -96]], { lw: 4, seed: sd + 1 }); };
PROPS.scroll = (c, st, o, sd) => { c.rotate(-0.3); rrect(c, -18, -70, 36, 120, 14, { fill: '#f0deb0', lw: 7, seed: sd }); for (const y of [-74, 46]) rrect(c, -26, y, 52, 18, 8, { fill: '#a0703c', lw: 6, seed: sd + y }); line(c, [[-8, -40], [8, -40]], { lw: 4, seed: sd }); line(c, [[-8, -16], [8, -16]], { lw: 4, seed: sd + 2 }); };
PROPS.cabbage = (c, st, o, sd) => {
  circ(c, 0, -10, 58, { fill: '#7cc243', lw: 8, seed: sd });
  shp(c, ellPts(-22, -16, 42, 50, 20, -1.6, 1.6), { fill: '#a6dc6a', lw: 6, seed: sd + 1, closed: false });
  shp(c, ellPts(20, -12, 40, 50, 20, 1.5, 4.7), { fill: '#a6dc6a', lw: 6, seed: sd + 2, closed: false });
  line(c, [[0, 40], [0, -60]], { lw: 5, stroke: '#4d8a22', seed: sd + 3 }); line(c, [[0, 0], [-30, -30]], { lw: 4, stroke: '#4d8a22', seed: sd }); line(c, [[0, 10], [30, -24]], { lw: 4, stroke: '#4d8a22', seed: sd + 4 });
  if (o.face) { c.fillStyle = INK; c.beginPath(); c.arc(-16, -18, 6, 0, TAU); c.arc(16, -18, 6, 0, TAU); c.fill(); line(c, [[-14, 6], [0, 14], [14, 6]], { lw: 5, seed: sd }); }
};
PROPS.staff = (c, st, o, sd) => {
  line(c, [[0, 300], [0, -330]], { lw: 18, stroke: '#7a4b22', seed: sd }); line(c, [[0, 300], [0, -330]], { lw: 6, stroke: '#a8743d', seed: sd + 1, amp: 0.4 });
  if (o.snake !== false) PROPS.snakeCoil(c, st, o, sd);
};
PROPS.snakeCoil = (c, st, o, sd) => {
  const pts = [];
  for (let i = 0; i <= 60; i++) { const u = i / 60; const y = 220 - u * 500; const x = Math.sin(u * 15) * 34; pts.push([x, y]); }
  line(c, pts, { lw: 26, stroke: INK, seed: sd + 5, amp: 0.4 });
  line(c, pts, { lw: 15, stroke: '#4caf50', seed: sd + 5, amp: 0.4 });
  // head
  c.save(); c.translate(pts[60][0] + 20, pts[60][1] - 26);
  ell(c, 0, 0, 44, 30, { fill: '#4caf50', lw: 7, seed: sd + 6 });
  c.fillStyle = INK; c.beginPath(); c.ellipse(-10, -6, 7, 6, 0, 0, Math.PI); c.ellipse(16, -6, 7, 6, 0, 0, Math.PI); c.fill();
  line(c, [[-20, -9], [0, -11]], { lw: 5, seed: sd }); line(c, [[6, -11], [26, -9]], { lw: 5, seed: sd + 1 });
  line(c, [[-4, 12], [20, 12], [32, 4]], { lw: 5, seed: sd + 2 });
  if (Math.floor(st.t * 2.5) % 3 === 0) line(c, [[42, 6], [70, 10], [78, 2], [70, 10], [78, 18]], { lw: 4, stroke: '#e0262d', seed: sd });
  c.restore();
};
PROPS.lancet = (c, st, o, sd) => { c.rotate(-0.9); rrect(c, -7, -10, 14, 70, 5, { fill: '#7a4b22', lw: 5, seed: sd }); shp(c, [[-8, -10], [0, -90], [9, -10]], { fill: '#d39a4a', lw: 6, seed: sd + 1 }); };
PROPS.shekel = (c, st, o, sd) => { circ(c, 0, 0, 34, { fill: '#d6dbe0', lw: 6, seed: sd }); circ(c, 0, 0, 20, { lw: 3, stroke: '#9aa', seed: sd + 1 }); txt(c, '¤', 0, 2, { size: 34, fill: '#8a949c', lw: 0, shadow: false, font: 'serif' }); };
PROPS.honey = (c, st, o, sd) => {
  shp(c, [[-46, -40], [-56, 20], [-40, 60], [40, 60], [56, 20], [46, -40]], { fill: '#e6a52b', lw: 8, seed: sd });
  rrect(c, -50, -64, 100, 28, 8, { fill: '#c98a2b', lw: 7, seed: sd + 1 });
  shp(c, [[-30, -40], [-30, -10], [-22, 4], [-14, -10], [-14, -40]], { fill: '#f7c948', lw: 5, seed: sd + 2 });
  rrect(c, -28, 0, 56, 30, 6, { fill: '#fff3cf', lw: 4, seed: sd + 3 });
  txt(c, 'HONEY', 0, 16, { size: 18, fill: '#8a5a12', lw: 0, shadow: false });
};
PROPS.horn = (c, st, o, sd) => { shp(c, [[-70, -18], [40, -6], [70, -2], [70, 2], [40, 6], [-70, 18], [-80, 0]], { fill: '#e9d9b1', lw: 7, seed: sd }); for (let i = -50; i < 40; i += 22) line(c, [[i, -14], [i + 4, 14]], { lw: 3, seed: sd + i }); };
PROPS.notebook = (c, st, o, sd) => { c.rotate(-0.15); rrect(c, -60, -76, 120, 150, 8, { fill: '#c9a46a', lw: 7, seed: sd }); rrect(c, -48, -64, 96, 126, 4, { fill: '#f4e7c4', lw: 4, seed: sd + 1 }); for (let i = 0; i < 6; i++) line(c, [[-36, -44 + i * 20], [30 - (i % 3) * 10, -44 + i * 20]], { lw: 3, seed: sd + i, stroke: '#6b5032' }); txt(c, 'REMEDIES', 0, -84 + 0, { size: 0.1, lw: 0, shadow: false }); };
PROPS.jar = (c, st, o, sd) => {
  shp(c, [[-40, -70], [-48, -40], [-50, 50], [-40, 66], [40, 66], [50, 50], [48, -40], [40, -70]], { fill: 'rgba(220,240,250,0.55)', lw: 7, seed: sd });
  c.save(); c.beginPath(); c.rect(-48, -10 + Math.sin(st.t * 3) * 3, 96, 80); c.clip(); shp(c, [[-46, -40], [-48, 50], [-40, 62], [40, 62], [48, 50], [46, -40]], { fill: '#f2d43a', stroke: null, lw: 0, seed: sd }); c.restore();
  rrect(c, -44, -86, 88, 22, 6, { fill: '#8a6a40', lw: 6, seed: sd + 2 });
  if (o.label !== false) { circ(c, 0, 20, 22, { fill: '#7cc243', lw: 4, seed: sd + 3 }); }
};
PROPS.reed = (c, st, o, sd) => { line(c, [[-10, 170], [-4, -170]], { lw: 16, stroke: '#4d8a22', seed: sd }); line(c, [[10, 170], [4, -170]], { lw: 16, stroke: '#6cb33a', seed: sd + 1 }); for (const y of [-90, 0, 90]) line(c, [[-14, y], [14, y]], { lw: 5, stroke: '#2e5a12', seed: sd + y }); };
PROPS.cup = (c, st, o, sd) => { shp(c, [[-40, -40], [40, -40], [24, 0], [6, 8], [6, 40], [24, 50], [-24, 50], [-6, 40], [-6, 8], [-24, 0]], { fill: '#c9a227', lw: 6, seed: sd }); ell(c, 0, -40, 40, 10, { fill: '#7b1f3a', lw: 5, seed: sd + 1 }); };
PROPS.phone = (c, st, o, sd) => { rrect(c, -34, -64, 68, 128, 12, { fill: '#222', lw: 6, seed: sd }); rrect(c, -26, -52, 52, 98, 4, { fill: o.screen || '#5bc0ff', lw: 0, stroke: null, seed: sd }); };
PROPS.quill = (c, st, o, sd) => { c.rotate(-0.5); shp(c, [[0, 40], [-16, -40], [-6, -110], [10, -60], [6, 30]], { fill: '#fff', lw: 6, seed: sd }); line(c, [[0, 40], [-4, -100]], { lw: 3, seed: sd + 1 }); };
PROPS.bowl = (c, st, o, sd) => { shp(c, [[-60, -10], [60, -10], ...ellPts(0, -10, 60, 46, 16, 0, Math.PI).slice(1, -1)], { fill: '#b5651d', lw: 7, seed: sd }); for (let i = -2; i <= 2; i++) circ(c, i * 18, -18, 12, { fill: i % 2 ? '#6aa84f' : '#93c47d', lw: 4, seed: sd + i }); };
PROPS.torch = (c, st, o, sd) => { line(c, [[0, 80], [0, -40]], { lw: 14, stroke: '#6b3e1e', seed: sd }); fire(c, 0, -50, 1, st.t, sd); };
PROPS.hammer = (c, st, o, sd) => { c.rotate(-0.4); line(c, [[0, 60], [0, -50]], { lw: 12, stroke: '#7a4b22', seed: sd }); rrect(c, -34, -76, 68, 32, 6, { fill: '#7d7d7d', lw: 6, seed: sd + 1 }); };
PROPS.chisel = (c, st, o, sd) => { c.rotate(0.6); rrect(c, -8, -40, 16, 60, 4, { fill: '#888', lw: 5, seed: sd }); shp(c, [[-8, 20], [8, 20], [0, 44]], { fill: '#bbb', lw: 5, seed: sd + 1 }); };
PROPS.onion = (c, st, o, sd) => { shp(c, [[0, -50], [26, -20], [34, 10], [20, 34], [-20, 34], [-34, 10], [-26, -20]], { fill: '#c97ab0', lw: 6, seed: sd }); line(c, [[0, -50], [0, -64]], { lw: 5, stroke: '#5a8a2a', seed: sd }); };
PROPS.myrrh = (c, st, o, sd) => { shp(c, [[-24, 10], [-18, -16], [4, -24], [24, -8], [20, 16], [-4, 22]], { fill: '#b8641e', lw: 6, seed: sd }); c.fillStyle = 'rgba(255,220,150,0.6)'; c.beginPath(); c.arc(-6, -8, 6, 0, TAU); c.fill(); };
PROPS.dung = (c, st, o, sd) => { for (let i = 0; i < 3; i++) ell(c, 0, -i * 26, 54 - i * 14, 22, { fill: i % 2 ? '#6b4423' : '#5a3a1c', lw: 6, seed: sd + i }); circ(c, 0, -76, 10, { fill: '#5a3a1c', lw: 5, seed: sd + 5 }); if (o.flies !== false) flies(c, 0, -60, st.t, 4, 1); };
PROPS.linen = (c, st, o, sd) => { rrect(c, -50, -30, 100, 60, 26, { fill: '#f5f1e6', lw: 6, seed: sd }); ell(c, -50, 0, 14, 30, { fill: '#e8e0cc', lw: 5, seed: sd + 1 }); };
PROPS.mag = (c, st, o, sd) => { line(c, [[30, 40], [80, 110]], { lw: 16, stroke: '#7a4b22', seed: sd }); circ(c, 0, 0, 50, { fill: 'rgba(200,235,255,0.5)', lw: 9, seed: sd + 1 }); };
PROPS.clip = (c, st, o, sd) => { rrect(c, -60, -80, 120, 160, 8, { fill: '#b07a3a', lw: 6, seed: sd }); rrect(c, -48, -62, 96, 132, 3, { fill: '#fff', lw: 3, seed: sd + 1 }); for (let i = 0; i < 5; i++) line(c, [[-36, -40 + i * 22], [36, -40 + i * 22]], { lw: 3, seed: sd + i, stroke: '#999' }); };
PROPS.incense = (c, st, o, sd) => { line(c, [[0, 40], [0, -10]], { lw: 5, seed: sd }); shp(c, [[-30, -10], [30, -10], [20, -40], [-20, -40]], { fill: '#c9a227', lw: 6, seed: sd }); for (let i = 0; i < 3; i++) { const ph = (st.t * 0.4 + i / 3) % 1; c.save(); c.globalAlpha *= (1 - ph) * 0.6; c.fillStyle = '#ddd'; c.beginPath(); c.arc(Math.sin(ph * 8 + i) * 16, -50 - ph * 120, 10 + ph * 20, 0, TAU); c.fill(); c.restore(); } };
PROPS.scepter = (c, st, o, sd) => { line(c, [[0, 120], [0, -120]], { lw: 12, stroke: '#c9a227', seed: sd }); circ(c, 0, -130, 20, { fill: '#f0c419', lw: 6, seed: sd + 1 }); };
PROPS.tablet = (c, st, o, sd) => { rrect(c, -70, -90, 140, 180, 26, { fill: '#b98d5c', lw: 7, seed: sd }); c.fillStyle = 'rgba(80,50,20,0.5)'; for (let r = 0; r < 7; r++) for (let k = 0; k < 6; k++) { if (rnd(sd + r, k) < 0.25) continue; const x = -48 + k * 18, y = -66 + r * 22; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 10, y + 3); c.lineTo(x, y + 7); c.fill(); } };

// ---------- creatures ----------
PROPS.ibis = (c, st, o, sd) => {
  const t = st.t;
  line(c, [[-20, 60], [-26, 150]], { lw: 7, stroke: '#333', seed: sd }); line(c, [[20, 60], [26, 150]], { lw: 7, stroke: '#333', seed: sd + 1 });
  ell(c, 0, 20, 90, 58, { fill: '#fdfdfd', lw: 8, seed: sd + 2 });
  shp(c, [[40, -10], [100, -30], [70, 20]], { fill: '#222', lw: 6, seed: sd + 3 });
  line(c, [[-40, 0], [-70, -60], [-70, -110]], { lw: 30, stroke: INK, seed: sd + 4 });
  line(c, [[-40, 0], [-70, -60], [-70, -110]], { lw: 18, stroke: '#fdfdfd', seed: sd + 4 });
  circ(c, -70, -130, 34, { fill: '#222', lw: 7, seed: sd + 5 });
  const bk = o.beak === 'down' ? [[-90, -126], [-140, -90], [-160, 10]] : [[-96, -130], [-170, -110], [-220, -60]];
  line(c, bk, { lw: 12, stroke: INK, seed: sd + 6 }); line(c, bk, { lw: 6, stroke: '#c8743a', seed: sd + 6, amp: 0.3 });
  c.fillStyle = '#fff'; c.beginPath(); c.arc(-76, -136, 8, 0, TAU); c.fill(); c.fillStyle = INK; c.beginPath(); c.arc(-78, -136, 4, 0, TAU); c.fill();
};
PROPS.croc = (c, st, o, sd) => {
  const jaw = o.snap ? Math.abs(Math.sin(st.t * 8)) * 0.4 : (o.jaw || 0.12);
  ell(c, 40, 0, 190, 60, { fill: '#5d9b3a', lw: 8, seed: sd });
  for (let i = 0; i < 6; i++) shp(c, [[i * 50 - 60, -50], [i * 50 - 40, -84], [i * 50 - 20, -52]], { fill: '#4a7f2c', lw: 5, seed: sd + i });
  shp(c, [[220, 0], [360, -10], [350, 20], [220, 40]], { fill: '#5d9b3a', lw: 7, seed: sd + 9 });
  c.save(); c.translate(-130, -6);
  c.save(); c.rotate(-jaw); shp(c, [[0, -30], [-180, -26], [-196, -6], [0, 0]], { fill: '#6db044', lw: 7, seed: sd + 10 }); for (let i = 0; i < 6; i++) shp(c, [[-30 - i * 26, -2], [-40 - i * 26, 10], [-50 - i * 26, -2]], { fill: '#fff', lw: 3, seed: sd + i }); c.restore();
  c.save(); c.rotate(jaw * 0.5); shp(c, [[0, 0], [-176, 6], [-170, 26], [0, 30]], { fill: '#6db044', lw: 7, seed: sd + 11 }); c.restore();
  circ(c, -20, -44, 22, { fill: '#fff', lw: 6, seed: sd + 12 }); c.fillStyle = INK; c.beginPath(); c.ellipse(-24, -44, 6, 12, 0, 0, TAU); c.fill();
  if (o.confused) txt(c, '?', 10, -120, { size: 90, fill: '#ffd23f' });
  c.restore();
  for (const lx of [-60, 120]) line(c, [[lx, 40], [lx - 10, 80], [lx + 10, 84]], { lw: 12, seed: sd + lx });
};
PROPS.snake = (c, st, o, sd) => {
  const t = st.t;
  const pts = [];
  for (let i = 0; i <= 40; i++) { const u = i / 40; pts.push([-200 + u * 300, Math.sin(u * 9 - t * (o.swim ? 6 : 1.5)) * 24 * (1 - u * 0.5)]); }
  line(c, pts, { lw: 40, stroke: INK, seed: sd, amp: 0.3 });
  line(c, pts, { lw: 28, stroke: '#4caf50', seed: sd, amp: 0.3 });
  c.save(); c.translate(130, -20);
  ell(c, 0, 0, 64, 44, { fill: '#4caf50', lw: 8, seed: sd + 1 });
  c.fillStyle = INK; c.beginPath(); c.ellipse(-12, -8, 10, 8, 0, 0, Math.PI); c.ellipse(26, -8, 10, 8, 0, 0, Math.PI); c.fill();
  line(c, [[-28, -12], [4, -14]], { lw: 6, seed: sd + 2 }); line(c, [[12, -14], [42, -12]], { lw: 6, seed: sd + 3 });
  line(c, [[-6, 18], [30, 18], [48, 6]], { lw: 6, seed: sd + 4 });
  if (Math.floor(t * 2.5) % 3 === 0) line(c, [[60, 10], [100, 14], [112, 2], [100, 14], [112, 26]], { lw: 5, stroke: '#e0262d', seed: sd });
  if (o.shades) { rrect(c, -40, -26, 46, 22, 6, { fill: '#111', lw: 4, seed: sd }); rrect(c, 12, -26, 46, 22, 6, { fill: '#111', lw: 4, seed: sd + 1 }); line(c, [[6, -16], [12, -16]], { lw: 4, seed: sd }); }
  c.restore();
};
PROPS.pig = (c, st, o, sd) => {
  const col = o.silver ? '#cfd6dc' : '#f4a6b8';
  const hi = o.silver ? '#f4f8fb' : '#f8c6d2';
  for (const lx of [-50, -20, 30, 60]) line(c, [[lx, 40], [lx, 76]], { lw: 18, stroke: INK, seed: sd + lx }), line(c, [[lx, 40], [lx, 72]], { lw: 8, stroke: col, seed: sd + lx });
  ell(c, 0, 0, 110, 70, { fill: col, lw: 8, seed: sd });
  c.fillStyle = hi; c.beginPath(); c.ellipse(-20, -30, 50, 16, -0.2, 0, TAU); c.fill();
  circ(c, -100, -10, 46, { fill: col, lw: 8, seed: sd + 1 });
  ell(c, -140, 0, 20, 24, { fill: hi, lw: 6, seed: sd + 2 });
  c.fillStyle = INK; c.beginPath(); c.arc(-144, -6, 4, 0, TAU); c.arc(-136, 6, 4, 0, TAU); c.fill();
  c.beginPath(); c.arc(-104, -24, 6, 0, TAU); c.fill();
  shp(c, [[-90, -50], [-76, -80], [-66, -46]], { fill: col, lw: 6, seed: sd + 3 });
  const tail = []; for (let i = 0; i < 12; i++) { const a = i * 0.9; tail.push([110 + i * 2 + Math.cos(a) * 10, -10 + Math.sin(a) * 10]); }
  line(c, tail, { lw: 6, seed: sd + 4 });
  if (o.silver) sparkles(c, -120, -80, 260, 160, st.t, 5);
};
PROPS.duck = (c, st, o, sd) => { ell(c, 0, 0, 50, 34, { fill: '#c8a06a', lw: 6, seed: sd }); circ(c, -44, -30, 22, { fill: '#2e7d32', lw: 6, seed: sd + 1 }); shp(c, [[-62, -30], [-86, -24], [-62, -20]], { fill: '#f39c12', lw: 4, seed: sd + 2 }); };
PROPS.pigeon = (c, st, o, sd) => { ell(c, 0, 0, 44, 30, { fill: '#9aa3ad', lw: 6, seed: sd }); circ(c, -40, -26, 20, { fill: '#8a939d', lw: 6, seed: sd + 1 }); shp(c, [[-56, -26], [-72, -22], [-56, -18]], { fill: '#555', lw: 3, seed: sd + 2 }); };
PROPS.hare = (c, st, o, sd) => { ell(c, 0, 0, 52, 36, { fill: '#b88a5a', lw: 6, seed: sd }); circ(c, -44, -26, 24, { fill: '#b88a5a', lw: 6, seed: sd + 1 }); ell(c, -50, -70, 9, 30, { fill: '#b88a5a', lw: 5, seed: sd + 2 }); ell(c, -34, -72, 9, 30, { fill: '#b88a5a', lw: 5, seed: sd + 3 }); };
PROPS.hand = (c, st, o, sd) => { // cartoon severed hand (stick-arm style mitten)
  shp(c, [[-30, 30], [-40, -10], [-30, -40], [-6, -50], [20, -44], [34, -20], [30, 20], [10, 36]], { fill: o.skin || SKIN.brown, lw: 7, seed: sd });
  for (let i = 0; i < 3; i++) line(c, [[-14 + i * 14, -46], [-16 + i * 16, -76]], { lw: 12, seed: sd + i }), line(c, [[-14 + i * 14, -46], [-16 + i * 16, -72]], { lw: 5, stroke: o.skin || SKIN.brown, seed: sd + i });
  line(c, [[-38, -6], [-64, -24]], { lw: 12, seed: sd + 9 });
  line(c, [[0, 36], [0, 90]], { lw: 11, seed: sd + 10 });
  if (o.wings) for (const sd2 of [-1, 1]) { const f = Math.sin(st.t * 22) * 0.5; c.save(); c.translate(sd2 * 30, -10); c.rotate(sd2 * (0.4 + f)); ell(c, sd2 * 46, 0, 50, 20, { fill: '#fff', lw: 6, seed: sd + 20 + sd2 }); c.restore(); }
};
PROPS.pot = (c, st, o, sd) => {
  if (o.broken) {
    shp(c, [[-60, 40], [-70, -10], [-40, -30], [-20, 10], [-34, 44]], { fill: '#c0703a', lw: 6, seed: sd });
    shp(c, [[-10, 44], [-4, 0], [20, -40], [50, -20], [62, 40]], { fill: '#c0703a', lw: 6, seed: sd + 1 });
    shp(c, [[70, 40], [86, 10], [100, 40]], { fill: '#c0703a', lw: 5, seed: sd + 2 });
    return;
  }
  shp(c, [[-30, -80], [-34, -60], [-66, -20], [-60, 40], [-34, 66], [34, 66], [60, 40], [66, -20], [34, -60], [30, -80]], { fill: '#c0703a', lw: 7, seed: sd });
  line(c, [[-60, 0], [60, 0]], { lw: 4, stroke: '#7a3e1a', seed: sd });
};
PROPS.coins = (c, st, o, sd) => { const n = o.n || 10; for (let i = 0; i < n; i++) { const x = (i % 5) * 54 - 108, y = -Math.floor(i / 5) * 24; ell(c, x, y, 26, 11, { fill: '#d6dbe0', lw: 5, seed: sd + i }); } };

// ---------- larger set pieces ----------
PROPS.mat = (c, st, o, sd) => { shp(c, [[-200, -10], [200, -10], [216, 22], [-216, 22]], { fill: o.color || '#c8a165', lw: 7, seed: sd }); for (let i = -180; i < 200; i += 30) line(c, [[i, -8], [i + 8, 20]], { lw: 3, stroke: '#8a6a3a', seed: sd + i }); };
PROPS.table = (c, st, o, sd) => { rrect(c, -260, -40, 520, 40, 8, { fill: o.color || '#a0703c', lw: 8, seed: sd }); for (const x of [-220, 210]) rrect(c, x, 0, 26, 150, 6, { fill: '#7a4b22', lw: 7, seed: sd + x }); };
PROPS.chair = (c, st, o, sd) => { rrect(c, -60, -70, 120, 20, 6, { fill: '#5a6b7a', lw: 6, seed: sd }); rrect(c, -60, -170, 18, 100, 6, { fill: '#5a6b7a', lw: 6, seed: sd + 1 }); line(c, [[-50, -50], [-50, 0]], { lw: 8, seed: sd }); line(c, [[50, -50], [50, 0]], { lw: 8, seed: sd + 2 }); };
PROPS.stele = (c, st, o, sd) => { // Hammurabi's law pillar
  shp(c, [[-120, 0], [-130, -560], ...ellPts(0, -560, 130, 70, 20, Math.PI, TAU).slice(1, -1), [130, -560], [120, 0]], { fill: '#2b2b30', lw: 9, seed: sd });
  c.save(); c.beginPath(); c.rect(-110, -600, 220, 600); c.clip();
  rrect(c, -100, -610, 200, 120, 30, { fill: '#3a3a42', lw: 5, seed: sd + 1 });
  c.strokeStyle = 'rgba(210,210,220,0.35)'; c.lineWidth = 3;
  for (let r = 0; r < 26; r++) { const y = -470 + r * 17; for (let k = 0; k < 11; k++) { if (rnd(sd + r, k) < 0.2) continue; const x = -96 + k * 18; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 9, y + 3); c.lineTo(x, y + 7); c.stroke(); } }
  c.restore();
  if (o.glow) glow(c, 0, -300, 420, 'rgba(255,220,120,0.35)');
};
PROPS.falseDoor = (c, st, o, sd) => {
  rrect(c, -230, -620, 460, 620, 6, { fill: '#d9b47a', lw: 9, seed: sd });
  rrect(c, -150, -520, 300, 520, 4, { fill: '#c9a265', lw: 7, seed: sd + 1 });
  rrect(c, -80, -420, 160, 420, 4, { fill: '#a8834d', lw: 7, seed: sd + 2 });
  rrect(c, -190, -600, 380, 60, 4, { fill: '#e2c48e', lw: 6, seed: sd + 3 });
  c.fillStyle = 'rgba(90,60,25,0.65)';
  for (let col = 0; col < 2; col++) for (let r = 0; r < 12; r++) { const x = col ? 115 : -115, y = -490 + r * 40; glyph(c, x, y, sd + r * 7 + col * 100, 14); }
  for (let k = 0; k < 9; k++) glyph(c, -160 + k * 40, -570, sd + k + 400, 13);
};
function glyph(c, x, y, seed, s) { // pseudo hieroglyph
  const k = Math.floor(rnd(seed) * 6);
  c.save(); c.translate(x, y);
  c.beginPath();
  if (k === 0) { c.ellipse(0, 0, s, s * 0.6, 0, 0, TAU); }
  else if (k === 1) { c.moveTo(-s, s); c.lineTo(0, -s); c.lineTo(s, s); }
  else if (k === 2) { c.rect(-s * 0.3, -s, s * 0.6, s * 2); }
  else if (k === 3) { c.arc(0, 0, s * 0.7, 0, TAU); c.moveTo(-s, s); c.lineTo(s, s); }
  else if (k === 4) { c.moveTo(-s, 0); c.quadraticCurveTo(0, -s * 1.5, s, 0); c.lineTo(s, s * 0.4); c.lineTo(-s, s * 0.4); }
  else { c.moveTo(-s, -s * 0.5); c.lineTo(s, -s * 0.5); c.lineTo(s * 0.4, s); c.lineTo(-s * 0.4, s); }
  c.fill(); c.restore();
}
PROPS.papyrus = (c, st, o, sd) => { // long unrolled scroll; o.len, o.unroll (0-1)
  const len = (o.len || 900) * (o.unroll === undefined ? 1 : o.unroll);
  rrect(c, -40, -160, len + 40, 320, 4, { fill: '#e8d39a', lw: 7, seed: sd });
  c.save(); c.beginPath(); c.rect(-40, -160, len + 40, 320); c.clip();
  c.fillStyle = 'rgba(120,80,30,0.12)'; for (let x = -40; x < len; x += 24) c.fillRect(x, -160, 2, 320);
  c.fillStyle = 'rgba(60,30,10,0.7)';
  for (let r = 0; r < 9; r++) for (let x = 0; x < len - 20; x += 26) { if (rnd(sd + r, x) < 0.25) continue; c.fillRect(x, -130 + r * 32, 14 + rnd(r, x) * 8, 4); }
  c.fillStyle = 'rgba(180,30,20,0.7)'; for (let x = 0; x < len - 20; x += 180) c.fillRect(x, -130, 40, 5);
  c.restore();
  rrect(c, len - 10, -180, 46, 360, 20, { fill: '#d8c38a', lw: 7, seed: sd + 2 });
};
PROPS.slab = (c, st, o, sd) => { // iamata stone slab with greek letters
  rrect(c, -230, -560, 460, 560, 10, { fill: '#d7d2c8', lw: 9, seed: sd });
  rrect(c, -250, -600, 500, 56, 8, { fill: '#c9c3b6', lw: 8, seed: sd + 1 });
  c.save(); c.fillStyle = 'rgba(70,60,50,0.6)'; c.font = '30px "Cinzel"'; c.textAlign = 'left';
  const L = 'ΙΑΜΑΤΑΤΟΥΑΠΟΛΛΩΝΟΣΚΑΙΤΟΥΑΣΚΛΑΠΙΟΥΚΛΕΩΠΕΝΘΕΤΗΣΕΚΥΗΣΕΑΥΤΑΙΚΑΘΕΥΔΗΣΑΣΑΑΜΒΡΟΣΙΑΕΞΑΘΑΝΑΝΥΟΣΑΡΓΥΡΕΟΝ';
  for (let r = 0; r < 14; r++) { let s = ''; for (let k = 0; k < 17; k++) s += L[(r * 17 + k + sd) % L.length]; c.fillText(s, -205, -500 + r * 36); }
  c.restore();
  if (o.cracks !== false) line(c, [[150, -560], [120, -480], [140, -420]], { lw: 4, stroke: '#8a8478', seed: sd + 4 });
};
PROPS.ambulance = (c, st, o, sd) => {
  rrect(c, -360, -300, 520, 260, 18, { fill: '#ffffff', lw: 9, seed: sd });
  shp(c, [[160, -230], [290, -230], [360, -120], [360, -40], [160, -40]], { fill: '#ffffff', lw: 9, seed: sd + 1 });
  shp(c, [[190, -210], [280, -210], [330, -130], [190, -130]], { fill: '#9fd3f0', lw: 7, seed: sd + 2 });
  c.fillStyle = '#e0262d'; c.fillRect(-352, -150, 704, 34);
  const flash = Math.floor(st.t * 6) % 2;
  rrect(c, -300, -336, 70, 36, 8, { fill: flash ? '#ff3b3b' : '#6a1a1a', lw: 6, seed: sd + 3 });
  rrect(c, 60, -336, 70, 36, 8, { fill: flash ? '#5a8bff' : '#1a2a6a', lw: 6, seed: sd + 4 });
  if (flash) { glow(c, -265, -318, 160, 'rgba(255,60,60,0.5)'); } else glow(c, 95, -318, 160, 'rgba(90,140,255,0.5)');
  for (const x of [-230, 230]) { circ(c, x, -36, 54, { fill: '#2a2a2a', lw: 8, seed: sd + x }); circ(c, x, -36, 22, { fill: '#999', lw: 5, seed: sd + x + 1 }); }
  starOfLife(c, -100, -230, o.starS || 0.7, st, o.glowStar);
};
function starOfLife(c, x, y, s, st, glowIt) {
  c.save(); c.translate(x, y); c.scale(s, s);
  if (glowIt) glow(c, 0, 0, 260, 'rgba(120,190,255,0.6)', 0.7 + 0.3 * Math.sin(st.t * 5));
  for (let i = 0; i < 3; i++) { c.save(); c.rotate(i * Math.PI / 3); shp(c, rrectPts(-30, -110, 60, 220, 8), { fill: '#2f6fd6', lw: 7, seed: 300 + i }); c.restore(); }
  line(c, [[0, 80], [0, -84]], { lw: 12, stroke: '#fff', seed: 310 });
  const pts = []; for (let i = 0; i <= 30; i++) { const u = i / 30; pts.push([Math.sin(u * 13) * 18, 70 - u * 140]); }
  line(c, pts, { lw: 8, stroke: '#fff', seed: 311, amp: 0.3 });
  c.restore();
}
PROPS.ship = (c, st, o, sd) => {
  const rock = Math.sin(st.t * 1.4) * 0.03;
  c.rotate(rock);
  shp(c, [[-320, -60], [320, -60], [260, 40], [-250, 40], [-340, -90]], { fill: '#8a5a2b', lw: 9, seed: sd });
  for (let i = -260; i < 280; i += 60) line(c, [[i, -50], [i + 10, 30]], { lw: 3, stroke: '#5a3a1a', seed: sd + i });
  line(c, [[0, -60], [0, -420]], { lw: 14, seed: sd + 1 });
  shp(c, [[-160, -400], [160, -400], [180, -140], [-180, -140]], { fill: '#f1e3c0', lw: 8, seed: sd + 2 });
  c.fillStyle = '#c0392b'; c.fillRect(-170, -300, 340, 40);
  for (let i = 0; i < 7; i++) line(c, [[-240 + i * 70, 10], [-280 + i * 70, 110]], { lw: 8, stroke: '#6b4423', seed: sd + 30 + i });
};
PROPS.fountain = (c, st, o, sd) => {
  ell(c, 0, 0, 220, 50, { fill: '#cfc8bb', lw: 8, seed: sd }); ell(c, 0, -10, 190, 34, { fill: '#7fc4e8', lw: 6, seed: sd + 1 });
  rrect(c, -30, -200, 60, 190, 10, { fill: '#d8d2c6', lw: 7, seed: sd + 2 });
  for (let i = 0; i < 6; i++) { const ph = (st.t * 1.5 + i / 6) % 1; const a = i / 6 * TAU; c.fillStyle = 'rgba(160,215,245,0.85)'; c.beginPath(); c.arc(Math.cos(a) * ph * 130, -200 + ph * 190 - Math.sin(ph * Math.PI) * 90, 7, 0, TAU); c.fill(); }
};
PROPS.laptop = (c, st, o, sd) => { // stone-age "laptop" for the comment section gag
  shp(c, [[-260, 0], [260, 0], [300, 40], [-300, 40]], { fill: '#9b9183', lw: 8, seed: sd });
  shp(c, [[-240, 0], [-250, -330], [250, -330], [240, 0]], { fill: '#8c8274', lw: 8, seed: sd + 1 });
  rrect(c, -222, -310, 444, 290, 10, { fill: o.screen || '#f6f3ec', lw: 6, seed: sd + 2 });
};
PROPS.bed = (c, st, o, sd) => { rrect(c, -300, -80, 600, 60, 14, { fill: '#e8e2d2', lw: 8, seed: sd }); rrect(c, -300, -20, 600, 30, 8, { fill: '#8a5a2b', lw: 7, seed: sd + 1 }); rrect(c, -290, -120, 120, 50, 20, { fill: '#fff', lw: 7, seed: sd + 2 }); };
PROPS.temple = (c, st, o, sd) => { // small greek/roman temple
  shp(c, [[-260, -330], [0, -440], [260, -330]], { fill: o.color || '#efe8da', lw: 8, seed: sd });
  rrect(c, -270, -340, 540, 30, 4, { fill: '#e2d9c6', lw: 7, seed: sd + 1 });
  for (let i = 0; i < 6; i++) { const x = -230 + i * 92; rrect(c, x - 18, -310, 36, 290, 4, { fill: '#f4efe4', lw: 6, seed: sd + i }); }
  rrect(c, -280, -24, 560, 24, 4, { fill: '#d9cfba', lw: 7, seed: sd + 9 });
};
PROPS.cloudDream = (c, st, o, sd) => { thoughtCloud(c, 0, 0, o.w || 500, o.h || 300, o.tx || -260, o.ty || 260, sd); };
PROPS.bowling = (c, st, o, sd) => { // a long lane in perspective
  shp(c, [[-60, 0], [60, 0], [260, 300], [-260, 300]], { fill: '#e7c48f', lw: 7, seed: sd });
  for (let i = -3; i <= 3; i++) line(c, [[i * 12, 0], [i * 50, 300]], { lw: 2, stroke: '#b8925a', seed: sd + i, amp: 0 });
  for (let i = 0; i < 4; i++) for (let k = 0; k <= i; k++) { const x = (k - i / 2) * 18, y = -8 - (3 - i) * 8; ell(c, x, y - 10, 6, 12, { fill: '#fff', lw: 3, seed: sd + i * 9 + k }); }
};
PROPS.oillamp = (c, st, o, sd) => { shp(c, [[-50, 0], [-40, -24], [30, -24], [60, -14], [40, 0]], { fill: '#b5651d', lw: 6, seed: sd }); fire(c, 52, -24, 0.45, st.t, sd); };
PROPS.ghostGrandpa = (c, st, o, sd) => { c.save(); c.globalAlpha *= 0.85 + Math.sin(st.t * 3) * 0.1; c.translate(0, Math.sin(st.t * 2) * 14); ch(c, st, 'ghost', { x: 0, y: 0, s: 1, face: o.face || 'smug', noShadow: true, pose: 'wave', wave: o.wave }); c.restore(); };
PROPS.cart = (c, st, o, sd) => { rrect(c, -150, -120, 300, 90, 8, { fill: '#a0703c', lw: 7, seed: sd }); for (const x of [-90, 90]) { circ(c, x, -20, 40, { fill: '#7a4b22', lw: 7, seed: sd + x }); } };
PROPS.island = (c, st, o, sd) => { // Tiber island boat shape
  shp(c, [[-420, 0], [-300, -60], [300, -60], [460, 0], [300, 40], [-300, 40]], { fill: '#9c8a6a', lw: 9, seed: sd });
  PROPS.temple(c, st, { color: '#f0e9db' }, sd + 5);
};
PROPS.forum = (c, st, o, sd) => { // web forum UI card
  const w = o.w || 700, h = o.h || 460;
  rrect(c, -w / 2, -h / 2, w, h, 16, { fill: '#ffffff', lw: 7, seed: sd });
  c.fillStyle = '#3b6fd8'; c.fillRect(-w / 2 + 4, -h / 2 + 4, w - 8, 64);
  txt(c, o.title || 'BABYLON HEALTH FORUM', 0, -h / 2 + 38, { size: 34, fill: '#fff', lw: 0, shadow: false });
};
function fire(c, x, y, s, t, seed = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  glow(c, 0, -30, 160, 'rgba(255,170,60,0.55)');
  const f = Math.floor(t * 12);
  for (const [col, sc] of [['#ff6a1f', 1], ['#ffb22e', 0.7], ['#fff1a8', 0.38]]) {
    const pts = [];
    for (let i = 0; i <= 12; i++) { const a = Math.PI + i / 12 * Math.PI; const r = 46 * sc; pts.push([Math.cos(a) * r, Math.sin(a) * r * 0.5]); }
    const tips = [[40 * sc, -10 * sc], [24 * sc, -70 * sc - rnd(f, 1) * 30 * sc], [6 * sc, -40 * sc], [-6 * sc, -110 * sc - rnd(f, 2) * 30 * sc], [-20 * sc, -50 * sc], [-34 * sc, -80 * sc - rnd(f, 3) * 20 * sc], [-44 * sc, -10 * sc]];
    shp(c, [...ellPts(0, 0, 46 * sc, 30 * sc, 12, 0, Math.PI), ...tips], { fill: col, lw: 0, stroke: null, seed: seed + f, amp: 2 });
  }
  c.restore();
}

// Shared scene helpers + extra props used by the episode.
'use strict';
const GY = 975;                      // ground line for full-body shots
const at = (st, p, w) => (typeof p === 'number' ? st.s.start + p : st.k(p, w));
const after = (st, p) => st.t >= at(st, p);
const pr_ = (st, p, d = 0.4, e = E.out) => prog(st.t, at(st, p), d, e);

// big name card text (like the reference "THOMAS WILLETTES")
function nameCard(c, st, name, t0, o = {}) {
  popText(c, st, name, o.x || 1250, o.y || 470, at(st, t0), Object.assign({ size: o.size || 120, anim: 'slam', sfx: 'impact', vol: 0.8, lh: 1.0 }, o));
  if (o.sub) popText(c, st, o.sub, o.x || 1250, (o.y || 470) + (o.subDy || 170), at(st, o.subAt || t0) + (o.subAt ? 0 : 0.35), { size: o.subSize || 58, fill: '#ffffff', anim: 'rise', sfx: 'swoosh_up' });
}
// year / place stamp, top-left, tilted (like "1943")
function yearSlam(c, st, s, t0, o = {}) {
  popText(c, st, s, o.x || 330, o.y || 150, at(st, t0), Object.assign({ size: o.size || 110, anim: 'slam', sfx: 'impact', rot: o.rot === undefined ? -0.06 : o.rot, fill: o.fill || '#7ee05a' }, o));
}
// handwritten label with optional arrow to (ax, ay)
function label(c, st, s, x, y, t0, o = {}) {
  const t = at(st, t0);
  if (o.sfx !== false) cue(o.sfx || 'pop', t, 0.55);
  if (st.t < t) return;
  const p = prog(st.t, t, 0.35, E.back);
  if (o.ax !== undefined) arrow(c, x + (o.adx || 0), y + (o.ady || 30), o.ax, o.ay, { p: prog(st.t, t + 0.1, 0.3), color: o.acolor || '#ffffff', lw: 10, bend: o.bend || 40 });
  txt(c, s, x, y, { size: o.size || 58, scale: p, fill: o.fill || '#ffffff', font: o.font || '"Luckiest Guy"', lw: o.lw === undefined ? 12 : o.lw, rot: o.rot || 0, stroke: o.stroke });
}
// red rubber stamp
function stamp(c, st, s, x, y, t0, o = {}) {
  const t = at(st, t0);
  cue('stamp', t, 0.9);
  if (st.t < t) return;
  const p = clamp((st.t - t) / 0.14);
  const sc = lerp(2.2, 1, E.out(p)) * (o.scale || 1);
  c.save(); c.translate(x, y); c.rotate(o.rot === undefined ? -0.14 : o.rot); c.scale(sc, sc); c.globalAlpha *= clamp(p * 2);
  c.font = `${o.size || 110}px "Luckiest Guy"`; const w = c.measureText(s).width;
  const col = o.color || '#e0262d';
  c.strokeStyle = col; c.lineWidth = 12; c.strokeRect(-w / 2 - 36, -(o.size || 110) * 0.72, w + 72, (o.size || 110) * 1.38);
  c.fillStyle = col; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s, 0, (o.size || 110) * 0.08);
  c.restore();
}
// count up a number
function counter(c, st, from, to, x, y, t0, dur, o = {}) {
  const t = at(st, t0);
  cue('counter', t, 0.5, { dur });
  if (st.t < t) return;
  const v = Math.round(lerp(from, to, E.out(clamp((st.t - t) / dur))));
  txt(c, (o.pre || '') + v.toLocaleString('en-US') + (o.post || ''), x, y, Object.assign({ size: 150 }, o));
  if (st.t > t + dur) cue('ding', t + dur, 0.6);
}
// side effects pharma-ad template
function sideEffects(c, st, items, times, icons) {
  c.save();
  c.fillStyle = '#f7fbff'; c.fillRect(0, 0, W, H);
  c.fillStyle = '#2f6fd6'; c.fillRect(0, 0, W, 170);
  txt(c, 'SIDE EFFECTS MAY INCLUDE:', W / 2, 92, { size: 84, fill: '#fff', lw: 0, shadowColor: 'rgba(0,0,0,0.25)' });
  c.restore();
  // capsule icon
  c.save(); c.translate(1700, 92); c.rotate(-0.5); rrect(c, -70, -30, 140, 60, 30, { fill: '#fff', lw: 6 }); c.beginPath(); c.rect(0, -34, 80, 68); c.clip(); rrect(c, -70, -30, 140, 60, 30, { fill: '#e0262d', lw: 6 }); c.restore();
  items.forEach((it, i) => {
    const t = times[i];
    cue('pop', t, 0.6);
    if (st.t < t) return;
    const p = prog(st.t, t, 0.35, E.back);
    const y = 330 + i * 230;
    c.save(); c.translate(260, y); c.scale(p, p);
    circ(c, 0, 0, 90, { fill: ['#ffe28a', '#ffc7d6', '#c9f2c7'][i % 3], lw: 8, seed: i });
    if (icons && icons[i]) icons[i](c, st);
    c.restore();
    txt(c, it, 420, y, { size: 66, align: 'left', fill: '#1d2b4a', lw: 0, shadow: false, scale: 1, alpha: p });
  });
  txt(c, '*ask your doctor. Unless your doctor is a bird.', W / 2, 1040, { size: 26, fill: '#7a869c', lw: 0, shadow: false, font: '"Patrick Hand"' });
}
// chapter card shot builder
function chapter(kind, num, title, era, bgId, decorate) {
  shot({
    at: { insert: kind, plus: kind === 'title' ? 4.0 : 0 }, bg: bgId, trans: 'flash', nocap: true, cam: { push: 0.08 }, mus: 'sting',
    draw: (c, st) => {
      c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(-100, -100, W + 200, H + 200);
      if (decorate) decorate(c, st);
      popText(c, st, 'PART ' + num, W / 2, 330, st.s.start + 0.15, { size: 70, fill: '#ffffff', anim: 'rise', sfx: 'swoosh_up' });
      popText(c, st, title, W / 2, 500, st.s.start + 0.35, { size: 190, anim: 'slam', sfx: 'impact', vol: 1 });
      popText(c, st, era, W / 2, 680, st.s.start + 0.8, { size: 72, fill: '#7ee05a', anim: 'pop', sfx: 'pop' });
    },
  });
}
// generic rounded "UI" card with text lines
function uiCard(c, x, y, w, h, title, lines, o = {}) {
  rrect(c, x - w / 2, y - h / 2, w, h, 22, { fill: o.fill || '#fff', lw: 8, seed: 5 });
  if (title) { c.save(); c.fillStyle = o.head || '#2f6fd6'; c.beginPath(); c.rect(x - w / 2 + 6, y - h / 2 + 6, w - 12, 76); c.fill(); c.restore(); txt(c, title, x, y - h / 2 + 46, { size: 42, fill: '#fff', lw: 0, shadow: false }); }
  (lines || []).forEach((l, i) => txt(c, l, x - w / 2 + 36, y - h / 2 + 130 + i * 60, { size: 40, align: 'left', fill: '#22324f', lw: 0, shadow: false, font: '"Patrick Hand"' }));
}
// spinning rays background overlay (jingle / celebration)
function rays(c, t, col = 'rgba(255,255,255,0.12)', n = 16, cx = W / 2, cy = H / 2) {
  c.save(); c.translate(cx, cy); c.rotate(t * 0.3); c.fillStyle = col;
  for (let i = 0; i < n; i++) { const a = i / n * TAU; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 2200, a, a + TAU / n / 2); c.closePath(); c.fill(); }
  c.restore();
}
// time vortex
function vortex(c, t) {
  c.save(); c.translate(W / 2, H / 2);
  for (let i = 0; i < 14; i++) {
    const r = ((i * 90 + t * 260) % 1300);
    c.strokeStyle = `hsla(${(i * 30 + t * 40) % 360},80%,70%,${0.15 + 0.25 * (r / 1300)})`;
    c.lineWidth = 10 + r * 0.04;
    c.beginPath(); c.ellipse(0, 0, r * 1.3, r * 0.8, t * 0.4 + i, 0.2, TAU - 0.6); c.stroke();
  }
  c.restore();
}
function clockIcon(c, x, y, r, t, speed = 1) {
  circ(c, x, y, r, { fill: '#fff', lw: 8 });
  line(c, [[x, y], [x + Math.sin(t * speed) * r * 0.7, y - Math.cos(t * speed) * r * 0.7]], { lw: 8 });
  line(c, [[x, y], [x + Math.sin(t * speed / 12) * r * 0.45, y - Math.cos(t * speed / 12) * r * 0.45]], { lw: 10 });
}

// ---- extra props ----
PROPS.skull = (c, st, o, sd) => {
  shp(c, [...ellPts(0, -40, 120, 110, 30, Math.PI * 0.9, Math.PI * 2.1), [96, 40], [70, 70], [60, 110], [-60, 110], [-70, 70], [-96, 40]], { fill: '#efe6d2', lw: 9, seed: sd });
  for (const sd2 of [-1, 1]) ell(c, sd2 * 44, 10, 30, 34, { fill: '#2a1d16', lw: 6, seed: sd + sd2 });
  shp(c, [[0, 40], [-14, 70], [14, 70]], { fill: '#2a1d16', lw: 5, seed: sd + 3 });
  for (let i = -2; i <= 2; i++) line(c, [[i * 18, 92], [i * 18, 112]], { lw: 5, seed: sd + i });
  const heal = o.heal === undefined ? 0 : o.heal;
  for (const h of [[-50, -100, 24], [42, -112, 19]]) {
    circ(c, h[0], h[1], h[2] * (1 - heal * 0.55) + 8, { fill: '#e4d2ae', lw: 4, seed: sd + h[0] });
    circ(c, h[0], h[1], h[2] * (1 - heal * 0.55), { fill: '#2a1d16', lw: 5, seed: sd + h[1] });
    if (heal > 0) for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; line(c, [[h[0] + Math.cos(a) * (h[2] + 14), h[1] + Math.sin(a) * (h[2] + 14)], [h[0] + Math.cos(a) * (h[2] * (1 - heal * 0.55) + 4), h[1] + Math.sin(a) * (h[2] * (1 - heal * 0.55) + 4)]], { lw: 3, stroke: '#a8c86a', seed: k }); }
  }
};
PROPS.crook = (c, st, o, sd) => { line(c, [[0, 160], [0, -150], [10, -190], [40, -200], [64, -180], [60, -150]], { lw: 14, stroke: '#7a4b22', seed: sd }); };
PROPS.sink = (c, st, o, sd) => {
  rrect(c, -120, -40, 240, 120, 20, { fill: '#e8eef3', lw: 8, seed: sd });
  line(c, [[60, -40], [60, -110], [10, -110], [10, -90]], { lw: 12, stroke: '#9aa', seed: sd + 1 });
  if (o.goo) { const h = o.goo; shp(c, [[-110, -30], [110, -30], [118, -30 - h * 0.3], ...ellPts(0, -30 - h * 0.4, 120, h * 0.5, 14, 0, -Math.PI).slice(1), [-118, -30]], { fill: '#7fbf3a', lw: 6, seed: sd + 2 }); for (let i = 0; i < 3; i++) { const ph = (st.t * 0.8 + i / 3) % 1; c.fillStyle = '#7fbf3a'; c.beginPath(); c.ellipse(-90 + i * 90, -20 + ph * 140, 12, 18, 0, 0, TAU); c.fill(); } }
};
PROPS.bacteria = (c, st, o, sd) => {
  const shr = o.shrink || 0;
  const r = 70 * (1 - shr * 0.45);
  const wob2 = [];
  for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; const rr2 = r * (1 + 0.12 * Math.sin(a * 5 + st.t * 4 + sd) * (1 - shr)); wob2.push([Math.cos(a) * rr2 * 1.3, Math.sin(a) * rr2]); }
  shp(c, wob2, { fill: o.dead ? '#9aa58a' : '#6cc04a', lw: 7, seed: sd });
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; line(c, [[Math.cos(a) * r * 1.25, Math.sin(a) * r * 0.95], [Math.cos(a) * r * 1.6, Math.sin(a) * r * 1.25]], { lw: 5, seed: sd + i }); }
  c.fillStyle = INK;
  if (o.dead) { for (const sx of [-24, 24]) { line(c, [[sx - 9, -16], [sx + 9, 2]], { lw: 5 }); line(c, [[sx + 9, -16], [sx - 9, 2]], { lw: 5 }); } }
  else { c.beginPath(); c.arc(-24, -8, 8, 0, TAU); c.arc(24, -8, 8, 0, TAU); c.fill(); line(c, [[-38, -30], [-12, -20]], { lw: 6 }); line(c, [[38, -30], [12, -20]], { lw: 6 }); }
  line(c, o.dead || shr > 0.3 ? [[-16, 26], [0, 18], [16, 26]] : [[-16, 20], [0, 26], [16, 20]], { lw: 5, seed: sd });
};
PROPS.drop = (c, st, o, sd) => { shp(c, [[0, -30], [16, 0], [16, 12], [0, 24], [-16, 12], [-16, 0]], { fill: '#7fd0ff', lw: 5, seed: sd }); };
PROPS.trophy = (c, st, o, sd) => { shp(c, [[-60, -90], [60, -90], [50, -20], [20, 10], [20, 50], [50, 70], [-50, 70], [-20, 50], [-20, 10], [-50, -20]], { fill: '#f0c419', lw: 7, seed: sd }); for (const s2 of [-1, 1]) line(c, [[s2 * 60, -80], [s2 * 96, -70], [s2 * 80, -30], [s2 * 50, -24]], { lw: 8, seed: sd + s2 }); };
PROPS.book = (c, st, o, sd) => { rrect(c, -110, -140, 220, 280, 10, { fill: o.color || '#8e3b2f', lw: 8, seed: sd }); line(c, [[-80, -140], [-80, 140]], { lw: 5, seed: sd }); txt(c, o.title || 'HISTORY', 14, -60, { size: 36, fill: '#f0c419', lw: 6 }); };
PROPS.whistle = (c, st, o, sd) => { rrect(c, -40, -18, 70, 36, 14, { fill: '#c0c6cc', lw: 6, seed: sd }); circ(c, 30, 6, 22, { fill: '#c0c6cc', lw: 6, seed: sd + 1 }); };
PROPS.gavel = (c, st, o, sd) => { c.rotate(o.swing || 0); line(c, [[0, 0], [0, -150]], { lw: 14, stroke: '#7a4b22', seed: sd }); rrect(c, -60, -190, 120, 60, 14, { fill: '#8a5a2b', lw: 7, seed: sd + 1 }); };
PROPS.scale = (c, st, o, sd) => {
  const tilt = o.tilt || 0;
  line(c, [[0, 120], [0, -120]], { lw: 12, stroke: '#c9a227', seed: sd }); line(c, [[-90, 130], [90, 130]], { lw: 14, stroke: '#c9a227', seed: sd + 1 });
  c.save(); c.translate(0, -120); c.rotate(tilt);
  line(c, [[-200, 0], [200, 0]], { lw: 12, stroke: '#c9a227', seed: sd + 2 });
  for (const s2 of [-1, 1]) { c.save(); c.translate(s2 * 200, 0); c.rotate(-tilt); line(c, [[0, 0], [-50, 110]], { lw: 4, seed: sd }); line(c, [[0, 0], [50, 110]], { lw: 4, seed: sd }); shp(c, [[-70, 110], [70, 110], ...ellPts(0, 110, 70, 30, 12, 0, Math.PI).slice(1, -1)], { fill: '#e0b84a', lw: 6, seed: sd + s2 }); c.restore(); }
  c.restore();
};
PROPS.tub = (c, st, o, sd) => {
  shp(c, [[-260, -120], [260, -120], [240, 40], [180, 80], [-180, 80], [-240, 40]], { fill: '#8a5a2b', lw: 9, seed: sd });
  c.save(); c.beginPath(); c.rect(-250, -140, 500, 60); c.clip(); ell(c, 0, -110, 250, 30, { fill: o.liquid || '#f2d43a', lw: 6, seed: sd + 1 }); c.restore();
  for (let i = -200; i < 220; i += 70) line(c, [[i, -110], [i - 10, 70]], { lw: 3, stroke: '#5a3a1a', seed: sd + i });
  if (o.steam) for (let i = 0; i < 4; i++) { const ph = (st.t * 0.5 + i / 4) % 1; c.save(); c.globalAlpha *= (1 - ph) * 0.5; c.fillStyle = '#fff'; c.beginPath(); c.arc(-150 + i * 100 + Math.sin(ph * 6) * 20, -150 - ph * 220, 26 + ph * 30, 0, TAU); c.fill(); c.restore(); }
};
PROPS.plate = (c, st, o, sd) => { ell(c, 0, 0, 170, 46, { fill: '#e8dcc4', lw: 7, seed: sd }); ell(c, 0, -4, 120, 30, { fill: '#d8c8a8', lw: 4, seed: sd + 1 }); };
PROPS.crown = (c, st, o, sd) => { shp(c, [[-70, 30], [-80, -40], [-40, 0], [0, -60], [40, 0], [80, -40], [70, 30]], { fill: '#f0c419', lw: 7, seed: sd }); for (const x of [-40, 0, 40]) circ(c, x, 14, 8, { fill: '#e0262d', lw: 3, seed: sd + x }); };
PROPS.partyhat = (c, st, o, sd) => { shp(c, [[-40, 0], [0, -110], [40, 0]], { fill: o.color || '#e74c3c', lw: 6, seed: sd }); circ(c, 0, -116, 12, { fill: '#f1c40f', lw: 4, seed: sd }); };
PROPS.calendar = (c, st, o, sd) => { rrect(c, -110, -120, 220, 240, 14, { fill: '#fff', lw: 8, seed: sd }); c.save(); c.fillStyle = '#e0262d'; c.fillRect(-104, -114, 208, 60); c.restore(); txt(c, o.top || 'DAY', 0, -82, { size: 36, fill: '#fff', lw: 0, shadow: false }); txt(c, o.num || '1', 0, 30, { size: 100, fill: INK, lw: 0, shadow: false }); };
PROPS.hospital = (c, st, o, sd) => {
  rrect(c, -260, -360, 520, 360, 8, { fill: '#f1ece2', lw: 9, seed: sd });
  for (let r = 0; r < 3; r++) for (let k = 0; k < 5; k++) rrect(c, -220 + k * 92, -320 + r * 100, 56, 60, 4, { fill: '#ffe9a8', lw: 5, seed: sd + r * 9 + k });
  rrect(c, -60, -470, 120, 120, 14, { fill: '#fff', lw: 8, seed: sd + 50 }); c.fillStyle = '#e0262d'; c.fillRect(-14, -450, 28, 80); c.fillRect(-40, -424, 80, 28);
};
PROPS.duckToy = (c, st, o, sd) => { ell(c, 0, 0, 50, 34, { fill: '#ffd23f', lw: 6, seed: sd }); circ(c, -36, -34, 24, { fill: '#ffd23f', lw: 6, seed: sd + 1 }); shp(c, [[-58, -34], [-82, -28], [-58, -22]], { fill: '#f39c12', lw: 4, seed: sd }); c.fillStyle = INK; c.beginPath(); c.arc(-42, -40, 4, 0, TAU); c.fill(); };
PROPS.brush = (c, st, o, sd) => { c.rotate(-0.6); line(c, [[0, 60], [0, -40]], { lw: 12, stroke: '#a0703c', seed: sd }); rrect(c, -26, -80, 52, 44, 8, { fill: '#c98a4a', lw: 6, seed: sd + 1 }); };
PROPS.sign = (c, st, o, sd) => { line(c, [[0, 200], [0, 0]], { lw: 14, stroke: '#7a4b22', seed: sd }); rrect(c, -(o.w || 300) / 2, -160, o.w || 300, 160, 12, { fill: o.color || '#f1e3c0', lw: 8, seed: sd + 1 }); txt(c, o.text || '', 0, -80, { size: o.size || 52, fill: o.tcolor || INK, lw: 0, shadow: false }); };
PROPS.door = (c, st, o, sd) => { const op = o.open || 0; rrect(c, -150, -520, 300, 520, 6, { fill: '#3b2a1c', lw: 8, seed: sd }); c.save(); c.translate(-150, 0); c.scale(1 - op * 0.85, 1); rrect(c, 0, -520, 300, 520, 6, { fill: '#9a7a55', lw: 8, seed: sd + 1 }); circ(c, 260, -260, 14, { fill: '#d9c3a0', lw: 4, seed: sd + 2 }); c.restore(); };
PROPS.portal = (c, st, o, sd) => { const r = o.r || 300; c.save(); c.beginPath(); c.ellipse(0, 0, r * 0.7, r, 0, 0, TAU); c.clip(); c.fillStyle = '#2a0a5a'; c.fillRect(-r, -r, 2 * r, 2 * r); c.scale(0.5, 0.5); c.translate(-W / 2, -H / 2); vortex(c, st.t); c.restore(); glow(c, 0, 0, r * 1.4, 'rgba(180,120,255,0.45)'); shp(c, ellPts(0, 0, r * 0.7, r, 40), { lw: 12, stroke: '#c9a0ff', seed: sd }); };
PROPS.price = (c, st, o, sd) => { shp(c, [[-120, -50], [90, -50], [130, 0], [90, 50], [-120, 50]], { fill: o.color || '#ffe28a', lw: 7, seed: sd }); circ(c, 92, 0, 10, { fill: '#fff', lw: 4, seed: sd }); txt(c, o.text || '', -16, 2, { size: 44, fill: INK, lw: 0, shadow: false }); };
PROPS.stars = (c, st, o, sd) => { const n = o.n === undefined ? 5 : o.n; for (let i = 0; i < 5; i++) { const x = (i - 2) * 76; const pts = []; for (let k = 0; k < 10; k++) { const r = k % 2 ? 14 : 34; const a = -Math.PI / 2 + k * Math.PI / 5; pts.push([x + Math.cos(a) * r, Math.sin(a) * r]); } shp(c, pts, { fill: i < n ? '#ffc61a' : '#d5d5d5', lw: 5, seed: sd + i }); } };
PROPS.heart = (c, st, o, sd) => { const b = 1 + (o.beat ? Math.max(0, Math.sin(st.t * 7)) * 0.12 : 0); c.scale(b, b); shp(c, [[0, 60], [-70, 0], [-70, -40], [-40, -64], [0, -36], [40, -64], [70, -40], [70, 0]], { fill: o.color || '#e0262d', lw: 7, seed: sd }); };
PROPS.podium = (c, st, o, sd) => { rrect(c, -140, -200, 280, 200, 8, { fill: '#8a5a2b', lw: 8, seed: sd }); rrect(c, -170, -230, 340, 40, 8, { fill: '#a0703c', lw: 8, seed: sd + 1 }); };
PROPS.ladder = (c, st, o, sd) => { line(c, [[-70, 0], [-70, -700]], { lw: 12, stroke: '#a0703c', seed: sd }); line(c, [[70, 0], [70, -700]], { lw: 12, stroke: '#a0703c', seed: sd + 1 }); for (let i = 0; i < 7; i++) line(c, [[-70, -50 - i * 100], [70, -50 - i * 100]], { lw: 10, stroke: '#a0703c', seed: sd + i }); };
PROPS.curseCloud = (c, st, o, sd) => { c.save(); c.globalAlpha *= 0.85; for (const [x, y, r] of [[0, 0, 50], [50, -10, 40], [-50, -6, 42], [20, -40, 36]]) circ(c, x, y, r, { fill: '#6b3fa0', lw: 5, seed: sd + x }); c.restore(); for (let i = 0; i < 3; i++) { const ph = (st.t * 1.4 + i / 3) % 1; c.save(); c.globalAlpha *= 1 - ph; line(c, [[-40 + i * 40, 30 + ph * 60], [-34 + i * 40, 50 + ph * 60]], { lw: 5, stroke: '#a77bdc', seed: i }); c.restore(); } txt(c, '☠', 0, -6, { size: 50, fill: '#fff', lw: 0, shadow: false, font: 'sans-serif' }); };
PROPS.flower = (c, st, o, sd) => { line(c, [[0, 60], [0, 0]], { lw: 6, stroke: '#3e7a2a', seed: sd }); for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; circ(c, Math.cos(a) * 18, Math.sin(a) * 18 - 10, 14, { fill: o.color || '#ff7aa8', lw: 4, seed: sd + i }); } circ(c, 0, -10, 10, { fill: '#ffd23f', lw: 4, seed: sd }); };
PROPS.bell = (c, st, o, sd) => { c.rotate(Math.sin(st.t * 10) * 0.3); shp(c, [[-50, 40], [-40, -30], [0, -60], [40, -30], [50, 40]], { fill: '#f0c419', lw: 7, seed: sd }); circ(c, 0, 50, 12, { fill: '#c99a10', lw: 5, seed: sd + 1 }); };
PROPS.altar = (c, st, o, sd) => { rrect(c, -110, -160, 220, 160, 8, { fill: '#e2dccf', lw: 8, seed: sd }); rrect(c, -130, -180, 260, 30, 6, { fill: '#d6cfbf', lw: 7, seed: sd + 1 }); };
PROPS.cake = (c, st, o, sd) => { rrect(c, -50, -40, 100, 50, 10, { fill: '#e3b77a', lw: 6, seed: sd }); ell(c, 0, -40, 50, 14, { fill: '#f5e2c0', lw: 5, seed: sd + 1 }); };
PROPS.helpers = (c, st, o, sd) => {};

/* Hand-drawn props. Each prop draws centered at (0,0) in a local space ~200px
 * wide at scale 1; call through P.draw(D, name, x, y, s, opts). */
(function (root) {
  const E = typeof module !== 'undefined' && module.exports ? require('./engine.js') : root.Engine;
  const { clamp, ease, rnd, lerp } = E;
  const INK = E.INK;
  const P = {};

  P.draw = function (D, name, x, y, s = 1, o = {}) {
    const fn = P[name];
    if (!fn) throw new Error('unknown prop ' + name);
    D.push(x, y, s, o.rot || 0, o.alpha == null ? 1 : o.alpha);
    fn(D, o);
    D.pop();
  };

  // ---------------- buildings ----------------
  P.house = (D, o) => {
    const id = o.id || 200;
    const wall = o.wall || '#f2d6a2', roof = o.roof || '#c0504d', door = o.door || '#8d5a2b';
    if (o.chimney !== false) D.rect(40, -150, 26, 50, { fill: '#9e6b4a', w: 5, id: id + 1 });
    D.rect(-90, -80, 180, 120, { fill: wall, w: 6, id: id + 2 });
    D.shape([[-112, -76], [0, -165], [112, -76]], { fill: roof, w: 6, id: id + 3 });
    D.rect(-22, -12, 44, 52, { fill: door, w: 5, id: id + 4 });
    D.circle(12, 16, 3.5, { fill: INK, w: 0, id: id + 5 });
    for (const wx of [-68, 36]) { D.rect(wx, -58, 32, 30, { fill: o.win || '#9fd3f0', w: 5, id: id + 6 + wx }); D.line(wx + 16, -58, wx + 16, -28, { w: 3, id: id + 8 + wx }); }
    if (o.crack) { D.poly([[-60, -78], [-48, -50], [-60, -30], [-44, 0]], { w: 4, sharp: true, id: id + 9 }); D.poly([[70, -120], [56, -100], [64, -88]], { w: 4, sharp: true, id: id + 10 }); }
    if (o.sign) P.signPost(D, Object.assign({ x: 120, text: o.sign }, o.signOpts || {}));
  };
  P.signPost = (D, o) => {
    const x = o.x || 0, id = o.id || 230;
    D.line(x, 40, x, -60, { w: 7, color: '#6d4c2f', id });
    D.push(x, -70, 1, o.tilt == null ? -0.06 : o.tilt);
    const w = Math.max(110, D.measure(o.text, 30, 'Permanent Marker') + 30);
    D.rect(-w / 2, -26, w, 52, { fill: o.fill || '#d32f2f', w: 5, id: id + 1 });
    D.text(o.text, 0, 2, { size: 30, font: 'Permanent Marker', color: o.color || '#fff' });
    D.pop();
  };
  P.condo = (D, o) => {
    const id = o.id || 260; const fl = o.floors || 9; const w = o.w || 150; const fh = 34;
    const h = fl * fh + 20; const col = o.color || '#9fb4c7';
    D.rect(-w / 2, 40 - h, w, h, { fill: col, w: 6, id: id });
    for (let f = 0; f < fl; f++) for (let k = 0; k < 3; k++) {
      const wx = -w / 2 + 18 + k * ((w - 36) / 3), wy = 40 - h + 16 + f * fh;
      D.rect(wx, wy, (w - 36) / 3 - 10, 20, { fill: o.lit && rnd(id, f, k) > 0.5 ? '#ffe082' : '#e3f2fd', w: 3.5, id: id + 3 + f * 3 + k, amp: 1 });
    }
    D.rect(-18, 0, 36, 40, { fill: '#5d4037', w: 4, id: id + 1 });
    if (o.crack) { D.poly([[w / 2 - 40, 40 - h], [w / 2 - 20, 40 - h + 60], [w / 2 - 50, 40 - h + 110], [w / 2 - 25, 40 - h + 170]], { w: 6, sharp: true, id: id + 2 }); }
    if (o.scaffold) { for (let i = 0; i < 4; i++) D.line(w / 2 + 10, 40 - i * (h / 4), w / 2 + 40, 40 - i * (h / 4) - 30, { w: 4, color: '#8d6e63', id: id + 90 + i }); D.line(w / 2 + 25, 40, w / 2 + 25, 40 - h, { w: 5, color: '#8d6e63', id: id + 95 }); }
  };
  P.bank = (D, o) => {
    const id = o.id || 300;
    D.shape([[-120, -90], [0, -160], [120, -90]], { fill: o.roof || '#cfd8dc', w: 6, id });
    D.rect(-115, -92, 230, 18, { fill: '#b0bec5', w: 5, id: id + 1 });
    for (let i = 0; i < 4; i++) D.rect(-95 + i * 55, -72, 24, 100, { fill: '#eceff1', w: 5, id: id + 2 + i });
    D.rect(-125, 28, 250, 18, { fill: '#b0bec5', w: 5, id: id + 8 });
    if (o.label) { const fs = D.fit(o.label, 200, 34, 'Permanent Marker'); D.rect(-112, 56, 224, 50, { fill: '#fff', w: 5, id: id + 9 }); D.text(o.label, 0, 82, { size: fs, font: 'Permanent Marker', color: o.labelColor || '#1565c0' }); }
  };
  P.office = (D, o) => {
    const id = o.id || 320;
    D.rect(-70, -220, 140, 260, { fill: o.color || '#78909c', w: 6, id });
    for (let r = 0; r < 6; r++) for (let k = 0; k < 2; k++) D.rect(-48 + k * 56, -200 + r * 38, 40, 24, { fill: '#cfd8dc', w: 3.5, id: id + 1 + r * 2 + k, amp: 1 });
  };
  P.ruins = (D, o) => {
    // collapsed building silhouette, muted and respectful
    const id = o.id || 340;
    D.shape([[-150, 40], [-150, -250], [-40, -250], [-40, -150], [-10, -170], [20, -110], [50, -130], [80, -60], [110, -80], [150, 40]], { fill: '#b0b0b0', w: 6, id });
    for (let f = 0; f < 6; f++) for (let k = 0; k < 2; k++) D.rect(-130 + k * 45, -230 + f * 42, 30, 22, { fill: '#e0e0e0', w: 3.5, id: id + 1 + f * 2 + k, amp: 1 });
    for (let i = 0; i < 7; i++) D.rect(-30 + i * 25, 15 - (i % 3) * 14, 30, 20, { fill: '#9e9e9e', w: 4, rot: 0, id: id + 30 + i });
  };

  // ---------------- money & documents ----------------
  P.bill = (D, o) => {
    const id = o.id || 400;
    D.rect(-90, -45, 180, 90, { fill: '#8bc34a', w: 6, id });
    D.rect(-74, -32, 148, 64, { w: 3, color: '#33691e', id: id + 1 });
    D.circle(0, 0, 22, { fill: '#c5e1a5', w: 4, color: '#33691e', id: id + 2 });
    D.text('$', 0, 2, { size: 36, font: 'Permanent Marker', color: '#33691e' });
  };
  P.moneybag = (D, o) => {
    const id = o.id || 420;
    D.circle(0, 10, 78, { fill: o.color || '#689f38', w: 6, id });
    D.shape([[-28, -62], [28, -62], [42, -100], [-42, -100]], { fill: o.color || '#689f38', w: 6, id: id + 1 });
    D.line(-34, -62, 34, -62, { w: 7, color: '#c19a3f', id: id + 2 });
    D.text(o.label || '$', 0, 16, { size: o.label ? 40 : 86, font: 'Permanent Marker', color: '#f1f8e9' });
  };
  P.coins = (D, o) => {
    const n = o.n || 4, id = o.id || 440;
    for (let i = 0; i < n; i++) { D.circle(0, -i * 16, 46, { fill: '#f4c430', w: 5, sy: 0.32, id: id + i }); }
    D.text('$', 0, -(n - 1) * 16, { size: 22, font: 'Permanent Marker', color: '#8d6e00' });
  };
  P.doc = (D, o) => {
    const id = o.id || 460;
    const w = o.w || 170, h = o.h || 220;
    D.shape([[-w / 2, -h / 2], [w / 2 - 30, -h / 2], [w / 2, -h / 2 + 30], [w / 2, h / 2], [-w / 2, h / 2]], { fill: o.fill || '#fffdf5', w: 6, id });
    D.poly([[w / 2 - 30, -h / 2], [w / 2 - 30, -h / 2 + 30], [w / 2, -h / 2 + 30]], { w: 4, sharp: true, id: id + 1 });
    const title = o.title || '';
    const ts = title ? D.fit(title, w - 34, o.titleSize || 34, 'Permanent Marker') : 0;
    if (title) D.text(title, -4, -h / 2 + 34, { size: ts, font: 'Permanent Marker', color: o.titleColor || '#c62828' });
    const lines = o.lines == null ? 4 : o.lines;
    for (let i = 0; i < lines; i++) {
      const yy = -h / 2 + 72 + i * 26;
      if (yy > h / 2 - 50) break;
      D.poly([[-w / 2 + 18, yy], [-w / 2 + 40, yy - 4], [-w / 2 + 70, yy + 3], [w / 2 - 22 - (i % 2) * 30, yy - 2]], { w: 3.5, color: '#555', id: id + 2 + i });
    }
    if (o.amount) D.text(o.amount, 0, h / 2 - 40, { size: D.fit(o.amount, w - 30, o.amountSize || 38, 'Permanent Marker'), font: 'Permanent Marker', color: o.amountColor || '#151515' });
    if (o.sig) D.poly([[-w / 2 + 20, h / 2 - 22], [-w / 2 + 40, h / 2 - 40], [-w / 2 + 52, h / 2 - 18], [-w / 2 + 70, h / 2 - 36], [-w / 2 + 90, h / 2 - 22]], { w: 3.5, color: '#1e3a8a', id: id + 20 });
    if (o.stamp) { D.push(10, 10, 1, -0.25); const ss = D.fit(o.stamp, w * 0.85, 30, 'Permanent Marker'); const sw2 = D.measure(o.stamp, ss, 'Permanent Marker') + 24; D.rect(-sw2 / 2, -ss * 0.85, sw2, ss * 1.7, { w: 5, color: '#d32f2f', id: id + 30 }); D.text(o.stamp, 0, 2, { size: ss, font: 'Permanent Marker', color: '#d32f2f' }); D.pop(); }
  };
  P.calendar = (D, o) => {
    const id = o.id || 500;
    D.rect(-90, -80, 180, 170, { fill: '#fff', w: 6, id });
    D.rect(-90, -80, 180, 48, { fill: '#e53935', w: 6, id: id + 1 });
    for (const rx of [-50, 50]) D.rect(rx - 6, -98, 12, 34, { fill: '#9e9e9e', w: 4, id: id + 2 + rx });
    D.text(o.month || 'JAN', 0, -55, { size: D.fit(o.month || 'JAN', 160, 32, 'Permanent Marker'), font: 'Permanent Marker', color: '#fff' });
    D.text(o.day || '1', 0, 30, { size: D.fit(o.day || '1', 158, o.daySize || 72, 'Permanent Marker'), font: 'Permanent Marker' });
  };
  P.chalkboard = (D, o) => {
    const id = o.id || 520; const w = o.w || 520, h = o.h || 300;
    D.rect(-w / 2 - 16, -h / 2 - 16, w + 32, h + 32, { fill: '#6d4c2f', w: 6, id });
    D.rect(-w / 2, -h / 2, w, h, { fill: '#2e6b3c', w: 4, id: id + 1 });
    const lines = Array.isArray(o.text) ? o.text : [o.text || ''];
    const size = o.size || 56;
    lines.forEach((l, i) => D.text(l, 0, (i - (lines.length - 1) / 2) * size * 1.15, { size, font: 'Gochi Hand', color: '#f4f4f4' }));
  };
  P.receipt = (D, o) => {
    const id = o.id || 540; const w = o.w || 330; const rows = o.rows || [];
    const h = 90 + rows.length * 44 + (o.total ? 70 : 0);
    const pts = [[-w / 2, -h / 2]]; for (let i = 0; i <= 10; i++) pts.push([-w / 2 + (w * i) / 10, -h / 2 + (i % 2 ? 0 : 8)]);
    pts.push([w / 2, h / 2]); for (let i = 10; i >= 0; i--) pts.push([-w / 2 + (w * i) / 10, h / 2 - (i % 2 ? 0 : 8)]);
    D.shape(pts, { fill: '#fffef8', w: 5, id });
    D.text(o.title || 'MONTHLY BILL', 0, -h / 2 + 42, { size: 30, font: 'Permanent Marker' });
    rows.forEach((r, i) => {
      const k = r.k == null ? 1 : r.k; if (k <= 0) return;
      const yy = -h / 2 + 92 + i * 44;
      D.text(r.label, -w / 2 + 18, yy, { size: 30, align: 'left', alpha: k, color: r.color || INK });
      D.text(r.value, w / 2 - 18, yy, { size: 32, align: 'right', font: 'Kalam', weight: 'bold', alpha: k, color: r.color || INK });
    });
    if (o.total) {
      const yy = h / 2 - 50;
      D.line(-w / 2 + 14, yy - 30, w / 2 - 14, yy - 30, { w: 4, id: id + 5 });
      D.text('TOTAL', -w / 2 + 18, yy, { size: 32, align: 'left', font: 'Permanent Marker', alpha: o.totalK == null ? 1 : o.totalK });
      D.text(o.total, w / 2 - 18, yy, { size: 38, align: 'right', font: 'Kalam', weight: 'bold', color: '#d32f2f', alpha: o.totalK == null ? 1 : o.totalK });
    }
  };

  // ---------------- weather / florida things ----------------
  P.palm = (D, o) => {
    const id = o.id || 560;
    D.shape([[-12, 40], [-2, -60], [12, -160], [26, -232], [42, -228], [28, -160], [18, -60], [12, 40]], { fill: '#a1785a', w: 5, id });
    const leaves = [[-110, -180], [-80, -280], [30, -310], [140, -260], [150, -170]];
    leaves.forEach(([lx, ly], i) => {
      const mx = (34 + lx) / 2, my = (-230 + ly) / 2 - 30;
      D.shape([[34, -230], [mx, my - 18], [lx, ly], [mx, my + 18]], { fill: '#43a047', w: 5, id: id + 2 + i });
    });
    D.circle(30, -215, 13, { fill: '#6d4c41', w: 4, id: id + 9 }); D.circle(48, -210, 13, { fill: '#6d4c41', w: 4, id: id + 10 });
  };
  P.sun = (D, o) => {
    const id = o.id || 580; const t = D.t;
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + t * 0.4; D.line(Math.cos(a) * 70, Math.sin(a) * 70, Math.cos(a) * 100, Math.sin(a) * 100, { w: 7, color: '#f9a825', id: id + i }); }
    D.circle(0, 0, 56, { fill: '#fdd835', w: 6, id: id + 20 });
  };
  P.snow = (D, o) => {
    const id = o.id || 600;
    for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; D.line(-Math.cos(a) * 60, -Math.sin(a) * 60, Math.cos(a) * 60, Math.sin(a) * 60, { w: 8, color: '#64b5f6', id: id + i }); }
    D.circle(0, 0, 10, { fill: '#e3f2fd', w: 4, color: '#64b5f6', id: id + 5 });
  };
  P.hurricane = (D, o) => {
    const id = o.id || 620; const t = D.t;
    D.push(0, 0, 1, -t * 2.2);
    for (let k = 0; k < 2; k++) {
      const pts = []; for (let i = 0; i < 40; i++) { const a = i * 0.25 + k * Math.PI; const r = 10 + i * 3; pts.push([Math.cos(a) * r, Math.sin(a) * r]); }
      D.poly(pts, { w: 12, color: o.color || '#546e7a', id: id + k });
    }
    D.circle(0, 0, 14, { fill: '#eceff1', w: 5, id: id + 5 });
    D.pop();
  };
  P.cloud = (D, o) => {
    const id = o.id || 640; const col = o.color || '#90a4ae';
    for (const [cx, cy, r] of [[-60, 10, 45], [0, -20, 60], [60, 10, 45]]) D.circle(cx, cy, r, { fill: col, w: 6, id: id + cx });
    D.rect(-100, 0, 200, 50, { fill: col, w: 0, id: id + 9 });
    D.line(-100, 50, 100, 50, { w: 6, id: id + 10 });
    if (o.rain) for (let i = 0; i < 6; i++) { const yy = 70 + ((D.t * 300 + i * 37) % 80); D.line(-80 + i * 32, yy, -88 + i * 32, yy + 22, { w: 5, color: '#1e88e5', id: id + 20 + i }); }
  };
  P.waves = (D, o) => {
    // flood water band: width o.w, top at 0
    const id = o.id || 660; const w = o.w || 600; const t = D.t;
    const pts = [];
    for (let i = 0; i <= 24; i++) { const x = -w / 2 + (w * i) / 24; pts.push([x, Math.sin(i * 0.9 + t * 3) * 10]); }
    const poly = pts.concat([[w / 2, o.h || 200], [-w / 2, o.h || 200]]);
    D.shape(poly, { fill: o.color || 'rgba(66,165,245,0.72)', w: 0, id, amp: 0 });
    D.poly(pts, { w: 6, color: '#1565c0', id: id + 1 });
  };
  P.umbrella = (D, o) => {
    const id = o.id || 680;
    const pts = []; for (let i = 0; i <= 16; i++) { const a = Math.PI + (Math.PI * i) / 16; pts.push([Math.cos(a) * 110, -40 + Math.sin(a) * 90]); }
    for (let i = 3; i >= 0; i--) { const x = -110 + (220 * (i + 0.5)) / 4; pts.push([x + 27, -40], [x, -52]); }
    D.shape(pts, { fill: o.color || '#1e88e5', w: 6, id });
    D.poly([[0, -40], [0, 70], [-8, 86], [-26, 80]], { w: 6, id: id + 1 });
  };
  P.shield = (D, o) => {
    const id = o.id || 700;
    D.shape([[0, -110], [90, -75], [80, 20], [0, 105], [-80, 20], [-90, -75]], { fill: o.color || '#42a5f5', w: 6, id });
    if (o.text) D.text(o.text, 0, -5, { size: o.size || 44, font: 'Permanent Marker', color: '#fff' });
  };
  P.car = (D, o) => {
    const id = o.id || 720;
    D.shape([[-140, 20], [-140, -30], [-80, -40], [-50, -90], [60, -90], [100, -40], [140, -30], [140, 20]], { fill: o.color || '#e53935', w: 6, id });
    D.shape([[-40, -80], [-62, -42], [0, -42], [0, -80]], { fill: '#bbdefb', w: 4, id: id + 1 });
    D.shape([[12, -80], [12, -42], [84, -42], [56, -80]], { fill: '#bbdefb', w: 4, id: id + 2 });
    D.circle(-80, 25, 30, { fill: '#424242', w: 6, id: id + 3 }); D.circle(80, 25, 30, { fill: '#424242', w: 6, id: id + 4 });
    D.circle(-80, 25, 10, { fill: '#bdbdbd', w: 3, id: id + 5 }); D.circle(80, 25, 10, { fill: '#bdbdbd', w: 3, id: id + 6 });
    if (o.lock) { D.push(0, -10, 1); P.padlock(D, { id: id + 9 }); D.pop(); }
  };
  P.padlock = (D, o) => {
    const id = o.id || 740;
    D.arc(0, -40, 34, Math.PI, Math.PI * 2, { w: 12, color: '#757575', id });
    D.line(-34, -40, -34, -20, { w: 12, color: '#757575', id: id + 1 }); D.line(34, -40, 34, -20, { w: 12, color: '#757575', id: id + 2 });
    D.rect(-52, -24, 104, 82, { fill: o.color || '#f4b400', w: 6, id: id + 3 });
    D.text(o.text || '', 0, 18, { size: 40, font: 'Permanent Marker' });
  };
  P.badge = (D, o) => {
    const id = o.id || 760;
    D.circle(0, 0, o.r || 70, { fill: o.color || '#ef6c00', w: 6, id });
    D.text(o.text || '%', 0, 4, { size: o.size || 70, font: 'Permanent Marker', color: o.textColor || '#fff' });
  };
  P.bubble = (D, o) => {
    // speech bubble with tail pointing to (o.tx,o.ty) relative
    const id = o.id || 780; const lines = Array.isArray(o.text) ? o.text : [o.text || ''];
    const size = o.size || 40;
    const w = Math.max(...lines.map((l) => D.measure(l, size, 'Gochi Hand'))) + 60, h = lines.length * size * 1.15 + 40;
    const tx = o.tx == null ? -w * 0.2 : o.tx, ty = o.ty == null ? h * 0.9 : o.ty;
    const pts = [];
    for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; pts.push([Math.cos(a) * w / 2 * 1.02, Math.sin(a) * h / 2 * 1.08]); }
    D.poly(pts, { closed: true, fill: o.fill || '#fff', w: 5, id });
    D.shape([[tx * 0.35 - 14, h * 0.4], [tx, ty], [tx * 0.35 + 14, h * 0.42]], { fill: o.fill || '#fff', w: 0, id: id + 1 });
    D.poly([[tx * 0.35 - 14, h * 0.43], [tx, ty], [tx * 0.35 + 16, h * 0.45]], { w: 5, sharp: true, id: id + 2 });
    lines.forEach((l, i) => D.text(l, 0, (i - (lines.length - 1) / 2) * size * 1.15, { size, font: 'Gochi Hand', color: o.color || INK }));
    if (o.think) { D.circle(tx * 0.6, ty * 0.75, 12, { fill: '#fff', w: 4, id: id + 5 }); }
  };
  P.table = (D, o) => {
    const id = o.id || 800; const w = o.w || 300;
    D.circle(0, 0, w / 2, { sy: 0.22, fill: '#9e9e9e', w: 6, id });
    D.line(-w / 2 + 30, 10, -w / 2 + 30, 120, { w: 7, id: id + 1 }); D.line(w / 2 - 30, 10, w / 2 - 30, 120, { w: 7, id: id + 2 });
  };
  P.chair = (D, o) => {
    const id = o.id || 820;
    D.line(-30, -120, -30, 40, { w: 6, id }); D.line(-30, -10, 40, -10, { w: 6, id: id + 1 }); D.line(40, -10, 40, 40, { w: 6, id: id + 2 });
  };
  P.phone = (D, o) => {
    const id = o.id || 840;
    D.rect(-110, -200, 220, 400, { fill: '#263238', w: 6, id });
    D.rect(-94, -170, 188, 330, { fill: '#fafafa', w: 3, id: id + 1 });
    D.circle(0, 180, 9, { fill: '#546e7a', w: 2, id: id + 2 });
    const msgs = o.msgs || [];
    msgs.forEach((m, i) => {
      if (m.k != null && m.k <= 0) return;
      const yy = -130 + i * 74; const mine = m.mine;
      const w = Math.min(150, D.measure(m.text, 24, 'Patrick Hand') + 30);
      const x0 = mine ? 84 - w : -84;
      D.rect(x0, yy - 24, w, 48, { fill: mine ? '#2196f3' : '#e0e0e0', w: 2.5, id: id + 10 + i, amp: 0.8 });
      D.text(m.text, x0 + w / 2, yy, { size: 24, color: mine ? '#fff' : INK });
      if (m.read) D.text(m.read, 84, yy + 40, { size: 20, align: 'right', color: '#757575' });
    });
  };
  P.ticket = (D, o) => {
    const id = o.id || 860;
    D.shape([[-130, -60], [130, -60], [130, -20], [116, 0], [130, 20], [130, 60], [-130, 60], [-130, 20], [-116, 0], [-130, -20]], { fill: o.fill || '#ffca28', w: 6, id });
    D.line(60, -55, 60, 55, { w: 3, id: id + 1 });
    D.text(o.text || 'ADMIT ONE', -30, -18, { size: 28, font: 'Permanent Marker' });
    D.text(o.price || '$$$', -30, 26, { size: 30, font: 'Permanent Marker', color: '#c62828' });
  };
  P.crane = (D, o) => {
    const id = o.id || 880;
    D.line(0, 40, 0, -320, { w: 10, color: '#f9a825', id }); D.line(-60, -300, 240, -300, { w: 10, color: '#f9a825', id: id + 1 });
    for (let i = 0; i < 8; i++) D.line(-6, 30 - i * 44, 6, 8 - i * 44, { w: 4, id: id + 2 + i });
    D.line(200, -300, 200, -160 + Math.sin(D.t * 2) * 10, { w: 3, id: id + 20 });
    D.rect(180, -160 + Math.sin(D.t * 2) * 10, 40, 30, { fill: '#8d6e63', w: 4, id: id + 21 });
  };
  P.frame = (D, o) => { // house frame under construction
    const id = o.id || 900;
    D.poly([[-90, 40], [-90, -80], [90, -80], [90, 40]], { w: 6, color: '#a1887f', sharp: true, id });
    D.poly([[-112, -76], [0, -165], [112, -76]], { w: 6, color: '#a1887f', sharp: true, id: id + 1 });
    for (let i = 0; i < 4; i++) D.line(-60 + i * 40, 40, -60 + i * 40, -80, { w: 4, color: '#bcaaa4', id: id + 2 + i });
  };
  P.ballot = (D, o) => {
    const id = o.id || 920;
    D.rect(-100, -60, 200, 140, { fill: '#1565c0', w: 6, id });
    D.rect(-50, -66, 100, 12, { fill: '#0d47a1', w: 4, id: id + 1 });
    D.text('VOTE', 0, 12, { size: 48, font: 'Permanent Marker', color: '#fff' });
    D.push(10, -90 - Math.abs(Math.sin(D.t * 2)) * 20, 1, 0.1); P.doc(D, { w: 90, h: 110, title: 'YES', titleSize: 30, lines: 2, id: id + 5 }); D.pop();
  };
  P.magnifier = (D, o) => { const id = o.id || 940; D.line(45, 45, 110, 110, { w: 18, color: '#5d4037', id }); D.circle(0, 0, 65, { fill: 'rgba(227,242,253,0.6)', w: 10, id: id + 1 }); };
  P.clipboard = (D, o) => {
    const id = o.id || 960;
    D.rect(-90, -120, 180, 240, { fill: '#a1887f', w: 6, id }); D.rect(-75, -100, 150, 205, { fill: '#fff', w: 4, id: id + 1 });
    D.rect(-35, -132, 70, 28, { fill: '#9e9e9e', w: 5, id: id + 2 });
    (o.items || ['', '', '']).forEach((it, i) => { const yy = -60 + i * 50; D.rect(-62, yy - 14, 26, 26, { w: 4, id: id + 3 + i }); if (o.checks && i < o.checks) D.poly([[-60, yy], [-50, yy + 10], [-30, yy - 18]], { w: 5, color: '#2e7d32', id: id + 10 + i }); D.text(it, -26, yy, { size: 26, align: 'left' }); });
  };
  P.arrowBig = (D, o) => {
    const id = o.id || 980; const up = o.dir !== 'down'; const col = o.color || (up ? '#2e7d32' : '#d32f2f');
    const s = up ? -1 : 1;
    D.shape([[-35, -70 * s], [35, -70 * s], [35, 10 * s], [75, 10 * s], [0, 90 * s], [-75, 10 * s], [-35, 10 * s]], { fill: col, w: 6, id });
  };
  P.truck = (D, o) => {
    const id = o.id || 1000;
    D.rect(-170, -130, 220, 140, { fill: o.color || '#fafafa', w: 6, id });
    D.shape([[50, -90], [120, -90], [160, -40], [160, 10], [50, 10]], { fill: '#ef5350', w: 6, id: id + 1 });
    D.shape([[70, -78], [112, -78], [140, -44], [70, -44]], { fill: '#bbdefb', w: 4, id: id + 2 });
    D.circle(-110, 20, 28, { fill: '#424242', w: 6, id: id + 3 }); D.circle(100, 20, 28, { fill: '#424242', w: 6, id: id + 4 });
    if (o.text) D.text(o.text, -60, -60, { size: 36, font: 'Permanent Marker', color: '#1e88e5' });
  };
  P.suitcase = (D, o) => {
    const id = o.id || 1020;
    D.rect(-70, -55, 140, 105, { fill: o.color || '#8d6e63', w: 6, id }); D.rect(-26, -78, 52, 24, { w: 6, id: id + 1 });
    D.line(-70, -10, 70, -10, { w: 4, id: id + 2 });
  };
  P.scale = (D, o) => {
    const id = o.id || 1040; const tilt = o.tilt || 0;
    D.line(0, 120, 0, -120, { w: 8, id }); D.line(-60, 120, 60, 120, { w: 8, id: id + 1 });
    D.push(0, -120, 1, tilt);
    D.line(-150, 0, 150, 0, { w: 8, id: id + 2 });
    for (const sx of [-1, 1]) { D.line(sx * 150, 0, sx * 150 - 40, 80, { w: 3, id: id + 3 + sx }); D.line(sx * 150, 0, sx * 150 + 40, 80, { w: 3, id: id + 5 + sx }); }
    D.pop();
  };
  P.fed = (D, o) => { P.bank(D, Object.assign({ label: 'THE FED' }, o)); };
  P.question = (D, o) => { D.text('?', 0, 0, { size: o.size || 160, font: 'Permanent Marker', color: o.color || '#1e66d0' }); };
  P.heart = (D, o) => {
    const id = o.id || 1060;
    D.poly([[0, 60], [-70, -5], [-70, -45], [-40, -70], [0, -40], [40, -70], [70, -45], [70, -5]], { closed: true, fill: o.color || '#e53950', w: 6, id });
  };
  P.thermo = (D, o) => {
    const id = o.id || 1080; const lvl = clamp(o.level == null ? 0.5 : o.level);
    D.rect(-22, -170, 44, 210, { fill: '#fff', w: 6, id });
    D.circle(0, 70, 42, { fill: '#e53935', w: 6, id: id + 1 });
    D.rect(-10, 40 - 200 * lvl, 20, 200 * lvl + 10, { fill: '#e53935', w: 0, id: id + 2, amp: 0 });
  };
  P.pin = (D, o) => {
    const id = o.id || 1100;
    D.poly([[0, 0], [-22, -34], [-26, -56], [-14, -76], [0, -82], [14, -76], [26, -56], [22, -34]], { closed: true, fill: o.color || '#e53935', w: 5, id });
    D.circle(0, -54, 9, { fill: '#fff', w: 3, id: id + 1 });
  };
  P.crack = (D, o) => {
    const id = o.id || 1120; const k = o.k == null ? 1 : o.k;
    const pts = [[0, -150], [-20, -100], [15, -60], [-15, -10], [20, 40], [-5, 90], [10, 150]];
    const n = Math.max(2, Math.round(pts.length * k));
    D.poly(pts.slice(0, n), { w: 8, sharp: true, id });
  };
  P.fire = (D, o) => {
    const id = o.id || 1140; const t = D.t;
    for (let i = 0; i < 5; i++) {
      const x = -120 + i * 60, h = 120 + Math.sin(t * 8 + i) * 20 + (i % 2) * 40;
      D.shape([[x - 40, 40], [x - 20, -h * 0.5], [x, -h], [x + 20, -h * 0.5], [x + 40, 40]], { fill: i % 2 ? '#ff9800' : '#ffc107', w: 5, id: id + i });
    }
  };
  P.chair2 = P.chair;

  // ---------------- florida map ----------------
  const FL = [[-87.6, 31.0], [-85.0, 31.0], [-84.86, 30.71], [-83.5, 30.65], [-82.2, 30.57], [-82.05, 30.36], [-81.45, 30.71],
    [-81.4, 30.3], [-81.25, 29.85], [-81.0, 29.2], [-80.6, 28.6], [-80.55, 28.25], [-80.4, 27.6], [-80.05, 26.95], [-80.03, 26.2], [-80.13, 25.77],
    [-80.35, 25.3], [-80.6, 25.15], [-80.95, 25.15], [-81.15, 25.4], [-81.4, 25.8], [-81.75, 26.0], [-81.82, 26.25], [-81.95, 26.5],
    [-82.15, 26.55], [-82.27, 26.8], [-82.45, 27.1], [-82.65, 27.45], [-82.75, 27.75], [-82.85, 28.0], [-82.7, 28.4], [-82.65, 28.75],
    [-82.75, 29.0], [-83.05, 29.15], [-83.4, 29.5], [-83.65, 29.95], [-84.05, 30.1], [-84.35, 29.95], [-84.9, 29.72], [-85.3, 29.68],
    [-85.4, 29.95], [-85.75, 30.15], [-86.4, 30.38], [-86.9, 30.38], [-87.3, 30.32], [-87.5, 30.28], [-87.45, 30.55]];
  const CITIES = {
    'Punta Gorda': [-82.05, 26.93], 'Cape Coral': [-81.95, 26.56], 'Fort Myers': [-81.87, 26.64], 'Naples': [-81.79, 26.14],
    'North Port': [-82.24, 27.04], 'Sarasota': [-82.53, 27.34], 'Bradenton': [-82.57, 27.5], 'Lakeland': [-81.95, 28.04],
    'Tampa': [-82.46, 27.95], 'Orlando': [-81.38, 28.54], 'Miami': [-80.19, 25.76], 'Jacksonville': [-81.66, 30.33],
    'Pinellas': [-82.72, 27.85], 'Surfside': [-80.12, 25.88], 'Babcock Ranch': [-81.73, 26.85], 'Manatee': [-82.4, 27.45],
    'Miami-Dade': [-80.45, 25.6], 'Tallahassee': [-84.28, 30.44],
  };
  // project lon/lat into a local box; map is ~ 700 x 560 at scale 1, centered
  const proj = ([lon, lat]) => [(lon + 83.8) * 120, -(lat - 28.0) * 128];
  P.flCity = (name) => proj(CITIES[name]);
  P.florida = (D, o) => {
    const id = o.id || 1200;
    D.poly(FL.map(proj), { closed: true, fill: o.fill || '#a5d6a7', w: 7, id });
    // keys dots
    for (let i = 0; i < 6; i++) D.circle(proj([-80.5 - i * 0.28, 24.95 - i * 0.04])[0], proj([-80.5 - i * 0.28, 24.95 - i * 0.04])[1], 5, { fill: '#a5d6a7', w: 3, id: id + 10 + i });
    if (o.label !== false) D.text('FLORIDA', 40, -10, { size: 54, font: 'Permanent Marker', color: '#2e7d32', alpha: 0.75 });
  };
  P.florida.cities = CITIES;

  // ---------------- people-ish icons ----------------
  P.person = (D, o) => { // tiny icon person for counts
    const id = o.id || 1300; const col = o.color || INK;
    D.circle(0, -60, 16, { fill: o.fill || '#fff', w: 4, color: col, id });
    D.poly([[0, -44], [0, -10]], { w: 4, color: col, id: id + 1 });
    D.poly([[-16, -32], [0, -26], [16, -32]], { w: 4, color: col, id: id + 2 });
    D.poly([[-12, 12], [0, -10], [12, 12]], { w: 4, color: col, id: id + 3, sharp: true });
  };


  P.trophy = (D, o) => {
    const id = o.id || 1400;
    D.shape([[-70, -120], [70, -120], [55, -30], [20, 0], [-20, 0], [-55, -30]], { fill: '#fbc02d', w: 6, id });
    D.arc(-70, -85, 30, 1.6, 4.7, { w: 8, color: '#f9a825', id: id + 1 }); D.arc(70, -85, 30, -1.6, 1.6, { w: 8, color: '#f9a825', id: id + 2 });
    D.rect(-14, 0, 28, 40, { fill: '#fbc02d', w: 5, id: id + 3 }); D.rect(-55, 40, 110, 30, { fill: '#6d4c41', w: 5, id: id + 4 });
    if (o.text) D.text(o.text, 0, -70, { size: o.size || 44, font: 'Permanent Marker', color: '#8d6e00' });
  };
  P.laptop = (D, o) => {
    const id = o.id || 1420;
    D.rect(-80, -110, 160, 100, { fill: '#455a64', w: 6, id }); D.rect(-66, -98, 132, 76, { fill: '#b3e5fc', w: 3, id: id + 1 });
    D.shape([[-100, -10], [100, -10], [115, 10], [-115, 10]], { fill: '#90a4ae', w: 6, id: id + 2 });
  };
  P.piggy = (D, o) => {
    const id = o.id || 1440;
    D.circle(0, 0, 80, { sy: 0.8, fill: '#f8bbd0', w: 6, id });
    D.circle(78, -6, 22, { sy: 0.9, fill: '#f48fb1', w: 5, id: id + 1 });
    D.shape([[-30, -58], [-10, -95], [5, -60]], { fill: '#f48fb1', w: 5, id: id + 2 });
    for (const lx of [-45, 35]) D.rect(lx, 50, 20, 30, { fill: '#f48fb1', w: 5, id: id + 3 + lx });
    D.line(-20, -60, 20, -60, { w: 6, id: id + 6 }); D.circle(40, -20, 5, { fill: '#151515', w: 0, id: id + 7 });
    if (o.text) D.text(o.text, -10, 8, { size: 34, font: 'Permanent Marker', color: '#ad1457' });
  };
  P.plane = (D, o) => {
    const id = o.id || 1460;
    D.shape([[-130, 0], [-110, -20], [120, -20], [150, 0], [120, 18], [-110, 18]], { fill: '#eceff1', w: 6, id });
    D.shape([[-20, -10], [30, -90], [60, -90], [40, -10]], { fill: '#90caf9', w: 5, id: id + 1 });
    D.shape([[-20, 10], [30, 80], [60, 80], [40, 10]], { fill: '#90caf9', w: 5, id: id + 2 });
    D.shape([[-120, -10], [-140, -60], [-110, -60], [-90, -15]], { fill: '#90caf9', w: 5, id: id + 3 });
  };
  P.flag = (D, o) => {
    const id = o.id || 1480;
    D.line(0, 120, 0, -120, { w: 8, color: '#6d4c41', id });
    D.shape([[0, -118], [120, -100 + Math.sin(D.t * 4) * 6], [110, -60], [0, -40]], { fill: o.color || '#e53935', w: 6, id: id + 1 });
  };
  P.envelope = (D, o) => {
    const id = o.id || 1500; const w = o.w || 300, h = o.h || 190;
    D.rect(-w / 2, -h / 2, w, h, { fill: '#fff8e1', w: 6, id });
    D.poly([[-w / 2, -h / 2], [0, 10], [w / 2, -h / 2]], { w: 5, sharp: true, id: id + 1 });
    if (o.to) { (Array.isArray(o.to) ? o.to : [o.to]).forEach((l, i) => D.text(l, 10, 30 + i * 34, { size: o.size || 30, font: 'Gochi Hand' })); }
    D.rect(w / 2 - 60, -h / 2 + 14, 44, 50, { fill: '#e57373', w: 4, id: id + 2 });
  };
  P.mansion = (D, o) => {
    const id = o.id || 1520;
    D.rect(-170, -120, 340, 160, { fill: '#fff3e0', w: 6, id });
    D.shape([[-190, -116], [0, -210], [190, -116]], { fill: '#5d4037', w: 6, id: id + 1 });
    for (let i = 0; i < 4; i++) D.rect(-150 + i * 86, -100, 40, 50, { fill: '#9fd3f0', w: 4, id: id + 2 + i });
    D.rect(-30, -30, 60, 70, { fill: '#8d5a2b', w: 5, id: id + 8 });
    for (let i = 0; i < 2; i++) D.rect(-62 + i * 110, -40, 14, 80, { fill: '#eceff1', w: 4, id: id + 9 + i });
    D.circle(0, -150, 18, { fill: '#fff', w: 4, id: id + 12 });
  };
  P.pie = (D, o) => {
    const id = o.id || 1540; const r = o.r || 120; const frac = clamp(o.frac == null ? 0.5 : o.frac);
    D.circle(0, 0, r, { fill: o.bgColor || '#e0e0e0', w: 6, id });
    if (frac > 0) {
      const c = D.ctx; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, r - 3, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2); c.closePath();
      c.fillStyle = o.color || '#e53935'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#151515'; c.stroke();
    }
    if (o.text) D.text(o.text, 0, 0, { size: o.size || 56, font: 'Permanent Marker', color: '#fff', outline: 8, outlineColor: '#151515' });
  };
  P.podium = (D, o) => {
    const id = o.id || 1560;
    D.shape([[-80, -60], [80, -60], [60, 90], [-60, 90]], { fill: '#8d6e63', w: 6, id });
    D.rect(-100, -80, 200, 24, { fill: '#6d4c41', w: 5, id: id + 1 });
    D.line(30, -80, 50, -120, { w: 4, id: id + 2 }); D.circle(52, -126, 8, { fill: '#424242', w: 3, id: id + 3 });
  };
  P.couch = (D, o) => {
    const id = o.id || 1580;
    D.rect(-150, -60, 300, 70, { fill: o.color || '#7986cb', w: 6, id });
    D.rect(-150, -120, 300, 70, { fill: o.color || '#7986cb', w: 6, id: id + 1 });
    D.rect(-175, -90, 40, 110, { fill: o.color || '#7986cb', w: 6, id: id + 2 }); D.rect(135, -90, 40, 110, { fill: o.color || '#7986cb', w: 6, id: id + 3 });
    D.line(-140, 20, -140, 40, { w: 6, id: id + 4 }); D.line(140, 20, 140, 40, { w: 6, id: id + 5 });
  };
  P.roller = (D, o) => {
    const id = o.id || 1600;
    D.rect(-60, -30, 120, 40, { fill: o.color || '#4fc3f7', w: 5, id }); D.poly([[60, -10], [80, -10], [80, 30], [0, 40], [0, 110]], { w: 6, id: id + 1, sharp: true });
  };
  P.hammer = (D, o) => {
    const id = o.id || 1620;
    D.line(0, 100, 0, -40, { w: 12, color: '#8d6e63', id }); D.rect(-50, -70, 100, 36, { fill: '#9e9e9e', w: 5, id: id + 1 });
  };
  P.clock = (D, o) => {
    const id = o.id || 1640; const t = D.t;
    D.circle(0, 0, o.r || 80, { fill: '#fff', w: 6, id });
    D.line(0, 0, Math.cos(t * 2 - 1.57) * 55, Math.sin(t * 2 - 1.57) * 55, { w: 6, id: id + 1 });
    D.line(0, 0, Math.cos(t * 0.3 - 1.57) * 35, Math.sin(t * 0.3 - 1.57) * 35, { w: 7, id: id + 2 });
  };
  P.globe = (D, o) => {
    const id = o.id || 1660;
    D.circle(0, 0, 90, { fill: '#64b5f6', w: 6, id });
    D.shape([[-60, -40], [-20, -60], [0, -30], [-30, 0], [-50, 10]], { fill: '#81c784', w: 4, id: id + 1 });
    D.shape([[10, 10], [50, -10], [60, 30], [30, 60], [10, 40]], { fill: '#81c784', w: 4, id: id + 2 });
  };
  P.gift = (D, o) => {
    const id = o.id || 1680;
    D.rect(-60, -50, 120, 100, { fill: o.color || '#ab47bc', w: 6, id }); D.line(0, -50, 0, 50, { w: 10, color: '#fdd835', id: id + 1 }); D.line(-60, 0, 60, 0, { w: 10, color: '#fdd835', id: id + 2 });
    D.circle(-16, -64, 16, { w: 6, color: '#fdd835', id: id + 3 }); D.circle(16, -64, 16, { w: 6, color: '#fdd835', id: id + 4 });
  };
  P.candle = (D, o) => {
    const id = o.id || 1700;
    D.rect(-18, -60, 36, 110, { fill: '#fafafa', w: 5, id }); D.line(0, -60, 0, -74, { w: 4, id: id + 1 });
    const f = Math.sin(D.t * 9) * 3; D.shape([[0, -122 + f], [14, -88], [0, -76], [-14, -88]], { fill: '#ffb300', w: 3, id: id + 2 });
  };
  P.priceTag = (D, o) => {
    const id = o.id || 1720; const txt = o.text || '$';
    const w = Math.max(160, D.measure(txt, o.size || 48, 'Permanent Marker') + 70);
    D.shape([[-w / 2, -40], [w / 2 - 30, -40], [w / 2, 0], [w / 2 - 30, 40], [-w / 2, 40]], { fill: o.fill || '#fff59d', w: 6, id });
    D.circle(w / 2 - 34, 0, 8, { fill: '#fff', w: 4, id: id + 1 });
    D.text(txt, -12, 2, { size: o.size || 48, font: 'Permanent Marker', color: o.color || '#151515' });
    if (o.slash) D.line(-w / 2 + 10, 30, w / 2 - 40, -30, { w: 8, color: '#d32f2f', id: id + 2 });
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = P; else root.Props = P;
})(typeof window !== 'undefined' ? window : globalThis);

'use strict';
// Text, article cards, charts and annotation marks.

// Handwritten label. o: {size,font,c,stroke,write(bool),wd,rot,align}
function label(text, o = {}) {
  return el(Object.assign({ enter: o.write ? 'none' : 'pop' }, o), (ctx, lt) => {
    txt(ctx, text, 0, 0, { size: o.size || 64, font: o.font || 'hand', c: o.c || COL.ink, stroke: o.stroke, sw: o.sw, align: o.align, lh: o.lh,
      reveal: o.write ? P(lt, 0, o.wd || Math.min(1.1, 0.06 * text.length + 0.2)) : 1, weight: o.weight });
  });
}
// Big red marker number/word
function big(text, x, y, o) {
  if (typeof x === 'object') { o = x; } else { o = Object.assign({ x, y }, o || {}); }
  return label(text, Object.assign({ size: 170, font: 'marker', c: COL.red, enter: 'pop' }, o));
}

// Counter that rolls from a to b. fmt: (v)=>string
function counter(o) {
  return el(Object.assign({ enter: 'pop' }, o), (ctx, lt) => {
    const k = E.out(P(lt, 0, o.d || 1.2));
    const v = lerp(o.from || 0, o.to, k);
    txt(ctx, o.fmt ? o.fmt(v) : Math.round(v).toLocaleString('en-US'), 0, 0, { size: o.size || 150, font: o.font || 'marker', c: o.c || COL.red });
  });
}

// News/report card with a highlighter sweep. o: {w,h,src,srcC,title,body:[para...],hl:[{p:index,at:sec,d:sec}], date, tag}
function card(o) {
  const w = o.w || 1000, h = o.h || 620;
  return el(Object.assign({ enter: 'slideU' }, o), (ctx, lt) => {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.18)'; ctx.shadowBlur = 26; ctx.shadowOffsetY = 10;
    ctx.fillStyle = '#fff'; ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.restore();
    ctx.strokeStyle = '#d5d8dc'; ctx.lineWidth = 2; ctx.strokeRect(-w / 2, -h / 2, w, h);
    // source strip
    ctx.fillStyle = o.srcC || '#1f3b63'; ctx.fillRect(-w / 2, -h / 2, w, 58);
    txt(ctx, o.src || 'SOURCE', -w / 2 + 28, -h / 2 + 30, { size: 26, font: 'sans', weight: 700, c: '#fff', align: 'left' });
    if (o.tag) txt(ctx, o.tag, w / 2 - 26, -h / 2 + 30, { size: 22, font: 'sans', weight: 600, c: '#dbe6f3', align: 'right' });
    let y = -h / 2 + 100;
    const tl = wrap(ctx, o.title || '', { size: 44, font: 'serif', weight: 700 }, w - 70);
    tl.forEach(l => { txt(ctx, l, -w / 2 + 34, y, { size: 44, font: 'serif', weight: 700, c: '#151a22', align: 'left' }); y += 54; });
    if (o.date) { txt(ctx, o.date, -w / 2 + 34, y - 6, { size: 22, font: 'sans', c: '#7a828c', align: 'left' }); y += 30; }
    y += 14;
    (o.body || []).forEach((para, pi) => {
      const ls = wrap(ctx, para, { size: 29, font: 'sans' }, w - 70);
      const hl = (o.hl || []).find(hh => hh.p === pi);
      ls.forEach((l, li) => {
        if (y > h / 2 - 24) return;
        if (hl) {
          const per = (hl.d || 1.2) / ls.length;
          const k = E.lin(P(lt, (hl.at || 0.4) + li * per, per));
          if (k > 0) {
            const lw = measure(ctx, l, { size: 29, font: 'sans' });
            ctx.fillStyle = hl.c || COL.hl; ctx.fillRect(-w / 2 + 30, y - 19, (lw + 8) * k, 38);
          }
        }
        txt(ctx, l, -w / 2 + 34, y, { size: 29, font: 'sans', c: hl ? '#111' : '#4b525a', align: 'left' });
        y += 40;
      });
      y += 14;
    });
  });
}

// Bar chart. o: {items:[{label,v,c,txt}], max, w, h, stagger, d, lsize, vsize}
function bars(o) {
  const w = o.w || 900, h = o.h || 460, n = o.items.length;
  const max = o.max || Math.max(...o.items.map(i => i.v)) * 1.1;
  return el(Object.assign({ enter: 'none' }, o), (ctx, lt) => {
    rline(ctx, [[-w / 2, -h / 2], [-w / 2, h / 2], [w / 2, h / 2]], { w: 6, seed: 3 });
    const gap = w / n, bw = Math.min(gap * 0.62, o.bw || 220);
    o.items.forEach((it, i) => {
      const t0 = (it.at != null ? it.at : (o.stagger != null ? o.stagger : 0.45) * i);
      const k = E.out(P(lt, t0, o.d || 0.7));
      if (lt < t0) return;
      const bh = (it.v / max) * h * k;
      const x = -w / 2 + gap * (i + 0.5);
      rect(ctx, x - bw / 2, h / 2 - bh, bw, bh, { fill: it.c || COL.blue, w: 5, seed: 10 + i });
      txt(ctx, it.label, x, h / 2 + 46, { size: o.lsize || 46, font: 'hand', c: COL.ink });
      if (k > 0.6) txt(ctx, it.txt != null ? it.txt : String(it.v), x, h / 2 - bh - 44, { size: o.vsize || 64, font: 'marker', c: it.tc || it.c || COL.ink });
    });
  });
}

// Horizontal stacked bar with segments arriving one by one. o: {segs:[{v,c,label,at}], w, h, total}
function stackbar(o) {
  const w = o.w || 1500, h = o.h || 120;
  const total = o.total || o.segs.reduce((a, s) => a + s.v, 0);
  return el(Object.assign({ enter: 'none' }, o), (ctx, lt) => {
    let x = -w / 2;
    o.segs.forEach((sg, i) => {
      const sw = (sg.v / total) * w;
      const k = E.out(P(lt, sg.at != null ? sg.at : i * 0.6, 0.5));
      if (k > 0) {
        rect(ctx, x, -h / 2, sw * k, h, { fill: sg.c, w: 5, seed: i + 3 });
        if (k > 0.8 && sg.label) txt(ctx, sg.label, x + sw / 2, (i % 2 ? h / 2 + 52 : -h / 2 - 46), { size: o.lsize || 40, font: 'hand', c: COL.ink, lh: 1 });
        if (k > 0.8 && sg.txt) txt(ctx, sg.txt, x + sw / 2, 4, { size: o.vsize || 44, font: 'marker', c: '#fff', stroke: 'rgba(0,0,0,0.35)', sw: 5 });
      }
      x += sw;
    });
  });
}

// Icon array: n icons, first k highlighted. o: {n,k,icon,cols,gap,size,on,off,stagger,hiAt}
function icons(o) {
  const cols = o.cols || o.n, gap = o.gap || 150;
  return el(Object.assign({ enter: 'none' }, o), (ctx, lt) => {
    const rows = Math.ceil(o.n / cols);
    for (let i = 0; i < o.n; i++) {
      const c = i % cols, r = Math.floor(i / cols);
      const x = (c - (cols - 1) / 2) * gap, y = (r - (rows - 1) / 2) * gap * (o.vgap || 1.1);
      const t0 = i * (o.stagger != null ? o.stagger : 0.07);
      if (lt < t0) continue;
      const pk = E.back(P(lt, t0, 0.3));
      const hi = i < o.k && lt >= (o.hiAt || 0) + (o.hiStagger || 0) * i;
      ctx.save(); ctx.translate(x, y); ctx.scale((o.size || 0.5) * pk, (o.size || 0.5) * pk);
      if (!hi) ctx.globalAlpha *= 0.28;
      if (o.icon === 'person') drawPersonIcon(ctx, hi ? (o.on || COL.blue) : '#9aa0a6', i);
      else if (o.icon === 'house') PROPS.house(ctx, { wall: hi ? (o.on || COL.tan) : '#c8c8c8', roof: hi ? COL.roof : '#9a9a9a', seed: i + 2 });
      else PROPS[o.icon](ctx, { seed: i });
      ctx.restore();
    }
  });
}
function drawPersonIcon(ctx, c, i) {
  circ(ctx, 0, -120, 48, null, { fill: c === '#9aa0a6' ? '#d9d9d9' : COL.skin, w: 6, seed: i + 3 });
  shape(ctx, [[-60, -50], [60, -50], [70, 110], [-70, 110]], { fill: c, w: 6, seed: i + 4 });
}

// Pie showing a fraction. o: {p, c, r, label}
function pie(o) {
  return el(Object.assign({ enter: 'pop' }, o), (ctx, lt) => {
    const r = o.r || 180, k = E.out(P(lt, o.pAt || 0.3, 0.8));
    circ(ctx, 0, 0, r, null, { fill: '#e6e6e6', w: 6, seed: 3 });
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r - 3, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * o.p * k); ctx.closePath();
    ctx.fillStyle = o.c || COL.red; ctx.fill(); strokeStyle(ctx, { w: 5 }); ctx.stroke();
    if (o.label && k > 0.5) txt(ctx, o.label, 0, 0, { size: o.size || 90, font: 'marker', c: '#fff', stroke: COL.ink, sw: 8 });
  });
}

// Hand-drawn circle annotation drawn on. o: {rx, ry, c, w}
function ring(o) {
  return el(Object.assign({ enter: 'none' }, o), (ctx, lt) => {
    const rx = o.rx || 160, ry = o.ry || 90, pts = [];
    for (let i = 0; i <= 44; i++) { const a = -2.2 + (i / 40) * Math.PI * 2; const k = 1 + 0.06 * Math.sin(i * 0.5); pts.push([Math.cos(a) * rx * k, Math.sin(a) * ry * k]); }
    rline(ctx, pts, { w: o.lw || 9, c: o.c || COL.red, amp: 0, reveal: E.out(P(lt, 0, o.d || 0.5)) });
  });
}
function strike(o) {
  return el(Object.assign({ enter: 'none' }, o), (ctx, lt) => {
    const w = o.w || 300;
    rline(ctx, [[-w / 2, 8], [w / 2, -8]], { w: o.lw || 12, c: o.c || COL.red, amp: 0, reveal: E.out(P(lt, 0, 0.3)) });
  });
}
function underline(o) {
  return el(Object.assign({ enter: 'none' }, o), (ctx, lt) => {
    const w = o.w || 300;
    rline(ctx, [[-w / 2, 0], [-w / 6, 6], [w / 2, -2]], { w: o.lw || 9, c: o.c || COL.red, amp: 0, reveal: E.out(P(lt, 0, 0.35)) });
  });
}
// Highlighter swipe behind a region (drawn first, then text on top by later elements)
function swipe(o) {
  return el(Object.assign({ enter: 'none' }, o), (ctx, lt) => {
    const w = o.w || 300, h = o.h || 60, k = E.out(P(lt, 0, o.d || 0.4));
    ctx.fillStyle = o.c || COL.hl; ctx.fillRect(-w / 2, -h / 2, w * k, h);
  });
}
// Generic custom drawing element
function draw(o, fn) { return el(Object.assign({ enter: 'none' }, o), fn); }

// Schematic line chart (labelled points only, no invented data). o: {pts:[[x,y,label?]], c, w, h, d}
function sketchLine(o) {
  return el(Object.assign({ enter: 'none' }, o), (ctx, lt) => {
    const k = E.io(P(lt, 0, o.d || 1.4));
    if (o.axes !== false) rline(ctx, [[-(o.w || 800) / 2, -(o.h || 400) / 2], [-(o.w || 800) / 2, (o.h || 400) / 2], [(o.w || 800) / 2, (o.h || 400) / 2]], { w: 6, seed: 2 });
    rline(ctx, o.pts.map(p => [p[0], p[1]]), { w: o.lw || 11, c: o.c || COL.blue, amp: 0, reveal: k });
    const n = o.pts.length;
    o.pts.forEach((p, i) => {
      if (!p[2]) return;
      if (k < i / (n - 1) - 0.02) return;
      dot(ctx, p[0], p[1], 13, o.c || COL.blue); dot(ctx, p[0], p[1], 6, '#fff');
      txt(ctx, p[2], p[0] + (p[4] || 0), p[1] + (p[3] != null ? p[3] : -58), { size: o.lsize || 50, font: 'marker', c: p[5] || COL.ink });
    });
  });
}

// Phone screen painters. Signature: (g, t, w, h, opts, T) where t = seconds since the phone appeared
// and T(anchor) converts an anchor into the same local clock.
import { E, clamp, rng } from './util.js';
const FUI = 'Inter, "Noto Color Emoji", sans-serif';
const EMO = '"Noto Color Emoji"';
function rr(g, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function wrapText(g, text, maxW) { const words = text.split(' '); const lines = []; let cur = ''; for (const w of words) { const t = cur ? cur + ' ' + w : w; if (g.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; } if (cur) lines.push(cur); return lines; }

function statusBar(g, w, dark = false, time = '7:58') {
  g.fillStyle = dark ? '#fff' : '#15112a'; g.font = `600 20px ${FUI}`; g.textAlign = 'left'; g.textBaseline = 'middle';
  g.fillText(time, 34, 30); g.textAlign = 'right'; g.fillText('▮▮▮  ▭', w - 30, 30);
}

const AV = ['#ff7aa2', '#ffb347', '#7ad3ff', '#9d7bff', '#6ee7b7', '#ff6b6b', '#ffd36b', '#c084fc'];
function avatar(g, x, y, r, i, letter) { g.fillStyle = AV[i % AV.length]; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = `800 ${r}px ${FUI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(letter, x, y + 1); }

// messages: [{at, from, text, me, react, photo, typing}]
function chat(g, t, w, h, o, T) {
  g.fillStyle = '#f3f0fb'; g.fillRect(0, 0, w, h);
  // header
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, 150); g.fillStyle = 'rgba(0,0,0,0.08)'; g.fillRect(0, 150, w, 2);
  statusBar(g, w);
  g.fillStyle = '#1b1530'; g.font = `400 34px ${FUI}`; g.textAlign = 'left'; g.fillText('‹', 20, 100);
  g.fillStyle = '#1d2a6b'; g.beginPath(); g.arc(88, 100, 30, 0, 7); g.fill(); g.fillStyle = '#f2c14e'; g.font = `800 28px serif`; g.textAlign = 'center'; g.fillText('G', 88, 102);
  g.textAlign = 'left'; g.fillStyle = '#15112a'; g.font = `800 26px ${FUI}`; g.fillText(o.group || 'Goldcrest Elite', 132, 88);
  g.fillStyle = '#7a7290'; g.font = `400 19px ${FUI}`; g.fillText(o.members || '41 members', 132, 118);
  // messages
  const msgs = (o.messages || []).map(m => ({ ...m, at: T(m.at ?? 0) }));
  const shown = msgs.filter(m => t >= m.at);
  const pad = 22, maxW = w * 0.68; let y = 180; const layout = [];
  g.font = `400 23px ${FUI}`;
  for (const m of shown) {
    if (m.system) { layout.push({ m, y, h: 44 }); y += 54; continue; }
    const lines = m.photo ? [] : wrapText(g, m.text, maxW - 36); const bh = m.photo ? 250 : lines.length * 31 + 26; const nameH = (!m.me && m.from) ? 24 : 0;
    layout.push({ m, y, h: bh + nameH, lines, nameH }); y += bh + nameH + (m.react ? 30 : 0) + 14;
  }
  const bottom = h - 100; const scroll = Math.max(0, y - bottom);
  g.save(); g.beginPath(); g.rect(0, 152, w, h - 252); g.clip(); g.translate(0, -scroll);
  for (const L of layout) {
    const m = L.m; const k = E.back(clamp((t - m.at) / 0.25));
    if (m.system) { g.fillStyle = '#8b84a3'; g.font = `600 18px ${FUI}`; g.textAlign = 'center'; g.globalAlpha = clamp((t - m.at) / 0.2); g.fillText(m.text, w / 2, L.y + 22); g.globalAlpha = 1; continue; }
    g.font = `400 23px ${FUI}`;
    const bw = m.photo ? 260 : Math.min(maxW, Math.max(...L.lines.map(l => g.measureText(l).width)) + 36);
    const bx = m.me ? w - pad - bw : pad + 52; const by = L.y + L.nameH;
    g.save(); g.translate(m.me ? bx + bw : bx, by); g.scale(k, k); g.translate(-(m.me ? bx + bw : bx), -by);
    if (!m.me && m.from) { g.fillStyle = AV[(m.av ?? m.from.length) % AV.length]; g.font = `600 17px ${FUI}`; g.textAlign = 'left'; g.fillText(m.from, bx + 6, L.y + 12); avatar(g, pad + 22, by + L.h - L.nameH - 22, 20, m.av ?? m.from.length, m.from[0]); }
    if (m.photo) { g.fillStyle = '#fff'; rr(g, bx, by, bw, 250, 20); g.fill(); g.save(); rr(g, bx + 6, by + 6, bw - 12, 238, 16); g.clip(); PHONE_SCREENS.busPhoto(g, 0, 0, 0, { x: bx + 6, y: by + 6, w: bw - 12, h: 238 }); g.restore(); }
    else {
      const gr = g.createLinearGradient(bx, by, bx, by + L.h); if (m.me) { gr.addColorStop(0, '#7b5cff'); gr.addColorStop(1, '#5b3df5'); } else { gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#ffffff'); }
      g.fillStyle = gr; rr(g, bx, by, bw, L.h - L.nameH, 22); g.fill();
      if (!m.me) { g.strokeStyle = 'rgba(0,0,0,0.06)'; g.lineWidth = 2; g.stroke(); }
      g.fillStyle = m.me ? '#fff' : '#1b1530'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.font = `400 23px ${FUI}`;
      L.lines.forEach((l, i) => g.fillText(l, bx + 18, by + 28 + i * 31));
    }
    if (m.react) { const rt = m.reactAt !== undefined ? T(m.reactAt) : m.at + 0.4; if (t >= rt) { const n = typeof m.react === 'object' ? Math.round(m.react.from + (m.react.to - m.react.from) * E.out(clamp((t - rt) / (m.react.dur || 1.2)))) : null; const label = typeof m.react === 'object' ? `${m.react.e} ${n}` : m.react; g.font = `600 19px ${FUI}`; const rw = g.measureText(label).width + 22; const rx = m.me ? bx + bw - rw - 10 : bx + 14; const ry = by + L.h - L.nameH - 6; g.fillStyle = '#fff'; rr(g, rx, ry, rw, 32, 16); g.fill(); g.strokeStyle = 'rgba(0,0,0,0.1)'; g.stroke(); g.fillStyle = '#1b1530'; g.textAlign = 'left'; g.fillText(label, rx + 11, ry + 17); } }
    g.restore();
  }
  g.restore();
  // typing indicator / input
  g.fillStyle = '#ffffff'; g.fillRect(0, h - 100, w, 100); g.fillStyle = 'rgba(0,0,0,0.07)'; g.fillRect(0, h - 100, w, 2);
  g.fillStyle = '#f0edf8'; rr(g, 20, h - 82, w - 110, 56, 28); g.fill();
  const draft = o.draft ? (() => { const d = o.draft; const t0 = T(d.at), t1 = T(d.end ?? d.at); if (t < t0) return ''; const n = Math.floor(clamp((t - t0) / Math.max(0.3, (t1 - t0))) * d.text.length); return d.text.slice(0, n); })() : '';
  g.fillStyle = draft ? '#1b1530' : '#a39dba'; g.font = `400 23px ${FUI}`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(draft || 'Message', 42, h - 53);
  if (draft && Math.floor(t * 2) % 2 === 0) { const tw = g.measureText(draft).width; g.fillStyle = '#5b3df5'; g.fillRect(44 + tw, h - 68, 2, 30); }
  g.fillStyle = '#5b3df5'; g.beginPath(); g.arc(w - 50, h - 54, 26, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = `800 24px ${FUI}`; g.textAlign = 'center'; g.fillText('↑', w - 50, h - 52);
  if (o.typing && t >= T(o.typing[0]) && t <= T(o.typing[1])) { g.fillStyle = '#fff'; rr(g, 74, h - 160, 90, 46, 23); g.fill(); for (let i = 0; i < 3; i++) { g.fillStyle = `rgba(90,80,120,${0.4 + 0.6 * Math.max(0, Math.sin(t * 8 - i))})`; g.beginPath(); g.arc(98 + i * 21, h - 137, 7, 0, 7); g.fill(); } }
  if (o.badge) { const n = o.badge(t); if (n > 0) { g.fillStyle = '#ff3b5c'; rr(g, w - 120, 60, 96, 40, 20); g.fill(); g.fillStyle = '#fff'; g.font = `800 22px ${FUI}`; g.textAlign = 'center'; g.fillText(n > 99 ? `${n}` : `${n}`, w - 72, 81); } }
}

function bank(g, t, w, h, o) {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#16a085'); gr.addColorStop(1, '#0e6b5a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  statusBar(g, w, true, '6:02');
  g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = `600 24px ${FUI}`; g.fillText('My Checking', w / 2, 120);
  g.font = `400 20px ${FUI}`; g.globalAlpha = 0.8; g.fillText('Available balance', w / 2, 250); g.globalAlpha = 1;
  const v = 47 * E.out(clamp(t / 1.0));
  g.font = `800 92px ${FUI}`; g.fillText('$' + v.toFixed(2), w / 2, 330);
  g.fillStyle = 'rgba(255,255,255,0.14)'; rr(g, 30, 420, w - 60, 420, 24); g.fill();
  const rows = [['Car wash payout', '+$60.00'], ['Bus pass', '-$11.00'], ['Snacks', '-$2.00']];
  rows.forEach(([a, b], i) => { g.fillStyle = '#fff'; g.font = `600 22px ${FUI}`; g.textAlign = 'left'; g.fillText(a, 60, 480 + i * 90); g.textAlign = 'right'; g.fillText(b, w - 60, 480 + i * 90); g.fillStyle = 'rgba(255,255,255,0.2)'; g.fillRect(60, 515 + i * 90, w - 120, 2); });
}

function trip(g, t, w, h, o, T) {
  const gr = g.createLinearGradient(0, 0, 0, 420); gr.addColorStop(0, '#9fd8ff'); gr.addColorStop(1, '#e8f6ff'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  // mountains
  g.fillStyle = '#7a8cc9'; g.beginPath(); g.moveTo(0, 400); g.lineTo(120, 200); g.lineTo(220, 330); g.lineTo(330, 160); g.lineTo(w, 380); g.lineTo(w, 420); g.lineTo(0, 420); g.fill();
  g.fillStyle = '#fff'; g.beginPath(); g.moveTo(120, 200); g.lineTo(150, 245); g.lineTo(95, 240); g.fill(); g.beginPath(); g.moveTo(330, 160); g.lineTo(370, 215); g.lineTo(290, 220); g.fill();
  statusBar(g, w);
  g.fillStyle = '#ffffff'; g.fillRect(0, 420, w, h - 420);
  g.fillStyle = '#15112a'; g.textAlign = 'left'; g.font = `800 34px ${FUI}`; g.fillText('Swiss Alps Ski Week', 32, 480);
  g.font = `400 21px ${FUI}`; g.fillStyle = '#6b6385'; g.fillText('Private jet • 5-star chalet • Personal ski coach', 32, 520);
  g.fillStyle = '#f2effa'; rr(g, 28, 560, w - 56, 150, 20); g.fill();
  g.fillStyle = '#6b6385'; g.font = `600 20px ${FUI}`; g.fillText('Price per student', 52, 600);
  const k = clamp((t - (o.priceAt !== undefined ? T(o.priceAt) : 0.6)) / 1.6);
  const v = Math.round(40000 * E.out(k) / 10) * 10;
  g.fillStyle = '#15112a'; g.font = `800 66px ${FUI}`; g.fillText('$' + v.toLocaleString('en-US'), 52, 670);
  g.fillStyle = '#5b3df5'; rr(g, 28, 760, w - 56, 80, 40); g.fill(); g.fillStyle = '#fff'; g.font = `800 26px ${FUI}`; g.textAlign = 'center'; g.fillText('Book now', w / 2, 802);
  g.fillStyle = '#8b84a3'; g.font = `400 18px ${FUI}`; g.fillText('39 classmates already going \u{1F3BF}', w / 2, 880);
}

function lock(g, t, w, h, o, T) {
  const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#3b1fb0'); gr.addColorStop(1, '#ff7aa2'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  statusBar(g, w, true, '');
  g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = `400 26px ${FUI}`; g.fillText(o.date || 'Friday, June 12', w / 2, 130);
  g.font = `300 120px ${FUI}`; g.fillText(o.time || '4:47', w / 2, 240);
  (o.notifs || []).forEach((n, i) => {
    const at = T(n.at ?? 0); if (t < at) return; const k = E.back(clamp((t - at) / 0.3));
    const y = 330 + i * 140; g.save(); g.translate(w / 2, y + 60); g.scale(k, k); g.translate(-w / 2, -(y + 60));
    g.fillStyle = 'rgba(255,255,255,0.88)'; rr(g, 20, y, w - 40, 120, 26); g.fill();
    g.fillStyle = n.color || '#2ecc71'; rr(g, 38, y + 22, 54, 54, 14); g.fill(); g.font = `30px ${EMO}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(n.icon || '\u{1F4AC}', 65, y + 50);
    g.textAlign = 'left'; g.fillStyle = '#15112a'; g.font = `800 21px ${FUI}`; g.fillText(n.title, 108, y + 36); g.font = `400 19px ${FUI}`; g.fillStyle = '#3b3550';
    const lines = wrapText(g, n.text, w - 160); lines.slice(0, 2).forEach((l, j) => g.fillText(l, 108, y + 66 + j * 25));
    g.restore();
  });
}

function videocall(g, t, w, h, o) {
  // pre-recorded video message from Theo's parents
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1e2d5a'); gr.addColorStop(1, '#0b1230'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  // window + skyline (Tokyo-ish at night)
  g.fillStyle = '#25386e'; for (let i = 0; i < 10; i++) { const bx = i * 50 - 10, bh = 120 + ((i * 53) % 140); g.fillRect(bx, 470 - bh, 44, bh); g.fillStyle = 'rgba(255,220,120,0.7)'; for (let y = 470 - bh + 12; y < 460; y += 22) for (let x = bx + 6; x < bx + 40; x += 12) if ((x * y) % 7 < 3) g.fillRect(x, y, 5, 8); g.fillStyle = '#25386e'; }
  g.fillStyle = '#d9c7a8'; g.fillRect(0, 470, w, h - 470);
  // two parent heads
  const head = (x, y, r, hair, smile) => { g.fillStyle = '#f8f2ff'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.fillStyle = hair; g.beginPath(); g.arc(x, y - r * 0.15, r * 1.03, Math.PI * 1.05, Math.PI * 1.95); g.fill(); g.fillStyle = '#1c1233'; g.beginPath(); g.ellipse(x - r * 0.28, y + r * 0.02, r * 0.07, r * 0.1, 0, 0, 7); g.ellipse(x + r * 0.28, y + r * 0.02, r * 0.07, r * 0.1, 0, 0, 7); g.fill(); g.strokeStyle = '#1c1233'; g.lineWidth = 4; g.beginPath(); g.arc(x, y + r * 0.2, r * 0.25, 0.2 * Math.PI, 0.8 * Math.PI); g.stroke(); };
  g.fillStyle = '#2b2b45'; rr(g, 70, 560, 150, 300, 60); g.fill(); g.fillStyle = '#7a1f3d'; rr(g, 250, 560, 150, 300, 60); g.fill();
  head(145, 470, 95, '#2a1a12'); head(325, 480, 90, '#c9a15a');
  g.fillStyle = 'rgba(0,0,0,0.45)'; rr(g, 20, 60, 220, 46, 23); g.fill(); g.fillStyle = '#fff'; g.font = `600 20px ${FUI}`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('\u{1F4CD} Tokyo, Japan', 36, 84);
  // progress bar 30s
  const p = clamp(t / (o.len || 4)); g.fillStyle = 'rgba(255,255,255,0.3)'; rr(g, 30, h - 60, w - 60, 8, 4); g.fill(); g.fillStyle = '#fff'; rr(g, 30, h - 60, (w - 60) * p, 8, 4); g.fill();
  g.font = `600 18px ${FUI}`; g.fillText('0:' + String(Math.floor(p * 30)).padStart(2, '0') + ' / 0:30', 30, h - 90);
  if (o.caption) { g.fillStyle = 'rgba(0,0,0,0.55)'; rr(g, 40, h - 200, w - 80, 70, 18); g.fill(); g.fillStyle = '#fff'; g.font = `800 28px ${FUI}`; g.textAlign = 'center'; g.fillText(o.caption, w / 2, h - 164); }
}

function camera(g, t, w, h, o) {
  // Preston's camera app (portrait) showing a still of the bus stop
  busPhoto(g, 0, 0, 0, { x: 0, y: 0, w, h });
  g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 2; for (const f of [1 / 3, 2 / 3]) { g.beginPath(); g.moveTo(w * f, 0); g.lineTo(w * f, h); g.moveTo(0, h * f); g.lineTo(w, h * f); g.stroke(); }
  g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(0, h - 170, w, 170); g.fillStyle = '#fff'; g.beginPath(); g.arc(w / 2, h - 85, 46, 0, 7); g.fill(); g.strokeStyle = '#000'; g.lineWidth = 4; g.beginPath(); g.arc(w / 2, h - 85, 38, 0, 7); g.stroke();
  if (o.flashAt !== undefined && t > o.flashAt && t < o.flashAt + 0.2) { g.fillStyle = 'rgba(255,255,255,0.9)'; g.fillRect(0, 0, w, h); }
}

function busPhoto(g, t, w, h, o) {
  const { x, y } = o, W = o.w, H = o.h;
  g.save(); g.translate(x, y);
  const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#b9a7ff'); sky.addColorStop(1, '#ffd1e8'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
  g.fillStyle = '#9a96b8'; g.fillRect(0, H * 0.78, W, H * 0.22);
  // bus
  g.fillStyle = '#ffb627'; rr(g, -W * 0.1, H * 0.25, W * 0.85, H * 0.5, 18); g.fill(); g.fillStyle = '#4b6cb7'; for (let i = 0; i < 4; i++) { rr(g, W * 0.0 + i * W * 0.17, H * 0.32, W * 0.13, H * 0.16, 6); g.fill(); }
  g.fillStyle = '#2b2b45'; g.beginPath(); g.arc(W * 0.1, H * 0.76, H * 0.07, 0, 7); g.arc(W * 0.55, H * 0.76, H * 0.07, 0, 7); g.fill();
  // kid stepping off
  const kx = W * 0.78, ky = H * 0.5; g.fillStyle = '#3b4a8a'; rr(g, kx - W * 0.06, ky, W * 0.12, H * 0.2, 12); g.fill();
  g.fillStyle = '#f8f2ff'; g.beginPath(); g.arc(kx, ky - H * 0.08, H * 0.1, 0, 7); g.fill(); g.fillStyle = '#4a2a1a'; g.beginPath(); g.arc(kx, ky - H * 0.1, H * 0.1, Math.PI, 2 * Math.PI); g.fill();
  g.fillStyle = '#1c1233'; g.beginPath(); g.arc(kx - H * 0.03, ky - H * 0.07, H * 0.012, 0, 7); g.arc(kx + H * 0.03, ky - H * 0.07, H * 0.012, 0, 7); g.fill();
  g.strokeStyle = '#e8e2f0'; g.lineWidth = Math.max(2, W * 0.012); g.beginPath(); g.moveTo(kx - W * 0.025, ky + H * 0.2); g.lineTo(kx - W * 0.035, ky + H * 0.3); g.moveTo(kx + W * 0.025, ky + H * 0.2); g.lineTo(kx + W * 0.045, ky + H * 0.28); g.stroke();
  // circled safety pin
  g.strokeStyle = '#ff3b5c'; g.lineWidth = Math.max(3, W * 0.012); g.beginPath(); g.ellipse(kx + W * 0.08, ky + H * 0.08, W * 0.07, H * 0.07, 0, 0, 7); g.stroke();
  g.restore();
}

function homeScreen(g, t, w, h, o) {
  const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#6a4cff'); gr.addColorStop(1, '#ff8fb3'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  statusBar(g, w, true, '7:12');
  const icons = ['\u{1F4AC}', '\u{1F4F7}', '\u{1F3B5}', '\u{1F5FA}️', '☀️', '\u{1F4E7}', '\u{1F3AE}', '\u{1F4D6}', '\u{1F6D2}', '⏰', '\u{1F4B3}', '⚙️'];
  icons.forEach((ic, i) => { const x = 70 + (i % 4) * 110, y = 140 + Math.floor(i / 4) * 130; g.fillStyle = 'rgba(255,255,255,0.25)'; rr(g, x - 40, y - 40, 80, 80, 20); g.fill(); g.font = `46px ${EMO}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ic, x, y); });
  if (o.battery) { g.fillStyle = 'rgba(0,0,0,0.55)'; rr(g, 60, h / 2 + 40, w - 120, 160, 30); g.fill(); g.fillStyle = '#fff'; g.font = `800 30px ${FUI}`; g.fillText(o.battery(t), w / 2, h / 2 + 120); }
}

export const PHONE_SCREENS = { chat, bank, trip, lock, videocall, camera, busPhoto, homeScreen };

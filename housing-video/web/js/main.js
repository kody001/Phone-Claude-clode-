'use strict';
// Boot: load fonts, mascot, word timings; build the timeline; expose renderFrame/snapshot.
let SHOTS = [], WORDS = [], CAPS = [], SHOW_CAPS = true;
const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
const qs = new URLSearchParams(location.search);
if (qs.get('render')) document.body.classList.add('render');
if (qs.get('nocaps')) SHOW_CAPS = false;

async function boot() {
  const fams = ['Patrick Hand', 'Permanent Marker', 'Caveat Brush', 'Gochi Hand', 'Architects Daughter', 'Kalam'];
  await Promise.all(fams.map(f => document.fonts.load(`48px "${f}"`)));
  await document.fonts.load('700 48px "Kalam"');
  await loadMascot('../assets/mascot/');
  WORDS = await (await fetch('../build/words.json')).json();
  if (qs.get('test')) { SHOTS = TESTS[qs.get('test')](); SHOW_CAPS = false; }
  else { SHOTS = buildStory(WORDS); CAPS = buildCaptions(WORDS); }
  window.READY = true;
  renderFrame(Number(qs.get('t') || 0));
}

function shotAt(t) {
  let lo = 0, hi = SHOTS.length - 1, ans = 0;
  while (lo <= hi) { const m = (lo + hi) >> 1; if (SHOTS[m].start <= t) { ans = m; lo = m + 1; } else hi = m - 1; }
  return SHOTS[ans];
}

function renderFrame(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
  const sh = shotAt(t);
  if (sh) {
    const lt = t - sh.start;
    ctx.save();
    const cam = sh.cam || {};
    const dur = Math.max(0.5, sh.end - sh.start);
    const z0 = cam.z0 != null ? cam.z0 : 1, z1 = cam.z1 != null ? cam.z1 : 1.035;
    const k = E.io(clamp(lt / dur));
    const z = lerp(z0, z1, k);
    const cx = cam.cx != null ? cam.cx : W / 2, cy = cam.cy != null ? cam.cy : H / 2;
    const px = cam.px ? lerp(0, cam.px, k) : 0, py = cam.py ? lerp(0, cam.py, k) : 0;
    ctx.translate(cx + px, cy + py); ctx.scale(z, z); ctx.translate(-cx, -cy);
    if (sh.bg) { ctx.fillStyle = sh.bg; ctx.fillRect(-200, -200, W + 400, H + 400); }
    for (const e of sh.els) { try { e(ctx, lt, sh); } catch (err) { console.error('el error', sh.id, err && err.stack); } }
    ctx.restore();
  }
  if (SHOW_CAPS && CAPS.length) drawCaptions(ctx, t);
}

window.renderFrame = renderFrame;
window.snapshot = (t, scale = 1) => {
  renderFrame(t);
  let c = cv;
  if (scale !== 1) {
    c = document.createElement('canvas'); c.width = Math.round(W * scale); c.height = Math.round(H * scale);
    const g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(cv, 0, 0, c.width, c.height);
  }
  return c.toDataURL('image/jpeg', 0.9).split(',')[1];
};
window.frameJPEG = (t, q) => { renderFrame(t); return cv.toDataURL('image/jpeg', q || 0.94).split(',')[1]; };

// ---- preview player ----
const au = document.getElementById('au'), scrub = document.getElementById('scrub'), tc = document.getElementById('tc');
document.getElementById('play').onclick = () => { if (au.paused) au.play(); else au.pause(); };
scrub.oninput = () => { au.currentTime = Number(scrub.value); renderFrame(au.currentTime); };
function loop() {
  if (!au.paused && window.READY) { renderFrame(au.currentTime); scrub.value = au.currentTime; tc.textContent = au.currentTime.toFixed(2); }
  requestAnimationFrame(loop);
}
if (!qs.get('render')) requestAnimationFrame(loop);
boot();

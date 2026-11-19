// Boot: load fonts, resolve the shot list, expose render hooks for the headless renderer,
// and drive the in-page preview player.
'use strict';
const ENV = Uint8Array.from(atob(ENV_B64), c => c.charCodeAt(0));
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const params = new URLSearchParams(location.search);
if (params.has('render')) document.body.classList.add('render');

window.READY = (async () => {
  const fonts = ['700 40px Kalam', '400 40px Kalam', '400 20px Inter', '600 20px Inter', '700 20px Inter', '800 20px Inter', '900 20px Inter', '700 20px Merriweather', '400 20px Merriweather'];
  await Promise.all(fonts.map(f => document.fonts.load(f)));
  await MP.ready;
  RESOLVED = resolveAll();
  return { duration: WORDS.duration, shots: RESOLVED.length, errors: ERRORS.slice() };
})();

window.drawAt = t => renderFrame(ctx, t);
window.grab = (t, q = 0.94) => { renderFrame(ctx, t); return canvas.toDataURL('image/jpeg', q); };
window.shotList = () => RESOLVED.map(s => ({ anchor: s.anchor, t0: +s.t0.toFixed(2), t1: +s.t1.toFixed(2) }));

if (!params.has('render')) {
  const vo = document.getElementById('vo'), seek = document.getElementById('seek'), play = document.getElementById('play'), time = document.getElementById('time');
  seek.max = WORDS.duration;
  const fmt = s => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, '0')}`;
  let scrubT = parseFloat(params.get('t') || '0');
  const tick = () => {
    const t = vo.paused ? scrubT : vo.currentTime;
    renderFrame(ctx, t);
    if (!vo.paused) seek.value = t;
    time.textContent = fmt(t);
    requestAnimationFrame(tick);
  };
  window.READY.then(r => { if (r.errors.length) console.warn(r.errors.join('\n')); vo.currentTime = scrubT; seek.value = scrubT; requestAnimationFrame(tick); });
  seek.addEventListener('input', () => { scrubT = parseFloat(seek.value); vo.currentTime = scrubT; });
  play.addEventListener('click', () => { if (vo.paused) { vo.currentTime = scrubT; vo.play(); play.textContent = 'Pause'; } else { vo.pause(); scrubT = vo.currentTime; play.textContent = 'Play'; } });
}

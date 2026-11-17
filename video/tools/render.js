// Parallel chunked renderer: W browser workers pull frame ranges from a queue, pipe JPEG frames to ffmpeg/x264.
// usage: node tools/render.js [--workers 3] [--chunk 1800] [--from 0] [--to N] [--out out/chunks]
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path'); const { spawn } = require('child_process'); const serve = require('./serve');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const W = +arg('workers', 3), CH = +arg('chunk', 1800), OUT = path.resolve(arg('out', path.join(__dirname, '..', 'out', 'chunks')));
fs.mkdirSync(OUT, { recursive: true });
function encoder(file) {
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '60', '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-tune', 'animation',
    '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-g', '120', '-keyint_min', '60', '-r', '60', '-threads', '2', '-movflags', '+faststart', file], { stdio: ['pipe', 'inherit', 'inherit'] });
  return ff;
}
(async () => {
  const srv = await serve(0); const port = srv.address().port;
  // total frames
  const probe = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }); const pp = await probe.newPage();
  await pp.goto(`http://127.0.0.1:${port}/scenes/index.html`); await pp.waitForFunction(() => window.APP && window.APP.init, null, { timeout: 60000 });
  const info = await pp.evaluate(async () => { await window.FONTS_LOADED; return await APP.init(); }); await probe.close();
  const F0 = +arg('from', 0), F1 = +arg('to', info.frames);
  const queue = []; for (let s = F0; s < F1; s += CH) queue.push([s, Math.min(F1, s + CH)]);
  console.log(`frames ${F0}-${F1} (${F1 - F0}), ${queue.length} chunks, ${W} workers`);
  const t0 = Date.now(); let done = 0;
  async function worker(id) {
    const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-accelerated-2d-canvas', '--disable-gpu-vsync'] });
    const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
    p.on('pageerror', e => console.log(`[w${id}] PAGEERR`, e.message));
    await p.goto(`http://127.0.0.1:${port}/scenes/index.html`); await p.waitForFunction(() => window.APP && window.APP.init, null, { timeout: 60000 });
    await p.evaluate(async () => { await window.FONTS_LOADED; return await APP.init(); });
    while (queue.length) {
      const [a, z] = queue.shift(); const name = `c_${String(a).padStart(6, '0')}.mp4`; const fin = path.join(OUT, name);
      if (fs.existsSync(fin)) { done += z - a; continue; }
      const part = fin + '.part.mp4'; const ff = encoder(part); const closed = new Promise(r => ff.on('close', r));
      for (let f = a; f < z; f++) {
        const d = await p.evaluate((f) => APP.frame(f, 0.93), f);
        const buf = Buffer.from(d.slice(d.indexOf(',') + 1), 'base64');
        if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
        done++;
        if (done % 300 === 0) { const el = (Date.now() - t0) / 1000; const fps = done / el; console.log(`[${new Date().toISOString().slice(11, 19)}] ${done}/${F1 - F0} frames  ${fps.toFixed(2)} fps  eta ${((F1 - F0 - done) / fps / 60).toFixed(1)} min`); }
      }
      ff.stdin.end(); await closed; fs.renameSync(part, fin); console.log(`[w${id}] chunk ${name} done`);
    }
    await b.close();
  }
  await Promise.all(Array.from({ length: W }, (_, i) => worker(i)));
  srv.close(); console.log('ALL DONE', ((Date.now() - t0) / 60000).toFixed(1), 'min');
})();

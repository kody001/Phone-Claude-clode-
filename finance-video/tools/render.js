// Headless render: N Chromium pages render frames in parallel, each chunk is piped as JPEG
// frames into its own ffmpeg (x264) process. Chunks are resumable; assemble.sh joins them.
// usage: node tools/render.js [--workers 3] [--chunk 20] [--from 0] [--to END] [--out out/chunks] [--quality 0.94]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const { start } = require('./serve');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const FPS = 60;
const WORKERS = +arg('workers', 3), CHUNK = +arg('chunk', 20), Q = +arg('quality', 0.94);
const OUT = path.resolve(arg('out', path.join(__dirname, '..', 'out', 'chunks')));

function encoder(file) {
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'faster', '-crf', '17', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level', '4.2',
    '-g', '120', '-threads', '2', '-r', String(FPS), file], { stdio: ['pipe', 'inherit', 'inherit'] });
  return ff;
}
const write = (s, buf) => new Promise(res => (s.write(buf) ? res() : s.once('drain', res)));

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const { srv, port } = await start();
  const browser = await chromium.launch({ args: ['--disable-gpu-vsync', '--disable-frame-rate-limit'] });
  const first = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await first.goto(`http://127.0.0.1:${port}/scenes/index.html?render=1`);
  const info = await first.evaluate(() => window.READY);
  if (info.errors.length) { console.log('ANCHOR WARNINGS:\n' + info.errors.join('\n')); }
  const total = Math.round(info.duration * FPS);
  const f0 = Math.round(+arg('from', 0) * FPS), f1 = Math.min(total, Math.round(+arg('to', info.duration) * FPS));
  const chunks = [];
  for (let c = Math.floor(f0 / (CHUNK * FPS)); c * CHUNK * FPS < f1; c++) chunks.push(c);
  const todo = chunks.filter(c => !fs.existsSync(path.join(OUT, `c_${String(c).padStart(4, '0')}.mp4`)));
  console.log(`${total} frames total; chunks ${chunks.length}, to render ${todo.length}, workers ${WORKERS}`);
  const pages = [first];
  for (let i = 1; i < WORKERS; i++) {
    const p = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    await p.goto(`http://127.0.0.1:${port}/scenes/index.html?render=1`);
    await p.evaluate(() => window.READY);
    pages.push(p);
  }
  for (const p of pages) p.on('pageerror', e => console.log('[pageerror]', e.message));
  const t0 = Date.now(); let done = 0;
  const queue = todo.slice();
  await Promise.all(pages.map(async page => {
    while (queue.length) {
      const c = queue.shift();
      const a = c * CHUNK * FPS, b = Math.min(total, (c + 1) * CHUNK * FPS);
      const final = path.join(OUT, `c_${String(c).padStart(4, '0')}.mp4`), tmp = final.replace('.mp4', '.part.mp4');
      const ff = encoder(tmp);
      const closed = new Promise(res => ff.on('close', res));
      for (let f = a; f < b; f++) {
        const b64 = await page.evaluate(([t, q]) => window.grab(t, q).slice(23), [f / FPS, Q]);
        await write(ff.stdin, Buffer.from(b64, 'base64'));
        done++;
      }
      ff.stdin.end();
      const code = await closed;
      if (code !== 0) { console.log('ffmpeg failed on chunk', c); continue; }
      fs.renameSync(tmp, final);
      const el = (Date.now() - t0) / 1000;
      console.log(`chunk ${c} done  (${done} frames, ${(done / el).toFixed(1)} fps, elapsed ${(el / 60).toFixed(1)} min)`);
    }
  }));
  await browser.close(); srv.close();
  console.log('all chunks done');
})();

// Parallel frame renderer: headless Chrome draws each frame, ffmpeg encodes chunks, then concat.
// node render/render.js [--workers=3] [--from=0] [--to=TOTAL] [--fps=60] [--scale=1] [--crf=18] [--preset=medium] [--out=build/video_noaudio.mp4]
const puppeteer = require('puppeteer-core');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { serve, ROOT } = require('./serve');

const opts = Object.fromEntries(process.argv.slice(2).filter(a => a.startsWith('--')).map(a => a.slice(2).split('=')));
const FPS = +(opts.fps || 60);
const WORKERS = +(opts.workers || 3);
const SCALE = +(opts.scale || 1);
const OUT = path.resolve(ROOT, opts.out || 'build/video_noaudio.mp4');
const TMP = path.resolve(ROOT, 'build/chunks');
fs.mkdirSync(TMP, { recursive: true });

async function renderChunk(port, idx, f0, f1, total) {
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', args: ['--headless=new', '--no-sandbox', '--hide-scrollbars', '--disable-gpu-vsync', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
  const page = await browser.newPage();
  page.on('pageerror', e => console.log(`[w${idx}] pageerror`, e.message));
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto(`http://127.0.0.1:${port}/index.html?render=1${opts.res ? '&res=' + opts.res : ''}`);
  await page.waitForFunction('window.READY || window.BOOT_ERROR', { timeout: 120000 });
  const err = await page.evaluate('window.BOOT_ERROR');
  if (err) throw new Error(err);
  const W = Math.round(1920 * SCALE / 2) * 2, H = Math.round(1080 * SCALE / 2) * 2;
  if (SCALE !== 1) await page.evaluate((w, h) => { window._o = document.createElement('canvas'); window._o.width = w; window._o.height = h; }, W, H);
  const file = path.join(TMP, `chunk_${String(idx).padStart(3, '0')}.mp4`);
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', opts.preset || 'medium', '-crf', String(opts.crf || 18), ...(opts.maxrate ? ['-maxrate', opts.maxrate, '-bufsize', opts.bufsize || opts.maxrate] : []), ...(opts.tune ? ['-tune', opts.tune] : []), '-pix_fmt', 'yuv420p', '-r', String(FPS),
    '-g', String(FPS * 2), '-bf', '2', '-movflags', '+faststart', file], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', c => (c === 0 ? res() : rej(new Error('ffmpeg exit ' + c)))));
  const t0 = Date.now();
  for (let f = f0; f < f1; f++) {
    const b64 = await page.evaluate((t, scaled) => {
      renderAt(t);
      const c = document.getElementById('c');
      if (scaled) { window._o.getContext('2d').drawImage(c, 0, 0, window._o.width, window._o.height); return window._o.toDataURL('image/jpeg', 0.94).slice(23); }
      return c.toDataURL('image/jpeg', 0.94).slice(23);
    }, f / FPS, SCALE !== 1);
    const buf = Buffer.from(b64, 'base64');
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if ((f - f0) % 600 === 0 && f > f0) {
      const el = (Date.now() - t0) / 1000, rate = (f - f0) / el;
      console.log(`[w${idx}] ${f - f0}/${f1 - f0} frames  ${rate.toFixed(1)} fps  eta ${((f1 - f) / rate / 60).toFixed(1)} min`);
    }
  }
  ff.stdin.end();
  await done;
  await browser.close();
  return file;
}

(async () => {
  const { srv, port } = await serve();
  const total = +(JSON.parse(fs.readFileSync(path.join(ROOT, 'data/timeline.json'))).total);
  const from = Math.round((+(opts.from || 0)) * FPS);
  const to = Math.round((+(opts.to || total)) * FPS);
  const n = to - from;
  console.log(`rendering ${n} frames (${(n / FPS).toFixed(1)}s) at ${FPS} fps with ${WORKERS} workers, scale ${SCALE}`);
  const per = Math.ceil(n / WORKERS);
  const t0 = Date.now();
  const jobs = [];
  for (let i = 0; i < WORKERS; i++) {
    const a = from + i * per, b = Math.min(to, a + per);
    if (a < b) jobs.push(renderChunk(port, i, a, b, total));
  }
  const files = await Promise.all(jobs);
  const list = path.join(TMP, 'list.txt');
  fs.writeFileSync(list, files.map(f => `file '${f}'`).join('\n'));
  await new Promise((res, rej) => spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', OUT], { stdio: 'inherit' }).on('close', c => (c === 0 ? res() : rej(new Error('concat failed')))));
  console.log(`done: ${OUT} in ${((Date.now() - t0) / 60000).toFixed(1)} min`);
  srv.close();
})().catch(e => { console.error(e); process.exit(1); });

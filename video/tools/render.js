// Render the HTML/JS scenes to MP4 at 1920x1080, 60 fps.
// usage: node render.js --workers 3 [--from 0 --to N] --out ../out
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const start = require('./server');

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => { if (v.startsWith('--')) a.push([v.slice(2), arr[i + 1]]); return a; }, []));
const WORKERS = parseInt(args.workers || '3');
const OUT = path.resolve(args.out || path.join(__dirname, '..', 'out'));
const BATCH = 6;
fs.mkdirSync(OUT, { recursive: true });

async function worker(k, port, f0, f1) {
  const segPath = path.join(OUT, `seg_${String(k).padStart(2, '0')}.mp4`);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', '60', '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', args.preset || 'medium', '-crf', args.crf || '18', '-tune', 'animation', '-pix_fmt', 'yuv420p',
    '-r', '60', '-threads', '2', segPath], { stdio: ['pipe', 'inherit', 'inherit'] });
  const b = await chromium.launch({ args: ['--disable-gpu-vsync', '--disable-frame-rate-limit'] });
  const pg = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  pg.on('pageerror', e => console.log(`[w${k}] PAGEERR`, e.message));
  await pg.goto(`http://127.0.0.1:${port}/index.html`);
  await pg.evaluate(() => window.READY);
  const t0 = Date.now();
  for (let f = f0; f < f1; f += BATCH) {
    const n = Math.min(BATCH, f1 - f);
    const datas = await pg.evaluate(({ f, n }) => {
      const out = []; const cv = document.getElementById('c');
      for (let i = 0; i < n; i++) { renderFrame(f + i); out.push(cv.toDataURL('image/jpeg', 0.93).slice(23)); }
      return out;
    }, { f, n });
    for (const d of datas) {
      const ok = ff.stdin.write(Buffer.from(d, 'base64'));
      if (!ok) await new Promise(r => ff.stdin.once('drain', r));
    }
    if (((f - f0) / BATCH) % 100 === 0) {
      const done = f + n - f0, el = (Date.now() - t0) / 1000;
      console.log(`[w${k}] ${done}/${f1 - f0} frames, ${(done / el).toFixed(1)} fps`);
    }
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await b.close();
  return segPath;
}

(async () => {
  const srv = await start(9100 + Math.floor(Math.random() * 500));
  const port = srv.address().port;
  // find frame count
  const b = await chromium.launch(); const pg = await b.newPage();
  await pg.goto(`http://127.0.0.1:${port}/index.html`); await pg.evaluate(() => window.READY);
  const NF = await pg.evaluate(() => window.NFRAMES); await b.close();
  const from = parseInt(args.from || '0'), to = Math.min(NF, parseInt(args.to || String(NF)));
  console.log('frames', from, to, 'of', NF);
  const per = Math.ceil((to - from) / WORKERS);
  const T = Date.now();
  const segs = await Promise.all([...Array(WORKERS)].map((_, k) => worker(k, port, from + k * per, Math.min(to, from + (k + 1) * per))));
  console.log('rendered in', ((Date.now() - T) / 1000).toFixed(0), 's');
  fs.writeFileSync(path.join(OUT, 'segs.txt'), segs.map(s => `file '${s}'`).join('\n'));
  srv.close();
})();

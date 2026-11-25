// Parallel deterministic renderer: chunks of the timeline -> H.264 1080p60 segments.
// Usage: node tools/render.mjs [--workers 3] [--chunk 20] [--from 0] [--to END] [--only 12,13] [--force]
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { serve } from './server.mjs';

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith('--') ? [...a, [v.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]] : a), []));
const WORKERS = +(args.workers || 3), CHUNK = +(args.chunk || 20), FPS = 60;
const OUT = path.resolve(args.out || 'render/chunks');
fs.mkdirSync(OUT, { recursive: true });

const srv = await serve(0); const port = srv.address().port;
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-background-timer-throttling'] });
const probe = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await probe.goto(`http://127.0.0.1:${port}/web/index.html`);
await probe.waitForFunction('window.ready', null, { timeout: 180000 });
const DUR = await probe.evaluate(() => window.TL_INFO.duration);
await probe.close();
const totalFrames = Math.round(DUR * FPS);
const nChunks = Math.ceil(totalFrames / (CHUNK * FPS));
let jobs = [...Array(nChunks).keys()];
if (args.only) jobs = String(args.only).split(',').map(Number);
if (args.from || args.to) { const f = +(args.from || 0), t = +(args.to || DUR); jobs = jobs.filter(k => (k + 1) * CHUNK > f && k * CHUNK < t); }
const name = k => path.join(OUT, `c${String(k).padStart(4, '0')}.mp4`);
if (!args.force) jobs = jobs.filter(k => !fs.existsSync(name(k)));
console.log(`duration ${DUR}s, ${totalFrames} frames, ${nChunks} chunks; rendering ${jobs.length} with ${WORKERS} workers`);

let done = 0; const t0 = Date.now();
async function worker(id) {
  // one browser (and so one SwiftShader GPU process) per worker so rendering spreads across cores
  const br = id === 0 ? browser : await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-background-timer-throttling'] });
  const page = await br.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('pageerror', e => console.log(`[w${id}] PAGE ERROR`, e.message));
  await page.goto(`http://127.0.0.1:${port}/web/index.html`);
  await page.waitForFunction('window.ready', null, { timeout: 180000 });
  const cdp = await page.context().newCDPSession(page);
  while (jobs.length) {
    const k = jobs.shift();
    const f0 = k * CHUNK * FPS, f1 = Math.min(totalFrames, (k + 1) * CHUNK * FPS);
    const tmp = name(k) + '.part.mp4';
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
      '-vf', 'eq=saturation=1.16:contrast=1.05', '-c:v', 'libx264', '-preset', 'slow', '-tune', 'animation', '-crf', '18', '-maxrate', '16M', '-bufsize', '32M', '-profile:v', 'high', '-level', '4.2', '-pix_fmt', 'yuv420p', '-r', String(FPS),
      '-g', '120', '-movflags', '+faststart', tmp], { stdio: ['pipe', 'inherit', 'inherit'] });
    const tc = Date.now();
    for (let f = f0; f < f1; f++) {
      await page.evaluate(t => window.renderAt(t), f / FPS);
      const { data } = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 93, optimizeForSpeed: true });
      const buf = Buffer.from(data, 'base64');
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
    fs.renameSync(tmp, name(k));
    done++;
    const el = (Date.now() - t0) / 1000;
    console.log(`[w${id}] chunk ${k} (${f1 - f0} fr) in ${((Date.now() - tc) / 1000).toFixed(0)}s · ${done} done · ${(el / 60).toFixed(1)} min elapsed · ETA ${((el / done) * jobs.length / 60).toFixed(0)} min`);
  }
  await page.close();
  if (br !== browser) await br.close();
}
await Promise.all([...Array(WORKERS).keys()].map(worker));
await browser.close(); srv.close();
console.log('all chunks done');

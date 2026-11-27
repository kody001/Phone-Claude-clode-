// Render the animation to MP4 (1920x1080, 60 fps) with the voiceover.
// node render.mjs --out=DIR [--from=sec] [--to=sec] [--workers=3] [--crf=18] [--preset=veryfast] [--nocaps]
// Each worker is its own headless Chromium rendering a contiguous frame range into an x264 segment;
// the segments are then joined losslessly and muxed with the voiceover.
import { createRequire } from 'node:module';
import { spawn, execFileSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { serve } from './server.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const opt = Object.fromEntries(process.argv.slice(2).map(a => a.replace(/^--/, '').split('=')).map(([k, v]) => [k, v ?? '1']));
const FPS = 60;
const audio = path.join(root, 'assets/voiceover.mp3');
const audioDur = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', audio]).toString().trim());
const from = Number(opt.from || 0), to = Math.min(Number(opt.to || audioDur), audioDur);
const f0 = Math.round(from * FPS), f1 = Math.ceil(to * FPS);
const workers = Number(opt.workers || 3);
const outDir = path.resolve(opt.out || path.join(root, 'out'));
fs.mkdirSync(outDir, { recursive: true });
const crf = opt.crf || '18', preset = opt.preset || 'veryfast';

const srv = await serve(root);
const url = `http://127.0.0.1:${srv.address().port}/web/index.html?render=1${opt.nocaps ? '&nocaps=1' : ''}`;
const total = f1 - f0;
const per = Math.ceil(total / workers);
let done = 0; const t0 = Date.now();
const progress = setInterval(() => {
  const el = (Date.now() - t0) / 1000, fps = done / el;
  console.log(`[progress] ${done}/${total} frames  ${fps.toFixed(1)} fps  eta ${((total - done) / Math.max(fps, 0.01) / 60).toFixed(1)} min`);
}, 30000);

async function worker(k) {
  const a = f0 + k * per, b = Math.min(f1, a + per);
  if (a >= b) return null;
  const seg = path.join(outDir, `seg_${String(k).padStart(2, '0')}.mp4`);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', preset, '-crf', crf, '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level', '4.2', '-r', String(FPS), seg], { stdio: ['pipe', 'inherit', 'inherit'] });
  const ffDone = new Promise((res, rej) => ff.on('close', c => (c === 0 ? res() : rej(new Error('ffmpeg exit ' + c)))));
  const browser = await chromium.launch({ args: ['--disable-gpu-vsync', '--disable-frame-rate-limit'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('pageerror', e => console.log(`[w${k} pageerror]`, e.message));
  await page.goto(url);
  await page.waitForFunction(() => window.READY === true, null, { timeout: 120000 });
  const BATCH = 6;
  for (let f = a; f < b; f += BATCH) {
    const n = Math.min(BATCH, b - f);
    const frames = await page.evaluate(([f, n, fps]) => { const o = []; for (let i = 0; i < n; i++) o.push(window.frameJPEG((f + i) / fps, 0.95)); return o; }, [f, n, FPS]);
    for (const b64 of frames) {
      if (!ff.stdin.write(Buffer.from(b64, 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
    }
    done += n;
  }
  ff.stdin.end();
  await browser.close();
  await ffDone;
  return seg;
}

const segs = (await Promise.all(Array.from({ length: workers }, (_, k) => worker(k)))).filter(Boolean);
clearInterval(progress);
srv.close();
console.log(`rendered ${total} frames in ${((Date.now() - t0) / 60000).toFixed(1)} min`);

const list = path.join(outDir, 'segments.txt');
fs.writeFileSync(list, segs.map(s => `file '${s}'`).join('\n'));
const name = opt.name || 'video.mp4';
const final = path.join(outDir, name);
execFileSync('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-ss', String(from), '-t', String(to - from), '-i', audio,
  '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', '-shortest', final], { stdio: 'inherit' });
console.log('wrote', final);

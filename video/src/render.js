/* Render frames [from, to) at 60fps straight into an H.264 segment via ffmpeg.
   usage: node src/render.js <fromFrame> <toFrame> <out.mp4> [crf] [preset] */
const { createCanvas } = require('@napi-rs/canvas');
const { spawn } = require('child_process');
const fs = require('fs'); const path = require('path');
const { loadAssets, ROOT } = require('./assets.js');
const { createVideo } = require('./video.js');

(async () => {
  const [from, to] = [+process.argv[2], +process.argv[3]];
  const out = process.argv[4];
  const crf = process.argv[5] || '20', preset = process.argv[6] || 'veryfast';
  const A = await loadAssets();
  const V = createVideo(JSON.parse(fs.readFileSync(path.join(ROOT, 'build/words.json'))), JSON.parse(fs.readFileSync(path.join(ROOT, 'build/env.json'))), A);
  const W = 1920, H = 1080, FPS = 60;
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', preset, '-tune', 'animation', '-crf', crf, '-pix_fmt', 'yuv420p', '-g', '120', '-threads', process.env.X264_THREADS || '0', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const cv = createCanvas(W, H); const ctx = cv.getContext('2d');
  const write = (buf) => new Promise((res) => { if (ff.stdin.write(buf)) res(); else ff.stdin.once('drain', res); });
  const t0 = Date.now();
  for (let f = from; f < to; f++) {
    V.renderFrame(ctx, f / FPS);
    await write(Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer));
    if ((f - from) % 1200 === 0) process.stderr.write(`[${out}] frame ${f - from}/${to - from} ${((Date.now() - t0) / 1000).toFixed(0)}s\n`);
  }
  ff.stdin.end();
  await new Promise((res) => ff.on('close', res));
  process.stderr.write(`[${out}] done ${to - from} frames in ${((Date.now() - t0) / 1000).toFixed(0)}s\n`);
})().catch((e) => { console.error(e); process.exit(1); });

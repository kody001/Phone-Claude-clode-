// Render the YouTube thumbnails: node tools/thumbs.mjs [outDir] [n,...]
// Captures web/thumb.html at 2560x1440 (2x) and writes thumb_N_2x.png; downscale with ffmpeg for upload.
import { chromium } from 'playwright';
import fs from 'fs';
import { serve } from './server.mjs';

const out = process.argv[2] || 'render/thumbs';
const which = (process.argv[3] || '1,2,3').split(',').map(Number);
fs.mkdirSync(out, { recursive: true });
const srv = await serve(0); const port = srv.address().port;
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
for (const n of which) {
  const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 });
  p.on('pageerror', e => console.log(`[${n}] PAGE ERROR`, e.message));
  await p.goto(`http://127.0.0.1:${port}/web/thumb.html?n=${n}`);
  await p.waitForFunction('window.thumbReady', null, { timeout: 120000 });
  await p.screenshot({ path: `${out}/thumb_${n}_2x.png` });
  await p.close();
  console.log('wrote', `${out}/thumb_${n}_2x.png`);
}
await b.close(); srv.close();

// Render the YouTube thumbnails: node tools/thumbs.js [outdir]  -> thumb_1..3.png (1920x1080) + .jpg (1280x720)
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path');
const { start } = require('./serve');
(async () => {
  const out = path.resolve(process.argv[2] || path.join(__dirname, '..', 'out', 'thumbnails'));
  fs.mkdirSync(out, { recursive: true });
  const { srv, port } = await start();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('pageerror', e => console.log('[pageerror]', e.message));
  await page.goto(`http://127.0.0.1:${port}/thumbs/thumbs.html`);
  const n = await page.evaluate(() => window.READY);
  for (let i = 0; i < n; i++) {
    const b64 = (await page.evaluate(i => window.render(i), i)).split(',')[1];
    const png = path.join(out, `thumb_${i + 1}_full.png`);
    fs.writeFileSync(png, Buffer.from(b64, 'base64'));
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', png, '-vf', 'scale=1280:720:flags=lanczos', '-q:v', '2', path.join(out, `thumbnail_${i + 1}.jpg`)]);
  }
  await browser.close(); srv.close();
  console.log('wrote', n, 'thumbnails to', out);
})();

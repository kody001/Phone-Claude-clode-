// Render single frames to PNG for checking. usage: node tools/snap.js OUTDIR t1 t2 ... (seconds)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const { start } = require('./serve');
(async () => {
  const [out, ...ts] = process.argv.slice(2);
  fs.mkdirSync(out, { recursive: true });
  const { srv, port } = await start();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('[page]', m.text()); });
  page.on('pageerror', e => console.log('[pageerror]', e.message));
  await page.goto(`http://127.0.0.1:${port}/scenes/index.html?render=1`);
  const info = await page.evaluate(() => window.READY);
  console.log('shots', info.shots, 'duration', info.duration.toFixed(1));
  if (info.errors.length) console.log(info.errors.join('\n'));
  for (const t of ts) {
    const b64 = await page.evaluate(t => window.grab(t, 0.92).split(',')[1], parseFloat(t));
    fs.writeFileSync(path.join(out, `f_${String(t).padStart(7, '0')}.jpg`), Buffer.from(b64, 'base64'));
  }
  await browser.close(); srv.close();
})();

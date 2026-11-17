// Render selected frames to JPEG files for review + timing. usage: node snap.js out_dir frame1 frame2 ... [--q=scale]
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path'); const serve = require('./serve');
(async () => {
  const args = process.argv.slice(2); const out = args[0]; const frames = args.slice(1).filter(a => !a.startsWith('--')).map(Number);
  const qs = args.filter(a => a.startsWith('--')).map(a => a.slice(2)).join('&');
  fs.mkdirSync(out, { recursive: true });
  const srv = await serve(0); const port = srv.address().port;
  const extra = (process.env.CHROME_FLAGS || '').split(' ').filter(Boolean);
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-gpu-vsync', ...extra] });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('PAGE', m.type(), m.text()); });
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto(`http://127.0.0.1:${port}/scenes/index.html?${qs}`);
  await p.waitForFunction(() => window.APP && window.APP.init, null, { timeout: 60000 });
  const info = await p.evaluate(async (prof) => { await window.FONTS_LOADED; APP.profile = prof; return await APP.init(); }, qs.includes('prof'));
  console.log('init', info);
  for (const f of frames) {
    const t0 = Date.now(); const d = await p.evaluate((f) => APP.frame(f, 0.9), f); const dt = Date.now() - t0;
    fs.writeFileSync(path.join(out, `f${String(f).padStart(6, '0')}.jpg`), Buffer.from(d.split(',')[1], 'base64'));
    const pr = await p.evaluate(() => APP.lastProf); console.log('frame', f, dt + 'ms', JSON.stringify(pr, (k, v) => typeof v === 'number' ? Math.round(v) : v));
  }
  await b.close(); srv.close();
})();

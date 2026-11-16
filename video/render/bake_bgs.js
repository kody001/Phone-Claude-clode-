// Render every 3D background once to build/bg/<id>.jpg
// node render/bake_bgs.js [--w=3840] [--h=2160] [--only=a,b]
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { serve, ROOT } = require('./serve');
(async () => {
  const opts = Object.fromEntries(process.argv.slice(2).filter(a => a.startsWith('--')).map(a => a.slice(2).split('=')));
  const w = +(opts.w || 3840), h = +(opts.h || 2160);
  const out = path.join(ROOT, 'build', 'bg');
  fs.mkdirSync(out, { recursive: true });
  const { srv, port } = await serve();
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', args: ['--headless=new', '--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage();
  page.on('pageerror', e => console.log('[pageerror]', e.message));
  page.on('console', m => { if (m.type() === 'error') console.log('[console]', m.text()); });
  await page.goto(`http://127.0.0.1:${port}/bg3d/index.html`);
  await page.waitForFunction('window.BG_READY', { timeout: 60000 });
  const ids = opts.only ? opts.only.split(',') : await page.evaluate('window.BG_IDS');
  for (const id of ids) {
    const t0 = Date.now();
    const url = await page.evaluate((id, w, h) => window.renderBG(id, w, h), id, w, h);
    fs.writeFileSync(path.join(out, id + '.jpg'), Buffer.from(url.split(',')[1], 'base64'));
    console.log(id, ((Date.now() - t0) / 1000).toFixed(1) + 's');
  }
  await browser.close(); srv.close();
})().catch(e => { console.error(e); process.exit(1); });

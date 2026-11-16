// Render still frames: node render/still.js <outdir> <t1> [t2 ...] [--scenes=name] [--scale=0.5]
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { serve } = require('./serve');
(async () => {
  const args = process.argv.slice(2);
  const opts = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => a.slice(2).split('=')));
  const [out, ...times] = args.filter(a => !a.startsWith('--'));
  fs.mkdirSync(out, { recursive: true });
  const { srv, port } = await serve();
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', args: ['--headless=new', '--no-sandbox', '--hide-scrollbars'] });
  const page = await browser.newPage();
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warn') console.log('[page]', m.text()); });
  page.on('pageerror', e => console.log('[pageerror]', e.message));
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto(`http://127.0.0.1:${port}/index.html?render=1${opts.scenes ? '&scenes=' + opts.scenes : ''}${opts.res ? '&res=' + opts.res : ''}`);
  await page.waitForFunction('window.READY || window.BOOT_ERROR', { timeout: 60000 });
  const err = await page.evaluate('window.BOOT_ERROR');
  if (err) { console.error(err); process.exit(1); }
  const scale = parseFloat(opts.scale || '0.5');
  for (const t of times) {
    const data = await page.evaluate((t, scale) => {
      renderAt(t);
      const c = document.getElementById('c');
      if (scale === 1) return c.toDataURL('image/png');
      const o = document.createElement('canvas'); o.width = c.width * scale; o.height = c.height * scale;
      o.getContext('2d').drawImage(c, 0, 0, o.width, o.height);
      return o.toDataURL('image/jpeg', 0.9);
    }, parseFloat(t), scale);
    const f = path.join(out, `t${(+t).toFixed(2).padStart(7, '0')}.${scale === 1 ? 'png' : 'jpg'}`);
    fs.writeFileSync(f, Buffer.from(data.split(',')[1], 'base64'));
    console.log(f);
  }
  await browser.close(); srv.close();
})().catch(e => { console.error(e); process.exit(1); });

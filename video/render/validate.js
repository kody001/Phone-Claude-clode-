// Load the scenes, run every shot's draw at sample times (collects sound cues), report errors.
// node render/validate.js [--scenes=a,b] [--cues=out.json]
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const { serve } = require('./serve');
(async () => {
  const opts = Object.fromEntries(process.argv.slice(2).filter(a => a.startsWith('--')).map(a => a.slice(2).split('=')));
  const { srv, port } = await serve();
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', args: ['--headless=new', '--no-sandbox'] });
  const page = await browser.newPage();
  page.on('pageerror', e => console.log('[pageerror]', e.message));
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto(`http://127.0.0.1:${port}/index.html?render=1${opts.scenes ? '&scenes=' + opts.scenes : ''}`);
  await page.waitForFunction('window.READY || window.BOOT_ERROR', { timeout: 60000 });
  const err = await page.evaluate('window.BOOT_ERROR');
  if (err) { console.error('BOOT ERROR:', err); process.exit(1); }
  const res = await page.evaluate(() => {
    try { const cues = collectCues(); return { cues, shots: shotList() }; } catch (e) { return { error: String(e.stack || e) }; }
  });
  if (res.error) { console.error('DRAW ERROR:', res.error); process.exit(1); }
  console.log('shots:', res.shots.length, 'cues:', res.cues.length);
  const short = res.shots.filter(s => s.end - s.start < 0.8);
  if (short.length) console.log('very short shots:', short.map(s => s.start.toFixed(2) + '-' + s.end.toFixed(2)).join(', '));
  const neg = res.shots.filter((s, i) => i && s.start < res.shots[i - 1].start);
  if (neg.length) console.log('out of order:', neg);
  if (opts.cues) fs.writeFileSync(opts.cues, JSON.stringify(res.cues, null, 0));
  if (opts.shots) fs.writeFileSync(opts.shots, JSON.stringify(res.shots));
  const ids = {}; res.cues.forEach(c => ids[c.id] = (ids[c.id] || 0) + 1);
  console.log(Object.entries(ids).sort((a, b) => b[1] - a[1]).map(e => e[0] + ':' + e[1]).join(' '));
  await browser.close(); srv.close();
})().catch(e => { console.error(e); process.exit(1); });

import { chromium } from 'playwright';
import { serve } from './server.mjs';
const srv = await serve(0); const port = srv.address().port;
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const variants = ['', 'nofilter', 'nograin', 'nofilter&nograin', 'nofilter&nograin&pcf', ''];
for (const v of variants) {
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto(`http://127.0.0.1:${port}/web/index.html?${v}`);
  await p.waitForFunction('window.ready', null, { timeout: 180000 });
  const cdp = await p.context().newCDPSession(p);
  let tr = 0, tc = 0;
  for (let i = 0; i < 24; i++) { const t = 600 + i / 60; let a = Date.now(); await p.evaluate(t => window.renderAt(t), t); tr += Date.now() - a; a = Date.now(); await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 93, optimizeForSpeed: true }); tc += Date.now() - a; }
  console.log((v || 'baseline').padEnd(24), 'render ms', (tr / 24).toFixed(0), 'capture ms', (tc / 24).toFixed(0));
  await p.close();
}
await b.close(); srv.close();

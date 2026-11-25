// Render small thumbnails every STEP seconds to spot blocked/blank frames.
import { chromium } from 'playwright';
import fs from 'fs';
import { serve } from './server.mjs';
const [from, to, step, out] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const srv = await serve(0); const port = srv.address().port;
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto(`http://127.0.0.1:${port}/web/index.html`);
await p.waitForFunction('window.ready', null, { timeout: 120000 });
const cdp = await p.context().newCDPSession(p);
for (let t = +from; t < +to; t += +step) {
  await p.evaluate(t => window.renderAt(t), t);
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 70, clip: { x: 0, y: 0, width: 1920, height: 1080, scale: 0.25 } });
  fs.writeFileSync(`${out}/t_${t.toFixed(1).padStart(7, '0')}.jpg`, Buffer.from(data, 'base64'));
}
await b.close(); srv.close();

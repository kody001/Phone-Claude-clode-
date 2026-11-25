import { chromium } from 'playwright';
import { serve } from '../server.mjs';
const srv = await serve(0); const port = srv.address().port;
const variant = process.argv[2] || '';
const N = +(process.argv[3] || 1);
const b = await chromium.launch({ args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
async function worker(k) {
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto(`http://127.0.0.1:${port}/tools/bench/bench.html?${variant}`);
  await p.waitForFunction('window.ready');
  const cdp = await p.context().newCDPSession(p);
  for (let i = 0; i < 40; i++) { await p.evaluate(t => window.renderAt(t), i / 60); await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 92, optimizeForSpeed: true }); }
}
const t0 = Date.now();
await Promise.all([...Array(N)].map((_, k) => worker(k)));
const ms = Date.now() - t0;
console.log(variant, 'workers', N, 'aggregate fps', (40 * N / (ms / 1000)).toFixed(2));
await b.close(); srv.close();

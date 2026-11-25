// Usage: node tools/snap.mjs <page> <outPrefix> <t1,t2,...> [arg] [w h]
import { chromium } from 'playwright';
import { serve } from './server.mjs';
const [page, out, ts, arg, w, h] = process.argv.slice(2);
const srv = await serve(0); const port = srv.address().port;
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('console', m => { if (!m.text().includes('GPU stall')) console.log('page:', m.text()); });
p.on('pageerror', e => console.log('PAGE ERROR:', e.message));
await p.goto(`http://127.0.0.1:${port}/${page}`);
await p.waitForFunction('window.ready', null, { timeout: 120000 });
for (const t of ts.split(',')) {
  await p.evaluate(([t, a]) => window.renderAt(+t, a), [t, arg]);
  await p.screenshot({ path: `${out}_${t}.png`, ...(w ? { clip: { x: 0, y: 0, width: 1920, height: 1080 } } : {}) });
}
await b.close(); srv.close();

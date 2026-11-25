// Load the page, report errors + anchor misses + timeline stats.
import { chromium } from 'playwright';
import { serve } from './server.mjs';
const srv = await serve(0); const port = srv.address().port;
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('pageerror', e => console.log('PAGE ERROR:', e.message, e.stack?.split('\n').slice(0, 3).join(' | ')));
p.on('console', m => { if (!m.text().includes('GPU stall')) console.log('page:', m.text()); });
await p.goto(`http://127.0.0.1:${port}/web/index.html`);
await p.waitForFunction('window.ready', null, { timeout: 120000 });
console.log(await p.evaluate(() => JSON.stringify({ info: window.TL_INFO, anchors: globalThis.__anchorErrors || [] })));
const step = +(process.argv[2] || 0);
if (step) { const D = await p.evaluate(() => window.TL_INFO.duration); let n = 0; const t0 = Date.now(); for (let t = 0; t < D; t += step) { try { await p.evaluate(t => window.renderAt(t), t); n++; } catch (e) { console.log('ERR at', t.toFixed(2), e.message.split('\n')[0]); } } console.log('rendered', n, 'frames in', (Date.now() - t0) / 1000, 's'); }
await b.close(); srv.close();

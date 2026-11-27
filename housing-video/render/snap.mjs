// Screenshot frames at given times: node snap.mjs out_prefix t1 t2 ... [--test=name] [--scale=0.5]
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import path from 'node:path';
import fs from 'node:fs';
import { serve } from './server.mjs';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const args = process.argv.slice(2);
const out = args.shift();
const opts = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => a.slice(2).split('=')));
const times = args.filter(a => !a.startsWith('--')).map(Number);
const srv = await serve(root);
const url = `http://127.0.0.1:${srv.address().port}/web/index.html?render=1${opts.test ? '&test=' + opts.test : ''}`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('[page]', m.text()); });
page.on('pageerror', e => console.log('[pageerror]', e.message));
await page.goto(url);
await page.waitForFunction(() => window.READY === true, null, { timeout: 60000 });
const scale = Number(opts.scale || 1);
for (const t of times) {
  const b64 = await page.evaluate(([t, sc]) => window.snapshot(t, sc), [t, scale]);
  const f = `${out}_${String(t).replace('.', 'p')}.jpg`;
  fs.writeFileSync(f, Buffer.from(b64, 'base64'));
  console.log(f);
}
await browser.close();
srv.close();

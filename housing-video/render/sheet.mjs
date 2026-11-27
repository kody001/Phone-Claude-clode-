// Contact sheets: one frame per shot (at 70% of the shot or +2.2s), 5x4 grid per sheet.
// node sheet.mjs out_prefix [fromSec] [toSec] [--at=0.7]
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
import { serve } from './server.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const [out, from = '0', to = '99999'] = process.argv.slice(2).filter(a => !a.startsWith('--'));
const atArg = (process.argv.find(a => a.startsWith('--at=')) || '').slice(5);
const srv = await serve(root);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('[page]', m.text().slice(0, 300)); });
page.on('pageerror', e => console.log('[pageerror]', e.message));
await page.goto(`http://127.0.0.1:${srv.address().port}/web/index.html?render=1`);
await page.waitForFunction(() => window.READY === true, null, { timeout: 60000 });
const list = await page.evaluate(() => window.SHOT_LIST);
const shots = list.filter(s => s[1] >= Number(from) && s[1] < Number(to));
console.log('shots total', list.length, 'in range', shots.length);
let n = 0;
for (let i = 0; i < shots.length; i += 20) {
  const chunk = shots.slice(i, i + 20);
  const b64 = await page.evaluate(([chunk, atf]) => {
    const tw = 384, th = 216, c = document.createElement('canvas'); c.width = tw * 5; c.height = (th + 22) * 4;
    const g = c.getContext('2d'); g.fillStyle = '#333'; g.fillRect(0, 0, c.width, c.height);
    chunk.forEach(([id, st, du], k) => {
      const t = st + (atf ? du * atf : Math.min(du * 0.75, 2.4));
      window.renderFrame(t);
      const x = (k % 5) * tw, y = Math.floor(k / 5) * (th + 22);
      g.drawImage(document.getElementById('cv'), x, y + 22, tw, th);
      g.fillStyle = '#ff0'; g.font = '14px sans-serif'; g.fillText(`${t.toFixed(1)}s ${id}`.slice(0, 52), x + 4, y + 16);
    });
    return c.toDataURL('image/jpeg', 0.85).split(',')[1];
  }, [chunk, atArg ? Number(atArg) : 0]);
  const f = `${out}_${String(++n).padStart(2, '0')}.jpg`;
  fs.writeFileSync(f, Buffer.from(b64, 'base64')); console.log(f);
}
const warns = await page.evaluate(() => window.STORY_WARN || []);
if (warns.length) console.log('WARN:\n' + warns.join('\n'));
await browser.close(); srv.close();

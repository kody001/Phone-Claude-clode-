import { chromium } from 'playwright';
import { serve } from './server.mjs';
const srv = await serve(0); const port = srv.address().port;
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('pageerror', e => console.log('PAGE ERROR:', e.message));
await p.goto(`http://127.0.0.1:${port}/web/index.html`);
await p.waitForFunction('window.ready', null, { timeout: 120000 });
await p.addScriptTag({ type: 'module', content: `import * as THREE from 'three'; window.__T = THREE;` });
for (const t of process.argv.slice(2).map(Number)) {
  const r = await p.evaluate((t) => { window.renderAt(t); const cam = window.__dbgCam; return cam ? { pos: cam.position.toArray().map(v => +v.toFixed(2)), dir: cam.getWorldDirection(new window.__T.Vector3()).toArray().map(v => +v.toFixed(2)) } : null; }, t);
  console.log(t, JSON.stringify(r));
}
await b.close(); srv.close();

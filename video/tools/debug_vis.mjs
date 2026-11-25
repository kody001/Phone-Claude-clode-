import { chromium } from 'playwright';
import { serve } from './server.mjs';
const srv = await serve(0); const port = srv.address().port;
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto(`http://127.0.0.1:${port}/web/index.html`);
await p.waitForFunction('window.ready', null, { timeout: 120000 });
const t = +process.argv[2];
const r = await p.evaluate((t) => {
  window.renderAt(t); const cam = window.__dbgCam; const B = window.__dbgSets.building;
  const vis = []; B.scene.traverse(o => { if (o.isMesh) { let v = true, q = o; while (q) { if (!q.visible) { v = false; break; } q = q.parent; } if (v) { const p = o.getWorldPosition(new cam.position.constructor()); if (p.distanceTo(cam.position) < 2.0) vis.push(`${o.geometry.type} ${p.toArray().map(x => x.toFixed(2))} col=${o.material.color?.getHexString?.()} map=${!!o.material.map}`); } } });
  return { cam: cam.position.toArray(), fov: cam.fov, near: vis };
}, t);
console.log(JSON.stringify(r, null, 1));
await p.screenshot({ path: process.argv[3] });
await b.close(); srv.close();

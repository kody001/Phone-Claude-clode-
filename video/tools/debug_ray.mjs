import { chromium } from 'playwright';
import { serve } from './server.mjs';
const srv = await serve(0); const port = srv.address().port;
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto(`http://127.0.0.1:${port}/web/index.html`);
await p.waitForFunction('window.ready', null, { timeout: 120000 });
await p.addScriptTag({ type: 'module', content: `import * as THREE from 'three'; window.__T = THREE;` });
await p.waitForFunction('window.__T');
for (const t of process.argv.slice(2).map(Number)) {
  const r = await p.evaluate((t) => {
    window.renderAt(t); const T = window.__T, cam = window.__dbgCam;
    const sc = Object.values(window.__dbgSets).find(s => { let f = false; return s.scene.children.length && s.scene.getObjectById && true; });
    const out = [];
    for (const [nm, s] of Object.entries(window.__dbgSets)) {
      const rc = new T.Raycaster(); rc.setFromCamera(new T.Vector2(0, 0), cam);
      const hits = rc.intersectObjects(s.scene.children, true).filter(h => h.object.visible && (() => { let o = h.object; while (o) { if (!o.visible) return false; o = o.parent; } return true; })());
      if (hits.length) out.push(nm + ': ' + hits.slice(0, 3).map(h => `${h.object.geometry.type} d=${h.distance.toFixed(2)} col=${h.object.material.color ? h.object.material.color.getHexString() : '?'} side=${h.object.material.side}`).join(' | '));
    }
    return out;
  }, t);
  console.log(t, JSON.stringify(r, null, 1));
}
await b.close(); srv.close();

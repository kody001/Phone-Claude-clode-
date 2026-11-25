import { chromium } from 'playwright';
import { serve } from './server.mjs';
const srv = await serve(0); const port = srv.address().port;
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto(`http://127.0.0.1:${port}/web/index.html`);
await p.waitForFunction('window.ready', null, { timeout: 120000 });
const t = +process.argv[2];
const r = await p.evaluate((t) => {
  const B = window.__dbgSets.building; const res = [];
  const meshes = []; B.scene.traverse(o => { if (o.isMesh) meshes.push(o); });
  const gl = document.getElementById('gl').getContext('webgl2');
  const px = () => { const a = new Uint8Array(4); gl.readPixels(960, 540, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, a); return Array.from(a).join(','); };
  window.renderAt(t); const base = px();
  // hide meshes one at a time (by top-level child of scene) and see which changes the centre pixel
  const tint = (list, nm) => list.forEach((c, i) => { if (!c.material || Array.isArray(c.material)) return; const m0 = c.material; c.material = m0.clone(); c.material.color.set('#ff0000'); c.material.map = null; c.material.needsUpdate = true; window.renderAt(t); const q = px(); c.material = m0; if (q !== base) res.push(`${nm}[${i}] ${c.geometry.type} vis=${c.visible} pos=${c.position.toArray().map(x => x.toFixed(2))} -> ${q}`); });
  B.cab.children.forEach((c,i)=>res.push(`cab[${i}] ${c.type} ${c.geometry?c.geometry.type:''} vis=${c.visible}`));
  tint(B.cab.children, 'cab'); tint([B.doorL, B.doorR], 'door');
  const all=[]; B.scene.traverse(o=>{ if(o.isMesh && !Array.isArray(o.material)) all.push(o); }); tint(all, 'all');
  return { base, res };
}, t);
console.log(JSON.stringify(r, null, 1));
await b.close(); srv.close();

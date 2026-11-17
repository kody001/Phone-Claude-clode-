// Render the middle frame of every shot; report errors, timing and write a contact sheet.
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path'); const serve = require('./serve');
(async () => {
  const out = process.argv[2]; const only = process.argv[3] ? process.argv[3].split(',').map(Number) : null; fs.mkdirSync(out, { recursive: true });
  const srv = await serve(0); const port = srv.address().port;
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-accelerated-2d-canvas'] });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(`http://127.0.0.1:${port}/scenes/index.html`);
  await p.waitForFunction(() => window.APP && window.APP.init, null, { timeout: 60000 });
  const info = await p.evaluate(async () => { await window.FONTS_LOADED; return await APP.init(); });
  const table = await p.evaluate(() => APP.shotTable());
  fs.writeFileSync(path.join(out, 'shots.json'), JSON.stringify(table, null, 1));
  const cues = await p.evaluate(() => APP.cues()); fs.writeFileSync(path.join(__dirname, '..', 'data', 'cues.json'), JSON.stringify(cues, null, 1));
  console.log('init', info, 'cues', cues.length);
  const short = table.filter(s => s.end - s.start < 0.5); if (short.length) console.log('SHORT SHOTS', JSON.stringify(short));
  for (const s of table) {
    if (only && !only.includes(s.id)) continue;
    const f = Math.floor(((s.start + s.end) / 2) * 60);
    const n0 = errs.length; const t0 = Date.now();
    let d; try { d = await p.evaluate((f) => APP.frame(f, 0.8), f); } catch (e) { errs.push(String(e.message).split('\n')[0]); }
    if (d) fs.writeFileSync(path.join(out, `s${String(s.id).padStart(3, '0')}.jpg`), Buffer.from(d.split(',')[1], 'base64'));
    const bad = errs.slice(n0);
    console.log(`#${s.id} ${s.at} [${s.set}] ${(s.end - s.start).toFixed(2)}s ${Date.now() - t0}ms ${bad.length ? 'ERR ' + bad.join(' | ') : ''}`);
  }
  await b.close(); srv.close();
})();

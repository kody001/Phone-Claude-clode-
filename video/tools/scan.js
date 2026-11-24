// render every N seconds without capture to find runtime errors
const { chromium } = require('playwright'); const start = require('./server');
(async () => {
  const srv = await start(9700 + Math.floor(Math.random() * 200)); const port = srv.address().port;
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await pg.goto(`http://127.0.0.1:${port}/index.html`); await pg.evaluate(() => window.READY);
  const res = await pg.evaluate(() => { const out = []; const t0 = performance.now(); for (let t = 0; t < DURATION; t += 0.25) { try { renderAt(t); } catch (e) { out.push(t.toFixed(2) + ': ' + e.message); } } return { out, ms: performance.now() - t0, shots: SHOTS.length, dur: DURATION }; });
  console.log('shots', res.shots, 'duration', res.dur, 'scan ms', res.ms.toFixed(0)); console.log(res.out.slice(0, 20).join('\n')); console.log(errs.slice(0, 10).join('\n'));
  // shot lengths
  const lens = await pg.evaluate(() => SHOTS.map(s => [s.phrase, +(Math.min(s.t1, DURATION) - s.t0).toFixed(1)]));
  console.log('longest shots:', lens.sort((a, b) => b[1] - a[1]).slice(0, 8).map(x => x.join(' = ')).join(' | '));
  await b.close(); srv.close();
})();

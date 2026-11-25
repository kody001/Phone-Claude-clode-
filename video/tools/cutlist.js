const { chromium } = require('playwright'); const start = require('./server');
(async () => {
  const srv = await start(9900 + Math.floor(Math.random() * 90)); const port = srv.address().port;
  const b = await chromium.launch(); const pg = await b.newPage();
  await pg.goto(`http://127.0.0.1:${port}/index.html`); await pg.evaluate(() => window.READY);
  const r = await pg.evaluate(() => ({ n: CUTAWAYS, cuts: SHOTS.flatMap(s => (s.cuts || []).map(c => +c.t0.toFixed(2))) }));
  const segs = 182 + r.n * 2;
  console.log('cutaways', r.n, '-> visual segments ~', segs, 'avg', (1098 / segs).toFixed(1), 's');
  console.log(r.cuts.join(' '));
  await b.close(); srv.close();
})();

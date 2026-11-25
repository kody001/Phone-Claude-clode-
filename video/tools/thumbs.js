// node thumbs.js  -> ../thumbnails/thumbnail_1.jpg .. _3.jpg (1280x720)
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path'); const start = require('./server');
(async () => {
  const srv = await start(9300 + Math.floor(Math.random() * 200)); const port = srv.address().port;
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  pg.on('pageerror', e => console.log('PAGEERR', e.message));
  await pg.goto(`http://127.0.0.1:${port}/thumbs.html`); await pg.evaluate(() => window.READY);
  const outDir = path.join(__dirname, '..', 'thumbnails'); fs.mkdirSync(outDir, { recursive: true });
  for (let i = 0; i < 3; i++) {
    const d = await pg.evaluate(i => exportThumb(i), i);
    const f = path.join(outDir, `thumbnail_${i + 1}.jpg`); fs.writeFileSync(f, Buffer.from(d.split(',')[1], 'base64'));
    console.log(f, fs.statSync(f).size);
  }
  await b.close(); srv.close();
})();

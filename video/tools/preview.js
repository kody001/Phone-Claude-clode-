// node preview.js out.png t1 t2 ...   -> contact sheet (or single frame) of the given times
const { chromium } = require('playwright');
const start = require('./server');
(async () => {
  const [out, ...ts] = process.argv.slice(2);
  const srv = await start(8123 + Math.floor(Math.random() * 500));
  const port = srv.address().port;
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  pg.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('PAGE', m.text()); });
  pg.on('pageerror', e => console.log('PAGEERR', e.message));
  await pg.goto(`http://127.0.0.1:${port}/index.html`);
  await pg.evaluate(() => window.READY);
  const imgs = [];
  for (const t of ts) {
    const d = await pg.evaluate(tt => { renderAt(tt); return document.getElementById('c').toDataURL('image/jpeg', 0.85); }, parseFloat(t));
    imgs.push(d);
  }
  // compose contact sheet in page
  const cols = ts.length === 1 ? 1 : (ts.length <= 4 ? 2 : 3);
  const sheet = await pg.evaluate(async ({ imgs, cols, ts }) => {
    const w = cols === 1 ? 1920 : 640, h = cols === 1 ? 1080 : 360;
    const rows = Math.ceil(imgs.length / cols);
    const cv = document.createElement('canvas'); cv.width = w * cols; cv.height = h * rows;
    const c = cv.getContext('2d'); c.fillStyle = '#888'; c.fillRect(0, 0, cv.width, cv.height);
    for (let i = 0; i < imgs.length; i++) {
      const im = new Image(); im.src = imgs[i]; await im.decode();
      const x = (i % cols) * w, y = Math.floor(i / cols) * h;
      c.drawImage(im, x, y, w - 2, h - 2);
      c.fillStyle = 'rgba(0,0,0,.6)'; c.fillRect(x, y, 90, 26); c.fillStyle = '#fff'; c.font = '20px sans-serif'; c.fillText(ts[i], x + 6, y + 19);
    }
    return cv.toDataURL('image/jpeg', 0.85);
  }, { imgs, cols, ts });
  require('fs').writeFileSync(out, Buffer.from(sheet.split(',')[1], 'base64'));
  await b.close(); srv.close();
})();

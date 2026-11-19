// Contact sheets for review: renders a frame from each shot (at a fraction of its length)
// and tiles them 4x3. usage: node tools/sheets.js OUTDIR [fromShot] [toShot] [frac=0.7]
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path');
const { start } = require('./serve');
(async () => {
  const [out, a = '0', b = '9999', frac = '0.7'] = process.argv.slice(2);
  fs.mkdirSync(out, { recursive: true });
  const { srv, port } = await start();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('pageerror', e => console.log('[pageerror]', e.message));
  await page.goto(`http://127.0.0.1:${port}/scenes/index.html?render=1`);
  const info = await page.evaluate(() => window.READY);
  console.log('shots', info.shots);
  if (info.errors.length) console.log(info.errors.join('\n'));
  const list = await page.evaluate(() => window.shotList());
  const all = list.map((s, i) => ({ ...s, i }));
  const sel = a.includes(',') ? a.split(',').map(Number).map(i => all[i]) : all.slice(+a, +b + 1);
  const files = [];
  for (const s of sel) {
    const t = s.t0 + (s.t1 - s.t0) * +frac;
    const b64 = await page.evaluate(t => window.grab(t, 0.85).slice(23), t);
    const f = path.join(out, `s_${String(s.i).padStart(3, '0')}.jpg`);
    fs.writeFileSync(f, Buffer.from(b64, 'base64'));
    files.push(f);
  }
  await browser.close(); srv.close();
  for (let k = 0; k < files.length; k += 12) {
    const group = files.slice(k, k + 12);
    const args = ['-y', '-loglevel', 'error'];
    group.forEach(f => args.push('-i', f));
    const n = group.length;
    let fc = group.map((_, i) => `[${i}:v]scale=480:270,drawtext=text='${sel[k + i].i}':x=8:y=6:fontsize=26:fontcolor=red[v${i}]`).join(';');
    for (let i = n; i < 12; i++) fc += `;color=c=gray:s=480x270:d=1[v${i}]`;
    fc += ';' + Array.from({ length: 12 }, (_, i) => `[v${i}]`).join('') + 'xstack=inputs=12:layout=' + Array.from({ length: 12 }, (_, i) => `${(i % 4) * 480}_${Math.floor(i / 4) * 270}`).join('|') + '[o]';
    args.push('-filter_complex', fc, '-map', '[o]', '-frames:v', '1', path.join(out, `sheet_${String(k / 12).padStart(2, '0')}.jpg`));
    execFileSync('ffmpeg', args);
  }
  console.log('sheets:', Math.ceil(files.length / 12));
})();

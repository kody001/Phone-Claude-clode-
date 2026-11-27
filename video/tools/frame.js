const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs'); const path = require('path');
const { loadAssets, ROOT } = require('../src/assets.js');
const { createVideo } = require('../src/video.js');
(async () => {
  const A = await loadAssets();
  const V = createVideo(JSON.parse(fs.readFileSync(path.join(ROOT, 'build/words.json'))), JSON.parse(fs.readFileSync(path.join(ROOT, 'build/env.json'))), A);
  const cv = createCanvas(1920, 1080); const ctx = cv.getContext('2d');
  const out = process.argv[2]; const ts = process.argv.slice(3).map(Number);
  const sheet = createCanvas(1920, 1080 * Math.ceil(ts.length / 2) / 2); const sc = sheet.getContext('2d');
  ts.forEach((t, i) => { V.renderFrame(ctx, t); sc.drawImage(cv, (i % 2) * 960, Math.floor(i / 2) * 540, 960, 540); });
  fs.writeFileSync(out, sheet.toBuffer('image/png'));
})();

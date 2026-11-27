const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs'); const path = require('path');
const { loadAssets, ROOT } = require('../src/assets.js');
const { createVideo } = require('../src/video.js');
(async () => {
  const A = await loadAssets();
  const V = createVideo(JSON.parse(fs.readFileSync(path.join(ROOT, 'build/words.json'))), JSON.parse(fs.readFileSync(path.join(ROOT, 'build/env.json'))), A);
  const cv = createCanvas(1920, 1080); const ctx = cv.getContext('2d');
  const t0 = Date.now(); let n = 0; let bytes = 0;
  for (let t = 100; t < 112; t += 1 / 20) { V.renderFrame(ctx, t); const d = ctx.getImageData(0, 0, 1920, 1080).data; bytes += d.length; n++; }
  console.log('ms/frame (render+readback):', ((Date.now() - t0) / n).toFixed(1));
})();

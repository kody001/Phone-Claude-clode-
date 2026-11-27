/* Validate all shots (cue lookups + runtime) and write contact sheets.
   usage: node tools/check.js [outDir] [fromShot] [toShot] [frac] */
const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs'); const path = require('path');
const { loadAssets, ROOT } = require('../src/assets.js');
const { createVideo } = require('../src/video.js');
(async () => {
  const A = await loadAssets();
  const words = JSON.parse(fs.readFileSync(path.join(ROOT, 'build/words.json')));
  const env = JSON.parse(fs.readFileSync(path.join(ROOT, 'build/env.json')));
  const V = createVideo(words, env, A);
  const out = process.argv[2]; const from = +(process.argv[3] || 0); const to = +(process.argv[4] || V.shots.length); const frac = +(process.argv[5] || 0.75);
  console.log(V.shots.length, 'shots; duration', V.duration.toFixed(1), 'covered until', V.shots[V.shots.length - 1].t0.toFixed(1));
  const cv = createCanvas(1920, 1080); const ctx = cv.getContext('2d');
  const thumbs = []; let errs = 0;
  for (let i = from; i < Math.min(to, V.shots.length); i++) {
    const s = V.shots[i];
    for (const f of [0.02, 0.5, 0.98]) { try { V.renderFrame(ctx, s.t0 + (s.t1 - s.t0) * f); } catch (e) { errs++; console.log('ERR shot', i, JSON.stringify(s.def.cue), e.message.split('\n')[0]); break; } }
    if (out) { try { V.renderFrame(ctx, s.t0 + (s.t1 - s.t0) * frac); } catch (e) { continue; } const th = createCanvas(480, 270); const tc = th.getContext('2d'); tc.drawImage(cv, 0, 0, 480, 270); tc.fillStyle = '#000'; tc.font = '18px sans-serif'; tc.fillText(i + ' @' + s.t0.toFixed(1), 6, 20); thumbs.push(th); }
  }
  if (out) {
    fs.mkdirSync(out, { recursive: true });
    for (let p = 0; p * 16 < thumbs.length; p++) {
      const sheet = createCanvas(1920, 1080); const sc = sheet.getContext('2d'); sc.fillStyle = '#888'; sc.fillRect(0, 0, 1920, 1080);
      thumbs.slice(p * 16, p * 16 + 16).forEach((th, j) => sc.drawImage(th, (j % 4) * 480, Math.floor(j / 4) * 270, 478, 268));
      fs.writeFileSync(path.join(out, `sheet_${String(from + p * 16).padStart(3, '0')}.png`), sheet.toBuffer('image/png'));
    }
  }
  console.log('errors:', errs);
})().catch((e) => { console.error(e); process.exit(1); });

// Export shot table + SFX cue sheet from the scene definitions (no rendering).
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path'); const serve = require('./serve');
(async () => {
  const srv = await serve(0); const port = srv.address().port;
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage(); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto(`http://127.0.0.1:${port}/scenes/index.html`);
  await p.waitForFunction(() => window.APP && window.APP.init, null, { timeout: 60000 });
  const info = await p.evaluate(async () => { await window.FONTS_LOADED; return await APP.init(); });
  const data = await p.evaluate(() => ({ shots: APP.shotTable(), cues: APP.cues() }));
  fs.writeFileSync(path.join(__dirname, '..', 'data', 'shots.json'), JSON.stringify(data.shots, null, 1));
  fs.writeFileSync(path.join(__dirname, '..', 'data', 'cues.json'), JSON.stringify(data.cues, null, 1));
  console.log(JSON.stringify(info), data.shots.length, 'shots', data.cues.length, 'cues');
  await b.close(); srv.close();
})();

/* Node asset loader (fonts + images + metadata). Browser preview uses index.html. */
const path = require('path');
const fs = require('fs');
const { GlobalFonts, loadImage } = require('@napi-rs/canvas');
const ROOT = path.resolve(__dirname, '..');
async function loadAssets() {
  const F = (f) => path.join(ROOT, 'assets', 'fonts', f);
  GlobalFonts.registerFromPath(F('Patrick_Hand.ttf'), 'Patrick Hand');
  GlobalFonts.registerFromPath(F('Permanent_Marker.ttf'), 'Permanent Marker');
  GlobalFonts.registerFromPath(F('Gochi_Hand.ttf'), 'Gochi Hand');
  GlobalFonts.registerFromPath(F('Kalam_700.ttf'), 'Kalam');
  const A = {};
  A.mascotMeta = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets', 'mascot.json')));
  A.mascotHead = await loadImage(path.join(ROOT, 'assets', 'mascot_head.png'));
  A.mascotBody = await loadImage(path.join(ROOT, 'assets', 'mascot_body.png'));
  return A;
}
module.exports = { loadAssets, ROOT };

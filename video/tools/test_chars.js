const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const E = require('../src/engine.js'); const C = require('../src/characters.js');
const { loadAssets } = require('../src/assets.js');
(async () => {
  const A = await loadAssets();
  const cv = createCanvas(1920, 1080); const ctx = cv.getContext('2d');
  const D = new E.Draw(ctx, A); D.setTime(1.0);
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 1920, 1080);
  const poses = [['rest','neutral',0],['pointR','happy',0.8],['shrug','confused',0.5],['fist','determined',0.9],['cheeks','fear',0.6],['think','sad',0]];
  poses.forEach(([p, e, talk], i) => C.mascot(D, { x: 160 + i * 320, y: 520, s: 0.62, pose: p, expr: e, talk, blinkSeed: i + 3 }));
  const looks = [
    { hair: { style: 'spiky', color: '#151515' } },
    { hair: { style: 'bob', color: '#f2c14e' }, acc: ['earrings'], dress: '#e57373' },
    { hair: { style: 'curly', color: '#3b2716' }, skin: '#b5835a', acc: ['glasses', 'tie:#2e7d32'] },
    { hair: { style: 'gray' }, acc: ['wrinkles', 'cane', 'mustache'], beardColor: '#bdbdbd' },
    { hair: { style: 'flat', color: '#6b4226' }, acc: ['hardhat', 'vest:#ff8f00'] },
    { hair: { style: 'bald' }, skin: '#e0ac69', acc: ['sunglasses', 'bowtie:#1565c0'] },
    { hair: { style: 'ponytail', color: '#a0522d' }, acc: ['cap:#1e88e5'] },
  ];
  const ex = ['neutral', 'happy', 'surprise', 'sad', 'angry', 'confused', 'grin'];
  looks.forEach((lk, i) => C.stick(D, { x: 140 + i * 270, y: 1050, s: 0.95, look: lk, expr: ex[i], pose: ['rest','wave','shrug','sad','hips','think','point'][i], id: 100 + i * 37 }));
  fs.writeFileSync(process.argv[2], cv.toBuffer('image/png'));
})();

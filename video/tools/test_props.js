const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const E = require('../src/engine.js'); const P = require('../src/props.js');
const { loadAssets } = require('../src/assets.js');
(async () => {
  const A = await loadAssets();
  const cv = createCanvas(1920, 1080); const ctx = cv.getContext('2d');
  const D = new E.Draw(ctx, A); D.setTime(1.0);
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 1920, 1080);
  const items = [['house',{sign:'FOR SALE'}],['condo',{crack:true}],['bank',{label:'FANNIE MAE'}],['bill',{}],['moneybag',{}],['doc',{title:'MORTGAGE',amount:'7.28%'}],['calendar',{month:'JUN',day:'24'}],
   ['palm',{}],['sun',{}],['hurricane',{}],['cloud',{rain:true}],['umbrella',{}],['car',{lock:true}],['padlock',{text:'3%'}],['ticket',{}],['phone',{msgs:[{text:'Still for sale?',mine:true,read:'Read 2:14 PM'}]}],['crane',{}],['ballot',{}],['ruins',{}],['receipt',{rows:[{label:'Mortgage',value:'$1,957'},{label:'Insurance',value:'$706'}],total:'$2,633'}],['clipboard',{items:['Roof','Concrete','Steel'],checks:2}],['coins',{}],['florida',{}],['truck',{text:'MOVING'}]];
  items.forEach(([n,o],i)=>{ const col=i%8,row=Math.floor(i/8); P.draw(D,n,140+col*235,220+row*330, n==='florida'?0.3:(n==='phone'||n==='crane'?0.5:0.75),o); });
  fs.writeFileSync(process.argv[2], cv.toBuffer('image/png'));
})();

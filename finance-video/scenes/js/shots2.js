'use strict';
// Section 2: the capacity market -> data centers are the party -> the auction numbers ->
// Maryland, Bloomberg, PJM and ICF estimates.

shot("It's called the capacity market", [
  C('board', { x: 720, y: 420, w: 900, h: 400, text: 'THE CAPACITY\nMARKET', size: 96, writeDur: 0.9 }),
  mascot(1600, 'pointer>1100,420', 'smug', { look: [1100, 420] }),
]);
shot('In restaurant terms', [
  ...[400, 960, 1520].map((x, i) => P('table', { x, y: 640, s: 1, a: { reserved: true }, at: `restaurant+${(i * 0.15).toFixed(2)}` })),
  ...[400, 960, 1520].map((x, i) => C('flow', { from: [x - 300, 220], to: [x, 560], n: 2, s: 0.25, prop: 'coin', in: 'none', at: `paying+${(i * 0.1).toFixed(1)}`, arc: 30, dur: 1.2 })),
  label('paying to keep tables open', 960, 200, { size: 66, at: 'keep tables' }),
]);
shot("And here's the important part", { punch: ['important', 1.06] }, [
  mascot(820, 'one', 'excited', { s: 0.9 }),
  P('exclaim', { x: 1250, y: 400, s: 1.1, at: 'important', idle: 'wiggle' }),
]);
shot('How many tables PJM holds', [
  stick('pjm', 300, 'presentL', 'neutral', { flip: true }),
  C('gridOf', { x: 1100, y: 560, prop: 'tableSmall', cols: 5, rows: 3, gx: 210, gy: 150, s: 0.8, in: 'none', at: 'tables', per: 0.03 }),
]);
shot('depends on how many people', [
  C('people', { x: 960, y: 900, n: 8, gap: 190, s: 0.6, alpha: 0.35, in: 'none' }),
  P('question', { x: 960, y: 300, s: 1, at: 'expects', idle: 'bob' }),
  label('how many will show up?', 960, 140, { size: 66, at: 'show up' }),
]);
shot("That's its demand forecast", [
  P('paper', { x: 760, y: 460, s: 1.6, a: { title: 'DEMAND FORECAST', lines: 0, w: 330, size: 34 } }),
  trend(760, 520, { w: 300, h: 200, at: 'forecast', lw: 12 }),
  stick('pjm', 1450, 'point>900,460', 'smug', { look: [900, 460] }),
]);
shot('If the forecast says a huge party', [
  P('paper', { x: 360, y: 400, s: 1, a: { title: 'FORECAST', lines: 0, w: 280, size: 36 } }),
  trend(360, 440, { w: 200, h: 130, lw: 9 }),
  C('people', { x: 1150, y: 900, n: 8, gap: 140, s: 0.65, hats: true, in: 'none', at: 'huge party' }),
  P('balloon', { x: 1650, y: 260, idle: 'float', a: { color: COL.purple }, at: 'party' }),
]);
shot('PJM has to reserve more', [
  C('gridOf', { x: 960, y: 520, prop: 'table', a: { reserved: true }, cols: 6, rows: 3, gx: 280, gy: 190, s: 0.6, in: 'none', per: 0.03 }),
  label('MORE CAPACITY', 960, 140, { size: 80, color: COL.orange, at: 'reserve' }),
]);
shot('The more it needs', [
  label('need', 520, 220, { size: 90, color: COL.green }),
  trend(520, 520, { w: 420, h: 330 }),
  label('price', 1400, 220, { size: 90, color: COL.red, at: 'higher' }),
  trend(1400, 520, { w: 420, h: 330, color: COL.red, at: 'higher', seed: 9 }),
]);
shot('And that cost flows down', [
  P('tower', { x: 300, y: 520, s: 0.9 }),
  label('PJM', 300, 160, { size: 70, color: COL.orange }),
  arrow([420, 500], [700, 500], { at: 'flows', color: COL.ink }),
  P('office', { x: 860, y: 540, s: 1, at: 'utility' }),
  label('local utility', 860, 210, { size: 56, at: 'utility' }),
  arrow([960, 500], [1220, 500], { at: 'bill', color: COL.ink }),
  P('bill', { x: 1420, y: 520, s: 0.8, a: { total: '$$$' }, at: 'bill' }),
  stick('joe', 1720, 'rest', 'worried', { s: 0.8, at: 'bill' }),
]);
shot('And when the forecast jumps faster', [
  label('forecast', 480, 170, { size: 70 }),
  trend(480, 500, { w: 420, h: 360, at: 'jumps', dur: 0.5 }),
  P('gasPlant', { x: 1320, y: 620, s: 0.9, alpha: 0.35, at: 'power plants' }),
  stick('worker', 1080, 'holdR', 'tired', { hold: { prop: 'wrench', s: 0.4, rot: -0.7 }, at: 'power plants' }),
  label('new plants: slow...', 1320, 260, { size: 58, at: 'built' }),
]);
shot('the price shoots up', { shake: 'shoots' }, [
  P('rocket', { x: 960, y: 520, s: 1.2, move: [[960, 380, 'shoots', 0.5]] }),
  P('tag', { x: 1350, y: 400, s: 1.1, a: { text: 'PRICE' }, at: 'price' }),
  trend(560, 480, { w: 360, h: 340, color: COL.red, at: 'shoots', dur: 0.4 }),
]);
shot("That's exactly what's been happening", [
  mascot(960, 'point>1500,300', 'serious', { s: 0.9, look: [1500, 300] }),
  P('exclaim', { x: 1450, y: 320, s: 0.9, at: 'happening' }),
]);
shot('In December 2025', [
  P('calendar', { x: 330, y: 420, s: 1.1, a: { top: 'DEC', text: '2025', size: 66 } }),
  C('bars', { x: 1020, y: 500, w: 620, h: 560, title: 'PJM auction price', bars: [{ label: 'Dec 2025 auction', value: 100, text: 'AT THE CAP', color: COL.red, at: 'hit' }], max: 108, barW: 220 }),
  wire([760, 330], [1280, 330], { at: 'cap', sag: 0, color: COL.red, lw: 7 }),
  label('PRICE CAP', 1480, 330, { size: 58, color: COL.red, at: 'cap' }),
]);
shot('a record high for the third', [
  ...[0, 1, 2].map(i => P('gavel', { x: 380 + i * 580, y: 520, s: 0.8, at: i === 2 ? 'third' : `record+${(i * 0.3).toFixed(1)}` })),
  ...[0, 1, 2].map(i => stamp('RECORD', 380 + i * 580, 300, { size: 64, at: i === 2 ? 'third+0.2' : `record+${(i * 0.3 + 0.2).toFixed(1)}` })),
  label('3 in a row', 960, 800, { size: 72, at: 'in a row' }),
]);
shot("You'll never see a line", [
  P('bill', { x: 760, y: 470, s: 1.3, a: { title: 'YOUR STATEMENT', titleSize: 30, items: [['Energy', '$$'], ['Delivery', '$$'], ['Taxes', '$']], total: '$$$' } }),
  P('magnifier', { x: 640, y: 380, s: 0.8, move: [[900, 560, 'statement', 1.2]] }),
  C('bubble', { x: 1420, y: 330, text: '"data centers"\n...not listed', w: 440, h: 210, tail: 'bl', at: 'data centers' }),
]);
shot("It's just baked into the rate", [
  P('cake', { x: 760, y: 560, s: 1.8 }),
  P('dataCenter', { x: 760, y: 420, s: 0.35, at: 'baked' }),
  label('your rate', 760, 220, { size: 80, at: 'rate' }),
  mascot(1520, 'presentL', 'smug'),
]);
shot("So who's the giant party", [
  C('people', { x: 760, y: 920, n: 7, gap: 170, s: 0.62, hats: true, alpha: 0.28, in: 'none' }),
  big('?', 760, 330, { size: 260, color: COL.ink }),
  mascot(1600, 'think', 'thinking'),
]);
shot('Data centers, the massive', { punch: ['Data', 1.04] }, [
  P('dataCenter', { x: 900, y: 620, s: 1.6 }),
  P('partyHat', { x: 900, y: 330, s: 1.1, rot: 0.1, in: 'drop', at: 'centers' }),
  C('confetti', { x: 900, y: 450, w: 1200, in: 'none', at: 'centers' }),
]);
shot('full of computer chips', [
  C('gridOf', { x: 760, y: 560, prop: 'serverRack', cols: 6, rows: 1, gx: 190, s: 1.1, in: 'none', per: 0.05 }),
  P('chip', { x: 1600, y: 450, s: 1.3, at: 'chips' }),
  label('train + run AI', 1600, 230, { size: 60, at: 'train' }),
]);
shot("PJM's own long-term forecast", [
  stick('pjm', 520, 'holdR', 'neutral', { hold: { prop: 'paper', a: { title: 'FORECAST', lines: 3, size: 34, w: 260 }, s: 0.55 } }),
  doc({ x: 1200, y: 420, w: 860, kicker: 'PJM long-term load forecast', title: 'Released in 2025', body: 'Peak demand on the PJM grid projected to grow by 32 gigawatts between 2024 and 2030.', hl: [{ text: '32 gigawatts', at: 'forecast+0.5' }] }),
]);
shot('showed peak demand growing', [
  C('timeline', { x: 960, y: 640, w: 1300, marks: [{ pos: 0.04, label: '2024', at: '2024' }, { pos: 0.96, label: '2030', at: '2030' }], spans: [{ from: 0.04, to: 0.96, label: '', at: '2030' }] }),
  big('+32 GW', 960, 330, { size: 190, color: COL.orange, at: '32 gigawatts' }),
  label('peak demand', 960, 160, { size: 64 }),
]);
shot('And of that growth', [
  label('the growth: 32 GW', 960, 230, { size: 70 }),
  C('splitbar', { x: 960, y: 450, w: 1300, h: 130, segments: [{ v: 30, color: COL.orange, label: '~30 GW from data centers', at: '30 gigawatts', size: 50 }, { v: 2, color: '#9aa3ad', label: '', at: 'data centers' }] }),
  P('dataCenter', { x: 700, y: 760, s: 0.8, at: 'data centers' }),
  P('partyHat', { x: 700, y: 620, s: 0.5, at: 'data centers', rot: 0.15 }),
  label('everything else', 1560, 610, { size: 44, color: COL.grey, at: 'data centers+0.3' }),
]);
shot('To put that in perspective', [
  big('1 GW', 520, 460, { size: 180, color: COL.orange, at: '1 gigawatt' }),
  label('=', 900, 460, { size: 160, at: 'roughly' }),
  P('nuclear', { x: 1300, y: 560, s: 1.6, at: 'nuclear reactor' }),
  label('1 large nuclear reactor', 1300, 870, { size: 54, at: 'puts out' }),
]);
shot("So that's like needing about 30", [
  C('gridOf', { x: 860, y: 560, prop: 'nuclear', cols: 10, rows: 3, gx: 135, gy: 210, s: 0.42, in: 'none', per: 0.03 }),
  big('x30', 1680, 330, { size: 150, at: '30 nuclear' }),
  P('laptop', { x: 1680, y: 640, s: 0.7, at: 'computers' }),
]);
shot("One analysis of PJM's", [
  stick('analyst', 640, 'holdR', 'thinking', { hold: { prop: 'magnifier', s: 0.5, rot: -0.4 } }),
  P('paper', { x: 1150, y: 470, s: 1.2, a: { title: 'NEWER FORECAST', lines: 4, w: 300, size: 32 } }),
  label('...went even further', 1150, 160, { size: 62, at: 'further' }),
]);
shot('The energy research firm', [
  doc({ x: 760, y: 440, w: 1080, kicker: 'Modo Energy analysis', title: 'Without data centers, peak demand on PJM would be shrinking', body: "Strip the data centers out of PJM's newer forecast and peak demand on the grid would actually be going down, not up.", hl: [{ text: 'actually be going down,', at: 'found' }] }),
  peek('R', 'point>1100,330', 'shocked', { look: [1000, 330] }),
]);
shot("peak demand on PJM's grid", [
  label('with data centers', 520, 200, { size: 56, color: COL.green }),
  trend(520, 520, { w: 440, h: 300 }),
  label('without data centers', 1400, 200, { size: 56, color: COL.red, at: 'shrinking' }),
  trend(1400, 520, { w: 440, h: 260, down: true, at: 'shrinking', seed: 7 }),
]);
shot('That makes sense when you think', [
  mascot(960, 'think', 'thinking', { s: 0.9 }),
  P('bulb', { x: 1250, y: 300, s: 0.7, a: { on: true }, at: 'think' }),
]);
shot('Homes keep getting more efficient', [
  P('house', { x: 640, y: 560, s: 1.5 }),
  P('bulb', { x: 1150, y: 430, s: 0.9, a: { on: true }, at: 'efficient' }),
  label('more efficient', 1150, 200, { size: 72, color: COL.green, at: 'efficient' }),
  P('check', { x: 1550, y: 430, s: 0.9, at: 'efficient+0.3' }),
]);
shot("Maryland's top utility consumer advocate", [
  stick('advocate', 820, 'explain', 'serious', { talk: true, s: 1.25, y: 960 }),
  label("Maryland's consumer advocate", 960, 160, { size: 62 }),
  P('podium', { x: 820, y: 850, s: 1, in: 'none' }),
]);
shot('that regular demand barely grew', [
  C('bars', { x: 760, y: 470, w: 980, h: 560, title: 'Regular demand', sub: 'year after year', bars: [1, 2, 3, 4, 5].map((v, i) => ({ label: 'yr ' + v, value: 10 + (i % 2) * 0.3, text: ' ', color: '#9aa3ad', at: `barely+${(i * 0.08).toFixed(2)}` })), max: 14 }),
  label('barely grew', 760, 820, { size: 64, color: COL.red, at: 'grew' }),
  P('bulb', { x: 1550, y: 420, s: 1, a: { on: true }, at: 'light bulbs' }),
  label('efficient bulbs', 1550, 680, { size: 50, at: 'light bulbs' }),
]);
shot("So the party isn't just part", [
  C('pie', { x: 760, y: 470, r: 230, pct: 94, color: COL.orange, label: '' }),
  label('the growth', 760, 160, { size: 70 }),
  P('partyHat', { x: 820, y: 400, s: 0.8, at: 'party', rot: 0.2 }),
  mascot(1550, 'shrug', 'skeptical'),
]);
shot('The party is the growth', { punch: ['growth', 1.07] }, [
  big('THE PARTY', 960, 300, { size: 140, color: COL.purple }),
  big('= THE GROWTH', 960, 480, { size: 140, color: COL.orange, at: 'is the growth' }),
  C('confetti', { x: 960, y: 400, w: 1500, in: 'none' }),
]);
shot('And the bill for getting ready', restaurantBg(), [
  ...dinerTable({ face: ['neutral', 'shocked@already'] }),
  P('bill', { x: 1080, y: 560, s: 0.6, a: { receipt: true, title: 'GET READY FEE', titleSize: 28, w: 300, h: 300, total: '$$$' }, in: 'drop', at: 'bill' }),
  label('already here', 1450, 240, { size: 70, color: COL.red, at: 'already' }),
]);
shot('In July, PJM held', [
  P('calendar', { x: 420, y: 440, s: 1.2, a: { top: 'JULY', text: 'AUCTION', size: 46 } }),
  stick('pjm', 1100, 'holdUpR', 'excited', { hold: { prop: 'gavel', s: 0.5, rot: -0.5 } }),
  label('latest capacity auction', 1250, 170, { size: 60, at: 'latest' }),
]);
shot('this one for the year starting', [
  P('calendar', { x: 640, y: 460, s: 1.4, a: { top: 'STARTS JUNE', text: '2028', size: 80 } }),
  label('the year it pays for', 1350, 330, { size: 62, at: 'year starting' }),
  arrow([1300, 400], [820, 440], { at: 'June', color: COL.ink }),
]);
shot('It committed to paying power plants', [
  P('gasPlant', { x: 420, y: 600, s: 1 }),
  big('$16.4 BILLION', 1180, 330, { size: 130, color: COL.green, at: '$16.4' }),
  ...[0, 1, 2, 3].map(i => P('moneyBag', { x: 950 + i * 160, y: 640, s: 0.6, at: `billion+${(i * 0.12).toFixed(2)}` })),
]);
shot('That tied the record', [
  C('bars', { x: 760, y: 470, w: 900, h: 560, title: 'Capacity auction totals', bars: [{ label: 'Auction before', value: 10, text: 'record', color: COL.blue, at: 'record' }, { label: 'July auction', value: 10, text: 'record', color: COL.red, at: 'record+0.5' }], max: 12 }),
  stamp('TIED', 760, 300, { at: 'record+1.0', size: 100 }),
  mascot(1580, 'shrug', 'skeptical'),
]);
shot("Then the grid's independent watchdog", [
  stick('monitor', 760, 'holdR', 'serious', { hold: { prop: 'magnifier', s: 0.5, rot: -0.3 } }),
  label('independent watchdog', 760, 170, { size: 70, at: 'watchdog' }),
  P('eye', { x: 1400, y: 450, s: 0.9, at: 'weighed' }),
]);
shot("It's a firm called Monitoring Analytics", [
  P('office', { x: 560, y: 560, s: 1.2 }),
  P('sign', { x: 1200, y: 360, s: 1, a: { text: 'MONITORING ANALYTICS', w: 640, size: 46 }, at: 'Monitoring' }),
  stick('monitor', 1650, 'presentL', 'neutral'),
]);
shot('and its whole job', [
  stick('monitor', 520, 'point>1200,420', 'serious', { look: [1250, 450] }),
  P('magnifier', { x: 1200, y: 420, s: 1.2, idle: 'float' }),
  stick('pjm', 1350, 'rest', 'worried', { s: 0.9, at: 'markets' }),
  label("PJM's markets", 1350, 160, { size: 62, at: 'markets' }),
]);
shot('Its president, Joseph Bowring', [
  stick('monitor', 560, 'explain', 'serious', { talk: true }),
  label('Joseph Bowring', 560, 170, { size: 66, at: 'Bowring' }),
  label('president, market monitor', 560, 240, { size: 40, color: COL.grey, at: 'Bowring' }),
  C('bubble', { x: 1250, y: 380, text: '$6.3 billion\nfrom data centers', w: 560, h: 240, tail: 'bl', at: '$6.3', size: 54 }),
]);
shot("That's roughly 38%", [
  C('pie', { x: 700, y: 480, r: 250, pct: 38, color: COL.orange, label: '38%' }),
  label('of the entire auction', 700, 150, { size: 64 }),
  P('dataCenter', { x: 1450, y: 520, s: 0.9, at: 'one type' }),
  label('ONE type of customer', 1450, 760, { size: 56, color: COL.red, at: 'customer' }),
]);
shot("And that's with a price cap", [
  C('bars', { x: 760, y: 500, w: 700, h: 560, title: '', bars: [{ label: 'auction price', value: 100, text: ' ', color: COL.red }], max: 104, barW: 260, card: false }),
  wire([450, 338], [1080, 338], { sag: 0, color: COL.ink, lw: 12 }),
  label('CAP', 1190, 338, { size: 84, at: 'cap' }),
  mascot(1600, 'facepalm', 'cringe'),
]);
shot('PJM said that without the cap', [
  C('bars', { x: 760, y: 470, w: 980, h: 600, title: 'Total auction cost', bars: [{ label: 'With the cap', value: 16.4, text: '$16.4B', color: COL.blue }, { label: 'Without the cap', value: 29.5, text: 'almost $30B', color: COL.red, at: 'cleared' }], max: 33 }),
  peek('R', 'point>1100,300', ['neutral', 'shocked@$30'], { look: [1000, 300] }),
]);
shot('And after all that', [
  P('target', { x: 700, y: 470, s: 1.5 }),
  arrow([1350, 250], [920, 640], { at: 'fell short', color: COL.ink, bend: 0.1 }),
  label('reliability target', 700, 140, { size: 64 }),
  stamp('MISSED', 1300, 700, { at: 'short', size: 80 }),
]);
shot("So we're paying record prices", restaurantBg(), [
  ...dinerTable({ face: 'annoyed', joe: { hold: { prop: 'cash', s: 0.35 } }, pose: 'holdR' }),
  label('record prices', 1350, 220, { size: 70, color: COL.red, at: 'record prices' }),
  label('...still not enough tables', 1350, 320, { size: 52, at: 'still not' }),
]);
shot('Over the last four auctions', [
  ...[0, 1, 2, 3].map(i => P('gavel', { x: 300 + i * 220, y: 330, s: 0.5, at: `four+${(i * 0.12).toFixed(2)}` })),
  big('$29.4 BILLION', 760, 600, { size: 140, at: '$29.4' }),
  label('the data center bill', 760, 760, { size: 60, at: 'data center bill' }),
  stick('monitor', 1600, 'presentL', 'serious'),
]);
shot("That's almost half of everything", [
  C('pie', { x: 760, y: 480, r: 250, pct: 47, color: COL.red, label: '' }),
  label('ALMOST HALF', 760, 150, { size: 80, color: COL.red, at: 'half' }),
  label('of all capacity payments', 1450, 480, { size: 52, at: 'capacity' }),
]);
shot("Now here's the part that really fits", [
  P('restaurant', { x: 720, y: 560, s: 1.4, a: { name: 'PJM' } }),
  mascot(1550, 'one', 'smug'),
]);
shot('In the auction before this one', [
  stick('monitor', 440, 'explain', 'serious'),
  big('$6.5 BILLION', 1150, 330, { size: 130, at: '$6.5' }),
  label('driven by data centers', 1150, 480, { size: 60, at: 'costs' }),
  P('dataCenter', { x: 1150, y: 700, s: 0.7, at: 'drove' }),
]);
shot('and about $6.2 billion', [
  P('dataCenter', { x: 760, y: 560, s: 1.5, alpha: 0.28 }),
  big('$6.2 BILLION', 760, 260, { size: 120, at: '$6.2' }),
  stamp('NOT BUILT YET', 760, 600, { at: 'built', size: 90 }),
  mascot(1600, 'facepalm', 'cringe', { at: 'built' }),
]);
shot("The party hasn't arrived", [
  C('gridOf', { x: 700, y: 560, prop: 'tableSmall', cols: 4, rows: 3, gx: 200, gy: 150, s: 0.8, in: 'none', per: 0.02 }),
  P('bill', { x: 1450, y: 480, s: 1, a: { receipt: true, title: 'YOUR TAB', items: [['40 empty tables', '$$$']], w: 380, h: 320 }, at: 'tab' }),
]);
shot('Bowring has argued', [
  P('paper', { x: 600, y: 480, s: 1.4, a: { title: 'MAIN AUCTION', lines: 3, w: 330, size: 36 } }),
  P('dataCenter', { x: 600, y: 520, s: 0.4, move: [[1250, 470, 'pulled out', 0.8]] }),
  arrow([780, 400], [1150, 400], { at: 'pulled out', color: COL.ink }),
  stick('monitor', 1650, 'point>1250,450', 'serious', { look: [1250, 450] }),
]);
shot('and handled in a separate auction', [
  P('paper', { x: 520, y: 480, s: 1.2, a: { title: 'MAIN', lines: 4, w: 300 } }),
  P('paper', { x: 1200, y: 480, s: 1.2, a: { title: 'SEPARATE', lines: 0, w: 320, size: 36 }, at: 'separate' }),
  P('dataCenter', { x: 1200, y: 520, s: 0.4, at: 'separate' }),
  label('its own auction', 1200, 160, { size: 62, at: 'its own' }),
]);
shot('to, in his words', [
  P('quote', { x: 380, y: 360, s: 1, at: 'words' }),
  T('ensure that data centers\npay for their own capacity', { x: 960, y: 440, size: 84, at: 'ensure', type: true, typeDur: 1.6 }),
  stick('monitor', 1650, 'explain', 'serious', { s: 0.8 }),
]);
shot("The translation, whoever's", [
  C('board', { x: 760, y: 420, w: 940, h: 420, text: 'Cause the cost?\nPay the cost.', size: 84 }),
  mascot(1620, 'pointer>1150,420', 'neutral', { look: [1150, 420] }),
]);
shot("Right now, that's not how it works", [
  C('board', { x: 760, y: 420, w: 940, h: 420, text: 'Cause the cost?\nPay the cost.', size: 84, writeDur: 0.01 }),
  stamp('NOT HOW IT WORKS', 760, 640, { at: 'not how', size: 76 }),
  mascot(1620, 'cross', 'annoyed'),
]);
shot("And you don't even need a data center", [
  ...houses(4, 360, 620, 330, 0.8),
  P('dataCenter', { x: 1600, y: 300, s: 0.45, at: 'data center' }),
  P('xmark', { x: 1600, y: 300, s: 0.7, at: 'your town' }),
  P('bill', { x: 690, y: 320, s: 0.5, a: { total: '$$$' }, in: 'drop', at: 'hit' }),
]);
shot("Maryland's Office", [
  stick('advocate', 560, 'presentL', 'serious', { flip: true }),
  P('sign', { x: 1250, y: 360, s: 1, a: { text: "Office of People's Counsel", w: 700, size: 42 } }),
  label('represents utility customers', 1250, 700, { size: 54, at: 'represents' }),
]);
shot('says Marylanders are on the hook', [
  big('$1.6 BILLION', 760, 330, { size: 140, at: '$1.6' }),
  label('over the next decade', 760, 480, { size: 64, at: 'decade' }),
  ...houses(4, 340, 740, 280, 0.6),
  stick('advocate', 1640, 'explain', 'serious'),
]);
shot('for transmission projects', [
  ...houses(3, 760, 640, 200, 0.55),
  label('Maryland', 960, 400, { size: 70, color: COL.blue }),
  circ(960, 610, 330, 180, { color: COL.blue }),
  P('dataCenter', { x: 260, y: 360, s: 0.55, at: 'data centers' }),
  P('dataCenter', { x: 1660, y: 360, s: 0.55, at: 'data centers+0.2' }),
  label('other states', 260, 180, { size: 50, at: 'other states' }),
  label('other states', 1660, 180, { size: 50, at: 'other states' }),
  P('tower', { x: 470, y: 600, s: 0.6, at: 'transmission' }), P('tower', { x: 1450, y: 600, s: 0.6, at: 'transmission' }),
  wire([300, 420], [440, 530], { at: 'projects' }), wire([500, 530], [700, 600], { at: 'projects' }),
  wire([1620, 420], [1480, 530], { at: 'projects' }), wire([1420, 530], [1220, 600], { at: 'projects' }),
  label('$', 620, 470, { size: 80, color: COL.green, at: 'driven', idle: 'bob' }), label('$', 1300, 470, { size: 80, color: COL.green, at: 'driven', idle: 'bob' }),
]);
shot('For homes, it works out', [
  P('house', { x: 560, y: 560, s: 1.4 }),
  big('$345', 1200, 400, { size: 200, at: '$345' }),
  label('per customer', 1200, 580, { size: 68, at: 'customer' }),
]);
shot("It's like getting a split-the-bill", [
  P('phone', { x: 1150, y: 470, s: 1.5, a: { request: '$345' }, idle: 'shake', at: 'split-the-bill' }),
  stick('joe', 520, 'scratch', 'confused'),
  label("a dinner you didn't go to", 1150, 120, { size: 58, at: 'dinner' }),
]);
shot("in a state you don't even live in", [
  P('restaurant', { x: 1400, y: 540, s: 1 }),
  P('house', { x: 420, y: 580, s: 1 }),
  arrow([600, 500], [1180, 500], { at: 'state', color: COL.ink, bend: 0.2 }),
  label('not your state', 900, 260, { size: 64, color: COL.red, at: 'live' }),
]);
shot("And it's not just transmission", [
  P('tower', { x: 600, y: 520, s: 1.2 }),
  label('not just this', 600, 140, { size: 70, at: 'just' }),
  mascot(1450, 'one', 'serious'),
]);
shot('When Bloomberg analyzed', [
  doc({ x: 760, y: 440, w: 1080, kicker: 'Bloomberg analysis', title: 'Wholesale power prices near data centers', body: 'In areas near major data center activity, wholesale electricity cost as much as 267% more for a single month than it did five years earlier.', hl: [{ text: 'as much as 267% more', at: 'analyzed+0.6' }] }),
  peek('R', 'point>1100,330', 'neutral', { look: [1000, 330] }),
]);
shot('it found that in areas', [
  P('dataCenter', { x: 760, y: 420, s: 1.1 }),
  ...houses(3, 360, 760, 400, 0.6),
  circ(760, 560, 620, 330, { at: 'near', color: COL.orange }),
  label('near data center activity', 760, 160, { size: 60, at: 'activity' }),
]);
shot('electricity cost as much as', [
  C('bars', { x: 760, y: 470, w: 960, h: 620, title: 'Wholesale power price (one month)', bars: [{ label: '5 years earlier', value: 1, text: 'then', color: COL.blue, at: 'cost' }, { label: 'Now', value: 3.67, text: '+267%', color: COL.red, at: '267%' }], max: 4 }),
  mascot(1600, 'point>1000,300', ['neutral', 'shocked@267%'], { look: [1000, 300] }),
]);
shot('Now, to be fair, capacity charges', [
  C('pie', { x: 700, y: 480, r: 250, pct: 18, color: COL.orange, label: '' }),
  label('your bill', 700, 150, { size: 70 }),
  label('capacity = one slice', 1400, 400, { size: 60, color: COL.orange, at: 'slice' }),
  arrow([1180, 430], [860, 340], { at: 'slice', color: COL.orange }),
]);
shot('PJM itself has estimated', [
  stick('pjm', 420, 'explain', 'neutral'),
  P('bill', { x: 960, y: 500, s: 1, a: { total: '$$$' } }),
  big('+1.5% to 5%', 1450, 400, { size: 110, at: '1.5' }),
  label('some household bills', 1450, 540, { size: 52, at: 'household' }),
]);
shot('But capacity is just the first domino', [
  ...[0, 1, 2, 3, 4, 5].map(i => P('domino', { x: 360 + i * 230, y: 560, s: 1.1, pivot: 90, tip: 1.25, tipAt: `domino+${(0.15 + i * 0.16).toFixed(2)}`, in: 'none', a: { label: i === 0 ? 'capacity' : '' } })),
]);
shot('All the new power plants', [
  P('gasPlant', { x: 420, y: 600, s: 0.9, at: 'plants' }),
  P('tower', { x: 980, y: 540, s: 1, at: 'lines' }),
  stick('worker', 1200, 'holdR', 'neutral', { hold: { prop: 'wrench', s: 0.4, rot: -0.6 } }),
  P('bill', { x: 1580, y: 470, s: 0.8, a: { total: '$$$' }, at: 'paid' }),
  label('have to be paid for', 1580, 160, { size: 54, at: 'paid' }),
]);
shot('The consulting firm ICF', [
  doc({ x: 760, y: 440, w: 1080, kicker: 'ICF estimate', title: 'PJM residential rates could climb 30% to 60% by 2030', body: 'Residential electricity rates across the PJM region could climb 30 to 60 percent by 2030, as new plants and lines get paid for.', hl: [{ text: 'climb 30 to 60 percent by 2030,', at: 'rates' }] }),
  peek('R', 'point>1100,330', 'worried', { look: [1000, 330] }),
]);
shot('could climb 30 to 60', [
  big('+30% to 60%', 760, 400, { size: 150, at: '30' }),
  label('residential rates, PJM region', 760, 560, { size: 56 }),
  P('calendar', { x: 1500, y: 450, s: 1.1, a: { top: 'BY', text: '2030', size: 70 }, at: '2030' }),
  trend(760, 760, { w: 520, h: 120, color: COL.red, at: '60', lw: 10 }),
]);

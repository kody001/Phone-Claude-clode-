'use strict';
// ===== Part B: downsizing -> the tax cap -> insurance & property tax (6:26 - 11:07) =====

S('Now the obvious answer', a => [
  m(450, 'chin', 'confused'),
  pr('bubble', 1220, 330, 1.1, { think: 1, text: '"Fine.\nJust downsize."', size: 66, w: 480, h: 280, t: a('Fine') }),
]);
S('Sell the big house', a => [
  pr('house', 400, 600, 1.25, { v: 'big', sale: 1 }),
  pr('arrow', 860, 560, 1, { pts: [[-120, 0], [120, 0]], c: COL.ink, lw: 12, t: a('buy') }),
  pr('house', 1240, 640, 0.8, { v: 'small', t: a('smaller') - 0.2 }),
  pr('moneyBag', 1620, 600, 1.0, { enter: 'drop', t: a('pocket') }),
  lb('+ the difference', 1620, 330, 66, { t: a('pocket'), c: COL.green }),
]);
S("That's been the retirement plan", a => [
  sk('boomer', 460, 'rest', 'smile'), sk('boomerWife', 680, 'rest', 'smile'),
  pr('doc', 1180, 540, 1.6, { title: 'RETIREMENT PLAN', c: COL.blue }),
  pr('palm', 1620, 620, 1.1),
  lb('for decades', 1180, 190, 80, { t: a('decades') }),
]);
S('Except smaller', a => [
  m(430, 'pointR', 'skeptic'),
  pr('house', 1200, 620, 1.1, { v: 'condo' }),
  pr('tag', 1480, 330, 0.9, { text: '$$$', t: 0.4 }),
  lb("smaller =/= cheaper", 1150, 170, 84, { t: a('cheaper') }),
]);
S('In October, the median', a => [
  lb('median single-family home (October)', 960, 150, 64),
  pr('house', 620, 600, 1.4, { v: 'big' }),
  big('$421,900', 1360, 450, { size: 150, c: COL.orange, t: a('$421,900') - 0.2 }),
]);
S('The median condo', a => [
  lb('median condo', 960, 150, 70),
  pr('house', 620, 590, 1.3, { v: 'condo' }),
  big('$365,100', 1360, 450, { size: 150, c: COL.teal, t: a('$365,100') - 0.2 }),
]);
S("That's a difference of", a => [
  bars({ x: 900, y: 540, w: 1000, h: 440, bw: 260, max: 480000, vsize: 58, d: 0.4, stagger: 0.15, items: [
    { label: 'Single-family', v: 421900, txt: '$421,900', c: COL.orange }, { label: 'Condo', v: 365100, txt: '$365,100', c: COL.teal }] }),
  lb('difference:', 1600, 300, 64, { t: 0.4 }),
  big('~$57,000', 1600, 420, { size: 100, t: a('$57,000') - 0.2 }),
]);
S('And what did it cost to sell', a => [
  bars({ x: 900, y: 530, w: 900, h: 450, bw: 250, max: 95000, items: [
    { label: 'You SAVE', v: 57000, txt: '$57K', c: COL.green }, { label: 'Cost to SELL', v: 82000, txt: '$82K', c: COL.red, at: a('$82,000') - 0.3 }] }),
  peek('R', [[0, 'neutral'], [a('$82,000'), 'shock']]),
]);
S('The translation for', a => transl());
S("the money you'd SAVE", a => [
  lb('your savings...', 420, 260, 66),
  pr('moneyBag', 420, 560, 1.2, { move: { x: 1250, s: 0.2, t: a('eaten') - 0.2, d: 0.9, e: 'in' } }),
  pr('truck', 1350, 590, 1.3, { label: 'MOVING' }),
  lb('...eaten by the cost of the move', 1150, 190, 66, { t: a('eaten') }),
]);
S('You end up with less house', a => [
  sk('boomer', 420, 'sad', 'sad'),
  pr('house', 900, 650, 0.75, { v: 'small' }), lb('less house', 900, 290, 72, { t: a('less house') }),
  pr('piggy', 1460, 650, 0.65), lb('AND less money', 1460, 290, 72, { t: a('less money'), c: COL.red }),
]);
S('Which is not exactly the dream', a => [
  draw({}, ctx => rect(ctx, 880, 180, 820, 660, { fill: '#fffbea', w: 6, seed: 4 })),
  lb('RETIREMENT DREAM', 1290, 250, 64, { font: 'marker', c: COL.orange }),
  pr('palm', 1100, 590, 1.1), pr('sun', 1500, 420, 0.8),
  sk('boomerWife', 1450, 'cheer', 'grin', { s: 0.5, y: 810 }),
  X(1290, 520, 2.4, a('brochure'), { alpha: 0.85 }),
  peek('L', 'laugh'),
]);
S("And then theres the tax", a => [
  lb('the tax nobody sees coming...', 960, 170, 78),
  sk('boomer', 620, 'rest', 'smile'),
  sk('taxman', 1300, 'rest', 'smirk', { enter: 'none', move: { fromX: 2150, x: 1300, t: 0.1, d: 1.5, e: 'out' }, walk: lt => lt < 1.5 }),
]);
S('When you sell your main home', a => [
  sk('taxman', 300, 'holdR', 'flat', { hold: { R: holdProp('clipboard', 0.45, { title: 'IRS' }) } }),
  lb('tax-free profit when you sell', 1150, 170, 70, { t: a('exclude') }),
  pr('shield', 880, 470, 1.35, { text: '$250K', c: COL.green, size: 46, t: a('$250,000') - 0.2 }), lb('single', 880, 720, 72, { t: a('single') }),
  pr('shield', 1440, 470, 1.35, { text: '$500K', c: COL.green, size: 46, t: a('$500,000') - 0.2 }), lb('married', 1440, 720, 72, { t: a('married') }),
]);
S('Anything above that', a => [
  lb('your profit', 960, 260, 80),
  stackbar({ x: 960, y: 520, w: 1400, h: 140, lsize: 46, segs: [
    { v: 500, c: COL.green, label: 'tax-free (up to the limit)', txt: 'EXCLUDED', at: 0.1 },
    { v: 350, c: COL.red, label: 'capital gains tax', txt: 'TAXED', at: a('taxed') - 0.2 }] }),
  sk('taxman', 1700, 'rest', 'grin', { s: 0.6, t: a('taxed') }),
]);
S('That limit was set in 1997', a => [
  m(420, 'pointR', 'serious'),
  pr('doc', 1180, 560, 1.6, { title: 'TAX LAW', c: COL.dgreen }),
  big('1997', 1180, 190, { size: 160, c: COL.blue, t: a('1997') }),
]);
S('The same year Titanic', a => [
  draw({}, ctx => { ctx.fillStyle = '#7cc0e6'; ctx.fillRect(-200, 600, W + 400, 600); }),
  pr('ship', 880, 560, 1.5), pr('iceberg', 1590, 560, 1.2),
  lb('same year...', 960, 180, 80),
  peek('L', 'laugh'),
]);
S('And it has NEVER been raised', a => [
  lb('frozen since 1997', 960, 170, 84),
  pr('ice', 960, 520, 2.3),
  lb('$250K / $500K', 960, 790, 70),
  peek('R', 'surprise'),
]);
S('Not once', a => [
  big('NOT ONCE.', 960, 190, { size: 130 }),
  m(960, 'shrug', 'surprise', { s: 0.85 }),
]);
S('Since then', a => [
  pr('house', 380, 720, 0.8),
  pr('zig', 960, 560, 1.2, { dir: 'up' }),
  big('+260%', 1320, 250, { size: 170, c: COL.green, t: a('260%') }),
  lb('home values since 1997', 960, 830, 62, { t: a('home values') }),
]);
S('If that limit had simply', a => [
  lb('if the limit had kept up with inflation...', 960, 140, 60),
  bars({ x: 960, y: 540, w: 1400, h: 430, bw: 190, max: 1150000, vsize: 50, lsize: 36, items: [
    { label: 'Single (today)', v: 250000, txt: '$250K', c: '#a9adb2' },
    { label: 'Single (indexed)', v: 520000, txt: '$500K+', c: COL.green, at: a('singles') - 0.3 },
    { label: 'Married (today)', v: 500000, txt: '$500K', c: '#a9adb2', at: a('MILLION') - 0.8 },
    { label: 'Married (indexed)', v: 1040000, txt: '$1M+', c: COL.green, at: a('MILLION') - 0.2 }] }),
]);
S('Instead... according to the National', a => [
  card({ x: 1100, y: 470, w: 1150, h: 540, src: 'NATIONAL ASSOCIATION OF REALTORS', tag: 'Capital gains', title: "A third of homeowners already exceed the $250,000 exclusion",
    body: ['34% of homeowners, about 29 million people, already have gains above the $250,000 cap.', 'By 2030, that share could reach 56%.'], hl: [{ p: 0, at: 0.9, d: 2.0 }] }),
  peek('L', 'serious', 'stickR'),
], { z0: 1, z1: 1.05, cx: 1100, cy: 470 });
S('34% of homeowners', a => [
  pie({ x: 760, y: 470, p: 0.34, c: COL.red, label: '34%', r: 230 }),
  lb('of homeowners', 760, 780, 64),
  big('~29 MILLION', 1420, 360, { size: 100, t: a('29 million') }),
  lb('people', 1420, 470, 64, { t: a('29 million') + 0.2 }),
  lb('ALREADY over the $250K cap', 1420, 600, 58, { t: a('ALREADY'), c: COL.red }),
]);
S('And by 2030', a => [
  m(420, 'pointR', 'surprise'),
  lb('by 2030', 1180, 150, 96, { font: 'marker', c: COL.blue }),
  pie({ x: 1180, y: 480, p: 0.56, c: COL.red, label: '56%', r: 230 }),
  lb('of homeowners could be over', 1180, 790, 56, { t: 0.6 }),
]);
S('More than half of all homeowners', a => [
  icons({ x: 960, y: 470, n: 10, k: 6, icon: 'person', size: 0.55, gap: 165, on: COL.red, hiAt: 0.5, stagger: 0.04 }),
  lb('MORE than half', 960, 170, 86),
  lb('over the limit', 960, 760, 80, { t: a('limit'), c: COL.red }),
]);
S("And it's not just a problem on paper", a => [
  pr('sign', 620, 580, 1.4, { sold: 1 }),
  lb('real sales, real tax bills', 1250, 300, 72, { t: 0.4 }),
  m(1350, 'stop', 'determined', { s: 0.7 }),
]);
S('In the early 2000s', a => [
  lb('home sales a year with gains above even $500K', 960, 150, 60),
  sk('boomer', 420, 'rest', 'smile'),
  big('< 40,000', 1200, 420, { size: 170, c: COL.orange, t: a('40,000') - 0.2 }),
  lb('early 2000s', 1200, 600, 70),
]);
S('By 2022', a => [
  lb('sales a year with gains above $500K', 1000, 140, 58),
  bars({ x: 1000, y: 540, w: 950, h: 440, bw: 260, max: 260000, d: 0.5, items: [
    { label: 'Early 2000s', v: 40000, txt: '<40,000', c: COL.orange, at: 0 }, { label: '2022', v: 230000, txt: '230,000+', c: COL.red, at: 0.3 }] }),
  m(250, 'pointR', 'surprise', { s: 0.7 }),
]);
S('In California', a => [
  pr('welcome', 480, 560, 1.35, { text: 'CALIFORNIA', c: COL.orange }),
  icons({ x: 1300, y: 520, n: 4, k: 1, icon: 'house', size: 0.62, gap: 210, on: COL.tan, hiAt: a('1 in 4') }),
  lb('more than 1 in 4 sales', 1300, 770, 72, { t: a('1 in 4'), c: COL.red }),
]);
S('The Niskanen Center', a => [
  card({ x: 1100, y: 470, w: 1150, h: 540, src: 'NISKANEN CENTER', tag: 'Analysis', title: 'A couple who bought in 1995 for $250,000',
    body: ['Their home could sell today for $1.1 million.', 'Even after the $500,000 exclusion, $350,000 of the gain is still taxable.'], hl: [{ p: 0, at: a('$250,000') + 0.5, d: 1.4 }] }),
  peek('L', 'serious', 'stickR'),
], { z0: 1, z1: 1.05, cx: 1100, cy: 470 });
S('and could sell today', a => [
  sk('boomer', 300, 'rest', 'smile', { s: 0.7 }), sk('boomerWife', 470, 'rest', 'smile', { s: 0.7 }),
  pr('house', 960, 600, 1.3),
  pr('tag', 760, 300, 0.85, { text: '$250K', size: 44, r: 10 }), lb('1995', 700, 410, 60),
  pr('tag', 1380, 300, 1.0, { text: '$1.1M', size: 54, t: a('$1.1 million'), c: COL.green, tc: COL.ink }), lb('today', 1380, 420, 60, { t: a('$1.1 million') }),
]);
S('Even after their', a => [
  lb('their gain: $850,000', 960, 250, 80),
  stackbar({ x: 960, y: 520, w: 1500, h: 140, lsize: 46, segs: [
    { v: 500, c: COL.green, label: 'excluded', txt: '$500K', at: 0.3 }, { v: 350, c: COL.red, label: 'still taxable', txt: '$350K', at: a('$350,000') - 0.2 }] }),
]);
S('Federal tax bill', a => [
  pr('taxForm', 560, 560, 1.6),
  big('$70,000+', 1220, 420, { size: 190, t: a('$70,000') }),
  lb('federal tax bill', 1220, 610, 70, { t: 0.3 }),
  sk('taxman', 1700, 'rest', 'grin', { s: 0.65 }),
]);
S("But here's the part", a => [
  big('WILD', 1150, 470, { size: 260, c: COL.purple, t: a('WILD') }),
  peek('L', 'disgust'),
]);
S('If that same couple NEVER sells', a => [
  sk('boomer', 420, 'rest', 'smile'), sk('boomerWife', 640, 'rest', 'smile'),
  pr('house', 1250, 600, 1.2),
  pr('sign', 1560, 650, 0.8, { t: 0.2 }), X(1560, 620, 1.1, a('NEVER') + 0.2),
]);
S('and passes the house down', a => [
  pr('house', 520, 600, 1.0), pr('gift', 960, 600, 1.1, { t: a('down') }),
  sk('heirA', 1380, 'cheer', 'grin', { t: a('kids') }), sk('heirB', 1620, 'cheer', 'grin', { t: a('kids') + 0.15 }),
]);
S('the kids inherit it', a => [
  pr('taxForm', 960, 540, 1.7),
  lb('gains: wiped clean', 960, 180, 80, { t: a('wiped') }),
  X(960, 540, 2.0, a('wiped') + 0.2),
]);
S('Zero tax', a => [
  sk('heirA', 330, 'cheer', 'laugh'), sk('heirB', 1590, 'cheer', 'laugh'),
  big('$0 TAX', 960, 440, { size: 240, c: COL.green }),
]);
S('The translation the tax code', a => [
  m(330, 'stickR', 'disgust'),
  pr('board', 1200, 420, 1, { text: 'MOVE  =  $70,000 tax\nSTAY till you die  =  $0', size: 70, wt: Math.max(0.1, a('$70,000') - 0.6), wd: 3.2 }),
]);
S('Washington has noticed', a => [
  pr('capitol', 960, 580, 1.8),
  lb('Washington has noticed.', 960, 170, 84),
]);
S('Just last week, two Republicans', a => [
  sk('repA', 400, 'holdR', 'smile', { hold: { R: holdProp('bill_scroll', 0.5, { title: 'H.R.' }) } }),
  sk('repB', 640, 'present', 'smile'),
  lb('House Ways & Means bill', 1320, 180, 64),
  lb('DOUBLE the exclusion', 1320, 300, 78, { t: a('double'), c: COL.green }),
  lb('$250K  ->  $500K', 1320, 460, 72, { t: a('double') + 0.4 }),
  lb('$500K  ->  $1M', 1320, 570, 72, { t: a('double') + 0.7 }),
]);
S('A bipartisan version', a => [
  pr('bill_scroll', 420, 560, 1.6, { title: 'BIPARTISAN' }),
  icons({ x: 1250, y: 540, n: 12, k: 12, icon: 'person', cols: 6, size: 0.42, gap: 120, on: COL.blue, stagger: 0.06 }),
  lb('90+ co-sponsors', 1250, 220, 86, { t: a('90') }),
]);
S('Supporters say', a => [
  sk('agentB', 380, 'cheer', 'grin'),
  lb('more homes for sale', 1220, 220, 78, { t: a('more homes') }),
  pr('house', 860, 620, 0.8, { sale: 1, t: a('more homes') }), pr('house', 1220, 620, 0.8, { sale: 1, t: a('more homes') + 0.15, wall: '#c9b28f' }), pr('house', 1580, 620, 0.8, { sale: 1, t: a('more homes') + 0.3, wall: '#b9cfa0' }),
]);
S('Critics point out', a => [
  sk('econB', 360, 'pointR', 'confused'),
  lb('biggest winners: higher-income owners', 1120, 180, 60, { t: a('biggest winners') }),
  pr('moneyBag', 900, 560, 1.15, { t: a('higher-income') }),
  pr('pct', 1360, 560, 0.85, { t: a('rates or prices') }), pr('tag', 1680, 560, 0.7, { text: 'PRICE', r: 0, t: a('rates or prices') + 0.2 }),
  X(1360, 560, 1.0, a('rates or prices') + 0.6), X(1680, 560, 1.0, a('rates or prices') + 0.75),
]);
S('Either way', a => [
  m(400, 'shrug', 'serious'),
  pr('ice', 1150, 520, 2.0),
  lb('$250K / $500K cap', 1150, 790, 64),
  lb("hasn't moved", 1150, 180, 80, { t: a("hasn't moved") }),
]);
S('And neither have the homeowners', a => [
  pr('house', 1250, 580, 1.3),
  pr('chair', 520, 845, 1.1, { c: '#7a4a2a' }), sk('boomer', 520, 'rest', 'smile', { sit: 1 }),
  pr('chair', 800, 845, 1.1, { c: '#7a4a2a' }), sk('boomerWife', 800, 'rest', 'smile', { sit: 1 }),
  lb('...neither have the homeowners', 960, 170, 70),
]);
S('And even if you get past the rate', a => [
  pr('pct', 650, 760, 0.7), OK(650, 600, 0.5, a('rate') + 0.3),
  pr('tag', 1000, 760, 0.55, { text: 'FEES', r: 0, t: a('fees') - 0.2 }), OK(1000, 600, 0.5, a('fees') + 0.3),
  pr('taxForm', 1350, 760, 0.5, { t: a('tax') - 0.2 }), OK(1350, 600, 0.5, a('tax') + 0.3),
  sk('husband', 250, null, 'determined', { walk: lt => lt < 5, move: { x: 1700, t: 0, d: 5, e: 'lin' } }),
  lb('...the new house costs more just to EXIST in', 960, 170, 64, { t: a('EXIST') - 0.6 }),
]);
S('Home insurance is up 46%', a => [
  sk('insurer', 430, 'holdR', 'smirk', { hold: { R: holdProp('shield', 0.5, { text: 'INS.' }) } }),
  big('+46%', 1220, 380, { size: 230, t: a('46%') }),
  lb('home insurance since 2021', 1220, 600, 66, { t: a('since 2021') }),
  lb('(Insurify)', 1220, 690, 52, { t: a('Insurify'), c: '#7a828c' }),
]);
S("That's about THREE times inflation", a => [
  bars({ x: 960, y: 540, w: 900, h: 440, bw: 250, max: 50, items: [
    { label: 'Home insurance', v: 46, txt: '+46%', c: COL.red }, { label: 'Inflation', v: 15.3, txt: '~1/3 of that', c: '#a9adb2', at: a('inflation') - 0.2, vsize: 48 }] }),
  lb('about THREE times inflation', 960, 140, 70, { t: a('THREE') }),
  peek('R', 'surprise'),
]);
S('The average policy', a => [
  pr('shield', 560, 540, 1.6, { text: 'POLICY', size: 36 }),
  big('$3,000', 1240, 410, { size: 210 }),
  lb('a year, on average', 1240, 610, 70, { t: 0.3 }),
]);
S('In Florida', a => [
  pr('welcome', 420, 560, 1.25, { text: 'FLORIDA' }),
  sk('floridian', 860, 'shrug', 'worried'),
  big('$8,500', 1440, 380, { size: 180, t: a('$8,500') - 0.2 }),
  lb('a year', 1440, 560, 70, { t: a('$8,500') }),
  pr('palm', 1790, 650, 0.8),
]);
S('And when you buy a new house', a => [
  pr('house', 420, 620, 1.0),
  pr('shield', 1000, 520, 1.3, { text: 'NEW', size: 44 }),
  pr('tag', 1450, 330, 1, { text: "TODAY'S $", size: 40, t: a("TODAY'S") }),
  pr('doc', 1480, 640, 0.9, { title: 'DEDUCTIBLE', t: a('deductibles') }),
]);
S('In hurricane areas', a => [
  pr('hurricane', 620, 400, 1.4),
  pr('house', 620, 730, 0.8),
  big('$10,000+', 1300, 410, { size: 180, t: a('$10,000') }),
  lb('hurricane deductible alone', 1300, 600, 64, { t: a('deductible') }),
]);
S("Then there's property tax", a => [
  lb('Property tax', 960, 170, 96),
  pr('house', 600, 620, 1.1),
  pr('doc', 1200, 560, 1.6, { title: 'PROPERTY TAX', c: COL.dgreen }),
]);
S('In California, under Prop 13', a => [
  pr('welcome', 420, 520, 1.25, { text: 'CALIFORNIA', c: COL.orange }),
  sk('californian', 820, 'present', 'smile'),
  lb('Prop 13', 1420, 230, 110, { font: 'marker', c: COL.blue, t: a('Prop 13') }),
  lb('assessed value: max +2% a year', 1420, 400, 58, { t: a('2%') }),
  lb('...for as long as you own it', 1420, 500, 56, { t: a('as long') }),
]);
S('But the moment you sell', a => [
  lb('the new owner', 560, 210, 72),
  sk('firstBuyer', 560, 'holdR', [[0, 'smile'], [a('full price'), 'shock']], { hold: { R: holdProp('taxForm', 0.5) } }),
  lb('taxed on the FULL price', 1300, 380, 78, { t: a('full price'), c: COL.red }),
  pr('tag', 1300, 590, 1, { text: 'FULL $$$', t: a('full price') }),
]);
S('So the longer you stay', a => [
  sketchLine({ x: 1020, y: 530, w: 1100, h: 460, pts: [[-540, 200], [-200, 90], [150, -50], [540, -200, 'market value', -50, -60, COL.dgreen]], c: COL.green, d: 2.0 }),
  sketchLine({ x: 1020, y: 530, w: 1100, h: 460, axes: false, pts: [[-540, 200], [540, 120, 'taxed value (+2%/yr)', 56, -80, COL.blue]], c: COL.blue, d: 2.0 }),
  pr('arrow', 1420, 500, 1, { pts: [[0, 120], [0, -120]], c: COL.red, lw: 8, t: a('discount') }),
  lb('your "discount"', 1600, 480, 56, { t: a('discount'), c: COL.red }),
  lb('...and the more it costs to leave', 1000, 140, 62, { t: a('expensive') }),
]);
S("That's a big part of why", a => [
  lb('typical homeowner in Los Angeles (Redfin)', 960, 150, 62),
  pr('palm', 420, 620, 1.2), sk('californian', 700, 'rest', 'smile'),
  big('20 YEARS', 1320, 430, { size: 170, t: a('20 YEARS') - 0.2 }),
  lb('in the same house', 1320, 610, 70, { t: a('20 YEARS') + 0.3 }),
]);
S('Nationally', a => [
  lb('how long the typical owner stays (Redfin)', 1050, 140, 56),
  bars({ x: 1080, y: 540, w: 1050, h: 450, bw: 230, max: 22, vsize: 54, items: [
    { label: '2005 (US)', v: 6.5, txt: '6.5 yrs', c: '#a9adb2', at: a('six and a half') - 0.2 },
    { label: 'US today', v: 12, txt: '12 yrs', c: COL.orange, at: a('12') - 0.2 },
    { label: 'Los Angeles', v: 20, txt: '20 yrs', c: COL.red, at: 0 }] }),
  m(250, 'pointR', [[0, 'serious'], [a('six and a half'), 'surprise']], { s: 0.72 }),
]);
S("We've nearly doubled", a => [
  m(480, 'rest', 'serious', { s: 1.0 }),
  big('2x', 1260, 390, { size: 300 }),
  lb('how long we stay put', 1260, 630, 72),
  pr('hourglass', 1660, 300, 0.7),
]);
S("And here's how you KNOW", a => [
  m(400, 'pointR', 'smirk'),
  pr('capitol', 1180, 600, 1.5),
  lb('lawmakers KNOW', 1180, 180, 88, { t: a('KNOW') }),
]);
S('Florida has a similar cap', a => [
  pr('welcome', 360, 560, 1.15, { text: 'FLORIDA' }),
  pr('house', 1700, 620, 0.95, { wall: '#f5d5a0' }),
  sk('floridian', 760, 'carry', 'grin', { hold: { R: holdProp('box', 0.45, { label: 'TAX BREAK' }, -60, -10) }, move: { x: 1300, t: a('carry'), d: 2.2, e: 'lin' }, walk: lt => lt > a('carry') && lt < a('carry') + 2.2 }),
  lb('carry up to $500K of the break with you', 1080, 170, 60, { t: a('$500,000') }),
]);
S('California passed Prop 19', a => [
  lb('Prop 19 (55 and older)', 1050, 170, 86, { font: 'marker', c: COL.blue }),
  sk('oldMom', 430, 'holdR', 'smile', { hold: { R: holdProp('doc', 0.5, { title: 'OLD TAX BILL' }) } }),
  sk('oldDad', 680, 'rest', 'smile'),
  pr('arrow', 1060, 600, 1, { pts: [[-150, 0], [150, 0]], c: COL.green, lw: 12, t: a('take') }),
  pr('house', 1480, 620, 1.1, { t: a('take') }),
]);
S("You don't build an escape hatch", a => [
  pr('hatch', 560, 580, 1.4),
  pr('cage', 1150, 560, 1.4, { inner: 'house', t: a('cage') - 0.2 }),
  peek('R', 'determined'),
]);
S('Put it all together', a => [
  m(330, 'stickR', 'serious'),
  pr('board', 1200, 420, 1, { text: 'The Great\nHousing Mismatch', size: 96, wt: Math.max(0.1, a('Great') - 0.3) }),
]);

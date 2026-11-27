'use strict';
// ===== Part A: cold open -> the cost of selling -> timing (0:00 - 6:26) =====
const holdProp = (name, sc, o = {}, dx = 0, dy = 0) => (c) => { c.translate(dx, dy); c.scale(sc, sc); PROPS[name](c, o); };

S('@start', a => [
  lb('Existing home sales', 1150, 150, 76, { t: 0.1 }),
  pr('house', 760, 600, 0.85, { sold: 1, t: 0.05 }),
  pr('house', 1150, 600, 0.85, { wall: '#c9b28f', roof: '#7b5c4a', t: 0.2, seed: 9 }),
  pr('house', 1540, 600, 0.85, { sold: 1, t: 0.35, wall: '#b9cfa0', seed: 5 }),
  pr('zig', 1150, 420, 1.15, { dir: 'down', t: a('FEWER'), enter: 'none' }),
  peek('L', [[0, 'neutral'], [a('FEWER'), 'shock']], 'rest'),
]);
S('since 2010', a => [
  m(380, 'stickR', 'serious'),
  lb('LOWEST since', 1250, 270, 90, { t: 0 }),
  big('2010', 1250, 500, { size: 270, t: 0.15 }),
]);
S('Sales fell', a => [
  m(330, 'stickR', 'serious'),
  lb('homes sold per year (annual pace)', 1200, 230, 60),
  counter({ x: 1200, y: 430, from: 5.25, to: 3.75, fmt: v => v.toFixed(2) + ' MILLION', size: 140, t: a('3.75') - 0.3, d: 1.1 }),
  pr('zig', 1200, 690, 0.55, { dir: 'down', t: a('3.75') }),
]);
S('For a country this size', a => [
  pr('flag', 380, 520, 1.25),
  bars({ x: 1200, y: 500, w: 950, h: 430, bw: 240, items: [
    { label: 'NORMAL year', v: 5.25, txt: '5-5.5M', c: COL.green, at: a('NORMAL') },
    { label: 'Last month', v: 3.75, txt: '3.75M', c: COL.red, at: a('half million') + 0.4 }] }),
]);
S("And it's not turning around", a => [
  m(450, 'shrug', 'serious'),
  pr('arrow', 1250, 560, 1, { pts: [[-150, 140], [-150, -40], [-100, -130], [0, -160], [100, -130], [150, -40], [150, 90]], c: COL.green, lw: 14, t: 0.1 }),
  X(1250, 520, 1.5, a('turning') + 0.25),
  lb('no turnaround', 1250, 830, 64, { t: a('turning') + 0.3 }),
]);
S('Pending sales', a => [
  sk('seller', 380, 'holdR', 'worried', { hold: { R: holdProp('doc', 0.45, { title: 'CONTRACT', c: COL.blue }) } }),
  pr('doc', 980, 500, 1.3, { title: 'CONTRACT', c: COL.blue, rot: -6 }),
  pr('doc', 1060, 520, 1.3, { title: 'CONTRACT', c: COL.blue, t: 0.15, rot: 4 }),
  lb('Pending sales', 1020, 190, 84),
  lb('(contracts signed in October)', 1020, 760, 54, { t: a('October') }),
  big('-17%', 1560, 450, { size: 200, t: a('17%') }),
  pr('zig', 1560, 680, 0.45, { dir: 'down', t: a('17%') + 0.1 }),
]);
S("you'd think", a => [
  m(380, 'chin', 'skeptic'),
  pr('bubble', 1020, 290, 1, { think: 1, text: 'Broke?', size: 84, w: 380, h: 220, tail: 'bl' }),
  sk('husband', 1460, 'shrug', 'worried', { t: a('homeowners') }),
  pr('piggy', 1020, 700, 0.75, { t: a('broke') }),
  X(1020, 700, 1.2, a('broke') + 0.3),
]);
S("That they can't afford to buy", a => [
  pr('house', 450, 540, 1.0),
  lb("can't BUY", 450, 230, 76, { t: a('buy') }),
  X(450, 540, 1.7, a('buy') + 0.15),
  sk('husband', 960, 'shrug', 'worried'),
  pr('sign', 1470, 580, 1.25, { t: a('sell') - 0.25 }),
  lb("can't SELL", 1470, 230, 76, { t: a('sell') }),
  X(1470, 560, 1.7, a('sell') + 0.2),
]);
S('Except', a => [
  big('RICHER than ever', 960, 140, { c: COL.green, size: 110, t: a('RICHER') }),
  pr('moneyBag', 470, 330, 0.95, { enter: 'drop', t: a('RICHER') }),
  pr('moneyBag', 1450, 310, 0.95, { enter: 'drop', t: a('RICHER') + 0.15 }),
  pr('dollar', 290, 690, 0.9, { t: a('RICHER') + 0.3, wig: 6 }),
  pr('dollar', 1650, 670, 0.9, { t: a('RICHER') + 0.4, wig: 6 }),
  m(960, [[0, 'rest'], [a('RICHER'), 'up']], [[0, 'neutral'], [a('RICHER') - 0.2, 'surprise'], [a('ever'), 'happy']], { s: 1.0 }),
]);
S('According to ICE', a => [
  card({ x: 1100, y: 460, w: 1150, h: 620, src: 'ICE MORTGAGE MONITOR', tag: 'Equity report', title: 'Mortgage holders sit on a record $17.5 trillion in home equity',
    body: ['American mortgage holders are now sitting on 17.5 trillion dollars in home equity, the highest total on record.', 'About 2.4 million of them have at least $1 million in equity in their homes.'],
    hl: [{ p: 0, at: a('17.5'), d: 1.8 }] }),
  peek('L', 'surprise', 'stickR'),
], { z0: 1, z1: 1.06, cx: 1100, cy: 420 });
S("That's a record", a => [
  big('$17.5 TRILLION', 960, 330, { c: COL.green, size: 150 }),
  lb('in home equity', 960, 470, 70),
  pr('stamp', 960, 680, 1, { text: 'RECORD!', c: COL.green, t: a('record') }),
  pr('moneyBag', 250, 690, 0.85, { enter: 'drop' }), pr('moneyBag', 1670, 690, 0.85, { enter: 'drop', t: 0.12 }),
]);
S('And 2.4 million', a => [
  big('2.4 MILLION', 680, 270, { size: 120 }),
  lb('homeowners have at least...', 680, 410, 62, { t: a('at least') }),
  counter({ x: 680, y: 600, from: 0, to: 1000000, fmt: usd, size: 120, c: COL.green, t: a('MILLION dollars') - 0.15, d: 0.9 }),
  lb('in equity', 680, 740, 64, { t: a('equity') }),
  pr('house', 1450, 590, 1.45),
  pr('moneyBag', 1450, 290, 0.8, { t: a('equity'), enter: 'drop' }),
]);
S('Just in their house', a => [
  pr('wallMoney', 1180, 560, 1.7),
  m(370, 'pointR', 'happy'),
  lb('...just in the walls', 1180, 150, 70, { t: 0.4 }),
]);
S('On paper', a => [
  pr('doc', 1350, 500, 1.6, { title: 'NET WORTH', c: COL.dgreen }),
  pr('zig', 1350, 520, 0.5, { dir: 'up', t: 0.3 }),
  sk('husband', 560, [[0, 'rest'], [a('NEVER'), 'cheer']], [[0, 'smile'], [a('NEVER'), 'grin']]),
  big('NEVER wealthier', 960, 140, { size: 100, c: COL.green, t: a('NEVER') }),
]);
S('And yet', a => [
  sk('husband', 520, 'sad', 'sad'),
  pr('truck', 1300, 570, 1.2, { t: a('millions') }),
  X(1300, 560, 2.2, a('move')),
  lb("...can't afford to move", 1250, 220, 80, { t: a("can't afford") }),
]);
S('All the easy explanations', a => [
  m(330, 'stickR', 'serious'),
  pr('board', 1200, 420, 1, { text: '"Easy" answers?', size: 96 }),
  X(1200, 430, 2.0, a("don't really work") + 0.2, { alpha: 0.9 }),
]);
S("It's not that people don't WANT", a => [
  sk('husband', 520, 'chin', 'smile'),
  pr('bubble', 1060, 330, 1, { think: 1, w: 440, h: 270 }),
  pr('house', 1060, 340, 0.72, { v: 'big', t: 0.25 }),
  lb('Want to move?  YES', 1150, 760, 72, { t: a('WANT') }),
  OK(1560, 750, 0.55, a('WANT') + 0.3),
]);
S("It's not that they're broke", a => [
  pr('cash', 960, 560, 1.7),
  lb('Broke?  NO', 960, 220, 96, { t: a('broke') }),
  OK(1380, 540, 1, a('broke') + 0.2),
]);
S('We just covered that', a => [
  big('$17.5 TRILLION', 760, 420, { size: 120, c: COL.green }),
  lb('(remember?)', 760, 600, 70, { t: 0.4 }),
  peek('R', 'smirk', 'pointL'),
]);
S("And it's not even just the mortgage rate", a => [
  m(420, 'chin', 'skeptic'),
  pr('pct', 1250, 500, 2.0),
  lb('mortgage rate?', 1250, 200, 76, { t: a('rate') - 0.3 }),
  pr('q', 1560, 330, 0.9, { t: a('rate') }),
]);
S('Because more than half', a => [
  sk('boomer', 360, 'rest', 'smile'),
  sk('boomerWife', 590, 'rest', 'smile', { t: 0.1 }),
  pie({ x: 1230, y: 420, p: 0.54, c: COL.green, label: '>50%', r: 210, t: a('half') }),
  lb('of boomer homeowners...', 1230, 700, 58, { t: a('baby boomers') }),
  lb('have NO mortgage', 1230, 790, 70, { t: a('mortgage at ALL'), c: COL.red }),
  pr('doc', 1650, 300, 0.7, { t: a('ALL') }), X(1650, 300, 0.9, a('ALL') + 0.2),
]);
S("And they're not moving either", a => [
  pr('chair', 520, 845, 1.1, { c: '#7a4a2a' }), sk('boomer', 520, 'rest', 'smile', { sit: 1 }),
  pr('chair', 820, 845, 1.1, { c: '#7a4a2a', t: 0.1 }), sk('boomerWife', 820, 'rest', 'smile', { sit: 1, t: 0.1 }),
  pr('truck', 1440, 560, 0.95, { t: a('moving') }), X(1440, 560, 1.7, a('moving') + 0.25),
]);
S("What's actually happening", a => [
  m(380, 'presentR', [[0, 'serious'], [a('PENALTY'), 'determined']]),
  lb('Moving in America...', 1260, 170, 72),
  pr('truck', 1260, 560, 1.1),
  pr('ticket', 1300, 400, 1.1, { text: 'PENALTY', sub: 'for moving', t: a('PENALTY') }),
]);
S('The rate', a => [
  pr('pct', 330, 470, 1.3), lb('Rate', 330, 690, 72),
  pr('tag', 760, 470, 1.0, { text: 'FEES', r: -10, t: a('fees') }), lb('Fees', 760, 690, 72, { t: a('fees') }),
  pr('taxForm', 1170, 460, 1.05, { t: a('taxes') }), lb('Taxes', 1170, 690, 72, { t: a('taxes') }),
  pr('shield', 1590, 460, 1.05, { text: 'INS.', t: a('insurance') }), lb('Insurance', 1590, 690, 72, { t: a('insurance') }),
]);
S('Any one of them alone', a => [
  sk('husband', 720, 'holdUp', 'smile', { hold: { R: holdProp('pct', 0.6, {}, 0, -60) } }),
  lb('one at a time?', 1280, 300, 84),
  lb('survivable', 1280, 430, 84, { t: a('survive'), c: COL.green }),
  OK(1280, 580, 0.9, a('survive') + 0.2),
]);
S('Stack them on top', a => [
  sk('husband', 960, 'up', [[0, 'worried'], [a('choice'), 'shock']]),
  pr('pct', 960, 412, 0.8, { enter: 'drop', t: 0.15 }),
  pr('tag', 960, 318, 0.6, { enter: 'drop', t: 0.45, r: 0, text: 'FEES' }),
  pr('taxForm', 960, 222, 0.55, { enter: 'drop', t: 0.75 }),
  pr('shield', 960, 100, 0.5, { text: 'INS.', enter: 'drop', t: 1.05 }),
  lb("staying put isn't\na choice anymore", 1490, 520, 64, { t: a('staying put') }),
]);
S("It's the only math", a => [
  m(330, 'stickR', 'determined'),
  pr('board', 1200, 420, 1, { text: 'STAY  =  $0\nMOVE  =  $$$', size: 100 }),
  pr('calc', 1690, 780, 0.55, { t: 0.4 }),
]);
S('But to understand', a => [
  m(330, 'stickR', 'serious'),
  pr('board', 1200, 420, 1, { text: 'Start with...\nthe monthly payment', size: 84, wt: a('monthly payment') - 0.5 }),
]);
S('Right now, the average', a => [
  pr('pct', 540, 470, 2.1),
  big('7.28%', 1250, 420, { size: 230, t: a('7.28%') }),
  lb('average 30-year mortgage rate', 1250, 640, 64, { t: a('30-year') }),
]);
S('according to Freddie', a => [
  card({ x: 1100, y: 470, w: 1150, h: 560, src: "FREDDIE MAC  |  MORTGAGE MARKET SURVEY", tag: 'Weekly', title: '30-year fixed-rate mortgage averages 7.28%',
    body: ['The 30-year fixed-rate mortgage averaged 7.28 percent in the latest weekly survey.'], hl: [{ p: 0, at: 0.4, d: 1.3 }] }),
  peek('L', 'serious', 'stickR'),
], { z0: 1, z1: 1.05, cx: 1100, cy: 450 });
S('A year ago', a => [
  m(380, 'pointR', [[0, 'serious'], [0.9, 'surprise']]),
  bars({ x: 1180, y: 500, w: 800, h: 440, bw: 230, max: 8, items: [
    { label: 'A year ago', v: 6.26, txt: '6.26%', c: COL.orange }, { label: 'Now', v: 7.28, txt: '7.28%', c: COL.red, at: 0.6 }] }),
]);
S('And on September 16th', a => [
  pr('calendar', 480, 470, 1.35, { month: 'SEP', day: '16' }),
  pr('bank', 1200, 570, 1.45, { label: 'THE FED', t: a('Fed') }),
  pr('arrow', 1560, 450, 1, { pts: [[0, 150], [0, -130]], c: COL.red, lw: 18, t: a('RAISED') }),
  lb('RATES UP', 1260, 180, 96, { t: a('RAISED'), c: COL.red }),
]);
S('So relief', a => [
  m(600, 'shrug', 'worried'),
  pr('bubble', 1180, 330, 1, { think: 1, text: 'relief?', size: 84, w: 360, h: 220 }),
  X(1180, 330, 1.2, a('way')),
]);
S('Meanwhile', a => [
  m(330, 'stickR', 'serious'),
  pr('board', 1200, 420, 1, { text: "What people are\nALREADY paying", size: 88 }),
]);
S('Nearly 4 out of 5', a => [
  big('4 out of 5', 960, 160, { size: 110 }),
  icons({ x: 960, y: 480, n: 5, k: 4, icon: 'house', size: 0.75, gap: 300, hiAt: a('below 6%') }),
  lb('mortgage holders have a rate below 6%', 960, 770, 64, { t: a('below 6%') }),
]);
S('Almost HALF', a => [
  m(400, 'pointR', 'surprise'),
  pie({ x: 1180, y: 460, p: 0.48, c: COL.orange, label: '~HALF', r: 230, size: 80 }),
  lb('are below 4%', 1180, 780, 80, { t: a('4%') }),
]);
S('And about 1 in 5', a => [
  big('1 in 5', 960, 160, { size: 120 }),
  icons({ x: 960, y: 480, n: 5, k: 1, icon: 'person', size: 0.85, gap: 260, on: COL.green, hiAt: a('under 3%') }),
  lb('still under 3%', 960, 770, 80, { t: a('under 3%'), c: COL.green }),
]);
S("So let's make this real", a => [
  m(330, 'presentR', 'happy'),
  sk('husband', 1150, 'wave', 'smile', { enter: 'slideR', dur: 0.5 }),
  sk('wife', 1450, 'rest', 'smile', { enter: 'slideR', dur: 0.55 }),
  lb('Meet the couple', 1300, 150, 80, { t: 0.5 }),
]);
S('A couple buys', a => [
  sk('husband', 360, 'rest', 'grin'), sk('wife', 590, 'rest', 'grin'),
  pr('house', 1200, 580, 1.5, { sold: 1, t: 0.2 }),
  pr('tag', 1470, 280, 1, { text: '$400,000', size: 40, t: a('$400,000') }),
  lb('2021', 1100, 170, 110, { font: 'marker', c: COL.blue, t: a('2021') }),
]);
S('They put 20% down', a => [
  pr('cash', 600, 580, 1.6, { n: 5 }),
  lb('20% down', 600, 270, 92),
  lb('= $80,000', 600, 800, 70, { t: 0.6 }),
  pr('lock', 1320, 580, 1.6, { t: a('lock in') }),
  pr('pct', 1320, 300, 0.95, { label: '3%', t: a('lock in') + 0.3 }),
  lb('locked in at 3%', 1320, 800, 76, { t: a('3%'), c: COL.green }),
]);
S('Their principal and interest', a => [
  sk('husband', 240, 'rest', 'smile', { s: 0.7 }), sk('wife', 1680, 'rest', 'smile', { s: 0.7 }),
  big('$1,349', 960, 400, { size: 210, c: COL.green, t: a('$1,349') }),
  lb('a month (principal + interest)', 960, 610, 64, { t: a('$1,349') + 0.3 }),
]);
S("Now it's 2026", a => [
  lb('2026', 960, 170, 130, { font: 'marker', c: COL.red }),
  sk('husband', 560, 'chin', 'smile'), sk('wife', 780, 'rest', 'smile'),
  pr('bubble', 1320, 400, 1.1, { think: 1, w: 430, h: 270, t: a('move') - 0.3 }),
  pr('truck', 1320, 410, 0.62, { t: a('move') }),
]);
S('Not upgrade', a => [
  pr('house', 640, 580, 1.2, { v: 'big' }), X(640, 560, 2.2, a('upgrade')),
  pr('house', 1350, 590, 1.0, { v: 'mansion', t: a('mansion') - 0.3 }), X(1350, 560, 2.4, a('mansion') + 0.2),
]);
S('Just move', a => [
  lb('Just. Move.', 960, 210, 110),
  sk('husband', 300, 'wave', 'smile'),
  pr('truck', 900, 620, 1.3, { move: { x: 1400, t: 0.2, d: 1.2 } }),
]);
S('Same price', a => [
  pr('house', 600, 540, 1.3), pr('house', 1320, 540, 1.3, { t: 0.12 }),
  lb('=', 960, 540, 220, { font: 'marker' }),
  lb('same price', 960, 820, 66),
  lb('same loan', 600, 190, 66, { t: a('loan') }),
  lb('same EVERYTHING', 1320, 190, 66, { t: a('everything'), c: COL.red }),
]);
S("At today's rate", a => [
  m(260, 'rest', [[0, 'neutral'], [a('$2,189'), 'shock']], { s: 0.8 }),
  bars({ x: 1100, y: 510, w: 950, h: 470, bw: 250, max: 2500, items: [
    { label: '2021 @ 3%', v: 1349, txt: '$1,349', c: COL.green }, { label: 'Today @ 7.28%', v: 2189, txt: '$2,189', c: COL.red, at: a('$2,189') - 0.2 }] }),
]);
S("That's an extra $840", a => [
  big('+$840', 960, 380, { size: 240 }),
  lb('every. single. month.', 960, 640, 84, { t: a('every single') }),
  peek('R', 'shock', 'rest'),
]);
S('More than $10,000', a => [
  counter({ x: 960, y: 420, from: 0, to: 10000, fmt: v => usd(v) + (v > 9990 ? '+' : ''), size: 210, d: 0.9 }),
  lb('every year', 960, 640, 84, { t: 0.4 }),
  pr('calendar', 1620, 700, 0.8, { month: 'YEAR', day: '1' }),
]);
S('And over 30 years', a => [
  lb('over 30 years...', 960, 160, 84),
  counter({ x: 960, y: 420, from: 10000, to: 300000, fmt: usd, size: 220, t: a('roughly'), d: 1.3 }),
  lb('MORE', 960, 630, 96, { t: a('more'), c: COL.red }),
  pr('moneyBag', 320, 700, 1.0, { enter: 'drop', t: a('roughly') + 0.6 }),
  pr('moneyBag', 1600, 700, 1.0, { enter: 'drop', t: a('roughly') + 0.8 }),
]);
S('For a house that is no bigger', a => [
  pr('house', 560, 560, 1.3), pr('house', 1360, 560, 1.3),
  lb('no bigger', 560, 230, 76, { t: a('no bigger') }),
  lb('no better', 1360, 230, 76, { t: a('no better') }),
  m(960, 'facepalm', 'disgust', { t: a('already'), enter: 'pop', s: 0.72 }),
]);
S("It's basically a rent-controlled", a => [
  pr('apartment', 1250, 590, 1.4, { label: 'RENT CONTROLLED' }),
  sk('newYorker', 720, 'present', 'smirk'),
  peek('L', 'laugh', 'rest'),
]);
S("You don't leave", a => [
  pr('apartment', 1100, 590, 1.4, { label: 'RENT CONTROLLED' }),
  sk('newYorker', 860, 'hug', 'smirk'),
  lb("You. Don't. Leave.", 600, 170, 90),
]);
S("You don't leave when you get", a => [
  pr('laptop', 1250, 520, 1.4, { text: 'NEW JOB\nOFFER!', size: 46 }),
  sk('newYorker', 620, 'stop', 'smirk'),
  X(1250, 490, 1.4, a('job') + 0.3),
]);
S("You don't leave when you have", a => [
  sk('newYorker', 620, 'shrug', 'smile'),
  pr('baby', 1250, 600, 1.6, { t: a('baby') - 0.2 }),
  lb('still not leaving', 1250, 260, 76, { t: a('baby') + 0.2 }),
]);
S('You just figure out', a => [
  lb('home sweet home', 1050, 170, 80),
  pr('crib', 830, 670, 1.1, { t: a('crib') - 0.1 }),
  pr('radiator', 1250, 640, 1.3, { t: a('radiator') - 0.2 }),
  sk('newYorker', 1650, 'shrug', 'grin', { s: 0.72 }),
  peek('L', 'laugh'),
]);
S('And researchers', a => [
  lb('Researchers measured it', 960, 160, 80),
  sk('econA', 640, 'chin', 'smirk'),
  pr('calc', 960, 660, 0.6),
  sk('econB', 1280, 'holdR', 'smile', { hold: { R: holdProp('clipboard', 0.45, { title: 'DATA' }) } }),
]);
S('Economists at the University', a => [
  card({ x: 1100, y: 470, w: 1150, h: 540, src: 'WORKING PAPER  |  UNIV. OF ILLINOIS & WHARTON', tag: 'Research', title: 'The lock-in effect of rising mortgage rates',
    body: ["For every 1 percentage point that today's rate sits above a homeowner's locked-in rate, the odds of moving fall by about 9%."], hl: [{ p: 0, at: a('every 1'), d: 3.2 }] }),
  peek('L', 'serious', 'stickR'),
], { z0: 1, z1: 1.05, cx: 1100, cy: 470 });
S('the odds you move', a => [
  pr('pct', 450, 480, 1.4, { label: '+1 pt' }),
  pr('arrow', 860, 480, 1, { pts: [[-130, 0], [130, 0]], c: COL.ink, lw: 12 }),
  pr('truck', 1330, 540, 1.0),
  big('-9%', 1330, 230, { size: 190, t: a('9%') }),
]);
S('Now look at the gap', a => [
  bars({ x: 960, y: 520, w: 820, h: 470, bw: 230, max: 8.5, items: [
    { label: 'YOUR rate', v: 3, txt: '3%', c: COL.green }, { label: "Today's rate", v: 7.28, txt: '7.28%', c: COL.red, at: 0.4 }] }),
  pr('arrow', 1450, 470, 1, { pts: [[0, 150], [0, -130]], c: COL.red, lw: 10, t: a('3') }),
  lb('GAP:\n3-4 points', 1640, 450, 70, { t: a('3'), c: COL.red }),
]);
S('So instead of moving', a => [
  pr('truck', 560, 580, 1.0), X(560, 570, 1.8, 0.3),
  lb('the next best thing...', 1000, 170, 76, { t: a('next best') }),
  sk('husband', 1230, [[0, 'rest'], [a('remodeling'), 'holdUp']], 'grin', { hold: { R: (c, lt) => { if (lt > a('remodeling')) { c.rotate(Math.sin(lt * 10) * 0.4); c.scale(0.6, 0.6); PROPS.hammer(c, {}); } } } }),
  pr('roller', 1610, 620, 0.9, { t: a('remodeling') + 0.2 }),
  lb('REMODEL!', 1450, 330, 84, { t: a('remodeling'), c: COL.blue }),
]);
S('According to ICE, home equity', a => [
  card({ x: 1100, y: 470, w: 1150, h: 600, src: 'ICE MORTGAGE MONITOR', tag: 'First quarter', title: 'Home equity withdrawals hit highest Q1 level since 2021',
    body: ['Homeowners pulled more equity out of their homes in the first quarter than in any first quarter since 2021.', 'More than half of it, 54%, came through second loans such as home equity lines of credit.'],
    hl: [{ p: 0, at: a('highest'), d: 1.6 }] }),
  peek('L', 'surprise', 'stickR', { t: 0.3 }),
], { z0: 1, z1: 1.05, cx: 1100, cy: 450 });
S('And more than half of that', a => [
  pr('doc', 430, 530, 1.3, { title: 'HELOC', c: COL.purple }),
  pie({ x: 1160, y: 450, p: 0.54, c: COL.purple, label: '54%', r: 220, pAt: Math.max(0.2, a('54%') - 0.3) }),
  lb('through second loans (home equity lines)', 1160, 760, 58, { t: a('second loans') }),
]);
S('Not refinancing', a => [
  pr('doc', 600, 540, 1.3, { title: 'REFINANCE', c: COL.blue }), X(600, 540, 1.6, 0.25),
  pr('sign', 1320, 580, 1.4, { t: a('selling') - 0.1 }), X(1320, 540, 1.6, a('selling') + 0.2),
]);
S('Borrowing ON TOP', a => [
  m(330, 'pointR', 'smirk'),
  pr('doc', 1000, 650, 1.35, { title: '3% LOAN', c: COL.green }),
  pr('lock', 1190, 720, 0.55, { t: 0.2 }),
  pr('doc', 1000, 360, 1.2, { title: '2nd LOAN', c: COL.purple, enter: 'drop', t: a('ON TOP') }),
  lb('never touch it', 1540, 420, 78, { t: a('never'), c: COL.green }),
]);
S('The translation', a => transl());
S('people would rather', a => [
  pr('kitchen', 1180, 620, 1.25),
  sk('wife', 480, 'holdR', 'grin', { hold: { R: holdProp('roller', 0.55, {}, 0, -60) } }),
  lb('2nd loan  =  new kitchen', 1180, 190, 72, { t: a('kitchen') - 0.4 }),
]);
S('than give up the rate', a => [
  sk('husband', 860, 'hug', 'smile'),
  pr('lock', 1110, 540, 1.8),
  pr('pct', 1110, 330, 0.85, { label: '3%' }),
  lb('MINE.', 1500, 380, 110, { t: a('whole house'), font: 'marker', c: COL.green }),
]);
S("You can't move to a bigger house", a => [
  pr('house', 1400, 580, 1.1, { v: 'big' }), X(1400, 560, 2.0, 0.5),
  pr('house', 600, 620, 1.0, { move: { s: 1.55, t: a('INTO'), d: 0.8, e: 'back' } }),
  lb('make it bigger!', 600, 190, 74, { t: a('INTO') }),
]);
S('But I know what some', a => [
  m(470, 'chin', 'confused'),
  pr('bubble', 1220, 330, 1.1, { think: 1, text: "Rates won't stay\nhigh forever...", size: 60, w: 560, h: 300, t: a('Rates') - 0.2 }),
  lb('Just wait it out?', 1220, 740, 80, { t: a('wait'), c: COL.blue }),
]);
S('And people HAVE been waiting', a => [
  lb('waiting...', 800, 280, 76),
  pr('chair', 800, 845, 1.1, { c: '#4a6fa5' }), sk('firstBuyer', 800, 'rest', 'sleep', { sit: 1 }),
  pr('clock', 1300, 480, 1.4, { speed: 900 }),
  pr('hourglass', 1650, 580, 1.0),
]);
S('Back in February', a => [
  sketchLine({ x: 1050, y: 500, w: 1100, h: 480, pts: [[-500, -140], [-100, 170, 'under 6% (Feb)', 66]], c: COL.blue, d: 1.6 }),
  lb('first time in ~3.5 years', 1050, 150, 66, { t: a('three and a half') }),
  m(250, 'pointR', 'happy', { s: 0.75 }),
]);
S("It didn't last", a => [
  sketchLine({ x: 1050, y: 500, w: 1100, h: 480, pts: [[-500, -140], [-100, 170, 'under 6%', 66]], c: COL.blue, d: 0.01 }),
  sketchLine({ x: 1050, y: 500, w: 1100, h: 480, axes: false, pts: [[-100, 170], [150, -10], [450, -190, '7.28%', -60, 0, COL.red]], c: COL.red, d: 1.6, t: a('drifted') }),
  m(250, 'sad', 'sad', { s: 0.75 }),
]);
S('the Fed hiked in September', a => [
  pr('calendar', 380, 480, 1.0, { month: 'SEP', day: '16' }),
  pr('bank', 960, 580, 1.55, { label: 'THE FED' }),
  pr('zig', 1530, 480, 0.6, { dir: 'up', c: COL.red, t: 0.3 }),
  lb('HIKE', 1530, 220, 100, { c: COL.red, t: 0.4, font: 'marker' }),
]);
S('and now the Mortgage Bankers', a => [
  sk('mbaEcon', 560, 'present', 'flat'),
  lb('Mortgage Bankers Association', 1180, 700, 56, { t: 0.3 }),
  lb('chief economist', 1180, 770, 50, { t: 0.3 }),
  pr('bubble', 1180, 330, 1.1, { text: 'Next move:\nanother HIKE', size: 66, w: 480, h: 250, tail: 'bl', t: a('NEXT move') }),
]);
S('And according to Bankrate', a => [
  card({ x: 1100, y: 470, w: 1150, h: 560, src: 'BANKRATE', tag: 'Rate forecast', title: 'Economists no longer see sub-6% mortgage rates anytime soon',
    body: ['Housing economists no longer expect rates under 6% anytime soon.', 'Even getting back under 7% looks like a stretch.'],
    hl: [{ p: 0, at: a('no longer'), d: 1.8 }] }),
  peek('L', 'skeptic', 'stickR'),
], { z0: 1, z1: 1.05, cx: 1100, cy: 450 });
S('Even getting back under 7%', a => [
  m(420, 'shrug', 'skeptic'),
  big('under 7%?', 1240, 400, { size: 170 }),
  lb('...a stretch', 1240, 600, 84, { t: a('stretch') }),
]);
S('And even if rates DID fall', a => [
  m(290, 'chin', 'serious', { s: 0.8 }),
  pr('pct', 860, 560, 0.85), pr('tag', 1160, 560, 0.62, { text: 'FEES', r: 0 }), pr('taxForm', 1440, 560, 0.62), pr('shield', 1720, 560, 0.62, { text: 'INS.' }),
  OK(860, 340, 0.7, a('ONE')), X(1160, 340, 0.7, a('ONE') + 0.3), X(1440, 340, 0.7, a('ONE') + 0.45), X(1720, 340, 0.7, a('ONE') + 0.6),
  lb('fixes ONE problem', 1290, 800, 70, { t: a('ONE') }),
]);
S('Because the rate is only', a => {
  const tl = a('LEAVE');
  return [
    draw({}, (ctx, lt) => {
      ctx.fillStyle = '#6fb5dd'; ctx.fillRect(-200, 470, W + 400, 900);
      for (let i = 0; i < 6; i++) rline(ctx, [[100 + i * 330, 520 + (i % 2) * 40], [170 + i * 330, 510 + (i % 2) * 40], [240 + i * 330, 520 + (i % 2) * 40]], { w: 4, c: '#ffffff99', amp: 0 });
      const k = E.out(P(lt, tl - 0.3, 0.9));
      if (k > 0) { ctx.save(); ctx.globalAlpha *= k; poly(ctx, [[800, 470], [1120, 470], [1400, 640], [1330, 900], [960, 1010], [560, 900], [520, 660]], { fill: '#d6eef8', w: 5, c: '#2f6f9b' }); ctx.restore(); }
      poly(ctx, [[800, 470], [880, 330], [950, 380], [1030, 290], [1120, 470]], { fill: '#f4fcff', w: 5, c: '#2f6f9b' });
    }),
    lb('the rate (what people TALK about)', 960, 210, 64, { t: a('TALK') }),
    lb('what it costs to LEAVE', 960, 760, 80, { t: tl, c: COL.red }),
  ];
});
S('Clever Real Estate surveyed', a => [
  card({ x: 1100, y: 470, w: 1150, h: 540, src: 'CLEVER REAL ESTATE  |  SELLER SURVEY', tag: '1,000 sellers', title: 'What it really costs to sell a home',
    body: ['A survey of 1,000 Americans who sold a home since 2024.', 'The average total cost of selling: $81,918.'], hl: [{ p: 1, at: a('average total'), d: 2.2 }] }),
  peek('L', 'serious', 'stickR'),
], { z0: 1, z1: 1.05, cx: 1100, cy: 470 });
S('was $81,918', a => [
  counter({ x: 900, y: 430, from: 0, to: 81918, fmt: usd, size: 230, d: 1.0 }),
  lb('average cost to sell', 900, 640, 76, { t: 0.4 }),
  peek('R', 'shock'),
]);
S('Let that sink in', a => [
  lb('Let that sink in...', 960, 160, 84),
  m(960, 'facepalm', 'sad', { s: 0.95 }),
]);
S('Eighty-two THOUSAND', a => [
  big('$82,000', 960, 300, { size: 220 }),
  lb('...just to hand over the keys', 960, 520, 64, { t: a('hand over') }),
  sk('seller', 560, 'holdR', 'sad', { hold: { R: holdProp('key', 0.5) } }),
  sk('buyer', 1360, 'present', 'grin'),
]);
S('And the biggest piece', a => [
  m(380, 'pointR', 'skeptic'),
  sk('realtor', 1200, 'present', 'grin'),
  lb('The agent?', 1200, 190, 84),
  X(1200, 400, 1.4, a('agent') + 0.35),
]);
S('It was repairs', a => [
  pr('house', 1100, 600, 1.4),
  pr('hammer', 690, 720, 0.8, { rot: -20, wig: 8 }), pr('roller', 1510, 720, 0.8, { t: 0.2, wig: 8 }),
  big('$27,600', 1100, 190, { size: 150, t: a('$27,600') }),
  lb('repairs to get it ready', 1100, 860, 60, { t: a('ready') }),
]);
S('Then the commission', a => [
  sk('realtor', 580, 'holdR', 'grin', { hold: { R: holdProp('moneyBag', 0.45) } }),
  big('$27,400', 1260, 340, { size: 150, t: a('$27,400') }),
  lb('commission (~5.5% of the price)', 1260, 530, 62, { t: a('5 and a half') }),
]);
S('Then closing costs', a => [
  m(350, 'pointR', 'serious'),
  pr('doc', 1000, 540, 1.5, { title: 'CLOSING' }),
  big('$11,000', 1480, 390, { size: 140, t: a('$11,000') }),
]);
S('Then nearly $10,000', a => [
  big('$10,000', 960, 190, { size: 140 }),
  lb('"concessions"', 960, 330, 72, { t: a('concessions') }),
  sk('seller', 600, 'present', 'sad', { hold: { R: holdProp('bill', 0.5) } }),
  sk('buyer', 1320, 'holdR', 'grin'),
  lb('handed BACK to buyers', 960, 830, 62, { t: a('BACK') }),
]);
S('And nearly a quarter', a => [
  sk('seller', 380, 'sad', 'cry'),
  lb('nearly 1 in 4 sellers', 1200, 160, 80, { t: a('quarter') }),
  icons({ x: 1200, y: 470, n: 4, k: 1, icon: 'person', size: 0.85, gap: 240, on: COL.red, hiAt: a('quarter') }),
  pr('stamp', 1200, 770, 0.9, { text: 'DEBT', t: a('DEBT') }),
]);
S("And remember... you're not done", a => [
  m(700, 'count', 'serious'),
  lb("You're not done.", 1320, 420, 94, { t: a('not done') }),
]);
S('The moment you sell', a => [
  sk('seller', 960, 'rest', 'smile'),
  lb('SELLER', 960, 200, 90),
  strike({ x: 960, y: 200, w: 360, t: a('buyer again') - 0.2 }),
  lb('BUYER (again)', 1450, 330, 88, { t: a('buyer again'), c: COL.blue }),
]);
S('And buyers pay their OWN', a => [
  pr('doc', 650, 540, 1.5, { title: 'CLOSING', c: COL.blue }),
  lb('buyer closing costs', 1300, 230, 70),
  big('3-5%', 1300, 440, { size: 200, t: a('3 and 5%') }),
  lb('of the price', 1300, 640, 72, { t: a('price') }),
]);
S('On a typical home today', a => [
  counter({ x: 960, y: 250, from: 0, to: 100000, fmt: v => '~' + usd(v), size: 150, t: Math.max(0.3, a('$100,000') - 0.4), d: 0.8 }),
  stackbar({ x: 960, y: 560, w: 1500, h: 130, segs: [
    { v: 82, c: COL.red, label: 'Selling', txt: '~$82K', at: 0.2 }, { v: 18, c: COL.blue, label: 'Buying', txt: '+$13-21K', at: 0.9 }] }),
  lb('the cost of ONE move', 960, 780, 74, { t: a('one move') }),
]);
S("Before you've packed", a => [
  lb("...before you've packed a single box", 1000, 200, 68),
  sk('husband', 600, 'carry', 'shock'),
  pr('box', 1200, 620, 1.4, { label: 'FRAGILE' }),
]);
S("Then there's the timing problem", a => [
  m(450, 'chin', 'worried'),
  lb('The timing problem', 1220, 160, 86),
  pr('clock', 1220, 500, 1.6, { speed: 300 }),
]);
S('Most people need the money', a => [
  pr('house', 450, 580, 1.1), lb('CURRENT home', 450, 260, 70, { t: a('CURRENT') }),
  pr('arrow', 960, 540, 1, { pts: [[-220, 0], [220, 0]], c: COL.green, lw: 14, t: 0.4 }),
  pr('cash', 880, 420, 0.75, { t: 0.4, move: { x: 1040, t: 0.5, d: 1.2 } }),
  pr('house', 1470, 580, 1.1, { v: 'big', t: a('next one') - 0.2 }), lb('NEXT home', 1470, 240, 70, { t: a('next one') }),
]);
S("In the Realtors' survey", a => [
  card({ x: 1100, y: 470, w: 1150, h: 500, src: 'NATIONAL ASSOCIATION OF REALTORS', tag: 'Buyer & seller survey', title: 'Most repeat buyers pay for the next home with the last one',
    body: ['More than half of repeat buyers used the money from selling their old home to pay for the new one.'], hl: [{ p: 0, at: a('more than half'), d: 2.6 }] }),
  peek('L', 'serious', 'stickR'),
], { z0: 1, z1: 1.05, cx: 1100, cy: 470 });
S('So you either sell first', a => [
  sk('husband', 560, 'carry', 'worried', { hold: { R: holdProp('box', 0.5, {}, -60, -10) } }),
  sk('wife', 820, 'sad', 'worried'),
  pr('house', 1420, 580, 1.1, { sold: 1 }),
  lb('Sold... now where?', 1300, 210, 74, { t: a('nowhere') - 0.2 }),
  pr('q', 690, 200, 0.75, { t: a('nowhere') }),
]);
S('Or you buy first', a => [
  pr('house', 380, 620, 0.9), pr('house', 1540, 620, 0.9, { v: 'big' }),
  sk('husband', 960, 'carry', 'worried', { hold: { L: holdProp('doc', 0.55, { title: 'LOAN #1' }, -20, 0), R: holdProp('doc', 0.55, { title: 'LOAN #2' }, 20, 0) } }),
  lb('TWO mortgages', 960, 170, 100, { t: a('TWO'), c: COL.red }),
]);
S('Or you make an offer', a => [
  sk('husband', 440, 'present', 'smile'),
  pr('bubble', 920, 300, 1.1, { text: "I'll buy your house...\nIF I can sell mine first", size: 48, w: 580, h: 240, tail: 'bl', t: a("I'll buy") }),
  sk('seller', 1460, 'rest', [[0, 'smile'], [a('IF'), 'confused']]),
]);
S("And that's usually the weakest", a => [
  m(330, 'shrug', 'skeptic'),
  pr('doc', 1060, 540, 1.6, { title: 'OFFER' }),
  pr('stamp', 1060, 580, 0.95, { text: 'WEAKEST', t: a('weakest') }),
]);

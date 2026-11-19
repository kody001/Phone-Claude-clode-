'use strict';
// Section 4: this time the bet is your bill -> contracts -> public backlash -> Tennessee law
// -> governors' pledge -> recap -> ending.

shot("But here's the difference", [
  C('board', { x: 720, y: 420, w: 900, h: 420, text: 'THEN  vs  NOW', size: 100 }),
  mascot(1580, 'one', 'serious'),
]);
shot('When the fiber bubble popped', [
  P('bubble', { x: 960, y: 230, s: 0.9, out: 'popped', outAnim: 'pop' }),
  T('POP!', { x: 960, y: 230, size: 110, color: COL.red, at: 'popped' }),
  stick('investor', 460, 'facepalm', 'sad', { at: 'investors' }),
  label('investors', 460, 340, { size: 52, at: 'investors' }),
  stick('investor2', 960, 'headhands', 'crying', { at: 'shareholders' }),
  label('shareholders', 960, 400, { size: 52, at: 'shareholders' }),
  stick('lender', 1460, 'shrug', 'sad', { at: 'lenders' }),
  label('lenders', 1460, 340, { size: 52, at: 'lenders' }),
]);
shot('People who chose to make that bet', [
  stick('investor', 600, 'holdR', 'smug', { hold: { prop: 'cashStack', s: 0.45 } }),
  P('casinoTable', { x: 1250, y: 660, s: 1.1 }),
  label('they CHOSE to bet', 1250, 300, { size: 72, at: 'chose' }),
  P('check', { x: 1650, y: 300, s: 0.7, at: 'bet' }),
]);
shot('This time, the bet is being made', [
  P('casinoTable', { x: 960, y: 660, s: 1.4 }),
  P('bill', { x: 960, y: 560, s: 0.55, a: { title: 'YOUR BILL', total: '$$$' }, in: 'drop', at: 'electric bill' }),
  stick('joe', 1600, 'headhands', 'shocked', { at: 'your' }),
  label('this time...', 600, 220, { size: 72 }),
]);
shot('Some states are trying to protect', [
  P('dataCenter', { x: 560, y: 560, s: 1 }),
  P('contract', { x: 1250, y: 480, s: 1.4, a: { title: 'LONG-TERM' }, at: 'contracts' }),
  arrow([800, 480], [1060, 480], { at: 'sign', color: COL.ink }),
]);
shot('often 10 to 15 years', [
  P('contract', { x: 700, y: 480, s: 1.4, a: { title: 'CONTRACT', years: '10-15 years' } }),
  P('lock', { x: 1300, y: 500, s: 1.1, at: 'lock' }),
  label('payments locked in', 1300, 200, { size: 62, at: 'payments' }),
]);
shot('That helps', [
  mascot(760, 'fist', 'happy'),
  P('check', { x: 1300, y: 420, s: 1.4, at: 'helps' }),
]);
shot('But if a transmission line takes 40', [
  P('tower', { x: 220, y: 520, s: 0.8 }),
  C('timeline', { x: 1080, y: 600, w: 1300, marks: [{ pos: 0, label: '0', size: 44 }, { pos: 0.375, label: '15 yrs', size: 44, color: COL.green }, { pos: 1, label: '40 yrs', at: '40', color: COL.red }],
    spans: [{ from: 0, to: 0.375, color: 'rgba(79,154,58,0.7)', label: 'contract', textColor: COL.green, at: 'takes' }, { from: 0.375, to: 1, color: 'rgba(214,49,43,0.7)', label: 'the other 25?', at: '25' }] }),
  label('who covers this?', 1300, 260, { size: 66, color: COL.red, at: 'who covers' }),
]);
shot('And people are starting to notice', [
  C('people', { x: 960, y: 900, n: 6, gap: 260, s: 0.75, face: 'skeptical', in: 'none' }),
  ...[0, 1, 2, 3, 4, 5].map(i => P('exclaim', { x: 310 + i * 260, y: 370, s: 0.4, at: `starting+${(i * 0.08).toFixed(2)}` })),
]);
shot('In March, Gallup asked', [
  P('calendar', { x: 360, y: 400, s: 1, a: { top: 'MARCH', text: 'POLL', size: 56 } }),
  stick('pollster', 820, 'holdR', 'neutral', { hold: { prop: 'paper', a: { title: 'GALLUP', size: 34, lines: 3 }, s: 0.42 } }),
  label('first time ever asked', 1350, 300, { size: 62, at: 'first time' }),
]);
shot("how they'd feel about an AI data center", [
  ...houses(3, 360, 650, 260, 0.75),
  P('dataCenter', { x: 1350, y: 560, s: 1, at: 'data center' }),
  C('bubble', { x: 1350, y: 230, text: 'In YOUR area?', w: 420, h: 160, tail: 'bl', at: 'area' }),
]);
shot("71% said they'd oppose it", [
  big('71%', 520, 360, { size: 230, at: '71%' }),
  label('oppose', 520, 560, { size: 80, at: 'oppose' }),
  stick('neighbor', 1100, 'holdUpR', 'angry', { hold: { prop: 'sign', a: { text: 'NO', size: 80, w: 220, h: 130 }, s: 0.5, dx: 80, dy: -50 } }),
  stick('dad', 1500, 'holdUpR', 'annoyed', { hold: { prop: 'sign', a: { text: 'NOPE', size: 64, w: 220, h: 130 }, s: 0.5, dx: 80, dy: -50 } }),
]);
shot('Nearly half', [
  C('poll', { x: 760, y: 450, w: 1100, title: 'An AI data center in your area?', labelW: 320, rows: [{ label: 'Oppose', pct: 71, color: COL.red }, { label: 'Strongly oppose', pct: 48, color: COL.redDark, at: '48%' }] }),
  peek('R', 'point>1100,420', 'smug', { look: [1000, 420] }),
]);
shot('In that same survey, only 53%', [
  C('bars', { x: 760, y: 470, w: 960, h: 620, title: 'Oppose one in their area', bars: [{ label: 'AI data center', value: 71, text: '71%', color: COL.red }, { label: 'Nuclear power plant', value: 53, text: '53%', color: COL.orange, at: '53%' }], max: 80 }),
  P('nuclear', { x: 1600, y: 560, s: 0.9, at: 'nuclear' }),
]);
shot('So Americans would now rather live', [
  P('nuclear', { x: 420, y: 560, s: 1.2 }),
  P('check', { x: 420, y: 200, s: 0.8, at: 'nuclear' }),
  stick('joe', 960, 'point>420,500', 'happy', { look: [420, 400] }),
  P('dataCenter', { x: 1500, y: 600, s: 0.9 }),
  P('xmark', { x: 1500, y: 560, s: 1, at: 'warehouse' }),
]);
shot("And this isn't a red state", [
  P('usMap', { x: 560, y: 470, s: 0.85, a: { fill: '#e57373' }, at: 'red' }),
  P('usMap', { x: 1360, y: 470, s: 0.85, a: { fill: '#64a0e8' }, at: 'blue' }),
  label('same answer', 960, 800, { size: 72, at: 'thing' }),
]);
shot('Gallup found majorities', [
  ...[['dem', 420, 'Democrats', 'Democrats'], ['ind', 960, 'Independents', 'Independents'], ['rep', 1500, 'Republicans', 'Republicans']].map(([c, x, w, l]) => [
    stick(c, x, 'holdUpR', 'annoyed', { at: w, hold: { prop: 'sign', a: { text: 'NO', size: 80, w: 200, h: 120 }, s: 0.45, dx: 80, dy: -50 } }),
    label(l, x, 200, { size: 54, at: w }),
  ]),
]);
shot("In this month's midterm elections", [
  P('ballotBox', { x: 960, y: 620, s: 1.1 }),
  stick('dem', 420, 'point>1500,450', 'angry', { look: [1500, 450], at: 'candidates' }),
  stick('rep', 1500, 'point>960,300', 'angry', { look: [960, 300], at: 'both parties' }),
  P('dataCenter', { x: 960, y: 260, s: 0.6, at: 'blame' }),
  label('blamed for bills', 960, 110, { size: 56, at: 'rising' }),
]);
shot('And in that Consumer Reports survey', [
  big('84%', 640, 400, { size: 230, at: '84%' }),
  label('support it', 640, 600, { size: 76, at: 'support' }),
  stick('grandma', 1400, 'fist', 'happy'),
]);
shot('putting big users like data centers', [
  P('paper', { x: 600, y: 470, s: 1.4, a: { title: 'HOMES RATE', lines: 3, size: 36, w: 300 } }),
  P('house', { x: 600, y: 520, s: 0.4 }),
  P('paper', { x: 1300, y: 470, s: 1.4, a: { title: 'BIG USERS RATE', lines: 3, size: 32, w: 320 }, at: 'separate' }),
  P('dataCenter', { x: 1300, y: 530, s: 0.35, at: 'separate' }),
  label('a separate rate category', 960, 140, { size: 64, at: 'category' }),
]);

// ---------- Tennessee ----------
shot('Some states have stopped waiting', [
  mascot(760, 'fist', 'serious'),
  P('hourglass', { x: 1300, y: 460, s: 1 }),
  P('xmark', { x: 1300, y: 460, s: 1.2, at: 'waiting' }),
]);
shot('In May, Tennessee Governor', [
  stick('governor', 620, 'holdR', 'serious', { hold: { prop: 'lawScroll', a: { title: 'TN LAW' }, s: 0.4 } }),
  label('Tennessee Gov. Bill Lee', 620, 170, { size: 60, at: 'Governor' }),
  P('calendar', { x: 1350, y: 380, s: 1, a: { top: 'MAY', text: 'SIGNED', size: 50 }, at: 'signed' }),
  label('aimed at this problem', 1350, 660, { size: 56, at: 'problem' }),
]);
shot('Under it, data centers that need', [
  P('dataCenter', { x: 600, y: 560, s: 1.2 }),
  big('50+ MW', 600, 260, { size: 120, color: COL.orange, at: '50' }),
  arrow([860, 520], [1120, 520], { at: 'pay', color: COL.ink }),
  P('substation', { x: 1450, y: 600, s: 0.8, at: 'infrastructure' }),
  label('they pay for it', 1450, 300, { size: 62, color: COL.green, at: 'pay' }),
]);
shot('The substations, the grid upgrades', [
  P('substation', { x: 560, y: 600, s: 1, at: 'substations' }),
  P('tower', { x: 1300, y: 520, s: 1, at: 'upgrades' }),
  P('tag', { x: 560, y: 300, s: 0.8, a: { text: 'PAID', size: 48, fill: '#bfe8a8', color: COL.greenDark }, at: 'substations+0.3' }),
  P('tag', { x: 1300, y: 230, s: 0.8, a: { text: 'PAID', size: 48, fill: '#bfe8a8', color: COL.greenDark }, at: 'upgrades+0.3' }),
]);
shot('Instead of spreading that cost', [
  ...houses(4, 360, 620, 400, 0.75),
  ...[0, 1, 2, 3].map(i => P('bill', { x: 360 + i * 400, y: 380, s: 0.25, a: { total: '$$$' }, at: 'Instead' })),
  ...[0, 1, 2, 3].map(i => P('xmark', { x: 360 + i * 400, y: 380, s: 0.5, at: `spreading+${(i * 0.12).toFixed(2)}` })),
]);
shot("the bill's House sponsor", [
  stick('lawmaker', 760, 'explain', 'serious', { talk: true }),
  P('podium', { x: 760, y: 840, s: 1, a: { text: 'TN' }, in: 'none' }),
  label('Rep. Ed Butler (R)', 760, 150, { size: 64, at: 'Butler' }),
  label("the bill's House sponsor", 760, 220, { size: 44, color: COL.grey, at: 'sponsor' }),
  C('people', { x: 1550, y: 900, n: 3, gap: 140, s: 0.55, in: 'none', at: 'lawmakers', cast: ['governor', 'rep', 'analyst'] }),
]);
shot('In Tennessee, we love data centers', [
  stick('lawmaker', 520, 'up', 'happy', { talk: true }),
  P('heart', { x: 1100, y: 380, s: 1.1, idle: 'beat', at: 'love' }),
  P('dataCenter', { x: 1400, y: 640, s: 0.8, at: 'data centers' }),
  T('"In Tennessee, we love data centers."', { x: 960, y: 140, size: 60, at: 'Tennessee' }),
]);
shot('Then he said they wanted guardrails', [
  P('guardrail', { x: 960, y: 700, s: 1.6, at: 'guardrails' }),
  ...houses(3, 640, 520, 320, 0.6),
  label('to protect ratepayers', 960, 200, { size: 66, at: 'protect' }),
]);
shot('The translation, Come build here', [
  P('sign', { x: 640, y: 420, s: 1.2, a: { text: 'COME BUILD HERE!', w: 520, size: 56, fill: '#fff8e1' } }),
  P('dataCenter', { x: 1350, y: 600, s: 1, at: 'build' }),
]);
shot('Just bring your own wallet', [
  P('dataCenter', { x: 760, y: 600, s: 1.2 }),
  P('wallet', { x: 1150, y: 360, s: 1, a: { cash: true }, at: 'wallet', idle: 'wiggle' }),
  mascot(1600, 'point>1150,360', 'smug', { look: [1150, 360] }),
]);
shot("Now, it's not airtight", [
  P('lawScroll', { x: 760, y: 470, s: 1.3, a: { title: 'TN LAW' } }),
  P('cobweb', { x: 870, y: 350, s: 0.5, at: 'airtight' }),
  label('not airtight', 760, 120, { size: 72, color: COL.orange, at: 'airtight' }),
  mascot(1550, 'shrug', 'skeptical'),
]);
shot('The law still lets utilities share', [
  stick('utility', 440, 'present', 'neutral'),
  ...houses(3, 1000, 640, 280, 0.6),
  ...[1000, 1280, 1560].map((x, i) => C('flow', { from: [620, 520], to: [x, 560], prop: 'coin', n: 2, s: 0.2, in: 'none', at: `share+${(i * 0.1).toFixed(1)}`, arc: 60 })),
  label('if upgrades help others too', 1280, 260, { size: 56, at: 'other customers' }),
]);
shot('or if they follow the normal rules', [
  P('paper', { x: 760, y: 470, s: 1.5, a: { title: 'NORMAL RULES', lines: 4, w: 320, size: 34 } }),
  label('for all large customers', 1400, 420, { size: 60, at: 'large' }),
]);
shot('But it flips the starting point', [
  P('sign', { x: 960, y: 400, s: 1.3, a: { text: 'YOU PAY', w: 460, size: 70 }, out: 'flips+0.25', outAnim: 'pop' }),
  P('sign', { x: 960, y: 400, s: 1.3, a: { text: 'DATA CENTER PAYS', w: 560, size: 56, fill: '#e8f6df' }, at: 'flips+0.25', in: 'spin' }),
]);
shot('In Tennessee, the default is now', [
  P('dataCenter', { x: 560, y: 560, s: 1.1 }),
  C('flow', { from: [760, 480], to: [1250, 480], prop: 'cash', n: 4, s: 0.3, in: 'none', at: 'pays' }),
  P('substation', { x: 1450, y: 620, s: 0.7 }),
  label('default: the data center pays', 960, 160, { size: 62, color: COL.green, at: 'default' }),
]);
shot('Not you', { punch: ['you', 1.06] }, [
  stick('joe', 960, 'up', 'happy', { s: 1.2, y: 960 }),
  big('NOT YOU', 960, 200, { size: 130, color: COL.green, at: 'you' }),
]);
shot('A couple of months later', [
  stick('governor', 400, 'presentL', 'neutral', { flip: true }),
  C('people', { x: 1180, y: 900, n: 7, gap: 120, s: 0.55, in: 'none', at: '22', cast: ['rep', 'governor', 'lawmaker', 'analyst', 'dad', 'investor2', 'lender'] }),
  big('+22 governors', 1180, 260, { size: 90, color: COL.red, at: '22' }),
]);
shot('in signing a White House', [
  P('whiteHouse', { x: 640, y: 560, s: 1.2 }),
  P('paper', { x: 1400, y: 480, s: 1.4, a: { title: 'PLEDGE', lines: 3, sign: true, size: 46 }, at: 'pledge' }),
  label('ratepayer protection pledge', 1150, 150, { size: 60, at: 'protection' }),
]);
shot('A promise that households', [
  P('paper', { x: 600, y: 470, s: 1.5, a: { title: 'PLEDGE', lines: 3, sign: true, size: 46 } }),
  ...houses(3, 1100, 640, 260, 0.6),
  P('check', { x: 1360, y: 330, s: 0.8, at: 'foot' }),
  label("won't foot the bill", 1360, 160, { size: 62, at: 'foot' }),
]);
shot('But that pledge is voluntary', [
  P('paper', { x: 760, y: 470, s: 1.5, a: { title: 'PLEDGE', lines: 3, sign: true, size: 46 } }),
  stamp('VOLUNTARY', 760, 500, { at: 'voluntary', color: COL.orange, size: 84 }),
  mascot(1550, 'shrug', 'skeptical'),
]);
shot("The Tennessee law isn't", [
  P('lawScroll', { x: 760, y: 470, s: 1.4, a: { title: 'TN LAW' } }),
  stamp('REQUIRED', 760, 500, { at: 'law', color: COL.green, size: 84 }),
  mascot(1550, 'fist', 'happy'),
]);

// ---------- recap ----------
shot('So what we have is this', [
  mascot(960, 'explain', 'serious', { s: 0.92 }),
]);
shot("A grid that's charging everyone", [
  P('tower', { x: 340, y: 520, s: 0.9 }),
  C('gridOf', { x: 1000, y: 600, prop: 'tableSmall', cols: 4, rows: 2, gx: 200, gy: 170, s: 0.8, in: 'none', at: 'ready' }),
  P('ghost', { x: 1580, y: 470, s: 0.8, idle: 'float', at: 'shown up' }),
  label('1. charging for no-shows', 960, 150, { size: 64 }),
]);
shot('A forecast where almost all the growth', [
  label('2. growth = one industry', 960, 150, { size: 64 }),
  C('splitbar', { x: 960, y: 450, w: 1300, h: 130, segments: [{ v: 30, color: COL.orange, label: 'data centers', at: 'growth', size: 50 }, { v: 2, color: '#9aa3ad', label: '' }] }),
  P('dataCenter', { x: 960, y: 720, s: 0.8, at: 'one industry' }),
]);
shot('Power plants and power lines', [
  label('3. paid off over decades', 960, 150, { size: 64 }),
  P('gasPlant', { x: 380, y: 580, s: 0.8 }), P('tower', { x: 800, y: 540, s: 0.9 }),
  C('people', { x: 1400, y: 900, n: 3, gap: 170, s: 0.7, face: 'sad', in: 'none', at: 'families', cast: ['mom', 'kid', 'dad'] }),
]);
shot('And an industry that could look', [
  label('4. could change fast', 960, 150, { size: 64 }),
  P('dataCenter', { x: 700, y: 560, s: 1.1 }),
  P('question', { x: 700, y: 320, s: 0.8, idle: 'bob', at: 'different' }),
  P('calendar', { x: 1400, y: 460, s: 1.1, a: { top: 'IN', text: '5 YRS?', size: 56 }, at: 'five years' }),
]);
shot('About half of American adults say they never', { zoom: [1, 1.04] }, [
  C('people', { x: 660, y: 800, n: 8, gap: 150, s: 0.82, in: 'none', per: 0.03 }),
  circ(360, 600, 300, 270, { at: 'half', color: COL.red }),
  P('chatBubble', { x: 1010, y: 230, s: 0.85, a: { text: 'AI' }, at: 'chatbots' }),
  P('xmark', { x: 1010, y: 230, s: 0.8, at: 'chatbots+0.3' }),
  mascot(1560, 'point>640,520', 'calm', { look: [640, 520] }),
]);
shot("They're paying for the build-out anyway", [
  ...houses(3, 300, 650, 260, 0.7),
  P('dataCenter', { x: 1450, y: 560, s: 1, alpha: 0.5 }),
  stick('worker', 1150, 'holdR', 'neutral', { hold: { prop: 'wrench', s: 0.4, rot: -0.6 } }),
  ...[300, 560, 820].map((x, i) => C('flow', { from: [x, 560], to: [1350, 520], n: 3, s: 0.22, prop: 'coin', in: 'none', at: `paying+${(i * 0.12).toFixed(2)}`, arc: 60, dur: 1.5 })),
]);
shot('The restaurant is still holding', restaurantBg(), [
  C('gridOf', { x: 960, y: 560, prop: 'table', a: { reserved: true }, cols: 5, rows: 2, gx: 330, gy: 220, s: 0.55, in: 'none', per: 0.02 }),
  big('40 TABLES', 960, 150, { size: 90, at: '40' }),
]);
shot('the party still', restaurantBg(), [
  P('door', { x: 760, y: 570, s: 1.1, a: { sign: 'PARTY ROOM' } }),
  P('partyHat', { x: 1050, y: 870, s: 0.5, rot: 1.4 }),
  label('still waiting...', 1400, 330, { size: 72, at: 'arrived' }),
  stick('waiter', 1450, 'rest', 'bored'),
]);
shot('and every month, the reservation fee', [
  P('bill', { x: 760, y: 480, s: 1.4, a: { receipt: true, title: 'EVERY MONTH', items: [['Your power', '$$'], ['Reservation fee', '$$', COL.red]], w: 440, h: 400, itemSize: 34, gap: 66 } }),
  circ(760, 432, 330, 52, { at: 'fee' }),
  stick('joe', 1500, 'facepalm', 'annoyed'),
]);
shot('The AI boom might be a bubble', [
  P('bubble', { x: 760, y: 430, s: 2, idle: 'float' }),
  T('AI', { x: 760, y: 430, size: 130, color: COL.blue, idle: 'float' }),
  mascot(1550, 'shrug', 'skeptical'),
]);
shot('Your electric bill', { punch: ["isn't", 1.06] }, [
  P('bill', { x: 760, y: 470, s: 1.4, a: { total: '$$$' } }),
  stamp('REAL', 760, 500, { at: "isn't", size: 120 }),
  mascot(1550, 'point>760,470', 'serious', { look: [760, 470] }),
]);

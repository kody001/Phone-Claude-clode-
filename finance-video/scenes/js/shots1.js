'use strict';
// Section 1: cold open -> why bills are rising -> the restaurant analogy -> what PJM is.

// ---------- cold open ----------
shot('About half of American adults', { zoom: [1, 1.04] }, [
  C('people', { x: 660, y: 800, n: 8, gap: 150, s: 0.82, in: 'none', per: 0.05 }),
  circ(360, 600, 300, 270, { at: 'half', color: COL.red }),
  T('ABOUT HALF', { x: 360, y: 250, size: 84, color: COL.red, at: 'half' }),
  P('chatBubble', { x: 1010, y: 230, s: 0.85, a: { text: 'AI' }, at: 'chatbots' }),
  P('xmark', { x: 1010, y: 230, s: 0.8, at: 'chatbots+0.3' }),
  mascot(1560, 'point>640,520@half', 'neutral', { look: [640, 520] }),
]);
shot('Not ChatGPT', [
  P('chatBubble', { x: 330, y: 400, a: { text: 'ChatGPT', w: 330, size: 50 }, at: 'ChatGPT' }),
  P('xmark', { x: 330, y: 400, s: 0.8, at: 'ChatGPT+0.35' }),
  P('chatBubble', { x: 790, y: 400, a: { text: 'Gemini', w: 300, size: 50 }, at: 'Gemini' }),
  P('xmark', { x: 790, y: 400, s: 0.8, at: 'Gemini+0.3' }),
  P('chatBubble', { x: 1250, y: 400, a: { text: 'Copilot', w: 300, size: 50 }, at: 'Copilot' }),
  P('xmark', { x: 1250, y: 400, s: 0.8, at: 'Copilot+0.3' }),
  mascot(1680, 'stop', 'skeptical', { s: 0.72 }),
]);
shot('Never', { punch: ['Never', 1.07] }, [
  big('NEVER.', 760, 430, { size: 230 }),
  mascot(1480, 'cross', 'serious'),
]);
shot("That's according to Pew", [
  doc({ x: 800, y: 430, w: 1100, kicker: 'Pew Research Center', title: 'About half of American adults say they never use AI chatbots', body: 'Not ChatGPT, not Gemini, not Copilot. For a lot of people, AI chatbots just are not part of daily life.', hl: [{ text: 'not part of daily life.', at: 'Research' }], source: 'Source: Pew Research Center' }),
  peek('R', 'point>1150,330', 'neutral', { look: [900, 330] }),
]);
shot('For a lot of those people', [
  stick('grandma', 520, 'rest', 'confused'),
  stick('dad', 900, 'scratch', 'confused'),
  stick('neighbor', 1280, 'shrug', 'confused'),
  P('chatBubble', { x: 900, y: 250, s: 0.8, a: { text: 'AI?' }, at: 'AI' }),
  P('question', { x: 520, y: 420, s: 0.55, at: 'part', idle: 'bob' }),
  P('question', { x: 1280, y: 420, s: 0.55, at: 'life', idle: 'bob' }),
]);
shot("They don't ask it questions", [
  stick('joe', 620, 'cross', 'bored'),
  P('laptop', { x: 1180, y: 600, s: 1.2, a: { text: 'Ask AI anything...', size: 26 } }),
  P('xmark', { x: 1180, y: 540, s: 0.8, at: 'questions' }),
]);
shot("They don't use it for work", [
  stick('worker', 560, 'holdR', 'neutral', { hold: { prop: 'wrench', s: 0.45, rot: -0.6 } }),
  P('office', { x: 1060, y: 620, s: 1 }),
  P('chip', { x: 1450, y: 400, s: 0.8, at: 'work' }),
  P('xmark', { x: 1450, y: 400, s: 0.8, at: 'work+0.3' }),
]);
shot("they don't really think", [
  P('couch', { x: 820, y: 800, s: 1.1 }),
  stick('dad', 760, 'rest', 'sleepy', { sit: true }),
  T('z z z', { x: 980, y: 420, size: 70, idle: 'float', at: 'think' }),
  C('bubble', { x: 1360, y: 300, thought: true, text: '...', w: 300, h: 170, tail: 'bl', at: 'at all' }),
]);
shot('but a lot of them are paying', [
  stick('joe', 420, 'holdR', 'worried', { hold: { prop: 'wallet', s: 0.4, a: { cash: true } } }),
  P('dataCenter', { x: 1420, y: 600, s: 0.85 }),
  C('flow', { from: [580, 560], to: [1300, 520], n: 5, s: 0.32, in: 'none', at: 'paying' }),
  big('$$$', 940, 300, { at: 'anyway', size: 110, color: COL.green }),
]);
shot('Every', { punch: ['Month', 1.06] }, [
  P('calendar', { x: 420, y: 460, s: 1.25, a: { top: 'MONTH 1', text: 'BILL', size: 64 }, at: 'Every' }),
  P('calendar', { x: 960, y: 460, s: 1.25, a: { top: 'MONTH 2', text: 'BILL', size: 64 }, at: 'Single' }),
  P('calendar', { x: 1500, y: 460, s: 1.25, a: { top: 'MONTH 3', text: 'BILL', size: 64 }, at: 'Month' }),
]);
shot("It just doesn't say", [
  P('bill', { x: 760, y: 470, s: 1.25, a: { items: [['Energy', '$$'], ['Delivery', '$$'], ['Taxes & fees', '$']], total: '$$$' } }),
  P('magnifier', { x: 640, y: 360, s: 0.8, at: 'say', in: 'pop', move: [[900, 520, 'anywhere', 1.1]] }),
  P('question', { x: 1180, y: 250, s: 0.7, at: 'AI', idle: 'bob' }),
  mascot(1560, 'think', 'skeptical'),
]);
shot('It says', [
  P('bill', { x: 800, y: 470, s: 1.25, a: { items: [['Electricity', '$$$']], total: '$$$' } }),
  circ(720, 358, 170, 48, { at: 'Electricity' }),
  T('(AI is in here)', { x: 1250, y: 300, size: 56, color: COL.red, at: 'Electricity+0.4', rot: -0.05 }),
  peek('L', 'point>700,360', 'smug', { look: [700, 360] }),
]);
shot("Now, you'd think", [
  stick('joe', 560, 'holdR', 'neutral', { hold: { prop: 'laptop', a: { text: 'Type a message...', size: 22 }, s: 0.55, dx: 40 } }),
  T('0 words typed', { x: 1130, y: 320, size: 72, color: COL.red, at: 'single word' }),
  P('chatBubble', { x: 1130, y: 560, s: 0.75, a: {}, at: 'chatbot' }),
  mascot(1600, 'explain', 'neutral', { s: 0.72 }),
]);
shot("you wouldn't be paying", [
  stick('joe', 450, 'stop', 'happy'),
  P('dataCenter', { x: 1260, y: 580, s: 1 }),
  P('bolt', { x: 1260, y: 300, s: 0.6, at: 'power', idle: 'pulse' }),
  C('bubble', { x: 560, y: 260, text: 'Not my bill!', w: 330, h: 150, tail: 'bl', at: 'paying' }),
]);
shot("That's how paying", [
  C('board', { x: 800, y: 420, w: 920, h: 420, text: 'Use it  =  pay for it', size: 80 }),
  mascot(1620, 'pointer>1150,420', 'neutral', { look: [1100, 420] }),
]);
shot('You use it, you pay', [
  P('bulb', { x: 330, y: 430, s: 1.1, a: { on: true }, at: 'use' }),
  arrow([470, 430], [700, 430], { at: 'pay', color: COL.ink }),
  P('cash', { x: 860, y: 430, s: 0.85, at: 'pay' }),
  P('check', { x: 1100, y: 430, s: 0.8, at: 'pay+0.4' }),
  mascot(1580, 'explain', 'happy'),
]);
shot("you don't use it, you don't", [
  P('bulb', { x: 330, y: 430, s: 1.1, a: { on: false }, at: 'use' }),
  arrow([470, 430], [700, 430], { at: 'use+0.3', color: COL.ink }),
  P('wallet', { x: 860, y: 430, s: 0.8, at: 'use+0.4' }),
  P('check', { x: 1100, y: 430, s: 0.8, at: "don't+0.3" }),
  mascot(1580, 'explain', 'neutral'),
]);
shot('Except', [
  P('tower', { x: 300, y: 520, s: 1.05 }), P('tower', { x: 800, y: 520, s: 1.05 }), P('tower', { x: 1300, y: 520, s: 1.05 }),
  wire([395, 394], [705, 394], { sag: 30 }), wire([895, 394], [1205, 394], { sag: 30 }), wire([395, 447], [705, 447], { sag: 30 }), wire([895, 447], [1205, 447], { sag: 30 }),
  stamp('NOT HOW IT WORKS', 800, 200, { at: 'not how', size: 74 }),
  mascot(1660, 'one', 'serious', { s: 0.72 }),
]);
shot("And no, this isn't", [
  P('corkboard', { x: 760, y: 430, s: 1.1 }),
  P('xmark', { x: 760, y: 430, s: 1.7, at: 'conspiracy' }),
  label('conspiracy theory?', 760, 120, { size: 70, at: 'conspiracy' }),
  mascot(1560, 'stop', 'smug'),
]);
shot("It's in the auction", [
  P('gavel', { x: 380, y: 470, s: 1.1, in: 'drop' }),
  doc({ x: 1120, y: 430, w: 880, kicker: 'Capacity auction', title: 'Auction results', body: 'Every capacity auction publishes its results: the prices, how much was bought, and what drove the cost.', hl: [{ text: 'what drove the cost.', at: 'results' }] }),
]);
shot("It's in the grid", [
  P('paper', { x: 640, y: 450, s: 1.5, a: { title: 'FORECAST', lines: 0, w: 280, size: 36 } }),
  trend(640, 500, { w: 260, h: 170, at: 'grid', lw: 10 }),
  stick('analyst', 1250, 'present', 'smug', { flip: true }),
  label("grid operators' own", 640, 140, { size: 60, at: 'own' }),
]);
shot('And by the end', [
  mascot(420, 'point>1250,520@building', 'neutral', { look: [1250, 520] }),
  P('dataCenter', { x: 1250, y: 560, s: 1, at: 'building' }),
  P('question', { x: 1250, y: 290, s: 0.7, at: 'never seen', idle: 'bob' }),
]);
shot('in a state you might', (() => {
  const mx = 900, my = 470, ms = 1.35;
  const dc = mapPt(-77.6, 38.9, mx, my, ms), you = mapPt(-97.5, 35.5, mx, my, ms);
  return [
    P('usMap', { x: mx, y: my, s: ms, in: 'none' }),
    P('dataCenter', { x: dc[0], y: dc[1] - 60, s: 0.32, at: 'state' }),
    P('pin', { x: dc[0], y: dc[1], s: 0.6, at: 'state' }),
    P('house', { x: you[0], y: you[1] - 50, s: 0.38, at: 'live' }),
    P('pin', { x: you[0], y: you[1], s: 0.6, a: { color: COL.blue }, at: 'live' }),
    label('you', you[0], you[1] - 150, { at: 'live', color: COL.blue }),
    arrow([dc[0] - 40, dc[1] - 90], [you[0] + 60, you[1] - 110], { at: 'live+0.3', bend: 0.25, color: COL.red }),
  ];
})());
shot('ends up on your bill', [
  P('bill', { x: 760, y: 470, s: 1.25, a: { items: [['Energy', '$$'], ['Delivery', '$$'], ['Capacity', '$$', COL.red]], total: '$$$' } }),
  circ(760, 450, 200, 50, { at: 'bill' }),
  peek('R', 'point>950,450', 'shocked', { look: [900, 450] }),
]);

// ---------- prices are up ----------
shot('In February', [
  P('calendar', { x: 360, y: 430, s: 1.1, a: { top: 'FEB', text: 'FEB', size: 66 } }),
  P('house', { x: 780, y: 520, s: 1.1, at: 'residential' }),
  big('+7.4%', 1320, 380, { size: 180, at: '7.4%' }),
  trend(1320, 640, { w: 380, h: 170, at: '7.4%' }),
]);
shot('according to the Energy', [
  doc({ x: 760, y: 450, w: 1100, kicker: 'U.S. Energy Information Administration', title: 'Residential electricity prices up 7.4% from a year earlier', body: 'In February, residential electricity prices across the country were 7.4% higher than in February of the year before.', hl: [{ text: '7.4% higher', at: 'Administration' }], source: 'Source: U.S. EIA' }),
  peek('R', 'point>1150,300', 'neutral', { look: [1000, 300] }),
]);
shot('and the EIA expected the average', [
  P('meter', { x: 640, y: 470, s: 1.6 }),
  label('average price this year?', 640, 200, { size: 64, at: 'average' }),
  mascot(1450, 'think', 'thinking'),
]);
shot('to land around', [
  C('bars', { x: 760, y: 450, w: 900, h: 620, title: 'Average residential price', sub: 'cents per kilowatt hour', bars: [{ label: '2025', value: 17.3, text: '17.3¢', color: COL.blue, at: '17.3' }, { label: 'This year (forecast)', value: 18, text: '~18¢', color: COL.red, at: '18 cents' }], max: 20, source: 'Source: U.S. EIA' }),
  mascot(1580, 'pointer>1000,330', 'neutral', { look: [1000, 330] }),
]);
shot('Now, there are some easy', [
  C('board', { x: 720, y: 420, w: 840, h: 430, text: 'Easy explanations:\n1. ...\n2. ...', size: 66 }),
  mascot(1520, 'explain', 'neutral'),
]);
shot('and to be fair', [
  C('board', { x: 720, y: 420, w: 840, h: 430, text: 'Easy explanations', size: 72, writeDur: 0.01 }),
  stamp('SOME ARE REAL', 720, 520, { at: 'real', color: COL.green, size: 72 }),
  mascot(1520, 'hips', 'calm'),
]);

// ---------- reason 1: fuel ----------
shot('The first one is fuel', [
  big('#1', 420, 380, { size: 210, color: COL.ink }),
  label('FUEL', 420, 580, { size: 120, color: COL.orange, at: 'fuel' }),
  P('flame', { x: 980, y: 470, s: 1.6, a: { burner: true }, at: 'fuel' }),
  mascot(1560, 'presentL', 'neutral'),
]);
shot("A lot of America's", [
  P('gasPlant', { x: 460, y: 580, s: 1.1 }),
  P('flame', { x: 610, y: 330, s: 0.45, at: 'natural gas' }),
  arrow([720, 540], [1000, 540], { at: 'electricity', color: COL.ink }),
  P('bolt', { x: 1110, y: 420, s: 0.5, at: 'electricity', idle: 'pulse' }),
  P('house', { x: 1460, y: 580, s: 1.1, at: 'burning' }),
]);
shot('and gas often sets', [
  P('flame', { x: 560, y: 500, s: 1.4 }),
  arrow([720, 470], [930, 430], { at: 'sets', color: COL.ink }),
  P('tag', { x: 1120, y: 420, s: 1.3, a: { text: 'PRICE', size: 56 }, at: 'price', idle: 'sway' }),
  label('the price of power', 1120, 620, { size: 60, at: 'power' }),
  mascot(1660, 'hips', 'smug', { s: 0.72 }),
]);
shot('The EIA expected wholesale', [
  P('flame', { x: 400, y: 480, s: 1.2 }),
  big('+16%', 920, 420, { size: 200, at: '16%' }),
  label('wholesale natural gas', 920, 640, { size: 56, at: 'wholesale' }),
  trend(1420, 470, { w: 340, h: 260, at: 'higher' }),
]);
shot('When the fuel costs more', [
  P('flame', { x: 360, y: 470, s: 1 }),
  T('+$', { x: 360, y: 230, size: 100, color: COL.red, at: 'costs more' }),
  arrow([520, 470], [800, 470], { at: 'the electricity', color: COL.ink }),
  P('bulb', { x: 960, y: 460, a: { on: true }, at: 'the electricity' }),
  T('+$', { x: 960, y: 230, size: 100, color: COL.red, at: 'electricity costs' }),
  arrow([1110, 470], [1360, 470], { at: 'electricity costs', color: COL.ink }),
  P('bill', { x: 1580, y: 480, s: 0.75, a: { total: '$$$' }, at: 'electricity costs+0.3' }),
]);

// ---------- reason 2: wires ----------
shot('The second one', [
  big('#2', 420, 380, { size: 210, color: COL.ink }),
  label('WIRES', 420, 580, { size: 120, color: COL.blue, at: 'wires' }),
  P('pole', { x: 1020, y: 560, s: 1.4, at: 'wires' }),
  mascot(1580, 'presentL', 'neutral'),
]);
shot('Researchers at Lawrence', [
  label('Lawrence Berkeley National Laboratory', 960, 140, { size: 60 }),
  stick('researcher', 620, 'holdR', 'thinking', { hold: { prop: 'magnifier', s: 0.5, rot: -0.4 } }),
  P('bill', { x: 1250, y: 520, s: 1.1, a: { total: '$$$' } }),
]);
shot('that a big part of the recent', [
  doc({ x: 760, y: 440, w: 1080, kicker: 'Lawrence Berkeley National Laboratory', title: 'What has been driving up power bills', body: 'A big part of the recent increase in bills comes from transmission and distribution: the poles, lines and substations that carry power to homes.', hl: [{ text: 'transmission and distribution:', at: 'transmission' }] }),
  peek('R', 'point>1100,380', 'thinking', { look: [1000, 380] }),
]);
shot('The poles', [
  P('pole', { x: 250, y: 560, s: 0.95, at: 'poles' }),
  P('tower', { x: 640, y: 520, s: 1, at: 'lines' }),
  wire([316, 413], [550, 400], { at: 'lines', sag: 25 }),
  P('substation', { x: 1080, y: 650, s: 0.8, at: 'substations' }),
  wire([730, 400], [990, 583], { at: 'substations', sag: 20 }),
  P('house', { x: 1600, y: 600, s: 1, at: 'house' }),
  wire([1180, 583], [1520, 520], { at: 'house', sag: 25 }),
]);
shot('A lot of that equipment', [
  P('pole', { x: 640, y: 560, s: 1.4, a: { old: true } }),
  P('cobweb', { x: 540, y: 300, s: 0.9, at: 'old' }),
  mascot(1460, 'facepalm', 'cringe'),
]);
shot('and replacing it costs', [
  P('tower', { x: 400, y: 520, s: 1.15 }),
  P('wrench', { x: 400, y: 260, s: 0.6, idle: 'wiggle', at: 'replacing' }),
  big('$10 BILLION', 1130, 340, { at: '$10', size: 140, color: COL.green }),
  label('a year, just for transmission', 1130, 500, { at: 'a year', size: 62 }),
  P('moneyBag', { x: 980, y: 720, s: 0.6, at: 'billion' }),
  P('moneyBag', { x: 1130, y: 730, s: 0.65, at: 'billion+0.15' }),
  P('moneyBag', { x: 1280, y: 720, s: 0.6, at: 'billion+0.3' }),
]);
shot('Add storm damage', [
  P('cloudStorm', { x: 520, y: 300, s: 1.2, at: 'storm', idle: 'bob' }),
  P('pole', { x: 560, y: 650, s: 0.95, rot: 0.28, at: 'damage' }),
  P('tower', { x: 1350, y: 540, s: 0.95, at: 'wildfire' }),
  P('fire', { x: 1350, y: 640, s: 1.1, at: 'wildfire' }),
  label('+ protection costs', 1350, 160, { size: 58, at: 'protection' }),
]);
shot('and your bill goes up', [
  P('bill', { x: 800, y: 470, s: 1.2, a: { items: [['Fuel', '$$'], ['Wires', '$$'], ['Storms & fire', '$']], total: '$$$' } }),
  trend(1350, 450, { w: 300, h: 260, at: 'goes up' }),
  peek('L', 'point>800,400', 'annoyed', { look: [800, 400] }),
]);
shot("And it's not that you're", [
  P('house', { x: 1300, y: 560, s: 1.5 }),
  stick('joe', 640, 'shrug', 'confused'),
  P('bulb', { x: 1300, y: 260, s: 0.55, a: { on: true }, at: 'power' }),
  label('same old usage', 640, 300, { size: 58, at: 'home' }),
]);
shot('The EIA expects household', [
  label('household demand growth', 900, 200, { size: 66 }),
  T('+0.5%', { x: 900, y: 450, size: 54, color: COL.green, at: 'half a percent' }),
  P('magnifier', { x: 900, y: 450, s: 1.5, at: 'half a percent+0.35' }),
  mascot(1580, 'pointer>1000,450', 'skeptical', { look: [950, 450] }),
]);
shot("Your house isn't", [
  P('house', { x: 700, y: 560, s: 1.5 }),
  label('not the thing that changed', 700, 220, { size: 60, at: 'changed' }),
  mascot(1480, 'point>700,520', 'calm', { look: [700, 500] }),
]);
shot("So let's be clear", { punch: ['clear', 1.06] }, [
  mascot(960, 'one', 'serious', { s: 0.95 }),
]);
shot('Data centers are not the only', [
  C('board', { x: 720, y: 420, w: 860, h: 470, text: 'Why bills are rising:\n- fuel\n- wires\n- data centers', size: 62 }),
  mascot(1560, 'pointer>1000,560', 'neutral', { look: [1000, 520] }),
]);
shot("But they're the part", [
  P('dataCenter', { x: 820, y: 500, s: 1.1 }),
  C('people', { x: 820, y: 920, n: 5, gap: 160, s: 0.5, pose: 'shrug', face: 'confused', in: 'none' }),
  P('question', { x: 520, y: 260, s: 0.6, at: 'nobody', idle: 'bob' }), P('question', { x: 1120, y: 260, s: 0.6, at: 'explains', idle: 'bob' }),
  peek('R', 'point>1000,450', 'smug', { look: [900, 450] }),
]);
shot("Because it's hidden", [
  P('bill', { x: 760, y: 470, s: 1.3, a: { items: [['Energy', '$$'], ['Delivery', '$$'], ['capacity charge', '$', '#9aa3ad']], total: '$$$' } }),
  P('magnifier', { x: 980, y: 380, s: 0.9, at: 'charge', move: [[690, 480, 'charge+0.1', 0.8]] }),
  stick('joe', 1500, 'scratch', 'confused'),
  P('question', { x: 1500, y: 380, s: 0.5, at: 'heard', idle: 'bob' }),
]);
shot("What's actually happening", [
  P('tower', { x: 960, y: 230, s: 0.55 }),
  houses(5, 280, 680, 340, 0.7),
  ...[280, 620, 960, 1300, 1640].map((x, i) => C('flow', { from: [x, 600], to: [960, 280], n: 3, s: 0.22, prop: 'coin', in: 'none', at: `everyone+${(i * 0.1).toFixed(1)}`, arc: 40, dur: 1.4 })),
  label('charging everyone', 1500, 200, { size: 60, color: COL.red, at: 'charging' }),
]);
shot('to get ready for customers', [
  P('dataCenter', { x: 860, y: 540, s: 1.2, alpha: 0.28 }),
  label('coming soon...?', 860, 250, { size: 84, at: 'shown up' }),
  mascot(1600, 'shrug', 'skeptical'),
]);

// ---------- the restaurant ----------
shot('And to understand how', [
  P('restaurant', { x: 760, y: 540, s: 1.6, a: { name: 'DINER' }, at: 'restaurant' }),
  mascot(1560, 'presentL', 'happy'),
]);
shot('Imagine you walk', restaurantBg(), [
  P('door', { x: 1500, y: 570, s: 1.1, a: { sign: 'DINER' } }),
  stick('joe', -120, 'rest', 'happy', { walk: true, move: [[1180, FY, 'walk', 1.8]] }),
]);
const dinerTable = (o = {}) => [
  P('chair', { x: 770, y: 820, s: 1.1, flip: true, in: 'none' }),
  stick('joe', 800, o.pose || 'rest', o.face || 'happy', Object.assign({ sit: true }, o.joe || {})),
  P('table', { x: 1080, y: 720, s: 1.2, in: 'none', a: o.table || {} }),
];
shot('You sit down', restaurantBg(), dinerTable());
shot('You order a burger', restaurantBg(), [
  ...dinerTable({ face: 'happy' }),
  C('bubble', { x: 620, y: 300, text: 'One burger,\nplease!', w: 380, h: 190, tail: 'br', at: 'order' }),
  stick('waiter', 1500, 'holdR', 'happy', { hold: { prop: 'paper', a: { lines: 3 }, s: 0.3 } }),
]);
shot('Nothing fancy', [
  P('plate', { x: 960, y: 650, s: 1.6 }),
  P('burger', { x: 960, y: 560, s: 1.5, in: 'drop' }),
  label('nothing fancy', 960, 240, { size: 84, at: 'fancy' }),
]);
shot('The bill comes', restaurantBg(), [
  ...dinerTable({ face: 'neutral' }),
  stick('waiter', 1750, 'holdR', 'happy', { walk: true, move: [[1380, FY, 0, 0.8]], hold: { prop: 'bill', a: { receipt: true, title: 'RECEIPT', w: 240, h: 300 }, s: 0.45 } }),
]);
shot('Burger. $15', [
  P('bill', { x: 820, y: 480, s: 1.5, a: { receipt: true, title: 'RECEIPT', items: [['Burger', '$15']], w: 440, h: 420, itemSize: 40, gap: 66 } }),
  peek('R', 'point>900,400', 'happy', { look: [900, 400] }),
]);
shot('And right underneath', [
  P('bill', { x: 820, y: 480, s: 1.5, in: 'none', a: { receipt: true, title: 'RECEIPT', items: [['Burger', '$15'], ['Table reservation fee', '$4', COL.red]], w: 440, h: 420, itemSize: 30, gap: 66 } }),
  circ(820, 411, 330, 52, { at: '$4' }),
  peek('R', 'point>900,420', ['neutral', 'shocked@$4'], { look: [900, 420], in: 'none' }),
]);
shot("You didn't reserve", restaurantBg(), [
  ...dinerTable({ face: 'confused', pose: 'shrug' }),
  label('RESERVED?', 1150, 280, { size: 90, color: COL.red, at: 'reserve' }),
]);
shot("You're already sitting", restaurantBg(), [
  ...dinerTable({ face: 'annoyed', pose: 'point>1080,700' }),
  T('sitting here!', { x: 1150, y: 300, size: 70, at: 'sitting' }),
]);
shot('So you call the waiter', restaurantBg(), [
  ...dinerTable({ face: 'confused', pose: 'wave' }),
  stick('waiter', 1800, 'rest', 'neutral', { walk: true, move: [[1450, FY, 'waiter', 1.0]] }),
  C('bubble', { x: 600, y: 290, text: "What's this\n$4 for?", w: 360, h: 190, tail: 'br', at: 'ask' }),
]);
shot('And he points', restaurantBg(), [
  P('door', { x: 420, y: 570, s: 1.1, a: { sign: 'BACK ROOM' } }),
  stick('waiter', 980, 'point>420,450', 'smug', { look: [420, 450] }),
  stick('joe', 1450, 'rest', 'confused', { look: [420, 450] }),
]);
shot('There are 40 empty', { zoom: [1, 1.08] }, [
  C('gridOf', { x: 960, y: 560, prop: 'tableSmall', cols: 8, rows: 4, gx: 205, gy: 140, s: 0.85, in: 'none', per: 0.025 }),
  big('40 EMPTY TABLES', 960, 150, { size: 100, at: '40' }),
]);
shot('Napkins folded', restaurantBg(), [
  P('table', { x: 960, y: 640, s: 2.0, in: 'none' }),
  P('napkin', { x: 880, y: 560, s: 1.1, at: 'Napkins', in: 'drop' }),
  P('glass', { x: 1080, y: 540, s: 0.9, at: 'Glasses' }),
  P('chair', { x: 560, y: 780, s: 1.4, flip: true, at: 'Chairs', in: 'slideL' }),
  P('chair', { x: 1360, y: 780, s: 1.4, at: 'Chairs', in: 'slideR' }),
]);
shot("They're being held", [
  P('sign', { x: 960, y: 260, s: 0.9, a: { text: 'RESERVED: GIANT PARTY', w: 640, size: 48 } }),
  C('people', { x: 960, y: 900, n: 9, gap: 175, s: 0.55, hats: true, alpha: 0.32, in: 'none', at: 'giant party' }),
  P('balloon', { x: 280, y: 330, at: 'party', idle: 'float', a: { color: COL.red } }),
  P('balloon', { x: 1640, y: 330, at: 'party', idle: 'float', a: { color: COL.blue } }),
  label('...at some point', 960, 470, { size: 60, at: 'some point' }),
]);
shot('Maybe next year', [
  P('calendar', { x: 420, y: 470, s: 1.3, a: { top: 'MAYBE', text: 'NEXT YR?', size: 46 } }),
  P('calendar', { x: 960, y: 470, s: 1.3, a: { top: 'MAYBE', text: 'YR AFTER?', size: 42 }, at: 'year after' }),
  P('calendar', { x: 1500, y: 470, s: 1.3, a: { top: 'MAYBE', text: 'NEVER?', size: 54 }, at: 'never' }),
  label('the party arrives...', 960, 160, { size: 62 }),
]);
shot('But to be ready', [
  P('restaurant', { x: 620, y: 560, s: 1.2 }),
  P('restaurant', { x: 1330, y: 560, s: 1.2, a: { name: '+ EXTRA ROOM' }, at: 'extra space', in: 'slideR' }),
  P('tag', { x: 1330, y: 200, s: 0.9, a: { text: 'RENT' }, at: 'rent' }),
]);
shot('buy the extra chairs', [
  C('gridOf', { x: 960, y: 560, prop: 'chair', cols: 7, rows: 2, gx: 220, gy: 250, s: 0.9, in: 'none', per: 0.04 }),
  P('tag', { x: 1650, y: 190, a: { text: '$$$' }, at: 'chairs' }),
]);
shot('and keep extra cooks', [
  C('people', { x: 860, y: 900, n: 5, gap: 250, s: 0.72, chef: true, in: 'none', cast: ['diner2', 'worker', 'student', 'dad', 'analyst'] }),
  P('phone', { x: 1640, y: 400, s: 0.6, idle: 'shake', at: 'on call' }),
  label('on call', 1640, 160, { size: 64, at: 'on call' }),
]);
shot('And somebody has to pay', [
  P('bill', { x: 700, y: 470, s: 1.3, a: { receipt: true, title: 'EXTRA COSTS', items: [['Extra space', '$$$'], ['Extra chairs', '$$$'], ['Extra cooks', '$$$']], w: 440, h: 400 } }),
  label('WHO PAYS?', 1400, 260, { size: 100, color: COL.red, at: 'pay' }),
  mascot(1420, 'shrug', 'skeptical', { s: 0.68 }),
]);
shot('So the cost gets split', restaurantBg(), [
  C('people', { x: 960, y: 920, n: 5, gap: 340, s: 0.75, cast: ['diner2', 'diner3', 'diner4', 'grandma', 'joe'], in: 'none' }),
  ...[0, 1, 2, 3, 4].map(i => P('bill', { x: 280 + i * 340, y: 360, s: 0.3, a: { receipt: true, title: 'SHARE', w: 220, h: 260 }, at: `split+${(0.2 + i * 0.15).toFixed(2)}`, idle: 'bob' })),
]);
shot('including the guy', restaurantBg(), [
  C('people', { x: 600, y: 920, n: 4, gap: 280, s: 0.7, cast: ['diner2', 'diner3', 'diner4', 'grandma'], in: 'none', alpha: 0.35 }),
  P('tableSmall', { x: 1700, y: 840, s: 1.3, in: 'none' }),
  stick('joe', 1500, 'rest', 'neutral', { sit: true }),
  P('burger', { x: 1700, y: 700, s: 0.35, at: 'burger' }),
  circ(1560, 640, 260, 340, { at: 'corner' }),
]);
shot('That guy is you', { punch: ['you', 1.08] }, [
  stick('joe', 1150, 'rest', 'shocked', { s: 1.3, y: 990 }),
  big('YOU', 520, 380, { size: 210, at: 'guy' }),
  arrow([680, 430], [960, 520], { at: 'guy+0.2' }),
]);

// ---------- PJM ----------
shot("That's basically how", (() => {
  const mx = 900, my = 450, ms = 1.35, out = [P('usMap', { x: mx, y: my, s: ms, in: 'none' })];
  [[-120, 46], [-104, 40], [-90, 33], [-84, 40], [-77, 41], [-98, 31], [-112, 35], [-94, 45]].forEach(([lo, la], i) => {
    const [x, y] = mapPt(lo, la, mx, my, ms);
    out.push(P('bolt', { x, y, s: 0.42, at: `grid+${(i * 0.12).toFixed(2)}`, idle: 'pulse' }));
  });
  out.push(peek('R', 'point>1100,420', 'neutral', { look: [1000, 420] }));
  return out;
})());
shot('The restaurant is a company', [
  P('restaurant', { x: 760, y: 560, s: 1.6, a: { name: 'PJM' }, at: 'restaurant' }),
  label('(the grid operator)', 760, 160, { size: 60, at: 'PJM' }),
  mascot(1560, 'presentL', 'smug'),
]);
shot("It's the largest grid", [
  P('tower', { x: 420, y: 560, s: 1 }), P('tower', { x: 1500, y: 560, s: 1 }),
  stick('pjm', 960, 'hips', 'smug', { s: 1.2, y: 960 }),
  big('#1 LARGEST', 960, 170, { size: 110, color: COL.orange, at: 'largest' }),
]);
const PJM_MAP = { mx: 880, my: 470, ms: 1.45 };
const pjmMap = (o = {}) => P('usMap', Object.assign({ x: PJM_MAP.mx, y: PJM_MAP.my, s: PJM_MAP.ms, a: { pjm: true }, in: 'none' }, o));
const pjmPt = (lon, lat) => mapPt(lon, lat, PJM_MAP.mx, PJM_MAP.my, PJM_MAP.ms);
shot('It runs the power system', [
  pjmMap({ in: 'pop' }),
  big('13 STATES + DC', 1500, 200, { size: 86, color: COL.orange, at: '13' }),
]);
shot('stretching from New Jersey', (() => {
  const nj = pjmPt(-74.5, 40.1), il = pjmPt(-89.2, 41.0);
  return [
    pjmMap(),
    P('pin', { x: nj[0], y: nj[1] - 30, s: 0.7, at: 'New Jersey' }),
    label('New Jersey', nj[0] + 150, nj[1] - 110, { size: 50, at: 'New Jersey' }),
    P('pin', { x: il[0], y: il[1] - 30, s: 0.7, at: 'Illinois' }),
    label('Illinois', il[0] - 120, il[1] - 110, { size: 50, at: 'Illinois' }),
    arrow([nj[0] - 20, nj[1] - 80], [il[0] + 30, il[1] - 80], { at: 'all the way', bend: 0.18, color: COL.ink, lw: 7 }),
  ];
})());
shot('If you live anywhere', (() => {
  const out = [pjmMap()];
  [[-75.5, 40.3], [-77.5, 38.6], [-80.0, 40.8], [-82.8, 40.0], [-86.0, 39.8], [-84.5, 38.0], [-78.8, 37.4], [-88.4, 41.6]].forEach(([lo, la], i) => {
    const [x, y] = pjmPt(lo, la);
    out.push(P('house', { x, y: y - 10, s: 0.2, at: `region+${(i * 0.08).toFixed(2)}` }));
  });
  out.push(label('anywhere in here', 1520, 220, { size: 60, at: 'anywhere' }));
  return out;
})());
shot('PJM is deciding', [
  stick('pjm', 520, 'holdR', 'neutral', { hold: { prop: 'paper', a: { title: 'PLAN', lines: 3, size: 34 }, s: 0.45 } }),
  P('table', { x: 1200, y: 730, s: 1, a: { reserved: true }, at: 'reserved' }),
  P('tag', { x: 1300, y: 330, s: 1, a: { text: '$$$' }, at: 'pay', idle: 'sway' }),
  label('how much you pay', 1250, 160, { size: 58, at: 'what you pay' }),
]);
shot('To do that, PJM runs', [
  stick('pjm', 760, 'holdUpR', 'excited', { hold: { prop: 'gavel', s: 0.5, rot: -0.5 } }),
  P('podium', { x: 760, y: 800, s: 1, a: { text: 'PJM' }, in: 'none' }),
  stamp('AUCTION', 1400, 360, { at: 'auction', color: COL.orange }),
]);
shot("But here's the thing", { punch: ['thing', 1.05] }, [
  mascot(960, 'one', 'smug', { s: 0.92 }),
]);
shot("It's not buying electricity", [
  P('bolt', { x: 760, y: 430, s: 1.6 }),
  P('xmark', { x: 760, y: 430, s: 1.8, at: 'electricity' }),
  mascot(1460, 'stop', 'serious'),
]);
shot("It's paying power plants", [
  stick('pjm', 330, 'present', 'neutral'),
  C('flow', { from: [520, 540], to: [1080, 520], prop: 'cash', n: 4, s: 0.3, in: 'none', at: 'paying' }),
  P('gasPlant', { x: 1500, y: 580, s: 1, at: 'plants' }),
  stick('plant', 1230, 'holdR', 'happy', { hold: { prop: 'contract', a: { title: 'PROMISE' }, s: 0.42, at: 'promise' } }),
  label('"we\'ll be there"', 1300, 200, { size: 62, at: 'available' }),
]);
shot('on the hottest', [
  P('sun', { x: 540, y: 350, s: 1.2, at: 'hottest', idle: 'pulse' }),
  P('thermometer', { x: 540, y: 690, s: 0.9, at: 'hottest' }),
  label('vs', 960, 460, { size: 90, at: 'coldest' }),
  P('snowflake', { x: 1380, y: 350, s: 1.1, at: 'coldest', idle: 'sway' }),
  P('thermometer', { x: 1380, y: 690, s: 0.9, a: { cold: true }, at: 'coldest' }),
]);
shot("The days when everyone's", [
  ...houses(4, 330, 640, 420, 0.8),
  ...[330, 750, 1170, 1590].map((x, i) => (i % 2 ? P('flame', { x: x + 120, y: 520, s: 0.35, a: { color: 'orange' }, at: `heat+${(i * 0.1).toFixed(1)}` }) : P('acUnit', { x: x + 120, y: 680, s: 0.38, at: `AC+${(i * 0.1).toFixed(1)}` }))),
  P('meter', { x: 960, y: 250, s: 0.9, at: 'same time' }),
  label('ALL AT ONCE', 1500, 230, { size: 64, color: COL.red, at: 'same time' }),
]);

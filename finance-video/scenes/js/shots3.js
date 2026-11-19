'use strict';
// Section 3: people are feeling it -> households behind -> "but data centers will pay" ->
// phantom demand -> what if the boom fizzles -> Wisconsin coal plant -> the fiber bubble.

shot('And people are already feeling it', [
  stick('joe', 760, 'holdR', 'worried', { hold: { prop: 'bill', a: { total: '$$$' }, s: 0.45 } }),
  label('already feeling it', 1350, 300, { size: 72, color: COL.red, at: 'feeling' }),
]);
shot('In October, Consumer Reports', [
  P('calendar', { x: 300, y: 380, s: 1, a: { top: 'OCT', text: 'SURVEY', size: 44 } }),
  stick('pollster', 640, 'holdR', 'neutral', { hold: { prop: 'paper', a: { lines: 4 }, s: 0.35 } }),
  C('people', { x: 1300, y: 900, n: 6, gap: 130, s: 0.55, in: 'none', at: 'surveyed' }),
  label('2,000+ American adults', 1300, 280, { size: 60, at: '2,000' }),
  label('Consumer Reports', 960, 120, { size: 62 }),
]);
shot('81% of people', [
  C('pie', { x: 620, y: 470, r: 240, pct: 81, color: COL.red, label: '81%' }),
  P('house', { x: 1400, y: 420, s: 1, at: 'same home' }),
  label('same home 3+ years', 1400, 640, { size: 54, at: 'three years' }),
]);
shot('said their electric bill had gone', [
  P('bill', { x: 700, y: 480, s: 1.2, a: { total: '$$$' } }),
  trend(1250, 470, { w: 420, h: 360, color: COL.red, at: 'UP' }),
  big('UP', 1250, 210, { size: 130, at: 'UP' }),
]);
shot('28% said it had jumped', [
  C('poll', { x: 760, y: 450, w: 1100, title: 'How much did your bill go up?', labelW: 330, rows: [{ label: 'Up 20% to 49%', pct: 28, color: COL.orange, at: '28%' }, { label: 'Up more than half', pct: 6, color: COL.red, at: '6%' }] }),
  peek('R', 'point>1100,400', 'shocked', { look: [1000, 400] }),
]);
shot("And this isn't just an annoying number", [
  P('phone', { x: 640, y: 470, s: 1.3, a: { screen: '#f4f7fb' } }),
  T('$$$', { x: 640, y: 440, size: 90, color: COL.red }),
  label('not just a number', 1300, 400, { size: 76, at: 'number' }),
]);
shot('About three out of four people', [
  C('people', { x: 760, y: 880, n: 3, gap: 230, s: 0.85, face: 'worried', in: 'none', cast: ['mom', 'dad', 'grandma'] }),
  C('people', { x: 1330, y: 880, n: 1, s: 0.85, alpha: 0.35, in: 'none', cast: ['student'] }),
  big('3 out of 4', 960, 200, { size: 110, at: 'three' }),
  label('straining their finances', 960, 330, { size: 62, at: 'straining' }),
]);
shot('People earning under', [
  C('bars', { x: 760, y: 470, w: 960, h: 600, title: 'Said the bill strains them "a lot"', bars: [{ label: 'Everyone else', value: 1, text: '1x', color: COL.blue, at: 'earning' }, { label: 'Earning under $85K', value: 2.15, text: 'more than 2x', color: COL.red, at: 'twice' }], max: 2.5 }),
  mascot(1600, 'facepalm', 'sad'),
]);
shot('About one in five Americans', [
  C('people', { x: 960, y: 880, n: 5, gap: 260, s: 0.8, in: 'none', cast: ['neighbor', 'dad', 'joe', 'student', 'grandma'] }),
  circ(1220, 700, 150, 250, { at: 'five' }),
  big('1 in 5', 960, 200, { size: 120, at: 'five' }),
]);
shot('cut back on groceries', [
  P('groceries', { x: 420, y: 560, s: 1.3, at: 'groceries' }),
  P('tag', { x: 960, y: 460, s: 1.1, a: { text: 'CHEAP', size: 48 }, at: 'cheaper' }),
  P('bill', { x: 1450, y: 480, s: 0.9, a: { total: '$$$' }, at: 'electric bill' }),
  label('...to keep up with the bill', 1150, 160, { size: 60, at: 'keep up' }),
]);
shot('Let that sink in', { zoom: [1.0, 1.08] }, [
  mascot(960, 'rest', 'sad', { s: 0.95 }),
]);
shot('People are deciding between', [
  P('bulb', { x: 400, y: 440, s: 1.2, a: { on: true }, at: 'lights' }),
  label('lights on', 400, 180, { size: 66, at: 'lights' }),
  stick('mom', 960, 'shrug', 'worried'),
  label('or', 960, 300, { size: 80, at: 'and what' }),
  P('fridge', { x: 1520, y: 560, s: 1, at: 'fridge' }),
  label('food', 1520, 180, { size: 66, at: 'fridge' }),
]);
shot('And for a lot of families', { bg: '#e6e8ec' }, [
  P('house', { x: 960, y: 520, s: 2.2, a: { lightOff: true } }),
  C('people', { x: 960, y: 920, n: 3, gap: 180, s: 0.7, face: 'sad', in: 'none', cast: ['dad', 'kid', 'mom'] }),
  label('past deciding', 960, 120, { size: 70, color: COL.red, at: 'past' }),
]);
shot('The National Energy Assistance', [
  doc({ x: 760, y: 440, w: 1080, kicker: 'National Energy Assistance Directors Association', title: 'About 21.5 million households are behind on their energy bills', body: 'That is roughly one in six homes in America falling behind on power and heating bills.', hl: [{ text: 'one in six homes', at: 'estimates' }] }),
  peek('R', 'point>1100,330', 'sad', { look: [1000, 330] }),
]);
shot('about 21.5 million households', [
  big('21.5 MILLION', 960, 200, { size: 130, at: '21.5' }),
  C('gridOf', { x: 960, y: 620, prop: 'house', cols: 9, rows: 2, gx: 190, gy: 200, s: 0.55, in: 'none', per: 0.03 }),
  label('households behind', 960, 330, { size: 60, at: 'behind' }),
]);
shot("That's roughly one in six homes", [
  ...houses(6, 360, 560, 240, 0.85),
  P('bill', { x: 1560, y: 330, s: 0.45, a: { title: 'PAST DUE', total: '$$$', color: COL.red }, in: 'drop', at: 'six' }),
  circ(1560, 560, 140, 140, { at: 'six+0.2' }),
  big('1 in 6', 760, 230, { size: 120, at: 'one in six' }),
]);
shot('As of the middle of 2025', [
  big('$23 BILLION', 760, 330, { size: 140, at: '$23' }),
  label('in past-due energy bills', 760, 480, { size: 62, at: 'past-due' }),
  P('bill', { x: 1450, y: 480, s: 1, a: { total: '$$$' } }),
  stamp('PAST DUE', 1450, 500, { at: 'past-due', size: 64 }),
]);
shot('and when you fall far enough behind', [
  P('pole', { x: 520, y: 560, s: 1.2 }),
  P('house', { x: 1250, y: 580, s: 1.4, out: 'cut' }),
  P('house', { x: 1250, y: 580, s: 1.4, a: { lightOff: true }, at: 'cut', in: 'none' }),
  wire([600, 390], [1090, 500], { sag: 25, out: 'cut' }),
  wire([600, 390], [760, 470], { sag: 10, at: 'cut' }),
  stamp('POWER CUT', 1250, 260, { at: 'cut', size: 80 }),
]);
shot('The same group estimated', [
  big('3.5 MILLION', 760, 300, { size: 130, at: '3.5' }),
  label('households shut off in 2024', 760, 450, { size: 58, at: 'shut off' }),
  ...[0, 1, 2, 3].map(i => P('house', { x: 400 + i * 240, y: 700, s: 0.7, a: { lightOff: true }, at: `shut+${(i * 0.1).toFixed(1)}` })),
  P('candle', { x: 1550, y: 560, s: 1.2, at: 'electricity' }),
]);
shot('and expected that number to climb', [
  C('bars', { x: 760, y: 470, w: 900, h: 600, title: 'Households with power shut off', bars: [{ label: '2024', value: 3.5, text: '3.5M', color: COL.blue }, { label: '2025 (expected)', value: 4, text: '~4M', color: COL.red, at: '4 million' }], max: 4.6 }),
  mascot(1600, 'point>1000,350', 'worried', { look: [1000, 350] }),
]);
shot('None of those households', [
  P('laptop', { x: 700, y: 470, s: 1.5, a: { text: 'AI PREMIUM?', size: 40 } }),
  P('xmark', { x: 700, y: 420, s: 1.2, at: 'subscription' }),
  stick('mom', 1400, 'stop', 'annoyed'),
]);
shot("but they're helping pay", [
  ...houses(3, 300, 640, 260, 0.7),
  P('dataCenter', { x: 1450, y: 560, s: 1 }),
  ...[300, 560, 820].map((x, i) => C('flow', { from: [x, 560], to: [1350, 520], n: 3, s: 0.22, prop: 'coin', in: 'none', at: `pay+${(i * 0.15).toFixed(2)}`, arc: 60, dur: 1.5 })),
  label('anyway', 960, 200, { size: 80, color: COL.red, at: 'anyway' }),
]);

// ---------- the objection ----------
shot('But I know what some of you', [
  mascot(760, 'think', 'smug', { s: 0.9 }),
  C('bubble', { x: 1350, y: 330, thought: true, text: '...', w: 360, h: 200, tail: 'bl', at: 'thinking' }),
]);
shot('Okay, so data centers are pushing', [
  stick('techbro', 520, 'explain', 'smug', { talk: true }),
  C('bubble', { x: 1200, y: 330, text: 'OK, data centers\npush costs up...', w: 560, h: 240, tail: 'bl', at: 'data centers' }),
]);
shot("Once they're up and running", [
  P('dataCenter', { x: 600, y: 560, s: 1.2 }),
  P('bill', { x: 1300, y: 470, s: 1.5, a: { title: 'DATA CENTER BILL', titleSize: 28, total: '$$$$$$' }, at: 'massive' }),
  C('flow', { from: [700, 450], to: [1220, 420], n: 4, s: 0.3, prop: 'cash', in: 'none', at: 'paying' }),
]);
shot('That spreads the cost around', [
  stick('techbro', 520, 'shrug', 'smug', { talk: true }),
  ...houses(3, 1050, 650, 260, 0.6),
  label('cheaper for everyone?', 1300, 300, { size: 62, at: 'right' }),
]);
shot('Maybe, if they show up', [
  P('dataCenter', { x: 760, y: 560, s: 1.3, alpha: 0.25 }),
  P('question', { x: 760, y: 300, s: 0.9, at: 'show up', idle: 'bob' }),
  mascot(1550, 'hips', 'smug'),
]);
shot('Because even PJM', [
  stick('pjm', 520, 'holdR', 'skeptical', { hold: { prop: 'rsvp', a: { q: true }, s: 0.45 } }),
  P('rsvp', { x: 1100, y: 460, s: 1, a: { q: true }, rot: -0.08, at: 'RSVPs' }),
  P('rsvp', { x: 1400, y: 470, s: 1, a: { q: true }, rot: 0.08, at: 'RSVPs+0.15' }),
]);
shot('Modo Energy found that utilities', [
  stick('utility', 420, 'holdR', 'excited', { hold: { prop: 'paper', a: { title: '60 GW', size: 50, lines: 2 }, s: 0.5 } }),
  stick('pjm', 1500, 'rest', 'skeptical', { look: [420, 500] }),
  big('~60 GW', 960, 260, { size: 140, color: COL.orange, at: '60' }),
  label('new large-load demand by 2030', 960, 400, { size: 56, at: 'large' }),
]);
shot('PJM only accepted 34', [
  C('bars', { x: 760, y: 470, w: 900, h: 600, title: 'New large-load demand by 2030 (GW)', bars: [{ label: 'Utilities asked for', value: 60, text: '~60', color: COL.orange }, { label: 'PJM accepted', value: 34, text: '34', color: COL.blue, at: 'accepted' }], max: 68 }),
  stick('pjm', 1600, 'cross', 'serious'),
]);
shot('It cut the guest list', [
  P('paper', { x: 700, y: 470, s: 1.6, a: { title: 'GUEST LIST', lines: 5, w: 300, size: 36 } }),
  ...[0, 1].map(i => wire([560, 455 + i * 54], [840, 455 + i * 54], { sag: 0, color: COL.red, lw: 9, at: `guest+${(0.3 + i * 0.2).toFixed(1)}` })),
  big('-40%+', 1350, 400, { size: 150, at: '40%' }),
  label('before the party even started', 1350, 560, { size: 52, at: 'party' }),
]);
shot("Maryland's consumer advocate has even", [
  stick('advocate', 460, 'point>1150,450', 'serious', { look: [1150, 450] }),
  P('ghost', { x: 1150, y: 460, s: 1.4, idle: 'float', at: 'phantom' }),
  P('dataCenter', { x: 1150, y: 520, s: 0.3, alpha: 0.6, at: 'phantom' }),
  label('PHANTOM DEMAND', 1150, 150, { size: 80, color: COL.purple, at: 'phantom' }),
]);
shot('requests for power from projects', [
  P('paper', { x: 520, y: 470, s: 1.3, a: { title: 'REQUEST', lines: 4 } }),
  P('sign', { x: 1250, y: 420, s: 1, a: { text: 'COMING SOON?', w: 420, size: 50 } }),
  label('may never get built', 1250, 140, { size: 62, color: COL.red, at: 'never' }),
]);
shot('And as the agency pointed out', [
  stick('advocate', 760, 'one', 'serious', { talk: true }),
  label('the agency pointed out...', 1300, 300, { size: 62, at: 'pointed' }),
]);
shot('utilities can still benefit', [
  stick('utility', 620, 'holdR', 'greedy', { hold: { prop: 'moneyBag', s: 0.5 } }),
  P('tower', { x: 1150, y: 520, s: 1, at: 'building' }),
  P('substation', { x: 1550, y: 640, s: 0.6, at: 'upgrades' }),
  label('they still get paid', 1250, 150, { size: 64, at: 'benefit' }),
]);
shot('whether the demand ever shows up', [
  P('dataCenter', { x: 520, y: 520, s: 1 }),
  P('check', { x: 520, y: 260, s: 0.8 }),
  label('or', 960, 500, { size: 90 }),
  P('ghost', { x: 1400, y: 500, s: 1.1, idle: 'float', at: 'or not' }),
  P('check', { x: 1400, y: 230, s: 0.8, at: 'or not' }),
  label('utility wins either way', 960, 820, { size: 56, at: 'or not' }),
]);
shot("So who's supposed to pay", [
  C('gridOf', { x: 760, y: 560, prop: 'chair', cols: 5, rows: 2, gx: 200, gy: 240, s: 0.85, in: 'none', per: 0.03 }),
  big('?', 1500, 450, { size: 300, color: COL.ink, at: 'empty' }),
]);
shot('Which brings us to the question', [
  stick('pjm', 500, 'rest', 'scared', { look: [100, 300] }),
  stick('utility', 960, 'rest', 'worried', { look: [1900, 300] }),
  stick('plant', 1420, 'scratch', 'cringe'),
  label('the question nobody likes', 960, 150, { size: 66, at: 'nobody' }),
]);
shot('What happens if the AI boom fizzles', [
  P('bubble', { x: 760, y: 450, s: 2, out: 'fizzles+0.45', outAnim: 'pop', idle: 'float' }),
  T('AI', { x: 760, y: 450, size: 120, color: COL.blue, out: 'fizzles+0.45', outAnim: 'pop' }),
  T('POP!', { x: 760, y: 450, size: 160, color: COL.red, at: 'fizzles+0.45' }),
  mascot(1560, 'think', ['thinking', 'shocked@fizzles+0.45']),
]);
shot('Remember, the capacity auction', [
  P('calendar', { x: 640, y: 460, s: 1.4, a: { top: 'AUCTION', text: '1 YEAR', size: 60 } }),
  label('one-year deal', 640, 150, { size: 70, at: 'one-year' }),
  mascot(1450, 'one', 'neutral'),
]);
shot('But the power plants and transmission', [
  P('gasPlant', { x: 420, y: 600, s: 0.9 }),
  P('tower', { x: 900, y: 540, s: 1 }),
  P('hourglass', { x: 1450, y: 480, s: 1.1, at: 'not' }),
  label('built to last decades', 1200, 150, { size: 62, at: 'not' }),
]);
shot("Utilities don't pay for those", [
  stick('utility', 640, 'holdR', 'smug', { hold: { prop: 'cashStack', s: 0.5 } }),
  P('xmark', { x: 760, y: 620, s: 1.1, at: 'cash' }),
  label('no cash upfront', 1350, 400, { size: 70, at: 'upfront' }),
]);
shot('They borrow the money', [
  stick('lender', 260, 'holdR', 'smug', { hold: { prop: 'moneyBag', s: 0.4 } }),
  arrow([380, 500], [560, 500], { at: 'borrow', color: COL.ink }),
  stick('worker', 760, 'holdR', 'neutral', { hold: { prop: 'wrench', s: 0.4, rot: -0.6 }, at: 'build' }),
  P('tower', { x: 1020, y: 520, s: 0.8, at: 'build' }),
  arrow([1130, 500], [1310, 500], { at: 'recover', color: COL.ink }),
  ...houses(2, 1460, 560, 260, 0.6, i => ({ at: `customers+${(i * 0.1).toFixed(1)}` })),
  label('over decades', 1590, 300, { size: 58, color: COL.red, at: 'decades' }),
]);
shot('A transmission line can get paid off', [
  P('tower', { x: 220, y: 520, s: 0.8 }),
  C('timeline', { x: 1060, y: 560, w: 1350, marks: [{ pos: 0.1, label: 'built', size: 46 }, { pos: 0.45, label: '20 yrs', at: '20' }, { pos: 0.68, label: '30 yrs', at: '30' }, { pos: 0.95, label: '40 yrs', at: '40', color: COL.red }] }),
  label('paid off over...', 1060, 220, { size: 66 }),
]);
shot('And a regulated utility usually earns', [
  stick('utility', 560, 'rub', 'greedy'),
  P('pctCoin', { x: 1100, y: 420, s: 1.2, at: 'return' }),
  label('a set return', 1100, 180, { size: 70, at: 'set return' }),
  ...[0, 1, 2].map(i => P('moneyBag', { x: 1400 + i * 150, y: 650, s: 0.5, at: `entire+${(i * 0.2).toFixed(1)}` })),
]);
shot('So, if the giant party never shows up', restaurantBg(), [
  C('gridOf', { x: 960, y: 600, prop: 'tableSmall', cols: 5, rows: 2, gx: 280, gy: 200, s: 0.9, in: 'none' }),
  P('partyHat', { x: 1500, y: 860, s: 0.6, rot: 1.4, in: 'drop', at: 'never' }),
  label('no-show', 960, 160, { size: 80, color: COL.red, at: 'never' }),
]);
shot("the restaurant doesn't eat the cost", restaurantBg(), [
  P('restaurant', { x: 600, y: 520, s: 1.1, a: { name: 'PJM' } }),
  stick('waiter', 1150, 'stop', 'smug'),
  P('xmark', { x: 600, y: 520, s: 0.9, at: 'eat' }),
  label("doesn't eat the cost", 1150, 180, { size: 62, at: 'cost' }),
]);
shot('The regular diners do', restaurantBg(), [
  C('people', { x: 960, y: 920, n: 4, gap: 330, s: 0.8, face: 'sad', in: 'none', cast: ['joe', 'grandma', 'diner2', 'diner3'] }),
  ...[0, 1, 2, 3].map(i => P('bill', { x: 465 + i * 330, y: 360, s: 0.3, a: { receipt: true, title: 'YOU', w: 220, h: 260 }, in: 'drop', at: `diners+${(i * 0.1).toFixed(1)}` })),
]);
shot('For years', restaurantBg(), [
  ...[0, 1, 2, 3, 4].map(i => P('calendar', { x: 400 + i * 280, y: 460 - (i % 2) * 40, s: 0.9, a: { top: 'YEAR', text: String(i + 1), size: 70 }, at: `years+${(i * 0.12).toFixed(2)}` })),
]);
shot('And we know this happens', (() => {
  const mx = 900, my = 470, ms = 1.4, wi = mapPt(-88.5, 44.5, mx, my, ms);
  return [
    P('usMap', { x: mx, y: my, s: ms, in: 'none' }),
    P('pin', { x: wi[0], y: wi[1] - 30, s: 0.8, at: 'happening' }),
    label('Wisconsin', wi[0], wi[1] - 140, { size: 60, at: 'happening' }),
  ];
})());
shot("There's a coal plant", [
  P('coalPlant', { x: 700, y: 560, s: 1.6 }),
  P('sign', { x: 1450, y: 420, s: 0.9, a: { text: 'Pleasant Prairie, WI', w: 480, size: 44 }, at: 'Pleasant' }),
]);
shot('It opened in 1980', [
  P('coalPlant', { x: 260, y: 380, s: 0.6, a: { off: false } }),
  C('timeline', { x: 1060, y: 600, w: 1400, marks: [{ pos: 0.05, label: '1980', sub: 'opened', at: '1980' }, { pos: 0.45, label: '2018', sub: 'shut down', at: '2018', color: COL.red }, { pos: 0.95, label: '2039', sub: 'still paying', at: '2039', color: COL.red }] }),
  label('still paying...', 1500, 300, { size: 62, color: COL.red, at: 'paying' }),
]);
shot("That's 21 years of paying", [
  P('coalPlant', { x: 380, y: 520, s: 1, a: { off: true, closed: true } }),
  C('timeline', { x: 1180, y: 680, w: 900, marks: [{ pos: 0.0, label: '2018', size: 46 }, { pos: 1, label: '2039', size: 46, color: COL.red }], spans: [{ from: 0, to: 1, label: '21 YEARS', at: '21', dy: -80 }] }),
  C('flow', { from: [1300, 400], to: [520, 380], prop: 'cash', n: 3, s: 0.28, in: 'none', at: 'paying' }),
  label("doesn't make any power", 1180, 160, { size: 60, at: 'any power' }),
]);
shot('According to Wisconsin Watch', [
  doc({ x: 760, y: 440, w: 1080, kicker: 'Wisconsin Watch', title: 'Customers owe nearly $1 billion on closed power plants', body: 'Utility customers in the state still owe nearly $1 billion on plants that have already shut down or soon will.', hl: [{ text: 'nearly $1 billion', at: 'owe' }] }),
  peek('R', 'point>1100,330', 'annoyed', { look: [1000, 330] }),
]);
shot('And that bill includes a return', [
  P('coalPlant', { x: 420, y: 560, s: 0.9, a: { off: true, closed: true } }),
  P('pctCoin', { x: 960, y: 420, s: 1.3, at: 'return' }),
  big('~9.8%', 960, 650, { size: 110, at: '9.8%' }),
  stick('utility', 1500, 'rub', 'greedy', { at: 'utility' }),
  label('keeps coming', 1500, 260, { size: 60, color: COL.red, at: 'keeps coming' }),
]);
shot("It's like still making car payments", [
  P('car', { x: 720, y: 600, s: 1.5, a: { wreck: true } }),
  label('SCRAPYARD', 720, 300, { size: 70, color: COL.grey }),
  P('calendar', { x: 1100, y: 330, s: 0.7, a: { top: 'SINCE', text: '2018', size: 50 }, at: '2018' }),
  stick('joe', 1500, 'holdR', 'annoyed', { hold: { prop: 'paper', a: { title: 'PAYMENT', size: 32, lines: 2 }, s: 0.4 } }),
]);
shot('And the dealership is still making money', [
  stick('dealer', 1200, 'rub', 'greedy'),
  stick('joe', 420, 'holdR', 'sad', { hold: { prop: 'cash', s: 0.35 } }),
  C('flow', { from: [560, 520], to: [1100, 480], prop: 'cash', n: 4, s: 0.3, in: 'none', at: 'money' }),
  label('every single payment', 960, 160, { size: 64, at: 'every' }),
]);
shot('When Wisconsin Watch asked', [
  P('factory', { x: 1350, y: 600, s: 1.1 }),
  stick('industry', 640, 'explain', 'serious', { talk: true }),
  label('Todd Stuart', 640, 170, { size: 66, at: 'Todd' }),
  label('industrial energy users group', 640, 240, { size: 40, color: COL.grey, at: 'industrial' }),
]);
shot('warned that if a data center', [
  P('dataCenter', { x: 760, y: 520, s: 1.3, move: [[760, 560, 'smaller', 0.6]] }),
  P('hourglass', { x: 1450, y: 460, s: 1, at: 'short' }),
  label('short-lived?', 1450, 180, { size: 62, at: 'short' }),
  label('smaller than promised?', 760, 180, { size: 62, at: 'smaller' }),
]);
shot("Everybody's left holding the bag", [
  stick('joe', 460, 'holdR', 'sad', { hold: { prop: 'moneyBag', s: 0.45 } }),
  stick('grandma', 960, 'holdR', 'sad', { hold: { prop: 'moneyBag', s: 0.45 } }),
  stick('mom', 1460, 'holdR', 'sad', { hold: { prop: 'moneyBag', s: 0.45 } }),
  label('holding the bag', 960, 150, { size: 72, color: COL.red }),
]);
shot('The translation, If the AI party', [
  P('paper', { x: 760, y: 460, s: 1.6, a: { title: 'AI PARTY', lines: 3, size: 46, w: 300 } }),
  P('partyHat', { x: 900, y: 320, s: 0.6, rot: 0.3 }),
  stamp('CANCELLED', 760, 480, { at: 'cancels', size: 90 }),
]);
shot('the rest of us get stuck', [
  C('people', { x: 760, y: 900, n: 4, gap: 230, s: 0.75, face: 'annoyed', in: 'none' }),
  P('bill', { x: 760, y: 330, s: 0.9, a: { title: 'THE BILL', total: '$$$', color: COL.red }, in: 'drop', at: 'bill' }),
  mascot(1600, 'shrug', 'sad'),
]);

// ---------- we've done this before ----------
shot('And if this sounds familiar', [
  mascot(760, 'think', 'thinking', { s: 0.9 }),
  label("we've done this before", 1350, 400, { size: 66, at: 'before' }),
]);
shot('In the late 1990s', [
  P('oldPC', { x: 660, y: 520, s: 1.6 }),
  big('1990s', 1350, 330, { size: 150, color: COL.blue, at: '1990s' }),
  label('the next big thing', 1350, 500, { size: 66, at: 'next big' }),
]);
shot('Telecom companies, fueled', [
  stick('worker', 400, 'up', 'excited'),
  trend(960, 470, { w: 380, h: 300, at: 'forecasts' }),
  label('huge forecasts', 960, 180, { size: 58, at: 'forecasts' }),
  ...[0, 1, 2].map(i => P('moneyBag', { x: 1360 + i * 150, y: 560, s: 0.55, at: `easy+${(i * 0.15).toFixed(2)}` })),
  label('easy money', 1510, 300, { size: 58, at: 'easy' }),
]);
shot('raced to lay fiber optic cable', [
  P('fiberCoil', { x: 1250, y: 560, s: 1.4 }),
  stick('worker', 480, 'rest', 'excited', { walk: true, move: [[900, FY, 'raced', 1.4]] }),
  label('everywhere', 1250, 220, { size: 72, at: 'everywhere' }),
]);
shot("By one estimate from NYU's", [
  doc({ x: 760, y: 440, w: 1080, kicker: "NYU's Stern School of Business", title: 'The fiber-optic build-out of the late 1990s', body: 'By one estimate, network builders poured roughly $30 billion into laying about 90 million miles of fiber.', hl: [{ text: 'roughly $30 billion', at: 'Business' }] }),
  peek('R', 'point>1100,330', 'neutral', { look: [1000, 330] }),
]);
shot('network builders poured', [
  big('$30 BILLION', 760, 300, { size: 140, color: COL.green, at: '$30' }),
  big('90 MILLION MILES', 760, 480, { size: 90, color: COL.orange, at: '90' }),
  P('fiberCoil', { x: 1500, y: 560, s: 1, at: 'fiber' }),
]);
shot('Then the bubble popped', { shake: 'popped' }, [
  P('bubble', { x: 760, y: 450, s: 2, out: 'popped', outAnim: 'pop' }),
  T('FIBER', { x: 760, y: 450, size: 100, color: COL.orange, out: 'popped', outAnim: 'pop' }),
  T('POP!', { x: 760, y: 450, size: 180, color: COL.red, at: 'popped' }),
  mascot(1560, 'facepalm', 'cringe', { at: 'popped' }),
]);
shot('By 2001, estimates said', [
  P('calendar', { x: 300, y: 380, s: 0.9, a: { top: 'BY', text: '2001', size: 60 } }),
  C('splitbar', { x: 1000, y: 470, w: 1100, h: 140, segments: [{ v: 5, color: COL.green, label: '5%', at: '5%', size: 44 }, { v: 95, color: '#2f353d', label: 'unused', at: 'ground', size: 54 }] }),
  label('fiber actually in use', 1000, 300, { size: 62, at: 'being used' }),
]);
shot('95% of it', { punch: ['95%', 1.06] }, [
  big('95%', 960, 420, { size: 260, color: COL.ink }),
  label('unused', 960, 640, { size: 80 }),
]);
shot('Just sitting there', [
  P('darkFiber', { x: 960, y: 560, s: 1.8 }),
]);
shot('Dark', { bg: '#121417' }, [
  T('Dark.', { x: 960, y: 450, size: 220, color: '#e9edf2', stroke: false, in: 'fade' }),
]);
shot('Under city streets', [
  P('office', { x: 560, y: 210, s: 0.75 }), P('apartment', { x: 960, y: 230, s: 0.65 }), P('office', { x: 1360, y: 210, s: 0.75 }),
  P('darkFiber', { x: 960, y: 640, s: 1.7 }),
  label('just yards away', 1650, 120, { size: 54, at: 'yards' }),
]);
shot('Companies like Global Crossing', [
  P('paper', { x: 620, y: 470, s: 1.4, a: { title: 'Global Crossing', size: 34, lines: 2, w: 300, stamp: 'BANKRUPT', stampSize: 44 }, at: 'Global' }),
  P('paper', { x: 1250, y: 470, s: 1.4, a: { title: 'WorldCom', size: 40, lines: 2, w: 300, stamp: 'BANKRUPT', stampSize: 44 }, at: 'WorldCom' }),
]);
shot('Now, to be fair, a lot of that fiber', [
  P('darkFiber', { x: 760, y: 560, s: 1.5 }),
  ...[0, 1, 2].map(i => wire([310, 520 + i * 39], [1210, 520 + i * 39], { color: COL.yellow, lw: 9, sag: 0, at: `DID+${(i * 0.15).toFixed(2)}` })),
  P('check', { x: 1550, y: 420, s: 1, at: 'used' }),
]);
shot('Years later, it became part', [
  stick('joe', 520, 'phone', 'happy', { hold: { prop: 'phone', s: 0.25, side: 'R' } }),
  P('laptop', { x: 1000, y: 560, s: 1, a: { text: 'www', size: 40 } }),
  label('the backbone of the internet', 1250, 200, { size: 62, at: 'backbone' }),
  P('fiberCoil', { x: 1500, y: 560, s: 0.8, at: 'backbone' }),
]);

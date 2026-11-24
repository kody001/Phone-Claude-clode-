// ===================== PART 2: 3:19 - 9:03 =====================
function upDown(o) {
  // animated revenue (up, green) vs loss (down, red) bars around a baseline
  const { x, y, h } = o; const bw = o.bw || 180; const mx = o.max || Math.max(o.up, o.down);
  const els = [E({ t0: tt(o.t0), x: 0, y: 0, enter: 'fade', z: 3, render: c => { SEED = 66; line(c, [[x - 60, y], [x + 560, y]], { lw: 6 }); } })];
  els.push(E({ t0: tt(o.tUp), x: x + 120, y, enter: 'none', z: 4, render: (c, t, el) => {
    const p = ease.back(clamp((t - el.t0) / .5)); const hh = o.up / mx * h * p; SEED = 61; rect(c, -bw / 2, -hh, bw, hh, { fill: COL.green, lw: 5 });
    if (p > .5) text(c, o.upLabel, 0, -hh - 40, { size: 64, font: 'marker', color: COL.dgreen }); text(c, o.upName || 'Revenue', 0, 34, { size: 40 });
  } }));
  els.push(E({ t0: tt(o.tDown), x: x + 400, y, enter: 'none', z: 4, render: (c, t, el) => {
    const p = ease.back(clamp((t - el.t0) / .6)); const hh = o.down / mx * h * p; SEED = 62; rect(c, -bw / 2, 0, bw, hh, { fill: COL.red, lw: 5 });
    if (p > .5) text(c, o.downLabel, 0, hh + 46, { size: 64, font: 'marker', color: COL.dred }); text(c, o.downName || 'Loss', 0, -34, { size: 40 });
  } }));
  return els;
}
// L21 In February, SpaceX absorbed ex-A-I... Musk's artificial intelligence company, the one behind the chatbot Grok.
S('in february', (add) => {
  const e = elon({ x: 1650, expr: 'neutral' });
  add(P('calendar', { month: 'FEB', day: '2026', dsize: 66 }, 230, 220, .8));
  add(P('badge', { text: 'SpaceX', size: 56, color: '#e8ecf0' }, 560, 520, 1.2));
  const tAbs = T('absorbed');
  add(E({ t0: SHOT_T0 + .2, x: 0, y: 0, enter: 'none', z: 5, render: (c, t, el) => {
    const pAbs = ease.inOut(clamp((t - tAbs - 0.15) / .8));
    const x = lerp(1060, 590, pAbs), y = lerp(520, 600, pAbs), s = lerp(.8, .42, pAbs) * ease.back(clamp((t - el.t0) / .4));
    c.save(); c.translate(x, y); drawSprite(c, 'robot', { label: 'xAI' }, 0, 0, s); c.restore();
  } }));
  add(arrowTo(980, 330, 700, 420, tAbs, { color: COL.dblue, bend: .3, t1: tAbs + 1.2, exit: 'fade' }));
  add(note('xAI', 1060, 240, T('ex-a-i'), { size: 80, font: 'marker', color: COL.dblue }));
  add(note("Musk's AI company", 1060, 820, T("musk's artificial"), { size: 54 }));
  add(P('phone', { screen: 'chat', title: 'Grok' }, 1150, 540, .9, T('grok')));
  e.pose(T('absorbed'), 'point', { at: [600, 520] }).face(T('absorbed'), 'wow').pose(T('grok'), 'presentL').face(T('grok'), 'happy');
  add(e);
});
// It was an all-stock deal.
S('it was an all-stock', (add) => {
  const e = elon({ x: 960, expr: 'smug', s: .8 });
  add(P('badge', { text: 'SpaceX', size: 50, color: '#e8ecf0' }, 380, 400, .9));
  add(P('robot', { label: 'xAI' }, 1540, 470, .8));
  add(mover('share', { text: 'SHARES', sub: 'SpaceX' }, [[420, 460, .45, -10], [960, 250, .5, 0], [1480, 420, .45, 10]], SHOT_T0 + .1, 1.4));
  add(big('ALL-STOCK DEAL', 960, 140, T('all-stock'), { size: 80, color: COL.dblue }));
  add(P('cash', {}, 520, 760, .7, T('deal')));
  add(...crossOut(520, 760, 230, 150, T('deal') + .3));
  add(note('no cash', 520, 870, T('deal') + .4, { size: 48, color: COL.red }));
  e.pose(T('all-stock'), 'shrug');
  add(e);
});
// And ex-A-I had already swallowed X, the company formerly known as Twitter, the year before.
S('and ex-a-i had already', (add) => {
  const tGulp = T('the year before');
  const e = elon({ x: 1680, expr: 'neutral', s: .76 });
  add(P('robot', { label: 'xAI' }, 450, 520, 1.3));
  add(P('bird', {}, 1150, 250, 1.0, T('twitter')));
  add(arrowTo(1150, 350, 1150, 450, T('twitter') + .3, { color: INK, lw: 7, t1: tGulp, exit: 'fade' }));
  add(E({ t0: T('swallowed'), x: 0, y: 0, enter: 'none', z: 6, render: (c, t, el) => {
    const p = ease.inOut(clamp((t - tGulp) / 0.9)); const pop = ease.back(clamp((t - el.t0) / .35));
    const x = lerp(1150, 460, p), y = lerp(580, 470, p), s = lerp(.9, .25, p) * pop;
    if (p < .98) drawSprite(c, 'xlogo', {}, x, y, s);
  } }));
  add(note('X  =  formerly Twitter', 1150, 760, T('formerly'), { size: 54 }));
  add(note('(the year before)', 1150, 840, T('year before'), { size: 50, color: '#666' }));
  add(big('GULP!', 560, 210, tGulp + .8, { size: 90, color: COL.red }));
  e.face(tGulp + .8, 'surprised');
  add(e);
});
// L22 So when you bought SpaceX stock in June... you weren't just buying rockets and satellites.
S('so when you bought', (add) => {
  const e = elon({ x: 1650, expr: 'neutral', s: .78 });
  const b = stick({ x: 360, s: 1.0, seed: 101, hair: 'side', hairColor: '#4a2f17', outfit: { type: 'shirt', color: '#6aa7e0' }, expr: 'happy', pose: 'grab' });
  add(b);
  add(P('cart', {}, 720, 800, 1.4));
  add(mover('rocket', {}, [[720, -200, .35, 30], [700, 640, .35, 10]], T('rockets'), .7, { ease: ease.out }));
  add(mover('satellite', {}, [[760, -200, .35, -20], [790, 650, .35, -12]], T('satellites'), .7, { ease: ease.out }));
  add(note('you bought...', 600, 220, T('bought spacex'), { size: 64 }));
  e.pose(T("weren't just"), 'countR').face(T("weren't"), 'smug');
  add(e);
});
// You were buying a social media platform... and one of the most expensive A I labs on the planet.
S('you were buying a social', (add) => {
  const e = elon({ x: 1650, expr: 'neutral', s: .78 });
  const b = stick({ x: 360, s: 1.0, seed: 101, hair: 'side', hairColor: '#4a2f17', outfit: { type: 'shirt', color: '#6aa7e0' }, expr: 'happy', pose: 'grab', enter: 'none' });
  add(b);
  add(P('cart', {}, 720, 800, 1.4));
  add(P('rocket', {}, 700, 640, .35, null, { rot: 10, enter: 'none' })); add(P('satellite', {}, 790, 650, .35, null, { rot: -12, enter: 'none' }));
  add(mover('xlogo', {}, [[650, -200, .5], [640, 600, .5]], T('social media'), .7, { ease: ease.out }));
  add(mover('robot', { label: 'xAI' }, [[860, -300, .5], [860, 540, .5]], T('most expensive'), .7, { ease: ease.out }));
  add(P('fire', {}, 1000, 520, .6, T('expensive') + .3));
  add(note('social media', 640, 300, T('social media'), { size: 56 }));
  add(note('very expensive AI lab', 1000, 220, T('a i labs'), { size: 56, color: COL.red }));
  b.face(T('most expensive'), 'shocked');
  e.face(T('most expensive'), 'nervous');
  add(e);
});
// L23 And the IPO filing showed EXACTLY how expensive.
S('and the ipo filing showed', (add) => {
  const e = elon({ x: 1600, expr: 'serious' });
  add(P('doc', { title: 'IPO FILING', sub: 'xAI financials', lines: ['-', '-', '-', '-', '-'], w: 520, h: 600 }, 640, 470, 1.0, null, { enter: 'slideU' }));
  add(P('magnifier', {}, 760, 520, 1.4, T('exactly')));
  add(big('EXACTLY', 1060, 220, T('exactly'), { size: 90, color: COL.red, rot: -6 }));
  e.pose(T('showed'), 'pointer', { at: [640, 470] });
  add(e);
});
// In 2025, ex-A-I brought in about $3.2 billion in revenue... and lost about $6.4 billion.
S('in 2025', (add) => {
  const e = elon({ x: 1650, expr: 'neutral' });
  add(note('xAI in 2025', 1180, 160, null, { size: 70, font: 'marker' }));
  add(...upDown({ x: 380, y: 470, h: 400, up: 3.2, down: 6.4, max: 6.4, tUp: T('three point two'), tDown: T('lost about'), upLabel: '$3.2B', downLabel: '-$6.4B', t0: SHOT_T0 }));
  add(P('robot', { label: 'xAI' }, 1230, 420, .6));
  e.pose(T('revenue'), 'point', { at: [500, 330] }).pose(T('lost'), 'point', { at: [780, 620] }).face(T('lost'), 'shocked');
  add(e);
});
// In just the first three months of this year, it lost another $2.5 billion... on $818 million of revenue.
S('in just the first three', (add) => {
  const e = elon({ x: 1650, expr: 'worried' });
  add(note('First 3 months of 2026', 1180, 160, null, { size: 60, font: 'marker' }));
  add(...upDown({ x: 380, y: 450, h: 400, up: .818, down: 2.5, max: 2.5, tUp: T('eight hundred'), tDown: T('lost another'), upLabel: '$818M', downLabel: '-$2.5B', t0: SHOT_T0 }));
  add(P('calendar', { month: 'Q1', day: '2026', dsize: 60 }, 1230, 420, .75));
  e.pose(T('lost another'), 'facepalm').face(T('eight hundred'), 'sad');
  add(e);
});
// One analyst at PitchBook said that, compared to a normal software company... "the financials look reckless."
S('one analyst at pitchbook', (add) => {
  const a = stick({ x: 1350, s: 1.1, seed: 111, hair: 'curly', hairColor: '#2b2b2b', skin: SKINS[3], glasses: 'square', outfit: { type: 'suit', color: '#5a6b7d', tie: COL.yellow }, expr: 'neutral', pose: 'presentL' });
  add(a);
  add(P('label', { text: 'Analyst (PitchBook)', w: 440 }, 1350, 300, 1, T('analyst')));
  add(P('laptop', { code: true }, 450, 700, .9, T('normal software')));
  add(note('normal software co.', 450, 520, T('normal software'), { size: 50 }));
  add(P('bubble', { text: '"The financials\nlook RECKLESS."', w: 600, h: 300, tail: 'right', size: 64 }, 820, 300, 1, T('the financials')));
  add(P('fire', {}, 1030, 720, .7, T('reckless')));
  a.pose(T('financials'), 'pointL').face(T('reckless'), 'skeptical');
});
// L24 Last year, ex-A-I spent $12.7 billion on equipment. That's more than Starlink and the rocket business spent COMBINED... about $8 billion.
S('last year ex-a-i spent', (add) => {
  const e = elon({ x: 1680, expr: 'neutral', s: .76 });
  add(...bars({ x: 200, y: 260, w: 1100, h: 560, vals: [12.7, 8], max: 12.7, colors: [COL.blue, COL.green], labels: ['xAI equipment', 'Starlink + rockets'], vlabels: ['$12.7B', '~$8B'], vcolors: [COL.dblue, COL.dgreen], times: [T('twelve point'), T('combined')], lsize: 44, vsize: 80 }));
  add(E({ t0: SHOT_T0, x: 0, y: 0, enter: 'fade', z: 3, render: c => { SEED = 79; line(c, [[180, 820], [1320, 820]], { lw: 6 }); } }));
  add(P('chip', {}, 475, 640, .55, T('equipment')));
  add(P('satellite', {}, 1025, 700, .5, T('combined'))); add(P('rocket', {}, 1150, 690, .3, T('combined') + .15));
  add(note('COMBINED', 1030, 160, T('combined'), { size: 70, font: 'marker', color: COL.red }));
  e.pose(T('twelve point'), 'pointer', { at: [480, 420] }).face(T('combined'), 'surprised');
  add(e);
});
// L25 Now look at Starlink. It brought in $11.4 billion last year... about 61% of the whole company's revenue.
S('now look at starlink', (add) => {
  const e = elon({ x: 1650, expr: 'happy' });
  add(P('satellite', {}, 420, 250, 1.1));
  add(note('STARLINK', 420, 120, null, { size: 80, font: 'marker', color: COL.dblue }));
  add(counter(420, 480, 0, 11.4, v => '$' + v.toFixed(1) + 'B', T('eleven point'), 1.2, { size: 120, color: COL.dgreen }));
  add(note('revenue last year', 420, 590, T('eleven point') + .5, { size: 50 }));
  add(pie({ x: 1050, y: 470, r: 250, slices: [{ v: 61, color: COL.green, t: T('sixty-one'), pop: true, popT: T('sixty-one') + .5 }, { v: 39, color: COL.lgray, t: T('sixty-one') }] }));
  add(big('61%', 1000, 400, T('sixty-one') + .4, { size: 110, color: '#fff', outline: COL.dgreen }));
  add(note("of SpaceX's total revenue", 1050, 800, T("whole company's"), { size: 50 }));
  e.pose(T('look at starlink'), 'point', { at: [420, 250] });
  add(e);
});
// It made more than $4 billion in operating profit.
S('it made more than four', (add) => {
  const e = elon({ x: 1500, expr: 'grin', pose: 'cheer' });
  add(P('moneybag', {}, 420, 520, 1.0, T('four billion'))); add(P('moneybag', {}, 700, 560, 1.15, T('four billion') + .15)); add(P('cash', {}, 560, 780, 1, T('profit')));
  add(big('$4B+ PROFIT', 560, 220, T('four billion'), { size: 100, color: COL.dgreen }));
  add(P('arrowUp', {}, 1000, 380, .6, T('operating')));
  add(e);
});
// It has more than 9,600 satellites in orbit... and over 10 million subscribers in 164 countries.
S('it has more than nine', (add) => {
  add(stars());
  add(P('planet', { kind: 'earth', color: '#5b9bd5' }, 960, 560, 1.6));
  add(E({ t0: T('nine thousand'), x: 960, y: 560, enter: 'none', z: 3, render: (c, t, el) => {
    const n = Math.floor(clamp((t - el.t0) / 1.6) * 90); const R = rnd(5);
    for (let i = 0; i < 90; i++) { const a = R() * Math.PI * 2, r = 260 + R() * 70; if (i >= n) continue; const ang = a + t * .05 * (R() > .5 ? 1 : -1); c.save(); c.translate(Math.cos(ang) * r, Math.sin(ang) * r * .85); c.fillStyle = '#ffffff'; c.fillRect(-7, -2, 14, 4); c.fillStyle = '#7fc8ff'; c.fillRect(-2, -4, 4, 8); c.restore(); }
  } }));
  add(big('9,600+ SATELLITES', 960, 110, T('nine thousand'), { size: 80, color: '#fff', outline: '#0e1530' }));
  add(P('dish', {}, 300, 700, .8, T('ten million'))); add(P('dish', {}, 1620, 700, .8, T('ten million') + .1));
  add(big('10M+ subscribers', 400, 300, T('ten million'), { size: 64, color: COL.yellow, outline: '#0e1530', rot: -6 }));
  add(big('164 countries', 1520, 330, T('sixty-four'), { size: 64, color: COL.lgreen, outline: '#0e1530', rot: 6 }));
});
// L26 So put them side by side. One business makes about $4B a year. The other one loses about six.
S('so put them side', (add) => {
  const e = elon({ x: 960, expr: 'neutral', s: .74 });
  add(P('satellite', {}, 420, 330, 1.0));
  add(note('Starlink', 420, 180, null, { size: 70, font: 'marker', color: COL.dblue }));
  add(big('+$4B / yr', 420, 560, T('four billion'), { size: 100, color: COL.dgreen }));
  add(P('robot', { label: 'xAI' }, 1500, 360, .85, T('the other one')));
  add(big('-$6B / yr', 1500, 640, T('loses about six'), { size: 100, color: COL.red }));
  e.pose(T('one business'), 'point', { at: [420, 400] }).pose(T('the other one'), 'point', { at: [1500, 400] }).face(T('loses'), 'worried');
  add(e);
});
// And now... they're the same company.
S('and now', (add) => {
  const e = elon({ x: 1680, expr: 'neutral', s: .76, pose: 'shrug' });
  add(P('satellite', {}, 420, 420, .9, null, { enter: 'none' }));
  add(P('robot', { label: 'xAI' }, 1080, 430, .75, null, { enter: 'none' }));
  add(E({ t0: T('same company'), x: 750, y: 440, enter: 'pop', z: 2, render: c => { SEED = 501; rect(c, -600, -270, 1200, 520, { fill: 'rgba(242,194,48,.12)', stroke: '#c99a10', lw: 10, r: 40 }); } }));
  add(P('label', { text: 'SpaceX', w: 260, font: 'marker', color: '#fff' }, 330, 170, 1.1, T('same company') + .2));
  add(big('SAME COMPANY', 750, 830, T('same company'), { size: 96, color: '#c99a10' }));
  e.face(T('same company'), 'unimpressed');
  add(e);
});
// L27 It's the corporate version of marrying someone with a great salary...
S("it's the corporate version", (add) => {
  add(burst(960, 450, T('marrying'), { color: 'rgba(240,140,176,.25)', r1: 600 }));
  const bride = stick({ x: 700, s: 1.1, seed: 121, hair: 'long', hairColor: '#c9a24a', hat: 'veil', outfit: { type: 'dress', color: '#ffffff' }, expr: 'happy', t0: T('marrying') });
  const groom = stick({ x: 1220, s: 1.1, seed: 122, hair: 'slick', hairColor: '#222', outfit: { type: 'suit', color: '#222', tie: '#222' }, expr: 'happy', t0: T('marrying') + .15 });
  add(bride, groom);
  add(P('rings', {}, 960, 330, .9, T('marrying') + .3));
  add(P('heart', {}, 960, 160, .6, T('marrying') + .5));
  add(P('moneybag', {}, 420, 640, .7, T('great salary')));
  add(note('great salary', 420, 400, T('great salary'), { size: 60, color: COL.dgreen }));
  add(note('(Starlink)', 420, 470, T('salary'), { size: 46, color: '#666' }));
  bride.pose(T('salary'), 'presentL');
});
// ...and finding out on the honeymoon that they also come with a $6-billion credit card habit.
S('and finding out', (add) => {
  add(bgColor('#fff6dc'));
  add(P('sun', {}, 1700, 170, 1)); add(P('palm', {}, 160, 640, 1.2));
  add(E({ t0: SHOT_T0, x: 0, y: 0, enter: 'none', z: 0, render: c => { c.fillStyle = '#f3dc9c'; c.fillRect(0, 880, W, 200); } }));
  const bride = stick({ x: 620, s: 1.05, seed: 121, hair: 'long', hairColor: '#c9a24a', outfit: { type: 'dress', color: '#ffffff' }, expr: 'happy', enter: 'none' });
  const groom = stick({ x: 1000, s: 1.05, seed: 122, hair: 'slick', hairColor: '#222', outfit: { type: 'shirt', color: '#f08cb0' }, expr: 'happy', enter: 'none', pose: 'give' });
  add(bride, groom);
  add(P('creditcard', { text: '$6,000,000,000', color: '#1d1d1d' }, 1350, 470, 1.0, T('credit card'), { rot: -8 }));
  add(P('receipt', { title: 'BILL', lines: ['-', '-', '-'], total: '-$6B' }, 1650, 540, 1.0, T('habit')));
  add(note('honeymoon', 800, 160, T('honeymoon'), { size: 70, font: 'marker', color: COL.pink }));
  bride.face(T('six-billion-dollar'), 'shocked').pose(T('six-billion-dollar'), 'cower');
  groom.face(T('credit card'), 'smug');
});
// L28 And it wasn't just the losses.
S("and it wasn't just the losses", (add) => {
  const e = elon({ x: 1500, expr: 'nervous' });
  add(P('arrowDown', {}, 600, 380, .9));
  add(big('NOT JUST LOSSES...', 700, 720, T('losses'), { size: 80, color: COL.red }));
  add(e);
});
// In March, SpaceX took out a $20-billion bridge loan... to pay off ex-A-I's old debt.
S('in march spacex took', (add) => {
  const e = elon({ x: 1700, expr: 'neutral', s: .74 });
  add(P('calendar', { month: 'MARCH', day: '2026', dsize: 64 }, 200, 180, .75));
  add(P('bridge', { label: 'BRIDGE LOAN' }, 800, 560, 1.4, T('bridge loan')));
  add(big('$20 BILLION', 800, 230, T('twenty-billion-dollar'), { size: 100, color: COL.dgreen }));
  add(P('badge', { text: 'SpaceX', size: 40, color: '#e8ecf0' }, 260, 640, .7));
  add(P('doc', { title: "xAI's\nOLD DEBT", lines: ['-', '-'], w: 300, h: 360, tsize: 44, stamp: null }, 1360, 640, .8, T('old debt')));
  add(mover('cash', {}, [[300, 560, .4], [800, 420, .4], [1300, 560, .4]], T('pay off'), 1.6));
  e.pose(T('pay off'), 'pointer', { at: [1360, 640] }).face(T('old debt'), 'worried');
  add(e);
});
// According to the filing, that loan had to be repaid within six months of the IPO money landing.
S('according to the filing that loan', (add) => {
  const e = elon({ x: 1600, expr: 'neutral' });
  add(P('stopwatch', { text: '6 MO' }, 520, 470, 1.4, T('six months')));
  add(E({ t0: T('six months'), x: 520, y: 505, enter: 'none', z: 5, render: (c, t, el) => { const a = (t - el.t0) * 3; c.rotate(a); SEED = 31; line(c, [[0, 0], [0, -95]], { lw: 6 }); } }));
  add(note('repay the loan', 1000, 300, T('repaid'), { size: 64 }));
  add(note('within 6 months of the IPO cash', 1000, 760, T('ipo money'), { size: 54, color: COL.red }));
  e.pose(T('repaid'), 'point', { at: [520, 470] }).face(T('six months'), 'nervous');
  add(e);
});
// And ten days after the stock started trading, SpaceX sold $20B in bonds... later bumped to $25B... partly to pay that loan back.
S('and ten days after', (add) => {
  const e = elon({ x: 1680, expr: 'neutral', s: .76 });
  add(P('calendar', { month: 'IPO +', day: '10 days', dsize: 54 }, 220, 200, .8));
  add(P('bond', { text: 'BONDS' }, 600, 450, 1.0, T('bonds')));
  add(counter(600, 720, 20, 20, v => '$' + Math.round(v) + ' BILLION', T('twenty billion'), 0.1, { size: 90, color: COL.dgreen, t1: T('later bumped') - .01 }));
  add(counter(600, 720, 20, 25, v => '$' + Math.round(v) + ' BILLION', T('later bumped'), 1.2, { size: 90, color: COL.dgreen, enter: 'none' }));
  add(arrowTo(830, 450, 1050, 450, T('pay that loan'), { color: COL.dgreen }));
  add(P('bridge', { label: 'LOAN' }, 1250, 470, .55, T('pay that loan')));
  add(stamp('PAID BACK', 1250, 470, T('loan back'), { size: 60, color: COL.dgreen }));
  e.pose(T('bonds'), 'point', { at: [600, 450] }).face(T('bumped'), 'wow');
  add(e);
});
// L29 So before the space company could even think about Mars... it had to clean up the chatbot company's bills.
S('so before the space company', (add) => {
  const e = elon({ x: 1600, expr: 'neutral' });
  add(P('rocket', {}, 400, 560, 1.0));
  add(P('thought', { text: 'Mars?', w: 360, h: 240, size: 64 }, 650, 260, 1, T('think about mars')));
  for (let i = 0; i < 6; i++) add(P('receipt', { title: 'BILL', lines: ['-', '-', '-'], total: '$$$' }, 700 + i * 70 - 120, 700 - i * 30, .55, T('bills') - .5 + i * .1, { enter: 'drop', rot: (i % 2 ? 8 : -8) }));
  add(note("chatbot company's bills", 900, 250 + 600, T('chatbot company'), { size: 54, color: COL.red }));
  e.pose(T('clean up'), 'facepalm').face(T('clean up'), 'sad');
  add(e);
});
// L30 Now... selling a money-losing A I lab to the public isn't easy.
S('now selling a money-losing', (add) => {
  const e = elon({ x: 1650, expr: 'nervous' });
  add(P('robot', { label: 'xAI' }, 460, 520, 1.0));
  add(P('tag', { text: 'FOR SALE', size: 38 }, 760, 330, .9, T('selling')));
  add(P('arrowDown', {}, 460, 220, .5, T('money-losing')));
  [[1000, 0], [1180, 1], [1360, 2]].forEach(([x, i]) => add(stick({ x, s: .7, seed: 130 + i, hair: ['messy', 'bun', 'side'][i], hairColor: '#333', expr: 'skeptical', t0: T('public') + i * .1, outfit: { type: 'shirt', color: ['#9bc3ea', '#f0a6c8', '#a7d58f'][i] } })));
  add(note("isn't easy", 1180, 400, T("isn't easy"), { size: 70, font: 'marker', color: COL.red }));
  add(e);
});
// Unless you wrap it inside the coolest brand on the planet.
S('unless you wrap', (add) => {
  const e = elon({ x: 1600, expr: 'smug' });
  add(P('robot', { label: 'xAI' }, 620, 480, 0.8, null, { t1: T('wrap it') + .5, exit: 'pop' }));
  add(P('gift', { text: 'SpaceX', size: 40 }, 620, 540, 1.3, T('wrap it') + .5, { enter: 'popBig' }));
  add(P('sparkle', {}, 380, 300, 1, T('coolest'))); add(P('sparkle', {}, 860, 270, 1.2, T('coolest') + .15)); add(P('sparkle', {}, 900, 640, .8, T('coolest') + .3));
  add(big('COOLEST BRAND', 620, 170, T('coolest'), { size: 84, color: COL.dblue }));
  e.pose(T('wrap'), 'presentL').face(T('coolest'), 'grin');
  add(e);
});
// And the way this IPO was put together tells you a LOT about what it was really for.
S('and the way this ipo', (add) => {
  const e = elon({ x: 1620, expr: 'serious' });
  add(P('chalkboard', { text: 'How the IPO was\nput together:', size: 70, w: 900, h: 500 }, 700, 430, 1));
  add(P('magnifier', {}, 1020, 640, 1, T('a lot')));
  add(big('A LOT', 1120, 160, T('a lot'), { size: 90, color: COL.red }));
  e.pose(T('put together'), 'pointer', { at: [700, 430] });
  add(e);
});
// L31 In April, the New York Times reported that Musk was requiring the banks, law firms, auditors and advisers...
S('in april the new york', (add) => {
  add(P('newspaper', { name: 'The New York Times', nsize: 34, head: 'Deal advisers asked\nto buy Grok', hsize: 40 }, 360, 330, 1.0));
  const roles = [['banks', 'Banker', '#2f3a4f', COL.red, 'slick'], ['law firms', 'Lawyer', '#5a3d2b', COL.blue, 'side'], ['auditors', 'Auditor', '#3d5a3d', COL.yellow, 'bald'], ['advisers', 'Adviser', '#4a3d6b', COL.pink, 'bob']];
  roles.forEach(([ph, nm, col, tie, hair], i) => {
    const x = 880 + i * 260; const t0 = T(ph);
    add(stick({ x, s: .78, seed: 140 + i, hair, hairColor: '#2b2b2b', skin: SKINS[i], glasses: i === 2 ? 'round' : null, outfit: { type: 'suit', color: col, tie }, expr: 'neutral', t0 }));
    add(P('label', { text: nm, w: 220, size: 40 }, x, 520, .9, t0 + .1));
  });
  add(note('who wanted to work on the deal...', 1270, 220, T('who wanted'), { size: 54 }));
});
// ...to buy subscriptions to Grok. Some banks agreed to spend tens of millions of dollars a year on it.
S('to buy subscriptions', (add) => {
  const b = stick({ x: 420, s: 1.0, seed: 140, hair: 'slick', hairColor: '#2b2b2b', outfit: { type: 'suit', color: '#2f3a4f', tie: COL.red }, expr: 'worried', enter: 'none', pose: 'give' });
  add(b);
  add(P('phone', { screen: 'chat', title: 'Grok' }, 1250, 500, 1.3, T('grok')));
  add(P('label', { text: 'SUBSCRIBE', w: 300, color: COL.blue, tcolor: '#fff', font: 'marker' }, 1250, 830, .9, T('subscriptions')));
  add(moneyRain(T('tens of millions'), 2.5, { x0: 500, x1: 1100, n: 14 }));
  add(big('$10s of MILLIONS / yr', 800, 170, T('tens of millions'), { size: 80, color: COL.dgreen }));
  for (let i = 0; i < 4; i++) add(mover('bill', {}, [[520, 520, .4], [850, 420, .4], [1150, 500, .4]], T('agreed') + i * .35, 1.0));
});
// He also asked them to advertise on X... though apparently he was less insistent about that part.
S('he also asked them', (add) => {
  const e = elon({ x: 1600, expr: 'neutral' });
  add(P('sign', { text: 'ADVERTISE\nON', w: 520, h: 380, size: 70, color: '#fff' }, 600, 500, 1, T('advertise')));
  add(P('xlogo', {}, 860, 330, .9, T('on x')));
  add(note('(less insistent about that part)', 700, 860, T('less insistent'), { size: 54, color: '#555' }));
  e.pose(T('advertise'), 'point', { at: [600, 400] }).pose(T('less insistent'), 'shrug').face(T('less insistent'), 'smug');
  add(e);
});
// L32 The translation... if you wanted to work on the rocket company's IPO, you had to become a customer of the chatbot company first.
S('the translation if you', (add) => {
  const e = elon({ x: 1660, expr: 'smug', s: .76 });
  add(note('TRANSLATION:', 300, 140, null, { size: 70, font: 'marker', color: COL.red }));
  add(P('card', { text: 'Want the\nIPO job?', size: 50 }, 330, 450, 1.0, T('wanted to work')));
  add(P('rocket', {}, 330, 750, .4, T("rocket company's")));
  add(arrowTo(520, 450, 700, 450, T('had to become'), { color: INK }));
  add(P('card', { text: 'Buy Grok\nfirst!', size: 54, color: '#dff0ff' }, 900, 450, 1.0, T('customer')));
  add(P('phone', { screen: 'chat', title: 'Grok' }, 900, 760, .55, T('chatbot company')));
  add(arrowTo(1090, 450, 1240, 450, T('first'), { color: INK }));
  add(P('check', {}, 1340, 450, .7, T('first') + .3));
  e.pose(T('customer'), 'point', { at: [900, 450] });
  add(e);
});
// L33 And the banks didn't even get the usual payday.
S("and the banks didn't", (add) => {
  const b = stick({ x: 700, s: 1.15, seed: 140, hair: 'slick', hairColor: '#2b2b2b', outfit: { type: 'suit', color: '#2f3a4f', tie: COL.red }, expr: 'sad', pose: 'shrug' });
  add(b);
  add(P('wallet', { empty: true }, 1150, 560, 1.1, T('payday')));
  add(big('NO BIG PAYDAY', 960, 190, T('usual payday'), { size: 90, color: COL.red }));
  const e = elon({ x: 1650, expr: 'surprised' });
  add(e);
});
// On a typical IPO, the banks take several percent... On this one, the fees were reportedly under three quarters of ONE percent.
S('on a typical ipo', (add) => {
  const e = elon({ x: 1680, expr: 'neutral', s: .76 });
  add(note('Typical IPO', 420, 180, null, { size: 66, font: 'marker' }));
  add(P('pile', {}, 420, 520, 1.0, T('several percent')));
  add(big('several %', 420, 760, T('several percent'), { size: 80, color: COL.dgreen }));
  add(note('This IPO', 1100, 180, T('on this one'), { size: 66, font: 'marker' }));
  add(P('bill', {}, 1100, 560, .5, T('three quarters')));
  add(big('< 0.75%', 1100, 760, T('three quarters'), { size: 90, color: COL.red }));
  add(E({ t0: SHOT_T0, x: 0, y: 0, enter: 'none', z: 1, render: c => { SEED = 88; line(c, [[760, 140], [770, 880]], { lw: 5, stroke: '#bbb' }); } }));
  e.pose(T('on this one'), 'pointer', { at: [1100, 560] }).face(T('one percent'), 'shocked');
  add(e);
});
// They took the job anyway... because being on the biggest IPO in history was worth more than the fee.
S('they took the job', (add) => {
  const b = stick({ x: 760, s: 1.1, seed: 140, hair: 'slick', hairColor: '#2b2b2b', outfit: { type: 'suit', color: '#2f3a4f', tie: COL.red }, expr: 'happy', pose: 'armsUp' });
  add(b);
  add(P('trophy', {}, 1150, 500, 1.1, T('biggest ipo')));
  add(note('biggest IPO in history', 1150, 230, T('biggest ipo'), { size: 58, color: '#c99a10', font: 'marker' }));
  add(P('scale', { tilt: -12 }, 420, 560, .8, T('worth more')));
  add(note('bragging rights > fee', 420, 860, T('worth more'), { size: 50 }));
  const e = elon({ x: 1650, expr: 'smug' });
  add(e);
});
// L34 Then there's how the shares were handed out. SpaceX sold only about four percent of the company.
S("then there's how the shares", (add) => {
  const e = elon({ x: 1650, expr: 'neutral' });
  add(P('share', { text: 'SHARES', sub: 'SpaceX' }, 230, 780, .7));
  add(pie({ x: 760, y: 520, r: 300, slices: [{ v: 96, color: '#d9dcdf' }, { v: 4, color: COL.red, pop: true, popT: T('four percent') }] }));
  add(big('only ~4% sold', 760, 160, T('four percent'), { size: 84, color: COL.red }));
  add(arrowTo(1240, 260, 820, 200, T('four percent') + .3, { bend: .3 }));
  e.pose(T('four percent'), 'pointer', { at: [810, 230] }).face(T('only'), 'surprised');
  add(e);
});
// Roughly 30% of those shares went to regular retail investors.
S('roughly thirty percent', (add) => {
  const e = elon({ x: 1680, expr: 'neutral', s: .76 });
  add(pie({ x: 520, y: 470, r: 280, slices: [{ v: 70, color: '#8fb4d9' }, { v: 30, color: COL.orange, pop: true, popT: T('thirty percent') }] }));
  add(big('30%', 640, 330, T('thirty percent'), { size: 100, color: '#fff', outline: '#b8601a' }));
  add(note('of that 4%...', 520, 840, null, { size: 54 }));
  [0, 1, 2].forEach(i => add(stick({ x: 1000 + i * 170, s: .75, seed: 150 + i, hair: ['curly', 'side', 'messy'][i], hairColor: '#3b2b1b', skin: SKINS[i + 1], outfit: { type: 'shirt', color: ['#f5a3a3', '#9fd0f5', '#b5e39a'][i] }, expr: 'happy', t0: T('retail') + i * .1, pose: 'armsUp' })));
  add(note('regular retail investors', 1170, 380, T('regular retail'), { size: 54, color: '#b8601a' }));
  add(e);
});
// With that few shares to go around... demand was always going to LOOK enormous.
S('with that few shares', (add) => {
  add(P('share', { text: 'SHARE', sub: 'SpaceX' }, 960, 230, .8));
  const R = rnd(44);
  for (let i = 0; i < 9; i++) add(stick({ x: 220 + i * 185, y: 960 + (i % 2) * 20, s: .7 + R() * .15, seed: 160 + i, hair: ['messy', 'curly', 'side', 'bun', 'slick', 'bob', 'bald', 'mohawk', 'long'][i], hairColor: ['#222', '#6b3b1b', '#c9a24a', '#333', '#111', '#a33', '#444', '#2a6', '#5b3a1e'][i], skin: SKINS[i % 6], outfit: { type: 'shirt', color: ['#f5a3a3', '#9fd0f5', '#b5e39a', '#f5d76e', '#d7b5f5'][i % 5] }, expr: 'shocked', pose: i < 4 ? 'pointUpR' : 'armsUp', t0: SHOT_T0 + .1 + i * .06, args: { hop: i % 2 } }));
  add(big('DEMAND!!', 960, 450, T('look enormous'), { size: 120, color: COL.red }));
  add(note('(only a few shares)', 960, 110, T('few shares'), { size: 50, color: '#555' }));
});
// Scott Galloway called it "manufactured scarcity."
S('scott galloway', (add) => {
  const g = stick({ x: 1350, s: 1.15, seed: 171, hair: 'bald', hairColor: '#888', glasses: 'round', beard: 'stubble', outfit: { type: 'suit', color: '#1d2a3a', tie: '#1d2a3a' }, expr: 'smug', pose: 'presentL' });
  add(g);
  add(P('label', { text: 'Scott Galloway', w: 380, font: 'marker' }, 1350, 300, 1, T('galloway')));
  add(P('bubble', { text: '"Manufactured\nscarcity."', w: 620, h: 320, tail: 'right', size: 80 }, 760, 360, 1, T('manufactured')));
  const e = elon({ x: 360, expr: 'unimpressed', s: .7 });
  add(e);
});
// L35 And some brokers reportedly warned clients that if they flipped their IPO shares too quickly... they could be left out of future deals.
S('and some brokers', (add) => {
  const br = stick({ x: 480, s: 1.1, seed: 181, hair: 'slick', hairColor: '#333', outfit: { type: 'suit', color: '#3a2f4f', tie: COL.yellow }, expr: 'angry', pose: 'pointR' });
  const cl = stick({ x: 1150, s: 1.0, seed: 182, hair: 'curly', hairColor: '#6b3b1b', skin: SKINS[2], outfit: { type: 'shirt', color: '#9fd0f5' }, expr: 'worried', pose: 'hold' });
  cl.holds = { name: 'share', p: { text: 'SHARE', sub: 'SpaceX' }, s: .3 };
  add(br, cl);
  add(P('label', { text: 'Broker', w: 200 }, 480, 490, .9)); add(P('label', { text: 'Client', w: 200 }, 1150, 520, .9));
  add(P('bubble', { text: "Don't flip\ntoo fast...", w: 420, h: 250, tail: 'left', size: 54 }, 720, 260, 1, T('warned')));
  add(P('door', { text: 'FUTURE IPOs', color: '#555', size: 34 }, 1600, 560, .9, T('left out')));
  add(P('padlock', {}, 1600, 560, .6, T('future deals')));
  cl.face(T('left out'), 'shocked');
});
// So the people most likely to sell early... were nudged NOT to.
S('so the people most likely', (add) => {
  const cl = stick({ x: 760, s: 1.15, seed: 182, hair: 'curly', hairColor: '#6b3b1b', skin: SKINS[2], outfit: { type: 'shirt', color: '#9fd0f5' }, expr: 'worried', pose: 'hold', enter: 'none' });
  cl.holds = { name: 'share', p: { text: 'SHARE', sub: 'SpaceX' }, s: .36 };
  add(cl);
  add(P('sign', { text: 'SELL', w: 260, h: 220, color: '#ffd6d6' }, 1250, 560, .9, T('sell early')));
  add(...crossOut(1250, 480, 240, 150, T('not to')));
  add(big('NUDGED NOT TO', 960, 180, T('nudged'), { size: 90, color: COL.red }));
  const e = elon({ x: 1650, expr: 'smug' });
  add(e);
});
// L36 And Musk kept control. He owns about 42% of the company...
S('and musk kept control', (add) => {
  const e = elon({ x: 1600, expr: 'smug', pose: 'hips' });
  add(pie({ x: 620, y: 480, r: 300, slices: [{ v: 42, color: '#2b2d33', t: T('forty-two') }, { v: 58, color: '#d9dcdf', t: T('forty-two') }] }));
  add(big('42% owned', 640, 820, T('forty-two'), { size: 80 }));
  add(big('CONTROL', 1150, 180, T('control'), { size: 90, color: COL.dblue }));
  add(e);
});
// ...but because his special shares carry ten votes each, he controls roughly EIGHTY percent of the vote.
S('but because his special', (add) => {
  const e = elon({ x: 1650, expr: 'smug' });
  add(P('share', { text: '1 SHARE', sub: 'special class' }, 330, 260, .8));
  add(big('= 10 VOTES', 330, 470, T('ten votes'), { size: 70, color: COL.dblue }));
  for (let i = 0; i < 10; i++) add(P('ballot', {}, 140 + (i % 5) * 95, 640 + Math.floor(i / 5) * 120, .55, T('ten votes') + i * .05));
  add(pie({ x: 1050, y: 500, r: 280, slices: [{ v: 80, color: '#2b2d33', t: T('eighty') }, { v: 20, color: '#d9dcdf', t: T('eighty') }] }));
  add(big('~80% of votes', 1050, 860, T('eighty'), { size: 76, color: COL.red }));
  e.pose(T('eighty'), 'point', { at: [1050, 500] }).face(T('eighty'), 'grin');
  add(e);
});
// So the public puts up the money... and Musk keeps the steering wheel.
S('so the public puts', (add) => {
  add(P('car', { text: 'SpaceX', color: '#2f6aa3' }, 880, 640, 1.6));
  [0, 1, 2].forEach(i => add(stick({ x: 220 + i * 150, s: .75, seed: 190 + i, hair: ['side', 'bun', 'messy'][i], hairColor: '#3b2b1b', skin: SKINS[i], outfit: { type: 'shirt', color: ['#f5a3a3', '#9fd0f5', '#b5e39a'][i] }, expr: 'happy', pose: 'give', t0: T('the public') + i * .1 })));
  for (let i = 0; i < 4; i++) add(mover('bill', {}, [[300, 600, .4], [600, 460, .4], [820, 560, .4]], T('money') + i * .25, 0.9));
  add(note('the public: $$$', 360, 330, T('puts up'), { size: 60, color: COL.dgreen }));
  const e = elon({ x: 1600, y: 955, expr: 'grin', s: .8 });
  e.pose(T('steering wheel'), 'holdUp');
  add(e);
  add(P('wheel', {}, 1600, 640, .9, T('steering wheel'), { z: 9 }));
});
// L37 But the most important piece of this... might be the one most people never noticed.
S('but the most important piece', (add) => {
  const e = elon({ x: 960, y: 1010, s: .95, expr: 'serious', pose: 'countR' });
  add(P('puzzle', {}, 500, 420, 1.3, T('important piece'), { enter: 'spin' }));
  add(P('emark', {}, 1400, 400, 1.2, T('never noticed')));
  add(big('MOST IMPORTANT', 960, 150, T('most important'), { size: 90, color: COL.red }));
  e.face(T('never noticed'), 'skeptical');
  add(e);
});
// L38 Normally, when a company goes public, it has to wait a few months before it can join a major index like the Nasdaq-100.
S('normally when a company', (add) => {
  const n = stick({ x: 330, s: 1.0, seed: 201, hair: 'messy', hairColor: '#222', outfit: { type: 'shirt', color: '#f5d76e' }, expr: 'neutral', t0: SHOT_T0 });
  add(n);
  add(P('label', { text: 'New stock', w: 260 }, 330, 330, .9));
  add(P('hourglass', {}, 760, 560, 1.0, T('wait a few')));
  add(note('wait a few months...', 760, 300, T('wait a few'), { size: 58 }));
  add(P('rope', {}, 1200, 820, .9, T('join a major')));
  add(P('door', { text: 'NASDAQ-100' }, 1500, 620, 1.1, T('major index')));
  add(arrowTo(450, 700, 640, 700, T('wait'), { color: INK, lw: 7 }));
  n.walk = [SHOT_T0 + .3, SHOT_T0 + 1.5]; n.path = [[SHOT_T0 + .3, 200, 955], [SHOT_T0 + 1.5, 330, 955]];
});
// That waiting period gives the market time to figure out what the stock is actually worth.
S('that waiting period', (add) => {
  const e = elon({ x: 1650, expr: 'thinkR' === 'x' ? 'neutral' : 'neutral', pose: 'thinkR' });
  add(...lineChart({ x: 250, y: 260, w: 900, h: 480, t0: SHOT_T0, dur: 4.5, data: [[0, .5], [.12, .8], [.24, .35], [.36, .7], [.48, .45], [.6, .62], [.72, .52], [.84, .57], [1, .55]], color: COL.blue, title: '', xlabels: [[0, 'IPO'], [1, '~3 months']] }));
  add(note('price discovery', 700, 180, T('figure out'), { size: 64, font: 'marker', color: COL.dblue }));
  add(P('qmark', {}, 1250, 450, .8, T('actually worth')));
  add(e);
});
// L39 On March 30th, Nasdaq announced a new "fast entry" rule.
S('on march thirtieth', (add) => {
  const e = elon({ x: 1650, expr: 'surprised' });
  add(P('calendar', { month: 'MARCH', day: '30' }, 330, 330, 1.0));
  add(P('book', { text: 'FAST\nENTRY\nRULE', size: 54, color: COL.dblue }, 800, 480, 1.2, T('fast entry')));
  add(P('exchange', { text: 'NASDAQ' }, 1180, 300, .6, T('nasdaq announced')));
  add(E({ t0: T('fast entry'), x: 0, y: 0, enter: 'none', z: 2, render: (c, t) => { c.save(); c.strokeStyle = 'rgba(80,140,220,.6)'; c.lineWidth = 6; for (let i = 0; i < 5; i++) { const y = 400 + i * 40; const o = ((t * 900) + i * 200) % 600; c.beginPath(); c.moveTo(520 - o * .3, y); c.lineTo(620 - o * .3, y); c.stroke(); } c.restore(); } }));
  add(e);
});
// Under it, a giant new company can join the Nasdaq-100 after just FIFTEEN trading days. Under the old rules, SpaceX would have waited about three months.
S('under it a giant', (add) => {
  const e = elon({ x: 1680, expr: 'neutral', s: .76 });
  add(note('NEW RULE', 450, 160, null, { size: 70, font: 'marker', color: COL.dgreen }));
  add(P('stopwatch', { text: '15 days' , size: 48 }, 450, 460, 1.2, T('fifteen')));
  add(note('15 trading days', 450, 740, T('fifteen'), { size: 60, color: COL.dgreen }));
  add(note('OLD RULES', 1100, 160, T('old rules'), { size: 70, font: 'marker', color: '#888' }));
  add(P('hourglass', {}, 1100, 460, 1.1, T('old rules')));
  add(note('~3 months', 1100, 740, T('three months'), { size: 60, color: '#888' }));
  add(...crossOut(1100, 470, 300, 380, T('three months') + .4));
  add(E({ t0: SHOT_T0, x: 0, y: 0, enter: 'none', z: 1, render: c => { SEED = 89; line(c, [[775, 140], [780, 860]], { lw: 5, stroke: '#bbb' }); } }));
  e.pose(T('fifteen'), 'pointer', { at: [450, 460] }).face(T('fifteen'), 'wow');
  add(e);
});
// And SpaceX chose to list on the Nasdaq... instead of the New York Stock Exchange.
S('and spacex chose', (add) => {
  const e = elon({ x: 960, expr: 'smug', s: .78 });
  add(P('exchange', { text: 'NASDAQ' }, 420, 400, .85));
  add(P('check', {}, 420, 760, .7, T('nasdaq') + .2));
  add(P('bank', { label: 'NYSE' }, 1500, 420, .9, T('new york')));
  add(...crossOut(1500, 420, 300, 280, T('stock exchange') + .2));
  e.pose(T('chose to list'), 'point', { at: [420, 400] });
  add(e);
});
// L40 On July 7th, less than a month after its debut... SpaceX joined the Nasdaq-100.
S('on july seventh', (add) => {
  add(P('calendar', { month: 'JULY', day: '7' }, 250, 240, .9));
  add(P('rope', {}, 1100, 820, .9));
  add(P('door', { text: 'NASDAQ-100' }, 1450, 620, 1.1));
  const e = elon({ x: 500, expr: 'happy', s: .78 });
  e.walk = [T('spacex joined'), T('spacex joined') + 1.4];
  e.path = [[T('spacex joined'), 500, 955], [T('spacex joined') + 1.4, 1150, 955]];
  add(e);
  add(note('< 1 month after debut', 700, 180, T('less than a month'), { size: 58 }));
  add(stamp('JOINED!', 1450, 380, T('joined the nasdaq') + .5, { size: 70, color: COL.dgreen }));
});
// And every fund that tracks that index had to buy it. Not because a fund manager liked the price... but because the rules SAID so.
S('and every fund that tracks', (add) => {
  add(P('basket', { text: 'INDEX FUND' }, 300, 420, .9));
  add(P('basket', { text: 'INDEX FUND' }, 640, 470, .8, SHOT_T0 + .2));
  add(P('basket', { text: 'INDEX FUND' }, 960, 420, .9, SHOT_T0 + .4));
  for (let i = 0; i < 3; i++) add(mover('share', { text: 'SHARE', sub: 'SpaceX' }, [[640 + (i - 1) * 330, -150, .3], [640 + (i - 1) * 330 + (i === 1 ? 0 : 0), 360, .3]], T('had to buy') + i * .15, .6, { ease: ease.out }));
  const m = stick({ x: 1350, s: 1.0, seed: 211, hair: 'side', hairColor: '#555', glasses: 'square', outfit: { type: 'suit', color: '#55606e', tie: COL.blue }, expr: 'neutral', t0: T('fund manager'), pose: 'shrug' });
  add(m);
  add(P('label', { text: 'Fund manager', w: 300 }, 1350, 450, .9, T('fund manager')));
  add(P('book', { text: 'RULES', color: COL.red }, 1700, 520, .9, T('rules said')));
  add(big('THE RULES SAID SO', 960, 140, T('said so'), { size: 80, color: COL.red }));
  m.face(T('liked the price'), 'confused');
});
// One estimate put that forced buying at around $4.3 billion.
S('one estimate put', (add) => {
  const e = elon({ x: 1650, expr: 'shocked' });
  add(P('cart', {}, 560, 620, 1.3));
  add(counter(700, 260, 0, 4.3, v => '$' + v.toFixed(1) + ' BILLION', T('four point three'), 1.2, { size: 110, color: COL.dgreen }));
  add(note('of FORCED buying', 700, 400, T('forced buying'), { size: 64, color: COL.red }));
  add(moneyRain(T('four point three'), 2, { x0: 250, x1: 1150, n: 9, z: 3 }));
  add(e);
});
// L41 Think about what that means. A hedge fund could buy on day one... wait fifteen trading days... and then sell those shares straight to the index funds that are REQUIRED to buy them.
S('think about what that means', (add) => {
  const h = stick({ x: 330, s: 1.05, seed: 221, hair: 'slick', hairColor: '#111', glasses: 'shades', outfit: { type: 'suit', color: '#1d1d1d', tie: COL.yellow }, expr: 'smug', t0: T('hedge fund') });
  h.holds = { name: 'share', p: { text: 'SHARE', sub: 'SpaceX' }, s: .3 };
  add(h);
  add(P('label', { text: 'Hedge fund', w: 280, color: '#222', tcolor: '#fff' }, 330, 350, .9, T('hedge fund')));
  add(P('calendar', { month: 'DAY', day: '1' }, 680, 300, .7, T('day one')));
  add(P('stopwatch', { text: '15 days', size: 44 }, 960, 300, .8, T('wait fifteen')));
  add(arrowTo(780, 300, 860, 300, T('wait fifteen'), { color: INK, lw: 6 }));
  add(arrowTo(1060, 300, 1180, 300, T('then sell'), { color: INK, lw: 6 }));
  add(P('basket', { text: 'INDEX FUND' }, 1350, 360, .8, T('index funds')));
  add(note('REQUIRED to buy', 1350, 560, T('required'), { size: 60, color: COL.red }));
  for (let i = 0; i < 3; i++) add(mover('bill', {}, [[1350, 400, .4], [900, 600, .4], [400, 620, .4]], T('required') + .3 + i * .3, 1.0));
  h.pose(T('day one'), 'holdUp').pose(T('then sell'), 'give').face(T('required'), 'laugh');
  const e = elon({ x: 1720, expr: 'unimpressed', s: .7 });
  add(e);
});
// Kiplinger called it, in effect, money moving from patient index investors to fast-trading professionals.
S('kiplinger called it', (add) => {
  add(P('newspaper', { name: 'Kiplinger', head: 'Money moving from\nindex investors\nto pros', hsize: 36 }, 960, 220, .7));
  const g = stick({ x: 330, s: 1.0, seed: 231, hair: 'curly', hairColor: '#ccc', glasses: 'round', outfit: { type: 'dress', color: '#a07cc5' }, expr: 'happy', t0: T('patient') });
  add(g);
  add(P('piggy', { text: 'INDEX' }, 330, 380, .6, T('patient')));
  add(note('patient index investors', 330, 250 + 290, T('patient index'), { size: 46 }));
  const h = stick({ x: 1550, s: 1.05, seed: 221, hair: 'slick', hairColor: '#111', glasses: 'shades', outfit: { type: 'suit', color: '#1d1d1d', tie: COL.yellow }, expr: 'smug', t0: T('fast-trading') });
  add(h);
  add(note('fast-trading pros', 1550, 540, T('fast-trading'), { size: 46 }));
  for (let i = 0; i < 5; i++) add(mover('bill', {}, [[420, 700, .45], [960, 560, .45], [1480, 680, .45]], T('money moving') + i * .3, 1.2));
  add(arrowTo(560, 760, 1340, 760, T('money moving'), { color: COL.dgreen, lw: 12 }));
  g.face(T('fast-trading'), 'sad'); h.pose(T('professionals'), 'armsUp').face(T('professionals'), 'laugh');
});
// L42 So if you own a Nasdaq index fund in your retirement account... there's a good chance you own SpaceX right now. And you never clicked buy.
S('so if you own a nasdaq', (add) => {
  const y = stick({ x: 420, s: 1.1, seed: 241, hair: 'side', hairColor: '#6b3b1b', outfit: { type: 'shirt', color: '#9fd0f5' }, expr: 'neutral' });
  add(y);
  add(P('label', { text: 'YOU', w: 160, font: 'marker' }, 420, 330, .9));
  add(P('piggy', { text: 'RETIREMENT', size: 30 }, 900, 520, 1.3, T('retirement')));
  add(P('share', { text: 'SpaceX', sub: 'inside!' }, 900, 300, .6, T('own spacex'), { enter: 'drop' }));
  add(P('phone', { screen: 'text', text: 'BUY', size: 70 }, 1400, 520, 1.0, T('never clicked')));
  add(...crossOut(1400, 520, 220, 220, T('clicked buy') + .2));
  y.face(T('own spacex'), 'shocked').pose(T('own spacex'), 'cower');
  const e = elon({ x: 1760, expr: 'smug', s: .66 });
  add(e);
});
// L43 Research cited by Kiplinger found that fast entry can let a new company raise about 6% more money... and that extra money comes out of index investors' pockets.
S('research cited by', (add) => {
  const e = elon({ x: 1680, expr: 'serious', s: .76 });
  add(P('doc', { title: 'RESEARCH', lines: ['-', '-', '-'], w: 380, h: 420 }, 300, 380, .9));
  add(big('+6% MORE', 760, 250, T('six percent'), { size: 100, color: COL.dgreen }));
  add(P('badge', { text: 'New\nstock', size: 44, color: '#e8ecf0' }, 760, 560, .8, T('new company')));
  add(P('piggy', { text: 'INDEX', size: 36 }, 1250, 560, 1.0, T("index investors'")));
  for (let i = 0; i < 3; i++) add(mover('bill', {}, [[1250, 520, .45], [1000, 420, .45], [790, 520, .45]], T('comes out') + i * .3, .9));
  add(note("out of index investors' pockets", 1050, 860, T('pockets'), { size: 52, color: COL.red }));
  e.pose(T('comes out'), 'point', { at: [1250, 560] });
  add(e);
});
// The Financial Times' Robin Wigglesworth described the setup as potentially "the biggest bagholder exercise of all time."
S("the financial times'", (add) => {
  add(P('newspaper', { name: 'Financial Times', nsize: 40, head: 'Fast entry =\nbagholders?', hsize: 40 }, 400, 300, .75));
  const r = stick({ x: 1380, s: 1.1, seed: 251, hair: 'messy', hairColor: '#7a5a3a', glasses: 'round', beard: 'stubble', outfit: { type: 'shirt', color: '#f2d8c2' }, expr: 'neutral', pose: 'presentL' });
  add(r);
  add(P('label', { text: 'Robin Wigglesworth (FT)', w: 520, font: 'marker', size: 36 }, 1380, 300, 1, T('robin')));
  add(P('bubble', { text: '"The biggest\nbagholder exercise\nof all time."', w: 640, h: 360, tail: 'right', size: 64 }, 760, 300, 1, T('the biggest bagholder')));
  const b = stick({ x: 460, y: 960, s: .9, seed: 252, hair: 'curly', hairColor: '#ccc', outfit: { type: 'dress', color: '#a07cc5' }, expr: 'worried', t0: T('bagholder') + .3, pose: 'cower' });
  add(b);
  add(P('moneybag', { sym: '?', color: '#9a7b4f' }, 300, 860, .55, T('bagholder') + .5)); add(P('moneybag', { sym: '?', color: '#9a7b4f' }, 620, 860, .55, T('bagholder') + .6));
  r.face(T('all time'), 'skeptical');
});

// ===================== PART 1: 0:00 - 3:20 =====================
// L0  In June... SpaceX sold its stock to the public for the very first time.
S('in june', (add) => {
  const e = elon({ x: 1500, expr: 'happy' });
  add(P('calendar', { month: 'JUNE', day: '2026', dsize: 70 }, 380, 330, 1.1, T('june')));
  add(P('share', { text: 'SHARES', sub: 'SpaceX' }, 820, 330, 1.0, T('spacex sold'), { enter: 'spin' }));
  add(arrowTo(820, 470, 820, 620, T('to the public'), { color: COL.dgreen }));
  [[560, 0], [700, 1], [840, 2], [980, 3], [1120, 4]].forEach(([x, i]) => add(stick({ x, y: 955, s: 0.62, t0: T('public') + i * 0.08, seed: 40 + i, skin: SKINS[i % 6], hair: ['messy', 'curly', 'side', 'bun', 'slick'][i], hairColor: ['#1b1b1b', '#6b3b1b', '#c9a24a', '#2b2b2b', '#444'][i], expr: 'happy', pose: i % 2 ? 'armsUp' : 'rest' })));
  add(big('FIRST TIME EVER', 1500, 230, T('very first'), { size: 70, color: COL.red }));
  e.pose(T('spacex sold'), 'point', { at: [820, 330] }).pose(T('public'), 'presentL').pose(T('very first'), 'armsUp').face(T('very first'), 'grin');
  add(e);
});
// And it raised seventy-five BILLION dollars.
S('and it raised', (add) => {
  const e = elon({ x: 1530, expr: 'wow', pose: 'shrug' });
  add(burst(760, 420, T('seventy-five'), { r1: 420 }));
  add(P('pile', {}, 760, 640, 1.4, T('raised')));
  add(counter(760, 330, 0, 75, v => '$' + Math.round(v) + ' BILLION', T('seventy-five'), 1.6, { size: 120, color: COL.dgreen }));
  add(moneyRain(T('billion'), 2.5, { n: 22 }));
  e.pose(T('billion'), 'armsUp').face(T('billion'), 'laugh');
  add(e);
});
// L1 That's the largest IPO in history.
S("that's the largest", (add) => {
  const e = elon({ x: 960, y: 900, s: 0.72, expr: 'happy', pose: 'cheer' });
  add(P('podium', {}, 960, 800, 1.5, null, { enter: 'grow', z: 1 }));
  e.y = 800 - 110 * 1.5 + 40 * 1.5 + 4; e.s = 0.6;
  add(e);
  add(big('LARGEST IPO\nIN HISTORY', 960, 200, T('largest'), { size: 96, color: COL.red, lh: 1.0 }));
  add(P('sparkle', {}, 700, 380, 1, T('history'))); add(P('sparkle', {}, 1230, 330, 1.2, T('history') + .15)); add(P('sparkle', {}, 1320, 520, .8, T('history') + .3));
  add(P('trophy', {}, 1450, 620, 1.1, T('history')));
});
// Bigger than Saudi Aramco... bigger than Alibaba... bigger than ANYTHING Wall Street had ever seen.
S('bigger than saudi', (add) => {
  const e = elon({ x: 1640, expr: 'smug' });
  add(...bars({ x: 220, y: 230, w: 1080, h: 600, vals: [25.6, 25, 75], max: 75, colors: [COL.gray, COL.gray, COL.dgreen], labels: ['Saudi Aramco', 'Alibaba', 'SpaceX'], vlabels: ['', '', '$75B'], vcolors: [INK, INK, COL.dgreen], times: [T('saudi'), T('alibaba'), T('bigger than anything')], lsize: 44, vsize: 70 }));
  add(E({ t0: SHOT_T0, x: 0, y: 0, enter: 'fade', z: 3, render: c => { SEED = 77; line(c, [[200, 830], [1320, 830]], { lw: 6 }); } }));
  add(P('bank', { label: 'WALL ST' }, 470, 300, 0.75, T('wall street')));
  add(stick({ x: 400, y: 626, s: 0.5, t0: T('wall street'), hair: 'slick', outfit: { type: 'suit', color: '#2d3a4a', tie: COL.red }, expr: 'shocked', pose: 'cower' }));
  e.pose(T('bigger than anything'), 'pointer', { at: [1020, 420] }).face(T('anything'), 'grin');
  add(e);
});
// L2 On its first day of trading, the stock jumped nineteen percent...
S('on its first day', (add) => {
  const e = elon({ x: 1550, expr: 'neutral' });
  add(P('phone', { screen: 'chart', title: 'SPACEX' }, 560, 520, 1.45));
  add(P('stocktick', { text: 'DAY 1  ▲' }, 560, 175, 0.75, T('trading')));
  add(P('arrowUp', {}, 960, 430, 0.9, T('jumped'), { enter: 'pop' }));
  add(big('+19%', 1030, 300, T('nineteen'), { size: 150, color: COL.green }));
  e.pose(T('stock jumped'), 'point', { at: [700, 450] }).face(T('nineteen'), 'wow');
  add(e);
});
// and SpaceX was suddenly worth more than two TRILLION dollars.
S('and spacex was suddenly', (add) => {
  const e = elon({ x: 330, expr: 'shocked', pose: 'armsUp' });
  add(burst(1100, 430, T('two trillion'), { r1: 520, color: 'rgba(110,190,90,.35)' }));
  add(P('badge', { text: 'SpaceX', size: 52, color: '#e8ecf0' }, 1100, 300, 1.0));
  add(counter(1100, 600, 0, 2, v => '$' + (v < 1.99 ? v.toFixed(2) : '2') + ' TRILLION', T('two trillion'), 1.3, { size: 120, color: COL.dgreen }));
  add(P('cash', {}, 700, 840, 0.9, T('trillion') + .2)); add(P('cash', {}, 1500, 840, 0.9, T('trillion') + .35)); add(P('moneybag', {}, 1100, 830, 0.75, T('trillion') + .5));
  e.face(T('two trillion'), 'shocked');
  add(e);
});
// Elon Musk became the first trillionaire... in human history.
S('elon musk became', (add) => {
  const e = elon({ x: 960, y: 960, s: 0.9, expr: 'happy' });
  add(burst(960, 520, T('trillionaire'), { r1: 640 }));
  add(e);
  add(E({ t0: T('trillionaire'), x: 960, y: 960 - 642 * 0.9 - 30, z: 9, enter: 'drop', edur: .6, render: c => drawSprite(c, 'crown', {}, 0, 0, 0.75) }));
  add(big('FIRST\nTRILLIONAIRE', 470, 330, T('first trillionaire'), { size: 86, color: '#c99a10', lh: 1 }));
  add(note('in human history', 1460, 330, T('human history'), { size: 64, rot: -6 }));
  add(P('sparkle', {}, 760, 260, 1, T('trillionaire') + .4)); add(P('sparkle', {}, 1180, 250, 1.3, T('trillionaire') + .55));
  add(moneyRain(T('trillionaire'), 3, { n: 14 }));
  e.pose(T('trillionaire'), 'cheer').face(T('trillionaire'), 'laugh');
});
// L3 So... you'd think the people who bought in were buying a rocket company.
S("so you'd think", (add) => {
  const e = elon({ x: 1620, expr: 'neutral', pose: 'presentL' });
  const a = stick({ x: 500, s: 1.0, seed: 51, hair: 'side', hairColor: '#7a4a24', outfit: { type: 'tie', color: COL.blue }, expr: 'happy', t0: T('people') });
  const b = stick({ x: 820, s: 1.0, seed: 52, hair: 'bob', hairColor: '#e0b050', skin: SKINS[1], outfit: { type: 'dress', color: COL.pink }, expr: 'happy', t0: T('people') + .15 });
  a.holds = { name: 'share', p: { text: 'SHARE', sub: 'SpaceX' }, s: .35 }; a.pose(T('bought in'), 'holdUp');
  add(a, b);
  add(P('thought', { text: '', w: 460, h: 330 }, 660, 300, 1.0, T('buying a rocket')));
  add(rocketFly([[660, 330], [660, 300]], T('rocket company'), 1, { s: .45, ease: ease.out, flame: false }));
  e.face(T('rocket company'), 'happy');
  add(e);
});
// The company that lands boosters on floating platforms in the middle of the ocean.
S('the company that lands', (add) => {
  const e = elon({ x: 1650, expr: 'happy' });
  add(bgColor('#eaf6fd'));
  add(P('droneship', {}, 760, 820, 1.4, T('floating platforms')));
  add(E({ t0: T('lands'), x: 760, y: 0, enter: 'none', z: 4, render: (c, t, el) => {
    const p = ease.out(clamp((t - el.t0) / 2.2)); const y = lerp(-200, 560, p);
    if (p < 1) { c.save(); c.translate(0, y + 150); c.scale(.55, .55 + Math.sin(t * 40) * .05); c.rotate(Math.PI); drawSprite(c, 'flame', {}, 0, -70, 1); c.restore(); }
    drawSprite(c, 'booster', {}, 0, y, 1.0);
  } }));
  add(note('middle of the ocean', 760, 230, T('middle of the ocean'), { size: 64, color: COL.dblue }));
  e.pose(T('lands'), 'pointer', { at: [880, 600] }).face(T('ocean'), 'grin');
  add(e);
});
// The company that says it's going to put a city on Mars.
S('the company that says', (add) => {
  add(stars());
  add(P('planet', { color: '#d0643b' }, 1250, 600, 1.7, null, { enter: 'pop' }));
  add(P('domes', {}, 1250, 300, 0.7, T('city on mars')));
  add(rocketFly([[200, 900], [700, 500], [1150, 380]], T('put a city'), 1.6, { s: .45, ease: ease.inOut }));
  add(big('CITY ON MARS', 600, 180, T('city on mars'), { size: 92, color: '#ff9a6b', outline: '#0e1530' }));
});
// L4 Except... that's not really what they bought.
S('except', (add) => {
  const e = elon({ x: 960, y: 1250, s: 1.45, expr: 'skeptical', enter: 'slideU' });
  e.pose(T('not really'), 'countR').face(T('not really'), 'smug');
  add(e);
  add(P('qmark', {}, 520, 450, 1.2, T('what they bought'), { enter: 'spin' }));
  add(P('qmark', {}, 1400, 400, 0.9, T('bought'), { enter: 'spin' }));
});
// L5 Last year, the part of SpaceX that actually builds and launches rockets... LOST about $650 million.
S('last year the part', (add) => {
  const e = elon({ x: 1600, expr: 'neutral' });
  add(P('rocket', { label: 'LAUNCH' }, 420, 520, 1.1, T('builds')));
  add(P('label', { text: 'Rocket business', w: 380 }, 420, 860, 0.9, T('launches rockets')));
  add(P('arrowDown', {}, 860, 420, 0.8, T('lost')));
  add(big('-$650 MILLION', 1000, 680, T('six hundred'), { size: 100, color: COL.red }));
  add(note('(last year)', 1000, 790, T('six hundred') + .3, { size: 46, color: '#666' }));
  add(mover('bill', {}, [[420, 600, .6, 0], [700, 180, .6, 120], [1100, -200, .6, 300]], T('lost'), 1.6));
  e.pose(T('builds'), 'point', { at: [420, 450] }).pose(T('lost'), 'facepalm').face(T('lost'), 'sad');
  add(e);
});
// And in its own IPO filing, SpaceX says the total market it's going after is worth $28.5 trillion.
S('and in its own', (add) => {
  const e = elon({ x: 1630, expr: 'neutral' });
  const dp = { title: 'SpaceX IPO FILING', sub: 'Form S-1', lines: ['Our opportunity:', '-', 'Total addressable market:', '$28.5 TRILLION', '-'], fsize: 46, w: 700, h: 640 };
  const dl = docLines(dp, 640, 470, 1);
  add(P('doc', dp, 640, 470, 1.0, T('filing'), { enter: 'slideU' }));
  add(highlight(dl.left - 6, dl.ys[2] - 30, 520, 58, T('total market'), { color: '#9fe39a', z: 7, alpha: .5 }));
  add(highlight(dl.left - 6, dl.ys[3] - 30, 360, 58, T('twenty-eight'), { color: '#ffd84a', z: 7, alpha: .55 }));
  add(circleMark(dl.left + 170, dl.ys[3], 230, 52, T('trillion dollars'), {}));
  add(big('$28.5T', 1190, 330, T('twenty-eight'), { size: 120, color: COL.dgreen }));
  e.pose(T('filing'), 'pointer', { at: [700, 560] }).face(T('twenty-eight'), 'wow');
  add(e);
});
// L6 Twenty-six and a half trillion of that... is artificial intelligence.
S('twenty-six and a half', (add) => {
  const e = elon({ x: 1650, expr: 'surprised' });
  add(pie({ x: 640, y: 480, r: 330, slices: [{ v: 26.5, color: COL.blue, t: T('twenty-six') }, { v: 2.0, color: COL.lgray, t: T('twenty-six') }] }));
  add(big('AI: $26.5T', 640, 470, T('artificial'), { size: 100, color: '#fff', outline: COL.dblue, olw: 12 }));
  add(P('robot', {}, 1180, 640, 0.95, T('artificial')));
  e.face(T('artificial'), 'shocked').pose(T('artificial'), 'point', { at: [700, 470] });
  add(e);
});
// L7 The rockets... the launches... everything the filing groups under space? About $370 billion.
S('the rockets the launches', (add) => {
  const e = elon({ x: 1650, expr: 'neutral' });
  add(P('rocket', {}, 300, 420, 0.75, T('rockets')));
  add(rocketFly([[560, 640], [560, 300]], T('launches'), 1.6, { s: .45, ease: ease.in }));
  add(P('satellite', {}, 900, 330, 0.8, T('everything')));
  add(P('label', { text: 'SPACE', w: 260, color: '#1f2a44', tcolor: '#fff', font: 'marker' }, 620, 720, 1.1, T('under space')));
  add(big('$370 BILLION', 900, 860 - 20, T('three hundred'), { size: 96, color: COL.dblue }));
  e.pose(T('everything'), 'presentL').face(T('three hundred'), 'happy');
  add(e);
});
// That's roughly ONE percent of the pitch.
S("that's roughly", (add) => {
  const e = elon({ x: 1650, expr: 'neutral' });
  add(pie({ x: 640, y: 470, r: 330, slices: [{ v: 26.5, color: COL.blue }, { v: 1.63, color: COL.lgray }, { v: 0.37, color: COL.red, pop: true, popT: T('one percent') }] }));
  add(P('magnifier', {}, 760, 220, 1.0, T('one percent')));
  add(arrowTo(1150, 230, 690, 155, T('one percent') + .2, { bend: -.4 }));
  add(big('SPACE = ~1%', 1200, 150 + 20, T('percent'), { size: 80, color: COL.red }));
  add(note('of the pitch', 1300, 820, T('pitch'), { size: 60 }));
  e.pose(T('one percent'), 'pointer', { at: [700, 160] }).face(T('one percent'), 'surprised');
  add(e);
});
// L8 One percent. From the SPACE company.
S('one percent from', (add) => {
  const e = elon({ x: 1350, expr: 'neutral', s: .9 });
  add(big('1%', 560, 450, null, { size: 300, color: COL.red }));
  add(P('rocket', { label: 'SPACE CO.' }, 900, 460, .8, T('space company'), { rot: 14 }));
  e.pose(T('space company'), 'facepalm').face(T('space company'), 'serious');
  add(e);
});
// L9 And all the easy explanations people reach for... don't really work here.
S('and all the easy', (add) => {
  const e = elon({ x: 1620, expr: 'skeptical' });
  add(P('chalkboard', { text: 'The "easy"\nexplanations', size: 84, w: 900, h: 520 }, 700, 450, 1.0));
  add(stamp("DON'T WORK", 700, 520, T("don't really"), { size: 100 }));
  e.pose(T('easy'), 'pointer', { at: [720, 450] }).pose(T("don't really"), 'shrug').face(T("don't really"), 'unimpressed');
  add(e);
});
// L10 It's not that SpaceX was running out of money.
S("it's not that spacex", (add) => {
  const e = elon({ x: 1600, expr: 'confused' });
  add(note('#1  "They needed money"', 700, 170, null, { size: 66 }));
  add(P('wallet', { empty: true }, 520, 520, 1.3, T('running out')));
  add(P('battery', { level: .12 }, 940, 520, 1.1, T('out of money')));
  add(...crossOut(730, 520, 760, 360, T('money') + .35));
  e.pose(SHOT_T0, 'thinkR').pose(T('money') + .3, 'shrug').face(T('money') + .3, 'unimpressed');
  add(e);
});
// Starlink ... was already making BILLIONS of dollars in profit every single year.
S('starlink its satellite', (add) => {
  add(stars());
  add(P('planet', { kind: 'earth', color: '#5b9bd5' }, 560, 1020, 2.6));
  for (let i = 0; i < 5; i++) add(E({ t0: T('starlink') + i * .12, x: 0, y: 0, enter: 'none', z: 3, render: (c, t, el) => { const a = -2.4 + i * .3 + (t - el.t0) * 0.08; const x = 560 + Math.cos(a) * 560, y = 1020 + Math.sin(a) * 560; drawSprite(c, 'satellite', {}, x, y, .38); } }));
  add(note('STARLINK', 560, 160, T('starlink'), { size: 90, font: 'marker', color: '#fff' }));
  add(P('moneybag', {}, 1180, 520, .8, T('billions'))); add(P('moneybag', {}, 1380, 560, .9, T('billions') + .2)); add(P('cash', {}, 1280, 760, .9, T('profit')));
  add(big('BILLIONS IN PROFIT', 1300, 260, T('billions'), { size: 70, color: COL.green, outline: '#0e1530' }));
  add(note('every single year', 1300, 920, T('every single'), { size: 56, color: '#fff' }));
});
// L11 It's not that Musk finally decided Mars was ready.
S("it's not that musk", (add) => {
  const e = elon({ x: 1600, expr: 'neutral', pose: 'thinkR' });
  add(note('#2  "Mars is ready"', 700, 170, null, { size: 66 }));
  add(P('planet', { color: '#d0643b' }, 640, 540, 1.3, T('mars was')));
  add(P('sign', { text: 'READY?', w: 300, h: 240, size: 62 }, 920, 650, .9, T('ready')));
  e.face(T('ready'), 'skeptical');
  add(e);
});
// Nobody is flying to Mars yet... and Starship ... is still in development.
S('nobody is flying to mars yet', (add) => {
  const e = elon({ x: 1650, expr: 'neutral' });
  add(note('Flights to Mars: 0', 520, 200, T('nobody'), { size: 70, color: COL.red }));
  add(P('starship', {}, 700, 560, 1.0, T('starship')));
  add(P('construction', { text: 'STILL IN\nDEVELOPMENT', size: 46 }, 1120, 520, .95, T('still in development')));
  add(stick({ x: 420, s: .8, seed: 61, hat: 'hardhat', hair: 'bald', hairColor: '#333', expr: 'worried', t0: T('still'), outfit: { type: 'shirt', color: COL.orange } }));
  e.pose(T('starship'), 'pointer', { at: [700, 520] }).pose(T('development'), 'shrug').face(T('development'), 'confused');
  add(e);
});
// L12 And it's not that the rockets needed the cash.
S("and it's not that the rockets", (add) => {
  const e = elon({ x: 1600, expr: 'confused' });
  add(note('#3  "The rockets needed cash"', 760, 170, null, { size: 66 }));
  add(P('rocket', {}, 600, 520, .9));
  add(P('bubble', { text: 'cash pls?', w: 320, h: 200, tail: 'left' }, 860, 360, 1, T('needed the cash')));
  e.pose(T('cash'), 'scratch');
  add(e);
});
// Starship got about $3B in R&D last year. The AI side spent more than FOUR times that... on equipment alone.
S('starship got about', (add) => {
  const e = elon({ x: 1650, expr: 'neutral' });
  add(...bars({ x: 200, y: 250, w: 1050, h: 560, vals: [3, 12.7], max: 12.7, colors: ['#c7ccd1', COL.blue], labels: ['Starship R&D', 'AI equipment'], vlabels: ['$3B', '4x+'], vcolors: [INK, COL.dblue], times: [T('three billion'), T('four times')], lsize: 46, vsize: 80 }));
  add(E({ t0: SHOT_T0, x: 0, y: 0, enter: 'fade', z: 3, render: c => { SEED = 78; line(c, [[180, 810], [1270, 810]], { lw: 6 }); } }));
  add(P('starship', {}, 270, 640, .5, T('starship got')));
  add(P('chip', {}, 1220, 300, .6, T('equipment')));
  add(note('on equipment alone!', 1000, 900, T('equipment alone'), { size: 54, color: COL.red }));
  e.pose(T('four times'), 'pointer', { at: [1000, 400] }).face(T('four times'), 'shocked');
  add(e);
});
// L13 What's actually happening is much bigger.
S("what's actually happening", (add) => {
  const e = elon({ x: 1600, expr: 'serious' });
  add(P('iceberg', { top: 'rockets', bottom: 'AI' }, 700, 600, 1.15, null, { enter: 'slideU' }));
  e.pose(T('much bigger'), 'pointer', { at: [720, 720] });
  add(e);
});
// The SpaceX IPO was never really about space.
S('the spacex ipo was never', (add) => {
  const e = elon({ x: 1600, expr: 'serious' });
  add(P('chalkboard', { text: 'The IPO was never\nabout SPACE', size: 86, w: 960, h: 520 }, 700, 450, 1.0));
  add(strike(700, 520, 1010, 500, T('about space') + .2, { lw: 14 }));
  e.pose(T('never'), 'pointer', { at: [700, 450] });
  add(e);
});
// It was about taking the most trusted name in Elon Musk's entire empire... and using it to pay for everything else.
S('it was about taking', (add) => {
  const e = elon({ x: 1680, expr: 'neutral', s: .76 });
  add(P('badge', { text: 'SpaceX', size: 56, color: '#f2c230' }, 520, 420, 1.1, T('most trusted')));
  add(note('most trusted name', 520, 150, T('most trusted'), { size: 58, color: COL.dgreen }));
  add(P('robot', { label: 'xAI' }, 1000, 330, .65, T('entire empire')));
  add(P('xlogo', {}, 1250, 320, .9, T('empire') + .2));
  add(P('card', { text: 'everything\nelse', size: 44 }, 1120, 700, .85, T('everything else')));
  add(mover('bill', {}, [[600, 480, .5], [850, 600, .5], [1000, 420, .5]], T('using it'), 1.2));
  add(mover('bill', {}, [[600, 480, .5], [950, 640, .5], [1110, 690, .5]], T('pay for'), 1.2));
  add(mover('bill', {}, [[600, 480, .5], [980, 520, .5], [1240, 330, .5]], T('everything else'), 1.1));
  add(arrowTo(660, 450, 900, 360, T('using it'), { color: COL.green, bend: .3 }));
  e.pose(T('taking'), 'point', { at: [520, 420] }).pose(T('everything else'), 'shrug').face(T('everything else'), 'smug');
  add(e);
});
// L14 But to understand how we got here... you have to start with what Musk used to say about going public.
S('but to understand', (add) => {
  const e = elon({ x: 1500, expr: 'neutral', pose: 'thinkR' });
  add(P('stopwatch', {}, 620, 460, 1.3));
  add(E({ t0: SHOT_T0, x: 620, y: 495, enter: 'none', z: 4, render: (c, t) => { const a = -(t - SHOT_T0) * 5; c.rotate(a); SEED = 31; line(c, [[0, 0], [0, -80]], { lw: 7, stroke: COL.red }); } }));
  add(big('REWIND', 620, 180, T('how we got'), { size: 96, color: COL.dblue }));
  add(curvedArrowEl(900, 380, T('how we got')));
  add(P('bubble', { text: 'going public?', w: 380, h: 200, tail: 'left' }, 1180, 330, 1, T('used to say')));
  e.face(T('going public'), 'side');
  add(e);
});
function curvedArrowEl(x, y, t0) { return P('curvedArrow', { color: COL.dblue }, x, y, 1, t0, { rot: 180 }); }
// L15 For more than a decade, his answer was basically... no.
S('for more than a decade', (add) => {
  const e = elon({ x: 760, expr: 'serious', s: .9 });
  add(stick({ x: 1450, s: 1, seed: 71, hair: 'side', hairColor: '#333', expr: 'happy', outfit: { type: 'shirt', color: '#7aa7d9' }, pose: 'presentL', t0: SHOT_T0 }));
  add(P('mic', {}, 1300, 640, .7, null, { rot: -50 }));
  add(P('bubble', { text: 'IPO?', w: 260, h: 180, tail: 'right' }, 1450, 300, 1, null));
  add(P('bubble', { text: 'NO.', w: 300, h: 200, tail: 'right', size: 96, font: 'marker', color: COL.red }, 480, 300, 1, T('no')));
  add(note('10+ years', 300, 700, T('decade'), { size: 60, color: '#555' }));
  e.pose(T('no'), 'stopR').face(T('no'), 'serious');
  add(e);
});
// In 2013, he told the world there were no near-term plans ... only happen in the very long term.
S('in 2013 he told', (add) => {
  const e = elon({ x: 1600, expr: 'neutral' });
  add(P('calendar', { month: 'YEAR', day: '2013', dsize: 72 }, 330, 330, 1.0));
  add(P('bubble', { text: 'No near-term\nplans to go public', w: 600, h: 300, tail: 'right', size: 58 }, 960, 330, 1, T('no near-term')));
  add(P('hourglass', {}, 520, 720, 1, T('very long term')));
  add(note('...only in the VERY long term', 1000, 720, T('very long term'), { size: 58 }));
  e.pose(T('told the world'), 'presentL').face(T('very long term'), 'smug');
  add(e);
});
// That same year, in an email to employees, he wrote ... "increasingly concerned about SpaceX going public before the Mars transport system is in place."
S('that same year', (add) => {
  const e = elon({ x: 1650, expr: 'neutral' });
  add(P('email', { to: 'To: All SpaceX employees', subj: 'Subject: Going public', body: '"...increasingly concerned\nabout SpaceX going public\nbefore the Mars transport\nsystem is in place."', bsize: 42 }, 720, 470, 1.25, T('email'), { enter: 'slideU' }));
  add(highlight(370, 450, 640, 56, T('increasingly'), { dur: 1.2 }));
  add(highlight(370, 505, 600, 56, T('going public before'), { dur: 1.2 }));
  add(highlight(350, 560, 660, 56, T('mars transport'), { dur: 1.2, color: '#f7a6a6' }));
  add(P('planet', { color: '#d0643b' }, 1300, 260, .5, T('mars transport')));
  e.pose(T('email'), 'pointer', { at: [760, 500] }).face(T('concerned'), 'worried');
  add(e);
});
// L16 And in 2018, SpaceX's president, Gwynne Shotwell, put it even more simply.
S('and in 2018', (add) => {
  const g = stick({ x: 1300, s: 1.15, seed: 81, hair: 'bob', hairColor: '#e2c27a', skin: '#f3d2b6', outfit: { type: 'suit', color: '#2f3a4f', tie: null }, expr: 'neutral', t0: T("spacex's president") });
  add(g);
  add(P('calendar', { month: 'YEAR', day: '2018', dsize: 72 }, 330, 330, 1.0));
  add(P('label', { text: "SpaceX's President", w: 420, color: '#fff' }, 1300, 300, 1, T("president")));
  add(note('Gwynne Shotwell', 1300, 210, T('gwynne'), { size: 58, font: 'marker' }));
  const e = elon({ x: 640, expr: 'happy', s: .75, pose: 'presentR', t0: SHOT_T0 });
  add(e);
  g.pose(T('simply'), 'waveR').face(T('simply'), 'happy');
});
// She said the company "can't go public until we're flying regularly to Mars."
S('she said the company', (add) => {
  const g = stick({ x: 1350, s: 1.15, seed: 81, hair: 'bob', hairColor: '#e2c27a', skin: '#f3d2b6', outfit: { type: 'suit', color: '#2f3a4f' }, expr: 'neutral', enter: 'none' });
  add(g);
  add(P('bubble', { text: "\"Can't go public\nuntil we're flying\nregularly to Mars.\"", w: 760, h: 380, tail: 'right', size: 64 }, 820, 360, 1, T("can't go")));
  add(P('planet', { color: '#d0643b' }, 380, 760, .55, T('mars'), {}));
  add(rocketFly([[140, 950], [380, 760]], T('flying regularly'), 1.3, { s: .3, ease: ease.inOut }));
  g.pose(T("can't go"), 'pointL', {}).face(T('mars'), 'smug');
});
// L17 And honestly... the logic made sense.
S('and honestly', (add) => {
  const e = elon({ x: 1100, s: .9, expr: 'happy' });
  add(P('check', {}, 560, 460, 1.4, T('made sense')));
  add(big('MAKES SENSE', 600, 200, T('logic'), { size: 90, color: COL.green }));
  e.pose(T('logic'), 'thumbsUp').face(T('made sense'), 'happy');
  add(e);
});
// Public markets care about the next three months. Mars takes DECADES.
S('public markets care', (add) => {
  const e = elon({ x: 960, s: .78, expr: 'neutral' });
  add(P('exchange', { text: 'WALL STREET' }, 430, 330, .8));
  add(P('stopwatch', { text: '3 mo', size: 64 }, 430, 690, .9, T('three months')));
  add(note('next 3 months', 430, 900, T('next three'), { size: 54 }));
  add(P('planet', { color: '#d0643b' }, 1500, 380, 1.0, T('mars takes')));
  add(P('hourglass', {}, 1500, 720, .9, T('decades')));
  add(big('DECADES', 1500, 900 - 10, T('decades'), { size: 80, color: COL.red }));
  e.pose(T('public markets'), 'point', { at: [430, 330], arm: 'L' }).pose(T('mars takes'), 'point', { at: [1500, 380], arm: 'R' }).face(T('decades'), 'wow');
  add(e);
});
// Musk has talked about how, at Tesla, he feels pressure to never have a bad quarter...
S('musk has talked', (add) => {
  const e = elon({ x: 1580, expr: 'nervous' });
  add(P('car', { text: 'TESLA' }, 560, 700, 1.1, T('tesla')));
  ['Q1', 'Q2', 'Q3', 'Q4'].forEach((q, i) => add(P('card', { text: q, size: 64, color: i === 3 ? '#ffd6d6' : '#fff' }, 300 + i * 260, 300, .7, T('pressure') + i * .18)));
  add(stamp('NO BAD QUARTERS!', 700, 470, T('bad quarter'), { size: 70 }));
  e.pose(T('pressure'), 'facepalm').face(T('pressure'), 'nervous');
  add(e);
});
// ...and how staying private let SpaceX take the kind of risks a public company never could.
S('and how staying private', (add) => {
  const e = elon({ x: 1580, expr: 'happy' });
  add(P('padlock', {}, 360, 440, 1.0, T('staying private')));
  add(note('PRIVATE', 360, 690, T('private'), { size: 70, font: 'marker', color: COL.dgreen }));
  add(P('rocket', {}, 820, 460, .8, T('risks')));
  add(P('sign', { text: 'RISKY!', w: 280, h: 220, color: COL.yellow }, 1080, 560, .9, T('risks')));
  add(note('(a public company never could)', 760, 860, T('a public company never'), { size: 52, color: '#555' }));
  e.pose(T('risks'), 'presentL').face(T('risks'), 'grin');
  add(e);
});
// A rocket can explode on a livestream...
S('a rocket can explode', (add) => {
  add(P('screen', { bg: '#cfe9f8' }, 760, 450, 1.4));
  add(P('live', {}, 470, 260, .8, T('livestream')));
  add(rocketFly([[760, 640], [760, 400]], SHOT_T0 + .1, 1.0, { s: .4, ease: ease.out }));
  add(shake(P('boom', { text: 'BOOM' }, 760, 420, 1.0, T('explode') + .1, { enter: 'popBig' }), T('explode') + .1, .6, 14));
  const e = elon({ x: 1620, expr: 'neutral' });
  e.face(T('explode') + .2, 'grin').pose(T('explode') + .2, 'shrug');
  add(e);
});
// ...and nobody has to explain it to shareholders on an earnings call the next morning.
S('and nobody has to explain', (add) => {
  add(P('table', {}, 700, 720, 1.2));
  [[420, '#3d7a3d', 'slick'], [700, '#8e5bc8', 'bun'], [980, '#2f6aa3', 'bald']].forEach(([x, col, h], i) => add(stick({ x, y: 700, s: .8, seed: 90 + i, hair: h, hairColor: '#333', outfit: { type: 'suit', color: col, tie: COL.red }, expr: 'angry', t0: T('shareholders') + i * .12 })));
  add(note('EARNINGS CALL', 700, 230, T('earnings call'), { size: 70, font: 'marker' }));
  add(...crossOut(700, 560, 900, 520, T('next morning')));
  const e = elon({ x: 1620, expr: 'happy', pose: 'shrug' });
  e.face(T('nobody'), 'smug');
  add(e);
});
// L18 So... nobody is flying regularly to Mars. Starship is still being tested.
S('so nobody is flying', (add) => {
  const e = elon({ x: 1600, expr: 'confused' });
  add(P('planet', { color: '#d0643b' }, 430, 420, 1.1));
  add(P('sign', { text: '0 flights', w: 320, h: 220, size: 58 }, 430, 760, .9, T('regularly')));
  add(P('starship', {}, 980, 520, .9, T('starship is')));
  add(P('label', { text: 'TESTING...', w: 300, color: COL.yellow }, 980, 860, .9, T('tested')));
  e.pose(T('starship'), 'pointer', { at: [980, 520] }).face(T('tested'), 'confused');
  add(e);
});
// And yet... in June, SpaceX went public anyway.
S('and yet', (add) => {
  const e = elon({ x: 1600, expr: 'confused', pose: 'shrug' });
  add(big('AND YET...', 760, 200, null, { size: 100 }));
  add(P('calendar', { month: 'JUNE', day: 'IPO', dsize: 90 }, 430, 420, 1.1, T('june')));
  add(P('bell', {}, 900, 420, 1, T('went public')));
  add(stamp('WENT PUBLIC ANYWAY', 700, 720, T('anyway'), { size: 70 }));
  e.face(T('anyway'), 'unimpressed');
  add(e);
});
// L19 So what changed?
S('so what changed', (add) => {
  const e = elon({ x: 960, y: 980, s: .95, expr: 'confused', pose: 'thinkR' });
  add(P('qmark', {}, 560, 400, 1.2, T('what'), { enter: 'spin' }));
  add(P('qmark', {}, 1380, 360, 1.0, T('changed'), { enter: 'spin' }));
  add(big('WHAT CHANGED?', 960, 170, T('changed'), { size: 100 }));
  add(e);
});
// L20 It wasn't a rocket. It was a chatbot.
S("it wasn't a rocket", (add) => {
  const e = elon({ x: 1600, expr: 'smug' });
  add(P('rocket', {}, 470, 500, .9));
  add(...crossOut(470, 500, 260, 420, T("wasn't a rocket") + .3));
  add(P('phone', { screen: 'chat', title: 'chatbot' }, 1000, 520, 1.3, T('chatbot'), { enter: 'popBig' }));
  e.pose(T('chatbot'), 'point', { at: [1000, 520] }).face(T('chatbot'), 'laugh');
  add(e);
});

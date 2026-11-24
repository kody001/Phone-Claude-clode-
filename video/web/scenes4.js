// ===================== PART 4: 13:42 - 18:18 =====================
// L64 And they're spending like an AI company too.
S("and they're spending like", (add) => {
  const e = elon({ x: 1500, expr: 'grin', pose: 'armsUp' });
  for (let i = 0; i < 6; i++) add(mover('chip', {}, [[300 + i * 160, -150, .35, i * 30], [260 + i * 150, 820 - (i % 2) * 60, .35, i * 40 + 20]], SHOT_T0 + .2 + i * .18, .7, { ease: ease.out }));
  add(big('SPENDING LIKE AN AI COMPANY', 760, 170, T('spending'), { size: 74, color: COL.dblue }));
  add(e);
});
// In the third quarter alone, SpaceX spent $19.6 billion on capital expenditures... mainly on AI computing, plus Starship and satellites.
S('in the third quarter alone', (add) => {
  const e = elon({ x: 1680, expr: 'shocked', s: .76 });
  add(P('calendar', { month: 'Q3', day: '2026', dsize: 60 }, 200, 180, .7));
  add(counter(700, 230, 0, 19.6, v => '$' + v.toFixed(1) + ' BILLION', T('nineteen point'), 1.3, { size: 110, color: COL.red }));
  add(note('spent in Q3 (capex)', 700, 350, T('capital expenditures'), { size: 54 }));
  add(P('chip', {}, 430, 640, 1.1, T('a i computing')));
  add(note('AI computing', 430, 830, T('a i computing'), { size: 50, color: COL.dblue }));
  add(P('starship', {}, 860, 650, .55, T('plus starship')));
  add(P('satellite', {}, 1150, 640, .6, T('satellites')));
  add(e);
});
// That's MORE than its entire revenue for the quarter.
S("that's more than its entire", (add) => {
  const e = elon({ x: 1680, expr: 'worried', s: .76 });
  add(...bars({ x: 220, y: 240, w: 1000, h: 540, vals: [14.6, 19.6], max: 19.6, colors: [COL.green, COL.red], labels: ['Q3 revenue', 'Q3 spending'], vlabels: ['$14.6B', '$19.6B'], vcolors: [COL.dgreen, COL.dred], times: [SHOT_T0 + .1, SHOT_T0 + .4], lsize: 44, vsize: 76 }));
  add(E({ t0: SHOT_T0, x: 0, y: 0, enter: 'fade', z: 3, render: c => { SEED = 85; line(c, [[200, 780], [1240, 780]], { lw: 6 }); } }));
  add(big('MORE THAN REVENUE', 720, 150, T('entire revenue'), { size: 78, color: COL.red }));
  add(e);
});
// And for the fourth quarter, it's guiding to between $35 and $40 billion.
S('and for the fourth quarter', (add) => {
  const e = elon({ x: 1650, expr: 'shocked' });
  add(P('calendar', { month: 'Q4', day: 'PLAN', dsize: 76 }, 300, 260, .9));
  add(big('$35–40 BILLION', 760, 470, T('thirty-five'), { size: 120, color: COL.red }));
  add(note('expected Q4 spending', 760, 600, T('guiding'), { size: 56 }));
  add(P('fire', {}, 500, 760, .6, T('forty billion'))); add(P('fire', {}, 1020, 760, .6, T('forty billion') + .15));
  add(e);
});
// L65 So where does that kind of money come from? Not just the IPO.
S('so where does that kind', (add) => {
  const e = elon({ x: 1500, expr: 'confused', pose: 'thinkR' });
  add(P('qmark', {}, 560, 400, 1.3, null, { enter: 'spin' }));
  add(P('moneybag', { sym: 'IPO' }, 900, 560, .9, T('not just')));
  add(note('not just the IPO...', 900, 300, T('not just'), { size: 64, color: COL.red }));
  add(e);
});
// L66 This month, SpaceX lined up a $43-billion debt package to buy Nvidia chips. It's nicknamed Project Saturn.
S('this month spacex lined up', (add) => {
  const e = elon({ x: 1700, expr: 'neutral', s: .74 });
  add(P('doc', { title: 'DEBT PACKAGE', lines: ['-', '-', '-'], w: 380, h: 440 }, 330, 450, .9));
  add(big('$43 BILLION', 760, 180, T('forty-three-billion-dollar'), { size: 96, color: COL.red }));
  for (let i = 0; i < 3; i++) add(P('chip', { text: 'GPU' }, 640 + i * 170, 470, .6, T('nvidia chips') + i * .12));
  add(note('Nvidia chips', 810, 600, T('nvidia'), { size: 54 }));
  add(P('saturn', {}, 1220, 720, .8, T('project saturn')));
  add(note('"Project Saturn"', 1220, 880, T('project saturn'), { size: 56, font: 'marker', color: '#b98d4b' }));
  add(e);
});
// The deal runs through a separate entity... so the debt stays OFF SpaceX's balance sheet.
S('the deal runs through', (add) => {
  const e = elon({ x: 1700, expr: 'smug', s: .74 });
  add(P('doc', { title: "SpaceX's\nbalance sheet", lines: ['-', '-', '-'], w: 400, h: 480, tsize: 40 }, 400, 470, .95));
  add(E({ t0: T('separate entity'), x: 1050, y: 470, enter: 'pop', z: 3, render: c => { SEED = 86; rect(c, -230, -200, 460, 400, { fill: '#f6efe0', lw: 6, r: 20 }); text(c, 'SEPARATE\nENTITY', 0, -120, { size: 44, font: 'marker' }); } }));
  add(mover('receipt', { title: 'DEBT', lines: ['-', '-'], total: '$43B' }, [[400, 470, .5], [1050, 520, .5]], T('separate entity') + .4, 1.0));
  add(stamp('OFF', 400, 600, T('off'), { size: 90 }));
  e.pose(T('off'), 'presentL');
  add(e);
});
// That entity just sold $32 billion of bonds at yields above 8%.
S('that entity just sold', (add) => {
  const e = elon({ x: 1680, expr: 'neutral', s: .76 });
  add(P('bond', { text: 'BONDS', sub: 'Project Saturn' }, 520, 420, 1.1));
  add(big('$32 BILLION', 520, 720, T('thirty-two'), { size: 96, color: COL.dgreen }));
  add(P('pctcoin', {}, 1100, 400, 1.1, T('yields')));
  add(big('8%+ yield', 1100, 620, T('eight percent'), { size: 84, color: COL.orange }));
  add(e);
});
// And under the lease, SpaceX has to keep paying... even if the chips fail.
S('and under the lease', (add) => {
  const e = elon({ x: 1700, expr: 'worried', s: .74 });
  add(P('doc', { title: 'LEASE', lines: ['-', '-', '-'], w: 340, h: 400 }, 300, 450, .9));
  add(shake(P('chip', { text: 'GPU' }, 760, 450, 1.1, T('chips fail')), T('chips fail') + .2, .8, 10));
  add(P('fire', {}, 820, 330, .4, T('fail')));
  add(P('cross', {}, 760, 450, .8, T('fail') + .2));
  for (let i = 0; i < 5; i++) add(mover('bill', {}, [[1600, 500, .45], [1250, 420, .45], [940, 500, .45]], T('keep paying') + i * .35, 1));
  add(note('keep paying!', 1250, 700, T('keep paying'), { size: 64, color: COL.red, font: 'marker' }));
  add(e);
});
// L67 But here's the detail that sums up this entire story. According to the Financial Times... the lenders wanted protections to stop Musk from launching those chips into SPACE.
S("but here's the detail", (add) => {
  const e = elon({ x: 1700, expr: 'neutral', s: .72 });
  add(P('magnifier', {}, 300, 300, 1, null));
  add(note('THE DETAIL', 560, 160, null, { size: 70, font: 'marker', color: COL.red }));
  add(P('newspaper', { name: 'Financial Times', nsize: 40, head: 'Lenders: no chips\nin space', hsize: 40 }, 470, 520, .75, T('financial times')));
  [0, 1].forEach(i => add(stick({ x: 860 + i * 150, s: .8, seed: 341 + i, hair: ['slick', 'side'][i], hairColor: '#333', outfit: { type: 'suit', color: ['#2f3a4f', '#4a3d6b'][i], tie: COL.red }, expr: 'worried', t0: T('lenders') + i * .1, pose: 'grab' })));
  add(rocketFly([[1250, 760], [1250, 600]], T('launching'), 1.4, { s: .35, ease: ease.out }));
  add(P('chip', {}, 1250, 470, .35, T('those chips')));
  add(P('sign', { text: 'NOT IN SPACE!', w: 420, h: 240, color: '#ffd6d6', size: 48 }, 1100, 230, .9, T('into space')));
  e.face(T('into space'), 'confused');
  add(e);
});
// L68 Because Musk wants to build data centers in orbit.
S('because musk wants', (add) => {
  add(stars());
  add(P('planet', { kind: 'earth', color: '#5b9bd5' }, 400, 1100, 2.6));
  add(E({ t0: T('data centers'), x: 1150, y: 380, enter: 'pop', z: 4, float: 8, render: c => { drawSprite(c, 'satellite', {}, -200, 0, .9); drawSprite(c, 'server', {}, 0, 0, .5); drawSprite(c, 'satellite', {}, 200, 0, .9); } }));
  add(big('DATA CENTERS IN ORBIT', 1150, 150, T('in orbit'), { size: 70, color: COL.yellow, outline: '#0e1530' }));
});
// And if SpaceX ever defaults... you can't exactly send a repo man to low Earth orbit. SpaceX says those particular chips are meant for data centers on Earth.
S('and if spacex ever defaults', (add) => {
  add(bgColor('#dff0fb'));
  add(E({ t0: SHOT_T0, x: 0, y: 0, enter: 'none', z: 0, render: c => { c.fillStyle = '#b5d9a0'; c.fillRect(0, 900, W, 200); } }));
  add(P('towtruck', {}, 600, 820, 1.1, T('repo man')));
  const r = stick({ x: 1000, s: .95, seed: 351, hat: 'cap', hatColor: '#f2a52b', hair: 'messy', hairColor: '#333', beard: 'stubble', outfit: { type: 'shirt', color: '#5f8fbf' }, expr: 'confused', t0: T('repo man'), pose: 'pointUpR' });
  add(r);
  add(E({ t0: SHOT_T0, x: 1500, y: 170, enter: 'pop', z: 3, float: 6, render: c => { drawSprite(c, 'satellite', {}, -90, 0, .45); drawSprite(c, 'server', {}, 0, 0, .25); drawSprite(c, 'satellite', {}, 90, 0, .45); } }));
  add(P('qmark', {}, 1250, 400, .8, T('low earth orbit')));
  add(note('low Earth orbit', 1500, 300, T('low earth'), { size: 50, color: COL.dblue }));
  add(P('datacenter', { label: 'ON EARTH' }, 1450, 760, .6, T('meant for')));
  r.face(T('low earth orbit'), 'sad');
  const e = elon({ x: 220, s: .66, expr: 'laugh' });
  e.face(T('meant for'), 'smug');
  add(e);
});
// L69 So the biggest worry of the people lending money to the space company... was that the company might put something in space.
S('so the biggest worry', (add) => {
  [0, 1, 2].forEach(i => add(stick({ x: 330 + i * 180, s: .85, seed: 361 + i, hair: ['slick', 'side', 'bald'][i], hairColor: '#333', outfit: { type: 'suit', color: ['#2f3a4f', '#4a3d6b', '#3d5a3d'][i], tie: COL.red }, expr: 'worried', t0: SHOT_T0 + i * .1, pose: i === 1 ? 'cower' : 'rest' })));
  add(note('the lenders', 510, 480, null, { size: 54 }));
  add(P('rocket', { label: 'SpaceX' }, 1100, 520, .9, T('the space company')));
  add(P('emark', {}, 1300, 300, .8, T('in space')));
  add(big('...put something IN SPACE?!', 960, 170, T('put something'), { size: 70, color: COL.red }));
  const e = elon({ x: 1650, expr: 'unimpressed', s: .76 });
  e.pose(T('in space'), 'facepalm');
  add(e);
});
// L70 Now, to be fair... Mars didn't disappear completely. You can still find it in the filing. It just moved... into Musk's pay package.
S('now to be fair', (add) => {
  const e = elon({ x: 1680, expr: 'neutral', s: .76 });
  add(P('doc', { title: 'IPO FILING', lines: ['-', '-', '-', '-'], w: 440, h: 520 }, 400, 470, .95, T('in the filing')));
  add(P('planet', { color: '#d0643b' }, 400, 520, .35, T('still find')));
  add(P('magnifier', {}, 470, 560, .8, T('still find')));
  add(arrowTo(640, 470, 860, 470, T('just moved'), { color: INK }));
  add(P('card', { text: "MUSK'S\nPAY PACKAGE", size: 46, color: '#fff3c4' }, 1100, 470, 1.2, T('pay package')));
  add(mover('planet', { color: '#d0643b' }, [[400, 520, .35], [1100, 330, .3]], T('just moved'), 1.0));
  e.face(T('pay package'), 'smug');
  add(e);
});
// L71 In January, SpaceX's board granted Musk one billion restricted shares... on top of the roughly five billion shares he already had.
S('in january', (add) => {
  add(P('table', {}, 520, 720, 1.0));
  [0, 1, 2].forEach(i => add(stick({ x: 320 + i * 200, y: 700, s: .7, seed: 371 + i, hair: ['bald', 'side', 'bob'][i], hairColor: '#555', glasses: i === 0 ? 'round' : null, outfit: { type: 'suit', color: ['#2f3a4f', '#55606e', '#6b4a2b'][i], tie: COL.blue }, expr: 'happy', t0: SHOT_T0 + i * .1 })));
  add(note("SpaceX's board", 520, 330, null, { size: 56 }));
  add(P('calendar', { month: 'JAN', day: '2026', dsize: 64 }, 200, 180, .7));
  add(...bars({ x: 900, y: 240, w: 560, h: 520, vals: [5, 1], max: 6, colors: ['#c7ccd1', COL.green], labels: ['already had', 'new grant'], vlabels: ['~5B', '+1B'], vcolors: [INK, COL.dgreen], times: [T('five billion'), T('one billion')], lsize: 40, vsize: 64 }));
  add(E({ t0: T('one billion'), x: 0, y: 0, enter: 'fade', z: 3, render: c => { SEED = 87; line(c, [[880, 760], [1480, 760]], { lw: 6 }); } }));
  const e = elon({ x: 1720, expr: 'grin', s: .7 });
  e.pose(T('one billion'), 'cheer');
  add(e);
});
// For them to fully vest... SpaceX has to hit market value targets all the way up to $7.5 TRILLION...
S('for them to fully vest', (add) => {
  const e = elon({ x: 1700, expr: 'determined', s: .72 });
  for (let i = 0; i < 6; i++) add(E({ t0: T('market value') + i * .18, x: 260 + i * 190, y: 820 - i * 110, enter: 'grow', z: 3, render: c => { SEED = 600 + i; rect(c, -85, 0, 170, 110 * (i + 1) - 20, { fill: i === 5 ? COL.yellow : '#dfe7ef', lw: 5 }); } }));
  add(P('target', {}, 1210, 260, .7, T('seven and a half')));
  add(big('$7.5 TRILLION', 760, 170, T('seven and a half'), { size: 100, color: COL.red }));
  add(note('market value targets', 600, 300, T('market value'), { size: 54 }));
  add(e);
});
// ...AND build a permanent human colony on Mars with at least one million people living there.
S('and build a permanent', (add) => {
  add(stars());
  add(P('planet', { color: '#d0643b' }, 960, 1200, 4.0));
  add(P('domes', {}, 960, 560, 1.4, T('colony')));
  add(counter(960, 200, 0, 1000000, v => Math.round(v).toLocaleString('en-US') + ' people', T('one million'), 1.6, { size: 96, color: COL.yellow, outline: '#0e1530' }));
  add(note('a permanent colony on Mars', 960, 320, T('permanent'), { size: 56, color: '#fff' }));
});
// There's a separate award tied to data centers in space that deliver 100 terawatts of computing power a year.
S("there's a separate award", (add) => {
  add(stars());
  add(E({ t0: T('data centers'), x: 760, y: 470, enter: 'pop', z: 4, float: 8, render: c => { drawSprite(c, 'satellite', {}, -220, 0, 1.0); drawSprite(c, 'server', {}, 0, 0, .6); drawSprite(c, 'satellite', {}, 220, 0, 1.0); } }));
  add(P('trophy', {}, 1450, 450, .9, T('separate award')));
  add(note('separate award', 1450, 230, T('separate award'), { size: 56, color: '#fff' }));
  add(big('100 TERAWATTS / yr', 760, 830 - 20, T('terawatts'), { size: 84, color: COL.yellow, outline: '#0e1530' }));
});
// L72 And according to reports, SpaceX's own accounting treats both of those goals as improbable.
S('and according to reports', (add) => {
  const a = stick({ x: 1350, s: 1.05, seed: 381, hair: 'side', hairColor: '#555', glasses: 'square', outfit: { type: 'suit', color: '#55606e', tie: COL.yellow }, expr: 'skeptical', pose: 'presentL' });
  add(a);
  add(P('label', { text: 'Accounting', w: 280 }, 1350, 470, .9));
  add(P('card', { text: '$7.5T +\nMars colony', size: 44 }, 430, 330, 1.0));
  add(P('card', { text: '100 TW\nin space', size: 44 }, 780, 330, 1.0));
  add(stamp('IMPROBABLE', 600, 640, T('improbable'), { size: 80 }));
});
// L73 So Mars is still the mission. It's just ALSO... a stock price target.
S('so mars is still', (add) => {
  const e = elon({ x: 1650, expr: 'smug' });
  add(P('planet', { color: '#d0643b' }, 600, 480, 1.4));
  add(note('THE MISSION', 600, 160, null, { size: 70, font: 'marker', color: COL.dblue }));
  add(P('target', {}, 600, 480, .9, T('also'), { enter: 'popBig', alpha: .85 }));
  add(P('tag', { text: 'PRICE TARGET', size: 34 }, 1050, 330, 1.1, T('stock price target')));
  add(e);
});
// L74 And if you think the story stops here... Musk doesn't.
S('and if you think the story', (add) => {
  const e = elon({ x: 1300, s: .9, expr: 'neutral' });
  add(big('THE END?', 600, 400, null, { size: 140 }));
  add(strike(330, 400, 880, 380, T("musk doesn't"), { lw: 16 }));
  e.face(T("doesn't"), 'smug').pose(T("doesn't"), 'countR');
  add(e);
});
// L75 On the October earnings call, an analyst asked about combining SpaceX with Tesla.
S('on the october earnings call', (add) => {
  const a = stick({ x: 330, s: 1.0, seed: 111, hair: 'curly', hairColor: '#2b2b2b', skin: SKINS[3], glasses: 'square', outfit: { type: 'suit', color: '#5a6b7d', tie: COL.yellow }, expr: 'neutral' });
  add(a);
  add(P('label', { text: 'Analyst', w: 220 }, 330, 480, .9));
  add(P('bubble', { text: 'SpaceX + Tesla?', w: 460, h: 200, tail: 'left', size: 50 }, 560, 260, 1, T('combining')));
  add(P('rocket', { label: 'SpaceX' }, 1000, 560, .7, T('combining spacex')));
  add(note('+', 1150, 560, T('with tesla'), { size: 120, font: 'marker' }));
  add(P('car', { text: 'TESLA' }, 1400, 640, .8, T('tesla')));
  add(P('label', { text: 'Q3 earnings call', w: 380 }, 1200, 160, .9));
});
// Musk said both companies had formed special committees to discuss a merger... at the request of shareholders.
S('musk said both companies', (add) => {
  add(P('table', {}, 450, 760, .8)); add(P('table', {}, 1250, 760, .8));
  [0, 1].forEach(i => add(stick({ x: 360 + i * 180, y: 740, s: .62, seed: 391 + i, hair: ['side', 'bob'][i], hairColor: '#444', outfit: { type: 'suit', color: '#2f4f7f', tie: COL.yellow }, expr: 'neutral', t0: T('special committees') + i * .1 })));
  [0, 1].forEach(i => add(stick({ x: 1160 + i * 180, y: 740, s: .62, seed: 393 + i, hair: ['slick', 'curly'][i], hairColor: '#444', outfit: { type: 'suit', color: '#8a2f2f', tie: '#fff' }, expr: 'neutral', t0: T('special committees') + .2 + i * .1 })));
  add(P('label', { text: 'SpaceX committee', w: 380 }, 450, 420, .9, T('special committees')));
  add(P('label', { text: 'Tesla committee', w: 360 }, 1250, 420, .9, T('special committees') + .2));
  add(big('MERGER?', 850, 200, T('merger'), { size: 100, color: COL.red }));
  add(note('(shareholders asked)', 850, 300, T('request of shareholders'), { size: 50 }));
});
// He said he can't be part of the talks because he's on both sides...
S("he said he can't", (add) => {
  const e = elon({ x: 960, s: .9, expr: 'neutral', pose: 'shrug' });
  add(P('rocket', { label: 'SpaceX' }, 400, 520, .8));
  add(P('car', { text: 'TESLA' }, 1500, 650, .8));
  add(note('both sides', 960, 160, T('both sides'), { size: 70, font: 'marker' }));
  add(arrowTo(780, 400, 520, 400, T('both sides'), { color: INK, lw: 7 }));
  add(arrowTo(1140, 400, 1400, 520, T('both sides') + .1, { color: INK, lw: 7 }));
  e.face(T('both sides'), 'smug');
  add(e);
});
// ...and called the whole thing "an odd kabuki dance."
S('and called the whole thing', (add) => {
  const e = elon({ x: 1500, expr: 'smug' });
  add(P('mask', {}, 640, 450, 1.4, T('kabuki')));
  add(P('bubble', { text: '"An odd kabuki dance."', w: 640, h: 200, tail: 'right', size: 56 }, 1120, 240, 1, T('odd kabuki')));
  e.pose(T('kabuki'), 'waveR');
  add(e);
});
// And just this week, the Financial Times reported that five directors have been named to negotiate a deal that could create a company worth around $3.5 trillion.
S('and just this week', (add) => {
  add(P('newspaper', { name: 'Financial Times', nsize: 40, head: 'Directors named\nfor merger talks', hsize: 40 }, 300, 260, .65));
  for (let i = 0; i < 5; i++) add(stick({ x: 620 + i * 140, s: .62, seed: 401 + i, hair: ['side', 'bob', 'bald', 'slick', 'curly'][i], hairColor: '#444', skin: SKINS[i], outfit: { type: 'suit', color: ['#2f3a4f', '#55606e', '#6b4a2b', '#3d5a3d', '#4a3d6b'][i], tie: COL.yellow }, expr: 'neutral', t0: T('five directors') + i * .08 }));
  add(note('5 directors', 900, 520, T('five directors'), { size: 56 }));
  add(P('rocket', {}, 1400, 520, .5, T('create a company')));
  add(P('car', { text: 'TESLA' }, 1600, 640, .45, T('create a company')));
  add(big('$3.5 TRILLION', 1450, 220, T('three and a half'), { size: 90, color: COL.dgreen }));
  add(E({ t0: T('create a company'), x: 1500, y: 580, enter: 'pop', z: 2, render: c => { SEED = 77; rect(c, -230, -170, 460, 300, { fill: 'rgba(242,194,48,.12)', stroke: '#c99a10', lw: 8, r: 30 }); } }));
});
// L76 Zoom out... and there's a pattern. Musk bought Twitter and took it private. Then X was folded into xAI. Then xAI was folded into SpaceX. And now... SpaceX might fold in Tesla.
S('zoom out', (add) => {
  const tTw = T('bought twitter'), tX = T('x was folded'), tXai = T('exai was folded'), tTes = T('fold in tesla');
  add(note('THE PATTERN', 960, 110, null, { size: 70, font: 'marker', color: COL.red }));
  add(E({ t0: SHOT_T0, x: 960, y: 520, enter: 'none', z: 3, render: (c, t) => {
    const pop = (t0) => ease.back(clamp((t - t0) / .45));
    // box sizes grow as each layer wraps the previous
    const layers = [
      { t: tTw, w: 220, h: 170, col: '#d6ecfb', lab: 'Twitter → X', icon: 'bird' },
      { t: tX, w: 460, h: 330, col: '#d9d4f5', lab: 'xAI', icon: 'robot' },
      { t: tXai, w: 760, h: 520, col: '#e8ecf0', lab: 'SpaceX', icon: 'rocket' },
      { t: tTes, w: 1080, h: 690, col: 'rgba(255,214,214,.55)', lab: '+ Tesla?', icon: 'car' },
    ];
    for (let i = layers.length - 1; i >= 0; i--) {
      const L = layers[i]; const p = pop(L.t); if (p <= 0) continue;
      c.save(); c.scale(p, p); SEED = 700 + i;
      rect(c, -L.w / 2, -L.h / 2, L.w, L.h, { fill: L.col, lw: 6, r: 22 });
      text(c, L.lab, 0, -L.h / 2 + 30, { size: 34, font: 'marker' });
      c.restore();
    }
    if (t >= tTw) { const p = pop(tTw); c.save(); c.scale(p, p); drawSprite(c, t > tX ? 'xlogo' : 'bird', {}, 0, 22, .5); c.restore(); }
    if (t >= tX) drawSprite(c, 'robot', { label: 'xAI' }, 172, 40, .3 * pop(tX));
    if (t >= tXai) drawSprite(c, 'rocket', {}, 305, 30, .3 * pop(tXai));
    if (t >= tTes) drawSprite(c, 'car', { text: 'TESLA' }, 460, 40, .34 * pop(tTes));
  } }));
  add(note('took it private', 1640, 520, T('took it private'), { size: 48 }));
});
// Every time, the expensive piece ends up tucked inside whatever investors are most excited about.
S('every time the expensive', (add) => {
  const e = elon({ x: 1680, expr: 'serious', s: .76 });
  add(P('gift', { text: 'HYPE', size: 44 }, 640, 560, 1.4, null));
  add(E({ t0: T('expensive piece'), x: 640, y: 420, enter: 'none', z: 4, render: (c, t, el) => { const p = ease.out(clamp((t - el.t0) / .8)); c.globalAlpha = 1 - clamp((t - el.t0 - 1.2) / .4); drawSprite(c, 'robot', { label: '$$$' }, 0, -260 + p * 160, .5); drawSprite(c, 'fire', {}, 60, -320 + p * 160, .3); } }));
  add(P('sparkle', {}, 380, 330, 1, T('most excited'))); add(P('sparkle', {}, 900, 300, 1.2, T('most excited') + .15));
  add(note('investors are most excited about', 640, 170, T('most excited'), { size: 54, color: COL.dblue }));
  add(e);
});
// L77 And there's one more date coming. On December 8th, about 798 million more SpaceX shares become eligible for sale.
S("and there's one more date", (add) => {
  const e = elon({ x: 1680, expr: 'serious', s: .76 });
  add(P('calendar', { month: 'DEC', day: '8' }, 330, 330, 1.1, T('december')));
  add(E({ t0: T('eligible'), x: 760, y: 420, enter: 'pop', z: 4, render: (c, t, el) => { drawSprite(c, 'padlock', { open: t > el.t0 + .5 }, 0, 0, 1); } }));
  add(P('pile', {}, 1080, 700, .9, T('seven hundred')));
  add(big('798 MILLION SHARES', 900, 200, T('seven hundred'), { size: 80, color: COL.red }));
  add(note('can now be sold', 1080, 860, T('eligible'), { size: 54 }));
  add(e);
});
// It's the biggest unlock since the first one in August... and a big chance for a lot of early investors and employees to cash out.
S("it's the biggest unlock", (add) => {
  add(big('BIGGEST UNLOCK SINCE AUGUST', 960, 150, T('biggest unlock'), { size: 70 }));
  for (let i = 0; i < 4; i++) {
    const s = stick({ x: 300 + i * 260, s: .85, seed: 411 + i, hair: ['messy', 'bun', 'side', 'curly'][i], hairColor: '#333', skin: SKINS[i], outfit: { type: 'shirt', color: ['#f5a3a3', '#9fd0f5', '#b5e39a', '#f5d76e'][i] }, expr: 'laugh', t0: T('early investors') + i * .1, pose: 'run' });
    s.holds = { name: 'moneybag', p: {}, s: .35 }; s.walk = [T('cash out'), T('cash out') + 3]; s.path = [[T('cash out'), 300 + i * 260, 955], [T('cash out') + 2.5, 900 + i * 260, 955]];
    add(s);
  }
  add(note('early investors & employees', 700, 420, T('early investors'), { size: 56 }));
  add(big('CASH OUT', 1500, 400, T('cash out'), { size: 90, color: COL.dgreen }));
});
// Musk himself can't sell until next June.
S("musk himself can't", (add) => {
  const e = elon({ x: 960, s: .9, expr: 'neutral', pose: 'shrug' });
  add(P('padlock', {}, 520, 450, 1.1));
  add(P('calendar', { month: 'JUNE', day: '2027', dsize: 66 }, 1400, 400, 1.0, T('next june')));
  add(note("can't sell until", 1400, 200, T("can't sell"), { size: 58 }));
  add(e);
});
// And options traders are already pricing in a move of about 14% in either direction by mid-December.
S('and options traders', (add) => {
  const t1 = stick({ x: 330, s: 1.0, seed: 421, hair: 'mohawk', hairColor: '#2a6', glasses: 'shades', outfit: { type: 'shirt', color: '#333' }, expr: 'smug' });
  add(t1);
  add(P('label', { text: 'Options traders', w: 340 }, 330, 480, .9));
  add(P('arrowUp', {}, 900, 360, .7, T('either direction')));
  add(P('arrowDown', {}, 900, 700, .7, T('either direction') + .15));
  add(big('±14%', 1300, 520, T('fourteen percent'), { size: 160, color: COL.orange }));
  add(note('by mid-December', 1300, 700, T('mid-december'), { size: 56 }));
});
// L78 And to be clear... none of this means SpaceX is a bad company.
S('and to be clear', (add) => {
  const e = elon({ x: 960, s: .9, expr: 'neutral', pose: 'stopR' });
  add(big('NOT A BAD COMPANY', 960, 200, T('bad company'), { size: 96, color: COL.dgreen }));
  add(e);
});
// Starlink is one of the most impressive businesses built this century. The rockets really are the best in the world. And the third quarter really was profitable.
S('starlink is one of', (add) => {
  const e = elon({ x: 1700, expr: 'happy', s: .74 });
  const items = [['satellite', {}, 'Starlink: incredible business', T('starlink is')], ['rocket', {}, 'Rockets: best in the world', T('rockets really')], ['moneybag', {}, 'Q3: profitable', T('third quarter')]];
  items.forEach(([n, p, l, t0], i) => {
    add(P(n, p, 300, 260 + i * 230, n === 'rocket' ? .4 : .55, t0));
    add(note(l, 760, 260 + i * 230, t0 + .1, { size: 58 }));
    add(P('check', {}, 1220, 260 + i * 230, .5, t0 + .4));
  });
  e.pose(T('third quarter'), 'thumbsUp');
  add(e);
});
// But that's exactly the point. The good parts of SpaceX were never the problem. They were the collateral.
S("but that's exactly the point", (add) => {
  const e = elon({ x: 1700, expr: 'serious', s: .74 });
  add(P('satellite', {}, 380, 400, .8)); add(P('rocket', {}, 640, 450, .5));
  add(note('the good parts', 500, 200, T('good parts'), { size: 60, color: COL.dgreen }));
  add(note('never the problem', 500, 720, T('never the problem'), { size: 56 }));
  add(P('robot', { label: 'xAI' }, 1200, 450, .8, T('collateral')));
  add(arrowTo(840, 430, 1050, 430, T('collateral'), { color: COL.red }));
  add(stamp('COLLATERAL', 520, 460, T('collateral') + .2, { size: 76 }));
  add(e);
});
// L79 For more than twenty years, SpaceX was the one Musk company that didn't NEED you.
S('for more than twenty', (add) => {
  const e = elon({ x: 1600, expr: 'happy', pose: 'hips' });
  add(P('rocket', { label: 'SpaceX' }, 500, 480, 1.1));
  add(note('20+ years', 500, 160, T('twenty years'), { size: 70, font: 'marker' }));
  const y = stick({ x: 950, s: .9, seed: 241, hair: 'side', hairColor: '#6b3b1b', outfit: { type: 'shirt', color: '#9fd0f5' }, expr: 'neutral', t0: T('need you') });
  add(y);
  add(P('label', { text: 'YOU', w: 160, font: 'marker' }, 950, 520, .9, T('need you')));
  add(big("didn't NEED you", 960, 300, T('need you'), { size: 80, color: COL.red }));
  y.face(T('need you') + .3, 'sad');
  add(e);
});
// It was private. Starlink paid the bills. It could blow up rockets on live TV... and nobody had to explain it on an earnings call.
S('it was private', (add) => {
  add(P('padlock', {}, 250, 330, .8));
  add(note('private', 250, 500, null, { size: 54, font: 'marker' }));
  add(P('satellite', {}, 640, 300, .6, T('starlink paid')));
  add(mover('bill', {}, [[640, 340, .4], [640, 560, .5]], T('paid the bills'), .8));
  add(note('paid the bills', 640, 500, T('paid the bills'), { size: 50, color: COL.dgreen }));
  add(P('screen', { bg: '#cfe9f8' }, 1180, 330, .7, T('blow up')));
  add(P('live', {}, 1050, 230, .5, T('live tv')));
  add(P('boom', { text: 'BOOM' }, 1180, 330, .55, T('blow up') + .3));
  add(P('table', {}, 1180, 760, .6, T('earnings call')));
  add(...crossOut(1180, 740, 380, 160, T('earnings call') + .3));
  const e = elon({ x: 1700, s: .7, expr: 'grin' });
  add(e);
});
// That's exactly why Musk said it should stay private... until Mars.
S("that's exactly why musk", (add) => {
  add(stars());
  add(P('planet', { color: '#d0643b' }, 960, 520, 1.6, T('until mars')));
  add(P('padlock', {}, 520, 480, .9));
  add(big('STAY PRIVATE...', 600, 180, T('stay private'), { size: 80, color: '#fff', outline: '#0e1530' }));
  add(big('...UNTIL MARS', 1300, 860 - 20, T('until mars'), { size: 80, color: '#ff9a6b', outline: '#0e1530' }));
});
// L80 Mars didn't change. What changed is that AI needs more money than almost any private investor can provide. Tens of billions of dollars... every quarter.
S("mars didn't change", (add) => {
  const e = elon({ x: 1700, expr: 'serious', s: .74 });
  add(P('planet', { color: '#d0643b' }, 260, 280, .7));
  add(P('check', {}, 400, 380, .5, T("didn't change") - .2));
  add(note("Mars didn't change", 300, 520, null, { size: 50 }));
  add(P('robot', { label: 'AI' }, 860, 500, 1.3, T('artificial intelligence')));
  for (let i = 0; i < 8; i++) add(mover('bill', {}, [[1300 - (i % 2) * 60, 900, .45, i * 40], [880, 420, .3, i * 80]], T('needs more money') + i * .25, .8));
  add(note('private investors', 1250, 830, T('private investor'), { size: 50, color: '#888' }));
  add(big('$10s of BILLIONS', 860, 160, T('tens of billions'), { size: 80, color: COL.red }));
  add(note('every quarter', 1300, 300, T('every quarter'), { size: 60, font: 'marker' }));
  add(e);
});
// And the only place big enough to fund that... is the public market. Your brokerage app. Your index fund. Your retirement account.
S('and the only place big enough', (add) => {
  const e = elon({ x: 1700, expr: 'serious', s: .72 });
  add(big('THE PUBLIC MARKET', 820, 160, T('public market'), { size: 90, color: COL.dblue }));
  add(P('phone', { screen: 'chart', title: 'BROKER' }, 330, 560, .9, T('brokerage app')));
  add(note('your brokerage app', 330, 860, T('brokerage app'), { size: 46 }));
  add(P('basket', { text: 'INDEX FUND' }, 820, 560, .9, T('your index fund')));
  add(note('your index fund', 820, 860, T('your index fund'), { size: 46 }));
  add(P('piggy', { text: 'RETIREMENT', size: 30 }, 1300, 560, 1.0, T('retirement account')));
  add(note('your retirement', 1300, 860, T('retirement account'), { size: 46 }));
  e.pose(T('retirement account'), 'point', { at: [1300, 560] });
  add(e);
});
// L81 The rockets were never the product. They were the pitch.
S('the rockets were never', (add) => {
  const e = elon({ x: 1600, expr: 'determined' });
  add(P('rocket', { label: 'SpaceX' }, 600, 500, 1.3));
  add(P('tag', { text: 'PRODUCT', size: 34 }, 900, 330, 1.1, T('product')));
  add(...crossOut(900, 330, 300, 160, T('product') + .3));
  add(P('tag', { text: 'THE PITCH', size: 32, color: '#9fe39a', tcolor: COL.dgreen }, 920, 640, 1.2, T('pitch')));
  e.pose(T('pitch'), 'point', { at: [920, 640] });
  add(e);
});
// And if you own an index fund... you've already paid for a ticket. Whether you wanted one or not.
S('and if you own an index fund', (add) => {
  const e = elon({ x: 1600, expr: 'determined', s: .86 });
  add(P('basket', { text: 'INDEX FUND' }, 360, 640, .85));
  add(P('ticket', { text: 'TICKET', sub: 'SpaceX ride', no: 'PAID' }, 760, 330, 1.2, T('paid for a ticket'), { enter: 'spin' }));
  add(stamp('ALREADY PAID', 760, 540, T('already paid') + .9, { size: 56 }));
  add(note('whether you wanted one... or not.', 820, 800, T('whether'), { size: 60 }));
  e.pose(T('ticket'), 'point', { at: [760, 330] }).face(T('or not'), 'smug');
  add(e);
});

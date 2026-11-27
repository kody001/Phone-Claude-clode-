'use strict';
// ===== Part C: the great mismatch -> frozen people -> the ending (11:07 - 15:34) =====

S('Empty-nest baby boomers', a => [
  sk('boomer', 360, 'rest', 'smile'), sk('boomerWife', 580, 'rest', 'smile'),
  pr('house', 1080, 600, 1.3, { v: 'big' }),
  big('28%', 1610, 380, { size: 200, t: a('28%') }),
  lb('of large homes', 1610, 560, 64, { t: a('large homes') }),
]);
S('three bedrooms or more', a => [
  lb('3+ bedrooms', 960, 220, 100),
  pr('bed', 480, 560, 0.95), pr('bed', 960, 560, 0.95, { t: 0.15 }), pr('bed', 1440, 560, 0.95, { t: 0.3 }),
]);
S('Millennials with kids', a => [
  sk('dad', 360, 'rest', 'smile'), sk('mom', 580, 'rest', 'smile'), sk('kid', 770, 'rest', 'grin'),
  lb('own just', 1440, 210, 70, { t: a('just') }),
  big('16%', 1440, 400, { size: 210, c: COL.blue, t: a('16%') }),
]);
S('Redfin found', a => [
  card({ x: 1100, y: 470, w: 1150, h: 540, src: 'REDFIN', tag: 'Housing mismatch', title: 'Empty nesters own more large homes than millennial families',
    body: ['Empty nesters own more large homes than millennial families in every major metro in the country.'], hl: [{ p: 0, at: a('empty nesters'), d: 3.2 }] }),
  peek('L', 'surprise', 'stickR'),
], { z0: 1, z1: 1.05, cx: 1100, cy: 470 });
S('A little over a decade ago', a => [
  lb('a little over a decade ago...', 960, 140, 66),
  bars({ x: 960, y: 540, w: 900, h: 420, bw: 250, max: 40, items: [
    { label: 'Empty nesters', v: 25, txt: '=', c: COL.purple }, { label: 'Young families', v: 25, txt: '=', c: COL.blue, at: 0.3 }] }),
  lb('just as likely to own a big house', 960, 860, 56, { t: a('just as likely') }),
]);
S('So the people with the spare bedrooms', a => [
  draw({}, ctx => line(ctx, 960, 140, 960, 900, { w: 5, c: '#bbb', seed: 3 })),
  pr('house', 520, 620, 1.2, { v: 'big' }),
  sk('boomer', 230, 'shrug', 'smile', { s: 0.6 }),
  lb('spare bedrooms', 520, 220, 66),
  lb('no kids at home', 520, 330, 56, { t: a('kids at home'), c: COL.red }),
  pr('house', 1450, 680, 0.62, { v: 'small', t: a('with the kids') }),
  sk('dad', 1230, 'shrug', 'worried', { s: 0.6, t: a('with the kids') }), sk('mom', 1640, 'shrug', 'worried', { s: 0.6, t: a('with the kids') + 0.1 }), sk('kid', 1780, 'rest', 'grin', { s: 0.6, t: a('with the kids') + 0.2 }),
  lb('no bedrooms', 1450, 220, 66, { t: a("don't have the bedrooms") }),
]);
S('And a lot of those boomers', a => [
  sk('boomer', 560, 'holdR', 'grin', { hold: { R: holdProp('roller', 0.55, {}, 0, -60) } }),
  pr('house', 1200, 620, 1.2),
  pr('sign', 1620, 660, 0.85, { t: a('listing') - 0.2 }), X(1620, 630, 1.1, a('listing') + 0.15),
  lb('renovate & age in place', 1100, 190, 74, { t: a('renovate') }),
]);
S('When boomers DO move', a => [
  sk('boomer', 480, 'holdR', 'grin', { hold: { R: holdProp('cash', 0.5) } }),
  pr('house', 1250, 620, 1.2, { sold: 1 }),
  lb('CASH.', 880, 210, 120, { font: 'marker', c: COL.green, t: a('cash') }),
]);
S('In the latest Realtors survey', a => [
  card({ x: 1100, y: 470, w: 1150, h: 560, src: 'NATIONAL ASSOCIATION OF REALTORS', tag: 'Buyer survey', title: 'Typical repeat buyer: 62 years old',
    body: ['30% of repeat buyers paid all cash.', 'First-time buyers made up just 22% of purchases, and the typical one is now 40.'], hl: [{ p: 0, at: a('30%'), d: 1.4 }] }),
  peek('L', 'surprise', 'stickR'),
], { z0: 1, z1: 1.05, cx: 1100, cy: 470 });
S('Meanwhile, first-time buyers', a => [
  sk('firstBuyer', 420, 'shrug', 'worried'),
  pie({ x: 1020, y: 450, p: 0.22, c: COL.blue, label: '22%', r: 200 }),
  lb('of purchases', 1020, 720, 62),
  lb('typical first-time buyer:', 1560, 280, 52, { t: a('typical one') }),
  big('age 40', 1560, 420, { size: 130, t: a('40') }),
]);
S("It's like a game of musical chairs", a => {
  const tStop = a('stopped'), tSit = a('sat there');
  const ids = ['chair1', 'chair2', 'chair3', 'chair4'];
  const xs = [430, 760, 1090, 1420];
  const out = [lb('musical chairs', 960, 150, 80)];
  ids.forEach((id, i) => out.push(pr('chair', xs[i], 845, 1.1, { c: ['#c0392b', '#2f6fb5', '#3e9440', '#e0a030'][i], enter: 'none' })));
  ids.forEach((id, i) => {
    out.push(sk(id, xs[i] + 40, 'rest', 'grin', { s: 0.78, out: tSit, outFx: 'none', walk: lt => lt < tStop, enter: 'none' }));
    out.push(sk(id, xs[i], 'rest', 'smirk', { s: 0.78, sit: 1, t: tSit, enter: 'none' }));
  });
  out.push(sk('firstBuyer', 1720, [[0, 'rest'], [tSit, 'shrug']], [[0, 'grin'], [tSit, 'sad']], { s: 0.78, walk: lt => lt < tStop, enter: 'none' }));
  for (let i = 0; i < 5; i++) out.push(pr('note', 380 + i * 300, 300 + (i % 2) * 60, 0.6, { bob: 12, wig: 10, t: i * 0.2, out: tStop }));
  out.push(lb('2022', 960, 260, 110, { font: 'marker', c: COL.red, t: tStop }));
  out.push(pr('clock', 1700, 360, 0.7, { speed: 1400, t: a('Forever') }));
  out.push(peek('L', 'laugh', 'rest', { t: a('Forever'), s: 1.2 }));
  return out;
});
function ladderBase(t1, t2, t3) {
  return [
    pr('ladder', 860, 520, 1.25, { h: 720, enter: 'none' }),
    lb('the housing ladder', 1500, 120, 72, { enter: 'none' }),
    pr('house', 1260, 280, 0.7, { v: 'big', t: t1 }), sk('boomer', 1000, 'rest', 'smile', { s: 0.42, y: 330, t: t1 }), lb('empty nesters', 1580, 250, 50, { t: t1 }),
    sk('dad', 1000, 'rest', 'worried', { s: 0.42, y: 600, t: t2 }), sk('mom', 1080, 'rest', 'worried', { s: 0.42, y: 600, t: t2 + 0.1 }), lb('young family', 1580, 520, 50, { t: t2 }),
    sk('firstBuyer', 1000, 'shrug', 'sad', { s: 0.42, y: 900, t: t3 }), lb('first-time buyer', 1580, 800, 50, { t: t3 }),
  ];
}
S('And housing works like a ladder', a => [
  m(330, 'stickR', 'serious', { s: 0.8 }),
  ...ladderBase(a('top'), a('below'), a('below') + 0.3).map(e => e),
]);
S('The empty nester', a => {
  const tE = a("doesn't sell"), tY = a("doesn't get"), tS = a('starter home'), tF = a('nothing to buy');
  return [
    ...ladderBase(0, 0, 0),
    X(1260, 280, 0.8, tE + 0.2),
    pr('arrow', 680, 330, 1, { pts: [[0, 0], [0, 200]], c: COL.red, lw: 9, t: tY }), X(680, 430, 0.6, tY + 0.3),
    pr('house', 1270, 560, 0.45, { v: 'small', t: tS - 0.2 }), X(1270, 560, 0.6, tS + 0.3),
    pr('arrow', 680, 620, 1, { pts: [[0, 0], [0, 200]], c: COL.red, lw: 9, t: tS }), X(680, 720, 0.6, tS + 0.4),
    pr('q', 1270, 820, 0.6, { t: tF }), lb('nothing to buy', 1270, 900, 52, { t: tF, c: COL.red }),
  ];
}, { z0: 1.0, z1: 1.08, cx: 960, cy: 620 });
S("But this doesn't just freeze", a => [
  pr('ice', 620, 520, 2.0), pr('house', 620, 560, 0.55),
  lb('frozen market', 620, 200, 70),
  sk('husband', 1350, 'rest', [[0, 'smile'], [a('PEOPLE'), 'shock']]),
  draw({ t: a('PEOPLE') }, (ctx, lt) => { ctx.save(); ctx.globalAlpha *= 0.55 * E.out(P(lt, 0, 0.4)); poly(ctx, [[1170, 420], [1530, 400], [1550, 945], [1160, 950]], { fill: '#bfe9f7', w: 5, c: '#5aa9c9' }); ctx.restore(); }),
  lb('frozen PEOPLE', 1350, 250, 80, { t: a('PEOPLE'), c: COL.blue }),
]);
S('In 2024', a => [
  big('1 in 9', 960, 160, { size: 120, t: a('1 in 9') }),
  icons({ x: 960, y: 480, n: 9, k: 1, icon: 'person', size: 0.55, gap: 185, on: COL.green, hiAt: a('1 in 9') }),
  lb('Americans changed their address in 2024', 960, 770, 64, { t: a('changed') }),
]);
S("That's the lowest share", a => [
  sk('census', 480, 'holdR', 'flat', { hold: { R: holdProp('clipboard', 0.45, { title: 'CENSUS' }) } }),
  big('LOWEST', 1250, 380, { size: 170 }),
  lb('since tracking began in 1948', 1250, 570, 64, { t: a('1948') }),
]);
S('In the 1960s', a => [
  big('1 in 5', 960, 160, { size: 120, c: COL.blue, t: a('1 in 5') }),
  icons({ x: 960, y: 480, n: 5, k: 1, icon: 'person', size: 0.7, gap: 240, on: COL.blue, hiAt: a('1 in 5') }),
  lb('moved, back in the 1960s', 960, 770, 70),
]);
S('And that matters for a lot more', a => [
  m(400, 'presentR', 'serious'),
  pr('briefcase', 1250, 580, 1.4),
  lb('jobs', 1250, 300, 110, { font: 'marker', c: COL.blue }),
]);
S('Back in the 80s and 90s', a => [
  lb("80s & 90s", 960, 150, 96, { font: 'marker', c: COL.orange }),
  sk('jobSeeker', 420, 'rest', 'smile'),
  pr('truck', 860, 640, 0.8),
  pie({ x: 1450, y: 460, p: 0.32, c: COL.blue, label: '~1/3', r: 200, t: a('third') - 0.2 }),
  lb('moved for a new job', 1450, 730, 62, { t: a('moved for') }),
]);
S('By early 2023', a => [
  sk('jobSeeker', 420, 'sad', 'sad'),
  big('1.6%', 1180, 420, { size: 260, t: a('1.6%') }),
  lb('of job seekers moved (early 2023)', 1180, 640, 60),
  lb('(Challenger)', 1180, 730, 48, { c: '#7a828c', t: a('Challenger') }),
]);
S("In Atlas Van Lines'", a => [
  card({ x: 1100, y: 470, w: 1150, h: 560, src: 'ATLAS VAN LINES  |  2026 RELOCATION SURVEY', tag: 'Employers', title: '59% of companies had an employee turn down a move',
    body: ['59% of companies said at least one employee turned down a relocation offer last year.', 'Housing was a key reason in about half of those cases.'], hl: [{ p: 0, at: 0.8, d: 2.0 }] }),
  peek('L', 'serious', 'stickR'),
], { z0: 1, z1: 1.05, cx: 1100, cy: 470 });
S('59% of companies', a => [
  icons({ x: 700, y: 480, n: 10, k: 6, icon: 'building', cols: 5, size: 0.42, gap: 140, hiAt: 0.4, stagger: 0.04 }),
  big('59%', 700, 180, { size: 130 }),
  lb('of companies', 700, 780, 60),
  sk('worker', 1250, 'stop', 'worried'),
  pr('stamp', 1560, 400, 0.7, { text: 'DECLINED', t: a('DOWN') }),
  lb('relocation offer', 1560, 270, 54, { t: a('relocation offer') }),
]);
S('And housing was a key reason', a => [
  sk('worker', 400, 'stop', 'worried'),
  pr('laptop', 900, 540, 1.0, { text: 'RELOCATION\nOFFER', size: 36 }),
  pr('stamp', 900, 560, 0.62, { text: 'DECLINED' }),
  pie({ x: 1530, y: 430, p: 0.5, c: COL.orange, label: '~HALF', r: 170, size: 64, t: a('half') - 0.2 }),
  lb('housing was a key reason', 1530, 650, 56, { t: a('key reason') }),
]);
S("either the house they'd have", a => [
  pr('house', 560, 600, 1.1, { sale: 1 }), lb('the house to SELL', 560, 250, 66, { t: a('sell') }),
  pr('house', 1360, 600, 1.1, { v: 'big', t: a('buy') - 0.2 }), lb('the house to BUY', 1360, 250, 66, { t: a('buy') }),
  pr('tag', 1640, 380, 0.7, { text: '$$$', t: a('buy') }),
]);
S('Less than five years ago', a => [
  m(400, 'shrug', 'serious', { s: 0.8 }),
  lb('5 years ago: housing?', 1150, 300, 76),
  pr('house', 1150, 520, 0.4),
  lb('barely a factor', 1150, 720, 80, { t: a('barely') }),
]);
S('That Illinois and Wharton research', a => [
  lb('same pattern', 960, 170, 88, { t: a('same pattern') }),
  sk('econA', 600, 'present', 'smirk'), sk('econB', 1340, 'chin', 'flat'),
  pr('clipboard', 960, 560, 0.8, { title: 'DATA' }),
]);
S('When people are locked', a => [
  sk('worker', 520, 'rest', 'flat'),
  pr('lock', 520, 640, 0.75, { t: a('locked') }),
  pr('laptop', 1260, 520, 1.25, { text: 'BETTER JOB\n(elsewhere)', size: 36, t: a('better job') - 0.2 }),
  lb('...respond LESS', 1260, 820, 72, { t: a('LESS'), c: COL.red }),
]);
S('By their estimate', a => [
  pr('truck', 640, 600, 1.1), pr('zig', 640, 320, 0.45, { dir: 'down' }),
  big('-25%', 1340, 390, { size: 220, t: a('25%') }),
  lb('in moving, over about a decade', 1340, 600, 58, { t: a('decade') }),
]);
S('The translation the better job', a => transl());
S('and the mortgage says no', a => [
  pr('doc', 720, 580, 1.6, { title: 'MORTGAGE' }),
  pr('bubble', 1250, 330, 1.1, { text: 'NO.', size: 120, font: 'marker', c: COL.red, w: 360, h: 230, tail: 'bl' }),
  pr('building', 1650, 680, 0.9, { t: 0 }), lb('job city', 1650, 330, 50),
]);
S('So you end up with a nurse', a => [
  sk('nurse', 420, 'sad', 'sad'),
  pr('arrow', 860, 600, 1, { pts: [[-190, 0], [0, -30], [190, 0]], c: '#888', lw: 8, t: a('two states') - 0.3 }),
  lb('2 states away', 860, 510, 56, { t: a('two states') }),
  pr('hospital', 1380, 620, 1.3, { t: a('hospital') - 0.2 }),
  lb('higher pay', 1380, 210, 72, { t: a('higher-paying'), c: COL.green }),
]);
S("A family that can't move", a => [
  sk('dad', 300, 'rest', 'sad'), sk('mom', 500, 'rest', 'sad'), sk('kid', 660, 'rest', 'sad'),
  pr('arrow', 960, 620, 1, { pts: [[-160, 0], [160, 0]], c: '#888', lw: 8 }),
  sk('oldMom', 1350, 'wave', 'smile'), sk('oldDad', 1600, 'rest', 'smile'),
  lb('closer to aging parents?', 960, 170, 72, { t: a('aging parents') }),
]);
S('A retiree rattling around', a => [
  pr('house', 960, 580, 1.9, { v: 'big' }),
  sk('retiree', 1000, 'sad', 'sad', { s: 0.45, y: 880 }),
  lb('4 bedrooms. 1 retiree.', 960, 140, 80),
  lb('selling costs more than staying', 960, 860, 58, { t: a('cost more') }),
]);
S('And the people who feel it MOST', a => [
  m(960, 'sad', 'sad', { s: 1.0 }),
  lb('lives that just changed', 960, 170, 80, { t: a('changed') }),
]);
S('A divorce', a => [
  sk('divorceeA', 480, 'rest', 'sad'),
  pr('heart', 960, 470, 1.3, { broken: 1 }),
  sk('divorceeB', 1440, 'rest', 'sad'),
]);
S('A new baby', a => [
  sk('mom', 640, 'carry', 'grin', { hold: { R: holdProp('baby', 0.6, {}, -50, -20) } }),
  sk('dad', 900, 'rest', 'grin'),
  pr('crib', 1420, 660, 1.1),
]);
S('A death in the family', a => [
  sk('mourner', 700, 'holdR', 'sad', { hold: { R: holdProp('flowers', 0.5) } }),
  pr('grave', 1250, 640, 1.4),
]);
S("Life doesn't wait", a => [
  lb("Life doesn't wait for rates.", 960, 180, 80),
  pr('clock', 680, 520, 1.4, { speed: 300 }),
  pr('pct', 1250, 520, 1.4),
  m(1650, 'rest', 'serious', { s: 0.7 }),
]);
S('None of them are broke', a => {
  const who = ['nurse', 'retiree', 'dad', 'divorceeB'], xs = [330, 760, 1190, 1620];
  const out = [lb('NOT broke...', 960, 140, 76)];
  who.forEach((w, i) => { out.push(pr('ballchain', xs[i] + 130, 890, 0.42, { house: 1, t: a('stuck') - 0.2 + i * 0.08 })); out.push(sk(w, xs[i], 'sad', 'sad', { s: 0.7 })); });
  out.push(big('STUCK.', 960, 300, { size: 140, t: a('stuck') }));
  return out;
});
S('Remember that couple', a => [
  m(330, 'pointR', 'determined'),
  sk('husband', 880, 'rest', 'smile'), sk('wife', 1100, 'rest', 'smile'),
  pr('lock', 1500, 600, 1.2), pr('pct', 1500, 420, 0.7, { label: '3%' }),
]);
S("They're not stuck because they're poor", a => [
  pr('cash', 960, 560, 1.7),
  lb('poor?', 960, 220, 110),
  X(960, 540, 1.7, a('poor') + 0.2),
]);
S("They're stuck because doing", a => [
  lb('the most normal thing in the world:', 960, 170, 66),
  pr('truck', 960, 560, 1.4, { t: a('moving when') - 0.2 }),
  lb('moving when your life changes', 960, 820, 66, { t: a('moving when') }),
  pr('baby', 420, 560, 0.9, { t: a('life changes') }), pr('briefcase', 1500, 560, 0.8, { t: a('life changes') + 0.2 }),
]);
S('would cost them close to', a => [
  pr('truck', 560, 600, 1.0),
  m(560, 'shrug', 'determined', { s: 0.55, y: 940, enter: 'none' }),
  big('~$100,000', 1340, 330, { size: 130, t: a('$100,000') - 0.2 }),
  lb('up front', 1340, 450, 64, { t: a('up front') }),
  big('+$840/mo', 1340, 640, { size: 110, c: COL.orange, t: a('$840') - 0.2 }),
  lb('for the next 30 years', 1340, 770, 60, { t: a('next 30') }),
]);
S("So who's actually locked out", a => [
  m(440, 'chin', 'determined'),
  pr('lock', 1250, 560, 2.0),
  lb('who is locked out?', 1250, 200, 80),
]);
S("It's not the people without money", a => [
  sk('buyer', 640, 'shrug', 'sad'),
  pr('piggy', 1260, 640, 0.85),
  lb('people without money?', 960, 200, 76),
  X(1260, 620, 1.3, a('without money') + 0.3),
]);
S("It's millions of people WITH money", a => [
  pr('wallMoney', 960, 600, 2.0),
  lb('millions of people WITH money', 960, 140, 72),
  pr('lock', 1350, 760, 0.8, { t: a('trapped') }),
  lb('trapped inside the walls', 960, 860, 64, { t: a('trapped'), c: COL.red }),
]);
S('And the strange part is', a => [
  m(960, 'chin', 'confused', { s: 1.0 }),
  lb('the strange part...', 960, 170, 80),
]);
S('every one of these rules', a => [
  m(330, 'stickR', 'confused'),
  pr('board', 1200, 420, 1, { text: 'Each rule made\nsense on its own', size: 88 }),
]);
S('Cheap rates to help', a => [
  lb('each rule made sense on its own', 960, 160, 72),
  pr('pct', 380, 520, 1.2, { t: a('Cheap rates') }), lb('cheap rates', 380, 730, 62, { t: a('Cheap rates') }), OK(520, 380, 0.5, a('Cheap rates') + 0.4),
  pr('gift', 960, 520, 1.1, { t: a('tax break') }), lb('tax break for owners', 960, 730, 62, { t: a('tax break') }), OK(1100, 380, 0.5, a('tax break') + 0.4),
  pr('shield', 1540, 520, 1.1, { text: 'CAP', t: a('Tax caps') }), lb('tax caps for seniors', 1540, 730, 62, { t: a('Tax caps') }), OK(1680, 380, 0.5, a('Tax caps') + 0.4),
]);
S('But stack them together', a => [
  pr('cage', 960, 560, 1.6, { inner: 'house', t: 0.2 }),
  pr('pct', 760, 220, 0.5, { enter: 'drop', t: 0.4 }), pr('gift', 960, 200, 0.45, { enter: 'drop', t: 0.6 }), pr('shield', 1160, 210, 0.45, { text: 'CAP', size: 40, enter: 'drop', t: 0.8 }),
  lb('the smartest move:', 1600, 420, 58, { t: a('smartest') }),
  lb('NEVER move again', 1600, 520, 70, { t: a('never move'), c: COL.red }),
]);
S("What we've built", a => [
  pr('house', 560, 620, 1.1),
  lb('STAY', 560, 230, 110, { font: 'marker', c: COL.green, t: a('stay') }),
  pr('coin', 400, 360, 0.55, { enter: 'drop', t: a('pays') }), pr('coin', 720, 340, 0.55, { enter: 'drop', t: a('pays') + 0.2 }),
  pr('truck', 1370, 630, 1.0, { t: a('leave') - 0.3 }),
  lb('LEAVE', 1370, 230, 110, { font: 'marker', c: COL.red, t: a('leave') }),
  pr('ticket', 1370, 430, 0.85, { text: 'FINE', sub: 'for leaving', t: a('fines') }),
]);
S('The rate punishes you', a => [
  lb('punished for moving:', 960, 140, 70),
  pr('pct', 260, 470, 0.95), pr('stamp', 260, 690, 0.42, { text: 'PENALTY', t: 0.4 }),
  pr('tag', 620, 470, 0.75, { text: 'FEES', r: 0, t: a('fees') - 0.2 }), pr('stamp', 620, 690, 0.42, { text: 'PENALTY', t: a('fees') + 0.4 }),
  pr('shield', 980, 470, 0.85, { text: 'INS.', t: a('insurance') - 0.2 }), pr('stamp', 980, 690, 0.42, { text: 'PENALTY', t: a('insurance') + 0.4 }),
  pr('doc', 1330, 470, 0.85, { title: 'PROP. TAX', c: COL.dgreen, t: a('property tax') - 0.2 }), pr('stamp', 1330, 690, 0.42, { text: 'PENALTY', t: a('property tax') + 0.4 }),
  pr('taxForm', 1680, 470, 0.85, { t: a('tax code') - 0.2 }), pr('stamp', 1680, 690, 0.42, { text: 'PENALTY', t: a('tax code') + 0.4 }),
]);
S('then REWARDS you', a => [
  pr('gift', 960, 520, 1.6),
  lb('REWARDED for never moving', 960, 190, 84, { c: COL.green }),
  sk('boomer', 420, 'cheer', 'grin'), sk('boomerWife', 1500, 'cheer', 'grin'),
  peek('R', 'disgust', 'rest', { t: 0.6, s: 1.2 }),
]);
S('And then everyone acts surprised', a => {
  const ids = ['chair1', 'chair2', 'chair3', 'chair4', 'chair5'];
  const out = [lb("...nobody's moving?!", 960, 150, 84, { t: a("nobody's moving") })];
  ids.forEach((id, i) => out.push(sk(id, 280 + i * 340, i % 2 ? 'cover' : 'up', 'shock', { s: 0.74, t: i * 0.08 })));
  return out;
});
S('Or that prices', a => [
  pr('tag', 900, 480, 1.6, { text: 'PRICES', size: 46 }),
  pr('arrow', 1380, 470, 1, { pts: [[0, 150], [0, -150]], c: COL.red, lw: 18 }),
  lb("won't come down", 960, 790, 78),
]);
S('Or that first-time buyers', a => [
  sk('firstBuyer', 480, 'shrug', 'sad'),
  lb('nothing to buy', 1260, 250, 90),
  pr('q', 1100, 560, 1.0), pr('q', 1400, 520, 0.8, { t: 0.2 }),
]);
S('The American dream used to be', a => [
  pr('flag', 290, 470, 1.0),
  sk('husband', 720, 'cheer', 'grin'), sk('wife', 940, 'cheer', 'grin'),
  pr('house', 1430, 600, 1.3, { sold: 1 }),
  lb('our first home!', 1430, 230, 72, { t: a('first home') }),
]);
S('Now... the dream', a => [
  pr('house', 1330, 600, 1.45),
  pr('lock', 1330, 690, 0.6),
  m(620, [[0, 'rest'], [a('leave'), 'presentR']], 'serious', { s: 1.0 }),
  lb('...being able to afford to LEAVE it', 1150, 170, 70, { t: a('afford') }),
]);

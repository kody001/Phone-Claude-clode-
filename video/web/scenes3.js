// ===================== PART 3: 9:03 - 13:35 =====================
// shared stock chart (illustrative path consistent with the script's numbers)
const PX = [[0.0, 150], [0.03, 176], [0.07, 204], [0.1, 224], [0.14, 201], [0.18, 172], [0.22, 151], [0.25, 133], [0.29, 124], [0.33, 116], [0.36, 108], [0.42, 121], [0.5, 138], [0.56, 129], [0.64, 147], [0.7, 158], [0.75, 143], [0.82, 136], [0.9, 131], [0.95, 127.79]];
const CH = { x: 170, y: 220, w: 1180, h: 560, lo: 90, hi: 240, ipo: 135 };
const chY = p => CH.y + CH.h - (p - CH.lo) / (CH.hi - CH.lo) * CH.h;
const chX = f => CH.x + f * CH.w;
function pxFrac(i) { const pts = PX.map(([f, p]) => [chX(f), chY(p)]); return polyLen(pts.slice(0, i + 1)) / polyLen(pts); }
function stockChart(from, keys, o = {}) {
  return lineChart({ x: CH.x, y: CH.y, w: CH.w, h: CH.h, t0: SHOT_T0, straight: true, color: o.color || COL.dblue, lw: 8, data: PX.map(([f, p]) => [f, (p - CH.lo) / (CH.hi - CH.lo)]), from, keys, ref: (CH.ipo - CH.lo) / (CH.hi - CH.lo), refLabel: 'IPO price', refColor: '#888', xlabels: [[0, 'June'], [.2, 'July'], [.4, 'Aug'], [.6, 'Sep'], [.75, 'Oct'], [.92, 'Nov']], segDur: o.segDur || 1.0 });
}
function dot(i, t0, label, o = {}) {
  const [f, p] = PX[i]; const x = chX(f), y = chY(p);
  return [E({ t0: tt(t0), x, y, enter: 'pop', z: 6, render: c => { c.beginPath(); c.arc(0, 0, 14, 0, 7); c.fillStyle = o.color || COL.red; c.fill(); c.lineWidth = 4; c.strokeStyle = '#fff'; c.stroke(); } }),
    note(label, x + (o.dx || 0), y + (o.dy ?? -60), t0, { size: o.size || 52, font: 'marker', color: o.color || COL.red, outline: '#fff', olw: 8 })];
}
// L44 But before I get into what happened to the stock next... let's take a quick pause.
S('but before i get into', (add) => {
  const e = elon({ x: 1300, s: .9, expr: 'happy' });
  add(P('phone', { screen: 'chartDown', title: 'SPACEX' }, 600, 470, 1.1, null, { t1: T('quick pause') - .05 }));
  add(P('qmark', {}, 820, 330, .8, T('what happened'), { t1: T('quick pause') - .05 }));
  add(E({ t0: T('quick pause'), x: 600, y: 470, enter: 'popBig', z: 4, render: c => { SEED = 9; circle(c, 0, 0, 200, { fill: '#fff', lw: 10 }); rect(c, -70, -95, 50, 190, { fill: INK, lw: 4, r: 8 }); rect(c, 20, -95, 50, 190, { fill: INK, lw: 4, r: 8 }); } }));
  add(note('quick pause', 600, 760, T('quick pause'), { size: 64, font: 'marker' }));
  e.pose(T('quick pause'), 'stopR').face(T('pause'), 'grin');
  add(e);
});
// If you're getting something out of this breakdown, hit subscribe.
S("if you're getting", (add) => {
  const e = elon({ x: 1450, s: .9, expr: 'happy' });
  const tSub = T('hit subscribe');
  add(E({ t0: SHOT_T0 + .2, x: 700, y: 470, enter: 'popBig', z: 4, render: (c, t) => {
    const done = t > tSub + .75; const press = t > tSub + .6 && t < tSub + .85 ? .93 : 1;
    c.scale(press, press);
    SEED = 12; rect(c, -300, -80, 600, 160, { fill: done ? '#cfcfcf' : '#e62117', lw: 7, r: 30 });
    text(c, done ? 'SUBSCRIBED' : 'SUBSCRIBE', 0, 4, { size: 82, font: 'cap', weight: 700, color: done ? '#555' : '#fff' });
  } }));
  add(E({ t0: tSub, x: 0, y: 0, enter: 'none', z: 7, render: (c, t, el) => {
    const p = ease.inOut(clamp((t - el.t0) / .6)); const x = lerp(1100, 760, p), y = lerp(800, 500, p);
    c.save(); c.translate(x, y); c.rotate(-.3); c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 70); c.lineTo(18, 54); c.lineTo(32, 84); c.lineTo(44, 78); c.lineTo(30, 50); c.lineTo(54, 48); c.closePath(); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 5; c.strokeStyle = INK; c.lineJoin = 'round'; c.stroke(); c.restore();
  } }));
  add(P('bell', {}, 1100, 300, .5, tSub + .9, { enter: 'swing' }));
  e.pose(T('subscribe'), 'point', { at: [760, 470] }).face(tSub + .8, 'laugh');
  add(e);
});
// I make these videos to give you the whole story behind the headline... not just the headline.
S('i make these videos', (add) => {
  const e = elon({ x: 1600, expr: 'happy' });
  add(E({ t0: SHOT_T0 + .1, x: 760, y: 470, enter: 'pop', z: 1, t1: T('headline') - .05, render: c => { drawSprite(c, 'screen', { bg: '#fff' }, 0, 0, 1.1); SEED = 5; shape(c, [[-50, -70], [-50, 50], [60, -10]], { fill: COL.red, lw: 5 }); } }));
  add(P('newspaper', { name: 'THE HEADLINE', head: 'SpaceX IPO\nBREAKS RECORDS', hsize: 44 }, 440, 400, .95, T('headline')));
  add(P('doc', { title: 'THE WHOLE STORY', lines: ['-', '-', '-', '-', '-', '-', '-'], w: 520, h: 700 }, 1040, 470, .95, T('whole story')));
  add(note('not just this...', 440, 760, T('not just the'), { size: 56, color: COL.red }));
  add(arrowTo(700, 760, 820, 700, T('not just') + .4, { color: COL.dgreen, bend: .3 }));
  e.pose(T('whole story'), 'point', { at: [1040, 470] });
  add(e);
});
// It helps the channel more than you'd think. Alright... back to SpaceX.
S('it helps the channel', (add) => {
  const e = elon({ x: 960, s: .9, expr: 'happy' });
  add(P('heart', {}, 560, 400, 1.1, T('helps')));
  add(P('heart', {}, 1380, 360, .8, T('channel'), { rot: 12 }));
  add(big('BACK TO SPACEX', 960, 180, T('back to spacex'), { size: 96, color: COL.dblue }));
  add(rocketFly([[300, 1100], [700, 600], [1700, -200]], T('back to'), 1.6, { s: .45 }));
  e.pose(T('helps'), 'thumbsUp').pose(T('alright'), 'waveR').face(T('alright'), 'grin');
  add(e);
});
// L45 Now, I know what some of you are thinking. "Okay... but the stock went UP. People made money."
S('now i know what some', (add) => {
  const v = stick({ x: 420, s: 1.15, seed: 261, hair: 'messy', hairColor: '#4a2f17', skin: SKINS[1], outfit: { type: 'shirt', color: '#a7d58f' }, expr: 'skeptical', pose: 'thinkR' });
  add(v);
  add(P('thought', { text: '"But the stock\nwent UP!"', w: 520, h: 330, size: 58 }, 760, 300, 1, T('okay')));
  add(P('arrowUp', {}, 1200, 400, .55, T('went up')));
  add(P('moneybag', {}, 1200, 700, .6, T('made money')));
  add(note('"People made money."', 860, 620, T('people made'), { size: 56 }));
  v.pose(T('stock went'), 'pointUpR').face(T('stock went'), 'smug');
  const e = elon({ x: 1680, expr: 'neutral', s: .74 });
  add(e);
});
// L46 And at first... they did. The stock opened at $150. Within days, it was trading above $220.
S('and at first', (add) => {
  const e = elon({ x: 1680, expr: 'happy', s: .74 });
  add(...stockChart(0, [[T('opened'), pxFrac(0) + .001], [T('within days'), pxFrac(3)]]));
  add(...dot(0, T('a hundred and fifty'), '$150 open', { color: COL.dgreen, dx: 60, dy: -60 }));
  add(...dot(3, T('two hundred'), '$220+', { color: COL.dgreen, dx: 40 }));
  add(note('they did!', 600, 140, T('they did'), { size: 64, color: COL.dgreen, font: 'marker' }));
  e.pose(T('two hundred'), 'pointer', { at: [chX(.1), chY(224)] }).face(T('two hundred'), 'grin');
  add(e);
});
// L47 Then gravity kicked in.
S('then gravity kicked in', (add) => {
  const e = elon({ x: 1680, expr: 'neutral', s: .74 });
  add(...stockChart(pxFrac(3), [[SHOT_T0 + .3, pxFrac(6)]]));
  add(big('GRAVITY', 760, 140, T('gravity'), { size: 110, color: COL.red }));
  add(mover('rocket', {}, [[chX(.1), chY(224) - 160, .3, 180], [chX(.2), chY(160) - 120, .3, 200]], T('gravity'), 1.2, { ease: ease.in }));
  e.face(T('kicked'), 'sad');
  add(e);
});
// On July 15th, the stock fell BELOW its IPO price for the first time.
S('on july fifteenth', (add) => {
  const e = elon({ x: 1680, expr: 'worried', s: .74 });
  add(...stockChart(pxFrac(6), [[T('fell below'), pxFrac(7)]]));
  add(P('calendar', { month: 'JULY', day: '15' }, 1500, 230, .7));
  add(circleMark(chX(.25), chY(134), 70, 60, T('below') + .3));
  add(note('BELOW IPO PRICE', chX(.25) + 180, chY(134) + 110, T('below'), { size: 56, color: COL.red, font: 'marker' }));
  e.pose(T('below'), 'pointer', { at: [chX(.25), chY(134)] });
  add(e);
});
// By late July, Musk had already lost his trillionaire title.
S('by late july', (add) => {
  const e = elon({ x: 960, s: .9, expr: 'neutral' });
  add(e);
  const hy = 955 - 642 * .9 - 30;
  const tl = T('lost his');
  add(E({ t0: SHOT_T0, x: 960, y: hy, enter: 'none', z: 9, render: (c, t, el) => { const p = clamp((t - tl) / 1.0); const y = p > 0 ? ease.in(p) * 700 : 0; const r = p * 2.5;
    c.translate(p * 260, y); c.rotate(r); drawSprite(c, 'crown', {}, 0, 0, .7);
  } }));
  add(big('TRILLIONAIRE', 520, 300, null, { size: 80, color: '#c99a10' }));
  add(strike(260, 330, 780, 280, T('title'), { lw: 16 }));
  add(note('late July', 1450, 250, null, { size: 60 }));
  e.face(T('lost his'), 'sadopen').pose(T('lost his'), 'shrug');
});
// On August 5th... the day after SpaceX's first earnings report as a public company... it closed at about $108.
S('on august fifth', (add) => {
  const e = elon({ x: 1680, expr: 'worried', s: .74 });
  add(...stockChart(pxFrac(7), [[SHOT_T0 + .4, pxFrac(10)]]));
  add(P('calendar', { month: 'AUG', day: '5' }, 1500, 230, .7));
  add(P('doc', { title: 'Q2 EARNINGS', lines: ['-', '-'], w: 300, h: 300, tsize: 36 }, 980, 260, .6, T('earnings report')));
  add(...dot(10, T('a hundred and eight'), '$108', { dx: -110, dy: 10 }));
  e.pose(T('a hundred and eight'), 'pointer', { at: [chX(.36), chY(108)] }).face(T('a hundred and eight'), 'sad');
  add(e);
});
// Nearly 20% below what IPO buyers paid.
S('nearly twenty percent', (add) => {
  const e = elon({ x: 1680, expr: 'sad', s: .74 });
  add(...stockChart(pxFrac(10), []));
  add(E({ t0: SHOT_T0 + .1, x: 0, y: 0, enter: 'none', z: 6, render: (c, t, el) => { const p = ease.out(clamp((t - el.t0) / .5)); const x = chX(.36) + 70; SEED = 3; c.globalAlpha = p; line(c, [[x, chY(135)], [x, chY(135) + (chY(108) - chY(135)) * p]], { lw: 8, stroke: COL.red }); arrowHead(c, x, chY(135) + (chY(108) - chY(135)) * p, Math.PI / 2, 24, { color: COL.red, lw: 8 }); } }));
  add(big('-20%', chX(.36) + 200, chY(122), T('twenty percent'), { size: 120, color: COL.red }));
  add(note('vs. what IPO buyers paid', chX(.36) + 330, chY(165), T('ipo buyers'), { size: 50 }));
  add(e);
});
// L48 And on November 20th... it closed at $127.79. Below the IPO price... AGAIN.
S('and on november twentieth', (add) => {
  const e = elon({ x: 1680, expr: 'unimpressed', s: .74 });
  add(...stockChart(pxFrac(10), [[SHOT_T0 + .3, 1]], { segDur: 2.2 }));
  add(P('calendar', { month: 'NOV', day: '20' }, 1500, 230, .7));
  add(...dot(19, T('a hundred and twenty-seven'), '$127.79', { dx: -60, dy: 70 }));
  add(stamp('BELOW IPO PRICE AGAIN', 760, 160, T('again'), { size: 62 }));
  e.pose(T('a hundred and twenty-seven'), 'pointer', { at: [chX(.95), chY(127.79)] }).face(T('again'), 'unimpressed');
  add(e);
});
// L49 Even at the IPO price, SpaceX was valued at roughly 67 times its sales from the year before.
S('even at the ipo price', (add) => {
  const e = elon({ x: 1650, expr: 'surprised' });
  add(P('badge', { text: 'SpaceX', size: 50, color: '#e8ecf0' }, 360, 430, 1.0));
  add(P('tag', { text: '67x SALES', size: 36 }, 820, 400, 1.6, T('sixty-seven'), { enter: 'swing' }));
  add(note('price ÷ last year\'s sales', 820, 640, T('sales'), { size: 54 }));
  add(note('(that is VERY expensive)', 820, 720, T('year before'), { size: 50, color: COL.red }));
  e.face(T('sixty-seven'), 'shocked');
  add(e);
});
// Morningstar put its fair value at around $780 billion... less than HALF of what the IPO said it was worth.
S('morningstar put', (add) => {
  const m = stick({ x: 1500, s: 1.0, seed: 271, hair: 'side', hairColor: '#333', glasses: 'square', outfit: { type: 'suit', color: '#355c7d', tie: COL.yellow }, expr: 'neutral', pose: 'presentL' });
  add(m);
  add(P('label', { text: 'Morningstar', w: 300, font: 'marker' }, 1500, 420, .9));
  add(...bars({ x: 160, y: 230, w: 1000, h: 560, vals: [1.9, .78], max: 1.9, colors: ['#c7ccd1', COL.green], labels: ['IPO valuation', 'Morningstar fair value'], vlabels: ['', '$780B'], vcolors: [INK, COL.dgreen], times: [SHOT_T0 + .2, T('seven hundred')], lsize: 42, vsize: 76 }));
  add(E({ t0: SHOT_T0, x: 0, y: 0, enter: 'fade', z: 3, render: c => { SEED = 80; line(c, [[140, 790], [1180, 790]], { lw: 6 }); } }));
  add(big('< HALF', 910, 300, T('half'), { size: 100, color: COL.red }));
  m.face(T('half'), 'skeptical');
});
// Even Aswath Damodaran, the NYU professor often called the dean of valuation, put it at about $1.3 trillion.
S('even aswath', (add) => {
  const d = stick({ x: 1350, s: 1.15, seed: 281, hair: 'bald', hairColor: '#555', glasses: 'round', beard: 'mustache', skin: SKINS[2], outfit: { type: 'suit', color: '#6b4a2b', tie: '#2f6aa3' }, expr: 'neutral', pose: 'presentL' });
  add(d);
  add(P('label', { text: 'Aswath Damodaran', w: 440, font: 'marker' }, 1350, 300, 1, T('aswath')));
  add(note('NYU professor', 1350, 210, T('nyu'), { size: 52 }));
  add(P('chalkboard', { text: '"Dean of\nValuation"', size: 70, w: 560, h: 340 }, 560, 330, 1, T('dean of')));
  add(big('~$1.3 TRILLION', 560, 700, T('one point three'), { size: 96, color: COL.dblue }));
  add(note('(still below the IPO value)', 560, 810, T('trillion'), { size: 48, color: '#666' }));
  d.face(T('one point three'), 'skeptical');
});
// L50 But for Musk... the stock price isn't just a scoreboard. It's a CURRENCY.
S('but for musk the stock', (add) => {
  const e = elon({ x: 1600, expr: 'smug' });
  add(P('scoreboard', { title: 'STOCK PRICE', text: '$$$' }, 520, 330, .9, T('scoreboard')));
  add(...crossOut(520, 330, 380, 220, T('currency') - .3));
  add(P('bill', {}, 900, 650, 1.6, T('currency'), { enter: 'spin' }));
  add(big("IT'S A CURRENCY", 900, 860 - 20, T('currency'), { size: 80, color: COL.dgreen }));
  e.pose(T('currency'), 'presentL').face(T('currency'), 'grin');
  add(e);
});
// L51 Four days after the IPO, SpaceX announced it was buying Cursor, an AI coding startup... for $60B. Paid entirely in stock.
S('four days after the ipo', (add) => {
  const e = elon({ x: 1680, expr: 'happy', s: .76 });
  add(P('calendar', { month: 'IPO +', day: '4 days', dsize: 54 }, 220, 200, .75));
  add(P('laptop', { code: true }, 600, 480, 1.3, T('cursor')));
  add(note('Cursor', 600, 230, T('cursor'), { size: 80, font: 'marker' }));
  add(note('(AI coding startup)', 600, 740, T('coding startup'), { size: 50 }));
  add(P('tag', { text: '$60B', size: 64 }, 1080, 330, 1.2, T('sixty billion'), { enter: 'swing' }));
  for (let i = 0; i < 4; i++) add(P('share', { text: 'STOCK', sub: 'SpaceX' }, 1080 + (i - 1.5) * 40, 650 - i * 26, .55, T('entirely in stock') + i * .1, { enter: 'drop' }));
  add(note('paid 100% in stock', 1080, 860, T('entirely'), { size: 52, color: COL.dblue }));
  e.pose(T('buying cursor'), 'point', { at: [600, 480] });
  add(e);
});
// Back in April, SpaceX had signed a deal giving it the option to buy Cursor for $60B... or pay $10B if it walked away.
S('back in april', (add) => {
  const e = elon({ x: 1680, expr: 'neutral', s: .76 });
  add(P('calendar', { month: 'APRIL', day: 'deal', dsize: 70 }, 220, 200, .75));
  add(P('doc', { title: 'OPTION DEAL', lines: ['SpaceX may:', '-', '!buy Cursor for $60B', 'OR', '!walk away & pay $10B'], fsize: 40, w: 640, h: 560 }, 700, 470, 1.0, T('signed a deal')));
  const dl = docLines({ title: 'OPTION DEAL', lines: ['SpaceX may:', '-', '!buy Cursor for $60B', 'OR', '!walk away & pay $10B'], fsize: 40, w: 640, h: 560 }, 700, 470, 1);
  add(highlight(dl.left - 6, dl.ys[2] - 28, 440, 54, T('option'), { color: '#9fe39a' }));
  add(highlight(dl.left - 6, dl.ys[4] - 28, 470, 54, T('ten billion'), { color: '#f7a6a6' }));
  add(P('sign', { text: 'EXIT', w: 220, h: 200, color: COL.red, tcolor: '#fff' }, 1240, 600, .9, T('walked away')));
  e.pose(T('ten billion'), 'pointer', { at: [700, dl.ys[4]] }).face(T('walked away'), 'smug');
  add(e);
});
// Cursor's last funding round had valued it at around $29 billion.
S("cursor's last funding", (add) => {
  const e = elon({ x: 1680, expr: 'neutral', s: .76 });
  add(...bars({ x: 200, y: 250, w: 1000, h: 540, vals: [29, 60], max: 60, colors: ['#c7ccd1', COL.blue], labels: ['Last funding round', 'SpaceX deal'], vlabels: ['~$29B', '$60B'], vcolors: [INK, COL.dblue], times: [T('twenty-nine'), SHOT_T0 + .2], lsize: 44, vsize: 76 }));
  add(E({ t0: SHOT_T0, x: 0, y: 0, enter: 'fade', z: 3, render: c => { SEED = 81; line(c, [[180, 790], [1220, 790]], { lw: 6 }); } }));
  add(big('~2x', 700, 200, T('twenty-nine') + .5, { size: 110, color: COL.red }));
  e.face(T('twenty-nine') + .5, 'surprised');
  add(e);
});
// L52 By the time SpaceX pulled the trigger, its market value had jumped by roughly $740B... in less than four trading days.
S('by the time spacex pulled', (add) => {
  const e = elon({ x: 1650, expr: 'grin', pose: 'cheer' });
  add(P('badge', { text: 'SpaceX', size: 50, color: '#e8ecf0' }, 360, 420, 1.0));
  add(P('arrowUp', {}, 760, 380, .9, T('jumped')));
  add(counter(860, 700, 0, 740, v => '+$' + Math.round(v) + ' BILLION', T('seven hundred'), 1.4, { size: 100, color: COL.dgreen }));
  add(P('calendar', { month: 'TRADING', day: '< 4 days', dsize: 46 }, 1250, 280, .8, T('four trading')));
  add(e);
});
// Fortune pointed out that the surge in the stock basically paid for the whole deal in a few hours of trading.
S('fortune pointed out', (add) => {
  const e = elon({ x: 1680, expr: 'smug', s: .76 });
  add(P('newspaper', { name: 'FORTUNE', head: 'The surge paid\nfor the deal', hsize: 42 }, 400, 330, .9));
  add(P('stopwatch', { text: 'few hrs', size: 46 }, 900, 380, 1.0, T('few hours')));
  add(P('tag', { text: 'Cursor $60B', size: 40 }, 1240, 400, 1.1, T('whole deal')));
  add(stamp('PAID', 1240, 400, T('few hours') + .4, { size: 70, color: COL.dgreen }));
  add(P('arrowUp', {}, 640, 740, .5, T('surge')));
  e.face(T('few hours'), 'laugh');
  add(e);
});
// L53 The translation... when your shares are THAT expensive, you don't need cash to buy companies. You just hand over more shares.
S('the translation when your', (add) => {
  const e = elon({ x: 520, expr: 'smug', s: .86 });
  const s2 = stick({ x: 1450, s: 1.05, seed: 291, hair: 'messy', hairColor: '#5a3a1a', outfit: { type: 'shirt', color: '#f5d76e' }, expr: 'happy', pose: 'grab' });
  add(s2);
  add(note('TRANSLATION:', 300, 140, null, { size: 66, font: 'marker', color: COL.red }));
  add(P('cash', {}, 960, 330, .8, T("don't need cash")));
  add(...crossOut(960, 330, 260, 170, T('need cash') + .3));
  for (let i = 0; i < 5; i++) add(mover('share', { text: 'SHARES', sub: 'SpaceX' }, [[700, 520, .45, -10], [1000, 420, .45, 0], [1330, 560, .45, 10]], T('hand over') + i * .3, .9));
  e.pose(T('hand over'), 'presentR').face(T('more shares'), 'grin');
  add(e);
});
// L54 So the first big move of the world's most famous rocket company... as a public company... was buying a coding app.
S('so the first big move', (add) => {
  const e = elon({ x: 1650, expr: 'neutral' });
  add(P('rocket', { label: 'SpaceX' }, 560, 520, 1.15));
  add(P('laptop', { code: true }, 820, 690, .8, T('coding app'), { enter: 'drop' }));
  add(note("world's most famous rocket company", 700, 140, T('most famous'), { size: 58 }));
  add(big('...a coding app?', 1000, 330, T('coding app'), { size: 90, color: COL.red }));
  e.face(T('coding app'), 'laugh').pose(T('coding app'), 'shrug');
  add(e);
});
// L55 And the money SpaceX makes now... is coming more and more from somewhere that has nothing to do with orbit.
S('and the money spacex makes', (add) => {
  add(stars());
  add(P('planet', { kind: 'earth', color: '#5b9bd5' }, 960, 1080, 3.2));
  add(P('satellite', {}, 600, 220, .7)); add(P('satellite', {}, 1350, 180, .55));
  add(P('server', {}, 960, 560, .7, T('somewhere')));
  for (let i = 0; i < 4; i++) add(mover('bill', {}, [[960, 520, .4], [960 + (i - 1.5) * 200, 300, .4]], T('more and more') + i * .25, 1));
  add(big('nothing to do with orbit', 960, 140, T('nothing to do'), { size: 70, color: '#c98a00' }));
});
// L56 Remember Colossus... the giant data center in Memphis that was built to train Grok?
S('remember colossus', (add) => {
  const e = elon({ x: 1680, expr: 'neutral', s: .76 });
  add(P('datacenter', { label: 'COLOSSUS' }, 700, 520, 1.5));
  add(note('Memphis', 700, 180, T('memphis'), { size: 70, font: 'marker' }));
  add(P('phone', { screen: 'chat', title: 'Grok' }, 1250, 350, .6, T('train grok')));
  e.pose(T('colossus'), 'pointer', { at: [700, 520] });
  add(e);
});
// Ex-A-I moved its training elsewhere. So SpaceX started renting it out.
S('ex-a-i moved', (add) => {
  const e = elon({ x: 1680, expr: 'smug', s: .76 });
  add(P('datacenter', { label: 'COLOSSUS' }, 620, 520, 1.3));
  add(E({ t0: SHOT_T0, x: 0, y: 0, enter: 'none', z: 5, render: (c, t, el) => { const p = ease.inOut(clamp((t - el.t0 - .3) / 1.5)); drawSprite(c, 'robot', { label: 'xAI' }, lerp(1000, 1400, p), 720, .5); } }));
  add(P('sign', { text: 'FOR RENT', w: 360, h: 260, color: COL.yellow }, 620, 260, 1, T('renting')));
  add(e);
});
// And the tenant was Anthropic... a rival AI company that Musk had publicly called "evil."
S('and the tenant was', (add) => {
  const tn = stick({ x: 1200, s: 1.1, seed: 301, hair: 'side', hairColor: '#7a5a3a', outfit: { type: 'shirt', color: '#d9a066' }, expr: 'happy', pose: 'waveR', t0: T('anthropic') });
  add(tn);
  add(P('datacenter', { label: 'COLOSSUS' }, 520, 560, 1.0));
  add(P('label', { text: 'Anthropic', w: 300, font: 'marker' }, 1200, 460, 1, T('anthropic')));
  add(note('(a rival AI company)', 1200, 360, T('rival'), { size: 48 }));
  const e = elon({ x: 1700, expr: 'neutral', s: .7 });
  add(P('bubble', { text: '"evil"', w: 260, h: 190, tail: 'right', size: 64, font: 'marker', color: COL.red }, 1600, 250, 1, T('evil')));
  e.face(T('evil'), 'skeptical');
  add(e);
  tn.face(T('evil'), 'confused');
});
// Anthropic agreed to pay SpaceX $1.25 billion. Per MONTH.
S('anthropic agreed to pay', (add) => {
  const e = elon({ x: 1650, expr: 'neutral' });
  add(P('label', { text: 'Anthropic  →  SpaceX', w: 560, font: 'marker' }, 700, 140, 1));
  add(counter(700, 330, 0, 1.25, v => '$' + v.toFixed(2) + ' BILLION', T('one point two'), 1.2, { size: 110, color: COL.dgreen }));
  add(P('calendar', { month: 'EVERY', day: 'MONTH', dsize: 60 }, 700, 640, 1.1, T('per month')));
  add(big('PER MONTH!', 1080, 640, T('month'), { size: 80, color: COL.red, rot: -8 }));
  add(moneyRain(T('per month'), 2, { x0: 200, x1: 1300, n: 12, z: 3 }));
  e.face(T('month'), 'shocked');
  add(e);
});
// Then in June, Google signed on for about $920 million a month.
S('then in june google', (add) => {
  const g = stick({ x: 1200, s: 1.1, seed: 311, hair: 'curly', hairColor: '#333', skin: SKINS[3], outfit: { type: 'shirt', color: '#7fb3e8' }, expr: 'happy', pose: 'give' });
  add(g);
  add(P('label', { text: 'Google', w: 260, font: 'marker' }, 1200, 460, 1, T('google')));
  add(P('calendar', { month: 'JUNE', day: '2026', dsize: 64 }, 260, 220, .75));
  add(P('datacenter', { label: 'COLOSSUS' }, 540, 600, .9));
  add(big('$920M / month', 700, 250, T('nine hundred'), { size: 90, color: COL.dgreen }));
  const e = elon({ x: 1700, expr: 'happy', s: .7 });
  add(e);
});
// L57 And look at the timing. The Anthropic deal was disclosed 22 days before the IPO was priced. The Google deal... just six days before.
S('and look at the timing', (add) => {
  const e = elon({ x: 1700, expr: 'skeptical', s: .7 });
  add(E({ t0: SHOT_T0, x: 0, y: 0, enter: 'fade', z: 2, render: c => { SEED = 82; line(c, [[160, 560], [1400, 560]], { lw: 7 }); arrowHead(c, 1410, 560, 0, 30, { lw: 7 }); } }));
  add(P('tag', { text: 'IPO PRICE', size: 34 }, 1320, 420, .9, T('priced')));
  add(E({ t0: T('priced'), x: 1300, y: 560, enter: 'pop', z: 5, render: c => { c.beginPath(); c.arc(0, 0, 18, 0, 7); c.fillStyle = COL.red; c.fill(); } }));
  add(E({ t0: T('anthropic deal'), x: 420, y: 560, enter: 'pop', z: 5, render: c => { c.beginPath(); c.arc(0, 0, 16, 0, 7); c.fillStyle = '#d9a066'; c.fill(); c.lineWidth = 4; c.strokeStyle = INK; c.stroke(); } }));
  add(note('Anthropic deal', 420, 660, T('anthropic deal'), { size: 50 }));
  add(big('-22 days', 420, 440, T('twenty-two'), { size: 70, color: COL.red }));
  add(E({ t0: T('google deal'), x: 1060, y: 560, enter: 'pop', z: 5, render: c => { c.beginPath(); c.arc(0, 0, 16, 0, 7); c.fillStyle = '#7fb3e8'; c.fill(); c.lineWidth = 4; c.strokeStyle = INK; c.stroke(); } }));
  add(note('Google deal', 1060, 660, T('google deal'), { size: 50 }));
  add(big('-6 days', 1060, 440, T('six days'), { size: 70, color: COL.red }));
  e.face(T('six days'), 'skeptical');
  add(e);
});
// So two of the biggest revenue streams in the whole story showed up only weeks before the price tag was set.
S('so two of the biggest', (add) => {
  const e = elon({ x: 1650, expr: 'smug' });
  add(P('moneybag', {}, 420, 520, .9, T('revenue streams'))); add(P('moneybag', {}, 680, 560, .9, T('revenue streams') + .15));
  add(P('tag', { text: 'PRICE', size: 54 }, 1100, 420, 1.2, T('price tag')));
  add(note('weeks before', 900, 760, T('only weeks'), { size: 64, color: COL.red, font: 'marker' }));
  add(arrowTo(780, 520, 960, 450, T('showed up'), { color: COL.dgreen, bend: .2 }));
  add(e);
});
// L58 But here's the catch. Both deals can be cancelled with ninety days' notice.
S("but here's the catch both", (add) => {
  const e = elon({ x: 1650, expr: 'confused' });
  add(big('THE CATCH', 640, 150, T('catch'), { size: 90, color: COL.red }));
  add(P('doc', { title: 'Anthropic\nlease', lines: ['-', '-'], w: 320, h: 380, tsize: 40 }, 420, 520, .9, T('both deals')));
  add(P('doc', { title: 'Google\nlease', lines: ['-', '-'], w: 320, h: 380, tsize: 40 }, 860, 520, .9, T('both deals') + .15));
  add(stamp('CANCEL: 90 DAYS NOTICE', 640, 600, T('ninety'), { size: 54 }));
  add(e);
});
// And after the filing came out, Musk himself said on X that the Anthropic deal was really a 180-day lease... not a commitment for years.
S('and after the filing came out', (add) => {
  const e = elon({ x: 1450, expr: 'neutral', s: .86 });
  add(P('phone', { screen: 'text', text: 'X post:\n"180-day\nlease"', size: 34 }, 960, 520, 1.1, T('said on x')));
  add(P('xlogo', {}, 960, 250, .5, T('on x')));
  add(P('calendar', { month: 'LEASE', day: '180 d', dsize: 70 }, 420, 380, 1.0, T('one-hundred-and-eighty-day')));
  add(P('card', { text: 'YEARS', size: 64 }, 420, 720, .9, T('commitment')));
  add(...crossOut(420, 720, 280, 180, T('for years')));
  e.pose(T('musk himself'), 'point', { at: [960, 520] }).face(T('not a commitment'), 'smug');
  add(e);
});
// L59 And on the same day SpaceX filed an updated prospectus... Anthropic filed its own confidential IPO paperwork.
S('and on the same day', (add) => {
  const e = elon({ x: 1700, expr: 'neutral', s: .72 });
  add(P('calendar', { month: 'SAME', day: 'DAY', dsize: 80 }, 760, 200, .8));
  add(P('doc', { title: 'SpaceX\nupdated\nprospectus', lines: ['-', '-'], w: 340, h: 420, tsize: 40 }, 480, 600, .95, T('updated prospectus')));
  add(P('doc', { title: 'Anthropic\nIPO filing', lines: ['-', '-'], w: 340, h: 420, tsize: 40, stamp: 'CONFIDENTIAL', stampColor: '#7a3db8' }, 1050, 600, .95, T('confidential')));
  e.face(T('confidential'), 'surprised');
  add(e);
});
// So SpaceX's biggest new customer... is also lining up to compete for the very same investors.
S("so spacex's biggest new", (add) => {
  add(P('sign', { text: 'SpaceX IPO', w: 360, h: 300, color: '#e8ecf0' }, 340, 560, 1));
  add(P('sign', { text: 'Anthropic IPO', w: 400, h: 300, color: '#f6e3c9' }, 1560, 560, 1, T('lining up')));
  for (let i = 0; i < 5; i++) add(stick({ x: 700 + i * 130, s: .7, seed: 320 + i, hair: ['messy', 'bun', 'side', 'curly', 'bald'][i], hairColor: '#333', skin: SKINS[i], outfit: { type: 'shirt', color: ['#f5a3a3', '#9fd0f5', '#b5e39a', '#f5d76e', '#d7b5f5'][i] }, expr: 'confused', t0: T('same investors') + i * .08, pose: 'shrug' }));
  add(note('the very same investors', 960, 520, T('same investors'), { size: 56 }));
  add(big('COMPETITION', 960, 180, T('compete'), { size: 90, color: COL.red }));
});
// L60 Then came October. SpaceX reported its third-quarter results... and on the surface, they looked GREAT.
S('then came october', (add) => {
  const e = elon({ x: 1650, expr: 'happy' });
  add(P('calendar', { month: 'OCTOBER', day: 'Q3', dsize: 90 }, 360, 360, 1.0));
  add(P('doc', { title: 'Q3 RESULTS', lines: ['-', '-', '-'], w: 420, h: 480 }, 860, 470, .95, T('third-quarter')));
  add(big('GREAT!', 860, 180, T('great'), { size: 110, color: COL.dgreen }));
  add(P('sparkle', {}, 1120, 300, 1, T('great'))); add(P('sparkle', {}, 600, 260, .8, T('great') + .2));
  e.pose(T('great'), 'thumbsUp').face(T('great'), 'grin');
  add(e);
});
// Revenue hit $14.6 billion, up 161% from a year earlier. The company made $4.4 billion in profit. The stock jumped after hours.
S('revenue hit fourteen', (add) => {
  const e = elon({ x: 1700, expr: 'happy', s: .74 });
  add(counter(520, 260, 0, 14.6, v => '$' + v.toFixed(1) + 'B', T('fourteen point'), 1.2, { size: 110, color: COL.dgreen }));
  add(note('Q3 revenue', 520, 380, T('fourteen point'), { size: 52 }));
  add(big('+161%', 520, 520, T('a hundred and sixty-one'), { size: 96, color: COL.dgreen }));
  add(counter(1150, 260, 0, 4.4, v => '$' + v.toFixed(1) + 'B', T('four point four'), 1.0, { size: 110, color: COL.dblue }));
  add(note('profit', 1150, 380, T('four point four'), { size: 52 }));
  add(P('arrowUp', {}, 1100, 650, .6, T('after hours')));
  add(note('stock jumped after hours', 900, 860, T('after hours'), { size: 54 }));
  e.pose(T('stock jumped'), 'cheer');
  add(e);
});
// L61 But look at where that money came from. The AI business... which SpaceX now calls "Super Intelligence"... brought in $7.56 billion.
S('but look at where that money', (add) => {
  const e = elon({ x: 1680, expr: 'skeptical', s: .76 });
  add(P('magnifier', {}, 300, 300, .9));
  add(P('robot', { label: 'AI' }, 560, 520, .9, T('the a i business')));
  add(P('label', { text: '"Super Intelligence"', w: 520, font: 'marker', size: 44 }, 560, 230, 1, T('super intelligence')));
  add(counter(1100, 460, 0, 7.56, v => '$' + v.toFixed(2) + 'B', T('seven point five'), 1.2, { size: 120, color: COL.dgreen }));
  add(note('(Q3 revenue)', 1100, 580, T('seven point five'), { size: 50 }));
  add(e);
});
// That's more than HALF of the entire company's revenue... up about ninefold in a year... mostly from those cloud deals.
S("that's more than half", (add) => {
  const e = elon({ x: 1700, expr: 'surprised', s: .72 });
  add(pie({ x: 500, y: 480, r: 290, slices: [{ v: 7.56, color: COL.blue, pop: true, popT: T('half') }, { v: 14.6 - 7.56, color: COL.lgray }] }));
  add(big('> HALF', 470, 380, T('half'), { size: 90, color: '#fff', outline: COL.dblue }));
  add(...bars({ x: 900, y: 300, w: 560, h: 420, vals: [1, 9], max: 9, colors: ['#c7ccd1', COL.blue], labels: ['a year ago', 'now'], vlabels: ['', '~9x'], vcolors: [INK, COL.dblue], times: [T('ninefold') - .2, T('ninefold')], lsize: 40, vsize: 70 }));
  add(E({ t0: T('ninefold') - .2, x: 0, y: 0, enter: 'fade', z: 3, render: c => { SEED = 83; line(c, [[880, 720], [1480, 720]], { lw: 6 }); } }));
  add(P('cloud', { text: 'cloud deals', size: 40 }, 1180, 200, .8, T('cloud deals')));
  add(e);
});
// The rocket launch business? $1.77 billion.
S('the rocket launch business', (add) => {
  const e = elon({ x: 1680, expr: 'unimpressed', s: .76 });
  add(...bars({ x: 200, y: 230, w: 1000, h: 560, vals: [7.56, 1.77], max: 7.56, colors: [COL.blue, '#c7ccd1'], labels: ['AI ("Super Intelligence")', 'Rocket launches'], vlabels: ['$7.56B', '$1.77B'], vcolors: [COL.dblue, INK], times: [SHOT_T0 + .1, T('one point seven')], lsize: 40, vsize: 70 }));
  add(E({ t0: SHOT_T0, x: 0, y: 0, enter: 'fade', z: 3, render: c => { SEED = 84; line(c, [[180, 790], [1220, 790]], { lw: 6 }); } }));
  add(P('rocket', {}, 950, 470, .5, T('rocket launch')));
  e.face(T('one point seven'), 'unimpressed');
  add(e);
});
// L62 So the biggest business inside SpaceX right now... is renting out computers. On EARTH. To other AI companies.
S('so the biggest business inside', (add) => {
  const e = elon({ x: 1680, expr: 'surprised', s: .76 });
  add(P('server', {}, 420, 560, .9)); add(P('server', {}, 620, 560, .9)); add(P('server', {}, 820, 560, .9));
  add(P('sign', { text: 'FOR RENT', w: 340, h: 250, color: COL.yellow }, 620, 220, 1, T('renting out')));
  add(P('planet', { kind: 'earth', color: '#5b9bd5' }, 1180, 330, .6, T('earth')));
  add(big('ON EARTH', 1180, 560, T('earth'), { size: 80, color: COL.dblue }));
  [0, 1].forEach(i => add(P('robot', {}, 1080 + i * 180, 800, .4, T('other a i') + i * .15)));
  e.face(T('earth'), 'shocked');
  add(e);
});
// It's like finding out your favorite restaurant now makes most of its money... renting its kitchen to the restaurant across the street.
S("it's like finding out your favorite", (add) => {
  add(P('restaurant', { text: "FAV'S DINER" }, 420, 560, 1.1));
  add(P('restaurant', { text: 'RIVAL GRILL', awning: COL.blue, color: '#dfeaf6' }, 1500, 560, 1.1, T('across the street')));
  add(E({ t0: SHOT_T0, x: 0, y: 0, enter: 'none', z: 0, render: c => { c.fillStyle = '#9aa1a8'; c.fillRect(780, 760, 360, 200); c.fillStyle = '#fff'; for (let i = 0; i < 4; i++) c.fillRect(800 + i * 90, 850, 50, 12); } }));
  add(P('kitchen', {}, 960, 330, .8, T('renting its kitchen')));
  add(P('sign', { text: 'KITCHEN\nFOR RENT', w: 320, h: 260, size: 46, color: COL.yellow }, 700, 260, .8, T('kitchen')));
  const chef = stick({ x: 1300, s: .8, seed: 331, hat: 'chef', hair: 'bald', hairColor: '#333', outfit: { type: 'shirt', color: '#fff' }, expr: 'happy', t0: T('across the street') + .2, pose: 'give' });
  add(chef);
  for (let i = 0; i < 3; i++) add(mover('bill', {}, [[1250, 560, .4], [960, 440, .4], [500, 520, .4]], T('most of its money') + i * .3, 1));
});

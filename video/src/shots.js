/* The shot list. Each shot starts on a cue phrase from the voiceover and
 * schedules its pop-ins on later words with S.w('phrase'). */
(function (root) {
  const isNode = typeof module !== 'undefined' && module.exports;
  const E = isNode ? require('./engine.js') : root.Engine;
  const C = isNode ? require('./characters.js') : root.Characters;
  const P = isNode ? require('./props.js') : root.Props;
  const { clamp, lerp, ease } = E;

  // ---- cast: every extra character has its own look ----
  const L = {
    dater1: { hair: { style: 'bob', color: '#f2c14e' }, dress: '#ec6f8e', acc: ['earrings'] },
    dater2: { hair: { style: 'curly', color: '#3b2716' }, skin: '#b5835a', acc: ['glasses', 'tie:#2e7d32'] },
    dater3: { hair: { style: 'spiky', color: '#c0392b' }, acc: ['bowtie:#1565c0'] },
    buyer: { hair: { style: 'side', color: '#5d4037' }, acc: ['cap:#43a047'] },
    retM: { hair: { style: 'gray' }, acc: ['wrinkles', 'cane', 'mustache'], beardColor: '#bdbdbd' },
    retF: { hair: { style: 'bun', color: '#cfcfcf' }, dress: '#9575cd', acc: ['glasses', 'wrinkles'] },
    remote: { hair: { style: 'messy', color: '#151515' }, acc: ['headband:#e53935'], skin: '#e8b48a' },
    winter: { hair: { style: 'flat', color: '#6b4226' }, acc: ['hat:#455a64'], shirt: '#90caf9' },
    roommate: { hair: { style: 'messy', color: '#7b5e3b' }, acc: ['beard'], beardColor: '#7b5e3b' },
    landlord: { hair: { style: 'bald' }, skin: '#e0ac69', acc: ['mustache', 'tie:#6a1b9a'] },
    you: { hair: { style: 'spiky', color: '#151515' } },
    reseller: { hair: { style: 'flat', color: '#212121' }, acc: ['sunglasses', 'cap:#212121'] },
    fan: { hair: { style: 'ponytail', color: '#a0522d' }, skin: '#c68642' },
    builder: { hair: { style: 'flat', color: '#3e2723' }, acc: ['hardhat', 'vest:#ff8f00'] },
    builder2: { hair: { style: 'curly', color: '#151515' }, skin: '#8d5524', acc: ['hardhat', 'vest:#7cb342'] },
    realtor: { hair: { style: 'bob', color: '#3e2723' }, acc: ['vest:#1565c0', 'necklace:#f5b400'] },
    official: { hair: { style: 'side', color: '#9e9e9e' }, acc: ['glasses', 'tie:#c62828'], skin: '#d7a07a' },
    demog: { hair: { style: 'curly', color: '#151515' }, skin: '#8d5524', acc: ['glasses', 'bowtie:#2e7d32'] },
    ranch: { hair: { style: 'side', color: '#c99a5b' }, acc: ['cap:#fb8c00'] },
    condoF: { hair: { style: 'long', color: '#4e342e' }, acc: ['earrings'], dress: '#26a69a' },
    condoM: { hair: { style: 'gray' }, acc: ['glasses', 'wrinkles'], shirt: '#ffcc80' },
    insurer: { hair: { style: 'side', color: '#212121' }, acc: ['tie:#1565c0', 'vest:#37474f'] },
    owner: { hair: { style: 'flat', color: '#795548' }, acc: ['tie:#00897b'] },
    owner2: { hair: { style: 'mohawk', color: '#8e24aa' }, skin: '#f1c27d' },
    inspector: { hair: { style: 'side', color: '#6d4c41' }, acc: ['hardhat', 'glasses'] },
    rich: { hair: { style: 'side', color: '#e0e0e0' }, acc: ['hat:#212121', 'sunglasses', 'bowtie:#f5b400'] },
    regular: { hair: { style: 'messy', color: '#5d4037' }, skin: '#e0ac69', acc: ['cap:#e53935'] },
    young1: { hair: { style: 'ponytail', color: '#212121' }, skin: '#c68642', dress: '#ffb74d' },
    young2: { hair: { style: 'spiky', color: '#4e342e' }, skin: '#c68642', shirt: '#4db6ac' },
    kid: { hair: { style: 'curly', color: '#212121' }, skin: '#c68642', headR: 54 },
    exec: { hair: { style: 'gray' }, acc: ['glasses', 'bowtie:#1565c0', 'vest:#263238'] },
    driver: { hair: { style: 'bob', color: '#6d4c41' }, skin: '#f1c27d', acc: ['glasses'] },
    board1: { hair: { style: 'bun', color: '#3e2723' }, acc: ['glasses'], dress: '#5c6bc0' },
    board2: { hair: { style: 'bald' }, acc: ['beard'], beardColor: '#9e9e9e' },
    board3: { hair: { style: 'flat', color: '#fbc02d' }, acc: ['tie:#d84315'] },
    prev1: { hair: { style: 'gray' }, acc: ['hat:#8d6e63'] },
    prev2: { hair: { style: 'bob', color: '#bdbdbd' }, dress: '#a1887f', acc: ['glasses'] },
  };

  const SH = [];
  const shot = (cue, fn, cam) => SH.push({ cue, fn, cam });

  // ===================== P0 ===================================================
  shot(0, (D, S, H) => {
    H.M(D, S, { x: 420, pose: [[0, 'wave'], [S.w('Florida') - 0.1, 'pointR'], [S.w('of any state') , 'rest']], expr: 'happy', wave: D.t < S.w('Florida') - 0.2 });
    H.fl(D, S.w('Florida') - 0.1, { x: 1200, y: 420, s: 0.95 });
    if (D.t > S.w('HIGHEST')) { H.prop(D, S.w('HIGHEST'), 'trophy', 1500, 330, 0.9, { text: '#1' }); H.big(D, S.w('foreclosure'), 'FORECLOSURES', 1260, 800, { size: 76, color: '#d32f2f', underline: true }); }
  }, { z1: 1.05 });

  shot('One in every 373', (D, S, H) => {
    const t0 = S.w('One');
    for (let r = 0; r < 3; r++) for (let c = 0; c < 9; c++) {
      const i = r * 9 + c; const red = i === 13 && D.t > S.w('got a foreclosure');
      H.prop(D, t0 + i * 0.03, 'house', 260 + c * 175, 250 + r * 200, 0.62, { roof: red ? '#d32f2f' : '#90a4ae', wall: red ? '#ffcdd2' : '#eceff1', chimney: false, id: 300 + i, sign: red ? 'FORECLOSURE' : null, signOpts: { x: 60 } });
    }
    H.big(D, S.w('373'), '1 in 373 homes', 960, 860, { size: 92, color: '#d32f2f', box: '#ffffff' });
  });

  // ===================== P1 ===================================================
  shot("And it's not just foreclosures", (D, S, H) => {
    H.M(D, S, { x: 360, pose: [[0, 'shrug'], [S.w('Between'), 'presentR']], expr: 'happy' });
    H.prop(D, S.w('January of last'), 'calendar', 850, 420, 1.3, { month: 'JAN', day: '2025', daySize: 60 });
    H.arrow(D, S.w('and January') , 1010, 420, 1290, 420, { w: 10, color: '#151515' });
    H.prop(D, S.w('January of this'), 'calendar', 1450, 420, 1.3, { month: 'JAN', day: '2026', daySize: 60 });
  });

  shot('fifteen of the twenty metro', (D, S, H) => {
    const t0 = S.w('fifteen');
    const fl = S.w('were in Florida');
    for (let i = 0; i < 20; i++) {
      const r = Math.floor(i / 5), c = i % 5; const isFL = i % 4 !== 3; // 15 of 20
      const on = isFL && D.t > fl + (i % 5) * 0.05;
      H.prop(D, t0 + i * 0.04, 'house', 860 + c * 210, 190 + r * 185, 0.55, { roof: on ? '#ef6c00' : '#90a4ae', wall: on ? '#ffe0b2' : '#eceff1', chimney: false, id: 400 + i });
      if (on) H.prop(D, fl + (i % 5) * 0.05, 'arrowBig', 860 + c * 210 + 70, 190 + r * 185 - 70, 0.28, { dir: 'down' });
    }
    H.M(D, S, { x: 380, pose: [[0, 'rest'], [S.w('fell the MOST'), 'pointRlow'], [fl, 'pointR']], expr: [[0, 'neutral'], [S.w('MOST'), 'surprise'], [fl + 1, 'happy']] });
    if (D.t > fl) H.big(D, fl + 0.3, 'IN FLORIDA', 380, 220, { size: 70, color: '#ef6c00', rot: -0.08 });
  });

  shot('Fifteen... out of twenty', (D, S, H) => {
    const wh = S.w("That's not a bad year");
    H.big(D, S.t0, '15 / 20', 1250, 330, { size: 200, color: '#ef6c00' });
    H.M(D, S, { x: D.t > wh ? lerp(400, 760, D.inK(wh, 0.6)) : 400, s: D.t > wh ? lerp(0.95, 1.35, D.inK(wh, 0.6)) : 0.95, y: D.t > wh ? lerp(935, 1250, D.inK(wh, 0.6)) : 935, pose: [[0, 'count'], [wh, 'whisper']], expr: [[0, 'surprise'], [wh, 'whisper']] });
    if (D.t > S.w('pattern')) {
      H.big(D, S.w('pattern'), 'A PATTERN', 1350, 620, { size: 96, color: '#151515', underline: true, ulColor: '#d32f2f' });
    }
  }, { z1: 1.08 });

  // ===================== P2 ===================================================
  shot('Punta Gorda, a quiet', (D, S, H) => {
    H.fl(D, S.t0, { x: 640, y: 330, s: 1.25, pins: [{ city: 'Punta Gorda', at: S.t0 + 0.2, label: 'Punta Gorda', side: -1, size: 50 }] });
    H.guy(D, S, S.w("couldn't find"), { x: 1450, y: 900, s: 1.05, look: L.buyer, pose: 'think', expr: 'confused', fx: 'question', id: 520 });
    H.prop(D, S.w("couldn't find"), 'magnifier', 1640, 480, 0.8, { rot: 0.4 });
    H.label(D, S.w('Gulf Coast'), 'Gulf Coast', 330, 640, { size: 46, color: '#1565c0', rot: -0.3 });
  });

  shot('was sitting almost 24%', (D, S, H) => {
    H.M(D, S, { x: 330, pose: [[0, 'pointR']], expr: 'surprise' });
    H.lineChart(D, S.t0, { x: 1150, y: 470, w: 900, h: 420, title: 'Punta Gorda home values', data: [40, 44, 52, 70, 92, 100, 90, 84, 79, 76], min: 30, max: 105, color: '#ef6c00', xl: ['2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'], dur: 1.6,
      after: (D2, pts) => { H.ring(D2, S.w('2022 peak'), pts[5][0], pts[5][1], 50, 40); if (D2.t > S.w('2022 peak')) D2.text('2022 PEAK', pts[5][0], pts[5][1] - 70, { size: 38, font: 'Permanent Marker', color: '#d32f2f' }); } });
    H.big(D, S.w('24%'), '-24%', 1500, 560, { size: 150, color: '#d32f2f' });
  });

  // ===================== P3 ===================================================
  shot('And this is the same state', (D, S, H) => {
    H.M(D, S, { x: 420, pose: [[0, 'rest'], [S.w('WON'), 'bothUp']], expr: [[0, 'neutral'], [S.w('WON'), 'grin']], fx: [[S.w('WON'), 'sparkle']] });
    H.fl(D, S.t0 + 0.1, { x: 1250, y: 430, s: 0.85, label: false });
    H.prop(D, S.w('WON'), 'trophy', 1350, 360, 1.1, { text: 'WIN' });
    H.big(D, S.w('pandemic'), 'PANDEMIC WINNER', 1250, 820, { size: 72, color: '#f9a825', outline: 10, outlineColor: '#151515' });
  });

  shot('In 2022, Florida gained', (D, S, H) => {
    H.fl(D, S.t0, { x: 1300, y: 420, s: 0.9 });
    if (D.t > S.w('migration')) { const k = D.inK(S.w('migration'), 2.2, ease.inOut); P.draw(D, 'truck', lerp(300, 1050, k), 760, 0.8, { text: 'MOVING' }); }
    H.count(D, S.w('600,000'), 1.0, 0, 600000, H.fmt.int, 560, 260, { size: 120, color: '#2e7d32' });
    H.label(D, S.w('new residents'), 'new residents', 560, 360, { size: 54 });
  });

  shot("That's about 1,640 people", (D, S, H) => {
    H.crowd(D, S.w('1,640'), 48, 760, 340, { cols: 16, dx: 66, dy: 120, stagger: 0.025, s: 1.2, fill: '#c8e6c9' });
    H.big(D, S.w('1,640'), '1,640', 1270, 160, { size: 120, color: '#2e7d32' });
    H.big(D, S.w('EVERY'), 'EVERY. SINGLE. DAY.', 1270, 760, { size: 86, color: '#151515', underline: true, ulColor: '#2e7d32' });
    H.M(D, S, { x: 330, pose: [[0, 'presentR'], [S.w('EVERY'), 'fist']], expr: 'grin' });
  });

  shot('Remote workers', (D, S, H) => {
    H.guy(D, S, S.w('Remote'), { x: 330, y: 820, s: 0.95, look: L.remote, pose: 'hold', expr: 'happy', id: 600 });
    H.prop(D, S.w('Remote'), 'laptop', 345, 640, 0.8);
    H.label(D, S.w('Remote'), 'Remote workers', 330, 880, { size: 44 });
    H.guy(D, S, S.w('Retirees'), { x: 760, y: 820, s: 0.95, look: L.retM, pose: 'wave', expr: 'happy', id: 640 });
    H.guy(D, S, S.w('Retirees') + 0.15, { x: 940, y: 820, s: 0.9, look: L.retF, expr: 'happy', id: 680 });
    H.label(D, S.w('Retirees'), 'Retirees', 850, 880, { size: 44 });
    H.guy(D, S, S.w('People who were just'), { x: 1400, y: 820, s: 0.95, look: L.winter, pose: [[0, 'cheeks'], [S.w('winter'), 'up']], expr: [[0, 'sad'], [S.w('winter'), 'grin']], id: 720 });
    if (D.t > S.w('winter')) { H.cross(D, S.w('winter'), 1250, 260, 60); H.prop(D, S.w('winter') + 0.3, 'sun', 1600, 280, 0.9); H.prop(D, S.w('winter') + 0.3, 'palm', 1760, 760, 0.8); }
    H.prop(D, S.w('People who were just'), 'snow', 1250, 260, 1);
    H.big(D, S.w('Everybody'), 'EVERYBODY WANTED IN!', 960, 140, { size: 80, color: '#2e7d32' });
  });

  // ===================== P4 ===================================================
  shot('So... what happened', (D, S, H) => {
    H.M(D, S, { x: 960, y: 1230, s: 1.45, pose: 'shrug', expr: 'confused', fx: 'question' });
    H.prop(D, S.t0 + 0.4, 'question', 520, 330, 1.4, { float: true }); H.prop(D, S.t0 + 0.6, 'question', 1420, 300, 1.7, { float: true, rot: 0.2 });
  });

  // ===================== P5 ===================================================
  shot('The easy answer is mortgage', (D, S, H) => {
    H.prop(D, S.t0, 'chalkboard', 1200, 380, 1.15, { text: ['The easy answer:', 'MORTGAGE RATES'], size: 64 });
    H.M(D, S, { x: 420, pose: [[0, 'pointR']], expr: 'happy' });
    H.big(D, S.w('rates are high'), 'HIGH!', 1550, 760, { size: 100, color: '#d32f2f' });
  });

  shot('As of November 19th', (D, S, H) => {
    H.prop(D, S.t0, 'calendar', 330, 330, 1.2, { month: 'NOV', day: '19' });
    H.card(D, S.w('average 30-year'), { x: 1080, y: 330, w: 820, title: 'Average 30-year mortgage rate', body: ['As of November 19th: 7.28%', 'About a full point higher than a year ago'], hl: [[0, S.w('7.28%')], [1, S.w('a full point')]], src: 'Weekly national average' });
    H.bars(D, { x: 1050, y: 900, w: 560, h: 250, max: 8, items: [{ label: 'A year ago', v: 6.28, txt: '~6.3%', color: '#90caf9', at: S.w('a full point') }, { label: 'Now', v: 7.28, txt: '7.28%', color: '#e53935', at: S.w('7.28%') }] });
    H.M(D, S, { x: 1660, s: 0.8, y: 935, pose: [[0, 'pointL']], expr: 'serious' });
  });

  shot("But here's the problem", (D, S, H) => {
    H.M(D, S, { x: 960, y: 1200, s: 1.4, pose: [[0, 'stop'], [S.w('answer'), 'count']], expr: 'serious' });
    H.big(D, S.w('problem'), 'PROBLEM:', 960, 170, { size: 100, color: '#d32f2f', rot: 0 });
  });

  shot('Rates are the SAME in Ohio', (D, S, H) => {
    const fc = S.w('leading the country');
    H.prop(D, S.w('Ohio'), 'house', 560, 520, 1.3, { roof: '#5c6bc0', id: 800 });
    H.label(D, S.w('Ohio'), 'OHIO', 560, 690, { size: 64, font: 'Permanent Marker' });
    H.prop(D, S.w('Ohio') + 0.15, 'priceTag', 560, 230, 1, { text: '7.28%' });
    H.prop(D, S.w('Florida'), 'house', 1360, 520, 1.3, { roof: '#ef6c00', id: 830, crack: D.t > fc, sign: D.t > fc ? 'FORECLOSURE' : null });
    H.label(D, S.w('Florida'), 'FLORIDA', 1360, 690, { size: 64, font: 'Permanent Marker', color: '#ef6c00' });
    H.prop(D, S.w('Florida') + 0.15, 'priceTag', 1360, 230, 1, { text: '7.28%' });
    H.big(D, S.w('Same rates'), '=', 960, 450, { size: 200, color: '#151515', rot: 0 });
    if (D.t > fc) H.big(D, fc, '#1 IN FORECLOSURES', 1360, 820, { size: 60, color: '#d32f2f' });
  });

  // ===================== P6 ===================================================
  shot('The other easy answer', (D, S, H) => {
    H.M(D, S, { x: 420, pose: [[0, 'presentR'], [S.w('partly true'), 'shrug']], expr: 'neutral' });
    H.prop(D, S.t0 + 0.2, 'truck', 1250, 620, 1.1, { text: 'MOVING' });
    H.cross(D, S.w('stopped'), 1250, 560, 150);
    H.prop(D, S.w("we'll get to it"), 'doc', 1600, 260, 0.9, { title: 'LATER', lines: 2, rot: 0.1, fill: '#fff59d' });
  });

  shot("But it doesn't explain", (D, S, H) => {
    const out = S.w('are trying to get out');
    H.fl(D, S.t0, { x: 700, y: 420, s: 0.85, label: false });
    [L.owner, L.condoF, L.owner2].forEach((lk, i) => {
      H.guy(D, S, S.w('ALREADY') + i * 0.15, { x: 600 + i * 170, y: 840, s: 0.75, look: lk, expr: D.t > out ? 'determined' : 'neutral', id: 900 + i * 40, walkTo: 2300, walkAt: out + i * 0.2, walkDur: 2.4 });
      if (D.t < out + i * 0.2 + 0.1) H.prop(D, S.w('ALREADY') + i * 0.15, 'suitcase', 660 + i * 170, 800, 0.45);
    });
    H.big(D, out, 'EXIT', 1500, 300, { size: 110, color: '#2e7d32', box: '#e8f5e9' }); H.arrow(D, out + 0.3, 1660, 300, 1840, 300, { w: 14, color: '#2e7d32' });
  });

  shot('Nationally, Redfin says', (D, S, H) => {
    H.card(D, S.t0, { x: 640, y: 330, w: 980, title: 'More sellers than buyers', body: ['~70% more people trying to sell than buy in October', "The biggest gap in Redfin's records"], hl: [[0, S.w('70%')], [1, S.w('biggest gap')]], src: 'Source: Redfin, October (national)' });
    H.bars(D, { x: 640, y: 920, w: 600, h: 300, max: 180, items: [{ label: 'Sellers', v: 170, txt: '170', color: '#ef6c00', at: S.w('sell a home') }, { label: 'Buyers', v: 100, txt: '100', color: '#42a5f5', at: S.w('buy one') }] });
    H.M(D, S, { x: 1540, pose: [[0, 'pointL']], expr: 'surprise' });
  });

  shot('In Miami... it was almost', (D, S, H) => {
    H.big(D, S.w('196%'), '196%', 560, 240, { size: 170, color: '#d32f2f' });
    H.label(D, S.w('196%'), 'more sellers than buyers in Miami', 560, 360, { size: 46 });
    const t3 = S.w('THREE');
    [L.dater1, L.dater2, L.dater3].forEach((lk, i) => {
      H.guy(D, S, t3 + i * 0.15, { x: 330 + i * 220, y: 920, s: 0.85, look: lk, pose: 'holdUp', expr: 'worried', id: 1000 + i * 40 });
      if (D.t > t3 + i * 0.15) H.prop(D, t3 + i * 0.15, 'signPost', 420 + i * 220, 520, 0.85, { text: 'SALE' });
    });
    H.guy(D, S, S.w('single buyer'), { x: 1100, y: 920, s: 0.85, look: L.buyer, pose: 'hips', expr: 'smirk', id: 1120 });
    H.big(D, S.w('THREE'), '3 : 1', 1250, 260, { size: 170, color: '#151515' });
    H.M(D, S, { x: 1620, pose: [[0, 'pointL'], [S.w('THREE'), 'count']], expr: [[0, 'surprise'], [S.w('THREE'), 'happy']] });
  });

  shot('Out of the 50 biggest', (D, S, H) => {
    H.fl(D, S.t0, { x: 520, y: 400, s: 0.95, pins: [{ city: 'Miami', at: S.w('Miami'), label: 'Miami', side: -1, size: 52 }] });
    H.prop(D, S.w('strongest'), 'trophy', 1350, 420, 1.2, { text: '#1' });
    H.big(D, S.w("buyer's market"), "#1 BUYER'S MARKET", 1400, 720, { size: 64, color: '#1565c0' });
    H.label(D, S.w('50 biggest'), 'out of the 50 biggest metros', 1350, 820, { size: 44, color: '#555' });
  });

  // ===================== P7 ===================================================
  shot("It's basically a speed-dating", (D, S, H) => {
    const left = S.w('already left');
    H.big(D, S.t0, 'SPEED DATING', 960, 120, { size: 80, color: '#e53950', box: '#fff' });
    H.prop(D, S.t0 + 0.1, 'heart', 1430, 130, 0.5); H.prop(D, S.t0 + 0.15, 'heart', 490, 130, 0.5);
    H.prop(D, S.t0, 'table', 960, 640, 1.4);
    [L.dater1, L.dater2, L.dater3].forEach((lk, i) => {
      const gone = i === 2 && D.t > left;
      H.guy(D, S, S.w('three people') + i * 0.12, { x: 560 + i * 150, y: 860, s: 0.78, look: lk, expr: i === 2 && D.t > left - 0.6 ? 'angry' : 'worried', id: 1200 + i * 40, flipBase: false, walkTo: gone ? -300 : undefined, walkAt: left, walkDur: 1.4 });
    });
    H.prop(D, S.t0, 'chair', 1360, 820, 1.2);
    H.label(D, S.w('every table'), 'buyer seat:', 1380, 470, { size: 42 });
    H.label(D, S.w('every table'), 'EMPTY', 1380, 520, { size: 52, font: 'Permanent Marker', color: '#d32f2f' });
  });

  // ===================== P8 ===================================================
  shot("And here's the part that makes", (D, S, H) => {
    H.M(D, S, { x: 960, y: 1180, s: 1.35, pose: 'think', expr: 'confused', fx: 'question' });
    H.big(D, S.w('stranger'), 'STRANGER...', 960, 160, { size: 96, color: '#6a1b9a' });
  });

  shot("Florida's statewide median", (D, S, H) => {
    H.prop(D, S.t0, 'house', 620, 560, 1.7, { roof: '#43a047', id: 1300 });
    H.label(D, S.t0 + 0.2, 'single-family home', 620, 760, { size: 48 });
    H.prop(D, S.w('UP'), 'arrowBig', 1000, 430, 1.3, { dir: 'up' });
    H.count(D, S.w('420,000'), 0.9, 0, 420000, H.fmt.usd, 1430, 330, { size: 120, color: '#151515' });
    H.label(D, S.w('October'), 'median, October', 1430, 430, { size: 46, color: '#555' });
    H.big(D, S.w('2.2%'), '+2.2%', 1430, 590, { size: 130, color: '#2e7d32' });
    H.label(D, S.w('2.2%'), 'vs. a year ago', 1430, 690, { size: 46, color: '#555' });
  });

  shot("That's eight months in a row", (D, S, H) => {
    for (let i = 0; i < 8; i++) {
      const at = S.w('eight months') + i * 0.12;
      H.prop(D, at, 'calendar', 230 + i * 210, 470, 0.85, { month: ['MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT'][i], day: 'UP', daySize: 58 });
      H.check(D, at + 0.2, 230 + i * 210, 640, 30);
    }
    H.big(D, S.w('in a row'), '8 MONTHS IN A ROW', 960, 820, { size: 86, color: '#2e7d32' });
  });

  // ===================== P9 ===================================================
  shot('So which one is it', (D, S, H) => {
    const cr = S.w('crashing'), fi = S.w('fine');
    H.prop(D, cr, 'house', 380, 500, 1.3, { roof: '#d32f2f', crack: true, id: 1400 });
    if (D.t > cr) { H.prop(D, cr, 'fire', 380, 660, 0.9); H.big(D, cr, 'CRASHING?', 380, 200, { size: 90, color: '#d32f2f' }); }
    H.prop(D, fi, 'house', 1540, 500, 1.3, { roof: '#43a047', id: 1430 });
    if (D.t > fi) { H.prop(D, fi, 'sun', 1720, 260, 0.7); H.big(D, fi, 'FINE?', 1540, 200, { size: 90, color: '#2e7d32' }); }
    H.M(D, S, { x: 960, pose: [[0, 'rest'], [cr, 'pointL'], [fi, 'pointR'], [S.w('on paper'), 'shrug']], expr: 'confused' });
  });

  // ===================== P10 ==================================================
  shot('The answer is... both', (D, S, H) => {
    H.M(D, S, { x: 420, pose: [[0, 'count'], [S.w('both'), 'bothUp']], expr: [[0, 'serious'], [S.w('both'), 'grin']] });
    H.big(D, S.w('both'), 'BOTH.', 1200, 330, { size: 230, color: '#151515' });
  });

  shot('And the reason WHY tells', (D, S, H) => {
    H.M(D, S, { x: 420, pose: 'pointR', expr: 'serious' });
    H.prop(D, S.w('rest of the country'), 'signPost', 1250, 620, 2.2, { text: 'REST OF THE U.S.', fill: '#2e7d32', tilt: 0.02 });
    H.big(D, S.w('WHY'), 'WHY?', 1250, 230, { size: 130, color: '#1565c0' });
  });

  shot("Because Florida isn't cracking", (D, S, H) => {
    H.prop(D, S.w('BUYING'), 'priceTag', 620, 380, 1.6, { text: 'BUYING' });
    H.cross(D, S.w('BUYING') + 0.4, 620, 380, 130);
    H.prop(D, S.w('KEEPING'), 'priceTag', 1320, 380, 1.6, { text: 'KEEPING', fill: '#ffccbc' });
    H.ring(D, S.w('KEEPING') + 0.3, 1320, 380, 230, 110);
    H.label(D, S.w('BUYING'), 'the price of', 620, 250, { size: 48 });
    H.label(D, S.w('KEEPING'), 'the price of', 1320, 250, { size: 48 });
    H.prop(D, S.w('KEEPING'), 'house', 1320, 760, 1, { roof: '#ef6c00', id: 1500 });
    for (let i = 0; i < 4; i++) H.prop(D, S.w('KEEPING') + 0.3 + i * 0.2, 'doc', 1120 + i * 130, 600 + (i % 2) * 40, 0.4, { title: ['INS', 'HOA', 'TAX', 'FIX'][i], lines: 1, float: true });
  });

  // ===================== P11 ==================================================
  shot('To see why that matters', (D, S, H) => {
    for (let i = 0; i < 5; i++) H.prop(D, S.t0 + i * 0.08, 'house', 760 + i * 230, 620, 0.8, { roof: ['#5c6bc0', '#8d6e63', '#26a69a', '#7e57c2', '#ef5350'][i], id: 1550 + i * 20 });
    const mx = 760 + 920 * (0.5 + 0.5 * Math.sin((D.t - S.t0) * 0.8));
    H.prop(D, S.t0 + 0.4, 'magnifier', mx, 520, 1.2);
    H.M(D, S, { x: 330, pose: 'presentR', expr: 'neutral' });
    H.label(D, S.w("America's"), "America's housing market", 1220, 250, { size: 60, font: 'Kalam', weight: 'bold' });
  });

  shot('Nearly half of all the mortgages', (D, S, H) => {
    H.prop(D, S.t0, 'pie', 640, 450, 1.6, { frac: lerp(0, 0.48, D.inK(S.t0 + 0.3, 1.2, ease.out)), color: '#43a047', text: '~1/2' });
    H.big(D, S.w('below 4%'), 'BELOW 4%', 1350, 330, { size: 120, color: '#2e7d32' });
    H.label(D, S.w('below 4%'), 'interest rate', 1350, 440, { size: 54 });
    H.prop(D, S.w('mortgages'), 'doc', 1350, 660, 1, { title: 'MORTGAGE', amount: '3.25%', amountColor: '#2e7d32', sig: true });
  });

  shot("And if you're one of those", (D, S, H) => {
    const sit = S.w('sit there');
    H.big(D, S.w('NOTHING'), 'DO NOTHING', 1260, 150, { size: 110, color: '#151515', underline: true, ulColor: '#2e7d32' });
    H.prop(D, S.w("Don't sell"), 'signPost', 950, 560, 1.4, { text: 'SELL' });
    H.cross(D, S.w("Don't sell") + 0.2, 950, 450, 90);
    H.prop(D, S.w("Don't buy"), 'priceTag', 1500, 460, 1.2, { text: 'BUY' });
    H.cross(D, S.w("Don't buy") + 0.2, 1500, 460, 90);
    H.M(D, S, { x: 400, pose: [[0, 'count'], [S.w('NOTHING'), 'stop'], [sit, 'rest']], expr: [[0, 'neutral'], [sit, 'happy']] });
    if (D.t > sit) { H.prop(D, sit, 'couch', 1220, 860, 1.1); H.guy(D, S, sit + 0.1, { x: 1220, y: 840, s: 0.7, look: L.owner, sit: true, expr: 'happy', fx: 'zzz', id: 1650 }); }
  });

  // ===================== P12 ==================================================
  shot('Think about it. If you bought', (D, S, H) => {
    H.M(D, S, { x: 400, pose: [[0, 'think'], [S.w('2021'), 'presentR']], expr: 'neutral' });
    H.prop(D, S.w('2021'), 'calendar', 900, 380, 1.2, { month: 'BOUGHT', day: '2021', daySize: 56 });
    H.prop(D, S.w('3%'), 'padlock', 1300, 440, 2, { text: '3%' });
    H.label(D, S.w('3%'), 'locked-in rate', 1300, 640, { size: 50 });
    H.prop(D, S.w('3%') + 0.2, 'badge', 1620, 300, 1, { text: '%', color: '#ef6c00' });
  });

  shot('selling today means giving', (D, S, H) => {
    H.prop(D, S.t0, 'padlock', 420, 420, 1.6, { text: '3%' });
    H.cross(D, S.w('giving up'), 420, 420, 140);
    H.arrow(D, S.w('borrowing again'), 620, 420, 860, 420, { w: 10, color: '#151515' });
    H.prop(D, S.w('7%'), 'badge', 1050, 420, 1.5, { text: '7%+', color: '#d32f2f' });
    H.bars(D, { x: 1480, y: 860, w: 560, h: 400, max: 3300, lsize: 32, vsize: 36, title: 'Monthly payment', tsize: 40, items: [{ label: 'at 3%', v: 1700, txt: '$', color: '#90caf9', at: S.w('Same house price') }, { label: 'at 7%', v: 2700, txt: '$$$', color: '#e53935', at: S.w('MUCH bigger') }] });
  });

  shot("So people don't move", (D, S, H) => {
    H.prop(D, S.t0, 'house', 700, 640, 1.6, { roof: '#5c6bc0', id: 1700 });
    if (D.t > S.w('add a bedroom')) { const k = D.inK(S.w('add a bedroom'), 0.5, ease.outBack); D.push(1000, 700, k); P.draw(D, 'house', 0, 0, 1, { roof: '#5c6bc0', chimney: false, id: 1730 }); D.pop(); H.label(D, S.w('add a bedroom'), '+ bedroom', 1000, 470, { size: 46, color: '#2e7d32' }); }
    H.guy(D, S, S.t0 + 0.2, { x: 300, y: 920, s: 0.85, look: L.owner, pose: D.t > S.w('renovate') ? 'holdUp' : 'rest', expr: 'happy', id: 1760 });
    if (D.t > S.w('renovate')) H.prop(D, S.w('renovate'), 'roller', 390, 470, 0.8, { rot: Math.sin(D.t * 6) * 0.2 });
    H.label(D, S.w('renovate'), 'new kitchen!', 300, 330, { size: 48, color: '#1565c0' });
    if (D.t > S.w('except sell')) { H.prop(D, S.w('except sell'), 'signPost', 1480, 640, 1.5, { text: 'FOR SALE' }); H.cross(D, S.w('except sell') + 0.2, 1480, 520, 120); }
  });

  // ===================== P13 ==================================================
  shot('And in most of the country, sitting', (D, S, H) => {
    H.prop(D, S.t0, 'couch', 760, 820, 1.3, { color: '#81c784' });
    H.guy(D, S, S.t0, { x: 760, y: 800, s: 0.8, look: L.owner2, sit: true, expr: 'happy', id: 1800, fx: D.t > S.w('forcing') ? 'zzz' : null });
    H.big(D, S.w('cheap'), 'CHEAP', 760, 260, { size: 120, color: '#2e7d32' });
    H.prop(D, S.w('locked in'), 'padlock', 1350, 380, 1.3, { text: '$' });
    H.label(D, S.w('locked in'), 'payment locked in', 1350, 540, { size: 46 });
    H.prop(D, S.w("isn't going anywhere"), 'house', 1650, 720, 0.9, { id: 1830 });
    H.check(D, S.w('Nobody'), 1350, 720, 60);
  });

  // ===================== P14 ==================================================
  shot('Florida is the first place', (D, S, H) => {
    H.bg(D, '#e4572e');
    H.prop(D, S.t0, 'couch', 1250, 700, 1.4, { color: '#ffcc80' });
    H.prop(D, S.w('EXPENSIVE'), 'fire', 1250, 760, 1.3);
    H.prop(D, S.w('EXPENSIVE') + 0.1, 'priceTag', 1250, 420, 1.6, { text: '$$$$' });
    H.big(D, S.w('EXPENSIVE'), 'EXPENSIVE', 1150, 160, { size: 140, color: '#fff', outline: 12, outlineColor: '#151515' });
    H.M(D, S, { x: 420, pose: [[0, 'pointR']], expr: [[0, 'serious'], [S.w('EXPENSIVE'), 'surprise']], fx: [[S.w('EXPENSIVE'), 'shock']] });
  });

  // ===================== P15 ==================================================
  shot('Start with insurance', (D, S, H) => {
    H.prop(D, S.t0, 'house', 1250, 760, 1.4, { id: 1900 });
    H.prop(D, S.t0 + 0.2, 'umbrella', 1250, 430, 1.6);
    H.big(D, S.w('insurance'), 'INSURANCE', 1250, 110, { size: 100, color: '#1565c0' });
    H.M(D, S, { x: 420, pose: [[0, 'pointR']], expr: 'serious' });
  });

  shot('In 2026, the average Florida', (D, S, H) => {
    H.bars(D, { x: 760, y: 880, w: 860, h: 520, max: 9000, title: 'Average yearly home insurance (2026)', tsize: 44, items: [{ label: 'Florida', v: 8471, txt: '$8,471', color: '#ef6c00', at: S.w('8,471') }, { label: 'U.S. average', v: 2872, txt: '$2,872', color: '#90caf9', at: S.w('2,872') }] });
    H.big(D, S.w('THREE'), '~3x', 1470, 330, { size: 220, color: '#d32f2f' });
    H.M(D, S, { x: 1580, s: 0.8, pose: [[0, 'pointL']], expr: [[0, 'neutral'], [S.w('THREE'), 'surprise']] });
  });

  shot('for the exact same thing', (D, S, H) => {
    H.prop(D, S.w('piece of paper'), 'doc', 620, 470, 1.7, { title: 'POLICY', lines: 5, sig: true });
    H.prop(D, S.w('bad happens'), 'cloud', 1300, 250, 1.2, { rain: true, color: '#78909c' });
    H.prop(D, S.w('bad happens'), 'house', 1300, 690, 1.1, { id: 1950 });
    H.prop(D, S.w('someone else covers'), 'umbrella', 1300, 470, 1.4, { color: '#43a047' });
    H.big(D, S.t0, 'THE SAME THING', 620, 130, { size: 76, color: '#151515' });
  });

  // ===================== P16 ==================================================
  shot('Break it down by month', (D, S, H) => {
    const t1 = S.w('1,957'), t2 = S.w('706'), t3 = S.w('2,633');
    H.prop(D, S.t0, 'receipt', 1180, 470, 1.55, { title: 'MONTHLY', rows: [{ label: 'Mortgage', value: '$1,957', k: D.inK(t1, 0.3) }, { label: 'Insurance', value: '$706', k: D.inK(t2, 0.3), color: '#d32f2f' }], total: D.t > t3 ? '$2,633' : '', totalK: D.inK(t3, 0.3) });
    if (D.t > S.w('property tax')) { H.label(D, S.w('property tax'), '+ property tax?', 1720, 360, { size: 46, color: '#777' }); }
    if (D.t > S.w('HOA fee')) { H.label(D, S.w('HOA fee'), '+ HOA fee?', 1720, 440, { size: 46, color: '#777' }); }
    H.M(D, S, { x: 400, pose: [[0, 'presentR'], [t3, 'pointR']], expr: [[0, 'neutral'], [S.w('gets worse'), 'worried']] });
  });

  shot("It's like financing a car", (D, S, H) => {
    H.prop(D, S.t0, 'car', 520, 640, 1.4, { color: '#1e88e5' });
    H.guy(D, S, S.t0, { x: 860, y: 900, s: 0.85, look: L.driver, pose: D.t > S.w('SECOND') ? 'shrug' : 'holdR', expr: D.t > S.w('never allowed') ? 'sad' : 'happy', id: 2000 });
    H.prop(D, S.t0 + 0.3, 'doc', 1010, 560, 0.5, { title: 'PAYMENT', lines: 2 });
    H.prop(D, S.w('SECOND'), 'car', 1400, 640, 1.4, { color: '#e53935', lock: D.t > S.w('never allowed') });
    H.label(D, S.w('SECOND'), 'car #2', 1400, 420, { size: 56, font: 'Permanent Marker' });
    if (D.t > S.w('never allowed')) H.big(D, S.w('never allowed'), 'NO DRIVING', 1400, 330, { size: 70, color: '#d32f2f', box: '#fff' });
  });

  // ===================== P17 ==================================================
  shot('Between 2021 and 2025, Florida premiums', (D, S, H) => {
    H.bars(D, { x: 900, y: 860, w: 900, h: 520, max: 85, title: 'Home insurance premium growth, 2021-2025', tsize: 44, items: [{ label: 'Florida', v: 75, txt: '+75%', color: '#ef6c00', at: S.w('75%') }, { label: 'Rest of U.S.', v: 38, txt: '+38%', color: '#90caf9', at: S.w('38%') }] });
    H.M(D, S, { x: 1650, s: 0.85, pose: [[0, 'pointL']], expr: 'serious' });
  });

  shot('By 2024, Florida had the highest', (D, S, H) => {
    H.prop(D, S.t0, 'pie', 640, 470, 1.6, { frac: lerp(0, 0.044, D.inK(S.w('4.4%'), 0.8)), color: '#d32f2f', bgColor: '#c8e6c9' });
    H.label(D, S.w('household income'), 'household income', 640, 720, { size: 50 });
    H.big(D, S.w('4.4%'), '4.4%', 820, 280, { size: 120, color: '#d32f2f' });
    H.prop(D, S.w('highest'), 'trophy', 1350, 450, 1.3, { text: '#1' });
    H.label(D, S.w('highest'), 'highest insurance cost', 1350, 640, { size: 50, font: 'Kalam', weight: 'bold' });
    H.label(D, S.w('share of'), 'as a share of income', 1350, 700, { size: 44, color: '#555' });
  });

  // ===================== P18 ==================================================
  shot('Now, to be fair', (D, S, H) => {
    const tl = Math.sin(D.t * 1.5) * 0.12;
    H.prop(D, S.t0, 'scale', 1250, 520, 1.6, { tilt: tl });
    H.M(D, S, { x: 420, pose: [[0, 'both']], expr: 'relief' });
    H.big(D, S.w('complicated'), 'IT\'S COMPLICATED', 1250, 170, { size: 80, color: '#6a1b9a' });
  });

  shot('Insurance in Florida is actually', (D, S, H) => {
    H.prop(D, S.t0, 'umbrella', 700, 450, 1.6);
    H.prop(D, S.w('CHEAPER'), 'priceTag', 1300, 380, 1.6, { text: '$$$', slash: true });
    H.prop(D, S.w('CHEAPER') + 0.2, 'arrowBig', 1650, 420, 1, { dir: 'down', color: '#2e7d32' });
    H.big(D, S.w('CHEAPER'), 'CHEAPER', 1300, 660, { size: 120, color: '#2e7d32' });
    H.M(D, S, { x: 330, s: 0.75, pose: 'presentR', expr: 'happy' });
  });

  shot('In the first six months', (D, S, H) => {
    const t51 = S.w('51');
    for (let i = 0; i < 67; i++) {
      const r = Math.floor(i / 12), c = i % 12; const on = i < 51 && D.t > t51 + i * 0.012;
      const x = 820 + c * 80, y = 250 + r * 90;
      if (D.t < S.t0 + i * 0.008) continue;
      D.circle(x, y, 28, { fill: on ? '#66bb6a' : '#e0e0e0', w: 4, id: 2100 + i });
    }
    H.big(D, t51, '51 of 67', 1260, 830, { size: 110, color: '#2e7d32' });
    H.label(D, S.w('counties'), 'counties saw premiums fall', 1260, 920, { size: 46 });
    H.M(D, S, { x: 340, pose: [[0, 'presentR']], expr: 'happy' });
  });

  shot('About 20 new insurance', (D, S, H) => {
    for (let i = 0; i < 20; i++) {
      const r = Math.floor(i / 10), c = i % 10;
      H.prop(D, S.t0 + i * 0.06, 'office', 700 + c * 120, 470 + r * 300, 0.42, { color: ['#78909c', '#5c6bc0', '#26a69a', '#8d6e63'][i % 4], id: 2200 + i * 13 });
    }
    H.big(D, S.w('entered'), '+20 INSURERS', 1240, 150, { size: 100, color: '#1565c0' });
    H.label(D, S.w('since 2023'), 'since 2023', 1240, 250, { size: 50 });
    H.M(D, S, { x: 330, pose: 'pointR', expr: 'happy' });
  });

  shot('And lawsuits against insurers', (D, S, H) => {
    const back = S.w('Back then');
    if (D.t < back) {
      for (let i = 0; i < 6; i++) H.prop(D, S.t0 + i * 0.07, 'doc', 400 + (i % 3) * 30, 640 - i * 40, 0.8, { title: 'LAWSUIT', lines: 2, rot: (i % 2 ? 0.08 : -0.06), id: 2400 + i * 7 });
      H.lineChart(D, S.w('dropped'), { x: 1220, y: 470, w: 820, h: 380, title: 'Lawsuits against insurers', data: [60, 85, 100, 92, 75, 58, 50], min: 0, max: 110, color: '#d32f2f', xl: ['2018', '2020', '2022', '2024', 'now'], after: (D2, pts) => { H.ring(D2, S.w('2020 peak'), pts[2][0], pts[2][1], 46, 36); } });
      H.big(D, S.w('by half'), '-50%', 1500, 780, { size: 110, color: '#2e7d32' });
    } else {
      H.prop(D, back, 'pie', 760, 470, 1.8, { frac: lerp(0, 0.8, D.inK(back + 0.4, 1)), color: '#ef6c00', text: '80%' });
      H.label(D, back + 0.4, "Florida's share of all U.S.", 1380, 400, { size: 50 });
      H.label(D, back + 0.4, 'property insurance lawsuits', 1380, 460, { size: 50 });
      H.label(D, back + 0.4, '(at the 2020 peak)', 1380, 530, { size: 42, color: '#777' });
    }
  });

  // ===================== P19 ==================================================
  shot("So the state's reforms are working", (D, S, H) => {
    H.lineChart(D, S.t0, { x: 1150, y: 480, w: 900, h: 420, title: 'Florida insurance premiums', data: [40, 45, 55, 70, 88, 100, 97], min: 30, max: 110, color: '#ef6c00', xl: ['2019', '2021', '2023', '2025', 'now'], dur: 1.2,
      after: (D2, pts) => { if (D2.t > S.w('record high')) { D2.line(pts[0][0], pts[5][1], pts[6][0] + 20, pts[5][1], { w: 4, color: '#d32f2f', id: 2501 }); D2.text('RECORD HIGH', pts[3][0], pts[5][1] - 30, { size: 36, font: 'Permanent Marker', color: '#d32f2f' }); } H.ring(D2, S.w('NEAR'), pts[6][0], pts[6][1], 40, 36); } });
    H.M(D, S, { x: 330, pose: [[0, 'presentR'], [S.w('somewhat'), 'shrug']], expr: [[0, 'happy'], [S.w('somewhat'), 'smirk']] });
    H.big(D, S.w('NEAR'), 'STILL NEAR THE TOP', 1150, 880, { size: 70, color: '#d32f2f' });
  });

  shot('Someone who bought in 2019', (D, S, H) => {
    H.guy(D, S, S.t0, { x: 380, y: 900, s: 0.95, look: L.condoM, pose: D.t > S.w('Today') ? 'cheeks' : 'holdR', expr: D.t > S.w('Today') ? 'fear' : 'happy', id: 2600 });
    H.prop(D, S.w('budgeted'), 'doc', 850, 470, 1.2, { title: '2019 BILL', amount: '$', amountColor: '#2e7d32', lines: 3 });
    H.prop(D, S.w('Today'), 'doc', 1350, 470, 1.6, { title: 'TODAY', amount: '$$$$$', amountColor: '#d32f2f', lines: 3, id: 2650 });
    H.arrow(D, S.w('Today'), 960, 470, 1150, 470, { w: 9, color: '#151515' });
  });

  shot('And for a lot of retirees', (D, S, H) => {
    const big = S.w('most expensive');
    H.prop(D, S.t0, 'house', 1300, 660, 1.5, { id: 2700, roof: '#8d6e63' });
    H.guy(D, S, S.t0, { x: 520, y: 900, s: 0.95, look: L.retM, expr: D.t > big ? 'fear' : 'happy', pose: D.t > big ? 'cheeks' : 'rest', id: 2720 });
    H.guy(D, S, S.t0 + 0.1, { x: 740, y: 900, s: 0.9, look: L.retF, expr: D.t > big ? 'sad' : 'happy', id: 2760 });
    H.label(D, S.w('fixed incomes'), 'fixed income', 630, 330, { size: 52, color: '#555' });
    H.prop(D, S.w('CHEAP'), 'priceTag', 1300, 250, 1.2, { text: 'CHEAP?' });
    H.cross(D, big, 1300, 250, 90);
    if (D.t > big) H.prop(D, big, 'doc', 1300, 470, 2.4, { title: 'BIGGEST BILL', amount: '$$$$', amountColor: '#d32f2f', drop: true, id: 2800 });
  });

  const api = { shot, L, SH, E, C, P, clamp, lerp, ease };
  if (isNode) { require('./shots2.js')(api); module.exports = SH; } else { root.SHOTS = SH; root.__SHOT_API = api; }
})(typeof window !== 'undefined' ? window : globalThis);

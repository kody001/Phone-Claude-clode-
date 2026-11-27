/* Shot list, part 2: condos -> ending. */
(function (root) {
  function add(api) {
    const { shot, L, E, C, P, clamp, lerp, ease } = api;

    // ===================== P20 ==================================================
    shot('And then... there are the condos', (D, S, H) => {
      H.bg(D, '#eef1f4');
      for (let i = 0; i < 3; i++) H.prop(D, S.w('condos') + i * 0.12, 'condo', 1050 + i * 260, 640, 1, { floors: 10 + i * 2, color: ['#9fb4c7', '#b0bec5', '#a7c4bc'][i], id: 3000 + i * 50 });
      H.M(D, S, { x: 420, pose: 'presentR', expr: 'sad' });
    });

    // ===================== P21 ==================================================
    shot('On June 24th, 2021', (D, S, H) => {
      H.bg(D, '#1f2a44');
      const col = S.w('collapsed');
      for (let i = 0; i < 40; i++) { const x = (i * 197) % 1920, y = (i * 113) % 500; D.circle(x, y, 2 + (i % 3), { fill: '#fff', w: 0, id: 3100 + i, amp: 0.3 }); }
      D.circle(1650, 160, 60, { fill: '#f5f5dc', w: 0, id: 3150 });
      H.prop(D, S.t0, 'calendar', 330, 330, 1.2, { month: 'JUN 24', day: '2021', daySize: 56 });
      if (D.t < col) H.prop(D, S.t0 + 0.2, 'condo', 1150, 760, 1.25, { floors: 12, w: 300, color: '#78909c', id: 3160 });
      else H.prop(D, col, 'ruins', 1150, 760, 1.5, { id: 3200 });
      H.label(D, S.w('Surfside'), 'Surfside, Florida', 1150, 160, { size: 58, color: '#fff', font: 'Kalam', weight: 'bold' });
      if (D.t > S.w('98')) { H.big(D, S.w('98'), '98 lives lost', 420, 640, { size: 76, color: '#fff', rot: 0 }); H.prop(D, S.w('98') + 0.3, 'candle', 420, 830, 1); }
    }, { z1: 1.02 });

    shot('The building had been warned', (D, S, H) => {
      H.bg(D, '#eef1f4');
      H.prop(D, S.t0, 'doc', 560, 470, 2, { title: 'ENGINEER REPORT', lines: 5, stamp: 'REPAIRS NEEDED', id: 3300 });
      const d = S.w('delayed');
      for (let i = 0; i < 3; i++) { H.prop(D, S.w('kept getting') + i * 0.3, 'calendar', 1150 + i * 240, 420, 1, { month: ['2018', '2019', '2020'][i], day: 'LATER', daySize: 44 }); }
      H.big(D, d, 'DELAYED', 1390, 700, { size: 100, color: '#d32f2f', box: '#fff' });
    });

    // ===================== P22 ==================================================
    shot('And Surfside exposed', (D, S, H) => {
      const ol = S.w('outlier');
      for (let i = 0; i < 9; i++) {
        const fl = i === 6;
        H.prop(D, S.w('other states') + i * 0.05, 'piggy', 760 + (i % 5) * 230, 330 + Math.floor(i / 5) * 290, 0.85, { text: fl && D.t > ol ? '' : '$', id: 3400 + i * 10 });
        if (fl && D.t > ol) { H.cross(D, ol + 0.2, 760 + (i % 5) * 230, 330 + Math.floor(i / 5) * 290, 70); H.label(D, ol, 'FLORIDA', 760 + (i % 5) * 230, 460 + Math.floor(i / 5) * 290, { size: 40, font: 'Permanent Marker', color: '#ef6c00' }); }
      }
      H.M(D, S, { x: 330, pose: [[0, 'rest'], [ol, 'pointR']], expr: 'serious' });
      H.big(D, ol, 'OUTLIER', 1240, 900, { size: 90, color: '#ef6c00' });
    });

    shot('Condo associations could vote', (D, S, H) => {
      H.prop(D, S.t0, 'table', 760, 700, 1.6);
      [L.board1, L.board2, L.board3].forEach((lk, i) => H.guy(D, S, S.t0 + i * 0.1, { x: 560 + i * 200, y: 900, s: 0.8, look: lk, pose: D.t > S.w('LOT of them did') ? 'pointUp' : 'rest', expr: 'happy', id: 3500 + i * 40 }));
      H.prop(D, S.w('vote'), 'doc', 1350, 380, 1.3, { title: 'SKIP SAVING?', lines: 2, amount: 'YES  YES  YES', amountColor: '#2e7d32' });
      H.prop(D, S.w('big repairs'), 'piggy', 1500, 760, 1.1, { text: '0' });
      H.big(D, S.w('LOT of them did'), 'A LOT DID', 1350, 130, { size: 86, color: '#d32f2f' });
    });

    shot('That meant lower monthly fees', (D, S, H) => {
      H.label(D, S.t0, 'TODAY', 500, 180, { size: 70, font: 'Permanent Marker', color: '#2e7d32' });
      H.prop(D, S.w('lower monthly fees'), 'doc', 500, 450, 1.3, { title: 'HOA FEE', amount: '$', amountColor: '#2e7d32', lines: 2 });
      H.arrow(D, S.w('and a much bigger') , 760, 450, 1150, 450, { w: 12, color: '#151515' });
      H.label(D, S.w('and a much bigger'), 'LATER', 1440, 180, { size: 70, font: 'Permanent Marker', color: '#d32f2f' });
      H.prop(D, S.w('much bigger problem'), 'doc', 1440, 470, 2, { title: 'REPAIR BILL', amount: '$$$$$$', amountColor: '#d32f2f', lines: 3, id: 3620 });
      H.guy(D, S, S.w('whoever owned'), { x: 1720, y: 920, s: 0.75, look: L.condoF, pose: 'cheeks', expr: 'fear', id: 3660 });
    });

    // ===================== P23 ==================================================
    shot('So in 2022, Florida passed', (D, S, H) => {
      H.prop(D, S.t0, 'doc', 1200, 450, 2.2, { title: 'NEW LAW (2022)', lines: 5, sig: true, stamp: D.t > S.w('passed') + 0.3 ? 'PASSED' : '' });
      H.M(D, S, { x: 420, pose: 'pointR', expr: 'determined' });
    });

    shot('Condo buildings with three', (D, S, H) => {
      H.prop(D, S.t0, 'condo', 560, 840, 1.35, { floors: 11, w: 260, color: '#b0bec5', id: 3700 });
      H.label(D, S.w('three or more'), '3+ stories', 560, 230, { size: 60, font: 'Permanent Marker', color: '#1565c0' });
      H.guy(D, S, S.w('structural inspection'), { x: 900, y: 900, s: 0.9, look: L.inspector, pose: 'holdR', expr: 'serious', id: 3750 });
      H.prop(D, S.w('structural inspection'), 'clipboard', 1030, 620, 0.7, { items: ['Roof', 'Beams', 'Slab'], checks: Math.floor(clamp((D.t - S.w('structural inspection')) / 0.6, 0, 3)) });
      H.prop(D, S.w('turn 30'), 'badge', 1400, 330, 1.3, { text: '30', color: '#1565c0' });
      H.label(D, S.w('turn 30'), 'years old', 1400, 460, { size: 48 });
      H.prop(D, S.w('every 10 years'), 'calendar', 1680, 560, 1.1, { month: 'EVERY', day: '10 yrs', daySize: 48 });
    });

    shot('Associations also have to', (D, S, H) => {
      const items = ['Roof', 'Elevators', 'Concrete', 'Plumbing'];
      H.prop(D, S.t0, 'clipboard', 520, 480, 1.7, { items, checks: Math.floor(clamp((D.t - S.w('forecast')) / 0.5, 0, 4)) });
      H.label(D, S.w('reserve study'), 'RESERVE STUDY', 520, 160, { size: 64, font: 'Permanent Marker', color: '#1565c0' });
      if (D.t > S.w('FUND')) {
        H.prop(D, S.w('FUND'), 'piggy', 1300, 520, 1.6, { text: 'FUND' });
        for (let i = 0; i < 3; i++) { const k = D.prog(S.w('FUND') + i * 0.25, S.w('FUND') + i * 0.25 + 0.6, ease.in); if (k > 0 && k < 1) P.draw(D, 'coins', 1300, lerp(100, 380, k), 0.6, { n: 1 }); }
      }
      if (D.t > S.w('No more voting')) { H.prop(D, S.w('No more voting'), 'ballot', 1650, 820, 0.8); H.cross(D, S.w('No more voting') + 0.2, 1650, 780, 100); }
    });

    shot('Most buildings had until', (D, S, H) => {
      H.prop(D, S.t0, 'calendar', 960, 450, 2.2, { month: 'DEADLINE', day: 'END 2025', daySize: 46 });
      H.prop(D, S.w('studies done'), 'clock', 1450, 450, 1.1);
      H.M(D, S, { x: 420, pose: 'pointR', expr: 'serious' });
    });

    shot('Researchers at the University', (D, S, H) => {
      const half = S.w('HALF');
      for (let i = 0; i < 10; i++) {
        const on = i < 6 && D.t > half + i * 0.06;
        H.prop(D, S.t0 + i * 0.05, 'condo', 220 + i * 165, 720, 0.6, { floors: 9 + (i % 3), w: 130, color: on ? '#ffb74d' : '#cfd8dc', id: 3800 + i * 40 });
      }
      H.big(D, half, 'MORE THAN HALF', 960, 180, { size: 100, color: '#ef6c00' });
      H.label(D, S.w('high-rise'), "of Florida's high-rise condo buildings", 960, 290, { size: 48 });
    });

    // ===================== P24 ==================================================
    shot('The goal was right', (D, S, H) => {
      H.M(D, S, { x: 420, pose: [[0, 'count'], [S.w('goal'), 'fist']], expr: 'determined' });
      H.big(D, S.w('right'), 'GOAL: RIGHT', 1200, 330, { size: 110, color: '#2e7d32' });
      H.check(D, S.w('right') + 0.3, 1650, 330, 60);
      H.label(D, S.w('Nobody'), 'Nobody wants another Surfside.', 1200, 560, { size: 58, font: 'Kalam', weight: 'bold' });
    });

    shot('But think about what that law', (D, S, H) => {
      const all = S.w('ALL at once');
      for (let i = 0; i < 6; i++) {
        const tt = S.w('Decades') + i * 0.18;
        H.prop(D, tt, 'calendar', 220 + i * 120, 760 - i * 60, 0.6, { month: String(1995 + i * 5), day: 'SKIP', daySize: 40 });
      }
      if (D.t > all) H.prop(D, all, 'receipt', 1300, 470, 1.6, { title: 'DUE NOW', rows: [{ label: 'Roof', value: '$$$' }, { label: 'Concrete', value: '$$$' }, { label: 'Elevators', value: '$$$' }], total: '$$$$$$', drop: true });
      H.big(D, all, 'ALL AT ONCE', 1300, 120, { size: 90, color: '#d32f2f' });
    });

    shot("And the bill didn't go", (D, S, H) => {
      [L.prev1, L.prev2].forEach((lk, i) => H.guy(D, S, S.t0, { x: 380 + i * 170, y: 900, s: 0.8, look: lk, expr: 'happy', id: 3900 + i * 40, walkTo: -400, walkAt: S.w('skipped it') + 0.2, walkDur: 2, flipBase: false }));
      H.label(D, S.w('people who skipped'), 'the people who skipped it', 500, 300, { size: 46, color: '#777' });
      H.guy(D, S, S.w('whoever owns'), { x: 1400, y: 900, s: 1, look: L.condoF, pose: 'cheeks', expr: 'fear', id: 3980 });
      H.prop(D, S.w('whoever owns'), 'doc', 1400, 300, 1.2, { title: 'THE BILL', amount: '$$$$', amountColor: '#d32f2f', lines: 2, drop: true, id: 3990 });
      H.big(D, S.w('RIGHT NOW'), 'RIGHT NOW', 1000, 560, { size: 100, color: '#d32f2f' });
    });

    // ===================== P25 ==================================================
    shot("It's like finding out your roommate", (D, S, H) => {
      const ll = S.w('landlord'), fy = S.w('From you');
      H.prop(D, S.t0, 'couch', 500, 860, 1.1, { color: '#a1887f' });
      H.guy(D, S, S.t0, { x: 500, y: 840, s: 0.75, look: L.roommate, sit: true, expr: 'smirk', fx: 'zzz', id: 4000 });
      H.label(D, S.w('never paid'), '30 years: $0 paid', 500, 380, { size: 50, font: 'Kalam', weight: 'bold', color: '#d32f2f' });
      H.guy(D, S, ll, { x: 1550, y: 920, s: 0.95, look: L.landlord, pose: 'holdR', expr: 'angry', id: 4040, walkFrom: 2200, walkDur: 0.9 });
      if (D.t > ll + 0.6) H.prop(D, ll + 0.6, 'doc', 1380, 620, 0.9, { title: 'DUE FRIDAY', amount: '30 YRS RENT', amountColor: '#d32f2f', lines: 2, id: 4080 });
      H.guy(D, S, S.t0 + 0.2, { x: 1050, y: 920, s: 0.95, look: L.you, pose: D.t > fy ? 'cheeks' : 'rest', expr: D.t > fy ? 'fear' : 'neutral', fx: D.t > fy ? 'exclaim' : null, id: 4100 });
      H.label(D, S.t0 + 0.2, 'you', 1050, 960, { size: 40, color: '#555' });
      H.big(D, fy, 'FROM YOU.', 1050, 200, { size: 100, color: '#d32f2f' });
    });

    // ===================== P26 ==================================================
    shot('So associations raised monthly fees', (D, S, H) => {
      H.prop(D, S.t0, 'doc', 380, 400, 1.2, { title: 'HOA FEE', amount: '$$ ↑', amountColor: '#d32f2f', lines: 2 });
      H.prop(D, S.t0 + 0.3, 'arrowBig', 560, 320, 0.6, { dir: 'up', color: '#d32f2f' });
      H.prop(D, S.w('special assessments'), 'doc', 860, 430, 1.6, { title: 'SPECIAL ASSESSMENT', amount: '$30,000+', amountColor: '#d32f2f', lines: 3, id: 4200 });
      H.label(D, S.w('one-time bills'), 'one-time bill', 860, 700, { size: 48 });
      H.prop(D, S.w('listed their units'), 'condo', 1500, 860, 1.4, { floors: 13, w: 300, color: '#b0bec5', id: 4250 });
      if (D.t > S.w('listed their units')) for (let i = 0; i < 6; i++) H.prop(D, S.w('listed their units') + i * 0.12, 'priceTag', 1430 + (i % 2) * 150, 790 - Math.floor(i / 2) * 140 - 120, 0.42, { text: 'SALE', fill: '#ffcdd2' });
      H.guy(D, S, S.w("couldn't pay"), { x: 1150, y: 920, s: 0.75, look: L.condoM, pose: 'shrug', expr: 'sad', id: 4300 });
    });

    // ===================== P27 ==================================================
    shot('You can see it in the numbers', (D, S, H) => {
      for (let i = 0; i < 24; i++) H.prop(D, S.w('62,000') + i * 0.025, 'condo', 760 + (i % 8) * 140, 360 + Math.floor(i / 8) * 200, 0.32, { floors: 7, w: 120, color: '#cfd8dc', id: 4400 + i * 30 });
      H.count(D, S.w('62,000'), 1, 0, 62000, H.fmt.int, 1250, 120, { size: 110, color: '#d32f2f' });
      H.label(D, S.w('condos and townhouses'), 'condos & townhouses for sale (Oct)', 1250, 900, { size: 46 });
      H.M(D, S, { x: 330, pose: 'pointR', expr: 'determined' });
    });

    shot("That's eight months of supply", (D, S, H) => {
      H.bars(D, { x: 900, y: 860, w: 1000, h: 520, max: 9, title: 'Months of supply', items: [{ label: 'Condos', v: 8, txt: '8', color: '#ef6c00', at: S.w('eight months') }, { label: 'Balanced', v: 6, txt: '~6', color: '#bdbdbd', at: S.w('six months') }, { label: 'Single-family', v: 4.6, txt: '4.6', color: '#66bb6a', at: S.w('4.6') }] });
      H.M(D, S, { x: 1660, s: 0.8, pose: 'pointL', expr: 'serious' });
    });

    shot('One analysis from Houzeo', (D, S, H) => {
      H.card(D, S.t0, { x: 960, y: 260, w: 1100, title: 'Florida condos: Aug 2023 vs Aug 2026', body: ['Condo inventory: up almost 74%', 'Condo sales: down about 30%'], hl: [[0, S.w('74%')], [1, S.w('30%'), '#ffab91']], src: 'Source: Houzeo analysis' });
      H.prop(D, S.w('74%'), 'arrowBig', 700, 720, 1.3, { dir: 'up', color: '#ef6c00' });
      H.big(D, S.w('74%'), '+74%', 700, 900, { size: 90, color: '#ef6c00', rot: 0 });
      H.label(D, S.w('74%'), 'for sale', 920, 720, { size: 48 });
      H.prop(D, S.w('30%'), 'arrowBig', 1250, 720, 1.3, { dir: 'down', color: '#d32f2f' });
      H.big(D, S.w('30%'), '-30%', 1250, 900, { size: 90, color: '#d32f2f', rot: 0 });
      H.label(D, S.w('30%'), 'sold', 1450, 720, { size: 48 });
    });

    // ===================== P28 ==================================================
    shot('The median condo price in October', (D, S, H) => {
      const opp = S.w('Opposite');
      H.prop(D, S.t0, 'condo', 420, 700, 1.1, { floors: 10, w: 200, color: '#b0bec5', id: 4500 });
      H.big(D, S.w('290,000'), '$290,000', 420, 160, { size: 80, color: '#151515' });
      H.big(D, S.w('DOWN'), '-3.3%', 420, 260, { size: 76, color: '#d32f2f' });
      H.prop(D, S.w('Single-family homes'), 'house', 1500, 640, 1.4, { roof: '#43a047', id: 4550 });
      H.big(D, S.w('UP'), '+2.2%', 1500, 260, { size: 76, color: '#2e7d32' });
      const chk = [['Same state', S.w('Same state')], ['Same month', S.w('Same month')], ['Same rates', S.w('Same interest')]];
      chk.forEach(([t, at], i) => { H.label(D, at, t, 960, 380 + i * 70, { size: 48, font: 'Kalam', weight: 'bold' }); H.check(D, at + 0.1, 1120, 380 + i * 70, 20, { w: 7 }); });
      if (D.t > opp) { H.arrow(D, opp, 760, 620, 560, 800, { w: 12, color: '#d32f2f' }); H.arrow(D, opp, 1160, 620, 1360, 440, { w: 12, color: '#2e7d32' }); H.big(D, opp, 'OPPOSITE DIRECTIONS', 960, 880, { size: 64, color: '#6a1b9a' }); }
    });

    shot("That's why the statewide number", (D, S, H) => {
      H.prop(D, S.t0, 'condo', 400, 620, 0.8, { floors: 9, w: 170, color: '#ffcdd2', id: 4600 });
      H.label(D, S.t0, 'condos ↓', 400, 820, { size: 46 });
      H.prop(D, S.t0, 'house', 900, 620, 1, { roof: '#43a047', id: 4650 });
      H.label(D, S.t0, 'houses ↑', 900, 820, { size: 46 });
      H.arrow(D, S.w('averaging'), 1080, 560, 1290, 560, { w: 12, color: '#151515' });
      H.prop(D, S.w('averaging'), 'doc', 1480, 520, 1.5, { title: 'STATE AVERAGE', amount: '"FINE"', amountColor: '#2e7d32', lines: 2 });
      H.big(D, S.w('two completely'), '2 MARKETS', 960, 170, { size: 100, color: '#151515' });
    });

    // ===================== P29 ==================================================
    shot("And the pressure isn't over", (D, S, H) => {
      H.prop(D, S.w('Fannie Mae'), 'bank', 900, 520, 1.4, { label: 'FANNIE MAE', id: 4700 });
      H.prop(D, S.w('Freddie Mac'), 'bank', 1400, 520, 1.4, { label: 'FREDDIE MAC', id: 4750 });
      H.prop(D, S.w('70%'), 'pie', 1150, 180, 0.8, { frac: 0.7, color: '#1565c0', text: '70%', size: 48 });
      H.label(D, S.w('70%'), 'of U.S. home loans (rules)', 1150, 300, { size: 40, color: '#555' });
      H.big(D, S.w('tightening'), 'TIGHTER CONDO RULES', 1150, 860, { size: 70, color: '#d32f2f' });
      H.M(D, S, { x: 330, pose: [[0, 'rest'], [S.w('Fannie Mae'), 'pointR']], expr: 'serious' });
    });

    shot('Starting January 4th', (D, S, H) => {
      H.prop(D, S.t0, 'calendar', 330, 330, 1.2, { month: 'JAN', day: '4' });
      H.bars(D, { x: 1000, y: 860, w: 700, h: 500, max: 17, title: 'Reserves: share of annual budget', items: [{ label: 'Before', v: 10, txt: '10%', color: '#bdbdbd', at: S.w('up from 10%') }, { label: 'Jan 4th', v: 15, txt: '15%', color: '#1565c0', at: S.w('15%') }] });
      H.label(D, S.w('full review'), 'for loans with a full review', 1000, 960 - 40, { size: 0.01 });
      H.M(D, S, { x: 1640, s: 0.8, pose: 'pointL', expr: 'serious' });
    });

    shot('Fannie Mae says that works out', (D, S, H) => {
      H.prop(D, S.t0, 'coins', 1200, 520, 2, { n: 2 });
      H.big(D, S.w('13'), '+$13-14 / month', 1200, 280, { size: 90, color: '#2e7d32' });
      H.label(D, S.w('average owner'), 'for the average owner (per Fannie Mae)', 1200, 720, { size: 44, color: '#555' });
      H.M(D, S, { x: 420, pose: 'shrug', expr: 'smirk' });
    });

    // ===================== P30 ==================================================
    shot("That doesn't sound like much", (D, S, H) => {
      const t80 = S.w('80%');
      for (let i = 0; i < 10; i++) {
        const bad = i < 8 && D.t > t80 + i * 0.06;
        H.prop(D, S.w("CAN'T") + i * 0.04, 'condo', 220 + i * 165, 760, 0.6, { floors: 9, w: 130, color: bad ? '#ef9a9a' : '#a5d6a7', id: 4800 + i * 40 });
        if (bad) H.cross(D, t80 + i * 0.06, 220 + i * 165, 640, 40, { w: 8 });
      }
      H.big(D, t80, '~80%', 600, 220, { size: 140, color: '#d32f2f' });
      H.label(D, S.w('OLD'), "of Florida condos miss even the OLD 10% bar", 1250, 220, { size: 46, font: 'Kalam', weight: 'bold' });
      H.label(D, S.w('One mortgage industry'), '(one mortgage-industry estimate)', 1250, 290, { size: 38, color: '#777' });
    });

    shot('A building that falls short', (D, S, H) => {
      H.prop(D, S.t0, 'condo', 420, 840, 1.3, { floors: 12, w: 260, color: '#b0bec5', id: 4900 });
      if (D.t > S.w('non-warrantable')) { D.push(420, 520, D.popK(S.w('non-warrantable')), -0.2); D.rect(-250, -45, 500, 90, { fill: '#fff', w: 7, color: '#d32f2f', id: 4950 }); D.text('NON-WARRANTABLE', 0, 4, { size: 52, font: 'Permanent Marker', color: '#d32f2f' }); D.pop(); }
      H.guy(D, S, S.w('most buyers'), { x: 900, y: 920, s: 0.9, look: L.buyer, pose: 'holdR', expr: 'sad', id: 5000 });
      H.prop(D, S.w('normal mortgage'), 'doc', 1040, 620, 0.8, { title: 'MORTGAGE', lines: 3, id: 5040 });
      H.cross(D, S.w('normal mortgage') + 0.3, 1040, 620, 80);
      H.prop(D, S.w('cash'), 'moneybag', 1400, 500, 1.2);
      H.label(D, S.w('cash'), 'CASH', 1400, 650, { size: 56, font: 'Permanent Marker' });
      H.prop(D, S.w('specialty loan'), 'doc', 1700, 500, 1.1, { title: 'SPECIALTY LOAN', amount: '$$$', amountColor: '#d32f2f', lines: 3, id: 5080 });
    });

    shot("And it's already happening", (D, S, H) => {
      H.prop(D, S.w('August'), 'calendar', 330, 330, 1.2, { month: 'AUG', day: '2026', daySize: 54 });
      H.prop(D, S.w('lighter, faster'), 'signPost', 1000, 650, 2, { text: 'FAST LANE', fill: '#43a047' });
      H.cross(D, S.w('ended'), 1000, 500, 150);
      H.big(D, S.w('more than half'), '> HALF', 1550, 360, { size: 120, color: '#ef6c00' });
      H.label(D, S.w('condo buyers were using'), 'of FL condo buyers used it', 1550, 470, { size: 46 });
      H.label(D, S.w('one industry count'), '(one industry count)', 1550, 530, { size: 36, color: '#777' });
    });

    shot('Now every deal goes through', (D, S, H) => {
      H.prop(D, S.t0, 'clipboard', 420, 470, 1.5, { items: ['Reserves', 'Budget', 'Repairs'], checks: Math.floor(clamp((D.t - S.t0) / 0.5, 0, 3)) });
      H.label(D, S.t0, 'FULL REVIEW', 420, 150, { size: 64, font: 'Permanent Marker', color: '#1565c0' });
      H.lineChart(D, S.w('specialty loans'), { x: 1200, y: 400, w: 620, h: 300, title: 'Specialty condo loans', data: [10, 12, 14, 22, 40, 70], min: 0, max: 80, color: '#d32f2f', xl: ['', '', '', '', 'now'], dur: 1 });
      H.guy(D, S, S.w("don't even realize"), { x: 1600, y: 940, s: 0.8, look: L.young2, pose: 'holdR', expr: 'happy', fx: 'question', id: 5100 });
      H.prop(D, S.w("don't even realize"), 'doc', 1760, 740, 0.6, { title: 'SIGN HERE', lines: 4, sig: true, id: 5140 });
    });

    shot('And when you take most of the normal', (D, S, H) => {
      H.prop(D, S.t0, 'condo', 960, 800, 1.3, { floors: 12, w: 260, color: '#b0bec5', id: 5200 });
      [L.buyer, L.young1, L.regular].forEach((lk, i) => H.guy(D, S, S.t0, { x: 600 + i * 330, y: 920, s: 0.75, look: lk, expr: 'neutral', id: 5240 + i * 40, walkTo: i === 1 ? 2300 : (i === 0 ? -400 : 2300), walkAt: S.w('away from') + i * 0.15, walkDur: 1.8 }));
      H.prop(D, S.w('lower the price'), 'priceTag', 1500, 360, 1.2, { text: '$$$', slash: true });
      H.big(D, S.w('ANY'), 'AT ANY PRICE', 960, 150, { size: 100, color: '#d32f2f' });
    });

    // ===================== P31 ==================================================
    shot("It's the real estate version", (D, S, H) => {
      H.prop(D, S.t0, 'phone', 1150, 500, 1.6, { msgs: [{ text: 'Love the condo!', k: 1 }, { text: 'Price drop?', mine: true, k: 1, read: D.t > S.w('left on read') ? 'Read 2:14 PM' : '' }] });
      H.guy(D, S, S.t0, { x: 500, y: 920, s: 1, look: L.condoF, pose: 'holdR', expr: D.t > S.w('left on read') ? 'sad' : 'neutral', id: 5300 });
      H.big(D, S.w('left on read'), 'LEFT ON READ', 1150, 120, { size: 80, color: '#1e88e5' });
    }, { z1: 1.06 });

    // ===================== P32 ==================================================
    shot('And this is the part that connects', (D, S, H) => {
      H.bg(D, '#f3efe6');
      H.prop(D, S.w('3% mortgage'), 'padlock', 1150, 420, 1.6, { text: '3%' });
      H.prop(D, S.w('saves you money'), 'piggy', 1550, 520, 1.1, { text: '$' });
      H.label(D, S.w("That's why people stay"), 'why people stay', 1300, 750, { size: 60, font: 'Kalam', weight: 'bold', color: '#2e7d32' });
      H.M(D, S, { x: 420, pose: 'presentR', expr: 'serious' });
    });

    shot('But if your insurance goes up', (D, S, H) => {
      H.bg(D, '#f3efe6');
      const rows = [
        { label: '3% mortgage', value: '$', k: 1, color: '#2e7d32' },
        { label: 'Insurance', value: '+$300/mo', k: D.inK(S.w('300'), 0.3), color: '#d32f2f' },
        { label: 'HOA fee', value: '+$400/mo', k: D.inK(S.w('400'), 0.3), color: '#d32f2f' },
        { label: 'Assessment', value: '$30,000', k: D.inK(S.w('30,000'), 0.3), color: '#d32f2f' },
      ];
      const grow = D.inK(S.w('keeps getting longer'), 1.2);
      for (let i = 0; i < Math.floor(grow * 3); i++) rows.push({ label: '...', value: '$$$', k: 1, color: '#d32f2f' });
      const sc = 1.25 - grow * 0.2, rh = 90 + rows.length * 44;
      H.prop(D, S.t0, 'receipt', 1150, 470, sc, { title: 'THE BILL', rows, w: 420 });
      H.cross(D, S.w('stops being'), 1150 - 70 * sc, 470 + (-rh / 2 + 92) * sc, 34 * sc, { w: 8 });
      H.M(D, S, { x: 420, pose: [[0, 'presentR'], [S.w('30,000'), 'cheeks']], expr: [[0, 'serious'], [S.w('30,000'), 'fear']] });
    });

    shot('In most of America, owners', (D, S, H) => {
      H.bg(D, '#f3efe6');
      H.prop(D, S.t0, 'clock', 520, 420, 1.4);
      H.big(D, S.w('wait'), 'WAIT', 520, 680, { size: 120, color: '#2e7d32' });
      H.label(D, S.t0, 'most of America', 520, 180, { size: 58, font: 'Kalam', weight: 'bold' });
      H.label(D, S.w('In Florida'), 'Florida', 1400, 180, { size: 58, font: 'Kalam', weight: 'bold', color: '#ef6c00' });
      H.big(D, S.w('LEAVE'), 'LEAVE', 1400, 500, { size: 200, color: '#d32f2f', box: '#fff' });
      H.arrow(D, S.w('LEAVE') + 0.3, 1250, 680, 1650, 680, { w: 16, color: '#d32f2f' });
    });

    // ===================== P33 ==================================================
    shot('And if you want to see what it looks', (D, S, H) => {
      H.fl(D, S.t0, { x: 900, y: 380, s: 1.1, shade: [{ city: 'Cape Coral', at: S.w('Southwest'), r: 170, color: 'rgba(229,57,53,0.35)' }] });
      H.big(D, S.w('Southwest'), 'SOUTHWEST FLORIDA', 1350, 880, { size: 76, color: '#d32f2f' });
      H.M(D, S, { x: 330, pose: 'pointR', expr: 'serious' });
    });

    // ===================== P34 ==================================================
    shot('Four of the five metros', (D, S, H) => {
      H.fl(D, S.t0, { x: 380, y: 0, s: 2.1, label: false, pinS: 0.9, pins: [
        { city: 'Punta Gorda', at: S.w('Punta Gorda'), label: 'Punta Gorda -12%', side: 1, size: 44 },
        { city: 'Cape Coral', at: S.w('Cape Coral-Fort'), label: 'Cape Coral-Ft Myers -9%', side: 1, size: 44 },
        { city: 'Sarasota', at: S.w('North Port'), label: 'N.Port-Sarasota -7.5%', side: -1, size: 44 },
        { city: 'Naples', at: S.w('Naples'), label: 'Naples -6%', side: 1, size: 44 }] });
      H.card(D, S.t0, { x: 1480, y: 150, w: 720, tsize: 38, title: '4 of the 5 biggest U.S. price drops', body: ['Jan 2025 to Jan 2026'], src: '' });
    }, { z1: 1.04 });

    // ===================== P35 ==================================================
    shot("And it didn't stop there", (D, S, H) => {
      H.prop(D, S.t0, 'house', 520, 620, 1.6, { roof: '#ef6c00', id: 5400 });
      H.label(D, S.t0, 'Cape Coral-Fort Myers', 520, 820, { size: 50, font: 'Kalam', weight: 'bold' });
      H.label(D, S.w('first three months'), 'Jan-Mar 2026', 520, 200, { size: 52, color: '#555' });
      H.big(D, S.w('9%'), '-9%', 1300, 300, { size: 160, color: '#d32f2f' });
      H.count(D, S.w('341,250'), 1, 375000, 341250, H.fmt.usd, 1300, 520, { size: 110, color: '#151515' });
      H.label(D, S.w('341,250'), 'median sale price', 1300, 620, { size: 46 });
    });

    shot('Out of 129 major cities', (D, S, H) => {
      const n = 43; const bw = 30;
      for (let i = 0; i < n; i++) {
        if (D.t < S.t0 + i * 0.015) continue;
        const v = i === n - 1 ? -9 : -4 + (i * 7919 % 100) / 10; const last = i === n - 1;
        const h = Math.abs(v) * 26; const x = 260 + i * 34; const y = 450;
        D.rect(x, v < 0 ? y : y - h, bw - 6, h, { fill: last && D.t > S.w('BIGGEST') ? '#d32f2f' : (v < 0 ? '#ef9a9a' : '#a5d6a7'), w: 3, id: 5500 + i, amp: 0.6 });
      }
      D.line(240, 450, 1740, 450, { w: 4, id: 5600 });
      H.ring(D, S.w('BIGGEST'), 260 + 42 * 34 + 12, 450 + 120, 46, 150);
      H.big(D, S.w('BIGGEST'), '#1 BIGGEST DROP', 1000, 820, { size: 90, color: '#d32f2f' });
      H.label(D, S.w('ATTOM'), '129 major cities tracked by ATTOM', 960, 160, { size: 52, font: 'Kalam', weight: 'bold' });
    });

    // ===================== P36 ==================================================
    shot('Cape Coral is the clearest', (D, S, H) => {
      H.lineChart(D, S.w('pandemic'), { x: 1150, y: 470, w: 860, h: 420, title: 'Cape Coral home values', data: [100, 104, 120, 145, 162, 160], min: 90, max: 170, color: '#2e7d32', xl: ['2020', '2021', '2022'], dur: 1.4 });
      H.big(D, S.w('60%'), '+60%', 1380, 380, { size: 130, color: '#2e7d32' });
      H.label(D, S.w('two years'), 'in about 2 years', 1380, 480, { size: 46 });
      H.M(D, S, { x: 330, pose: [[0, 'presentR'], [S.w('shot up'), 'pointRup']], expr: 'calm' });
    });

    shot('Builders rushed in', (D, S, H) => {
      H.prop(D, S.t0, 'crane', 1500, 760, 1.3);
      for (let i = 0; i < 4; i++) H.prop(D, S.t0 + 0.2 + i * 0.12, 'frame', 380 + i * 280, 800, 0.9, { id: 5700 + i * 10 });
      H.guy(D, S, S.t0, { x: 520, y: 940, s: 0.75, look: L.builder, pose: 'holdUp', expr: 'happy', id: 5800, walkFrom: -200, walkDur: 0.8 });
      H.guy(D, S, S.t0 + 0.2, { x: 1000, y: 940, s: 0.75, look: L.builder2, pose: 'wave', expr: 'happy', id: 5840, walkFrom: 2200, walkDur: 0.9 });
      H.prop(D, S.t0 + 0.3, 'hammer', 620, 560, 0.6, { rot: Math.sin(D.t * 10) * 0.4 });
    });

    shot('Then in September 2022', (D, S, H) => {
      H.bg(D, '#dfe7ee');
      const fl = S.w('flooded');
      for (let i = 0; i < 5; i++) H.prop(D, S.t0, 'house', 260 + i * 330, 760, 0.95, { id: 5900 + i * 20, roof: ['#8d6e63', '#5c6bc0', '#ef6c00', '#26a69a', '#7e57c2'][i] });
      H.prop(D, S.w('Hurricane Ian'), 'hurricane', 1500, 230, 1.4);
      H.label(D, S.w('Hurricane Ian'), 'HURRICANE IAN', 1500, 420, { size: 52, font: 'Permanent Marker', color: '#37474f' });
      H.prop(D, S.t0, 'calendar', 300, 260, 1, { month: 'SEP', day: '2022', daySize: 52 });
      if (D.t > fl) { const lvl = lerp(1000, 700, D.inK(fl, 1.4)); P.draw(D, 'waves', 960, lvl, 1, { w: 2200, h: 500 }); }
    });

    shot('Insurance went up', (D, S, H) => {
      H.prop(D, S.t0, 'doc', 420, 470, 1.4, { title: 'INSURANCE', amount: '$', lines: 3 });
      H.big(D, S.w('tripled'), 'x3', 900, 380, { size: 160, color: '#ef6c00' });
      H.big(D, S.w('quadrupled'), 'x4', 1250, 380, { size: 200, color: '#d32f2f' });
      H.label(D, S.w('2024 hurricane season'), 'after the 2024 hurricane season', 1100, 650, { size: 52, font: 'Kalam', weight: 'bold' });
      H.label(D, S.w('in some cases'), '(in some cases)', 1100, 720, { size: 42, color: '#777' });
      H.prop(D, S.w('2024 hurricane season'), 'hurricane', 1650, 320, 0.8);
    });

    shot('That was the year Hurricane Helene', (D, S, H) => {
      H.bg(D, '#dfe7ee');
      H.prop(D, S.t0, 'hurricane', 520, 420, 1.8, { color: '#455a64' });
      H.label(D, S.w('Helene'), 'HURRICANE HELENE (2024)', 520, 700, { size: 52, font: 'Permanent Marker', color: '#37474f' });
      H.card(D, S.w('350 million'), { x: 1350, y: 430, w: 720, title: 'Manatee County alone', body: ['~$350 million in damage (estimated)'], hl: [[0, S.w('350 million') + 0.2]] });
    });

    shot('Migration slowed', (D, S, H) => {
      const fin = S.w('kept getting finished');
      const k = D.inK(S.t0, 3, ease.out);
      P.draw(D, 'truck', lerp(-200, 520, k), 330, 0.7, { text: 'MOVING' });
      H.label(D, S.t0 + 0.2, 'migration slowing...', 520, 140, { size: 48, color: '#777' });
      for (let i = 0; i < 4; i++) {
        const done = D.t > fin + i * 0.2;
        H.prop(D, S.w('builders had started') + i * 0.1, done ? 'house' : 'frame', 820 + i * 290, 820, 0.95, { id: 6000 + i * 20, roof: '#90a4ae', sign: done ? 'EMPTY' : null, signOpts: { x: 90 } });
      }
    });

    // ===================== P37 ==================================================
    shot('That last part matters', (D, S, H) => {
      H.prop(D, S.t0, 'couch', 480, 820, 1, { color: '#81c784' });
      H.guy(D, S, S.t0, { x: 480, y: 800, s: 0.75, look: L.owner, sit: true, expr: 'happy', id: 6100 });
      H.prop(D, S.w('can afford to wait'), 'clock', 480, 400, 0.9);
      H.label(D, S.w('can afford to wait'), 'can wait', 480, 250, { size: 60, font: 'Permanent Marker', color: '#2e7d32' });
      for (let i = 0; i < 3; i++) H.prop(D, S.w('A builder'), 'house', 1150 + i * 230, 650, 0.8, { id: 6150 + i * 20, sign: i === 1 ? 'EMPTY' : null, signOpts: { x: 80 } });
      H.guy(D, S, S.w('A builder'), { x: 1380, y: 940, s: 0.8, look: L.builder, pose: 'cheeks', expr: 'fear', fx: 'sweat', id: 6200 });
      H.big(D, S.w("can't"), "CAN'T", 1380, 250, { size: 110, color: '#d32f2f' });
    });

    shot('Builders in the region overbuilt', (D, S, H) => {
      for (let i = 0; i < 6; i++) H.prop(D, S.t0 + i * 0.08, 'house', 260 + i * 280, 400, 0.75, { id: 6300 + i * 20, roof: '#90a4ae' });
      H.label(D, S.w('spec inventory'), 'SPEC HOMES', 960, 130, { size: 76, font: 'Permanent Marker', color: '#1565c0' });
      H.label(D, S.w('before anyone signed'), 'built before anyone signed a contract', 960, 560, { size: 50 });
      H.prop(D, S.w('cut prices'), 'priceTag', 620, 780, 1.3, { text: 'PRICE CUT', slash: false, fill: '#ffcdd2' });
      H.prop(D, S.w('incentives'), 'gift', 1300, 790, 1.1);
      H.label(D, S.w('incentives'), 'incentives!', 1500, 790, { size: 56, font: 'Permanent Marker', color: '#8e24aa' });
    });

    shot('One person at Babcock Ranch', (D, S, H) => {
      H.guy(D, S, S.t0, { x: 520, y: 920, s: 1.05, look: L.ranch, pose: 'point', expr: 'serious', id: 6400 });
      H.label(D, S.t0 + 0.2, 'Babcock Ranch', 520, 230, { size: 56, font: 'Kalam', weight: 'bold' });
      H.label(D, S.w('master-planned'), '(master-planned community, SW Florida)', 520, 295, { size: 36, color: '#777' });
      H.prop(D, S.w('burn through'), 'bubble', 1250, 360, 1.15, { text: ['"burn through the', 'inventory they have"'], tx: -330, ty: 140 });
      H.prop(D, S.w('burn through') + 0.3, 'fire', 1350, 830, 0.8);
      for (let i = 0; i < 3; i++) H.prop(D, S.w('burn through') + 0.2, 'house', 1150 + i * 200, 720, 0.55, { id: 6450 + i * 20 });
    });

    shot('In plain English', (D, S, H) => {
      const sg = S.w('signed on the dotted');
      H.guy(D, S, S.t0, { x: 420, y: 920, s: 0.9, look: L.builder2, pose: 'hips', expr: 'determined', id: 6500 });
      H.big(D, S.w('ahead of demand'), 'NO MORE BUILDING AHEAD', 1150, 150, { size: 68, color: '#151515' });
      H.prop(D, S.w('signed'), 'doc', 1000, 520, 1.3, { title: 'CONTRACT', lines: 4, sig: D.t > sg + 0.3 });
      H.guy(D, S, S.w('once someone'), { x: 1300, y: 920, s: 0.85, look: L.young1, pose: 'reach', expr: 'happy', id: 6540 });
      H.arrow(D, sg + 0.5, 1180, 520, 1420, 520, { w: 10, color: '#151515' });
      H.prop(D, sg + 0.7, 'frame', 1600, 620, 0.9);
    });

    // ===================== P38 ==================================================
    shot('So every discounted new home', (D, S, H) => {
      H.prop(D, S.t0, 'house', 520, 620, 1.3, { roof: '#26a69a', id: 6600 });
      H.label(D, S.t0, 'NEW', 520, 380, { size: 56, font: 'Permanent Marker', color: '#26a69a' });
      H.prop(D, S.t0 + 0.2, 'priceTag', 760, 420, 0.9, { text: '-$40K', fill: '#ffcdd2' });
      H.prop(D, S.w('older house'), 'house', 1400, 620, 1.3, { roof: '#8d6e63', wall: '#e0d4c3', id: 6650 });
      H.label(D, S.w('older house'), 'OLDER', 1400, 380, { size: 56, font: 'Permanent Marker', color: '#8d6e63' });
      H.big(D, S.w('compete'), 'VS', 960, 600, { size: 140, color: '#d32f2f' });
      if (D.t > S.w('compete')) H.prop(D, S.w('compete') + 0.2, 'arrowBig', 1650, 600, 0.8, { dir: 'down' });
    });

    // ===================== P39 ==================================================
    shot('And this is where the real damage', (D, S, H) => {
      H.bg(D, '#e3f0f8');
      const uw = S.w('underwater');
      H.prop(D, S.t0, 'house', 560, 640, 1.6, { id: 6700 });
      if (D.t > uw) { const lvl = lerp(1100, 400, D.inK(uw, 1.2)); P.draw(D, 'waves', 560, lvl, 1, { w: 800, h: 800 }); }
      H.big(D, S.w('11.4%'), '11.4%', 1350, 230, { size: 150, color: '#1565c0' });
      H.label(D, S.w('Cape Coral'), 'of Cape Coral mortgaged homes', 1350, 340, { size: 48 });
      H.label(D, S.w('Cape Coral'), 'were UNDERWATER (Q2)', 1350, 400, { size: 48, font: 'Kalam', weight: 'bold' });
      H.prop(D, S.w('owed more'), 'scale', 1350, 720, 1, { tilt: -0.25 * D.inK(S.w('owed more'), 0.6) });
      H.label(D, S.w('owed more'), 'LOAN', 1180, 690, { size: 40, font: 'Permanent Marker', color: '#d32f2f' });
      H.label(D, S.w('worth'), 'VALUE', 1520, 610, { size: 40, font: 'Permanent Marker', color: '#2e7d32' });
    });

    shot('Nationally, that number is around', (D, S, H) => {
      H.bars(D, { x: 960, y: 860, w: 1100, h: 520, max: 12.5, title: 'Share of mortgaged homes underwater', items: [{ label: 'Cape Coral', v: 11.4, txt: '11.4%', color: '#1565c0', at: S.t0 }, { label: 'Lakeland', v: 7.5, txt: '7.5%', color: '#42a5f5', at: S.w('Lakeland') }, { label: 'U.S.', v: 1.5, txt: '1.5%', color: '#bdbdbd', at: S.w('1.5%') }] });
    });

    shot('And Texas and Florida together', (D, S, H) => {
      H.prop(D, S.t0, 'pie', 700, 460, 1.9, { frac: lerp(0, 0.39, D.inK(S.w('39%'), 0.9)), color: '#1565c0', text: '39%' });
      H.label(D, S.w('Texas'), 'Texas + Florida', 1380, 380, { size: 70, font: 'Permanent Marker' });
      H.label(D, S.w('underwater homes'), 'share of ALL underwater', 1380, 480, { size: 52 });
      H.label(D, S.w('underwater homes'), 'homes in America', 1380, 540, { size: 52 });
    });

    // ===================== P40 ==================================================
    shot('Now look at WHO is underwater', (D, S, H) => {
      H.prop(D, S.w('WHO'), 'magnifier', 1500, 300, 1.2, { rot: 0.3 });
      for (let i = 0; i < 20; i++) { const on = i < 15 && D.t > S.w('75%') + i * 0.03; H.crowd(D, S.w('Nationwide') + i * 0.02, 1, 640 + (i % 10) * 90, 420 + Math.floor(i / 10) * 140, { s: 1.4, fill: on ? '#ffcc80' : '#fff' }); }
      H.big(D, S.w('75%'), '75%', 400, 330, { size: 150, color: '#ef6c00' });
      H.label(D, S.w('FHA'), 'used FHA or VA loans', 400, 450, { size: 48, font: 'Kalam', weight: 'bold' });
      H.prop(D, S.w('smallest down payments'), 'coins', 1100, 820, 1, { n: 1 });
      H.label(D, S.w('smallest down payments'), 'tiny down payment', 1350, 820, { size: 48 });
    });

    shot('And an estimated 85%', (D, S, H) => {
      D.line(260, 560, 1660, 560, { w: 6, id: 6800 });
      for (let y = 2015; y <= 2026; y++) { const x = 260 + (y - 2015) * 127; D.line(x, 545, x, 575, { w: 4, id: 6810 + y }); D.text(String(y), x, 610, { size: 30, color: '#555' }); }
      if (D.t > S.w('2022')) { D.rect(260 + 7 * 127, 470, 4 * 127, 70, { fill: 'rgba(229,57,53,0.3)', w: 4, color: '#d32f2f', id: 6830 }); }
      H.big(D, S.w('85%'), '85%', 1150, 330, { size: 150, color: '#d32f2f' });
      H.label(D, S.w('2022 or later'), 'of underwater mortgages: taken out 2022 or later', 960, 760, { size: 50, font: 'Kalam', weight: 'bold' });
    });

    shot("So it's not the people who bought in 2015", (D, S, H) => {
      H.lineChart(D, S.t0, { x: 960, y: 460, w: 1100, h: 420, frame: false, data: [40, 45, 50, 56, 62, 75, 95, 100, 92, 85, 80], min: 30, max: 110, color: '#151515', xl: ['2015', '2018', '2021', '2024', 'now'], dur: 0.8,
        after: (D2, pts) => {
          if (D2.t > S.w('2015')) { D2.push(pts[0][0], pts[0][1] - 40, 0.55); C.stick(D2, { x: 0, y: 0, s: 1, look: L.owner, expr: 'happy', id: 6900 }); D2.pop(); }
          if (D2.t > S.w('near the top')) { D2.push(pts[7][0], pts[7][1] - 30, 0.55); C.stick(D2, { x: 0, y: 0, s: 1, look: L.young2, expr: D2.t > S.w('prices fell first') ? 'fear' : 'happy', pose: D2.t > S.w('prices fell first') ? 'cheeks' : 'rest', id: 6940 }); D2.pop(); H.ring(D2, S.w('near the top'), pts[7][0], pts[7][1] - 100, 90, 140); }
        } });
      H.check(D, S.w('2015') + 0.3, 420, 700, 40);
      H.label(D, S.w('least money down'), 'least money down', 1400, 820, { size: 50, color: '#d32f2f' });
    });

    // ===================== P41 ==================================================
    shot('And being underwater on its own', (D, S, H) => {
      H.guy(D, S, S.t0, { x: 600, y: 920, s: 1, look: L.young2, pose: 'holdR', expr: 'neutral', id: 7000 });
      H.prop(D, S.w('keep making the payment'), 'doc', 800, 560, 0.7, { title: 'PAID', lines: 2, amountColor: '#2e7d32', id: 7040 });
      H.prop(D, S.w('wait'), 'clock', 1300, 420, 1.3);
      H.big(D, S.w("isn't a disaster"), 'NOT A DISASTER (yet)', 1250, 750, { size: 64, color: '#2e7d32' });
    });

    shot("The problem is when you're underwater", (D, S, H) => {
      H.prop(D, S.t0, 'calendar', 420, 380, 1.4, { month: 'PAYMENT', day: 'MISSED', daySize: 46 });
      H.cross(D, S.w('fall behind'), 420, 420, 90);
      H.count(D, S.w('320,000'), 1, 0, 320000, H.fmt.int, 1250, 260, { size: 120, color: '#d32f2f' });
      H.label(D, S.w('borrowers'), 'underwater AND behind (end of June)', 1250, 360, { size: 46 });
      H.bars(D, { x: 1250, y: 860, w: 600, h: 360, max: 340000, items: [{ label: 'A year earlier', v: 165000, txt: '~half', color: '#bdbdbd', at: S.w('DOUBLE') }, { label: 'June', v: 320000, txt: '2x', color: '#d32f2f', at: S.w('DOUBLE') + 0.2 }] });
    });

    shot("Those are the people who can't sell", (D, S, H) => {
      H.prop(D, S.t0, 'house', 520, 620, 1.4, { sign: 'FOR SALE', id: 7100 });
      H.bars(D, { x: 1300, y: 820, w: 640, h: 480, max: 110, items: [{ label: 'Sale price', v: 80, txt: '$$', color: '#66bb6a', at: S.w('sale') }, { label: 'Loan owed', v: 100, txt: '$$$', color: '#d32f2f', at: S.w('cover the loan') }] });
      H.big(D, S.w("won't cover"), "DOESN'T COVER IT", 1300, 150, { size: 70, color: '#d32f2f' });
    });

    // ===================== P42 ==================================================
    shot("It's like buying concert tickets", (D, S, H) => {
      const sec = S.w('second show');
      H.guy(D, S, S.t0, { x: 380, y: 920, s: 0.95, look: L.reseller, pose: 'holdR', expr: 'smirk', id: 7200 });
      H.prop(D, S.t0 + 0.2, 'ticket', 600, 560, 0.8, { price: '$$$ x3' });
      H.guy(D, S, S.t0 + 0.3, { x: 840, y: 920, s: 0.95, look: L.fan, pose: D.t > sec ? 'cheeks' : 'up', expr: D.t > sec ? 'fear' : 'grin', id: 7240 });
      H.label(D, S.w('triple the price'), 'triple the price', 600, 400, { size: 48, color: '#d32f2f' });
      if (D.t > sec) { H.prop(D, sec, 'doc', 1450, 430, 1.8, { title: '2ND SHOW ADDED!', lines: 3, fill: '#e1bee7', id: 7280 }); }
      if (D.t > S.w("can't resell")) H.cross(D, S.w("can't resell"), 600, 560, 70);
      if (D.t > S.w('still making payments')) H.prop(D, S.w('still making payments'), 'doc', 1100, 700, 0.8, { title: 'CARD BILL', amount: '$$$', amountColor: '#d32f2f', lines: 2, id: 7300 });
    });

    // ===================== P43 ==================================================
    shot("That's how you end up with Punta Gorda", (D, S, H) => {
      H.fl(D, S.t0, { x: 640, y: 360, s: 1.1, pins: [{ city: 'Punta Gorda', at: S.w('Punta Gorda'), label: 'Punta Gorda', side: -1, size: 46 }, { city: 'Lakeland', at: S.w('Lakeland'), label: 'Lakeland', side: 1, size: 46 }] });
      H.big(D, S.w('WORST'), '2 WORST', 1450, 330, { size: 130, color: '#d32f2f' });
      H.label(D, S.w('foreclosure rates'), 'foreclosure rates in the U.S.', 1450, 450, { size: 48 });
      H.label(D, S.w('200,000'), '(metros over 200,000 people)', 1450, 510, { size: 40, color: '#777' });
    });

    shot('Statewide, more than 27,000', (D, S, H) => {
      for (let i = 0; i < 18; i++) H.prop(D, S.t0 + i * 0.05, 'house', 260 + (i % 9) * 175, 470 + Math.floor(i / 9) * 230, 0.55, { roof: '#d32f2f', wall: '#ffcdd2', chimney: false, id: 7400 + i * 15, sign: 'FORECLOSURE', signOpts: { x: 60 } });
      H.count(D, S.w('27,000'), 1.1, 0, 27000, (v) => '27,000+'.length && Math.round(v).toLocaleString('en-US') + '+', 960, 170, { size: 120, color: '#d32f2f' });
      H.label(D, S.w('first six months'), 'Florida foreclosure filings, first half of the year', 960, 880, { size: 48 });
    });

    // ===================== P44 ==================================================
    shot("And here's the strangest part", (D, S, H) => {
      H.fl(D, S.t0, { x: 300, y: -150, s: 2.4, label: false, pinS: 0.9, pins: [{ city: 'Cape Coral', at: S.w('Cape Coral'), label: 'Cape Coral', side: 1, size: 46 }, { city: 'Naples', at: S.w('Naples'), label: 'Naples', side: 1, size: 46, color: '#f5b400' }] });
      H.label(D, S.w('40 miles'), '~40 miles', 1050, 520, { size: 52, font: 'Permanent Marker', color: '#1565c0' });
      H.prop(D, S.w('luxury'), 'mansion', 1550, 700, 1.1);
      H.label(D, S.w('booming'), 'LUXURY BOOM', 1550, 400, { size: 60, font: 'Permanent Marker', color: '#f5b400' });
      H.M(D, S, { x: 1650, s: 0.6, y: 1000, pose: 'pointL', expr: 'smirk' });
    });

    shot('Same coast', (D, S, H) => {
      const rows = [['Same coast', S.w('Same coast')], ['Same hurricanes', S.w('Same hurricanes')], ['Same insurance companies', S.w('Same insurance')]];
      rows.forEach(([t, at], i) => { H.label(D, at, t, 980, 260 + i * 140, { size: 64, font: 'Kalam', weight: 'bold', align: 'left' }); H.check(D, at + 0.1, 910, 260 + i * 140, 36); });
      H.M(D, S, { x: 450, pose: 'count', expr: 'smirk' });
    });

    shot('One got branded', (D, S, H) => {
      H.prop(D, S.t0, 'house', 480, 600, 1.3, { roof: '#90a4ae', crack: true, sign: 'WORST', id: 7500 });
      H.label(D, S.t0, 'Cape Coral', 480, 800, { size: 50, font: 'Kalam', weight: 'bold' });
      H.label(D, S.w('worst housing market'), '"America\'s worst housing market"', 480, 240, { size: 44, color: '#d32f2f' });
      H.prop(D, S.w('The other'), 'mansion', 1400, 600, 1.05);
      H.label(D, S.w('The other'), 'Naples', 1400, 800, { size: 50, font: 'Kalam', weight: 'bold' });
      H.guy(D, S, S.w('high-end buyers'), { x: 1750, y: 940, s: 0.8, look: L.rich, pose: 'holdR', expr: 'smirk', id: 7550 });
      H.prop(D, S.w('high-end buyers'), 'moneybag', 1860, 700, 0.6);
    });

    shot("The difference isn't the weather", (D, S, H) => {
      H.prop(D, S.t0, 'sun', 960, 200, 0.8);
      H.cross(D, S.w('weather') + 0.1, 960, 200, 90);
      H.guy(D, S, S.w('NEEDS a loan'), { x: 420, y: 940, s: 0.95, look: L.rich, pose: 'shrug', expr: 'smirk', id: 7600 });
      H.prop(D, S.w('NEEDS a loan'), 'moneybag', 620, 760, 0.7);
      H.guy(D, S, S.w('NEEDS a loan') + 0.2, { x: 1480, y: 940, s: 0.95, look: L.regular, pose: D.t > S.w('crisis') ? 'cheeks' : 'holdR', expr: D.t > S.w('crisis') ? 'fear' : 'worried', id: 7640 });
      H.prop(D, S.w('NEEDS a loan') + 0.2, 'doc', 1660, 660, 0.7, { title: 'LOAN', lines: 3, id: 7680 });
      H.prop(D, S.w('700'), 'doc', 960, 520, 1.2, { title: 'INSURANCE', amount: '$700/mo', amountColor: '#d32f2f', lines: 2, id: 7700 });
      H.label(D, S.w('rounding error'), '"rounding error"', 420, 330, { size: 52, color: '#2e7d32', font: 'Kalam', weight: 'bold' });
      H.label(D, S.w('crisis'), 'CRISIS!', 1480, 330, { size: 72, color: '#d32f2f', font: 'Permanent Marker' });
    });

    // ===================== P45 ==================================================
    shot('Which brings us back', (D, S, H) => {
      H.fl(D, S.t0, { x: 1250, y: 400, s: 0.85 });
      const k = D.inK(S.t0, 2, ease.out); P.draw(D, 'truck', lerp(300, 900, k), 780, 0.8, { text: 'MOVING' });
      H.M(D, S, { x: 330, pose: 'presentR', expr: 'calm' });
    });

    // ===================== P46 ==================================================
    shot('In 2022, net domestic migration', (D, S, H) => {
      H.label(D, S.t0, 'NET DOMESTIC MIGRATION', 960, 100, { size: 64, font: 'Permanent Marker', color: '#1565c0' });
      H.arrow(D, S.w('moving in'), 300, 260, 600, 260, { w: 12, color: '#2e7d32' });
      H.label(D, S.w('moving in'), 'moved in', 450, 210, { size: 42 });
      H.arrow(D, S.w('moving out'), 600, 340, 300, 340, { w: 12, color: '#d32f2f' });
      H.label(D, S.w('moving out'), 'moved out', 450, 395, { size: 42 });
      H.bars(D, { x: 1200, y: 880, w: 1100, h: 480, max: 330000, lsize: 38, vsize: 40, items: [
        { label: '2022', v: 311000, txt: '311K', color: '#2e7d32', at: S.w('311,000') },
        { label: '2023', v: 184000, txt: '184K', color: '#7cb342', at: S.w('184,000') },
        { label: '2024', v: 58000, txt: '58K', color: '#fbc02d', at: S.w('58,000') },
        { label: '2025', v: 22517, txt: '22.5K', color: '#d32f2f', at: S.w('22,517') }] });
    });

    shot('Florida went from the top', (D, S, H) => {
      for (let i = 0; i < 8; i++) { const y = 150 + i * 92; D.rect(700, y, 520, 76, { fill: i === 7 && D.t > S.w('eighth') ? '#ffcc80' : '#f5f5f5', w: 4, id: 7800 + i, amp: 0.8 }); D.text('#' + (i + 1), 750, y + 40, { size: 42, font: 'Permanent Marker' }); }
      const fy = lerp(150, 150 + 7 * 92, D.inK(S.w('eighth'), 0.8, ease.inOut));
      H.label(D, S.t0, 'FLORIDA', 980, fy + 40, { size: 48, font: 'Permanent Marker', color: '#ef6c00' });
      H.M(D, S, { x: 330, pose: [[0, 'pointUp'], [S.w('eighth'), 'pointRlow']], expr: 'surprise' });
      H.label(D, S.t0, 'domestic migration rank', 1550, 200, { size: 44, color: '#555' });
    });

    shot("Redfin found Tampa's", (D, S, H) => {
      H.fl(D, S.t0, { x: 620, y: 350, s: 1.15, pins: [{ city: 'Tampa', at: S.w('Tampa'), label: 'Tampa -70%', side: -1, size: 48 }, { city: 'Orlando', at: S.w('Orlando'), label: 'Orlando ~0', side: 1, size: 48 }] });
      H.label(D, S.w('inflow'), 'people moving in from other states', 1450, 820, { size: 46 });
      H.label(D, S.w('single year'), '(in a single year, per Redfin)', 1450, 880, { size: 40, color: '#777' });
    });

    // ===================== P47 ==================================================
    shot('The state is still growing', (D, S, H) => {
      H.prop(D, S.w('other countries'), 'plane', 1250, 300, 1.4, { slideFrom: [2300, 200] });
      H.prop(D, S.w('other countries'), 'globe', 1650, 640, 1);
      H.lineChart(D, S.t0, { x: 640, y: 520, w: 700, h: 360, title: 'Florida population', data: [80, 86, 92, 96, 98, 99], min: 70, max: 105, color: '#2e7d32', xl: ['', '', '', '', 'now'], dur: 1 });
      H.label(D, S.w('mostly because'), 'still growing, mostly from abroad', 1350, 860, { size: 50, font: 'Kalam', weight: 'bold' });
    });

    shot('And the people still coming', (D, S, H) => {
      H.guy(D, S, S.t0, { x: 520, y: 920, s: 1.05, look: L.retM, pose: 'wave', expr: 'happy', id: 7900 });
      [['older', S.w('older')], ['earn more', S.w('earn more')], ['already own a home', S.w('already own')]].forEach(([t, at], i) => { H.label(D, at, t, 1050, 320 + i * 150, { size: 70, font: 'Kalam', weight: 'bold', align: 'left' }); H.check(D, at + 0.1, 990, 320 + i * 150, 34); });
      H.prop(D, S.w('already own'), 'house', 1650, 760, 0.8, { id: 7950 });
    });

    shot('The Florida Chamber Foundation', (D, S, H) => {
      H.card(D, S.t0, { x: 860, y: 330, w: 1000, title: 'Florida Chamber Foundation', body: ['Slowing migration "isn\'t a red flag."'], hl: [[0, S.w('red flag')]] });
      H.prop(D, S.w('red flag'), 'flag', 1500, 650, 1.3);
      H.cross(D, S.w('red flag') + 0.3, 1560, 560, 90);
      H.M(D, S, { x: 400, pose: [[0, 'presentR'], [S.w('maybe it'), 'shrug']], expr: [[0, 'calm'], [S.w('maybe it'), 'smirk']] });
    });

    // ===================== P48 ==================================================
    shot('But think about who that leaves out', (D, S, H) => {
      const left = S.w('sitting on the market');
      H.prop(D, S.w('starter homes'), 'house', 1350, 600, 1, { sign: 'FOR SALE', id: 8000 });
      H.prop(D, S.w('entry-level condos'), 'condo', 1720, 760, 0.8, { floors: 9, w: 160, id: 8050 });
      H.guy(D, S, S.w('younger workers'), { x: 420, y: 920, s: 0.9, look: L.young1, expr: D.t > left ? 'sad' : 'neutral', id: 8100, walkTo: -300, walkAt: left + 0.2, walkDur: 2, flipBase: false });
      H.guy(D, S, S.w('families'), { x: 640, y: 920, s: 0.9, look: L.young2, expr: D.t > left ? 'sad' : 'neutral', id: 8140, walkTo: -300, walkAt: left + 0.3, walkDur: 2.1 });
      H.guy(D, S, S.w('families') + 0.1, { x: 820, y: 920, s: 0.65, look: L.kid, expr: 'neutral', id: 8180, walkTo: -300, walkAt: left + 0.35, walkDur: 2.1 });
      H.card(D, S.t0, { x: 960, y: 170, w: 1100, tsize: 40, title: 'Florida Realtors research', body: ['Affordability is reshaping who moves in and out'], hl: [[0, S.w('affordability')]] });
    });

    // ===================== P49 ==================================================
    shot('And a housing market that got priced', (D, S, H) => {
      H.crowd(D, S.w('1,640'), 30, 260, 360, { cols: 10, dx: 60, dy: 115, stagger: 0.02, s: 1.1, fill: '#c8e6c9' });
      H.big(D, S.w('1,640'), '1,640/day', 560, 200, { size: 90, color: '#2e7d32' });
      H.crowd(D, S.w('551'), 10, 1100, 360, { cols: 10, dx: 60, stagger: 0.04, s: 1.1, fill: '#ffcdd2' });
      H.big(D, S.w('551'), '~551/day', 1370, 200, { size: 90, color: '#d32f2f' });
      H.big(D, S.w('VERY'), 'VERY DIFFERENT', 960, 780, { size: 90, color: '#151515' });
    });

    shot('Miami-Dade and Pinellas', (D, S, H) => {
      H.fl(D, S.t0, { x: 620, y: 350, s: 1.15, pins: [{ city: 'Pinellas', at: S.w('Pinellas'), label: 'Pinellas', side: -1, size: 48 }, { city: 'Miami-Dade', at: S.t0 + 0.2, label: 'Miami-Dade', side: -1, size: 48 }] });
      H.big(D, S.w('largest population declines'), 'TOP 3 POPULATION DROPS', 1420, 330, { size: 64, color: '#d32f2f' });
      H.label(D, S.w('United States'), 'of any U.S. county (mid-2024 to mid-2025)', 1420, 430, { size: 40 });
      H.prop(D, S.w('declines'), 'arrowBig', 1420, 650, 1.2, { dir: 'down' });
    });

    // ===================== P50 ==================================================
    shot('And now... the one thing', (D, S, H) => {
      const fed = S.w('Fed raised');
      H.lineChart(D, S.w('Mortgage rates dipped'), { x: 820, y: 470, w: 1000, h: 420, title: 'Mortgage rates this year', data: [7.0, 6.7, 6.4, 6.3, 6.5, 6.9, 7.2, 7.3], min: 5.8, max: 7.6, color: '#d32f2f', xl: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'], dur: 2.8,
        after: (D2, pts) => { D2.line(pts[0][0], pts[0][1] - 0, pts[7][0], pts[0][1], { w: 3, color: '#999', id: 8201 }); D2.text('7%', pts[7][0] + 40, pts[0][1], { size: 34, color: '#999' }); H.ring(D2, S.w('back over 7%'), pts[7][0], pts[7][1], 40, 34); } });
      H.prop(D, fed, 'fed', 1600, 340, 0.9);
      H.prop(D, fed + 0.2, 'calendar', 1600, 680, 0.8, { month: 'SEP', day: '16' });
      H.label(D, S.w('buyers started'), 'buyers came back...', 600, 870, { size: 46, color: '#2e7d32' });
    });

    shot('In October, single-family home sales', (D, S, H) => {
      H.bars(D, { x: 820, y: 860, w: 900, h: 500, max: 18, title: 'Florida single-family, Oct (year over year)', tsize: 42, items: [{ label: 'Closed sales', v: 10.1, txt: '-10.1%', color: '#ef5350', at: S.w('10.1%') }, { label: 'New pending sales', v: 16, txt: '~-16%', color: '#c62828', at: S.w('16%') }] });
      for (let i = 0; i < 3; i++) { H.prop(D, S.w('three straight') + i * 0.15, 'calendar', 1500 + (i % 3) * 140, 380, 0.65, { month: ['AUG', 'SEP', 'OCT'][i], day: 'DOWN', daySize: 34 }); }
      H.label(D, S.w('three straight'), '3 straight months down', 1640, 560, { size: 44, color: '#d32f2f' });
    });

    // ===================== P51 ==================================================
    shot('The president of Florida Realtors', (D, S, H) => {
      H.prop(D, S.t0, 'podium', 520, 800, 1.2);
      H.guy(D, S, S.t0, { x: 520, y: 700, s: 0.75, look: L.exec, pose: 'wave', expr: 'happy', id: 8300 });
      H.prop(D, S.w('continue to hold up'), 'bubble', 1200, 330, 1.15, { text: ['"continue to hold up', 'remarkably well"'], tx: -340, ty: 120 });
      H.label(D, S.t0, 'Florida Realtors president', 520, 980 - 60, { size: 40, color: '#555' });
      H.check(D, S.w("that's true"), 1500, 650, 50);
      H.label(D, S.w("that's true"), 'true, statewide', 1500, 750, { size: 50 });
    });

    shot('But look at WHY', (D, S, H) => {
      const signs = 10;
      for (let i = 0; i < signs; i++) { const gone = i >= 9 && D.t > S.w('6.5%'); if (gone) continue; H.prop(D, S.w('listings') + i * 0.04, 'signPost', 260 + i * 150, 560, 0.75, { text: 'SALE' }); }
      H.big(D, S.w('6.5%'), '-6.5% listings', 960, 180, { size: 100, color: '#d32f2f' });
      H.label(D, S.w('fewer homes'), 'Prices hold because supply shrank...', 960, 790, { size: 52, font: 'Kalam', weight: 'bold' });
      H.label(D, S.w('not because'), '...not because demand grew', 960, 860, { size: 52, font: 'Kalam', weight: 'bold', color: '#d32f2f' });
    });

    // ===================== P52 ==================================================
    shot("Meanwhile, the state's biggest", (D, S, H) => {
      H.prop(D, S.w('November 3rd'), 'calendar', 1650, 300, 1, { month: 'NOV', day: '3' });
      H.prop(D, S.w('Amendment 3'), 'ballot', 1100, 640, 1.5);
      H.label(D, S.w('Amendment 3'), 'AMENDMENT 3', 1100, 290, { size: 70, font: 'Permanent Marker', color: '#1565c0' });
      H.prop(D, S.w('60%'), 'pie', 1650, 700, 0.9, { frac: 0.6, color: '#1565c0', text: '60%', size: 50 });
      H.label(D, S.w('supermajority'), 'supermajority needed', 1650, 850, { size: 40 });
      H.M(D, S, { x: 380, pose: 'scratch', expr: 'confused', fx: 'question' });
    });

    shot('Starting January 1st', (D, S, H) => {
      H.prop(D, S.t0, 'calendar', 320, 330, 1.1, { month: 'JAN', day: '1' });
      H.prop(D, S.w('homestead'), 'shield', 820, 470, 1.6, { text: '$150K', size: 46 });
      H.label(D, S.w('homestead'), 'homestead exemption', 820, 700, { size: 48, font: 'Kalam', weight: 'bold' });
      H.label(D, S.w('non-school'), '(non-school property taxes)', 820, 760, { size: 38, color: '#777' });
      const items = [['second homes', 'house'], ['rentals', 'condo'], ['businesses', 'office']];
      items.forEach(([t, pr], i) => { const at = S.w(t.split(' ')[0]); H.prop(D, at, pr, 1260 + i * 220, 560, pr === 'condo' ? 0.4 : 0.55, { id: 8400 + i * 40, floors: 6, w: 120 }); H.label(D, at, t, 1260 + i * 220, 650, { size: 36 }); });
      H.big(D, S.w('cut in half'), 'CAP CUT IN HALF', 1480, 240, { size: 70, color: '#ef6c00' });
    });

    // ===================== P53 ==================================================
    shot('Supporters say it gives', (D, S, H) => {
      const t1 = S.t0, t2 = S.w('Local officials'), t3 = S.w('demographers');
      H.guy(D, S, t1, { x: 330, y: 820, s: 0.8, look: L.young1, pose: 'up', expr: 'grin', id: 8500 });
      H.label(D, t1, 'SUPPORTERS', 330, 200, { size: 50, font: 'Permanent Marker', color: '#2e7d32' });
      H.label(D, S.w('real relief'), '"real relief"', 330, 270, { size: 44 });
      H.guy(D, S, t2, { x: 960, y: 820, s: 0.8, look: L.official, pose: 'stop' in C.SPOSE ? 'point' : 'point', expr: 'worried', id: 8540 });
      H.label(D, t2, 'LOCAL OFFICIALS', 960, 200, { size: 50, font: 'Permanent Marker', color: '#d32f2f' });
      H.label(D, S.w('lost revenue'), 'lost revenue: service cuts', 960, 270, { size: 40 });
      H.label(D, S.w('higher tax rates'), 'or higher tax rates', 960, 320, { size: 40 });
      H.guy(D, S, t3, { x: 1590, y: 820, s: 0.8, look: L.demog, pose: 'think', expr: 'serious', id: 8580 });
      H.label(D, t3, 'DEMOGRAPHERS', 1590, 200, { size: 50, font: 'Permanent Marker', color: '#1565c0' });
      H.label(D, S.w('population growth'), 'relies on growth...', 1590, 270, { size: 40 });
      H.label(D, S.w('slowed dramatically'), '...that already slowed', 1590, 320, { size: 40, color: '#d32f2f' });
      D.line(645, 180, 645, 900, { w: 3, color: '#ddd', id: 8600 }); D.line(1275, 180, 1275, 900, { w: 3, color: '#ddd', id: 8601 });
    });

    // ===================== P54 ==================================================
    shot('Either way, notice what it does', (D, S, H) => {
      H.prop(D, S.t0, 'house', 1150, 640, 1.4, { id: 8700 });
      H.guy(D, S, S.w('own the home'), { x: 1500, y: 920, s: 0.85, look: L.owner, pose: 'wave', expr: 'happy', id: 8740 });
      H.prop(D, S.w('STAYING'), 'priceTag', 1150, 300, 1.3, { text: 'STAYING', fill: '#c8e6c9' });
      H.prop(D, S.w('STAYING') + 0.3, 'arrowBig', 1460, 300, 0.7, { dir: 'down', color: '#2e7d32' });
      H.prop(D, S.w('keeping an eye'), 'magnifier', 760, 380, 1);
      H.M(D, S, { x: 400, pose: [[0, 'count'], [S.w('keeping an eye'), 'pointR']], expr: 'confused' });
    });

    // ===================== P55 ==================================================
    shot("So here's what Florida's market", (D, S, H) => {
      const sq = S.w('The people getting squeezed');
      H.label(D, S.w('Most homeowners'), 'FINE', 500, 150, { size: 80, font: 'Permanent Marker', color: '#2e7d32' });
      H.prop(D, S.w('Most homeowners'), 'house', 500, 520, 1.2, { roof: '#43a047', id: 8800 });
      H.prop(D, S.w('cheap mortgage'), 'padlock', 500, 290, 0.6, { text: '3%' });
      H.guy(D, S, S.w('staying put'), { x: 720, y: 900, s: 0.75, look: L.owner2, expr: 'happy', id: 8840 });
      D.line(960, 120, 960, 900, { w: 4, color: '#ddd', id: 8850 });
      H.label(D, sq, 'SQUEEZED', 1420, 150, { size: 80, font: 'Permanent Marker', color: '#d32f2f' });
      H.guy(D, S, S.w('condo owners'), { x: 1200, y: 900, s: 0.75, look: L.condoF, pose: 'cheeks', expr: 'fear', id: 8880 });
      H.prop(D, S.w('assessments'), 'doc', 1220, 470, 0.9, { title: 'ASSESSMENT', amount: '$$$$', amountColor: '#d32f2f', lines: 2, id: 8920 });
      H.guy(D, S, S.w('recent buyers'), { x: 1640, y: 900, s: 0.75, look: L.young2, pose: 'sad', expr: 'sad', id: 8960 });
      H.prop(D, S.w('near the peak'), 'house', 1660, 480, 0.7, { id: 9000 });
      if (D.t > S.w('near the peak')) P.draw(D, 'waves', 1660, 470, 1, { w: 260, h: 70 });
    });

    // ===================== P56 ==================================================
    shot('And the reason this matters outside', (D, S, H) => {
      H.M(D, S, { x: 420, pose: [[0, 'presentR'], [S.w('none of these'), 'stop']], expr: 'happy' });
      if (D.t > S.w('none of these')) { D.push(1200, 450, D.popK(S.w('none of these')), -0.15); D.rect(-380, -80, 760, 160, { fill: '#fff', w: 9, color: '#d32f2f', id: 9100 }); D.text('NOT JUST FLORIDA', 0, 6, { size: 80, font: 'Permanent Marker', color: '#d32f2f' }); D.pop(); }
    });

    shot('Insurance premiums in Nebraska', (D, S, H) => {
      H.card(D, S.t0, { x: 380, y: 420, w: 560, tsize: 42, bsize: 40, title: 'Nebraska', body: ['Insurance premiums +21% this year'], hl: [[0, S.w('21%')]] });
      H.card(D, S.w('condo reserve rules'), { x: 960, y: 420, w: 560, tsize: 42, bsize: 40, title: 'Fannie Mae condo rules', body: ['Apply to the WHOLE country'], hl: [[0, S.w('WHOLE')]] });
      H.card(D, S.w('Foreclosure filings nationwide'), { x: 1540, y: 420, w: 560, tsize: 42, bsize: 40, title: 'Foreclosures (U.S.)', body: ['Filings up 21% in the first half'], hl: [[0, S.w('first half')]] });
    });

    shot('Florida just got all of it first', (D, S, H) => {
      H.fl(D, S.t0, { x: 900, y: 460, s: 1 });
      const docs = ['INSURANCE', 'HOA', 'ASSESSMENT', 'RATES', 'RESERVES'];
      docs.forEach((t, i) => { const at = S.w('all at the same time') - 0.4 + i * 0.12; if (D.t > at) P.draw(D, 'doc', 600 + i * 190, lerp(-200, 380 + (i % 2) * 90, D.inK(at, 0.5, ease.outBack)), 0.7, { title: t, lines: 2, id: 9200 + i * 10 }); });
      H.big(D, S.w('first'), 'FIRST', 1600, 200, { size: 100, color: '#ef6c00' });
      H.big(D, S.w('same time'), 'ALL AT ONCE', 1550, 820, { size: 80, color: '#d32f2f' });
    });

    // ===================== P57 ==================================================
    shot('For years, the story of American', (D, S, H) => {
      for (let i = 0; i < 3; i++) { H.prop(D, S.t0 + i * 0.1, 'house', 420 + i * 300, 560, 0.9, { id: 9300 + i * 20, roof: ['#5c6bc0', '#26a69a', '#8d6e63'][i] }); H.guy(D, S, S.t0 + 0.2 + i * 0.1, { x: 520 + i * 300, y: 840, s: 0.55, look: [L.board3, L.board1, L.prev1][i], sit: false, expr: 'happy', id: 9360 + i * 40 }); }
      H.big(D, S.w('HAS'), 'NOBODY HAS TO SELL', 820, 150, { size: 80, color: '#151515' });
      H.lineChart(D, S.w('prices never'), { x: 1500, y: 560, w: 520, h: 280, title: 'Prices', data: [50, 55, 60, 66, 72, 76], min: 30, max: 90, color: '#2e7d32', xl: ['', '', 'now'], dur: 0.8 });
    });

    // ===================== P58 ==================================================
    shot('Florida is what it looks like', (D, S, H) => {
      H.bg(D, '#f3efe6');
      H.fl(D, S.t0, { x: 1150, y: 430, s: 0.95, label: false });
      for (let i = 0; i < 7; i++) { const c = ['Tampa', 'Orlando', 'Miami', 'Cape Coral', 'Jacksonville', 'Punta Gorda', 'Lakeland'][i]; if (D.t > S.w('finally have to') + i * 0.1) { const [x, y] = P.flCity(c); D.push(1150 + x * 0.95, 430 + y * 0.95, D.popK(S.w('finally have to') + i * 0.1) * 0.45); P.signPost(D, { text: 'SALE' }); D.pop(); } }
      H.M(D, S, { x: 400, pose: [[0, 'presentR'], [S.w('finally have to'), 'pointR']], expr: 'serious' });
    });

    shot('And the bill that forced', (D, S, H) => {
      H.bg(D, '#f3efe6');
      H.prop(D, S.t0, 'envelope', 1200, 440, 2.1, { to: D.t > S.w("everyone else's") ? ['To: Everyone Else', 'Anytown, USA'] : ['To: Florida'], size: 32 });
      H.M(D, S, { x: 400, pose: [[0, 'presentR'], [S.w("everyone else's"), 'pointR']], expr: 'serious' });
      H.big(D, S.w('address'), "YOU'RE NEXT?", 1200, 830, { size: 80, color: '#d32f2f' });
    }, { z1: 1.06 });
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = add; else add(root.__SHOT_API);
})(typeof window !== 'undefined' ? window : globalThis);

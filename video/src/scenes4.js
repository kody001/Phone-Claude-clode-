// PART 4: ROME + ENDING
'use strict';
const PIN_RO = medP(12.5, 41.9);
shot({ at: 'Now, Greek medicine spread everywhere', bg: 'map_med', mus: 'rome', trans: 'zoom', vig: 0.4,
  cam: [[0, 1.3, 0, -80], ['including Rome', 1.8, PIN_RO[0] - W / 2, PIN_RO[1] - H / 2, E.io, 1.0]],
  draw: (c, st) => {
    const t0 = at(st, 'spread everywhere');
    [[12.5, 41.9], [5.4, 43.3], [15.1, 37.3], [30.0, 31.2], [35.5, 33.9], [27.1, 38.4]].forEach((p, i) => { const q = medP(p[0], p[1]); arrow(c, PIN_GR[0], PIN_GR[1], q[0], q[1], { p: prog(st.t, t0 + i * 0.12, 0.5), color: '#fff', lw: 7, bend: 40 }); });
    cue('swoosh', t0, 0.6);
    label(c, st, 'ROME', PIN_RO[0], PIN_RO[1] - 60, 'including Rome', { size: 50, fill: '#ffd23f' });
    if (after(st, 'could not stand')) { glow(c, PIN_RO[0], PIN_RO[1], 160, 'rgba(255,60,40,0.7)'); mark(c, st, '!', PIN_RO[0] + 70, PIN_RO[1] - 110, at(st, 'could not stand'), { size: 90 }); }
  } });

shot({ at: 'Meet Marcus Porcius Cato', bg: 'v_red', trans: 'whip', sfx: [['dun_dun', 'Cato the Elder', 0.8]],
  draw: (c, st) => {
    ch(c, st, 'cato', { x: 480, y: 1180, s: 1.75, face: 'angry', enter: [0, 'left'], hold: { L: 'cabbage' }, pose: 'carry' });
    nameCard(c, st, 'MARCUS\nPORCIUS CATO', 'Marcus Porcius', { x: 1290, y: 400, size: 116 });
    popText(c, st, 'a.k.a. CATO THE ELDER', 1290, 760, at(st, 'Cato the Elder'), { size: 66, fill: '#fff', anim: 'rise', sfx: 'swoosh_up' });
  } });

shot({ at: 'Picture a stick figure in a toga', bg: 'farm', amb: 'farm', trans: 'cut', sfx: [['whistle_ref', 'like a football', 0.8]],
  cam: [[0, 1, 0, 0], ['permanent frown', 1.7, 0, 60, E.io, 0.6], ['farmer', 1.5, 0, 40, E.io, 0.4], ['head of cabbage', 1.0, 0, 0, E.io, 0.6]],
  draw: (c, st) => {
    ch(c, st, 'cato', { x: 960, y: 1000, s: 1.25, face: 'angry', pose: 'carry', hold: { R: 'cabbage' } });
    label(c, st, 'TOGA', 560, 760, 'in a toga', { size: 58, fill: '#fff', ax: 860, ay: 800 });
    label(c, st, 'PERMANENT FROWN', 960, 400, 'permanent frown', { size: 48, fill: '#ff6b3a' });
    label(c, st, "FARMER'S TAN", 1240, 470, "farmer's tan", { size: 46, fill: '#ffd23f' });
    label(c, st, 'CABBAGE', 1500, 600, 'head of cabbage', { size: 60, fill: '#7ee05a', ax: 1110, ay: 760 });
    popText(c, st, '...LIKE A FOOTBALL', 1400, 360, at(st, 'like a football'), { size: 64, anim: 'pop', sfx: false });
  } });

shot({ at: 'Born in 234 BC', bg: 'rome', amb: 'city_old', trans: 'whip', sfx: [['ding', 'consul', 0.6], ['ding', 'censor', 0.7]],
  draw: (c, st) => {
    yearSlam(c, st, 'BORN 234 BC', '234', { x: 380, y: 140, size: 80 });
    prop(c, st, 'ladder', 1200, 1000, { s: 1.0 });
    const lvl = after(st, 'censor') ? 2 : after(st, 'consul') ? 1 : 0;
    ch(c, st, 'cato', { x: 1200, y: 980 - lvl * 220, s: 0.9, face: lvl === 2 ? 'smug' : 'angry', pose: 'armsUp', hops: ['consul', 'censor'] });
    label(c, st, 'CONSUL', 1450, 700, 'consul', { size: 54, fill: '#fff' });
    label(c, st, 'CENSOR', 1450, 480, 'censor', { size: 54, fill: '#ffd23f' });
    if (after(st, 'morality inspector')) { label(c, st, "ROME'S OFFICIAL\nMORALITY INSPECTOR", 560, 470, 'morality inspector', { size: 60, fill: '#ff6b9a' }); prop(c, st, 'mag', 820, 760, { s: 1.4, rot: -0.3, enter: ['morality inspector', 'pop'] }); }
  } });

shot({ at: 'He was famous for ending speeches', bg: 'curia', amb: 'senate', trans: 'whip', sfx: [['thunder', 'Carthage must be destroyed', 1], ['crowd_murmur', 0.2, 0.3]], shake: [['Carthage must', 0.6, 14, false]], punch: [['Carthage must', 0.1]],
  draw: (c, st) => {
    ['senator', 'roman', 'senator'].forEach((n, i) => ch(c, st, n, { x: 260 + i * 260, y: 1080, s: 0.9, face: after(st, 'Carthage must') ? 'shock' : 'bored', id: 'sen' + i, tremble: after(st, 'Carthage must') }));
    prop(c, st, 'podium', 1300, 1000, { s: 1.2 });
    const yell = after(st, 'Carthage must');
    ch(c, st, 'cato', { x: 1300, y: 900, s: 1.1, flip: true, faces: [[0, 'bored'], ['Carthage must', 'yell']], pose: yell ? 'fists' : 'present', talk: ['Carthage must', 'destroyed'] });
    const topics = [['TOPIC: ROAD REPAIRS', 'whatever'], ['TOPIC: OLIVE PRICES', 'the topic']];
    topics.forEach((tp, i) => { if (after(st, tp[1]) && !yell) label(c, st, tp[0], 960, 150 + i * 90, tp[1], { size: 54, fill: '#fff' }); });
    if (yell) { c.fillStyle = 'rgba(255,60,30,0.18)'; c.fillRect(0, 0, W, H); popText(c, st, 'CARTHAGE MUST\nBE DESTROYED!', 760, 270, at(st, 'Carthage must'), { size: 110, anim: 'slam', sfx: false, fill: '#ff4d3a', wiggle: true }); }
  } });

shot({ at: 'Real fun at parties', bg: 'rome', mus: 'party', trans: 'cut', sfx: [['rec_scratch', 'this guy', 0.8]],
  draw: (c, st) => {
    c.fillStyle = 'rgba(40,10,80,0.45)'; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 12; i++) { const a = st.t * 2 + i; c.fillStyle = `hsla(${i * 30},90%,60%,0.25)`; c.beginPath(); c.arc(960 + Math.cos(a) * 700, 300 + Math.sin(a * 1.3) * 200, 120, 0, TAU); c.fill(); }
    const stop = after(st, 'this guy');
    [['roman', 380], ['greekw', 700], ['romanb', 1040]].forEach((r, i) => ch(c, st, r[0], { x: r[1], y: GY, s: 1.0, face: stop ? 'bored' : 'laugh', pose: stop ? 'idle' : (Math.floor(st.t * 4 + i) % 2 ? 'armsUp' : 'cheer'), hops: stop ? [] : [0.2 + i * 0.15, 0.8 + i * 0.15], id: 'party' + i, after: (cc, info) => { cc.save(); cc.translate(0, info.hy - 90); drawProp(cc, st, 'partyhat', { color: ['#e74c3c', '#3498db', '#f1c40f'][i] }); cc.restore(); } }));
    ch(c, st, 'cato', { x: 1560, y: GY, s: 1.1, flip: true, face: 'angry', pose: 'carry', hold: { R: 'cabbage' } });
    label(c, st, 'THE LIFE OF THE PARTY', 1560, 300, 'this guy', { size: 52, fill: '#ffd23f', ax: 1560, ay: 460 });
  } });

shot({ at: 'Cato had a second enemy', bg: 'parchment', mus: 'rome', trans: 'whip', sfx: [['scribble', 'Greek doctors', 0.6]],
  draw: (c, st) => {
    ch(c, st, 'cato', { x: 380, y: 1150, s: 1.6, face: 'furious', pose: 'point' });
    popText(c, st, "CATO'S ENEMIES", 1200, 160, at(st, 'second enemy'), { size: 90, anim: 'rise', sfx: 'swoosh_up', fill: '#e0262d' });
    popText(c, st, '#1  CARTHAGE', 1200, 380, at(st, 'second enemy') + 0.3, { size: 80, sfx: 'thud', anim: 'slam', fill: INK, lw: 0, shadow: false });
    popText(c, st, '#2  GREEK DOCTORS', 1200, 560, at(st, 'Greek doctors'), { size: 80, sfx: 'thud', anim: 'slam', fill: INK, lw: 0, shadow: false });
    if (after(st, 'Greek doctors')) ch(c, st, 'greek', { x: 1200, y: 1060, s: 0.95, face: 'nervous', enter: ['Greek doctors', 'up'], pre: { acc: ['stetho'] } });
  } });

shot({ at: 'In a letter to his son', bg: 'study', amb: 'study', trans: 'whip', sfx: [['quill', 'letter', 0.7]],
  draw: (c, st) => {
    prop(c, st, 'table', 1000, 1010, { s: 1.3 });
    rrect(c, 820, 720, 560, 220, 8, { fill: '#efe0b6', lw: 6 });
    typeText(c, st, 'Dear son,\nAbout those Greeks...', 850, 800, at(st, 'letter') + 0.2, { size: 42, cps: 14, sfx: false });
    ch(c, st, 'cato', { x: 560, y: GY, s: 1.15, face: 'angry', pose: [[10, 6], [40, -40]], hold: { R: 'quill' } });
    label(c, st, 'QUOTED LATER BY PLINY', 1200, 200, 'Pliny', { size: 56, fill: '#ffd23f' });
  } });

shot({ at: 'Cato claimed the Greeks had sworn', bg: 'v_brown', mus: 'conspiracy', trans: 'whip', sfx: [['tension_hit', 'sworn to kill', 0.9], ['coins', 'charged fees', 0.8]],
  draw: (c, st) => {
    rrect(c, 160, 180, 1600, 700, 12, { fill: '#b98a56', lw: 9 });
    const pins = [[420, 360, 'greek'], [1000, 320, 'pill'], [1500, 390, 'roman'], [760, 690, 'coin'], [1330, 700, 'cato']];
    const tp = at(st, 'sworn to kill');
    for (let i = 0; i < pins.length - 1; i++) { const a = pins[i], b = pins[i + 1]; const p = prog(st.t, tp + i * 0.25, 0.3); if (p > 0) line(c, [[a[0], a[1]], [lerp(a[0], b[0], p), lerp(a[1], b[1], p)]], { lw: 5, stroke: '#e0262d', amp: 0.5 }); }
    pins.forEach((pn, i) => {
      c.save(); c.translate(pn[0], pn[1]); c.rotate(rr(i, -0.08, 0.08));
      rrect(c, -110, -90, 220, 180, 4, { fill: '#f6f1e4', lw: 5 });
      c.save(); c.beginPath(); c.rect(-100, -80, 200, 160); c.clip();
      if (pn[2] === 'greek') ch(c, st, 'greek', { x: 0, y: 170, s: 0.42, face: 'smug', noShadow: true, pre: { acc: ['stetho'] } });
      if (pn[2] === 'roman') ch(c, st, 'roman', { x: 0, y: 170, s: 0.42, face: 'scared', noShadow: true });
      if (pn[2] === 'cato') ch(c, st, 'cato', { x: 0, y: 170, s: 0.42, face: 'furious', noShadow: true });
      if (pn[2] === 'pill') { c.save(); c.scale(0.8, 0.8); drawProp(c, st, 'jar', { label: false }); c.restore(); }
      if (pn[2] === 'coin') drawProp(c, st, 'shekel', { s: 1.4 });
      c.restore();
      circ(c, 0, -80, 10, { fill: '#e0262d', lw: 4 });
      c.restore();
    });
    popText(c, st, "THEY'VE SWORN TO KILL US ALL!", 960, 100, tp, { size: 76, anim: 'slam', sfx: false, fill: '#ff4d3a' });
    stamp(c, st, '...AND THEY\nCHARGE FEES!', 1520, 780, 'charged fees', { size: 54 });
  } });

shot({ at: 'Then he laid down the law', bg: 'curia', amb: 'senate', mus: 'rome', trans: 'cut', sfx: [['gavel', 'the law', 1], ['stamp', 'with doctors', 0.9]], shake: [['the law', 0.25, 10, false]],
  draw: (c, st) => {
    const g = after(st, 'the law') ? 0 : -0.9;
    ch(c, st, 'cato', { x: 1150, y: GY, s: 1.35, flip: true, faces: [[0, 'angry'], ['I forbid', 'yell']], pose: after(st, 'I forbid') ? 'point' : [[10, 6], [120, 150 + g * 40]], hold: { R: after(st, 'I forbid') ? null : ['gavel', { swing: g }] }, talk: ['I forbid', 'with doctors'] });
    ch(c, st, 'marcus', { x: 520, y: GY, s: 0.95, face: after(st, 'I forbid') ? 'scared' : 'neutral', tremble: after(st, 'I forbid') });
    label(c, st, 'HIS SON', 520, 430, 'his son', { size: 50, fill: '#fff' });
    stamp(c, st, 'DOCTORS:\nFORBIDDEN', 1460, 260, 'with doctors', { size: 76 });
  } });

shot({ at: 'And you can see his logic', bg: 'v_navy', trans: 'whip', sfx: [['sad_trombone', 'Airtight', 1]],
  draw: (c, st) => {
    ch(c, st, 'cato', { x: 250, y: 1150, s: 1.4, faces: [[0, 'smug'], ['Airtight', 'proud']], pose: 'point' });
    const boxes = [['DOCTORS CHARGE MONEY', 'charge money', 230], ['PEOPLE WHO CHARGE MONEY\nWANT YOUR MONEY', 'People who charge', 470], ['∴ DOCTORS = AN INTERNATIONAL\nMURDER CLUB', 'Therefore', 760]];
    boxes.forEach((b, i) => {
      const t = at(st, b[1]);
      cue('pop', t, 0.6);
      if (st.t < t) return;
      const p = prog(st.t, t, 0.3, E.back);
      c.save(); c.translate(1150, b[2]); c.scale(p, p);
      rrect(c, -560, i === 2 ? -95 : -80, 1120, i === 2 ? 190 : 160, 20, { fill: i === 2 ? '#ffdede' : '#fff', lw: 8 });
      txt(c, b[0], 0, 0, { size: i === 2 ? 56 : 50, fill: INK, lw: 0, shadow: false });
      c.restore();
      if (i > 0) arrow(c, 1150, boxes[i - 1][2] + 85, 1150, b[2] - (i === 2 ? 100 : 85), { p: prog(st.t, t - 0.1, 0.2), color: '#fff', lw: 8 });
    });
    stamp(c, st, 'AIRTIGHT ✓', 1500, 980, 'Airtight', { size: 60, color: '#2fbf4a', rot: -0.08 });
  } });

shot({ at: 'So what did Cato do instead', bg: 'farm', amb: 'farm', trans: 'whip', sfx: [['ta_da', 'became the doctor', 0.9], ['paper_in', 'notebook', 0.7]],
  draw: (c, st) => {
    const doc = after(st, 'became the doctor');
    ch(c, st, 'cato', { x: 720, y: GY, s: 1.25, faces: [[0, 'confused'], ['became the doctor', 'proud']], pose: after(st, 'notebook') ? 'hold' : 'hips', hold: { R: after(st, 'notebook') ? 'notebook' : null }, pre: doc ? { acc: ['tan', 'stetho'] } : {} });
    if (doc) sparkles(c, 520, 380, 400, 300, st.t, 5);
    popText(c, st, 'DR. CATO', 720, 180, at(st, 'became the doctor'), { size: 110, anim: 'slam', sfx: 'impact' });
    if (after(st, 'whole household')) ['catowife', 'marcus', 'romanb'].forEach((n, i) => ch(c, st, n, { x: 1180 + i * 240, y: GY, s: 0.9, face: 'nervous', enter: [at(st, 'whole household') - st.s.start + i * 0.15, 'right'], id: 'hh' + i }));
    label(c, st, 'NOTEBOOK OF REMEDIES', 1450, 300, 'notebook', { size: 54, fill: '#ffd23f' });
  } });

shot({ at: "Sick people didn't fast", bg: 'farm', amb: 'farm', trans: 'cut', sfx: [['plop', 'greens', 0.7], ['quack', 'duck', 0.8], ['coo', 'pigeon', 0.7], ['boing', 'hare', 0.6], ['harp', 'weird dreams', 0.7]],
  draw: (c, st) => {
    prop(c, st, 'bed', 760, 980, { s: 1.0 });
    const dream = after(st, 'weird dreams');
    ch(c, st, 'you', { x: 600, y: 900, s: 0.95, faces: [[0, 'sad'], ['greens', 'neutral'], ['weird dreams', 'sleep']], lie: true, green: !dream, id: 'you' });
    ch(c, st, 'cato', { x: 1420, y: GY, s: 1.15, flip: true, faces: [[0, 'serious'], ['it was great', 'proud']], pose: after(st, 'it was great') ? 'cheer' : 'hold', hold: { R: dream ? null : 'plate' } });
    if (!dream) [['bowl', 'greens', 1200], ['duck', 'duck', 1290], ['pigeon', 'pigeon', 1370], ['hare', 'hare', 1450]].forEach(f => { if (after(st, f[1])) prop(c, st, f[0], f[2] - 120, 560, { s: 0.55, enter: [f[1], 'drop'] }); });
    if (dream) {
      const p = pr_(st, 'weird dreams', 0.4, E.back);
      c.save(); c.translate(820, 420); c.scale(p, p); thoughtCloud(c, 0, 0, 640, 380, -220, 300, 6);
      prop(c, st, 'duck', -160 + Math.sin(st.t * 3) * 30, -20, { s: 1.0, rot: Math.sin(st.t * 4) * 0.4 });
      prop(c, st, 'cabbage', 120, 10 + Math.cos(st.t * 3) * 30, { s: 0.9, face: true, rot: st.t });
      c.restore();
    }
    label(c, st, 'NO FASTING', 760, 160, "didn't fast", { size: 60, fill: '#fff' });
    if (after(st, 'it was great')) popText(c, st, '"IT\'S GREAT!"', 1420, 300, at(st, 'it was great'), { size: 76, anim: 'pop', sfx: false });
  } });

shot({ at: 'And then there was the cabbage', bg: 'v_green', mus: 'cabbage', trans: 'zoom', sfx: [['choir', 'the cabbage', 1], ['ding', 'greatest vegetable', 0.8]],
  draw: (c, st) => {
    rays(c, st.t, 'rgba(255,255,255,0.15)');
    glow(c, 640, 520, 500, 'rgba(255,255,200,0.45)');
    prop(c, st, 'cabbage', 640, 560, { s: 3.2, enter: ['the cabbage', 'drop'], bob: 10 });
    if (after(st, 'crowns cabbage')) prop(c, st, 'crown', 640, 300, { s: 1.6, enter: ['crowns cabbage', 'drop'] });
    label(c, st, 'THE GREATEST VEGETABLE', 640, 150, 'greatest vegetable', { size: 60, fill: '#ffd23f' });
    const fixes = [['WOUNDS', 'wounds'], ['ULCERS', 'ulcers'], ['BRUISES', 'bruises'], ['HEADACHES', 'headaches']];
    popText(c, st, 'IT FIXES:', 1400, 230, at(st, 'what it fixes'), { size: 76, anim: 'rise', sfx: 'swoosh_up', fill: '#fff' });
    fixes.forEach((f, i) => { popText(c, st, '✓ ' + f[0], 1400, 380 + i * 140, at(st, f[1]), { size: 76, anim: 'slam', sfx: 'thud' }); });
  } });

shot({ at: 'He even says eat raw cabbage', bg: 'rome', amb: 'feast', trans: 'whip', sfx: [['crunch', 'raw cabbage', 0.9], ['gulp', 'drink as much', 0.9], ['gulp', 'as you like', 0.8]],
  draw: (c, st) => {
    c.fillStyle = 'rgba(80,30,10,0.3)'; c.fillRect(0, 0, W, H);
    prop(c, st, 'table', 960, 1020, { s: 1.6, color: '#8a5a2b' });
    const drink = after(st, 'drink as much');
    ch(c, st, 'cato', { x: 960, y: 1000, s: 1.15, faces: [[0, 'neutral'], ['raw cabbage', 'happy'], ['drink as much', 'laugh']], pose: drink ? [[10, 6], [30, -150]] : [[10, 6], [24, -140]], hold: { R: drink ? 'cup' : 'cabbage' } });
    label(c, st, 'BEFORE DINNER', 420, 260, 'before', { size: 56, fill: '#7ee05a' });
    label(c, st, 'AFTER DINNER', 420, 360, 'after dinner', { size: 56, fill: '#7ee05a' });
    popText(c, st, '= UNLIMITED WINE', 1480, 300, at(st, 'drink as much'), { size: 80, anim: 'slam', sfx: 'impact', fill: '#d14a8a' });
  } });

shot({ at: 'Got a wound', bg: 'v_green', trans: 'flash', mus: 'jingle', off: -0.25, cam: { push: 0.04 },
  draw: (c, st) => {
    rays(c, st.t * 2.5, 'rgba(255,255,255,0.18)', 20);
    const beats = ['Cabbage!', 'Cabbage! Big', 'Cabbage, cabbage', 'cabbage, cabbage!', 'cabbage!'].map((p, i) => { try { return at(st, p); } catch (e) { return st.s.start + 2 + i; } });
    const bounce = Math.abs(Math.sin(st.t * 6.2)) * 30;
    for (let i = 0; i < 7; i++) prop(c, st, 'cabbage', 160 + i * 270, 930 - Math.abs(Math.sin(st.t * 6.2 + i)) * 60, { s: 1.0, face: true, rot: Math.sin(st.t * 6 + i) * 0.2 });
    ch(c, st, 'cato', { x: 960, y: 880 - bounce, s: 1.15, face: 'laugh', pose: Math.floor(st.t * 3) % 2 ? 'armsUp' : 'cheer', hold: { R: 'cabbage' }, talk: true });
    const words = [['GOT A WOUND?', 'Got a wound'], ['CABBAGE!', 'Cabbage!'], ['GOT A BRUISE?', 'Got a bruise'], ['CABBAGE!', 'Cabbage! Big'], ['BIG NIGHT OUT?', 'Big night'], ['CABBAGE!', 'Cabbage, cabbage'], ['CABBAGE!!', 'cabbage, cabbage!'], ['CABBAGE!!!', 'cabbage!']];
    let cur = null;
    for (const w of words) { let t; try { t = at(st, w[1]); } catch (e) { continue; } if (st.t >= t) cur = [w[0], t]; }
    if (cur) popText(c, st, cur[0], 960, 220, cur[1], { size: cur[0].startsWith('CAB') ? 170 : 110, anim: 'slam', sfx: false, fill: cur[0].startsWith('CAB') ? '#b8ff6a' : '#fff', rot: Math.sin(cur[1]) * 0.08 });
  } });

shot({ at: 'You might think it can', bg: 'farm', amb: 'farm', mus: 'rome', trans: 'whip', sfx: [['boing', 'way ahead', 1]],
  draw: (c, st) => {
    ch(c, st, 'you', { x: 700, y: GY, s: 1.2, faces: [[0, 'content'], ['way ahead', 'shock']], pose: after(st, 'way ahead') ? 'scared' : 'hips', id: 'you' });
    popText(c, st, "IT CAN'T GET WEIRDER...", 960, 170, at(st, "can't get weirder"), { size: 80, anim: 'rise', sfx: 'swoosh_up' });
    if (after(st, 'way ahead')) ch(c, st, 'cato', { x: 1260, y: GY, s: 1.2, flip: true, face: 'smug', pose: 'holdUp', hold: { R: 'jar' }, enter: ['Cato is way', 'up', 0.35] });
  } });

shot({ at: "Here's the actual recipe", bg: 'parchment', trans: 'whip', sfx: [['sizzle', 'Heat it up', 0.9]],
  draw: (c, st) => {
    popText(c, st, "CATO'S RECIPE", 960, 120, at(st, 'actual recipe'), { size: 90, anim: 'rise', sfx: 'swoosh_up', fill: '#7a3e1a' });
    const steps = [['1. SAVE THE URINE OF A\n    REGULAR CABBAGE EATER', 'Save the urine'], ['2. HEAT IT UP', 'Heat it up'], ['3. BATHE THE PATIENT IN IT', 'bathe the patient']];
    steps.forEach((s2, i) => popText(c, st, s2[0], 700, 330 + i * 200, at(st, s2[1]), { size: 58, anim: 'rise', sfx: 'thud', fill: INK, lw: 0, shadow: false, align: 'left', sx: 0 }));
    prop(c, st, 'jar', 1680, 330, { s: 1.2, enter: ['Save the urine', 'pop'] });
    if (after(st, 'Heat it up')) { fire(c, 1680, 640, 0.7, st.t); prop(c, st, 'pot', 1680, 560, { s: 0.8 }); }
    if (after(st, 'bathe the patient')) prop(c, st, 'tub', 1680, 840, { s: 0.5, steam: true, enter: ['bathe the patient', 'pop'] });
  } });

shot({ at: 'Cato adds', bg: 'farm', amb: 'farm', trans: 'cut', sfx: [['splash', 0.2, 0.9], ['ding', 'never grow up weak', 0.8]],
  draw: (c, st) => {
    const babies = after(st, 'little babies');
    prop(c, st, 'tub', 760, 1000, { s: 1.3, steam: true });
    if (!babies) ch(c, st, 'you', { x: 760, y: 1060, s: 1.1, face: 'disgust', pose: 'scared', tremble: true, id: 'you' });
    else ch(c, st, 'baby', { x: 760, y: 1000, s: 1.6, face: 'grin', pose: 'fists', hops: ['grow up weak'] });
    prop(c, st, 'tub', 760, 1000, { s: 1.3, steam: false, liquid: '#f2d43a' });
    ch(c, st, 'cato', { x: 1450, y: GY, s: 1.15, flip: true, face: 'proud', pose: 'present' });
    stamp(c, st, 'TESTED ✓', 1450, 260, 'been tested', { size: 90, color: '#2fbf4a' });
    if (after(st, 'grow up weak')) popText(c, st, 'STRONG BABY!', 760, 300, at(st, 'grow up weak'), { size: 90, anim: 'slam', sfx: 'impact' });
  } });

shot({ at: 'Which means somebody in that house', bg: 'farm', amb: 'farm', trans: 'whip', sfx: [['crunch', 'eat cabbage', 0.9], ['crunch', 'all day', 0.8], ['pour', 'pee into a jar', 0.8], ['crickets', 'For the baby', 0.9]],
  draw: (c, st) => {
    const pee = after(st, 'pee into'), baby = after(st, 'For the baby');
    if (!pee) clockIcon(c, 1560, 260, 90, st.t, 30);
    ch(c, st, 'romanb', { x: 820, y: GY, s: 1.2, faces: [[0, 'bored'], ['eat cabbage', 'neutral'], ['pee into', 'nervous'], ['For the baby', 'blank']], pose: pee ? 'hold' : [[10, 6], [24, -140]], hold: { R: pee ? 'jar' : 'cabbage' }, flip: pee && !baby, id: 'cg' });
    label(c, st, 'JOB: CABBAGE GUY', 820, 200, 'had a job', { size: 66, fill: '#ffd23f' });
    if (baby) ch(c, st, 'baby', { x: 1340, y: GY, s: 1.1, face: 'happy', enter: ['For the baby', 'right'] });
  } });

shot({ at: 'For a dislocated joint', bg: 'farm', amb: 'farm', trans: 'whip', sfx: [['bone_crack', 'dislocated', 1]],
  draw: (c, st) => {
    ch(c, st, 'you', { x: 820, y: GY, s: 1.15, faces: [[0, 'wince'], ['two helpers', 'nervous']], rot: -8, pose: 'scared', id: 'you' });
    label(c, st, 'DISLOCATED!', 820, 220, 'dislocated', { size: 70, fill: '#ff6b3a' });
    if (after(st, 'split green reed')) prop(c, st, 'reed', 820, 760, { s: 1.0, rot: Math.PI / 2, enter: ['split green reed', 'pop'] });
    if (after(st, 'two helpers')) { ch(c, st, 'roman', { x: 440, y: GY, s: 1.05, face: 'nervous', pose: 'reach', look: [-0.8, -0.4], enter: ['two helpers', 'left'], id: 'h1' }); ch(c, st, 'romanb', { x: 1200, y: GY, s: 1.05, flip: true, face: 'nervous', pose: 'reach', look: [0.8, -0.4], enter: ['two helpers', 'right'], id: 'h2' }); }
    if (after(st, 'and a chant')) ch(c, st, 'cato', { x: 1600, y: GY, s: 1.1, flip: true, face: 'serious', pose: 'armsUp', enter: ['and a chant', 'right'] });
    label(c, st, 'NOBODY MAKE EYE CONTACT', 820, 330, 'against your hips', { size: 44, fill: '#fff' });
  } });

shot({ at: 'This is real: "motas', bg: 'v_purple', mus: 'chant', trans: 'zoom', sfx: [['magic', 'motas', 0.7], ['gong', 'motas', 0.7]],
  draw: (c, st) => {
    vortex(c, st.t * 0.5);
    glow(c, 960, 560, 500, 'rgba(200,160,255,0.4)');
    ch(c, st, 'cato', { x: 960, y: 1120, s: 1.5, face: 'serious', pose: 'armsUp', talk: ['motas', 'dissunapiter'], headTilt: Math.sin(st.t * 3) * 6 });
    const chant = ['MOTAS', 'VAETA', 'DARIES', 'DARDARES', 'ASTATARIES', 'DISSUNAPITER'];
    chant.forEach((w, i) => { let t; try { t = at(st, w.toLowerCase()); } catch (e) { t = st.s.start + 1 + i * 0.6; } cue('pop', t, 0.4); if (st.t < t) return; const a = i / chant.length * TAU + st.t * 0.4; popText(c, st, w, 960 + Math.cos(a) * 640, 470 + Math.sin(a) * 330, t, { size: 64, font: '"Cinzel"', weight: 900, fill: '#f2e1ff', sfx: false, stroke: '#3a1060' }); });
  } });

shot({ at: 'I did not make that up', bg: 'parchment', trans: 'cut',
  draw: (c, st) => {
    prop(c, st, 'book', 700, 560, { s: 1.6, title: 'ON AGRI-\nCULTURE', color: '#5a6b2a', rot: -0.08 });
    stamp(c, st, '100% REAL', 1340, 440, 'make that up', { size: 120 });
    label(c, st, '— CATO, ON AGRICULTURE', 1340, 700, 'not that creative', { size: 50, fill: '#7a3e1a', stroke: '#fff' });
  } });

shot({ at: 'Side effects may include: a sore throat', bg: null, trans: 'flash', mus: 'ad', cam: { push: 0.02 }, vig: 0.2,
  draw: (c, st) => {
    sideEffects(c, st, ['A SORE THROAT', 'TWO FRIENDS HOLDING A STICK\nAND AVOIDING EYE CONTACT', 'SMELLING FAINTLY OF CABBAGE PEE'], [at(st, 'sore throat'), at(st, 'two friends'), at(st, 'smelling faintly')], [
      (c2, st2) => { ch(c2, st2, 'cato', { x: 0, y: 80, s: 0.32, face: 'yell', noShadow: true }); },
      (c2, st2) => { c2.save(); c2.rotate(Math.PI / 2); c2.scale(0.35, 0.35); drawProp(c2, st2, 'reed', {}); c2.restore(); },
      (c2, st2) => { c2.save(); c2.scale(0.6, 0.6); drawProp(c2, st2, 'jar', {}); c2.restore(); stink(c2, 0, -20, st2.t, '#c9b53a', 2, 0.6); },
    ]);
  } });

shot({ at: 'And Cato was proud of all this', bg: 'farm', amb: 'farm', mus: 'rome', trans: 'whip', sfx: [['ding', 'whole family healthy', 0.7]],
  draw: (c, st) => {
    rrect(c, 360, 180, 1200, 760, 16, { fill: '#c9a46a', lw: 10 });
    c.save(); c.beginPath(); c.rect(390, 210, 1140, 700); c.clip(); c.drawImage(bgCanvas('farm'), 0, 0);
    ch(c, st, 'catowife', { x: 640, y: 1000, s: 1.0, face: 'happy', id: 'wife' });
    ch(c, st, 'cato', { x: 960, y: 1000, s: 1.05, face: 'proud', pose: 'hold', hold: { R: 'cabbage' } });
    ch(c, st, 'marcus', { x: 1280, y: 1000, s: 1.0, face: 'happy', id: 'son' });
    c.restore();
    sparkles(c, 400, 200, 1100, 300, st.t, 6);
    popText(c, st, 'THE CABBAGE SYSTEM™', 960, 120, at(st, 'bragged'), { size: 76, anim: 'rise', sfx: 'swoosh_up' });
  } });

// sad beat: no jokes, music changes
shot({ at: 'Then his wife died', bg: 'v_navy', mus: 'sad', trans: 'fade', td: 0.8, vig: 1, cam: { push: 0.04 },
  draw: (c, st) => {
    rrect(c, 360, 180, 1200, 760, 16, { fill: '#7d6a50', lw: 10 });
    c.save(); c.beginPath(); c.rect(390, 210, 1140, 700); c.clip(); c.fillStyle = '#3a4258'; c.fillRect(390, 210, 1140, 700);
    const wifeA = 1 - pr_(st, 'wife died', 1.4, E.io);
    const sonA = 1 - pr_(st, 'died too', 1.4, E.io);
    c.save(); c.globalAlpha = 0.25 + wifeA * 0.75; ch(c, st, 'catowife', { x: 640, y: 1000, s: 1.0, face: 'neutral', id: 'wife', pre: wifeA < 0.9 ? { color: '#8a8f9c', skin: '#c9ccd4', hairColor: '#6a6f7c' } : {} }); c.restore();
    ch(c, st, 'cato', { x: 960, y: 1000, s: 1.05, faces: [[0, 'neutral'], ['wife died', 'sad']], pose: 'idle' });
    c.save(); c.globalAlpha = 0.25 + sonA * 0.75; ch(c, st, 'marcus', { x: 1280, y: 1000, s: 1.0, face: 'neutral', id: 'son', pre: sonA < 0.9 ? { color: '#8a8f9c', skin: '#c9ccd4', hairColor: '#6a6f7c' } : {} }); c.restore();
    c.restore();
    if (after(st, 'Marcus')) label(c, st, 'MARCUS', 1280, 120, 'Marcus', { size: 60, fill: '#d8d8d8', sfx: false });
  } });

shot({ at: "We don't know exactly what killed them", bg: 'v_navy', trans: 'fade', td: 0.8, vig: 1, cam: { push: 0.05 }, sfx: [['thud_soft', 'ever going to fix', 0.6]],
  draw: (c, st) => {
    for (let i = 0; i < 60; i++) { const ph = (st.t * 0.6 + rnd(i)) % 1; c.fillStyle = 'rgba(160,190,230,0.35)'; c.fillRect(rnd(i, 3) * W, ph * H, 3, 26); }
    const drop = after(st, 'ever going to fix');
    ch(c, st, 'cato', { x: 900, y: 1060, s: 1.5, face: 'cry', tears: true, pose: drop ? 'idle' : 'hold', hold: { R: drop ? null : 'notebook' } });
    if (drop) { const p = pr_(st, 'ever going to fix', 0.5, E.in); prop(c, st, 'notebook', 1060, lerp(720, 1010, p), { s: 1.1, rot: p * 1.4 }); }
  } });

shot({ at: 'Plutarch, writing a couple of centuries later', bg: 'study', amb: 'study', mus: 'somber', trans: 'fade', td: 0.6, sfx: [['quill', 0.3, 0.6]],
  draw: (c, st) => {
    prop(c, st, 'table', 1050, 1010, { s: 1.2 });
    ch(c, st, 'plutarch', { x: 640, y: GY, s: 1.2, faces: [[0, 'serious'], ['bluntly', 'bored']], pose: [[10, 6], [40, -40]], hold: { R: 'quill' }, look: after(st, 'bluntly') ? [0, 0.2] : [0.6, 0.3] });
    nameCard(c, st, 'PLUTARCH', 'Plutarch', { x: 1300, y: 260, size: 100, sub: '~100 AD', subSize: 50 });
    popText(c, st, '"...SEEMS NOT TO HAVE\nGONE UNPUNISHED."', 1250, 640, at(st, 'seems not'), { size: 64, font: '"Cinzel"', weight: 900, fill: '#f6e2b0', anim: 'rise', sfx: false });
  } });

shot({ at: 'And Cato himself', bg: 'farm', amb: 'farm', mus: 'rome', trans: 'whip', sfx: [['ding', 'he was fine', 0.8], ['bells', 'married', 0.8], ['pop', 'another son', 0.8]],
  draw: (c, st) => {
    const wed = after(st, 'married');
    ch(c, st, 'cato', { x: wed ? 760 : 960, y: GY, s: 1.2, faces: [[0, 'neutral'], ['he was fine', 'proud'], ['married', 'happy']], pose: wed ? 'idle' : 'fists', pre: { hairColor: '#e8e4dc' }, hold: { R: wed ? null : 'cabbage' } });
    if (wed) { ch(c, st, 'youngwife', { x: 1160, y: GY, s: 1.1, flip: true, face: 'happy', enter: ['married', 'right'] }); prop(c, st, 'bell', 960, 220, { s: 1.4, enter: ['married', 'drop'] }); for (let i = 0; i < 4; i++) { const ph = (st.t * 0.4 + i / 4) % 1; prop(c, st, 'heart', 800 + i * 110, 700 - ph * 400, { s: 0.35, alpha: Math.sin(ph * Math.PI) }); } }
    label(c, st, 'AGE ~80', 760, 320, 'around eighty', { size: 66, fill: '#ffd23f' });
    if (after(st, 'another son')) ch(c, st, 'baby', { x: 960, y: GY, s: 0.9, face: 'happy', enter: ['another son', 'pop'] });
    popText(c, st, 'LIVED TO ~85', 1460, 170, at(st, 'eighty-five'), { size: 90, anim: 'slam', sfx: 'impact' });
  } });

shot({ at: 'So the cabbage was working', bg: 'v_green', trans: 'cut', sfx: [['rimshot', 'only for Cato', 1]],
  draw: (c, st) => {
    prop(c, st, 'cabbage', 960, 280, { s: 1.6, face: true, bob: 8 });
    ch(c, st, 'cato', { x: 560, y: 1050, s: 1.15, face: 'proud', pose: 'cheer' });
    check(c, 560, 380, 0.7, pr_(st, 'was working', 0.4));
    ['catowife', 'marcus'].forEach((n, i) => { ch(c, st, n, { x: 1160 + i * 320, y: 1050, s: 1.0, face: 'neutral', pre: { color: '#8a8f9c', skin: '#c9ccd4', hairColor: '#6a6f7c' }, alpha: 0.5, id: 'g' + i }); bigX(c, 1160 + i * 320, 420, 0.5, pr_(st, 'only for Cato', 0.3)); });
    popText(c, st, '...ONLY FOR CATO', 960, 560, at(st, 'only for Cato'), { size: 76, anim: 'slam', sfx: false });
  } });

shot({ at: 'And did Rome take his advice', bg: 'rome', amb: 'city_old', trans: 'whip', sfx: [['buzzer', 'No.', 0.9]], punch: [['No.', 0.12]],
  draw: (c, st) => {
    ch(c, st, 'greek', { x: 960, y: GY, s: 1.2, faces: [[0, 'nervous'], ['No.', 'happy']], pose: 'hold', hold: { R: 'clip' }, pre: { acc: ['stetho'] } });
    mark(c, st, '?', 1300, 330, at(st, 'kick out'), { size: 160 });
    popText(c, st, 'NO.', 960, 220, at(st, 'No.'), { size: 200, anim: 'slam', sfx: 'impact', fill: '#ff4d3a' });
  } });

shot({ at: 'About a century after Cato died', bg: 'rome', amb: 'city_old', trans: 'cut', sfx: [['ta_da', 'Roman citizenship', 1], ['crowd_cheer', 'every doctor', 0.6]],
  draw: (c, st) => {
    ch(c, st, 'caesar', { x: 520, y: GY, s: 1.2, face: 'smug', pose: 'present', hold: { R: 'scroll' }, enter: ['Julius Caesar', 'left'] });
    ['greek', 'greek', 'greek'].forEach((n, i) => ch(c, st, n, { x: 1060 + i * 260, y: GY, s: 1.0, flip: true, face: after(st, 'citizenship') ? 'laugh' : 'neutral', pose: after(st, 'citizenship') ? 'armsUp' : 'idle', id: 'gd' + i, pre: { acc: ['stetho'], color: ['#dfe7f0', '#f0e6d8', '#e6f0dc'][i] }, hops: after(st, 'citizenship') ? [at(st, 'citizenship') - st.s.start + i * 0.1] : [] }));
    label(c, st, 'JULIUS CAESAR', 520, 220, 'Julius Caesar', { size: 66, fill: '#d9b3ff' });
    popText(c, st, 'ROMAN CITIZENSHIP\nFOR EVERY DOCTOR!', 1320, 230, at(st, 'Roman citizenship'), { size: 70, anim: 'slam', sfx: false });
    yearSlam(c, st, '46 BC', 'century after', { x: 260, y: 110, size: 64 });
  } });

shot({ at: "But here's the part Cato really", bg: 'v_black', mus: 'whisper', trans: 'zoom', sfx: [['snake_hiss', 'Remember that snake', 0.9], ['ding', 'that snake', 0.6]], cam: { push: 0.1 },
  draw: (c, st) => {
    if (!after(st, 'Remember that')) { ch(c, st, 'cato', { x: 960, y: 1150, s: 1.6, face: 'angry', tremble: after(st, 'hated') }); return; }
    glow(c, 960, 540, 600, 'rgba(90,200,120,0.3)');
    prop(c, st, 'snake', 900, 580, { s: 2.3, shades: true, enter: ['Remember that', 'pop'] });
    sparkles(c, 900, 300, 500, 200, st.t, 5);
  } });

shot({ at: 'Back in 293 BC', bg: 'plague', amb: 'plague', mus: 'plague', trans: 'flash', sfx: [['thunder', 'plague hit Rome', 1], ['cough', 'plague', 0.6, 0, 0.6]], shake: [['plague hit', 0.5, 10, false]],
  draw: (c, st) => {
    yearSlam(c, st, '293 BC', '293', { x: 330, y: 150 });
    label(c, st, '(BEFORE CATO WAS EVEN BORN)', 640, 260, 'before Cato', { size: 44, fill: '#fff' });
    ['roman', 'romanb', 'senator'].forEach((n, i) => ch(c, st, n, { x: 560 + i * 420, y: GY, s: 1.05, face: after(st, 'plague') ? 'sad' : 'neutral', green: after(st, 'plague'), pose: after(st, 'plague') ? 'holdBoth' : 'idle', sweat: after(st, 'plague'), id: 'pl' + i }));
    popText(c, st, 'PLAGUE!', 1350, 230, at(st, 'plague hit'), { size: 140, anim: 'slam', sfx: false, fill: '#b5e04a' });
  } });

shot({ at: 'The Senate sent a delegation', bg: 'map_med', mus: 'voyage', trans: 'whip', vig: 0.4, cam: [[0, 1.5, (PIN_RO[0] + PIN_GR[0]) / 2 - W / 2, (PIN_RO[1] + PIN_GR[1]) / 2 - H / 2]], sfx: [['waves', 0.2, 0.6]],
  draw: (c, st) => {
    const path = [[PIN_RO[0], PIN_RO[1]], [700, 330], [820, 520], [900, 600], [1000, 520], [PIN_GR[0], PIN_GR[1]]];
    const p = pr_(st, 'all the way', 2.0, E.io);
    const back = pr_(st, 'sailed back', 1.6, E.io);
    const u = back > 0 ? 1 - back : p;
    c.save(); c.setLineDash([16, 14]); line(c, path, { lw: 6, stroke: '#fff', amp: 0 }); c.restore();
    const k = u * (path.length - 1), i0 = Math.min(path.length - 2, Math.floor(k)), f = k - i0;
    const sx = lerp(path[i0][0], path[i0 + 1][0], f), sy = lerp(path[i0][1], path[i0 + 1][1], f);
    prop(c, st, 'ship', sx, sy, { s: 0.16, flip: back > 0 });
    label(c, st, 'ROME', PIN_RO[0], PIN_RO[1] - 50, 0.1, { size: 36, fill: '#ffd23f', sfx: false });
    label(c, st, 'EPIDAURUS', PIN_GR[0], PIN_GR[1] - 50, 'Epidaurus', { size: 36, fill: '#ffd23f' });
    if (after(st, 'god of medicine')) { c.save(); c.translate(PIN_GR[0] + 120, PIN_GR[1] - 60); c.scale(0.22, 0.22); ch(c, st, 'asclepius', { x: 0, y: 0, s: 1, face: 'smug', enter: ['god of medicine', 'pop'] }); c.restore(); }
    if (after(st, 'sacred snake')) label(c, st, '...+ 1 SACRED SNAKE', sx, sy - 90, 'sacred snake', { size: 34, fill: '#7ee05a' });
  } });

shot({ at: 'And as the ship came up the river Tiber', bg: 'tiber', amb: 'river', trans: 'whip', sfx: [['splash', 'slipped overboard', 1], ['ahh', 'made itself at home', 0.7], ['rumble', 'built a temple', 0.9], ['choir', 'Asclepius right there', 0.8]],
  draw: (c, st) => {
    const tOver = at(st, 'slipped overboard'), tIsl = at(st, 'little island'), tTemple = at(st, 'built a temple');
    if (st.t > tTemple) { const p = pr_(st, 'built a temple', 1.0, E.out); c.save(); c.beginPath(); c.rect(0, 0, W, 800); c.clip(); prop(c, st, 'temple', 1350, 770 + (1 - p) * 500, { s: 0.6 }); c.restore(); }
    prop(c, st, 'island', 1350, 820, { s: 0.9, snake: false });
    c.save(); c.globalAlpha = 1; c.fillStyle = '#9c8a6a'; c.restore();
    const shipX = lerp(200, 700, clamp((st.t - st.s.start) / 4));
    prop(c, st, 'ship', shipX, 860, { s: 0.55 });
    let sx = shipX + 40, sy = 620, swim = false;
    if (st.t > tOver) { const p = clamp((st.t - tOver) / 0.6); sx = lerp(shipX + 40, shipX + 260, p); sy = lerp(620, 900, p) - Math.sin(p * Math.PI) * 120; }
    if (st.t > tIsl) { const p = clamp((st.t - tIsl) / 1.4); sx = lerp(shipX + 260, 1250, E.io(p)); sy = lerp(900, 760, p); swim = p < 1; }
    prop(c, st, 'snake', sx, sy, { s: 0.6, shades: true, swim, rot: swim ? 0 : 0 });
    label(c, st, 'THE TIBER', 400, 150, 'Tiber', { size: 70, fill: '#ffd23f' });
    label(c, st, 'TEMPLE OF ASCLEPIUS', 1350, 150, 'temple to Asclepius', { size: 56, fill: '#fff' });
  } });

shot({ at: "And there's still a hospital on that island", bg: 'tiber', amb: 'river', mus: 'awe', trans: 'fade', td: 0.6, sfx: [['choir', 'still a hospital', 0.9]], cam: { push: 0.1, x0: 300, x1: 390 },
  draw: (c, st) => {
    c.fillStyle = 'rgba(20,30,80,0.35)'; c.fillRect(0, 0, W, H);
    prop(c, st, 'island', 1350, 820, { s: 0.9 });
    c.save(); c.beginPath(); c.rect(0, 0, W, 790); c.clip(); prop(c, st, 'hospital', 1350, 770, { s: 0.75 }); c.restore();
    glow(c, 1350, 500, 500, 'rgba(255,230,160,0.35)');
    popText(c, st, 'STILL A HOSPITAL TODAY', 1300, 140, at(st, 'still a hospital'), { size: 80, anim: 'rise', sfx: false });
  } });

shot({ at: 'So that snake on the ambulance', bg: 'street', amb: 'city', mus: 'finale', trans: 'whip', sfx: [['siren', 0, 0.35], ['ding', "That's Asclepius", 0.8]],
  cam: [[0, 1.0, 0, 0], ['ambulance', 2.2, 780 - W / 2, 684 - H / 2, E.io, 0.8]],
  draw: (c, st) => {
    prop(c, st, 'ambulance', 900, 960, { s: 1.2, glowStar: true });
    if (after(st, "That's Asclepius")) label(c, st, "THAT'S ASCLEPIUS!", 780, 470, "That's Asclepius", { size: 40, fill: '#ffd23f' });
  } });

shot({ at: 'Cato bet on the cabbage', bg: 'v_navy', trans: 'cut', sfx: [['thud', 'the cabbage', 0.8], ['ta_da', 'the snake', 0.9]],
  draw: (c, st) => {
    c.fillStyle = '#5a8a2a'; c.fillRect(0, 0, W / 2, H); c.fillStyle = '#1f6a8a'; c.fillRect(W / 2, 0, W / 2, H);
    line(c, [[W / 2, 0], [W / 2, H]], { lw: 14, stroke: '#111', amp: 0 });
    ch(c, st, 'cato', { x: 480, y: 1050, s: 1.3, face: 'smug', pose: 'holdUp', hold: { R: 'cabbage' } });
    popText(c, st, 'CATO BET ON\nTHE CABBAGE', 480, 180, at(st, 'Cato bet'), { size: 70, anim: 'rise', sfx: false });
    if (after(st, 'Rome bet')) { prop(c, st, 'snake', 1400, 650, { s: 1.6, shades: true, enter: ['Rome bet', 'pop'] }); prop(c, st, 'crown', 1560, 420, { s: 1.0, enter: ['the snake', 'drop'] }); popText(c, st, 'ROME BET ON\nTHE SNAKE', 1440, 180, at(st, 'Rome bet'), { size: 70, anim: 'rise', sfx: false }); }
  } });

shot({ at: "And that's why your ambulance", bg: 'street', amb: 'city', trans: 'whip', sfx: [['rimshot', 'vegetable on it', 1]],
  draw: (c, st) => {
    c.save(); c.translate(900, 960); c.scale(1.2, 1.2);
    drawProp(c, st, 'ambulance', { starS: 0.001 });
    c.translate(-100, -230); drawProp(c, st, 'cabbage', { face: true, s: 0.9 });
    c.restore();
    ch(c, st, 'you', { x: 1500, y: GY, s: 1.1, face: 'disgust', flip: true, pose: 'point', id: 'you' });
    if (after(st, 'vegetable')) { bigX(c, 780, 680, 0.8, pr_(st, 'vegetable', 0.3)); ch(c, st, 'cato', { x: 280, y: GY, s: 1.0, face: 'sad', tears: true, hold: { R: 'cabbage' }, pose: 'carry', enter: ['vegetable', 'left'] }); }
  } });

// end card
shot({ at: { end: 'vegetable on it' }, off: 0.9, bg: 'v_navy', mus: 'outro', trans: 'flash', nocap: true, cam: { push: 0.04 },
  draw: (c, st) => {
    rays(c, st.t, 'rgba(255,255,255,0.08)');
    popText(c, st, 'THANKS FOR WATCHING!', 960, 200, st.s.start + 0.2, { size: 110, anim: 'slam', sfx: 'impact' });
    ch(c, st, 'you', { x: 560, y: GY, s: 1.1, face: 'happy', pose: 'wave', wave: true, enter: [0.4, 'up'], id: 'you' });
    ch(c, st, 'cato', { x: 960, y: GY, s: 1.1, face: 'smug', pose: 'holdUp', hold: { R: 'cabbage' }, enter: [0.6, 'up'] });
    prop(c, st, 'snake', 1380, 860, { s: 1.1, shades: true, enter: [0.8, 'up'] });
    popText(c, st, 'STAY HEALTHY. MAYBE SKIP THE CABBAGE BATH.', 960, 1010, st.s.start + 1.4, { size: 44, fill: '#fff', anim: 'rise', sfx: false });
  } });

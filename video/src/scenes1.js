// COLD OPEN + TITLE + PART 1: EGYPT
'use strict';
const PIN_FR = frP(7.35, 47.87);
const STAFF_POSE0 = [[10, 6], [36, 10]];

// ===== COLD OPEN =====
shot({ at: 0, bg: 'map_france', amb: 'wind', mus: 'tension', vig: 0.5,
  cam: [[0, 1.0, 0, 0], ['eastern France', 1.75, PIN_FR[0] - W / 2, PIN_FR[1] - H / 2, E.io, 1.4]],
  draw: (c, st) => {
    yearSlam(c, st, '7,000 YEARS AGO', 'Seven thousand', { x: 560, y: 150, size: 96 });
    const t = at(st, 'eastern France');
    cue('pin_drop', t, 0.8);
    if (st.t > t) {
      const p = prog(st.t, t, 0.45, E.back);
      const y = PIN_FR[1] - (1 - p) * 300;
      c.save(); c.translate(PIN_FR[0], y); c.scale(0.6, 0.6);
      shp(c, [[0, 0], [-34, -60], ...ellPts(0, -78, 36, 36, 16, Math.PI * 0.8, Math.PI * 2.2), [34, -60]], { fill: '#e0262d', lw: 8 });
      circ(c, 0, -78, 12, { fill: '#fff', lw: 4 });
      c.restore();
      label(c, st, 'EASTERN FRANCE', PIN_FR[0] - 40, PIN_FR[1] - 90, t + 0.3, { size: 40, fill: '#ffd23f' });
    }
  } });

shot({ at: 'a man had a hole', bg: 'cave', amb: 'fire', trans: 'whip', sfx: [['heartbeat', 0, 0.8], ['stone_grind', 'carved', 1]],
  cam: [[0, 1.0, 0, 0], ['carved', 1.35, -150, 60, E.io, 0.5]], shake: [['carved', 1.6, 7, false]],
  draw: (c, st) => {
    fire(c, 980, 930, 1.3, st.t);
    const tg = at(st, 'carved');
    const grinding = st.t > tg && st.t < tg + 1.8;
    ch(c, st, 'caveman', { x: 700, y: GY, s: 1.15, faces: [[0, 'nervous'], ['carved', 'wince'], ['stone tool', 'dizzy']], pose: 'scared', tremble: grinding, sweat: true, id: 'p' });
    ch(c, st, 'cavedoc', { x: 1300, y: GY, s: 1.15, flip: true, face: 'grin', pose: 'holdUp', hold: { R: 'rock' }, enter: [0.3, 'right'], move: [['carved', 920, GY, 0.4]], poses: [['carved', 'reach']], id: 'd' });
    if (grinding) {
      const k = Math.floor(st.t * 20);
      for (let i = 0; i < 6; i++) { const a = rnd(k, i) * TAU, r = 30 + rnd(k, i + 9) * 80; c.fillStyle = 'rgba(230,210,180,0.8)'; c.beginPath(); c.arc(700 - 40 + Math.cos(a) * r, 520 + Math.sin(a) * r * 0.6, 6 + rnd(i, k) * 8, 0, TAU); c.fill(); }
    }
  } });

shot({ at: 'Then he got a second one', bg: 'cave', amb: 'fire', trans: 'cut', cam: { push: 0.08 }, sfx: [['pop', 'second', 0.9], ['boing', 'second', 0.5, 0, 0.1]],
  draw: (c, st) => {
    ch(c, st, 'caveman', { x: 960, y: 1180, s: 2.1, faces: [[0, 'shock'], ['second', 'dizzy']], holes: true, holeN: after(st, 'second') ? 2 : 1 });
    if (after(st, 'second')) mark(c, st, '!', 1260, 330, at(st, 'second'), { size: 130 });
  } });

shot({ at: 'A little matching set', bg: 'cave', amb: 'fire', trans: 'cut', sfx: [['ding', 'matching', 0.8]],
  draw: (c, st) => {
    fire(c, 980, 930, 1.3, st.t);
    ch(c, st, 'caveman', { x: 760, y: GY, s: 1.2, face: 'dizzy', holes: true });
    ch(c, st, 'cavedoc', { x: 1260, y: GY, s: 1.15, flip: true, face: 'proud', pose: 'present', hold: { L: 'rock' } });
    sparkles(c, 640, 380, 240, 140, st.t, 6);
    popText(c, st, 'A MATCHING SET!', 960, 170, at(st, 'matching'), { size: 96, anim: 'pop', sfx: 'sparkle', wiggle: true });
  } });

shot({ at: 'And the bone around both holes', bg: 'v_navy', trans: 'whip', sfx: [['magic', 'growing back', 0.9]],
  draw: (c, st) => {
    const heal = clamp((st.t - at(st, 'growing back')) / 1.6);
    c.save(); c.globalAlpha = 0.18; c.strokeStyle = '#7fb8ff'; c.lineWidth = 2; for (let x = 0; x < W; x += 60) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); } for (let y = 0; y < H; y += 60) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); } c.restore();
    prop(c, st, 'skull', 960, 560, { s: 2.3, heal, enter: [0, 'pop'] });
    if (heal > 0) sparkles(c, 760, 220, 400, 140, st.t, 7, '#bdf27a');
    label(c, st, 'BONE GROWING BACK', 1450, 230, at(st, 'growing back'), { ax: 1100, ay: 300, fill: '#bdf27a' });
  } });

shot({ at: 'Which means he lived', bg: 'cave', amb: 'fire', trans: 'cut', sfx: [['ta_da', 'lived', 0.9]], punch: ['lived'],
  draw: (c, st) => {
    fire(c, 1400, 930, 1.1, st.t);
    ch(c, st, 'caveman', { x: 760, y: GY, s: 1.25, face: 'laugh', holes: 'healed', pose: 'armsUp', hops: ['lived'] });
    popText(c, st, 'HE LIVED!', 1350, 320, at(st, 'lived'), { size: 150, anim: 'slam', sfx: 'impact' });
  } });

shot({ at: 'He survived Stone Age brain surgery', bg: 'v_purple', trans: 'whip', punch: [['Twice', 0.12]], shake: [['Twice', 0.35, 12, false]],
  draw: (c, st) => {
    ch(c, st, 'caveman', { x: 420, y: 1150, s: 1.7, face: 'proud', holes: 'healed', pose: 'hips', enter: [0, 'left'] });
    popText(c, st, 'SURVIVED\nSTONE AGE\nBRAIN SURGERY', 1250, 400, at(st, 'survived'), { size: 100, anim: 'rise', sfx: 'swoosh_up' });
    popText(c, st, 'x2', 1300, 800, at(st, 'Twice'), { size: 240, anim: 'slam', sfx: 'impact', fill: '#ff4d3a' });
  } });

// clinic: the "what if" patient
shot({ at: 'So the next time your doctor', bg: 'clinic', amb: 'clinic', mus: 'clinic', trans: 'zoom', sfx: [['phone_muffled', 0.4, 0.5], ['clock_fast', 'forty minutes', 0.8]],
  cam: { push: 0.06 },
  draw: (c, st) => {
    const fast = after(st, 'forty minutes');
    clockIcon(c, 960, 220, 80, st.t, fast ? 40 : 1);
    prop(c, st, 'door', 1570, 740, { s: 1.0 });
    prop(c, st, 'chair', 560, GY, {});
    ch(c, st, 'you', { x: 720, y: GY, s: 1.15, faces: [[0, 'bored'], ['forty minutes', 'nervous'], ['remember', 'neutral']], look: after(st, 'remember') ? [0, 0.3] : [0.6, -0.4], sweat: fast, pose: 'holdBoth', id: 'you' });
    popText(c, st, '40 MINUTES LATER...', 1240, 470, at(st, 'forty minutes'), { size: 76, anim: 'rise', sfx: 'swoosh_up', fill: '#ffffff' });
  } });

shot({ at: 'the alternative used to be', bg: 'clinic', amb: 'clinic', trans: 'cut', sfx: [['door_slam', 'alternative', 1], ['ding', 'can-do attitude', 0.8]],
  shake: [['alternative', 0.3, 10, false]],
  draw: (c, st) => {
    clockIcon(c, 960, 220, 80, st.t, 1);
    const op = prog(st.t, at(st, 'alternative'), 0.18, E.out);
    prop(c, st, 'door', 1570, 740, { s: 1.0, open: op });
    prop(c, st, 'chair', 560, GY, {});
    ch(c, st, 'you', { x: 720, y: GY, s: 1.15, faces: [[0, 'neutral'], ['alternative', 'scared']], pose: 'scared', hops: ['alternative'], tremble: after(st, 'sharp rock'), id: 'you' });
    if (op > 0.2) ch(c, st, 'cavedoc', { x: 1570, y: GY, s: 1.15, flip: true, faces: [[0, 'grin'], ['can-do', 'proud']], pose: 'holdUp', poses: [['can-do', 'cheer']], hold: { R: 'rock' }, move: [['used to be', 1250, GY, 0.6]], walk: st.t < at(st, 'sharp rock') });
    if (after(st, 'can-do')) sparkles(c, 1100, 380, 300, 200, st.t, 6);
    popText(c, st, 'CAN-DO ATTITUDE!', 1250, 190, at(st, 'can-do attitude'), { size: 88, anim: 'pop', sfx: 'pop' });
  } });

shot({ at: "Today, we're finding out", bg: 'map_med', mus: 'intro', trans: 'whip', vig: 0.45, cam: { push: 0.08, x0: 200, x1: 240, y0: -40, y1: -40 },
  draw: (c, st) => {
    const stops = [['EGYPT', medP(31.13, 29.98), 'ancient people'], ['BABYLON', medP(44.42, 32.54), 'actually did'], ['GREECE', medP(23.08, 37.6), 'when they got'], ['ROME', medP(12.5, 41.9), 'got sick']];
    stops.forEach((sp, i) => {
      const t = at(st, sp[2]) + (i === 3 ? 0.35 : 0);
      cue('pin_drop', t, 0.6);
      if (st.t < t) return;
      const p = prog(st.t, t, 0.4, E.back);
      c.save(); c.translate(sp[1][0], sp[1][1] - (1 - p) * 160); c.scale(0.45, 0.45);
      shp(c, [[0, 0], [-34, -60], ...ellPts(0, -78, 36, 36, 16, Math.PI * 0.8, Math.PI * 2.2), [34, -60]], { fill: '#e0262d', lw: 8 }); circ(c, 0, -78, 12, { fill: '#fff', lw: 4 });
      c.restore();
      label(c, st, sp[0], sp[1][0], sp[1][1] - 70, t + 0.1, { size: 40, fill: '#ffd23f', sfx: false });
    });
    popText(c, st, 'WHAT DID ANCIENT PEOPLE\nDO WHEN THEY GOT SICK?', 1180, 120, at(st, 'finding out'), { size: 64, anim: 'rise', sfx: 'swoosh_up' });
  } });

function miniCard(c, st, x, y, t0, bgId, cap, inner) {
  card(c, st, x, y, 720, 380, at(st, t0), (cc, w, h) => { cc.drawImage(bgCanvas(bgId), 0, 0, w, h); cc.save(); cc.translate(w / 2, h); cc.scale(0.5, 0.5); inner(cc); cc.restore(); }, { rot: rr(x + y, -0.06, 0.06), drift: 2 });
  if (st.t > at(st, t0) + 0.3) label(c, st, cap, x, y + 215, at(st, t0) + 0.3, { size: 46, fill: '#ffd23f', sfx: 'swoosh_up' });
}
shot({ at: 'It involves a royal butt specialist', bg: 'v_navy', trans: 'cut', cam: { push: 0.04 },
  draw: (c, st) => {
    popText(c, st, "ON TODAY'S MENU:", 960, 90, st.s.start + 0.05, { size: 70, anim: 'rise', sfx: 'swoosh_up', out: at(st, 'royal butt specialist') + 0.2 });
    miniCard(c, st, 520, 300, 'royal butt specialist', 'palace', 'ROYAL BUTT SPECIALIST', cc => ch(cc, st, 'iry', { x: 0, y: -40, s: 1.4, face: 'serious', pose: 'hips' }));
    miniCard(c, st, 1400, 300, 'a city where', 'market', 'EVERYONE IS YOUR DOCTOR', cc => { ch(cc, st, 'bab', { x: -360, y: -40, s: 1.2, face: 'talk' }); ch(cc, st, 'bab_sick', { x: 0, y: -40, s: 1.2, face: 'sad', green: true }); ch(cc, st, 'bab_pass', { x: 360, y: -40, s: 1.2, flip: true, face: 'happy', pose: 'point' }); });
    miniCard(c, st, 520, 740, 'a hospital that', 'abaton', 'THE NAP HOSPITAL', cc => { ch(cc, st, 'greek_pat', { x: 0, y: -60, s: 1.2, face: 'sleep', lie: true }); zzz(cc, 140, -320, st.t, 1.6); });
    miniCard(c, st, 1400, 740, 'Roman senator', 'farm', 'PEE, PRESCRIBED', cc => ch(cc, st, 'cato', { x: 0, y: -40, s: 1.3, face: 'smug', pose: 'holdUp', hold: { R: 'jar' } }));
  } });

shot({ at: 'Oh, and next time you see an ambulance', bg: 'street', amb: 'city', trans: 'whip', sfx: [['siren', 0, 0.55]],
  cam: [[0, 1, 0, 0], ['little snake', 2.4, 780 - W / 2, 684 - H / 2, E.io, 1.0]],
  draw: (c, st) => {
    prop(c, st, 'ambulance', -700, 960, { s: 1.2, move: [[0, 900, 960, 1.6, E.out]], glowStar: after(st, 'little snake') });
    if (after(st, 'wrapped around')) label(c, st, 'THIS GUY', 1030, 560, at(st, 'wrapped around'), { size: 40, ax: 820, ay: 640, fill: '#ffd23f' });
  } });

shot({ at: 'Remember that snake', bg: 'v_black', trans: 'cut', mus: 'whisper', sfx: [['snake_hiss', 0.1, 0.8], ['ding', 'very smug', 0.7], ['sparkle', 'very smug', 0.6]], cam: { push: 0.1 },
  draw: (c, st) => {
    glow(c, 960, 540, 600, 'rgba(90,200,120,0.25)');
    prop(c, st, 'snake', 900, 580, { s: 2.3, shades: after(st, 'very smug'), enter: [0, 'right', 0.6] });
    if (after(st, 'very smug')) sparkles(c, 900, 300, 500, 200, st.t, 6);
  } });

// ===== TITLE =====
shot({ at: { insert: 'title' }, bg: 'v_red', trans: 'flash', nocap: true, mus: 'title', sfx: [['riser', -1.2, 0.8], ['impact', 0.9, 1], ['whoosh', 0.2, 0.7]],
  cam: { push: 0.06 }, shake: [[0.9, 0.4, 14, false]],
  draw: (c, st) => {
    rays(c, st.t, 'rgba(255,220,160,0.10)', 18, 960, 380);
    const cast = [['cavedoc', { hold: { R: 'rock' }, pose: 'holdUp', face: 'grin' }], ['iry', { face: 'serious', pose: 'hips' }], ['rod', { face: 'smug', pose: 'hold', hold: { R: 'scroll' } }],
      ['asclepius', { face: 'smug', pose: STAFF_POSE0, hold: { R: ['staff', { s: 0.78 }] } }], ['cato', { face: 'angry', pose: 'holdUp', hold: { R: 'cabbage' } }]];
    cast.forEach((cm, i) => ch(c, st, cm[0], Object.assign({ x: 260 + i * 350, y: 1130, s: 0.95, enter: [0.25 + i * 0.12, 'up', 0.35], id: 'cast' + i, enterSfx: false }, cm[1])));
    popText(c, st, 'THE WEIRD HISTORY OF', 960, 190, st.s.start + 0.9, { size: 92, anim: 'slam', sfx: false, fill: '#ffffff' });
    popText(c, st, 'ANCIENT MEDICINE', 960, 350, st.s.start + 1.2, { size: 170, anim: 'slam', sfx: 'impact' });
  } });
chapter('title', 1, 'EGYPT', '~2200 BC', 'desert');

// ===== PART 1: EGYPT =====
const PIN_EG = medP(31.13, 29.98);
shot({ at: "So let's start in Egypt", bg: 'map_med', mus: 'egypt', trans: 'zoom', vig: 0.4,
  cam: [[0, 1.0, 0, 0], ['Egypt', 1.7, PIN_EG[0] - W / 2, PIN_EG[1] - H / 2, E.io, 1.2]],
  draw: (c, st) => {
    const t = at(st, 'Egypt');
    cue('pin_drop', t + 0.6, 0.7);
    if (st.t > t + 0.6) { const p = prog(st.t, t + 0.6, 0.4, E.back); c.save(); c.translate(PIN_EG[0], PIN_EG[1] - (1 - p) * 200); c.scale(0.5, 0.5); shp(c, [[0, 0], [-34, -60], ...ellPts(0, -78, 36, 36, 16, Math.PI * 0.8, Math.PI * 2.2), [34, -60]], { fill: '#e0262d', lw: 8 }); circ(c, 0, -78, 12, { fill: '#fff', lw: 4 }); c.restore(); }
    label(c, st, 'EGYPT', PIN_EG[0] + 10, PIN_EG[1] - 90, t + 0.7, { size: 54, fill: '#ffd23f' });
    yearSlam(c, st, '2200 BC', '2200', { x: PIN_EG[0] - 110, y: PIN_EG[1] + 90, size: 64, rot: 0.04 });
  } });

shot({ at: 'with a man named Irynakhty', bg: 'v_gold', trans: 'whip',
  draw: (c, st) => {
    ch(c, st, 'iry', { x: 470, y: 1150, s: 1.9, face: 'serious', enter: [0, 'left'] });
    nameCard(c, st, 'IRYNAKHTY', 'Irynakhty', { x: 1280, y: 500, size: 140, sub: 'ROYAL PHYSICIAN' });
  } });

shot({ at: 'Picture a stick figure in a fancy beaded collar', bg: 'palace', amb: 'palace', trans: 'cut', sfx: [['sparkle', 'beaded collar', 0.8], ['dun_dun', 'extremely seriously', 0.9]],
  cam: [[0, 1.0, 0, 0], ['fancy beaded collar', 1.9, 0, 175, E.io, 0.7], ['with the face', 2.3, 0, 32, E.io, 0.7]], punch: ['extremely seriously'],
  draw: (c, st) => {
    ch(c, st, 'iry', { x: 960, y: 1000, s: 1.25, face: 'serious', pose: 'hips' });
    if (after(st, 'beaded collar') && !after(st, 'with the face')) { sparkles(c, 840, 640, 240, 120, st.t, 6); label(c, st, 'FANCY!', 1180, 620, at(st, 'beaded collar'), { size: 44, fill: '#ffd23f', ax: 1050, ay: 690 }); }
  } });

shot({ at: 'On a carved stone false door', bg: 'tomb', amb: 'tomb', trans: 'whip',
  draw: (c, st) => {
    prop(c, st, 'falseDoor', 1180, 1010, { s: 1.0, enter: [0.1, 'up', 0.6], sfx: 'stone_slide' });
    ch(c, st, 'iry', { x: 520, y: GY, s: 1.15, face: 'proud', pose: 'point', look: [0.6, 0] });
    label(c, st, 'FALSE DOOR', 1180, 320, 'false door', { size: 56, fill: '#ffd23f' });
    label(c, st, 'GIZA', 1180, 240, 'Giza', { size: 48, fill: '#ffffff' });
    popText(c, st, 'HIS JOB TITLES:', 560, 220, at(st, 'job titles'), { size: 64, anim: 'rise', sfx: 'swoosh_up' });
  } });

shot({ at: 'Senior physician of the palace', bg: 'v_purple', trans: 'whip', punch: [['Shepherd', 0.1]], sfx: [['rec_scratch', 'Shepherd', 1]], mus: 'egypt',
  draw: (c, st) => {
    ch(c, st, 'iry', { x: 330, y: 1160, s: 1.6, faces: [[0, 'serious'], ['Shepherd', 'proud']], pose: 'hips' });
    const ts = ['Senior physician', 'of the belly', 'of the eyes'].map(p => at(st, p));
    listCard(c, st, "IRYNAKHTY'S TITLES", ['SENIOR PHYSICIAN OF THE PALACE', 'PHYSICIAN OF THE BELLY', 'PHYSICIAN OF THE EYES'], [ts[0], ts[1] - 0.2, ts[2] - 0.2], { x: 1170, y: 140, gap: 140, is: 60, ts: 70 });
    popText(c, st, 'SHEPHERD OF THE ANUS', 1170, 140 + 140 * 4 + 40, at(st, 'Shepherd'), { size: 84, anim: 'slam', sfx: 'impact', fill: '#ff6b9a' });
    if (after(st, 'Shepherd')) prop(c, st, 'crook', 1700, 760, { s: 0.7, rot: 0.3, enter: ['Shepherd', 'pop'] });
  } });

shot({ at: "That's real", bg: 'tomb', amb: 'tomb', trans: 'cut', sfx: [['chisel', 0.5, 0.7], ['chisel', 1.1, 0.7], ['chisel', 1.7, 0.7], ['chisel', 2.3, 0.7], ['choir', 'for eternity', 0.8]],
  cam: [[0, 1.25, 120, 60], ['for eternity', 1.0, 0, 0, E.io, 1.4]],
  draw: (c, st) => {
    prop(c, st, 'falseDoor', 1160, 1010, { s: 1.0 });
    const hit = Math.floor((st.lt - 0.5) / 0.6) % 2 === 0 && st.lt > 0.5;
    ch(c, st, 'egy', { x: 720, y: GY, s: 1.1, face: 'serious', pose: hit ? [[10, 6], [70, 60]] : [[10, 6], [110, 140]], hold: { R: 'hammer' }, look: [0.7, -0.2] });
    stamp(c, st, 'REAL.', 560, 260, "That's real", { size: 120 });
    if (after(st, 'for eternity')) popText(c, st, 'FOR ETERNITY', 1160, 180, at(st, 'for eternity'), { size: 96, font: '"Cinzel"', weight: 900, fill: '#ffd86b', anim: 'rise', sfx: false });
  } });

shot({ at: 'You see, Egyptian doctors', bg: 'palace', amb: 'palace', trans: 'whip',
  draw: (c, st) => {
    const signs = [['EYES', 'You see'], ['BELLY', 'Egyptian doctors'], ['TEETH', 'called sunu']];
    signs.forEach((sg, i) => {
      const x = 480 + i * 480;
      ch(c, st, 'egy', { x, y: GY, s: 1.0, face: ['serious', 'smug', 'happy'][i], pose: 'holdUp', enter: [at(st, sg[1]) - st.s.start, 'up'], id: 'e' + i, pre: { color: ['#f7f3e6', '#e9f0d8', '#f3e6f0'][i] } });
      prop(c, st, 'sign', x + 110, 520, { s: 0.6, text: sg[0], enter: [at(st, sg[1]) - st.s.start + 0.2, 'pop'] });
    });
    label(c, st, 'SUNU = DOCTORS', 960, 160, 'sunu', { size: 72, fill: '#ffd23f' });
    stamp(c, st, 'SPECIALISTS', 960, 300, 'specialists', { size: 80, color: '#1b6fd6', rot: 0.05 });
  } });

shot({ at: 'The Greek writer Herodotus', bg: 'parchment', amb: 'none', trans: 'whip', sfx: [['quill', 0.4, 0.6]],
  draw: (c, st) => {
    ch(c, st, 'rod', { x: 620, y: GY + 20, s: 1.3, face: 'smug', pose: 'holdBoth', hold: { R: 'quill', L: 'scroll' }, enter: [0, 'left'] });
    nameCard(c, st, 'HERODOTUS', 'Herodotus', { x: 1300, y: 330, size: 110, sub: 'GREEK WRITER' });
    popText(c, st, '1 DOCTOR = 1 THING', 1300, 720, at(st, 'exactly one thing'), { size: 86, anim: 'slam', sfx: 'impact', fill: '#ff6b3a' });
  } });

shot({ at: 'Remember Herodotus', bg: 'parchment', trans: 'cut', sfx: [['dun_dun', 'very soon', 0.9]], punch: ['very soon'],
  draw: (c, st) => {
    ch(c, st, 'rod', { x: 760, y: 1230, s: 2.2, faces: [[0, 'smug'], ['confidently', 'sly']], look: [0.4, 0] });
    stamp(c, st, 'CONFIDENTLY\nWRONG', 1450, 420, 'confidently wrong', { size: 92 });
  } });

shot({ at: 'So why did a butt need a shepherd', bg: 'v_teal', trans: 'whip',
  draw: (c, st) => {
    ch(c, st, 'iry', { x: 820, y: 1100, s: 1.55, face: 'confused', pose: 'hold', hold: { R: ['crook', { rot: 0.2 }] }, headTilt: -8 });
    mark(c, st, '?', 1320, 360, at(st, 'shepherd'), { size: 220 });
  } });

// body-as-the-Nile diagram
const CH_PATHS = [
  [[960, 520], [960, 420], [940, 320], [960, 250]], [[960, 520], [880, 470], [760, 520], [700, 640]], [[960, 520], [1040, 470], [1160, 520], [1220, 640]],
  [[960, 520], [920, 640], [880, 780], [860, 920]], [[960, 520], [1000, 640], [1040, 780], [1060, 920]], [[960, 520], [960, 640], [970, 700]],
];
function bodyDiagram(c, st, o = {}) {
  c.save();
  c.globalAlpha = 0.95;
  circ(c, 960, 230, 150, { fill: '#f6e6c4', lw: 9, seed: 2 });
  shp(c, trapPts(260, 360, 520).map(p => [p[0] + 960, p[1] + 900]), { fill: '#f6e6c4', lw: 9, seed: 3 });
  c.restore();
  const gooP = o.goo || 0;
  CH_PATHS.forEach((pth, i) => {
    line(c, pth, { lw: 22, stroke: '#2f8fd8', seed: i, amp: 0.6 });
    c.save(); c.setLineDash([18, 22]); c.lineDashOffset = -st.t * (o.fast ? 160 : 60); line(c, pth, { lw: 6, stroke: '#bfe4ff', seed: i, amp: 0.6 }); c.restore();
    if (gooP > 0) { const n = Math.max(2, Math.ceil(pth.length * clamp(gooP * 1.2 - i * 0.05))); line(c, pth.slice(0, n), { lw: 18, stroke: '#7fbf3a', seed: i + 9, amp: 0.6 }); }
  });
  prop(c, st, 'heart', 960, 520, { s: 0.6, beat: true });
  if (o.gut) { glow(c, 970, 700, 160, 'rgba(120,200,40,0.7)', 0.6 + 0.3 * Math.sin(st.t * 4)); ell(c, 970, 700, 70, 50, { fill: '#7fbf3a', lw: 7 }); }
}
shot({ at: 'Egyptians thought the body worked like the Nile', bg: 'parchment', trans: 'zoom', sfx: [['heartbeat', 'from the heart', 0.6], ['water_flow', 0.2, 0.6]],
  draw: (c, st) => {
    bodyDiagram(c, st, { fast: after(st, 'Keep the channels') });
    label(c, st, 'LIKE THE NILE', 1450, 160, 'like the Nile', { size: 60, fill: '#2f6fd6', stroke: '#fff' });
    label(c, st, 'BLOOD', 520, 470, 'blood', { size: 50, fill: '#e0262d', stroke: '#fff', ax: 740, ay: 520 });
    label(c, st, 'AIR', 1400, 470, 'air', { size: 50, fill: '#58b6ff', stroke: '#fff', ax: 1180, ay: 520 });
    label(c, st, 'TEARS', 1300, 240, 'tears', { size: 50, fill: '#58b6ff', stroke: '#fff', ax: 1080, ay: 240 });
    label(c, st, 'EVERYTHING ELSE', 1420, 860, 'everything else', { size: 50, fill: '#8a5a2b', stroke: '#fff', ax: 1080, ay: 880 });
    if (after(st, "you're healthy")) check(c, 520, 860, 0.9, prog(st.t, at(st, "you're healthy"), 0.4));
    cue('correct', at(st, "you're healthy"), 0.7);
  } });

shot({ at: 'But inside your gut lurked', bg: 'parchment', trans: 'cut', sfx: [['braam', 'lurked', 0.9], ['gurgle', 'leak out', 0.9], ['gurgle', 'spreading disease', 0.7]],
  draw: (c, st) => {
    const goo = clamp((st.t - at(st, 'travel those channels')) / 2.5);
    bodyDiagram(c, st, { gut: true, goo });
    popText(c, st, 'WEKHEDU', 1450, 300, at(st, 'wekhedu'), { size: 130, anim: 'slam', sfx: 'impact', fill: '#9be34a', wiggle: true });
    label(c, st, 'ROTTING GUT GUNK', 1450, 440, 'rotting substance', { size: 46, fill: '#fff' });
    if (after(st, 'leak out')) stink(c, 970, 640, st.t, '#7fbf3a', 3, 1.2);
    label(c, st, 'DISEASE!', 480, 780, 'spreading disease', { size: 70, fill: '#9be34a', ax: 860, ay: 860 });
  } });

shot({ at: 'Think of one clogged drain', bg: 'v_blue', trans: 'whip', sfx: [['gurgle', 'clogged drain', 1], ['splash', 'every sink', 0.8]],
  draw: (c, st) => {
    // house cutaway
    shp(c, [[360, 980], [360, 420], [960, 120], [1560, 420], [1560, 980]], { fill: '#f3e3c3', lw: 10 });
    line(c, [[360, 700], [1560, 700]], { lw: 8 }); line(c, [[960, 420], [960, 980]], { lw: 8 });
    const t0 = at(st, 'clogged drain'), t1 = at(st, 'every sink');
    [[660, 640, t0], [1260, 640, t1], [660, 930, t1 + 0.4], [1260, 930, t1 + 0.8]].forEach((s2, i) => prop(c, st, 'sink', s2[0], s2[1], { s: 0.9, goo: clamp((st.t - s2[2]) / 1.2) * 70 }));
    label(c, st, 'CLOGGED!', 660, 470, 'clogged drain', { size: 54, fill: '#ff6b3a' });
  } });

shot({ at: 'So the fix was obvious', bg: 'palace', amb: 'palace', trans: 'whip', sfx: [['flush', 'Flush the drain', 1], ['boing', 'regularly', 0.7]], punch: ['Enemas'],
  draw: (c, st) => {
    ch(c, st, 'egy_pat', { x: 660, y: GY, s: 1.15, faces: [[0, 'nervous'], ['Flush', 'shock'], ['Enemas', 'scared']], green: true, sweat: true, pose: 'scared', tremble: after(st, 'Enemas'), id: 'you' });
    ch(c, st, 'iry', { x: 1350, y: GY, s: 1.15, flip: true, face: 'serious', pose: 'holdUp', hold: { R: ['horn', { rot: -0.6 }] }, move: [['Enemas', 1150, GY, 0.5]] });
    popText(c, st, 'FLUSH THE DRAIN!', 960, 170, at(st, 'Flush the drain'), { size: 96, anim: 'slam', sfx: 'impact' });
    stamp(c, st, 'ENEMAS', 960, 330, 'Enemas', { size: 100 });
    label(c, st, '...REGULARLY', 1380, 450, 'regularly', { size: 56, fill: '#ffd23f' });
  } });

shot({ at: 'And according to an old story', bg: 'desert', amb: 'nile', trans: 'whip', sfx: [['bird_squawk', 'the ibis', 0.9], ['beep', 'rear end', 0.9]],
  draw: (c, st) => {
    const bend = after(st, 'rinse out');
    prop(c, st, 'ibis', -200, 780, { s: 1.1, move: [[0, 860, 780, 1.6]], beak: bend ? 'down' : 'up', rot: bend ? -0.25 : 0 });
    label(c, st, 'THE IBIS', 860, 330, 'the ibis', { size: 70, fill: '#ffd23f' });
    if (after(st, 'rear end')) { const p = prog(st.t, at(st, 'rear end'), 0.15); c.save(); c.translate(820, 760); c.rotate(-0.1); c.fillStyle = '#111'; c.fillRect(-260 * p, -60, 520 * p, 120); txt(c, 'CENSORED', 0, 0, { size: 64, fill: '#fff', lw: 0, shadow: false, alpha: p }); c.restore(); }
    ch(c, st, 'egy_pat', { x: 1550, y: GY, s: 1.05, faces: [[0, 'neutral'], ['rinse out', 'disgust']], flip: true, look: [0.6, 0], id: 'you' });
  } });

shot({ at: 'So the first gut doctor was', bg: 'palace', amb: 'palace', trans: 'cut', sfx: [['ding', 'gut doctor', 0.8]],
  draw: (c, st) => {
    prop(c, st, 'ibis', 900, 760, { s: 1.4 });
    circ(c, 760, 530, 30, { fill: '#dfe8ee', lw: 6 }); circ(c, 760, 530, 12, { fill: '#9fd3f0', lw: 4 });
    prop(c, st, 'sign', 1420, 760, { s: 0.9, text: 'DR. IBIS', w: 380, enter: ['gut doctor', 'pop'] });
    label(c, st, '*ALLEGEDLY', 1420, 400, 'allegedly', { size: 50, fill: '#fff', rot: -0.05 });
  } });

shot({ at: 'Then there was the pharmacy', bg: 'v_brown', amb: 'palace', trans: 'whip', sfx: [['creepy', 'adventurous', 0.8]],
  draw: (c, st) => {
    for (let r = 0; r < 3; r++) { rrect(c, 120, 260 + r * 220, 1680, 24, 6, { fill: '#6b4423', lw: 6, seed: r }); for (let k = 0; k < 9; k++) prop(c, st, 'pot', 220 + k * 190, 250 + r * 220 - 60, { s: 0.6 + rnd(r, k) * 0.2, seed: r * 9 + k }); }
    prop(c, st, 'table', 960, 1000, { s: 1.6 });
    ch(c, st, 'iry', { x: 960, y: 1040, s: 1.2, face: 'smug', pose: 'present' });
    if (after(st, 'adventurous')) { prop(c, st, 'dung', 600, 920, { s: 0.9, enter: ['adventurous', 'pop'] }); popText(c, st, '☠', 1320, 880, at(st, 'adventurous') + 0.2, { size: 120, font: 'sans-serif', fill: '#fff' }); }
    label(c, st, 'THE PHARMACY', 960, 140, 'pharmacy', { size: 80, fill: '#ffd23f' });
  } });

shot({ at: 'The Ebers Papyrus', bg: 'tomb', amb: 'tomb', trans: 'cut', sfx: [['scroll', 'Ebers', 0.9], ['scroll', 'twenty meters', 0.7]],
  cam: [[0, 1, 0, 0], ['twenty meters', 1.25, 300, 0, E.io, 1.6]],
  draw: (c, st) => {
    const un = clamp((st.t - at(st, 'Ebers')) / 1.4) * 0.6 + clamp((st.t - at(st, 'twenty meters')) / 1.5) * 0.6;
    prop(c, st, 'papyrus', 160, 560, { s: 1.0, len: 1700, unroll: un });
    label(c, st, 'EBERS PAPYRUS', 600, 260, 'Ebers', { size: 70, fill: '#ffd23f' });
    yearSlam(c, st, '~1550 BC', '1550', { x: 1300, y: 230, size: 74 });
    if (after(st, 'twenty meters')) { arrow(c, 200, 800, 1700, 800, { p: prog(st.t, at(st, 'twenty meters'), 0.8), color: '#ffffff', lw: 10 }); label(c, st, '~20 METERS', 1260, 880, 'twenty meters', { size: 70, fill: '#ffffff' }); }
    if (after(st, 'seven hundred')) counter(c, st, 0, 700, 1500, 560, 'seven hundred', 0.9, { post: '+ REMEDIES', size: 80, fill: '#7ee05a' });
  } });

shot({ at: "That's a prescription pad", bg: 'v_navy', trans: 'whip', sfx: [['strike', 'bowling lane', 1]],
  draw: (c, st) => {
    prop(c, st, 'bowling', 960, 380, { s: 2.6 });
    const t = at(st, 'length of a bowling') - 0.4;
    if (st.t > t) { const p = clamp((st.t - t) / 0.9); const y = lerp(1100, 360, E.out(p)); circ(c, 960 + Math.sin(p * 3) * 30, y, lerp(70, 18, p), { fill: '#2b2bd6', lw: 6 }); }
    if (st.t > t + 0.9) { for (let i = 0; i < 10; i++) { const a = rnd(i) * TAU, d = (st.t - t - 0.9) * 600; c.fillStyle = '#fff'; c.beginPath(); c.ellipse(960 + Math.cos(a) * d, 350 + Math.sin(a) * d * 0.4 - d * 0.3, 10, 22, a, 0, TAU); c.fill(); } }
    popText(c, st, 'PRESCRIPTION PAD:\nBOWLING-LANE SIZE', 960, 820, at(st, 'prescription pad'), { size: 72, anim: 'rise', sfx: 'swoosh_up' });
  } });

shot({ at: 'For bleary eyes', bg: 'palace', amb: 'palace', trans: 'whip', sfx: [['plop', 'myrrh', 0.8], ['plop', 'onions', 0.8], ['squelch', 'antelope dung', 1]],
  draw: (c, st) => {
    popText(c, st, 'RECIPE: FOR BLEARY EYES', 960, 130, at(st, 'bleary eyes'), { size: 76, anim: 'rise', sfx: 'swoosh_up' });
    ch(c, st, 'egy_pat', { x: 480, y: GY, s: 1.1, faces: [[0, 'wince'], ['antelope dung', 'disgust']], tears: true, id: 'you' });
    ch(c, st, 'iry', { x: 1400, y: GY, s: 1.1, flip: true, face: 'serious', pose: 'holdBoth' });
    prop(c, st, 'bowl', 1180, 640, { s: 1.2 });
    [['myrrh', 'myrrh', 'MYRRH'], ['onion', 'onions', 'ONION'], ['dung', 'antelope dung', 'ANTELOPE DUNG']].forEach((ing, i) => {
      const t = at(st, ing[1]);
      if (st.t < t) return;
      const p = clamp((st.t - t) / 0.6);
      const x = lerp(900 + i * 60, 1180, E.in(p)), y = lerp(260, 600, E.in(p)) - Math.sin(p * Math.PI) * 140;
      if (p < 1) prop(c, st, ing[0], x, y, { s: 0.8, flies: false });
      label(c, st, ing[2], 860, 360 + i * 90, t, { size: 52, fill: i === 2 ? '#c98a4a' : '#fff', sfx: false });
    });
    if (after(st, 'antelope dung')) stink(c, 1180, 560, st.t, '#8fbf3a', 3, 1.2);
  } });

shot({ at: 'An even older papyrus', bg: 'desert', amb: 'nile', trans: 'cut', sfx: [['croc_growl', 'crocodile dung', 0.9]],
  draw: (c, st) => {
    prop(c, st, 'croc', 1060, 860, { s: 1.15, confused: after(st, 'birth control'), jaw: 0.2 });
    prop(c, st, 'dung', 420, 940, { s: 1.1 });
    stamp(c, st, 'BIRTH CONTROL', 520, 250, 'birth control', { size: 84, color: '#1b6fd6' });
    label(c, st, 'CROCODILE DUNG', 420, 720, 'crocodile dung', { size: 52, fill: '#fff' });
  } });

shot({ at: 'Which, to be fair', bg: 'v_pink', mus: 'romance', trans: 'whip', sfx: [['rec_scratch', 'Mostly', 1], ['flies', 'Mostly', 0.6]],
  draw: (c, st) => {
    const broke = after(st, 'Mostly');
    if (!broke) for (let i = 0; i < 6; i++) { const ph = (st.t * 0.4 + i / 6) % 1; prop(c, st, 'heart', 700 + i * 100 + Math.sin(ph * 6 + i) * 30, 700 - ph * 600, { s: 0.4, alpha: Math.sin(ph * Math.PI) }); }
    ch(c, st, 'egy', { x: 640, y: GY, s: 1.15, faces: [[0, 'happy'], ['Mostly', 'disgust']], pose: broke ? 'facepalm' : 'reach', id: 'm', blush: !broke });
    ch(c, st, 'egyw', { x: 1280, y: GY, s: 1.15, flip: true, faces: [[0, 'happy'], ['Mostly', 'disgust']], pose: broke ? 'facepalm' : 'reach', id: 'w', blush: !broke });
    if (broke) { prop(c, st, 'dung', 960, 980, { s: 0.8, enter: ['Mostly', 'drop'] }); stink(c, 960, 860, st.t, '#8fbf3a', 4, 1.4); }
    popText(c, st, 'ROMANCE: PREVENTED', 960, 160, at(st, 'preventing the romance'), { size: 86, anim: 'slam', sfx: 'impact', fill: '#ff6b9a' });
  } });

shot({ at: 'Side effects may include: smelling', bg: null, trans: 'flash', mus: 'ad', cam: { push: 0.02 }, vig: 0.2,
  draw: (c, st) => {
    sideEffects(c, st, ['SMELLING LIKE A SWAMP', 'LOSING ALL YOUR FRIENDS', 'BEING FOLLOWED HOME BY\nA CONFUSED CROCODILE'], [at(st, 'smelling like'), at(st, 'losing all'), at(st, 'followed home')], [
      (c2, st2) => stink(c2, 0, 40, st2.t, '#6a9a2a', 3, 0.9),
      (c2, st2) => { ch(c2, st2, 'egy_pat', { x: 0, y: 80, s: 0.32, face: 'sad', noShadow: true }); },
      (c2, st2) => { c2.save(); c2.scale(0.33, 0.33); drawProp(c2, st2, 'croc', { confused: true }); c2.restore(); },
    ]);
  } });

shot({ at: "But here's the twist", bg: 'v_black', mus: 'twist', trans: 'spin', sfx: [['choir', 'was honey', 1], ['sparkle', 'was honey', 0.8]],
  draw: (c, st) => {
    popText(c, st, 'THE TWIST', 960, 200, at(st, 'twist'), { size: 130, anim: 'slam', sfx: 'impact' });
    for (let i = 0; i < 9; i++) prop(c, st, i % 3 ? 'pot' : 'dung', 480 + (i % 5) * 240 + (i > 4 ? 120 : 0), 1000 - (i > 4 ? 110 : 0), { s: 0.9, flies: false, seed: i });
    const t = at(st, 'was honey');
    if (st.t > t - 0.3) { const p = prog(st.t, t - 0.3, 1.0, E.out); glow(c, 960, 900 - p * 360, 420 * p, 'rgba(255,220,120,0.8)'); prop(c, st, 'honey', 960, 900 - p * 360, { s: 1.6 }); sparkles(c, 760, 380, 400, 300, st.t, 8); }
  } });

shot({ at: 'Egyptian doctors smeared it on wounds', bg: 'palace', amb: 'palace', trans: 'whip', sfx: [['squelch', 'smeared', 0.9], ['bandage', 'wrapped them', 0.9]],
  draw: (c, st) => {
    const wrapped = after(st, 'in linen');
    ch(c, st, 'egy_pat', { x: 760, y: GY, s: 1.2, faces: [[0, 'wince'], ['in linen', 'content']], pose: [[10, 6], [70, 60]], id: 'you',
      after: (cc, info) => { const h = info.hands[1].p; if (!wrapped) { line(cc, [[h[0] - 60, h[1] - 50], [h[0] - 20, h[1] - 20]], { lw: 8, stroke: '#e0262d' }); if (after(st, 'smeared')) { cc.fillStyle = 'rgba(240,170,40,0.85)'; cc.beginPath(); cc.ellipse(h[0] - 40, h[1] - 36, 36, 20, 0.6, 0, TAU); cc.fill(); } } else { cc.save(); cc.translate(h[0] - 40, h[1] - 36); cc.rotate(0.6); rrect(cc, -46, -22, 92, 44, 16, { fill: '#f5f1e6', lw: 6 }); cc.restore(); } } });
    ch(c, st, 'iry', { x: 1300, y: GY, s: 1.15, flip: true, face: 'serious', pose: 'reach', hold: { R: after(st, 'wrapped') ? 'linen' : 'honey' } });
    label(c, st, 'HONEY ON THE WOUND', 960, 170, 'smeared', { size: 70, fill: '#ffd23f' });
    if (wrapped) label(c, st, '+ LINEN', 960, 260, 'linen', { size: 60, fill: '#fff' });
  } });

shot({ at: 'And honey actually works', bg: 'v_teal', trans: 'cut', sfx: [['correct', 'works', 0.9]],
  draw: (c, st) => {
    prop(c, st, 'honey', 760, 600, { s: 2.6, enter: [0, 'pop'] });
    check(c, 1300, 560, 1.4, prog(st.t, at(st, 'works'), 0.4));
    popText(c, st, 'IT ACTUALLY WORKS', 960, 160, at(st, 'actually works'), { size: 90, anim: 'slam', sfx: false });
  } });

shot({ at: "It's so packed with sugar", bg: 'v_teal', trans: 'zoom', sfx: [['suck', 'pulls the water', 0.9], ['sizzle', 'acidic', 0.9], ['fizz', 'hydrogen peroxide', 1]],
  draw: (c, st) => {
    c.save(); c.beginPath(); c.arc(960, 560, 480, 0, TAU); c.fillStyle = '#eaf7e6'; c.fill(); c.clip();
    c.strokeStyle = 'rgba(0,0,0,0.05)'; c.lineWidth = 2; for (let x = 480; x < 1440; x += 40) { c.beginPath(); c.moveTo(x, 80); c.lineTo(x, 1040); c.stroke(); }
    const tw = at(st, 'pulls the water'), ta = at(st, 'acidic'), tp = at(st, 'hydrogen peroxide');
    const dead = st.t > tp + 0.8;
    [[760, 420], [1160, 460], [960, 720]].forEach((b, i) => {
      const shr = clamp((st.t - tw) / 2);
      prop(c, st, 'bacteria', b[0] + Math.sin(st.t * 2 + i) * 10, b[1], { s: 1.2, shrink: shr, dead, seed: i * 7 });
      if (st.t > tw) for (let k = 0; k < 3; k++) { const ph = ((st.t - tw) * 0.8 + k / 3 + i * 0.1) % 1; const a = i * 2 + k * 2.1; prop(c, st, 'drop', b[0] + Math.cos(a) * (60 + ph * 300), b[1] + Math.sin(a) * (60 + ph * 300), { s: 0.9, alpha: 1 - ph }); }
    });
    if (st.t > tp) for (let k = 0; k < 18; k++) { const ph = ((st.t - tp) * 0.7 + rnd(k)) % 1; circ(c, 600 + rnd(k, 2) * 720, 960 - ph * 800, 6 + rnd(k, 3) * 12, { fill: 'rgba(255,255,255,0.7)', lw: 3, stroke: '#9cc' }); }
    c.restore();
    shp(c, ellPts(960, 560, 480, 480, 60), { lw: 26, stroke: '#2a2f36', seed: 1, amp: 0 });
    label(c, st, 'SUGAR PULLS\nOUT WATER', 330, 300, 'pulls the water', { size: 48, fill: '#fff' });
    label(c, st, 'ACIDIC', 1620, 360, 'acidic', { size: 64, fill: '#ffd23f' });
    label(c, st, 'H₂O₂', 1600, 760, 'hydrogen peroxide', { size: 80, fill: '#9fe0ff' });
  } });

shot({ at: 'Hospitals today still use', bg: 'clinic', amb: 'clinic', trans: 'whip', sfx: [['ding', 'medical-grade honey', 0.8]],
  draw: (c, st) => {
    ch(c, st, 'doctor', { x: 1250, y: GY, s: 1.15, flip: true, face: 'happy', pose: 'present', hold: { R: 'honey' } });
    ch(c, st, 'you', { x: 680, y: GY, s: 1.15, faces: [[0, 'neutral'], ['medical-grade', 'grin']], poses: [['medical-grade', 'cheer']], id: 'you' });
    label(c, st, 'MEDICAL-GRADE HONEY', 960, 200, 'medical-grade honey', { size: 76, fill: '#ffd23f' });
  } });

shot({ at: 'Crocodile dung, zero', bg: 'v_navy', trans: 'whip', sfx: [['buzzer', 'zero', 0.9], ['ta_da', 'undefeated', 1]],
  draw: (c, st) => {
    line(c, [[960, 120], [960, 960]], { lw: 8, stroke: '#ffffff' });
    popText(c, st, 'CROCODILE DUNG', 480, 170, st.s.start + 0.05, { size: 70, sfx: false, fill: '#fff' });
    popText(c, st, 'HONEY', 1440, 170, at(st, 'Honey'), { size: 90, sfx: false, fill: '#fff' });
    prop(c, st, 'dung', 480, 700, { s: 1.6 });
    prop(c, st, 'honey', 1440, 640, { s: 2.2, enter: ['Honey', 'pop'] });
    popText(c, st, '0', 480, 400, at(st, 'zero'), { size: 200, anim: 'slam', sfx: false, fill: '#ff4d3a' });
    if (after(st, 'undefeated')) { prop(c, st, 'crown', 1440, 430, { s: 1.4, enter: ['undefeated', 'drop'] }); popText(c, st, 'UNDEFEATED', 1440, 880, at(st, 'undefeated'), { size: 96, anim: 'slam', sfx: false }); sparkles(c, 1200, 350, 480, 500, st.t, 8); }
  } });

shot({ at: 'And Irynakhty', bg: 'v_gold', trans: 'cut', sfx: [['rimshot', 'at the bottom', 1]],
  draw: (c, st) => {
    rays(c, st.t);
    const up = pr_(st, 'very top', 0.8, E.out);
    if (after(st, 'very top')) prop(c, st, 'podium', 960, 1080, { s: 1.4, enter: ['very top', 'up'] });
    ch(c, st, 'iry', { x: 960, y: 1060 - up * 280, s: 1.2, faces: [[0, 'serious'], ['very top', 'proud'], ['at the bottom', 'smug']], pose: after(st, 'very top') ? 'holdUp' : 'hold', hold: { R: after(st, 'very top') ? 'trophy' : 'book' } });
    label(c, st, 'THE HISTORY BOOKS', 960, 140, 'history books', { size: 70, fill: '#fff' });
    popText(c, st, '...BY WORKING\nAT THE BOTTOM', 1520, 560, at(st, 'at the bottom'), { size: 72, anim: 'pop', sfx: false, fill: '#ff6b9a' });
  } });

chapter('ch2', 2, 'BABYLON', 'MESOPOTAMIA', 'market');

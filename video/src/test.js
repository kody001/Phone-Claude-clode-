// Visual test sheet (not part of the video)
shot({ at: 0, bg: 'clinic', cam: null, draw: (c, st) => {
  const names = ['you', 'doctor', 'caveman', 'cavedoc', 'iry', 'rod'];
  const faces = ['nervous', 'smug', 'happy', 'grin', 'serious', 'smug'];
  names.forEach((n, i) => ch(c, st, n, { x: 180 + i * 310, y: 1000, s: 0.85, face: faces[i], pose: ['idle', 'hold', 'shrug', 'hold', 'hips', 'point'][i], hold: { R: [null, 'clip', null, 'rock', null, 'scroll'][i] }, holes: n === 'caveman' ? 'healed' : 0 }));
} });
shot({ at: 10, bg: 'market', cam: null, draw: (c, st) => {
  const names = ['bab_sick', 'bab_pass', 'asu', 'ashipu', 'hamm', 'bab_doc'];
  const faces = ['sad', 'talk', 'happy', 'smug', 'angry', 'shock'];
  names.forEach((n, i) => ch(c, st, n, { x: 180 + i * 310, y: 1000, s: 0.85, face: faces[i], pose: ['idle', 'shrug', 'hold', 'hold', 'hold', 'idle'][i], hold: { R: [null, null, 'bowl', 'incense', 'scepter', 'lancet'][i] } }));
} });
shot({ at: 20, bg: 'sanctuary', cam: null, draw: (c, st) => {
  const names = ['asclepius', 'kleo', 'ambrosia', 'baby', 'greek', 'plutarch'];
  const faces = ['smug', 'happy', 'laugh', 'happy', 'neutral', 'serious'];
  names.forEach((n, i) => ch(c, st, n, { x: 180 + i * 310, y: 1000, s: 0.85, face: faces[i], pose: ['hold', 'idle', 'idle', 'armsUp', 'idle', 'hold'][i], hold: { R: ['staff', null, null, null, null, 'scroll'][i] } }));
} });
shot({ at: 30, bg: 'rome', cam: null, draw: (c, st) => {
  const names = ['cato', 'marcus', 'caesar', 'senator', 'catowife', 'youngwife'];
  const faces = ['angry', 'happy', 'smug', 'bored', 'sad', 'happy'];
  names.forEach((n, i) => ch(c, st, n, { x: 180 + i * 310, y: 1000, s: 0.85, face: faces[i], pose: ['hold', 'idle', 'present', 'cross', 'idle', 'wave'][i], hold: { R: ['cabbage', null, 'scroll', null, null, null] [i] } }));
} });
shot({ at: 40, bg: 'desert', cam: null, draw: (c, st) => {
  prop(c, st, 'ibis', 300, 700, { s: 0.9 });
  prop(c, st, 'croc', 900, 850, { s: 0.8 });
  prop(c, st, 'honey', 1400, 800, { s: 1.2 });
  prop(c, st, 'dung', 1650, 900, { s: 1 });
  prop(c, st, 'snake', 1500, 500, { s: 1, shades: true });
} });
shot({ at: 50, bg: 'abaton', cam: null, draw: (c, st) => {
  prop(c, st, 'stele', 300, 1000, { s: 0.8 });
  prop(c, st, 'slab', 800, 1000, { s: 0.75 });
  prop(c, st, 'pig', 1300, 800, { s: 1.2, silver: true });
  prop(c, st, 'falseDoor', 1650, 1000, { s: 0.6 });
  ch(c, st, 'ghost', { x: 1100, y: 600, s: 0.6, face: 'smug' });
} });
shot({ at: 60, bg: 'street', cam: null, draw: (c, st) => {
  prop(c, st, 'ambulance', 800, 900, { s: 1.2 });
  prop(c, st, 'ship', 1600, 700, { s: 0.6 });
  listCard(c, st, "TEST TITLE", ['ITEM ONE', 'ITEM TWO'], [st.s.start + 0.5, st.s.start + 1]);
} });
shot({ at: 70, bg: 'map_med', cam: null, vig: 0.3, draw: (c, st) => {
  card(c, st, 700, 500, 600, 400, st.s.start + 0.2, (c, w, h) => { c.drawImage(bgCanvas('desert'), 0, 0, w, h); });
  txt(c, 'EGYPT', 1300, 900, { size: 60, font: '"Patrick Hand"', fill: INK, lw: 0, shadow: false });
} });
shot({ at: 80, bg: 'cave', cam: null, draw: (c, st) => {
  fire(c, 960, 900, 1.6, st.t);
  ch(c, st, 'caveman', { x: 600, y: 980, s: 1.1, face: 'scared', holes: true, pose: 'scared' });
  ch(c, st, 'cavedoc', { x: 1300, y: 980, s: 1.1, face: 'grin', pose: 'holdUp', hold: { R: 'rock' }, flip: true });
} });
shot({ at: 90, bg: 'farm', cam: null, draw: (c, st) => {
  ch(c, st, 'cato', { x: 960, y: 1300, s: 2.2, face: 'yell', pose: 'fists' });
} });

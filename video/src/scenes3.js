// PART 3: GREECE
'use strict';
const PIN_GR = medP(23.08, 37.6);
shot({ at: "Meanwhile, back in Rod's own Greece", bg: 'map_med', mus: 'greece', trans: 'zoom', vig: 0.4,
  cam: [[0, 1.0, 0, 0], ['Greece', 2.0, PIN_GR[0] - W / 2, PIN_GR[1] - H / 2, E.io, 1.2]],
  draw: (c, st) => {
    label(c, st, 'GREECE', PIN_GR[0] - 30, PIN_GR[1] - 70, 'Greece', { size: 40, fill: '#ffd23f' });
    label(c, st, 'a different plan...', PIN_GR[0] + 30, PIN_GR[1] + 70, 'different plan', { size: 26, fill: '#fff', font: '"Patrick Hand"', lw: 6 });
  } });

shot({ at: "They didn't go to the market", bg: 'v_navy', trans: 'whip', sfx: [['scribble', 'to the market', 0.7], ['yawn', 'went to sleep', 0.8]],
  draw: (c, st) => {
    card(c, st, 560, 520, 640, 420, at(st, "didn't go"), (cc, w, h) => { cc.drawImage(bgCanvas('market'), 0, 0, w, h); }, { rot: -0.05, drift: 1 });
    if (after(st, 'to the market')) bigX(c, 560, 520, 1.2, pr_(st, 'to the market', 0.3));
    card(c, st, 1360, 520, 640, 420, at(st, 'went to sleep'), (cc, w, h) => { cc.drawImage(bgCanvas('abaton'), 0, 0, w, h); cc.save(); cc.translate(w / 2, h - 30); cc.scale(0.5, 0.5); ch(cc, st, 'greek_pat', { x: 0, y: 0, s: 1, face: 'sleep', lie: true }); cc.restore(); zzz(cc, w / 2 + 60, h / 2, st.t, 0.8); }, { rot: 0.05, drift: 1 });
    popText(c, st, 'THEY WENT TO SLEEP', 960, 840, at(st, 'went to sleep'), { size: 90, anim: 'slam', sfx: 'impact' });
  } });

shot({ at: 'Welcome to Epidaurus', bg: 'sanctuary', amb: 'birds', trans: 'whip', sfx: [['choir', 'Epidaurus', 0.6]],
  cam: { push: 0.07 },
  draw: (c, st) => {
    popText(c, st, 'EPIDAURUS', 960, 300, at(st, 'Epidaurus'), { size: 170, font: '"Cinzel"', weight: 900, fill: '#fff6d0', anim: 'rise', sfx: false });
    label(c, st, 'SOUTHERN GREECE', 960, 450, 'southern Greece', { size: 56, fill: '#ffd23f' });
    if (after(st, 'most famous')) { prop(c, st, 'stars', 960, 600, { s: 1.4, enter: ['most famous', 'pop'] }); label(c, st, 'MOST FAMOUS HEALING SANCTUARY', 960, 730, 'healing sanctuary', { size: 58, fill: '#fff' }); }
  } });

shot({ at: 'run in the name of Asclepius', bg: 'v_teal', trans: 'whip', sfx: [['choir', 'Asclepius', 0.7]],
  draw: (c, st) => {
    glow(c, 480, 420, 420, 'rgba(255,255,220,0.4)');
    ch(c, st, 'asclepius', { x: 480, y: 1180, s: 1.65, face: 'smug', enter: [0, 'up'] });
    nameCard(c, st, 'ASCLEPIUS', 'Asclepius', { x: 1300, y: 430, size: 140, sub: 'GOD OF MEDICINE', subAt: 'god of medicine' });
  } });

const STAFF_POSE = [[10, 6], [36, 10]];
shot({ at: 'Picture a tall bearded stick figure', bg: 'sanctuary', amb: 'birds', trans: 'cut',
  draw: (c, st) => {
    ch(c, st, 'asclepius', { x: 900, y: GY, s: 1.08, face: 'smug', pose: STAFF_POSE, hold: { R: ['staff', { s: 0.78 }] }, headTilt: 4 });
    label(c, st, 'TALL', 560, 260, 'tall', { size: 60, fill: '#fff', ax: 760, ay: 330 });
    label(c, st, 'BEARDED', 520, 520, 'bearded', { size: 60, fill: '#fff', ax: 840, ay: 590 });
    label(c, st, 'ROBE', 520, 800, 'in a robe', { size: 60, fill: '#fff', ax: 830, ay: 840 });
    label(c, st, 'SNAKE STAFF', 1500, 360, 'snake wrapped', { size: 60, fill: '#7ee05a', ax: 1100, ay: 420 });
  } });

shot({ at: 'Yep. That snake', bg: 'v_black', mus: 'whisper', trans: 'zoom', sfx: [['snake_hiss', 0.1, 0.9], ['ding', 'That snake', 0.6]], cam: { push: 0.12 },
  draw: (c, st) => {
    glow(c, 960, 540, 600, 'rgba(90,200,120,0.3)');
    c.save(); c.translate(960, 760); c.scale(1.9, 1.9); drawProp(c, st, 'staff', {}); c.restore();
    if (after(st, 'That snake')) { c.save(); c.translate(1040, 120); c.scale(1.9, 1.9); rrect(c, -48, -12, 46, 22, 6, { fill: '#111', lw: 4 }); rrect(c, 4, -12, 46, 22, 6, { fill: '#111', lw: 4 }); c.restore(); sparkles(c, 900, 40, 400, 200, st.t, 5); }
  } });

shot({ at: "Here's how a visit worked", bg: 'sanctuary', amb: 'birds', mus: 'greece', trans: 'whip', sfx: [['splash', 'you wash', 0.9], ['ding', 'make an offering', 0.7]],
  draw: (c, st) => {
    prop(c, st, 'fountain', 1000, 980, { s: 1.0 });
    prop(c, st, 'altar', 1560, 990, { s: 1.0 });
    if (after(st, 'make an offering')) prop(c, st, 'cake', 1560, 800, { s: 1.0, enter: ['make an offering', 'drop'] });
    let x = 460, face = 'sad';
    if (after(st, 'you wash')) { x = 800; face = 'neutral'; }
    if (after(st, 'make an offering')) { x = 1320; face = 'happy'; }
    ch(c, st, 'greek_pat', { x, y: GY, s: 1.0, face, green: !after(st, 'you wash'), pose: after(st, 'make an offering') ? 'present' : 'idle', id: 'pat' });
    const steps = [['1. SHOW UP SICK', 'show up sick'], ['2. WASH', 'you wash'], ['3. MAKE AN OFFERING', 'make an offering']];
    steps.forEach((s2, i) => popText(c, st, s2[0], 420 + i * 560, 170, at(st, s2[1]), { size: 58, anim: 'rise', sfx: 'swoosh_up', fill: i === 0 ? '#9be34a' : '#ffd23f' }));
  } });

shot({ at: 'Then at night, you lie down', bg: 'abaton', amb: 'night', mus: 'night', trans: 'fade', td: 0.6, sfx: [['snore', 'sick strangers', 0.6], ['snore', 'go to sleep', 0.5]],
  draw: (c, st) => {
    const mats = [[420, 'greek', 's1'], [960, 'greek_pat', 'pat'], [1500, 'greekw', 's2']];
    mats.forEach((m, i) => {
      prop(c, st, 'mat', m[0], 960, { s: 0.9 });
      const show = m[2] !== 'pat' || after(st, 'lie down');
      if (show) ch(c, st, m[1], { x: m[0] + 10, y: 930, s: 0.85, face: m[2] === 'pat' && !after(st, 'go to sleep') ? 'nervous' : 'sleep', lie: true, id: m[2], green: m[2] === 'pat' });
      if (m[2] !== 'pat' && after(st, 'sick strangers')) zzz(c, m[0] + 60, 720, st.t + i, 1);
    });
    if (after(st, 'go to sleep')) zzz(c, 1020, 720, st.t, 1.2);
    label(c, st, 'THE ABATON', 960, 180, 'abaton', { size: 90, fill: '#bcd2ff' });
  } });

shot({ at: 'The god is supposed to visit you', bg: 'dream', amb: 'night', mus: 'dream', trans: 'fade', td: 0.5, sfx: [['harp', 0.1, 0.9], ['magic', 'heal you on the spot', 0.9], ['paper_in', 'tell you what to do', 0.7], ['cash', 'you pay', 1]],
  draw: (c, st) => {
    ch(c, st, 'greek_pat', { x: 600, y: 990, s: 0.9, face: 'sleep', lie: true, id: 'pat' });
    zzz(c, 660, 800, st.t, 1);
    const p = pr_(st, 0.2, 0.6, E.back);
    c.save(); c.translate(1150, 450); c.scale(p, p);
    thoughtCloud(c, 0, 0, 760, 560, -420, 420, 4);
    ch(c, st, 'asclepius', { x: 0, y: 250, s: 0.72, face: after(st, 'you pay') ? 'smug' : 'happy', pose: after(st, 'you pay') ? 'reach' : after(st, 'tell you what') ? 'holdUp' : STAFF_POSE, hold: { R: after(st, 'you pay') ? ['price', { text: 'INVOICE', s: 0.8 }] : after(st, 'tell you what') ? 'scroll' : ['staff', { s: 0.78 }] }, noShadow: true });
    c.restore();
    if (after(st, 'heal you on the spot') && !after(st, 'tell you what')) sparkles(c, 420, 760, 400, 220, st.t, 8);
    label(c, st, 'HEAL YOU...', 360, 200, 'heal you', { size: 60, fill: '#fff' });
    label(c, st, '...OR GIVE INSTRUCTIONS', 520, 300, 'tell you what to do', { size: 52, fill: '#ffd23f' });
    popText(c, st, 'THEN YOU PAY.', 1150, 970, at(st, 'you pay'), { size: 90, anim: 'slam', sfx: false });
  } });

shot({ at: "It's a hospital where the main treatment is a nap", bg: 'abaton', amb: 'night', mus: 'lullaby', trans: 'whip', sfx: [['snore', 0.4, 0.5], ['ding', 'most relatable', 0.8]],
  draw: (c, st) => {
    prop(c, st, 'mat', 760, 960, { s: 1.4 });
    ch(c, st, 'greek_pat', { x: 780, y: 930, s: 1.3, face: 'sleep', lie: true, id: 'pat' });
    shp(c, rrectPts(420, 800, 640, 110, 30), { fill: '#7a63c9', lw: 7 });
    zzz(c, 860, 650, st.t, 1.4);
    prop(c, st, 'sign', 1450, 760, { s: 1.0, text: 'TREATMENT: NAP', w: 520, color: '#f1e3c0' });
    if (after(st, 'most relatable')) { prop(c, st, 'trophy', 1450, 360, { s: 1.4, enter: ['most relatable', 'drop'] }); label(c, st, 'MOST RELATABLE HEALTHCARE', 960, 150, 'most relatable', { size: 66, fill: '#ffd23f', sfx: false }); }
  } });

shot({ at: 'So how do we know all this', bg: 'sanctuary', amb: 'birds', trans: 'whip', sfx: [['chisel', 'carved its success', 0.8], ['chisel', 'success stories', 0.7], ['chisel', 'stone slabs', 0.7]],
  draw: (c, st) => {
    prop(c, st, 'slab', 640, 1000, { s: 0.85 });
    prop(c, st, 'slab', 1180, 1000, { s: 0.85, seed: 77 });
    const hit = Math.floor(st.t * 2.5) % 2 === 0;
    ch(c, st, 'greek', { x: 1560, y: GY, s: 1.0, flip: true, face: 'serious', pose: hit ? [[10, 6], [70, 60]] : [[10, 6], [110, 140]], hold: { R: 'hammer' }, id: 'carver' });
    popText(c, st, 'HOW DO WE KNOW?', 960, 150, at(st, 'how do we know'), { size: 84, anim: 'rise', sfx: 'swoosh_up' });
    label(c, st, 'SUCCESS STORIES', 900, 260, 'success stories', { size: 60, fill: '#ffd23f' });
  } });

shot({ at: "They're called the iamata", bg: 'sanctuary', amb: 'birds', trans: 'cut', cam: [[0, 1.3, -120, 60]],
  draw: (c, st) => {
    prop(c, st, 'slab', 820, 1060, { s: 1.0 });
    popText(c, st, 'IAMATA', 1380, 420, at(st, 'iamata'), { size: 130, font: '"Cinzel"', weight: 900, fill: '#fff6d0', anim: 'slam', sfx: 'impact' });
    label(c, st, '= "CURES"', 1380, 580, 'means', { size: 80, fill: '#ffd23f' });
  } });

shot({ at: 'Think of them as online reviews', bg: 'sanctuary', amb: 'birds', trans: 'whip', sfx: [['keys', 'online reviews', 0.6], ['notify', 'carved in stone', 0.7]],
  draw: (c, st) => {
    prop(c, st, 'slab', 540, 1030, { s: 0.85 });
    if (after(st, 'online reviews')) { const p = pr_(st, 'online reviews', 0.35, E.back); c.save(); c.translate(1220, 470); c.scale(p, p); uiCard(c, 0, 0, 900, 520, 'REVIEWS  •  SANCTUARY OF ASCLEPIUS', ['', '"Best nap of my life. Cured!"', '— definitely a real patient'], { head: '#2fa39a' }); c.save(); c.translate(0, -100); drawProp(c, st, 'stars', { n: 5 }); c.restore(); c.restore(); }
    ch(c, st, 'greek', { x: 1500, y: GY + 40, s: 0.95, flip: true, faces: [[0, 'neutral'], ['restaurant', 'sly']], pose: 'hold', hold: { R: 'chisel' }, enter: ['written by', 'right'], id: 'priest' });
    label(c, st, 'WRITTEN BY THE RESTAURANT', 960, 120, 'written by the restaurant', { size: 60, fill: '#ff6b9a' });
  } });

shot({ at: 'And they are wild', bg: 'sanctuary', amb: 'birds', trans: 'whip', sfx: [['flip_pages', 'five years', 0.8], ['crowd_gasp', 'Five.', 1]], punch: [['Five.', 0.12]],
  draw: (c, st) => {
    ch(c, st, 'kleo', { x: 640, y: GY, s: 1.25, faces: [[0, 'neutral'], ['pregnant', 'bored'], ['Five.', 'nervous']], sweat: after(st, 'Five.'), enter: ['woman named Kleo', 'left'] });
    label(c, st, 'KLEO', 640, 260, 'Kleo', { size: 90, fill: '#ffd23f' });
    popText(c, st, 'THE CLAIMS GET WILD', 960, 150, at(st, 'they are wild'), { size: 84, anim: 'slam', sfx: 'impact', out: at(st, 'woman named') });
    const t5 = at(st, 'five years');
    if (st.t > t5 - 0.2) { const n = Math.min(5, 1 + Math.floor((st.t - t5 + 0.2) * 4)); prop(c, st, 'calendar', 1350, 520, { s: 1.6, top: 'YEAR', num: String(n) }); }
    popText(c, st, 'PREGNANT FOR 5 YEARS', 1350, 800, at(st, 'pregnant'), { size: 70, anim: 'rise', sfx: 'swoosh_up' });
    popText(c, st, 'FIVE.', 1350, 170, at(st, 'Five.'), { size: 150, anim: 'slam', sfx: 'impact', fill: '#ff4d3a' });
  } });

shot({ at: 'She slept in the abaton, walked out', bg: t => (t < 0 ? 'abaton' : 'abaton'), amb: 'birds', trans: 'cut', sfx: [['snore', 0.2, 0.5], ['ta_da', 'gave birth', 0.9], ['pop', 'gave birth', 0.8], ['splash', 'washed himself', 1], ['footsteps', 'walked around', 0.6]],
  draw: (c, st) => {
    const out = after(st, 'walked out');
    if (out) c.drawImage(bgCanvas('sanctuary'), 0, 0, W, H);
    if (!out) { prop(c, st, 'mat', 900, 960, { s: 1.0 }); ch(c, st, 'kleo', { x: 920, y: 930, s: 0.95, face: 'sleep', lie: true }); zzz(c, 980, 720, st.t); return; }
    prop(c, st, 'fountain', 1350, 980, { s: 1.0 });
    const born = after(st, 'gave birth');
    ch(c, st, 'kleo', { x: 520, y: GY, s: 1.15, faces: [[0, 'neutral'], ['gave birth', 'shock'], ['walked around', 'happy']], pre: born ? { acc: [] } : {}, move: [['walked around', 860, GY, 1.4]], walk: after(st, 'walked around') && st.t < at(st, 'walked around') + 1.4 });
    if (born) {
      const tw = at(st, 'washed himself'), tr = at(st, 'walked around');
      let bx = 760, by = GY, face = 'happy';
      if (st.t > tw) { const p = clamp((st.t - tw) / 0.6); bx = lerp(760, 1350, p); by = GY - Math.sin(p * Math.PI) * 300 - (p >= 1 ? 90 : 0); }
      if (st.t > tr) { const p = clamp((st.t - tr) / 1.4); bx = lerp(1350, 1060, p); by = GY; face = 'smug'; }
      ch(c, st, 'baby', { x: bx, y: by, s: 1.0, face, enter: ['gave birth', 'pop'], walk: st.t > tr && st.t < tr + 1.4 });
    }
    label(c, st, 'A SON!', 760, 420, 'gave birth', { size: 70, fill: '#ffd23f', sfx: false });
  } });

shot({ at: 'A newborn. Running his own bath', bg: 'sanctuary', amb: 'birds', trans: 'cut', sfx: [['squeak', 'own bath', 0.9], ['splash', 0.2, 0.5]], cam: { push: 0.06 },
  draw: (c, st) => {
    prop(c, st, 'fountain', 960, 1060, { s: 2.2 });
    ch(c, st, 'baby', { x: 960, y: 980, s: 2.0, face: 'smug', pose: [[60, -150], [30, -60]], hold: { R: 'brush' } });
    prop(c, st, 'duckToy', 1280, 940, { s: 1.6, bob: 8 });
    popText(c, st, 'DAY 1: SELF-CARE', 960, 140, at(st, 'own bath'), { size: 90, anim: 'slam', sfx: 'impact' });
  } });

shot({ at: 'But my favorite person', bg: 'v_pink', mus: 'greece', trans: 'whip', sfx: [['ta_da', 'Ambrosia of Athens', 0.8]],
  draw: (c, st) => {
    rays(c, st.t, 'rgba(255,255,255,0.12)');
    for (let i = 0; i < 6; i++) { const ph = (st.t * 0.3 + i / 6) % 1; prop(c, st, 'heart', 200 + i * 300, 1100 - ph * 1200, { s: 0.5, alpha: 0.7 }); }
    ch(c, st, 'ambrosia', { x: 520, y: 1180, s: 1.7, face: 'smug', enter: [0, 'left'] });
    nameCard(c, st, 'AMBROSIA\nOF ATHENS', 'Ambrosia', { x: 1300, y: 460, size: 130 });
    label(c, st, 'MY FAVORITE', 1300, 180, 'favorite person', { size: 56, fill: '#fff' });
  } });

shot({ at: 'She was blind in one eye', bg: 'sanctuary', amb: 'birds', trans: 'whip', sfx: [['ha', 'she laughed', 0.8]],
  draw: (c, st) => {
    const reading = after(st, 'reading the miracle');
    prop(c, st, 'slab', 1300, 1000, { s: 0.85 });
    ch(c, st, 'ambrosia', { x: reading ? 900 : 620, y: GY, s: 1.15, flip: false, faces: [[0, 'neutral'], ['reading', 'bored'], ['laughed', 'laugh'], ['nobody gets', 'smug']], pose: reading ? 'hips' : [[10, 6], [30, -150]], look: reading ? [0.7, -0.2] : [0, 0] });
    label(c, st, 'BLIND IN ONE EYE', 620, 230, 'blind in one eye', { size: 58, fill: '#fff', ax: 600, ay: 540 });
    if (after(st, 'laughed')) popText(c, st, 'HA!', 760, 300, at(st, 'laughed'), { size: 120, anim: 'pop', sfx: false, wiggle: true });
    if (after(st, 'nobody gets')) { const p = pr_(st, 'nobody gets', 0.3, E.back); c.save(); c.translate(760, 220); c.scale(p, p); bubble(c, 0, 0, 760, 130, 120, 240, 'NOBODY GETS CURED BY A DREAM!', { size: 46 }); c.restore(); cue('pop', at(st, 'nobody gets'), 0.6); }
  } });

shot({ at: 'Which, honestly', bg: 'sanctuary', amb: 'birds', trans: 'cut', sfx: [['correct', 'Fair point', 0.9]],
  draw: (c, st) => {
    ch(c, st, 'ambrosia', { x: 760, y: 1240, s: 2.1, face: 'smug', pose: 'cross' });
    check(c, 1420, 500, 1.3, pr_(st, 'Fair point', 0.4));
    popText(c, st, 'FAIR POINT.', 1420, 820, at(st, 'Fair point'), { size: 100, anim: 'slam', sfx: false });
  } });

shot({ at: 'Then she slept in the abaton', bg: 'abaton', amb: 'night', mus: 'dream', trans: 'fade', td: 0.5, sfx: [['choir', 'god appeared', 0.9], ['harp', 'in her dream', 0.7]],
  draw: (c, st) => {
    const dream = after(st, 'god appeared');
    if (dream) c.drawImage(bgCanvas('dream'), 0, 0, W, H);
    prop(c, st, 'mat', 560, 990, { s: 0.9 });
    ch(c, st, 'ambrosia', { x: 580, y: 960, s: 0.85, face: 'sleep', lie: true });
    zzz(c, 640, 760, st.t);
    if (dream) {
      glow(c, 1250, 420, 520, 'rgba(255,255,220,0.5)');
      ch(c, st, 'asclepius', { x: 1250, y: 1060, s: 1.5, face: 'smug', pose: after(st, 'a fee') ? 'reach' : STAFF_POSE, hold: { R: after(st, 'a fee') ? ['price', { text: 'FEE', s: 0.8 }] : ['staff', { s: 0.78 }] }, enter: ['god appeared', 'fade', 0.7], talk: ["sure, I'll heal", 'a fee'] });
    }
  } });

shot({ at: 'You have to dedicate a silver pig', bg: 'dream', amb: 'night', trans: 'cut', sfx: [['oink', 'silver pig', 1], ['sparkle', 'silver pig', 0.7]],
  draw: (c, st) => {
    glow(c, 1300, 420, 520, 'rgba(255,255,220,0.5)');
    ch(c, st, 'asclepius', { x: 1350, y: 1100, s: 1.55, flip: true, face: 'smug', pose: 'point', talk: ['You have to', 'ignorance'] });
    prop(c, st, 'pig', 640, 640, { s: 1.6, silver: true, enter: ['silver pig', 'drop'] });
    stamp(c, st, 'A MEMORIAL OF\nYOUR IGNORANCE', 640, 200, 'memorial', { size: 66, color: '#c9a0ff' });
  } });

shot({ at: 'And the slab says she walked out healed', bg: 'sanctuary', amb: 'birds', mus: 'greece', trans: 'flash', sfx: [['ta_da', 'healed', 1], ['birds', 0.2, 0.6]],
  draw: (c, st) => {
    ch(c, st, 'ambrosia', { x: 300, y: GY, s: 1.2, faces: [[0, 'shock'], ['healed', 'laugh']], healed: true, move: [[0, 900, GY, 1.5]], walk: st.lt < 1.5, poses: [['healed', 'armsUp']], hops: ['the next day'] });
    sparkles(c, 700, 300, 500, 300, st.t, 7);
    popText(c, st, 'HEALED!', 1400, 330, at(st, 'healed'), { size: 140, anim: 'slam', sfx: 'impact' });
  } });

shot({ at: 'So the sanctuary got', bg: 'v_teal', trans: 'whip',
  draw: (c, st) => {
    ch(c, st, 'asclepius', { x: 330, y: 1160, s: 1.6, face: 'smug', pose: 'hold', hold: { R: ['scroll', {}] } });
    listCard(c, st, 'THE SANCTUARY GOT:', ['A CONVERTED SKEPTIC', 'A SILVER PIG', 'A FREE CAUTIONARY TALE'], [at(st, 'converted skeptic'), at(st, 'a silver pig'), at(st, 'cautionary tale')], { x: 1180, y: 190, gap: 170, is: 72 });
  } });

shot({ at: "That's not a miracle", bg: 'v_navy', trans: 'whip', sfx: [['cash', 'marketing department', 1]],
  draw: (c, st) => {
    prop(c, st, 'table', 960, 1020, { s: 1.6 });
    ch(c, st, 'asclepius', { x: 800, y: 1000, s: 1.15, face: 'smug', pose: 'present' });
    prop(c, st, 'snake', 1250, 860, { s: 0.8, shades: true });
    rrect(c, 1350, 220, 440, 340, 10, { fill: '#fff', lw: 7 });
    const p = pr_(st, 'marketing', 1.0);
    line(c, [[1390, 520], [1470, 460], [1550, 480], [1640, 360], [1740, 260]].slice(0, 2 + Math.floor(p * 3)), { lw: 10, stroke: '#2fbf4a' });
    stamp(c, st, 'NOT A MIRACLE', 640, 250, 'not a miracle', { size: 80 });
    popText(c, st, 'MARKETING DEPT.', 1570, 640, at(st, 'marketing department'), { size: 66, anim: 'slam', sfx: 'impact' });
  } });

shot({ at: "You'd think a place advertising", bg: 'sanctuary', amb: 'birds', trans: 'whip', sfx: [['deflate', 'lose a little credibility', 0.8], ['boing', 'Nope', 1]],
  draw: (c, st) => {
    c.save(); c.translate(760, 560); c.rotate(-0.03);
    line(c, [[-200, 300], [-200, 120]], { lw: 18, stroke: '#7a4b22' }); line(c, [[200, 300], [200, 120]], { lw: 18, stroke: '#7a4b22' });
    rrect(c, -460, -250, 920, 380, 14, { fill: '#fffbe8', lw: 9 });
    txt(c, '5-YEAR PREGNANCIES!', 0, -150, { size: 74, fill: '#e0262d', lw: 0, shadow: false });
    c.save(); c.translate(0, -40); drawProp(c, st, 'stars', { n: 5 }); c.restore();
    txt(c, 'Visit the Sanctuary of Asclepius', 0, 60, { size: 40, fill: INK, lw: 0, shadow: false, font: '"Patrick Hand"' });
    c.restore();
    // credibility meter
    const drop = pr_(st, 'lose a little', 0.8), back = pr_(st, 'Nope', 0.4, E.elastic);
    const v = clamp(0.92 - drop * 0.7 + back * 0.7);
    rrect(c, 1500, 220, 120, 600, 20, { fill: '#fff', lw: 8 });
    c.fillStyle = v > 0.5 ? '#2fbf4a' : '#e0262d'; c.fillRect(1510, 230 + 580 * (1 - v), 100, 580 * v);
    label(c, st, 'CREDIBILITY', 1560, 170, 0.1, { size: 48, fill: '#fff', sfx: false });
    popText(c, st, 'NOPE.', 1560, 900, at(st, 'Nope'), { size: 110, anim: 'slam', sfx: false });
  } });

shot({ at: 'Asclepius sanctuaries spread', bg: 'map_med', trans: 'zoom', vig: 0.4, cam: [[0, 1.35, 120, -40]],
  draw: (c, st) => {
    const t0 = at(st, 'spread across');
    const spots = [[23.08, 37.6], [26.9, 36.9], [23.7, 38.0], [27.3, 39.1], [21.6, 37.6], [22.4, 39.6], [15.3, 37.0], [12.5, 41.9], [33.0, 35.1], [25.1, 35.3], [28.0, 36.4], [24.4, 40.9], [20.7, 39.2]];
    spots.forEach((p, i) => { const t = t0 + i * 0.22; cue('pop', t, 0.4); if (st.t < t) return; const q = medP(p[0], p[1]); c.save(); c.translate(q[0], q[1]); c.scale(0.16 * prog(st.t, t, 0.3, E.back), 0.16 * prog(st.t, t, 0.3, E.back)); drawProp(c, st, 'temple', {}); c.restore(); });
    label(c, st, 'BUSY FOR CENTURIES', 1050, 760, 'for centuries', { size: 60, fill: '#ffd23f' });
  } });

shot({ at: 'Side effects may include: vivid dreams', bg: null, trans: 'flash', mus: 'ad', cam: { push: 0.02 }, vig: 0.2,
  draw: (c, st) => {
    sideEffects(c, st, ['VIVID DREAMS', 'A STRANGER SNORING NEXT TO YOU', 'OWING A GOD A SILVER PIG'], [at(st, 'vivid dreams'), at(st, 'a stranger'), at(st, 'owing a god')], [
      (c2) => { c2.save(); c2.scale(0.28, 0.28); thoughtCloud(c2, 0, 0, 400, 260, -150, 200); c2.restore(); },
      (c2, st2) => { ch(c2, st2, 'greek', { x: 0, y: 30, s: 0.3, face: 'sleep', lie: true, noShadow: true }); zzz(c2, 20, -20, st2.t, 0.5); },
      (c2, st2) => { c2.save(); c2.scale(0.5, 0.5); drawProp(c2, st2, 'pig', { silver: true }); c2.restore(); },
    ]);
  } });

shot({ at: 'Ambrosia got her eye fixed', bg: 'v_navy', mus: 'greece', trans: 'whip',
  draw: (c, st) => {
    miniCard(c, st, 340 + 0, 470, 'eye fixed', 'sanctuary', 'EYE: FIXED', cc => ch(cc, st, 'ambrosia', { x: 0, y: -40, s: 1.3, face: 'happy', healed: true }));
    miniCard(c, st, 960, 470, 'got its pig', 'abaton', 'PIG: COLLECTED', cc => { cc.save(); cc.translate(0, -200); cc.scale(1.6, 1.6); drawProp(cc, st, 'pig', { silver: true }); cc.restore(); });
    miniCard(c, st, 1580, 470, 'side of the story', 'sanctuary', "THEIR SIDE OF THE STORY", cc => { drawProp(cc, st, 'slab', { s: 0.75 }); });
  } });

shot({ at: 'Silver pig, golden PR', bg: 'v_gold', trans: 'cut', sfx: [['oink', 'Silver pig', 0.8], ['ta_da', 'golden PR', 1]],
  draw: (c, st) => {
    rays(c, st.t, 'rgba(255,255,255,0.15)');
    prop(c, st, 'pig', 700, 640, { s: 2.0, silver: true, enter: ['Silver pig', 'pop'] });
    if (after(st, 'golden PR')) { prop(c, st, 'trophy', 1350, 560, { s: 2.2, enter: ['golden PR', 'drop'] }); txt(c, 'PR', 1350, 520, { size: 80, fill: '#fff' }); }
    popText(c, st, 'SILVER PIG, GOLDEN PR', 960, 150, at(st, 'Silver pig'), { size: 96, anim: 'rise', sfx: 'swoosh_up' });
  } });

chapter('ch4', 4, 'ROME', '~200 BC', 'rome');

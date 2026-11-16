// PART 2: BABYLON
'use strict';
shot({ at: 'Now, remember Herodotus', bg: 'market', amb: 'market', mus: 'babylon', trans: 'zoom',
  draw: (c, st) => {
    const looking = after(st, 'looked around');
    ch(c, st, 'rod', { x: -200, y: GY, s: 1.15, face: looking ? 'confused' : 'smug', pose: 'hold', hold: { R: 'scroll' }, move: [[0, 760, GY, 1.6]], walk: st.lt < 1.6, look: looking ? [Math.sin(st.t * 2.5), 0] : [0.5, 0] });
    label(c, st, 'BABYLON', 1300, 180, 'Babylon', { size: 110, fill: '#ffd23f' });
    if (after(st, 'decided')) {
      const p = pr_(st, 'decided', 0.4, E.back);
      c.save(); c.translate(1250, 470); c.scale(p, p);
      thoughtCloud(c, 0, 0, 520, 320, -330, 190);
      ch(c, st, 'doctor', { x: 0, y: 140, s: 0.45, face: 'happy', noShadow: true });
      if (after(st, "didn't have")) bigX(c, 0, 20, 0.9, pr_(st, "didn't have", 0.3));
      c.restore();
      cue('scribble', at(st, "didn't have"), 0.7);
    }
  } });

shot({ at: 'Herodotus is called the Father of History', bg: 'v_blue', trans: 'whip', sfx: [['choir', 'Father of History', 0.8], ['rec_scratch', 'Father of Lies', 0.9]],
  draw: (c, st) => {
    const lies = after(st, 'Father of Lies');
    if (!lies) glow(c, 520, 380, 360, 'rgba(255,240,160,0.6)');
    ch(c, st, 'rod', { x: 520, y: 1180, s: 1.75, faces: [[0, 'proud'], ['Father of Lies', 'shock']], sweat: lies });
    popText(c, st, 'FATHER OF\nHISTORY', 1320, 320, at(st, 'Father of History'), { size: 110, font: '"Cinzel"', weight: 900, fill: '#ffd86b', anim: 'rise', sfx: false });
    popText(c, st, 'FATHER OF LIES', 1320, 720, at(st, 'Father of Lies'), { size: 110, anim: 'slam', sfx: 'impact', fill: '#ff4d3a' });
  } });

shot({ at: 'Picture a big beard', bg: 'parchment', trans: 'cut',
  cam: [[0, 1, 0, 0], ['the confidence', 1.6, 0, -120, E.io, 0.8]],
  draw: (c, st) => {
    ch(c, st, 'rod', { x: 960, y: 1010, s: 1.25, faces: [[0, 'neutral'], ['confidence', 'smug']], pose: 'hold', hold: { R: 'scroll' },
      after: (cc, info) => { if (after(st, 'call him Rod')) { const p = pr_(st, 'call him Rod', 0.25, E.back); cc.save(); cc.translate(-10, info.shY + 90); cc.rotate(-0.08); cc.scale(p, p); rrect(cc, -70, -44, 140, 96, 10, { fill: '#fff', lw: 5 }); cc.fillStyle = '#e0262d'; cc.fillRect(-64, -38, 128, 30); txt(cc, 'HELLO', 0, -22, { size: 22, fill: '#fff', lw: 0, shadow: false }); txt(cc, 'Rod', 0, 22, { size: 42, fill: INK, lw: 0, shadow: false, font: '"Patrick Hand"' }); cc.restore(); } } });
    label(c, st, 'BIG BEARD', 560, 360, 'big beard', { size: 54, fill: '#6b4a2f', stroke: '#fff', ax: 880, ay: 640 });
    label(c, st, 'SCROLL', 1430, 520, 'a scroll', { size: 54, fill: '#6b4a2f', stroke: '#fff', ax: 1100, ay: 700 });
    label(c, st, 'SANDALS', 1400, 930, 'sandals', { size: 54, fill: '#6b4a2f', stroke: '#fff', ax: 1010, ay: 975 });
    if (after(st, 'confidence')) sparkles(c, 780, 320, 360, 240, st.t, 7);
    label(c, st, 'DOUBLE-CHECKS: 0', 960, 300, 'double-checked', { size: 50, fill: '#ff4d3a', stroke: '#fff' });
    popText(c, st, '"ROD"', 1240, 440, at(st, 'call him Rod'), { size: 90, anim: 'slam', sfx: 'stamp', fill: '#ffd23f' });
  } });

shot({ at: 'Around 430 BC', bg: 'study', amb: 'study', trans: 'whip', sfx: [['quill', 'Rod wrote', 0.8]],
  draw: (c, st) => {
    ch(c, st, 'rod', { x: 620, y: GY, s: 1.15, face: 'smug', pose: [[10, 6], [40, -40]], hold: { R: 'quill' } });
    prop(c, st, 'table', 1050, 1000, { s: 1.2 });
    rrect(c, 900, 700, 520, 220, 8, { fill: '#efe0b6', lw: 6 });
    typeText(c, st, 'Babylonians: no doctors.\nVery wise. -Rod', 930, 790, at(st, 'Rod wrote') + 0.2, { size: 40, cps: 16, sfx: false });
    yearSlam(c, st, '430 BC', '430', { x: 1300, y: 200 });
  } });

shot({ at: 'Instead, when someone got sick', bg: 'market', amb: 'market', trans: 'whip', sfx: [['footsteps', 'carried them', 0.7], ['thud', 'set them down', 1]],
  draw: (c, st) => {
    const tSet = at(st, 'set them down');
    const carry = clamp((st.t - at(st, 'carried them')) / (tSet - at(st, 'carried them')));
    const gx = lerp(-500, 960, E.out(carry));
    const down = st.t > tSet;
    const lift = down ? 0 : 180;
    prop(c, st, 'mat', gx, GY - lift - 10, { s: 1.0 });
    ch(c, st, 'you', { x: gx + 20, y: GY - lift - 40, s: 0.95, face: 'sad', green: true, lie: true, id: 'you' });
    if (!down || st.t < tSet + 1.2) {
      const ex = down ? (st.t - tSet - 0.3) * 900 : 0;
      ch(c, st, 'bab', { x: gx - 300 + Math.max(0, ex), y: GY, s: 1.0, face: 'neutral', pose: 'holdBoth', walk: !down, id: 'b1' });
      ch(c, st, 'bab_w', { x: gx + 300 + Math.max(0, ex), y: GY, s: 1.0, flip: true, face: 'neutral', pose: 'holdBoth', walk: !down, id: 'b2' });
    }
    label(c, st, 'TO THE MARKETPLACE!', 960, 170, 'marketplace', { size: 70, fill: '#ffd23f' });
  } });

shot({ at: 'Then anybody walking past', bg: 'market', amb: 'market', trans: 'cut', sfx: [['crowd_murmur', 0, 0.5]],
  draw: (c, st) => {
    prop(c, st, 'mat', 960, GY - 10, { s: 1.0 });
    ch(c, st, 'you', { x: 980, y: GY - 40, s: 0.95, face: 'sad', green: true, lie: true, id: 'you' });
    const ppl = [['bab', 380, 'walking past', 'TRY ONIONS!'], ['bab_w', 1540, 'knew someone', 'MY COUSIN HAD THAT!'], ['bab_pass', 700, 'what worked', 'DRINK MORE BEER!']];
    ppl.forEach((p, i) => {
      const t0 = at(st, p[2]);
      ch(c, st, p[0], { x: p[1], y: GY, s: 1.0, flip: p[1] > 960, face: 'happytalk', pose: 'point', enter: [t0 - st.s.start - 0.3, p[1] > 960 ? 'right' : 'left'], id: 'p' + i });
      if (st.t > t0 + 0.1) { const pp = prog(st.t, t0 + 0.1, 0.3, E.back); c.save(); c.translate(p[1], 300 + (i % 2) * 60); c.scale(pp, pp); bubble(c, 0, 0, 470, 110, p[1] > 960 ? -60 : 60, 170, p[3], { size: 44 }); c.restore(); cue('pop', t0 + 0.1, 0.5); }
    });
  } });

shot({ at: 'And according to Rod', bg: 'market', amb: 'market', trans: 'cut', sfx: [['whistle', 'in silence', 1]],
  draw: (c, st) => {
    prop(c, st, 'mat', 960, GY - 10, { s: 1.0 });
    ch(c, st, 'you', { x: 980, y: GY - 40, s: 0.95, face: 'sad', green: true, lie: true, id: 'you' });
    const tw = at(st, 'in silence');
    const caught = st.t > tw;
    ch(c, st, 'bab', { x: 1650, y: GY, s: 1.0, flip: !caught || st.t < at(st, 'had to ask'), faces: [[0, 'sly'], ['in silence', 'shock'], ['had to ask', 'happytalk']], pose: caught ? 'scared' : 'hold', move: [[0, 1300, GY, tw - st.s.start]], walk: !caught, id: 'sneak' });
    ch(c, st, 'rod', { x: 260, y: GY + 40, s: 1.05, face: caught ? 'angry' : 'smug', pose: caught ? 'point' : 'idle', hold: { L: caught ? 'whistle' : null }, enter: ['in silence', 'left', 0.25] });
    if (after(st, 'what was wrong')) { const pp = pr_(st, 'what was wrong', 0.3, E.back); c.save(); c.translate(1300, 330); c.scale(pp, pp); bubble(c, 0, 0, 420, 110, -40, 160, "...WHAT'S WRONG?", { size: 46 }); c.restore(); cue('pop', at(st, 'what was wrong'), 0.5); }
    label(c, st, 'NO SILENT WALK-BYS', 960, 150, 'in silence', { size: 64, fill: '#ff6b3a' });
  } });

shot({ at: 'So Babylon invented the comment section', bg: 'v_blue', trans: 'whip', sfx: [['dialup', 'internet', 0.6]],
  draw: (c, st) => {
    uiCard(c, 960, 520, 1100, 700, 'BABYLON MARKETPLACE  •  POST', [], {});
    ch(c, st, 'you', { x: 560, y: 470, s: 0.42, face: 'sad', green: true, noShadow: true });
    txt(c, 'patient_on_mat:  "my stomach hurts :("', 680, 330, { size: 40, align: 'left', fill: '#22324f', lw: 0, shadow: false, font: '"Patrick Hand"' });
    const cm = [['wife_cousin_guy', 'my wife\'s cousin had that', 'comment section'], ['onion_fan', 'have u tried onions??', 'thousand years'], ['first_guy', 'first!', 'before the internet']];
    cm.forEach((m, i) => {
      const t0 = at(st, m[2]) + 0.1;
      cue('notify', t0, 0.6);
      if (st.t < t0) return;
      const p = prog(st.t, t0, 0.3, E.back);
      c.save(); c.translate(1000, 520 + i * 120); c.scale(1, p);
      rrect(c, -380, -48, 760, 96, 14, { fill: '#eef3fb', lw: 4 });
      txt(c, m[0] + ':  ' + m[1], -350, 0, { size: 36, align: 'left', fill: '#22324f', lw: 0, shadow: false, font: '"Patrick Hand"' });
      c.restore();
    });
    popText(c, st, 'THE COMMENT SECTION', 960, 130, at(st, 'comment section'), { size: 90, anim: 'slam', sfx: 'impact' });
    label(c, st, '~2,500 YEARS BEFORE THE INTERNET', 960, 905, 'two and a half', { size: 52, fill: '#ffd23f' });
  } });

shot({ at: 'Hi, sorry', bg: 'market', amb: 'market', trans: 'cut', off: -0.2, cam: { push: 0.05 },
  draw: (c, st) => {
    prop(c, st, 'mat', 900, 1000, { s: 1.6 });
    ch(c, st, 'you', { x: 900, y: 1300, s: 2.0, face: 'sadtalk', green: true, pose: 'holdBoth', talk: ['Hi, sorry', 'three days'], sweat: true, id: 'you' });
  } });

shot({ at: "Oh, my wife's cousin", bg: 'market', amb: 'market', trans: 'cut', off: -0.15, sfx: [['magic_bad', 'cursed', 0.8]],
  draw: (c, st) => {
    ch(c, st, 'you', { x: 470, y: 1250, s: 1.6, faces: [[0, 'neutral'], ['being cursed', 'shock']], green: true, pose: 'holdBoth', id: 'you' });
    ch(c, st, 'bab_pass', { x: 1350, y: 1250, s: 1.7, flip: true, face: 'happy', pose: 'point', talk: ['Oh, my wife', 'cursed'], headTilt: -6 });
    if (after(st, 'cursed')) prop(c, st, 'curseCloud', 470, 300, { s: 1.4, enter: ['cursed', 'pop'] });
  } });

shot({ at: 'Rod ranked this', bg: 'v_purple', trans: 'whip', sfx: [['rec_scratch', 'Small problem', 1], ['buzzer', "wasn't true", 0.9]],
  draw: (c, st) => {
    const prob = after(st, 'Small problem');
    ch(c, st, 'rod', { x: 330, y: 1150, s: 1.6, faces: [[0, 'proud'], ['Small problem', 'shock'], ["wasn't true", 'scared']], sweat: prob, pose: prob ? 'scared' : 'present' });
    uiCard(c, 1200, 470, 1080, 520, "ROD'S BEST BABYLON CUSTOMS", ['#1  (that\'s a different video)', '#2  PUT SICK PEOPLE IN THE MARKET  🏅'], { head: '#7a2cff' });
    popText(c, st, 'SMALL PROBLEM...', 1200, 840, at(st, 'Small problem'), { size: 90, anim: 'slam', sfx: false, fill: '#ff4d3a' });
    stamp(c, st, 'FALSE', 1200, 470, "wasn't true", { size: 160 });
  } });

function mystery(c, st, x, t0, id) { ch(c, st, 'narr', { x, y: GY + 40, s: 1.2, face: 'blank', pre: { skin: '#121212', color: '#121212', hair: null }, enter: [t0, 'pop'], id }); popText(c, st, '?', x, GY - 320 * 1.2 - 40, st.s.start + t0 + 0.2, { size: 140, fill: '#ffd23f', sfx: false }); }
shot({ at: 'Babylon had doctors', bg: 'v_navy', trans: 'whip', sfx: [['flash_hit', 'The asu', 0.8]],
  draw: (c, st) => {
    const ta = at(st, 'The asu');
    if (st.t < ta) { mystery(c, st, 560, 0.1, 'm1'); mystery(c, st, 1360, at(st, 'Two kinds') - st.s.start, 'm2'); popText(c, st, '2 KINDS OF DOCTOR', 960, 150, at(st, 'Two kinds'), { size: 80, anim: 'slam', sfx: 'impact' }); return; }
    ch(c, st, 'asu', { x: 560, y: GY + 40, s: 1.25, face: 'happy', pose: 'hold', hold: { R: 'bowl' } });
    mystery(c, st, 1360, -10, 'm2');
    label(c, st, 'ASU', 560, 160, 'The asu', { size: 110, fill: '#7ee05a' });
    [['bowl', 'herbs', 'HERBS', 1020, 320], ['jar', 'potions', 'POTIONS', 1060, 520], ['linen', 'bandages', 'BANDAGES', 1020, 720], ['lancet', 'little surgery', 'A LITTLE SURGERY', 1080, 900]].forEach(it => {
      prop(c, st, it[0], it[3], it[4], { s: 0.9, enter: [it[1], 'pop'], label: false });
      label(c, st, it[2], it[3] + 260, it[4], it[1], { size: 50, fill: '#fff', sfx: false });
    });
  } });

shot({ at: 'The ashipu was the exorcist', bg: 'surgery', amb: 'spooky', mus: 'spooky', trans: 'whip', sfx: [['ghost_ooo', 'exorcist', 0.7], ['pop', 'god', 0.6], ['pop', 'demon', 0.6], ['ghost_ooo', 'or ghost', 0.5]],
  draw: (c, st) => {
    glow(c, 960, 500, 700, 'rgba(120,60,200,0.25)');
    ch(c, st, 'ashipu', { x: 560, y: GY, s: 1.2, face: after(st, 'work out') ? 'serious' : 'smug', pose: after(st, 'work out') ? 'reach' : 'hold', hold: { R: after(st, 'work out') ? 'mag' : 'incense' } });
    label(c, st, 'ASHIPU', 560, 160, 'ashipu', { size: 110, fill: '#c9a0ff' });
    label(c, st, '= EXORCIST', 560, 260, 'exorcist', { size: 60, fill: '#fff' });
    ch(c, st, 'you', { x: 1350, y: GY, s: 1.1, face: 'nervous', green: true, sweat: true, id: 'you' });
    if (after(st, 'god')) { prop(c, st, 'crown', 1120, 330, { s: 0.9, enter: ['god', 'pop'] }); glow(c, 1120, 330, 120, 'rgba(255,230,120,0.6)'); }
    if (after(st, 'demon')) { c.save(); c.translate(1560, 320); c.scale(pr_(st, 'demon', 0.3, E.back), pr_(st, 'demon', 0.3, E.back)); circ(c, 0, 0, 60, { fill: '#d9342b', lw: 7 }); for (const s2 of [-1, 1]) shp(c, [[s2 * 30, -46], [s2 * 56, -100], [s2 * 50, -40]], { fill: '#fff', lw: 5 }); c.fillStyle = INK; c.beginPath(); c.arc(-20, -6, 8, 0, TAU); c.arc(20, -6, 8, 0, TAU); c.fill(); line(c, [[-24, 24], [0, 16], [24, 24]], { lw: 5 }); c.restore(); }
    if (after(st, 'or ghost')) { c.save(); c.translate(1350, 230 + Math.sin(st.t * 3) * 10); c.globalAlpha *= 0.85 * pr_(st, 'or ghost', 0.3); shp(c, [[-50, 60], [-56, -20], ...ellPts(0, -20, 56, 60, 16, Math.PI, TAU).slice(1, -1), [56, -20], [50, 60], [25, 40], [0, 64], [-25, 40]], { fill: '#eef6ff', lw: 6, stroke: '#9fb5cf' }); c.fillStyle = INK; c.beginPath(); c.arc(-18, -20, 8, 0, TAU); c.arc(18, -20, 8, 0, TAU); c.fill(); c.restore(); }
  } });

shot({ at: 'Medical texts even name', bg: 'surgery', amb: 'spooky', trans: 'cut', sfx: [['boing', 'hand" of a god', 0.9], ['ghost_ooo', 'hand of a ghost', 0.8], ['boing', 'hand of a ghost', 0.6, 0, 0.6]],
  draw: (c, st) => {
    prop(c, st, 'tablet', 330, 640, { s: 1.6, rot: -0.08 });
    ch(c, st, 'you', { x: 1150, y: GY, s: 1.15, faces: [[0, 'nervous'], ['hand" of a god', 'shock'], ['hand of a ghost', 'scared']], green: true, id: 'you' });
    const poke = (t0, ghost) => {
      if (st.t < t0) return;
      const d = st.t - t0;
      const y = lerp(-300, 330, E.out(clamp(d / 0.35))) - (d > 0.6 ? E.in(clamp((d - 0.6) / 0.4)) * 700 : 0);
      c.save(); c.globalAlpha *= ghost ? 0.6 : 1; c.translate(1150, y); c.scale(1.6, -1.6);
      drawProp(c, st, 'hand', { skin: ghost ? '#e8f4ff' : '#f0c890' });
      c.restore();
    };
    poke(at(st, 'hand" of a god'), false);
    poke(at(st, 'hand of a ghost'), true);
    label(c, st, '"HAND OF A GOD"', 480, 220, 'hand" of a god', { size: 66, fill: '#ffd23f' });
    label(c, st, '"HAND OF A GHOST"', 480, 340, 'hand of a ghost', { size: 66, fill: '#c9e6ff' });
  } });

shot({ at: 'Imagine hearing that from your doctor', bg: 'clinic', amb: 'clinic', mus: 'babylon', trans: 'whip', sfx: [['phone_ring', 0.05, 0.9], ['ghost_ooo', "it's Grandpa", 0.8], ['pop', "it's Grandpa", 0.7]],
  draw: (c, st) => {
    // left: YOU on the phone
    ch(c, st, 'you', { x: 480, y: GY, s: 1.15, faces: [[0, 'neutral'], ['Good news', 'happy'], ['Bad news', 'nervous'], ["it's Grandpa", 'shock']], pose: [[10, 6], [24, -150]], hold: { R: ['phone', { rot: 0.2, s: 0.8 }] }, sweat: after(st, 'Bad news'), id: 'you' });
    if (after(st, "it's Grandpa")) prop(c, st, 'ghostGrandpa', 220, 760, { s: 0.75, enter: ["it's Grandpa", 'pop'], wave: true });
    // right: the ashipu calling from Babylon
    c.save(); c.beginPath(); c.rect(1000, 0, W - 1000, H); c.clip();
    c.drawImage(bgCanvas('surgery'), 360, 0);
    ch(c, st, 'ashipu', { x: 1460, y: GY + 60, s: 1.15, flip: true, face: 'smug', pose: [[24, -150], [10, 6]], hold: { L: ['tablet', { s: 0.55, rot: 0.2 }] }, talk: ['Good news', "it's Grandpa"] });
    c.restore();
    line(c, [[1000, 0], [1000, H]], { lw: 16, stroke: '#111', amp: 0 });
    label(c, st, 'INCOMING CALL: BABYLON', 1460, 120, 0.05, { size: 46, fill: '#7ee05a', sfx: false });
  } });

shot({ at: 'They were even regulated', bg: 'throne', amb: 'throne', mus: 'regal', trans: 'zoom', sfx: [['rumble', 'black stone pillar', 0.9], ['choir', 'King Hammurabi', 0.6]], shake: [['black stone pillar', 0.8, 6, false]],
  draw: (c, st) => {
    stamp(c, st, 'REGULATED', 960, 300, 'regulated', { size: 110, out: 0 });
    const tp = at(st, 'black stone pillar');
    const rise = clamp((st.t - tp) / 0.9);
    if (st.t > tp) { c.save(); c.beginPath(); c.rect(0, 0, W, 990); c.clip(); prop(c, st, 'stele', 1320, 990 + (1 - E.out(rise)) * 700, { s: 1.05, glow: rise >= 1 }); c.restore(); }
    if (after(st, 'King Hammurabi')) ch(c, st, 'hamm', { x: 640, y: GY, s: 1.2, face: 'smug', pose: 'hold', hold: { R: 'scepter' }, enter: ['King Hammurabi', 'up'] });
    label(c, st, 'KING HAMMURABI', 640, 180, 'King Hammurabi', { size: 70, fill: '#ffd23f' });
    yearSlam(c, st, '~1750 BC', 'thirteen hundred', { x: 330, y: 300, size: 64 });
    label(c, st, '~300 LAWS', 1320, 220, 'three hundred laws', { size: 72, fill: '#fff' });
    if (after(st, "doctor's price list")) { const p = pr_(st, "doctor's price list", 0.35, E.back); c.save(); c.translate(1320, 560); c.scale(p, p); uiCard(c, 0, 0, 560, 380, "DOCTOR'S PRICE LIST", ['• Surgery (saved) .... $$$', '• Surgery (oops) .... ✋', '• Eye fix ............ $$'], { head: '#8a5a2b' }); c.restore(); cue('paper_in', at(st, "doctor's price list"), 0.8); }
  } });

shot({ at: "Here's how it worked", bg: 'surgery', amb: 'surgery', mus: 'babylon', trans: 'whip', sfx: [['ta_da', 'saved him', 0.9], ['coins', 'ten shekels', 1]],
  draw: (c, st) => {
    prop(c, st, 'table', 980, 1010, { s: 1.15 });
    const saved = after(st, 'saved him');
    ch(c, st, 'noble', { x: 980, y: 900, s: 0.85, face: saved ? 'happy' : 'sick' in FACES ? 'sick' : 'sad', lie: true, id: 'nob' });
    ch(c, st, 'bab_doc', { x: 1500, y: GY, s: 1.15, flip: true, faces: [[0, 'serious'], ['saved him', 'proud']], pose: saved ? 'cheer' : 'reach', hold: { R: saved ? null : 'lancet' } });
    label(c, st, 'NOBLEMAN', 760, 520, 'nobleman', { size: 54, fill: '#ffd23f' });
    label(c, st, 'BRONZE LANCET', 1560, 380, 'bronze lancet', { size: 50, fill: '#ffb46b' });
    if (saved) sparkles(c, 700, 560, 500, 260, st.t, 6);
    const t10 = at(st, 'ten shekels');
    if (st.t > t10) { for (let i = 0; i < 10; i++) { const d = st.t - t10 - i * 0.07; if (d < 0) continue; const y = Math.min(-80 + d * d * 2600, 830 - (i % 3) * 20); prop(c, st, 'shekel', 400 + i * 120, y, { s: 1.0, rot: d * 4 }); } popText(c, st, '10 SHEKELS OF SILVER', 960, 170, t10, { size: 90, anim: 'slam', sfx: false }); }
  } });

shot({ at: 'How much is that', bg: 'v_navy', trans: 'whip',
  draw: (c, st) => {
    ch(c, st, 'bab', { x: 280, y: 1150, s: 1.5, face: 'confused', pose: 'think', id: 'worker' });
    const rows = [['1 DAY OF WORK = 6 GRAINS', 'six grains', '#fff'], ['1 SHEKEL = 180 GRAINS', 'a hundred and eighty', '#fff'], ['10 SHEKELS = 300 DAYS', 'three hundred days', '#ffd23f'], ["1 SURGERY ≈ 1 YEAR'S PAY!", "year's pay", '#7ee05a']];
    rows.forEach((r, i) => popText(c, st, r[0], 1150, 220 + i * 190, at(st, r[1]), { size: i === 3 ? 92 : 76, anim: i >= 2 ? 'slam' : 'rise', sfx: i >= 2 ? 'impact' : 'swoosh_up', fill: r[2] }));
    popText(c, st, '?', 300, 330, at(st, 'How much'), { size: 160, sfx: 'question' });
    cue('cash', at(st, "year's pay") + 0.2, 0.9);
  } });

shot({ at: 'Incredible deal', bg: 'market', amb: 'market', trans: 'cut', sfx: [['scribble', 'Sign me up', 1]],
  draw: (c, st) => {
    rays(c, st.t, 'rgba(255,230,120,0.18)');
    ch(c, st, 'you', { x: 820, y: GY, s: 1.25, face: 'grin', pose: [[28, -70], [40, -40]], hold: { R: 'quill', L: ['tablet', { s: 0.8 }] }, hops: ['Sign me up'], id: 'you' });
    popText(c, st, 'SIGN ME UP!', 1420, 300, at(st, 'Sign me up'), { size: 110, anim: 'slam', sfx: 'impact', wiggle: true });
    sparkles(c, 600, 300, 500, 400, st.t, 6);
  } });

shot({ at: "Now, you'd expect the flip side", bg: 'v_white', trans: 'whip', vig: 0.3, sfx: [['paper_in', 'a fine', 0.8], ['pop', 'bad review', 0.7]],
  draw: (c, st) => {
    if (after(st, 'a fine')) { const p = pr_(st, 'a fine', 0.35, E.back); c.save(); c.translate(560, 540); c.rotate(-0.06); c.scale(p, p); uiCard(c, 0, 0, 560, 560, 'FINE', ['Botched surgery', 'Amount: 1 goat', 'Pay by: whenever'], { head: '#e0262d' }); c.restore(); }
    if (after(st, 'bad review')) { const p = pr_(st, 'bad review', 0.35, E.back); c.save(); c.translate(1360, 540); c.rotate(0.05); c.scale(p, p); uiCard(c, 0, 0, 680, 440, 'REVIEW', ['', '"Would not get operated', ' on again."'], { head: '#2f6fd6' }); drawProp(c, st, 'stars', { n: 1 }); c.restore(); }
  } });

shot({ at: 'If the nobleman died', bg: 'surgery', mus: 'none', trans: 'smash', vig: 1, sfx: [['braam', 'nobleman died', 1], ['sword_shing', "doctor's hand", 1], ['crowd_gasp', "doctor's hand", 1, 0, 0.12]],
  shake: [["doctor's hand", 0.5, 16, false]],
  draw: (c, st) => {
    c.fillStyle = 'rgba(120,0,0,0.25)'; c.fillRect(-200, -200, W + 400, H + 400);
    prop(c, st, 'table', 980, 1010, { s: 1.15 });
    ch(c, st, 'noble', { x: 980, y: 900, s: 0.85, face: 'dead', lie: true, id: 'nob' });
    const cut = after(st, "doctor's hand");
    ch(c, st, 'bab_doc', { x: 1500, y: GY, s: 1.15, flip: true, faces: [[0, 'scared'], ["doctor's hand", 'shock']], pose: cut ? [[10, 6], [120, 170]] : 'scared', tremble: true, sweat: true });
    if (cut) {
      const d = st.t - at(st, "doctor's hand");
      prop(c, st, 'hand', 1530 - d * 260, 420 - d * 380 + Math.sin(d * 6) * 30, { s: 1.2, wings: true, skin: SKIN.brown, rot: Math.sin(d * 3) * 0.3 });
      c.fillStyle = `rgba(255,255,255,${clamp(1 - d * 5)})`; c.fillRect(-200, -200, W + 400, H + 400);
    }
    label(c, st, 'DEAD NOBLEMAN = ', 640, 200, 'nobleman died', { size: 70, fill: '#ff4d3a' });
    popText(c, st, 'NO MORE HAND', 1240, 200, at(st, 'cut off'), { size: 76, anim: 'slam', sfx: false, fill: '#fff' });
  } });

shot({ at: 'So in Babylon, malpractice', bg: 'v_red', mus: 'babylon', trans: 'cut', sfx: [['rimshot', 'A hand', 1]],
  draw: (c, st) => {
    popText(c, st, 'MALPRACTICE COST YOU', 960, 170, at(st, 'malpractice'), { size: 80, anim: 'rise', sfx: 'swoosh_up', fill: '#fff' });
    const ta = at(st, 'an arm and a leg');
    const xs = after(st, 'A hand');
    popText(c, st, 'AN ARM', 640, 420, ta, { size: 110, anim: 'slam', sfx: 'impact' });
    popText(c, st, '& A LEG', 1280, 420, ta + 0.45, { size: 110, anim: 'slam', sfx: 'impact' });
    if (xs) { bigX(c, 640, 420, 1.1, pr_(st, 'A hand', 0.3)); bigX(c, 1280, 420, 1.1, pr_(st, 'A hand', 0.3)); cue('scribble', at(st, 'A hand'), 0.7); }
    if (after(st, 'Well')) popText(c, st, 'WELL...', 960, 650, at(st, 'Well'), { size: 70, fill: '#fff', sfx: false });
    if (xs) { prop(c, st, 'hand', 960, 860, { s: 1.4, wings: true, skin: SKIN.brown, bob: 20, enter: ['A hand', 'up'] }); }
  } });

shot({ at: 'And the price tag depended', bg: 'v_navy', trans: 'whip', sfx: [['ding', 'price tag', 0.6]],
  draw: (c, st) => {
    const rows = [['NOBLEMAN', '10 SHEKELS', 'price tag', 'noble'], ['COMMONER', '5 SHEKELS', "commoner's", 'bab'], ['ENSLAVED PERSON', '2 (PAID BY THE OWNER)', 'enslaved person', 'slave']];
    rows.forEach((r, i) => {
      const t0 = at(st, r[2]);
      const y = 270 + i * 270;
      ch(c, st, r[3], { x: 260, y: y + 230, s: 0.62, face: i === 2 ? 'sad' : 'neutral', enter: [t0 - st.s.start, 'left'], id: 'r' + i });
      popText(c, st, r[0], 720, y, t0 + 0.1, { size: 64, anim: 'rise', sfx: 'swoosh_up', fill: '#fff' });
      prop(c, st, 'price', 1450, y, { s: 1.6, text: r[1], color: i === 2 ? '#d8d8d8' : '#ffe28a', enter: [r[2], 'pop'] });
    });
  } });

shot({ at: 'And if an enslaved patient died', bg: 'v_black', mus: 'somber', trans: 'fade', td: 0.6, cam: { push: 0.03 },
  draw: (c, st) => {
    ch(c, st, 'bab_doc', { x: 640, y: GY + 30, s: 1.2, face: 'neutral', pose: 'shrug' });
    if (after(st, 'broken pot')) { prop(c, st, 'pot', 1240, 900, { s: 1.4, broken: true, enter: ['broken pot', 'fade'], sfx: 'pot_break' }); prop(c, st, 'pot', 1520, 880, { s: 1.4, enter: ['broken pot', 'fade'], sfx: false }); }
    label(c, st, 'THE DOCTOR KEPT HIS HANDS', 960, 180, 'kept his hands', { size: 60, fill: '#d8d8d8', sfx: false });
    label(c, st, 'JUST "REPLACE" THEM', 1340, 560, 'replace that person', { size: 54, fill: '#d8d8d8', sfx: false });
  } });

shot({ at: 'Hammurabi called himself', bg: 'throne', amb: 'throne', mus: 'regal', trans: 'whip', sfx: [['choir', 'king of righteousness', 0.8], ['creak', 'sliding scale', 1]],
  draw: (c, st) => {
    const slide = after(st, 'sliding scale');
    if (!slide) glow(c, 760, 380, 360, 'rgba(255,230,140,0.55)');
    ch(c, st, 'hamm', { x: 760, y: GY, s: 1.25, faces: [[0, 'proud'], ['sliding scale', 'nervous']], sweat: slide, pose: 'hold', hold: { R: 'scepter' } });
    popText(c, st, 'KING OF\nRIGHTEOUSNESS', 1380, 300, at(st, 'king of righteousness'), { size: 96, font: '"Cinzel"', weight: 900, fill: '#ffd86b', anim: 'rise', sfx: false });
    if (slide) { const tilt = Math.min(0.5, (st.t - at(st, 'sliding scale')) * 0.6); prop(c, st, 'scale', 1380 + Math.min(200, (st.t - at(st, 'sliding scale')) * 160), 800, { s: 1.2, tilt, enter: ['sliding scale', 'pop'] }); label(c, st, 'SLIDING SCALE', 1380, 560, 'sliding scale', { size: 60, fill: '#fff', sfx: false }); }
  } });

shot({ at: 'As for Rod', bg: 'parchment', mus: 'babylon', trans: 'whip', sfx: [['buzzer', 'Babylon wrong', 0.9]],
  draw: (c, st) => {
    ch(c, st, 'rod', { x: 760, y: 1150, s: 1.6, faces: [[0, 'smug'], ['wrong', 'shock']], sweat: after(st, 'wrong') });
    stamp(c, st, 'WRONG', 1360, 420, 'Babylon wrong', { size: 140 });
  } });

shot({ at: "But don't worry, we built his version", bg: 'clinic', amb: 'clinic', trans: 'whip', sfx: [['keys', 0.2, 0.7], ['notify', 'health forum', 0.8], ['notify', 'health forum', 0.6, 0, 0.5]],
  draw: (c, st) => {
    const forum = after(st, 'health forum');
    prop(c, st, 'table', 1050, 1010, { s: 1.3 });
    c.save(); c.translate(1150, 830);
    shp(c, [[-240, 0], [240, 0], [270, 26], [-270, 26]], { fill: '#555', lw: 7 });
    shp(c, [[-220, 0], [-230, -300], [230, -300], [220, 0]], { fill: '#333', lw: 7 });
    rrect(c, -205, -284, 410, 266, 6, { fill: forum ? '#fff' : '#cfe8ff', lw: 4 });
    if (forum) { c.fillStyle = '#3b6fd8'; c.fillRect(-201, -280, 402, 46); txt(c, 'HEALTH FORUM', 0, -256, { size: 30, fill: '#fff', lw: 0, shadow: false }); ['have u tried not being cursed', 'my wife\'s cousin had that', 'onions. trust me.'].forEach((l, i) => { const t0 = at(st, 'health forum') + i * 0.25; if (st.t > t0) txt(c, l, -185, -200 + i * 56, { size: 26, align: 'left', fill: '#22324f', lw: 0, shadow: false, font: '"Patrick Hand"' }); }); }
    c.restore();
    ch(c, st, 'you_modern', { x: 640, y: GY, s: 1.15, faces: [[0, 'neutral'], ['health forum', 'bored']], pose: forum ? 'facepalm' : [[60, -60], [60, -60]], id: 'you' });
    popText(c, st, 'THE HEALTH FORUM', 960, 160, at(st, 'health forum'), { size: 96, anim: 'slam', sfx: 'impact' });
  } });

chapter('ch3', 3, 'GREECE', 'EPIDAURUS', 'sanctuary');

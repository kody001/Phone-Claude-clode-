// ============================================================
//  Quick reaction cut-aways (reference style: a new picture every few seconds).
//  In longer shots, cut for ~1.6s to a close-up of the mascot reacting
//  ("WOW", "OUCH", "HMM...") and then cut back. Windows are chosen where
//  nothing in the main shot is animating in, so no reveal is missed.
// ============================================================
'use strict';
(function buildCutaways() {
  const words = TL.captions.flatMap(c => c.w);
  const lc = s => s.toLowerCase().replace(/[^a-z0-9$%' -]/g, '');
  const NEG = /\b(lost|loses|loss|losses|losing|debt|below|fell|reckless|fail|cancel|cancelled|worry|defaults|bagholder|forced|catch|evil|expensive|bills|loan|improbable|gravity|pressure|explode|scarcity|warned|required|pockets)\b/;
  const MONEY = /(billion|trillion|million|percent|\$|%|profit|revenue|raised|jumped|biggest|largest)/;
  const ODD = /\b(chatbot|coding|kabuki|honeymoon|restaurant|repo|grok|rocket company|rocket|space)\b/;
  const REACT = {
    neg: [['OUCH', 'sad', 'facepalm'], ['UH-OH', 'nervous', 'rest'], ['YIKES', 'worried', 'shrug']],
    money: [['WOW', 'wow', 'armsUp'], ['WHOA', 'shocked', 'rest'], ['$$$', 'grin', 'cheer']],
    odd: [['WAIT...', 'confused', 'scratch'], ['?!', 'skeptical', 'shrug'], ['LOL', 'laugh', 'rest']],
    think: [['HMM...', 'skeptical', 'thinkR'], ['INTERESTING...', 'smug', 'thinkR'], ['NOTE THIS', 'serious', 'countR']],
  };
  const COLS = { neg: COL.red, money: COL.dgreen, odd: COL.orange, think: COL.dblue };
  const kidx = { neg: 0, money: 0, odd: 0, think: 0 };
  let k = 0, made = 0;
  for (const sh of SHOTS) {
    const t1 = Math.min(sh.t1, TL.duration); const dur = t1 - sh.t0;
    if (dur < 6.0) continue;
    const maxCuts = dur >= 14 ? 3 : dur >= 10 ? 2 : 1;
    const starts = sh.els.map(e => e.t0).filter(x => x > sh.t0 + 0.05);
    const ok = c => !starts.some(s => s > c - 0.6 && s < c + 1.75);
    const chosen = [];
    // candidate cut points: word starts inside the shot
    for (const w of words) {
      if (w.s < sh.t0 + 1.6 || w.s > t1 - 2.1) continue;
      const c = w.s - 0.05;
      if (!ok(c)) continue;
      if (!chosen.every(x => Math.abs(x - c) > 3.2)) continue;
      chosen.push(c);
      if (chosen.length >= maxCuts) break;
    }
    sh.cuts = chosen.map(c => {
      SHOT_T0 = c; k++;
      // sentiment of the narration around the cut
      const ctx = words.filter(w => w.s > c - 3 && w.s < c + 2).map(w => lc(w.t)).join(' ');
      const kind = NEG.test(ctx) ? 'neg' : MONEY.test(ctx) ? 'money' : ODD.test(ctx) ? 'odd' : 'think';
      const [label, face, pose] = REACT[kind][kidx[kind]++ % REACT[kind].length];
      const left = k % 2 === 0;
      const tx = left ? 1230 : 690, ty = 420;
      const ex = new Elon({ x: left ? 430 : 1490, y: 1390, s: 1.5, rot: left ? 8 : -8, t0: c, enter: 'none', blinkSeed: k + 7 });
      ex.face(c, face);
      ex.pose(c, pose === 'rest' ? 'point' : pose, pose === 'rest' ? { at: [tx, ty] } : {});
      const els = [];
      if (kind === 'money') els.push(burst(tx, ty, c, { r1: 360, z: 0 }));
      els.push(charElement(ex));
      els.push(big(label, tx, ty, c, { size: label.length > 8 ? 120 : 170, color: COLS[kind], z: 6, rot: left ? 6 : -6 }));
      if (kind === 'odd') els.push(P('qmark', {}, tx + 300 * (left ? 1 : -1) * .9, ty + 190, .6, c + .1, { z: 5 }));
      els.forEach((e, i) => e._k = i); els.sort((a, b) => (a.z - b.z) || (a._k - b._k));
      made++;
      return { t0: c, t1: c + 1.6, els };
    });
  }
  window.CUTAWAYS = made;
})();

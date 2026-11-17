// Shots: comeback, friendship, party, dinner, decision, ending, outro (lines 81-154)
import { E, tw, kf, clamp, lerp, pulse, within, walk, seat, talk, lookAtPt, drift, orbit, extras, seq, THREE } from './shotkit.js';
import { cseat } from './shots2.js';

const sitC = (c, name, tb, side, i, pose = 'sitIdle') => { const [x, z, r] = cseat(tb, side, i); return seat(c.actor(name), x, z, r, 0.56, pose); };
// apartment chairs (table at z=0.3): A front-right, B back-right, C back-left, D front-left
const CH = { A: [0.85, 1.15, Math.PI + Math.PI / 4], B: [0.85, -0.55, Math.PI + Math.PI * 3 / 4], C: [-0.85, -0.55, Math.PI + Math.PI * 5 / 4], D: [-0.85, 1.15, Math.PI + Math.PI * 7 / 4] };
const sitA = (c, name, ch, pose = 'sitIdle') => { const [x, z, r] = CH[ch]; return seat(c.actor(name), x, z, r, 0.53, pose); };
const DINNER = (c) => {
  const k = sitA(c, 'kidHome', 'C'); const th = sitA(c, 'theoCasual', 'B'); const d = sitA(c, 'dad', 'D'); const b = sitA(c, 'bro', 'A');
  const m = c.actor('mom').place(-1.4, -1.6, 0.6);
  const plates = ['B', 'C', 'D', 'A'].map((ch, i) => { const p = c.prop('spaghetti', i); const [x, z] = CH[ch]; p.obj.position.set(x * 0.55, 0.98, 0.3 + (z - 0.3) * 0.55); return p; });
  return { k, th, d, b, m, plates };
};

export default function (S) {
  // ---------- L81-82: the comeback walk ----------
  S('L81', 'street', (c) => {
    const bus = c.prop('bus'); bus.obj.rotation.y = Math.PI / 2; bus.obj.position.set(1.0, 0, -1.4);
    const k = c.actor('kid'); k.expr('determined');
    c.cam.path([[0, [-2.5, 1.6, -7.6], [2.5, 1.4, -3.4], 40], [c.T, [-1.8, 1.6, -7.1], [2.8, 1.4, -3.2], 38]], E.sine);
    c.ov.corner('The next morning', 0, c.T);
    return (t) => { walk(k, t, c.at('L81:you') - 0.2, c.T, [1.6, -4.6], [3.4, -2.9], { rate: 7 }); };
  }, { sfx: [[0, 'amb_city', -14], [0, 'bus_idle', -10], ['L81:get', 'bus_door', -8], [0, 'hopeful_pluck', -10]] });

  S('L82', 'schoolExt', (c) => {
    const k = c.actor('kid'); k.expr('determined');
    const l0 = c.prop('limo', 0), l1 = c.prop('limo', 1); l0.obj.position.set(3.2, 0, 14); l1.obj.position.set(-3.2, 0, 10);
    const h = c.prop('helicopter'); h.obj.position.set(14, 0, -7); h.obj.rotation.y = -0.6; h.spin = 0.15;
    c.cam.fn = (t) => { const z = k.root.position.z; return { p: [0.3, 0.9, z - 3.2], l: [0, 1.5, z + 3], fov: 40 }; };
    c.ov.custom(c.at('L82:you') , c.T, (g) => {}, 0);
    return (t) => { walk(k, t, 0, c.T + 1, [0, 20], [0, 6.5], { rate: 6.5 }); k.root.rotation.y = Math.PI; k.state.look = [0, -0.05]; };
  }, { sfx: [[0, 'footsteps_confident', -8], [0, 'build_drums', -8], ['L82:past', 'car_idle', -14], ['L82:past#2', 'heli_idle', -14]] });

  // ---------- L83-86: the comeback line ----------
  const GATE = (c) => {
    const p = c.actor('preston').place(0.8, 2.4, Math.PI * 0.05); p.expr('smug'); p.pose('cross');
    const f1 = c.actor('ex50').place(-0.4, 1.8, 0.2), f2 = c.actor('ex51').place(2.0, 1.9, -0.2); f1.expr('smug'); f2.expr('smug'); f1.pose('hips'); f2.pose('cross');
    const k = c.actor('kid').place(0.6, 5.0, Math.PI); k.expr('content');
    return { p, f1, f2, k };
  };
  S('L83', 'schoolExt', (c) => {
    const { p, f1, f2, k } = GATE(c);
    c.cam.path([[0, [4.4, 1.7, 7.6], [0.7, 1.7, 3.0], 40], [c.T, [3.8, 1.7, 7.0], [0.7, 1.7, 3.0], 38]], E.sine);
    c.ov.bubble(p, 'Hey... how was the BUS?', c.at('L83:hey') - 0.1, c.T, { side: -1 });
    return (t) => { talk(p, t, [[c.at('L83:hey'), c.T - 0.1]]); [f1, f2].forEach((a, i) => { if (t > c.at('L83:bus') - 0.2) { a.expr('laugh'); a.state.bounce = Math.abs(Math.sin(t * 9 + i)) * 0.03; } }); };
  }, { sfx: [['L83:bus', 'kids_snicker', -8]] });

  S('L84', 'schoolExt', (c) => {
    const { p, k } = GATE(c); k.expr('confident');
    c.cam.path([[0, [0.2, 1.7, 2.9], [0.6, 1.6, 5.0], 34], [c.T, [0.25, 1.7, 3.2], [0.6, 1.6, 5.0], 32]], E.sine);
    c.ov.bubble(k, 'Great, actually.', c.at('L84:great') - 0.1, c.at('L84:it'), { side: 1 });
    c.ov.big('$2', 'The bus', c.at('L84:two') - 0.1, c.at('L84:your'), { x: 1450, y: 330, size: 130, w: 460, h: 260 });
    return (t) => { talk(k, t, [[c.at('L84:great'), c.T - 0.1]]); };
  }, { sfx: [['L84:two', 'coin_single', -8]] });

  S('L84:your', 'schoolExt', (c) => {
    const { p, k } = GATE(c); p.expr('surprised');
    c.cam.path([[0, [1.4, 0.6, 4.6], [0.8, 0.2, 2.4], 34], [c.at('L84:and'), [1.6, 1.2, 5.2], [0.8, 1.0, 2.4], 40], [c.T, [1.4, 1.6, 5.8], [0.8, 1.6, 2.4], 40]], E.io);
    c.ov.tag(() => p.legs[0].knee.localToWorld(new THREE.Vector3(0, -0.27, 0.08)), 'Shoes: $2,000', 0.1, c.at('L84:and'), { dx: 230, dy: -150 });
    c.ov.big('8:00', 'Both of us', c.at('L84:eight') - 0.15, c.T, { x: 1450, y: 330, size: 130, w: 460, h: 260 });
    return (t) => { talk(k, t, [[0, c.T - 0.1]]); };
  }, { sfx: [[0.1, 'ding_price', -6], ['L84:eight', 'clock_ding', -6]] });

  S('L85', 'schoolExt', (c) => {
    const { p, f1, f2, k } = GATE(c); k.expr('content'); p.expr('embarrassed');
    const crowd = ['ex60', 'ex61', 'ex62', 'ex63', 'ex64', 'ex65'].map((n, i) => c.actor(n).place(-3.2 + i * 1.3, 5.6 + (i % 2) * 1.2, Math.PI + (i - 2.5) * 0.15));
    c.cam.path([[0, [-1.5, 2.6, 10.5], [0.5, 1.4, 3.6], 42], [c.T, [-1.0, 2.4, 9.5], [0.5, 1.4, 3.6], 40]], E.sine);
    return (t) => { crowd.forEach((a, i) => { a.expr('laugh'); a.state.bounce = Math.abs(Math.sin(t * 8 + i)) * 0.04; a.pose(i % 2 ? 'clap' : 'idle'); }); f1.expr('laugh'); f2.expr('nervous'); if (t > c.at('L85:they\'re')) { k.expr('joy'); } };
  }, { sfx: [[0, 'crowd_laugh', -4], ['L85:they\'re', 'warm_swell', -8]] });

  S('L86', 'schoolExt', (c) => {
    const { p } = GATE(c);
    c.cam.path([[0, [0.9, 1.75, 4.5], [0.8, 1.7, 2.4], 30], [c.T, [1.0, 1.75, 5.2], [0.8, 1.7, 2.4], 32]], E.sine);
    const a1 = c.at('L86:opens'), a2 = c.at('L86:closes'), a3 = c.at('L86:opens#2'), a4 = c.at('L86:walks') - 0.2;
    return (t) => { p.pose('idle'); p.expr(seq(t, [[0, 'surprised'], [a1, 'shocked'], [a2, 'blank'], [a3, 'shocked'], [a4 - 0.4, 'embarrassed']]));
      if (t > a4) { walk(p, t, a4, a4 + 2.5, [0.8, 2.4], [-2.5, -2.5], { rate: 7 }); } };
  }, { sfx: [['L86:opens', 'mouth_pop', -8], ['L86:closes', 'mouth_pop', -10], ['L86:opens#2', 'mouth_pop', -8], ['L86:walks', 'sneak_away', -8]] });

  S('L87', 'schoolExt', (c) => {
    const k = c.actor('kid').place(0.6, 4.0, 0.2); k.expr('content');
    c.cam.path([[0, [2.6, 1.5, 9.0], [0.6, 1.7, 4], 38], [c.T, [2.0, 1.6, 7.8], [0.6, 1.7, 4], 34]], E.sine);
    c.ov.icon(k, 'bulb', 0.4, c.T);
  }, { sfx: [[0, 'warm_pad', -8]] });

  S('L88', 'voidPink', (c) => {
    const k = c.actor('kid').place(0, 0, 0); k.expr('content');
    const boxes = []; for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.42, 0.6), new THREE.MeshStandardMaterial({ color: '#c99a62' })); c.scene.add(b); boxes.push(b); }
    c.onExit = () => boxes.forEach(b => c.scene.remove(b));
    c.cam.path([[0, [0, 1.8, 6.2], [0, 1.6, 0], 38], [c.T, [0, 1.7, 5.0], [0, 1.6, 0], 36]], E.sine);
    c.ov.pop('NOT', c.at('L88:not') - 0.05, c.at('L88:not') + 0.9, { y: 220, size: 120, colors: ['#ffd36b', '#ff8a3d'] });
    return (t) => { boxes.forEach((b, i) => { const k1 = clamp((t - 0.3 - i * 0.1) / 0.8); b.position.set(Math.sin(i * 2) * (1 + k1 * 4), 2.45 + i * 0.43 + k1 * 4, -k1 * 3); b.rotation.set(k1 * i, k1 * 2, 0); b.scale.setScalar(1 - k1 * 0.7); }); k.pose('idle', 'armsUp', clamp((t - 0.3) / 0.5) * (1 - clamp((t - 1.6) / 0.6))); k.state.yOff = 0; if (t > 1.0) k.expr('joy'); };
  }, { sfx: [[0.3, 'release_whoosh', -6], [0.4, 'sigh_relief', -10]] });

  // ---------- L89: iconic ----------
  const CHAT3 = [{ at: 'L89', system: true, text: '2nd period' }, { at: 'L89:honestly', from: 'Maya', text: 'Honestly? That was iconic. \u{1F525}', av: 5, react: { e: '❤️', from: 0, to: 14, dur: 1.0 }, reactAt: 'L89:fourteen' }];
  S('L89', 'voidPink', (c) => {
    c.cam.at([0, 1.5, 6], [0, 1.4, 0], 36);
    c.ov.phone('chat', 0, c.T, { messages: CHAT3, members: '41 members', dim: 0.05, scale: 0.98 });
    c.ov.corner('2nd period', 0, 2);
  }, { sfx: [[0, 'phone_slide', -8], ['L89:honestly', 'msg_pop', -4], ['L89:fourteen', 'hearts_pop', -6]] });

  // ---------- L90-95: Theo sits down ----------
  S('L90', 'cafeteria', (c) => {
    const k = sitC(c, 'kid', 0, 1, 3); k.expr('content');
    const bag = c.prop('paperBag'); bag.obj.position.set(-5.4, 0.98, 2.55);
    const th = c.actor('theo');
    c.cam.path([[0, [-5.4, 2.0, 5.6], [-5.4, 1.3, 2.0], 40], [c.T, [-5.4, 1.9, 5.0], [-5.4, 1.3, 2.0], 38]], E.sine);
    const ts = c.at('L90:someone') - 0.6;
    return (t) => { if (t < ts + 1.0) { walk(th, t, ts - 1.4, ts + 0.6, [-2.5, -0.4], [-5.4, -0.4], { rate: 7 }); } if (t >= ts + 0.6) { seat(th, -5.4, 0.85, 0, 0.56, 'sitIdle'); } th.expr('quiet'); if (t > ts) { k.expr('surprised'); lookAtPt(k, -5.4, 0.8); } };
  }, { sfx: [[0, 'cafeteria_walla', -14], ['L90:someone', 'chair_scrape', -6]] });

  S('L91', 'cafeteria', (c) => {
    const th = sitC(c, 'theo', 0, -1, 3); th.expr('happy');
    c.cam.path([[0, [-5.35, 1.55, 2.9], [-5.4, 1.38, 0.85], 30], [c.T, [-5.35, 1.55, 2.6], [-5.4, 1.38, 0.85], 28]], E.sine);
    c.ov.pill('Theo', 0.1, c.T, { at3d: () => th.headTop(new THREE.Vector3()).add(new THREE.Vector3(0, 0.12, 0)) });
  }, { sfx: [[0, 'friend_chime', -8]] });

  S('L92', 'cafeteria', (c) => {
    const k = sitC(c, 'kid', 0, 1, 3); const th = sitC(c, 'theo', 0, -1, 3); th.expr('quiet'); k.expr('content');
    const sw = c.prop('sandwich'); sw.obj.position.set(-5.4, 1.02, 2.4); sw.obj.scale.setScalar(1.4);
    c.cam.path([[0, [-4.3, 1.75, 4.6], [-5.4, 1.32, 0.85], 38], [c.T, [-4.4, 1.72, 4.3], [-5.4, 1.32, 0.85], 36]], E.sine);
    c.ov.bubble(th, 'Is it good?', c.at('L92:is') - 0.1, c.T, { side: 1, size: 32 });
    return (t) => { lookAtPt(th, -5.4, 2.4); th.state.look[1] = 0.3; talk(th, t, [[c.at('L92:is'), c.T - 0.1]]); };
  });

  S('L93', 'cafeteria', (c) => {
    const k = sitC(c, 'kid', 0, 1, 3); const th = sitC(c, 'theo', 0, -1, 3); k.expr('happy'); th.expr('surprised');
    const sw = c.prop('sandwich'); sw.obj.position.set(-5.4, 1.02, 2.0); sw.obj.scale.setScalar(1.4);
    c.cam.path([[0, [-4.6, 1.6, 2.2], [-5.4, 1.05, 2.0], 34], [c.T, [-4.7, 1.55, 2.1], [-5.4, 1.05, 1.9], 32]], E.sine);
    const tg = c.at('L93:and');
    return (t) => { const tear = clamp(t / 0.6); sw.halves[0].position.x = 0.02 + tear * 0.12; sw.halves[1].position.x = -0.02 - tear * 0.12; const give = clamp((t - tg) / 0.6); sw.halves[0].position.z = -give * 0.7; k.pose('sitIdle', 'give', give); if (t > tg + 0.6) th.expr('joy'); };
  }, { sfx: [[0.05, 'bread_tear', -4], ['L93:and', 'slide_plate', -10], ['L93:bigger', 'sweet_chime', -8]] });

  S('L94', 'cafeteria', (c) => {
    const th = sitC(c, 'theo', 0, -1, 3); th.expr('chew');
    const half = c.prop('sandwich'); c.hold(th, half, 1); half.halves[1].visible = false; half.obj.rotation.set(1.2, 0, 0); half.obj.scale.setScalar(1.1);
    const chef = c.actor('chef').place(-11.8, -8.4, 0.5); chef.expr('shocked');
    c.cam.path([[0, [-5.3, 1.55, 3.0], [-5.4, 1.38, 0.85], 32], [c.at('L94:his') + 0.3, [-5.32, 1.5, 2.5], [-5.4, 1.38, 0.85], 28], [c.T, [-5.3, 1.55, 3.0], [-5.4, 1.38, 0.85], 32]], E.io);
    c.ov.bubble(th, 'Why is this BETTER than the sushi?!', c.at('L94:why') - 0.1, c.T, { side: 1 });
    return (t) => { th.pose('eat'); th.state.chew = t < c.at('L94:his'); half.halves[1].visible = false; if (t > c.at('L94:his')) { th.expr('awe'); th.pose('sitIdle', 'holdOne', 0.8); } talk(th, t, [[c.at('L94:why'), c.T - 0.1]]); };
  }, { sfx: [[0.1, 'crunch_bite', -4], ['L94:his', 'sparkle', -6], ['L94:sushi', 'knife_drop', -10]] });

  S('L95', 'cafeteria', (c) => {
    const k = sitC(c, 'kid', 0, 1, 3); const th = sitC(c, 'theo', 0, -1, 3); k.expr('laugh'); th.expr('laugh');
    c.cam.path([[0, [-2.0, 2.3, 4.6], [-5.4, 1.3, 2.0], 40], [c.T, [-1.6, 2.6, 5.2], [-5.4, 1.3, 2.0], 42]], E.sine);
    c.ov.icon(th, 'heart', 0.5, c.T, { pos: [960, 300] });
    c.ov.pop('FRIENDS', c.at('L95:friend') - 0.1, c.T, { y: 200, size: 110, colors: ['#ff9ed8', '#ff5d8f'] });
    return (t) => { [k, th].forEach((a, i) => { a.state.bounce = Math.abs(Math.sin(t * 7 + i)) * 0.025; }); };
  }, { sfx: [[0, 'kids_laugh_two', -8], ['L95:friend', 'friend_sting', -6]] });

  // ---------- L96-100: people ask YOU ----------
  S('L96', 'hallway', (c) => {
    const k = c.actor('kid').place(0, 0, Math.PI); k.expr('surprised');
    const ring = ['ex60', 'ex61', 'ex62', 'ex63', 'ex64'].map((n, i) => { const a = -1.0 + i * 0.5; return c.actor(n).place(Math.sin(a) * 1.9, -Math.cos(a) * 1.9, 0); });
    c.cam.path([[0, [0.4, 1.9, 2.6], [0, 1.5, -0.5], 40], [c.T, [0.3, 1.8, 2.2], [0, 1.5, -0.5], 38]], E.sine);
    c.ov.corner('Weeks later', 0, 2.2);
    ring.forEach((a, i) => c.ov.icon(a, '?', c.at('L96:people') + i * 0.12, c.T, { size: 0.7 }));
    return (t) => { ring.forEach(a => lookAtPt(a, 0, 0)); };
  }, { sfx: [['L96:people', 'question_pops', -6]] });

  S('L97', 'hallway', (c) => {
    const a = c.actor('ex63').place(0, 0, 0); a.expr('confused');
    const cp = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.15), new THREE.MeshStandardMaterial({ color: '#ffe9a8', side: THREE.DoubleSide })); c.hold(a, { obj: cp }, 1); cp.rotation.x = -0.4;
    c.cam.at([0.2, 1.6, 2.4], [0, 1.45, 0], 32);
    c.ov.bubble(a, 'What’s a coupon?', 0, c.T, { side: 1 });
    return (t) => { a.pose('holdUp'); talk(a, t, [[0, c.T - 0.1]]); };
  });

  S('L98', 'hallway', (c) => {
    const a = c.actor('ex64').place(0, 0, 0); a.expr('shocked');
    c.cam.at([-0.2, 1.6, 2.4], [0, 1.45, 0], 32);
    c.ov.bubble(a, 'Wait... you have to PAY for your phone every month?', 0, c.T, { side: -1, w: 560 });
    return (t) => { a.pose('handsHead'); talk(a, t, [[0, c.T - 0.1]]); };
  }, { sfx: [[0, 'gasp_single', -8]] });

  S('L99', 'laundry', (c) => {
    const g = c.actor('laundryGirl').place(-0.5, -1.8, 0.2); g.expr('surprised');
    const k = c.actor('kid').place(0.9, -1.9, -0.6); k.expr('happy'); k.pose('point');
    const w = c.prop('washer'); w.obj.position.set(0.1, 0, -3.0);
    c.cam.path([[0, [1.0, 1.8, 2.4], [0, 1.1, -2], 40], [c.T, [0.6, 1.7, 1.8], [0, 1.1, -2], 38]], E.sine);
    const tx = c.at('L99:she');
    c.ov.pop('BEST DAY EVER', c.at('L99:most') - 0.1, c.T, { y: 200, size: 100, colors: ['#9df2ff', '#3fb6e8'] });
    return (t) => { w.spin = t > c.at('L99:you#2') ? 1 : 0; if (t > tx) { g.expr('joy'); g.pose('cheer'); g.state.bounce = Math.abs(Math.sin(t * 8)) * 0.1; } };
  }, { sfx: [['L99:you#2', 'washer_start', -6], ['L99:you#2', 'washer_spin', -10], ['L99:she', 'kid_cheer', -6]] });

  S('L100', 'voidGold', (c) => {
    const k = c.actor('kid').place(-1.5, 0, 0.3); k.expr('confident'); k.pose('point');
    c.cam.path([[0, [-0.5, 1.7, 5.5], [0.5, 1.5, 0], 38], [c.T, [-0.3, 1.7, 5.0], [0.5, 1.5, 0], 36]], E.sine);
    c.ov.panel([{ text: 'Coupons', mark: 'check', at: 0.2 }, { text: 'Laundry', mark: 'check', at: 0.5 }, { text: 'Bus routes', mark: 'check', at: 0.8 }, { text: 'Fixing a zipper', mark: 'check', at: 1.1 }], 0, c.T, { x: 1100, y: 300, size: 36, w: 560 });
    c.ov.pill('Life skills 101', 0, c.T, { x: 1380, y: 230 });
  }, { sfx: [[0.2, 'tick', -6], [0.5, 'tick', -6], [0.8, 'tick', -6], [1.1, 'tick', -6]] });

  // ---------- L101-104: Preston asks for help ----------
  const CLASS2 = (c) => { const k = c.actor('kid'); seat(k, -1, -2.6 + 3 * 2.1 + 0.75, Math.PI, 0.53, 'sitIdle'); return k; };
  S('L101', 'classroom', (c) => {
    const k = CLASS2(c); k.expr('neutral'); const p = c.actor('preston'); p.expr('nervous');
    c.cam.path([[0, [2.0, 1.9, 7.0], [-0.4, 1.4, 4.2], 40], [c.T, [1.6, 1.8, 6.4], [-0.4, 1.4, 4.2], 38]], E.sine);
    c.ov.corner('Before the big math test', 0, 2.6);
    const tw1 = c.at('L101:he'), tl = c.at('L101:he#2'), tws = c.at('L101:then');
    c.ov.bubble(p, 'Can you... help me study?', c.at('L101:can') - 0.1, c.T, { side: 1, size: 28, fill: '#f4f0ff' });
    return (t) => { walk(p, t, tw1 - 0.4, tl, [3.5, 2.0], [0.0, 4.2], { rate: 7 }); if (t > tl) { p.root.rotation.y = -Math.PI / 2 - 0.4; p.state.look = [Math.sin((t - tl) * 4) * 0.9 * (t < tws ? 1 : 0), 0]; } if (t > tws) { p.body.rotation.x = 0.3; talk(p, t, [[c.at('L101:can'), c.T]]); } };
  }, { sfx: [['L101:he#2', 'sneaky_pluck', -8], ['L101:then', 'whisper', -6]] });

  S('L102', 'classroom', (c) => {
    const k = CLASS2(c); k.expr('deadpan');
    c.cam.at([-1.0, 1.55, 2.5], [-1, 1.4, 4.45], 32);
    c.ov.bubble(k, 'Can’t your dad just hire a tutor?', c.at('L102:can\'t') - 0.1, c.T, { side: 1 });
    return (t) => { talk(k, t, [[c.at('L102:can\'t'), c.T - 0.1]]); };
  });

  S('L103', 'classroom', (c) => {
    const p = c.actor('preston').place(0.0, 4.2, -Math.PI / 2 - 0.4); p.expr('embarrassed');
    c.cam.at([-0.9, 1.75, 3.0], [0, 1.6, 4.2], 30);
    c.ov.counter((v) => 'TUTORS QUIT: ' + Math.round(v), 0, 3, c.at('L103:three') - 0.2, c.T, { y: 220, size: 70, w: 640, h: 160, dur: 0.8 });
    return (t) => { talk(p, t, [[0, c.T - 0.1]]); p.pose('idle', 'shrug', 0.6); };
  }, { sfx: [['L103:three', 'door_slam', -10], ['L103:they', 'sad_trombone_short', -10]] });

  S('L104', 'classroom', (c) => {
    const k = CLASS2(c); k.expr('happy'); k.pose('sitIdle', 'point', 0.6);
    const p = c.actor('preston'); seat(p, 0.4, 4.6, -Math.PI / 2 - 0.2, 0.53, 'sitIdle'); p.expr('confused');
    const tb = c.prop('textbook'); tb.obj.position.set(-0.4, 0.99, 3.95); tb.obj.rotation.y = -0.4;
    c.cam.path([[0, [1.8, 2.4, 2.0], [-0.3, 1.2, 4.2], 40], [c.T, [1.6, 2.3, 1.8], [-0.3, 1.2, 4.2], 38]], E.sine);
    c.ov.icon(p, 'bulb', c.at('L104:but') - 0.1, c.T);
    return (t) => { talk(k, t, [[0, c.at('L104:he\'s')]]); if (t > c.at('L104:he\'s')) { talk(p, t, [[c.at('L104:he\'s'), c.at('L104:but')]]); p.expr('grin'); } if (t > c.at('L104:zero')) { p.pose({ aL: [0.2, 0, 0.2], aR: [0.2, 0, 0.2], lL: 1.9, lR: 1.9, sit: 1, lean: [-0.25, 0] }); p.state.legsOut = true; } if (t > c.at('L104:but')) p.expr('happy'); };
  }, { sfx: [[0, 'pencil_write', -10], ['L104:zero', 'burp_cartoon', -10]] });

  // ---------- L105-115: the birthday party ----------
  S('L105', 'void', (c) => {
    const env = c.prop('envelope'); env.obj.position.set(0, 1.5, 0); env.obj.scale.setScalar(2.2);
    c.cam.at([0, 1.55, 2.6], [0, 1.5, 0], 36);
    c.ov.big('You’re invited', 'Theo’s 13th birthday', 0.5, c.T, { y: 860, size: 80, w: 940, h: 220 });
    return (t) => { env.obj.rotation.y = Math.sin(t * 1.5) * 0.3; env.obj.position.y = 1.5 + Math.sin(t * 2) * 0.04; };
  }, { sfx: [[0, 'magic_chime', -6], [0.5, 'party_horn', -10]] });

  S('L106', 'mansion', (c) => {
    const k = c.actor('kidHome').place(0, 14, Math.PI); k.expr('awe');
    c.cam.path([[0, [0, 1.6, 17], [0, 2.5, 6], 44], [c.at('L106:it\'s#2') + 0.3, [0, 9, 26], [0, 4, -12], 54]], E.io);
    c.ov.pill('"A small country"', c.at('L106:small') - 0.1, c.T, { y: 110 });
  }, { sfx: [[0, 'party_walla', -10], [0, 'party_music_far', -10], [0.3, 'choir_aah', -10]] });

  S('L106:there\'s', 'mansion', (c) => {
    const b1 = c.actor('band1').place(16.5, -9.5, -0.5); const b2 = c.actor('band2').place(14.8, -9.0, -0.5); b1.expr('joy'); b2.expr('grin');
    b1.root.position.y = 1.0; b2.root.position.y = 1.0; b1.state.groundY = 1.0; b2.state.groundY = 1.0;
    c.cam.path([[0, [11, 2.4, -2], [15.5, 2.4, -9.5], 40], [c.T, [11.5, 2.2, -3], [15.5, 2.4, -9.5], 38]], E.sine);
    c.ov.pill('Live band', 0, c.T, { y: 110 });
    return (t) => { b1.pose('holdFront'); b1.state.armFn = (i) => [0, 0, Math.sin(t * 14 + i) * 0.3]; b2.pose('cheer'); b2.state.bounce = Math.abs(Math.sin(t * 8)) * 0.1; };
  }, { sfx: [[0, 'band_live', -6]] });

  S('L106:a#3', 'mansion', (c) => {
    const ch = c.actor('chef').place(-9.3, -2.9, 0.6); ch.expr('happy');
    c.cam.path([[0, [-6.5, 2.0, 1.8], [-9, 1.8, -2], 38], [c.T, [-6.8, 2.0, 1.4], [-9, 1.8, -2], 36]], E.sine);
    c.ov.pill('Private chef', 0, c.T, { y: 110 });
    return (t) => { ch.pose('holdFront'); ch.state.armFn = (i) => [0, 0, Math.sin(t * 12 + i) * 0.25]; };
  }, { sfx: [[0, 'sizzle', -8]] });

  S('L106:a#4', 'mansion', (c) => {
    c.cam.path([[0, [-12, 1.5, 2], [-22, 7, -14], 44], [c.T, [-12.5, 1.5, 1], [-22, 8, -14], 44]], E.sine);
    c.ov.pill('Ferris wheel', 0, c.T, { y: 110 });
  }, { sfx: [[0, 'carnival_music', -10], [0, 'ferris_creak', -12]] });

  S('L106:and', 'mansion', (c) => {
    const gi = c.prop('giraffe'); gi.obj.position.set(4, 0, 6); gi.obj.rotation.y = -0.5;
    const k = c.actor('kidHome').place(1.6, 8.6, 2.2); k.expr('blank');
    c.cam.path([[0, [0, 2.0, 13], [3, 3, 6], 40], [c.at('L106:giraffe'), [1.4, 3.8, 10.5], [4, 5.4, 6.3], 34], [c.T, [1.6, 4.0, 10.0], [4, 5.5, 6.3], 30]], E.io);
    c.ov.pop('A GIRAFFE.', c.at('L106:giraffe') + 0.1, c.T, { y: 900, size: 110, colors: ['#ffd36b', '#ff8a3d'], rot: 0.04 });
    return (t) => { gi.look = 0.4; lookAtPt(k, 4, 6); k.state.look[1] = -0.5; };
  }, { sfx: [['L106:giraffe', 'record_scratch', -6], ['L106:giraffe', 'giraffe_chew', -10]] });

  S('L107', 'mansion', (c) => {
    const gi = c.prop('giraffe'); gi.obj.position.set(4, 0, 6); gi.obj.rotation.y = -1.2;
    const k = c.actor('kidHome').place(2.0, 7.2, 1.3); k.expr('deadpan');
    const ex = ['ex70', 'ex71'].map((n, i) => c.actor(n).place(0.4 + i * 1.2, 8.0 + i * 0.6, 2.4)); ex.forEach(a => { a.expr('happy'); a.pose('holdOne'); });
    c.cam.at([0.0, 2.6, 12.5], [2.6, 2.6, 6], 38);
    c.ov.icon(k, '?', 0.2, c.T);
    return (t) => { gi.bend = 0.25; lookAtPt(k, 4, 6); };
  }, { sfx: [[0.2, 'question_pop', -8]] });

  S('L108', 'mansion', (c) => {
    const th = c.actor('theo').place(-3, 4, 0.4); th.expr('happy'); th.pose('phone');
    const ph = c.prop('phone'); c.hold(th, ph, 1); ph.obj.rotation.set(-1.0, 0, 0);
    c.cam.path([[0, [-2.0, 1.8, 6.4], [-3, 1.6, 4], 36], [c.T, [-2.2, 1.8, 6.0], [-3, 1.6, 4], 34]], E.sine);
    c.ov.phone('videocall', c.at('L108:happy') - 0.6, c.at('L108:it\'s') + 0.6, { caption: 'Happy birthday, champ!', len: 2.5, x: 1400, scale: 0.72, dim: 0.15 });
    const tw2 = c.at('L108:theo');
    return (t) => { if (t > c.at('L108:it\'s')) th.expr('quiet'); if (t > tw2) th.expr('sad'); const away = clamp((t - c.at('L108:puts')) / 0.5); th.pose('phone', 'idle', away); ph.obj.visible = away < 0.9; };
  }, { sfx: [['L108:happy', 'video_msg', -6], ['L108:puts', 'pocket', -10], ['L108:puts', 'sad_note', -10]] });

  S('L109', 'mansion', (c) => {
    const th = c.actor('theo').place(4.6, 3.6, 0); th.expr('happy');
    const ex = [['ex70', 3.4, 4.6, 2.6], ['ex71', 6.0, 4.4, -2.6], ['ex72', 5.6, 5.4, 3.0]].map(([n, x, z, r]) => { const a = c.actor(n).place(x, z, r); a.expr('grin'); a.pose('give'); return a; });
    const wb = c.prop('watchBox'); c.hold(ex[0], wb, 1); const cs = c.prop('console_'); c.hold(ex[1], cs, 1);
    const car = c.prop('bowCar'); car.obj.rotation.y = 0.6;
    c.cam.path([[0, [6.2, 1.9, 9.0], [4.8, 1.5, 4], 38], [c.at('L109:one'), [2.0, 2.2, 12.5], [3.0, 1.0, 5], 44], [c.T, [1.6, 2.4, 13.0], [3.0, 1.0, 5], 46]], E.io);
    c.ov.pill('Designer watches', c.at('L109:designer') - 0.1, c.at('L109:gaming'), { x: 600, y: 200 }); c.ov.pill('Gaming consoles', c.at('L109:gaming') - 0.1, c.at('L109:one'), { x: 1300, y: 200 });
    c.ov.pop('HE’S 13', c.at('L109:theo#2') - 0.05, c.T, { y: 220, size: 120 });
    return (t) => { const tc = c.at('L109:car') - 1.4; const x = kf(t, [[tc, -14], [tc + 1.6, -0.2, E.out]]); car.obj.position.set(x, 0, 7.5); car.wheels.forEach(w => w.rotation.x = x * 2); if (t > c.at('L109:he')) th.expr('deadpan'); };
  }, { sfx: [['L109:designer', 'gift_rustle', -8], ['L109:gaming', 'console_beep', -8], ['L109:car', 'supercar_pass', -4], ['L109:car', 'tada', -10], ['L109:he', 'sad_trombone_short', -12]] });

  S('L110', 'mansion', (c) => {
    const k = c.actor('kidHome').place(-1, 5, 0.3); k.expr('nervous'); k.pose('holdFront');
    const cm = c.prop('comic'); c.hold(k, cm, 1); cm.obj.position.set(-0.1, 0.0, 0.05); cm.obj.rotation.set(-0.5, Math.PI, 0);
    c.cam.path([[0, [-0.6, 1.8, 7.2], [-1, 1.45, 5], 36], [c.at('L110:it\'s'), [-0.45, 1.35, 6.5], [-1.0, 1.08, 5.25], 34], [c.T, [-0.5, 1.32, 6.3], [-1.0, 1.08, 5.25], 32]], E.io);
    c.ov.pill('Hand-drawn', c.at('L110:you#2') - 0.1, c.T, { y: 110 });
    c.ov.pill('3 weeks of work', c.at('L110:it#2') - 0.1, c.T, { y: 190 });
    return (t) => { k.state.look = [0, 0.4]; };
  }, { sfx: [['L110:it\'s', 'paper_rustle', -8], ['L110:it#2', 'tender_pluck', -8]] });

  S('L111', 'mansion', (c) => {
    const k = c.actor('kidHome').place(-1, 5, 0.3); k.expr('embarrassed');
    const cm = c.prop('comic'); c.hold(k, cm, 1); cm.obj.rotation.set(-0.5, Math.PI, 0);
    const gift = c.prop('giftBox'); gift.obj.position.set(1.2, 0.95, 4.0); gift.obj.scale.setScalar(2.2);
    c.cam.path([[0, [0.6, 1.6, 7.6], [-0.6, 1.3, 5], 38], [c.T, [0.4, 1.6, 7.2], [-0.6, 1.3, 5], 36]], E.sine);
    return (t) => { k.pose('holdFront', 'behind', clamp((t - 0.2) / 0.6)); k.state.look = [0.6, 0]; };
  }, { sfx: [[0.2, 'cloth_rustle', -10], [0.3, 'awkward_pluck', -8]] });

  S('L112', 'mansion', (c) => {
    const th = c.actor('theo').place(-0.6, 4.0, 0.1); th.expr('quiet'); th.pose('holdFront');
    const cm = c.prop('comic'); c.hold(th, cm, 1); cm.obj.position.set(0.12, 0, 0.1); cm.obj.rotation.set(-0.6, Math.PI, 0);
    c.cam.path([[0, [-0.6, 1.6, 6.2], [-0.6, 1.45, 4], 36], [c.at('L112:and'), [-0.5, 1.5, 5.4], [-0.6, 1.4, 4], 32], [c.T, [-0.5, 1.5, 5.2], [-0.6, 1.4, 4], 30]], E.io);
    const tr = c.at('L112:reads');
    return (t) => { const open = clamp((t - c.at('L112:he') - 0.2) / 0.6); cm.hinge.rotation.y = -open * 2.6 + (t > tr ? Math.sin((t - tr) * 3) * 0.3 : 0); th.state.look = [0, 0.4]; if (t > tr) th.expr('awe'); };
  }, { sfx: [['L112:opens', 'book_open', -6], ['L112:every', 'page_flip', -8], ['L112:single', 'page_flip', -8], ['L112:page', 'page_flip', -8]] });

  S('L113', 'mansion', (c) => {
    const th = c.actor('theo').place(-0.6, 4.0, 0.1); th.expr('teary'); th.pose('holdFront');
    const cm = c.prop('comic'); c.hold(th, cm, 1); cm.obj.rotation.set(-0.6, Math.PI, 0);
    c.cam.path([[0, [-0.55, 1.65, 6.0], [-0.6, 1.62, 4], 30], [c.T, [-0.55, 1.65, 5.7], [-0.6, 1.62, 4], 28]], E.sine);
    c.ov.bubble(th, 'You made this? For ME?', c.at('L113:you') - 0.1, c.T, { side: 1 });
    return (t) => { th.state.look = [0, -0.05]; talk(th, t, [[c.at('L113:you'), c.T - 0.1]]); };
  }, { sfx: [[0, 'emotional_swell', -8]] });

  S('L114', 'mansion', (c) => {
    const k = c.actor('kidHome').place(-0.8, 5.6, Math.PI - 0.1); k.expr('embarrassed');
    c.cam.at([-0.75, 1.65, 3.4], [-0.8, 1.6, 5.6], 30);
    c.ov.bubble(k, 'Yeah.', c.at('L114:yeah') - 0.1, c.T, { side: 1 });
    return (t) => { k.pose('idle', 'shrug', pulse(t, 0.0, 0.9)); talk(k, t, [[c.at('L114:yeah'), c.T - 0.1]]); };
  }, { sfx: [[0, 'shrug_whoosh', -10]] });

  S('L115', 'mansion', (c) => {
    const car = c.prop('bowCar'); car.obj.position.set(-0.2, 0, 7.5); car.obj.rotation.y = 0.6;
    c.cam.path([[0, [4, 1.4, 13], [-0.2, 1.0, 7.5], 38], [c.T, [3.4, 1.3, 12], [-0.2, 1.0, 7.5], 36]], E.sine);
    c.ov.corner('End of the night', 0, c.T);
    c.ov.tint(0, c.T, '#1a0b4a', 0.35);
  }, { sfx: [[0, 'crickets', -12], [0, 'party_music_far', -18]] });

  S('L115:and', 'mansion', (c) => {
    const bench = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.1, 0.55), new THREE.MeshStandardMaterial({ color: '#f4efff' })); bench.position.set(3, 0.4, -20); c.scene.add(bench); const bl = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.4, 0.4), new THREE.MeshStandardMaterial({ color: '#c0b8d8' })); bl.position.set(3, 0.2, -20); c.scene.add(bl); c.onExit = () => { c.scene.remove(bench); c.scene.remove(bl); };
    const th = c.actor('theo'); seat(th, 3, -20, 0, 0.45, 'sitIdle'); th.expr('content'); th.pose('sitIdle', 'holdFront', 1);
    const cm = c.prop('comic'); c.hold(th, cm, 1); cm.obj.rotation.set(-0.6, Math.PI, 0); cm.hinge.rotation.y = -2.6;
    c.cam.path([[0, [4.4, 1.45, -17.4], [3, 1.2, -20], 36], [c.T, [4.1, 1.4, -17.9], [3, 1.2, -20], 32]], E.sine);
    c.ov.tint(0, c.T, '#1a0b4a', 0.3);
    return (t) => { th.state.look = [0, 0.45]; cm.hinge.rotation.y = -2.6 + Math.sin(t) * 0.1; };
  }, { sfx: [[0, 'page_flip', -12], [0.4, 'warm_pad', -8]] });

  // ---------- L116-128: dinner at home ----------
  S('L116', 'apartment:night', (c) => {
    const k = c.actor('kidHome').place(2.8, 1.6, Math.PI / 2); k.expr('nervous');
    const th = c.actor('theoCasual').place(3.4, 1.8, -Math.PI / 2); th.expr('happy');
    c.cam.path([[0, [-1.6, 1.9, 2.8], [2.6, 1.4, 1.6], 40], [c.T, [-1.2, 1.9, 2.6], [2.6, 1.4, 1.6], 38]], E.sine);
    c.ov.icon(k, 'sweat', c.at('L116:you\'re') - 0.1, c.T, { dx: 100 });
    return (t) => { walk(th, t, 0.2, 1.4, [3.8, 1.8], [2.9, 0.7], { rate: 7 }); lookAtPt(k, th.root.position.x, th.root.position.z); };
  }, { sfx: [[0, 'door_open', -6], [0, 'amb_apartment', -14]] });

  S('L116:your', 'void', (c) => {
    c.cam.at([0, 1.5, 6], [0, 1.4, 0], 36);
    c.ov.custom(0, c.T, (g, lt) => { const k = E.back(clamp(lt / 0.4)); g.save(); g.translate(960, 500); g.scale(k, k);
      g.fillStyle = '#ffd36b'; g.strokeStyle = '#1b0b3f'; g.lineWidth = 6; g.beginPath(); g.roundRect(-520, -300, 1040, 600, 30); g.fill(); g.stroke();
      g.fillStyle = '#ff8a5c'; g.beginPath(); g.roundRect(-140, -40, 280, 200, 16); g.fill(); g.stroke();
      g.fillStyle = '#1b0b3f'; g.font = '44px "DM Serif Display"'; g.textAlign = 'center'; g.fillText('THEO’S BATHROOM', 0, -220); g.font = '30px "DM Serif Display"'; g.fillText('your entire apartment', 0, 210); g.font = '80px "Noto Color Emoji"'; g.fillText('\u{1F6C1}', -360, -40); g.fillText('\u{1F6BF}', 360, -40); g.fillText('\u{1F3E0}', 0, 90); g.restore(); });
  }, { sfx: [[0, 'pop', -6]] });

  S('L116:the', 'apartment:night', (c) => {
    c.cam.path([[0, [-1.2, 1.4, 3.4], [-3.3, 0.6, 0.8], 38], [c.at('L116:and'), [-1.0, 1.4, 2.6], [-3.3, 0.6, 0.8], 36], [c.at('L116:and') + 0.05, [1.6, 1.0, 1.0], [3.85, 0.6, -0.5], 36], [c.T, [1.8, 1.0, 0.8], [3.85, 0.6, -0.5], 32]], E.io);
    c.ov.tag(new THREE.Vector3(-3.3, 0.9, 0.8), 'Older than both of you', 0.2, c.at('L116:and'), { dx: 260, dy: -180 });
    c.ov.tag(new THREE.Vector3(3.85, 1.0, -0.5), '*angry goose noises*', c.at('L116:radiator'), c.T, { dx: -480, dy: -200 });
    return (t) => { c.cam.shake = t > c.at('L116:goose') ? 0.03 : 0.006; };
  }, { sfx: [[0, 'couch_creak', -8], ['L116:goose', 'goose_honk', -2], ['L116:goose', 'radiator_clank', -6]] });

  S('L117', 'apartment:night', (c) => {
    const th = c.actor('theoCasual').place(2.4, 0.9, -1.2); th.expr('awe');
    c.cam.path([[0, [0.6, 1.7, 2.4], [2.4, 1.6, 0.9], 34], [c.T, [0.8, 1.7, 2.2], [2.4, 1.6, 0.9], 32]], E.sine);
    c.ov.icon(th, 'sparkle', 0.3, c.T, { dx: 100 });
    return (t) => { th.state.look = [Math.sin(t * 1.2) * 0.6, -0.1]; };
  }, { sfx: [[0.2, 'sweet_chime', -8]] });

  S('L118', 'apartment:night', (c) => {
    const D = DINNER(c); D.m.expr('happy'); D.m.pose('holdFront');
    const pot = c.prop('spaghetti', 5); c.hold(D.m, pot, 1);
    D.plates.forEach(p => p.obj.visible = true);
    c.cam.path([[0, [0, 2.6, 3.6], [0, 1.0, 0.0], 42], [c.T, [0.3, 2.4, 3.2], [0, 1.0, 0.0], 40]], E.sine);
    c.ov.pill('Mom’s famous spaghetti', 0.3, c.at('L118:at'), { y: 110 });
    return (t) => { walk(D.m, t, 0, 1.5, [-1.4, -1.6], [-0.4, -0.9], { rate: 7 }); D.th.expr('awe'); D.k.expr('happy'); D.d.expr('happy'); D.b.expr('joy'); };
  }, { sfx: [[0, 'dinner_clatter', -10], [0.4, 'plate_set', -8]] });

  S('L118:at', 'theoDining', (c) => {
    const ch = c.actor('chef').place(1.0, -1.6, 0); ch.expr('happy'); ch.pose('holdFront');
    const pl = c.prop('plate'); pl.obj.position.set(0, 1.09, 0); const art = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), new THREE.MeshStandardMaterial({ color: '#ff5d8f' })); art.position.set(0, 1.15, 0); c.scene.add(art);
    const dots = []; for (let i = 0; i < 7; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 6), new THREE.MeshStandardMaterial({ color: ['#2ecc71', '#ffd36b', '#9d7bff'][i % 3] })); d.position.set(Math.cos(i) * 0.18, 1.12, Math.sin(i) * 0.18); c.scene.add(d); dots.push(d); }
    c.onExit = () => { c.scene.remove(art); dots.forEach(d => c.scene.remove(d)); };
    c.cam.path([[0, [0.6, 1.6, 1.0], [0, 1.1, 0], 30], [c.T, [0.5, 1.5, 0.8], [0, 1.1, 0], 28]], E.sine);
    c.ov.pill('"Food as art"', 0.1, c.T, { y: 110 });
  }, { sfx: [[0, 'fancy_ding', -8]] });

  S('L118:here', 'apartment:night', (c) => {
    const D = DINNER(c); D.th.pose('eat'); D.th.expr('chew');
    c.cam.path([[0, [-0.25, 1.55, 0.55], [0.85, 1.32, -0.55], 44], [c.T, [-0.15, 1.52, 0.45], [0.85, 1.32, -0.55], 42]], E.sine);
    c.ov.counter((v) => 'PLATES: ' + Math.round(v), 0, 3, c.at('L118:theo') - 0.1, c.at('L118:your#2'), { y: 200, x: 1450, size: 80, w: 460, h: 160, dur: 1.0 });
    return (t) => { D.th.state.chew = true; };
  }, { sfx: [['L118:theo', 'chewing', -8], ['L118:theo', 'plate_stack', -8]] });

  S('L118:your#2', 'apartment:night', (c) => {
    const D = DINNER(c); D.b.expr('joy'); D.th.expr('happy');
    c.cam.path([[0, [-0.25, 1.35, 0.05], [0.85, 1.12, 1.15], 44], [c.T, [-0.15, 1.33, 0.15], [0.85, 1.12, 1.15], 42]], E.sine);
    for (let i = 0; i < 6; i++) c.ov.icon(D.b, '?', 0.1 + i * 0.3, c.at('L118:your#3'), { dx: (i - 2.5) * 70, dy: -(i % 2) * 40, size: 0.6 });
    return (t) => { talk(D.b, t, [[0, c.T]]); D.b.state.bounce = Math.abs(Math.sin(t * 9)) * 0.06; lookAtPt(D.b, 0.85, -0.55); };
  }, { sfx: [[0.1, 'question_pops', -8], [0.1, 'kid_chatter', -10]] });

  S('L118:your#3', 'apartment:night', (c) => {
    const D = DINNER(c); D.d.expr('joy');
    c.cam.path([[0, [0.45, 1.65, -0.15], [-0.85, 1.48, 1.15], 42], [c.T, [0.35, 1.62, -0.05], [-0.85, 1.48, 1.15], 40]], E.sine);
    c.ov.bubble(D.d, 'Why did the lawnmower get a promotion?', 0.2, c.T, { side: 1, size: 30 });
    return (t) => { talk(D.d, t, [[0.2, c.T]]); D.d.pose('sitIdle', 'shrug', 0.5); };
  }, { sfx: [[0.2, 'dad_joke_drum', -10]] });

  S('L119', 'apartment:night', (c) => {
    const D = DINNER(c); [D.k, D.d, D.b].forEach(a => a.expr('laugh')); D.m.expr('laugh'); D.th.expr('content');
    c.cam.path([[0, [0, 2.8, 3.8], [0, 1.0, 0], 42], [c.T, [0, 2.6, 3.4], [0, 1.0, 0], 40]], E.sine);
    c.ov.custom(0, c.T, (g) => { g.font = '800 64px "Baloo 2"'; g.fillStyle = '#fff'; g.strokeStyle = '#1b0b3f'; g.lineWidth = 10; g.textAlign = 'center'; for (const [x, y, s] of [[420, 260, 'HA'], [1500, 300, 'HAHA'], [960, 180, 'HA HA']]) { g.strokeText(s, x, y); g.fillText(s, x, y); } });
    return (t) => { [D.k, D.d, D.b, D.m].forEach((a, i) => a.state.bounce = Math.abs(Math.sin(t * 9 + i)) * 0.04); };
  }, { sfx: [[0, 'family_laugh', -4]] });

  S('L120', 'apartment:night', (c) => {
    const D = DINNER(c); D.th.expr('quiet'); [D.k, D.d, D.b].forEach(a => a.expr('laugh'));
    c.cam.path([[0, [-0.1, 1.48, 0.42], [0.85, 1.36, -0.55], 44], [c.T, [0.0, 1.47, 0.32], [0.85, 1.36, -0.55], 40]], E.sine);
    return (t) => { D.th.state.look = [0, 0.25]; };
  }, { sfx: [[0, 'music_drop', -6], [0.2, 'laugh_fade', -12]] });

  S('L121', 'apartment:night', (c) => {
    const D = DINNER(c); D.k.expr('worried');
    c.cam.at([0.1, 1.48, 0.42], [-0.85, 1.36, -0.55], 44);
    c.ov.bubble(D.k, 'You okay?', 0, c.T, { side: 1, size: 32 });
    return (t) => { lookAtPt(D.k, 0.85, -0.55); talk(D.k, t, [[0, c.T - 0.1]]); };
  });

  S('L122', 'apartment:night', (c) => {
    const D = DINNER(c); D.th.expr('quiet');
    c.cam.path([[0, [-0.1, 1.48, 0.42], [0.85, 1.36, -0.55], 44], [c.T, [0.0, 1.47, 0.32], [0.85, 1.36, -0.55], 40]], E.sine);
    c.ov.bubble(D.th, 'Do you guys eat together... like... every night?', c.at('L122:do') - 0.1, c.T, { side: -1, size: 30, w: 520 });
    return (t) => { D.th.body.rotation.x = 0; if (t < 0.6) D.th.state.look = [0, Math.sin(t * 6) * 0.15]; talk(D.th, t, [[c.at('L122:do'), c.T - 0.1]]); };
  }, { sfx: [[0, 'soft_piano', -8]] });

  S('L123', 'apartment:night', (c) => {
    const D = DINNER(c); D.k.expr('confused');
    c.cam.at([0.1, 1.48, 0.42], [-0.85, 1.36, -0.55], 44);
    c.ov.bubble(D.k, 'Yeah? Don’t you?', 0, c.T, { side: 1, size: 32 });
    return (t) => { lookAtPt(D.k, 0.85, -0.55); talk(D.k, t, [[0, c.T - 0.1]]); };
  });

  S('L124', 'apartment:night', (c) => {
    const D = DINNER(c); D.th.expr('sad');
    c.cam.path([[0, [-0.1, 1.48, 0.42], [0.85, 1.34, -0.55], 44], [c.T, [0.0, 1.47, 0.32], [0.85, 1.34, -0.55], 40]], E.sine);
    return (t) => { D.th.state.look = [0, 0.45]; talk(D.th, t, [[c.at('L124:my'), c.T]]); };
  });

  S('L124:my', 'theoDining', (c) => {
    const th = c.actor('theo'); seat(th, -5.5, -1.4, 0, 0.55, 'sitIdle'); th.expr('quiet');
    const ch = c.actor('chef').place(-4.0, -2.1, -0.9); ch.expr('neutral');
    const pl = c.prop('plate'); pl.obj.position.set(-5.5, 1.09, -0.75);
    c.cam.path([[0, [4, 3.2, 6], [-4, 1.1, -0.6], 44], [c.T, [2, 2.6, 4.6], [-5, 1.1, -0.9], 40]], E.sine);
    c.ov.pill('Tokyo', c.at('L124:tokyo') - 0.1, c.at('L124:before'), { x: 1450, y: 180 });
    c.ov.pill('London', c.at('L124:london') - 0.1, c.T, { x: 1450, y: 260 });
    c.ov.tint(0, c.T, '#0a0530', 0.25);
  }, { sfx: [[0, 'big_room_echo', -10], [0, 'clock_tick', -10], ['L124:tokyo', 'ding_soft', -14], ['L124:london', 'ding_soft', -14]] });

  S('L125', 'apartment:night', (c) => {
    DINNER(c);
    c.cam.path([[0, [0, 3.0, 3.6], [0, 1.0, 0], 42]], E.io);
    c.cam.fn = (t) => null;
    return (t) => { c.cam.roll = E.io(clamp((t - c.at('L125:flips') + 0.2) / 1.2)) * Math.PI; };
  }, { sfx: [['L125:flips', 'whoosh_big', -6], ['L125:flips', 'reverse_swell', -8]] });

  S('L126', 'voidDark', (c) => {
    const th = c.actor('theo').place(0, 0, 0); th.expr('quiet');
    const h = c.prop('helicopter'); h.obj.position.set(-5, 0, -5); h.obj.scale.setScalar(0.6); h.spin = 0;
    const g = c.prop('goldCar'); g.obj.position.set(4.5, 0, -3); g.obj.rotation.y = -0.6;
    c.cam.path([[0, [0, 2.2, 8], [0, 1.6, -1], 40], [c.T, [0, 2.0, 6.6], [0, 1.6, -1], 38]], E.sine);
    c.ov.panel([{ text: 'The money', mark: 'check', at: c.at('L126:the') }, { text: 'The houses', mark: 'check', at: c.at('L126:the#2') }, { text: 'The helicopters', mark: 'check', at: c.at('L126:the#3') }], 0, c.at('L126:but'), { x: 60, y: 60 });
    return (t) => { const f = 1 - clamp((t - c.at('L126:but')) / 0.8); h.obj.scale.setScalar(0.6 * Math.max(0.001, f)); g.obj.scale.setScalar(Math.max(0.001, f)); };
  }, { sfx: [['L126:the', 'tick', -8], ['L126:the#2', 'tick', -8], ['L126:the#3', 'tick', -8], ['L126:but', 'shrink_whoosh', -6]] });

  S('L126:sitting', 'apartment:night', (c) => {
    const D = DINNER(c); D.th.expr('loving'); [D.k, D.d, D.b].forEach(a => a.expr('happy')); D.m.expr('happy');
    c.cam.path([[0, [2.3, 2.05, -1.0], [-0.6, 1.2, 0.9], 44], [c.T, [2.15, 2.0, -0.85], [-0.6, 1.2, 0.9], 42]], E.sine);
    c.ov.custom(c.at('L126:you\'re') - 0.2, c.T, (g, lt, it) => { const a = clamp((lt - it.t0) / 0.6); g.globalAlpha = a * 0.5; const gr = g.createRadialGradient(700, 540, 50, 700, 540, 700); gr.addColorStop(0, 'rgba(255,215,120,0.8)'); gr.addColorStop(1, 'rgba(255,215,120,0)'); g.fillStyle = gr; g.fillRect(0, 0, 1920, 1080); }, -1);
    c.ov.pop('THE RICH ONE', c.at('L126:you\'re') + 0.1, c.T, { y: 180, size: 100, colors: ['#fff27a', '#ffb23b'] });
    return (t) => { lookAtPt(D.th, -0.85, 0.5); };
  }, { sfx: [['L126:you\'re', 'gold_shimmer', -6]] });

  S('L127', 'apartment:night', (c) => {
    const D = DINNER(c); D.k.expr('content');
    c.cam.path([[0, [0.1, 1.48, 0.42], [-0.85, 1.36, -0.55], 44], [c.T, [0.0, 1.47, 0.32], [-0.85, 1.36, -0.55], 40]], E.sine);
    return (t) => { lookAtPt(D.k, 0.85, -0.55, 0.5); };
  }, { sfx: [[0, 'warm_pad', -8]] });

  S('L128', 'apartment:night', (c) => {
    const th = c.actor('theoCasual').place(-1.6, -2.15, Math.PI); th.expr('determined'); th.pose('wash');
    const k = c.actor('kidHome').place(-0.4, -1.6, -2.3); k.expr('laugh');
    const m = c.actor('mom').place(0.6, -1.2, -2.6); m.expr('laugh');
    const soap = c.prop('soap'); soap.obj.position.set(-2.0, 1.0, -2.6);
    const bub = c.prop('bubbles'); bub.obj.position.set(-1.6, 0.9, -2.4); bub.obj.scale.setScalar(0.9);
    c.cam.path([[0, [0.8, 1.9, 1.4], [-1.2, 1.3, -2.2], 40], [c.T, [1.2, 2.1, 1.8], [-1.0, 1.3, -2.0], 44]], E.sine);
    c.ov.tag(new THREE.Vector3(-2.0, 1.25, -2.6), 'Half a bottle', c.at('L128:he#2') + 0.2, c.at('L128:the#2'), { dx: 260, dy: -220 });
    const tSit = c.at('L128:sit') - 0.4;
    return (t) => { bub.amount = clamp((t - c.at('L128:he#2')) / (c.at('L128:your') - c.at('L128:he#2'))); bub.obj.scale.setScalar(0.9 + bub.amount * 1.4); th.state.armFn = (i) => [0, Math.sin(t * 10 + i) * 0.15, 0];
      if (t > tSit) { seat(m, 0.85, -0.55, Math.PI + Math.PI * 3 / 4 + 0.6, 0.53, 'sitIdle'); m.expr('laugh'); m.state.bounce = Math.abs(Math.sin(t * 9)) * 0.04; } else m.state.bounce = Math.abs(Math.sin(t * 9)) * 0.03; k.state.bounce = Math.abs(Math.sin(t * 8)) * 0.03; if (t > c.at('L128:the#2')) th.expr('joy'); };
  }, { sfx: [[0, 'water_running', -10], ['L128:he#2', 'soap_squirt', -6], ['L128:the#2', 'bubbles_grow', -4], ['L128:your', 'mom_laugh', -6]] });

  // ---------- L129-134: the decision ----------
  S('L129', 'apartment:night', (c) => {
    const env = c.prop('envelope'); env.obj.position.set(0, 0.97, 0.3); env.obj.rotation.set(-Math.PI / 2, 0, 0.3);
    c.cam.path([[0, [0.3, 2.2, 1.3], [0, 0.97, 0.3], 36], [c.T, [0.2, 1.8, 0.9], [0, 0.97, 0.3], 34]], E.sine);
    c.ov.corner('End of the year', 0, 2.4);
    c.ov.big('Renewed', 'Scholarship · next year', c.at('L129:your') - 0.1, c.T, { y: 300, size: 110, w: 760, h: 260 });
  }, { sfx: [[0, 'envelope_slide', -6], ['L129:your', 'success_sting', -6]] });

  S('L130', 'void', (c) => {
    c.cam.at([0, 1.5, 6], [0, 1.4, 0], 36);
    c.ov.phone('lock', 0, c.T, { notifs: [{ at: 'L130:it\'s', title: 'Old Squad \u{1F3C0}', text: 'Bro, you coming back next year? We miss you.', icon: '\u{1F4AC}', color: '#2ecc71' }], dim: 0.2, shake: 0 });
  }, { sfx: [['L130:phone', 'phone_buzz', -4], ['L130:it\'s', 'notif_ping', -6]] });

  S('L131', 'voidPink', (c) => {
    c.cam.at([0, 1.5, 6], [0, 1.4, 0], 36);
    c.ov.choice({ title: 'Stay', sub: 'Goldcrest', icon: '\u{1F3F0}', c1: '#3a2a9a', c2: '#1d1450' }, { title: 'Go back', sub: 'Old school', icon: '\u{1F3E0}', c1: '#ff8a5c', c2: '#e04a6a' }, 0.2, c.T);
  }, { sfx: [[0.2, 'card_whoosh', -6], [0.45, 'card_whoosh', -6], [0.6, 'decision_hit', -6]] });

  S('L132', 'schoolExt', (c) => {
    const th = c.actor('theo'); seat(th, -0.6, -24.6, 0, 0.5, 'sitIdle'); th.expr('quiet');
    const k = c.actor('kid'); seat(k, 0.6, -24.6, 0, 0.5, 'sitIdle'); k.expr('quiet');
    c.cam.path([[0, [0, 1.4, -21.0], [0, 1.2, -24.6], 36], [c.T, [0, 1.35, -21.6], [0, 1.2, -24.6], 34]], E.sine);
    c.ov.bubble(th, 'It’s your choice. But lunch is going to be really boring without you.', c.at('L132:it\'s') - 0.1, c.T, { side: -1, size: 28, w: 600 });
    return (t) => { talk(th, t, [[c.at('L132:it\'s'), c.T - 0.1]]); th.state.look = [0.3, 0.2]; if (t > c.at('L132:but')) th.expr('content'); };
  }, { sfx: [[0, 'amb_birds', -14], [0, 'tender_piano', -8]] });

  S('L133', 'street', (c) => {
    const a = c.actor('oldFriend1').place(-1.2, -5.0, 0.2), b = c.actor('oldFriend2').place(0.4, -5.2, -0.2); a.expr('joy'); b.expr('grin');
    c.cam.path([[0, [-0.4, 1.7, -1.6], [-0.4, 1.5, -5], 38], [c.T, [-0.4, 1.7, -1.9], [-0.4, 1.5, -5], 36]], E.sine);
    c.ov.pill('Old friends', 0.1, c.at('L133:but'), { y: 110 });
    return (t) => { a.pose('wave'); a.state.armFn = (i) => i === 1 ? [Math.sin(t * 8) * 0.3, 0, 0] : null; b.pose('cheer'); b.state.bounce = Math.abs(Math.sin(t * 7)) * 0.05; };
  }, { sfx: [[0, 'amb_city', -14]] });

  S('L133:but', 'cafeteria', (c) => {
    const k = sitC(c, 'kid', 0, 1, 3), th = sitC(c, 'theo', 0, -1, 3), p = sitC(c, 'preston', 0, 1, 4), m = sitC(c, 'iconicGirl', 0, -1, 2), l = sitC(c, 'laundryGirl', 0, -1, 4);
    [k, th, p, m, l].forEach(a => a.expr('laugh'));
    c.cam.path([[0, [-2.4, 2.2, 5.0], [-5.4, 1.3, 2.0], 40], [c.T, [-2.2, 2.4, 5.4], [-5.4, 1.3, 2.0], 42]], E.sine);
    return (t) => { [k, th, p, m, l].forEach((a, i) => a.state.bounce = Math.abs(Math.sin(t * 8 + i)) * 0.03); };
  }, { sfx: [[0, 'friends_laugh', -8], [0, 'warm_pad', -10]] });

  S('L134', 'bedroom', (c) => {
    const k = c.actor('kidPJ'); seat(k, 1.6, -1.05, Math.PI, 0.55, 'sitIdle'); k.expr('thinking');
    const env = c.prop('envelope'); env.obj.position.set(1.6, 0.9, -1.75); env.obj.rotation.set(-Math.PI / 2, 0, 0);
    c.cam.path([[0, [0.3, 1.5, -1.25], [1.6, 1.15, -1.5], 38], [c.T, [0.45, 1.45, -1.35], [1.6, 1.12, -1.55], 34]], E.sine);
    c.ov.custom(0, c.T, (g, lt) => { const k1 = clamp(lt / c.T); g.fillStyle = `rgba(10,5,40,${0.25 * k1})`; g.fillRect(0, 0, 1920, 1080); }, -1);
    return (t) => { k.state.look = [0, 0.5]; };
  }, { sfx: [[0, 'clock_tick', -6]] });

  // ---------- L135-139: the last day ----------
  S('L135', 'hallway', (c) => {
    const k = c.actor('kid'); k.expr('content');
    c.cam.fn = (t) => { const z = k.root.position.z; return { p: [-1.2, 1.6, z - 3.8], l: [0, 1.5, z], fov: 40 }; };
    c.ov.corner('Last day of school', 0, c.T);
    return (t) => { walk(k, t, 0, c.T + 0.5, [0, 10], [0, 4], { rate: 7 }); k.root.rotation.y = Math.PI; };
  }, { sfx: [[0, 'nostalgic_piano', -6], [0, 'footsteps_shoe', -12]] });

  S('L135:past', 'cafeteria', (c) => {
    const k = c.actor('kid'); k.expr('content');
    c.cam.path([[0, [4, 1.6, -2], [0, 2.4, -8.2], 40], [c.T, [3.4, 1.6, -3], [0, 2.4, -8.2], 40]], E.sine);
    return (t) => { walk(k, t, 0, c.T, [3.5, -5.5], [-2.0, -5.5], { rate: 7 }); lookAtPt(k, 0, -8.2, 0.7); };
  }, { sfx: [[0, 'choc_flow', -10]] });

  S('L135:past#2', 'stables', (c) => {
    const k = c.actor('kid').place(0.3, 1.5, -0.4); k.expr('laugh');
    const h = c.prop('horse'); h.obj.position.set(-1.0, 0, 0); h.obj.rotation.y = 0.6; h.neckX = 0.35; h.chew = 1;
    c.cam.path([[0, [2.6, 2.0, 5.0], [-0.2, 1.6, 0.5], 38], [c.T, [2.3, 1.9, 4.5], [-0.2, 1.6, 0.5], 36]], E.sine);
    return (t) => { k.pose('idle', 'flail', pulse(t, c.at('L135:one#2') - 0.3, 1.0) * 0.5); };
  }, { sfx: [[0.2, 'horse_chew', -6], ['L135:one#2', 'horse_snort', -8]] });

  S('L135:past#3', 'classroom', (c) => {
    const k = c.actor('kid'); k.expr('content');
    c.cam.path([[0, [5, 2.6, 5.5], [-1, 1.2, 2], 44], [c.T, [4.4, 2.4, 5.0], [-1, 1.2, 2], 42]], E.sine);
    c.ov.custom(c.at('L135:car') - 0.2, c.T, (g, lt, it) => { g.globalAlpha = clamp((lt - it.t0) / 0.3) * 0.85; g.font = 'italic 54px "DM Serif Display"'; g.fillStyle = '#fff'; g.textAlign = 'center'; g.fillText('"...a car wash."', 960, 240); });
    return (t) => { walk(k, t, 0, c.T, [-6.5, 5.8], [-2.0, 5.8], { rate: 7 }); lookAtPt(k, -1, 4.45, 0.8); };
  }, { sfx: [['L135:car', 'echo_memory', -8]] });

  S('L135:past#4', 'schoolExt', (c) => {
    const k = c.actor('kid'); k.expr('content');
    c.cam.path([[0, [3.5, 1.7, 9], [0, 1.8, 2], 40], [c.T, [3.0, 1.7, 8], [0, 1.8, 2], 38]], E.sine);
    return (t) => { walk(k, t, 0, c.T + 1, [0, 1.5], [0, 7], { rate: 6.5 }); };
  }, { sfx: [[0, 'amb_birds', -14]] });

  S('L136', 'schoolExt', (c) => {
    const k = c.actor('kid').place(0, 7, Math.PI); k.expr('content');
    c.cam.path([[0, [0, 1.62, 4.6], [0, 1.6, 7], 30], [c.T, [0, 1.62, 4.9], [0, 1.6, 7], 28]], E.sine);
    c.ov.icon(k, 'bulb', 0.2, c.T);
  }, { sfx: [[0.2, 'idea_ding', -8]] });

  S('L137', 'void', (c) => {
    const k = c.actor('kid').place(0, 0, 0); k.expr('worried');
    const ring = ['ex0', 'ex1', 'ex2', 'ex3', 'ex4', 'ex5'].map((n, i) => { const a = (i - 2.5) * 0.45; return c.actor(n).place(Math.sin(a) * 3.2, -Math.cos(a) * 3.2 + 0.5, -a); });
    c.cam.path([[0, [0, 2.0, 6.5], [0, 1.4, 0], 40], [c.T, [0, 1.8, 5.0], [0, 1.4, 0], 38]], E.sine);
    return (t) => { ring.forEach(a => { a.expr('smug'); a.pose('cross'); }); if (t > c.at('L137:but')) { k.expr('determined'); ring.forEach(a => a.expr('neutral')); } };
  }, { sfx: [[0, 'reflective_pad', -8], ['L137:but', 'warm_swell', -8]] });

  S('L138', 'voidGold', (c) => {
    const k = c.actor('kid').place(0, 0, 0); k.expr('content');
    c.cam.path([[0, [0, 1.6, 4.8], [0, 1.4, 0], 36], [c.T, [0, 1.6, 4.2], [0, 1.4, 0], 34]], E.sine);
    c.ov.panel([{ text: 'More money', mark: 'check', at: 0.2 }], 0, c.at('L138:but'), { x: 60, y: 60 });
    c.ov.pill('Things money can’t buy', c.at('L138:things') - 0.1, c.T, { y: 110, color: '#ffd36b' });
  }, { sfx: [[0.2, 'coins', -12], ['L138:things', 'gold_shimmer', -8]] });

  S('L138:a', 'apartment:dawn', (c) => {
    const sw = c.prop('sandwich'); sw.obj.position.set(-0.1, 0.99, 0.35); sw.obj.scale.setScalar(1.6);
    const pl = c.prop('plate'); pl.obj.position.set(-0.1, 0.97, 0.35);
    c.cam.path([[0, [-0.1, 1.55, 1.2], [-0.1, 1.0, 0.35], 32], [c.T, [-0.1, 1.45, 0.95], [-0.1, 1.0, 0.35], 30]], E.sine);
    return (t) => { const s = clamp((t - 0.2) / 0.5); sw.halves[0].position.x = 0.02 + s * 0.05; sw.halves[1].position.x = -0.02 - s * 0.05; };
  }, { sfx: [[0.2, 'knife_cut', -8]] });

  S('L138:a#2', 'apartment:night', (c) => {
    const D = DINNER(c); [D.k, D.d, D.b, D.m, D.th].forEach(a => a.expr('laugh'));
    c.cam.path([[0, [0, 2.6, 3.6], [0, 1.0, 0], 42], [c.T, [0.2, 2.4, 3.2], [0, 1.0, 0], 40]], E.sine);
    return (t) => { [D.k, D.d, D.b, D.m, D.th].forEach((a, i) => a.state.bounce = Math.abs(Math.sin(t * 8 + i)) * 0.03); };
  }, { sfx: [[0, 'family_laugh', -12]] });

  S('L138:and', 'mansion', (c) => {
    const car = c.prop('bowCar'); car.obj.position.set(-0.2, 0, 7.5); car.obj.rotation.y = 0.6;
    const th = c.actor('theo').place(-2.6, 8.4, 0.9); th.expr('content'); th.pose('holdFront');
    const cm = c.prop('comic'); c.hold(th, cm, 1); cm.obj.rotation.set(-0.6, Math.PI, 0); cm.hinge.rotation.y = -2.6;
    c.cam.path([[0, [3.4, 1.6, 12.8], [-1.2, 1.3, 7.8], 38], [c.T, [3.0, 1.55, 12.2], [-1.2, 1.3, 7.8], 36]], E.sine);
    c.ov.tint(0, c.T, '#1a0b4a', 0.25);
    c.ov.custom(c.at('L138:car') - 0.3, c.T, (g, lt, it) => { const a = clamp((lt - it.t0) / 0.3); g.globalAlpha = a; g.font = '800 70px "Baloo 2"'; g.textAlign = 'center'; g.lineWidth = 12; g.strokeStyle = '#1b0b3f'; g.fillStyle = '#ffd36b'; g.strokeText('COMIC  >  CAR', 960, 220); g.fillText('COMIC  >  CAR', 960, 220); });
    return (t) => { th.state.look = [0, 0.4]; };
  }, { sfx: [['L138:car', 'sweet_chime', -6]] });

  S('L139', 'bedroom', (c) => {
    const k = c.actor('kidPJ'); seat(k, 1.6, -1.05, Math.PI, 0.55, 'sitIdle'); k.expr('determined');
    const env = c.prop('envelope'); env.obj.position.set(1.6, 0.9, -1.75); env.obj.rotation.set(-Math.PI / 2, 0, 0);
    c.cam.path([[0, [0.3, 1.55, -1.2], [1.6, 1.1, -1.55], 38], [c.T, [0.45, 1.5, -1.3], [1.6, 1.08, -1.6], 34]], E.sine);
    c.ov.pop('STAYING', c.at('L139:you\'re') - 0.05, c.T, { y: 220, size: 140, colors: ['#9dffb0', '#2ecc71'] });
    return (t) => { k.pose('sitIdle', 'type', 0.8); k.state.armFn = (i) => i === 1 && t < c.at('L139:you\'re') ? [0, Math.sin(t * 14) * 0.1, 0] : null; if (t > c.at('L139:you\'re')) k.expr('joy'); };
  }, { sfx: [[0.3, 'pen_sign', -4], ['L139:you\'re', 'triumph_sting', -4]] });

  // ---------- L140-146: next September ----------
  S('L140', 'street:fall', (c) => {
    const k = c.actor('kid').place(0.6, -4.6, Math.PI * 0.95); k.expr('content'); k.pose('holdOne');
    const bag = c.prop('paperBag'); c.hold(k, bag, 1); bag.obj.position.set(0, -0.1, 0.05);
    c.cam.path([[0, [0.6, 2.0, 2.5], [0.4, 1.4, -5], 42], [c.T, [0.6, 1.8, 1.4], [0.5, 1.4, -5], 40]], E.sine);
    c.ov.corner('Next September', 0, c.T);
    c.ov.tag(() => k.backpack.localToWorld(new THREE.Vector3(0.04, 0.06, -0.1)), 'Same safety pin', c.at('L140:same') - 0.1, c.at('L140:same#2'), { dx: -320, dy: -60 });
    c.ov.tag(() => bag.obj.localToWorld(new THREE.Vector3(0, 0.2, 0)), 'Same paper bag', c.at('L140:same#2') - 0.1, c.T, { dx: 240, dy: -80 });
    return (t) => { k.root.rotation.y = Math.PI * 0.95; };
  }, { sfx: [[0, 'amb_autumn', -12], [0, 'leaves_rustle', -14], [0, 'new_day_pad', -8]] });

  S('L141', 'street:fall', (c) => {
    const k = c.actor('kid').place(0.6, -4.6, Math.PI * 0.95); k.expr('neutral'); k.pose('holdOne');
    const bag = c.prop('paperBag'); c.hold(k, bag, 1);
    const th = c.actor('theo'); th.expr('happy');
    const bag2 = c.prop('paperBag', 1); c.hold(th, bag2, 1);
    c.cam.path([[0, [2.6, 1.7, -1.4], [0.6, 1.5, -4.6], 38], [c.at('L141:it\'s') - 0.1, [2.4, 1.7, -1.6], [1.2, 1.5, -4.8], 36], [c.T, [2.0, 1.7, -2.2], [1.6, 1.5, -5.0], 34]], E.io);
    const tTurn = c.at('L141:you#2');
    return (t) => { walk(th, t, 0, tTurn, [6, -5.5], [2.4, -5.2], { rate: 7 }); if (t > tTurn) th.face(0.6, -4.6);
      k.root.rotation.y = Math.PI * 0.95 + E.io(clamp((t - tTurn) / 0.6)) * (-Math.PI * 0.95 + Math.atan2(2.4 - 0.6, -5.2 + 4.6)); if (t > c.at('L141:it\'s')) k.expr('surprised'); if (t > c.at('L141:holding')) { th.pose('holdUp'); k.expr('joy'); } };
  }, { sfx: [[0, 'footsteps_shoe', -6], ['L141:it\'s', 'reveal_sting', -6]] });

  S('L142', 'street:fall', (c) => {
    const th = c.actor('theo').place(2.4, -5.2, -1.2); th.expr('happy'); th.pose('holdOne');
    const bag2 = c.prop('paperBag', 1); c.hold(th, bag2, 1);
    const limo = c.prop('limo'); limo.obj.rotation.y = Math.PI / 2;
    c.cam.path([[0, [0.9, 1.65, -3.6], [2.4, 1.6, -5.2], 32], [c.T, [1.0, 1.65, -3.8], [2.4, 1.6, -5.2], 30]], E.sine);
    c.ov.bubble(th, 'I told my driver I’d take the bus today.', 0, c.T, { side: 1 });
    return (t) => { talk(th, t, [[0, c.T - 0.1]]); limo.obj.position.set(4 + t * 9, 0, -0.6); limo.wheels.forEach(w => w.rotation.x = t * 20); };
  }, { sfx: [[0, 'limo_leave', -10]] });

  S('L143', 'street:fall', (c) => {
    const k = c.actor('kid').place(0.6, -4.6, 1.2); k.expr('grin');
    c.cam.at([1.8, 1.65, -4.0], [0.6, 1.6, -4.6], 30);
    c.ov.bubble(k, 'You know it’s TWO buses, right?', c.at('L143:you#2') - 0.1, c.T, { side: -1 });
    return (t) => { talk(k, t, [[c.at('L143:you#2'), c.T - 0.1]]); };
  });

  S('L144', 'street:fall', (c) => {
    const th = c.actor('theo').place(2.4, -5.2, -1.2); th.expr('grin'); th.pose('holdUp');
    const bag2 = c.prop('paperBag', 1); c.hold(th, bag2, 1);
    c.cam.path([[0, [0.9, 1.65, -3.6], [2.4, 1.7, -5.2], 32], [c.T, [1.0, 1.65, -3.8], [2.4, 1.7, -5.2], 30]], E.sine);
    c.ov.bubble(th, 'Yeah. I’ve been practicing.', 0, c.at('L144:he'), { side: 1 });
    c.ov.bubble(th, 'Your mom taught me how to make the sandwich.', c.at('L144:your') - 0.1, c.T, { side: 1 });
    return (t) => { talk(th, t, [[0, c.at('L144:he') - 0.2], [c.at('L144:your'), c.T - 0.1]]); };
  }, { sfx: [['L144:he', 'paper_bag', -8]] });

  S('L145', 'void', (c) => {
    const sw = c.prop('sandwich'); sw.obj.position.set(0, 1.4, 0); sw.obj.scale.setScalar(4);
    const bag = c.prop('paperBag'); bag.obj.position.set(-0.9, 0.5, -0.4); bag.obj.scale.setScalar(2.5);
    c.cam.path([[0, [0, 2.6, 1.8], [0, 1.4, 0], 36], [c.T, [0, 2.4, 1.5], [0, 1.4, 0], 34]], E.sine);
    c.ov.pop('CUT DIAGONAL', c.at('L145:it\'s') - 0.05, c.T, { y: 860, size: 100, colors: ['#fff27a', '#ffb23b'] });
    return (t) => { const s = E.back(clamp((t - c.at('L145:it\'s')) / 0.5)); sw.halves[0].position.x = 0.02 + s * 0.04; sw.halves[1].position.x = -0.02 - s * 0.04; sw.obj.rotation.y = t * 0.3; };
  }, { sfx: [[0, 'paper_bag', -6], ['L145:it\'s', 'sparkle', -4], ['L145:it\'s', 'warm_hit', -8]] });

  S('L146', 'street:fall', (c) => {
    const k = c.actor('kid'); k.expr('joy'); const th = c.actor('theo'); th.expr('joy');
    const bus = c.prop('bus'); bus.obj.rotation.y = Math.PI / 2;
    c.cam.path([[0, [-4, 1.8, 4], [1, 1.6, -3], 42], [c.T, [-6, 7, 10], [2, 2, -4], 46]], E.io);
    const tb = 1.6;
    return (t) => { const x = kf(t, [[0, -22], [tb, 1.5, E.out], [tb + 2.4, 1.5], [c.T, 22, E.in]]); bus.obj.position.set(x, 0, -1.4); bus.wheels.forEach(w => w.rotation.x = x);
      if (t < tb + 1.6) { walk(k, t, tb + 0.4, tb + 1.6, [0.6, -4.6], [2.6, -3.0], { rate: 7 }); walk(th, t, tb + 0.4, tb + 1.6, [1.6, -5.0], [2.9, -3.0], { rate: 7 }); k.root.visible = true; th.root.visible = true; } else { k.root.visible = false; th.root.visible = false; k.shadow.visible = false; th.shadow.visible = false; } };
  }, { sfx: [[0, 'bus_arrive', -6], [1.7, 'bus_door', -8], [3.2, 'bus_leave', -6], [0, 'joy_theme', -6]] });

  // ---------- L147-154: outro ----------
  S('L147', 'void', (c) => {
    const k = c.actor('kid').place(0, 0, 0); k.expr('happy'); k.pose('holdOne');
    const bag = c.prop('paperBag'); c.hold(k, bag, 1);
    orbit(c, [0, 0, 0], 5.5, 2.0, -0.6, 0.6, 38, 1.3);
    c.ov.title('So... what if you really were', 'The only poor kid?', 0.2, c.T, { size: 90, blur: 4 });
  }, { sfx: [[0, 'outro_swell', -6]] });

  S('L148', 'void', (c) => {
    const g = c.prop('globe'); g.obj.position.set(0, -1.2, 0); g.obj.scale.setScalar(1.3); g.pin.visible = false;
    const k = c.actor('kid').place(0, 0, 0); k.root.position.y = 1.4; k.state.groundY = 1.4; k.state.noShadow = true; k.expr('worried');
    const ring = ['ex0', 'ex1', 'ex2', 'ex3'].map((n, i) => { const a = (i - 1.5) * 0.8; const r = c.actor(n); r.place(Math.sin(a) * 4.2, -Math.cos(a) * 4.2 + 1, -a); r.expr('smug'); return r; });
    c.cam.path([[0, [0, 3.2, 8.5], [0, 1.6, 0], 40], [c.T, [0, 2.8, 7.4], [0, 1.6, 0], 38]], E.sine);
    c.ov.pill('Another planet', 0.3, c.at('L148:people'), { y: 110 });
    return (t) => { g.earth.rotation.y = t * 0.2; if (t > c.at('L148:some')) ring.forEach(r => r.expr('laugh')); if (t > c.at('L148:and')) { k.expr('nervous'); } };
  }, { sfx: [[0, 'space_whoosh', -10], ['L148:some', 'kids_snicker', -12]] });

  S('L149', 'voidPink', (c) => {
    c.cam.at([0, 1.5, 6], [0, 1.4, 0], 36);
    c.ov.panel([{ text: 'Surprisingly fun', mark: 'check', at: 0.2 }, { text: 'Embarrassing', mark: 'x', at: c.at('L149:others') }, { text: 'Not that different', mark: 'dot', at: c.at('L149:and') }], 0, c.at('L149:rich'), { x: 620, y: 360, size: 40, w: 680 });
  }, { sfx: [[0.2, 'tick', -6], ['L149:others', 'tick', -6], ['L149:and', 'tick', -6]] });

  S('L149:rich', 'hallway', (c) => {
    const ppl = [['kid', -1.4], ['theo', 0], ['preston', 1.4]].map(([n, x]) => { const a = c.actor(n).place(x, 0, 0); a.expr('sleepy'); a.pose('sleep'); return a; });
    c.cam.at([0, 1.7, 4.6], [0, 1.5, 0], 38);
    c.ov.pill('Monday · 7:00 AM', 0.1, c.T, { y: 110 });
    ppl.forEach((a, i) => c.ov.icon(a, 'zzz', 0.3 + i * 0.2, c.T, { dx: 60 }));
    return (t) => { ppl.forEach((a, i) => { a.state.tilt = Math.sin(t * 1.5 + i) * 0.15; a.body.rotation.z = Math.sin(t * 1.2 + i) * 0.04; }); };
  }, { sfx: [[0, 'yawn', -6], [0.6, 'yawn', -10]] });

  S('L150', 'voidPink', (c) => {
    const k = c.actor('kidHome').place(0, 0, 0); k.expr('loving');
    const m = c.actor('mom').place(-0.9, -0.2, 0.3); m.expr('loving'); const d = c.actor('dad').place(0.95, -0.2, -0.3); d.expr('joy'); const b = c.actor('bro').place(0.2, 0.7, 0); b.expr('joy');
    c.cam.path([[0, [0, 1.9, 6.5], [0, 1.4, 0], 38], [c.T, [0, 1.8, 5.2], [0, 1.4, 0], 36]], E.sine);
    c.ov.icon(k, 'heart', c.at('L150:you') - 0.1, c.T);
    return (t) => { m.pose('hug'); d.pose('hug'); b.pose('cheer'); b.state.bounce = Math.abs(Math.sin(t * 6)) * 0.05; };
  }, { sfx: [[0, 'warm_theme', -6]] });

  S('L151', 'voidGold', (c) => {
    const h = c.prop('helicopter'); h.obj.scale.setScalar(0.5); h.obj.position.set(-4, 0, -1); h.spin = 1;
    const isl = new THREE.Group(); const sand = new THREE.Mesh(new THREE.SphereGeometry(1.2, 32, 16), new THREE.MeshStandardMaterial({ color: '#ffe0a3' })); sand.scale.y = 0.3; isl.add(sand); const palm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 1.4, 8), new THREE.MeshStandardMaterial({ color: '#a87a4a' })); palm.position.y = 0.8; isl.add(palm); const lf = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 8), new THREE.MeshStandardMaterial({ color: '#3dbb6a' })); lf.scale.y = 0.3; lf.position.y = 1.5; isl.add(lf);
    isl.position.set(0, 0.2, -1); c.scene.add(isl); c.onExit = () => c.scene.remove(isl);
    const gi = c.prop('giraffe'); gi.obj.position.set(4, 0, -1.4); gi.obj.scale.setScalar(0.55);
    c.cam.at([0, 2.4, 9], [0, 1.4, -1], 40);
    const t1 = c.at('L151:it'), t2 = c.at('L151:it#2');
    return (t) => { const s1 = E.back(clamp(t / 0.4)), s2 = E.back(clamp((t - t1) / 0.4)), s3 = E.back(clamp((t - t2 - 0.6) / 0.4)); h.obj.scale.setScalar(0.5 * Math.max(0.001, s1)); isl.scale.setScalar(Math.max(0.001, s2)); gi.obj.scale.setScalar(0.55 * Math.max(0.001, s3)); };
  }, { sfx: [[0, 'pop_big', -6], ['L151:it', 'pop_big', -6], ['L151:giraffe', 'pop_big', -6], [0, 'coins', -12]] });

  S('L152', 'apartment:night', (c) => {
    const D = DINNER(c); [D.k, D.d, D.b, D.m, D.th].forEach(a => a.expr('laugh'));
    c.cam.path([[0, [0, 2.4, 3.2], [0, 1.0, 0], 40], [c.T, [0.3, 2.2, 2.8], [0, 1.0, 0], 38]], E.sine);
    c.ov.custom(0, c.T, (g, lt) => { const a = clamp(lt / 0.6) * 0.35; const gr = g.createRadialGradient(960, 540, 100, 960, 540, 900); gr.addColorStop(0, `rgba(255,200,120,${a})`); gr.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = gr; g.fillRect(0, 0, 1920, 1080); }, -1);
    return (t) => { [D.k, D.d, D.b, D.m, D.th].forEach((a, i) => a.state.bounce = Math.abs(Math.sin(t * 8 + i)) * 0.03); };
  }, { sfx: [[0, 'family_laugh', -14]] });

  S('L152:and', 'street:fall', (c) => {
    const k = c.actor('kid').place(0.6, -4.6, 1.2); k.expr('joy'); const th = c.actor('theo').place(1.8, -4.8, -1.2); th.expr('joy');
    c.cam.path([[0, [1.2, 1.7, -1.2], [1.2, 1.5, -4.7], 36], [c.T, [1.2, 1.8, -0.6], [1.2, 1.5, -4.7], 36]], E.sine);
    return (t) => { k.pose('idle', 'hug', 0.4); th.pose('idle', 'hug', 0.4); };
  }, { sfx: [[0, 'friend_chime', -10]] });

  S('L153', 'void', (c) => {
    const k = c.actor('kid'); k.expr('determined'); k.pose('holdOne');
    const bag = c.prop('paperBag'); c.hold(k, bag, 1);
    const crowd = ['ex0', 'ex1', 'ex2', 'ex3', 'ex4'].map((n, i) => c.actor(n).place(-4 + i * 2, -4, 0));
    c.cam.path([[0, [0, 1.6, 6.0], [0, 1.5, 0], 38], [c.T, [0, 1.6, 4.6], [0, 1.5, 0], 36]], E.sine);
    c.ov.choice({ title: 'Pretend', sub: 'to be one of them', icon: '\u{1F3AD}', c1: '#5a3a9a', c2: '#2a1a6a' }, { title: 'Be you', sub: 'paper bag & all', icon: '\u{1F6CD}️', c1: '#ffb23b', c2: '#ff7a3d' }, c.at('L153:would') - 0.2, c.T, {});
    c.ov.dim(c.at('L153:would') - 0.2, c.T, 0.35);
    return (t) => { walk(k, t, 0, c.T, [0, -2.5], [0, 0.6], { rate: 6.5 }); crowd.forEach(a => { a.expr('smug'); a.pose('cross'); }); };
  }, { sfx: [[0, 'build_drums', -10], ['L153:would', 'card_whoosh', -6], ['L153:exactly', 'warm_hit', -6]] });

  S('L154', 'void', (c) => {
    const k = c.actor('kid').place(-0.9, 0, 0.15); k.expr('joy'); const th = c.actor('theo').place(0.9, 0, -0.15); th.expr('joy');
    c.cam.path([[0, [0, 1.6, 6.0], [0, 1.4, 0], 38], [c.T, [0, 1.6, 5.4], [0, 1.4, 0], 36]], E.sine);
    c.ov.custom(0.2, c.T, (g, lt, it) => { const s = E.back(clamp((lt - it.t0) / 0.4)); g.save(); g.translate(400, 780); g.scale(s, s); g.fillStyle = '#ffffff'; g.beginPath(); g.roundRect(-250, -70, 500, 140, 70); g.fill(); g.font = '60px "Noto Color Emoji"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('\u{1F4AC}', -170, 2); g.fillStyle = '#1b0b3f'; g.font = '800 48px "Baloo 2"'; g.fillText('COMMENT', 40, 6); g.restore(); });
    c.ov.custom(c.at('L154:subscribe') - 0.1, c.T, (g, lt, it) => { const s = E.back(clamp((lt - it.t0) / 0.4)); g.save(); g.translate(1500, 780); g.scale(s, s); g.fillStyle = '#ff2d55'; g.beginPath(); g.roundRect(-270, -70, 540, 140, 70); g.fill(); g.fillStyle = '#fff'; g.font = '800 52px "Baloo 2"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('SUBSCRIBE', 0, 6); g.restore(); });
    return (t) => { k.pose('wave'); th.pose('wave'); [k, th].forEach((a, i) => { a.state.armFn = (j) => j === 1 ? [Math.sin(t * 8 + i) * 0.3, 0, 0] : null; a.state.bounce = Math.abs(Math.sin(t * 5 + i)) * 0.04; }); };
  }, { sfx: [[0.2, 'pop', -6], ['L154:subscribe', 'pop_big', -4], ['L154:subscribe', 'bell_ding', -6], [0, 'outro_theme', -6]] });

  // ---------- end card ----------
  S('L154e+0.4', 'voidPink', (c) => {
    const k = c.actor('kid').place(-1.2, 0, 0.2); k.expr('joy'); const th = c.actor('theo').place(0, 0, 0); th.expr('happy'); const p = c.actor('preston').place(1.2, 0, -0.2); p.expr('grin');
    c.cam.path([[0, [0, 1.8, 7.0], [0, 1.4, 0], 38], [c.T, [0, 1.8, 6.2], [0, 1.4, 0], 36]], E.sine);
    c.ov.title('Thanks for watching', 'See you next time', 0.2, c.T - 0.6, { size: 80, blur: 3, y: 230 });
    c.ov.fadeOut(c.T - 0.7, 0.7);
    return (t) => { [k, th, p].forEach((a, i) => { a.pose('wave'); a.state.armFn = (j) => j === 1 ? [Math.sin(t * 7 + i) * 0.3, 0, 0] : null; }); };
  }, { sfx: [[0, 'end_sting', -6]] });
}

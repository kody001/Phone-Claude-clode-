// Shots: cafeteria, gym/horse, blending in, group chat, exposed (lines 35-80)
import { E, tw, kf, clamp, lerp, pulse, within, walk, seat, talk, lookAtPt, drift, orbit, extras, seq, THREE } from './shotkit.js';

// cafeteria seating helper: table index 0..3, side +1/-1, seat i 0..5
const TBL = [[-6, 2], [6, 2], [-6, -3.5], [6, -3.5]];
export const cseat = (tb, side, i) => { const [X, Z] = TBL[tb]; return [X - 3 + 1.2 * i, Z + side * 1.15, side > 0 ? Math.PI : 0]; };
const sitAt = (c, name, tb, side, i, pose = 'sitIdle') => { const [x, z, r] = cseat(tb, side, i); return seat(c.actor(name), x, z, r, 0.56, pose); };
const LUNCH = (c) => {
  const k = sitAt(c, 'kid', 0, 1, 3);
  const others = [['ex20', 0, 1, 2], ['ex21', 0, 1, 4], ['ex22', 0, -1, 3], ['ex23', 0, -1, 2], ['ex24', 0, -1, 4], ['ex25', 0, 1, 1], ['ex26', 1, 1, 2], ['ex27', 1, -1, 3], ['ex28', 1, 1, 4], ['ex29', 2, 1, 2], ['ex30', 2, -1, 3], ['ex31', 1, -1, 1]];
  const R = {}; for (const [n, tb, sd, i] of others) R[n] = sitAt(c, n, tb, sd, i);
  return { k, R };
};

export default function (S) {
  // ---------- L35: lunch bell ----------
  S('L35', 'hallway', (c) => {
    const k = c.actor('kid'); k.expr('neutral');
    const ex = ['ex40', 'ex41', 'ex42', 'ex43'].map((n, i) => c.actor(n));
    c.cam.fn = (t) => { const z = k.root.position.z; return { p: [1.2, 1.8, z - 3.6], l: [0, 1.5, z + 2], fov: 44 }; };
    c.ov.corner('12:00 PM · Lunch', 0, c.T);
    return (t) => { walk(k, t, 0, c.T, [0, 4], [0, -1], { rate: 8 }); k.root.rotation.y = Math.PI; ex.forEach((a, i) => walk(a, t, 0, c.T, [(i % 2 ? 2 : -2), 6 + i * 1.5], [(i % 2 ? 2 : -2), 0 + i * 1.5], { rate: 8 })); };
  }, { sfx: [[0, 'school_bell', -6], [0.2, 'hallway_walla', -14], [0.1, 'footsteps_shoe', -12]] });

  // ---------- L36: the five-star cafeteria ----------
  S('L36', 'cafeteria', (c) => {
    const k = c.actor('kid').place(0, 9.5, Math.PI); k.expr('awe');
    const { R } = LUNCH(c); c.actor('kid').place(0, 9.5, Math.PI); k.pose('idle'); k.state.seatH = 0.5;
    c.cam.path([[0, [0, 1.7, 10.8], [0, 1.9, 4], 44], [c.T, [0, 5.5, 10.4], [0, 2.8, -4], 56]], E.io);
    c.ov.pill('★★★★★', 1.2, c.T, { y: 110, size: 34, color: '#ffd36b' });
    return (t) => { k.state.look = [Math.sin(t * 0.8) * 0.5, -0.15]; };
  }, { sfx: [[0, 'cafeteria_walla', -10], [0, 'choir_aah', -8], [0.1, 'shimmer', -8]] });

  S('L36:sushi', 'cafeteria', (c) => {
    const chef = c.actor('chef').place(-11.8, -8.4, 0.5); chef.expr('happy');
    c.cam.path([[0, [-9.2, 2.0, -3.6], [-11.5, 1.6, -7.5], 38], [c.T, [-9.6, 1.9, -4.2], [-11.5, 1.5, -7.5], 36]], E.sine);
    c.ov.pill('Sushi chef', 0.1, c.T, { y: 110 });
    return (t) => { chef.pose('holdFront'); chef.state.armFn = (i) => [0, 0, Math.sin(t * 16 + i) * 0.2]; };
  }, { sfx: [[0, 'knife_chop', -8]] });

  S('L36:pasta', 'cafeteria', (c) => {
    c.cam.path([[0, [9.2, 2.0, -3.6], [11.5, 1.6, -7.5], 38], [c.T, [9.6, 1.9, -4.2], [11.5, 1.5, -7.5], 36]], E.sine);
    c.ov.pill('Pasta station', 0.1, c.T, { y: 110 });
  }, { sfx: [[0, 'boiling', -10]] });

  S('L36:and', 'cafeteria', (c) => {
    const k = c.actor('kid').place(2.6, -6.6, -0.6); k.expr('awe');
    c.cam.path([[0, [5.5, 1.4, -0.5], [0.8, 2.6, -8.2], 44], [c.T, [6.0, 1.2, 0.5], [0.8, 3.0, -8.2], 44]], E.sine);
    c.ov.tag(new THREE.Vector3(0, 5.0, -8.2), 'Taller than you', c.at('L36:taller'), c.T, { dx: -330, dy: -40 });
    return (t) => { k.state.look = [0.6, -0.4]; };
  }, { sfx: [[0, 'choc_flow', -6]] });

  // ---------- L37-38: everything is free ----------
  S('L37', 'cafeteria', (c) => {
    const k = c.actor('kid').place(-8, -5.6, Math.PI * 0.8); k.expr('confused');
    c.cam.path([[0, [-6.5, 1.8, -2.5], [-10, 1.5, -7.5], 38], [c.T, [-6.8, 1.7, -3.0], [-10, 1.5, -7.5], 34]], E.sine);
    c.ov.big('$0.00', 'Price', c.at('L37:free') - 0.15, c.T, { y: 300, size: 140, w: 520, h: 280 });
    return (t) => { if (t > c.at('L37:free')) k.expr('shocked'); };
  }, { sfx: [['L37:free', 'register_ding', -4]] });

  S('L38', 'cafeteria', (c) => {
    const k = c.actor('kid').place(0, 5, Math.PI); k.expr('awe');
    c.cam.path([[0, [0, 1.6, 2.4], [0, 1.6, 5], 36], [c.T, [0, 1.55, 2.0], [0, 1.6, 5], 32]], E.out);
    c.ov.pop('FREE!!', 0, c.T + 0.3, { y: 300, size: 220, colors: ['#fff27a', '#ffb23b'], shake: 8 });
    c.ov.flash(0, 0.25, '#fff7c2', 0.6);
    return (t) => { k.pose('idle', 'armsUp', E.back(clamp(t / 0.25))); k.state.bounce = Math.abs(Math.sin(t * 10)) * 0.08; };
  }, { sfx: [[0, 'airhorn_cute', -8], [0, 'choir_hit', -6], [0, 'confetti', -6]] });

  S('L39', 'cafeteria', (c) => {
    const k = c.actor('kid').place(0, 5, Math.PI); k.expr('teary');
    c.cam.path([[0, [0, 1.62, 2.6], [0, 1.62, 5], 30], [c.T, [0, 1.62, 3.0], [0, 1.62, 5], 26]], E.sine);
    c.ov.icon(k, 'sparkle', 0.4, c.T, { dx: 140, dy: 60 });
    return (t) => { k.state.tilt = Math.sin(t * 1.2) * 0.05; k.pose('cheeks', null); };
  }, { sfx: [[0, 'emotional_swell', -8]] });

  // ---------- L40-45: the sandwich ----------
  S('L40', 'cafeteria', (c) => {
    const k = c.actor('kid').place(-4.6, 6.0, Math.PI); k.expr('content');
    const bag = c.prop('paperBag'); c.hold(k, bag, 1); bag.obj.position.set(0, -0.1, 0.05);
    LUNCH(c); const kk = c.actor('kid');
    c.cam.path([[0, [-3.0, 1.9, 7.6], [-5, 1.3, 3.2], 40], [c.T, [-3.4, 1.8, 6.6], [-5.3, 1.2, 3.2], 38]], E.sine);
    const tSit = c.at('L40:so') - 0.8;
    return (t) => {
      if (t < tSit) { kk.place(-4.6, 6.0, Math.PI); kk.pose('holdOne'); kk.state.look = [0, 0.35]; kk.expr(t > c.at('L40:your') ? 'loving' : 'content'); walk(kk, t, 0.2, tSit, [-4.6, 6.0], [-5.4, 3.9], { rate: 7 }); }
      else { seat(kk, -5.4, 3.15, Math.PI, 0.56, 'sitIdle'); kk.pose('sitIdle', 'holdFront', clamp((t - c.at('L40:open')) / 0.4)); kk.expr('content'); }
      bag.obj.visible = true; if (t >= tSit && bag.obj.parent !== c.scene) { c.scene.add(bag.obj); bag.obj.position.set(-5.4, 0.98, 2.55); bag.obj.rotation.set(0, 0, 0); }
    };
  }, { sfx: [['L40:so', 'chair_scrape', -8], ['L40:open', 'paper_bag', -4]] });

  S('L41', 'cafeteria', (c) => {
    const { k, R } = LUNCH(c); k.expr('content');
    const sw = c.prop('sandwich'); sw.obj.position.set(-5.4, 1.02, 2.5); sw.obj.scale.setScalar(1.4);
    const near = ['ex20', 'ex21', 'ex22', 'ex23', 'ex24', 'ex25'];
    c.cam.path([[0, [-1.6, 2.1, 2.0], [-5.4, 1.3, 2.0], 42], [c.T, [-1.9, 2.0, 2.0], [-5.4, 1.3, 2.0], 40]], E.sine);
    return (t) => { near.forEach((n, i) => { const a = R[n]; const k1 = E.back(clamp((t - 0.1 - i * 0.12) / 0.3)); const p = a.root.position; const want = Math.atan2(-5.4 - p.x, 2.5 - p.z) - a.root.rotation.y; a.state.look = [want * k1, 0.25 * k1]; a.expr(k1 > 0.5 ? 'shocked' : 'neutral'); }); };
  }, { sfx: [[0.1, 'whoosh_multi', -8], [0.3, 'crowd_gasp', -6]] });

  S('L42', 'cafeteria', (c) => {
    const { R } = LUNCH(c); const g = R.ex22; g.expr('shocked');
    c.cam.path([[0, [-5.2, 1.55, 2.6], [-5.4, 1.38, 0.85], 32], [c.T, [-5.25, 1.55, 2.4], [-5.4, 1.38, 0.85], 30]], E.sine);
    c.ov.bubble(g, 'Is that... a SANDWICH?', 0.0, c.T, { side: 1 });
    return (t) => { g.pose('sitIdle', 'mouthCover', 0.9); talk(g, t, [[0, c.T - 0.2]]); };
  }, { sfx: [[0, 'gasp_single', -6]] });

  S('L43', 'cafeteria', (c) => {
    const { R } = LUNCH(c); const b = R.ex21; b.expr('confused');
    c.cam.path([[0, [-2.9, 1.6, 1.7], [-4.2, 1.4, 3.15], 32], [c.T, [-3.0, 1.6, 1.85], [-4.2, 1.4, 3.15], 30]], E.sine);
    c.ov.bubble(b, 'Did someone make that? Like... with their HANDS?', 0, c.T, { side: -1, w: 560 });
    return (t) => { b.root.rotation.y = Math.PI - 0.7; talk(b, t, [[0, c.T - 0.2]]); b.pose('sitIdle', 'shrug', 0.6); };
  });

  S('L44', 'cafeteria', (c) => {
    const { R } = LUNCH(c); const b = R.ex23; b.pose('sitIdle', 'holdUp', 1); b.expr('happy');
    const ph = c.prop('phone'); c.hold(b, ph, 1); ph.obj.rotation.x = -0.3;
    c.cam.path([[0, [-7.9, 1.9, 2.5], [-6.5, 1.4, 0.85], 36], [c.T, [-7.8, 1.85, 2.3], [-6.5, 1.4, 0.85], 34]], E.sine);
    c.ov.phone((g, t, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#ff8a5c'); gr.addColorStop(1, '#ff5d8f'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.save(); g.translate(w / 2, h * 0.45); g.rotate(-0.2); g.fillStyle = '#f3d29a'; g.beginPath(); g.moveTo(-140, 100); g.lineTo(140, 100); g.lineTo(-140, -160); g.closePath(); g.fill(); g.fillStyle = '#b0204a'; g.fillRect(-140, 60, 280, 20); g.fillStyle = '#a8642e'; g.fillRect(-140, 80, 280, 14); g.restore();
      g.fillStyle = '#fff'; g.font = '800 34px Inter'; g.textAlign = 'center'; g.fillText('a hand-made sandwich?!', w / 2, h * 0.75); g.font = '64px "Noto Color Emoji"'; g.fillText('\u{1F96A}\u{1F92F}', w / 2, h * 0.84);
      for (let i = 0; i < 6; i++) { g.fillStyle = i < 3 ? '#fff' : 'rgba(255,255,255,0.4)'; g.fillRect(20 + i * 72, 20, 64, 5); }
      g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.arc(50, 70, 22, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = '600 20px Inter'; g.textAlign = 'left'; g.fillText('my story', 82, 77); }, c.at('L44:for') - 0.3, c.T, { x: 1380, scale: 0.72, dim: 0.2 });
    c.ov.flash(c.at('L44:picture'), 0.25);
  }, { sfx: [['L44:picture', 'camera_shutter', -4], ['L44:for', 'phone_slide', -10]] });

  S('L45', 'cafeteria', (c) => {
    const { k, R } = LUNCH(c); k.pose('eat'); k.expr('chew');
    const sw = c.prop('sandwich'); c.hold(k, sw, 1); sw.obj.scale.setScalar(1.2); sw.obj.rotation.set(1.2, 0, 0);
    ['ex20', 'ex21', 'ex22', 'ex23', 'ex24', 'ex25'].forEach(n => { R[n].expr('awe'); R[n].state.look = [n === 'ex20' ? 0.9 : n === 'ex21' ? -0.9 : 0, 0.15]; });
    c.cam.path([[0, [-4.7, 3.1, -0.4], [-5.4, 1.3, 3.1], 40], [c.T, [-4.9, 3.0, -0.1], [-5.4, 1.3, 3.1], 36]], E.lin);
    c.ov.letterbox(0, c.T, 120);
    c.ov.custom(c.at('L45:while') - 0.2, c.T, (g, lt, it) => { const a = clamp((lt - it.t0) / 0.5); g.globalAlpha = a; g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(90, 760, 760, 120); g.fillStyle = '#ffd36b'; g.fillRect(90, 760, 10, 120); g.fillStyle = '#fff'; g.font = '44px "DM Serif Display"'; g.fillText('The Common Sandwich-Eater', 125, 815); g.font = 'italic 28px "DM Serif Display"'; g.fillStyle = '#ddd'; g.fillText('observed in its natural habitat', 125, 858); });
    return (t) => { k.state.chew = true; R.ex24.state.look = [0.3, 0.1]; };
  }, { sfx: [[0, 'chewing', -8], ['L45:while', 'nature_doc', -10]] });

  // ---------- L46-48: Theo ----------
  S('L46', 'cafeteria', (c) => {
    LUNCH(c); const th = c.actor('theo'); seat(th, 9, -4.65, 0.0, 0.56, 'sitIdle'); th.expr('quiet');
    c.cam.path([[0, [-4.5, 1.9, 4.6], [2, 1.4, -3], 44], [c.at('L46:a') + 0.4, [1.0, 2.0, -0.7], [9, 1.3, -4.65], 40], [c.T, [7.4, 1.6, -0.9], [9, 1.33, -4.65], 34]], E.io);
    c.ov.tag(() => th.arms[0].el.localToWorld(new THREE.Vector3(0, -0.17, 0)), 'Expensive watch', c.at('L46:expensive'), c.T, { dx: 260, dy: -160 });
    c.ov.tag(() => th.headTop(new THREE.Vector3()), 'Perfect haircut', c.at('L46:perfect'), c.T, { dx: -330, dy: -40 });
    c.ov.pill('Nobody next to him', c.at('L46:nobody'), c.T, { y: 110 });
    return (t) => { th.pose('sitIdle', 'holdFront', 0.4); };
  }, { sfx: [[0, 'music_soft_turn', -10], ['L46:expensive', 'ding_soft', -10], ['L46:perfect', 'ding_soft', -10]] });

  S('L47', 'cafeteria', (c) => {
    const th = c.actor('theo'); seat(th, 9, -4.65, 0.0, 0.56, 'sitIdle'); th.expr('quiet');
    c.cam.path([[0, [8.6, 1.5, -2.3], [9, 1.38, -4.65], 32], [c.T, [8.65, 1.5, -2.7], [9, 1.38, -4.65], 30]], E.sine);
    c.ov.pill('Theo', 0.1, c.T, { at3d: () => th.headTop(new THREE.Vector3()).add(new THREE.Vector3(0, 0.15, 0)), size: 30 });
    c.ov.big('50%', 'of the internet', c.at('L47:basically') - 0.1, c.T, { x: 520, y: 520, size: 130, w: 620, h: 300 });
  }, { sfx: [['L47:basically', 'whoosh_digital', -8]] });

  S('L48', 'cafeteria', (c) => {
    const { k } = LUNCH(c); const th = c.actor('theo'); seat(th, 9, -4.65, 0.0, 0.56, 'sitIdle'); th.expr('quiet');
    const sw = c.prop('sandwich'); sw.obj.position.set(-5.4, 1.02, 2.5); sw.obj.scale.setScalar(1.4);
    c.cam.path([[0, [8.2, 1.5, -2.5], [9, 1.38, -4.65], 30], [c.T, [8.3, 1.5, -2.9], [9, 1.38, -4.65], 27]], E.sine);
    return (t) => { lookAtPt(th, -5.4, 2.5); };
  }, { sfx: [[0.5, 'curious_pluck', -8]] });

  // ---------- L49-55: horseback riding ----------
  S('L49', 'stables', (c) => {
    const k = c.actor('kid').place(-3, 4, 0.3); k.expr('nervous');
    const h = c.prop('horse'); h.obj.position.set(1.5, 0, 1); h.obj.rotation.y = -1.2;
    c.cam.path([[0, [-8, 3, 14], [0, 1.5, 0], 44], [c.T, [-5, 2.4, 11], [0, 1.6, 1], 42]], E.sine);
    c.ov.corner('3rd period · Gym', 0, c.T);
  }, { sfx: [[0, 'amb_countryside', -12], [0.5, 'horse_snort', -8]] });

  S('L49:at', 'void', (c) => {
    const k = c.actor('kidHome').place(0, 0, 0); k.expr('scared');
    const balls = []; for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 16), new THREE.MeshStandardMaterial({ color: '#ff5d6c', roughness: 0.5 })); c.scene.add(b); balls.push(b); }
    c.onExit = () => balls.forEach(b => c.scene.remove(b));
    c.cam.at([0, 1.6, 5.2], [0, 1.3, 0], 38);
    c.ov.pill('Old school: dodgeball', 0.1, c.T, { y: 110 });
    return (t) => { balls.forEach((b, i) => { const ph = ((t * 1.2 + i * 0.37) % 1); b.position.set(-6 + ph * 12, 1.0 + Math.sin(ph * Math.PI) * 1.2 + i * 0.2, -0.4 + (i % 2) * 0.8); }); k.state.yOff = Math.abs(Math.sin(t * 6)) * 0.15; k.pose('handsHead'); };
  }, { sfx: [[0, 'dodgeball', -8], [0.4, 'dodgeball', -10], [0.8, 'dodgeball', -10]] });

  S('L49:at#2', 'stables', (c) => {
    const h = c.prop('horse'); h.obj.position.set(0, 0, 0); h.obj.rotation.y = 0.5;
    c.cam.path([[0, [3, 1.4, 7], [0, 2.0, 0], 40], [c.T, [2.2, 1.0, 5.2], [0, 2.4, 0], 38]], E.out);
    c.ov.pop('HORSEBACK', c.at('L49:horseback'), c.T, { y: 230, size: 130, colors: ['#ffd36b', '#ff8a3d'] });
  }, { sfx: [['L49:horseback', 'horse_neigh', -4], ['L49:horseback', 'brass_sting', -8]] });

  S('L50', 'stables', (c) => {
    const k = c.actor('kid').place(0.0, 1.6, Math.PI); k.expr('scared');
    const h = c.prop('horse'); h.obj.position.set(0, 0, -1.3); h.neckX = 0.35; h.headX = 0.3;
    c.cam.path([[0, [3.2, 1.8, 0.5], [0, 1.65, 0.3], 40], [c.T, [2.9, 1.8, 0.45], [0, 1.65, 0.3], 36]], E.sine);
    c.ov.icon(k, 'sweat', 0.5, c.T, { dx: 120 });
    return (t) => { k.state.tremble = 1; if (t > c.at('L50:and')) { h.headX = 0.3 + Math.sin(t * 2) * 0.05; } };
  }, { sfx: [[0, 'heartbeat_fast', -6], ['L50:and', 'horse_snort', -4]] });

  S('L51', 'stables', (c) => {
    const ins = c.actor('instructor').place(-2.2, 2.2, 0.6); ins.expr('happy');
    const k = c.actor('kid').place(0.2, 1.6, -0.4); k.expr('scared');
    const h = c.prop('horse'); h.obj.position.set(1.5, 0, -1.0); h.obj.rotation.y = -0.4;
    c.cam.path([[0, [-1.2, 1.9, 6.5], [-1, 1.8, 2], 38], [c.T, [-1.4, 1.9, 6.0], [-1, 1.8, 2], 36]], E.sine);
    c.ov.bubble(ins, 'Just show him who’s in charge.', c.at('L51:just') - 0.1, c.T, { side: -1 });
    return (t) => { talk(ins, t, [[c.at('L51:just'), c.T - 0.1]]); ins.pose('idle', 'hips', 0.8); k.state.tremble = 0.5; };
  });

  S('L52', 'stables', (c) => {
    const h = c.prop('horse'); h.obj.position.set(0, 0, 0); h.obj.rotation.y = Math.PI / 2;
    const k = c.actor('kid'); k.expr('scared');
    c.cam.path([[0, [0.5, 2.2, 7.5], [0, 1.9, 0], 38], [c.T, [0.3, 2.0, 7.0], [0, 1.6, 0], 38]], E.sine);
    const tStep = c.at('L52:the') + 0.2, tSlide = c.at('L52:slide') - 0.15;
    return (t) => {
      const hx = tw(t, tStep, tStep + 0.6, 0, 0.6); h.obj.position.x = hx; h.walk = within(t, tStep, tStep + 0.6) ? 1 : 0;
      if (t < tSlide) { k.place(-0.05 + hx, 0.0, Math.PI / 2 - Math.PI / 2, 0); k.root.position.set(hx - 0.05, 2.14 - 0.55, 0); k.root.rotation.y = 0; k.pose('ride'); k.state.seatH = 0.55; k.state.noShadow = true; k.state.tremble = 0.4; }
      else { const f = clamp((t - tSlide) / 0.55); k.root.position.set(hx + f * 0.2, kf(f, [[0, 1.59], [1, 0.1, E.in]]), f * 1.2); k.root.rotation.set(-f * 1.5, 0, 0); k.pose('flail'); k.expr('shocked'); k.state.noShadow = f < 1; k.state.seatH = 0.55; }
    };
  }, { sfx: [['L52:climb', 'cloth_rustle', -8], ['L52:the', 'hoof_step', -6], ['L52:slide', 'slide_whistle', -6], ['L52:side', 'thud', -2]] });

  S('L53', 'stables', (c) => {
    const k = c.actor('kid').place(0.8, 2.0, 0.3); k.expr('dizzy');
    const h = c.prop('horse'); h.obj.position.set(-1.0, 0, 0); h.obj.rotation.y = 0.7; h.neckX = 0.5; h.headX = 0.4; h.chew = 1;
    c.cam.path([[0, [2.6, 1.4, 5.2], [0.4, 0.8, 1.2], 40], [c.T, [2.4, 1.3, 4.6], [0.4, 0.8, 1.2], 38]], E.sine);
    c.ov.corner('20 minutes later', 0, 2.5);
    c.ov.counter((v) => 'FALLS: ' + Math.round(v), 0, 4, c.at('L53:you\'ve') - 0.2, c.at('L53:the'), { y: 200, x: 1450, size: 90, w: 520, h: 170, dur: 1.0 });
    c.ov.tag(() => k.arms[0].el.localToWorld(new THREE.Vector3(0, -0.2, 0)), 'Sleeve: partially eaten', c.at('L53:the') + 0.2, c.at('L53:and'), { dx: 200, dy: -200 });
    return (t) => { k.root.rotation.set(-1.45, 0, 0); k.root.position.y = 0.32; k.state.noShadow = true; k.pose('flail'); k.state.look = [0, 0]; };
  }, { sfx: [[0, 'cartoon_tweet', -8], ['L53:the', 'horse_chew', -6], ['L53:the', 'cloth_rip', -8]] });

  S('L53:and', 'stables', (c) => {
    const p = c.actor('preston').place(-4.5, 3.0, 2.3); p.expr('laugh');
    const ph = c.prop('phone'); c.hold(p, ph, 1); ph.obj.rotation.x = -0.2;
    const fr = ['ex50', 'ex51'].map((n, i) => c.actor(n).place(-5.6 + i * 2.2, 2.4 - i * 0.4, 2.0)); fr.forEach(a => a.expr('laugh'));
    c.cam.path([[0, [-1.9, 1.9, 0.2], [-4.5, 1.6, 3.0], 42], [c.T, [-2.1, 1.9, 0.4], [-4.5, 1.6, 3.0], 40]], E.sine);
    c.ov.pill('Preston', 0.1, c.T, { at3d: () => p.headTop(new THREE.Vector3()).add(new THREE.Vector3(0, 0.15, 0)) });
    c.ov.panel([{ text: '4 airlines', mark: 'check', at: c.at('L53:his') }, { text: '0 manners', mark: 'x', at: c.at('L53:zero') }], 0, c.T, { x: 1280, y: 60 });
    c.ov.custom(0, c.T, (g, lt) => { if (Math.floor(lt * 2) % 2 === 0) { g.fillStyle = '#ff2d55'; g.beginPath(); g.arc(90, 1000, 14, 0, 7); g.fill(); } g.fillStyle = '#fff'; g.font = '600 30px Inter'; g.fillText('REC', 116, 1011); }, 1);
    return (t) => { p.pose('holdUp'); p.state.bounce = Math.abs(Math.sin(t * 9)) * 0.03; fr.forEach((a, i) => { a.pose('clap'); a.state.bounce = Math.abs(Math.sin(t * 8 + i)) * 0.04; }); };
  }, { sfx: [[0, 'kids_laugh', -8], ['L53:his', 'plane_flyby', -14], ['L53:zero', 'buzzer', -10]] });

  S('L54', 'stables', (c) => {
    const h = c.prop('horse'); h.obj.position.set(0, 0, 0); h.obj.rotation.y = Math.PI / 2;
    const k = c.actor('kid'); k.expr('scared');
    c.cam.path([[0, [2.5, 2.4, 6.5], [0, 2.0, 0], 38], [c.T, [1.5, 1.8, 5.0], [0, 2.1, 0], 36]], E.sine);
    const tOn = c.at('L54:but#2');
    c.ov.pop('ON!', tOn, c.T, { y: 260, size: 170, colors: ['#9dffb0', '#2ecc71'] });
    return (t) => { k.root.position.set(-0.05, 1.59, 0); k.root.rotation.set(0, 0, Math.sin(t * 7) * 0.12 * (t < tOn ? 1 : 0.2)); k.pose('ride'); k.state.seatH = 0.55; k.state.noShadow = true; h.walk = 0.5; if (t > tOn) { k.expr('joy'); k.pose('ride', 'cheer', clamp((t - tOn) / 0.3) * 0.7); } };
  }, { sfx: [[0, 'horse_walk', -8], ['L54:wobbly', 'wobble', -8], ['L54:but#2', 'success_sting', -4]] });

  S('L55', 'stables', (c) => {
    const ins = c.actor('instructor').place(-2.0, 2.4, 0.5); ins.expr('happy');
    const h = c.prop('horse'); h.obj.position.set(1.5, 0, 0); h.obj.rotation.y = Math.PI / 2 + 0.3;
    const k = c.actor('kid'); k.expr('content');
    c.cam.path([[0, [-1.0, 2.0, 7.5], [0, 2.0, 0.8], 40], [c.at('L55:maybe'), [0.2, 2.3, 4.6], [1.4, 2.3, 0], 36], [c.T, [0.6, 2.4, 3.8], [1.4, 2.4, 0], 32]], E.io);
    c.ov.bubble(ins, 'Not bad for a first timer.', 0.1, c.at('L55:maybe'), { side: -1 });
    c.ov.pop('KEEP GETTING BACK UP', c.at('L55:keep') - 0.1, c.T, { y: 180, size: 76, colors: ['#ffd36b', '#ff8a3d'], rot: 0 });
    return (t) => { k.root.position.set(1.5 + Math.sin(0.3) * 0.0, 1.59, 0); k.root.rotation.set(0, 0.3, 0); k.pose('ride'); k.state.seatH = 0.55; k.state.noShadow = true; talk(ins, t, [[0.1, c.at('L55:maybe') - 0.2]]); ins.pose('idle', 'clap', 0.6); if (t > c.at('L55:do')) k.expr('determined'); };
  }, { sfx: [[0.1, 'clap_single', -10], ['L55:keep', 'inspire_swell', -6]] });

  // ---------- L56-62: blending in ----------
  S('L56', 'hallway', (c) => {
    const k = c.actor('kid').place(0, 2, Math.PI); k.expr('thinking'); k.pose('chin');
    c.cam.path([[0, [1.0, 1.7, -1.2], [0, 1.6, 2], 36], [c.T, [0.8, 1.7, -0.6], [0, 1.6, 2], 34]], E.sine);
    c.ov.corner('End of week one', 0, c.T);
    c.ov.icon(k, 'bulb', c.at('L56:something') - 0.1, c.T);
  }, { sfx: [[0, 'hallway_walla', -16], ['L56:something', 'idea_ding', -6]] });

  S('L57', 'hallway', (c) => {
    const ex = [['ex60', -1.0, 0, 0.6, 'cross', 'smug'], ['ex61', 0.6, 0.6, -2.4, 'hips', 'bored'], ['ex62', 0.2, -0.9, 0, 'holdOne', 'happy']].map(([n, x, z, r, p, e]) => { const a = c.actor(n).place(x, z, r); a.pose(p); a.expr(e); return a; });
    c.cam.path([[0, [2.6, 1.8, 3.4], [-0.1, 1.5, 0], 38], [c.T, [2.2, 1.8, 2.8], [-0.1, 1.5, 0], 36]], E.sine);
    c.ov.panel([{ text: 'Talks about money', mark: 'x', at: 0.3 }, { text: 'Thinks about money', mark: 'x', at: c.at('L57:think') }], 0, c.T, { x: 60, y: 60 });
    return (t) => { talk(ex[0], t, [[0, 1.4]]); talk(ex[1], t, [[1.6, 3.0]]); talk(ex[2], t, [[3.2, c.T]]); };
  }, { sfx: [[0.3, 'tick', -8], ['L57:think', 'tick', -8]] });

  S('L58', 'ocean', (c) => {
    c.cam.path([[0, [14, 4, 14], [0, 1.5, 0], 40], [c.T, [10, 3, 12], [0, 1.5, 0], 38]], E.sine);
    c.ov.pill('"Summering in Monaco"', 0.2, c.T, { y: 110 });
  }, { sfx: [[0, 'amb_ocean', -10], [0.2, 'yacht_horn', -14]] });

  S('L58:or', 'sky', (c) => {
    c.cam.path([[0, [12, 3, 10], [0, 0, 0], 40], [c.T, [10, 2, 8], [0, 0, -2], 40]], E.sine);
    c.ov.pill('"Fly commercial... ugh."', 0.2, c.T, { y: 110 });
    return (t) => { c.set.parts.jet.obj.position.z = t * 3; c.set.parts.jet.obj.rotation.z = Math.sin(t) * 0.05; };
  }, { sfx: [[0, 'jet_flyby', -6]] });

  S('L58:ugh', 'hallway', (c) => {
    const a = c.actor('ex61').place(0, 0, 0); a.expr('deadpan'); a.pose('cross');
    c.cam.at([0.2, 1.65, 2.2], [0, 1.6, 0], 30);
    c.ov.bubble(a, 'Ugh.', 0, c.T, { side: 1 });
    return (t) => { a.state.look = [0, -0.3]; talk(a, t, [[0, 0.5]]); };
  }, { sfx: [[0, 'eye_roll', -10]] });

  S('L59', 'void', (c) => {
    const k = c.actor('kid').place(0, 0, 0); k.expr('determined'); k.pose('hips');
    c.cam.path([[0, [0, 1.6, 5.5], [0, 1.4, 0], 36], [c.T, [0, 1.6, 3.4], [0, 1.55, 0], 32]], E.io);
    c.ov.pop('BLEND IN', c.at('L59:blend') - 0.05, c.T, { y: 200, size: 130, colors: ['#bfa8ff', '#7b5cff'] });
  }, { sfx: [[0, 'sneaky_pluck', -8], ['L59:blend', 'swish_stealth', -6]] });

  S('L60', 'hallway', (c) => {
    const k = c.actor('kid').place(0.95, 0.1, -0.55); k.expr('confident'); k.pose('cross');
    const a = c.actor('ex60').place(-0.95, 0.1, 0.55); a.expr('happy'); const b = c.actor('ex62').place(0, -0.75, 0); b.expr('happy');
    c.cam.path([[0, [0.3, 1.75, 3.8], [0, 1.5, -0.2], 38], [c.T, [0.2, 1.75, 3.4], [0, 1.5, -0.2], 36]], E.sine);
    c.ov.bubble(k, 'Summering.', c.at('L60:summering') - 0.1, c.at('L60:you#3'), { side: 1 });
    c.ov.bubble(k, 'My family’s company...', c.at('L60:my') - 0.1, c.T, { side: 1 });
    return (t) => { talk(k, t, [[c.at('L60:summering'), c.at('L60:summering') + 0.6], [c.at('L60:my'), c.T]]); a.state.look = [0.3, 0]; };
  }, { sfx: [['L60:summering', 'fancy_ding', -10], ['L60:my', 'fancy_ding', -10]] });

  S('L61', 'lawnYard', (c) => {
    const d = c.actor('dad').place(-1, -1, 0.4); d.expr('joy');
    const lm = c.prop('lawnmower'); lm.obj.position.set(-1, 0, 0.0); lm.obj.rotation.y = 0.4 + Math.PI;
    c.cam.path([[0, [3.5, 1.8, 6], [-2, 1.2, 0], 42], [c.T, [2.8, 1.7, 5.2], [-2, 1.2, 0], 40]], E.sine);
    c.ov.panel([{ text: 'Lawn mowing business', mark: 'check', at: c.at('L61:it\'s') }, { text: 'Employees: 1', mark: 'dot', at: c.at('L61:it') }, { text: 'It’s him', mark: 'dot', at: c.at('L61:it\'s#2') }], 0, c.T, { x: 1250, y: 60 });
    return (t) => { const x = -1 + Math.sin(t * 0.8) * 1.5; d.root.position.x = x; lm.obj.position.x = x; d.pose('holdFront'); d.state.walk = 1; d.state.walkPhase = t * 6; if (t > c.at('L61:it\'s#2')) { d.pose('wave'); d.state.walk = 0; } };
  }, { sfx: [[0, 'lawnmower', -8], [0, 'amb_birds', -14]] });

  S('L62', 'void', (c) => {
    c.cam.at([0, 1.5, 6], [0, 1.4, 0], 36);
    c.ov.phone('homeScreen', 0, c.at('L62:it') - 0.05, { cracked: true, dim: 0.0, scale: 0.85, tilt: 0.06 });
  }, { sfx: [[0, 'glass_crack', -6]] });

  S('L62:it', 'bedroom', (c) => {
    const k = c.actor('kidPJ').place(1.4, 0.4, -0.5); k.expr('nervous');
    const ph = c.prop('phone'); c.hold(k, ph, 0); ph.obj.rotation.set(0.3, 0, 0.6);
    const cab = c.prop('cable'); c.hold(k, cab, 1); cab.obj.rotation.set(0, 0, -0.8);
    c.cam.path([[0, [0.2, 1.4, 2.4], [1.3, 1.4, 0.0], 38], [c.T, [0.4, 1.4, 2.1], [1.3, 1.4, 0.0], 34]], E.sine);
    c.ov.custom(0.3, c.T, (g, lt) => { const on = Math.floor(lt * 3) % 2 === 0; g.fillStyle = 'rgba(16,8,38,0.8)'; g.beginPath(); g.roundRect(1380, 120, 380, 120, 20); g.fill(); g.fillStyle = on ? '#2ecc71' : '#ff4d5e'; g.font = '800 60px Inter'; g.fillText(on ? '⚡ 1%' : '✕ 1%', 1440, 200); });
    return (t) => { k.pose({ aL: [1.2, 0.8, 1.9], aR: [2.0, 0.3, 0.4], head: [0.1, 0.2, 0.35], lean: [0.1, 0.35] }); k.state.tremble = 0.4; k.root.rotation.z = 0.15; };
  }, { sfx: [[0.3, 'charge_beep', -10], [0.9, 'charge_off', -10], [1.6, 'charge_beep', -10], [2.4, 'charge_off', -10]] });

  // ---------- L63-68: the group chat ----------
  const CHAT = [
    { at: 'L63', system: true, text: 'Preston added you' },
    { at: 'L63:there', from: 'Ava', text: 'okay ski trip planning \u{1F3BF}❄️', av: 1 },
    { at: 'L63:and', from: 'Blake', text: 'chalet booked for 40 ppl', av: 2 },
    { at: 'L64', from: 'Preston', text: 'Who’s flying private to Switzerland?', av: 6, react: { e: '\u{1F44D}', from: 0, to: 39, dur: 1.3 }, reactAt: 'L65' },
    { at: 'L66:you#2', from: 'Preston', text: '@you You coming?', av: 6 },
  ];
  S('L63', 'voidPink', (c) => {
    c.cam.at([0, 1.5, 6], [0, 1.4, 0], 36);
    c.ov.phone('chat', 0, c.T + 1, { messages: CHAT, members: '41 members', dim: 0.1, scale: 0.98, outDur: 0.01 });
    c.ov.pill('41 people', c.at('L63:forty-one') - 0.1, c.at('L63:and'), { x: 1450, y: 300 });
  }, { sfx: [[0, 'phone_slide', -6], [0.1, 'notif_ping', -6], ['L63:there', 'msg_pop', -8], ['L63:and', 'msg_pop', -8]] });

  S('L64', 'voidPink', (c) => {
    c.cam.at([0, 1.5, 6], [0, 1.4, 0], 36);
    c.ov.phone('chat', -1, c.T + 1, { messages: CHAT, members: '41 members', dim: 0.1, scale: 0.98, inDur: 0.01, outDur: 0.01 });
  }, { sfx: [[0, 'msg_pop', -6], ['L65', 'reactions_burst', -6]] });

  S('L66', 'void', (c) => {
    const k = c.actor('kid').place(0, 0, 0); k.expr('shocked'); k.pose('phone');
    const ph = c.prop('phone'); c.hold(k, ph, 1); ph.obj.rotation.set(-1.0, 0, 0);
    c.cam.path([[0, [0, 1.6, 3.0], [0, 1.5, 0], 34], [c.T, [0, 1.6, 2.4], [0, 1.55, 0], 30]], E.out);
    c.ov.phone('chat', -1, c.T, { messages: CHAT, members: '41 members', dim: 0.05, scale: 0.7, x: 1420, inDur: 0.01 });
    c.ov.icon(k, '!', c.at('L66:you') - 0.1, c.T, { dx: -60 });
  }, { sfx: [['L66:you#2', 'notif_ping', -4], ['L66:you#2', 'dun_dun', -8]] });

  S('L67', 'void', (c) => {
    c.cam.at([0, 1.5, 6], [0, 1.4, 0], 36);
    c.ov.phone('trip', 0, c.T, { priceAt: 'L67:forty', dim: 0.3, scale: 0.98 });
  }, { sfx: [[0, 'phone_tap', -8], ['L67:forty', 'heartbeat', -4], ['L67:thousand', 'heartbeat', -4], ['L67:dollars', 'impact_low', -2]] });

  S('L67:dollars', 'void', (c) => {
    const k = c.actor('kid').place(0, 0, 0); k.expr('shocked');
    c.cam.at([0, 1.62, 2.0], [0, 1.6, 0], 30); c.cam.punch(0, 0.75, 0.12);
    c.ov.pop('$40,000?!', 0.05, c.T, { y: 240, size: 150, shake: 10 });
    return (t) => { k.pose('handsHead'); k.state.tremble = 1; };
  }, { sfx: [[0, 'boing_shock', -6]] });

  S('L68', 'voidPink', (c) => {
    c.cam.at([0, 1.5, 6], [0, 1.4, 0], 36);
    const msgs = [...CHAT, { at: 'L68:then', me: true, text: 'Can’t. Family stuff \u{1F605}' }];
    c.ov.phone('chat', 0, c.at('L68:then') + 0.7, { messages: msgs, members: '41 members', dim: 0.1, scale: 0.98, draft: { at: 'L68:can\'t', end: 'L68:stuff', text: 'Can’t. Family stuff \u{1F605}' } });
  }, { sfx: [['L68:can\'t', 'typing_phone', -6], ['L68:then', 'msg_send', -6]] });

  S('L68:you#2', 'bedroom', (c) => {
    const k = c.actor('kid'); seat(k, 1.6, -1.05, Math.PI, 0.55, 'sitIdle'); k.expr('worried');
    const ph = c.prop('phone'); ph.obj.position.set(1.6, 0.885, -1.8); ph.obj.rotation.set(-Math.PI / 2, 0, 0);
    c.cam.path([[0, [0.3, 1.5, -1.3], [1.6, 0.98, -1.7], 38], [c.T, [0.5, 1.45, -1.4], [1.7, 0.95, -1.75], 34]], E.sine);
    return (t) => { const k1 = clamp((t - 0.2) / 0.5); ph.obj.rotation.x = Math.PI / 2 * (k1 > 0.5 ? 1 : -1); ph.obj.position.y = 0.885 + Math.sin(k1 * Math.PI) * 0.12; ph.obj.position.x = 1.6 + tw(t, 0.8, 1.4, 0, 0.35); k.pose('sitIdle', 'holdFront', 1 - clamp((t - 0.9) / 0.4)); };
  }, { sfx: [[0.6, 'phone_down', -6], [0.9, 'slide_wood', -10]] });

  // ---------- L69-71: it works... until it doesn't ----------
  S('L69', 'hallway', (c) => {
    const k = c.actor('kid').place(0.95, 0.1, -0.55); k.expr('laugh');
    const a = c.actor('ex60').place(-0.95, 0.1, 0.55); a.expr('laugh'); const b = c.actor('ex62').place(0, -0.75, 0); b.expr('laugh');
    c.cam.path([[0, [0.3, 1.75, 3.8], [0, 1.5, -0.2], 38], [c.T, [0.2, 1.75, 3.4], [0, 1.5, -0.2], 36]], E.sine);
    c.ov.bubble(a, 'Our yacht has a smaller yacht inside.', c.at('L69:you') - 0.2, c.at('L69:you#2'), { side: -1, size: 30 });
    c.ov.bubble(b, 'Our maid forgot the gold napkins. AGAIN.', c.at('L69:you#2'), c.at('L69:you#3'), { side: -1, size: 30 });
    return (t) => { [k, a, b].forEach((x, i) => x.state.bounce = Math.abs(Math.sin(t * 8 + i)) * 0.03 * (t < c.at('L69:you#2') ? 1 : 0)); if (t > c.at('L69:you#2')) { k.expr('neutral'); k.state.look = [0, Math.sin(t * 6) * 0.15]; } };
  }, { sfx: [['L69:you', 'kids_laugh', -10], ['L69:you', 'fake_laugh', -8]] });

  S('L69:you#3', 'bedroom', (c) => {
    const k = c.actor('kidPJ').place(1.55, 0.8, Math.PI / 2); k.expr('smug');
    c.cam.path([[0, [2.42, 1.62, 0.82], [1.55, 1.58, 0.8], 44], [c.T, [2.42, 1.62, 0.8], [1.55, 1.6, 0.8], 40]], E.sine);
    c.ov.custom(0, c.T, (g) => { g.save(); g.lineWidth = 46; g.strokeStyle = '#e8c15a'; g.beginPath(); g.roundRect(330, 40, 1260, 1000, 60); g.stroke(); g.lineWidth = 6; g.strokeStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.roundRect(356, 66, 1208, 948, 44); g.stroke(); const gr = g.createLinearGradient(330, 40, 1590, 1040); gr.addColorStop(0, 'rgba(255,255,255,0.14)'); gr.addColorStop(0.4, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(356, 66, 1208, 948); g.fillStyle = '#0d0838'; g.fillRect(0, 0, 307, 1080); g.fillRect(1613, 0, 307, 1080); g.restore(); }, -1);
    c.ov.bubble(k, 'Ugh.', c.at('L69:ugh') - 0.1, c.T, { side: -1 });
    return (t) => { k.pose('cross'); talk(k, t, [[c.at('L69:ugh'), c.at('L69:ugh') + 0.5]]); k.state.tilt = -0.1; };
  }, { sfx: [['L69:ugh', 'eye_roll', -10]] });

  S('L70', 'voidDark', (c) => {
    const k = c.actor('kid').place(0, 0, 0); k.expr('worried'); k.pose('holdUp');
    const boxes = []; const labels = ['Summering', 'Family company', 'Private jet', 'Our maid', 'Monaco', 'Family stuff', 'Ugh'];
    for (let i = 0; i < 7; i++) { const cv = document.createElement('canvas'); cv.width = 256; cv.height = 128; const g = cv.getContext('2d'); g.fillStyle = '#c99a62'; g.fillRect(0, 0, 256, 128); g.strokeStyle = '#8a6a3a'; g.lineWidth = 8; g.strokeRect(4, 4, 248, 120); g.fillStyle = '#3a2216'; g.font = 'bold 34px "Baloo 2"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('LIE: ' + labels[i], 128, 66);
      const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; const m = [new THREE.MeshStandardMaterial({ color: '#c99a62' }), new THREE.MeshStandardMaterial({ color: '#c99a62' }), new THREE.MeshStandardMaterial({ color: '#d9aa72' }), new THREE.MeshStandardMaterial({ color: '#c99a62' }), new THREE.MeshStandardMaterial({ map: tex }), new THREE.MeshStandardMaterial({ color: '#c99a62' })];
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.42, 0.6), m); c.scene.add(b); boxes.push(b); }
    c.onExit = () => boxes.forEach(b => c.scene.remove(b));
    c.cam.path([[0, [0, 2.3, 4.8], [0, 2.2, 0], 40], [c.T, [0, 2.9, 5.6], [0, 2.8, 0], 42]], E.sine);
    return (t) => { const n = Math.min(7, Math.floor(t / (c.T / 7.5)) + 1); boxes.forEach((b, i) => { b.visible = i < n; const drop = clamp((t - i * c.T / 7.5) / 0.3); b.position.set(Math.sin(t * 2 + i) * 0.03 * i, 2.45 + i * 0.43 + (1 - E.out(drop)) * 2, 0.3); b.rotation.z = Math.sin(t * 2.5 + i) * 0.03 * i; }); k.state.tremble = 0.3 + n * 0.1; k.state.yOff = -0.02 * n; };
  }, { sfx: [[0, 'box_thud', -8], ['L70:it', 'box_thud', -8], ['L70:because', 'box_thud', -8], ['L70:another', 'box_thud', -6], [0, 'tension_drone', -12]] });

  S('L71', 'voidDark', (c) => {
    const k = c.actor('kid').place(0, 0, 0); k.expr('shocked');
    c.cam.at([0, 2.0, 6.5], [0, 1.8, 0], 40);
    c.ov.corner('3 weeks later', 0, c.T);
    const boxes = []; for (let i = 0; i < 7; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.42, 0.6), new THREE.MeshStandardMaterial({ color: '#c99a62' })); c.scene.add(b); boxes.push(b); }
    c.onExit = () => boxes.forEach(b => c.scene.remove(b));
    const tf = c.at('L71:falls') - 0.1;
    return (t) => { boxes.forEach((b, i) => { const f = clamp((t - tf) / 0.8); const dir = i % 2 ? 1 : -1; b.position.set(dir * f * (1 + i * 0.3), Math.max(0.21, 2.45 + i * 0.43 - f * f * 6), 0.3 + f * (i % 3) * 0.4); b.rotation.set(f * i * 0.5, 0, f * dir * 1.5); }); k.pose(t < tf ? 'holdUp' : 'handsHead'); if (t > tf) c.cam.shake = 0.06 * (1 - clamp((t - tf) / 0.8)); };
  }, { sfx: [['L71:falls', 'boxes_crash', -2]] });

  // ---------- L72-78: caught ----------
  S('L72', 'avenue', (c) => {
    const bus = c.prop('bus'); bus.obj.rotation.y = -Math.PI / 2;
    const k = c.actor('kid'); k.expr('neutral');
    const car = c.prop('sportsCar'); car.obj.rotation.y = Math.PI / 2;
    c.cam.path([[0, [-5, 2.0, 3.5], [1, 1.6, -4], 42], [c.T, [-3.5, 1.9, 3.0], [2.5, 1.4, -4], 40]], E.sine);
    const tCar = c.at('L72:and');
    return (t) => { const bx = kf(t, [[0, 1.5], [3.0, -30, E.in]]); bus.obj.position.set(bx, 0, -1.4); bus.wheels.forEach(w => w.rotation.x = -bx);
      walk(k, t, 0.6, c.T, [0.6, -4.6], [3.6, -5.5], { rate: 7.5 });
      const cx = kf(t, [[tCar - 1.5, -25], [tCar + 0.8, k.root.position.x - 0.4, E.out]]); car.obj.position.set(Math.min(cx, k.root.position.x - 0.4), 0, -2.0); car.wheels.forEach(w => w.rotation.x = car.obj.position.x * 2); if (t > tCar + 0.5) { k.expr('worried'); lookAtPt(k, car.obj.position.x, -2); } };
  }, { sfx: [[0, 'bus_leave', -6], ['L72:and', 'car_slow', -4]] });

  S('L73', 'avenue', (c) => {
    const car = c.prop('sportsCar'); car.obj.rotation.y = Math.PI / 2; car.obj.position.set(2, 0, -2.0);
    const p = c.actor('preston'); seat(p, 2.2, -1.7, -Math.PI / 2, 0.45, 'sitIdle'); p.expr('smug'); p.state.noShadow = true;
    c.cam.path([[0, [2.6, 1.25, -4.3], [2.1, 1.25, -1.8], 34], [c.T, [2.5, 1.25, -4.0], [2.1, 1.25, -1.8], 30]], E.sine);
    c.ov.pill('Preston', c.at('L73:it\'s') - 0.1, c.T, { at3d: () => p.headTop(new THREE.Vector3()).add(new THREE.Vector3(0, 0.1, 0)) });
    return (t) => { p.state.look = [-1.1, 0]; };
  }, { sfx: [[0, 'window_roll', -6], ['L73:it\'s', 'villain_sting', -6]] });

  S('L74', 'avenue', (c) => {
    const car = c.prop('sportsCar'); car.obj.rotation.y = Math.PI / 2; car.obj.position.set(2, 0, -2.0);
    const p = c.actor('preston'); seat(p, 2.2, -1.7, -Math.PI / 2, 0.45, 'sitIdle'); p.expr('smug'); p.state.noShadow = true;
    const ph = c.prop('phone'); c.hold(p, ph, 1);
    c.cam.path([[0, [3.4, 1.4, -3.6], [2.2, 1.35, -1.7], 34], [c.T, [3.3, 1.4, -3.4], [2.2, 1.35, -1.7], 30]], E.sine);
    c.ov.flash(c.at('L74:click') - 0.02, 0.35, '#ffffff', 1);
    return (t) => { p.pose('sitIdle', 'holdUp', clamp(t / 0.4)); p.state.look = [-1.0, 0]; if (t > c.at('L74:click')) p.expr('grin'); };
  }, { sfx: [['L74:click', 'camera_shutter', 0], ['L74:click', 'impact_low', -6]] });

  S('L75', 'schoolExt', (c) => {
    const k = c.actor('kid').place(0.3, 3.6, Math.PI); k.expr('worried'); k.pose('phone');
    const ph = c.prop('phone'); c.hold(k, ph, 1); ph.obj.rotation.set(-1.0, 0, 0);
    c.cam.path([[0, [1.5, 1.7, 1.0], [0.3, 1.5, 3.6], 34], [c.T, [1.2, 1.7, 1.6], [0.3, 1.5, 3.6], 32]], E.sine);
    const nts = ['Ava', 'Blake', 'Preston', 'Zoe', 'Max', 'Lily'];
    nts.forEach((n, i) => c.ov.notif('Goldcrest Elite', n, ['LMAOOO \u{1F480}', 'wait is this real??', 'family stuff \u{1F602}\u{1F602}', 'the BUS??', 'no wayyy', '\u{1F68C}\u{1F68C}\u{1F68C}'][i], c.at('L75:the#3') - 0.2 + i * 0.28, c.at('L75:the#3') + 0.28 + i * 0.28));
    return (t) => { ph.obj.rotation.z = Math.sin(t * 60) * 0.05 * (t > c.at('L75:the#3') - 0.2 ? 1 : 0); k.state.tremble = t > c.at('L75:exploded') ? 0.6 : 0; if (t > c.at('L75:exploded')) k.expr('scared'); };
  }, { sfx: [['L75:the#3', 'phone_buzz_rapid', -4], ['L75:the#3', 'notif_spam', -6]] });

  const CHAT2 = [...CHAT, { at: 'L68:then', me: true, text: 'Can’t. Family stuff \u{1F605}' },
    { at: 'L76', from: 'Preston', photo: true, av: 6 },
    { at: 'L77', from: 'Preston', text: 'Since when does family stuff mean the CITY bus? \u{1F602}', av: 6, react: { e: '\u{1F602}', from: 0, to: 27, dur: 1.2 }, reactAt: 'L77e' },
    { at: 'L78', from: 'Zoe', text: 'NO WAYYY \u{1F480}\u{1F480}', av: 3 }, { at: 'L78+0.4', from: 'Max', text: 'the safety pin \u{1F62D}', av: 4 }, { at: 'L78+0.8', from: 'Ava', text: 'bus kid lmao', av: 1 }, { at: 'L78+1.2', from: 'Lily', text: 'wait is he ok tho', av: 5 }];
  S('L76', 'voidDark', (c) => {
    c.cam.at([0, 1.5, 6], [0, 1.4, 0], 36);
    c.ov.phone('chat', 0, c.T + 2, { messages: CHAT2, members: '41 members', dim: 0.1, scale: 0.98, outDur: 0.01, badge: (t) => Math.min(112, Math.floor(Math.max(0, t) * 9)) });
    c.ov.tag(new THREE.Vector3(0.08, 1.38, 0), 'Safety pin and all', c.at('L76:safety'), c.T, { dx: 380, dy: 60 });
  }, { sfx: [[0, 'msg_pop', -6], ['L76:safety', 'dun_dun', -8]] });

  S('L77', 'voidDark', (c) => {
    c.cam.at([0, 1.5, 6], [0, 1.4, 0], 36);
    c.ov.phone('chat', -2, c.T + 2, { messages: CHAT2, members: '41 members', dim: 0.1, scale: 0.98, inDur: 0.01, outDur: 0.01, badge: (t) => Math.min(112, 20 + Math.floor(Math.max(0, t) * 9)) });
  }, { sfx: [[0, 'msg_pop', -6], ['L77e', 'reactions_burst', -6], [0.2, 'kids_laugh', -16]] });

  S('L78', 'voidDark', (c) => {
    c.cam.at([0, 1.5, 6], [0, 1.4, 0], 36);
    c.ov.phone('chat', -3, c.T, { messages: CHAT2, members: '41 members', dim: 0.1, scale: 0.98, x: 560, inDur: 0.01, shake: 6, badge: (t) => 112 });
    c.ov.counter((v) => Math.round(v) + ' messages', 0, 112, 0, c.T, { x: 1340, y: 420, size: 110, w: 820, h: 260, sub: 'in 10 minutes', dur: 1.2 });
  }, { sfx: [[0, 'notif_spam', -4], [0, 'msg_pop_rapid', -6]] });

  // ---------- L79: walking into class ----------
  S('L79', 'classroom', (c) => {
    const roster = {}; let n = 0;
    for (let r = 0; r < 4; r++) for (let col = 0; col < 6; col++) { if (r === 3 && col === 2) continue; const name = r === 0 && col === 2 ? 'islandGirl' : r === 0 && col === 3 ? 'spaceBoy' : r === 2 && col === 4 ? 'preston' : 'ex' + (n++); const a = c.actor(name); seat(a, -5 + col * 2, -2.6 + r * 2.1 + 0.75, Math.PI, 0.53, 'sitIdle'); roster[name] = a; }
    const k = c.actor('kid'); k.expr('sad');
    const tch = c.actor('teacher').place(2.6, -5.0, -0.3); tch.expr('sad');
    c.cam.path([[0, [-6.5, 2.0, 5.5], [0, 1.4, 1], 44], [c.T, [-5.8, 2.0, 5.0], [0, 1.4, 0.5], 42]], E.sine);
    const tq = c.at('L79:everybody'), tl = c.at('L79:somebody'), tp = c.at('L79:somebody#2'), tt = c.at('L79:even');
    c.ov.pop('WORSE', c.at('L79:worse') - 0.05, c.T, { y: 220, size: 120, colors: ['#9df2ff', '#3fb6e8'] });
    return (t) => {
      walk(k, t, 0, tq + 0.5, [-7.2, 5.6], [-3.4, 5.4], { rate: 7 }); if (t > tq + 0.5) k.root.rotation.y = Math.PI * 0.8;
      Object.entries(roster).forEach(([nm, a], i) => { if (t > tq) { lookAtPt(a, k.root.position.x, k.root.position.z, 1); a.root.rotation.y = Math.PI * 0.6; a.expr('blank'); } });
      if (t > tl) { roster.ex7.expr('laugh'); roster.ex7.state.bounce = Math.abs(Math.sin(t * 9)) * 0.03; roster.ex7.pose('sitIdle', 'mouthCover', 0.8); }
      if (t > tp) { roster.ex9.state.look = [-0.8, 0.3]; roster.ex9.expr('nervous'); }
      if (t > tt) { lookAtPt(tch, k.root.position.x, k.root.position.z); tch.pose('idle', 'cheeks', 0.5); }
    };
  }, { sfx: [['L79:everybody', 'room_silence', -8], ['L79:somebody', 'snicker', -8], ['L79:even', 'sad_note', -10]] });

  // ---------- L80: that night ----------
  S('L80', 'bedroom', (c) => {
    const k = c.actor('kidPJ'); seat(k, -0.8, -0.6, Math.PI / 2, 0.62, 'sitSad'); k.expr('sad');
    const bag = c.prop('backpack'); bag.obj.position.set(0.4, 0, -0.9); bag.obj.rotation.y = 0.8;
    c.cam.path([[0, [1.35, 1.15, 1.0], [-0.75, 1.3, -0.6], 40], [c.T, [1.05, 1.1, 0.6], [-0.75, 1.3, -0.6], 36]], E.sine);
    c.ov.custom(0, c.T, (g, lt) => { g.strokeStyle = 'rgba(180,200,255,0.18)'; g.lineWidth = 2; for (let i = 0; i < 60; i++) { const x = (i * 97 + lt * 900) % 2100 - 100, y = (i * 53 + lt * 1400) % 1180 - 100; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 8, y + 30); g.stroke(); } }, -1);
    return (t) => { k.state.look = [0.1, 0.2]; if (t > c.at('L80:quitting') - 0.3) k.expr('cry'); };
  }, { sfx: [[0, 'rain_window', -8], [0, 'sad_piano', -6]] });
}

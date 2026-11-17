// Shots: intro, morning, the gate, history class (lines 0-34)
import { E, tw, kf, clamp, lerp, pulse, within, walk, seat, talk, lookAtPt, drift, orbit, extras, seq, THREE } from './shotkit.js';

const RICH = (n) => Array.from({ length: n }, (_, i) => 'ex' + i);

export default function (S) {
  // ---------- L0: helicopter arrival ----------
  S('T0', 'schoolExt', (c) => {
    const k = c.actor('kid').place(0, 26, Math.PI); k.expr('happy');
    c.cam.path([[0, [3.5, 1.6, 33], [0, 1.6, 20], 42], [c.T, [1.6, 1.9, 29.5], [0, 2.4, 14], 42]], E.sine);
    c.ov.fadeIn(0.6);
    c.ov.pill('Goldcrest Academy', 1.0, c.T - 0.2, { y: 110 });
    return (t) => { walk(k, t, 0, c.T, [0, 26], [0, 22.4], { rate: 7 }); if (t > c.at('L0:first') - 0.1) k.expr('neutral'); };
  }, { lead: 0, sfx: [[0, 'amb_birds', -14], [0.2, 'whoosh_soft', -10], ['L0:first', 'boom_soft', -8]] });

  S('L0:and', 'schoolExt', (c) => {
    const h = c.prop('helicopter'); h.obj.position.set(0, 14, 14); h.obj.rotation.y = Math.PI;
    const k = c.actor('kid').place(0, 22.4, Math.PI); k.expr('surprised');
    c.cam.path([[0, [-5.5, 0.9, 27], [0, 5, 14], 46], [c.T, [-6.5, 0.7, 28], [0, 2.2, 15], 44]], E.out);
    c.ov.icon(k, '!!', 0.9, c.T);
    return (t) => {
      const y = kf(t, [[0, 14], [c.T * 0.85, 0.02, E.out]]); h.obj.position.y = y; h.obj.rotation.z = Math.sin(t * 1.3) * 0.04 * (y / 14);
      k.state.look = [0, -0.35]; k.state.tremble = 0.6; k.pose('idle', 'handsHead', clamp((t - 0.6) / 0.3)); k.expr(t > 0.9 ? 'shocked' : 'surprised');
      c.cam.shake = 0.03 + 0.02 * (1 - y / 14);
    };
  }, { sfx: [[0, 'heli_land', -2]] });

  // ---------- L1: doors open, rich kid steps out ----------
  S('L1', 'schoolExt', (c) => {
    const h = c.prop('helicopter'); h.obj.position.set(0, 0.02, 14); h.obj.rotation.y = Math.PI;
    const r = c.actor('heli').place(-1.9, 14.2, -Math.PI / 2); r.expr('smug');
    c.cam.path([[0, [-4.5, 0.6, 18.5], [-1.5, 1.8, 14.2], 38], [c.T, [-4.0, 0.5, 17.6], [-2.5, 1.9, 14.6], 36]], E.sine);
    const tOut = c.at('L1:a') + 0.1;
    return (t) => {
      h.door.position.z = 0.2 + tw(t, 0.2, 1.0, 0, -1.0);
      h.spin = 0.4;
      walk(r, t, tOut, tOut + 1.4, [-1.3, 14.2], [-3.0, 15.4], { rate: 6 });
      r.root.position.y = t < tOut ? 0.25 : Math.max(0, 0.25 - (t - tOut) * 0.4);
      r.state.bounce = 0;
    };
  }, { sfx: [[0, 'heli_idle', -12], [0.2, 'door_slide', -6], ['L1:a', 'footstep_shoe', -8], ['L1:sunglasses', 'sparkle', -8]] });

  S('L1:sunglasses', 'schoolExt', (c) => {
    const r = c.actor('heli').place(-3, 15.4, -0.4); r.expr('smug');
    c.cam.path([[0, [-2.6, 1.66, 17.2], [-3.0, 1.6, 15.4], 32], [c.T, [-2.7, 1.66, 16.9], [-3.0, 1.6, 15.4], 28]], E.sine);
    c.ov.tag(() => r.headPos(new THREE.Vector3()).add(new THREE.Vector3(0.1, -0.02, 0.4)), 'Sunglasses: $25,000', 0.25, c.T, { dx: 220, dy: -150 });
    c.ov.icon(r, 'sparkle', 0.15, c.T, { dx: -150, dy: 60, size: 0.8 });
    return (t) => { r.state.look = [0.15, 0]; };
  }, { sfx: [[0.15, 'ding_price', -6]] });

  // ---------- L2: walks past without looking ----------
  S('L2', 'schoolExt', (c) => {
    const k = c.actor('kid').place(0, 22.4, Math.PI); k.expr('happy');
    const r = c.actor('heli'); r.expr('bored');
    c.cam.at([1.6, 1.7, 26.5], [0, 1.6, 20], 40);
    return (t) => {
      walk(r, t, 0, c.T + 0.6, [-1.2, 18.5], [0.9, 25.8], { rate: 7 });
      lookAtPt(k, r.root.position.x, r.root.position.z, 1); k.pose('idle', 'wave', clamp((t - 0.2) / 0.25) * (t < c.T * 0.75 ? 1 : 0));
      if (t > c.T * 0.6) k.expr('blank');
    };
  }, { sfx: [[0.1, 'footsteps_shoe', -10]] });

  // ---------- L3: backpack / safety pin ----------
  S('L3', 'void', (c) => {
    const k = c.actor('kid').place(0, 0, 0); k.expr('neutral');
    c.cam.path([[0, [0, 1.6, 5.5], [0, 1.4, 0], 34], [c.at('L3:the'), [0, 1.5, 4.8], [0, 1.3, 0], 34]], E.sine);
    c.ov.corner('Day one', 0, 2.2);
    return (t) => {
      const turn = tw(t, c.at('L3:the') - 0.4, c.at('L3:the') + 0.2, 0, Math.PI * 0.85);
      k.root.rotation.y = turn; k.pose('lookDown', null); k.state.look = [0, 0];
      if (t > c.at('L3:the')) k.expr('worried');
    };
  }, { sfx: [['L3:the', 'whoosh_soft', -12]] });

  S('L3:you#2', 'void', (c) => {
    const k = c.actor('kid').place(0, 0, Math.PI); k.expr('worried');
    c.cam.path([[0, [0.6, 1.3, 1.5], [0.04, 1.1, 0.25], 32], [c.T, [0.48, 1.26, 1.25], [0.04, 1.1, 0.25], 28]], E.sine);
    c.ov.tag(() => k.backpack.localToWorld(new THREE.Vector3(0.04, 0.06, -0.1)), 'Safety pin', 0.3, c.T, { dx: -260, dy: -120 });
    return (t) => { k.state.look = [0, 0]; };
  }, { sfx: [[0.3, 'ding_soft', -8], [0.35, 'zipper', -10]] });

  // ---------- L4: this is going to be interesting ----------
  S('L4', 'void', (c) => {
    const k = c.actor('kid').place(0, 0, 0); k.expr('nervous');
    c.cam.path([[0, [0, 1.7, 3.6], [0, 1.6, 0], 34], [c.T, [0, 1.75, 3.0], [0, 1.62, 0], 32]], E.sine);
    c.ov.icon(k, 'sweat', 0.3, c.T, { dx: 120, dy: 40 });
    return (t) => { k.pose('relaxed'); k.state.tilt = Math.sin(t * 2) * 0.05; };
  }, { sfx: [[0.3, 'gulp', -6]] });

  // ---------- L5: Goldcrest reveal ----------
  S('L5', 'schoolExt', (c) => {
    c.cam.path([[0, [0, 2.0, 18], [0, 6, 0], 50], [c.T, [0, 14, 30], [0, 8, -26], 50]], E.io);
    c.ov.title('Welcome to', 'Goldcrest Academy', 0.6, c.T - 0.1, { blur: 0, size: 96 });
  }, { sfx: [[0, 'riser_soft', -10], [0.6, 'shimmer', -8]] });

  S('L5:the', 'void', (c) => {
    const g = c.prop('globe'); g.obj.position.set(0, 1.6, 0); g.obj.scale.setScalar(0.9);
    c.cam.at([0, 1.7, 6.3], [0, 1.6, 0], 36);
    c.ov.big('#1', 'Most expensive school on Earth', 0.9, c.T, { y: 860, size: 120, w: 980, h: 250 });
    return (t) => { g.earth.rotation.y = 2.2 + t * 0.35; g.pivot.rotation.y = g.earth.rotation.y - 2.2; const d = tw(t, 0.2, 0.7, 2.2, 0, E.out); g.pin.position.y = 2.0 + d; g.pin.visible = t > 0.2; };
  }, { sfx: [[0.65, 'pin_drop', -6], [0.9, 'ding_price', -8]] });

  S('L5:a', 'voidGold', (c) => {
    const names = RICH(7); const fam = ['Oil fortune', 'Tech empire', 'Hotel chain', 'Fashion house', 'Space company', 'Shipping', 'Banks'];
    const kids = names.map((n, i) => c.actor(n).place(-6 + i * 2, 0, 0)); kids.forEach(a => a.expr('smug'));
    c.cam.path([[0, [-5, 1.8, 6.5], [-4, 1.6, 0], 40], [c.T, [3, 1.8, 6.5], [4, 1.6, 0], 40]], E.lin);
    kids.forEach((a, i) => c.ov.pill(fam[i], 0.3 + i * 0.45, c.T, { at3d: () => a.headTop(new THREE.Vector3()).add(new THREE.Vector3(0, 0.25, 0)), size: 20 }));
    return (t) => { kids.forEach((a, i) => { a.pose(i % 2 ? 'hips' : 'cross'); a.state.bounce = Math.max(0, Math.sin(t * 3 + i)) * 0.02; }); };
  }, { sfx: [[0.3, 'coins', -10], [1.2, 'coins', -12], [2.1, 'coins', -12]] });

  // ---------- L6: every student... except you ----------
  S('L6', 'voidGold', (c) => {
    const names = RICH(7); const kids = names.map((n, i) => c.actor(n).place(-6 + i * 2, 0, 0)); kids.forEach(a => { a.expr('smug'); a.pose('cross'); });
    const k = c.actor('kid').place(8.4, 0.4, -0.2); k.expr('nervous');
    c.cam.path([[0, [3, 1.8, 6.5], [4, 1.6, 0], 40], [c.at('L6:except') - 0.1, [6.5, 1.7, 5.4], [7.8, 1.5, 0], 38], [c.T, [7.6, 1.65, 4.0], [8.2, 1.5, 0], 36]], E.io);
    c.ov.pop('EXCEPT YOU', c.at('L6:except'), c.T, { y: 300, size: 110, colors: ['#fff27a', '#ffb23b'] });
    return (t) => { kids.forEach(a => lookAtPt(a, 8.4, 0.4, t > c.at('L6:except') ? 1 : 0)); k.pose('relaxed'); k.state.look = [-0.15, 0]; };
  }, { sfx: [['L6:except', 'record_scratch', -6]] });

  // ---------- L7: scholarship, letter, mom, brother ----------
  S('L7', 'bedroom', (c) => {
    const k = c.actor('kidHome'); seat(k, 1.6, -1.05, Math.PI, 0.55, 'type');
    c.cam.path([[0, [0.1, 1.55, -0.9], [1.6, 1.2, -1.45], 40], [c.T, [0.3, 1.5, -1.1], [1.6, 1.2, -1.45], 36]], E.sine);
    c.ov.panel([{ text: 'Essay contest', mark: 'check', at: 'L7:one' }, { text: 'Full scholarship', mark: 'check', at: 'L7:one' }], 0, c.T, { x: 60, y: 60 });
    return (t) => { k.state.armFn = (i) => [0, 0, Math.sin(t * 18 + i * 2) * 0.12]; k.expr('determined'); };
  }, { sfx: [[0, 'typing', -10]] });

  S('L7:one#2', 'street', (c) => {
    const mb = c.prop('mailbox'); mb.obj.position.set(-3, 0, -4.4);
    const env = c.prop('envelope'); const k = c.actor('kidHome').place(-3, -3.3, Math.PI); k.expr('surprised');
    c.cam.path([[0, [-0.4, 1.75, -2.4], [-3, 1.35, -4.0], 38], [c.T, [-0.7, 1.7, -2.7], [-3, 1.4, -4.0], 36]], E.sine);
    c.ov.icon(k, 'sparkle', 0.6, c.T, { dx: 160, dy: 80 });
    return (t) => {
      const k1 = clamp((t - 0.3) / 0.6);
      env.obj.position.set(-3, 1.25 + k1 * 0.4, -4.2 + k1 * 0.8); env.obj.rotation.set(-0.3, 0, 0.1);
      k.pose('idle', 'holdFront', k1); mb.flag.rotation.z = t > 0.3 ? -1.2 : 0;
      if (t > 0.9) k.expr('awe');
    };
  }, { sfx: [[0.3, 'mailbox_creak', -6], [0.8, 'shimmer', -10]] });

  S('L7:your', 'apartment:dawn', (c) => {
    const mom = c.actor('mom').place(-0.6, 1.6, 0.25); mom.expr('cry'); mom.pose('holdFront');
    const env = c.prop('envelope'); c.hold(mom, env, 1); env.obj.rotation.set(-0.3, 0, 0);
    const bro = c.actor('bro').place(0.8, 1.9, -0.5); bro.expr('joy');
    const k = c.actor('kidHome').place(1.7, 2.1, -2.4); k.expr('embarrassed');
    c.cam.path([[0, [0.2, 1.6, 5.4], [0, 1.25, 1.6], 36], [c.T, [0.0, 1.5, 4.8], [0, 1.25, 1.6], 34]], E.sine);
    c.ov.bubble(bro, 'Are you gonna be FAMOUS?!', c.at('L7:your#2') - 0.1, c.T, { side: 1 });
    c.ov.icon(mom, 'heart', 0.3, c.at('L7:your#2'), { dx: -80 });
    return (t) => { bro.state.bounce = Math.abs(Math.sin(t * 7)) * 0.18; bro.pose('cheer'); mom.state.tilt = Math.sin(t * 3) * 0.06; talk(bro, t, [[c.at('L7:your#2'), c.T]]); };
  }, { sfx: [[0.1, 'sniffle', -8], ['L7:your#2', 'kid_cheer', -10]] });

  // ---------- L8: $47 and a paper bag ----------
  S('L8', 'void', (c) => {
    const k = c.actor('kid').place(0, 0, 0); k.expr('nervous'); k.pose('holdOne');
    const bag = c.prop('paperBag'); c.hold(k, bag, 1); bag.obj.position.set(0, -0.12, 0.06);
    c.cam.path([[0, [0.5, 1.6, 5.0], [0.3, 1.3, 0], 36], [c.T, [0.7, 1.5, 4.2], [0.3, 1.25, 0], 34]], E.sine);
    c.ov.phone('bank', 0.1, c.at('L8:and#2') + 0.2, { x: 1450, scale: 0.75, dim: 0.15 });
    c.ov.tag(() => bag.obj.localToWorld(new THREE.Vector3(0, 0.2, 0)), 'Lunch', c.at('L8:sandwich'), c.T, { dx: -260, dy: -80 });
    return (t) => { bag.obj.visible = t > c.at('L8:sandwich') - 0.3; };
  }, { sfx: [[0.1, 'phone_slide', -8], [0.5, 'coins_small', -10], ['L8:sandwich', 'paper_bag', -6]] });

  // ---------- L9: the big question ----------
  S('L9', 'void', (c) => {
    const k = c.actor('kid').place(0, 0, 0); k.expr('worried');
    const ring = RICH(10).map((n, i) => { const a = i / 10 * Math.PI * 2; return c.actor(n).place(Math.sin(a) * 5.5, Math.cos(a) * 5.5, a + Math.PI); });
    orbit(c, [0, 0, 0], 9, 3.2, -0.5, 0.6, 42, 1.0);
    return (t) => { ring.forEach((a, i) => { const ang = i / 10 * Math.PI * 2; const r = lerp(5.5, 3.2, E.sine(t / c.T)); a.root.position.set(Math.sin(ang) * r, 0, Math.cos(ang) * r); a.expr(i % 3 ? 'deadpan' : 'smug'); a.pose('cross'); });
      k.state.look = [Math.sin(t * 1.5) * 0.8, 0]; k.state.tremble = 0.3; };
  }, { sfx: [[0, 'heartbeat', -10], [0, 'crowd_murmur', -18]] });

  S('L9:would#2', 'void', (c) => {
    const k = c.actor('kid').place(0, 0, 0); k.expr('confused'); k.pose('chin');
    c.cam.path([[0, [1.2, 1.7, 4.4], [0.6, 1.5, 0], 36], [c.T, [1.0, 1.7, 3.8], [0.5, 1.5, 0], 34]], E.sine);
    c.ov.panel([{ text: 'Would you fit in?', mark: 'dot', at: 0 }, { text: 'Would they find out?', mark: 'dot', at: 'L9:would#3' }, { text: 'Would you even want to stay?', mark: 'dot', at: 'L9:would#4' }], 0, c.T, { x: 60, y: 60 });
    c.ov.icon(k, '?', 0.2, c.T, { dx: 30 });
  }, { sfx: [[0, 'tick', -6], ['L9:would#3', 'tick', -6], ['L9:would#4', 'tick', -6]] });

  // ---------- L10: title ----------
  S('L10', 'schoolExt', (c) => {
    const k = c.actor('kid').place(0, 9, Math.PI); k.expr('determined');
    c.cam.path([[0, [0, 1.2, 13], [0, 3.2, 0], 44], [c.T, [0, 1.1, 12], [0, 3.6, 0], 42]], E.sine);
    c.ov.title('What if you were', 'The only poor kid', 0.0, c.T, { size: 104, blur: 8 });
    c.ov.zoomIn(0.3);
  }, { sfx: [[0, 'title_hit', -2], [0.05, 'whoosh_big', -6]] });

  // ---------- L11: 6 AM, mom leaves for her shift ----------
  S('L11', 'apartment:dawn', (c) => {
    const mom = c.actor('mom').place(1.8, 1.2, -0.8); mom.expr('happy');
    const k = c.actor('kid'); seat(k, -0.85, -0.55, Math.PI * 0.25 + Math.PI * 0.5 + Math.PI, 0.53, 'sitSad'); k.expr('sleepy');
    k.root.rotation.y = Math.atan2(0.85, 0.85);
    c.cam.path([[0, [-2.6, 2.6, 3.6], [0, 1.0, -0.2], 44], [c.T, [-2.1, 2.3, 3.0], [0, 1.0, -0.2], 42]], E.sine);
    c.ov.title('Day one', '6:00 AM', 0.1, 2.4, { size: 120, blur: 6 });
    c.ov.icon(k, 'zzz', 0.6, c.at('L11:your') + 1.0, { dx: 60 });
    return (t) => { walk(mom, t, c.at('L11:your'), c.at('L11:your') + 2.2, [1.8, 1.2], [0.4, 0.2], { rate: 7 }); mom.state.look = [0, 0]; if (t < c.at('L11:your')) mom.root.rotation.y = -1.6; };
  }, { sfx: [[0, 'amb_morning', -16], [0.1, 'alarm_beep', -8], [0.1, 'title_hit_soft', -8], ['L11:your', 'keys_jingle', -10]] });

  S('L11:she', 'apartment:dawn', (c) => {
    const mom = c.actor('mom').place(0.25, 0.15, -2.2); mom.expr('loving');
    const k = c.actor('kid'); seat(k, -0.85, -0.55, Math.atan2(0.85, 0.85), 0.53, 'sitIdle'); k.expr('sleepy');
    const bag = c.prop('paperBag'); c.hold(mom, bag, 1); bag.obj.position.set(0, -0.1, 0.06);
    c.cam.path([[0, [0.9, 1.5, 1.8], [-0.4, 1.4, -0.4], 36], [c.T, [0.7, 1.45, 1.4], [-0.4, 1.4, -0.4], 34]], E.sine);
    c.ov.icon(k, 'heart', 0.6, 1.8, { dx: 70, size: 0.8 });
    return (t) => {
      const kiss = pulse(t, 0.25, 1.0); mom.body.rotation.x = kiss * 0.35; mom.root.rotation.y = -2.3;
      const give = clamp((t - c.at('L11:hands') + 0.2) / 0.5); mom.pose('idle', 'give', give); k.pose('sitIdle', 'holdOne', clamp((t - c.at('L11:hands') - 0.3) / 0.4));
      if (t > c.at('L11:hands') + 0.5 && bag.obj.parent !== k.arms[1].grip) { k.arms[1].grip.add(bag.obj); bag.obj.position.set(0, -0.1, 0.05); }
      if (t > 0.8) k.expr('content');
    };
  }, { sfx: [[0.55, 'kiss', -6], ['L11:hands', 'paper_bag', -6]] });

  S('L11:peanut', 'apartment:dawn', (c) => {
    const mom = c.actor('mom').place(0.9, 0.0, -1.0); mom.expr('happy'); mom.pose('point');
    const sw = c.prop('sandwich'); sw.obj.position.set(-0.1, 0.99, 0.35); sw.obj.scale.setScalar(1.6);
    const plate = c.prop('plate'); plate.obj.position.set(-0.1, 0.97, 0.35);
    c.cam.path([[0, [-0.1, 1.55, 1.25], [-0.1, 1.0, 0.35], 34], [c.T, [-0.1, 1.45, 1.0], [-0.1, 1.0, 0.35], 32]], E.sine);
    c.ov.bubble(mom, 'Cut diagonal. Just how you like it.', c.at('L11:cut') - 0.1, c.T, { pos: [1500, 420] });
    c.ov.tag(new THREE.Vector3(-0.1, 1.08, 0.35), 'Cut diagonal', c.at('L11:cut'), c.T, { dx: -300, dy: -160 });
    return (t) => { sw.halves[0].position.x = 0.02 + tw(t, c.at('L11:cut'), c.at('L11:cut') + 0.5, 0, 0.06); sw.halves[1].position.x = -0.02 - tw(t, c.at('L11:cut'), c.at('L11:cut') + 0.5, 0, 0.06); talk(mom, t, [[0, c.T]]); };
  }, { sfx: [['L11:cut', 'knife_cut', -6], ['L11:cut', 'sparkle', -14]] });

  // ---------- L12: the donated blazer ----------
  S('L12', 'void', (c) => {
    const bin = new THREE.Group(); const box_ = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 1.2), new THREE.MeshStandardMaterial({ color: '#7a8cc9', roughness: 0.7 })); box_.position.y = 0.7; bin.add(box_);
    c.scene.add(bin); c.onExit = () => c.scene.remove(bin); bin.position.set(-1.6, 0, -0.5);
    const k = c.actor('kid').place(0.6, 0, -0.2); k.expr('surprised');
    c.cam.path([[0, [0, 1.7, 6], [-0.4, 1.2, 0], 38], [c.T, [0, 1.6, 5.2], [-0.2, 1.2, 0], 36]], E.sine);
    c.ov.pill('Donation bin', 0.2, c.at('L12:the#2'), { at3d: new THREE.Vector3(-1.6, 1.8, -0.5) });
    c.ov.tag(() => k.torso.localToWorld(new THREE.Vector3(0.2, 0.3, 0.2)), '2 sizes too big', c.at('L12:the#2'), c.T, { dx: 220, dy: -160 });
    return (t) => { const pop = E.back(clamp(t / 0.5)); k.root.scale.setScalar(0.98 * pop + 0.02); k.state.bounce = (1 - pop) * 1.2; if (t > c.at('L12:the#2')) k.expr('deadpan'); };
  }, { sfx: [[0, 'pop', -6], [0.1, 'cloth_flap', -8], ['L12:the#2', 'boing', -10]] });

  S('L12:sleeves', 'void', (c) => {
    const k = c.actor('kid').place(0, 0, 0); k.expr('worried');
    c.cam.path([[0, [0, 1.3, 3.2], [0, 1.0, 0], 36], [c.T, [0, 1.3, 2.8], [0, 1.0, 0], 34]], E.sine);
    return (t) => { k.state.armFn = (i) => [Math.sin(t * 9 + i * 1.6) * 0.5 + 0.4, Math.cos(t * 7 + i) * 0.3 + 0.4, 0.3]; };
  }, { sfx: [[0, 'cloth_flap', -8], [0.5, 'cloth_flap', -10], [1.0, 'cloth_flap', -10]] });

  S('L12:look', 'void', (c) => {
    const k = c.actor('kid').place(0, 0, 0); k.expr('determined'); k.pose('hips');
    const bc = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.32, 0.1), new THREE.MeshStandardMaterial({ color: '#5a3420', roughness: 0.5 })); c.hold(k, { obj: bc }, 1); bc.position.set(0, -0.2, 0);
    c.cam.path([[0, [0, 1.45, 4.6], [0, 1.2, 0], 36], [c.T, [0, 1.5, 5.2], [0, 1.25, 0], 36]], E.sine);
    c.ov.pill('Job interview energy', 0.4, c.T, { y: 140 });
    return (t) => { k.pose('hips', 'holdOne', 0.5); k.state.look = [0, -0.1]; };
  }, { sfx: [[0.4, 'ding_soft', -10]] });

  S('L13', 'void', (c) => {
    const k = c.actor('kid').place(0, 0, 0); k.expr('content');
    c.cam.at([0.4, 1.6, 4.2], [0.1, 1.4, 0], 34);
    return (t) => { k.pose('idle', 'shrug', pulse(t, 0.0, Math.max(0.8, c.T))); };
  }, { sfx: [[0.05, 'shrug_whoosh', -10]] });

  // ---------- L14: two buses ----------
  S('L14', 'street', (c) => {
    const bus = c.prop('bus'); bus.obj.rotation.y = Math.PI / 2;
    const k = c.actor('kid').place(1.5, -4.3, Math.PI); k.expr('neutral');
    const bag = c.prop('paperBag'); c.hold(k, bag, 1); bag.obj.position.set(0, -0.1, 0.05);
    c.cam.path([[0, [-6, 1.8, 6], [0, 1.6, -2], 44], [c.T, [-5, 1.8, 5], [1, 1.6, -2], 42]], E.sine);
    c.ov.pill('Bus #1', 0.6, c.T, { y: 110 });
    return (t) => { const x = kf(t, [[0, -22], [1.6, 1.0, E.out]]); bus.obj.position.set(x, 0, -1.4); bus.wheels.forEach(w => w.rotation.x = x); walk(k, t, 1.8, 3.0, [1.5, -4.3], [2.6, -3.0], { rate: 7 }); k.pose('holdOne'); };
  }, { sfx: [[0, 'bus_arrive', -4], [1.7, 'bus_door', -6]] });

  S('L14:two#2', 'busInterior', (c) => {
    const k = c.actor('kid'); seat(k, -0.75, -2.0, Math.PI, 0.6, 'sitIdle'); k.expr('deadpan'); k.state.look = [-0.6, 0];
    const bag = c.prop('paperBag'); bag.obj.position.set(-0.75, 0.62, -2.35);
    c.cam.at([0.6, 1.3, -3.6], [-0.75, 1.3, -2.0], 40);
    c.ov.pill('Bus #2', 0.1, c.T, { y: 110 });
    c.ov.corner('7:12 AM', 0.1, c.T);
    return (t) => { c.cam.shake = 0.02; k.state.yOff = Math.abs(Math.sin(t * 9)) * 0.008; };
  }, { sfx: [[0, 'bus_interior', -8]] });

  // ---------- L15: half a mile from the gate ----------
  S('L15', 'avenue', (c) => {
    const bus = c.prop('bus'); bus.obj.rotation.y = -Math.PI / 2;
    const k = c.actor('kid').place(0, -5.4, Math.PI / 2); k.expr('deadpan');
    c.cam.path([[0, [-6, 2.0, 2.5], [2, 1.8, -5], 42], [c.T, [-4.5, 2.4, 3.5], [6, 2.4, -6], 40]], E.sine);
    c.ov.tag(new THREE.Vector3(60, 12, -50), 'School gate: 0.5 miles', 1.2, c.T, { dx: -360, dy: 120 });
    return (t) => { const x = kf(t, [[0, 2], [2.5, -30, E.in]]); bus.obj.position.set(x, 0, -1.4); bus.wheels.forEach(w => w.rotation.x = -x); };
  }, { sfx: [[0, 'bus_leave', -4]] });

  S('L15:because', 'schoolExt', (c) => {
    const sgn = new THREE.Group(); const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.6), new THREE.MeshStandardMaterial({ color: '#9aa0b8' })); post.position.y = 1.3; sgn.add(post);
    const cv = document.createElement('canvas'); cv.width = 512; cv.height = 512; const g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 512, 512); g.strokeStyle = '#e11d48'; g.lineWidth = 40; g.beginPath(); g.arc(256, 210, 150, 0, 7); g.stroke(); g.font = '150px "Noto Color Emoji"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('\u{1F68C}', 256, 215); g.beginPath(); g.moveTo(150, 105); g.lineTo(362, 315); g.stroke(); g.fillStyle = '#1d2a6b'; g.font = 'bold 54px "Baloo 2"'; g.fillText('NO CITY BUSES', 256, 440);
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; const face = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), new THREE.MeshStandardMaterial({ map: tex })); face.position.y = 2.6; sgn.add(face);
    sgn.position.set(-3.2, 0, 4); c.scene.add(sgn); c.onExit = () => c.scene.remove(sgn);
    c.cam.path([[0, [-1.6, 2.2, 8], [-3.2, 2.4, 4], 34], [c.T, [-1.9, 2.4, 7.2], [-3.2, 2.5, 4], 32]], E.sine);
    c.ov.pop('NOT ALLOWED', c.at('L15:allowed'), c.T, { y: 220, size: 100, colors: ['#ff8fb3', '#ff2f6d'], rot: 0.05 });
  }, { sfx: [['L15:allowed', 'buzzer', -8]] });

  // ---------- L16: walking past limos and a supercar ----------
  S('L16', 'avenue', (c) => {
    const k = c.actor('kid').place(0, -5.5, Math.PI / 2); k.expr('neutral');
    const l1 = c.prop('limo', 0), l2 = c.prop('limo', 1), sc = c.prop('sportsCar');
    [l1, l2, sc].forEach(v => { v.obj.rotation.y = Math.PI / 2; });
    const tL1 = c.at('L16:past') - 1.6, tL2 = c.at('L16:then') - 1.4, tC = c.at('L16:car') - 1.0;
    c.cam.fn = (t) => { const x = k.root.position.x; return { p: [x - 1.0, 1.45, 3.4], l: [x + 0.8, 1.35, -5.5], fov: 44 }; };
    c.ov.tag(() => sc.obj.localToWorld(new THREE.Vector3(0, 1.3, 0)), '$3,000,000', c.at('L16:car') + 0.2, c.T, { dx: 120, dy: -130 });
    return (t) => {
      walk(k, t, 0, c.T, [0, -5.5], [5.5, -5.5], { rate: 7.5 });
      l1.obj.position.set(-25 + (t - tL1) * 16, 0, -1.6); l2.obj.position.set(-25 + (t - tL2) * 16, 0, -1.6); sc.obj.position.set(-40 + (t - tC) * 34, 0, -1.6);
      [l1, l2, sc].forEach(v => v.wheels.forEach(w => w.rotation.x = v.obj.position.x * 2));
      const near = [l1, l2, sc].map(v => v.obj.position.x).filter(x => Math.abs(x - k.root.position.x) < 8)[0];
      k.state.look = near !== undefined ? [clamp((near - k.root.position.x) * -0.12, -1.2, 1.2) + 1.0, 0] : [0, 0];
      if (t > c.at('L16:car')) k.expr('awe');
    };
  }, { sfx: [['L16:past', 'car_pass', -6], ['L16:then', 'car_pass', -6], ['L16:car', 'supercar_pass', -2]] });

  // ---------- L17-22: the security guard ----------
  S('L17', 'schoolExt', (c) => {
    const k = c.actor('kid').place(0.3, 4.2, Math.PI); k.expr('happy');
    const gd = c.actor('guard').place(0.8, 1.6, 0); gd.expr('deadpan');
    c.cam.path([[0, [3.4, 1.8, 7.6], [0.5, 1.9, 2.6], 40], [c.T, [3.0, 1.9, 7.0], [0.5, 2.0, 2.6], 38]], E.sine);
    c.ov.bubble(gd, 'Deliveries go around the back.', c.at('L17:deliveries') - 0.1, c.T, { side: 1 });
    return (t) => { walk(k, t, 0, 1.0, [0.3, 5.6], [0.3, 4.2], { rate: 7 }); walk(gd, t, 0.2, 1.0, [-0.6, 1.0], [0.6, 2.6], { rate: 6 }); gd.pose('idle', 'point', clamp((t - 0.9) / 0.3)); talk(gd, t, [[c.at('L17:deliveries'), c.T]]); if (t > 1.2) gd.root.rotation.y = 0.1; };
  }, { sfx: [[0.3, 'footsteps_boot', -10], [0.9, 'stop_whistle', -12]] });

  S('L18', 'schoolExt', (c) => {
    const k = c.actor('kid').place(0.3, 4.2, Math.PI); k.expr('confused');
    c.cam.path([[0, [0.0, 1.62, 1.9], [0.3, 1.6, 4.2], 32], [c.T, [0.05, 1.62, 2.3], [0.3, 1.6, 4.2], 30]], E.sine);
    c.ov.bubble(k, 'I... go here.', c.at('L18:i') - 0.1, c.T, { side: -1 });
    return (t) => { k.state.blink = false; const b = t > 0.1 && t < 0.25 || t > 0.4 && t < 0.52; k.expr(b ? 'sleepy' : 'confused'); talk(k, t, [[c.at('L18:i'), c.T - 0.2]]); };
  }, { sfx: [[0.1, 'blink', -6], [0.4, 'blink', -6]] });

  S('L19', 'schoolExt', (c) => {
    const gd = c.actor('guard').place(0.6, 2.6, 0.05); gd.expr('deadpan');
    c.cam.path([[0, [0.35, 2.2, 4.9], [0.6, 2.08, 2.6], 32], [c.T, [0.4, 2.2, 4.6], [0.6, 2.08, 2.6], 30]], E.sine);
    return (t) => { gd.sunglasses.position.y = -tw(t, 0.1, 0.45, 0, 0.09); gd.state.look = [0, 0.3]; };
  }, { sfx: [[0.1, 'glasses_slide', -6]] });

  S('L19:your', 'schoolExt', (c) => {
    const k = c.actor('kid').place(0.3, 4.2, Math.PI); k.expr('worried');
    c.cam.path([[0, [0.6, 0.35, 2.9], [0.3, 0.1, 4.2], 34], [c.T, [0.7, 0.3, 3.2], [0.3, 0.05, 4.2], 30]], E.sine);
    c.ov.tag(() => k.legs[0].knee.localToWorld(new THREE.Vector3(0, -0.36, 0.08)), 'Worn-out sneakers', 0.15, c.T, { dx: 220, dy: -140 });
  }, { sfx: [[0.05, 'whoosh_soft', -12], [0.15, 'ding_soft', -10]] });

  S('L19:he#2', 'schoolExt', (c) => {
    const k = c.actor('kid').place(0.3, 4.2, Math.PI); k.expr('worried');
    c.cam.path([[0, [0.9, 1.5, 6.6], [0.3, 1.2, 4.2], 34], [c.T, [0.8, 1.45, 6.2], [0.3, 1.2, 4.2], 32]], E.sine);
    c.ov.tag(() => k.backpack.localToWorld(new THREE.Vector3(0, 0.15, -0.1)), 'Hand-me-down backpack', 0.15, c.T, { dx: 220, dy: -140 });
  }, { sfx: [[0.05, 'whoosh_soft', -12], [0.15, 'ding_soft', -10]] });

  S('L19:he#3', 'schoolExt', (c) => {
    const k = c.actor('kid').place(0.3, 4.2, Math.PI); k.expr('worried');
    c.cam.path([[0, [0.75, 1.25, 5.3], [0.34, 1.12, 4.4], 30], [c.T, [0.62, 1.2, 5.0], [0.34, 1.12, 4.4], 26]], E.sine);
    c.ov.tag(() => k.backpack.localToWorld(new THREE.Vector3(0.04, 0.06, -0.1)), 'The safety pin', 0.25, c.T, { dx: 240, dy: -120 });
  }, { sfx: [[0.05, 'whoosh_soft', -12], [0.25, 'dun_dun', -6]] });

  S('L20', 'schoolExt', (c) => {
    const gd = c.actor('guard').place(0.6, 2.6, 0.05); gd.expr('confused'); gd.pose('holdFront');
    const cb = c.prop('clipboard'); c.hold(gd, cb, 1); cb.obj.rotation.x = -1.0;
    c.cam.path([[0, [2.2, 2.3, 5.2], [0.6, 2.0, 2.6], 36], [c.T, [2.0, 2.3, 4.8], [0.6, 2.0, 2.6], 34]], E.sine);
    const t3 = c.at('L20:three');
    ['1', '2', '3'].forEach((n, i) => c.ov.pop(n, t3 - 0.6 + i * 0.35, c.T, { x: 1350 + i * 120, y: 320, size: 110, colors: ['#fff27a', '#ffb23b'], rot: (i - 1) * 0.1 }));
    return (t) => { gd.pose('holdFront'); gd.state.look = [0, 0.4 + Math.sin(t * 6) * 0.05]; cb.obj.rotation.z = Math.sin(t * 8) * 0.1; };
  }, { sfx: [[0.2, 'paper_flip', -8], ['L20:three-0.6', 'pop', -8], ['L20:three-0.25', 'pop', -6], ['L20:three+0.1', 'pop', -4]] });

  S('L21', 'schoolExt', (c) => {
    const gd = c.actor('guard').place(0.6, 2.6, 0.05); gd.expr('deadpan');
    const k = c.actor('kid').place(0.3, 4.4, Math.PI); k.expr('nervous');
    c.cam.path([[0, [3.8, 1.9, 6.8], [0.6, 1.9, 2.8], 40], [c.T, [3.4, 1.9, 6.4], [0.6, 1.9, 2.8], 38]], E.sine);
    c.ov.bubble(gd, 'Huh. Welcome to Goldcrest.', 0.05, c.T, { side: 1 });
    return (t) => { talk(gd, t, [[0.05, c.T - 0.3]]); walk(gd, t, 0.8, 1.8, [0.6, 2.6], [2.2, 2.4], { rate: 6 }); if (t > 1.8) gd.face(0.3, 4.4); };
  }, { sfx: [[0.8, 'footsteps_boot', -12]] });

  S('L22', 'schoolExt', (c) => {
    const k = c.actor('kid'); k.expr('deadpan');
    c.cam.at([0, 1.7, 5.6], [0, 1.6, 0], 36);
    return (t) => { walk(k, t, 0, c.T + 0.6, [0, 3.6], [0, 0.5], { rate: 7 }); k.root.rotation.y = Math.PI; k.state.look = [0, 0]; k.pose('relaxed'); };
  }, { sfx: [[0.1, 'sad_trombone', -6]] });

  // ---------- L23-34: history class ----------
  const CLASS = (c, skip = []) => {
    // 24 desks: rows r=0..3 (front to back), cols 0..5; seat at (x, z+0.75), facing -z
    const roster = { '0,2': 'islandGirl', '0,3': 'spaceBoy', '3,2': 'kid', '2,4': 'preston' };
    const out = {}; let n = 0;
    for (let r = 0; r < 4; r++) for (let col = 0; col < 6; col++) {
      const key = r + ',' + col; const name = roster[key] || ('ex' + (n++));
      if (skip.includes(name)) continue;
      const a = c.actor(name); seat(a, -5 + col * 2, -2.6 + r * 2.1 + 0.75, Math.PI, 0.53, 'sitIdle'); out[name] = a; a.expr(['neutral', 'bored', 'smug', 'happy'][(r * 6 + col) % 4]);
    }
    return out;
  };

  S('L23', 'classroom', (c) => {
    const st = CLASS(c); const tch = c.actor('teacher').place(2.2, -5.2, 0.15); tch.expr('happy'); tch.pose('point');
    st.kid.expr('nervous');
    c.cam.path([[0, [6.5, 3.6, 5.8], [-0.5, 1.2, -1.5], 44], [c.T, [5.4, 3.2, 4.6], [-0.5, 1.2, -1.6], 42]], E.sine);
    c.ov.corner('1st period · History', 0.1, c.T);
    return (t) => { talk(tch, t, [[c.at('L23:the'), c.T]]); };
  }, { sfx: [[0, 'amb_classroom', -16], [0, 'school_bell', -10]] });

  S('L24', 'classroom', (c) => {
    const st = CLASS(c); const g = st.islandGirl; g.expr('smug');
    c.cam.path([[0, [-2.2, 1.8, -4.0], [-1, 1.35, -1.85], 34], [c.T, [-2.0, 1.75, -3.6], [-1, 1.35, -1.85], 32]], E.sine);
    return (t) => { talk(g, t, [[c.at('L24:my'), c.T]]); g.pose('sitIdle', 'shrug', pulse(t, c.at('L24:it') - 0.2, 1.2) * 0.8); g.state.tilt = 0.12; };
  });

  S('L24:my', 'island', (c) => {
    c.cam.path([[0, [-12, 9, 16], [0, 1, 0], 40], [c.T, [-6, 6, 12], [0.5, 1, 0], 40]], E.sine);
    c.ov.pill('My island', 0.2, c.T, { y: 110 });
    c.ov.tag(new THREE.Vector3(3.2, 0.4, 2), 'Only one beach', c.at('L24:only') - 0.2, c.T, { dx: 140, dy: -160 });
  }, { sfx: [[0, 'amb_ocean', -12], [0, 'seagull', -14]] });

  S('L24:like', 'classroom', (c) => {
    const st = CLASS(c); const g = st.islandGirl; g.expr('bored');
    c.cam.at([-1.4, 1.75, -3.6], [-1, 1.4, -1.85], 30);
    return (t) => { talk(g, t, [[0, c.T - 0.2]]); g.pose('sitIdle', 'shrug', 0.7); };
  });

  S('L25', 'classroom', (c) => {
    const st = CLASS(c); const b = st.spaceBoy; b.expr('bored');
    c.cam.path([[0, [2.4, 1.8, -4.0], [1, 1.35, -1.85], 34], [c.T, [2.2, 1.75, -3.6], [1, 1.35, -1.85], 32]], E.sine);
    return (t) => { b.state.look = [0, pulse(t, 0.2, 0.6) * 0.3]; talk(b, t, [[c.at('L25:we'), c.T]]); };
  });

  S('L25:we', 'edgeSpace', (c) => {
    c.cam.path([[0, [4, 2.6, 7], [0, 1.4, 0], 40], [c.T, [2.5, 2.0, 5.5], [0, 1.3, 0], 38]], E.sine);
    c.ov.pill('The edge of space', c.at('L25:edge') - 0.3, c.T, { y: 110 });
    return (t) => { c.set.parts.cap.obj.rotation.y = t * 0.3; c.set.parts.cap.obj.position.y = 0.5 + Math.sin(t) * 0.1; };
  }, { sfx: [[0, 'space_drone', -10], [0, 'rocket_rumble', -14]] });

  S('L25:it', 'classroom', (c) => {
    const st = CLASS(c); const b = st.spaceBoy; b.expr('bored');
    c.cam.at([1.45, 1.52, -3.6], [1, 1.38, -1.85], 32);
    c.ov.bubble(b, 'It was mid.', 0.05, c.T, { side: 1 });
    return (t) => { talk(b, t, [[0, c.T - 0.2]]); b.pose('sitIdle', 'shrug', 0.5); };
  });

  S('L26', 'classroom', (c) => {
    const st = CLASS(c); const k = st.kid; k.expr('shocked');
    c.cam.path([[0, [-1.0, 1.65, 2.5], [-1, 1.4, 4.45], 32]], E.sine);
    c.cam.punch(c.at('L26:space') - 0.05, 0.8, 0.15);
    c.ov.pop('SPACE?!', c.at('L26:space'), c.T, { y: 260, size: 140 });
    c.ov.pop('...MID?!', c.at('L26:mid#2') - 0.1, c.T, { y: 430, x: 1300, size: 90, colors: ['#9df2ff', '#3fb6e8'], rot: 0.08 });
    return (t) => { k.expr(t > c.at('L26:space') ? 'dizzy' : 'shocked'); };
  }, { sfx: [['L26:space', 'boing_shock', -6], ['L26:mid#2', 'record_scratch', -8]] });

  S('L27', 'classroom', (c) => {
    const st = CLASS(c); const tch = c.actor('teacher').place(1.0, -5.0, 0); tch.expr('happy');
    c.cam.path([[0, [0.2, 2.4, 0.5], [1.0, 2.0, -5], 36], [c.T, [0.4, 2.3, -0.5], [1.0, 2.0, -5], 34]], E.sine);
    c.ov.bubble(tch, 'And you?', c.at('L27:and') - 0.1, c.T, { side: 1 });
    return (t) => { tch.pose('idle', 'point', clamp((t - c.at('L27:and') + 0.4) / 0.3)); talk(tch, t, [[c.at('L27:and'), c.T - 0.1]]); lookAtPt(tch, -1, 4.45); };
  });

  S('L28', 'classroom', (c) => {
    const st = CLASS(c); const k = st.kid;
    c.cam.at([-1, 1.85, 4.9], [-1, 1.3, -2], 50);
    const names = Object.keys(st).filter(n => n !== 'kid');
    return (t) => { st.kid.root.visible = false; names.forEach((n, i) => { const a = st[n]; const d = (Math.abs(a.root.position.x + 1) + (4.5 - a.root.position.z)) * 0.06; const k1 = E.back(clamp((t - 0.1 - d) / 0.35)); a.root.rotation.y = Math.PI + k1 * Math.PI * (a.root.position.x > -1 ? -1 : 1) * 0.95; a.expr('blank'); }); };
  }, { sfx: [[0.1, 'whoosh_multi', -6], [0.4, 'chair_creak', -10]] });

  S('L29', 'classroom', (c) => {
    const st = CLASS(c); const k = st.kid; k.expr('thinking');
    c.cam.path([[0, [-0.4, 1.6, 2.6], [-1, 1.4, 4.45], 34], [c.T, [-0.5, 1.6, 2.9], [-1, 1.45, 4.45], 32]], E.sine);
    return (t) => { k.pose('sitIdle', 'chin', 0.8); };
  }, { sfx: [[0, 'thought_chime', -10]] });

  S('L29:working', 'carwash', (c) => {
    const car = c.prop('carwashCar'); car.obj.position.set(0, 0, 0);
    const k = c.actor('kidHome').place(1.6, 0.6, -Math.PI / 2); k.expr('determined'); k.pose('wash');
    const sp = c.prop('sponge'); c.hold(k, sp, 1);
    const bub = c.prop('bubbles'); bub.obj.position.set(0.3, 0.6, -0.2); bub.obj.scale.setScalar(0.5);
    c.cam.path([[0, [2.6, 1.6, 3.0], [1.1, 1.15, 0.4], 42], [c.T, [2.4, 1.55, 2.7], [1.1, 1.15, 0.4], 40]], E.sine);
    c.ov.custom(0, c.T, (g) => { g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 14; g.setLineDash([2, 22]); g.lineCap = 'round'; g.strokeRect(40, 40, 1840, 1000); }, 0);
    return (t) => { k.state.armFn = (i) => i === 1 ? [Math.sin(t * 9) * 0.3, Math.cos(t * 9) * 0.25, 0] : null; bub.amount = 0.6; };
  }, { sfx: [[0, 'scrub', -6], [0, 'water_spray', -14]] });

  S('L29:babysitting', 'void', (c) => {
    const k = c.actor('kidHome').place(0, 0, 0.4); k.expr('nervous');
    const bro = c.actor('bro').place(0, 0, 0); bro.expr('joy');
    c.cam.at([0, 1.8, 5.2], [0, 1.3, 0], 38);
    return (t) => { bro.root.position.set(0, 1.42, -0.35); bro.pose('cheer'); bro.state.legsOut = true; bro.state.bounce = Math.abs(Math.sin(t * 8)) * 0.08; k.pose('handsHead'); k.state.tremble = 0.5; bro.state.noShadow = true; };
  }, { sfx: [[0, 'kid_giggle', -8]] });

  S('L29:eating', 'apartment:night', (c) => {
    const k = c.actor('kidHome'); seat(k, -0.85, -0.55, Math.atan2(0.85, 0.85), 0.53, 'eat'); k.expr('chew');
    const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.18, 20, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#7ad3ff', side: THREE.DoubleSide })); bowl.position.set(-0.55, 1.15, -0.25); c.scene.add(bowl); c.onExit = () => c.scene.remove(bowl);
    c.cam.path([[0, [0.6, 1.8, 1.6], [-0.6, 1.2, -0.4], 36], [c.T, [0.4, 1.7, 1.3], [-0.6, 1.2, -0.4], 34]], E.sine);
    c.ov.pop('x2', c.at('L29:twice'), c.T, { x: 1380, y: 360, size: 140, colors: ['#fff27a', '#ffb23b'] });
    return (t) => { k.state.chew = true; };
  }, { sfx: [[0, 'cereal_crunch', -6], ['L29:twice', 'pop', -4]] });

  S('L30', 'classroom', (c) => {
    const st = CLASS(c); const k = st.kid; k.expr('nervous');
    c.cam.path([[0, [-1.0, 1.55, 2.4], [-1, 1.4, 4.45], 32], [c.T, [-1.0, 1.55, 2.7], [-1, 1.4, 4.45], 30]], E.sine);
    c.ov.bubble(k, 'I... worked at a car wash.', 0.05, c.T, { side: 1 });
    return (t) => { talk(k, t, [[0.05, c.T - 0.2]]); };
  });

  S('L31', 'classroom', (c) => {
    const st = CLASS(c); Object.values(st).forEach(a => { if (a.name !== 'kid') { a.root.rotation.y = Math.PI * 2 * 0.98; a.expr('blank'); } });
    st.kid.expr('nervous');
    c.cam.path([[0, [5.5, 3.2, -5.6], [-1, 1.2, 2], 46], [c.T, [4.8, 3.0, -5.0], [-1, 1.2, 2.2], 44]], E.lin);
    c.ov.custom(0, c.T, (g, lt) => { g.font = '800 54px "Baloo 2"'; g.fillStyle = 'rgba(255,255,255,0.75)'; g.textAlign = 'center'; g.fillText('*cricket*', 1500 + Math.sin(lt * 3) * 10, 220); });
  }, { sfx: [[0, 'crickets', -6], [0, 'room_tone', -10]] });

  S('L32', 'classroom', (c) => {
    const st = CLASS(c); const a = st.ex12, b = st.ex13; a.expr('confused'); b.expr('shocked');
    const ax = a.root.position.x, az = a.root.position.z;
    c.cam.path([[0, [ax + 1.2, 1.65, az - 1.8], [ax + 1, 1.35, az], 32], [c.T, [ax + 1.0, 1.65, az - 1.6], [ax + 1, 1.35, az], 30]], E.sine);
    c.ov.bubble(a, 'Wait... like, you OWNED it?', c.at('L32:wait') - 0.1, c.T, { size: 30, side: -1 });
    return (t) => { a.root.rotation.y = Math.PI - 0.6; a.pose('sitIdle', 'mouthCover', 0.8); b.root.rotation.y = Math.PI + 0.6; talk(a, t, [[c.at('L32:wait'), c.T]]); };
  }, { sfx: [['L32:wait', 'whisper', -8]] });

  S('L33', 'classroom', (c) => {
    const st = CLASS(c); const k = st.kid; k.expr('deadpan');
    c.cam.at([-1.0, 1.55, 2.5], [-1, 1.4, 4.45], 32);
    c.ov.bubble(k, 'No. I washed the cars.', 0.05, c.T, { side: 1 });
    return (t) => { talk(k, t, [[0.05, c.T - 0.2]]); };
  });

  S('L34', 'void', (c) => {
    const moon = new THREE.Mesh(new THREE.SphereGeometry(2.4, 48, 32), new THREE.MeshStandardMaterial({ color: '#d9d4e8', roughness: 0.9 })); moon.position.set(0, -1.6, 0); c.scene.add(moon);
    const craters = []; for (let i = 0; i < 9; i++) { const cr = new THREE.Mesh(new THREE.CircleGeometry(0.25 + (i % 3) * 0.12, 20), new THREE.MeshStandardMaterial({ color: '#b6b0c8', roughness: 1 })); const a = i * 2.3, b = 0.4 + (i % 4) * 0.25; cr.position.set(Math.sin(a) * Math.sin(b) * 2.41, Math.cos(b) * 2.41 - 1.6, Math.cos(a) * Math.sin(b) * 2.41); cr.lookAt(0, -1.6, 0); cr.rotateY(Math.PI); craters.push(cr); c.scene.add(cr); }
    c.onExit = () => { c.scene.remove(moon); craters.forEach(x => c.scene.remove(x)); };
    const k = c.actor('kid').place(0, 0, 0); k.root.position.y = 0.8; k.state.groundY = 0.8; k.expr('happy'); k.pose('wave');
    c.cam.path([[0, [0, 2.4, 7.5], [0, 1.4, 0], 40], [c.T, [0, 2.2, 6.4], [0, 1.4, 0], 38]], E.sine);
    c.ov.pill('Live on the moon?', 0.3, c.T, { y: 110 });
    return (t) => { k.state.armFn = (i) => i === 1 ? [Math.sin(t * 8) * 0.3, 0, 0] : null; moon.rotation.y = t * 0.1; k.state.noShadow = true; };
  }, { sfx: [[0, 'space_whoosh', -8], [0.3, 'boing', -12]] });
}

'use strict';
const TESTS = {
  props() {
    const ids = Object.keys(PROPS); const els = [];
    const extra = { house: { sale: 1 }, doc: {}, bubble: { text: 'Maybe\nlater!' }, board: { text: 'Rate lock', write: false }, zig: { reveal: 1 }, arrow: { reveal: 1 }, apartment: { label: 'RENT CONTROLLED' }, cage: { inner: 'house' }, ballchain: { house: 1 }, ticket: { sub: '$82,000' }, pct: {}, lock: {}, heart: { broken: 1 } };
    ids.forEach((id, i) => {
      const col = i % 10, row = Math.floor(i / 10);
      els.push(prop(id, Object.assign({ x: 96 + col * 192, y: 120 + row * 175, s: id === 'board' || id === 'zig' || id === 'capitol' || id === 'ship' || id === 'kitchen' ? 0.22 : 0.4, enter: 'none' }, extra[id] || {})));
      els.push((ctx) => txt(ctx, id, 96 + col * 192, 196 + row * 175, { size: 18, font: 'sans' }));
    });
    return [{ start: 0, end: 100, els, cam: { z0: 1, z1: 1 } }];
  },
  ui() {
    const els = [
      card({ x: 520, y: 330, s: 0.8, src: 'ICE MORTGAGE MONITOR', tag: 'Report', title: 'Homeowners sit on record $17.5 trillion in equity', body: ['American mortgage holders now hold a record amount of tappable and total home equity, according to the latest data.', '2.4 million mortgage holders have at least $1 million in equity in their homes.'], hl: [{ p: 1, at: 0.2, d: 0.6 }], enter: 'none' }),
      bars({ x: 1400, y: 330, s: 0.7, items: [{ label: 'Normal', v: 5.25, txt: '5-5.5M', c: COL.green }, { label: 'Now', v: 3.75, txt: '3.75M', c: COL.red }] }),
      icons({ x: 520, y: 820, n: 5, k: 4, icon: 'house', size: 0.5, gap: 170 }),
      stackbar({ x: 1400, y: 800, s: 0.55, segs: [{ v: 27.6, c: '#e0a030', label: 'Repairs', txt: '$27.6K' }, { v: 27.4, c: COL.blue, label: 'Commission', txt: '$27.4K' }, { v: 11, c: COL.purple, label: 'Closing', txt: '$11K' }, { v: 10, c: COL.teal, label: 'Concessions', txt: '$10K' }] }),
      big('3.75M', { x: 960, y: 560, enter: 'none' }),
    ];
    return [{ start: 0, end: 100, els, cam: { z0: 1, z1: 1 } }];
  },
  cast() {
    const ids = Object.keys(CAST); const els = [];
    const faces = ['smile', 'grin', 'laugh', 'flat', 'frown', 'o', 'O', 'worried', 'confused', 'smirk', 'angry', 'sad', 'cry', 'shock'];
    const poses = Object.keys(STICK_POSES);
    ids.forEach((id, i) => {
      const col = i % 10, row = Math.floor(i / 10);
      els.push(stick({ who: id, x: 96 + col * 192, y: 250 + row * 270, s: 0.42, enter: 'none', face: faces[i % faces.length], pose: poses[i % poses.length] }));
      els.push((ctx) => txt(ctx, id + ' ' + poses[i % poses.length], 96 + col * 192, 262 + row * 270, { size: 18, font: 'sans' }));
    });
    return [{ start: 0, end: 100, els, cam: { z0: 1, z1: 1 } }];
  },
  mascot() {
    const poses = ['rest', 'pointR', 'stickR', 'shrug', 'up', 'chin', 'facepalm', 'hips', 'wave', 'presentR', 'stickUL', 'hold'];
    const faces = ['neutral', 'happy', 'laugh', 'surprise', 'shock', 'sad', 'worried', 'confused', 'disgust', 'determined', 'smirk', 'serious'];
    const els = [];
    poses.forEach((p, i) => {
      const col = i % 6, row = Math.floor(i / 6);
      els.push(mascot({ x: 160 + col * 320, y: 520 + row * 540, s: 0.62, pose: p, face: faces[i] }));
      els.push((ctx) => txt(ctx, p + ' / ' + faces[i], 160 + col * 320, 530 + row * 540, { size: 26, font: 'sans' }));
    });
    return [{ start: 0, end: 100, els, cam: { z0: 1, z1: 1 } }];
  },
  faces() {
    const faces = ['neutral', 'happy', 'laugh', 'surprise', 'shock', 'sad', 'worried', 'confused', 'disgust', 'determined', 'smirk', 'serious'];
    const els = [];
    faces.forEach((f, i) => {
      const col = i % 6, row = Math.floor(i / 6);
      els.push(mascot({ x: 160 + col * 320, y: 1180 + row * 540, s: 1.25, face: f }));
      els.push((ctx) => { ctx.fillStyle = '#fff'; ctx.fillRect(col * 320, 470 + row * 540, 320, 70); txt(ctx, f, 160 + col * 320, 500 + row * 540, { size: 30, font: 'sans' }); });
    });
    return [{ start: 0, end: 100, els, cam: { z0: 1, z1: 1 } }];
  },
};

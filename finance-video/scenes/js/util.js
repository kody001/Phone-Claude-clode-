// Shared math, easing and deterministic randomness. Everything in the video is a pure
// function of time, so any frame can be rendered on its own by any worker.
'use strict';
const W = 1920, H = 1080, FPS = 60;

const U = {
  clamp: (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)),
  lerp: (a, b, k) => a + (b - a) * k,
  inv: (a, b, v) => (b === a ? 1 : (v - a) / (b - a)),
  prog(t, t0, dur) { return U.clamp((t - t0) / dur); },
  easeOutCubic: k => 1 - Math.pow(1 - k, 3),
  easeInCubic: k => k * k * k,
  easeInOut: k => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
  easeOutBack(k, s = 1.70158) { const c3 = s + 1; return 1 + c3 * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2); },
  easeOutElastic(k) { if (k <= 0) return 0; if (k >= 1) return 1; return Math.pow(2, -10 * k) * Math.sin((k * 10 - 0.75) * (2 * Math.PI) / 3) + 1; },
  hash(str) {
    let h = 2166136261 >>> 0;
    str = String(str);
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  },
  rng(seed) {
    let a = (typeof seed === 'number' ? seed : U.hash(seed)) >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  },
  // smooth 1-D value noise in [-1, 1]
  noise(seed, x) {
    const i = Math.floor(x), f = x - i;
    const a = U._hn(seed, i), b = U._hn(seed, i + 1);
    const s = f * f * (3 - 2 * f);
    return a + (b - a) * s;
  },
  _hn(seed, i) {
    let h = Math.imul((seed | 0) ^ Math.imul(i, 374761393), 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return (((h ^ (h >>> 16)) >>> 0) / 4294967295) * 2 - 1;
  },
  dist: (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay),
  angle: (ax, ay, bx, by) => Math.atan2(by - ay, bx - ax),
  pick(r, arr) { return arr[Math.floor(r() * arr.length) % arr.length]; },
};

const COL = {
  ink: '#1b1b1b',
  paper: '#ffffff',
  skin: '#f6cfa9',
  green: '#4f9a3a', greenDark: '#2f6b2a', cash: '#9ccc7c', cashDark: '#5f9a48',
  red: '#d6312b', redDark: '#9e1f1b',
  orange: '#f08a24', yellow: '#ffd94a', hl: 'rgba(255,226,64,0.85)', hlOrange: 'rgba(255,170,60,0.8)',
  hlPink: 'rgba(255,110,200,0.65)', hlTeal: 'rgba(60,220,190,0.6)',
  blue: '#3d7fc1', blueLight: '#a9cdee', sky: '#cfe6f7',
  brown: '#8a5a3c', brownDark: '#5e3b25', roof: '#b8402f', wall: '#f2d9a6',
  grey: '#6d747c', greyLight: '#c9ced3', greyDark: '#3f454b',
  chalk: '#2f6d3c', chalkFrame: '#6b4429',
  purple: '#7d4fb3', gold: '#e8b923', pink: '#f29bb5',
};

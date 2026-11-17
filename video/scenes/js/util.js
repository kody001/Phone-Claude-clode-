export function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) % 100000 / 100; }
export function rng(seed) { let s = Math.floor(seed * 9973) % 2147483647 || 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
const P = []; { const r = rng(12.34); for (let i = 0; i < 512; i++) P.push(r()); }
export function noise1(x) { const i = Math.floor(x), f = x - i; const a = P[((i % 512) + 512) % 512], b = P[(((i + 1) % 512) + 512) % 512]; const u = f * f * (3 - 2 * f); return a + (b - a) * u; }
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, k) => a + (b - a) * k;
export const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
export const E = {
  lin: x => clamp(x),
  in: x => { x = clamp(x); return x * x * x; },
  out: x => { x = clamp(x); return 1 - Math.pow(1 - x, 3); },
  io: x => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; },
  sine: x => { x = clamp(x); return -(Math.cos(Math.PI * x) - 1) / 2; },
  back: x => { x = clamp(x); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
  elastic: x => { x = clamp(x); if (x === 0 || x === 1) return x; return Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * (2 * Math.PI) / 3) + 1; },
  expo: x => { x = clamp(x); return x === 1 ? 1 : 1 - Math.pow(2, -10 * x); },
};
// tween value between t0 and t1
export function tw(t, t0, t1, a, b, ease = E.io) { const k = t1 === t0 ? (t >= t1 ? 1 : 0) : ease((t - t0) / (t1 - t0)); if (Array.isArray(a)) return a.map((v, i) => v + (b[i] - v) * k); return a + (b - a) * k; }
// keyframe sequence: [[t, value], ...]
export function kf(t, keys, ease = E.io) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) { const [t0, a] = keys[i], [t1, b] = keys[i + 1]; if (t <= t1) return tw(t, t0, t1, a, b, keys[i + 1][2] || ease); }
  return keys[keys.length - 1][1];
}
export const pulse = (t, t0, dur = 0.3) => { const x = (t - t0) / dur; return x < 0 || x > 1 ? 0 : Math.sin(Math.PI * x); };

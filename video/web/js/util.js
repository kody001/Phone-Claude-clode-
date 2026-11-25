// Shared math / easing / deterministic noise helpers. Everything is a pure function of time.
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const range = (t, a, b) => clamp((t - a) / (b - a));
export const smooth = t => t * t * (3 - 2 * t);
export const ease = {
  linear: t => t,
  in: t => t * t * t,
  out: t => 1 - Math.pow(1 - t, 3),
  inOut: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  sine: t => -(Math.cos(Math.PI * t) - 1) / 2,
  outBack: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  outElastic: t => (t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1),
  outQuint: t => 1 - Math.pow(1 - t, 5),
};
// hash-based value noise, smooth, deterministic
function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453123; return s - Math.floor(s); }
export function noise1(x, seed = 0) {
  const i = Math.floor(x), f = x - i; const u = f * f * (3 - 2 * f);
  return lerp(hash(i + seed * 57.3), hash(i + 1 + seed * 57.3), u) * 2 - 1;
}
export const rand = (i, seed = 0) => hash(i * 1.618 + seed * 9.31);
// keyframe interpolation: keys = [[t, value(number|array)], ...]
export function keys(t, ks, e = ease.inOut) {
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 0; i < ks.length - 1; i++) {
    const [t0, v0] = ks[i], [t1, v1] = ks[i + 1];
    if (t <= t1) {
      const u = e((t - t0) / Math.max(1e-6, t1 - t0));
      return Array.isArray(v0) ? v0.map((v, j) => lerp(v, v1[j], u)) : lerp(v0, v1, u);
    }
  }
  return ks[ks.length - 1][1];
}
// pulse 0..1..0 over [a, b] with attack/release fraction
export function pulse(t, a, b, att = 0.15, rel = 0.15) {
  if (t < a || t > b) return 0;
  const d = b - a; return Math.min(1, (t - a) / (d * att + 1e-6), (b - t) / (d * rel + 1e-6));
}
export const TAU = Math.PI * 2;

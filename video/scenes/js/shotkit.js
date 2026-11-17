// Helpers shared by the shot files.
import * as THREE from 'three';
import { E, tw, kf, clamp, lerp, pulse, noise1 } from './util.js';
export { E, tw, kf, clamp, lerp, pulse, noise1, THREE };

export const within = (t, a, b) => t >= a && t <= b;
export function walk(a, t, t0, t1, p0, p1, o = {}) {
  const k = (t - t0) / (t1 - t0), kk = (o.ease || E.lin)(clamp(k));
  a.root.position.x = p0[0] + (p1[0] - p0[0]) * kk; a.root.position.z = p0[1] + (p1[1] - p0[1]) * kk;
  if (o.face !== false && (p1[0] !== p0[0] || p1[1] !== p0[1])) a.root.rotation.y = Math.atan2(p1[0] - p0[0], p1[1] - p0[1]);
  const moving = k > 0 && k < 1; a.state.walk = moving ? (o.amp ?? 1) : 0; a.state.walkPhase = Math.max(0, Math.min(t, t1) - t0) * (o.rate || 8.5);
  return moving;
}
export function seat(a, x, z, rot, h = 0.53, pose = 'sitIdle') { a.place(x, z, rot); a.pose(pose); a.state.seatH = h; return a; }
export const talk = (a, t, w) => { a.state.talk = w.some(([s, e]) => t >= s && t <= e); };
// head yaw toward a world point (relative to body facing)
export function lookAtPt(a, x, z, k = 1) { const p = a.root.position; const want = Math.atan2(x - p.x, z - p.z); let d = want - a.root.rotation.y; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; a.state.look = [clamp(d, -1.3, 1.3) * k, a.state.look[1] || 0]; }
// drifting camera over the whole shot
export function drift(c, p, l, fov = 40, dp = [0.25, 0, -0.5], dl = [0, 0, 0], ease = E.sine) { c.cam.path([[0, p, l, fov], [c.T, p.map((v, i) => v + dp[i]), l.map((v, i) => v + dl[i]), fov]], ease); }
export function orbit(c, center, r, h, a0, a1, fov = 40, lookY = 1.2) { c.cam.fn = (t) => { const a = lerp(a0, a1, E.sine(t / c.T)); return { p: [center[0] + Math.sin(a) * r, h, center[2] + Math.cos(a) * r], l: [center[0], lookY, center[2]], fov }; }; }
// extras: rich classmates
export function extras(c, list) { return list.map(([name, x, z, rot, pose, expr]) => { const a = c.actor(name).place(x, z, rot ?? 0); if (pose) a.pose(pose); if (expr) a.expr(expr); return a; }); }
export const seq = (t, arr) => { let v = arr[0][1]; for (const [s, x] of arr) if (t >= s) v = x; return v; };

import part1 from './shots1.js';
import part2 from './shots2.js';
import part3 from './shots3.js';
export function defineShots(TL) {
  const shots = [];
  const S = (at, set, run, o = {}) => shots.push({ at, set, run, ...o });
  part1(S); part2(S); part3(S);
  for (const s of shots) s.start = Math.max(0, TL.time(s.at) - (s.lead ?? 0.12));
  shots.sort((a, b) => a.start - b.start);
  shots.forEach((s, i) => { s.end = i < shots.length - 1 ? shots[i + 1].start : TL.total; s.id = i; });
  return shots;
}

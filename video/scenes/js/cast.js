import { rng, hash } from './util.js';
const NAVY = '#1f2a6e', GOLD = '#f2c14e';
const UNI = (o = {}) => ({ type: 'blazer', color: NAVY, crest: true, tie: '#b32d4a', ...o });

export const CAST = {
  // the protagonist: hand-me-down blazer two sizes too big, red backpack with a safety pin
  kid: { skin: '#f6eadf', hair: { style: 'messy', color: '#4a2817' }, top: UNI({ color: '#33407e', oversized: true, tie: '#a8344f', patch: '#5a68a8' }), legs: '#2a2f55', shoes: '#efe8f5', backpack: '#e2453c' },
  kidHome: { skin: '#f6eadf', hair: { style: 'messy', color: '#4a2817' }, top: { type: 'hoodie', color: '#ff9a3d', color2: '#fff3e0' }, legs: '#3a4a7a', shoes: '#efe8f5' },
  kidPJ: { skin: '#f6eadf', hair: { style: 'messy', color: '#4a2817' }, top: { type: 'tee', color: '#7aa6ff', stripes: true, color2: '#a9c4ff' }, legs: '#5a6aa0', shoes: '#cfd7ff' },
  theo: { skin: '#f9f1ff', hair: { style: 'swoop', color: '#2b1a12' }, top: UNI({ tie: '#1d1d3a' }), legs: '#1a2050', shoes: '#2a2238', acc: ['watch'] },
  theoCasual: { skin: '#f9f1ff', hair: { style: 'swoop', color: '#2b1a12' }, top: { type: 'shirt', color: '#e7ecff' }, legs: '#3b4472', shoes: '#ffffff', acc: ['watch'] },
  preston: { skin: '#fff2ea', hair: { style: 'slick', color: '#f0c75e' }, top: UNI({ tie: '#d4a017' }), legs: '#1a2050', shoes: '#ffffff', acc: ['sunglassesUp'] },
  heli: { skin: '#fff2ea', hair: { style: 'slick', color: '#f0c75e' }, top: UNI({ tie: '#d4a017' }), legs: '#1a2050', shoes: '#ffffff', acc: ['sunglasses'] },
  mom: { scale: 1.12, legLen: 0.9, skin: '#f3dccb', hair: { style: 'bun', color: '#5a2e1c' }, top: { type: 'apron', color: '#5bc0be', color2: '#ffffff' }, skirt: '#5bc0be', legs: '#f0e6ea', shoes: '#ffffff' },
  dad: { scale: 1.16, legLen: 0.92, wide: 1.15, skin: '#f3dccb', hair: { style: 'short', color: '#3a2214' }, top: { type: 'shirt', color: '#5d8a4a', plaid: true, color2: '#2f5a2a' }, legs: '#3a4a7a', pants: '#3a4a7a', shoes: '#6b4a2a', acc: ['mustache'] },
  bro: { scale: 0.74, skin: '#f6eadf', hair: { style: 'messy', color: '#4a2817' }, top: { type: 'tee', color: '#ff6b6b', stripes: true, color2: '#ffd36b' }, legs: '#f2eef8', shoes: '#7ad3ff' },
  guard: { scale: 1.2, legLen: 0.92, wide: 1.25, skin: '#c99872', hair: { style: 'buzz', color: '#2a1a12' }, top: { type: 'uniform', color: '#2b2f45', badge: true, tie: '#111' }, legs: '#22263a', pants: '#22263a', shoes: '#111', acc: ['cap', 'sunglasses'] },
  teacher: { scale: 1.14, legLen: 0.9, skin: '#f7ead8', hair: { style: 'bob', color: '#9a9aa8' }, top: { type: 'uniform', color: '#8e5bd6', color2: '#fff' }, skirt: '#5a3d8a', legs: '#f0e6ea', shoes: '#5a3d8a', acc: ['glasses'] },
  islandGirl: { skin: '#fff3ec', hair: { style: 'long', color: '#e8b04a' }, top: UNI({ tie: '#ff5d8f' }), skirt: NAVY, legs: '#fff', shoes: '#ff5d8f', acc: ['bow'] },
  spaceBoy: { skin: '#e9c9a8', hair: { style: 'curly', color: '#2a1a12' }, top: UNI({ tie: '#3fb6e8' }), legs: '#1a2050', shoes: '#fff', acc: ['sunglassesUp'] },
  instructor: { scale: 1.14, legLen: 0.92, skin: '#f7ead8', hair: { style: 'pony', color: '#7a3b1e' }, top: { type: 'jacket', color: '#b3263c', color2: '#ffffff' }, legs: '#f5efe0', pants: '#f5efe0', shoes: '#2a1a12', acc: ['helmet'] },
  chef: { scale: 1.15, legLen: 0.9, wide: 1.15, skin: '#e8c4a0', hair: { style: 'short', color: '#222' }, top: { type: 'chef', color: '#ffffff' }, legs: '#222', pants: '#222', shoes: '#111', acc: ['chefhat', 'mustache'] },
  laundryGirl: { skin: '#fff0e6', hair: { style: 'puffs', color: '#d2492a' }, top: UNI({ tie: '#ff5d8f' }), skirt: NAVY, legs: '#fff', shoes: '#fff' },
  iconicGirl: { skin: '#d9a77c', hair: { style: 'pony', color: '#1a1010' }, top: UNI({ tie: '#9d7bff' }), skirt: NAVY, legs: '#fff', shoes: '#fff' },
  oldFriend1: { skin: '#c99872', hair: { style: 'buzz', color: '#1a1010' }, top: { type: 'hoodie', color: '#6ee7b7', color2: '#fff' }, legs: '#3a4a7a', shoes: '#fff' },
  oldFriend2: { skin: '#f6eadf', hair: { style: 'curly', color: '#7a3b1e' }, top: { type: 'tee', color: '#ffd36b', logo: '★', color2: '#ff6b6b' }, legs: '#3a4a7a', shoes: '#fff' },
  band1: { skin: '#e9c9a8', hair: { style: 'messy', color: '#ff5d8f' }, top: { type: 'tee', color: '#222244', logo: '♪', color2: '#ffd36b' }, legs: '#222', shoes: '#fff' },
  band2: { skin: '#f6eadf', hair: { style: 'long', color: '#111' }, top: { type: 'tee', color: '#ff6b6b' }, legs: '#222', shoes: '#fff' },
  driver: { scale: 1.15, legLen: 0.9, skin: '#e8c4a0', hair: { style: 'short', color: '#222' }, top: { type: 'uniform', color: '#111122', tie: '#111' }, legs: '#111', pants: '#111', shoes: '#111', acc: ['cap'] },
};

const HAIR = ['short', 'swoop', 'bob', 'long', 'pony', 'curly', 'puffs', 'slick', 'buzz', 'messy'];
const HAIRC = ['#2b1a12', '#5a2e1c', '#f0c75e', '#d2492a', '#1a1010', '#8a5a3a', '#c9a15a'];
const SKIN = ['#f9f1ff', '#fff2ea', '#f3dccb', '#e9c9a8', '#d9a77c', '#c99872', '#a8754f'];
const TIES = ['#b32d4a', '#d4a017', '#3fb6e8', '#9d7bff', '#2ecc71', '#ff5d8f'];
// rich classmates: navy uniforms with variety
export function makeExtra(name) {
  const r = rng(hash(name) + 1.7);
  const pick = (a) => a[Math.floor(r() * a.length)];
  const hair = pick(HAIR); const girl = ['bob', 'long', 'pony', 'puffs'].includes(hair);
  const acc = []; if (r() < 0.15) acc.push('sunglassesUp'); if (r() < 0.12) acc.push('glasses'); if (girl && r() < 0.3) acc.push('bow'); if (r() < 0.25) acc.push('watch');
  return { skin: pick(SKIN), hair: { style: hair, color: pick(HAIRC) }, top: UNI({ tie: pick(TIES) }), skirt: girl && r() < 0.6 ? NAVY : null, legs: girl ? '#ffffff' : '#1a2050', shoes: pick(['#ffffff', '#2a2238', '#ff5d8f', '#f2c14e']), acc, scale: 0.95 + r() * 0.1 };
}

// The supporting cast: every extra character is a hand-drawn stickman with its own look.
'use strict';
const CAST = {
  // the viewer / regular diner who keeps getting the bill
  joe: { seed: 11, skin: '#f6cfa9', hair: 'side', hairColor: '#7a4a2a', freckles: true, browsAlways: true },
  // restaurant
  waiter: { seed: 12, skin: '#efc19a', hair: 'comb', hairColor: '#1b1b1b', mustache: true, bowtie: '#1b1b1b' },
  diner2: { seed: 13, skin: '#c88b5f', hair: 'afro', hairColor: '#2a1d16', glasses: 'round' },
  diner3: { seed: 14, skin: '#f3d6bf', hair: 'ponytail', hairColor: '#e0b04a', lipstick: true },
  diner4: { seed: 15, skin: '#a26a45', hair: 'buzz', hairColor: '#1b1b1b', beard: true },
  // grid side
  pjm: { seed: 21, skin: '#e2a97c', hair: 'bald', glasses: 'square', tie: COL.orange, badge: true },
  plant: { seed: 22, skin: '#f6cfa9', hair: 'buzz', hairColor: '#8a5a3c', hat: 'hardhat', beard: true, hairColorBeard: '#8a5a3c' },
  utility: { seed: 23, skin: '#7c4f33', hair: 'buzz', hairColor: '#1b1b1b', hat: 'cap', hatColor: COL.blue, tie: COL.blue },
  monitor: { seed: 24, skin: '#f2d3b8', hair: 'side', hairColor: '#9aa0a6', glasses: 'round', tie: COL.purple },
  advocate: { seed: 25, skin: '#c88b5f', hair: 'bun', hairColor: '#3a2418', scarf: COL.red, glasses: 'round' },
  analyst: { seed: 26, skin: '#efc19a', hair: 'curly', hairColor: '#5e3b25', glasses: 'square', tie: COL.green },
  researcher: { seed: 27, skin: '#8d5a3b', hair: 'long', hairColor: '#1b1b1b', glasses: 'round', necklace: true },
  // money people
  investor: { seed: 31, skin: '#f6cfa9', hair: 'bald', hairColor: '#5e3b25', hat: 'top', hatColor: COL.green, bowtie: COL.red, mustache: true },
  investor2: { seed: 32, skin: '#e9b98f', hair: 'side', hairColor: '#1b1b1b', glasses: 'sun', tie: COL.gold },
  lender: { seed: 33, skin: '#c88b5f', hair: 'bald', mustache: true, tie: '#1d3f66' },
  dealer: { seed: 34, skin: '#efc19a', hair: 'comb', hairColor: '#1b1b1b', glasses: 'sun', necklace: true, belly: true, shirt: '#f29bb5' },
  // politics
  governor: { seed: 41, skin: '#f3d6bf', hair: 'comb', hairColor: '#9aa0a6', tie: COL.red, badge: true },
  lawmaker: { seed: 42, skin: '#efc19a', hair: 'buzz', hairColor: '#c9ced3', glasses: 'square', mustache: true, hairColorBeard: '#c9ced3', tie: '#a01f2a' },
  dem: { seed: 43, skin: '#a26a45', hair: 'curly', hairColor: '#1b1b1b', tie: COL.blue },
  ind: { seed: 44, skin: '#f6cfa9', hair: 'ponytail', hairColor: '#7a4a2a', scarf: COL.purple },
  rep: { seed: 45, skin: '#e2a97c', hair: 'side', hairColor: '#e0b04a', tie: COL.red },
  industry: { seed: 46, skin: '#f6cfa9', hair: 'side', hairColor: '#5e3b25', hat: 'cap', hatColor: COL.orange, beard: true, hairColorB: '#5e3b25' },
  pollster: { seed: 47, skin: '#f3d6bf', hair: 'long', hairColor: '#e0b04a', glasses: 'square' },
  // households
  mom: { seed: 51, skin: '#e2a97c', hair: 'ponytail', hairColor: '#7a3b1f', lipstick: true },
  dad: { seed: 52, skin: '#f6cfa9', hair: 'messy', hairColor: '#3a2418', beard: true },
  kid: { seed: 53, skin: '#c88b5f', hair: 'spiky', hairColor: '#1b1b1b', hat: 'beanie', hatColor: COL.green },
  grandma: { seed: 54, skin: '#f2d3b8', hair: 'curly', hairColor: '#b8bcc2', glasses: 'round', scarf: COL.purple },
  student: { seed: 55, skin: '#7c4f33', hair: 'mohawk', hairColor: '#1b1b1b', hat: 'headband', hatColor: COL.red },
  worker: { seed: 56, skin: '#efc19a', hair: 'messy', hairColor: '#1b1b1b', hat: 'hardhat' },
  neighbor: { seed: 57, skin: '#a26a45', hair: 'long', hairColor: '#3a2418', dress: '#4aa3ff' },
  techbro: { seed: 58, skin: '#f6cfa9', hair: 'side', hairColor: '#e0b04a', glasses: 'sun', scarf: '#2f353d' },
};
// beards follow hair colour unless given
for (const c of Object.values(CAST)) { if (c.beard && c.hairColorBeard) c.hairColor = c.hairColor || c.hairColorBeard; }

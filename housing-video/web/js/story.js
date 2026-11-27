'use strict';
// Storyboard engine: each shot starts on a spoken phrase (from the forced alignment);
// inside a shot, a('phrase') gives the time that phrase is spoken, relative to the shot.
const STORY = [];
function S(anchor, fn, cam) { STORY.push({ anchor, fn, cam }); }
const NORM = s => s.toLowerCase().replace(/[^a-z0-9$%]/g, '');
function findPhrase(norm, phrase, from) {
  const toks = phrase.split(/\s+/).map(NORM).filter(Boolean);
  for (let i = from; i <= norm.length - toks.length; i++) {
    let ok = true;
    for (let j = 0; j < toks.length; j++) if (norm[i + j] !== toks[j]) { ok = false; break; }
    if (ok) return i;
  }
  return -1;
}
const STORY_WARN = [];
function buildStory(words) {
  const norm = words.map(w => NORM(w.w));
  const total = words[words.length - 1].e + 0.5;
  let cur = 0; const defs = [];
  for (const d of STORY) {
    const i = d.anchor === '@start' ? 0 : findPhrase(norm, d.anchor, cur);
    if (i < 0) { STORY_WARN.push('anchor not found: ' + d.anchor); console.warn('anchor not found:', d.anchor); continue; }
    defs.push({ d, i }); cur = i + 1;
  }
  const shots = [];
  defs.forEach((x, k) => {
    const start = k === 0 ? 0 : Math.max(0, words[x.i].s - 0.12);
    const end = k < defs.length - 1 ? Math.max(0, words[defs[k + 1].i].s - 0.12) : total + 2;
    const limit = k < defs.length - 1 ? defs[k + 1].i + 2 : norm.length;
    const a = (ph, off = 0) => {
      const j = findPhrase(norm, ph, x.i);
      if (j < 0 || j > limit) { STORY_WARN.push(`phrase "${ph}" not in shot "${x.d.anchor}"`); console.warn(`phrase "${ph}" not in shot "${x.d.anchor}"`); return 0.3; }
      return Math.max(0, words[j].s - start - 0.04 + off);
    };
    let els = [];
    try { els = x.d.fn(a, end - start).flat(3).filter(Boolean); } catch (e) { console.error('shot build failed', x.d.anchor, e.stack); }
    shots.push({ id: x.d.anchor, start, end, els, cam: x.d.cam });
  });
  window.SHOT_LIST = shots.map(s => [s.id, +s.start.toFixed(2), +(s.end - s.start).toFixed(2)]);
  return shots;
}

// ---------- shorthand used by the storyboard ----------
const GY = 930;
const m = (x, pose, face, o = {}) => mascot(Object.assign({ x, y: GY, s: 0.92, pose, face }, o));
const peek = (side, face, pose, o = {}) => mascot(Object.assign({ x: side === 'L' ? 190 : 1730, y: 1330, s: 1.45, face, pose: pose || 'rest', enter: side === 'L' ? 'slideL' : 'slideR', dur: 0.35 }, o));
const sk = (who, x, pose, face, o = {}) => stick(Object.assign({ who, x, y: GY, s: 0.82, pose, face }, o));
const pr = (name, x, y, s, o = {}) => prop(name, Object.assign({ x, y, s }, o));
const lb = (text, x, y, size, o = {}) => label(text, Object.assign({ x, y, size }, o));
const X = (x, y, s, t, o = {}) => pr('cross', x, y, s, Object.assign({ t }, o));
const OK = (x, y, s, t, o = {}) => pr('check', x, y, s, Object.assign({ t }, o));
const usd = v => '$' + Math.round(v).toLocaleString('en-US');
function transl(text, o = {}) {
  return [m(330, 'stickR', o.face || 'serious'), pr('board', 1200, 420, 1, { text: text || 'The translation...', size: o.size || 92, enter: 'pop' })];
}

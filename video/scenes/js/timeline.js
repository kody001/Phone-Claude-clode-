// Resolves script anchors to absolute seconds using the voice-over timing.
// Anchor forms: 'L12' line start, 'L12e' line end, 'L12.3' word 3 start, 'L12.3e' word end,
// 'L12:helicopter' first word matching, 'L12:pin#2' 2nd match, any form + '+0.4' / '-0.2'.
export class Timeline {
  constructor(script, timing) {
    this.script = script; this.timing = timing;
    this.lines = timing.lines;
    this.total = timing.duration + 6.5; // end card tail
    this.voEnd = timing.duration;
  }
  word(li, wi) { return this.lines[li].words[wi]; }
  find(li, text, nth = 1) {
    const ws = this.script[li].words; let c = 0;
    for (let i = 0; i < ws.length; i++) if (ws[i].n === text) { c++; if (c === nth) return i; }
    c = 0; for (let i = 0; i < ws.length; i++) if (ws[i].n.startsWith(text)) { c++; if (c === nth) return i; }
    throw new Error(`anchor word "${text}" not in line ${li}: ${this.script[li].text}`);
  }
  time(a) {
    if (typeof a === 'number') return a;
    let off = 0; const m = a.match(/^(.*?)([+-]\d*\.?\d+)$/);
    if (m && !/^L\d+$/.test(a)) { a = m[1]; off = parseFloat(m[2]); }
    let r;
    if ((r = a.match(/^L(\d+)(e?)$/))) { const L = this.lines[+r[1]]; return (r[2] ? L.end : L.start) + off; }
    if ((r = a.match(/^L(\d+)\.(\d+)(e?)$/))) { const w = this.word(+r[1], +r[2]); return w[r[3] ? 1 : 0] + off; }
    if ((r = a.match(/^L(\d+):([\w'$%-]+?)(?:#(\d+))?$/))) { const li = +r[1]; const wi = this.find(li, r[2].toLowerCase(), r[3] ? +r[3] : 1); return this.word(li, wi)[0] + off; }
    if ((r = a.match(/^T([\d.]+)$/))) return parseFloat(r[1]) + off;
    throw new Error('bad anchor ' + a);
  }
  // caption chunks: arrays of {text, start, end, emph}
  captions() {
    if (this._caps) return this._caps;
    const chunks = [];
    for (const L of this.script) {
      const tl = this.lines[L.id]; let cur = [];
      const flush = () => { if (cur.length) { chunks.push({ line: L.id, words: cur, start: cur[0].start, end: cur[cur.length - 1].end }); cur = []; } };
      L.words.forEach((w, i) => {
        const [s, e] = tl.words[i];
        cur.push({ text: w.t.replace(/["“”]/g, ''), start: s, end: e, emph: w.emph });
        const chars = cur.reduce((n, x) => n + x.text.length + 1, 0);
        const punct = /[.?!]["”]?$|\.\.\.["”]?$/.test(w.t), comma = /[,;:]["”]?$/.test(w.t);
        const next = L.words[i + 1];
        if (punct || (comma && cur.length >= 3) || chars > 26 || cur.length >= 6 || (next && chars + next.t.length > 32)) flush();
      });
      flush();
    }
    for (let i = 0; i < chunks.length; i++) { const n = chunks[i + 1]; chunks[i].hold = n ? Math.min(n.start, chunks[i].end + 0.5) : chunks[i].end + 0.6; }
    this._caps = chunks; return chunks;
  }
}

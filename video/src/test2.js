shot({ at: 0, bg: 'map_med', cam: null, vig: 0.3, draw: (c, st) => { for (const k in PLACES) { const p = medP(...PLACES[k]); circ(c, p[0], p[1], 12, { fill: '#e0262d', lw: 5 }); txt(c, k.toUpperCase(), p[0], p[1] - 40, { size: 40 }); } } });
shot({ at: 5, bg: 'map_france', cam: null, vig: 0.3, draw: (c, st) => { const p = frP(7.35, 47.87); circ(c, p[0], p[1], 14, { fill: '#e0262d', lw: 5 }); } });
shot({ at: 10, bg: 'rome', cam: null, draw: (c, st) => { ch(c, st, 'bab_pass', { x: 600, y: 1000, face: 'talk' }); ch(c, st, 'hamm', { x: 1200, y: 1000, face: 'smug' }); } });
shot({ at: 15, bg: 'market', cam: null, draw: (c, st) => { ch(c, st, 'caveman', { x: 600, y: 1000, face: 'scared', holes: 'healed' }); } });
shot({ at: 20, bg: 'desert', cam: null, draw: (c, st) => {} });

/* Puts it together: timeline + shots + captions -> renderFrame(ctx, t) */
(function (root) {
  const isNode = typeof module !== 'undefined' && module.exports;
  const E = isNode ? require('./engine.js') : root.Engine;
  const Sc = isNode ? require('./scenes.js') : root.Scenes;
  const SHOTS = isNode ? require('./shots.js') : root.SHOTS;

  function createVideo(words, env, assets, opts = {}) {
    const TL = new Sc.Timeline(words, env);
    const shots = Sc.buildShots(TL, SHOTS).map((s) => new Sc.Shot(TL, s));
    const caps = E.buildCaptions(words);
    const duration = TL.end;
    function shotAt(t) {
      let lo = 0, hi = shots.length - 1, idx = 0;
      while (lo <= hi) { const m = (lo + hi) >> 1; if (shots[m].t0 <= t) { idx = m; lo = m + 1; } else hi = m - 1; }
      return shots[idx];
    }
    function renderFrame(ctx, t) {
      const D = new E.Draw(ctx, assets); D.setTime(t);
      ctx.save();
      Sc.H.bg(D, '#ffffff');
      const S = shotAt(t);
      const cam = S.def.cam || {};
      const k = E.clamp((t - S.t0) / Math.max(0.5, S.dur));
      const z = E.lerp(cam.z0 == null ? 1 : cam.z0, cam.z1 == null ? 1.035 : cam.z1, E.ease.inOut(k));
      const cx = cam.x == null ? E.W / 2 : cam.x, cy = cam.y == null ? E.H / 2 : cam.y;
      ctx.translate(cx, cy); ctx.scale(z, z); ctx.translate(-cx, -cy);
      S.def.fn(D, S, Sc.H);
      ctx.restore();
      if (opts.captions !== false) E.drawCaptions(D, caps, t);
      // fade from white at the very start, to white at the end
      const fade = Math.max(E.clamp(1 - t / 0.4), E.clamp((t - (duration - 0.6)) / 0.6));
      if (fade > 0) { ctx.save(); ctx.globalAlpha = fade; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, E.W, E.H); ctx.restore(); }
    }
    return { renderFrame, duration, shots, caps, TL };
  }

  if (isNode) module.exports = { createVideo }; else root.createVideo = createVideo;
})(typeof window !== 'undefined' ? window : globalThis);

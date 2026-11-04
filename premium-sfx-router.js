/* Bible Unfolded: approved tactile wheel effects, Visual Lab test only.
 * CC0 source: https://sfxmint.com/license
 * All volume controls and existing game behavior preserved.
 */
(function () {
  'use strict';
  const clips = Object.freeze({
    tick: 'https://sfxmint.com/dl/ui-hover-15.mp3',
    swipe: 'https://sfxmint.com/dl/ui-swipe-50.mp3'
  });
  const pool = {};
  const counter = {tick: 0, swipe: 0};
  const last = {tick: 0, swipe: 0};
  const originalTick = typeof tick === 'function' ? tick : null;
  const originalSwish = typeof swish === 'function' ? swish : null;
  for (const kind of Object.keys(clips)) {
    pool[kind] = Array.from({length: kind === 'tick' ? 4 : 2}, () => {
      const a = new Audio(clips[kind]);
      a.preload = 'auto';
      a.playsInline = true;
      return a;
    });
  }
  function play(kind) {
    if ((typeof sfxOn !== 'undefined' && !sfxOn) ||
        (typeof sfxVolume !== 'undefined' && Number(sfxVolume) <= 0) ||
        document.hidden) return true; // Off means silence, not old-effect fallback.
    const now = performance.now(), gap = kind === 'tick' ? 38 : 110;
    if (now - last[kind] < gap) return true;
    last[kind] = now;
    const list = pool[kind], a = list[counter[kind]++ % list.length];
    const v = typeof sfxVolume !== 'undefined' ? Number(sfxVolume) / 100 : .65;
    const gain = kind === 'tick' ? .20 : .36;
    try {
      a.pause();
      a.currentTime = 0;
      a.volume = Math.max(0, Math.min(1, v * gain));
      const started = a.play();
      if (started && typeof started.catch === 'function') {
        started.catch(() => {
          try {
            if (kind === 'tick' && originalTick) originalTick();
            if (kind === 'swipe' && originalSwish) originalSwish();
          } catch (_) {}
        });
      }
      if (kind === 'swipe') {
        // User-approved option B: full clip's opening, 0.24s fade to 0.37s.
        const fade = () => {
          if (a.paused) return;
          const t = a.currentTime;
          if (t >= .37) { a.pause(); a.currentTime = 0; return; }
          const scale = t <= .24 ? 1 : Math.max(0, (.37 - t) / .13);
          a.volume = Math.max(0, Math.min(1, v * gain * scale));
          requestAnimationFrame(fade);
        };
        requestAnimationFrame(fade);
      }
      return true;
    } catch (_) {
      try {
        if (kind === 'tick' && originalTick) originalTick();
        if (kind === 'swipe' && originalSwish) originalSwish();
      } catch (__) {}
      return false;
    }
  }
  if (originalTick) tick = function () { play('tick'); };
  if (originalSwish) swish = function () { play('swipe'); };
  window.BU_PREMIUM_SFX_TEST = Object.freeze({
    version: '2026-11-04-approved',
    wheel: 'ui-hover-15',
    swipe: 'ui-swipe-50 short B (0.24-0.37 second fade)',
    active: !!originalTick && !!originalSwish
  });
})();
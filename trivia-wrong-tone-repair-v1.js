/* BIBLE UNFOLDED — VISUAL LAB ONLY — original Trivia wrong cue repair V1.
 * Root cause: bu3846WrongTone in the original core exits when the shared
 * AudioContext is missing, unlike playChime, which creates it via audioContext().
 * Its peak level (.016*linearVolume) is ~8x below the success chime.
 * Replace ONLY that legacy function binding, which Stage10 passes through
 * wrongTone:(...args)=>bu3846WrongTone(...args). No added click listener,
 * extra cue, scoring change, UI change, new sound sample, or other-mode SFX. */
(()=>{'use strict';
  if(window.BU_TRIVIA_WRONG_TONE_REPAIR_V1)return;
  function install(){
    // Must replace existing (already called by the live Trivia controller),
    // rather than add a second wrong-sound listener that might double-play.
    if(typeof bu3846WrongTone!=='function'||typeof audioContext!=='function')return false;
    const original=bu3846WrongTone;
    function restoredTriviaWrongTone(){
      try{
        if(!sfxOn||Number(sfxVolume)<=0||document.hidden)return;
        const ac=audioContext(); // creates/resumes the same context as success chime
        if(!ac)return;
        if(ac.state==='suspended'&&typeof ac.resume==='function'){
          const p=ac.resume();if(p?.catch)p.catch(()=>{});
        }
        const relative=Math.max(0,Math.min(1,Number(sfxVolume)/100));
        const volume=.075*Math.pow(relative,.70); // softer than success, audible
        const base=ac.currentTime+.007;
        [392,329.63].forEach((hz,i)=>{
          const at=base+i*.103;
          const osc=ac.createOscillator(),gain=ac.createGain();
          osc.type='sine';
          osc.frequency.setValueAtTime(hz,at);
          gain.gain.setValueAtTime(.0001,at);
          gain.gain.exponentialRampToValueAtTime(Math.max(.00011,volume*(i===1?.89:1)),at+.022);
          gain.gain.exponentialRampToValueAtTime(.0001,at+.244);
          osc.connect(gain);gain.connect(ac.destination);
          osc.start(at);osc.stop(at+.252);
          osc.onended=()=>{try{osc.disconnect();gain.disconnect()}catch(_){}};
        });
      }catch(_){/* Sound is optional; NEVER interrupt a submitted answer. */}
    }
    bu3846WrongTone=restoredTriviaWrongTone;
    window.BU_TRIVIA_WRONG_TONE_REPAIR_V1=Object.freeze({
      version:'2026-11-06-v1',
      restoredOriginalTwoNoteCue:true,
      originalAvailable:typeof original==='function'
    });
    return true;
  }
  if(!install()){
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
    else setTimeout(install,0);
  }
})();

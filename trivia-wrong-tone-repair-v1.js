/* BIBLE UNFOLDED — VISUAL LAB ONLY — balanced, clearly audible Trivia feedback V3.
 * Replace the two ORIGINAL sound function bindings (not answer listeners).
 * - Preserve existing correct-answer chime sequence exactly; amplify its volume only.
 * - Keep original negative two-note descending pitch sequence, louder.
 * - Both gain envelopes are increased, balanced, and tied to the existing SFX slider.
 * - Other-mode positive chimes keep their original sound and volume.
 * - No scoring, retries, animation, music, announcer, or navigation changes. */
(()=>{'use strict';
  if(window.BU_TRIVIA_FEEDBACK_AUDIO_V2)return;
  function install(){
    if(typeof bu3846WrongTone!=='function'||typeof playChime!=='function'||typeof audioContext!=='function')return false;
    const previousCorrect=playChime;
    const previousWrong=bu3846WrongTone;
    function audibleFeedback(kind){
      try{
        const setting=Number(sfxVolume);
        if(!sfxOn||!Number.isFinite(setting)||setting<=0||document.hidden)return;
        const ac=audioContext(); // initialize same shared context as other Web Audio
        if(!ac)return;
        if(ac.state==='suspended'&&typeof ac.resume==='function'){
          const resumed=ac.resume();
          if(resumed?.catch)resumed.catch(()=>{});
        }
        const slider=Math.max(0,Math.min(1,setting/100));
        // Quieter at low settings; louder and comparable at every nonzero setting.
        // Max oscillator level is modest to avoid clipping when the notes overlap.
        const peak=(kind==='correct'?.120:.150)*Math.pow(slider,.60);
        const notes=kind==='correct'?[392,493.88,587.33]:[392,329.63];
        const gap=kind==='correct'?.11:.105;
        const hold=kind==='correct'?.38:.23;
        const attack=kind==='correct'?.018:.022;
        const base=ac.currentTime+.006;
        notes.forEach((hz,i)=>{
          const at=base+i*gap;
          const osc=ac.createOscillator(),gain=ac.createGain();
          osc.type='sine';osc.frequency.setValueAtTime(hz,at);
          gain.gain.setValueAtTime(.0001,at);
          gain.gain.exponentialRampToValueAtTime(Math.max(.00011,peak),at+attack);
          gain.gain.exponentialRampToValueAtTime(.0001,at+hold);
          osc.connect(gain);gain.connect(ac.destination);
          osc.start(at);osc.stop(at+hold+.01);
          osc.onended=()=>{try{osc.disconnect();gain.disconnect()}catch(_){ }};
        });
      }catch(_){/* Audio failure must never interrupt question scoring or feedback. */}
    }
    function triviaQuestionPlaying(){
      const body=document.getElementById('bu34-body');
      return !!(body?.classList?.contains('bu65-playing')&&body.querySelector('.bu34-answer[data-answer]'));
    }
    playChime=function balancedTriviaCorrectTone(...args){
      // Preserve the approved correct-answer melody and timing, including
      // its later sound layers; only give it additional SFX volume in Trivia.
      if(!triviaQuestionPlaying())return previousCorrect.apply(this,args);
      const originalSetting=Number(sfxVolume);
      if(!sfxOn||!Number.isFinite(originalSetting)||originalSetting<=0)
        return previousCorrect.apply(this,args);
      try{
        sfxVolume=Math.min(100,originalSetting*1.5);
        return previousCorrect.apply(this,args);
      }finally{sfxVolume=originalSetting}
    };
    bu3846WrongTone=function balancedTriviaWrongTone(){return audibleFeedback('wrong');};
    window.BU_TRIVIA_FEEDBACK_AUDIO_V2=Object.freeze({
      version:'2026-11-06-balanced-v3',
      correctMelodyPreserved:true,negativeNotes:2,
      respectsEffectsToggle:true,respectsSfxSlider:true,
      originalCorrectAvailable:typeof previousCorrect==='function',
      originalWrongAvailable:typeof previousWrong==='function'
    });
    // Retain diagnostic used by earlier V1 checks without installing its old patch.
    window.BU_TRIVIA_WRONG_TONE_REPAIR_V1=window.BU_TRIVIA_FEEDBACK_AUDIO_V2;
    return true;
  }
  if(!install()){
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
    else setTimeout(install,0);
  }
})();

/* BIBLE UNFOLDED — VISUAL LAB ONLY — balanced, clearly audible Trivia feedback V4 (phone-audible negative cue).
 * Replace the two ORIGINAL sound function bindings (not answer listeners).
 * - Preserve existing correct-answer chime sequence exactly; amplify its volume only.
 * - Keep original negative two-note descending pitch sequence; amplify for small speakers.
 * - Both gain envelopes are increased, balanced, and tied to the existing SFX slider.
 * - Other-mode positive chimes keep their original sound and volume.
 * - No scoring, retries, animation, music, announcer, or navigation changes. */
(()=>{'use strict';
  if(window.BU_TRIVIA_FEEDBACK_AUDIO_V2)return;
  function install(){
    if(typeof bu3846WrongTone!=='function'||typeof playChime!=='function'||typeof audioContext!=='function')return false;
    const previousCorrect=playChime;
    const previousWrong=bu3846WrongTone;
    /* V4 wrong-answer cue: same descending two notes, now phone-audible.
     * A subtle octave overtone supports small speakers, while a longer
     * decay and stronger gain make the negative response perceptually clear.
     * Each note still has ONE audible tone event (not a double sound). */
    function audibleFeedback(kind){
      try{
        const setting=Number(sfxVolume);
        if(!sfxOn||!Number.isFinite(setting)||setting<=0||document.hidden)return;
        const ac=audioContext();
        if(!ac)return;
        if(ac.state==='suspended'&&typeof ac.resume==='function'){
          const resumed=ac.resume();if(resumed?.catch)resumed.catch(()=>{});
        }
        const slider=Math.max(0,Math.min(1,setting/100));
        const base=ac.currentTime+.006;
        // More acoustic energy than V3's .150*slider^.60 sine, without clipping.
        const level=.46*Math.pow(slider,.45);
        const notes=[392,329.63]; // ORIGINAL gentle descending two-note melody
        notes.forEach((hz,i)=>{
          const at=base+i*.137;
          const fundamental=level*(i===0?1:.94);
          // Important: on small phone speakers a pure 330Hz sine can nearly
          // disappear. The octave partial helps the SAME note remain audible.
          [[hz,fundamental],[hz*2,fundamental*.30]].forEach(([frequency,peak])=>{
            const osc=ac.createOscillator(),gain=ac.createGain();
            osc.type='sine';
            osc.frequency.setValueAtTime(frequency,at);
            gain.gain.setValueAtTime(.0001,at);
            gain.gain.exponentialRampToValueAtTime(Math.max(.00011,peak),at+.019);
            gain.gain.exponentialRampToValueAtTime(.0001,at+.345);
            osc.connect(gain);gain.connect(ac.destination);
            osc.start(at);osc.stop(at+.355);
            osc.onended=()=>{try{osc.disconnect();gain.disconnect()}catch(_){}};
          });
        });
      }catch(_){/* Audio must never interrupt answering. */}
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
      version:'2026-11-06-phone-audible-v4',
      correctMelodyPreserved:true,negativeNotes:2,phoneSpeakerOvertones:true,
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

/* BIBLE UNFOLDED — VISUAL LAB ONLY — balanced, clearly audible Trivia feedback V5 (richer phone-audible negative cue).
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
    /* V5: same two soft descending notes, now bright and forward enough
     * for Samsung/phone speakers. Previous pure tones measured strong in
     * WebAudio but were still quiet to human ears on the actual phone.
     * Amplify upper harmonics (784/659 and 1176/989 Hz), not just bass.
     * A compressor protects against excessive combined peaks. */
    function audibleFeedback(){
      try{
        const setting=Number(sfxVolume);
        if(!sfxOn||!Number.isFinite(setting)||setting<=0||document.hidden)return;
        const ac=audioContext();
        if(!ac)return;
        if(ac.state==='suspended'&&typeof ac.resume==='function'){
          const p=ac.resume();if(p?.catch)p.catch(()=>{});
        }
        const slider=Math.max(0,Math.min(1,setting/100));
        // Stronger near the bottom of the slider, still zero at 0%.
        const level=.95*Math.pow(slider,.28);
        const output=typeof ac.createDynamicsCompressor==='function'
          ? ac.createDynamicsCompressor() : ac.createGain();
        if(output.threshold){
          output.threshold.value=-14;
          output.knee.value=6;
          output.ratio.value=10;
          output.attack.value=.003;
          output.release.value=.16;
        }else{
          output.gain.value=.60; // conservative fallback without a limiter
        }
        output.connect(ac.destination);
        const base=ac.currentTime+.008;
        [392,329.63].forEach((hz,i)=>{
          const at=base+i*.18, stop=at+.50;
          // One rich, gentle "wrong" note = fundamental plus two harmonics.
          // These three partials start together, never as three separate beeps.
          [[1,.58],[2,.66],[3,.30]].forEach(([multiple,weight])=>{
            const osc=ac.createOscillator(),gain=ac.createGain();
            const peak=level*weight*(i===1?.96:1);
            osc.type='sine';
            osc.frequency.setValueAtTime(hz*multiple,at);
            gain.gain.setValueAtTime(.0001,at);
            gain.gain.exponentialRampToValueAtTime(peak,at+.026);
            gain.gain.exponentialRampToValueAtTime(.0001,at+.46);
            osc.connect(gain);gain.connect(output);
            osc.start(at);osc.stop(stop);
            osc.onended=()=>{try{osc.disconnect();gain.disconnect()}catch(_){}};
          });
        });
      }catch(_){/* Sound must not interrupt answering. */}
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
    bu3846WrongTone=function balancedTriviaWrongTone(){return audibleFeedback();};
    window.BU_TRIVIA_FEEDBACK_AUDIO_V2=Object.freeze({
      version:'2026-11-06-rich-negative-v5',
      correctMelodyPreserved:true,negativeNotes:2,phoneSpeakerOvertones:true,harmonicsPerNote:3,
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

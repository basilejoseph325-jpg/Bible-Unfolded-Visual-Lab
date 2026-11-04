/* BIBLE UNFOLDED — VISUAL LAB audio choices, Nov 4 2026.
   CC0 samples: https://sfxmint.com/license
   Reversible adapter. Does not touch scores, saves, music, voice, or art. */
(()=>{'use strict';
const cues={
 navigate:['ui-menu-12.mp3',.80],back:['ui-swipe-41.mp3',.36],
 select:['ui-click-56.mp3',.87],info:['ui-pop-57.mp3',.88],
 toggle:['ui-toggle-54.mp3',.78],undo:['ui-undo-09.mp3',.85],
 tap:['ui-hover-15.mp3',.43],swish:['ui-swipe-50.mp3',.62],
 storyCorrect:['feedback-success-56.mp3',.78],
 namePositive:['feedback-success-68.mp3',.78],
 nameWrong:['feedback-confirm-65.mp3',.54]
};
const id={
 '13898|YAAESsAAACABAAZGF0YXooAAAAAD8A6QDOAbICZ':'navigate',
 '13898|YAAESsAAACABAAZGF0YXooAAAAAD4A5wDHAaECS':'back',
 '9782|YAAESsAAACABAAZGF0YWwcAAAAAGEAYAGcArEDX':'select',
 '14194|YAAESsAAACABAAZGF0YVgpAAAAADoA2QC1AZoCW':'info',
 '11842|YAAESsAAACABAAZGF0YXQiAAAAAFEAHAEBAqcC7':'toggle',
 '55354|YAAESsAAACABAAZGF0Ye6hAAAAAHIASgEbAqkC9':'nameWrong',
 '35950|YAAESsAAACABAAZGF0YRRpAAAAACkAngBOAR8C9':'namePositive',
 '44770|YAAESsAAACABAAZGF0YeyCAAAAACEAfwAMAbMBX':'storyCorrect'
};

/* QUIET REPEATED-TOUCH PALETTE — deliberately not a click, knock or thud.
 * Small shaped noise burst with a 12ms soft onset, no pitched/beep component.
 * Web Audio is created only on a user gesture; no network requests or new files.
 */
let softCtx=null,softBuffer=null;
function softContact(kind){
 const v=level();if(!v)return false;
 try{
  if(!softCtx){const C=window.AudioContext||window.webkitAudioContext;if(!C)return true;softCtx=new C();}
  if(softCtx.state==='suspended')softCtx.resume().catch(()=>{});
  if(!softBuffer){
   const sr=softCtx.sampleRate,duration=.082,n=Math.round(sr*duration);
   softBuffer=softCtx.createBuffer(1,n,sr);
   const out=softBuffer.getChannelData(0);let smooth=0,seed=2166136261;
   for(let i=0;i<n;i++){
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    const white=(seed/4294967296)*2-1;
    smooth=smooth*.89+white*.11;
    const t=i/sr,attack=Math.min(1,t/.012),release=Math.pow(Math.max(0,1-t/duration),2.2);
    out[i]=smooth*attack*release;
   }
  }
  const src=softCtx.createBufferSource(),filter=softCtx.createBiquadFilter(),gain=softCtx.createGain();
  filter.type='bandpass';filter.frequency.value=950;filter.Q.value=.38;
  gain.gain.value=v*(kind==='letter'?.10:.16);
  src.buffer=softBuffer;src.connect(filter);filter.connect(gain);gain.connect(softCtx.destination);
  src.onended=()=>{try{src.disconnect();filter.disconnect();gain.disconnect()}catch(_){}};
  src.start();return true;
 }catch(_){return true} // Never fall back to the rejected knock.
}
const nativePlay=HTMLMediaElement.prototype.play;
const pools={},slot={},recent={};let token=0,lastClick=null;
function level(){try{return (typeof sfxOn==='undefined'||sfxOn)&&!document.hidden ? (typeof sfxVolume==='undefined'?.65:Math.max(0,Math.min(1,Number(sfxVolume)/100||0))):0}catch(e){return 0}}
function play(type,relative){
 const conf=cues[type];if(!conf||!level())return false;
 const now=Date.now(),threshold=type==='swish'?110:type==='tap'?22:36;
 if(now-(recent[type]||0)<threshold)return false;recent[type]=now;
 if(!pools[type])pools[type]=Array.from({length:3},()=>{const a=new Audio('https://sfxmint.com/dl/'+conf[0]);a.preload='auto';a.playsInline=true;return a});
 const a=pools[type][(slot[type]||0)%3];slot[type]=(slot[type]||0)+1;
 const t=++token,vol=Math.max(0,Math.min(1,(typeof relative==='number'?relative:level())*conf[1]));
 a.__buToken=t;
 try{a.pause();a.currentTime=0;a.volume=vol;a.playbackRate=type==='back'?.88:1;
  if(type==='back'){if('preservesPitch' in a)a.preservesPitch=false;if('webkitPreservesPitch' in a)a.webkitPreservesPitch=false;}
  const p=nativePlay.call(a);if(p&&p.catch)p.catch(()=>{});
  if(type==='swish'||type==='back'){
   const fadeStart=type==='back'?.11:.24,fadeEnd=type==='back'?.23:.37;
   const fade=()=>{if(a.__buToken!==t||a.paused)return;const x=a.currentTime;
    if(x>=fadeEnd){a.pause();return}
    if(x>=fadeStart)a.volume=vol*Math.max(0,(fadeEnd-x)/(fadeEnd-fadeStart));
    requestAnimationFrame(fade)};requestAnimationFrame(fade);
  }
  return true;
 }catch(e){return false}
}
/* Capture the ACTUAL tapped element: Daily answer tiles can be divs, not buttons.
 * pointerdown also covers games that trigger SFX before their click handler runs. */
function rememberTouch(ev){
 const el=ev.target?.nodeType===1?ev.target:ev.target?.parentElement;
 if(!el?.closest)return;
 const action=el.closest('button,a,[role="button"],input,select,summary');
 const words=action?((action.id||'')+' '+(action.getAttribute('aria-label')||'')+' '+(action.textContent||'').slice(0,70)).toLowerCase():'';
 const answer=!!el.closest('.bu375-answer,.bu34-answer,.bu3868-answer,[data-answer],[data-bu375-answer],#btn3926-answers > *,#bu375-daily .bu375-answers > *,#bu3857-screen .bu3868-choices > *');
 const storyLevel=!!el.closest('#journey-stops .route-stop,#episodes .episode-card,.level-card');
 lastClick={at:Date.now(),undo:/undo|reverse/.test(words),answer,storyLevel};
}
window.addEventListener('pointerdown',rememberTouch,true);
window.addEventListener('click',rememberTouch,true);
HTMLMediaElement.prototype.play=function(){
 const u=this.src||'';
 if(!u.startsWith('data:audio/wav;base64,'))return nativePlay.apply(this,arguments);
 let type=id[u.length+'|'+u.slice(56,95)];
 if(!type)return nativePlay.apply(this,arguments);
 if(lastClick&&Date.now()-lastClick.at<250){
  // Quiz answers already have their own correct/retry feedback. Never pile a hard click on top.
  if(lastClick.answer&&['select','navigate','toggle'].includes(type))return Promise.resolve();
  // Opening a Story level gets only a small papery touch, not a wooden knock.
  if(lastClick.storyLevel&&['select','navigate'].includes(type)){softContact('level');return Promise.resolve();}
 }
 if(['navigate','back','select','info','toggle'].includes(type)&&lastClick&&Date.now()-lastClick.at<180){
  if(lastClick.answer)return Promise.resolve();
  if(type==='toggle'&&lastClick.undo)type='undo';
 }
 play(type,Number(this.volume));return Promise.resolve();
};
/* WORD TRAILS: one gentle swish per drag, never a knock per letter.
 * Word Trails calls the global tick() for EACH selected wheel letter.
 * Keep its gameplay handler untouched, but discard that sound only here.
 * The other crossword and Story Adventure wheels retain their own cues. */
function wordTrailsWheel(){
 const w=document.querySelector('#crossword-screen:not([hidden]) #xword-wheel.trail-wheel');
 return w&&w.getClientRects().length?w:null;
}
let wordTrailsSwipe=null;
window.addEventListener('pointerdown',e=>{
 const w=wordTrailsWheel(),letter=e.target?.closest?.('[data-trail-letter]');
 if(w&&letter&&w.contains(letter)){
  wordTrailsSwipe={id:e.pointerId,x:e.clientX,y:e.clientY,played:false};
 }
},true);
window.addEventListener('pointermove',e=>{
 const g=wordTrailsSwipe;
 if(!g||e.pointerId!==g.id)return;
 if(!wordTrailsWheel()){wordTrailsSwipe=null;return;}
 if(!g.played&&Math.hypot(e.clientX-g.x,e.clientY-g.y)>12){
  g.played=true;
  play('swish',level()*.27); // Already shortened to 0.37s; quiet and once only.
 }
},true);
for(const name of ['pointerup','pointercancel']){
 window.addEventListener(name,e=>{
  if(wordTrailsSwipe?.id===e.pointerId)wordTrailsSwipe=null;
 },true);
}
/* Soft parchment contact ONLY for an intentional, stationary wheel-letter tap.
 * Keep drag gestures completely free of letter ticks; existing swish owns dragging.
 * Works with Story Adventure and Word Trails/crossword wheel DOM letter elements.
 * No game input handlers are changed. */
let letterTapCtx=null,letterTapBuffer=null,letterPointer=null,lastLetterTap=0;
function letterTapTarget(raw){
 const el=raw?.nodeType===1?raw:raw?.parentElement;
 if(!el?.closest)return null;
 const crossword=el.closest('#xword-wheel');
 const play=document.getElementById('play');
 const story=play&&!play.hidden&&play.getClientRects().length&&play.contains(el);
 const root=crossword||(story?play:null);
 if(!root||!root.getClientRects().length||root.closest('[hidden]'))return null;
 let node=el;
 while(node&&node!==root){
  const character=(node.textContent||'').trim();
  const explicit=node.matches?.('[data-trail-letter],[data-letter],[data-wheel-letter]');
  if((explicit||(/^[A-Za-z]$/.test(character)&&
       (node.matches?.('button,[role="button"],.letter,.wheel-letter,.tile,span,svg text,svg g')||node.parentElement!==root)))&&
      (character.length<=2||explicit))return {root,letter:node};
  node=node.parentElement;
 }
 // Some wheel implementations draw each hit area on canvas.
 if(story&&el.matches?.('canvas')&&el.closest('#play'))return {root,letter:el};
 return null;
}
function parchmentLetterTap(){
 const v=level(),now=Date.now();
 if(!v||now-lastLetterTap<28)return;
 lastLetterTap=now;
 try{
  const C=window.AudioContext||window.webkitAudioContext;
  if(!C)return;
  if(!letterTapCtx)letterTapCtx=new C();
  if(letterTapCtx.state==='suspended')letterTapCtx.resume().catch(()=>{});
  if(!letterTapBuffer){
   const sr=letterTapCtx.sampleRate,n=Math.round(sr*.058);
   letterTapBuffer=letterTapCtx.createBuffer(1,n,sr);
   const a=letterTapBuffer.getChannelData(0);let smooth=0,seed=274177;
   for(let i=0;i<n;i++){
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    smooth=smooth*.81+((seed/4294967296)*2-1)*.19;
    const t=i/sr,env=Math.min(1,t/.006)*Math.pow(Math.max(0,1-t/.058),2.1);
    a[i]=smooth*env;
   }
  }
  const source=letterTapCtx.createBufferSource();
  const filter=letterTapCtx.createBiquadFilter();
  const gain=letterTapCtx.createGain();
  source.buffer=letterTapBuffer;
  source.playbackRate.value=.97+Math.random()*.06;
  filter.type='bandpass';filter.frequency.value=1450;filter.Q.value=.48;
  gain.gain.value=v*.17;
  source.connect(filter);filter.connect(gain);gain.connect(letterTapCtx.destination);
  source.onended=()=>{try{source.disconnect();filter.disconnect();gain.disconnect()}catch(_){}};
  source.start();
 }catch(_){} // Audio feedback must never block gameplay.
}
window.addEventListener('pointerdown',ev=>{
 if(ev.isPrimary===false)return;
 const hit=letterTapTarget(ev.target);
 letterPointer=hit?{id:ev.pointerId,x:ev.clientX,y:ev.clientY,moved:false,at:Date.now(),root:hit.root}:null;
},true);
window.addEventListener('pointermove',ev=>{
 const g=letterPointer;if(!g||ev.pointerId!==g.id)return;
 if(Math.hypot(ev.clientX-g.x,ev.clientY-g.y)>10)g.moved=true;
},true);
window.addEventListener('pointerup',ev=>{
 const g=letterPointer;if(!g||ev.pointerId!==g.id)return;
 letterPointer=null;
 if(g.moved||Math.hypot(ev.clientX-g.x,ev.clientY-g.y)>10||Date.now()-g.at>650)return;
 if(g.root?.isConnected&&g.root.getClientRects().length)parchmentLetterTap();
},true);
window.addEventListener('pointercancel',ev=>{
 if(letterPointer?.id===ev.pointerId)letterPointer=null;
},true);
for(const [f,type] of [['tick','tap'],['swish','swish']]){
 if(typeof window[f]==='function'){const old=window[f];window[f]=function(){if(window.BUPremiumSFX){
  // Story's own letter buttons make a faint felt/paper brush; swipes keep the approved shortened swoosh.
  if(f==='tick'&&wordTrailsWheel())return; // No knock as the trail passes each letter.
  if(f==='tick'&&lastClick?.answer&&Date.now()-lastClick.at<250){softContact('answer');return;}
  const storyPlay=document.getElementById('play');
  if(f==='tick'&&storyPlay&&!storyPlay.hidden&&storyPlay.getClientRects().length){return;} // No per-letter ticks during drags; pointerup handles deliberate taps.
  play(type);return;
 }return old.apply(this,arguments)}}
}
window.BUPremiumSFX=Object.freeze({play,version:'2026-11-04-parchment-tap-test-v1'});
})();
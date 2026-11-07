/* BIBLE UNFOLDED — WORD TRAILS NEXT · FEEL LAB v2 (Visual Lab only)
   Original audio synthesis, not recordings or assets from Wordscapes.
   Deliberately quiet touch feedback, clear success/bonus/finish separation,
   subtle reward travel, one-time bonus-vault milestone, independent controls.
   Never reads or changes Bible Unfolded live game save / points. */
(()=>{'use strict';
const KEY='bu-wt-next-feel-v2';
const DEF={music:true,sfx:true,motion:true,haptics:true,musicVolume:75,sfxVolume:75};
let pref={...DEF};try{const s=JSON.parse(localStorage.getItem(KEY));
 if(s&&typeof s==='object')pref={...DEF,...s};
 else{const previous=JSON.parse(localStorage.getItem('bu-visual-lab-wordtrails-next-v1'));
  if(previous?.sound===false){pref.music=false;pref.sfx=false}}
}catch(_){}
let ctx=null,master=null,limiter=null,peakGuard=null,signalMeter=null,noise=null;
const EFFECTS_MIX_GAIN=11.2; // Original output bus retained; levels are now mastered at the VOICE stage.
const VOICE_LOUDNESS_BOOST=4.0; // Retain the approved baseline for tap, swipe, and deselect.
const FEATURE_CUE_BOOST=3.25; // Extra volume and body ONLY for non-touch feedback.
const QUIET_CUES=new Set(['touch','trace','undo']);
let activeCueKind='touch';
function cueBoost(kind){return QUIET_CUES.has(kind)?1:FEATURE_CUE_BOOST}
let pendingRewardSounds=new Set();
const last=new Map();let activeCount=0,gestureTick=0;
const $=id=>document.getElementById(id);
const safeReduced=()=>!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const motion=()=>!!pref.motion&&!safeReduced();
const active=()=>!document.hidden;
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(pref))}catch(_){}};
const bound=v=>Math.min(100,Math.max(0,Number(v)||0));
pref.musicVolume=bound(pref.musicVolume);pref.sfxVolume=bound(pref.sfxVolume);
function onMusicChange(){window.dispatchEvent(new Event('bu-wt-audio-change'))}
function sync(){
 document.documentElement.classList.toggle('wt-feel-no-motion',!motion());
 const el=$('app');if(el){el.dataset.feel='v2';el.dataset.motion=motion()?'on':'off'}
 const opts=$('wt-feel-settings');
 if(opts)for(const el of opts.querySelectorAll('[data-pref]')){
  const name=el.dataset.pref;
  if(el.type==='checkbox')el.checked=!!pref[name];
  else el.value=String(pref[name]);
 }
 for(const id of ['musicVolume','sfxVolume']){const node=$('feel-'+id);if(node)node.textContent=pref[id]+'%'}
 const btn=$('audio');
 if(btn){btn.textContent='♫';btn.title='Sound, music and effects settings';
  btn.setAttribute('aria-label','Sound and effects settings');btn.setAttribute('aria-pressed','false')}
}
function audio(){
 if(!pref.sfx||pref.sfxVolume<=0||!active())return null;
 try{
  if(!ctx){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;
   ctx=new C();master=ctx.createGain();master.gain.value=EFFECTS_MIX_GAIN;
   // Original notes stay unchanged. Only the entire SFX bus is amplified.
   // Dynamics compression and a soft peak ceiling protect overlapping chimes.
   let tail=master;
   try{
    limiter=ctx.createDynamicsCompressor();
    limiter.threshold.value=-4;limiter.knee.value=3;
    limiter.ratio.value=18;limiter.attack.value=.002;limiter.release.value=.12;
    tail.connect(limiter);tail=limiter;
   }catch(_){}
   try{
    peakGuard=ctx.createWaveShaper();
    const count=16385, curve=new Float32Array(count),knee=.78,headroom=.19;
    for(let i=0;i<count;i++){
     const x=2*i/(count-1)-1,ax=Math.abs(x);
     const y=ax<=knee?ax:knee+headroom*Math.tanh((ax-knee)/headroom);
     curve[i]=Math.sign(x)*y;
    }
    peakGuard.curve=curve;peakGuard.oversample='2x';
    tail.connect(peakGuard);tail=peakGuard;
   }catch(_){}
   // Lightweight output meter lets our phone-browser QA verify audible signal,
   // rather than trusting a gain-number change alone.
   try{
    signalMeter=ctx.createAnalyser();signalMeter.fftSize=1024;
    tail.connect(signalMeter);signalMeter.connect(ctx.destination);
   }catch(_){tail.connect(ctx.destination)}
  }
  if(ctx.state==='suspended')ctx.resume().catch(()=>{});
  return ctx;
 }catch(_){return null}
}
function vol(g){return g*(pref.sfxVolume/100)*VOICE_LOUDNESS_BOOST*cueBoost(activeCueKind)}
function audioMeter(){
 if(!signalMeter)return {peak:0,rms:0,state:ctx?.state||'uninitialized'};
 const arr=new Float32Array(signalMeter.fftSize);
 try{signalMeter.getFloatTimeDomainData(arr)}catch(_){return {peak:0,rms:0,state:ctx?.state||'unavailable'}}
 let peak=0,sum=0;for(const n of arr){const a=Math.abs(n);peak=Math.max(peak,a);sum+=n*n}
 return {peak,rms:Math.sqrt(sum/arr.length),state:ctx?.state||'unavailable'};
}
function pluck(f,delay=0,len=.14,gain=.04,shape='sine',to){
 const a=audio();if(!a)return;
 try{
  const t=a.currentTime+delay,osc=a.createOscillator(),g=a.createGain();
  osc.type=shape;osc.frequency.setValueAtTime(Math.max(f,30),t);
  if(to)osc.frequency.exponentialRampToValueAtTime(Math.max(to,30),t+len);
  const peak=Math.max(.00007,vol(gain));
  g.gain.setValueAtTime(.00005,t);
  g.gain.exponentialRampToValueAtTime(peak,t+.011);
  if(!QUIET_CUES.has(activeCueKind)){
   // Bigger perceived loudness: keep a short body on reward chimes instead
   // of only boosting an inaudible 11ms transient into the peak limiter.
   g.gain.exponentialRampToValueAtTime(Math.max(.00007,peak*.81),
     t+Math.min(len*.58,Math.max(.015,len-.025)));
  }
  g.gain.exponentialRampToValueAtTime(.00005,t+len);
  osc.connect(g);g.connect(master);osc.start(t);osc.stop(t+len+.02);
  osc.onended=()=>{osc.disconnect();g.disconnect()};
 }catch(_){}
}
function air(delay=0,duration=.07,gain=.012,freq=1200){
 const a=audio();if(!a)return;
 try{
  if(!noise){
   noise=a.createBuffer(1,Math.round(a.sampleRate*.30),a.sampleRate);
   const d=noise.getChannelData(0);let smooth=0,seed=23849310;
   for(let i=0;i<d.length;i++){
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    smooth=.73*smooth+.27*((seed/4294967296)*2-1);d[i]=smooth;
   }
  }
  const source=a.createBufferSource(),filter=a.createBiquadFilter(),g=a.createGain();
  const t=a.currentTime+delay;source.buffer=noise;filter.type='bandpass';filter.frequency.value=freq;filter.Q.value=.47;
  const peak=Math.max(.00008,vol(gain));
  g.gain.setValueAtTime(.00005,t);
  g.gain.linearRampToValueAtTime(peak,t+.012);
  if(!QUIET_CUES.has(activeCueKind)){
   g.gain.exponentialRampToValueAtTime(Math.max(.00008,peak*.72),t+duration*.58);
  }
  g.gain.exponentialRampToValueAtTime(.00005,t+duration);
  source.connect(filter);filter.connect(g);g.connect(master);source.start(t);source.stop(t+duration+.006);
  source.onended=()=>{source.disconnect();filter.disconnect();g.disconnect()};
 }catch(_){}
}
function cue(kind){
 if(!pref.sfx||!active())return;
 const now=performance.now(),gap=kind==='trace'?48:kind==='touch'?54:kind==='wrong'?130:110;
 if(now-(last.get(kind)||-5000)<gap)return;last.set(kind,now);
 // Retain identical tap, swipe and undo samples/envelopes, while giving
 // the other existing cues more sustained presence on phone speakers.
 activeCueKind=kind;
 try{switch(kind){
  case 'touch': air(0,.065,.018,1000);pluck(660,0,.064,.008,'sine',550);break;
  case 'undo': air(0,.051,.011,820);pluck(545,0,.065,.006,'sine',480);break;
  case 'wordSettle': pluck(960,0,.12,.007,'sine',840);air(0,.07,.005,1750);break;
  case 'coinLand': pluck(1100,0,.14,.010,'sine',970);break;
  case 'levelEnter': pluck(630,0,.14,.017,'sine');pluck(940,.09,.18,.012,'sine');break;
  case 'trace': {
   const freq=720+(gestureTick++%5)*33;
   air(0,.058,.023,1390);pluck(freq,0,.066,.013,'sine',freq*.91);break;
  }
  case 'shuffle': air(0,.14,.025,950);pluck(540,0,.11,.024,'triangle',730);break;
  case 'wrong': pluck(338,0,.16,.03,'triangle',285);pluck(262,.065,.13,.014,'sine');break;
  case 'hint': pluck(495,0,.19,.035,'sine');pluck(660,.083,.24,.035,'sine');air(.05,.16,.018,1500);break;
  case 'bonus': pluck(784,0,.20,.040,'sine');pluck(988,.085,.26,.041,'sine');pluck(1568,.13,.19,.017,'sine');air(.1,.13,.020,2000);break;
  case 'vault': pluck(523,0,.18,.036,'sine');pluck(659,.10,.20,.043,'sine');pluck(784,.20,.30,.048,'sine');air(.15,.19,.019,1700);break;
  case 'correct':
   pluck(587,0,.16,.030,'triangle');pluck(740,.065,.22,.032,'sine');
   pluck(880,.14,.27,.039,'sine');pluck(1760,.15,.12,.008,'sine');air(.035,.11,.017,1400);break;
  case 'spark': [523,659,784,988,1175].forEach((f,i)=>{pluck(f,.09*i,.39,.033,'sine');pluck(f*2,.09*i,.23,.009,'sine')});air(.1,.24,.015,1850);break;
  case 'complete': [392,523,659,784,1047].forEach((f,i)=>{
   pluck(f,i*.105,.40,.039,'sine');pluck(f*1.5,i*.105,.25,.015,'triangle')
  });air(.33,.24,.022,2300);break;
 }}finally{activeCueKind='touch';}
}
function haptic(pattern){if(!pref.haptics||!motion())return;
 try{navigator.vibrate?.(pattern)}catch(_){}
}
function rectMid(el){
 if(!el)return null;const r=el.getBoundingClientRect(),a=$('app').getBoundingClientRect();
 return {x:r.left-a.left+r.width/2,y:r.top-a.top+r.height/2};
}
function coinFlight(origin,count=4){
 if(!motion()||!origin)return;
 const layer=$('wt-feel-layer'),target=rectMid($('points'));
 if(!layer||!target)return;
 for(let i=0;i<Math.min(6,count);i++){
  const dot=document.createElement('i');dot.className='feel-coin';
  dot.textContent='✦';dot.style.left=origin.x+'px';dot.style.top=origin.y+'px';
  layer.appendChild(dot);
  const angle=(i-((count-1)/2))*.16;
  const bend={x:(origin.x+target.x)/2+Math.cos(i*2.1)*33,y:Math.min(origin.y,target.y)-65-Math.sin(i*2.4)*21};
  dot.animate([
   {opacity:0,offset:0,transform:'translate(-50%,-50%) scale(.30)'},
   {opacity:1,offset:.18,transform:'translate('+((bend.x-origin.x)*.5)+'px,'+((bend.y-origin.y)*.5)+'px) scale(1.12)'},
   {opacity:1,offset:.78,transform:'translate('+(bend.x-origin.x)+'px,'+(bend.y-origin.y)+'px) scale(.95)'},
   {opacity:0,offset:1,transform:'translate('+(target.x-origin.x)+'px,'+(target.y-origin.y)+'px) scale(.3)'}
  ],{duration:650+i*48,delay:i*40,easing:'cubic-bezier(.18,.7,.28,1)'}).onfinish=()=>dot.remove();
  setTimeout(()=>dot.remove(),1150);
 }
 $('points')?.classList.remove('feel-coin-arrive');void $('points')?.offsetWidth;
 $('points')?.classList.add('feel-coin-arrive');
 setTimeout(()=>$('points')?.classList.remove('feel-coin-arrive'),650);
}
function coinLanding(){
 // A single coin arrival accent, even if visual effects are switched off.
 const pending=setTimeout(()=>{pendingRewardSounds.delete(pending);cue('coinLand')},790);
 pendingRewardSounds.add(pending);
}
function acclaim(word){
 if(!motion())return;
 const board=$('board'),prog=$('progress-fill');
 if(!board)return;
 board.classList.remove('feel-board-beat');void board.offsetWidth;board.classList.add('feel-board-beat');
 prog?.classList.remove('feel-progress-beat');void prog?.offsetWidth;prog?.classList.add('feel-progress-beat');
 setTimeout(()=>{board.classList.remove('feel-board-beat');prog?.classList.remove('feel-progress-beat')},580);
}
function label(word){
 if(!motion())return;
 const target=$('wt-feel-label');if(!target)return;
 target.textContent=word;target.classList.remove('reveal');void target.offsetWidth;target.classList.add('reveal');
 setTimeout(()=>target.classList.remove('reveal'),920);
}
function event(name,data={}){
 if(name==='level'){
  activeCount=0;gestureTick=0;
  for(const pending of pendingRewardSounds)clearTimeout(pending);
  pendingRewardSounds.clear();return;
 }
 if(name==='correct'){activeCount++;acclaim(data.word);
  // A very gentle landing accent after the tile cascade starts.
  const landing=setTimeout(()=>{pendingRewardSounds.delete(landing);cue('wordSettle')},275);
  pendingRewardSounds.add(landing);
  if(activeCount===3){haptic([7,24,10])}
  if(data.coins>0){coinFlight(rectMid($('board')),4);coinLanding()}
  return;
 }
 if(name==='bonus'){activeCount++;
  if(data.coins>0){coinFlight(rectMid($('bonus-count')),4);coinLanding()}
  const pip=$('bonus-pips');if(pip){pip.classList.remove('feel-pips-pop');void pip.offsetWidth;pip.classList.add('feel-pips-pop')}
  return;
 }
 if(name==='vault'){cue('vault');coinFlight(rectMid($('bonus-count')),6);coinLanding();haptic([7,25,12]);return}
 if(name==='spark'){coinFlight(rectMid($('spark')),6);coinLanding();return}
 if(name==='hint'){acclaim();return}
 if(name==='wrong'){activeCount=0;return}
 if(name==='complete'){activeCount=0;return}
}
/* Posh victory sparkle show — rendered INSIDE the top-layer dialog.
   This avoids the old confetti appearing behind the victory modal.
   Decorative elements never intercept touches, use only transform/opacity,
   and are completely skipped when visual effects or reduced motion are off. */
let winTimers=[];
function clearWinFX(){
 for(const handle of winTimers)clearTimeout(handle);
 winTimers=[];
 const stage=$('finish-fx');if(stage)stage.replaceChildren();
 $('finish')?.classList.remove('wt-winning');
}
function winConfetti(stage,count,phase=0){
 const colors=['#f5cb74','#fff1c6','#cf9544','#d9e9bd','#ffe1a6'];
 const frag=document.createDocumentFragment();
 for(let i=0;i<count;i++){
  const n=document.createElement('i');
  n.className='wt-win-foil';
  const seed=(i*73+phase*41)%101;
  const x=6+((i*47+phase*29)%89);
  const drift=((i*31+phase*17)%135)-68;
  const duration=2100+(i*37)%920;
  const delay=(i*79)%500+(phase?130:0);
  n.style.left=x+'%';
  n.style.setProperty('--wt-drift',drift+'px');
  n.style.setProperty('--wt-turn',(i%2?1:-1)*(380+(seed%260))+'deg');
  n.style.setProperty('--wt-delay',delay+'ms');
  n.style.setProperty('--wt-duration',duration+'ms');
  n.style.setProperty('--wt-tilt',(i*17)%70-35+'deg');
  n.style.background=colors[(i+phase)%colors.length];
  n.style.width=(3+(seed%3))+'px';
  n.style.height=(8+(seed%8))+'px';
  frag.append(n);
 }
 stage.appendChild(frag);
}
function winGlitter(stage,count,phase=0){
 const frag=document.createDocumentFragment();
 for(let i=0;i<count;i++){
  const n=document.createElement('i');
  n.className='wt-win-glint';
  n.textContent=i%5===0?'✧':'✦';
  const angle=((i*137.508+phase*22)%360)*Math.PI/180;
  const radius=55+(i*43)%145;
  n.style.left='50%';n.style.top='20%';
  n.style.fontSize=(10+(i*7)%12)+'px';
  n.style.setProperty('--wt-x',(Math.cos(angle)*radius)+'px');
  n.style.setProperty('--wt-y',(Math.sin(angle)*radius*.70)+'px');
  n.style.setProperty('--wt-delay',((i*41)%330+(phase?370:0))+'ms');
  n.style.setProperty('--wt-duration',(990+(i*53)%730)+'ms');
  frag.append(n);
 }
 stage.appendChild(frag);
}
function celebrateWin(){
 clearWinFX();
 const dialog=$('finish'),stage=$('finish-fx');
 if(!motion()||!stage||!dialog?.open)return;
 dialog.classList.add('wt-winning');
 winConfetti(stage,58);
 winGlitter(stage,27);
 const second=setTimeout(()=>{
  if(dialog.open&&motion()){
   winConfetti(stage,25,1);
   winGlitter(stage,14,1);
  }
 },780);winTimers.push(second);
 const cleanup=setTimeout(()=>{stage.replaceChildren();winTimers=[]},4300);
 winTimers.push(cleanup);
}
function state(){return {...pref}}
function change(name,value){
 if(!Object.prototype.hasOwnProperty.call(DEF,name))return;
 if(name.endsWith('Volume'))pref[name]=bound(value);else pref[name]=!!value;
 save();sync();if(name==='music'||name==='musicVolume')onMusicChange();
 if(name==='sfx'&&pref.sfx)cue('correct');
 if(name==='sfxVolume')cue('touch');
}
function settings(){
 const dlg=$('wt-feel-settings');if(!dlg)return;
 sync();if(!dlg.open)dlg.showModal();
}
function makeSettings(){
 const node=document.createElement('div');node.id='wt-feel-layer';
 node.className='wt-feel-layer';node.setAttribute('aria-hidden','true');
 node.innerHTML='<span class="feel-callout" id="wt-feel-label"></span>';
 $('app')?.appendChild(node);
 const bar=$('bonus-count')?.parentElement;
 if(bar){
  const p=document.createElement('span');p.className='feel-bonus-pips';p.id='bonus-pips';p.setAttribute('aria-label','Bonus satchel progress');
  p.innerHTML='<i></i><i></i><i></i>';bar.appendChild(p);
 }
 const dlg=document.createElement('dialog');dlg.id='wt-feel-settings';
 dlg.setAttribute('aria-labelledby','feel-settings-title');
 dlg.innerHTML='<div class="feel-settings-panel"><div class="feel-settings-heading">'+
 '<span class="feel-kicker">WORD TRAILS · VISUAL LAB</span>'+
 '<button id="feel-close" type="button" aria-label="Close settings">×</button></div>'+
 '<h2 id="feel-settings-title">Sound & Feel</h2>'+
 '<p>Fine-tune how the game responds. Your choices are saved for this test only.</p>'+
 '<label class="feel-toggle"><span><strong>Background music</strong><small>Gentle Word Trails soundtrack</small></span><input data-pref="music" type="checkbox"></label>'+
 '<label class="feel-slider">Music level <span id="feel-musicVolume">75%</span><input type="range" min="0" max="100" step="5" data-pref="musicVolume"></label>'+
 '<label class="feel-toggle"><span><strong>Sound effects</strong><small>Soft swipes, rewards and discoveries</small></span><input data-pref="sfx" type="checkbox"></label>'+
 '<label class="feel-slider">Effects level <span id="feel-sfxVolume">75%</span><input type="range" min="0" max="100" step="5" data-pref="sfxVolume"></label>'+
 '<label class="feel-toggle"><span><strong>Visual effects</strong><small>Particles, coin trails and celebrations</small></span><input data-pref="motion" type="checkbox"></label>'+
 '<label class="feel-toggle"><span><strong>Vibration feedback</strong><small>When supported by your phone</small></span><input data-pref="haptics" type="checkbox"></label>'+
 '<div class="feel-demo"><span>Hear the new cues</span><div>'+
 '<button type="button" data-demo="trace">Trace</button>'+
 '<button type="button" data-demo="correct">Correct</button>'+
 '<button type="button" data-demo="bonus">Bonus</button>'+
 '<button type="button" data-demo="complete">Finish</button></div></div>'+
 '<button id="feel-done" class="feel-done" type="button">Back to Puzzle</button></div>';
 document.body.appendChild(dlg);
 dlg.addEventListener('change',e=>{
  const el=e.target.closest?.('[data-pref]');if(el)change(el.dataset.pref,el.type==='checkbox'?el.checked:el.value);
 });
 dlg.addEventListener('input',e=>{
  const el=e.target.closest?.('[data-pref]');if(el&&el.type==='range')change(el.dataset.pref,el.value);
 });
 dlg.addEventListener('click',e=>{
  if(e.target.closest('#feel-done,#feel-close'))dlg.close();
  const demo=e.target.closest('[data-demo]');if(demo)cue(demo.dataset.demo);
 });
 dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close()});
 $('finish')?.addEventListener('close',clearWinFX);
 sync();
}
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){for(const pending of pendingRewardSounds)clearTimeout(pending);pendingRewardSounds.clear()}
});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',makeSettings,{once:true});
else makeSettings();
window.BUWTPolish=Object.freeze({
 cue,event,celebrateWin,clearWinFX,openSettings:settings,mixGain:()=>EFFECTS_MIX_GAIN,
 voiceBoost:()=>VOICE_LOUDNESS_BOOST,featureBoost:cueBoost,audioMeter,
 musicEnabled:()=>!!pref.music&&pref.musicVolume>0,
 musicVolume:()=>pref.musicVolume,sfxEnabled:()=>!!pref.sfx,sfxVolume:()=>pref.sfxVolume,
 motionEnabled:motion,hapticsEnabled:()=>!!pref.haptics&&motion(),haptic,state,
 bonusPips:(n)=>{const bar=$('bonus-pips');if(!bar)return;
  const p=Math.max(0,Math.min(3,Number(n)||0));bar.dataset.fill=String(p);
  bar.querySelectorAll('i').forEach((el,i)=>el.classList.toggle('on',i<p));
 }
});
})();
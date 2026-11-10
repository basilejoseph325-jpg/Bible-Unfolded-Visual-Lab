/* Original Bible Unfolded noncommercial announcer voice controller.
   Uses SAME prerecorded clips (Charlie, Paul, Toby, Julian) and SAME prefs
   as the main game. Never uses device TTS substitutes. Visual Lab only. */
(()=>{'use strict';
const KEY='bible-unfolded-private-voice-pref-v381';
const BAK='bible-unfolded-voice-pref-recovery-v3813';
const modes=['rotate','off','charlie','paul','toby','julian'];
const voices=['charlie','paul','toby','julian'];
const phrases=['excellent_thinking','another_discovery','youre_on_a_roll','chapter_complete','beautifully_done'];
const $=id=>document.getElementById(id);
const nativeShell=()=>{try{return parent!==window&&parent.BUWTNativeShell?.active?.()?parent.BUWTNativeShell:null}catch(_){return null}};
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch(_){return null}};
let settings=read(KEY)||read(BAK)||{};
let mode=modes.includes(settings.mode)?settings.mode:'rotate';
let volume=Number.isFinite(settings.volume)?Math.max(0,Math.min(100,settings.volume)):65;
let now=null,lastVoice='',lastPlay=0,phraseAt=new Map();
const cache=new Map();
const status=txt=>{const el=$('wt-voice-status');if(el)el.textContent=txt};

/* Re-use the REAL native announcer, never synthesize or impersonate its voices.
   When its 12s cooldown or active clip rejects a rare mid-puzzle request,
   retry only while this exact crossword is still being played. A rejected
   request used to be lost forever, which silenced short levels on phones. */
let pendingVoice=null,retryTimer=0,progressDelivered=false;
const delayMs=1300,queueLifetimeMs=40000;
function clearPending(){
 if(retryTimer){clearTimeout(retryTimer);retryTimer=0}
 pendingVoice=null;
}
function resetProgress(){
 clearPending();progressDelivered=false;
}
function cancelProgress(){
 if(pendingVoice?.phase==='progress')clearPending();
}
function schedulePending(){
 if(!retryTimer)retryTimer=setTimeout(()=>{
  retryTimer=0;attemptPending();
 },delayMs);
}
function attemptPending(){
 const request=pendingVoice;if(!request)return false;
 const native=nativeShell();
 if(!native||!native.active()||Date.now()>request.expiresAt){clearPending();return false}
 const prefs=native.voicePrefs?.();
 if(!prefs||prefs.mode==='off'||!Number.isFinite(prefs.volume)||prefs.volume<=0){
  clearPending();return false;
 }
 // Never announce an old crossword after its completion/exit or next level.
 if(request.phase==='progress'&&$('finish')?.open){clearPending();return false}
 if(request.phase==='complete'&&request.attempts>0&&!$('finish')?.open){
  clearPending();return false
 }
 if(document.hidden||nativeShell()?.active?.()===false||
    $('discovery')?.open||$('map')?.open){
  schedulePending();return false
 }
 request.attempts++;
 const accepted=native.playVoice(request.phrase,request.options);
 if(accepted){
  if(request.phase==='progress')progressDelivered=true;
  clearPending();return true;
 }
 schedulePending();return false
}
function queueNative(phase,phrase,options){
 const prefs=nativeShell()?.voicePrefs?.();
 if(!prefs||prefs.mode==='off'||prefs.volume<=0)return false;
 if(phase==='progress'&&progressDelivered)return false;
 if(pendingVoice?.phase!==phase||pendingVoice?.phrase!==phrase){
  clearPending();
  pendingVoice={phase,phrase,options,expiresAt:Date.now()+queueLifetimeMs,attempts:0};
 }
 return attemptPending();
}
function progress(){
 if(progressDelivered)return true;
 const native=nativeShell();
 if(native)return queueNative('progress','excellent_thinking',{milestone:true});
 const accepted=play('excellent_thinking',{milestone:true});
 if(accepted)progressDelivered=true;
 return accepted;
}

function store(){
 const payload=JSON.stringify({mode,volume});
 try{localStorage.setItem(KEY,payload);localStorage.setItem(BAK,payload)}catch(_){status('Could not save voice preference.')}
}
function stop(){
 clearPending();
 if(!now)return;const a=now;now=null;
 try{a.pause();a.currentTime=0;a.onended=a.onerror=null}catch(_){}
}
function blobUri(raw){
 if(!raw?.startsWith('data:audio/mpeg;base64,'))return raw;
 if(cache.has(raw))return cache.get(raw);
 try{
  const r=atob(raw.slice(raw.indexOf(',')+1)),bytes=new Uint8Array(r.length);
  for(let i=0;i<r.length;i++)bytes[i]=r.charCodeAt(i);
  const url=URL.createObjectURL(new Blob([bytes],{type:'audio/mpeg'}));
  cache.set(raw,url);return url;
 }catch(_){return raw}
}
function choose(){
 if(mode!=='rotate')return mode==='off'?'charlie':mode;
 const pool=voices.filter(v=>v!==lastVoice);
 return pool[Math.floor(Math.random()*pool.length)]||'charlie';
}
function play(phrase,{milestone=false,preview=false,queueIfBlocked=false}={}){
 const native=nativeShell();
 if(native){
  if(queueIfBlocked&&!preview&&phrase==='chapter_complete'){
   // A very fast crossword finish can follow a genuine midgame clip within
   // the native 12-second cooldown. Prioritize its real ending recording
   // without changing the owner's voice, volume or Off preference. The
   // original native sample/preview path deliberately stops an older voice
   // instead of layering two announcer recordings over each other.
   const chosen=native.voicePrefs?.();
   let rootPlayingWatch=false;
   try{rootPlayingWatch=!!(parent.document.getElementById('watch-player')&&!parent.document.getElementById('watch-player').hidden)}catch(_){}
   // Do not even attempt playback if the player disabled announcers.
   if(!chosen||chosen.mode==='off'||chosen.volume<=0||document.hidden||rootPlayingWatch)return false;
   if(native.playVoice(phrase,{milestone}))return true;
   return native.playVoice(phrase,{milestone:true,preview:true});
  }
  return native.playVoice(phrase,{milestone,preview});
 }
 if(!phrases.includes(phrase)||document.hidden||volume<=0||(!preview&&mode==='off'))return false;
 if(!window.BUWTVoiceClips){if(preview)status('Original announcer recordings are unavailable.');return false}
 if(!preview){
  if(now&&!milestone)return false;
  const t=Date.now();
  if(t-lastPlay<(milestone?12000:45000))return false;
  if(!milestone&&t-(phraseAt.get(phrase)||0)<90000)return false;
 }
 if(preview||milestone)stop();
 const who=choose(),raw=window.BUWTVoiceClips[who+'_'+phrase];
 if(!raw){if(preview)status('That original recording is unavailable.');return false}
 const audio=new Audio(blobUri(raw));audio.preload='auto';audio.volume=volume/100;audio.playsInline=true;
 now=audio;
 const done=()=>{if(now===audio)now=null};
 audio.onended=done;audio.onerror=()=>{done();if(preview)status('Voice could not load. Try the sample again.')};
 let promise;
 try{promise=audio.play()}catch(_){done();return false}
 if(promise?.then)promise.then(()=>{
  lastVoice=who;
  if(!preview){lastPlay=Date.now();phraseAt.set(phrase,lastPlay)}
  else status('Playing '+who.charAt(0).toUpperCase()+who.slice(1)+' · '+phrase.replaceAll('_',' '));
 }).catch(()=>{done();if(preview)status('Audio blocked: tap the sample again.')});
 return true;
}
function change(m,v){
 const native=nativeShell();if(native){const changed=native.changeVoice(m,v);window.dispatchEvent(new Event('bu-wt-voice-change'));return changed;}
 if(modes.includes(m))mode=m;
 if(v!==undefined)volume=Math.max(0,Math.min(100,Number(v)||0));
 if(mode==='off')stop();else if(now)now.volume=volume/100;
 store();
}
window.addEventListener('storage',e=>{
 if(e.key!==KEY&&e.key!==BAK)return;
 const p=read(KEY)||read(BAK);
 if(p&&modes.includes(p.mode)){mode=p.mode;volume=Math.max(0,Math.min(100,Number(p.volume)||0))}
 window.dispatchEvent(new Event('bu-wt-voice-change'));
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
window.addEventListener('pagehide',stop);
window.BUWTAnnouncer=Object.freeze({
 play,progress,cancelProgress,resetProgress,stop,change,getMode:()=>nativeShell()?.voicePrefs().mode||mode,
 getVolume:()=>nativeShell()?.voicePrefs().volume??volume,
 available:()=>nativeShell()?true:!!window.BUWTVoiceClips&&Object.keys(window.BUWTVoiceClips).length>=20
});
})();
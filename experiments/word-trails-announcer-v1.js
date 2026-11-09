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
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch(_){return null}};
let settings=read(KEY)||read(BAK)||{};
let mode=modes.includes(settings.mode)?settings.mode:'rotate';
let volume=Number.isFinite(settings.volume)?Math.max(0,Math.min(100,settings.volume)):65;
let now=null,lastVoice='',lastPlay=0,phraseAt=new Map();
const cache=new Map();
const status=txt=>{const el=$('wt-voice-status');if(el)el.textContent=txt};
function store(){
 const payload=JSON.stringify({mode,volume});
 try{localStorage.setItem(KEY,payload);localStorage.setItem(BAK,payload)}catch(_){status('Could not save voice preference.')}
}
function stop(){
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
function play(phrase,{milestone=false,preview=false}={}){
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
 play,stop,change,getMode:()=>mode,getVolume:()=>volume,
 available:()=>!!window.BUWTVoiceClips&&Object.keys(window.BUWTVoiceClips).length>=20
});
})();
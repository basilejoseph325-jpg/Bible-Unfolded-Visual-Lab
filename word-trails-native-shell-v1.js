/* Bible Unfolded Visual Lab — native Word Trails host v1.
 * The native homepage stays the sole owner of the drawer, Settings, Rewards,
 * announcer and navigation. Crossword state and approved cues stay in the frame.
 * TEST ONLY: never injected into Story-Trails LIVE. */
(()=>{'use strict';
if(window.BUWTNativeShell)return;
const FRAME_URL='experiments/word-trails-next-v1.html?v=shared-restore-v2';
let shell=null,frame=null,opening=false,dailyFrame=null,dailyBackPending=false;
const $=id=>document.getElementById(id);
function active(){return !!shell?.isConnected}
function nativeReady(){return !!($('game-menu')&&$('settings-dialog')&&$('home-menu')&&
  typeof window.openMenu==='function'&&typeof window.openDialog==='function')}
/* The original pauseAudio() fades v1 WebAudio only. Current home-screen
 * music lives in seven HTMLAudioElements (bu25Audio) and can restart from a
 * menu/Settings pointerdown. Keep their *original* muted flags in a scoped
 * lease while the native Word Trails iframe owns the soundtrack. The parent
 * soundtrack's 90-ms fade timer changes volume but never unmutes; this holds
 * even when navigating Settings or returning to play. */
const ROOT_MUSIC_IDS=['music-navigation','music-story','music-trails','music','music-daily','music-builder','music-name'];
const rootMusicMuteLease=new Map();
function pauseHome(){
 if(!active())return;
 try{if(typeof window.pauseAudio==='function')window.pauseAudio()}catch(_){}
 for(const id of ROOT_MUSIC_IDS){
  const player=$(id);
  if(!(player instanceof HTMLMediaElement))continue;
  if(!rootMusicMuteLease.has(player))rootMusicMuteLease.set(player,player.muted);
  player.muted=true;
  if(!player.paused)try{player.pause()}catch(_){}
 }
}
function resumeHome(){
 // Restore the user's original mute choices, NOT a hardcoded unmute.
 for(const [player,previouslyMuted] of rootMusicMuteLease){
  try{player.muted=previouslyMuted}catch(_){}
 }
 rootMusicMuteLease.clear();
 try{if(typeof window.syncMusic==='function')window.syncMusic()}catch(_){}
}
function audioPrefs(){
 const music=$('setting-music'),sfx=$('setting-sfx'),mv=$('setting-volume'),
  sv=$('setting-sfx-volume'),motion=$('setting-motion');
 if(!music||!sfx||!mv||!sv)return null;
 return {music:music.checked,sfx:sfx.checked,musicVolume:Number(mv.value),
  sfxVolume:Number(sv.value),motion:motion?!motion.checked:true};
}
function applyAudio(){
 if(!active())return;
 const prefs=audioPrefs(),child=frame?.contentWindow;
 if(!prefs||!child?.BUWTPolish)return;
 for(const [k,v] of Object.entries(prefs))
  child.BUWTPolish.setPreference(k,v,{silent:true,persist:false});
 child.BUWTMainSettings?.draw?.();
 pauseHome();
}
function voicePrefs(){
 const mode=$('bu381-voice-mode'),volume=$('bu381-voice-volume');
 return {mode:mode?.value||'rotate',volume:Number(volume?.value??65)};
}
function changeVoice(mode,volume){
 const sel=$('bu381-voice-mode'),slider=$('bu381-voice-volume');
 if(!sel||!slider)return false;
 if(mode&&sel.querySelector('option[value="'+mode+'"]')){
  sel.value=mode;sel.dispatchEvent(new Event('change',{bubbles:true}));
 }
 if(volume!==undefined&&Number.isFinite(Number(volume))){
  slider.value=String(Math.max(0,Math.min(100,Number(volume))));
  slider.dispatchEvent(new Event('input',{bubbles:true}));
  slider.dispatchEvent(new Event('change',{bubbles:true}));
 }
 return true;
}
function playVoice(phrase,opts){
 try{return typeof window.bu381Play==='function'&&window.bu381Play(phrase,opts)!==false}
 catch(_){return false}
}
function closeDaily({restoreHistory=true}={}){
 if(!dailyFrame?.isConnected)return false;
 dailyFrame.remove();dailyFrame=null;
 try{frame?.contentWindow?.dispatchEvent(new Event('bu-wt-daily-leave'))}catch(_){}
 pauseHome();
 if(restoreHistory&&location.hash==='#daily-word-trail'){
  dailyBackPending=true;
  history.back();
 }
 return true;
}
function openDaily(){
 if(!active())return false;
 if(dailyFrame?.isConnected)return true;
 try{window.closeMenu?.();window.closeDialog?.()}catch(_){}
 try{frame?.contentWindow?.dispatchEvent(new Event('bu-wt-daily-enter'))}catch(_){}
 const daily=document.createElement('iframe');
 daily.id='bu-wt-daily-frame';daily.title='Daily Word Trail';
 daily.src='experiments/word-trails-daily-v1.html?embedded=word-trails&v=shared-restore-v2'+
  (window.BUPreviewStorageFence?.active&&!window.BUPreviewStorageFence.standardMode?'&bu_shared_wallet_preview=1':'');
 daily.allow='autoplay';
 shell.appendChild(daily);dailyFrame=daily;
 history.pushState({buWtDaily:true},'','#daily-word-trail');
 pauseHome();
 return true;
}
function bindDailyLinks(){
 const doc=frame?.contentDocument;
 if(!doc||doc.__buDailyBound)return;
 doc.__buDailyBound=true;
 doc.addEventListener('click',event=>{
  const button=event.target?.closest?.('[data-wt-open-daily]');
  if(!button)return;
  event.preventDefault();event.stopImmediatePropagation();
  openDaily();
 },true);
}
function close({restoreHistory=true}={}){
 if(!active())return false;
 if(dailyFrame){dailyFrame.remove();dailyFrame=null}
 dailyBackPending=false;
 try{window.closeMenu?.();window.closeDialog?.()}catch(_){}
 shell.remove();shell=null;frame=null;opening=false;
 document.documentElement.classList.remove('bu-wt-native-active');
 if(restoreHistory&&['#word-trails','#daily-word-trail'].includes(location.hash))
  history.replaceState({},'',location.pathname+location.search);
 resumeHome();return true;
}
function launch(){
 if(active())return true;
 if(!nativeReady()||opening)return false;
 opening=true;
 const root=document.createElement('section');
 root.id='bu-wt-native-shell';root.setAttribute('aria-label','Word Trails game');
 const iframe=document.createElement('iframe');
 iframe.id='bu-wt-native-game';iframe.title='Bible Unfolded Word Trails';
 iframe.allow='autoplay';
 const preview=window.BUPreviewStorageFence?.active===true;
 if(preview){
  const response=window.BUTestInsightBridge?.nativeBalance?.();
  if(!response?.ok){opening=false;alert('Shared TEST tokens could not be prepared. No game data changed.');return false;}
 }
 iframe.src=preview&&!window.BUPreviewStorageFence.standardMode?FRAME_URL+'&bu_shared_wallet_preview=1':FRAME_URL;
 root.appendChild(iframe);
 document.body.appendChild(root);shell=root;frame=iframe;
 document.documentElement.classList.add('bu-wt-native-active');
 if(location.hash!=='#word-trails')history.pushState({buWt:true},'','#word-trails');
 iframe.addEventListener('load',()=>{opening=false;applyAudio();bindDailyLinks();pauseHome()});
 pauseHome();return true;
}
function openMenu(){
 if(!active())return false;
 pauseHome();window.openMenu();return true;
}
function openSettings(){
 if(!active())return false;
 window.openDialog('settings');return true;
}
function wordTrailsHelp(){
 try{window.closeMenu();frame?.contentWindow?.BUWTUnifiedMenu?.showLocal?.('help')}catch(_){}
}
document.addEventListener('click',event=>{
 if(!active())return;
 const menuAction=event.target.closest?.('#game-menu [data-nav]');
 if(menuAction){
  const action=menuAction.dataset.nav;
  if(action==='continue'){
   event.preventDefault();event.stopImmediatePropagation();window.closeMenu();return;
  }
  if(action==='help'){
   event.preventDefault();event.stopImmediatePropagation();wordTrailsHelp();return;
  }
  if(action!=='settings')close();
  return;
 }
 if(event.target.closest?.('#menu-crossword')){
  event.preventDefault();event.stopImmediatePropagation();window.closeMenu();
 }
},true);
document.addEventListener('input',event=>{
 if(!active())return;
 if(event.target.closest?.('#settings-dialog'))queueMicrotask(applyAudio);
},true);
document.addEventListener('change',event=>{
 if(!active())return;
 if(event.target.closest?.('#settings-dialog'))queueMicrotask(applyAudio);
},true);
window.addEventListener('popstate',()=>{
 if(dailyBackPending){dailyBackPending=false;return}
 if(dailyFrame?.isConnected){closeDaily({restoreHistory:false});return}
 if(active())close({restoreHistory:false});
});
window.addEventListener('pageshow',()=>{if(active())applyAudio()});
const css=document.createElement('style');css.id='bu-wt-native-shell-style';
css.textContent='#bu-wt-native-shell{position:fixed!important;inset:0!important;z-index:2000!important;background:#092b34!important;overflow:hidden!important}'+
 '#bu-wt-native-game{display:block;width:100%;height:100%;border:0;background:#092b34}'+
 '#bu-wt-daily-frame{position:absolute!important;inset:0!important;z-index:4!important;display:block!important;width:100%!important;height:100%!important;border:0!important;background:#0a2c35!important}'+
 'html.bu-wt-native-active #menu-mask{z-index:5001!important}'+
 'html.bu-wt-native-active #game-menu{z-index:5002!important}'+
 'html.bu-wt-native-active #dialog-mask{z-index:5101!important}'+
 'html.bu-wt-native-active #settings-dialog,html.bu-wt-native-active #help-dialog{z-index:5102!important}';
document.head.appendChild(css);
window.BUWTNativeShell=Object.freeze({
 version:'1.0.0-test',launch,close,active,nativeReady,openMenu,openSettings,
 audioPrefs,applyAudio,voicePrefs,changeVoice,playVoice,openDaily,closeDaily
});
})();
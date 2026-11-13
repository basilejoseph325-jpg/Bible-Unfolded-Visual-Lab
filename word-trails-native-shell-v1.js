/* Bible Unfolded Visual Lab — native Word Trails host v1.
 * The native homepage stays the sole owner of the drawer, Settings, Rewards,
 * announcer and navigation. Crossword state and approved cues stay in the frame.
 * TEST ONLY: never injected into Story-Trails LIVE. */
(()=>{'use strict';
if(window.BUWTNativeShell)return;
const FRAME_URL='experiments/word-trails-next-v1.html?v=single-audio-owner-20261113';
let shell=null,frame=null,opening=false;
const $=id=>document.getElementById(id);
function active(){return !!shell?.isConnected}
function nativeReady(){return !!($('game-menu')&&$('settings-dialog')&&$('home-menu')&&
  typeof window.openMenu==='function'&&typeof window.openDialog==='function')}
function pauseHome(){try{if(typeof window.pauseAudio==='function')window.pauseAudio()}catch(_){}}
function resumeHome(){try{if(typeof window.syncMusic==='function')window.syncMusic()}catch(_){}}
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
function close({restoreHistory=true}={}){
 if(!active())return false;
 try{window.closeMenu?.();window.closeDialog?.()}catch(_){}
 shell.remove();shell=null;frame=null;opening=false;
 document.documentElement.classList.remove('bu-wt-native-active');
 if(restoreHistory&&location.hash==='#word-trails')
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
 iframe.allow='autoplay';iframe.src=FRAME_URL;
 root.appendChild(iframe);
 document.body.appendChild(root);shell=root;frame=iframe;
 document.documentElement.classList.add('bu-wt-native-active');
 if(location.hash!=='#word-trails')history.pushState({buWt:true},'','#word-trails');
 iframe.addEventListener('load',()=>{opening=false;applyAudio();pauseHome()});
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
window.addEventListener('popstate',()=>{if(active())close({restoreHistory:false})});
window.addEventListener('pageshow',()=>{if(active())applyAudio()});
const css=document.createElement('style');css.id='bu-wt-native-shell-style';
css.textContent='#bu-wt-native-shell{position:fixed!important;inset:0!important;z-index:2000!important;background:#092b34!important;overflow:hidden!important}'+
 '#bu-wt-native-game{display:block;width:100%;height:100%;border:0;background:#092b34}'+
 'html.bu-wt-native-active #menu-mask{z-index:5001!important}'+
 'html.bu-wt-native-active #game-menu{z-index:5002!important}'+
 'html.bu-wt-native-active #dialog-mask{z-index:5101!important}'+
 'html.bu-wt-native-active #settings-dialog,html.bu-wt-native-active #help-dialog{z-index:5102!important}';
document.head.appendChild(css);
window.BUWTNativeShell=Object.freeze({
 version:'1.0.0-test',launch,close,active,nativeReady,openMenu,openSettings,
 audioPrefs,applyAudio,voicePrefs,changeVoice,playVoice
});
})();
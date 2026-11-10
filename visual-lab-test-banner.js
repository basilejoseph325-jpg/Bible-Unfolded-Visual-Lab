/* Visual Lab identity marker — TEST repo only.
 * Lives outside layout flow and never receives pointer events.
 * No changes to navigation, game logic, sound, scrolling or live game. */
(()=>{'use strict';
const id='bu-visual-lab-test-banner';
function install(){
  const home=document.getElementById('home');
  if(!home||home.querySelector('#'+id))return;
  if(!document.getElementById(id+'-style')){
    const style=document.createElement('style');
    style.id=id+'-style';
    style.textContent=
      '#home #'+id+'{position:fixed!important;top:0!important;left:50%!important;'+
      'transform:translateX(-50%)!important;z-index:9999!important;'+
      'box-sizing:border-box!important;display:flex!important;align-items:center!important;justify-content:center!important;'+
      'height:25px!important;min-width:100px!important;padding:0 17px!important;'+
      'border:1px solid #ffe69c!important;border-top:0!important;border-radius:0 0 12px 12px!important;'+
      'background:linear-gradient(135deg,#ffe969 0%,#ffb42d 53%,#ff713b 100%)!important;'+
      'color:#1b2134!important;font:900 14px/1 system-ui,-apple-system,sans-serif!important;'+
      'letter-spacing:.19em!important;text-shadow:0 1px 0 #fff5!important;'+
      'box-shadow:0 3px 12px #00131db3, inset 0 -1px 0 #7c2b0066!important;'+
      'pointer-events:none!important;user-select:none!important;-webkit-user-select:none!important;}';
    document.head.appendChild(style);
  }
  const ribbon=document.createElement('div');
  ribbon.id=id;
  ribbon.textContent='TEST';
  ribbon.setAttribute('aria-label','Test game');
  home.appendChild(ribbon);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
else install();
})();
/* Load new Word Trails selector only within the isolated Visual Lab. */
(()=>{const s=document.createElement('script');s.src='word-trails-next-launcher.js?v=word-trails-home-image-nov09-v3';s.defer=true;document.head.appendChild(s)})();


/* Word Trails standalone page -> existing Bible Unfolded screens.
   The native main game owns these screens. Handoff only changes navigation
   after it is loaded; never touches its reward logic, progress or display. */
(()=>{'use strict';
 const key=new URLSearchParams(location.search).get('wt_nav');
 if(!key)return;
 const targets={journey:'home-journey',gallery:'home-gallery',rewards:'home-shop',about:'home-menu',settings:'home-menu'};
 if(!targets[key])return;
 let attempts=0;
 const jump=()=>{
  if(attempts++>22)return;
  const button=document.getElementById(targets[key]);
  if(!button){setTimeout(jump,300);return}
  if(key==='about'){
   button.click();
   setTimeout(()=>document.getElementById('bu3925-about-menu')?.click(),180);
  }else if(key==='settings'){
   button.click();
   setTimeout(()=>document.getElementById('menu-settings')?.click(),230);
  }else button.click();
 };
 if(document.readyState==='complete')setTimeout(jump,330);
 else window.addEventListener('load',()=>setTimeout(jump,330),{once:true});
})();


/* Visual Lab-only shared Settings synchronization:
   Main Bible Unfolded retains its native Settings/sound engine and Word Trails
   retains its game-specific SFX synthesis. These four preference controls
   synchronize across both game modes; we never replace main audio playback. */
(()=>{'use strict';
 if(location.pathname.includes('/experiments/'))return;
 const KEY='bu-platform-audio-preferences-v1';
 const ids={music:'setting-music',sfx:'setting-sfx',musicVolume:'setting-volume',
  sfxVolume:'setting-sfx-volume',motion:'setting-motion'};
 const els={};let applying=false,installed=false,attempts=0;
 const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch(_){return null}};
 const pct=v=>Math.max(0,Math.min(100,Number(v)||0));
 function snapshot(){
  return {music:els.music.checked,sfx:els.sfx.checked,
   musicVolume:pct(els.musicVolume.value),sfxVolume:pct(els.sfxVolume.value),
   motion:!els.motion.checked};
 }
 function save(){
  if(applying)return;
  try{localStorage.setItem(KEY,JSON.stringify({...snapshot(),updated:Date.now(),source:'main'}))}catch(_){}
 }
 function initial(){
  const stored=read();if(!stored||stored.source!=='trails')return;
  applying=true;
  try{
   for(const key of ['music','sfx','musicVolume','sfxVolume','motion']){
    if(!Object.prototype.hasOwnProperty.call(stored,key))continue;
    const el=els[key],value=key==='motion'?!stored[key]:stored[key];
    if(el.type==='checkbox'){
     if(el.checked!==!!value){el.checked=!!value;el.dispatchEvent(new Event('change',{bubbles:true}))}
    }else{
     const p=pct(value);
     if(Number(el.value)!==p){el.value=String(p);el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))}
    }
   }
  }finally{applying=false}
 }
 function install(){
  if(installed||attempts++>22)return;
  for(const [key,id] of Object.entries(ids)){
   const el=document.getElementById(id);
   if(!el){setTimeout(install,280);return}
   els[key]=el;
  }
  installed=true;initial();
  for(const el of Object.values(els)){
   el.addEventListener('input',save);el.addEventListener('change',save);
  }
  save();
 }
 if(document.readyState==='complete')setTimeout(install,800);
 else window.addEventListener('load',()=>setTimeout(install,800),{once:true});
})();

/* Visual Lab ONLY — mount Word Trails under the real main-game UI. */
(()=>{if(window.BUWTNativeShell||document.getElementById('bu-wt-native-host-loader'))return;const s=document.createElement('script');s.id='bu-wt-native-host-loader';s.src='word-trails-native-shell-v1.js?v=native-host-real-voice-retry-20261109-r2';s.defer=true;document.head.appendChild(s)})();


/* Visual Lab ONLY — extend the actual native Settings backup controls so one
   complete portable JSON includes Word Trails NEXT progress as quarantined TEST
   data, while preserving native v1 import and the shared Rewards wallet. */
(()=>{if(window.BUPlatformSaves||document.getElementById('bu-platform-save-core-v2'))return;
 const el=document.createElement('script');el.id='bu-platform-save-core-v2';
 el.src='bu-platform-saves-v2.js?v=20261109-test-safe-backup-v2';
 el.defer=true;document.head.appendChild(el);
})();


/* TEST-only canonical direct-link + refresh continuation.  A published standalone
   Word Trails link redirects to the real native root, and the root opens its
   same-origin crossword frame using the actual global menu/settings/announcer.
   Only explicit Word Trails requests activate the host. */
(()=>{'use strict';
 const params=new URLSearchParams(location.search);
 const direct=params.get('wt_launch')==='native';
 if(!direct && location.hash!=='#word-trails')return;
 // Owner-approved browser refresh must return to Bible Unfolded home. The
 // crossword engine's existing localStorage save remains untouched and is
 // loaded when the player next enters Word Trails from the home card.
 // A fresh published deep link still opens Word Trails via wt_launch=native.
 const nav=performance.getEntriesByType?.('navigation')?.[0];
 const reloading=nav?.type==='reload'||performance.navigation?.type===1;
 if(!direct && reloading && location.hash==='#word-trails'){
  history.replaceState(history.state,'',location.pathname+location.search);
  return;
 }
 if(direct){
  params.delete('wt_launch');
  const query=params.toString();
  history.replaceState(history.state,'',location.pathname+(query?'?'+query:'')+location.hash);
 }
 let attempts=0;
 function launch(){
  const host=window.BUWTNativeShell;
  if(host?.nativeReady?.()&&host?.launch?.())return;
  if(++attempts<48)setTimeout(launch,250);
  else console.warn('Word Trails native shell was unavailable; use the main Word Trails card.');
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',launch,{once:true});
 else launch();
})();


/* Visual Lab ONLY — Daily Discovery Hall prototype.
 * Kept in independent assets and isolated test-only storage. The canonical
 * daily checkmark, rewards wallet, purchases and LIVE project are untouched. */
(()=>{'use strict';
 if(document.getElementById('bu-daily-hall-test-loader'))return;
 const css=document.createElement('link');css.rel='stylesheet';
 css.id='bu-daily-hall-test-css';
 css.href='daily-engagement-hall-test-v1.css?v=20261109-hall-v1';
 document.head.appendChild(css);
 const js=document.createElement('script');
 js.id='bu-daily-hall-test-loader';
 js.src='daily-engagement-hall-test-v1.js?v=20261109-hall-v2';
 js.defer=true;document.head.appendChild(js);
})();

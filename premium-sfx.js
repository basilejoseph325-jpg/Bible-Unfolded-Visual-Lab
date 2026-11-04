/* BIBLE UNFOLDED — VISUAL LAB audio choices, Nov 4 2026.
   CC0 samples: https://sfxmint.com/license
   Reversible adapter. Does not touch scores, saves, music, voice, or art. */
(()=>{'use strict';
const cues={
 navigate:['ui-menu-12.mp3',.80],back:['ui-swipe-41.mp3',.75],
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
 try{a.pause();a.currentTime=0;a.volume=vol;a.playbackRate=1;
  const p=nativePlay.call(a);if(p&&p.catch)p.catch(()=>{});
  if(type==='swish'){const fade=()=>{if(a.__buToken!==t||a.paused)return;const x=a.currentTime;if(x>=.37){a.pause();return}if(x>=.24)a.volume=vol*Math.max(0,(.37-x)/.13);requestAnimationFrame(fade)};requestAnimationFrame(fade)}
  return true;
 }catch(e){return false}
}
window.addEventListener('click',ev=>{const c=ev.target?.closest?.('button,a,[role="button"],input,select,summary');const words=c?((c.id||'')+' '+(c.getAttribute('aria-label')||'')+' '+(c.textContent||'').slice(0,70)).toLowerCase():'';
 lastClick={at:Date.now(),undo:/undo|reverse/.test(words),answer:!!c?.closest?.('[data-answer],#btn3926-answers,#bu3857-screen .bu3868-answer')};},true);
HTMLMediaElement.prototype.play=function(){
 const u=this.src||'';
 if(!u.startsWith('data:audio/wav;base64,'))return nativePlay.apply(this,arguments);
 let type=id[u.length+'|'+u.slice(56,95)];
 if(!type)return nativePlay.apply(this,arguments);
 if(['navigate','back','select','info','toggle'].includes(type)&&lastClick&&Date.now()-lastClick.at<180){
  if(lastClick.answer)return Promise.resolve();
  if(type==='toggle'&&lastClick.undo)type='undo';
 }
 play(type,Number(this.volume));return Promise.resolve();
};
for(const [f,type] of [['tick','tap'],['swish','swish']]){
 if(typeof window[f]==='function'){const old=window[f];window[f]=function(){if(window.BUPremiumSFX){play(type);return;}return old.apply(this,arguments)}}
}
window.BUPremiumSFX=Object.freeze({play,version:'2026-11-04-choices-locked'});
})();
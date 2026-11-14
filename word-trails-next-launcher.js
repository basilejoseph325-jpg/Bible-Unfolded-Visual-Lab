/* Visual Lab only: Word Trails NEXT is the default playtest entry.
   Old Word Trails remains behind a comparison toggle; live game unchanged. */
(()=>{'use strict';
const PATH='experiments/word-trails-next-v1.html';
const css=[
 '#cross-pick #wt-next-entry{display:block!important;box-sizing:border-box!important;width:100%!important;max-width:100%!important;flex:none!important;margin:0 0 8px!important;padding:0!important;border:1.5px solid #f1cf8c!important;border-radius:18px!important;overflow:hidden!important;background:#0c3440!important;box-shadow:0 7px 18px #0009!important}',
 '#cross-pick #wt-next-entry>a{min-height:190px;display:flex!important;flex-direction:column;justify-content:flex-end!important;gap:6px;padding:17px 16px!important;position:relative!important;text-decoration:none!important;box-sizing:border-box!important;color:#ffe5aa!important;background:linear-gradient(0deg,rgba(3,18,27,.96),rgba(5,22,29,.5) 58%,rgba(6,24,32,.15)),url("bible-book-art/01_genesis.webp") center/cover no-repeat!important}',
 '#cross-pick #wt-next-entry>a:active{filter:brightness(1.12)}',
 '#cross-pick #wt-next-entry .wt-next-kicker{font:900 10px/1.3 system-ui,sans-serif!important;letter-spacing:.13em!important;color:#ffe8bc!important;text-shadow:0 2px 5px #000!important}',
 '#cross-pick #wt-next-entry .wt-next-title{font:800 clamp(26px,7vw,36px)/1 Georgia,serif!important;color:#ffe2a2!important;text-shadow:0 2px 5px #00161c!important}',
 '#cross-pick #wt-next-entry .wt-next-copy{font:650 13px/1.35 system-ui,sans-serif!important;color:#fff7e2!important;text-shadow:0 2px 5px #00161c!important}',
 '#cross-pick #wt-next-entry .wt-next-go{font:900 13px system-ui,sans-serif!important;align-self:flex-start;margin-top:5px;padding:9px 13px;border:1px solid #ffedbc;border-radius:10px;background:linear-gradient(#ffe6a2,#be8c41);color:#17353b;box-shadow:inset 0 1px #fff6d5,0 3px 7px #0007}',
 '#cross-pick #wt-next-entry>button{display:block!important;width:100%!important;border:none!important;border-top:1px solid #d2b27260!important;border-radius:0!important;padding:11px!important;background:#113945!important;color:#ead8b1!important;font:750 11px system-ui,sans-serif!important;box-sizing:border-box!important}',
 '#cross-pick:not(.wt-next-compare) .cross-pack-list{display:none!important}',
 '#cross-pick:not(.wt-next-compare) .mode-source{display:none!important}',
 '#cross-pick.wt-next-compare .cross-pack-list{display:flex!important}',
 // Only the home card poster changes: keep title, icon, teal panel, button and gold frame.
 '#home #home-cross .cinematic-poster.art-cross{position:relative!important;overflow:visible!important;background-image:linear-gradient(180deg,rgba(2,21,30,.05),rgba(3,22,29,.20)),url("bible-book-art/01_genesis.webp")!important;background-position:center center!important;background-size:cover!important}',
 '#home #home-cross .cin-cross-letters{display:none!important}',
 '#home #home-cross .poster-symbol{z-index:12!important}',
 '#home #home-cross .cinematic-poster.art-cross::after{content:"";display:block;position:absolute;inset:0;background:url("assets/ui/word-trails-home-next-crossword-v1.svg?v=nov09-card1") center/100% 100% no-repeat;z-index:2;pointer-events:none}',
 '#cross-pick.wt-crossword-collection #wt-next-entry{display:none!important}',
 '#cross-pick.wt-crossword-collection .cross-pack-list{display:grid!important}'
].join('\n');
function install(){
 const page=document.getElementById('cross-pick');
 const scroll=page?.querySelector('.mode-scroll');
 if(!page||!scroll)return false;
 if(document.getElementById('wt-next-entry'))return true;
 const style=document.createElement('style');style.id='wt-next-launch-style';style.textContent=css;
 document.head.appendChild(style);
 const section=document.createElement('section');section.id='wt-next-entry';
 section.innerHTML='<a href="'+PATH+'" aria-label="Play the new 30-level Word Trails test">'+
 '<span class="wt-next-kicker">VISUAL LAB · NEW GAMEPLAY TEST</span>'+
 '<strong class="wt-next-title">Word Trails NEXT</strong>'+
 '<span class="wt-next-copy">30 crossword levels · bigger Bible puzzles · Scripture words · rewards · original sounds</span>'+
 '<span class="wt-next-go">PLAY THE NEW VERSION →</span></a>'+
 '<button type="button" id="wt-next-compare" aria-expanded="false">Show previous Word Trails for comparison</button>';
 scroll.prepend(section);
 section.querySelector('a[href="'+PATH+'"]').addEventListener('click',event=>{
  if(window.BUWTNativeShell?.launch?.()){event.preventDefault()}
 });
 section.querySelector('#wt-next-compare').addEventListener('click',()=>{
  const open=page.classList.toggle('wt-next-compare'),b=section.querySelector('#wt-next-compare');
  b.textContent=open?'Hide previous Word Trails':'Show previous Word Trails for comparison';
  b.setAttribute('aria-expanded',String(open));
 });
 return true;
}
/* The expanded Scripture Crosswords collection is a separate REAL playable
   home choice. Leave Word Trails NEXT's existing home route unchanged. The
   twenty-one previous Crosswords packs retain their save indices. */
function installCrosswordsHomeCard(){
 const existing=document.getElementById('home-crossword-packs');
 if(existing)return true;
 const original=document.querySelector('#home #home-cross');
 if(!original)return false;
 const button=original.cloneNode(true);
 button.id='home-crossword-packs';
 button.setAttribute('aria-label','Play Bible Crosswords — 30 Scripture and classic puzzle boards');
 const title=button.querySelector('.cinematic-card-title');
 const desc=button.querySelector('.cinematic-card-desc');
 const cta=button.querySelector('.cinematic-card-cta');
 if(title)title.textContent='Bible Crosswords';
 if(desc)desc.textContent='30 playable puzzle boards! Find words, learn Bible details, and earn rewards.';
 if(cta)cta.textContent='PLAY CROSSWORD PACKS ›';
 button.addEventListener('click',event=>{
  event.preventDefault();event.stopPropagation();
  if(typeof openCrossPick!=='function')return;
  try{window.startAudio?.();window.BUPremiumSFX?.play?.('navigate')}catch(_){}
  openCrossPick();
  const pick=document.getElementById('cross-pick');
  if(pick)pick.classList.add('wt-next-compare','wt-crossword-collection');
 });
 original.insertAdjacentElement('afterend',button);
 return true;
}

/* Home card should open the new crossword directly in Visual Lab.
   A deliberate ?trails=previous URL keeps the original test selector available
   for A/B comparison, but this never runs in the live repository. */
function routeHomeCard(){
 if(new URLSearchParams(window.location.search).get('trails')==='previous')return;
 let navigating=false;
 window.addEventListener('click',event=>{
  const button=event.target?.closest?.('#home #home-cross');
  if(!button)return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if(navigating)return;
  navigating=true;
  // Match the shared menu-enter sound used by the other Bible Unfolded modes.
  // Our capture-phase route previously stopped the original home button handler,
  // which accidentally removed its normal audible navigation feedback.
  try{window.BUPremiumSFX?.play?.('navigate')}catch(_){}
  // Word Trails is a separate HTML document; allow the navigation sample to
  // actually start playing before unloading the original game document.
  window.setTimeout(()=>{navigating=false;if(!window.BUWTNativeShell?.launch?.())window.location.assign(PATH)},235);
 },true);
}
routeHomeCard();
function start(){
 installCrosswordsHomeCard();
 if(install())return;
 const observer=new MutationObserver(()=>{if(install())observer.disconnect()});
 observer.observe(document.body,{childList:true,subtree:true});
 setTimeout(()=>observer.disconnect(),12000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
})();
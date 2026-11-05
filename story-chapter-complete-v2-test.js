/* TEST ONLY — premium Story Adventure completion screens.
   Original and later episode engines retain all chapter text, navigation handlers,
   score/tokens, saved progress, announcers, music, and audio effects.
   This module decorates existing DOM; it never renders a replacement screen. */
(()=>{'use strict';
 const EMBLEM='assets/ui/story-complete-book-laurel-v2.svg';
 const NO_MOTION=()=>document.documentElement.classList.contains('reduce-motion')||
   !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 function celebrateSetting(){
  try{
   const val=JSON.parse(localStorage.getItem('bible-unfolded-immersive-v34')||'{}').celebrate;
   return ['full','gentle','off'].includes(val)?val:'full';
  }catch(_){return 'full'}
 }
 function chapterMilestone(root,modern){
  // A "return to book" after the last CURRENT episode is a series milestone,
  // not evidence of finishing the entire Biblical book.
  if(modern){
   const next=root.querySelector('#bu3857-next-episode');
   return /Return to (Genesis|Exodus)/i.test(next?.textContent||'');
  }
  const tag=root.querySelector('.period-tag')?.textContent||'';
  return /THROUGH THE FLOOD|JOURNEY OF FAITH|BURNING THORNBUSH/i.test(tag);
 }
 function falling(card,amount){
  if(amount<=0||NO_MOTION())return;
  const shower=document.createElement('div');
  shower.className='bu-story-finale-shower';
  shower.setAttribute('aria-hidden','true');
  const shades=['#fff1b8','#f3c971','#d1a04b','#a8d6bd','#e9bc83'];
  for(let i=0;i<amount;i++){
   const p=document.createElement('i');
   p.style.setProperty('--x',(4+(i*53+17)%92)+'%');
   p.style.setProperty('--dx',(((i*31)%82)-41)+'px');
   p.style.setProperty('--t',(2.35+(i%9)*.17)+'s');
   p.style.setProperty('--d',((i%12)*.085)+'s');
   p.style.setProperty('--gold',shades[i%shades.length]);
   p.style.setProperty('--turn',((i%2?1:-1)*(220+(i%4)*85))+'deg');
   if(i%5===0)p.className='bu-story-finale-spark';
   shower.appendChild(p);
  }
  card.appendChild(shower);
  setTimeout(()=>{shower.remove()},5200);
 }
 function enhance(card,modern){
  if(card.classList.contains('bu-story-finale-v2'))return;
  const title=card.querySelector('h2');
  const primary=card.querySelector(modern?'#bu3857-next-episode':'#toJourney');
  if(!title||!primary)return;
  const art=document.createElement('img');
  art.className='bu-story-finale-book-emblem';
  art.src=EMBLEM;art.alt='';art.draggable=false;
  art.setAttribute('aria-hidden','true');
  const oldStar=card.querySelector('.bu3857-finale-icon');
  if(oldStar)oldStar.replaceWith(art);
  else card.prepend(art);
  const milestone=chapterMilestone(card,modern);
  card.classList.add('bu-story-finale-v2');
  card.dataset.buStoryMilestone=milestone?'major':'chapter';
  // The V2 treatment does not introduce a second score or alter story copy.
  const setting=celebrateSetting();
  const n=setting==='off'?0:setting==='gentle'?8:milestone?54:30;
  falling(card,n);
  // Existing Story Adventure celebration sound and announcer are the sole
  // audio owners. Do not replay fanfares, duck music, or double-trigger sound.
 }
 function start(){
  const legacy=document.getElementById('gamepanel');
  const modern=document.getElementById('bu3857-content');
  for(const [root,selector,isModern] of [
   [legacy,'.bu3815-chapter-finale',false],
   [modern,'.bu3863-finale',true]
  ]){
   if(!root)continue;
   let scanning=false;
   const scan=()=>{
    if(scanning)return;scanning=true;
    try{
     const card=root.querySelector(selector);
     if(card)enhance(card,isModern);
    }finally{scanning=false}
   };
   new MutationObserver(scan).observe(root,{childList:true,subtree:false});
   scan();
  }
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
 else start();
})();
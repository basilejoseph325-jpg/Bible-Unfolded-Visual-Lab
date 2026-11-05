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
 // Reuse the chapter's existing artwork rather than flattening a mockup
 // (which would bake in text and buttons). Missing art leaves teal untouched.
 function chapterArt(modern,ending=false){
  if(!modern){
   const frame=document.querySelector('#scene .scene-img.show');
   const image=frame?.style.backgroundImage||'';
   // Early chapters already display the approved illustration in #scene.
   if(image&&image!=='none')return {image};
   return null;
  }
  const heading=document.getElementById('bu3857-episode')?.textContent||'';
  const found=heading.match(/(GENESIS|EXODUS)\s*[·•\-]\s*EPISODE\s*(\d+)/i);
  if(!found)return null;
  const book=found[1].toUpperCase(),number=Number(found[2]);
  if(book==='GENESIS'&&number>=7&&number<=9){
   const key='g'+String(number).padStart(2,'0')+(ending?'-d10':'-d01');
   if(typeof BU_GENESIS_SCENE_ART!=='undefined'){
    const src=BU_GENESIS_SCENE_ART[key];
    if(src)return {src};
   }
   const cover=document.querySelector('#episode-list .episode-card[data-episode="'+(number-1)+'"] img');
   if(cover?.src)return {src:cover.src};
  }
  if(book==='EXODUS'){
   const chapter=number+6;
   const key='ex'+chapter+(ending?'-d10':'-d01');
   if(typeof BU3857_SCENE_ART!=='undefined'){
    const src=BU3857_SCENE_ART[key];
    if(src)return {src};
   }
  }
  return null;
 }
 function atmosphere(card,modern){
  const art=chapterArt(modern,true);
  if(!art)return;
  const bg=document.createElement('div');
  bg.className='bu-story-finale-atmosphere';
  bg.setAttribute('aria-hidden','true');
  const painting=document.createElement('div');
  painting.className='bu-story-finale-atmosphere-art';
  if(art.src)painting.style.backgroundImage='url("'+art.src+'")';
  else painting.style.backgroundImage=art.image;
  bg.appendChild(painting);
  card.prepend(bg);
 }
 function cinematicHero(card,modern,emblem){
  if(!modern)return;
  const art=chapterArt(true);
  if(!art)return;
  const hero=document.createElement('figure');
  hero.className='bu-story-finale-cinematic-hero';
  hero.setAttribute('aria-hidden','true');
  const photo=document.createElement('img');
  photo.className='bu-story-finale-cinematic-photo';
  if(art.src)photo.src=art.src;
  else return;
  photo.alt='';photo.draggable=false;
  photo.decoding='async';
  hero.appendChild(photo);
  // Only a newly rendered chapter ending gets the cinematic visual.
  // Existing scene, heading and button event handlers remain native.
  card.insertBefore(hero,emblem);
  // The image above is chapter discovery #1. Name that REAL pictured scene,
  // just like the original Story Adventure scene-title strip.
  try{
   const state=typeof bu3857State!=='undefined'?bu3857State:null;
   const chapter=state&&typeof BU3857_DATA!=='undefined'?BU3857_DATA[state.book]:null;
   const caption=chapter?.discoveries?.[0]?.title;
   if(caption){
    const label=document.createElement('div');
    label.className='bu-story-finale-scene-label';
    label.textContent=caption;
    card.insertBefore(label,emblem);
   }
  }catch(_){/* never block completion if optional subtitle is absent */}

 }
 function enhance(card,modern){
  if(card.classList.contains('bu-story-finale-v2'))return;
  const title=card.querySelector('h2');
  const primary=card.querySelector(modern?'#bu3857-next-episode':'#toJourney');
  if(!title||!primary)return;
  // The original engine leaves long headings free to exceed the plaque.
  // Keep the exact wording, but put it into a measurable block-level wrapper
  // so it wraps naturally inside the engraved frame on narrow phones.
  if(!title.querySelector(':scope > .bu-story-finale-title-text')){
   const wording=title.textContent;
   const span=document.createElement('span');
   span.className='bu-story-finale-title-text';
   span.textContent=wording;
   title.replaceChildren(span);
  }
  const art=document.createElement('img');
  art.className='bu-story-finale-book-emblem';
  art.src=EMBLEM;art.alt='';art.draggable=false;
  art.setAttribute('aria-hidden','true');
  const oldStar=card.querySelector('.bu3857-finale-icon');
  if(oldStar)oldStar.replaceWith(art);
  else card.prepend(art);
  const milestone=chapterMilestone(card,modern);
  cinematicHero(card,modern,art);
  atmosphere(card,modern);
  // V11: match the legacy completion structure instead of adding pixel offsets.
  // Group only the modern engine's EXISTING achievement controls into a
  // flexibly centered stage; native buttons retain their original handlers.
  if(modern&&!card.querySelector(':scope > .bu-story-finale-stage')){
   const stage=document.createElement('section');
   stage.className='bu-story-finale-stage';
   stage.setAttribute('aria-label','Chapter completion');
   const chapterHeading=document.getElementById('bu3857-episode')?.textContent||'';
   const chapterName=title.textContent||'';
   const label=document.createElement('div');
   label.className='bu-story-finale-complete-tag';
   const book=/EXODUS/i.test(chapterHeading)?'EXODUS':'GENESIS';
   label.textContent=book+' · '+chapterName+' COMPLETE';
   label.setAttribute('aria-hidden','true');
   const nodes=Array.from(card.children).filter(node=>
    !node.classList.contains('bu-story-finale-atmosphere')&&
    !node.classList.contains('bu-story-finale-cinematic-hero')&&
    !node.classList.contains('bu-story-finale-scene-label')
   );
   stage.appendChild(art);
   stage.appendChild(label);
   for(const node of nodes){if(node!==art)stage.appendChild(node)}
   card.appendChild(stage);
   // Approved template: paired Replay + Chapters actions.
   // Move the EXISTING replay node (and its native handler) into a shared row.
   // Chapters delegates to the actual modern Back action, not a new route.
   const replay=stage.querySelector('#bu3857-replay');
   const nativeBack=document.getElementById('bu3857-back');
   if(replay&&nativeBack){
    const row=document.createElement('div');
    row.className='bu-story-finale-actions';
    replay.parentNode.insertBefore(row,replay);
    row.appendChild(replay);
    const chapters=document.createElement('button');
    chapters.type='button';
    chapters.id='bu-story-finale-chapters';
    chapters.className='secondary-button';
    chapters.textContent='Chapters';
    chapters.addEventListener('click',()=>nativeBack.click());
    row.appendChild(chapters);
   }
  }
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
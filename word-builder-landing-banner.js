/* Visual Lab: flatten Word Builder landing artwork only. */
(()=>{'use strict';
const style=document.createElement('style');style.textContent=`
.bu-wb-landing-banner{border:0!important;border-radius:0!important;box-shadow:none!important;outline:none!important;overflow:hidden!important;position:relative!important;isolation:isolate!important;width:100vw!important;max-width:none!important;margin-left:calc(50% - 50vw)!important;margin-right:calc(50% - 50vw)!important}
.bu-wb-landing-banner::after{content:none!important;display:none!important;background:none!important}
.bu-wb-landing-banner img{border:0!important;border-radius:0!important;box-shadow:none!important;width:100%!important;display:block!important}
`;document.head.appendChild(style);
function scan(){
 const heading=[...document.querySelectorAll('h1,h2,h3,header')].find(el=>el.textContent.trim()==='Word Builder');
 if(!heading)return;
 const all=[...document.querySelectorAll('button,a,[role="button"],div,section')];
 const hasNew=all.some(el=>el.children.length<4&&/^New Game$/i.test((el.innerText||'').trim()));
 const hasChallenges=all.some(el=>el.children.length<4&&/Bible Word Challenges/i.test((el.innerText||'').trim()));
 if(!hasNew||!hasChallenges)return;
 const img=[...document.querySelectorAll('img')].find(el=>/wb-cinematic-hero|word-builder-top-clean/i.test(el.currentSrc||el.src||''));
 if(img){let el=img.parentElement;for(let i=0;i<3&&el;i++,el=el.parentElement){if(el.matches('button,a,[role="button"]'))break;if(el.querySelector('button,a,[role="button"]'))break;el.classList.add('bu-wb-landing-banner');if(el.offsetWidth>=window.innerWidth*.8)break}}
 // Some builds use CSS backgrounds instead of img tags.
 for(const el of document.querySelectorAll('div,section,figure')){
  if(el.matches('button,a,[role="button"]')||el.closest('button,a,[role="button"]'))continue;
  if(el.querySelector('button,a,[role="button"]'))continue;
  const bg=getComputedStyle(el).backgroundImage;
  if(/wb-cinematic-hero|word-builder-top-clean/i.test(bg))el.classList.add('bu-wb-landing-banner');
 }
}
let pending=false;new MutationObserver(()=>{if(!pending){pending=true;requestAnimationFrame(()=>{pending=false;scan()})}}).observe(document.documentElement,{childList:true,subtree:true});scan();document.addEventListener('click',()=>requestAnimationFrame(scan));
})();
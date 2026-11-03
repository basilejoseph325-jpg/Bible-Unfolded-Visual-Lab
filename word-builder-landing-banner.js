/* Visual Lab only: Word Builder landing hero is scenery, not a button. */
(()=>{'use strict';
const css=document.createElement('style');css.textContent=`
.bu-wb-landing-banner{border:0!important;border-radius:0!important;box-shadow:none!important;outline:0!important;overflow:hidden!important;position:relative!important;isolation:isolate!important;pointer-events:none!important}
.bu-wb-landing-banner::after{content:""!important;position:absolute!important;inset:55% 0 0!important;background:linear-gradient(to bottom,transparent,#061e2a 100%)!important;pointer-events:none!important;z-index:5!important}
.bu-wb-landing-banner img{border:0!important;border-radius:0!important;box-shadow:none!important;display:block!important;width:100%!important}
`;document.head.appendChild(css);
function scan(){
 const cards=[...document.querySelectorAll('button,a,[role="button"]')];
 const newGame=cards.find(el=>/^new game$/i.test((el.innerText||'').trim()));
 if(!newGame)return;
 const page=newGame.closest('main,section,[class*="page"],[class*="screen"]')||document;
 const imgs=[...page.querySelectorAll('img')].filter(el=>/wb-cinematic-hero|word-builder-top-clean/i.test(el.currentSrc||el.src||''));
 for(const img of imgs){let box=img.parentElement;for(let n=0;n<3&&box?.parentElement;n++){if(box.matches('button,a,[role="button"]'))break;if(box.querySelector('button,a,[role="button"]'))break;if(box.offsetWidth>=img.offsetWidth)break;box=box.parentElement}if(box&&!box.matches('button,a,[role="button"]'))box.classList.add('bu-wb-landing-banner')}
 const bg=[...page.querySelectorAll('div,header,section')].filter(el=>/wb-cinematic-hero\.webp/i.test(getComputedStyle(el).backgroundImage));
 for(const el of bg){if(!el.closest('button,a,[role="button"]')&&!el.querySelector('button,a,[role="button"]'))el.classList.add('bu-wb-landing-banner')}
}
let queued=false;new MutationObserver(()=>{if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;scan()})}}).observe(document.documentElement,{subtree:true,childList:true});scan();
})();
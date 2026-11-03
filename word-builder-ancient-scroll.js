/* Bible Unfolded — Word Builder animated rules scroll (Visual Lab) */
(()=>{'use strict';
const css=document.createElement('style');
css.textContent=`
.bu-wb-scroll{position:relative!important;isolation:isolate;max-width:720px!important;margin:42px auto 38px!important;padding:52px 24px 56px!important;background:radial-gradient(ellipse at 50% 25%,#f8e6bb,#e8c48c 75%,#bd874b)!important;color:#392416!important;border:0!important;border-radius:12px!important;box-shadow:inset 0 0 30px #84461f77,0 18px 32px #0009,0 0 0 2px #8b542b!important;transform-origin:top center;animation:bu-wb-unfurl 1.1s cubic-bezier(.18,.82,.2,1) both;overflow:visible!important}
.bu-wb-scroll::before,.bu-wb-scroll::after{content:"";position:absolute;left:-13px;right:-13px;height:38px;border-radius:19px;background:linear-gradient(#47240f,#a66b34 20%,#e5b978 43%,#a66a31 72%,#43230e);border:2px solid #77441d;box-shadow:0 5px 10px #0009,inset 0 2px 3px #ffdd9b;z-index:3;pointer-events:none}
.bu-wb-scroll::before{top:-22px}.bu-wb-scroll::after{bottom:-22px}
.bu-wb-scroll :is(p,li,b,strong,span){color:#392416!important;text-shadow:none!important}
.bu-wb-scroll p{font-family:Georgia,serif!important;font-size:clamp(16px,3.7vw,21px)!important;line-height:1.6!important;margin-bottom:18px!important;padding-bottom:14px!important;border-bottom:1px solid #98633366}
.bu-wb-scroll button{background:linear-gradient(#f9df9f,#c79443)!important;color:#352415!important;border:2px solid #93602e!important;border-radius:13px!important;font-weight:800!important}
.bu-wb-scroll-title{background:transparent!important;border:0!important;box-shadow:none!important}
.bu-wb-scroll-title :is(h1,h2,h3,h4){color:#f4d99b!important}
.bu-wb-scroll.bu-wb-closing{animation:bu-wb-close .55s ease-in both!important}
@keyframes bu-wb-unfurl{0%{transform:scaleY(.04);opacity:.3}70%{transform:scaleY(1.03);opacity:1}100%{transform:scaleY(1);opacity:1}}
@keyframes bu-wb-close{to{transform:scaleY(.04);opacity:0}}
@media(prefers-reduced-motion:reduce){.bu-wb-scroll,.bu-wb-scroll.bu-wb-closing{animation:none!important}}
`;
document.head.appendChild(css);
let queued=false;
function scan(){
 queued=false;
 const buttons=[...document.querySelectorAll('button,[role="button"],input[type="button"]')];
 for(const b of buttons){
   if(!/got\s*it/i.test(b.textContent||b.value||''))continue;
   if(!b.getClientRects().length)continue;
   let el=b.parentElement,found=null;
   for(let i=0;i<9&&el&&el!==document.body;i++,el=el.parentElement){
     const t=(el.innerText||el.textContent||'').replace(/\s+/g,' ').toLowerCase();
     if(t.length>140&&t.length<5000&&
        (t.includes('rack tile')||t.includes('board square'))&&
        (t.includes('center')||t.includes('word must'))){found=el;break;}
   }
   if(found&&!found.classList.contains('bu-wb-scroll'))found.classList.add('bu-wb-scroll');
   if(found&&!b.dataset.buScrollClose){b.dataset.buScrollClose='yes';let replay=false;b.addEventListener('click',e=>{if(replay||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;e.preventDefault();e.stopImmediatePropagation();found.classList.add('bu-wb-closing');setTimeout(()=>{replay=true;b.click();replay=false;},550);},true);}
 }
 const heads=[...document.querySelectorAll('h1,h2,h3,h4')];
 for(const h of heads){
   if(/learn\s+word\s+builder/i.test(h.textContent||'')){
     const p=h.parentElement;if(p)p.classList.add('bu-wb-scroll-title');
   }
 }
}
function schedule(){if(!queued){queued=true;requestAnimationFrame(scan)}}
new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
document.addEventListener('click',schedule,true);
document.addEventListener('DOMContentLoaded',schedule);
schedule();
})();
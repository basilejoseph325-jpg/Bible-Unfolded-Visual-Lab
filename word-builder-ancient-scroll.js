/* Bible Unfolded — Word Builder animated rules scroll (Visual Lab) */
(()=>{'use strict';
const css=document.createElement('style');
css.textContent=`
.bu-wb-scroll{position:relative!important;background:radial-gradient(ellipse at 45% 15%,#fae9c5 0%,#ebd3a5 68%,#c79c65 100%)!important;color:#3e2a19!important;border:2px solid #966738!important;border-radius:12px!important;padding:30px 20px!important;margin:26px auto!important;box-shadow:0 12px 30px #0008,inset 0 0 28px #8d542b55!important;transform-origin:top center;animation:bu-wb-unfurl .8s cubic-bezier(.22,.8,.25,1) both}
.bu-wb-scroll::before,.bu-wb-scroll::after{content:"";position:absolute;left:-9px;right:-9px;height:21px;border-radius:13px;background:linear-gradient(#50301b,#bc8b4d 38%,#d3a464 48%,#623a21);box-shadow:0 3px 8px #0007;pointer-events:none;z-index:2}
.bu-wb-scroll::before{top:-13px}.bu-wb-scroll::after{bottom:-13px}
.bu-wb-scroll :is(p,li,b,strong,span){color:#3e2a19!important;text-shadow:none!important}
.bu-wb-scroll p{line-height:1.62!important}
.bu-wb-scroll button{color:#302213!important;background:linear-gradient(#f6d996,#c8984e)!important;border:1px solid #906334!important}
.bu-wb-scroll-title{background:transparent!important;border:0!important;box-shadow:none!important}
.bu-wb-scroll-title :is(h1,h2,h3,h4){color:#f4d99b!important}
@keyframes bu-wb-unfurl{0%{transform:scaleY(.05);opacity:.3}60%{opacity:1}100%{transform:scaleY(1);opacity:1}}
@media(prefers-reduced-motion:reduce){.bu-wb-scroll{animation:none!important}}
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
   if(found&&!found.classList.contains('bu-wb-scroll')){
     found.classList.add('bu-wb-scroll');
   }
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
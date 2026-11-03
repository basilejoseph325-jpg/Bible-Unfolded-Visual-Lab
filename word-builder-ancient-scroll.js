/* Bible Unfolded: static cinematic Word Builder guide — TEST ONLY */
(()=>{'use strict';
const css=document.createElement('style');css.textContent=`
.bu-wb-art-guide{background:transparent!important;border:0!important;box-shadow:none!important;padding:0!important;margin:0 auto!important;max-width:720px!important;height:calc(100dvh - 126px)!important;min-height:480px!important;max-height:none!important;overflow:hidden!important;animation:none!important;clip-path:none!important;transform:none!important;scrollbar-width:thin}
.bu-wb-art-guide::before,.bu-wb-art-guide::after{content:none!important;display:none!important}
.bu-wb-art-guide .bu-wb-guide-picture{display:block!important;width:100%!important;height:100%!important;max-width:none!important;object-fit:fill!important;border:0!important;border-radius:0!important;box-shadow:none!important;margin:0!important;padding:0!important}
.bu-wb-art-guide .bu-wb-guide-original{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}
.bu-wb-art-guide .bu-wb-guide-action{display:flex!important;align-items:center!important;justify-content:center!important;position:absolute!important;left:50%!important;top:87.25%!important;transform:translate(-50%,-50%)!important;z-index:8!important;margin:0!important;padding:0!important;width:clamp(42px,10.3vw,62px)!important;height:clamp(42px,10.3vw,62px)!important;min-width:0!important;min-height:0!important;max-width:none!important;background:radial-gradient(circle,#8b1820 0%,#701017 65%,#4d0b10 100%)!important;color:#ffe5a5!important;border:1px solid #dca84b!important;border-radius:50%!important;box-shadow:0 2px 8px #21040088,inset 0 0 6px #d65b4988!important;font:bold clamp(9px,2.25vw,12px) Georgia,serif!important;line-height:1!important;text-align:center!important;white-space:normal!important;visibility:visible!important}
.bu-wb-guide-heading{display:none!important}\n.bu-wb-art-guide{position:relative!important;width:100%!important}\n@media(max-width:440px){.bu-wb-art-guide{height:calc(100dvh - 120px)!important}}

/* Gentle recurring glint over the wax-seal Got It button. */
.bu-wb-art-guide .bu-wb-guide-action{overflow:hidden!important;isolation:isolate!important;animation:bu-wb-seal-glow 3.6s ease-in-out infinite!important}
.bu-wb-art-guide .bu-wb-guide-action::after{content:""!important;position:absolute!important;top:-35%!important;bottom:-35%!important;left:-65%!important;width:38%!important;background:linear-gradient(90deg,transparent,rgba(255,239,170,.1) 20%,rgba(255,248,210,.7) 50%,rgba(255,239,170,.1) 80%,transparent)!important;transform:translateX(0) skewX(-24deg)!important;pointer-events:none!important;animation:bu-wb-seal-shimmer 3.6s ease-in-out infinite!important}
@keyframes bu-wb-seal-shimmer{0%,12%{transform:translateX(0) skewX(-24deg);opacity:0}18%{opacity:1}42%{transform:translateX(560%) skewX(-24deg);opacity:1}50%,100%{transform:translateX(560%) skewX(-24deg);opacity:0}}
@keyframes bu-wb-seal-glow{0%,65%,100%{box-shadow:0 2px 8px #21040088,inset 0 0 6px #d65b4988!important}34%{box-shadow:0 0 13px 3px #ffdb7888,inset 0 0 8px #ffd27a66!important}}
@media(prefers-reduced-motion:reduce){.bu-wb-art-guide .bu-wb-guide-action,.bu-wb-art-guide .bu-wb-guide-action::after{animation:none!important}}

.bu-wb-art-guide .bu-wb-guide-action{overflow:visible!important;animation:none!important}
.bu-wb-art-guide .bu-wb-flash-ring{position:absolute!important;inset:-5px!important;border:1px solid rgba(255,224,145,.75)!important;border-radius:50%!important;pointer-events:none!important;box-shadow:0 0 6px 2px rgba(255,209,112,.3),0 0 15px 5px rgba(255,191,80,.18)!important;animation:bu-wb-flash-ring 3.8s ease-in-out infinite!important}
@keyframes bu-wb-flash-ring{0%,100%{opacity:.35;transform:scale(1)}45%{opacity:.95;transform:scale(1.09)}70%{opacity:.55;transform:scale(1.035)}}}
@media(prefers-reduced-motion:reduce){.bu-wb-art-guide .bu-wb-flash-ring{animation:none!important;opacity:1!important}}

/* Hand-pressed burgundy sealing wax texture and embossed lettering. */
.bu-wb-art-guide .bu-wb-guide-action{
background:
 radial-gradient(ellipse at 24% 23%,rgba(255,185,126,.34) 0%,transparent 37%),
 radial-gradient(ellipse at 73% 79%,rgba(44,0,7,.65) 0%,transparent 53%),
 repeating-radial-gradient(ellipse at 37% 39%,rgba(255,207,145,.055) 0px,rgba(255,207,145,.055) 1px,rgba(65,0,10,.07) 2px,transparent 4px),
 radial-gradient(ellipse at 40% 32%,#ad3940 0%,#8d1f2a 34%,#68101a 74%,#3d0710 100%)!important;
border:2px solid rgba(94,20,19,.95)!important;
border-radius:48% 53% 49% 52% / 53% 47% 54% 48%!important;
text-shadow:0 1px 1px #3a050a,0 -1px 0 rgba(255,234,172,.75),0 0 4px rgba(255,202,116,.35)!important;
box-shadow:inset 1px 2px 3px rgba(255,223,169,.65),inset -3px -4px 6px rgba(38,0,9,.75),0 2px 4px rgba(27,0,5,.5)!important;
}
.bu-wb-art-guide .bu-wb-guide-action::before{
content:""!important;position:absolute!important;inset:3px!important;
border:1px solid rgba(255,183,115,.28)!important;
border-radius:52% 47% 53% 48% / 48% 54% 47% 52%!important;
box-shadow:inset 0 1px 2px rgba(255,226,166,.25),0 1px 1px rgba(48,0,9,.35)!important;
pointer-events:none!important;
}
`;document.head.appendChild(css);
let pending=false;
function scan(){pending=false;const buttons=[...document.querySelectorAll('button,[role="button"],input[type="button"]')];for(const b of buttons){if(!/got\s*it/i.test(b.textContent||b.value||''))continue;if(!b.getClientRects().length)continue;let found=null,el=b.parentElement;for(let i=0;i<9&&el&&el!==document.body;i++,el=el.parentElement){const t=(el.innerText||el.textContent||'').replace(/\s+/g,' ').toLowerCase();if(t.length>140&&t.length<5000&&(t.includes('rack tile')||t.includes('board square'))&&(t.includes('center')||t.includes('word must'))){found=el;break}}if(!found||found.classList.contains('bu-wb-art-guide'))continue;
const content=document.createElement('div');content.className='bu-wb-guide-original';const children=[...found.childNodes];for(const node of children){if(node===b||node.contains?.(b))continue;content.appendChild(node)}found.insertBefore(content,found.firstChild);
const img=document.createElement('img');img.className='bu-wb-guide-picture';img.src='word-builder-rules-art.jpg';img.alt='Word Builder rules on an ancient scroll: place tiles to form connected valid words; first word crosses center; score multipliers, Bible clues, seven tiles per turn, exchanges, and multiplayer turns. Solo Challenge, Pass and Play, and Pause and Resume.';img.loading='eager';found.insertBefore(img,content);
b.classList.add('bu-wb-guide-action');found.appendChild(b);found.classList.add('bu-wb-art-guide');
if(!b.querySelector('.bu-wb-flash-ring')){
 const ring=document.createElement('span');ring.className='bu-wb-flash-ring';ring.setAttribute('aria-hidden','true');b.appendChild(ring);
}

if(!b.dataset.buGlowActive){b.dataset.buGlowActive='1';
 b.style.setProperty('animation','none','important');
 if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches && typeof b.animate==='function'){
  b.animate([
   {filter:'brightness(1)',boxShadow:'0 0 3px 1px rgba(255,211,104,.35)',offset:0},
   {filter:'brightness(1.75)',boxShadow:'0 0 18px 7px rgba(255,227,124,.95)',offset:.18},
   {filter:'brightness(1)',boxShadow:'0 0 3px 1px rgba(255,211,104,.35)',offset:.36},
   {filter:'brightness(1.55)',boxShadow:'0 0 13px 5px rgba(255,227,124,.85)',offset:.49},
   {filter:'brightness(1)',boxShadow:'0 0 3px 1px rgba(255,211,104,.35)',offset:.65},
   {filter:'brightness(1)',boxShadow:'0 0 3px 1px rgba(255,211,104,.35)',offset:1}
  ],{duration:3000,iterations:Infinity,easing:'ease-in-out'});
 }
}
const h=[...document.querySelectorAll('h1,h2,h3,h4')].find(x=>/learn\s+word\s+builder/i.test(x.textContent||''));if(h){h.classList.add('bu-wb-guide-heading');const p=h.parentElement;if(p&&p.textContent.trim().length<110)p.classList.add('bu-wb-guide-heading')}
}}
function schedule(){if(!pending){pending=true;requestAnimationFrame(scan)}}new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});document.addEventListener('DOMContentLoaded',schedule);schedule();
})();
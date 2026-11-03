/* Ancient scroll guide: isolated, reversible enhancement. */
(()=>{'use strict';
const style=document.createElement('style');style.textContent=`
.bu-scroll-guide{position:relative!important;background:radial-gradient(ellipse at 48% 22%,#f8e7bd,#e5c996 70%,#b58b57)!important;color:#392715!important;border:2px solid #996c3b!important;border-radius:14px!important;padding:30px 20px!important;margin:24px auto!important;box-shadow:0 12px 32px #0008,inset 0 0 35px #85522a66!important;transform-origin:top center;animation:buScrollOpen .75s cubic-bezier(.2,.8,.2,1) both}
.bu-scroll-guide:before,.bu-scroll-guide:after{content:"";position:absolute;left:-8px;right:-8px;height:21px;border-radius:15px;background:linear-gradient(#59351c,#c89b5d 40%,#613b21);box-shadow:0 3px 9px #0008;pointer-events:none;z-index:1}
.bu-scroll-guide:before{top:-13px}.bu-scroll-guide:after{bottom:-13px}
.bu-scroll-guide :is(p,li,h1,h2,h3,h4,b,strong){color:#3b2918!important;text-shadow:none!important}
.bu-scroll-guide p,.bu-scroll-guide li{line-height:1.65!important}
.bu-scroll-guide button{background:linear-gradient(#f6d994,#c89a4c)!important;color:#322515!important;border:1px solid #9a713d!important}
.bu-scroll-guide-title{background:transparent!important;box-shadow:none!important;border:0!important}
.bu-scroll-guide-title :is(h1,h2,h3,h4){color:#54351e!important}
@keyframes buScrollOpen{from{transform:scaleY(.07);opacity:.25}to{transform:scaleY(1);opacity:1}}
@media(prefers-reduced-motion:reduce){.bu-scroll-guide{animation:none!important}}
`;document.head.appendChild(style);
let scheduled=false;
function apply(){scheduled=false;
const all=[...document.querySelectorAll('button,input[type="button"]')];
const btn=all.find(b=>/got it/i.test(b.textContent||b.value||'')&&b.getClientRects().length);
if(!btn)return;
let el=btn.parentElement,match=null;
for(let i=0;i<7&&el&&el!==document.body;i++,el=el.parentElement){
const t=(el.textContent||'').toLowerCase();
if((t.includes('first word must cross')||t.includes('tap a rack tile'))&&t.includes('got it')){match=el;break;}
}
if(!match)return;
if(!match.classList.contains('bu-scroll-guide'))match.classList.add('bu-scroll-guide');
const title=[...document.querySelectorAll('h1,h2,h3,h4')].find(x=>/learn word builder/i.test(x.textContent||''));
if(title){let p=title.parentElement;if(p&&!p.classList.contains('bu-scroll-guide-title'))p.classList.add('bu-scroll-guide-title');}
}
const observer=new MutationObserver(()=>{if(!scheduled){scheduled=true;requestAnimationFrame(app)}});
observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','style','class']});
document.addEventListener('click',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(app)}},true);
apply();
})();
/* Journey caption: keep existing saved-progress calculation, shorten only its presentation. */
(()=>{'use strict';
const id='journey-progress-label';
const pattern=/(\\d+)\\s+of\\s+(\\d+)/i;
let busy=false;
function update(){
 if(busy)return;
 const el=document.getElementById(id);if(!el)return;
 const original=el.textContent||'';
 const match=original.match(pattern);
 if(!match)return;
 const next=match[1]+' of '+match[2]+' Episodes Complete';
 if(original.trim()===next)return;
 busy=true;el.textContent=next;busy=false;
}
function boot(){
 const host=document.getElementById('journey');if(!host)return;
 const observer=new MutationObserver(update);
 observer.observe(host,{subtree:true,childList:true,characterData:true});
 update();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

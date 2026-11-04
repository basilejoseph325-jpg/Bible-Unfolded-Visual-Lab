/* Preserve the existing Journey layout and dynamic progress. Change caption words only. */
(()=>{'use strict';
const re=/(\d+)\s+of\s+(\d+)/i;
let writing=false;
function update(){
 if(writing)return;
 const el=document.getElementById('journey-progress-label');
 if(!el)return;
 const match=(el.textContent||'').match(re);
 if(!match)return;
 const text=match[1]+' of '+match[2]+' Episodes Complete';
 if(el.textContent===text)return;
 writing=true;el.textContent=text;writing=false;
}
function boot(){const el=document.getElementById('journey-progress-label');if(!el)return;new MutationObserver(update).observe(el,{childList:true,characterData:true,subtree:true});update();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

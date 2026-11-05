/* Real-scroll skin applies only to Daily Discovery ANSWER EXPLANATION.
   Do not decorate hint, scripture, research, full-question, Trivia or other dialogs.
   Native button nodes, focus management and advancing handlers remain intact. */
(()=>{'use strict';
 function upgrade(){
  const screen=document.getElementById('bu375-daily');
  if(!screen||!screen.getClientRects().length)return;
  const body=screen.querySelector('#bu375-body.bu65-playing');
  if(!body)return;
  document.querySelectorAll('.bu65-info-overlay:not(.bu-daily-explanation-scroll)').forEach(overlay=>{
   const card=overlay.querySelector('.bu65-info-card');
   const heading=card?.querySelector('h2');
   const next=card?.querySelector('.bu65-confirm');
   if(!heading||!next||!card.querySelector('.bu65-info-body'))return;
   // Next Question and Finish Discovery mark the answer-result modal.
   // Other overlays may share the underlying bu65 classes; do not skin them.
   if(!/^(?:Next Question|Finish Discovery)/i.test((next.textContent||'').trim()))return;
   if(!/Correct!|^Answer:/i.test((heading.textContent||'').trim()))return;
   // The embossed gold arrow is built into the illustrated wax artwork.
   // Keep native button and click handler; remove only its duplicate text arrow.
   if(!next.dataset.buWaxV2){
    next.dataset.buWaxV2='1';
    next.textContent=(next.textContent||'').replace(/\s*[→›➜]\s*$/u,'').trim();
   }
   overlay.classList.add('bu-daily-explanation-scroll');
  });
 }
 function boot(){
  const observer=new MutationObserver(upgrade);
  observer.observe(document.body,{childList:true,subtree:false});
  upgrade();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
 else boot();
})();

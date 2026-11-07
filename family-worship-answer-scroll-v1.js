/* VISUAL LAB ONLY — Family Worship answer explanation scroll V1.
 * Only the native #bu67-modal opened from answered Family Worship Trivia or
 * Lightning activity receives the approved V3 parchment and V2 wax seal.
 * Read/full-question, help, hints, gameplay, and other uses of bu67-modal
 * are untouched.  All native scored answers, next turns and data remain native. */
(()=>{'use strict';
 if(window.BU_FW_ANSWER_SCROLL_V1)return;
 window.BU_FW_ANSWER_SCROLL_V1=true;
 const TAG='bu-fw-answer-scroll';
 let seen=null;
 function sync(){
   const dlg=document.getElementById('bu67-modal');
   if(!dlg)return;
   const head=dlg.querySelector(':scope > .bu67-dialog-head > strong');
   const body=dlg.querySelector(':scope > .bu67-dialog-body');
   const isFamily=!!document.querySelector('#bu35-family.bu67-family-play:not([hidden])');
   const phase=document.querySelector('#bu35-family')?.dataset.bu67Phase||'';
   const active=isFamily&&['trivia','lightning'].includes(phase)&&
     /^Family Worship\s*[·•-]\s*(?:trivia|lightning)\s*$/i.test((head?.dataset.fwOriginalTitle||head?.textContent||'').trim())&&
     !!body?.querySelector('.bu35-feedback')&&dlg.open;
   if(!active){
     if(dlg.classList.contains(TAG)){
       dlg.classList.remove(TAG);
       dlg.querySelector('.bu-fw-answer-scroll-actions')?.remove();
       if(head?.dataset.fwOriginalTitle){head.textContent=head.dataset.fwOriginalTitle;delete head.dataset.fwOriginalTitle;}
     }
     return;
   }
   dlg.classList.add(TAG);
   if(head&&!head.dataset.fwOriginalTitle){head.dataset.fwOriginalTitle=head.textContent;head.textContent='Answer Explanation';}
   if(!dlg.querySelector('.bu-fw-answer-scroll-actions')){
     const footer=document.createElement('div');footer.className='bu-fw-answer-scroll-actions';
     const button=document.createElement('button');
     button.type='button';button.className='bu-fw-answer-scroll-return';
     button.textContent='Return to Game';
     button.setAttribute('aria-label','Close answer explanation and return to Family Worship');
     button.addEventListener('click',()=>dlg.querySelector('.bu67-dialog-x')?.click());
     footer.appendChild(button);dlg.appendChild(footer);
   }
 }
 function start(){
   if(!document.body)return;
   const observer=new MutationObserver(()=>sync());
   observer.observe(document.body,{childList:true,subtree:true});
   // Some screens reuse the same <dialog> and re-open it; observe state too.
   observer.observe(document.body,{attributes:true,subtree:true,attributeFilter:['open']});
   sync();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
 else start();
})();
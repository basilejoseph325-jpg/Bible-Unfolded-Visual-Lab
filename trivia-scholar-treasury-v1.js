/* BIBLE UNFOLDED Visual Lab only.
   Cosmetic dynamic score-ring adapter for the existing Trivia result DOM.
   Reads actual displayed score; never changes reward data, controls or handlers. */
(()=>{'use strict';
 if(window.BU_TRIVIA_SCHOLAR_SUMMARY_V1)return;
 window.BU_TRIVIA_SCHOLAR_SUMMARY_V1=true;
 function enhance(){
  const body=document.getElementById('bu34-body');
  if(!body)return;
  const panel=body.querySelector(':scope > .bu34-summary');
  if(!panel || panel.dataset.buTriviaRingV1==='1')return;
  const dial=panel.querySelector('.big');
  if(!dial)return;
  const score=(dial.textContent||'').replace(/\s+/g,'').match(/^(\d+)\/(\d+)$/);
  if(!score)return;
  const earned=Number(score[1]),total=Number(score[2]);
  if(!Number.isFinite(earned)||!Number.isFinite(total)||total<1)return;
  const fraction=Math.min(100,Math.max(0,100*earned/total));
  panel.style.setProperty('--bu-trivia-percent',fraction.toFixed(2)+'%');
  panel.dataset.buTriviaRingV1='1';
  panel.dataset.buTriviaOutcome=fraction===100?'perfect':fraction>=60?'achieved':'exploring';
 }
 function init(){
  const body=document.getElementById('bu34-body');
  if(!body)return;
  enhance();
  new MutationObserver(enhance).observe(body,{childList:true});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})();

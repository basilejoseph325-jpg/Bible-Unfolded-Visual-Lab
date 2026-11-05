/* VISUAL LAB ONLY — Bible Trivia answer scroll enhancer V1.
   Scope: an ACTIVE Trivia question, result heading, explanation text AND
   the real "Next Question"/"Finish Round" action. This exact pairing is
   required because hints, Bible reading, full-question and scholar dialogs
   share .bu65-info-overlay and MUST remain unchanged. No node replacements. */
(()=>{'use strict';
  if(window.BU_TRIVIA_ANSWER_SCROLL_V1)return;
  window.BU_TRIVIA_ANSWER_SCROLL_V1=true;
  function upgrade(){
    const screen=document.getElementById('bu34-trivia');
    if(!screen||!screen.getClientRects().length)return;
    if(!screen.querySelector('#bu34-body.bu65-playing'))return;
    document.querySelectorAll('.bu65-info-overlay:not(.bu-trivia-answer-scroll):not(.bu-daily-explanation-scroll)').forEach(layer=>{
      const card=layer.querySelector(':scope > .bu65-info-card');
      const heading=card?.querySelector(':scope > h2');
      const explanation=card?.querySelector(':scope > .bu65-info-body');
      const next=card?.querySelector(':scope > button.bu65-confirm');
      if(!heading||!explanation||!next)return;
      const title=(heading.textContent||'').trim();
      const label=(next.textContent||'').trim();
      // Result modal ONLY, not paid/free hints or other .bu65 overlays.
      if(!/^(?:✓\s*Correct!|Correct answer:|Answer:)/i.test(title))return;
      if(!/^(?:Next Question|Finish Round)\b/i.test(label))return;
      if(!next.dataset.buTriviaWaxV1){
        next.textContent=label.replace(/\s*[→›➜]\s*$/u,'').trim();
        next.dataset.buTriviaWaxV1='1';
      }
      layer.classList.toggle('bu-trivia-answer-revealed',/^(?:Correct answer:|Answer:)/i.test(title));
      layer.classList.add('bu-trivia-answer-scroll');
    });
  }
  function boot(){
    // Stage 10/13 native answer overlays are direct children of document.body.
    // Observe ONLY additions, never subtree/text mutations, to avoid loops.
    new MutationObserver(upgrade).observe(document.body,{childList:true,subtree:false});
    upgrade();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();

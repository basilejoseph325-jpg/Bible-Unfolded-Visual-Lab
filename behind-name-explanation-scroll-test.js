/* Visual Lab ONLY — Behind the Name native answer-modal scroll enhancer.
   Never build a replacement dialog; move the existing text nodes into a
   scrollable region, keeping the original Next Puzzle button and all handlers. */
(()=>{'use strict';
  const CLASS='bn-explanation-scroll';
  function upgrade(){
    const modal=document.getElementById('btn3926-modal');
    if(!modal)return;
    if(modal.hidden){modal.classList.remove(CLASS,'bn-answer-revealed');return;}
    const title=modal.querySelector('#btn3926-modal-title');
    const body=modal.querySelector('#btn3926-modal-body');
    const next=body?.querySelector(':scope > button.btn3929-next');
    // Only showInfo() creates this title + direct Next Puzzle button pairing.
    // Do not decorate Bible-reference, hint, reveal confirmation, progress,
    // or the end-of-set celebration (which also has .btn3929-next).
    if(!title||!body||!next||
      !/^Behind the name:\s*\S+/i.test((title.textContent||'').trim())||
      !/^Next Puzzle/i.test((next.textContent||'').trim())){
      modal.classList.remove(CLASS,'bn-answer-revealed');return;
    }
    if(!body.querySelector(':scope > .bn-scroll-copy')){
      const copy=document.createElement('div');
      copy.className='bn-scroll-copy';
      for(const child of Array.from(body.children)){
        if(child!==next)copy.appendChild(child);
      }
      body.insertBefore(copy,next);
    }
    modal.classList.toggle('bn-answer-revealed',
      /^Answer revealed/i.test(body.querySelector('.bn-scroll-copy > .btn3927-result')?.textContent||''));
    // The approved wax illustration already includes a gold right arrow.
    // Remove only the old text arrow, never the button node or its onclick.
    if(!next.dataset.bnScrollWaxV1){
      next.textContent=(next.textContent||'').replace(/\s*[→›➜]\s*$/u,'').trim();
      next.dataset.bnScrollWaxV1='1';
    }
    modal.classList.add(CLASS);
  }
  function boot(){
    const modal=document.getElementById('btn3926-modal');
    if(!modal)return;
    new MutationObserver(upgrade).observe(modal,{
      attributes:true,attributeFilter:['hidden'],
      childList:true,subtree:true
    });
    upgrade();
  }
  if(document.readyState==='loading')
    document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();

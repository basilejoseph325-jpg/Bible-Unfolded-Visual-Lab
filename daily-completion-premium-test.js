/* Visual Lab only: premium ancient achievement art for DAILY DISCOVERY END screen.
   The core game creates results, saves scores and binds both actions.
   This enhancer modifies decorative DOM and styling only. No game logic or rewards. */
(()=>{'use strict';
 function start(){
  const root=document.getElementById('bu375-daily');
  const body=document.getElementById('bu375-body');
  if(!root||!body)return;
  let inChange=false;
  function enhance(){
   if(inChange)return;
   const result=body.querySelector(':scope > .bu375-result');
   const home=body.querySelector(':scope > #bu375-home');
   const replay=body.querySelector(':scope > #bu375-again');
   if(!result||!home||!replay){body.classList.remove('bu-daily-finale-v1');return;}
   if(body.classList.contains('bu-daily-finale-v1'))return;
   inChange=true;
   try {
    const emblem=document.createElement('div');
    emblem.className='bu-daily-finale-emblem';
    emblem.setAttribute('aria-hidden','true');
    const img=document.createElement('img');
    img.src='assets/ui/daily-complete-laurel-v1.svg';
    img.alt='';img.draggable=false;
    emblem.appendChild(img);
    for(let i=0;i<6;i++){
     const particle=document.createElement('i');
     particle.style.setProperty('--i',String(i));
     emblem.appendChild(particle);
    }
    result.prepend(emblem);
    // The original core renders exactly the correct score and reward language.
    // Never rewrite the dynamic score, result title or the reward notice.
    const homeName=(home.textContent||'Back to Bible Unfolded').replace(/\s*→\s*$/u,'').trim();
    home.textContent=homeName;
    home.setAttribute('aria-label',homeName);
    const icon=document.createElement('img');
    icon.src='assets/ui/story-gold-restart-v1.svg';
    icon.className='bu-daily-finale-replay-icon';
    icon.alt='';icon.draggable=false;
    icon.setAttribute('aria-hidden','true');
    replay.prepend(icon);
    body.classList.add('bu-daily-finale-v1');
   }finally{inChange=false}
  }
  new MutationObserver(enhance).observe(body,{childList:true,subtree:false});
  enhance();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
 else start();
})();

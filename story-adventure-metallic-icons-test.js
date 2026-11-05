/* TEST ONLY — Story Adventure icons from the approved metallic-gold design family.
   Scope: #play ONLY. Reuse the exact cross-free Bible/hint/eye SVG masters.
   Preserve original <button> nodes, titles, handlers, hit targets and toolbar logic.
   Native Story code can reset its hint text; observer restores the art safely. */
(()=>{'use strict';
 const items=[
  ['scene-scripture','assets/ui/daily-gold-bible-v3.svg'],
  ['scene-context','assets/ui/story-gold-context-v1.svg'],
  ['scene-hint','assets/ui/daily-gold-hint-v3.svg'],
  ['scene-shuffle','assets/ui/story-gold-shuffle-v1.svg'],
  ['scene-clear','assets/ui/story-gold-clear-v1.svg'],
  ['scene-reveal','assets/ui/daily-gold-eye-v3.svg'],
  ['scene-restart','assets/ui/story-gold-restart-v1.svg'],
  ['to-home','assets/ui/story-gold-back-v1.svg'],
  ['play-menu','assets/ui/story-gold-menu-v1.svg'],
  // Newer chapter engines render their own toolbar and must share the same family.
  ['bu3863-scripture','assets/ui/daily-gold-bible-v3.svg'],
  ['bu3863-story','assets/ui/story-gold-context-v1.svg'],
  ['bu3857-hint','assets/ui/daily-gold-hint-v3.svg'],
  ['bu3863-shuffle','assets/ui/story-gold-shuffle-v1.svg'],
  ['bu3863-clear','assets/ui/story-gold-clear-v1.svg'],
  ['bu3857-clear','assets/ui/story-gold-clear-v1.svg'],
  ['bu3857-check','assets/ui/story-gold-check-v1.svg'],
  ['bu3857-reveal','assets/ui/daily-gold-eye-v3.svg']
 ];
 function start(){
  const root=document.getElementById('play');
  if(!root)return;
  let running=false;
  function refresh(){
   if(running)return;running=true;
   try{
    for(const [id,path] of items){
     const btn=root.querySelector('#'+id);
     if(!btn||btn.querySelector(':scope > img.bu-story-metal-icon'))continue;
     const icon=document.createElement('img');
     icon.className='bu-story-metal-icon';
     icon.src=path;icon.alt='';icon.draggable=false;
     icon.setAttribute('aria-hidden','true');
     btn.replaceChildren(icon);
    }
    // Completion buttons keep their human-readable labels and native handlers.
    for(const [id,path,strip] of [
     ['playAgain','assets/ui/story-gold-restart-v1.svg',/^(?:↻|⟲)\\s*/u],
     ['read-story','assets/ui/daily-gold-bible-v3.svg',/^📖\\s*/u]
    ]){
     const button=root.querySelector('#'+id);
     if(!button||button.querySelector(':scope > img.bu-story-metal-icon'))continue;
     const label=(button.textContent||'').replace(strip,'').trim();
     if(!label)continue;
     const icon=document.createElement('img');
     icon.className='bu-story-metal-icon';
     icon.src=path;icon.alt='';icon.draggable=false;
     icon.setAttribute('aria-hidden','true');
     button.replaceChildren(icon,document.createTextNode(' '+label));
    }
   }finally{running=false}
  }
  new MutationObserver(refresh).observe(root,{childList:true,subtree:true});
  refresh();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
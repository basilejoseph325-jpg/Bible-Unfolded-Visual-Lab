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
  ['play-menu','assets/ui/story-gold-menu-v1.svg']
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
   }finally{running=false}
  }
  new MutationObserver(refresh).observe(root,{childList:true,subtree:true});
  refresh();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
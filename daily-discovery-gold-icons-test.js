/* Daily Discovery in Visual Lab only: replace emoji glyphs with cross-free,
   individual transparent metallic-gold SVG artwork assets without replacing buttons, handlers or aria labels. */
(()=>{'use strict';
 function boot(){
 const root=document.getElementById('bu375-daily');
 if(!root)return;
 const imagePaths=[
  'assets/ui/daily-gold-bible-v3.svg',
  'assets/ui/daily-gold-hint-v3.svg',
  'assets/ui/daily-gold-eye-v3.svg'
 ];
 let busy=false;
 function refresh(){
  if(busy||root.hidden)return;
  const body=root.querySelector('#bu375-body.bu65-playing');
  if(!body)return;
  const buttons=body.querySelectorAll('.bu3918-tools button');
  if(buttons.length<3)return;
  busy=true;
  try{
   [0,1,2].forEach(i=>{
    const b=buttons[i];if(!b||(b.dataset.buGoldIcon==='1'&&b.querySelector('.bu-daily-gold-icon')))return;
    // The first three action slots are Scripture, Hint and Reveal.
    // Never change their button identity, event handler or accessibility label.
    const icon=document.createElement('span');
    icon.className='bu-daily-gold-icon';
    icon.setAttribute('aria-hidden','true');
    const img=document.createElement('img');
    img.src=imagePaths[i]+'?v=20261104-metal-art-v3';
    img.alt='';img.decoding='async';img.draggable=false;
    img.setAttribute('aria-hidden','true');
    icon.appendChild(img);
    b.replaceChildren(icon);
    b.dataset.buGoldIcon='1';
   });
  }finally{busy=false}
 }
 const obs=new MutationObserver(()=>refresh());
 obs.observe(root,{subtree:true,childList:true});
 refresh();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

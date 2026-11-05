/* Daily Discovery in Visual Lab only: replace emoji glyphs with cross-free,
   inline antique-gold SVGs without replacing buttons, handlers or aria labels. */
(()=>{'use strict';
 const root=document.getElementById('bu375-daily');
 if(!root)return;
 const svg=[
 '<svg viewBox="0 0 36 36" aria-hidden="true"><path d="M18 9c-4-3-9-4-14-3v22c5-1 10 0 14 3 4-3 9-4 14-3V6c-5-1-10 0-14 3Z"/><path d="M18 9v22M8 12c3-.2 5.2.5 7 1.6M8 17c3-.1 5.2.5 7 1.5M8 22c3-.1 5.2.5 7 1.5M21 13.6c2-1.1 4-1.6 7-1.6M21 18.5c2-1.1 4-1.6 7-1.5M21 23.5c2-1.1 4-1.6 7-1.5"/></svg>',
 '<svg viewBox="0 0 36 36" aria-hidden="true"><path d="M12.7 25c-.3-3.3-5.2-5.7-5.2-11.2a10.5 10.5 0 0 1 21 0c0 5.5-4.8 7.9-5.2 11.2Z"/><path d="M13.4 26.5h9.2M14 30h8M16 33h4M18 25V16m0 0-3-3m3 3 3-3M18 2V1M5 7 3 5M31 7l2-2M4 17H1M32 17h3"/></svg>',
 '<svg viewBox="0 0 36 36" aria-hidden="true"><path d="M2.5 18C7.7 11.2 12.8 8 18 8s10.3 3.2 15.5 10C28.3 24.8 23.2 28 18 28S7.7 24.8 2.5 18Z"/><circle cx="18" cy="18" r="6.5"/><circle cx="18" cy="18" r="2.5" fill="currentColor" stroke="none"/></svg>'
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
    const b=buttons[i];if(!b||b.dataset.buGoldIcon==='1')return;
    // The first three action slots are Scripture, Hint and Reveal.
    // Never change their button identity, event handler or accessibility label.
    const icon=document.createElement('span');
    icon.className='bu-daily-gold-icon';
    icon.setAttribute('aria-hidden','true');
    icon.innerHTML=svg[i];
    b.replaceChildren(icon);
    b.dataset.buGoldIcon='1';
   });
  }finally{busy=false}
 }
 const obs=new MutationObserver(()=>refresh());
 obs.observe(root,{subtree:true,childList:true});
 refresh();
})();

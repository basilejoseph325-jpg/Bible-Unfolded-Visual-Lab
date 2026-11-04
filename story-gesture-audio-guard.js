/* Bible Unfolded — Story Adventure audio-gesture fix, TEST ONLY (2026-11-04).
 * Suppress the original embedded PCM tap/knock (1941 frames at 22.05 kHz)
 * and repeated embedded wheel swishes (3309 frames at 22.05 kHz)
 * ONLY during the Genesis word-wheel gesture, or a chapter-card entry tap.
 * No changes to gameplay, correct-answer music, progress or saved data.
 */
(()=>{'use strict';
 if(window.__BUStoryAudioGuardV1)return;
 window.__BUStoryAudioGuardV1=true;
 const AudioNode=window.AudioBufferSourceNode;
 if(!AudioNode?.prototype?.start)return;
 const originalStart=AudioNode.prototype.start;
 const now=()=>performance.now();
 let wheelGesture=null, wheelClickUntil=0, lastPointerAt=-10000, chapterUntil=0;
 const isActive=(id)=>{const e=document.getElementById(id);return !!e&&!e.hidden&&e.getClientRects().length>0;};
 const hasWheel=()=>isActive('bu3857-screen')&&!!document.getElementById('buhq-wheel');
 const playApproved=(kind,relative)=>{try{window.BUPremiumSFX?.play?.(kind,relative)}catch(_){}};
 AudioNode.prototype.start=function(){
   const b=this.buffer, t=now();
   if(b&&b.sampleRate===22050){
     if(b.length===1941){
       if((hasWheel()&&(!!wheelGesture||t<wheelClickUntil))||t<chapterUntil)return;
     }
     if(b.length===3309&&hasWheel()&&wheelGesture)return;
   }
   return originalStart.apply(this,arguments);
 };
 window.addEventListener('pointerdown',e=>{
   const el=e.target?.nodeType===1?e.target:e.target?.parentElement;
   if(!el?.closest)return;
   lastPointerAt=now();
   if(isActive('episodes')&&el.closest('#episodes .episode-card')){
     chapterUntil=now()+650;return;
   }
   if(!hasWheel())return;
   const letter=el.closest('#buhq-wheel [data-buhq]');
   if(!letter)return;
   wheelGesture={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false,played:false};
 },true);
 window.addEventListener('pointermove',e=>{
   const g=wheelGesture;if(!g||g.id!==e.pointerId)return;
   if(!hasWheel()){wheelGesture=null;return}
   if(Math.hypot(e.clientX-g.x,e.clientY-g.y)>11){
     g.moved=true;
     if(!g.played){g.played=true;playApproved('swish',.24)}
   }
 },true);
 function finish(e,cancel){
   const g=wheelGesture;if(!g||g.id!==e.pointerId)return;
   wheelGesture=null;
   wheelClickUntil=now()+160;
   if(!cancel&&!g.moved&&Math.hypot(e.clientX-g.x,e.clientY-g.y)<=11){
     playApproved('tap',.22);
   }
 }
 window.addEventListener('pointerup',e=>finish(e,false),true);
 window.addEventListener('pointercancel',e=>finish(e,true),true);
 window.addEventListener('click',e=>{
   const el=e.target?.nodeType===1?e.target:e.target?.parentElement;
   if(!el?.closest)return;
   if(isActive('episodes')&&el.closest('#episodes .episode-card')){
     chapterUntil=now()+650;
   }
   if(hasWheel()&&el.closest('#buhq-wheel [data-buhq]')&&now()-lastPointerAt>500){
     wheelClickUntil=now()+180;
     playApproved('tap',.22);
   }
 },true);
})();

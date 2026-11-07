/* VISUAL LAB — Family Worship scored-answer scroll V2.
 * Covered native phases: Trivia, Lightning, Word Relay, Story Discoveries.
 * All answered states (correct, wrong, skipped, revealed words) use the existing
 * photorealistic V3 parchment and V2 wax. Non-answer prompts, hints, reading,
 * discussion, Spin & Share, round handoffs, setup and final leaderboard remain
 * untouched. Real native nextturn callbacks are invoked; no scoring changes. */
(()=>{'use strict';
 if(window.BU_FW_ANSWER_SCROLL_V2)return;
 window.BU_FW_ANSWER_SCROLL_V2=true;
 const TAG='bu-fw-answer-scroll';
 const PHASES=['trivia','lightning','words','story'];
 let shownKey=null, syncing=false;
 function info(){
   const root=document.getElementById('bu35-family');
   const body=document.getElementById('bu35-body');
   const phase=root?.dataset.bu67Phase||'';
   const visible=!!root&&!root.hidden&&root.classList.contains('bu67-family-play');
   const next=body?.querySelector('#bu35-nextturn');
   return {root,body,phase,visible,next};
 }
 function titleOk(title,phase){
   return new RegExp('^Family Worship\\s*[·•-]\\s*'+phase+'\\s*$','i').test(title);
 }
 function reopenText(){
   const {phase,visible,body,next}=info();
   if(!visible||!['words','story'].includes(phase)||!next)return;
   const feedback=body?.querySelector('.bu35-feedback');
   if(!feedback||typeof window.bu67Modal!=='function')return;
   const key=phase+'|'+(body.querySelector('.bu35-kicker')?.textContent||'')+'|'+(body.querySelector('.bu35-stage')?.textContent||'')+'|'+(feedback.textContent||'');
   if(shownKey===key)return;
   shownKey=key;
   const open=()=>{
     if(!next.isConnected||!feedback.isConnected)return;
     window.bu67Modal('Family Worship · '+phase,[feedback.cloneNode(true)]);
   };
   // The original inline feedback remains on the gameplay page. It can always
   // be tapped to re-open the scroll after X, without altering the control row.
   feedback.setAttribute('role','button');
   feedback.tabIndex=0;
   feedback.setAttribute('aria-label','Read full answer explanation');
   feedback.addEventListener('click',open);
   feedback.addEventListener('keydown',e=>{
     if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}
   });
   open();
 }
 function skin(){
   const dlg=document.getElementById('bu67-modal');
   if(!dlg)return;
   const head=dlg.querySelector(':scope > .bu67-dialog-head > strong');
   const body=dlg.querySelector(':scope > .bu67-dialog-body');
   const {phase,visible,next}=info();
   const name=(head?.dataset.fwOriginalTitle||head?.textContent||'').trim();
   const active=dlg.open&&visible&&PHASES.includes(phase)&&titleOk(name,phase)&&
     !!body?.querySelector('.bu35-feedback')&&!!next;
   if(!active){
     if(dlg.classList.contains(TAG)){
       dlg.classList.remove(TAG);
       dlg.querySelector('.bu-fw-answer-scroll-actions')?.remove();
       if(head?.dataset.fwOriginalTitle){
         head.textContent=head.dataset.fwOriginalTitle;
         delete head.dataset.fwOriginalTitle;
       }
     }
     return;
   }
   dlg.classList.add(TAG);
   if(head&&!head.dataset.fwOriginalTitle){
     head.dataset.fwOriginalTitle=head.textContent;
     head.textContent=phase==='story'?'Story Discovery':phase==='words'?'Word Discovery':'Answer Explanation';
   }
   let footer=dlg.querySelector('.bu-fw-answer-scroll-actions');
   if(!footer){
     footer=document.createElement('div');
     footer.className='bu-fw-answer-scroll-actions';
     const button=document.createElement('button');
     button.type='button';button.className='bu-fw-answer-scroll-return';
     footer.append(button);
     dlg.append(footer);
   }
   const button=footer.querySelector('button');
   const label=(next.textContent||'Continue').replace(/\s*[→›➜]\s*$/u,'').trim();
   if(button.textContent!==label)button.textContent=label;
   button.setAttribute('aria-label',label+' Family Worship');
   // The original nextturn button is still connected and owns all turn,
   // save, reward, score, and phase-advancement behavior.
   button.onclick=()=>{
     const original=info().next;
     dlg.querySelector('.bu67-dialog-x')?.click();
     if(original?.isConnected)original.click();
   };
 }
 function sync(){
   if(syncing)return;syncing=true;
   try{
     const {phase,visible,next}=info();
     if(!visible||!['words','story'].includes(phase)||!next)shownKey=null;
     // Reopening a popup can add child nodes. This state guard prevents
     // duplicate modals and observer loops.
     reopenText();
     skin();
   }finally{syncing=false;}
 }
 function boot(){
   if(!document.body)return;
   new MutationObserver(sync).observe(document.body,{
     childList:true,subtree:true,attributes:true,attributeFilter:['open']
   });
   sync();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
 else boot();
})();
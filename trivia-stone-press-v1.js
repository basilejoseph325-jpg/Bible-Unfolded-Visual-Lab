/* VISUAL LAB ONLY — tactile press on existing Bible Trivia stone answers.
   Does not replace, disable, submit, or delay native Trivia handlers. */
(()=>{'use strict';
  if(window.BU_TRIVIA_STONE_PRESS_V1)return;
  window.BU_TRIVIA_STONE_PRESS_V1=true;
  const selector='#bu34-trivia #bu34-body.bu65-playing > .bu34-question > .bu34-answer[data-answer]';
  const timers=new WeakMap();
  function find(e,allowDisabled=false){
    const button=e?.target?.closest?.(selector);
    if(!button)return null;
    if(!allowDisabled && (button.disabled || button.matches(':disabled') || button.classList.contains('bu3922-eliminated')))return null;
    return button;
  }
  function brieflyPress(button,ms){
    if(!button)return;
    const previous=timers.get(button);
    if(previous)clearTimeout(previous);
    button.classList.add('bu-trivia-pressing');
    const handle=setTimeout(()=>{
      button.classList.remove('bu-trivia-pressing');
      timers.delete(button);
    },ms);
    timers.set(button,handle);
  }
  document.addEventListener('pointerdown',e=>{
    if(e.button!==undefined && e.button!==0)return;
    brieflyPress(find(e),650);
  },{capture:true,passive:true});
  document.addEventListener('pointerup',e=>{
    const button=find(e,true);
    if(button && button.classList.contains('bu-trivia-pressing'))brieflyPress(button,185);
  },{capture:true,passive:true});
  document.addEventListener('pointercancel',e=>{
    const button=find(e,true);
    if(button && button.classList.contains('bu-trivia-pressing'))brieflyPress(button,60);
  },{capture:true,passive:true});
  document.addEventListener('click',e=>{
    const button=find(e,true);
    if(button && button.classList.contains('bu-trivia-pressing'))brieflyPress(button,215);
    // Keyboard/assistive clicks may occur without pointerdown.
    else if(button && !button.disabled && !button.matches(':disabled'))brieflyPress(button,215);
  },true);
  document.addEventListener('keydown',e=>{
    if(e.repeat || (e.key!=='Enter' && e.key!==' '))return;
    brieflyPress(find(e),650);
  },true);
  document.addEventListener('keyup',e=>{
    if(e.key!=='Enter' && e.key!==' ')return;
    const button=find(e,true);
    if(button && button.classList.contains('bu-trivia-pressing'))brieflyPress(button,215);
  },true);
})();

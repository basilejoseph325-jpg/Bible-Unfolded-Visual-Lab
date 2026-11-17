/* Bible Unfolded — Visual Lab ONLY. Family Worship Gathering Room V1.
 * Presentation only: original players, save handlers, topic and difficulty selects,
 * time/style buttons, session options, scoring, and Begin handler remain native.
 * The setup's explanatory copy belongs in the existing menu > How to Play. */
(()=>{'use strict';
if(window.BU_FAMILY_GATHERING_V1)return;
window.BU_FAMILY_GATHERING_V1=true;
const root=document.getElementById('bu35-family');
const body=document.getElementById('bu35-body');
if(!root||!body)return;
let picker=null,scheduled=false;
function closePicker(refocus){
  if(!picker)return;
  const old=picker;picker=null;
  document.removeEventListener('keydown',old.keyHandler,true);
  old.overlay.remove();
  if(refocus&&old.trigger?.isConnected)old.trigger.focus({preventScroll:true});
}
function addToHelp(){
  const help=document.getElementById('help-dialog');
  if(!help||help.querySelector('#bu-fw-help'))return;
  const section=document.createElement('section');
  section.id='bu-fw-help';
  section.setAttribute('aria-label','Family Worship instructions');
  section.innerHTML='<h3>Family Worship</h3>'+
    '<p>Choose 2–6 players, a Bible topic or collection, question level, session length and play style. Take turns using one device.</p>'+
    '<p>When a topic has too few questions at the requested level, nearby levels or clearly labeled wider-Bible questions may appear. Personal discussions are never graded.</p>'+
    '<p><b>Team Adventure</b> is collaborative; <b>Friendly Challenge</b> offers friendly competition. Session options let you choose Fresh Mix or Classic Guided activity order.</p>';
  const done=help.querySelector('#help-done');
  if(done)done.before(section);else help.appendChild(section);
}
function selectedText(select){return select.selectedOptions?.[0]?.textContent.trim()||'Choose'}
function showPicker(select,trigger,title){
  closePicker(false);
  if(!select.isConnected)return;
  const overlay=document.createElement('div');
  overlay.id='bu-fw-picker-layer';
  const dialog=document.createElement('section');
  dialog.className='bu-fw-picker-dialog';
  dialog.setAttribute('role','dialog');
  dialog.setAttribute('aria-modal','true');
  dialog.setAttribute('aria-labelledby','bu-fw-picker-title');
  const heading=document.createElement('header');
  heading.className='bu-fw-picker-head';
  const h2=document.createElement('h2');
  h2.id='bu-fw-picker-title';h2.textContent=title;
  const close=document.createElement('button');
  close.type='button';close.className='bu-fw-picker-close';close.textContent='×';
  close.setAttribute('aria-label','Close choices');
  heading.append(h2,close);dialog.appendChild(heading);
  const options=Array.from(select.options).filter(o=>!o.disabled&&!o.hidden);
  let search=null;
  if(options.length>10){
    search=document.createElement('input');search.type='search';
    search.placeholder='Search Bible topics…';search.className='bu-fw-picker-search';
    search.setAttribute('aria-label','Search options');
    dialog.appendChild(search);
  }
  const list=document.createElement('div');list.className='bu-fw-picker-options';
  list.setAttribute('role','listbox');dialog.appendChild(list);
  overlay.appendChild(dialog);document.body.appendChild(overlay);
  function render(filter){
    list.replaceChildren();
    const q=(filter||'').trim().toLowerCase();
    let count=0;
    for(const option of options){
      if(q&&!option.textContent.toLowerCase().includes(q))continue;
      const b=document.createElement('button');
      b.type='button';b.className='bu-fw-picker-option';
      b.setAttribute('role','option');
      b.setAttribute('aria-selected',String(option.value===select.value));
      const name=document.createElement('span');name.textContent=option.textContent.trim();
      const tick=document.createElement('span');tick.className='bu-fw-picker-tick';
      tick.setAttribute('aria-hidden','true');tick.textContent=option.value===select.value?'✓':'';
      b.append(name,tick);
      b.onclick=()=>{
        select.value=option.value;
        select.dispatchEvent(new Event('change',{bubbles:true}));
        trigger.querySelector('.bu-fw-current').textContent=selectedText(select);
        trigger.setAttribute('aria-label',title+': '+selectedText(select));
        closePicker(true);
      };
      list.appendChild(b);count++;
    }
    if(!count){const p=document.createElement('p');p.className='bu-fw-no-options';p.textContent='No matching topics.';list.appendChild(p)}
  }
  render('');
  const keyHandler=e=>{
    if(!overlay.isConnected)return;
    if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closePicker(true)}
    if(e.key==='Tab'){
      const focusable=[...overlay.querySelectorAll('input,button')].filter(x=>x.getClientRects().length);
      if(!focusable.length)return;
      const first=focusable[0],last=focusable[focusable.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
    }
  };
  close.onclick=()=>closePicker(true);
  overlay.addEventListener('click',e=>{if(e.target===overlay)closePicker(true)});
  if(search)search.addEventListener('input',()=>render(search.value));
  document.addEventListener('keydown',keyHandler,true);
  picker={overlay,trigger,keyHandler};
  close.focus({preventScroll:true});
}
function enhanceSelect(field,select,title){
  if(!select)return;
  select.classList.add('bu-fw-original-select');
  select.tabIndex=-1;
  select.setAttribute('aria-hidden','true');
  const trigger=document.createElement('button');
  trigger.type='button';trigger.className='bu-fw-selector';
  trigger.setAttribute('aria-haspopup','dialog');
  trigger.setAttribute('aria-label',title+': '+selectedText(select));
  const label=document.createElement('span');label.className='bu-fw-current';
  label.textContent=selectedText(select);
  const chevron=document.createElement('span');chevron.className='bu-fw-chevron';
  chevron.setAttribute('aria-hidden','true');
  trigger.append(label,chevron);
  select.insertAdjacentElement('afterend',trigger);
  trigger.onclick=()=>showPicker(select,trigger,title);
}
function enhance(){
  const start=body.querySelector('#bu35-start');
  const topic=body.querySelector('#bu35-topic');
  const level=body.querySelector('#bu3826-level');
  const card=start?.closest('.bu35-card');
  const hero=body.querySelector('.bu35-hero');
  const family=hero?.querySelector('.bu35-kicker')?.textContent.trim()==='FAMILY WORSHIP';
  if(!start||!topic||!level||!card||!family){
    root.classList.remove('bu-fw-gathering');
    closePicker(false);return;
  }
  if(card.dataset.buFwGathering==='v1')return;
  card.dataset.buFwGathering='v1';
  root.classList.add('bu-fw-gathering');
  addToHelp();
  // Remove the instructions from the form, not just visually hide them.
  hero.querySelector('p')?.remove();
  const levelWrap=level.closest('.bu3826-level-wrap');
  levelWrap?.querySelector('.bu35-muted')?.remove();
  if(!levelWrap)return;
  const topicLabel=topic.previousElementSibling;
  if(!topicLabel||!topicLabel.classList.contains('bu35-label'))return;
  const row=document.createElement('div');row.className='bu-fw-selection-row';
  const fieldTopic=document.createElement('div');fieldTopic.className='bu-fw-field bu-fw-topic';
  const fieldLevel=document.createElement('div');fieldLevel.className='bu-fw-field bu-fw-level';
  topicLabel.before(row);
  row.append(fieldTopic,fieldLevel);
  fieldTopic.append(topicLabel,topic);
  fieldLevel.append(levelWrap);
  topicLabel.textContent='BIBLE TOPIC';
  levelWrap.querySelector('.bu35-label')?.setAttribute('for','bu3826-level');
  enhanceSelect(fieldTopic,topic,'Choose Bible topic');
  enhanceSelect(fieldLevel,level,'Choose question level');
  // Remove redundant bottom Back link; the original header Back remains available.
  const cancel=card.querySelector('#bu35-cancel');
  if(cancel)cancel.hidden=true;
}
function requestEnhance(){
  if(scheduled)return;scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;enhance()});
}
function start(){
  addToHelp();
  new MutationObserver(requestEnhance).observe(body,{childList:true,subtree:true});
  requestEnhance();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
})();


/* Visual Lab TEST — add the already-merged, standalone Bible Clue Relay to
 * the existing Family Worship setup without replacing native activities.
 * Relay points are session-only; no shared wallet, saves or award APIs used.
 * The old Family Worship game and its handlers remain unchanged. */
(()=>{'use strict';
 if(location.pathname.includes('/experiments/')||window.BUFamilyClueRelayMenuV1)return;
 const ROOT='bu35-family',BODY='bu35-body',START='bu35-start';
 const ENTRY='bu-fw-clue-relay-entry',SHELL='bu-fw-clue-relay-shell';
 const MUSIC=['music-navigation','music-story','music-trails','music',
  'music-daily','music-builder','music-name'];
 const lease=new Map();
 let shell=null,launchButton=null,muteTimer=null,scheduled=false;
 function silence(){
  if(!shell?.isConnected)return;
  try{window.pauseAudio?.()}catch(_){}
  for(const id of MUSIC){
   const player=document.getElementById(id);
   if(!(player instanceof HTMLMediaElement))continue;
   if(!lease.has(player))lease.set(player,player.muted);
   player.muted=true;
   if(!player.paused)try{player.pause()}catch(_){}
  }
 }
 function restoreAudio(){
  if(muteTimer!==null){clearInterval(muteTimer);muteTimer=null;}
  for(const [player,wasMuted] of lease){
   try{player.muted=wasMuted}catch(_){}
  }
  lease.clear();
  try{window.syncMusic?.()}catch(_){}
 }
 function close(fromHistory=false){
  if(!shell?.isConnected)return;
  const old=shell;shell=null;old.remove();
  document.documentElement.classList.remove('bu-fw-clue-relay-active');
  restoreAudio();
  if(!fromHistory&&location.hash==='#family-clue-relay')history.back();
  if(launchButton?.isConnected)launchButton.focus({preventScroll:true});
 }
 function launch(){
  if(shell?.isConnected)return;
  try{window.closeMenu?.();window.closeDialog?.()}catch(_){}
  shell=document.createElement('section');
  shell.id=SHELL;shell.setAttribute('role','dialog');
  shell.setAttribute('aria-modal','true');
  shell.setAttribute('aria-label','Bible Clue Relay game');
  const top=document.createElement('header');
  const back=document.createElement('button');
  back.id='bu-fw-clue-relay-back';back.type='button';
  back.textContent='‹ Family Worship';
  back.setAttribute('aria-label','Return to Family Worship');
  back.addEventListener('click',()=>close());
  const title=document.createElement('span');
  title.textContent='BIBLE CLUE RELAY · TEST';
  const frame=document.createElement('iframe');
  frame.id='bu-fw-clue-relay-frame';
  frame.title='Bible Clue Relay, pass-the-phone Bible game';
  frame.src='experiments/family-clue-relay-v1.html?v=family-menu-test-v1';
  top.append(back,title);shell.append(top,frame);
  document.body.appendChild(shell);
  document.documentElement.classList.add('bu-fw-clue-relay-active');
  history.pushState({buFamilyClueRelay:true},'','#family-clue-relay');
  silence();muteTimer=setInterval(silence,450);
  back.focus({preventScroll:true});
 }
 function mount(){
  const root=document.getElementById(ROOT);
  const body=document.getElementById(BODY);
  const start=body?.querySelector('#'+START);
  const card=start?.closest('.bu35-card');
  const kicker=body?.querySelector('.bu35-hero .bu35-kicker');
  if(!root||!card||kicker?.textContent?.trim()!=='FAMILY WORSHIP')return;
  if(card.querySelector('#'+ENTRY))return;
  const entry=document.createElement('div');entry.id=ENTRY;
  const caption=document.createElement('span');
  caption.textContent='OR TRY A DIFFERENT FAMILY GAME';
  const button=document.createElement('button');
  button.id='bu-fw-clue-relay-launch';button.type='button';
  button.textContent='✦ Bible Clue Relay  ·  NEW';
  button.setAttribute('aria-label','Play Bible Clue Relay with two to six players');
  button.addEventListener('click',e=>{
   e.preventDefault();e.stopPropagation();launchButton=button;launch();
  });
  entry.append(caption,button);start.insertAdjacentElement('afterend',entry);
 }
 function requestMount(){
  if(scheduled)return;scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;mount()});
 }
 function boot(){
  const body=document.getElementById(BODY);
  if(!body)return;
  const style=document.createElement('style');
  style.id='bu-fw-clue-relay-menu-style';
  style.textContent=
   '#'+ENTRY+'{margin:7px 0 0;text-align:center;display:grid;gap:4px}'+
   '#'+ENTRY+'>span{font:800 9px/1.2 system-ui,sans-serif;letter-spacing:.1em;color:#ddc58b}'+
   '#'+ENTRY+'>button{box-sizing:border-box;width:100%;min-height:42px;border-radius:11px;'+
    'border:1.3px solid #cfba83;background:linear-gradient(140deg,#245561,#113845);'+
    'color:#ffe4aa;font:800 15px/1.2 Georgia,serif;box-shadow:0 2px 8px #0007}'+
   '#'+ENTRY+'>button:focus-visible,#bu-fw-clue-relay-back:focus-visible{outline:2px solid #ffe4a3;outline-offset:2px}'+
   '#'+SHELL+'{position:fixed!important;inset:0!important;z-index:25000!important;'+
    'display:flex!important;flex-direction:column!important;min-height:0!important;'+
    'padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);'+
    'background:#092c35!important;color:#ffe4a9!important}'+
   '#'+SHELL+'>header{flex:none;min-height:45px;display:flex;align-items:center;'+
    'gap:9px;padding:4px 10px;background:#082d39;border-bottom:1px solid #caa66e;'+
    'font:800 10px/1.2 system-ui,sans-serif;letter-spacing:.07em}'+
   '#'+SHELL+'>header>span{overflow:hidden;white-space:nowrap;text-overflow:ellipsis}'+
   '#bu-fw-clue-relay-back{min-height:36px;flex:none;padding:6px 11px;'+
    'border-radius:9px;border:1px solid #d9b675;background:#214a53;'+
    'color:#ffdf9e;font:700 13px system-ui,sans-serif}'+
   '#bu-fw-clue-relay-frame{display:block;flex:1;min-height:0;width:100%;'+
    'border:0;background:#092c35}';
  document.head.append(style);
  new MutationObserver(requestMount).observe(body,{childList:true,subtree:true});
  requestMount();
 }
 window.addEventListener('popstate',()=>{
  if(shell?.isConnected)close(true);
 });
 if(document.readyState==='loading')
  document.addEventListener('DOMContentLoaded',boot,{once:true});
 else boot();
 window.BUFamilyClueRelayMenuV1=Object.freeze({active:()=>!!shell?.isConnected,close});
})();

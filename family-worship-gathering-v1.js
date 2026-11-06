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

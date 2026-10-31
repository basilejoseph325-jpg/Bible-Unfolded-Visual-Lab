/* Bible Unfolded Visual Lab — native Trivia Together settings enhancement.
   The original selects remain the source of truth for saved topic/difficulty and game logic. */
(function(){
'use strict';
if(window.BU_TT_PREMIUM_TEST_INSTALLED)return;
if(typeof bu35RenderSetup!=='function'||typeof bu35Render!=='function')return;
window.BU_TT_PREMIUM_TEST_INSTALLED=true;
const ROOT=document.getElementById('bu35-family');
if(!ROOT)return;
const PREFIX='scholar-research-assets/';
const CROWN='<svg viewBox="0 0 64 64" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="ttcrown" x2=".25" y2="1"><stop stop-color="#fff4b7"/><stop offset=".52" stop-color="#ffce57"/><stop offset="1" stop-color="#c98129"/></linearGradient></defs><path d="M7 17 20 30 31 9 44 30 57 17 52 47H12Z" fill="url(#ttcrown)" stroke="#fff0af" stroke-width="2.2" stroke-linejoin="round"/><rect x="12" y="47" width="40" height="8" rx="2" fill="#e4a74d" stroke="#ffe9ad" stroke-width="2"/><circle cx="31" cy="34" r="4" fill="#7f3bbf"/><circle cx="17" cy="39" r="3" fill="#3fbaba"/><circle cx="45" cy="39" r="3" fill="#b32742"/></svg>';
const BOOK='<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M31 17Q18 11 6 15v36q14-4 25 4zm2 0q13-6 25-2v36q-14-4-25 4z" fill="#ebc577" stroke="#ffebb7" stroke-width="2.2"/><path d="M32 18v37M11 24q11-2 17 2m-17 7q11-2 17 2m8-9q8-4 17-2m-17 11q8-4 17-2" stroke="#805c32" stroke-width="2" fill="none"/></svg>';
const STAR='<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M32 5 40 24 60 32 40 40 32 59 24 40 4 32 24 24Z" fill="#f2c663" stroke="#fff1ba" stroke-width="2"/></svg>';
const LEVEL_ICONS={beginner:BOOK,intermediate:BOOK,advanced:STAR,expert:CROWN};
const LEVEL_ART={beginner:'warm-up',intermediate:'hidden-bible-details',advanced:'big-bible-questions',expert:'ultimate-challenge'};
let active=null;
function artFor(value,label,type){
 if(type==='level')return PREFIX+(LEVEL_ART[value]||'warm-up')+'.webp';
 const s=(value+' '+label).toLowerCase();
 let key='hidden-bible-details';
 if(/david|samuel|solomon|gideon|elijah|elisha|esther|daniel|samson|apostle|peter|paul|timothy|courage|king/.test(s))key='heroes-of-courage';
 else if(/joshua|jericho|moses|exodus|israel/.test(s))key='joshua-jericho';
 else if(/prophe|kingdom|armageddon|future|promise|revelation/.test(s))key='prophecies-uncovered';
 else if(/witness|modern|history/.test(s))key='witness-history';
 else if(/creation|genesis|eden|paradise|nature/.test(s))key='hero';
 else if(/faith|job|integrity|christian|qualities|love/.test(s))key='courage-and-faith';
 else if(/challenge|master|allbible|all bible|whole bible|surprise/.test(s))key='ultimate-challenge';
 else if(/question|mystery|proverb|psalm|riddle/.test(s))key='big-bible-questions';
 else if(/noah|flood|jonah|boat|sea/.test(s))key='witness-history';
 return PREFIX+key+'.webp';
}
function sceneBackground(value,label,type){
 return 'linear-gradient(180deg,#02151c14 0%,#01192308 38%,#001922b2 88%,#001922dd 100%),url("'+artFor(value,label,type)+'")';
}
function picture(value,label,type,extraClass){
 const span=document.createElement('span');
 span.className='bu-tt-picture'+(extraClass?' '+extraClass:'');
 span.style.backgroundImage='linear-gradient(90deg,#031d2940,#082d3b22),url("'+artFor(value,label,type)+'")';
 if(type==='level')span.innerHTML=LEVEL_ICONS[value]||STAR;
 return span;
}
function selectedText(select){return select.selectedOptions&&select.selectedOptions[0]?select.selectedOptions[0].textContent.trim():''}
function closePicker(refocus){
 if(!active)return;
 const item=active;
 active=null;
 document.removeEventListener('keydown',item.keyHandler,true);
 item.overlay.remove();
 if(refocus && item.trigger && item.trigger.isConnected)item.trigger.focus();
}
function choose(select,type,trigger,value){
 select.value=value;
 if(select.value!==value)return;
 select.dispatchEvent(new Event('change',{bubbles:true}));
 trigger.querySelector('.bu-tt-selected').textContent=selectedText(select);
 trigger.style.backgroundImage=sceneBackground(value,selectedText(select),type);
 trigger.setAttribute('aria-label',(type==='topic'?'Choose Bible topic. Current: ':'Choose question level. Current: ')+selectedText(select));
 const old=trigger.querySelector('.bu-tt-picture');
 old.replaceWith(picture(value,selectedText(select),type,type==='level'?'bu-tt-level-picture':''));
 closePicker(true);
}
function openPicker(select,type,trigger){
 closePicker(false);
 if(!select.isConnected)return;
 const overlay=document.createElement('div');overlay.id='bu-tt-overlay';
 const dialog=document.createElement('section');dialog.className='bu-tt-dialog';
 dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-labelledby','bu-tt-dialog-title');
 const header=document.createElement('div');header.className='bu-tt-dialog-head';
 const title=document.createElement('h2');title.id='bu-tt-dialog-title';title.textContent=type==='topic'?'Choose a Bible Topic':'Choose Your Level';
 const close=document.createElement('button');close.type='button';close.className='bu-tt-close';close.setAttribute('aria-label','Close without changing');close.textContent='×';
 header.append(title,close);dialog.appendChild(header);
 const search=type==='topic'?document.createElement('input'):null;
 if(search){search.type='search';search.className='bu-tt-search';search.placeholder='Search Bible topics…';search.setAttribute('aria-label','Search Bible topics');dialog.appendChild(search)}
 const results=document.createElement('div');results.className='bu-tt-results';results.setAttribute('role','listbox');results.setAttribute('aria-label',type==='topic'?'Bible topics':'Question levels');dialog.appendChild(results);
 overlay.appendChild(dialog);document.body.appendChild(overlay);
 const entries=[],seen=new Set();
 for(const option of Array.from(select.querySelectorAll('option'))){
  const value=option.value;
  if(!value||seen.has(value))continue;
  seen.add(value);
  entries.push({value:value,label:option.textContent.trim(),group:option.closest('optgroup')?.label||'Bible Topics'});
 }
 function draw(filter){
  results.replaceChildren();
  const text=(filter||'').trim().toLocaleLowerCase();
  let lastGroup=null,count=0;
  for(const entry of entries){
   if(text && !(entry.label+' '+entry.group).toLocaleLowerCase().includes(text))continue;
   if(entry.group!==lastGroup){
    const h=document.createElement('div');h.className='bu-tt-group';h.textContent=type==='level'?'Select the challenge':entry.group;results.appendChild(h);lastGroup=entry.group;
   }
   const b=document.createElement('button');b.type='button';b.className='bu-tt-choice';
   b.style.backgroundImage=sceneBackground(entry.value,entry.label,type);
   b.setAttribute('role','option');b.setAttribute('aria-selected',String(entry.value===select.value));
   b.appendChild(picture(entry.value,entry.label,type,'bu-tt-choice-picture'));
   const label=document.createElement('span');label.className='bu-tt-choice-label';label.textContent=entry.label;b.appendChild(label);
   if(entry.value===select.value){const mark=document.createElement('span');mark.className='bu-tt-check';mark.setAttribute('aria-hidden','true');mark.textContent='✓';b.appendChild(mark)}
   b.onclick=function(){choose(select,type,trigger,entry.value)};
   results.appendChild(b);count++;
  }
  if(!count){const empty=document.createElement('p');empty.className='bu-tt-empty';empty.textContent='No matching Bible topics. Try another search.';results.appendChild(empty)}
  results.scrollTop=0;
 }
 draw('');
 function keyHandler(e){
  if(!overlay.isConnected)return;
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closePicker(true);return}
  if(e.key==='Tab'){
   const f=Array.from(overlay.querySelectorAll('button,input')).filter(x=>x.offsetParent!==null);
   if(!f.length)return;
   const first=f[0],last=f[f.length-1];
   if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus()}
   else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus()}
  }
 }
 close.onclick=function(){closePicker(true)};
 overlay.addEventListener('click',function(e){if(e.target===overlay)closePicker(true)});
 if(search)search.addEventListener('input',function(){draw(search.value)});
 document.addEventListener('keydown',keyHandler,true);
 active={overlay:overlay,trigger:trigger,keyHandler:keyHandler};
 close.focus({preventScroll:true});
}
function addButton(select,type){
 select.classList.add('bu-tt-native');select.tabIndex=-1;
 select.setAttribute('aria-hidden','true');
 const button=document.createElement('button');button.type='button';button.className='bu-tt-picker-button';
 button.style.backgroundImage=sceneBackground(select.value,selectedText(select),type);
 const label=selectedText(select);
 button.appendChild(picture(select.value,label,type,type==='level'?'bu-tt-level-picture':''));
 const text=document.createElement('span');text.className='bu-tt-selected';text.textContent=label;button.appendChild(text);
 const arrow=document.createElement('span');arrow.className='bu-tt-chevron';arrow.setAttribute('aria-hidden','true');button.appendChild(arrow);
 button.setAttribute('aria-label',(type==='topic'?'Choose Bible topic. Current: ':'Choose question level. Current: ')+label);
 button.setAttribute('aria-haspopup','dialog');
 select.insertAdjacentElement('afterend',button);
 button.addEventListener('click',function(){openPicker(select,type,button)});
}
const previousSetup=bu35RenderSetup;
bu35RenderSetup=function(body){
 previousSetup(body);
 if(bu35Setup.quick!=='trivia'){ROOT.classList.remove('bu-tt-premium');return}
 const topic=body.querySelector('#bu35-topic');
 const level=body.querySelector('#bu3826-level');
 if(!topic||!level){ROOT.classList.remove('bu-tt-premium');return}
 ROOT.classList.add('bu-tt-premium');
 addButton(topic,'topic');
 addButton(level,'level');
};
const previousRender=bu35Render;
bu35Render=function(){
 closePicker(false);
 const out=previousRender.apply(this,arguments);
 if(bu35View!=='setup'||bu35Setup.quick!=='trivia')ROOT.classList.remove('bu-tt-premium');
 return out;
};
})();
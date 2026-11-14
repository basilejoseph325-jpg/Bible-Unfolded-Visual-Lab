/* Bible Unfolded · Daily Discovery Reimagined V1 · Visual Lab ONLY
 * Replaces duplicate daily Trivia/Deep Dive question UI with:
 *  - a source-checked illustrated thought each day,
 *  - an optional meaningful reflection,
 *  - Share the Thought: a warm, respectful conversation idea,
 *  - a personal collection of saved insights.
 *
 * We reuse native #bu375-daily screen and its home entry, back, music.
 * IMPORTANT: The legacy v375 daily quiz state, its recovery copy, the
 * canonical v17 wallet, awards, daily checkmark, and all gameplay saves
 * are intentionally READ-ONLY / untouched by this TEST feature.
 * Pilot content cycles after the current 30 days; a sustainable editorial pipeline
 * must be added before claiming an unlimited daily library.
 */
(()=>{'use strict';
if(window.BUDailyInsightV1)return;
const KEY='bu-daily-insight-test-v1';
const Q=new URLSearchParams(location.search);
// A deliberately explicit, TEST-repository-only editorial QA route.
// Never expose the full 30-lesson browser or ?daily_preview= on normal Daily.
const editorialQA=()=>Q.get('daily_qa')==='1'&&(
 (location.hostname==='basilejoseph325-jpg.github.io'&&location.pathname.startsWith('/Bible-Unfolded-Visual-Lab/'))||
 ['127.0.0.1','localhost'].includes(location.hostname));
const DATA=()=>window.BUDailyDiscoveryLibrary||[];
// TEST only: a curated historical illustration for every existing lesson.
// Seven now use purpose-made, reviewed artistic reconstructions. Other items
// deliberately REUSE named art already present in the repository and are marked
// 'Thematic illustration', never represented as the literal Bible event.
// This is an editorial visual pilot: no lesson text, IDs, wallet, or saves change.
const BOOK_ORIGINALS=new Set(['peter','nile','ruth','early-students','naaman-girl','well','paul-storm','philip','bereans','abigail','dorcas-clothes','lydia-purple','widow-coins','rahab-cord','widow-oil','nehemiah-builders','baruch-scroll','samaritan','mustard','paul-work','radio','ezra','hezekiah-water','jeremiah-field','stars','sparrows']);
const BOOK_SCENES=Object.freeze({
 nile:'assets/daily-book/nile-farmland.webp',
 peter:'assets/daily-book/peter-fishing.webp',
 'early-students':'assets/daily-book/early-students-1870.webp',
 gleaning:'assets/daily-book/ruth-harvest.webp',
 'naaman-girl':'assets/daily-book/naaman-servant-girl.webp',
 stars:'assets/daily-book/stars.webp',
 radio:'assets/daily-book/radio.webp',
 philip:'assets/daily-book/philip.webp',
 ruth:'assets/daily-book/ruth-harvest.webp',
 joseph:'assets/daily-book/nile-farmland.webp',
 samaritan:'assets/daily-book/samaritan.webp',
 bereans:'assets/daily-book/bereans.webp',
 mustard:'assets/daily-book/mustard.webp',
 ezra:'assets/daily-book/ezra.webp',
 'paul-work':'assets/daily-book/paul-work.webp',
 tears:'family-worship-menu-art/v1/topic-30-psalms.webp',
 well:'assets/daily-book/samaritan-at-well.webp',
 abigail:'assets/daily-book/abigail.webp',
 'hezekiah-water':'assets/daily-book/hezekiah-water.webp',
 'jeremiah-field':'assets/daily-book/jeremiah-field.webp',
 'dorcas-clothes':'assets/daily-book/dorcas-clothes.webp',
 'lydia-purple':'assets/daily-book/lydia-purple.webp',
 'widow-coins':'assets/daily-book/widow-coins.webp',
 'rahab-cord':'assets/daily-book/rahab-cord.webp',
 'widow-oil':'assets/daily-book/widow-oil.webp',
 'nehemiah-builders':'assets/daily-book/nehemiah-builders.webp',
 'paul-storm':'assets/daily-book/paul-breaking-bread.webp',
 sparrows:'assets/daily-book/sparrows.webp',
 'baruch-scroll':'assets/daily-book/baruch-scroll.webp',
 'amos-work':'assets/daily-book/ruth-harvest.webp'
});
// Book view is now TEST's normal Daily experience. Special URLs are no longer
// required when Chrome or an external app strips their query parameters.
// ?daily_book=0 is a reversible, read-only visual comparison to the old look.
const bookEnabled=()=>Q.get('daily_book')!=='0';
const bookImage=x=>x&&bookEnabled()?BOOK_SCENES[x.id]||(x.dailyBatch===2?x.art:null):null;
const artFor=x=>bookImage(x)||x?.art||fallbackArt(x);
const $=s=>document.querySelector(s);
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeURL=url=>/^https:\/\/(?:www\.)?jw\.org\/en\//.test(url)?url:'#';
const localDay=()=>{const d=new Date();return[d.getFullYear(),('0'+(d.getMonth()+1)).slice(-2),('0'+d.getDate()).slice(-2)].join('-')};
const dayIndex=date=>{
 const [y,m,d]=date.split('-').map(Number);
 const base=Date.UTC(2026,10,10);
 return Math.floor((Date.UTC(y,m-1,d)-base)/86400000);
};
const activeForDate=day=>{
 const items=DATA();if(!items.length)return null;
 const n=dayIndex(day);
 return items[((n%items.length)+items.length)%items.length];
};
const getItem=id=>DATA().find(x=>x.id===id)||null;
function restore(){
 let raw;try{raw=JSON.parse(localStorage.getItem(KEY)||'null')}catch(_){raw=null}
 const d={v:1,saved:[],read:[],shared:[]};
 if(raw?.v!==1)return d;
 if(Array.isArray(raw.saved))d.saved=[...new Set(raw.saved.filter(x=>getItem(x)))].slice(-150);
 if(Array.isArray(raw.read))d.read=[...new Set(raw.read.filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x)))].slice(-120);
 if(Array.isArray(raw.shared))d.shared=[...new Set(raw.shared.filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x)))].slice(-120);
 return d;
}
let store=null;
const view={open:false,tab:'today',id:null,fromSaved:false,preview:false,toast:null};
function state(){if(!store)store=restore();return store}
function update(patch){
 const copy={...state(),...patch};
 try{const data=JSON.stringify(copy);localStorage.setItem(KEY,data);if(localStorage.getItem(KEY)!==data)return false;store=copy;return true}
 catch(e){console.warn('[Daily Insights TEST] Could not persist:',e);return false}
}
function current(){
 const preview=editorialQA()?Q.get('daily_preview'):null;
 if(preview&&getItem(preview))return getItem(preview);
 return activeForDate(localDay());
}
function item(){return getItem(view.id)||current()}
function isCurrentToday(){return !view.preview&&item()?.id===activeForDate(localDay())?.id}
function isSaved(){return state().saved.includes(item()?.id)}
function dateTitle(){return new Date(localDay()+'T12:00:00').toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})}
function labelRead(){return state().read.includes(localDay())?'✓ You enjoyed today’s discovery':'A fresh thought to carry with you today'};
function updateHome(){
 const c=$('#bu375-home-cta');if(!c)return;
 c.setAttribute('aria-label','Open today’s meaningful Daily Discovery');
 const strong=c.querySelector('.bu375-banner-text strong');
 if(strong)strong.textContent='Daily Discovery';
 const s=$('#bu375-home-status')||c.querySelector('.bu375-banner-text small');
 if(s){const next=labelRead();if(s.textContent!==next)s.textContent=next;}
}
function link(url,text,cls=''){
 return '<a class="'+cls+'" href="'+escapeHTML(safeURL(url))+'" target="_blank" rel="noopener noreferrer">'+escapeHTML(text)+' ↗</a>';
}
function iconButton(label,act,css='',attr=''){
 return '<button type="button" class="bu-insight-button '+css+'" data-insight-action="'+act+'" '+attr+'>'+label+'</button>';
}
function tabs(){
 return '<nav class="bu-insight-tabs" aria-label="Daily Discovery sections">'+
 [['today','✦ Today'],['share','◈ Share the Thought'],['saved','♡ Saved']].map(([id,l])=>
 '<button type="button" class="bu-insight-tab" role="tab" data-insight-tab="'+id+'" aria-selected="'+String(view.tab===id)+'">'+l+'</button>').join('')+
 '</nav>';
}
/* Only the explicitly enabled TEST editorial QA session may browse the
   future 30 chapters; an everyday visitor sees today's lesson only.
   Past lessons still remain available via their own Saved collection. */
function bookPreviewPicker(){
 if(!editorialQA()||!bookEnabled()||!bookImage(item()))return '';
 return '<nav class="bu-book-preview-picker" aria-label="TEST-only editorial discovery inspection">'+
 '<label class="bu-book-select-label"><span>TEST editor: all '+DATA().length+'</span><select data-insight-book-select aria-label="Inspect all '+DATA().length+' discoveries in TEST">'+
 DATA().map((x,i)=>'<option value="'+escapeHTML(x.id)+'"'+(x.id===item()?.id?' selected':'')+'>'+
 String(i+1).padStart(2,'0')+' · '+escapeHTML(x.title)+'</option>').join('')+
 '</select></label></nav>';
}
function cover(x,kicker,compact=false){
 const art=artFor(x);
 const attr=' data-illustration="'+escapeHTML(x.id)+'"'+(art?' style="background-image:url(&quot;'+escapeHTML(art)+'&quot;)"':'');
 // The illustrated book is artwork-first: show the full image with no star,
 // editorial banner, reconstruction badge, headline, or subtitle ON the art.
 // Put only the chapter title below, on the book's parchment.
 if(bookImage(x)){
  return '<header class="bu-insight-cover bu-book-art-only'+(art?'':' no-art')+(compact?' bu-insight-compact':'')+'"'+attr+' role="img" aria-label="Illustration for '+escapeHTML(x.title)+'"></header>'+
   '<div class="bu-book-title-band"><h2>'+escapeHTML(x.title)+'</h2>'+(x.dailyBatch===2?'<small class="bu-book-thematic-note">Thematic illustration</small>':'')+'</div>';
 }
 // Keep the original design available for the explicit TEST ?daily_book=0 fallback.
 return '<header class="bu-insight-cover'+(art?'':' no-art')+(compact?' bu-insight-compact':'')+'"'+attr+'>'+
  '<div class="bu-insight-datestamp">'+escapeHTML(kicker)+'</div>'+
  '<h2>'+escapeHTML(x.title)+'</h2>'+
  '<p>'+escapeHTML(x.subtitle)+'</p>'+
  '</header>';
}
function footerNote(){
 return '<p class="bu-insight-note">Based on the linked New World Translation or an official JW.org publication. Reflections and conversation ideas are suggestions, not Bible quotations. TEST version · original Daily Discovery quiz saves and rewards unchanged.</p>';
}
function renderToday(){
 const x=item();if(!x)return '<p>Today’s discovery is unavailable.</p>';
 const preview=(!isCurrentToday()||view.preview);
 const heading=view.fromSaved?'FROM YOUR SAVED DISCOVERIES':(view.preview?'EDITORIAL PREVIEW · '+x.category:dateTitle().toUpperCase()+' · '+x.category);
 return cover(x,heading)+
 '<div class="bu-insight-section">'+
 '<div class="bu-insight-lead"><span class="bu-insight-category">✦ A MOMENT WORTH DISCOVERING</span>'+
 link(x.url,'Read the source','bu-insight-source')+'</div>'+
 '<article class="bu-insight-story" aria-label="Today’s discovery">'+
 x.body.map(p=>'<p>'+escapeHTML(p)+'</p>').join('')+'</article>'+
 '<aside class="bu-insight-insight"><span>THE THOUGHT TO REMEMBER</span><strong>'+escapeHTML(x.takeaway)+'</strong></aside>'+
 '<section class="bu-insight-reflect" aria-label="Personal reflection"><span class="bu-insight-kicker">♡ A MOMENT TO REFLECT</span>'+
 '<p>'+escapeHTML(x.reflect)+'</p></section>'+
 '<div class="bu-insight-next">'+
 iconButton(isSaved()?'♥ Saved':'♡ Save','save','secondary','aria-label="Save or remove this discovery"')+
 iconButton('◈ Share the Thought','share')+
 '</div>'+
 (!preview&&!state().read.includes(localDay())?
  '<div class="bu-insight-next">'+iconButton('✓ Mark as Read','read','secondary')+'</div>':
  !preview?'<p class="bu-insight-note">✓ Read today. You can return to it anytime.</p>':'')+
 footerNote()+'</div>';
}
function renderShare(){
 const x=item();if(!x)return '';
 const s=x.share;
 return cover(x,'◈ SHARE THE THOUGHT · '+x.category,true)+
 '<div class="bu-insight-section bu-insight-share-page">'+
 '<div class="bu-insight-share-banner"><h3>A Thought Worth Sharing</h3>'+
 '<p>One natural idea for a friendly conversation today. Make it your own.</p></div>'+
 '<section class="bu-insight-conversation"><span class="number">WHEN IT MIGHT FIT</span>'+
 '<p>'+escapeHTML(s.moment)+'</p></section>'+
 '<section class="bu-insight-conversation question"><span class="number">YOU COULD START WITH…</span>'+
 '<p>'+escapeHTML(s.opener)+'</p>'+
 '<div class="bu-insight-extra"><b>Something interesting to mention:</b> '+escapeHTML(s.thought)+'</div></section>'+
 '<section class="bu-insight-conversation"><span class="number">ASK, THEN LISTEN</span>'+
 '<p>'+escapeHTML(s.question)+'</p></section>'+
 '<div class="bu-insight-sources"><p>'+escapeHTML(s.bridge)+' '+
 link(s.url,s.reference)+'. There is no need to continue if the person is not interested.</p></div>'+
 '<div class="bu-insight-next">'+
 iconButton('‹ Today','today','secondary')+
 iconButton('♡ Copy','copy','copy-compact','aria-label="Copy the sharing idea"')+
 '</div>'+
 footerNote()+'</div>';
}
function renderSaved(){
 const collection=state().saved.map(getItem).filter(Boolean).reverse();
 return '<section class="bu-insight-section bu-insight-archive">'+
 '<div class="bu-insight-category">♡ PERSONAL COLLECTION</div>'+
 '<h2>Discoveries Worth Keeping</h2><p>Save a thought whenever it speaks to you. Return here to reread or find the sharing idea.</p>'+
 (collection.length?collection.map(x=>
 '<button class="bu-insight-saved-row" type="button" data-insight-open="'+escapeHTML(x.id)+'" aria-label="Read '+escapeHTML(x.title)+'">'+
 '<span class="bu-insight-thumb"><img data-insight-image="'+escapeHTML(x.id)+'" src="'+escapeHTML(artFor(x))+'" alt="" loading="eager" decoding="async"></span>'+
 '<span><strong>'+escapeHTML(x.title)+'</strong><small>'+escapeHTML(x.category)+'</small></span></button>'
 ).join(''):'<div class="bu-insight-empty">Nothing saved yet. Open today’s thought and tap “Save” to start your collection.</div>')+
 '<div class="bu-insight-next">'+iconButton('✦ Today','current')+'</div>'+
 footerNote()+'</section>';
}
function showToast(message){
 const body=$('#bu375-body');if(!body)return;
 body.querySelector('.bu-insight-toast')?.remove();
 const p=document.createElement('div');p.className='bu-insight-toast';p.setAttribute('role','status');p.textContent=message;
 body.querySelector('.bu-insight-wrap')?.append(p);
 setTimeout(()=>p.remove(),2200);
}
/* Keep archive artwork visible even if a remote host or an older file fails.
   Fallbacks are decorative, not depictions of a particular Bible event. */
const INSIGHT_ART_FALLBACKS=[
 'journey-art/01_the_beginning.webp','journey-art/02_faith_promises.webp',
 'journey-art/04_judges_kings.webp','journey-art/05_exile_return.webp',
 'journey-art/06_the_messiah.webp','journey-art/07_good_news_spreads.webp',
 'journey-art/08_revelation.webp'
];
function fallbackArt(x){
 let n=0;for(const ch of String(x?.id||'daily'))n=(Math.imul(n,31)+ch.charCodeAt(0))>>>0;
 return INSIGHT_ART_FALLBACKS[n%INSIGHT_ART_FALLBACKS.length];
}
function hydrateIllustrations(){
 const body=$('#bu375-body');if(!body)return;
 body.querySelectorAll('img[data-insight-image]').forEach(img=>{
  img.addEventListener('error',()=>{
   const alternate=fallbackArt(getItem(img.dataset.insightImage));
   if(img.getAttribute('src')!==alternate){img.src=alternate;}
   else{img.style.display='none';}
  });
 });
 const header=body.querySelector('.bu-insight-cover');
 const x=item(),art=artFor(x);
 if(header&&art){
  const probe=new Image();
  probe.onerror=()=>{if(header.isConnected)header.style.backgroundImage='url("'+fallbackArt(x)+'")';};
  probe.src=art;
 }
}
function display(preserveScroll=false){
 if(!view.open)return;
 const root=$('#bu375-daily'),body=$('#bu375-body');
 if(!root||!body)return;
 root.classList.add('bu-insight-active');body.classList.add('bu-insight-reading');
 const illustrated=!!bookImage(item());
 root.classList.toggle('bu-daily-book-preview',illustrated);
 body.classList.toggle('bu-daily-book-preview',illustrated);
 const previousScroll=preserveScroll?body.scrollTop:0;
 body.innerHTML='<div class="bu-insight-wrap">'+tabs()+bookPreviewPicker()+
 (view.tab==='today'?renderToday():view.tab==='share'?renderShare():renderSaved())+'</div>';
 body.scrollTop=previousScroll;
 hydrateIllustrations();
}
function open(){
 const root=$('#bu375-daily'),body=$('#bu375-body');
 if(!root||!body||!DATA().length)return false;
 try{
  if(typeof startAudio==='function')startAudio();
  if(typeof bu375Open==='function')bu375Open();
  else {
   if(typeof hideAll==='function')hideAll();
   root.hidden=false;
  }
 }catch(e){console.warn('[Daily Insights TEST] Native open failed',e);return false;}
 const x=current();if(!x)return false;
 view.id=x.id;view.tab='today';view.fromSaved=false;view.preview=!!(editorialQA()&&Q.get('daily_preview'));
 view.open=true;
 display();
 return true;
}
function close(){
 view.open=false;
 $('#bu375-daily')?.classList.remove('bu-insight-active','bu-daily-book-preview');
 $('#bu375-body')?.classList.remove('bu-insight-reading','bu-daily-book-preview');
 updateHome();
}
function read(){
 if(!isCurrentToday()){showToast('This is an earlier discovery or preview. Your daily record is unchanged.');return;}
 if(!state().read.includes(localDay())){
  if(!update({read:[...state().read,localDay()].slice(-120)})){showToast('Could not save. Please check browser storage.');return}
 }
 display(true);updateHome();showToast('✓ Marked as read');
}
function save(){
 const id=item()?.id;
 if(!id)return;
 const set=new Set(state().saved);
 if(set.has(id))set.delete(id);else set.add(id);
 if(!update({saved:[...set].slice(-150)})){showToast('Could not save this discovery.');return;}
 display(true);showToast(isSaved()?'♡ Saved':'Removed from Saved');
}
/* Daily Discovery tabs AND official JW.org source links use the approved
 * positive chime. The native global UI listeners can play a loud menu knock
 * on pointer/click bubbling. Stop those events at window capture, but never
 * cancel a scripture link's browser default (opens JW.org in a new tab). */
function tabChime(){
 try{
  if(typeof sfxOn!=='undefined'&&!sfxOn)return;
  if(typeof sfxVolume!=='undefined'&&Number(sfxVolume)<=0)return;
  if(window.BUPremiumSFX?.play){
   window.BUPremiumSFX.play('namePositive');
   return;
  }
  if(typeof playChime==='function')playChime();
 }catch(_){}
}
const TAB_PRESS_EVENTS=['pointerdown','pointerup','touchstart','touchend','mousedown','mouseup'];
function dailySourceLink(target){
 if(!view.open)return null;
 const a=target?.closest?.('#bu375-body.bu-insight-reading a[href]');
 if(!a)return null;
 // Never interfere with navigation outside our active Daily screen.
 return a.protocol==='https:'&&/^(?:www\.)?jw\.org$/i.test(a.hostname)?a:null;
}
function dailyControl(target){
 if(!view.open)return null;
 return target?.closest?.('#bu375-body.bu-insight-reading [data-insight-action],#bu375-body.bu-insight-reading [data-insight-open],#bu375-body.bu-insight-reading [data-insight-preview]')||null;
}
function bookSelectControl(target){
 if(!view.open||!bookEnabled())return null;
 return target?.closest?.('#bu375-body.bu-insight-reading [data-insight-book-select]')||null;
}
function silenceNativeDailyPress(e){
 if(!view.open||(!e.target?.closest?.('[data-insight-tab]')&&!dailySourceLink(e.target)&&!dailyControl(e.target)&&!bookSelectControl(e.target)))return;
 // Preserve default Android tap/click and native anchor navigation.
 // Stop older game-wide menu knock handlers on document and descendants.
 e.stopImmediatePropagation();
 e.stopPropagation();
}
function captureSourceClick(e){
 const a=dailySourceLink(e.target);
 if(!a)return;
 // Intentionally no preventDefault: allow target=_blank, middle/modified clicks,
 // browser back, accessibility activation and legitimate source reading.
 e.stopImmediatePropagation();
 e.stopPropagation();
 if(e.button===0&&!e.ctrlKey&&!e.metaKey&&!e.altKey)tabChime();
}
function captureTabClick(e){
 if(!view.open)return;
 const tab=e.target?.closest?.('[data-insight-tab]');
 if(!tab)return;
 e.preventDefault();e.stopImmediatePropagation();e.stopPropagation();
 const next=tab.dataset.insightTab;
 // The TEST gallery may display a past lesson. The top Today tab always
 // returns to the real scheduled thought; Share/Saved continue as normal.
 if(next==='today'&&view.preview){
  tabChime();
  Q.delete('daily_preview');
  try{history.replaceState(history.state,'',location.pathname+
   (Q.toString()?'?'+Q.toString():'')+location.hash)}catch(_){}
  view.id=activeForDate(localDay())?.id||null;
  view.preview=false;view.fromSaved=false;view.tab='today';
  display();return;
 }
 if(next===view.tab)return;
 tabChime();
 switchTab(next);
}
function switchTab(tab){
 if(!['today','share','saved'].includes(tab))return;
 view.tab=tab;display();
 if(tab==='share'&&!view.preview&&isCurrentToday()&&!state().shared.includes(localDay()))
  update({shared:[...state().shared,localDay()].slice(-120)});
}
async function copy(){
 const x=item();if(!x)return;
 const value=x.share.opener+'\n\n'+x.share.thought+'\n\n'+x.share.question+'\n\n'+x.share.reference+' — '+x.share.url;
 try{
  if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');
  await navigator.clipboard.writeText(value);
  showToast('Opening idea copied — make it your own!');
 }catch(_){showToast('Copy unavailable here. Long-press the text to copy it.');}
}
function chooseBookChapter(id){
 if(!editorialQA()||!bookEnabled()||!bookImage(getItem(id))||!getItem(id))return false;
 if(view.id===id&&view.tab==='today')return true;
 tabChime();
 Q.set('daily_preview',id);
 try{history.replaceState(history.state,'',location.pathname+'?'+Q.toString()+location.hash)}catch(_){}
 view.id=id;view.tab='today';view.fromSaved=false;view.preview=true;
 display();
 return true;
}
function silenceBookSelectClick(e){
 if(!bookSelectControl(e.target))return;
 // Never preventDefault here: Android's native select picker must still open.
 // Only stop legacy document-level knock handlers for its activation.
 e.stopImmediatePropagation();e.stopPropagation();
}
function changeBookSelector(e){
 const select=e.target?.closest?.('[data-insight-book-select]');
 if(!select||!view.open||!bookEnabled()||!editorialQA())return;
 e.stopImmediatePropagation();e.stopPropagation();
 chooseBookChapter(select.value);
}
function captureDailyControlClick(e){
 const el=dailyControl(e.target);
 if(!el)return;
 e.preventDefault();e.stopImmediatePropagation();e.stopPropagation();
 const saved=el.closest('[data-insight-open]');
 const preview=el.closest('[data-insight-preview]');
 if(preview){chooseBookChapter(preview.dataset.insightPreview);return;}
 tabChime();
 if(saved){
  view.id=saved.dataset.insightOpen;
  view.fromSaved=true;
  view.preview=false;
  switchTab('today');
  return;
 }
 switch(el.dataset.insightAction){
 case 'save':save();break;
 case 'today':switchTab('today');break;
 case 'share':switchTab('share');break;
 case 'read':read();break;
 case 'copy':copy();break;
 case 'current':view.id=current().id;view.fromSaved=false;view.preview=!!(editorialQA()&&Q.get('daily_preview'));switchTab('today');break;
 }
}
function click(e){
 const home=e.target.closest?.('#bu375-home-cta');
 if(home){
  // Stop original five-question session from starting. We still invoke the
  // native screen-opening function for standard music, navigation and back.
  e.preventDefault();e.stopImmediatePropagation();e.stopPropagation();
  open();return;
 }
 if(!view.open)return;
 if(e.target.closest?.('#bu375-back')){
  // Legacy Back reopens its old five-question chooser. Bypass that old
  // handler and return directly to the native home instead.
  e.preventDefault();e.stopImmediatePropagation();e.stopPropagation();
  close();if(typeof focusHome==='function')focusHome();return;
 }
 const tab=e.target.closest?.('[data-insight-tab]');
 if(tab){captureTabClick(e);return}

}
function boot(){
 const b=$('#bu375-home-cta'),d=$('#bu375-daily');
 if(!b||!d||!DATA().length)return false;
 state();
 // Window capture prevents the legacy knock from reaching native handlers
 // on button, container or document, on both mouse and real Android touch.
 TAB_PRESS_EVENTS.forEach(type=>window.addEventListener(type,silenceNativeDailyPress,true));
 window.addEventListener('click',captureSourceClick,true);
 window.addEventListener('click',captureTabClick,true);
 window.addEventListener('click',captureDailyControlClick,true);
 window.addEventListener('click',silenceBookSelectClick,true);
 window.addEventListener('change',changeBookSelector,true);
 document.addEventListener('click',click,true);
 const back=$('#bu375-back');
 if(back)back.addEventListener('click',close,false);
 const status=$('#bu375-home-status');
 if(status)new MutationObserver(updateHome).observe(status,{childList:true,characterData:true,subtree:true});
 updateHome();
 if(Q.get('daily_insight')==='1')setTimeout(open,100);
 window.addEventListener('pageshow',updateHome);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateHome()});
 return true;
}
function start(){
 if(boot())return;
 let count=0;
 const timer=setInterval(()=>{if(boot()||++count>80)clearInterval(timer)},250);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
window.BUDailyInsightV1=Object.freeze({
 version:'1.2.2-test-book-art-4',source:'NWT/JW.org editorial pilot',storageKey:KEY,open,
 current:()=>current()?.id,libraryCount:()=>DATA().length,
 inspect:()=>({tab:view.tab,id:view.id,open:view.open,today:localDay(),
 saved:[...state().saved],read:[...state().read],shared:[...state().shared]})
});
})();

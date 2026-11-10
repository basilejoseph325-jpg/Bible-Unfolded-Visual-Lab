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
 * Pilot content cycles after 18 days; a sustainable editorial pipeline
 * must be added before claiming an unlimited daily library.
 */
(()=>{'use strict';
if(window.BUDailyInsightV1)return;
const KEY='bu-daily-insight-test-v1';
const Q=new URLSearchParams(location.search);
const DATA=()=>window.BUDailyDiscoveryLibrary||[];
const $=s=>document.querySelector(s);
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;':'&quot;',"'":'&#39;'}[c]));
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
 const preview=Q.get('daily_preview');
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
function cover(x,kicker){
 return '<header class="bu-insight-cover" style="background-image:url(&quot;'+escapeHTML(x.art)+'&quot;)">'+
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
 iconButton(isSaved()?'♥ Saved to My Discoveries':'♡ Save this Discovery','save','secondary')+
 iconButton('◈ See Today’s Sharing Idea ›','share')+
 '</div>'+
 (!preview&&!state().read.includes(localDay())?
  '<div class="bu-insight-next">'+iconButton('✓ Mark today’s discovery as read','read','secondary')+'</div>':
  !preview?'<p class="bu-insight-note">✓ Today’s discovery enjoyed. You can return to it whenever you like.</p>':'')+
 footerNote()+'</div>';
}
function renderShare(){
 const x=item();if(!x)return '';
 const s=x.share;
 const saved=!isCurrentToday()||view.preview;
 return cover(x,'◈ SHARE THE THOUGHT · '+x.category)+
 '<div class="bu-insight-section">'+
 '<div class="bu-insight-share-banner"><h3>A Thought Worth Sharing</h3>'+
 '<p>One natural way to bring today’s discovery into a friendly conversation. Use your own words; listen and follow the person’s interests.</p></div>'+
 '<section class="bu-insight-conversation"><span class="number">01 · WHEN IT MIGHT FIT</span><h3>A Natural Moment</h3>'+
 '<p>'+escapeHTML(s.moment)+'</p></section>'+
 '<section class="bu-insight-conversation question"><span class="number">02 · AN EASY OPENING</span><h3>You Could Start With…</h3>'+
 '<p>'+escapeHTML(s.opener)+'</p></section>'+
 '<section class="bu-insight-conversation"><span class="number">03 · SOMETHING INTERESTING</span><h3>The Thought</h3>'+
 '<p>'+escapeHTML(s.thought)+'</p></section>'+
 '<section class="bu-insight-conversation question"><span class="number">04 · INVITE THEIR THOUGHTS</span><h3>Ask, Then Listen</h3>'+
 '<p>'+escapeHTML(s.question)+'</p></section>'+
 '<section class="bu-insight-conversation"><span class="number">05 · ONLY IF THEY ARE INTERESTED</span><h3>A Simple Way to Continue</h3>'+
 '<p>'+escapeHTML(s.bridge)+'</p></section>'+
 '<div class="bu-insight-sources"><p>Read together, if welcomed: '+
 link(s.url,s.reference)+' · <strong>Not a script.</strong> Keep things friendly and respect when someone does not want to continue.</p></div>'+
 '<div class="bu-insight-next">'+
 iconButton('‹ Back to the Discovery','today','secondary')+
 iconButton('✦ Copy the Opening Idea','copy')+
 '</div>'+
 (!saved?'<div class="bu-insight-next">'+iconButton('✓ Remember today’s thought','read','secondary')+'</div>':'')+
 footerNote()+'</div>';
}
function renderSaved(){
 const collection=state().saved.map(getItem).filter(Boolean).reverse();
 return '<section class="bu-insight-section bu-insight-archive">'+
 '<div class="bu-insight-category">♡ PERSONAL COLLECTION</div>'+
 '<h2>Discoveries Worth Keeping</h2><p>Save a thought whenever it speaks to you. Return here to reread or find the sharing idea.</p>'+
 (collection.length?collection.map(x=>
 '<button class="bu-insight-saved-row" type="button" data-insight-open="'+escapeHTML(x.id)+'" aria-label="Read '+escapeHTML(x.title)+'">'+
 '<span class="bu-insight-thumb" style="background-image:url(&quot;'+escapeHTML(x.art)+'&quot;)"></span>'+
 '<span><strong>'+escapeHTML(x.title)+'</strong><small>'+escapeHTML(x.category)+'</small></span></button>'
 ).join(''):'<div class="bu-insight-empty">Nothing saved yet. Open today’s thought and tap “Save this Discovery” to start your collection.</div>')+
 '<div class="bu-insight-next">'+iconButton('✦ Open Today’s Discovery','current')+'</div>'+
 footerNote()+'</section>';
}
function showToast(message){
 const body=$('#bu375-body');if(!body)return;
 body.querySelector('.bu-insight-toast')?.remove();
 const p=document.createElement('div');p.className='bu-insight-toast';p.setAttribute('role','status');p.textContent=message;
 body.querySelector('.bu-insight-wrap')?.append(p);
 setTimeout(()=>p.remove(),2200);
}
function display(){
 if(!view.open)return;
 const root=$('#bu375-daily'),body=$('#bu375-body');
 if(!root||!body)return;
 root.classList.add('bu-insight-active');body.classList.add('bu-insight-reading');
 body.innerHTML='<div class="bu-insight-wrap">'+tabs()+
 (view.tab==='today'?renderToday():view.tab==='share'?renderShare():renderSaved())+'</div>';
 body.scrollTop=0;
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
 view.id=x.id;view.tab='today';view.fromSaved=false;view.preview=!!Q.get('daily_preview');
 view.open=true;
 display();
 return true;
}
function close(){
 view.open=false;
 $('#bu375-daily')?.classList.remove('bu-insight-active');
 $('#bu375-body')?.classList.remove('bu-insight-reading');
 updateHome();
}
function read(){
 if(!isCurrentToday()){showToast('This is an earlier discovery or preview. Your daily record is unchanged.');return;}
 if(!state().read.includes(localDay())){
  if(!update({read:[...state().read,localDay()].slice(-120)})){showToast('Could not save. Please check browser storage.');return}
 }
 display();updateHome();showToast('✓ A thought to carry with you today');
}
function save(){
 const id=item()?.id;
 if(!id)return;
 const set=new Set(state().saved);
 if(set.has(id))set.delete(id);else set.add(id);
 if(!update({saved:[...set].slice(-150)})){showToast('Could not save this discovery.');return;}
 display();showToast(isSaved()?'♡ Added to saved discoveries':'Removed from saved discoveries');
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
function click(e){
 const home=e.target.closest?.('#bu375-home-cta');
 if(home){
  // Stop original five-question session from starting. We still invoke the
  // native screen-opening function for standard music, navigation and back.
  e.preventDefault();e.stopImmediatePropagation();e.stopPropagation();
  open();return;
 }
 if(!view.open)return;
 if(e.target.closest?.('#bu375-back')){close();return;}
 const tab=e.target.closest?.('[data-insight-tab]');
 if(tab){e.preventDefault();switchTab(tab.dataset.insightTab);return}
 const saved=e.target.closest?.('[data-insight-open]');
 if(saved){view.id=saved.dataset.insightOpen;view.fromSaved=true;view.preview=false;switchTab('today');return}
 const b=e.target.closest?.('[data-insight-action]');
 if(!b)return;
 e.preventDefault();
 switch(b.dataset.insightAction){
 case 'save':save();break;
 case 'today':switchTab('today');break;
 case 'share':switchTab('share');break;
 case 'read':read();break;
 case 'copy':copy();break;
 case 'current':view.id=current().id;view.fromSaved=false;view.preview=!!Q.get('daily_preview');switchTab('today');break;
 }
}
function boot(){
 const b=$('#bu375-home-cta'),d=$('#bu375-daily');
 if(!b||!d||!DATA().length)return false;
 state();
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
 version:'1.0.0-test',source:'NWT/JW.org editorial pilot',storageKey:KEY,open,
 current:()=>current()?.id,libraryCount:()=>DATA().length,
 inspect:()=>({tab:view.tab,id:view.id,open:view.open,today:localDay(),
 saved:[...state().saved],read:[...state().read],shared:[...state().shared]})
});
})();

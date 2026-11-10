/* Bible Unfolded — Daily Discovery Hall / Treasury, Visual Lab v1.
 * EXPERIMENT ONLY: does not debit, rewrite or grant canonical Insight Tokens,
 * Points, daily check-in streak, Trail Coins, game progress or LIVE purchases.
 * Purchases and activity rewards use ONLY bu-daily-hall-v1-test-only.
 * Main game's native Rewards / daily checkbox remain operational unchanged.
 */
(()=>{'use strict';
if(window.BUDailyHall || location.pathname.includes('/experiments/'))return;
const KEY='bu-daily-hall-v1-test-only';
const HOME='home';
const STAGE='bu-engage-stage';
const WALLET='bible-unfolded-rewards-v17';
const TRAILS='bible-unfolded-word-trails-next-v1';
const CATALOG=Object.freeze([
 {id:'dawn',kind:'scene',name:'Golden Dawn',detail:'The original warm welcome.',cost:0,icon:'☀',art:'journey-art/02_faith_promises.webp'},
 {id:'library',kind:'scene',name:'Ancient Library',detail:'A rich candlelit study atmosphere.',cost:260,icon:'✦',art:'bible-book-art/19_psalms.webp'},
 {id:'promises',kind:'scene',name:'City of Promise',detail:'A luminous blue-and-gold horizon.',cost:390,icon:'✧',art:'journey-art/08_revelation.webp'},
 {id:'deliverance',kind:'scene',name:'Desert Journey',detail:'Cinematic sands and copper light.',cost:520,icon:'❖',art:'journey-art/03_deliverance.webp'},
 {id:'bronze',kind:'seal',name:'Bronze Scholar',detail:'Display an engraved collector seal.',cost:90,icon:'◆',art:'bible-book-art/27_daniel.webp'},
 {id:'scribe',kind:'seal',name:'Scribe’s Laurel',detail:'An elegant gold-leaf profile crest.',cost:170,icon:'❦',art:'bible-book-art/20_proverbs.webp'},
 {id:'compass',kind:'seal',name:'Explorer’s Compass',detail:'A rare treasury emblem to show off.',cost:330,icon:'✥',art:'journey-art/07_good_news_spreads.webp'},
 {id:'silver',kind:'seal',name:'Moonlight Seal',detail:'A cool silver-blue collector badge.',cost:220,icon:'✺',art:'bible-book-art/19_psalms.webp'},
 {id:'royal',kind:'seal',name:'Royal Treasury',detail:'An ambitious, long-range collection goal.',cost:720,icon:'♛',art:'journey-art/04_judges_kings.webp'}
]);
const IDS=new Set(CATALOG.map(x=>x.id));
const MODE=[
 {id:'home-cross',title:'Word Trails',desc:'Uncover something new in the crossword adventure.',icon:'✧'},
 {id:'home-story',title:'Story Adventure',desc:'Explore the next chapter of the Bible story.',icon:'✦'}
];
const pad=n=>String(n).padStart(2,'0');
const stamp=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const today=()=>stamp(new Date());
const monday=()=>{const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-(d.getDay()+6)%7);return d};
const week=()=>{const m=monday();return Array.from({length:7},(_,i)=>{const d=new Date(m);d.setDate(m.getDate()+i);return stamp(d)})};
const weekday=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const safeJson=raw=>{try{return JSON.parse(raw||'null')}catch(_){return null}};
const canonical=()=>{
 const w=safeJson(localStorage.getItem(WALLET));
 const t=safeJson(localStorage.getItem(TRAILS));
 return {points:Number.isFinite(w?.points)?w.points:0,
   coins:Number.isFinite(w?.coins)?w.coins:0,
   levels:Array.isArray(t?.completed)?new Set(t.completed).size:0};
};
function defaultState(){
 let ref={points:0,coins:0,levels:0};
 try{ref=canonical()}catch(_){}
 return {version:1,credits:Math.max(420,Math.min(5000,Math.floor(ref.coins||0))),
   owned:['dawn'],scene:'dawn',badge:null,goal:'library',awards:[],
   activity:{},evidence:ref,updated:today()};
}
function normalized(raw){
 const a=raw&&typeof raw==='object'&&raw.version===1?raw:defaultState();
 const b=defaultState();
 b.credits=Number.isSafeInteger(a.credits)&&a.credits>=0&&a.credits<1e8?a.credits:b.credits;
 b.owned=[...new Set(['dawn',...(Array.isArray(a.owned)?a.owned:[]).filter(x=>IDS.has(x))])];
 b.scene=b.owned.includes(a.scene)&&CATALOG.some(x=>x.id===a.scene&&x.kind==='scene')?a.scene:'dawn';
 b.badge=b.owned.includes(a.badge)&&CATALOG.some(x=>x.id===a.badge&&x.kind==='seal')?a.badge:null;
 b.goal=IDS.has(a.goal)?a.goal:'library';
 b.awards=Array.isArray(a.awards)?[...new Set(a.awards.filter(x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}:(3|5|7)$/.test(x)))].slice(-250):[];
 b.activity=a.activity&&typeof a.activity==='object'&&!Array.isArray(a.activity)?a.activity:{};
 b.evidence=a.evidence&&typeof a.evidence==='object'?a.evidence:b.evidence;
 b.updated=typeof a.updated==='string'?a.updated:today();
 return b;
}
let state;
try{state=normalized(safeJson(localStorage.getItem(KEY)))}catch(_){state=defaultState()}
let currentTab='today',open=false,toastTimer=null;
function save(next){
 const serial=JSON.stringify(next);
 try{localStorage.setItem(KEY,serial);if(localStorage.getItem(KEY)!==serial)return false;state=next;return true}
 catch(_){return false}
}
const item=id=>CATALOG.find(x=>x.id===id);
const owned=id=>state.owned.includes(id);
const fmt=n=>Math.max(0,Math.floor(n||0)).toLocaleString('en-US');
const displayBadge=()=>item(state.badge)?.icon||'✦';
const escape=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function assessProgress(){
 let now;try{now=canonical()}catch(_){return}
 const old=state.evidence||now;
 const pointsGain=Number(now.points)>Number(old.points||0);
 const coinsGain=Number(now.coins)>Number(old.coins||0);
 const levelGain=Number(now.levels)>Number(old.levels||0);
 const d=today(),fresh=pointsGain||coinsGain||levelGain;
 const next={...state,evidence:now,activity:{...state.activity},awards:[...state.awards]};
 if(fresh&&!next.activity[d]){
  // Each day rewards at most once; this is a preview-only expedition reward.
  next.activity[d]=true;
  next.credits+=40;
 }
 // Weekly awards are earned by actual activity on 3, 5 and 7 distinct days.
 // Earning more than one tier at a time is still idempotent for each week.
 const dates=week(),active=dates.filter(x=>next.activity[x]).length;
 for(const [tier,bonus] of [[3,100],[5,150],[7,200]]){
  const id=dates[0]+':'+tier;
  if(active>=tier&&!next.awards.includes(id)){
   next.awards.push(id);next.credits+=bonus;
  }
 }
 // Test spending remains independent of the real wallet, forever.
 if(fresh||JSON.stringify(old)!==JSON.stringify(now)||next.awards.length!==state.awards.length)save(next);
}
function percent(){const g=item(state.goal);return g?Math.min(100,Math.round(100*state.credits/Math.max(1,g.cost))):100}
function updateEntry(){
 const e=document.getElementById('bu-engage-launch');
 if(!e)return;
 e.querySelector('.bu-engage-glyph').textContent=displayBadge();
 const name=item(state.goal)?.name||'your next treasure';
 const subtitle=e.querySelector('.bu-engage-launch-copy');
 subtitle.textContent='Daily expedition · '+fmt(state.credits)+' test credits · Goal: '+name;
}
function insert(){
 const home=document.getElementById(HOME),story=home?.querySelector('#home-story');
 // The old #home-shop button is inside .cinematic-bottom-nav (display:none).
 // Insert into the VISIBLE game-card stack instead, before Story Adventure.
 if(!home||!story||!story.closest('.cinematic-cards')||document.getElementById('bu-engage-launch'))return false;
 const b=document.createElement('button');
 b.id='bu-engage-launch';b.type='button';
 b.setAttribute('aria-label','Open the Daily Discovery Hall and Treasury');
 b.innerHTML='<span class="bu-engage-glyph" aria-hidden="true">✦</span>'+
  '<span class="bu-engage-launch-body">'+
  '<span class="bu-engage-launch-kicker">A new daily destination · TEST</span>'+
  '<span class="bu-engage-launch-title">The Discovery Hall</span>'+
  '<span class="bu-engage-launch-copy">Expeditions · Treasury · Collectibles</span>'+
  '</span><span class="bu-engage-arrow" aria-hidden="true">›</span>';
 story.insertAdjacentElement('beforebegin',b);
 b.addEventListener('click',()=>show('today'));
 updateEntry();
 return true;
}
function button(label,action,id,other){
 return '<button type="button" class="bu-button'+(other?' secondary':'')+'" data-action="'+action+'"'+
  (id?' data-id="'+escape(id)+'"':'')+'>'+escape(label)+'</button>';
}
function todayHTML(){
 const days=week(),n=days.filter(d=>state.activity[d]===true).length;
 const done=state.activity[today()]===true;
 const choice=MODE[Math.floor(new Date().getTime()/86400000)%MODE.length];
 const next=item(state.goal),bought=owned(state.goal);
 const gap=bought?0:Math.max(0,next.cost-state.credits);
 return '<div class="bu-grid">'+
  '<section class="bu-panel"><span class="bu-meta">The daily expedition</span>'+
  '<h3>'+(done?'Today’s seal is yours':'A new discovery awaits')+'</h3>'+
  '<p>'+(done?'Your activity was recorded. Explore freely, or discover another mode.':
  'Earn a new game reward, increase your Points, or complete a new Word Trails level to light today’s expedition seal.')+'</p>'+
  '<div class="bu-mini-row"><span class="bu-label">This week · '+n+' of 7 seals</span><span class="bu-reward">+40 preview credits per active day</span></div>'+
  '<div class="bu-seals">'+days.map((d,i)=>'<span title="'+weekday[i]+'" class="bu-seal'+(state.activity[d]?' done':'')+(d===today()?' today':'')+'">'+(state.activity[d]?'✓':(i+1))+'</span>').join('')+'</div>'+
  '<p class="bu-muted">Weekly milestones: 3 days earns the Explorer Crest, 5 the Scholar Laurel, and 7 the Golden Chronicle. Each includes bonus test credits.</p>'+ 
  '<p class="bu-muted">Your original daily checkmark and streak remain unchanged. This expedition measures new play progress instead.</p>'+ 
  button('Check for new progress','check')+'</section>'+
  '<section class="bu-panel"><span class="bu-meta">Today’s featured journey</span><h3>'+escape(choice.title)+'</h3>'+
  '<p>'+escape(choice.desc)+'</p><p>Any Bible Unfolded mode can count toward the expedition, so you always have a choice.</p>'+
  button('Explore '+choice.title,'launch',choice.id)+
  '<p class="bu-muted">Finish a new challenge and return here to see your seal illuminate.</p></section>'+
  '<section class="bu-panel"><span class="bu-meta">Treasury savings goal</span>'+
  '<h3>'+escape(next.name)+'</h3><p>Watch your collection grow toward something you really want.</p>'+
  '<div class="bu-mini-row"><span class="bu-label">'+fmt(state.credits)+' / '+fmt(next.cost)+' credits</span>'+
  '<span class="bu-reward">'+(bought?'Owned':gap===0?'Ready to collect':fmt(gap)+' to go')+'</span></div>'+
  '<div class="bu-progress"><span style="width:'+percent()+'%"></span></div>'+
  '<p class="bu-muted">Choose a different savings goal any time.</p>'+button('Browse the Treasury','tab','treasury')+'</section>'+
  '<section class="bu-panel"><span class="bu-meta">A lasting collection</span><h3>Your own Discovery Gallery</h3>'+
  '<p>Unlock dramatic environments and collector seals. Display what you earn and personalize your Hall.</p>'+
  '<div class="bu-mini-row"><span class="bu-label">'+state.owned.length+' / '+CATALOG.length+' treasury pieces unlocked</span>'+
  '<span class="bu-reward">'+escape(displayBadge())+'</span></div>'+
  '<div class="bu-progress"><span style="width:'+(100*state.owned.length/CATALOG.length)+'%"></span></div>'+
  '<p class="bu-muted">An evolving collection, not another pile of points.</p>'+
  button('Visit My Gallery','tab','gallery')+'</section></div>';
}
function storeItem(x){
 const have=owned(x.id),equipped=(x.kind==='scene'?state.scene:state.badge)===x.id;
 const need=Math.max(0,x.cost-state.credits);
 const action=have?(equipped?'Equipped':'Display'):need?'Save for this':'Unlock · '+fmt(x.cost)+' credits';
 const act=have?'equip':need?'goal':'buy';
 const goal=state.goal===x.id;
 return '<article class="bu-item"><div class="bu-item-art" style="background-image:linear-gradient(#09182036,#0b222d59),url(&quot;'+escape(x.art)+'&quot;)">'+
  '<span class="bu-item-icon" aria-hidden="true">'+escape(x.icon)+'</span></div>'+
  '<div class="bu-item-details"><span class="bu-meta">'+(x.kind==='scene'?'Environment':'Collector seal')+'</span>'+
  '<h3>'+escape(x.name)+'</h3><p>'+escape(x.detail)+'</p>'+
  '<div class="bu-mini-row"><span class="bu-label">'+(have?'In your collection':fmt(x.cost)+' credits')+'</span>'+
  (goal?'<span class="bu-label">✦ SAVINGS GOAL</span>':'')+'</div>'+
  (equipped?'<button class="bu-button secondary" type="button" disabled>Currently displayed</button>':button(action,act,x.id,have||!!need))+
  '</div></article>';
}
function treasuryHTML(){
 return '<div class="bu-panel" style="margin-bottom:12px">'+
  '<div class="bu-mini-row"><div><span class="bu-meta">A treasury worth returning for</span>'+
  '<h3 style="margin-bottom:2px">Make every discovery count</h3></div>'+
  '<div style="text-align:right"><span class="bu-label">AVAILABLE TEST CREDITS</span>'+
  '<div class="bu-reward" style="font:700 24px Georgia,serif">'+fmt(state.credits)+' ✦</div></div></div>'+
  '<p>Choose scenes and collector seals to personalize your Hall. Every item below can be unlocked and displayed in this test experience.</p>'+
  '<p class="bu-muted">Preview purchases are intentionally isolated from your real Insight Tokens and LIVE wallet.</p></div>'+
  '<div class="bu-store">'+CATALOG.map(storeItem).join('')+'</div>';
}
function galleryHTML(){
 const ownedItems=CATALOG.filter(x=>owned(x.id));
 const weekly=[{tier:3,name:'Explorer Crest',icon:'✧'},{tier:5,name:'Scholar Laurel',icon:'❦'},{tier:7,name:'Golden Chronicle',icon:'✥'}];
 const trophies=weekly.filter(x=>state.awards.some(a=>a.endsWith(':'+x.tier)));
 return '<div class="bu-panel"><span class="bu-meta">My Discovery Gallery</span>'+ 
  '<h3>A collection that grows with you</h3>'+
  '<p>'+ownedItems.length+' of '+CATALOG.length+' treasury pieces collected · '+trophies.length+' expedition trophies earned. Choose what to display.</p>'+ 
  '<div class="bu-progress"><span style="width:'+(100*ownedItems.length/CATALOG.length)+'%"></span></div>'+
  '<div class="bu-gallery">'+ownedItems.map(x=>'<article class="bu-gallery-piece">'+
  '<div class="seal" aria-hidden="true">'+escape(x.icon)+'</div>'+
  '<strong>'+escape(x.name)+'</strong>'+
  '<div style="margin-top:9px">'+((x.kind==='scene'?state.scene:state.badge)===x.id?
  '<span class="bu-label">On display</span>':button('Display','equip',x.id,true))+'</div></article>').join('')+
  '</div>'+(trophies.length?'<h3 style="margin-top:20px">Expedition trophies</h3><div class="bu-gallery">'+trophies.map(x=>'<article class="bu-gallery-piece"><div class="seal">'+x.icon+'</div><strong>'+x.name+'</strong><span class="bu-label">EARNED · WEEKLY MILESTONE</span></article>').join('')+'</div>':'')+'</div><div class="bu-panel" style="margin-top:12px"><span class="bu-meta">Next discovery</span>'+ 
  '<h3>There’s always something to work toward</h3>'+
  '<p>Set a savings goal in the Treasury. Finish daily discoveries and return to unlock your next visual treasure.</p>'+
  button('Visit Treasury','tab','treasury')+'</div>';
}
function draw(){
 const modal=document.getElementById('bu-engage-hall');if(!modal)return;
 modal.dataset.scene=state.scene;
 modal.querySelector('.bu-balance strong').textContent=fmt(state.credits)+' ✦';
 for(const b of modal.querySelectorAll('.bu-tab'))b.setAttribute('aria-selected',String(b.dataset.id===currentTab));
 modal.querySelector('.bu-hall-body').innerHTML=currentTab==='treasury'?treasuryHTML():currentTab==='gallery'?galleryHTML():todayHTML();
 updateEntry();
}
function notify(t){
 const host=document.getElementById(STAGE);if(!host)return;
 let n=document.getElementById('bu-engage-toast');if(!n){n=document.createElement('div');n.id='bu-engage-toast';n.setAttribute('role','status');host.appendChild(n)}
 n.textContent=t;
 if(toastTimer)clearTimeout(toastTimer);
 toastTimer=setTimeout(()=>n?.remove(),3300);
}
function show(tab){
 if(open){currentTab=tab||currentTab;draw();return}
 assessProgress();
 currentTab=tab||'today';
 const stage=document.createElement('div');stage.id=STAGE;
 stage.setAttribute('role','presentation');
 stage.innerHTML='<div id="bu-engage-hall" role="dialog" aria-modal="true" aria-labelledby="bu-engage-title">'+
  '<header class="bu-hall-hero"><div><span class="bu-eyebrow">Bible Unfolded · A new daily destination</span>'+
  '<h2 id="bu-engage-title">The Discovery Hall</h2>'+
  '<p class="bu-hero-note">Explore. Discover. Collect. Return.</p></div>'+
  '<div class="bu-balance"><strong>0 ✦</strong><small>TEST CREDITS</small></div>'+
  '<button type="button" class="bu-hall-close" aria-label="Close Discovery Hall">×</button></header>'+
  '<nav class="bu-tabs" aria-label="Discovery Hall sections">'+
  '<button type="button" class="bu-tab" data-action="tab" data-id="today">Today</button>'+
  '<button type="button" class="bu-tab" data-action="tab" data-id="treasury">Treasury</button>'+
  '<button type="button" class="bu-tab" data-action="tab" data-id="gallery">My Gallery</button></nav>'+
  '<main class="bu-hall-body"></main>'+
  '<footer class="bu-hall-foot"><span>VISUAL LAB PREVIEW · Not connected to the real wallet</span>'+
  '<span>Existing daily streak preserved</span></footer></div>';
 document.body.appendChild(stage);open=true;draw();
 stage.querySelector('.bu-hall-close').addEventListener('click',hide);
 stage.addEventListener('click',onClick);
 stage.addEventListener('click',event=>{if(event.target===stage)hide()});
 stage.querySelector('.bu-hall-close').focus();
}
function hide(){
 const stage=document.getElementById(STAGE);
 if(stage)stage.remove();open=false;
 document.getElementById('bu-engage-launch')?.focus({preventScroll:true});
}
function buy(id){
 const p=item(id);
 if(!p||owned(id))return;
 if(state.credits<p.cost){notify('Choose it as a savings goal and keep playing.');return}
 const next={...state,credits:state.credits-p.cost,owned:[...state.owned,id]};
 if(p.kind==='scene')next.scene=id;else next.badge=id;
 if(next.goal===id){
  const targets=CATALOG.filter(x=>x.cost>0&&!next.owned.includes(x.id)).sort((a,b)=>a.cost-b.cost);
  const follow=targets.find(x=>x.cost>=next.credits+120)||targets[0];
  if(follow)next.goal=follow.id;
 }
 if(!save(next)){notify('Could not securely save this purchase. Nothing was charged.');return}
 draw();notify('Unlocked: '+p.name+' · Added to your Gallery!');
}
function equip(id){
 const p=item(id);if(!p||!owned(id))return;
 const next={...state};
 if(p.kind==='scene')next.scene=id;else next.badge=id;
 if(!save(next)){notify('Could not save your selection.');return}
 draw();notify('Now displaying '+p.name);
}
function goal(id){
 if(!item(id))return;
 if(!save({...state,goal:id})){notify('Could not save this goal.');return}
 currentTab='today';draw();notify('New savings goal: '+item(id).name);
}
function onClick(event){
 const target=event.target.closest('button[data-action]');if(!target)return;
 const action=target.dataset.action,id=target.dataset.id;
 if(action==='tab'&&['today','treasury','gallery'].includes(id)){currentTab=id;draw()}
 else if(action==='buy')buy(id);
 else if(action==='equip')equip(id);
 else if(action==='goal')goal(id);
 else if(action==='check'){const before=state.activity[today()];assessProgress();draw();notify(state.activity[today()]?'Expedition seal recorded!':'No new game progress detected yet. Keep exploring.')}
 else if(action==='launch'){
  const native=document.getElementById(id);
  if(!native){notify('Open this mode from the main home screen.');return}
  hide();setTimeout(()=>native.click(),90);
 }
}
document.addEventListener('keydown',event=>{
 if(!open)return;
 if(event.key==='Escape'){event.preventDefault();hide();return}
 if(event.key==='Tab'){
  const stage=document.getElementById(STAGE),focusables=[...stage.querySelectorAll('button:not(:disabled)')];
  if(!focusables.length)return;
  const first=focusables[0],last=focusables[focusables.length-1];
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
 }
});
function start(){
 if(insert())return;
 const observer=new MutationObserver(()=>{if(insert())observer.disconnect()});
 observer.observe(document.documentElement,{subtree:true,childList:true});
 setTimeout(()=>observer.disconnect(),18000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
window.BUDailyHall=Object.freeze({version:'1.0.0-test',show:()=>show('today'),
 previewWallet:()=>({credits:state.credits,owned:[...state.owned]}),
 stateKey:KEY});
})();
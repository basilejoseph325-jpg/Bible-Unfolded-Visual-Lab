/* Bible Unfolded · TREASURE QUEST V2 — VISUAL LAB ONLY.
 * User-approved exploratory prototype; no change to native game / LIVE.
 * All purchases, free game stars, credits and trophies are entirely virtual
 * and persist ONLY in bu-treasure-quest-v2-test-only.
 * Existing Insight Tokens, Points, Trail Coins, daily checkmark, streak,
 * hints, wheel ownership and saved modes are NEVER written.
 */
(()=>{'use strict';
if(window.BUTreasureQuest||location.pathname.includes('/experiments/'))return;
const KEY='bu-treasure-quest-v2-test-only';
const OLD_KEY='bu-daily-hall-v1-test-only';
const WALLET='bible-unfolded-rewards-v17',TRAILS='bible-unfolded-word-trails-next-v1';
const IMAGES=['journey-art/01_the_beginning.webp','journey-art/02_faith_promises.webp','journey-art/03_deliverance.webp'];
const CATALOG=[
 {id:'dawn',type:'scene',name:'Golden Dawn',price:0,icon:'☀',image:'journey-art/02_faith_promises.webp',hint:'A sunlit beginning'},
 {id:'library',type:'scene',name:'Ancient Library',price:260,icon:'✦',image:'bible-book-art/19_psalms.webp',hint:'Golden parchment and lamplight'},
 {id:'promises',type:'scene',name:'City of Promise',price:390,icon:'✧',image:'journey-art/08_revelation.webp',hint:'A luminous blue horizon'},
 {id:'deliverance',type:'scene',name:'Desert Journey',price:520,icon:'❖',image:'journey-art/03_deliverance.webp',hint:'Cinematic copper and sand'},
 {id:'bronze',type:'crest',name:'Bronze Scholar',price:90,icon:'◆',image:'bible-book-art/27_daniel.webp',hint:'Your first collector crest'},
 {id:'scribe',type:'crest',name:'Scribe’s Laurel',price:170,icon:'❦',image:'bible-book-art/20_proverbs.webp',hint:'An engraved gold leaf'},
 {id:'compass',type:'crest',name:'Explorer’s Compass',price:330,icon:'✥',image:'journey-art/07_good_news_spreads.webp',hint:'For determined adventurers'},
 {id:'silver',type:'crest',name:'Moonlight Seal',price:220,icon:'✺',image:'bible-book-art/19_psalms.webp',hint:'A silver-blue collector gem'},
 {id:'royal',type:'crest',name:'Royal Treasury',price:720,icon:'♛',image:'journey-art/04_judges_kings.webp',hint:'A grand collection goal'},
 {id:'starfall',type:'aura',name:'Gold Starfall',price:190,icon:'✶',image:'journey-art/01_the_beginning.webp',hint:'Give your home card golden sparkle'},
 {id:'aurora',type:'aura',name:'Aurora Glow',price:350,icon:'✺',image:'journey-art/05_exile_return.webp',hint:'A bright teal home-card glow'},
 {id:'royalglow',type:'aura',name:'Royal Radiance',price:600,icon:'♛',image:'journey-art/08_revelation.webp',hint:'A royal purple home-card glow'}
];
const THRESHOLDS=[{stars:6,id:'trail-6',name:'Explorer’s Crest',icon:'✧',bonus:65},
 {stars:12,id:'trail-12',name:'Star Compass',icon:'✥',bonus:120},
 {stars:20,id:'trail-20',name:'Golden Chronicle',icon:'♛',bonus:230}];
const IDS=new Set(CATALOG.map(x=>x.id));
const $=s=>document.querySelector(s);
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safe=s=>{try{return JSON.parse(s||'null')}catch(_){return null}};
const pad=n=>('0'+n).slice(-2);
const dateID=(d=new Date())=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const weekID=()=>{const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-(d.getDay()+6)%7);return dateID(d)};
const format=n=>Math.max(0,Math.floor(Number(n)||0)).toLocaleString('en-US');
const hash=s=>{let n=2166136261;for(const c of s){n=Math.imul(n^c.charCodeAt(0),16777619)}return n>>>0};
const catalog=id=>CATALOG.find(x=>x.id===id);
function nativeEvidence(){
 const w=safe(localStorage.getItem(WALLET)),t=safe(localStorage.getItem(TRAILS));
 return {points:Number.isFinite(w?.points)?w.points:0,coins:Number.isFinite(w?.coins)?w.coins:0,
  levels:Array.isArray(t?.completed)?new Set(t.completed).size:0};
}
function defaultState(){
 return {version:2,credits:420,stars:0,owned:['dawn'],scene:'dawn',crest:null,aura:null,
  goal:'library',daily:{},activity:{},week:{},trophies:[],evidence:nativeEvidence(),nudge:null};
}
function restore(){
 const v=safe(localStorage.getItem(KEY));
 if(v?.version===2)return sanitize(v);
 const old=safe(localStorage.getItem(OLD_KEY)),s=defaultState();
 if(old?.version===1){
  if(Number.isSafeInteger(old.credits)&&old.credits>=0)s.credits=old.credits;
  if(Array.isArray(old.owned))s.owned=[...new Set(['dawn',...old.owned.filter(x=>IDS.has(x))])];
  if(s.owned.includes(old.scene))s.scene=old.scene;
  if(s.owned.includes(old.badge))s.crest=old.badge;
  if(IDS.has(old.goal))s.goal=old.goal;
  if(old.activity&&typeof old.activity==='object')s.activity={...old.activity};
  if(old.evidence&&typeof old.evidence==='object')s.evidence={...old.evidence};
 }
 return sanitize(s);
}
function sanitize(v){
 const s=defaultState();
 if(Number.isSafeInteger(v.credits)&&v.credits>=0&&v.credits<1e8)s.credits=v.credits;
 if(Number.isSafeInteger(v.stars)&&v.stars>=0&&v.stars<1e8)s.stars=v.stars;
 if(Array.isArray(v.owned))s.owned=[...new Set(['dawn',...v.owned.filter(x=>IDS.has(x))])];
 for(const [key,type] of [['scene','scene'],['crest','crest'],['aura','aura']])
  if(s.owned.includes(v[key])&&catalog(v[key])?.type===type)s[key]=v[key];
 if(IDS.has(v.goal))s.goal=v.goal;
 for(const key of ['daily','activity','week'])
  if(v[key]&&typeof v[key]==='object'&&!Array.isArray(v[key]))s[key]={...v[key]};
 if(Array.isArray(v.trophies))s.trophies=[...new Set(v.trophies.filter(x=>typeof x==='string'&&x.length<75))];
 if(v.evidence&&typeof v.evidence==='object')s.evidence={...v.evidence};
 if(typeof v.nudge==='string')s.nudge=v.nudge;
 return s;
}
let state=restore(),tab='play',active=false,game=null,locked=false,popup=null,nudgeTimer=null,toastTimer=null;
const currentWeek=()=>state.week[weekID()]||{stars:0,claimed:[]};
const owned=id=>state.owned.includes(id);
const played=()=>!!state.daily[dateID()];
function commit(next){
 const serial=JSON.stringify(next);
 try{localStorage.setItem(KEY,serial);if(localStorage.getItem(KEY)!==serial)throw Error('Unverified save');state=next;return true}
 catch(e){console.warn('Treasure Quest storage unavailable',e);return false}
}
function updateMilestones(next){
 const id=weekID(),w=next.week[id]||{stars:0,claimed:[]};
 w.claimed=Array.isArray(w.claimed)?[...w.claimed]:[];
 const fresh=[];
 for(const t of THRESHOLDS){
  const code=id+':'+t.id;
  if(w.stars>=t.stars&&!w.claimed.includes(t.id)){
   w.claimed.push(t.id);
   if(!next.trophies.includes(code))next.trophies.push(code);
   next.credits+=t.bonus;fresh.push(t);
  }
 }
 next.week={...next.week,[id]:w};
 return fresh;
}
function addStars(next,stars,credits){
 next.stars+=stars;next.credits+=credits;
 const id=weekID(),w=next.week[id]||{stars:0,claimed:[]};
 next.week={...next.week,[id]:{stars:(w.stars||0)+stars,claimed:Array.isArray(w.claimed)?w.claimed:[]}};
 return updateMilestones(next);
}
function reconcile(){
 const now=nativeEvidence(),prev=state.evidence||now;
 const changed=now.points>Number(prev.points||0)||now.coins>Number(prev.coins||0)||now.levels>Number(prev.levels||0);
 const d=dateID(),n={...state,evidence:now,activity:{...state.activity},week:{...state.week},trophies:[...state.trophies]};
 if(changed&&!n.activity[d]){
  n.activity[d]=true;
  const awards=addStars(n,2,25);
  if(commit(n)){
   refreshLaunch();
   // No intrusive full-screen interruption of gameplay; a small optional
   // celebration is shown when the user is actually back on Home.
   if(!active&&homeVisible())nudge('✦ +2 stars! New progress!',true);
   else if(active){render();toast('✦ +2 stars from your latest game!');}
   if(awards.length&&active)win({stars:2,credits:25,awards,source:'game'});
   return true;
  }
 }
 if(JSON.stringify(prev)!==JSON.stringify(now))commit(n);
 return false;
}
function homeVisible(){
 const e=document.getElementById('home');
 return e&&!e.hidden&&getComputedStyle(e).display!=='none'&&!document.hidden&&!window.BUWTNativeShell?.active?.();
}
function sound(major=false){
 try{
  const el=document.getElementById('setting-sfx'),vol=document.getElementById('setting-sfx-volume');
  if(el&&!el.checked)return;
  const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return;
  const context=new Ctx(),gain=context.createGain();
  const volume=Math.max(0,Math.min(1,vol?Number(vol.value)/100:.35));
  gain.gain.value=.045*volume;gain.connect(context.destination);
  const seq=major?[523.25,659.25,783.99,1046.5]:[659.25,830.61,987.77];
  const now=context.currentTime;
  for(let i=0;i<seq.length;i++){
   const o=context.createOscillator(),g=context.createGain();
   o.type='sine';o.frequency.value=seq[i];
   g.gain.setValueAtTime(.0001,now+i*.085);
   g.gain.exponentialRampToValueAtTime(.7,now+i*.085+.02);
   g.gain.exponentialRampToValueAtTime(.001,now+i*.085+.24);
   o.connect(g);g.connect(gain);o.start(now+i*.085);o.stop(now+i*.085+.25);
  }
  setTimeout(()=>context.close().catch(()=>{}),1000);
 }catch(_){}
}
const giftSVG='<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><rect x="10" y="26" width="44" height="29" rx="5" fill="#b67629" stroke="#59320b" stroke-width="2"/><rect x="8" y="20" width="48" height="12" rx="3" fill="#f7d891" stroke="#74450e" stroke-width="2"/><path d="M29 20c-12 0-17-5-14-11 4-7 15 2 17 11M35 20c12 0 17-5 14-11-4-7-15 2-17 11" stroke="#6e3e0e" stroke-width="4"/><path d="M29 20h6v35h-6z" fill="#fff1bc"/><path d="M8 25h48v6H8z" fill="#ffe4a1"/><path d="M14 51h36" stroke="#673c13" stroke-width="2"/></svg>';
const chestSVG='<svg viewBox="0 0 128 105" fill="none" role="img" aria-label="Golden treasure chest">'+
 '<path d="M15 41Q17 9 64 9Q111 9 113 41V54H15Z" fill="#955026" stroke="#fce4a1" stroke-width="4"/>'+
 '<path d="M22 41Q26 20 64 20Q102 20 106 41" stroke="#ffe4a1" stroke-width="5"/>'+
 '<path d="M33 17V52M95 17V52" stroke="#c7a45c" stroke-width="10" opacity=".8"/>'+
 '<rect x="12" y="45" width="104" height="48" rx="7" fill="#713916" stroke="#f0c56b" stroke-width="5"/>'+
 '<path d="M14 56H114M14 86H114" stroke="#d29e46" stroke-width="7"/>'+
 '<rect x="46" y="40" width="36" height="38" rx="5" fill="#ffe4a0" stroke="#7b4c20" stroke-width="4"/>'+
 '<path d="M59 61C53 52 73 52 69 61L67 69H61Z" fill="#7a451e"/>'+
 '<path d="M21 94L17 101H35L38 94M91 94L88 101H111L106 94" fill="#d5a459"/></svg>';
function launchCard(){
 const story=document.querySelector('#home .cinematic-cards #home-story');
 if(!story)return false;
 let e=document.getElementById('bu-arcade-launch');
 if(!e){
  e=document.createElement('button');e.type='button';e.id='bu-arcade-launch';
  story.insertAdjacentElement('beforebegin',e);
  e.addEventListener('click',()=>openHall('play'));
 }
 e.innerHTML='<span class="bu-a-gift">'+giftSVG+'</span><span class="bu-a-content">'+
  '<span class="bu-a-ribbon">'+(played()?'★ DAILY TREASURE COLLECTED':'★ FREE DAILY BONUS GAME')+'</span>'+
  '<strong class="bu-a-title">Treasure Quest</strong>'+
  '<span class="bu-a-sub">'+(played()?'Keep earning stars to unlock prizes':'Match the cards. Open a chest. Win stars!')+'</span>'+
  '</span><span class="bu-a-chevron">›</span><span class="bu-a-twinkle" aria-hidden="true">✦</span>';
 e.dataset.aura=state.aura==='royalglow'?'royal':state.aura||'none';
 return true;
}
function refreshLaunch(){launchCard()}
function nudge(message,isProgress=false){
 if(!homeVisible()||active||$('#bu-arcade-nudge')||$('#daily-modal')?.getBoundingClientRect().height>0)return;
 const wrap=document.createElement('div');wrap.id='bu-arcade-nudge';
 wrap.innerHTML='<span aria-hidden="true" style="font-size:28px">✦</span><span style="flex:1">'+esc(message)+'</span>'+
  '<button type="button" class="open">PLAY</button><button type="button" class="close" aria-label="Dismiss">×</button>';
 document.body.appendChild(wrap);
 wrap.querySelector('.open').addEventListener('click',()=>{wrap.remove();openHall('play')});
 wrap.querySelector('.close').addEventListener('click',()=>wrap.remove());
 setTimeout(()=>wrap.remove(),9500);
}
function showOnceNudge(){
 if(played()||state.nudge===dateID()||active||!homeVisible())return;
 const next={...state,nudge:dateID()};
 if(!commit(next))return;
 nudge('Your FREE treasure game is ready!');
}
function button(label,action,id='',secondary=false,disabled=false){
 return '<button class="bu-a-button'+(secondary?' secondary':'')+'" type="button" data-action="'+action+'"'+(id?' data-id="'+esc(id)+'"':'')+(disabled?' disabled':'')+'>'+esc(label)+'</button>';
}
function panel(content){return '<section class="bu-a-panel">'+content+'</section>'}
function playView(){
 const w=currentWeek(),last=played()?state.daily[dateID()]:null;
 const remain=THRESHOLDS.find(t=>!w.claimed.includes(t.id));
 const next=remain||THRESHOLDS[THRESHOLDS.length-1];
 const pct=Math.min(100,Math.round(100*(w.stars||0)/20));
 return '<div class="bu-a-section">'+
  '<div class="bu-a-main">'+
   panel('<span class="bu-a-tiny">✦ FREE DAILY BONUS</span><h3>'+ (last?'Today’s treasure unlocked!':'The Mystery Vault')+'</h3>'+
    '<div class="bu-a-prize-art"><span class="bu-a-big-icon">✦</span></div>'+
    '<p>'+(last?'You won '+last.stars+' stars today. Come back tomorrow for a new vault.':'Match 3 pairs to open a treasure chest!')+'</p>'+
    '<div class="bu-a-reward-stats"><strong>✦ STARS</strong><strong>✦ PRIZES</strong><strong>✦ SURPRISE</strong></div>'+
    '<button type="button" class="bu-a-button bu-a-giant" data-action="start">'+
     (last?'PLAY AGAIN · FOR FUN':'PLAY FREE BONUS GAME  ▶')+'</button>')+
   panel('<span class="bu-a-tiny">YOUR WEEKLY STAR TRAIL</span><h3>'+format(w.stars||0)+' ✦ Stars</h3>'+
    '<p>More stars = more treasure!</p>'+
    '<div class="bu-a-starbar"><span style="width:'+pct+'%"></span></div>'+
    '<div class="bu-a-steps">'+Array.from({length:20},(_,i)=>'<span class="bu-a-step'+(i<(w.stars||0)?' full':'')+'"></span>').join('')+'</div>'+
    '<div class="bu-a-reward-stats"><strong>6 ★</strong><strong>12 ★</strong><strong>20 ★</strong></div>'+
    '<div class="bu-a-prize-art" style="height:80px;background-image:linear-gradient(#071b2a40,#071b2a99),url(&quot;journey-art/05_exile_return.webp&quot;)"><span class="bu-a-big-icon" style="font-size:49px">'+next.icon+'</span></div>'+
    '<p><strong>'+esc(next.name)+'</strong> '+(remain?'at '+next.stars+' stars':'collected!')+'</p>'+
    button('SEE THE PRIZE TRAIL','tab','prizes',true))+
   '</div>'+
  '<button class="bu-a-season" type="button" data-action="tab" data-id="prizes">'+
   '<span class="bu-a-season-art"></span>'+
   '<span class="bu-a-season-copy"><strong>Unlock the Golden Chronicle</strong>'+
    '<span>Earn stars to reveal 3 rare treasures.</span></span>'+
   '<span style="font-size:26px;color:#ffe4a9">›</span></button>'+
  '<p class="bu-a-notice">Original daily checkmark stays as it is. This bonus game is separate; TEST credits only.</p>'+
  '</div>';
}
function prizesView(){
 const w=currentWeek();
 return '<div class="bu-a-section">'+
 panel('<span class="bu-a-tiny">THE GOLDEN STAR TRAIL · RESETS MONDAY</span>'+
  '<h3>'+format(w.stars||0)+' / 20 stars</h3>'+
  '<div class="bu-a-starbar"><span style="width:'+Math.min(100,(w.stars||0)*5)+'%"></span></div>'+
  '<p>Play the daily bonus and earn stars while you play Bible Unfolded.</p>'+
  '<div class="bu-a-milestones">'+THRESHOLDS.map(t=>'<div class="bu-a-milestone'+(w.claimed.includes(t.id)?' earned':'')+'">'+
   '<span class="icon">'+t.icon+'</span><strong>'+esc(t.name)+'</strong>'+
   '<small>'+(w.claimed.includes(t.id)?'★ UNLOCKED':t.stars+' STARS')+'</small></div>').join('')+'</div>')+
 panel('<span class="bu-a-tiny">MY TROPHIES · YOURS TO KEEP</span><h3>Collected Treasures</h3>'+
  '<div class="bu-a-collection">'+(
  state.trophies.length?state.trophies.slice(-12).map(code=>{const t=THRESHOLDS.find(x=>code.endsWith(':'+x.id));return t?
   '<div class="bu-a-collected"><span class="icon">'+t.icon+'</span><strong>'+esc(t.name)+'</strong></div>':''}).join(''):
   '<p>Your first treasure awaits at 6 stars.</p>')+'</div>')+
 panel('<span class="bu-a-tiny">YOUR PERSONAL COLLECTION</span><h3>'+state.owned.length+' / '+CATALOG.length+' Treasury Items</h3>'+
  '<div class="bu-a-collection">'+CATALOG.filter(x=>owned(x.id)).map(x=>'<div class="bu-a-collected">'+
   '<span class="icon">'+x.icon+'</span><strong>'+esc(x.name)+'</strong>'+
   (selected(x)?'<small>On display</small>':button('DISPLAY','equip',x.id,true))+'</div>').join('')+'</div>'+
  button('FIND MORE TREASURES','tab','shop'))+
 '</div>';
}
function selected(x){return state[x.type==='crest'?'crest':x.type==='scene'?'scene':'aura']===x.id}
function shopView(){
 const target=catalog(state.goal)||CATALOG[1],gap=Math.max(0,target.price-state.credits);
 return '<div class="bu-a-section">'+panel('<span class="bu-a-tiny">THE TREASURE SHOP · PREVIEW ECONOMY</span>'+
  '<h3>Spend. Unlock. Show It Off.</h3><p>✦ '+format(state.credits)+' test credits available</p>'+
  '<p>Saving for <b>'+esc(target.name)+'</b> · '+(gap?'Only '+format(gap)+' more!':'Ready to unlock!')+'</p>'+
  '<div class="bu-a-starbar"><span style="width:'+Math.min(100,100*state.credits/Math.max(1,target.price))+'%"></span></div>'+
  '<p class="bu-a-notice">Preview purchases do not spend your real Insight Tokens. Purchased auras sparkle on the home-screen Treasure Quest card.</p>')+
  '<div class="bu-a-store">'+CATALOG.filter(x=>x.price>0).map(x=>{
    const has=owned(x.id),equipped=selected(x),need=Math.max(0,x.price-state.credits);
    const act=has?'equip':need?'goal':'buy',label=equipped?'ON DISPLAY':has?'DISPLAY IT':need?'SAVE FOR THIS':'UNLOCK · '+x.price+' ✦';
    return '<div class="bu-a-item"><div class="bu-a-item-image" style="background-image:url(&quot;'+esc(x.image)+'&quot;)">'+
    '<span class="bu-a-item-symbol">'+x.icon+'</span></div><div class="bu-a-item-text">'+
    '<span class="bu-a-tiny">'+(x.type==='aura'?'HOME CARD EFFECT':x.type==='scene'?'SCENIC HALL THEME':'COLLECTOR CREST')+'</span>'+
    '<strong>'+esc(x.name)+'</strong><small>'+esc(x.hint)+'</small>'+
    '<span style="font:800 12px system-ui,sans-serif;color:#f8deaa">'+(has?'★ OWNED':x.price+' ✦ CREDITS')+'</span>'+
    button(label,act,x.id,has||!!need,equipped)+'</div></div>';
   }).join('')+'</div></div>';
}
function refreshShell(){
 const root=$('#bu-arcade-shell');if(!root)return;
 root.dataset.scene=state.scene;
 root.dataset.aura=state.aura||'';
 root.querySelector('.bu-a-wallet strong').textContent='✦ '+format(state.credits);
 root.querySelector('.bu-a-wallet small').textContent='TEST CREDITS';
 for(const b of root.querySelectorAll('.bu-a-tab'))b.setAttribute('aria-selected',String(b.dataset.id===tab));
 root.querySelector('.bu-a-body').innerHTML=tab==='shop'?shopView():tab==='prizes'?prizesView():playView();
 refreshLaunch();
}
function openHall(which='play'){
 if(active){tab=which;refreshShell();return}
 removeNudge();reconcile();active=true;tab=which;
 const modal=document.createElement('div');modal.id='bu-arcade-stage';
 modal.innerHTML='<div id="bu-arcade-shell" role="dialog" aria-modal="true" aria-labelledby="bu-arcade-title">'+
 '<header class="bu-a-hero"><div><span class="bu-a-kicker">BIBLE UNFOLDED · DAILY EVENTS</span>'+
 '<h2 id="bu-arcade-title">Treasure Quest</h2><p class="bu-a-lead">Play. Win stars. Open treasures.</p></div>'+
 '<div class="bu-a-wallet"><strong>✦ 0</strong><small>TEST CREDITS</small></div>'+
 '<button type="button" class="bu-a-x" aria-label="Close Treasure Quest">×</button></header>'+
 '<nav class="bu-a-tabs" aria-label="Treasure Quest sections">'+
 '<button class="bu-a-tab" data-action="tab" data-id="play">★ BONUS GAME</button>'+
 '<button class="bu-a-tab" data-action="tab" data-id="prizes">✥ PRIZES</button>'+
 '<button class="bu-a-tab" data-action="tab" data-id="shop">✦ SHOP</button></nav>'+
 '<main class="bu-a-body"></main>'+
 '<footer class="bu-a-foot"><span>VISUAL LAB · TEST REWARDS ONLY</span>'+
 '<span>Original daily checkmark untouched</span></footer></div>';
 document.body.append(modal);modal.addEventListener('click',onAction);
 modal.querySelector('.bu-a-x').addEventListener('click',closeHall);
 modal.addEventListener('click',e=>{if(e.target===modal)closeHall()});
 refreshShell();
 modal.querySelector('.bu-a-x').focus({preventScroll:true});
}
function closeHall(){
 if($('#bu-arcade-play'))endGame();
 $('#bu-arcade-stage')?.remove();active=false;popup=null;locked=false;
 $('#bu-arcade-launch')?.focus({preventScroll:true});
}
function toast(message){
 let box=$('#bu-arcade-stage .bu-a-toast');if(!box){box=document.createElement('div');box.className='bu-a-toast';box.setAttribute('role','status');$('#bu-arcade-stage')?.append(box)}
 box.textContent=message;
 if(toastTimer)clearTimeout(toastTimer);
 toastTimer=setTimeout(()=>box.remove(),3000);
}
function removeNudge(){$('#bu-arcade-nudge')?.remove()}
function buy(id){
 const x=catalog(id);if(!x||owned(id))return;
 if(state.credits<x.price){goal(id);return}
 const n={...state,credits:state.credits-x.price,owned:[...state.owned,id]};
 n[x.type==='crest'?'crest':x.type==='scene'?'scene':'aura']=id;
 if(n.goal===id){
  const todo=CATALOG.filter(y=>y.price>0&&!n.owned.includes(y.id)).sort((a,b)=>a.price-b.price);
  n.goal=(todo.find(y=>y.price>=n.credits+75)||todo[0]||x).id;
 }
 if(!commit(n)){toast('Could not save the purchase. No credits were deducted.');return}
 sound(true);refreshShell();
 win({source:'purchase',title:x.name,subtitle:'UNLOCKED · NOW ON DISPLAY',stars:0,credits:0,awards:[],icon:x.icon});
}
function equip(id){
 const x=catalog(id);if(!x||!owned(id))return;
 const n={...state,[x.type==='crest'?'crest':x.type==='scene'?'scene':'aura']:id};
 if(!commit(n)){toast('Could not save your display.');return}
 sound();refreshShell();toast(x.name+' is now on display!');
}
function goal(id){
 if(!catalog(id))return;
 if(!commit({...state,goal:id})){toast('Could not save your goal.');return}
 tab='shop';refreshShell();toast('Savings goal: '+catalog(id).name);
}
function deckFor(day){
 const faces=[0,0,1,1,2,2];let seed=hash(day+'-treasure-match-v2');
 for(let i=faces.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);
  [faces[i],faces[j]]=[faces[j],faces[i]];}
 return faces;
}
function beginGame(){
 if(game)return;
 game={cards:deckFor(dateID()),matched:[],flipped:[],lock:false,stage:'match',previewOnly:played()};
 const box=document.createElement('div');box.id='bu-arcade-play';box.setAttribute('role','dialog');
 box.setAttribute('aria-modal','true');box.setAttribute('aria-label','Daily Treasure Match game');
 $('#bu-arcade-stage')?.append(box);box.addEventListener('click',onAction);
 renderGame();
}
function renderGame(){
 const el=$('#bu-arcade-play');if(!el||!game)return;
 const isChest=game.stage==='chest',complete=game.matched.length/2;
 const close=button('EXIT BONUS GAME','exit','',true);
 el.innerHTML='<div class="bu-a-play-panel">'+
 '<span class="bu-a-tiny">'+(isChest?'ALL THREE PAIRS FOUND!':'MATCH THREE PAIRS')+'</span>'+
 '<h3>'+(isChest?'THE TREASURE VAULT IS OPEN!':'Treasure Match')+'</h3>'+
 '<p class="bu-a-game-sub">'+(isChest?'Choose a chest to reveal your surprise.':'Tap two matching pictures. Fill all 3 stars.')+'</p>'+
 '<div class="bu-a-sparkline">'+(isChest?'✦ ✦ ✦': '★'.repeat(complete)+'☆'.repeat(3-complete))+'</div>'+
 (isChest?'<div class="bu-a-chests">'+[0,1,2].map(i=>
  '<button type="button" class="bu-a-chest" data-action="chest" data-id="'+i+'" aria-label="Open treasure chest '+(i+1)+'">'+chestSVG+'</button>').join('')+'</div>':
 '<div class="bu-a-memory">'+game.cards.map((pair,i)=>
  '<button type="button" class="bu-a-card'+(game.flipped.includes(i)?' open':'')+
  (game.matched.includes(i)?' matched':'')+'" data-action="flip" data-id="'+i+
  '" data-pair="'+pair+'" aria-label="Treasure card '+(i+1)+'">'+
  '<span class="picture" style="background-image:url(&quot;'+esc(IMAGES[pair])+'&quot;)"></span></button>').join('')+'</div>')+
 (game.previewOnly?'<p class="bu-a-game-sub">Practice round · reward already collected today</p>':'')+
 close+'</div>';
}
function flip(index){
 if(!game||game.stage!=='match'||game.lock||!Number.isInteger(index)||index<0||index>5||
  game.matched.includes(index)||game.flipped.includes(index))return;
 game.flipped.push(index);sound();
 renderGame();
 if(game.flipped.length!==2)return;
 game.lock=true;
 const [a,b]=game.flipped;
 if(game.cards[a]===game.cards[b]){
  setTimeout(()=>{
   if(!game)return;
   game.matched.push(a,b);game.flipped=[];game.lock=false;sound(true);
   if(game.matched.length===6){game.stage='chest';}
   renderGame();
  },360);
 }else{
  setTimeout(()=>{if(!game)return;game.flipped=[];game.lock=false;renderGame()},750);
 }
}
function openChest(i){
 if(!game||game.stage!=='chest'||locked)return;
 locked=true;
 const practice=game.previewOnly||played();
 const h=hash(dateID()+'-'+i+'-chest');
 const stars=practice?0:3+(h%3),credits=practice?0:40+((h>>>5)%4)*10;
 let awards=[];
 if(!practice){
  const n={...state,daily:{...state.daily},week:{...state.week},trophies:[...state.trophies]};
  n.daily[dateID()]={stars,credits,opened:i};awards=addStars(n,stars,credits);
  if(!commit(n)){locked=false;toast('Reward save failed; your balance was not changed.');return}
 }
 const total=awards.reduce((a,b)=>a+b.bonus,0);
 sound(true);endGame();refreshShell();refreshLaunch();
 win({source:practice?'practice':'chest',stars,credits,awards,
  title:practice?'WELL PLAYED!':'TREASURE UNLOCKED!',
  subtitle:practice?'Your daily reward was already claimed.':'STAR BURST! A new prize is yours.',
  icon:'✦',total});
 locked=false;
}
function endGame(){game=null;$('#bu-arcade-play')?.remove()}
function win({source,stars=0,credits=0,awards=[],title,subtitle,icon='✦',total=0}){
 const stage=$('#bu-arcade-stage');if(!stage)return;
 $('#bu-arcade-win')?.remove();
 const overlay=document.createElement('div');overlay.className='bu-a-win';overlay.id='bu-arcade-win';
 const awardsLabel=awards.length?'<p>✥ BONUS TREASURE! '+awards.map(a=>esc(a.name)).join(', ')+'</p>':'';
 overlay.innerHTML='<div class="bu-a-particles" aria-hidden="true">'+
  Array.from({length:48},(_,i)=>'<span class="bu-a-particle" style="--angle:'+(i*137.508)+'deg;--dist:'+(85+i%7*28)+'px;--delay:'+(i%7*65)+'ms;--color:'+
   ['#ffdc62','#ffffff','#f5aa4b','#aadfff','#eed2ff'][i%5]+'">✦</span>').join('')+'</div>'+
  '<div class="bu-a-win-card" role="dialog" aria-modal="true" aria-label="Treasure reward">'+
  '<span class="bu-a-kicker">★ REWARD REVEAL ★</span>'+
  '<span class="bu-a-win-crest">'+esc(icon)+'</span>'+
  '<h3>'+esc(title||'TREASURE UNLOCKED!')+'</h3>'+
  '<p>'+esc(subtitle||'A treasure has been unlocked')+'</p>'+
  (stars||credits?'<p style="font-size:25px;color:#ffe49d">+'+stars+' ★ &nbsp; +'+format(credits+total)+' ✦</p>':'')+
  awardsLabel+
  button('AWESOME! KEEP PLAYING','close-win')+'</div>';
 stage.append(overlay);
 overlay.addEventListener('click',onAction);
 overlay.querySelector('[data-action=close-win]')?.focus();
}
function onAction(e){
 const b=e.target.closest?.('button[data-action]');if(!b)return;
 const a=b.dataset.action,id=b.dataset.id;
 if(a==='tab'&&['play','prizes','shop'].includes(id)){tab=id;refreshShell()}
 else if(a==='start'){beginGame()}
 else if(a==='flip'){flip(Number(id))}
 else if(a==='chest'){openChest(Number(id))}
 else if(a==='exit'){endGame()}
 else if(a==='buy'){buy(id)}
 else if(a==='equip'){equip(id)}
 else if(a==='goal'){goal(id)}
 else if(a==='close-win'){$('#bu-arcade-win')?.remove();render();}
}
function render(){if(active)refreshShell()}
document.addEventListener('keydown',e=>{
 if(!active)return;
 if(e.key==='Escape'){
  if($('#bu-arcade-win')){$('#bu-arcade-win').remove();return}
  if(game){endGame();return}
  closeHall();
 }
 if(e.key==='Tab'){
  const modal=$('#bu-arcade-win')||$('#bu-arcade-play')||$('#bu-arcade-shell');
  const focus=[...(modal?.querySelectorAll('button:not(:disabled)')||[])];
  if(!focus.length)return;
  if(e.shiftKey&&document.activeElement===focus[0]){e.preventDefault();focus[focus.length-1].focus()}
  else if(!e.shiftKey&&document.activeElement===focus[focus.length-1]){e.preventDefault();focus[0].focus()}
 }
});
const params=new URLSearchParams(location.search);
let deepLinked=false;
function mount(){
 if(!launchCard())return false;
 if(params.get('hall')==='1'&&!deepLinked){deepLinked=true;openHall('play')}
 return true;
}
function start(){
 if(!mount()){
  const ob=new MutationObserver(()=>{if(mount())ob.disconnect()});
  ob.observe(document.documentElement,{subtree:true,childList:true});
  setTimeout(()=>ob.disconnect(),15000);
 }
 // The original daily check-in popup takes precedence over the optional
 // floating event invitation; never obscure its claim control.
 setTimeout(showOnceNudge,3000);
 setInterval(()=>{if(homeVisible()){reconcile();refreshLaunch()}},4400);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)reconcile()});
 window.addEventListener('focus',reconcile);
 window.addEventListener('pageshow',()=>{reconcile();refreshLaunch()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
window.BUTreasureQuest=Object.freeze({version:'2.0.0-test',open:()=>openHall('play'),stateKey:KEY,
 preview:()=>({credits:state.credits,stars:state.stars,daily:{...state.daily},
 week:{...state.week},owned:[...state.owned],trophies:[...state.trophies],scene:state.scene,aura:state.aura}),
 visible:()=>active});
})();

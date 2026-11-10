/* Bible Unfolded — Native Power-Up Shop V1, Visual Lab ONLY.
 * Scope: existing Rewards & Progress and existing Trivia/Story question screens.
 * Crucial: TEST and LIVE share an origin! This feature NEVER writes to
 * bible-unfolded-rewards-v17, recovery, purchases or wheel entitlements.
 * Trial purchases/stock use this module's TEST-only ledger. Production wallet
 * integration must be separately approved, atomic and migration-tested.
 */
(()=>{'use strict';
if(window.BUNativeBoostShop)return;
const KEY='bu-native-boost-shop-v1-test-only';
const WALLET='bible-unfolded-rewards-v17';
const products=Object.freeze([
 {id:'fifty',icon:'◉',name:'50/50 Flash',desc:'Remove two wrong answers in Bible Trivia.',price:45,qty:1,kind:'trivia'},
 {id:'shield',icon:'◇',name:'Second Chance',desc:'Catch one wrong Trivia tap without losing the question.',price:35,qty:1,kind:'trivia'},
 {id:'letter',icon:'✦',name:'Letter Lens',desc:'Reveal the first two letters in Story Adventure.',price:30,qty:1,kind:'story'},
 {id:'explorer',icon:'✥',name:'Explorer Kit',desc:'2 Flash, 2 Shields and 2 Letter Lenses.',price:185,qty:6,kind:'bundle'},
 {id:'scholar',icon:'♛',name:'Scholar Vault',desc:'5 Flash, 5 Shields and 5 Letter Lenses.',price:395,qty:15,kind:'bundle'}
]);
const each=o=>({fifty:Math.max(0,Math.floor(o?.fifty||0)),shield:Math.max(0,Math.floor(o?.shield||0)),letter:Math.max(0,Math.floor(o?.letter||0))});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nowCoins=()=>{try{return Number.isFinite(economy.coins)?economy.coins:0}catch(_){return 0}};
const earned=()=>{try{return Array.isArray(economy.earned)?economy.earned.filter(x=>typeof x==='string'):[]}catch(_){return []}};
const $=s=>document.querySelector(s);
const fmt=n=>Math.max(0,Math.floor(n||0)).toLocaleString('en-US');
const saveJSON=s=>{try{const json=JSON.stringify(s);localStorage.setItem(KEY,json);if(localStorage.getItem(KEY)!==json)return false;return true}catch(e){console.warn('[BOOST TEST] Could not save inventory',e);return false}};
const valid=o=>Number.isSafeInteger(o)&&o>=0&&o<1e8;
function initial(){
 return {version:1,tokens:Math.max(225,Math.floor(nowCoins())),sourceCoins:nowCoins(),inventory:{fifty:0,shield:0,letter:0},
  stars:0,earnedSet:earned().slice(-6000),granted:0};
}
function load(){
 let v;try{v=JSON.parse(localStorage.getItem(KEY)||'null')}catch(_){v=null}
 if(v?.version!==1)return initial();
 const d=initial();
 d.tokens=valid(v.tokens)?v.tokens:d.tokens;
 d.sourceCoins=Number.isFinite(v.sourceCoins)?v.sourceCoins:d.sourceCoins;
 d.inventory=each(v.inventory);
 d.stars=valid(v.stars)?v.stars:0;
 d.earnedSet=Array.isArray(v.earnedSet)?v.earnedSet.filter(x=>typeof x==='string').slice(-6000):d.earnedSet;
 d.granted=valid(v.granted)?v.granted:0;
 return d;
}
let state=load();
const runtime={quiz:null,stepEffects:new Map(),shieldArmed:false,pop:null,lastStarAt:0,lastRewardChecked:0};
function commit(n){if(!saveJSON(n))return false;state=n;return true}
function grantGift(n,num){
 n.inventory={...n.inventory,fifty:n.inventory.fifty+num};
 n.granted+=num;
}
function refresh(){renderShop();paintQuestion()}
function reconcile(){
 const native=nowCoins(),delta=native-state.sourceCoins;
 const next={...state,inventory:{...state.inventory},earnedSet:[...state.earnedSet]};
 let changed=false;
 // Mirrors real coins earned during testing without ever spending them.
 if(delta!==0){next.sourceCoins=native;if(delta>0)next.tokens+=delta;changed=true}
 const seen=new Set(next.earnedSet);
 const genuinelyNew=earned().filter(k=>!seen.has(k));
 if(genuinelyNew.length){
  for(const k of genuinelyNew)seen.add(k);
  next.earnedSet=[...seen].slice(-6000);changed=true;
  const eligible=genuinelyNew.filter(k=>/^(story|cross|trivia|daily|family|builder|word|scholar|research|behind|name|trail)/i.test(k)&&!/penalty|reveal|purchase|restore|hint/i.test(k));
  if(eligible.length){
   const before=Math.floor(next.stars/5);
   next.stars+=eligible.length;
   const after=Math.floor(next.stars/5);
   if(after>before)grantGift(next,after-before);
   if(commit(next)){
    refresh();
    if(after>before)celebrate('FREE 50/50 UNLOCKED!', '★ Your new discoveries earned a free booster!', true);
    else if(!$('#rewards')?.hidden&&Date.now()-runtime.lastStarAt>1200)celebrate('★ +'+eligible.length+' STAR'+(eligible.length===1?'':'S'),(next.stars%5)+' / 5 to your next FREE 50/50');
    runtime.lastStarAt=Date.now();
   }
   return;
  }
 }
 if(changed){commit(next);refresh()}
}
function purchase(id){
 const p=products.find(x=>x.id===id);if(!p)return;
 reconcile();
 if(state.tokens<p.price){flash('Earn '+fmt(p.price-state.tokens)+' more TEST tokens to unlock '+p.name);return}
 const n={...state,tokens:state.tokens-p.price,inventory:{...state.inventory}};
 if(p.kind==='bundle'){const units=p.id==='explorer'?2:5;for(const key of ['fifty','shield','letter'])n.inventory[key]+=units}
 else n.inventory[p.id]+=p.qty;
 if(!commit(n)){flash('Storage unavailable. No tokens charged.');return}
 renderShop();paintQuestion();
 celebrate('POWER-UP UNLOCKED!',p.name+' added to your inventory. ✦',true);
}
function consume(id){
 if((state.inventory[id]||0)<1)return false;
 const n={...state,inventory:{...state.inventory,[id]:state.inventory[id]-1}};
 if(!commit(n))return false;
 renderShop();paintQuestion();return true;
}
function shell(){
 const section=$('#rewards');if(!section)return;
 const scroller=section.querySelector('.reward-scroll');if(!scroller)return;
 const box=$('#bu-native-boosters');
 if(box)return;
 const view=document.createElement('section');view.id='bu-native-boosters';
 view.setAttribute('aria-label','Power-up shop and inventory');
 const hero=scroller.querySelector('.reward-hero')||scroller.firstElementChild;
 if(hero)hero.insertAdjacentElement('afterend',view);else scroller.prepend(view);
 view.addEventListener('click',e=>{
  const btn=e.target.closest('button[data-boost-buy]');if(btn)purchase(btn.dataset.boostBuy);
  const info=e.target.closest('button[data-boost-info]');
  if(info)flash('Go to Bible Trivia or Story Adventure and tap the glowing ⚡ power-up button to use your boosters.');
 });
 renderShop();
}
function renderShop(){
 const host=$('#bu-native-boosters');if(!host)return;
 const progress=state.stars%5;
 host.innerHTML='<div class="bu-boost-head">'+
  '<div><span class="bu-boost-eyebrow">★ NEW · GAMEPLAY POWER-UPS</span><h2>Give Your Tokens Power</h2>'+
  '<p>Buy here. Use boosts inside real Bible games.</p></div>'+
  '<div class="bu-boost-balance"><strong>◈ '+fmt(state.tokens)+'</strong><span>TEST TOKENS</span></div></div>'+
  '<div class="bu-boost-star-track"><div><b>✦ NEXT FREE 50/50</b><span>'+progress+' / 5 earned ★</span></div>'+
  '<div class="bu-boost-bar"><i style="width:'+(progress*20)+'%"></i></div></div>'+
  '<div class="bu-boost-inventory"><b>MY BOOSTS</b>'+
  '<span>◉ 50/50 ×'+fmt(state.inventory.fifty)+'</span>'+
  '<span>◇ Shield ×'+fmt(state.inventory.shield)+'</span>'+
  '<span>✦ Lens ×'+fmt(state.inventory.letter)+'</span></div>'+
  '<div class="bu-boost-grid">'+products.map(p=>'<article class="bu-boost-item '+(p.kind==='bundle'?'bundle':'')+'">'+
   '<span class="bu-boost-icon" aria-hidden="true">'+p.icon+'</span>'+
   '<div class="bu-boost-copy"><strong>'+esc(p.name)+'</strong><small>'+esc(p.desc)+'</small></div>'+
   '<button type="button" data-boost-buy="'+p.id+'" aria-label="Buy '+esc(p.name)+' for '+p.price+' test tokens">'+
   '◈ '+p.price+'</button></article>').join('')+'</div>'+
  '<div class="bu-boost-foot"><span>TEST preview: purchases never spend real Insight Tokens or modify LIVE balances.</span>'+
  '<button type="button" data-boost-info="1" aria-label="How to use purchased boosts">How to use ↗</button></div>';
}
function getQuiz(){
 try{if(typeof bu34Quiz==='object'&&bu34Quiz?.items?.[bu34Quiz.step]&&
   !document.getElementById('bu34-trivia')?.hidden&&bu34Quiz.answered===false)return bu34Quiz}catch(_){}
 return null;
}
function getRawQuiz(){
 try{return typeof bu34Quiz==='object'?bu34Quiz:null}catch(_){return null}
}
function quizStep(r){return String(r.step)+'|'+String(r.items[r.step]?.q||'')}
function correctIndex(r){return Number(r.items[r.step]?.correct)}
function ensureQuizReference(r){
 if(runtime.quiz!==r){runtime.quiz=r;runtime.stepEffects=new Map();runtime.shieldArmed=false}
}
function activeQuestion(){const r=getQuiz();if(r)ensureQuizReference(r);return r}
function apply50(r){
 const effect=runtime.stepEffects.get(quizStep(r));if(!effect)return;
 for(const i of effect){
  const btn=$('#bu34-body [data-answer="'+i+'"]');
  if(btn){btn.disabled=true;btn.classList.add('bu-boost-erased');btn.setAttribute('aria-label','Incorrect choice removed with 50/50')}
 }
}
function useFifty(){
 const r=activeQuestion();
 if(!r){flash('Start an unanswered Bible Trivia question first.');return}
 const k=quizStep(r);if(runtime.stepEffects.has(k)){flash('50/50 is already active on this question.');return}
 const correct=correctIndex(r);
 const wrong=[...document.querySelectorAll('#bu34-body [data-answer]')]
  .filter(b=>!b.disabled&&+b.dataset.answer!==correct).map(b=>+b.dataset.answer);
 if(wrong.length<2){flash('Not enough incorrect choices remain. No booster used.');return}
 if(!state.inventory.fifty){flash('No 50/50 boosts left. Buy one in Rewards.');return}
 // Commit before applying; if save fails, no free one-time effect.
 if(!consume('fifty')){flash('Cannot save usage. Your booster was not used.');return}
 // Rotate which wrong answers disappear, but never eliminate the correct answer.
 wrong.sort((a,b)=>((a+r.step*13)%4)-((b+r.step*13)%4));
 runtime.stepEffects.set(k,wrong.slice(0,2));apply50(r);
 closePopover();
 celebrate('50/50 FLASH!', 'Two wrong answers have disappeared. Choose wisely!',true);
}
function toggleShield(){
 const r=activeQuestion();
 if(!r){flash('Start an unanswered Bible Trivia question first.');return}
 if(!state.inventory.shield){flash('You need a Second Chance booster from Rewards.');return}
 runtime.shieldArmed=!runtime.shieldArmed;paintQuestion();
 flash(runtime.shieldArmed?'◇ SHIELD READY · Your next wrong answer is protected':'Shield disarmed. Saved for later.');
 closePopover();
}
function onCapture(e){
 const b=e.target.closest?.('#bu34-trivia #bu34-body button[data-answer]');
 if(!b||!runtime.shieldArmed||!state.inventory.shield)return;
 const r=activeQuestion();if(!r)return;
 const pick=Number(b.dataset.answer),correct=correctIndex(r);
 if(!Number.isInteger(pick)||pick===correct)return;
 // Only consume on a real incorrect answer while native gameplay is unanswered.
 if(!consume('shield')){flash('Could not save shield. Try again.');return}
 e.preventDefault();e.stopImmediatePropagation();e.stopPropagation();
 runtime.shieldArmed=false;
 b.classList.add('bu-boost-shielded');
 setTimeout(()=>b.classList.remove('bu-boost-shielded'),650);
 paintQuestion();
 celebrate('SECOND CHANCE!', 'That answer was incorrect. Your shield saved the question.',true);
}
function getStory(){
 try{
  const current=typeof bu3857State!=='undefined'?bu3857State:null;
  const storyPanel=$('#bu3857-screen');
  if(current&&storyPanel&&!storyPanel.hidden&&!current.complete){
   const d=bu3857Current(),entry=BU_HQ_WORDS?.[d?.id];
   const answer=String(entry?.answer||d?.answer||d?.word||'').trim().toUpperCase();
   if(answer.length>2&&/^[A-Z]+$/.test(answer)&&!current.solved?.[d.id])
    return {word:answer,kind:'native',key:d.id};
  }
  const play=$('#play');
  if(play&&!play.hidden&&typeof mode!=='undefined'&&mode==='clue'){
   // Native Story gameplay reads BEATS[stage], which is the active-book
   // question bank. GENESIS_BEATS can be a DIFFERENT archival source.
   const beat=typeof BEATS!=='undefined'?BEATS?.[stage]:null;
   const word=String(beat?.word||'').toUpperCase();
   if(word.length>2&&/^[A-Z]+$/.test(word))return {word,kind:'legacy',key:activeBook+'-'+stage};
  }
 }catch(_){}
 return null;
}
function useLens(){
 const d=getStory();if(!d){flash('Start a Story Adventure word discovery to use Letter Lens.');return}
 if(!state.inventory.letter){flash('No Letter Lenses left. Buy one in Rewards.');return}
 if(runtime.lastLensKey===d.kind+':'+d.key){flash('Letter Lens already used on this word.');return}
 if(!consume('letter')){flash('Could not save booster use. Nothing was deducted.');return}
 runtime.lastLensKey=d.kind+':'+d.key;
 closePopover();
 const letters=d.word.slice(0,2).split('').join('  ·  ');
 const shade=document.createElement('div');shade.className='bu-boost-lens-message';shade.setAttribute('role','status');
 shade.innerHTML='<span class="bu-boost-eyebrow">✦ LETTER LENS</span><strong>'+esc(letters)+'</strong>'+
 '<small>The answer begins with these two letters.</small>'+
 '<button type="button" aria-label="Close Letter Lens">Continue ✦</button>';
 document.body.append(shade);shade.querySelector('button').addEventListener('click',()=>shade.remove());
 setTimeout(()=>shade.remove(),6000);
 celebrate('LETTER LENS ACTIVATED!', 'Look for '+letters+' on the letter wheel.',true);
}
function mountTrivia(){
 const r=activeQuestion();
 if(!r)return;
 const bar=$('#bu34-body .bu3918-tools');if(!bar)return;
 if(!bar.querySelector('#bu-boost-trivia-launch')){
  const btn=document.createElement('button');btn.type='button';btn.id='bu-boost-trivia-launch';
  btn.setAttribute('aria-label','Open Trivia power-ups');
  btn.innerHTML='<span aria-hidden="true">⚡</span><small>BOOST</small>';
  btn.addEventListener('click',e=>{e.stopPropagation();showPopover('trivia',btn)});
  bar.append(btn);
 }
 apply50(r);
 const b=$('#bu-boost-trivia-launch');
 if(b){b.classList.toggle('armed',runtime.shieldArmed);b.title=runtime.shieldArmed?'Second Chance shield ready':'Open Trivia power-ups'}
}
function mountStory(){
 const s=getStory();
 if(!s)return;
 const host=s.kind==='native'?$('#bu3857-screen'):$('#play');
 if(!host)return;
 const anchor=host.querySelector('#bu3857-hint')||host.querySelector('#scene-hint')||host.querySelector('#hint');
 if(!anchor)return;
 if(host.querySelector('#bu-boost-story-launch'))return;
 const b=document.createElement('button');b.type='button';b.id='bu-boost-story-launch';
 b.setAttribute('aria-label','Use a purchased Story Adventure power-up');b.textContent='⚡';
 b.title='Open Story Adventure boosts';
 b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();showPopover('story',b)});
 anchor.insertAdjacentElement('afterend',b);
}
function popBody(kind){
 const i=state.inventory;
 if(kind==='story')return '<span class="bu-boost-pop-title">✦ STORY POWER-UP</span>'+
 '<button data-power-act="letter"><b>✦ Letter Lens</b><small>Reveal 2 letters · Owned ×'+i.letter+'</small></button>'+
 '<button class="minor" data-power-act="shop">Go to Rewards Shop ›</button>';
 return '<span class="bu-boost-pop-title">⚡ TRIVIA BOOSTS</span>'+
 '<button data-power-act="fifty"><b>◉ 50/50 Flash</b><small>Erase 2 wrong choices · Owned ×'+i.fifty+'</small></button>'+
 '<button data-power-act="shield"><b>◇ Second Chance</b><small>'+(runtime.shieldArmed?'Armed — tap to turn off':'Protect 1 wrong tap')+' · Owned ×'+i.shield+'</small></button>'+
 '<button class="minor" data-power-act="shop">Go to Rewards Shop ›</button>';
}
function showPopover(kind,anchor){
 closePopover();
 const el=document.createElement('div');el.id='bu-boost-popover';el.setAttribute('role','dialog');
 el.setAttribute('aria-label','Available power-ups');el.dataset.kind=kind;
 el.innerHTML='<button class="x" type="button" aria-label="Close power-ups">×</button>'+popBody(kind);
 el.querySelector('.x').addEventListener('click',closePopover);
 el.addEventListener('click',e=>{
  const button=e.target.closest('[data-power-act]');if(!button)return;
  const action=button.dataset.powerAct;
  if(action==='fifty')useFifty();
  else if(action==='shield')toggleShield();
  else if(action==='letter')useLens();
  else if(action==='shop'){closePopover();try{openRewards();}catch(_){}}
 });
 document.body.append(el);
 const r=anchor.getBoundingClientRect();
 // Anchor within the visible phone viewport without shifting game layouts.
 const x=Math.min(innerWidth-8-245,Math.max(8,r.left-110));
 el.style.left=Math.max(8,x)+'px';
 el.style.top=Math.max(8,Math.min(innerHeight-el.offsetHeight-8,r.bottom+7))+'px';
 runtime.pop=el;
}
function closePopover(){runtime.pop?.remove();runtime.pop=null}
function paintQuestion(){
 if($('#bu34-trivia')&&!$('#bu34-trivia').hidden)mountTrivia();
 if((state.inventory.letter||0)>0)mountStory();
 const pop=runtime.pop;if(pop)pop.querySelectorAll('[data-power-act]').forEach(b=>{
  if(b.dataset.powerAct==='fifty')b.querySelector('small').textContent='Erase 2 wrong choices · Owned ×'+state.inventory.fifty;
  if(b.dataset.powerAct==='shield')b.querySelector('small').textContent=(runtime.shieldArmed?'Armed — tap to turn off':'Protect 1 wrong tap')+' · Owned ×'+state.inventory.shield;
  if(b.dataset.powerAct==='letter')b.querySelector('small').textContent='Reveal 2 letters · Owned ×'+state.inventory.letter;
 });
}
let pendingToast;
function flash(message){
 let el=$('#bu-boost-toast');if(!el){el=document.createElement('div');el.id='bu-boost-toast';el.setAttribute('role','status');document.body.append(el)}
 el.textContent=message;clearTimeout(pendingToast);pendingToast=setTimeout(()=>el.remove(),2500);
}
function celebrate(title,subtitle,loud=false){
 const existing=$('#bu-boost-celebration');if(existing)existing.remove();
 const box=document.createElement('div');box.id='bu-boost-celebration';box.setAttribute('role','status');
 const count=loud?25:13;
 box.innerHTML='<div class="bu-boost-sparkfield" aria-hidden="true">'+Array.from({length:count},(_,i)=>
  '<span class="bu-boost-particle" style="--x:'+Math.round(Math.cos(i*2.4)*110)+'px;--y:'+Math.round(Math.sin(i*2.4)*115)+'px;--delay:'+(i%6*45)+'ms">✦</span>').join('')+
 '<div class="bu-boost-reward-copy"><strong>'+esc(title)+'</strong><small>'+esc(subtitle)+'</small></div>';
 document.body.append(box);setTimeout(()=>box.remove(),loud?2200:1300);
 if(loud){try{if(typeof playCoinFx==='function')playCoinFx('earn')}catch(_){}}
}
function boot(){
 shell();paintQuestion();
 const prod=$('#reward-products'),body=$('#bu34-body'),play=$('#play');
 if(prod)new MutationObserver(()=>{shell();renderShop()}).observe(prod,{childList:true});
 if(body)new MutationObserver(()=>{paintQuestion()}).observe(body,{childList:true});
 if(play)new MutationObserver(()=>{if(state.inventory.letter)mountStory()}).observe(play,{childList:true});
 document.addEventListener('click',onCapture,true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closePopover()});
 document.addEventListener('click',e=>{if(runtime.pop&&!runtime.pop.contains(e.target)&&!e.target.closest('#bu-boost-trivia-launch,#bu-boost-story-launch'))closePopover()});
 setInterval(()=>{reconcile();paintQuestion();},1400);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){reconcile();paintQuestion()}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
window.BUNativeBoostShop=Object.freeze({version:'1.0.0-test',storageKey:KEY,
 preview:()=>({tokens:state.tokens,stars:state.stars,inventory:{...state.inventory},sourceCoins:state.sourceCoins,granted:state.granted}),
 testActions:Object.freeze({purchase,clickFifty:useFifty,armShield:toggleShield,useLens,refresh:()=>{renderShop();paintQuestion()}})});
})();

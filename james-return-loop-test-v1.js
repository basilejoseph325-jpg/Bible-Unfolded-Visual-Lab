/* Bible Unfolded — James Return Loop V1 · VISUAL LAB ONLY
 * Real playable TEST mechanics; intentionally isolated from the canonical
 * wallet because TEST and LIVE share browser localStorage origin.
 * No native progress, canonical points/tokens, ownership or question bank writes.
 */
(()=>{'use strict';
if(window.BUJamesReturnLoopV1)return;
const KEY='bu-james-return-loop-v1-test-only';
const NATIVE_WALLET='bible-unfolded-rewards-v17';
const LIMIT=5,REFILL_MS=15*60*1000;
const $=s=>document.querySelector(s);
const fmt=n=>Math.floor(Math.max(0,n||0)).toLocaleString('en-US');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cardUrl=n=>'https://www.jw.org/en/library/bible/nwt/books/'+n+'/';
const PRODUCTS=Object.freeze([
 {id:'books',kind:'access',name:'Bible Books Access',desc:'Unlock the full Bible Books mode in this TEST economy.',cost:180,icon:'📖',art:'bible-book-art/01_genesis.webp'},
 {id:'mastery',kind:'access',name:'Mastery Gauntlet',desc:'A five-in-a-row Trivia challenge with a special daily prize.',cost:240,icon:'✦',art:'bible-book-art/27_daniel.webp'},
 {id:'ruth',kind:'card',name:'Ruth · Loyal Friend',desc:'A Bible character collectible with a scripture to explore.',cost:90,icon:'❦',art:'bible-book-art/08_ruth.webp',url:cardUrl('ruth/1/')},
 {id:'daniel',kind:'card',name:'Daniel · Steady Courage',desc:'A Bible character collectible with a scripture to explore.',cost:130,icon:'◆',art:'bible-book-art/27_daniel.webp',url:cardUrl('daniel/6/')},
 {id:'esther',kind:'card',name:'Esther · Courage to Act',desc:'A Bible character collectible with a scripture to explore.',cost:150,icon:'✧',art:'bible-book-art/17_esther.webp',url:cardUrl('esther/4/')},
 {id:'timothy',kind:'card',name:'Timothy · Faithful While Young',desc:'A Bible character collectible with a scripture to explore.',cost:160,icon:'✥',art:'bible-book-art/54_1_timothy.webp',url:cardUrl('1-timothy/4/')},
 {id:'scholar',kind:'profile',name:'Scholar Nameplate',desc:'Display a golden study crest on your player profile.',cost:100,icon:'✒',art:'bible-book-art/20_proverbs.webp'},
 {id:'royal',kind:'profile',name:'Royal Explorer Crest',desc:'Display your rare collector crest in the Rewards room.',cost:210,icon:'♛',art:'journey-art/04_judges_kings.webp'}
]);
const BY_ID=Object.fromEntries(PRODUCTS.map(p=>[p.id,p]));
function safeRaw(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch(_){return null}}
function nativeCoins(){try{const n=JSON.parse(localStorage.getItem(NATIVE_WALLET)||'null')?.coins;return Number.isSafeInteger(n)&&n>=0?n:0}catch(_){return 0}}
const base=()=>({v:1,balance:Math.max(300,Math.min(900,nativeCoins())),lives:5,refillAt:0,pot:0,chain:0,best:0,totalCorrect:0,
 owned:[],profile:null,insurance:0,mastery:{active:false,progress:0,awarded:[]},achievements:[],
 history:[],recentDay:'',created:Date.now()});
const saneInt=(v,max=1e8)=>Number.isSafeInteger(v)&&v>=0&&v<=max;
function normalize(v){
 if(!v||v.v!==1)return base();
 const b=base();
 for(const k of ['balance','lives','refillAt','pot','chain','best','totalCorrect','insurance']){
  if(saneInt(v[k],k==='lives'?LIMIT:1e12))b[k]=v[k];
 }
 b.owned=Array.isArray(v.owned)?[...new Set(v.owned.filter(id=>BY_ID[id]))]:[];
 b.profile=b.owned.includes(v.profile)&&BY_ID[v.profile]?.kind==='profile'?v.profile:null;
 b.achievements=Array.isArray(v.achievements)?[...new Set(v.achievements.filter(x=>typeof x==='string'&&x.length<75))].slice(-200):[];
 b.history=Array.isArray(v.history)?v.history.filter(x=>x&&typeof x==='object').slice(-75):[];
 b.mastery={active:v.mastery?.active===true&&b.owned.includes('mastery'),progress:saneInt(v.mastery?.progress,5)?v.mastery.progress:0,
  awarded:Array.isArray(v.mastery?.awarded)?v.mastery.awarded.filter(x=>typeof x==='string').slice(-40):[]};
 b.recentDay=typeof v.recentDay==='string'?v.recentDay:'';
 b.created=Number.isFinite(v.created)?v.created:b.created;
 return b;
}
let state=normalize(safeRaw());
function commit(next,action){
 const n={...next,history:[...next.history,{action,at:Date.now(),balance:next.balance,pot:next.pot}].slice(-75)};
 try{const v=JSON.stringify(n);localStorage.setItem(KEY,v);if(localStorage.getItem(KEY)!==v)return false;state=n;window.dispatchEvent(new CustomEvent('bu-james-economy-change',{detail:{action}}));return true}catch(e){console.warn('[James TEST Economy] Cannot save',e);return false}
}
function freshLives(){
 if(state.lives>=LIMIT||!state.refillAt)return state;
 const now=Date.now();if(now<state.refillAt)return state;
 const gained=1+Math.floor((now-state.refillAt)/REFILL_MS),lives=Math.min(LIMIT,state.lives+gained);
 const next={...state,lives,refillAt:lives>=LIMIT?0:state.refillAt+gained*REFILL_MS};
 commit(next,'refill');return state;
}
const pad=n=>String(n).padStart(2,'0');
const day=()=>{const d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())};
function feedback(message,positive=false){
 let el=$('#bu-james-toast');
 if(!el){el=document.createElement('div');el.id='bu-james-toast';el.setAttribute('role','status');document.body.append(el)}
 el.textContent=message;el.classList.toggle('good',positive);
 el.classList.add('show');clearTimeout(feedback.timer);feedback.timer=setTimeout(()=>el.classList.remove('show'),3100);
 if(positive)try{window.BUPremiumSFX?.play?.('namePositive')}catch(_){}
}
function spend(cost,action,modify){
 freshLives();
 if(state.balance<cost){feedback('Need '+fmt(cost-state.balance)+' more TEST Insight Tokens. Earn them in Trivia.');return false}
 const next=modify({...state,balance:state.balance-cost});
 if(!next||!commit(next,action)){feedback('Could not save this purchase. No tokens spent.');return false}
 feedback('Unlocked! '+action,true);paint();return true;
}
function buy(id){
 const p=BY_ID[id];if(!p||state.owned.includes(id))return false;
 return spend(p.cost,'buy:'+id,s=>({...s,owned:[...s.owned,id],profile:p.kind==='profile'?id:s.profile}));
}
function equip(id){
 if(!state.owned.includes(id)||BY_ID[id]?.kind!=='profile')return false;
 const ok=commit({...state,profile:id},'equip:'+id);
 if(ok){feedback('Nameplate equipped',true);paint()}
 return ok;
}
function buyInsurance(){
 return spend(60,'buy:insurance',s=>({...s,insurance:Math.min(20,s.insurance+1)}));
}
function restoreLives(){
 freshLives();
 if(state.lives===LIMIT){feedback('Your five lives are already full.');return false}
 return spend(75,'buy:lives',s=>({...s,lives:LIMIT,refillAt:0}));
}
function cashOut(){
 if(!state.pot){feedback('Answer questions correctly to build a reward pot.');return false}
 const n=state.pot;
 if(!commit({...state,balance:state.balance+n,pot:0,chain:0,mastery:{...state.mastery,progress:0}},'bank:'+n)){feedback('Could not save payout; your pot is unchanged.');return false}
 feedback('Banked '+fmt(n)+' TEST Insight Tokens!',true);paint();return true;
}
const milestone=chain=>({3:25,5:50,10:110})[chain]||0;
function recordCorrect(){
 const chain=state.chain+1,amount=10+Math.min(30,chain*4),bonus=milestone(chain);
 const pot=state.pot+amount+bonus;
 const awards=new Set(state.achievements);
 let extra=0;
 if(chain===3||chain===5||chain===10)awards.add('streak:'+chain);
 const total=state.totalCorrect+1;
 // A genuine but deterministic surprise reward: each milestone is claimable once.
 if(total===7||total===17||total===35){
  const id='surprise:'+total;
  if(!awards.has(id)){extra=55+total*2;awards.add(id)}
 }
 const master={...state.mastery};
 let masterPrize=0;
 if(master.active){
  master.progress++;
  if(master.progress>=5){
   const claim=day();
   if(!master.awarded.includes(claim)){master.awarded=[...master.awarded,claim].slice(-40);masterPrize=120;awards.add('mastery:'+claim)}
   master.active=false;master.progress=0;
  }
 }
 const next={...state,chain,best:Math.max(state.best,chain),pot, totalCorrect:total,
  balance:state.balance+extra+masterPrize,achievements:[...awards],mastery:master};
 if(!commit(next,'correct:'+chain))return;
 if(masterPrize)feedback('MASTER CHALLENGE WON! +120 TEST tokens!',true);
 else if(extra)feedback('Surprise achievement! +'+extra+' TEST tokens!',true);
 else if(bonus)feedback('Streak milestone! +'+bonus+' to your at-risk pot!',true);
 else feedback('+'+amount+' in your reward pot · '+chain+' correct in a row',true);
 paint();
}
function recordWrong(){
 freshLives();
 const had=state.pot,protectedRun=state.insurance>0;
 const n={...state,lives:Math.max(0,state.lives-1),refillAt:state.lives===LIMIT?Date.now()+REFILL_MS:state.refillAt,
   insurance:Math.max(0,state.insurance-(protectedRun?1:0)),
   chain:protectedRun?state.chain:0,pot:protectedRun?state.pot:0,
   mastery:{...state.mastery,active:false,progress:0}};
 if(!commit(n,protectedRun?'wrong:insured':'wrong:lost:'+had))return;
 if(protectedRun)feedback('Streak Insurance saved your streak and pot! One life used.',true);
 else feedback('Wrong answer: '+fmt(had)+' unbanked tokens lost. One life used.');
 paint();
}
function nextRefill(){
 freshLives();if(!state.refillAt||state.lives===LIMIT)return 'Full';
 const n=Math.max(0,Math.ceil((state.refillAt-Date.now())/60000));
 return n+' min';
}
function listCards(){
 return PRODUCTS.map(p=>{
  const owned=state.owned.includes(p.id);
  const equipped=p.kind==='profile'&&state.profile===p.id;
  return '<article class="bu-james-item"><img src="'+esc(p.art)+'" alt="" loading="lazy">'+
   '<div class="bu-james-item-info"><small>'+esc(p.kind==='card'?'COLLECTIBLE CARD':p.kind==='profile'?'PROFILE UPGRADE':p.kind==='access'?'SPECIAL UNLOCK':'REWARD')+'</small>'+
   '<strong>'+esc(p.name)+'</strong><p>'+esc(p.desc)+'</p>'+
   (owned&&p.url?'<a href="'+esc(p.url)+'" target="_blank" rel="noopener noreferrer">Explore the Scripture ↗</a>':'')+
   '<button type="button" data-buj-action="'+(owned?(p.kind==='profile'?'equip':'owned'):'buy')+'" data-buj-id="'+p.id+'"'+(owned&&p.kind!=='profile'||equipped?' disabled':'')+'>'+
   (equipped?'Equipped':owned?(p.kind==='profile'?'Equip crest':'Unlocked'):'◈ '+fmt(p.cost)+' TEST tokens')+'</button></div></article>';
 }).join('');
}
function gameHeader(){
 return '<header class="bu-james-hero"><span>✦ JAMES’S RETURN CHALLENGES · TEST</span><h2>Every Answer Has Stakes</h2>'+
 '<p>Build a streak, risk a growing reward pot, or bank your winnings before a mistake. Use TEST Insight Tokens to unlock lasting prizes.</p>'+
 '<div class="bu-james-stats"><div><b>◈ '+fmt(state.balance)+'</b><small>TEST TOKENS</small></div>'+
 '<div><b>🔥 '+state.chain+'</b><small>CORRECT STREAK</small></div>'+
 '<div><b>♥ '+state.lives+'/5</b><small>LIVES · '+esc(nextRefill())+'</small></div></div>'+
 (state.profile?'<p class="bu-james-equipped">✦ Wearing: '+esc(BY_ID[state.profile]?.name||'')+'</p>':'')+'</header>';
}
function rewardHTML(){
 const bank=state.pot,master=state.mastery;
 return gameHeader()+
 '<section class="bu-james-panel"><div class="bu-james-eyebrow">RISK OR REWARD</div>'+
 '<h3>◈ '+fmt(bank)+' tokens at stake</h3>'+
 '<p>Correct answers grow the pot. One wrong answer loses the unbanked amount and ends the streak, unless you have Streak Insurance.</p>'+
 '<div class="bu-james-actions"><button data-buj-action="bank"'+(!bank?' disabled':'')+'>Bank '+fmt(bank)+' now</button>'+
 '<button data-buj-action="risk">Risk it · keep playing</button></div>'+
 '<small>Best streak: '+state.best+' · Total correct: '+state.totalCorrect+'. Milestones at 3, 5 and 10 correct answers.</small></section>'+
 '<section class="bu-james-panel"><div class="bu-james-eyebrow">STAY IN THE GAME</div>'+
 '<h3>Five Lives & Streak Protection</h3><p>Wrong Trivia answers cost one life. One life returns every 15 minutes; you can refill all five or insure your next mistake.</p>'+
 '<div class="bu-james-actions"><button data-buj-action="lives">Refill all lives · ◈75</button>'+
 '<button data-buj-action="insurance">Streak Insurance · ◈60</button></div>'+
 '<small>Owned insurance: '+state.insurance+' · A protected mistake still costs one life.</small></section>'+
 '<section class="bu-james-panel"><div class="bu-james-eyebrow">SPECIAL BIBLE CHALLENGE</div>'+
 '<h3>Mastery Gauntlet</h3><p>Unlock it once. Then get five Trivia answers correct in a row for a daily 120-token prize. A mistake ends that attempt.</p>'+
 (state.owned.includes('mastery')?'<button data-buj-action="mastery">Start Mastery Gauntlet'+(master.active?' · '+master.progress+'/5':'')+'</button>':
 '<button data-buj-action="buy" data-buj-id="mastery">Unlock for ◈240 TEST tokens</button>')+
 '<small>Won today: '+(master.awarded.includes(day())?'Yes':'Not yet')+'</small></section>'+
 '<section class="bu-james-panel"><div class="bu-james-eyebrow">SPEND TO UNLOCK</div><h3>My Prize Collection</h3>'+
 '<p>Bible Books access, character cards and collectible nameplates are permanent TEST unlocks.</p>'+
 '<div class="bu-james-products">'+listCards()+'</div></section>'+
 '<section class="bu-james-panel"><div class="bu-james-eyebrow">ACHIEVEMENTS</div><h3>Milestones & Surprises</h3><p>'+
 (state.achievements.length?state.achievements.slice(-10).reverse().map(x=>'<span class="bu-james-trophy">✦ '+esc(x.replace('streak:','Streak ').replace('surprise:','Surprise ').replace('mastery:','Mastery '))+'</span>').join(' '):'Your first streak achievement is waiting. Three correct answers in a row earns your first badge!')+
 '</p></section><p class="bu-james-disclaimer">TEST economy only: no real Insight Tokens, saved answers, LIVE purchases or progress are changed. Prices and rules may be tuned after player feedback.</p>';
}
function mountShop(){
 const root=$('#rewards'),scroller=root?.querySelector('.reward-scroll');if(!scroller)return;
 let target=$('#bu-james-rewards');
 if(!target){target=document.createElement('section');target.id='bu-james-rewards';target.setAttribute('aria-label','Streaks, lives, Bible rewards and collectibles');scroller.insertBefore(target,scroller.firstChild)}
 paintShop();
}
function paintShop(){
 const target=$('#bu-james-rewards');if(!target)return;
 if(!target.hidden&&target.contains(document.activeElement))return;
 target.innerHTML=rewardHTML();
}
function mountBar(){
 const trivia=$('#bu34-trivia'),body=$('#bu34-body');
 if(!trivia||!body||trivia.hidden)return;
 let bar=$('#bu-james-quiz-bar');
 if(!bar){bar=document.createElement('div');bar.id='bu-james-quiz-bar';bar.setAttribute('role','status');body.prepend(bar)}
 bar.innerHTML='<div class="bu-james-bar-top"><span>♥ '+state.lives+'/5</span><span>🔥 '+state.chain+' correct</span><span>◈ '+fmt(state.pot)+' at risk</span></div>'+
 '<div class="bu-james-bar-buttons"><button data-buj-action="bank"'+(!state.pot?' disabled':'')+'>Bank now</button>'+
 '<button data-buj-action="risk">Risk & continue</button>'+
 '<button data-buj-action="insurance">Insure · 60</button></div>';
}
function paint(){freshLives();mountShop();mountBar()}
function gateBooks(e){
 if(!e.target?.closest?.('#home-books')||state.owned.includes('books'))return false;
 e.preventDefault();e.stopImmediatePropagation();e.stopPropagation();
 showBookGate();return true;
}
function showBookGate(){
 const old=$('#bu-james-gate');old?.remove();
 const div=document.createElement('div');div.id='bu-james-gate';div.setAttribute('role','dialog');div.setAttribute('aria-modal','true');div.setAttribute('aria-label','Unlock Bible Books');
 div.innerHTML='<div class="bu-james-gate-card"><div class="bu-james-eyebrow">SPECIAL MODE · TEST</div>'+
 '<img src="bible-book-art/01_genesis.webp" alt=""><h2>Unlock Bible Books</h2>'+
 '<p>James’s challenge: save Insight Tokens to open this mode. This TEST unlock costs 180 TEST tokens and stays yours.</p>'+
 '<strong>◈ '+fmt(state.balance)+' TEST tokens available</strong>'+
 '<div class="bu-james-actions"><button data-buj-action="unlock-books">Unlock · ◈180</button>'+
 '<button data-buj-action="close">Not now</button></div></div>';
 document.body.append(div);
 div.querySelector('button').focus();
}
function openBooksAfterUnlock(){
 $('#bu-james-gate')?.remove();
 const button=$('#home-books');
 if(button){setTimeout(()=>button.click(),0)}
}
function startMastery(){
 if(!state.owned.includes('mastery')){feedback('Unlock Mastery Gauntlet first.');return}
 if(!commit({...state,chain:0,pot:0,mastery:{...state.mastery,active:true,progress:0}},'mastery:start'))return;
 paint();feedback('Mastery Gauntlet! Five correct answers in a row.',true);
 try{if(typeof focusHome==='function')focusHome();$('#home-trivia')?.click();setTimeout(()=>{try{if(typeof bu34Start==='function')bu34Start('quick')}catch(_){}},150)}catch(_){}
}
function onAction(e){
 const target=e.target?.closest?.('[data-buj-action]');
 if(!target)return false;
 e.preventDefault();e.stopImmediatePropagation();e.stopPropagation();
 const id=target.dataset.bujId,action=target.dataset.bujAction;
 if(action==='buy')buy(id);
 else if(action==='equip')equip(id);
 else if(action==='bank')cashOut();
 else if(action==='risk')feedback('Keep going! One mistake will cost your unbanked pot.');
 else if(action==='insurance')buyInsurance();
 else if(action==='lives')restoreLives();
 else if(action==='mastery')startMastery();
 else if(action==='unlock-books'){if(buy('books'))openBooksAfterUnlock()}
 else if(action==='close')$('#bu-james-gate')?.remove();
 paint();return true;
}
let lastQuiz=null,lastQuestionKey='',lastAnsweredAt=0,answerCount=0;
function inspectQuiz(){
 try{if($('#bu34-trivia')?.hidden)return null;
  const q=typeof bu34Quiz!=='undefined'?bu34Quiz:null;
  if(!q||q.answered!==false||!q.items?.[q.step])return null;
  return q}catch(_){return null}
}
function onQuizAnswer(e){
 const button=e.target?.closest?.('#bu34-trivia #bu34-body [data-answer]');
 if(!button||button.disabled)return;
 const q=inspectQuiz();if(!q)return;
 freshLives();
 if(state.lives<=0){
  e.preventDefault();e.stopImmediatePropagation();e.stopPropagation();
  feedback('Out of lives! Next life in '+nextRefill()+'. Refill in the Rewards room.');paint();return;
 }
 const answer=Number(button.dataset.answer);
 if(!Number.isInteger(answer))return;
 const key=String(q.step)+':'+String(q.items[q.step]?.q||'');
 if(q!==lastQuiz){lastQuiz=q;lastQuestionKey=''}
 if(lastQuestionKey===key)return;
 const correct=Number(q.items[q.step].correct)===answer;
 lastQuestionKey=key;
 if(correct)recordCorrect();else recordWrong();
 answerCount++;
 // Do not cancel the real answer: native scoring and teaching continue.
 setTimeout(paint,120);
}
function capture(e){
 if(e.target?.closest?.('#bu-james-gate')&&onAction(e))return;
 if(onAction(e))return;
 if(gateBooks(e))return;
 onQuizAnswer(e);
}
function start(){
 if(!$('#rewards')||!$('#home-books'))return false;
 // Capture on the document, before native home/answer click listeners bubble.
 document.addEventListener('click',capture,true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape')$('#bu-james-gate')?.remove()});
 const host=$('#rewards .reward-scroll'),quiz=$('#bu34-body');
 if(host)new MutationObserver(()=>{if(!$('#bu-james-rewards'))mountShop()}).observe(host,{childList:true});
 if(quiz)new MutationObserver(()=>{if(!$('#bu-james-quiz-bar'))mountBar()}).observe(quiz,{childList:true});
 window.addEventListener('pageshow',paint);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)paint()});
 setInterval(()=>{if(!document.hidden&&state.lives<LIMIT)paint()},30000);
 paint();return true;
}
function boot(){if(start())return;let tries=0;const id=setInterval(()=>{if(start()||++tries>50)clearInterval(id)},200)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.BUJamesReturnLoopV1=Object.freeze({
 version:'1.0.0-test',storageKey:KEY,
 inspect:()=>({balance:state.balance,lives:state.lives,refillAt:state.refillAt,pot:state.pot,chain:state.chain,best:state.best,
  totalCorrect:state.totalCorrect,insurance:state.insurance,owned:[...state.owned],achievements:[...state.achievements],
  mastery:{...state.mastery},answerCount}),
 testActions:Object.freeze({buy,bank:cashOut,insurance:buyInsurance,refill:restoreLives,correct:recordCorrect,wrong:recordWrong,mastery:startMastery})
});
})();

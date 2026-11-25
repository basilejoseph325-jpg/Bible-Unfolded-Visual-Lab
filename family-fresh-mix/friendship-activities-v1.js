/* Native Fresh Mix social activities. Family-only prediction points; no economy API.
 * All opinions, faith reflections and appreciation are voluntary and unscored. */
(()=>{'use strict';
const api=window.BUFreshMixNative,bank=window.BUFriendshipPrompts,esc=api.escape;
const titles={beyond:'Beyond the Surface',paradise:'Imagine the New World',predict:'How Well Do You Know Me?',faith:'My Story of Faith',common:'Find Something in Common',build:'Build One Another Up'};
const types=Object.keys(titles),prefix='friendship-';
const previousMix=bu3829MixInDiscussions;
bu3829MixInDiscussions=function(list,minutes){
 const flow=previousMix(list,minutes);
 if(bu35Setup.order==='classic'||bu35Setup.quick!=='session')return flow;
 const used=new Set();
 return flow.map(p=>{
  if(p!=='think')return p;
  let index=bu3825Draw('friendship-activities-v1',types.length);
  while(used.has(index))index=bu3825Draw('friendship-activities-v1',types.length);
  used.add(index);return prefix+types[index];
 });
};
function session(g){
 if(!g.friendshipV1){
  const last=Number(bu3825Variety.friendshipPartnerOffset)||0;
  const offset=last%(g.people.length-1)+1;
  bu3825Variety.friendshipPartnerOffset=offset;bu3825Store();
  g.friendshipV1={partnerOffset:offset,turns:{},used:[]};bu35Save();
 }
 return g.friendshipV1;
}
function current(g,type){
 const s=session(g),key=g.phase+':'+g.turn;
 if(!s.turns[key]){
  const pool=bank[type],used=new Set(s.used);
  let id;for(let n=0;n<pool.length;n++){const candidate=pool[bu3825Draw('friendship-prompts:'+type,pool.length)];if(!used.has(candidate.id)){id=candidate.id;break}}
  if(!id)return null;
  s.used.push(id);s.turns[key]={id,stage:'cover',chosen:null,guess:null,done:false};bu35Save();
 }
 return s.turns[key];
}
function advance(g,t){
 if(bu35Game!==g||!t||t.advanced)return;
 t.advanced=true;g.turn++;g.handOff=true;
 // Unscored social turns never qualify a session for a gameplay reward.
 if(g.turn>=g.people.length)bu35NextPhase();else{bu35Save();bu35Render()}
}
function cover(g){
 if(!g||!bu35Phase().startsWith(prefix))return;
 const state=g.friendshipV1?.turns?.[g.phase+':'+g.turn];
 if(state&&!state.done){state.stage='cover';bu35Save()}
}
const previousOpen=bu35Open;
bu35Open=function(...args){if(bu35Game)cover(bu35Game);return previousOpen(...args)};
// Guard private setup and predictions whenever the app is backgrounded or left.
function conceal(){if(bu35Game){cover(bu35Game);if(bu35Visible()&&bu35View==='game')bu35Render()}}
window.addEventListener('pagehide',conceal);
document.addEventListener('visibilitychange',()=>{if(document.hidden)conceal()});
const previousHub=bu35Hub;bu35Hub=function(){cover(bu35Game);return previousHub()};
function render(body,g,type){
 const t=current(g,type);if(!t){api.frame(body,g,titles[type],'<p>All available prompts have been explored.</p><button id="social-exhausted" class="bu35-btn">Continue →</button>');body.querySelector('button#social-exhausted').onclick=bu35NextPhase;return}
 const q=bank[type].find(q=>q.id===t.id)||bank.legacy?.[t.id],s=session(g),partner=(g.turn+s.partnerOffset)%g.people.length;
 const target=esc(g.people[g.turn]),other=esc(g.people[partner]),prediction=type==='predict';
 let content='';
 const hint=type==='paradise'?"These are personal hopes, not details the Bible promises. It's fine to imagine, say you don't know, or pass.":type==='build'?"Keep it sincere. If you've just met, a welcoming word is enough. No one has to give or receive a compliment.":type==='common'?"Explore together. Different preferences are welcome too—there's no need to force a match.":"Share only what feels comfortable. Listening or passing is welcome.";
 if(t.done){
  content=`<div class="bu35-card"><h2>${prediction&&!t.skipped?'The reveal':t.skipped?'No problem—let’s move on':'Thanks for sharing this moment'}</h2>${prediction&&!t.skipped?`<p>${target} chose <strong>${esc(q.choices[t.chosen])}</strong>.</p><p>${other} predicted <strong>${esc(q.choices[t.guess])}</strong>.</p><p>${t.guess===t.chosen?'A match! One session point for the prediction.':'A new detail to know about each other! No points this time.'}</p>`:'<p>Personal answers and appreciation have no right or wrong score.</p>'}<button id="social-next" class="bu35-btn">Next turn →</button></div>`;
 }else if(t.stage==='cover'){
  const recipient=prediction&&t.chosen!==null?other:target;
  content=`<div class="bu35-turn"><span class="bu35-kicker">${prediction?'PRIVATE HANDOFF':'YOUR TURN'}</span><h2>${recipient}</h2><p>${prediction?(t.chosen===null?'Hold the phone privately. Choose an answer, then pass it with the choices hidden.':'Take the phone. The other player’s choice stays hidden until the reveal.'):`${type==='common'||type==='build'?'With '+other+'. ':''}One friendly invitation. You can always pass.`}</p><button id="social-ready" class="bu35-btn">${prediction?'Only I can see the screen →':"I'm ready →"}</button></div>`;
 }else{
  content=`<div class="bu35-card"><span class="bu35-kicker">${prediction?(t.chosen===null?target+' · CHOOSE PRIVATELY':other+' · MAKE A PREDICTION'):target+((type==='common'||type==='build')?' + '+other:'')}</span><h2>${esc(q.text)}</h2>${prediction?`<p>${t.chosen===null?'Choose what suits you today. There’s no better or worse answer.':'Which choice do you think the other player selected?'}</p><div class="social-choices">${q.choices.map((c,i)=>`<button class="bu35-outline" data-social-choice="${i}">${esc(c)}</button>`).join('')}</div>`:`<p>${esc(hint)}</p><button id="social-shared" class="bu35-btn">We've shared or listened →</button>`}</div>`;
 }
 content+=(!t.done?'<button class="bu35-soft" id="social-skip">Skip this question · no penalty</button>':'')+(prediction?bu35ScoreStrip():'<p class="bu35-note">No scoring · Everyone gets a turn</p>');
 api.frame(body,g,titles[type],content);
 const valid=()=>bu35Game===g&&current(g,type)===t&&!t.done;
 if(t.done){body.querySelector('#social-next').onclick=()=>advance(g,t);return}
 body.querySelector('#social-skip').onclick=()=>{if(!valid())return;t.done=true;t.skipped=true;t.chosen=null;t.guess=null;bu35Save();bu35Render()};
 if(t.stage==='cover'){body.querySelector('#social-ready').onclick=()=>{if(!valid())return;t.stage='active';bu35Save();bu35Render()};return}
 if(!prediction){body.querySelector('#social-shared').onclick=()=>{if(!valid())return;t.done=true;bu35Save();bu35Render()};return}
 body.querySelectorAll('[data-social-choice]').forEach(button=>button.onclick=()=>{
  if(!valid()||t.stage!=='active')return;
  const choice=+button.dataset.socialChoice;if(!Number.isInteger(choice)||choice<0||choice>=q.choices.length)return;
  if(t.chosen===null){t.chosen=choice;t.stage='cover';bu35Save();bu35Render();return}
  t.guess=choice;t.done=true;if(t.chosen===choice)g.scores[partner]++;
  bu35Save();bu35Render();
 });
}
for(const type of types)api.register(prefix+type,{rounds:()=>1,render:(body,g)=>render(body,g,type)});
})();

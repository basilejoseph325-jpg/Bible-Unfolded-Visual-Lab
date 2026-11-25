/* TEST: additive native Family Worship phases. Uses the existing bu35Game save,
 * player/score arrays, navigation and audio owner; never writes a wallet. */
(()=>{'use strict';
const phases=new Map(),esc=bu35Escape;
const topicById={noah:'noah',david:'david',hannah:'samuel',lydia:'acts',bezalel:'exodus',abigail:'david',bethlehem:'jesusbirth',eden:'eden',jericho:'joshua',carmel:'elijah',joppa:'acts',troas:'acts',creation:'genesis',pentecost:'pentecost','red-sea':'exodus',furnace:'daniel',transfiguration:'jesusministry',writing:'daniel'};
const priorPlaylist=bu3825Playlist;
bu3825Playlist=function(topic,minutes,style){
 const result=priorPlaylist(topic,minutes,style);
 // Keep the established number of activities; Relay has the same weight as
 // each original activity. Classic Guided and existing saved playlists stay intact.
 if(Math.random()<((minutes>=30?5:minutes>=20?4:3)/6)){
  const slots=result.map((p,i)=>BU3825_ACTIVITIES.includes(p)?i:-1).filter(i=>i>=0);
  result[slots[Math.floor(Math.random()*slots.length)]]='cluerelay';
 }
 return result;
};
const priorRounds=bu35Rounds;
bu35Rounds=function(){const handler=phases.get(bu35Game&&bu35Phase());return handler?.rounds?handler.rounds(bu35Game):priorRounds()};
const priorRender=bu35RenderGame;
bu35RenderGame=function(body){
 const g=bu35Game,handler=g&&phases.get(bu35Phase());
 if(!handler)return priorRender(body);
 handler.render(body,g);
};
function frame(body,g,title,content){
 body.innerHTML=`<section class="bu-fresh-native" aria-label="${esc(title)}"><div class="bu35-statrow"><span>${esc(BU35_TOPICS[g.topic]?.name||'Bible session')}</span><span>${g.minutes} min · ${g.people.length} players</span></div><div class="bu35-progress"><i style="width:${Math.floor(g.phase/Math.max(1,g.phases.length-1)*100)}%"></i></div><span class="bu35-kicker">${esc(title)} · ${g.phase+1}/${g.phases.length}</span>${content}<button class="bu35-soft" id="fresh-leave">Save & leave</button></section>`;
 body.querySelector('#fresh-leave').onclick=()=>{bu35Save();bu35Hub()};
}
function bank(g){
 const all=window.BUClueRelayQuestions;
 const keys=BU3826_COLLECTIONS[g.topic]?.keys||[g.topic];
 const matches=all.filter(q=>keys.includes(topicById[q.id.slice(3)]));
 const requested={beginner:'easy',intermediate:'medium',advanced:'challenging',expert:'challenging'}[g.difficulty]||'medium';
 const order=rows=>bu3825Shuffle(rows.filter(q=>q.difficulty===requested)).concat(bu3825Shuffle(rows.filter(q=>q.difficulty!==requested)));
 // Whole Bible fallback is explicitly labeled per question, never silently
 // described as belonging to a selected account or level.
 return order(matches).concat(order(all.filter(q=>!matches.includes(q)))).map(q=>({...q,outside:!matches.includes(q),near:q.difficulty!==requested}));
}
function state(g){
 if(!g.nativeRelay){
  const pool=bank(g),recent=new Set(bu3825Variety.nativeRelayRecent||[]);
  const sorted=pool.filter(q=>!recent.has(q.id)).concat(pool.filter(q=>recent.has(q.id)));
  const total=g.people.length*(g.minutes>=60?3:g.minutes>=45?2:1);
  // Bank capacity is 18, exactly enough for the largest native session.
  const questions=sorted.slice(0,Math.min(total,pool.length));
  g.nativeRelay={questions,turns:{}};bu35Save();
 }
 return g.nativeRelay;
}
function turn(g){const s=state(g),n=bu35TurnNumber();if(!s.turns[n]){s.turns[n]={clue:0,done:false,approved:false};bu35Save()}return s.turns[n]}
function remember(q){const list=bu3825Variety.nativeRelayRecent||[];bu3825Variety.nativeRelayRecent=[q.id,...list.filter(id=>id!==q.id)].slice(0,12);bu3825Store()}
function render(body,g){
 const s=state(g),n=bu35TurnNumber(),q=s.questions[n];
 if(!q){frame(body,g,'Bible Clue Relay','<h2>You explored every available clue!</h2><button class="bu35-btn" id="relay-exhausted">Continue session →</button>');body.querySelector('#relay-exhausted').onclick=bu35NextPhase;return}
 const t=turn(g),name=esc(g.people[g.turn]);
 let content;
 if(g.handOff)content=`<div class="bu35-turn"><span class="bu35-kicker">PASS THE PHONE</span><h2>${name}</h2><p>Three clues. Guess early for 3, 2 or 1 session points.</p><button class="bu35-btn" id="relay-ready">I'm ready →</button></div>`;
 else if(t.done)content=`<div class="bu35-card"><h2>${esc(q.answer)}</h2><p>${t.points?`${name} earned ${t.points} session point${t.points===1?'':'s'}.`:'Thanks for trying—here’s the discovery!'}</p><p>${esc(q.explanation)}</p>${q.sources.map(s=>`<a class="bu35-scripture" target="_blank" rel="noopener noreferrer" href="${esc(s.url)}">${esc(s.reference)} · JW.org ↗</a>`).join('')}<button class="bu35-btn" id="relay-next">Next turn →</button></div>`;
 else content=`<div class="bu35-card"><span class="bu35-kicker">${name} · CLUE ${t.clue+1} OF 3</span><p class="bu35-muted">${q.outside?'Wider Bible question · ':''}${q.near?'Nearby challenge level · ':''}${esc(q.difficulty)}</p><h2>${esc(q.clues[t.clue])}</h2><form id="relay-form"><label class="bu35-label" for="relay-guess">Your guess</label><input id="relay-guess" class="bu35-select" maxlength="80" autocomplete="off" enterkeyhint="go"><p id="relay-feedback" role="status">${t.clue?'Not that one. Try this next clue.':''}</p><button class="bu35-btn" type="submit">Check answer</button></form><button class="bu35-soft" id="relay-family">We answered aloud</button>${t.approved?'<p>Everyone agrees the spoken answer matches?</p><button class="bu35-outline" id="relay-confirm">Confirm family-approved answer</button><button class="bu35-soft" id="relay-cancel">Keep guessing</button>':''}</div>`;
 frame(body,g,'Bible Clue Relay',content+bu35ScoreStrip());
 if(g.handOff){body.querySelector('#relay-ready').onclick=()=>{g.handOff=false;remember(q);bu35Save();bu35Render()};return}
 if(t.done){body.querySelector('#relay-next').onclick=()=>{if(bu35Game!==g||bu35TurnNumber()!==n||!t.done)return;bu35AfterTurn()};return}
 function settle(correct){if(bu35Game!==g||bu35TurnNumber()!==n||t.done||g.handOff)return;t.done=true;t.points=correct?3-t.clue:0;t.approved=false;g.scores[g.turn]+=t.points;g.attempts[g.turn]++;if(correct)g.corrects[g.turn]++;bu35Save();bu35Render()}
 body.querySelector('#relay-form').onsubmit=e=>{e.preventDefault();if(t.done||bu35Game!==g||bu35TurnNumber()!==n)return;const value=body.querySelector('#relay-guess').value;const normalize=v=>window.BUClueRelayRules.normalize(v).replace(/^the /,'');if(!normalize(value)){body.querySelector('#relay-feedback').textContent='Type a guess first. You still have this clue.';return}const correct=[q.answer,...q.aliases].some(a=>normalize(a)===normalize(value));if(correct||t.clue===2)settle(correct);else{t.clue++;t.approved=false;bu35Save();bu35Render()}};
 body.querySelector('#relay-family').onclick=()=>{t.approved=true;bu35Save();bu35Render()};
 if(t.approved){body.querySelector('#relay-confirm').onclick=()=>settle(true);body.querySelector('#relay-cancel').onclick=()=>{t.approved=false;bu35Save();bu35Render()}}
}
phases.set('cluerelay',{render});
window.BUFreshMixNative=Object.freeze({register:(id,handler)=>{if(phases.has(id))throw Error('Duplicate Fresh Mix activity');phases.set(id,handler)},frame,escape:esc});
})();

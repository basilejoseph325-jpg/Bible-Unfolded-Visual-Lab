/* Standalone preview rules. Relay points are local to this in-memory game. */
(function(root){'use strict';
const normalize=value=>String(value??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’'ʹ·]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
function shuffle(list,random){const out=[...list];for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));if(j<0||j>i)throw Error('Invalid random source');[out[i],out[j]]=[out[j],out[i]];}return out;}
function create(bank,names,roundsPerPlayer=3,random=Math.random,previous=[]){
 if(!Array.isArray(names)||names.length<2||names.length>6)throw Error('Choose 2–6 players.');
 const players=names.map((name,i)=>({name:String(name).trim()||'Player '+(i+1),score:0}));
 if(players.some(p=>p.name.length>24)||new Set(players.map(p=>normalize(p.name))).size!==players.length)throw Error('Use different names, up to 24 characters each.');
 if(![2,3].includes(roundsPerPlayer))throw Error('Choose two or three rounds per player.');
 const total=players.length*roundsPerPlayer;if(bank.length<total)throw Error('Not enough questions.');
 const difficulties=shuffle(['easy','medium','challenging'],random);
 const pools=Object.fromEntries(difficulties.map(d=>[d,shuffle(bank.filter(q=>q.difficulty===d),random)]));
 // Rotate difficulty by seat and turn: three turns give every player one of
 // each difficulty; two turns give two different difficulties.
 const questions=[];
 for(let n=0;n<total;n++){
  const difficulty=difficulties[(n%players.length+Math.floor(n/players.length))%3];
  const question=pools[difficulty].pop();if(!question)throw Error('The difficulty mix is incomplete.');questions.push(question);
 }
 if(questions[0].id===previous[0]){
  const other=questions.findIndex((q,i)=>i>0&&q.difficulty===questions[0].difficulty);
  if(other>0)[questions[0],questions[other]]=[questions[other],questions[0]];
  else{const replacement=pools[questions[0].difficulty].pop();if(replacement)questions[0]=replacement;}
 }
 return {players,questions,roundsPerPlayer,round:0,clue:0,phase:'handoff',result:null};
}
const active=game=>game.round%game.players.length;
function begin(game){if(game.phase!=='handoff')return false;game.phase='guess';return true;}
function guess(game,value){
 if(game.phase!=='guess')return {ignored:true};
 const answer=normalize(value).replace(/^the /,'');if(!answer)return {error:'Type a guess first. You still have this clue.'};
 const question=game.questions[game.round],correct=[question.answer,...question.aliases].some(a=>normalize(a).replace(/^the /,'')===answer);
 if(correct||game.clue===2){
  const points=correct?3-game.clue:0;game.players[active(game)].score+=points;
  game.result={correct,points,clue:game.clue+1,player:active(game)};game.phase='result';return {...game.result};
 }
 game.clue++;return {correct:false,nextClue:game.clue+1};
}
// A family may judge a spoken, abbreviated, or misspelled answer together.
// Only the active guessing turn can be approved; this is an optional honor rule.
function familyApprove(game){
 if(game.phase!=='guess')return {ignored:true};
 const points=3-game.clue;
 game.players[active(game)].score+=points;
 game.result={correct:true,points,clue:game.clue+1,player:active(game),familyApproved:true};
 game.phase='result';return {...game.result};
}
function next(game){
 if(game.phase!=='result')return false;
 game.round++;game.clue=0;game.result=null;game.phase=game.round===game.questions.length?'complete':'handoff';return true;
}
function winners(game){if(game.phase!=='complete')return [];const best=Math.max(...game.players.map(p=>p.score));return game.players.filter(p=>p.score===best);}
const api=Object.freeze({normalize,shuffle,create,active,begin,guess,familyApprove,next,winners});
if(typeof module==='object'&&module.exports)module.exports=api;else root.BUClueRelayRules=api;
})(typeof window==='object'?window:globalThis);

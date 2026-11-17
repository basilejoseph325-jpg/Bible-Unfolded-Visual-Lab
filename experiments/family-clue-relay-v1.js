/* Standalone DOM controller. No shared game APIs, storage, audio or navigation. */
(()=>{'use strict';
const rules=window.BUClueRelayRules,bank=window.BUClueRelayQuestions;
const screen=document.getElementById('screen'),subtitle=document.getElementById('subtitle'),dialog=document.getElementById('restart-dialog');
let game=null,previous=[],setupNames=['Player 1','Player 2'],setupRounds=3;
const node=(tag,text,className)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;};
function button(text,id,action,className='gold'){const el=node('button',text,className);el.type='button';el.id=id;el.addEventListener('click',action);return el;}
function announce(text){document.getElementById('announcement').textContent=text;}
function focusScreen(){screen.focus({preventScroll:true});}
// Scroll only inside the clue column. WebKit may complete text wrapping
// one frame after the form rerenders, especially on 320px screens.
function showNewestClue(area){
 const latest=area.lastElementChild;
 const align=()=>{
  if(!area.isConnected||area.lastElementChild!==latest)return;
  area.scrollTop=area.scrollHeight;
  const item=latest.getBoundingClientRect(),container=area.getBoundingClientRect();
  if(item.bottom>container.bottom-2)
   area.scrollTop+=Math.ceil(item.bottom-container.bottom+4);
 };
 align();
 requestAnimationFrame(()=>{align();requestAnimationFrame(align);});
}
function clear(){screen.replaceChildren();}
function setup(){
 clear();document.getElementById('relay').dataset.phase='setup';subtitle.textContent='Three clues. One discovery. Everyone gets a turn!';
 const area=node('div',undefined,'scroll-area'),paper=node('form',undefined,'paper');paper.id='setup-form';
 const intro=node('p',undefined,'setup-intro');intro.append(node('strong','Pass the phone. Follow the clues!'),node('span','Guess a Bible character, place, or event. A correct guess earns 3 points on clue 1, 2 on clue 2, or 1 on clue 3. A miss unlocks the next clue.'));paper.append(intro);
 const row=node('div',undefined,'form-row'),countLabel=node('label','Players'),count=node('select');count.id='player-count';for(let n=2;n<=6;n++){const option=node('option',String(n));option.value=n;option.selected=n===setupNames.length;count.append(option);}countLabel.append(count);
 const roundsLabel=node('label','Turns each'),rounds=node('select');rounds.id='rounds-each';for(const n of [2,3]){const option=node('option',String(n));option.value=n;option.selected=n===setupRounds;rounds.append(option);}roundsLabel.append(rounds);row.append(countLabel,roundsLabel);paper.append(row);
 const names=node('div');names.id='player-names';paper.append(names);
 const paintNames=()=>{names.replaceChildren();setupNames.forEach((name,i)=>{const label=node('label','Player '+(i+1)),input=node('input');input.id='player-'+i;input.name='player-'+i;input.maxLength=24;input.value=name;input.autocomplete='off';input.addEventListener('input',()=>setupNames[i]=input.value);label.append(input);names.append(label);});};paintNames();
 count.addEventListener('change',()=>{setupNames=Array.from({length:Number(count.value)},(_,i)=>setupNames[i]??'Player '+(i+1));paintNames();});
 const note=node('p','Everyone gets the same number of turns. Play near each other, and pass the phone before reading a new clue.','fine'),error=node('p','', 'error');error.id='setup-error';error.setAttribute('role','alert');paper.append(note,error);
 paper.addEventListener('submit',event=>{event.preventDefault();setupRounds=Number(rounds.value);try{game=rules.create(bank,setupNames,setupRounds,Math.random,previous);previous=game.questions.map(q=>q.id);render();}catch(e){error.textContent=e.message;}});
 const start=node('button','Start the relay','gold');start.type='submit';start.id='start-relay';start.style.width='100%';start.style.flex='none';start.setAttribute('form','setup-form');area.append(paper);screen.append(area,start,node('p','Standalone preview · Relay points only · No saved progress or shared rewards.','fine'));focusScreen();
}
function scoreboard(){
 const board=node('div',undefined,'scoreboard');board.setAttribute('aria-label','Relay scoreboard');
 game.players.forEach((player,i)=>{const item=node('div',undefined,'score'+(i===rules.active(game)&&game.phase!=='complete'?' current':''));item.dataset.player=i;item.append(node('span',player.name),node('b',String(player.score)));item.setAttribute('aria-label',player.name+': '+player.score+' relay '+(player.score===1?'point':'points'));board.append(item);});return board;
}
function status(){
 const row=node('div',undefined,'round-line');row.append(node('strong','Round '+(game.round+1)+' of '+game.questions.length),button('Restart','restart-relay',()=>dialog.showModal(),'quiet'));screen.append(row);
 const progress=node('progress');progress.max=game.questions.length;progress.value=game.round;progress.setAttribute('aria-label','Rounds completed');screen.append(progress,scoreboard());
}
function restart(){dialog.close();game=rules.create(bank,game.players.map(p=>p.name),game.roundsPerPlayer,Math.random,previous);previous=game.questions.map(q=>q.id);render();}
function render(){
 clear();document.getElementById('relay').dataset.phase=game.phase;if(game.phase==='complete'){finish();return;}
 const player=game.players[rules.active(game)],q=game.questions[game.round];subtitle.textContent=player.name+"'s turn";status();
 if(game.phase==='handoff'){
  const card=node('div',undefined,'paper handoff scroll-area');card.append(node('span','Pass the phone to','badge'),node('h2',player.name),node('p',"The next clues are yours. Ready for a new discovery?"));screen.append(card,button("I'm ready",'begin-round',()=>{rules.begin(game);render();}));announce('Pass the phone to '+player.name);focusScreen();return;
 }
 if(game.phase==='guess'){
  const row=node('div',undefined,'round-line');row.append(node('strong',q.category+' · '+q.difficulty),node('span',(3-game.clue)+' '+(game.clue===2?'point':'points')+' available'));screen.append(row);
  const area=node('div',undefined,'scroll-area clues');area.id='clue-list';
  q.clues.slice(0,game.clue+1).forEach((text,i)=>{const card=node('article',undefined,'paper clue'+(i<game.clue?' old':''));card.append(node('span','CLUE '+(i+1),'tag'),node('p',text));area.append(card);});screen.append(area);
  const form=node('form',undefined,'guess-form'),label=node('label',player.name+', your guess'),input=node('input');input.id='guess';input.maxLength=80;input.autocomplete='off';input.autocapitalize='words';input.spellcheck=false;label.htmlFor='guess';
  const controls=node('div',undefined,'guess-row'),submit=node('button','Guess','gold');submit.id='submit-guess';submit.type='submit';controls.append(input,submit);const error=node('p','','error');error.id='guess-error';error.setAttribute('role','alert');form.append(label,controls,error);
  form.addEventListener('submit',event=>{event.preventDefault();const result=rules.guess(game,input.value);if(result.error){error.textContent=result.error;input.focus();return;}render();if(result.nextClue){document.getElementById('guess-error').textContent='Not that one. Try the next clue.';announce("Not that one. Clue "+result.nextClue+". "+q.clues[game.clue]);document.getElementById('guess').focus({preventScroll:true});}});
  screen.append(form);showNewestClue(area);announce('Clue '+(game.clue+1)+'. '+q.clues[game.clue]);focusScreen();return;
 }
 const result=game.result,wrap=node('div',undefined,'result-wrap'),scroll=node('div',undefined,'result-scroll'),copy=node('div',undefined,'result-copy');copy.id='round-result';
 copy.append(node('h2',result.correct?'You found it!':"Here's the discovery"),node('p',q.answer,'answer'),node('p',result.correct?player.name+' earns '+result.points+' relay '+(result.points===1?'point.':'points.'):"No points this round. Let's see what we can learn."),node('p',q.explanation));
 for(const source of q.sources){const link=node('a',source.reference+' · Read on JW.org');link.href=source.url;link.target='_blank';link.rel='noopener noreferrer';copy.append(link);}
 const next=button(game.round===game.questions.length-1?'Final scores':'Next player', 'next-round',()=>{rules.next(game);render();},'wax');next.setAttribute('aria-label',game.round===game.questions.length-1?'See final scores':'Continue to the next player');scroll.append(copy,next);wrap.append(scroll);screen.append(wrap);announce((result.correct?'Correct. '+result.points+' points. ':'Answer revealed. ')+q.answer);focusScreen();
}
function finish(){
 subtitle.textContent='A relay full of discoveries!';
 const area=node('div',undefined,'scroll-area'),card=node('div',undefined,'paper winner'),wins=rules.winners(game),best=wins[0].score;
 const laurel=node('img');laurel.src='../assets/ui/daily-complete-laurel-v1.svg';laurel.alt='';card.append(laurel);
 const title=best===0?'A shared finish!':wins.length>1?'A shared win!':wins[0].name+' wins!';card.append(node('h2',title));
 if(best>0&&wins.length>1)card.append(node('p',wins.map(p=>p.name).join(', ')+' · '+best+' '+(best===1?'point':'points')+' each'));
 card.append(node('p',best===0?"No points this time, but you've explored some great Bible accounts. Ready for another try?":'Well played, everyone! Each clue was another chance to discover something together.'));
 const list=node('ol',undefined,'standings');[...game.players].sort((a,b)=>b.score-a.score).forEach(player=>{const row=node('li');row.append(node('span',player.name),node('b',player.score+' '+(player.score===1?'point':'points')));list.append(row);});card.append(list);area.append(card);screen.append(area);
 const actions=node('div',undefined,'actions');actions.append(button('Play again','play-again',restart),button('Change players','change-players',()=>{setupNames=game.players.map(p=>p.name);setup();},'secondary'));screen.append(actions);announce(title);focusScreen();
}
document.getElementById('cancel-restart').addEventListener('click',()=>dialog.close());
document.getElementById('confirm-restart').addEventListener('click',restart);
function resize(){document.documentElement.style.setProperty('--app-height',(window.visualViewport?.height??window.innerHeight)+'px');}
window.visualViewport?.addEventListener('resize',resize);window.addEventListener('resize',resize);resize();setup();
})();

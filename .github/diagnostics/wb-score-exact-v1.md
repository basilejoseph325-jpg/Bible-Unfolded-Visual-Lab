# Word Builder exact source diagnostic\n--SNIP--\n\n## CORE function wb36GameUI\n--SNIP--\n`).join(' · ');
 return `<div class="wb380-preview" role="status"><strong>Potential +${check.points} points</strong><small>${item}${check.allTilesBonus?' · +25 seven-tile bonus':''}</small></div>`;
}
function wb36GameUI(b){const g=wb36Game;if(!g){wb36Home();return}if(g.finished){wb36ResultsUI(b);return}
 if(g.handoff){b.innerHTML=`${wb36Scores(g)}<div class="wb36-card wb36-handoff"><span class="wb36-sub">PASS THE PHONE · TURN ${g.turn+1}/${g.maxTurns}</span><h2>${WB36_ESC(g.players[wb36PlayerIndex(g)])}</h2><p>Take the phone and get ready to build. Your tiles are hidden until you begin.</p><button class="wb36-btn wb36-block" id="wb36-ready">I'm Ready →</button></div><button class="wb36-ghost wb36-block" id="wb36-save">Save & Leave</button>`;b.querySelector('#wb36-ready').onclick=()=>{g.handoff=false;wb36Save();wb36Render()};b.querySelector('#wb36-save').onclick=wb36Pause;return}
 const available=wb362ClueEnabled()?wb362FindDiscovery(g):null;const draftScore=Object.keys(g.draft).length?wb36Check(g):null;
 b.innerHTML=`<div class="wb37-scorebar"><span>Turn ${g.turn+1}/${g.maxTurns} · ${wb380Strategy(g)==='master'?'Master':wb380Strategy(g)==='balanced'?'Balanced':'Relaxed'}</span><strong>${g.players.length===1?`✦ ${g.scores[0]} pts`:`${WB36_ESC(g.players[wb36PlayerIndex(g)])} · ${g.scores[wb36PlayerIndex(g)]} pts`}</strong><span class="wb39-wallet" aria-label="Achievement Points ${economy.points} and Insight Tokens ${economy.coins}">✦ ${economy.points.toLocaleString()} Points · ◉ ${economy.coins.toLocaleString()} Tokens</span>${available?'<button class="wb362-clue-indicator" id="wb362-clue" aria-label="A Bible bonus word can be played. Show clue" title="Bible bonus word nearby">✦</button>':''}<button class="wb37-help" id="wb37-help" aria-label="Word Builder instructions">?</button></div>${g.players.length>1?wb36Scores(g):wb380GoalMark(g)}
 <div class="wb36-board" role="group" aria-label="Nine by nine word building board">${g.board.map((_,i)=>wb36RenderCell(g,i)).join('')}</div>
 <div class="wb36-rack" role="group" aria-label="Your seven letter tiles">${g.rack.map(t=>`<button class="wb36-tile ${wb36Selected===t.id?'selected':''}" data-wb-tile="${t.id}" aria-label="Tile ${t.letter} worth ${WB36_POINTS[t.letter]||1} points">${t.letter}<small>${WB36_POINTS[t.letter]||1}</small></button>`).join('')}</div>
 ${wb380ScorePreview(draftScore)}<div class="wb36-status ${wb36Message?'has-message':''}" role="status">${WB36_ESC(wb36Message)}</div>
 <div class="wb37-actions"><button class="wb36-btn wb36-primary" id="wb36-submit" ${Object.keys(g.draft).length?'':'disabled'}>✓ Play Word</button><div class="wb37-tools"><button class="wb36-outline" id="wb36-try" aria-label="Suggest a free word (never costs Insight Tokens)" title="Idea (free)"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 22h4M9 14c-1.5-1.2-2.5-2.7-2.5-4.5a5.5 5.5 0 0 1 11 0c0 1.8-1 3.3-2.5 4.5-.6.5-1 1.1-1 2H10c0-.9-.4-1.5-1-2Z"/></svg></button><button class="wb36-outline" id="wb36-undo" ${Object.keys(g.draft).length?'':'disabled'} aria-label="Recall pending tiles" title="Undo">↶</button><button class="wb36-outline" id="wb36-mix" aria-label="Shuffle letters" title="Mix">⤨</button><button class="wb36-outline" id="wb37-more" aria-expanded="false" aria-controls="wb37-extra" title="Reveal a playable word or see turn options" aria-label="Reveal a playable word or see turn options">👁</button></div><div id="wb37-extra" class="wb37-extra" hidden><button class="wb36-outline" id="wb36-reveal-example">👁 Reveal playable word · 20 Insight Tokens (ends turn; 0 points)</button><button class="wb36-outline" id="wb36-exchange" ${g.exchangeUsed?'disabled':''}>⇄ Exchange · 20 Insight Tokens, ends turn</button><button class="wb36-ghost" id="wb36-pass">Pass Turn →</button></div></div>`;
 b.querySelectorAll('[data-wb-tile]').forEach(x=>{
 x.onclick=()=>{if(x.dataset.dragWas){delete x.dataset.dragWas;return}wb36Selected=wb36Selected===x.dataset.wbTile?null:x.dataset.wbTile;wb36Message='';wb36Render()};
 let pid=null,sx=0,sy=0,drag=false,ghost=null,lastCell=null,dropCell=null;
 // The tile floats ABOVE the fingertip, so the player can see the target cell.
 // A light travel boost means the finger covers less distance than the tile.
 const fingerGap=()=>Math.min(92,Math.max(64,window.innerHeight*.105));
 const projectedPoint=e=>({x:sx+(e.clientX-sx)*1.12,y:sy+(e.clientY-sy)*1.18-fingerGap()});
 const hitCell=p=>document.elementFromPoint(p.x,p.y)?.closest('[data-wb-cell]:not([disabled])')||null;
 const clearDrag=()=>{ghost?.remove();ghost=null;lastCell?.classList.remove('wb372-drop-target');lastCell=null;dropCell=null;drag=false;pid=null};
 x.onpointerdown=e=>{if(e.pointerType==='mouse'&&e.button!==0)return;pid=e.pointerId;sx=e.clientX;sy=e.clientY;try{x.setPointerCapture(e.pointerId)}catch(_){}};
 x.onpointermove=e=>{if(e.pointerId!==pid)return;if(!drag&&Math.hypot(e.clientX-sx,e.clientY-sy)>7){
  drag=true;ghost=x.cloneNode(true);ghost.removeAttribute('data-wb-tile');ghost.className='wb36-tile wb372-drag-ghost';document.body.appendChild(ghost);
 }if(!drag)return;e.preventDefault();const p=projectedPoint(e);
 // Use compositor-friendly transforms rather than reflowing the board on every move.
 ghost.style.transform=`translate3d(${p.x-23}px,${p.y-23}px,0) scale(1.13)`;
 const cell=hitCell(p);if(lastCell!==cell){lastCell?.classList.remove('wb372-drop-target');lastCell=cell;lastCell?.classList.add('wb372-drop-target')}dropCell=cell;
 };
 x.onpointerup=e=>{if(e.pointerId!==pid)return;if(!drag){clearDrag();return}e.preventDefault();e.stopPropagation();
 const cell=hitCell(projectedPoint(e))||dropCell;
 x.dataset.dragWas='1';setTimeout(()=>delete x.dataset.dragWas,250);
 // Prevent another render until we have a confirmed target.
 clearDrag();if(cell){wb36Selected=x.dataset.wbTile;wb36CellTap(+cell.dataset.wbCell)}
 };
 x.onpointercance\n--SNIP--\n\n## CORE function wb36Scores\n--SNIP--\nfunction wb36Scores(g){return `<div class="wb36-players wb37-mini-players">${g.players.map((name,i)=>`<div class="wb36-player ${i===wb36PlayerIndex(g)?'active':''}"><b>${WB36_ESC(name)}</b><small>${g.scores[i]} pts</small></div>`).join('')}</div>`}
function wb36PauseUI(b){const g=wb36Game;b.innerHTML=`<div class="wb36-hero"><span class="wb36-sub">PAUSED</spa\n--SNIP--\n\n## CORE function wb36Play\n--SNIP--\nategy||'relaxed',created:Date.now()};wb36Game.rack=wb363SmartRack(wb36Game);wb36Selected=null;wb36Message='';wb36View='game';wb36Save();wb36Render()}
function wb36PlayerIndex(g){return g.turn%g.players.length}
function wb36Scores(g){return `<div class="wb36-players wb37-mini-players">${g.players.map((name,i)=>`<div class="wb36-player ${i===wb36PlayerIndex(g)?'active':''}"><b>${WB36_ESC(name)}</b><small>${g.scores[i]} pts</small></div>`).join('')}</div>`}
function wb36PauseUI(b){const g=wb36Game;b.innerHTML=`<div class="wb36-hero"><span class="wb36-sub">PAUSED</span><h2>Match Saved</h2><p>${g?g.players.length+' player'+(g.players.length!==1?'s':'')+' · turn '+(g.turn+1)+' of '+g.maxTurns:'Your game'}</p></div><button class="wb36-btn wb36-block" id="wb36-continue">▶ Resume This Turn</button><button class="wb36-outline wb36-block" id="wb36-home">‹ Word Builder Home</button><button class="wb36-ghost wb36-block" id="wb36-mainhome">Return to Main Menu</button>`;b.querySelector('#wb36-continu\n--SNIP--\n\n## CORE wb36Message=\`\n--SNIP--\neck.reason;playFx('tap',.25);wb36Render();return}
 for(const [i,t] of Object.entries(g.draft))g.board[+i]=t.letter;
 const p=wb36PlayerIndex(g);g.scores[p]+=check.points;g.lastWords=check.words;g.lastPoints=check.points;g.draft={};wb36Selected=null;playChime();if(check.points>=30)playCoinFx('earn');wb36Message=`${check.words.join(' + ')} · +${check.points} pts${check.bonus.length?' · ✦ Bible bonus +12':''}`;g.bibleLast=check.bonus.find(w=>WB362_BIBLE_INFO[w])||null;
 g.turn++;if(g.turn>=g.maxTurns)wb36Complete();else{g.rack=wb372NextRack(g);g.exchangeUsed=false;g.handoff=g.players.length>1;g.justPlayed=true}wb36Save();if(g.finished)bu34Celebrate('WORD BUILDER COMPLETE!',true);wb36Render();}
function wb36NextTurn(){const g=wb36Game;wb36Undo();g.turn++;wb36Message='';if(g.turn>=g.maxTurns)wb36Complete();else{g.rack=wb372NextRack(g);g.exchan\n--SNIP--\n\n## CORE wb36Message?\n--SNIP--\nst key of [WB36_KEY,WB388_BACKUP_KEY]){
    try{const raw=localStorage.getItem(key);if(!raw)continue;const v=JSON.parse(raw);if(wb388Valid(v))return v;}catch(_){}
  }
  return null;
}
let wb36Setup={people:['Player 1'],rounds:4,strategy:'relaxed'}; let wb36Game=null,wb36View='hub',wb36Selected=null,wb36Message='',wb36IsPreview=false;
{
  const v=wb388Load();
  if(v){if(Array.isArray(v.setup?.people))wb36Setup={...wb36Setup,...v.setup};if(v.game)wb36Game=v.game;}
}
const wb36Screen=()=>document.getElementById('wb36'); const wb36Body=()=>document.getElementById('wb36-main'); const wb36Visible=()=>!wb36Screen().hidden;
function wb36Save(){
  let payload;try{payload=JSON.stringify({setup:wb36Setup,game:wb36Game})}catch(_){return}
  try{localStorage.setItem(WB388_BACKUP_KEY,payload)}catch(_){}
  try{localStorage.setItem(WB36_KEY,payload)}catch\n--SNIP--\n\n## CSS / HTML index wb36-players: count=2\n--SNIP--\nsolid #6ce0c9;outline-offset:-2px}.wb36-cell:focus-visible{outline:3px solid #fff;outline-offset:0}.wb36-players{display:flex;overflow:auto;gap:7px;margin:4px 0 9px;scrollbar-width:none}.wb36-player{padding:8px 10px;border:1px solid #5c7b74;border-radius:12px;background:#0a2d38;min-width:80px;flex:1;max-width:190px;text-align:center}.wb36-player.active{border-color:#ffe0a3;background:#29515a}.wb36-player b{display:block;color:#ffe8b3;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.wb36-player small{font-size:11px;color:#c0d9d2}.wb36-rack{display:flex\n--SNIP--\nght:25px;overflow:hidden}
#wb36.bu67-wb-play .wb380-preview small{display:none}
#wb36.bu67-wb-play .wb36-players{margin:0 auto 1px;min-height:0}
#wb36.bu67-wb-play .wb36-coins{margin:0 auto 1px}
#bu35-family.bu67-family-play .bu35-body{height:100%;min-height:0;overflow:hidden;display:flex;flex-direction:column;gap:3px;padding:4px 9px max(4px,env(safe-area-inset-bottom));}
#bu35-family.bu67-family-play .bu35-statrow{font-size:10px;line-height:1.15;gap:3px}
#bu35-family.bu67-family-play .bu35-progress{margin:2px 0;height:4px;flex:none}
#bu35-family.bu67-family-play .bu35-stage{\n--SNIP--\n\n## CSS / HTML index wb36-player: count=9\n--SNIP--\nsolid #6ce0c9;outline-offset:-2px}.wb36-cell:focus-visible{outline:3px solid #fff;outline-offset:0}.wb36-players{display:flex;overflow:auto;gap:7px;margin:4px 0 9px;scrollbar-width:none}.wb36-player{padding:8px 10px;border:1px solid #5c7b74;border-radius:12px;background:#0a2d38;min-width:80px;flex:1;max-width:190px;text-align:center}.wb36-player.active{border-color:#ffe0a3;background:#29515a}.wb36-player b{display:block;color:#ffe8b3;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.wb36-player small{font-size:11px;color:#c0d9d2}.wb36-rack{display:fle\n--SNIP--\nne-offset:0}.wb36-players{display:flex;overflow:auto;gap:7px;margin:4px 0 9px;scrollbar-width:none}.wb36-player{padding:8px 10px;border:1px solid #5c7b74;border-radius:12px;background:#0a2d38;min-width:80px;flex:1;max-width:190px;text-align:center}.wb36-player.active{border-color:#ffe0a3;background:#29515a}.wb36-player b{display:block;color:#ffe8b3;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.wb36-player small{font-size:11px;color:#c0d9d2}.wb36-rack{display:flex;justify-content:center;gap:4px;min-height:47px;max-width:470px;margin:9px auto 10px}.\n--SNIP--\n7b74;border-radius:12px;background:#0a2d38;min-width:80px;flex:1;max-width:190px;text-align:center}.wb36-player.active{border-color:#ffe0a3;background:#29515a}.wb36-player b{display:block;color:#ffe8b3;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.wb36-player small{font-size:11px;color:#c0d9d2}.wb36-rack{display:flex;justify-content:center;gap:4px;min-height:47px;max-width:470px;margin:9px auto 10px}.wb36-tile{flex:1;min-width:0;max-width:54px;aspect-ratio:1;min-height:36px;border-radius:8px;border:2px solid #b88a45;background:linear-gradient(135d\n--SNIP--\nex:1;max-width:190px;text-align:center}.wb36-player.active{border-color:#ffe0a3;background:#29515a}.wb36-player b{display:block;color:#ffe8b3;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.wb36-player small{font-size:11px;color:#c0d9d2}.wb36-rack{display:flex;justify-content:center;gap:4px;min-height:47px;max-width:470px;margin:9px auto 10px}.wb36-tile{flex:1;min-width:0;max-width:54px;aspect-ratio:1;min-height:36px;border-radius:8px;border:2px solid #b88a45;background:linear-gradient(135deg,#fdf1cf,#d9b47b);box-shadow:0 3px 4px #0007;color:#18313a\n--SNIP--\nsplay:block;color:#ffe8b3;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.wb36-player small{font-size:11px;color:#c0d9d2}.wb36-rack{display:flex;justify-content:center;gap:4px;min-height:47px;max-width:470px;margin:9px auto 10px}.wb36-tile{flex:1;min-width:0;max-width:54px;aspect-ratio:1;min-height:36px;border-radius:8px;border:2px solid #b88a45;background:linear-gradient(135deg,#fdf1cf,#d9b47b);box-shadow:0 3px 4px #0007;color:#18313a;font:bold clamp(17px,5vw,24px) Georgia,serif;display:flex;align-items:center;justify-content:center;position:relati\n--SNIP--\nn .wb37-mini-players{margin:3px auto 6px;max-width:465px;gap:4px;}
.wb36-screen .wb37-mini-players .wb36-player{padding:4px 5px;min-width:55px;max-width:none;border-radius:7px;}
.wb36-screen .wb37-mini-players .wb36-player b{font-size:11px;}
.wb36-screen .wb37-mini-players .wb36-player small{font-size:10px;}
.wb36-screen .wb36-board{margin:3px auto 7px;gap:2px;padding:4px;box-shadow:0 6px 22px #0005;}
.wb36-screen .wb36-rack{margin:4px auto 5px;min-height:37px;}
.wb36-screen .wb36-tile{max-width:52px;min-height:34px;}
.wb36-screen .wb36-status{min-height:0;margin:0 auto;max-\n--SNIP--\n{padding:4px 5px;min-width:55px;max-width:none;border-radius:7px;}
.wb36-screen .wb37-mini-players .wb36-player b{font-size:11px;}
.wb36-screen .wb37-mini-players .wb36-player small{font-size:10px;}
.wb36-screen .wb36-board{margin:3px auto 7px;gap:2px;padding:4px;box-shadow:0 6px 22px #0005;}
.wb36-screen .wb36-rack{margin:4px auto 5px;min-height:37px;}
.wb36-screen .wb36-tile{max-width:52px;min-height:34px;}
.wb36-screen .wb36-status{min-height:0;margin:0 auto;max-width:465px;font-size:12px;line-height:1.3;padding:0;}
.wb36-screen .wb36-status:empty{display:none;}
.wb36-scr\n--SNIP--\n;}
.wb36-screen .wb37-mini-players .wb36-player b{font-size:11px;}
.wb36-screen .wb37-mini-players .wb36-player small{font-size:10px;}
.wb36-screen .wb36-board{margin:3px auto 7px;gap:2px;padding:4px;box-shadow:0 6px 22px #0005;}
.wb36-screen .wb36-rack{margin:4px auto 5px;min-height:37px;}
.wb36-screen .wb36-tile{max-width:52px;min-height:34px;}
.wb36-screen .wb36-status{min-height:0;margin:0 auto;max-width:465px;font-size:12px;line-height:1.3;padding:0;}
.wb36-screen .wb36-status:empty{display:none;}
.wb36-screen .wb36-status.has-message{padding:5px 6px;margin:3px auto 5px\n--SNIP--\nght:25px;overflow:hidden}
#wb36.bu67-wb-play .wb380-preview small{display:none}
#wb36.bu67-wb-play .wb36-players{margin:0 auto 1px;min-height:0}
#wb36.bu67-wb-play .wb36-coins{margin:0 auto 1px}
#bu35-family.bu67-family-play .bu35-body{height:100%;min-height:0;overflow:hidden;display:flex;flex-direction:column;gap:3px;padding:4px 9px max(4px,env(safe-area-inset-bottom));}
#bu35-family.bu67-family-play .bu35-statrow{font-size:10px;line-height:1.15;gap:3px}
#bu35-family.bu67-family-play .bu35-progress{margin:2px 0;height:4px;flex:none}
#bu35-family.bu67-family-play .bu35-stage\n--SNIP--\n\n## CSS / HTML index wb37-mini-players: count=4\n--SNIP--\n5;border-radius:50%;font-weight:900;font-size:15px;width:28px;height:28px;flex:none;}
.wb36-screen .wb37-mini-players{margin:3px auto 6px;max-width:465px;gap:4px;}
.wb36-screen .wb37-mini-players .wb36-player{padding:4px 5px;min-width:55px;max-width:none;border-radius:7px;}
.wb36-screen .wb37-mini-players .wb36-player b{font-size:11px;}
.wb36-screen .wb37-mini-players .wb36-player small{font-size:10px;}
.wb36-screen .wb36-board{margin:3px auto 7px;gap:2px;padding:4px;box-shadow:0 6px 22px #0005;}
.wb36-screen .wb36-rack{margin:4px auto 5px;min-height:37px;}
.wb36-screen .wb36-tile\n--SNIP--\n:none;}
.wb36-screen .wb37-mini-players{margin:3px auto 6px;max-width:465px;gap:4px;}
.wb36-screen .wb37-mini-players .wb36-player{padding:4px 5px;min-width:55px;max-width:none;border-radius:7px;}
.wb36-screen .wb37-mini-players .wb36-player b{font-size:11px;}
.wb36-screen .wb37-mini-players .wb36-player small{font-size:10px;}
.wb36-screen .wb36-board{margin:3px auto 7px;gap:2px;padding:4px;box-shadow:0 6px 22px #0005;}
.wb36-screen .wb36-rack{margin:4px auto 5px;min-height:37px;}
.wb36-screen .wb36-tile{max-width:52px;min-height:34px;}
.wb36-screen .wb36-status{min-height:0;margi\n--SNIP--\nlayers .wb36-player{padding:4px 5px;min-width:55px;max-width:none;border-radius:7px;}
.wb36-screen .wb37-mini-players .wb36-player b{font-size:11px;}
.wb36-screen .wb37-mini-players .wb36-player small{font-size:10px;}
.wb36-screen .wb36-board{margin:3px auto 7px;gap:2px;padding:4px;box-shadow:0 6px 22px #0005;}
.wb36-screen .wb36-rack{margin:4px auto 5px;min-height:37px;}
.wb36-screen .wb36-tile{max-width:52px;min-height:34px;}
.wb36-screen .wb36-status{min-height:0;margin:0 auto;max-width:465px;font-size:12px;line-height:1.3;padding:0;}
.wb36-screen .wb36-status:empty{display:non\n--SNIP--\ne;border-radius:7px;}
.wb36-screen .wb37-mini-players .wb36-player b{font-size:11px;}
.wb36-screen .wb37-mini-players .wb36-player small{font-size:10px;}
.wb36-screen .wb36-board{margin:3px auto 7px;gap:2px;padding:4px;box-shadow:0 6px 22px #0005;}
.wb36-screen .wb36-rack{margin:4px auto 5px;min-height:37px;}
.wb36-screen .wb36-tile{max-width:52px;min-height:34px;}
.wb36-screen .wb36-status{min-height:0;margin:0 auto;max-width:465px;font-size:12px;line-height:1.3;padding:0;}
.wb36-screen .wb36-status:empty{display:none;}
.wb36-screen .wb36-status.has-message{padding:5px 6px;margin\n--SNIP--\n\n## CSS / HTML index wb37-scorebar: count=5\n--SNIP--\nh:39px;height:39px;border-radius:11px;}
.wb36-screen .wb36-top h1{font-size:clamp(20px,5vw,25px);}
.wb37-scorebar{display:flex;align-items:center;gap:10px;margin:1px auto 3px;max-width:465px;min-height:31px;font-size:13px;color:#d5dfd6;}
.wb37-scorebar strong{margin-left:auto;color:#ffdfa3;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.wb37-help{border:1px solid #8daba8;background:#143c47;color:#ffe0a5;border-radius:50%;font-weight:900;font-size:15px;width:28px;height:28px;flex:none;}
.wb36-screen .wb37-mini-players{margin:3px auto 6px;max-width:46\n--SNIP--\ncenter;gap:10px;margin:1px auto 3px;max-width:465px;min-height:31px;font-size:13px;color:#d5dfd6;}
.wb37-scorebar strong{margin-left:auto;color:#ffdfa3;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.wb37-help{border:1px solid #8daba8;background:#143c47;color:#ffe0a5;border-radius:50%;font-weight:900;font-size:15px;width:28px;height:28px;flex:none;}
.wb36-screen .wb37-mini-players{margin:3px auto 6px;max-width:465px;gap:4px;}
.wb36-screen .wb37-mini-players .wb36-player{padding:4px 5px;min-width:55px;max-width:none;border-radius:7px;}
.wb36-screen .\n--SNIP--\n-inset-bottom));display:flex;flex-direction:column;align-items:stretch;gap:1px}
#wb36.bu67-wb-play .wb37-scorebar{width:100%;min-height:25px;margin:0 auto 1px;font-size:11px}
#wb36.bu67-wb-play .wb37-scorebar strong{font-size:12px}
#wb36.bu67-wb-play .wb36-board{flex:none;width:min(calc(100vw - 28px),465px,max(188px,calc(100dvh - 329px)));max-height:min(calc(100vw - 28px),465px,max(188px,calc(100dvh - 329px)));margin:1px auto 2px;padding:3px;gap:2px}
#wb36.bu67-wb-play .wb36-rack{margin:2px auto 3px;min-height:32px;height:clamp(32px,6dvh,40px);width:100%}
#wb36.bu67-wb-play .w\n--SNIP--\nlay .wb37-scorebar{width:100%;min-height:25px;margin:0 auto 1px;font-size:11px}
#wb36.bu67-wb-play .wb37-scorebar strong{font-size:12px}
#wb36.bu67-wb-play .wb36-board{flex:none;width:min(calc(100vw - 28px),465px,max(188px,calc(100dvh - 329px)));max-height:min(calc(100vw - 28px),465px,max(188px,calc(100dvh - 329px)));margin:1px auto 2px;padding:3px;gap:2px}
#wb36.bu67-wb-play .wb36-rack{margin:2px auto 3px;min-height:32px;height:clamp(32px,6dvh,40px);width:100%}
#wb36.bu67-wb-play .wb36-tile{min-height:30px;max-height:40px}
#wb36.bu67-wb-play .wb37-actions{margin:2px auto 0;ga\n--SNIP--\ns-reduced-motion:reduce){.bu67-dialog{animation:none}}
@media(max-height:650px){#wb36.bu67-wb-play .wb37-scorebar{font-size:10px}#wb36.bu67-wb-play .wb36-main{gap:0}#bu35-family.bu67-family-play .bu35-question{font-size:16px}#bu35-family.bu67-family-play .bu35-wheel-frame{width:min(41dvh,190px);height:min(41dvh,190px)}}
</style><style id="bu3870-well-quest-styles">
/* NEW: Genesis 24 tactile well interaction. Visual height is budgeted within fixed viewport. */
#bu3857-screen .bu3870-well-stage{gap:clamp(3px,.7dvh,7px);padding:clamp(6px,1dvh,11px) 11px;}
#bu3857-screen .bu3870-\n--SNIP--\n\n## CSS / HTML index wb39-wallet: count=1\n--SNIP--\n37-tools #wb36-mix{min-width:44px;min-height:44px;font-size:23px;touch-action:manipulation}

#wb36 .wb39-wallet{display:inline-flex;align-items:center;justify-content:center;flex:1 1 100%;font-size:11px;line-height:1.25;color:#ebdbad;letter-spacing:.1px;white-space:normal;text-align:center}
#btn3926-answers .btn3926-answer.is-wrong{background:rgba(135,36,40,.28)!important;border-color:#d46e70!important;color:#fbe1dd!important;opacity:.72}

#bu375-daily .bu39-daily-wallet{font-size:12px;line-height:1.4;text-align:center;color:#f4dfad;margin:8px auto 12px;padding:8px 10px;back\n--SNIP--\n\n## CSS / HTML index wb36-message: count=0\n--SNIP--\n\n## CSS / HTML index wb36-msg: count=0\n--SNIP--\n\n## CSS / HTML index wb36-last: count=0\n--SNIP--\n\n## CSS / HTML index wb36-status: count=6\n--SNIP--\n;border-radius:14px;padding:12px;margin:10px 0;text-align:center}.wb36-result strong{color:#ffe2a8}.wb36-status{font-size:13px;line-height:1.4;color:#f8e6ad;text-align:center;min-height:30px;margin:7px 0}.wb36-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;max-width:465px;margin:8px auto}.wb36-actions .wb36-primary{grid-column:1/-1}.wb36-handoff{text-align:center;padding:32px 16px}.wb36-handoff .wb36-sub{margin:8px}.wb36-handoff h2{font:700 36px Georgia,serif;color:#ffdfa3}.wb36-foot{text-align:center;font-size:12px;color:#bfcec5;padding:6px 0 20px}.wb36-help{fon\n--SNIP--\nx auto 5px;min-height:37px;}
.wb36-screen .wb36-tile{max-width:52px;min-height:34px;}
.wb36-screen .wb36-status{min-height:0;margin:0 auto;max-width:465px;font-size:12px;line-height:1.3;padding:0;}
.wb36-screen .wb36-status:empty{display:none;}
.wb36-screen .wb36-status.has-message{padding:5px 6px;margin:3px auto 5px;border-radius:7px;background:#143a44;border:1px solid #416b68;}
.wb37-actions{max-width:465px;margin:4px auto 0;display:flex;flex-direction:column;gap:6px;}
.wb37-actions>.wb36-primary{min-height:42px;padding:7px 12px;font-size:15px;}
.wb37-tools{display:grid;gr\n--SNIP--\nmin-height:0;margin:0 auto;max-width:465px;font-size:12px;line-height:1.3;padding:0;}
.wb36-screen .wb36-status:empty{display:none;}
.wb36-screen .wb36-status.has-message{padding:5px 6px;margin:3px auto 5px;border-radius:7px;background:#143a44;border:1px solid #416b68;}
.wb37-actions{max-width:465px;margin:4px auto 0;display:flex;flex-direction:column;gap:6px;}
.wb37-actions>.wb36-primary{min-height:42px;padding:7px 12px;font-size:15px;}
.wb37-tools{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;}
.wb37-tools>.wb36-outline{min-width:0;min-height:38px;padd\n--SNIP--\n-size:12px;line-height:1.3;padding:0;}
.wb36-screen .wb36-status:empty{display:none;}
.wb36-screen .wb36-status.has-message{padding:5px 6px;margin:3px auto 5px;border-radius:7px;background:#143a44;border:1px solid #416b68;}
.wb37-actions{max-width:465px;margin:4px auto 0;display:flex;flex-direction:column;gap:6px;}
.wb37-actions>.wb36-primary{min-height:42px;padding:7px 12px;font-size:15px;}
.wb37-tools{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;}
.wb37-tools>.wb36-outline{min-width:0;min-height:38px;padding:5px 2px;font-size:12px;white-space:nowrap;}\n--SNIP--\n-play .wb37-tools>.wb36-outline{min-height:39px;padding:5px 1px;font-size:11px}
#wb36.bu67-wb-play .wb36-status{margin:0 auto;padding:0;font-size:11px;line-height:1.2;max-height:30px;overflow:hidden}
#wb36.bu67-wb-play .wb380-preview{margin:0 auto;padding:0;font-size:11px;max-height:25px;overflow:hidden}
#wb36.bu67-wb-play .wb380-preview small{display:none}
#wb36.bu67-wb-play .wb36-players{margin:0 auto 1px;min-height:0}
#wb36.bu67-wb-play .wb36-coins{margin:0 auto 1px}
#bu35-family.bu67-family-play .bu35-body{height:100%;min-height:0;overflow:hidden;display:flex;flex-direct\n--SNIP--\ntus messages in a tap-to-read dialog instead of forcing a taller board.
 const st=b.querySelector('.wb36-status');if(st&&st.textContent.length>90){st.tabIndex=0;st.setAttribute('role','button');st.setAttribute('aria-label','Read full turn message');const show=()=>modal('Turn information',st.textContent);st.onclick=show;st.onkeydown=e=>{if(e.key==='Enter'){show()}};}
}
const oldWb=wb36Render;wb36Render=function(...args){let out=oldWb.apply(this,args);updateBuilder();return out};
function familyInfo(){
 const s=document.getElementById('bu35-family'),b=document.getElementById('\n--SNIP--\n\n## CSS / HTML index wb36-foot: count=1\n--SNIP--\n16px}.wb36-handoff .wb36-sub{margin:8px}.wb36-handoff h2{font:700 36px Georgia,serif;color:#ffdfa3}.wb36-foot{text-align:center;font-size:12px;color:#bfcec5;padding:6px 0 20px}.wb36-help{font-size:13px;line-height:1.55;color:#dfebdd}.wb36-scores{display:grid;gap:9px}.wb36-scoreline{display:flex;justify-content:space-between;border-bottom:1px solid #547067;padding:10px 3px;font-weight:800}.wb36-chip{display:inline-flex;gap:5px;align-items:center;border:1px solid #7c9690;border-radius:18px;padding:6px 10px;font-size:11px;color:#e4e8d7}.wb36-switch{border:1px solid #b49c6b;bo\n--SNIP--\n\n## CSS / HTML index wb36-board: count=6\n--SNIP--\nl{color:#e0d3ae;font-size:12px;font-weight:800;letter-spacing:.6px;margin:16px 0 6px;display:block}.wb36-board{display:grid;grid-template-columns:repeat(9,minmax(0,1fr));gap:3px;margin:8px auto 12px;padding:5px;width:100%;max-width:465px;aspect-ratio:1;background:#163b43;border:2px solid #b69a61;border-radius:14px;box-shadow:0 12px 34px #0007}.wb36-cell{min-width:0;aspect-ratio:1;border:1px solid #567b76;border-radius:5px;display:flex;align-items:center;justify-content:center;background:linear-gradient(145deg,#235058,#10313f);color:#d6e6db;font-size:clamp(8px,2.4vw,12px);fo\n--SNIP--\n12px;margin-bottom:10px;color:#d8e1d3}.wb36-coins span{white-space:nowrap}
@media(max-width:365px){.wb36-board{gap:2px;padding:3px}.wb36-cell{border-radius:4px}.wb36-main{padding-left:8px;padding-right:8px}.wb36-rack{gap:3px}.wb36-tile{font-size:18px}.wb36-hero h2{font-size:28px}}
\n/* v3.6.1 Word Builder mobile polish — scoped only to the Word Builder screen. */
.wb36-screen .wb36-main{padding:5px 10px max(12px,env(safe-area-inset-bottom));}
.wb36-screen .wb36-top{min-height:55px;padding:6px 10px;}
.wb36-screen .wb36-top .wb36-back{width:39px;height:39px;border-radius:11px\n--SNIP--\n{font-size:11px;}
.wb36-screen .wb37-mini-players .wb36-player small{font-size:10px;}
.wb36-screen .wb36-board{margin:3px auto 7px;gap:2px;padding:4px;box-shadow:0 6px 22px #0005;}
.wb36-screen .wb36-rack{margin:4px auto 5px;min-height:37px;}
.wb36-screen .wb36-tile{max-width:52px;min-height:34px;}
.wb36-screen .wb36-status{min-height:0;margin:0 auto;max-width:465px;font-size:12px;line-height:1.3;padding:0;}
.wb36-screen .wb36-status:empty{display:none;}
.wb36-screen .wb36-status.has-message{padding:5px 6px;margin:3px auto 5px;border-radius:7px;background:#143a44;border:1px\n--SNIP--\n;}
@media(max-width:365px){.wb36-screen .wb36-main{padding-left:5px;padding-right:5px}.wb36-screen .wb36-board{gap:2px;padding:3px}.wb37-tools>.wb36-outline{font-size:11px}}

/* v3.6.2 Discovery: tiny, non-blocking clue affordance in existing scoreboard. */
.wb362-clue-indicator{flex:none;width:30px;height:30px;padding:0;border-radius:50%;border:1px solid #eac27a;color:#fce6a4;background:#31565b;font-size:19px;box-shadow:0 0 11px #f8c66d80;animation:wb362-pulse 2.9s ease-in-out infinite;}
@keyframes wb362-pulse{50%{box-shadow:0 0 3px #f8c66d42}}
@media(prefers-reduced-motio\n--SNIP--\nb362-clue-indicator{animation:none}}
@media(max-height:740px) and (max-width:600px){
 .wb36-screen .wb36-board{width:min(calc(100vw - 22px),calc(100svh - 285px));}
 .wb36-screen .wb36-rack{margin:2px auto 3px;min-height:32px;}
 .wb36-screen .wb36-tile{min-height:31px;}
 .wb37-actions{gap:4px;margin-top:2px;}
 .wb37-tools>.wb36-outline{min-height:33px;}
 .wb37-actions>.wb36-primary{min-height:37px;}
}

/* v3.7.3: preserve legibility on narrow phone screens without adding gameplay clutter. */
#bu373-challenge-setting{accent-color:#d9b866}
#play .gamepanel .eyebrow.bu373-chall\n--SNIP--\nto 1px;font-size:11px}
#wb36.bu67-wb-play .wb37-scorebar strong{font-size:12px}
#wb36.bu67-wb-play .wb36-board{flex:none;width:min(calc(100vw - 28px),465px,max(188px,calc(100dvh - 329px)));max-height:min(calc(100vw - 28px),465px,max(188px,calc(100dvh - 329px)));margin:1px auto 2px;padding:3px;gap:2px}
#wb36.bu67-wb-play .wb36-rack{margin:2px auto 3px;min-height:32px;height:clamp(32px,6dvh,40px);width:100%}
#wb36.bu67-wb-play .wb36-tile{min-height:30px;max-height:40px}
#wb36.bu67-wb-play .wb37-actions{margin:2px auto 0;gap:4px;width:100%}
#wb36.bu67-wb-play .wb37-tools{gap:4\n--SNIP--\n\n## CSS / HTML index wb36-main: count=9\n--SNIP--\nrif;text-align:center;color:#ffe2a7;flex:1;margin:0}.wb36-top .wb36-back:last-child{font-size:18px}.wb36-main{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:12px 12px max(36px,env(safe-area-inset-bottom));margin:0 auto;width:100%;max-width:650px}.wb36-hero{padding:19px 16px;margin-bottom:12px;background:linear-gradient(145deg,#18505b,#0c2635);border:1px solid #b69f6f;border-radius:19px;text-align:center}.wb36-hero h2{font:700 clamp(26px,7vw,37px) Georgia,serif;color:#ffe4ad;margin:7px 0}.wb36-hero p{font-size:14px;color:#d5e2dd;line-height:1.43;mar\n--SNIP--\nspace:nowrap}
@media(max-width:365px){.wb36-board{gap:2px;padding:3px}.wb36-cell{border-radius:4px}.wb36-main{padding-left:8px;padding-right:8px}.wb36-rack{gap:3px}.wb36-tile{font-size:18px}.wb36-hero h2{font-size:28px}}
\n/* v3.6.1 Word Builder mobile polish — scoped only to the Word Builder screen. */
.wb36-screen .wb36-main{padding:5px 10px max(12px,env(safe-area-inset-bottom));}
.wb36-screen .wb36-top{min-height:55px;padding:6px 10px;}
.wb36-screen .wb36-top .wb36-back{width:39px;height:39px;border-radius:11px;}
.wb36-screen .wb36-top h1{font-size:clamp(20px,5vw,25px);\n--SNIP--\n}
\n/* v3.6.1 Word Builder mobile polish — scoped only to the Word Builder screen. */
.wb36-screen .wb36-main{padding:5px 10px max(12px,env(safe-area-inset-bottom));}
.wb36-screen .wb36-top{min-height:55px;padding:6px 10px;}
.wb36-screen .wb36-top .wb36-back{width:39px;height:39px;border-radius:11px;}
.wb36-screen .wb36-top h1{font-size:clamp(20px,5vw,25px);}
.wb37-scorebar{display:flex;align-items:center;gap:10px;margin:1px auto 3px;max-width:465px;min-height:31px;font-size:13px;color:#d5dfd6;}
.wb37-scorebar strong{margin-left:auto;color:#ffdfa3;font-size:15px;white-spac\n--SNIP--\n{font-size:14px;line-height:1.5;color:#e1e8df;margin:10px 0;}
@media(max-width:365px){.wb36-screen .wb36-main{padding-left:5px;padding-right:5px}.wb36-screen .wb36-board{gap:2px;padding:3px}.wb37-tools>.wb36-outline{font-size:11px}}

/* v3.6.2 Discovery: tiny, non-blocking clue affordance in existing scoreboard. */
.wb362-clue-indicator{flex:none;width:30px;height:30px;padding:0;border-radius:50%;border:1px solid #eac27a;color:#fce6a4;background:#31565b;font-size:19px;box-shadow:0 0 11px #f8c66d80;animation:wb362-pulse 2.9s ease-in-out infinite;}
@keyframes wb362-pulse{50%\n--SNIP--\ntyle">
/* v3.8.71 — active-play viewport, additive / no saved-data migration */
#wb36.bu67-wb-play .wb36-main{height:100%;min-height:0;overflow:hidden;padding:2px 5px max(3px,env(safe-area-inset-bottom));display:flex;flex-direction:column;align-items:stretch;gap:1px}
#wb36.bu67-wb-play .wb37-scorebar{width:100%;min-height:25px;margin:0 auto 1px;font-size:11px}
#wb36.bu67-wb-play .wb37-scorebar strong{font-size:12px}
#wb36.bu67-wb-play .wb36-board{flex:none;width:min(calc(100vw - 28px),465px,max(188px,calc(100dvh - 329px)));max-height:min(calc(100vw - 28px),465px,max(188px,\n--SNIP--\none}}
@media(max-height:650px){#wb36.bu67-wb-play .wb37-scorebar{font-size:10px}#wb36.bu67-wb-play .wb36-main{gap:0}#bu35-family.bu67-family-play .bu35-question{font-size:16px}#bu35-family.bu67-family-play .bu35-wheel-frame{width:min(41dvh,190px);height:min(41dvh,190px)}}
</style><style id="bu3870-well-quest-styles">
/* NEW: Genesis 24 tactile well interaction. Visual height is budgeted within fixed viewport. */
#bu3857-screen .bu3870-well-stage{gap:clamp(3px,.7dvh,7px);padding:clamp(6px,1dvh,11px) 11px;}
#bu3857-screen .bu3870-heading{margin:0;color:#fff0c3;text-align:cen\n--SNIP--\nn id="wb36-menu" class="wb36-back" aria-label="Open full game menu">☰</button></header>
  <main id="wb36-main" class="wb36-main"></main>
</section>

<section class="bu34-screen bu375-screen" id="bu375-daily" hidden aria-label="Daily Discovery">
<header class="bu34-top"><button class="bu34-icon" id="bu375-back" aria-label="Return home">‹</button><h1 class="bu34-title">Daily Discovery</h1><span class="bu375-top-mark" aria-hidden="true">✦</span></header>
<div class="bu34-body" id="bu375-body" aria-live="polite"></div></section>
<section class="bu34-screen" id="bu34-trivia" ar\n--SNIP--\nlass="wb36-back" aria-label="Open full game menu">☰</button></header>
  <main id="wb36-main" class="wb36-main"></main>
</section>

<section class="bu34-screen bu375-screen" id="bu375-daily" hidden aria-label="Daily Discovery">
<header class="bu34-top"><button class="bu34-icon" id="bu375-back" aria-label="Return home">‹</button><h1 class="bu34-title">Daily Discovery</h1><span class="bu375-top-mark" aria-hidden="true">✦</span></header>
<div class="bu34-body" id="bu375-body" aria-live="polite"></div></section>
<section class="bu34-screen" id="bu34-trivia" aria-label="Bible Tr\n--SNIP--\niew==='game'&&!!wb36Game&&!wb36Game.handoff&&!wb36Game.finished);
 const b=document.getElementById('wb36-main');if(!s.classList.contains('bu67-wb-play')||!b)return;
 const more=b.querySelector('#wb37-more'),extra=b.querySelector('#wb37-extra');
 if(more&&extra){more.onclick=()=>{
  const btns=Array.from(extra.querySelectorAll('button'));let d;
  const body=document.createElement('div');body.style.cssText='display:grid;gap:9px';
  btns.forEach(source=>{const copy=document.createElement('button');copy.type='button';copy.className='wb36-outline';copy.style.minHeight='45px';co\n--SNIP--\n\n## CSS / HTML index wb36-rack: count=6\n--SNIP--\npace:nowrap;overflow:hidden;text-overflow:ellipsis}.wb36-player small{font-size:11px;color:#c0d9d2}.wb36-rack{display:flex;justify-content:center;gap:4px;min-height:47px;max-width:470px;margin:9px auto 10px}.wb36-tile{flex:1;min-width:0;max-width:54px;aspect-ratio:1;min-height:36px;border-radius:8px;border:2px solid #b88a45;background:linear-gradient(135deg,#fdf1cf,#d9b47b);box-shadow:0 3px 4px #0007;color:#18313a;font:bold clamp(17px,5vw,24px) Georgia,serif;display:flex;align-items:center;justify-content:center;position:relative;padding:0}.wb36-tile.selected{transform:tra\n--SNIP--\nard{gap:2px;padding:3px}.wb36-cell{border-radius:4px}.wb36-main{padding-left:8px;padding-right:8px}.wb36-rack{gap:3px}.wb36-tile{font-size:18px}.wb36-hero h2{font-size:28px}}
\n/* v3.6.1 Word Builder mobile polish — scoped only to the Word Builder screen. */
.wb36-screen .wb36-main{padding:5px 10px max(12px,env(safe-area-inset-bottom));}
.wb36-screen .wb36-top{min-height:55px;padding:6px 10px;}
.wb36-screen .wb36-top .wb36-back{width:39px;height:39px;border-radius:11px;}
.wb36-screen .wb36-top h1{font-size:clamp(20px,5vw,25px);}
.wb37-scorebar{display:flex;align-items:cent\n--SNIP--\neen .wb36-board{margin:3px auto 7px;gap:2px;padding:4px;box-shadow:0 6px 22px #0005;}
.wb36-screen .wb36-rack{margin:4px auto 5px;min-height:37px;}
.wb36-screen .wb36-tile{max-width:52px;min-height:34px;}
.wb36-screen .wb36-status{min-height:0;margin:0 auto;max-width:465px;font-size:12px;line-height:1.3;padding:0;}
.wb36-screen .wb36-status:empty{display:none;}
.wb36-screen .wb36-status.has-message{padding:5px 6px;margin:3px auto 5px;border-radius:7px;background:#143a44;border:1px solid #416b68;}
.wb37-actions{max-width:465px;margin:4px auto 0;display:flex;flex-direction:c\n--SNIP--\n0px){
 .wb36-screen .wb36-board{width:min(calc(100vw - 22px),calc(100svh - 285px));}
 .wb36-screen .wb36-rack{margin:2px auto 3px;min-height:32px;}
 .wb36-screen .wb36-tile{min-height:31px;}
 .wb37-actions{gap:4px;margin-top:2px;}
 .wb37-tools>.wb36-outline{min-height:33px;}
 .wb37-actions>.wb36-primary{min-height:37px;}
}

/* v3.7.3: preserve legibility on narrow phone screens without adding gameplay clutter. */
#bu373-challenge-setting{accent-color:#d9b866}
#play .gamepanel .eyebrow.bu373-challenge-tag{color:#e9c781;letter-spacing:.12em}

/* Smart Challenge: keep the que\n--SNIP--\ner-radius:999px;color:#f5dd99;font:700 12px/1.3 system-ui;text-decoration:none;background:#144451}
.wb36-rack .wb36-tile{touch-action:none;user-select:none}
.wb372-drag-ghost{position:fixed!important;left:0!important;top:0!important;pointer-events:none!important;z-index:10000!important;width:45px!important;height:45px!important;opacity:.95;will-change:transform;transition:none!important;box-shadow:0 6px 19px #000b,0 0 14px #ffe2a280!important}
.wb36-cell.wb372-drop-target{outline:3px solid #ffe0a0!important;background:#47717b!important;box-shadow:0 0 0 2px #f1b35e inset}
@\n--SNIP--\n465px,max(188px,calc(100dvh - 329px)));margin:1px auto 2px;padding:3px;gap:2px}
#wb36.bu67-wb-play .wb36-rack{margin:2px auto 3px;min-height:32px;height:clamp(32px,6dvh,40px);width:100%}
#wb36.bu67-wb-play .wb36-tile{min-height:30px;max-height:40px}
#wb36.bu67-wb-play .wb37-actions{margin:2px auto 0;gap:4px;width:100%}
#wb36.bu67-wb-play .wb37-tools{gap:4px}
#wb36.bu67-wb-play .wb37-actions>.wb36-primary{min-height:40px;padding:5px 8px;font-size:14px}
#wb36.bu67-wb-play .wb37-tools>.wb36-outline{min-height:39px;padding:5px 1px;font-size:11px}
#wb36.bu67-wb-play .wb36-statu\n--SNIP--\n\n## CSS / HTML decoded wb36-players: count=1\n--SNIP--\nction wb36PlayerIndex(g){return g.turn%g.players.length}
function wb36Scores(g){return `<div class="wb36-players wb37-mini-players">${g.players.map((name,i)=>`<div class="wb36-player ${i===wb36PlayerIndex(g)?'active':''}"><b>${WB36_ESC(name)}</b><small>${g.scores[i]} pts</small></div>`).join('')}</div>`}
function wb36PauseUI(b){const g=wb36Game;b.innerHTML=`<div class="wb36-hero"><span class="wb36-sub">PAUSED</span><h2>Match Saved</h2><p>${g?g.players.length+' player'+(g.players.length!==1?'s':'')+' · turn '+(g.turn+1)+' of '+g.maxTurns:'Your game'}</p></div><button class="wb\n--SNIP--\n\n## CSS / HTML decoded wb36-player: count=2\n--SNIP--\nction wb36PlayerIndex(g){return g.turn%g.players.length}
function wb36Scores(g){return `<div class="wb36-players wb37-mini-players">${g.players.map((name,i)=>`<div class="wb36-player ${i===wb36PlayerIndex(g)?'active':''}"><b>${WB36_ESC(name)}</b><small>${g.scores[i]} pts</small></div>`).join('')}</div>`}
function wb36PauseUI(b){const g=wb36Game;b.innerHTML=`<div class="wb36-hero"><span class="wb36-sub">PAUSED</span><h2>Match Saved</h2><p>${g?g.players.length+' player'+(g.players.length!==1?'s':'')+' · turn '+(g.turn+1)+' of '+g.maxTurns:'Your game'}</p></div><button class="w\n--SNIP--\ncores(g){return `<div class="wb36-players wb37-mini-players">${g.players.map((name,i)=>`<div class="wb36-player ${i===wb36PlayerIndex(g)?'active':''}"><b>${WB36_ESC(name)}</b><small>${g.scores[i]} pts</small></div>`).join('')}</div>`}
function wb36PauseUI(b){const g=wb36Game;b.innerHTML=`<div class="wb36-hero"><span class="wb36-sub">PAUSED</span><h2>Match Saved</h2><p>${g?g.players.length+' player'+(g.players.length!==1?'s':'')+' · turn '+(g.turn+1)+' of '+g.maxTurns:'Your game'}</p></div><button class="wb36-btn wb36-block" id="wb36-continue">▶ Resume This Turn</button><butt\n--SNIP--\n\n## CSS / HTML decoded wb37-mini-players: count=1\n--SNIP--\nyerIndex(g){return g.turn%g.players.length}
function wb36Scores(g){return `<div class="wb36-players wb37-mini-players">${g.players.map((name,i)=>`<div class="wb36-player ${i===wb36PlayerIndex(g)?'active':''}"><b>${WB36_ESC(name)}</b><small>${g.scores[i]} pts</small></div>`).join('')}</div>`}
function wb36PauseUI(b){const g=wb36Game;b.innerHTML=`<div class="wb36-hero"><span class="wb36-sub">PAUSED</span><h2>Match Saved</h2><p>${g?g.players.length+' player'+(g.players.length!==1?'s':'')+' · turn '+(g.turn+1)+' of '+g.maxTurns:'Your game'}</p></div><button class="wb36-btn wb36-block"\n--SNIP--\n\n## CSS / HTML decoded wb37-scorebar: count=1\n--SNIP--\ny(g):null;const draftScore=Object.keys(g.draft).length?wb36Check(g):null;
 b.innerHTML=`<div class="wb37-scorebar"><span>Turn ${g.turn+1}/${g.maxTurns} · ${wb380Strategy(g)==='master'?'Master':wb380Strategy(g)==='balanced'?'Balanced':'Relaxed'}</span><strong>${g.players.length===1?`✦ ${g.scores[0]} pts`:`${WB36_ESC(g.players[wb36PlayerIndex(g)])} · ${g.scores[wb36PlayerIndex(g)]} pts`}</strong><span class="wb39-wallet" aria-label="Achievement Points ${economy.points} and Insight Tokens ${economy.coins}">✦ ${economy.points.toLocaleString()} Points · ◉ ${economy.coins.toLocaleSt\n--SNIP--\n\n## CSS / HTML decoded wb39-wallet: count=1\n--SNIP--\n36_ESC(g.players[wb36PlayerIndex(g)])} · ${g.scores[wb36PlayerIndex(g)]} pts`}</strong><span class="wb39-wallet" aria-label="Achievement Points ${economy.points} and Insight Tokens ${economy.coins}">✦ ${economy.points.toLocaleString()} Points · ◉ ${economy.coins.toLocaleString()} Tokens</span>${available?'<button class="wb362-clue-indicator" id="wb362-clue" aria-label="A Bible bonus word can be played. Show clue" title="Bible bonus word nearby">✦</button>':''}<button class="wb37-help" id="wb37-help" aria-label="Word Builder instructions">?</button></div>${g.players.length>1?\n--SNIP--\n\n## CSS / HTML decoded wb36-message: count=0\n--SNIP--\n\n## CSS / HTML decoded wb36-msg: count=0\n--SNIP--\n\n## CSS / HTML decoded wb36-last: count=0\n--SNIP--\n\n## CSS / HTML decoded wb36-status: count=1\n--SNIP--\nOINTS[t.letter]||1}</small></button>`).join('')}</div>
 ${wb380ScorePreview(draftScore)}<div class="wb36-status ${wb36Message?'has-message':''}" role="status">${WB36_ESC(wb36Message)}</div>
 <div class="wb37-actions"><button class="wb36-btn wb36-primary" id="wb36-submit" ${Object.keys(g.draft).length?'':'disabled'}>✓ Play Word</button><div class="wb37-tools"><button class="wb36-outline" id="wb36-try" aria-label="Suggest a free word (never costs Insight Tokens)" title="Idea (free)"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width=\n--SNIP--\n\n## CSS / HTML decoded wb36-foot: count=1\n--SNIP--\n</button><button id="wb36-solo" class="wb36-outline">▶ Solo Challenge</button></div></div><p class="wb36-foot">All words are validated offline. No online accounts required.</p>`;
 b.querySelector('#wb36-new').onclick=()=>{wb36View='setup';wb36Render()};b.querySelector('#wb36-how').onclick=()=>{wb36View='help';wb36Render()};b.querySelector('#wb36-solo').onclick=()=>{wb36Setup.people=['You'];wb36View='setup';wb36Render()};
 b.querySelector('#wb36-resume')?.addEventListener('click',()=>{wb36View='game';wb36Render()});}
function wb36SetupUI(b){const s=wb36Setup;b.innerHTML=`<d\n--SNIP--\n\n## CSS / HTML decoded wb36-board: count=1\n--SNIP--\nder instructions">?</button></div>${g.players.length>1?wb36Scores(g):wb380GoalMark(g)}
 <div class="wb36-board" role="group" aria-label="Nine by nine word building board">${g.board.map((_,i)=>wb36RenderCell(g,i)).join('')}</div>
 <div class="wb36-rack" role="group" aria-label="Your seven letter tiles">${g.rack.map(t=>`<button class="wb36-tile ${wb36Selected===t.id?'selected':''}" data-wb-tile="${t.id}" aria-label="Tile ${t.letter} worth ${WB36_POINTS[t.letter]||1} points">${t.letter}<small>${WB36_POINTS[t.letter]||1}</small></button>`).join('')}</div>
 ${wb380ScorePreview(d\n--SNIP--\n\n## CSS / HTML decoded wb36-main: count=4\n--SNIP--\n}
const wb36Screen=()=>document.getElementById('wb36'); const wb36Body=()=>document.getElementById('wb36-main'); const wb36Visible=()=>!wb36Screen().hidden;
function wb36Save(){
  let payload;try{payload=JSON.stringify({setup:wb36Setup,game:wb36Game})}catch(_){return}
  try{localStorage.setItem(WB388_BACKUP_KEY,payload)}catch(_){}
  try{localStorage.setItem(WB36_KEY,payload)}catch(_){}
}
function wb36FocusTop(){wb36Body().scrollTop=0}
function wb36Open(view='hub'){
 startAudio();hideAll();closeMenu();closeDialog();stopWatch();wb36Screen().hidden=false;wb36View=view;wb36Sel\n--SNIP--\nne wb36-block" id="wb36-home">‹ Word Builder Home</button><button class="wb36-ghost wb36-block" id="wb36-mainhome">Return to Main Menu</button>`;b.querySelector('#wb36-continue').onclick=()=>{wb36View='game';wb36Render()};b.querySelector('#wb36-home').onclick=wb36Home;b.querySelector('#wb36-mainhome').onclick=wb36Exit}
function wb36HelpUI(b){b.innerHTML=`<div class="wb36-hero"><span class="wb36-sub">GAME GUIDE</span><h2>Learn Word Builder</h2></div><div class="wb36-card wb36-help"><p><strong>1.</strong> Tap a rack tile, then an empty board square. Tap a glowing provisional\n--SNIP--\n()=>{wb36View='game';wb36Render()};b.querySelector('#wb36-home').onclick=wb36Home;b.querySelector('#wb36-mainhome').onclick=wb36Exit}
function wb36HelpUI(b){b.innerHTML=`<div class="wb36-hero"><span class="wb36-sub">GAME GUIDE</span><h2>Learn Word Builder</h2></div><div class="wb36-card wb36-help"><p><strong>1.</strong> Tap a rack tile, then an empty board square. Tap a glowing provisional tile to take it back.</p><p><strong>2.</strong> The first word must cross the ★ center. Later words must connect with existing letters. Place new letters in one straight line, without ga\n--SNIP--\nontinue','▶','Resume','Resume current turn'],['wb36-home','▦','Word Builder','Word Builder home'],['wb36-mainhome','⌂','Home','Bible Unfolded home']];
 const nav=document.createElement('div');nav.className='bu386-pause-nav';
 const first=b.querySelector('#wb36-continue');if(first){first.before(nav);for(const [id,glyph,short,long] of buttons){const btn=b.querySelector('#'+id);if(btn){btn.textContent='';btn.innerHTML=`<span class="glyph" aria-hidden="true">${glyph}</span><small>${short}</small>`;btn.title=long;btn.setAttribute('aria-label',long);nav.appendChild(btn)}}}
};
//\n--SNIP--\n\n## CSS / HTML decoded wb36-rack: count=1\n--SNIP--\nby nine word building board">${g.board.map((_,i)=>wb36RenderCell(g,i)).join('')}</div>
 <div class="wb36-rack" role="group" aria-label="Your seven letter tiles">${g.rack.map(t=>`<button class="wb36-tile ${wb36Selected===t.id?'selected':''}" data-wb-tile="${t.id}" aria-label="Tile ${t.letter} worth ${WB36_POINTS[t.letter]||1} points">${t.letter}<small>${WB36_POINTS[t.letter]||1}</small></button>`).join('')}</div>
 ${wb380ScorePreview(draftScore)}<div class="wb36-status ${wb36Message?'has-message':''}" role="status">${WB36_ESC(wb36Message)}</div>
 <div class="wb37-actions"><
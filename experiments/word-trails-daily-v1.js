/* Bible Unfolded · Daily Word Trail v1
 * Isolated Visual Lab experiment: 39 already curated Word Trails boards rotate
 * once per LOCAL calendar day. No native wallet, points, Insight Tokens, levels,
 * voice preferences, or existing Word Trails save keys are read or written.
 * Reuses original author-approved NWT/JW.org content and scenic assets. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const STORAGE_KEY='bu-visual-lab-daily-word-trail-v1';
const DAY_MS=86400000;
const packs=[window.BUWTAdditionalLevels,window.BUWTLevels31to35,window.BUWTLevels36to40,window.BUWTLevels41to45,window.BUWTLevels46to50];
const source=packs.flatMap(x=>Array.isArray(x)?x:[]);
const board=$('daily-board'),wheel=$('daily-wheel'),lines=$('daily-lines');
const isLocal=/^(localhost|127\.0\.0\.1)$/.test(location.hostname);
const qaDate=isLocal&&/^\d{4}-\d{2}-\d{2}$/.test(new URLSearchParams(location.search).get('qaDate')||'')?new URLSearchParams(location.search).get('qaDate'):null;
function localDay(){
 if(qaDate)return qaDate;
 const d=new Date(),part=n=>String(n).padStart(2,'0');
 return d.getFullYear()+'-'+part(d.getMonth()+1)+'-'+part(d.getDate());
}
function dayOrdinal(day){
 const [year,month,date]=day.split('-').map(Number);
 return Math.floor(Date.UTC(year,month-1,date)/DAY_MS);
}
function sourceIndex(day){return ((dayOrdinal(day)*7)%source.length+source.length)%source.length;}
function validWord(s){return /^[A-Z]{2,12}$/.test(s);}
function canMake(rack,word){
 const letters=[...rack];
 for(const ch of word){const i=letters.indexOf(ch);if(i<0)return false;letters.splice(i,1);}
 return true;
}
function validateSource(){
 if(source.length!==39)throw Error('Daily catalog expected 39 existing, approved TEST puzzles; found '+source.length);
 for(const [idx,lev] of source.entries()){
  const n=lev.size||5;
  if(![5,6,7].includes(n)||!validWord(lev.rack)||!Array.isArray(lev.words)||lev.words.length<3||!Array.isArray(lev.bibleBoard)||!lev.bibleBoard.length)throw Error('Incomplete Daily Trail '+idx);
  if(!lev.scene||!/^[-\w]+\.webp$/.test(lev.scene))throw Error('Missing approved existing scene '+idx);
  const written=new Map(),words=new Set();
  for(const [word,row,col,axis] of lev.words){
   if(!validWord(word)||words.has(word)||!canMake(lev.rack,word)||!Number.isInteger(row)||!Number.isInteger(col)||!['across','down'].includes(axis))throw Error('Invalid daily word '+idx+':'+word);
   words.add(word);
   for(let i=0;i<word.length;i++){
    const r=row+(axis==='down'?i:0),c=col+(axis==='across'?i:0),key=r+'-'+c;
    if(r<0||c<0||r>=n||c>=n)throw Error('Daily word outside board '+idx+':'+word);
    if(written.has(key)&&written.get(key)!==word[i])throw Error('Daily crossing mismatch '+idx+':'+word);
    written.set(key,word[i]);
   }
  }
  const bible=lev.bibleBoard[0];
  if(!bible.insight||!bible.reference||!/^https:\/\/www\.jw\.org\/en\/library\/bible\/nwt\/books\/[-\w]+\/\d+\/$/.test(bible.url))throw Error('Missing original NWT source '+idx);
 }
}
function emptyState(){return {version:1,days:{}};}
function readState(){
 try{
  const data=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
  if(!data||data.version!==1||!data.days||typeof data.days!=='object'||Array.isArray(data.days))return emptyState();
  const result=emptyState();
  for(const key of Object.keys(data.days).filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x)).sort().slice(-400)){
   const entry=data.days[key];
   if(!entry||typeof entry!=='object')continue;
   result.days[key]={
    board:Number(entry.board),
    solved:Array.isArray(entry.solved)?entry.solved.filter(validWord).slice(0,12):[],
    hints:Array.isArray(entry.hints)?entry.hints.filter(x=>/^[0-6]-[0-6]$/.test(x)).slice(0,2):[],
    completed:entry.completed===true
   };
  }
  return result;
 }catch(_){return emptyState();}
}
let lastSubmission='',lastTrace={};
let state=readState(),today='',index=0,level=null,cells=new Map(),record=null,chosen=[],letters=[],drag=null,suppressClickUntil=0;
function makeBoard(lev){
 const b=new Map();
 for(const [word,row,col,axis] of lev.words){
  for(let i=0;i<word.length;i++){
   const r=row+(axis==='down'?i:0),c=col+(axis==='across'?i:0),key=r+'-'+c;
   if(!b.has(key))b.set(key,{key,r,c,letter:word[i],words:[]});
   b.get(key).words.push(word);
  }
 }
 return b;
}
function makeRecord(){return {board:index,solved:[],hints:[],completed:false};}
function loadToday(){
 today=localDay();index=sourceIndex(today);level=source[index];cells=makeBoard(level);state=readState();
 const prior=state.days[today];
 record=prior&&prior.board===index?prior:makeRecord();
 record.solved=record.solved.filter(w=>level.words.some(x=>x[0]===w));
 record.hints=record.hints.filter(key=>cells.has(key));
 state.days[today]=record;chosen=[];letters=[...level.rack];suppressClickUntil=0;
 renderAll();
}
function sameDay(){
 if(localDay()===today)return true;
 loadToday();
 flash('A new Daily Word Trail is ready!');
 return false;
}
function saveRecord(){
 // Only this experiment's own key. Preserve stamps saved in other tabs/days.
 const fresh=readState();
 const existing=fresh.days[today];
 if(existing?.completed)record.completed=true;
 fresh.days[today]={board:index,solved:[...new Set(record.solved)],hints:[...new Set(record.hints)].slice(0,2),completed:!!record.completed};
 state=fresh;
 try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch(_){flash('Progress could not be saved on this device.');}
}
function stampCount(){return Object.values(state.days).filter(x=>x.completed).length;}
function solvedWord(word){return record.solved.includes(word);}
function isShown(cell){return record.hints.includes(cell.key)||cell.words.some(solvedWord);}
function renderBoard(){
 const n=level.size||5;board.style.setProperty('--grid-size',n);board.replaceChildren();
 const wrap=document.createDocumentFragment();
 for(let r=0;r<n;r++)for(let c=0;c<n;c++){
  const key=r+'-'+c,cell=cells.get(key),node=document.createElement('div');
  node.className='daily-tile'+(!cell?' empty':cell.words.some(solvedWord)?' solved':record.hints.includes(key)?' hinted':'');
  node.dataset.pos=key;
  if(cell){
   node.textContent=isShown(cell)?cell.letter:'';
   node.setAttribute('aria-label',(isShown(cell)?cell.letter:'Hidden letter')+' row '+(r+1)+' column '+(c+1));
  } else node.setAttribute('aria-hidden','true');
  wrap.append(node);
 }
 board.append(wrap);
}
function renderWheel(){
 wheel.querySelectorAll('.daily-wheel-letter').forEach(el=>el.remove());
 const n=letters.length;
 letters.forEach((letter,i)=>{
  const angle=i*2*Math.PI/n,x=50+39*Math.sin(angle),y=50-39*Math.cos(angle);
  const b=document.createElement('button');
  b.type='button';b.className='daily-wheel-letter';b.textContent=letter;
  b.dataset.letterIndex=String(i);
  b.dataset.x=String(x*2);b.dataset.y=String(y*2);
  b.style.left=x+'%';b.style.top=y+'%';
  b.setAttribute('aria-label','Letter '+letter);
  wheel.append(b);
 });
 renderSelection();
}
function renderSelection(){
 const buttons=[...wheel.querySelectorAll('.daily-wheel-letter')];
 buttons.forEach((b,i)=>{const selected=chosen.includes(i);b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});
 $('daily-word').textContent=chosen.map(i=>letters[i]).join('');
 lines.replaceChildren();
 for(let j=1;j<chosen.length;j++){
  const a=buttons[chosen[j-1]],b=buttons[chosen[j]],line=document.createElementNS('http://www.w3.org/2000/svg','line');
  line.setAttribute('x1',a.dataset.x);line.setAttribute('y1',a.dataset.y);line.setAttribute('x2',b.dataset.x);line.setAttribute('y2',b.dataset.y);lines.append(line);
 }
}
function clearWord(){chosen=[];renderSelection();}
function selectLetter(i){
 if(!sameDay()||record.completed&&record.solved.length===level.words.length)return;
 if(!Number.isInteger(i)||i<0||i>=letters.length)return;
 if(chosen.includes(i)){if(chosen.at(-1)===i){chosen.pop();renderSelection();}return;}
 chosen.push(i);renderSelection();
}
function flash(msg){$('daily-feedback').textContent=msg;}
function updateLabels(){
 const n=level.words.length;
 $('daily-date').textContent=new Date(today+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric',weekday:'short'}).toUpperCase();
 $('daily-title').textContent=level.title;
 $('daily-progress').textContent=record.solved.length+' / '+n+' WORDS';
 $('stamp-count').textContent=String(stampCount());
 const remains=Math.max(0,2-record.hints.length);
 $('daily-hints').textContent=remains+' free '+(remains===1?'hint':'hints');
 $('daily-hint').disabled=remains===0||record.solved.length===n;
 $('daily-submit').disabled=record.solved.length===n;
 document.documentElement.style.setProperty('--daily-scene','url("../bible-book-art/'+level.scene+'")');
}
function renderAll(){renderBoard();renderWheel();updateLabels();flash(record.solved.length===level.words.length?'✦ Today’s Discovery Stamp is yours!':'Find the words hidden in the crossword.');}
function submit(){
 if(!sameDay())return;
 const word=chosen.map(i=>letters[i]).join('');lastSubmission=word;
 clearWord();
 if(!word)return flash('Tap or swipe letters to make a word.');
 const valid=level.words.some(x=>x[0]===word);
 if(!valid)return flash('Not on today’s trail. Try another word.');
 if(solvedWord(word))return flash('You already found '+word+'.');
 record.solved.push(word);saveRecord();renderBoard();updateLabels();
 if(record.solved.length===level.words.length){
  const firstTime=!record.completed;
  record.completed=true;saveRecord();updateLabels();
  flash(firstTime?'✦ Discovery Stamp earned!':'✦ Today’s trail complete again!');
  showFinish(firstTime);
 }else flash('Nice find! '+record.solved.length+' of '+level.words.length+' words.');
}
function hint(){
 if(!sameDay())return;
 if(record.hints.length>=2)return flash('You’ve used today’s two free hints.');
 if(record.solved.length===level.words.length)return;
 const candidates=[...cells.values()].filter(x=>!isShown(x));
 if(!candidates.length)return flash('Every remaining letter is already visible.');
 candidates.sort((a,b)=>b.words.length-a.words.length||a.r-b.r||a.c-b.c);
 const cell=candidates[0];
 record.hints.push(cell.key);saveRecord();renderBoard();updateLabels();
 flash('Free hint: '+cell.letter+' revealed.');
}
function shuffle(){
 if(!sameDay())return;
 const initial=letters.join('');
 for(let tries=0;tries<12;tries++){
  const copy=[...letters];
  for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}
  if(copy.join('')!==initial){letters=copy;break;}
 }
 chosen=[];renderWheel();flash('Letters shuffled.');
}
function thought(){
 return level.bibleBoard[0];
}
function showFinish(firstTime){
 const bible=thought();
 $('finish-title').textContent=firstTime?'Discovery Stamp earned!':'Daily Trail completed!';
 $('finish-caption').textContent=firstTime?'A little Bible discovery for your collection.':'Your stamp is already safely in your collection.';
 $('daily-thought').textContent=bible.insight;
 $('thought-heading').textContent='A Bible thought · '+bible.reference;
 $('daily-source').href=bible.url;
 $('daily-source').textContent='Read '+bible.reference+' on JW.org';
 if(!$('daily-finish').open)$('daily-finish').showModal();
}
function showCollection(){
 if(!sameDay())return;
 const stampList=$('daily-stamps');stampList.replaceChildren();
 const entries=Object.entries(state.days).filter(([,v])=>v.completed).sort((a,b)=>b[0].localeCompare(a[0]));
 if(!entries.length){
  const p=document.createElement('p');p.textContent='Finish today’s puzzle to collect your first Discovery Stamp.';stampList.append(p);
 }else{
  for(const [date,entry] of entries.slice(0,100)){
   const row=document.createElement('div');row.className='stamp-row';
   const label=document.createElement('span');label.textContent=date+' · '+(source[entry.board]?.title||'Bible discovery');
   const star=document.createElement('b');star.textContent='✦';
   row.append(label,star);stampList.append(row);
  }
 }
 if(!$('daily-collection').open)$('daily-collection').showModal();
}
function replay(){
 $('daily-finish').close();
 if(!sameDay())return;
 record.solved=[];record.hints=[]; // earned completion stays true: never a second stamp
 saveRecord();chosen=[];renderAll();flash('Replay freely! Your stamp is already collected.');
}
wheel.addEventListener('click',event=>{
 const b=event.target.closest('.daily-wheel-letter');
 if(b&&performance.now()>=suppressClickUntil)selectLetter(Number(b.dataset.letterIndex));
});
wheel.addEventListener('pointerdown',event=>{
 const b=event.target.closest('.daily-wheel-letter');
 if(!b||!sameDay())return;
 drag={id:event.pointerId,x:event.clientX,y:event.clientY,lastX:event.clientX,lastY:event.clientY,start:Number(b.dataset.letterIndex),tracing:false};
});
document.addEventListener('pointermove',event=>{
 if(!drag||event.pointerId!==drag.id)return;
 const moved=Math.hypot(event.clientX-drag.x,event.clientY-drag.y);
 drag.lastX=event.clientX;drag.lastY=event.clientY;
 if(!drag.tracing&&moved>10){drag.tracing=true;chosen=[];selectLetter(drag.start);}
 if(!drag.tracing)return;
 const b=document.elementFromPoint(event.clientX,event.clientY)?.closest('.daily-wheel-letter');
 if(b&&wheel.contains(b))selectLetter(Number(b.dataset.letterIndex));
});
function finishTrace(x,y){
 if(!drag)return;
 if(drag.tracing){
  // Prefer the actual finger-lift coordinates (touchend.changedTouches) over
  // browsers' sometimes stale/coalesced last pointermove position.
  const b=document.elementFromPoint(x,y)?.closest('.daily-wheel-letter');
  lastTrace={liftX:x,liftY:y,hit:b?.textContent||null,before:chosen.map(i=>letters[i]).join('')};
  if(b&&wheel.contains(b)){
   const id=Number(b.dataset.letterIndex);
   if(!chosen.includes(id))selectLetter(id); // finger lift must not toggle off the last traced tile
  }
  suppressClickUntil=performance.now()+350;
  submit();
 }
 drag=null;
}
document.addEventListener('pointerup',event=>{
 if(!drag||event.pointerId!==drag.id)return;
 // On mobile, touchend carries the authoritative last finger position.
 // Finishing here can lose the final letter on Chrome/Safari touch input.
 if(event.pointerType==='touch')return;
 finishTrace(event.clientX,event.clientY);
});
document.addEventListener('touchend',event=>{
 if(!drag)return;
 const t=event.changedTouches?.[0];
 finishTrace(t?.clientX??drag.lastX,t?.clientY??drag.lastY);
});
document.addEventListener('pointercancel',()=>{drag=null;clearWord();});
$('daily-submit').addEventListener('click',submit);
$('daily-hint').addEventListener('click',hint);
$('daily-shuffle').addEventListener('click',shuffle);
$('collection').addEventListener('click',showCollection);
$('daily-help').addEventListener('click',()=>$('daily-instructions').showModal());
$('daily-help-close').addEventListener('click',()=>$('daily-instructions').close());
$('daily-collection-close').addEventListener('click',()=>$('daily-collection').close());
$('daily-finish-close').addEventListener('click',()=>$('daily-finish').close());
$('daily-replay').addEventListener('click',replay);
document.addEventListener('keydown',event=>{
 if(event.key==='Enter'&&!document.querySelector('dialog[open]')&&document.activeElement?.tagName!=='BUTTON'&&document.activeElement?.tagName!=='A'){event.preventDefault();submit();}
});
window.addEventListener('focus',()=>{if(today&&localDay()!==today)loadToday();});
window.addEventListener('pageshow',()=>{if(today&&localDay()!==today)loadToday();});
window.addEventListener('storage',event=>{
 if(event.key!==STORAGE_KEY)return;
 const fresh=readState(),ext=fresh.days[today];
 if(ext?.completed&&!record.completed){record.completed=true;}
 state=fresh;updateLabels();
});
try{
 validateSource();
 loadToday();
 // Test-only browser instrumentation; not exposed on GitHub Pages.
 if(isLocal)window.BUWT_DAILY_QA=Object.freeze({
  day:()=>today,index:()=>index,boardCount:()=>source.length,
  words:()=>level.words.map(w=>w[0]),
  rack:()=>level.rack,
  stampCount,record:()=>({...record}),
  selectDayDate:()=>localDay(),lastSubmission:()=>lastSubmission,lastTrace:()=>({...lastTrace})
 });
}catch(error){
 console.error('[Daily Word Trail] ',error);
 flash('Daily Word Trail could not open. Please use regular Word Trails for now.');
 $('daily-hint').disabled=true;$('daily-submit').disabled=true;
}
})();
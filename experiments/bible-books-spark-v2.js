/* Bible Unfolded Visual Lab: separate Bible Books • Scripture Sparks V2 clean-layout experiment.
 * Standalone demonstration only. No changes to Story Adventure, Bible Books,
 * live repository, actual scores, saves, or Insight Tokens.
 * Real shared Wordscapes-style wheel + independent optional scripture word. */
(function(){
'use strict';
const ALPHABET='ACTION';
const WORDS=[
  // Wordscapes-clean enlarged tiles: 5 columns × 6 rows.
  // ACTION is the central vertical word; COAT, COIN and TAN cross it.
  // The single six-letter ACTION wheel remains fixed for the whole puzzle.
  {text:'ACTION',row:0,col:2,dir:'down'},
  {text:'COIN',row:3,col:0,dir:'across'},
  {text:'COAT',row:0,col:0,dir:'across'},
  {text:'TAN',row:5,col:0,dir:'across'}
]
const EXTRAS=new Set([
  'ACT','ANTIC','ANTI','CAN','CAT','COT','CON','ION','NOT',
  'OAT','TONIC','TIN','TON','TACO','ICON','IOTA','CIAO',
  'CANTO','CANT','NIT','TIC','COATI','CATION','ATONIC'
]);
const SPARK='CAIN';
const SCRIPTURE='https://www.jw.org/en/library/bible/nwt/books/genesis/4/';
const el=id=>document.getElementById(id);
const wheel=el('wheel'),board=el('board'),preview=el('preview'),modal=el('scroll'),toast=el('toast');
const cells=new Map();
WORDS.forEach((w,wordIndex)=>{
  for(let i=0;i<w.text.length;i++){
    const row=w.row+(w.dir==='down'?i:0),col=w.col+(w.dir==='across'?i:0);
    const key=row+':'+col,letter=w.text[i];
    if(cells.has(key)){
      const previous=cells.get(key);
      if(previous.letter!==letter)throw Error('Crossword cell conflict '+key);
      previous.words.push(wordIndex);
    }else cells.set(key,{key,row,col,letter,words:[wordIndex]});
  }
});
if(cells.size!==14)throw Error('Unexpected 5×6 Crossword board size');
let letters=[],chosen=[],solved=new Set(),bonuses=new Set(),sparkFound=false;
let points=0,hints=3,hinted=new Set(),timer=null;
let dragging=false,dragActive=false,startPos=null,suppressClicksUntil=0,swipePointer=null;
let activeModal=null;
function shuffleArray(input){
  const a=[...input];for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;
  }return a;
}
function flash(text){
  toast.textContent=text;
  toast.classList.add('show');
  clearTimeout(timer);timer=setTimeout(()=>toast.classList.remove('show'),1450);
}
function syncHud(){
  el('solved-count').textContent=solved.size+' / '+WORDS.length;
  el('points').textContent=String(points);
  el('bonus-count').textContent=String(bonuses.size);
  el('hints-left').textContent=String(hints);
  el('hint').disabled=hints<=0 || solved.size===WORDS.length;
  el('spark').classList.toggle('claimed',sparkFound);
  el('spark').setAttribute('aria-label',sparkFound?'Scripture Spark found':'A hidden Scripture Spark may be found');
  el('spark').querySelector('.spark-label').innerHTML=sparkFound?'SPARK<br>FOUND':'SCRIPTURE<br>SPARK';
}
function cellRevealed(cell){
  return cell.words.some(i=>solved.has(WORDS[i].text));
}
function drawBoard(newWord){
  const fragment=document.createDocumentFragment();
  cells.forEach(cell=>{
    const tile=document.createElement('div');
    const revealed=cellRevealed(cell),clueHint=hinted.has(cell.key);
    tile.className='tile'+(revealed?' found':'')+(clueHint&&!revealed?' hinted':'');
    if(newWord&&cell.words.some(i=>WORDS[i].text===newWord))tile.classList.add('new');
    tile.style.gridRow=String(cell.row+1);
    tile.style.gridColumn=String(cell.col+1);
    tile.dataset.cell=cell.key;
    tile.textContent=revealed||clueHint?cell.letter:'';
    tile.setAttribute('aria-label',(revealed||clueHint?'Letter '+cell.letter:'Hidden letter')+', row '+(cell.row+1)+', column '+(cell.col+1));
    fragment.appendChild(tile);
  });
  board.replaceChildren(fragment);
  syncHud();
}
function positions(){
  const d=wheel.getBoundingClientRect().width,r=d*.365;
  return letters.map((letter,i)=>{
    const theta=-Math.PI/2+Math.PI*2*i/letters.length;
    return {x:d/2+Math.cos(theta)*r,y:d/2+Math.sin(theta)*r};
  });
}
function drawWheel(){
  wheel.querySelectorAll('.wheel-letter').forEach(x=>x.remove());
  const pos=positions();
  letters.forEach((letter,i)=>{
    const b=document.createElement('button');
    b.type='button';b.className='wheel-letter';
    b.dataset.wheelIndex=String(i);b.textContent=letter;
    b.setAttribute('aria-label','Letter '+letter);
    b.style.left=pos[i].x+'px';b.style.top=pos[i].y+'px';
    b.addEventListener('click',()=>{
      if(performance.now()<suppressClicksUntil)return;
      tap(i);
    });
    wheel.appendChild(b);
  });
  updateSelection();
}
function updateSelection(){
  const text=chosen.map(i=>letters[i]).join('');
  preview.textContent=text;
  preview.classList.toggle('visible',text.length>0);
  wheel.querySelectorAll('.wheel-letter').forEach(b=>{
    b.classList.toggle('selected',chosen.includes(Number(b.dataset.wheelIndex)));
  });
  const pos=positions(),svg=el('selection-lines');
  svg.setAttribute('viewBox','0 0 '+wheel.clientWidth+' '+wheel.clientHeight);
  svg.replaceChildren();
  if(chosen.length>1){
    const poly=document.createElementNS('http://www.w3.org/2000/svg','polyline');
    poly.setAttribute('points',chosen.map(i=>pos[i].x+','+pos[i].y).join(' '));
    svg.appendChild(poly);
  }
}
function tap(index){
  if(chosen.includes(index)){
    chosen=chosen.filter(i=>i!==index);
  }else{
    chosen.push(index);
  }
  updateSelection();
}
function clearSelection(){
  chosen=[];updateSelection();
}
function canMake(word){
  const count={};for(const x of ALPHABET)count[x]=(count[x]||0)+1;
  for(const x of word){
    count[x]=(count[x]||0)-1;
    if(count[x]<0)return false;
  }
  return true;
}
function openScroll(kind,title,paragraph){
  activeModal=kind;
  el('scroll-tag').textContent=kind==='spark'?'★ SCRIPTURE SPARK':'✦ GENESIS CROSSWORD';
  el('scroll-heading').textContent=title;
  el('scroll-text').textContent=paragraph;
  const scripture=el('scroll-scripture');
  scripture.hidden=kind!=='spark';scripture.href=SCRIPTURE;
  scripture.textContent='Read Genesis 4:1, 2 on JW.org ↗';
  el('scroll-next').textContent=kind==='complete'?'Continue Playing':'Keep Playing';
  if(!modal.open)modal.showModal();
}
function showFound(word){
  solved.add(word);
  points+=10;
  drawBoard(word);
  flash('✦ '+word+' discovered!  +10');
  if(solved.size===WORDS.length){
    setTimeout(()=>{
      if(solved.size===WORDS.length&&!modal.open){
        const copy=sparkFound?
          'You found all six crossword words and discovered the hidden Scripture Spark. Great exploring!':
          'You completed all four crossword words with one letter wheel. The optional Scripture Spark is still waiting if you want to look for it.';
        openScroll('complete','Crossword Complete!',copy);
      }
    },380);
  }
}
function submit(){
  if(!chosen.length){flash('Trace or tap a word first');return;}
  const word=chosen.map(i=>letters[i]).join('');
  clearSelection();
  if(word.length<3){flash('Try a word with three or more letters');return;}
  if(!canMake(word)){flash('Those letters are not available');return;}
  if(word===SPARK){
    if(sparkFound){flash('Scripture Spark already discovered');return;}
    sparkFound=true;points+=25;syncHud();
    openScroll('spark','CAIN · Genesis','Genesis 4:1, 2 describes Cain as the first son born to Adam and Eve. Cain cultivated the ground, while his brother Abel became a shepherd.');
    return;
  }
  if(WORDS.some(w=>w.text===word)){
    if(solved.has(word)){flash('Already on your crossword');return;}
    showFound(word);return;
  }
  if(EXTRAS.has(word)){
    if(bonuses.has(word)){flash('Bonus word already collected');return;}
    bonuses.add(word);points+=3;syncHud();flash('Bonus word '+word+'  +3');
    return;
  }
  flash('Not in this sample word list');
}
function hint(){
  if(!hints){flash('No more hints in this test');return;}
  if(solved.size===WORDS.length){flash('Crossword complete!');return;}
  const candidates=[...cells.values()].filter(c=>!cellRevealed(c)&&!hinted.has(c.key));
  if(!candidates.length)return;
  // Prefer intersection cells so each limited hint has meaningful value.
  candidates.sort((a,b)=>b.words.length-a.words.length);
  const tile=candidates[0];
  hints--;points=Math.max(0,points-8);
  hinted.add(tile.key);drawBoard();
  flash('Letter revealed · −8 test points');
}
function reset(showNotice){
  solved=new Set();bonuses=new Set();sparkFound=false;points=0;hints=3;hinted=new Set();
  letters=shuffleArray([...ALPHABET]);chosen=[];
  el('spark-info').hidden=true;
  if(modal.open)modal.close();
  drawBoard();drawWheel();syncHud();
  if(showNotice!==false)flash('New test round · same six letters');
}
function shuffle(){
  const previous=letters.join('');
  let copy=letters;
  for(let i=0;i<8;i++){
    copy=shuffleArray(letters);
    if(copy.join('')!==previous)break;
  }
  letters=copy;clearSelection();drawWheel();
  flash('Same letters, new order');
}
function onSparkTap(){
  if(sparkFound){flash('★ Scripture Spark discovered!');return;}
  const p=el('spark-info');p.hidden=!p.hidden;
  el('spark').setAttribute('aria-expanded',String(!p.hidden));
}
function cancelDrag(){
  dragging=false;dragActive=false;swipePointer=null;startPos=null;
}
wheel.addEventListener('pointerdown',e=>{
  const btn=e.target.closest('.wheel-letter');
  if(!btn)return;
  dragging=true;dragActive=false;
  swipePointer=e.pointerId;
  startPos={x:e.clientX,y:e.clientY,index:Number(btn.dataset.wheelIndex)};
  try{wheel.setPointerCapture(e.pointerId);}catch(_){}
});
wheel.addEventListener('pointermove',e=>{
  if(!dragging||e.pointerId!==swipePointer||!startPos)return;
  const dist=Math.hypot(e.clientX-startPos.x,e.clientY-startPos.y);
  if(!dragActive&&dist>10){
    dragActive=true;
    chosen=[startPos.index];updateSelection();
  }
  if(!dragActive)return;
  const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('.wheel-letter');
  if(target&&wheel.contains(target)){
    const index=Number(target.dataset.wheelIndex);
    if(!chosen.includes(index)){chosen.push(index);updateSelection();}
  }
});
wheel.addEventListener('pointerup',e=>{
  if(!dragging||e.pointerId!==swipePointer)return;
  const wasDrag=dragActive;
  cancelDrag();
  if(wasDrag){
    suppressClicksUntil=performance.now()+180;
    submit();
  }
});
wheel.addEventListener('pointercancel',e=>{
  if(e.pointerId===swipePointer){cancelDrag();clearSelection();}
});
el('submit').addEventListener('click',submit);
el('shuffle').addEventListener('click',shuffle);
el('hint').addEventListener('click',hint);
el('spark').addEventListener('click',onSparkTap);
el('spark-dismiss').addEventListener('click',()=>{el('spark-info').hidden=true;el('spark').setAttribute('aria-expanded','false');});
el('scroll-next').addEventListener('click',()=>modal.close());
el('scroll-x').addEventListener('click',()=>modal.close());
el('reset').addEventListener('click',reset);
modal.addEventListener('cancel',e=>{e.preventDefault();modal.close();});
window.addEventListener('resize',drawWheel);
window.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&!modal.open){el('spark-info').hidden=true;el('spark').setAttribute('aria-expanded','false');}
  if(e.key==='Enter'&&!modal.open&&document.activeElement===wheel){submit();}
});
// Prototype state lives only on this page: no localStorage, no real scoring.
reset(false);
})();

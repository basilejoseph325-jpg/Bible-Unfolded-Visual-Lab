/* Visual Lab QA candidate: 30 Bible levels, milestone prizes and authentic announcer clips.
   LIVE RELEASE BLOCKED until docs/WORD_TRAILS_PRE_LIVE_SHARED_CORE_RELEASE_GATE.md
   is satisfied; TEST gameplay uses its own protected test coins. */
/* BIBLE UNFOLDED | WORD TRAILS NEXT V1
   Visual Lab-only replacement experience. Never reads or writes live-game scores.
   Original Web Audio cues; the existing game-owned Word Trails music is reused.
   Levels deliberately show familiar wordplay, with a single OPTIONAL Scripture Spark. */
(()=>{'use strict';
const LEVELS=[
 {rack:'ACTION',title:'The Beginning',scene:'01_genesis.webp',spark:'CAIN',
  clue:'The first son of Adam and Eve',reference:'Genesis 4:1, 2',url:'https://www.jw.org/en/library/bible/nwt/books/genesis/4/',
  insight:'Genesis 4:1, 2 identifies Cain as the first son of Adam and Eve. He became a cultivator of the ground, while his brother Abel cared for sheep.',
  words:[['ANTIC',0,0,'down'],['TACO',0,4,'down'],['TONIC',2,0,'across'],['COIN',4,0,'across']],
  bonus:'ACT ANT CAT CAN COT CON ION NOT OAT TAN TIN TON TIC COAT INTO ANTI CANTO CANT NIT CIAO IOTA CATION ATONIC'},
 {rack:'DENIER',title:'A Garden Home',scene:'01_genesis.webp',spark:'EDEN',
  clue:'The garden Jehovah planted for the first man',reference:'Genesis 2:8',url:'https://www.jw.org/en/library/bible/nwt/books/genesis/2/',
  insight:'Genesis 2:8 says Jehovah God planted a garden in Eden, toward the east, and put the man he had formed there.',
  words:[['DINER',0,3,'down'],['RIDE',0,1,'across'],['DINE',2,1,'across'],['DIRE',4,1,'across']],
  bonus:'RED DEN DIE DIN END IRE RID REIN RIND REND NEED DEER REED NERD RINED DIER'},
 {rack:'RAVENS',title:'After the Flood',scene:'01_genesis.webp',spark:'RAVEN',
  clue:'The bird Noah sent out before the dove',reference:'Genesis 8:7',url:'https://www.jw.org/en/library/bible/nwt/books/genesis/8/',
  insight:'Noah sent out a raven from the ark. Genesis 8:7 says it continued flying back and forth until the waters dried from the earth.',
  words:[['RAVE',2,1,'across'],['SEAR',0,2,'down'],['NEAR',1,4,'down'],['VASE',0,0,'across']],
  bonus:'SAVE VANE SANE EARN EARS VANS VAN SEA RAN EAR ARE ERA AVE RAVENS SERVAN RAVES'},
 {rack:'ANGELS',title:'A Message of Hope',scene:'16_nehemiah.webp',spark:'ANGEL',
  clue:'A heavenly messenger who spoke to Hagar',reference:'Genesis 16:7',url:'https://www.jw.org/en/library/bible/nwt/books/genesis/16/',
  insight:'Genesis 16:7 records that Jehovah’s angel found Hagar by a spring of water in the wilderness. His message gave her direction at a difficult moment.',
  words:[['LANE',2,0,'across'],['GLEAN',0,3,'down'],['SALE',0,0,'down'],['SANE',4,1,'across'],['SANG',0,0,'across']],
  bonus:'LEAN SAGE GALE SEAL AGES AGE GAS GEL LAG LEG NAG SAG LENS LAGS SLANG SAGE'},
 {rack:'ISRAEL',title:'A New Name',scene:'01_genesis.webp',spark:'ISRAEL',
  clue:'The new name given to Jacob after he wrestled',reference:'Genesis 32:28',url:'https://www.jw.org/en/library/bible/nwt/books/genesis/32/',
  insight:'Genesis 32:28 says Jacob was given the name Israel after his struggle. That name later became associated with the nation that descended from him.',
  words:[['ARISE',2,0,'across'],['AISLE',0,3,'down'],['LASER',4,0,'across'],['REAL',0,1,'across'],['SAIL',1,0,'down']],
  bonus:'RAISE RAIL RISE SEAL LIES LIAR LAIR SIRE EARL LIE SEA AIR EAR ARE ERA ALES SERIA'},
 {rack:'SHEARD',title:'A Family Grows',scene:'08_ruth.webp',spark:'ASHER',
  clue:'One of Jacob’s sons, born to Zilpah',reference:'Genesis 30:12, 13',url:'https://www.jw.org/en/library/bible/nwt/books/genesis/30/',
  insight:'Genesis 30:12, 13 records the birth of Asher, the son of Jacob and Zilpah. Leah connected his name with happiness.',
  words:[['HEARD',1,0,'across'],['HARE',0,2,'down'],['SHARE',0,0,'down'],['DARE',1,4,'down']],
  bonus:'SHARD SHEAR HEARS HEAR HEAD HARD HERS DASH READ DEAR RED SEA HER SHE ASH HAS SAD'},
 {rack:'REPEAT',title:'By the Sea',scene:'44_acts.webp',spark:'PETER',
  clue:'The fisherman Jesus called with his brother Andrew',reference:'Matthew 4:18',url:'https://www.jw.org/en/library/bible/nwt/books/matthew/4/',
  insight:'Matthew 4:18 tells how Jesus saw Simon, who was called Peter, and his brother Andrew casting a fishing net. He invited them to follow him.',
  words:[['PEAT',2,1,'across'],['TAPER',0,1,'down'],['TEAR',0,1,'across'],['TRAP',4,0,'across'],['RATE',0,4,'down']],
  bonus:'PARE PEAR TAPE PART PATER RAPT RAP TAP EAR ARE EAT ATE APE PEA PET PAR TAR RAT ART TREE'},
 {rack:'OLIVES',title:'A Quiet Place',scene:'42_luke.webp',spark:'OLIVES',
  clue:'The mount where Jesus went to pray with disciples nearby',reference:'Luke 22:39',url:'https://www.jw.org/en/library/bible/nwt/books/luke/22/',
  insight:'Luke 22:39 describes Jesus going, as was his custom, to the Mount of Olives, with his disciples following him.',
  words:[['VEILS',2,0,'across'],['LIVES',0,0,'down'],['LIES',0,0,'across'],['SOLE',4,0,'across'],['SOLVE',0,3,'down']],
  bonus:'OLIVE EVILS EVIL OILS VEIL LOVE LIVE VILE VIES ISLE SILO OIL LIE VIE VOLES VOLE'},
 // Progressively larger Wordscapes-style boards: keep tiles chunky until longer answers require more cells.
 {rack:'SAMUEL',size:6,title:'Samuel & Saul',scene:'09_1_samuel.webp',spark:'ELAM',
  clue:'A son of Shem named among the families after the Flood',reference:'Genesis 10:22',
  url:'https://www.jw.org/en/library/bible/nwt/books/genesis/10/',
  insight:'Genesis 10:22 lists Elam among the sons of Shem, along with Asshur, Arpachshad, Lud, and Aram.',
  words:[['SAMUEL',0,2,'down'],['SAUL',3,0,'across'],['MALE',1,1,'across'],['SUM',3,0,'down'],['MULE',5,0,'across']],
  bibleBoard:[
   {word:'SAMUEL',clue:'The boy who responded when Jehovah called his name',reference:'1 Samuel 3:4-10',
    url:'https://www.jw.org/en/library/bible/nwt/books/1-samuel/3/',
    insight:'Young Samuel responded when Jehovah called him, and Eli helped Samuel understand how to answer (1 Samuel 3:4-10).'},
   {word:'SAUL',clue:'The man Samuel anointed to lead Israel',reference:'1 Samuel 10:1',
    url:'https://www.jw.org/en/library/bible/nwt/books/1-samuel/10/',
    insight:'Samuel poured oil on Saul’s head when Jehovah chose him to lead Israel (1 Samuel 10:1).'}
  ],
  bonus:'AMUSE SAME SEAL MEAL MUSE LAME SEA SUE USE MULES MULE AMUSE MULES'},
 {rack:'GOLIATH',size:7,title:'Goliath',scene:'09_1_samuel.webp',spark:'LOT',
  clue:'Abraham’s nephew who traveled with him',reference:'Genesis 13:5-11',
  url:'https://www.jw.org/en/library/bible/nwt/books/genesis/13/',
  insight:'Lot traveled with Abram and also had flocks and herds. As their households grew, Abram let Lot choose where to live (Genesis 13:5-11).',
  words:[['GATH',1,4,'down'],['GOLIATH',2,0,'across'],['GLOAT',2,0,'down'],['TAIL',6,0,'across'],['ALTO',1,2,'down'],['HALO',2,6,'down']],
  bibleBoard:[
   {word:'GOLIATH',clue:'Philistine champion who challenged Israel',reference:'1 Samuel 17:4',
    url:'https://www.jw.org/en/library/bible/nwt/books/1-samuel/17/',
    insight:'Goliath was the Philistine champion who faced Israel’s army; 1 Samuel 17:4 introduces him by name.'},
   {word:'GATH',clue:'The city Goliath came from',reference:'1 Samuel 17:4',
    url:'https://www.jw.org/en/library/bible/nwt/books/1-samuel/17/',
    insight:'The Bible identifies Goliath as a Philistine champion from Gath (1 Samuel 17:4).'}
  ],
  bonus:'GOAT HAIL OATH TOIL GOAL LIGHT ALIGHT LATH HILT HALT GLOAT ALTO HALO'},
 {rack:'ABRAHAM',size:7,title:'Abraham',scene:'01_genesis.webp',spark:'MARAH',
  clue:'The place where the Israelites found bitter water',reference:'Exodus 15:23-25',
  url:'https://www.jw.org/en/library/bible/nwt/books/exodus/15/',
  insight:'At Marah, the people could not drink the bitter water. Jehovah showed Moses what to do, and the water became sweet (Exodus 15:23-25).',
  words:[['ABRAHAM',0,3,'down'],['ABRAM',2,1,'across'],['HAM',4,3,'across'],['ARM',0,3,'across'],['RAM',6,1,'across']],
  bibleBoard:[
   {word:'ABRAHAM',clue:'The name Jehovah gave Abram as part of his covenant',reference:'Genesis 17:5',
    url:'https://www.jw.org/en/library/bible/nwt/books/genesis/17/',
    insight:'Jehovah renamed Abram Abraham and spoke about making him a father of many nations (Genesis 17:5).'},
   {word:'ABRAM',clue:'Abraham’s earlier name',reference:'Genesis 17:5',
    url:'https://www.jw.org/en/library/bible/nwt/books/genesis/17/',
    insight:'Genesis 17:5 explicitly records the change from Abram to Abraham.'},
   {word:'HAM',clue:'One of Noah’s three sons',reference:'Genesis 9:18',
    url:'https://www.jw.org/en/library/bible/nwt/books/genesis/9/',
    insight:'Ham was one of Noah’s sons who came out of the ark along with Shem and Japheth (Genesis 9:18).'},
   {word:'RAM',clue:'The animal Abraham later found caught in a thicket',reference:'Genesis 22:13',
    url:'https://www.jw.org/en/library/bible/nwt/books/genesis/22/',
    insight:'Abraham found a ram caught in a thicket and offered it instead of Isaac (Genesis 22:13).'}
  ],
  bonus:'HARM BAR MAR BRA MARAH ABRAM HAM ARM RAM'}
];
/* Every level now hides multiple source-verified Bible discoveries.
   Keep the crossword casual, but offer a meaningful optional Bible-word hunt.
   Content is limited to NWT 2013 and the exact JW.org verses cited below. */
const EXTRA_SPARKS=[
 [{word:'ANT',clue:'A tiny worker held up as a lesson in practical wisdom',reference:'Proverbs 6:6-8',
  url:'https://www.jw.org/en/library/bible/nwt/books/proverbs/6/',
  insight:'Proverbs 6:6-8 invites us to observe the ant and learn wisdom from its diligence and preparation.'}],
 [{word:'REED',clue:'A riverside plant that sheltered the basket holding baby Moses',reference:'Exodus 2:3-5',
  url:'https://www.jw.org/en/library/bible/nwt/books/exodus/2/',
  insight:'Exodus 2:3-5 says Moses was placed in a papyrus basket among the reeds by the Nile. Pharaoh’s daughter later found him there.'}],
 [{word:'SEA',clue:'Jesus spoke to this during a violent storm',reference:'Mark 4:37-39',
  url:'https://www.jw.org/en/library/bible/nwt/books/mark/4/',
  insight:'When a storm threatened the boat, Jesus rebuked the wind and commanded the sea to become quiet. A great calm followed (Mark 4:37-39).'}],
 [{word:'SEAL',clue:'The scroll in Revelation chapter 5 had seven of these',reference:'Revelation 5:1',
  url:'https://www.jw.org/en/library/bible/nwt/books/revelation/5/',
  insight:'Revelation 5:1 describes a scroll in the right hand of the One seated on the throne, sealed tight with seven seals.'}],
 [{word:'ELI',clue:'The high priest who spoke with young Samuel',reference:'1 Samuel 3:8, 9',
  url:'https://www.jw.org/en/library/bible/nwt/books/1-samuel/3/',
  insight:'When young Samuel heard his name called at night, Eli eventually understood that Jehovah was calling the boy and instructed him how to respond (1 Samuel 3:8, 9).'}],
 [{word:'SHEAR',clue:'What Nabal’s workers were doing with his sheep when David sent his men',reference:'1 Samuel 25:2-7',
  url:'https://www.jw.org/en/library/bible/nwt/books/1-samuel/25/',
  insight:'In 1 Samuel 25:2-7, Nabal was having his sheep sheared. David sent men with a respectful request, but Nabal responded harshly.'}],
 [{word:'TREE',clue:'Jesus used a fruitless fig one to teach his disciples about faith',reference:'Matthew 21:18-22',
  url:'https://www.jw.org/en/library/bible/nwt/books/matthew/21/',
  insight:'Jesus found no fruit on a fig tree, and it withered after he spoke to it. He then taught his disciples about faith (Matthew 21:18-22).'}],
 [{word:'OIL',clue:'An ingredient in the special holy anointing mixture',reference:'Exodus 30:22-25',
  url:'https://www.jw.org/en/library/bible/nwt/books/exodus/30/',
  insight:'Jehovah gave Moses a recipe for holy anointing oil that included olive oil and fine perfumes (Exodus 30:22-25).'},
  {word:'LOVE',clue:'The quality Jesus said would identify his true disciples',reference:'John 13:34, 35',
  url:'https://www.jw.org/en/library/bible/nwt/books/john/13/',
  insight:'Jesus gave his disciples a new commandment to love one another. He said such love would identify his disciples (John 13:34, 35).'}],
 [{word:'SEA',clue:'Jehovah made a path through it for Israel in Moses’ day',reference:'Exodus 14:21, 22',
   url:'https://www.jw.org/en/library/bible/nwt/books/exodus/14/',
   insight:'Jehovah used a strong east wind to divide the sea, allowing the Israelites to cross on dry ground (Exodus 14:21, 22).'}],
 [{word:'GOAT',clue:'This animal was included in offerings on the Day of Atonement',reference:'Leviticus 16:5',
   url:'https://www.jw.org/en/library/bible/nwt/books/leviticus/16/',
   insight:'The congregation of Israel provided two young male goats as a sin offering for the Day of Atonement (Leviticus 16:5).'}],
 [{word:'BAR',clue:'Samson carried this along with the city gates of Gaza',reference:'Judges 16:3',
   url:'https://www.jw.org/en/library/bible/nwt/books/judges/16/',
   insight:'Samson removed the doors and posts of Gaza’s city gate, along with the bar, and carried them away (Judges 16:3).'}]
];
// Verified extension: the original 11 levels remain untouched.
if(Array.isArray(window.BUWTAdditionalLevels)){
 for(const next of window.BUWTAdditionalLevels){
  if(!next||!Array.isArray(next.words)||!Array.isArray(next.extraSparks))throw Error('Broken additional level module');
  LEVELS.push(next);EXTRA_SPARKS.push(next.extraSparks);
 }
}
const BIBLE_SPARKS=LEVELS.map((lev,i)=>[
 {word:lev.spark,clue:lev.clue,reference:lev.reference,url:lev.url,insight:lev.insight},
 ...EXTRA_SPARKS[i]
]);
const STORAGE='bu-visual-lab-wordtrails-next-v1';
const $=id=>document.getElementById(id);
const F=(name,value)=>document.documentElement.style.setProperty(name,value);
const valid=word=>/^[A-Z]{3,7}$/.test(word);
function canMake(rack,word){
 const count={};for(const ch of rack)count[ch]=(count[ch]||0)+1;
 for(const ch of word)if(!count[ch]--)return false;
 return true;
}
function buildCells(level){
 const map=new Map(),limit=level.size||5;
 for(const [text,r,c,dir] of level.words){
  if(!valid(text)||!canMake(level.rack,text))throw Error('Invalid level word '+text);
  for(let i=0;i<text.length;i++){
   const row=r+(dir==='down'?i:0),col=c+(dir==='across'?i:0),k=row+':'+col;
   if(row<0||col<0||row>=limit||col>=limit)throw Error('Outside '+limit+'x'+limit+' grid: '+text);
   if(map.has(k)){
    const p=map.get(k);if(p.letter!==text[i])throw Error('Crossing mismatch '+text);
    p.words.push(text);
   }else map.set(k,{row,col,key:k,letter:text[i],words:[text]});
  }
 }
 if(!canMake(level.rack,level.spark))throw Error('Invalid spark '+level.spark);
 for(const w of level.words)if(w[0]===level.spark)throw Error('Spark cannot be a required word');
 return map;
}
const BOARDS=LEVELS.map(buildCells);
LEVELS.forEach((lev,i)=>{
 if(![5,6,7].includes(lev.size||5))throw Error('Unsupported grid size');
 for(const item of lev.bibleBoard||[]){
  if(!lev.words.some(x=>x[0]===item.word))throw Error('Bible word must actually appear on crossword '+i+':'+item.word);
  if(!item.url.startsWith('https://www.jw.org/en/library/bible/nwt/'))throw Error('Board Bible reference must be JW.org NWT');
 }
});
BIBLE_SPARKS.forEach((list,i)=>{
 const rack=LEVELS[i].rack,seen=new Set(),required=new Set(LEVELS[i].words.map(x=>x[0]));
 if(list.length<2)throw Error('Each Bible level needs at least two finds');
 for(const item of list){
  if(!valid(item.word)||!canMake(rack,item.word)||required.has(item.word)||seen.has(item.word))
   throw Error('Bad or overlapping Bible discovery '+i+':'+item.word);
  if(!item.url.startsWith('https://www.jw.org/en/library/bible/nwt/'))
   throw Error('Scripture reference must be JW.org NWT');
  seen.add(item.word);
 }
});
const DEFAULT=()=>({level:0,unlocked:0,coins:60,points:0,completed:[],sparks:[],claimedSparks:[],boardBible:[],paidWords:[],paidBonuses:[],claimedFreeHints:[],sound:true,progress:null});
function load(){
 try{const o=JSON.parse(localStorage.getItem(STORAGE));if(!o||typeof o!=='object')return DEFAULT();
  const x={...DEFAULT(),...o};
  if(!Number.isInteger(x.level)||x.level<0||x.level>=LEVELS.length)x.level=0;
  x.unlocked=Math.max(0,Math.min(LEVELS.length-1,Number(x.unlocked)||0));
  x.coins=Math.max(0,Number(x.coins)||0);x.points=Math.max(0,Number(x.points)||0);
  for(const key of ['completed','sparks','paidWords','paidBonuses','claimedFreeHints'])if(!Array.isArray(x[key]))x[key]=[];
  if(!Array.isArray(x.claimedSparks))x.claimedSparks=[];
  if(!Array.isArray(x.boardBible))x.boardBible=[];
  // Migration: a completed old single star was the FIRST Bible word in its level.
  // Keep the original reward and never pay it again.
  for(const oldIndex of x.sparks){
   if(Number.isInteger(oldIndex)&&BIBLE_SPARKS[oldIndex]){
    const key=oldIndex+':'+BIBLE_SPARKS[oldIndex][0].word;
    if(!x.claimedSparks.includes(key))x.claimedSparks.push(key);
   }
  }
  return x;
 }catch(_){return DEFAULT()}
}
let save=load(),index=save.level,level=LEVELS[index],cells=BOARDS[index];
let found=new Set(),bonuses=new Set(),hinted=new Set(),chosen=[],letters=[],combo=0;
let dragging=false,dragActive=false,start=null,pointer=null,suppressClickUntil=0;
let timer=null,locked=false,completionShown=false;
let music=null,ctx=null,unlockedSound=false;
const wheel=$('wheel'),board=$('board'),preview=$('preview');
const reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
function store(){
 try{localStorage.setItem(STORAGE,JSON.stringify(save))}catch(_){}
}
function sparkKey(i,word){return i+':'+word}
function sparkClaimed(i,word){return save.claimedSparks.includes(sparkKey(i,word))}
function bibleItems(i=index){
 return [
  ...BIBLE_SPARKS[i].map(x=>({...x,kind:'hidden'})),
  ...(LEVELS[i].bibleBoard||[]).map(x=>({...x,kind:'board'}))
 ];
}
function bibleClaimed(i,item){
 if(item.kind==='board')return save.boardBible.includes(sparkKey(i,item.word));
 return sparkClaimed(i,item.word);
}
function sparksFound(i=index){return bibleItems(i).filter(item=>bibleClaimed(i,item)).length}
function sparkTotal(i=index){return bibleItems(i).length}
function storeProgress(){
 save.progress={level:index,found:[...found],bonuses:[...bonuses],hinted:[...hinted],combo};
 store();
}
function soundReady(){
 if(window.BUWTPolish?!window.BUWTPolish.musicEnabled():!save.sound)return null;
 try{
  if(!ctx){const A=window.AudioContext||window.webkitAudioContext;if(!A)return null;ctx=new A();}
  if(ctx.state==='suspended')ctx.resume().catch(()=>{});
  if(!music){
   music=new Audio('../bible-wordtrails-theme.mp3');
   music.loop=true;music.preload='none';music.volume=window.BUWTPolish?Math.max(0,.15*window.BUWTPolish.musicVolume()/100):.11;music.playsInline=true;
  }
  if(!unlockedSound){unlockedSound=true;music.play().catch(()=>{});}
  return ctx;
 }catch(_){return null}
}
function tone(freq,when,dur,vol=.04,type='sine',endFreq){
 const a=soundReady();if(!a)return;
 const osc=a.createOscillator(),g=a.createGain(),t=a.currentTime+when;
 osc.type=type;osc.frequency.setValueAtTime(freq,t);
 if(endFreq)osc.frequency.exponentialRampToValueAtTime(endFreq,t+dur);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(vol,.0002),t+.013);
 g.gain.exponentialRampToValueAtTime(.0001,t+dur);
 osc.connect(g);g.connect(a.destination);osc.start(t);osc.stop(t+dur+.012);
}
function cue(kind){
 if(window.BUWTPolish){window.BUWTPolish.cue(kind);return;}
 if(!save.sound)return;
 if(kind==='touch'){tone(680,0,.075,.009,'sine',440);return}
 if(kind==='trace'){tone(860,0,.082,.014,'sine',680);return}
 if(kind==='wrong'){tone(295,0,.09,.017,'triangle',270);return}
 if(kind==='bonus'){tone(700,0,.13,.045,'sine');tone(940,.09,.20,.047,'sine');return}
 if(kind==='hint'){tone(530,0,.14,.025,'triangle');tone(790,.10,.22,.035,'sine');return}
 if(kind==='spark'){[660,880,1100,1320].forEach((f,i)=>{tone(f,i*.085,.28,.044,'sine');tone(f*2,i*.085,.18,.012,'sine')});return}
 if(kind==='correct'){[660,840,1050].forEach((f,i)=>tone(f,i*.064,.22,.037,'sine'));tone(525,.05,.17,.015,'triangle');return}
 if(kind==='complete'){[440,550,660,880,1047].forEach((f,i)=>{tone(f,i*.10,.35,.053,'sine');tone(f*2,i*.10,.25,.015,'sine')});}
}
function haptic(ms){if(window.BUWTPolish){window.BUWTPolish.haptic(ms);return;}
 try{if(!reducedMotion&&navigator.vibrate)navigator.vibrate(ms)}catch(_){}}
function startMusicFromGesture(){if(window.BUWTPolish?window.BUWTPolish.musicEnabled():save.sound)soundReady()}
window.addEventListener('pointerdown',startMusicFromGesture,{capture:true});
window.addEventListener('keydown',startMusicFromGesture,{capture:true});
function shuffleArray(a){
 a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
 return a;
}
function ui(){
 $('level-label').textContent='LEVEL '+(index+1)+' / '+LEVELS.length;
 $('scene-title').textContent=level.title;
 $('points').textContent=String(save.coins);
 $('solved-count').textContent=found.size+' / '+level.words.length;
 $('bonus-count').textContent=bonuses.size;
 window.BUWTPolish?.bonusPips(bonuses.size>=3?3:bonuses.size);
 $('combo').textContent=combo>1?combo+'× COMBO':'';
 $('progress-fill').style.width=(found.size/level.words.length*100)+'%';
 $('hint-cost').textContent=save.claimedFreeHints.includes(index)?'15':'FREE';
 $('hint').disabled=found.size===level.words.length||(save.claimedFreeHints.includes(index)&&save.coins<15);
 const sparkCount=sparksFound(),sparkMax=sparkTotal();
 $('spark').classList.toggle('claimed',sparkCount===sparkMax);
 $('spark').setAttribute('aria-label','Bible words found '+sparkCount+' of '+sparkMax+'. Open clues and discoveries');
 $('spark-progress').textContent=sparkCount+'/'+sparkMax;
 if(window.BUWTUnifiedMenu){$('audio').textContent='☰';$('audio').setAttribute('aria-label','Open Bible Unfolded menu');}
 else if(window.BUWTPolish){$('audio').textContent='♫';$('audio').setAttribute('aria-label','Sound and effects settings');
 $('audio').setAttribute('aria-pressed','false')}
 else{$('audio').textContent=save.sound?'♫':'♪';
 $('audio').setAttribute('aria-label',save.sound?'Mute music and sounds':'Enable music and sounds');
 $('audio').setAttribute('aria-pressed',String(save.sound));}
 $('level-map').textContent=(index+1)+' / '+LEVELS.length;
}
function flash(msg){
 const toast=$('toast');toast.textContent=msg;toast.classList.add('show');
 clearTimeout(timer);timer=setTimeout(()=>toast.classList.remove('show'),1450);
}
function burst(x,y,kind='gold'){
 if(reducedMotion||(window.BUWTPolish&&!window.BUWTPolish.motionEnabled()))return;
 const layer=$('particles'),colors=kind==='green'?['#9be0b1','#e2ffe4','#8bc8a0']:['#ffeab0','#fff5d2','#e8b65f'];
 for(let i=0;i<13;i++){
  const e=document.createElement('span'),angle=(i*137.5)*Math.PI/180,d=26+((i*19)%65);
  e.className='particle';e.style.left=x+'px';e.style.top=y+'px';
  e.style.setProperty('--dx',(Math.cos(angle)*d)+'px');e.style.setProperty('--dy',(Math.sin(angle)*d)+'px');
  e.style.background=colors[i%colors.length];layer.appendChild(e);
  setTimeout(()=>e.remove(),850);
 }
}
function confetti(){
 if(reducedMotion||(window.BUWTPolish&&!window.BUWTPolish.motionEnabled()))return;
 const layer=$('particles'),r=$('app').getBoundingClientRect();
 for(let i=0;i<44;i++){
  const e=document.createElement('span');e.className='confetti';
  e.style.left=(7+(i*37)%86)+'%';e.style.top='-10px';
  e.style.setProperty('--delay',((i*7)%18)*.045+'s');
  e.style.setProperty('--drift',((i%2?-1:1)*(20+i%6*9))+'px');
  e.style.background=['#ffdd8c','#edf8cf','#f7b36a','#ffffff'][i%4];
  layer.appendChild(e);setTimeout(()=>e.remove(),2600);
 }
}
function drawBoard(word){
 const fragment=document.createDocumentFragment();
 let revealedIndex=0;
 for(const cell of cells.values()){
  const tile=document.createElement('div'),revealed=cell.words.some(w=>found.has(w)),hint=hinted.has(cell.key);
  const bibleCell=revealed&&cell.words.some(w=>found.has(w)&&(level.bibleBoard||[]).some(x=>x.word===w));
  tile.className='tile'+(revealed?' found':'')+(hint&&!revealed?' hinted':'')+(bibleCell?' bible-found':'');
  if(word&&cell.words.includes(word)){tile.classList.add('new');
   tile.style.setProperty('--stagger',(revealedIndex++*48)+'ms');}
  tile.style.gridRow=cell.row+1;tile.style.gridColumn=cell.col+1;
  tile.dataset.pos=cell.key;tile.textContent=revealed||hint?cell.letter:'';
  tile.setAttribute('aria-label',(revealed||hint?'Letter '+cell.letter:'Hidden letter')+', row '+(cell.row+1)+', column '+(cell.col+1));
  fragment.appendChild(tile);
 }
 board.replaceChildren(fragment);ui();
}
function locations(){
 const d=wheel.getBoundingClientRect().width;
 return letters.map((letter,i)=>{const a=-Math.PI/2+2*Math.PI*i/letters.length,r=d*.36;
  return {x:d/2+Math.cos(a)*r,y:d/2+Math.sin(a)*r};});
}
function drawWheel(){
 wheel.querySelectorAll('.wheel-letter').forEach(x=>x.remove());
 const pos=locations();
 for(let i=0;i<letters.length;i++){
  const b=document.createElement('button');b.type='button';b.className='wheel-letter';b.dataset.letterIndex=i;
  b.textContent=letters[i];b.setAttribute('aria-label','Letter '+letters[i]);
  b.style.left=pos[i].x+'px';b.style.top=pos[i].y+'px';
  b.addEventListener('click',()=>{
   if(performance.now()<suppressClickUntil||locked)return;
   cue(chosen.includes(i)?'undo':'touch');tap(i);
  });wheel.appendChild(b);
 }
 updateSelection();
}
function updateSelection(){
 const s=chosen.map(i=>letters[i]).join('');
 preview.textContent=s;preview.classList.toggle('visible',!!s);
 for(const b of wheel.querySelectorAll('.wheel-letter')){
  b.classList.toggle('selected',chosen.includes(Number(b.dataset.letterIndex)));
 }
 const svg=$('selection-lines'),pos=locations();
 svg.setAttribute('viewBox','0 0 '+wheel.clientWidth+' '+wheel.clientHeight);svg.replaceChildren();
 if(window.BUWTWheelNative){
  window.BUWTWheelNative.render(svg,chosen,chosen.map(i=>pos[i]));
 }else if(chosen.length>1){
  // Safe fallback if the visual-only native wheel module fails to load.
  const path=document.createElementNS('http://www.w3.org/2000/svg','polyline');
  path.setAttribute('points',chosen.map(i=>pos[i].x+','+pos[i].y).join(' '));svg.appendChild(path);
 }
}
function tap(i){chosen=chosen.includes(i)?chosen.filter(j=>j!==i):[...chosen,i];updateSelection()}
function clear(){chosen=[];updateSelection()}
function wordPaid(word){const id=index+'|'+word;if(save.paidWords.includes(id))return false;save.paidWords.push(id);return true}
function finishWord(word){
 found.add(word);combo++;
 const bibleAnswer=(level.bibleBoard||[]).find(item=>item.word===word);
 if(bibleAnswer){
  const key=sparkKey(index,word);
  if(!save.boardBible.includes(key))save.boardBible.push(key);
 }
 const reward=wordPaid(word)?10:0;
 if(reward)save.points+=reward;
 let comboReward=0;const comboTag='combo:'+index;
 if(combo===3&&!save.paidWords.includes(comboTag)){save.paidWords.push(comboTag);save.coins+=5;comboReward=5;}
 drawBoard(word);storeProgress();
 window.BUWTPolish?.event('correct',{word,combo,coins:comboReward});
 const tile=[...board.querySelectorAll('.tile.new')][Math.floor([...board.querySelectorAll('.tile.new')].length/2)];
 if(tile){const b=tile.getBoundingClientRect(),app=$('app').getBoundingClientRect();burst(b.left-app.left+b.width/2,b.top-app.top+b.height/2,'green')}
 flash((bibleAnswer?'★ BIBLE WORD · ':'✦ ')+word+' FOUND'+(reward?'  +10':'')+(comboReward?'  ·  COMBO +5 COINS':''));
 cue('correct');haptic(15);
 if(found.size===3||found.size===6)window.BUWTAnnouncer?.play?.('youre_on_a_roll');
 if(found.size===level.words.length&&!completionShown){
  completionShown=true;locked=true;
  setTimeout(()=>completeLevel(),780);
 }
}
function submit(){
 if(locked)return;
 if(!chosen.length){flash('Connect letters to make a word');return}
 const word=chosen.map(i=>letters[i]).join('');clear();
 if(word.length<3){cue('wrong');window.BUWTPolish?.event('wrong');flash('Try three or more letters');return}
 if(!canMake(level.rack,word)){cue('wrong');return}
 const bible=BIBLE_SPARKS[index].find(s=>s.word===word);
 if(bible){
  if(sparkClaimed(index,word)){flash('Bible word already discovered ★');cue('touch');return}
  save.claimedSparks.push(sparkKey(index,word));
  // The first discovery remains compatible with the former one-star save.
  if(word===level.spark&&!save.sparks.includes(index))save.sparks.push(index);
  save.coins+=25;ui();storeProgress();
  window.BUWTPolish?.event('spark',{word});
  cue('spark');haptic([16,28,16]);
  window.BUWTAnnouncer?.play?.('another_discovery');
  const r=$('spark').getBoundingClientRect(),a=$('app').getBoundingClientRect();
  burst(r.left-a.left+r.width/2,r.top-a.top+r.height/2);
  openSpark(bible,true);return;
 }
 if(level.words.some(w=>w[0]===word)){
  if(found.has(word)){flash('Already on the board');cue('touch');return}
  finishWord(word);return;
 }
 const bank=new Set(level.bonus.split(' ').filter(w=>valid(w)&&canMake(level.rack,w)));
 if(bank.has(word)){
  if(bonuses.has(word)){flash('Bonus already collected');cue('touch');return}
  bonuses.add(word);combo++;
  const key=index+'|'+word,paid=!save.paidBonuses.includes(key);
  if(paid){save.paidBonuses.push(key);save.coins+=2}
  // Three unique bonuses fill a small satchel. This milestone pays only once per level.
  const vaultKey='satchel:'+index;
  const vault=bonuses.size>=3&&!save.paidBonuses.includes(vaultKey);
  if(vault){save.paidBonuses.push(vaultKey);save.coins+=8}
  ui();storeProgress();
  window.BUWTPolish?.event('bonus',{word,count:bonuses.size,coins:paid?2:0});
  if(vault){window.BUWTPolish?.event('vault',{coins:8});cue('vault')}
  else cue('bonus');
  flash(vault?'✦ SATCHEL FULL!  +8 EXTRA COINS':('✦ BONUS WORD! '+word+(paid?'  +2 COINS':'  · FOUND')));
  haptic(8);
  const x=$('bonus-count').getBoundingClientRect(),a=$('app').getBoundingClientRect();
  burst(x.left-a.left+x.width/2,x.top-a.top+x.height/2);
  return;
 }
 combo=0;ui();cue('wrong');window.BUWTPolish?.event('wrong');flash('Keep exploring those letters');
 wheel.classList.remove('wiggle');void wheel.offsetWidth;wheel.classList.add('wiggle');
}
function completeLevel(){
 locked=false;
 const already=save.completed.includes(index);
 const milestone=(index+1)%5===0;
 const milestoneBonus=!already&&milestone?60:0;
 // A special five-level milestone pays once; replays never mint duplicate coins.
 const reward=already?0:20+5*index+milestoneBonus;
 if(!already){
  save.completed.push(index);save.coins+=reward;
  save.unlocked=Math.min(LEVELS.length-1,Math.max(save.unlocked,index+1));
 }
 save.progress=null;store();ui();cue('complete');
 window.BUWTAnnouncer?.play?.('chapter_complete',{milestone:true});
 // Keep the everyday feedback gentle. The level-win celebration gets a distinct cadence.
 haptic([38,58,36,75,70]);
 // Standalone V5 celebration is inside the top-layer dialog; avoid wasting
 // behind-dialog confetti and keep the old burst only as a safe fallback.
 if(!window.BUWTPolish?.celebrateWin)confetti();
 window.BUWTPolish?.event('complete',{level:index,reward});
 $('finish-level').textContent='LEVEL '+(index+1)+' COMPLETE';
 $('finish').querySelector('.finish-small').textContent=milestone?'★ FIVE-LEVEL MILESTONE ★':'BIBLE UNFOLDED · WORD TRAILS';
 $('finish').querySelector('.victory-intro').textContent=milestone&&!already?
  'A milestone reached! +60 extra test coins for your journey.':'Every word brings a new discovery.';
 $('finish-reward').textContent=already?'Replay complete':('+'+reward+' TEST COINS');
 $('finish-words').textContent=level.words.length+' crossword words · '+bonuses.size+' bonus '+(bonuses.size===1?'word':'words');
 $('finish-spark').textContent='★ '+sparksFound()+' / '+sparkTotal()+' Bible discoveries collected';
 $('next-level').textContent=index===LEVELS.length-1?'Explore Level Map':'Next Level';
 $('stay').textContent=sparksFound()===sparkTotal()?'Replay this level':'Find more Bible words';
 $('finish').showModal();
 window.BUWTPolish?.celebrateWin?.();
}
function setScene(){
 const url='../bible-book-art/'+level.scene;F('--scene','url("'+url+'")');
 $('level-label').textContent='LEVEL '+(index+1)+' / '+LEVELS.length;
 $('scene-title').textContent=level.title;
 $('spark').classList.remove('claimed');
}
function showLevel(n,resume=false){
 if(n<0||n>=LEVELS.length||n>save.unlocked)return;
 window.BUWTWheelNative?.cancel?.();
 if($('finish').open){window.BUWTPolish?.clearWinFX?.();$('finish').close();}
 if($('discovery').open)$('discovery').close();
 if($('map').open)$('map').close();
 index=n;level=LEVELS[index];cells=BOARDS[index];
 board.dataset.size=String(level.size||5);
 found=new Set();bonuses=new Set();hinted=new Set();combo=0;chosen=[];
 if(resume&&save.progress?.level===index){
  found=new Set(save.progress.found||[]);bonuses=new Set(save.progress.bonuses||[]);
  hinted=new Set(save.progress.hinted||[]);combo=Number(save.progress.combo)||0;
 }
 save.level=index;store();setScene();
 letters=shuffleArray([...level.rack]);
 completionShown=found.size===level.words.length;locked=false;
 drawBoard();drawWheel();
 window.BUWTPolish?.event('level',{level:index,title:level.title});
 $('toast').classList.remove('show');
}
function resetLevel(){
 if($('finish').open){window.BUWTPolish?.clearWinFX?.();$('finish').close();}
 save.progress=null;store();showLevel(index,false);
 flash('Level restarted');cue('touch');
}
function shuffle(){
 const now=letters.join('');for(let k=0;k<10;k++){
  const next=shuffleArray(letters);
  if(next.join('')!==now){letters=next;break}
 }
 clear();drawWheel();cue('touch');flash('Letters shuffled');
}
function hint(){
 if(found.size===level.words.length)return;
 const isFree=!save.claimedFreeHints.includes(index);
 if(!isFree&&save.coins<15){flash('You need 15 coins for another hint');cue('wrong');return}
 const unseen=[...cells.values()].filter(cell=>!cell.words.some(w=>found.has(w))&&!hinted.has(cell.key));
 if(!unseen.length)return;
 unseen.sort((a,b)=>b.words.length-a.words.length||a.row-b.row);
 const cell=unseen[0];hinted.add(cell.key);
 if(isFree)save.claimedFreeHints.push(index);else save.coins-=15;
 drawBoard();storeProgress();cue('hint');window.BUWTPolish?.event('hint',{free:isFree});
 flash((isFree?'Free hint':'15 coins')+' · '+cell.letter+' revealed');
 const b=board.querySelector('[data-pos="'+cell.key+'"]').getBoundingClientRect(),app=$('app').getBoundingClientRect();
 burst(b.left-app.left+b.width/2,b.top-app.top+b.height/2);
}
function openSpark(bible=null,newlyFound=false){
 const menu=!bible,list=$('spark-list'),link=$('spark-link');
 list.hidden=!menu;list.replaceChildren();
 if(menu){
  const have=sparksFound(),total=sparkTotal();
  const boardCount=(level.bibleBoard||[]).length;
  $('spark-title').textContent='★ BIBLE WORD HUNT';
  $('spark-text').textContent=(boardCount?('Discover '+boardCount+' Bible answer'+(boardCount===1?'':'s')+' on the crossword, plus '+BIBLE_SPARKS[index].length+' secret Scripture words. '):('Find '+total+' hidden Scripture words. '))+'Tap a completed discovery to read its Bible connection. '+have+' of '+total+' collected.';
  link.hidden=true;
  for(const [i,item] of bibleItems().entries()){
   const got=bibleClaimed(index,item);
   const el=document.createElement(got?'button':'div');
   el.className='spark-find'+(got?' unlocked':'');
   if(got){el.type='button';el.addEventListener('click',()=>openSpark(item,false))}
   const icon=document.createElement('span');
   icon.className='spark-find-icon';icon.textContent=got?'★':'☆';
   const body=document.createElement('span');body.className='spark-find-info';
   const header=document.createElement('strong');
   header.textContent=got?item.word:(item.kind==='board'?'BIBLE CROSSWORD · HIDDEN':'Bible word '+(i+1)+' · HIDDEN');
   const text=document.createElement('small');
   text.textContent=got?item.reference:item.clue;
   body.append(header,text);el.append(icon,body);list.append(el);
  }
 }else{
  $('spark-title').textContent='★ '+bible.word;
  $('spark-text').textContent=(newlyFound?'Bible discovery unlocked · +25 test coins. ':'')+bible.insight;
  link.hidden=false;link.href=bible.url;link.textContent='Read '+bible.reference+' on JW.org ↗';
 }
 $('spark-next').textContent=menu?'Back to Puzzle':'Keep Playing';
 if(!$('discovery').open)$('discovery').showModal();
}
function toggleSound(){
 save.sound=!save.sound;store();ui();
 if(save.sound){unlockedSound=false;soundReady();cue('correct')}
 else{music?.pause();ctx?.suspend().catch(()=>{})}
}
function levelMap(){
 $('map-list').replaceChildren();
 LEVELS.forEach((lev,i)=>{
  const b=document.createElement('button'),unlocked=i<=save.unlocked;
  b.type='button';b.className='map-level'+(i===index?' here':'')+(save.completed.includes(i)?' complete':'');
  b.disabled=!unlocked;
  b.innerHTML='<span>'+(unlocked?i+1:'🔒')+'</span><strong>'+lev.title+'</strong><small>'+(unlocked?'★ '+sparksFound(i)+'/'+sparkTotal(i)+' Bible finds':'Locked')+'</small>';
  b.addEventListener('click',()=>{showLevel(i);cue('levelEnter');$('map').close()});
  $('map-list').append(b);
 });$('map').showModal();
}
wheel.addEventListener('pointerdown',e=>{
 if(locked)return;const b=e.target.closest('.wheel-letter');if(!b)return;
 window.BUWTWheelNative?.begin?.(e);
 dragging=true;dragActive=false;pointer=e.pointerId;
 start={x:e.clientX,y:e.clientY,index:Number(b.dataset.letterIndex)};
 try{wheel.setPointerCapture(e.pointerId)}catch(_){}
});
wheel.addEventListener('pointermove',e=>{
 if(!dragging||e.pointerId!==pointer||!start)return;
 window.BUWTWheelNative?.move?.(e);
 if(!dragActive&&Math.hypot(e.clientX-start.x,e.clientY-start.y)>9){
  dragActive=true;chosen=[start.index];cue('trace');updateSelection();
 }
 if(!dragActive)return;
 const b=document.elementFromPoint(e.clientX,e.clientY)?.closest('.wheel-letter');
 if(b&&wheel.contains(b)){
  const i=Number(b.dataset.letterIndex);
  if(!chosen.includes(i)){chosen.push(i);cue('trace');updateSelection();}
 }
});
function release(e){
 if(!dragging||e.pointerId!==pointer)return;
 window.BUWTWheelNative?.end?.(e);
 const was=dragActive;dragging=false;dragActive=false;pointer=null;start=null;
 if(was){suppressClickUntil=performance.now()+200;submit()}
}
wheel.addEventListener('pointerup',release);
wheel.addEventListener('pointercancel',e=>{if(e.pointerId===pointer){window.BUWTWheelNative?.cancel?.();dragging=false;dragActive=false;pointer=null;start=null;clear()}});
$('submit').addEventListener('click',()=>{cue('touch');submit()});
$('shuffle').addEventListener('click',shuffle);
$('hint').addEventListener('click',hint);
$('spark').addEventListener('click',()=>{cue('touch');openSpark()});
$('audio').addEventListener('click',()=>{if(window.BUWTUnifiedMenu)window.BUWTUnifiedMenu.open();else if(window.BUWTPolish)window.BUWTPolish.openSettings();else toggleSound()});
$('level-map').addEventListener('click',levelMap);
$('next-level').addEventListener('click',()=>{
 const n=Math.min(LEVELS.length-1,index+1);
 if(index===LEVELS.length-1){window.BUWTPolish?.clearWinFX?.();$('finish').close();levelMap()}else{showLevel(n);cue('levelEnter')}
});
$('stay').addEventListener('click',()=>{
 if(sparksFound()===sparkTotal()){resetLevel();return}
 window.BUWTPolish?.clearWinFX?.();$('finish').close();locked=false;
 completionShown=false;flash('Find the remaining Bible words ★');
});
$('spark-next').addEventListener('click',()=>$('discovery').close());
$('spark-x').addEventListener('click',()=>$('discovery').close());
$('map-x').addEventListener('click',()=>$('map').close());
$('reset-level').addEventListener('click',()=>{$('map').close();resetLevel()});
$('reset-test').addEventListener('click',()=>{
 if(!confirm('Reset only Word Trails NEXT test progress, coins and unlocks? The live game will not be affected.'))return;
 save=DEFAULT();store();showLevel(0);cue('touch');
});
window.addEventListener('keydown',e=>{
 if(e.key==='Enter'&&!($('finish').open||$('map').open||$('discovery').open)){submit()}
});
window.addEventListener('resize',()=>{drawWheel()});
window.addEventListener('bu-wt-audio-change',()=>{
 if(!window.BUWTPolish)return;
 if(!window.BUWTPolish.musicEnabled()){music?.pause();return}
 if(music)music.volume=.15*window.BUWTPolish.musicVolume()/100;
 unlockedSound=false;soundReady();
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)music?.pause();else if(unlockedSound&&(window.BUWTPolish?window.BUWTPolish.musicEnabled():save.sound))music?.play().catch(()=>{})});
window.addEventListener('pagehide',()=>music?.pause());
showLevel(index,true);
})();
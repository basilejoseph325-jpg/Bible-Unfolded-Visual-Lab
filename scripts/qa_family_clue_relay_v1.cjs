#!/usr/bin/env node
'use strict';
// Independent preview tests. Never loads or invokes a shared game system.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),cp=require('node:child_process');
const rules=require('../experiments/family-clue-relay-rules-v1.js'),context={window:{}};
vm.runInNewContext(fs.readFileSync('experiments/family-clue-relay-questions-v1.js','utf8'),context);
const bank=JSON.parse(JSON.stringify(context.window.BUClueRelayQuestions));
function seeded(seed){return()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);}
const sourceItems=JSON.parse(fs.readFileSync('scripts/fixtures/family-clue-relay-sources-v1.json','utf8')).evidence;
assert.equal(bank.length,18);assert.equal(new Set(bank.map(q=>q.id)).size,18);
for(const difficulty of ['easy','medium','challenging'])assert.equal(bank.filter(q=>q.difficulty===difficulty).length,6);
for(const category of ['Character','Place','Event'])assert.equal(bank.filter(q=>q.category===category).length,6);
const aliases=new Map();
for(const q of bank){
 assert(q.answer&&q.explanation.length>60);assert.equal(q.clues.length,3);assert.equal(q.clueEvidence.length,3);assert.equal(new Set(q.clues).size,3);
 for(const clue of q.clues)assert(clue.length>=20&&clue.length<=180);
 for(const alias of [q.answer,...q.aliases]){const norm=rules.normalize(alias);assert(!aliases.has(norm)||aliases.get(norm)===q.id,'Ambiguous accepted answer '+alias);aliases.set(norm,q.id);}
 for(const source of q.sources){assert(/^https:\/\/www\.jw\.org\/en\/library\/bible\/nwt\/books\/[\w-]+\/\d+\/$/.test(source.url));assert(source.reference&&source.verses.length);}
 for(const [index,verse] of q.clueEvidence)assert(q.sources[index]?.verses.includes(verse),'Clue not covered by reference');
 for(let clue=0;clue<3;clue++){const record=sourceItems.find(x=>x.id===q.id+'-clue'+(clue+1));assert(record&&record.url===q.sources[q.clueEvidence[clue][0]].url&&record.verse===q.clueEvidence[clue][1]);}
}
assert.equal(sourceItems.length,54);
let games=0;
for(let count=2;count<=6;count++)for(const rounds of [2,3])for(let seed=1;seed<=20;seed++){
 const game=rules.create(bank,Array.from({length:count},(_,i)=>'Player '+(i+1)),rounds,seeded(seed));
 assert.equal(game.questions.length,count*rounds);assert.equal(new Set(game.questions.map(q=>q.id)).size,count*rounds);
 const turns=Array(count).fill(0),scores=Array(count).fill(0);
 for(let round=0;round<game.questions.length;round++){
  assert.equal(game.phase,'handoff');assert.equal(rules.active(game),round%count);assert(rules.guess(game,'Noah').ignored);assert.equal(rules.next(game),false);
  rules.begin(game);assert.equal(rules.begin(game),false);
  const snapshot=JSON.stringify(game);assert(rules.guess(game,'   ').error);assert.equal(JSON.stringify(game),snapshot);
  const route=round%4,correctAt=route===0?null:route-1;turns[round%count]++;
  for(let clue=0;clue<3;clue++){
   const current=game.questions[round],answer=correctAt===clue?current.answer:'certainly not a Bible answer';const response=rules.guess(game,answer);
   if(correctAt===clue){assert.equal(response.points,3-clue);scores[round%count]+=3-clue;break;}
   if(clue<2){assert.equal(response.nextClue,clue+2);assert.equal(game.phase,'guess');}else assert.equal(response.points,0);
  }
  assert.equal(game.phase,'result');const after=JSON.stringify(game);assert(rules.guess(game,game.questions[round].answer).ignored);assert.equal(JSON.stringify(game),after);
  assert.deepEqual(game.players.map(p=>p.score),scores);rules.next(game);
 }
 assert.equal(game.phase,'complete');assert.deepEqual(turns,Array(count).fill(rounds));assert.equal(rules.next(game),false);
 const best=Math.max(...scores);assert.deepEqual(rules.winners(game).map(p=>p.name),game.players.filter(p=>p.score===best).map(p=>p.name));
 const replay=rules.create(bank,game.players.map(p=>p.name),rounds,seeded(seed),game.questions.map(q=>q.id));assert.notEqual(replay.questions[0].id,game.questions[0].id);assert(replay.players.every(p=>p.score===0));games++;
}
for(const q of bank)for(const alias of [q.answer,...q.aliases]){
 const game=rules.create(bank,['One','Two'],2,seeded(9));game.questions[0]=q;rules.begin(game);const response=rules.guess(game,' '+alias.toUpperCase()+'! ');assert.equal(response.points,3,'Alias rejected '+alias);
}
const red=bank.find(q=>q.id==='cr-red-sea'),article=rules.create(bank,['One','Two'],2,seeded(2));article.questions[0]=red;rules.begin(article);assert.equal(rules.guess(article,'The Red Sea').points,3);
const domSource=fs.readFileSync('experiments/family-clue-relay-v1.js','utf8');const declarations=[...domSource.matchAll(/function ([a-zA-Z]+)\(/g)].map(m=>m[1]);assert.equal(new Set(declarations).size,declarations.length,'Duplicate UI function');
for(const names of [['One'],Array(7).fill('One'),['One',' one '],['a'.repeat(25),'Two']])assert.throws(()=>rules.create(bank,names));
const tie=rules.create(bank,['One','Two'],2,seeded(4));while(tie.phase!=='complete'){rules.begin(tie);for(let i=0;i<3;i++)rules.guess(tie,'no match');rules.next(tie);}assert.equal(rules.winners(tie).length,2);
const changed=cp.execFileSync('git',['diff','--name-status','72650b278b034f7eafe1dcce468e9dca5882e526'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);assert(changed.every(line=>line.startsWith('A\t')),'Existing file changed');
for(const file of ['experiments/family-clue-relay-questions-v1.js','experiments/family-clue-relay-rules-v1.js','experiments/family-clue-relay-v1.js']){const text=fs.readFileSync(file,'utf8');assert(!/\b(?:localStorage|sessionStorage|AudioContext|new Audio|BUPlatform|BURewards|indexedDB)\b/.test(text),'Shared state/audio dependency: '+file);new vm.Script(text);}
for(const file of ['daily-discovery-explanation-scroll-v3.webp','daily-explanation-wax-next-v2.svg','daily-complete-laurel-v1.svg'])assert(fs.existsSync('assets/ui/'+file));
console.log('PASS_CLUE_RELAY_RULES',games,'complete randomized games; 2–6 players; 3/2/1/0 scoring; turns; blanks; double-submit; replay; ties; aliases; content and isolation');
const decode=s=>s.replace(/<[^>]*>/g,' ').replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16))).replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(+n)).replace(/&nbsp;/g,' ').replace(/&amp;/g,'&');
async function sources(){
 const pages=new Map(),urls=[...new Set(sourceItems.map(x=>x.url))];
 for(let i=0;i<urls.length;i+=4)await Promise.all(urls.slice(i,i+4).map(async url=>{const r=await fetch(url,{signal:AbortSignal.timeout(45000)});assert(r.ok);assert.equal(new URL(r.url).hostname,'www.jw.org');const html=await r.text();assert(html.includes('New World Translation'));pages.set(url,html);}));
 const norm=s=>decode(s).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 for(const record of sourceItems){const html=pages.get(record.url),spans=[...html.matchAll(/<span(?=[^>]*\bid="(v\d{7,8})")(?=[^>]*\bclass="verse")[^>]*>/g)],i=spans.findIndex(m=>Number(m[1].slice(-3))===record.verse);assert(i>=0,record.id);const verse=html.slice(spans[i].index,spans[i+1]?.index??html.length);assert(norm(verse).includes(norm(record.excerpt)),record.id);}
 console.log('PASS_CLUE_RELAY_NWT_SOURCES',sourceItems.length,'clue anchors;',urls.length,'official chapter pages; semantic/editorial approval remains separate');
}
if(process.argv.includes('--verify-sources'))sources().catch(e=>{console.error(e);process.exit(1);});

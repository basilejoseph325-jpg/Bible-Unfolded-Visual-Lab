#!/usr/bin/env node
'use strict';
// Independent content gate. Does not import a wallet, write saves or load a game.
// node scripts/qa_word_trails_levels_51_55.cjs [--verify-sources]
// Proxy-managed Node 24 environments: set NODE_USE_ENV_PROXY=1 for source fetching.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),cp=require('node:child_process');
const FILE='experiments/word-trails-levels-51-55-v1.js';
const BASE='72650b278b034f7eafe1dcce468e9dca5882e526';
const NEW_FILES=new Set([FILE,'scripts/qa_word_trails_levels_51_55.cjs','scripts/qa_word_trails_levels_51_55_browser.cjs','scripts/fixtures/word-trails-51-55-sources.json','experiments/word-trails-levels-51-55-metadata-v1.json','docs/WORD_TRAILS_LEVELS_51_55_INTEGRATION_REVIEW.md']);
function readPack(){
 const window={},scope={window};
 for(const name of ['localStorage','fetch','navigator','document','location'])Object.defineProperty(scope,name,{get(){throw Error('Content must not access '+name);}});
 vm.runInNewContext(fs.readFileSync(FILE,'utf8'),scope,{timeout:1000});
 assert.deepEqual(Object.keys(window),['BUWTLevels51to55']);assert(Object.isFrozen(window.BUWTLevels51to55));
 return JSON.parse(JSON.stringify(window.BUWTLevels51to55));
}
function canMake(rack,word){const counts={};for(const c of rack)counts[c]=(counts[c]||0)+1;return [...word].every(c=>counts[c]-- >0);}
function sourceOK(x){
 assert(x&&/^[A-Z]{3,7}$/.test(x.word),'Bad Bible answer');
 for(const key of ['clue','insight'])assert(typeof x[key]==='string'&&x[key].length>=25,'Missing '+key);
 const m=x.reference.match(/^(.+?) (\d+):\d+(?:[-, \d]*)$/);assert(m,'Missing specific verse '+x.reference);
 let book=m[1].toLowerCase().replace(/ /g,'-');if(book==='psalm')book='psalms';
 assert.equal(x.url,`https://www.jw.org/en/library/bible/nwt/books/${book}/${m[2]}/`,'Wrong source book/chapter');
 assert(!/the account (?:illustrates|underscores)|the foregoing|serves to illustrate/i.test(x.insight),'Read aloud and rewrite stiff copy');
}
function validateLevel(l){
 assert.equal(l.size,7);assert(/^[A-Z]{7}$/.test(l.rack));assert(l.title.length>5);
 assert(/^\d{2}_[a-z0-9_]+\.webp$/.test(l.scene)&&fs.existsSync('bible-book-art/'+l.scene),'Existing artwork required');
 const cells=new Map(),answers=new Set(),graph=l.words.map(()=>new Set());
 for(const [j,entry] of l.words.entries()){
  assert.equal(entry.length,4);const [word,row,col,dir]=entry;assert(/^[A-Z]{3,7}$/.test(word)&&canMake(l.rack,word),'Unspellable '+word);assert(!answers.has(word),'Repeated answer');answers.add(word);
  assert(Number.isInteger(row)&&Number.isInteger(col)&&['across','down'].includes(dir));
  for(let i=0;i<word.length;i++){
   const y=row+(dir==='down'?i:0),x=col+(dir==='across'?i:0);assert(y>=0&&x>=0&&y<7&&x<7,'Out of bounds '+word);
   const key=y+':'+x,cell=cells.get(key)||{letter:word[i],words:[]};assert.equal(cell.letter,word[i],'Crossing mismatch');assert(!cell.words.some(w=>w.dir===dir),'Same-direction overlap');cell.words.push({j,dir});cells.set(key,cell);
  }
 }
 let crossings=0;
 for(const [key,cell] of cells){
  if(cell.words.length>1){crossings++;for(const a of cell.words)for(const b of cell.words)if(a.j!==b.j)graph[a.j].add(b.j);}
  const [r,c]=key.split(':').map(Number);
  for(const neighbor of [cells.get((r+1)+':'+c),cells.get(r+':'+(c+1))])if(neighbor)assert(cell.words.some(a=>neighbor.words.some(b=>a.j===b.j)),'Unintended touching words');
 }
 const reached=new Set([0]),queue=[0];while(queue.length)for(const next of graph[queue.shift()])if(!reached.has(next)){reached.add(next);queue.push(next);}
 assert.equal(reached.size,l.words.length,'Disconnected board');assert(crossings>=l.words.length-1,'Insufficient crossings');
 assert(l.bibleBoard.length>=3);const bible=new Set();for(const x of l.bibleBoard){sourceOK(x);assert(answers.has(x.word)&&!bible.has(x.word),'Missing/repeated Bible word');bible.add(x.word);}
 assert.equal(l.extraSparks.length,1,'Exactly two hidden discoveries: primary + one extra');
 const hidden=[{word:l.spark,clue:l.clue,reference:l.reference,url:l.url,insight:l.insight},...l.extraSparks];
 assert.equal(new Set(hidden.map(x=>x.word)).size,2);for(const x of hidden){sourceOK(x);assert(canMake(l.rack,x.word),'Impossible hidden word');assert(!answers.has(x.word),'Hidden word is already on the board');}
 const bonuses=l.bonus.split(' ');assert(bonuses.length>=3);assert.equal(new Set(bonuses).size,bonuses.length);
 for(const word of bonuses)assert(/^[A-Z]{3,7}$/.test(word)&&canMake(l.rack,word)&&!answers.has(word)&&!hidden.some(x=>x.word===word),'Impossible/duplicated bonus '+word);
 return {answers:l.words.length,bibleBoard:l.bibleBoard.length,hidden:2,crossings,cells:cells.size,bonuses:bonuses.length};
}
function oldLevels(){
 const text=fs.readFileSync('experiments/word-trails-next-v1.js','utf8'),a=text.indexOf('const LEVELS=['),b=text.indexOf('// Verified extension:',a);
 const first=vm.runInNewContext('(()=>{'+text.slice(a,b)+';return {LEVELS,EXTRA_SPARKS};})()');
 const levels=first.LEVELS.map((l,i)=>({...l,extraSparks:first.EXTRA_SPARKS[i]}));
 const window={};for(const range of ['12-30','31-35','36-40','41-45','46-50'])vm.runInNewContext(fs.readFileSync('experiments/word-trails-levels-'+range+'-v1.js','utf8'),{window});
 return [...levels,...Object.values(window).flat()];
}
const discoveries=l=>[...(l.bibleBoard||[]),{word:l.spark,reference:l.reference,url:l.url,clue:l.clue,insight:l.insight},...(l.extraSparks||[])];
function checkScope(){
 const changed=cp.execFileSync('git',['diff','--name-only',BASE],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
 const untracked=cp.execFileSync('git',['ls-files','--others','--exclude-standard'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
 for(const file of [...changed,...untracked])assert(NEW_FILES.has(file),'Outside content/test scope: '+file);
 const baselineFiles=cp.execFileSync('git',['ls-tree','-r','--name-only',BASE],{encoding:'utf8'}).trim().split('\n');
 for(const file of baselineFiles)assert(fs.readFileSync(file).equals(cp.execFileSync('git',['show',BASE+':'+file],{maxBuffer:40000000})),'Existing file modified: '+file);
 return baselineFiles.length;
}
function validatePack({integrated=false}={}){
 const pack=readPack(),old=oldLevels();assert.equal(old.length,50);assert.equal(pack.length,5);const summary=pack.map((l,i)=>({level:51+i,...validateLevel(l)}));
 assert.deepEqual(summary.map(x=>x.answers),[5,6,6,6,7]);
 assert.equal(new Set(pack.map(l=>l.title)).size,5);for(const l of pack)assert(!old.some(x=>x.rack===l.rack||x.title===l.title),'Existing rack/title reused');
 // The final two racks introduce repeated letters, with no new wheel mechanic.
 assert.equal(new Set(pack[0].rack).size,7);assert.equal(new Set(pack[3].rack).size,6);assert.equal(new Set(pack[4].rack).size,6);
 const sources=new Set(),clues=new Set(),insights=new Set();const norm=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 for(const l of [...old,...pack])for(const d of discoveries(l)){
  const key=d.word+'|'+norm(d.reference);assert(!sources.has(key),'Repeated Bible discovery '+key);sources.add(key);
  for(const [text,seen] of [[d.clue,clues],[d.insight,insights]]){const k=d.word+'|'+norm(text);assert(!seen.has(k),'Recycled copy '+k);seen.add(k);}
 }
 const fixture=JSON.parse(fs.readFileSync('scripts/fixtures/word-trails-51-55-sources.json','utf8'));
 assert.equal(fixture.independentHumanApproval,false);const entries=pack.flatMap(discoveries);assert.equal(fixture.items.length,entries.length);assert.equal(new Set(fixture.items.map(x=>x.id)).size,entries.length);
 for(const x of fixture.items)assert(entries.some(d=>d.word===x.word&&d.reference===x.reference&&d.url===x.url),'Source review does not match content');
 const review=fixture.qualityReview;assert.equal(review.crosswordAnswers.length,30);assert.equal(review.discoveries.length,39);assert.equal(review.hiddenDiscoveriesReviewed,10);assert.equal(review.bonusWords.length,60);
 for(const [i,l] of pack.entries())for(const word of l.bonus.split(' '))assert(review.bonusWords.some(r=>r.level===i+51&&r.word===word&&r.meaning.length>3),'Bonus review missing');
 const meta=JSON.parse(fs.readFileSync('experiments/word-trails-levels-51-55-metadata-v1.json','utf8'));
 assert.equal(meta.status,'review-only-not-integrated');assert.equal(meta.firstSaveIndex,50);assert.equal(meta.lastSaveIndex,54);assert.equal(meta.mapChapter.number,11);assert.equal(meta.mapChapter.firstLevel,51);assert.equal(meta.mapChapter.lastLevel,55);
 assert.deepEqual(Object.keys(meta.journeySeals),['55']);const seal=meta.journeySeals['55'];assert.deepEqual(Object.keys(seal).sort(),['detail','name','symbol']);
 assert(seal.name.length<=24&&seal.detail.length<=60);if(!integrated)assert(!fs.readFileSync('experiments/word-trails-next-v1.js','utf8').includes(seal.name),'Seal accidentally integrated');
 assert.deepEqual(meta.counts,{crosswordAnswers:30,scriptureBoardDiscoveries:29,hiddenBibleDiscoveries:10,bonusWords:60});
 // Prove the independent validator rejects meaningful content regressions.
 const copy=()=>JSON.parse(JSON.stringify(pack[0]));
 for(const mutate of [l=>l.rack='AAAAAAA',l=>l.words[1][1]=6,l=>l.words[1][2]=0,l=>l.spark=l.words[0][0],l=>l.extraSparks=[],l=>l.bibleBoard[0].url='https://example.com/',l=>l.scene='missing.webp',l=>l.bonus+=' AAAAAAA']){const bad=copy();mutate(bad);assert.throws(()=>validateLevel(bad));}
 return {pack,summary,fixture};
}
const decode=s=>s.replace(/<[^>]*>/g,' ').replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16))).replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(+n)).replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&rsquo;/g,"'").replace(/&ldquo;|&rdquo;|&quot;/g,'"');
async function verifySources(items){
 const pages=new Map(),urls=[...new Set(items.map(x=>x.url))];
 for(let i=0;i<urls.length;i+=4)await Promise.all(urls.slice(i,i+4).map(async url=>{
  const response=await fetch(url,{signal:AbortSignal.timeout(45000)});assert(response.ok,url+' '+response.status);assert(new URL(response.url).hostname==='www.jw.org');const text=await response.text();assert(/New World Translation/.test(text));pages.set(url,text);
 }));
 const norm=s=>decode(s).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 for(const x of items){
  const html=pages.get(x.url),spans=[...html.matchAll(/<span(?=[^>]*\bid="(v\d{7,8})")(?=[^>]*\bclass="verse")[^>]*>/g)];
  const pos=spans.findIndex(m=>Number(m[1].slice(-3))===x.verse);assert(pos>=0,'Verse not found '+x.id);
  const verse=html.slice(spans[pos].index,spans[pos+1]?.index??html.length);
  assert(norm(verse).includes(norm(x.expectedExcerpt)),'NWT evidence changed: '+x.id);
 }
 console.log('PASS_WORD_TRAILS_51_55_OFFICIAL_NWT_SOURCES',items.length,'discovery records;',urls.length,'chapter pages');
}
if(require.main===module)(async()=>{const integration=process.argv.includes('--integration');const {summary,fixture}=validatePack({integrated:integration});console.log('PASS_WORD_TRAILS_51_55_CONTENT',JSON.stringify(summary));if(!integration)console.log('PASS_EXISTING_FILES_UNCHANGED',checkScope());else console.log('INTEGRATION_SCOPE_CHECK','Run qa_word_trails_55_integration.cjs for current-main boundaries');if(process.argv.includes('--verify-sources'))await verifySources(fixture.items);})().catch(e=>{console.error(e);process.exit(1);});
module.exports={readPack,validateLevel,validatePack};

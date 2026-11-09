#!/usr/bin/env node
/**
 * Bible Unfolded Word Trails puzzle validator.
 * Run: node scripts/word_trails_quality_gate.mjs
 * Content facts still require editorial check against the linked NWT passage.
 * TEST-only: do not treat this as live-release shared-core approval.
 */
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const raw=fs.readFileSync('experiments/word-trails-next-v1.js','utf8');
const start=raw.indexOf('const LEVELS=['),stop=raw.indexOf('// Verified extension:',start);
assert(start>=0&&stop>start,'Original data source changed; update extractor');
const initial=vm.runInNewContext('(()=>{'+raw.slice(start,stop)+'\nreturn {LEVELS,EXTRA_SPARKS};})()',{},{timeout:1500});
const extraSource=fs.readFileSync('experiments/word-trails-levels-12-30-v1.js','utf8');
const match=extraSource.match(/Object\.freeze\((\[[\s\S]*\])\);?/);
assert(match,'Additional level bank must be parseable JSON');
const later=JSON.parse(match[1]),levels=[...initial.LEVELS,...later];
const extra=[...initial.EXTRA_SPARKS,...later.map(x=>x.extraSparks)];
assert.equal(initial.LEVELS.length,11,'Do not change initial 11 levels silently');
assert.equal(later.length,19,'Expected levels 12–30');
const fail=[],review=[],summaries=[],titles=new Set();
const canMake=(rack,word)=>{
 const m={};for(const ch of rack)m[ch]=(m[ch]||0)+1;
 return [...word].every(ch=>m[ch]-- >0);
};
const wordOK=w=>typeof w==='string'&&/^[A-Z]{3,7}$/.test(w);
const scriptureOK=x=>x&&x.url?.startsWith('https://www.jw.org/en/library/bible/nwt/books/')&&
 typeof x.clue==='string'&&x.clue.length>=10&&
 typeof x.reference==='string'&&x.reference.length>=6&&
 typeof x.insight==='string'&&x.insight.length>=20;
// Verify that each newer Bible clue links to the very Bible book and chapter it cites.
const sourceMatchesReference=x=>{
 const match=x?.reference?.match(/^(.+?)\s+(\d+):\d+/);
 if(!match)return false;
 let book=match[1].toLowerCase().replace(/\s+/g,'-');
 if(book==='psalm')book='psalms';
 return x.url===`https://www.jw.org/en/library/bible/nwt/books/${book}/${match[2]}/`;
};
for(let i=0;i<levels.length;i++){
 const l=levels[i],n=i+1,size=l.size||5,words=l.words||[];
 const error=s=>fail.push('Level '+n+': '+s),warn=s=>review.push('Level '+n+': '+s);
 if(![5,6,7].includes(size))error('Unsupported grid '+size);
 if(!/^[A-Z]{6,7}$/.test(l.rack))error('Invalid 6–7 letter rack '+l.rack);
 if(titles.has(l.title))error('Repeated level title');titles.add(l.title);
 if(!fs.existsSync('bible-book-art/'+l.scene))error('Missing art '+l.scene);
 const required=new Set(),grid=new Map(),links=words.map(()=>new Set());
 for(const [j,row] of words.entries()){
  const [word,y,x,dir]=row;
  if(!wordOK(word)||!canMake(l.rack,word))error('Impossible answer '+word);
  if(required.has(word))error('Repeated answer '+word);required.add(word);
  if(!['down','across'].includes(dir))error('Bad word direction '+dir);
  for(let k=0;k<word.length;k++){
   const r=y+(dir==='down'?k:0),c=x+(dir==='across'?k:0);
   if(r<0||c<0||r>=size||c>=size){error('Out-of-grid answer '+word);continue}
   const cell=r+':'+c;
   if(!grid.has(cell))grid.set(cell,{letter:word[k],slots:[]});
   const item=grid.get(cell);
   if(item.letter!==word[k])error('Crossing mismatch '+word+' at '+cell);
   if(item.slots.some(s=>s.dir===dir))error('Same-direction collision at '+cell);
   item.slots.push({j,dir});
  }
 }
 let crossings=0,unwantedTouch=0;
 for(const [key,value] of grid){
  if(value.slots.length>1){
   crossings++;
   for(const a of value.slots)for(const b of value.slots)if(a.j!==b.j)links[a.j].add(b.j);
  }
  const [r,c]=key.split(':').map(Number);
  for(const neighbor of [grid.get((r+1)+':'+c),grid.get(r+':'+(c+1))])
   if(neighbor&&!value.slots.some(a=>neighbor.slots.some(b=>a.j===b.j)))unwantedTouch++;
 }
 const reached=new Set([0]),queue=[0];
 while(queue.length){
  const j=queue.shift();for(const k of links[j]||[])if(!reached.has(k)){reached.add(k);queue.push(k)}
 }
 if(reached.size!==words.length)error('Disconnected crossword '+reached.size+'/'+words.length);
 if(words.length>=4&&crossings<2)error('Insufficient intersections');
 if(unwantedTouch){
  if(i>=11)error(unwantedTouch+' unrelated touching tile pairs (new levels require clean crossword spacing)');
  else warn(unwantedTouch+' legacy touching tile pairs; original layouts remain protected');
 }
 const bible=l.bibleBoard||[],bibSeen=new Set();
 if(i>=11&&bible.length<2)error('Need at least two biblical crossword words');
 for(const item of bible){
  if(!required.has(item.word)||bibSeen.has(item.word))error('Bible answer missing or duplicate: '+item.word);
  bibSeen.add(item.word);
  if(!scriptureOK(item))error('Incomplete NWT source fields: '+item.word);
  if(i>=11&&!sourceMatchesReference(item))error('Wrong chapter URL for Bible crossword answer '+item.word);
 }
 const secret=[{word:l.spark,clue:l.clue,reference:l.reference,url:l.url,insight:l.insight},...(extra[i]||[])];
 const secretWords=new Set();
 if(secret.length<2)error('Need two hidden Bible discoveries');
 for(const item of secret){
  if(!wordOK(item.word)||!canMake(l.rack,item.word))error('Invalid hidden Bible word '+item.word);
  if(required.has(item.word)||secretWords.has(item.word))error('Hidden word duplicates an answer or secret '+item.word);
  secretWords.add(item.word);
  if(!scriptureOK(item))error('Hidden word needs full NWT source: '+item.word);
  if(i>=11&&!sourceMatchesReference(item))error('Wrong chapter URL for hidden Bible discovery '+item.word);
 }
 const bonuses=l.bonus.trim().split(/\s+/),seen=new Set();
 let usable=0;
 for(const word of bonuses){
  if(!wordOK(word)||!canMake(l.rack,word))error('Impossible bonus '+word);
  if(seen.has(word)){if(i>=11)error('Repeated bonus '+word);else warn('Legacy duplicate bonus '+word+' safely deduplicated by the runtime');}seen.add(word);
  if(required.has(word)||secretWords.has(word)){
   if(i>=11)error('Unreachable bonus '+word+' is already an answer or Bible secret');
   else warn('Legacy bonus '+word+' reserved by higher priority match');
  }else usable++;
 }
 if(i>=11&&usable<2)error('Only '+usable+' actual bonus words; no invented filler');
 summaries.push({level:n,title:l.title,grid:size,answers:words.length,crossings,unwantedTouch,
  bibleOnBoard:bible.length,bibleHidden:secret.length,playableBonuses:usable,scene:l.scene});
}
const scenery=new Set(summaries.slice(11).map(x=>x.scene));
if(scenery.size<12)fail.push('Scenery: only '+scenery.size+' distinct illustrations in 19 new levels');
for(let i=12;i<summaries.length;i++)
 if(summaries[i].scene===summaries[i-1].scene)
  review.push('Level '+(i+1)+': back-to-back scene reuse');
const totals={
 levels:summaries.length,newLevels:later.length,
 visibleBible:summaries.reduce((n,x)=>n+x.bibleOnBoard,0),
 hiddenBible:summaries.reduce((n,x)=>n+x.bibleHidden,0),
 realBonuses12to30:summaries.slice(11).reduce((n,x)=>n+x.playableBonuses,0),
 uniqueScenes12to30:scenery.size,editorialWarnings:review.length,errors:fail.length
};
console.log('WORD_TRAILS_QUALITY_SUMMARY',JSON.stringify(totals));
console.log('WORD_TRAILS_LEVEL_MATRIX',JSON.stringify(summaries));
for(const w of review)console.log('EDITORIAL_LAYOUT_REVIEW',w);
for(const f of fail)console.error('PUZZLE_FAILURE',f);
assert.equal(fail.length,0,fail.length+' critical puzzle errors; do not release');
console.log('PASS: 30 puzzles have valid intersections, connected boards, source fields, playable bonuses and scenic assets.');

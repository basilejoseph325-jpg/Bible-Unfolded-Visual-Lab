#!/usr/bin/env node
// Bible Unfolded Visual Lab — TEST-only 20-entry editorial QA, levels 22–26.
// Verifies exact source/ledger parity and gameplay identity. Not independent human signoff.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const source=fs.readFileSync('experiments/word-trails-levels-12-30-v1.js','utf8');
const match=source.match(/Object\.freeze\((\[[\s\S]*\])\);?/);
assert(match,'19-level extension data present');
const levels=JSON.parse(match[1]);
const ledger=fs.readFileSync('docs/WORD_TRAILS_12_TO_30_SOURCE_LEDGER_2026-11-09.md','utf8');
const rows=ledger.split('\n').filter(x=>/^\|\s*\d\d\s*\|/.test(x));
assert.equal(levels.length,19,'Original 11 plus 19 TEST-only levels');
assert.equal(rows.length,77,'Unchanged 77-entry source ledger');
const changed=new Set([
 '22-board-MARTHA','22-board-TAMAR','22-extra-RAM',
 '23-board-SIMEON','23-board-SIMON','23-extra-NOISE',
 '24-board-BABEL','24-board-ABEL','24-spark-SEA','24-extra-SEAL',
 '25-board-GALILEE','25-board-ELI','25-spark-EAGLE',
 '26-board-ESTHER','26-board-RUTH','26-spark-REST','26-extra-THREE'
]);
const mayMake=(rack,word)=>{
 const counts={};for(const l of rack)counts[l]=(counts[l]||0)+1;
 return [...word].every(c=>counts[c]-->0);
};
let count=0,improved=0,retained=0;
for(let level=22;level<=26;level++){
 const l=levels[level-12];
 const entries=[...l.bibleBoard.map(e=>({...e,kind:'board'})),
  {kind:'spark',word:l.spark,clue:l.clue,reference:l.reference,url:l.url,insight:l.insight},
  ...l.extraSparks.map(e=>({...e,kind:'extra'}))];
 for(const item of entries){
  const key=level+'-'+item.kind+'-'+item.word;
  assert(item.word&&item.clue&&item.reference&&item.url&&item.insight,'Complete content '+key);
  assert(mayMake(l.rack,item.word),'Puzzle rack can form '+key);
  const row=rows.filter(s=>s.startsWith('| '+level+' | '+item.kind+' | '+item.word+' |'));
  assert.equal(row.length,1,'One audited row '+key);
  assert(row[0].includes(item.clue)&&row[0].includes(item.insight),'Audited clue/insight match actual game '+key);
  assert(row[0].includes('['+item.reference+']('+item.url+')'),'Audited NWT source matches actual game '+key);
  assert(row[0].includes('2026-11-13')&&row[0].includes('independent human signoff pending'),'No invented human signoff '+key);
  const ref=item.reference.match(/^(.+?)\s+(\d+):/);
  assert(ref,'Bible reference form '+key);
  const book=ref[1].toLowerCase().replaceAll(' ','-').replace(/^psalm$/,'psalms');
  assert.equal(item.url,'https://www.jw.org/en/library/bible/nwt/books/'+book+'/'+ref[2]+'/','Source chapter exact '+key);
  if(changed.has(key)){
   assert(row[0].includes('improved wording'),'Changed entry marked revised '+key);improved++;
  }else{
   assert(row[0].includes('source-aligned wording retained'),'Retained entry classified '+key);retained++;
  }
  count++;
 }
}
assert.equal(count,20);assert.equal(improved,17);assert.equal(retained,3);
const at=(n,kind,word)=>{let l=levels[n-12];return kind==='board'?l.bibleBoard.find(x=>x.word===word):kind==='extra'?l.extraSparks.find(x=>x.word===word):{word:l.spark,clue:l.clue,insight:l.insight,reference:l.reference}};
assert(at(22,'board','MARTHA').insight.includes('Mary chose'),'Martha and Mary account');
assert(at(22,'board','TAMAR').reference==='Genesis 38:6-14','Judah and Tamar full context');
assert(at(23,'board','SIMEON').insight.includes("wouldn't die"),'Simeon spirit revelation');
assert(at(23,'extra','NOISE').insight.includes('not an actual windstorm'),'Noise is described as LIKE rushing wind');
assert(at(24,'board','BABEL').insight.includes('avoid being scattered'),'Babel history');
assert(at(24,'extra','SEAL').reference==='Daniel 12:4, 8, 9','Daniel understood only part');
assert(at(25,'board','ELI').reference==='1 Samuel 3:15-18','Samuel and Eli context');
assert(at(25,'spark','EAGLE').reference==='Job 39:27-29' &&
  at(25,'spark','EAGLE').clue.includes('nesting high on a cliff'),
  'Eagle clue must uniquely distinguish the eagle from the falcon in Job 39:26-29');
assert(at(26,'board','ESTHER').clue.includes('Hadassah'),'Avoid repeated Esther clue');
assert(at(26,'board','RUTH').insight.includes('change of life'),'Ruth story sensitivity');
assert(at(26,'spark','REST').insight.includes('declared it sacred'),'Seventh-day rest explained');
assert(at(26,'extra','THREE').insight.includes('sea became calm'),'Jonah additional story detail');
assert(ledger.includes('all 77 entries (levels 12–30)')&&ledger.includes('54 revised and 23 retained'),'Latest cumulative source review count');
console.log('PASS 20 items, 17 improved, 3 retained; NWT chapters and ledger match; 77/77 AI-assisted first-pass, human signoff pending. No independent human signoff.');

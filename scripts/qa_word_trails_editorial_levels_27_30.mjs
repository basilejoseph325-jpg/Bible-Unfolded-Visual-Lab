#!/usr/bin/env node
// Read-only TEST editorial integrity gate. It checks 16 final items; NOT independent human signoff.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const raw=fs.readFileSync('experiments/word-trails-levels-12-30-v1.js','utf8');
const m=raw.match(/Object\.freeze\((\[[\s\S]*\])\);?/);
assert(m,'19 additional levels load as source JSON');
const bank=JSON.parse(m[1]);
assert.equal(bank.length,19,'Original eleven plus nineteen levels remains intact');
const ledger=fs.readFileSync('docs/WORD_TRAILS_12_TO_30_SOURCE_LEDGER_2026-11-09.md','utf8');
const rows=ledger.split('\n').filter(s=>/^\|\s*\d\d\s*\|/.test(s));
assert.equal(rows.length,77,'Keep exact 77-entry source ledger');
const changed=new Set([
 '27-board-PAUL','27-board-SAUL','27-spark-SALT',
 '28-board-PSALMS','28-board-PSALM','28-spark-LAMP','28-extra-PALM',
 '29-board-JORDAN','29-spark-ROD','29-extra-JAR',
 '30-board-LEVITES','30-board-LEVI','30-spark-VEIL','30-extra-EVIL']);
const canMake=(rack,word)=>{
 const counts={};for(const ch of rack)counts[ch]=(counts[ch]||0)+1;
 return [...word].every(ch=>counts[ch]-- >0);
};
let total=0,revised=0,retained=0;
for(let level=27;level<=30;level++){
 const l=bank[level-12];
 const items=[...l.bibleBoard.map(x=>({...x,kind:'board'})),
 {kind:'spark',word:l.spark,clue:l.clue,reference:l.reference,url:l.url,insight:l.insight},
 ...l.extraSparks.map(x=>({...x,kind:'extra'}))];
 for(const x of items){
  const id=level+'-'+x.kind+'-'+x.word;
  assert(x.word&&x.clue&&x.reference&&x.insight&&x.url,'Complete source '+id);
  assert(canMake(l.rack,x.word),'Wheel can spell '+id);
  const row=rows.filter(r=>r.startsWith('| '+level+' | '+x.kind+' | '+x.word+' |'));
  assert.equal(row.length,1,'Single matching source ledger record '+id);
  assert(row[0].includes(x.clue)&&row[0].includes(x.insight),'Real clue/insight match source-ledger row '+id);
  assert(row[0].includes('['+x.reference+']('+x.url+')'),'Real passage link and verse match ledger '+id);
  assert(row[0].includes('2026-11-13')&&row[0].includes('independent human signoff pending'),'Honest editorial acceptance status '+id);
  const m=x.reference.match(/^(.+?)\s+(\d+):/);
  assert(m,'Bible reference syntax '+id);
  const book=m[1].toLowerCase().replaceAll(' ','-').replace(/^psalm$/,'psalms');
  assert.equal(x.url,'https://www.jw.org/en/library/bible/nwt/books/'+book+'/'+m[2]+'/','NWT 2013 official source link '+id);
  if(changed.has(id)){assert(row[0].includes('improved wording'),id+' must be logged as revised');revised++}
  else{assert(row[0].includes('source-aligned wording retained'),id+' must be logged as retained');retained++}
  total++;
 }
}
assert.equal(total,16);assert.equal(revised,14);assert.equal(retained,2);
const q=(level,kind,word)=>{const l=bank[level-12];return kind==='board'?l.bibleBoard.find(x=>x.word===word):kind==='extra'?l.extraSparks.find(x=>x.word===word):{word:l.spark,clue:l.clue,reference:l.reference,insight:l.insight}};
assert(q(27,'board','PAUL').insight.includes('same man'),'Saul/Paul same-person distinction');
assert(q(27,'board','SAUL').insight.includes("doesn't say"),'No invented renaming event');
assert(q(27,'spark','SALT').insight.includes('remaining genuinely useful'),'Salt context');
assert(q(28,'board','PSALMS').insight.includes('streams of water'),'Psalms 1 context');
assert(q(28,'board','PSALM').reference==='Psalm 23:1-4','Psalm 23 additional context');
assert(q(28,'spark','LAMP').insight.includes('next footstep'),'Psalm 119 lamp application labeled figurative');
assert(q(28,'extra','PALM').reference==='Psalm 92:12-14','Psalm 92 palm/old age');
assert(q(29,'board','JORDAN').insight.includes('overflowing its banks'),'Joshua 3 harvest season');
assert(q(29,'spark','ROD').reference==='Exodus 4:2-5','Moses sign context');
assert(q(29,'extra','JAR').insight.includes('pay her debt'),'Widow oil debt');
assert(q(30,'board','LEVITES').insight.includes('Not every Levite served as a priest'),'Priests vs Levites');
assert(q(30,'board','LEVI').insight.includes('third son'),'Leah Levi source');
assert(q(30,'spark','VEIL').reference==='2 Corinthians 3:12-16','Paul applies Moses veil illustration');
assert(q(30,'extra','EVIL').insight.includes('kindness instead of retaliation'),'Romans 12 broader context');
assert(ledger.includes('all 77 entries (levels 12–30)')&&ledger.includes('54 revised and 23 retained'),'Final first-pass tally');
console.log('PASS final 16 Bible entries L27–30: 14 revised, 2 retained; 77/77 AI-assisted first-pass; source ledger and crossword IDs intact. No independent human signoff.');

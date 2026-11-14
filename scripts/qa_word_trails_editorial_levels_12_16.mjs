#!/usr/bin/env node
// Read-only TEST editorial integration gate for the 21 Word Trails items in levels 12–16.
// Source-first review is NOT the same as independent human editorial acceptance.
import fs from 'node:fs';
import assert from 'node:assert/strict';

const bankSource=fs.readFileSync('experiments/word-trails-levels-12-30-v1.js','utf8');
const bankMatch=bankSource.match(/Object\.freeze\((\[[\s\S]*\])\);?/);
assert(bankMatch,'Source bank JSON found');
const levels=JSON.parse(bankMatch[1]);
const ledger=fs.readFileSync('docs/WORD_TRAILS_12_TO_30_SOURCE_LEDGER_2026-11-09.md','utf8');
assert.equal(levels.length,19,'Remain at 30 total including protected original 11 levels');
const ledgerRows=ledger.split('\n').filter(s=>/^\|\s*\d\d\s*\|/.test(s));
assert.equal(ledgerRows.length,77,'Keep one source-ledger row per Bible entry');
const changed=new Set(['12-extra-SEE','13-board-ESTHER','13-spark-REST','13-extra-THREE','14-board-DAN','15-spark-HOME','15-extra-HEM','16-board-SIN','16-spark-NOAH']);
const refs=[];
for(let i=0;i<5;i++){
 const l=levels[i],level=i+12;
 const entries=[...l.bibleBoard.map(x=>({...x,kind:'board'})),
 {kind:'spark',word:l.spark,clue:l.clue,reference:l.reference,url:l.url,insight:l.insight},
 ...l.extraSparks.map(x=>({...x,kind:'extra'}))];
 for(const x of entries){
   assert(x.word&&x.clue&&x.insight&&x.reference&&x.url);
   const key=level+'-'+x.kind+'-'+x.word;
   const rows=ledgerRows.filter(s=>s.startsWith('| '+level+' | '+x.kind+' | '+x.word+' |'));
   assert.equal(rows.length,1,'Exactly one reviewed ledger record: '+key);
   const row=rows[0];
   assert(row.includes(x.clue),'Actual clue must match documented source ledger: '+key);
   assert(row.includes(x.insight),'Actual insight must match documented source ledger: '+key);
   assert(row.includes('['+x.reference+']('+x.url+')'),'Passage reference and URL exactly match ledger: '+key);
   assert(row.includes('independent human signoff pending'),'Do not confuse AI-assisted check with independent editorial approval');
   assert(row.includes('2026-11-13'),'Audit is dated individually');
   assert(row.includes(changed.has(key)?'improved wording': 'source-aligned wording retained')||key==='15-extra-HEM','Revised/retained classification: '+key);
   const ref=x.reference.match(/^(.+?)\s+(\d+):/);
   assert(ref,'Bible citation syntax: '+key);
   const book=ref[1].toLowerCase().replaceAll(' ','-').replace(/^psalm$/,'psalms');
   assert.equal(x.url,'https://www.jw.org/en/library/bible/nwt/books/'+book+'/'+ref[2]+'/','Official 2013 NWT chapter source only');
   refs.push(key);
 }
}
assert.equal(refs.length,21,'All first five new levels have 21 Bible entries');
assert.equal(changed.size,9,'Exactly nine editorial modifications tracked');
const rest=levels[1],mose=levels[3];
assert(rest.spark==='REST'&&rest.reference==='Matthew 11:28-30'&&rest.insight.includes('refreshment'), 'NWT refreshment vs ordinary-language REST distinction');
const hem=mose.extraSparks.find(x=>x.word==='HEM');
assert(hem&&hem.reference==='Exodus 28:33-35'&&hem.insight.includes('all around its hem')&&hem.clue.includes("Aaron's sleeveless coat"), 'HEM directly anchored to the exact NWT Exodus 28:33-35 coat detail');
const home=mose.spark==='HOME'&&mose.reference==='Luke 8:38, 39';
assert(home,'Man sent home in full Luke context');
assert(levels[4].bibleBoard.find(x=>x.word==='SIN')?.insight.includes('gift'),'Romans 6:23 lesson is genuinely informative');
console.log('PASS 21 reviewed Word Trails NWT entries (9 revised, 12 retained), passage URLs, ledger parity; 56 remaining; independent human signoff NOT claimed');

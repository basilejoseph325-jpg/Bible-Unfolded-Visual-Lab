#!/usr/bin/env node
// TEST-only Word Trails source-ledger parity for levels 17–21.
// Script validates structure, not independent editorial signoff.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const src=fs.readFileSync('experiments/word-trails-levels-12-30-v1.js','utf8');
const m=src.match(/Object\.freeze\((\[[\s\S]*\])\);?/);
assert(m,'19-level authored bank present');
const levels=JSON.parse(m[1]);
const ledger=fs.readFileSync('docs/WORD_TRAILS_12_TO_30_SOURCE_LEDGER_2026-11-09.md','utf8');
assert.equal(levels.length,19);
const rows=ledger.split('\n').filter(s=>/^\|\s*\d\d\s*\|/.test(s));
assert.equal(rows.length,77,'Keep every Bible discovery entry');
const revised=new Set(['17-board-SARAH','17-board-MARAH','17-spark-HAM','17-extra-RAM',
 '18-board-ELIJAH','18-spark-ELI','18-extra-HEAL',
 '19-board-RACHEL','19-spark-CARE',
 '20-board-SAMSON','20-board-AMOS','20-extra-MAN',
 '21-board-ELISHA','21-spark-ELI','21-extra-SEAL']);
const canMake=(rack,word)=>{
 const counts={};for(const ch of rack)counts[ch]=(counts[ch]||0)+1;
 return [...word].every(ch=>counts[ch]-- >0);
};
const reviewed=[];
for(let level=17;level<=21;level++){
 const l=levels[level-12];
 const set=[...l.bibleBoard.map(x=>({...x,kind:'board'})),
   {word:l.spark,clue:l.clue,insight:l.insight,reference:l.reference,url:l.url,kind:'spark'},
   ...l.extraSparks.map(x=>({...x,kind:'extra'}))];
 for(const x of set){
   const key=level+'-'+x.kind+'-'+x.word;
   const record=rows.filter(row=>row.startsWith('| '+level+' | '+x.kind+' | '+x.word+' |'));
   assert.equal(record.length,1,'Source ledger row must be unique '+key);
   assert(x.clue&&x.insight&&x.reference&&x.url,'No missing source data '+key);
   assert(canMake(l.rack,x.word),'Target playable from letter rack '+key);
   assert(record[0].includes(x.clue),'Source ledger clue matches actual game '+key);
   assert(record[0].includes(x.insight),'Source ledger explanation matches actual game '+key);
   assert(record[0].includes('['+x.reference+']('+x.url+')'),'Source ledger reference and link '+key);
   assert(record[0].includes('2026-11-13')&&record[0].includes('independent human signoff pending'));
   assert(record[0].includes(revised.has(key)?'improved wording':'source-aligned wording retained'), 'Accurate revised/retained status '+key);
   const r=x.reference.match(/^(.+?)\s+(\d+):/);
   assert(r,'Passage format '+key);
   const book=r[1].toLowerCase().replaceAll(' ','-').replace(/^psalm$/,'psalms');
   assert.equal(x.url,'https://www.jw.org/en/library/bible/nwt/books/'+book+'/'+r[2]+'/', 'NWT source book/chapter matches '+key);
   reviewed.push(key);
 }
}
assert.equal(reviewed.length,20);
assert.equal(revised.size,15);
const marah=levels[5].bibleBoard.find(x=>x.word==='MARAH');
assert(marah?.reference==='Numbers 33:1, 2, 8, 9'&&marah.insight.includes('12 springs and 70 palm trees')&&marah.clue.includes('Elim'),'L17 MARAH itinerary must be different from original L11 bitter-water lesson');
const oldLevelSource=fs.readFileSync('experiments/word-trails-next-v1.js','utf8');
assert(oldLevelSource.includes("spark:'MARAH'")&&oldLevelSource.includes("reference:'Exodus 15:23-25'"),'Protected L11 MARAH stays unchanged');
assert(levels[5].spark==='HAM'&&levels[5].reference==='Genesis 9:21-23'&&levels[5].insight.includes('Shem and Japheth'),'L17 Ham distinct from protected L11 basic Flood list');
assert(levels[5].extraSparks.find(x=>x.word==='RAM')?.reference==='Genesis 15:7-10, 18'&&levels[5].extraSparks.find(x=>x.word==='RAM').insight.includes('covenant'),'L17 Ram now Abraham covenant, not protected L11 Isaac substitution');
assert(levels[6].extraSparks.find(x=>x.word==='HEAL')?.insight.includes('captive in Syria'), 'Naaman account context');
assert(levels[7].spark==='CARE'&&levels[7].reference==='1 Peter 5:6, 7', 'God cares source');
assert(levels[8].bibleBoard.find(x=>x.word==='AMOS')?.insight.includes('earthquake'), 'Amos passage adds educational value');
assert(levels[9].bibleBoard.find(x=>x.word==='ELISHA')?.insight.includes('waters divided'), 'Elisha continuity verified');
assert(levels[9].extraSparks.find(x=>x.word==='SEAL')?.reference==='Esther 8:8-10'&&levels[9].extraSparks.find(x=>x.word==='SEAL').insight.includes('signet ring'),'Royal Esther seal distinct from protected L4 Revelation');
console.log('PASS levels 17–21: 20 NWT-backed entries, 15 revised, 5 retained; full ledger parity and 36 remaining; NOT independent human signoff');

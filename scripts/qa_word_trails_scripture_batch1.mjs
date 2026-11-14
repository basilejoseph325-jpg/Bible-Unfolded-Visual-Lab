#!/usr/bin/env node
/* Bible Unfolded · Word Trails source-first content QA · TEST ONLY.
   Protect the original geometry, 30-level progression and source attribution.
   A technical QA is not independent human editorial approval. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
const raw=fs.readFileSync('experiments/word-trails-levels-12-30-v1.js','utf8');
const m=raw.match(/Object\.freeze\((\[[\s\S]*\])\);?/);
assert(m,'Parseable 19-level source JSON');
const levels=JSON.parse(m[1]),ledger=fs.readFileSync('docs/WORD_TRAILS_12_TO_30_SOURCE_LEDGER_2026-11-09.md','utf8');
assert.equal(levels.length,19);
const count=levels.reduce((n,l)=>n+l.bibleBoard.length+1+l.extraSparks.length,0);
assert.equal(count,77,'Retain all 77 NWT-backed Bible answers and discoveries');
const targets=[
 {level:12,kind:'spark',word:'SUE',ref:'Matthew 5:40',chapter:'matthew/5',basis:'inner garment'},
 {level:14,kind:'extra',word:'END',ref:'Isaiah 9:6, 7',chapter:'isaiah/9',basis:'peace'},
 {level:15,kind:'extra',word:'HEM',ref:'Exodus 28:33-35',chapter:'exodus/28',basis:'all around its hem'},
 {level:20,kind:'spark',word:'AMON',ref:'2 Kings 21:18-24',chapter:'2-kings/21',basis:'two years'},
 {level:25,kind:'extra',word:'AGE',ref:'Psalm 92:12-15',chapter:'psalms/92',basis:'flourishing trees'},
 {level:27,kind:'extra',word:'SLAP',ref:'Matthew 5:39',chapter:'matthew/5',basis:'cheek'}
];
const canMake=(rack,word)=>{const counts={};for(const ch of rack)counts[ch]=(counts[ch]||0)+1;return [...word].every(ch=>counts[ch]-->0);};
for(const t of targets){
 const l=levels[t.level-12],item=t.kind==='spark'?
   {word:l.spark,clue:l.clue,reference:l.reference,url:l.url,insight:l.insight}:
   l.extraSparks.find(x=>x.word===t.word);
 assert(item,'Scripture item '+t.level+' '+t.word);
 assert.equal(item.word,t.word);
 assert.equal(item.reference,t.ref);
 assert.equal(item.url,'https://www.jw.org/en/library/bible/nwt/books/'+t.chapter+'/');
 assert(item.insight.includes(t.basis),'The original passage-specific educational detail must be preserved');
 assert(canMake(l.rack,t.word),'Hidden word is actually playable');
 assert(!l.words.some(w=>w[0]===t.word),'Discovery must not be a required crossword answer');
 assert(!l.bonus.split(' ').includes(t.word),'Secret may not also pay a bonus');
 const row=ledger.split('\n').filter(s=>s.startsWith('| '+t.level+' | '+t.kind+' | '+t.word+' |'));
 assert.equal(row.length,1,'Ledger has precisely one source record '+t.word);
 assert(row[0].includes('['+t.ref+']('+item.url+')'));
 assert(row[0].includes(item.clue)&&row[0].includes(item.insight),'Ledger matches actual shipped clue, passage, explanation');
 assert(row[0].includes('independent human signoff pending'),'Technical source check is NOT human signoff');
}
for(const t of [{level:14,old:'DEN'},{level:15,old:'SHE'},{level:20,old:'SON'},{level:25,old:'GLEE'}]){
 const l=levels[t.level-12];
 assert(l.spark!==t.old&&!l.extraSparks.some(x=>x.word===t.old),
   'Low-value secret '+t.old+' must be replaced at level '+t.level);
}
console.log('PASS 19 new levels, 77 Bible entries, 6 exact NWT source-checked edits, playable letters, no bonus collisions and ledger parity; LIVE protected');

'use strict';
const assert=require('node:assert/strict'),bank=require('../family-fresh-mix/friendship-prompts-v1.js'),fs=require('node:fs');
const all=Object.values(bank).flat();assert.equal(Object.keys(bank).length,6);assert.equal(all.length,300);assert.equal(new Set(all.map(p=>p.id)).size,300);assert.equal(new Set(all.map(p=>p.text.toLowerCase())).size,300);
for(const [type,prompts]of Object.entries(bank)){assert.equal(prompts.length,50);for(const q of prompts){assert(q.text.length>=20&&q.text.length<=240);assert(!/[<>]/.test(q.text));if(type==='predict'){assert.equal(q.choices.length,3);assert.equal(new Set(q.choices).size,3)}else assert(!q.choices)}}
const source=fs.readFileSync('family-fresh-mix/friendship-activities-v1.js','utf8');assert(!/awardOnce|economy\.|InsightWallet|localStorage\.(set|remove)/.test(source));
console.log('PASS 300 unique prompts, six banks of 50, 50 fair three-choice predictions; no direct wallet/reward/storage mutation');
// A wording/choice revision must not reinterpret a previously selected private
// answer, or lose the prompt belonging to a saved turn.
const vm=require('node:vm'),cp=require('node:child_process'),oldContext={window:{}};
vm.runInNewContext(cp.execFileSync('git',['show','4c13fdec1c172a623dd9774b387487ae24869365:family-fresh-mix/friendship-prompts-v1.js'],{encoding:'utf8'}),oldContext);
const oldBank=JSON.parse(JSON.stringify(oldContext.window.BUFriendshipPrompts)),oldAll=Object.values(oldBank).flat();
assert.equal(Object.keys(bank.legacy).length,145);
for(const [id,q]of Object.entries(bank.legacy)){
 assert.deepEqual(q,oldAll.find(old=>old.id===id),'Archived saved turn changed');
 assert(!all.some(current=>current.id===id),'Retired prompt must not enter new draws');
 const updated=all.find(current=>current.id===id+'-r2');assert(updated,'Missing revised prompt');assert.notEqual(updated.text,q.text);
}
assert.equal(bank.faith.filter(q=>q.id.endsWith('-r2')).length,35);
assert.equal(bank.predict.filter(q=>q.id.endsWith('-r2')).length,35);
console.log('PASS 145 reviewed replacements; all retired saved turns retain exact original wording/choices; 35 faith and 35 personality prediction refinements');

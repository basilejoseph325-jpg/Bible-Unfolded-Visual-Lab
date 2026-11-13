#!/usr/bin/env node
'use strict';
/* TEST-only migration-candidate contract: synthetic localStorage, ZERO LIVE code writes.
   Not a human-approval, LIVE-deploy, UI-consent or physical-phone certificate. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const code=fs.readFileSync('experiments/word-trails-live-consent-migration-candidate-v1.js','utf8');
const T='bu-visual-lab-wordtrails-next-v1',L='bible-unfolded-word-trails-next-v1';
const wallet='bible-unfolded-rewards-v17',owner='bible-unfolded-wheel-ownership-v3825-backup',voice='bible-unfolded-private-voice-pref-v381';
const sample=()=>({level:2,unlocked:4,coins:1099,points:210,completed:[0,1,2],sparks:[0],claimedSparks:['0:PAUL'],
  boardBible:[],paidWords:[],paidBonuses:['0|ART'],claimedFreeHints:[0],sound:true,
  progress:{level:2,found:['ELI'],bonuses:['LIE'],hinted:['1:0'],combo:2}});
const rootValues=()=>({[wallet]:JSON.stringify({points:-11,coins:543,purchases:['seawheel'],equippedWheel:'seawheel'}),
 [owner]:JSON.stringify({owned:['seawheel']}),[voice]:'{"mode":"rotating"}'});
function fixture(values={},options={}){
 const store=new Map(Object.entries({...rootValues(),...values}));
 const writes=[];
 const localStorage={
  getItem:k=>store.has(k)?store.get(k):null,
  setItem:(k,v)=>{if(options.noWrites)throw Error('storage denied');writes.push(k);store.set(k,String(v))},
  removeItem:k=>{writes.push(k);store.delete(k)}
 };
 const context={window:{},localStorage};
 vm.runInNewContext(code,context,{timeout:2000});
 return {api:context.window.BUWTConsentMigrationCandidateV1,store,writes};
}
const source=JSON.stringify(sample());
const initial=fixture({[T]:source});
assert.equal(initial.writes.length,0,'Loading code itself must cause NO writes');
const p=initial.api.preview();
assert.equal(p.available,true);
assert.equal(p.requiresExplicitConsent,true);
assert.equal(p.completedCount,3);
assert.equal(initial.api.acceptExplicitly().ok,false,'No consent means no import');
assert.equal(initial.api.acceptExplicitly({approved:false,sourceRaw:p.sourceRaw}).ok,false);
assert.equal(initial.writes.length,0,'Preview and refusal must be READ-ONLY');
const imported=initial.api.acceptExplicitly({approved:true,sourceRaw:p.sourceRaw});
assert.equal(imported.ok,true);
assert.deepEqual(initial.writes,[L],'Only LIVE crossword progress key may be written');
const migrated=JSON.parse(initial.store.get(L));
assert.equal(migrated.coins,60,'No test coins promoted');
assert.equal(migrated.points,0,'No test points promoted');
assert.equal(migrated.migration.temporaryCoinsExcluded,true);
assert.equal(migrated.unlocked,4);assert.equal(migrated.progress.found[0],'ELI');
assert.equal(migrated.completed.length,3);
assert.equal(initial.store.get(T),source,'Test data never deleted');
const native=rootValues();
for(const k of [wallet,owner,voice])assert.equal(initial.store.get(k),native[k],'Shared progress and purchases must remain intact');
assert.equal(initial.api.acceptExplicitly({approved:true,sourceRaw:p.sourceRaw}).reason,'live-progress-exists');
assert.deepEqual(initial.writes,[L],'Repeated approval cannot double-award or overwrite');

const already=fixture({[T]:source,[L]:JSON.stringify({level:29,coins:1})});
assert.equal(already.api.preview().reason,'live-progress-exists');
assert.equal(already.api.acceptExplicitly({approved:true,sourceRaw:source}).reason,'live-progress-exists');
assert.equal(already.writes.length,0,'Existing LIVE progress never overwritten');
const changed=fixture({[T]:source});const preview=changed.api.preview();
changed.store.set(T,JSON.stringify({...sample(),level:3}));
assert.equal(changed.api.acceptExplicitly({approved:true,sourceRaw:preview.sourceRaw}).reason,'test-progress-changed');
assert.equal(changed.writes.length,0);
const bad=fixture({[T]:'{invalid'});
assert.equal(bad.api.preview().available,false);
assert.equal(bad.api.acceptExplicitly({approved:true,sourceRaw:'{invalid'}).reason,'invalid-test-progress');
assert.equal(bad.writes.length,0);
const denied=fixture({[T]:source},{noWrites:true});
assert.equal(denied.api.acceptExplicitly({approved:true,sourceRaw:source}).reason,'save-failed');
assert.equal(denied.store.has(L),false,'Failed storage must not claim migrated');
assert.equal(denied.writes.length,0);

console.log('PASS_TEST_ONLY_CONSENT_MIGRATION_CANDIDATE 8 fixture scenarios, no automatic import, no wallet/ownership/voice writes, no TEST coin/points transfer, no duplicate awards, existing LIVE save never overwritten');
console.log('BLOCKED_FOR_LIVE: No player-facing consent UI, cross-tab write guard, physical-phone QA, frozen rollback or owner approval has been implemented. Candidate is deliberately not loaded by a game page.');

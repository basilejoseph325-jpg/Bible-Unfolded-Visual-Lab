#!/usr/bin/env node
'use strict';
/* Isolated synthetic Word Trails recovery-checkpoint v3 tests.
   No browser localStorage, no LIVE writes and no real user's records. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const v1=fs.readFileSync('experiments/word-trails-live-consent-migration-candidate-v1.js','utf8');
const v2=fs.readFileSync('experiments/word-trails-exclusive-consent-boundary-v2.js','utf8');
const v3=fs.readFileSync('experiments/word-trails-recovery-checkpoint-candidate-v3.js','utf8');
const T='bu-visual-lab-wordtrails-next-v1';
const L='bible-unfolded-word-trails-next-v1';
const WALLET='bible-unfolded-rewards-v17';
const WHEELS='bible-unfolded-wheel-ownership-v3825-backup';
const VOICE='bible-unfolded-private-voice-pref-v381';
const source={level:2,unlocked:6,coins:9876,points:777,
 completed:[0,1,2],sparks:[0],claimedSparks:['0:PAUL'],boardBible:[],
 paidWords:[],paidBonuses:['1|ELI'],claimedFreeHints:[0],sound:true,
 progress:{level:2,found:['ELI'],bonuses:[],hinted:[],combo:2}};
const raw=JSON.stringify(source);
const native={
 [WALLET]:JSON.stringify({coins:841,points:-20,purchases:['seawheel'],equippedWheel:'seawheel'}),
 [WHEELS]:JSON.stringify({owned:['seawheel']}),
 [VOICE]:JSON.stringify({mode:'off',volume:30})
};
function locks(){
 let held=false;
 return {
  request:(name,options,cb)=>{
   assert.equal(name,'bible-unfolded-word-trails-progress-import-exclusive-v2');
   assert.equal(options.mode,'exclusive');assert.equal(options.ifAvailable,true);
   if(held)return Promise.resolve(cb(null));
   held=true;
   return Promise.resolve().then(()=>cb({name})).finally(()=>{held=false});
  }
 };
}
function fixture(opts={}){
 const data=new Map(Object.entries({...native,[T]:raw,...opts.initial}));
 const writes=[],reads=[];
 let wrote=false;
 const storage={
  getItem:key=>{
   reads.push(key);
   if(opts.failReadAfterWrite&&wrote&&key===L)throw Error('read-back inaccessible');
   return data.has(key)?data.get(key):null;
  },
  setItem:(key,value)=>{
   if(opts.failWrite&&key===L)throw Error('quota');
   data.set(key,String(value));writes.push('set:'+key);
   if(key===L)wrote=true;
  },
  removeItem:key=>{
   if(opts.failRemove&&key===L)throw Error('remove blocked');
   data.delete(key);writes.push('remove:'+key);
  }
 };
 const win={};
 const context=vm.createContext({window:win,localStorage:storage});
 vm.runInContext(v1,context,{timeout:2000});
 vm.runInContext(v2,context,{timeout:2000});
 vm.runInContext(v3,context,{timeout:2000});
 const service=win.BUWTRecoveryCheckpointCandidateV3.createForStorage(storage,opts.locks===false?null:locks());
 assert.equal(writes.length,0,'Source initialization must write NOTHING');
 assert.equal(reads.length,0,'No reads on load: strictly opt-in recovery candidate');
 return {storage,service,data,writes,reads};
}
function sameNative(f){
 for(const [key,value] of Object.entries(native))assert.equal(f.data.get(key),value,'Shared key modified: '+key);
 assert.equal(f.data.get(T),f.data.get(T),'TEST source must remain present');
 assert(f.writes.every(x=>x==='set:'+L||x==='remove:'+L),'Only crossword LIVE key may change');
}
(async()=>{
 let count=0;
 const f=fixture();
 const preview=f.service.preview();count++;
 assert.equal(preview.available,true);
 assert.equal(preview.completedCount,3);
 assert.equal(preview.unlockedLevels,7);
 assert.equal(preview.backupMustBeSavedBeforeApplying,true);
 assert.equal(f.writes.length,0,'Preview must never write');
 const c=preview.checkpoint,exported=f.service.exportCheckpoint(c);
 assert(exported&&exported.length<500000);
 const archived=JSON.parse(exported);
 assert.equal(archived.scope,'crossword-only');
 assert.equal(archived.format,'BibleUnfoldedWordTrailsRecoveryCheckpoint');
 assert.equal(archived.version,3);
 assert.equal(archived.sourceRaw,raw);
 assert.equal(archived.liveBefore,null);
 assert.equal(archived.nativeWalletExcluded,true);
 assert.equal(archived.currenciesExcluded,true);
 for(const key of [WALLET,WHEELS,VOICE])assert(!exported.includes(key),'Recovery artifact must never embed wallet/owned/voice');
 assert.equal(JSON.parse(archived.expectedLiveRaw).coins,60);
 assert.equal(JSON.parse(archived.expectedLiveRaw).points,0);
 assert.equal(f.writes.length,0,'Export must never write');count++;

 let resp=await f.service.apply({approved:true,checkpoint:c});
 assert.equal(resp.reason,'consent-and-backup-required','Must prove backup saved first');
 resp=await f.service.apply({approved:false,checkpoint:c,backupConfirmed:true});
 assert.equal(resp.reason,'consent-and-backup-required');
 assert.equal(f.writes.length,0);count++;

 resp=await f.service.apply({approved:true,checkpoint:archived,backupConfirmed:true});
 assert.equal(resp.ok,true);
 assert.equal(resp.backupWasConfirmed,true);
 assert.equal(f.data.get(L),archived.expectedLiveRaw);
 assert.deepEqual(f.writes,['set:'+L]);
 sameNative(f);
 const imported=JSON.parse(f.data.get(L));
 assert.deepEqual(imported.completed,[0,1,2]);
 assert.equal(imported.migration.temporaryCoinsExcluded,true);count++;

 resp=await f.service.apply({approved:true,checkpoint:c,backupConfirmed:true});
 assert.equal(resp.reason,'live-progress-exists');
 assert.equal(f.writes.length,1);count++;

 resp=await f.service.rollback({approved:false,checkpoint:archived});
 assert.equal(resp.reason,'explicit-rollback-consent-required');
 assert.equal(f.writes.length,1);count++;

 // A player may continue playing after import. Never erase the newer save!
 f.data.set(L,JSON.stringify({...imported,level:4,completed:[0,1,2,3,4]}));
 resp=await f.service.rollback({approved:true,checkpoint:archived});
 assert.equal(resp.reason,'live-progress-has-changed');
 assert.equal(f.writes.length,1);
 assert(JSON.parse(f.data.get(L)).completed.length===5);count++;

 // Restore exactly the unchanged import *in our fake fixture*, then rollback
 // only that specific imported crossword key, leaving native and TEST intact.
 f.data.set(L,archived.expectedLiveRaw);
 resp=await f.service.rollback({approved:true,checkpoint:archived});
 assert.equal(resp.ok,true);
 assert.equal(resp.removedOnlyImportedCrossword,true);
 assert.equal(f.data.has(L),false);
 assert.deepEqual(f.writes,['set:'+L,'remove:'+L]);
 sameNative(f);count++;

 resp=await f.service.rollback({approved:true,checkpoint:archived});
 assert.equal(resp.reason,'no-imported-live-progress');count++;

 // Corrupted checkpoint (even if syntactically valid) cannot delete an import.
 const corrupt=fixture({initial:{[L]:archived.expectedLiveRaw}});
 const bad={...archived,sourceRaw:JSON.stringify({...source,level:5})};
 assert.equal(corrupt.service.exportCheckpoint(bad),null);
 resp=await corrupt.service.rollback({approved:true,checkpoint:bad});
 assert.equal(resp.reason,'invalid-checkpoint');
 assert.equal(corrupt.data.get(L),archived.expectedLiveRaw);
 assert.equal(corrupt.writes.length,0);count++;

 const stored=fixture({initial:{[L]:archived.expectedLiveRaw,[T]:JSON.stringify({...source,coins:12000,level:5})}});
 resp=await stored.service.rollback({approved:true,checkpoint:exported});
 assert.equal(resp.ok,true,'Older exported checkpoint can safely rewind unchanged imported LIVE after TEST advances');
 assert.equal(stored.data.has(L),false);
 assert.equal(JSON.parse(stored.data.get(T)).coins,12000);
 sameNative(stored);count++;

 const blocked=fixture({locks:false});
 const b=blocked.service.preview();
 resp=await blocked.service.apply({approved:true,checkpoint:b.checkpoint,backupConfirmed:true});
 assert.equal(resp.reason,'exclusive-lock-unavailable');
 assert.equal(blocked.writes.length,0);
 const lockedExisting=fixture({initial:{[L]:archived.expectedLiveRaw},locks:false});
 resp=await lockedExisting.service.rollback({approved:true,checkpoint:archived});
 assert.equal(resp.reason,'exclusive-lock-unavailable');
 assert.equal(lockedExisting.data.get(L),archived.expectedLiveRaw);count++;

 const nosource=fixture({initial:{[T]:'invalid JSON'}});
 assert.equal(nosource.service.preview().available,false);
 assert.equal(nosource.writes.length,0);
 const hasLive=fixture({initial:{[L]:archived.expectedLiveRaw}});
 assert.equal(hasLive.service.preview().reason,'live-progress-exists');
 assert.equal(hasLive.writes.length,0);count++;

 const race=fixture();
 const raceP=race.service.preview();
 race.data.set(T,JSON.stringify({...source,level:8}));
 resp=await race.service.apply({approved:true,checkpoint:raceP.checkpoint,backupConfirmed:true});
 assert.equal(resp.reason,'test-progress-changed');
 assert.equal(race.writes.length,0);count++;

 const removeFail=fixture({initial:{[L]:archived.expectedLiveRaw},failRemove:true});
 resp=await removeFail.service.rollback({approved:true,checkpoint:archived});
 assert.equal(resp.reason,'rollback-needs-review');
 assert.equal(resp.requiresRecoveryReview,true);
 assert.equal(removeFail.data.get(L),archived.expectedLiveRaw);
 assert.equal(removeFail.writes.length,0);count++;

 const quota=fixture({failWrite:true});
 const qp=quota.service.preview();
 resp=await quota.service.apply({approved:true,checkpoint:qp.checkpoint,backupConfirmed:true});
 assert.equal(resp.reason,'save-failed');
 assert.equal(resp.requiresRecoveryReview,true);
 assert.equal(quota.data.has(L),false);
 assert.equal(quota.writes.length,0);count++;

 const uncertain=fixture({failReadAfterWrite:true});
 const up=uncertain.service.preview();
 resp=await uncertain.service.apply({approved:true,checkpoint:up.checkpoint,backupConfirmed:true});
 assert.equal(resp.requiresRecoveryReview,true,'Ambiguous save requires inspection');
 assert.equal(uncertain.data.has(L),true,'Do NOT delete written progress on ambiguous readback');
 assert.equal(uncertain.writes.length,1);count++;

 const huge=fixture();
 const hc=huge.service.preview().checkpoint;
 assert.equal(huge.service.exportCheckpoint({...hc,sourceRaw:'X'.repeat(230000)}),null);
 assert.equal(huge.service.exportCheckpoint('{garbage'),null);count++;

 console.log('PASS_WORD_TRAILS_RECOVERY_CHECKPOINT_V3 '+count+' synthetic scenarios: explicit opt-in+backup, export, exclusive lock, unchanged-only rollback, newer-progress protection, corrupt/stale/oversize input, quota/readback/remove failures, zero native wallet/entitlement/voice writes.');
 console.log('LIVE_RELEASE_BLOCKED: candidate is not loaded by game; must retire old noncooperative LIVE auto-migration, design actual user-facing checkpoint download/restore, physically test Samsung and iPhone Safari, get owner approval.');
})().catch(e=>{console.error('FAIL_WORD_TRAILS_RECOVERY_CHECKPOINT_V3',e.stack||e);process.exitCode=1});

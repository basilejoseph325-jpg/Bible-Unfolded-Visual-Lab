#!/usr/bin/env node
'use strict';
/* Synthetic storage + cooperative Web Locks regression. NO actual users,
 * no REAL TEST/LIVE browser keys, and no LIVE repo modification. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const v1=fs.readFileSync('experiments/word-trails-live-consent-migration-candidate-v1.js','utf8');
const v2=fs.readFileSync('experiments/word-trails-exclusive-consent-boundary-v2.js','utf8');
const T='bu-visual-lab-wordtrails-next-v1',L='bible-unfolded-word-trails-next-v1';
const WALLET='bible-unfolded-rewards-v17',WHEEL='bible-unfolded-wheel-ownership-v3825-backup',VOICE='bible-unfolded-private-voice-pref-v381';
const sample={level:2,unlocked:5,coins:8008,points:345,completed:[0,1,2],
 sparks:[0],claimedSparks:['0:CAIN'],boardBible:[],paidWords:[],
 paidBonuses:['0|ART'],claimedFreeHints:[0],sound:true,
 progress:{level:2,found:['ELI'],bonuses:['LIE'],hinted:[],combo:2}};
const src=JSON.stringify(sample);
const protectedValues={
 [WALLET]:JSON.stringify({coins:456,points:-25,purchases:['seawheel'],equippedWheel:'seawheel'}),
 [WHEEL]:JSON.stringify({owned:['seawheel']}),
 [VOICE]:JSON.stringify({mode:'off'})
};
function fixture(options={}){
 const data=new Map(Object.entries({...protectedValues,[T]:src,...options.initial}));
 const writes=[];
 let failReadAfterWrite=false;
 const store={
  getItem:k=>{
   if(options.unreadableAfterWrite&&failReadAfterWrite&&k===L)throw Error('readback failed');
   return data.has(k)?data.get(k):null;
  },
  setItem:(k,value)=>{
   if(options.failWrites)throw Error('quota exceeded');
   writes.push(k);data.set(k,String(value));
   if(options.unreadableAfterWrite&&k===L)failReadAfterWrite=true;
  },
  removeItem:k=>{writes.push('REMOVE:'+k);data.delete(k)}
 };
 const window={};
 const ctx=vm.createContext({window,localStorage:store});
 vm.runInContext(v1,ctx,{timeout:2000});
 vm.runInContext(v2,ctx,{timeout:2000});
 const base=window.BUWTExclusiveConsentBoundaryV2;
 assert.equal(base.version,'2.0.0-test-only-unwired');
 assert.equal(writes.length,0,'Loading never imports anything');
 return {data,store,writes,base};
}
function lockServer({heldUntil}={}){
 let busy=false;
 let unlock=()=>{};
 let gate=heldUntil?new Promise(r=>{unlock=r}):null;
 const calls=[];
 return {
  calls, release:()=>unlock(),
  request(name,options,callback){
   assert.equal(name,'bible-unfolded-word-trails-progress-import-exclusive-v2');
   assert.equal(options.mode,'exclusive');assert.equal(options.ifAvailable,true);
   calls.push('request');
   if(busy)return Promise.resolve(callback(null));
   busy=true;
   return (async()=>{
    try{
     if(gate)await gate;
     return await callback({name});
    }finally{busy=false}
   })();
  }
 };
}
const untouched=f=>{
 for(const [key,val] of Object.entries(protectedValues))assert.equal(f.data.get(key),val,'Shared value changed: '+key);
 assert(!f.writes.some(k=>[WALLET,WHEEL,VOICE].includes(k)),'Shared key written');
};
(async()=>{
 const noLock=fixture();
 const missing=noLock.base.createForStorage(noLock.store,null);
 let p=missing.preview();
 assert.equal(p.available,true);
 assert.equal((await missing.acceptWithExclusiveLock({approved:true,sourceRaw:p.sourceRaw})).reason,'exclusive-lock-unavailable');
 assert.deepEqual(noLock.writes,[],'Missing lock must fail closed');

 const withoutConsent=fixture(),locks=lockServer();
 const deny=withoutConsent.base.createForStorage(withoutConsent.store,locks);
 assert.equal((await deny.acceptWithExclusiveLock({approved:false,sourceRaw:src})).reason,'consent-required');
 assert.equal(locks.calls.length,0,'Declined import must not request lock');
 assert.deepEqual(withoutConsent.writes,[]);

 const multi=fixture(),server=lockServer({heldUntil:true});
 const first=multi.base.createForStorage(multi.store,server);
 const second=multi.base.createForStorage(multi.store,server);
 p=first.preview();assert.equal(p.completedCount,3);
 const one=first.acceptWithExclusiveLock({approved:true,sourceRaw:p.sourceRaw});
 const two=await second.acceptWithExclusiveLock({approved:true,sourceRaw:p.sourceRaw});
 assert.equal(two.reason,'another-transfer-in-progress','Second same-origin tab must fail while locked');
 assert.deepEqual(multi.writes,[],'No premature write before acquiring lock');
 server.release();
 const success=await one;
 assert.equal(success.ok,true);assert.equal(success.via,'exclusive-browser-lock-v2');
 assert.deepEqual(multi.writes,[L],'Only the LIVE crossword save may be created once');
 assert.equal(JSON.parse(multi.data.get(L)).coins,60,'Test coins must be quarantined');
 assert.equal(JSON.parse(multi.data.get(L)).points,0,'Test points must be quarantined');
 assert.equal(JSON.parse(multi.data.get(L)).completed.length,3,'Progress preserved');
 assert.equal(multi.data.get(T),src,'TEST source retained intact');
 assert.equal((await second.acceptWithExclusiveLock({approved:true,sourceRaw:p.sourceRaw})).reason,'live-progress-exists','Idempotent on repeat');
 assert.deepEqual(multi.writes,[L]);
 untouched(multi);

 const changed=fixture(),changedLocks=lockServer({heldUntil:true});
 const candidate=changed.base.createForStorage(changed.store,changedLocks);
 p=candidate.preview();
 const pending=candidate.acceptWithExclusiveLock({approved:true,sourceRaw:p.sourceRaw});
 changed.data.set(T,JSON.stringify({...sample,level:4}));
 changedLocks.release();
 assert.equal((await pending).reason,'test-progress-changed');
 assert.deepEqual(changed.writes,[]);
 untouched(changed);

 const already=fixture(),existingLocks=lockServer({heldUntil:true});
 const attempt=already.base.createForStorage(already.store,existingLocks);
 p=attempt.preview();
 const underway=attempt.acceptWithExclusiveLock({approved:true,sourceRaw:p.sourceRaw});
 already.data.set(L,JSON.stringify({level:11,unlocked:11,coins:60,completed:[0]}));
 existingLocks.release();
 assert.equal((await underway).reason,'live-progress-exists');
 assert.deepEqual(already.writes,[]);
 assert.equal(JSON.parse(already.data.get(L)).level,11,'Uncooperative existing game record preserved');

 const corrupt=fixture({initial:{[T]:'{oops'}});
 const invalid=corrupt.base.createForStorage(corrupt.store,lockServer());
 assert.equal(invalid.preview().reason,'invalid-test-progress');
 assert.equal((await invalid.acceptWithExclusiveLock({approved:true,sourceRaw:'{oops'})).reason,'invalid-test-progress');
 assert.deepEqual(corrupt.writes,[]);

 const unavailable=fixture({failWrites:true});
 const writeFail=unavailable.base.createForStorage(unavailable.store,lockServer());
 p=writeFail.preview();
 const f=await writeFail.acceptWithExclusiveLock({approved:true,sourceRaw:p.sourceRaw});
 assert.equal(f.reason,'save-failed');
 assert.equal(f.requiresRecoveryReview,true,'Uncertain storage state must not be silently erased');
 assert.equal(unavailable.data.has(L),false);
 untouched(unavailable);

 const uncertain=fixture({unreadableAfterWrite:true});
 const uncertainApi=uncertain.base.createForStorage(uncertain.store,lockServer());
 p=uncertainApi.preview();
 const uncertainResult=await uncertainApi.acceptWithExclusiveLock({approved:true,sourceRaw:p.sourceRaw});
 assert.equal(uncertainResult.reason,'save-failed');
 assert.equal(uncertainResult.requiresRecoveryReview,true);
 assert.equal(uncertain.data.has(L),true,'Never auto-delete a successful write when verification fails');
 untouched(uncertain);

 const deniedLock=fixture();
 const deniedApi=deniedLock.base.createForStorage(deniedLock.store,{request:(name,options,cb)=>cb(null)});
 p=deniedApi.preview();
 assert.equal((await deniedApi.acceptWithExclusiveLock({approved:true,sourceRaw:p.sourceRaw})).reason,'another-transfer-in-progress');
 assert.deepEqual(deniedLock.writes,[]);

 const brokenLock=fixture();
 const brokenApi=brokenLock.base.createForStorage(brokenLock.store,{request:()=>{throw Error('locks unsupported')}});
 p=brokenApi.preview();
 assert.equal((await brokenApi.acceptWithExclusiveLock({approved:true,sourceRaw:p.sourceRaw})).reason,'exclusive-lock-failed');
 assert.deepEqual(brokenLock.writes,[]);

 console.log('PASS_WORD_TRAILS_EXCLUSIVE_CONSENT_V2: 10 scenarios; two simultaneous tabs -> exactly one commit; missing/held/failed locks refuse; stale TEST and existing LIVE saves protected; no shared rewards/owned wheels/voice writes; unverified writes flagged for recovery review.');
 console.log('RELEASE_BLOCKED: Legacy LIVE automatic migration is not lock-aware; no production UI/rollback checkpoint or device QA. This candidate is NOT loaded by any game.');
})().catch(e=>{console.error('FAIL_WORD_TRAILS_EXCLUSIVE_CONSENT_V2',e.stack||e);process.exitCode=1});

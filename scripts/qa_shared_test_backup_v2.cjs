#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),{webcrypto}=require('node:crypto');
const window={};new Function('window','crypto','TextEncoder',fs.readFileSync('experiments/bu-test-shared-backup-v2.js','utf8'))(window,webcrypto,TextEncoder);
const api=window.BUSharedTestBackup,{wallet:W,recovery:R,trails:T,journal:J,checkpoint:C,marker:M}=api.keys,P='bu-visual-lab-shared-standard-v1:';
const old={coins:533,points:-25,earned:['story-old'],spent:[],purchases:['goldwheel'],hints:{},wtPreviewMigration:1,wtReceipts:{'trails:l1:complete':{delta:0,kind:'legacy'}}};
const saved={level:0,unlocked:1,completed:[0],coins:111,points:20,claimedFreeHints:[0],claimedSparks:[],boardBible:[],paidWords:[],paidBonuses:[],progress:null};
const original={ [W]:'LIVE CANARY', ['bu-visual-lab-shared-preview-20261116:'+W]:'PRIVATE PREVIEW',other:'other app'};
function fixture(initial={},failAt=Infinity,persistentFailure=false){const map=new Map(Object.entries({...original,[P+M]:'1',[P+W]:JSON.stringify(old),[P+R]:JSON.stringify(old),[P+T]:JSON.stringify(saved),[P+'bible-unfolded-wheel-ownership-v3825']:'{"version":1,"owned":["goldwheel"]}',[P+'bible-unfolded-wheel-ownership-v3825-backup']:'{"version":1,"owned":["goldwheel"]}',...initial}));let writes=0,paused=false,fail=true,recovery=false;
 const io={list:()=>[...map.keys()].filter(k=>k.startsWith(P)).map(k=>k.slice(P.length)),get:k=>map.get(P+k)??null,set(k,v){writes++;if(fail&&(writes===failAt||(persistentFailure&&writes>=failAt)))throw Error('quota');map.set(P+k,v)},remove(k){writes++;if(fail&&(writes===failAt||(persistentFailure&&writes>=failAt)))throw Error('quota');map.delete(P+k)},writable:()=>!paused,recoveryAllowed:()=>recovery,ownsLock:()=>true,pause:()=>{paused=true}};
 return {map,io,service:api.create(io),reset:()=>{fail=false;paused=false},allowRecovery:()=>{paused=true;recovery=true},writes:()=>writes,game:()=>Object.fromEntries([...map].filter(([k])=>k.startsWith(P)&&!k.startsWith(P+'__')))};
}
const copy=x=>JSON.parse(JSON.stringify(x));
(async()=>{
 const source=fixture(),before=source.game(),backup=await source.service.exportSnapshot();await api.validate(backup);assert.equal(backup.keys[R],backup.keys[W]);assert.equal(backup.keys[T],JSON.stringify(saved));assert(!Object.keys(backup.keys).some(k=>k.startsWith('__')));
 // A genuine other complete point in time, not a wallet-only edit.
 const targetWallet={...old,coins:42,points:-40,purchases:['seawheel'],earned:['story-new'],wtReceipts:{'trails:l1:complete':{delta:4,kind:'credit'},'trails:l1:hint:0:0':{delta:-15,kind:'spend'}},buNativeBoostState:{version:1,tokens:42,sourceCoins:42,inventory:{fifty:2,shield:1,letter:1},stars:5,earnedSet:['story-new'],granted:1}};
 const targetState={...saved,level:1,unlocked:1,progress:{level:1,found:[],bonuses:[],hinted:[],combo:0}};
 const target=fixture({[P+W]:JSON.stringify(targetWallet),[P+R]:JSON.stringify(targetWallet),[P+T]:JSON.stringify(targetState),[P+'bible-unfolded-wheel-ownership-v3825']:'{"version":1,"owned":["seawheel"]}',[P+'bible-unfolded-wheel-ownership-v3825-backup']:'{"version":1,"owned":["seawheel"]}',[P+'buGuideLast:0']:'17'});
 const desired=await target.service.exportSnapshot(),preview=await source.service.inspect(desired);assert.equal(preview.current.tokens,533);assert.equal(preview.backup.tokens,42);
 const result=await source.service.restore(desired,preview.currentHash);assert(result.ok);assert.equal(source.io.get(W),desired.keys[W]);assert.equal(source.io.get(T),desired.keys[T]);assert.equal(source.io.get(J),null);assert.equal(source.io.get(M),'1');assert.equal(JSON.parse(source.io.get(C)).keys[W],JSON.stringify(old));for(const [k,v] of Object.entries(original))assert.equal(source.map.get(k),v);
 // Every nonmatching/one-sided/corrupt file must reject before the first write.
 for(const mutate of [d=>d.version=1,d=>d.format='BibleUnfoldedSharedCoinPreview',d=>delete d.keys[T],d=>delete d.keys['bible-unfolded-wheel-ownership-v3825'],d=>d.keys['bible-unfolded-wheel-ownership-v3825-backup']='{"version":1,"owned":["goldwheel"]}',d=>d.keys[W]='{}',d=>d.keys[R]='different',d=>d.keys[T]='{bad',d=>d.keys[W]=JSON.stringify({...old,coins:-1}),d=>d.keys[T]=JSON.stringify({...saved,unlocked:55}),d=>d.keys['__shared_restore_journal_v2__']='bad',d=>d.keys[W]=JSON.stringify({...old,wtReceipts:{'trails:l1:complete':{delta:4000,kind:'credit'}}}),d=>d.keys[W]+=' ']){
  const d=copy(desired);mutate(d);const f=fixture(),raw=Object.fromEntries(f.map);await assert.rejects(()=>f.service.inspect(d));assert.deepEqual(Object.fromEntries(f.map),raw);
 }
 // A checksum is required even for otherwise valid content. A malformed ledger
 // with a freshly recomputed checksum must still fail semantic validation.
 const tooLarge=fixture({[P+'bu-qa-large']:'é'.repeat(1600000)});await assert.rejects(()=>tooLarge.service.exportSnapshot(),/size/);
 const wrong=copy(desired);wrong.keys[T]=JSON.stringify({...saved,level:49,unlocked:0});delete wrong.checksum;wrong.checksum=await api.hash(wrong);await assert.rejects(()=>api.validate(wrong));
 // Approved engine now includes Levels 1–55. Even newly checksummed future-level
 // records beyond that boundary must reject before any write.
 for(const kind of ['progress','receipt']){
  const future=copy(desired);delete future.checksum;
  if(kind==='progress')future.keys[T]=JSON.stringify({...targetState,level:55,unlocked:59,progress:null});
  else{const w=JSON.parse(future.keys[W]);w.wtReceipts['trails:l56:complete']={delta:4,kind:'credit'};future.keys[W]=JSON.stringify(w);future.keys[R]=future.keys[W];}
  future.checksum=await api.hash(future);const f=fixture(),before=Object.fromEntries(f.map);await assert.rejects(()=>f.service.inspect(future),/Invalid Trail (level|receipt)/);assert.deepEqual(Object.fromEntries(f.map),before);
 }
 // Both actual previous range (1–50) and the approved extension are restorable.
 for(const last of [49,54]){
  const compatible=copy(desired);delete compatible.checksum;
  const w=JSON.parse(compatible.keys[W]);w.wtReceipts['trails:l'+(last+1)+':complete']={delta:4,kind:'credit'};w.wtReceipts['trails:l'+(last+1)+':seal']={delta:3,kind:'credit'};
  compatible.keys[W]=JSON.stringify(w);compatible.keys[R]=compatible.keys[W];compatible.keys[T]=JSON.stringify({...saved,level:last,unlocked:last,completed:Array.from({length:last+1},(_,i)=>i),progress:null,claimedFreeHints:[last],claimedSparks:[last+':CUD'],boardBible:[last+':CURED'],paidWords:[last+'|CURED','combo:'+last],paidBonuses:[last+'|SUE','satchel:'+last],sparks:[last]});
  compatible.checksum=await api.hash(compatible);const f=fixture(),review=await f.service.inspect(compatible);assert((await f.service.restore(compatible,review.currentHash)).ok);assert.equal(f.io.get(T),compatible.keys[T]);assert.equal(f.io.get(W),compatible.keys[W]);
 }
 for(const field of ['completed','claimedFreeHints','sparks','claimedSparks','boardBible','paidWords','paidBonuses']){
  const bad=copy(desired);delete bad.checksum;const t=JSON.parse(bad.keys[T]);t[field]=['completed','claimedFreeHints','sparks'].includes(field)?[55]:[field==='paidWords'?'combo:55':field==='paidBonuses'?'satchel:55':'55:CUD'];bad.keys[T]=JSON.stringify(t);bad.checksum=await api.hash(bad);await assert.rejects(()=>api.validate(bad),/Invalid/);
 }
 const stale=fixture(),stalePreview=await stale.service.inspect(desired);stale.io.set('buGuideLast:0','22');const staleBefore=stale.game();const staleResult=await stale.service.restore(desired,stalePreview.currentHash);assert(!staleResult.ok);assert.deepEqual(stale.game(),staleBefore,'Stale review cannot roll back newer progress');
 const concurrent=fixture(),concurrentPreview=await concurrent.service.inspect(desired);const first=concurrent.service.restore(desired,concurrentPreview.currentHash);await assert.rejects(()=>concurrent.service.restore(desired,concurrentPreview.currentHash),/already running/);assert((await first).ok);assert.equal(JSON.parse(concurrent.io.get(W)).coins,42);
 // Inject storage failure at every transaction operation, including cleanup.
 const success=fixture(),successPreview=await success.service.inspect(desired);await success.service.restore(desired,successPreview.currentHash);const count=success.writes();
 for(let n=1;n<=count;n++){
  const f=fixture({},n),raw=f.game(),p=await f.service.inspect(desired),r=await f.service.restore(desired,p.currentHash);assert(!r.ok,'Failure point '+n);f.reset();if(f.service.hasPending())await f.service.recoverPending();assert.deepEqual(f.game(),raw,'Failed transaction must restore the whole before-state '+n);for(const [k,v] of Object.entries(original))assert.equal(f.map.get(k),v);
 }
 // Simulated browser death/storage outage: all subsequent writes fail. Reopen
 // from every persisted interruption point with a fresh coordinator.
 for(let n=1;n<=count;n++){
  const f=fixture({},n,true),raw=f.game(),p=await f.service.inspect(desired);await f.service.restore(desired,p.currentHash);f.reset();const reopen=api.create(f.io);if(reopen.hasPending())await reopen.recoverPending();const actual=f.game();assert([JSON.stringify(raw),JSON.stringify(target.game())].includes(JSON.stringify(actual)),'Recovery exposed a mixed checkpoint at '+n);assert.equal(f.io.get(M),'1');assert.equal(f.io.get(J),null);
 }
 // The pre-journal crash window blocks old code, and new code safely resumes.
 const interrupted=fixture({},5,true),interruptedPreview=await interrupted.service.inspect(desired);await interrupted.service.restore(desired,interruptedPreview.currentHash);interrupted.reset();assert(interrupted.service.hasPending());interrupted.io.remove(J);await interrupted.service.recoverPending();assert.equal(interrupted.io.get(M),'1');assert.deepEqual(interrupted.game(),fixture().game());
 const damaged=fixture({[P+J]:'{damaged',[P+M]:'restore-pending-v2'}),damagedBefore=damaged.game();await assert.rejects(()=>damaged.service.recoverPending());assert.deepEqual(damaged.game(),damagedBefore);assert.equal(damaged.io.get(M),'restore-pending-v2');
 const unreadable=fixture({[P+W]:'{bad',[P+J]:'{bad',[P+M]:'restore-pending-v2:bad'});unreadable.allowRecovery();const recoveryPreview=await unreadable.service.inspect(desired);assert.equal(recoveryPreview.current,null);assert((await unreadable.service.restore(desired,recoveryPreview.currentHash)).ok);assert.equal(unreadable.io.get(W),desired.keys[W]);
 console.log('PASS_SHARED_BACKUP_V2',JSON.stringify({validSnapshot:true,fullRestore:true,pointsNegative:true,purchasesInventoryReceipts:true,unscopedAndPreviewsUnchanged:true,invalidFiles:23,prior50AndNew55Restored:true,checksummedFutureLevelsRejected:true,stalePreview:true,writeFailurePoints:count,crashRecoveryPoints:count,corruptJournalFailClosed:true}));
})().catch(e=>{console.error(e);process.exitCode=1});

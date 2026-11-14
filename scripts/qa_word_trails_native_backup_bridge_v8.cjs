#!/usr/bin/env node
'use strict';
/* TEST-only actual v2 native validator + v7 journaled writer + v8 bridge,
 * running against synthetic in-memory progress. No LIVE repository writes,
 * real browser state, player storage, purchases or passwords are accessed.
 */
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const read=p=>fs.readFileSync(p,'utf8');
const v2=read('bu-platform-saves-v2.js');
const v7=read('experiments/word-trails-native-full-backup-transaction-v7.js');
const v8=read('experiments/word-trails-native-backup-bridge-candidate-v8.js');
const T='bu-visual-lab-wordtrails-next-v1';
const L='bible-unfolded-word-trails-next-v1';
const W='bible-unfolded-rewards-v17';
const O='bible-unfolded-wheel-ownership-v3825';
const VOICE='bible-unfolded-private-voice-pref-v381';
const LEGACY='bu-visual-lab-import-rollback-v2';
const JOURNAL='bu-visual-lab-import-transaction-v7';
const COMMIT='bu-visual-lab-import-transaction-commit-v7';
const str=JSON.stringify;
const testProgress={
 level:2,unlocked:4,coins:1300,points:170,completed:[0,1,2],
 sparks:[0],claimedSparks:['0:ABEL'],boardBible:[],paidWords:[],
 paidBonuses:['0|ART'],claimedFreeHints:[0],sound:true,
 progress:{level:2,found:['ELI'],bonuses:[],hinted:[],combo:1}
};
const original={
 [W]:str({coins:750,points:65,purchases:['seawheel'],equippedWheel:'seawheel'}),
 [O]:str({version:1,owned:['seawheel']}),
 [VOICE]:str({mode:'off',volume:41}),
 [T]:str(testProgress),
 [L]:str({level:9,unlocked:10,coins:51,completed:[0,1,2,3]}),
 'story-trails-synthetic-chapter':str({chapter:3,completed:[0,1,2]})
};
const allowedLock={request:async(_name,opts,fn)=>{
 assert.equal(opts.mode,'exclusive');assert.equal(opts.ifAvailable,true);
 return fn({mode:'exclusive'});
}};
const heldLock={request:async(_name,_opts,fn)=>fn(null)};
function fixture({seed={},locks=allowedLock,failSetKey=null}={}){
 const map=new Map(Object.entries({...original,...seed})),writes=[];
 let failed=false;
 const storage={
  get length(){return map.size},
  key:i=>Array.from(map.keys())[i]??null,
  getItem:k=>map.has(k)?map.get(k):null,
  setItem:(k,val)=>{
   if(k===failSetKey&&!failed){failed=true;throw Error('synthetic-storage-closed')}
   map.set(k,String(val));writes.push('set:'+k);
  },
  removeItem:k=>{map.delete(k);writes.push('remove:'+k)}
 };
 const window={};
 const document={readyState:'loading',addEventListener:()=>{},getElementById:()=>null};
 const ctx=vm.createContext({window,document,localStorage:storage,
  location:{reload:()=>{throw Error('Unexpected real reload')}},
  setTimeout:()=>0,console});
 vm.runInContext(v2,ctx,{filename:'actual-v2-coordinator.js',timeout:5000});
 vm.runInContext(v7,ctx,{filename:'experimental-v7-transaction.js',timeout:5000});
 vm.runInContext(v8,ctx,{filename:'unlinked-v8-bridge.js',timeout:5000});
 const coordinator=window.BUPlatformSaves;
 const tx=window.BUWTNativeFullBackupTransactionV7.createForStorage(
  storage,locks,()=> '12345678-abcd-4abc-a123-123456789012');
 const bridge=window.BUWTNativeBackupRestoreBridgeCandidateV8
  .createForServices({coordinator,transaction:tx});
 assert.equal(writes.length,0,'Script evaluation must perform ZERO save writes');
 return {map,writes,storage,coordinator,tx,bridge,window};
}
function backups(f){
 const current=f.coordinator.makeBackup();
 const candidate=JSON.parse(JSON.stringify(current));
 candidate.keys[W]=str({coins:245,points:22,purchases:['goldwheel'],equippedWheel:'goldwheel'});
 candidate.keys[O]=str({version:1,owned:['goldwheel']});
 candidate.extensions.wordTrailsNext.state=str({...testProgress,coins:3200,points:999});
 return {current,candidate};
}
let cases=0;
const pass=name=>{cases++;console.log('PASS_NATIVE_V8_'+cases+' '+name)};
(async()=>{
 // Loading and constructing services does not touch progress.
 {
  const f=fixture();
  assert.equal(f.bridge.version,'8.0.0-unlinked-test-only');
  assert.equal(f.window.BUWTNativeBackupRestoreBridgeCandidateV8.noAutomaticImport,true);
  assert.equal(f.writes.length,0);pass('unlinked and storage-inert on evaluation');
 }
 // The current backup MUST be verified before any change preview is honored.
 {
  const f=fixture(),{current,candidate}=backups(f);
  const review=f.bridge.stage({currentBackup:current,candidateBackup:candidate});
  assert.equal(review.ok,true);
  assert(review.changedKeys>=2);
  assert(review.ownedWheelsKept.includes('seawheel'));
  assert(review.ownedWheelsKept.includes('goldwheel'));
  assert.equal(review.liveCrosswordExcluded,true);
  assert.equal(review.testCoinsStaySeparate,true);
  assert.equal(review.productionReady,false);
  assert.equal(f.writes.length,0);
  pass('actual v2 source validated, exact wallet/wheel/TEST change plan readonly');
 }
 // Consent and saved-backup acknowledgments are independent; no implicit apply.
 {
  const f=fixture(),{current,candidate}=backups(f);
  const review=f.bridge.stage({currentBackup:current,candidateBackup:candidate});
  assert.equal((await f.bridge.apply({token:review.token,approved:true})).reason,'consent-and-backup-required');
  assert.equal((await f.bridge.apply({token:review.token,backupConfirmed:true})).reason,'consent-and-backup-required');
  assert.equal(f.writes.length,0);
  pass('two separate approvals necessary; no writes or token consumption on refusal');
 }
 // Successful synthetic full backup has v2 wheel-union semantics and v7 lock.
 {
  const f=fixture(),{current,candidate}=backups(f);
  const review=f.bridge.stage({currentBackup:current,candidateBackup:candidate});
  const approved=await f.bridge.apply({token:review.token,approved:true,backupConfirmed:true});
  assert.equal(approved.ok,true);
  assert.equal(approved.committed,true);
  assert.equal(JSON.parse(f.map.get(W)).coins,245,'native wallet comes from chosen full backup');
  assert.equal(JSON.parse(f.map.get(T)).coins,3200,'TEST coins remain TEST coins');
  assert.deepEqual(new Set(JSON.parse(f.map.get(O)).owned),new Set(['seawheel','goldwheel']));
  assert.equal(f.map.get(L),original[L],'existing LIVE crossword progress remains byte-identical');
  assert.equal(f.map.get(VOICE),original[VOICE],'voice record unchanged');
  assert(!f.map.has(JOURNAL)&&!f.map.has(COMMIT),'journal and marker cleaned');
  assert(!f.writes.some(x=>x==='set:'+L),'NO LIVE progress writes');
  assert.equal((await f.bridge.apply({token:review.token,approved:true,backupConfirmed:true})).reason,
   'no-valid-reviewed-backup-plan','one-use token cannot replay a restore');
  pass('journaled locked synthetic restore, purchased wheel union, quarantined currencies and replay block');
 }
 // No LIVE crossword content may enter a TEST complete-backup candidate.
 {
  const f=fixture(),{current,candidate}=backups(f);
  candidate.keys[L]=str({level:0,coins:0});
  assert.equal(f.bridge.stage({currentBackup:current,candidateBackup:candidate}).ok,false);
  assert.equal(f.writes.length,0);assert.equal(f.map.get(L),original[L]);
  pass('mixed TEST/LIVE progress backup rejected');
 }
 // A changed real current wallet invalidates the verified file after preview.
 {
  const f=fixture(),{current,candidate}=backups(f);
  const review=f.bridge.stage({currentBackup:current,candidateBackup:candidate});
  const newer=str({coins:799,points:82,purchases:['seawheel'],equippedWheel:'seawheel'});
  f.map.set(W,newer);
  const result=await f.bridge.apply({token:review.token,approved:true,backupConfirmed:true});
  assert.equal(result.reason,'current-save-changed-after-preview');
  assert.equal(f.map.get(W),newer);assert.equal(f.writes.length,0);
  pass('stale current wallet file denied before journal');
 }
 // A changed partial board / source save also invalidates verified snapshot.
 {
  const f=fixture(),{current,candidate}=backups(f);
  const review=f.bridge.stage({currentBackup:current,candidateBackup:candidate});
  const p={...testProgress,progress:{...testProgress.progress,found:['ELI','LIE']}};
  f.map.set(T,str(p));
  const result=await f.bridge.apply({token:review.token,approved:true,backupConfirmed:true});
  assert.equal(result.reason,'current-save-changed-after-preview');
  assert.equal(f.writes.length,0);
  pass('newly completed partial puzzle cannot be overwritten by stale plan');
 }
 // Rechecked file must still match; an old downloaded full backup isn't enough.
 {
  const f=fixture(),{current,candidate}=backups(f);
  current.keys[W]=str({coins:1,points:0});
  assert.equal(f.bridge.stage({currentBackup:current,candidateBackup:candidate}).reason,
   'current-complete-backup-mismatch');
  assert.equal(f.writes.length,0);
  pass('outdated claimed saved-current backup rejected');
 }
 // Legacy incomplete journals are a hard stop to prevent loss of newer writes.
 {
  const f=fixture({seed:{[LEGACY]:str({version:1,previous:{[W]:original[W]}})}}),
   {current,candidate}=backups(f);
  assert.equal(f.bridge.stage({currentBackup:current,candidateBackup:candidate}).ok,false);
  assert.equal(f.writes.length,0);assert.equal(f.map.get(W),original[W]);
  pass('pending older v2 restore journal quarantines new restore');
 }
 // No Web Locks => still previews but cannot apply.
 {
  const f=fixture({locks:null}),{current,candidate}=backups(f);
  const review=f.bridge.stage({currentBackup:current,candidateBackup:candidate});
  assert.equal(review.ok,true);
  const result=await f.bridge.apply({token:review.token,approved:true,backupConfirmed:true});
  assert.equal(result.reason,'exclusive-lock-unavailable');
  assert.equal(f.writes.length,0);assert.equal(f.map.get(L),original[L]);
  pass('missing browser Web Locks fail closed');
 }
 // Competing lock prevents transactional entry; nothing is changed.
 {
  const f=fixture({locks:heldLock}),{current,candidate}=backups(f);
  const review=f.bridge.stage({currentBackup:current,candidateBackup:candidate});
  const result=await f.bridge.apply({token:review.token,approved:true,backupConfirmed:true});
  assert.equal(result.reason,'another-restore-in-progress');
  assert.equal(f.writes.length,0);
  pass('occupied exclusive lock refuses without writes');
 }
 // Interrupted write requires deliberate recovery, not auto rollback.
 {
  const f=fixture({failSetKey:T}),{current,candidate}=backups(f);
  const review=f.bridge.stage({currentBackup:current,candidateBackup:candidate});
  const result=await f.bridge.apply({token:review.token,approved:true,backupConfirmed:true});
  assert.equal(result.reason,'partial-import-needs-review');
  assert.equal(result.needsManualReview,true);
  assert.equal(f.map.has(JOURNAL),true,'journal retained for explicit recovery');
  assert.equal(f.map.get(L),original[L]);
  assert.equal(f.map.get(VOICE),original[VOICE]);
  pass('injected second-save failure remains reviewable without destructive auto rollback');
 }
 // Wrong or consumed review token cannot unlock any write.
 {
  const f=fixture(),{current,candidate}=backups(f);
  const review=f.bridge.stage({currentBackup:current,candidateBackup:candidate});
  const result=await f.bridge.apply({token:{id:review.token.id},approved:true,backupConfirmed:true});
  assert.equal(result.reason,'no-valid-reviewed-backup-plan');
  assert.equal(f.writes.length,0);
  pass('forged review token rejected');
 }
 // Invalid wallet values must go through the actual strict v2 validator.
 {
  const f=fixture(),{current,candidate}=backups(f);
  candidate.keys[W]=str({coins:-4,points:25});
  assert.equal(f.bridge.stage({currentBackup:current,candidateBackup:candidate}).ok,false);
  assert.equal(f.writes.length,0);
  pass('invalid native wallet import blocked by actual v2 rules');
 }
 // Nothing-to-change must not fabricate a pending transfer.
 {
  const f=fixture(),current=f.coordinator.makeBackup();
  assert.equal(f.bridge.stage({currentBackup:current,candidateBackup:current}).reason,'already-current');
  assert.equal(f.writes.length,0);
  pass('identical backup needs no transaction');
 }
 console.log('PASS_TEST_ONLY_NATIVE_V8_V2_TO_V7_BRIDGE '+cases+
  ' cases. Zero real-user storage, LIVE edits, automatic import or TEST coin->Insight Token conversion.');
 console.log('NOT_RELEASE_READY: UI still readonly, older LIVE autoimport and uncooperative tabs unresolved; human device/content/rights tests and explicit owner authorization pending.');
})().catch(err=>{console.error(err);process.exitCode=1});

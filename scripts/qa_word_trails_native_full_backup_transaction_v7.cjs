#!/usr/bin/env node
'use strict';
/* v7 complete-game backup transaction: controlled fake storage and Web Locks.
 * SAFE: does not access an end user's game or LIVE repo.
 * The candidate must remain unlinked from any actual game page. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('experiments/word-trails-native-full-backup-transaction-v7.js','utf8');
const W='bible-unfolded-rewards-v17';
const PROGRESS='bu-visual-lab-wordtrails-next-v1';
const VOICE='bible-unfolded-private-voice-pref-v381';
const WHEELS='bible-unfolded-wheel-ownership-v3825';
const TEST_AUDIO='bu-wt-next-feel-v2';
const LIVE='bible-unfolded-word-trails-next-v1';
const LEGACY='bu-visual-lab-import-rollback-v2';
const J='bu-visual-lab-import-transaction-v7';
const C='bu-visual-lab-import-transaction-commit-v7';
const s=JSON.stringify;
const WALLET0=s({coins:500,points:20,purchases:['seawheel'],equippedWheel:'seawheel'});
const WALLET1=s({coins:100,points:10,purchases:['seawheel'],equippedWheel:'seawheel'});
const WALLET_NEW=s({coins:560,points:25,purchases:['seawheel'],equippedWheel:'seawheel'});
const P0=s({level:1,completed:[0],coins:10});
const P1=s({level:3,completed:[0,1,2],coins:30});
const base={
 [W]:WALLET0,[PROGRESS]:P0,
 [VOICE]:s({mode:'rotate',volume:60}),
 [WHEELS]:s({version:1,owned:['seawheel']}),
 [LIVE]:s({level:6,completed:[0,1,2,3,4]}),
 [TEST_AUDIO]:s({music:true,sfx:true}),
 'another-app-data':'never touch'
};
function fixture(changes={},failures={}){
 const data=new Map(Object.entries({...base,...changes})),writes=[];
 let didFail=false;
 const storage={
  getItem:k=>data.has(k)?data.get(k):null,
  setItem:(k,v)=>{
   if(failures.failOnceSetKey===k&&!didFail){didFail=true;throw Error('INJECTED_STORAGE_FAILURE')}
   data.set(k,String(v));writes.push({kind:'set',key:k,value:String(v)});
  },
  removeItem:k=>{
   if(failures.failOnceRemoveKey===k&&!didFail){didFail=true;throw Error('INJECTED_STORAGE_REMOVAL_FAILURE')}
   data.delete(k);writes.push({kind:'remove',key:k});
  }
 };
 return {data,storage,writes};
}
function load(f,locks,nonce=()=> '12345678-abcd-4abc-a123-123456789012'){
 const w={},p=f.writes.length;
 vm.runInNewContext(source,{window:w}, {filename:'transaction-v7.js',timeout:6000});
 assert.equal(f.writes.length,p,'script load must be storage inert');
 const factory=w.BUWTNativeFullBackupTransactionV7;
 assert.equal(factory.loadedFromRealGame,false);
 return factory.createForStorage(f.storage,locks,nonce);
}
const unlocked={request:async(_,{mode,ifAvailable},callback)=>{
 assert.equal(mode,'exclusive');assert.equal(ifAvailable,true);
 return callback({mode:'exclusive'});
}};
const occupied={request:async(_opts,{mode,ifAvailable},callback)=>callback(null)};
const desired=[{key:W,after:WALLET1},{key:PROGRESS,after:P1}];
let count=0;
const pass=label=>{count++;console.log('PASS_V7_'+count+' '+label)};
(async()=>{
 // 1. Read-only preview: no change to wallet / paid wheels / voice / LIVE.
 {
  const f=fixture(),a=load(f,unlocked),v=a.preview(desired);
  assert.equal(v.ok,true);assert.equal(v.changes,2);
  assert.equal(v.plan.steps[0].before,WALLET0);
  assert.equal(f.writes.length,0);
  assert.deepEqual(Object.fromEntries(f.data),base);
  pass('inert evaluation and read-only preview');
 }
 // 2. No import without two explicit affirmations.
 {
  const f=fixture(),a=load(f,unlocked),p=a.preview(desired).plan;
  assert.equal((await a.apply({approved:true,plan:p})).reason,'consent-and-complete-backup-required');
  assert.equal((await a.apply({backupConfirmed:true,plan:p})).reason,'consent-and-complete-backup-required');
  assert.equal(f.writes.length,0);pass('explicit backup and permission');
 }
 // 3. Missing or occupied lock: fail closed, untouched.
 {
  for(const locks of [null,occupied]){
   const f=fixture(),a=load(f,locks),p=a.preview(desired).plan;
   const z=await a.apply({approved:true,backupConfirmed:true,plan:p});
   assert.equal(z.ok,false);
   assert.equal(f.data.get(W),WALLET0);assert.equal(f.writes.length,0);
  }
  pass('missing/held exclusive browser lock');
 }
 // 4. Complete synthetic transaction, no extra write or token mint.
 {
  const f=fixture(),a=load(f,unlocked),p=a.preview(desired).plan;
  const result=await a.apply({approved:true,backupConfirmed:true,plan:p});
  assert.equal(result.ok,true);assert.equal(result.committed,true);
  assert.equal(f.data.get(W),WALLET1);assert.equal(f.data.get(PROGRESS),P1);
  assert.equal(f.data.get(VOICE),base[VOICE]);assert.equal(f.data.get(WHEELS),base[WHEELS]);
  assert.equal(f.data.get(LIVE),base[LIVE]);assert.equal(f.data.get(TEST_AUDIO),base[TEST_AUDIO]);
  assert.equal(f.data.has(J),false);assert.equal(f.data.has(C),false);
  assert.equal(f.writes.filter(x=>x.key===W).length,1);
  assert.equal((await a.apply({approved:true,backupConfirmed:true,plan:p})).reason,'preview-stale-no-writes');
  pass('commit exact keys, preserve other game and prevent replay');
 }
 // 5. A source update between preview and lock acquisition MUST prevent restore.
 {
  const f=fixture(),a=load(f,unlocked),p=a.preview(desired).plan;
  f.data.set(W,WALLET_NEW);
  const before=f.writes.length;
  assert.equal((await a.apply({approved:true,backupConfirmed:true,plan:p})).reason,'preview-stale-no-writes');
  assert.equal(f.writes.length,before);assert.equal(f.data.get(W),WALLET_NEW);
  pass('stale preview refused before journal');
 }
 // 6. Unrecognized native legacy journal is a stop sign, not something to rewind.
 {
  const f=fixture({[LEGACY]:s({version:1,previous:{[W]:WALLET0}})}),a=load(f,unlocked);
  assert.equal(a.preview(desired).reason,'unsafe-legacy-v2-journal');
  const manual={format:'BibleUnfoldedFullBackupPlanV7',version:7,
   steps:[{key:W,before:WALLET0,after:WALLET1}]};
  assert.equal((await a.apply({approved:true,backupConfirmed:true,plan:manual})).reason,
   'unsafe-legacy-v2-journal');
  assert.equal(f.data.get(W),WALLET0);
  pass('old v2 recovery journal quarantined');
 }
 // 7. Reject invalid target keys, duplicate keys and LIVE crossword key.
 {
  const f=fixture(),a=load(f,unlocked);
  assert.equal(a.preview([{key:LIVE,after:P1}]).reason,'invalid-writes');
  assert.equal(a.preview([{key:'other-app-secret',after:'x'}]).reason,'invalid-writes');
  assert.equal(a.preview([{key:W,after:WALLET1},{key:W,after:WALLET1}]).reason,'no-change-or-invalid-writes');
  assert.equal(a.preview([{key:W,after:WALLET0}]).reason,'no-change-or-invalid-writes');
  assert.equal(f.writes.length,0);
  pass('scope whitelist, no LIVE target and duplicate rejection');
 }
 const partialRecord=s({format:'BibleUnfoldedFullBackupTransactionV7',version:7,
  id:'12345678-abcd-4abc-a123-123456789012',
  steps:[{key:W,before:WALLET0,after:WALLET1},
         {key:PROGRESS,before:P0,after:P1}]});
 // 8. Interrupted writes: explicit recovery of expected changes ONLY.
 {
  const f=fixture({[W]:WALLET1,[J]:partialRecord}),a=load(f,unlocked);
  const p=a.inspect();
  assert.equal(p.ok,true);assert.equal(p.pending,true);assert.equal(p.after,1);assert.equal(p.before,1);
  assert.equal((await a.recover()).reason,'consent-and-complete-backup-required');
  const z=await a.recover({approved:true,backupConfirmed:true});
  assert.equal(z.ok,true);assert.equal(f.data.get(W),WALLET0);
  assert.equal(f.data.get(PROGRESS),P0);assert.equal(f.data.has(J),false);
  assert.equal(f.data.get(VOICE),base[VOICE]);pass('explicit repair of partial transaction');
 }
 // 9. A newer writer changes wallet during interrupted recovery — never rewind.
 {
  const f=fixture({[W]:WALLET_NEW,[PROGRESS]:P1,[J]:partialRecord}),a=load(f,unlocked);
  assert.equal(a.inspect().reason,'concurrent-writer-conflict');
  const z=await a.recover({approved:true,backupConfirmed:true});
  assert.equal(z.reason,'concurrent-writer-conflict');assert.equal(f.data.get(W),WALLET_NEW);
  assert.equal(f.data.get(PROGRESS),P1);assert.equal(f.data.has(J),true);
  pass('newer wallet prevents destructive rollback');
 }
 // 10. Committed journal left after interruption: cleanup only, never revert.
 {
  const f=fixture({[W]:WALLET1,[PROGRESS]:P1,[J]:partialRecord,[C]:'12345678-abcd-4abc-a123-123456789012'});
  const a=load(f,unlocked),p=a.inspect();
  assert.equal(p.ok,true);assert.equal(p.committed,true);
  const z=await a.recover({approved:true,backupConfirmed:true});
  assert.equal(z.committedKept,true);assert.equal(f.data.get(W),WALLET1);
  assert.equal(f.data.get(PROGRESS),P1);assert.equal(f.data.has(J),false);assert.equal(f.data.has(C),false);
  pass('committed transaction is not undone');
 }
 // 11. Marker mismatch and changed committed record demand human review.
 {
  for(const change of [{[C]:'00000000-abcd-4000-8000-000000000000'},
   {[C]:'12345678-abcd-4abc-a123-123456789012',[W]:WALLET_NEW}]){
   const f=fixture({[W]:WALLET1,[PROGRESS]:P1,[J]:partialRecord,...change});
   const a=load(f,unlocked);
   assert.equal((await a.recover({approved:true,backupConfirmed:true})).ok,false);
   assert.equal(f.data.has(J),true);
  }pass('committed mismatch/quarantine');
 }
 // 12. Failed second write leaves journal and is repairable (never auto rewinds).
 {
  const f=fixture({}, {failOnceSetKey:PROGRESS}),a=load(f,unlocked),p=a.preview(desired).plan;
  const z=await a.apply({approved:true,backupConfirmed:true,plan:p});
  assert.equal(z.ok,false);assert.equal(z.reason,'partial-import-needs-review');
  assert.equal(f.data.get(W),WALLET1);assert.equal(f.data.get(PROGRESS),P0);
  assert.equal(f.data.has(J),true);
  assert.equal((await a.recover({approved:true,backupConfirmed:true})).ok,true);
  assert.equal(f.data.get(W),WALLET0);assert.equal(f.data.get(PROGRESS),P0);
  pass('storage quota partial-write + manual recovery');
 }
 // 13. Committed marker cleanup may fail; committed progress remains.
 {
  const f=fixture({}, {failOnceRemoveKey:J}),a=load(f,unlocked),p=a.preview(desired).plan;
  const z=await a.apply({approved:true,backupConfirmed:true,plan:p});
  assert.equal(z.ok,true);assert.equal(z.needsCleanup,true);
  assert.equal(f.data.get(W),WALLET1);
  const cleanup=await a.recover({approved:true,backupConfirmed:true});
  assert.equal(cleanup.committedKept,true);assert.equal(f.data.get(W),WALLET1);
  pass('post-commit cleanup failures cannot erase the restore');
 }
 // 14. Fail closed on a journal from another schema or orphan commit marker.
 {
  const a=load(fixture({[J]:s({format:'unknown',version:7,steps:[]})}),unlocked);
  assert.equal(a.inspect().reason,'invalid-journal');
  const b=load(fixture({[C]:'12345678-abcd-4abc-a123-123456789012'}),unlocked);
  assert.equal(b.inspect().reason,'orphan-commit-marker');
  pass('invalid journal/orphan marker safely blocked');
 }
 // 15. In-flight mutation by uncooperative script during restore is detected
 // at the NEXT check. The old LIVE script is still outside the cooperative lock.
 {
  const f=fixture(),rawSet=f.storage.setItem.bind(f.storage);
  f.storage.setItem=(key,val)=>{
   rawSet(key,val);
   if(key===W)f.data.set(PROGRESS,s({level:99,completed:[99]}));
  };
  const a=load(f,unlocked),p=a.preview(desired).plan;
  assert.equal((await a.apply({approved:true,backupConfirmed:true,plan:p})).reason,'writer-conflict-during-import');
  assert.equal(f.data.has(J),true);
  assert.equal(a.inspect().reason,'concurrent-writer-conflict');
  pass('noncooperating writer detected, but cannot be prevented');
 }
 console.log('PASS_WORD_TRAILS_NATIVE_FULL_BACKUP_TRANSACTION_V7',JSON.stringify({
  cases:count,sourceLoadWrites:0,confirmedWritesOnly:true,
  journalBeforeWrites:true,committedMarkerNeverRolledBack:true,
  newerWalletPreserved:true,webLocksFailClosed:true,
  stillUnlinked:true,lIVEUntouched:true
 }));
 console.log('RELEASE_BLOCKED: v7 is not native Settings, has no trusted v2 format planner or independent browser/mobile acceptance, and old uncooperative tabs can still race.');
})().catch(e=>{console.error('FAIL_WORD_TRAILS_NATIVE_FULL_BACKUP_TRANSACTION_V7',e.stack||e);process.exitCode=1});

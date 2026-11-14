#!/usr/bin/env node
'use strict';
/* TEST-only synthetic race regression:
 * 1. Show actual native v2 coordinator silently rewinds newer cross-tab data.
 * 2. Prove unlinked v6 candidate detects conflicts and fails closed.
 * Never run on real localStorage or modify Story-Trails LIVE.
 */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const core=fs.readFileSync('bu-platform-saves-v2.js','utf8');
const guard=fs.readFileSync('experiments/word-trails-full-backup-journal-guard-v6.js','utf8');
const WALLET='bible-unfolded-rewards-v17';
const TRAILS='bu-visual-lab-wordtrails-next-v1';
const VOICE='bible-unfolded-private-voice-pref-v381';
const LEGACY='bu-visual-lab-import-rollback-v2';
const V3='bu-visual-lab-import-rollback-v3';
const stringify=JSON.stringify;
const oldWallet=stringify({coins:75,points:40,purchases:['seawheel'],equippedWheel:'seawheel'});
const restoreWallet=stringify({coins:20,points:10,purchases:['seawheel'],equippedWheel:'seawheel'});
const newerWallet=stringify({coins:250,points:70,purchases:['seawheel'],equippedWheel:'seawheel'});
const oldTrail=stringify({level:1,unlocked:2,coins:2,points:5,completed:[0]});
const restoredTrail=stringify({level:2,unlocked:3,coins:7,points:9,completed:[0,1]});
const voice=stringify({mode:'rotate',volume:65});
let checks=0;
function fixture(seed={}){
 const map=new Map(Object.entries({[WALLET]:oldWallet,[TRAILS]:oldTrail,[VOICE]:voice,...seed}));
 const events=[];
 const storage={
  get length(){return map.size},
  key:i=>[...map.keys()][i]??null,
  getItem:k=>map.has(k)?map.get(k):null,
  setItem:(k,v)=>{events.push('set:'+k);map.set(k,String(v))},
  removeItem:k=>{events.push('remove:'+k);map.delete(k)}
 };
 return {map,storage,events};
}
function loadGuard(f,locks){
 const w={},ctx={window:w,localStorage:f.storage,console};
 const prior=f.events.length;
 vm.runInNewContext(guard,ctx,{filename:'journal-guard-v6',timeout:5000});
 assert.equal(f.events.length,prior,'Source load wrote browser storage');
 return w.BUWTFullBackupJournalGuardV6.createForStorage(f.storage,locks);
}
function oldCoreRecovery(f){
 const w={},ctx={window:w,localStorage:f.storage,console,
  document:{readyState:'loading',addEventListener:()=>{},getElementById:()=>null},
  location:{reload:()=>{}},setTimeout:()=>0};
 vm.runInNewContext(core,ctx,{filename:'actual-native-v2',timeout:5000});
 return w.BUPlatformSaves;
}
const pending=(steps)=>stringify({format:'BibleUnfoldedGuardedFullBackupRecovery',
 version:3,steps,createdAt:'2026-11-13T22:00:00Z'});
const steps=[
 {key:WALLET,before:oldWallet,after:restoreWallet},
 {key:TRAILS,before:oldTrail,after:restoredTrail}
];
const available={request:async(_,{ifAvailable},cb)=>cb({name:'locked'})};
const blocked={request:async(_,{ifAvailable},cb)=>cb(null)};
(async()=>{
 // Actual v2: old tab A interrupted after restore, tab B updates wallet,
 // then a fresh v2 tab replays journal and destroys B's newer wallet.
 const f=fixture({[WALLET]:newerWallet,[TRAILS]:restoredTrail,
  [LEGACY]:stringify({version:1,previous:{[WALLET]:oldWallet,[TRAILS]:oldTrail}})});
 const before=new Map(f.map);
 const inspector=loadGuard(f,available);
 assert.equal(inspector.inspect().reason,'legacy-v2-journal-has-no-after-values');
 assert.equal(f.map.get(WALLET),newerWallet);
 const rejected=await inspector.recoverExplicitly({approved:true,backupConfirmed:true});
 assert.equal(rejected.ok,false);
 assert.deepEqual([...f.map],[...before]);
 checks++;
 oldCoreRecovery(f);
 assert.equal(f.map.get(WALLET),oldWallet,'Must reproduce real v2 lost update');
 assert.equal(f.map.get(TRAILS),oldTrail);
 assert.equal(f.map.has(LEGACY),false);
 checks++;
 // Future version: compare current to BEFORE and AFTER under cooperative lock.
 const f2=fixture({[WALLET]:restoreWallet,[TRAILS]:restoredTrail,[V3]:pending(steps)});
 const safe=loadGuard(f2,available);
 assert.equal(safe.inspect().eligible,true);
 assert.equal(safe.inspect().needsRewind,2);
 assert.equal(f2.map.get(WALLET),restoreWallet,'Inspect is read-only');
 assert.equal((await safe.recoverExplicitly({approved:false,backupConfirmed:true})).ok,false);
 assert.equal(f2.map.get(WALLET),restoreWallet);
 assert.equal((await safe.recoverExplicitly({approved:true,backupConfirmed:false})).ok,false);
 assert.equal(f2.map.get(WALLET),restoreWallet);
 checks++;
 const done=await safe.recoverExplicitly({approved:true,backupConfirmed:true});
 assert.equal(done.ok,true);
 assert.equal(f2.map.get(WALLET),oldWallet);
 assert.equal(f2.map.get(TRAILS),oldTrail);
 assert.equal(f2.map.get(VOICE),voice);
 assert.equal(f2.map.has(V3),false);
 checks++;
 const f3=fixture({[WALLET]:newerWallet,[TRAILS]:restoredTrail,[V3]:pending(steps)});
 const conflicting=loadGuard(f3,available);
 assert.equal(conflicting.inspect().reason,'concurrent-writer-conflict');
 assert.equal(conflicting.inspect().conflicts.includes(WALLET),true);
 assert.equal((await conflicting.recoverExplicitly({approved:true,backupConfirmed:true})).ok,false);
 assert.equal(f3.map.get(WALLET),newerWallet);
 assert.equal(f3.map.get(TRAILS),restoredTrail);
 assert.equal(f3.map.has(V3),true);
 checks++;
 const f4=fixture({[WALLET]:restoreWallet,[TRAILS]:restoredTrail,[V3]:pending(steps)});
 assert.equal((await loadGuard(f4,null).recoverExplicitly({
  approved:true,backupConfirmed:true})).reason,'exclusive-web-locks-unavailable');
 assert.equal((await loadGuard(f4,blocked).recoverExplicitly({
  approved:true,backupConfirmed:true})).reason,'another-recovery-in-progress');
 assert.equal(f4.map.get(WALLET),restoreWallet);
 checks++;
 const f5=fixture({[V3]:pending([{key:'other-provider-secret',before:'a',after:'b'}])});
 assert.equal(loadGuard(f5,available).inspect().reason,'invalid-v3-journal');
 assert.equal(f5.map.get(VOICE),voice);
 checks++;
 const f6=fixture();
 assert.equal(loadGuard(f6,available).inspect().pending,false);
 checks++;
 const f7=fixture({[WALLET]:oldWallet,[TRAILS]:restoredTrail,[V3]:pending(steps)});
 const partial=loadGuard(f7,available);
 assert.equal(partial.inspect().needsRewind,1);
 assert.equal((await partial.recoverExplicitly({approved:true,backupConfirmed:true})).ok,true);
 assert.equal(f7.map.get(WALLET),oldWallet);
 assert.equal(f7.map.get(TRAILS),oldTrail);
 checks++;
 console.log('PASS_WORD_TRAILS_FULL_BACKUP_JOURNAL_GUARD_V6',JSON.stringify({
  cases:checks,actualNativeV2LostConcurrentWalletUpdate:true,
  candidateRefusedLegacyJournal:true,candidateRefusedConflictingNewerWrites:true,
  candidateRequiredApprovalBackupAndWebLock:true,
  freshUnconflictedV3RecoveredOnlyExpectedKeys:true,
  originalVoiceUnchanged:true,prototypeUnlinked:true,liveUntouched:true
 }));
 console.log('RELEASE_BLOCKED: this does NOT stop already-running or cached LIVE scripts, and cannot protect against non-cooperating writers.');
})().catch(e=>{console.error('FAIL_WORD_TRAILS_FULL_BACKUP_JOURNAL_GUARD_V6',e.stack||e);process.exitCode=1});

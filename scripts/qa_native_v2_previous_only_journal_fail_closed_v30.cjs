#!/usr/bin/env node
'use strict';
/* TEST-only native full-backup failed-restore fail-closed QA v30.
 * Actual active and pinned earlier TEST source run ONLY inside Node VM
 * with fictional, fake storage. Never access actual player browser saves.
 * Optional argument is file path to pinned previous-only coordinator.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const active=fs.readFileSync('bu-platform-saves-v2.js','utf8');
const LIVE='bible-unfolded-word-trails-next-v1',W='bible-unfolded-rewards-v17';
const WB='bible-unfolded-rewards-v17-recovery-v3811',T='bu-visual-lab-wordtrails-next-v1';
const OWN='bible-unfolded-wheel-ownership-v3825',VOICE='bible-unfolded-private-voice-pref-v381';
const J='bu-visual-lab-import-rollback-v2',C='bu-visual-lab-import-committed-v2';
const jj=JSON.stringify;
const originalWallet=jj({coins:700,points:-20,purchases:['seawheel'],equippedWheel:'seawheel'});
const backupWallet=jj({coins:150,points:-5,purchases:['goldwheel'],equippedWheel:'goldwheel'});
const newerWallet=jj({coins:950,points:-18,purchases:['seawheel'],equippedWheel:'seawheel'});
const oldTrail=jj({level:1,unlocked:2,coins:11,points:5,completed:[0],sparks:[],claimedSparks:[],boardBible:[],paidWords:[],paidBonuses:[],claimedFreeHints:[],progress:{level:1,found:['ELI'],bonuses:[],hinted:[],combo:1}});
const incomingTrail=jj({...JSON.parse(oldTrail),level:2,unlocked:3,coins:120,points:20,completed:[0,1]});
const realLive=jj({level:12,unlocked:15,coins:888,completed:[0,1,2,3]});
const base={
 [W]:originalWallet,[WB]:originalWallet,
 [OWN]:jj({version:1,owned:['seawheel']}),
 [T]:oldTrail,[LIVE]:realLive,[VOICE]:jj({mode:'rotate',volume:65}),
 'story-trails-synthetic-chapter':jj({completed:[1,2],points:30})
};
function fixture(source=active,extras={},hooks={}){
 const data=new Map(Object.entries({...base,...extras})),events=[];
 let threw=false;
 const storage={
  get length(){return data.size},
  key:i=>[...data.keys()][i]??null,
  getItem:k=>data.has(k)?data.get(k):null,
  setItem:(k,v)=>{
   if(hooks.failBeforeSetKey===k&&!threw){threw=true;throw Error('INJECTED_DISK_QUOTA')}
   if(hooks.updateWalletWhenSetFails===k&&!threw){
    threw=true;data.set(W,newerWallet);events.push(['foreign-set',W]);
    throw Error('INJECTED_CONCURRENT_WRITER');
   }
   events.push(['set',k]);data.set(k,String(v));
  },
  removeItem:k=>{
   if(hooks.failRemoveKey===k&&!threw){threw=true;throw Error('INJECTED_META_CLEANUP_FAILURE')}
   events.push(['remove',k]);data.delete(k);
  }
 };
 let reloads=0;
 const w={},doc={readyState:'loading',addEventListener(){},getElementById(){return null}};
 const context=vm.createContext({window:w,localStorage:storage,document:doc,
  location:{reload:()=>reloads++},setTimeout(){},console});
 vm.runInContext(source,context,{filename:'native-complete-backup-v30.js',timeout:5000});
 assert(w.BUPlatformSaves);
 return {data,events,api:w.BUPlatformSaves,window:w,storage,get reloads(){return reloads}};
}
function imported(api){
 const obj=JSON.parse(JSON.stringify(api.makeBackup()));
 obj.keys[W]=backupWallet;obj.keys[WB]=backupWallet;
 obj.extensions.wordTrailsNext.state=incomingTrail;
 return obj;
}
let n=0;
const pass=s=>console.log('PASS_NATIVE_V30_'+(++n)+' '+s);
const oldFile=process.argv[2];
if(oldFile){
 const s=fs.readFileSync(oldFile,'utf8'),b=Buffer.from(s,'utf8');
 const blob=crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
 assert.equal(blob,'9d68acacb2d65eaccb050f6e3688cf2bf77892aa','Pinned unsafe old native TEST blob mismatch');
 const beforeJournal=jj({version:1,previous:{[W]:originalWallet,[T]:oldTrail},createdAt:'2026-11-13T19:00:00Z'});
 const f=fixture(s,{[W]:newerWallet,[T]:incomingTrail,[J]:beforeJournal});
 assert.equal(f.data.get(W),originalWallet,'Reproduce previous TEST silent loss of newer wallet on load');
 assert.equal(f.data.get(T),oldTrail);
 assert.equal(f.data.has(J),false);
 console.log('PASS_NEGATIVE_PINNED_OLD_TEST_V2_DESTRUCTIVE_RESTORE_REPRODUCTION',blob);
}
{
 const f=fixture();assert.equal(f.events.length,0);
 assert.deepEqual(f.api.recoverPending(),{recovered:false});
 pass('normal player start with no journal is storage-inert');
}
{
 const j=jj({version:1,previous:{[W]:originalWallet,[T]:oldTrail},createdAt:'2026-11-13T19:00:00Z'});
 const f=fixture(active,{[W]:newerWallet,[T]:incomingTrail,[J]:j});
 assert.equal(f.api.recoverPending().needsManualReview,true);
 assert.equal(f.api.recoverPending().pending,true);
 assert.equal(f.data.get(W),newerWallet);assert.equal(f.data.get(T),incomingTrail);
 assert.equal(f.data.get(J),j);assert.equal(f.events.length,0);
 pass('old interrupted wallet and TEST puzzle journal quarantined at boot');
}
{
 const journal=jj({version:1,previous:{[LIVE]:realLive,[W]:originalWallet}});
 const f=fixture(active,{[J]:journal,[W]:newerWallet,[LIVE]:jj({level:20,coins:999})});
 assert.equal(f.api.recoverPending().needsManualReview,true);
 assert.equal(f.data.get(W),newerWallet);assert.equal(f.data.get(LIVE),jj({level:20,coins:999}));
 assert.equal(f.events.length,0);
 pass('legacy mixed TEST/LIVE journal still quarantined');
}
{
 const f=fixture(active,{[J]:'{INVALID_JOURNAL',[W]:newerWallet});
 assert.equal(f.api.recoverPending().needsManualReview,true);
 assert.equal(f.events.length,0);
 pass('malformed incomplete journal refused with zero storage writes');
}
{
 const j=jj({version:1,previous:{[W]:originalWallet}});
 const f=fixture(active,{[J]:j,[C]:'yes',[W]:backupWallet});
 assert.equal(f.api.recoverPending().committed,true);
 assert.equal(f.data.get(W),backupWallet);
 assert.equal(f.data.has(J),false);assert.equal(f.data.has(C),false);
 assert.deepEqual(f.events,[['remove',J],['remove',C]]);
 pass('already committed import cleans metadata ONLY and never rewinds');
}
{
 const f=fixture(active,{[C]:'yes',[W]:newerWallet});
 assert.equal(f.api.recoverPending().needsManualReview,true);
 assert.equal(f.data.get(W),newerWallet);
 assert.equal(f.data.has(C),true);assert.equal(f.events.length,0);
 pass('orphaned commit marker needs review without touching progress');
}
{
 const f=fixture(active,{}, {failBeforeSetKey:T});
 const backup=imported(f.api);
 assert.throws(()=>f.api.applyBackup(backup,{reload:false}),/rolled back after checking/);
 assert.equal(f.data.get(W),originalWallet);
 assert.equal(f.data.get(T),oldTrail);
 assert.equal(f.data.get(LIVE),realLive);
 assert.equal(f.data.has(J),false);assert.equal(f.data.has(C),false);
 assert.equal(f.window.__bu388SkipCheckpoint,false);
 pass('in-call quota failure conditionally rolls back only expected values');
}
{
 const f=fixture(active,{}, {updateWalletWhenSetFails:T});
 const backup=imported(f.api);
 assert.throws(()=>f.api.applyBackup(backup,{reload:false}),/automatic rollback was stopped/);
 assert.equal(f.data.get(W),newerWallet,'Never erase foreign newer wallet');
 assert.equal(f.data.get(LIVE),realLive);
 assert.equal(f.data.get(VOICE),base[VOICE]);
 assert.equal(f.data.has(J),true,'Keep incomplete journal for manual review');
 assert.equal(f.api.recoverPending().needsManualReview,true);
 assert.equal(f.data.get(W),newerWallet);
 pass('uncooperative newer wallet during failed import triggers no destructive rollback');
}
{
 const f=fixture(active,{}, {failRemoveKey:J});
 const result=f.api.applyBackup(imported(f.api),{reload:false});
 assert.equal(result.ok,true);assert.equal(result.committed,true);
 assert.equal(result.needsCleanup,true);
 assert.equal(f.data.get(W)!==originalWallet,true);
 assert.equal(JSON.parse(f.data.get(W)).coins,150);
 assert.equal(f.data.has(J),true);assert.equal(f.data.get(C),'yes');
 assert.equal(f.api.recoverPending().committed,true);
 assert.equal(JSON.parse(f.data.get(W)).coins,150);
 assert.equal(f.data.has(J),false);
 pass('cleanup failure does not undo committed restore; cold recovery only removes metadata');
}
{
 const journal=jj({version:1,previous:{[W]:originalWallet}});
 const f=fixture(active,{[J]:journal});
 const writes=f.events.length;
 assert.throws(()=>f.api.applyBackup(imported(f.api),{reload:false}),/earlier import recovery/);
 assert.equal(f.events.length,writes);
 assert.throws(()=>f.api.previewRestoreWrites(imported(f.api)),/recovery review/);
 assert.equal(f.data.get(W),originalWallet);
 pass('pending journal blocks both restore execution and preview; export remains possible');
}
{
 const f=fixture(active,{[J]:jj({version:1,previous:{[W]:originalWallet}})});
 const backup=f.api.makeBackup();
 assert.equal(backup.keys[J],undefined);
 assert.equal(backup.keys[LIVE],undefined);
 assert.equal(backup.keys[VOICE],base[VOICE]);
 assert.equal(f.events.length,0);
 pass('user may still create read-only emergency export; excludes journal and LIVE progress');
}
{
 const f=fixture(active);
 const before=new Map(f.data), backup=imported(f.api);
 f.storage.setItem(C,'yes');
 assert.throws(()=>f.api.applyBackup(backup,{reload:false}),/earlier import recovery/);
 assert.equal(f.data.get(W),before.get(W));
 pass('orphan committed marker blocks new import before journal');
}
console.log('PASS_NATIVE_V30_PREVIOUS_ONLY_JOURNAL_FAIL_CLOSED',JSON.stringify({
 cases:n,legacyOldNegativeProof:!!oldFile,readonlyBoot:true,
 walletAndLiveProgressPreserved:true,immediateQuotaRollbackGuarded:true,
 committedRestoreNeverRewound:true,legacyUnknownJournalQuarantined:true,
 stagedNativeBackupImportStillSupported:true,
 noRealUserStorageAccessed:true
}));

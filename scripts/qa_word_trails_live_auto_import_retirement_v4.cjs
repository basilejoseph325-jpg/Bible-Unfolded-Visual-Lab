#!/usr/bin/env node
'use strict';
/* Visual Lab TEST safety review of the EXACT CURRENT PROTECTED LIVE auto-import.
 * Uses pinned LIVE script + HTML from 2026-11-13 commit in FAKE VM storage.
 * Builds an in-memory future-release HTML script-slot DIFF, does not write it.
 * All simulated wallets/ownership/voice/crossword saves are synthetic.
 * DOES NOT edit the LIVE repo or touch any player's browser.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const crypto=require('node:crypto');
const oldPath=process.argv[2],oldHtmlPath=process.argv[3];
assert(oldPath&&oldHtmlPath,'Usage: node qa_word_trails_live_auto_import_retirement_v4.cjs OLD_LIVE_JS OLD_LIVE_HTML');
const oldJs=fs.readFileSync(oldPath,'utf8');
const oldHtml=fs.readFileSync(oldHtmlPath,'utf8');
const PINS={
 js:'52d0a564a16a964daf70e156e46e7d7866480c81',
 html:'3ad4ba766ccf986a575ea24a2eb6b1dd758cb104'
};
const blob=content=>{const b=Buffer.from(content,'utf8');return crypto.createHash('sha1').update('blob '+b.byteLength+'\0').update(b).digest('hex')};
assert.equal(blob(oldJs),PINS.js,'STOP: Protected LIVE auto-import JS has changed since this audit');
assert.equal(blob(oldHtml),PINS.html,'STOP: Protected LIVE Word Trails HTML has changed since this audit');
const oldTag='<script src="word-trails-live-migration-v1.js?v=live-progress-only-20261109" defer></script>';
assert.equal(oldHtml.split(oldTag).length,2,'One and only one current LIVE auto-import tag required');
const futureTags=[
 '<script src="word-trails-live-consent-migration-candidate-v1.js?v=optin-v4" defer></script>',
 '<script src="word-trails-exclusive-consent-boundary-v2.js?v=optin-v4" defer></script>',
 '<script src="word-trails-recovery-checkpoint-candidate-v3.js?v=optin-v4" defer></script>',
 '<script src="word-trails-live-migration-consent-gate-v4.js?v=optin-v4" defer></script>'
].join('\n');
const proposedHtml=oldHtml.replace(oldTag,futureTags);
assert(!proposedHtml.includes(oldTag));
assert.equal(proposedHtml.replace(futureTags,oldTag),oldHtml,'Single verified script-slot change; preserve all other LIVE markup');
for(const file of [
 'experiments/word-trails-live-consent-migration-candidate-v1.js',
 'experiments/word-trails-exclusive-consent-boundary-v2.js',
 'experiments/word-trails-recovery-checkpoint-candidate-v3.js',
 'experiments/word-trails-live-migration-consent-gate-v4.js'
])assert(fs.existsSync(file),'Future opt-in script dependency missing in TEST: '+file);
const s=[
 'experiments/word-trails-live-consent-migration-candidate-v1.js',
 'experiments/word-trails-exclusive-consent-boundary-v2.js',
 'experiments/word-trails-recovery-checkpoint-candidate-v3.js',
 'experiments/word-trails-live-migration-consent-gate-v4.js'
].map(p=>fs.readFileSync(p,'utf8'));
const TEST='bu-visual-lab-wordtrails-next-v1';
const LIVE='bible-unfolded-word-trails-next-v1';
const WALLET='bible-unfolded-rewards-v17';
const WHEELS='bible-unfolded-wheel-ownership-v3825-backup';
const VOICE='bible-unfolded-private-voice-pref-v381';
const sample={level:2,unlocked:4,coins:9999,points:144,completed:[0,1,2],
 sparks:[0],claimedSparks:['0:PAUL'],boardBible:[],paidWords:[],paidBonuses:['0|ART'],
 claimedFreeHints:[0],sound:true,
 progress:{level:2,found:['ELI'],bonuses:[],hinted:[],combo:2}};
const native={
 [WALLET]:JSON.stringify({coins:837,points:-25,purchases:['seawheel'],equippedWheel:'seawheel'}),
 [WHEELS]:JSON.stringify({owned:['seawheel']}),
 [VOICE]:JSON.stringify({mode:'rotating'})
};
const LOCK='bible-unfolded-word-trails-progress-import-exclusive-v2';
function sharedLock(){
 let busy=false;
 return {
 request:async (name,options,cb)=>{
  assert.equal(name,LOCK);assert.equal(options.mode,'exclusive');
  assert.equal(options.ifAvailable,true);
  if(busy)return cb(null);
  busy=true;try{return await cb({name})}finally{busy=false}
 }
 };
}
function fake(options={}){
 const initial={...native,[TEST]:JSON.stringify(sample),...options.initial};
 const map=new Map(Object.entries(initial)),writes=[],reads=[];
 const storage={
  getItem:key=>{reads.push(key);return map.has(key)?map.get(key):null},
  setItem:(key,v)=>{writes.push('set:'+key);map.set(key,String(v))},
  removeItem:key=>{writes.push('remove:'+key);map.delete(key)}
 };
 const win={};const locks=options.noLock?null:sharedLock();
 const context=vm.createContext({window:win,localStorage:storage,navigator:{locks}});
 const intact=()=>{
  for(const [k,v] of Object.entries(native))assert.equal(map.get(k),v,'Shared wallet/entitlement/voice changed');
  assert.equal(map.get(TEST),initial[TEST],'TEST crossword source must stay untouched');
  assert(!writes.some(e=>e.includes(WALLET)||e.includes(WHEELS)||e.includes(VOICE)),'Native writes prohibited');
 };
 return {initial,map,writes,reads,storage,win,locks,context,intact};
}
(async()=>{
 const old=fake();vm.runInContext(oldJs,old.context,{timeout:1500});
 assert.deepEqual(old.writes,['set:'+LIVE],
  'Existing LIVE auto-import must be reproduced; it is not consented');
 assert.equal(JSON.parse(old.map.get(LIVE)).coins,60);
 old.intact();
 const next=fake();for(const source of s)vm.runInContext(source,next.context,{timeout:1500});
 assert.equal(next.writes.length,0,'Opt-in replacement chain must have ZERO writes on evaluation');
 assert.equal(next.reads.length,0,'Opt-in replacement chain must have ZERO storage reads on evaluation');
 const gate=next.win.BUWTLiveConsentMigrationGateV4;
 assert.equal(gate.automaticImport,false);
 assert.equal(gate.requiresVisibleUserConsent,true);
 assert.equal(gate.requiresSavedCheckpoint,true);
 const svc=gate.createForStorage(next.storage,next.locks);
 assert.equal(next.writes.length,0,'Creating a gate must not alter storage');
 const preview=svc.preview();
 assert.equal(preview.available,true);
 assert.equal(preview.completedCount,3);
 assert.equal(preview.unlockedLevels,5);
 assert.equal(next.writes.length,0,'Preview must be strictly read-only');
 const exported=svc.exportCheckpoint(preview.checkpoint);
 assert(exported&&exported.includes('BibleUnfoldedWordTrailsRecoveryCheckpoint'));
 assert(!exported.includes(WALLET)&&!exported.includes(WHEELS)&&!exported.includes(VOICE));
 assert.equal(next.writes.length,0,'Checkpoint export must not touch browser storage');
 let r=await svc.applyWithConfirmedBackup({});
 assert.equal(r.reason,'consent-and-backup-required');
 r=await svc.applyWithConfirmedBackup({approved:true,checkpoint:exported,backupConfirmed:false});
 assert.equal(r.reason,'consent-and-backup-required');
 r=await svc.applyWithConfirmedBackup({approved:false,checkpoint:exported,backupConfirmed:true});
 assert.equal(r.reason,'consent-and-backup-required');
 assert.equal(next.writes.length,0,'Missing permission or backup must never import');
 r=await svc.applyWithConfirmedBackup({approved:true,checkpoint:exported,backupConfirmed:true});
 assert.equal(r.ok,true);assert.equal(r.via,'exclusive-browser-lock-v2');
 assert.deepEqual(next.writes,['set:'+LIVE],'Only LIVE crossword save key may be created after explicit consent');
 assert.equal(JSON.parse(next.map.get(LIVE)).coins,60);
 assert.equal(JSON.parse(next.map.get(LIVE)).points,0);
 next.intact();
 r=await svc.applyWithConfirmedBackup({approved:true,checkpoint:exported,backupConfirmed:true});
 assert.equal(r.reason,'live-progress-exists','Repeat must not duplicate progress or awards');
 assert.equal(next.writes.length,1);
 r=await svc.rollbackWithApproval({approved:false,checkpoint:exported});
 assert.equal(r.reason,'explicit-rollback-consent-required');
 const updated=JSON.parse(next.map.get(LIVE));
 updated.completed.push(3);next.map.set(LIVE,JSON.stringify(updated));
 r=await svc.rollbackWithApproval({approved:true,checkpoint:exported});
 assert.equal(r.reason,'live-progress-has-changed','Never erase new progress after import');
 assert.equal(next.writes.length,1);
 next.intact();
 next.map.set(LIVE,preview.checkpoint.expectedLiveRaw);
 r=await svc.rollbackWithApproval({approved:true,checkpoint:exported});
 assert.equal(r.ok,true);
 assert.equal(next.map.has(LIVE),false);
 assert.deepEqual(next.writes,['set:'+LIVE,'remove:'+LIVE]);
 next.intact();
 // No Web Locks: fail closed after explicit consent and backup.
 const noLock=fake({noLock:true});for(const source of s)vm.runInContext(source,noLock.context,{timeout:1500});
 const service=noLock.win.BUWTLiveConsentMigrationGateV4.createForStorage(noLock.storage,null);
 const cp=service.exportCheckpoint(service.preview().checkpoint);
 r=await service.applyWithConfirmedBackup({approved:true,backupConfirmed:true,checkpoint:cp});
 assert.equal(r.reason,'exclusive-lock-unavailable');
 assert.equal(noLock.writes.length,0);
 // Existing LIVE progress wins before any import even when TEST has old progress.
 const existing=fake({initial:{[LIVE]:JSON.stringify({level:7,unlocked:8,coins:60,completed:[0,1]})}});
 for(const source of s)vm.runInContext(source,existing.context,{timeout:1500});
 const check=existing.win.BUWTLiveConsentMigrationGateV4.createForStorage(existing.storage,existing.locks);
 assert.equal(check.preview().reason,'live-progress-exists');
 assert.equal(existing.writes.length,0);
 existing.intact();
 console.log('PASS_WORD_TRAILS_LIVE_AUTOIMPORT_RETIREMENT_V4',JSON.stringify({
  pinnedLiveMigrationBlob:PINS.js,pinnedLiveHtmlBlob:PINS.html,
  previouslySilentImportReproduced:true,
  proposedHtmlDiff:'one old script tag replaced by ordered four vetted opt-in scripts',
  proposedScriptOnLoadReads:0,proposedScriptOnLoadWrites:0,
  refusesWithoutPermissionOrBackup:true,
  consentedCrosswordOnlyImport:true,existingLiveProtected:true,
  quarantinedTestCoins:true,sharedWalletAndPurchasesAndVoicesUntouched:true,
  safeChangedProgressRollbackBlock:true,oneKeyRecovery:true,
  missingWebLockFailsClosed:true,liveRepositoryModified:false
 }));
 console.log('RELEASE_BLOCKED: Candidate requires future native Settings UI, real user approval, real device Safari testing and retirement of stale legacy LIVE tabs. NO LIVE files were written.');
})().catch(e=>{console.error('FAIL_WORD_TRAILS_LIVE_AUTOIMPORT_RETIREMENT_V4',e.stack||e);process.exitCode=1});

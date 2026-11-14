#!/usr/bin/env node
'use strict';
/* Native TEST read-only restore plan vs actual v2 applyBackup and v7
 * consented transaction parity. ALL original JS runs on fake VM storage.
 * The module is NOT attached to the real native Settings UI.
 */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const core=fs.readFileSync('bu-platform-saves-v2.js','utf8');
const tx=fs.readFileSync('experiments/word-trails-native-full-backup-transaction-v7.js','utf8');
const W='bible-unfolded-rewards-v17',WB='bible-unfolded-rewards-v17-recovery-v3811';
const O='bible-unfolded-wheel-ownership-v3825',OB='bible-unfolded-wheel-ownership-v3825-backup';
const T='bu-visual-lab-wordtrails-next-v1',FEEL='bu-wt-next-feel-v2';
const LIVE='bible-unfolded-word-trails-next-v1';
const VOICE='bible-unfolded-private-voice-pref-v381';
const JOURNAL='bu-visual-lab-import-rollback-v2';
const stringify=JSON.stringify;
const curWallet=stringify({coins:650,points:-21,purchases:['seawheel'],equippedWheel:'seawheel'});
const newWallet=stringify({coins:125,points:-99,purchases:['goldwheel'],equippedWheel:'goldwheel'});
const oldProgress=stringify({level:1,unlocked:3,coins:55,points:40,completed:[0],sparks:[],claimedSparks:[],boardBible:[],paidWords:[],paidBonuses:[],claimedFreeHints:[],progress:{level:1,found:['ELI'],bonuses:[],hinted:[],combo:1}});
const newProgress=stringify({...JSON.parse(oldProgress),level:2,unlocked:4,coins:455,points:50,completed:[0,1,2]});
const live=stringify({level:20,unlocked:24,coins:12000,completed:[0,1,2,3]});
const base={
 [W]:curWallet,[WB]:curWallet,
 [O]:stringify({version:1,owned:['seawheel']}),[OB]:stringify({version:1,owned:['seawheel']}),
 [T]:oldProgress,[FEEL]:stringify({music:true,sfx:true,musicVolume:75,sfxVolume:65}),
 [VOICE]:stringify({mode:'rotate',volume:68}),[LIVE]:live,
 'story-trails-synthetic-chapter':stringify({chapters:[0,1,2],points:30}),
 'unrelated-app-secret':'retain-this-exactly'
};
function env(seed={}){
 const data=new Map(Object.entries({...base,...seed})),events=[];
 const storage={
  get length(){return data.size},
  key:i=>[...data.keys()][i]??null,
  getItem:k=>data.has(k)?data.get(k):null,
  setItem:(k,v)=>{data.set(k,String(v));events.push(['set',k])},
  removeItem:k=>{data.delete(k);events.push(['remove',k])}
 };
 const window={},document={readyState:'loading',addEventListener:()=>{},getElementById:()=>null};
 const vmCtx=vm.createContext({window,localStorage:storage,document,
  location:{reload:()=>{}},setTimeout:()=>{},console});
 vm.runInContext(core,vmCtx,{timeout:5000,filename:'native-test-v2.js'});
 vm.runInContext(tx,vmCtx,{timeout:5000,filename:'unlinked-v7-transaction.js'});
 assert(window.BUPlatformSaves&&window.BUWTNativeFullBackupTransactionV7);
 const api=window.BUPlatformSaves;
 const locks={request:async(_key,{ifAvailable},cb)=>cb({name:'exclusive'})};
 const v7=window.BUWTNativeFullBackupTransactionV7.createForStorage(
  storage,locks,()=> '12345678-abcd-4abc-a123-123456789012'
 );
 return {data,events,storage,api,v7};
}
function candidate(api){
 const b=JSON.parse(JSON.stringify(api.makeBackup()));
 b.keys[W]=newWallet;b.keys[WB]=newWallet;
 b.keys[O]=stringify({version:1,owned:['goldwheel']});
 b.keys[OB]=stringify({version:1,owned:['goldwheel']});
 b.extensions.wordTrailsNext.state=newProgress;
 b.extensions.wordTrailsNext.feel=stringify({music:false,sfx:true,musicVolume:45,sfxVolume:62});
 return b;
}
let n=0;
const passed=label=>{n++;console.log('PASS_NATIVE_TRUSTED_PLAN_V27_'+n,label)};
(async()=>{
 const a=env(),doc=candidate(a.api);
 const snapshot=new Map(a.data),plan=a.api.previewRestoreWrites(doc);
 assert.equal(plan.valid,true);assert(plan.writes.length>2);
 assert.equal(plan.changes,plan.writes.length);
 assert.equal(plan.summary.testCoinsQuarantined,true);
 assert.equal(plan.liveWordTrailsExcluded,true);
 assert.equal(a.events.length,0,'Planning must not write localStorage');
 assert.deepEqual([...a.data],[...snapshot],'Planning must not mutate source record');
 passed('preview uses actual validated v2 backup and is fully read-only');
 for(const e of plan.writes){
  assert.equal(e.before,base[e.key]??null,'Incorrect native source value '+e.key);
  assert.equal(e.after===undefined,false,'Undefined target forbidden');
  assert.notEqual(e.key,LIVE);
  assert.notEqual(e.key,'unrelated-app-secret');
 }
 assert.equal(plan.writes.find(x=>x.key===T).after,newProgress);
 assert.equal(plan.writes.find(x=>x.key===W).after.includes('"coins":125'),true);
 passed('exact changed-key journal excludes LIVE, unrelated storage and source/target duplicates');
 const b=env(),sameDoc=candidate(b.api);
 const applied=b.api.applyBackup(sameDoc,{reload:false});
 assert.equal(applied.ok,true);
 for(const e of plan.writes){
  assert.equal(b.data.get(e.key)??null,e.after,'V2 applied value diverges from read-only plan '+e.key);
 }
 const changed=[...new Set(b.events.filter(e=>e[0]==='set'&&e[1]!=='bu-visual-lab-import-rollback-v2'&&e[1]!=='bu-visual-lab-import-committed-v2').map(e=>e[1]))];
 assert.deepEqual(changed.sort(),[...plan.writes].map(e=>e.key).sort(),'Planned vs actual v2 changed keys drifted');
 assert.equal(b.data.get(LIVE),live);
 passed('read-only preview EXACTLY matches real v2 restore results in fake storage');
 const ownership=JSON.parse(b.data.get(O)).owned;
 assert(ownership.includes('seawheel')&&ownership.includes('goldwheel'));
 const wallet=JSON.parse(b.data.get(W));
 assert.equal(wallet.coins,125);
 assert.equal(wallet.points,-99);
 assert(wallet.purchases.includes('seawheel')&&wallet.purchases.includes('goldwheel'));
 assert.equal(JSON.parse(b.data.get(T)).coins,455);
 passed('paid wheel union, native points and quarantined TEST coins preserved');
 const v7Draft=a.v7.preview(plan.writes.map(e=>({key:e.key,after:e.after})));
 assert.equal(v7Draft.ok,true);
 const result=await a.v7.apply({approved:true,backupConfirmed:true,plan:v7Draft.plan});
 assert.equal(result.ok,true);
 for(const [key,value] of b.data){
  assert.equal(a.data.get(key),value,'v7 journalled apply diverges from original v2 '+key);
 }
 assert.equal(a.data.get(LIVE),live);
 assert.equal(a.data.get(VOICE),base[VOICE]);
 passed('v7 cooperative consented transaction produces exactly same native TEST result');
 const noChange=a.api.previewRestoreWrites(doc);
 assert.equal(noChange.unchanged,true);
 assert.equal(noChange.changes,0);
 assert.equal(a.events.filter(x=>x[0]==='set'&&x[1]===W).length,1);
 passed('repeat restore is a no-op; no reward re-mint');
 const bad=JSON.parse(JSON.stringify(doc));bad.keys[LIVE]=stringify({level:0,completed:[]});
 assert.throws(()=>a.api.previewRestoreWrites(bad),/protected LIVE/);
 assert.equal(a.data.get(LIVE),live);
 passed('mixed-origin backup refused before write-planning');
 const wrong=JSON.parse(JSON.stringify(doc));wrong.extensions.wordTrailsNext.format='WordTrailsNextLIVE';
 assert.throws(()=>a.api.previewRestoreWrites(wrong),/Missing versioned/);
 passed('LIVE backup format is rejected by existing native validation');
 const broken=JSON.parse(JSON.stringify(doc));broken.keys[W]=stringify({coins:-4,points:10});
 assert.throws(()=>a.api.previewRestoreWrites(broken),/wallet in backup is invalid/);
 passed('negative Insight Tokens rejected by native validation before plan');
 const old=env({[JOURNAL]:null});
 // A legacy journal must be blocked when it exists after initial script load.
 old.storage.setItem(JOURNAL,stringify({version:1,previous:{[W]:curWallet}}));
 assert.throws(()=>old.api.previewRestoreWrites(candidate(old.api)),/recovery review/);
 assert.equal(old.data.get(W),curWallet);
 passed('unresolved legacy TEST journal prevents preparing another restore');
 const c=env(),p=c.api.previewRestoreWrites(candidate(c.api));
 c.storage.setItem(W,stringify({coins:2222,points:-3,purchases:['seawheel'],equippedWheel:'seawheel'}));
 const stale=await c.v7.apply({
  approved:true,backupConfirmed:true,
  plan:c.v7.preview(p.writes.map(e=>({key:e.key,after:e.after})).ok
   ?{format:'BibleUnfoldedFullBackupPlanV7',version:7,steps:p.writes}:{
      format:'BibleUnfoldedFullBackupPlanV7',version:7,steps:p.writes}
 });
 assert.equal(stale.reason,'preview-stale-no-writes');
 assert.equal(JSON.parse(c.data.get(W)).coins,2222);
 passed('later wallet update invalidates earlier read-only restore plan under v7 lock');
 assert.equal(a.data.get(LIVE),live);
 assert.equal(a.data.get('unrelated-app-secret'),'retain-this-exactly');
 passed('LIVE crossword and unrelated storage remain byte-identical');
 console.log('PASS_NATIVE_V27_RESTORE_PREVIEW_V7_PARITY',JSON.stringify({
  cases:n,realNativeRulesUsed:true,realTestBackupValidated:true,
  planHasZeroWrites:true,plannedNativeDiffMatchesV2:true,
  v7WriterParity:true,liveNeverIncluded:true,wheelEntitlementsUnioned:true,
  testCurrencyQuarantined:true,oldJournalBlocked:true,stalePlanRefused:true
 }));
})().catch(e=>{console.error('FAIL_NATIVE_V27_RESTORE_PREVIEW',e.stack||e);process.exitCode=1});

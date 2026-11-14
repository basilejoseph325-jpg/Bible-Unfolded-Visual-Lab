#!/usr/bin/env node
'use strict';
/* TEST native v2 restore/export cross-origin progress isolation regression.
 * Actual tested coordinator code executes ONLY against a fake VM localStorage.
 * Optional argv[2] is a pinned pre-patch source, proving former unsafe behavior.
 */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const patched=fs.readFileSync('bu-platform-saves-v2.js','utf8');
const T='bu-visual-lab-wordtrails-next-v1', L='bible-unfolded-word-trails-next-v1';
const W='bible-unfolded-rewards-v17', WB='bible-unfolded-rewards-v17-recovery-v3811';
const O='bible-unfolded-wheel-ownership-v3825', OB='bible-unfolded-wheel-ownership-v3825-backup';
const V='bible-unfolded-private-voice-pref-v381',FEEL='bu-wt-next-feel-v2';
const J='bu-visual-lab-import-rollback-v2';
const j=JSON.stringify;
const initialTest=j({level:1,unlocked:4,coins:65,points:30,completed:[0,1],sparks:[],claimedSparks:[],boardBible:[],paidWords:[],paidBonuses:[],claimedFreeHints:[],progress:{level:1,found:['ELI'],bonuses:[],hinted:[],combo:1}});
const importedTest=j({level:2,unlocked:5,coins:150,points:80,completed:[0,1,2],sparks:[],claimedSparks:[],boardBible:[],paidWords:[],paidBonuses:[],claimedFreeHints:[],progress:{level:2,found:['NOAH'],bonuses:[],hinted:[],combo:1}});
const live=j({level:8,completed:[0,1,2,3,4,5,6,7,8],coins:999,points:1099});
const stolenLive=j({level:1,completed:[0],coins:1,points:1});
const originalWallet=j({coins:700,points:-20,purchases:['seawheel'],equippedWheel:'seawheel'});
const newWallet=j({coins:150,points:-80,purchases:['goldwheel'],equippedWheel:'goldwheel'});
const baseline={
 [T]:initialTest,[L]:live,
 [W]:originalWallet,[WB]:originalWallet,
 [O]:j({version:1,owned:['seawheel']}),[OB]:j({version:1,owned:['seawheel']}),
 [V]:j({mode:'rotate',volume:65}),
 [FEEL]:j({music:true,sfx:true,musicVolume:75,sfxVolume:65}),
 'story-trails-synthetic-chapter':j({chapter:5,completed:[1,2,3]})
};
function fakeCoordinator(src,seed={}){
 const map=new Map(Object.entries({...baseline,...seed})),events=[];
 const storage={
  get length(){return map.size},
  key:i=>[...map.keys()][i]??null,
  getItem:k=>map.has(k)?map.get(k):null,
  setItem:(k,v)=>{events.push(['set',k]);map.set(k,String(v))},
  removeItem:k=>{events.push(['remove',k]);map.delete(k)}
 };
 const window={},document={readyState:'loading',addEventListener:()=>{},getElementById:()=>null};
 vm.runInNewContext(src,{window,localStorage:storage,document,
  location:{reload:()=>{}},setTimeout:()=>0,console},{timeout:5000});
 assert(window.BUPlatformSaves,'Native coordinator did not initialize');
 return {api:window.BUPlatformSaves,map,events};
}
function backupChanges(api){
 const c=JSON.parse(JSON.stringify(api.makeBackup()));
 c.keys[W]=newWallet;c.keys[WB]=newWallet;
 c.keys[O]=j({version:1,owned:['goldwheel']});
 c.keys[OB]=j({version:1,owned:['goldwheel']});
 c.extensions.wordTrailsNext.state=importedTest;
 return c;
}
function rejected(fn,reason){assert.throws(fn,undefined,reason)}
const unsafePath=process.argv[2];
if(unsafePath){
 const src=fs.readFileSync(unsafePath,'utf8'),buf=Buffer.from(src);
 const gitBlob=crypto.createHash('sha1').update('blob '+buf.length+'\0').update(buf).digest('hex');
 assert.equal(gitBlob,'94d5770d6a1745c5af284392dee6019b95ad69d7','Pin original problematic TEST save coordinator');
 const old=fakeCoordinator(src);
 const oldBackup=old.api.makeBackup();
 assert.equal(oldBackup.keys[L],live,'Old coordinator must reproduce LIVE crossword leakage into TEST JSON export');
 const forged=JSON.parse(JSON.stringify(oldBackup));
 forged.keys[L]=stolenLive;
 old.api.applyBackup(forged,{reload:false});
 assert.equal(old.map.get(L),stolenLive,'Old code must reproduce unauthorized LIVE-key overwrite via TEST import');
 console.log('PASS_NEGATIVE_TEST_NATIVE_V2_LIVE_KEY_BACKUP_LEAK_REPRODUCED',gitBlob);
}
let cases=0;
const pass=message=>{cases++;console.log('PASS_TEST_NATIVE_LIVE_KEY_ISOLATION_'+cases+' '+message)};
const current=fakeCoordinator(patched);
const beforeLive=current.map.get(L);
const exported=current.api.makeBackup();
assert.equal(exported.keys[L],undefined,'TEST v2 complete backup MUST NOT contain the LIVE crossword progress key');
assert.equal(exported.extensions.wordTrailsNext.format,'WordTrailsNextTEST');
assert.equal(exported.extensions.wordTrailsNext.state,initialTest);
assert.equal(exported.keys[W],originalWallet);
assert.equal(exported.keys[O],baseline[O]);
assert.equal(current.map.get(L),beforeLive);
assert.equal(current.events.length,0);
pass('TEST export excludes actual LIVE crossword key without deleting it');
const valid=backupChanges(current.api);
const review=current.api.dryRun(valid);
assert.equal(review.valid,true);assert.equal(review.testCoinsQuarantined,true);
assert.equal(review.incomingWordTrails.coins,150);
assert(review.preservedOwnedWheels.includes('seawheel')&&review.preservedOwnedWheels.includes('goldwheel'));
assert.equal(current.map.get(L),beforeLive);
pass('native v2 dry-run recognizes safe TEST-only backup and preserved purchased wheels');
const invalid=JSON.parse(JSON.stringify(valid));invalid.keys[L]=stolenLive;
rejected(()=>current.api.dryRun(invalid),'backup containing LIVE crossword key MUST be rejected');
assert.equal(current.map.get(L),beforeLive);
assert.equal(current.events.length,0);
pass('tampered or older TEST backup carrying LIVE crossword state refused before any mutation');
rejected(()=>current.api.applyBackup(invalid,{reload:false}),'applyBackup also refuses the same mixed-origin JSON');
assert.equal(current.events.length,0);
pass('rejected mixed backup did not start a native restore journal');
const copied=JSON.parse(JSON.stringify(valid));
copied.extensions.wordTrailsNext.format='WordTrailsNextLIVE';
rejected(()=>current.api.dryRun(copied),'LIVE extension format cannot be imported into TEST');
pass('strict LIVE vs TEST crossword format separation');
const ok=current.api.applyBackup(valid,{reload:false});
assert.equal(ok.ok,true);
assert.equal(current.map.get(L),live,'Actual existing LIVE crossword key must be byte-identical');
assert.equal(current.map.get(T),importedTest);
assert.equal(JSON.parse(current.map.get(W)).coins,150,'Insight Tokens came from backup native wallet, not TEST crossword coins');
assert.equal(JSON.parse(current.map.get(T)).coins,150);
assert(current.map.get(V)===baseline[V],'Voice settings unchanged');
for(const k of [O,OB]){
 const owned=JSON.parse(current.map.get(k)).owned;
 assert(owned.includes('seawheel')&&owned.includes('goldwheel'),'Purchased wheel entitlement lost');
}
assert(!current.map.has(J),'No journal left after successful restore');
pass('complete restore preserves LIVE progress/voices, unions owned wheels and quarantines TEST coins');
const retry=current.api.applyBackup(valid,{reload:false});
assert.equal(retry.unchanged,true);
assert.equal(current.map.get(L),live);
pass('repeated same backup does not mint rewards or overwrite LIVE crossword');
const negativeWallet=JSON.parse(JSON.stringify(valid));negativeWallet.keys[W]=j({coins:-3,points:2});
rejected(()=>current.api.dryRun(negativeWallet),'native invalid wallet blocked');
pass('invalid native wallet still rejected');
const negativeLevel=JSON.parse(JSON.stringify(valid));
negativeLevel.extensions.wordTrailsNext.state=j({...JSON.parse(importedTest),level:300});
rejected(()=>current.api.dryRun(negativeLevel),'invalid TEST level blocked');
pass('out-of-range TEST crossword progress still rejected');
const source=fakeCoordinator(patched);
assert(source.api.keys.TEST===T && source.api.version==='2.0.0-test');
assert.equal(source.map.get(L),live);
pass('native API and canonical TEST key retained without modifying LIVE key');
// A pre-upgrade TEST journal may have captured LIVE as a native key.
// After upgrade the loader must NOT auto-replay it over newer LIVE gameplay.
const oldJournal=j({version:1,previous:{[L]:live,[W]:originalWallet},createdAt:'2026-11-13T10:00:00Z'});
const legacy=fakeCoordinator(patched,{[J]:oldJournal,[L]:stolenLive});
assert.equal(legacy.map.get(L),stolenLive,'No auto-rollback of an ambiguous LIVE save');
assert.equal(legacy.map.get(J),oldJournal,'Retain unresolved journal for deliberate human review');
assert.equal(legacy.api.recoverPending().recovered,false);
assert.match(legacy.api.recoverPending().error,/Automatic rollback is stopped/);
assert.equal(legacy.map.get(W),originalWallet);
pass('legacy cross-origin journal is quarantined rather than silently rolling back LIVE data');
console.log('PASS_TEST_NATIVE_V2_LIVE_KEY_LEAK_ISOLATION',JSON.stringify({
 cases,leakedLiveInTestExport:false,importMixedOriginRejected:true,
 testRestored:true,originalLiveUnchanged:true,paidWheelsUnionPreserved:true,
 voiceUntouched:true,noExtraWalletMint:true,realPlayerDataAccessed:false
}));

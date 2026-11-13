#!/usr/bin/env node
'use strict';
/* Real Chromium two-tab Web Locks + Word Trails backup/rollback v3.
 * Fresh isolated CI browser profile, synthetic keys only. Never published
 * LIVE or user browser data, and never wires checkpoint into the real game. */
const assert=require('node:assert/strict');
const puppeteer=require('puppeteer-core');
const {execSync}=require('node:child_process');
const executablePath=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const url='http://127.0.0.1:8898/experiments/word-trails-progress-transfer-demo-v1.html';
const TEST='bu-visual-lab-wordtrails-next-v1',LIVE='bible-unfolded-word-trails-next-v1';
const WALLET='bible-unfolded-rewards-v17',OWNED='bible-unfolded-wheel-ownership-v3825-backup',VOICE='bible-unfolded-private-voice-pref-v381';
const fixture={level:3,unlocked:5,coins:8888,points:444,
 completed:[0,1,2,3],sparks:[0],claimedSparks:['0:ABEL'],
 boardBible:[],paidWords:[],paidBonuses:['1|ELI'],
 claimedFreeHints:[0],sound:true,progress:{level:3,found:['ELI'],bonuses:[],hinted:[],combo:2}};
const native={
 [WALLET]:JSON.stringify({coins:777,points:-20,purchases:['seawheel'],equippedWheel:'seawheel'}),
 [OWNED]:JSON.stringify({owned:['seawheel']}),
 [VOICE]:JSON.stringify({mode:'off',volume:35})
};
(async()=>{
 const browser=await puppeteer.launch({headless:true,executablePath,args:[
  '--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--disable-gpu'],
  timeout:90000,protocolTimeout:120000});
 try{
 const ctx=await browser.createBrowserContext();
 const a=await ctx.newPage(),b=await ctx.newPage(),errors=[];
 for(const p of [a,b]){
  p.setDefaultTimeout(35000);
  p.on('pageerror',e=>errors.push(e.message));
  await p.setViewport({width:390,height:705,deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await p.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  await p.waitForFunction(()=>document.documentElement.dataset.wtRehearsalReady==='yes');
  await p.addScriptTag({path:'experiments/word-trails-exclusive-consent-boundary-v2.js'});
  await p.addScriptTag({path:'experiments/word-trails-recovery-checkpoint-candidate-v3.js'});
 }
 await a.evaluate(({test,raw,native})=>{
  localStorage.setItem(test,raw);
  for(const [k,v] of Object.entries(native))localStorage.setItem(k,v);
 },{test:TEST,raw:JSON.stringify(fixture),native});
 const p=await a.evaluate(()=>{
  window.__v3=window.BUWTRecoveryCheckpointCandidateV3.createForStorage(localStorage,navigator.locks);
  const preview=window.__v3.preview();
  return {available:preview.available,completed:preview.completedCount,
   unlocked:preview.unlockedLevels,raw:window.__v3.exportCheckpoint(preview.checkpoint)};
 });
 assert.equal(p.available,true);
 assert.equal(p.completed,4);
 assert.equal(p.unlocked,6);
 assert(p.raw&&p.raw.length>100);
 assert(!p.raw.includes('bible-unfolded-rewards-v17'),'Export contains no native wallet keys');
 const withoutBackup=await a.evaluate(raw=>window.__v3.apply({
  approved:true,checkpoint:raw,backupConfirmed:false
 }),p.raw);
 assert.equal(withoutBackup.reason,'consent-and-backup-required');
 assert.equal(await a.evaluate(k=>localStorage.getItem(k),LIVE),null);

 const applied=await a.evaluate(raw=>window.__v3.apply({
  approved:true,checkpoint:raw,backupConfirmed:true
 }),p.raw);
 assert.equal(applied.ok,true);
 assert.equal(applied.via,'exclusive-browser-lock-v2');
 const target=await b.evaluate(k=>localStorage.getItem(k),LIVE);
 assert(target&&JSON.parse(target).completed.length===4);
 assert.equal(JSON.parse(target).coins,60);
 assert.equal(JSON.parse(target).points,0);

 // The other tab advances progress. A previous backup MUST NOT erase it.
 await b.evaluate(k=>{
  const obj=JSON.parse(localStorage.getItem(k));
  obj.completed.push(4);obj.level=4;localStorage.setItem(k,JSON.stringify(obj));
 },LIVE);
 const declined=await a.evaluate(raw=>window.__v3.rollback({approved:true,checkpoint:raw}),p.raw);
 assert.equal(declined.reason,'live-progress-has-changed');
 assert.equal(JSON.parse(await b.evaluate(k=>localStorage.getItem(k),LIVE)).completed.length,5);

 // Restore only the synthetic exact-import value, then hold the real browser
 // lock from tab B; tab A must fail closed instead of deleting.
 await b.evaluate(({key,value})=>localStorage.setItem(key,value),{key:LIVE,value:target});
 await b.evaluate(name=>{
  window.__qaHeld=false;window.__qaRelease=null;window.__qaReleased=false;
  navigator.locks.request(name,{mode:'exclusive'},async()=>{
   window.__qaHeld=true;
   await new Promise(resolve=>{window.__qaRelease=resolve});
   window.__qaReleased=true;
  }).catch(e=>{window.__qaLockError=String(e)});
  return true;
 },'bible-unfolded-word-trails-progress-import-exclusive-v2');
 await b.waitForFunction(()=>window.__qaHeld===true,{timeout:20000});
 const blocked=await a.evaluate(raw=>window.__v3.rollback({approved:true,checkpoint:raw}),p.raw);
 assert.equal(blocked.reason,'another-transfer-in-progress');
 assert.equal(await a.evaluate(k=>localStorage.getItem(k),LIVE),target,'Busy lock may not mutate progress');
 await b.evaluate(()=>{window.__qaRelease();return true});
 await b.waitForFunction(()=>window.__qaReleased===true,{timeout:20000});

 // TEST puzzle progress may have advanced; rollback remains possible from the
 // private checkpoint only if LIVE target is still exactly the import result.
 await b.evaluate(k=>{
  const original=JSON.parse(localStorage.getItem(k));original.level=5;
  localStorage.setItem(k,JSON.stringify(original));
 },TEST);
 const removed=await a.evaluate(raw=>window.__v3.rollback({approved:true,checkpoint:raw}),p.raw);
 assert.equal(removed.ok,true);
 assert.equal(removed.removedOnlyImportedCrossword,true);
 assert.equal(await b.evaluate(k=>localStorage.getItem(k),LIVE),null);
 assert.equal(JSON.parse(await b.evaluate(k=>localStorage.getItem(k),TEST)).level,5);

 const shared=await a.evaluate(keys=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)])),
  Object.keys(native));
 for(const [k,v] of Object.entries(native))assert.equal(shared[k],v,'Must preserve genuine native key: '+k);
 assert.deepEqual(errors,[],'No page errors in either tab');
 console.log('PASS_WORD_TRAILS_RECOVERY_V3_REAL_BROWSER',JSON.stringify({
  tabs:2,nativeWebLocks:true,explicitBackupRequired:true,
  importedWordTrailsCount:4,unownedTestCoinsQuarantined:true,
  newerGameplayProtected:true,heldLockRefused:true,
  checkpointRollbackOnlyImportedCrossword:true,
  sharedWalletAndPaidWheelsAndVoiceUnchanged:true,zeroPageErrors:true}));
 await ctx.close();
 }finally{await browser.close()}
})().catch(e=>{console.error('FAIL_WORD_TRAILS_RECOVERY_V3_REAL_BROWSER',e.stack||e);process.exitCode=1});

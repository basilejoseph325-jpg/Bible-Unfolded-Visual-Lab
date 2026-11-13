#!/usr/bin/env node
'use strict';
/* Browser proof: a stale UNCOOPERATIVE LIVE autoimport script can silently
 * recreate a crossword key after a newer consented import is rolled back.
 * This is a NEGATIVE safety test documenting a release blocker, not a fix.
 * Both tabs run only on a local TEST web server with synthetic browser data.
 * The pinned LIVE source is fetched read-only; no LIVE deployment/user data.
 */
const puppeteer=require('puppeteer-core'),assert=require('node:assert/strict');
const fs=require('node:fs'),crypto=require('node:crypto');
const {execSync}=require('node:child_process');
const chrome=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const old=fs.readFileSync(process.argv[2]||'/tmp/bu-wordtrails-pinned-live-importer-v1.js','utf8');
const oldHash='52d0a564a16a964daf70e156e46e7d7866480c81';
const buf=Buffer.from(old,'utf8');
assert.equal(crypto.createHash('sha1').update('blob '+buf.length+'\0').update(buf).digest('hex'),oldHash);
const shim=fs.readFileSync('experiments/word-trails-legacy-autoimport-retirement-shim-v4.js','utf8');
const origin='http://127.0.0.1:8894/experiments/word-trails-checkpoint-rehearsal-v2.html';
const TEST='bu-visual-lab-wordtrails-next-v1',LIVE='bible-unfolded-word-trails-next-v1';
const WALLET='bible-unfolded-rewards-v17',WHEELS='bible-unfolded-wheel-ownership-v3825-backup',VOICE='bible-unfolded-private-voice-pref-v381';
const data={
 [TEST]:JSON.stringify({level:1,unlocked:4,coins:8977,points:212,
  completed:[0,1,2],sparks:[0],claimedSparks:['0:ABEL'],boardBible:[],paidWords:[],
  paidBonuses:['0|ART'],claimedFreeHints:[0],sound:true,
  progress:{level:1,found:['ELI'],bonuses:[],hinted:[],combo:1}}),
 [WALLET]:JSON.stringify({coins:826,points:-30,purchases:['seawheel'],equippedWheel:'seawheel'}),
 [WHEELS]:JSON.stringify({owned:['seawheel']}),
 [VOICE]:JSON.stringify({mode:'rotate',volume:65}),
 'bu-stale-tab-audit-sentinel':'original'
};
const protectedKeys=[TEST,WALLET,WHEELS,VOICE,'bu-stale-tab-audit-sentinel'];
(async()=>{
 const browser=await puppeteer.launch({headless:true,executablePath:chrome,args:[
  '--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--disable-gpu'],
  timeout:90000,protocolTimeout:120000});
 try{
 for(const [width,height] of [[390,705],[320,568]]){
  const ctx=await browser.createBrowserContext();
  const a=await ctx.newPage(),b=await ctx.newPage(),errors=[];
  for(const page of [a,b]){
   page.on('pageerror',e=>errors.push(e.message));
   await page.setViewport({width,height,isMobile:true,hasTouch:true,deviceScaleFactor:2});
   await page.goto(origin,{waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForFunction(()=>document.documentElement.dataset.wtCheckpointRehearsalReady==='yes',{timeout:45000});
  }
  await a.evaluate(values=>{
   for(const [k,v] of Object.entries(values))localStorage.setItem(k,v);
  },data);
  // New opt-in scripts do not load against LIVE; manually load inert v4
  // candidate only in fresh isolated CI browser (and keep sample UI fake).
  await a.addScriptTag({path:'experiments/word-trails-live-migration-consent-gate-v4.js'});
  const preview=await a.evaluate(()=>{
   window.__qaGate=window.BUWTLiveConsentMigrationGateV4.createForBrowser();
   return window.__qaGate.preview();
  });
  assert(preview.available&&preview.completedCount===3);
  const checkpoint=await a.evaluate(p=>window.__qaGate.exportCheckpoint(p.checkpoint),preview);
  assert(checkpoint);
  let result=await a.evaluate(c=>window.__qaGate.applyWithConfirmedBackup({
   approved:true,backupConfirmed:true,checkpoint:c
  }),checkpoint);
  assert.equal(result.ok,true,'Synthetic opted-in import should succeed with native Web Locks');
  const imported=await b.evaluate(k=>localStorage.getItem(k),LIVE);
  assert.equal(JSON.parse(imported).migration.version,2);
  result=await a.evaluate(c=>window.__qaGate.rollbackWithApproval({
   approved:true,checkpoint:c
  }),checkpoint);
  assert.equal(result.ok,true,'Synthetic opt-in rollback should be permitted before newer progress');
  assert.equal(await a.evaluate(k=>localStorage.getItem(k),LIVE),null);
  // Simulate an OLD/CACHED LIVE script executing from an already-open tab.
  // The old source does not take the v2 Web Lock and doesn't ask permission.
  await b.addScriptTag({content:old});
  const resurrected=await a.evaluate(k=>localStorage.getItem(k),LIVE);
  assert(resurrected,'STALE LEGACY RISK: old script SILENTLY REIMPORTS after consented rollback');
  assert.equal(JSON.parse(resurrected).migration.version,1);
  // The new rollback must refuse to delete an unexpected different value,
  // even if the old script recreated the same completed crossword levels.
  result=await a.evaluate(c=>window.__qaGate.rollbackWithApproval({
   approved:true,checkpoint:c
  }),checkpoint);
  assert.equal(result.reason,'live-progress-has-changed','Must preserve unrecognized new state');
  assert.equal(await b.evaluate(k=>localStorage.getItem(k),LIVE),resurrected);
  // Reset only synthetic fixture for comparison (NOT a recommended user step).
  await a.evaluate(k=>localStorage.removeItem(k),LIVE);
  const c=await ctx.newPage();
  await c.goto(origin,{waitUntil:'domcontentloaded',timeout:60000});
  await c.waitForFunction(()=>document.documentElement.dataset.wtCheckpointRehearsalReady==='yes');
  await c.addScriptTag({content:shim});
  assert.equal(await c.evaluate(k=>localStorage.getItem(k),LIVE),null,
   'Future replacement of legacy JS address is inert for a newly fetched script');
  assert.equal(await c.evaluate(()=>window.BUWTLegacyAutoImportRetiredV4?.disabled),true);
  for(const key of protectedKeys){
   const value=await a.evaluate(k=>localStorage.getItem(k),key);
   assert.equal(value,data[key],'Shared or TEST progress record touched: '+key);
  }
  assert.deepEqual(errors,[],'No page errors in the synthetic old-tab experiment');
  console.log('PASS_WORD_TRAILS_STALE_TAB_RACE_V5',JSON.stringify({
   viewport:width+'x'+height,
   oldLiveSourcePinned:oldHash,oldRunningTabCanSilentlyReimportAfterRollback:true,
   realConsentRollbackDidNotEraseRecreatedOldState:true,
   futureFreshShimRefusedImport:true,nativeWalletWheelsVoiceAndTestSaveUnchanged:true,
   liveUnaffected:true,releaseBlockedOnCachedScripts:true
  }));
  await ctx.close();
 }
 }finally{await browser.close()}
})().catch(e=>{console.error('FAIL_WORD_TRAILS_STALE_TAB_RACE_V5',e.stack||e);process.exitCode=1});

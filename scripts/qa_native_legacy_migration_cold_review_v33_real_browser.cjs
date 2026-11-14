#!/usr/bin/env node
'use strict';
/* v33: exercise EXACT pinned LIVE migration on two ACTUAL same-origin browser
 * documents, plus first-visit and post-migration cold TEST startup reviews.
 * Fresh fictional isolated Chromium profiles only. NEVER opens LIVE website.
 * Usage: node this.cjs /tmp/pinned-original-live-migration-v1.js
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const puppeteer=require('puppeteer-core'),{execSync}=require('node:child_process');
const chrome=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const original=fs.readFileSync(process.argv[2],'utf8'),bytes=Buffer.from(original);
const blob=crypto.createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
assert.equal(blob,'52d0a564a16a964daf70e156e46e7d7866480c81',
 'Original protected LIVE migrator must be pinned; never test an unverified clone');
const ROOT=process.env.BU_TEST_ORIGIN||'http://127.0.0.1:8897';
const LIVE='bible-unfolded-word-trails-next-v1',TEST='bu-visual-lab-wordtrails-next-v1';
const testState=JSON.stringify({level:1,unlocked:2,coins:35,points:11,completed:[0],
 sparks:[],claimedSparks:[],boardBible:[],paidWords:[],paidBonuses:[],
 claimedFreeHints:[],progress:{level:1,found:['ELI'],bonuses:[],hinted:[],combo:1}});
(async()=>{
 const browser=await puppeteer.launch({executablePath:chrome,headless:true,timeout:90000,
  protocolTimeout:120000,args:['--no-sandbox','--disable-setuid-sandbox',
   '--disable-dev-shm-usage','--disable-gpu']});
 try{
  for(const [width,height] of [[390,705],[320,568]]){
   const context=await browser.createBrowserContext();
   const a=await context.newPage(),errors=[];
   await a.bringToFront();
   a.on('pageerror',e=>errors.push(e.message));
   await a.setViewport({width,height,isMobile:true,hasTouch:true,deviceScaleFactor:2});
   await a.goto(ROOT+'/index.html?qa-cold-legacy-v33='+width,
    {waitUntil:'domcontentloaded',timeout:120000});
   await a.waitForFunction(()=>window.BUPlatformSaves?.bound?.()&&
     typeof window.BUPlatformSaves?.legacyTransitionStatus==='function',
    {timeout:90000});
   await a.evaluate(({LIVE,TEST,testState})=>{
    localStorage.removeItem(LIVE);
    localStorage.setItem(TEST,testState);
   },{LIVE,TEST,testState});
   await a.reload({waitUntil:'domcontentloaded',timeout:120000});
   await a.waitForFunction(()=>window.BUPlatformSaves?.bound?.()&&
      window.BUPlatformSaves.legacyTransitionStatus().oldImporterCouldRecreateMissingLive===true,
    {timeout:90000});
   const first=await a.evaluate(({LIVE,TEST})=>{
    const state=window.BUPlatformSaves.legacyTransitionStatus();
    const panel=document.getElementById('bu-wt-legacy-transition-review');
    return {state,hasPanel:!!panel,copy:panel?.textContent||'',
     live:localStorage.getItem(LIVE),test:localStorage.getItem(TEST),
     nativeSettings:!!document.getElementById('save-file')};
   },{LIVE,TEST});
   assert(first.state.oldImporterCouldRecreateMissingLive&&first.hasPanel);
   assert(!first.state.oldMigrationMarkerPresent);
   assert.equal(first.live,null);
   assert.equal(first.test,testState);
   assert(first.copy.includes('could recreate a LIVE crossword save'));
   assert(first.nativeSettings);
   // B is a blank/404 page on the SAME origin, with no game controllers.
   // Inject the EXACT pinned protected original LIVE migrator into B.
   const b=await context.newPage();
   await b.bringToFront();
   await b.goto(ROOT+'/qa-empty-old-live-page-v33.html',
    {waitUntil:'domcontentloaded',timeout:30000});
   await b.addScriptTag({content:original});
   const made=await b.evaluate(({LIVE,TEST})=>({
    live:localStorage.getItem(LIVE),test:localStorage.getItem(TEST)
   }),{LIVE,TEST});
   const liveData=JSON.parse(made.live||'null');
   assert(liveData&&liveData.migration?.version===1);
   assert.equal(liveData.migration.source,'Visual Lab crossword progress');
   assert.equal(liveData.coins,60);
   assert.equal(liveData.points,0);
   assert.equal(made.test,testState);
   await a.bringToFront();
   await a.waitForFunction(()=>window.BUPlatformSaves?.externalChangeStatus().oldLiveMigrationObserved===true&&
    window.BUPlatformSaves?.legacyTransitionStatus().oldMigrationMarkerPresent===true,
    {timeout:45000,polling:100});
   const changed=await a.evaluate(({LIVE,TEST})=>{
    const native=window.BUPlatformSaves;
    const panel=document.getElementById('bu-wt-legacy-transition-review');
    const external=document.getElementById('bu-wt-external-page-review');
    let rejected='';
    try{native.applyBackup(native.makeBackup(),{reload:false})}
    catch(e){rejected=String(e.message||e)}
    return {live:localStorage.getItem(LIVE),test:localStorage.getItem(TEST),
     marker:native.legacyTransitionStatus().oldMigrationMarkerPresent,
     panelCopy:panel?.textContent||'',otherPageNotice:!!external,
     rejected,exportLive:native.makeBackup().keys[LIVE]!==undefined};
   },{LIVE,TEST});
   assert.equal(changed.live,made.live);
   assert.equal(changed.test,testState);
   assert(changed.marker&&changed.otherPageNotice);
   assert(changed.panelCopy.includes('past migration data'));
   assert(!changed.panelCopy.includes('LIVE crossword progress is missing'));
   assert(changed.rejected.includes('Another Bible Unfolded page or frame'));
   assert.equal(changed.exportLive,false);
   // Test the case that v32 alone could not see: old LIVE migration took
   // place BEFORE the next TEST session began. No storage event is required.
   await b.close();
   await a.reload({waitUntil:'domcontentloaded',timeout:120000});
   await a.waitForFunction(()=>window.BUPlatformSaves?.bound?.()&&
     window.BUPlatformSaves.legacyTransitionStatus().oldMigrationMarkerPresent===true,
    {timeout:90000});
   const cold=await a.evaluate(({LIVE,TEST})=>({
    state:window.BUPlatformSaves.legacyTransitionStatus(),
    panel:document.getElementById('bu-wt-legacy-transition-review')?.textContent||'',
    live:localStorage.getItem(LIVE),test:localStorage.getItem(TEST)
   }),{LIVE,TEST});
   assert(cold.state.oldMigrationMarkerPresent);
   assert(!cold.state.oldImporterCouldRecreateMissingLive);
   assert(cold.panel.includes('past migration data'));
   assert.equal(cold.live,made.live);
   assert.equal(cold.test,testState);
   assert.deepEqual(errors,[]);
   console.log('PASS_NATIVE_LEGACY_COLD_REVIEW_V33_REAL_TWO_PAGES',
    JSON.stringify({viewport:width+'x'+height,publishedTest:ROOT.startsWith('https://'),
     actualOriginalProtectedLiveScript:true,firstVisitRisk:true,
     oldLiveSourceRecreatedLiveFromTest:true,liveSourceExcludeTestCoins:true,
     liveMigrationStorageEventObserved:true,
     coldPostMigrationReviewWithoutEvent:true,nativeImportStoppedOnOtherPageWrite:true,
     noRealPlayerStorage:true,liveRepoUnmodified:true,pageErrors:0}));
   await context.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error('FAIL_NATIVE_LEGACY_COLD_REVIEW_V33_REAL',e.stack||e);process.exitCode=1});

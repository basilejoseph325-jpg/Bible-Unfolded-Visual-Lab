#!/usr/bin/env node
'use strict';
/* Browser proof for UNLINKED v7 native full-backup transaction candidate.
 * Two genuinely same-origin tabs using Chromium native navigator.locks.
 * Synthetic fresh isolated browser storage ONLY; no real user or LIVE saves.
 */
const assert=require('node:assert/strict');
const puppeteer=require('puppeteer-core');
const {execSync}=require('node:child_process');
const chrome=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const ROOT='http://127.0.0.1:8898/experiments/word-trails-checkpoint-rehearsal-v2.html';
const MODULE='experiments/word-trails-native-full-backup-transaction-v7.js';
const W='bible-unfolded-rewards-v17';
const P='bu-visual-lab-wordtrails-next-v1';
const VOICE='bible-unfolded-private-voice-pref-v381';
const WHEELS='bible-unfolded-wheel-ownership-v3825';
const LIVE='bible-unfolded-word-trails-next-v1';
const JOURNAL='bu-visual-lab-import-transaction-v7';
const initial={
 [W]:JSON.stringify({coins:777,points:20,purchases:['seawheel'],equippedWheel:'seawheel'}),
 [P]:JSON.stringify({level:1,coins:50,completed:[0]}),
 [VOICE]:JSON.stringify({mode:'rotate',volume:40}),
 [WHEELS]:JSON.stringify({owned:['seawheel']}),
 [LIVE]:JSON.stringify({level:10,completed:[0,1,2,3,4,5,6,7,8,9]})
};
(async()=>{
 const browser=await puppeteer.launch({headless:true,executablePath:chrome,args:[
  '--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--disable-gpu'],
  timeout:90000,protocolTimeout:120000});
 try{
  for(const [width,height] of [[390,705],[320,568]]){
   const ctx=await browser.createBrowserContext();
   const a=await ctx.newPage(),b=await ctx.newPage();
   const errors=[];
   for(const page of [a,b]){
    page.on('pageerror',error=>errors.push(error.message));
    await page.setViewport({width,height,isMobile:true,hasTouch:true,deviceScaleFactor:2});
    await page.goto(ROOT,{waitUntil:'domcontentloaded',timeout:60000});
    await page.addScriptTag({path:MODULE});
    await page.evaluate(()=>{window.__tx=window.BUWTNativeFullBackupTransactionV7.createForStorage(
     localStorage,navigator.locks,()=>crypto.randomUUID()
    )});
   }
   assert.equal(await a.evaluate(()=>window.isSecureContext),true);
   assert.equal(await b.evaluate(()=>typeof navigator.locks?.request),'function');
   await a.evaluate(v=>Object.entries(v).forEach(([k,s])=>localStorage.setItem(k,s)),initial);
   const afterWallet=JSON.stringify({coins:300,points:30,purchases:['seawheel'],equippedWheel:'seawheel'});
   const afterPuzzle=JSON.stringify({level:4,coins:30,completed:[0,1,2,3]});
   const preview=await b.evaluate(([W,P,nextWallet,nextPuzzle])=>
    window.__tx.preview([{key:W,after:nextWallet},{key:P,after:nextPuzzle}]),
     [W,P,afterWallet,afterPuzzle]);
   assert.equal(preview.ok,true);
   // A holds the lock while B attempts the first proposed restore.
   await a.evaluate(()=>{
    window.__qaHeld=false;
    window.__qaHold=navigator.locks.request(
     'bible-unfolded-full-backup-recovery-exclusive-v3',
     {mode:'exclusive'},lock=>{
      window.__qaHeld=true;
      return new Promise(resolve=>window.__qaRelease=resolve);
     });
   });
   await a.waitForFunction(()=>window.__qaHeld===true,{timeout:15000});
   const refused=await b.evaluate(p=>window.__tx.apply({
    approved:true,backupConfirmed:true,plan:p
   }),preview.plan);
   assert.equal(refused.reason,'another-restore-in-progress');
   assert.equal(await b.evaluate(k=>localStorage.getItem(k),W),initial[W]);
   await a.evaluate(()=>window.__qaRelease());
   await a.evaluate(()=>window.__qaHold);
   const granted=await b.evaluate(p=>window.__tx.apply({
    approved:true,backupConfirmed:true,plan:p
   }),preview.plan);
   assert.equal(granted.ok,true);
   assert.equal(await a.evaluate(k=>localStorage.getItem(k),W),afterWallet);
   assert.equal(await a.evaluate(k=>localStorage.getItem(k),P),afterPuzzle);
   assert.equal(await a.evaluate(k=>localStorage.getItem(k),VOICE),initial[VOICE]);
   assert.equal(await a.evaluate(k=>localStorage.getItem(k),WHEELS),initial[WHEELS]);
   assert.equal(await a.evaluate(k=>localStorage.getItem(k),LIVE),initial[LIVE]);
   assert.equal(await a.evaluate(k=>localStorage.getItem(k),JOURNAL),null);
   // Demonstrate a later tab can change native wallet; an interrupted
   // older restore must detect the conflict, never undo the newer value.
   const j=JSON.stringify({format:'BibleUnfoldedFullBackupTransactionV7',
    version:7,id:'aaaaaaa1-abcd-4abc-b111-123456789012',
    steps:[{key:W,before:initial[W],after:afterWallet},
           {key:P,before:initial[P],after:afterPuzzle}]});
   await a.evaluate(([J,record])=>localStorage.setItem(J,record),[JOURNAL,j]);
   const newWallet=JSON.stringify({coins:999,points:45,purchases:['seawheel'],equippedWheel:'seawheel'});
   await a.evaluate(([k,v])=>localStorage.setItem(k,v),[W,newWallet]);
   const observed=await b.evaluate(()=>window.__tx.inspect());
   assert.equal(observed.reason,'concurrent-writer-conflict');
   const protectedState=await b.evaluate(()=>window.__tx.recover({
    approved:true,backupConfirmed:true
   }));
   assert.equal(protectedState.ok,false);
   assert.equal(await a.evaluate(k=>localStorage.getItem(k),W),newWallet);
   assert.equal(await a.evaluate(k=>localStorage.getItem(k),JOURNAL),j);
   assert.equal(await a.evaluate(k=>localStorage.getItem(k),VOICE),initial[VOICE]);
   assert.deepEqual(errors,[]);
   console.log('PASS_WORD_TRAILS_NATIVE_BACKUP_TRANSACTION_V7_TWO_TAB_BROWSER',JSON.stringify({
    viewport:width+'x'+height,
    trueSameOriginWebLocks:true,
    heldLockRejectedSecondTab:true,
    consentedExclusiveImportSuccess:true,
    concurrentNewWalletRefusedRollback:true,
    paidWheelAndVoiceUntouched:true,
    existingLiveCrosswordUntouched:true,
    noPageExceptions:true,
    syntheticBrowserOnly:true
   }));
   await ctx.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error('FAIL_WORD_TRAILS_NATIVE_BACKUP_TRANSACTION_V7_TWO_TAB_BROWSER',e.stack||e);process.exitCode=1});

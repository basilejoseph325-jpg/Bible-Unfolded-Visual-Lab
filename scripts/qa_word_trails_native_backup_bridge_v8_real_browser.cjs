#!/usr/bin/env node
'use strict';
/* TEST v8 integration in TWO same-origin real Chromium tabs with actual
 * navigator.locks and disposable synthetic browser storage ONLY.
 * Also reproduce the PINNED uncooperative old LIVE autoimport under a held
 * v7 lock, to prevent any claim that cooperative locking fixes old tabs.
 * No real user browser or LIVE repository is accessed or changed.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const puppeteer=require('puppeteer-core');
const {execSync}=require('node:child_process');
const executablePath=execSync('command -v google-chrome || command -v chromium',
 {encoding:'utf8'}).trim();
const PINNED='52d0a564a16a964daf70e156e46e7d7866480c81';
const oldSource=fs.readFileSync(process.argv[2]||'/tmp/wt-v8-pinned-live-importer.js','utf8');
const buf=Buffer.from(oldSource,'utf8');
assert.equal(crypto.createHash('sha1').update('blob '+buf.length+'\0').update(buf).digest('hex'),
 PINNED,'Stop: original LIVE source no longer matches protected audit');
const ROOT='http://127.0.0.1:8899/experiments/word-trails-checkpoint-rehearsal-v2.html';
const W='bible-unfolded-rewards-v17',WB='bible-unfolded-rewards-v17-recovery-v3811';
const O='bible-unfolded-wheel-ownership-v3825';
const OB='bible-unfolded-wheel-ownership-v3825-backup';
const VOICE='bible-unfolded-private-voice-pref-v381';
const T='bu-visual-lab-wordtrails-next-v1',LIVE='bible-unfolded-word-trails-next-v1';
const J='bu-visual-lab-import-transaction-v7';
const LOCK='bible-unfolded-full-backup-recovery-exclusive-v3';
const progress={level:2,unlocked:4,coins:1300,points:170,completed:[0,1,2],
 sparks:[0],claimedSparks:['0:ABEL'],boardBible:[],paidWords:[],
 paidBonuses:['0|ART'],claimedFreeHints:[0],sound:true,
 progress:{level:2,found:['ELI'],bonuses:[],hinted:[],combo:1}};
const wallet=JSON.stringify({coins:750,points:65,purchases:['seawheel'],equippedWheel:'seawheel'});
const native={
 [W]:wallet,[WB]:wallet,[O]:JSON.stringify({version:1,owned:['seawheel']}),
 [OB]:JSON.stringify({version:1,owned:['seawheel']}),
 [VOICE]:JSON.stringify({mode:'off',volume:41}),
 [T]:JSON.stringify(progress),
 [LIVE]:JSON.stringify({level:9,unlocked:10,coins:51,completed:[0,1,2,3]}),
 'story-trails-synthetic-chapter':JSON.stringify({chapter:3,completed:[0,1,2]})
};
const keys=Object.keys(native);
const launch=async(browser,width,height)=>{
 const ctx=await browser.createBrowserContext(),a=await ctx.newPage(),b=await ctx.newPage();
 const errors=[];
 for(const page of [a,b]){
  page.on('pageerror',err=>errors.push(err.message));
  await page.setViewport({width,height,isMobile:true,hasTouch:true,deviceScaleFactor:2});
  await page.goto(ROOT,{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(
   ()=>document.documentElement.dataset.wtCheckpointRehearsalReady==='yes',
   {timeout:45000});
 }
 return {ctx,a,b,errors};
};
async function hold(page){
 await page.bringToFront();
 await page.evaluate(name=>{
  window.__qaHeld=false;window.__qaError=null;window.__qaRelease=null;
  window.__qaLockPromise=navigator.locks.request(name,{mode:'exclusive'},
   async()=>{
    window.__qaHeld=true;
    await new Promise(resolve=>{window.__qaRelease=resolve});
   }).catch(e=>{window.__qaError=String(e)});
  return true;
 },LOCK);
 await page.waitForFunction(()=>window.__qaHeld===true||!!window.__qaError,
  {timeout:35000,polling:100});
 const state=await page.evaluate(()=>({held:window.__qaHeld,error:window.__qaError}));
 assert.equal(state.error,null,'Native Web Lock failed: '+state.error);
 assert.equal(state.held,true,'Browser never acquired actual exclusive lock');
}
async function release(page){
 await page.evaluate(()=>{if(!window.__qaRelease)throw Error('Missing release');window.__qaRelease()});
 await page.evaluate(()=>window.__qaLockPromise);
}
(async()=>{
 const browser=await puppeteer.launch({headless:true,executablePath,
  args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--disable-gpu'],
  timeout:90000,protocolTimeout:120000});
 try{
  for(const [width,height] of [[390,705],[320,568]]){
   const {ctx,a,b,errors}=await launch(browser,width,height);
   try{
    // The browser storage is fictional and exists only inside a brand-new CI context.
    await a.evaluate(fixture=>Object.entries(fixture).forEach(([k,v])=>
     localStorage.setItem(k,v)),native);
    await b.bringToFront();
    await b.waitForFunction(([key,value])=>localStorage.getItem(key)===value,
     {timeout:30000,polling:100},[W,native[W]]);
    for(const modulePath of ['bu-platform-saves-v2.js',
     'experiments/word-trails-native-full-backup-transaction-v7.js',
     'experiments/word-trails-native-backup-bridge-candidate-v8.js'
    ])await b.addScriptTag({path:modulePath});
    const baseline=await b.evaluate(all=>Object.fromEntries(all.map(k=>[k,localStorage.getItem(k)])),keys);
    assert.deepEqual(baseline,native,'Synthetic seed must be complete');
    const review=await b.evaluate(([walletKey,walletBackup,ownedKey,trailKey])=>{
     window.__v8coord=window.BUPlatformSaves;
     window.__v8tx=window.BUWTNativeFullBackupTransactionV7.createForStorage(
      localStorage,navigator.locks,()=>crypto.randomUUID());
     window.__v8=window.BUWTNativeBackupRestoreBridgeCandidateV8
      .createForServices({coordinator:window.__v8coord,transaction:window.__v8tx});
     const current=window.__v8coord.makeBackup();
     const candidate=JSON.parse(JSON.stringify(current));
     candidate.keys[walletKey]=JSON.stringify({coins:245,points:22,
      purchases:['goldwheel'],equippedWheel:'goldwheel'});
     candidate.keys[walletBackup]=candidate.keys[walletKey];
     candidate.keys[ownedKey]=JSON.stringify({version:1,owned:['goldwheel']});
     const trail=JSON.parse(candidate.extensions.wordTrailsNext.state);
     trail.coins=3200;trail.points=999;
     candidate.extensions.wordTrailsNext.state=JSON.stringify(trail);
     window.__v8current=current;window.__v8candidate=candidate;
     window.__v8review=window.__v8.stage({currentBackup:current,candidateBackup:candidate});
     return {ok:window.__v8review.ok,changes:window.__v8review.changedKeys,
      keeps:window.__v8review.ownedWheelsKept,
      locked:typeof navigator.locks?.request==='function',
      secure:window.isSecureContext};
    },[W,WB,O,T]);
    assert(review.ok&&review.changes>=3&&review.locked&&review.secure,
     'v2 backup -> v8 plan must work in a real secure browser');
    assert(review.keeps.includes('seawheel')&&review.keeps.includes('goldwheel'));
    assert.deepEqual(await b.evaluate(all=>Object.fromEntries(all.map(k=>[k,localStorage.getItem(k)])),keys),
     baseline,'Actual v2/v8 preview must be read-only');

    // A holds actual native Web Lock while B tries to apply the VALIDATED plan.
    await hold(a);
    await b.bringToFront();
    const blocked=await b.evaluate(()=>window.__v8.apply({
     token:window.__v8review.token,approved:true,backupConfirmed:true}));
    assert.equal(blocked.reason,'another-restore-in-progress');
    assert.equal(await b.evaluate(k=>localStorage.getItem(k),W),native[W]);
    assert.equal(await b.evaluate(k=>localStorage.getItem(k),J),null);
    await release(a);
    // A reviewed token is one-use even after lock contention: must restage.
    const preview2=await b.evaluate(()=>{
     window.__v8review=window.__v8.stage({
      currentBackup:window.__v8current,candidateBackup:window.__v8candidate});
     return {ok:window.__v8review.ok,changes:window.__v8review.changedKeys};
    });
    assert.equal(preview2.ok,true,'Must restage after unsuccessful locked attempt');
    const applied=await b.evaluate(()=>window.__v8.apply({
     token:window.__v8review.token,approved:true,backupConfirmed:true}));
    assert(applied.ok===true&&applied.committed===true,
     'Real Web Locks-approved v8 backup transfer must commit');
    await a.bringToFront();
    await a.waitForFunction(([walletKey,puzzleKey])=>{
      const wallet=JSON.parse(localStorage.getItem(walletKey)||'null');
      const puzzle=JSON.parse(localStorage.getItem(puzzleKey)||'null');
      return wallet?.coins===245&&puzzle?.coins===3200;
    },{timeout:25000,polling:100},[W,T]);
    const final=await a.evaluate(all=>Object.fromEntries(all.map(k=>[k,localStorage.getItem(k)])),keys);
    assert.equal(JSON.parse(final[W]).coins,245);
    assert.equal(JSON.parse(final[T]).coins,3200);
    assert.equal(final[LIVE],native[LIVE],'Existing LIVE crossword must not change');
    assert.equal(final[VOICE],native[VOICE],'Voice must not change');
    for(const k of [O,OB]){
     const owned=JSON.parse(final[k]).owned;
     assert(owned.includes('seawheel')&&owned.includes('goldwheel'),
      'Paid wheels must remain unioned after verified restore');
    }
    assert.equal(await a.evaluate(k=>localStorage.getItem(k),J),null);
    const replay=await b.evaluate(()=>window.__v8.apply({
     token:window.__v8review.token,approved:true,backupConfirmed:true}));
    assert.equal(replay.reason,'no-valid-reviewed-backup-plan');
    assert.deepEqual(errors,[],'Browser exceptions in real-lock v8 integration');
    console.log('PASS_WORD_TRAILS_V8_REAL_BROWSER_LOCKED_TWO_TABS',JSON.stringify({
     viewport:width+'x'+height,actualNativeWebLocks:true,
     v2VerifiedFileAndV7PlanParity:true,heldLockRefused:true,
     approvedSecondAttemptCommitted:true,staleReviewNotReplayable:true,
     preservedPaidWheels:true,nativeWalletAndTestCoinsSeparate:true,
     originalLiveCrosswordUnchanged:true,realUserStorageUsed:false
    }));
   }finally{await ctx.close()}

   // NEGATIVE proof: old pinned LIVE auto-import ignores the current v7 lock.
   const older=await launch(browser,width,height);
   try{
    const {a:stale,b:holder}=older;
    const missingLive=Object.fromEntries(Object.entries(native).filter(([k])=>k!==LIVE));
    await stale.evaluate(data=>Object.entries(data).forEach(([k,v])=>
     localStorage.setItem(k,v)),missingLive);
    await holder.waitForFunction(([key,value])=>localStorage.getItem(key)===value,
     {timeout:30000,polling:100},[T,missingLive[T]]);
    await hold(holder);
    await stale.bringToFront();
    await stale.addScriptTag({content:oldSource});
    const auto=await stale.evaluate(k=>localStorage.getItem(k),LIVE);
    assert(auto&&JSON.parse(auto).migration.version===1,
     'Old LIVE importer must reproduce silent create despite newer lock');
    for(const k of [T,W,WB,O,OB,VOICE])
     assert.equal(await stale.evaluate(key=>localStorage.getItem(key),k),missingLive[k],
      'Legacy importer unexpectedly altered protected synthetic key '+k);
    await release(holder);
    assert.deepEqual(older.errors,[]);
    console.log('PASS_WORD_TRAILS_V8_STALE_TAB_NEGATIVE_BROWSER',JSON.stringify({
     viewport:width+'x'+height,pinnedLiveBlob:PINNED,
     oldLiveAutoImportBypassesNativeBackupLock:true,
     originalWalletWheelsAndTestSaveUntouched:true,
     releaseStillBlockedForOldCachedTabs:true
    }));
   }finally{await older.ctx.close()}
  }
 }finally{await browser.close()}
})().catch(e=>{console.error('FAIL_V8_TWO_TAB_BROWSER',e.stack||e);process.exitCode=1});

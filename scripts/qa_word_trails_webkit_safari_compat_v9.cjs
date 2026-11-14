#!/usr/bin/env node
'use strict';
/* Browser-engine compatibility / fail-closed proof in real WebKit.
 * Fresh disposable local context, fake native/game progress, NO real user
 * profiles, LIVE writes, gameplay migrations, or physical device claims.
 */
const {webkit}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ROOT='http://127.0.0.1:8896/experiments/word-trails-checkpoint-rehearsal-v2.html';
const W='bible-unfolded-rewards-v17';
const WB='bible-unfolded-rewards-v17-recovery-v3811';
const O='bible-unfolded-wheel-ownership-v3825';
const OB='bible-unfolded-wheel-ownership-v3825-backup';
const V='bible-unfolded-private-voice-pref-v381';
const T='bu-visual-lab-wordtrails-next-v1';
const L='bible-unfolded-word-trails-next-v1';
const J='bu-visual-lab-import-transaction-v7';
const wallet=JSON.stringify({coins:750,points:65,purchases:['seawheel'],equippedWheel:'seawheel'});
const sample={level:2,unlocked:4,coins:1320,points:170,completed:[0,1,2],
 sparks:[0],claimedSparks:['0:ABEL'],boardBible:[],paidWords:[],
 paidBonuses:['0|ART'],claimedFreeHints:[0],sound:true,
 progress:{level:2,found:['ELI'],bonuses:[],hinted:[],combo:1}};
const native={
 [W]:wallet,[WB]:wallet,[O]:JSON.stringify({version:1,owned:['seawheel']}),
 [OB]:JSON.stringify({version:1,owned:['seawheel']}),
 [V]:JSON.stringify({mode:'off',volume:41}),
 [T]:JSON.stringify(sample),
 [L]:JSON.stringify({level:8,unlocked:9,coins:51,completed:[0,1,2,3]}),
 'story-trails-ci-sentinel':JSON.stringify({chapter:3,completed:[0,1]})
};
const observe=(page)=>{const errors=[];page.on('pageerror',error=>errors.push(error.message));return errors};
const same=(a,b)=>assert.deepEqual(a,b);
const protectedKeys=[L,V,'story-trails-ci-sentinel'];
(async()=>{
 const browser=await webkit.launch({headless:true,timeout:90000});
 try{
 for(const [width,height] of [[390,705],[320,568]]){
  const context=await browser.newContext({viewport:{width,height},
   isMobile:true,hasTouch:true,deviceScaleFactor:2,acceptDownloads:true});
  try{
   const page=await context.newPage(),errors=observe(page);
   // This seed must never be touched by the fictional practice UI.
   await context.addInitScript(records=>{
    for(const [key,value] of Object.entries(records))localStorage.setItem(key,value);
   },native);
   await page.goto(ROOT,{waitUntil:'domcontentloaded',timeout:90000});
   await page.waitForFunction(()=>document.documentElement.dataset.wtCheckpointRehearsalReady==='yes');
   const initial=await page.evaluate(keys=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)])),
    Object.keys(native));
   same(initial,native);
   const state=await page.evaluate(()=>({
    ready:window.__BUWTCheckpointRehearsal.inspect().ready,
    writes:window.__BUWTCheckpointRehearsal.inspect().writes,
    downloadDisabled:document.querySelector('#download').disabled,
    transferDisabled:document.querySelector('#transfer').disabled,
    locks:typeof navigator.locks?.request==='function',
    secure:isSecureContext,
    pageOverflow:document.documentElement.scrollWidth>innerWidth+1
   }));
   assert(state.ready&&!state.downloadDisabled&&state.transferDisabled&&state.secure);
   assert.equal(state.pageOverflow,false,'No phone-width sideways scrolling');
   assert.equal(state.writes.length,0,'The rehearsal starts with no synthetic writes');
   const downloadEvent=page.waitForEvent('download',{timeout:40000});
   await page.locator('#download').click();
   const download=await downloadEvent;
   const expected=await page.evaluate(()=>window.__BUWTCheckpointRehearsal.inspect().exported);
   assert(expected&&expected.length>200);
   const actual=fs.readFileSync(await download.path(),'utf8');
   assert.equal(actual,expected,'Actual WebKit browser download differs from checkpoint');
   const checkpoint=JSON.parse(actual);
   assert.equal(checkpoint.format,'BibleUnfoldedWordTrailsRecoveryCheckpoint');
   assert.equal(checkpoint.scope,'crossword-only');
   assert.equal(checkpoint.nativeWalletExcluded,true);
   assert.equal(JSON.parse(checkpoint.expectedLiveRaw).coins,60);
   await page.locator('#saved').check();
   assert.equal(await page.locator('#transfer').isDisabled(),true);
   await page.locator('#approve').check();
   assert.equal(await page.locator('#transfer').isDisabled(),false);
   await page.locator('#transfer').click();
   if(state.locks){
    await page.waitForFunction(()=>window.__BUWTCheckpointRehearsal.inspect().imported===true);
    assert.equal((await page.evaluate(()=>window.__BUWTCheckpointRehearsal.inspect().writes))
     .filter(x=>x.startsWith('set:')).length,1,'Only fictional crossword target can be created');
   }else{
    await page.waitForFunction(()=>!document.querySelector('#transfer-result').hidden);
    assert.equal((await page.evaluate(()=>window.__BUWTCheckpointRehearsal.inspect().writes.length)),0,
     'WebKit without Web Locks must refuse import without fake writes');
   }
   const after=await page.evaluate(keys=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)])),
    Object.keys(native));
   same(after,native);
   assert.deepEqual(errors,[],'WebKit runtime errors in practice screen');
   console.log('PASS_WEBKIT_WORD_TRAILS_PRACTICE',JSON.stringify({
    viewport:width+'x'+height,
    realCheckpointFileDownloaded:true,syntheticConsentRequired:true,
    nativeLocksAvailable:state.locks,
    importedFictionalProgressOnly:state.locks,
    failsClosedWithoutLocks:!state.locks,
    realLocalStorageSentinelsUnchanged:true,
    noSidewaysScroll:true,zeroRuntimeErrors:true
   }));
   // Separate disposable real-storage integration of the ACTUAL v2/v7/v8.
   const b=await context.newPage(),a=await context.newPage();
   const errA=observe(a),errB=observe(b);
   for(const tab of [a,b]){
    await tab.goto(ROOT,{waitUntil:'domcontentloaded',timeout:90000});
    await tab.waitForFunction(()=>document.documentElement.dataset.wtCheckpointRehearsalReady==='yes');
   }
   const scripts=['bu-platform-saves-v2.js',
    'experiments/word-trails-native-full-backup-transaction-v7.js',
    'experiments/word-trails-native-backup-bridge-candidate-v8.js'];
   for(const f of scripts)await b.addScriptTag({path:f});
   const setup=await b.evaluate(([W,WB,O,OB])=>{
    const v2=window.BUPlatformSaves;
    const v7=window.BUWTNativeFullBackupTransactionV7
      .createForStorage(localStorage,navigator.locks,()=>crypto.randomUUID());
    window.__webkitBridge=window.BUWTNativeBackupRestoreBridgeCandidateV8
      .createForServices({coordinator:v2,transaction:v7});
    const current=v2.makeBackup();
    const next=JSON.parse(JSON.stringify(current));
    const incoming=JSON.stringify({coins:325,points:45,purchases:['goldwheel'],
      equippedWheel:'goldwheel'});
    next.keys[W]=incoming;next.keys[WB]=incoming;
    next.keys[O]=JSON.stringify({version:1,owned:['goldwheel']});
    next.keys[OB]=next.keys[O];
    const trail=JSON.parse(next.extensions.wordTrailsNext.state);
    trail.coins=2200;trail.points=999;
    next.extensions.wordTrailsNext.state=JSON.stringify(trail);
    window.__webkitOld=current;window.__webkitNew=next;
    window.__webkitPreview=window.__webkitBridge.stage({
      currentBackup:current,candidateBackup:next});
    return {valid:window.__webkitPreview.ok,changes:window.__webkitPreview.changedKeys,
      locks:typeof navigator.locks?.request==='function',
      currentBytes:JSON.stringify(current).length};
   },[W,WB,O,OB]);
   assert(setup.valid&&setup.changes>=3&&setup.currentBytes>50,
    'WebKit must accept real v2 native backup → v7 plan');
   const before=await b.evaluate(keys=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)])),
    Object.keys(native));
   same(before,native);
   if(setup.locks){
    await a.evaluate(name=>{
     window.__held=false;window.__lockErr=null;
     window.__holdPromise=navigator.locks.request(name,{mode:'exclusive'},
      async()=>{
       window.__held=true;
       await new Promise(resolve=>window.__release=resolve);
      }).catch(error=>window.__lockErr=String(error));
     return true;
    },'bible-unfolded-full-backup-recovery-exclusive-v3');
    await a.waitForFunction(()=>window.__held===true||!!window.__lockErr,
     null,{timeout:35000});
    const held=await a.evaluate(()=>({held:window.__held,error:window.__lockErr}));
    assert.equal(held.error,null);assert.equal(held.held,true);
    const blocked=await b.evaluate(()=>window.__webkitBridge.apply({
      token:window.__webkitPreview.token,approved:true,backupConfirmed:true}));
    assert.equal(blocked.reason,'another-restore-in-progress');
    assert.equal(await b.evaluate(k=>localStorage.getItem(k),J),null);
    await a.evaluate(()=>{window.__release();return window.__holdPromise});
    const reviewedAgain=await b.evaluate(()=>{
      window.__webkitPreview=window.__webkitBridge.stage({
       currentBackup:window.__webkitOld,candidateBackup:window.__webkitNew});
      return window.__webkitPreview.ok;
    });
    assert.equal(reviewedAgain,true);
    const success=await b.evaluate(()=>window.__webkitBridge.apply({
     token:window.__webkitPreview.token,approved:true,backupConfirmed:true}));
    assert(success.ok&&success.committed,'Native WebKit Web Locks should permit user-approved transaction');
    await a.waitForFunction(([W,T])=>{
      const wallet=JSON.parse(localStorage.getItem(W)||'null');
      const trails=JSON.parse(localStorage.getItem(T)||'null');
      return wallet?.coins===325&&trails?.coins===2200;
    },[W,T],{timeout:35000});
    const saved=await a.evaluate(([W,O,OB,T])=>({
      wallet:JSON.parse(localStorage.getItem(W)),
      owner:JSON.parse(localStorage.getItem(O)),
      backup:JSON.parse(localStorage.getItem(OB)),
      test:JSON.parse(localStorage.getItem(T))
    }),[W,O,OB,T]);
    assert.equal(saved.wallet.coins,325);
    assert.equal(saved.test.coins,2200);
    for(const ownership of [saved.owner,saved.backup])
     assert(ownership.owned.includes('seawheel')&&ownership.owned.includes('goldwheel'));
    for(const key of protectedKeys)
     assert.equal(await a.evaluate(k=>localStorage.getItem(k),key),native[key]);
    assert.equal(await a.evaluate(k=>localStorage.getItem(k),J),null);
   }else{
    const declined=await b.evaluate(()=>window.__webkitBridge.apply({
     token:window.__webkitPreview.token,approved:true,backupConfirmed:true}));
    assert.equal(declined.reason,'exclusive-lock-unavailable',
     'WebKit without Web Locks must refuse transactional restore');
    same(await b.evaluate(keys=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)])),
      Object.keys(native)),native);
    assert.equal(await b.evaluate(k=>localStorage.getItem(k),J),null);
   }
   assert.deepEqual([...errA,...errB],[],'No WebKit errors in real v2/v7/v8 source evaluation');
   console.log('PASS_WEBKIT_WORD_TRAILS_V8_TWO_TABS',JSON.stringify({
     viewport:width+'x'+height,nativeWebLocks:setup.locks,
     realV2ToV7Plan:true,heldLockRefused:setup.locks,
     commitSucceeded:setup.locks,unavailableLockFailedClosed:!setup.locks,
     protectedLiveAndVoicesUntouched:true,
     noActualPlayerDataUsed:true,zeroRuntimeErrors:true
   }));
  }finally{await context.close()}
 }
 }finally{await browser.close()}
})().catch(err=>{console.error('FAIL_WEBKIT_WORD_TRAILS_V9',err.stack||err);
 process.exitCode=1});

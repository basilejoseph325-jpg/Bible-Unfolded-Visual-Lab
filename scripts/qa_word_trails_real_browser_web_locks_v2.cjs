#!/usr/bin/env node
'use strict';
/* Genuine Chromium Web Locks concurrency test in fresh isolated CI browser context.
 * All seeded storage is synthetic. It cannot access an end user's device,
 * and no public TEST or LIVE storage is read or modified.
 */
const assert=require('node:assert/strict');
const puppeteer=require('puppeteer-core');
const {execSync}=require('node:child_process');
const chrome=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const url='http://127.0.0.1:8897/experiments/word-trails-progress-transfer-demo-v1.html';
const T='bu-visual-lab-wordtrails-next-v1';
const L='bible-unfolded-word-trails-next-v1';
const WALLET='bible-unfolded-rewards-v17';
const WHEEL='bible-unfolded-wheel-ownership-v3825-backup';
const VOICE='bible-unfolded-private-voice-pref-v381';
const fakeSave={level:3,unlocked:6,coins:9876,points:543,completed:[0,1,2,3],
 sparks:[0],claimedSparks:['0:ABEL'],boardBible:[],paidWords:[],
 paidBonuses:['1|SUN'],claimedFreeHints:[0],sound:true,
 progress:{level:3,found:['ELI'],bonuses:[],hinted:[],combo:1}};
const seeds={
 [T]:JSON.stringify(fakeSave),
 [WALLET]:JSON.stringify({points:-28,coins:999,purchases:['seawheel'],equippedWheel:'seawheel'}),
 [WHEEL]:JSON.stringify({owned:['seawheel']}),
 [VOICE]:JSON.stringify({mode:'rotating'})
};
const snapshot=()=>Object.fromEntries(Object.entries(seeds));
(async()=>{
 const browser=await puppeteer.launch({headless:true,executablePath:chrome,
  args:['--no-sandbox','--disable-setuid-sandbox'],protocolTimeout:90000});
 try{
  const ctx=await browser.createBrowserContext();
  const first=await ctx.newPage(),second=await ctx.newPage();
  for(const page of [first,second]){
   page.setDefaultTimeout(30000);
   await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForFunction(()=>document.documentElement.dataset.wtRehearsalReady==='yes',{timeout:30000});
   await page.addScriptTag({path:'experiments/word-trails-exclusive-consent-boundary-v2.js'});
  }
  await first.evaluate(values=>{for(const [k,v] of Object.entries(values))localStorage.setItem(k,v)},seeds);
  const hasLocks=await first.evaluate(()=>typeof navigator.locks?.request==='function');
  assert(hasLocks,'Native Web Locks must exist to prove cross-tab serialization in this runner');

  // Start a consented transfer from the first tab, but hold the actual
  // browser lock *before* its callback executes. The second tab must fail.
  const ongoing=first.evaluate(async()=>{
    const wrapped={
      request:(name,opts,cb)=>navigator.locks.request(name,opts,async lock=>{
        if(lock){
          window.__qaFirstHasLock=true;
          await new Promise(resolve=>{window.__qaReleaseFirst=resolve});
        }
        return cb(lock);
      })
    };
    const x=window.BUWTExclusiveConsentBoundaryV2.createForStorage(localStorage,wrapped);
    const p=x.preview();if(!p.available)throw Error('First tab missing synthetic source');
    return await x.acceptWithExclusiveLock({approved:true,sourceRaw:p.sourceRaw});
  });
  await first.waitForFunction(()=>window.__qaFirstHasLock===true,{timeout:30000});
  const secondResponse=await second.evaluate(async()=>{
    const x=window.BUWTExclusiveConsentBoundaryV2.createForStorage(localStorage,navigator.locks);
    const p=x.preview();
    return await x.acceptWithExclusiveLock({approved:true,sourceRaw:p.sourceRaw});
  });
  assert.equal(secondResponse.ok,false);
  assert.equal(secondResponse.reason,'another-transfer-in-progress',
    'Second real browser tab must be refused until exclusive Web Lock is released');
  assert.equal(await second.evaluate(key=>localStorage.getItem(key),L),null,
    'The second tab must not prematurely create a LIVE progress key');
  await first.evaluate(()=>window.__qaReleaseFirst());
  const accepted=await ongoing;
  assert.equal(accepted.ok,true);assert.equal(accepted.via,'exclusive-browser-lock-v2');

  const state=await second.evaluate(({live,test,wallet,wheel,voice})=>({
    live:localStorage.getItem(live),test:localStorage.getItem(test),
    wallet:localStorage.getItem(wallet),wheel:localStorage.getItem(wheel),
    voice:localStorage.getItem(voice)
  }),{live:L,test:T,wallet:WALLET,wheel:WHEEL,voice:VOICE});
  assert.deepEqual(JSON.parse(state.live).completed,[0,1,2,3]);
  assert.equal(JSON.parse(state.live).coins,60);
  assert.equal(JSON.parse(state.live).points,0);
  for(const [key,prop] of [[T,'test'],[WALLET,'wallet'],[WHEEL,'wheel'],[VOICE,'voice']])
    assert.equal(state[prop],seeds[key], 'Never modify shared/TEST source: '+key);
  const again=await second.evaluate(async()=>{
    const x=window.BUWTExclusiveConsentBoundaryV2.createForStorage(localStorage,navigator.locks);
    return await x.acceptWithExclusiveLock({approved:true,sourceRaw:localStorage.getItem('bu-visual-lab-wordtrails-next-v1')});
  });
  assert.equal(again.reason,'live-progress-exists','Repeat cannot overwrite previous LIVE crossword save');
  assert.equal(await first.evaluate(key=>localStorage.getItem(key),L),state.live,
    'Repeated import must not replay awards or rewrite progress');

  console.log('PASS_WORD_TRAILS_REAL_WEB_LOCKS_V2',JSON.stringify({
    contexts:1,tabs:2,nativeWebLocks:true,
    concurrentSecondTab:'another-transfer-in-progress',
    singleSyntheticImport:true,existingSaveProtected:true,
    quarantinedTestCoins:9876,livePuzzleCoins:60,livePuzzlePoints:0,
    sharedWalletUnchanged:true,ownershipUnchanged:true,voiceUnchanged:true,
    noRealUserDataTouched:true
  }));
  await ctx.close();
 }finally{await browser.close()}
})().catch(e=>{console.error('FAIL_WORD_TRAILS_REAL_WEB_LOCKS_V2',e.stack||e);process.exitCode=1});

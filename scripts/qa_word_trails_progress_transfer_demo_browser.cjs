#!/usr/bin/env node
'use strict';
/* Browser test uses a local HTTP server, isolated Chromium profiles,
   fake in-memory Word Trails saves and real localStorage tripwires.
   It NEVER touches published TEST/LIVE user data or any actual wallet. */
const assert=require('node:assert/strict');
const puppeteer=require('puppeteer-core');
const {execSync}=require('node:child_process');
const browserBin=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const pageUrl=process.env.BU_WT_CONSENT_DEMO_URL||'http://127.0.0.1:8895/experiments/word-trails-progress-transfer-demo-v1.html';
const nativeWallet='bible-unfolded-rewards-v17';
const nativeVoice='bible-unfolded-private-voice-pref-v381';
const nativeOwned='bible-unfolded-wheel-ownership-v3825-backup';
const liveKey='bible-unfolded-word-trails-next-v1';
const testKey='bu-visual-lab-wordtrails-next-v1';
const protectedData={
 [nativeWallet]:JSON.stringify({points:-987,coins:65432,purchases:['seawheel'],equippedWheel:'seawheel'}),
 [nativeVoice]:JSON.stringify({mode:'off'}),
 [nativeOwned]:JSON.stringify({owned:['seawheel']}),
 [liveKey]:JSON.stringify({level:8,completed:[0,1,2]}),
 [testKey]:JSON.stringify({level:1,coins:4521}),
 'test-storage-sentinel':'STORAGE-MUST-NEVER-CHANGE'
};
const beforeSort=x=>JSON.stringify(Object.entries(x).sort((a,b)=>a[0].localeCompare(b[0])));
(async()=>{
 const browser=await puppeteer.launch({headless:true,executablePath:browserBin,args:['--no-sandbox','--disable-setuid-sandbox','--autoplay-policy=no-user-gesture-required'],protocolTimeout:120000});
 try{
  for(const [width,height] of [[390,705],[320,568]]){
   const context=await browser.createBrowserContext(),page=await context.newPage();
   const pageerrors=[];page.on('pageerror',x=>pageerrors.push(x.message));
   await page.setViewport({width,height,isMobile:true,hasTouch:true,deviceScaleFactor:2});
   await page.evaluateOnNewDocument(init=>{for(const [k,v] of Object.entries(init))localStorage.setItem(k,v)},protectedData);
   await page.goto(pageUrl,{waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForFunction(()=>document.documentElement.dataset.wtRehearsalReady==='yes',{timeout:30000});
   const actual=await page.evaluate(()=>Object.fromEntries(Array.from({length:localStorage.length},(_,i)=>localStorage.key(i)).map(k=>[k,localStorage.getItem(k)])));
   assert.equal(beforeSort(actual),beforeSort(protectedData),'Page initialization must not touch any real browser storage');
   const initial=await page.evaluate(()=>({head:document.querySelector('h1').textContent,
    preview:document.getElementById('preview').disabled,
    confirmHidden:document.getElementById('confirm').hidden,
    count:document.getElementById('completed-count').textContent,
    level:document.getElementById('unlocked-count').textContent,
    diag:window.__BUWTProgressTransferDemo.inspect()}));
   assert(initial.head.includes('Word Trails'));
   assert.equal(initial.preview,false);
   assert.equal(initial.confirmHidden,true);
   assert.equal(initial.count,'3');assert.equal(initial.level,'5');
   assert.equal(initial.diag.writes.length,0);
   await page.click('#decline');
   assert((await page.$eval('#result',x=>x.textContent)).includes('No sample progress was transferred'));
   assert.equal((await page.evaluate(()=>window.__BUWTProgressTransferDemo.inspect().writes.length)),0);
   await page.click('#preview');
   assert.equal(await page.$eval('#confirm',x=>x.hidden),false);
   assert.equal(await page.$eval('#transfer',x=>x.disabled),true,'Confirm starts disabled');
   await page.click('#cancel');
   assert.equal(await page.$eval('#confirm',x=>x.hidden),true);
   assert.equal((await page.evaluate(()=>window.__BUWTProgressTransferDemo.inspect().writes.length)),0);
   await page.click('#preview');
   await page.click('#acknowledge');
   assert.equal(await page.$eval('#transfer',x=>x.disabled),false,'Explicit acknowledgment enables demo transfer');
   await page.click('#transfer');
   let done=await page.evaluate(()=>({msg:document.getElementById('result').textContent,
    view:window.__BUWTProgressTransferDemo.inspect()}));
   assert(done.msg.includes('Practice transfer complete!'));
   assert.equal(done.view.writes.length,1);
   assert.equal(done.view.writes[0],liveKey,'ONLY synthetic LIVE progress key written');
   assert.equal(done.view.sampleLiveSave.coins,60);
   assert.equal(done.view.sampleLiveSave.points,0);
   assert.equal(done.view.sampleLiveSave.completed.length,3);
   assert.equal(done.view.sampleWallet.coins,493,'Simulated shared native tokens unchanged');
   assert.equal(done.view.sampleOwned.owned[0],'seawheel');
   assert.equal(await page.$eval('#preview',x=>x.disabled),true,'Duplicate import blocked');
   await page.select('#scenario','existing');
   assert.equal(await page.$eval('#preview',x=>x.disabled),true,'Existing live progress never overridden');
   assert((await page.$eval('#status',x=>x.textContent)).includes('already has LIVE'));
   assert.equal((await page.evaluate(()=>window.__BUWTProgressTransferDemo.inspect().writes.length)),0);
   await page.select('#scenario','invalid');
   assert.equal(await page.$eval('#preview',x=>x.disabled),true,'Corrupt progress blocked');
   assert((await page.$eval('#status',x=>x.textContent)).includes('damaged'));
   await page.select('#scenario','changed');
   await page.click('#preview');
   await page.click('#acknowledge');
   await page.click('#transfer');
   assert((await page.$eval('#result',x=>x.textContent)).includes('progress changed'));
   assert.equal((await page.evaluate(()=>window.__BUWTProgressTransferDemo.inspect().writes.length)),0);
   await page.select('#scenario','ready');
   assert.equal(await page.$eval('#preview',x=>x.disabled),false,'Rehearsal resets safely');
   const after=await page.evaluate(()=>({storage:Object.fromEntries(Array.from({length:localStorage.length},(_,i)=>localStorage.key(i)).map(k=>[k,localStorage.getItem(k)])),
    width:document.documentElement.scrollWidth,viewWidth:window.innerWidth,
    horizontalOverflow:document.documentElement.scrollWidth>window.innerWidth+1}));
   assert.equal(beforeSort(after.storage),beforeSort(protectedData),'Actual browser native wallet, purchases, voice, LIVE and TEST saves stay byte-for-byte unchanged');
   assert(!after.horizontalOverflow,'Preview must have no horizontal overflow');
   assert.deepEqual(pageerrors,[],'No page errors');
   if(width===390)await page.screenshot({path:'/tmp/BU-WT-CONSENT-DEMO-390.png',fullPage:true});
   console.log('PASS_WORD_TRAILS_CONSENT_DEMO_BROWSER',JSON.stringify({width,height,initialCount:3,levelsUnlocked:5,syntheticTransferKeys:[liveKey],realBrowserStorageUnchanged:true,existingSaveProtected:true,corruptSaveBlocked:true,stalePreviewRejected:true,noHorizontalOverflow:true,pageerrors:0}));
   await context.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error('FAIL_WORD_TRAILS_CONSENT_DEMO_BROWSER',e.stack||e);process.exitCode=1});

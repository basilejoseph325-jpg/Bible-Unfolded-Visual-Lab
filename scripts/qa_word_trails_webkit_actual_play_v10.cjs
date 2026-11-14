#!/usr/bin/env node
'use strict';
/* TRUE TEST Word Trails original native iframe in WebKit phone viewports.
 * Real WebKit touchscreen TAPS + Playwright mouse pointer SWIPE (not physical
 * iOS finger gesture). Real gameplay checks for word entry, free/paid hints,
 * Scripture Spark, save reload/resume and protected LIVE state. This touches
 * only disposable CI browser profiles served from local TEST. */
const assert=require('node:assert/strict');
const {webkit}=require('playwright');
const ROOT='http://127.0.0.1:8896/index.html';
const TEST='bu-visual-lab-wordtrails-next-v1';
const LIVE='bible-unfolded-word-trails-next-v1';
const SENTINEL='bu-wt-webkit-v10-sentinel';
const wallet='bible-unfolded-rewards-v17';
const wheels='bible-unfolded-wheel-ownership-v3825-backup';
const voice='bible-unfolded-private-voice-pref-v381';
const seed={
 [LIVE]:JSON.stringify({level:19,unlocked:20,coins:58,completed:[0,1,2,3,4]}),
 [SENTINEL]:'never-change'
};
async function init(context){
 await context.addInitScript(records=>{
  for(const [k,v] of Object.entries(records))localStorage.setItem(k,v);
 },seed);
}
async function getSave(page){
 return page.evaluate(key=>{
  const s=localStorage.getItem(key);
  return s?JSON.parse(s):null;
 },TEST);
}
async function waitGame(page){
 await page.waitForFunction(()=>window.BUWTNativeShell?.active?.()&&
  !!document.querySelector('#bu-wt-native-game')?.contentWindow?.BUWTPolish,
  null,{timeout:100000});
 const child=page.frames().find(f=>f.url().includes('word-trails-next-v1.html'));
 assert(child,'Native iframe must load TEST Word Trails');
 await child.waitForFunction(()=>document.querySelectorAll('.wheel-letter').length===6,
  null,{timeout:40000});
 return child;
}
async function tapWord(frame,word){
 const page=frame.page();
 for(const ch of word){
  const label=frame.locator('.wheel-letter').filter({hasText:new RegExp('^'+ch+'$')});
  assert.equal(await label.count(),1,'Unique wheel letter '+ch+' for '+word);
  const rect=await label.boundingBox();
  assert(rect&&rect.width>10&&rect.height>10);
  await page.touchscreen.tap(rect.x+rect.width/2,rect.y+rect.height/2);
 }
 const selected=await frame.locator('#preview').textContent();
 assert.equal(selected,word,'Actual WebKit touchscreen taps should select '+word);
 const submit=await frame.locator('#submit').boundingBox();
 assert(submit);
 await page.touchscreen.tap(submit.x+submit.width/2,submit.y+submit.height/2);
}
async function swipeWord(frame,word){
 const page=frame.page(),positions=[];
 for(const ch of word){
  const label=frame.locator('.wheel-letter').filter({hasText:new RegExp('^'+ch+'$')});
  const b=await label.boundingBox();
  assert(b,'Missing target letter '+ch);
  positions.push({x:b.x+b.width/2,y:b.y+b.height/2});
 }
 await page.mouse.move(positions[0].x,positions[0].y);
 await page.mouse.down();
 for(let i=1;i<positions.length;i++){
  await page.mouse.move(positions[i].x,positions[i].y,{steps:7});
 }
 await page.mouse.up();
 // Unlike the touchscreen taps, this is a genuine WebKit mouse pointer drag,
 // not a claim of physical Safari finger-swipe parity.
}
(async()=>{
 const browser=await webkit.launch({headless:true,timeout:90000});
 try{
 for(const [width,height] of [[390,705],[320,568]]){
  const context=await browser.newContext({
   viewport:{width,height},isMobile:true,hasTouch:true,deviceScaleFactor:2
  });
  try{
   await init(context);
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(ROOT,{waitUntil:'domcontentloaded',timeout:110000});
   await page.waitForFunction(()=>window.BUWTNativeShell?.nativeReady?.()&&
    !!document.querySelector('#home-cross'),null,{timeout:100000});
   const before=await page.evaluate(keys=>
    Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)])),
    [LIVE,SENTINEL,wallet,wheels,voice]);
   assert.equal(before[LIVE],seed[LIVE]);
   await page.evaluate(()=>document.querySelector('#home-cross').click());
   let child=await waitGame(page);
   assert.equal((await getSave(page)).level,0,'First TEST play starts level 1');
   assert.equal((await child.locator('#solved-count').textContent()).trim(),'0 / 4');
   const firstCoin=(await getSave(page)).coins;
   assert.equal(firstCoin,60);
   const hint=child.locator('#hint');
   assert.equal(await child.locator('#hint-cost').textContent(),'FREE');
   await hint.tap();
   await child.waitForFunction(()=>document.querySelectorAll('.tile').length>0);
   let afterHint=await getSave(page);
   assert.equal(afterHint.coins,firstCoin,'One free hint spends no coins');
   assert(afterHint.claimedFreeHints.includes(0));
   assert.equal(afterHint.progress.hinted.length,1);
   assert.equal(await child.locator('#hint-cost').textContent(),'15');
   await hint.tap();
   afterHint=await getSave(page);
   assert.equal(afterHint.coins,firstCoin-15,'Second hint costs 15 TEST coins');
   assert.equal(afterHint.progress.hinted.length,2);
   // First genuine touch events, not DOM dispatch or calling internal functions.
   await tapWord(child,'ANTIC');
   await child.waitForFunction(()=>document.querySelector('#solved-count')?.textContent
    .trim()==='1 / 4',{timeout:25000});
   const afterTap=await getSave(page);
   assert(afterTap.progress.found.includes('ANTIC'));
   assert.equal(afterTap.coins,firstCoin-15,'Correct board words give points not extra TEST coins');

   // Exercise pointer capture, hit-testing and automatic submit after drag.
   await swipeWord(child,'TACO');
   await child.waitForFunction(()=>document.querySelector('#solved-count')?.textContent
    .trim()==='2 / 4',{timeout:25000});
   const afterSwipe=await getSave(page);
   assert(afterSwipe.progress.found.includes('ANTIC')&&afterSwipe.progress.found.includes('TACO'));
   // A genuine hidden Scripture word with exact Bible link, claimed one time.
   await tapWord(child,'CAIN');
   await child.waitForFunction(()=>document.querySelector('#discovery')?.open,
    null,{timeout:25000});
   const story=await child.evaluate(()=>({
    heading:document.querySelector('#spark-title').textContent,
    link:document.querySelector('#spark-link').href,
    content:document.querySelector('#spark-text').textContent,
    count:document.querySelector('#spark-progress').textContent
   }));
   assert(story.heading.includes('CAIN'));
   assert.equal(story.link,'https://www.jw.org/en/library/bible/nwt/books/genesis/4/');
   assert(story.content.length>45);
   assert(story.count.startsWith('1/'));
   const rewarded=await getSave(page);
   assert.equal(rewarded.coins,firstCoin-15+25,'Bible discovery adds exactly 25 TEST coins');
   assert(rewarded.claimedSparks.includes('0:CAIN'));
   await child.locator('#spark-next').tap();
   await child.waitForFunction(()=>!document.querySelector('#discovery')?.open);

   // A repeated Bible word is not a wallet-minting replay.
   await tapWord(child,'CAIN');
   const afterRepeat=await getSave(page);
   assert.equal(afterRepeat.coins,rewarded.coins,'Repeat discovery must never pay twice');

   // A refresh returns to HOME while keeping the partially solved TEST board.
   await page.reload({waitUntil:'domcontentloaded',timeout:110000});
   await page.waitForFunction(()=>window.BUWTNativeShell?.nativeReady?.()&&
    !window.BUWTNativeShell?.active?.(),null,{timeout:100000});
   assert.notEqual(await page.evaluate(()=>location.hash),'#word-trails');
   assert.equal((await getSave(page)).coins,rewarded.coins);
   await page.evaluate(()=>document.querySelector('#home-cross').click());
   child=await waitGame(page);
   assert.equal((await child.locator('#solved-count').textContent()).trim(),'2 / 4',
    'Resuming the board should show found words again');
   const resumed=await getSave(page);
   assert(resumed.progress.found.includes('ANTIC')&&resumed.progress.found.includes('TACO'));
   assert.equal(resumed.progress.hinted.length,2);
   assert(resumed.claimedSparks.includes('0:CAIN'));
   assert.equal(resumed.coins,rewarded.coins);

   const after=await page.evaluate(keys=>
    Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)])),
    [LIVE,SENTINEL,wallet,wheels,voice]);
   for(const key of [LIVE,SENTINEL])assert.equal(after[key],before[key]);
   // All other native system values were baseline snapshots and must not be
   // changed by standalone TEST crossword rewards.
   for(const key of [wallet,wheels,voice])assert.equal(after[key],before[key],
    'Word Trails altered shared native state '+key);
   assert.deepEqual(errors,[],'Real WebKit gameplay JavaScript exceptions');
   console.log('PASS_WEBKIT_WORD_TRAILS_REAL_PLAY_V10',JSON.stringify({
    viewport:width+'x'+height,trueTouchscreenTapWord:'ANTIC',
    mousePointerSwipeWord:'TACO',hintFreeThenPaid:true,
    BibleSpark:'CAIN',jwOrgBibleLink:true,claimPaidOnce:true,
    refreshHomeAndResumeBoard:true,saveHintAndCoins:true,
    protectedLiveAndNativeValuesUnchanged:true,zeroPageErrors:true,
    physicalTouchSwipeOrAudioCertified:false
   }));
  }finally{await context.close();}
 }
 }finally{await browser.close();}
})().catch(e=>{console.error('FAIL_WEBKIT_WORD_TRAILS_REAL_PLAY_V10',e.stack||e);
 process.exitCode=1});

#!/usr/bin/env node
'use strict';
/* Test actual Chrome native touch pointer events through CDP; NOT mouse drag.
 * Genuine Word Trails UI and iframe in isolated TEST browser contexts only.
 * This is NOT a physical Samsung/iOS swipe or audio certification.
 */
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const ROOT='http://127.0.0.1:8896/index.html';
const LIVE='bible-unfolded-word-trails-next-v1',TEST='bu-visual-lab-wordtrails-next-v1';
const SENTINEL='bu-qa-real-finger-touch-v11';
const WALLET='bible-unfolded-rewards-v17';
const WHEELS='bible-unfolded-wheel-ownership-v3825-backup';
const VOICE='bible-unfolded-private-voice-pref-v381';
const seed={
 [LIVE]:JSON.stringify({level:15,unlocked:16,coins:60,completed:[0,1,2,3]}),
 [SENTINEL]:'must-never-change'
};
const readSave=async page=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)||'null'),TEST);
const snapshot=async page=>page.evaluate(keys=>Object.fromEntries(
 keys.map(k=>[k,localStorage.getItem(k)])),[LIVE,SENTINEL,WALLET,WHEELS,VOICE]);
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function frameFor(page){
 await page.waitForFunction(()=>window.BUWTNativeShell?.active?.()&&
  !!document.querySelector('#bu-wt-native-game')?.contentWindow?.BUWTPolish,
  null,{timeout:100000});
 const frame=page.frames().find(f=>f.url().includes('/word-trails-next-v1.html'));
 assert(frame,'Real Word Trails iframe not found');
 await frame.waitForFunction(()=>document.querySelectorAll('.wheel-letter').length===6,
  null,{timeout:40000});
 return frame;
}
async function positionOf(frame,letter){
 const query=frame.locator('.wheel-letter').filter({hasText:new RegExp('^'+letter+'$')});
 assert.equal(await query.count(),1,'Expected unique rack letter '+letter);
 const b=await query.boundingBox();
 assert(b&&b.width>10&&b.height>10,'Letter has invalid screen bounds '+letter);
 return {x:b.x+b.width/2,y:b.y+b.height/2};
}
async function touchWord(session,frame,word){
 const pts=[];
 for(const letter of word)pts.push(await positionOf(frame,letter));
 const point=(p)=>({x:p.x,y:p.y,id:1,radiusX:3,radiusY:3,force:0.65});
 await session.send('Input.dispatchTouchEvent',{
  type:'touchStart',touchPoints:[point(pts[0])],modifiers:0});
 await pause(24);
 for(let i=1;i<pts.length;i++){
  const a=pts[i-1],b=pts[i];
  for(let j=1;j<=8;j++){
   const f=j/8;
   await session.send('Input.dispatchTouchEvent',{
    type:'touchMove',touchPoints:[point({x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f})],
    modifiers:0});
   await pause(12);
  }
 }
 await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[],modifiers:0});
}
async function tapWord(session,frame,word){
 for(const letter of word){
  const p=await positionOf(frame,letter);
  await session.send('Input.dispatchTouchEvent',{
   type:'touchStart',touchPoints:[{...p,id:1,radiusX:3,radiusY:3,force:0.65}],modifiers:0});
  await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[],modifiers:0});
  await pause(40);
 }
 const text=(await frame.locator('#preview').textContent()).trim();
 assert.equal(text,word,'Chrome fresh touch taps should select '+word);
 const b=await frame.locator('#submit').boundingBox();
 assert(b);
 await session.send('Input.dispatchTouchEvent',{
  type:'touchStart',touchPoints:[{x:b.x+b.width/2,y:b.y+b.height/2,id:1}],modifiers:0});
 await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[],modifiers:0});
}
(async()=>{
 const browser=await chromium.launch({headless:true,timeout:90000,
  args:['--disable-dev-shm-usage','--no-sandbox']});
 try{
  for(const [width,height] of [[390,705],[320,568]]){
   const context=await browser.newContext({viewport:{width,height},
    isMobile:true,hasTouch:true,deviceScaleFactor:2});
   try{
    await context.addInitScript(data=>{
     for(const [key,value] of Object.entries(data))localStorage.setItem(key,value);
    },seed);
    const page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(ROOT,{waitUntil:'domcontentloaded',timeout:110000});
    await page.waitForFunction(()=>window.BUWTNativeShell?.nativeReady?.()&&
     document.querySelector('#home-cross'),null,{timeout:100000});
    const previous=await snapshot(page);
    assert.equal(previous[LIVE],seed[LIVE]);
    await page.evaluate(()=>document.querySelector('#home-cross').click());
    const frame=await frameFor(page);
    const session=await context.newCDPSession(page);
    assert.equal((await frame.locator('#solved-count').textContent()).trim(),'0 / 4');
    // A native protocol TOUCH swipe must auto-submit without tapping Enter.
    await touchWord(session,frame,'ANTIC');
    await frame.waitForFunction(()=>document.querySelector('#solved-count')?.textContent.trim()==='1 / 4',
     null,{timeout:30000});
    const afterOne=await readSave(page);
    assert(afterOne.progress.found.includes('ANTIC'));
    assert.equal(afterOne.coins,60);
    // Attempt another distinct word quickly after prior swipe.
    await touchWord(session,frame,'TACO');
    await frame.waitForFunction(()=>document.querySelector('#solved-count')?.textContent.trim()==='2 / 4',
     null,{timeout:30000});
    const afterTwo=await readSave(page);
    assert(afterTwo.progress.found.includes('TACO'));
    // Touchscreen taps must work immediately after touch swipe (regression #v10).
    await tapWord(session,frame,'CAIN');
    await frame.waitForFunction(()=>document.querySelector('#discovery')?.open,
     null,{timeout:30000});
    const discovery=await frame.evaluate(()=>({
     title:document.querySelector('#spark-title')?.textContent,
     href:document.querySelector('#spark-link')?.href
    }));
    assert(discovery.title.includes('CAIN'));
    assert.equal(discovery.href,'https://www.jw.org/en/library/bible/nwt/books/genesis/4/');
    const withBible=await readSave(page);
    assert.equal(withBible.coins,afterTwo.coins+25);
    assert(withBible.claimedSparks.includes('0:CAIN'));
    await frame.locator('#spark-next').tap();
    // Repeated Bible discovery must never pay coins twice.
    await tapWord(session,frame,'CAIN');
    assert.equal((await readSave(page)).coins,withBible.coins);
    // Escape and re-enter maintains partial 2/4 board with Bible find.
    await page.evaluate(()=>window.BUWTNativeShell.close());
    await page.waitForFunction(()=>!window.BUWTNativeShell.active());
    await pause(350);
    await page.evaluate(()=>document.querySelector('#home-cross').click());
    const resumedFrame=await frameFor(page);
    assert.equal((await resumedFrame.locator('#solved-count').textContent()).trim(),'2 / 4');
    const resumed=await readSave(page);
    assert(resumed.progress.found.includes('ANTIC')&&resumed.progress.found.includes('TACO'));
    assert(resumed.claimedSparks.includes('0:CAIN'));
    const final=await snapshot(page);
    assert.deepEqual(final,previous,'TEST swipe must not alter original LIVE, native wallet, purchases, voices');
    assert.deepEqual(errors,[],'No unexpected game JS exceptions');
    console.log('PASS_NATIVE_CHROME_REAL_TOUCH_WORD_TRAILS_V11',JSON.stringify({
     viewport:width+'x'+height,
     actualCdpTouchSwipeWords:['ANTIC','TACO'],touchInputNotMouse:true,
     touchTapAfterSwipe:'CAIN',oneTimeBibleReward:true,
     jwOrgLinkVerified:true,progressReopenPassed:true,
     protectedLiveAndWalletByteIdentical:true,
     jsPageErrors:0,physicalSamsungOrIphoneCertified:false
    }));
   }finally{await context.close()}
  }
 }finally{await browser.close()}
})().catch(e=>{
 console.error('FAIL_NATIVE_CHROME_REAL_TOUCH_WORD_TRAILS_V11',e.stack||e);
 process.exitCode=1;
});

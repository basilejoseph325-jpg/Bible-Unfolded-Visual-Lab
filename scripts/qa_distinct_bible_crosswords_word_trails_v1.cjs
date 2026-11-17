#!/usr/bin/env node
'use strict';
/* Distinct game QA: question-led Bible Crosswords and NEW Word Trails wheel
 * must BOTH remain playable, with their own correctly named headers.
 * Runs in ephemeral browsers; no actual player save or LIVE page is touched.
 */
const assert=require('node:assert/strict');
const {chromium,webkit}=require('playwright');
const {execSync}=require('node:child_process');
const chrome=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const BASE='http://127.0.0.1:8896/index.html';
async function audit(engine,browser,width,height){
 const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,deviceScaleFactor:2});
 try{
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:135000});
  await page.waitForFunction(()=>window.BUWTNativeShell?.nativeReady?.()&&
   window.BUCrosswordExpanded33?.packCount?.()===33&&
   !!document.getElementById('home-crossword-packs')&&
   !!document.getElementById('home-cross'),null,{timeout:90000});
  const initial=await page.evaluate(()=>({
    crossCard:document.querySelector('#home-crossword-packs .cinematic-card-title')?.textContent,
    trailCard:document.querySelector('#home-cross .cinematic-card-title')?.textContent,
    pick:document.querySelector('#cross-pick .hub-headtitle b')?.textContent,
    play:document.querySelector('#crossword-screen .xword-title')?.textContent,
    aria:document.getElementById('crossword-screen')?.getAttribute('aria-label'),
    back:document.getElementById('xword-back')?.textContent,
    packCount:window.BUCrosswordExpanded33?.packCount?.(),
    legacyComparison:!!document.getElementById('wt-next-compare')
  }));
  assert.equal(initial.crossCard,'Bible Crosswords','Separate Bible Crosswords home card must remain');
  assert(initial.trailCard?.includes('Word Trails'),'Distinct new Word Trails home card must remain');
  assert.equal(initial.pick,'Bible Crosswords','Old question-pack picker must be named Bible Crosswords');
  assert.equal(initial.play,'Bible Crosswords','Old question game must not claim to be Word Trails');
  assert.equal(initial.aria,'Bible Crosswords');
  assert.equal(initial.back,'‹ Crosswords');
  assert.equal(initial.packCount,33,'Existing 33 question-led Bible Crosswords packs must remain');
  assert.equal(initial.legacyComparison,false,'Retired previous-Word-Trails comparison button must not return');
  // REAL home tile -> native 33-pack question-led crossword.
  await page.evaluate(()=>{
   document.querySelector('#daily-continue')?.click();
   document.getElementById('home-crossword-packs').click();
  });
  await page.waitForFunction(()=>!document.getElementById('cross-pick')?.hidden&&
   document.querySelectorAll('#cross-pack-list button[data-pack]').length===33,null,{timeout:18000});
  const picker=await page.evaluate(()=>({
    title:document.querySelector('#cross-pick .hub-headtitle b')?.textContent,
    hiddenNewEntry:getComputedStyle(document.getElementById('wt-next-entry')).display==='none',
    entries:[...document.querySelectorAll('#cross-pack-list button[data-pack]')].length
  }));
  assert.equal(picker.title,'Bible Crosswords');
  assert(picker.hiddenNewEntry,'The separate Crosswords picker must not show NEW Word Trails as a comparison');
  assert.equal(picker.entries,33);
  await page.evaluate(()=>document.querySelector('#cross-pack-list button[data-pack="24"]').click());
  await page.waitForFunction(()=>!document.getElementById('crossword-screen')?.hidden&&
   !!document.getElementById('xword-wheel')&&
   !!document.getElementById('xword-content')?.textContent?.trim(),null,{timeout:22000});
  const crossPlay=await page.evaluate(()=>({
    header:document.querySelector('#crossword-screen .xword-title')?.textContent,
    question:document.getElementById('xword-content')?.textContent?.slice(0,210),
    wheel:!!document.getElementById('xword-wheel'),
    coins:document.getElementById('xword-coin-count')?.textContent,
    points:document.getElementById('xword-point-count')?.textContent,
    activeNativeWheel:window.BUWTNativeShell?.active?.()
  }));
  assert.equal(crossPlay.header,'Bible Crosswords');
  assert(crossPlay.question?.length>20,'Question-led crossword must keep real clue and answers');
  assert(crossPlay.wheel);
  assert(!crossPlay.activeNativeWheel,'Bible Crosswords is distinct from NEW embedded Word Trails');
  // Return home, launch the NEW Word Trails game from its separate original tile.
  await page.evaluate(()=>{window.focusHome();document.getElementById('home-cross').click()});
  await page.waitForFunction(()=>window.BUWTNativeShell?.active?.()&&
   !!document.getElementById('bu-wt-native-game')?.contentWindow?.document?.getElementById('wheel')&&
   document.getElementById('bu-wt-native-game')?.contentWindow?.document?.getElementById('level-label')?.textContent.includes('/ 50'),
   null,{timeout:35000});
  const newPlay=await page.evaluate(()=>{
   const doc=document.getElementById('bu-wt-native-game').contentWindow.document;
   return {heading:doc.querySelector('h1')?.textContent,level:doc.getElementById('level-label')?.textContent,
    wheel:!!doc.getElementById('wheel'),crossCard:!!document.getElementById('home-crossword-packs')};
  });
  assert(newPlay.heading?.includes('Word Trails'));
  assert(newPlay.level?.includes('/ 50'));
  assert(newPlay.crossCard,'Bible Crosswords home card must survive visiting new Word Trails');
  assert.equal(errors.filter(x=>/launcher|crossword|word trails/i.test(x)).length,0,errors.join('\n'));
  console.log('PASS_DISTINCT_BIBLE_CROSSWORDS_WORD_TRAILS',engine,width+'x'+height,
   'two separate home cards; Bible Crosswords 33 packs/questions; Word Trails 50-level wheel; native UI intact');
 }finally{await context.close()}
}
(async()=>{
 for(const [engine,open] of [
  ['chromium',()=>chromium.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']})],
  ['webkit',()=>webkit.launch({headless:true})]
 ]){
  const browser=await open();
  try{for(const [w,h] of [[320,568],[430,932]])await audit(engine,browser,w,h);}
  finally{await browser.close()}
 }
 console.log('PASS all 4 separate Bible Crosswords + Word Trails browser paths');
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});

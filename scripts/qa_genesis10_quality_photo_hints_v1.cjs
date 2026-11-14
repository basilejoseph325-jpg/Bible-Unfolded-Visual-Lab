#!/usr/bin/env node
'use strict';
/* TEST only: reproduction of the owner's real Discovery 3 screenshot.
 * Proves new artwork loaded, questions not bland, 3 thought hints, NO sold
 * letter before powerups, and original Genesis 7-9 protected.
 */
const assert=require('node:assert/strict'),puppeteer=require('puppeteer-core');
const cp=require('node:child_process'),fs=require('node:fs');
const chrome=cp.execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const origin=process.env.STORY_TEST_URL||'http://127.0.0.1:8896/index.html';
(async()=>{
 const browser=await puppeteer.launch({executablePath:chrome,headless:true,
  args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'],protocolTimeout:115000});
 try{
  const src=JSON.parse(fs.readFileSync('story-adventure-content/genesis-episode10-wordwheel-test-v1.json','utf8')).words;
  for(const [w,h] of [[390,705],[320,568]]){
   const page=await browser.newPage(),errors=[];
   page.on('pageerror',x=>errors.push(x.message));
   await page.setViewport({width:w,height:h,isMobile:true,hasTouch:true,deviceScaleFactor:2});
   let pageRes=await page.goto(origin,{waitUntil:'domcontentloaded',timeout:115000});
   assert([200,304].includes(pageRes.status()),'Cached 304 is valid when Chrome retains the original HTML');
   await page.waitForFunction(()=>typeof bu3857Open==='function'&&typeof BU_HQ_WORDS==='object',{timeout:85000});
   const inventory=await page.evaluate(()=>({
    original7to9:Object.keys(BU_HQ_WORDS).filter(k=>/^g0[789]-d/.test(k)).length,
    episode10:Object.keys(BU_HQ_WORDS).filter(k=>/^g10-d/.test(k)).length,
    saveKey:BU_GENESIS_KEY,
    noNehemiah:!document.getElementById('bu-story-explorer-entry'),
    noNewWallet:typeof economy.coins==='number'
   }));
   assert.deepEqual([inventory.original7to9,inventory.episode10],[30,10]);
   assert(inventory.noNehemiah&&inventory.noNewWallet);
   assert.equal(inventory.saveKey,'bible-unfolded-genesis-adventure-v3860');
   // All ten authored questions, explanations and semantic clues reached native engine.
   const data=await page.evaluate(()=>Array.from({length:10},(_,i)=>{
    const id='g10-d'+String(i+1).padStart(2,'0'),entry=BU_HQ_WORDS[id];
    return {id,clue:entry?.clue,hint1:entry?.hint1,hint2:entry?.hint2,
      hint3:entry?.hint3,answer:entry?.answer,explanation:entry?.explanation};
   }));
   for(const entry of data){
    assert.equal(entry.clue,src[entry.id].clue,'Narrative clue not installed: '+entry.id);
    assert.equal(entry.hint1,src[entry.id].hint1);
    assert.equal(entry.hint2,src[entry.id].hint2);
    assert.equal(entry.hint3,src[entry.id].hint3);
    assert.equal(entry.answer,src[entry.id].answer);
    assert(entry.explanation.length>80);
   }
   const art=await page.evaluate(()=>{
    bu3857Open('genesis_ep10',true);
    bu3857State.step=2;
    bu3857Render();
    const i=document.querySelector('#bu3857-content .bu3863-image img');
    return {src:i?.getAttribute('src'),naturalWidth:i?.naturalWidth,
      alt:i?.alt,wheel:!!document.getElementById('buhq-wheel'),
      error:document.getElementById('bu3857-content')?.textContent?.includes('Puzzle unavailable')};
   });
   assert(art.src==='story-adventure-art/genesis10/esau-and-jacob.webp');
   await page.waitForFunction(()=>document.querySelector('#bu3857-content .bu3863-image img')?.naturalWidth>0,{timeout:17000});
   assert(art.wheel&&!art.error&&art.alt.length>40,'Image and actual wheel must both be present');
   // Test the real paid hint button and a synthetic, disposable currency wallet.
   await page.evaluate(()=>{
    economy.coins=500;
    bu3857State.hints['g10-d03']=0;
    bu3857Save();
    bu3857Render();
    document.getElementById('bu3857-hint').click();
   });
   await page.waitForFunction(()=>bu3857State.hints['g10-d03']===1,{timeout:8000});
   const free=await page.evaluate(()=>({
    coins:economy.coins,level:bu3857State.hints['g10-d03'],
    letter:buHQHintLetters['g10-d03'],
    modal:document.getElementById('bu3864-modal-layer')?.innerText||''
   }));
   assert.equal(free.coins,500,'Free clue must not charge');
   assert.equal(free.level,1);
   assert.equal(free.letter,0);
   await page.evaluate(()=>{
    const buy=[...document.querySelectorAll('#bu3864-modal-layer button')].find(el=>el.textContent.includes('Stronger hint'));
    if(!buy)throw Error('Actual paid Story hint button was not presented');
    buy.click();
   });
   await page.waitForFunction(()=>bu3857State.hints['g10-d03']===2,{timeout:8000});
   const paid=await page.evaluate(()=>({
    coins:economy.coins,level:bu3857State.hints['g10-d03'],
    letter:buHQHintLetters['g10-d03'],
    modal:document.getElementById('bu3864-modal-layer')?.innerText||''
   }));
   assert.equal(paid.coins,485,'First paid clue costs only 15');
   assert.equal(paid.level,2);
   assert.equal(paid.letter,0);
   await page.evaluate(()=>{
    const buy=[...document.querySelectorAll('#bu3864-modal-layer button')].find(el=>el.textContent.includes('Stronger hint'));
    if(!buy)throw Error('Actual paid Story hint button was not presented');
    buy.click();
   });
   await page.waitForFunction(()=>bu3857State.hints['g10-d03']===3,{timeout:8000});
   const third=await page.evaluate(()=>({
    coins:economy.coins,level:bu3857State.hints['g10-d03'],
    letter:buHQHintLetters['g10-d03'],
    modal:document.getElementById('bu3864-modal-layer')?.innerText||''
   }));
   assert.equal(third.coins,460,'Second paid clue costs 25');
   assert.equal(third.level,3);
   assert.equal(third.letter,0,'Never replace paid thinking clues with letter reveals');
   assert(!/Letter [0-9]+ of/.test(third.modal),'Old paid letter-reveal UI must not return');
   const after=await page.evaluate(()=>{
    document.getElementById('bu3864-modal-layer')?.remove();
    bu3857Hint();
    return {coins:economy.coins,level:bu3857State.hints['g10-d03']};
   });
   assert.deepEqual(after,{coins:460,level:3},'No further mystery hint charges');
   // Existing Episode 9 still uses its original hint system.
   const old=await page.evaluate(()=>{
    bu3857Open('genesis_ep09',true);
    return {last:bu3857Current().id,oldWords:!!BU_HQ_WORDS['g09-d01'],
      wheel:!!document.getElementById('buhq-wheel')};
   });
   assert(old.oldWords&&old.wheel);
   assert.deepEqual(errors,[],'No JS exceptions');
   console.log('PASS_GENESIS10_ART_AND_THINKING_HINTS',JSON.stringify({
    viewport:w+'x'+h,sceneArt:true,allTenQuestions:true,
    firstHintFree:true,paidThinkingClues:true,noLetters:true,
    oldEpisodesPreserved:true,errors:0}));
   await page.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error('FAIL_GENESIS10_ART_HINTS',e.stack||e);process.exitCode=1});

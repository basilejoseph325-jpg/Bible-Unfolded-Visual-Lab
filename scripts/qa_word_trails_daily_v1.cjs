#!/usr/bin/env node
'use strict';
// TEST-only Daily Word Trail real Chromium QA. Does not open LIVE or write
// the original Word Trails / shared-wallet storage keys.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const cp=require('node:child_process');
const p=require('puppeteer-core');
const CHROME=process.env.CHROME_BIN||cp.execSync('command -v chromium || command -v google-chrome',{encoding:'utf8'}).trim();
const BASE=process.env.STORY_URL||'http://127.0.0.1:8893/index.html';
const daily=new URL('experiments/word-trails-daily-v1.html',BASE);
const normal=new URL('experiments/word-trails-next-v1.html?standalone=qa',BASE);
const KEY='bu-visual-lab-daily-word-trail-v1';
const gameHTML=fs.readFileSync('experiments/word-trails-next-v1.html','utf8');
assert(gameHTML.includes('id="daily-trail-entry"')&&gameHTML.includes('href="word-trails-daily-v1.html"')&&gameHTML.includes('target="_top"'),'Existing Word Trails entry not wired');
assert(gameHTML.includes('Play Today’s Daily Word Trail'),'Level map entry missing');
const dailyScript=fs.readFileSync('experiments/word-trails-daily-v1.js','utf8');
assert(dailyScript.includes('if(isLocal)window.BUWT_DAILY_QA'),'TEST-only instrumentation not guarded');
const dailyCSS=fs.readFileSync('experiments/word-trails-daily-v1.css','utf8');
assert(dailyCSS.includes('touch-action:none;user-select:none'),'Daily wheel must keep touch gestures inside the wheel');
(async()=>{
 const browser=await p.launch({headless:true,executablePath:CHROME,args:['--no-sandbox','--disable-dev-shm-usage'],protocolTimeout:120000});
 try{
  for(const [width,height] of [[320,568],[390,844],[430,932]]){
   const context=await browser.createBrowserContext();
   const page=await context.newPage(),errors=[],otherWrites=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.setViewport({width,height,isMobile:true,hasTouch:true,deviceScaleFactor:1});
   await page.evaluateOnNewDocument(key=>{
    const old=Storage.prototype.setItem;
    Storage.prototype.setItem=function(k,v){
     if(k!==key&&!String(k).startsWith('daily-qa-'))throw Error('Daily puzzle attempted foreign storage write: '+k);
     return old.call(this,k,v);
    };
   },KEY);
   const first='2026-11-16',second='2026-11-17';
   async function openDate(date){
    const url=new URL(daily);url.searchParams.set('qaDate',date);
    await page.goto(url.href,{waitUntil:'load',timeout:120000});
    await page.waitForFunction(()=>window.BUWT_DAILY_QA?.boardCount()===39,{timeout:45000});
    assert.equal(await page.evaluate(()=>window.BUWT_DAILY_QA.day()),date);
    assert.equal(await page.$eval('#daily-board',x=>x.children.length)>0,true);
    assert((await page.$eval('#daily-title',x=>x.textContent)).includes('Word Mix'),'Daily title must not imply every anagram is part of the Bible scene');
    assert((await page.$eval('#daily-kind',x=>x.textContent)).includes('Bible words'),'Daily subtitle should explain the biblical subset');
    const layout=await page.evaluate(()=>{
     const a=['daily-wheel','daily-shuffle','daily-hint','daily-submit','daily-back','collection'].map(id=>{
      const element=document.getElementById(id)||document.querySelector('.'+id);if(!element)throw Error('Missing UI control '+id);const r=element.getBoundingClientRect();
      return {id,w:r.width,h:r.height,l:r.left,r:r.right,t:r.top,b:r.bottom};
     });
     return {width:innerWidth,height:innerHeight,overflow:document.documentElement.scrollWidth>innerWidth+2,
       controls:a};
    });
    assert.equal(layout.overflow,false,'Horizontal overflow at '+width);
    for(const c of layout.controls)assert(c.w>=32&&c.h>=30&&c.l>=-2&&c.r<=width+2&&c.t>=-2&&c.b<=height+2,
      'Control outside daily viewport '+width+'x'+height+':'+JSON.stringify(c));
    return await page.evaluate(()=>({index:BUWT_DAILY_QA.index(),words:BUWT_DAILY_QA.words(),rack:BUWT_DAILY_QA.rack()}));
   }
   async function playWord(word,touch=false){
    const buttons=await page.$$eval('.daily-wheel-letter',xs=>xs.map(x=>({i:Number(x.dataset.letterIndex),letter:x.textContent,rect:(()=>{const r=x.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()})));
    const used=new Set();
    for(const letter of word){
     const b=buttons.find(x=>x.letter===letter&&!used.has(x.i));
     assert(b,'Missing letter '+letter+' from wheel for '+word);
     used.add(b.i);
     if(touch)await page.touchscreen.tap(b.rect.x,b.rect.y);
     else await page.$eval('.daily-wheel-letter[data-letter-index="'+b.i+'"]',x=>x.click());
    }
    assert.equal(await page.$eval('#daily-word',e=>e.textContent),word,'Real letter selection failed');
    await page.$eval('#daily-submit',x=>x.click());
   }
   async function swipeWord(word){
    const buttons=await page.$$eval('.daily-wheel-letter',xs=>xs.map(x=>{const r=x.getBoundingClientRect();return {i:Number(x.dataset.letterIndex),letter:x.textContent,x:r.left+r.width/2,y:r.top+r.height/2}}));
    const used=new Set(),path=[];
    for(const ch of word){
     const b=buttons.find(x=>x.letter===ch&&!used.has(x.i));
     assert(b,'Missing swipe wheel letter '+ch+' in '+word);
     used.add(b.i);path.push(b);
    }
    const client=await page.createCDPSession();
    await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:path[0].x,y:path[0].y,id:1}]});
    for(const b of path.slice(1)){
     await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:b.x,y:b.y,id:1}]});
     await new Promise(resolve=>setTimeout(resolve,38)); // human-paced finger movement, not CDP event coalescing
     // A real finger moves repeatedly within the same tile. This must NOT unselect it.
     await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:b.x+2,y:b.y+1,id:1}]});
     await new Promise(resolve=>setTimeout(resolve,25));
    }
    const inFlight=await page.$eval('#daily-word',e=>e.textContent);
    assert(word.startsWith(inFlight)&&inFlight.length>=word.length-1,
      'Touch trace lost intermediate letters or toggled on repeated movement: '+inFlight+' / '+word);
    const lineData=await page.evaluate(()=>({total:document.querySelectorAll('#daily-lines line').length,tail:document.querySelectorAll('#daily-lines .daily-trail-tail').length,chosen:document.querySelectorAll('.daily-wheel-letter.selected').length,word:document.getElementById('daily-word').textContent}));
    assert(lineData.total>=inFlight.length,'Swipe must draw connected letters plus a live finger-tail segment: '+JSON.stringify({inFlight,lineData}));
    await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await client.detach();
    const traceResult=await page.evaluate(()=>({selection:document.getElementById('daily-word').textContent,feedback:document.getElementById('daily-feedback').textContent,solved:BUWT_DAILY_QA.record().solved,submitted:BUWT_DAILY_QA.lastSubmission(),trace:BUWT_DAILY_QA.lastTrace()}));
    console.log('DAILY_REAL_TOUCH_SWIPE_TRACE',JSON.stringify({word,traceResult}));
    assert(traceResult.solved.includes(word),'Touch swipe did not solve '+word+'; '+JSON.stringify(traceResult));
    await new Promise(resolve=>setTimeout(resolve,410)); // next word starts after native ghost-click suppression
   }
   const one=await openDate(first);
   assert(one.words.length>=3&&one.words.length<=12);
   assert.equal(await page.$eval('#stamp-count',x=>x.textContent),'0');
   // Existing regular progress and wallet keys survive completely unchanged.
   await page.evaluate(()=>{
    localStorage.setItem('daily-qa-regular-wordtrails','PRESERVE_MAIN_GAME_SAVE');
    localStorage.setItem('daily-qa-native-wallet','PRESERVE_WALLET');
   });
   // Hints are separate and FREE; no wallet deduction.
   await page.$eval('#daily-hint',x=>x.click());
   await page.$eval('#daily-hint',x=>x.click());
   assert.equal(await page.$eval('#daily-hint',x=>x.disabled),true);
   assert.equal(await page.evaluate(()=>window.BUWT_DAILY_QA.record().hints.length),2);
   // Wrong word must never solve a crossword word or earn a stamp.
   await page.$eval('#daily-submit',x=>x.click());
   assert.equal(await page.evaluate(()=>window.BUWT_DAILY_QA.record().solved.length),0);
   for(const [i,word] of one.words.entries()){if(i===0)await swipeWord(word);else await playWord(word,false);}
   await page.waitForSelector('#daily-finish[open]');
   const outcome=await page.evaluate(()=>({
    day:window.BUWT_DAILY_QA.day(),stamp:window.BUWT_DAILY_QA.stampCount(),
    completed:window.BUWT_DAILY_QA.record().completed,
    thought:document.getElementById('daily-thought').textContent,
    scripture:document.getElementById('daily-source').href
   }));
   assert.equal(outcome.stamp,1);assert.equal(outcome.completed,true);assert(outcome.thought.length>45);
   assert(outcome.scripture.startsWith('https://www.jw.org/en/library/bible/nwt/books/'));
   await page.$eval('#daily-finish-close',x=>x.click());
   await page.$eval('#collection',x=>x.click());
   assert.equal(await page.$$eval('.stamp-row',xs=>xs.length),1);
   await page.$eval('#daily-collection-close',x=>x.click());
   await page.reload({waitUntil:'load',timeout:120000});
   await page.waitForFunction(()=>window.BUWT_DAILY_QA?.boardCount()===39);
   assert.equal(await page.evaluate(()=>window.BUWT_DAILY_QA.stampCount()),1);
   assert.equal(await page.evaluate(()=>window.BUWT_DAILY_QA.record().solved.length),one.words.length);
   await page.evaluate(()=>document.getElementById('daily-collection').close());
   // A player may replay the same date, but cannot earn a second stamp.
   await page.evaluate(()=>document.getElementById('daily-finish').showModal());
   await page.$eval('#daily-replay',x=>x.click());
   assert.equal(await page.evaluate(()=>window.BUWT_DAILY_QA.record().solved.length),0);
   for(const word of one.words)await playWord(word,false);
   assert.equal(await page.evaluate(()=>window.BUWT_DAILY_QA.stampCount()),1,'Replay minted another stamp');
   await page.$eval('#daily-finish-close',x=>x.click());
   const two=await openDate(second);
   assert.notEqual(two.index,one.index,'Consecutive days must have different curated crosswords');
   assert.equal(await page.evaluate(()=>window.BUWT_DAILY_QA.record().solved.length),0);
   assert.equal(await page.evaluate(()=>window.BUWT_DAILY_QA.stampCount()),1);
   await playWord(two.words[0],true); // real touch taps in a clean new-day page
   await page.reload({waitUntil:'load',timeout:120000});
   await page.waitForFunction(()=>window.BUWT_DAILY_QA?.boardCount()===39);
   assert.equal(await page.evaluate(()=>window.BUWT_DAILY_QA.record().solved.length),1,'Daily progress failed reload');
   for(const word of two.words.slice(1))await playWord(word);
   assert.equal(await page.evaluate(()=>window.BUWT_DAILY_QA.stampCount()),2);
   assert.equal(await page.evaluate(()=>localStorage.getItem('daily-qa-regular-wordtrails')),'PRESERVE_MAIN_GAME_SAVE');
   assert.equal(await page.evaluate(()=>localStorage.getItem('daily-qa-native-wallet')),'PRESERVE_WALLET');
   assert.deepEqual(errors,[],'Uncaught errors in Daily Trail');
   console.log('PASS_DAILY_TRAIL',JSON.stringify({width,height,sourceBoards:39,
    dates:[first,second],firstIndex:one.index,secondIndex:two.index,
    words:[one.words.length,two.words.length],stamps:2,
    hintsFree:true,touch:true,persistence:true,replayNoDuplicateStamp:true,
    unrelatedKeysPreserved:true,mobileNoOverflow:true}));
   await context.close();
  }
  // Verify the actual entry from regular Word Trails on a separate local QA profile.
  const context=await browser.createBrowserContext(),page=await context.newPage();
  await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
  await page.goto(normal.href,{waitUntil:'domcontentloaded',timeout:120000});
  await page.waitForSelector('#daily-trail-entry');
  assert.equal(await page.$eval('#daily-trail-entry',a=>a.getAttribute('target')),'_top');
  await page.$eval('#daily-trail-entry',a=>a.click());
  await page.waitForFunction(()=>location.pathname.endsWith('/word-trails-daily-v1.html'),{timeout:30000});
  await page.waitForSelector('#daily-wheel .daily-wheel-letter',{timeout:30000});
  assert((await page.$eval('.daily-back',a=>a.href)).includes('index.html?wt_launch=native'));
  console.log('PASS_WORD_TRAILS_NORMAL_ENTRY_TO_DAILY_TEST');
  await context.close();
 }finally{await browser.close();}
})().catch(error=>{console.error('FAIL_DAILY_TRAIL',error.stack||error);process.exitCode=1;});
#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),p=require('puppeteer-core');
const pause=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await p.launch({executablePath:process.env.CHROME_BIN||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});try{
 const page=await b.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
 await page.goto(process.env.STORY_URL||'http://127.0.0.1:8893/index.html',{waitUntil:'load',timeout:120000});
 await pause(700);
 const welcome=await page.$('#daily-close');if(welcome&&await welcome.isVisible())await welcome.click();
 const settle=()=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 const tiles=async(modern,answer)=>page.evaluate(({modern,answer})=>{const list=[...document.querySelectorAll(modern?'#buhq-wheel [data-buhq]':'#wheel .tile')],used=new Set();return [...answer].map(c=>{const b=list.find(b=>b.textContent===c&&!used.has(b));if(!b)throw Error('Missing letter '+c);used.add(b);const r=b.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})},{modern,answer});
 await page.evaluate(()=>{window.storyWrongCueCount=0;const original=bu3846WrongTone;bu3846WrongTone=function(){window.storyWrongCueCount++;return original.apply(this,arguments)}});
 // A full incorrect wheel guess must give feedback without rewards.
 await page.evaluate(()=>bu3857Open('genesis_ep11',true));await settle();
 const wrongBefore=await page.evaluate(()=>({points:economy.points,coins:economy.coins}));
 await page.evaluate(()=>{const used=new Set(),letters=[...document.querySelectorAll('[data-buhq]')];for(const c of [...BU_HQ_WORDS[bu3857Current().id].answer].reverse()){const b=letters.find(b=>b.textContent===c&&!used.has(b));used.add(b);b.click();}});
 assert.equal(await page.evaluate(()=>!!bu3857State.solved[bu3857Current().id]),false);
 assert.deepEqual(await page.evaluate(()=>({points:economy.points,coins:economy.coins})),wrongBefore);await pause(800);
 // Actual browser touch taps, including the transition to a second discovery.
 await page.evaluate(()=>bu3857Open('genesis_ep11',true));await settle();
 for(let i=0;i<2;i++){
  const answer=await page.evaluate(()=>BU_HQ_WORDS[bu3857Current().id].answer);
  for(const xy of await tiles(true,answer)){await page.touchscreen.tap(xy.x,xy.y);await pause(35);}
  await page.waitForFunction(()=>!!bu3857State.solved[bu3857Current().id]);
  await page.waitForSelector('#bu3863-dialog-layer');await page.$eval('.bu3863-dialog-done',b=>b.click());await settle();
 }
 // Touch swipe: CDP delivers native touch events across actual letter centers.
 const cdp=await page.createCDPSession(),answer=await page.evaluate(()=>BU_HQ_WORDS[bu3857Current().id].answer),path=await tiles(true,answer);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[path[0]]});
 for(const xy of path.slice(1)){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[xy]});await pause(25);}
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await page.waitForFunction(()=>!!bu3857State.solved[bu3857Current().id]);
 await page.$eval('.bu3863-dialog-done',b=>b.click());await settle();
 // Cancellation clears selection and permits a new touch.
 const next=await tiles(true,await page.evaluate(()=>BU_HQ_WORDS[bu3857Current().id].answer));
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[next[0]]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
 assert.equal(await page.evaluate(()=>buHQPath.length),0);
 await page.touchscreen.tap(next[0].x,next[0].y);assert.equal(await page.evaluate(()=>buHQPath.length),1);
 // Original wheel: actual touch taps complete the first discovery too.
 await page.evaluate(()=>{focusHome();startChapter('genesis',false,true)});await settle();
 const legacyWord=await page.evaluate(()=>BEATS[stage].word);
 const legacyBefore=await page.evaluate(()=>({points:economy.points,coins:economy.coins}));
 for(const xy of await tiles(false,[...legacyWord].reverse().join(''))){await page.touchscreen.tap(xy.x,xy.y);await pause(35);}
 assert.equal(await page.evaluate(()=>mode),'clue');
 assert.deepEqual(await page.evaluate(()=>({points:economy.points,coins:economy.coins})),legacyBefore);await pause(500);
 for(const xy of await tiles(false,legacyWord)){await page.touchscreen.tap(xy.x,xy.y);await pause(35);}
 await page.waitForFunction(()=>mode==='reveal');await page.waitForSelector('#bu3864-next-legacy');
 assert.equal(await page.evaluate(()=>window.storyWrongCueCount),2,'One gentle wrong cue per incorrect word');
 // A restart cannot farm a previously paid reveal penalty.
 await page.evaluate(()=>{focusHome();startChapter('moses',false,true);economy.points=100;saveEconomy();document.getElementById('scene-reveal').click()});
 await page.$eval('#bu3864-modal-layer .gold-button',b=>b.click());
 const points=await page.evaluate(()=>economy.points);assert.equal(points,75);
 await page.evaluate(()=>{focusHome();startChapter('moses',false,true);document.getElementById('scene-reveal').click()});await page.$eval('#bu3864-modal-layer .gold-button',b=>b.click());assert.equal(await page.evaluate(()=>economy.points),points);
 // Same guard in the modern engine; dismissing reveal does not charge.
 page.on('dialog',d=>d.accept());await page.evaluate(()=>{focusHome();bu3857Open('genesis_ep10',true);document.getElementById('bu3857-reveal').click()});
 const modernPoints=await page.evaluate(()=>economy.points);assert.equal(modernPoints,50);
 await page.evaluate(()=>{bu3857Open('genesis_ep10',true);document.getElementById('bu3857-reveal').click()});assert.equal(await page.evaluate(()=>economy.points),modernPoints);
 // A failed wallet write aborts a full reveal in either engine.
 for(const modern of [true,false]){
  await page.evaluate(modern=>{focusHome();if(modern)bu3857Open('genesis_ep07',true);else startChapter('cain',false,true);economy.points=100;saveEconomy();window.originalStorySetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===REWARD_KEY)throw new DOMException('Simulated quota failure','QuotaExceededError');return window.originalStorySetItem.call(this,k,v)};document.getElementById(modern?'bu3857-reveal':'scene-reveal').click()},modern);
  if(!modern)await page.$eval('#bu3864-modal-layer .gold-button',b=>b.click());
  assert.equal(await page.evaluate(()=>economy.points),100);
  assert(await page.evaluate(modern=>modern?!bu3857State.solved[bu3857Current().id]:mode==='clue',modern));
  await page.evaluate(()=>Storage.prototype.setItem=window.originalStorySetItem);
 }
 // Recover a corrupted primary Story record from the verified recovery copy.
 await page.evaluate(()=>{bu3857Open('genesis_ep11',true);bu3857State.step=4;bu3857Save();localStorage.setItem(BU_GENESIS_KEY,'{broken')});
 await page.reload({waitUntil:'load',timeout:120000});assert(await page.$eval('#home',e=>!e.hidden));
 await page.evaluate(()=>bu3857Open('genesis_ep11'));assert.equal(await page.evaluate(()=>bu3857State.step),4);
 // Malformed older checkpoint fields must not crash or produce fractional steps.
 await page.evaluate(()=>{bu3857Saved.genesis_ep08={step:1.7,hints:{'g08-d02':Infinity},work:{'g08-d02':42},solved:[],revealed:[]};bu3857Open('genesis_ep08')});
 assert.equal(await page.evaluate(()=>bu3857State.step),1);assert.equal(await page.evaluate(()=>bu3857State.hints['g08-d02']),0);
 // Menu Continue keeps the exact modern scene; restart is confirmed and scoped.
 await page.evaluate(()=>{bu3857Open('genesis_ep11');bu3857State.step=4;bu3857Render();openMenu();document.querySelector('[data-nav="continue"]').click()});
 assert.equal(await page.evaluate(()=>bu3857State.step),4);assert(await page.$eval('#play',e=>e.hidden));
 await page.evaluate(()=>{openMenu();document.getElementById('bu-story-restart').click()});
 await page.$eval('#bu3864-modal-layer .secondary-button',b=>b.click());assert.equal(await page.evaluate(()=>bu3857State.step),4);
 await page.evaluate(()=>{openMenu();document.getElementById('bu-story-restart').click()});await page.$eval('#bu3864-modal-layer .gold-button',b=>b.click());assert.equal(await page.evaluate(()=>bu3857State.step),0);
 await page.evaluate(()=>{focusHome();startChapter('moses_midian',false,true);stage=2;render();openMenu();document.querySelector('[data-nav="continue"]').click()});assert.equal(await page.evaluate(()=>stage),2);
 await page.evaluate(()=>{focusHome();openMenu()});assert(await page.$eval('#bu-story-restart',e=>e.hidden));await page.evaluate(()=>closeMenu());
 // Each interactive Exodus scene must actually display its full solution on reveal.
 for(const id of ['exodus-10','exodus-11','exodus-12'])for(let step=0;step<10;step++){
  await page.evaluate(({id,step})=>{bu3857Open(id,true);bu3857State.step=step;bu3857Render();document.getElementById('bu3857-reveal').click()},{id,step});
  await page.waitForSelector('#bu3863-dialog-layer');
  assert(await page.evaluate(()=>document.getElementById('bu3863-dialog-layer').textContent.includes(bu3857SolutionText(bu3857Current()))),'Reveal did not deliver scene solution');
  await page.evaluate(()=>document.getElementById('bu3863-dialog-layer').buClose());
 }
 assert.deepEqual(errors,[]);console.log('PASS_STORY_TOUCH_RECOVERY',JSON.stringify({touchTapDiscoveries:3,touchSwipeDiscoveries:1,pointerCancel:true,incorrectWordNoRewardBothEngines:true,gentleWrongCueBothEngines:true,failedRevealNoCharge:true,revealOnceBothEngines:true,corruptPrimaryRecovery:true,malformedCheckpoint:true,menuContinueAndRestart:true,interactiveRevealSolutions:30,physicalDevice:false}));
 }finally{await b.close()}})().catch(e=>{console.error(e.stack||e);process.exitCode=1});

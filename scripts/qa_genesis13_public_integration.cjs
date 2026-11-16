#!/usr/bin/env node
'use strict';
// Ordinary TEST entry, public chapter sequence, and native Episode 13 engine. Synthetic Chromium profiles, not phones.
const assert=require('node:assert/strict'),fs=require('node:fs'),p=require('puppeteer-core'),cp=require('node:child_process');
const chrome=process.env.CHROME_BIN||cp.execSync('command -v chromium || command -v google-chrome',{encoding:'utf8'}).trim();
const base=process.env.STORY_URL||'http://127.0.0.1:8893/index.html',entry=base;
const content=JSON.parse(fs.readFileSync('story-adventure-content/genesis-episode13-bethel-v1.json'));
const delay=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const browser=await p.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-dev-shm-usage'],protocolTimeout:120000});
const evidence={entry:'index.html',viewports:[],physicalDevices:false};
try{
for(const [width,height] of [[320,568],[390,844]]){
 const context=await browser.createBrowserContext(),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().includes('genesis-episode13')&&r.status()>=400)errors.push('Episode 13 HTTP '+r.status()+' '+r.url())});
 await page.setViewport({width,height,isMobile:true,hasTouch:true,deviceScaleFactor:1});
 let game;
 async function load(){await page.goto(entry,{waitUntil:'load',timeout:120000});game=page;await game.waitForFunction(()=>['ready','failed'].includes(window.BUStoryGenesis13Test?.status),{timeout:60000});assert.equal(await game.evaluate(()=>window.BUStoryGenesis13Test.status),'ready');await game.waitForFunction(()=>window.BUStoryGenesis14Test?.status==='ready',{timeout:60000});await game.evaluate(()=>document.getElementById('daily-close')?.click());}
 const close=()=>game.evaluate(()=>{for(const id of ['bu3864-modal-layer','bu3863-dialog-layer','bu3898-scripture-layer'])document.getElementById(id)?.buClose?.()});
 const wallet=()=>game.evaluate(()=>({points:economy.points,coins:economy.coins}));
 const solve=async(touch=false)=>{
  const answer=await game.evaluate(()=>BU_HQ_WORDS[bu3857Current().id].answer);
  if(touch){const points=await game.evaluate(answer=>{const used=new Set(),tiles=[...document.querySelectorAll('#buhq-wheel [data-buhq]')];return [...answer].map(c=>{const b=tiles.find(b=>b.textContent===c&&!used.has(b));if(!b)throw Error('Missing tile');used.add(b);const r=b.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})},answer);for(const pt of points){await page.touchscreen.tap(pt.x,pt.y);await delay(40);}}
  else await game.evaluate(answer=>{const used=new Set(),tiles=[...document.querySelectorAll('#buhq-wheel [data-buhq]')];for(const c of answer){const b=tiles.find(b=>b.textContent===c&&!used.has(b));if(!b)throw Error('Missing tile '+c);used.add(b);b.click();}},answer);
  await game.waitForFunction(()=>!!bu3857State.solved[bu3857Current().id],{timeout:15000});
  await game.waitForSelector('#bu3863-dialog-layer .bu3863-dialog-done');
 };
 await load();
 const ids=await game.evaluate(()=>BU_GENESIS_IDS.slice());assert.equal(ids.length,8);assert(ids.includes('genesis_ep14'));assert(ids.includes('genesis_ep13'));assert(ids.includes('genesis_ep12'));
 await game.evaluate(()=>openEpisodes('genesis'));assert(await game.$('[data-genesis13]'));assert(!(await game.$eval('[data-genesis13]',b=>b.classList.contains('available'))));
 await game.$eval('[data-genesis13]',b=>b.click());assert.notEqual(await game.evaluate(()=>bu3857State?.book),'genesis_ep13');
 assert.equal(await game.evaluate(()=>bu3857Open('genesis_ep13')),false,'Direct open bypassed predecessor lock');
 await game.evaluate(()=>{completedChapters.genesis_ep12=true;persistUnified();makeEpisodes()});
 await game.$eval('[data-genesis13]',b=>b.click());
 assert.equal(await game.evaluate(()=>bu3857State.book),'genesis_ep13');assert.equal(await game.$eval('#bu3857-episode',e=>e.textContent),'GENESIS · EPISODE 13');
 // Every hint ladder: free /15 /25, immediate actual text, no letters, repeat reads free.
 for(let i=0;i<12;i++){
  await game.evaluate(i=>{bu3857State.step=i;bu3857Render();economy.coins=100;saveEconomy();document.getElementById('bu3857-hint').click()},i);
  assert.equal((await wallet()).coins,100);
  for(const balance of [85,60]){await game.$eval('#bu3864-modal-layer .gold-button',b=>b.click());assert.equal((await wallet()).coins,balance);}
  const r=await game.evaluate(()=>{const d=bu3857Current();return {hints:bu3857State.hints[d.id],letters:buHQHintLetters[d.id],body:document.querySelector('#bu3864-modal-layer .bu3864-modal-body').textContent,hidden:document.querySelector('#bu3864-modal-layer .gold-button').hidden,receipt:economy.hints['story-assist-v1:genesis_ep13:'+d.id]}});
  assert.deepEqual([r.hints,r.letters,r.hidden,r.receipt],[3,0,true,3]);for(const h of content.discoveries[i].progressiveHints)assert(r.body.includes(h.text));
  await close();await game.$eval('#bu3857-hint',b=>b.click());assert.equal((await wallet()).coins,60);await close();
 }
 console.log('GENESIS13_ALL_HINT_LADDERS_PASS',width);
 // Purchase failures on a fresh synthetic target; restore only this test's receipt.
 await game.evaluate(()=>{bu3857State.step=0;const k='story-assist-v1:genesis_ep13:g13-d01';delete economy.hints[k];bu3857State.hints['g13-d01']=0;economy.coins=0;saveEconomy();bu3857Render();document.getElementById('bu3857-hint').click()});
 await game.$eval('#bu3864-modal-layer .gold-button',b=>b.click());assert.equal((await wallet()).coins,0);assert.equal(await game.evaluate(()=>bu3857State.hints['g13-d01']),1);
 await game.evaluate(()=>{economy.coins=100;saveEconomy();window.g13OriginalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===REWARD_KEY)throw Error('Synthetic wallet write failure');return window.g13OriginalSetItem.call(this,k,v)}});
 await game.$eval('#bu3864-modal-layer .gold-button',b=>b.click());assert.equal((await wallet()).coins,100);assert.equal(await game.evaluate(()=>bu3857State.hints['g13-d01']),1);
 await game.evaluate(()=>Storage.prototype.setItem=window.g13OriginalSetItem);await close();
 // A lost chapter write must not charge again for a purchased clue.
 await game.evaluate(()=>{document.getElementById('bu3857-hint').click();Storage.prototype.setItem=function(k,v){if(k===BU_GENESIS_KEY)throw Error('Synthetic chapter failure');return window.g13OriginalSetItem.call(this,k,v)}});
 await game.$eval('#bu3864-modal-layer .gold-button',b=>b.click());assert.equal((await wallet()).coins,85);await game.evaluate(()=>Storage.prototype.setItem=window.g13OriginalSetItem);await close();
 await load();assert(await game.$eval('#home',e=>!e.hidden),'Refresh must return Home');await game.evaluate(()=>bu3857Open('genesis_ep13'));assert.equal(await game.evaluate(()=>bu3857State.hints['g13-d01']),2);await game.$eval('#bu3857-hint',b=>b.click());assert.equal((await wallet()).coins,85);await close();
 // Bible button previews exact references, closes without navigating and supports Escape.
 await game.$eval('#bu3863-scripture',b=>b.focus());await game.$eval('#bu3863-scripture',b=>b.click());
 assert(await game.$('#bu3898-scripture-layer'));const href=await game.$eval('#bu3898-scripture-layer a',a=>a.href);assert(href.endsWith('/genesis/34/'));await page.keyboard.press('Escape');assert(!(await game.$('#bu3898-scripture-layer')));assert.equal(await game.evaluate(()=>document.activeElement.id),'bu3863-scripture');
 // Wrong full word: no rewards; actual touch retries the same discovery.
 const beforeWrong=await wallet();await game.evaluate(()=>{const a=BU_HQ_WORDS[bu3857Current().id].answer,tiles=[...document.querySelectorAll('[data-buhq]')],used=new Set();for(const c of [...a].reverse()){const b=tiles.find(b=>b.textContent===c&&!used.has(b));used.add(b);b.click();}});assert.deepEqual(await wallet(),beforeWrong);assert.equal(await game.evaluate(()=>!!bu3857State.solved['g13-d01']),false);await delay(850);
 for(let i=0;i<12;i++){
  assert.equal(await game.evaluate(()=>bu3857Current().id),'g13-d'+String(i+1).padStart(2,'0'));
  await game.waitForFunction(()=>{const r=document.getElementById('buhq-wheel')?.getBoundingClientRect();return r&&r.bottom<=innerHeight+1&&r.right<=innerWidth+1},{timeout:10000});
  const layout=await game.evaluate(()=>{const d=bu3857Current(),wheel=document.getElementById('buhq-wheel'),w=wheel.getBoundingClientRect(),controls=['bu3863-scripture','bu3857-hint','bu3857-reveal','bu3863-story'];return {id:d.id,placeholder:document.querySelector('[data-bu-genesis13-scene]')?.dataset.buGenesis13Scene,sceneImages:document.querySelectorAll('#bu3857-content figure img').length,art:window.BUStoryGenesis13Test.artwork[d.id],imageSrc:document.querySelector('#bu3857-content figure img')?.getAttribute('src'),overflow:document.documentElement.scrollWidth>innerWidth+1,wheel:{top:w.top,bottom:w.bottom,left:w.left,right:w.right},outside:controls.filter(id=>{const r=document.getElementById(id).getBoundingClientRect();return r.top<0||r.bottom>innerHeight+1||r.left<0||r.right>innerWidth+1})}});
  assert.equal(layout.placeholder,layout.id);assert.equal(layout.sceneImages,layout.art.available?1:0);if(layout.art.available)assert.equal(layout.imageSrc,layout.art.path);assert.equal(layout.overflow,false);assert.deepEqual(layout.outside,[]);assert(layout.wheel.top>=0&&layout.wheel.bottom<=height+1&&layout.wheel.left>=-1&&layout.wheel.right<=width+1,JSON.stringify(layout));
  if(i===0&&process.env.STORY_SHOTS)await page.screenshot({path:`work/genesis13-gameplay-${width}.png`});
  await game.$eval('#bu3863-story',b=>b.click());assert((await game.$eval('#bu3863-dialog-layer',e=>e.textContent)).includes(content.discoveries[i].narration));await close();
  console.log('GENESIS13_PLAY',width,i+1);
  const start=await wallet();await solve(i===0);const after=await wallet();assert.equal(after.points-start.points,45);assert.equal(after.coins-start.coins,10);
  assert((await game.$eval('#bu3863-dialog-layer',e=>e.textContent)).includes(content.discoveries[i].explanation));
  if(i===0&&process.env.STORY_SHOTS)await page.screenshot({path:`work/genesis13-explanation-${width}.png`});
  if(i===11)assert((await game.$eval('#bu3863-dialog-layer .bu3863-dialog-done',e=>e.textContent)).startsWith('Complete Chapter'));
  // X returns to the answered board; a proper final action is not tied to old ten-scene count.
  if(i===9||i===11){await game.$eval('#bu3863-dialog-layer .bu3863-close',b=>b.click());assert.equal(await game.$eval('#bu3857-continue',b=>b.textContent),i===11?'Complete Chapter ✦':'Next Discovery →');await game.$eval('#bu3857-continue',b=>b.click());}
  else await game.$eval('#bu3863-dialog-layer .bu3863-dialog-done',b=>b.click());
  if(i===0){await load();assert(await game.$eval('#home',e=>!e.hidden));await game.evaluate(()=>bu3857Open('genesis_ep13'));assert.equal(await game.evaluate(()=>bu3857Current().id),'g13-d02');}
 }
 await game.waitForSelector('.bu-story-finale-actions');assert(await game.evaluate(()=>bu3857State.complete));assert((await game.$eval('.bu3863-finale',e=>e.textContent)).includes(content.completionMessage));
 assert.equal(await game.$eval('#bu3857-progress',e=>e.textContent),'12/12');
 for(const selector of ['#bu3857-next-episode','#bu3857-replay','#bu-story-finale-chapters']){
  const r=await game.$eval(selector,e=>{e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom}});assert(r.left>=-1&&r.right<=width+1&&r.top>=-1&&r.bottom<=height+1,selector+JSON.stringify(r));
 }
 if(process.env.STORY_SHOTS)await page.screenshot({path:`work/genesis13-finale-${width}.png`});
 const completeWallet=await wallet();await game.$eval('#bu-story-finale-chapters',b=>b.click());assert(await game.$('[data-genesis13]'));assert.equal(await game.evaluate(()=>completedChapters.genesis_ep13),true);assert.deepEqual(await game.evaluate(()=>BU_GENESIS_IDS),ids);
 // Completion survives reload; replaying all twelve cannot farm discoveries or chapter bonus.
 await load();await game.evaluate(()=>bu3857Open('genesis_ep13'));assert(await game.evaluate(()=>bu3857State.complete));assert.deepEqual(await wallet(),completeWallet);await game.$eval('#bu3857-replay',b=>b.click());
 for(let i=0;i<12;i++){await solve();await game.$eval('#bu3863-dialog-layer .bu3863-dialog-done',b=>b.click());}
 assert.deepEqual(await wallet(),completeWallet);
 // Menu Continue preserves the scene; Restart cancel and confirm delegate to native controls.
 page.on('dialog',d=>d.accept());await game.evaluate(()=>{bu3857Open('genesis_ep13',true);bu3857State.step=5;bu3857Render();openMenu();document.querySelector('[data-nav="continue"]').click()});assert.equal(await game.evaluate(()=>bu3857State.step),5);
 await game.evaluate(()=>{openMenu();document.getElementById('bu-story-restart').click()});await game.$eval('#bu3864-modal-layer .secondary-button',b=>b.click());assert.equal(await game.evaluate(()=>bu3857State.step),5);
 await game.evaluate(()=>{openMenu();document.getElementById('bu-story-restart').click()});await game.$eval('#bu3864-modal-layer .gold-button',b=>b.click());assert.equal(await game.evaluate(()=>bu3857State.step),0);
 // CDP swipe through the original wheel; the last touch must not advance its explanation.
 const swipeBefore=await wallet();
 const swipePoints=await game.evaluate(()=>{const used=new Set(),tiles=[...document.querySelectorAll('[data-buhq]')];return [...BU_HQ_WORDS[bu3857Current().id].answer].map(c=>{const b=tiles.find(b=>b.textContent===c&&!used.has(b));used.add(b);const r=b.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})});
 const cdp=await page.createCDPSession();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[swipePoints[0]]});
 for(const pt of swipePoints.slice(1)){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[pt]});await delay(35);}
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await game.waitForFunction(()=>!!bu3857State.solved['g13-d01']);assert.equal(await game.evaluate(()=>bu3857State.step),0,'Swipe skipped explanation');
 await game.waitForSelector('#bu3863-dialog-layer .bu3863-dialog-done');assert.deepEqual(await wallet(),swipeBefore);await close();await game.evaluate(()=>bu3857Open('genesis_ep13',true));
 // Reveal is a separate -25 Point action, once per discovery; it cannot earn fresh rewards.
 const revealBefore=await wallet();await game.$eval('#bu3857-reveal',b=>b.click());await game.waitForFunction(()=>!!bu3857State.revealed['g13-d01']);assert.equal((await wallet()).points,revealBefore.points-25);await close();await game.evaluate(()=>bu3857Open('genesis_ep13',true));await game.$eval('#bu3857-reveal',b=>b.click());assert.equal((await wallet()).points,revealBefore.points-25);await close();
 assert.deepEqual(await game.evaluate(()=>BU_GENESIS_IDS),ids);assert.deepEqual(errors,[]);
 evidence.viewports.push({width,height,discoveriesCompleted:12,replayed:12,allHintLadders:12,prices:[0,15,25],letterReveals:0,correctAndWrong:true,actualTouchRetry:true,actualTouchSwipe:true,noGameplayOverflow:true,rewardOnce:true,revealOnce:true,saveFailureRollback:true,purchaseRecovery:true,refreshHome:true,resume:true,menuContinueRestart:true,finaleAndAllActions:true,publicUnlockAndRegistrationPreserved:true});
 await context.close();
}
console.log('PASS_GENESIS13_PUBLIC_TEST_INTEGRATION',JSON.stringify(evidence));if(process.env.STORY_EVIDENCE)fs.writeFileSync(process.env.STORY_EVIDENCE,JSON.stringify(evidence,null,2)+'\n');
}finally{await browser.close()}})().catch(e=>{console.error(e.stack||e);process.exitCode=1});

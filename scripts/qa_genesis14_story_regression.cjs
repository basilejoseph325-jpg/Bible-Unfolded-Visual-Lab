#!/usr/bin/env node
'use strict';
// Episode 14 candidate regression, adapted from the existing full Story runner.
// Local synthetic profiles only. DOM player controls exercise both original engines;
// real CDP touch input is checked separately. This is not physical-device acceptance.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const puppeteer=require('puppeteer-core');
const {execSync}=require('node:child_process');
const chrome=execSync('command -v chromium || command -v google-chrome',{encoding:'utf8'}).trim();
const base=process.env.STORY_URL||'http://127.0.0.1:8893/index.html';
const pause=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const browser=await puppeteer.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-dev-shm-usage'],protocolTimeout:120000});
 const evidence={viewports:[],errors:[]};
 try{
 for(const [width,height] of [[320,568],[430,932]]){
  const context=await browser.createBrowserContext(),page=await context.newPage();
  page.on('pageerror',e=>evidence.errors.push(e.message));
  await page.setViewport({width,height,isMobile:true,hasTouch:true,deviceScaleFactor:1});
  await page.goto(new URL('genesis-episode14-preview.html',base).href,{waitUntil:'load',timeout:120000});
  let game=page.frames().find(f=>f.url().includes('index.html'));
  await game.waitForFunction(()=>window.BUStoryGenesis14Test?.status==='ready',{timeout:60000});
  await game.waitForFunction(()=>typeof bu3857Open==='function'&&typeof bu3864AskHint==='function'&&window.BUStoryGenesis13Test?.status==='ready');
  const row={width,height,modern:0,legacy:0,finales:0,hints:[],overflow:[],pendingArt:[]};
  // Ledger snapshots make replay checks independent of daily welcome rewards.
  const ledger=()=>game.evaluate(()=>({points:economy.points,coins:economy.coins}));
  const close=()=>game.evaluate(()=>{for(const id of ['bu3864-modal-layer','bu3863-dialog-layer','bu3898-scripture-layer']){const e=document.getElementById(id);if(e?.buClose)e.buClose();else e?.remove();}});
  const open=async id=>{await close();await game.evaluate(id=>{if(id.startsWith('genesis_ep')||id.startsWith('exodus-'))bu3857Open(id,true);else startChapter(id,false,true);},id);await pause(70);};
  const buy=()=>game.evaluate(()=>{const b=document.querySelector('#bu3864-modal-layer .bu3864-modal-body .gold-button');assertButton(b);b.click();function assertButton(b){if(!b||b.hidden)throw Error('No offered purchase');}});
  // Each price ladder: first free; reopen free; every paid stage immediate;
  // exhausted help, low balance, failed wallet write, refresh and checkpoint failure.
  for(const [id,prices] of [['genesis',[15,30]],['genesis_ep07',[15,20,25]],['genesis_ep10',[15,25]],['genesis_ep11',[15,25]],['exodus-10',[15,30]]]){
   await open(id);
   await game.evaluate(()=>{economy.coins=500;saveEconomy();});
   const bulb=id==='genesis'?'#scene-hint':'#bu3857-hint';
   await game.$eval(bulb,b=>b.click());assert.equal((await ledger()).coins,500);
   await close();await game.$eval(bulb,b=>b.click());assert.equal((await ledger()).coins,500);
   let expected=500;
   for(const price of prices){await buy();expected-=price;assert.equal((await ledger()).coins,expected);}
   if(id==='genesis_ep07'){
    assert(await game.$eval('.bu-story-guided-letter',b=>b.getAttribute('aria-label').includes('revealed')));
   }
   await close();await game.$eval(bulb,b=>b.click());assert.equal((await ledger()).coins,expected);
   row.hints.push({id,prices,balance:expected});
  }
  console.log('HINT_LADDERS_PASSED');
  // Wallet failure must leave both balance and purchased level unchanged.
  await open('genesis_ep08');await game.evaluate(()=>{economy.coins=100;saveEconomy();document.getElementById('bu3857-hint').click();window.originalStorySetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===REWARD_KEY)throw new DOMException('Simulated full storage','QuotaExceededError');return window.originalStorySetItem.call(this,k,v)}});
  await buy();assert.equal((await ledger()).coins,100);
  assert.equal(await game.evaluate(()=>bu3857State.hints[bu3857Current().id]),1);
  await game.evaluate(()=>{Storage.prototype.setItem=window.originalStorySetItem;economy.coins=0;saveEconomy();});
  await buy();assert.equal((await ledger()).coins,0);
  await game.evaluate(()=>{economy.coins=100;saveEconomy();});await buy();assert.equal((await ledger()).coins,85);
  console.log('WALLET_FAILURE_PASSED');
  // Losing only the chapter checkpoint must not lose an already-paid hint.
  await close();await open('genesis_ep09');
  await game.evaluate(()=>{economy.coins=100;saveEconomy();document.getElementById('bu3857-hint').click();window.originalStorySetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===BU_GENESIS_KEY)throw new DOMException('Simulated chapter write failure','QuotaExceededError');return window.originalStorySetItem.call(this,k,v)}});
  await buy();assert.equal((await ledger()).coins,85);
  await game.evaluate(()=>Storage.prototype.setItem=window.originalStorySetItem);
  console.log('RELOADING');await page.reload({waitUntil:'load',timeout:120000});game=page.frames().find(f=>f.url().includes('index.html'));await game.waitForFunction(()=>window.BUStoryGenesis14Test?.status==='ready',{timeout:60000});await game.waitForFunction(()=>window.BUStoryGenesis13Test?.status==='ready');
  assert(await game.$eval('#home',e=>!e.hidden),'Reload must return home');
  await game.evaluate(()=>bu3857Open('genesis_ep09'));
  assert.equal(await game.evaluate(()=>bu3857State.hints['g09-d01']),2,'Paid receipt must recover after chapter save failure');
  console.log('RECEIPT_RECOVERY_PASSED');
  // Navigation removes modal layers and preserves the original destinations.
  await game.$eval('#bu3857-hint',b=>b.click());await game.evaluate(()=>focusHome());
  assert.equal(await game.$('#bu3864-modal-layer'),null);
  // Check every later-engine discovery through its real rendered controls.
  const modern=await game.evaluate(()=>[...BU_GENESIS_IDS,...BU3857_IDS]);
  for(const id of modern){
   await open(id);console.log('PLAY_CHAPTER',id);
   const chapterScenes=await game.evaluate(id=>BU3857_DATA[id]?.discoveries?.length||0,id);
   assert(Number.isInteger(chapterScenes)&&chapterScenes>=1,'Missing chapter discovery records '+id);
   for(let n=0;n<chapterScenes;n++){
    await close();
    await game.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    const problem=await game.evaluate(()=>{
     const root=document.getElementById('bu3857-content'),d=bu3857Current();
     const image=root.querySelector('figure img');
     const pending=bu3857State.book==='genesis_ep14'||(bu3857State.book==='genesis_ep13'&&!window.BUStoryGenesis13Test.artwork[d.id].available);
     if(pending){if(image||!root.querySelector('[data-bu-genesis13-scene],[data-bu-genesis14-scene]')?.textContent.includes('illustration pending'))throw Error('Unlabelled or substituted pending art '+d.id);}
     else if(!image)throw Error('No scene art '+d.id);
     const viewport={w:innerWidth,h:innerHeight};
     const out=[...root.querySelectorAll('button')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&(r.right>viewport.w+2||r.bottom>viewport.h+2||r.left< -2)}).map(e=>e.id||e.dataset.id||e.textContent);
     // An incomplete/wrong answer must never solve or reward a discovery.
     const points=economy.points,coins=economy.coins;
     const wrong=root.querySelector('#bu3857-check');if(wrong)wrong.click();
     if(bu3857State.solved[d.id]||economy.points!==points||economy.coins!==coins)throw Error('Incorrect check rewarded '+d.id);
     document.getElementById('bu3863-dialog-layer')?.buClose?.();
     const click=(a,id)=>{const b=root.querySelector('[data-action="'+a+'"][data-id="'+id+'"]');if(!b)throw Error('Missing '+a+' '+id+' '+d.id);b.click();};
     const word=BU_HQ_WORDS[d.id];
     if(word){const letters=[...root.querySelectorAll('[data-buhq]')],used=new Set();for(const c of word.answer){const b=letters.find(b=>b.textContent===c&&!used.has(b));if(!b)throw Error('Missing letter '+d.id);used.add(b);b.click();}}
     else{const {type:t,solution:s}=d.interaction;
      if(t==='order_cards')for(const x of s.order)click('order',x);
      else if(t==='route_trace')for(const x of s.path.slice(1))click('route',x);
      else if(t==='find_hotspots'||t==='doorframe_trace')for(const x of s.targetIds||s.markedIds)click('toggle',x);
      else for(const [k,v] of Object.entries(s.pairs?Object.fromEntries(s.pairs):s.assignments||s.placements||s.directionsByStage||s.filterByScene)){click('choose',k);click('assign',v);}
      document.getElementById('bu3857-check').click();
     }
     return {id:d.id,out,pendingArtwork:pending};
    });
    if(problem.pendingArtwork)row.pendingArt.push(problem.id);
    row.overflow.push(...problem.out.map(control=>({id:problem.id,control})));
    await game.waitForFunction(()=>!!bu3857State.solved[bu3857Current().id]);
    await close();await game.$eval('#bu3857-continue',b=>b.click());row.modern++;
   }
   await game.waitForSelector('.bu-story-finale-actions');
   assert.equal(await game.$$eval('.bu-story-finale-actions button',a=>a.length),2);
   if(id==='genesis_ep14'){assert(await game.$('[data-bu-genesis14-art-pending]'));assert(!(await game.$('.bu-story-finale-cinematic-photo')),'No unrelated Episode 14 finale art');}
   else if(id==='genesis_ep13'&&!await game.evaluate(()=>window.BUStoryGenesis13Test.artwork['g13-d09'].available)){
    assert(await game.$('[data-bu-genesis13-art-pending]'),'Pending Bethel illustration must be labelled');
    assert(!(await game.$('.bu-story-finale-cinematic-photo')),'Do not substitute unrelated art');
   }else{
    assert(await game.$('.bu-story-finale-cinematic-photo'),'Missing chapter-specific finale photo '+id);
    assert(await game.$('.bu-story-finale-atmosphere-art'),'Missing ending atmosphere '+id);
   }
   row.finales++;
   const before=await ledger();
   await game.$eval('#bu3857-replay',b=>b.click());
   await game.evaluate(()=>{const root=document.getElementById('bu3857-content'),d=bu3857Current();if(BU_HQ_WORDS[d.id]){const letters=[...root.querySelectorAll('[data-buhq]')],used=new Set();for(const c of BU_HQ_WORDS[d.id].answer){const b=letters.find(b=>b.textContent===c&&!used.has(b));used.add(b);b.click();}}});
   if(id.startsWith('genesis'))assert.deepEqual(await ledger(),before,'Replay farmed rewards '+id);
  }
  // Original nine chapters: use pointer events on visible letter controls.
  for(const id of ['genesis','eden','cain','noah','babel','abraham','moses','moses_midian','moses_bush']){
   await open(id);console.log('PLAY_LEGACY',id);
   const total=await game.evaluate(()=>BEATS.length);
   for(let n=0;n<total;n++){
    await close();
    await game.evaluate(()=>{const used=new Set(),tiles=[...document.querySelectorAll('#wheel .tile')];for(const c of BEATS[stage].word){const tile=tiles.find(b=>b.textContent===c&&!used.has(b));if(!tile)throw Error('Missing early letter');used.add(tile);tile.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:1,clientX:0,clientY:0}));tile.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:1}));}});
    await game.waitForFunction(()=>mode==='reveal');
    await game.waitForSelector('#bu3864-next-legacy');
    await close();await game.$eval('#bu3864-next-legacy',b=>b.click());row.legacy++;
   }
   assert.equal(await game.evaluate(()=>mode),'done');row.finales++;
  }
  assert.equal(row.modern,117);assert.equal(row.legacy,84);assert.equal(row.finales,20);
  assert.deepEqual(row.overflow,[],'Active controls clipped');
  assert.deepEqual(row.pendingArt,Array.from({length:12},(_,i)=>'g14-d'+String(i+1).padStart(2,'0')),'Only Episode 14 awaits artwork');
  evidence.viewports.push(row);console.log('PASS_STORY_ALL_PLAYABLE',JSON.stringify(row));await context.close();
 }
 assert.deepEqual(evidence.errors,[]);if(process.env.STORY_EVIDENCE)fs.writeFileSync(process.env.STORY_EVIDENCE,JSON.stringify(evidence,null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});

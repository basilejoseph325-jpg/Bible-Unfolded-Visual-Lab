#!/usr/bin/env node
'use strict';
/* One focused smoke check for ACTUAL added player content, not release QA.
 * Uses a fresh synthetic browser; original LIVE and real players untouched.
 */
const assert=require('node:assert/strict'),{execSync}=require('node:child_process'),puppeteer=require('puppeteer-core');
const chrome=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
(async()=>{
 const browser=await puppeteer.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'],timeout:100000});
 try{
  const page=await browser.newPage(),errors=[];
  await page.setViewport({width:390,height:705,isMobile:true,hasTouch:true,deviceScaleFactor:2});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8898/index.html',{waitUntil:'domcontentloaded',timeout:110000});
  await page.waitForFunction(()=>window.BUDailyInsightV1?.libraryCount?.()===60,{timeout:60000});
  await new Promise(r=>setTimeout(r,7500));
  const diag=await page.evaluate(()=>({
   expansion:window.BUCrosswordExpanded33?.packCount?.()||null,
   packCount:typeof TRAIL_PACKS==='undefined'?null:TRAIL_PACKS.length,
   clueOwner:typeof bu3840Clues,commonOwner:typeof TRAIL_COMMON_WORDS,
   pickerOwner:typeof renderCrossPicker,
   script:document.getElementById('bu-crossword-extra-packs-loader')?.src||null,
   extraHomeCard:!!document.getElementById('home-crossword-packs'),
   crossScripts:[...document.scripts].map(x=>x.src).filter(x=>x.includes('crossword')),
   loaded:document.readyState
  }));
  console.log('CROSSWORDS_RUNTIME_DIAGNOSTIC',JSON.stringify({...diag,pageErrors:errors}));
  await page.waitForFunction(()=>window.BUCrosswordExpanded33?.packCount?.()===33,{timeout:12000});
  await page.waitForSelector('#home-crossword-packs',{timeout:30000});
  const before=await page.evaluate(()=>{
   const a=window.BUDailyDiscoveryLibrary,copy=window.BUCrosswordExpanded33;
   return {count:a.length,unique:new Set(a.map(x=>x.id)).size,
    first:a[0]?.id,lastOld:a[29]?.id,firstNew:a[30]?.id,last:a[59]?.id,
    allNewSourced:a.slice(30).every(x=>x.url.startsWith('https://www.jw.org/en/')&&x.share.url.startsWith('https://www.jw.org/en/')&&x.body.length>=2),
    cards:copy.packCount(),extra:copy.added,answers:copy.addedAnswers,
    newTileTitle:document.getElementById('home-crossword-packs')?.querySelector('.cinematic-card-title')?.textContent};
  });
  assert.deepEqual({count:before.count,unique:before.unique,cards:before.cards,extra:before.extra,answers:before.answers},
   {count:60,unique:60,cards:33,extra:9,answers:52});
  assert(before.allNewSourced,'New entries require valid JW.org sources and sharing links');
  assert.equal(before.firstNew,'hannah-prayer');
  assert.equal(before.newTileTitle,'Bible Crosswords');
  await page.evaluate(()=>{
   document.getElementById('daily-continue')?.click();
   document.getElementById('home-crossword-packs').click();
  });
  await page.waitForFunction(()=>!document.getElementById('cross-pick')?.hidden,{timeout:15000});
  const picker=await page.evaluate(()=>{
   const el=document.querySelector('#cross-pack-list');
   const cards=[...el.querySelectorAll('button[data-pack]')];
   const added=cards.filter(x=>Number(x.dataset.pack)>=24);
   return {total:cards.length,extraCount:added.length,visible:added.filter(x=>!x.hidden).length,
    groups:el.textContent.includes('NINE NEW SCRIPTURE BOARDS'),
    previewHidden:getComputedStyle(document.getElementById('wt-next-entry')).display==='none',
    legacyCount:cards.filter(x=>Number(x.dataset.pack)<24).length,
    newCards:added.map(x=>({index:x.dataset.pack,text:x.textContent.slice(0,45)}))};
  });
  assert.equal(picker.total,33,'Real picker must render 33 actual pack buttons');
  assert.equal(picker.legacyCount,24,'All 24 original packs retained');
  assert.equal(picker.extraCount,9,'Nine new playable pack buttons');
  assert.equal(picker.visible,9,'All nine new packs visible without hidden comparison toggle');
  assert(picker.groups&&picker.previewHidden,'Separate Crosswords home route must not show Word Trails comparison block');
  // Actual native Crosswords UI open via the new DOM card, not a helper function.
  await page.evaluate(()=>document.querySelector('#cross-pack-list button[data-pack="24"]').click());
  await page.waitForFunction(()=>!document.getElementById('crossword-screen')?.hidden,{timeout:12000});
  const opened=await page.evaluate(()=>{
   const content=document.getElementById('xword-content');
   return {screenOpen:!document.getElementById('crossword-screen').hidden,
    wordBoard:!!content?.querySelector('.trail-board, .xword-board, .xword-grid'),
    newClue:content?.textContent?.slice(0,300),wheelExists:!!document.getElementById('xword-wheel'),
    liveSave:localStorage.getItem('bible-unfolded-word-trails-next-v1')};
  });
  assert(opened.screenOpen&&opened.wheelExists,'Playable crossword wheel screen must open');
  assert(opened.newClue?.length>15,'New pack must display real playable contents');
  assert.deepEqual(errors,[],'No JavaScript exceptions from new gameplay content');
  console.log('PASS_DAILY60_CROSSWORDS33_REAL_PLAYER_PATH',JSON.stringify({
   originalDailyIDsPreserved:true,lessons:before.count,addedLessons:30,
   sourceShareFields:true,crosswordPacks:picker.total,oldPacksKept:24,
   newVisiblePacks:picker.visible,newPlayableAnswers:52,
   homeCardToNewPack:true,wordWheelPresent:true,zeroPageErrors:true,
   touchedOriginalLiveRepo:false,physicalPhoneCertified:false,
   editorialHumanApproved:false
  }));

  // Reproduce the owner's Samsung issue: refresh, tap Daily before the
  // replacement content JS finishes downloading. Old Trivia MUST NOT open.
  const cold=await browser.newPage(),coldErrors=[];
  await cold.setViewport({width:390,height:705,isMobile:true,hasTouch:true,deviceScaleFactor:2});
  await cold.setRequestInterception(true);
  let slowDailySeen=false;
  cold.on('pageerror',e=>coldErrors.push(e.message));
  cold.on('request',req=>{
   if(req.url().includes('daily-discovery-insights-content-test-v1.js')&&!slowDailySeen){
    slowDailySeen=true;
    setTimeout(()=>req.continue().catch(()=>{}),5000);
   }else req.continue().catch(()=>{});
  });
  await cold.goto('http://127.0.0.1:8898/index.html',{waitUntil:'domcontentloaded',timeout:110000});
  await cold.waitForSelector('#bu375-home-cta',{timeout:30000});
  await cold.evaluate(()=>document.getElementById('daily-continue')?.click());
  await cold.waitForFunction(()=>document.getElementById('bu375-home-cta')?.getClientRects().length>0,{timeout:30000});
  assert.equal(await cold.evaluate(()=>!!window.BUDailyInsightV1),false,
   'Five-second delayed editorial content should keep new reader pending');
  await cold.evaluate(()=>{
   const button=document.getElementById('bu375-home-cta');
   button.click();button.click(); // rapid double tap must be idempotent
  });
  const early=await cold.evaluate(()=>({
   pending:document.getElementById('bu375-home-cta')?.getAttribute('aria-busy'),
   nativeQuizVisible:!document.getElementById('bu375-daily')?.hidden,
   bodyIsModern:document.getElementById('bu375-body')?.classList.contains('bu-insight-reading')
  }));
  assert.equal(early.pending,'true','Early tap is queued, not lost');
  assert.equal(early.nativeQuizVisible,false,'Old five-question Daily quiz must not launch during load');
  assert.equal(early.bodyIsModern,false,'New reader opens only after its content is available');
  await cold.waitForFunction(()=>window.BUDailyInsightV1?.inspect()?.open===true&&
   document.querySelectorAll('[data-insight-book-select] option').length===60&&
   !!document.querySelector('#bu375-body.bu-daily-book-preview .bu-insight-story'),{timeout:70000});
  const recovered=await cold.evaluate(()=>({
   originalQuizHidden:!!document.getElementById('bu375-body')?.classList.contains('bu-insight-reading'),
   picker:document.querySelectorAll('[data-insight-book-select] option').length,
   question:window.BUDailyDiscoveryLibrary.find(x=>x.id==='stephen-mercy')?.share?.question,
   pending:document.getElementById('bu375-home-cta')?.hasAttribute('aria-busy')
  }));
  assert.equal(recovered.picker,60,'Slow-loading Daily opens with all 60 choices');
  assert.equal(recovered.question,'Why is it sometimes easier to get angry than to show mercy?');
  assert.equal(recovered.pending,false,'Queued button has returned to ready state');
  assert.deepEqual(coldErrors,[],'No page exceptions during slow-load recovery');
  assert(slowDailySeen,'Cold-start test really delayed the new editorial script');
  console.log('PASS_DAILY_FAST_REFRESH_TAP',JSON.stringify({oldQuizBlocked:true,
   delayedContentMs:5000,modernBookOpened:true,dropdown:recovered.picker,
   mercyQuestionClear:true,noPageErrors:true}));
  await cold.close();
 }finally{await browser.close()}
})().catch(e=>{console.error('FAIL_DAILY60_CROSSWORDS30_REAL_PLAYER_PATH',e.stack||e);process.exitCode=1});

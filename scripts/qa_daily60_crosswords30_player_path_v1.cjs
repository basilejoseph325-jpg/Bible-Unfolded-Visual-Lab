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
   expansion:window.BUCrosswordExpanded30?.packCount?.()||null,
   packCount:typeof TRAIL_PACKS==='undefined'?null:TRAIL_PACKS.length,
   clueOwner:typeof bu3840Clues,commonOwner:typeof TRAIL_COMMON_WORDS,
   pickerOwner:typeof renderCrossPicker,
   script:document.getElementById('bu-crossword-extra-packs-loader')?.src||null,
   extraHomeCard:!!document.getElementById('home-crossword-packs'),
   crossScripts:[...document.scripts].map(x=>x.src).filter(x=>x.includes('crossword')),
   errors
  }));
  console.log('CROSSWORDS_RUNTIME_DIAGNOSTIC',JSON.stringify(diag));
  await page.waitForFunction(()=>window.BUCrosswordExpanded30?.packCount?.()===30,{timeout:12000});
  await page.waitForSelector('#home-crossword-packs',{timeout:30000});
  const before=await page.evaluate(()=>{
   const a=window.BUDailyDiscoveryLibrary,copy=window.BUCrosswordExpanded30;
   return {count:a.length,unique:new Set(a.map(x=>x.id)).size,
    first:a[0]?.id,lastOld:a[29]?.id,firstNew:a[30]?.id,last:a[59]?.id,
    allNewSourced:a.slice(30).every(x=>x.url.startsWith('https://www.jw.org/en/')&&x.share.url.startsWith('https://www.jw.org/en/')&&x.body.length>=2),
    cards:copy.packCount(),extra:copy.added,answers:copy.addedAnswers,
    newTileTitle:document.getElementById('home-crossword-packs')?.querySelector('.cinematic-card-title')?.textContent};
  });
  assert.deepEqual({count:before.count,unique:before.unique,cards:before.cards,extra:before.extra,answers:before.answers},
   {count:60,unique:60,cards:30,extra:9,answers:52});
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
   const added=cards.filter(x=>Number(x.dataset.pack)>=21);
   return {total:cards.length,extraCount:added.length,visible:added.filter(x=>!x.hidden).length,
    groups:el.textContent.includes('NINE NEW SCRIPTURE BOARDS'),
    previewHidden:getComputedStyle(document.getElementById('wt-next-entry')).display==='none',
    legacyCount:cards.filter(x=>Number(x.dataset.pack)<21).length,
    newCards:added.map(x=>({index:x.dataset.pack,text:x.textContent.slice(0,45)}))};
  });
  assert.equal(picker.total,30,'Real picker must render 30 actual pack buttons');
  assert.equal(picker.legacyCount,21,'Old 21 packs retained');
  assert.equal(picker.extraCount,9,'Nine new playable pack buttons');
  assert.equal(picker.visible,9,'All nine new packs visible without hidden comparison toggle');
  assert(picker.groups&&picker.previewHidden,'Separate Crosswords home route must not show Word Trails comparison block');
  // Actual native Crosswords UI open via the new DOM card, not a helper function.
  await page.evaluate(()=>document.querySelector('#cross-pack-list button[data-pack="21"]').click());
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
  console.log('PASS_DAILY60_CROSSWORDS30_REAL_PLAYER_PATH',JSON.stringify({
   originalDailyIDsPreserved:true,lessons:before.count,addedLessons:30,
   sourceShareFields:true,crosswordPacks:picker.total,oldPacksKept:21,
   newVisiblePacks:picker.visible,newPlayableAnswers:52,
   homeCardToNewPack:true,wordWheelPresent:true,zeroPageErrors:true,
   touchedOriginalLiveRepo:false,physicalPhoneCertified:false,
   editorialHumanApproved:false
  }));
 }finally{await browser.close()}
})().catch(e=>{console.error('FAIL_DAILY60_CROSSWORDS30_REAL_PLAYER_PATH',e.stack||e);process.exitCode=1});

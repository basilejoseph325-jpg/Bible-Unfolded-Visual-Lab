#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const puppeteer=require('puppeteer-core');
const {execSync}=require('node:child_process');
const chrome=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
(async()=>{
 const browser=await puppeteer.launch({executablePath:chrome,headless:true,
 args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'],protocolTimeout:125000});
 try{
  for(const [w,h] of [[390,705],[320,568]]){
   const page=await browser.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.setViewport({width:w,height:h,isMobile:true,hasTouch:true,deviceScaleFactor:2});
   const reply=await page.goto('http://127.0.0.1:8893/index.html',{waitUntil:'domcontentloaded',timeout:115000});
   assert.equal(reply.status(),200);
   await page.waitForFunction(()=>typeof bu3857Open==='function'&&typeof buHQWordBoard==='function',{timeout:85000});
   const oldInventory=await page.evaluate(()=>({
       old:Object.keys(BU_HQ_WORDS).filter(k=>/^g0[789]-d/.test(k)).length,
       episode10:BU3857_DATA.genesis_ep10.discoveries.length,
       noNehemiah:!document.getElementById('bu-story-explorer-entry')}));
   assert.deepEqual(oldInventory,{old:30,episode10:10,noNehemiah:true});
   await page.evaluate(()=>bu3857Open('genesis_ep10',true));
   for(const [index,expected] of [[2,'esau-jacob-brothers.webp'],[3,'esau-birthright-stew.webp']]){
     await page.evaluate(i=>{bu3857State.step=i;bu3857Render();},index);
     await page.waitForFunction(()=>document.querySelector('#bu3857-content figure.bu3863-image img')?.complete,{timeout:9000});
     const img=await page.evaluate(()=>{
       const el=document.querySelector('#bu3857-content figure.bu3863-image img');
       return{src:el?.getAttribute('src'),alt:el?.getAttribute('alt'),
         width:el?.naturalWidth,height:el?.naturalHeight,
         top:el?.getBoundingClientRect().top,
         wheelTop:document.querySelector('#buhq-wheel')?.getBoundingClientRect().top};
     });
     assert(img.src?.endsWith(expected),'Expected story-specific image: '+expected);
     assert(img.width>=500&&img.height>=300,'Real image failed to load: '+expected);
     assert(img.alt.length>35,'Meaningful text alternative required');
     assert(img.top<img.wheelTop,'Historical art appears before the word wheel');
   }
   const cases=await page.evaluate(()=>{
     const result={};
     for(let i=0;i<10;i++){
       bu3857State.step=i;bu3857Render();
       const d=bu3857Current(),info=BU_HQ_WORDS[d.id];
       result[d.id]={clue:info.clue,answer:info.answer,hints:[info.hint1,info.hint2,info.hint3],
         wheel:!!document.querySelector('#buhq-wheel'),
         oldError:document.getElementById('bu3857-content').textContent.includes('Puzzle unavailable')};
     }
     return result;
   });
   assert.equal(Object.keys(cases).length,10);
   for(const [id,v] of Object.entries(cases)){
     assert(v.wheel&&!v.oldError,'Old wheel error: '+id);
     assert(v.clue.length>=55,'Question too short: '+id);
     assert(v.hints.length===3&&v.hints.every(s=>s.length>40),'Missing conceptual hint: '+id);
     assert(!v.hints.some(s=>/Letter \d+ of|answer now starts with/i.test(s)),'Letters leaked into paid hints');
   }
   const hint=await page.evaluate(()=>{
     const id='g10-d03';
     bu3857State.step=2;
     bu3857State.hints[id]=0;
     bu3857Render();
     const startCoins=economy.coins,stages=[];
     for(let i=0;i<4;i++){
       document.getElementById('bu3857-hint').click();
       stages.push({level:bu3857State.hints[id],balance:economy.coins,
         letters:buHQHintLetters[id],visibleSlots:[...document.querySelectorAll('.buhq-slots span')].map(x=>x.textContent).join('')});
       document.getElementById('bu3863-dialog-layer')?.remove();
     }
     return {startCoins,stages};
   });
   assert.deepEqual(hint.stages.map(x=>x.level),[1,2,3,3],'Free hint plus two paid context hints');
   assert.deepEqual(hint.stages.map(x=>x.balance),[
     hint.startCoins,hint.startCoins-15,hint.startCoins-40,hint.startCoins-40],
     'Hint prices must be free, 15, 25 and no further deduction');
   assert(hint.stages.every(x=>x.letters===0),'No letter reveals on Episode 10');
   assert(hint.stages.every(x=>!/[A-Z]{2}/.test(x.visibleSlots.replace(/[· ]/g,''))),
     'No word-prefix automatically revealed in the answer wheel');
   await page.evaluate(()=>{bu3857Open('genesis_ep07',true);bu3857State.step=0;bu3857Render();});
   const historical=await page.evaluate(()=>({
     oldWord:BU_HQ_WORDS['g07-d01'].answer,
     hint3:BU_HQ_WORDS['g07-d01'].hint3,
     unchangedBook:bu3857State.book,
     oldImage:!!document.querySelector('#bu3857-content figure.bu3863-image img')}));
   assert(historical.oldWord==='CROWDING'&&historical.hint3===undefined);
   assert(historical.unchangedBook==='genesis_ep07'&&historical.oldImage);
   assert.deepEqual(errors,[],'No browser JavaScript exceptions');
   console.log('PASS_GENESIS10_QUALITY',JSON.stringify({
    viewport:w+'x'+h,sourceQuestions:10,thinkingHints:3,hintSpend:[0,15,25],
    autoRevealedLetters:0,scenePhotos:2,old30Intact:true,noErrors:true}));
   await page.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error('FAIL_GENESIS10_QUALITY',e.stack||e);process.exitCode=1});

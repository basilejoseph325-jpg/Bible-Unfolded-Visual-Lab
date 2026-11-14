#!/usr/bin/env node
'use strict';
/* Regression: click ACTUAL word-wheel letters to solve all ten episodes.
   No real device/user saves, no LIVE access. */
const assert=require('node:assert/strict'),puppeteer=require('puppeteer-core'),cp=require('node:child_process');
const chrome=cp.execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
(async()=>{
const browser=await puppeteer.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'],protocolTimeout:130000});
try{
for(const [w,h] of [[390,705],[320,568]]){
 const page=await browser.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.setViewport({width:w,height:h,deviceScaleFactor:2,isMobile:true,hasTouch:true});
 const res=await page.goto('http://127.0.0.1:8893/index.html',{waitUntil:'domcontentloaded',timeout:120000});
 assert.equal(res.status(),200);
 await page.waitForFunction(()=>typeof bu3857Open==='function'&&typeof buHQWordBoard==='function',{timeout:85000});
 const init=await page.evaluate(()=>({
  oldWords:Object.keys(BU_HQ_WORDS).filter(x=>/^g0[789]-d/.test(x)).length,
  newWords:Object.keys(BU_HQ_WORDS).filter(x=>/^g10-d/.test(x)).length,
  existingStory:!!document.getElementById('home-journey'),
  noNehemiah:!document.getElementById('bu-story-explorer-entry'),
  saveKey:BU_GENESIS_KEY
 }));
 assert.equal(init.oldWords,30);
 assert.equal(init.newWords,10);
 assert(init.existingStory&&init.noNehemiah);
 assert.equal(init.saveKey,'bible-unfolded-genesis-adventure-v3860');
 await page.evaluate(()=>bu3857Open('genesis_ep10',true));
 for(let i=1;i<=10;i++){
  const id='g10-d'+String(i).padStart(2,'0');
  const first=await page.evaluate(id=>{
   const root=document.getElementById('bu3857-screen'),wheel=root.querySelector('#buhq-wheel');
   const answer=BU_HQ_WORDS[id]?.answer,letters=[...root.querySelectorAll('#buhq-wheel [data-buhq]')];
   return{actual:bu3857Current()?.id,wheel:!!wheel,answer,
    letterCount:letters.length,clue:root.querySelector('.bu3863-question')?.textContent,
    oldError:root.querySelector('.bu3863-board')?.textContent?.includes('Puzzle unavailable'),
    scripture:!!root.querySelector('#bu3863-scripture'),story:!!root.querySelector('#bu3863-story')};
  },id);
  assert.equal(first.actual,id);
  assert(first.wheel&&first.answer,'ACTUAL wheel missing: '+id);
  assert.equal(first.letterCount,first.answer.length);
  assert.equal(first.oldError,false);
  assert(first.clue.length>10&&first.scripture&&first.story);
  // Drive the actual clickable buttons, not internal solve().
  const taps=await page.evaluate(id=>{
   const answer=BU_HQ_WORDS[id].answer;
   const buttons=[...document.querySelectorAll('#buhq-wheel button[data-buhq]')],used=new Set();
   for(const char of answer){
    const button=buttons.find(b=>b.textContent===char&&!used.has(b.dataset.buhq));
    if(!button)throw Error('No available tile for '+char+' in '+id);
    used.add(button.dataset.buhq);
    button.click();
   }
   return used.size;
  },id);
  assert.equal(taps,first.answer.length);
  await page.waitForFunction(id=>!!bu3857State.solved[id],{timeout:8000},id);
  if(i<10){
   await page.evaluate(()=>document.getElementById('bu3857-continue')?.click());
   await page.waitForFunction(expected=>bu3857Current()?.id===expected,{timeout:10000},
     'g10-d'+String(i+1).padStart(2,'0'));
  }
 }
 const done=await page.evaluate(()=>({
  solved:Object.keys(bu3857State.solved).filter(k=>/^g10-d/.test(k)).length,
  saved:JSON.parse(localStorage.getItem(BU_GENESIS_KEY)||'{}')?.genesis_ep10,
  originalEpisode9:BU3857_DATA.genesis_ep09.discoveries.length
 }));
 assert.equal(done.solved,10);
 assert.equal(done.originalEpisode9,10);
 assert(done.saved&&Object.keys(done.saved.solved).length===10,'Completion must retain regular saves');
 await page.evaluate(()=>document.getElementById('bu3857-continue')?.click());
 const complete=await page.evaluate(()=>({complete:bu3857State.complete,ending:!!document.getElementById('bu3857-next-episode')}));
 assert(complete.complete&&complete.ending,'Chapter ending must open after all ten solved wheels');
 await page.reload({waitUntil:'domcontentloaded',timeout:100000});
 await page.waitForFunction(()=>typeof bu3857Open==='function',{timeout:85000});
 const resumed=await page.evaluate(()=>{bu3857Open('genesis_ep10');return bu3857State.complete});
 assert(resumed,'Chapter completion should resume after refresh');
 assert.deepEqual(errors,[],'No JavaScript exceptions');
 console.log('PASS_EP10_ALL_TEN_REAL_WHEELS',JSON.stringify({width:w,height:h,played:10,ending:true,resume:true,old30:true}));
 await page.close();
}
}finally{await browser.close()}
})().catch(e=>{console.error('FAIL_EP10_WORD_WHEEL',e.stack||e);process.exitCode=1});

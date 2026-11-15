#!/usr/bin/env node
'use strict';
/* Real original Story hint popover flow: free/15/25, no letter reveal. */
const assert=require('node:assert/strict'),puppeteer=require('puppeteer-core'),cp=require('node:child_process');
const chrome=cp.execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const base=process.env.STORY_URL||'http://127.0.0.1:8893/index.html';
(async()=>{
const browser=await puppeteer.launch({headless:true,executablePath:chrome,
 args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'],protocolTimeout:110000});
try{
for(const [width,height] of [[390,705],[320,568]]){
 const page=await browser.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.setViewport({width,height,isMobile:true,hasTouch:true,deviceScaleFactor:2});
 await page.goto(base,{waitUntil:'domcontentloaded',timeout:110000});
 await page.waitForFunction(()=>typeof bu3857Open==='function'&&typeof bu3857Hint==='function',{timeout:85000});
 await page.evaluate(()=>{
   bu3857Open('genesis_ep11',true);
   bu3857State.step=7;
   economy.coins=500;
   bu3857State.hints['g11-d08']=0;
   bu3857Save();bu3857Render();
   document.getElementById('bu3857-hint').click();
 });
 await page.waitForFunction(()=>bu3857State.hints['g11-d08']===1,{timeout:8000});
 const free=await page.evaluate(()=>({
  level:bu3857State.hints['g11-d08'],coins:economy.coins,
  letter:buHQHintLetters['g11-d08'],
  text:document.getElementById('bu3864-modal-layer')?.innerText||''
 }));
 assert.equal(free.level,1);
 assert.equal(free.coins,500);
 assert.equal(free.letter,0);
 assert(free.text.includes('Not all the animals in the agreement had one plain coat.'),'Free thought hint should be meaningful');
 await page.evaluate(()=>{
  const buy=[...document.querySelectorAll('#bu3864-modal-layer button')].find(x=>x.textContent.includes('Stronger hint'));
  if(!buy)throw Error('Paid Story hint UI missing');
  buy.click();
 });
 await page.waitForFunction(()=>bu3857State.hints['g11-d08']===2,{timeout:8000});
 const second=await page.evaluate(()=>({
  level:bu3857State.hints['g11-d08'],coins:economy.coins,letter:buHQHintLetters['g11-d08'],
  text:document.getElementById('bu3864-modal-layer')?.innerText||''
 }));
 assert.deepEqual([second.level,second.coins,second.letter],[2,485,0]);
 await page.evaluate(()=>{
  const buy=[...document.querySelectorAll('#bu3864-modal-layer button')].find(x=>x.textContent.includes('Stronger hint'));
  if(!buy)throw Error('Final contextual hint option missing');
  buy.click();
 });
 await page.waitForFunction(()=>bu3857State.hints['g11-d08']===3,{timeout:8000});
 const third=await page.evaluate(()=>({
  level:bu3857State.hints['g11-d08'],coins:economy.coins,letter:buHQHintLetters['g11-d08'],
  text:document.getElementById('bu3864-modal-layer')?.innerText||'',
  hint3:BU_HQ_WORDS['g11-d08'].hint3
 }));
 assert.deepEqual([third.level,third.coins,third.letter],[3,460,0]);
 assert(third.text.includes(third.hint3));
 assert(!/Letter [0-9]+ of/.test(third.text),'Paid hint may not reveal letters');
 const noExtra=await page.evaluate(()=>{
   document.getElementById('bu3864-modal-layer')?.remove();
   bu3857Hint();
   return {coins:economy.coins,level:bu3857State.hints['g11-d08']};
 });
 assert.deepEqual(noExtra,{coins:460,level:3});
 await page.evaluate(()=>bu3857Open('genesis_ep10',true));
 assert.equal(await page.evaluate(()=>!!BU_HQ_WORDS['g10-d01']&&!!document.getElementById('buhq-wheel')),true);
 assert.deepEqual(errors,[]);
 console.log('PASS_GENESIS11_CONTEXTUAL_HINTS',JSON.stringify({viewport:width+'x'+height,free:0,paid1:15,paid2:25,lettersRevealed:0,priorEpisode:true}));
 await page.close();
}
}finally{await browser.close();}
})().catch(e=>{console.error('FAIL_GENESIS11_CONTEXTUAL_HINTS',e.stack||e);process.exitCode=1});

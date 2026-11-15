#!/usr/bin/env node
'use strict';
/* Real Chromium DOM/word-wheel integration for opt-in Genesis 12 developer preview.
   Tests only synthetic browser profiles; does not deploy or unlock any content. */
const assert=require('node:assert/strict');
const puppeteer=require('puppeteer-core');
const {execSync}=require('node:child_process');
const chrome=process.env.CHROME_BIN||
  execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const base=process.env.STORY_URL||'http://127.0.0.1:8893/index.html';
const url=new URL(base);
url.searchParams.set('bu_story_dev','genesis12');
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
(async()=>{
  const browser=await puppeteer.launch({
    executablePath:chrome,headless:true,
    args:['--no-sandbox','--disable-dev-shm-usage'],protocolTimeout:120000
  });
  const result={viewports:[],simulatedOnly:true};
  try{
    for(const [width,height] of [[320,568],[390,844]]){
      const context=await browser.createBrowserContext();
      const page=await context.newPage(),errors=[];
      page.on('pageerror',err=>errors.push(err.message));
      await page.setViewport({width,height,isMobile:true,hasTouch:true});
      await page.goto(url.href,{waitUntil:'load',timeout:120000});
      await page.waitForFunction(()=>
        window.BUGenesis12DevPreview?.status==='ready',
        {timeout:40000}
      );
      assert.equal(await page.evaluate(()=>BU3857_DATA.genesis_ep12.discoveries.length),13);
      assert(await page.evaluate(()=>BU_GENESIS_IDS.includes('genesis_ep12')));
      await page.evaluate(()=>openEpisodes('genesis'));
      assert(await page.$('[data-bu-genesis12-dev]'));
      // Entry is a separate opt-in development card; it is not in public menus.
      await page.$eval('[data-bu-genesis12-dev]',btn=>btn.click());
      assert.equal(await page.evaluate(()=>bu3857State.book),'genesis_ep12');

      // Three thinking clues: free, 15 and 25 tokens, with no letters revealed.
      await page.evaluate(()=>{economy.coins=100;saveEconomy()});
      const hints=[];
      for(const expected of [100,85,60]){
        await page.$eval('#bu3857-hint',btn=>btn.click());
        await pause(100);
        assert.equal(await page.evaluate(()=>economy.coins),expected);
        hints.push(await page.evaluate(()=>bu3857State.hints[bu3857Current().id]));
        await page.evaluate(()=>document.querySelector('#bu3863-dialog-layer')?.buClose?.());
      }
      assert.deepEqual(hints,[1,2,3]);
      await page.$eval('#bu3857-hint',btn=>btn.click());
      assert.equal(await page.evaluate(()=>economy.coins),60,'Exhausted hints charged again');
      await page.evaluate(()=>document.querySelector('#bu3863-dialog-layer')?.buClose?.());

      const seen=[];
      for(let i=0;i<13;i++){
        const current=await page.evaluate(()=>({
          id:bu3857Current().id,
          answer:BU_HQ_WORDS[bu3857Current().id].answer
        }));
        assert.equal(current.id,'g12-d'+String(i+1).padStart(2,'0'));
        assert(await page.$('#buhq-wheel [data-buhq]'),'Approved native wheel missing');
        await page.evaluate(answer=>{
          const used=new Set();
          for(const letter of answer){
            const btn=[...document.querySelectorAll('#buhq-wheel [data-buhq]')]
              .find(b=>b.textContent.trim()===letter&&!used.has(b));
            if(!btn)throw Error('Missing wheel letter '+letter);
            used.add(btn);
            btn.click();
          }
        },current.answer);
        await page.waitForFunction(id=>!!bu3857State?.solved?.[id],
          {timeout:15000},current.id);
        await page.waitForSelector('#bu3863-dialog-layer .bu3863-dialog-done');
        await page.$eval('#bu3863-dialog-layer .bu3863-dialog-done',btn=>btn.click());
        seen.push(current.id);
        if(i===0){
          // Verify save/reload resumes the actual NEXT scene, not a fresh start.
          await page.reload({waitUntil:'load',timeout:120000});
          await page.waitForFunction(()=>window.BUGenesis12DevPreview?.status==='ready',
            {timeout:40000});
          await page.evaluate(()=>bu3857Open('genesis_ep12'));
          assert.equal(await page.evaluate(()=>bu3857Current().id),'g12-d02',
            'Progress did not resume after reload');
        }
      }
      assert.equal(seen.length,13);
      assert(await page.evaluate(()=>bu3857State.complete),'Finale not reached');
      assert(await page.$('#bu3857-replay'),'Replay control unavailable');
      assert.deepEqual(errors,[],'Runtime script errors');
      result.viewports.push({width,height,completed:seen.length,allWheels:true,
        thinkingHints:[0,15,25],savedResume:true,finale:true});
      await context.close();
    }
    console.log('PASS_GENESIS12_NATIVE_DEVELOPER_PREVIEW',JSON.stringify(result));
  }finally{await browser.close()}
})().catch(err=>{console.error(err.stack||err);process.exitCode=1});

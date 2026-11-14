#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const {execSync}=require('node:child_process');
const puppeteer=require('puppeteer-core');
const chrome=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const prefix=process.env.BOOKS_SAVE_PREFIX||'buGuide';
const root='http://127.0.0.1:8899/';
(async()=>{
 const browser=await puppeteer.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-dev-shm-usage'],timeout:105000});
 try{
  for(const viewport of [{width:390,height:844},{width:320,height:680},{width:844,height:390}]){
   const context=await browser.createBrowserContext();
   const page=await context.newPage(),errors=[];
   await page.setViewport({...viewport,isMobile:true,hasTouch:true,deviceScaleFactor:2});
   page.on('pageerror',err=>errors.push(err.message));
   for(const [book,id,parts] of [['genesis',0,23],['exodus',1,30],['leviticus',2,27],['numbers',3,36]]){
      const url=root+'bible-book-guides/read.html?book='+book;
      await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
      await page.waitForFunction(n=>!document.getElementById('reader-controls').hidden&&document.getElementById('reading-count')?.textContent==='PART 1 OF '+n,{timeout:16000},parts);
      assert.equal(await page.$eval('#chapter-picker',el=>el.options.length),parts);
      await page.$eval('#next-part',el=>el.click());
      assert.equal(await page.$eval('#reading-count',el=>el.textContent),'PART 2 OF '+parts);
      assert.equal(await page.evaluate(k=>localStorage.getItem(k),prefix+'Last:'+id),'1');
      await page.reload({waitUntil:'domcontentloaded',timeout:65000});
      await page.waitForFunction(()=>location.pathname.endsWith('/index.html')&&new URLSearchParams(location.search).get('fromBooksReload')==='v4',{timeout:60000});
      const returned=await page.evaluate(()=>({path:location.pathname,source:new URLSearchParams(location.search).get('fromBooksReload')}));
      assert.equal(returned.source,'v4');
      await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
      await page.waitForFunction(n=>document.getElementById('reading-count')?.textContent==='PART 2 OF '+n,{timeout:16000},parts);
   }
   const preserved=await page.evaluate(prefix=>[0,1,2,3].map(i=>localStorage.getItem(prefix+'Last:'+i)),prefix);
   assert.deepEqual(preserved,['1','1','1','1']);
   await page.goto(root+'bible-book-guides/index.html',{waitUntil:'domcontentloaded',timeout:65000});
   await page.waitForFunction(()=>document.querySelectorAll('.book-card').length===66,{timeout:18000});
   assert.deepEqual(await page.$$eval('.book-card.ready .book-name',items=>items.map(x=>x.textContent)),['Genesis','Exodus','Leviticus','Numbers']);
   await page.reload({waitUntil:'domcontentloaded',timeout:65000});
   await page.waitForFunction(()=>location.pathname.endsWith('/index.html')&&new URLSearchParams(location.search).get('fromBooksReload')==='v2',{timeout:65000});
   assert.deepEqual(await page.evaluate(prefix=>[0,1,2,3].map(i=>localStorage.getItem(prefix+'Last:'+i)),prefix),['1','1','1','1']);
   assert.deepEqual(errors,[],'No JavaScript exceptions');
   console.log('PASS_BIBLE_BOOKS_READER_REFRESH_RETURNS_HOME',JSON.stringify({viewport,books:['genesis','exodus','leviticus','numbers'],preserved,shelfRefresh:true,errors:[]}));
   await context.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

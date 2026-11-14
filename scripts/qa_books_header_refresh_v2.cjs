#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const {execSync}=require('node:child_process');
const puppeteer=require('puppeteer-core');
const chrome=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const expectedExodus=process.env.EXODUS_READY==='1';
(async()=>{
 const browser=await puppeteer.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-dev-shm-usage'],timeout:100000});
 try{
  for(const viewport of [{width:390,height:844},{width:320,height:680},{width:844,height:390}]){
   const ctx=await browser.createBrowserContext(),page=await ctx.newPage(),errors=[];
   await page.setViewport({...viewport,isMobile:true,hasTouch:true,deviceScaleFactor:2});
   page.on('pageerror',e=>errors.push(e.message));
   const root='http://127.0.0.1:8899/';
   await page.goto(root+'bible-book-guides/index.html',{waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForSelector('.book-card',{timeout:25000});
   const header=await page.evaluate(()=>{
    const bar=document.querySelector('.topbar').getBoundingClientRect();
    const brand=document.querySelector('.top-brand').getBoundingClientRect();
    const title=document.querySelector('.top-brand strong').getBoundingClientRect();
    const hero=document.querySelector('.shelf-hero').getBoundingClientRect();
    const cards=[...document.querySelectorAll('.book-card.ready .book-name')].map(c=>c.textContent);
    return {barBottom:bar.bottom,brandTop:brand.top,brandBottom:brand.bottom,titleBottom:title.bottom,heroTop:hero.top,
     label:document.querySelector('.top-brand strong').textContent,cardCount:document.querySelectorAll('.book-card').length,
     ready:cards,scrollWidth:document.documentElement.scrollWidth,innerWidth:innerWidth};
   });
   assert.equal(header.label,'Bible Books Made Simple');
   assert.equal(header.cardCount,66);
   assert(header.brandTop>=13,'Brand should fit within header upper padding');
   assert(header.brandBottom<=header.barBottom-8,'Title must clear header bottom border');
   assert(header.titleBottom<=header.heroTop-8,'No title overlap with hero image');
   assert(header.scrollWidth<=header.innerWidth+3,'No horizontal overflow');
   assert.equal(header.ready.includes('Exodus'),expectedExodus,'Exodus availability should match environment, never a mistaken cache');
   await page.$eval('a.book-card[href*="exodus"]',el=>el.click());
   await page.waitForFunction(()=>location.pathname.endsWith('/bible-book-guides/read.html'),{timeout:10000});
   if(expectedExodus){
     await page.waitForFunction(()=>!document.getElementById('reader-controls').hidden,{timeout:15000});
     assert.equal(await page.$eval('#reading-count',el=>el.textContent),'PART 1 OF 30');
     await page.$eval('#next-part',el=>el.click());
     assert.equal(await page.$eval('#reading-count',el=>el.textContent),'PART 2 OF 30');
     const readerUrlBeforeRefresh=page.url();
     await page.reload({waitUntil:'domcontentloaded',timeout:65000});
     await page.waitForFunction(()=>location.pathname.endsWith('/index.html')&&new URLSearchParams(location.search).get('fromBooksReload')==='v4',{timeout:65000});
     await page.goto(readerUrlBeforeRefresh,{waitUntil:'domcontentloaded',timeout:65000});
     await page.waitForFunction(()=>document.getElementById('reading-count')?.textContent==='PART 2 OF 30',{timeout:12000});
   }else{
     await page.waitForFunction(()=>document.querySelector('#part-title')?.textContent.includes('being written'),{timeout:12000});
   }
   await page.$eval('a.back-link',el=>el.click());
   await page.waitForFunction(()=>location.pathname.endsWith('/bible-book-guides/index.html'),{timeout:12000});
   await page.reload({waitUntil:'domcontentloaded',timeout:65000});
   await page.waitForFunction(()=>location.pathname.endsWith('/index.html')&&new URLSearchParams(location.search).get('fromBooksReload')==='v2',{timeout:60000});
   const ending=await page.evaluate(()=>({pathname:location.pathname,query:location.search,exodus:localStorage.getItem('buGuideLast:1')}));
   if(expectedExodus)assert.equal(ending.exodus,'1','Exodus place should survive the separate Books reload');
   assert.deepEqual(errors,[],'No JS page errors');
   console.log('PASS_BOOKS_TITLE_REFRESH_CHROME',JSON.stringify({viewport,header,ending,expectedExodus,errors:[]}));
   await ctx.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const {execSync}=require('node:child_process');
const fs=require('node:fs');
const puppeteer=require('puppeteer-core');
const nums=JSON.parse(fs.readFileSync('bible-book-guides/numbers-draft.json','utf8'));
assert.equal(nums.book,'Numbers');
assert.equal(nums.sections.length,36);
assert.equal(nums.chapterCount,36);
assert.equal(nums.sectionCount,36);
assert(nums.sources.every(x=>x.startsWith('https://www.jw.org/')));
nums.sections.forEach((s,i)=>{
 const n=i+1;
 assert.deepEqual([s.startChapter,s.endChapter],[n,n]);
 assert.equal(s.id,'nm-'+String(n).padStart(2,'0'));
 assert.equal(s.readUrl,'https://www.jw.org/en/library/bible/nwt/books/numbers/'+n+'/');
 assert.equal(s.paragraphs.length,3);
 assert(s.paragraphs.every(p=>p.trim().split(/\s+/).length>=35),'Short paragraph in '+n);
 assert(s.takeaway.length>=30);
});
const executable=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
(async()=>{
 const browser=await puppeteer.launch({headless:true,executablePath:executable,args:['--no-sandbox','--disable-dev-shm-usage'],timeout:90000});
 try{
  for(const viewport of [{width:390,height:844},{width:320,height:680},{width:844,height:390}]){
   const ctx=await browser.createBrowserContext(),page=await ctx.newPage(),errors=[];
   await page.setViewport({...viewport,isMobile:true,hasTouch:true,deviceScaleFactor:2});
   page.setDefaultTimeout(16000);
   page.on('pageerror',e=>errors.push(e.message));
   const root='http://127.0.0.1:8899/';
   await page.goto(root+'bible-book-guides/index.html',{waitUntil:'domcontentloaded',timeout:65000});
   await page.waitForSelector('.book-card.ready',{timeout:20000});
   const shelf=await page.evaluate(()=>({
     count:document.querySelectorAll('.book-card').length,
     ready:[...document.querySelectorAll('.book-card.ready .book-name')].map(e=>e.textContent),
     title:document.querySelector('.top-brand strong').textContent,
     titleBottom:document.querySelector('.top-brand strong').getBoundingClientRect().bottom,
     headerBottom:document.querySelector('.topbar').getBoundingClientRect().bottom,
     width:document.documentElement.scrollWidth,screen:innerWidth
   }));
   assert.equal(shelf.count,66);
   assert.deepEqual(shelf.ready,['Genesis','Exodus','Leviticus','Numbers']);
   assert(shelf.titleBottom<=shelf.headerBottom-7);
   assert(shelf.width<=shelf.screen+3);
   await page.evaluate(()=>{
     localStorage.setItem('buGuideLast:0','5');
     localStorage.setItem('buGuideLast:1','10');
     localStorage.setItem('buGuideLast:2','15');
   });
   await page.$eval('a.book-card[href*="numbers"]',e=>e.click());
   await page.waitForFunction(()=>location.search.includes('book=numbers')&&!document.querySelector('#reader-controls').hidden,{timeout:18000});
   const first=await page.evaluate(()=>({
     part:document.getElementById('reading-count').textContent,
     title:document.getElementById('part-title').textContent,
     range:document.getElementById('reading-range').textContent,
     picker:document.querySelectorAll('#chapter-picker option').length,
     paragraphs:document.querySelectorAll('#part-body p').length,
     link:document.getElementById('passage-link').href,
     art:getComputedStyle(document.getElementById('book-hero')).backgroundImage,
     width:document.documentElement.scrollWidth,screen:innerWidth
   }));
   assert.equal(first.part,'PART 1 OF 36');
   assert.equal(first.title,'A Nation Gets Ready to Move');
   assert.equal(first.range,'NUMBERS 1');
   assert.equal(first.picker,36);
   assert.equal(first.paragraphs,3);
   assert.equal(first.link,'https://www.jw.org/en/library/bible/nwt/books/numbers/1/');
   assert(first.art.includes('04_numbers.webp'));
   assert(first.width<=first.screen+3);
   await page.$eval('#next-part',e=>e.click());
   assert.equal(await page.$eval('#reading-count',e=>e.textContent),'PART 2 OF 36');
   const keys=()=>page.evaluate(()=>[0,1,2,3].map(i=>localStorage.getItem('buGuideLast:'+i)));
   assert.deepEqual(await keys(),['5','10','15','1']);
   await page.reload({waitUntil:'domcontentloaded',timeout:65000});
   await page.waitForFunction(()=>location.pathname.endsWith('/index.html')&&new URLSearchParams(location.search).get('fromBooksReload')==='v4',{timeout:65000});
   assert.deepEqual(await keys(),['5','10','15','1']);
   await page.goto(root+'bible-book-guides/read.html?book=numbers',{waitUntil:'domcontentloaded',timeout:65000});
   await page.waitForFunction(()=>document.getElementById('reading-count')?.textContent==='PART 2 OF 36',{timeout:16000});
   await page.$eval('a.back-link',e=>e.click());
   await page.waitForFunction(()=>location.pathname.endsWith('/bible-book-guides/index.html'),{timeout:16000});
   assert((await page.$eval('a.book-card[href*="numbers"] .book-hint',e=>e.textContent)).includes('Part 2 of 36'));
   await page.$eval('a.book-card[href*="numbers"]',e=>e.click());
   await page.waitForFunction(()=>document.getElementById('reading-count')?.textContent==='PART 2 OF 36',{timeout:16000});
   await page.select('#chapter-picker','35');
   const end=await page.evaluate(()=>({
      part:document.getElementById('reading-count').textContent,
      title:document.getElementById('part-title').textContent,
      range:document.getElementById('reading-range').textContent,
      link:document.getElementById('passage-link').href
   }));
   assert.equal(end.part,'PART 36 OF 36');
   assert.equal(end.title,'Five Sisters Help Settle the Final Question');
   assert.equal(end.range,'NUMBERS 36');
   assert.equal(end.link,'https://www.jw.org/en/library/bible/nwt/books/numbers/36/');
   await page.$eval('#next-part',e=>e.click());
   assert.equal(await page.$eval('#completion h2',e=>e.textContent),'You finished Numbers! ✨');
   assert((await page.$eval('#completion p',e=>e.textContent)).includes('Deuteronomy'));
   assert.equal(await page.evaluate(()=>localStorage.getItem('buGuideFinished:3')),'1');
   await page.evaluate(()=>window.confirm=()=>true);
   await page.$eval('#reset-reading',e=>e.click());
   assert.equal(await page.$eval('#reading-count',e=>e.textContent),'PART 1 OF 36');
   assert.deepEqual(await keys(),['5','10','15','0']);
   assert.equal(await page.evaluate(()=>localStorage.getItem('buGuideFinished:3')),'0');
   await page.$eval('a.back-link',e=>e.click());
   await page.waitForFunction(()=>location.pathname.endsWith('/bible-book-guides/index.html'),{timeout:16000});
   await page.reload({waitUntil:'domcontentloaded',timeout:65000});
   await page.waitForFunction(()=>location.pathname.endsWith('/index.html')&&new URLSearchParams(location.search).get('fromBooksReload')==='v2',{timeout:65000});
   assert.deepEqual(errors,[],'No JS exceptions');
   console.log('PASS_NUMBERS_36_CHAPTERS_PLAYER_PATH',JSON.stringify({viewport,shelf,first,end,progressIsolation:true,readerReloadHome:true,libraryReloadHome:true,errors:[]}));
   await ctx.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

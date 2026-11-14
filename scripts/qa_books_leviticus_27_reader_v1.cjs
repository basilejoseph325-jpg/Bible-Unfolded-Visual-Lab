#!/usr/bin/env node
'use strict';
/* Standalone Bible Books / Leviticus: source structure, UI, state and responsive smoke tests. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {execSync}=require('node:child_process');
const puppeteer=require('puppeteer-core');
const lev=JSON.parse(fs.readFileSync('bible-book-guides/leviticus-draft.json','utf8'));
const ex=JSON.parse(fs.readFileSync('bible-book-guides/exodus-draft.json','utf8'));
const gen=JSON.parse(fs.readFileSync('bible-book-guides/genesis-draft.json','utf8'));
assert.deepEqual([gen.sections.length,ex.sections.length,lev.sections.length],[23,30,27],'Prior guide part counts must remain intact');
assert.equal(lev.book,'Leviticus');
assert.equal(lev.chapterCount,27);
assert.equal(lev.sectionCount,27);
assert(lev.sources.every(u=>u.startsWith('https://www.jw.org/')));
for(let i=0;i<27;i++){
 const item=lev.sections[i],ch=i+1;
 assert.deepEqual([item.startChapter,item.endChapter],[ch,ch],'Missing chapter '+ch);
 assert.equal(item.id,'lv-'+String(ch).padStart(2,'0'));
 assert.equal(item.readUrl,'https://www.jw.org/en/library/bible/nwt/books/leviticus/'+ch+'/');
 assert(item.title.length>12);
 assert.equal(item.paragraphs.length,3);
 assert(item.paragraphs.every(p=>p.trim().split(/\s+/).length>=43),'Short story paragraph at chapter '+ch);
 assert(item.takeaway.length>35);
}
const chrome=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
(async()=>{
 const browser=await puppeteer.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-dev-shm-usage'],timeout:110000});
 try{
  for(const viewport of [{width:390,height:844},{width:320,height:680},{width:844,height:390}]){
   const context=await browser.createBrowserContext();
   const page=await context.newPage(),errors=[];
   page.setDefaultTimeout(14000);
   await page.setViewport({...viewport,isMobile:true,hasTouch:true,deviceScaleFactor:2});
   page.on('pageerror',err=>errors.push(err.message));
   await page.goto('http://127.0.0.1:8899/bible-book-guides/index.html',{waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForSelector('.book-card.ready',{timeout:16000});
   const shelf=await page.evaluate(()=>{
     const cards=[...document.querySelectorAll('.book-card.ready')];
     const bar=document.querySelector('.topbar').getBoundingClientRect(),title=document.querySelector('.top-brand strong').getBoundingClientRect();
     return {total:document.querySelectorAll('.book-card').length,
       ready:cards.map(el=>el.querySelector('.book-name').textContent),
       caption:document.querySelector('.shelf-note').textContent,
       title:document.querySelector('.top-brand strong').textContent,
       titleClearsHeader:title.bottom<bar.bottom-7,
       pageWidth:document.documentElement.scrollWidth,windowWidth:innerWidth};
   });
   assert.equal(shelf.total,66);
   assert.deepEqual(shelf.ready,['Genesis','Exodus','Leviticus','Numbers']);
   assert(shelf.caption.includes('Leviticus'));
   assert(shelf.titleClearsHeader);
   assert(shelf.pageWidth<=shelf.windowWidth+3);
   await page.evaluate(()=>{
     localStorage.setItem('buGuideLast:0','5');
     localStorage.setItem('buGuideLast:1','10');
     localStorage.setItem('buGuideFinished:0','0');
     localStorage.setItem('buGuideFinished:1','0');
   });
   await page.$eval('a.book-card[href*="leviticus"]',el=>el.click());
   await page.waitForFunction(()=>location.search.includes('book=leviticus')&&!document.getElementById('reader-controls').hidden,{timeout:18000});
   const first=await page.evaluate(()=>({
     part:document.querySelector('#reading-count').textContent,
     title:document.getElementById('part-title').textContent,
     range:document.getElementById('reading-range').textContent,
     links:document.getElementById('passage-link').href,
     para:document.querySelectorAll('#part-body p').length,
     selector:document.querySelectorAll('#chapter-picker option').length,
     art:getComputedStyle(document.querySelector('.read-hero')).backgroundImage,
     progressMax:document.querySelector('.progress-track').getAttribute('aria-valuemax'),
     scrollWidth:document.documentElement.scrollWidth,innerWidth:innerWidth
   }));
   assert.equal(first.part,'PART 1 OF 27');
   assert.equal(first.title,"A Doorway Into Jehovah's Tent");
   assert.equal(first.range,'LEVITICUS 1');
   assert.equal(first.para,3);assert.equal(first.selector,27);assert.equal(first.progressMax,'27');
   assert(first.art.includes('03_leviticus.webp'));
   assert.equal(first.links,'https://www.jw.org/en/library/bible/nwt/books/leviticus/1/');
   assert(first.scrollWidth<=first.innerWidth+3);
   await page.$eval('#next-part',el=>el.click());
   assert.equal(await page.$eval('#reading-count',el=>el.textContent),'PART 2 OF 27');
   const keys=()=>page.evaluate(()=>({
      genesis:localStorage.getItem('buGuideLast:0'),
      exodus:localStorage.getItem('buGuideLast:1'),
      leviticus:localStorage.getItem('buGuideLast:2')
   }));
   assert.deepEqual(await keys(),{genesis:'5',exodus:'10',leviticus:'1'});
   const readerUrlBeforeRefresh=page.url();
   await page.reload({waitUntil:'domcontentloaded',timeout:65000});
   await page.waitForFunction(()=>location.pathname.endsWith('/index.html')&&new URLSearchParams(location.search).get('fromBooksReload')==='v4',{timeout:65000});
   await page.goto(readerUrlBeforeRefresh,{waitUntil:'domcontentloaded',timeout:65000});
   await page.waitForFunction(()=>document.getElementById('reading-count')?.textContent==='PART 2 OF 27',{timeout:15000});
   await page.$eval('a.back-link',el=>el.click());
   await page.waitForFunction(()=>location.pathname.endsWith('/bible-book-guides/index.html'),{timeout:12000});
   assert((await page.$eval('a.book-card[href*="leviticus"] .book-hint',e=>e.textContent)).includes('Part 2 of 27'));
   await page.$eval('a.book-card[href*="genesis"]',e=>e.click());
   await page.waitForFunction(()=>document.getElementById('reading-count')?.textContent==='PART 6 OF 23',{timeout:13000});
   await page.$eval('a.back-link',e=>e.click());
   await page.waitForFunction(()=>location.pathname.endsWith('/bible-book-guides/index.html'),{timeout:12000});
   await page.$eval('a.book-card[href*="exodus"]',e=>e.click());
   await page.waitForFunction(()=>document.getElementById('reading-count')?.textContent==='PART 11 OF 30',{timeout:13000});
   await page.$eval('a.back-link',e=>e.click());
   await page.waitForFunction(()=>location.pathname.endsWith('/bible-book-guides/index.html'),{timeout:12000});
   await page.$eval('a.book-card[href*="leviticus"]',e=>e.click());
   await page.waitForFunction(()=>document.getElementById('reading-count')?.textContent==='PART 2 OF 27',{timeout:13000});
   await page.select('#chapter-picker','26');
   const last=await page.evaluate(()=>({
     part:document.getElementById('reading-count').textContent,
     title:document.getElementById('part-title').textContent,
     range:document.getElementById('reading-range').textContent,
     link:document.getElementById('passage-link').href,
     paragraphs:document.querySelectorAll('#part-body p').length
   }));
   assert.equal(last.part,'PART 27 OF 27');assert.equal(last.title,'Keeping a Promise to Jehovah');
   assert.equal(last.range,'LEVITICUS 27');
   assert.equal(last.link,'https://www.jw.org/en/library/bible/nwt/books/leviticus/27/');
   assert.equal(last.paragraphs,3);
   await page.$eval('#next-part',e=>e.click());
   assert.equal(await page.$eval('#completion h2',e=>e.textContent),'You finished Leviticus! ✨');
   assert((await page.$eval('#completion p',e=>e.textContent)).includes('Numbers'));
   assert.equal(await page.evaluate(()=>localStorage.getItem('buGuideFinished:2')),'1');
   await page.evaluate(()=>{window.confirm=()=>true});
   await page.$eval('#reset-reading',e=>e.click());
   assert.equal(await page.$eval('#reading-count',e=>e.textContent),'PART 1 OF 27');
   assert.deepEqual(await keys(),{genesis:'5',exodus:'10',leviticus:'0'});
   assert.equal(await page.evaluate(()=>localStorage.getItem('buGuideFinished:2')),'0');
   await page.$eval('a.back-link',e=>e.click());
   await page.waitForFunction(()=>location.pathname.endsWith('/bible-book-guides/index.html'),{timeout:12000});
   await page.reload({waitUntil:'domcontentloaded',timeout:65000});
   await page.waitForFunction(()=>location.pathname.endsWith('/index.html')&&new URLSearchParams(location.search).get('fromBooksReload')==='v2',{timeout:65000});
   assert.deepEqual(errors,[],'No JavaScript page errors');
   console.log('PASS_LEVITICUS_27_CHAPTERS_READER',JSON.stringify({viewport,shelf,first,last,progressIsolation:true,returnHomeOnLibraryRefresh:true,errorCount:errors.length}));
   await context.close();
  }
 }finally{await browser.close()}
})().catch(err=>{console.error(err);process.exitCode=1});

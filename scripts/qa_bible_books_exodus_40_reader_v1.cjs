#!/usr/bin/env node
'use strict';
/* Bible Books standalone reader: real Chrome regression, no production saves. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {execSync}=require('node:child_process');
const puppeteer=require('puppeteer-core');
const exodus=JSON.parse(fs.readFileSync('bible-book-guides/exodus-draft.json','utf8'));
const genesis=JSON.parse(fs.readFileSync('bible-book-guides/genesis-draft.json','utf8'));
function audit(d,chapters,parts,book){
 assert.equal(d.book,book);
 assert.equal(d.chapterCount,chapters);
 assert.equal(d.sections.length,parts);
 let next=1;
 d.sections.forEach((s,i)=>{
   assert.equal(s.startChapter,next,'Missing chapter '+next+' of '+book);
   assert(s.endChapter>=s.startChapter);
   assert.equal(s.id,book==='Exodus'?'ex-'+String(i+1).padStart(2,'0'):s.id);
   assert(Array.isArray(s.paragraphs)&&s.paragraphs.length>=2,'Short narrative '+s.title);
   assert(s.paragraphs.every(p=>p.split(/\s+/).length>=35),'Short paragraph '+s.title);
   assert(s.takeaway.length>20,'Missing educational takeaway');
   assert.equal(s.readUrl,'https://www.jw.org/en/library/bible/nwt/books/exodus/'+s.startChapter+'/',"Wrong Bible chapter link");
   next=s.endChapter+1;
 });
 assert.equal(next,chapters+1);
}
audit(exodus,40,30,'Exodus');
assert.equal(genesis.sections.length,23);
const browserPath=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
(async()=>{
 const browser=await puppeteer.launch({headless:true,executablePath:browserPath,args:['--no-sandbox','--disable-dev-shm-usage'],timeout:100000});
 try{
   for(const viewport of [{width:390,height:844},{width:844,height:390}]){
     const context=await browser.createBrowserContext();
     const page=await context.newPage(),errors=[];
     await page.setViewport({...viewport,isMobile:true,hasTouch:true,deviceScaleFactor:2});
     page.on('pageerror',e=>errors.push(e.message));
     await page.goto('http://127.0.0.1:8899/bible-book-guides/index.html',{waitUntil:'domcontentloaded',timeout:60000});
     await page.waitForSelector('.book-card.ready',{timeout:10000});
     const shelf=await page.evaluate(()=>({
        count:document.querySelectorAll('.book-card').length,
        ready:[...document.querySelectorAll('.book-card.ready')].map(e=>e.querySelector('.book-name')?.textContent),
        description:document.querySelector('.shelf-note')?.textContent,
        width:document.documentElement.scrollWidth,inner:innerWidth
     }));
     assert.deepEqual(shelf.ready,['Genesis','Exodus']);
     assert.equal(shelf.count,66);
     assert(shelf.description.includes('Genesis')&&shelf.description.includes('Exodus'));
     assert(shelf.width<=shelf.inner+3);
     await page.$eval('a.book-card[href*="exodus"]',el=>el.click());
     await page.waitForFunction(()=>location.search.includes('book=exodus')&&!document.getElementById('reader-controls').hidden,{timeout:20000});
     const first=await page.evaluate(()=>({
       part:document.getElementById('reading-count').textContent,
       title:document.getElementById('part-title').textContent,
       picker:document.querySelectorAll('#chapter-picker option').length,
       range:document.getElementById('reading-range').textContent,
       paragraphs:document.querySelectorAll('#part-body p').length,
       chapterLink:document.getElementById('passage-link').href,
       progressMax:document.querySelector('.progress-track').getAttribute('aria-valuemax'),
       width:document.documentElement.scrollWidth,inner:innerWidth
     }));
     assert.equal(first.part,'PART 1 OF 30');
     assert.equal(first.title,'The People Pharaoh Tried to Crush');
     assert.equal(first.picker,30);
     assert.equal(first.paragraphs,3);
     assert.equal(first.range,'EXODUS 1');
     assert.equal(first.chapterLink,'https://www.jw.org/en/library/bible/nwt/books/exodus/1/');
     assert.equal(first.progressMax,'30');
     assert(first.width<=first.inner+3);
     await page.$eval('#next-part',el=>el.click());
     assert.equal(await page.$eval('#reading-count',el=>el.textContent),'PART 2 OF 30');
     assert.deepEqual(await page.evaluate(()=>({
       exodus:localStorage.getItem('buGuideLast:1'),
       genesis:localStorage.getItem('buGuideLast:0')
     })),{exodus:'1',genesis:null});
     const readerUrlBeforeRefresh=page.url();
     await page.reload({waitUntil:'domcontentloaded',timeout:65000});
     await page.waitForFunction(()=>location.pathname.endsWith('/index.html')&&new URLSearchParams(location.search).get('fromBooksReload')==='v4',{timeout:65000});
     await page.goto(readerUrlBeforeRefresh,{waitUntil:'domcontentloaded',timeout:65000});
     await page.waitForFunction(()=>document.getElementById('reading-count')?.textContent==='PART 2 OF 30',{timeout:12000});
     await page.$eval('a.back-link',el=>el.click());
     await page.waitForFunction(()=>location.pathname.endsWith('/bible-book-guides/index.html'),{timeout:10000});
     assert((await page.$eval('a.book-card[href*="exodus"] .book-hint',el=>el.textContent)).includes('Part 2 of 30'));
     await page.$eval('a.book-card[href*="genesis"]',el=>el.click());
     await page.waitForFunction(()=>document.getElementById('reading-count')?.textContent==='PART 1 OF 23',{timeout:12000});
     await page.$eval('#next-part',el=>el.click());
     assert.deepEqual(await page.evaluate(()=>({
       genesis:localStorage.getItem('buGuideLast:0'),
       exodus:localStorage.getItem('buGuideLast:1')
     })),{genesis:'1',exodus:'1'});
     await page.$eval('a.back-link',el=>el.click());
     await page.waitForFunction(()=>location.pathname.endsWith('/bible-book-guides/index.html'),{timeout:10000});
     await page.$eval('a.book-card[href*="exodus"]',el=>el.click());
     await page.waitForFunction(()=>document.getElementById('reading-count')?.textContent==='PART 2 OF 30',{timeout:12000});
     await page.select('#chapter-picker','29');
     assert.equal(await page.$eval('#reading-count',el=>el.textContent),'PART 30 OF 30');
     const end=await page.evaluate(()=>({title:document.getElementById('part-title').textContent,ref:document.getElementById('reading-range').textContent,paragraphs:document.querySelectorAll('#part-body p').length,link:document.getElementById('passage-link').href}));
     assert.equal(end.ref,'EXODUS 40');
     assert.equal(end.title,'The Cloud Fills the Tabernacle');
     assert.equal(end.paragraphs,3);
     assert.equal(end.link,'https://www.jw.org/en/library/bible/nwt/books/exodus/40/');
     await page.$eval('#next-part',el=>el.click());
     assert.equal(await page.$eval('#completion h2',el=>el.textContent),'You finished Exodus! ✨');
     assert.equal(await page.evaluate(()=>localStorage.getItem('buGuideFinished:1')),'1');
     await page.evaluate(()=>{window.confirm=()=>true});
     await page.$eval('#reset-reading',el=>el.click());
     assert.equal(await page.$eval('#reading-count',el=>el.textContent),'PART 1 OF 30');
     assert.deepEqual(await page.evaluate(()=>({
       exodus:localStorage.getItem('buGuideLast:1'),
       genesis:localStorage.getItem('buGuideLast:0'),
       exodusFinished:localStorage.getItem('buGuideFinished:1')
     })),{exodus:'0',genesis:'1',exodusFinished:'0'});
     await page.$eval('a.back-link',el=>el.click());
     await page.waitForFunction(()=>location.pathname.endsWith('/bible-book-guides/index.html'),{timeout:10000});
     await page.$eval('a.book-card[href*="leviticus"]',el=>el.click());
     await page.waitForFunction(()=>location.search.includes('book=leviticus'),{timeout:12000});
     assert((await page.$eval('#part-title',el=>el.textContent)).includes('being written'));
     assert.deepEqual(errors,[],'No page JS exceptions');
     console.log('PASS_EXODUS_40CH_30PARTS_READER',JSON.stringify({viewport,shelf,first,end,genesisProgressUntouched:true,exodusResume:true,exodusReset:true,otherBooksAvailable:true,errors:[]}));
     await context.close();
   }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

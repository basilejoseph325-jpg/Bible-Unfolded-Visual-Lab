#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const {execSync}=require('node:child_process');
const puppeteer=require('puppeteer-core');
const chrome=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
(async()=>{
 const browser=await puppeteer.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'],timeout:90000});
 try{
  for(const viewport of [{width:390,height:844},{width:844,height:390}]){
   const page=await browser.newPage(),errors=[];
   await page.setViewport({...viewport,isMobile:true,hasTouch:true,deviceScaleFactor:2});
   page.on('pageerror',error=>errors.push(error.message));
   await page.goto('http://127.0.0.1:8899/index.html',{waitUntil:'domcontentloaded',timeout:120000});
   await page.waitForSelector('#home-books-simple',{timeout:75000});
   await page.evaluate(()=>document.getElementById('daily-continue')?.click());
   const home=await page.evaluate(()=>{
    const c=document.querySelector('#home-books-simple'),s=document.getElementById('home-story'),w=document.getElementById('home-watch');
    const cards=c.parentElement,poster=c.querySelector('.cinematic-poster'),title=c.querySelector('.cinematic-card-title');
    const styles=getComputedStyle(poster);
    return {
      count:document.querySelectorAll('#home-books-simple').length,
      nextAfterStory:s.nextElementSibling?.id,
      watchStillExists:!!w,
      titles:[...cards.querySelectorAll('.cinematic-card-title')].map(x=>x.textContent),
      title:title?.textContent,
      href:c.href,
      posterImage:styles.backgroundImage,
      posterHeight:Math.round(poster.getBoundingClientRect().height),
      bodyHeight:Math.round(c.querySelector('.cinematic-card-body').getBoundingClientRect().height),
      cardHeight:Math.round(c.getBoundingClientRect().height),
      complete:document.readyState
    };
   });
   assert.equal(home.count,1);
   assert.equal(home.nextAfterStory,'home-books-simple');
   assert.equal(home.title,'Bible Books Made Simple');
   assert(home.watchStillExists);
   assert(home.href.includes('/bible-book-guides/index.html'));
   assert(home.posterImage.includes('01_genesis.webp'));
   assert(home.titles.includes('Bible Word Trails'));
   assert(home.cardHeight>110&&home.posterHeight>100,'The card should be rendered, not hidden');
   await page.$eval('#home-books-simple',el=>el.click());
   await page.waitForFunction(()=>location.pathname.endsWith('/bible-book-guides/index.html'),{timeout:30000});
   const shelf=await page.evaluate(()=>({
    first:document.querySelector('.book-card')?.textContent,
    count:document.querySelectorAll('.book-card').length,
    scripture:document.querySelectorAll('#hebrew-books .book-card').length,
    greek:document.querySelectorAll('#greek-books .book-card').length,
    rightPoster:!!document.querySelector('.book-card.ready'),
    liveKeyCount:Object.keys(localStorage).filter(x=>x.toLowerCase().includes('wordtrail')).length
   }));
   assert.deepEqual([shelf.count,shelf.scripture,shelf.greek],[66,39,27]);
   await page.$eval('.book-card.ready',el=>el.click());
   await page.waitForFunction(()=>location.pathname.endsWith('/bible-book-guides/read.html')&&!document.querySelector('#reader-controls').hidden,{timeout:30000});
   const intro=await page.evaluate(()=>({
    part:document.getElementById('reading-count').textContent,
    picker:document.querySelectorAll('#chapter-picker option').length,
    chapter:document.getElementById('reading-range').textContent,
    official:document.getElementById('passage-link').href,
    body:document.getElementById('part-body').innerText.length
   }));
   assert.equal(intro.picker,23);
   assert.equal(intro.part,'PART 1 OF 23');
   assert(intro.official.startsWith('https://www.jw.org/en/'));
   assert(intro.body>300);
   await page.$eval('#next-part',el=>el.click());
   assert.equal(await page.$eval('#reading-count',el=>el.textContent),'PART 2 OF 23');
   assert.equal(await page.evaluate(()=>localStorage.getItem('buGuideLast:0')),'1');
   await page.reload({waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>document.querySelector('#reading-count')?.textContent==='PART 2 OF 23',{timeout:30000});
   await page.$eval('.back-link',el=>el.click());
   await page.waitForFunction(()=>location.pathname.endsWith('/bible-book-guides/index.html'),{timeout:30000});
   const resume=await page.$eval('.book-card.ready .book-hint',el=>el.textContent);
   assert(resume.includes('Part 2'),"Shelf must show resume at part 2");
   const width=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,inner:window.innerWidth}));
   assert(width.scroll<=width.inner+3,'Shelf must fit viewport width without horizontal overflow');
   assert.deepEqual(errors,[],'No JavaScript page exceptions');
   console.log('PASS_BIBLE_BOOKS_CARD_PLAYER_PATH',JSON.stringify({viewport,home,shelf,intro,resume,width,errors:[]}));
   await page.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

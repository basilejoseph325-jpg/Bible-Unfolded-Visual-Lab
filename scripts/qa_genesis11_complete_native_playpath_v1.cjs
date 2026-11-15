#!/usr/bin/env node
'use strict';
/* Verified player path, original Story Adventure Genesis Episode 11.
 * Physically present 10 distinct WebP images, wheel answer letter taps,
 * 3 conceptual hint stages, earlier 40 answers, finale, and saved progress.
 * Synthetic headless Chrome profile only. No LIVE or real user data touched.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),puppeteer=require('puppeteer-core'),cp=require('node:child_process');
const chrome=cp.execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const base=process.env.STORY_URL||'http://127.0.0.1:8893/index.html';
(async()=>{
 const content=JSON.parse(fs.readFileSync('story-adventure-content/genesis-episode11-haran-v1.json','utf8'));
 const browser=await puppeteer.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'],protocolTimeout:130000});
 try{
 for(const [width,height] of [[390,705],[320,568]]){
  const page=await browser.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.setViewport({width,height,deviceScaleFactor:2,isMobile:true,hasTouch:true});
  const response=await page.goto(base,{waitUntil:'domcontentloaded',timeout:120000});
  assert([200,304].includes(response.status()),'Cannot load normal TEST game');
  await page.waitForFunction(()=>typeof bu3857Open==='function'&&typeof buHQWordBoard==='function',{timeout:85000});
  const original=await page.evaluate(()=>{
   const first=Object.keys(BU_HQ_WORDS).filter(id=>/^g(07|08|09|10)-d/.test(id)).length;
   const now=Object.keys(BU_HQ_WORDS).filter(id=>/^g11-d/.test(id)).length;
   openEpisodes('genesis');
   const cards=[...document.querySelectorAll('#episode-list button[data-episode]')];
   return {first,now,saveKey:BU_GENESIS_KEY,allIDs:[...BU_GENESIS_IDS],cardCount:cards.length,
      lastTitle:cards.find(c=>c.dataset.episode==='10')?.textContent,thumb:cards.find(c=>c.dataset.episode==='10')?.querySelector('img')?.getAttribute('src'),
      baseExists:!!document.getElementById('home-journey'),
      booksExists:!!document.getElementById('home-books'),
      originalStory:!!document.getElementById('play'),
      noNehemiah:!document.getElementById('bu-story-explorer-entry'),
      previousTitle:BU3857_DATA.genesis_ep10?.title};
  });
  assert.equal(original.first,40,'All existing Genesis Episodes 7-10 answers preserved');
  assert.equal(original.now,10);
  assert.equal(original.saveKey,'bible-unfolded-genesis-adventure-v3860');
  assert.deepEqual(original.allIDs,['genesis_ep07','genesis_ep08','genesis_ep09','genesis_ep10','genesis_ep11','genesis_ep12']);
  assert.equal(original.cardCount,12);
  assert(original.lastTitle?.includes("Jacob's Years in Haran"));
  assert(original.thumb?.endsWith('story-adventure-art/genesis11/g11-d01.webp'));
  assert(original.baseExists&&original.booksExists&&original.originalStory&&original.noNehemiah);
  assert.equal(original.previousTitle,'Jacob and Esau');
  // The original episode10 ending must lead to Episode11.
  const forward=await page.evaluate(()=>{
   bu3857Open('genesis_ep10',true);
   bu3857State.complete=true;
   bu3857Render();
   const label=document.getElementById('bu3857-next-episode')?.textContent;
   document.getElementById('bu3857-next-episode')?.click();
   return {label,next:bu3857State.book,chapter:document.getElementById('bu3857-header-title')?.textContent};
  });
  assert(forward.label?.includes('Next Genesis Episode'));
  assert.equal(forward.next,'genesis_ep11');
  assert.equal(forward.chapter,"Jacob's Years in Haran");
  await page.evaluate(()=>bu3857Open('genesis_ep11',true));
  for(let i=1;i<=10;i++){
   const id='g11-d'+String(i).padStart(2,'0');
   const pic='story-adventure-art/genesis11/'+id+'.webp';
   const v=await page.evaluate(id=>{
    const root=document.getElementById('bu3857-content');
    const image=root.querySelector('figure.bu3863-image img');
    const wheel=root.querySelector('#buhq-wheel');
    const row=BU_HQ_WORDS[id];
    return {scene:bu3857Current()?.id,answer:row?.answer,clue:row?.clue,
      hints:[row?.hint1,row?.hint2,row?.hint3],
      src:image?.getAttribute('src'),alt:image?.alt,
      wheel:!!wheel,tiles:wheel?.querySelectorAll('button[data-buhq]').length,
      bad:root.textContent.includes('Puzzle unavailable'),spelling:row?.answer?.length,
      story:!!document.getElementById('bu3863-story'),scripture:!!document.getElementById('bu3863-scripture'),
      top:image?.getBoundingClientRect().top,wheelTop:wheel?.getBoundingClientRect().top};
   },id);
   assert.equal(v.scene,id,'Discovery order wrong');
   assert.equal(v.src,pic,'Missing or incorrect historical scene '+id);
   assert(v.alt?.length>=30&&v.top<v.wheelTop);
   assert(!v.bad&&v.wheel&&v.story&&v.scripture,'Actual question/wheel/reading buttons missing: '+id);
   assert.equal(v.clue,content.words[id].clue);
   assert.equal(v.answer,content.words[id].answer);
   assert.deepEqual(v.hints,[content.words[id].hint1,content.words[id].hint2,content.words[id].hint3]);
   assert.equal(v.tiles,v.answer.length,'Wrong wheel tile count: '+id);
   await page.waitForFunction(()=>{
     const img=document.querySelector('#bu3857-content figure.bu3863-image img');
     return !!img&&img.complete&&img.naturalWidth===640&&img.naturalHeight===360;
   },{timeout:16000});
   // Solve by clicking EACH actual visible letter tile, no direct internal solve().
   const picked=await page.evaluate(id=>{
    const answer=BU_HQ_WORDS[id].answer;
    const wheel=[...document.querySelectorAll('#buhq-wheel button[data-buhq]')],used=new Set();
    for(const char of answer){
     const b=wheel.find(el=>el.textContent===char&&!used.has(el.dataset.buhq));
     if(!b)throw Error('No letter '+char+' available for '+id);
     used.add(b.dataset.buhq);
     b.click();
    }
    return used.size;
   },id);
   assert.equal(picked,v.answer.length);
   await page.waitForFunction(id=>!!bu3857State.solved[id],{timeout:8500},id);
   if(i<10){
     await page.evaluate(()=>document.getElementById('bu3857-continue')?.click());
     await page.waitForFunction(next=>bu3857Current()?.id===next,{timeout:10000},
       'g11-d'+String(i+1).padStart(2,'0'));
   }
  }
  const progress=await page.evaluate(()=>{
   const stored=JSON.parse(localStorage.getItem(BU_GENESIS_KEY)||'{}')?.genesis_ep11;
   return {solved:Object.keys(bu3857State.solved).filter(k=>/^g11-d/.test(k)).length,
      stored:stored?.solved&&Object.keys(stored.solved).filter(k=>/^g11-d/.test(k)).length,
      money:economy.coins,
      originalAnswers:Object.keys(BU_HQ_WORDS).filter(id=>/^g(07|08|09|10)-d/.test(id)).length};
  });
  assert.equal(progress.solved,10);
  assert.equal(progress.stored,10,'Standard save key must persist all 10 solved answers');
  assert.equal(progress.originalAnswers,40);
  await page.evaluate(()=>document.getElementById('bu3857-continue')?.click());
  const final=await page.evaluate(()=>({done:bu3857State.complete,button:document.getElementById('bu3857-next-episode')?.textContent}));
  assert(final.done&&final.button?.includes('Next Genesis Episode'),'Episode 11 must link to Episode 12');
  const forward12=await page.evaluate(()=>{
   document.getElementById('bu3857-next-episode')?.click();
   return {book:bu3857State?.book,scene:bu3857Current()?.id};
  });
  assert.deepEqual(forward12,{book:'genesis_ep12',scene:'g12-d01'},'Episode 11 finale must enter next playable chapter');
  await page.reload({waitUntil:'domcontentloaded',timeout:100000});
  await page.waitForFunction(()=>typeof bu3857Open==='function',{timeout:85000});
  const resumed=await page.evaluate(()=>{bu3857Open('genesis_ep11');return {completed:bu3857State.complete,book:bu3857State.book};});
  assert.deepEqual(resumed,{completed:true,book:'genesis_ep11'});
  assert.deepEqual(errors,[],'JavaScript errors playing native Genesis 11');
  console.log('PASS_GENESIS11_TEN_ACTUAL_WHEELS_AND_PHOTOS',JSON.stringify({
     viewport:width+'x'+height,images:10,played:10,episode10To11:true,
     allPriorAnswers:true,completion:true,resumeAfterRefresh:true,errors:0}));
  await page.close();
 }
 }finally{await browser.close();}
})().catch(e=>{console.error('FAIL_GENESIS11_ACTUAL_PLAYPATH',e.stack||e);process.exitCode=1});

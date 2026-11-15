#!/usr/bin/env node
'use strict';
// Isolated real Chromium QA for Genesis 12 native Story wheel; not physical-phone acceptance.
const assert=require('node:assert/strict');
const puppeteer=require('puppeteer-core');
const cp=require('node:child_process');
const chrome=cp.execSync('command -v chromium || command -v google-chrome',{encoding:'utf8'}).trim();
const base=process.env.STORY_URL||'http://127.0.0.1:8893/index.html';
(async()=>{
const browser=await puppeteer.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-dev-shm-usage'],protocolTimeout:120000});
try{
for(const [width,height] of [[320,568],[390,844]]){
 const ctx=await browser.createBrowserContext(),page=await ctx.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.setViewport({width,height,isMobile:true,hasTouch:true,deviceScaleFactor:1});
 await page.goto(base,{waitUntil:'load',timeout:120000});
 await page.waitForFunction(()=>window.BUStoryGenesis12Test?.discoveryCount===13&&window.BUStoryGenesis13Test?.status==='ready',{timeout:80000});
 const entry=await page.evaluate(()=>{
  makeEpisodes();const card=document.querySelector('#episode-list [data-episode="11"]');
  return {cards:document.querySelectorAll('#episode-list .episode-card').length,locked:!card.classList.contains('available'),
   words:Object.keys(BU_HQ_WORDS).filter(k=>k.startsWith('g12-d')).length};
 });
 assert.deepEqual(entry,{cards:13,locked:true,words:13});
 // Simulate a previously completed Episode 11 and exercise its real
 // "Next Episode" button, not just a direct programmatic chapter open.
 const nextChapter=await page.evaluate(()=>{
  completedChapters.genesis_ep11=true;
  bu3857Open('genesis_ep11',true);
  bu3857State.complete=true;
  bu3857Render();
  const button=document.getElementById('bu3857-next-episode');
  const label=button?.textContent?.trim();
  button?.click();
  return {label,book:bu3857State?.book,first:bu3857Current()?.id};
 });
 assert.deepEqual(nextChapter,{label:'Next Genesis Episode →',book:'genesis_ep12',first:'g12-d01'});
 await page.evaluate(()=>{economy.coins=500;saveEconomy();document.getElementById('bu3857-hint').click()});
 assert.equal(await page.evaluate(()=>economy.coins),500,'Free clue charged tokens');
 for(const balance of [485,460]){
  await page.$eval('#bu3864-modal-layer .bu3864-modal-body .gold-button',b=>b.click());
  assert.equal(await page.evaluate(()=>economy.coins),balance,'Incorrect hint price');
 }
 assert.equal(await page.evaluate(()=>buHQHintLetters['g12-d01']),0,'Hint revealed a letter');
 assert(await page.$eval('#bu3864-modal-layer .bu3864-modal-body .gold-button',b=>b.hidden),'Extra hint offered');
 await page.evaluate(()=>document.getElementById('bu3864-modal-layer')?.buClose?.());
 const wrong=await page.evaluate(()=>{
  const d=bu3857Current(),a=BU_HQ_WORDS[d.id].answer,tiles=[...document.querySelectorAll('#buhq-wheel [data-buhq]')],used=new Set(),before=[economy.points,economy.coins];
  for(const c of [...a].reverse()){const b=tiles.find(x=>x.textContent===c&&!used.has(x));if(!b)throw Error('Wrong-letter tile unavailable');used.add(b);b.click();}
  return {solved:!!bu3857State.solved[d.id],unchanged:before[0]===economy.points&&before[1]===economy.coins};
 });
 assert.deepEqual(wrong,{solved:false,unchanged:true});
 await new Promise(r=>setTimeout(r,850));
 for(let i=0;i<13;i++){
  await page.waitForFunction(()=>{
   const d=bu3857Current?.(),img=document.querySelector('#bu3857-content figure.bu3863-image img');
   return !!d&&!!img&&img.complete&&img.naturalWidth===640&&img.naturalHeight===360;
  },{timeout:20000});
  const art=await page.evaluate(()=>{
   const d=bu3857Current(),img=document.querySelector('#bu3857-content figure.bu3863-image img');
   const wheel=document.getElementById('buhq-wheel');
   const stage=document.querySelector('#bu3857-content .bu3863-stage');
   const scripture=document.getElementById('bu3863-scripture');
   const sr=scripture?.getBoundingClientRect();
   return {id:d.id,src:img?.getAttribute('src'),alt:img?.alt,top:img?.getBoundingClientRect().top,
    wheelTop:wheel?.getBoundingClientRect().top,
    nativeSlot:img?.closest('figure')?.parentElement===stage,
    scriptureVisible:!!sr&&sr.top>=-2&&sr.bottom<=innerHeight+2};
  });
  if(i===0)console.log('G12_LAYOUT_'+width,JSON.stringify(await page.evaluate(()=>{
   const root=document.getElementById('bu3857-content'),figure=root?.querySelector('figure.bu3863-image'),
    story=document.getElementById('bu3863-story'),wheel=document.getElementById('buhq-wheel'),scripture=document.getElementById('bu3863-scripture');
   const pos=x=>x?{top:Math.round(x.getBoundingClientRect().top),bottom:Math.round(x.getBoundingClientRect().bottom),
    height:Math.round(x.getBoundingClientRect().height)}:null;
   return {viewport:{w:innerWidth,h:innerHeight},root:pos(root),figure:pos(figure),story:pos(story),wheel:pos(wheel),scripture:pos(scripture),
    scroll:document.documentElement.scrollHeight,rootScroll:root?.scrollHeight};
  })));
  assert.equal(art.src,'story-adventure-art/genesis12/'+art.id+'.webp','Incorrect scene art '+art.id);
  assert(art.alt?.length>30&&art.top<art.wheelTop,'Artwork/accessibility or vertical layout broken '+art.id);
  assert(art.nativeSlot,'Scene art must be direct child of native Story stage '+art.id);
  assert(art.scriptureVisible,'Scripture action pushed offscreen '+art.id);
  const result=await page.evaluate(()=>{
   const d=bu3857Current(),answer=BU_HQ_WORDS[d.id].answer,tiles=[...document.querySelectorAll('#buhq-wheel [data-buhq]')],used=new Set();
   if(tiles.length!==answer.length)throw Error('Tile count incorrect '+d.id);
   for(const c of answer){const b=tiles.find(x=>x.textContent===c&&!used.has(x));if(!b)throw Error('Missing '+c+' '+d.id);used.add(b);b.click();}
   return {id:d.id,solved:!!bu3857State.solved[d.id],overflow:document.documentElement.scrollWidth>innerWidth+2};
  });
  assert(result.solved,'Actual wheel did not solve '+result.id);
  assert(!result.overflow,'Horizontal overflow '+result.id);
  if(i===12)assert.equal(await page.$eval('#bu3857-continue',b=>b.textContent.trim()),'Complete Chapter ✦');
  await page.$eval('#bu3857-continue',b=>b.click());
  if(i===2){
   await page.reload({waitUntil:'load',timeout:120000});
   await page.waitForFunction(()=>window.BUStoryGenesis12Test?.chapterId==='genesis_ep12'&&window.BUStoryGenesis13Test?.status==='ready');
   assert(await page.$eval('#home',x=>!x.hidden),'Refresh must return Home');
   await page.evaluate(()=>bu3857Open('genesis_ep12'));
   assert.equal(await page.evaluate(()=>bu3857State.step),3,'Resume checkpoint lost');
  }
 }
 assert(await page.evaluate(()=>bu3857State.complete),'Did not reach native chapter finale');
 assert.equal(await page.$eval('#bu3857-next-episode',b=>b.textContent.trim()),'Next Genesis Episode →');
 await page.$eval('#bu3857-next-episode',b=>b.click());assert.equal(await page.evaluate(()=>bu3857State.book),'genesis_ep13');
 await page.$eval('#bu3857-back',b=>b.click());await page.evaluate(()=>bu3857Open('genesis_ep12'));
 const before=await page.evaluate(()=>[economy.points,economy.coins]);
 await page.$eval('#bu3857-replay',b=>b.click());
 await page.evaluate(()=>{
  const a=BU_HQ_WORDS[bu3857Current().id].answer,tiles=[...document.querySelectorAll('#buhq-wheel [data-buhq]')],used=new Set();
  for(const c of a){const b=tiles.find(x=>x.textContent===c&&!used.has(x));if(!b)throw Error('Replay tile missing');used.add(b);b.click();}
 });
 assert.deepEqual(await page.evaluate(()=>[economy.points,economy.coins]),before,'Replay farmed points');
 assert.deepEqual(errors,[],'Browser errors');
 console.log('PASS_GENESIS12_NATIVE',JSON.stringify({width,height,solved:13,hints:[0,15,25],resume:true,replay:true,art:13}));
 await ctx.close();
}
}finally{await browser.close()}
})().catch(e=>{console.error('FAIL_GENESIS12_NATIVE',e.stack||e);process.exitCode=1});

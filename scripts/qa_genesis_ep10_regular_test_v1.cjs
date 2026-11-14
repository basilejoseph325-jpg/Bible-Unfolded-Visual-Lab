#!/usr/bin/env node
'use strict';
/* Read-only, real Chrome regression for native Story Adventure after Episode 10.
   Tests only isolated browser profile; no user device, LIVE, or real saves. */
const assert=require('node:assert/strict');
const {execSync}=require('node:child_process');
const puppeteer=require('puppeteer-core');
const chrome=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const target=process.env.BU_TEST_URL||'http://127.0.0.1:8893/index.html';
(async()=>{
const browser=await puppeteer.launch({headless:true,executablePath:chrome,
  args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'],
  protocolTimeout:125000});
try{
for(const [width,height] of [[390,705],[320,568]]){
 const page=await browser.newPage(),errors=[];
 await page.setViewport({width,height,isMobile:true,hasTouch:true,deviceScaleFactor:2});
 page.on('pageerror',err=>errors.push(err.message));
 const response=await page.goto(target,{waitUntil:'domcontentloaded',timeout:115000});
 assert.equal(response.status(),200,'TEST game must load');
 await page.waitForFunction(()=>typeof bu3857Open==='function'&&typeof openEpisodes==='function'&&
  typeof bu3857Render==='function'&&!!document.getElementById('home-journey'),
  {timeout:85000});
 const home=await page.evaluate(()=>({
  story:!!document.getElementById('play'),
  journey:!!document.getElementById('home-journey'),
  daily:!!document.getElementById('daily-continue'),
  books:!!document.getElementById('home-books'),
  nehemiah:!!document.getElementById('bu-story-explorer-entry'),
  nehemiahLoader:!!document.getElementById('bu-story-explorer-launcher-v1'),
  bookShelfUrl:document.querySelector('script[src*="books"]')?.src||''
 }));
 assert(home.story&&home.journey&&home.daily&&home.books);
 assert.equal(home.nehemiah,false);
 assert.equal(home.nehemiahLoader,false);
 const overview=await page.evaluate(()=>{
  const originalCoins=economy.coins,originalPoints=economy.points;
  openEpisodes('genesis');
  const cards=[...document.querySelectorAll('#episode-list button[data-episode]')];
  const ch=BU3857_DATA.genesis_ep10;
  return{
   count:cards.length,
   episodes:cards.map(x=>x.querySelector('strong')?.textContent),
   last:cards.at(-1)?.textContent?.trim(),
   tenthId:cards.at(-1)?.dataset.episode,
   genIds:[...BU_GENESIS_IDS],
   discoveries:ch?.discoveries?.map(x=>x.id),
   allSources:ch?.discoveries?.every(x=>x.scripture?.[0]?.url?.startsWith('https://www.jw.org/en/library/bible/nwt/books/genesis/')),
   saveKey:BU_GENESIS_KEY,
   coinsUnchanged:economy.coins===originalCoins&&economy.points===originalPoints
  };
 });
 assert.equal(overview.count,10);
 assert.equal(overview.tenthId,'9');
 assert(overview.last.includes('Jacob and Esau'));
 assert.deepEqual(overview.genIds,['genesis_ep07','genesis_ep08','genesis_ep09','genesis_ep10']);
 assert.deepEqual(overview.discoveries,Array.from({length:10},(_,i)=>'g10-d'+String(i+1).padStart(2,'0')));
 assert.equal(overview.saveKey,'bible-unfolded-genesis-adventure-v3860');
 assert(overview.coinsUnchanged&&overview.allSources);
 const chapters=await page.evaluate(()=>{
   const outs=[],saved=economy.coins,points=economy.points;
   for(const id of BU_GENESIS_IDS){
     bu3857Open(id,true);
     const root=document.getElementById('bu3857-screen');
     outs.push({id,visible:!root.hidden,
       episode:document.getElementById('bu3857-episode')?.textContent,
       count:BU3857_DATA[id].discoveries.length,
       title:document.getElementById('bu3857-header-title')?.textContent});
   }
   bu3857Open('genesis_ep10',true);
   for(let i=0;i<10;i++){
     bu3857State.step=i;
     bu3857Render();
     const id=bu3857Current().id;
     const body=document.getElementById('bu3857-content');
     outs.push({scene:id,rendered:!!body?.textContent?.length,
       hasAction:body?.querySelectorAll('button').length>0});
   }
   const previousSaved=!!localStorage.getItem(BU_GENESIS_KEY);
   return {outs,coinsStable:economy.coins===saved&&economy.points===points,previousSaved};
 });
 for(const c of chapters.outs.slice(0,4)){
  assert(c.visible&&c.count===10&&/GENESIS/.test(c.episode),'Existing native Genesis chapters should remain playable: '+c.id);
 }
 for(const s of chapters.outs.slice(4))assert(s.rendered&&s.hasAction,'Each new discovery must render a playable control: '+s.scene);
 assert(chapters.coinsStable,'Merely opening a chapter must not grant/spend rewards');
 const transition=await page.evaluate(()=>{
   bu3857Open('genesis_ep09',true);
   bu3857State.complete=true;
   bu3857Render();
   const button=document.getElementById('bu3857-next-episode');
   const before={label:button?.textContent};
   button?.click();
   return {...before,after:bu3857State?.book,
     title:document.getElementById('bu3857-header-title')?.textContent,
     originalSaveKey:BU_GENESIS_KEY};
 });
 assert(/Next Genesis Episode/.test(transition.label),'Episode 9 must link to Episode 10, not exit to menu');
 assert.equal(transition.after,'genesis_ep10');
 assert.equal(transition.title,'Jacob and Esau');
 assert.equal(transition.originalSaveKey,'bible-unfolded-genesis-adventure-v3860');
 assert.deepEqual(errors,[],'No native runtime exceptions');
 console.log('PASS_GENESIS_EP10_REGULAR_TEST',JSON.stringify({
  viewport:width+'x'+height,homePreserved:true,oldChapters7to9:true,
  tenScenesWithActions:true,episode9NextTo10:true,rewardWalletStable:true,
  noUnapprovedNehemiah:true,errors:0
 }));
 await page.close();
}
}finally{await browser.close();}
})().catch(err=>{console.error('FAIL_GENESIS_EP10_REGULAR_TEST',err.stack||err);process.exitCode=1});

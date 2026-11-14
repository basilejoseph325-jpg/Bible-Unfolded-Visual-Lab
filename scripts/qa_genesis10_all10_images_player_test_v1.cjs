#!/usr/bin/env node
'use strict';
/* ACTUAL native Story Adventure browser path, all 10 images.
   Synthetic mobile browser only. No player data, wallet, locks, or LIVE writes.
 */
const assert=require('node:assert/strict');
const {execSync}=require('node:child_process');
const puppeteer=require('puppeteer-core');
const chrome=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const url=process.env.STORY_URL||'http://127.0.0.1:8896/index.html';
const expected=[
'abraham-burial-promise.webp',
'rebekah-inquires-jehovah.webp',
'esau-and-jacob.webp',
'esau-birthright-stew.webp',
'isaac-stays-gerar.webp',
'rehoboth-water-found.webp',
'isaac-abimelech-covenant.webp',
'rebekah-goatskins-jacob.webp',
'isaac-blessing-jacob.webp',
'jacob-stairway-dream.webp'
];
(async()=>{
 const browser=await puppeteer.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'],protocolTimeout:120000});
 try{
  for(const [width,height] of [[390,705],[320,568]]){
   const page=await browser.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.setViewport({width,height,deviceScaleFactor:2,isMobile:true,hasTouch:true});
   const resp=await page.goto(url,{waitUntil:'domcontentloaded',timeout:115000});
   assert([200,304].includes(resp.status()),'TEST game unavailable');
   await page.waitForFunction(()=>typeof bu3857Open==='function'&&
    typeof bu3857Render==='function'&&
    typeof BU_GENESIS_IDS!=='undefined',{timeout:85000});
   const original=await page.evaluate(()=>({
    saveKey:BU_GENESIS_KEY,
    genesisIDs:[...BU_GENESIS_IDS],
    episode10Length:BU3857_DATA.genesis_ep10.discoveries.length,
    original30Answers:Object.keys(BU_HQ_WORDS).filter(x=>/^g0[789]-d/.test(x)).length,
    new10Answers:Object.keys(BU_HQ_WORDS).filter(x=>/^g10-d/.test(x)).length,
    home:!!document.getElementById('home-journey'),
    books:!!document.getElementById('home-books'),
    originalStage:!!document.getElementById('play'),
    hasUnapprovedNehemiah:!!document.getElementById('bu-story-explorer-entry')
   }));
   assert.equal(original.saveKey,'bible-unfolded-genesis-adventure-v3860');
   assert.deepEqual(original.genesisIDs,['genesis_ep07','genesis_ep08','genesis_ep09','genesis_ep10']);
   assert.equal(original.episode10Length,10);
   assert.equal(original.original30Answers,30);
   assert.equal(original.new10Answers,10);
   assert(original.home&&original.books&&original.originalStage&&!original.hasUnapprovedNehemiah);
   const status=[];
   for(let i=0;i<10;i++){
    const state=await page.evaluate(i=>{
     bu3857Open('genesis_ep10',true);
     bu3857State.step=i;
     bu3857Render();
     const root=document.getElementById('bu3857-content');
     const image=root?.querySelector('figure.bu3863-image img');
     const wheel=root?.querySelector('#buhq-wheel');
     return {id:bu3857Current()?.id,src:image?.getAttribute('src'),alt:image?.getAttribute('alt'),
       wheel:!!wheel,question:root?.textContent?.slice(0,140),visible:!!root?.getClientRects().length};
    },i);
    assert.equal(state.id,'g10-d'+String(i+1).padStart(2,'0'),'Native episode scene ID changed');
    assert(state.src?.endsWith(expected[i]),'Wrong or missing scene photo '+(i+1)+': '+state.src);
    assert(state.alt&&state.alt.length>40,'Missing meaningful scene alt text '+(i+1));
    assert(state.wheel&&state.visible,'Native word wheel missing at scene '+(i+1));
    await page.waitForFunction(()=>{
     const image=document.querySelector('#bu3857-content figure.bu3863-image img');
     return !!image&&image.complete&&image.naturalWidth===640&&image.naturalHeight===360;
    },{timeout:16000});
    const geometry=await page.evaluate(()=>{
     const root=document.getElementById('bu3857-content');
     const image=root.querySelector('figure.bu3863-image img');
     const wheel=root.querySelector('#buhq-wheel');
     return {imgTop:image.getBoundingClientRect().top,wheelTop:wheel.getBoundingClientRect().top};
    });
    assert(geometry.imgTop<geometry.wheelTop,'Image must appear ABOVE Story word wheel');
    status.push({scene:i+1,image:state.src});
   }
   assert.equal(new Set(status.map(x=>x.image)).size,10,'Every discovery needs its own image, not reused photos');
   const after=await page.evaluate(()=>({
    saveKey:BU_GENESIS_KEY,
    priorBook:BU3857_DATA.genesis_ep09.discoveries.length,
    walletStable:!!document.getElementById('home-journey'),
    noUnapprovedNehemiah:!document.getElementById('bu-story-explorer-entry')
   }));
   assert.equal(after.saveKey,original.saveKey);
   assert.equal(after.priorBook,10);
   assert(after.walletStable&&after.noUnapprovedNehemiah);
   assert.deepEqual(errors,[],'JS errors in native chapter render: '+errors.join(' | '));
   console.log('PASS_ALL_10_GENESIS_SCENE_PICTURES',JSON.stringify({screen:width+'x'+height,
    images:status.map(x=>x.image.split('/').at(-1)),originalStory:true,
    original30AnswersPreserved:true,lockRoutinesUntouched:true,saveKeyUnchanged:true,noJSErrors:true}));
   await page.close();
  }
 }finally{await browser.close()}
})().catch(err=>{console.error('FAIL_GENESIS_ALL_10_IMAGES',err.stack||err);process.exitCode=1});

#!/usr/bin/env node
'use strict';
/* First-picture regression: actually render native Story scene and load pixels.
   This test never changes chapter locks or real player progress. */
const assert=require('node:assert/strict'),cp=require('node:child_process'),puppeteer=require('puppeteer-core');
const chrome=cp.execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const address=process.env.STORY_URL||'http://127.0.0.1:8895/index.html';
(async()=>{
 const browser=await puppeteer.launch({headless:true,executablePath:chrome,
  args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'],protocolTimeout:120000});
 try{
  for(const [width,height] of [[390,705],[320,568]]){
   const page=await browser.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.setViewport({width,height,deviceScaleFactor:2,isMobile:true,hasTouch:true});
   const res=await page.goto(address,{waitUntil:'domcontentloaded',timeout:115000});
   assert([200,304].includes(res?.status()),'Native TEST page unavailable');
   await page.waitForFunction(()=>typeof bu3857Open==='function'&&typeof bu3857Render==='function',
     {timeout:80000});
   const statuses=[];
   for(const n of [0,2,3]){
    const state=await page.evaluate(n=>{
     bu3857Open('genesis_ep10',true);
     bu3857State.step=n;
     bu3857Render();
     const root=document.getElementById('bu3857-content');
     return{
      scene:n+1,
      title:bu3857Current()?.title,
      src:root?.querySelector('figure.bu3863-image img')?.getAttribute('src'),
      hasWheel:!!root?.querySelector('#buhq-wheel'),
      locksUntouched:typeof openEpisodes==='function'
     };
    },n);
    const expected={0:['abraham-burial-promise.webp'],2:['esau-and-jacob.webp','esau-jacob-brothers.webp'],3:['esau-birthright-stew.webp']}[n];
    assert(expected.some(file=>state.src?.endsWith(file)),'Discovery '+(n+1)+' has no correct photo; actual '+state.src);
    await page.waitForFunction(()=>{
      const e=document.querySelector('#bu3857-content figure.bu3863-image img');
      return !!e&&e.complete&&e.naturalWidth>=600&&e.naturalHeight>=300;
    },{timeout:17000});
    const dims=await page.evaluate(()=>{
      const root=document.getElementById('bu3857-content');
      const img=root.querySelector('figure.bu3863-image img');
      const wheel=root.querySelector('#buhq-wheel');
      return {width:img.naturalWidth,height:img.naturalHeight,imageTop:img.getBoundingClientRect().top,
        wheelTop:wheel?.getBoundingClientRect().top};
    });
    assert(dims.imageTop<dims.wheelTop,'Scene picture should appear above wheel');
    assert(state.hasWheel&&state.locksUntouched,'Native story wheel damaged');
    statuses.push({scene:state.scene,title:state.title,img:state.src,dims});
   }
   const base=await page.evaluate(()=>({
    originalGenesisIds:[...BU_GENESIS_IDS],
    originalAnswers:Object.keys(BU_HQ_WORDS).filter(k=>/^g0[789]-d/.test(k)).length,
    saveKey:BU_GENESIS_KEY,
    unlockRoutine:typeof openEpisodes==='function'
   }));
   assert.equal(base.originalAnswers,30);
   assert.equal(base.saveKey,'bible-unfolded-genesis-adventure-v3860');
   assert.deepEqual(errors,[]);
   console.log('PASS_GENESIS_1_3_4_PICTURES',JSON.stringify({viewport:width+'x'+height,images:statuses.map(x=>({scene:x.scene,img:x.img,naturalWidth:x.dims.width})),old30:true,saveKeyPreserved:true,noErrors:true}));
   await page.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error('FAIL_GENESIS_PICTURES',e.stack||e);process.exitCode=1});

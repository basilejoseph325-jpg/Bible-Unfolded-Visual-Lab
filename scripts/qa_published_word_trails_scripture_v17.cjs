// Read-only QA against the ACTUAL published Visual Lab TEST page.
// No changes to production storage or repositories. Browser context starts fresh.
'use strict';
const assert=require('node:assert/strict'),puppeteer=require('puppeteer-core');
const {execSync}=require('node:child_process');
const site='https://basilejoseph325-jpg.github.io/Bible-Unfolded-Visual-Lab/';
const chrome=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const expected=[
 {level:14,kind:'extra',word:'END'},
 {level:15,kind:'extra',word:'HEM'},
 {level:20,kind:'spark',word:'AMON'},
 {level:25,kind:'extra',word:'AGE'}
];
(async()=>{
 const browser=await puppeteer.launch({headless:true,executablePath:chrome,
  args:['--no-sandbox','--disable-setuid-sandbox','--autoplay-policy=no-user-gesture-required'],protocolTimeout:120000});
 try{
  for(const [width,height] of [[390,705],[320,568]]){
   const context=await browser.createBrowserContext(),page=await context.newPage(),errors=[];
   await page.setViewport({width,height,isMobile:true,hasTouch:true,deviceScaleFactor:2});
   page.on('pageerror',e=>errors.push(e.message.slice(0,150)));
   await page.goto(site+'index.html?verify=wt-scripture-20261113',{waitUntil:'domcontentloaded',timeout:120000});
   await page.waitForFunction(()=>window.BUWTNativeShell?.nativeReady?.(),{timeout:120000});
   const indexVersion=await page.evaluate(()=>[...document.scripts].find(x=>x.src.includes('journey-progress-caption.js'))?.src);
   assert(indexVersion?.includes('20261113-wt-scripture-v17'),'Published ROOT bootstrap is not v17');
   await page.evaluate(()=>document.getElementById('home-cross').click());
   await page.waitForFunction(()=>window.BUWTNativeShell?.active?.()&&
     !!document.getElementById('bu-wt-native-game')?.contentWindow?.BUWTUnifiedMenu,{timeout:70000});
   const state=await page.evaluate(()=>{
    const frame=document.getElementById('bu-wt-native-game');
    const child=frame.contentWindow,levels=child.BUWTAdditionalLevels||[];
    const box=frame.getBoundingClientRect();
    const revisions=[14,15,20,25].map(n=>{
      const l=levels[n-12];
      return {level:n,spark:l?.spark,extras:l?.extraSparks?.map(x=>x.word),
        reference:l?.reference,levelTitle:l?.title};
    });
    return {versions:{
      frame:frame.src,
      levels:[...child.document.scripts].find(s=>s.src.includes('word-trails-levels-12-30-v1.js'))?.src
     },n:levels.length,revisions,
     geometry:{frameWidth:box.width,frameHeight:box.height,scroll:child.document.body.scrollHeight-child.innerHeight},
     nativeMenu:!!document.getElementById('game-menu'),
     nativeSettings:!!document.getElementById('settings-dialog'),
     wheel:!!child.document.querySelector('#wheel'),
     board:!!child.document.querySelector('#board')};
   });
   assert.equal(state.n,19,'All levels 12–30 must load on the public TEST site');
   assert(state.versions.frame.includes('scripture-batch1-20261113'));
   assert(state.versions.levels.includes('scripture-batch1-20261113'));
   assert(state.nativeMenu&&state.nativeSettings&&state.wheel&&state.board,'Actual shared menu + game render');
   assert(state.geometry.frameWidth>=width-2&&state.geometry.frameHeight>=height-2,'Full-screen native overlay');
   for(const t of expected){
    const q=state.revisions.find(r=>r.level===t.level);
    assert(q&&(t.kind==='spark'?q.spark===t.word:q.extras.includes(t.word)),
     'Published Bible item missing '+t.level+' '+t.word);
   }
   if(width===390)await page.screenshot({path:'/tmp/WT-SCRIPTURE-V17-PUBLISHED-390.png'});
   assert.equal(errors.length,0,'No webpage JS exceptions: '+JSON.stringify(errors));
   console.log('PASS_PUBLISHED_WORD_TRAILS_TEST',JSON.stringify({width,height,state}));
   await context.close();
  }
 }catch(e){console.error('FAIL_PUBLISHED_WORD_TRAILS_TEST',e.stack||e);process.exitCode=1}
 finally{await browser.close()}
})();

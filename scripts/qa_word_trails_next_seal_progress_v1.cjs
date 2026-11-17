#!/usr/bin/env node
'use strict';
/* TEST-only mobile check of existing Word Trails saves and next-seal preview.
   No user's real storage, coins, native wallet or LIVE game is accessed. */
const assert=require('node:assert/strict');
const puppeteer=require('puppeteer-core');
const cp=require('node:child_process'),fs=require('node:fs'),vm=require('node:vm');
const content={window:{}};vm.runInNewContext(fs.readFileSync('experiments/word-trails-levels-46-50-v1.js','utf8'),content);
const lastWords=content.window.BUWTLevels46to50[4].words.map(w=>w[0]);
const chrome=cp.execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const root=process.env.WT_URL||'http://127.0.0.1:8890/experiments/word-trails-next-v1.html';
const SAVE_KEY='bu-visual-lab-wordtrails-next-v1';
const scenarios=[
 {name:'new',completed:[],level:0,unlocked:0,coins:60,title:'First Steps',done:0},
 {name:'one-away',completed:[0,1,2,3],level:4,unlocked:4,coins:180,title:'First Steps',done:4},
 {name:'next-chapter',completed:[0,1,2,3,4],level:5,unlocked:5,coins:240,title:'Courage Crest',done:0},
 {name:'legacy30',completed:Array.from({length:30},(_,i)=>i),level:29,unlocked:29,coins:700,title:'Scripture Explorer',done:0},
 {name:'legacy35',completed:Array.from({length:35},(_,i)=>i),level:34,unlocked:34,coins:700,title:'Steady Journey',done:0},
 {name:'legacy40',completed:Array.from({length:40},(_,i)=>i),level:39,unlocked:39,coins:700,title:'Purposeful Paths',done:0},
 {name:'legacy45',completed:Array.from({length:45},(_,i)=>i),level:44,unlocked:44,coins:700,title:'Listening Heart',done:0},
 {name:'all-seals',completed:Array.from({length:50},(_,i)=>i),level:49,unlocked:49,coins:700,title:'All ten Journey Seals collected',done:5}
];
const browserOpts={headless:true,executablePath:chrome,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required'],protocolTimeout:120000};
(async()=>{
 const browser=await puppeteer.launch(browserOpts);
 try{
  for(const [width,height] of [[320,568],[430,932]]){
   for(const shared of [false,true])for(const scenario of scenarios){
    const ctx=await browser.createBrowserContext(),page=await ctx.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.setViewport({width,height,isMobile:true,hasTouch:true,deviceScaleFactor:1});
    const seed={level:scenario.level,unlocked:scenario.unlocked,completed:scenario.completed,coins:scenario.coins,progress:null};
    await page.evaluateOnNewDocument((key,value,shared)=>{
     if(localStorage.getItem('__seal_seeded'))return;localStorage.setItem('__seal_seeded','1');localStorage.setItem(key,JSON.stringify(value));
     if(shared){localStorage.setItem('bible-unfolded-rewards-v17',JSON.stringify({coins:533,points:20,earned:[],purchases:[],hints:{}}));localStorage.setItem('bu-visual-lab-shared-preview-20261116:bible-unfolded-rewards-v17','private-canary');}
    },SAVE_KEY,seed,shared);
    const url=new URL(root);if(!shared)url.searchParams.set('standalone','qa');else{url.pathname=url.pathname.replace(/experiments\/word-trails-next-v1\.html$/,'index.html');url.search='';}
    await page.goto(url.href,{waitUntil:'domcontentloaded',timeout:120000});
    let game=page;const activeKey=shared?'bu-visual-lab-wordtrails-shared-preview-v1':SAVE_KEY;
    if(shared){
     await page.waitForFunction(()=>window.BUPreviewStorageFence?.writerStatus().writable&&window.BUWTNativeShell?.nativeReady()&&window.BUTestInsightBridge?.nativeBalance().ok,{timeout:90000});
     await page.evaluate(()=>{document.getElementById('daily-continue')?.click();BUWTNativeShell.launch()});
     await page.waitForSelector('#bu-wt-native-game');game=await(await page.$('#bu-wt-native-game')).contentFrame();
    }
    await game.waitForFunction(()=>document.querySelector('#board .tile')&&document.querySelectorAll('#wheel .wheel-letter').length>=5,{timeout:90000});
    const nativeBefore=shared?await page.evaluate(()=>economy.coins):null;
    const before=await game.evaluate(key=>localStorage.getItem(key),activeKey);
    await game.$eval('#level-map',b=>b.click());
    const map=await game.evaluate(()=>{
      const el=document.querySelector('#wt-map-seal-track');
      return {
        open:document.getElementById('map').open,
        heading:document.getElementById('wt-map-seal-title').textContent,
        detail:document.getElementById('wt-map-seal-detail').textContent,
        now:el.getAttribute('aria-valuenow'),max:el.getAttribute('aria-valuemax'),
        fill:document.getElementById('wt-map-seal-fill').style.width,
        coinExplainer:document.querySelector('#map .map-panel>p').textContent,
        levels:document.querySelectorAll('#map-list .map-level').length,
        level31Unlocked:!document.querySelectorAll('#map-list .map-level')[30].disabled,
        level36Unlocked:!document.querySelectorAll('#map-list .map-level')[35].disabled,
        level41Unlocked:!document.querySelectorAll('#map-list .map-level')[40].disabled,
        level46Unlocked:!document.querySelectorAll('#map-list .map-level')[45].disabled,
        storedUnlocked:JSON.parse(localStorage.getItem(document.getElementById('coin-label')?.textContent==='TOKENS'?'bu-visual-lab-wordtrails-shared-preview-v1':'bu-visual-lab-wordtrails-next-v1')).unlocked,
        bodyOverflow:document.documentElement.scrollWidth>innerWidth+1
      };
    });
    assert(map.open,'Level map did not open');
    assert(map.heading.includes(scenario.title),'Wrong upcoming seal '+scenario.name+': '+map.heading);
    assert.equal(map.now,String(scenario.done),'Milestone count wrong '+scenario.name);
    assert.equal(map.max,'5');
    assert.equal(map.fill,scenario.done*20+'%');
    assert.equal(map.levels,50,'Expected 50 levels');
    if(scenario.name==='legacy30'){
      assert.equal(map.storedUnlocked,30,'Completed Level 30 must unlock Level 31');
      assert(map.level31Unlocked,'Level 31 must be playable without replaying Level 30');
    }
    if(scenario.name==='legacy35'){
      assert.equal(map.storedUnlocked,35,'Completed Level 35 must unlock Level 36');
      assert(map.level36Unlocked,'Level 36 must be playable without replaying Level 35');
    }
    if(scenario.name==='legacy40'){
      assert.equal(map.storedUnlocked,40,'Completed Level 40 must unlock Level 41');
      assert(map.level41Unlocked,'Level 41 must be playable without replaying Level 40');
    }
    if(scenario.name==='legacy45'){
      assert.equal(map.storedUnlocked,45,'Completed Level 45 must unlock Level 46');
      assert(map.level46Unlocked,'Level 46 must be playable without replaying Level 45');
    }
    assert(map.coinExplainer.includes('15')&&map.coinExplainer.includes('free hint'),'Coin spending unclear');
    assert(!map.bodyOverflow,'Horizontal overflow at '+width);
    const after=await game.evaluate(key=>localStorage.getItem(key),activeKey);
    assert.equal(after,before,'Viewing milestone must never write a save');
    await game.$eval('#map-x',b=>b.click());
    if(scenario.name==='new'||(shared&&scenario.name==='all-seals')){
      for(const word of scenario.name==='new'?['ANTIC','TACO','TONIC','COIN']:lastWords){
        const outcome=await game.evaluate(word=>{
          const rack=[...document.querySelectorAll('#wheel .wheel-letter')],used=new Set();
          for(const c of word){
            const b=rack.find(x=>x.textContent===c&&!used.has(x));
            if(!b)throw Error('No letter '+c+' for '+word);
            used.add(b);b.click();
          }
          document.getElementById('submit').click();
          return document.getElementById('solved-count').textContent;
        },word);
        assert(outcome.includes('/ '+(scenario.name==='new'?4:lastWords.length)),'Unexpected board: '+outcome);
      }
      await game.waitForFunction(()=>document.getElementById('finish').open,{timeout:12000});
      const win=await game.evaluate(()=>{
        const p=document.getElementById('finish-next-seal'),next=document.getElementById('next-level'),
          parent=document.getElementById('finish').querySelector('.finish-panel');
        return {label:p.textContent,level:document.getElementById('finish-level').textContent,
          buttons:!!next&&!next.disabled,
          frameHeight:parent.clientHeight,frameScroll:parent.scrollHeight,
          viewportHeight:innerHeight,
          wallet:JSON.parse(localStorage.getItem(document.getElementById('coin-label')?.textContent==='TOKENS'?'bu-visual-lab-wordtrails-shared-preview-v1':'bu-visual-lab-wordtrails-next-v1'))};
      });
      if(scenario.name==='new')assert(win.label.includes('First Steps')&&win.label.includes('1/5'),'Win screen lacks next milestone');else assert(win.label.includes('All ten'),'Completed Level 50 lost its final seal');
      assert(win.level.includes('LEVEL '+(scenario.name==='new'?1:50)+' COMPLETE')&&win.buttons,'Normal win action missing');
      assert(win.frameHeight<=height*0.91,'Win frame too tall');
      assert.equal(win.wallet.completed.filter(x=>x===(scenario.name==='new'?0:49)).length,1,'Win did not save exactly one completion');
      if(shared){assert.equal(await page.evaluate(()=>economy.coins),nativeBefore+(scenario.name==='new'?4:0),'Once-only native level/seal reward failed');assert.equal(win.wallet.unlocked,scenario.name==='new'?1:49);}
      assert.deepEqual(errors,[],'Game threw errors while finishing puzzle');
    }
    if(shared){assert.equal(await page.evaluate(()=>BUPreviewStorageFence.originalKeyValue('bu-visual-lab-wordtrails-next-v1')),JSON.stringify(seed),'Original progress changed');assert.equal(await page.evaluate(()=>BUPreviewStorageFence.originalKeyValue('bu-visual-lab-shared-preview-20261116:bible-unfolded-rewards-v17')),'private-canary');if(scenario.name!=='new')assert.equal(await page.evaluate(()=>economy.coins),nativeBefore,'Legacy accomplishments repaid');}
    assert.deepEqual(errors,[],'Browser error in '+scenario.name+' '+width);
    console.log('PASS_WT_SEAL_PROGRESS',JSON.stringify({width,height,shared,case:scenario.name,done:scenario.done,title:scenario.title,saveUnchangedOnMap:true,fullFirstLevel:scenario.name==='new'}));
    await ctx.close();
   }
  }
 }finally{await browser.close()}
})().catch(e=>{console.error('FAIL_WT_SEAL_PROGRESS',e.stack||e);process.exitCode=1});

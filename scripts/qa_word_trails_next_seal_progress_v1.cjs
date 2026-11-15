#!/usr/bin/env node
'use strict';
/* TEST-only mobile check of existing Word Trails saves and next-seal preview.
   No user's real storage, coins, native wallet or LIVE game is accessed. */
const assert=require('node:assert/strict');
const puppeteer=require('puppeteer-core');
const cp=require('node:child_process');
const chrome=cp.execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const root=process.env.WT_URL||'http://127.0.0.1:8890/experiments/word-trails-next-v1.html';
const SAVE_KEY='bu-visual-lab-wordtrails-next-v1';
const scenarios=[
 {name:'new',completed:[],level:0,unlocked:0,coins:60,title:'First Steps',done:0},
 {name:'one-away',completed:[0,1,2,3],level:4,unlocked:4,coins:180,title:'First Steps',done:4},
 {name:'next-chapter',completed:[0,1,2,3,4],level:5,unlocked:5,coins:240,title:'Courage Crest',done:0},
 {name:'legacy30',completed:Array.from({length:30},(_,i)=>i),level:29,unlocked:29,coins:700,title:'Scripture Explorer',done:0},
 {name:'all-seals',completed:Array.from({length:35},(_,i)=>i),level:34,unlocked:34,coins:700,title:'All seven Journey Seals collected',done:5}
];
const browserOpts={headless:true,executablePath:chrome,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required'],protocolTimeout:120000};
(async()=>{
 const browser=await puppeteer.launch(browserOpts);
 try{
  for(const [width,height] of [[320,568],[390,705]]){
   for(const scenario of scenarios){
    const ctx=await browser.createBrowserContext(),page=await ctx.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.setViewport({width,height,isMobile:true,hasTouch:true,deviceScaleFactor:1});
    const seed={level:scenario.level,unlocked:scenario.unlocked,completed:scenario.completed,coins:scenario.coins,progress:null};
    await page.evaluateOnNewDocument((key,value)=>localStorage.setItem(key,JSON.stringify(value)),SAVE_KEY,seed);
    await page.goto(root,{waitUntil:'domcontentloaded',timeout:120000});
    await page.waitForFunction(()=>document.querySelector('#board .tile')&&document.querySelectorAll('#wheel .wheel-letter').length>=5,{timeout:90000});
    const before=await page.evaluate(key=>localStorage.getItem(key),SAVE_KEY);
    await page.$eval('#level-map',b=>b.click());
    const map=await page.evaluate(()=>{
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
        storedUnlocked:JSON.parse(localStorage.getItem('bu-visual-lab-wordtrails-next-v1')).unlocked,
        bodyOverflow:document.documentElement.scrollWidth>innerWidth+1
      };
    });
    assert(map.open,'Level map did not open');
    assert(map.heading.includes(scenario.title),'Wrong upcoming seal '+scenario.name+': '+map.heading);
    assert.equal(map.now,String(scenario.done),'Milestone count wrong '+scenario.name);
    assert.equal(map.max,'5');
    assert.equal(map.fill,scenario.done*20+'%');
    assert.equal(map.levels,35,'Expected 35 levels');
    if(scenario.name==='legacy30'){
      assert.equal(map.storedUnlocked,30,'Completed Level 30 must unlock Level 31');
      assert(map.level31Unlocked,'Level 31 must be playable without replaying Level 30');
    }
    assert(map.coinExplainer.includes('15')&&map.coinExplainer.includes('free hint'),'Coin spending unclear');
    assert(!map.bodyOverflow,'Horizontal overflow at '+width);
    const after=await page.evaluate(key=>localStorage.getItem(key),SAVE_KEY);
    assert.equal(after,before,'Viewing milestone must never write a save');
    await page.$eval('#map-x',b=>b.click());
    if(scenario.name==='new'){
      for(const word of ['ANTIC','TACO','TONIC','COIN']){
        const outcome=await page.evaluate(word=>{
          const rack=[...document.querySelectorAll('#wheel .wheel-letter')],used=new Set();
          for(const c of word){
            const b=rack.find(x=>x.textContent===c&&!used.has(x));
            if(!b)throw Error('No letter '+c+' for '+word);
            used.add(b);b.click();
          }
          document.getElementById('submit').click();
          return document.getElementById('solved-count').textContent;
        },word);
        assert(outcome.includes('/ 4'),'Unexpected Level 1 board: '+outcome);
      }
      await page.waitForFunction(()=>document.getElementById('finish').open,{timeout:12000});
      const win=await page.evaluate(()=>{
        const p=document.getElementById('finish-next-seal'),next=document.getElementById('next-level'),
          parent=document.getElementById('finish').querySelector('.finish-panel');
        return {label:p.textContent,level:document.getElementById('finish-level').textContent,
          buttons:!!next&&!next.disabled,
          frameHeight:parent.clientHeight,frameScroll:parent.scrollHeight,
          viewportHeight:innerHeight,
          wallet:JSON.parse(localStorage.getItem('bu-visual-lab-wordtrails-next-v1'))};
      });
      assert(win.label.includes('First Steps')&&win.label.includes('1/5'),'Win screen lacks next milestone');
      assert(win.level.includes('LEVEL 1 COMPLETE')&&win.buttons,'Normal win action missing');
      assert(win.frameHeight<=height*0.91,'Win frame too tall');
      assert.equal(win.wallet.completed.filter(x=>x===0).length,1,'Win did not save exactly one completion');
      assert.deepEqual(errors,[],'Game threw errors while finishing puzzle');
    }
    assert.deepEqual(errors,[],'Browser error in '+scenario.name+' '+width);
    console.log('PASS_WT_SEAL_PROGRESS',JSON.stringify({width,height,case:scenario.name,done:scenario.done,title:scenario.title,saveUnchangedOnMap:true,fullFirstLevel:scenario.name==='new'}));
    await ctx.close();
   }
  }
 }finally{await browser.close()}
})().catch(e=>{console.error('FAIL_WT_SEAL_PROGRESS',e.stack||e);process.exitCode=1});

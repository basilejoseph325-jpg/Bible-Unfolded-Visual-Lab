#!/usr/bin/env node
'use strict';
// WebKit browser smoke of a TEMPORARY LOCAL COPY of pinned LIVE with exactly
// two draft auto-import retirement files. No production URL or player data.
const assert=require('node:assert/strict'),{webkit}=require('playwright');
const URL='http://127.0.0.1:8897',TEST='bu-visual-lab-wordtrails-next-v1',LIVE='bible-unfolded-word-trails-next-v1';
const source={level:2,unlocked:5,coins:9999,points:300,completed:[0,1,2],
 sparks:[0],claimedSparks:['0:ABEL'],boardBible:[],paidWords:[],paidBonuses:[],
 claimedFreeHints:[0],sound:true,
 progress:{level:2,found:['ELI'],bonuses:[],hinted:[],combo:1}};
const raw=JSON.stringify(source);
const checkSave=async page=>page.evaluate(LIVE=>{
 const raw=localStorage.getItem(LIVE);
 return raw===null?null:JSON.parse(raw);
},LIVE);
(async()=>{
 const browser=await webkit.launch({headless:true,timeout:90000});
 try{
 for(const [width,height] of [[390,705],[320,568]]){
  for(const oldHTML of [false,true]){
   const ctx=await browser.newContext({viewport:{width,height},
    isMobile:true,hasTouch:true,deviceScaleFactor:2});
   try{
    const page=await ctx.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    const target=oldHTML?URL+'/experiments/word-trails-old-html-compat-v6.html':URL+'/index.html';
    await page.goto(target,{waitUntil:'domcontentloaded',timeout:120000});
    if(!oldHTML){
     await page.waitForFunction(()=>window.BUWTNativeShell?.nativeReady?.()&&
      !!document.querySelector('#home-cross'),null,{timeout:110000});
    }
    // Seed a synthetic TEST save while LIVE crossword key is ABSENT.
    await page.evaluate(({t,raw,l})=>{
     localStorage.setItem(t,raw);localStorage.removeItem(l);
    },{t:TEST,raw,l:LIVE});
    assert.equal(await page.evaluate(l=>localStorage.getItem(l),LIVE),null);
    if(oldHTML){
     await page.waitForFunction(()=>window.BUWTLegacyAutoImportRetiredV6?.disabled===true&&
      document.querySelectorAll('.wheel-letter').length>=6,
      null,{timeout:100000});
    }else{
     await page.evaluate(()=>document.querySelector('#home-cross').click());
     await page.waitForFunction(()=>window.BUWTNativeShell?.active?.()&&
      !!document.querySelector('#bu-wt-native-game')?.contentWindow?.BUWTPolish&&
      document.querySelector('#bu-wt-native-game')?.contentWindow?.document
       .querySelectorAll('.wheel-letter').length>=6,
      null,{timeout:110000});
     assert.equal(await page.evaluate(()=>window.BUWTLegacyAutoImportRetiredV6),undefined,
      'New LIVE HTML must NOT load the old importer slot');
    }
    await page.waitForFunction(l=>localStorage.getItem(l)!==null,LIVE,{timeout:45000});
    const saved=await checkSave(page);
    assert(saved&&Array.isArray(saved.completed));
    assert.equal(saved.completed.length,0,'No old TEST completed levels copied silently');
    assert.equal(saved.migration,undefined,'No silent legacy migration provenance');
    assert.equal(saved.level,0,'Fresh LIVE crossword should start from level one');
    assert.equal(saved.coins,60,'Fresh LIVE crossword uses only its legitimate starting coins');
    assert.equal(await page.evaluate(t=>localStorage.getItem(t),TEST),raw,
     'TEST progress source must remain byte unchanged');
    assert.deepEqual(errors,[],'No browser JS page exceptions on locally patched LIVE copy');
    console.log('PASS_STAGE1_V6_PINNED_LIVE_WEBKIT',JSON.stringify({
     viewport:width+'x'+height,
     case:oldHTML?'old HTML refetches new no-op shim':'new HTML omits importer',
     localPinnedLiveCopy:true,wordTrailsLoaded:true,
     liveFreshBoardLevel1:true,legacyCompletedLevelsNotImported:true,
     testSaveUntouched:true,zeroPageExceptions:true,
     liveRepositoryChanged:false,physicalIphoneCertified:false
    }));
   }finally{await ctx.close()}
  }
 }
 }finally{await browser.close()}
})().catch(e=>{console.error('FAIL_STAGE1_V6_PINNED_LIVE_WEBKIT',e.stack||e);
 process.exitCode=1});

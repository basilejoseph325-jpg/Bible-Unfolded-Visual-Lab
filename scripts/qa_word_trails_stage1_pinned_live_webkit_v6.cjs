#!/usr/bin/env node
'use strict';
// WebKit browser smoke of a TEMPORARY LOCAL COPY of pinned LIVE with exactly
// two draft auto-import retirement files. No production URL or player data.
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),{webkit}=require('playwright');
const URL='http://127.0.0.1:8897',TEST='bu-visual-lab-wordtrails-next-v1',LIVE='bible-unfolded-word-trails-next-v1';
const source={level:2,unlocked:5,coins:9999,points:300,completed:[0,1,2],
 sparks:[0],claimedSparks:['0:ABEL'],boardBible:[],paidWords:[],paidBonuses:[],
 claimedFreeHints:[0],sound:true,
 progress:{level:2,found:['ELI'],bonuses:[],hinted:[],combo:1}};
const raw=JSON.stringify(source);
// The pinned old script, used as a byte-exact stand-in for an OLD CACHED response.
// A new LIVE shim cannot retroactively invalidate a browser's old JS cache.
const oldJs=fs.readFileSync('/tmp/wt-stage1-original.js','utf8');
const oldBytes=Buffer.from(oldJs,'utf8');
assert.equal(crypto.createHash('sha1').update('blob '+oldBytes.length+'\0').update(oldBytes).digest('hex'),
 '52d0a564a16a964daf70e156e46e7d7866480c81','Pinned original LIVE importer changed');
const checkSave=async page=>page.evaluate(LIVE=>{
 const raw=localStorage.getItem(LIVE);
 return raw===null?null:JSON.parse(raw);
},LIVE);
(async()=>{
 const browser=await webkit.launch({headless:true,timeout:90000});
 try{
 for(const [width,height] of [[390,705],[320,568]]){
  for(const mode of ['fresh-html','old-html-refetches-shim','old-html-cached-old-js']){
   const oldHTML=mode!=='fresh-html',cachedJS=mode==='old-html-cached-old-js';
   const ctx=await browser.newContext({viewport:{width,height},
    isMobile:true,hasTouch:true,deviceScaleFactor:2});
   try{
    // Seed before scripts load, especially cached older HTML that may launch
    // the Word Trails engine before DOMContentLoaded returns.
    await ctx.addInitScript(({test,live,progress})=>{
     localStorage.setItem(test,progress);
     localStorage.removeItem(live);
    },{test:TEST,live:LIVE,progress:raw});
    const page=await ctx.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    // Real WebKit interception: serve the exact ORIGINAL code from the SAME old
    // JS URL, representing an old browser-cache hit. This MUST remain unsafe.
    if(cachedJS)await page.route('**/word-trails-live-migration-v1.js*',route=>
     route.fulfill({status:200,contentType:'application/javascript',body:oldJs}));
    const target=oldHTML?URL+'/experiments/word-trails-old-html-compat-v6.html':URL+'/index.html';
    await page.goto(target,{waitUntil:'domcontentloaded',timeout:120000});
    if(!oldHTML){
     await page.waitForFunction(()=>window.BUWTNativeShell?.nativeReady?.()&&
      !!document.querySelector('#home-cross'),null,{timeout:110000});
    }
    // In the fresh root, the LIVE key must stay absent until Word Trails
    // actually starts. Old cached HTML itself starts the game immediately.
    if(!oldHTML)assert.equal(await page.evaluate(l=>localStorage.getItem(l),LIVE),null);
    if(oldHTML){
     await page.waitForFunction(stale=>(stale || window.BUWTLegacyAutoImportRetiredV6?.disabled===true)&&
      document.querySelectorAll('.wheel-letter').length>=6,
      cachedJS,{timeout:100000});
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
    if(cachedJS){
     // Negative regression: old cached *JS* can still silently recreate LIVE.
     // The test PASSES only if this dangerous limitation is honestly detected.
     assert.equal(saved.completed.length,3,'A cached old importer must still exhibit the known unsafe copy');
     assert.equal(saved.migration?.version,1,'Expected exact legacy autoimport provenance');
     assert.equal(saved.migration?.source,'Visual Lab crossword progress');
     console.log('EXPECTED_STALE_CACHE_RISK_V6',JSON.stringify({viewport:width+'x'+height,
      oldHtml:true,originalOldJsServedAtSameUrl:true,oldAutoimportStillUnsafe:true}));
    }else{
     assert.equal(saved.completed.length,0,'No old TEST completed levels copied silently');
     assert.equal(saved.migration,undefined,'No silent legacy migration provenance');
     assert.equal(saved.level,0,'Fresh LIVE crossword should start from level one');
     assert.equal(saved.coins,60,'Fresh LIVE crossword uses only its legitimate starting coins');
    }
    assert.equal(await page.evaluate(t=>localStorage.getItem(t),TEST),raw,
     'TEST progress source must remain byte unchanged');
    assert.deepEqual(errors,[],'No browser JS page exceptions on locally patched LIVE copy');
    console.log('PASS_STAGE1_V6_PINNED_LIVE_WEBKIT',JSON.stringify({
     viewport:width+'x'+height,
     case:mode,
     localPinnedLiveCopy:true,wordTrailsLoaded:true,
     legacyCompletedLevelsNotImported:!cachedJS,
     knownUncontrolledOldJsCanAutoimport:cachedJS,
     testSaveUntouched:true,zeroPageExceptions:true,
     liveRepositoryChanged:false,physicalIphoneCertified:false
    }));
   }finally{await ctx.close()}
  }
 }
 }finally{await browser.close()}
})().catch(e=>{console.error('FAIL_STAGE1_V6_PINNED_LIVE_WEBKIT',e.stack||e);
 process.exitCode=1});

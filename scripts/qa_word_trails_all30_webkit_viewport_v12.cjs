#!/usr/bin/env node
'use strict';
/* TEST-only all-30 native Word Trails in REAL WebKit.
 * Exercises genuine home card + embedded Word Trails, actual level-map buttons,
 * both phone-sized viewports, board/wheel layout, and saved level after refresh.
 * Everything is synthetic in isolated browser contexts; not physical iPhone QA.
 */
const assert=require('node:assert/strict');
const {webkit}=require('playwright');
const ROOT='http://127.0.0.1:8898/index.html';
const TEST='bu-visual-lab-wordtrails-next-v1';
const LIVE='bible-unfolded-word-trails-next-v1';
const WALLET='bible-unfolded-rewards-v17';
const WHEELS='bible-unfolded-wheel-ownership-v3825-backup';
const VOICE='bible-unfolded-private-voice-pref-v381';
const SENTINEL='bu-wt-all30-webkit-test-sentinel';
const seed={
 [TEST]:JSON.stringify({level:0,unlocked:29,coins:317,points:0,
  completed:[],sparks:[],claimedSparks:[],boardBible:[],
  paidWords:[],paidBonuses:[],claimedFreeHints:[],sound:false,progress:null}),
 [LIVE]:JSON.stringify({level:15,unlocked:16,coins:233,completed:[0,1,2,3],unique:'DO_NOT_TOUCH_LIVE'}),
 [WALLET]:JSON.stringify({coins:749,points:30}),
 [WHEELS]:JSON.stringify({owned:['ocean-glow']}),
 [VOICE]:JSON.stringify({voice:'off',volume:41}),
 [SENTINEL]:'byte-identical-before-after'
};
const protectedKeys=[LIVE,WALLET,WHEELS,VOICE,SENTINEL];
async function snapshot(page,keys){
 return page.evaluate(keys=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)])),keys);
}
async function gameFrame(page){
 await page.waitForFunction(()=>window.BUWTNativeShell?.active?.()&&
  !!document.querySelector('#bu-wt-native-game')?.contentWindow?.BUWTPolish,
  null,{timeout:100000});
 const child=page.frames().find(f=>f.url().includes('word-trails-next-v1.html'));
 assert(child,'Native Word Trails iframe missing');
 await child.waitForFunction(()=>document.querySelectorAll('.wheel-letter').length>=5,
  null,{timeout:45000});
 return child;
}
(async()=>{
 const browser=await webkit.launch({headless:true,timeout:90000});
 try{
  for(const [width,height] of [[390,705],[320,568]]){
   const ctx=await browser.newContext({viewport:{width,height},isMobile:true,
    hasTouch:true,deviceScaleFactor:2});
   try{
    await ctx.addInitScript(values=>{
     for(const [key,value] of Object.entries(values))localStorage.setItem(key,value);
    },seed);
    const page=await ctx.newPage(),errors=[],badArtwork=[];
    page.on('pageerror',err=>errors.push(err.message));
    page.on('response',response=>{
     if(response.status()===404&&response.url().includes('/bible-book-art/'))
      badArtwork.push(response.url());
    });
    await page.goto(ROOT,{waitUntil:'domcontentloaded',timeout:110000});
    await page.waitForFunction(()=>window.BUWTNativeShell?.nativeReady?.()&&
     !!document.querySelector('#home-cross'),null,{timeout:100000});
    const before=await snapshot(page,protectedKeys);
    for(const key of protectedKeys)assert.equal(before[key],seed[key],key+' unexpectedly altered on load');
    await page.locator('#home-cross').evaluate(el=>el.click());
    const child=await gameFrame(page);
    let checked=0,minWheel=99,maxWheel=0,boardSizes=new Set();
    for(let i=0;i<30;i++){
     // Real UI navigation, no direct access to closure-private game methods.
     await child.locator('#level-map').evaluate(el=>el.click());
     await child.waitForFunction(()=>document.querySelector('#map')?.open);
     const availability=await child.evaluate(()=>{
      const items=[...document.querySelectorAll('#map-list .map-level')];
      return {count:items.length,unlocked:items.filter(el=>!el.disabled).length};
     });
     assert.deepEqual(availability,{count:30,unlocked:30},
      'All 30 fictional unlocked map entries should be accessible');
     await child.evaluate(i=>{
      const b=document.querySelectorAll('#map-list .map-level')[i];
      if(!b||b.disabled)throw Error('Level map inaccessible at '+(i+1));
      b.click();
     },i);
     await child.waitForFunction(level=>
      !document.querySelector('#map')?.open&&
      document.querySelector('#level-label')?.textContent.includes('LEVEL '+level+' / 30'),
      i+1,{timeout:20000});
     const row=await child.evaluate(()=>{
      const take=id=>{
       const el=document.querySelector(id);
       if(!el)return null;
       const r=el.getBoundingClientRect();
       return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,
        width:r.width,height:r.height};
      };
      return {
       label:document.querySelector('#level-label')?.textContent||'',
       title:document.querySelector('#scene-title')?.textContent||'',
       solved:document.querySelector('#solved-count')?.textContent||'',
       gridSize:document.querySelector('#board')?.dataset.size,
       tiles:document.querySelectorAll('#board .tile').length,
       wheelLetters:document.querySelectorAll('#wheel .wheel-letter').length,
       viewport:{w:innerWidth,h:innerHeight},
       pageWidth:document.documentElement.scrollWidth,
       app:take('#app'),board:take('#board'),wheel:take('#wheel'),
       levelMap:take('#level-map'),hint:take('#hint')
      };
     });
     assert(row.title.trim().length>=2,'Missing level title '+(i+1));
     assert(row.tiles>=6&&row.tiles<=49,'Unusual board tile count at level '+(i+1));
     assert(row.wheelLetters>=5&&row.wheelLetters<=7,
      'Letter wheel must contain 5-7 usable letters at level '+(i+1));
     assert(['5','6','7'].includes(row.gridSize),'Unsupported grid size '+row.gridSize);
     assert(row.pageWidth<=row.viewport.w+2,
      'Horizontal page scroll at level '+(i+1)+': '+JSON.stringify(row));
     for(const key of ['board','wheel','levelMap','hint']){
      const b=row[key];
      assert(b&&b.width>8&&b.height>8,'Invisible '+key+' at level '+(i+1));
      assert(b.left>=-3&&b.right<=row.viewport.w+4,
       'Horizontal clipping for '+key+' at level '+(i+1)+': '+JSON.stringify(row));
      assert(b.top>=-5&&b.bottom<=row.viewport.h+8,
       'Vertical clipping for '+key+' at level '+(i+1)+': '+JSON.stringify(row));
     }
     boardSizes.add(row.gridSize);
     minWheel=Math.min(minWheel,row.wheelLetters);
     maxWheel=Math.max(maxWheel,row.wheelLetters);
     checked++;
    }
    const saved=await snapshot(page,[TEST,...protectedKeys]);
    const state=JSON.parse(saved[TEST]);
    assert.equal(state.level,29,'Final visited 30th level should persist');
    assert.equal(state.unlocked,29);
    assert.equal(state.coins,317,'Browsing levels must not mint/spend TEST coins');
    for(const key of protectedKeys)assert.equal(saved[key],before[key],
     'Browsing 30 levels altered protected state '+key);
    // Refresh from Word Trails must return home; reopening restores level 30.
    await page.reload({waitUntil:'domcontentloaded',timeout:110000});
    await page.waitForFunction(()=>window.BUWTNativeShell?.nativeReady?.()&&
     !window.BUWTNativeShell?.active?.(),null,{timeout:100000});
    await page.locator('#home-cross').evaluate(el=>el.click());
    const resumed=await gameFrame(page);
    assert((await resumed.locator('#level-label').textContent()).includes('LEVEL 30 / 30'),
     'Reentry must resume level 30 after refresh');
    const after=await snapshot(page,protectedKeys);
    for(const key of protectedKeys)assert.equal(after[key],before[key],
     'Refresh/reentry altered protected '+key);
    assert.deepEqual(errors,[],'Browser exceptions during actual 30-level navigation');
    assert.deepEqual(badArtwork,[],'Some story art files returned 404');
    console.log('PASS_WORD_TRAILS_ALL30_WEBKIT_V12',JSON.stringify({
     viewport:width+'x'+height,levelsNavigated:checked,
     nativeHomeAndIframe:true,actualLevelMapNavigation:true,
     gridSizes:[...boardSizes].sort(),minWheelLetters:minWheel,maxWheelLetters:maxWheel,
     horizontalAndVerticalKeyControlsWithinViewport:true,
     reloadReturnsHomeThenResumesLevel30:true,
     testCoinsUnchanged:true,originalLiveWalletWheelsVoicesUnchanged:true,
     zeroJsExceptions:true,missingArtwork404:0,physicalIphoneCertified:false
    }));
   }finally{await ctx.close()}
  }
 }finally{await browser.close()}
})().catch(e=>{
 console.error('FAIL_WORD_TRAILS_ALL30_WEBKIT_V12',e.stack||e);
 process.exitCode=1;
});

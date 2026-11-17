#!/usr/bin/env node
'use strict';
/* Real game through an isolated import of regular TEST's native 533 tokens
 * + Word Trails Level 6 / 111 legacy coins. Never touches user storage/LIVE.
 */
const assert=require('node:assert/strict');
const {chromium,webkit}=require('playwright');
const {execSync}=require('node:child_process');
const chrome=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const BASE='http://127.0.0.1:8894/index.html?bu_shared_wallet_preview=1&bu_import_regular_test=1';
const WALLET='bible-unfolded-rewards-v17';
const OLDTRAIL='bu-visual-lab-wordtrails-next-v1';
const PREFIX='bu-visual-lab-regular-wallet-copy-20261116:';
const PREVIOUS='bu-visual-lab-shared-preview-20261116:'+WALLET;
const original={
 [WALLET]:JSON.stringify({coins:533,points:13605,earned:['sentinel-native'],purchases:['goldwheel'],hints:{}}),
 'bible-unfolded-rewards-v17-recovery-v3811':JSON.stringify({coins:533,points:13605,earned:['sentinel-native'],purchases:['goldwheel'],hints:{}}),
 [OLDTRAIL]:JSON.stringify({coins:111,points:505,level:5,unlocked:5,
   completed:[0,1,2,3,4],claimedSparks:[],claimedFreeHints:[],paidBonuses:[],progress:null}),
 'buGuideLast:0':'17',
 [PREVIOUS]:JSON.stringify({coins:64,points:30,earned:['private-preview'],purchases:[]}),
};
async function test(engine,browser,width,height){
 const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,deviceScaleFactor:2});
 try{
  await context.addInitScript(data=>{for(const [key,value] of Object.entries(data))localStorage.setItem(key,value)},original);
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e.message||e)));
  await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:130000});
  await page.waitForFunction(()=>window.BUPreviewStorageFence?.importMode===true&&
   window.BUPreviewStorageFence?.status?.().imported===true&&
   window.BUPreviewStorageFence?.writerStatus?.().writable===true&&
   window.BUTestInsightBridge?.nativeBalance?.().balance===533&&
   window.BUWTNativeShell?.nativeReady?.(),null,{timeout:125000});
  const seed=await page.evaluate(()=>{
   const fence=window.BUPreviewStorageFence;
   return {native:economy.coins,points:economy.points,
    nativeSaved:JSON.parse(localStorage.getItem('bible-unfolded-rewards-v17')).coins,
    imported:fence.status().imported,prefix:fence.previewPrefix,
    original:fence.originalKeyValue('bible-unfolded-rewards-v17'),
    oldTrail:fence.originalKeyValue('bu-visual-lab-wordtrails-next-v1'),
    previous:fence.originalKeyValue('bu-visual-lab-shared-preview-20261116:bible-unfolded-rewards-v17'),
    books:localStorage.getItem('buGuideLast:0'), banner:document.querySelector('#bu-preview-wallet-banner')?.textContent};
  });
  assert.equal(seed.native,533,'Existing native TEST balance must carry into the copied shared wallet');
  assert.equal(seed.points,13605,'Existing Points must be preserved separately');
  assert.equal(seed.nativeSaved,533);
  assert.equal(seed.prefix,PREFIX);
  assert(seed.imported);
  assert(seed.banner.includes('COPIED TEST TOKENS'));
  assert.equal(seed.books,'17','Existing reading progress must be copied');
  for(const [key,raw] of Object.entries({
   [WALLET]:seed.original,[OLDTRAIL]:seed.oldTrail,[PREVIOUS]:seed.previous
  }))assert.equal(raw,original[key],'Original game data modified: '+key);
  await page.evaluate(()=>BUWTNativeShell.launch());
  await page.waitForFunction(()=>{
   const f=document.getElementById('bu-wt-native-game')?.contentWindow;
   return window.BUWTNativeShell?.active?.()&&f?.document?.getElementById('points')?.textContent==='533'&&
    f?.document?.getElementById('level-label')?.textContent?.includes('6 / 50')&&
    f?.document?.getElementById('coin-label')?.textContent==='TOKENS';
  },null,{timeout:34000});
  const trail=await page.evaluate(()=>{
   const f=document.getElementById('bu-wt-native-game').contentWindow;
   return {level:f.document.getElementById('level-label').textContent,
    coins:f.document.getElementById('points').textContent,
    caption:f.document.getElementById('coin-label').textContent,
    saved:JSON.parse(f.localStorage.getItem('bu-visual-lab-wordtrails-shared-preview-v1'))};
  });
  assert(trail.level.includes('6 / 50'),'Existing Word Trails level must resume');
  assert.equal(trail.coins,'533','Former 111 Trail Coins may not masquerade as shared tokens');
  assert.equal(trail.caption,'TOKENS');
  assert.equal(trail.saved?.coins,111,'Old separate Trail Coins must be preserved in copied progress, not added to 533');
  await page.evaluate(()=>{
   const f=document.getElementById('bu-wt-native-game').contentWindow;
   f.document.getElementById('hint').click();
  });
  await page.waitForFunction(()=>{
   const f=document.getElementById('bu-wt-native-game')?.contentWindow;
   return f?.document?.getElementById('hint-cost')?.textContent==='15';
  },null,{timeout:16000});
  await page.evaluate(()=>{
   const f=document.getElementById('bu-wt-native-game').contentWindow;
   f.document.getElementById('hint').click();
  });
  await page.waitForFunction(()=>economy.coins===518,null,{timeout:15000});
  await page.evaluate(()=>BUWTNativeShell.close());
  await page.reload({waitUntil:'domcontentloaded',timeout:135000});
  await page.waitForFunction(()=>window.BUPreviewStorageFence?.writerStatus?.().writable===true&&
   window.BUTestInsightBridge?.nativeBalance?.().balance===518,null,{timeout:110000});
  const final=await page.evaluate(()=>({
    preview:BUPreviewStorageFence.previewPrefix,
    coins:economy.coins,original:BUPreviewStorageFence.originalKeyValue('bible-unfolded-rewards-v17'),
    old:BUPreviewStorageFence.originalKeyValue('bu-visual-lab-wordtrails-next-v1'),
    previous:BUPreviewStorageFence.originalKeyValue('bu-visual-lab-shared-preview-20261116:bible-unfolded-rewards-v17')
  }));
  assert.equal(final.preview,PREFIX);
  assert.equal(final.coins,518);
  assert.equal(final.original,original[WALLET],'Regular TEST/LIVE native wallet must remain byte-identical');
  assert.equal(final.old,original[OLDTRAIL],'Original 111 Trail Coins and level must remain byte-identical');
  assert.equal(final.previous,original[PREVIOUS],'Previous private preview must not be overwritten');
  assert.deepEqual(errors.filter(s=>/BUPreviewStorageFence|BUTestInsightBridge|Shared-wallet preview/i.test(s)),[]);
  console.log('PASS_COPY_REGULAR_TEST_SHARED_TOKENS',engine,width+'x'+height,
    '533 native + level 6, old 111 not double-paid, paid hint -15, 518 survives reload; originals untouched');
 }finally{await context.close();}
}
(async()=>{
 for(const [name,start] of [
  ['chromium',()=>chromium.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']})],
  ['webkit',()=>webkit.launch({headless:true})]
 ]){
  const browser=await start();try{for(const [w,h] of [[320,568],[430,932]])await test(name,browser,w,h);}
  finally{await browser.close();}
 }
 console.log('PASS all regular TEST copy-preview wallet checks');
})().catch(err=>{console.error(err);process.exitCode=1});

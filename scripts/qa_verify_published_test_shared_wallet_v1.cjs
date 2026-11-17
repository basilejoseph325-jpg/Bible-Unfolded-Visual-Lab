#!/usr/bin/env node
'use strict';
// Public TEST smoke-check. Fresh browser profiles only; no real player saves
// or production repository changes. The ordinary TEST link must be unchanged.
const assert=require('node:assert/strict');
const {chromium,webkit}=require('playwright');
const {execSync}=require('child_process');
const chrome=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const ORIGIN='https://basilejoseph325-jpg.github.io/Bible-Unfolded-Visual-Lab';
async function one(engine,browser,width,height){
 const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,deviceScaleFactor:2});
 try{
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(ORIGIN+'/index.html?bu_shared_wallet_preview=1&verify=20261116',{waitUntil:'domcontentloaded',timeout:140000});
  await page.waitForFunction(()=>window.BUPreviewStorageFence?.writerStatus?.().writable===true&&
    window.BUTestInsightBridge?.nativeBalance?.().ok===true&&
    window.BUWTNativeShell?.nativeReady?.()===true,
    null,{timeout:140000});
  const initial=await page.evaluate(()=>{
   const fence=BUPreviewStorageFence,bridge=BUTestInsightBridge;
   return {banner:document.querySelector('#bu-preview-wallet-banner')?.textContent,
    writer:fence.writerStatus(),
    balance:bridge.nativeBalance(),
    source:fence.originalKeyValue('bible-unfolded-rewards-v17'),
    nativeCoins:economy.coins};
  });
  assert(initial.banner?.includes('ISOLATED COIN TEST'),'Actual public TEST preview banner absent');
  assert(initial.writer.writable,'Public TEST Web Lock not acquired');
  assert(initial.balance.ok);
  assert.equal(initial.source,null,'Fresh real browser should have no original LIVE wallet');
  assert.equal(initial.balance.balance,initial.nativeCoins);
  const earned=await page.evaluate(()=>{
   const before=economy.coins;
   const ok=awardOnce('qa-published-shared-wallet-'+innerWidth,5,7,true);
   const stored=JSON.parse(localStorage.getItem('bible-unfolded-rewards-v17'));
   return {ok,before,after:economy.coins,saved:stored?.coins,
    live:BUPreviewStorageFence.originalKeyValue('bible-unfolded-rewards-v17')};
  });
  assert(earned.ok,'Actual public TEST native award failed');
  assert.equal(earned.after,earned.before+7,'Native coins do not award exactly once');
  assert.equal(earned.saved,earned.after);
  assert.equal(earned.live,null,'Shared preview wrote ordinary LIVE wallet on published site');
  await page.evaluate(()=>window.BUWTNativeShell.launch());
  await page.waitForFunction(balance=>{
   const child=document.querySelector('#bu-wt-native-game')?.contentWindow;
   return window.BUWTNativeShell?.active?.()&&
    child?.BUPreviewStorageFence?.active===true&&
    child?.document?.getElementById('points')?.textContent===String(balance)&&
    child?.document?.querySelector('.top-actions .points span')?.textContent==='◈';
  },earned.after,{timeout:50000});
  await page.evaluate(()=>window.BUWTNativeShell.close());
  await page.reload({waitUntil:'domcontentloaded',timeout:140000});
  await page.waitForFunction(()=>window.BUPreviewStorageFence?.writerStatus?.().writable===true&&
    window.BUTestInsightBridge?.nativeBalance?.().ok===true,null,{timeout:140000});
  assert.equal(await page.evaluate(()=>economy.coins),earned.after,'Actual public TEST isolated wallet did not survive reload');
  assert.equal(await page.evaluate(()=>BUPreviewStorageFence.originalKeyValue('bible-unfolded-rewards-v17')),null);
  assert.deepEqual(errors.filter(e=>/BUTestInsightBridge|BUPreviewStorageFence|shared.wallet/i.test(e)),[]);
  console.log('PASS_PUBLIC_SHARED_WALLET_PREVIEW',engine,width+'x'+height,'native award, Word Trails shared balance, ◈ badge, reload and canonical LIVE isolation');
 }finally{await context.close();}
}
async function normal(browser){
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 try{
  const page=await context.newPage();
  await page.goto(ORIGIN+'/index.html?verify=regular-test-20261116',{waitUntil:'domcontentloaded',timeout:140000});
  await page.waitForFunction(()=>window.BUWTNativeShell?.nativeReady?.()===true,null,{timeout:140000});
  const m=await page.evaluate(()=>({guard:window.BUPreviewStorageFence,bridge:window.BUTestInsightBridge,
   banner:document.getElementById('bu-preview-wallet-banner')}));
  assert.equal(m.guard,undefined,'Normal public TEST must not activate preview storage fence');
  assert.equal(m.bridge,undefined,'Normal public TEST must not attach shared-wallet preview bridge');
  assert.equal(m.banner,null,'Normal public TEST must not show private banner');
  console.log('PASS_PUBLIC_NORMAL_TEST_UNCHANGED','No preview wallet / banner without opt-in URL flag');
 }finally{await context.close();}
}
(async()=>{
 const engines=[
  ['chromium',()=>chromium.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-dev-shm-usage'],timeout:120000})],
  ['webkit',()=>webkit.launch({headless:true,timeout:120000})]
 ];
 for(const [name,start] of engines){
  const browser=await start();
  try{
   for(const [width,height] of [[320,568],[430,932]])await one(name,browser,width,height);
   if(name==='chromium')await normal(browser);
  }finally{await browser.close();}
 }
 console.log('PASS_ALL_PUBLISHED_TEST_SHARED_WALLET_BROWSER_CHECKS');
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});

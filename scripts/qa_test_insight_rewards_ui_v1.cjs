#!/usr/bin/env node
'use strict';
/* Actual TEST Rewards panel contract: no production browser, fresh isolated
 * profiles, guarded sandbox wallet. Logs real rendered shop controls to enable
 * a later exact purchase/insufficient-funds test without guessing selectors.
 */
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const {execSync}=require('node:child_process');
const exe=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const BASE='http://127.0.0.1:8894/index.html?bu_shared_wallet_preview=1';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:exe,
  args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'],timeout:100000});
 try{for(const [width,height] of [[320,568],[430,932]]){
 const ctx=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true});
 try{
  const marker=JSON.stringify({coins:733,points:99,earned:['real-wallet-test-canary'],purchases:['seawheel'],hints:{}});
  await ctx.addInitScript(v=>localStorage.setItem('bible-unfolded-rewards-v17',v),marker);
  const page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:140000});
  await page.waitForFunction(()=>window.BUPreviewStorageFence?.writerStatus?.().writable&&
   window.BUTestInsightBridge?.nativeBalance?.().ok&&window.BUWTNativeShell?.nativeReady?.(),null,{timeout:130000});
  const initial=await page.evaluate(()=>{
   const saved=JSON.parse(localStorage.getItem('bible-unfolded-rewards-v17'));
   if(!saved)throw Error('Preview wallet absent');
   focusHome();
   document.getElementById('home-rewards')?.click();
   return {nativeCoins:economy.coins,platform:window.BUPlatformRewards?.wallet?.()?.coins,
    savedCoins:saved.coins,mode:typeof mode!=='undefined'?mode:null,
    rewardsHidden:document.getElementById('rewards')?.hidden,
    nativeWallet:JSON.stringify(saved),
    original:window.BUPreviewStorageFence.originalKeyValue('bible-unfolded-rewards-v17')};
  });
  assert.equal(initial.nativeCoins,initial.platform,'PlatformRewards API cannot show a different balance');
  assert.equal(initial.savedCoins,initial.nativeCoins,'native Rewards save does not match balance');
  assert.equal(initial.original,marker,'original live wallet must be read-only');
  await page.waitForFunction(()=>{
   const root=document.getElementById('rewards');
   return root&&!root.hidden&&root.querySelector('#reward-products');
  },null,{timeout:25000});
  const inventory=await page.evaluate(()=>{
   const root=document.getElementById('rewards');
   return {
    screen:root.textContent.slice(0,4000),
    rootHTML:root.outerHTML.slice(0,3500),
    products:[...root.querySelectorAll('.reward-product')].map(e=>({
      title:e.querySelector('strong')?.textContent.trim(),text:e.textContent.trim().slice(0,240),
      buttons:[...e.querySelectorAll('button')].map(b=>({
       id:b.id,text:b.textContent.trim(),disabled:b.disabled,
       data:[...b.attributes].filter(a=>a.name.startsWith('data-')).map(a=>[a.name,a.value])
      }))
    })),
    coinUI:[...document.querySelectorAll('[id*=coin],[id*=wallet],[class*=wallet],[class*=coins]')].slice(0,35).map(x=>({
       tag:x.tagName,id:x.id,cls:String(x.className).slice(0,85),text:x.textContent.trim().slice(0,85),
       visible:x.getClientRects().length>0
    })),
    owned:window.BUPlatformRewards?.owned?.(),
    platformCoins:window.BUPlatformRewards?.wallet?.()?.coins,
    nativeCoins:economy.coins,
    originalCoins:window.BUPreviewStorageFence.originalKeyValue('bible-unfolded-rewards-v17')
   };
  });
  assert(inventory.products.length>=3,'Original rewards must render as distinct purchasable items');
  assert.equal(inventory.platformCoins,inventory.nativeCoins);
  assert.equal(inventory.originalCoins,marker);
  const significant=errors.filter(e=>/wallet|rewards|StorageFence|BUTestInsightBridge/i.test(e));
  assert.deepEqual(significant,[],significant.join('\n'));
  console.log('REWARDS_DOM_AUDIT_'+width,JSON.stringify(inventory));
  console.log('PASS_SHARED_REWARDS_INITIAL_'+width,'native wallet + PlatformRewards consistent; original LIVE bytes unchanged');
 }finally{await ctx.close();}
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});

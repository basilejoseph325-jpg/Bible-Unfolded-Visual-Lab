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
  page.on('dialog',async d=>d.accept());
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
  const gold=inventory.products.find(x=>x.title==='Golden Puzzle Wheel');
  assert(gold?.buttons?.some(b=>b.data.some(([name,value])=>name==='data-buy'&&value==='goldwheel')),
   'Native Golden Puzzle Wheel purchase button must exist in Rewards screen');
  const rewardsCounter=async()=>page.evaluate(()=>({
   native:economy.coins,
   platform:BUPlatformRewards.wallet()?.coins,
   hud:document.querySelector('#rewards-wallet .wallet-coins')?.textContent.trim(),
   owned:BUPlatformRewards.owned(),
   original:window.BUPreviewStorageFence.originalKeyValue('bible-unfolded-rewards-v17')
  }));
  // 60 < 180: the real shop button must refuse an unaffordable purchase.
  await page.evaluate(()=>document.querySelector('[data-buy="goldwheel"]').click());
  const refused=await rewardsCounter();
  assert.equal(refused.native,60,'Unaffordable golden wheel may not deduct tokens');
  assert.equal(refused.platform,60);
  assert(!refused.owned.includes('goldwheel'),'Unaffordable purchase may not grant ownership');
  assert(refused.hud?.includes('60 Insight Tokens'),'Visible shop HUD must show actual balance');
  assert.equal(refused.original,marker,'Native TEST Rewards click must not touch original LIVE wallet');
  await page.evaluate(()=>{
   economy.coins=180;
   if(saveEconomy()!==true)throw Error('Cannot seed exact native Rewards test price');
   updateWallet();
  });
  await page.waitForFunction(()=>document.querySelector('#rewards-wallet .wallet-coins')?.textContent.includes('180 Insight Tokens'),null,{timeout:12000});
  await page.evaluate(()=>document.querySelector('[data-buy="goldwheel"]').click());
  await page.waitForFunction(()=>economy.coins===0&&
   window.BUPlatformRewards?.owned?.().includes('goldwheel'),null,{timeout:20000});
  const purchased=await rewardsCounter();
  assert.equal(purchased.native,0,'Golden wheel must cost exactly 180 Insight Tokens');
  assert.equal(purchased.platform,0);
  assert(purchased.hud?.includes('0 Insight Tokens'),'Rewards HUD must update after real purchase');
  assert(purchased.owned.includes('goldwheel'),'Real purchase must grant permanent wheel ownership');
  assert.equal(purchased.original,marker);
  await page.evaluate(()=>{focusHome();window.BUWTNativeShell.launch();});
  await page.waitForFunction(()=>{
   const c=document.getElementById('bu-wt-native-game')?.contentWindow;
   return window.BUWTNativeShell?.active?.()&&
    c?.document?.getElementById('points')?.textContent==='0';
  },null,{timeout:30000});
  const badge=await page.evaluate(()=>{
   const c=document.getElementById('bu-wt-native-game').contentWindow;
   return {symbol:c.document.querySelector('.top-actions .points span')?.textContent,
    label:c.document.querySelector('.top-actions .points')?.getAttribute('aria-label')};
  });
  assert.equal(badge.symbol,'◈','Word Trails must use the native Insight Token symbol, not the Points star');
  assert.equal(badge.label,'Shared Insight Tokens');
  await page.evaluate(()=>window.BUWTNativeShell.close());
  await page.reload({waitUntil:'domcontentloaded',timeout:140000});
  await page.waitForFunction(()=>window.BUPreviewStorageFence?.writerStatus?.().writable&&
   window.BUTestInsightBridge?.nativeBalance?.().ok&&window.BUWTNativeShell?.nativeReady?.(),null,{timeout:120000});
  const reloaded=await page.evaluate(()=>({
   native:economy.coins,
   platform:BUPlatformRewards.wallet()?.coins,
   owned:BUPlatformRewards.owned(),
   original:window.BUPreviewStorageFence.originalKeyValue('bible-unfolded-rewards-v17')
  }));
  assert.equal(reloaded.native,0,'Golden wheel purchase must survive reload with no double spend');
  assert.equal(reloaded.platform,0);
  assert(reloaded.owned.includes('goldwheel'));
  assert.equal(reloaded.original,marker,'Original LIVE wheel/coin data must remain untouched');
  const significant=errors.filter(e=>/wallet|rewards|StorageFence|BUTestInsightBridge/i.test(e));
  assert.deepEqual(significant,[],significant.join('\n'));
  console.log('REWARDS_DOM_AUDIT_'+width,JSON.stringify(inventory));
  console.log('PASS_SHARED_REWARDS_PURCHASE_'+width,'unaffordable refused, gold wheel -180 once, HUD/native/Trails agree, ownership survives reload, LIVE unchanged');
 }finally{await ctx.close();}
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});

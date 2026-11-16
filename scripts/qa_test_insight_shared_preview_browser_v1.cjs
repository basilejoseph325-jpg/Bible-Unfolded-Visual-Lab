#!/usr/bin/env node
/* Real local HTTP browser path, Chromium + WebKit phone emulation.
 * Only a private Playwright browser profile. No production website,
 * no live branch, and no end-user browser storage is touched.
 */
'use strict';
const assert=require('node:assert/strict'),{chromium,webkit}=require('playwright');
const {execSync}=require('node:child_process');
const chrome=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const BASE='http://127.0.0.1:8894/index.html?bu_shared_wallet_preview=1';
const LIVE='bible-unfolded-rewards-v17',RECOVERY='bible-unfolded-rewards-v17-recovery-v3811';
const OWN='bible-unfolded-wheel-ownership-v3825',CROSS='bible-unfolded-word-trails-next-v1';
const rawWallet={points:999,coins:987,earned:['qa-sentinel-live'],purchases:['goldwheel'],hints:{}};
const ORIGINAL={
 [LIVE]:JSON.stringify(rawWallet),[RECOVERY]:JSON.stringify(rawWallet),
 [OWN]:JSON.stringify({owned:['goldwheel']}),
 [CROSS]:JSON.stringify({level:4,unlocked:4,completed:[0,1,2],coins:400,points:20}),
 'bu-james-return-loop-v1-test-only':'{"v":1,"balance":777}',
 'bu-native-boost-shop-v1-test-only':'{"version":1,"tokens":333}',
 'bu-wt-next-feel-v2':'{"music":true}',
 'bu-visual-lab-wordtrails-next-v1':JSON.stringify({level:0,unlocked:0,
  coins:600,points:12,completed:[],sparks:[],claimedSparks:[],paidBonuses:[]}),
 'other-app-unrelated-key':'do-not-touch'
};
async function run(engine,browser){
 for(const [width,height] of [[320,568],[430,932]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:true,
   hasTouch:true,deviceScaleFactor:2});
  try{
   await context.addInitScript(records=>{
    for(const [key,value] of Object.entries(records))localStorage.setItem(key,value);
   },ORIGINAL);
   const page=await context.newPage();
   const errors=[];
   page.on('pageerror',e=>errors.push(String(e.message||e)));
   await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:140000});
   await page.waitForFunction(()=>window.BUPreviewStorageFence?.active===true&&
    window.BUTestInsightBridge?.version==='2.0.0-native-sandbox'&&
    window.BUWTNativeShell?.nativeReady?.()&&
    window.BUPreviewStorageFence?.writerStatus?.().writable===true,null,{timeout:130000});
   const initial=await page.evaluate(()=>{
    const guard=window.BUPreviewStorageFence;
    return {
     wallet:window.BUTestInsightBridge.nativeBalance(),
     main:economy.coins,
     original:guard.originalKeyValue('bible-unfolded-rewards-v17'),
     backup:guard.originalKeyValue('bible-unfolded-rewards-v17-recovery-v3811'),
     ownership:guard.originalKeyValue('bible-unfolded-wheel-ownership-v3825'),
     crossword:guard.originalKeyValue('bible-unfolded-word-trails-next-v1'),
     other:Object.fromEntries(['bu-james-return-loop-v1-test-only',
       'bu-native-boost-shop-v1-test-only','bu-wt-next-feel-v2',
       'bu-visual-lab-wordtrails-next-v1','other-app-unrelated-key']
       .map(k=>[k,guard.originalKeyValue(k)])),
     originalMarker:document.getElementById('bu-preview-wallet-banner')?.textContent,
     overflow:document.documentElement.scrollWidth>innerWidth+2
    };
   });
   assert(initial.wallet.ok,'native wallet should initialize in sandbox');
   assert.equal(initial.original,ORIGINAL[LIVE],'original LIVE wallet changed during native init');
   assert.equal(initial.backup,ORIGINAL[RECOVERY]);
   assert.equal(initial.ownership,ORIGINAL[OWN]);
   assert.equal(initial.crossword,ORIGINAL[CROSS]);
   for(const [key,value] of Object.entries(initial.other))assert.equal(value,ORIGINAL[key],'Existing TEST save was touched: '+key);
   assert(initial.originalMarker?.includes('ISOLATED COIN TEST'),'preview must be visibly labeled');
   assert.equal(initial.overflow,false,'root preview overflow '+width);
   // Two real tabs must NEVER be able to write the same shared-wallet data.
   // Native saveEconomy is synchronous: the Web Lock makes a second preview
   // strictly read-only rather than risking a last-writer-wins coin loss.
   const baseline=await page.evaluate(()=>localStorage.getItem('bible-unfolded-rewards-v17'));
   const rival=await context.newPage();
   try{
    await rival.goto(BASE,{waitUntil:'domcontentloaded',timeout:140000});
    await rival.waitForFunction(()=>window.BUPreviewStorageFence?.writerStatus?.().status==='conflict',
      null,{timeout:50000});
    const refused=await rival.evaluate(()=>{
     const fence=window.BUPreviewStorageFence;
     let writesDenied=false;
     try{localStorage.setItem('bible-unfolded-rewards-v17','{"coins":999999}');}
     catch(e){writesDenied=String(e.message).includes('read-only');}
     return {writesDenied,blocked:fence.writerStatus(),
      warning:document.getElementById('bu-preview-wallet-lock-shield')?.textContent};
    });
    assert(refused.writesDenied,'second preview must block all shared currency writes');
    assert.equal(refused.blocked.writable,false);
    assert(refused.warning?.includes('already open in another tab'),
     'duplicate preview needs an understandable blocking explanation');
    assert.equal(await page.evaluate(()=>localStorage.getItem('bible-unfolded-rewards-v17')),
     baseline,'blocked rival cannot alter first tab wallet');
   }finally{await rival.close();}
   const rootEarn=await page.evaluate(()=>{
    const before=economy.coins;
    const success=awardOnce('qa-isolated-native-'+innerWidth,5,25,true);
    return {before,after:economy.coins,success};
   });
   assert(rootEarn.success);assert.equal(rootEarn.after-rootEarn.before,25);
   await page.evaluate(()=>window.BUWTNativeShell.launch());
   await page.waitForFunction(()=>{
    const f=document.getElementById('bu-wt-native-game')?.contentWindow;
    return window.BUWTNativeShell?.active?.()&&
      f?.document?.querySelectorAll('.wheel-letter').length>=5&&
      f.document.getElementById('points')?.textContent!=='—';
   },null,{timeout:90000});
   const start=await page.evaluate(()=>{
    const c=document.getElementById('bu-wt-native-game').contentWindow;
    return {main:economy.coins,child:+c.document.getElementById('points').textContent,
      url:c.location.href,overflow:c.document.documentElement.scrollWidth>c.innerWidth+2,
      childSandbox:c.BUPreviewStorageFence?.active,
      owned:c.BUPlatformRewards?.owned?.(),
      originalFromChild:c.BUPreviewStorageFence?.originalKeyValue('bible-unfolded-rewards-v17')};
   });
   assert.equal(start.child,start.main,'Word Trails must show real native TEST tokens');
   assert(start.url.includes('bu_shared_wallet_preview=1'),'frame must stay in protected preview mode');
   assert.equal(start.childSandbox,true,'child Rewards/Wheel API must run inside TEST storage fence');
   assert.equal(start.originalFromChild,ORIGINAL[LIVE],'child frame must not modify real LIVE wallet');
   assert(!start.owned?.includes('goldwheel'),'child may NOT import ownership from real LIVE');
   assert.equal(start.overflow,false,'Word Trails preview overflow');
   // Actual free hint then a real 15-token paid hint, through native click handlers.
   await page.evaluate(()=>{
    const c=document.getElementById('bu-wt-native-game').contentWindow;
    c.document.getElementById('hint').click();
   });
   await page.waitForFunction(()=>{
    const c=document.getElementById('bu-wt-native-game')?.contentWindow;
    return c?.document.getElementById('hint-cost')?.textContent==='15';
   },null,{timeout:12000});
   const beforePaid=await page.evaluate(()=>economy.coins);
   await page.evaluate(()=>{
    const c=document.getElementById('bu-wt-native-game').contentWindow;
    c.document.getElementById('hint').click();
   });
   await page.waitForFunction((before)=>{
    const c=document.getElementById('bu-wt-native-game')?.contentWindow;
    return economy.coins===before-15&&
     +c?.document.getElementById('points')?.textContent===before-15;
   },beforePaid,{timeout:16000});
   // A Word Trails Bible discovery must reward once, and appear in parent.
   const beforeSpark=await page.evaluate(()=>economy.coins);
   const word=await page.evaluate(()=>{
    const c=document.getElementById('bu-wt-native-game').contentWindow;
    const doc=c.document,rack=[...doc.querySelectorAll('.wheel-letter')];
    const needed='CAIN',used=new Set(),buttons=[];
    for(const char of needed){
     const choice=rack.find((node,index)=>!used.has(index)&&node.textContent.trim()===char);
     if(!choice)return {ok:false,letters:rack.map(b=>b.textContent.trim())};
     const idx=rack.indexOf(choice);used.add(idx);buttons.push(choice);
    }
    for(const b of buttons)b.click();
    doc.getElementById('submit').click();
    return {ok:true};
   });
   assert(word.ok,'Could not assemble CAIN from real wheel: '+JSON.stringify(word));
   await page.waitForFunction(before=>economy.coins>=before+1,beforeSpark,{timeout:15000});
   const afterSpark=await page.evaluate(()=>economy.coins);
   assert.equal(afterSpark-beforeSpark,1,'Bible discovery must earn exactly one shared token');
   // Solve the entire real first crossword with actual wheel button clicks.
   for(const answer of ['ANTIC','TACO','TONIC','COIN']){
    const selection=await page.evaluate(word=>{
     const c=document.getElementById('bu-wt-native-game').contentWindow;
     const buttons=[...c.document.querySelectorAll('.wheel-letter')];
     const used=new Set(),chosen=[];
     for(const char of word){
      const i=buttons.findIndex((b,j)=>!used.has(j)&&b.textContent.trim()===char);
      if(i<0)return {ok:false,word,letters:buttons.map(b=>b.textContent.trim())};
      used.add(i);chosen.push(buttons[i]);
     }
     chosen.forEach(button=>button.click());
     c.document.getElementById('submit').click();
     return {ok:true};
    },answer);
    assert(selection.ok,'Cannot form '+answer+' using real wheel');
    await page.waitForTimeout(80);
   }
   await page.waitForFunction(before=>{
    const child=document.getElementById('bu-wt-native-game')?.contentWindow;
    return economy.coins===before+4&&child?.document?.getElementById('finish')?.open;
   },afterSpark,{timeout:16000});
   const afterLevel=await page.evaluate(()=>economy.coins);
   assert.equal(afterLevel-afterSpark,4,'First crossword win should credit exactly four native tokens');
   // Spending from main game while Word Trails remains open must update its HUD.
   const spent=await page.evaluate(()=>{
    const before=economy.coins;
    const result=canSpend(5,true);
    return {result,before,after:economy.coins};
   });
   assert.equal(spent.result,true,'Actual main game token spend must succeed');
   assert.equal(spent.after,spent.before-5);
   await page.waitForFunction(expected=>{
    const c=document.getElementById('bu-wt-native-game')?.contentWindow;
    return +c?.document?.getElementById('points')?.textContent===expected;
   },spent.after,{timeout:16000});
   // Daily remains its original independent Discovery Stamps overlay.
   await page.evaluate(()=>window.BUWTNativeShell.openDaily());
   await page.waitForFunction(()=>!!document.getElementById('bu-wt-daily-frame')?.contentWindow?.document?.getElementById('daily-app'),null,{timeout:25000});
   assert.equal(await page.evaluate(()=>economy.coins),spent.after,'Daily entry must not mint shared coins');
   await page.evaluate(()=>window.BUWTNativeShell.closeDaily());
   await page.evaluate(()=>window.BUWTNativeShell.close());
   assert.equal(await page.evaluate(()=>economy.coins),spent.after,'native balance must survive mode exit');
   await page.reload({waitUntil:'domcontentloaded',timeout:140000});
   await page.waitForFunction(()=>window.BUTestInsightBridge?.nativeBalance?.().ok&&
    window.BUWTNativeShell?.nativeReady?.(),null,{timeout:120000});
   const final=await page.evaluate(()=>{
    const g=window.BUPreviewStorageFence;
    return {coins:economy.coins,primary:g.originalKeyValue('bible-unfolded-rewards-v17'),
     recovery:g.originalKeyValue('bible-unfolded-rewards-v17-recovery-v3811'),
     ownership:g.originalKeyValue('bible-unfolded-wheel-ownership-v3825'),
     crossword:g.originalKeyValue('bible-unfolded-word-trails-next-v1'),
     other:Object.fromEntries(['bu-james-return-loop-v1-test-only',
       'bu-native-boost-shop-v1-test-only','bu-wt-next-feel-v2',
       'bu-visual-lab-wordtrails-next-v1','other-app-unrelated-key']
       .map(k=>[k,g.originalKeyValue(k)]))};
   });
   assert.equal(final.coins,spent.after,'shared native balance must survive full page reload');
   assert.equal(final.primary,ORIGINAL[LIVE]);
   assert.equal(final.recovery,ORIGINAL[RECOVERY]);
   assert.equal(final.ownership,ORIGINAL[OWN]);
   assert.equal(final.crossword,ORIGINAL[CROSS]);
   for(const [key,value] of Object.entries(final.other))assert.equal(value,ORIGINAL[key],'Existing TEST save changed: '+key);
   const relevant=errors.filter(e=>/BUPreviewStorageFence|BUTestInsightBridge|shared-wallet/i.test(e));
   assert.deepEqual(relevant,[],'shared wallet browser errors');
   // Releasing the owning tab must let a different tab obtain the lock and
   // continue the same saved TEST wallet without resetting its balance.
   await page.close();
   const successor=await context.newPage();
   try{
    await successor.goto(BASE,{waitUntil:'domcontentloaded',timeout:140000});
    await successor.waitForFunction(()=>window.BUPreviewStorageFence?.writerStatus?.().writable===true &&
      window.BUTestInsightBridge?.nativeBalance?.().ok===true,
      null,{timeout:130000});
    assert.equal(await successor.evaluate(()=>economy.coins),spent.after,
     'successor tab must inherit protected shared balance after owner closes');
   }finally{await successor.close();}
   console.log('PASS',engine,width+'x'+height,
    'native + Word Trails earn/spend, blocked second tab, lock handoff, reload, LIVE isolation');
  }finally{await context.close();}
 }
}
(async()=>{
 const browsers=[
  ['chromium',()=>chromium.launch({headless:true,executablePath:chrome,
   args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'],
   timeout:120000})],
  ['webkit',()=>webkit.launch({headless:true,timeout:120000})]
 ];
 for(const [name,start] of browsers){
  const browser=await start();
  try{await run(name,browser);}finally{await browser.close();}
 }
 console.log('PASS all shared TEST native wallet phone browser checks');
})().catch(e=>{console.error(e);process.exitCode=1});

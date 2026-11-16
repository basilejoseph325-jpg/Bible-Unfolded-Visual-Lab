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
 [CROSS]:JSON.stringify({level:4,unlocked:4,completed:[0,1,2],coins:400,points:20})
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
    window.BUWTNativeShell?.nativeReady?.(),null,{timeout:130000});
   const initial=await page.evaluate(()=>{
    const guard=window.BUPreviewStorageFence;
    return {
     wallet:window.BUTestInsightBridge.nativeBalance(),
     main:economy.coins,
     original:guard.originalKeyValue('bible-unfolded-rewards-v17'),
     backup:guard.originalKeyValue('bible-unfolded-rewards-v17-recovery-v3811'),
     ownership:guard.originalKeyValue('bible-unfolded-wheel-ownership-v3825'),
     crossword:guard.originalKeyValue('bible-unfolded-word-trails-next-v1'),
     originalMarker:document.getElementById('bu-preview-wallet-banner')?.textContent,
     overflow:document.documentElement.scrollWidth>innerWidth+2
    };
   });
   assert(initial.wallet.ok,'native wallet should initialize in sandbox');
   assert.equal(initial.original,ORIGINAL[LIVE],'original LIVE wallet changed during native init');
   assert.equal(initial.backup,ORIGINAL[RECOVERY]);
   assert.equal(initial.ownership,ORIGINAL[OWN]);
   assert.equal(initial.crossword,ORIGINAL[CROSS]);
   assert(initial.originalMarker?.includes('ISOLATED COIN TEST'),'preview must be visibly labeled');
   assert.equal(initial.overflow,false,'root preview overflow '+width);
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
      url:c.location.href,overflow:c.document.documentElement.scrollWidth>c.innerWidth+2};
   });
   assert.equal(start.child,start.main,'Word Trails must show real native TEST tokens');
   assert(start.url.includes('bu_shared_wallet_preview=1'),'frame must stay in protected preview mode');
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
   await page.evaluate(()=>window.BUWTNativeShell.close());
   assert.equal(await page.evaluate(()=>economy.coins),afterSpark,'native balance must survive mode exit');
   await page.reload({waitUntil:'domcontentloaded',timeout:140000});
   await page.waitForFunction(()=>window.BUTestInsightBridge?.nativeBalance?.().ok&&
    window.BUWTNativeShell?.nativeReady?.(),null,{timeout:120000});
   const final=await page.evaluate(()=>{
    const g=window.BUPreviewStorageFence;
    return {coins:economy.coins,primary:g.originalKeyValue('bible-unfolded-rewards-v17'),
     recovery:g.originalKeyValue('bible-unfolded-rewards-v17-recovery-v3811'),
     ownership:g.originalKeyValue('bible-unfolded-wheel-ownership-v3825'),
     crossword:g.originalKeyValue('bible-unfolded-word-trails-next-v1')};
   });
   assert.equal(final.coins,afterSpark,'shared native balance must survive full page reload');
   assert.equal(final.primary,ORIGINAL[LIVE]);
   assert.equal(final.recovery,ORIGINAL[RECOVERY]);
   assert.equal(final.ownership,ORIGINAL[OWN]);
   assert.equal(final.crossword,ORIGINAL[CROSS]);
   const relevant=errors.filter(e=>/BUPreviewStorageFence|BUTestInsightBridge|shared-wallet/i.test(e));
   assert.deepEqual(relevant,[],'shared wallet browser errors');
   console.log('PASS',engine,width+'x'+height,
    'native award +25, paid hint -15, Bible discovery +1, reload, LIVE isolation');
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

#!/usr/bin/env node
/* Real local HTTP browser path, Chromium + WebKit phone emulation.
 * Only a private Playwright browser profile. No production website,
 * no live branch, and no end-user browser storage is touched.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),{chromium,webkit}=require('playwright');
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
 'bu-visual-lab-daily-word-trail-v1':'{"version":1,"days":{"2026-11-16":{"board":0,"solved":[],"hints":[],"completed":true}}}',
 'bu-visual-lab-wordtrails-next-v1':JSON.stringify({level:0,unlocked:0,
  coins:600,points:12,completed:[],sparks:[],claimedSparks:[],paidBonuses:[]}),
 'other-app-unrelated-key':'do-not-touch',
 'buGuideLast:0':'7',
 'buGuideFinished:0':'1'
};
async function run(engine,browser){
 for(const [width,height] of [[320,568],[430,932]]){
  const context=await browser.newContext({acceptDownloads:true,viewport:{width,height},isMobile:true,
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
       'bu-visual-lab-wordtrails-next-v1','bu-visual-lab-daily-word-trail-v1','other-app-unrelated-key']
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
   const james=await page.evaluate(()=>{
    if(!window.BUJamesReturnLoopV1?.testActions?.buy)throw Error('James Return Loop not loaded');
    const before=economy.coins;
    const shopBefore=window.BUJamesReturnLoopV1.inspect();
    const starter=awardOnce('qa-james-bible-books-'+innerWidth,5,200,true);
    const funds=economy.coins;
    const purchased=window.BUJamesReturnLoopV1.testActions.buy('books');
    const after=economy.coins;
    const denied=window.BUJamesReturnLoopV1.testActions.buy('mastery');
    const deniedBalance=economy.coins;
    window.BUJamesReturnLoopV1.testActions.correct();
    const pot=window.BUJamesReturnLoopV1.inspect().pot;
    const banked=window.BUJamesReturnLoopV1.testActions.bank();
    const final=economy.coins;
    return {before,shopBefore,starter,funds,purchased,after,denied,
      deniedBalance,pot,banked,final,shop:window.BUJamesReturnLoopV1.inspect(),
      legacy:window.BUPreviewStorageFence.originalKeyValue('bu-james-return-loop-v1-test-only')};
   });
   assert.equal(james.shopBefore.balance,james.before,'James shop must show real native balance');
   assert(james.starter&&james.purchased,'native wallet must fund a James Bible Books purchase');
   assert.equal(james.after,james.funds-180,'Books purchase must debit exactly 180 shared tokens');
   assert.equal(james.denied,false,'unaffordable purchase must be refused');
   assert.equal(james.deniedBalance,james.after);
   assert.equal(james.final,james.after+james.pot,'banking earned tokens must credit native ledger');
   assert.equal(james.shop.balance,james.final,'James store and main balance must agree');
   assert(james.shop.owned.includes('books'));
   assert.equal(james.legacy,ORIGINAL['bu-james-return-loop-v1-test-only'],
    'do not import or overwrite original separate James TEST ledger');
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
   // Crash-window rehearsal: native wallet payment succeeds but the child
   // progress write fails. The same hint cell must be redeemable after
   // reload without a second charge.
   await page.evaluate(()=>{
    const c=document.getElementById('bu-wt-native-game').contentWindow;
    const base=c.Storage.prototype.setItem;
    c.Storage.prototype.setItem=function(key,value){
     if(key==='bu-visual-lab-wordtrails-shared-preview-v1')
      throw Error('QA forced Word Trails progress failure');
     return base.call(this,key,value);
    };
    c.document.getElementById('hint').click();
    c.Storage.prototype.setItem=base;
   });
   await page.waitForFunction(before=>economy.coins===before-15,beforePaid,{timeout:16000});
   const failedProgress=await page.evaluate(()=>{
    const s=JSON.parse(localStorage.getItem('bu-visual-lab-wordtrails-shared-preview-v1'));
    return {hinted:s.progress?.hinted?.length,spent:economy.coins};
   });
   assert.equal(failedProgress.hinted,1,'failed child write must leave only its free hint saved');
   await page.reload({waitUntil:'domcontentloaded',timeout:140000});
   await page.waitForFunction(()=>window.BUPreviewStorageFence?.writerStatus?.().writable &&
    window.BUWTNativeShell?.nativeReady?.()&&window.BUTestInsightBridge?.nativeBalance?.().ok,
    null,{timeout:130000});
   assert.equal(await page.evaluate(()=>economy.coins),failedProgress.spent,
    'paid hint must survive reload despite unsaved letter');
   await page.evaluate(()=>window.BUWTNativeShell.launch());
   await page.waitForFunction(()=>{
    const c=document.getElementById('bu-wt-native-game')?.contentWindow;
    return window.BUWTNativeShell?.active?.()&&c?.document?.getElementById('hint-cost')?.textContent==='15'&&
     c.document.querySelectorAll('.wheel-letter').length>=5;
   },null,{timeout:90000});
   await page.evaluate(()=>{
    const c=document.getElementById('bu-wt-native-game').contentWindow;
    c.document.getElementById('hint').click();
   });
   const recovered=await page.evaluate(()=>{
    const s=JSON.parse(localStorage.getItem('bu-visual-lab-wordtrails-shared-preview-v1'));
    return {hinted:s.progress?.hinted?.length,coins:economy.coins,
     childPoints:document.getElementById('bu-wt-native-game').contentWindow.document.getElementById('points').textContent};
   });
   assert.equal(recovered.hinted,2,'the previously purchased hint must be restored');
   assert.equal(recovered.coins,beforePaid-15,'redeeming a paid hint after crash must NOT double charge');
   assert.equal(+recovered.childPoints,recovered.coins,'Word Trails must sync recovered wallet balance');
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
   const daily=await page.evaluate(()=>{
    const child=document.getElementById('bu-wt-daily-frame').contentWindow;
    return {guard:child.BUPreviewStorageFence?.active===true,
      local:child.localStorage.getItem('bu-visual-lab-daily-word-trail-v1'),
      original:window.BUPreviewStorageFence.originalKeyValue('bu-visual-lab-daily-word-trail-v1')};
   });
   assert.equal(daily.guard,true,'Daily Word Trails must use isolated TEST storage fence');
   assert.equal(daily.original,ORIGINAL['bu-visual-lab-daily-word-trail-v1'],
    'normal Daily Discovery Stamps must stay untouched');
   assert.notEqual(daily.local,daily.original,'Daily preview may not import normal stamps');
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
       'bu-visual-lab-wordtrails-next-v1','bu-visual-lab-daily-word-trail-v1','other-app-unrelated-key']
       .map(k=>[k,g.originalKeyValue(k)]))};
   });
   assert.equal(final.coins,spent.after,'shared native balance must survive full page reload');
   assert.equal(final.primary,ORIGINAL[LIVE]);
   assert.equal(final.recovery,ORIGINAL[RECOVERY]);
   assert.equal(final.ownership,ORIGINAL[OWN]);
   assert.equal(final.crossword,ORIGINAL[CROSS]);
   for(const [key,value] of Object.entries(final.other))assert.equal(value,ORIGINAL[key],'Existing TEST save changed: '+key);
   // Real Settings export must include BOTH progress streams and use its
   // distinctive non-importable preview format, never a misleading TEST v2.
   await page.evaluate(()=>window.openDialog('settings'));
   const downloadPromise=page.waitForEvent('download',{timeout:20000});
   await page.locator('#save-export').click();
   const download=await downloadPromise;
   assert.equal(download.suggestedFilename(),'Bible_Unfolded_SHARED_COINS_TEST_PREVIEW.json');
   const exported=JSON.parse(fs.readFileSync(await download.path(),'utf8'));
   assert.equal(exported.format,'BibleUnfoldedSharedCoinPreview');
   assert.equal(exported.restoreAllowed,false);
   assert(exported.keys['bible-unfolded-rewards-v17'],'must include native game wallet');
   assert(exported.keys['bu-visual-lab-wordtrails-shared-preview-v1'],'must include Word Trails save');
   assert.equal(exported.keys['bible-unfolded-word-trails-next-v1'],undefined,
    'never include original LIVE crossword');
   // Resume after last crossword answer was saved but before the 780ms
   // completion animation could run. It must auto-complete on reopen.
   await page.evaluate(()=>{
    const k='bu-visual-lab-wordtrails-shared-preview-v1';
    const previous=JSON.parse(localStorage.getItem(k));
    previous.level=1;
    previous.unlocked=Math.max(1,previous.unlocked);
    previous.completed=previous.completed.filter(n=>n!==1);
    previous.progress={level:1,found:['DINER','RIDE','DINE','DIRE'],bonuses:[],hinted:[],combo:4};
    localStorage.setItem(k,JSON.stringify(previous));
   });
   const beforeInterruptedFinish=await page.evaluate(()=>economy.coins);
   await page.reload({waitUntil:'domcontentloaded',timeout:140000});
   await page.waitForFunction(()=>window.BUPreviewStorageFence?.writerStatus?.().writable&&
     window.BUWTNativeShell?.nativeReady?.()&&window.BUTestInsightBridge?.nativeBalance?.().ok,
     null,{timeout:130000});
   await page.evaluate(()=>window.BUWTNativeShell.launch());
   await page.waitForFunction(before=>{
    const c=document.getElementById('bu-wt-native-game')?.contentWindow;
    return economy.coins===before+4&&c?.document?.getElementById('finish')?.open===true;
   },beforeInterruptedFinish,{timeout:30000});
   const afterInterruptedFinish=await page.evaluate(()=>{
    const s=JSON.parse(localStorage.getItem('bu-visual-lab-wordtrails-shared-preview-v1'));
    const wallet=JSON.parse(localStorage.getItem('bible-unfolded-rewards-v17'));
    return {balance:economy.coins,completed:s.completed,
      receipt:wallet.wtReceipts?.['trails:l2:complete']};
   });
   assert(afterInterruptedFinish.completed.includes(1));
   assert.equal(afterInterruptedFinish.receipt?.delta,4);
   // A second reopen must not award the same level again.
   await page.reload({waitUntil:'domcontentloaded',timeout:140000});
   await page.waitForFunction(()=>window.BUPreviewStorageFence?.writerStatus?.().writable&&
    window.BUWTNativeShell?.nativeReady?.(),null,{timeout:130000});
   await page.evaluate(()=>window.BUWTNativeShell.launch());
   await page.waitForTimeout(500);
   assert.equal(await page.evaluate(()=>economy.coins),afterInterruptedFinish.balance,
    'reopening an already awarded level may not duplicate its four tokens');
   // Reconcile a saved completion when its wallet credit was interrupted:
   // the game proof exists, but no corresponding native wallet receipt.
   await page.evaluate(()=>{
    const k='bu-visual-lab-wordtrails-shared-preview-v1';
    const progress=JSON.parse(localStorage.getItem(k));
    progress.completed.push(2);
    progress.unlocked=Math.max(progress.unlocked,2);
    localStorage.setItem(k,JSON.stringify(progress));
   });
   const priorReconcile=await page.evaluate(()=>economy.coins);
   await page.reload({waitUntil:'domcontentloaded',timeout:140000});
   await page.waitForFunction(()=>window.BUPreviewStorageFence?.writerStatus?.().writable&&
    window.BUWTNativeShell?.nativeReady?.(),null,{timeout:130000});
   await page.evaluate(()=>window.BUWTNativeShell.launch());
   await page.waitForFunction(before=>economy.coins===before+4,priorReconcile,{timeout:30000});
   const afterReconcile=await page.evaluate(()=>economy.coins);
   await page.reload({waitUntil:'domcontentloaded',timeout:140000});
   await page.waitForFunction(()=>window.BUPreviewStorageFence?.writerStatus?.().writable&&
    window.BUWTNativeShell?.nativeReady?.(),null,{timeout:130000});
   await page.evaluate(()=>window.BUWTNativeShell.launch());
   await page.waitForTimeout(450);
   assert.equal(await page.evaluate(()=>economy.coins),afterReconcile,
    'reconciled saved achievements must not pay twice on the next reload');
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
    assert.equal(await successor.evaluate(()=>economy.coins),afterReconcile,
     'successor tab must inherit protected shared balance after owner closes');
    assert.equal(await successor.evaluate(()=>window.BUJamesReturnLoopV1?.inspect?.().owned.includes('books')),true,
     'Book entitlement must persist in same native TEST wallet after reload');
    await successor.evaluate(()=>document.getElementById('home-books').click());
    await successor.waitForURL(u=>u.pathname.endsWith('/bible-book-guides/index.html')&&u.searchParams.get('bu_shared_wallet_preview')==='1',
     {timeout:25000});
    await successor.waitForFunction(()=>window.BUPreviewStorageFence?.writerStatus?.().writable===true,
     null,{timeout:25000});
    const shelf=await successor.evaluate(()=>({
     protected:window.BUPreviewStorageFence?.active,
     oldLast:window.BUPreviewStorageFence?.originalKeyValue('buGuideLast:0'),
     oldFinish:window.BUPreviewStorageFence?.originalKeyValue('buGuideFinished:0'),
     previewLast:localStorage.getItem('buGuideLast:0'),
     firstLink:document.querySelector('a.book-card[href*="genesis"]')?.href
    }));
    assert.equal(shelf.protected,true,'Bible Books shelf must keep preview storage fence');
    assert.equal(shelf.oldLast,ORIGINAL['buGuideLast:0'],'Books shelf must preserve original reading progress');
    assert.equal(shelf.oldFinish,ORIGINAL['buGuideFinished:0']);
    assert.equal(shelf.previewLast,null,'preview must not import regular Books reading position');
    assert(shelf.firstLink,'Genesis book link must exist');
    await successor.locator('a.book-card[href*="genesis"]').first().click();
    await successor.waitForURL(u=>u.pathname.endsWith('/bible-book-guides/read.html')&&
      u.searchParams.get('bu_shared_wallet_preview')==='1'&&u.searchParams.get('book')==='genesis',
      {timeout:30000});
    await successor.waitForFunction(()=>window.BUPreviewStorageFence?.writerStatus?.().writable===true &&
      document.getElementById('next-part')?.hidden===false,null,{timeout:40000});
    const initialBooks=await successor.evaluate(()=>({
     sandbox:window.BUPreviewStorageFence?.active,
     readProgress:localStorage.getItem('buGuideLast:0'),
     oldProgress:window.BUPreviewStorageFence?.originalKeyValue('buGuideLast:0'),
     oldFinish:window.BUPreviewStorageFence?.originalKeyValue('buGuideFinished:0')
    }));
    assert.equal(initialBooks.sandbox,true,'Books reader must remain in TEST preview');
    assert(initialBooks.readProgress===null||initialBooks.readProgress==='0','Books preview must start without importing existing chapter position');
    assert.equal(initialBooks.oldProgress,'7');
    assert.equal(initialBooks.oldFinish,'1');
    await successor.locator('#next-part').click();
    await successor.waitForFunction(()=>localStorage.getItem('buGuideLast:0')==='1',
     null,{timeout:12000});
    const newBooks=await successor.evaluate(()=>({
     scoped:localStorage.getItem('buGuideLast:0'),
     original:window.BUPreviewStorageFence?.originalKeyValue('buGuideLast:0')
    }));
    assert.equal(newBooks.scoped,'1');
    assert.equal(newBooks.original,'7','preview reading progress must not overwrite original Books state');
    await successor.locator('a.back-link').click();
    await successor.waitForURL(u=>u.pathname.endsWith('/bible-book-guides/index.html')&&
      u.searchParams.get('bu_shared_wallet_preview')==='1',{timeout:30000});
    await successor.locator('a.back-link').click();
    await successor.waitForURL(u=>u.pathname.endsWith('/index.html')&&
      u.searchParams.get('bu_shared_wallet_preview')==='1',{timeout:30000});
    await successor.waitForFunction(()=>window.BUPreviewStorageFence?.writerStatus?.().writable===true&&
      window.BUTestInsightBridge?.nativeBalance?.().ok===true,null,{timeout:35000});
    assert.equal(await successor.evaluate(()=>economy.coins),afterReconcile,
     'Books round trip must preserve same shared coin wallet');
    assert.equal(await successor.evaluate(()=>window.BUPreviewStorageFence.originalKeyValue('buGuideLast:0')),'7',
     'original Bible Books reading progress must survive full round trip');
   }finally{await successor.close();}
   console.log('PASS',engine,width+'x'+height,
    'earn/spend, James+Word Trails, hint/win recovery, two-tab lock, isolated backup, Books guarded round trip, LIVE isolation');
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

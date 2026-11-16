#!/usr/bin/env node
'use strict';
/*
 * Native Story Adventure -> Bible Trivia -> Word Trails exact-price checks.
 * Runs the actual compiled Visual Lab game with the isolated shared-wallet
 * preview flag. No production site or actual user data is accessed.
 */
const assert=require('node:assert/strict');
const {chromium,webkit}=require('playwright');
const {execSync}=require('node:child_process');
const chrome=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const URL='http://127.0.0.1:8894/index.html?bu_shared_wallet_preview=1';
const ORIGINAL={
 'bible-unfolded-rewards-v17':JSON.stringify({coins:891,points:1327,earned:['original'],purchases:[],hints:{}}),
 'bible-unfolded-rewards-v17-recovery-v3811':JSON.stringify({coins:891,points:1327,earned:['original'],purchases:[],hints:{}}),
 'bu-visual-lab-wordtrails-next-v1':JSON.stringify({level:3,unlocked:3,coins:900,points:111,completed:[0,1,2]}),
 'buGuideLast:0':'17'
};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function test(browserName,browser,width,height){
 const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,deviceScaleFactor:2});
 try{
  await context.addInitScript(values=>{for(const [key,value] of Object.entries(values))localStorage.setItem(key,value);},ORIGINAL);
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e.message||e)));
  await page.goto(URL,{waitUntil:'domcontentloaded',timeout:140000});
  await page.waitForFunction(()=>window.BUPreviewStorageFence?.writerStatus?.().writable&&
   typeof bu3857Open==='function'&&typeof bu34Start==='function'&&
   window.BUWTNativeShell?.nativeReady?.()&&
   window.BUTestInsightBridge?.nativeBalance?.().ok===true,
   null,{timeout:110000});
  // Truly play a Story word: use the native wheel's letter buttons.
  const story=await page.evaluate(()=>{
   focusHome();bu3857Open('genesis_ep11',true);
   const d=bu3857Current(),answer=BU_HQ_WORDS[d.id]?.answer;
   if(!answer)throw Error('A real Story Adventure question is required');
   const rack=[...document.querySelectorAll('#buhq-wheel button[data-buhq]')],used=new Set();
   for(const letter of answer){
    const tile=rack.find(el=>el.textContent.trim()===letter&&!used.has(el));
    if(!tile)throw Error('Cannot find required Story letter '+letter);
    used.add(tile);tile.click();
   }
   return {id:d.id,answer,number:rack.length};
  });
  await page.waitForFunction(id=>bu3857State.solved[id]===true,story.id,{timeout:17000});
  const postStory=await page.evaluate(()=>{
   const saved=JSON.parse(localStorage.getItem('bible-unfolded-rewards-v17'));
   return {coins:economy.coins,points:economy.points,savedCoins:saved.coins,
    savedPoints:saved.points,storySolved:bu3857State.solved[bu3857Current().id]===true};
  });
  assert(postStory.storySolved,'native Story must genuinely mark the discovery solved');
  assert.equal(postStory.coins,postStory.savedCoins,'Story rewards wallet must persist');
  assert.equal(postStory.points,postStory.savedPoints,'Story achievement points must persist');
  // Play a real Bible Trivia question via its actual renderer and answer tablet.
  const trivia=await page.evaluate(()=>{
   document.querySelector('.bu3863-dialog-done')?.click();
   focusHome();document.getElementById('home-trivia')?.click();
   bu34Start('quick');
   const q=bu34Quiz.items[bu34Quiz.step];
   if(!q)throw Error('Actual Bible Trivia question not loaded');
   const button=document.querySelector('#bu34-body [data-answer="'+q.correct+'"]');
   if(!button)throw Error('Trivia answer tablet missing');
   const original=economy.coins;
   button.click();
   return {question:q.q,chosen:q.correct,original,answered:bu34Quiz.answered,
    score:bu34Quiz.score,coins:economy.coins,
    savedCoins:JSON.parse(localStorage.getItem('bible-unfolded-rewards-v17')).coins,
    answeredPanel:document.querySelector('#bu34-body')?.textContent.includes(q.q)};
  });
  assert(trivia.answered&&trivia.score>=1,'native Bible Trivia must score a real answer');
  assert.equal(trivia.savedCoins,trivia.coins,'native Trivia reward wallet must persist');
  assert(trivia.coins>=0,'native Trivia coin balance must be valid');
  // Now prepare exactly 14 native tokens, and an already-used first free hint.
  // No standalone Trail Coins are imported as a replacement balance.
  await page.evaluate(()=>{
   focusHome();
   economy.coins=14;
   if(saveEconomy()!==true)throw Error('Unable to seed guarded QA wallet');
   const key='bu-visual-lab-wordtrails-shared-preview-v1';
   const o=JSON.parse(localStorage.getItem(key)||'null')||{
    level:2,unlocked:2,completed:[],sparks:[],boardBible:[],claimedSparks:[],
    paidBonuses:[],paidWords:[],claimedFreeHints:[],coins:60,points:0
   };
   o.level=2;o.unlocked=Math.max(2,o.unlocked||0);
   o.completed=Array.isArray(o.completed)?o.completed:[];
   o.claimedFreeHints=[...new Set([...(o.claimedFreeHints||[]),2])];
   o.progress={level:2,found:[],bonuses:[],hinted:[],combo:0};
   localStorage.setItem(key,JSON.stringify(o));
   window.BUWTNativeShell.launch();
  });
  await page.waitForFunction(()=>{
   const frame=document.getElementById('bu-wt-native-game')?.contentWindow;
   return window.BUWTNativeShell?.active?.()&&frame?.document?.getElementById('hint')&&
    frame.document.getElementById('points')?.textContent==='14'&&
    frame.document.getElementById('hint-cost')?.textContent==='15';
  },null,{timeout:35000});
  const low=await page.evaluate(()=>{
   const f=document.getElementById('bu-wt-native-game').contentWindow;
   const button=f.document.getElementById('hint');
   const before=economy.coins;button.click();
   return {disabled:button.disabled,after:economy.coins,before,child:f.document.getElementById('points').textContent,
    nativeWallet:JSON.parse(localStorage.getItem('bible-unfolded-rewards-v17')).coins};
  });
  assert(low.disabled,'14-token paid hint must remain disabled');
  assert.equal(low.after,14,'disabled paid hint cannot charge coins');
  assert.equal(low.nativeWallet,14,'disabled paid hint cannot change native wallet');
  const topup=await page.evaluate(()=>{
   const ok=awardOnce('qa-exact-hint-topup-'+innerWidth,5,1,true);
   return {ok,balance:economy.coins};
  });
  assert(topup.ok,'real native award function must top up one token');
  assert.equal(topup.balance,15);
  await page.waitForFunction(()=>{
   const f=document.getElementById('bu-wt-native-game')?.contentWindow;
   return !!f&&f.document.getElementById('points')?.textContent==='15'&&
    f.document.getElementById('hint').disabled===false;
  },null,{timeout:12000});
  await page.evaluate(()=>{
   const f=document.getElementById('bu-wt-native-game').contentWindow;
   f.document.getElementById('hint').click();
  });
  await page.waitForFunction(()=>economy.coins===0,null,{timeout:15000});
  const paid=await page.evaluate(()=>{
   const f=document.getElementById('bu-wt-native-game').contentWindow;
   const progress=JSON.parse(localStorage.getItem('bu-visual-lab-wordtrails-shared-preview-v1'));
   return {coins:economy.coins,points:f.document.getElementById('points').textContent,
    hinted:progress.progress?.hinted||[],nativeWallet:JSON.parse(localStorage.getItem('bible-unfolded-rewards-v17')).coins};
  });
  assert.equal(paid.coins,0,'15-token hint must deduct exactly 15 tokens');
  assert.equal(paid.points,'0','Word Trails HUD must display the resulting zero balance');
  assert.equal(paid.nativeWallet,0,'native wallet must reflect the paid hint');
  assert.equal(paid.hinted.length,1,'one purchased letter must be revealed');
  await page.evaluate(()=>window.BUWTNativeShell.close());
  const noLeak=await page.evaluate(()=>{
   const fence=window.BUPreviewStorageFence;
   return Object.fromEntries(Object.keys(fence).filter(()=>false).map(()=>[]).concat(
    Object.keys(fence.status()).length>=0?Object.keys({
     'bible-unfolded-rewards-v17':1,
     'bible-unfolded-rewards-v17-recovery-v3811':1,
     'bu-visual-lab-wordtrails-next-v1':1,
     'buGuideLast:0':1
    }).map(k=>[k,fence.originalKeyValue(k)]):[]));
  });
  for(const [key,value] of Object.entries(ORIGINAL))assert.equal(noLeak[key],value,'Native modes leaked into original game data: '+key);
  const significant=errors.filter(e=>/shared-wallet|insight-native-bridge|StorageFence|BUTestInsightBridge/i.test(e));
  assert.deepEqual(significant,[],significant.join('\n'));
  console.log('PASS_NATIVE_STORY_TRIVIA_SHARED_WALLET',browserName,width+'x'+height,
   'real Story word, real Trivia answer, exact 14/15 hint boundary, main/Trail balance match, LIVE isolation');
 }finally{await context.close();}
}
(async()=>{
 const browsers=[
  ['chromium',()=>chromium.launch({headless:true,executablePath:chrome,
   args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']})],
  ['webkit',()=>webkit.launch({headless:true})]
 ];
 for(const [engine,start] of browsers){
  const browser=await start();
  try{for(const [w,h] of [[320,568],[430,932]])await test(engine,browser,w,h);}
  finally{await browser.close();}
 }
 console.log('PASS all real native Story/Trivia/low-balance shared wallet checks');
})().catch(error=>{console.error(error);process.exitCode=1});

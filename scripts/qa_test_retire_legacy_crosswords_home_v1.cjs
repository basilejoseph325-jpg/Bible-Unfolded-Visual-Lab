#!/usr/bin/env node
'use strict';
const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const {execSync}=require('node:child_process');
const chrome=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const BASE='http://127.0.0.1:8896/index.html';
async function audit(engine,browser,width,height){
 const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,deviceScaleFactor:2});
 try{
  const page=await context.newPage();page.setDefaultTimeout(90000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:130000});
  await page.waitForFunction(()=>window.BUWTNativeShell?.nativeReady?.()&&
   document.getElementById('home-cross')&&document.getElementById('wt-next-entry'),
   null,{timeout:110000});
  const home=await page.evaluate(()=>{
   const cards=[...document.querySelectorAll('#home button[id^="home-"]')].map(e=>({
    id:e.id,title:e.querySelector('.cinematic-card-title')?.textContent?.trim(),label:e.getAttribute('aria-label')
   }));
   return {cards,
    legacyCard:!!document.getElementById('home-crossword-packs'),
    compareButton:!!document.getElementById('wt-next-compare'),
    legacySelect:!!document.querySelector('#cross-pick.wt-next-compare'),
    nativeWallet:typeof economy==='undefined'?null:economy.coins,
    oldCrossMenu:document.getElementById('menu-crossword')?.outerHTML?.slice(0,500)||null,
    navButtons:[...document.querySelectorAll('#game-menu [data-nav]')].map(e=>({nav:e.dataset.nav,text:e.textContent.trim().slice(0,75)}))
   };
  });
  console.log('WORD_TRAILS_HOME_AUDIT',engine,width+'x'+height,JSON.stringify(home));
  assert(home.cards.some(c=>c.id==='home-cross'),'New wheel game card must exist');
  assert(!home.legacyCard,'Retired Bible Crosswords home card must not exist');
  assert(!home.compareButton,'Previous Word Trails comparison toggle must be gone');
  assert(!home.legacySelect,'Old comparison should not be selected');
  await page.evaluate(()=>document.getElementById('home-cross').click());
  await page.waitForFunction(()=>window.BUWTNativeShell?.active?.()&&
   document.querySelector('#bu-wt-native-game')?.contentWindow?.document?.getElementById('wheel')&&
   document.querySelector('#bu-wt-native-game')?.contentWindow?.document?.getElementById('level-label')?.textContent.includes('/ 50'),
   null,{timeout:60000});
  const play=await page.evaluate(()=>{
   const child=document.querySelector('#bu-wt-native-game').contentWindow.document;
   return {name:child.querySelector('h1')?.textContent,level:child.getElementById('level-label')?.textContent,
    coins:child.getElementById('coin-label')?.textContent,
    hasWheel:!!child.getElementById('wheel'),hasOldCrossPick:!document.getElementById('cross-pick')?.hidden,
    duplicateHome:!!document.getElementById('home-crossword-packs')};
  });
  assert(play.hasWheel,'Main home entry must launch NEW wheel game');
  assert(play.level.includes('/ 50'),'Wheel game must have 50 levels');
  assert(!play.duplicateHome,'Legacy card may not return after playing');
  assert.equal(play.coins,'COINS','Non-preview regular TEST still marks legacy coins explicitly');
  await page.evaluate(()=>BUWTNativeShell.close());
  await page.waitForFunction(()=>window.BUWTNativeShell.active()===false,null,{timeout:15000});
  const after=await page.evaluate(()=>({oldCard:!!document.getElementById('home-crossword-packs'),
    compare:!!document.getElementById('wt-next-compare')}));
  assert(!after.oldCard&&!after.compare);
  assert.equal(errors.filter(e=>/word trails|crossword|native shell/i.test(e)).length,0);
  console.log('PASS_WORD_TRAILS_SINGLE_HOME',engine,width+'x'+height,
   'old Bible Crosswords card removed; new Word Trails wheel remains; 50 levels; saves preserved');
 }finally{await context.close();}
}
(async()=>{
 for(const [engine,launch] of [
  ['chromium',()=>chromium.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']})],
  ['webkit',()=>webkit.launch({headless:true})]
 ]){
  const browser=await launch();
  try{for(const [w,h] of [[320,568],[430,932]])await audit(engine,browser,w,h);}
  finally{await browser.close();}
 }
 console.log('PASS full Word Trails duplicate home card retirement suite');
})().catch(e=>{console.error('FAIL_WORD_TRAILS_SINGLE_HOME',e.stack||e);process.exitCode=1;});

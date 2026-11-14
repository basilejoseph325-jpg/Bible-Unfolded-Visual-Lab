#!/usr/bin/env node
'use strict';
/* TEST-only genuine WebKit root game smoke: native Settings, Word Trails
 * launch -> native Settings -> back -> reopen -> refresh returns Home.
 * Fresh browser contexts; never opens production LIVE site or player profile.
 * Not real iPhone or physical Samsung acceptance.
 */
const {webkit}=require('playwright');
const assert=require('node:assert/strict');
const ROOT='http://127.0.0.1:8896/index.html';
const LIVE='bible-unfolded-word-trails-next-v1';
const TEST='bu-visual-lab-wordtrails-next-v1';
const WALLET='bible-unfolded-rewards-v17';
const OWNED='bible-unfolded-wheel-ownership-v3825-backup';
const VOICE='bible-unfolded-private-voice-pref-v381';
const SENTINEL='bu-webkit-v9-protected-home-sentinel';
const savedLive=JSON.stringify({
 level:8,unlocked:9,coins:41,points:100,completed:[0,1,2,3],
 sparks:[],claimedSparks:[],boardBible:[],paidWords:[],
 paidBonuses:[],claimedFreeHints:[],sound:true,
 progress:{level:8,found:['ELI'],bonuses:[],hinted:[],combo:1}
});
const seed={[LIVE]:savedLive,[SENTINEL]:'dont-change'};
const preserved=[LIVE,SENTINEL];
const snapshots=async page=>page.evaluate(keys=>Object.fromEntries(
 keys.map(k=>[k,localStorage.getItem(k)])),[...preserved,WALLET,OWNED,VOICE]);
(async()=>{
 const browser=await webkit.launch({headless:true,timeout:90000});
 try{
  for(const [width,height] of [[390,705],[320,568]]){
   const context=await browser.newContext({viewport:{width,height},isMobile:true,
    hasTouch:true,deviceScaleFactor:2});
   try{
    await context.addInitScript(records=>{
     for(const [key,value] of Object.entries(records))localStorage.setItem(key,value);
    },seed);
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(ROOT,{waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForFunction(()=>window.BUWTNativeShell?.nativeReady?.()&&
     window.BUPlatformSaves?.bound?.()&&
     !!document.getElementById('bu-wt-checkpoint-practice-native-link'),null,{timeout:110000});
    const first=await snapshots(page);
    for(const k of preserved)assert.equal(first[k],seed[k]);
    const ui=await page.evaluate(()=>({
     nativeShellReady:!!window.BUWTNativeShell?.nativeReady?.(),
     hasHomeCard:!!document.getElementById('home-cross'),
     hasNativeSave:!!document.getElementById('save-export'),
     hasNativeImport:!!document.getElementById('save-file'),
     practiceLinks:document.querySelectorAll('#bu-wt-checkpoint-practice-native-link').length,
     noRootOverflow:document.documentElement.scrollWidth<=innerWidth+1
    }));
    assert(ui.nativeShellReady&&ui.hasHomeCard&&ui.hasNativeSave&&ui.hasNativeImport);
    assert.equal(ui.practiceLinks,1);
    assert(ui.noRootOverflow,'Root page overflows narrow WebKit viewport');
    await page.evaluate(()=>window.openDialog('settings'));
    await page.waitForFunction(()=>!document.querySelector('#settings-dialog').hidden);
    const native=await page.evaluate(()=>{
     const practice=document.querySelector('#bu-wt-checkpoint-practice-native-link');
     const region=document.querySelector('#save-export')?.closest('.save-transfer');
     return {practiceInNative:!!(region&&practice&&region.contains(practice)),
      target:practice?.getAttribute('target'),rel:practice?.getAttribute('rel'),
      separatePractice:practice?.href.includes('word-trails-checkpoint-rehearsal-v2.html'),
      realExportPreserved:!!document.querySelector('#save-export')};
    });
    assert(native.practiceInNative&&native.separatePractice&&native.realExportPreserved);
    assert.equal(native.target,'_blank');
    assert(native.rel.includes('noopener')&&native.rel.includes('noreferrer'));
    await page.evaluate(()=>window.closeDialog());
    // Actual native home card -> actual 30-level Word Trails iframe.
    await page.evaluate(()=>document.getElementById('home-cross').click());
    await page.waitForFunction(()=>window.BUWTNativeShell?.active?.()&&
      !!document.getElementById('bu-wt-native-game')?.contentWindow?.BUWTPolish,
      null,{timeout:100000});
    const entered=await page.evaluate(()=>{
      const frame=document.querySelector('#bu-wt-native-game');
      const child=frame?.contentWindow;
      return {active:window.BUWTNativeShell.active(),framePresent:!!frame,
       frameTitle:frame?.title,childReady:!!child?.BUWTPolish,
       wheelExists:!!child?.document.getElementById('wheel'),
       boardExists:!!child?.document.getElementById('board'),
       mapExists:!!child?.document.getElementById('level-map'),
       noFrameOverflow:!!child&&child.document.documentElement.scrollWidth<=child.innerWidth+1,
       hasNativeSettings:!!window.openDialog,
       hasLevel:!!child?.document.querySelector('#level-label')?.textContent
      };
    });
    assert(entered.active&&entered.framePresent&&entered.childReady&&
     entered.wheelExists&&entered.boardExists&&entered.mapExists&&entered.hasLevel);
    assert(entered.noFrameOverflow,'Word Trails frame overflows narrow WebKit viewport');
    await page.evaluate(()=>document.querySelector('#bu-wt-native-game').contentWindow
      .BUWTPolish.openSettings());
    await page.waitForFunction(()=>!document.querySelector('#settings-dialog').hidden);
    const inGameSettings=await page.evaluate(()=>({
      nativeOpen:!document.querySelector('#settings-dialog').hidden,
      onlyOnePractice:document.querySelectorAll('#bu-wt-checkpoint-practice-native-link').length,
      gameLocalDialogOpen:!!document.querySelector('#bu-wt-native-game')
       ?.contentWindow?.document.getElementById('wt-feel-settings')?.open
    }));
    assert(inGameSettings.nativeOpen);
    assert.equal(inGameSettings.onlyOnePractice,1);
    assert.equal(inGameSettings.gameLocalDialogOpen,false,
     'Word Trails must NOT open second Settings dialog inside frame');
    await page.evaluate(()=>window.closeDialog());
    // Exit then enter again: old one-shot launch guard must reset.
    await page.evaluate(()=>window.BUWTNativeShell.close());
    await page.waitForFunction(()=>!window.BUWTNativeShell.active());
    await page.waitForTimeout(390);
    await page.evaluate(()=>document.getElementById('home-cross').click());
    await page.waitForFunction(()=>window.BUWTNativeShell.active()&&
      !!document.querySelector('#bu-wt-native-game')?.contentWindow?.BUWTPolish,
      null,{timeout:100000});
    assert.equal(await page.evaluate(()=>location.hash),'#word-trails');
    // Historical physical owner bug: refreshing Word Trails should return Home,
    // not relaunch the iframe or erase the saved crossword.
    await page.reload({waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForFunction(()=>window.BUWTNativeShell?.nativeReady?.()&&
      !!document.getElementById('home-cross')&&!window.BUWTNativeShell.active(),
      null,{timeout:110000});
    const refresh=await page.evaluate(()=>({
     gameActive:window.BUWTNativeShell.active(),hash:location.hash,
     homeCard:!!document.querySelector('#home-cross'),
     noExtraIframe:!document.querySelector('#bu-wt-native-game')
    }));
    assert(!refresh.gameActive&&refresh.noExtraIframe&&refresh.homeCard);
    assert.notEqual(refresh.hash,'#word-trails','Refresh should return Home');
    // Page loading may legitimately initialize native wallet and TEST progress.
    // Check only the previously existing protected LIVE crossword + sentinel.
    const final=await snapshots(page);
    for(const k of preserved)
      assert.equal(final[k],seed[k],'WebKit TEST gameplay changed protected '+k);
    assert.deepEqual(errors,[],'WebKit native game page exceptions');
    console.log('PASS_WEBKIT_WORD_TRAILS_ACTUAL_NATIVE_GAME',JSON.stringify({
     viewport:width+'x'+height,mainHomeLoaded:true,
     nativeExportAndSettingsIntact:true,oneSafePracticeLink:true,
     actualWordTrailsIframeOpened:true,connectedWheelAndBoard:true,
     nativeSettingsShared:true,secondEntryWorked:true,
     refreshReturnedHome:true,liveCrosswordPreserved:true,
     physicalSafariTest:false,zeroJSExceptions:true
    }));
   }finally{await context.close();}
  }
 }finally{await browser.close();}
})().catch(e=>{console.error('FAIL_WEBKIT_WORD_TRAILS_ACTUAL_GAME',e.stack||e);process.exitCode=1});

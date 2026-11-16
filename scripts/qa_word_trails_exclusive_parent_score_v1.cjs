#!/usr/bin/env node
'use strict';
/* Regression: real native parent music must NEVER overlap an active Word Trails iframe.
   Uses a disposable headless browser and local Visual Lab server; no LIVE or real saves. */
const puppeteer=require('puppeteer-core'),assert=require('node:assert/strict');
const {execSync}=require('node:child_process');
const chrome=(process.env.CHROME_BIN||execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'})).trim();
const site=process.env.WT_TEST_URL||'http://127.0.0.1:8899/index.html';
const IDS=['music-navigation','music-story','music-trails','music','music-daily','music-builder','music-name'];
(async()=>{
 const browser=await puppeteer.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required'],timeout:100000,protocolTimeout:120000});
 try{
  for(const viewport of [{width:320,height:568},{width:390,height:844},{width:430,height:932}]){
   const context=await browser.createBrowserContext(),page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.setViewport({...viewport,deviceScaleFactor:2,isMobile:true,hasTouch:true});
   await page.goto(site,{waitUntil:'domcontentloaded',timeout:120000});
   await page.waitForFunction(()=>window.BUWTNativeShell?.nativeReady?.()&&window.__bu25Ready,{timeout:90000});
   const initial=await page.evaluate(ids=>{
    document.getElementById('music-story').muted=true;
    return ids.map(id=>{const el=document.getElementById(id);if(!el)throw Error('Missing main soundtrack '+id);return {id,muted:el.muted}});
   },IDS);
   // Real homepage launch; isolated TEST Word Trails uses its approved track.
   await page.$eval('#home-cross',x=>x.click());
   await page.waitForFunction(()=>window.BUWTNativeShell?.active?.()&&!!document.getElementById('bu-wt-native-game')?.contentWindow?.BUWTPolish,{timeout:90000});
   async function check(where){
    const state=await page.evaluate(ids=>({
     active:window.BUWTNativeShell.active(),
     music:ids.map(id=>{const e=document.getElementById(id);return {id,muted:e?.muted,paused:e?.paused,volume:e?.volume}}),
     menu:!document.getElementById('game-menu').hidden,
     settings:!document.getElementById('settings-dialog').hidden,
     childAlive:!!document.getElementById('bu-wt-native-game')?.contentWindow?.BUWTPolish
    }),IDS);
    assert(state.active&&state.childAlive,'Word Trails was lost at '+where);
    assert(state.music.every(m=>m.muted===true),'Second main-game song can bleed into Word Trails at '+where+': '+JSON.stringify(state));
    return state;
   }
   await check('launch');
   // Reproduce phone report: menu, Settings, changing audio controls, return, keep playing.
   await page.evaluate(()=>document.getElementById('bu-wt-native-game').contentWindow.BUWTUnifiedMenu.open());
   await check('menu open');
   await page.$eval('#game-menu [data-nav="settings"]',x=>x.click());
   await check('Settings open');
   await page.evaluate(()=>{
    const input=document.getElementById('setting-volume'),original=input.value;
    input.value='45';input.dispatchEvent(new Event('input',{bubbles:true}));
    input.value=original;input.dispatchEvent(new Event('input',{bubbles:true}));
    const music=document.getElementById('setting-music'),was=music.checked;
    music.checked=false;music.dispatchEvent(new Event('change',{bubbles:true}));
    music.checked=was;music.dispatchEvent(new Event('change',{bubbles:true}));
    // Deliberately trigger the *new* HTMLAudioElement soundtrack reconciler,
    // not the outdated pauseAudio WebAudio function.
    window.syncMusic();
   });
   await new Promise(resolve=>setTimeout(resolve,450));
   await check('Settings toggled and root music restarted');
   await page.evaluate(()=>{window.closeDialog();window.syncMusic()});
   await new Promise(resolve=>setTimeout(resolve,180));
   await check('returned to Word Trails');
   await page.evaluate(()=>{
    const child=document.getElementById('bu-wt-native-game').contentWindow;
    child.document.querySelector('.wheel-letter')?.click();
    window.syncMusic();
   });
   await new Promise(resolve=>setTimeout(resolve,180));
   await check('wheel play after Settings');
   await page.evaluate(()=>window.BUWTNativeShell.close());
   const restored=await page.evaluate(ids=>({active:window.BUWTNativeShell.active(),music:ids.map(id=>({id,muted:document.getElementById(id).muted})),hasFrame:!!document.getElementById('bu-wt-native-game')}),IDS);
   assert.equal(restored.active,false);
   assert.equal(restored.hasFrame,false);
   assert.deepEqual(restored.music.map(m=>m.muted),initial.map(m=>m.muted),'Native sound ownership did not restore previous mute flags');
   // A second launch must start a clean mute lease.
   await page.evaluate(()=>window.BUWTNativeShell.launch());
   await page.waitForFunction(()=>!!document.getElementById('bu-wt-native-game')?.contentWindow?.BUWTPolish);
   await check('second launch');
   await page.evaluate(()=>window.BUWTNativeShell.close());
   assert.deepEqual(errors,[],'No page errors: '+JSON.stringify(errors.slice(0,5)));
   console.log('PASS_WORD_TRAILS_EXCLUSIVE_PARENT_SCORE',JSON.stringify({viewport:viewport.width+'x'+viewport.height,settingsRoundTrip:true,noMainMusicBleed:true,rootMuteRestored:true,nativeWheelActive:true,secondLaunch:true,errors:errors.length}));
   await context.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error('FAIL_WORD_TRAILS_EXCLUSIVE_PARENT_SCORE',e.stack||e);process.exitCode=1});

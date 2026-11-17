#!/usr/bin/env node
'use strict';
/* Disposable local browser regression: new Family Worship entry, session-only
 * relay gameplay, native Back, and no shared game-state or audio contamination. */
const p=require('puppeteer-core'),assert=require('node:assert/strict');
const cp=require('node:child_process');
const chrome=(process.env.CHROME_BIN||cp.execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'})).trim();
const site=process.env.BU_RELAY_URL||'http://127.0.0.1:8896/index.html';
const ids=['music-navigation','music-story','music-trails','music','music-daily','music-builder','music-name'];
(async()=>{
 const browser=await p.launch({executablePath:chrome,headless:true,args:['--no-sandbox','--disable-dev-shm-usage'],protocolTimeout:120000});
 try{
  for(const [width,height] of [[320,568],[430,932]]){
   const ctx=await browser.createBrowserContext(),page=await ctx.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.setViewport({width,height,isMobile:true,hasTouch:true});
   await page.goto(site,{waitUntil:'domcontentloaded',timeout:120000});
   await page.waitForFunction(()=>window.BUFamilyClueRelayMenuV1&&window.BUPlatformRewards?.hasNativeHost?.(),{timeout:90000});
   await page.evaluate(()=>{focusHome();document.getElementById('home-family').click()});
   try{
    await page.waitForFunction(()=>!!document.getElementById('bu-fw-clue-relay-launch'),{timeout:15000});
   }catch(error){
    const diagnosis=await page.evaluate(()=>({
     module:!!window.BUFamilyClueRelayMenuV1,
     familyRoot:!!document.getElementById('bu35-family'),
     familyBody:!!document.getElementById('bu35-body'),
     start:!!document.getElementById('bu35-start'),
     card:!!document.getElementById('bu35-start')?.closest('.bu35-card'),
     kicker:document.querySelector('#bu35-body .bu35-hero .bu35-kicker')?.textContent,
     familyVisible:!!document.getElementById('bu35-family')?.getClientRects().length,
     familyExcerpt:document.getElementById('bu35-body')?.textContent?.slice(0,800)
    }));
    console.error('RELAY_FAMILY_SETUP_DIAGNOSTIC',JSON.stringify({...diagnosis,jsErrors:errors.slice(0,8)}));
    throw error;
   }
   assert(await page.$eval('#bu-fw-clue-relay-launch',b=>b.getClientRects().length>0),'Visible Family Worship entry');
   const saved=await page.evaluate(()=>({
    coins:JSON.parse(localStorage.getItem('bible-unfolded-rewards-v17')||'{}').coins,
    points:JSON.parse(localStorage.getItem('bible-unfolded-rewards-v17')||'{}').points,
    trail:localStorage.getItem('bu-visual-lab-wordtrails-next-v1')
   }));
   await page.$eval('#bu-fw-clue-relay-launch',b=>b.click());
   await page.waitForFunction(()=>window.BUFamilyClueRelayMenuV1.active()&&
    !!document.getElementById('bu-fw-clue-relay-frame')?.contentDocument?.getElementById('start-relay'),{timeout:45000});
   assert.equal(await page.evaluate(()=>location.hash),'#family-clue-relay');
   assert(await page.evaluate(v=>v.filter(id=>document.getElementById(id)).every(id=>document.getElementById(id).muted),ids),'Only relay owns audio');
   assert(await page.$eval('#bu35-start',b=>!!b),'Original mode preserved');
   await page.evaluate(()=>document.getElementById('bu-fw-clue-relay-frame').contentDocument.getElementById('start-relay').click());
   await page.waitForFunction(()=>!!document.getElementById('bu-fw-clue-relay-frame')?.contentDocument?.getElementById('begin-round'));
   await page.evaluate(()=>document.getElementById('bu-fw-clue-relay-frame').contentDocument.getElementById('begin-round').click());
   await page.waitForFunction(()=>!!document.getElementById('bu-fw-clue-relay-frame')?.contentDocument?.getElementById('submit-guess'));
   await page.evaluate(()=>{
    const child=document.getElementById('bu-fw-clue-relay-frame').contentDocument;
    child.getElementById('guess').value='an intentionally wrong answer';
    child.getElementById('submit-guess').click();
   });
   await page.waitForFunction(()=>document.getElementById('bu-fw-clue-relay-frame')?.contentDocument?.getElementById('clue-list')?.children.length===2);
   await page.evaluate(()=>syncMusic?.());
   await new Promise(r=>setTimeout(r,650));
   assert(await page.evaluate(v=>v.filter(id=>document.getElementById(id)).every(id=>document.getElementById(id).muted),ids),'No native soundtrack leak');
   await page.$eval('#bu-fw-clue-relay-back',b=>b.click());
   await page.waitForFunction(()=>!BUFamilyClueRelayMenuV1.active()&&location.hash!=='#family-clue-relay');
   assert(await page.$eval('#bu35-start',b=>b.getClientRects().length>0),'Back returns to Family Worship');
   await page.$eval('#bu-fw-clue-relay-launch',b=>b.click());
   await page.waitForFunction(()=>BUFamilyClueRelayMenuV1.active());
   await page.evaluate(()=>history.back());
   await page.waitForFunction(()=>!BUFamilyClueRelayMenuV1.active());
   const after=await page.evaluate(()=>({
    coins:JSON.parse(localStorage.getItem('bible-unfolded-rewards-v17')||'{}').coins,
    points:JSON.parse(localStorage.getItem('bible-unfolded-rewards-v17')||'{}').points,
    trail:localStorage.getItem('bu-visual-lab-wordtrails-next-v1')
   }));
   assert.deepEqual(after,saved,'Relay must not change native coins, Points or Trail saves');
   assert.deepEqual(errors,[],'No JavaScript exceptions');
   await page.goto(new URL('experiments/family-clue-relay-v1.html',site).href,{waitUntil:'domcontentloaded'});
   await page.waitForSelector('#start-relay');
   console.log('PASS_FAMILY_CLUE_RELAY_MENU',JSON.stringify({width,menu:true,clues:true,back:true,historyBack:true,walletSafe:true,musicSafe:true,directLink:true}));
   await ctx.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error('FAIL_FAMILY_CLUE_RELAY_MENU',e.stack||e);process.exitCode=1});

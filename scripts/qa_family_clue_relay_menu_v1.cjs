#!/usr/bin/env node
'use strict';
/* Mobile-browser acceptance for SINGLE standalone Clue Relay HOME card.
 * Verify original Family Worship hub/setup contain NO relay entry, gameplay,
 * return to main home, parent music isolation and native save protection. */
const p=require('puppeteer-core'),assert=require('node:assert/strict');
const cp=require('node:child_process');
const chrome=(process.env.CHROME_BIN||
 cp.execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'})).trim();
const site=process.env.BU_RELAY_URL||'http://127.0.0.1:8896/index.html';
const music=['music-navigation','music-story','music-trails','music','music-daily','music-builder','music-name'];
(async()=>{
 const browser=await p.launch({executablePath:chrome,headless:true,
  args:['--no-sandbox','--disable-dev-shm-usage'],protocolTimeout:120000});
 try{
  for(const [width,height] of [[320,568],[430,932]]){
   const ctx=await browser.createBrowserContext(),page=await ctx.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.setViewport({width,height,isMobile:true,hasTouch:true});
   await page.goto(site,{waitUntil:'domcontentloaded',timeout:120000});
   await page.waitForFunction(()=>!!window.BUFamilyClueRelayMenuV1&&
     !!window.BUPlatformRewards?.hasNativeHost?.()&&
     !!document.getElementById('home-clue-relay'),{timeout:90000});
   const placement=await page.evaluate(()=>{
    const cards=document.querySelector('.cinematic-cards');
    const entry=document.getElementById('home-clue-relay');
    const family=document.getElementById('home-family');
    const all=[...document.querySelectorAll('#home-clue-relay')];
    return {
     count:all.length,
     inMainCards:entry.parentElement===cards,
     separateFromFamily:!family.contains(entry),
     sameLevelAsFamily:family.parentElement===cards,
     order:!!(family.compareDocumentPosition(entry)&Node.DOCUMENT_POSITION_FOLLOWING),
     cardHeight:entry.getBoundingClientRect().height,
     picture:!!entry.querySelector('.cinematic-poster'),
     visibleName:entry.textContent.includes('Bible Clue Relay')
    };
   });
   assert.deepEqual(placement,{count:1,inMainCards:true,separateFromFamily:true,
    sameLevelAsFamily:true,order:true,cardHeight:placement.cardHeight,
    picture:true,visibleName:true},'Dedicated main-home card hierarchy');
   assert(placement.cardHeight>100,'Standalone card must have meaningful artwork size');

   // Open both original Family Worship screens. Neither may show Relay.
   await page.$eval('#home-family',el=>el.click());
   await page.waitForFunction(()=>!!document.getElementById('bu35-new')&&
    !document.getElementById('bu35-family').hidden,{timeout:30000});
   assert(await page.evaluate(()=>!document.querySelector('#bu35-body #bu-fw-clue-relay-entry')&&
    !document.querySelector('#bu35-body #bu-fw-clue-relay-launch')&&
    !/Bible Clue Relay/i.test(document.getElementById('bu35-body').textContent)),
    'No duplicate Clue Relay choice on Family Worship hub');
   await page.$eval('#bu35-new',el=>el.click());
   await page.waitForFunction(()=>!!document.getElementById('bu35-start'),{timeout:30000});
   assert(await page.evaluate(()=>!document.querySelector('#bu35-body #bu-fw-clue-relay-entry')&&
    !/Bible Clue Relay/i.test(document.getElementById('bu35-body').textContent)),
    'No duplicate Clue Relay choice on Family Worship setup');
   await page.evaluate(()=>window.focusHome?.());

   const before=await page.evaluate(()=>({
    rewards:localStorage.getItem('bible-unfolded-rewards-v17'),
    trail:localStorage.getItem('bu-visual-lab-wordtrails-next-v1'),
    family:localStorage.getItem('bible-unfolded-family-v35')
   }));
   await page.$eval('#home-clue-relay',el=>el.click());
   await page.waitForFunction(()=>window.BUFamilyClueRelayMenuV1.active()&&
    !!document.getElementById('bu-fw-clue-relay-frame')?.contentDocument?.getElementById('start-relay'),
    {timeout:45000});
   assert.equal(await page.evaluate(()=>location.hash),'#family-clue-relay');
   assert(await page.evaluate(ids=>ids.filter(id=>document.getElementById(id))
    .every(id=>document.getElementById(id).muted),music),'No main soundtrack during relay');
   assert(await page.$eval('#bu-fw-clue-relay-back',el=>/All Games/.test(el.textContent)),
    'Back must be labelled All Games');

   await page.evaluate(()=>document.getElementById('bu-fw-clue-relay-frame')
    .contentDocument.getElementById('start-relay').click());
   await page.waitForFunction(()=>!!document.getElementById('bu-fw-clue-relay-frame')
    ?.contentDocument?.getElementById('begin-round'));
   await page.evaluate(()=>document.getElementById('bu-fw-clue-relay-frame')
    .contentDocument.getElementById('begin-round').click());
   await page.waitForFunction(()=>!!document.getElementById('bu-fw-clue-relay-frame')
    ?.contentDocument?.getElementById('submit-guess'));
   await page.evaluate(()=>{
    const doc=document.getElementById('bu-fw-clue-relay-frame').contentDocument;
    doc.getElementById('guess').value='deliberately wrong guess';
    doc.getElementById('submit-guess').click();
   });
   await page.waitForFunction(()=>document.getElementById('bu-fw-clue-relay-frame')
    ?.contentDocument?.getElementById('clue-list')?.children.length===2);
   await page.evaluate(()=>window.syncMusic?.());
   await new Promise(r=>setTimeout(r,500));
   assert(await page.evaluate(ids=>ids.filter(id=>document.getElementById(id))
    .every(id=>document.getElementById(id).muted),music),'No soundtrack bleed');
   await page.$eval('#bu-fw-clue-relay-back',el=>el.click());
   await page.waitForFunction(()=>!window.BUFamilyClueRelayMenuV1.active()&&
    location.hash!=='#family-clue-relay'&&
    !!document.getElementById('home-clue-relay').getClientRects().length);
   await page.$eval('#home-clue-relay',el=>el.click());
   await page.waitForFunction(()=>window.BUFamilyClueRelayMenuV1.active());
   await page.evaluate(()=>history.back());
   await page.waitForFunction(()=>!window.BUFamilyClueRelayMenuV1.active()&&
    !!document.getElementById('home-clue-relay').getClientRects().length);
   const after=await page.evaluate(()=>({
    rewards:localStorage.getItem('bible-unfolded-rewards-v17'),
    trail:localStorage.getItem('bu-visual-lab-wordtrails-next-v1'),
    family:localStorage.getItem('bible-unfolded-family-v35')
   }));
   assert.deepEqual(after,before,'Relay must not change rewards, Trail or Family saves');
   assert.deepEqual(errors,[],'No JavaScript exceptions');
   await page.goto(new URL('experiments/family-clue-relay-v1.html',site).href,
    {waitUntil:'domcontentloaded'});
   await page.waitForSelector('#start-relay');
   console.log('PASS_CLUE_RELAY_DEDICATED_HOME',JSON.stringify({
    width,oneHomeCard:true,noFamilyDuplicates:true,standalone:true,
    clueGuesses:true,backToHome:true,hardwareBack:true,savesUnchanged:true,
    audioExclusive:true,directLink:true
   }));
   await ctx.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error('FAIL_CLUE_RELAY_DEDICATED_HOME',e.stack||e);process.exitCode=1});

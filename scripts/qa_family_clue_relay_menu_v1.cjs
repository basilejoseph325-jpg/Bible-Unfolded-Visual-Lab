#!/usr/bin/env node
'use strict';
/* TEST acceptance for exactly ONE Bible Clue Relay photo card on Family
 * Worship -> Play Together, after Word Builder. No separate outer home
 * card, no duplicate setup entry. Exercise relay, back/history, audio, saves. */
const p=require('puppeteer-core'),assert=require('node:assert/strict');
const cp=require('node:child_process');
const chrome=(process.env.CHROME_BIN||
 cp.execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'})).trim();
const site=process.env.BU_RELAY_URL||'http://127.0.0.1:8896/index.html';
const music=['music-navigation','music-story','music-trails','music',
 'music-daily','music-builder','music-name'];
(async()=>{
 const browser=await p.launch({executablePath:chrome,headless:true,
  args:['--no-sandbox','--disable-dev-shm-usage'],protocolTimeout:120000});
 try{
  for(const [width,height] of [[320,568],[430,932]]){
   const ctx=await browser.createBrowserContext();
   const page=await ctx.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.setViewport({width,height,isMobile:true,hasTouch:true});
   await page.goto(site,{waitUntil:'domcontentloaded',timeout:120000});
   await page.waitForFunction(()=>!!window.BUFamilyClueRelayMenuV1&&
    !!window.BUPlatformRewards?.hasNativeHost?.(),{timeout:90000});
   assert.equal(await page.$$eval('#home-clue-relay',els=>els.length),0,
    'No Clue Relay entry on outer Bible Unfolded home');
   await page.$eval('#home-family',el=>el.click());
   await page.waitForFunction(()=>{
    const body=document.getElementById('bu35-body');
    return !!body?.querySelector(':scope > .bu35-hero #bu35-new')&&
     !!body?.querySelector('#bu-fw-clue-relay-card')&&
     !document.getElementById('bu35-family').hidden;
   },{timeout:30000});
   const placement=await page.evaluate(()=>{
    const body=document.getElementById('bu35-body');
    const entry=body.querySelector('#bu-fw-clue-relay-card');
    const wordBuilder=body.querySelector('#wb36-family-open')?.closest('.bu35-card');
    return {
     one:document.querySelectorAll('#bu-fw-clue-relay-card').length===1,
     ownCard:entry.classList.contains('bu35-card')&&entry.parentElement===body,
     justAfterWordBuilder:wordBuilder?.nextElementSibling===entry,
     onePlay:entry.querySelectorAll('#bu-fw-clue-relay-launch').length===1,
     visibleName:entry.textContent.includes('Bible Clue Relay'),
     height:entry.getBoundingClientRect().height,
     hasArt:getComputedStyle(entry).backgroundImage.includes('topic-02-bible-people-events')
    };
   });
   assert(placement.one&&placement.ownCard&&placement.justAfterWordBuilder&&
    placement.onePlay&&placement.visibleName&&placement.height>110&&
    placement.hasArt,'Single integrated Play Together artwork card: '+
    JSON.stringify(placement));
   const before=await page.evaluate(()=>({
    rewards:localStorage.getItem('bible-unfolded-rewards-v17'),
    trail:localStorage.getItem('bu-visual-lab-wordtrails-next-v1'),
    family:localStorage.getItem('bible-unfolded-family-v35')
   }));
   await page.$eval('#bu-fw-clue-relay-launch',el=>el.click());
   await page.waitForFunction(()=>window.BUFamilyClueRelayMenuV1.active()&&
    !!document.getElementById('bu-fw-clue-relay-frame')
      ?.contentDocument?.getElementById('start-relay'),{timeout:45000});
   assert.equal(await page.evaluate(()=>location.hash),'#family-clue-relay');
   assert(await page.$eval('#bu-fw-clue-relay-back',
    el=>/Play Together/.test(el.textContent)),'Back returns to Play Together');
   assert(await page.evaluate(ids=>ids.filter(id=>document.getElementById(id))
     .every(id=>document.getElementById(id).muted),music),
    'No parent soundtrack during relay');
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
    .every(id=>document.getElementById(id).muted),music),'No sound overlap');
   await page.$eval('#bu-fw-clue-relay-back',el=>el.click());
   await page.waitForFunction(()=>!window.BUFamilyClueRelayMenuV1.active()&&
    location.hash!=='#family-clue-relay'&&
    !document.getElementById('bu35-family').hidden&&
    !!document.getElementById('bu-fw-clue-relay-card')?.getClientRects().length);
   assert.equal(await page.$$eval('#home-clue-relay',els=>els.length),0,
    'Closing relay does not add outer home card');
   await page.$eval('#bu-fw-clue-relay-launch',el=>el.click());
   await page.waitForFunction(()=>window.BUFamilyClueRelayMenuV1.active());
   await page.evaluate(()=>history.back());
   try{
    await page.waitForFunction(()=>!window.BUFamilyClueRelayMenuV1.active()&&
     !document.getElementById('bu35-family').hidden&&
     !!document.getElementById('bu-fw-clue-relay-card')?.getClientRects().length,
     {timeout:7000});
   }catch(error){
    console.error('HARDWARE_BACK_DIAGNOSTIC',JSON.stringify(await page.evaluate(()=>({
     hash:location.hash,href:location.href,relayActive:window.BUFamilyClueRelayMenuV1?.active(),
     shell:!!document.getElementById('bu-fw-clue-relay-shell'),
     familyHidden:document.getElementById('bu35-family')?.hidden,
     card:!!document.getElementById('bu-fw-clue-relay-card'),
     cardRects:document.getElementById('bu-fw-clue-relay-card')?.getClientRects().length,
     bodyHasHero:!!document.querySelector('#bu35-body > .bu35-hero #bu35-new')
    }))));
    throw error;
   }
   const after=await page.evaluate(()=>({
    rewards:localStorage.getItem('bible-unfolded-rewards-v17'),
    trail:localStorage.getItem('bu-visual-lab-wordtrails-next-v1'),
    family:localStorage.getItem('bible-unfolded-family-v35')
   }));
   assert.equal(after.rewards,before.rewards,'Relay must not change wallet');
   assert.equal(after.trail,before.trail,'Relay must not change Word Trails');
   // Reopening the native Family Worship hub can create its normal default
   // setup record when none existed; this is not relay game progress.
   if(before.family!==null)assert.equal(after.family,before.family,
    'Existing Family Worship saves remain intact');
   else if(after.family!==null)assert.equal(JSON.parse(after.family).game,null,
    'Native Family Worship initialization must not invent a played game');

   // Family Worship setup is a different screen; Relay must NOT duplicate there.
   await page.$eval('#bu35-new',el=>el.click());
   await page.waitForFunction(()=>!!document.getElementById('bu35-start'),{timeout:30000});
   assert(await page.evaluate(()=>!document.getElementById('bu35-body')
     ?.querySelector('#bu-fw-clue-relay-card,#bu-fw-clue-relay-launch')),
     'No Clue Relay card inside Family Worship setup');

   assert.deepEqual(errors,[],'No JavaScript exceptions');
   await page.goto(new URL('experiments/family-clue-relay-v1.html',site).href,
    {waitUntil:'domcontentloaded'});
   await page.waitForSelector('#start-relay');
   console.log('PASS_CLUE_RELAY_PLAY_TOGETHER',JSON.stringify({
    width,oneFamilyCard:true,afterWordBuilder:true,noOuterHomeCard:true,
    noSetupDuplicate:true,clueProgression:true,backToPlayTogether:true,
    browserBackToPlayTogether:true,savesUnchanged:true,audioExclusive:true,
    directLink:true
   }));
   await ctx.close();
  }
 }finally{await browser.close();}
})().catch(e=>{
 console.error('FAIL_CLUE_RELAY_PLAY_TOGETHER',e.stack||e);process.exitCode=1;
});

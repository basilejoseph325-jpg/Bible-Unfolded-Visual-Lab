#!/usr/bin/env node
'use strict';
/* TEST-only actual Chromium playthrough. No access to or writes to LIVE. */
const assert=require('node:assert/strict');
const {execSync}=require('node:child_process');
const puppeteer=require('puppeteer-core');
const chrome=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
(async()=>{
 const browser=await puppeteer.launch({headless:true,executablePath:chrome,
   args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'],timeout:90000});
 try{
  for(const [w,h] of [[390,705],[320,568]]){
   const page=await browser.newPage(),errors=[];
   await page.setViewport({width:w,height:h,isMobile:true,hasTouch:true,deviceScaleFactor:2});
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:8898/experiments/story-adventure-nehemiah-explore-v1.html',
     {waitUntil:'networkidle0',timeout:70000});
   const start=await page.evaluate(()=>{
    const b=document.body,a=document.getElementById('app');
    return {title:document.querySelector('h1')?.textContent,
      stage:document.getElementById('step-label')?.textContent,
      markers:document.querySelectorAll('.marker').length,
      source:document.getElementById('source')?.href,
      art:getComputedStyle(document.getElementById('scene')).backgroundImage,
      bodyScroll:b.scrollHeight-innerHeight,appScroll:a.scrollHeight-a.clientHeight,
      nativeKeys:Object.keys(localStorage).filter(k=>!k.startsWith('bu-test-story-nehemiah'))};
   });
   assert.equal(start.title,'The Warning');
   assert.equal(start.markers,3);
   assert(start.source.includes('/bible/nwt/books/nehemiah/4/'));
   assert(start.art.includes('16_nehemiah.webp'));
   assert(start.bodyScroll<=1&&start.appScroll<=1,'One-screen app should fit '+w+'x'+h);
   assert.deepEqual(start.nativeKeys,[],'No canonical saves may be written');
   for(let stage=0;stage<3;stage++){
    const before=await page.evaluate(()=>({
     stage:document.getElementById('step-label')?.textContent,
     locked:document.querySelectorAll('.choice:disabled').length,
     markers:document.querySelectorAll('.marker').length}));
    assert(before.stage.includes('EPISODE '+(stage+1)));
    assert.equal(before.locked,2);
    assert.equal(before.markers,3);
    await page.evaluate(()=>{
      document.querySelectorAll('.marker')[0].click();
      document.querySelectorAll('.marker')[1].click();
    });
    let detail=await page.evaluate(()=>({
      prompt:document.getElementById('mission-prompt').textContent,
      unlocked:document.querySelectorAll('.choice:not(:disabled)').length,
      seen:document.querySelectorAll('.marker.seen').length
    }));
    assert.equal(detail.unlocked,2);
    assert.equal(detail.seen,2);
    await page.evaluate((n)=>document.querySelectorAll('.choice')[n].click(),stage%2);
    const unlocked=await page.evaluate(()=>({
     next:document.getElementById('next').disabled,
     feedback:document.getElementById('discovery-copy').textContent,
     choice:JSON.parse(localStorage.getItem('bu-test-story-nehemiah-adventure-v1')).decisions
    }));
    assert.equal(unlocked.next,false);
    assert(unlocked.feedback.length>40);
    assert(Object.hasOwn(unlocked.choice,String(stage)));
    await page.click('#next');
   }
   const complete=await page.evaluate(()=>({
    final:document.getElementById('app').classList.contains('final'),
    complete:JSON.parse(localStorage.getItem('bu-test-story-nehemiah-adventure-v1')).completed,
    pageErrors:null,
    bodyScroll:document.body.scrollHeight-innerHeight
   }));
   assert(complete.final&&complete.complete,'Adventure must complete after 3 true player decisions');
   assert(complete.bodyScroll<=1);
   await page.reload({waitUntil:'domcontentloaded'});
   assert(await page.$('#app.final'),'Completed progress resumes on reload');
   await page.click('#restart');
   const reset=await page.evaluate(()=>({
    title:document.querySelector('h1').textContent,
    markers:document.querySelectorAll('.marker').length,
    stage:JSON.parse(localStorage.getItem('bu-test-story-nehemiah-adventure-v1')).chapter,
    completed:JSON.parse(localStorage.getItem('bu-test-story-nehemiah-adventure-v1')).completed,
    otherKeys:Object.keys(localStorage).filter(k=>!k.startsWith('bu-test-story-nehemiah'))
   }));
   assert.equal(reset.title,'The Warning');
   assert.equal(reset.markers,3);
   assert.equal(reset.stage,0);
   assert.equal(reset.completed,false);
   assert.deepEqual(reset.otherKeys,[]);
   assert.deepEqual(errors,[],'No JavaScript errors');
   console.log('PASS_STORY_NEHEMIAH',JSON.stringify({viewport:w+'x'+h,
    threeEpisodes:true,discoveries:true,choices:true,completed:true,
    resume:true,restart:true,canonicalSavesUntouched:true,
    actualPhoneAndSafariNotYetValidated:true}));
   await page.close();
  }
  const native=await browser.newPage();
  await native.setViewport({width:390,height:705,isMobile:true,hasTouch:true,deviceScaleFactor:2});
  await native.goto('http://127.0.0.1:8898/index.html',
    {waitUntil:'domcontentloaded',timeout:110000});
  await native.waitForSelector('#bu-story-explorer-entry a[href="experiments/story-adventure-nehemiah-explore-v1.html"]',
    {timeout:50000});
  const entry=await native.evaluate(()=>{
    const a=document.querySelector('#bu-story-explorer-entry a');
    return {link:a?.getAttribute('href'),map:!!document.getElementById('journey-stops'),
     originalGame:!!document.getElementById('play'),originalRoute:!!document.getElementById('home-journey')};
  });
  assert(entry.map&&entry.originalGame&&entry.originalRoute,'Original Story UI must be retained');
  console.log('PASS_STORY_JOURNEY_ENTRY',JSON.stringify(entry));
  await native.close();
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
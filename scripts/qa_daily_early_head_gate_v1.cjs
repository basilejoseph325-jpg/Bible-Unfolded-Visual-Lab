#!/usr/bin/env node
'use strict';
/* TEST: owner's actual regression, a tap before even the late TEST JS is loaded.
 * The previous QA delayed just editorial data and missed the early input race.
 */
const fs=require('node:fs');
const assert=require('node:assert/strict');
const puppeteer=require('puppeteer-core');
const {execSync}=require('node:child_process');
const chrome=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const html=fs.readFileSync('index.html','utf8');
assert.equal(html.split('<script id="bu-daily-early-gate-v1">').length,2);
const headPos=html.indexOf('bu-daily-early-gate-v1'),stylePos=html.indexOf('<style>');
assert(headPos>0&&headPos<stylePos,'Early gate MUST be inline in HTML head BEFORE giant native UI/scripts');
assert(headPos<html.indexOf('journey-progress-caption.js'),'Early guard MUST precede late JS loader');
(async()=>{
 const browser=await puppeteer.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'],protocolTimeout:110000});
 try{
  const page=await browser.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.setViewport({width:390,height:705,isMobile:true,hasTouch:true,deviceScaleFactor:2});
  await page.setRequestInterception(true);
  let oldLateLoaderIntercepted=false;
  page.on('request',req=>{
   // Crucial: do not load the JS file where the PREVIOUS failed guard lived.
   if(req.url().includes('/journey-progress-caption.js')){
    oldLateLoaderIntercepted=true;
    return req.abort().catch(()=>{});
   }
   return req.continue().catch(()=>{});
  });
  await page.goto('http://127.0.0.1:8897/index.html',{waitUntil:'domcontentloaded',timeout:110000});
  await page.waitForFunction(()=>!!document.getElementById('bu375-home-cta'),{timeout:30000});
  await page.evaluate(()=>document.getElementById('daily-continue')?.click());
  const before=await page.evaluate(()=>({
   early:window.BUDailyEarlyGateV1?.installed===true,
   readerLoaded:!!window.BUDailyInsightV1,
   nativeDailyHidden:document.getElementById('bu375-daily')?.hidden
  }));
  assert(before.early,'HTML head gate must be active without the late TEST script');
  assert.equal(before.readerLoaded,false,'Blocking late loader must keep illustrated reader absent');
  assert(oldLateLoaderIntercepted,'Test must actually block the late external JS');
  await page.evaluate(()=>{
   const card=document.getElementById('bu375-home-cta');
   card.click();card.click();
  });
  const after=await page.evaluate(()=>({
   queued:window.BUDailyEarlyGateV1?.queued(),
   busy:document.getElementById('bu375-home-cta')?.getAttribute('aria-busy'),
   nativeDailyHidden:document.getElementById('bu375-daily')?.hidden,
   oldTitle:document.querySelector('#bu375-daily')?.innerText?.slice(0,180)
  }));
  assert.equal(after.busy,'true','The first early tap should be acknowledged');
  assert(after.queued,'Fast double taps must queue just one modern read');
  assert.equal(after.nativeDailyHidden,true,'Old five-question mode must NOT open even with late loader absent');
  assert.deepEqual(errors,[],'No early head parse/runtime exceptions');
  console.log('PASS_EARLIEST_DAILY_TAP: early HTML header guard blocked legacy screen before any TEST loader',JSON.stringify({before,after}));
 }finally{await browser.close()}
})().catch(e=>{console.error('FAIL_EARLY_HEAD_GATE',e.stack||e);process.exitCode=1});

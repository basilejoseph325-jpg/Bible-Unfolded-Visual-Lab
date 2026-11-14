#!/usr/bin/env node
'use strict';
/* TEST-only REAL Chromium 2-document storage event contract on localhost.
 * Two fresh synthetic profiles, no actual user account state, no LIVE site.
 * Requires local python http.server at http://127.0.0.1:8897
 */
const assert=require('node:assert/strict'),puppeteer=require('puppeteer-core');
const {execSync}=require('node:child_process');
const chrome=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const root='http://127.0.0.1:8897';
const LIVE='bible-unfolded-word-trails-next-v1',W='bible-unfolded-rewards-v17';
const T='bu-visual-lab-wordtrails-next-v1';
const migrated=JSON.stringify({level:1,coins:60,points:0,
 migration:{version:1,source:'Visual Lab crossword progress'}});
(async()=>{
 const browser=await puppeteer.launch({executablePath:chrome,headless:true,timeout:90000,
  protocolTimeout:120000,args:['--no-sandbox','--disable-setuid-sandbox',
  '--disable-dev-shm-usage','--disable-gpu']});
 try{
  for(const [width,height] of [[390,705],[320,568]]){
   const context=await browser.createBrowserContext();
   // Keep A foreground until native Settings finishes installing; starting
   // tab B first allows headless Chrome to throttle A's startup polling.
   const a=await context.newPage(),errors=[];
   await a.bringToFront();
   a.on('pageerror',e=>errors.push(e.message));
   await a.setViewport({width,height,isMobile:true,hasTouch:true,deviceScaleFactor:2});
   await a.goto(root+'/index.html?qa-external-v32='+width,
     {waitUntil:'domcontentloaded',timeout:120000});
   await a.waitForFunction(()=>window.BUPlatformSaves?.bound?.()&&
    typeof window.BUPlatformSaves?.externalChangeStatus==='function',
    {timeout:75000});
   // A 404 is deliberate: B has the SAME origin yet no Bible Unfolded game
   // scripts that could create false positives from unrelated daily rewards.
   const b=await context.newPage();
   await b.bringToFront();
   await b.goto(root+'/qa-empty-second-tab-v32.html',{waitUntil:'domcontentloaded',timeout:30000});
   const start=await a.evaluate(({LIVE,T})=>{
    const api=window.BUPlatformSaves;
    const state=api.externalChangeStatus();
    return {detected:state.detected,hasMenu:!!document.getElementById('save-file'),
     beforeLive:localStorage.getItem(LIVE),test:localStorage.getItem(T)};
   },{LIVE,T});
   assert.equal(start.detected,false,'Native screen already detected a conflicting writer');
   assert(start.hasMenu);
   await b.evaluate(([k,raw])=>localStorage.setItem(k,raw),[LIVE,migrated]);
   await a.bringToFront();
   await a.waitForFunction(()=>window.BUPlatformSaves?.externalChangeStatus().oldLiveMigrationObserved===true,
    {timeout:30000,polling:100});
   const observed=await a.evaluate(({LIVE,T,migrated})=>{
    const api=window.BUPlatformSaves,status=api.externalChangeStatus();
    const panel=document.getElementById('bu-wt-external-page-review');
    const copied=api.makeBackup();
    let refusal='';
    try{api.applyBackup(copied,{reload:false})}catch(e){refusal=String(e?.message||e)}
    let previewRefusal='';
    try{api.previewRestoreWrites(copied)}catch(e){previewRefusal=String(e?.message||e)}
    return {detected:status.detected,migration:status.oldLiveMigrationObserved,
     keys:status.keys,panel:!!panel,panelCopy:panel?.textContent||'',
     live:localStorage.getItem(LIVE),test:localStorage.getItem(T),
     backupContainsLive:Object.hasOwn(copied.keys,LIVE),refusal,previewRefusal};
   },{LIVE,T,migrated});
   assert(observed.detected&&observed.migration&&observed.panel);
   assert(observed.keys.includes(LIVE));
   assert.equal(observed.live,migrated);
   assert.equal(observed.test,start.test,'Cross-page guard itself must not alter TEST progress');
   assert(!observed.backupContainsLive);
   assert(observed.refusal.includes('Another Bible Unfolded page or frame'));
   assert(observed.previewRefusal.includes('Another Bible Unfolded page or frame'));
   for(const version of [1,2]){
    const blocked=await a.evaluate(async version=>{
     const api=window.BUPlatformSaves,
      picker=document.getElementById('save-file'),
      walletKey='bible-unfolded-rewards-v17',
      old=localStorage.getItem(walletKey);
     const snapshot=api.makeBackup();
     const doc=version===1?{format:'BibleUnfoldedSave',version:1,keys:{[walletKey]:old}}:snapshot;
     const dt=new DataTransfer();
     dt.items.add(new File([JSON.stringify(doc)],'synthetic-'+version+'.json',{type:'application/json'}));
     picker.files=dt.files;
     let dialogs=0;const previous=window.confirm;
     window.confirm=()=>{dialogs++;return true};
     try{await picker.onchange(new Event('change'))}finally{window.confirm=previous}
     return {dialogs,cleared:!picker.value,
      status:document.getElementById('bu-wt-save-status')?.textContent||'',
      walletSame:localStorage.getItem(walletKey)===old};
    },version);
    assert.equal(blocked.dialogs,0);
    assert(blocked.cleared&&blocked.walletSame);
    assert(blocked.status.includes('imports are paused'));
   }
   assert.deepEqual(errors,[],'Published native UI threw JS errors');
   console.log('PASS_NATIVE_EXTERNAL_PAGE_GUARD_V32_REAL_TWO_DOCS',
    JSON.stringify({viewport:width+'x'+height,actualCrossDocumentStorageEvent:true,
      originalNativeSettings:true,oldLiveMigrationMarkerDetected:true,
      v1AndV2ImportsBlocked:true,readOnlyBackupStillAvailable:true,
      noRealUserData:true,pageErrors:0}));
   await context.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error('FAIL_NATIVE_EXTERNAL_PAGE_GUARD_REAL_TWO_DOCS',e.stack||e);process.exitCode=1});

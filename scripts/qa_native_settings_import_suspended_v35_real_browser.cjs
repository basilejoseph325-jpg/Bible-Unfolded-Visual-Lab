#!/usr/bin/env node
'use strict';
/* v35 native Settings UI import stop, REAL Chromium; local or PUBLIC TEST
 * root only, fresh synthetic browser contexts. No player save data, no LIVE.
 */
const assert=require('node:assert/strict'),puppeteer=require('puppeteer-core');
const {execSync}=require('node:child_process');
const bin=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const ROOT=process.env.BU_TEST_ORIGIN||'http://127.0.0.1:8897';
const LIVE='bible-unfolded-word-trails-next-v1';
const W='bible-unfolded-rewards-v17',WB='bible-unfolded-rewards-v17-recovery-v3811';
const T='bu-visual-lab-wordtrails-next-v1';
const J='bu-visual-lab-import-rollback-v2',C='bu-visual-lab-import-committed-v2';
const wallet=JSON.stringify({coins:777,points:-20,purchases:['seawheel'],equippedWheel:'seawheel'});
const trail=JSON.stringify({level:1,unlocked:2,coins:80,points:12,completed:[0],sparks:[],
 claimedSparks:[],boardBible:[],paidWords:[],paidBonuses:[],claimedFreeHints:[],
 progress:{level:1,found:['ELI'],bonuses:[],hinted:[],combo:1}});
const live=JSON.stringify({level:20,unlocked:22,coins:255,completed:[0,1]});
(async()=>{
 const browser=await puppeteer.launch({headless:true,executablePath:bin,timeout:90000,
  protocolTimeout:120000,args:['--no-sandbox','--disable-setuid-sandbox',
   '--disable-dev-shm-usage','--disable-gpu']});
 try{
  for(const [width,height] of [[390,705],[320,568]]){
   const context=await browser.createBrowserContext();
   const page=await context.newPage(),errors=[];
   await page.bringToFront();
   page.on('pageerror',e=>errors.push(e.message));
   await page.setViewport({width,height,isMobile:true,hasTouch:true,deviceScaleFactor:2});
   await page.goto(ROOT+'/index.html?qa-import-suspended-v35='+width,
    {waitUntil:'domcontentloaded',timeout:120000});
   await page.waitForFunction(()=>window.BUPlatformSaves?.bound?.()&&
    document.getElementById('bu-wt-safe-preview-v34')&&
    document.getElementById('save-import')&&
    document.getElementById('save-file')?.onchange,{timeout:90000});
   const state=await page.evaluate(({W,WB,T,LIVE,wallet,trail,live,J,C})=>{
    localStorage.setItem(W,wallet);
    localStorage.setItem(WB,wallet);
    localStorage.setItem(T,trail);
    localStorage.setItem(LIVE,live);
    localStorage.removeItem(J);localStorage.removeItem(C);
    const api=window.BUPlatformSaves;
    const source=document.getElementById('bu-platform-save-core-v2')?.src||'';
    const backup=api.makeBackup();
    const keys=[W,WB,T,LIVE,J,C];
    const snapshot=()=>keys.map(k=>localStorage.getItem(k));
    let confirmationCount=0,alertCount=0;
    const before=snapshot();
    const oldConfirm=window.confirm,oldAlert=window.alert;
    window.confirm=()=>{confirmationCount++;return true};
    window.alert=()=>{alertCount++};
    const importButton=document.getElementById('save-import');
    const picker=document.getElementById('save-file');
    const click=importButton.click();
    const afterClick=snapshot();
    const out=[];
    for(const kind of ['v1','v2','mixed','malformed']){
     const candidate=kind==='v1'?
      {format:'BibleUnfoldedSave',version:1,keys:{[W]:wallet}}:
      kind==='v2'?backup:
      kind==='mixed'?{...backup,keys:{...backup.keys,[LIVE]:live}}:
      {notEvenAValidBackup:true};
     const dt=new DataTransfer();
     dt.items.add(new File([JSON.stringify(candidate)],kind+'.json',{type:'application/json'}));
     picker.files=dt.files;
     const event=new Event('change',{bubbles:true,cancelable:true});
     const cancelled=!picker.dispatchEvent(event);
     out.push({kind,cancelled,defaultPrevented:event.defaultPrevented,
      noProgressWrite:JSON.stringify(snapshot())===JSON.stringify(before),
      selectedInputCleared:picker.value==='',
      nativeStatus:document.getElementById('bu-wt-save-status')?.textContent||''});
    }
    const result={
     source,reviewOpen:document.getElementById('bu-wt-safe-preview-v34')?.open,
     hasExport:!!document.getElementById('save-export'),
     importTitle:importButton.getAttribute('title'),
     buttonClickUnchanged:JSON.stringify(before)===JSON.stringify(afterClick),
     unchanged:JSON.stringify(before)===JSON.stringify(snapshot()),
     confirmationCount,alertCount,out,
     exportExcludesLive:backup.keys[LIVE]===undefined,
     stillCanPreview:api.previewRestoreReview(backup).noWritesPerformed
    };
    window.confirm=oldConfirm;window.alert=oldAlert;
    return result;
   },{W,WB,T,LIVE,wallet,trail,live,J,C});
   assert(state.source.includes('native-import-paused-v35'),
    'Real TEST page did not load v35 import guard source: '+state.source);
   assert(state.hasExport&&state.reviewOpen&&state.buttonClickUnchanged);
   assert(state.importTitle.includes('Review backups safely'));
   assert(state.unchanged&&state.confirmationCount===0&&state.alertCount===0,
    'A native import unexpectedly opened a dialog or altered saved data: '+JSON.stringify(state));
   for(const x of state.out){
    assert(x.defaultPrevented&&x.cancelled&&x.noProgressWrite&&x.selectedInputCleared,
     'Import handler not stopped in capture phase: '+JSON.stringify(x));
    assert(x.nativeStatus.includes('RESTORE is temporarily disabled'));
   }
   assert(state.exportExcludesLive&&state.stillCanPreview);
   assert.deepEqual(errors,[],'Native Settings import guard introduced page errors');
   console.log('PASS_TEST_NATIVE_UI_IMPORT_GATE_V35_REAL_BROWSER',JSON.stringify({
    viewport:width+'x'+height,publishedTest:ROOT.startsWith('https://'),
    nativeImportClickIntercepted:true,v1AndV2NativeChangeIntercepted:true,
    malformedAndMixedBackupsBlocked:true,
    noWalletCrosswordOrRecoveryJournalChanged:true,
    currentExportAndReadonlyReviewRetained:true,
    userConsentDialogNeverInvoked:true,
    noActualUserStorageAccessed:true,pageErrors:0
   }));
   await context.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error('FAIL_TEST_NATIVE_UI_IMPORT_GATE_V35_REAL_BROWSER',e.stack||e);process.exitCode=1});

#!/usr/bin/env node
'use strict';
/* Browser check of the REAL TEST Bible Unfolded Settings save area with
 * a user-clicked link to a separate, fake-storage practice page.
 * Runs only in a new isolated CI browser profile, never against an
 * end-user's saved browser data, and does not touch Story-Trails LIVE.
 */
const puppeteer=require('puppeteer-core'),assert=require('node:assert/strict');
const {execSync}=require('node:child_process');
const chrome=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const root=process.env.BU_WT_NATIVE_SETTINGS_ROOT||'http://127.0.0.1:8892/index.html';
const ids=['bible-unfolded-rewards-v17','bible-unfolded-wheel-ownership-v3825-backup',
 'bible-unfolded-private-voice-pref-v381','bu-visual-lab-wordtrails-next-v1',
 'bible-unfolded-word-trails-next-v1','bu-practice-checkpoint-test-sentinel'];
(async()=>{
 const browser=await puppeteer.launch({headless:true,executablePath:chrome,args:[
  '--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--disable-gpu'],
  timeout:90000,protocolTimeout:120000});
 try{
  for(const {width,height} of [{width:390,height:705},{width:320,height:568}]){
   const ctx=await browser.createBrowserContext();
   const page=await ctx.newPage(),pageErrors=[];
   page.on('pageerror',e=>pageErrors.push(e.message));
   await page.setViewport({width,height,deviceScaleFactor:2,isMobile:true,hasTouch:true});
   await page.goto(root,{waitUntil:'domcontentloaded',timeout:120000});
   await page.waitForFunction(()=>window.BUWTNativeShell?.nativeReady?.()&&
    window.BUPlatformSaves?.bound?.()&&!!document.getElementById('bu-wt-checkpoint-practice-native-link'),
    {timeout:120000});
   const before=await page.evaluate(keys=>{
    localStorage.setItem('bu-practice-checkpoint-test-sentinel','do-not-change');
    return Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)]));
   },ids);
   const status=await page.evaluate(()=>{
    const link=document.getElementById('bu-wt-checkpoint-practice-native-link');
    const origin=document.getElementById('settings-dialog');
    const save=document.getElementById('save-export'),picker=document.getElementById('save-file');
    return {
     nativeContainer:origin.contains(link)&&save.closest('.save-transfer').contains(link),
     realExportStillPresent:!!(save&&picker&&save.onclick&&picker.onchange),
     onlyOne:document.querySelectorAll('#bu-wt-checkpoint-practice-native-link').length===1,
     href:link.href,target:link.target,rel:link.rel,
     containsRealKey:link.href.includes('bible-unfolded-word-trails-next-v1'),
     syntheticOnly:link.textContent.includes('TEST only'),
     rootShellAvailable:!!window.BUWTNativeShell
    };
   });
   assert(status.nativeContainer,'Link must appear inside the original native Settings save area');
   assert(status.realExportStillPresent,'Native Save Export / Import must remain present');
   assert(status.onlyOne,'No duplicate or cloned Settings link');
   assert(status.href.includes('/experiments/word-trails-checkpoint-rehearsal-v2.html'));
   assert.equal(status.target,'_blank','Practice must open a separate tab');
   assert(status.rel.includes('noopener')&&status.rel.includes('noreferrer'),'Safe external tab');
   assert(status.syntheticOnly&&status.rootShellAvailable);
   assert.equal(status.containsRealKey,false);
   await page.evaluate(()=>window.openDialog('settings'));
   await page.waitForFunction(()=>!document.getElementById('settings-dialog').hidden);
   const targetPromise=browser.waitForTarget(t=>t.url().includes('word-trails-checkpoint-rehearsal-v2.html'),{timeout:45000});
   await page.click('#bu-wt-checkpoint-practice-native-link');
   const newTab=await (await targetPromise).page();
   assert(newTab,'Practice browser tab should open');
   newTab.on('pageerror',e=>pageErrors.push(e.message));
   await newTab.waitForFunction(()=>document.documentElement.dataset.wtCheckpointRehearsalReady==='yes',{timeout:45000});
   const landing=await newTab.evaluate(()=>({
    mockOnly:document.querySelector('.safety')?.textContent.includes('Practice only'),
    backupDisabled:document.getElementById('saved')?.disabled,
    originalNotShown:document.getElementById('save-export')===null,
    noRealImport:!window.BUWTLegacyAutoImportRetiredV4&&
      !document.querySelector('script[src*="word-trails-live-migration-v1.js"]'),
    hasV3:!!window.BUWTRecoveryCheckpointCandidateV3,
    sampleWrites:window.__BUWTCheckpointRehearsal.inspect().writes
   }));
   assert(landing.mockOnly&&landing.backupDisabled&&landing.originalNotShown&&landing.noRealImport&&landing.hasV3);
   assert.deepEqual(landing.sampleWrites,[],'Practice tab makes no synthetic save writes on startup');
   await newTab.close();
   const after=await page.evaluate(keys=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)])),ids);
   assert.deepEqual(after,before,'Opening practice link must not change any native or Word Trails keys');
   // Now open Word Trails from the real home card. It must still call the
   // actual original Settings with the same single TEST practice link.
   await page.evaluate(()=>{window.closeDialog();document.getElementById('home-cross').click()});
   await page.waitForFunction(()=>window.BUWTNativeShell?.active?.()&&
     document.getElementById('bu-wt-native-game')?.contentWindow?.BUWTPolish,
     {timeout:90000});
   const inside=await page.evaluate(()=>{
    const child=document.getElementById('bu-wt-native-game').contentWindow;
    child.BUWTPolish.openSettings();
    return {nativeOpen:!document.getElementById('settings-dialog').hidden,
     oneEntry:document.querySelectorAll('#bu-wt-checkpoint-practice-native-link').length,
     nativeSavePresent:!!document.getElementById('save-export'),
     childLocalDialogOpen:!!child.document.getElementById('wt-feel-settings')?.open,
     hasHorizontalOverflow:child.document.documentElement.scrollWidth>child.innerWidth+1};
   });
   assert(inside.nativeOpen,'Word Trails should use native Settings');
   assert.equal(inside.oneEntry,1);
   assert(inside.nativeSavePresent);
   assert.equal(inside.childLocalDialogOpen,false);
   assert.equal(inside.hasHorizontalOverflow,false);
   const latest=await page.evaluate(keys=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)])),ids);
   assert.deepEqual(latest,before,'Launching Word Trails + native Settings must not change protected snapshots in this fixture');
   assert.deepEqual(pageErrors,[],'No browser errors while opening practice link');
   console.log('PASS_WORD_TRAILS_NATIVE_SETTINGS_PRACTICE_ENTRY_V24',JSON.stringify({
    viewport:width+'x'+height,realNativeBackupUntouched:true,onlyOneTestPracticeLink:true,
    separateSafeTab:true,openedSyntheticUI:true,hasActualNativeSettingsInWordTrails:true,
    noStorageChanges:true,noHorizontalOverflow:true,pageErrors:0}));
   await ctx.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error('FAIL_WORD_TRAILS_NATIVE_SETTINGS_PRACTICE_ENTRY_V24',e.stack||e);process.exitCode=1});

#!/usr/bin/env node
'use strict';
/* Public GitHub Pages TEST root verification, fictional data in FRESH
 * Chromium isolated browser contexts. NEVER run on user's actual browser.
 * Only use read-only TEST backup APIs and fictional localStorage probes;
 * no imports, downloads, real user storage or original LIVE edits.
 */
const puppeteer=require('puppeteer-core'),assert=require('node:assert/strict');
const {execSync}=require('node:child_process');
const chrome=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const ROOT='https://basilejoseph325-jpg.github.io/Bible-Unfolded-Visual-Lab/index.html';
const LIVE='bible-unfolded-word-trails-next-v1';
const TEST='bu-visual-lab-wordtrails-next-v1';
const OLD='bu-visual-lab-import-rollback-v2';
const wordTrails=JSON.stringify({level:1,unlocked:3,coins:120,points:30,
 completed:[0],sparks:[],claimedSparks:[],boardBible:[],paidWords:[],
 paidBonuses:[],claimedFreeHints:[],progress:{level:1,found:['ELI'],
 bonuses:[],hinted:[],combo:1}});
const fakeLive=JSON.stringify({level:11,completed:[0,1,2],coins:999});
(async()=>{
 const browser=await puppeteer.launch({headless:true,executablePath:chrome,args:[
  '--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--disable-gpu',
  '--autoplay-policy=no-user-gesture-required'],timeout:90000,protocolTimeout:120000});
 try{
  for(const [width,height] of [[390,705],[320,568]]){
   const context=await browser.createBrowserContext();
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.setViewport({width,height,isMobile:true,hasTouch:true,deviceScaleFactor:2});
   await page.goto(ROOT+'?qa-native-backup-v28='+width,{
    waitUntil:'domcontentloaded',timeout:120000});
   await page.waitForFunction(()=>
    window.BUPlatformSaves?.bound?.()&&
    typeof window.BUPlatformSaves?.previewRestoreWrites==='function',
    {timeout:90000});
   const result=await page.evaluate(({TEST,LIVE,wordTrails,fakeLive,OLD})=>{
    const native=window.BUPlatformSaves;
    const load=document.getElementById('bu-platform-save-core-v2')?.src||'';
    const banner=document.querySelector('script[src*="visual-lab-test-banner.js"]')?.src||'';
    // All samples exist only in this CI browser's never-before-used profile.
    localStorage.setItem(LIVE,fakeLive);
    localStorage.setItem(TEST,wordTrails);
    localStorage.setItem('story-trails-v28-qa-sentinel',
     JSON.stringify({fictional:true,completed:[1]}));
    const before={
     live:localStorage.getItem(LIVE),
     test:localStorage.getItem(TEST),
     journal:localStorage.getItem(OLD)
    };
    const backup=native.makeBackup();
    const clean=JSON.parse(JSON.stringify(backup));
    const resultPreview=native.previewRestoreWrites(clean);
    const edited=JSON.parse(JSON.stringify(clean));
    edited.keys[LIVE]=JSON.stringify({level:0,completed:[]});
    let rejected='';
    try{native.previewRestoreWrites(edited)}
    catch(error){rejected=String(error?.message||error)}
    const after={
     live:localStorage.getItem(LIVE),
     test:localStorage.getItem(TEST),
     journal:localStorage.getItem(OLD)
    };
    return {
     load,banner,version:native.version,
     bound:native.bound(),previewType:typeof native.previewRestoreWrites,
     realNativeExport:!!document.getElementById('save-export'),
     realNativeImport:!!document.getElementById('save-file'),
     originalSettings:!!document.getElementById('settings-dialog'),
     testBanner:!!document.getElementById('bu-visual-lab-test-banner'),
     liveInExport:Object.prototype.hasOwnProperty.call(backup.keys,LIVE),
     nativeKeys:Object.keys(backup.keys).length,
     testBackupFormat:backup.extensions.wordTrailsNext.format,
     testStateMatches:backup.extensions.wordTrailsNext.state===wordTrails,
     previewValid:resultPreview.valid,
     previewReadonly:resultPreview.liveWordTrailsExcluded,
     mixedBackupRejected:/protected LIVE/.test(rejected),
     before,after
    };
   },{TEST,LIVE,wordTrails,fakeLive,OLD});
   assert(result.load.includes('native-backup-crash-guard-v30'),
    'Published TEST root must load cache-busted protected save coordinator');
   assert(result.banner.includes('native-backup-safety-v30'),
    'Published TEST root must load newest Visual Lab banner');
   assert(result.bound&&result.originalSettings&&result.realNativeExport&&result.realNativeImport);
   assert(!result.liveInExport,'Published TEST backup must not contain LIVE crossword progress');
   assert.equal(result.testBackupFormat,'WordTrailsNextTEST');
   assert.equal(result.testStateMatches,true);
   assert(result.previewValid&&result.previewReadonly&&result.mixedBackupRejected);
   assert.deepEqual(result.before,result.after,'Published native preview must not touch saved data');
   assert.equal(result.before.live,fakeLive,'Synthetic LIVE save should remain byte-for-byte unchanged');
   assert.deepEqual(errors,[],'Published browser must not throw errors');
   // Reopen the ACTUAL PUBLISHED TEST root with a deliberately interrupted
   // previous-only v2 journal. Cold startup must not silently rewind a
   // newer wallet or TEST crossword, even though the old source did so.
   const syntheticWallet=JSON.stringify({coins:98765,points:-22,
    purchases:['seawheel'],equippedWheel:'seawheel'});
   const interrupted=JSON.stringify({version:1,
    previous:{'bible-unfolded-rewards-v17':JSON.stringify({coins:6,points:0}),
      [TEST]:JSON.stringify({...JSON.parse(wordTrails),coins:2})},
    createdAt:'2026-11-13T19:10:00Z'});
   await page.evaluate(({wallet,journal,TEST,wordTrails,LIVE,fakeLive,OLD})=>{
    localStorage.setItem('bible-unfolded-rewards-v17',wallet);
    localStorage.setItem(TEST,wordTrails);
    localStorage.setItem(LIVE,fakeLive);
    localStorage.setItem(OLD,journal);
   },{wallet:syntheticWallet,journal:interrupted,TEST,wordTrails,LIVE,fakeLive,OLD});
   await page.reload({waitUntil:'domcontentloaded',timeout:120000});
   await page.waitForFunction(()=>window.BUPlatformSaves?.bound?.(),{timeout:90000});
   const cold=await page.evaluate(({OLD,TEST,LIVE})=>({
    wallet:localStorage.getItem('bible-unfolded-rewards-v17'),
    trail:localStorage.getItem(TEST),
    live:localStorage.getItem(LIVE),
    journal:localStorage.getItem(OLD),
    notice:document.getElementById('bu-wt-save-status')?.textContent||'',
    review:window.BUPlatformSaves.recoverPending().needsManualReview
   }),{OLD,TEST,LIVE});
   // This is the REAL game: an ordinary daily login may award native Points
   // or Insight Tokens and normalize the wallet shape on startup. That is
   // distinct from the old journal restoring a much smaller BEFORE wallet.
   // Require the newer balances and paid ownership NOT to be reduced, while
   // independently requiring the unfinished journal to remain quarantined.
   const restoredWallet=JSON.parse(cold.wallet||'null');
   assert(restoredWallet&&restoredWallet.coins>=98765,
    'Cold TEST startup lost the newer native Insight Token balance');
   assert(restoredWallet.points>=-22,'Cold TEST startup lost newer native Points');
   assert(restoredWallet.purchases?.includes('seawheel'),'Owned wheel vanished after cold restart');
   assert.equal(cold.trail,wordTrails,'Cold TEST startup rewound crossword progress');
   assert.equal(cold.live,fakeLive,'Cold TEST startup touched LIVE progress');
   assert.equal(cold.journal,interrupted,'Cold startup deleted the journal needed for manual review');
   assert(cold.review===true&&cold.notice.includes('Backup recovery needs review'),
    'Native Settings must disclose unfinished restore needing review');
   assert.deepEqual(errors,[],'Published browser must not throw errors after cold recovery probe');
   console.log('PASS_PUBLISHED_TEST_NATIVE_BACKUP_CRASH_GUARD_V30',JSON.stringify({
    viewport:width+'x'+height,
    cacheBustedNativeLoader:true,
    originalSettingsControls:true,
    liveKeyExcludedFromExport:true,
    contaminatedImportRejected:true,
    previewReadonly:true,
    fakeLiveSaveUnchanged:true,
    coldOldJournalQuarantined:true,
    fictionalNewWalletPreserved:true,
    nativeSettingsRecoveryWarningShown:true,
    simulatedBrowserOnly:true,pageErrors:0
   }));
   await context.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error('FAIL_PUBLISHED_TEST_NATIVE_BACKUP_ISOLATION_V28',e.stack||e);process.exitCode=1});

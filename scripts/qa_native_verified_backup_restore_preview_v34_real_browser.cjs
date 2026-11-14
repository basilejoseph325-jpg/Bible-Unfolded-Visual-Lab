#!/usr/bin/env node
'use strict';
/* v34 mobile Chromium test of actual native Settings read-only v34
 * backup file inputs. All saved data is fictional in fresh browser
 * contexts. Can run on localhost or on PUBLIC TEST only, never LIVE.
 */
const assert=require('node:assert/strict'),puppeteer=require('puppeteer-core');
const {execSync}=require('node:child_process');
const chrome=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const ROOT=process.env.BU_TEST_ORIGIN||'http://127.0.0.1:8897';
const LIVE='bible-unfolded-word-trails-next-v1';
const W='bible-unfolded-rewards-v17',WB='bible-unfolded-rewards-v17-recovery-v3811';
const OW='bible-unfolded-wheel-ownership-v3825';
const T='bu-visual-lab-wordtrails-next-v1',FEEL='bu-wt-next-feel-v2',J='bu-visual-lab-import-rollback-v2';
const wallet=JSON.stringify({coins:807,points:-10,purchases:['seawheel'],equippedWheel:'seawheel',
 lastDay:new Date().toISOString().slice(0,10),streak:1});
const incomingWallet=JSON.stringify({coins:29,points:-70,purchases:['goldwheel'],equippedWheel:'goldwheel'});
const trail=JSON.stringify({level:1,unlocked:3,coins:81,points:30,completed:[0],sparks:[],
 claimedSparks:[],boardBible:[],paidWords:[],paidBonuses:[],claimedFreeHints:[],
 progress:{level:1,found:['ELI'],bonuses:[],hinted:[],combo:1}});
const incomingTrail=JSON.stringify({...JSON.parse(trail),level:2,unlocked:4,coins:14,completed:[0,1]});
const live=JSON.stringify({level:17,unlocked:20,coins:200,completed:[0,1,2]});
async function choose(page,id,doc){
 await page.evaluate(({id,doc})=>{
  const inp=document.getElementById(id);
  if(!inp)throw Error('Settings v34 file picker missing: '+id);
  const s=JSON.stringify(doc);
  const dt=new DataTransfer();
  dt.items.add(new File([s],'synthetic-BibleUnfolded-TEST.json',{type:'application/json'}));
  inp.files=dt.files;
  inp.dispatchEvent(new Event('change',{bubbles:true}));
 },{id,doc});
 await page.waitForFunction(()=>!document.getElementById('bu-wt-current-copy-picker-v34')?.value&&
   !document.getElementById('bu-wt-candidate-preview-picker-v34')?.value,
   {timeout:20000});
 return page.evaluate(()=>document.getElementById('bu-wt-safe-preview-message-v34')?.textContent||'');
}
(async()=>{
 const browser=await puppeteer.launch({headless:true,executablePath:chrome,timeout:90000,
  protocolTimeout:120000,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--disable-gpu']});
 try{
  for(const [width,height] of [[390,705],[320,568]]){
   const context=await browser.createBrowserContext();
   const a=await context.newPage(),errors=[];
   await a.bringToFront();
   a.on('pageerror',e=>errors.push(e.message));
   await a.setViewport({width,height,isMobile:true,hasTouch:true,deviceScaleFactor:2});
   await a.goto(ROOT+'/index.html?qa-safe-preview-v34='+width,
    {waitUntil:'domcontentloaded',timeout:120000});
   await a.waitForFunction(()=>window.BUPlatformSaves?.bound?.()&&
    typeof window.BUPlatformSaves?.verifyCurrentBackupCopy==='function'&&
    !!document.getElementById('bu-wt-safe-preview-v34'),{timeout:90000});
   const source=await a.evaluate(()=>document.getElementById('bu-platform-save-core-v2')?.src||'');
   assert(source.includes('native-import-paused-v35'),
    'TEST Settings did not load the latest v35 source retaining the original v34 readonly preview');
   const test=await a.evaluate(({LIVE,W,WB,OW,T,FEEL,wallet,trail,live})=>{
    localStorage.setItem(W,wallet);localStorage.setItem(WB,wallet);
    localStorage.setItem(OW,JSON.stringify({version:1,owned:['seawheel']}));
    localStorage.setItem(T,trail);localStorage.setItem(FEEL,
      JSON.stringify({music:true,sfx:true,musicVolume:50,sfxVolume:35}));
    localStorage.setItem(LIVE,live);
    const api=window.BUPlatformSaves,original=api.makeBackup();
    const candidate=JSON.parse(JSON.stringify(original));
    candidate.keys[W]=JSON.stringify({coins:29,points:-70,
      purchases:['goldwheel'],equippedWheel:'goldwheel'});
    candidate.keys[WB]=candidate.keys[W];
    candidate.keys[OW]=JSON.stringify({version:1,owned:['goldwheel']});
    candidate.extensions.wordTrailsNext.state=JSON.stringify({
      ...JSON.parse(trail),level:2,unlocked:4,coins:14,completed:[0,1]});
    const panel=document.getElementById('bu-wt-safe-preview-v34');
    return {
     original,candidate,review:!!panel,buttonLabels:[...panel.querySelectorAll('button')].map(x=>x.textContent),
     saved:[W,WB,OW,T,LIVE].map(k=>localStorage.getItem(k)),
     userImport:!!document.getElementById('save-file'),
     verifyType:typeof api.verifyCurrentBackupCopy
    };
   },{LIVE,W,WB,OW,T,FEEL,wallet,trail,live});
   assert(test.review&&test.userImport&&test.verifyType==='function');
   assert.equal(test.buttonLabels.length,2);
   assert(test.buttonLabels.every(x=>!/\bapply\b|restore now/i.test(x)));
   assert.equal(test.original.keys[LIVE],undefined);
   const noVerification=await choose(a,'bu-wt-candidate-preview-picker-v34',test.candidate);
   assert(noVerification.includes('First verify your downloaded CURRENT TEST backup file'));
   const verified=await choose(a,'bu-wt-current-copy-picker-v34',test.original);
   assert(verified.includes('verified against saved game data now'),
    'Actual file input did not verify the exact native backup: '+verified);
   const summary=await choose(a,'bu-wt-candidate-preview-picker-v34',test.candidate);
   assert(summary.includes('READ-ONLY PREVIEW'),summary);
   assert(summary.includes('Current Insight Tokens: 807'),summary);
   assert(summary.includes('incoming: 29'),summary);
   assert(summary.includes('NO progress has been restored; apply is disabled.'),summary);
   const after=await a.evaluate(({W,WB,OW,T,LIVE,J})=>({
    saved:[W,WB,OW,T,LIVE].map(k=>localStorage.getItem(k)),
    journal:localStorage.getItem(J),
    panel:document.getElementById('bu-wt-safe-preview-v34')?.tagName,
    fileValues:[
      document.getElementById('bu-wt-current-copy-picker-v34')?.value,
      document.getElementById('bu-wt-candidate-preview-picker-v34')?.value]
   }),{W,WB,OW,T,LIVE,J});
   assert.deepEqual(after.saved,test.saved,'File-backed read-only preview mutated player progress');
   assert.equal(after.journal,null,'Review wrote an import journal');
   assert(after.fileValues.every(x=>!x));
   const unsafe=JSON.parse(JSON.stringify(test.candidate));
   unsafe.keys[LIVE]=JSON.stringify({level:0});
   const refused=await choose(a,'bu-wt-candidate-preview-picker-v34',unsafe);
   assert(refused.includes('protected LIVE Word Trails progress'),
    'Mixed old TEST/LIVE backup must not be previewed: '+refused);
   // Test stale-current-copy protection after a foreign same-origin writer.
   const b=await context.newPage();
   await b.bringToFront();
   await b.goto(ROOT+'/qa-blank-native-preview-second-tab-v34.html',
    {waitUntil:'domcontentloaded',timeout:30000});
   const newest=JSON.stringify({coins:932,points:1,purchases:['seawheel'],equippedWheel:'seawheel'});
   await b.evaluate(({W,newest})=>localStorage.setItem(W,newest),{W,newest});
   await a.bringToFront();
   await a.waitForFunction(()=>window.BUPlatformSaves?.externalChangeStatus()?.detected===true&&
    document.getElementById('bu-wt-safe-preview-message-v34')?.textContent.includes('Another page changed shared progress'),
    {timeout:45000});
   const blocked=await choose(a,'bu-wt-candidate-preview-picker-v34',test.candidate);
   assert(blocked.includes('First verify your downloaded CURRENT TEST backup file'),
    'Foreign wallet change failed to revoke the earlier file verification');
   const retained=await a.evaluate(({W,LIVE,J})=>({
    wallet:localStorage.getItem(W),live:localStorage.getItem(LIVE),journal:localStorage.getItem(J)
   }),{W,LIVE,J});
   assert.equal(retained.wallet,newest);
   assert.equal(retained.live,live);
   assert.equal(retained.journal,null);
   assert.deepEqual(errors,[],'Native TEST Settings v34 threw a JS error');
   console.log('PASS_TEST_VERIFIED_BACKUP_PREVIEW_V34_REAL_BROWSER',JSON.stringify({
    viewport:width+'x'+height,publishedTest:ROOT.startsWith('https://'),
    sourceVerified:true,originalSettingsKept:true,
    actualFilePickerVerifiedCurrentProgress:true,
    exactWalletAndTESTPreview:true,mixedLIVEBackupRejected:true,
    fakeOtherTabInvalidatedVerification:true,
    noProgressOrJournalWritesByPreview:true,
    noActualUserSaveAccessed:true,pageErrors:0
   }));
   await context.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error('FAIL_TEST_VERIFIED_BACKUP_PREVIEW_V34_REAL_BROWSER',e.stack||e);process.exitCode=1});

#!/usr/bin/env node
'use strict';
/* Tests a PRIVATE synthetic-data browser UI only. Never opens a player's
 * localStorage or LIVE website. Checks actual mock checkpoint download,
 * file-picker validation, explicit opt-in, guarded rollback and noninterference.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const puppeteer=require('puppeteer-core');
const {execSync}=require('node:child_process');
const executablePath=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const url=process.env.BU_WT_CHECKPOINT_REHEARSAL_URL||
 'http://127.0.0.1:8896/experiments/word-trails-checkpoint-rehearsal-v2.html';
const L='bible-unfolded-word-trails-next-v1';
const T='bu-visual-lab-wordtrails-next-v1';
const SAMPLE_NAME='Word_Trails_SAMPLE_Recovery_Checkpoint_v3.json';
const native={
 'bible-unfolded-rewards-v17':JSON.stringify({points:-900,coins:1483,purchases:['seawheel'],equippedWheel:'seawheel'}),
 'bible-unfolded-wheel-ownership-v3825-backup':JSON.stringify({owned:['seawheel']}),
 'bible-unfolded-private-voice-pref-v381':JSON.stringify({mode:'off'}),
 [L]:JSON.stringify({level:21,coins:3,completed:[0,1]}),
 [T]:JSON.stringify({level:23,coins:999}),
 'browser-storage-sentinel':'NEVER-CHANGE-ME'
};
const sorted=obj=>JSON.stringify(Object.entries(obj).sort((a,b)=>a[0].localeCompare(b[0])));
const temp='/tmp/bu-wt-checkpoint-rehearsal-v2';
fs.mkdirSync(temp,{recursive:true});
const checkpointPath=path.join(temp,'uploaded-synthetic-checkpoint.json');
const wrongPath=path.join(temp,'wrong-backup.json');
fs.writeFileSync(wrongPath,JSON.stringify({format:'BibleUnfoldedSave',version:2,keys:{}}));
(async()=>{
 const browser=await puppeteer.launch({headless:true,executablePath,args:[
  '--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--disable-gpu'],
  timeout:90000,protocolTimeout:120000});
 try{
 for(const [width,height] of [[390,705],[320,568]]){
  const ctx=await browser.createBrowserContext();
  const page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.setViewport({width,height,isMobile:true,hasTouch:true,deviceScaleFactor:2});
  await page.evaluateOnNewDocument(seed=>{
   for(const [k,v] of Object.entries(seed))localStorage.setItem(k,v);
  },native);
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>document.documentElement.dataset.wtCheckpointRehearsalReady==='yes',{timeout:30000});
  assert.equal(await page.$eval('#download',e=>e.disabled),false);
  assert.equal(await page.$eval('#saved',e=>e.disabled),true);
  assert.equal(await page.$eval('#transfer',e=>e.disabled),true);

  // Real downloads occur through the browser only; scripts do not claim the
  // file was actually saved before a user confirms it.
  const down=path.join(temp,'downloads-'+width);
  fs.mkdirSync(down,{recursive:true});
  const cdp=await page.createCDPSession();
  await cdp.send('Page.setDownloadBehavior',{behavior:'allow',downloadPath:down});
  await page.click('#download');
  const exported=await page.evaluate(()=>window.__BUWTCheckpointRehearsal.inspect().exported);
  assert(exported&&exported.length>200,'Checkpoint export must be complete JSON');
  const checkpoint=JSON.parse(exported);
  assert.equal(checkpoint.format,'BibleUnfoldedWordTrailsRecoveryCheckpoint');
  assert.equal(checkpoint.version,3);
  assert.equal(checkpoint.scope,'crossword-only');
  assert.equal(checkpoint.nativeWalletExcluded,true);
  assert.equal(checkpoint.currenciesExcluded,true);
  assert.equal(JSON.parse(checkpoint.expectedLiveRaw).coins,60);
  for(const key of ['bible-unfolded-rewards-v17','wheel-ownership','private-voice'])
   assert(!exported.includes(key),'Mock checkpoint must not contain shared records');
  await page.waitForFunction(()=>window.__BUWTCheckpointRehearsal.inspect().writes.length===0);
  let downloaded=false;
  for(let i=0;i<25;i++){
   const file=path.join(down,SAMPLE_NAME);
   if(fs.existsSync(file)&&fs.readFileSync(file,'utf8')===exported){downloaded=true;break}
   await new Promise(resolve=>setTimeout(resolve,160));
  }
  assert(downloaded,'Browser should actually save downloadable practice checkpoint file');
  fs.writeFileSync(checkpointPath,exported);

  await page.click('#decline');
  assert((await page.$eval('#transfer-result',e=>e.textContent)).includes('declined'));
  assert.equal((await page.evaluate(()=>window.__BUWTCheckpointRehearsal.inspect().writes.length)),0);
  await page.click('#saved');
  assert.equal(await page.$eval('#transfer',e=>e.disabled),true,'Checkbox for transfer consent required');
  await page.click('#approve');
  assert.equal(await page.$eval('#transfer',e=>e.disabled),false);
  await page.click('#transfer');
  await page.waitForFunction(()=>window.__BUWTCheckpointRehearsal.inspect().imported===true,{timeout:20000});
  let state=await page.evaluate(()=>window.__BUWTCheckpointRehearsal.inspect());
  assert.deepEqual(state.writes,['set:'+L]);
  assert.equal(state.sampleLive.completed.length,3);
  assert.equal(state.sampleLive.coins,60);
  assert.equal(state.sampleLive.points,0);
  assert(state.nativeUnchanged,'Native fake wallet/wheel/voice values unchanged');
  assert.equal(await page.$eval('#advance',e=>e.disabled),false);

  // Reject complete-backup file presented as Word Trails recovery.
  await (await page.$('#checkpoint-file')).uploadFile(wrongPath);
  await page.waitForFunction(()=>document.getElementById('file-status').textContent.includes('isn’t a valid'));
  assert.equal(await page.$eval('#recover',e=>e.disabled),true);

  await (await page.$('#checkpoint-file')).uploadFile(checkpointPath);
  await page.waitForFunction(()=>window.__BUWTCheckpointRehearsal.inspect().hasChosenFile===true);
  assert.equal(await page.$eval('#recover',e=>e.disabled),true,'Separate rollback consent required');
  await page.click('#recover-approve');
  assert.equal(await page.$eval('#recover',e=>e.disabled),false);

  await page.click('#advance');
  await page.click('#recover');
  await page.waitForFunction(()=>document.getElementById('recovery-result').textContent.includes('newer progress'));
  state=await page.evaluate(()=>window.__BUWTCheckpointRehearsal.inspect());
  assert.equal(state.sampleLive.completed.length,4);
  assert.equal(state.imported,true);
  assert.equal(state.nativeUnchanged,true);
  assert.equal(state.writes.length,1,'Blocked recovery must not delete saved puzzle');

  // Rehearse a fresh import, then successful recovery of ONLY unchanged state.
  await page.select('#scenario','ready');
  assert.equal(await page.$eval('#saved',e=>e.disabled),true,'New run resets previous consent');
  await page.click('#download');
  const again=await page.evaluate(()=>window.__BUWTCheckpointRehearsal.inspect().exported);
  fs.writeFileSync(checkpointPath,again);
  await page.click('#saved');await page.click('#approve');await page.click('#transfer');
  await page.waitForFunction(()=>window.__BUWTCheckpointRehearsal.inspect().imported===true);
  await (await page.$('#checkpoint-file')).uploadFile(checkpointPath);
  await page.waitForFunction(()=>window.__BUWTCheckpointRehearsal.inspect().hasChosenFile===true);
  await page.click('#recover-approve');await page.click('#recover');
  await page.waitForFunction(()=>document.getElementById('recovery-result').textContent.includes('Safe recovery complete'));
  state=await page.evaluate(()=>window.__BUWTCheckpointRehearsal.inspect());
  assert.equal(state.hasSampleLive,false);
  assert.equal(state.imported,false);
  assert.deepEqual(state.writes,['set:'+L,'remove:'+L]);
  assert.equal(JSON.parse(state.sampleTest).coins,1209);
  assert(state.nativeUnchanged);

  // Existing LIVE save and corrupt TEST source both disable transfer.
  await page.select('#scenario','existing');
  assert.equal(await page.$eval('#download',e=>e.disabled),true);
  assert.equal(await page.$eval('#transfer',e=>e.disabled),true);
  await page.select('#scenario','invalid');
  assert.equal(await page.$eval('#download',e=>e.disabled),true);
  await page.select('#scenario','changed');
  await page.click('#download');
  await page.click('#saved');await page.click('#approve');await page.click('#transfer');
  await page.waitForFunction(()=>document.getElementById('transfer-result').textContent.includes('changed'));
  assert.equal((await page.evaluate(()=>window.__BUWTCheckpointRehearsal.inspect().writes.length)),0);

  const final=await page.evaluate(()=>({
   storage:Object.fromEntries(Array.from({length:localStorage.length},(_,i)=>localStorage.key(i))
    .map(k=>[k,localStorage.getItem(k)])),
   overflow:document.documentElement.scrollWidth>window.innerWidth+1,
   pageReady:document.documentElement.dataset.wtCheckpointRehearsalReady
  }));
  assert.equal(sorted(final.storage),sorted(native),
   'Real browser storage must remain byte-for-byte identical for all initial keys and values');
  assert.equal(final.overflow,false,'No horizontal overflow in narrow mobile viewport');
  assert.equal(final.pageReady,'yes');
  assert.deepEqual(errors,[],'No JS errors during rehearsal');
  if(width===390)await page.screenshot({path:'/tmp/BU-WT-CHECKPOINT-REHEARSAL-V2-390.png',fullPage:true});
  console.log('PASS_WORD_TRAILS_CHECKPOINT_REHEARSAL_V2',JSON.stringify({
   viewport:width+'x'+height,realDownloadSaved:true,
   refusedWithoutConsent:true,refusedWrongBackup:true,
   newerProgressProtected:true,guardedRollbackSucceeded:true,
   existingLiveAndCorruptTestBlocked:true,stalePreviewRejected:true,
   allRealBrowserSavesUnchanged:true,noHorizontalOverflow:true,pageErrors:0
  }));
  await ctx.close();
 }
 }finally{await browser.close()}
})().catch(e=>{console.error('FAIL_WORD_TRAILS_CHECKPOINT_REHEARSAL_V2',e.stack||e);process.exitCode=1});

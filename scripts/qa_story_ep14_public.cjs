#!/usr/bin/env node
'use strict';
// Ordinary Visual Lab TEST home entry, after Samsung acceptance of isolated G14 preview.
// Synthetic Chromium profiles. Physical iPhone acceptance remains outstanding.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const cp=require('node:child_process');
const puppeteer=require('puppeteer-core');
const CHROME=process.env.CHROME_BIN||cp.execSync('command -v chromium || command -v google-chrome',{encoding:'utf8'}).trim();
const BASE=process.env.STORY_URL||'http://127.0.0.1:8893/index.html';
const TEST_PARENT='e5e2de28b6ea6531f049ddc2d40111afed93fa3f';
const event=process.env.GITHUB_EVENT_PATH&&fs.existsSync(process.env.GITHUB_EVENT_PATH)?JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH,'utf8')):{};
const parents=cp.execFileSync('git',['rev-list','--parents','-n','1','HEAD'],{encoding:'utf8'}).trim().split(' ');
const baseline=event.pull_request&&parents.length>=3?parents[1]:TEST_PARENT;
const modified=cp.execFileSync('git',['diff','--name-only',baseline],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
const allowed=new Set([
 'journey-progress-caption.js',
 'story-adventure-episode14-integration-test.js',
 'scripts/qa_genesis13_public_integration.cjs',
 'scripts/qa_genesis13_integration_boundaries.cjs',
 'scripts/qa_genesis12_native.cjs',
 'scripts/qa_genesis11_complete_native_playpath_v1.cjs',
 'scripts/qa_story_adventure_release.cjs',
 'scripts/qa_story_ep14_public.cjs',
 '.github/workflows/qa-genesis14-public-test.yml'
]);
const crossMode=process.env.BU_SCOPE_MODE==='cross-mode'||(!!event.pull_request&&modified.some(f=>f==='experiments/bu-test-native-storage-fence-v1.js'||/^family-worship-gathering-v1\./.test(f)));
if(!crossMode){
 for(const file of modified)assert(allowed.has(file),'Unrelated TEST file changed: '+file);
 console.log('PASS_G14_PUBLIC_EXACT_CHANGE_ALLOWLIST',JSON.stringify(modified));
}else{
 const ref=event.pull_request?baseline:(process.env.BU_SCOPE_BASE||'origin/main');
 const files=cp.execFileSync('git',['ls-tree','-r','--name-only',ref],{encoding:'utf8'}).trim().split('\n').filter(f=>/^story-adventure-(?:art\/genesis14\/|content\/genesis-episode14-|episode14-)/.test(f)||/^bible_unfolded_core_part\d\.js$/.test(f)||/\.(mp3|wav|ogg|m4a)$/.test(f));
 assert(files.length>20,'Missing protected Genesis baseline');
 for(const file of files)assert.equal(cp.execFileSync('git',['hash-object',file],{encoding:'utf8'}).trim(),cp.execFileSync('git',['rev-parse',ref+':'+file],{encoding:'utf8'}).trim(),'Cross-mode PR changed protected Episode 14/audio: '+file);
 console.log('PASS_G14_CROSS_MODE_IMMUTABLE_CHAPTER',files.length);
}
(async()=>{
 const browser=await puppeteer.launch({headless:true,executablePath:CHROME,args:['--no-sandbox','--disable-dev-shm-usage'],protocolTimeout:120000});
 try{
  for(const [width,height] of [[320,568],[430,932]]){
   const context=await browser.createBrowserContext();
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(String(e.message)));
   page.on('response',r=>{
    if(r.status()>=400&&(/genesis14|episode14/i).test(r.url()))errors.push('HTTP '+r.status()+' '+r.url());
   });
   await page.setViewport({width,height,isMobile:true,hasTouch:true,deviceScaleFactor:1});
   await page.goto(BASE,{waitUntil:'load',timeout:120000});
   await page.waitForFunction(()=>['ready','failed'].includes(window.BUStoryGenesis14Test?.status),{timeout:90000});
   assert.equal(await page.evaluate(()=>window.BUStoryGenesis14Test.status),'ready');
   const registered=await page.evaluate(()=>({
    count:BU_GENESIS_IDS.length,chapter:!!BU3857_DATA.genesis_ep14,
    last:BU_GENESIS_IDS.at(-1),
    scenes:Object.keys(window.BUStoryGenesis14Test.artwork||{}).length,
    allImagesLoaded:Object.values(window.BUStoryGenesis14Test.artwork||{}).every(a=>a.approved&&a.available),
    publicLoader:!!document.getElementById('bu-story-genesis14-native-loader'),
    previewLoader:!!document.getElementById('bu-genesis14-isolated-preview'),
    oldReady:window.BUStoryGenesis13Test?.status
   }));
   assert.deepEqual(registered,{count:8,chapter:true,last:'genesis_ep14',scenes:12,allImagesLoaded:true,publicLoader:true,previewLoader:false,oldReady:'ready'});
   await page.evaluate(()=>{document.getElementById('daily-close')?.click();openEpisodes('genesis');});
   assert(await page.$('[data-genesis14]'),'Episode 14 card missing from regular Genesis menu');
   assert.equal(await page.$eval('[data-genesis14]',b=>b.classList.contains('available')),false);
   assert((await page.$eval('[data-genesis14]',b=>b.textContent)).includes('COMPLETE EPISODE 13'),'Wrong predecessor card');
   assert.equal(await page.evaluate(()=>bu3857Open('genesis_ep14')),false,'Direct access bypasses chapter lock');
   assert.notEqual(await page.evaluate(()=>bu3857State?.book),'genesis_ep14');
   // The save fixture is durable and unrelated keys survive the episode registration.
   await page.evaluate(()=>{
    localStorage.setItem('g14-test-unrelated-fixture','preserve');
    completedChapters.genesis_ep13=true;persistUnified();makeEpisodes();
   });
   assert(await page.$eval('[data-genesis14]',b=>b.classList.contains('available')),'Episode 13 completion did not unlock 14');
   await page.$eval('[data-genesis14]',b=>b.click());
   assert.equal(await page.evaluate(()=>bu3857State.book),'genesis_ep14');
   assert.equal(await page.$eval('#bu3857-episode',e=>e.textContent),'GENESIS · EPISODE 14');
   await page.waitForFunction(()=>{const i=document.querySelector('[data-bu-genesis14-scene="g14-d01"] img');return i?.naturalWidth===640&&i.naturalHeight===360;},{timeout:15000});
   // Save/resume and the established refresh-to-Home rule.
   await page.evaluate(()=>{bu3857State.step=4;bu3857Save();focusHome();});
   await page.reload({waitUntil:'load',timeout:120000});
   await page.waitForFunction(()=>window.BUStoryGenesis14Test?.status==='ready',{timeout:90000});
   assert(await page.$eval('#home',el=>!el.hidden),'Refresh did not return Home');
   assert.equal(await page.evaluate(()=>localStorage.getItem('g14-test-unrelated-fixture')),'preserve');
   await page.evaluate(()=>bu3857Open('genesis_ep14'));
   assert.equal(await page.evaluate(()=>bu3857State.step),4,'Saved discovery did not resume');
   // Completion of Episode 13 routes to the registered public Chapter 14.
   await page.evaluate(()=>{
    completedChapters.genesis_ep12=true;completedChapters.genesis_ep13=true;
    bu3857Saved.genesis_ep13={step:11,complete:true,solved:{},hints:{},revealed:{},work:{}};
    bu3857Open('genesis_ep13');
   });
   assert(await page.$('#bu3857-next-episode'),'Episode 13 ending has no next chapter');
   assert((await page.$eval('#bu3857-next-episode',b=>b.textContent)).includes('Next Genesis Episode'));
   await page.$eval('#bu3857-next-episode',b=>b.click());
   assert.equal(await page.evaluate(()=>bu3857State.book),'genesis_ep14','Episode 13 -> 14 failed');
   // The regular game must use Jacob's grief artwork in both finale slots.
   await page.evaluate(()=>{bu3857State.complete=true;bu3857Render();});
   await page.waitForFunction(()=>document.querySelector('.bu-story-finale-cinematic-photo')?.getAttribute('src')==='story-adventure-art/genesis14/g14-d12.webp',{timeout:15000});
   assert((await page.$eval('.bu-story-finale-atmosphere-art',e=>e.style.backgroundImage)).includes('g14-d12.webp'));
   assert.deepEqual(errors,[],'Unexpected JS/resource errors on ordinary TEST entry');
   console.log('PASS_REGULAR_TEST_EP14',width,height,'menu-lock-unlock,art12,save,home,ep13-next,finale');
   // The isolated preview remains separate, even after the public TEST addition.
   await page.goto(new URL('genesis-episode14-preview.html',BASE).href,{waitUntil:'load',timeout:120000});
   const game=page.frames().find(f=>f.url().includes('index.html'));
   assert(game,'Isolated preview frame missing');
   await game.waitForFunction(()=>window.BUStoryGenesis14Test?.status==='ready',{timeout:90000});
   const separate=await game.evaluate(()=>({
    publicLoader:!!document.getElementById('bu-story-genesis14-native-loader'),
    previewLoader:!!document.getElementById('bu-genesis14-isolated-preview'),
    count:BU_GENESIS_IDS.length
   }));
   assert.deepEqual(separate,{publicLoader:false,previewLoader:true,count:8});
   assert.deepEqual(errors,[],'Unexpected errors on isolated preview');
   await context.close();
  }
  console.log('PASS_EPISODE14_REGULAR_TEST_INTEGRATION_AND_PREVIEW_ISOLATION');
 }finally{await browser.close();}
})().catch(err=>{console.error(err.stack||err);process.exitCode=1});

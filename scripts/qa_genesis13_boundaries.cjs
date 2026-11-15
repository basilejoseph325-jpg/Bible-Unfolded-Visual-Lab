#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),cp=require('node:child_process'),p=require('puppeteer-core'),vm=require('node:vm');
const BASE='1bf5e1b8a30972886ac3b3aec25c14c7ef34888c';
const allowed=new Set(['genesis-episode13-preview.html','story-adventure-content/genesis-episode13-bethel-v1.json','story-adventure-content/genesis-episode13-native-preview.js','scripts/qa_genesis13_content_candidate.cjs','scripts/qa_genesis13_native_preview.cjs','scripts/qa_genesis13_boundaries.cjs','.github/workflows/qa-genesis13-dev.yml','docs/GENESIS_EPISODE13_CANDIDATE.md']);
const changed=cp.execFileSync('git',['diff','--name-only',BASE,'HEAD'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);for(const f of changed)assert(allowed.has(f),'Out-of-scope file changed: '+f);
const protectedFiles=['index.html','journey-progress-caption.js','story-chapter-complete-v2-test.js','story-adventure-episode12-integration-test.js','story-adventure-content/genesis-episode12-return-to-esau-v1.json',...Array.from({length:5},(_,i)=>'bible_unfolded_core_part'+(i+1)+'.js')];
for(const f of protectedFiles)assert.equal(fs.readFileSync(f,'utf8'),cp.execFileSync('git',['show',BASE+':'+f],{encoding:'utf8',maxBuffer:40000000}),f+' differs from inspected TEST main');
new vm.Script(fs.readFileSync('story-adventure-content/genesis-episode13-native-preview.js','utf8'));
const html=fs.readFileSync('genesis-episode13-preview.html','utf8');for(const s of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(s[1]);
(async()=>{const browser=await p.launch({headless:true,executablePath:process.env.CHROME_BIN||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});try{
const base=process.env.STORY_URL||'http://127.0.0.1:8893/index.html',snapshots=[];
for(const preview of [false,true]){
 const context=await browser.createBrowserContext(),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});await page.goto(preview?new URL('genesis-episode13-preview.html',base).href:base,{waitUntil:'load',timeout:120000});
 const game=preview?page.frames().find(f=>f.url().includes('/index.html')):page;
 if(preview)await game.waitForFunction(()=>window.BUGenesis13DevPreview?.status==='ready',{timeout:60000});
 else await game.waitForFunction(()=>window.BUStoryGenesis12Test?.discoveryCount===13,{timeout:60000});
 await game.evaluate(()=>document.getElementById('daily-close')?.click());
 const snap=await game.evaluate(()=>{openEpisodes('genesis');const chapters=[...document.querySelectorAll('#episode-list [data-episode]')].map(b=>({title:b.querySelector('strong')?.textContent,available:b.classList.contains('available')}));openJourney();return {chapters,ids:BU_GENESIS_IDS.slice(),journey:document.getElementById('journey-progress-label').textContent,ep12:JSON.stringify(BU3857_DATA.genesis_ep12),words12:JSON.stringify(Object.fromEntries(Object.entries(BU_HQ_WORDS).filter(([k])=>k.startsWith('g12-d'))))}});await game.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));snap.journey=await game.$eval('#journey-progress-label',e=>e.textContent);snapshots.push(snap);
 if(!preview){assert.equal(await game.evaluate(()=>typeof BU3857_DATA.genesis_ep13),'undefined');assert.equal(await game.evaluate(()=>typeof window.BUGenesis13DevPreview),'undefined');}
 else{
  assert(!snap.ids.includes('genesis_ep13'));assert.equal(snap.chapters.length,12);assert.equal(snap.chapters[11].available,false);
  await game.evaluate(()=>{completedChapters.genesis_ep13=true;updateJourney();});await game.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));assert.equal(await game.$eval('#journey-progress-label',e=>e.textContent),snap.journey,'Preview completion changed public progress');
  await game.evaluate(()=>openEpisodes('exodus'));assert(!(await game.$('[data-bu-genesis13-dev]')),'Genesis dev card leaked into Exodus');
  // Additional layout-only shapes requested by the repository's phone QA standard.
  for(const [w,h] of [[320,640],[430,932]]){
   await page.setViewport({width:w,height:h,isMobile:true,hasTouch:true});
   await game.evaluate(()=>bu3857Open('genesis_ep13',true));
   for(let i=0;i<12;i++){
    await game.evaluate(i=>{bu3857State.step=i;bu3857Render()},i);
    await game.waitForFunction(()=>{const r=document.getElementById('buhq-wheel').getBoundingClientRect();return r.bottom<=innerHeight+1&&r.right<=innerWidth+1},{timeout:10000});
    const fit=await game.evaluate(()=>{const r=document.getElementById('buhq-wheel').getBoundingClientRect();return {left:r.left,top:r.top,scroll:document.documentElement.scrollWidth>innerWidth+1}});
    assert(fit.left>=-1&&fit.top>=0&&!fit.scroll,'Additional layout overflow '+w+' '+i);
   }
  }
  await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
  // Both the actual Back button and finale Chapters must route to Genesis.
  await game.evaluate(()=>bu3857Open('genesis_ep13',true));await game.$eval('#bu3857-back',b=>b.click());assert.equal(await game.evaluate(()=>bu3854EpisodeBook),'genesis');assert(await game.$('[data-bu-genesis13-dev]'));
  await game.evaluate(()=>{bu3857Open('genesis_ep13',true);bu3857State.complete=true;bu3857Render()});await game.waitForSelector('#bu-story-finale-chapters');await game.$eval('#bu-story-finale-chapters',b=>b.click());assert.equal(await game.evaluate(()=>bu3854EpisodeBook),'genesis');assert(await game.$('[data-bu-genesis13-dev]'));
  await game.evaluate(()=>{bu3857Open('genesis_ep13');bu3857State.complete=true;bu3857Render()});await game.$eval('#bu3857-next-episode',b=>b.click());assert.equal(await game.evaluate(()=>bu3854EpisodeBook),'genesis');
  // Exercise existing Episode 12 while the isolated adapter is present.
  await game.evaluate(()=>{bu3857Open('genesis_ep12',true);economy.coins=100;saveEconomy();document.getElementById('bu3857-hint').click()});
  for(const balance of [100,85,60]){assert.equal(await game.evaluate(()=>economy.coins),balance);if(balance!==60)await game.$eval('#bu3864-modal-layer .gold-button',b=>b.click());}
  assert.equal(await game.evaluate(()=>buHQHintLetters['g12-d01']),0);await game.evaluate(()=>document.getElementById('bu3864-modal-layer').buClose());
  const image=await game.$eval('#bu3857-content figure img',e=>e.getAttribute('src'));assert.equal(image,'story-adventure-art/genesis12/g12-d01.webp');
  await game.evaluate(()=>{const used=new Set();for(const c of BU_HQ_WORDS['g12-d01'].answer){const b=[...document.querySelectorAll('[data-buhq]')].find(b=>b.textContent===c&&!used.has(b));used.add(b);b.click();}});await game.waitForFunction(()=>!!bu3857State.solved['g12-d01']);assert.equal(await game.evaluate(()=>bu3857State.book),'genesis_ep12');
 }
 assert.deepEqual(errors,[]);await context.close();
}
assert.deepEqual(snapshots[1],snapshots[0],'Episode 13 adapter changed existing catalog, locks, Journey or Episode 12 content');
console.log('PASS_GENESIS13_BOUNDARIES',JSON.stringify({base:BASE,sharedFilesUnchanged:protectedFiles.length,changedFilesConfinedToEpisode13:true,normalEntryNotRegistered:true,publicEpisodeCount:12,additionalLayoutViewports:['320x640','430x932'],additionalLayoutScenes:24,journeyLocksUnchanged:true,genesis12DataAndWordsUnchanged:true,episode12PlayableWithAdapter:true,backAndChaptersReturnGenesis:true,wordTrailsFilesUntouched:true,physicalDevices:false}));
}finally{await browser.close()}})().catch(e=>{console.error(e.stack||e);process.exitCode=1});

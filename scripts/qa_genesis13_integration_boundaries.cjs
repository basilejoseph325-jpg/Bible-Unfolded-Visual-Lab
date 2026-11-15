#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),cp=require('node:child_process'),crypto=require('node:crypto'),p=require('puppeteer-core');
const event=process.env.GITHUB_EVENT_PATH?JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH)):{};
const baseline=event.pull_request?.base?.sha||'14bdc2b',head=event.pull_request?.head?.sha||'HEAD';
// PR checkout is a synthetic merge commit. Its first parent is the REAL current
// TEST base, which may be newer than the base.sha recorded when this PR opened.
// Compare protected assets against that parent, not an obsolete PR-base SHA.
const parents=cp.execFileSync('git',['rev-list','--parents','-n','1','HEAD'],{encoding:'utf8'}).trim().split(' ');
const protectedBase=event.pull_request&&parents.length>=3?parents[1]:baseline;
const allowed=new Set(['index.html','journey-progress-caption.js','story-chapter-complete-v2-test.js','story-adventure-episode13-integration-test.js','story-adventure-content/genesis-episode13-bethel-v1.json','story-adventure-art/genesis13/manifest.json','scripts/qa_genesis13_content_candidate.cjs','scripts/qa_genesis13_public_integration.cjs','scripts/qa_genesis13_integration_boundaries.cjs','scripts/qa_genesis12_native.cjs','scripts/qa_genesis11_complete_native_playpath_v1.cjs','scripts/qa_story_adventure_release.cjs','.github/workflows/qa-genesis13-test-integration.yml','.github/workflows/qa-story-adventure-candidate.yml','docs/GENESIS13_TEST_INTEGRATION.md']);
for(const f of cp.execFileSync('git',['diff','--name-only',baseline+'...'+head],{encoding:'utf8'}).trim().split('\n').filter(Boolean))assert(allowed.has(f),'Unrelated file changed: '+f);
const original=f=>cp.execFileSync('git',['show',baseline+':'+f],{encoding:'utf8',maxBuffer:40000000});
const tree=cp.execFileSync('git',['ls-tree','-r','--name-only',protectedBase],{encoding:'utf8'}).trim().split('\n');
const protectedFiles=tree.filter(f=>/word[-_]trails/i.test(f)||/\.(mp3|wav|ogg|m4a)$/i.test(f)||/^bible_unfolded_core_part\d\.js$/.test(f)||['premium-sfx.js','bu-platform-rewards-v1.js','bu-platform-saves-v2.js','story-adventure-episode12-integration-test.js','story-adventure-content/genesis-episode12-return-to-esau-v1.json'].includes(f));
for(const f of protectedFiles)assert.equal(cp.execFileSync('git',['hash-object',f],{encoding:'utf8'}).trim(),cp.execFileSync('git',['rev-parse',protectedBase+':'+f],{encoding:'utf8'}).trim(),'Protected file changed: '+f);
const oldHtml=original('index.html'),html=fs.readFileSync('index.html','utf8');assert.equal(html.replace('journey-progress-caption.js?v=20261115-genesis13-integration-v1','journey-progress-caption.js?v=20261114-books-chrome-route-v4'),oldHtml,'HTML changed beyond loader cache token');
assert(fs.readFileSync('journey-progress-caption.js','utf8').startsWith(original('journey-progress-caption.js')),'Existing loader content changed');
const manifest=JSON.parse(fs.readFileSync('story-adventure-art/genesis13/manifest.json'));
assert.equal(Object.keys(manifest.scenes).length,12);for(let i=1;i<=12;i++){const id='g13-d'+String(i).padStart(2,'0');assert.equal(manifest.scenes[id].path,'story-adventure-art/genesis13/'+id+'.webp');assert.equal(typeof manifest.scenes[id].approved,'boolean');if(manifest.scenes[id].approved)assert(fs.existsSync(manifest.scenes[id].path),'Approved image absent from checkout');}
assert.deepEqual(manifest.ending,{heroDiscovery:'g13-d09',backgroundDiscovery:'g13-d09',caption:'An altar at Bethel'});
const source=fs.readFileSync('story-adventure-content/genesis-episode13-bethel-v1.json');
// Compare with the validated PR #28 package, without importing its branch history.
assert.equal(crypto.createHash('sha256').update(source).digest('hex'),'c77fae34a1996ce829674b0ad568a6c905c3a5d115c1f858cd765fe15a05c229','Validated PR #28 content changed');
(async()=>{const browser=await p.launch({headless:true,executablePath:process.env.CHROME_BIN||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});try{
const base=process.env.STORY_URL||'http://127.0.0.1:8893/index.html';
for(const artMode of ['pending','approved-fixture','missing-approved-fixture']){
 const context=await browser.createBrowserContext(),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewport({width:320,height:568,isMobile:true,hasTouch:true});
 if(artMode!=='pending'){
  await page.setRequestInterception(true);page.on('request',r=>{
   const path=new URL(r.url()).pathname;
   if(path.endsWith('/genesis13/manifest.json')){const fixture=JSON.parse(JSON.stringify(manifest));fixture.scenes['g13-d09'].approved=true;return r.respond({status:200,contentType:'application/json',body:JSON.stringify(fixture)});}
   if(path.endsWith('/genesis13/g13-d09.webp'))return r.respond(artMode==='approved-fixture'?{status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="640" height="360" fill="#173943"/><text x="20" y="180" fill="white">QA ROUTING FIXTURE - NOT APPROVED ARTWORK</text></svg>'}:{status:404,contentType:'text/plain',body:'Synthetic missing-image test'});
   r.continue();
  });
 }
 await page.goto(base,{waitUntil:'load',timeout:120000});await page.waitForFunction(()=>window.BUStoryGenesis13Test?.status==='ready',{timeout:60000});await page.evaluate(()=>document.getElementById('daily-close')?.click());
 const card=await page.evaluate(()=>{openEpisodes('genesis');return {cards:document.querySelectorAll('[data-episode]').length,available:document.querySelector('[data-genesis13]').classList.contains('available'),ids:BU_GENESIS_IDS.slice()}});assert.equal(card.cards,13);assert.equal(card.available,false);assert.equal(card.ids.length,7);
 await page.evaluate(()=>openEpisodes('exodus'));assert(!(await page.$('[data-genesis13]')));
 await page.evaluate(()=>{openJourney();});await page.waitForFunction(()=>document.getElementById('journey-progress-label').textContent.includes('of 13'));
 assert(await page.$eval('#journey-stops [data-stop="1"]',e=>!e.classList.contains('open')),'First-six lock altered');assert(await page.$eval('#journey-stops [data-stop="2"]',e=>!e.classList.contains('open')),'Exodus Journey lock altered');
 await page.evaluate(()=>{completedChapters.genesis_ep12=true;persistUnified();openEpisodes('genesis');document.querySelector('[data-genesis13]').click()});assert.equal(await page.evaluate(()=>bu3857State.book),'genesis_ep13');
 await page.$eval('#bu3857-back',b=>b.click());assert.equal(await page.evaluate(()=>bu3854EpisodeBook),'genesis');
 if(artMode==='pending')for(const [width,height] of [[320,640],[430,932]]){
  await page.setViewport({width,height,isMobile:true,hasTouch:true});await page.evaluate(()=>bu3857Open('genesis_ep13',true));
  for(let i=0;i<12;i++){await page.evaluate(i=>{bu3857State.step=i;bu3857Render()},i);await page.waitForFunction(()=>{const r=document.getElementById('buhq-wheel').getBoundingClientRect();return r.bottom<=innerHeight+1&&r.right<=innerWidth+1},{timeout:10000});}
 }
 await page.setViewport({width:320,height:568,isMobile:true,hasTouch:true});
 await page.evaluate(()=>{bu3857Open('genesis_ep13',true);bu3857State.step=8;bu3857Render()});
 if(artMode==='approved-fixture')assert.equal(await page.$eval('[data-bu-genesis13-scene] img',e=>e.getAttribute('src')),manifest.scenes['g13-d09'].path);
 else assert((await page.$eval('[data-bu-genesis13-scene]',e=>e.textContent)).includes('illustration pending'));
 await page.evaluate(()=>{bu3857State.complete=true;bu3857Render()});await page.waitForSelector('.bu-story-finale-actions');
 if(artMode==='approved-fixture'){
  assert.equal(await page.$eval('.bu-story-finale-cinematic-photo',e=>e.getAttribute('src')),manifest.scenes['g13-d09'].path);
  assert((await page.$eval('.bu-story-finale-atmosphere-art',e=>e.style.backgroundImage)).includes(manifest.scenes['g13-d09'].path));
  assert.equal(await page.$eval('.bu-story-finale-scene-label',e=>e.textContent),'An altar at Bethel');assert(!(await page.$('[data-bu-genesis13-art-pending]')));
 }else{assert(await page.$('[data-bu-genesis13-art-pending]'));assert(!(await page.$('.bu-story-finale-cinematic-photo')));}
 await page.$eval('#bu-story-finale-chapters',b=>b.click());assert.equal(await page.evaluate(()=>bu3854EpisodeBook),'genesis');assert(await page.$('[data-genesis13]'));
 assert.deepEqual(errors,[]);console.log('PASS_G13_ART_AND_NAVIGATION',artMode);await context.close();
}
// Slow content fetch must update an already visible Episode 12 ending / Journey.
for(const view of ['episode12-ending','journey']){
 const context=await browser.createBrowserContext(),page=await context.newPage();let release;
 const held=new Promise(r=>release=r);await page.setRequestInterception(true);
 page.on('request',async r=>{if(r.url().includes('genesis-episode13-bethel-v1.json'))await held;r.continue()});
 await page.goto(base,{waitUntil:'load',timeout:120000});await page.waitForFunction(()=>window.BUStoryGenesis12Test?.discoveryCount===13);
 await page.evaluate(view=>{document.getElementById('daily-close')?.click();if(view==='journey')openJourney();else{completedChapters.genesis_ep12=true;openEpisodes('genesis');bu3857Open('genesis_ep12');bu3857State.complete=true;bu3857Render()}},view);
 if(view==='episode12-ending')assert.equal(await page.$eval('#bu3857-next-episode',e=>e.textContent),'Return to Genesis →');
 release();await page.waitForFunction(()=>window.BUStoryGenesis13Test?.status==='ready');
 if(view==='episode12-ending'){assert.equal(await page.$eval('#bu3857-next-episode',e=>e.textContent),'Next Genesis Episode →');await page.$eval('#bu3857-next-episode',e=>e.click());assert.equal(await page.evaluate(()=>bu3857State.book),'genesis_ep13');}
 else assert((await page.$eval('#journey-progress-label',e=>e.textContent)).includes('of 13'));
 await context.close();console.log('PASS_G13_DELAYED_REGISTRATION',view);
}
console.log('PASS_GENESIS13_INTEGRATION_BOUNDARIES',JSON.stringify({baseline,protectedFilesUnchanged:protectedFiles.length,wordTrailsLevelsAudioCoinsAndTestsUnchanged:true,validatedContentUnchanged:true,preparedImagePaths:12,approvedImages:Object.values(manifest.scenes).filter(x=>x.approved).length,bethelEndingRouting:'g13-d09 for hero and background; tested with a labelled in-memory fixture only',missingApprovedAssetFallsBack:true,additionalLayouts:['320x640','430x932'],oldJourneyLocksPreserved:true,delayedRegistrationRefreshesVisibleViews:true,physicalDevices:false}));
}finally{await browser.close()}})().catch(e=>{console.error(e.stack||e);process.exitCode=1});

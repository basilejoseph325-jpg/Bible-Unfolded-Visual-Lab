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
const approvedArtPath=/^story-adventure-art\/genesis13\/g13-d(?:0[1-9]|1[0-2])\.webp$/;
for(const f of cp.execFileSync('git',['diff','--name-only',baseline+'...'+head],{encoding:'utf8'}).trim().split('\n').filter(Boolean))assert(allowed.has(f)||approvedArtPath.test(f),'Unrelated file changed: '+f);
const original=f=>cp.execFileSync('git',['show',baseline+':'+f],{encoding:'utf8',maxBuffer:40000000});
const tree=cp.execFileSync('git',['ls-tree','-r','--name-only',protectedBase],{encoding:'utf8'}).trim().split('\n');
const protectedFiles=tree.filter(f=>/word[-_]trails/i.test(f)||/\.(mp3|wav|ogg|m4a)$/i.test(f)||/^bible_unfolded_core_part\d\.js$/.test(f)||['premium-sfx.js','bu-platform-rewards-v1.js','bu-platform-saves-v2.js','story-adventure-episode12-integration-test.js','story-adventure-content/genesis-episode12-return-to-esau-v1.json'].includes(f));
for(const f of protectedFiles)assert.equal(cp.execFileSync('git',['hash-object',f],{encoding:'utf8'}).trim(),cp.execFileSync('git',['rev-parse',protectedBase+':'+f],{encoding:'utf8'}).trim(),'Protected file changed: '+f);
const oldHtml=original('index.html'),html=fs.readFileSync('index.html','utf8');assert.equal(html.replace('journey-progress-caption.js?v=20261115-genesis13-integration-v1','journey-progress-caption.js?v=20261114-books-chrome-route-v4'),oldHtml,'HTML changed beyond loader cache token');
assert(fs.readFileSync('journey-progress-caption.js','utf8').startsWith(original('journey-progress-caption.js')),'Existing loader content changed');
const manifest=JSON.parse(fs.readFileSync('story-adventure-art/genesis13/manifest.json'));
// Integrity-locked artwork selected and visually reviewed; fail if the wrong
// image, rejected variant, or any file masquerading as WebP gets uploaded.
const approvedImageSha256={
  "g13-d01": "9c9e5e81dd613aebb6c9b21df2d8457003084b6180e7053a6691df99afcf5be8",
  "g13-d02": "26436ad093f456e95c2953f3ed4239b073613a02c3eec98bcac997ac59aa3dd8",
  "g13-d03": "11011b1a9ccf8a25cea1353afb2d2d304d6fbcad0455ea594cec5d9800d4e99b",
  "g13-d04": "20f79e8e5c83431d3a14748b1a3b64ccafad41a0caf578bc57edbe519cccfbc9",
  "g13-d05": "14f3d04909b3c314b8d2d0630a456bae139c32758aef3006c09fcc22f21f2976",
  "g13-d06": "0fd90d0e0f9f021c2d5ee125dd4d3e2000f3557eba6dd0976ef6850f5bcbac51",
  "g13-d07": "aa7cd110de809d55d02e3a573c33669ea68e31f2dc2bca3611b395b236aa3de1",
  "g13-d08": "e9b9da545d7260d0eea67297d746840c5d4a5b0b1eb18210c2b583224926b131",
  "g13-d09": "b24e2ecd74a2aaa416a3b5a7e24b7ee7a7611068d18093eae1d105d8abbdd8f9",
  "g13-d10": "fa81c42daa0d43b2ab196fa3e9b5ddc80fddc161ea3a7c834a7a07db7f9a4a6c",
  "g13-d11": "1f29d97d24a7e66637667c4c57bd0bca639c81f8524eae67cbc2c61587cc9a38",
  "g13-d12": "916a0044cef1f9a37873f62be30b7df7d4ed8941a5365c40972d0b807c12ba83"
};
assert.equal(Object.keys(manifest.scenes).length,12);
for(let i=1;i<=12;i++){
 const id='g13-d'+String(i).padStart(2,'0');
 const spec=manifest.scenes[id],expected='story-adventure-art/genesis13/'+id+'.webp';
 assert.equal(spec.path,expected);assert.equal(typeof spec.approved,'boolean');
 if(spec.approved){
  assert(fs.existsSync(expected),'Approved image absent from checkout: '+expected);
  const bytes=fs.readFileSync(expected);
  assert(bytes.length>15000,'Approved image unexpectedly small: '+expected);
  assert.equal(bytes.toString('ascii',0,4),'RIFF','Not a RIFF WebP: '+expected);
  assert.equal(bytes.toString('ascii',8,12),'WEBP','Not a WebP image: '+expected);
  assert.equal(bytes.toString('ascii',12,16),'VP8 ','Unexpected WebP encoding: '+expected);
  assert.equal(bytes.readUInt16LE(26)&0x3fff,640,'WebP width mismatch: '+expected);
  assert.equal(bytes.readUInt16LE(28)&0x3fff,360,'WebP height mismatch: '+expected);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),approvedImageSha256[id],'Wrong/rejected artwork file: '+expected);
 }
}
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
 const scenePhotoExpected=artMode==='approved-fixture'||(artMode==='pending'&&manifest.scenes['g13-d09'].approved);
 if(scenePhotoExpected)assert.equal(await page.$eval('[data-bu-genesis13-scene] img',e=>e.getAttribute('src')),manifest.scenes['g13-d09'].path);
 else assert((await page.$eval('[data-bu-genesis13-scene]',e=>e.textContent)).includes('illustration pending'));
 await page.evaluate(()=>{bu3857State.complete=true;bu3857Render()});await page.waitForSelector('.bu-story-finale-actions');
 if(scenePhotoExpected){
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
console.log('PASS_GENESIS13_INTEGRATION_BOUNDARIES',JSON.stringify({baseline,protectedFilesUnchanged:protectedFiles.length,wordTrailsLevelsAudioCoinsAndTestsUnchanged:true,validatedContentUnchanged:true,preparedImagePaths:12,approvedImages:Object.values(manifest.scenes).filter(x=>x.approved).length,bethelEndingRouting:'g13-d09 for hero and background; actual approved art or a clearly labelled in-memory QA fixture',missingApprovedAssetFallsBack:true,additionalLayouts:['320x640','430x932'],oldJourneyLocksPreserved:true,delayedRegistrationRefreshesVisibleViews:true,physicalDevices:false}));
}finally{await browser.close()}})().catch(e=>{console.error(e.stack||e);process.exitCode=1});

#!/usr/bin/env node
'use strict';
// Candidate stays additive: every pre-existing tracked file must match the exact TEST baseline.
const assert=require('node:assert/strict'),cp=require('node:child_process'),fs=require('node:fs'),p=require('puppeteer-core');
const BASE='6274e36',base=process.env.STORY_URL||'http://127.0.0.1:8899/index.html';
for(const file of cp.execFileSync('git',['ls-tree','-r','--name-only',BASE],{encoding:'utf8'}).trim().split('\n')){
 const expected=cp.execFileSync('git',['show',BASE+':'+file],{maxBuffer:40000000});
 assert(fs.existsSync(file),'Removed baseline file '+file);assert(fs.readFileSync(file).equals(expected),'Changed protected baseline file '+file);
}
console.log('PASS_ALL_BASELINE_FILES_BYTE_IDENTICAL',BASE);
const pause=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const browser=await p.launch({executablePath:process.env.CHROME_BIN||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage'],protocolTimeout:120000});try{
 const snapshots=[];
 for(const candidate of [false,true]){
  const context=await browser.createBrowserContext(),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewport({width:430,height:932,isMobile:true,hasTouch:true});
  await page.goto(candidate?new URL('genesis-episode14-preview.html',base).href:base,{waitUntil:'load',timeout:120000});
  const game=candidate?page.frames().find(f=>f.url().includes('index.html')):page;
  await game.waitForFunction(candidate?()=>window.BUStoryGenesis14Test?.status==='ready':()=>window.BUStoryGenesis13Test?.status==='ready',{timeout:60000});
  assert.equal(await game.evaluate(()=>!!BU3857_DATA.genesis_ep14),candidate,'Ordinary entry must not register candidate');
  // Seed a legacy Genesis checkpoint and unrelated-mode/preferences data in this synthetic profile.
  const saved=await game.evaluate(()=>{
   document.getElementById('daily-close')?.click();completedChapters.genesis_ep10=true;
   const old={step:2,complete:false,solved:{'g11-d01':true,'g11-d02':true},revealed:{},hints:{...Object.fromEntries(BU3857_DATA.genesis_ep11.discoveries.map(d=>[d.id,0])),'g11-d02':2},work:{'g11-d03':{}}};
   bu3857Saved.genesis_ep11=old;const all=bu3857ReadSave(BU_GENESIS_KEY);all.genesis_ep11=old;all.future_preservation_fixture={marker:'must-survive'};localStorage.setItem(BU_GENESIS_KEY,JSON.stringify(all));
   localStorage.setItem('episode14-unrelated-storage-fixture','unchanged');persistUnified();
   return old;
  });
  if(candidate){
   // Real predecessor ending action, using a saved complete Episode 13 checkpoint.
   await game.evaluate(()=>{completedChapters.genesis_ep12=true;bu3857Saved.genesis_ep13={step:11,complete:true,solved:{},hints:{},revealed:{},work:{}};completedChapters.genesis_ep13=true;bu3857Open('genesis_ep13')});
   await game.$eval('#bu3857-next-episode',b=>b.click());assert.equal(await game.evaluate(()=>bu3857State.book),'genesis_ep14');
   await game.evaluate(()=>{bu3857State.step=4;bu3857Save();focusHome()});
  }
  await game.evaluate(()=>bu3857Open('genesis_ep11'));assert.equal(await game.evaluate(()=>bu3857State.step),2);assert.deepEqual(await game.evaluate(()=>bu3857Saved.genesis_ep11),saved);
  await game.evaluate(()=>bu3857Save());assert.deepEqual(await game.evaluate(()=>bu3857ReadSave(BU_GENESIS_KEY).future_preservation_fixture),{marker:'must-survive'});
  const modes={};
  for(const id of ['home-trivia','home-family','home-cross','home-builder','home-watch','home-shop','home-help']){
   await game.evaluate(id=>{window.BUWTNativeShell?.close?.();closeDialog();closeMenu();focusHome();document.getElementById('daily-close')?.click();document.getElementById(id).click()},id);
   if(id==='home-cross')await game.waitForFunction(()=>window.BUWTNativeShell?.active?.(),{timeout:30000});else await pause(150);
   modes[id]=await game.evaluate(()=>({path:location.pathname,active:[...document.querySelectorAll('.screen,.wb36-screen')].filter(e=>!e.hidden&&getComputedStyle(e).display!=='none').map(e=>e.id),wordTrails:!!window.BUWTNativeShell?.active?.(),help:!document.getElementById('help-dialog')?.hidden,shop:!!document.getElementById('bu-native-boost-shop-v1')}));
   if(id==='home-trivia'){
    const result=await game.evaluate(()=>{const f=BUStage16TriviaLifecycle;f.getStart()('quick','all');const quiz=f.getQuiz(),q=quiz.items[quiz.step];document.querySelector('#bu34-trivia [data-answer="'+((q.correct+1)%q.choices.length)+'"]').click();const still=!quiz.answered;document.querySelector('#bu34-trivia [data-answer="'+q.correct+'"]').click();return {wrongAllowedRetry:still,correctAnswered:quiz.answered};});
    assert.deepEqual(result,{wrongAllowedRetry:true,correctAnswered:true});
   }
   if(id==='home-family'){
    await game.evaluate(()=>{if(bu35Game)bu35Game.complete=true;bu35Open('setup');bu35Setup.people=['Review One','Review Two'];bu35Setup.quick='trivia';bu35Setup.topic='genesis';bu35Setup.minutes=20;bu35Setup.order='classic';bu35Setup.difficulty='beginner';bu35Begin()});
    await game.waitForSelector('#bu35-ready');await game.$eval('#bu35-ready',b=>b.click());
    await game.evaluate(()=>{const q=bu35Question(),b=document.querySelector('#bu35-body [data-answer="'+q.correct+'"]');if(!b)throw Error('Missing Family Worship answer');b.click()});
    assert(await game.evaluate(()=>bu35Game.answered));
    await game.evaluate(()=>{document.getElementById('bu67-modal')?.close();bu35Game.complete=true;});
   }
   if(id==='home-cross'){
    await game.waitForFunction(()=>!!document.getElementById('bu-wt-native-game')?.contentWindow?.BUWTPolish,{timeout:30000});
    const settings=await game.evaluate(async()=>{const child=document.getElementById('bu-wt-native-game').contentWindow,before=BUWTNativeShell.audioPrefs(),input=document.getElementById('setting-sfx');input.checked=!before.sfx;input.dispatchEvent(new Event('change',{bubbles:true}));await new Promise(r=>setTimeout(r,80));const during=child.BUWTPolish.state().sfx;input.checked=before.sfx;input.dispatchEvent(new Event('change',{bubbles:true}));await new Promise(r=>setTimeout(r,80));return {propagates:during===!before.sfx,restored:child.BUWTPolish.state().sfx===before.sfx};});
    assert.deepEqual(settings,{propagates:true,restored:true});
   }

  }
  // Existing native settings, including audio and announcers, stay owned by the original controls.
  const audio=await game.evaluate(()=>{window.BUWTNativeShell?.close?.();closeDialog();closeMenu();focusHome();const ids=['setting-music','setting-sfx','setting-volume','setting-sfx-volume'];return {controls:ids.map(id=>{const e=document.getElementById(id);return {id,type:e?.type,value:e?.value,checked:e?.checked}}),announcer:typeof bu381Play,unrelated:localStorage.getItem('episode14-unrelated-storage-fixture'),prior:bu3857ReadSave(BU_GENESIS_KEY).genesis_ep11};});
  assert.equal(audio.unrelated,'unchanged');assert.deepEqual(audio.prior,saved);assert.equal(audio.announcer,'function');assert(audio.controls.every(e=>e.type));
  snapshots.push({modes,audio});assert.deepEqual(errors,[]);await context.close();
 }
 assert.deepEqual(snapshots[1],snapshots[0]);console.log('PASS_CANDIDATE_BASELINE_MODE_AUDIO_AND_LEGACY_SAVE_PARITY',JSON.stringify(snapshots[1]));
}finally{await browser.close()}})().catch(e=>{console.error(e.stack||e);process.exitCode=1});

#!/usr/bin/env node
'use strict';
// Compare non-Story entry routes with the immutable baseline; never fetch LIVE.
const p=require('puppeteer-core'),assert=require('node:assert/strict'),cp=require('node:child_process');
const files=['index.html','journey-progress-caption.js','story-chapter-complete-v2-test.js',...Array.from({length:5},(_,i)=>'bible_unfolded_core_part'+(i+1)+'.js')];
const original=new Map(files.map(f=>[f,cp.execFileSync('git',['show','bf101f8:'+f],{encoding:'utf8',maxBuffer:40000000})]));
(async()=>{const b=await p.launch({executablePath:process.env.CHROME_BIN||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});try{
const snapshots=[];
for(const baseline of [true,false]){
 const page=await b.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
 if(baseline){await page.setRequestInterception(true);page.on('request',r=>{const name=new URL(r.url()).pathname.slice(1);if(original.has(name))r.respond({status:200,contentType:name.endsWith('.html')?'text/html':'text/javascript',body:original.get(name)});else r.continue()});}
 await page.goto(process.env.STORY_URL||'http://127.0.0.1:8893/index.html',{waitUntil:'load',timeout:120000});
 await page.waitForFunction(()=>window.BUPlatformRewards?.hasNativeHost?.());
 const modes={};
 for(const id of ['home-watch','home-trivia','home-family','home-builder','home-cross','home-crossword-packs','home-shop','home-help','home-books']){
  await page.evaluate(id=>{window.BUWTNativeShell?.close?.();closeDialog();closeMenu();focusHome();document.getElementById('daily-close')?.click();document.getElementById(id).click()},id);
  if(id==='home-books')await page.waitForFunction(()=>location.pathname.includes('bible-book-guides/'));
  else await new Promise(r=>setTimeout(r,100));
  modes[id]=await page.evaluate(()=>({path:location.pathname,active:[...document.querySelectorAll('.screen,.wb36-screen')].filter(e=>!e.hidden&&getComputedStyle(e).display!=='none').map(e=>e.id),wordTrailsOverlay:!!window.BUWTNativeShell?.active?.(),help:!!document.getElementById('help-dialog')&&!document.getElementById('help-dialog').hidden,shop:!!document.getElementById('bu-native-boost-shop-v1')}));
 }
 assert.deepEqual(errors,[]);snapshots.push(modes);await page.close();
}
assert.deepEqual(snapshots[1],snapshots[0]);console.log('PASS_NON_STORY_BASELINE_PARITY',JSON.stringify(snapshots[1]));
}finally{await b.close()}})().catch(e=>{console.error(e.stack||e);process.exitCode=1});

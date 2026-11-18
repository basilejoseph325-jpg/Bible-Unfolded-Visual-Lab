#!/usr/bin/env node
'use strict';
// Small real-host reproducer: existing synthetic completed-55 fixture, real
// downloads/file pickers, native touch/confirm, refresh, restore and replay.
// This is not a replacement for the all-five-level gameplay test.
const {webkit}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const h=require('./qa_word_trails_55_browser.cjs'),{completed55}=require('./qa_word_trails_55_restore_browser.cjs'),{trace}=require('./qa_word_trails_55_reset_trace.cjs');
const BASE=process.env.WT_55_URL||'http://127.0.0.1:8905/index.html';
(async()=>{
 const evidence=[];
 for(const [width,height]of [[320,568],[430,932]].filter(([w])=>!process.env.WT_WIDTHS||process.env.WT_WIDTHS.split(',').includes(String(w)))){
  const browser=await webkit.launch({headless:true}),c=await h.context(browser,width,height,completed55()),p=await c.newPage(),errors=[];
  const log=trace(p);log.note('runtime',{playwright:require('playwright/package.json').version,webkit:browser.version(),width});p.on('pageerror',e=>errors.push(e.message));h.acceptNativeDialogs(p);
  try{
   await p.goto(BASE,{waitUntil:'domcontentloaded',timeout:120000});await h.ready(p);
   const file=await h.exportUI(p),wallet=JSON.parse(file.keys[h.W]),trail=JSON.parse(file.keys[h.T]);
   if(process.env.WT_RESET_STRESS!=='none')for(const kind of ['checksum','legacy','future','foreign']){
    const bad=JSON.parse(JSON.stringify(file));
    if(kind==='checksum')bad.keys[h.W]+=' ';
    if(kind==='legacy')bad.version=1;
    if(kind==='foreign')bad.storagePrefix='bu-visual-lab-shared-preview-20261116:';
    if(kind==='future'){const t=JSON.parse(bad.keys[h.T]);t.unlocked=55;bad.keys[h.T]=JSON.stringify(t);delete bad.checksum;bad.checksum=await p.evaluate(x=>BUSharedTestBackup.hash(x),bad);}
    const before=await h.state(p);await h.choose(p,bad);await p.locator('#bu-shared-restore-error').waitFor({state:'visible'});
    assert.deepEqual((await h.state(p)).w,before.w);assert.deepEqual((await h.state(p)).t,before.t);log.note('invalid-file-rejected',{kind});
   }
   log.note('before-game.parent-ui',await p.evaluate(()=>({active:document.activeElement?.outerHTML?.slice(0,300),dialogs:[...document.querySelectorAll('dialog[open]')].map(d=>({id:d.id,buttons:[...d.querySelectorAll('button')].map(b=>({id:b.id,text:b.textContent?.slice(0,60)}))}))})));
   let f=await h.launch(p);await h.map(f);await h.touchMapAction(p,f,'#reset-test');
   assert.deepEqual((await h.state(p)).w,wallet);assert.equal((await h.state(p)).t.completed.length,0);
   await h.restore(p,file);const restored=await h.parity(p);assert.deepEqual(restored.t,trail);assert.deepEqual(restored.w.wtReceipts,wallet.wtReceipts);
   f=await h.launch(p);const lev=h.pack[4];
   for(const word of [lev.spark,lev.extraSparks[0].word,...lev.bonus.split(' '),...lev.words.map(x=>x[0])]){log.note('replay.word.start',{word});await h.word(f,word);log.note('replay.word.finish',{word});}
   await f.locator('#finish[open]').waitFor();assert.equal((await h.parity(p)).balance,wallet.coins);assert.deepEqual((await h.state(p)).w.wtReceipts,wallet.wtReceipts);
   assert((await f.locator('#finish-seal-note').textContent()).includes('previously collected'));
   assert.deepEqual(errors,[]);h.assertNativeDialogs(p);
   await p.screenshot({path:`work/word-trails-55-integration/probe-${process.env.WT_RESET_FOCUS||'force'}-${width}.png`,timeout:5000});
   const row={width,mode:process.env.WT_RESET_FOCUS||'force',invalidFiles:process.env.WT_RESET_STRESS!=='none',nativeResetRefresh:true,wholeWalletPreserved:true,completed55Restored:true,replayNoReward:true,pageErrors:0};evidence.push(row);log.note('probe.pass',row);console.log('PASS_RESET_PROBE',JSON.stringify(row));
  }catch(e){log.note('probe.failed',{error:e.stack});
   await log.step('diagnostic.storage-after-failure',async()=>{const s=await h.state(p);log.note('diagnostic.storage',{tokens:s.balance,level:s.t?.level,completed:s.t?.completed?.length,receipts:Object.keys(s.w.wtReceipts||{}).length});},5000).catch(()=>{});
   await log.step('diagnostic.screenshot',()=>p.screenshot({path:`work/word-trails-55-integration/probe-FAIL-${width}.png`,timeout:3000}),4000).catch(()=>{});throw e;
  }finally{await c.close();await browser.close();}
 }
 fs.writeFileSync(process.env.WT_RESET_PROBE_RESULT||'work/word-trails-55-integration/reset-probe.json',JSON.stringify(evidence,null,2));
})().catch(e=>{console.error(e);process.exitCode=1});

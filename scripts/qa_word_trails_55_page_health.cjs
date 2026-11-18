#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),{EventEmitter}=require('node:events');
const {withPageHealth}=require('./qa_word_trails_55_reset_trace.cjs');
(async()=>{
 const page=new EventEmitter();
 assert.equal(await withPageHealth(page,async()=>42),42);
 for(const event of ['crash','close']){
  const result=withPageHealth(page,()=>new Promise(()=>{}));
  setImmediate(()=>page.emit(event));
  await assert.rejects(result,event==='crash'?/page crashed/:/page closed/);
  assert.equal(page.listenerCount('crash'),0);assert.equal(page.listenerCount('close'),0);
 }
 await assert.rejects(withPageHealth(page,async()=>{throw Error('Actual gameplay failure')}),/Actual gameplay failure/);
 assert.equal(page.listenerCount('crash'),0);assert.equal(page.listenerCount('close'),0);
 console.log('PASS_55_PAGE_HEALTH unresolved protocol calls fail on crash/close; gameplay errors retained; listeners cleaned');
})().catch(e=>{console.error(e);process.exit(1)});

#!/usr/bin/env node
/* TEST ONLY. Real IndexedDB transactions under a Node simulated browser.
 * Existing LIVE wallet keys and Word Trails' old coins are never read/written.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {IDBFactory}=require('fake-indexeddb');
const source=fs.readFileSync('experiments/bu-test-insight-wallet-v1.js','utf8');
const records=async(db,key)=>new Promise((resolve,reject)=>{
 const tx=db.transaction('wallet','readonly'),get=tx.objectStore('wallet').get(key);
 get.onsuccess=()=>resolve(get.result);
 get.onerror=()=>reject(get.error);
});
const setRecords=async(db,items)=>new Promise((resolve,reject)=>{
 const tx=db.transaction('wallet','readwrite');
 tx.oncomplete=()=>resolve();
 tx.onabort=()=>reject(tx.error);
 for(const [key,val] of items)tx.objectStore('wallet').put(val,key);
});
async function make({pathname='/Bible-Unfolded-Visual-Lab/index.html',idb=new IDBFactory()}={}){
 const events=[],liveAccess=[];
 const window={location:{pathname,hostname:'basilejoseph325-jpg.github.io'},indexedDB:idb,
  dispatchEvent:e=>events.push(e.type)};
 const sandbox={window,indexedDB:idb,CustomEvent:class{constructor(type){this.type=type}},
  BroadcastChannel:class{postMessage(){}close(){}},
  get localStorage(){liveAccess.push('access');throw Error('LIVE storage accessed');}};
 vm.runInNewContext(source,sandbox,{filename:'bu-test-insight-wallet-v1.js',timeout:2000});
 return {api:window.BUTestInsightWallet,events,liveAccess,idb};
}
(async()=>{
 const one=await make();
 assert(one.api,'Wallet must be available in Visual Lab');
 const w=one.api;
 assert.equal(w.starterBalance,60);
 assert.deepEqual(JSON.parse(JSON.stringify(await w.snapshot())),{
  ok:true,balance:60,revision:0,starter:'TEST-only 60, not imported',receiptCount:0});
 assert.equal((await w.apply({id:'trails:l1:complete',delta:3,kind:'credit'})).ok,true);
 assert.equal((await w.snapshot()).balance,63);
 const dup=await w.apply({id:'trails:l1:complete',delta:3,kind:'credit'});
 assert.equal(dup.duplicate,true);
 assert.equal((await w.snapshot()).balance,63);
 const conflict=await w.apply({id:'trails:l1:complete',delta:5,kind:'credit'});
 assert.equal(conflict.reason,'receipt-conflict');
 assert.equal((await w.snapshot()).balance,63);
 assert.equal((await w.apply({id:'trails:l1:hint:1',delta:-15,kind:'spend'})).ok,true);
 assert.equal((await w.snapshot()).balance,48);
 assert.equal((await w.apply({id:'trails:l1:hint:1',delta:-15,kind:'spend'})).duplicate,true);
 assert.equal((await w.snapshot()).balance,48);
 const no=await w.apply({id:'trails:l1:hint:2',delta:-50,kind:'spend'});
 assert.equal(no.reason,'insufficient');
 assert.equal((await w.snapshot()).balance,48);
 assert.equal((await w.apply({id:'trails:l1:hint:2',delta:-48,kind:'spend'})).ok,true);
 assert.equal((await w.snapshot()).balance,0);
 assert.equal((await w.apply({id:'trails:l1:hint:3',delta:-1,kind:'spend'})).reason,'insufficient');
 assert.equal((await w.snapshot()).balance,0);
 // Serialized readwrite transactions prevent duplicate credit across simultaneous tabs.
 const many=await Promise.all(Array.from({length:12},()=>w.apply({
  id:'trails:l2:complete',delta:3,kind:'credit'})));
 assert(many.every(x=>x.ok));
 assert.equal(many.filter(x=>!x.duplicate).length,1);
 assert.equal((await w.snapshot()).balance,3);
 const invalid=await w.apply({id:'trails:l3:complete',delta:1,kind:'spend'});
 assert.equal(invalid.reason,'invalid-transaction');
 assert.equal((await w.snapshot()).balance,3);
 // No attempt to read localStorage, in particular no production LIVE wallet.
 assert.deepEqual(one.liveAccess,[]);
 // Both copies commit together and carry exact same receipt ledger.
 const raw=await new Promise((resolve,reject)=>{
  const request=one.idb.open(w.database);
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error);
 });
 assert.deepEqual(await records(raw,'main'),await records(raw,'recovery'));
 // Lose one copy: recovery wins without resetting balance.
 await setRecords(raw,[['main',{damaged:true}]]);
 assert.equal((await w.snapshot()).balance,3);
 await w.apply({id:'trails:l3:complete',delta:4,kind:'credit'});
 assert.deepEqual(await records(raw,'main'),await records(raw,'recovery'));
 assert.equal((await w.snapshot()).balance,7);
 // Destroy both copies: lock rather than mint a new 60 token welcome bonus.
 await setRecords(raw,[['main',{damaged:true}],['recovery',{damaged:true}]]);
 assert.equal((await w.snapshot()).ok,false);
 assert.equal((await w.apply({id:'trails:l4:complete',delta:3,kind:'credit'})).ok,false);
 assert.equal((await records(raw,'main')).damaged,true);
 // Storage disabled => no reward is ever falsely acknowledged.
 const blocked=await make({idb:null});
 assert.equal((await blocked.api.snapshot()).ok,false);
 assert.equal((await blocked.api.apply({id:'trails:l1:complete',delta:3,kind:'credit'})).ok,false);
 // Runtime fenced out of protected LIVE path even if mistakenly imported there.
 const live=await make({pathname:'/Story-Trails/index.html'});
 assert.equal(live.api,undefined);
 assert.deepEqual(live.liveAccess,[]);
 console.log('PASS TEST ledger: init, atomic spend/credit, 12 parallel receipts, dedupe, zero balance, backup recovery, corruption lock, storage failure, production isolation');
})().catch(err=>{console.error(err);process.exitCode=1});

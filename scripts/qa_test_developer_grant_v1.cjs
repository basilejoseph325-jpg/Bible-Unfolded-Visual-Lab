#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const {create,TARGET,RECEIPT,PHRASE}=require('../test-developer-grant-v1.js');
function fixture(coins=1000){let wallet={coins,points:87,earned:['story:existing'],spent:['purchase:old'],purchases:['goldwheel'],wtReceipts:{'trails:l51:complete':{delta:4,kind:'credit'}},buNativeBoostState:{inventory:{fifty:2},stars:3},unknownPreserved:{nested:1}},mark=null,allowed=true,writes=0;const io={allowed:()=>allowed,read:()=>({raw:JSON.stringify(wallet),wallet:structuredClone(wallet)}),attempt:()=>mark,reserve:x=>{mark=x},exportSnapshot:async()=>({keys:{'bible-unfolded-rewards-v17':JSON.stringify(wallet)}}),validate:async()=>{},save:next=>{writes++;wallet=next;return true}};return {io,service:create(io),get wallet(){return wallet},get mark(){return mark},get writes(){return writes},setWallet:v=>{wallet=v},setAllowed:v=>{allowed=v},setMark:v=>{mark=v}};}
const consent={confirmation:PHRASE,backupSaved:true};
(async()=>{let cases=0;const pass=()=>cases++;
 {const f=fixture(),before=structuredClone(f.wallet);assert.throws(()=>f.service.commit(consent),/backup/);await f.service.prepare();assert.throws(()=>f.service.commit({confirmation:'yes',backupSaved:true}),/backup/);assert.throws(()=>f.service.commit({confirmation:PHRASE,backupSaved:false}),/backup/);assert.equal(f.mark,null);const r=f.service.commit(consent);assert.equal(r.delta,44000);assert.deepEqual(f.wallet,{...before,coins:TARGET,earned:[...before.earned,RECEIPT]});assert.equal(f.writes,1);await assert.rejects(create(f.io).prepare(),/already/);pass();}
 {const f=fixture(50000);await f.service.prepare();assert.deepEqual(f.service.commit(consent),{ok:true,delta:0,balance:50000});assert(f.wallet.earned.includes(RECEIPT));pass();}
 {const f=fixture();await f.service.prepare();f.setWallet({...f.wallet,coins:999});assert.throws(()=>f.service.commit(consent),/changed/);assert.equal(f.mark,null);pass();}
 {const f=fixture();await f.service.prepare();f.setAllowed(false);assert.throws(()=>f.service.commit(consent),/writable/);assert.equal(f.mark,null);pass();}
 {const f=fixture();f.io.reserve=()=>{throw Error('Quota')};await f.service.prepare();assert.throws(()=>f.service.commit(consent),/Quota/);assert.equal(f.wallet.coins,1000);assert.equal(f.writes,0);pass();}
 {const f=fixture();f.io.save=()=>false;await f.service.prepare();assert.throws(()=>f.service.commit(consent),/not verified/);assert.equal(f.wallet.coins,1000);assert(f.mark);await assert.rejects(create(f.io).prepare(),/already/);pass();}
 {const f=fixture();await f.service.prepare();f.service.commit(consent);f.setWallet({...f.wallet,coins:44955});await assert.rejects(create(f.io).prepare(),/already/);pass();}
 {const f=fixture(),old=structuredClone(f.wallet);await f.service.prepare();f.service.commit(consent);f.setWallet(old);await assert.rejects(create(f.io).prepare(),/already/);assert.equal(f.wallet.coins,1000);pass();}
 {const f=fixture();f.setWallet({...f.wallet,coins:TARGET,earned:[RECEIPT]});assert.equal(f.mark,null);await assert.rejects(f.service.prepare(),/already/);pass();}
 {const f=fixture();f.setMark('damaged');await assert.rejects(f.service.prepare(),/already/);assert.equal(f.writes,0);pass();}
 {const f=fixture();f.io.validate=async()=>{throw Error('Bad backup')};await assert.rejects(f.service.prepare(),/Bad backup/);assert.equal(f.mark,null);assert.equal(f.wallet.coins,1000);pass();}
 {const f=fixture();f.setWallet({...f.wallet,earned:Array(20000).fill('existing')});await f.service.prepare();assert.throws(()=>f.service.commit(consent),/ledger is full/);assert.equal(f.mark,null);pass();}
 console.log('PASS_TEST_DEVELOPER_GRANT_UNIT',cases,'top-up, no debit, consent, stale wallet, writer ownership, failures, once-only, backup rollback and receipt preservation');
})().catch(e=>{console.error(e);process.exit(1)});

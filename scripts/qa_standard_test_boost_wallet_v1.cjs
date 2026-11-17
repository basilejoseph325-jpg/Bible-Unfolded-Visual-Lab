#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const code=fs.readFileSync('native-boost-shop-test-v1.js','utf8'),KEY='bu-native-boost-shop-v1-test-only',W='bible-unfolded-rewards-v17';
const old=JSON.stringify({version:1,tokens:900,sourceCoins:60,inventory:{fifty:2,shield:1,letter:0},stars:4,earnedSet:['old'],granted:0});
function fixture({standard=true,wallet=null}={}){
 const map=new Map([[KEY,old],[W,JSON.stringify(wallet||{coins:60,points:-25,earned:['old'],purchases:[]})]]);let fail=false;
 const storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};
 const ctx=vm.createContext({window:{BUPreviewStorageFence:{standardMode:standard}},document:{readyState:'loading',addEventListener(){},querySelector(){return null},createElement(){return {remove(){},setAttribute(){}}},body:{append(){}}},localStorage:storage,setTimeout(){},clearTimeout(){},console,Date,Math});
 vm.runInContext(`let economy=JSON.parse(localStorage.getItem('${W}'));function bu3824RefreshWallet(){}function updateWallet(){}function saveEconomy(){return __save(economy)}`,ctx);
 ctx.__save=e=>{if(fail)return false;map.set(W,JSON.stringify(e));return true};
 vm.runInContext(code,ctx);
 return {ctx,api:ctx.window.BUNativeBoostShop,map,coins:()=>vm.runInContext('economy.coins',ctx),points:()=>vm.runInContext('economy.points',ctx),fail:()=>{fail=true}};
}
const x=fixture();assert.equal(x.api.preview().tokens,60);assert.equal(x.api.preview().inventory.fifty,2);
x.api.testActions.purchase('fifty');assert.equal(x.coins(),15);assert.equal(x.points(),-25);assert.equal(x.api.preview().inventory.fifty,3);assert.equal(x.map.get(KEY),old);
x.api.testActions.purchase('fifty');assert.equal(x.coins(),15,'Insufficient purchase must not charge');assert.equal(x.api.preview().inventory.fifty,3);
vm.runInContext("economy.coins=0;economy.earned.push('story-a','story-b','story-c','story-d','story-e');saveEconomy()",x.ctx);
x.api.testActions.purchase('scholar');assert.equal(x.coins(),0);assert.equal(x.api.preview().inventory.fifty,4,'Five native achievements grant one existing free boost');x.api.testActions.purchase('scholar');assert.equal(x.api.preview().inventory.fifty,4,'No duplicate achievement gift');
const persisted=JSON.parse(x.map.get(W));assert.equal(persisted.buNativeBoostState.inventory.fifty,4);const reopen=fixture({wallet:persisted});assert.equal(reopen.api.preview().inventory.fifty,4);assert.equal(reopen.api.preview().tokens,0);
const broken=fixture();broken.fail();broken.api.testActions.purchase('fifty');assert.equal(broken.coins(),60);assert.equal(broken.api.preview().inventory.fifty,2);assert.equal(JSON.parse(broken.map.get(W)).coins,60,'Failed atomic save preserves balance and stock');
const preview=fixture({standard:false});preview.api.testActions.purchase('fifty');assert.equal(preview.coins(),60,'Protected preview keeps its original trial behavior');assert.equal(preview.api.preview().tokens,855);
console.log('PASS standard Power-Up Shop: one native wallet, old inventory preserved, no 225/900 token conversion, atomic failed-write rollback, negative Points, once-only achievement gift, restart, protected preview unchanged');

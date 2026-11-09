#!/usr/bin/env node
/* Actual shared Rewards API contract. Verify no accidental wheel charge,
   no test-coin conversion, persistent entitlement recovery, root native binding. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync('bu-platform-rewards-v1.js','utf8');
const menu=fs.readFileSync('experiments/word-trails-unified-menu-v1.js','utf8');
const html=fs.readFileSync('experiments/word-trails-next-v1.html','utf8');
const rootHost=fs.readFileSync('journey-progress-caption.js','utf8');
const main='bible-unfolded-rewards-v17',backup='bible-unfolded-rewards-v17-recovery-v3811';
const owner='bible-unfolded-wheel-ownership-v3825-backup';
const test='bu-visual-lab-wordtrails-next-v1';
function fixture(initial={},failWrites=false){
 const data=new Map(Object.entries(initial).map(([k,v])=>[k,typeof v==='string'?v:JSON.stringify(v)])),writes=[];
 const store={
  getItem:k=>data.get(k)||null,
  setItem:(k,v)=>{if(failWrites)throw new Error('storage disabled');writes.push(k);data.set(k,String(v))},
  removeItem:k=>{writes.push(k);data.delete(k)}
 };
 let changes=0;
 const sandbox={window:{dispatchEvent:()=>{changes++}},localStorage:store,Event:class{}};
 vm.runInNewContext(source,sandbox,{timeout:2000});
 return {api:sandbox.window.BUPlatformRewards,data,writes,changes:()=>changes};
}
const one=fixture({
 [main]:{points:-17,coins:511,equippedWheel:'classic',purchases:['goldwheel'],earned:['one']},
 [owner]:{version:1,owned:['seawheel']},
 [test]:{coins:2500,level:17}
});
assert.equal(one.api.hasNativeHost(),false);
assert.deepEqual([...one.api.owned()].sort(),['classic','goldwheel','seawheel'].sort());
assert.equal(one.api.equipWheel('moonwheel').ok,false,'Must never grant unowned wheels');
assert.equal(one.api.equipWheel('seawheel').ok,true,'Recovery-owned wheel must equip free');
let w=JSON.parse(one.data.get(main));
assert.equal(w.equippedWheel,'seawheel');
assert.equal(w.coins,511);
assert.equal(w.points,-17);
assert.deepEqual(w.earned,['one']);
assert(w.purchases.includes('seawheel'));
assert.deepEqual(JSON.parse(one.data.get(test)),{coins:2500,level:17});
assert(!one.writes.includes(test),'TEST coins must remain quarantined');
assert(!one.writes.includes(owner),'Entitlement backup must not be rewritten');
assert.equal(JSON.parse(one.data.get(backup)).equippedWheel,'seawheel');
const broken=fixture({[main]:{points:0,coins:44,purchases:[],equippedWheel:'classic'}},true);
assert.equal(broken.api.equipWheel('classic').ok,false);
assert.equal(broken.writes.length,0);
const recovered=fixture({
 [main]:'{bad JSON',
 [backup]:{points:23,coins:80,purchases:['moonwheel'],equippedWheel:'moonwheel'}
});
assert.equal(recovered.api.wallet().coins,80);
assert.equal(recovered.api.currentTheme(),'moonwheel');
const native=fixture({[main]:{points:10,coins:88,purchases:['seawheel'],equippedWheel:'classic'}});
let current='classic',nativeCalls=0;
assert.equal(native.api.attachNativeHost({
 wallet:()=>({points:10,coins:88,purchases:['seawheel'],equippedWheel:current}),
 owned:()=>['classic','seawheel'],
 equip:id=>{current=id;nativeCalls++;return true}
}),true);
assert.equal(native.api.equipWheel('seawheel').ok,true);
assert.equal(native.api.currentTheme(),'seawheel');
assert.equal(nativeCalls,1,'Native host must receive exactly one equip request');
assert.equal(native.writes.length,0,'TEST shared core must never bypass native engine');
assert(menu.includes('api.equipWheel(id)'),'Word Trails must use shared API');
assert(!menu.includes('localStorage.setItem(MAIN'),'No duplicate wallet writer in menu');
assert(html.indexOf('../bu-platform-rewards-v1.js')<html.indexOf('word-trails-unified-menu-v1.js'),
 'Shared core must load before Word Trails menu');
assert(rootHost.includes('attachNativeHost({')&&rootHost.includes('setWheelTheme(id)'),
 'Homepage must use canonical native wheel purchase/equip functions');
console.log('PASS: Shared rewards API, owned-wheel recovery, no double charge, negative Points, TEST isolation, root native delegation, load order');

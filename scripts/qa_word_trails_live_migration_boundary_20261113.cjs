#!/usr/bin/env node
'use strict';
/* READ-ONLY release audit. Execute the PINNED, EXISTING LIVE migration code
   against synthetic localStorage to detect unconsented imports and currency
   contamination. Does NOT operate on any real user's browser, LIVE repo,
   account, money, purchase ownership, or existing saved progress.
   Repositories share one github.io origin; TEST and LIVE browser localStorage
   keys may coexist on the same physical device. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const crypto=require('node:crypto');

const path=process.argv[2];
assert(path,'Usage: node qa_word_trails_live_migration_boundary_20261113.cjs /tmp/pinned-live-migration-v1.js');
const script=fs.readFileSync(path,'utf8');
const expectedBlob='52d0a564a16a964daf70e156e46e7d7866480c81';
const buf=Buffer.from(script,'utf8');
const actualBlob=crypto.createHash('sha1').update('blob '+buf.byteLength+'\0').update(buf).digest('hex');
assert.equal(actualBlob,expectedBlob,'STOP: pinned LIVE migration source changed; inspect before rerunning');
const TEST='bu-visual-lab-wordtrails-next-v1';
const LIVE='bible-unfolded-word-trails-next-v1';
const WALLET='bible-unfolded-rewards-v17';
const OWNED='bible-unfolded-wheel-ownership-v3825-backup';
const VOICE='bible-unfolded-private-voice-pref-v381';

const sample={
 level:1,unlocked:5,coins:902,points:400,completed:[0,1],sparks:[0],
 claimedSparks:['0:ABEL'],boardBible:[],paidWords:[],paidBonuses:[],
 claimedFreeHints:[0],sound:true,
 progress:{level:1,found:['ABLE'],bonuses:[],hinted:[],combo:2}
};
const initialWallet={points:-25,coins:375,equippedWheel:'seawheel',purchases:['seawheel'],earned:['chapter-1']};
const fixture=(options={})=>{
 const values=new Map(Object.entries({
  [WALLET]:JSON.stringify(initialWallet),
  [OWNED]:JSON.stringify({owned:['seawheel']}),
  [VOICE]:JSON.stringify({mode:'all'})
 }).concat(options.entries||[]));
 const writes=[];
 const localStorage={
  getItem:k=>values.has(k)?values.get(k):null,
  setItem:(k,val)=>{writes.push(k);values.set(k,String(val))},
  removeItem:k=>{writes.push(k);values.delete(k)}
 };
 vm.runInNewContext(script,{localStorage},{timeout:2000});
 return {values,writes};
};

let noTest=fixture();
assert(!noTest.writes.length,'No TEST record must imply zero writes');

let existingLive=fixture({entries:[[TEST,JSON.stringify(sample)],[LIVE,JSON.stringify({level:3,coins:12,completed:[0]})]]});
assert(!existingLive.writes.length,'Existing LIVE save must remain entirely unchanged');

let malformed=fixture({entries:[[TEST,'{"bad JSON']]});
assert(!malformed.writes.length,'Invalid TEST JSON must never cause a write');

let tested=fixture({entries:[[TEST,JSON.stringify(sample)]]});
assert.deepEqual(tested.writes,[LIVE],'LIVE currently auto-imports TEST progress with no consent');
const result=JSON.parse(tested.values.get(LIVE));
assert.equal(result.coins,60,'Temporary TEST currency must not become real LIVE puzzle currency');
assert.equal(result.points,0,'Temporary TEST points must not become real LIVE puzzle points');
assert.equal(tested.values.get(TEST),JSON.stringify(sample),'TEST save remains intact');
assert.deepEqual(result.completed,[0,1]);
assert.equal(result.unlocked,5);
assert.equal(result.progress.found[0],'ABLE');
assert.equal(JSON.parse(tested.values.get(WALLET)).coins,375,'Insight Tokens unchanged');
assert.equal(JSON.parse(tested.values.get(WALLET)).points,-25,'Native Points unchanged');
assert.equal(JSON.parse(tested.values.get(WALLET)).equippedWheel,'seawheel','Equipped wheel unchanged');
assert.equal(JSON.parse(tested.values.get(OWNED)).owned[0],'seawheel','Purchased entitlement unchanged');
assert(!tested.writes.includes(WALLET)&&!tested.writes.includes(OWNED)&&!tested.writes.includes(VOICE),
 'Shared wallet/owned wheels/voice must NEVER be written by migration');

const second=fixture({entries:[[TEST,JSON.stringify(sample)],[LIVE,tested.values.get(LIVE)]]});
assert.equal(second.writes.length,0,'Rerunning once migrated must be idempotent');

console.log('PASS_READ_ONLY_LIVE_MIGRATION_AUDIT pinned blob='+actualBlob);
console.log('SAFE_IN_SYNTHETIC_FIXTURES: no duplicate import, existing LIVE save protected, no TEST coin to native token transfer, wheel/voice keys untouched');
console.log('RELEASE_BLOCKER_CONFIRMED: existing LIVE code copies TEST progress into an empty LIVE save automatically, without opt-in; requires user-controlled migration and rollback verification before any further promotion.');

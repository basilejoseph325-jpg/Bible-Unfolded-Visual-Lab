#!/usr/bin/env node
// Zero-write migration boundary test; does not depend on the live/original game.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const code=fs.readFileSync('experiments/word-trails-shared-core-boundary-v1.js','utf8');
const data=new Map([
 ['bu-visual-lab-wordtrails-next-v1',JSON.stringify({level:14,unlocked:15,coins:640,completed:['1','2','2'],sparks:['14:NOAH'],paidBonuses:['14|JOIN']})],
 ['bible-unfolded-rewards-v17',JSON.stringify({coins:777,points:119,equippedWheel:'seawheel',purchases:['seawheel']})]
]);
let writes=0;const localStorage={
 getItem(k){return data.get(k)??null},
 setItem(){writes++;throw Error('Read-only audit must never write')},
 removeItem(){writes++;throw Error('Read-only audit must never delete')}
};
const sandbox={window:{},localStorage};
vm.runInNewContext(code,sandbox,{timeout:2000});
const boundary=sandbox.window.BUWTSharedCoreBoundary;
assert(boundary);
const info=boundary.inspect(),preview=boundary.migrationPreview();
assert.equal(info.testCoins,640);
assert.equal(info.sharedTokens,777);
assert.equal(info.actualCoreBindingReady,false);
assert.equal(info.liveReleaseAllowed,false);
assert.equal(preview.testCoinsQuarantined,640);
assert.equal(preview.sharedTokensUntouched,777);
assert.equal(preview.canApply,false);
assert.equal(preview.completed.length,2);
assert.equal(writes,0);
data.set('bu-visual-lab-wordtrails-next-v1','{invalid JSON');
assert.equal(boundary.inspect().testCoins,0);
assert.equal(boundary.migrationPreview().canApply,false);
assert.equal(writes,0);
console.log('PASS: shared-core audit boundary reads and previews but never writes, merges currencies, or claims release readiness');

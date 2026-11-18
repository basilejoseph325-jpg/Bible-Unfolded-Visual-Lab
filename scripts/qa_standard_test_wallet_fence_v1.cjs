#!/usr/bin/env node
'use strict';
const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const code=fs.readFileSync('experiments/bu-test-native-storage-fence-v1.js','utf8');
const P='bu-visual-lab-shared-standard-v1:',W='bible-unfolded-rewards-v17';
function boot(records={},opts={}){
 class Storage{constructor(entries={}){this.map=new Map(Object.entries(entries));}get length(){return this.map.size;}getItem(k){return this.map.get(String(k))??null;}setItem(k,v){if(opts.fail&&String(k).startsWith(P)&&String(k).includes(opts.fail))throw Error('quota');this.map.set(String(k),String(v));}removeItem(k){this.map.delete(String(k));}key(i){return [...this.map.keys()][i]??null;}clear(){this.map.clear();}}
 const raw=new Storage(records),session=new Storage(opts.session||{}),events={};let reloads=0;
 const location={pathname:opts.live?'/Story-Trails/index.html':'/Bible-Unfolded-Visual-Lab/index.html',hostname:opts.local?'localhost':'basilejoseph325-jpg.github.io',search:opts.search||'',reload(){reloads++;}};
 const window={localStorage:raw,parent:null,addEventListener(n,f){events[n]=f;}};window.parent=opts.parent||window;
 const document={readyState:'loading',addEventListener(){},getElementById(){return null;}};
 const navigator=opts.unsupported?{}:{locks:{request(name,options,cb){return Promise.resolve(cb(opts.conflict?null:{}));}}};
 const ctx={window,Storage,document,location,navigator,URLSearchParams,localStorage:raw,sessionStorage:session};
 const scope=vm.createContext(ctx);vm.runInNewContext(fs.readFileSync('experiments/bu-test-shared-backup-v2.js','utf8'),scope);vm.runInNewContext(opts.code||code,scope);
 return {raw,api:window.BUPreviewStorageFence,records:()=>Object.fromEntries(raw.map),reloads:()=>reloads};
}
const original={
 [W]:JSON.stringify({coins:533,points:-25,purchases:['goldwheel'],earned:['old']}),
 'bu-visual-lab-wordtrails-next-v1':JSON.stringify({coins:111,level:5,completed:[0,1,2,3,4]}),
 'buGuideLast:0':'17','bu-james-return-loop-v1-test-only':'{"v":1,"balance":800,"owned":["books"]}',
 ['bu-visual-lab-shared-preview-20261116:'+W]:'{"coins":64}',
 ['bu-visual-lab-regular-wallet-copy-20261116:'+W]:'{"coins":518}',
 'story-trails-moses-v0.5':'{"stage":4}',
 'bible-unfolded-genesis-adventure-v3860':'{"solved":{"legacy-discovery":true}}',
 'bible-unfolded-wordtrails-v21':'{"solved":[["FAITH"]]}',
 'bu34-legacy-settings':'keep',
 'other-app':'private'
};
{
 const first=boot(original,{session:{'bu-visual-lab-current-test-copy-session-v1':'1'}});
 assert(first.api.standardMode&&!first.api.importMode);assert.equal(first.reloads(),1);
 assert.equal(first.api.writerStatus().writable,false,'No native writes before reload');
 for(const [k,v] of Object.entries(original))assert.equal(first.records()[k],v);
 for(const k of [W,'bu-visual-lab-wordtrails-next-v1','buGuideLast:0','bu-james-return-loop-v1-test-only','story-trails-moses-v0.5','bible-unfolded-genesis-adventure-v3860','bible-unfolded-wordtrails-v21','bu34-legacy-settings'])assert.equal(first.records()[P+k],original[k]);
 assert.equal(first.records()[P+'other-app'],undefined);
 assert.equal(first.records()[P+'bu-visual-lab-shared-preview-20261116:'+W],undefined);
 const second=boot(first.records());assert(second.api.writerStatus().writable);assert.equal(second.reloads(),0);
 second.raw.setItem(W,JSON.stringify({coins:518,points:-25}));
 const next=boot({...second.records(),[W]:'{"coins":9999,"points":9999}'});
 assert.equal(JSON.parse(next.raw.getItem(W)).coins,518,'Never recopy original balances');
 assert.equal(next.api.originalKeyValue(W),'{"coins":9999,"points":9999}');
 const child=boot(next.records(),{search:'?bu_shared_wallet_preview=1',parent:{BUPreviewStorageFence:next.api}});
 assert(child.api.standardMode);assert.equal(child.api.previewPrefix,P);assert.equal(JSON.parse(child.raw.getItem(W)).coins,518);
}
{
 const fresh=boot();assert.equal(fresh.reloads(),1);assert.equal(fresh.records()[P+W],undefined,'Fence does not mint starter tokens');
 const next=boot(fresh.records());assert(next.api.writerStatus().writable);
 assert.equal(next.api.originalKeyValue(W),null);
}
for(const bad of ['{broken','{"coins":-1,"points":0}','{"coins":1,"points":"bad"}']){
 const x=boot({[W]:bad});assert.equal(x.api.writerStatus().status,'error');assert.equal(x.api.originalKeyValue(W),bad);assert.equal(x.records()[P+'__imported_regular_test_v1__'],undefined);
}
{
 const x=boot(original,{fail:'buGuideLast'});assert.equal(x.api.writerStatus().status,'error');assert.deepEqual(x.records(),original,'Failed clone rolls back every staged key');
 const partial=boot({...original,[P+W]:'already-there'});assert.equal(partial.api.writerStatus().status,'error');assert.equal(partial.records()[P+W],'already-there','Interrupted/colliding copies fail closed');
}
for(const opt of [{conflict:true},{unsupported:true}]){
 const x=boot(original,opt);assert.equal(x.api.writerStatus().writable,false);assert.throws(()=>x.raw.setItem(W,'{}'),/read-only/);assert.deepEqual(x.records(),original);
}
assert.equal(boot({}, {local:true,search:'?standalone=qa'}).api,undefined,'Explicit local standalone fixture preserved');
assert.equal(boot({}, {local:true,search:'?qaDate=2026-11-16'}).api,undefined,'Explicit local Daily fixture preserved');
assert(boot({}, {local:true,search:'?bu_shared_wallet_preview=1&standalone=qa'}).api.active,'Explicit preview isolation wins over a QA flag');
for(const local of [false,true])assert.equal(boot(original,{live:true,local}).api,undefined,'LIVE path stays inactive');
const oldFence=require('node:child_process').execFileSync('git',['show','9ea596f:experiments/bu-test-native-storage-fence-v1.js'],{encoding:'utf8'});
const oldView=boot({...original,[P+W]:original[W],[P+'__imported_regular_test_v1__']:'restore-pending-v2:test-intent'},{code:oldFence});assert.equal(oldView.api.writerStatus().writable,false,'Older cached candidate must not play a partial restore');assert.equal(oldView.records()[P+W],original[W]);
console.log('PASS standard TEST fence: fresh default, one-time copy, negative Points, preview/session/frame isolation, no old-coin conversion, corrupt/colliding/quota rollback, lock protection, LIVE inactive');

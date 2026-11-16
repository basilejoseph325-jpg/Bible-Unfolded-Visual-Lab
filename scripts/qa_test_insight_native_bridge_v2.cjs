#!/usr/bin/env node
/* Isolated real-native-wallet bridge contract. Uses the original native
 * wallet's synchronous save mechanics, with TEST storage namespace guard.
 * No headless-browser mock is treated as physical phone acceptance.
 */
'use strict';
const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const load=p=>fs.readFileSync(p,'utf8');
function scenario(preview=true,lockMode='owned'){
 class Storage {
  constructor(){this.map=new Map();this.block=false;}
  get length(){return this.map.size;}
  getItem(k){return this.map.has(String(k))?this.map.get(String(k)):null;}
  setItem(k,v){
   if(this.block&&String(k).includes('bible-unfolded-rewards-v17'))throw Error('quota');
   this.map.set(String(k),String(v));
  }
  removeItem(k){this.map.delete(String(k));}
  clear(){this.map.clear();}
  key(i){return [...this.map.keys()][i]||null;}
 }
 const storage=new Storage(),session=new Storage(),child={},foreign={},events=[],closed={active:true};
 session.setItem('session-keep','untouched');
 const seed={coins:999,points:777,earned:['live-x'],purchases:['seawheel'],hints:{}};
 storage.setItem('bible-unfolded-rewards-v17',JSON.stringify(seed));
 storage.setItem('bible-unfolded-rewards-v17-recovery-v3811',JSON.stringify(seed));
 storage.setItem('bible-unfolded-wheel-ownership-v3825','{"owned":["seawheel"]}');
 const legacy={level:0,completed:[0],sparks:[],claimedSparks:['0:CAIN'],
  paidBonuses:['satchel:0'],claimedFreeHints:[1]};
 storage.setItem('bu-visual-lab-wordtrails-next-v1',JSON.stringify(legacy));
 const location={pathname:'/Bible-Unfolded-Visual-Lab/index.html',
  hostname:'basilejoseph325-jpg.github.io',
  search:preview?'?bu_shared_wallet_preview=1':''};
 const window={location,localStorage:storage,sessionStorage:session,indexedDB:null,
  addEventListener(){},parent:null,dispatchEvent:e=>events.push(e.type),
  BUWTNativeShell:{active:()=>closed.active}};
 window.parent=window;
 const document={readyState:'loading',addEventListener(){},
  getElementById:id=>id==='bu-wt-native-game'?{contentWindow:child}:null};
 // The unit fixture acquires a mock lock synchronously; real Chromium/WebKit
 // tests below verify actual asynchronous cross-tab Web Lock arbitration.
 const navigator=lockMode==='unsupported'?{}:{locks:{request(name,options,callback){
  const handle=lockMode==='conflict'?null:{name,mode:'exclusive'};
  const outcome=callback(handle);
  return Promise.resolve(outcome);
 }}};
 const globals={Storage,window,document,location,navigator,
  localStorage:storage,sessionStorage:session,URLSearchParams,CustomEvent:class{constructor(type){this.type=type;}}};
 const ctx=vm.createContext(globals);
 vm.runInContext(load('experiments/bu-test-native-storage-fence-v1.js'),ctx);
 vm.runInContext(`
 let economy={coins:60,points:123,earned:[],purchases:[],hints:{}};
 let updates=0;
 function bu3824RefreshWallet(){
  const raw=localStorage.getItem('bible-unfolded-rewards-v17');
  if(raw)economy={...economy,...JSON.parse(raw)};
 }
 function saveEconomy(){
  const json=JSON.stringify(economy);
  try{localStorage.setItem('bible-unfolded-rewards-v17',json);
   if(localStorage.getItem('bible-unfolded-rewards-v17')!==json)return false;
   try{localStorage.setItem('bible-unfolded-rewards-v17-recovery-v3811',json);}catch(_){}
   return true;}catch(_){return false;}
 }
 function updateWallet(){updates++;}
 saveEconomy();
 `,ctx);
 vm.runInContext(load('experiments/bu-test-word-trails-economy-v1.js'),ctx);
 vm.runInContext(load('experiments/bu-test-insight-native-bridge-v2.js'),ctx);
 return {storage,session,window,child,foreign,closed,ctx,events,legacy,live:JSON.stringify(seed)};
}
{
 const x=scenario(true),api=x.window.BUTestInsightBridge;
 assert(x.window.BUPreviewStorageFence?.active,'preview fence must be installed');
 x.session.setItem('same-session-key','ordinary');
 assert.equal(x.session.getItem('same-session-key'),'ordinary');
 assert.equal(x.session.getItem('session-keep'),'untouched');
 assert.equal(x.session.key(0),'session-keep');
 x.session.clear();
 assert.equal(x.session.getItem('session-keep'),null);
 assert.equal(x.session.getItem('same-session-key'),null);
 assert(api?.version.includes('native'),'native shared bridge must be installed');
 assert.equal(x.window.BUPreviewStorageFence.originalKeyValue('bible-unfolded-rewards-v17'),x.live);
 assert.equal(api.nativeBalance().balance,60);
 const migrated=JSON.parse(x.storage.getItem('bu-visual-lab-shared-preview-20261116:bible-unfolded-rewards-v17'));
 assert.equal(migrated.wtPreviewMigration,1);
 assert.equal(api.snapshot(x.foreign).reason,'inactive-word-trails-frame');
 assert.equal(api.transact(x.child,{type:'level',level:1}).legacy,true);
 assert.equal(api.transact(x.child,{type:'discovery',level:1,word:'CAIN'}).legacy,true);
 assert.equal(api.transact(x.child,{type:'satchel',level:1}).legacy,true);
 assert.equal(api.snapshot(x.child).balance,60);
 let gameplay={...x.legacy,level:1,completed:[0,1],
  claimedSparks:['0:CAIN','1:EDEN'],paidBonuses:['satchel:0','satchel:1'],
  progress:{level:1,hinted:[]}};
 x.storage.setItem('bu-visual-lab-wordtrails-shared-preview-v1',JSON.stringify(gameplay));
 const level=api.transact(x.child,{type:'level',level:2,delta:99999});
 assert.equal(level.ok,true);assert.equal(level.balance,64);
 assert.equal(api.transact(x.child,{type:'level',level:2}).duplicate,true);
 assert.equal(api.transact(x.child,{type:'discovery',level:2,word:'EDEN'}).balance,65);
 assert.equal(api.transact(x.child,{type:'satchel',level:2}).balance,66);
 assert.equal(api.transact(x.child,{type:'hint',level:2,cell:'0:0',delta:10000}).balance,51);
 assert.equal(api.transact(x.child,{type:'hint',level:2,cell:'0:0'}).duplicate,true);
 assert.equal(api.snapshot(x.child).balance,51);
 assert.equal(api.transact(x.child,{type:'hint',level:2,cell:'0:0'}).balance,51);
 // Simulate a second tab's newer write arriving while this tab is stale.
 // The preview must REFUSE to overwrite that newer wallet record.
 const foreign=JSON.parse(x.storage.getItem('bible-unfolded-rewards-v17'));
 foreign.coins+=6;
 x.storage.setItem('bible-unfolded-rewards-v17',JSON.stringify(foreign));
 x.storage.setItem('bible-unfolded-rewards-v17-recovery-v3811',JSON.stringify(foreign));
 const staleSave=vm.runInContext('economy.coins+=7;saveEconomy()',x.ctx);
 assert.equal(staleSave,false,'stale tab may not overwrite newer saved coins');
 assert.equal(JSON.parse(x.storage.getItem('bible-unfolded-rewards-v17')).coins,57);
 assert.equal(api.snapshot(x.child).balance,57,'refresh must take newer balance from disk');
 assert.equal(api.transact(x.child,{type:'seal',level:2}).reason,'invalid-earning-or-hint');
 assert.equal(api.transact(x.foreign,{type:'level',level:3}).reason,'inactive-word-trails-frame');
 gameplay={...gameplay,level:2,completed:[0,1,2],progress:{level:2,hinted:[]}};
 x.storage.setItem('bu-visual-lab-wordtrails-shared-preview-v1',JSON.stringify(gameplay));
 x.storage.block=true;
 const broken=api.transact(x.child,{type:'level',level:3});
 assert.equal(broken.ok,false);
 x.storage.block=false;
 assert.equal(api.snapshot(x.child).balance,57,'failed save cannot deduct');
 assert.equal(api.transact(x.child,{type:'level',level:3}).balance,61,'retry must succeed');
 x.closed.active=false;
 assert.equal(api.snapshot(x.child).ok,false,'closed iframe must never transact');
 assert.equal(x.window.BUPreviewStorageFence.originalKeyValue('bible-unfolded-rewards-v17'),x.live,'LIVE primary stays byte-identical');
 assert.equal(x.window.BUPreviewStorageFence.originalKeyValue('bible-unfolded-rewards-v17-recovery-v3811'),x.live,'LIVE recovery stays byte-identical');
 assert.equal(x.window.BUPreviewStorageFence.originalKeyValue('bible-unfolded-wheel-ownership-v3825'),'{"owned":["seawheel"]}');
 assert.throws(()=>x.storage.clear(),/forbids clearing/);
 assert(x.events.includes('bu-test-insight-change'));
}
{
 const x=scenario(true,'conflict');
 assert.equal(x.window.BUPreviewStorageFence.writerStatus().status,'conflict');
 assert.equal(x.window.BUPreviewStorageFence.writerStatus().writable,false);
 assert.throws(()=>x.storage.setItem('bible-unfolded-rewards-v17','{}'),/read-only/);
 assert.equal(x.window.BUTestInsightBridge.nativeBalance().ok,false);
 assert.equal(x.window.BUPreviewStorageFence.originalKeyValue('bible-unfolded-rewards-v17'),x.live);
}
{
 const x=scenario(true,'unsupported');
 assert.equal(x.window.BUPreviewStorageFence.writerStatus().status,'unsupported');
 assert.throws(()=>x.storage.removeItem('bible-unfolded-rewards-v17'),/read-only/);
 assert.equal(x.window.BUTestInsightBridge.nativeBalance().ok,false);
 assert.equal(x.window.BUPreviewStorageFence.originalKeyValue('bible-unfolded-rewards-v17'),x.live);
}
{
 const x=scenario(false);
 assert.equal(x.window.BUTestInsightBridge,undefined);
 assert.equal(x.window.BUPreviewStorageFence,undefined);
}
console.log('PASS native shared-wallet preview: original LIVE bytes protected, migration blocks old rewards, real saved wallet earn/spend, 15-token hints, duplicate receipts, failed-write rollback, active iframe only');

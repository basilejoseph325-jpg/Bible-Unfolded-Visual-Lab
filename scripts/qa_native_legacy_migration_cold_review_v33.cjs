#!/usr/bin/env node
'use strict';
/* v33 TEST native cold-start legacy transition review, all fake storage.
 * Optional argv[2] is pinned ORIGINAL protected LIVE script downloaded
 * read-only. No actual LIVE site / player storage is accessed.
 */
const assert=require('node:assert/strict'),vm=require('node:vm');
const fs=require('node:fs'),crypto=require('node:crypto');
const native=fs.readFileSync('bu-platform-saves-v2.js','utf8');
const LIVE='bible-unfolded-word-trails-next-v1';
const TEST='bu-visual-lab-wordtrails-next-v1';
const W='bible-unfolded-rewards-v17';
const J='bu-visual-lab-import-rollback-v2';
const jsonify=JSON.stringify;
const oldWallet=jsonify({coins:470,points:-8,purchases:['seawheel'],equippedWheel:'seawheel'});
const testState=jsonify({level:1,unlocked:2,coins:35,points:11,completed:[0],
 sparks:[],claimedSparks:[],boardBible:[],paidWords:[],paidBonuses:[],
 claimedFreeHints:[],progress:{level:1,found:['ELI'],bonuses:[],hinted:[],combo:1}});
const oldMigrated=jsonify({level:1,unlocked:2,coins:60,points:0,
 migration:{version:1,source:'Visual Lab crossword progress',temporaryCoinsExcluded:true}});
let testCount=0;
function pass(t){console.log('PASS_NATIVE_LEGACY_COLD_REVIEW_V33_'+(++testCount)+' '+t)}
function fixture(init){
 const data=new Map(Object.entries(init)),writes=[],registry=new Map(),listeners={};
 function node(tag){
  const handlers={},children=[];
  const e={tagName:tag.toUpperCase(),children,style:{},textContent:'',value:'',files:[],
   addEventListener(name,fn){(handlers[name]??=[]).push(fn)},
   click(){for(const fn of handlers.click||[])fn({preventDefault(){},stopImmediatePropagation(){}})},
   append(child){children.push(child);child.parentNode=this;if(child.id)registry.set(child.id,child)},
   closest(selector){return selector==='.save-transfer'?area:null},
   setAttribute(){},remove(){registry.delete(this.id);
    if(this.parentNode){const a=this.parentNode.children;a.splice(a.indexOf(this),1)}}
  };
  Object.defineProperty(e,'id',{get(){return this._id||''},set(id){this._id=id;registry.set(id,this)}});
  return e;
 }
 const area=node('div'),save=node('button'),picker=node('input');
 area.className='save-transfer';save.id='save-export';save.onclick=()=>{};
 picker.id='save-file';picker.onchange=()=>{};
 area.append(save);area.append(picker);
 const doc={readyState:'complete',body:node('body'),createElement:node,
  getElementById:id=>registry.get(id)||null,addEventListener(){}};
 const storage={
  get length(){return data.size},key:i=>[...data.keys()][i]??null,
  getItem:k=>data.has(k)?data.get(k):null,
  setItem(k,value){data.set(k,String(value));writes.push(['set',k])},
  removeItem(k){data.delete(k);writes.push(['remove',k])}
 };
 const win={addEventListener(k,fn){(listeners[k]??=[]).push(fn)}};
 const downloadContents=[];
 class FakeBlob{constructor(parts){downloadContents.push(parts.join(''))}}
 const url={createObjectURL:()=> 'blob:synthetic',revokeObjectURL(){}};
 const ctx=vm.createContext({window:win,document:doc,localStorage:storage,Blob:FakeBlob,
  URL:url,setTimeout(){},location:{reload(){}},console,confirm:()=>false});
 vm.runInContext(native,ctx,{timeout:5000,filename:'real-test-native-v33.js'});
 assert(win.BUPlatformSaves?.bound?.());
 return {data,writes,win,doc,storage,downloadContents,listeners,picker};
}
function output(e){return [e?.textContent||'',...(e?.children||[]).map(output)].join(' ')}
(async()=>{
 const missing=fixture({[W]:oldWallet,[TEST]:testState});
 const v=missing.win.BUPlatformSaves.legacyTransitionStatus();
 assert.equal(v.oldImporterCouldRecreateMissingLive,true);
 assert.equal(v.oldMigrationMarkerPresent,false);
 assert.equal(v.liveSavePresent,false);
 assert.equal(v.testSavePresent,true);
 assert.equal(v.readOnly,true);
 assert.equal(v.approvalToImportOrPromote,false);
 assert.equal(missing.writes.length,0);
 const panel=missing.doc.getElementById('bu-wt-legacy-transition-review');
 assert(panel&&panel.tagName==='DETAILS');
 assert(output(panel).includes('older LIVE importer'));
 assert(output(panel).includes('could recreate'));
 pass('cold TEST correctly notices missing LIVE with importable TEST, without creating a LIVE sentinel');
 const btn=missing.doc.getElementById('bu-wt-legacy-transition-current-backup');
 assert(btn);
 btn.click();
 assert.equal(missing.downloadContents.length,1);
 const backup=JSON.parse(missing.downloadContents[0]);
 assert.equal(backup.keys[LIVE],undefined);
 assert.equal(backup.keys[W],oldWallet);
 assert.equal(backup.extensions.wordTrailsNext.state,testState);
 assert.equal(missing.writes.length,0);
 pass('cold transition panel offers non-destructive current TEST backup and never includes LIVE key');
 // Exact remote LIVE migration also changes the read-only notice from
 // "could recreate missing LIVE" to "migration marker already observed".
 // Synthetic remote storage mutation bypasses the current tab's setItem.
 missing.data.set(LIVE,oldMigrated);
 for(const cb of missing.listeners.storage||[])cb({
  key:LIVE,oldValue:null,newValue:oldMigrated,storageArea:missing.storage});
 const next=missing.doc.getElementById('bu-wt-legacy-transition-review');
 assert(next&&next!==panel,'Should refresh stale missing-LIVE risk copy');
 assert(output(next).includes('past migration data'));
 assert(!output(next).includes('LIVE crossword progress is missing'));
 assert.equal(missing.win.BUPlatformSaves.legacyTransitionStatus().oldMigrationMarkerPresent,true);
 assert.equal(missing.writes.length,0,'Warning refresh may not write native progress');
 pass('cold-start warning refreshes when an older LIVE migration arrives while TEST is open');
 const marked=fixture({[W]:oldWallet,[TEST]:testState,[LIVE]:oldMigrated});
 assert.equal(marked.win.BUPlatformSaves.legacyTransitionStatus().oldMigrationMarkerPresent,true);
 assert.equal(marked.win.BUPlatformSaves.legacyTransitionStatus().oldImporterCouldRecreateMissingLive,false);
 assert(output(marked.doc.getElementById('bu-wt-legacy-transition-review')).includes('past migration data'));
 assert.equal(marked.writes.length,0);
 pass('historic old-LIVE migration marker is recognized without asserting an old tab remains open');
 const clean=fixture({[W]:oldWallet,[TEST]:testState,
  [LIVE]:jsonify({level:2,completed:[0,1],coins:60})});
 assert.equal(clean.win.BUPlatformSaves.legacyTransitionStatus().oldMigrationMarkerPresent,false);
 assert.equal(clean.win.BUPlatformSaves.legacyTransitionStatus().oldImporterCouldRecreateMissingLive,false);
 assert.equal(clean.doc.getElementById('bu-wt-legacy-transition-review'),null);
 assert.equal(clean.writes.length,0);
 pass('normal protected LIVE save and TEST progress yield no extra warning');
 const empty=fixture({[W]:oldWallet});
 assert.equal(empty.win.BUPlatformSaves.legacyTransitionStatus().testSavePresent,false);
 assert.equal(empty.doc.getElementById('bu-wt-legacy-transition-review'),null);
 assert.equal(empty.writes.length,0);
 pass('no LIVE and no TEST save does not create false transition-risk warning');
 const bad=fixture({[W]:oldWallet,[TEST]:'{"level":2,"unlocked":2,"completed":"invalid"}'});
 assert.equal(bad.win.BUPlatformSaves.legacyTransitionStatus().oldImporterCouldRecreateMissingLive,false);
 assert.equal(bad.doc.getElementById('bu-wt-legacy-transition-review'),null);
 assert.equal(bad.writes.length,0);
 pass('invalid TEST legacy source cannot trigger old importer and is not labelled importable');
 const spoofed=fixture({[W]:oldWallet,[TEST]:testState,
  [LIVE]:jsonify({level:4,coins:60,migration:{version:1,source:'unknown'}})});
 assert.equal(spoofed.win.BUPlatformSaves.legacyTransitionStatus().oldMigrationMarkerPresent,false);
 assert.equal(spoofed.doc.getElementById('bu-wt-legacy-transition-review'),null);
 pass('only the actual old migration signature triggers a historical marker warning');
 const unresolved=fixture({[W]:oldWallet,[TEST]:testState,[J]:jsonify({version:1,previous:{[W]:oldWallet}})});
 assert(unresolved.doc.getElementById('bu-wt-recovery-review'));
 assert(unresolved.doc.getElementById('bu-wt-legacy-transition-review'));
 assert.equal(unresolved.writes.length,0);
 pass('unresolved crash journal and read-only migration history coexist without saved-data writes');
 // Exercise the EXACT pinned original LIVE migration source on the same fake
 // storage, proving what the old code would do with a missing LIVE key.
 const filename=process.argv[2];
 if(filename){
  const src=fs.readFileSync(filename,'utf8');
  const b=Buffer.from(src,'utf8');
  const gitBlob=crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
  assert.equal(gitBlob,'52d0a564a16a964daf70e156e46e7d7866480c81',
   'Original protected LIVE source changed; do not quietly test a different script');
  const remote=fixture({[W]:oldWallet,[TEST]:testState});
  const vmctx=vm.createContext({localStorage:remote.storage});
  vm.runInContext(src,vmctx,{timeout:5000,filename:'original-protected-live-migration-v1.js'});
  const liveResult=JSON.parse(remote.data.get(LIVE));
  assert.equal(liveResult.migration.version,1);
  assert.equal(liveResult.migration.source,'Visual Lab crossword progress');
  assert.equal(liveResult.coins,60);
  assert.equal(liveResult.points,0);
  assert.equal(remote.data.get(W),oldWallet);
  assert.equal(remote.data.get(TEST),testState);
  assert.deepEqual(remote.writes,[['set',LIVE]]);
  pass('EXACT original LIVE migration actually recreates LIVE from TEST without changing wallet');
  vm.runInContext(src,vmctx,{timeout:5000});
  assert.equal(remote.writes.length,1,'Old LIVE importer should be a one-time action while LIVE exists');
  pass('original LIVE migration does not overwrite an existing LIVE save');
  const afterward=fixture(Object.fromEntries(remote.data));
  assert(afterward.win.BUPlatformSaves.legacyTransitionStatus().oldMigrationMarkerPresent);
  assert.equal(afterward.writes.length,0);
  pass('new TEST session can see migration made earlier by the exact old LIVE source');
 }
 console.log('PASS_NATIVE_LEGACY_MIGRATION_COLD_REVIEW_V33',JSON.stringify({
  cases:testCount,pinnedOriginalLiveSourceVerified:!!filename,
  readOnlyColdStart:true,looksUsableMatchesOldSource:true,
  noLiveSaveMutation:true,noNativeWalletMutation:true,
  currentBackupOnly:true,noRealPlayerDataAccessed:true
 }));
})().catch(e=>{console.error('FAIL_NATIVE_LEGACY_MIGRATION_COLD_REVIEW_V33',e.stack||e);process.exitCode=1});

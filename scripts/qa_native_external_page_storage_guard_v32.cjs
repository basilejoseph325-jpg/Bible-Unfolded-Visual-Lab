#!/usr/bin/env node
'use strict';
/* TEST v32 same-origin concurrent page guard using ACTUAL native coordinator,
 * fake DOM and fictional storage. No genuine browser data or LIVE source touched.
 */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('bu-platform-saves-v2.js','utf8');
const LIVE='bible-unfolded-word-trails-next-v1',W='bible-unfolded-rewards-v17';
const WB='bible-unfolded-rewards-v17-recovery-v3811';
const OW='bible-unfolded-wheel-ownership-v3825';
const T='bu-visual-lab-wordtrails-next-v1',J='bu-visual-lab-import-rollback-v2';
const txt=JSON.stringify,oldWallet=txt({coins:504,points:-8,purchases:['seawheel'],equippedWheel:'seawheel'});
const testProgress=txt({level:1,unlocked:3,coins:48,points:12,completed:[0],sparks:[],
 claimedSparks:[],boardBible:[],paidWords:[],paidBonuses:[],claimedFreeHints:[],
 progress:{level:1,found:['ELI'],bonuses:[],hinted:[],combo:1}});
const oldLive=txt({level:10,completed:[0,1],coins:60});
const migrated=txt({level:2,coins:60,points:0,migration:{version:1,source:'Visual Lab crossword progress'}});
const base={[LIVE]:oldLive,[W]:oldWallet,[WB]:oldWallet,
 [OW]:txt({version:1,owned:['seawheel']}),[T]:testProgress};
function make(seed={}){
 const data=new Map(Object.entries({...base,...seed})),writes=[],listeners={}, registry=new Map();
 const wrapper=makeNode('div');wrapper.className='save-transfer';
 function makeNode(tag){
  const children=[],events={};
  const el={tagName:tag.toUpperCase(),children,style:{},textContent:'',
   files:[],value:'',addEventListener(type,handler){(events[type]??=[]).push(handler)},
   click(){for(const cb of events.click||[])cb({preventDefault(){},stopImmediatePropagation(){}})},
   get events(){return events},append(child){children.push(child);child.parentNode=this;if(child.id)registry.set(child.id,child)},
   closest(sel){return sel==='.save-transfer'?wrapper:null},
   remove(){registry.delete(this.id);if(this.parentNode){const a=this.parentNode.children;a.splice(a.indexOf(this),1)}},
   setAttribute(){}
  };
  Object.defineProperty(el,'id',{get(){return this._id||''},set(x){this._id=x;registry.set(x,this)}});
  return el;
 }
 let originalCalls=0,dialogs=0,downloads=0;
 const exportBtn=makeNode('button');exportBtn.id='save-export';exportBtn.onclick=()=>originalCalls++;
 const picker=makeNode('input');picker.id='save-file';picker.onchange=()=>originalCalls++;
 wrapper.append(exportBtn);wrapper.append(picker);
 const doc={readyState:'complete',body:makeNode('body'),
  getElementById:id=>registry.get(id)||null,createElement:makeNode,addEventListener(){}};
 const storage={
  get length(){return data.size},key:i=>[...data.keys()][i]??null,
  getItem:k=>data.has(k)?data.get(k):null,
  setItem(k,v){writes.push(['set',k]);data.set(k,String(v))},
  removeItem(k){writes.push(['remove',k]);data.delete(k)}
 };
 const win={addEventListener(kind,listener){(listeners[kind]??=[]).push(listener)}};
 const blobContents=[];
 class FakeBlob{constructor(parts){blobContents.push(parts.join(''))}}
 const URL={createObjectURL(){downloads++;return 'blob:fake'},revokeObjectURL(){}};
 const ctx=vm.createContext({window:win,document:doc,localStorage:storage,Blob:FakeBlob,URL,
  setTimeout(){},confirm(){dialogs++;return false},location:{reload(){}},console});
 vm.runInContext(source,ctx,{filename:'actual-native-v32.js',timeout:5000});
 assert.equal(win.BUPlatformSaves.bound(),true);
 function event(key,oldValue,newValue,foreignArea){
  for(const cb of listeners.storage||[])cb({
   key,oldValue,newValue,storageArea:foreignArea||storage});
 }
 return {data,writes,win,doc,picker,wrapper,event,blobContents,
  get originalCalls(){return originalCalls},get dialogs(){return dialogs},get downloads(){return downloads}};
}
function allText(el){return [el.textContent,...el.children.flatMap(allText)].join(' ')}
function testBackup(f){const b=f.win.BUPlatformSaves.makeBackup();return txt(b)}
async function pickerImport(f,format){
 const backup=format===1?txt({format:'BibleUnfoldedSave',version:1,keys:{[W]:oldWallet}}):testBackup(f);
 const before=new Map(f.data),prior=f.writes.length;
 f.picker.files=[{size:backup.length,text:async()=>backup}];
 f.picker.value='fictional-'+format+'.json';
 await f.picker.onchange({type:'change'});
 assert.equal(f.picker.value,'');
 assert.equal(f.originalCalls,0,'Original native import handler should not run');
 assert.equal(f.dialogs,0,'No consent dialog should occur for blocked import');
 assert.deepEqual([...f.data],[...before],'Native/game data was mutated after external event');
 assert.equal(f.writes.length,prior,'A blocked import must not issue any storage mutations');
}
let n=0;const pass=x=>console.log('PASS_EXTERNAL_PAGE_GUARD_V32_'+(++n)+' '+x);
(async()=>{
 {
  const f=make();
  assert.equal(f.win.BUPlatformSaves.externalChangeStatus().detected,false);
  assert.equal(f.writes.length,0);
  f.event('unrelated-app-cache',null,'x');
  f.event(W,oldWallet,oldWallet);
  f.event(W,oldWallet,txt({coins:700}),{getItem(){}});
  assert.equal(f.win.BUPlatformSaves.externalChangeStatus().detected,false);
  assert.equal(f.doc.getElementById('bu-wt-external-page-review'),null);
  pass('normal startup, unrelated changes and unrelated storage area are ignored');
 }
 {
  const f=make(),before=new Map(f.data);
  f.event(LIVE,oldLive,migrated);
  const status=f.win.BUPlatformSaves.externalChangeStatus();
  assert.equal(status.detected,true);
  assert.equal(status.oldLiveMigrationObserved,true);
  assert(status.keys.includes(LIVE));
  assert.equal(status.warningOnly,true);
  assert.equal(status.cannotStopLegacyTabs,true);
  assert.deepEqual([...f.data],[...before]);
  assert.equal(f.writes.length,0,'Monitor may NOT write a safety sentinel to user storage');
  pass('LIVE migration signature from actual old script detected without saving anything');
  const panel=f.doc.getElementById('bu-wt-external-page-review');
  assert(panel&&panel.tagName==='DETAILS');
  const copy=allText(panel);
  for(const term of ['another open','LIVE Word Trails','older automatic','cannot stop',
   'current TEST progress','reopen TEST']){
   assert(copy.toLowerCase().includes(term.toLowerCase()),'Missing grounded warning '+term);
  }
  assert(!/click to delete|click to undo|reset saved progress now/i.test(copy));
  assert.equal(panel.children.filter(c=>c.tagName==='BUTTON').length,1);
  pass('review describes signature honestly and offers no restore/reset action');
  const button=f.doc.getElementById('bu-wt-external-current-backup');
  button.click();
  assert.equal(f.downloads,1);
  const backup=JSON.parse(f.blobContents[0]);
  assert.equal(backup.keys[LIVE],undefined);
  assert.equal(backup.keys[W],oldWallet);
  assert.equal(backup.extensions.wordTrailsNext.state,testProgress);
  assert.equal(f.writes.length,0);
  pass('player may request current TEST progress download without mutating saved data');
  assert.throws(()=>f.win.BUPlatformSaves.previewRestoreWrites(backup),
   /another Bible Unfolded page or frame/i);
  assert.throws(()=>f.win.BUPlatformSaves.applyBackup(backup,{reload:false}),
   /another Bible Unfolded page or frame/i);
  assert.equal(f.writes.length,0);
  pass('direct preview and restore API refuse competing writer within same TEST session');
  await pickerImport(f,1);pass('v1 native backup handler blocked after foreign migration event');
  await pickerImport(f,2);pass('v2 complete backup handler blocked after foreign migration event');
  f.event(LIVE,migrated,txt({level:3,coins:80}));
  assert.strictEqual(f.doc.getElementById('bu-wt-external-page-review'),panel);
  assert.equal(f.writes.length,0);
  pass('repeat storage events do not create duplicate UI or mutate progress');
 }
 {
  const f=make();f.event(W,oldWallet,txt({coins:504,points:50}));
  const status=f.win.BUPlatformSaves.externalChangeStatus();
  assert.equal(status.detected,true);
  assert.equal(status.oldLiveMigrationObserved,false);
  assert(status.keys.includes(W));
  assert(!allText(f.doc.getElementById('bu-wt-external-page-review')).includes('older automatic'));
  await pickerImport(f,1);await pickerImport(f,2);
  pass('ordinary remote native wallet write conservatively pauses imports without claiming migration');
 }
 {
  const f=make();f.event(OW,base[OW],txt({version:1,owned:['moonwheel']}));
  assert.equal(f.win.BUPlatformSaves.externalChangeStatus().detected,true);
  await pickerImport(f,2);
  pass('cross-document paid-wheel ownership update also pauses an older-backup overwrite');
 }
 {
  const f=make({[J]:txt({version:1,previous:{[W]:oldWallet}})});
  const original=f.doc.getElementById('bu-wt-recovery-review');
  f.event(LIVE,oldLive,migrated);
  assert.strictEqual(f.doc.getElementById('bu-wt-recovery-review'),original);
  assert(f.doc.getElementById('bu-wt-external-page-review'));
  assert.equal(f.writes.length,0);
  await pickerImport(f,1);
  pass('unresolved crash journal remains quarantined alongside simultaneous cross-page warning');
 }
 {
  const f=make();
  f.event(LIVE,oldLive,migrated);
  const another=make();
  assert.equal(another.win.BUPlatformSaves.externalChangeStatus().detected,false);
  assert.equal(another.writes.length,0);
  pass('session-only guard does not silently alter persistent state or invent a stale flag');
 }
 console.log('PASS_NATIVE_EXTERNAL_PAGE_GUARD_V32',JSON.stringify({
 cases:n,realOldLiveMigrationSignature:true,foreignWritesObservedWithoutClaimingTabIdentity:true,
 noStorageMutationsByGuard:true,legacyV1AndV2ImportsBlocked:true,readOnlyExportAvailable:true,
 noActualLIVERepoChanges:true,noRealPlayerDataAccessed:true
 }));
})().catch(e=>{console.error('FAIL_EXTERNAL_PAGE_GUARD_V32',e.stack||e);process.exitCode=1});

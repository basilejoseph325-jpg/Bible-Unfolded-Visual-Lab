#!/usr/bin/env node
'use strict';
/* v35: actual TEST native Settings import entry must fail CLOSED.
 * This tests the player-facing UI, NOT trusted low-level synthetic applyBackup.
 * No real player data or original LIVE repository is touched.
 */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const native=fs.readFileSync('bu-platform-saves-v2.js','utf8');
const W='bible-unfolded-rewards-v17',T='bu-visual-lab-wordtrails-next-v1';
const LIVE='bible-unfolded-word-trails-next-v1',J='bu-visual-lab-import-rollback-v2';
const wallet=JSON.stringify({coins:420,points:-12,purchases:['seawheel'],equippedWheel:'seawheel'});
const trail=JSON.stringify({level:1,unlocked:2,coins:37,points:8,completed:[0],sparks:[],
 claimedSparks:[],boardBible:[],paidWords:[],paidBonuses:[],claimedFreeHints:[],
 progress:{level:1,found:['ELI'],bonuses:[],hinted:[],combo:1}});
const live=JSON.stringify({level:12,unlocked:17,coins:300,completed:[0,1]});
let n=0;function pass(t){console.log('PASS_TEST_NATIVE_UI_IMPORT_SUSPENDED_V35_'+(++n)+' '+t)}
function setup(extra={}){
 const saved=new Map(Object.entries({[W]:wallet,[T]:trail,[LIVE]:live,...extra}));
 const writes=[],nodes=new Map(),listeners={},downloads=[];
 let originalImportCalls=0,originalClickCalls=0,confirms=0,fileReads=0;
 function node(tag){
  const el={tagName:tag.toUpperCase(),type:'',accept:'',files:[],value:'',textContent:'',
   style:{},children:[],attributes:{},handlers:{},open:false,
   addEventListener(name,fn,capture){
    (this.handlers[name]??=[]).push({fn,capture:!!capture});
   },
   setAttribute(k,v){this.attributes[k]=v},
   append(child){this.children.push(child);child.parentNode=this},
   remove(){nodes.delete(this.id);if(this.parentNode){const i=this.parentNode.children.indexOf(this);if(i>=0)this.parentNode.children.splice(i,1)}},
   closest(name){return name==='.save-transfer'?area:null},
   click(){return fire(this,'click')},
   dispatchEvent(e){return fire(this,e.type,e)}
  };
  Object.defineProperty(el,'id',{get(){return this._id||''},set(id){this._id=id;nodes.set(id,this)}});
  return el;
 }
 function fire(el,type,external){
  const e=external||{type};
  let stopped=false;
  e.preventDefault=e.preventDefault||function(){this.defaultPrevented=true};
  e.stopImmediatePropagation=e.stopImmediatePropagation||function(){stopped=true};
  for(const {fn} of (el.handlers[type]||[]).filter(x=>x.capture))
   {fn(e);if(stopped)return e}
  if(!stopped&&typeof el['on'+type]==='function')el['on'+type](e);
  if(!stopped)for(const {fn} of (el.handlers[type]||[]).filter(x=>!x.capture))
   {fn(e);if(stopped)break}
  return e;
 }
 const area=node('div'),exp=node('button'),imp=node('button'),picker=node('input');
 area.className='save-transfer';
 exp.id='save-export';exp.onclick=()=>{};
 imp.id='save-import';imp.onclick=()=>{originalClickCalls++;picker.click()};
 picker.id='save-file';picker.onchange=()=>{originalImportCalls++};
 area.append(exp);area.append(imp);area.append(picker);
 const doc={readyState:'complete',body:node('body'),createElement:node,
  getElementById:id=>nodes.get(id)||null,addEventListener(){}};
 const storage={get length(){return saved.size},key:i=>[...saved.keys()][i]??null,
  getItem:k=>saved.has(k)?saved.get(k):null,
  setItem(k,v){writes.push(['set',k]);saved.set(k,String(v))},
  removeItem(k){writes.push(['remove',k]);saved.delete(k)}};
 class FakeBlob{constructor(parts){downloads.push(parts.join(''))}}
 const URL={createObjectURL:()=> 'blob:synthetic',revokeObjectURL(){}};
 const win={addEventListener(type,cb){(listeners[type]??=[]).push(cb)}};
 const ctx=vm.createContext({window:win,document:doc,localStorage:storage,Blob:FakeBlob,URL,
  setTimeout(){},confirm(){confirms++;return true},console,location:{reload(){}}});
 vm.runInContext(native,ctx,{filename:'actual-native-ui-v35.js',timeout:5000});
 assert.equal(win.BUPlatformSaves?.bound?.(),true);
 return {saved,writes,nodes,listeners,exp,imp,picker,fire,win,downloads,
  get originalImportCalls(){return originalImportCalls},
  get originalClickCalls(){return originalClickCalls},
  get confirms(){return confirms},
  get fileReads(){return fileReads},
  payload(json){
   return {size:JSON.stringify(json).length,text:async()=>{fileReads++;return JSON.stringify(json)}};
  }};
}
function untouched(f,before,number){
 assert.deepEqual([...f.saved],[...before],'A player import changed native/TEST/LIVE progress');
 assert.equal(f.writes.length,number,'A player import touched localStorage');
 assert.equal(f.originalImportCalls,0,'Old native v1 onchange handler executed');
 assert.equal(f.originalClickCalls,0,'Old native import button onclick executed');
 assert.equal(f.confirms,0,'A legacy consent dialog was invoked');
 assert.equal(f.fileReads,0,'Blocked import should not even read selected player file');
 assert.equal(f.picker.value,'','Blocked file picker selection not cleared');
}
(async()=>{
 const f=setup(),backup=f.win.BUPlatformSaves.makeBackup();
 assert.equal(f.nodes.get('bu-wt-safe-preview-v34').tagName,'DETAILS');
 assert.equal(f.imp.attributes['aria-label'],'Review TEST backups; restore is temporarily disabled');
 assert.equal(f.writes.length,0);
 pass('real native Settings loads player-facing import block, export and read-only preview');
 const initial=new Map(f.saved),at=f.writes.length;
 f.imp.click();
 assert.equal(f.originalClickCalls,0);
 assert.equal(f.nodes.get('bu-wt-safe-preview-v34').open,true);
 assert(f.nodes.get('bu-wt-save-status').textContent.includes('RESTORE is temporarily disabled'));
 untouched(f,initial,at);
 pass('clicking original Import button opens review, never the old import picker');
 for(const [label,doc] of [
  ['old v1',{format:'BibleUnfoldedSave',version:1,keys:{[W]:wallet}}],
  ['complete v2',backup],
  ['unsupported', {format:'BibleUnfoldedSave',version:999,keys:{}}],
  ['mixed LIVE', {...backup,keys:{...backup.keys,[LIVE]:live}}]
 ]){
  const before=new Map(f.saved),count=f.writes.length;
  f.picker.files=[f.payload(doc)];
  f.picker.value='selected.json';
  // The fake DOM fires a true target capture listener, then the usual
  // original onchange only if stopImmediatePropagation did not happen.
  const e=f.fire(f.picker,'change');
  assert(e.defaultPrevented&&f.picker.value==='');
  untouched(f,before,count);
  pass(label+' input Change intercepted at capture phase before the old handler');
 }
 const before=new Map(f.saved),count=f.writes.length;
 f.picker.files=[f.payload(backup)];f.picker.value='selected.json';
 f.picker.onchange({preventDefault(){},stopImmediatePropagation(){}});
 untouched(f,before,count);
 pass('direct original input.onchange fallback is also fail closed');
 const exported=f.win.BUPlatformSaves.makeBackup();
 assert.equal(exported.keys[LIVE],undefined);
 assert.equal(f.win.BUPlatformSaves.verifyCurrentBackupCopy(exported).matchesCurrent,true);
 assert.equal(f.win.BUPlatformSaves.previewRestoreReview(exported).noWritesPerformed,true);
 f.exp.click();assert.equal(f.downloads.length,1);
 assert.equal(JSON.parse(f.downloads[0]).keys[LIVE],undefined);
 assert.equal(f.writes.length,0);
 pass('native Export and verified current-file plus read-only candidate preview remain available');
 const pending=setup({[J]:JSON.stringify({version:1,previous:{[W]:wallet}})});
 const old=new Map(pending.saved);const cnt=pending.writes.length;
 pending.imp.click();pending.picker.files=[pending.payload(backup)];
 pending.picker.value='selected.json';pending.fire(pending.picker,'change');
 untouched(pending,old,cnt);
 assert(pending.nodes.get('bu-wt-recovery-review'));
 pass('unresolved journal cannot bypass suspended native import');
 const another=setup();
 const p=another.win.BUPlatformSaves;
 const originalWrite=another.saved.get(W);
 another.saved.set(W,JSON.stringify({coins:700,points:0,purchases:['seawheel'],equippedWheel:'seawheel'}));
 for(const cb of another.listeners.storage||[])
  cb({key:W,oldValue:originalWrite,newValue:another.saved.get(W),
   storageArea:{getItem(){return null}}});
 const proof=another.nodes.get('bu-wt-safe-preview-v34');
 another.imp.click();assert(proof.open===true);
 assert.equal(another.originalClickCalls,0);
 assert.equal(another.writes.length,0);
 pass('competing wallet writer cannot reactivate Settings legacy import or allow progress write');
 console.log('PASS_TEST_NATIVE_UI_IMPORT_SUSPENDED_V35',JSON.stringify({
  cases:n,originalNativeV1HandlerNeverCalled:true,importButtonCannotOpenNativeRestore:true,
  bothBackupFormatsBlocked:true,zeroPlayerDataWrites:true,
  nativeExportAndReadonlyPreviewRetained:true,
  lowLevelSyntheticTransactionAPIStillAvailable:true,
  noRealPlayerStorageAccessed:true
 }));
})().catch(e=>{console.error('FAIL_TEST_NATIVE_UI_IMPORT_SUSPENDED_V35',e.stack||e);process.exitCode=1});

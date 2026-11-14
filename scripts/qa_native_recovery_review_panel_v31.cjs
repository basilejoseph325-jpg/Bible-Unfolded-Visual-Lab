#!/usr/bin/env node
'use strict';
/* Native TEST recovery panel v31: actual active code in fake VM DOM/storage.
 * No real player save is opened or mutated; all values are fictional.
 */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('bu-platform-saves-v2.js','utf8');
const J='bu-visual-lab-import-rollback-v2',C='bu-visual-lab-import-committed-v2';
const W='bible-unfolded-rewards-v17',T='bu-visual-lab-wordtrails-next-v1';
const LIVE='bible-unfolded-word-trails-next-v1';
const baselineWallet=JSON.stringify({coins:870,points:-10,purchases:['seawheel'],equippedWheel:'seawheel'});
const trail=JSON.stringify({level:1,unlocked:3,coins:81,points:30,completed:[0],
 sparks:[],claimedSparks:[],boardBible:[],paidWords:[],paidBonuses:[],
 claimedFreeHints:[],progress:{level:1,found:['ELI'],bonuses:[],hinted:[],combo:1}});
const live=JSON.stringify({coins:999,level:23,completed:[0,1,2]});
const journal=JSON.stringify({version:1,previous:{[W]:JSON.stringify({coins:4,points:1}),[T]:trail}});
function instance(extra={}){
 const store=new Map(Object.entries({[W]:baselineWallet,[T]:trail,[LIVE]:live,...extra}));
 const writes=[],registry=new Map(),urls=[],downloadParts=[],alerts=[];
 const container=element('div');container.className='save-transfer';
 function element(tag){
  const handlers={},children=[];
  const el={tagName:tag.toUpperCase(),children,style:{},attrs:{},textContent:'',value:'',files:[],
   setAttribute(k,v){this.attrs[k]=v},
   append(child){child.parentNode=this;children.push(child);if(child.id)registry.set(child.id,child)},
   remove(){if(this.parentNode){const i=this.parentNode.children.indexOf(this);if(i>=0)this.parentNode.children.splice(i,1)}if(this.id)registry.delete(this.id)},
   closest(q){return q==='.save-transfer'?container:null},
   addEventListener(k,fn){(handlers[k]??=[]).push(fn)},
   click(){for(const fn of handlers.click||[])fn({preventDefault(){},stopImmediatePropagation(){}})},
   get handlers(){return handlers}
  };
  Object.defineProperty(el,'id',{get(){return this._id||''},set(v){this._id=v;registry.set(v,this)}});
  return el;
 }
 let nativeCalls=0,confirmCalls=0;
 const nativeButton=element('button');nativeButton.id='save-export';nativeButton.onclick=()=>{nativeCalls++};
 const picker=element('input');picker.id='save-file';picker.onchange=()=>{nativeCalls++};
 container.append(nativeButton);container.append(picker);
 const body=element('body');
 const document={readyState:'complete',getElementById:id=>registry.get(id)||null,
  createElement:element,body,addEventListener(){}};
 const storage={
  get length(){return store.size},key:i=>[...store.keys()][i]??null,
  getItem:k=>store.has(k)?store.get(k):null,
  setItem(k,v){store.set(k,String(v));writes.push(['set',k])},
  removeItem(k){store.delete(k);writes.push(['remove',k])}
 };
 class FakeBlob{constructor(parts,options){downloadParts.push({parts,options});this.parts=parts}}
 const URL={createObjectURL(){const url='blob:fictional-'+(urls.length+1);urls.push(url);return url},
  revokeObjectURL(){}};
 const win={},ctx=vm.createContext({window:win,document,localStorage:storage,
  Blob:FakeBlob,URL,setTimeout(){},
  location:{reload(){}},confirm(){confirmCalls++;return true},console});
 vm.runInContext(source,ctx,{filename:'real-native-v31.js',timeout:5000});
 assert(win.BUPlatformSaves?.bound?.());
 return {win,document,store,writes,picker,nativeButton,get nativeCalls(){return nativeCalls},
  get confirmCalls(){return confirmCalls},downloadParts,urls,container};
}
function textOf(node){return [node.textContent,...node.children.flatMap(textOf)].join(' ')}
const passed=[];
const pass=x=>{passed.push(x);console.log('PASS_NATIVE_RECOVERY_REVIEW_V31_'+passed.length+' '+x)};
(async()=>{
 const f=instance({[J]:journal});
 const panel=f.document.getElementById('bu-wt-recovery-review');
 assert(panel&&panel.tagName==='DETAILS','Panel not created on actual native Settings');
 const status=f.document.getElementById('bu-wt-save-status');
 assert(status.textContent.includes('Backup recovery needs review'));
 const copy=textOf(panel);
 for(const s of ['current','partly restored','Downloads','LIVE and TEST','other old Bible Unfolded tabs']){
  assert(copy.toLowerCase().includes(s.toLowerCase()),'Missing player guidance: '+s);
 }
 assert(!/delete the journal|clear recovery record now|safe to import/.test(copy));
 assert.equal(panel.children.filter(x=>x.tagName==='BUTTON').length,1);
 assert.equal(f.writes.length,0);
 pass('actual native Settings shows clear non-destructive read-only recovery review');
 const button=f.document.getElementById('bu-wt-recovery-current-backup');
 assert(button&&button.textContent==='Download current TEST progress');
 button.click();
 assert.equal(f.downloadParts.length,1);
 const backup=JSON.parse(f.downloadParts[0].parts.join(''));
 assert.equal(backup.version,2);
 assert.equal(backup.keys[W],baselineWallet);
 assert.equal(backup.keys[LIVE],undefined,'Emergency backup must not include protected LIVE crossword');
 assert.equal(backup.keys[J],undefined);
 assert.equal(backup.extensions.wordTrailsNext.state,trail);
 assert.equal(f.writes.length,0,'Download click cannot mutate current native/game storage');
 assert(status.textContent.includes('Check Downloads'));
 pass('recovery button only requests a real v2 TEST download, with original LIVE save excluded');
 for(const ver of [1,2]){
  const payload=JSON.stringify(ver===1?
   {format:'BibleUnfoldedSave',version:1,keys:{[W]:baselineWallet}}:backup);
  const before=new Map(f.store),events=f.writes.length;
  f.picker.files=[{size:payload.length,text:async()=>payload}];
  f.picker.value='selected.json';
  await f.picker.onchange({type:'change'});
  assert.equal(f.picker.value,'');
  assert.equal(f.nativeCalls,0,'Original v1 native handler must not run during recovery');
  assert.equal(f.confirmCalls,0,'No import authorization dialog during quarantine');
  assert.deepEqual([...f.store],[...before],'Quarantined import changed storage');
  assert.equal(f.writes.length,events);
  assert(status.textContent.includes('RESTORE is temporarily disabled'));
  assert.strictEqual(f.document.getElementById('bu-wt-recovery-review'),panel,'Duplicate panel');
  pass('v'+ver+' file picker refuses old journal before any handler, wallet change or prompt');
 }
 const orphan=instance({[C]:'yes'});
 assert(orphan.document.getElementById('bu-wt-recovery-review'));
 assert.equal(orphan.writes.length,0);
 pass('orphaned generic commit marker displays recovery guidance without deleting evidence');
 const clean=instance();
 assert.equal(clean.document.getElementById('bu-wt-recovery-review'),null);
 assert.equal(clean.writes.length,0);
 const v1=JSON.stringify({format:'BibleUnfoldedSave',version:1,keys:{[W]:baselineWallet}});
 clean.picker.files=[{size:v1.length,text:async()=>v1}];
 await clean.picker.onchange({});
 assert.equal(clean.nativeCalls,0,'Native v1 original handler must NEVER run, even on a healthy TEST page');
 assert.equal(clean.confirmCalls,0,'Import confirmation cannot be shown before a safe transaction exists');
 assert.equal(clean.writes.length,0,'Healthy TEST must not accept old native v1 import');
 pass('healthy native Settings stays clean and v1 import is now suspended safely');
 console.log('PASS_NATIVE_RECOVERY_REVIEW_V31',JSON.stringify({cases:passed.length,
  nativeSettingsPanel:true,unresolvedV1AndV2ImportsBlocked:true,healthyV1ImportSuspended:true,
  currentProgressBackupOnly:true,liveCrosswordExcluded:true,
  noDestructiveAction:true,noRealPlayerDataAccessed:true}));
})().catch(e=>{console.error('FAIL_NATIVE_RECOVERY_REVIEW_V31',e.stack||e);process.exitCode=1});

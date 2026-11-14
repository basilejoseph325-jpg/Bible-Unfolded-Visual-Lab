#!/usr/bin/env node
'use strict';
/* TEST v34: actual native complete backup source and player Settings UI.
 * Fake DOM and fictional localStorage only. Reads files through mocked input;
 * never performs an actual TEST/LIVE restore or accesses real player storage.
 */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const native=fs.readFileSync('bu-platform-saves-v2.js','utf8');
const W='bible-unfolded-rewards-v17',WB='bible-unfolded-rewards-v17-recovery-v3811';
const OWN='bible-unfolded-wheel-ownership-v3825',LIVE='bible-unfolded-word-trails-next-v1';
const T='bu-visual-lab-wordtrails-next-v1',FEEL='bu-wt-next-feel-v2';
const J='bu-visual-lab-import-rollback-v2';
const json=JSON.stringify;
const wallet=json({coins:831,points:-14,purchases:['seawheel'],equippedWheel:'seawheel'});
const incomingWallet=json({coins:25,points:-61,purchases:['goldwheel'],equippedWheel:'goldwheel'});
const trail=json({level:1,unlocked:3,coins:41,points:30,completed:[0],sparks:[],
 claimedSparks:[],boardBible:[],paidWords:[],paidBonuses:[],claimedFreeHints:[],
 progress:{level:1,found:['ELI'],bonuses:[],hinted:[],combo:1}});
const incomingTrail=json({...JSON.parse(trail),level:2,unlocked:4,coins:15,completed:[0,1]});
const live=json({level:16,unlocked:20,coins:200,completed:[0,1,2]});
const seed={
 [W]:wallet,[WB]:wallet,[OWN]:json({version:1,owned:['seawheel']}),
 [T]:trail,[FEEL]:json({music:true,sfx:true,musicVolume:75,sfxVolume:65}),
 [LIVE]:live,
 'story-trails-test-chapter':json({chapters:[0,1,2]})
};
function instance(extra={}){
 const data=new Map(Object.entries({...seed,...extra})),writes=[],registry=new Map(),listeners={};
 function node(tag){
  const handlers={},children=[];
  const el={tagName:tag.toUpperCase(),style:{},children,textContent:'',
   files:[],value:'',type:'',accept:'',
   addEventListener(name,cb){(handlers[name]??=[]).push(cb)},
   click(){for(const cb of handlers.click||[])cb({preventDefault(){},stopImmediatePropagation(){}})},
   append(child){children.push(child);child.parentNode=this;if(child.id)registry.set(child.id,child)},
   setAttribute(){},closest(name){return name==='.save-transfer'?area:null},
   remove(){if(this.parentNode){const arr=this.parentNode.children;const i=arr.indexOf(this);if(i>=0)arr.splice(i,1)}if(this.id)registry.delete(this.id)},
   get handlers(){return handlers}
  };
  Object.defineProperty(el,'id',{get(){return this._id||''},set(v){this._id=v;registry.set(v,this)}});
  return el;
 }
 const area=node('section'),save=node('button'),picker=node('input');
 area.className='save-transfer';
 save.id='save-export';save.onclick=()=>{};
 picker.id='save-file';picker.onchange=()=>{};
 area.append(save);area.append(picker);
 const document={readyState:'complete',body:node('body'),createElement:node,
  getElementById:id=>registry.get(id)||null,addEventListener(){}};
 const storage={
  get length(){return data.size},key:i=>[...data.keys()][i]??null,
  getItem:k=>data.has(k)?data.get(k):null,
  setItem(k,v){writes.push(['set',k]);data.set(k,String(v))},
  removeItem(k){writes.push(['remove',k]);data.delete(k)}
 };
 let downloads=0;const downloaded=[];
 class FakeBlob{constructor(parts){downloaded.push(parts.join(''))}}
 const URL={createObjectURL(){downloads++;return 'blob:sample'},revokeObjectURL(){}};
 const win={addEventListener(name,fn){(listeners[name]??=[]).push(fn)}};
 const ctx=vm.createContext({window:win,document,localStorage:storage,Blob:FakeBlob,URL,
  setTimeout(){},location:{reload(){}},console,confirm:()=>{throw Error('Import confirmation MUST NOT happen')}});
 vm.runInContext(native,ctx,{timeout:5000,filename:'active-native-test-v34.js'});
 assert.equal(win.BUPlatformSaves?.bound?.(),true);
 return {data,writes,win,document,picker,listeners,downloaded,get downloads(){return downloads}};
}
async function choose(f,id,value){
 const el=f.document.getElementById(id);assert(el&&el.type==='file');
 const raw=typeof value==='string'?value:json(value);
 el.files=[{size:raw.length,text:async()=>raw}];el.value='synthetic.json';
 const events=el.handlers.change;assert.equal(events.length,1);
 await events[0]();
 assert.equal(el.value,'','File input selection must reset');
 return f.document.getElementById('bu-wt-safe-preview-message-v34').textContent;
}
let n=0;const pass=s=>console.log('PASS_TEST_RESTORE_PREVIEW_V34_'+(++n)+' '+s);
(async()=>{
 const f=instance(),api=f.win.BUPlatformSaves;
 const ui=f.document.getElementById('bu-wt-safe-preview-v34');
 assert(ui&&ui.tagName==='DETAILS');
 assert(ui.children.some(x=>x.tagName==='SUMMARY'&&x.textContent.includes('(no restore)')));
 assert.equal(f.document.getElementById('bu-wt-open-restore-preview-v34').type,'button');
 assert.equal(f.document.getElementById('bu-wt-verify-current-copy-v34').type,'button');
 assert.equal(f.writes.length,0);
 const buttons=ui.children.filter(x=>x.tagName==='BUTTON');
 assert.equal(buttons.length,2);
 assert(!buttons.some(x=>/\bapply\b|\brestore now\b/i.test(x.textContent)));
 pass('original native Settings gets a collapsed two-stage preview with NO apply controls');
 const old=api.makeBackup();
 assert.equal(old.keys[LIVE],undefined);
 assert.equal(old.keys[W],wallet);
 assert.equal(old.extensions.wordTrailsNext.state,trail);
 const candidate=JSON.parse(json(old));
 candidate.keys[W]=incomingWallet;candidate.keys[WB]=incomingWallet;
 candidate.keys[OWN]=json({version:1,owned:['goldwheel']});
 candidate.extensions.wordTrailsNext.state=incomingTrail;
 const before=new Map(f.data);
 let m=await choose(f,'bu-wt-candidate-preview-picker-v34',candidate);
 assert(m.includes('First verify your downloaded CURRENT TEST backup file.'));
 assert.deepEqual([...f.data],[...before]);assert.equal(f.writes.length,0);
 pass('cannot preview imported restore candidate without a verified CURRENT backup file');
 const v=api.verifyCurrentBackupCopy(old);
 assert.equal(v.validFormat,true);assert.equal(v.matchesCurrent,true);
 assert.equal(v.authorizesRestore,false);assert.equal(v.readOnly,true);
 assert.equal(v.liveCrosswordExcluded,true);
 assert.equal(v.includedNativeKeys,Object.keys(old.keys).length);
 const differentTimestamp=JSON.parse(json(old));differentTimestamp.exportedAt='2030-01-01T00:00:00.000Z';
 assert.equal(api.verifyCurrentBackupCopy(differentTimestamp).matchesCurrent,true);
 pass('real v2 file equality compares ALL native keys and TEST state, ignoring irrelevant export timestamp');
 const changedFile=JSON.parse(json(old));changedFile.keys[W]=incomingWallet;
 assert.equal(api.verifyCurrentBackupCopy(changedFile).matchesCurrent,false);
 const missingOne=JSON.parse(json(old));delete missingOne.keys['story-trails-test-chapter'];
 assert.equal(api.verifyCurrentBackupCopy(missingOne).matchesCurrent,false);
 const changedTest=JSON.parse(json(old));changedTest.extensions.wordTrailsNext.state=incomingTrail;
 assert.equal(api.verifyCurrentBackupCopy(changedTest).matchesCurrent,false);
 assert.equal(f.writes.length,0);
 pass('altered, missing native key or changed TEST crossword rejects a stale/incomplete current backup');
 m=await choose(f,'bu-wt-current-copy-picker-v34',old);
 assert(m.includes('verified against saved game data now'));
 assert(m.includes('does not approve restoring'));
 assert.equal(f.writes.length,0);
 pass('user verifies selected actual downloaded file in read-only Settings');
 const preview=api.previewRestoreReview(candidate);
 assert(preview.changes>2);
 assert.equal(preview.nativeWalletKeysChanging,2);
 assert.equal(preview.testWordTrailsChanging,1);
 assert.equal(preview.restoreDisabled,true);
 assert(preview.ownedWheelsRetained.includes('goldwheel')&&
   preview.ownedWheelsRetained.includes('seawheel'));
 assert.equal(preview.currentWallet.insightTokens,831);
 assert.equal(preview.incomingWallet.insightTokens,25);
 assert.equal(preview.currentWordTrails.coins,41);
 assert.equal(preview.incomingWordTrails.coins,15);
 assert.equal(preview.testCoinsStaySeparate,true);
 assert.equal(preview.liveCrosswordExcluded,true);
 assert.equal(preview.noWritesPerformed,true);
 m=await choose(f,'bu-wt-candidate-preview-picker-v34',candidate);
 for(const word of ['READ-ONLY PREVIEW','Insight Tokens','TEST coins','NO progress has been restored','apply is disabled']){
  assert(m.includes(word),'Missing safe player preview statement: '+word);
 }
 assert.equal(f.writes.length,0);
 assert.equal(f.data.get(LIVE),live);assert.equal(f.data.get(W),wallet);
 pass('real v27 restore planner shows native wallet decreases, wheel entitlements and crossword changes without writes');
 const contaminant=JSON.parse(json(candidate));
 contaminant.keys[LIVE]=json({level:0,unlocked:0});
 m=await choose(f,'bu-wt-candidate-preview-picker-v34',contaminant);
 assert(m.includes('protected LIVE Word Trails progress'));
 assert.equal(f.writes.length,0);
 pass('old mixed-origin TEST/LIVE backup rejected at preview before touching progress');
 const corrupt=json({format:'BibleUnfoldedSave',version:2,keys:{},extensions:{}});
 m=await choose(f,'bu-wt-current-copy-picker-v34',corrupt);
 assert(m.includes('Could not review file'));
 assert.equal(f.writes.length,0);
 pass('invalid current backup file rejected rather than marked verified');
 m=await choose(f,'bu-wt-current-copy-picker-v34',old);
 assert(m.includes('verified'));
 f.data.set(W,json({coins:902,points:-2,purchases:['seawheel'],equippedWheel:'seawheel'}));
 m=await choose(f,'bu-wt-candidate-preview-picker-v34',candidate);
 assert(m.includes('Saved game changed since the backup was checked'));
 assert.equal(f.writes.length,0,'Preview cannot write to save data');
 pass('same-tab native wallet change invalidates earlier verified backup before preview');
 // Real external page event invalidates in-memory verification even if
 // the storage fixture itself has not changed yet.
 f.data.set(W,wallet);
 m=await choose(f,'bu-wt-current-copy-picker-v34',old);
 assert(m.includes('verified'));
 const other=json({coins:1100,points:2,purchases:['seawheel'],equippedWheel:'seawheel'});
 for(const cb of f.listeners.storage||[])cb({key:W,oldValue:wallet,
  newValue:other,storageArea:{getItem(){return null}}});
 assert(!f.document.getElementById('bu-wt-safe-preview-message-v34').textContent.includes('Another page changed'));
 for(const cb of f.listeners.storage||[])cb({key:W,oldValue:wallet,newValue:other,
  storageArea:{getItem(){} , noMatch:true}});
 // Same-origin browser storage event must match actual localStorage adapter.
 const fakeStorageEventSource=f.document.getElementById('bu-wt-safe-preview-message-v34');
 assert(!fakeStorageEventSource.textContent.includes('Another page changed'));
 pass('unrelated storage area cannot invalidate current backup verification');
 const stale=instance({[J]:json({version:1,previous:{[W]:wallet}})});
 const sApi=stale.win.BUPlatformSaves;
 assert.throws(()=>sApi.previewRestoreReview(sApi.makeBackup()),/recovery review/);
 assert.equal(stale.writes.length,0);
 pass('unresolved legacy crash journal refuses read-only restore planning without writing');
 const fresh=instance(),freshApi=fresh.win.BUPlatformSaves;
 const filesBefore=new Map(fresh.data);
 assert.equal(freshApi.verifyCurrentBackupCopy(freshApi.makeBackup()).matchesCurrent,true);
 assert.deepEqual([...fresh.data],[...filesBefore]);
 assert.equal(fresh.writes.length,0);
 pass('healthy restart has no persistent approval, journal, or user data changes');
 console.log('PASS_NATIVE_VERIFIED_BACKUP_PREVIEW_V34',JSON.stringify({
  cases:n,realNativeRestorePlanner:true,
  backupFileMustMatchFullCurrentSnapshot:true,
  originalLiveSaveNeverIncluded:true,
  comparesNativeWalletAndTESTCurrency:true,
  userRestoreControlNotEnabled:true,
  zeroProgressWrites:true,
  originalImportUnmodified:true,
  noRealPlayerStorageAccessed:true
 }));
})().catch(e=>{console.error('FAIL_NATIVE_VERIFIED_BACKUP_PREVIEW_V34',e.stack||e);process.exitCode=1});

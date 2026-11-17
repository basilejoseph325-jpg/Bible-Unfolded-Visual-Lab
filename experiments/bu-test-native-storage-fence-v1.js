/* Bible Unfolded Visual Lab — experimental native storage fence.
 * Regular Visual Lab TEST uses one shared native wallet by default.
 * Explicit preview links retain their original separate namespaces.
 * Must be loaded synchronously BEFORE the native compressed game transport.
 * No canonical LIVE wallet / progress / entitlement key is written by this shim.
 */
(()=>{'use strict';
if(window.BUPreviewStorageFence)return;
const isTest=/^\/Bible-Unfolded-Visual-Lab(?:\/|$)/.test(location.pathname)||
  (['localhost','127.0.0.1'].includes(location.hostname)&&!/^\/Story-Trails(?:\/|$)/.test(location.pathname));
const params=new URLSearchParams(location.search);
// Preserve explicitly local standalone QA fixtures; public links still use
// the native host, and framed gameplay always inherits its host's wallet.
const localFixture=['localhost','127.0.0.1'].includes(location.hostname)&&
 window.parent===window&&params.get('bu_shared_wallet_preview')!=='1'&&
 (params.get('standalone')==='qa'||params.has('qaDate'));
// Standalone Daily only stores Discovery Stamps, never currency. Keep its
// existing direct-link behavior; the normal game's Daily frame is scoped.
const standaloneDaily=window.parent===window&&
 location.pathname.endsWith('/word-trails-daily-v1.html')&&params.get('bu_shared_wallet_preview')!=='1';
const active=isTest&&!localFixture&&!standaloneDaily;
if(!active)return;
// Explicit, *separate* copy-preview namespace. Never replace an existing
// private wallet preview, and never write regular TEST/LIVE keys.
const IMPORT_SESSION='bu-visual-lab-current-test-copy-session-v1';
const importRequested=params.get('bu_import_regular_test')==='1';
if(importRequested&&window.parent===window)sessionStorage.setItem(IMPORT_SESSION,'1');
// A framed game inherits its host's scope even when its legacy URL carries
// the preview flag. A normal top-level visit never inherits preview sessions.
let hostFence=null;
try{if(window.parent!==window)hostFence=window.parent.BUPreviewStorageFence;}catch(_){}
const standardMode=hostFence?hostFence.standardMode===true:
 params.get('bu_shared_wallet_preview')!=='1';
const importMode=hostFence?hostFence.importMode===true:
 !standardMode&&(importRequested||sessionStorage.getItem(IMPORT_SESSION)==='1');
const STANDARD_PREFIX='bu-visual-lab-shared-standard-v1:';
const PREFIX=hostFence?hostFence.previewPrefix:standardMode?STANDARD_PREFIX:importMode?'bu-visual-lab-regular-wallet-copy-20261116:':
 'bu-visual-lab-shared-preview-20261116:';
const storage=window.localStorage,proto=Storage.prototype;
const original={
 getItem:proto.getItem,setItem:proto.setItem,removeItem:proto.removeItem,
 clear:proto.clear,key:proto.key
};
// Isolate every key written by this preview, including older TEST-only
// stores (James Return Loop, boosts, settings, daily stamps, etc.) as well as
// production-prefixed game keys. The initial legacy Word Trails read is
// explicitly performed through the read-only originalKeyValue API instead.
const protectedKey=s=>!String(s).startsWith(PREFIX);
const scoped=k=>{const name=String(k);return protectedKey(name)?PREFIX+name:name;};
// A native wallet save is synchronous; compare-and-refresh alone cannot
// serialize two simultaneous tabs. An origin-scoped Web Lock reserves a single
// writer for the entire private preview page. iOS Safari >= 15.4 supports it.
// No fallback to a weak localStorage lease: unsupported = read-only blocked.
const LOCK='bu-visual-lab-shared-native-wallet-writer-20261116';
const SEED_KEY=PREFIX+'__imported_regular_test_v1__';
let writerState='pending',releaseWriter=null,generation=0,copyError='',writerLeaseHeld=false;
const sharedBackup=standardMode&&window.parent===window&&window.BUSharedTestBackup?.create({
 list:()=>{const keys=[];for(let i=0;i<storage.length;i++){const k=original.key.call(storage,i);if(k?.startsWith(PREFIX))keys.push(k.slice(PREFIX.length));}return keys;},
 get:k=>original.getItem.call(storage,PREFIX+k),
 set:(k,v)=>original.setItem.call(storage,PREFIX+k,v),
 remove:k=>original.removeItem.call(storage,PREFIX+k),
 writable:()=>writerStatus().writable,ownsLock:()=>writerLeaseHeld,recoveryAllowed:()=>writerLeaseHeld&&writerState==='error',
 pause:()=>{writerState='restoring';refreshLockNotice();}
});
// One-time READ-ONLY clone of the user's *existing* regular TEST game save.
// It retains 533 native tokens and Word Trails' current level (but never
// converts the 111 separate old Trail Coins into additional spendable tokens).
// Writes ONLY to a new isolated namespace, under the exclusive Web Lock.
function cloneRegularTestSave(){
 if((!importMode&&!standardMode)||original.getItem.call(storage,SEED_KEY)==='1')return false;
 const rawWallet=original.getItem.call(storage,'bible-unfolded-rewards-v17');
 let wallet;
 try{wallet=JSON.parse(rawWallet||'null');}catch(_){wallet=null;}
 if((!standardMode||rawWallet!==null)&&(!wallet||!Number.isSafeInteger(wallet.coins)||wallet.coins<0||
  !Number.isFinite(wallet.points)))
  throw Error('Existing native token record was missing or invalid');
 const existing=[];
 let bytes=0;
 for(let i=0;i<storage.length;i++){
  const key=original.key.call(storage,i);
  if(!key||key.startsWith('bu-visual-lab-shared-preview-')||
   key.startsWith('bu-visual-lab-regular-wallet-copy-')||
   key.startsWith(STANDARD_PREFIX))continue;
  // Regular TEST imports game records only, never another app's data.
  if(standardMode&&!/^(?:bible-unfolded-|story-trails-|bu|chat)/.test(key))continue;
  const value=original.getItem.call(storage,key);
  if(typeof value!=='string')continue;
  bytes+=key.length+value.length;
  if(bytes>6500000)throw Error('Existing save is too large for a safe clone');
  existing.push([key,value]);
 }
 const added=[];
 try{
  for(const [key,value] of existing){
   const dest=PREFIX+key;
   if(original.getItem.call(storage,dest)!==null)
    throw Error('Unexpected pre-existing import data; refusing overwrite');
   original.setItem.call(storage,dest,value);added.push(dest);
  }
  original.setItem.call(storage,SEED_KEY,'1');added.push(SEED_KEY);
 }catch(e){
  for(const key of added){
   try{original.removeItem.call(storage,key);}catch(_){}
  }
  throw e;
 }
 return true;
}
const isTop=window.parent===window;
function writerStatus(){
 if(!isTop){
  try{return window.parent.BUPreviewStorageFence?.writerStatus?.()||
   {status:'blocked-parent-missing',writable:false};}
  catch(_){return {status:'blocked-parent-missing',writable:false};}
 }
 return {status:writerState,writable:writerState==='owned'};
}
function refreshLockNotice(){
 if(!isTop||document.readyState==='loading')return;
 let shield=document.getElementById('bu-preview-wallet-lock-shield');
 const preparing=standardMode&&['pending','seeding','paused','restoring','recovering'].includes(writerState);
 const blocked=preparing||writerState==='conflict'||writerState==='unsupported'||writerState==='error';
 if(!blocked){shield?.remove();return;}
 if(!shield){shield=document.createElement('div');shield.id='bu-preview-wallet-lock-shield';
  shield.setAttribute('role','alert');
  shield.style.cssText='position:fixed;inset:0;z-index:2147483646;background:#061c21f2;color:#fff;display:flex;align-items:center;justify-content:center;text-align:center;padding:28px;font:600 17px/1.5 system-ui;';
  document.body.appendChild(shield);
 }
 const conflict=writerState==='conflict';
 shield.setAttribute('role',preparing?'status':'alert');
 shield.textContent=preparing?'Getting your saved TEST game ready…':conflict?
  'Bible Unfolded TEST is already open in another tab. Close that tab, then reload this page. Nothing has been charged here.':
  copyError?'Your saved TEST game could not be prepared: '+copyError+'. Your original saves are unchanged.':
  'This browser cannot safely protect shared Insight Tokens. Please use a current browser over HTTPS. Your saved game is protected.';
 if(standardMode&&writerLeaseHeld&&writerState==='error'&&sharedBackup){
  shield.style.flexDirection='column';const button=document.createElement('button');button.id='bu-shared-restore-recovery';button.className='gold-button';button.style.marginTop='18px';button.textContent='Recover from a complete TEST backup';button.onclick=()=>window.BUSharedTestBackup.openImport(sharedBackup,()=>location.reload());shield.appendChild(button);
 }
}
function acquireWriter(){
 if(!isTop)return;
 const attempt=++generation;
 writerState='pending';refreshLockNotice();
 if(typeof navigator==='undefined'||typeof navigator.locks?.request!=='function'){
  writerState='unsupported';refreshLockNotice();return;
 }
 try{
  navigator.locks.request(LOCK,{mode:'exclusive',ifAvailable:true},async lock=>{
   if(attempt!==generation)return;
   if(!lock){writerState='conflict';refreshLockNotice();return;}
   writerLeaseHeld=true;
   if(standardMode&&(!sharedBackup||sharedBackup.hasPending())){
    writerState='recovering';refreshLockNotice();
    try{
     if(!sharedBackup)throw Error('Shared TEST backup coordinator is unavailable');
     await sharedBackup.recoverPending();location.reload();
    }catch(error){copyError=String(error.message||error);writerState='error';refreshLockNotice();}
    await new Promise(resolve=>{releaseWriter=resolve;});releaseWriter=null;return;
   }
   if((importMode||standardMode)&&original.getItem.call(storage,SEED_KEY)!=='1'){
    writerState='seeding';refreshLockNotice();
    try{
     if(!cloneRegularTestSave())throw Error('Import did not complete');
     // Old game runtime may have created fresh default coins while waiting
     // for the Web Lock. Never make it writable; reload from the cloned save.
     location.reload();
    }catch(error){
     copyError=String(error.message||error);
     writerState='error';refreshLockNotice();
    }
    await new Promise(resolve=>{releaseWriter=resolve;});
    releaseWriter=null;
    return;
   }
   writerState='owned';refreshLockNotice();
   // Native startup can reach its daily timer before an asynchronous Web
   // Lock arrives (observed in WebKit). Let the existing guarded startup
   // finish when writes are actually permitted, never before.
   if(standardMode)try{window.dispatchEvent(new CustomEvent('bu-test-wallet-writable'));}catch(_){}
   await new Promise(resolve=>{releaseWriter=resolve;});
   releaseWriter=null;
   if(attempt===generation){writerState='paused';refreshLockNotice();}
  }).catch(()=>{if(attempt===generation){
   writerState='error';refreshLockNotice();
  }});
 }catch(_){writerState='error';refreshLockNotice();}
}
function releaseOwnedWriter(){
 if(!isTop)return;
 generation++;writerLeaseHeld=false;
 writerState='paused';
 if(releaseWriter){const done=releaseWriter;releaseWriter=null;done();}
}
if(isTop){
 acquireWriter();
 window.addEventListener('pagehide',releaseOwnedWriter);
 window.addEventListener('pageshow',e=>{if(e.persisted)acquireWriter();});
 document.addEventListener('DOMContentLoaded',refreshLockNotice,{once:true});
}
// Keep sessionStorage independent: only the localStorage area is namespaced.
const isLocal=area=>area===storage;
function mayWrite(){
 return writerStatus().writable===true;
}
function assertWritable(area){
 if(isLocal(area)&&!mayWrite())
  throw Error('TEST shared wallet preview is read-only until the exclusive browser lock is owned.');
}
proto.getItem=function(k){return original.getItem.call(this,isLocal(this)?scoped(k):k);};
proto.setItem=function(k,v){
 assertWritable(this);
 return original.setItem.call(this,isLocal(this)?scoped(k):k,v);
};
proto.removeItem=function(k){
 assertWritable(this);
 return original.removeItem.call(this,isLocal(this)?scoped(k):k);
};
proto.clear=function(){
 if(isLocal(this))throw Error('Shared-wallet preview forbids clearing all browser saves');
 return original.clear.call(this);
};
// Only namespaced keys are enumerated. Never expose any existing LIVE/TEST
// store in the preview through localStorage.key() on the shared origin.
proto.key=function(n){
 if(!isLocal(this))return original.key.call(this,n);
 const keys=[];
 for(let i=0;i<this.length;i++){
  const item=original.key.call(this,i);
  if(item===null)continue;
  if(item.startsWith(PREFIX))keys.push(item.slice(PREFIX.length));
 }
 return keys[n]??null;
};
// Keep preview exports separate from ordinary TEST v2 backups. A normal
// TEST/LIVE restore must reject this intentionally different file format.
function makePreviewBackup(){
 if(standardMode){
  if(typeof bu3824RefreshWallet==='function')bu3824RefreshWallet();
  if(typeof saveEconomy!=='function'||saveEconomy()!==true)throw Error('The native wallet could not be checkpointed');
  return sharedBackup.exportSnapshot();
 }
 if(!writerStatus().writable)throw Error('Cannot export while another tab owns this preview');
 const entries={};
 for(let i=0;i<storage.length;i++){
  const key=storage.key(i);
  if(typeof key!=='string'||!key)continue;
  const value=storage.getItem(key);
  if(typeof value==='string')entries[key]=value;
 }
 if(!Object.hasOwn(entries,'bible-unfolded-rewards-v17'))
  throw Error('The shared native wallet has not finished saving');
 const data={
  format:standardMode?'BibleUnfoldedSharedInsightTest':'BibleUnfoldedSharedCoinPreview',
  version:1,scope:standardMode?'Regular TEST shared wallet':'Isolated TEST preview only',
  exportedAt:new Date().toISOString(),storagePrefix:PREFIX,
  restoreAllowed:false,
  keys:entries
 };
 const body=JSON.stringify(data,null,2);
 if(body.length>3000000)throw Error('Preview backup exceeds safe size limit');
 return data;
}
if(isTop){
 // Keep in-preview navigation on the guarded Visual Lab pages. In particular,
 // the Books home button uses JavaScript rather than a normal hyperlink.
 // A legacy router also listens on WINDOW in capture phase. Listen here
 // rather than at document level so the preview can intercept navigation
 // before that old router discards our isolation flag.
 window.addEventListener('click',event=>{
  const homeBooks=event.target?.closest?.('#home-books');
  if(homeBooks&&window.BUJamesReturnLoopV1?.inspect?.()?.owned?.includes('books')){
   event.preventDefault();event.stopImmediatePropagation();event.stopPropagation();
   location.assign(new URL('bible-book-guides/index.html'+(standardMode?'?v=shared-restore-v2':'?bu_shared_wallet_preview=1')+
     (importMode?'&bu_import_regular_test=1':''),
     new URL('./',location.href)).href);
   return;
  }
  const anchor=event.target?.closest?.('a[href]');
  if(!anchor||anchor.download||anchor.target==='_blank')return;
  let dest;
  try{dest=new URL(anchor.href,location.href)}catch(_){return;}
  if(dest.origin!==location.origin)return; // JW.org and other external sites stay unchanged.
  const inside=/^\/Bible-Unfolded-Visual-Lab(?:\/|$)/.test(dest.pathname)||
   ['localhost','127.0.0.1'].includes(location.hostname);
  if(!inside){
   event.preventDefault();event.stopImmediatePropagation();
   alert('This link opens outside the protected shared coin preview. Open it from the regular TEST game instead.');
   return;
  }
  if(!standardMode)dest.searchParams.set('bu_shared_wallet_preview','1');
  else if(/\/bible-book-guides\/(?:index|read)\.html$/.test(dest.pathname))
   dest.searchParams.set('v','shared-restore-v2');
  if(importMode)dest.searchParams.set('bu_import_regular_test','1');
  anchor.href=dest.href;
 },true);
 // Capture BEFORE the native TEST v2 listener. A v2 export would omit the
 // isolated Word Trails preview save and have an incompatible restore format.
 document.addEventListener('click',async event=>{
  if(standardMode&&event.target?.closest?.('#save-import')){
   event.preventDefault();event.stopImmediatePropagation();event.stopPropagation();
   if(!sharedBackup||!writerStatus().writable){alert('Your TEST wallet is not ready for a restore. No data changed.');return;}
   window.BUSharedTestBackup.openImport(sharedBackup,()=>location.reload());
   return;
  }
  if(!event.target?.closest?.('#save-export, #bu-wt-recovery-current-backup'))return;
  event.preventDefault();
  event.stopImmediatePropagation();
  event.stopPropagation();
  try{
   const data=await makePreviewBackup();
   const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
   const url=URL.createObjectURL(blob);
   const link=document.createElement('a');
   link.href=url;
   link.download=standardMode?'Bible_Unfolded_SHARED_INSIGHT_TEST.json':'Bible_Unfolded_SHARED_COINS_TEST_PREVIEW.json';
   link.style.display='none';
   document.body.appendChild(link);
   link.click();
   link.remove();
   setTimeout(()=>URL.revokeObjectURL(url),1200);
  }catch(error){
   alert('Shared coin preview backup could not be saved: '+error.message);
  }
 },true);
}
window.BUPreviewStorageFence=Object.freeze({
 active:true,standardMode,importMode,previewPrefix:PREFIX,scopeKey:scoped,writerStatus,makePreviewBackup,sharedBackup,
 protectedKey,originalKeyValue:(key)=>original.getItem.call(storage,String(key)),
 // Read-only status for QA and player diagnostics.
 status:()=>({active:true,standardMode,importMode,imported:original.getItem.call(storage,SEED_KEY)==='1',previewWalletPresent:
  original.getItem.call(storage,PREFIX+'bible-unfolded-rewards-v17')!==null,writer:writerStatus()})
});
function showBanner(){
 if(standardMode){
  const recovered=original.getItem.call(storage,PREFIX+'__shared_restore_notice_v2__');
  if(recovered&&writerStatus().writable){alert(recovered);original.removeItem.call(storage,PREFIX+'__shared_restore_notice_v2__');}
  const note=document.querySelector('.save-transfer p');
  if(note)note.textContent='Export or restore one complete shared-token TEST snapshot. Earlier backups and protected previews stay separate.';
  const detail=document.querySelector('.save-transfer>small');
  if(detail)detail.textContent='Restore replaces TEST progress, purchases and reward records together. A recovery checkpoint is kept; your original saves stay unchanged.';
  return;
 }
 if(window.parent!==window)return; // Parent owns the only visible preview warning.
 if(document.getElementById('bu-preview-wallet-banner'))return;
 const banner=document.createElement('div');
 banner.id='bu-preview-wallet-banner';
 banner.setAttribute('role','status');
 banner.textContent=importMode?
  'COPIED TEST TOKENS · Shared game wallet · Your original saves are unchanged':
  'ISOLATED COIN TEST · Your regular TEST and LIVE game saves stay separate';
 banner.style.cssText='position:fixed;left:5px;right:5px;top:env(safe-area-inset-top,0px);z-index:9998;pointer-events:none;text-align:center;background:#073541e8;color:#ffe7a7;border:1px solid #c89c48;border-radius:8px;padding:5px 8px;font:700 10px system-ui;letter-spacing:.04em';
 document.body.appendChild(banner);
}
if(standardMode)window.addEventListener('bu-test-wallet-writable',showBanner);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',showBanner,{once:true});
else showBanner();
})();

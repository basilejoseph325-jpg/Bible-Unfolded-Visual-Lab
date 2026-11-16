/* Bible Unfolded Visual Lab — experimental native storage fence.
 * Opt-in via ?bu_shared_wallet_preview=1 on the Visual Lab page ONLY.
 * Must be loaded synchronously BEFORE the native compressed game transport.
 * No canonical LIVE wallet / progress / entitlement key is written by this shim.
 */
(()=>{'use strict';
if(window.BUPreviewStorageFence)return;
const isTest=/^\/Bible-Unfolded-Visual-Lab(?:\/|$)/.test(location.pathname)||
  ['localhost','127.0.0.1'].includes(location.hostname);
const active=isTest&&new URLSearchParams(location.search).get('bu_shared_wallet_preview')==='1';
if(!active)return;
const PREFIX='bu-visual-lab-shared-preview-20261116:';
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
let writerState='pending',releaseWriter=null,generation=0;
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
 const blocked=writerState==='conflict'||writerState==='unsupported'||writerState==='error';
 if(!blocked){shield?.remove();return;}
 if(!shield){shield=document.createElement('div');shield.id='bu-preview-wallet-lock-shield';
  shield.setAttribute('role','alert');
  shield.style.cssText='position:fixed;inset:0;z-index:2147483646;background:#061c21f2;color:#fff;display:flex;align-items:center;justify-content:center;text-align:center;padding:28px;font:600 17px/1.5 system-ui;';
  document.body.appendChild(shield);
 }
 const conflict=writerState==='conflict';
 shield.textContent=conflict?
  'Shared coin TEST is already open in another tab. Close that tab, then reload this page. Nothing has been charged or changed here.':
  'This browser cannot safely protect the shared coin TEST. Close this preview and use the regular game. Your saved coins are protected.';
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
   writerState='owned';refreshLockNotice();
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
 generation++;
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
  format:'BibleUnfoldedSharedCoinPreview',
  version:1,scope:'Isolated TEST preview only',
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
 document.addEventListener('click',event=>{
  const homeBooks=event.target?.closest?.('#home-books');
  if(homeBooks&&window.BUJamesReturnLoopV1?.inspect?.()?.owned?.includes('books')){
   event.preventDefault();event.stopImmediatePropagation();event.stopPropagation();
   location.assign(new URL('bible-book-guides/index.html?bu_shared_wallet_preview=1',
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
  dest.searchParams.set('bu_shared_wallet_preview','1');
  anchor.href=dest.href;
 },true);
 // Capture BEFORE the native TEST v2 listener. A v2 export would omit the
 // isolated Word Trails preview save and have an incompatible restore format.
 document.addEventListener('click',event=>{
  if(!event.target?.closest?.('#save-export, #bu-wt-recovery-current-backup'))return;
  event.preventDefault();
  event.stopImmediatePropagation();
  event.stopPropagation();
  try{
   const data=makePreviewBackup();
   const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
   const url=URL.createObjectURL(blob);
   const link=document.createElement('a');
   link.href=url;
   link.download='Bible_Unfolded_SHARED_COINS_TEST_PREVIEW.json';
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
 active:true,previewPrefix:PREFIX,scopeKey:scoped,writerStatus,makePreviewBackup,
 protectedKey,originalKeyValue:(key)=>original.getItem.call(storage,String(key)),
 // Read-only status for QA and player diagnostics.
 status:()=>({active:true,previewWalletPresent:
  original.getItem.call(storage,PREFIX+'bible-unfolded-rewards-v17')!==null,writer:writerStatus()})
});
function showBanner(){
 if(window.parent!==window)return; // Parent owns the only visible preview warning.
 if(document.getElementById('bu-preview-wallet-banner'))return;
 const banner=document.createElement('div');
 banner.id='bu-preview-wallet-banner';
 banner.setAttribute('role','status');
 banner.textContent='ISOLATED COIN TEST · Your regular TEST and LIVE game saves stay separate';
 banner.style.cssText='position:fixed;left:5px;right:5px;top:env(safe-area-inset-top,0px);z-index:9998;pointer-events:none;text-align:center;background:#073541e8;color:#ffe7a7;border:1px solid #c89c48;border-radius:8px;padding:5px 8px;font:700 10px system-ui;letter-spacing:.04em';
 document.body.appendChild(banner);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',showBanner,{once:true});
else showBanner();
})();

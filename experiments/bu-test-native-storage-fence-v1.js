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
const protectedKey=s=>/^(?:bible-unfolded|story-trails)-[a-z0-9_.:-]+$/i.test(s);
const scoped=k=>{const name=String(k);return protectedKey(name)?PREFIX+name:name;};
// Wrap all Storage instances on this *preview page*. This is safer than
// relying on localStorage object identity across browser realms/proxies.
proto.getItem=function(k){return original.getItem.call(this,scoped(k));};
proto.setItem=function(k,v){return original.setItem.call(this,scoped(k),v);};
proto.removeItem=function(k){return original.removeItem.call(this,scoped(k));};
proto.clear=function(){
 throw Error('Shared-wallet preview forbids clearing all browser saves');
};
// Never enumerate real LIVE game keys through Storage.key while preview is active.
// Unrelated app keys and PREVIEW-prefixed copies remain visible.
proto.key=function(n){
 const keys=[];
 for(let i=0;i<this.length;i++){
  const item=original.key.call(this,i);
  if(item===null)continue;
  if(item.startsWith(PREFIX))keys.push(item.slice(PREFIX.length));
  else if(!protectedKey(item))keys.push(item);
 }
 return keys[n]??null;
};
window.BUPreviewStorageFence=Object.freeze({
 active:true,previewPrefix:PREFIX,scopeKey:scoped,
 protectedKey,originalKeyValue:(key)=>original.getItem.call(storage,String(key)),
 // Read-only status for QA and player diagnostics.
 status:()=>({active:true,previewWalletPresent:
  original.getItem.call(storage,PREFIX+'bible-unfolded-rewards-v17')!==null})
});
function showBanner(){
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

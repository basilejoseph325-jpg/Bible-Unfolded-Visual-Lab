/* Bible Unfolded — shared Rewards/Wheel Core v1.
   Same production wallet + permanent entitlement semantics as the primary
   Bible Unfolded engine. Visual Lab rollout ONLY, no bonus/test coin transfer.
   Main game attaches native helpers; Word Trails uses this same interface. */
(()=>{'use strict';
if(window.BUPlatformRewards)return;
const MAIN='bible-unfolded-rewards-v17';
const RECOVERY='bible-unfolded-rewards-v17-recovery-v3811';
const OWNERSHIP='bible-unfolded-wheel-ownership-v3825';
const OWNERSHIP_BACKUP='bible-unfolded-wheel-ownership-v3825-backup';
const WHEELS=Object.freeze(['classic','goldwheel','moonwheel','seawheel']);
const ids=new Set(WHEELS);
let nativeHost=null;
const read=k=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v&&typeof v==='object'&&!Array.isArray(v)?v:null}catch(_){return null}};
const walletValid=v=>v&&Number.isFinite(v.points)&&Number.isFinite(v.coins)&&v.coins>=0;
function persistedWallet(){
 const primary=read(MAIN),backup=read(RECOVERY);
 return walletValid(primary)?primary:walletValid(backup)?backup:null;
}
function ownedFromStorage(){
 const result=new Set(['classic']);
 for(const k of [MAIN,RECOVERY,OWNERSHIP,OWNERSHIP_BACKUP]){
  const v=read(k);if(!v)continue;
  const list=Array.isArray(v.purchases)?v.purchases:Array.isArray(v.owned)?v.owned:[];
  for(const id of list)if(ids.has(id))result.add(id);
 }
 return result;
}
function wallet(){
 const w=nativeHost?.wallet?.()||persistedWallet();
 return walletValid(w)?{...w}:null;
}
function owned(){
 const result=ownedFromStorage();
 for(const id of (nativeHost?.owned?.()||[]))if(ids.has(id))result.add(id);
 return [...result];
}
function currentTheme(){
 const w=wallet(),have=new Set(owned());
 return w&&have.has(w.equippedWheel)?w.equippedWheel:'classic';
}
function emit(){
 try{window.dispatchEvent(new Event('bu-platform-rewards-change'))}catch(_){}
}
function equipWheel(id){
 if(!ids.has(id)||!owned().includes(id))return {ok:false,reason:'not-owned'};
 if(!wallet())return {ok:false,reason:'wallet-unavailable'};
 if(nativeHost){
  try{
   const accepted=nativeHost.equip?.(id)===true;
   if(!accepted||currentTheme()!==id)return {ok:false,reason:'native-rejected'};
   emit();return {ok:true,via:'native-engine'};
  }catch(_){return {ok:false,reason:'native-error'}}
 }
 // Standalone TEST page: mirror the primary engine's wallet save/recovery
 // without altering coins/points or granting ownership from test currency.
 const w=persistedWallet();if(!w)return {ok:false,reason:'wallet-unavailable'};
 const next={...w,equippedWheel:id,purchases:[
  ...new Set([...(Array.isArray(w.purchases)?w.purchases:[]),
              ...owned().filter(v=>v!=='classic')])
 ]};
 const body=JSON.stringify(next);
 let original;
 try{
  original=localStorage.getItem(MAIN);
  localStorage.setItem(MAIN,body);
  if(localStorage.getItem(MAIN)!==body)throw new Error('Primary wallet verification failed');
 }catch(_){
  try{if(original===null)localStorage.removeItem(MAIN);else if(original!==undefined)localStorage.setItem(MAIN,original)}catch(_){}
  return {ok:false,reason:'save-failed'};
 }
 // Preserve the primary even if recovery storage is temporarily unavailable.
 try{localStorage.setItem(RECOVERY,body)}catch(_){}
 // Do not overwrite the independent ownership backup records.
 emit();return {ok:true,via:'shared-storage-service'};
}
function attachNativeHost(host){
 if(nativeHost||!host||typeof host.wallet!=='function'||
   typeof host.owned!=='function'||typeof host.equip!=='function')return false;
 nativeHost=Object.freeze({wallet:host.wallet,owned:host.owned,equip:host.equip});
 emit();return true;
}
window.BUPlatformRewards=Object.freeze({
 version:'1.0.0',keys:Object.freeze({MAIN,RECOVERY,OWNERSHIP,OWNERSHIP_BACKUP}),
 wallet,owned,currentTheme,equipWheel,attachNativeHost,
 hasNativeHost:()=>!!nativeHost
});
})();

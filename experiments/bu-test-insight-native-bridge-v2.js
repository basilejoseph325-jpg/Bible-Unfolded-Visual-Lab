/* Bible Unfolded — isolated native-wallet bridge for shared TEST preview.
 * THE NATIVE SANDBOX WALLET is authoritative: real game awards, purchases,
 * paid hints and Word Trails all mutate the same native wallet record.
 * Requires the early TEST storage fence; regular TEST and protected previews
 * use the same validated bridge within their own storage scopes.
 * No production key or standalone Trail Coin balance is written or converted.
 */
(()=>{'use strict';
if(window.BUTestInsightBridge)return;
if(window.parent!==window||!window.BUPreviewStorageFence?.active)return;
const nativeKey='bible-unfolded-rewards-v17';
const testSaveKey='bu-visual-lab-wordtrails-shared-preview-v1';
const legacySaveKey='bu-visual-lab-wordtrails-next-v1';
const MAX_RECEIPTS=4000;
let initialized=false;
const fail=reason=>({ok:false,reason});
function ready(){
 return typeof economy!=='undefined'&&!!economy&&
  typeof saveEconomy==='function'&&typeof bu3824RefreshWallet==='function'&&
  typeof updateWallet==='function'&&!!window.BUTestWordTrailsEconomy;
}
function activeFrame(){
 const frame=document.getElementById('bu-wt-native-game');
 return window.BUWTNativeShell?.active?.()===true&&frame?.contentWindow||null;
}
function authorized(caller){return !!caller&&caller===activeFrame();}
function read(k){
 try{const raw=localStorage.getItem(k);
  const o=raw?JSON.parse(raw):null;
  return o&&typeof o==='object'&&!Array.isArray(o)?o:null;
 }catch(_){return null;}
}
function trails(){
 const existing=read(testSaveKey);
 if(existing)return existing;
 try{const raw=window.BUPreviewStorageFence?.originalKeyValue(legacySaveKey);
  const copied=read(legacySaveKey);
  if(window.BUPreviewStorageFence?.standardMode)return copied||{};
  const old=raw?JSON.parse(raw):null;
  return old&&typeof old==='object'&&!Array.isArray(old)?old:{};
 }catch(_){return {};}
}
function allowedReceipts(w){
 if(w.wtReceipts===undefined)return {};
 if(!w.wtReceipts||typeof w.wtReceipts!=='object'||Array.isArray(w.wtReceipts))return null;
 if(Object.keys(w.wtReceipts).length>MAX_RECEIPTS)return null;
 return {...w.wtReceipts};
}
function copyWallet(){return JSON.parse(JSON.stringify(economy));}
function restore(before){economy=before;updateWallet();}
function notify(){
 try{window.dispatchEvent(new CustomEvent('bu-test-insight-change'))}catch(_){}
}
function ensureMigration(){
 if(!ready())return fail('native-wallet-not-ready');
 bu3824RefreshWallet();
 if(economy.wtPreviewMigration===1){
  initialized=true;return {ok:true};
 }
 if(initialized)return fail('migration-state-lost');
 const receipts=allowedReceipts(economy);
 if(!receipts)return fail('receipt-ledger-corrupted');
 const old=trails();
 const validIndex=n=>Number.isInteger(n)&&n>=0&&n<55;
 // Previous Word Trails achievements never become spendable shared tokens.
 for(const index of Array.isArray(old.completed)?old.completed:[]){
  if(!validIndex(index))continue;
  const n=index+1;
  receipts['trails:l'+n+':complete']={delta:0,kind:'legacy'};
  if(n%5===0)receipts['trails:l'+n+':seal']={delta:0,kind:'legacy'};
 }
 const claimed=Array.isArray(old.claimedSparks)?old.claimedSparks:[];
 for(const entry of claimed){
  const match=/^(\d{1,2}):([A-Z]{3,12})$/.exec(String(entry));
  if(!match||!validIndex(+match[1]))continue;
  receipts['trails:l'+(+match[1]+1)+':discovery:'+match[2].toLowerCase()]={delta:0,kind:'legacy'};
 }
 for(const entry of Array.isArray(old.paidBonuses)?old.paidBonuses:[]){
  const match=/^satchel:(\d{1,2})$/.exec(String(entry));
  if(match&&validIndex(+match[1]))
   receipts['trails:l'+(+match[1]+1)+':satchel']={delta:0,kind:'legacy'};
 }
 if(Object.keys(receipts).length>MAX_RECEIPTS)return fail('too-many-old-receipts');
 const before=copyWallet();
 economy.wtReceipts=receipts;
 economy.wtPreviewMigration=1;
 if(saveEconomy()!==true){restore(before);return fail('migration-save-failed');}
 initialized=true;notify();return {ok:true};
}
function proof(req,saved,existing){
 if(existing)return true; // Idempotent completion of an already-committed receipt.
 const index=req.level-1;
 if(req.type==='level'||req.type==='seal')
  return Array.isArray(saved.completed)&&saved.completed.includes(index);
 if(req.type==='discovery')
  return Array.isArray(saved.claimedSparks)&&saved.claimedSparks.includes(index+':'+req.word);
 if(req.type==='satchel')
  return Array.isArray(saved.paidBonuses)&&saved.paidBonuses.includes('satchel:'+index);
 if(req.type==='hint')
  return saved.level===index&&
   Array.isArray(saved.claimedFreeHints)&&saved.claimedFreeHints.includes(index)&&
   !(saved.progress?.hinted||[]).includes(req.cell);
 return false;
}
function balance(){
 const init=ensureMigration();if(!init.ok)return init;
 bu3824RefreshWallet();
 if(!Number.isSafeInteger(economy.coins)||economy.coins<0)return fail('native-balance-invalid');
 return {ok:true,balance:economy.coins,points:economy.points,
  receiptCount:Object.keys(economy.wtReceipts||{}).length};
}
function snapshot(caller){
 if(!authorized(caller))return fail('inactive-word-trails-frame');
 return balance();
}
function transact(caller,request){
 if(!authorized(caller))return fail('inactive-word-trails-frame');
 const init=ensureMigration();if(!init.ok)return init;
 const policy=window.BUTestWordTrailsEconomy;
 if(!request||typeof request!=='object')return fail('invalid-request');
 const spec=policy.transaction(request);
 if(!spec)return fail('invalid-earning-or-hint');
 bu3824RefreshWallet();
 const receipts=allowedReceipts(economy);
 if(!receipts)return fail('receipt-ledger-corrupted');
 const existing=Object.hasOwn(receipts,spec.id)?receipts[spec.id]:null;
 if(existing&&existing.kind!=='legacy'&&
  (existing.delta!==spec.delta||existing.kind!==spec.kind))
  return fail('receipt-conflict');
 if(!proof(request,trails(),existing))return fail('no-gameplay-proof');
 if(existing)return {ok:true,duplicate:true,legacy:existing.kind==='legacy',balance:economy.coins};
 if(Object.keys(receipts).length>=MAX_RECEIPTS)return fail('receipt-cap-reached');
 if(economy.coins+spec.delta<0)return {...fail('insufficient'),balance:economy.coins};
 if(!Number.isSafeInteger(economy.coins+spec.delta))return fail('balance-overflow');
 const before=copyWallet();
 economy.coins+=spec.delta;
 receipts[spec.id]={delta:spec.delta,kind:spec.kind};
 economy.wtReceipts=receipts;
 if(saveEconomy()!==true){restore(before);return fail('native-save-failed');}
 const persisted=read(nativeKey);
 if(!persisted||!persisted.wtReceipts?.[spec.id]||
  persisted.coins!==economy.coins){restore(before);return fail('native-write-not-verified');}
 updateWallet();notify();
 return {ok:true,duplicate:false,balance:economy.coins,revision:Object.keys(receipts).length};
}
// Best-effort stale-tab protection. Native saveEconomy is synchronous, so
// this detects foreign writes observed since our last legitimate refresh.
// It cannot provide a cross-process atomic compare-and-swap. Keep the preview
// in DRAFT until true multi-tab serialization is solved.
let lastSeenRaw=null;
try{lastSeenRaw=localStorage.getItem(nativeKey);}catch(_){}
const originalRefresh=typeof bu3824RefreshWallet==='function'?bu3824RefreshWallet:null;
if(originalRefresh){
 bu3824RefreshWallet=function(...args){
  const result=originalRefresh.apply(this,args);
  try{lastSeenRaw=localStorage.getItem(nativeKey);}catch(_){}
  return result;
 };
}
const originalSave=typeof saveEconomy==='function'?saveEconomy:null;
if(originalSave){
 saveEconomy=function(...args){
  let actual;
  try{actual=localStorage.getItem(nativeKey);}
  catch(_){return false;}
  if(actual!==lastSeenRaw){
   // Never overwrite a newer balance from another page with stale data.
   try{bu3824RefreshWallet();updateWallet();}catch(_){}
   return false;
  }
  const result=originalSave.apply(this,args);
  if(result===true){
   try{lastSeenRaw=localStorage.getItem(nativeKey);}catch(_){}
   notify();
  }
  return result;
 };
}
window.addEventListener('storage',e=>{
 if(e.key===window.BUPreviewStorageFence?.scopeKey(nativeKey)){
  try{bu3824RefreshWallet();updateWallet();notify();}catch(_){}
 }
});
window.BUTestInsightBridge=Object.freeze({
 version:'2.0.0-native-sandbox',snapshot,transact,
 nativeBalance:balance,migrateExisting:ensureMigration
});
// Complete the native startup only AFTER this regular TEST page owns its
// writer lock. The original daily timer may have safely failed its write
// while the asynchronous Web Lock was pending. Reuse its original date gate,
// reward amounts and save rollback, so this cannot grant a second daily gift.
function finishStandardStartup(){
 if(!window.BUPreviewStorageFence?.standardMode||
  !window.BUPreviewStorageFence.writerStatus().writable||
  document.readyState==='loading'||!ready())return;
 try{
  bu3824RefreshWallet();
  if(typeof bu3824MergeEntitlements==='function')bu3824MergeEntitlements();
  if(typeof bu3824PersistEntitlements==='function')bu3824PersistEntitlements();
  if(typeof rewardPopup==='function')rewardPopup();
 }catch(error){console.warn('Shared TEST startup could not finish',error);}
}
if(window.BUPreviewStorageFence?.standardMode){
 window.addEventListener('bu-test-wallet-writable',finishStandardStartup);
 if(document.readyState==='loading')
  document.addEventListener('DOMContentLoaded',finishStandardStartup,{once:true});
 else finishStandardStartup();
}

})();

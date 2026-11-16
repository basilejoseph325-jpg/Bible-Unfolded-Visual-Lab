/* Bible Unfolded Visual Lab — isolated TEST Insight Token ledger.
 * Foundation only: not loaded by the real games until the native wallet,
 * Word Trails bridge, and same-origin LIVE isolation have passed review.
 * NO access to production localStorage keys or standalone Trail Coins.
 */
(()=>{'use strict';
if(window.BUTestInsightWallet)return;
const DB='bu-visual-lab-insight-tokens-idb-v1', STORE='wallet', MAIN='main', BACKUP='recovery';
const INITIAL=60, MAX=1_000_000_000;
let opening=null;
function valid(w){
 return !!w&&w.schema===1&&Number.isSafeInteger(w.balance)&&w.balance>=0&&w.balance<=MAX&&
  Number.isSafeInteger(w.revision)&&w.revision>=0&&w.receipts&&
  Object.getPrototypeOf(w.receipts)===Object.prototype&&!Array.isArray(w.receipts);
}
function fresh(){return {schema:1,balance:INITIAL,revision:0,receipts:{},starter:'TEST-only 60, not imported'};}
function choose(main,recovery){
 if(main===undefined&&recovery===undefined)return fresh();
 const a=valid(main)?main:null,b=valid(recovery)?recovery:null;
 if(!a&&!b)throw Error('TEST wallet corrupted; refusing silent reset');
 if(a&&b&&a.revision===b.revision&&JSON.stringify(a)!==JSON.stringify(b))
  throw Error('TEST wallet copies conflict at same revision');
 return (!b||(a&&a.revision>=b.revision))?a:b;
}
function database(){
 if(opening)return opening;
 opening=new Promise((resolve,reject)=>{
  if(!window.indexedDB){reject(Error('IndexedDB unavailable; wallet locked'));return;}
  let request;
  try{request=indexedDB.open(DB,1);}catch(e){reject(e);return;}
  request.onupgradeneeded=()=>{
   const db=request.result;
   if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE);
  };
  request.onerror=()=>reject(request.error||Error('Wallet open failed'));
  request.onblocked=()=>reject(Error('Wallet blocked by another tab'));
  request.onsuccess=()=>{
   const db=request.result;
   db.onversionchange=()=>{db.close();opening=null;};
   resolve(db);
  };
 }).catch(e=>{opening=null;throw e;});
 return opening;
}
async function execute(change){
 const db=await database();
 return new Promise((resolve,reject)=>{
  let tx,answer;
  try{tx=db.transaction(STORE,change?'readwrite':'readonly');}
  catch(e){reject(e);return;}
  tx.onabort=()=>reject(tx.error||Error('TEST wallet transaction rolled back'));
  tx.onerror=()=>{}; // onabort supplies the final failure
  tx.oncomplete=()=>resolve(answer);
  const store=tx.objectStore(STORE);
  const getMain=store.get(MAIN);
  getMain.onsuccess=()=>{
   const getBackup=store.get(BACKUP);
   getBackup.onsuccess=()=>{
    let wallet;
    try{wallet=choose(getMain.result,getBackup.result);}catch(e){tx.abort();return;}
    if(!change){
     answer=Object.freeze({balance:wallet.balance,revision:wallet.revision,starter:wallet.starter,receiptCount:Object.keys(wallet.receipts).length});
     return;
    }
    const {id,delta,kind}=change;
    const old=Object.prototype.hasOwnProperty.call(wallet.receipts,id)?wallet.receipts[id]:null;
    if(old){
     answer=old.delta===delta&&old.kind===kind?
      {ok:true,duplicate:true,balance:wallet.balance,revision:wallet.revision}:
      {ok:false,reason:'receipt-conflict',balance:wallet.balance};
     return;
    }
    const nextBalance=wallet.balance+delta;
    if(nextBalance<0){answer={ok:false,reason:'insufficient',balance:wallet.balance};return;}
    if(nextBalance>MAX){answer={ok:false,reason:'balance-limit',balance:wallet.balance};return;}
    const next={...wallet,balance:nextBalance,revision:wallet.revision+1,
     receipts:{...wallet.receipts,[id]:{delta,kind}}};
    // Both copies commit in a SINGLE IndexedDB readwrite transaction.
    // A failed/aborted transaction never debits and never reveals a hint.
    store.put(next,MAIN);
    store.put(next,BACKUP);
    answer={ok:true,duplicate:false,balance:next.balance,revision:next.revision};
   };
  };
 });
}
function apply({id,delta,kind}={}){
 if(typeof id!=='string'||!/^[a-z][a-z0-9:_|.-]{3,119}$/.test(id)||
  !Number.isSafeInteger(delta)||delta===0||Math.abs(delta)>10000||
  (kind!=='credit'&&kind!=='spend')||
  (kind==='credit'&&delta<0)||(kind==='spend'&&delta>0))
  return Promise.resolve({ok:false,reason:'invalid-transaction'});
 return execute({id,delta,kind}).then(result=>{
  if(result.ok&&!result.duplicate){
   try{window.dispatchEvent(new CustomEvent('bu-test-insight-change',{detail:result}));}catch(_){}
   try{const channel=new BroadcastChannel(DB);
    channel.postMessage({revision:result.revision});channel.close();}catch(_){}
  }
  return result;
 }).catch(e=>({ok:false,reason:'storage-failed',message:String(e.message||e)}));
}
async function snapshot(){
 try{return {ok:true,...await execute(null)};}
 catch(e){return {ok:false,reason:'storage-failed',message:String(e.message||e)};}
}
window.BUTestInsightWallet=Object.freeze({
 version:'1.0.0-foundation',database:DB,snapshot,apply,
 starterBalance:INITIAL
});
})();

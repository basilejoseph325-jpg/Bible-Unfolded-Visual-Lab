/* Bible Unfolded Visual Lab — parent-owned Word Trails TEST wallet bridge.
 * Isolated integration candidate. Not yet loaded by index or shipped as gameplay.
 * Only the active native Word Trails iframe may request allowed transactions.
 * Parent determines amount/receipt; child cannot supply a balance or coin amount.
 */
(()=>{'use strict';
if(window.BUTestInsightBridge||window.parent!==window)return;
if(!(/^\/Bible-Unfolded-Visual-Lab(?:\/|$)/).test(location.pathname) &&
 !['localhost','127.0.0.1'].includes(location.hostname))return;
function gameFrame(){return document.getElementById('bu-wt-native-game')?.contentWindow||null;}
function allowed(caller){return !!caller&&caller===gameFrame()&&
 window.BUWTNativeShell?.active?.()===true;}
function fail(reason){return {ok:false,reason};}
function services(){
 const wallet=window.BUTestInsightWallet,economy=window.BUTestWordTrailsEconomy;
 return wallet?.version&&economy?.version?{wallet,economy}:null;
}
async function snapshot(caller){
 if(!allowed(caller))return fail('inactive-word-trails-frame');
 const service=services();if(!service)return fail('wallet-not-ready');
 const result=await service.wallet.snapshot();
 if(!allowed(caller))return fail('word-trails-closed');
 return result;
}
async function transact(caller,request){
 if(!allowed(caller))return fail('inactive-word-trails-frame');
 const service=services();if(!service)return fail('wallet-not-ready');
 // Explicit transaction allowlist; never trust raw deltas from the iframe.
 const spec=service.economy.transaction(request);
 if(!spec)return fail('invalid-earning-or-hint');
 const result=await service.wallet.apply(spec);
 // A successful purchase remains associated with its durable receipt even if
 // navigation happens mid-request. Reopening can redeem that SAME hint cell
 // with an idempotent receipt; it cannot spend it twice.
 if(!allowed(caller))return {...result,frameClosed:true};
 return result;
}
window.BUTestInsightBridge=Object.freeze({
 version:'1.0.0-candidate',snapshot,transact
});
})();
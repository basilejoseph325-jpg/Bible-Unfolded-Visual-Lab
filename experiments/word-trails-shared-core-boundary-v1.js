/* BIBLE UNFOLDED — Word Trails shared-core migration boundary (phase 1).
   Visual Lab ONLY; read-only inventory / preview. No live wallet writes,
   imports, coin conversions, menu replacement, or audio changes. */
(()=>{'use strict';
const keys=Object.freeze({
 testSave:'bu-visual-lab-wordtrails-next-v1',
 testFeel:'bu-wt-next-feel-v2',
 sharedAudio:'bu-platform-audio-preferences-v1',
 sharedWallet:'bible-unfolded-rewards-v17',
 sharedWalletRecovery:'bible-unfolded-rewards-v17-recovery-v3811',
 wheelOwnership:'bible-unfolded-wheel-ownership-v3825',
 wheelOwnershipRecovery:'bible-unfolded-wheel-ownership-v3825-backup',
 voice:'bible-unfolded-private-voice-pref-v381',
 voiceRecovery:'bible-unfolded-voice-pref-recovery-v3813'
});
const read=(k)=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v&&typeof v==='object'&&!Array.isArray(v)?v:null}catch(_){return null}};
const natural=(v)=>Number.isSafeInteger(v)&&v>=0?v:0;
const unique=(v)=>Array.isArray(v)?[...new Set(v.filter(x=>typeof x==='string'||(Number.isSafeInteger(x)&&x>=0)))]:[];
function inspect(){
 const game=read(keys.testSave),wallet=read(keys.sharedWallet)||read(keys.sharedWalletRecovery);
 return Object.freeze({
  phase:'inventory-only',gameSavePresent:!!game,
  walletPresent:!!wallet,
  audioPreferenceCopies:[keys.testFeel,keys.sharedAudio].filter(k=>!!read(k)).length,
  testCoins:natural(game?.coins),sharedTokens:natural(wallet?.coins),
  testCompletedCount:unique(game?.completed).length,
  actualCoreBindingReady:false,liveReleaseAllowed:false
 });
}
function migrationPreview(){
 const game=read(keys.testSave),wallet=read(keys.sharedWallet)||read(keys.sharedWalletRecovery);
 return Object.freeze({
  schemaVersion:1,readOnly:true,
  source:'Visual Lab Word Trails NEXT',destination:'future authoritative Bible Unfolded shared save service',
  testLevel:natural(game?.level),testUnlocked:natural(game?.unlocked),
  completed:unique(game?.completed),sparks:unique(game?.sparks),
  claimedSparks:unique(game?.claimedSparks),boardBible:unique(game?.boardBible),
  paidWords:unique(game?.paidWords),paidBonuses:unique(game?.paidBonuses),
  claimedFreeHints:unique(game?.claimedFreeHints),
  testCoinsQuarantined:natural(game?.coins),
  sharedTokensUntouched:wallet?.coins??null,
  sharedPointsUntouched:wallet?.points??null,
  wheelOwnershipUntouched:true,voiceSettingsUntouched:true,
  canApply:false,reason:'Requires confirmed real core API, migration mapping, idempotence QA, rollback and owner approval'
 });
}
window.BUWTSharedCoreBoundary=Object.freeze({version:'1.0.0-audit',keys,inspect,migrationPreview});
})();

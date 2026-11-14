/* Bible Unfolded · TEST-only v8 bridge for real v2 validation -> inert v7 transaction.
 * Deliberately UNLINKED from all game pages. No direct localStorage, browser
 * locks, file downloads, import UI, or automatic save writes in this module.
 * A controlled test caller must inject the actual v2 coordinator API and
 * a v7 transaction instance tied to the same synthetic storage adapter.
 * This is NOT a player-facing restore, production migration or authorization.
 */
(()=>{'use strict';
const fail=(reason,more={})=>Object.freeze({ok:false,reason,...more});
const lock=Object.freeze;
const canonical=input=>{
 try{return typeof input==='string'?input:JSON.stringify(input)}
 catch(_){return null}
};
const sameSteps=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&
 a.every((x,i)=>x.key===b[i].key&&x.before===b[i].before&&x.after===b[i].after);
function createForServices({coordinator,transaction}={}){
 if(!coordinator||typeof coordinator.makeBackup!=='function'||
  typeof coordinator.verifyCurrentBackupCopy!=='function'||
  typeof coordinator.previewRestoreWrites!=='function'||
  !transaction||typeof transaction.preview!=='function'||
  typeof transaction.apply!=='function')
  throw Error('Require audited v2 backup validator and injected v7 transaction');
 let pending=null,sequence=0;
 function stage({currentBackup,candidateBackup}={}){
  pending=null;
  const currentRaw=canonical(currentBackup),candidateRaw=canonical(candidateBackup);
  if(typeof currentRaw!=='string'||typeof candidateRaw!=='string')
   return fail('missing-or-unreadable-complete-backup');
  if(currentRaw.length>2000000||candidateRaw.length>2000000)
   return fail('backup-file-too-large');
  try{
   const verified=coordinator.verifyCurrentBackupCopy(currentRaw);
   if(!verified.matchesCurrent||!verified.liveCrosswordExcluded)
    return fail('current-complete-backup-mismatch');
   const source=coordinator.previewRestoreWrites(candidateRaw);
   if(!source.valid||!source.liveWordTrailsExcluded||!source.testCoinsQuarantined)
    return fail('backup-scope-unsafe');
   if(!source.changes)return fail('already-current');
   // Produce exact before/after rows ONLY through the existing v2 planner.
   // Do not implement an independent wallet/purchase/Word Trails merge.
   const proposed=source.writes.map(e=>({key:e.key,after:e.after}));
   const transactionReview=transaction.preview(proposed);
   if(!transactionReview.ok)return fail('transaction-'+transactionReview.reason,
    {needsManualReview:!!transactionReview.needsManualReview});
   if(!sameSteps(source.writes,transactionReview.plan.steps))
    return fail('planner-transaction-mismatch');
   const token=lock({id:++sequence});
   pending={token,currentRaw,candidateRaw,
    sourceRows:source.writes.map(e=>({key:e.key,before:e.before,after:e.after})),
    plan:transactionReview.plan};
   return lock({ok:true,token,changedKeys:source.changes,
    currentWallet:source.summary.currentWallet,
    incomingWallet:source.summary.incomingWallet,
    currentWordTrails:source.summary.currentWordTrails,
    incomingWordTrails:source.summary.incomingWordTrails,
    ownedWheelsKept:lock([...source.summary.preservedOwnedWheels]),
    liveCrosswordExcluded:true,testCoinsStaySeparate:true,
    needsVerifiedBackup:true,needsExplicitConsent:true,
    productionReady:false});
  }catch(_){return fail('backup-validation-or-recovery-review-required')}
 }
 async function apply({token,approved=false,backupConfirmed=false}={}){
  // No caller can apply arbitrary JSON write plans; it MUST come from stage().
  if(approved!==true||backupConfirmed!==true)return fail('consent-and-backup-required');
  if(!pending||token!==pending.token)return fail('no-valid-reviewed-backup-plan');
  const selected=pending;pending=null; // Consume before async lock to prevent replay.
  try{
   // Native saves may change between file preview and the user's final tap.
   const verified=coordinator.verifyCurrentBackupCopy(selected.currentRaw);
   if(!verified.matchesCurrent||!verified.liveCrosswordExcluded)
    return fail('current-save-changed-after-preview');
   const source=coordinator.previewRestoreWrites(selected.candidateRaw);
   if(!source.valid||!source.liveWordTrailsExcluded||
      !source.testCoinsQuarantined||
      !sameSteps(selected.sourceRows,source.writes))
    return fail('restore-plan-changed-after-preview');
   // Recheck v7 plan; v7 additionally compares every BEFORE value INSIDE lock.
   const refreshed=transaction.preview(source.writes.map(e=>({key:e.key,after:e.after})));
   if(!refreshed.ok||!sameSteps(selected.plan.steps,refreshed.plan?.steps))
    return fail('transaction-plan-stale');
   return await transaction.apply({
    approved:true,backupConfirmed:true,plan:selected.plan
   });
  }catch(_){return fail('restore-blocked-needs-review',{needsManualReview:true})}
 }
 return lock({stage,apply,version:'8.0.0-unlinked-test-only',activeOnGamePages:false,
  importedAnyPlayerData:false});
}
window.BUWTNativeBackupRestoreBridgeCandidateV8=lock({
 version:'8.0.0-unlinked-test-only',createForServices,
 noAutomaticImport:true,requiresCompleteBackup:true,requiresExplicitConsent:true
});
})();

/* Bible Unfolded · Word Trails exclusive consent import boundary (prototype v2).
 * Visual Lab TEST repository ONLY. Not loaded by ANY game or transfer demo.
 * Adds a cooperative browser-wide Web Lock around the already validated
 * v1 consent candidate, and intentionally FAILS CLOSED when locks are missing.
 * It never runs an import on load or reads real localStorage on load.
 *
 * A Web Lock only coordinates participating tabs. It cannot stop the existing
 * LIVE auto-migration code or another uncooperative writer. Before LIVE use,
 * retire/replace the old auto-import, add user-visible confirmation + backup,
 * and obtain explicit owner approval.
 */
(()=>{'use strict';
const LOCK='bible-unfolded-word-trails-progress-import-exclusive-v2';
function createForStorage(storage,locks){
  const factory=window.BUWTConsentMigrationCandidateV1?.createForStorage;
  if(typeof factory!=='function')throw Error('The audited consent-v1 validator must load first');
  const validated=factory(storage);
  function preview(){return validated.preview()}
  async function acceptWithExclusiveLock(options={}){
    if(options?.approved!==true||typeof options.sourceRaw!=='string')
      return Object.freeze({ok:false,reason:'consent-required'});
    if(!locks||typeof locks.request!=='function')
      return Object.freeze({ok:false,reason:'exclusive-lock-unavailable'});
    try{
      return await locks.request(LOCK,{mode:'exclusive',ifAvailable:true},async lock=>{
        if(!lock)return Object.freeze({ok:false,reason:'another-transfer-in-progress'});
        // Revalidation is deliberately INSIDE the shared lock, after consent.
        // v1 checks current LIVE key, exact TEST source and every claim ledger
        // before writing only the LIVE crossword progress key.
        const result=validated.acceptExplicitly(options);
        if(result.ok)return Object.freeze({...result,via:'exclusive-browser-lock-v2'});
        if(result.reason==='save-failed'){
          // A storage read might fail after a successful single-key write.
          // NEVER delete/overwrite the key automatically: a game tab could now
          // own it. Flag inspection and require recovery, rather than losing
          // another writer's progress.
          return Object.freeze({...result,requiresRecoveryReview:true});
        }
        return result;
      });
    }catch(_){
      return Object.freeze({ok:false,reason:'exclusive-lock-failed'});
    }
  }
  return Object.freeze({preview,acceptWithExclusiveLock});
}
window.BUWTExclusiveConsentBoundaryV2=Object.freeze({
  version:'2.0.0-test-only-unwired',lockName:LOCK,createForStorage
});
})();

/* Bible Unfolded · Word Trails LIVE MIGRATION SCRIPT SLOT (proposal v4).
 * Visual Lab TEST ONLY — NOT installed in an active game or LIVE.
 *
 * Purpose: replace the old LIVE on-load auto-import with a SAFE INERT ENTRY
 * POINT for a future user-visible opt-in and crossword-only backup flow.
 *
 * Loading/evaluating this script performs ZERO storage reads or writes,
 * downloads, UI actions, network calls, and does not create a save.
 * Future native Settings/UI must explicitly call createForBrowser() AFTER
 * a player action, export the checkpoint, and confirm its save separately.
 * Do not promote while legacy LIVE tabs/autoloaders remain uncoordinated.
 */
(()=>{'use strict';
const VERSION='4.0.0-test-only-proposal';
function createForStorage(storage,locks){
 const service=window.BUWTRecoveryCheckpointCandidateV3;
 if(!service||typeof service.createForStorage!=='function')
  throw Error('Word Trails opt-in gate requires validated v3 checkpoint engine');
 const api=service.createForStorage(storage,locks);
 // Explicit, separate calls. No method may automatically import on preview,
 // file generation, script evaluation, or the ordinary Word Trails launch.
 return Object.freeze({
  preview:()=>api.preview(),
  exportCheckpoint:checkpoint=>api.exportCheckpoint(checkpoint),
  validateCheckpoint:document=>api.validateCheckpoint(document),
  applyWithConfirmedBackup:args=>api.apply(args),
  rollbackWithApproval:args=>api.rollback(args)
 });
}
function createForBrowser(){
 // This method is never called on load. A future native, user-initiated
 // Settings action must call it explicitly and must handle missing Web Locks
 // by refusing import. No unsafe fallback for Safari or other browsers.
 return createForStorage(localStorage,navigator.locks);
}
window.BUWTLiveConsentMigrationGateV4=Object.freeze({
 version:VERSION,createForStorage,createForBrowser,
 requiresVisibleUserConsent:true,requiresSavedCheckpoint:true,
 automaticImport:false
});
})();

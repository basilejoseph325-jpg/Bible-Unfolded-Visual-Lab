/* Bible Unfolded / Visual Lab — FULL-GAME restore journal conflict guard v6.
 * TEST-ONLY, UNLINKED PROTOTYPE. This script has zero storage operations on load.
 * It is NOT a patch for existing v2 import/recoverPending(), which may run
 * before this script. The old LIVE importer and nonparticipating tabs remain
 * an independent release blocker. Do not activate in game pages.
 */
(()=>{'use strict';
const LEGACY='bu-visual-lab-import-rollback-v2';
const GUARD='bu-visual-lab-import-rollback-v3';
const FORMAT='BibleUnfoldedGuardedFullBackupRecovery';
const LOCK='bible-unfolded-full-backup-recovery-exclusive-v3';
const NATIVE=/^(?:bible-unfolded|story-trails)-[a-z0-9_.-]+$/i;
const EXTRA=new Set(['bu-visual-lab-wordtrails-next-v1','bu-wt-next-feel-v2']);
const max=300000;
const fail=(reason,details={})=>Object.freeze({ok:false,reason,...details});
function allowed(k){
 return typeof k==='string' && k.length<=160 &&
   (NATIVE.test(k)||EXTRA.has(k)) && k!==LEGACY && k!==GUARD;
}
function str(v){return v===null||(typeof v==='string'&&v.length<=max)}
function parse(raw){
 if(typeof raw!=='string'||raw.length>750000)return null;
 let j;try{j=JSON.parse(raw)}catch(_){return null}
 if(!j||typeof j!=='object'||Array.isArray(j)||
    j.format!==FORMAT||j.version!==3||
    !Array.isArray(j.steps)||!j.steps.length||j.steps.length>100)return null;
 const seen=new Set();
 for(const e of j.steps){
  if(!e||typeof e!=='object'||Array.isArray(e)||
     !allowed(e.key)||seen.has(e.key)||!Object.prototype.hasOwnProperty.call(e,'before')||
     !Object.prototype.hasOwnProperty.call(e,'after')||
     !str(e.before)||!str(e.after)||e.before===e.after)return null;
  seen.add(e.key);
 }
 return j;
}
function createForStorage(storage,locks){
 if(!storage||typeof storage.getItem!=='function'||typeof storage.setItem!=='function'||
    typeof storage.removeItem!=='function')throw Error('Controlled storage adapter required');
 function inspect(){
  let legacy,raw;
  try{legacy=storage.getItem(LEGACY);raw=storage.getItem(GUARD)}
  catch(_){return fail('storage-read-failed',{manualReview:true})}
  if(legacy!==null)return fail('legacy-v2-journal-has-no-after-values',{
   manualReview:true,blocked:true});
  if(raw===null)return Object.freeze({ok:true,pending:false,eligible:false});
  const j=parse(raw);
  if(!j)return fail('invalid-v3-journal',{manualReview:true});
  let untouched=0,matched=0;const conflicts=[];
  try{
   for(const e of j.steps){
    const current=storage.getItem(e.key);
    if(current===e.before)untouched++;
    else if(current===e.after)matched++;
    else conflicts.push(e.key);
   }
  }catch(_){return fail('storage-read-failed',{manualReview:true})}
  return Object.freeze({ok:conflicts.length===0,pending:true,
   eligible:conflicts.length===0,entries:j.steps.length,
   untouched,needsRewind:matched,
   conflicts:Object.freeze(conflicts),reason:conflicts.length?'concurrent-writer-conflict':null,
   manualReview:conflicts.length>0});
 }
 async function recoverExplicitly({approved=false,backupConfirmed=false}={}){
  if(approved!==true||backupConfirmed!==true)
   return fail('explicit-approval-and-private-backup-required');
  if(!locks||typeof locks.request!=='function')
   return fail('exclusive-web-locks-unavailable',{manualReview:true});
  try{
   return await locks.request(LOCK,{mode:'exclusive',ifAvailable:true},lock=>{
    if(!lock)return fail('another-recovery-in-progress');
    const check=inspect();
    if(!check.ok||!check.pending||!check.eligible)
     return fail(check.reason||'no-safe-pending-recovery',{manualReview:!check.ok});
    const j=parse(storage.getItem(GUARD));
    if(!j)return fail('journal-changed',{manualReview:true});
    try{
     for(const e of j.steps){
      const current=storage.getItem(e.key);
      if(current===e.before)continue;
      if(current!==e.after)return fail('concurrent-writer-conflict',{manualReview:true});
      if(e.before===null)storage.removeItem(e.key);
      else storage.setItem(e.key,e.before);
      if(storage.getItem(e.key)!==e.before)
       return fail('recovery-readback-mismatch',{manualReview:true});
     }
     // Only after verifying all keys. Keep journal if anything was ambiguous.
     if(storage.getItem(GUARD)!==JSON.stringify(j))
      return fail('journal-changed',{manualReview:true});
     storage.removeItem(GUARD);
     if(storage.getItem(GUARD)!==null)
      return fail('journal-removal-unverified',{manualReview:true});
     return Object.freeze({ok:true,recovered:true,entries:j.steps.length,
       cooperativeTabsOnly:true});
    }catch(_){return fail('recovery-write-uncertain',{manualReview:true})}
   });
  }catch(_){return fail('exclusive-lock-failed',{manualReview:true})}
 }
 return Object.freeze({inspect,recoverExplicitly});
}
window.BUWTFullBackupJournalGuardV6=Object.freeze({
 version:'6.0.0-test-unlinked',format:FORMAT,
 legacyJournalKey:LEGACY,proposedJournalKey:GUARD,lockName:LOCK,
 createForStorage
});
})();

/* Bible Unfolded Visual Lab: guarded full-game restore TRANSACTION v7.
 * TEST ONLY / INERT / UNLINKED. Never load this from any game page.
 * Injection-only: fake controlled storage; does not open real localStorage.
 * A future trusted native backup planner must validate wallet, ownership,
 * v1/v2 backup formats and explicit player intent BEFORE producing writes.
 *
 * This prototype deliberately NEVER calls v2 recoverPending/applyBackup.
 * It will not stop uncooperative LIVE tabs, stale scripts or native v2 writers.
 */
(()=>{'use strict';
const JOURNAL='bu-visual-lab-import-transaction-v7';
const COMMIT='bu-visual-lab-import-transaction-commit-v7';
const LEGACY='bu-visual-lab-import-rollback-v2';
const V6='bu-visual-lab-import-rollback-v3';
const LOCK='bible-unfolded-full-backup-recovery-exclusive-v3';
const FORMAT='BibleUnfoldedFullBackupTransactionV7';
const PLAN='BibleUnfoldedFullBackupPlanV7';
const NATIVE=/^(?:bible-unfolded|story-trails)-[a-z0-9_.-]+$/i;
const EXTRA=new Set(['bu-visual-lab-wordtrails-next-v1','bu-wt-next-feel-v2']);
const F=Object.freeze,MAX_KEYS=100,MAX_VALUE=300000,MAX_JOURNAL=1700000;
const deny=(reason,more={})=>F({ok:false,reason,...more});
const own=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const permitted=k=>typeof k==='string'&&k.length<=160 &&
 (NATIVE.test(k)||EXTRA.has(k)) &&
 !new Set([JOURNAL,COMMIT,LEGACY,V6,'bu-visual-lab-import-committed-v2',
 'bible-unfolded-word-trails-next-v1']).has(k);
const validValue=x=>x===null||(typeof x==='string'&&x.length<=MAX_VALUE);
function validSteps(steps){
 if(!Array.isArray(steps)||steps.length<1||steps.length>MAX_KEYS)return false;
 const seen=new Set();
 for(const e of steps){
  if(!own(e)||!permitted(e.key)||seen.has(e.key)||
   !Object.prototype.hasOwnProperty.call(e,'before')||
   !Object.prototype.hasOwnProperty.call(e,'after')||
   !validValue(e.before)||!validValue(e.after)||e.before===e.after)return false;
  seen.add(e.key);
 }
 return true;
}
function parse(raw){
 if(typeof raw!=='string'||raw.length>MAX_JOURNAL)return null;
 try{return JSON.parse(raw)}catch(_){return null}
}
function createForStorage(storage,locks,nonce){
 if(!storage||typeof storage.getItem!=='function'||
  typeof storage.setItem!=='function'||typeof storage.removeItem!=='function')
  throw Error('Controlled storage adapter required');
 // Only an explicit trusted caller can inject browser Web Locks + random UUID.
 // In ordinary operation the real game never creates this service.
 const read=k=>storage.getItem(k);
 function blocked(){
  if(read(LEGACY)!==null)return 'unsafe-legacy-v2-journal';
  if(read(V6)!==null)return 'unknown-v6-journal';
  return null;
 }
 function journal(){
  const raw=read(JOURNAL);
  if(raw===null)return null;
  const j=parse(raw);
  if(!own(j)||j.format!==FORMAT||j.version!==7||typeof j.id!=='string'||
   !/^[a-z0-9-]{12,80}$/i.test(j.id)||!validSteps(j.steps))return false;
  return {raw,record:j};
 }
 function inspect(){
  try{
   const old=blocked();
   if(old)return deny(old,{needsManualReview:true});
   const x=journal(),marker=read(COMMIT);
   if(x===false)return deny('invalid-journal',{needsManualReview:true});
   if(!x)return marker===null?F({ok:true,pending:false}):
    deny('orphan-commit-marker',{needsManualReview:true});
   if(marker!==null&&marker!==x.record.id)
    return deny('commit-marker-mismatch',{needsManualReview:true});
   let before=0,after=0;const conflicts=[];
   for(const e of x.record.steps){
    const current=read(e.key);
    if(current===e.before)before++;
    else if(current===e.after)after++;
    else conflicts.push(e.key);
   }
   return F({ok:conflicts.length===0,pending:true,committed:marker!==null,
    before,after,conflicts:F(conflicts),
    needsManualReview:conflicts.length>0,
    reason:conflicts.length?'concurrent-writer-conflict':null});
  }catch(_){return deny('storage-unavailable',{needsManualReview:true})}
 }
 function preview(writes){
  try{
   if(!Array.isArray(writes)||writes.length>MAX_KEYS)return deny('invalid-writes');
   const steps=[];
   for(const e of writes){
    if(!own(e)||!permitted(e.key)||!validValue(e.after))
     return deny('invalid-writes');
    const before=read(e.key);
    if(!validValue(before))return deny('oversized-current-save');
    if(before!==e.after)steps.push({key:e.key,before,after:e.after});
   }
   if(!validSteps(steps))return deny('no-change-or-invalid-writes');
   const current=inspect();
   if(!current.ok||current.pending)return deny(current.reason||'unresolved-restore',{needsManualReview:!!current.needsManualReview});
   const plan=F({format:PLAN,version:7,steps:F(steps.map(e=>F({...e}))),
    source:'trusted-planner-required',
    warning:'Contains complete game data. Only use after explicit backup, validation and private consent.'});
   if(JSON.stringify(plan).length>MAX_JOURNAL)return deny('oversized-plan');
   return F({ok:true,plan,changes:steps.length});
  }catch(_){return deny('storage-unavailable',{needsManualReview:true})}
 }
 async function withLock(fn){
  if(!locks||typeof locks.request!=='function')return deny('exclusive-lock-unavailable');
  try{return await locks.request(LOCK,{mode:'exclusive',ifAvailable:true},l=>
   l?fn():deny('another-restore-in-progress'))}
  catch(_){return deny('exclusive-lock-failed',{needsManualReview:true})}
 }
 function safeWrite(key,val){
  if(val===null)storage.removeItem(key);else storage.setItem(key,val);
  if(read(key)!==val)throw Error('readback-mismatch');
 }
 async function apply({approved=false,backupConfirmed=false,plan}={}){
  if(approved!==true||backupConfirmed!==true)
   return deny('consent-and-complete-backup-required');
  if(!own(plan)||plan.format!==PLAN||plan.version!==7||
   !validSteps(plan.steps))return deny('invalid-plan');
  return withLock(()=>{
   try{
    const old=blocked();
    if(old)return deny(old,{needsManualReview:true});
    if(read(JOURNAL)!==null||read(COMMIT)!==null)
     return deny('another-journal-pending',{needsManualReview:true});
    for(const e of plan.steps)if(read(e.key)!==e.before)
     return deny('preview-stale-no-writes');
    if(typeof nonce!=='function')return deny('secure-id-unavailable');
    const id=nonce();
    if(typeof id!=='string'||!/^[a-z0-9-]{12,80}$/i.test(id))
     return deny('secure-id-invalid');
    const record=JSON.stringify({format:FORMAT,version:7,id,
     steps:plan.steps.map(e=>({key:e.key,before:e.before,after:e.after}))});
    if(record.length>MAX_JOURNAL)return deny('oversized-journal');
    safeWrite(JOURNAL,record);
    // After journal installation, any I/O failure demands manual review;
    // NEVER blindly rewind a possibly updated concurrent player's save.
    try{
     for(const e of plan.steps){
      if(read(e.key)!==e.before)return deny('writer-conflict-during-import',{needsManualReview:true});
      safeWrite(e.key,e.after);
     }
     if(read(JOURNAL)!==record)return deny('journal-altered',{needsManualReview:true});
     safeWrite(COMMIT,id);
     // The committed marker is written only after every target is verified.
     // Future recovery must never roll back such an already-committed restore.
     try{
      storage.removeItem(JOURNAL);
      storage.removeItem(COMMIT);
     }catch(_){return F({ok:true,committed:true,needsCleanup:true})}
     if(read(JOURNAL)!==null||read(COMMIT)!==null)
      return F({ok:true,committed:true,needsCleanup:true});
     return F({ok:true,committed:true,changes:plan.steps.length});
    }catch(_){return deny('partial-import-needs-review',{needsManualReview:true})}
   }catch(_){return deny('storage-unavailable',{needsManualReview:true})}
  });
 }
 async function recover({approved=false,backupConfirmed=false}={}){
  if(approved!==true||backupConfirmed!==true)
   return deny('consent-and-complete-backup-required');
  return withLock(()=>{
   try{
    const state=inspect();
    if(!state.ok||!state.pending)return deny(state.reason||'no-pending-journal',
     {needsManualReview:!state.ok});
    const j=journal();
    if(!j||j===false)return deny('invalid-journal',{needsManualReview:true});
    const marker=read(COMMIT);
    // A successful restore may have crashed during journal cleanup; it MUST
    // never be rolled back merely because a journal is still present.
    if(marker===j.record.id){
     if(state.before>0)return deny('committed-restore-has-conflict',{needsManualReview:true});
     if(state.conflicts.length)return deny('committed-restore-has-conflict',{needsManualReview:true});
     try{storage.removeItem(JOURNAL);storage.removeItem(COMMIT)}
     catch(_){return deny('committed-cleanup-needs-review',{needsManualReview:true})}
     return F({ok:true,committedKept:true,cleaned:true});
    }
    if(marker!==null)return deny('commit-marker-mismatch',{needsManualReview:true});
    // Dry-run ALL entries before touching any; a newer wallet write is a
    // hard conflict and MUST NOT be lost by a recovered old snapshot.
    for(const e of j.record.steps){
     const now=read(e.key);
     if(now!==e.before&&now!==e.after)
      return deny('concurrent-writer-conflict',{needsManualReview:true});
    }
    try{
     for(const e of j.record.steps){
      if(read(e.key)===e.before)continue;
      if(read(e.key)!==e.after)return deny('concurrent-writer-conflict',{needsManualReview:true});
      safeWrite(e.key,e.before);
     }
     if(read(JOURNAL)!==j.raw)return deny('journal-altered',{needsManualReview:true});
     storage.removeItem(JOURNAL);
     if(read(JOURNAL)!==null)return deny('journal-cleanup-needs-review',{needsManualReview:true});
     return F({ok:true,recovered:true,rollbackOfUncommittedOnly:true});
    }catch(_){return deny('recovery-write-needs-review',{needsManualReview:true})}
   }catch(_){return deny('storage-unavailable',{needsManualReview:true})}
  });
 }
 return F({preview,apply,inspect,recover,keys:F({JOURNAL,COMMIT,LEGACY}),
  lockName:LOCK,version:'7.0.0-test-unlinked'});
}
window.BUWTNativeFullBackupTransactionV7=F({createForStorage,
 version:'7.0.0-test-unlinked',loadedFromRealGame:false,
 warning:'Only controlled fake test storage; no native Settings integration.'});
})();
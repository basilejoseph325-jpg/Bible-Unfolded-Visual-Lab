/* Bible Unfolded · Word Trails consent + recovery CHECKPOINT v3 CANDIDATE.
   TEST REPOSITORY ONLY. No game page or demo loads this module.
   Never automatically imports, exports, rolls back, or touches localStorage.
   Existing v2 Web Lock guards only COOPERATING tabs: old LIVE auto-import
   still needs retirement in an explicitly owner-approved release. */
(()=>{'use strict';
const TEST='bu-visual-lab-wordtrails-next-v1';
const LIVE='bible-unfolded-word-trails-next-v1';
const FORMAT='BibleUnfoldedWordTrailsRecoveryCheckpoint';
const VERSION=3;
const MAX_RAW=220000;
const MAX_SERIALIZED=500000;
const LOCK='bible-unfolded-word-trails-progress-import-exclusive-v2';
const FROZEN=Object.freeze;
function readableCheckpoint(input){
 let c=input;
 if(typeof c==='string'){
  if(c.length>MAX_SERIALIZED)return null;
  try{c=JSON.parse(c)}catch(_){return null}
 }
 if(!c||typeof c!=='object'||Array.isArray(c)||c.format!==FORMAT||
  c.version!==VERSION||c.scope!=='crossword-only'||c.liveBefore!==null||
  c.currenciesExcluded!==true||c.nativeWalletExcluded!==true||
  typeof c.sourceRaw!=='string'||typeof c.expectedLiveRaw!=='string'||
  c.sourceRaw.length>MAX_RAW||c.expectedLiveRaw.length>MAX_RAW||
  c.sourceRaw.length<2||c.expectedLiveRaw.length<2)return null;
 return c;
}
function createForStorage(storage,locks){
 if(!storage||typeof storage.getItem!=='function'||
    typeof storage.setItem!=='function'||typeof storage.removeItem!=='function')
  throw Error('A controlled storage adapter is required');
 const v1=window.BUWTConsentMigrationCandidateV1;
 const v2=window.BUWTExclusiveConsentBoundaryV2;
 if(typeof v1?.createForStorage!=='function'||typeof v2?.createForStorage!=='function'||
    v2.lockName!==LOCK)throw Error('Require matching audited consent-v1 + Web Locks-v2');
 const exclusive=v2.createForStorage(storage,locks);
 function safeExpectedRaw(raw){
  // Reuse the ACTUAL validated source normalization in an in-memory fake
  // storage adapter, avoiding a second imperfect copy of schema rules.
  if(typeof raw!=='string'||raw.length>MAX_RAW)return null;
  let target=null;
  const sandbox={
   getItem:key=>key===TEST?raw:key===LIVE?target:null,
   setItem:(key,value)=>{if(key!==LIVE)throw Error('Unexpected draft write');target=String(value)}
  };
  try{
   const validator=v1.createForStorage(sandbox);
   const p=validator.preview();
   if(!p.available||p.sourceRaw!==raw)return null;
   const res=validator.acceptExplicitly({approved:true,sourceRaw:raw});
   if(!res.ok||typeof target!=='string')return null;
   return target;
  }catch(_){return null}
 }
 function validateCheckpoint(input){
  const c=readableCheckpoint(input);
  if(!c)return null;
  const rebuilt=safeExpectedRaw(c.sourceRaw);
  if(!rebuilt||rebuilt!==c.expectedLiveRaw)return null;
  return c;
 }
 function preview(){
  const p=exclusive.preview();
  if(!p.available)return FROZEN({available:false,reason:p.reason});
  const expectedLiveRaw=safeExpectedRaw(p.sourceRaw);
  if(!expectedLiveRaw)return FROZEN({available:false,reason:'checkpoint-validation-failed'});
  const checkpoint=FROZEN({format:FORMAT,version:VERSION,scope:'crossword-only',
   sourceRaw:p.sourceRaw,expectedLiveRaw,liveBefore:null,
   currenciesExcluded:true,nativeWalletExcluded:true,
   warning:'Contains personal crossword progress. Keep this checkpoint private; no shared wallet, purchases, voices or Settings are included.'});
  return FROZEN({available:true,completedCount:p.completedCount,
    unlockedLevels:p.unlockedLevels,requiresExplicitConsent:true,
    backupMustBeSavedBeforeApplying:true,checkpoint});
 }
 function exportCheckpoint(input){
  const c=validateCheckpoint(input);if(!c)return null;
  const raw=JSON.stringify(c);return raw.length<=MAX_SERIALIZED?raw:null;
 }
 async function apply({approved=false,checkpoint,backupConfirmed=false}={}){
  if(approved!==true||backupConfirmed!==true)
   return FROZEN({ok:false,reason:'consent-and-backup-required'});
  const c=validateCheckpoint(checkpoint);
  if(!c)return FROZEN({ok:false,reason:'invalid-checkpoint'});
  const res=await exclusive.acceptWithExclusiveLock({approved:true,sourceRaw:c.sourceRaw});
  if(!res.ok)return res;
  try{
   if(storage.getItem(LIVE)!==c.expectedLiveRaw)
    return FROZEN({ok:false,reason:'post-import-state-changed',requiresRecoveryReview:true});
  }catch(_){
   return FROZEN({ok:false,reason:'post-import-verification-failed',requiresRecoveryReview:true});
  }
  return FROZEN({...res,checkpoint:c,backupWasConfirmed:true});
 }
 async function rollback({approved=false,checkpoint}={}){
  if(approved!==true)return FROZEN({ok:false,reason:'explicit-rollback-consent-required'});
  const c=validateCheckpoint(checkpoint);
  if(!c)return FROZEN({ok:false,reason:'invalid-checkpoint'});
  if(!locks||typeof locks.request!=='function')
   return FROZEN({ok:false,reason:'exclusive-lock-unavailable'});
  try{
   return await locks.request(LOCK,{mode:'exclusive',ifAvailable:true},lock=>{
    if(!lock)return FROZEN({ok:false,reason:'another-transfer-in-progress'});
    let live;
    try{live=storage.getItem(LIVE)}catch(_){
     return FROZEN({ok:false,reason:'rollback-storage-unavailable',requiresRecoveryReview:true});
    }
    if(live===null)return FROZEN({ok:false,reason:'no-imported-live-progress'});
    // NEVER delete current gameplay that has progressed after import.
    if(live!==c.expectedLiveRaw)
     return FROZEN({ok:false,reason:'live-progress-has-changed'});
    try{
     storage.removeItem(LIVE);
     if(storage.getItem(LIVE)!==null)throw Error('Rollback readback failed');
     return FROZEN({ok:true,removedOnlyImportedCrossword:true,
       sharedWalletUntouched:true,purchasesAndVoiceUntouched:true});
    }catch(_){
     return FROZEN({ok:false,reason:'rollback-needs-review',requiresRecoveryReview:true});
    }
   });
  }catch(_){return FROZEN({ok:false,reason:'exclusive-lock-failed'})}
 }
 return FROZEN({preview,exportCheckpoint,apply,rollback,validateCheckpoint,
   schema:FORMAT,version:VERSION});
}
window.BUWTRecoveryCheckpointCandidateV3=FROZEN({
 version:'3.0.0-test-only-unlinked',format:FORMAT,createForStorage
});
})();
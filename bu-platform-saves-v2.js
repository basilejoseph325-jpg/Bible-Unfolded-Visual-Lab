/* Bible Unfolded Visual Lab ONLY — coordinated native + Word Trails save v2.
   Canonical native game keys remain owned by the original Bible Unfolded engine.
   Word Trails' separate TEST currency is NEVER mapped to real Insight Tokens.
   Version 1 original backups remain accepted by the native handler. */
(()=>{'use strict';
if(window.BUPlatformSaves)return;
const NATIVE=/^(?:bible-unfolded|story-trails)-[a-z0-9_.-]+$/i;
const TEST='bu-visual-lab-wordtrails-next-v1';
const FEEL='bu-wt-next-feel-v2';
// TEST and protected LIVE share a browser origin. The LIVE crossword key
// must NEVER enter a Visual Lab native backup or TEST restore transaction.
const LIVE_CROSSWORD='bible-unfolded-word-trails-next-v1';
const JOURNAL='bu-visual-lab-import-rollback-v2';
const COMMITTED='bu-visual-lab-import-committed-v2';
const BACKUP_VERSION=2,MAX_BYTES=2000000,MAX_KEYS=100,MAX_NATIVE_VALUE=300000;
const WALLETS=['bible-unfolded-rewards-v17','bible-unfolded-rewards-v17-recovery-v3811'];
const OWNERSHIP=['bible-unfolded-wheel-ownership-v3825','bible-unfolded-wheel-ownership-v3825-backup'];
const WHEELS=['goldwheel','moonwheel','seawheel'];
const keysToKeep=[TEST,FEEL];
// Passive in-memory warning for other same-origin pages/frames writing shared
// native wallets, purchased-wheel ownership or protected LIVE crossword data.
// Old LIVE scripts do not participate in a lock: this detector does NOT
// prevent their writes or guarantee transaction safety.
const EXTERNAL_NATIVE=new Set([...WALLETS,...OWNERSHIP,LIVE_CROSSWORD]);
const competingPages=new Set();
let migratedLiveElsewhere=false;
function externalChangeStatus(){
 return Object.freeze({detected:competingPages.size>0,
  keys:Object.freeze([...competingPages]),
  oldLiveMigrationObserved:migratedLiveElsewhere,
  warningOnly:true,cannotStopLegacyTabs:true});
}
function assertNoExternalWriter(){
 if(competingPages.size)
  throw Error('Another Bible Unfolded page or frame changed shared progress while TEST was open. Backup imports are paused here. Download current progress, close other open game tabs, and reopen TEST before considering another import.');
}
/* READ ONLY: a new TEST session can miss a storage event emitted before
 * it opened. Inspect the current LIVE/TEST crossword key state, but do NOT
 * claim this proves old tabs are present, and never set a LIVE sentinel.
 * Exact original LIVE migration V1 reads TEST when LIVE is absent, then
 * validates level/unlocked, arrays and optional progress before writing. */
function legacyMigrationInputLooksUsable(raw){
 const x=getJson(raw);
 if(!x||!Number.isInteger(x.level)||x.level<0||x.level>29||
    !Number.isInteger(x.unlocked)||x.unlocked<0||x.unlocked>29)return false;
 for(const k of ['completed','sparks','claimedSparks','boardBible','paidWords','paidBonuses','claimedFreeHints']){
  const a=x[k]===undefined?[]:x[k];
  if(!Array.isArray(a)||a.length>6000||a.some(v=>typeof v==='number'?
     !Number.isInteger(v)||v<0||v>29:
     typeof v!=='string'||v.length>100||!/^[a-z0-9_:|.-]+$/i.test(v)))return false;
 }
 if(x.progress!==undefined&&x.progress!==null){
  const q=x.progress;
  if(!own(q)||!Number.isInteger(q.level)||q.level<0||q.level>29)return false;
  for(const k of ['found','bonuses','hinted'])
   if(!Array.isArray(q[k])||q[k].length>120||
      q[k].some(v=>typeof v!=='string'||!/^[A-Z0-9:]+$/.test(v)))return false;
  if(!Number.isFinite(q.combo)||q.combo<0||q.combo>1000)return false;
 }
 return true;
}
function legacyTransitionStatus(){
 const live=read(LIVE_CROSSWORD),test=read(TEST),record=getJson(live);
 const legacyRecord=!!(record?.migration?.version===1&&
   record.migration.source==='Visual Lab crossword progress');
 return Object.freeze({
  liveSavePresent:live!==null,
  testSavePresent:test!==null,
  oldMigrationMarkerPresent:legacyRecord,
  oldImporterCouldRecreateMissingLive:live===null&&legacyMigrationInputLooksUsable(test),
  readOnly:true,cannotVerifyNoOldTabs:true,
  approvalToImportOrPromote:false
 });
}
function observeExternalStorage(event){
 // Browser storage events report writes in OTHER documents on this origin;
 // a native game iframe may be the source, so do not claim tab identity.
 if(!event||!EXTERNAL_NATIVE.has(event.key)||event.oldValue===event.newValue||
    (event.storageArea&&event.storageArea!==localStorage))return;
 competingPages.add(event.key);
 if(event.key===LIVE_CROSSWORD){
  // Update the separate READ-ONLY startup notice if an older migration
  // arrives while TEST is open. Don't leave a "LIVE missing" warning after
  // another page created the LIVE key, or erase any player data.
  const oldReview=document.getElementById('bu-wt-legacy-transition-review');
  if(oldReview)oldReview.remove();
  const next=getJson(event.newValue);
  if(next?.migration?.version===1&&
     next.migration.source==='Visual Lab crossword progress')
   migratedLiveElsewhere=true;
 }
 if(recoverPending().needsManualReview)
  notice('Backup recovery needs review; no progress was automatically replaced. Another open Bible Unfolded page or frame also changed shared progress.');
 else notice('Another Bible Unfolded page or frame changed shared saved progress. Backup imports are paused in this TEST session; current progress can still be exported.');
 installConcurrentReview();
 installLegacyTransitionReview();
}

const own=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);
const allowed=k=>typeof k==='string'&&k.length<=160&&NATIVE.test(k)&&k!==LIVE_CROSSWORD;
const parse=s=>JSON.parse(s);
const safeNum=x=>Number.isSafeInteger(x)&&x>=0&&x<=1000000000;
const dataStr=(v,max)=>v===null||(typeof v==='string'&&v.length<=max);
const read=k=>localStorage.getItem(k);
const getJson=s=>{try{const v=parse(s);return own(v)?v:null}catch(_){return null}};
function inventory(){
 const a={};
 for(let i=0;i<localStorage.length;i++){
  const k=localStorage.key(i);
  if(allowed(k)){const v=read(k);if(v!==null)a[k]=v}
 }
 return a;
}
function validateTrails(raw){
 if(raw===null)return {present:false,level:null,coins:null,completedCount:0};
 if(!dataStr(raw,220000))throw Error('Word Trails save exceeds the safe size limit.');
 const s=getJson(raw);if(!s)throw Error('Word Trails save is not a valid object.');
 for(const k of ['level','unlocked']){
  if(!Number.isInteger(s[k])||s[k]<0||s[k]>29)throw Error('Word Trails '+k+' is out of range.');
 }
 for(const k of ['coins','points'])if(!safeNum(s[k]))throw Error('Word Trails TEST '+k+' is invalid.');
 const fields=['completed','sparks','claimedSparks','boardBible','paidWords','paidBonuses','claimedFreeHints'];
 for(const k of fields){
  // Older Word Trails prototypes did not save every discovery/bonus ledger.
  // Preserve the original raw save; the current game supplies missing arrays.
  if(s[k]===undefined)continue;
  if(!Array.isArray(s[k])||s[k].length>6000)throw Error('Word Trails '+k+' is invalid.');
  for(const item of s[k]){
   if(typeof item==='number'){if(!Number.isSafeInteger(item)||item<0||item>29)throw Error('Bad Word Trails '+k+' level.')}
   else if(typeof item==='string'){if(item.length>90||!/^[a-z0-9_:|.-]+$/i.test(item))throw Error('Bad Word Trails '+k+' value.')}
   else throw Error('Bad Word Trails '+k+' entry.');
  }
 }
 if(s.progress!==null&&s.progress!==undefined){
  if(!own(s.progress)||!Number.isInteger(s.progress.level)||s.progress.level<0||s.progress.level>29)throw Error('Word Trails in-progress level is invalid.');
  for(const k of ['found','bonuses','hinted']){
   if(s.progress[k]===undefined)continue;
   if(!Array.isArray(s.progress[k])||s.progress[k].length>120||
      s.progress[k].some(x=>typeof x!=='string'||x.length>40||!/^[A-Z0-9:]+$/i.test(x)))throw Error('Word Trails unfinished '+k+' is invalid.');
  }
  if(s.progress.combo!==undefined&&(!safeNum(s.progress.combo)||s.progress.combo>1000))throw Error('Word Trails combo is invalid.');
 }
 return {present:true,level:s.level+1,coins:s.coins,completedCount:new Set(s.completed).size};
}
function validateFeel(raw){
 if(raw===null)return;
 if(!dataStr(raw,10000))throw Error('Word Trails audio preferences exceed the limit.');
 const p=getJson(raw);if(!p)throw Error('Word Trails audio preferences are invalid.');
 for(const k of ['music','sfx','motion','haptics'])if(k in p&&typeof p[k]!=='boolean')throw Error('Invalid Word Trails '+k+' preference.');
 for(const k of ['musicVolume','sfxVolume'])if(k in p&&(!Number.isFinite(Number(p[k]))||Number(p[k])<0||Number(p[k])>100))throw Error('Invalid Word Trails '+k+'.');
}
function nativeData(data){
 if(!own(data)||data.format!=='BibleUnfoldedSave'||data.version!==BACKUP_VERSION||
    !own(data.keys))throw Error('This is not a compatible complete TEST backup.');
 if(Object.prototype.hasOwnProperty.call(data.keys,LIVE_CROSSWORD))
  throw Error('This older TEST backup contains protected LIVE Word Trails progress. Export a fresh TEST backup instead; no data was changed.');
 const pairs=Object.entries(data.keys);
 if(!pairs.length||pairs.length>MAX_KEYS||pairs.some(([k,v])=>!allowed(k)||typeof v!=='string'||v.length>MAX_NATIVE_VALUE))
  throw Error('The native game backup contains invalid keys.');
 const ext=data.extensions;
 if(!own(ext)||!own(ext.wordTrailsNext)||ext.wordTrailsNext.format!=='WordTrailsNextTEST'||
     ext.wordTrailsNext.version!==1)throw Error('Missing versioned Word Trails save section.');
 const t=ext.wordTrailsNext;
 if(!dataStr(t.state,220000)||!dataStr(t.feel,10000))throw Error('Invalid Word Trails backup content.');
 const test=validateTrails(t.state);validateFeel(t.feel);
 for(const k of WALLETS){
  if(!Object.prototype.hasOwnProperty.call(data.keys,k))continue;
  const w=getJson(data.keys[k]);
  if(!w||!Number.isFinite(w.points)||!Number.isFinite(w.coins)||w.coins<0)throw Error('Shared wallet in backup is invalid.');
 }
 return {nativeKeys:pairs.length,test};
}
function walletSummary(kv){
 const w=getJson(kv[WALLETS[0]]||kv[WALLETS[1]]||'');
 return w?{points:w.points,insightTokens:w.coins}:null;
}
function currentSnapshot(){
 const keys=inventory();
 return {keys,trail:read(TEST),feel:read(FEEL)};
}
function makeBackup(){
 const state=currentSnapshot();
 if(!Object.keys(state.keys).length)throw Error('No native progress found to back up.');
 if(Object.keys(state.keys).length>MAX_KEYS||Object.entries(state.keys).some(([k,v])=>!allowed(k)||v.length>MAX_NATIVE_VALUE))
   throw Error('Saved native data exceeds safe backup limits.');
 validateTrails(state.trail);validateFeel(state.feel);
 return {format:'BibleUnfoldedSave',version:BACKUP_VERSION,
  exportedAt:new Date().toISOString(),scope:'Visual Lab TEST',
  keys:state.keys,extensions:{wordTrailsNext:{format:'WordTrailsNextTEST',
    version:1,state:state.trail,feel:state.feel,coinsNeverConvertToInsightTokens:true}}};
}
function dryRun(candidate){
 const c=typeof candidate==='string'?parse(candidate):candidate;
 const v=nativeData(c);
 const existing=currentSnapshot();
 const incoming=walletSummary(c.keys),current=walletSummary(existing.keys);
 const protectedWheels=wheelSet({...existing.keys,...c.keys},existing.keys);
 const sameKeys=Object.entries(c.keys).every(([k,val])=>existing.keys[k]===val);
 return Object.freeze({
  valid:true,version:BACKUP_VERSION,nativeKeys:v.nativeKeys,
  incomingWallet:incoming,currentWallet:current,
  incomingWordTrails:v.test,currentWordTrails:validateTrails(existing.trail),
  preservedOwnedWheels:[...protectedWheels],
  testCoinsQuarantined:true,canApply:true,
  noChangesRequired:sameKeys&&(c.extensions.wordTrailsNext.state===existing.trail||
    c.extensions.wordTrailsNext.state===null)&&
    (c.extensions.wordTrailsNext.feel===existing.feel||c.extensions.wordTrailsNext.feel===null)
 });
}
function wheelSet(next,previous){
 const owned=new Set();
 for(const raw of [...WALLETS,...OWNERSHIP].flatMap(k=>[next[k],previous[k]])){
  const o=getJson(raw);if(!o)continue;
  const values=[...(Array.isArray(o.purchases)?o.purchases:[]),...(Array.isArray(o.owned)?o.owned:[])];
  for(const x of values)if(WHEELS.includes(x))owned.add(x);
 }
 return owned;
}
function protectedNative(incoming,previous){
 // Existing keys absent from a backup are never deleted. Source backup keys replace
 // matching keys, except that paid wheel ownership is losslessly unioned.
 const next={...previous,...incoming};
 const owned=wheelSet(next,previous);
 for(const k of OWNERSHIP){
  const original=getJson(next[k])||{version:1};
  if(owned.size)next[k]=JSON.stringify({...original,owned:[...owned]});
 }
 for(const k of WALLETS){
  const original=getJson(next[k]);if(!original)continue;
  const purchase=new Set(Array.isArray(original.purchases)?original.purchases:[]);
  for(const id of owned)purchase.add(id);
  const selected=original.equippedWheel;
  next[k]=JSON.stringify({...original,purchases:[...purchase],
    equippedWheel: selected==='classic'||owned.has(selected)?selected:'classic'});
 }
 return next;
}
/* Safe read-only native backup plan. Uses THE SAME validated TEST v2
 * native data and wheel-entitlement merge as actual applyBackup(). It
 * READS current localStorage, but WRITES NOTHING and never mutates the
 * journal or wallet. Future v7 consent UI must
 * still require player backup confirmation and a cooperative Web Lock before
 * any write, and never apply an old v2 journal automatically. */
function previewRestoreWrites(candidate){
 assertNoExternalWriter();
 const c=typeof candidate==='string'?parse(candidate):candidate;
 const summary=dryRun(c);
 if(read(JOURNAL)!==null||read(COMMITTED)!==null)
  throw Error('An earlier TEST backup needs recovery review before another restore.');
 const existing=currentSnapshot();
 const desired=protectedNative(c.keys,existing.keys);
 if(c.extensions.wordTrailsNext.state!==null)desired[TEST]=c.extensions.wordTrailsNext.state;
 if(c.extensions.wordTrailsNext.feel!==null)desired[FEEL]=c.extensions.wordTrailsNext.feel;
 const entries=Object.entries(desired);
 const writes=[];
 for(const [key,after] of entries){
  if(!allowed(key)&&!keysToKeep.includes(key))
   throw Error('Restore would touch a protected non-TEST key.');
  const before=key===TEST?existing.trail:key===FEEL?existing.feel:existing.keys[key]??null;
  if(after!==undefined&&before!==after){
   if(writes.length>=MAX_KEYS)throw Error('Restore exceeds safe changed-key limit.');
   writes.push(Object.freeze({key,before,after}));
  }
 }
 return Object.freeze({valid:true,unchanged:writes.length===0,
  writes:Object.freeze(writes),changes:writes.length,
  summary,liveWordTrailsExcluded:true,
  testCoinsQuarantined:true,requiresActualBackupAndApproval:true});
}
function setExact(k,value){
 if(value===null)localStorage.removeItem(k);else localStorage.setItem(k,value);
 if(read(k)!==value)throw Error('Storage verification failed for '+k+'.');
}
/* Old TEST v2 journals contain BEFORE values only. A browser crash can
 * leave a partial restore, then an unrelated open tab may save NEW progress.
 * Automatically replaying "previous" on reload can permanently destroy that
 * newer wallet, Word Trails or native Story progress. A later page CANNOT
 * know the desired AFTER values of the old interrupted operation; never
 * pretend that this record alone proves an overwrite is safe.
 * The COMMITTED marker only authorizes cleanup of our own journal metadata,
 * not an application-level rollback. */
function recoverPending(){
 const raw=read(JOURNAL),marker=read(COMMITTED);
 if(raw===null)return marker===null?{recovered:false}:
  {recovered:false,error:'An orphaned TEST backup commit marker needs review.',needsManualReview:true};
 const data=getJson(raw);
 if(!data||data.version!==1||!own(data.previous))
  return {recovered:false,error:'Unrecognized unfinished TEST import journal. No saved progress changed.',needsManualReview:true};
 if(marker==='yes')
  // A generic v2 'yes' marker is not tied to any transaction ID or AFTER
  // values. Another old tab can race the marker or wallet. Without a
  // verifiable transaction record even marker cleanup can destroy evidence.
  // Do not automatically remove ANY v2 journal or marker on a later load.
  return {recovered:false,needsManualReview:true,commitMarkerPresent:true,
   error:'A TEST backup commit marker was found, but this older journal cannot verify the finished values. Saved progress was not changed; review the restore before importing again.'};
 return {recovered:false,needsManualReview:true,pending:true,
  error:'An unfinished TEST backup restore was found. Automatic rollback is stopped to protect newer wallet, Story and Word Trails progress. Export a fresh backup and review this restore before importing again.'};
}
/* Only the synchronous writer itself knows its exact BEFORE and AFTER values.
 * If a write throws while THIS call is active, we can attempt a conservative
 * same-call rollback after checking every affected key. Any unexpected value
 * or journal alteration means a newer writer may exist: STOP and retain the
 * journal without modifying even one user key. This cannot prevent an old,
 * non-cooperating tab from writing the same value during the final check. */
function rollbackThisAttempt(changed,previous,desired,journalText){
 try{
  if(read(JOURNAL)!==journalText||read(COMMITTED)!==null)
   return {ok:false,error:'Restore journal or commit marker changed during import.'};
  for(const k of changed){
   const current=read(k);
   if(current!==previous[k]&&current!==desired[k])
    return {ok:false,error:'Newer or unexpected progress detected in '+k+'.'};
  }
  for(const k of changed){
   if(read(k)===previous[k])continue;
   if(read(k)!==desired[k])
    return {ok:false,error:'Concurrent save detected while restoring '+k+'.'};
   setExact(k,previous[k]);
  }
  if(read(JOURNAL)!==journalText)
   return {ok:false,error:'Restore journal changed during recovery.'};
  localStorage.removeItem(JOURNAL);
  if(read(JOURNAL)!==null)
   throw Error('Rollback journal cleanup was not verified.');
  return {ok:true};
 }catch(e){return {ok:false,error:e.message}}
}
function applyBackup(candidate,{reload=true}={}){
 assertNoExternalWriter();
 const c=typeof candidate==='string'?parse(candidate):candidate;
 const plan=dryRun(c);
 if(read(JOURNAL)!==null||read(COMMITTED)!==null)
  throw Error('An earlier import recovery must finish first.');
 const existing=currentSnapshot();
 const desired=protectedNative(c.keys,existing.keys);
 if(c.extensions.wordTrailsNext.state!==null)desired[TEST]=c.extensions.wordTrailsNext.state;
 if(c.extensions.wordTrailsNext.feel!==null)desired[FEEL]=c.extensions.wordTrailsNext.feel;
 const touched=[...new Set([...Object.keys(desired),...keysToKeep])];
 const previous={};
 for(const k of touched)previous[k]=read(k);
 const changed=touched.filter(k=>desired[k]!==undefined&&previous[k]!==desired[k]);
 if(!changed.length)return {ok:true,unchanged:true,plan};
 const journal={version:1,previous,createdAt:new Date().toISOString()};
 const journalText=JSON.stringify(journal);
 try{
  setExact(JOURNAL,journalText);
 }catch(e){throw Error('Not enough safe storage for restore journal. No progress changed: '+e.message);}
 window.__bu388SkipCheckpoint=true;
 try{
  for(const k of changed)setExact(k,desired[k]);
  setExact(COMMITTED,'yes');
 }catch(e){
  // If the commit marker was installed, never rewind a completed import.
  if(read(COMMITTED)==='yes'){
   window.__bu388SkipCheckpoint=false;
   // A racing legacy tab could have written the same generic 'yes' marker.
   // Claim commit success ONLY when OUR journal is still present and every
   // intended user value is byte-for-byte equal to the expected AFTER state.
   // Otherwise fail closed rather than calling an incomplete restore done.
   if(read(JOURNAL)!==journalText||
      changed.some(k=>read(k)!==desired[k]))
    throw Error('TEST import commit marker conflicts with saved progress. Stop and review the unfinished restore; no automatic rollback was attempted.');
   return {ok:true,committed:true,needsCleanup:true,changed:changed.length,plan};
  }
  const result=rollbackThisAttempt(changed,previous,desired,journalText);
  window.__bu388SkipCheckpoint=false;
  if(!result.ok)
   throw Error('TEST import interrupted; automatic rollback was stopped to protect newer saved progress. The journal needs review: '+result.error);
  throw Error('TEST import failed; this attempt was rolled back after checking its saved values: '+e.message);
 }
 // Cleanup is intentionally separate from the completed native-data commit:
 // a metadata failure must NOT cause a completed import to be rolled back.
 try{
  localStorage.removeItem(JOURNAL);
  localStorage.removeItem(COMMITTED);
  if(read(JOURNAL)!==null||read(COMMITTED)!==null)
   throw Error('Backup journal cleanup was not verified.');
 }catch(e){
  window.__bu388SkipCheckpoint=false;
  return {ok:true,committed:true,needsCleanup:true,changed:changed.length,plan};
 }
 if(reload)location.reload();
 return {ok:true,changed:changed.length,plan};
}
function getStatus(){
 let el=document.getElementById('bu-wt-save-status');
 if(el)return el;
 const native=document.getElementById('save-export')?.closest('.save-transfer');
 if(!native)return null;
 el=document.createElement('small');el.id='bu-wt-save-status';el.setAttribute('role','status');
 el.setAttribute('aria-live','polite');el.style.display='block';el.style.marginTop='8px';
 el.textContent='Complete TEST backups also include Word Trails progress. Its TEST coins stay separate from Insight Tokens.';
 native.append(el);return el;
}
function notice(s){const el=getStatus();if(el)el.textContent=s}
/* The startup REVIEW supplements, but cannot replace, v32 cross-document
 * detection. It deliberately never blocks normal play or performs writes.
 * A historical migration marker is evidence of earlier migration data,
 * NOT proof that a legacy tab is presently active. */
function installLegacyTransitionReview(){
 const state=legacyTransitionStatus();
 const old=document.getElementById('bu-wt-legacy-transition-review');
 if(!state.oldMigrationMarkerPresent&&!state.oldImporterCouldRecreateMissingLive){
  if(old)old.remove();
  return;
 }
 if(old)return;
 const status=getStatus();if(!status)return;
 const root=document.createElement('details');
 root.id='bu-wt-legacy-transition-review';
 root.style.cssText='margin:9px 0 3px;padding:9px 11px;border:1px solid rgba(197,157,92,.65);border-radius:10px;box-sizing:border-box;';
 const summary=document.createElement('summary');
 summary.textContent='Review older LIVE Word Trails save behavior';
 summary.style.cssText='cursor:pointer;font-weight:750;';
 root.append(summary);
 const paragraph=(message)=>{
  const el=document.createElement('p');
  el.textContent=message;
  el.style.cssText='margin:9px 0;font-size:.9em;line-height:1.5;';
  root.append(el);
 };
 if(state.oldImporterCouldRecreateMissingLive)
  paragraph('LIVE crossword progress is missing, and saved TEST Word Trails progress has a format the older LIVE importer can read. An older LIVE page could recreate a LIVE crossword save from TEST if opened. This is a possibility, not proof that an old tab is running.');
 if(state.oldMigrationMarkerPresent)
  paragraph('The saved LIVE crossword contains an older automatic TEST-to-LIVE migration marker. It shows past migration data, but cannot tell us when it was written or whether an old tab remains open.');
 paragraph('Before considering a backup import or future LIVE transition, download current TEST progress, check your Downloads, and close any older Bible Unfolded pages. Reopening TEST does not prove old scripts are gone. Do not delete browser data.');
 const downloadCurrent=document.createElement('button');
 downloadCurrent.type='button';
 downloadCurrent.id='bu-wt-legacy-transition-current-backup';
 downloadCurrent.textContent='Download current TEST progress';
 downloadCurrent.style.cssText='display:block;max-width:100%;margin:10px 0;padding:8px 11px;border:1px solid currentColor;border-radius:8px;background:transparent;color:inherit;font:inherit;cursor:pointer;';
 downloadCurrent.addEventListener('click',()=>download());
 root.append(downloadCurrent);
 paragraph('This is a read-only warning, not a migration or recovery tool. It does not block old code, authorize imports, merge progress or change LIVE saves.');
 status.parentNode.append(root);
}
/* Purely informational cross-document storage activity review. No state is
 * persisted or modified; never identify an unrelated LIVE save update as
 * definitively unsafe. The inability to fence older LIVE tabs remains. */
function installConcurrentReview(){
 if(!competingPages.size||document.getElementById('bu-wt-external-page-review'))return;
 const status=getStatus();if(!status)return;
 const root=document.createElement('details');
 root.id='bu-wt-external-page-review';
 root.style.cssText='margin:9px 0 3px;padding:9px 11px;border:1px solid rgba(197,157,92,.65);border-radius:10px;box-sizing:border-box;';
 const summary=document.createElement('summary');
 summary.textContent='Shared progress changed in another open page';
 summary.style.cssText='cursor:pointer;font-weight:750;';
 root.append(summary);
 const para=(message)=>{
  const p=document.createElement('p');
  p.style.cssText='margin:9px 0;font-size:.9em;line-height:1.5;';
  p.textContent=message;root.append(p);
 };
 para('Another open Bible Unfolded page or embedded game frame changed shared saved progress while this TEST page was open. This may be normal gameplay, but importing an older backup could overwrite newer values, so imports are paused for this TEST session.');
 if(migratedLiveElsewhere)
  para('A LIVE Word Trails progress record with the older automatic TEST-to-LIVE migration marker was observed. This does not tell us whether LIVE progress was correct or whether an older script is still running.');
 para('You can download a copy of CURRENT TEST progress. Check Downloads to confirm it was saved. Close other open Bible Unfolded pages, then reopen TEST before reviewing any backup. Reopening cannot guarantee that older cached tabs are gone.');
 const backup=document.createElement('button');
 backup.type='button';backup.id='bu-wt-external-current-backup';
 backup.textContent='Download current TEST progress';
 backup.style.cssText='display:block;max-width:100%;margin:10px 0;padding:8px 11px;border:1px solid currentColor;border-radius:8px;background:transparent;color:inherit;font:inherit;cursor:pointer;';
 backup.addEventListener('click',()=>download());
 root.append(backup);
 para('This warning cannot stop an older non-cooperating tab from writing again. It does not reset, merge or import saved progress.');
 status.parentNode.append(root);
}
/* TEST recovery REVIEW only. A previous-only v2 journal contains no trusted
 * AFTER values, so the player can inspect the situation and request a
 * non-destructive copy of CURRENT progress. There is deliberately NO
 * rewind, clear-journal, accept-import or "fix it" action in this panel.
 * In particular, a current-progress backup may already be partly restored:
 * downloading it is NOT the same as reconstructing an older checkpoint. */
function installRecoveryReview(){
 const state=recoverPending();
 const existing=document.getElementById('bu-wt-recovery-review');
 if(!state.needsManualReview){if(existing)existing.remove();return;}
 const status=getStatus();if(!status||existing)return;
 const root=document.createElement('details');
 root.id='bu-wt-recovery-review';
 root.style.cssText='margin:9px 0 3px;padding:9px 11px;border:1px solid rgba(197,157,92,.65);border-radius:10px;max-width:100%;box-sizing:border-box;';
 const summary=document.createElement('summary');
 summary.textContent='Review an interrupted TEST backup';
 summary.style.cssText='cursor:pointer;font-weight:750;letter-spacing:.01em;';
 root.append(summary);
 const paragraph=(txt)=>{
  const p=document.createElement('p');
  p.textContent=txt;p.style.cssText='margin:9px 0;font-size:.9em;line-height:1.5;';
  root.append(p);
 };
 paragraph('A previous backup restore may not have finished. To avoid replacing newer game progress, this TEST version has stopped automatic recovery and blocked further imports.');
 paragraph('First, save a copy of your CURRENT progress. Important: this file may contain a partly restored game; it cannot recreate the older state before the interruption.');
 const backup=document.createElement('button');
 backup.type='button';
 backup.id='bu-wt-recovery-current-backup';
 backup.textContent='Download current TEST progress';
 backup.style.cssText='display:block;max-width:100%;margin:10px 0;padding:8px 11px;border:1px solid currentColor;border-radius:8px;background:transparent;color:inherit;font:inherit;cursor:pointer;';
 backup.addEventListener('click',()=>{
  // Only creates a backup download request; never imports or edits progress.
  download();
 });
 root.append(backup);
 paragraph('Check your Downloads to make sure the file was saved. Please don\'t clear browser data, delete recovery records, or try another import. Keep a copy of the file for review. Closing other old Bible Unfolded tabs is sensible, but this screen cannot stop already-running older code.');
 paragraph('LIVE and TEST share browser storage. This review cannot guarantee that a second, older tab won\'t change progress.');
 status.parentNode.append(root);
}
function download(){
 try{
  const payload=JSON.stringify(makeBackup(),null,2);
  if(payload.length>MAX_BYTES)throw Error('Backup is over the 2 MB limit.');
  const blob=new Blob([payload],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='Bible_Unfolded_Complete_TEST_Backup_v2.json';
  a.style.display='none';document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1200);
  notice('Complete TEST backup prepared: native progress + Word Trails crossword save. Check Downloads to confirm the file was saved; nothing was restored.');
 }catch(e){notice('Backup failed: '+e.message)}
}
async function acceptFile(nativeHandler,picker,event){
 const file=picker.files?.[0];if(!file)return;
 try{
  // Do not let the original native v1 handler bypass recovery quarantine.
  // A new-format v2 import is blocked by applyBackup too, but the user-facing
  // file picker must reject BOTH formats before any old/new handler runs.
  if(read(JOURNAL)!==null||read(COMMITTED)!==null){
   installRecoveryReview();
   throw Error('An earlier TEST backup needs recovery review. Imports are blocked until that is resolved; first download your CURRENT progress.');
  }
  assertNoExternalWriter();
  if(file.size>MAX_BYTES)throw Error('This backup exceeds 2 MB.');
  const content=await file.text(),value=parse(content);
  if(value?.format==='BibleUnfoldedSave'&&value.version===1){
   // Preserve the original native v1 importer and exactly its safety dialog.
   if(nativeHandler)return nativeHandler.call(picker,event);
   throw Error('Native v1 importer unavailable.');
  }
  const plan=dryRun(value);
  const n=plan.incomingWallet,c=plan.currentWallet;
  const wallet=n?'Imported native wallet: '+n.insightTokens+' Insight Tokens and '+n.points+' Points. ':'';
  const comparison=c?'Current wallet: '+c.insightTokens+' Insight Tokens and '+c.points+' Points. ':'';
  const t=plan.incomingWordTrails;
  const test=t.present?'Imported Word Trails: '+t.completedCount+' completed levels, '+t.coins+' TEST coins. ':'No Word Trails progress in this file. ';
  if(!confirm('Import complete Visual Lab TEST backup? Matching saved progress is replaced. Existing purchased wheel ownership is kept.\n\n'+comparison+wallet+'\n'+test+'\nTEST coins will NOT become real Insight Tokens.\n\nIMPORTANT: TEST and LIVE share a GitHub Pages browser-storage origin. Importing the native wallet here also changes the saved native wallet visible in LIVE on this device.\n\nExport your current backup first if you need to keep it.'))return;
  const result=applyBackup(value);
  if(result.needsCleanup)notice('TEST import data was committed, but its journal needs review. Do not run another import until the recovery status is cleared.');
  else if(result.unchanged)notice('This backup is already present; no balances were changed.');
 }catch(e){window.__bu388SkipCheckpoint=false;notice('Import failed: '+e.message);installRecoveryReview();installConcurrentReview()}
 finally{picker.value='';}
}
let installed=false,attempts=0;
function install(){
 if(installed)return;
 const btn=document.getElementById('save-export'),picker=document.getElementById('save-file');
 if(!btn||!picker||typeof btn.onclick!=='function'||typeof picker.onchange!=='function'){
  if(attempts++<45)setTimeout(install,250);return;
 }
 installed=true;
 const originalImport=picker.onchange;
 // The root's original Settings UI remains the only player-facing save interface.
 btn.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();download()},true);
 picker.onchange=e=>acceptFile(originalImport,picker,e);
 getStatus();
 if(recovered.error)notice('Backup recovery needs review to protect saved progress. No automatic restore was performed. '+recovered.error);
 installRecoveryReview();
 installConcurrentReview();
 installLegacyTransitionReview();
}
const recovered=recoverPending();
if(typeof window.addEventListener==='function')
 window.addEventListener('storage',observeExternalStorage);
if(recovered.error)console.error('Word Trails save rollback:',recovered.error);
else if(recovered.recovered){window.__bu388SkipCheckpoint=true;location.reload();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
else install();
window.BUPlatformSaves=Object.freeze({
 version:'2.0.0-test',keys:Object.freeze({TEST,FEEL,JOURNAL,COMMITTED}),
 makeBackup,dryRun,previewRestoreWrites,applyBackup,validateTrails,recoverPending,
 externalChangeStatus,legacyTransitionStatus,bound:()=>installed
});
})();
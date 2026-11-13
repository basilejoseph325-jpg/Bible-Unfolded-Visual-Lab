/* Bible Unfolded Word Trails · CHECKPOINT UI REHEARSAL ONLY.
 * Uses injected Map-backed FAKE data, never browser persistence APIs.
 * The real game's existing saves, wallets, wheels and Settings are NEVER read.
 * No actual LIVE progress may be migrated or removed from this page.
 */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const required=['scenario','status','summary','completed','unlocked','download','saved',
 'backup-status','approve','decline','transfer','transfer-result','checkpoint-file',
 'file-status','recover-approve','advance','recover','recovery-result'];
if(required.some(id=>!$(id)))throw Error('Checkpoint rehearsal UI incomplete');
for(const key of ['BUWTConsentMigrationCandidateV1','BUWTExclusiveConsentBoundaryV2','BUWTRecoveryCheckpointCandidateV3']){
 if(!window[key]?.createForStorage)throw Error('Missing checkpoint rehearsal dependency '+key);
}
const TEST='bu-visual-lab-wordtrails-next-v1',LIVE='bible-unfolded-word-trails-next-v1';
const originalSample=Object.freeze({
 level:2,unlocked:4,coins:1209,points:473,completed:[0,1,2],sparks:[0],
 claimedSparks:['0:PAUL'],boardBible:[],paidWords:[],paidBonuses:['0|ART'],
 claimedFreeHints:[0],sound:true,
 progress:{level:2,found:['ELI'],bonuses:['LIE'],hinted:['1:0'],combo:2}
});
const nativeSentinels=Object.freeze({
 'bible-unfolded-rewards-v17':JSON.stringify({points:-25,coins:493,purchases:['seawheel'],equippedWheel:'seawheel'}),
 'bible-unfolded-wheel-ownership-v3825-backup':JSON.stringify({version:1,owned:['seawheel']}),
 'bible-unfolded-private-voice-pref-v381':JSON.stringify({mode:'rotating'})
});
let fake=null,api=null,proposed=null,exported=null,imported=false,chosenCheckpoint=null,scenario='ready',writes=[];
const originalNative=JSON.stringify(nativeSentinels);
const output=(id,message,kind='ok')=>{
 const el=$(id);el.hidden=false;el.dataset.kind=kind;el.textContent=message;
};
const say=s=>{$('status').textContent=s};
const resetChecks=()=>{
 $('saved').checked=false;$('saved').disabled=true;
 $('approve').checked=false;$('approve').disabled=true;
 $('recover-approve').checked=false;$('recover-approve').disabled=true;
 $('download').disabled=true;$('transfer').disabled=true;
 $('recover').disabled=true;$('advance').disabled=true;
 $('checkpoint-file').value='';
 $('file-status').textContent='No file selected.';
 $('backup-status').textContent='Preview a valid sample to begin.';
 $('transfer-result').hidden=true;$('recovery-result').hidden=true;
};
function refreshTransfer(){
 $('approve').disabled=!exported||!$('saved').checked||imported;
 if($('approve').disabled)$('approve').checked=false;
 $('transfer').disabled=!(exported&&$('saved').checked&&$('approve').checked&&!imported);
}
function refreshRecovery(){
 const yes=!!(chosenCheckpoint&&imported);
 $('recover-approve').disabled=!yes;
 if(!yes)$('recover-approve').checked=false;
 $('recover').disabled=!yes||!$('recover-approve').checked;
}
function setup(mode){
 scenario=mode;
 const s={
  ...nativeSentinels,
  [TEST]:mode==='invalid'?'{bad sample progress':JSON.stringify(originalSample)
 };
 if(mode==='existing')s[LIVE]=JSON.stringify({level:9,unlocked:10,coins:60,completed:[0,1,2,3]});
 fake=new Map(Object.entries(s));writes=[];
 const store={
  getItem:k=>fake.has(k)?fake.get(k):null,
  setItem:(k,v)=>{writes.push('set:'+k);fake.set(k,String(v))},
  removeItem:k=>{writes.push('remove:'+k);fake.delete(k)}
 };
 api=window.BUWTRecoveryCheckpointCandidateV3.createForStorage(store,navigator.locks);
 proposed=api.preview();exported=null;imported=false;chosenCheckpoint=null;
 resetChecks();
 $('summary').hidden=!proposed.available;
 if(proposed.available){
  $('completed').textContent=String(proposed.completedCount);
  $('unlocked').textContent=String(proposed.unlockedLevels);
  $('download').disabled=false;
  say('There’s crossword progress in this sample. Save a practice checkpoint first, then choose what to do.');
 }else{
  const messages={
   'live-progress-exists':'This example already has LIVE crossword progress. We won’t overwrite it.',
   'invalid-test-progress':'The example TEST save is damaged. A transfer isn’t safe here.',
   'no-test-progress':'This example has no TEST progress to transfer.',
   'checkpoint-validation-failed':'The example checkpoint failed validation.'
  };
  say(messages[proposed.reason]||'This example can’t be transferred safely.');
 }
}
$('scenario').addEventListener('change',e=>setup(e.target.value));
$('download').addEventListener('click',()=>{
 const preview=api.preview();
 if(!preview.available||!proposed?.available||
   preview.checkpoint.sourceRaw!==proposed.checkpoint.sourceRaw){
  output('transfer-result','This sample changed before the checkpoint was made. Start a fresh preview.','blocked');
  $('download').disabled=true;return;
 }
 const raw=api.exportCheckpoint(preview.checkpoint);
 if(!raw){output('transfer-result','Couldn’t prepare a valid sample checkpoint. No progress was moved.','blocked');return}
 exported=raw;
 const blob=new Blob([raw],{type:'application/json'});
 const url=URL.createObjectURL(blob);
 try{
  const anchor=document.createElement('a');
  anchor.href=url;anchor.download='Word_Trails_SAMPLE_Recovery_Checkpoint_v3.json';
  anchor.style.display='none';document.body.append(anchor);anchor.click();anchor.remove();
  $('saved').disabled=false;
  $('backup-status').textContent='A sample checkpoint download was offered. Check your Downloads, then confirm you saved it. This doesn’t verify the file was saved.';
  if(scenario==='changed'){
   const changed={...originalSample,level:3};
   fake.set(TEST,JSON.stringify(changed));
   say('This example now simulates another tab changing TEST progress after the checkpoint was prepared. The transfer should stop safely.');
  }
 }finally{setTimeout(()=>URL.revokeObjectURL(url),1500)}
 refreshTransfer();
});
$('saved').addEventListener('change',refreshTransfer);
$('approve').addEventListener('change',refreshTransfer);
$('decline').addEventListener('click',()=>{
 $('approve').checked=false;
 $('saved').checked=false;refreshTransfer();
 output('transfer-result','No problem! You declined the practice transfer. Nothing was moved.','ok');
});
$('transfer').addEventListener('click',async()=>{
 if(!$('saved').checked||!$('approve').checked||!exported||imported)return;
 $('transfer').disabled=true;$('approve').disabled=true;
 const result=await api.apply({approved:true,backupConfirmed:true,checkpoint:exported});
 if(result.ok){
  imported=true;
  say('The example import is now saved in practice memory. Your real progress is untouched.');
  $('download').disabled=true;
  $('advance').disabled=false;
  output('transfer-result','Practice transfer complete! Your sample crossword progress moved. You can now try a safe recovery below.','ok');
 }else{
  output('transfer-result',result.reason==='test-progress-changed'?
   'The sample TEST progress changed. Transfer blocked to protect it.':
   'The example transfer was blocked: '+result.reason+'. No completed transfer was claimed.','blocked');
  $('approve').disabled=false;
 }
 refreshTransfer();refreshRecovery();
});
$('checkpoint-file').addEventListener('change',async()=>{
 chosenCheckpoint=null;$('recover-approve').checked=false;
 const file=$('checkpoint-file').files?.[0];
 if(!file){$('file-status').textContent='No file selected.';refreshRecovery();return}
 if(file.size>500000){
  $('file-status').textContent='That file is too large for this checkpoint. No recovery was attempted.';
  refreshRecovery();return;
 }
 let text;
 try{text=await file.text()}catch(_){
  $('file-status').textContent='Couldn’t read that file. Nothing changed.';refreshRecovery();return;
 }
 const candidate=api.validateCheckpoint(text);
 if(!candidate){
  $('file-status').textContent='That isn’t a valid Word Trails recovery checkpoint. Nothing changed.';
  refreshRecovery();return;
 }
 // This is a MOCK UI: require the uploaded file to match THIS practice run,
 // not an unrelated real or old saved-progress document.
 const current=exported&&api.validateCheckpoint(exported);
 if(!current||candidate.expectedLiveRaw!==current.expectedLiveRaw||
    candidate.sourceRaw!==current.sourceRaw){
  $('file-status').textContent='This checkpoint doesn’t belong to the current practice example.';
  refreshRecovery();return;
 }
 chosenCheckpoint=candidate;
 $('file-status').textContent='Valid practice checkpoint selected! Recovery will check that the imported sample hasn’t changed.';
 refreshRecovery();
});
$('recover-approve').addEventListener('change',refreshRecovery);
$('advance').addEventListener('click',()=>{
 if(!imported)return;
 const raw=fake.get(LIVE);if(!raw)return;
 const save=JSON.parse(raw),next=save.completed.length;
 if(!save.completed.includes(next))save.completed.push(next);
 save.level=Math.min(29,Math.max(save.level,next));
 fake.set(LIVE,JSON.stringify(save));
 $('advance').disabled=true;
 say('A second tab just finished another example crossword. The recovery must refuse to erase this newer progress.');
});
$('recover').addEventListener('click',async()=>{
 if(!imported||!chosenCheckpoint||!$('recover-approve').checked)return;
 $('recover').disabled=true;$('recover-approve').disabled=true;
 const result=await api.rollback({approved:true,checkpoint:chosenCheckpoint});
 if(result.ok){
  imported=false;
  $('advance').disabled=true;
  $('checkpoint-file').value='';chosenCheckpoint=null;
  $('file-status').textContent='Practice recovery complete. The imported sample was removed. Your original TEST progress remains.';
  output('recovery-result','Safe recovery complete! Only the unchanged imported sample was removed. No other game data was touched.','ok');
 }else if(result.reason==='live-progress-has-changed'){
  output('recovery-result','Recovery stopped! Someone completed more puzzles after the sample transfer. We won’t erase that newer progress.','blocked');
 }else{
  output('recovery-result','Recovery stopped safely: '+result.reason+'. No recovery success was claimed.','blocked');
 }
 refreshTransfer();refreshRecovery();
});
window.__BUWTCheckpointRehearsal=Object.freeze({
 version:'2.0.0-synthetic-only',
 inspect:()=>Object.freeze({
  scenario,ready:true,hasSampleLive:fake.has(LIVE),
  sampleLive:fake.has(LIVE)?JSON.parse(fake.get(LIVE)):null,
  sampleTest:fake.has(TEST)?fake.get(TEST):null,
  nativeUnchanged:JSON.stringify(Object.fromEntries(Object.keys(nativeSentinels).map(k=>[k,fake.get(k)])))===originalNative,
  writes:[...writes],exported,
  imported,hasChosenFile:!!chosenCheckpoint
 })
});
setup($('scenario').value);
document.documentElement.dataset.wtCheckpointRehearsalReady='yes';
})();
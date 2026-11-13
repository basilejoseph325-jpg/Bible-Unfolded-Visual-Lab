/* Word Trails TEST — consent screen REHEARSAL ONLY.
   Synthetic Map-based storage; never refers to real browser localStorage.
   Does not run, apply, or grant consent for an actual LIVE migration. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const TEST='bu-visual-lab-wordtrails-next-v1';
const LIVE='bible-unfolded-word-trails-next-v1';
const REQUIRED=['scenario','status','overview','completed-count','unlocked-count',
 'decline','preview','confirm','acknowledge','cancel','transfer','result'];
if(REQUIRED.some(id=>!$(id)))throw Error('Consent UI fixture is incomplete');
if(!window.BUWTConsentMigrationCandidateV1?.createForStorage)
 throw Error('Safe in-memory migration engine is missing');

const SAMPLE=Object.freeze({
 level:2,unlocked:4,coins:1209,points:473,completed:[0,1,2],sparks:[0],
 claimedSparks:['0:PAUL'],boardBible:[],paidWords:[],paidBonuses:['0|ART'],
 claimedFreeHints:[0],sound:true,
 progress:{level:2,found:['ELI'],bonuses:['LIE'],hinted:['1:0'],combo:2}
});
const nativeKeys=Object.freeze({
 'bible-unfolded-rewards-v17':JSON.stringify({points:-25,coins:493,purchases:['seawheel'],equippedWheel:'seawheel'}),
 'bible-unfolded-wheel-ownership-v3825-backup':JSON.stringify({version:1,owned:['seawheel']}),
 'bible-unfolded-private-voice-pref-v381':JSON.stringify({mode:'rotating'})
});
let mem=null,api=null,previewState=null,writes=[],scenario='ready';

function setup(which){
 scenario=which;
 const values={
  ...nativeKeys,
  [TEST]:which==='invalid'?'{this is not valid saved data':JSON.stringify(SAMPLE)
 };
 if(which==='existing')values[LIVE]=JSON.stringify({level:7,coins:60,completed:[0,1,2,3]});
 mem=new Map(Object.entries(values));
 writes=[];
 const fakeStorage={
  getItem:key=>mem.has(key)?mem.get(key):null,
  setItem:(key,value)=>{writes.push(key);mem.set(key,String(value))},
  removeItem:key=>{writes.push(key);mem.delete(key)}
 };
 api=window.BUWTConsentMigrationCandidateV1.createForStorage(fakeStorage);
 previewState=null;
 $('confirm').hidden=true;$('result').hidden=true;
 $('acknowledge').checked=false;$('transfer').disabled=true;
 const proposed=api.preview();
 $('preview').disabled=!proposed.available;
 $('overview').hidden=!proposed.available;
 if(proposed.available){
  $('completed-count').textContent=String(proposed.completedCount);
  $('unlocked-count').textContent=String(proposed.unlockedLevels);
  $('status').textContent='This example has saved crossword progress. You can preview it, then accept or decline the practice transfer.';
 }else{
  const copy={
   'live-progress-exists':'This example already has LIVE crossword progress. We would protect that save and stop the transfer.',
   'invalid-test-progress':'This example has damaged TEST progress. The transfer is blocked until the save can be checked.',
   'no-test-progress':'No TEST crossword progress was found. There is nothing to move.',
   'storage-unavailable':'Saved data could not be checked. The transfer would stop safely.'
  };
  $('status').textContent=copy[proposed.reason]||'The transfer is not available for this example.';
 }
}

function say(message,kind){
 const e=$('result');e.hidden=false;e.dataset.kind=kind;e.textContent=message;
}
$('scenario').addEventListener('change',event=>setup(event.target.value));
$('decline').addEventListener('click',()=>{
 $('confirm').hidden=true;$('acknowledge').checked=false;$('transfer').disabled=true;
 say('Not a problem! No sample progress was transferred. Your real game was never involved.','ok');
});
$('preview').addEventListener('click',()=>{
 const p=api.preview();
 if(!p.available){setup(scenario);return}
 previewState=p;$('result').hidden=true;$('confirm').hidden=false;
 $('acknowledge').checked=false;$('transfer').disabled=true;
 if(scenario==='changed'){
  const edited={...SAMPLE,level:3};
  mem.set(TEST,JSON.stringify(edited));
  $('status').textContent='For this example, another tab changes the sample save after preview. The transfer should safely refuse it.';
 }
 $('acknowledge').focus();
});
$('cancel').addEventListener('click',()=>{
 $('confirm').hidden=true;$('acknowledge').checked=false;$('transfer').disabled=true;
 say('You chose not to continue. No progress was transferred.','ok');
});
$('acknowledge').addEventListener('change',()=>{
 $('transfer').disabled=!$('acknowledge').checked||!previewState;
});
$('transfer').addEventListener('click',()=>{
 if(!previewState||!$('acknowledge').checked)return;
 const answer=api.acceptExplicitly({approved:true,sourceRaw:previewState.sourceRaw});
 $('confirm').hidden=true;
 $('acknowledge').checked=false;$('transfer').disabled=true;
 if(answer.ok){
  say('Practice transfer complete! The sample now includes '+answer.completedCount+
      ' completed puzzles. We did not change your real Bible Unfolded saves, coins, wheels, or settings.','ok');
  $('preview').disabled=true;
  $('status').textContent='The practice LIVE progress is now present. A second transfer would be stopped to protect it.';
 }else{
  const copy={
   'test-progress-changed':'Good catch! Sample progress changed since the preview. Nothing was imported.',
   'live-progress-exists':'This sample already has LIVE crossword progress. We will not overwrite it.',
   'invalid-test-progress':'The sample data was invalid. Nothing was imported.',
   'save-failed':'The sample could not be saved. No successful transfer was claimed.',
   'consent-required':'Consent was missing, so no transfer happened.'
  };
  say(copy[answer.reason]||'The practice transfer was blocked to protect existing progress.','blocked');
  $('preview').disabled=!api.preview().available;
 }
 previewState=null;
});
window.__BUWTProgressTransferDemo=Object.freeze({
 version:'1.0.0-in-memory-rehearsal',
 inspect:()=>Object.freeze({scenario,writes:[...writes],
  hasSampleLiveProgress:mem.has(LIVE),
  sampleLiveSave:mem.has(LIVE)?JSON.parse(mem.get(LIVE)):null,
  sampleWallet:JSON.parse(mem.get('bible-unfolded-rewards-v17')),
  sampleOwned:JSON.parse(mem.get('bible-unfolded-wheel-ownership-v3825-backup')),
  ready:true})
});
setup($('scenario').value);
document.documentElement.dataset.wtRehearsalReady='yes';
})();
#!/usr/bin/env node
'use strict';
/* Source-level v2 TEST/LIVE backup-and-rollback compatibility audit.
 * Both REAL coordinator JS files run in a Node VM with FAKE localStorage.
 * The LIVE JS is fetched from a PINNED, protected LIVE commit. It is never
 * changed or run against a user's actual browser/account/game.
 */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const testJs=fs.readFileSync('bu-platform-saves-v2.js','utf8');
const livePath=process.argv[2];
assert(livePath,'Usage: node qa_word_trails_backup_v2_crossformat_and_recovery.cjs /tmp/pinned-live-save-coordinator.js');
const liveJs=fs.readFileSync(livePath,'utf8');
const PINNED_LIVE_BLOB='ae775f68524dd946866708e0d450c0f45f1bd77f';
const b=Buffer.from(liveJs,'utf8');
const blob=crypto.createHash('sha1').update('blob '+b.byteLength+'\0').update(b).digest('hex');
assert.equal(blob,PINNED_LIVE_BLOB,'Protected LIVE v2 save coordinator drifted: stop rather than test unknown code');
const T='bu-visual-lab-wordtrails-next-v1';
const L='bible-unfolded-word-trails-next-v1';
const W='bible-unfolded-rewards-v17';
const WB='bible-unfolded-rewards-v17-recovery-v3811';
const OWN='bible-unfolded-wheel-ownership-v3825';
const OWN_B='bible-unfolded-wheel-ownership-v3825-backup';
const FEEL='bu-wt-next-feel-v2';
const VOICE='bible-unfolded-private-voice-pref-v381';
const ck=(v)=>JSON.stringify(v);
const trail=(coins=55)=>({
 level:2,unlocked:4,coins,points:15,completed:[0,1],sparks:[0],claimedSparks:['0:ABEL'],
 boardBible:[],paidWords:[],paidBonuses:['0|ART'],claimedFreeHints:[0],sound:true,
 progress:{level:2,found:['ELI'],bonuses:[],hinted:[],combo:1}
});
const nativeWallet=(coins,owned=['seawheel'])=>({
 coins,points:-15,purchases:owned,equippedWheel:owned[0]||'classic',earned:[],spent:[],streak:1
});
const baseline={
 [W]:ck(nativeWallet(750)),[WB]:ck(nativeWallet(750)),
 [OWN]:ck({version:1,owned:['seawheel']}),[OWN_B]:ck({version:1,owned:['seawheel']}),
 [VOICE]:ck({mode:'off',volume:45}),
 'story-trails-synthetic-chapter':ck({chapter:4,complete:[1,2]})
};
function factory(which,options={}){
 const saveKey=which==='TEST'?T:L;
 const data=new Map(Object.entries({...baseline,
  [saveKey]:ck(trail(which==='TEST'?975:75)),
  [FEEL]:ck({music:true,sfx:true,musicVolume:75,sfxVolume:65,motion:true,haptics:true}),
  ...options.initial
 }));
 const events=[],targetFail=options.failOnceOnSet;
 let failed=false,reloads=0;
 const storage={
  get length(){return data.size},
  key:i=>Array.from(data.keys())[i]??null,
  getItem:k=>data.has(k)?data.get(k):null,
  setItem:(k,v)=>{
   if(k===targetFail&&!failed){failed=true;throw Error('simulated disk quota on '+k)}
   data.set(k,String(v));events.push('set:'+k)
  },
  removeItem:k=>{data.delete(k);events.push('remove:'+k)}
 };
 const window={},document={readyState:'loading',addEventListener:()=>{},getElementById:()=>null};
 const context=vm.createContext({localStorage:storage,window,document,
  location:{reload:()=>{reloads++}},setTimeout:()=>0,console});
 vm.runInContext(which==='TEST'?testJs:liveJs,context,{timeout:5000});
 const api=window.BUPlatformSaves;
 assert(api,'Coordinator did not expose v2 API for '+which);
 assert.equal(api.keys.TEST,saveKey,'Coordinator must retain correct progress key '+which);
 return {which,data,events,storage,api,window,context,get reloads(){return reloads}};
}
let total=0;
function expectInvalid(fn,reason){
 assert.throws(fn,undefined,reason);total++;
}
for(const kind of ['TEST','LIVE']){
 const a=factory(kind),other=kind==='TEST'?L:T;
 assert.equal(a.api.keys.TEST,kind==='TEST'?T:L);
 const before=[...a.data].map(([k,v])=>k+'='+v).join('\n');
 const save=a.api.makeBackup();
 assert.equal(save.format,'BibleUnfoldedSave');
 assert.equal(save.version,2);
 assert.equal(save.extensions.wordTrailsNext.format,kind==='TEST'?'WordTrailsNextTEST':'WordTrailsNextLIVE');
 assert.equal(save.keys[a.api.keys.TEST],undefined,'Crossword save must be separately owned, not native wallet key');
 assert.equal(save.extensions.wordTrailsNext.state,a.data.get(a.api.keys.TEST));
 assert.equal(save.keys[W],a.data.get(W));
 assert.equal(save.keys[OWN],a.data.get(OWN));
 assert(!save.keys[other],'Other repo Word Trails key must not appear in native inventory');
 assert.equal(save.extensions.wordTrailsNext.coinsNeverConvertToInsightTokens,true);
 assert.equal(a.api.dryRun(save).valid,true);
 assert.equal(a.api.dryRun(save).incomingWordTrails.completedCount,2);
 assert.equal(a.api.dryRun(save).incomingWallet.insightTokens,750);
 assert.equal([...a.data].map(([k,v])=>k+'='+v).join('\n'),before,'Read-only backup must not mutate synthetic storage');
 assert.equal(a.events.length,0);
 total++;
}
const t=factory('TEST'),l=factory('LIVE');
const tb=t.api.makeBackup(),lb=l.api.makeBackup();
expectInvalid(()=>l.api.dryRun(tb),'Never treat a complete TEST backup as a LIVE backup');
expectInvalid(()=>t.api.dryRun(lb),'Never treat complete LIVE backup as a TEST backup');
assert.notEqual(tb.extensions.wordTrailsNext.format,lb.extensions.wordTrailsNext.format);
const contamination=JSON.parse(JSON.stringify(lb));
contamination.keys[T]=ck(trail(99000));
expectInvalid(()=>l.api.dryRun(contamination),'Never pass TEST crossword state through LIVE native keys');
const invalidWallet=JSON.parse(JSON.stringify(tb));
invalidWallet.keys[W]=ck({...nativeWallet(750),coins:-40});
expectInvalid(()=>t.api.dryRun(invalidWallet),'Native wallet cannot have negative Insight Tokens');
const invalidLevel=JSON.parse(JSON.stringify(lb));
invalidLevel.extensions.wordTrailsNext.state=ck({...trail(75),level:900});
expectInvalid(()=>l.api.dryRun(invalidLevel),'Out-of-range LIVE level must be rejected');

// Native wallet restore is a user-approved complete backup operation, NOT
// a TEST->LIVE migration. Permanent purchased ownership is unioned, and
// distinct crossword currency is NEVER credited to native Insight Tokens.
const backupTarget=factory('TEST');
const incoming=JSON.parse(JSON.stringify(backupTarget.api.makeBackup()));
const incomingWallet=ck(nativeWallet(123,['goldwheel']));
incoming.keys[W]=incomingWallet;incoming.keys[WB]=incomingWallet;
incoming.keys[OWN]=ck({version:1,owned:['goldwheel']});
incoming.keys[OWN_B]=ck({version:1,owned:['goldwheel']});
incoming.extensions.wordTrailsNext.state=ck(trail(9999));
const restored=backupTarget.api.applyBackup(incoming,{reload:false});
assert.equal(restored.ok,true);
assert.equal(JSON.parse(backupTarget.data.get(W)).coins,123,'Full restore uses chosen native wallet; not TEST coins');
assert.equal(JSON.parse(backupTarget.data.get(T)).coins,9999);
const owned=JSON.parse(backupTarget.data.get(OWN)).owned;
assert(owned.includes('seawheel')&&owned.includes('goldwheel'),'Existing paid wheels must survive a complete restore');
const buying=JSON.parse(backupTarget.data.get(W)).purchases;
assert(buying.includes('seawheel')&&buying.includes('goldwheel'));
assert.equal(backupTarget.data.get(VOICE),baseline[VOICE]);
assert.equal(backupTarget.api.keys.JOURNAL in Object.fromEntries(backupTarget.data),false);
assert(!backupTarget.data.has(backupTarget.api.keys.JOURNAL));
total++;

// Same native restore is idempotent, and does not re-award currency.
const again=backupTarget.api.applyBackup(incoming,{reload:false});
assert.equal(again.ok,true);
assert.equal(again.unchanged,true);
assert.equal(JSON.parse(backupTarget.data.get(W)).coins,123);
total++;

// A failed write after journaling must rewind EVERY touched key.
const failing=factory('LIVE',{failOnceOnSet:W});
const beforeAll=new Map(failing.data);
const changed=JSON.parse(JSON.stringify(failing.api.makeBackup()));
changed.keys[W]=ck(nativeWallet(45,['goldwheel']));
changed.keys[WB]=changed.keys[W];
changed.extensions.wordTrailsNext.state=ck(trail(1999));
assert.throws(()=>failing.api.applyBackup(changed,{reload:false}),/rolled back/);
for(const [key,val] of beforeAll)assert.equal(failing.data.get(key),val,'Rollback changed existing value '+key);
assert.equal(failing.data.has(failing.api.keys.JOURNAL),false);
assert.equal(failing.data.has(failing.api.keys.COMMITTED),false);
total++;

// Crash-recovery test in a fake tab: inject a realistic journal, partially
// overwrite 2 keys, and verify the coordinator's own recovery restores them.
const interrupted=factory('TEST');
const priorWallet=interrupted.data.get(W),priorTrail=interrupted.data.get(T);
interrupted.data.set(interrupted.api.keys.JOURNAL,ck({
 version:1,previous:{[W]:priorWallet,[T]:priorTrail},createdAt:'2026-11-13T10:00:00Z'
}));
interrupted.data.set(W,ck(nativeWallet(14,['goldwheel'])));
interrupted.data.set(T,ck(trail(999999)));
const undone=interrupted.api.recoverPending();
assert.equal(undone.recovered,true);
assert.equal(interrupted.data.get(W),priorWallet);
assert.equal(interrupted.data.get(T),priorTrail);
assert.equal(interrupted.data.has(interrupted.api.keys.JOURNAL),false);
total++;

console.log('PASS_WORD_TRAILS_V2_BACKUP_CROSSFORMAT '+total+' audit cases, pinned LIVE gitBlob='+blob+
 ': complete TEST/LIVE backups remain distinct and reject direct cross-import, wheel entitlements preserved, native and crossword coins separate, synthetic rollback and crash recovery verified.');
console.log('RELEASE_BLOCKERS: v2 full backups are not portable between repo formats; broad native restore changes shared-origin wallet by design and needs user consent. Legacy LIVE auto-migration and v2 coordinator have NO cooperative Web Lock. Do not publish direct TEST->LIVE full-backup imports.');

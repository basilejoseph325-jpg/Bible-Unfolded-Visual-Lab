#!/usr/bin/env node
'use strict';
// Build a FROZEN, UNAPPLIED two-file LIVE safety hotfix using pinned LIVE sources.
// All assertions use synthetic data. Original game, LIVE and user saves unchanged.
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),vm=require('vm'),crypto=require('crypto');
const [htmlPath,jsPath,out]=process.argv.slice(2);
assert(htmlPath&&jsPath&&out,'Expected PINNED_HTML PINNED_JS OUTPUT_DIR');
const html=fs.readFileSync(htmlPath,'utf8'),js=fs.readFileSync(jsPath,'utf8');
const sha=s=>{const b=Buffer.from(s);return crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex')};
assert.equal(sha(html),'3ad4ba766ccf986a575ea24a2eb6b1dd758cb104','Pinned LIVE HTML changed');
assert.equal(sha(js),'52d0a564a16a964daf70e156e46e7d7866480c81','Pinned LIVE importer changed');
const tag='<script src="word-trails-live-migration-v1.js?v=live-progress-only-20261109" defer></script>\n';
assert.equal(html.split(tag).length,2,'Exactly one old LIVE importer script tag expected');
const newHtml=html.replace(tag,'');
assert.equal(newHtml.replace('<script src="word-trails-next-v1.js?v=live-progress-20261109-r1" defer></script>',tag+'<script src="word-trails-next-v1.js?v=live-progress-20261109-r1" defer></script>'),html,'No other live HTML edits permitted');
assert(!newHtml.includes('word-trails-live-migration-v1.js'),'Fresh HTML must not autoimport');
assert(!newHtml.includes('word-trails-live-migration-consent-gate-v4.js'),'No new LIVE import handler in stage 1');
const shim=[
'/* Bible Unfolded Word Trails LIVE — retire old auto-import without touching any saves.',
' * Do NOT read, write, convert, delete, or migrate game state on script load.',
' * New consent-based transfer requires a separate approved backup/release.',
' * Already cached/loaded old JavaScript remains a release limitation.',
' */',
"(()=>{'use strict';",
'window.BUWTLegacyAutoImportRetiredV6=Object.freeze({',
" version:'6.0.0',disabled:true,automaticImport:false,",
" reason:'Silent TEST-to-LIVE progress transfer retired'",
'});',
'})();',
''
].join('\n');
new vm.Script(shim);
const T='bu-visual-lab-wordtrails-next-v1',L='bible-unfolded-word-trails-next-v1';
const W='bible-unfolded-rewards-v17',O='bible-unfolded-wheel-ownership-v3825-backup',V='bible-unfolded-private-voice-pref-v381';
const source={level:2,unlocked:5,coins:9999,points:500,completed:[0,1,2],sparks:[0],claimedSparks:['0:ABEL'],boardBible:[],paidWords:[],paidBonuses:['0|ART'],claimedFreeHints:[0],sound:true,progress:{level:2,found:['ELI'],bonuses:[],hinted:[],combo:1}};
const protectedData={[W]:JSON.stringify({coins:741,points:38,purchases:['seawheel']}),[O]:JSON.stringify({owned:['seawheel']}),[V]:JSON.stringify({mode:'rotate',volume:60})};
function run(script,seed={}){
 const map=new Map(Object.entries({...protectedData,...seed})),reads=[],writes=[],window={};
 const storage={getItem:k=>{reads.push(k);return map.has(k)?map.get(k):null},setItem:(k,v)=>{writes.push('set:'+k);map.set(k,String(v))},removeItem:k=>{writes.push('remove:'+k);map.delete(k)}};
 vm.runInNewContext(script,{window,localStorage:storage},{timeout:2000});
 return {map,writes,reads,window};
}
let count=0;
function pass(s){count++;console.log('PASS_STAGE1_V6_'+count+' '+s)}
{
 const old=run(js,{[T]:JSON.stringify(source)}),safe=run(shim,{[T]:JSON.stringify(source)});
 assert.deepEqual(old.writes,['set:'+L]);assert.equal(JSON.parse(old.map.get(L)).migration.version,1);
 assert.deepEqual(safe.writes,[]);assert.deepEqual(safe.reads,[]);
 assert.equal(safe.map.get(L),undefined);pass('exact old silent import reproduced, replacement inert');
}
{
 const cachedHtml=run(shim,{[T]:JSON.stringify(source)});
 assert.equal(cachedHtml.window.BUWTLegacyAutoImportRetiredV6.automaticImport,false);
 assert.deepEqual(cachedHtml.reads,[]);assert.deepEqual(cachedHtml.writes,[]);
 pass('old cached HTML that FETCHES replaced old JS URL stays inert');
}
{
 const existing='{"level":18,"unlocked":20,"completed":[0,1,2,3]}';
 const old=run(js,{[T]:JSON.stringify(source),[L]:existing}),safe=run(shim,{[T]:JSON.stringify(source),[L]:existing});
 for(const x of [old,safe]){assert.equal(x.map.get(L),existing);assert.deepEqual(x.writes,[]);
 for(const [key,value] of Object.entries(protectedData))assert.equal(x.map.get(key),value)}
 pass('existing LIVE Word Trails and native wallet/wheels/voice unchanged');
}
for(const [name,seed] of [['absent TEST',{}],['invalid TEST',{[T]:'{bad'}],['untrusted TEST',{[T]:JSON.stringify({...source,completed:['<bad>']})}]]){
 const x=run(shim,seed);assert.deepEqual(x.reads,[]);assert.deepEqual(x.writes,[]);pass(name+' no-op');
}
{
 const stale=run(js,{[T]:JSON.stringify(source)});
 assert.equal(stale.writes[0],'set:'+L);
 pass('CACHED OLD JS STILL UNSAFE — do not claim preloaded tab protection');
}
const dest=path.join(out,'experiments');
fs.mkdirSync(dest,{recursive:true});
fs.writeFileSync(path.join(dest,'word-trails-next-v1.html'),newHtml);
fs.writeFileSync(path.join(dest,'word-trails-live-migration-v1.js'),shim);
assert.deepEqual(fs.readdirSync(dest).sort(),['word-trails-live-migration-v1.js','word-trails-next-v1.html']);
console.log('TWO_FILE_CUTOVER_UNAPPLIED',JSON.stringify({
 oldLiveCommit:'74a96491770ab6aa7229889ce1aa4733e06666d8',
 oldBlobHtml:sha(html),oldBlobJs:sha(js),newBlobHtml:sha(newHtml),newBlobJs:sha(shim),
 outputs:fs.readdirSync(dest),changes:'Only remove old HTML script tag and replace old JS URL with inert shim',
 userProgressTouched:false,liveModified:false,oldCachedScriptsStillUnsafe:true,
 futureReleaseOwnerApprovalRequired:true
}));
pass('two-file selective source patch generated without edits to LIVE');
console.log('PASS_STAGE1_V6 '+count+' checks; old loaded JS cannot be retroactively disabled.');

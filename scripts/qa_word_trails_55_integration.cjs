#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),cp=require('node:child_process'),crypto=require('node:crypto'),vm=require('node:vm'),assert=require('node:assert/strict');
const BASE='624fff4d11ab02dea673a20b67be94ab8915fa75',CONTENT='cf20a7c03bf8ba5be5255a6a2317a2d746eee7b7';
const allowed=new Set([
 'experiments/word-trails-next-v1.js','experiments/word-trails-next-v1.html','experiments/bu-test-shared-backup-v2.js','experiments/word-trails-daily-v1.html',
 'index.html','bible-book-guides/index.html','bible-book-guides/read.html','journey-progress-caption.js','visual-lab-test-banner.js','word-trails-native-shell-v1.js','word-trails-next-launcher.js',
 'experiments/word-trails-levels-51-55-v1.js','experiments/word-trails-levels-51-55-metadata-v1.json','scripts/fixtures/word-trails-51-55-sources.json','docs/WORD_TRAILS_LEVELS_51_55_INTEGRATION_REVIEW.md','docs/WORD_TRAILS_55_TEST_INTEGRATION.md',
 'scripts/qa_word_trails_levels_51_55.cjs','scripts/qa_word_trails_levels_51_55_browser.cjs','scripts/qa_word_trails_55_integration.cjs','scripts/qa_word_trails_55_browser.cjs','scripts/qa_shared_test_backup_v2.cjs','scripts/qa_test_insight_native_bridge_v2.cjs',
 'scripts/word_trails_save_v2_browser_test.cjs','scripts/qa_word_trails_next_seal_progress_v1.cjs','scripts/qa_standard_test_shared_wallet_browser_v1.cjs','scripts/qa_shared_wallet_family_relay_browser_v1.cjs','scripts/qa_word_trails_all30_webkit_viewport_v12.cjs',
 '.github/workflows/qa-genesis13-test-integration.yml','.github/workflows/qa-genesis14-public-test.yml','.github/workflows/qa-word-trails-next-v1.yml','.github/workflows/qa-word-trails-30-voice.yml','.github/workflows/qa-word-trails-55-integration.yml'
]);
const blob=b=>crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
let protectedFiles=0;
for(const line of cp.execFileSync('git',['ls-tree','-r',BASE],{encoding:'utf8'}).trim().split('\n')){const[m,p]=line.split('\t'),sha=m.split(' ')[2];if(allowed.has(p))continue;assert(fs.existsSync(p),'Protected file missing: '+p);assert.equal(blob(fs.readFileSync(p)),sha,'Unrelated main file changed: '+p);protectedFiles++;}
for(const p of [...cp.execFileSync('git',['diff','--name-only',BASE],{encoding:'utf8'}).trim().split('\n'),...cp.execFileSync('git',['ls-files','--others','--exclude-standard'],{encoding:'utf8'}).trim().split('\n')].filter(Boolean))assert(allowed.has(p),'Outside integration scope: '+p);
for(const p of ['experiments/word-trails-levels-51-55-v1.js','experiments/word-trails-levels-51-55-metadata-v1.json','scripts/fixtures/word-trails-51-55-sources.json'])assert.equal(blob(fs.readFileSync(p)),cp.execFileSync('git',['rev-parse',CONTENT+':'+p],{encoding:'utf8'}).trim(),'Reviewed content changed: '+p);
const source=fs.readFileSync('experiments/word-trails-next-v1.js','utf8'),old=cp.execFileSync('git',['show',BASE+':experiments/word-trails-next-v1.js'],{encoding:'utf8'});
const first=s=>s.slice(s.indexOf('const LEVELS=['),s.indexOf('// Verified extension:'));
assert.equal(first(source),first(old),'Original Levels 1–11 changed');
const packs={window:{}};for(const range of ['12-30','31-35','36-40','41-45','46-50','51-55'])vm.runInNewContext(fs.readFileSync('experiments/word-trails-levels-'+range+'-v1.js','utf8'),packs);
const materialize=s=>vm.runInNewContext('(()=>{'+s.slice(s.indexOf('const LEVELS=['),s.indexOf('// Verified extension:'))+'return {LEVELS,EXTRA_SPARKS};})()');
const baseline=materialize(old),initial=materialize(source);assert.equal(JSON.stringify(initial),JSON.stringify(baseline));assert.equal(initial.LEVELS.length+Object.values(packs.window).flat().length,55);
const meta=JSON.parse(fs.readFileSync('experiments/word-trails-levels-51-55-metadata-v1.json'));
const seals=vm.runInNewContext(source.slice(source.indexOf('const MILESTONE_SEALS='),source.indexOf('// The native host owns'))+';({MILESTONE_SEALS,MAP_CHAPTERS})');
const oldSeals=vm.runInNewContext(old.slice(old.indexOf('const MILESTONE_SEALS='),old.indexOf('// The native host owns'))+';({MILESTONE_SEALS,MAP_CHAPTERS})');
for(let n=5;n<=50;n+=5)assert.equal(JSON.stringify(seals.MILESTONE_SEALS[n]),JSON.stringify(oldSeals.MILESTONE_SEALS[n]));assert.equal(JSON.stringify(seals.MAP_CHAPTERS.slice(0,10)),JSON.stringify(oldSeals.MAP_CHAPTERS));assert.equal(JSON.stringify(seals.MILESTONE_SEALS[55]),JSON.stringify(meta.journeySeals[55]));assert.equal(seals.MAP_CHAPTERS[10],meta.mapChapter.title);
const html=fs.readFileSync('experiments/word-trails-next-v1.html','utf8');assert(html.indexOf('word-trails-levels-51-55-v1.js')<html.indexOf('src="word-trails-next-v1.js'));
assert(source.indexOf('if(Array.isArray(window.BUWTLevels51to55))')<source.indexOf('const BIBLE_SPARKS='));assert(!/All ten Journey|Your 50-level/.test(source));
const window={};vm.runInNewContext(fs.readFileSync('experiments/bu-test-word-trails-economy-v1.js','utf8'),{window});for(let n=51;n<=55;n++)assert.equal(window.BUTestWordTrailsEconomy.transaction({type:'level',level:n}).delta,4);assert.equal(window.BUTestWordTrailsEconomy.transaction({type:'level',level:56}),null);
for(const p of ['index.html','bible-book-guides/index.html','bible-book-guides/read.html','experiments/word-trails-next-v1.html','experiments/word-trails-daily-v1.html'])assert(fs.readFileSync(p,'utf8').includes('bu-test-shared-backup-v2.js?v=wordtrails55-v1'),'Stale validator cache URL: '+p);
require('./qa_word_trails_levels_51_55.cjs').validatePack({integrated:true});
console.log('PASS_55_INTEGRATION_BOUNDARIES',JSON.stringify({base:BASE,content:CONTENT,protectedFiles,legacyLevelsUnchanged:50,registeredTotal:55,seals:11,chapter11:meta.mapChapter.title,sharedPolicyUnchanged:true,recoveryScopeUnchanged:true}));

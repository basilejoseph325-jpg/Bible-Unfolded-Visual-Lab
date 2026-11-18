#!/usr/bin/env node
'use strict';
// Derive record keys from actual historical writers, then export with the real
// pre-PR V2 coordinator and restore with the 55-level one. No owner's data used.
const fs=require('node:fs'),cp=require('node:child_process'),vm=require('node:vm'),assert=require('node:assert/strict'),{webcrypto}=require('node:crypto');
const BASE='624fff4d11ab02dea673a20b67be94ab8915fa75',FILE='experiments/word-trails-next-v1.js';
const git=(...args)=>cp.execFileSync('git',args,{encoding:'utf8',maxBuffer:10e6});
function balanced(s,start,open,close){let depth=0,quote='',escape=false;for(let i=start;i<s.length;i++){const c=s[i];if(quote){if(escape)escape=false;else if(c==='\\')escape=true;else if(c===quote)quote='';continue}if("'\"`".includes(c)){quote=c;continue}if(c===open)depth++;if(c===close&&!--depth)return s.slice(start,i+1)}throw Error('Unbalanced historical source');}
function api(source){const window={};new Function('window','crypto','TextEncoder',source)(window,webcrypto,TextEncoder);return window.BUSharedTestBackup;}
const oldAPI=api(git('show',BASE+':experiments/bu-test-shared-backup-v2.js')),current=api(fs.readFileSync('experiments/bu-test-shared-backup-v2.js','utf8'));
const {wallet:W,recovery:R,trails:T}=current.keys;
function keys(t){const w=JSON.stringify({coins:533,points:-40,earned:['old-award'],spent:[],purchases:['goldwheel'],hints:{}});return {[W]:w,[R]:w,[T]:JSON.stringify(t),'bible-unfolded-wheel-ownership-v3825':'{"version":1,"owned":["goldwheel"]}','bible-unfolded-wheel-ownership-v3825-backup':'{"version":1,"owned":["goldwheel"]}','bu-legacy-preserved':'byte-identical'};}
function memory(initial){const map=new Map(Object.entries(initial));return {map,list:()=>[...map.keys()],get:k=>map.get(k)??null,set:(k,v)=>map.set(k,v),remove:k=>map.delete(k),writable:()=>true,ownsLock:()=>true,pause:()=>{}};}
function make(source,level,index){const begin=source.indexOf('function wordPaid('),brace=source.indexOf('{',begin),writer=source.slice(begin,brace)+balanced(source,brace,'{','}');const t={level:index,unlocked:index,coins:111,points:42,completed:[index],sparks:[index],paidWords:[],paidBonuses:[],claimedFreeHints:[index],sound:false,progress:{level:index,found:[level.words[0][0]],bonuses:[],hinted:[level.words[0][1]+':'+level.words[0][2]],combo:3}};
 new Function('save','index',writer+';'+level.words.map(([w])=>'wordPaid('+JSON.stringify(w)+');').join(''))(t,index);
 const combo=/const comboTag=([^;]+);/.exec(source);if(combo)t.paidWords.push(new Function('index','return '+combo[1])(index));
 const bonus=String(level.bonus||'').split(/\s+/).find(w=>/^[A-Z]{3,12}$/.test(w));if(bonus){assert(source.includes("const key=index+'|'+word"),'Unreviewed historical bonus-key writer');t.paidBonuses.push(new Function('index','word',"return index+'|'+word")(index,bonus));t.progress.bonuses.push(bonus)}
 const satchel=/const vaultKey=([^;]+);/.exec(source);if(satchel)t.paidBonuses.push(new Function('index','return '+satchel[1])(index));
 if(source.includes('claimedSparks:[]')){const pos=source.indexOf('function sparkKey('),brace=source.indexOf('{',pos),fn=source.slice(pos,brace)+balanced(source,brace,'{','}');t.claimedSparks=[new Function(fn+';return sparkKey('+index+','+JSON.stringify(level.spark)+')')()];}
 if(source.includes('boardBible:[]'))t.boardBible=(level.bibleBoard||[]).map(x=>index+':'+x.word);
 return t;
}
(async()=>{let count=0;const revisions=git('rev-list',BASE,'--',FILE).trim().split('\n'),latest=git('show',BASE+':'+FILE);const levelsOf=s=>{const p=s.indexOf('const LEVELS=[')+'const LEVELS='.length;return JSON.parse(JSON.stringify(vm.runInNewContext('('+balanced(s,p,'[',']')+')')))};
 const cases=[];for(const rev of revisions){const s=git('show',rev+':'+FILE),levels=levelsOf(s);cases.push({name:rev.slice(0,7),state:make(s,levels[0],0)});}
 const all=levelsOf(latest),scope={window:{}};for(const range of ['12-30','31-35','36-40','41-45','46-50']){vm.runInNewContext(git('show',BASE+':experiments/word-trails-levels-'+range+'-v1.js'),scope);const value=range==='12-30'?scope.window.BUWTAdditionalLevels:scope.window['BUWTLevels'+range.replace('-','to')];all.push(...JSON.parse(JSON.stringify(value)));}assert.equal(all.length,50);all.forEach((level,index)=>cases.push({name:'base-level-'+(index+1),state:make(latest,level,index)}));
 // Exact local legacy save fixture, including its pre-board-discovery variant.
 const fixtureSource=git('show',BASE+':scripts/word_trails_save_v2_browser_test.cjs'),literal=/const fixture=\(coins\)=>\(\{([\s\S]*?)\n\}\);/.exec(fixtureSource);assert(literal);const local=new Function('coins','return ({'+literal[1]+'})')(70);cases.push({name:'existing-save-v2-fixture',state:local});const early=JSON.parse(JSON.stringify(local));delete early.claimedSparks;delete early.boardBible;delete early.paidBonuses;cases.push({name:'existing-pre-discovery-fixture',state:early});
 const native=JSON.parse(fs.readFileSync('scripts/fixtures/word-trails-50-native-save.json'));assert.equal(native.provenance.base,BASE);cases.push({name:'actual-native-50-playthrough',state:native.trail});
 for(const test of cases){const original=keys(test.state),backup=await oldAPI.create(memory(original)).exportSnapshot();await oldAPI.validate(backup);await current.validate(backup);const target=memory(keys({...test.state,coins:0})),service=current.create(target),review=await service.inspect(backup);assert((await service.restore(backup,review.currentHash)).ok,test.name);for(const[k,v]of Object.entries(original))assert.equal(target.get(k),v,test.name+': '+k);count++;}
 console.log('PASS_LEGACY_TRAIL_FORMATS',JSON.stringify({historicalEngineRevisions:revisions.length,actualBaseLevels:all.length,existingFixtures:2,nativeBrowserSaves:1,oldV2ExportsRestored:count,fields:['progress','paidWords','combo','paidBonuses','satchel','claimedSparks','boardBible','legacy sparks','free hints'],rawRecordsPreserved:true}));
})().catch(e=>{console.error(e);process.exitCode=1});

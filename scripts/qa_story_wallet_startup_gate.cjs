#!/usr/bin/env node
'use strict';
// TEST loader scheduling only; chapter source, content, artwork and rewards stay
// byte-identical. No page-error filtering is used in the browser recovery tests.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('journey-progress-caption.js','utf8');
const g13=source.slice(source.indexOf('/* Genesis Episode 13 TEST integration;'),source.indexOf('/* Visual Lab TEST only — regular Genesis Episode 14'));
const g14=source.slice(source.indexOf('/* Visual Lab TEST only — regular Genesis Episode 14'),source.indexOf('})();',source.indexOf('/* Visual Lab TEST only — regular Genesis Episode 14'))+5);
function fixture(script,{fenced=true,embedded=false,standardMode=true,writable=false,prerequisite=true}={}){let owned=writable;const scripts=new Map(),events=new Map(),timeouts=[];const window={BUStoryGenesis12Test:prerequisite?{}:null,BUStoryGenesis13Test:{status:prerequisite?'ready':'loading'}};window.parent=embedded?{}:window;if(fenced)window.BUPreviewStorageFence={standardMode,writerStatus:()=>({writable:owned})};window.addEventListener=(name,fn,opts)=>{const list=events.get(name)||[];list.push({fn,once:opts?.once});events.set(name,list)};const doc={readyState:'complete',getElementById:id=>scripts.get(id),createElement:()=>({}),head:{appendChild:s=>scripts.set(s.id,s)}};vm.runInNewContext(script,{window,document:doc,location:{search:''},URLSearchParams,Date,console,setTimeout:fn=>timeouts.push(fn)});return {scripts,window,timeouts,own:()=>owned=true,emit:()=>{const list=events.get('bu-test-wallet-writable')||[];events.set('bu-test-wallet-writable',list.filter(x=>!x.once));list.forEach(x=>x.fn())}};}
for(const [script,id]of [[g13,'bu-story-genesis13-native-loader'],[g14,'bu-story-genesis14-native-loader']]){
 const recovering=fixture(script);assert.equal(recovering.scripts.size,0,'Read-only recovery document must not fetch a chapter');recovering.own();recovering.emit();assert(recovering.scripts.has(id));recovering.emit();assert.equal(recovering.scripts.size,1,'Registration must remain once-only');
 assert(fixture(script,{writable:true}).scripts.has(id));assert(fixture(script,{embedded:true}).scripts.has(id),'Isolated preview frames keep their independent adapter startup');assert(fixture(script,{standardMode:false}).scripts.has(id),'Protected preview scheduling stays unchanged');assert(fixture(script,{fenced:false}).scripts.has(id),'Non-fenced behavior must be preserved');
}
const prerequisite=fixture(g14,{writable:true,prerequisite:false});assert.equal(prerequisite.scripts.size,0);assert.equal(prerequisite.timeouts.length,1);prerequisite.window.BUStoryGenesis13Test.status='ready';prerequisite.timeouts.shift()();assert.equal(prerequisite.scripts.size,1);
console.log('PASS_STORY_WALLET_STARTUP_GATE: no fetch while recovering/read-only; writable event starts once; normal/unfenced/prerequisite behavior preserved');

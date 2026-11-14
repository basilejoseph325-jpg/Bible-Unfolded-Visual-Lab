#!/usr/bin/env node
'use strict';
// Minimal native-route regression: actual published Word Trails entry script.
// No game data is read/written. Original LIVE untouched.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('experiments/word-trails-next-v1.html','utf8');
const inline=html.match(/<script>([\s\S]*?)<\/script>/);
assert(inline,'Expected early Word Trails routing script is missing');
const route=inline[1];
function check({hostname='basilejoseph325-jpg.github.io',search='',frame=false}={}){
 const window={};window.top=frame?{}:window;
 const redirects=[],location={hostname,search,
  replace(url){redirects.push(url)}};
 vm.runInNewContext(route,{window,location,URLSearchParams,console},{timeout:2000});
 return redirects;
}
let n=0;function pass(x){console.log('PASS_WT_NATIVE_DIRECT_ROUTE_'+(++n)+' '+x)}
for(const search of ['','?standalone=qa','?native=1','?standalone=qa&native=1']){
 assert.deepEqual(check({search}),['../index.html?wt_launch=native']);
 pass('public standalone links use root native host: '+(search||'plain'));
}
for(const search of ['','?standalone=qa','?native=1&standalone=qa']){
 assert.deepEqual(check({hostname:'127.0.0.1',search}),[]);
 pass('local QA can retain the standalone prototype: '+(search||'plain'));
}
assert.deepEqual(check({hostname:'127.0.0.1',search:'?native=1'}),['../index.html?wt_launch=native']);
pass('local native=1 still hands off to original root menu');
assert.deepEqual(check({frame:true,search:'?standalone=qa'}),[]);
pass('embedded Word Trails frame never navigates the parent away');
assert(!/localStorage\.|sessionStorage\.|fetch\(|import\(/.test(route));
pass('routing has zero storage or external network operations');
console.log('PASS_WT_NATIVE_DIRECT_ROUTE_FINAL',JSON.stringify({
 cases:n,publicQaBypassClosed:true,localStandaloneQaIntact:true,
 embeddedFrameUntouched:true,sourceWasRealHtml:true
}));

'use strict';
// Passive request/lifecycle evidence. Never preventDefault(), route, filter a
// page error, change a response, or absorb an application's rejected promise.
const fs=require('node:fs'),path=require('node:path');
const PREFIX='BU_QA_STORY_FETCH ';
async function recoveryNetworkTrace(page,metadata){
 const events=[],pending=[],start=Date.now(),story=url=>/\/story-adventure-content\/genesis-episode1[34]-[^/]+\.json(?:\?|$)/.test(url);
 const add=(kind,data)=>events.push({ms:Date.now()-start,kind,...data});
 await page.addInitScript(prefix=>{
  const original=window.fetch;
  window.fetch=function(...args){
   const resource=typeof args[0]==='string'?args[0]:args[0]?.url;
   if(/story-adventure-content\/genesis-episode1[34]-/.test(resource||'')){
    console.debug(prefix+JSON.stringify({resource,documentURL:location.href,origin:location.origin,referrer:document.referrer,documentId:performance.timeOrigin,readyState:document.readyState,writer:window.BUPreviewStorageFence?.writerStatus(),initiator:new Error().stack}));
   }
   return Reflect.apply(original,this,args);
  };
 },PREFIX);
 page.on('console',message=>{if(message.text().startsWith(PREFIX)){try{add('fetch-initiator',JSON.parse(message.text().slice(PREFIX.length)))}catch(error){add('diagnostic-parse-error',{message:error.message})}}});
 page.on('framenavigated',frame=>{if(frame===page.mainFrame())add('main-navigation',{url:frame.url()})});
 page.on('pageerror',error=>add('pageerror',{message:error.message,stack:error.stack}));
 page.on('request',request=>{if(story(request.url()))add('request',{url:request.url(),method:request.method(),frameURL:request.frame().url(),headers:request.headers()})});
 page.on('requestfailed',request=>{if(story(request.url()))add('requestfailed',{url:request.url(),failure:request.failure()})});
 page.on('response',response=>{if(!story(response.url()))return;const task=response.allHeaders().then(headers=>add('response',{url:response.url(),status:response.status(),headers:Object.fromEntries(['content-type','access-control-allow-origin','content-security-policy','cross-origin-resource-policy','referrer-policy'].map(k=>[k,headers[k]??null]))}),error=>add('response-headers-unavailable',{url:response.url(),message:error.message}));pending.push(task)});
 return {async save(filename){await Promise.all(pending);fs.mkdirSync(path.dirname(filename),{recursive:true});fs.writeFileSync(filename,JSON.stringify({metadata,events},null,2)+'\n');}};
}
module.exports={recoveryNetworkTrace};

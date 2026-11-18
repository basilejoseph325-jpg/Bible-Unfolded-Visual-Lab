'use strict';
// Passive test diagnostics only. No application input or storage writes.
const fs=require('node:fs'),path=require('node:path');
const pages=new WeakMap();
function trace(p){
 if(pages.has(p))return pages.get(p);
 const file=process.env.WT_RESET_TRACE_FILE||`work/word-trails-55-integration/reset-${process.pid}.jsonl`;
 fs.mkdirSync(path.dirname(file),{recursive:true});
 const started=Date.now(),meta={activeDialogs:0};
 const note=(event,data={})=>{const row={ms:Date.now()-started,event,url:p.url(),activeDialogs:meta.activeDialogs,...data};fs.appendFileSync(file,JSON.stringify(row)+'\n');console.log('RESET_TRACE',JSON.stringify(row));};
 p.on('dialog',d=>{meta.activeDialogs++;note('dialog.open',{type:d.type(),message:d.message()});});
 for(const name of ['close','crash','load','domcontentloaded'])p.on(name,()=>note('page.'+name));
 for(const name of ['frameattached','framedetached','framenavigated'])p.on(name,f=>note(name,{frameURL:f.url(),main:f===p.mainFrame()}));
 p.on('pageerror',e=>note('pageerror',{message:e.message}));
 note('runtime',{playwright:require('playwright/package.json').version,browser:p.context().browser()?.version(),viewport:p.viewportSize()});
 const result={note,pendingDialogs:()=>meta.activeDialogs,responded:()=>{meta.activeDialogs--;note('dialog.responded');},async step(label,fn,timeoutMs=20000){
  const t=Date.now();note('operation.start',{operation:label});let timer;
  try{const result=await Promise.race([Promise.resolve().then(fn),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Browser operation timed out: '+label)),timeoutMs)})]);note('operation.finish',{operation:label,elapsed:Date.now()-t});return result;}
  catch(e){note('operation.failed',{operation:label,elapsed:Date.now()-t,error:e.message});throw e;}
  finally{clearTimeout(timer);}
 }};pages.set(p,result);return result;
}
module.exports={trace};

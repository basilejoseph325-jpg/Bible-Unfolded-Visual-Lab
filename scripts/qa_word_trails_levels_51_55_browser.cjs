#!/usr/bin/env node
'use strict';
/* Private fixture only. Serve the UNCHANGED approved standalone HTML/engine;
 * combine already-supported content globals in a response-only QA script.
 * No production registration, engine patch, wallet integration or real saves.
 * Requires playwright. WT_ENGINES=chromium,webkit (default chromium).
 */
const {chromium,webkit}=require('playwright'),http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {readPack,validatePack}=require('./qa_word_trails_levels_51_55.cjs');
const pack=readPack(),ROOT=process.cwd(),SAVE='bu-visual-lab-wordtrails-next-v1';
const register=`window.BUWTAdditionalLevels=[...window.BUWTAdditionalLevels,...window.BUWTLevels31to35,...window.BUWTLevels36to40,...window.BUWTLevels41to45,...window.BUWTLevels46to50,...window.BUWTLevels51to55];for(const key of ['BUWTLevels31to35','BUWTLevels36to40','BUWTLevels41to45','BUWTLevels46to50'])delete window[key];`;
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/qa-register-pack.js'){res.setHeader('Content-Type','application/javascript');res.end(register);return;}
 const file=path.resolve(ROOT,'.'+decodeURIComponent(url.pathname));if(!file.startsWith(ROOT+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 const ext=path.extname(file),types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml','.mp3':'audio/mpeg','.json':'application/json'};res.setHeader('Content-Type',types[ext]||'application/octet-stream');
 if(url.pathname==='/experiments/word-trails-next-v1.html'){
  let html=fs.readFileSync(file,'utf8');const needle=/<script\b[^>]*\bsrc="word-trails-next-v1\.js[^\"]*"[^>]*><\/script>/;assert(needle.test(html));
  html=html.replace(needle,match=>'<script src="word-trails-levels-51-55-v1.js" defer></script><script src="/qa-register-pack.js" defer></script>'+match);res.end(html);
 }else fs.createReadStream(file).pipe(res);
});
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function tapWord(page,word){
 const letters=await page.locator('.wheel-letter').allTextContents(),used=new Set();
 for(const ch of word){const i=letters.findIndex((c,index)=>c===ch&&!used.has(index));assert(i>=0,'Wheel cannot spell '+word);used.add(i);await page.locator('.wheel-letter').nth(i).tap();}
 assert.equal(await page.locator('#preview').textContent(),word);await page.locator('#submit').tap();
}
async function pointerSwipe(page,word){
 const letters=await page.locator('.wheel-letter').allTextContents(),used=new Set(),positions=[];
 for(const ch of word){const i=letters.findIndex((c,n)=>c===ch&&!used.has(n));assert(i>=0);used.add(i);const box=await page.locator('.wheel-letter').nth(i).boundingBox();positions.push({x:box.x+box.width/2,y:box.y+box.height/2});}
 await page.mouse.move(positions[0].x,positions[0].y);await page.mouse.down();for(const p of positions.slice(1))await page.mouse.move(p.x,p.y,{steps:5});await page.mouse.up();
}
(async()=>{
 validatePack();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const url=`http://127.0.0.1:${server.address().port}/experiments/word-trails-next-v1.html?standalone=qa`;
 const evidence={physicalDevices:false,engineModified:false,productionIntegrated:false,runs:[]};
 try{for(const engine of (process.env.WT_ENGINES||'chromium').split(',')){
  const browser=await(engine==='webkit'?webkit:chromium).launch(engine==='webkit'?{headless:true}:{headless:true,executablePath:process.env.CHROME_BIN||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
  try{for(const [width,height] of [[320,568],[430,932]]){
   const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
   await context.addInitScript(({SAVE})=>{
    if(localStorage.getItem('__wt51_seeded'))return;
    localStorage.setItem('__wt51_seeded','yes');localStorage.setItem(SAVE,JSON.stringify({level:50,unlocked:50,coins:2000,points:100,completed:Array.from({length:50},(_,i)=>i),sparks:[],claimedSparks:[],boardBible:[],paidWords:[],paidBonuses:[],claimedFreeHints:[],sound:false,progress:null}));
    localStorage.setItem('bible-unfolded-rewards-v17',JSON.stringify({points:-20,coins:777,purchases:['seawheel'],equippedWheel:'seawheel'}));
    localStorage.setItem('bible-unfolded-genesis-adventure-v3860',JSON.stringify({genesis_ep12:{complete:true,step:13}}));localStorage.setItem('wt51-unrelated','keep');
   },{SAVE});
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   const load=async()=>{await page.goto(url,{waitUntil:'load',timeout:120000});await page.waitForSelector('.wheel-letter');};await load();
   const protectedBefore=await page.evaluate(()=>({wallet:localStorage.getItem('bible-unfolded-rewards-v17'),story:localStorage.getItem('bible-unfolded-genesis-adventure-v3860'),unrelated:localStorage.getItem('wt51-unrelated')}));
   for(const [offset,l] of pack.entries()){
    const index=offset+50;await page.waitForFunction(n=>document.getElementById('level-label').textContent===`LEVEL ${n} / 55`,index+1);
    assert.equal(await page.locator('#scene-title').textContent(),l.title);
    const layout=await page.evaluate(()=>{const board=document.getElementById('board').getBoundingClientRect(),wheel=document.getElementById('wheel').getBoundingClientRect();return {width:innerWidth,height:innerHeight,board:{left:board.left,right:board.right,top:board.top,bottom:board.bottom},wheel:{left:wheel.left,right:wheel.right,top:wheel.top,bottom:wheel.bottom},overflow:document.documentElement.scrollWidth>innerWidth+1||document.documentElement.scrollHeight>innerHeight+1};});
    assert(!layout.overflow);for(const b of [layout.board,layout.wheel])assert(b.left>=-1&&b.right<=width+1&&b.top>=-1&&b.bottom<=height+1,'Cropped board/wheel');assert(layout.board.bottom<=layout.wheel.top+2,'Overlapping board and wheel');
    // Invalid word made from valid wheel letters must not complete anything.
    const before=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),SAVE);await tapWord(page,[...l.rack.slice(0,3)].reverse().join(''));await pause(60);const after=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),SAVE);assert.deepEqual(after,before);
    await page.locator('#hint').tap();await page.locator('#hint').tap();const hinted=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),SAVE);assert.equal(hinted.coins,before.coins-15);assert(hinted.claimedFreeHints.includes(index));assert.equal(hinted.progress.hinted.length,2);
    await tapWord(page,l.bonus.split(' ')[0]);const bonusState=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),SAVE);assert.equal(bonusState.coins,hinted.coins+2);assert(bonusState.progress.bonuses.includes(l.bonus.split(' ')[0]));
    const secrets=[l.spark,l.extraSparks[0].word];
    for(const word of secrets){await tapWord(page,word);await page.waitForFunction(()=>document.getElementById('discovery').open);assert((await page.locator('#spark-title').textContent()).includes(word));await page.locator('#spark-next').tap();}
    const paid=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),SAVE);for(const word of secrets)assert(paid.claimedSparks.includes(index+':'+word));await tapWord(page,secrets[0]);assert.equal((await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),SAVE)).coins,paid.coins);
    // Genuine pointer swipe uses unchanged auto-submit; remaining answers use
    // touchscreen taps, including both E positions on the later wheels.
    await pointerSwipe(page,l.words[0][0]);await page.waitForFunction(({SAVE,word})=>JSON.parse(localStorage.getItem(SAVE)).progress?.found.includes(word),{SAVE,word:l.words[0][0]});
    const checkpoint=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),SAVE);await load();const resumed=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),SAVE);assert.deepEqual(resumed.progress,checkpoint.progress);assert.equal(resumed.points,checkpoint.points);
    for(const [word] of l.words.slice(1)){await tapWord(page,word);await pause(30);}
    await page.waitForFunction(()=>document.getElementById('finish').open,{timeout:15000});
    const completed=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),SAVE);assert(completed.completed.includes(index));assert.equal(completed.points,100+pack.slice(0,offset+1).reduce((n,p)=>n+p.words.length*10,0));assert.equal(completed.unlocked,Math.min(54,index+1));
    assert.equal(await page.locator('#finish-level').textContent(),'LEVEL '+(index+1)+' COMPLETE');
    console.log('PASS_WORD_TRAILS_CANDIDATE_PLAY',engine,width,index+1,l.words.length,'words; 2 hidden; hints; pointer swipe/touch taps; reload/resume; completion');
    if(offset<4)await page.locator('#next-level').tap();
   }
   const protectedAfter=await page.evaluate(()=>({wallet:localStorage.getItem('bible-unfolded-rewards-v17'),story:localStorage.getItem('bible-unfolded-genesis-adventure-v3860'),unrelated:localStorage.getItem('wt51-unrelated')}));assert.deepEqual(protectedAfter,protectedBefore);assert.deepEqual(errors,[]);
   evidence.runs.push({engine,width,height,levels:[51,52,53,54,55],crosswordAnswers:30,hiddenDiscoveries:10,hints:true,incorrectAnswers:true,touchTaps:true,pointerSwipes:true,reloadResume:true,completion:true,protectedSavesUnchanged:true,pageErrors:0});await context.close();
  }}finally{await browser.close();}
 }}finally{await new Promise(resolve=>server.close(resolve));}
 fs.mkdirSync('work',{recursive:true});fs.writeFileSync(process.env.WT_EVIDENCE||'work/word-trails-51-55-browser.json',JSON.stringify(evidence,null,2));
})().catch(e=>{console.error(e);server.close();process.exit(1);});

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
 fs.mkdirSync('work/word-trails-51-55-quality',{recursive:true});
 const metadata=JSON.parse(fs.readFileSync('experiments/word-trails-levels-51-55-metadata-v1.json','utf8'));
 const evidence={physicalDevices:false,engineModified:false,productionIntegrated:false,runs:[]};
 try{for(const engine of (process.env.WT_ENGINES||'chromium').split(',')){
  const browser=await(engine==='webkit'?webkit:chromium).launch(engine==='webkit'?{headless:true}:{headless:true,executablePath:process.env.CHROME_BIN||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
  try{for(const [width,height] of [[320,568],[430,932]]){
   const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'no-preference'});
   await context.addInitScript(({SAVE})=>{
    if(localStorage.getItem('__wt51_seeded'))return;
    localStorage.setItem('__wt51_seeded','yes');localStorage.setItem('bu-wt-next-feel-v2',JSON.stringify({music:false,sfx:false,musicVolume:42,sfxVolume:20,motion:true,haptics:false}));localStorage.setItem(SAVE,JSON.stringify({level:50,unlocked:50,coins:2000,points:100,completed:Array.from({length:50},(_,i)=>i),sparks:[],claimedSparks:[],boardBible:[],paidWords:[],paidBonuses:[],claimedFreeHints:[],sound:false,progress:null}));
    localStorage.setItem('bible-unfolded-rewards-v17',JSON.stringify({points:-20,coins:777,purchases:['seawheel'],equippedWheel:'seawheel'}));
    localStorage.setItem('bible-unfolded-genesis-adventure-v3860',JSON.stringify({genesis_ep12:{complete:true,step:13}}));localStorage.setItem('wt51-unrelated','keep');
   },{SAVE});
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   const load=async()=>{await page.goto(url,{waitUntil:'load',timeout:120000});await page.waitForSelector('.wheel-letter');};await load();
   const shot=async(level,state)=>{if(!process.env.WT_SHOTS)return;await page.locator('img').evaluateAll(images=>Promise.all(images.filter(img=>img.currentSrc).map(img=>img.decode())));await page.screenshot({animations:'disabled',path:'work/word-trails-51-55-quality/'+engine+'-'+width+'-level'+level+'-'+state+'.png'});};
   const saved=()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)),SAVE);
   const protectedBefore=await page.evaluate(()=>({wallet:localStorage.getItem('bible-unfolded-rewards-v17'),story:localStorage.getItem('bible-unfolded-genesis-adventure-v3860'),unrelated:localStorage.getItem('wt51-unrelated')}));
   for(const [offset,l] of pack.entries()){
    const index=offset+50;await page.waitForFunction(n=>document.getElementById('level-label').textContent===`LEVEL ${n} / 55`,index+1);
    assert.equal(await page.locator('#scene-title').textContent(),l.title);
    const layout=await page.evaluate(()=>{const board=document.getElementById('board').getBoundingClientRect(),wheel=document.getElementById('wheel').getBoundingClientRect();return {width:innerWidth,height:innerHeight,board:{left:board.left,right:board.right,top:board.top,bottom:board.bottom},wheel:{left:wheel.left,right:wheel.right,top:wheel.top,bottom:wheel.bottom},overflow:document.documentElement.scrollWidth>innerWidth+1||document.documentElement.scrollHeight>innerHeight+1};});
    assert(!layout.overflow);for(const b of [layout.board,layout.wheel])assert(b.left>=-1&&b.right<=width+1&&b.top>=-1&&b.bottom<=height+1,'Cropped board/wheel');assert(layout.board.bottom<=layout.wheel.top+2,'Overlapping board and wheel');
    // Wait for the actual approved scene; do not mistake an unpainted background for reviewed artwork.
    await page.evaluate(async scene=>{const image=new Image();image.src='../bible-book-art/'+scene;await image.decode();},l.scene);
    await page.locator('#spark').tap();await page.waitForFunction(()=>document.getElementById('discovery').open);
    for(const item of l.bibleBoard)assert((await page.locator('#spark-list').textContent()).includes(item.clue),'Missing Bible board clue '+item.word);
    await shot(index+1,'clues');await page.locator('#spark-next').tap();
    // Invalid word made from valid wheel letters must not complete anything.
    const before=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),SAVE);await tapWord(page,[...l.rack.slice(0,3)].reverse().join(''));await pause(60);const after=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),SAVE);assert.deepEqual(after,before);
    await page.locator('#hint').tap();await page.locator('#hint').tap();const hinted=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),SAVE);assert.equal(hinted.coins,before.coins-15);assert(hinted.claimedFreeHints.includes(index));assert.equal(hinted.progress.hinted.length,2);
    // Every curated bonus is actually accepted by the unchanged engine.
    let bonusCoins=hinted.coins;
    for(const [number,word] of l.bonus.split(' ').entries()){
     await tapWord(page,word);const bonusState=await saved();assert(bonusState.progress.bonuses.includes(word));
     bonusCoins+=2+(number===2?8:0);assert.equal(bonusState.coins,bonusCoins);
     if(number===2)await shot(index+1,'bonus');
    }
    await tapWord(page,l.bonus.split(' ')[0]);assert.equal((await saved()).coins,bonusCoins,'Duplicate bonus paid again');
    const secrets=[l.spark,l.extraSparks[0].word];
    for(const word of secrets){await tapWord(page,word);await page.waitForFunction(()=>document.getElementById('discovery').open);assert((await page.locator('#spark-title').textContent()).includes(word));assert.equal(await page.locator('#spark-link').getAttribute('href'),word===l.spark?l.url:l.extraSparks[0].url);if(word===l.spark)await shot(index+1,'discovery');await page.locator('#spark-next').tap();}
    const paid=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),SAVE);for(const word of secrets)assert(paid.claimedSparks.includes(index+':'+word));await tapWord(page,secrets[0]);assert.equal((await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),SAVE)).coins,paid.coins);
    // Genuine pointer swipe uses unchanged auto-submit; remaining answers use
    // touchscreen taps, including both E positions on the later wheels.
    await pointerSwipe(page,l.words[0][0]);await page.waitForFunction(({SAVE,word})=>JSON.parse(localStorage.getItem(SAVE)).progress?.found.includes(word),{SAVE,word:l.words[0][0]});
    const checkpoint=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),SAVE);await load();const resumed=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),SAVE);assert.deepEqual(resumed.progress,checkpoint.progress);assert.equal(resumed.points,checkpoint.points);
    // Restart the in-progress board through its existing native control.
    // Work clears while one-time receipts and balances remain intact.
    await page.locator('#level-map').tap();await page.locator('#reset-level').tap();
    const restarted=await saved();assert.equal(restarted.progress,null);assert.equal(restarted.points,resumed.points);assert.equal(restarted.coins,resumed.coins);
    assert.deepEqual(restarted.claimedSparks,resumed.claimedSparks);assert.deepEqual(restarted.paidBonuses,resumed.paidBonuses);assert.deepEqual(restarted.claimedFreeHints,resumed.claimedFreeHints);
    await tapWord(page,l.bonus.split(' ')[0]);assert.equal((await saved()).coins,restarted.coins,'Restart minted a bonus twice');
    await tapWord(page,l.words[0][0]);assert.equal((await saved()).points,restarted.points,'Restart minted a solved word twice');
    for(const [n,[word]] of l.words.slice(1).entries()){
     if(n===l.words.length-2)await shot(index+1,'board-progress');
     await tapWord(page,word);await pause(30);
    }
    await page.waitForFunction(()=>document.getElementById('finish').open,{timeout:15000});
    const completed=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),SAVE);assert(completed.completed.includes(index));assert.equal(completed.points,100+pack.slice(0,offset+1).reduce((n,p)=>n+p.words.length*10,0));assert.equal(completed.unlocked,Math.min(54,index+1));
    assert.equal(await page.locator('#finish-level').textContent(),'LEVEL '+(index+1)+' COMPLETE');
    // Compare the actual rendered board coordinates with every source answer.
    const tiles=await page.locator('#board .tile').evaluateAll(nodes=>Object.fromEntries(nodes.map(n=>[n.dataset.pos,n.textContent])));
    for(const [word,row,col,axis] of l.words)for(let i=0;i<word.length;i++)assert.equal(tiles[(row+(axis==='down'?i:0))+':'+(col+(axis==='across'?i:0))],word[i]);
    for(const item of l.bibleBoard)assert(completed.boardBible.includes(index+':'+item.word));
    await shot(index+1,'complete');
    if(index===54){
     assert(await page.locator('#finish-seal').evaluate(e=>e.hidden),'Unmodified engine unexpectedly registered new seal');
     const beforePreview=await saved();
     // Presentation-only metadata preview in this disposable document. No
     // engine or map registration, save writes, wallet calls or awards.
     await page.evaluate(seal=>{document.getElementById('finish').classList.add('wt-milestone');document.getElementById('finish-seal').hidden=false;document.getElementById('finish-seal-symbol').textContent=seal.symbol;document.getElementById('finish-seal-title').textContent=seal.name;document.getElementById('finish-seal-note').textContent=seal.detail+' · metadata preview only';document.querySelector('#finish .victory-intro').textContent='Seal layout preview — not integrated';},metadata.journeySeals['55']);
     await shot(55,'seal-metadata-preview');assert.deepEqual(await saved(),beforePreview);
     // Complete replay through the real native button; no repeated word or
     // milestone rewards may be minted.
     await page.locator('#stay').tap();const beforeReplay=await saved();
     for(const [word] of l.words)await tapWord(page,word);
     await page.waitForFunction(()=>document.getElementById('finish').open);
     const afterReplay=await saved();assert.equal(afterReplay.coins,beforeReplay.coins);assert.equal(afterReplay.points,beforeReplay.points);assert.equal(await page.locator('#finish-reward').textContent(),'Replay complete');
    }

    console.log('PASS_WORD_TRAILS_CANDIDATE_PLAY',engine,width,index+1,l.words.length,'words; 2 hidden; all 12 bonuses; hints; restart/reload/resume; actual placements; completion');
    if(offset<4)await page.locator('#next-level').tap();
   }
   const protectedAfter=await page.evaluate(()=>({wallet:localStorage.getItem('bible-unfolded-rewards-v17'),story:localStorage.getItem('bible-unfolded-genesis-adventure-v3860'),unrelated:localStorage.getItem('wt51-unrelated')}));assert.deepEqual(protectedAfter,protectedBefore);assert.deepEqual(errors,[]);
   evidence.runs.push({engine,width,height,levels:[51,52,53,54,55],crosswordAnswers:30,hiddenDiscoveries:10,bonusWords:60,restart:true,fullReplay55:true,metadataPreviewOnly:true,hints:true,incorrectAnswers:true,touchTaps:true,pointerSwipes:true,reloadResume:true,completion:true,protectedSavesUnchanged:true,pageErrors:0});await context.close();
  }}finally{await browser.close();}
 }}finally{await new Promise(resolve=>server.close(resolve));}
 fs.mkdirSync('work',{recursive:true});fs.writeFileSync(process.env.WT_EVIDENCE||'work/word-trails-51-55-browser.json',JSON.stringify(evidence,null,2));
})().catch(e=>{console.error(e);server.close();process.exit(1);});

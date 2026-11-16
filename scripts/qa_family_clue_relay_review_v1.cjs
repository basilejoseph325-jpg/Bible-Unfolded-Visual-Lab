#!/usr/bin/env node
'use strict';
// Independent quality pass: actual UI for all player counts and screenshot states.
// Only the standalone preview is served. No existing game or shared API is loaded.
const {chromium,webkit}=require('playwright'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),vm=require('node:vm'),assert=require('node:assert/strict');
const scope={window:{}};vm.runInNewContext(fs.readFileSync('experiments/family-clue-relay-questions-v1.js','utf8'),scope);const bank=JSON.parse(JSON.stringify(scope.window.BUClueRelayQuestions));
const root=process.cwd(),server=http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost'),file=path.resolve(root,'.'+url.pathname);if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',{'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp'}[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);});
(async()=>{
 fs.mkdirSync('work/relay-quality-review',{recursive:true});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url='http://127.0.0.1:'+server.address().port+'/experiments/family-clue-relay-v1.html',evidence=[];
 try{for(const engine of (process.env.RELAY_ENGINES||'chromium,webkit').split(',')){
 const browser=await(engine==='webkit'?webkit:chromium).launch(engine==='webkit'?{headless:true}:{headless:true,executablePath:process.env.CHROME_BIN||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
 try{for(const [width,height] of [[320,568],[430,932]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{for(const key of ['localStorage','sessionStorage','indexedDB'])Object.defineProperty(window,key,{get(){throw Error('Forbidden state access');}});for(const key of ['Audio','AudioContext','webkitAudioContext'])window[key]=function(){throw Error('Forbidden audio access');};});
  const shot=async name=>{await page.locator('img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));await page.screenshot({animations:'disabled',path:'work/relay-quality-review/'+engine+'-'+width+'-'+name+'.png'});};
  const seen=new Set(),playerRuns=[];
  for(let count=2;count<=6;count++){
   await page.goto(url,{waitUntil:'load'});
   if(count===2){assert.equal(await page.locator('#player-count').evaluate(e=>getComputedStyle(e).colorScheme),'light');await shot('start');const box=await page.locator('#start-relay').boundingBox();assert(box.y>=0&&box.y+box.height<=height,'Start hidden on setup');}
   await page.locator('#player-count').selectOption(String(count));await page.locator('#rounds-each').selectOption(count===6?'3':'2');
   if(count===6){await shot('setup-six-top');await page.locator('#player-5').scrollIntoViewIfNeeded();await shot('setup-six-bottom');}
   await page.locator('#start-relay').tap();const scores=Array(count).fill(0),rounds=count*(count===6?3:2),perSeat=Array.from({length:count},()=>[]);
   for(let n=0;n<rounds;n++){
    assert.equal(await page.locator('#subtitle').textContent(),'Player '+(n%count+1)+"'s turn");
    if(count===6&&n===1)await shot('scoreboard-handoff');
    await page.locator('#begin-round').tap();
    const first=await page.locator('.clue p').first().textContent(),q=bank.find(q=>q.clues[0]===first);assert(q);perSeat[n%count].push(q.difficulty);if(count===6)seen.add(q.id);
    for(let clue=0;clue<3;clue++){
     assert.equal(await page.locator('.clue').count(),clue+1);
     const visible=await page.locator('#clue-list').evaluate(e=>{const last=e.lastElementChild,r=last.getBoundingClientRect(),p=e.getBoundingClientRect();return {inside:r.top>=p.top-1&&r.bottom<=p.bottom+1,scroll:e.scrollTop,clue:last.textContent};});
     assert(visible.inside,'New clue is hidden: '+JSON.stringify({engine,width,count,q:q.id,clue,visible}));
     if(count===6&&n===0)await shot('clue-'+(clue+1));
     if(clue===2)assert((await page.locator('.round-line').nth(1).textContent()).includes('1 point available'));
     if(clue>0)assert((await page.locator('#announcement').textContent()).includes(q.clues[clue]),'New clue is not announced');
     const right=clue===2&&!(count===2&&n%count===0);
     await page.locator('#guess').fill(right?({'cr-bezalel':'Bezʹal·el','cr-bethlehem':'Bethʹle·hem','cr-joppa':'Jopʹpa','cr-troas':'Troʹas'}[q.id]??(/^the /i.test(q.answer)?q.answer:'the '+q.answer)):'Wrong guess');
     if(count===3&&n===0&&clue===2)await page.locator('#guess').press('Enter');else await page.locator('#submit-guess').tap();
     if(right)scores[n%count]++;
    }
    assert.equal(await page.locator('.answer').textContent(),q.answer);
    assert(await page.locator('.result-scroll').evaluate(e=>{const p=e.getBoundingClientRect(),c=e.querySelector('.result-copy').getBoundingClientRect(),b=e.querySelector('.wax').getBoundingClientRect();return c.top>=p.top+p.height*.175&&c.bottom<=b.top-6&&b.bottom<=p.bottom-p.height*.12;}),'Text overlaps roller/control');

    assert.deepEqual(await page.locator('.score b').allTextContents(),scores.map(String));
    if(count===6&&n===0){await shot('answer-top');await page.locator('#round-result a').last().scrollIntoViewIfNeeded();await shot('answer-source');}
    await page.locator('#next-round').tap();
   }
   for(const difficulties of perSeat)assert.equal(new Set(difficulties).size,count===6?3:2,'Unequal difficulty mix');
   const expected=count===2?'Player 2 wins!':'A shared win!';assert.equal(await page.locator('.winner h2').textContent(),expected);
   if(count===2)await shot('winner');if(count===6)await shot('tie-winner');
   await page.locator('#play-again').tap();assert.deepEqual(await page.locator('.score b').allTextContents(),Array(count).fill('0'));
   if(count===6)await shot('replay');
   assert.equal(await page.locator('#begin-round').count(),1);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1||document.documentElement.scrollHeight>innerHeight+1),false);
   playerRuns.push({players:count,rounds,scores,difficultyBalanced:true});
  }
  assert.equal(seen.size,18);assert.deepEqual(errors,[]);evidence.push({engine,width,height,playerRuns,allQuestions:true,all54CluesVisible:true,enterKey:true,screenshots:true,storageAndAudioForbidden:true,physicalDevices:false});
  console.log('PASS_CLUE_RELAY_REVIEW',engine,width,'2–6 players; 46 rounds; all 54 clues visible; unique/tied winners; replay; fair difficulty; screenshot gallery');await context.close();
 }}finally{await browser.close();}
 }}finally{await new Promise(resolve=>server.close(resolve));}
 fs.writeFileSync(process.env.RELAY_EVIDENCE||'work/relay-quality-review/evidence.json',JSON.stringify(evidence,null,2));
})().catch(e=>{console.error(e);server.close();process.exit(1);});

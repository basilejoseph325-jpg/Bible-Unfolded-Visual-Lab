#!/usr/bin/env node
'use strict';
// Standalone preview only; synthetic memory, no integration with the game.
const {chromium,webkit}=require('playwright'),http=require('node:http'),path=require('node:path'),fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const scope={window:{}};vm.runInNewContext(fs.readFileSync('experiments/family-clue-relay-questions-v1.js','utf8'),scope);const bank=JSON.parse(JSON.stringify(scope.window.BUClueRelayQuestions));
const root=process.cwd(),server=http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost'),file=path.resolve(root,'.'+url.pathname);if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404);res.end();return;}const type={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp'}[path.extname(file)]||'application/octet-stream';res.setHeader('Content-Type',type);fs.createReadStream(file).pipe(res);});
async function layout(page,selectors){
 const result=await page.evaluate(selectors=>({horizontal:document.documentElement.scrollWidth>innerWidth+1,vertical:document.documentElement.scrollHeight>innerHeight+1,boxes:selectors.map(s=>{const e=document.querySelector(s),r=e?.getBoundingClientRect();return {s,exists:!!e,left:r?.left,right:r?.right,top:r?.top,bottom:r?.bottom,width:r?.width,height:r?.height};})}),selectors);
 assert(!result.horizontal&&!result.vertical,JSON.stringify(result));
 const view=page.viewportSize();for(const b of result.boxes){assert(b.exists,b.s);assert(b.left>=-1&&b.right<=view.width+1&&b.top>=-1&&b.bottom<=view.height+1,'Clipped '+JSON.stringify(b));if(['#begin-round','#submit-guess','#next-round','#play-again'].includes(b.s))assert(b.width>=44&&b.height>=44);}
}
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const url='http://127.0.0.1:'+server.address().port+'/experiments/family-clue-relay-v1.html',evidence=[];
 try{for(const engine of (process.env.RELAY_ENGINES||'chromium,webkit').split(',')){
 const browser=await(engine==='webkit'?webkit:chromium).launch(engine==='webkit'?{headless:true}:{headless:true,executablePath:process.env.CHROME_BIN||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
 try{for(const [width,height] of [[320,568],[430,932]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  // This preview must not even access storage APIs or create audio elements.
  await page.addInitScript(()=>{for(const name of ['localStorage','sessionStorage','indexedDB'])Object.defineProperty(window,name,{get(){throw Error('Forbidden shared state access: '+name);}});window.Audio=function(){throw Error('No audio dependency allowed');};});
  await page.goto(url,{waitUntil:'load'});await page.locator('#player-count').selectOption('6');const names=['W'.repeat(24),'Rebekah','Eli','Sarah','James','Lydia'];for(let i=0;i<6;i++)await page.locator('#player-'+i).fill(names[i]);
  await page.locator('#start-relay').scrollIntoViewIfNeeded();await page.locator('#start-relay').tap();await layout(page,['#begin-round','.scoreboard']);
  // Canceling a restart must preserve the current relay.
  await page.locator('#restart-relay').tap();await page.locator('#cancel-restart').tap();assert.equal(await page.locator('.round-line strong').textContent(),'Round 1 of 18');
  const scores=Array(6).fill(0),seen=[];
  for(let n=0;n<18;n++){
   assert((await page.locator('#subtitle').textContent()).includes(names[n%6]));await page.locator('#begin-round').tap();
   const clue=await page.locator('#clue-list .clue p').first().textContent(),q=bank.find(q=>q.clues[0]===clue);assert(q&&!seen.includes(q.id));seen.push(q.id);
   await page.locator('#submit-guess').tap();assert.equal(await page.locator('.clue').count(),1);assert((await page.locator('#guess-error').textContent()).includes('Type'));
   const route=n%4; // 0: reveal; 1: 3pts; 2: 2pts; 3: 1pt.
   for(let c=0;c<3;c++){
    assert.equal(await page.locator('.clue').count(),c+1);
    await page.locator('#guess').fill(route>0&&c===route-1?q.answer:'Not this answer');await page.locator('#submit-guess').tap();
    if(route>0&&c===route-1){scores[n%6]+=3-c;break;}
   }
   await page.waitForSelector('#round-result');assert.equal(await page.locator('.answer').textContent(),q.answer);await layout(page,['#next-round','.result-scroll']);
   assert.deepEqual(await page.locator('.score b').allTextContents(),scores.map(String));
   if(n===3){await page.locator('#restart-relay').tap();await page.locator('#cancel-restart').tap();assert.deepEqual(await page.locator('.score b').allTextContents(),scores.map(String));assert.equal(await page.locator('.answer').textContent(),q.answer);}
   const links=await page.locator('#round-result a').evaluateAll(nodes=>nodes.map(n=>({href:n.href,target:n.target,rel:n.rel})));for(const link of links){assert(link.href.startsWith('https://www.jw.org/en/library/bible/nwt/'));assert.equal(link.target,'_blank');assert(link.rel.includes('noopener'));}
   if(n===0&&process.env.RELAY_SHOTS){fs.mkdirSync('work',{recursive:true});await page.screenshot({path:'work/clue-relay-'+engine+'-'+width+'-result.png'});}
   await page.locator('#next-round').tap();
  }
  assert.equal(new Set(seen).size,18);await layout(page,['#play-again','#change-players']);assert.equal(await page.locator('.standings li').count(),6);
  await page.locator('#play-again').tap();assert.deepEqual(await page.locator('.score b').allTextContents(),Array(6).fill('0'));await page.locator('#begin-round').tap();
  const newClue=await page.locator('.clue p').first().textContent();assert.notEqual(newClue,bank.find(q=>q.id===seen[0]).clues[0]);
  // Confirm restart mid-round: scores clear, clues return behind handoff.
  await page.locator('#guess').fill('pending guess');await page.locator('#restart-relay').tap();await page.locator('#confirm-restart').tap();assert.equal(await page.locator('#restart-dialog').evaluate(e=>e.open),false);assert.equal(await page.locator('#guess').count(),0);assert.equal(await page.locator('#begin-round').count(),1);
  // Reduced-height viewport models available space, not a physical iOS keyboard.
  await page.setViewportSize({width,height:400});await page.locator('#begin-round').tap();await layout(page,['#guess','#submit-guess']);await page.setViewportSize({width,height});
  await page.goto(url,{waitUntil:'load'});await page.locator('#rounds-each').selectOption('2');await page.locator('#start-relay').tap();
  // An all-missed relay ends warmly in a shared finish with no fabricated winner.
  for(let n=0;n<4;n++){await page.locator('#begin-round').tap();for(let c=0;c<3;c++){await page.locator('#guess').fill('Wrong guess');await page.locator('#submit-guess').tap();}await page.locator('#next-round').tap();}
  assert.equal(await page.locator('.winner h2').textContent(),'A shared finish!');await page.locator('#change-players').tap();assert.equal(await page.locator('#player-count').inputValue(),'2');
  // Name validation and DOM text insertion must not create markup.
  await page.locator('#player-0').fill('Same');await page.locator('#player-1').fill(' same ');await page.locator('#start-relay').tap();assert((await page.locator('#setup-error').textContent()).includes('different names'));
  await page.locator('#player-0').fill('<img src=x>');await page.locator('#player-1').fill('Friend');await page.locator('#start-relay').tap();assert.equal(await page.locator('img[src=\"x\"]').count(),0);
  assert.deepEqual(errors,[]);evidence.push({engine,width,height,roundsCompleted:22,all18Questions:true,scoring3210:true,turns:true,replay:true,restartConfirmCancel:true,zeroPointTie:true,namesSafe:true,reducedHeight400:true,touchControls:true,pageErrors:0,physicalDevices:false});console.log('PASS_CLUE_RELAY_BROWSER',engine,width,'18-question relay, scoring/turns/clues/reveal, replay/restart, zero-point tie, safe names, layout, 400px height');await context.close();
 }}finally{await browser.close();}
 }}finally{await new Promise(resolve=>server.close(resolve));}
 fs.mkdirSync('work',{recursive:true});fs.writeFileSync(process.env.RELAY_EVIDENCE||'work/clue-relay-browser.json',JSON.stringify(evidence,null,2));
})().catch(e=>{console.error(e);server.close();process.exit(1);});

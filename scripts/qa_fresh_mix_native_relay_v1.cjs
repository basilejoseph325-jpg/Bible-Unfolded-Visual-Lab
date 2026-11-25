'use strict';
const {chromium,webkit}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const url=process.env.BU_FRESH_URL||'http://127.0.0.1:8930/index.html';
(async()=>{for(const type of ['chromium','webkit'])for(const width of [320,430]){
 const browser=await ({chromium,webkit}[type]).launch(type==='chromium'?{executablePath:process.env.CHROME_BIN||'/usr/bin/chromium',args:['--no-sandbox']}:{headless:true});
 const context=await browser.newContext({viewport:{width,height:width===320?568:932},hasTouch:true,isMobile:true});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url);await page.waitForFunction(()=>!!window.BUFreshMixNative);
 const baseline=await page.evaluate(()=>{localStorage.setItem('qa-save-marker','keep');return Object.fromEntries(Object.entries(localStorage).filter(([k])=>/wallet|reward|trail|grant|economy/.test(k)))});
 for(const count of [2,6])for(const minutes of [10,20,30,45,60]){
 await page.evaluate(({count,minutes})=>{bu35Game=null;bu35Setup={...bu35Setup,people:Array.from({length:count},(_,i)=>'Friend '+(i+1)),minutes,topic:'noah',difficulty:'intermediate',quick:'session',order:'surprise'};bu35Open('setup');bu35Begin();bu35Game.phases=['cluerelay','finish'];bu35Game.phase=0;bu35Save();bu35Render()},{count,minutes});
 const total=count*(minutes>=60?3:minutes>=45?2:1);const ids=new Set();
 for(let n=0;n<total;n++){
  await page.locator('#relay-ready').tap();
  const q=await page.evaluate(()=>{const g=bu35Game;return g.nativeRelay.questions[bu35TurnNumber()]});assert(!ids.has(q.id));ids.add(q.id);
  if(n===0){await page.locator('#relay-guess').fill('wrong answer');await page.locator('#relay-form button').tap();assert.match(await page.locator('.bu-fresh-native').innerText(),/CLUE 2 OF 3/)}
  if(n%3===0){await page.locator('#relay-family').tap();await page.locator('#relay-confirm').tap()}
  else if(n%3===1){await page.locator('#relay-guess').fill(q.answer);await page.locator('#relay-form button').tap()}
  else{for(let k=0;k<3;k++){await page.locator('#relay-guess').fill('wrong answer');await page.locator('#relay-form button').tap()}}
  const before=await page.evaluate(()=>({scores:bu35Game.scores,game:JSON.stringify(bu35Game)}));
  if(n===0){await page.reload();await page.waitForFunction(()=>!!window.BUFreshMixNative);await page.evaluate(()=>bu35Open('game'));assert.equal(await page.evaluate(()=>JSON.stringify(bu35Game)),before.game);assert(await page.locator('#relay-next').isVisible())}
  const score=await page.evaluate(()=>bu35Game.scores);assert.deepEqual(score,before.scores);
  await page.locator('#relay-next').tap();
 }
 assert.equal(await page.evaluate(()=>bu35Phase()),'finish');
 assert.equal(await page.evaluate(()=>bu35Game.people.length),count);
 }
 await page.evaluate(()=>{bu35Hub()});await page.waitForSelector('#bu-fw-clue-relay-card');assert.equal(await page.locator('#bu-fw-clue-relay-card').count(),1);assert.equal(await page.locator('#home-clue-relay').count(),0);
 assert.deepEqual(await page.evaluate(()=>Object.fromEntries(Object.entries(localStorage).filter(([k])=>/wallet|reward|trail|grant|economy/.test(k)))),baseline);
 assert.equal(await page.evaluate(()=>localStorage.getItem('qa-save-marker')),'keep');
 // Schedule all settings without starting or replacing any real save.
 assert(await page.evaluate(()=>{for(const m of [10,20,30,45,60])for(let i=0;i<40;i++){const p=bu3825Playlist('allbible',m,'team');if(p.filter(x=>x==='cluerelay').length>1||!p.includes('read')||p.at(-1)!=='finish')return false}return true}));
 fs.mkdirSync('work/fresh-relay',{recursive:true});await page.screenshot({path:`work/fresh-relay/${type}-${width}.png`});
 assert.deepEqual(errors,[]);console.log('PASS native Relay',type,width,'2/6 players × all durations, scoring, clues, reload, rotation, card and wallet isolation');await browser.close();
 }})().catch(e=>{console.error(e);process.exit(1)});

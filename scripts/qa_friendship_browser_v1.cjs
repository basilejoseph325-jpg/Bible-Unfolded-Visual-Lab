'use strict';
const {chromium,webkit}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const url=process.env.BU_FRESH_URL||'http://127.0.0.1:8931/index.html';
(async()=>{for(const type of ['chromium','webkit'])for(const width of [320,430]){
 const browser=await ({chromium,webkit}[type]).launch(type==='chromium'?{executablePath:process.env.CHROME_BIN||'/usr/bin/chromium',args:['--no-sandbox']}:{headless:true});
 const context=await browser.newContext({viewport:{width,height:width===320?568:932},hasTouch:true,isMobile:true});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 console.log('Open',type,width);await page.goto(url,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.BUFriendshipPrompts&&window.BUFreshMixNative);if(await page.locator('#daily-close').isVisible())await page.locator('#daily-close').tap();await page.locator('#home-family').tap();
 const baseline=await page.evaluate(()=>Object.fromEntries(Object.entries(localStorage).filter(([k])=>/wallet|reward|trail|grant|economy/.test(k))));
 fs.mkdirSync('work/friendships',{recursive:true});
 const seen={};
 for(const count of [2,6])for(const activity of ['beyond','paradise','predict','faith','common','build']){
 console.log('Social case',type,width,count,activity);
 await page.evaluate(({count,activity})=>{bu35Game=null;bu35Setup={...bu35Setup,people:Array.from({length:count},(_,i)=>'Friend '+(i+1)),minutes:20,topic:'allbible',quick:'session',order:'surprise'};bu35Open('setup');bu35Begin();bu35Game.phases=['friendship-'+activity,'finish'];bu35Game.phase=0;bu35Save();bu35Render()},{count,activity});
 const expected=Array(count).fill(0),ids=[];
 for(let n=0;n<count;n++){
  assert.match(await page.locator('.bu-fresh-native').innerText(),new RegExp('Friend '+(n+1)));
  await page.locator('#social-ready').tap();
  const current=await page.evaluate(()=>bu35Game.friendshipV1.turns[bu35Game.phase+':'+bu35Game.turn]);assert(!ids.includes(current.id));ids.push(current.id);
  if(n===0){await page.screenshot({path:`work/friendships/${type}-${width}-${activity}.png`});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
  if(activity==='predict'){
   const partner=await page.evaluate(()=>((bu35Game.turn+bu35Game.friendshipV1.partnerOffset)%bu35Game.people.length));
   await page.locator('[data-social-choice="1"]').tap();assert.equal(await page.locator('[data-social-choice]').count(),0);assert(!await page.locator('#social-next').count());
   if(n===0){const saved=await page.evaluate(async()=>{const backup=await BUPreviewStorageFence.makePreviewBackup();await BUSharedTestBackup.validate(backup);if(JSON.parse(backup.keys['bible-unfolded-family-v35']).game.friendshipV1.turns['0:0'].chosen!==bu35Game.friendshipV1.turns['0:0'].chosen)throw Error('Private choice missing from coordinated backup');return bu35Game.friendshipV1.turns['0:0'].chosen});await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.BUFreshMixNative);if(await page.locator('#daily-close').isVisible())await page.locator('#daily-close').tap();await page.locator('#home-family').tap();await page.locator('#bu35-resume').tap();assert.equal(await page.locator('[data-social-choice]').count(),0);assert.equal(await page.evaluate(()=>bu35Game.friendshipV1.turns['0:0'].chosen),saved)}
   await page.locator('#social-ready').tap();
   await page.locator(`[data-social-choice="${n%2?0:1}"]`).tap();if(n%2===0)expected[partner]++;
   assert.match(await page.locator('.bu-fresh-native').innerText(),/The reveal/);
  }else if(n===0){await page.locator('#social-skip').tap();assert.match(await page.locator('.bu-fresh-native').innerText(),/No problem/)}else await page.locator('#social-shared').tap();
  assert.deepEqual(await page.evaluate(()=>bu35Game.scores),expected);
  await page.locator('#social-next').tap();
 }
 assert.equal(await page.evaluate(()=>bu35Phase()),'finish');assert.deepEqual(await page.evaluate(()=>bu35Game.scores),expected);assert.equal(await page.evaluate(()=>bu35Game.completedTurns),0);
 if(seen[activity])assert(!ids.some(id=>seen[activity].includes(id)),'Consecutive session repeats');seen[activity]=ids;
 }
 // Fresh Mix distribution: all six activities appear, Bible phases remain;
 // Classic Guided and Quick Play don't acquire social phases.
 assert(await page.evaluate(()=>{const types=new Set();for(const minutes of [10,20,30,45,60])for(let i=0;i<12;i++){bu35Setup.order='surprise';bu35Setup.quick='session';const p=bu3829MixInDiscussions(bu3825Playlist('allbible',minutes,'team'),minutes);const social=p.filter(p=>p.startsWith('friendship-'));social.forEach(p=>types.add(p));if(social.length!==(minutes>=60?3:minutes>=45?2:1)||new Set(social).size!==social.length||!p.includes('read')||p.at(-1)!=='finish')return false}bu35Setup.order='classic';if(bu3829MixInDiscussions(['read','think','finish'],20).some(p=>p.startsWith('friendship-')))return false;return types.size===6}));
 await page.evaluate(()=>bu35Hub());await page.waitForSelector('#bu-fw-clue-relay-card');assert.equal(await page.locator('#bu-fw-clue-relay-card').count(),1);assert.equal(await page.locator('#home-clue-relay').count(),0);
 assert.deepEqual(await page.evaluate(()=>Object.fromEntries(Object.entries(localStorage).filter(([k])=>/wallet|reward|trail|grant|economy/.test(k)))),baseline);assert.deepEqual(errors,[]);
 console.log('PASS friendships',type,width,'six activities, 2/6 players, private restore, rotation, fair turns, skips, scoring, Classic and wallet isolation');await browser.close();
 }})().catch(e=>{console.error(e);process.exit(1)});

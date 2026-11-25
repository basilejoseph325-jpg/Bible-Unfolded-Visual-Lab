'use strict';
// Synthetic profiles only. Exercises real native handlers across mixed phases,
// completion/replay rewards and full restore, locally or on approved TEST Pages.
const {chromium,webkit}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const url=process.env.BU_FRESH_URL||'http://127.0.0.1:8931/index.html';
const W='bible-unfolded-rewards-v17',OLD='bu-visual-lab-wordtrails-next-v1';
const evidence=[];fs.mkdirSync('work/fresh-release',{recursive:true});
(async()=>{for(const engine of ['chromium','webkit'])for(const width of [320,430]){
 const browser=await({chromium,webkit}[engine]).launch(engine==='chromium'?{executablePath:process.env.CHROME_BIN||'/usr/bin/chromium',args:['--no-sandbox']}:{headless:true});
 try{const context=await browser.newContext({viewport:{width,height:width===320?568:932},hasTouch:true,isMobile:true});
 await context.addInitScript(({W,OLD})=>{if(localStorage.getItem('__family_release_seed'))return;localStorage.setItem(W,JSON.stringify({coins:533,points:-40,purchases:['goldwheel'],earned:[],spent:[],hints:{}}));localStorage.setItem(OLD,JSON.stringify({coins:111,points:505,level:44,unlocked:49,completed:Array.from({length:44},(_,i)=>i),progress:null}));localStorage.setItem('__family_release_seed','1')},{W,OLD});
 const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 async function ready(){await p.waitForFunction(()=>window.BUFriendshipPrompts&&window.BUFreshMixNative&&window.BUPreviewStorageFence?.writerStatus().writable&&window.BUTestInsightBridge?.nativeBalance().ok&&window.BUStoryGenesis14Test?.status==='ready'&&economy.lastDay===currentLocalDay(),null,{timeout:120000});if(await p.locator('#daily-close').isVisible())await p.locator('#daily-close').tap()}
 const snapshot=()=>p.evaluate(({W,OLD})=>({wallet:JSON.parse(localStorage.getItem(W)),oldTrail:localStorage.getItem(OLD),prefs:{musicOn,sfxOn,musicVolume,sfxVolume,celebrate:bu34Audio.celebrate}}),{W,OLD});
 await p.goto(url,{waitUntil:'domcontentloaded'});await ready();await p.locator('#home-family').tap();await p.locator('#bu35-new').tap();await p.locator('[data-person="0"]').fill('Aster');await p.locator('[data-person="1"]').fill('Cedar');
 // Native setup retains its default third player unless removed by its control.
 while(await p.locator('[data-person]').count()>2)await p.locator('#bu35-minus').tap();
 await p.locator('#bu35-start').tap();
 const before=await snapshot();assert.equal(before.wallet.purchases.includes('goldwheel'),true);
 for(let replay=0;replay<2;replay++){
 if(replay)await p.evaluate(()=>{bu35Game=null;bu35Begin()});
 // A repeatable mixed fixture uses the genuine reading, personal, Relay,
 // prediction, Trivia and completion handlers without replacing any engine.
 await p.evaluate(()=>{bu35Setup={...bu35Setup,minutes:20,style:'friendly',topic:'allbible',quick:'session',order:'surprise'};Object.assign(bu35Game,{minutes:20,style:'friendly',topic:'allbible',phases:['read','friendship-beyond','cluerelay','friendship-predict','trivia','finish'],phase:0,turn:0,round:0,handOff:true});bu35Save();bu35Render()});
 await p.locator('#bu35-read-done').tap();
 for(let n=0;n<2;n++){await p.locator('#social-ready').tap();await p.locator('#social-skip').tap();await p.locator('#social-next').tap()}
 assert.equal(await p.evaluate(()=>bu35Phase()),'cluerelay');assert.equal(await p.evaluate(()=>bu35Game.completedTurns),0);
 for(let n=0;n<2;n++){
 await p.locator('#relay-ready').tap();const answer=await p.evaluate(()=>bu35Game.nativeRelay.questions[bu35TurnNumber()].answer);await p.locator('#relay-guess').fill(answer);await p.locator('#relay-form button').tap();await p.locator('#relay-next').tap();
 }
 assert.equal(await p.evaluate(()=>bu35Phase()),'friendship-predict');assert.deepEqual(await p.evaluate(()=>bu35Game.scores),[3,3]);
 for(let n=0;n<2;n++){
 await p.locator('#social-ready').tap();await p.locator('[data-social-choice="1"]').tap();assert.equal(await p.locator('[data-social-choice]').count(),0);
 if(n===0&&!replay){
 await p.locator('#fresh-leave').tap();await p.locator('#bu35-resume').tap();assert.equal(await p.locator('[data-social-choice]').count(),0);
 await p.locator('#bu35-back').tap();await p.locator('#wb36-family-resume').tap();assert.equal(await p.locator('[data-social-choice]').count(),0);
 const family=await p.evaluate(()=>localStorage.getItem('bible-unfolded-family-v35')),backup=await p.evaluate(()=>BUPreviewStorageFence.makePreviewBackup());
 await p.evaluate(async data=>{await BUSharedTestBackup.validate(data);const k='bible-unfolded-family-v35',f=JSON.parse(localStorage.getItem(k));f.setup.minutes=60;localStorage.setItem(k,JSON.stringify(f));const s=BUPreviewStorageFence.sharedBackup,r=await s.inspect(data),out=await s.restore(data,r.currentHash);if(!out.ok)throw Error(out.error)},backup);
 await p.reload({waitUntil:'domcontentloaded'});await ready();assert.equal(await p.evaluate(()=>localStorage.getItem('bible-unfolded-family-v35')),family);assert.deepEqual((await snapshot()).wallet,before.wallet);
 await p.locator('#home-family').tap();await p.locator('#bu35-resume').tap();assert.equal(await p.locator('[data-social-choice]').count(),0);
 }
 await p.locator('#social-ready').tap();await p.locator('[data-social-choice="1"]').tap();await p.locator('#social-next').tap();
 }
 assert.equal(await p.evaluate(()=>bu35Phase()),'trivia');assert.equal(await p.evaluate(()=>bu35Game.completedTurns),2);assert.deepEqual(await p.evaluate(()=>bu35Game.scores),[4,4]);
 for(let n=0;n<2;n++){await p.locator('#bu35-ready').tap();const correct=await p.evaluate(()=>bu35Question().correct);await p.locator('#bu35-body [data-answer="'+correct+'"]').tap();await p.locator('#bu67-modal .bu-fw-answer-scroll-return').tap()}
 assert.equal(await p.evaluate(()=>bu35Phase()),'finish');assert.deepEqual(await p.evaluate(()=>bu35Game.scores),[104,104]);assert.equal(await p.evaluate(()=>bu35Game.completedTurns),4);
 await p.screenshot({path:`work/fresh-release/${engine}-${width}-finish.png`});await p.locator('#bu35-finish').tap();
 const after=await snapshot();assert.equal(after.wallet.coins,before.wallet.coins+35);assert.equal(after.wallet.points,before.wallet.points+140);assert.equal(after.wallet.earned.filter(id=>id==='family-v35-allbible-20-friendly').length,1);assert.deepEqual(after.wallet.purchases,before.wallet.purchases);assert.equal(after.oldTrail,before.oldTrail);assert.deepEqual(after.prefs,before.prefs);
 }
 assert.equal(await p.locator('#bu-fw-clue-relay-card').count(),1);assert.equal(await p.locator('#home-clue-relay').count(),0);
 await p.locator('#bu35-back').tap();await p.reload({waitUntil:'domcontentloaded'});await ready();assert(await p.locator('#home-family').isVisible());assert.equal((await snapshot()).wallet.coins,before.wallet.coins+35);assert.deepEqual(errors,[]);
 evidence.push({engine,width,mixedNativePhases:true,privateRestore:true,unscoredSkips:true,localScores:[104,104],nativeCompletionTokensOnce:35,nativePointsOnce:140,purchasesAndOldTrailPreserved:true,settingsPreserved:true,refreshHome:true,pageErrors:errors});
 console.log('PASS mixed native release',engine,width,'phase transitions, reward once/replay, private full restore, existing progress/settings, refresh');
 }finally{await browser.close()}
 }fs.writeFileSync('work/fresh-release/evidence.json',JSON.stringify(evidence,null,2))})().catch(e=>{console.error(e);process.exit(1)});

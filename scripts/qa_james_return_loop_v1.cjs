/* James Return Loop — browser acceptance: functional spend, risk, cashout,
   real native Trivia answers, Book access, lives, insurance, and wallet isolation. */
const assert=require('node:assert/strict');
const puppeteer=require('puppeteer-core');
const {execSync}=require('node:child_process');
const executablePath=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const base='http://127.0.0.1:8899/';
const KEYS=['bible-unfolded-rewards-v17','bible-unfolded-rewards-v17-recovery-v3811',
 'bible-unfolded-wheel-ownership-v3825','bible-unfolded-wheel-ownership-v3825-backup'];
const sleep=t=>new Promise(r=>setTimeout(r,t));
(async()=>{
 let browser;
 try{
  browser=await puppeteer.launch({headless:true,executablePath,args:['--no-sandbox','--disable-setuid-sandbox']});
  for(const vp of [{width:390,height:705,isMobile:true,hasTouch:true,deviceScaleFactor:2},
                   {width:832,height:384,isMobile:true,hasTouch:true,deviceScaleFactor:2}]){
   const ctx=await browser.createBrowserContext(),page=await ctx.newPage(),errors=[];
   await page.setViewport(vp);
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'index.html',{waitUntil:'domcontentloaded',timeout:120000});
   await page.waitForSelector('#home-books',{timeout:60000});
   await page.evaluate(()=>document.getElementById('daily-continue')?.click());
   await sleep(120);
   await page.addStyleTag({url:base+'james-return-loop-test-v1.css'});
   await page.addScriptTag({url:base+'james-return-loop-test-v1.js'});
   await page.waitForFunction(()=>!!window.BUJamesReturnLoopV1&&!!document.querySelector('#bu-james-rewards'),{timeout:10000});
   const init=await page.evaluate(keys=>({
    native:keys.map(k=>localStorage.getItem(k)),
    state:window.BUJamesReturnLoopV1.inspect(),
    products:document.querySelectorAll('#bu-james-rewards .bu-james-item').length,
    layout:(()=>{const r=document.querySelector('#bu-james-rewards .bu-james-hero').getBoundingClientRect();return {x:r.x,right:r.right,width:r.width}})()
   }),KEYS);
   console.log('INIT_'+vp.width,JSON.stringify({state:init.state,products:init.products,layout:init.layout}));
   assert.equal(init.products,8);
   assert(init.layout.x>=-1 && init.layout.right<=vp.width+1,'Rewards card must fit the viewport');
   assert(init.state.balance>=300&&init.state.lives===5);
   // Book mode must be actively gated until purchased, without touching original progress.
   await page.evaluate(()=>{if(typeof focusHome==='function')focusHome();document.getElementById('home-books').click()});
   await page.waitForSelector('#bu-james-gate');
   assert(!(await page.evaluate(()=>window.BUJamesReturnLoopV1.inspect().owned.includes('books'))));
   await page.evaluate(()=>document.querySelector('#bu-james-gate [data-buj-action=unlock-books]').click());
   const unlocked=await page.evaluate(()=>window.BUJamesReturnLoopV1.inspect());
   assert(unlocked.owned.includes('books'),'Book access must persist as a purchased entitlement');
   assert.equal(unlocked.balance,init.state.balance-180);
   assert.equal(await page.evaluate(()=>!!document.querySelector('#bu-james-gate')),false,'Book gate closes after purchase');
   await page.evaluate(()=>{if(typeof focusHome==='function')focusHome();document.getElementById('home-rewards').click()});
   await sleep(100);
   await page.screenshot({path:'/tmp/BU-JAMES-REWARDS-'+vp.width+'-shop.png'});
   // Purchase a real collectible TEST item with an official Bible reference.
   await page.evaluate(()=>window.BUJamesReturnLoopV1.testActions.buy('ruth'));
   const collection=await page.evaluate(()=>window.BUJamesReturnLoopV1.inspect());
   assert(collection.owned.includes('ruth'));
   assert.equal(collection.balance,unlocked.balance-90);
   assert((await page.evaluate(()=>document.querySelector('#bu-james-rewards a[href*="jw.org/en/library/bible/nwt/books/ruth/1/"]')!==null)));
   // Start an actual native multiple choice question.
   await page.evaluate(()=>{if(typeof focusHome==='function')focusHome();document.getElementById('home-trivia').click();if(typeof bu34Start==='function')bu34Start('quick')});
   await page.waitForFunction(()=>!!document.querySelector('#bu34-trivia:not([hidden]) #bu34-body [data-answer]')&&!!document.querySelector('#bu-james-quiz-bar'),{timeout:15000});
   const beforeQuiz=await page.evaluate(()=>window.BUJamesReturnLoopV1.inspect());
   await page.evaluate(()=>{
    const answer=bu34Quiz.items[bu34Quiz.step].correct;
    document.querySelector('#bu34-body [data-answer="'+answer+'"]').click();
   });
   const afterCorrect=await page.evaluate(()=>({
    state:window.BUJamesReturnLoopV1.inspect(),nativeAnswered:bu34Quiz.answered
   }));
   assert(afterCorrect.nativeAnswered,'Native Trivia scoring must still receive the real answer');
   assert.equal(afterCorrect.state.chain,beforeQuiz.chain+1);
   assert(afterCorrect.state.pot>0);
   const pot=afterCorrect.state.pot;
   await page.evaluate(()=>window.BUJamesReturnLoopV1.testActions.bank());
   const banked=await page.evaluate(()=>window.BUJamesReturnLoopV1.inspect());
   assert.equal(banked.pot,0);assert.equal(banked.chain,0);assert.equal(banked.balance,afterCorrect.state.balance+pot);
   // An insured mistake must preserve both the pot and chain but cost a life.
   await page.evaluate(()=>window.BUJamesReturnLoopV1.testActions.correct());
   await page.evaluate(()=>window.BUJamesReturnLoopV1.testActions.insurance());
   const preWrong=await page.evaluate(()=>window.BUJamesReturnLoopV1.inspect());
   await page.evaluate(()=>window.BUJamesReturnLoopV1.testActions.wrong());
   const postWrong=await page.evaluate(()=>window.BUJamesReturnLoopV1.inspect());
   assert.equal(postWrong.lives,preWrong.lives-1);
   assert.equal(postWrong.chain,preWrong.chain);
   assert.equal(postWrong.pot,preWrong.pot);
   assert.equal(postWrong.insurance,preWrong.insurance-1);
   await page.evaluate(()=>window.BUJamesReturnLoopV1.testActions.wrong());
   const lost=await page.evaluate(()=>window.BUJamesReturnLoopV1.inspect());
   assert.equal(lost.chain,0);assert.equal(lost.pot,0);
   assert.equal(lost.lives,3);
   assert(lost.refillAt>Date.now()-30000);
   // Refill truly restores lives and charges TEST tokens.
   const beforeRefill=lost.balance;
   await page.evaluate(()=>window.BUJamesReturnLoopV1.testActions.refill());
   const refilled=await page.evaluate(()=>window.BUJamesReturnLoopV1.inspect());
   assert.equal(refilled.lives,5);assert.equal(refilled.balance,beforeRefill-75);
   assert.equal(refilled.refillAt,0);
   // Earn long-term milestones and a deterministic surprise after seven correct answers.
   await page.evaluate(()=>{for(let i=0;i<7;i++)window.BUJamesReturnLoopV1.testActions.correct()});
   const milestones=await page.evaluate(()=>window.BUJamesReturnLoopV1.inspect());
   assert(milestones.achievements.includes('streak:3'));
   assert(milestones.achievements.includes('streak:5'));
   assert(milestones.achievements.includes('surprise:7'));
   assert(milestones.pot>100);
   await page.evaluate(()=>window.BUJamesReturnLoopV1.testActions.bank());
   const beforeMastery=await page.evaluate(()=>window.BUJamesReturnLoopV1.inspect());
   assert(beforeMastery.balance>=240,'Milestone earnings must finance premium challenge');
   await page.evaluate(()=>window.BUJamesReturnLoopV1.testActions.buy('mastery'));
   await page.evaluate(()=>window.BUJamesReturnLoopV1.testActions.mastery());
   await page.evaluate(()=>{for(let i=0;i<5;i++)window.BUJamesReturnLoopV1.testActions.correct()});
   const mastered=await page.evaluate(()=>window.BUJamesReturnLoopV1.inspect());
   assert(mastered.owned.includes('mastery'));
   assert(!mastered.mastery.active,'Mastery completes after five correct');
   assert.equal(mastered.mastery.awarded.length,1);
   // Refresh persistence and canonical money untouched (except native Trivia's normal awards).
   const nativeAfter=await page.evaluate(keys=>keys.map(k=>localStorage.getItem(k)),KEYS);
   assert.deepEqual(nativeAfter.slice(2),init.native.slice(2),'New shop must never modify wheel entitlements');
   await page.reload({waitUntil:'domcontentloaded',timeout:120000});
   await page.waitForSelector('#home-books',{timeout:60000});
   await page.addScriptTag({url:base+'james-return-loop-test-v1.js'});
   await page.waitForFunction(()=>window.BUJamesReturnLoopV1?.inspect?.().owned.includes('books'),{timeout:10000});
   const persisted=await page.evaluate(()=>window.BUJamesReturnLoopV1.inspect());
   assert.deepEqual(persisted.owned,mastered.owned);
   assert.deepEqual(persisted.mastery.awarded,mastered.mastery.awarded);
   assert.equal(persisted.lives,5);
   assert.equal(persisted.balance,mastered.balance);
   assert.deepEqual(errors,[],'No JavaScript page errors: '+JSON.stringify(errors));
   console.log('PASS_JAMES_'+vp.width,JSON.stringify({books:true,cards:true,streak:true,bank:true,lives:true,insured:true,mastery:true,persistent:true}));
   await ctx.close();
  }
 }catch(e){console.error('FAIL_JAMES_RETURN_LOOP',e.stack||e);process.exitCode=1}
 finally{await browser?.close()}
})();

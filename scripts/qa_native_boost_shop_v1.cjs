/* Native Booster Shop V1 – TEST-only QA on real mobile browser.
 * The QA injects the draft module before the HOME loader is enabled,
 * so a failing integration cannot reach players. */
const p=require('puppeteer-core');
const assert=require('node:assert/strict');
const {execSync}=require('child_process');
const bin=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const base='http://127.0.0.1:8899/';
const ls=['bible-unfolded-rewards-v17','bible-unfolded-rewards-v17-recovery-v3811',
 'bible-unfolded-wheel-ownership-v3825','bible-unfolded-wheel-ownership-v3825-backup'];
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function state(page){return page.evaluate((keys)=>({
  preview:window.BUNativeBoostShop.preview(),
  native:keys.map(k=>localStorage.getItem(k))
}),ls)}
(async()=>{
 let browser;
 try{
  browser=await p.launch({headless:true,executablePath:bin,args:['--no-sandbox','--disable-setuid-sandbox']});
  for(const viewport of [{width:390,height:705,isMobile:true,hasTouch:true,deviceScaleFactor:2},
                         {width:832,height:384,isMobile:true,hasTouch:true,deviceScaleFactor:2}]){
    const ctx=await browser.createBrowserContext(),page=await ctx.newPage(),errs=[];
    await page.setViewport(viewport);page.on('pageerror',e=>errs.push(e.message));
    await page.goto(base+'index.html',{waitUntil:'domcontentloaded',timeout:120000});
    await page.waitForSelector('#home-rewards',{timeout:60000});
    await page.addStyleTag({url:base+'native-boost-shop-test-v1.css'});
    await page.addScriptTag({url:base+'native-boost-shop-test-v1.js'});
    await page.waitForFunction(()=>!!window.BUNativeBoostShop&&!!document.querySelector('#bu-native-boosters'),{timeout:10000});
    const before=await state(page);
    const initial=await page.evaluate(()=>({homeCards:[...document.querySelectorAll('#home .cinematic-cards button')].map(x=>x.id),
     storeCount:document.querySelectorAll('#bu-native-boosters .bu-boost-item').length,
     shopParent:document.getElementById('bu-native-boosters')?.parentElement?.className}));
    assert(!initial.homeCards.some(x=>x.startsWith('bu-arcade')||x.startsWith('bu-engage')),'Rejected bonus game must remain absent');
    assert.equal(initial.storeCount,5);assert.equal(initial.shopParent,'hub-scroll reward-scroll');
    await page.evaluate(()=>document.getElementById('home-rewards').click());
    await page.waitForFunction(()=>!document.getElementById('rewards').hidden,{timeout:8000});
    const existing=await page.evaluate(()=>[...document.querySelectorAll('#reward-products .reward-product strong')].map(x=>x.textContent));
    assert(existing.includes('Eden Garden Portrait')&&existing.includes('Golden Puzzle Wheel')&&existing.includes('Ocean Glow Wheel'),
      'Native rewards must remain intact');
    await page.evaluate(()=>document.getElementById('bu-native-boosters').scrollIntoView({block:'start'}));
    await page.screenshot({path:'/tmp/BU-NATIVE-BOOST-'+viewport.width+'-shop.png'});
    // Purchase three functional boosts in the original Rewards screen.
    for(const id of ['fifty','shield','letter'])
     await page.evaluate(id=>document.querySelector('[data-boost-buy="'+id+'"]').click(),id);
    let bought=await state(page);
    assert.equal(bought.preview.inventory.fifty,1);
    assert.equal(bought.preview.inventory.shield,1);
    assert.equal(bought.preview.inventory.letter,1);
    assert.equal(bought.preview.tokens,before.preview.tokens-110);
    assert.deepEqual(bought.native,before.native,'TEST purchases cannot touch actual saved currency');
    await page.evaluate(()=>{document.querySelector('#bu-boost-celebration')?.remove();focusHome()});
    await page.evaluate(()=>document.getElementById('home-trivia').click());
    await wait(350);
    await page.evaluate(()=>{
      if(typeof bu34Start==='function')bu34Start('quick');
      const t=document.getElementById('bu34-trivia');
      if(t){t.hidden=false;document.getElementById('home').hidden=true;document.getElementById('rewards').hidden=true}
    });
    await page.waitForFunction(()=>!!document.querySelector('#bu-boost-trivia-launch')&&!!document.querySelector('#bu34-body [data-answer]'),{timeout:8000});
    const layout=await page.evaluate(()=>{
      const btn=document.getElementById('bu-boost-trivia-launch'),r=btn.getBoundingClientRect();
      const native=document.querySelector('#bu34-body [data-answer]'),n=native.getBoundingClientRect();
      return {button:{x:r.x,y:r.y,w:r.width,h:r.height},answer:{x:n.x,y:n.y,w:n.width,h:n.height},viewport:{w:innerWidth,h:innerHeight}};
    });
    console.log('BOOST_TRIVIA_LAYOUT_'+viewport.width,JSON.stringify(layout));
    assert(layout.button.w>=30&&layout.button.h>=25);
    await page.evaluate(()=>document.querySelector('#bu-boost-trivia-launch').click());
    await page.waitForSelector('#bu-boost-popover [data-power-act=fifty]');
    await page.screenshot({path:'/tmp/BU-NATIVE-BOOST-'+viewport.width+'-trivia.png'});
    await page.evaluate(()=>document.querySelector('#bu-boost-popover [data-power-act=fifty]').click());
    const tested50=await page.evaluate(()=>{
      const answers=[...document.querySelectorAll('#bu34-body [data-answer]')];
      return {eliminated:answers.filter(x=>x.classList.contains('bu-boost-erased')).map(x=>+x.dataset.answer),
        correct:bu34Quiz.items[bu34Quiz.step].correct,stock:window.BUNativeBoostShop.preview().inventory.fifty,
        unanswered:!bu34Quiz.answered};
    });
    assert.equal(tested50.eliminated.length,2);
    assert(!tested50.eliminated.includes(tested50.correct));
    assert.equal(tested50.stock,0);assert(tested50.unanswered);
    await page.evaluate(()=>{
      document.querySelector('#bu-boost-celebration')?.remove();
      document.querySelector('#bu-boost-trivia-launch').click();
      document.querySelector('#bu-boost-popover [data-power-act=shield]').click();
    });
    const shieldOn=await page.evaluate(()=>document.querySelector('#bu-boost-trivia-launch').classList.contains('armed'));
    assert(shieldOn);
    const shieldWrong=await page.evaluate(()=>{
      const correct=bu34Quiz.items[bu34Quiz.step].correct;
      const wrong=[...document.querySelectorAll('#bu34-body [data-answer]')].find(b=>!b.disabled&&+b.dataset.answer!==correct);
      if(!wrong)return false;
      wrong.click();
      return !bu34Quiz.answered;
    });
    assert(shieldWrong,'Second Chance must prevent native question loss');
    const afterShield=await state(page);
    assert.equal(afterShield.preview.inventory.shield,0);
    assert.deepEqual(afterShield.native,before.native,'Boost usage must not change real wallet');
    await page.evaluate(()=>{
      document.querySelector('#bu-boost-celebration')?.remove();
      const correct=bu34Quiz.items[bu34Quiz.step].correct;
      document.querySelector('#bu34-body [data-answer="'+correct+'"]').click();
    });
    assert(await page.evaluate(()=>bu34Quiz.answered&&bu34Quiz.score===1),
     'The correct answer must still run through native Bible Trivia scoring');
    console.log('TRIVIA_POWERUP_PASS_'+viewport.width);
    // Native Trivia may legitimately award Achievement Points on the correct
    // answer. Snapshot the actual post-game wallet before testing Story Lens.
    const afterLegitimatePlay=await state(page);
    // Read-only Story source + an actual use of a stored Letter Lens on legacy Story.
    await page.evaluate(()=>{
      // Enter through the ACTUAL native chapter controller, not a stale
      // hidden screen with manually replaced mode/stage variables.
      focusHome();
      startChapter('genesis',true,true);
    });
    await wait(1700);
    await page.evaluate(()=>window.BUNativeBoostShop.testActions.refresh());
    const story=await page.evaluate(()=>({
      source:typeof BEATS==='object'?BEATS[0]?.word:null,
      mounted:!!document.querySelector('#bu-boost-story-launch'),
      text:document.querySelector('#play')?.textContent.slice(0,120)
    }));
    console.log('BOOST_STORY_'+viewport.width,JSON.stringify(story));
    console.log('STORY_DEBUG_'+viewport.width,JSON.stringify(await page.evaluate(()=>{
      const ids=['play','journey','bu3857-screen','scene-hint','hint','bu-boost-story-launch'];
      return {mode,activeBook,stage,currentWord:BEATS?.[stage]?.word, boostInventory:window.BUNativeBoostShop.preview().inventory,
        bu3857State:typeof bu3857State==='object'?JSON.stringify(bu3857State)?.slice(0,160):null,
        screens:ids.map(id=>{const e=document.getElementById(id),r=e?.getBoundingClientRect(),s=e&&getComputedStyle(e);return {id,exists:!!e,hidden:e?.hidden,rect:r?[r.x,r.y,r.width,r.height]:null,display:s?.display,parent:e?.parentElement?.id}})};
    })));
    assert(story.source&&story.source.length>2,'A native Story answer must be available');
    assert(story.mounted,'Letter Lens boost must mount in native Story when answer is available');
    await page.evaluate(()=>document.querySelector('#bu-boost-story-launch').click());
    await page.evaluate(()=>document.querySelector('#bu-boost-popover [data-power-act=letter]').click());
    await page.waitForSelector('.bu-boost-lens-message');
    const lens=await page.evaluate(()=>({
      text:document.querySelector('.bu-boost-lens-message')?.textContent,
      stock:window.BUNativeBoostShop.preview().inventory.letter,
      real:['bible-unfolded-rewards-v17','bible-unfolded-wheel-ownership-v3825'].map(k=>localStorage.getItem(k))
    }));
    assert(lens.text.includes(story.source.slice(0,2).split('').join('  ·  ')),'Lens must reveal the true current native Story word');
    assert.equal(lens.stock,0);
    assert.equal(lens.real[0],afterLegitimatePlay.native[0]);assert.equal(lens.real[1],afterLegitimatePlay.native[2]);
    await page.evaluate(()=>{document.querySelector('.bu-boost-lens-message button').click()});
    // A real earned marker produces one star; every five gives a free functional booster.
    const beforeMilestone=await page.evaluate(()=>window.BUNativeBoostShop.preview());
    await page.evaluate(()=>{
      for(let i=0;i<5;i++)economy.earned.push('trivia-qa-verified-new-'+i);
    });
    await page.waitForFunction(()=>window.BUNativeBoostShop.preview().granted>=1,{timeout:9000});
    const gifted=await state(page);
    assert(gifted.preview.stars>=beforeMilestone.stars+5,'Five new accomplishments must increase stars by five');
    assert.equal(gifted.preview.inventory.fifty,1,'Five authentic new events must unlock free functional inventory');
    await page.reload({waitUntil:'domcontentloaded',timeout:120000});
    await page.addStyleTag({url:base+'native-boost-shop-test-v1.css'});
    await page.addScriptTag({url:base+'native-boost-shop-test-v1.js'});
    await page.waitForFunction(()=>!!window.BUNativeBoostShop,{timeout:8000});
    const reload=await state(page);
    assert.equal(reload.preview.tokens,gifted.preview.tokens);
    assert.equal(reload.preview.inventory.fifty,gifted.preview.inventory.fifty);
    assert.equal(reload.preview.stars,gifted.preview.stars);
    assert.deepEqual(reload.native,afterLegitimatePlay.native,'After refresh canonical LIVE-safe keys must reflect only legitimate gameplay');
    assert.equal(errs.length,0,'No runtime page errors: '+JSON.stringify(errs));
    console.log('PASS_Native_Boosters_'+viewport.width+' checkout, gameplay effects, free booster, persistence and LIVE-wallet protection');
    await ctx.close();
  }
 }catch(e){console.error('FAIL_NATIVE_BOOST',e.stack||e);process.exitCode=1}
 finally{await browser?.close()}
})();

/* TEST-only reproduction from the owner's November 9 phone feedback.
 * Reproduces real tap->back->tap, Trivia browser-refresh navigation,
 * and inspects during-game versus completion announcer calls. */
const puppeteer=require('puppeteer-core');
const {execSync}=require('node:child_process');
const assert=require('node:assert/strict');
const chrome=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
(async()=>{
 const browser=await puppeteer.launch({headless:true,executablePath:chrome,
 args:['--no-sandbox','--disable-setuid-sandbox','--autoplay-policy=no-user-gesture-required']});
 try{
  const page=await browser.newPage();page.setDefaultTimeout(45000);
  page.on('pageerror',e=>console.log('PAGE_JS_ERROR',e.message.slice(0,200)));
  await page.setViewport({width:390,height:705,deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await page.goto('http://127.0.0.1:8902/index.html',{waitUntil:'domcontentloaded',timeout:120000});
  await page.waitForFunction(()=>window.BUWTNativeShell?.nativeReady?.(),{timeout:60000});
  function state(){return page.evaluate(()=>{
   const screens=[...document.querySelectorAll('.screen')].filter(x=>!x.hidden&&getComputedStyle(x).display!=='none').map(x=>x.id);
   return {url:location.href,hash:location.hash,active:window.BUWTNativeShell?.active?.(),
    screens,homeVisible:document.getElementById('home')?.hidden===false,
    rootStyle:getComputedStyle(document.getElementById('home')).display};
  })}
  await page.evaluate(()=>document.getElementById('home-cross').click());
  await page.waitForFunction(()=>window.BUWTNativeShell?.active?.()&&document.querySelector('#bu-wt-native-game')?.contentWindow?.BUWTUnifiedMenu,{timeout:60000});
  console.log('FIRST_LAUNCH',JSON.stringify(await state()));
  const savedBeforeRefresh=await page.evaluate(()=>localStorage.getItem('bu-visual-lab-wordtrails-next-v1'));
  await page.reload({waitUntil:'domcontentloaded',timeout:120000});
  await page.waitForFunction(()=>window.BUWTNativeShell?.nativeReady?.(),{timeout:60000});
  const refreshedTrail=await state();
  const savedAfterRefresh=await page.evaluate(()=>localStorage.getItem('bu-visual-lab-wordtrails-next-v1'));
  console.log('WORD_TRAILS_BROWSER_REFRESH',JSON.stringify(refreshedTrail));
  assert(refreshedTrail.homeVisible&&!refreshedTrail.active&&refreshedTrail.hash==='','Word Trails refresh should return to home');
  assert.equal(savedAfterRefresh,savedBeforeRefresh,'Refresh must never delete saved crossword data');
  await page.evaluate(()=>document.getElementById('home-cross').click());
  await page.waitForFunction(()=>window.BUWTNativeShell?.active?.()&&document.getElementById('bu-wt-native-game')?.contentWindow?.BUWTUnifiedMenu,{timeout:60000});
  await page.evaluate(()=>document.querySelector('#bu-wt-native-game').contentWindow.document.querySelector('#app .back').click());
  await page.waitForFunction(()=>!window.BUWTNativeShell.active());
  console.log('AFTER_CHILD_BACK',JSON.stringify(await state()));
  await page.evaluate(()=>document.getElementById('home-cross').click());
  await new Promise(r=>setTimeout(r,1150));
  const afterReenter=await state();
  console.log('SECOND_CARD_LAUNCH',JSON.stringify(afterReenter));
  assert(afterReenter.active,'After Back, tapping the same homepage card must reopen Word Trails');
  console.log('REENTRY_FIXED','Native Word Trails card successfully relaunches.');
  await page.evaluate(()=>window.BUWTNativeShell?.close?.());

  await page.goto('http://127.0.0.1:8902/index.html',{waitUntil:'domcontentloaded',timeout:120000});
  await page.waitForFunction(()=>window.BUWTNativeShell?.nativeReady?.(),{timeout:60000});
  const triviaPresent=await page.evaluate(()=>!!document.getElementById('home-trivia'));
  assert(triviaPresent,'Expected native Bible Trivia home card');
  await page.evaluate(()=>document.getElementById('home-trivia').click());
  await new Promise(r=>setTimeout(r,350));
  console.log('TRIVIA_BEFORE_RELOAD',JSON.stringify(await state()));
  await page.reload({waitUntil:'domcontentloaded',timeout:120000});
  await page.waitForFunction(()=>window.BUWTNativeShell?.nativeReady?.(),{timeout:60000});
  await new Promise(r=>setTimeout(r,400));
  console.log('TRIVIA_AFTER_RELOAD',JSON.stringify(await state()));

  await page.goto('http://127.0.0.1:8902/index.html',{waitUntil:'domcontentloaded',timeout:120000});
  await page.waitForFunction(()=>window.BUWTNativeShell?.nativeReady?.(),{timeout:60000});
  await page.evaluate(()=>window.BUWTNativeShell.launch());
  await page.waitForFunction(()=>document.getElementById('bu-wt-native-game')?.contentWindow?.BUWTAnnouncer);
  const voice=await page.evaluate(()=>{
   let calls=[];
   const original=window.bu381Play;
   window.bu381Play=(phrase,opts)=>{calls.push({phrase,opts});return true};
   const child=document.getElementById('bu-wt-native-game').contentWindow;
   try{
    child.BUWTAnnouncer.play('youre_on_a_roll');
    child.BUWTAnnouncer.play('another_discovery');
    child.BUWTAnnouncer.play('chapter_complete',{milestone:true});
    return {calls,voicePrefs:window.BUWTNativeShell.voicePrefs(),childVoice:child.BUWTAnnouncer.getMode(),
      nativeFn:typeof original};
   }finally{window.bu381Play=original}
  });
  console.log('ANNOUNCER_BRIDGE_CALLS',JSON.stringify(voice));
  const spoken=await page.evaluate(()=>{
   const calls=[],prior=window.bu381Play;
   window.bu381Play=(phrase,opts)=>{calls.push({phrase,opts});return true};
   const f=document.getElementById('bu-wt-native-game').contentWindow.document;
   function solve(word){
    const used=new Set();
    for(const c of word){
      const button=[...f.querySelectorAll('.wheel-letter')].find(b=>b.textContent===c&&!used.has(Number(b.dataset.letterIndex)));
      if(!button)throw Error('Cannot tap '+c+' in '+word);
      used.add(Number(button.dataset.letterIndex));button.click();
    }
    f.getElementById('submit').click();
   }
   try{solve('ANTIC');solve('TACO');return {calls,solved:f.getElementById('solved-count').textContent}}
   finally{window.bu381Play=prior}
  });
  console.log('ANNOUNCER_ACTUAL_PUZZLE_PROGRESS',JSON.stringify(spoken));
  assert(spoken.solved.startsWith('2 /'),'Two real crossword words should solve');
  assert(spoken.calls.some(c=>c.opts?.milestone===true&&c.phrase==='excellent_thinking'),
    'Progress must send a sparse native original-voice encouragement before level ends');
  await page.close();
 }catch(e){console.error('PHONE_FEEDBACK_REPRO_ERROR',e.stack||e);process.exitCode=1}
 finally{await browser.close()}
})();
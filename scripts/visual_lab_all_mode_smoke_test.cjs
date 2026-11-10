/* Visual Lab all-mode smoke regression after shared Word Trails integration.
   Does not write new gameplay state or touch the LIVE repository. */
const puppeteer=require('puppeteer-core');
const assert=require('node:assert/strict');
const {execSync}=require('node:child_process');
const BIN=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
(async()=>{
 const browser=await puppeteer.launch({headless:true,executablePath:BIN,args:['--no-sandbox','--disable-setuid-sandbox','--autoplay-policy=no-user-gesture-required']});
 try{
  for(const vp of [{width:390,height:705,isMobile:true,hasTouch:true,deviceScaleFactor:2},
                   {width:832,height:384,isMobile:true,hasTouch:true,deviceScaleFactor:2}]){
   const page=await browser.newPage();page.setDefaultTimeout(45000);
   const errors=[];page.on('pageerror',e=>errors.push(e.message.slice(0,180)));
   await page.setViewport(vp);
   await page.goto('http://127.0.0.1:8895/index.html',{waitUntil:'domcontentloaded',timeout:120000});
   await page.waitForFunction(()=>window.BUWTNativeShell?.nativeReady?.()&&window.BUPlatformSaves?.bound?.(),{timeout:60000});
   const initial=await page.evaluate(()=>({
     home:!!document.getElementById('home'),focusHome:typeof window.focusHome,
     rewardsCore:!!window.BUPlatformRewards?.hasNativeHost?.(),
     standaloneMenu:!!document.getElementById('wt-unified-menu'),
     settings:!!document.getElementById('settings-dialog'),
     nav:!!document.getElementById('game-menu'),
     save:window.BUPlatformSaves?.version,
     cards:[...document.querySelectorAll('#home button[id^="home-"]')].map(x=>x.id)
   }));
   console.log('ALL_MODE_ROOT_'+vp.width,JSON.stringify(initial));
   assert(initial.home&&initial.settings&&initial.nav&&initial.save==='2.0.0-test');
   assert(initial.rewardsCore,'All modes must see the canonical wallet host');
   assert(!initial.standaloneMenu,'Root should never host Word Trails duplicate dialog');
   assert(initial.focusHome==='function','Native navigation must be available');

   // Cover each native homepage destination with its original click handler.
   const ids=['home-story','home-watch','home-builder','home-books','home-journey','home-gallery','home-shop','home-help'];
   for(const id of ids){
     const present=await page.evaluate(id=>!!document.getElementById(id),id);
     if(!present)continue;
     await page.evaluate(()=>{
       window.BUWTNativeShell?.close?.();
       window.closeDialog?.();window.closeMenu?.();window.focusHome();
     });
     const before=await page.evaluate(()=>({
       active:[...document.querySelectorAll('.screen')].filter(e=>!e.hidden&&getComputedStyle(e).display!=='none').map(e=>e.id).slice(0,8),
       help:!document.getElementById('help-dialog')?.hidden
     }));
     await page.evaluate(id=>document.getElementById(id).click(),id);
     await new Promise(r=>setTimeout(r,200));
     const result=await page.evaluate(()=>({
       active:[...document.querySelectorAll('.screen')].filter(e=>!e.hidden&&getComputedStyle(e).display!=='none').map(e=>e.id).slice(0,8),
       help:!document.getElementById('help-dialog')?.hidden,
       frame:!!window.BUWTNativeShell?.active?.(),
       root:location.pathname,hash:location.hash,
       screenVisible:[...document.querySelectorAll('section,[role="dialog"],main')].filter(e=>{const r=e.getBoundingClientRect();const st=getComputedStyle(e);return r.width>10&&r.height>10&&st.display!=='none'&&st.visibility!=='hidden'}).slice(0,20).map(e=>({id:e.id,cls:String(e.className).slice(0,65),tag:e.tagName,role:e.getAttribute('role')})),
       builderIds:[...document.querySelectorAll('[id]')].filter(e=>/builder|word.build|wb-/i.test(e.id)).slice(0,25).map(e=>({id:e.id,hidden:e.hidden,display:getComputedStyle(e).display}))
     }));
     console.log('MODE_'+vp.width+'_'+id,JSON.stringify({before,result}));
     assert(result.root.endsWith('/index.html'),'Native card must not navigate to a nested copy of homepage');
     assert(!result.frame,'Non-Word-Trails modes must not open the Word Trails overlay');
     if(id==='home-books'){
      // Owner-approved James TEST economy gates Bible Books on the first visit.
      const gate=await page.evaluate(()=>({
       visible:!!document.querySelector('#bu-james-gate[role="dialog"]'),
       price:document.querySelector('#bu-james-gate')?.textContent||''
      }));
      assert(gate.visible&&gate.price.includes('180'),'Unowned Bible Books must show a functional token gate');
      await page.evaluate(()=>document.querySelector('#bu-james-gate [data-buj-action="unlock-books"]').click());
      await new Promise(r=>setTimeout(r,320));
      const unlocked=await page.evaluate(()=>({
       owned:window.BUJamesReturnLoopV1?.inspect?.().owned.includes('books'),
       gate:!!document.querySelector('#bu-james-gate'),
       active:[...document.querySelectorAll('.screen')].filter(e=>!e.hidden&&getComputedStyle(e).display!=='none').map(e=>e.id)
      }));
      console.log('BIBLE_BOOKS_UNLOCK_'+vp.width,JSON.stringify(unlocked));
      assert(unlocked.owned&&!unlocked.gate,'Token purchase must unlock Bible Books in TEST');
      assert(unlocked.active.some(x=>x!=='home'),'Unlocked Bible Books must open native game');
     }
     else if(id==='home-builder')assert(result.screenVisible.some(x=>/build|wb-/i.test(x.id+' '+x.cls))||result.builderIds.some(x=>x.display!=='none'&&!x.hidden),'Builder must present a visible game screen');
     else assert(result.help||result.active.some(x=>x!=='home'),'Native mode card must open a real destination: '+id);
   }
   await page.evaluate(()=>{
     window.closeDialog?.();window.closeMenu?.();window.focusHome();
   });
   await page.evaluate(()=>document.getElementById('home-cross').click());
   await page.waitForFunction(()=>window.BUWTNativeShell?.active?.()&&
     document.getElementById('bu-wt-native-game')?.contentWindow?.BUWTUnifiedMenu,{timeout:60000});
   const trails=await page.evaluate(()=>{
     const f=document.getElementById('bu-wt-native-game').contentWindow.document;
     return {menuInParent:!!document.querySelector('#game-menu'),localMenuOpen:!!f.getElementById('wt-unified-menu')?.open,
       scene:f.getElementById('scene-title')?.textContent,bodyOverflow:f.body.scrollHeight-f.defaultView.innerHeight};
   });
   console.log('MODE_'+vp.width+'_word-trails',JSON.stringify(trails));
   assert(trails.menuInParent&&!trails.localMenuOpen&&trails.bodyOverflow<=1);
   await page.evaluate(()=>window.BUWTNativeShell.close());
   console.log('ALL_MODE_PAGE_ERRORS_'+vp.width,JSON.stringify(errors.slice(0,6)));
   assert.equal(errors.length,0,'Mode navigation must not introduce unhandled page errors');
   await page.close();
  }
  console.log('PASS all native home modes + shared Word Trails host in portrait and landscape');
 }catch(e){console.error('FAIL_ALL_MODES',e.stack||e);process.exitCode=1}
 finally{await browser.close()}
})();
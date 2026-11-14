// Visual Lab only. The real homepage runs Word Trails in its native overlay.
const puppeteer=require('puppeteer-core');
const assert=require('node:assert/strict');
const {execSync}=require('node:child_process');
const chrome=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
(async()=>{
  const browser=await puppeteer.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-setuid-sandbox','--autoplay-policy=no-user-gesture-required']});
  let failures=0;
  try{
    for(const viewport of [{width:390,height:705,isMobile:true,hasTouch:true,deviceScaleFactor:2},{width:832,height:384,isMobile:true,hasTouch:true,deviceScaleFactor:2}]){
      const page=await browser.newPage();
      page.setDefaultTimeout(30000);
      const errors=[];
      page.on('pageerror',e=>errors.push(e.message.slice(0,180)));
      await page.setViewport(viewport);
      // Trace writes to the legacy shared-audio record without modifying app behavior.
      await page.evaluateOnNewDocument(()=>{
        window.__qaAudioShadowWrites=[];
        const original=Storage.prototype.setItem;
        Storage.prototype.setItem=function(k,v){
          if(k==='bu-platform-audio-preferences-v1'){
            window.__qaAudioShadowWrites.push({
              key:k,
              value:String(v).slice(0,250),
              stack:String(new Error().stack).slice(0,900)
            });
          }
          return original.call(this,k,v);
        };
      });
      await page.goto('http://127.0.0.1:8891/index.html',{waitUntil:'domcontentloaded',timeout:120000});
      await page.waitForFunction(()=>!!window.BUWTNativeShell?.nativeReady?.(),{timeout:120000});
      const pre=await page.evaluate(()=>({hasNativeMenu:!!document.querySelector('#game-menu'),hasSettings:!!document.querySelector('#settings-dialog'),rootMenu:typeof window.openMenu,rootSettings:typeof window.openDialog,hasHost:!!window.BUWTNativeShell,home:!!document.getElementById('home-cross')}));
      console.log('NATIVE_ROOT_READY',JSON.stringify({viewport:viewport.width+'x'+viewport.height,...pre}));
      assert(pre.hasNativeMenu&&pre.hasSettings&&pre.home&&pre.hasHost);
      // Exercise the real home card interception rather than calling launch directly.
      await page.evaluate(()=>document.getElementById('home-cross').click());
      await page.waitForFunction(()=>window.BUWTNativeShell?.active?.()&&!!document.getElementById('bu-wt-native-game')?.contentWindow?.BUWTUnifiedMenu,{timeout:60000});
      const initial=await page.evaluate(()=>{
        const child=document.getElementById('bu-wt-native-game').contentWindow;
        const frame=document.getElementById('bu-wt-native-game').getBoundingClientRect();
        return {url:location.href,hasFrame:!!child,hasNativeHost:!!child.parent.BUWTNativeShell,
          hasOwnFallback:!!child.document.getElementById('wt-unified-menu'),
          gameplayLevel:child.document.getElementById('level-label')?.textContent,
          rootMenuOpen:document.getElementById('game-menu')?.className,
          frameRect:{x:frame.x,y:frame.y,width:frame.width,height:frame.height},
          childScroll:child.document.body.scrollHeight-child.innerHeight,
          childAudio:child.BUWTPolish?.state?.(),
          parentAudio:window.BUWTNativeShell.audioPrefs(),
          nativeVoiceType:typeof window.bu381Play
        };
      });
      console.log('WORD_TRAILS_NATIVE_LAUNCH',JSON.stringify({viewport:viewport.width+'x'+viewport.height,...initial}));
      assert(initial.hasFrame&&initial.hasNativeHost);
      assert(initial.frameRect.width>=viewport.width-1);
      assert(initial.frameRect.height>=viewport.height-1);
      // The menu must be the actual original #game-menu, not Word Trails imitation.
      await page.evaluate(()=>document.getElementById('bu-wt-native-game').contentWindow.BUWTUnifiedMenu.open());
      const menu=await page.evaluate(()=>{
        const main=document.getElementById('game-menu');
        const child=document.getElementById('bu-wt-native-game').contentWindow.document;
        return {nativeMenuHidden:main.hidden,mainClass:main.className,mainZ:getComputedStyle(main).zIndex,
          frameZ:getComputedStyle(document.getElementById('bu-wt-native-shell')).zIndex,
          localFallbackOpen:child.getElementById('wt-unified-menu').open,
          nativeMenuButtons:[...main.querySelectorAll('[data-nav]')].map(x=>x.dataset.nav)};
      });
      console.log('ORIGINAL_MENU_OPEN',JSON.stringify(menu));
      assert.equal(menu.localFallbackOpen,false,'Standalone duplicate must not open within native host');
      assert(menu.nativeMenuButtons.includes('settings'),'Native Settings must be present');
      assert(Number(menu.mainZ)>Number(menu.frameZ),'Native menu must overlay iframe');
      // Settings is native root dialog and controls drive child without duplicate storage.
      await page.evaluate(()=>document.querySelector('#game-menu [data-nav="settings"]').click());
      const before=await page.evaluate(()=>{
        const child=document.getElementById('bu-wt-native-game').contentWindow;
        return {settingsHidden:document.getElementById('settings-dialog').hidden,
          settingsZ:getComputedStyle(document.getElementById('settings-dialog')).zIndex,
          hostActive:window.BUWTNativeShell.active(),
          pref:child.BUWTPolish.state()};
      });
      console.log('ORIGINAL_SETTINGS_OPEN',JSON.stringify(before));
      assert.equal(before.settingsHidden,false,'Real native settings must open');
      assert(before.hostActive,'Settings should not unload Word Trails');
      // Change one native setting and prove that exact child engine reads it.
      const sync=await page.evaluate(async()=>{
        const feelBefore=localStorage.getItem('bu-wt-next-feel-v2');
        const mirroredBefore=localStorage.getItem('bu-platform-audio-preferences-v1');
        const node=document.getElementById('setting-sfx'),original=node.checked;
        node.checked=!original;
        node.dispatchEvent(new Event('change',{bubbles:true}));
        await new Promise(resolve=>setTimeout(resolve,45));
        const child=document.getElementById('bu-wt-native-game').contentWindow;
        const during=child.BUWTPolish.state().sfx;
        node.checked=original;node.dispatchEvent(new Event('change',{bubbles:true}));
        await new Promise(resolve=>setTimeout(resolve,45));
        return {nativeToggled:!original,childDuring:during,restored:child.BUWTPolish.state().sfx===original,
          feelUnchanged:localStorage.getItem('bu-wt-next-feel-v2')===feelBefore,
          mirroredUnchanged:localStorage.getItem('bu-platform-audio-preferences-v1')===mirroredBefore,
          mirroredBefore,mirroredAfter:localStorage.getItem('bu-platform-audio-preferences-v1'),
          parentShadowWrites:window.__qaAudioShadowWrites?.slice(-5),
          childShadowWrites:child.__qaAudioShadowWrites?.slice(-5)};
      });
      console.log('NATIVE_AUDIO_PROPAGATION',JSON.stringify(sync));
      assert.equal(sync.childDuring,sync.nativeToggled);
      assert(sync.restored);
      assert(sync.feelUnchanged,'Native settings must not persist a duplicate Word Trails global audio snapshot');
      assert(sync.mirroredUnchanged,'Native settings must not write the old shared-audio shadow key');
      // Native selected announcer API, not child-generated imitation.
      const voice=await page.evaluate(()=>{
        const child=document.getElementById('bu-wt-native-game').contentWindow;
        const nativeAvailable=typeof window.bu381Play==='function';
        let called=0;
        if(nativeAvailable){
          const before=window.bu381Play;
          window.bu381Play=(...a)=>{called++;return true};
          try{child.BUWTAnnouncer.play('chapter_complete',{milestone:true})}finally{window.bu381Play=before}
        }
        return {nativeAvailable,delegated:called};
      });
      console.log('NATIVE_ANNOUNCER_DELEGATION',JSON.stringify(voice));
      assert(voice.nativeAvailable&&voice.delegated===1,'Announcer must call actual parent');
      // Close without changing the root's original screen/navigation.
      await page.evaluate(()=>window.BUWTNativeShell.close());
      const after=await page.evaluate(()=>({active:window.BUWTNativeShell.active(),frame:!!document.getElementById('bu-wt-native-game'),menu:!!document.getElementById('game-menu'),home:!!document.getElementById('home-cross')}));
      console.log('NATIVE_RETURN',JSON.stringify(after));
      assert(!after.active&&!after.frame&&after.home&&after.menu);
      // Back-arrow navigation must close the native shell, not navigate the iframe
      // to a second, nested copy of index.html.
      await page.evaluate(()=>window.BUWTNativeShell.launch());
      await page.waitForFunction(()=>document.getElementById('bu-wt-native-game')?.contentWindow?.BUWTUnifiedMenu);
      const roots=await page.evaluate(()=>({pauseAudio:typeof window.pauseAudio,syncMusic:typeof window.syncMusic,hash:location.hash}));
      await page.evaluate(()=>document.getElementById('bu-wt-native-game').contentWindow.document.querySelector('#app .back').click());
      const backArrow=await page.evaluate(()=>({active:window.BUWTNativeShell.active(),url:location.href,iframe:!!document.getElementById('bu-wt-native-game')}));
      console.log('REAL_ARROW_BACK',JSON.stringify({roots,backArrow}));
      assert.equal(backArrow.active,false,'In-game back must close the parent shell');
      assert.equal(backArrow.iframe,false,'No nested homepage may be created');
      await page.evaluate(()=>window.BUWTNativeShell.launch());
      await page.waitForFunction(()=>window.BUWTNativeShell.active());
      await page.evaluate(()=>history.back());
      await page.waitForFunction(()=>!window.BUWTNativeShell.active());
      console.log('BROWSER_BACK_CLOSES_GAME',viewport.width+'x'+viewport.height);
      if(errors.length)console.log('PAGE_ERRORS',JSON.stringify(errors.slice(0,12)));
      await page.close();
    }
    // Published page direct URLs must open the REAL root menu host, not an isolated
    // lookalike. ?native=1 forces this route in the localhost test server.
    const deep=await browser.newPage();deep.setDefaultTimeout(60000);
    await deep.setViewport({width:390,height:705,isMobile:true,hasTouch:true,deviceScaleFactor:2});
    await deep.goto('http://127.0.0.1:8891/experiments/word-trails-next-v1.html?native=1',{waitUntil:'domcontentloaded',timeout:120000});
    await deep.waitForFunction(()=>location.pathname.endsWith('/index.html')&&window.BUWTNativeShell?.active?.() &&
      !!document.getElementById('bu-wt-native-game')?.contentWindow?.BUWTUnifiedMenu,{timeout:60000});
    let link=await deep.evaluate(()=>({pathname:location.pathname,hash:location.hash,query:location.search,
      native:window.BUWTNativeShell.active(),menu:!!document.querySelector('#game-menu')}));
    console.log('PUBLISHED_DIRECT_LINK_REAL_NATIVE_HOST',JSON.stringify(link));
    assert(link.native&&link.menu&&link.hash==='#word-trails'&&!link.query.includes('wt_launch'));
    // The owner wants browser Refresh to go HOME even if Word Trails was open.
    // Progress remains in localStorage; only the route is reset.
    const saved=await deep.evaluate(()=>localStorage.getItem('bu-visual-lab-wordtrails-next-v1'));
    await deep.reload({waitUntil:'domcontentloaded',timeout:120000});
    await deep.waitForFunction(()=>window.BUWTNativeShell?.nativeReady?.()&&!window.BUWTNativeShell.active(),{timeout:60000});
    const afterRefresh=await deep.evaluate(()=>({url:location.href,hash:location.hash,
      home:!document.getElementById('home').hidden,
      saved:localStorage.getItem('bu-visual-lab-wordtrails-next-v1')}));
    assert(afterRefresh.home&&afterRefresh.hash==='');
    assert.equal(afterRefresh.saved,saved);
    console.log('ACTIVE_WORD_TRAILS_REFRESH_RETURNS_HOME',JSON.stringify({url:afterRefresh.url,home:afterRefresh.home}));
    await deep.evaluate(()=>document.getElementById('home-cross').click());
    await deep.waitForFunction(()=>window.BUWTNativeShell?.active?.()&&document.getElementById('bu-wt-native-game')?.contentWindow?.BUWTUnifiedMenu,{timeout:60000});
    await deep.evaluate(()=>document.getElementById('bu-wt-native-game').contentWindow.document.querySelector('#app .back').click());
    await deep.waitForFunction(()=>!window.BUWTNativeShell.active());
    await deep.reload({waitUntil:'domcontentloaded',timeout:120000});
    await deep.waitForFunction(()=>!!window.BUWTNativeShell?.nativeReady?.(),{timeout:60000});
    assert.equal(await deep.evaluate(()=>window.BUWTNativeShell.active()),false);
    console.log('EXITED_WORD_TRAILS_REFRESH_STAYS_HOME',await deep.evaluate(()=>location.href));
    await deep.close();

    // On the standalone QA-only route, test preferences must stay in Word Trails.
    // Never let the fallback UI overwrite a second pseudo-global audio record.
    const standalone=await browser.newPage();
    await standalone.setViewport({width:390,height:705,isMobile:true,hasTouch:true,deviceScaleFactor:2});
    await standalone.goto('http://127.0.0.1:8891/experiments/word-trails-next-v1.html?standalone=qa',
      {waitUntil:'domcontentloaded',timeout:120000});
    await standalone.waitForFunction(()=>!!window.BUWTMainSettings?.open&&!!window.BUWTPolish?.state,
      {timeout:60000});
    const fallback=await standalone.evaluate(()=>{
      const shared='bu-platform-audio-preferences-v1',local='bu-wt-next-feel-v2';
      const before=localStorage.getItem(shared),original=window.BUWTPolish.state().sfx;
      window.BUWTMainSettings.open();
      const input=document.getElementById('wt-native-sfx');
      input.checked=!original;input.dispatchEvent(new Event('change',{bubbles:true}));
      const newValue=window.BUWTPolish.state().sfx;
      const localValue=JSON.parse(localStorage.getItem(local)||'null')?.sfx;
      const globallyUnchanged=localStorage.getItem(shared)===before;
      return {newValue,localValue,globallyUnchanged,expected:!original};
    });
    assert.equal(fallback.newValue,fallback.expected);
    assert.equal(fallback.localValue,fallback.expected,'Standalone QA still saves its isolated FEEL key');
    assert(fallback.globallyUnchanged,'Standalone QA must not overwrite pseudo-global audio preferences');
    await standalone.close();
    console.log('PASS Word Trails single owner of global audio, isolated fallback settings, native voices/menu and return');

  }catch(e){failures++;console.error('NATIVE_SHELL_QA_FAILED',e.stack||e);process.exitCode=1}
  finally{await browser.close()}
})();

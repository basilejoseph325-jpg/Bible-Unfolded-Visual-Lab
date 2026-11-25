'use strict';
const {chromium,webkit}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const url=process.env.BU_FAMILY_SETUP_URL||'http://127.0.0.1:8932/index.html';
(async()=>{for(const engine of ['chromium','webkit'])for(const width of [320,430]){
 const b=await({chromium,webkit}[engine]).launch(engine==='chromium'?{executablePath:process.env.CHROME_BIN||'/usr/bin/chromium',args:['--no-sandbox']}:{headless:true});try{
 const c=await b.newContext({viewport:{width,height:width===320?568:932},hasTouch:true,isMobile:true});
 const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());
 const ready=async()=>{await p.waitForFunction(()=>window.BU_FAMILY_GATHERING_V1&&window.BUFreshMixNative&&window.BUPreviewStorageFence?.writerStatus().writable);if(await p.locator('#daily-close').isVisible())await p.locator('#daily-close').tap()};
 await p.goto(url,{waitUntil:'domcontentloaded'});await ready();await p.locator('#home-family').tap();await p.waitForSelector('#bu35-new[data-bu-fw-default-mode]');
 const baseline=await p.evaluate(()=>({records:Object.fromEntries(Object.entries(localStorage).filter(([k])=>/wallet|reward|trail|grant|economy|builder/.test(k))),prefs:{musicOn,sfxOn,musicVolume,sfxVolume}}));
 await p.locator('#bu35-new').tap();await p.waitForSelector('#bu-fw-experience');
 assert.equal(await p.locator('#bu3825-order').count(),0);assert.equal(await p.locator('#bu35-body details').count(),0);
 assert.equal(await p.locator('[data-experience]').count(),2);assert.equal(await p.locator('[data-experience="surprise"]').getAttribute('aria-checked'),'true');
 assert.equal(await p.locator('[data-experience="surprise"] strong').textContent(),'Interactive Family Worship');
 assert.equal(await p.locator('[data-experience="surprise"] .bu-fw-experience-description').textContent(),'Bible games, fun challenges, personal sharing and meaningful conversations. A different experience every time.');
 assert.equal(await p.locator('[data-experience="classic"] strong').textContent(),'Guided Family Worship');
 assert.equal(await p.locator('[data-experience="classic"] .bu-fw-experience-description').textContent(),'A traditional, structured Bible study and discussion experience.');
 fs.mkdirSync('work/family-experiences',{recursive:true});await p.screenshot({path:`work/family-experiences/${engine}-${width}-initial.png`});
 assert(await p.locator('[data-experience="classic"]').evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight}),'Both choices visible without opening a menu');
 await p.locator('[data-experience="classic"]').tap();assert.equal(await p.evaluate(()=>bu35Setup.order),'classic');
 await p.locator('[data-time="45"]').tap();await p.waitForSelector('[data-experience="classic"][aria-checked="true"]');
 await p.locator('[data-person="0"]').fill('Aster');await p.locator('[data-person="1"]').fill('Cedar');await p.locator('#bu35-start').tap();
 const saved=await p.evaluate(()=>JSON.stringify(bu35Game));assert(!JSON.parse(saved).phases.some(p=>p==='cluerelay'||p.startsWith('friendship-')));assert(JSON.parse(saved).phases.includes('think'));assert.equal(JSON.parse(saved).minutes,45);
 await p.reload({waitUntil:'domcontentloaded'});await ready();await p.locator('#home-family').tap();await p.locator('#bu35-resume').tap();assert.equal(await p.evaluate(()=>JSON.stringify(bu35Game)),saved,'Guided saved session survives reload unchanged');
 await p.locator('#bu35-back').tap();await p.locator('#wb36-family-hub').tap();await p.waitForSelector('#bu35-new[data-bu-fw-default-mode]');await p.locator('#bu35-new').tap();await p.waitForSelector('[data-experience="surprise"][aria-checked="true"]');assert.equal(await p.evaluate(()=>JSON.stringify(bu35Game)),saved,'Opening new setup does not reset unfinished session');
 await p.locator('[data-experience="classic"]').tap();await p.keyboard.press('Home');assert.equal(await p.locator('[data-experience="surprise"]').getAttribute('aria-checked'),'true');await p.keyboard.press('End');assert.equal(await p.locator('[data-experience="classic"]').getAttribute('aria-checked'),'true');await p.locator('[data-experience="surprise"]').tap();
 while(await p.locator('[data-person]').count()<6)await p.locator('#bu35-plus').tap();await p.waitForSelector('[data-experience="surprise"][aria-checked="true"]');assert.equal(await p.locator('[data-person="0"]').inputValue(),'Aster');
 await p.screenshot({path:`work/family-experiences/${engine}-${width}-six-players.png`});await p.locator('#bu35-start').tap();
 assert.equal(await p.evaluate(()=>bu35Game.people.length),6);assert(await p.evaluate(()=>bu35Game.phases.some(p=>p.startsWith('friendship-'))));assert.equal(await p.evaluate(()=>bu35Setup.order),'surprise');assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert.deepEqual(await p.evaluate(()=>({records:Object.fromEntries(Object.entries(localStorage).filter(([k])=>/wallet|reward|trail|grant|economy|builder/.test(k))),prefs:{musicOn,sfxOn,musicVolume,sfxVolume}})),baseline);assert.deepEqual(errors,[]);
 console.log('PASS worship experiences',engine,width,'exact copy, prominent choices, native Guided/Interactive, default, 6 players, old save/resume, keyboard, wallet/audio isolation');
 }finally{await b.close()}
 }})().catch(e=>{console.error(e);process.exit(1)});

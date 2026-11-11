/* Meaningful Daily Discovery V1 — native-integration acceptance QA.
 * Runs against TEST with new files injected, BEFORE activation on root loader.
 * Does not change old daily Trivia saves or the canonical Insight Token wallet.
 */
const puppeteer=require('puppeteer-core');
const assert=require('node:assert/strict');
const {execSync}=require('node:child_process');
const bin=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const root='http://127.0.0.1:8891/';
const protectedKeys=['bible-unfolded-daily-discovery-v375','bible-unfolded-daily-discovery-v375-recovery-v388',
 'bible-unfolded-rewards-v17','bible-unfolded-wheel-ownership-v3825','bible-unfolded-word-trails-next-v1'];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function inject(page){
 if(await page.evaluate(()=>!!window.BUDailyInsightV1))return;
 await page.addStyleTag({url:root+'daily-discovery-meaningful-test-v1.css'});
 await page.addScriptTag({url:root+'daily-discovery-insights-content-test-v1.js'});
 await page.addScriptTag({url:root+'daily-discovery-meaningful-test-v1.js'});
 await page.waitForFunction(()=>window.BUDailyInsightV1&&window.BUDailyInsightV1.libraryCount()===30,{timeout:10000});
}
(async()=>{
 let browser;
 try{
  browser=await puppeteer.launch({headless:true,executablePath:bin,args:['--no-sandbox','--disable-setuid-sandbox']});
  for(const v of [{width:390,height:705,isMobile:true,hasTouch:true,deviceScaleFactor:2},
                  {width:832,height:384,isMobile:true,hasTouch:true,deviceScaleFactor:2}]){
   const ctx=await browser.createBrowserContext(),page=await ctx.newPage();
   await page.setViewport(v);page.setDefaultTimeout(15000);
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(root+'index.html',{waitUntil:'domcontentloaded',timeout:120000});
   await page.waitForSelector('#bu375-home-cta',{timeout:60000});
   await page.waitForFunction(()=>window.BUDailyInsightV1?.libraryCount?.()===30,{timeout:25000});
   assert(await page.evaluate(()=>!!document.getElementById('bu-daily-insight-app-loader')),
      'New Daily Discovery must be loaded by native TEST loader without manual injection');
   // User can dismiss the original daily checkmark popup; never modify it.
   await page.evaluate(()=>document.getElementById('daily-continue')?.click());
   await sleep(100);
   await inject(page);
   const base=await page.evaluate(keys=>({
     keys:keys.map(k=>localStorage.getItem(k)),
     oldLabel:document.getElementById('bu375-home-status')?.textContent,
     today:window.BUDailyInsightV1.current(),
     cards:[...document.querySelectorAll('#home .cinematic-cards button')].map(x=>x.id)
   }),protectedKeys);
   assert(base.oldLabel.includes('thought')||base.oldLabel.includes('discovery'),'Home should invite a thought, not questions');
   assert(!base.cards.some(x=>/arcade|engage/.test(x)),'Rejected fake bonus minigame absent');
   await page.evaluate(()=>document.getElementById('bu375-home-cta').click());
   await page.waitForFunction(()=>window.BUDailyInsightV1.inspect().open&&document.querySelector('#bu375-body.bu-insight-reading'),{timeout:12000});
   const opening=await page.evaluate(()=>{
    const body=document.getElementById('bu375-body'),root=document.getElementById('bu375-daily');
    const r=body.getBoundingClientRect(),cover=body.querySelector('.bu-insight-cover')?.getBoundingClientRect();
    const tabs=[...body.querySelectorAll('[data-insight-tab]')].map(x=>x.textContent);
    return {header:root.querySelector('.bu34-title')?.textContent,visible:!root.hidden,
      body:{x:r.x,y:r.y,w:r.width,h:r.height},cover:cover?{x:cover.x,y:cover.y,w:cover.width,h:cover.height}:null,
      tabs,questions:body.querySelectorAll('[data-bu375-answer]').length,
      oldModes:body.querySelectorAll('[data-bu375-mode]').length,
      title:body.querySelector('h2')?.textContent,
      bodyText:body.textContent.slice(0,550),
      jwLinks:[...body.querySelectorAll('a')].map(x=>x.href),
      naturalSource:typeof bu375Open
    };
   });
   console.log('INSIGHT_OPEN_'+v.width,JSON.stringify(opening));
   assert(opening.visible&&opening.header.includes('Daily Discovery'));
   assert(opening.body.x>=-1&&opening.body.w<=v.width+1&&opening.body.h>200);
   assert(opening.cover&&opening.cover.x>=-1&&opening.cover.w<=v.width+1);
   assert(opening.tabs.length===3);
   assert(opening.tabs.some(t=>t.includes('Share the Thought')));
   assert.equal(opening.questions,0,'No trivia-answer buttons in Daily Discovery');
   assert.equal(opening.oldModes,0,'Deep Dive quiz chooser removed from new experience');
   assert(opening.title.length>12&&opening.bodyText.includes('MOMENT'));
   assert(opening.jwLinks.length>0&&opening.jwLinks.every(url=>url.startsWith('https://www.jw.org/en/')));

   // A real JW.org source link must open normally, without forwarding any
   // pointer or click phase to the legacy document menu-knock listeners.
   const sourceTone=await page.evaluate(()=>{
     const a=document.querySelector('#bu375-body.bu-insight-reading .bu-insight-source');
     if(!a)return {missing:true};
     const leak=[];
     for(const type of ['pointerdown','pointerup','mousedown','mouseup','click']){
       document.addEventListener(type,e=>{
         if(e.target?.closest?.('.bu-insight-source'))leak.push(type);
       },true);
     }
     const opts={bubbles:true,cancelable:true,composed:true};
     a.dispatchEvent(new PointerEvent('pointerdown',{...opts,pointerId:7,pointerType:'touch'}));
     a.dispatchEvent(new PointerEvent('pointerup',{...opts,pointerId:7,pointerType:'touch'}));
     a.dispatchEvent(new MouseEvent('mousedown',opts));
     a.dispatchEvent(new MouseEvent('mouseup',opts));
     const click=new MouseEvent('click',{...opts,button:0});
     a.dispatchEvent(click);
     return {leak,defaultPreserved:!click.defaultPrevented,
       url:a.href,target:a.target,source:a.textContent.trim()};
   });
   console.log('DAILY_SOURCE_TONE_'+v.width,JSON.stringify(sourceTone));
   assert(!sourceTone.missing,'Read the source button exists');
   assert.deepEqual(sourceTone.leak,[],'JW.org source link must bypass document knock handlers');
   assert(sourceTone.defaultPreserved,'Source click must not block normal anchor navigation');
   assert(sourceTone.url.startsWith('https://www.jw.org/en/'),'Source URL stays official JW.org');
   assert.equal(sourceTone.target,'_blank','Source opens in new tab');

   await page.evaluate(()=>document.getElementById('bu40-daily-confetti')?.remove());
   await page.screenshot({path:'/tmp/BU-MEANINGFUL-DAILY-'+v.width+'-today.png'});
   // Trap every native-document press; all Daily tabs must be handled at
   // window capture, not allowed through to the old navigation/knock hooks.
   await page.evaluate(()=>{
    window.__buDailyTabLeak=[];
    for(const type of ['pointerdown','pointerup','touchstart','touchend','mousedown','mouseup','click']){
     document.addEventListener(type,e=>{
      if(e.target?.closest?.('[data-insight-tab]'))window.__buDailyTabLeak.push(type);
     },true);
    }
   });
   await page.evaluate(()=>document.querySelector('[data-insight-action=share]').click());
   const share=await page.evaluate(()=>({
    tab:window.BUDailyInsightV1.inspect().tab,
    title:document.querySelector('#bu375-body .bu-insight-share-banner h3')?.textContent,
    sections:[...document.querySelectorAll('#bu375-body .bu-insight-conversation .number')].map(x=>x.textContent),
    statements:[...document.querySelectorAll('#bu375-body .bu-insight-conversation p')].map(x=>x.textContent),
    jwLinks:[...document.querySelectorAll('#bu375-body a')].map(x=>x.href),
    quiz:document.querySelectorAll('#bu375-body [data-bu375-answer]').length
   }));
   console.log('INSIGHT_SHARE_'+v.width,JSON.stringify(share));
   assert.equal(share.tab,'share');assert(share.title.includes('Worth Sharing'));
   assert(share.sections.length===3&&share.statements.every(x=>x.length>35));
   assert(share.jwLinks.length>0&&share.jwLinks.every(url=>url.startsWith('https://www.jw.org/en/')));
   assert.equal(share.quiz,0);
   const shareLayout=await page.evaluate(()=>{
     const view=document.getElementById('bu375-body').getBoundingClientRect();
     const cards=[...document.querySelectorAll('#bu375-body .bu-insight-conversation')].map(e=>{const r=e.getBoundingClientRect();return {y:r.y,bottom:r.bottom}});
     return {viewport:view,firstIdea:cards[0],secondIdea:cards[1]};
   });
   console.log('INSIGHT_SHARE_LAYOUT_'+v.width,JSON.stringify(shareLayout));
   assert(shareLayout.firstIdea.y>=0&&shareLayout.firstIdea.y<v.height,'The first sharing idea must appear without scrolling');
   await page.screenshot({path:'/tmp/BU-MEANINGFUL-DAILY-'+v.width+'-share.png'});
   await page.tap('[data-insight-tab=today]');
   assert.equal(await page.evaluate(()=>window.BUDailyInsightV1.inspect().tab),'today',
     'Real mobile touch should switch from Share to Today');
   await page.evaluate(()=>document.querySelector('[data-insight-action=save]').click());
   await page.evaluate(()=>document.querySelector('[data-insight-action=read]')?.click());
   const saved=await page.evaluate(()=>window.BUDailyInsightV1.inspect());
   assert.equal(saved.saved.length,1);assert(saved.read.includes(saved.today));
   assert(saved.shared.includes(saved.today));
   await page.tap('[data-insight-tab=saved]');
   assert.equal(await page.evaluate(()=>window.BUDailyInsightV1.inspect().tab),'saved',
     'Real mobile touch should switch from Today to Saved');
   await page.tap('[data-insight-tab=share]');
   assert.equal(await page.evaluate(()=>window.BUDailyInsightV1.inspect().tab),'share',
     'Real mobile touch should switch from Saved to Share');
   await page.tap('[data-insight-tab=saved]');
   assert.equal(await page.evaluate(()=>window.BUDailyInsightV1.inspect().tab),'saved',
     'Real mobile touch should switch back to Saved');
   const oldAudioLeaks=await page.evaluate(()=>window.__buDailyTabLeak);
   assert.deepEqual(oldAudioLeaks,[],'Daily tab presses must NEVER reach native document knock handlers');
   const savedView=await page.evaluate(()=>({rows:document.querySelectorAll('.bu-insight-saved-row').length,
    label:document.querySelector('.bu-insight-archive h2')?.textContent,
    imageCount:document.querySelectorAll('.bu-insight-saved-row img[data-insight-image]').length}));
   assert.equal(savedView.rows,1);
   assert.equal(savedView.imageCount,1,'Saved thought must have a real image with fallback');
   await page.waitForFunction(()=>[...document.querySelectorAll('.bu-insight-saved-row img')].every(i=>i.complete&&i.naturalWidth>0),{timeout:12000});
   await page.screenshot({path:'/tmp/BU-MEANINGFUL-DAILY-'+v.width+'-saved.png'});
   const protectedAfter=await page.evaluate(keys=>keys.map(k=>localStorage.getItem(k)),protectedKeys);
   assert.deepEqual(protectedAfter,base.keys,'Daily reading, saving and sharing never touch native wallet/old quiz saves');
   await page.reload({waitUntil:'domcontentloaded',timeout:120000});
   await page.waitForSelector('#bu375-home-cta',{timeout:60000});
   await inject(page);
   const afterReload=await page.evaluate(()=>window.BUDailyInsightV1.inspect());
   assert.deepEqual(afterReload.saved,saved.saved);
   assert.deepEqual(afterReload.read,saved.read);
   assert.deepEqual(afterReload.shared,saved.shared);
   await page.evaluate(()=>document.getElementById('bu375-home-cta').click());
   await page.waitForSelector('.bu-insight-story');
   const refreshed=await page.evaluate(()=>window.BUDailyInsightV1.inspect());
   assert.equal(refreshed.id,saved.id,'Same date and refresh must show same discovery');
   const protectReload=await page.evaluate(keys=>keys.map(k=>localStorage.getItem(k)),protectedKeys);
   assert.deepEqual(protectReload,base.keys,'Refresh with redesigned daily cannot corrupt legacy saves');
   await page.evaluate(()=>document.querySelector('#bu375-back').click());
   await sleep(150);
   const nav=await page.evaluate(()=>({
     dailyHidden:document.getElementById('bu375-daily')?.hidden,
     homeVisible:!document.getElementById('home')?.hidden
   }));
   assert(nav.dailyHidden&&nav.homeVisible,'Native Back must return Home');
   assert.deepEqual(errors,[],'No JS page errors after DAILY redesign: '+JSON.stringify(errors));
   console.log('PASS_DAILY_'+v.width+' new reader, non-trivia, share ministry, save, read, date/reload, native nav, protected saves');
   await ctx.close();
  }
  // Validate every authored entry independently (not just today's selected).
  const ctx=await browser.createBrowserContext(),p=await ctx.newPage();
  await p.goto(root+'index.html',{waitUntil:'domcontentloaded',timeout:120000});
  await p.waitForSelector('#bu375-home-cta',{timeout:60000});
  await inject(p);
  const audit=await p.evaluate(()=>window.BUDailyDiscoveryLibrary.map(x=>({
   id:x.id,cat:x.category,title:x.title,para:x.body.length,len:x.body.join(' ').length,
   source:x.url,share:x.share.url,moment:x.share.moment?.length,
   starter:x.share.opener?.length,question:x.share.question?.length,
   image:x.art
  })));
  const artPool=await p.evaluate(()=>window.BUDailyDiscoveryImagePool);
  assert.equal(artPool.length,8,'Curated image pool is a fixed reusable set');
  assert.equal(new Set(artPool).size,artPool.length,'All images in the pool are distinct');
  assert(artPool.every(path=>path==='daily-discovery-hero.webp' || (path.startsWith('journey-art/')&&path.endsWith('.webp'))),
   'Images must be local repository assets, not remote one-off photos');
  const assetHealth=await p.evaluate(()=>Promise.all(window.BUDailyDiscoveryImagePool.map(src=>new Promise(resolve=>{
    const img=new Image();img.onload=()=>resolve({src,ok:true});
    img.onerror=()=>resolve({src,ok:false});img.src=src;
  }))));
  assert(assetHealth.every(x=>x.ok),'Every reusable image must load: '+JSON.stringify(assetHealth));
  assert(audit.every((x,i)=>x.image===artPool[i%artPool.length]),
   'Entries reuse the same pool, rather than having bespoke photos');

  // Dedicated new-batch checks: no duplicate ids, stable original entries,
  // reliable source links, and varied subjects without changing native saves.
  const ids=await p.evaluate(()=>window.BUDailyDiscoveryLibrary.map(x=>x.id));
  const expectedNew=['hezekiah-water','jeremiah-field','dorcas-clothes','lydia-purple',
    'widow-coins','rahab-cord','widow-oil','nehemiah-builders','paul-storm',
    'sparrows','baruch-scroll','amos-work'];
  assert.equal(new Set(ids).size,30,'Every discovery has a unique durable save id');
  assert.deepEqual(ids.slice(18),expectedNew,'Original 18 index positions and new batch order are stable');
  assert.equal(ids[0],'nile');assert.equal(ids[17],'abigail');
  const next=await p.evaluate(()=>window.BUDailyDiscoveryLibrary.slice(18).map(x=>({
    id:x.id,body:x.body.join(' '),source:x.source,reference:x.reference,
    url:x.url,takeaway:x.takeaway,reflection:x.reflect,share:x.share
  })));
  for(const entry of next){
    assert(entry.body.length>350&&entry.body.length<1300,'Warm clear explanation length: '+entry.id);
    assert(entry.takeaway.length>=30&&entry.reflection.length>=35,'Reflection and takeaway: '+entry.id);
    assert(entry.source.includes('New World Translation')||entry.source.includes('Study Bible'),
      'JW Bible/source grounded: '+entry.id);
    assert(entry.reference&&entry.url.startsWith('https://www.jw.org/en/'),
      'JW source and reference: '+entry.id);
    assert(entry.share.moment&&entry.share.opener&&entry.share.thought&&
      entry.share.question&&entry.share.bridge&&entry.share.reference&&
      entry.share.url.startsWith('https://www.jw.org/en/'),
      'Natural, sourced Share the Thought: '+entry.id);
  }
  console.log('PASS_NEW_12_DISCOVERIES',JSON.stringify({new:next.length,uniqueTotal:ids.length}));

  const categories=new Set(audit.map(x=>x.cat));
  assert.equal(audit.length,30);assert(categories.size>=8);
  for(const c of audit){
   assert(c.title&&c.para>=2&&c.len>260,c.id);
   assert(/^https:\/\/www\.jw\.org\/en\//.test(c.source),c.id+' source');
   assert(/^https:\/\/www\.jw\.org\/en\//.test(c.share),c.id+' share');
   assert(c.moment>18&&c.starter>25&&c.question>24,c.id);
   assert(artPool.includes(c.image),'Image must come from permanent local pool: '+c.id);
  }
  console.log('PASS_EDITED_CATALOG_30',JSON.stringify({count:audit.length,categories:[...categories]}));
  await ctx.close();
 }catch(e){console.error('FAIL_MEANINGFUL_DAILY',e.stack||e);process.exitCode=1}
 finally{await browser?.close()}
})();

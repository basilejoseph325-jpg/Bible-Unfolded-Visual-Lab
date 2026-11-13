/* TEST ONLY — photo-specific illustrated-book proof without touching default.
   Includes scene load, correct ID, page fit, save isolation and button clarity. */
'use strict';
const assert=require('node:assert/strict');
const puppeteer=require('puppeteer-core');
const {execSync}=require('node:child_process');
const exe=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const root='http://127.0.0.1:8895/';
const scenes={
 peter:'peter-fishing.webp',
 nile:'nile-farmland.webp',
 ruth:'ruth-harvest.webp'
};
(async()=>{
 let browser;
 try{
  browser=await puppeteer.launch({headless:true,executablePath:exe,args:['--no-sandbox','--disable-setuid-sandbox'],protocolTimeout:110000});
  for(const width of [320,390,832]){
   const height=width===832?384:width===320?568:705;
   const ctx=await browser.createBrowserContext(),page=await ctx.newPage();
   await page.setViewport({width,height,deviceScaleFactor:2,isMobile:true,hasTouch:true});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   for(const id of Object.keys(scenes)){
    await page.goto(root+'index.html?daily_book=1&daily_qa=1&daily_preview='+id,{waitUntil:'domcontentloaded',timeout:120000});
    await page.waitForFunction(()=>window.BUDailyInsightV1?.libraryCount?.()===30,{timeout:60000});
    await page.evaluate(()=>{document.getElementById('daily-continue')?.click();window.BUDailyInsightV1.open()});
    await page.waitForSelector('#bu375-body.bu-daily-book-preview .bu-insight-story',{timeout:12000});
    const info=await page.evaluate(()=>({
      id:window.BUDailyInsightV1.inspect().id,
      active:document.getElementById('bu375-body').classList.contains('bu-daily-book-preview'),
      image:document.querySelector('.bu-insight-cover').style.backgroundImage,
      label:document.querySelector('.bu-book-scene-label')?.textContent,
      paperTextColor:getComputedStyle(document.querySelector('.bu-insight-story p')).color,
      wrap:(()=>{const r=document.querySelector('.bu-insight-section').getBoundingClientRect();return {x:r.x,right:r.right,width:r.width}})(),
      imageIsThere:document.querySelector('.bu-insight-cover')?.getBoundingClientRect().height>135,
       star:getComputedStyle(document.querySelector('.bu-insight-cover'),'::after').content,
       photoChildCount:document.querySelector('.bu-insight-cover').children.length,
       chapterTitle:document.querySelector('.bu-book-title-band h2')?.textContent,
      source:document.querySelector('.bu-insight-source')?.href,
      save:document.querySelector('[data-insight-action=save]')?.textContent,
      share:document.querySelector('[data-insight-action=share]')?.textContent
    }));
    console.log('BOOK_'+width+'_'+id,JSON.stringify(info));
    assert.equal(info.id,id);
    assert(info.active&&info.image.includes(scenes[id]),'Custom art must belong to selected Bible scene');
    assert(info.imageIsThere);
    assert.equal(info.label,undefined,'No reconstruction badge printed on the artwork');
     assert.equal(info.star,'none','No decorative star covering the artwork');
     assert.equal(info.photoChildCount,0,'The image is free of text overlays');
     assert(info.chapterTitle?.length>3,'Discovery title appears below the artwork');
    assert.equal(info.paperTextColor,'rgb(54, 45, 35)');
    assert(info.wrap.x>=0&&info.wrap.right<=width+1,'Paper must fit phone');
    assert(info.source.startsWith('https://www.jw.org/en/'));
    assert.match(info.save,/Save/);
    assert.equal(info.share,'◈ Share the Thought');
    const art=await page.evaluate(async path=>{
       const i=new Image();
       return await new Promise(resolve=>{i.onload=()=>resolve({loaded:true,w:i.naturalWidth,h:i.naturalHeight});i.onerror=()=>resolve({loaded:false});i.src=path;});
    },'assets/daily-book/'+scenes[id]);
    assert(art.loaded&&art.w>=600&&art.h>=300,'Image asset renders at useful resolution: '+id);
    if(width===390)await page.screenshot({path:'/tmp/BU-DAILY-BOOK-'+id+'.png'});
    await page.evaluate(()=>document.querySelector('[data-insight-action=save]').click());
    const saved=await page.evaluate(()=>window.BUDailyInsightV1.inspect().saved);
    assert(saved.includes(id),'Book preview shares normal saved-discovery IDs');
    await page.evaluate(()=>document.querySelector('[data-insight-tab=saved]').click());
    const thumb=await page.evaluate(()=>document.querySelector('[data-insight-image]')?.getAttribute('src'));
    assert(thumb===('assets/daily-book/'+scenes[id]),'Saved shelf uses matching custom art');
    await page.evaluate(()=>document.querySelector('[data-insight-tab=share]').click());
    assert.equal(await page.evaluate(()=>document.querySelector('.bu-insight-cover')?.getAttribute('data-illustration')),id);
    assert(await page.evaluate(()=>!!document.querySelector('[data-insight-action=copy]')));
    assert(!await page.evaluate(()=>!!document.querySelector('[data-insight-action=read]')),'No redundant remember button');
    // The sample Peter/Nile/Ruth buttons are gone even from editorial QA.
    assert.equal(await page.evaluate(()=>document.querySelectorAll('[data-insight-preview]').length),0,
      'Sample chapter buttons must never appear');
   }
   // Editorial QA can inspect all lessons through one intentionally gated select.
   for(const id of ['peter','nile','ruth']){
    await page.evaluate(id=>{
      const select=document.querySelector('[data-insight-book-select]');
      select.value=id;select.dispatchEvent(new Event('change',{bubbles:true}));
    },id);
    const selected=await page.evaluate(()=>({
      id:window.BUDailyInsightV1.inspect().id,
      tab:window.BUDailyInsightV1.inspect().tab,
      picture:document.querySelector('.bu-insight-cover')?.style.backgroundImage,
      url:new URL(location.href).searchParams.get('daily_preview'),
      text:document.querySelector('.bu-insight-story p')?.textContent
    }));
    assert.equal(selected.id,id);
    assert.equal(selected.tab,'today','Editorial QA selector opens selected article');
    assert(selected.picture.includes(scenes[id]));
    assert.equal(selected.url,id,'QA preview query stays synchronized');
    assert(selected.text.length>55);
    console.log('BOOK_TEST_EDITOR_'+width+'_'+id,JSON.stringify(selected));
   }
   // The 30-item dropdown exists ONLY when daily_qa=1 on Visual Lab TEST.
   const catalog=await page.evaluate(()=>[...document.querySelectorAll('[data-insight-book-select] option')]
      .map(o=>({id:o.value,title:o.textContent.trim()})));
   assert.equal(catalog.length,30,'One browse option per existing Daily Discovery');
   assert.equal(new Set(catalog.map(o=>o.id)).size,30,'Every chapter selection uses a unique saved-data ID');
   const regularIDs=await page.evaluate(()=>window.BUDailyDiscoveryLibrary.map(d=>d.id));
   assert.deepEqual(catalog.map(o=>o.id),regularIDs,'Picker preserves original editorial order');
   // All 30 must actually render with an existing local image; visual matches
   // are explained by the visible artist/thematic illustration labels.
   if(width===390){
    const allArt=await page.evaluate(async()=>{
      const results=[];
      const ids=[...document.querySelector('[data-insight-book-select]').options].map(o=>o.value);
      for(const selectedId of ids){
       const dropdown=document.querySelector('[data-insight-book-select]');
       dropdown.value=selectedId;
       dropdown.dispatchEvent(new Event('change',{bubbles:true}));
       const id=window.BUDailyInsightV1.inspect().id;
       const picture=document.querySelector('.bu-insight-cover')?.style.backgroundImage||'';
       const label=document.querySelector('.bu-book-scene-label')?.textContent||'';
       const src=picture.match(/url\(["']?([^"')]+)["']?\)/)?.[1]||'';
       const ok=await new Promise(resolve=>{
        const img=new Image();img.onload=()=>resolve(img.naturalWidth>=600);
        img.onerror=()=>resolve(false);img.src=src;
       });
       results.push({id,src,ok,label,heading:document.querySelector('.bu-book-title-band h2')?.textContent});
      }
      return results;
    });
    assert.equal(allArt.length,30);
    assert(allArt.every((r,i)=>r.id===catalog[i].id),'All chapters navigate independently');
    assert(allArt.every(r=>r.ok),'All 30 artwork URLs resolve to usable images: '+JSON.stringify(allArt.filter(r=>!r.ok)));
    assert(allArt.every(r=>!r.label&&r.heading?.length>3),
      'All 30 covers display no distracting badge and retain readable chapter titles below their artwork');
    const approvedNew={
      'early-students':'assets/daily-book/early-students-1870.webp',
      'naaman-girl':'assets/daily-book/naaman-servant-girl.webp',
      well:'assets/daily-book/samaritan-at-well.webp',
      'paul-storm':'assets/daily-book/paul-breaking-bread.webp',
      'philip':'assets/daily-book/philip.webp',
      'bereans':'assets/daily-book/bereans.webp',
      'abigail':'assets/daily-book/abigail.webp',
      'dorcas-clothes':'assets/daily-book/dorcas-clothes.webp',
      'lydia-purple':'assets/daily-book/lydia-purple.webp',
      'widow-coins':'assets/daily-book/widow-coins.webp',
      'rahab-cord':'assets/daily-book/rahab-cord.webp',
      'widow-oil':'assets/daily-book/widow-oil.webp',
      'nehemiah-builders':'assets/daily-book/nehemiah-builders.webp',
      'baruch-scroll':'assets/daily-book/baruch-scroll.webp',
      'samaritan':'assets/daily-book/samaritan.webp',
      'mustard':'assets/daily-book/mustard.webp',
      'paul-work':'assets/daily-book/paul-work.webp',
      'radio':'assets/daily-book/radio.webp',
      'ezra':'assets/daily-book/ezra.webp',
      'hezekiah-water':'assets/daily-book/hezekiah-water.webp',
      'jeremiah-field':'assets/daily-book/jeremiah-field.webp',
      'stars':'assets/daily-book/stars.webp',
      'sparrows':'assets/daily-book/sparrows.webp'
    };
    for(const [id,path] of Object.entries(approvedNew)){
      const scene=allArt.find(r=>r.id===id);
      assert(scene&&scene.src.endsWith(path),'Approved new artwork must match its source Bible lesson: '+id);
      assert(!scene.label&&scene.heading,'Original chapter art and its heading remain properly separated');
    }
    // Jesus at the well (John 4) must not leak into the GOOD Samaritan
    // illustration (Luke 10), which is an entirely different account!
    const goodSamaritan=allArt.find(r=>r.id==='samaritan');
    assert(goodSamaritan&&!goodSamaritan.src.includes('samaritan-at-well'),
      'Keep two different Samaritan accounts distinct');
    assert.equal(new Set(allArt.map(r=>r.src)).size,27,'26 distinct original illustrations plus one remaining older thematic picture');
    console.log('BOOK_CURATED_30',JSON.stringify(allArt.map(x=>({id:x.id,art:x.src,label:x.label}))));
    // Save visual evidence for the four newly installed Bible account covers.
    // The source images were already editorially reviewed; this verifies
    // title overlays and phone cropping in the real running TEST page.
    for(const id of Object.keys(approvedNew)){
      await page.evaluate(selectedId=>{
        const select=document.querySelector('[data-insight-book-select]');
        select.value=selectedId;
        select.dispatchEvent(new Event('change',{bubbles:true}));
      },id);
      await page.screenshot({path:'/tmp/BU-DAILY-BOOK-'+id+'.png'});
    }
    // Editorial audit only: export actual displayed mobile covers for each
    // remaining thematic chapter. This does not change game code or artwork.
    const thematicIDs=['tears'];
    for(const selectedId of thematicIDs){
      await page.evaluate(id=>{
        const dropdown=document.querySelector('[data-insight-book-select]');
        dropdown.value=id;
        dropdown.dispatchEvent(new Event('change',{bubbles:true}));
      },selectedId);
      const state=await page.evaluate(()=>({id:window.BUDailyInsightV1.inspect().id,cover:document.querySelector('.bu-insight-cover')?.style.backgroundImage||'',label:document.querySelector('.bu-book-scene-label')?.textContent||''}));
      assert.equal(state.id,selectedId,'Thematic audit selector must show requested Bible discovery');
      assert.equal(state.label,'','Remaining thematic art also has no on-image label');
      assert(state.cover.includes('.webp'),'Thematic cover must still display an image');
      await page.screenshot({path:'/tmp/BU-DAILY-BOOK-audit-'+selectedId+'.png'});
    }
   }
   // Realistic Android-style native select opens on a tap: test no click
   // cancellation or leakage into old global document-level knock handlers.
   const inputAudit=await page.evaluate(()=>{
      const dropdown=document.querySelector('[data-insight-book-select]');
      const oldClick=[];
      const catchOld=e=>{if(e.target===dropdown)oldClick.push(e.type)};
      document.addEventListener('pointerdown',catchOld,true);
      document.addEventListener('click',catchOld,true);
      const down=new PointerEvent('pointerdown',{bubbles:true,pointerId:9,pointerType:'touch'});
      dropdown.dispatchEvent(down);
      const ev=new MouseEvent('click',{bubbles:true,cancelable:true});
      dropdown.dispatchEvent(ev);
      return {oldClick,defaultAllowed:!ev.defaultPrevented};
   });
   assert.deepEqual(inputAudit.oldClick,[],'No inherited document-level knock on dropdown');
   assert(inputAudit.defaultAllowed,'Native selector click must remain functional');
   await page.evaluate(()=>{
     const select=document.querySelector('[data-insight-book-select]');
     select.value='ruth';select.dispatchEvent(new Event('change',{bubbles:true}));
   });
   await page.reload({waitUntil:'domcontentloaded',timeout:120000});
   await page.waitForFunction(()=>window.BUDailyInsightV1?.libraryCount?.()===30,{timeout:60000});
   await page.evaluate(()=>window.BUDailyInsightV1.open());
   assert.equal(await page.evaluate(()=>window.BUDailyInsightV1.inspect().id),'ruth',
     'Refresh restores the last selected preview using its URL');
   assert.deepEqual(errors,[],'No runtime exceptions in 3 scenes and navigation');
   await ctx.close();
  }
  // The exact reported bug: Chrome opened the ordinary game URL and got the
  // blue old screen, because URL query flags had been discarded on handoff.
  // Opening the real home tile on a clean URL must now show the book as normal.
  const c=await browser.createBrowserContext(),p=await c.newPage();
  await p.setViewport({width:390,height:705,deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await p.goto(root+'index.html',{waitUntil:'domcontentloaded',timeout:120000});
  await p.waitForFunction(()=>window.BUDailyInsightV1?.libraryCount?.()===30,{timeout:60000});
  await p.evaluate(()=>{document.getElementById('daily-continue')?.click();document.querySelector('#bu375-home-cta').click()});
  await p.waitForSelector('#bu375-body.bu-daily-book-preview .bu-insight-story',{timeout:12000});
  const regular=await p.evaluate(()=>({
    open:window.BUDailyInsightV1.inspect().open,
    id:window.BUDailyInsightV1.inspect().id,
    expected:window.BUDailyDiscoveryLibrary.find(x=>x.id===window.BUDailyInsightV1.inspect().id)?.id,
    book:document.getElementById('bu375-body').classList.contains('bu-daily-book-preview'),
    picker:document.querySelectorAll('[data-insight-book-select] option').length,
    picture:document.querySelector('.bu-insight-cover').style.backgroundImage,
    query:location.search,
    textColor:getComputedStyle(document.querySelector('.bu-insight-story p')).color
  }));
  console.log('BOOK_CHROME_NORMAL',JSON.stringify(regular));
  assert(regular.open&&regular.book,'Chrome normal Daily tile opens parchment without special URL');
  assert.equal(regular.picker,0,'Normal daily page never exposes future discovery catalog');
  assert.equal(await p.evaluate(()=>document.querySelectorAll('[data-insight-preview]').length),0,'No Peter/Nile/Ruth sample shortcuts');
  assert.equal(regular.textColor,'rgb(54, 45, 35)','Book reading text is dark on parchment');
  assert(regular.picture.includes('scholar-research-assets/')||
   regular.picture.includes('assets/daily-book/')||
   regular.picture.includes('journey-art/')||
   regular.picture.includes('family-worship-menu-art/'),'Normal daily has a curated illustration');
  assert.equal(regular.query,'','No preview query parameter necessary');
  await p.screenshot({path:'/tmp/BU-DAILY-BOOK-default-chrome.png'});

  // The old approved blue theme remains available for direct comparison and
  // rollback in TEST with an explicit opt-out. Nothing touches LIVE.
  await p.goto(root+'index.html?daily_book=0&daily_qa=1&daily_preview=peter',{waitUntil:'domcontentloaded',timeout:120000});
  await p.waitForFunction(()=>window.BUDailyInsightV1?.libraryCount?.()===30,{timeout:60000});
  await p.evaluate(()=>{document.getElementById('daily-continue')?.click();window.BUDailyInsightV1.open()});
  const plain=await p.evaluate(()=>({
    active:document.getElementById('bu375-body').classList.contains('bu-daily-book-preview'),
    image:document.querySelector('.bu-insight-cover')?.style.backgroundImage,
    key:window.BUDailyInsightV1.inspect().id,
    picker:!!document.querySelector('[data-insight-preview]')
  }));
  assert.equal(plain.key,'peter');assert.equal(plain.active,false);
  assert.equal(plain.picker,false,'Explicit old-theme comparison hides preview controls');
  assert(!plain.image.includes('assets/daily-book/'),'Original design remains available via daily_book=0');
  // Guessed preview URLs without explicit editor QA must NOT expose future articles.
  await p.goto(root+'index.html?daily_preview=peter',{waitUntil:'domcontentloaded',timeout:120000});
  await p.waitForFunction(()=>window.BUDailyInsightV1?.libraryCount?.()===30,{timeout:60000});
  await p.evaluate(()=>{document.getElementById('daily-continue')?.click();window.BUDailyInsightV1.open()});
  const noBypass=await p.evaluate(()=>({
    id:window.BUDailyInsightV1.inspect().id,
    preview:window.BUDailyInsightV1.inspect().preview,
    picker:!!document.querySelector('[data-insight-book-select]'),
    isToday:document.querySelector('.bu-book-title-band h2')?.textContent?.length>0
  }));
  assert.equal(noBypass.id,regular.id,'Preview URL without editor flag cannot select another day');
  assert.equal(noBypass.preview,false,'Preview mode is disabled for regular visitors');
  assert.equal(noBypass.picker,false,'30-option dropdown hidden even on guessed preview URL');
  assert(noBypass.isToday,'Normal visitor sees an illustrated daily article');
  console.log('PASS_DAILY_BOOK_PREVIEW: QA-only 30 artwork checks; daily-only visitor UI; no URL bypass; Saved works');
 }catch(e){console.error('FAIL_DAILY_BOOK_PREVIEW',e.stack||e);process.exitCode=1}
 finally{await browser?.close()}
})();

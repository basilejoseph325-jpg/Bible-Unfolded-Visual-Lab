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
    await page.goto(root+'index.html?daily_book=1&daily_preview='+id,{waitUntil:'domcontentloaded',timeout:120000});
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
      imageIsThere:document.querySelector('.bu-insight-cover')?.getBoundingClientRect().height>200,
      source:document.querySelector('.bu-insight-source')?.href,
      save:document.querySelector('[data-insight-action=save]')?.textContent,
      share:document.querySelector('[data-insight-action=share]')?.textContent
    }));
    console.log('BOOK_'+width+'_'+id,JSON.stringify(info));
    assert.equal(info.id,id);
    assert(info.active&&info.image.includes(scenes[id]),'Custom art must belong to selected Bible scene');
    assert(info.imageIsThere);
    assert.equal(info.label,'Artist’s reconstruction');
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
    // Every editorial example must offer the same one-tap selector,
    // including after entering Share and Saved. No extra browser links needed.
    const chapters=await page.evaluate(()=>[...document.querySelectorAll('[data-insight-preview]')].map(b=>b.dataset.insightPreview));
    assert.deepEqual(chapters,['peter','nile','ruth'],'Explicit preview navigation always available');
   }
   // User reports that opening three links seemed to show the same Nile page.
   // Verify in-app buttons independently select all three, update the URL,
   // and keep their correct individual photos in a single browser tab.
   for(const id of ['peter','nile','ruth']){
    await page.evaluate(id=>document.querySelector('[data-insight-preview='+id+']').click(),id);
    const selected=await page.evaluate(()=>({
     id:window.BUDailyInsightV1.inspect().id,
     tab:window.BUDailyInsightV1.inspect().tab,
     picture:document.querySelector('.bu-insight-cover')?.style.backgroundImage,
     url:new URL(location.href).searchParams.get('daily_preview'),
     pressed:[...document.querySelectorAll('[data-insight-preview][aria-pressed=true]')].map(e=>e.dataset.insightPreview),
     text:document.querySelector('.bu-insight-story p')?.textContent
    }));
    assert.equal(selected.id,id,'One tap must select actual '+id+' discovery');
    assert.equal(selected.tab,'today','Chapter picker opens the selected illustrated article');
    assert(selected.picture.includes(scenes[id]),'One tap must show correct '+id+' illustration');
    assert.equal(selected.url,id,'Preview query reflects the visible chapter');
    assert.deepEqual(selected.pressed,[id],'Only selected preview is highlighted');
    assert(selected.text.length>55,'Each preview shows meaningful individual content');
    console.log('BOOK_PICKER_'+width+'_'+id,JSON.stringify(selected));
   }
   await page.reload({waitUntil:'domcontentloaded',timeout:120000});
   await page.waitForFunction(()=>window.BUDailyInsightV1?.libraryCount?.()===30,{timeout:60000});
   await page.evaluate(()=>window.BUDailyInsightV1.open());
   assert.equal(await page.evaluate(()=>window.BUDailyInsightV1.inspect().id),'ruth',
     'Refresh restores the last selected preview using its URL');
   assert.deepEqual(errors,[],'No runtime exceptions in 3 scenes and navigation');
   await ctx.close();
  }
  // Approved default must remain unaltered, even for one of the art-enabled IDs.
  const c=await browser.createBrowserContext(),p=await c.newPage();
  await p.goto(root+'index.html?daily_preview=peter',{waitUntil:'domcontentloaded',timeout:120000});
  await p.waitForFunction(()=>window.BUDailyInsightV1?.libraryCount?.()===30,{timeout:60000});
  await p.evaluate(()=>{document.getElementById('daily-continue')?.click();window.BUDailyInsightV1.open()});
  const plain=await p.evaluate(()=>({
    active:document.getElementById('bu375-body').classList.contains('bu-daily-book-preview'),
    image:document.querySelector('.bu-insight-cover')?.style.backgroundImage,
    key:window.BUDailyInsightV1.inspect().id,
    picker:!!document.querySelector('[data-insight-preview]')
  }));
  assert.equal(plain.key,'peter');assert.equal(plain.active,false);
  assert.equal(plain.picker,false,'Regular Daily Discovery never shows preview controls');
  assert(!plain.image.includes('assets/daily-book/'),'Original design and art remain default');
  console.log('PASS_DAILY_BOOK_PREVIEW: 3 illustrations, one-tap in-app switch, browser URL/refresh, phone viewports, saves and original default preserved');
 }catch(e){console.error('FAIL_DAILY_BOOK_PREVIEW',e.stack||e);process.exitCode=1}
 finally{await browser?.close()}
})();

/* Screenshot + navigation acceptance for NEW Daily Discovery lessons.
 * Only TEST: no gameplay write or repo mutation. */
const puppeteer=require('puppeteer-core'),assert=require('node:assert/strict');
const {execSync}=require('node:child_process');
const executablePath=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const root='http://127.0.0.1:8892/';
const cases=[
 {id:'hezekiah-water',title:'The King Who Had to Think About Water'},
 {id:'jeremiah-field',title:'Why Buy a Field During a Siege?'},
 {id:'widow-coins',title:'Two Small Coins, and Someone Who Noticed'},
 {id:'baruch-scroll',title:'A Scroll Was Burned. The Message Was Not Lost.'},
 {id:'amos-work',title:'The Prophet Who Looked After Fig Trees'}
];
(async()=>{
 let browser;
 try{
  browser=await puppeteer.launch({headless:true,executablePath,args:['--no-sandbox','--disable-setuid-sandbox']});
  for(const vp of [{width:320,height:568,isMobile:true,hasTouch:true,deviceScaleFactor:2},
                    {width:390,height:705,isMobile:true,hasTouch:true,deviceScaleFactor:2},
                    {width:832,height:384,isMobile:true,hasTouch:true,deviceScaleFactor:2}]){
   const context=await browser.createBrowserContext(),page=await context.newPage();
   await page.setViewport(vp);page.setDefaultTimeout(30000);
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   for(const [index,entry] of cases.entries()){
     await page.goto(root+'index.html?daily_preview='+encodeURIComponent(entry.id),{waitUntil:'domcontentloaded',timeout:120000});
     await page.waitForFunction(()=>window.BUDailyInsightV1?.libraryCount?.()===30,{timeout:60000});
     await page.evaluate(()=>{document.getElementById('daily-continue')?.click();window.BUDailyInsightV1.open()});
     await page.waitForSelector('#bu375-body.bu-insight-reading .bu-insight-story',{timeout:10000});
     const info=await page.evaluate(()=>{
      const d=window.BUDailyInsightV1.inspect(),root=document.querySelector('#bu375-body'),
        story=root.querySelector('.bu-insight-story'),heading=root.querySelector('h2'),
        cover=root.querySelector('.bu-insight-cover'),link=story.querySelector('a'),
        scroll=root.getBoundingClientRect(),rect=cover.getBoundingClientRect();
      return {id:d.id,title:heading?.textContent,preview:d.open,links:[...root.querySelectorAll('a')].map(a=>a.href),
       bodyText:story?.innerText?.length||0,art:cover?.style.backgroundImage,
       x:rect.x,w:rect.width,y:rect.y,rootX:scroll.x,rootW:scroll.width,rootH:scroll.height};
     });
     assert.equal(info.id,entry.id,'Preview must select requested new item');
     assert(info.title?.includes(entry.title),'Header must match the previewed discovery');
     assert(info.bodyText>350,'All new discovery text must render');
     assert(info.links.length>=1&&info.links.every(l=>l.startsWith('https://www.jw.org/en/')),'Only JW.org links');
     assert(info.w>200&&info.x>=-1&&info.x+info.w<=vp.width+1,'Cover fits viewport');
     assert(info.rootX>=-1&&info.rootW<=vp.width+1,'Daily screen fits viewport');
     assert(info.art.includes('journey-art/')||info.art.includes('daily-discovery-hero'),'Permanent local illustration used');
     if(index===1 || index===3){
       await page.click('[data-insight-tab=share]');
       await page.waitForFunction(()=>window.BUDailyInsightV1.inspect().tab==='share');
       const prompt=await page.evaluate(()=>document.querySelector('#bu375-body .bu-insight-conversation')?.innerText||'');
       assert(prompt.length>55,'New shared idea present');
       await page.click('[data-insight-tab=today]');
     }
     if(vp.width===390&&index===3)
       await page.screenshot({path:'/tmp/BU-DAILY-NEW-BARUCH-390.png'});
     console.log('PASS_NEW_PREVIEW_'+vp.width+'_'+entry.id,JSON.stringify(info));
   }
   assert.equal(errors.length,0,'Browser JS errors: '+JSON.stringify(errors));
   await context.close();
  }
  console.log('PASS_NEW_DAILY_30_PREVIEW_BROWSER: 5 newest lessons, 3 phone viewports, share tab and source links.');
 }catch(e){console.error('FAIL_NEW_DAILY_PREVIEW',e.stack||e);process.exitCode=1}
 finally{await browser?.close()}
})();

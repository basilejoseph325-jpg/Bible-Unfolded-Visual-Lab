/* Visual Lab-only integrated Daily Discovery Hall browser test.
   Runs with Puppeteer against local web server; does not touch LIVE. */
const puppeteer=require('puppeteer-core');
const assert=require('node:assert/strict');
const {execSync}=require('node:child_process');
const bin=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const pause=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 let browser;
 try{
  browser=await puppeteer.launch({headless:true,executablePath:bin,args:['--no-sandbox','--disable-setuid-sandbox']});
  for(const vp of [{width:390,height:705,isMobile:true,hasTouch:true,deviceScaleFactor:2},
                   {width:832,height:384,isMobile:true,hasTouch:true,deviceScaleFactor:2}]){
   const context=await browser.createBrowserContext();
   const page=await context.newPage();
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.setViewport(vp);
   await page.goto('http://127.0.0.1:8897/index.html',{waitUntil:'domcontentloaded',timeout:120000});
   await page.waitForFunction(()=>!!window.BUDailyHall&&!!document.getElementById('bu-engage-launch'),
      {timeout:60000});
   const initial=await page.evaluate(()=>({
    native:localStorage.getItem('bible-unfolded-rewards-v17'),
    ownership:localStorage.getItem('bible-unfolded-wheel-ownership-v3825'),
    streakNodes:document.querySelectorAll('input[type=checkbox]').length,
    launcher:document.querySelector('#bu-engage-launch')?.textContent,
    homeShop:!!document.getElementById('home-shop'),
    theme:document.getElementById('bu-engage-hall')?.dataset.scene
   }));
   assert(initial.homeShop);
   assert(initial.launcher.includes('Discovery Hall'),'Hall must be part of native home');
   await page.evaluate(()=>document.getElementById('bu-engage-launch').click());
   await page.waitForSelector('#bu-engage-hall');
   const geometry=await page.evaluate(()=>{
    const h=document.getElementById('bu-engage-hall'),r=h.getBoundingClientRect();
    const body=document.querySelector('#bu-engage-hall .bu-hall-body'),s=getComputedStyle(body);
    return {rect:{x:r.x,y:r.y,w:r.width,h:r.height},view:{w:innerWidth,h:innerHeight},
      bodyOverflow:s.overflowY,tabs:document.querySelectorAll('.bu-tab').length,
      seals:document.querySelectorAll('.bu-seal').length};
   });
   console.log('DAILY_HALL_GEOMETRY_'+vp.width,JSON.stringify(geometry));
   assert(geometry.rect.w<=geometry.view.w+1);
   assert(geometry.rect.h<=geometry.view.h+1);
   assert(geometry.rect.y>=-1);
   assert.equal(geometry.tabs,3);assert.equal(geometry.seals,7);
   await page.evaluate(()=>document.querySelector('.bu-tab[data-id=treasury]').click());
   await page.waitForFunction(()=>document.querySelectorAll('.bu-item').length===9,{timeout:8000});
   const before=await page.evaluate(()=>window.BUDailyHall.previewWallet());
   assert(before.credits>=420,'Provide a usable TEST-only balance');
   await page.evaluate(()=>document.querySelector('.bu-item button[data-action=buy][data-id=library]').click());
   const after=await page.evaluate(()=>({
     wallet:window.BUDailyHall.previewWallet(),
     scene:document.getElementById('bu-engage-hall').dataset.scene,
     storage:JSON.parse(localStorage.getItem('bu-daily-hall-v1-test-only')),
     native:localStorage.getItem('bible-unfolded-rewards-v17'),
     ownership:localStorage.getItem('bible-unfolded-wheel-ownership-v3825'),
     checkboxes:document.querySelectorAll('input[type=checkbox]').length
   }));
   assert.equal(after.wallet.credits,before.credits-260);
   assert(after.wallet.owned.includes('library'));
   assert.notEqual(after.storage.goal,'library','After unlocking savings goal, suggest the next collectible');
   assert.equal(after.scene,'library','Unlocking scene must change Hall background');
   assert.equal(after.native,initial.native,'Native currency save must remain unchanged');
   assert.equal(after.ownership,initial.ownership,'Native wheel ownership must remain unchanged');
   assert.equal(after.checkboxes,initial.streakNodes,'Existing daily checkmark controls must remain intact');
   await page.evaluate(()=>document.querySelector('.bu-tab[data-id=gallery]').click());
   assert(await page.evaluate(()=>document.querySelector('.bu-gallery')?.textContent.includes('Ancient Library')));
   await page.evaluate(()=>document.querySelector('.bu-hall-close').click());
   assert(!(await page.evaluate(()=>document.getElementById('bu-engage-stage'))));
   await page.reload({waitUntil:'domcontentloaded',timeout:120000});
   await page.waitForFunction(()=>!!window.BUDailyHall&&!!document.getElementById('bu-engage-launch'),
     {timeout:60000});
   const saved=await page.evaluate(()=>window.BUDailyHall.previewWallet());
   assert.equal(saved.credits,after.wallet.credits,'Test-only purchase must persist after refresh');
   assert(saved.owned.includes('library'),'Owned collectible must persist after refresh');
   const testShot='/tmp/BU-Daily-Hall-'+vp.width+'.png';
   await page.evaluate(()=>document.getElementById('bu-engage-launch').click());
   await page.screenshot({path:testShot,fullPage:false});
   console.log('DAILY_HALL_SHOT_'+vp.width,testShot);
   console.log('DAILY_HALL_ERRORS_'+vp.width,JSON.stringify(errors));
   assert.equal(errors.length,0,'No unhandled JavaScript exceptions');
   await page.close();
   await context.close();
  }
  console.log('PASS Visual Lab Daily Discovery Hall, test-only purchase isolation, persistence and portrait/landscape');
 }catch(e){console.error('FAIL_DAILY_HALL',e.stack||e);process.exitCode=1}
 finally{await browser?.close()}
})();
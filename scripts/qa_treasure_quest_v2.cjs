/* Treasure Quest V2 Visual Lab — cross-viewport browser regression.
   Exercises visible launcher, matching gameplay, chest reveal, one-time rewards,
   milestone trophy, cosmetic purchase, persistence and wallet isolation. */
const puppeteer=require('puppeteer-core');
const assert=require('node:assert/strict');
const {execSync}=require('node:child_process');
const binary=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const root='http://127.0.0.1:8897/index.html';
const key='bu-treasure-quest-v2-test-only';
const vps=[{width:390,height:705,isMobile:true,hasTouch:true,deviceScaleFactor:2},
           {width:832,height:384,isMobile:true,hasTouch:true,deviceScaleFactor:2}];
async function solve(page){
 await page.waitForSelector('#bu-arcade-play .bu-a-card',{timeout:15000});
 const pairs=await page.$$eval('.bu-a-card',arr=>{
  const groups={};arr.forEach((el,i)=>(groups[el.dataset.pair]??=[]).push(i));
  return Object.values(groups)
 });
 assert.equal(pairs.length,3);pairs.forEach(p=>assert.equal(p.length,2));
 for(const pair of pairs){
  for(const i of pair)
   await page.evaluate(i=>document.querySelectorAll('#bu-arcade-play .bu-a-card')[i].click(),i);
  await wait(480);
 }
 await page.waitForSelector('.bu-a-chests button',{timeout:10000});
}
(async()=>{
 let browser;
 try{
  browser=await puppeteer.launch({headless:true,executablePath:binary,
    args:['--no-sandbox','--disable-setuid-sandbox','--autoplay-policy=no-user-gesture-required']});
  for(const vp of vps){
   const context=await browser.createBrowserContext();
   const page=await context.newPage();await page.setViewport(vp);
   page.setDefaultTimeout(25000);
   const errs=[];page.on('pageerror',e=>errs.push(e.message));
   await page.goto(root,{waitUntil:'domcontentloaded',timeout:120000});
   await page.waitForFunction(()=>!!window.BUTreasureQuest&&!!document.getElementById('bu-arcade-launch'),{timeout:60000});
   // Mount and size of main CTA must be visible, not hidden by old nav.
   const home=await page.evaluate(()=>{
    const l=document.getElementById('bu-arcade-launch'),r=l.getBoundingClientRect(),s=getComputedStyle(l);
    const checkboxes=document.querySelectorAll('input[type=checkbox]').length;
    const native=['bible-unfolded-rewards-v17','bible-unfolded-wheel-ownership-v3825',
      'bible-unfolded-word-trails-next-v1'].map(k=>localStorage.getItem(k));
    return {r:{x:r.x,y:r.y,w:r.width,h:r.height},parent:l.parentElement.className,
      display:s.display,checkboxes,native,cardText:l.textContent};
   });
   console.log('TREASURE_HOME_'+vp.width,JSON.stringify({...home,native:'protected'}));
   assert(home.r.w>200&&home.r.h>65);
   assert(home.parent.includes('cinematic-cards'));
   assert(home.cardText.includes('BONUS GAME')&&home.cardText.includes('Treasure Quest'));
   await page.screenshot({path:'/tmp/BUTreasure-V2-'+vp.width+'-home.png'});
   // In a TEST ledger, simulate the last two stars needed for the first reward.
   const seed=await page.evaluate(key=>{
    const n=JSON.parse(localStorage.getItem(key)||'null')||
      {version:2,credits:420,stars:0,owned:['dawn'],scene:'dawn',crest:null,aura:null,goal:'library',
      daily:{},activity:{},week:{},trophies:[],evidence:{points:0,coins:0,levels:0},nudge:null};
    const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-(d.getDay()+6)%7);
    const id=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    n.week[id]={stars:4,claimed:[]};n.stars=4;
    localStorage.setItem(key,JSON.stringify(n));return id;
   },key);
   await page.reload({waitUntil:'domcontentloaded',timeout:120000});
   await page.waitForFunction(()=>!!window.BUTreasureQuest&&!!document.getElementById('bu-arcade-launch'),{timeout:60000});
   await page.evaluate(()=>document.getElementById('bu-arcade-launch').click());
   await page.waitForSelector('#bu-arcade-shell',{timeout:15000});
   const shell=await page.evaluate(()=>{
     const m=document.getElementById('bu-arcade-shell').getBoundingClientRect();
     return {x:m.x,y:m.y,w:m.width,h:m.height,vw:innerWidth,vh:innerHeight,
      tabs:document.querySelectorAll('#bu-arcade-shell .bu-a-tab').length,
      bonus:document.querySelector('[data-action=start]')?.textContent};
   });
   assert(shell.x>=-1&&shell.y>=-1&&shell.w<=shell.vw+1&&shell.h<=shell.vh+1);
   assert.equal(shell.tabs,3);
   assert(shell.bonus.includes('PLAY FREE BONUS'));
   await page.screenshot({path:'/tmp/BUTreasure-V2-'+vp.width+'-event.png'});
   const before=await page.evaluate(()=>window.BUTreasureQuest.preview());
   await page.evaluate(()=>document.querySelector('[data-action=start]').click());
   const game=await page.evaluate(()=>{
    const b=document.querySelector('#bu-arcade-play .bu-a-play-panel')?.getBoundingClientRect();
    return b?{w:b.width,h:b.height,screenW:innerWidth,screenH:innerHeight,tiles:document.querySelectorAll('.bu-a-card').length}:null;
   });
   assert(game&&game.tiles===6);
   assert(game.h<=game.screenH+2&&game.w<=game.screenW+2,
    'Bonus mini-game must fit one viewport without gameplay scrolling');
   await page.screenshot({path:'/tmp/BUTreasure-V2-'+vp.width+'-match.png'});
   await solve(page);
   await page.evaluate(()=>document.querySelector('.bu-a-chests button').click());
   await page.waitForSelector('#bu-arcade-win',{timeout:10000});
   const won=await page.evaluate(()=>({
     preview:window.BUTreasureQuest.preview(),
     wallet:['bible-unfolded-rewards-v17','bible-unfolded-wheel-ownership-v3825',
      'bible-unfolded-word-trails-next-v1'].map(k=>localStorage.getItem(k)),
     checks:document.querySelectorAll('input[type=checkbox]').length,
     reveal:document.querySelector('#bu-arcade-win')?.textContent
   }));
   assert(won.preview.stars>=before.stars+3&&won.preview.stars<=before.stars+5);
   assert(won.preview.credits>before.credits);
   assert.equal(Object.keys(won.preview.daily).length,1);
   assert(won.preview.trophies.some(t=>t===seed+':trail-6'),'Crossing 6-star threshold must award a trophy');
   assert(won.reveal.includes('TREASURE UNLOCKED'));
   assert.deepEqual(won.wallet,home.native,'Native progress and wallets must remain untouched');
   assert.equal(won.checks,home.checkboxes);
   await page.screenshot({path:'/tmp/BUTreasure-V2-'+vp.width+'-win.png'});
   await page.evaluate(()=>document.querySelector('#bu-arcade-win [data-action=close-win]').click());
   // Practice is intentionally playable but cannot farm repeat rewards.
   await page.evaluate(()=>document.querySelector('[data-action=start]').click());
   await solve(page);await page.evaluate(()=>document.querySelector('.bu-a-chests button').click());
   const practice=await page.evaluate(()=>window.BUTreasureQuest.preview());
   assert.equal(practice.stars,won.preview.stars,'Replay must not farm stars');
   assert.equal(practice.credits,won.preview.credits,'Replay must not farm credits');
   await page.evaluate(()=>document.querySelector('#bu-arcade-win [data-action=close-win]').click());
   await page.evaluate(()=>document.querySelector('.bu-a-tab[data-id=shop]').click());
   await page.waitForSelector('.bu-a-item');
   const artifacts=await page.evaluate(()=>document.querySelectorAll('.bu-a-item').length);
   assert(artifacts>=11);
   await page.evaluate(()=>{
    const btn=document.querySelector('[data-action=buy][data-id=starfall]');
    assert=!!btn;
    btn?.click();
   });
   await page.waitForSelector('#bu-arcade-win');
   await page.evaluate(()=>document.querySelector('#bu-arcade-win [data-action=close-win]').click());
   const applied=await page.evaluate(()=>({
    cardAura:document.querySelector('#bu-arcade-launch')?.dataset.aura,
    balance:window.BUTreasureQuest.preview(),checks:document.querySelectorAll('input[type=checkbox]').length
   }));
   assert(applied.balance.owned.includes('starfall'));
   assert.equal(applied.cardAura,'starfall');
   assert.equal(applied.checks,home.checkboxes);
   await page.reload({waitUntil:'domcontentloaded',timeout:120000});
   await page.waitForFunction(()=>!!window.BUTreasureQuest&&!!document.getElementById('bu-arcade-launch'),{timeout:60000});
   const persisted=await page.evaluate(()=>({
    p:window.BUTreasureQuest.preview(),
    aura:document.querySelector('#bu-arcade-launch')?.dataset.aura,
    native:['bible-unfolded-rewards-v17','bible-unfolded-wheel-ownership-v3825',
     'bible-unfolded-word-trails-next-v1'].map(k=>localStorage.getItem(k))
   }));
   assert.equal(persisted.p.credits,applied.balance.credits);
   assert.equal(persisted.p.stars,applied.balance.stars);
   assert(persisted.p.trophies.includes(seed+':trail-6'));
   assert.equal(persisted.aura,'starfall');
   assert.deepEqual(persisted.native,home.native);
   assert.deepEqual(errs,[]);
   console.log('PASS Treasure Quest '+vp.width+' bonus game, daily limit, weekly trophy, celebration, shop, save, native wallet');
   await page.close();await context.close();
  }
 }catch(e){console.error('FAIL_TREASURE_QUEST',e.stack||e);process.exitCode=1}
 finally{await browser?.close()}
})();
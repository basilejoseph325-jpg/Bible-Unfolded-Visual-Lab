// Read-only QA against the ACTUAL published Visual Lab TEST page.
// No changes to production storage or repositories. Browser context starts fresh.
'use strict';
const assert=require('node:assert/strict'),puppeteer=require('puppeteer-core');
const {execSync}=require('node:child_process');
const site='https://basilejoseph325-jpg.github.io/Bible-Unfolded-Visual-Lab/';
const chrome=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const expected=[
 {level:27,kind:'spark',word:'SALT'},
 {level:27,kind:'extra',word:'SLAP'},
 {level:28,kind:'spark',word:'LAMP'},
 {level:28,kind:'extra',word:'PALM'},
 {level:29,kind:'spark',word:'ROD'},
 {level:29,kind:'extra',word:'JAR'},
 {level:30,kind:'spark',word:'VEIL'},
 {level:30,kind:'extra',word:'EVIL'},
 {level:22,kind:'spark',word:'HAM'},
 {level:22,kind:'extra',word:'RAM'},
 {level:23,kind:'spark',word:'SON'},
 {level:23,kind:'extra',word:'NOISE'},
 {level:24,kind:'spark',word:'SEA'},
 {level:24,kind:'extra',word:'SEAL'},
 {level:25,kind:'spark',word:'EAGLE'},
 {level:26,kind:'spark',word:'REST'},
 {level:26,kind:'extra',word:'THREE'},
 {level:17,kind:'spark',word:'HAM'},
 {level:17,kind:'extra',word:'RAM'},
 {level:18,kind:'spark',word:'ELI'},
 {level:18,kind:'extra',word:'HEAL'},
 {level:19,kind:'spark',word:'CARE'},
 {level:20,kind:'spark',word:'AMON'},
 {level:20,kind:'extra',word:'MAN'},
 {level:21,kind:'spark',word:'ELI'},
 {level:21,kind:'extra',word:'SEAL'},
 {level:12,kind:'extra',word:'SEE'},
 {level:13,kind:'spark',word:'REST'},
 {level:13,kind:'extra',word:'THREE'},
 {level:15,kind:'spark',word:'HOME'},
 {level:16,kind:'spark',word:'NOAH'},
 {level:19,kind:'extra',word:'HEAR'},
 {level:14,kind:'extra',word:'END'},
 {level:15,kind:'extra',word:'HEM'},
 {level:20,kind:'spark',word:'AMON'},
 {level:25,kind:'extra',word:'AGE'}
];
(async()=>{
 const browser=await puppeteer.launch({headless:true,executablePath:chrome,
  args:['--no-sandbox','--disable-setuid-sandbox','--autoplay-policy=no-user-gesture-required'],protocolTimeout:120000});
 try{
  for(const [width,height] of [[390,705],[320,568]]){
   const context=await browser.createBrowserContext(),page=await context.newPage(),errors=[];
   await page.setViewport({width,height,isMobile:true,hasTouch:true,deviceScaleFactor:2});
   page.on('pageerror',e=>errors.push(e.message.slice(0,150)));
   await page.goto(site+'index.html?verify=wt-editorial-20261113-v22',{waitUntil:'domcontentloaded',timeout:120000});
   // Native menu readiness does NOT mean the separate deferred home-card launcher is installed.
   // The launcher injects #wt-next-launch-style only after its capture-phase click router exists.
   // Clicking earlier enters the old selector and falsely looks like a small-screen failure.
   await page.waitForFunction(()=>window.BUWTNativeShell?.nativeReady?.() &&
     !!document.getElementById('wt-next-launch-style'),{timeout:120000});
   const indexVersion=await page.evaluate(()=>[...document.scripts].find(x=>x.src.includes('journey-progress-caption.js'))?.src);
   assert(indexVersion?.includes('20261113-wt-editorial-v22'),'Published ROOT bootstrap is not v22');
   await page.evaluate(()=>document.getElementById('home-cross').click());
   await page.waitForFunction(()=>window.BUWTNativeShell?.active?.()&&
     !!document.getElementById('bu-wt-native-game')?.contentWindow?.BUWTUnifiedMenu,{timeout:70000});
   // UnifiedMenu is registered before the deferred 19-level content file runs.
   // Wait for the ACTUAL Bible level pack, not merely for the menu to exist.
   await page.waitForFunction(()=>document.getElementById('bu-wt-native-game')?.contentWindow?.BUWTAdditionalLevels?.length===19,{timeout:60000});
   const state=await page.evaluate(()=>{
    const frame=document.getElementById('bu-wt-native-game');
    const child=frame.contentWindow,levels=child.BUWTAdditionalLevels||[];
    const box=frame.getBoundingClientRect();
    const revisions=[12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30].map(n=>{
      const l=levels[n-12];
      return {level:n,spark:l?.spark,extras:l?.extraSparks?.map(x=>x.word),
       extraDetails:l?.extraSparks?.map(x=>({word:x.word,reference:x.reference,clue:x.clue,insight:x.insight})),
       boards:l?.bibleBoard?.map(x=>({word:x.word,reference:x.reference,insight:x.insight})),
       sparkClue:l?.clue,sparkInsight:l?.insight,
        reference:l?.reference,levelTitle:l?.title};
    });
    return {versions:{
      frame:frame.src,
      levels:[...child.document.scripts].find(s=>s.src.includes('word-trails-levels-12-30-v1.js'))?.src
     },n:levels.length,revisions,
     geometry:{frameWidth:box.width,frameHeight:box.height,scroll:child.document.body.scrollHeight-child.innerHeight},
     nativeMenu:!!document.getElementById('game-menu'),
     nativeSettings:!!document.getElementById('settings-dialog'),
     wheel:!!child.document.querySelector('#wheel'),
     board:!!child.document.querySelector('#board')};
   });
   assert.equal(state.n,19,'All levels 12–30 must load on the public TEST site');
   assert(state.versions.frame.includes('source-review6-20261113-v22'));
   assert(state.versions.levels.includes('source-review6-20261113-v22'));
   assert(state.nativeMenu&&state.nativeSettings&&state.wheel&&state.board,'Actual shared menu + game render');
   assert(state.geometry.frameWidth>=width-2&&state.geometry.frameHeight>=height-2,'Full-screen native overlay');
   for(const t of expected){
    const q=state.revisions.find(r=>r.level===t.level);
    assert(q&&(t.kind==='spark'?q.spark===t.word:q.extras.includes(t.word)),
     'Published Bible item missing '+t.level+' '+t.word);
   }
   const reviewed=state.revisions.find(x=>x.level===19)?.extraDetails?.find(x=>x.word==='HEAR');
   assert(reviewed&&reviewed.reference==='Romans 10:14, 17'&&reviewed.clue.startsWith('Paul asked'), 'Published HEAR item must be sourced to Romans 10:14,17');
   const find=(level)=>state.revisions.find(x=>x.level===level);
   assert(find(12).extraDetails.find(x=>x.word==='SEE')?.clue.startsWith("Jesus told a man who'd been blind"),'Level 12 SEE new NWT clue');
   assert(find(13).reference==='Matthew 11:28-30'&&find(13).sparkInsight.includes('refreshment'),'Level 13 REST uses NWT wording');
   assert(find(13).boards.find(x=>x.word==='ESTHER')?.reference==='Esther 2:7, 11, 17','Level 13 Esther full source');
   assert(find(13).extraDetails.find(x=>x.word==='THREE')?.reference==='Daniel 3:16-23','Level 13 furnace context');
   assert(find(14).boards.find(x=>x.word==='DAN')?.insight.includes('Bilhah'),'Level 14 Dan identity');
   assert(find(15).reference==='Luke 8:38, 39'&&find(15).sparkClue.includes('freed a man'),'Level 15 HOME linked to Luke');
   assert(find(15).extraDetails.find(x=>x.word==='HEM')?.insight.includes('fringe, not a hem specifically'),'Level 15 HEM distinction');
   assert(find(16).reference==='Genesis 6:9, 11-14, 22'&&find(16).sparkInsight.includes('violence'),'Level 16 Noah teaching');
   assert(find(16).boards.find(x=>x.word==='SIN')?.insight.includes('everlasting life'),'Level 16 Romans contrast');
   // Published source-first level 17–21 editorial batch: verify all 14 revisions in game memory.
   assert(find(17).boards.find(x=>x.word==='SARAH')?.reference==='Genesis 17:15, 16','L17 SARAH cited promise');
   assert(find(17).boards.find(x=>x.word==='MARAH')?.reference==='Exodus 15:22-25'&&find(17).boards.find(x=>x.word==='MARAH')?.insight.includes('became sweet'),'L17 MARAH context');
   assert(find(17).extraDetails.find(x=>x.word==='RAM')?.reference==='Genesis 22:10-13','L17 RAM substitution');
   assert(find(18).boards.find(x=>x.word==='ELIJAH')?.insight.includes('ravens'),'L18 ELIJAH support');
   assert(find(18).sparkInsight.includes("wouldn't listen"),'L18 ELI disciplinary story');
   assert(find(18).extraDetails.find(x=>x.word==='HEAL')?.reference==='2 Kings 5:2, 3, 11-14','L18 HEAL full chapter context');
   assert(find(19).boards.find(x=>x.word==='RACHEL')?.insight.includes('just a few days'),'L19 RACHEL meaning');
   assert(find(19).reference==='1 Peter 5:6, 7'&&find(19).sparkClue.includes('because of his what'),'L19 CARE clear playable clue');
   assert(find(20).boards.find(x=>x.word==='SAMSON')?.insight.includes('Samson\'s muscles'),'L20 SAMSON source nuance');
   assert(find(20).boards.find(x=>x.word==='AMOS')?.insight.includes('earthquake'),'L20 AMOS historical insight');
   assert(find(20).extraDetails.find(x=>x.word==='MAN')?.insight.includes('living person'),'L20 MAN NWT wording');
   assert(find(21).boards.find(x=>x.word==='ELISHA')?.reference==='2 Kings 2:13-15','L21 ELISHA');
   assert(find(21).sparkInsight.includes('jump to conclusions'),'L21 ELI corrected assumption');
   assert(find(21).extraDetails.find(x=>x.word==='SEAL')?.reference==='Revelation 5:1-5','L21 SEAL expanded');
   // New Word Trails 22–26 editorial v22: check all 17 new source revisions in ACTUAL published iframe.
   assert(find(22).boards.find(x=>x.word==='MARTHA')?.reference==='Luke 10:38-42'&&find(22).boards.find(x=>x.word==='MARTHA')?.insight.includes('Mary chose'),'L22 MARTHA source and meaning');
   assert(find(22).boards.find(x=>x.word==='TAMAR')?.reference==='Genesis 38:6-14'&&find(22).boards.find(x=>x.word==='TAMAR')?.insight.includes('remain a widow'),'L22 TAMAR chapter context');
   assert(find(22).extraDetails.find(x=>x.word==='RAM')?.insight.includes('two unblemished rams'),'L22 RAM installation detail');
   assert(find(23).boards.find(x=>x.word==='SIMEON')?.insight.includes("wouldn't die"),'L23 SIMEON');
   assert(find(23).boards.find(x=>x.word==='SIMON')?.reference==='Matthew 4:18-20','L23 SIMON');
   assert(find(23).extraDetails.find(x=>x.word==='NOISE')?.insight.includes('not an actual windstorm'),'L23 NOISE');
   assert(find(24).boards.find(x=>x.word==='BABEL')?.reference==='Genesis 11:4-9'&&find(24).boards.find(x=>x.word==='BABEL')?.insight.includes('avoid being scattered'),'L24 BABEL');
   assert(find(24).boards.find(x=>x.word==='ABEL')?.reference==='Genesis 4:2-5','L24 ABEL');
   assert(find(24).reference==='Mark 4:35-41'&&find(24).sparkInsight.includes('storm'),'L24 SEA');
   assert(find(24).extraDetails.find(x=>x.word==='SEAL')?.reference==='Daniel 12:4, 8, 9','L24 SEAL');
   assert(find(25).boards.find(x=>x.word==='GALILEE')?.insight.includes('compassion'),'L25 GALILEE');
   assert(find(25).boards.find(x=>x.word==='ELI')?.reference==='1 Samuel 3:15-18','L25 ELI');
   assert(find(25).reference==='Job 39:26-29'&&find(25).sparkInsight.includes('cliff'),'L25 EAGLE');
   assert(find(26).boards.find(x=>x.word==='ESTHER')?.insight.includes('Hadassah'),'L26 ESTHER');
   assert(find(26).boards.find(x=>x.word==='RUTH')?.reference==='Ruth 1:14-17','L26 RUTH');
   assert(find(26).reference==='Genesis 2:2, 3'&&find(26).sparkInsight.includes('declared it sacred'),'L26 REST');
   assert(find(26).extraDetails.find(x=>x.word==='THREE')?.insight.includes('sea became calm'),'L26 THREE');
   // Final Word Trails editorial batch v22: 14 revised Bible-linked items in deployed TEST frame.
   assert(find(27).boards.find(x=>x.word==='PAUL')?.reference==='Acts 13:4-9'&&find(27).boards.find(x=>x.word==='PAUL')?.insight.includes("same man"),'L27 PAUL');
   assert(find(27).boards.find(x=>x.word==='SAUL')?.reference==='Acts 13:1-9'&&find(27).boards.find(x=>x.word==='SAUL')?.insight.includes("doesn't say"),'L27 SAUL');
   assert(find(27).sparkClue.includes('lose its strength')&&find(27).sparkInsight.includes('genuinely useful'),'L27 SALT');
   assert(find(28).boards.find(x=>x.word==='PSALMS')?.insight.includes('streams of water'),'L28 PSALMS');
   assert(find(28).boards.find(x=>x.word==='PSALM')?.reference==='Psalm 23:1-4','L28 PSALM');
   assert(find(28).sparkInsight.includes('next footstep'),'L28 LAMP');
   assert(find(28).extraDetails.find(x=>x.word==='PALM')?.reference==='Psalm 92:12-14','L28 PALM');
   assert(find(29).boards.find(x=>x.word==='JORDAN')?.insight.includes('overflowing its banks'),'L29 JORDAN');
   assert(find(29).reference==='Exodus 4:2-5'&&find(29).sparkInsight.includes('became a serpent'),'L29 ROD');
   assert(find(29).extraDetails.find(x=>x.word==='JAR')?.reference==='2 Kings 4:1-7','L29 JAR');
   assert(find(30).boards.find(x=>x.word==='LEVITES')?.insight.includes('Not every Levite served as a priest'),'L30 LEVITES');
   assert(find(30).boards.find(x=>x.word==='LEVI')?.insight.includes('third son'),'L30 LEVI');
   assert(find(30).reference==='2 Corinthians 3:12-16'&&find(30).sparkInsight.includes('bigger spiritual comparison'),'L30 VEIL');
   assert(find(30).extraDetails.find(x=>x.word==='EVIL')?.reference==='Romans 12:19-21','L30 EVIL');
   assert(state.geometry.scroll<=0,'No in-game vertical scrolling');
   if(width===390)await page.screenshot({path:'/tmp/WT-EDITORIAL-V22-PUBLISHED-390.png'});
   assert.equal(errors.length,0,'No webpage JS exceptions: '+JSON.stringify(errors));
   console.log('PASS_PUBLISHED_WORD_TRAILS_EDITORIAL_V22',JSON.stringify({width,height,state}));
   await context.close();
  }
 }catch(e){console.error('FAIL_PUBLISHED_WORD_TRAILS_TEST',e.stack||e);process.exitCode=1}
 finally{await browser.close()}
})();

/* TEST — Bible Trivia Genesis 1:29,30 editorial fix + fourth tablet texture.
   Uses native #bu34-trivia and native question renderer, no test-only UI mock. */
const puppeteer=require('puppeteer-core');
const assert=require('node:assert/strict');
const {execSync}=require('node:child_process');
const executablePath=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const url='http://127.0.0.1:8899/index.html';
(async()=>{
 let browser;
 try{
  browser=await puppeteer.launch({headless:true,executablePath,args:['--no-sandbox','--disable-setuid-sandbox']});
  for(const vp of [
   {width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:2},
   {width:832,height:384,isMobile:true,hasTouch:true,deviceScaleFactor:2}
  ]){
   const context=await browser.createBrowserContext(),page=await context.newPage(),errors=[];
   await page.setViewport(vp);page.on('pageerror',e=>errors.push(e.message));
   await page.goto(url,{waitUntil:'domcontentloaded',timeout:120000});
   await page.waitForSelector('#home-trivia',{timeout:60000});
   await page.waitForFunction(()=>window.BU_TRIVIA_GENESIS_FOOD_CORRECTION_TEST?.appliedToBank===true,{timeout:15000});
   const doc=await page.evaluate(()=>{
    const q=BU34_BANK.genesis.find(x=>x.q.includes('which foods does Jehovah specifically mention'));
    return {question:q?.q,choices:q?.choices,correct:q?.correct,explanation:q?.explanation,
      hint:q?.creationFreeHint,identity:q?.researchId,ref:q?.ref,url:q?.sourceUrl,
      count:BU34_BANK.genesis.filter(x=>x.q.includes('specifically mention')).length,
      other:BU34_BANK.genesis.filter(x=>x.q.startsWith('Which statement matches the foods assigned')).length};
   });
   console.log('GENESIS_SOURCE_'+vp.width,JSON.stringify(doc));
   assert.equal(doc.count,1);assert.equal(doc.other,0);
   assert.equal(doc.correct,1);
   assert.equal(doc.identity,'Which statement matches the foods assigned in Genesis 1:29, 30?');
   assert.equal(doc.choices.length,4);
   assert(doc.question.includes('specifically mention'));
   assert(doc.choices[1].includes('animals and birds'));
   assert(doc.explanation.includes('do not say that humans were forbidden'));
   assert(doc.hint.includes('verse 30'));
   assert.equal(doc.url,'https://www.jw.org/en/library/bible/nwt/books/genesis/1/');
   // Render this actual stored bank item in the real native Trivia renderer.
   await page.evaluate(()=>{
    document.getElementById('daily-continue')?.click();
    document.getElementById('home-trivia').click();
    if(typeof bu34Start==='function')bu34Start('quick');
    const q=BU34_BANK.genesis.find(x=>x.q.includes('which foods does Jehovah specifically mention'));
    if(!q)throw Error('Corrected question not loaded');
    bu34Quiz.items=[{...q,choices:[...q.choices]}];
    bu34Quiz.step=0;bu34Quiz.answered=false;bu34Quiz.selected=null;
    bu34Draw();
   });
   await page.waitForFunction(()=>document.querySelectorAll('#bu34-body [data-answer]').length===4,{timeout:15000});
   const getVisual=()=>page.evaluate(()=>{
    const buttons=[...document.querySelectorAll('#bu34-body [data-answer]')];
    return {
     text:document.querySelector('#bu34-body')?.textContent.slice(0,700),
     choices:buttons.map(b=>({text:b.querySelector('span')?.textContent||'',
      disabled:b.disabled,classes:b.className,rect:(()=>{const r=b.getBoundingClientRect();return [r.x,r.y,r.width,r.height]})(),
      image:getComputedStyle(b).backgroundImage,
      before:getComputedStyle(b,'::before').display,
      opacity:Number(getComputedStyle(b).opacity)})),
     stage:{w:innerWidth,h:innerHeight}
    };
   });
   let before=await getVisual();console.log('TABLETS_BEFORE_'+vp.width,JSON.stringify(before).slice(0,6000));
   assert(before.text.includes('which foods does Jehovah specifically mention'));
   assert.equal(before.choices.length,4);
   for(const option of before.choices){
    assert(option.image.includes('trivia-real-rock-v4.jpg'),'Stone photo missing on '+option.text);
    assert.equal(option.before,'none','Original pseudo compositing must be disabled');
    assert.equal(option.opacity,1,'Unanswered choices must have equal full opacity');
    assert(option.rect[0]>=-1&&option.rect[0]+option.rect[2]<=vp.width+1,
      'Choice overflows horizontal viewport');
   }
   await page.screenshot({path:'/tmp/BU-TRIVIA-GENESIS-STONE-'+vp.width+'-neutral.png'});
   // Correct native choice must still score and show green; D must remain textured.
   await page.evaluate(()=>document.querySelector('#bu34-body [data-answer="1"]').click());
   const after=await getVisual();
   console.log('TABLETS_ANSWERED_'+vp.width,JSON.stringify(after.choices).slice(0,5000));
   assert(after.choices[1].classes.includes('correct'),'Correct source index must be graded green');
   assert(after.choices[3].image.includes('trivia-real-rock-v4.jpg'),'D goes blank after question is judged');
   assert(after.choices[3].opacity>=.89,'D should not fade nearly white');
   const q=await page.evaluate(()=>({answered:bu34Quiz.answered,score:bu34Quiz.score}));
   assert(q.answered&&q.score>=1,'Native trivia answer and score must still work');
   await page.screenshot({path:'/tmp/BU-TRIVIA-GENESIS-STONE-'+vp.width+'-graded.png'});
   assert.deepEqual(errors,[],'JavaScript errors: '+JSON.stringify(errors));
   console.log('PASS_GENESIS_TABLET_'+vp.width);
   await context.close();
  }
 }catch(e){console.error('FAIL_GENESIS_TABLET',e.stack||e);process.exitCode=1}
 finally{await browser?.close()}
})();

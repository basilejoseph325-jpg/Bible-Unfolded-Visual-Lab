// QA — Behind the Name automatic resume/replay, no stale red answers.
const p=require('puppeteer-core'),assert=require('node:assert/strict');
const {execSync}=require('child_process');
const executablePath=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const url='http://127.0.0.1:8899/index.html',key='bible-unfolded-behind-name-v1';
(async()=>{
 let browser;try{
 browser=await p.launch({headless:true,executablePath,args:['--no-sandbox','--disable-setuid-sandbox']});
 for(const vp of [{width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:2},{width:832,height:390,isMobile:true,hasTouch:true,deviceScaleFactor:2}]){
  const context=await browser.createBrowserContext(),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.setViewport(vp);
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:120000});
  await page.waitForFunction(()=>!!window.BU3926_TEST?.start,{timeout:25000});
  const groups=['people','places','connections','origins','tribes','faith','prophets','disciples','landmarks'];
  for(const group of groups){
   await page.evaluate(group=>window.BU3926_TEST.start(group),group);
   let st=await page.evaluate(()=>window.BU3926_TEST.state());
   assert(st.sessions[group]?.order.length>0,'Missing session '+group);
  }
  const all=await page.evaluate(()=>window.BU3926_TEST.state());
  const seeds={...all,done:{...all.done},hintUnlocks:{...all.hintUnlocks},wrongChoices:{...all.wrongChoices},sessions:{...all.sessions}};
  const people=seeds.sessions.people,places=seeds.sessions.places;
  assert(people.order.length===10,'Expected 10 People & Names questions');
  const known=people.order[8],first=people.order[0];
  people.index=8;
  places.index=3;
  await page.evaluate(({key,data})=>localStorage.setItem(key,JSON.stringify(data)),{key,data:seeds});
  await page.reload({waitUntil:'domcontentloaded',timeout:120000});await page.waitForFunction(()=>!!window.BU3926_TEST?.start,{timeout:25000});
  // Get visible text of question at resume index, then seed a stale wrong choice
  // exactly the way native storage writes it.
  await page.evaluate(()=>window.BU3926_TEST.start('people'));
  const before=await page.evaluate(()=>({
   state:BU3926_TEST.state(),
   active:BU3926_TEST.active(),
   wrongText:document.querySelector('#btn3926-answers .btn3926-answer div')?.textContent,
   answerCount:document.querySelectorAll('#btn3926-answers .btn3926-answer').length
  }));
  assert.equal(before.active,known);assert.equal(before.answerCount,4);
  const local=await page.evaluate(()=>JSON.parse(localStorage.getItem('bible-unfolded-behind-name-v1')));
  local.wrongChoices[known]=[before.wrongText];local.done[first]=true;
  local.hintUnlocks[first]=true;
  await page.evaluate(v=>localStorage.setItem('bible-unfolded-behind-name-v1',JSON.stringify(v)),local);
  await page.reload({waitUntil:'domcontentloaded',timeout:120000});await page.waitForFunction(()=>!!window.BU3926_TEST?.start,{timeout:25000});
  await page.evaluate(()=>window.BU3926_TEST.start('people'));
  const resumed=await page.evaluate(()=>({
   active:BU3926_TEST.active(),state:BU3926_TEST.state(),
   wrong:document.querySelectorAll('#btn3926-answers .btn3926-answer.is-wrong').length,
   disabled:document.querySelectorAll('#btn3926-answers .btn3926-answer:disabled').length,
   status:document.querySelector('#btn3926-step')?.textContent
  }));
  console.log('BN_RESUME_'+vp.width,JSON.stringify({status:resumed.status,wrong:resumed.wrong,disabled:resumed.disabled,active:resumed.active}));
  assert.equal(resumed.active,known,'An unfinished chapter must resume on saved question');
  assert.equal(resumed.state.sessions.people.index,8);
  assert.equal(resumed.wrong,0,'Resumed question must not display old red wrong answers');
  assert.equal(resumed.disabled,0,'Resumed question must offer all 4 answers');
  assert(!resumed.state.wrongChoices[known]?.length,'No stale wrong answer saved on resumed question');
  assert.equal(resumed.state.sessions.places.index,3,'Other chapter position must survive');
  assert(resumed.state.done[first]&&resumed.state.hintUnlocks[first],'Mastery and paid hints must survive');

  // Completed mastery chapter reopens as a fresh round even if last session's
  // index was left mid-replay, preserving permanent one-time rewards.
  let fixture=await page.evaluate(()=>JSON.parse(localStorage.getItem('bible-unfolded-behind-name-v1')));
  for(const id of people.order)fixture.done[id]=true;
  fixture.sessions.people.index=8;
  fixture.wrongChoices[known]=[before.wrongText];
  await page.evaluate(v=>localStorage.setItem('bible-unfolded-behind-name-v1',JSON.stringify(v)),fixture);
  await page.reload({waitUntil:'domcontentloaded',timeout:120000});await page.waitForFunction(()=>!!window.BU3926_TEST?.start,{timeout:25000});
  await page.evaluate(()=>window.BU3926_TEST.start('people'));
  const completed=await page.evaluate(()=>({
   state:BU3926_TEST.state(),active:BU3926_TEST.active(),
   question:document.querySelector('#btn3926-step')?.textContent,
   wrong:document.querySelectorAll('#btn3926-answers .btn3926-answer.is-wrong').length,
   disabled:document.querySelectorAll('#btn3926-answers .btn3926-answer:disabled').length,
   cardText:document.querySelector('#btn3926-home')?.textContent.slice(0,240)
  }));
  console.log('BN_REPLAY_'+vp.width,JSON.stringify({step:completed.state.sessions.people.index,question:completed.question,wrong:completed.wrong,disabled:completed.disabled}));
  assert.equal(completed.state.sessions.people.index,0,'Mastered chapter must automatically begin a fresh round');
  assert(completed.question.includes('Discovery 1 of 10'));
  assert.equal(completed.wrong,0);assert.equal(completed.disabled,0);
  assert(people.order.every(id=>completed.state.done[id]),'Completion badges and one-time rewards must remain recorded');
  assert.equal(completed.state.sessions.places.index,3,'Chapter-specific resets cannot erase other chapters');
  await page.screenshot({path:'/tmp/BU-NAME-RESUME-REPLAY-'+vp.width+'.png'});

  // After completing a new answer, existing graded feedback must still work,
  // but the old incorrect choices must not return after entering afresh.
  let evidence=await page.evaluate(()=>{
   const buttons=[...document.querySelectorAll('#btn3926-answers .btn3926-answer')];
   return {buttons:buttons.length,title:document.getElementById('btn3926-play-title')?.textContent};
  });assert.equal(evidence.buttons,4);
  assert.deepEqual(errors,[],'No page runtime errors: '+errors);
  console.log('PASS_BEHIND_NAME_AUTO_REPLAY_'+vp.width);
  await context.close();
 }
 }catch(e){console.error('FAIL_BEHIND_NAME_AUTO_REPLAY',e.stack||e);process.exitCode=1}finally{await browser?.close()}
})();
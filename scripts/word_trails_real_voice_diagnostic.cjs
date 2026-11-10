/* Read-only real prerecorded announcer diagnosis; never mute native API with a stub.
   Original 20 clips, native selected speaker, root cooldown and Android-sized viewport. */
const puppeteer=require('puppeteer-core'), assert=require('node:assert/strict');
const {execSync}=require('node:child_process');
const executablePath=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
(async()=>{
 const browser=await puppeteer.launch({headless:true,executablePath,args:['--no-sandbox','--disable-setuid-sandbox','--autoplay-policy=no-user-gesture-required']});
 const page=await browser.newPage();page.setDefaultTimeout(60000);
 try{
  page.on('pageerror',e=>console.log('PAGEERROR',e.message.slice(0,200)));
  await page.setViewport({width:390,height:705,isMobile:true,hasTouch:true,deviceScaleFactor:2});
  await page.goto('http://127.0.0.1:8907/index.html',{waitUntil:'domcontentloaded',timeout:120000});
  await page.waitForFunction(()=>window.BUWTNativeShell?.nativeReady?.()&&typeof window.bu381Play==='function');
  await page.evaluate(()=>window.BUWTNativeShell.launch());
  await page.waitForFunction(()=>document.getElementById('bu-wt-native-game')?.contentWindow?.document?.getElementById('solved-count')&&
    document.getElementById('bu-wt-native-game')?.contentWindow?.BUWTAnnouncer);
  const setup=await page.evaluate(()=>{
   const audioHistory=[],results=[];
   const old=HTMLMediaElement.prototype.play;
   HTMLMediaElement.prototype.play=function(...args){
    const entry={time:Date.now(),srcHead:String(this.currentSrc||this.src).slice(0,48),volume:this.volume,muted:this.muted,tag:this.tagName};
    audioHistory.push(entry);
    try{const ret=old.apply(this,args);if(ret?.then)ret.then(()=>entry.resolved='yes',e=>entry.rejected=e?.name||e?.message);return ret}
    catch(e){entry.threw=e.message;throw e}
   };
   const original=window.bu381Play;
   window.bu381Play=(phrase,opts)=>{
    const res=original(phrase,opts);
    results.push({phrase,opts,returned:res,at:Date.now()});
    return res
   };
   window.__voiceDiag={results,audioHistory};
   const f=document.getElementById('bu-wt-native-game').contentWindow;
   let core={};
   try{const v=eval('bu381Voice');core={voiceMode:v.mode,volume:v.volume,lastPlayAt:v.lastPlayAt,now:!!v.now}}catch(e){core={error:e.message}}
   return {core,root:window.BUWTNativeShell.voicePrefs(),child:f.BUWTAnnouncer.getMode(),
    watchHidden:document.getElementById('watch-player')?.hidden,documentHidden:document.hidden,
    wasAudioCalled:audioHistory.length};
  });
  console.log('REAL_VOICE_START',JSON.stringify(setup));
  const before=await page.evaluate(()=>{
   const child=document.getElementById('bu-wt-native-game').contentWindow;
   return {first:child.BUWTAnnouncer.play('excellent_thinking',{milestone:true}),
    second:child.BUWTAnnouncer.play('excellent_thinking',{milestone:true})};
  });
  await new Promise(r=>setTimeout(r,1400));
  console.log('REAL_VOICE_TWICE_IMMEDIATELY',JSON.stringify({before,...await page.evaluate(()=>{
   let v=null;try{v=eval('bu381Voice')}catch(_){}
   return {core:v?{lastPlayAt:v.lastPlayAt,active:v.active,now:!!v.now}:null,log:window.__voiceDiag}
  })}));
  await page.evaluate(()=>window.BUWTNativeShell.close());
  await page.evaluate(()=>window.BUWTNativeShell.launch());
  await page.waitForFunction(()=>document.getElementById('bu-wt-native-game')?.contentWindow?.document?.getElementById('solved-count'));
  const board=await page.evaluate(()=>{
   const f=document.getElementById('bu-wt-native-game').contentWindow.document;
   const solve=word=>{
    const indices=new Set();
    for(const letter of word){
     const button=[...f.querySelectorAll('.wheel-letter')].find(b=>b.textContent===letter&&!indices.has(Number(b.dataset.letterIndex)));
     if(!button)throw Error('Missing letter '+letter);
     indices.add(Number(button.dataset.letterIndex));button.click();
    }
    f.getElementById('submit').click();
   };
   solve('ANTIC');solve('TACO');
   return {solved:f.getElementById('solved-count').textContent,source:'actual Word Trails word submissions'};
  });
  await new Promise(r=>setTimeout(r,350));
  console.log('REAL_VOICE_WHILE_SOLVING',JSON.stringify({board,...await page.evaluate(()=>window.__voiceDiag)}));
  assert.equal(board.solved,'2 / 4');
  // Do not accept merely seeing a function call: wait for the actual native
  // playing recording after its legitimate 12-second cooldown has elapsed.
  await page.waitForFunction(()=>{
   const d=window.__voiceDiag;
   return d.results.filter(x=>x.phrase==='excellent_thinking'&&x.returned===true).length>=2 &&
     d.audioHistory.filter(x=>x.tag==='AUDIO'&&x.resolved==='yes').length>=2;
  },{timeout:22500});
  const played=await page.evaluate(()=>({
   voices:window.__voiceDiag.results.filter(x=>x.phrase==='excellent_thinking').map(x=>({returned:x.returned,opts:x.opts,at:x.at})),
   audioStarts:window.__voiceDiag.audioHistory.filter(x=>x.tag==='AUDIO').length,
   audioResolved:window.__voiceDiag.audioHistory.filter(x=>x.tag==='AUDIO'&&x.resolved==='yes').length,
   childMode:document.getElementById('bu-wt-native-game').contentWindow.BUWTAnnouncer.getMode()
  }));
  console.log('REAL_MIDGAME_RECORDING_AFTER_COOLDOWN',JSON.stringify(played));
  assert(played.voices.some(x=>x.returned===false),'Must actually encounter a native refusal before queued retry');
  assert.equal(played.voices.filter(x=>x.returned===true).length,2,
    'Initial priming and one successful gameplay voice, never repeated applause');

  // Finish the crossword immediately after that voice. The native system would
  // normally reject another clip; the queue must retain the genuine level-end
  // phrase until the current native recording/cooldown permits it.
  const last=await page.evaluate(()=>{
   const f=document.getElementById('bu-wt-native-game').contentWindow.document;
   const solve=word=>{
    const used=new Set();
    for(const ch of word){
     const b=[...f.querySelectorAll('.wheel-letter')].find(x=>x.textContent===ch&&!used.has(Number(x.dataset.letterIndex)));
     if(!b)throw Error('Cannot solve '+word);
     used.add(Number(b.dataset.letterIndex));b.click()
    }
    f.getElementById('submit').click();
   };
   solve('TONIC');solve('COIN');
   return {solved:f.getElementById('solved-count').textContent};
  });
  await page.waitForFunction(()=>document.getElementById('bu-wt-native-game')?.contentWindow?.document?.getElementById('finish')?.open,
      {timeout:12000});
  console.log('LEVEL_FINISHED_WITH_REAL_VOICE_ACTIVE',JSON.stringify(last));
  await page.waitForFunction(()=>window.__voiceDiag.results.some(x=>x.phrase==='chapter_complete'&&x.returned===true),
      {timeout:22500});
  const completed=await page.evaluate(()=>{
   const d=window.__voiceDiag;
   return {ended:d.results.filter(x=>x.phrase==='chapter_complete'),audioStarts:d.audioHistory.length};
  });
  console.log('REAL_COMPLETION_RECORDING_NOT_LOST',JSON.stringify(completed));
  assert(completed.ended.some(x=>x.returned===true));

  // Turn off original announcer, then reset the board voice session.
  // Neither a queued retry nor an existing clip may disregard native Off.
  const disabled=await page.evaluate(()=>{
   const sel=document.getElementById('bu381-voice-mode');sel.value='off';
   sel.dispatchEvent(new Event('change',{bubbles:true}));
   const child=document.getElementById('bu-wt-native-game').contentWindow;
   child.BUWTAnnouncer.resetProgress();
   const before=window.__voiceDiag.results.length;
   const request=child.BUWTAnnouncer.progress();
   return {request,before,mode:child.BUWTAnnouncer.getMode(),after:window.__voiceDiag.results.length};
  });
  await new Promise(r=>setTimeout(r,1600));
  assert.equal(disabled.mode,'off');assert.equal(disabled.request,false);
  assert.equal(disabled.before,disabled.after);
  assert.equal(await page.evaluate(()=>window.__voiceDiag.results.length),disabled.before);
  console.log('ORIGINAL_OFF_SETTING_PRESERVED',JSON.stringify(disabled));
  console.log('PASS real native prerecorded midgame voice, cooldown retry, completion and Off settings.');
 }catch(e){console.error('REAL_VOICE_DIAG_FAILED',e.stack||e);process.exitCode=1}
 finally{await browser.close()}
})();
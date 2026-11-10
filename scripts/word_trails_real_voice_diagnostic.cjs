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
  console.log('DONE: inspected real root prerecorded speech attempts, not mocked returns.');
 }catch(e){console.error('REAL_VOICE_DIAG_FAILED',e.stack||e);process.exitCode=1}
 finally{await browser.close()}
})();
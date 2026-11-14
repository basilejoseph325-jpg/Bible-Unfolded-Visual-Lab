#!/usr/bin/env node
'use strict';
/*
 * TEST-only, sanitized future LIVE-candidate rehearsal.
 * Remove ONLY the known noncommercial ElevenLabs demo bundle script tag from
 * a TEMPORARY candidate HTML response. Never edit the source TEST HTML,
 * release LIVE, touch real saves, or certify licensing by this browser run.
 *
 * Real WebKit checks native-home->crossword, announcer controls/Off/volume,
 * voice routing through the native parent host, no bundled demo requests,
 * one-screen game availability, existing LIVE save isolation, and reentry.
 */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const {webkit}=require('playwright');
const ROOT='http://127.0.0.1:8893/index.html';
const TEST='bu-visual-lab-wordtrails-next-v1';
const LIVE='bible-unfolded-word-trails-next-v1';
const GUARD='bu-audio-candidate-v1-sentinel';
const htmlPath=path.resolve(__dirname,'../experiments/word-trails-next-v1.html');
const html=fs.readFileSync(htmlPath,'utf8');
const oldTag='<script src="word-trails-original-voice-clips-v1.js?v=original-voices-20261109" defer></script>';
assert.equal(html.split(oldTag).length,2,'TEST HTML changed; re-review exact demo clip script tag');
const sanitized=html.replace(oldTag,'<!-- NO NONCOMMERCIAL DEMO CLIPS: native original announcer host only; commercial rights not certified -->');
assert(!sanitized.includes('src="word-trails-original-voice-clips-v1.js'),'Candidate still loads demo clip bundle');
const demoKey='word-trails-original-voice-clips-v1.js';
function checkCandidate(){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'bu-wt-demo-free-native-candidate-'));
 try{
  for(const rel of ['experiments/word-trails-next-v1.html',
   'experiments/word-trails-announcer-v1.js',
   'experiments/word-trails-main-settings-v1.js']){
   const target=path.join(dir,rel);
   fs.mkdirSync(path.dirname(target),{recursive:true});
   fs.writeFileSync(target,rel.endsWith('.html')?sanitized:
    fs.readFileSync(path.resolve(__dirname,'..',rel)));
  }
  const r=spawnSync(process.execPath,
   [path.resolve(__dirname,'qa_word_trails_commercial_voice_hold_v1.cjs'),'--candidate-dir',dir],
   {encoding:'utf8',timeout:30000});
  assert.equal(r.status,0,
   'Known demo scanner blocked sanitized fixture: '+r.stdout+' '+r.stderr);
  const line=r.stdout.split('\n').find(x=>x.startsWith('WORD_TRAILS_PRODUCTION_AUDIO_ASSET_GATE '));
  assert(line,'Candidate gate must explicitly report its evaluation');
  const report=JSON.parse(line.slice(line.indexOf('{')));
  assert.equal(report.passedKnownDemoCheck,true);
  assert.equal(report.commercialRightsEstablished,false,'No tool can certify rights here');
  return report.scannedFiles;
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
}
const scannedFiles=checkCandidate();
const seed={
 [TEST]:JSON.stringify({level:0,unlocked:0,coins:60,points:0,
  completed:[],sparks:[],claimedSparks:[],boardBible:[],paidWords:[],
  paidBonuses:[],claimedFreeHints:[],sound:false,progress:null}),
 [LIVE]:JSON.stringify({level:9,unlocked:10,coins:117,completed:[0,1,2],
  savedMarker:'real-live-must-be-preserved'}),
 [GUARD]:'keep-byte-identical'
};
async function frameFor(page){
 await page.waitForFunction(()=>window.BUWTNativeShell?.active?.()&&
  !!document.querySelector('#bu-wt-native-game')?.contentWindow?.BUWTAnnouncer&&
  !!document.querySelector('#bu-wt-native-game')?.contentWindow?.BUWTMainSettings&&
  !!document.querySelector('#bu-wt-native-game')?.contentWindow?.BUWTPolish,
  null,{timeout:110000});
 const f=page.frames().find(x=>x.url().includes('/experiments/word-trails-next-v1.html'));
 assert(f,'Sanitized candidate native Word Trails frame missing');
 await f.waitForFunction(()=>document.querySelectorAll('.wheel-letter').length>=6,
  null,{timeout:30000});
 return f;
}
(async()=>{
 const browser=await webkit.launch({headless:true,timeout:90000});
 try{
  for(const [width,height] of [[390,705],[320,568]]){
   const context=await browser.newContext({viewport:{width,height},
    isMobile:true,hasTouch:true,deviceScaleFactor:2});
   try{
    await context.addInitScript(records=>{
     for(const [key,value] of Object.entries(records)){
      if(localStorage.getItem(key)===null)localStorage.setItem(key,value);
     }
    },seed);
    const page=await context.newPage(),errors=[],demoRequests=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('request',request=>{
     if(request.url().includes(demoKey))demoRequests.push(request.url());
    });
    // This intercepted response is a disposable future-candidate rehearsal.
    // Real TEST HTML stays exactly as committed with its testing voices.
    await page.route('**/experiments/word-trails-next-v1.html*',route=>
     route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:sanitized}));
    await page.route('**/'+demoKey+'*',route=>{
     demoRequests.push('BLOCKED:'+route.request().url());return route.abort();
    });
    await page.goto(ROOT,{waitUntil:'domcontentloaded',timeout:110000});
    await page.waitForFunction(()=>window.BUWTNativeShell?.nativeReady?.()&&
     !!document.querySelector('#home-cross'),null,{timeout:110000});
    const originalSave=await page.evaluate(keys=>keys.map(k=>localStorage.getItem(k)),[LIVE,GUARD]);
    assert.deepEqual(originalSave,[seed[LIVE],seed[GUARD]]);
    await page.evaluate(()=>document.querySelector('#home-cross').click());
    const frame=await frameFor(page);
    const basic=await page.evaluate(()=>{
     const c=document.querySelector('#bu-wt-native-game')?.contentWindow;
     const root=document.getElementById('settings-dialog');
     const wheel=c?.document.querySelector('#wheel');
     const board=c?.document.querySelector('#board');
     return {nativeMenu:!!document.getElementById('game-menu'),
      nativeSettings:!!root,rootVoice:typeof window.bu381Play,
      demoDefined:typeof c?.BUWTVoiceClips,
      announcerAvailable:c?.BUWTAnnouncer.available(),
      wheelLetters:c?.document.querySelectorAll('.wheel-letter').length,
      boardTiles:board?.querySelectorAll('.tile').length,
      frameWidth:c?.innerWidth,wheelWidth:wheel?.getBoundingClientRect().width,
      frameHorizontalOverflow:c?.document.documentElement.scrollWidth>c?.innerWidth+2,
      parentSettingsHidden:root.hidden};
    });
    assert(basic.nativeMenu&&basic.nativeSettings&&basic.announcerAvailable,
     'Native settings, menu and announced-voice delegation must remain available');
    assert.equal(basic.rootVoice,'function','Native original voice playback host missing');
    assert.equal(basic.demoDefined,'undefined','Candidate must NOT contain demo MP3 clips');
    assert(basic.wheelLetters>=6&&basic.boardTiles>=6,'Crossword must remain playable');
    assert.equal(basic.frameHorizontalOverflow,false,'Sanitized game must not horizontally scroll');
    assert.equal(basic.parentSettingsHidden,true);
    assert.deepEqual(demoRequests,[],'Any demo-clip request fails candidate release gate');
    const voice=await page.evaluate(()=>{
     const c=document.querySelector('#bu-wt-native-game').contentWindow;
     const native=window.BUWTNativeShell;
     const oldMode=native.voicePrefs().mode,oldVolume=native.voicePrefs().volume;
     const calls=[],original=window.bu381Play;
     window.bu381Play=(phrase,opts)=>{calls.push({phrase,opts});return true};
     try{
      // Native Settings, not the embedded standalone Settings dialog.
      c.BUWTMainSettings.open();
      const mainOpen=!document.getElementById('settings-dialog').hidden;
      const duplicateDialogOpen=!!c.document.getElementById('wt-main-settings')?.open;
      // Explicitly test OFF and volume-zero suppress PROGRESS attempts
      // without needing to play any actual recorded commercial audio.
      c.BUWTAnnouncer.change('off',0);
      c.BUWTAnnouncer.resetProgress();
      const offMode=c.BUWTAnnouncer.getMode(),offVolume=c.BUWTAnnouncer.getVolume();
      const rejected=c.BUWTAnnouncer.progress();
      const callsWhenOff=calls.length;
      c.BUWTAnnouncer.change('paul',72);
      c.BUWTAnnouncer.resetProgress();
      const onMode=c.BUWTAnnouncer.getMode(),onVolume=c.BUWTAnnouncer.getVolume();
      const accepted=c.BUWTAnnouncer.progress();
      const callsWhenOn=calls.slice();
      c.BUWTAnnouncer.progress(); // one announcement per puzzle
      const duplicateCalls=calls.length-callsWhenOn.length;
      // Never persist changed preferences outside this isolated browser.
      c.BUWTAnnouncer.change(oldMode,oldVolume);
      const returned=native.voicePrefs();
      document.getElementById('settings-dialog').hidden=true;
      return {mainOpen,duplicateDialogOpen,offMode,offVolume,rejected,
       callsWhenOff,onMode,onVolume,accepted,callsWhenOn,duplicateCalls,
       originalMode:oldMode,originalVolume:oldVolume,
       returnedMode:returned.mode,returnedVolume:returned.volume,
       hasDemoClips:typeof c.BUWTVoiceClips,
       localStandaloneSettingsOpen:!!c.document.getElementById('wt-main-settings')?.open};
     }finally{window.bu381Play=original}
    });
    assert(voice.mainOpen,'Word Trails settings must open real native Settings');
    assert.equal(voice.duplicateDialogOpen,false,'No duplicate settings dialog');
    assert.equal(voice.offMode,'off');
    assert.equal(voice.offVolume,0);
    assert.equal(voice.rejected,false,'Off should reject in-puzzle announcement');
    assert.equal(voice.callsWhenOff,0,'Off must not call native voice host');
    assert.equal(voice.onMode,'paul');
    assert.equal(voice.onVolume,72);
    assert.equal(voice.accepted,true,'Announcer should delegate to native host');
    assert.equal(voice.callsWhenOn.length,1);
    assert.equal(voice.callsWhenOn[0].phrase,'excellent_thinking');
    assert.equal(voice.duplicateCalls,0,'No repeated mid-puzzle announcer');
    assert.equal(voice.returnedMode,voice.originalMode);
    assert.equal(voice.returnedVolume,voice.originalVolume);
    assert.equal(voice.localStandaloneSettingsOpen,false);
    // Closing the iframe and relaunching must NOT depend on the TEST demo bundle.
    await page.evaluate(()=>window.BUWTNativeShell.close());
    await page.waitForFunction(()=>!window.BUWTNativeShell?.active());
    await page.evaluate(()=>document.querySelector('#home-cross').click());
    const reopened=await frameFor(page);
    assert.equal(await reopened.evaluate(()=>typeof window.BUWTVoiceClips),'undefined');
    assert.equal(await reopened.evaluate(()=>window.BUWTAnnouncer.available()),true);
    const preserved=await page.evaluate(keys=>keys.map(k=>localStorage.getItem(k)),[LIVE,GUARD]);
    assert.deepEqual(preserved,originalSave,
     'Sanitized candidate gameplay must preserve preexisting LIVE save and sentinel');
    assert.deepEqual(demoRequests,[],'No restricted demo clip request at any point');
    assert.deepEqual(errors,[],'JavaScript exceptions from sanitized candidate');
    console.log('PASS_WORD_TRAILS_DEMO_FREE_NATIVE_WEBKIT_V1',JSON.stringify({
     viewport:width+'x'+height,staticGateScannedFiles:scannedFiles,
     rootNativeHost:true,levelOneWheelAndBoard:true,
     noDemoBundleLoadedOrRequested:true,realSettingsOpenNoDuplicate:true,
     voiceOffAndZeroVolumeRespected:true,voiceModeAndVolumeRestored:true,
     delegatedMidPuzzleVoiceToMockNativeHost:true,midPuzzleOneTimeCue:true,
     reentryWithoutDemoBundle:true,liveSaveUnchanged:true,zeroPageErrors:true,
     liveDeployment:false,licensedCommercialVoiceCertified:false,
     physicalPhoneAudioCertified:false
    }));
   }finally{await context.close()}
  }
 }finally{await browser.close()}
})().catch(e=>{
 console.error('FAIL_WORD_TRAILS_DEMO_FREE_NATIVE_WEBKIT_V1',e.stack||e);
 process.exitCode=1;
});

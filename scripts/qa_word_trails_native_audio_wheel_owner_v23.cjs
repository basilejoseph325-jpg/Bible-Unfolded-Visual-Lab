#!/usr/bin/env node
'use strict';
// Runs only against the Visual Lab TEST checkout on a local HTTP server.
// Fresh isolated CI browser profile; never accesses real end-user storage.
const puppeteer=require('puppeteer-core');
const assert=require('node:assert/strict');
const {execSync}=require('node:child_process');
const chrome=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
(async()=>{
 const browser=await puppeteer.launch({headless:true,executablePath:chrome,
  args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--disable-gpu','--autoplay-policy=no-user-gesture-required'],
  timeout:90000,protocolTimeout:120000});
 try{
 for(const vp of [{width:390,height:705},{width:320,height:568}]){
  const page=await browser.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.setViewport({...vp,isMobile:true,hasTouch:true,deviceScaleFactor:2});
  await page.goto('http://127.0.0.1:8899/index.html',{waitUntil:'domcontentloaded',timeout:120000});
  await page.waitForFunction(()=>window.BUWTNativeShell?.nativeReady?.(),{timeout:90000});
  await page.evaluate(()=>document.getElementById('home-cross').click());
  await page.waitForFunction(()=>{
   const c=document.getElementById('bu-wt-native-game')?.contentWindow;
   return !!(window.BUWTNativeShell?.active?.()&&c?.BUWTPolish&&c?.BUWTMainSettings&&c?.BUWTAnnouncer&&c?.BUWTWheelNative&&
    c.document.querySelectorAll('.wheel-letter').length>=4);
  },{timeout:90000});
  const initial=await page.evaluate(()=>{
   const child=document.getElementById('bu-wt-native-game').contentWindow;
   return {nativeAudio:window.BUWTNativeShell.audioPrefs(),
    childAudio:child.BUWTPolish.state(),
    hasRootVoice:typeof window.bu381Play,
    frame:child.document.getElementById('bu-wt-native-game')?.id||'child-ready',
    childDialogOpen:child.document.getElementById('wt-feel-settings')?.open,
    nativeActive:window.BUWTNativeShell.active()};
  });
  assert(initial.nativeAudio&&initial.nativeActive);
  assert.equal(initial.childAudio.sfx,initial.nativeAudio.sfx);
  assert.equal(initial.childAudio.music,initial.nativeAudio.music);
  assert.equal(initial.childAudio.musicVolume,initial.nativeAudio.musicVolume);
  assert.equal(initial.childAudio.sfxVolume,initial.nativeAudio.sfxVolume);
  assert.equal(initial.hasRootVoice,'function','Native announcer is available');

  // A direct call that would once open the second Sound & Feel dialog must
  // delegate to the real parent Settings and never expose duplicate controls.
  const shortcut=await page.evaluate(()=>{
   const child=document.getElementById('bu-wt-native-game').contentWindow;
   child.BUWTPolish.openSettings();
   return {nativeSettingsHidden:document.getElementById('settings-dialog').hidden,
    childFeelDialogOpen:child.document.getElementById('wt-feel-settings')?.open,
    childMainDialogOpen:child.document.getElementById('wt-main-settings')?.open};
  });
  assert.equal(shortcut.nativeSettingsHidden,false,'The original parent Settings dialog must open');
  assert.equal(shortcut.childFeelDialogOpen,false,'No duplicate Sound & Feel dialog may open in native mode');
  assert.equal(shortcut.childMainDialogOpen,false,'No duplicate Word Trails Settings dialog may open');

  const shared=await page.evaluate(async()=>{
   const child=document.getElementById('bu-wt-native-game').contentWindow;
   const ownSound=localStorage.getItem('bu-wt-next-feel-v2');
   const shadow=localStorage.getItem('bu-platform-audio-preferences-v1');
   const before=window.BUWTNativeShell.audioPrefs();
   // Direct, default-persist child call must not create a competing
   // authoritative preference or modify the native sound setting.
   child.BUWTPolish.setPreference('sfx',!before.sfx);
   const ignored=child.BUWTPolish.state().sfx===before.sfx&&
      window.BUWTNativeShell.audioPrefs().sfx===before.sfx;
   const input=document.getElementById('setting-sfx');
   input.checked=!before.sfx;input.dispatchEvent(new Event('change',{bubbles:true}));
   await new Promise(r=>setTimeout(r,55));
   const during=child.BUWTPolish.state().sfx;
   input.checked=before.sfx;input.dispatchEvent(new Event('change',{bubbles:true}));
   await new Promise(r=>setTimeout(r,55));
   const restored=child.BUWTPolish.state().sfx===before.sfx;
   // Verify native volume can still propagate, preserving sound levels.
   const range=document.getElementById('setting-sfx-volume'),orig=range.value;
   const target=Number(orig)>=65?35:80;
   range.value=String(target);range.dispatchEvent(new Event('input',{bubbles:true}));
   await new Promise(r=>setTimeout(r,55));
   const duringVolume=child.BUWTPolish.state().sfxVolume;
   range.value=orig;range.dispatchEvent(new Event('input',{bubbles:true}));
   await new Promise(r=>setTimeout(r,55));
   return {ignored,during,restored,duringVolume,target,
    feelUnchanged:ownSound===localStorage.getItem('bu-wt-next-feel-v2'),
    shadowUnchanged:shadow===localStorage.getItem('bu-platform-audio-preferences-v1'),
    childPref:child.BUWTPolish.state(),
    parentPref:window.BUWTNativeShell.audioPrefs()};
  });
  assert(shared.ignored,'Direct frame calls may not become a second native audio owner');
  assert.equal(shared.during,!initial.nativeAudio.sfx);
  assert.equal(shared.restored,true);
  assert.equal(shared.duringVolume,shared.target);
  assert.equal(shared.feelUnchanged,true,'No duplicate local audio snapshot');
  assert.equal(shared.shadowUnchanged,true,'No fake global audio preference record');

  // The real native announcer must remain the only playback owner.
  const voice=await page.evaluate(()=>{
   const child=document.getElementById('bu-wt-native-game').contentWindow;
   const original=window.bu381Play,calls=[];
   window.bu381Play=(phrase,options)=>{calls.push({phrase,options});return true};
   try{child.BUWTAnnouncer.play('excellent_thinking',{milestone:true})}
   finally{window.bu381Play=original}
   return {calls,rootMode:window.BUWTNativeShell.voicePrefs()?.mode,
    childMode:child.BUWTAnnouncer.getMode()};
  });
  assert.equal(voice.calls.length,1,'Native original announcer should receive one call');
  assert.equal(voice.calls[0].phrase,'excellent_thinking');
  assert.equal(voice.childMode,voice.rootMode);

  // Visual-only Ocean Glow effects are checked without purchasing or
  // equipping a wheel in any wallet. No entitlement is granted.
  const wheel=await page.evaluate(()=>{
   const child=document.getElementById('bu-wt-native-game').contentWindow;
   const doc=child.document,css=doc.documentElement;
   const previous=[...css.classList].filter(x=>/^(sea-wheel|moon-wheel|gold-wheel)$/.test(x));
   css.classList.remove('moon-wheel','gold-wheel');
   css.classList.add('sea-wheel');
   child.BUWTPolish.setPreference('motion',true,{silent:true,persist:false});
   const w=doc.getElementById('wheel'),rect=w.getBoundingClientRect();
   const labels=[...w.querySelectorAll('.wheel-letter')].slice(0,3);
   const coords=labels.map(el=>({x:Number.parseFloat(el.style.left),y:Number.parseFloat(el.style.top)}));
   const svg=doc.getElementById('selection-lines');
   child.BUWTWheelNative.render(svg,[0,1,2],coords);
   const curved=child.BUWTWheelNative.debug();
   const event={pointerId:941,pointerType:'touch',clientX:rect.left+coords[0].x,clientY:rect.top+coords[0].y};
   child.BUWTWheelNative.begin(event);
   child.BUWTWheelNative.move({...event,clientX:event.clientX+28,clientY:event.clientY+30});
   const during=child.BUWTWheelNative.debug();
   child.BUWTWheelNative.end({...event,clientX:event.clientX+28,clientY:event.clientY+30});
   const finished=child.BUWTWheelNative.debug();
   child.BUWTWheelNative.cancel();
   css.classList.remove('sea-wheel');
   for(const cls of previous)css.classList.add(cls);
   child.BUWTPolish.setPreference('motion',window.BUWTNativeShell.audioPrefs().motion,{silent:true,persist:false});
   return {curved,during,finished,coords,styleLoaded:[...doc.styleSheets].some(s=>String(s.href).includes('word-trails-native-wheel-v1.css'))};
  });
  assert(wheel.styleLoaded,'Original native wheel effects CSS must be loaded');
  assert.equal(wheel.curved.theme,'sea','Ocean Glow appearance selected for visual-only testing');
  assert(wheel.curved.curve.includes('C'),'Ocean Glow selection must use curved cubic ribbon, not straight path');
  assert(wheel.curved.halo.includes('C'),'Original glowing halo remains');
  assert(wheel.during.canvas,'Swipe must add temporary visual mist canvas');
  assert(wheel.finished.glints>0,'Touch trace and release must include micro-glitter');

  // Reuse the real parent main menu. Do not open Word Trails local clone.
  const menus=await page.evaluate(()=>{
   document.getElementById('settings-dialog').hidden=true;
   const child=document.getElementById('bu-wt-native-game').contentWindow;
   child.BUWTUnifiedMenu.open();
   return {parentMenuHidden:document.getElementById('game-menu').hidden,
    childMenuOpen:child.document.getElementById('wt-unified-menu')?.open,
    childOverflow:child.document.documentElement.scrollWidth>child.innerWidth+1};
  });
  assert.equal(menus.parentMenuHidden,false);
  assert.equal(menus.childMenuOpen,false);
  assert.equal(menus.childOverflow,false);
  assert.deepEqual(errors,[],'No JavaScript errors');
  console.log('PASS_WORD_TRAILS_NATIVE_AUDIO_WHEEL_OWNER_V23',JSON.stringify({
   viewport:vp.width+'x'+vp.height,
   nativeSettingsOnly:true,nativeAudioPropagation:true,shadowStorageUnchanged:true,
   originalAnnouncerDelegated:true,curvedOceanGlow:true,glowHalo:true,swipeMist:true,microGlitter:true,
   noEntitlementsChanged:true,noHorizontalOverflow:true,pageErrors:errors.length}));
  await page.close();
 }
 }finally{await browser.close()}
})().catch(e=>{console.error('FAIL_WORD_TRAILS_NATIVE_AUDIO_WHEEL_OWNER_V23',e.stack||e);process.exitCode=1});

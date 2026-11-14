#!/usr/bin/env node
'use strict';
/**
 * TEST-only fail-closed gate for known NONCOMMERCIAL Word Trails demo audio.
 *
 * This is NOT a license audit, and it does NOT authorize a commercial release.
 * It prevents known TEST-only demo clips from accidentally being copied to
 * a production promotion candidate. It never writes player progress or LIVE.
 *
 * Usage:
 *   node scripts/qa_word_trails_commercial_voice_hold_v1.cjs
 *   node scripts/qa_word_trails_commercial_voice_hold_v1.cjs --candidate-dir PATH
 */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const clipRel='experiments/word-trails-original-voice-clips-v1.js';
const htmlRel='experiments/word-trails-next-v1.html';
const controllerRel='experiments/word-trails-announcer-v1.js';
const settingsRel='experiments/word-trails-main-settings-v1.js';
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const clips=read(clipRel),html=read(htmlRel),controller=read(controllerRel),settings=read(settingsRel);
const bytes=Buffer.from(clips),sha256=crypto.createHash('sha256').update(bytes).digest('hex');
assert(clips.startsWith('/* Original Bible Unfolded noncommercial demo voices (ElevenLabs free-tier).'),
 'Known demo asset changed: update this gate after a fresh legal review');
assert(clips.includes('Commercial release requires eligible paid licensing.'),
 'Do not remove the NONCOMMERCIAL notice to clear a release');
assert(clips.includes('window.BUWTVoiceClips=Object.freeze('),
 'Expected source of bundled demo MP3 recordings');
assert(clips.includes('data:audio/mpeg;base64,'),'Demo MP3s missing from tested asset');
assert(html.includes('src="word-trails-original-voice-clips-v1.js?'),
 'TEST demo-script reference changed: inspect actual loaded voice assets');
assert(controller.includes('native.playVoice(') && controller.includes('window.BUWTVoiceClips'),
 'Expected native voice delegation plus local demo fallback');
assert(settings.includes('Noncommercial testing only; final commercial recordings must be regenerated'),
 'Expected user-visible license warning has disappeared from TEST Settings');

const demoFilename='word-trails-original-voice-clips-v1.js';
function scanCandidate(dir) {
 assert(fs.statSync(dir).isDirectory(),'Candidate must be a directory');
 const violations=[],files=[];
 const visit=(current,rel='')=>{
  for(const entry of fs.readdirSync(current,{withFileTypes:true})){
   const nextRel=path.join(rel,entry.name),next=path.join(current,entry.name);
   if(entry.isSymbolicLink()){violations.push({path:nextRel,reason:'symlink-in-release-candidate'});continue}
   if(entry.isDirectory()){visit(next,nextRel);continue}
   if(!entry.isFile())continue;
   if(!/\.(?:js|html?|json|mjs|cjs|mp3)$/i.test(entry.name))continue;
   files.push(nextRel);
   if(entry.name.toLowerCase()===demoFilename.toLowerCase())
    violations.push({path:nextRel,reason:'known-restricted-demo-file'});
   const data=fs.readFileSync(next);
   if(crypto.createHash('sha256').update(data).digest('hex')===sha256)
    violations.push({path:nextRel,reason:'renamed-byte-exact-restricted-demo'});
   // Only scan textual program assets; a standalone MP3 would need its own
   // provenance check (manual license review remains mandatory).
   if(entry.name.toLowerCase().endsWith('.mp3'))continue;
   const content=data.toString('utf8');
   if(/(?:src|import|from)\s*=\s*["'][^"']*word-trails-original-voice-clips-v1\.js/i.test(content)
       ||/word-trails-original-voice-clips-v1\.js(?:\?|["'])/.test(content))
    violations.push({path:nextRel,reason:'loads-restricted-demo-file'});
   if(/window\.BUWTVoiceClips\s*=\s*Object\.freeze\(/.test(content)
       && /data:audio\/mpeg;base64,/.test(content))
    violations.push({path:nextRel,reason:'bundled-prerecorded-demo-voice-pattern'});
   if(/noncommercial demo voices \(ElevenLabs free-tier\)/i.test(content))
    violations.push({path:nextRel,reason:'known-demo-provenance-header'});
  }
 };
 visit(dir);
 return {files,violations};
}
function fixture(files) {
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'bu-commercial-voice-gate-'));
 for(const [p,data] of Object.entries(files)){
  const target=path.join(dir,p);fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.writeFileSync(target,data);
 }
 return dir;
}
function checkFixtures(){
 const srcTag=html.match(/^[^\n]*word-trails-original-voice-clips-v1\.js[^\n]*\n/m);
 assert(srcTag,'Could not isolate exact existing TEST demo-script tag');
 const safeHtml=html.replace(srcTag[0],'');
 const cases=[
  {name:'original TEST html blocked',files:{[htmlRel]:html},bad:true},
  {name:'raw noncommercial demo file blocked',files:{[clipRel]:clips},bad:true},
  {name:'renamed noncommercial demo blocked',files:{'experiments/renamed-voices.js':clips},bad:true},
  {name:'embedded voice object blocked',files:{'experiments/voices.js':'window.BUWTVoiceClips=Object.freeze({"x":"data:audio/mpeg;base64,AAAA"})'},bad:true},
  {name:'reference to absent demo blocked',files:{'experiments/loader.html':'<script src="word-trails-original-voice-clips-v1.js?v=1"></script>'},bad:true},
  // Static candidate is NOT a functionality/rights certification, only a
  // known-demo-exclusion rehearsal: audio controller still delegates native.
  {name:'HTML without demo asset + native controller clears known-demo gate',
   files:{[htmlRel]:safeHtml,[controllerRel]:controller,[settingsRel]:settings},bad:false}
 ];
 for(const c of cases){
  const dir=fixture(c.files);
  try{
   const result=scanCandidate(dir);
   assert.equal(result.violations.length>0,c.bad,
    c.name+' unexpected classification '+JSON.stringify(result.violations));
   console.log('PASS_KNOWN_VOICE_RIGHTS_HOLD',JSON.stringify({
    scenario:c.name,expected:c.bad?'BLOCK':'NOT_BLOCKED',observed:result.violations.length?'BLOCK':'NOT_BLOCKED'}));
  }finally{fs.rmSync(dir,{recursive:true,force:true})}
 }
 console.log('KNOWN_TEST_DEMO_HOLD',JSON.stringify({
  source:clipRel,sourceBytes:bytes.length,sha256,
  tests:cases.length,protectedLiveModified:false,releaseApproved:false,
  note:'Manual legal/provenance clearance required for every actual commercial recording, including original native voice audio.'}));
}
if(process.argv.length===2)checkFixtures();
else if(process.argv.length===4&&process.argv[2]==='--candidate-dir'){
 const dir=path.resolve(process.argv[3]),report=scanCandidate(dir);
 console.log('WORD_TRAILS_PRODUCTION_AUDIO_ASSET_GATE',JSON.stringify({
  candidateDirectory:dir,scannedFiles:report.files.length,
  blockedKnownNoncommercialDemoAssets:report.violations,
  passedKnownDemoCheck:report.violations.length===0,
  commercialRightsEstablished:false,manualVoiceLicenseSignoffRequired:true
 }));
 if(report.violations.length)process.exitCode=1;
}else{
 console.error('Usage: node qa_word_trails_commercial_voice_hold_v1.cjs [--candidate-dir PATH]');
 process.exitCode=2;
}

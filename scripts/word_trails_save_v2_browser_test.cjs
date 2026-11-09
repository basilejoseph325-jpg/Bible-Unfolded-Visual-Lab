/* Browser QA: native v1 compatibility and real TEST-only complete saves v2.
   Executes against full Bible Unfolded Visual Lab homepage; never LIVE. */
const puppeteer=require('puppeteer-core');
const assert=require('node:assert/strict');
const {execSync}=require('node:child_process');
const BIN=execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const url='http://127.0.0.1:8894/index.html';
const TEST='bu-visual-lab-wordtrails-next-v1',FEEL='bu-wt-next-feel-v2';
const WK='bible-unfolded-rewards-v17',RK='bible-unfolded-rewards-v17-recovery-v3811';
const OK='bible-unfolded-wheel-ownership-v3825',OB='bible-unfolded-wheel-ownership-v3825-backup';
const wait=async p=>p.waitForFunction(()=>window.BUPlatformSaves?.bound?.(),{timeout:60000});
const fixture=(coins)=>({
 level:0,unlocked:2,coins,points:42,completed:[0,1],sparks:[0],
 claimedSparks:['0:CAIN'],boardBible:[],paidWords:['combo:0'],
 paidBonuses:['0|CAT'],claimedFreeHints:[0],sound:true,
 progress:{level:0,found:['ANTIC'],bonuses:['CAT'],hinted:['0:0'],combo:2}
});
const wallet=(points,coins,purchases=['classic'])=>({points,coins,purchases,earned:['chapter-noah'],spent:[],hints:{},
 streak:1,lastDay:'',rank:1,equippedWheel:'classic'});
(async()=>{
 const browser=await puppeteer.launch({headless:true,executablePath:BIN,args:['--no-sandbox','--disable-setuid-sandbox','--autoplay-policy=no-user-gesture-required']});
 try{
  const page=await browser.newPage();page.setDefaultTimeout(60000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewport({width:390,height:705,isMobile:true,hasTouch:true,deviceScaleFactor:2});
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:120000});await wait(page);
  console.log('SAVE_UI_NATIVE',JSON.stringify(await page.evaluate(()=>({
   exporter:document.getElementById('save-export')?.textContent,
   importer:document.getElementById('save-import')?.textContent,
   picker:!!document.getElementById('save-file')?.onchange,
   bound:window.BUPlatformSaves.bound(),
   annotation:document.getElementById('bu-wt-save-status')?.textContent
  }))));
  const data=await page.evaluate((args)=>{
   const original=()=>Object.fromEntries(Array.from({length:localStorage.length},(_,i)=>localStorage.key(i)).map(k=>[k,localStorage.getItem(k)]));
   localStorage.setItem(args.WK,JSON.stringify(args.wallet));
   localStorage.setItem(args.RK,JSON.stringify(args.wallet(800,600,['seawheel'])));
   localStorage.setItem(args.OK,JSON.stringify({version:1,owned:['seawheel']}));
   localStorage.setItem(args.OB,JSON.stringify({version:1,owned:['seawheel']}));
   localStorage.setItem(args.TEST,JSON.stringify(args.fixture));
   localStorage.setItem(args.FEEL,JSON.stringify({music:true,sfx:true,musicVolume:42,sfxVolume:20,motion:true,haptics:true}));
   const before=JSON.stringify(original());
   const backup=window.BUPlatformSaves.makeBackup();
   const preview=window.BUPlatformSaves.dryRun(backup);
   const after=JSON.stringify(original());
   return {backup,preview,beforeEqualsAfter:before===after};
  },{WK,RK,OK,OB,TEST,FEEL,wallet:wallet(800,600,['seawheel']),fixture:fixture(107)}).catch(e=>{console.error('SEEDING_ERROR',e.stack||e);return null});
  // Avoid source-evaluation shortcuts: the fixture data is seeded with safe literals below.
  if(!data)throw Error('Unexpected failure seeding browser save fixture');
  assert.equal(data.beforeEqualsAfter,true);
  assert.equal(data.backup.version,2);
  assert.equal(data.backup.format,'BibleUnfoldedSave');
  assert.equal(data.preview.incomingWordTrails.coins,107);
  assert.equal(data.preview.incomingWordTrails.completedCount,2);
  assert.equal(data.backup.keys[TEST],undefined);
  assert.equal(data.backup.extensions.wordTrailsNext.coinsNeverConvertToInsightTokens,true);
  console.log('COMPLETE_BACKUP_READ_ONLY',JSON.stringify({keys:Object.keys(data.backup.keys).length,
   testCoins:data.preview.incomingWordTrails.coins,realTokens:data.preview.incomingWallet?.insightTokens}));

  const report=await page.evaluate((params)=>{
   const s=window.BUPlatformSaves;
   const candidate=JSON.parse(JSON.stringify(params.backup));
   candidate.keys['bible-unfolded-rewards-v17']=JSON.stringify({
     points:135,coins:130,purchases:['goldwheel'],earned:[],spent:[],
     streak:0,lastDay:'',rank:1,equippedWheel:'goldwheel'
   });
   candidate.keys['bible-unfolded-rewards-v17-recovery-v3811']=candidate.keys['bible-unfolded-rewards-v17'];
   candidate.extensions.wordTrailsNext.state=JSON.stringify({...JSON.parse(candidate.extensions.wordTrailsNext.state),coins:177});
   const preview=s.dryRun(candidate),first=s.applyBackup(candidate,{reload:false});
   const wallet=JSON.parse(localStorage.getItem('bible-unfolded-rewards-v17'));
   const coins=JSON.parse(localStorage.getItem('bu-visual-lab-wordtrails-next-v1')).coins;
   const second=s.applyBackup(candidate,{reload:false});
   return {preview,first,second,wallet,coins,
    journal:localStorage.getItem('bu-visual-lab-import-rollback-v2'),
    commit:localStorage.getItem('bu-visual-lab-import-committed-v2'),candidate};
  },{backup:data.backup});
  assert.equal(report.wallet.coins,130,'TEST coins must not convert into Insight Tokens');
  assert.equal(report.wallet.points,135);
  assert.equal(report.coins,177,'Word Trails TEST coins transfer only into isolated save');
  assert(report.wallet.purchases.includes('goldwheel')&&report.wallet.purchases.includes('seawheel'),
    'Old purchases must remain owned even after older backup import');
  assert(report.second.unchanged,'Second import must not make redundant writes');
  assert.equal(report.journal,null);assert.equal(report.commit,null);
  console.log('V2_IMPORT_AND_IDEMPOTENCE',JSON.stringify({realTokens:report.wallet.coins,
    testCoins:report.coins,purchases:report.wallet.purchases,secondUnchanged:report.second.unchanged}));

  const rollback=await page.evaluate((candidate)=>{
    const key='bu-visual-lab-wordtrails-next-v1';
    const original=localStorage.getItem(key);
    const modified=JSON.parse(JSON.stringify(candidate));
    const t=JSON.parse(modified.extensions.wordTrailsNext.state);t.coins=188;
    modified.extensions.wordTrailsNext.state=JSON.stringify(t);
    const native=Storage.prototype.setItem;let injected=false,error='';
    Storage.prototype.setItem=function(k,v){
      if(k===key&&!injected){injected=true;throw new Error('TEST_INJECTED_QUOTA_FAILURE')}
      return native.call(this,k,v);
    };
    try{window.BUPlatformSaves.applyBackup(modified,{reload:false})}
    catch(e){error=e.message}
    finally{Storage.prototype.setItem=native;}
    const same=localStorage.getItem(key)===original;
    const noJournal=localStorage.getItem('bu-visual-lab-import-rollback-v2')===null;
    // Test startup recovery from a simulated interrupted write.
    localStorage.setItem('bu-visual-lab-import-rollback-v2',JSON.stringify({version:1,previous:{[key]:original}}));
    localStorage.setItem(key,'{"coins":999}');
    const recovery=window.BUPlatformSaves.recoverPending();
    return {same,noJournal,error,simulatedRecovery:recovery,
      afterRecovery:localStorage.getItem(key)===original};
  },report.candidate);
  assert(rollback.error.includes('rolled back')&&rollback.same&&rollback.noJournal);
  assert(rollback.simulatedRecovery.recovered&&rollback.afterRecovery);
  console.log('TRANSACTION_RECOVERY',JSON.stringify(rollback));

  const tamper=await page.evaluate((backup)=>{
   const invalid=[];
   const check=x=>{try{window.BUPlatformSaves.dryRun(x);return false}catch(_){return true}};
   const a=JSON.parse(JSON.stringify(backup));a.extensions.wordTrailsNext.state=
     JSON.stringify({...JSON.parse(a.extensions.wordTrailsNext.state),level:999});
   invalid.push(check(a));
   const b=JSON.parse(JSON.stringify(backup));b.keys['malicious-key']='spam';invalid.push(check(b));
   const c=JSON.parse(JSON.stringify(backup));c.extensions.wordTrailsNext.state='{bad-json';invalid.push(check(c));
   const d=JSON.parse(JSON.stringify(backup));d.version=1;invalid.push(check(d));
   return invalid;
  },data.backup);
  assert(tamper.every(Boolean));
  console.log('REJECTS_CORRUPTED_IMPORTS',tamper.length);

  // v1 unchanged path: the root handler still sees a genuine version 1 file.
  const legacy=await page.evaluate(async()=>{
   const input=document.getElementById('save-file');
   const old=Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)]));
   const v1={format:'BibleUnfoldedSave',version:1,keys:{'bible-unfolded-rewards-v17':localStorage.getItem('bible-unfolded-rewards-v17')}};
   const dt=new DataTransfer();
   dt.items.add(new File([JSON.stringify(v1)],'old-v1.json',{type:'application/json'}));
   input.files=dt.files;
   const previous=window.confirm;let prompted=0;window.confirm=()=>{prompted++;return false;};
   try{await input.onchange(new Event('change'))}finally{window.confirm=previous}
   const unchanged=old['bible-unfolded-rewards-v17']===localStorage.getItem('bible-unfolded-rewards-v17');
   return {prompted,unchanged};
  });
  assert(legacy.prompted===1&&legacy.unchanged);
  console.log('LEGACY_V1_IMPORT_STILL_SUPPORTED',JSON.stringify(legacy));

  // Reload and launch real crossword. A partial puzzle has to be readable.
  await page.reload({waitUntil:'domcontentloaded',timeout:120000});
  await page.waitForFunction(()=>window.BUWTNativeShell?.nativeReady?.());
  await page.evaluate(()=>window.BUWTNativeShell.launch());
  await page.waitForFunction(()=>document.getElementById('bu-wt-native-game')?.contentWindow?.document?.querySelector('#solved-count'));
  const progress=await page.evaluate(()=>{
   const f=document.getElementById('bu-wt-native-game').contentWindow.document;
   return {level:f.getElementById('level-label').textContent,solved:f.getElementById('solved-count').textContent,
     coins:f.getElementById('points').textContent};
  });
  console.log('RESTORED_PUZZLE_IN_REAL_GAME',JSON.stringify(progress));
  assert.equal(progress.level,'LEVEL 1 / 30');assert.equal(progress.solved,'1 / 4');assert.equal(progress.coins,'177');
  if(errors.length)console.log('PAGE_ERRORS',JSON.stringify(errors.slice(0,8)));
  await page.close();
  console.log('PASS coordinated TEST save v2 native/Word Trails, legacy compatibility, idempotence, rollback and real puzzle resume');
 }catch(e){console.error('FAIL_SAVE_QA',e.stack||e);process.exitCode=1}
 finally{await browser.close()}
})();
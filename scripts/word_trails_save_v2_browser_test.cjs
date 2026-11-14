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
 streak:1,lastDay:new Date().toISOString().slice(0,10),rank:1,equippedWheel:'classic'});
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
   localStorage.setItem(args.RK,JSON.stringify(args.wallet));
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
     streak:1,lastDay:new Date().toISOString().slice(0,10),rank:1,equippedWheel:'goldwheel'
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
    const newerPreserved=localStorage.getItem(key)==='{"coins":999}';
    const pendingRetained=localStorage.getItem('bu-visual-lab-import-rollback-v2')!==null;
    // This entire browser context is synthetic. Clear the fictional probe
    // journal and restore its intentionally malformed sample so the next
    // real game-screen checks exercise normal gameplay, not an incomplete
    // import that the updated coordinator correctly refuses to resolve.
    localStorage.removeItem('bu-visual-lab-import-rollback-v2');
    localStorage.setItem(key,original);
    return {same,noJournal,error,simulatedRecovery:recovery,
      newerPreserved,pendingRetained,afterCleanup:localStorage.getItem(key)===original};
  },report.candidate);
  assert(rollback.error.includes('rolled back after checking')&&rollback.same&&rollback.noJournal);
  assert.equal(rollback.simulatedRecovery.recovered,false);
  assert.equal(rollback.simulatedRecovery.needsManualReview,true);
  assert(rollback.newerPreserved&&rollback.pendingRetained&&rollback.afterCleanup,
    'Old unknown-crash journal must not overwrite the newer stored sample');
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

  // v35 safety gate: the TEST native v1 import UI must NOT reach the original root handler.
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
  assert(legacy.prompted===0&&legacy.unchanged,'Native v1 UI import must be paused, without a confirmation dialog');
  console.log('LEGACY_V1_IMPORT_UI_SAFELY_PAUSED_V35',JSON.stringify(legacy));

  // Reload and launch real crossword. A partial puzzle has to be readable.
  const beforeReload=await page.evaluate(()=>JSON.parse(localStorage.getItem('bu-visual-lab-wordtrails-next-v1')||'null'));
  console.log('TEST_SAVE_BEFORE_RELOAD',JSON.stringify(beforeReload));
  await page.reload({waitUntil:'domcontentloaded',timeout:120000});
  await page.waitForFunction(()=>window.BUWTNativeShell?.nativeReady?.());
  const afterReload=await page.evaluate(()=>({state:JSON.parse(localStorage.getItem('bu-visual-lab-wordtrails-next-v1')||'null'),url:location.href}));
  console.log('TEST_SAVE_AFTER_RELOAD',JSON.stringify(afterReload));
  await page.evaluate(()=>window.BUWTNativeShell.launch());
  await page.waitForFunction(()=>{const f=document.getElementById('bu-wt-native-game')?.contentWindow?.document;return f?.getElementById('solved-count')?.textContent==='1 / 4'&&f?.getElementById('points')?.textContent==='177'}, {timeout:60000});
  const progress=await page.evaluate(()=>{
   const f=document.getElementById('bu-wt-native-game').contentWindow.document;
   return {level:f.getElementById('level-label').textContent,solved:f.getElementById('solved-count').textContent,
     coins:f.getElementById('points').textContent};
  });
  console.log('RESTORED_PUZZLE_IN_REAL_GAME',JSON.stringify(progress));
  console.log('TEST_SAVE_AFTER_CHILD_LOAD',JSON.stringify(await page.evaluate(()=>JSON.parse(localStorage.getItem('bu-visual-lab-wordtrails-next-v1')||'null'))));
  assert.equal(progress.level,'LEVEL 1 / 30');assert.equal(progress.solved,'1 / 4');assert.equal(progress.coins,'177');
  // Older TEST saves lacked the later claimedSparks/boardBible ledgers.
  const legacyWT=await page.evaluate(()=>{
   const source=window.BUPlatformSaves.makeBackup();
   const game=JSON.parse(source.extensions.wordTrailsNext.state);
   delete game.claimedSparks;delete game.boardBible;delete game.paidBonuses;
   source.extensions.wordTrailsNext.state=JSON.stringify(game);
   return window.BUPlatformSaves.dryRun(source).incomingWordTrails;
  });
  assert(legacyWT.present&&legacyWT.coins===177);
  console.log('LEGACY_WORD_TRAILS_OLD_SCHEMA',JSON.stringify(legacyWT));

  await page.evaluate(()=>window.BUWTNativeShell.close());
  await page.evaluate(()=>document.getElementById('save-export').click());
  const exportedStatus=await page.$eval('#bu-wt-save-status',e=>e.textContent);
  assert(exportedStatus.includes('Complete TEST backup prepared'));
  console.log('NATIVE_SETTINGS_EXPORT_CONTROL',exportedStatus);

  // v35: native Settings v1/v2 UI imports are intentionally SUSPENDED,
  // even though the low-level coordinator still supports isolated synthetic
  // transaction tests above. A capture-phase handler must stop the old native
  // importer before it can overwrite a shared LIVE wallet.
  const incoming=JSON.parse(JSON.stringify(report.candidate));
  incoming.extensions.wordTrailsNext.state=JSON.stringify({
   ...JSON.parse(incoming.extensions.wordTrailsNext.state),coins:199
  });
  const uiRefused=await page.evaluate((payload)=>{
   const input=document.getElementById('save-file'),dt=new DataTransfer();
   dt.items.add(new File([JSON.stringify(payload)],'v2-test-import.json',{type:'application/json'}));
   input.files=dt.files;
   const before=localStorage.getItem('bu-visual-lab-wordtrails-next-v1');
   const beforeWallet=localStorage.getItem('bible-unfolded-rewards-v17');
   const originalConfirm=window.confirm;let confirms=0;
   window.confirm=()=>{confirms++;return true};
   const event=new Event('change',{bubbles:true,cancelable:true});
   input.dispatchEvent(event);
   window.confirm=originalConfirm;
   return {
    nativeRestoreSuspended:event.defaultPrevented,
    walletUnchanged:beforeWallet===localStorage.getItem('bible-unfolded-rewards-v17'),
    crosswordUnchanged:before===localStorage.getItem('bu-visual-lab-wordtrails-next-v1'),
    coins:JSON.parse(localStorage.getItem('bu-visual-lab-wordtrails-next-v1')).coins,
    journal:localStorage.getItem('bu-visual-lab-import-rollback-v2'),
    file:input.value,confirms,
    status:document.getElementById('bu-wt-save-status')?.textContent||'',
    reviewOpen:document.getElementById('bu-wt-safe-preview-v34')?.open===true
   };
  },incoming);
  console.log('NATIVE_SETTINGS_V2_IMPORT_UI_SAFELY_SUSPENDED_V35',JSON.stringify(uiRefused));
  assert(uiRefused.nativeRestoreSuspended&&uiRefused.walletUnchanged&&uiRefused.crosswordUnchanged);
  assert.equal(uiRefused.coins,177,'User-facing v2 import must NOT replace TEST coins');
  assert.equal(uiRefused.journal,null);
  assert.equal(uiRefused.confirms,0);
  assert(uiRefused.file===''&&uiRefused.reviewOpen&&uiRefused.status.includes('RESTORE is temporarily disabled'));

  if(errors.length)console.log('PAGE_ERRORS',JSON.stringify(errors.slice(0,8)));
  await page.close();
  console.log('PASS coordinated TEST save v2 native/Word Trails, legacy compatibility, idempotence, rollback and real puzzle resume');
 }catch(e){console.error('FAIL_SAVE_QA',e.stack||e);process.exitCode=1}
 finally{await browser.close()}
})();
#!/usr/bin/env node
'use strict';
// Actual normal TEST host and real 55-level engine. No response interception,
// registration mocks, preview wallet or real-player imports.
const {chromium,webkit}=require('playwright'),fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict'),vm=require('node:vm'),{webcrypto}=require('node:crypto');
const{recoveryNetworkTrace}=require('./qa_recovery_network_trace.cjs');
const BASE=process.env.WT_55_URL||'http://127.0.0.1:8905/index.html',P='bu-visual-lab-shared-standard-v1:',W='bible-unfolded-rewards-v17',R=W+'-recovery-v3811',T='bu-visual-lab-wordtrails-shared-preview-v1',M='__imported_regular_test_v1__';
const scope={window:{}};for(const r of ['46-50','51-55'])vm.runInNewContext(fs.readFileSync('experiments/word-trails-levels-'+r+'-v1.js','utf8'),scope);
const pack=JSON.parse(JSON.stringify(scope.window.BUWTLevels51to55)),last50=JSON.parse(JSON.stringify(scope.window.BUWTLevels46to50[4]));
const originals={[W]:'{"coins":31,"points":7,"purchases":["seawheel"]}','bu-visual-lab-wordtrails-next-v1':'{"coins":111,"level":0}',['bu-visual-lab-shared-preview-20261116:'+W]:'{"coins":73,"points":8}',['bu-visual-lab-regular-wallet-copy-20261116:'+W]:'{"coins":91,"points":8}'};
function oldKeys(complete=true){const receipts={};for(let n=1;n<=(complete?50:49);n++){receipts['trails:l'+n+':complete']={delta:4,kind:'credit'};if(n%5===0)receipts['trails:l'+n+':seal']={delta:3,kind:'credit'};}
 const w={coins:1000,points:-40,earned:['past-award'],spent:[],purchases:['goldwheel'],hints:{},wtReceipts:receipts,wtPreviewMigration:1,lastDay:new Date().toISOString().slice(0,10),lastPopup:new Date().toISOString().slice(0,10),streak:1,
 buNativeBoostState:{version:1,tokens:1000,sourceCoins:1000,inventory:{fifty:2,shield:1,letter:0},stars:4,earnedSet:['past-award'],granted:0},
 buJamesReturnState:{v:1,balance:1000,lives:5,refillAt:0,pot:0,chain:0,best:0,totalCorrect:0,insurance:0,owned:['books'],achievements:[],mastery:{active:false,progress:0,awarded:[]},history:[],recentDay:'',created:1}};
 const t={level:49,unlocked:49,coins:111,points:500,completed:Array.from({length:complete?50:49},(_,i)=>i),sparks:[],claimedSparks:[],boardBible:[],paidWords:complete?last50.words.map(x=>'49|'+x[0]):[],paidBonuses:[],claimedFreeHints:[],progress:null};
 return {[W]:JSON.stringify(w),[R]:JSON.stringify(w),[T]:JSON.stringify(t),'bible-unfolded-wheel-ownership-v3825':'{"version":1,"owned":["goldwheel"]}','bible-unfolded-wheel-ownership-v3825-backup':'{"version":1,"owned":["goldwheel"]}','buGuideLast:0':'17','bu-55-preservation-canary':'preserve'};
}
async function priorBackup(){const window={};new Function('window','crypto','TextEncoder',cp.execFileSync('git',['show','624fff4d11ab02dea673a20b67be94ab8915fa75:experiments/bu-test-shared-backup-v2.js'],{encoding:'utf8'}))(window,webcrypto,TextEncoder);const keys=oldKeys();return window.BUSharedTestBackup.create({list:()=>Object.keys(keys),get:k=>keys[k]??null,writable:()=>true}).exportSnapshot();}
async function ready(p){await p.waitForLoadState('load',{timeout:120000});await p.waitForFunction(()=>window.BUPreviewStorageFence?.writerStatus().writable&&window.BUWTNativeShell?.nativeReady()&&window.BUStoryGenesis13Test?.status==='ready'&&window.BUStoryGenesis14Test?.status==='ready'&&window.BUNativeBoostShop&&window.BUJamesReturnLoopV1&&window.BUTestInsightBridge?.nativeBalance().ok&&economy.lastDay===currentLocalDay(),null,{timeout:120000});if(await p.locator('#daily-continue').isVisible())await p.locator('#daily-continue').tap();}
async function launch(p){await home(p);await p.locator('#home-cross').tap();await p.waitForFunction(()=>document.getElementById('bu-wt-native-game')?.contentWindow?.document.getElementById('coin-label')?.textContent==='TOKENS'&&document.getElementById('bu-wt-native-game').contentWindow.document.querySelectorAll('#board .tile').length>0&&document.getElementById('bu-wt-native-game').contentWindow.document.querySelectorAll('.wheel-letter').length>=5&&document.getElementById('bu-wt-native-game').contentWindow.BUWTUnifiedMenu);const f=p.frames().find(f=>f.url().includes('/experiments/word-trails-next-v1.html'));await f.waitForLoadState('load');// WebKit needs the newly opened iframe focused before touch compatibility clicks.
await p.locator('#bu-wt-native-game').focus();await f.evaluate(()=>document.fonts.ready);await p.waitForTimeout(500);return f;}
async function home(p){await p.evaluate(()=>{BUWTNativeShell.close();closeDialog();closeMenu();focusHome()});await p.waitForTimeout(600);await p.waitForFunction(()=>!document.getElementById('bu-wt-native-game')&&document.getElementById('home')?.getClientRects().length);}
async function state(p){return p.evaluate(({W,T})=>{const w=JSON.parse(localStorage.getItem(W));return {w,t:JSON.parse(localStorage.getItem(T)),balance:economy.coins,root:BUPlatformRewards.wallet().coins,boost:BUNativeBoostShop.preview().tokens,james:BUJamesReturnLoopV1.inspect().balance};},{W,T});}
async function parity(p){const s=await state(p);assert.equal(s.balance,s.w.coins);for(const k of ['root','boost','james'])assert.equal(s[k],s.balance,k);return s;}
async function closeDiscovery(f){if(await f.locator('#discovery').isVisible())await f.locator('#spark-next').tap();}
async function word(f,answer){const letters=await f.locator('.wheel-letter').allTextContents(),used=new Set();for(const c of answer){const i=letters.findIndex((s,n)=>s===c&&!used.has(n));assert(i>=0,'Missing '+c+' for '+answer);used.add(i);await f.locator('.wheel-letter').nth(i).tap();}assert.equal(await f.locator('#preview').textContent(),answer);await f.locator('#submit').tap();await closeDiscovery(f);}
async function swipe(p,f,answer,engine){const letters=await f.locator('.wheel-letter').allTextContents(),used=new Set(),points=[];for(const c of answer){const i=letters.findIndex((s,n)=>s===c&&!used.has(n));assert(i>=0);used.add(i);const b=await f.locator('.wheel-letter').nth(i).boundingBox();points.push({x:b.x+b.width/2,y:b.y+b.height/2});}
 if(engine==='chromium'){const d=await p.context().newCDPSession(p),touch=q=>({...q,id:1,radiusX:2,radiusY:2,force:1});await d.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[touch(points[0])]});for(const q of points.slice(1))await d.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[touch(q)]});await d.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await d.detach();}
 else{await p.mouse.move(points[0].x,points[0].y);await p.mouse.down();for(const q of points.slice(1))await p.mouse.move(q.x,q.y);await p.mouse.up();}await p.waitForTimeout(250);await closeDiscovery(f);
}
async function map(f){
 // Treat the post-swipe map action like every other native map control: allow
 // the preceding pointer release/dialog close to paint, then verify the real
 // target. A fixed delay alone did not guarantee this in CI Chromium at 430px.
 await f.locator('#discovery[open]').waitFor({state:'hidden'});
 const button=f.locator('#level-map');await button.scrollIntoViewIfNeeded();
 await f.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 assert(await button.evaluate(el=>{const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return hit===el||el.contains(hit)}),'Level map must be the actual touch target');
 await button.tap();await f.locator('#map[open]').waitFor();assert.equal(await f.locator('.map-level').count(),55);assert((await f.locator('.map-chapter-title').allTextContents()).at(-1).includes('CHAPTER 11 · Learning and Serving'));}
const nativeDialogHandling=new WeakMap();
function acceptNativeDialogs(p){
 const state={accepted:new WeakMap(),errors:[],dialogs:[],dismissNext:false};nativeDialogHandling.set(p,state);
 p.on('dialog',dialog=>{state.dialogs.push({type:dialog.type(),message:dialog.message()});console.log('NATIVE_DIALOG',dialog.type(),dialog.message());const dismiss=dialog.type()==='confirm'&&state.dismissNext;state.dismissNext=false;const task=dismiss?dialog.dismiss():dialog.accept();state.accepted.set(dialog,task);task.catch(error=>state.errors.push(error.message));});
}
function dismissNextNativeConfirm(p){const state=nativeDialogHandling.get(p);assert(state);state.dismissNext=true;}
function assertNativeDialogs(p){assert.deepEqual(nativeDialogHandling.get(p)?.errors||[],[],'Native dialog handling must not fail');}
async function touchMapAction(p,f,id,resetDecision='accept'){
 await p.bringToFront();await p.locator('#bu-wt-native-game').focus();
 const button=f.locator(id);await button.scrollIntoViewIfNeeded();
 await f.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 assert(await button.isVisible());assert(await button.isEnabled());
 assert(await button.evaluate(el=>{const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return hit===el||el.contains(hit)}),'Map control must be the actual touch target');
 const r=await button.boundingBox();
 if(id==='#reset-test'){
  const before=await state(p),handling=nativeDialogHandling.get(p);assert(handling,'Native dialog handling must be observed');
  assert(['accept','cancel'].includes(resetDecision));if(resetDecision==='cancel')dismissNextNativeConfirm(p);
  const confirmation=p.waitForEvent('dialog',{predicate:d=>d.type()==='confirm',timeout:20000});
  const gesture=p.touchscreen.tap(r.x+r.width/2,r.y+r.height/2);
  // Observe both promises immediately, including on failure/teardown.
  gesture.catch(()=>{});confirmation.catch(()=>{});
  const dialog=await confirmation;assert.match(dialog.message(),/Restart only this isolated preview's Word Trails progress/);
  const accepted=handling.accepted.get(dialog);assert(accepted,'The actual native confirmation must be accepted and observed');await accepted;console.log('RESET_TOUCH_CONFIRM_HANDLED',resetDecision);
  // Native modal dismissal can return focus to the top-level web view rather
  // than its game frame. Restore the actual foreground page/frame before
  // checking its animation-frame-polled DOM (no synthetic click or reset).
  await p.bringToFront();await p.locator('#bu-wt-native-game').focus();
  console.log('RESET_FOREGROUND',await f.evaluate(()=>({hidden:document.hidden,focus:document.hasFocus(),mapOpen:document.getElementById('map').open})));
  // The engine defers its confirmation until the activating input returns.
  // Require the actual native gesture acknowledgement BEFORE refreshing.
  let timeout;try{await Promise.race([gesture,new Promise((_,reject)=>{timeout=setTimeout(()=>reject(Error('Native reset touch did not acknowledge')),20000)})])}finally{clearTimeout(timeout)}
  console.log('RESET_NATIVE_TOUCH_ACKNOWLEDGED',resetDecision);
  if(resetDecision==='cancel'){await f.locator('#map[open]').waitFor();assert.deepEqual(await state(p),before,'Cancel must not change any wallet or Trail state');assert.deepEqual(handling.errors,[]);return;}
  await f.locator('#map[open]').waitFor({state:'hidden'});
  await map(f);assert.equal(await f.locator('.map-level:enabled').count(),1,'Reset must rebuild locks, not leave the old unlocked map usable');
  assert(await f.locator('.map-level').nth(50).isDisabled());await f.locator('#map-x').tap();
  await p.reload({waitUntil:'domcontentloaded',timeout:120000});
  await ready(p);const after=await parity(p);
  assert.equal(after.t.level,0);assert.equal(after.t.unlocked,0);assert.deepEqual(after.t.completed,[]);assert.equal(after.t.progress,null);
  assert.deepEqual(after.w,before.w,'Reset and refresh must preserve the complete shared wallet, stock, purchases and receipts');
  assert.deepEqual(handling.errors,[]);console.log('RESET_TOUCH_REFRESH_ACK_DURABLE',JSON.stringify({completed:after.t.completed.length,tokens:after.balance,receipts:Object.keys(after.w.wtReceipts||{}).length,walletUnchanged:true}));return;
 }
 let timeout;try{await Promise.race([p.touchscreen.tap(r.x+r.width/2,r.y+r.height/2),new Promise((_,reject)=>{timeout=setTimeout(()=>reject(Error('Native touchscreen did not acknowledge '+id)),20000)})])}finally{clearTimeout(timeout)}
}
async function exportUI(p){await home(p);await p.evaluate(()=>openDialog('settings'));const[download]=await Promise.all([p.waitForEvent('download',{timeout:60000}),p.locator('#save-export').click()]);const data=JSON.parse(fs.readFileSync(await download.path(),'utf8'));assert.equal(data.version,2);assert.equal(data.format,'BibleUnfoldedSharedInsightTest');await p.evaluate(()=>closeDialog());return data;}
async function choose(p,data){await home(p);await p.evaluate(()=>openDialog('settings'));await p.locator('#save-import').tap();const file=p.waitForEvent('filechooser',{timeout:60000}).then(c=>c.setFiles({name:'complete55.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))}));await Promise.all([file,p.locator('#bu-shared-restore-file').click()]);}
async function restore(p,data){await choose(p,data);await p.locator('#bu-shared-restore-review').waitFor({state:'visible'});await p.locator('#bu-shared-restore-confirm').tap();await p.waitForFunction(()=>document.querySelector('#bu-shared-restore-review [role=status]')?.textContent||(!document.getElementById('bu-shared-restore-review')&&window.BUPreviewStorageFence?.writerStatus().writable),null,{timeout:120000});assert.equal(await p.evaluate(()=>document.querySelector('#bu-shared-restore-review [role=status]')?.textContent||''),'');await ready(p);}
async function reload(p){await p.reload({waitUntil:'domcontentloaded',timeout:120000});await ready(p);assert.equal(new URL(p.url()).hash,'');assert(await p.locator('#home').isVisible());}
async function context(browser,width,height,complete){const c=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:true,timezoneId:'UTC',acceptDownloads:true});if(complete!==undefined)await c.addInitScript(({P,M,keys,originals})=>{if(localStorage.getItem('__55_seeded'))return;localStorage.setItem('__55_seeded','1');for(const[k,v]of Object.entries(originals))localStorage.setItem(k,v);for(const[k,v]of Object.entries(keys))localStorage.setItem(P+k,v);localStorage.setItem(P+M,'1');},{P,M,keys:typeof complete==='object'?complete:oldKeys(complete),originals});return c;}
const VIEWPORTS=[[320,568],[430,932]].filter(([w])=>!process.env.WT_WIDTHS||process.env.WT_WIDTHS.split(',').includes(String(w)));assert(VIEWPORTS.length,'WT_WIDTHS must include 320 or 430');
fs.mkdirSync('work/word-trails-55-integration',{recursive:true});const evidence=[];
module.exports={oldKeys,pack,P,W,R,T,context,ready,launch,map,acceptNativeDialogs,assertNativeDialogs,touchMapAction,word,parity,state,exportUI,restore};
if(require.main===module)(async()=>{const oldFile=await priorBackup();for(const engine of(process.env.WT_ENGINES||'chromium,webkit').split(',')){const browser=await(engine==='webkit'?webkit:chromium).launch(engine==='webkit'?{headless:true}:{headless:true,executablePath:process.env.CHROME_BIN||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});try{for(const[width,height]of VIEWPORTS){
 // Genuine first login: no seeded game data and no premature extension unlock.
 {const c=await context(browser,width,height),p=await c.newPage();try{await p.goto(BASE,{waitUntil:'domcontentloaded',timeout:120000});await ready(p);const before=await parity(p);assert.equal(before.balance,60);const f=await launch(p);await map(f);assert.equal(await f.locator('.map-level:enabled').count(),1);assert(await f.locator('.map-level').nth(50).isDisabled());assert.equal((await parity(p)).balance,60);console.log('PASS_55_FRESH_LOCKS',engine,width);}finally{await c.close()}}
 // Incomplete Level 50 remains locked; genuine completion unlocks 51 once.
 {const c=await context(browser,width,height,false),p=await c.newPage();try{await p.goto(BASE,{waitUntil:'domcontentloaded',timeout:120000});await ready(p);const f=await launch(p);await map(f);assert(await f.locator('.map-level').nth(50).isDisabled());await f.locator('#map-x').tap();for(const [w]of last50.words)await word(f,w);await f.locator('#finish[open]').waitFor();assert.equal((await parity(p)).balance,1007);await f.locator('#next-level').tap();assert((await f.locator('#level-label').textContent()).includes('51 / 55'));assert.equal((await state(p)).t.unlocked,50);console.log('PASS_55_NORMAL_50_BOUNDARY',engine,width);}finally{await c.close()}}
 const c=await context(browser,width,height,true),p=await c.newPage(),errors=[],network=await recoveryNetworkTrace(p,{engine,width,height,scenario:'actual levels 51-55, reset, restore and replay'});p.on('pageerror',e=>errors.push(e.message));acceptNativeDialogs(p);try{
 await p.goto(BASE,{waitUntil:'domcontentloaded',timeout:120000});await ready(p);let f=await launch(p);let s=await parity(p);assert.equal(s.balance,1000);assert.equal(s.w.points,-40);assert.deepEqual(s.t.completed,Array.from({length:50},(_,i)=>i));assert.equal(s.t.unlocked,50);assert.equal(s.t.coins,111);const oldReceipts=JSON.parse(oldFile.keys[W]).wtReceipts;assert.deepEqual(s.w.wtReceipts,oldReceipts);
 // An authentic V2 snapshot exported by the old main validator remains valid.
 await restore(p,oldFile);f=await launch(p);assert.equal((await parity(p)).balance,1000);await map(f);assert(!await f.locator('.map-level').nth(50).isDisabled());assert(await f.locator('.map-level').nth(51).isDisabled());assert((await f.locator('#wt-map-seal-title').textContent()).includes('Ready to Serve'));await f.locator('.map-level').nth(50).tap();let expected=1000;
 for(let i=0;i<5;i++){
  const lev=pack[i],n=i+51;assert((await f.locator('#level-label').textContent()).includes(n+' / 55'));assert.equal(await f.locator('.wheel-letter').count(),7);assert((await f.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--scene'))).includes(lev.scene));
  // Wrong spelling formed from actual rack letters, with no progress or payment.
  const reserved=new Set([...lev.words.map(x=>x[0]),lev.spark,lev.extraSparks[0].word,...lev.bonus.split(' ')]);let wrong;for(let a=0;a<7&&!wrong;a++)for(let b=0;b<7&&!wrong;b++)for(let d=0;d<7&&!wrong;d++)if(a!==b&&a!==d&&b!==d&&!reserved.has(lev.rack[a]+lev.rack[b]+lev.rack[d]))wrong=lev.rack[a]+lev.rack[b]+lev.rack[d];await word(f,wrong);assert.equal((await parity(p)).balance,expected);assert.equal((await state(p)).t.progress?.found.length||0,0);
  await f.locator('#hint').tap();assert.equal((await parity(p)).balance,expected);assert.equal(await f.locator('#hint-cost').textContent(),'15');const beforeHints=(await state(p)).t.progress.hinted;await f.locator('#hint').tap();expected-=15;s=await parity(p);assert.equal(s.balance,expected);const cell=s.t.progress.hinted.find(k=>!beforeHints.includes(k));assert(s.w.wtReceipts['trails:l'+n+':hint:'+cell]);assert((await p.evaluate(({n,cell})=>BUTestInsightBridge.transact(document.getElementById('bu-wt-native-game').contentWindow,{type:'hint',level:n,cell}),{n,cell})).duplicate);assert.equal((await parity(p)).balance,expected);
  if(i===0){await swipe(p,f,lev.words[0][0],engine);assert.equal((await state(p)).t.progress.found.length,1);await map(f);await touchMapAction(p,f,'#reset-level');assert.equal((await state(p)).t.progress?.found.length||0,0);assert((await state(p)).t.claimedFreeHints.includes(50));assert.equal((await parity(p)).balance,expected);await word(f,lev.words[0][0]);await reload(p);f=await launch(p);assert.equal((await state(p)).t.progress.found.length,1);
   const mid=await exportUI(p);assert.equal(JSON.parse(mid.keys[T]).level,50);await p.locator('#home-rewards').tap();await p.locator('[data-buy="moonwheel"]').tap();assert((await state(p)).w.purchases.includes('moonwheel'));assert.equal((await parity(p)).balance,expected-135);await restore(p,mid);f=await launch(p);assert.equal((await parity(p)).balance,expected);assert(!(await state(p)).w.purchases.includes('moonwheel'));assert((await state(p)).w.purchases.includes('goldwheel'));assert.equal((await state(p)).t.progress.found.length,1);
  }
  for(const hidden of [lev.spark,lev.extraSparks[0].word]){await word(f,hidden);expected++;assert.equal((await parity(p)).balance,expected);await word(f,hidden);assert.equal((await parity(p)).balance,expected);}
  for(const [j,bonus]of lev.bonus.split(' ').entries()){await word(f,bonus);if(j===2)expected++;assert.equal((await parity(p)).balance,expected);}await word(f,lev.bonus.split(' ')[0]);assert.equal((await parity(p)).balance,expected);
  await p.screenshot({animations:'disabled',path:`work/word-trails-55-integration/${engine}-${width}-level${n}.png`});
  const done=new Set((await state(p)).t.progress.found);for(const[w]of lev.words)if(!done.has(w))await word(f,w);await f.locator('#finish[open]').waitFor();expected+=4+(n===55?3:0);s=await parity(p);assert.equal(s.balance,expected);assert(s.t.completed.includes(n-1));assert.equal(s.w.wtReceipts['trails:l'+n+':complete'].delta,4);
  for(const[w,r,col,dir]of lev.words)for(let k=0;k<w.length;k++)assert.equal((await f.locator('[data-pos="'+(r+(dir==='down'?k:0))+':'+(col+(dir==='across'?k:0))+'"]').textContent()).trim(),w[k]);
  if(n<55)await f.locator('#next-level').tap();else{assert.equal(await f.locator('#finish-seal-title').textContent(),'Ready to Serve');assert.equal(s.w.wtReceipts['trails:l55:seal'].delta,3);assert((await f.locator('#finish-next-seal').textContent()).includes('All 11'));await p.screenshot({animations:'disabled',path:`work/word-trails-55-integration/${engine}-${width}-seal55.png`});}
  console.log('PASS_55_REAL_LEVEL',engine,width,n,'all bonuses, two discoveries, free/paid hints, letters, native rewards');
 }
 assert.equal(expected,963);const complete=await exportUI(p);const finalWallet=JSON.parse(complete.keys[W]);assert.equal(JSON.parse(complete.keys[T]).completed.length,55);for(const[id,receipt]of Object.entries(oldReceipts))assert.deepEqual(finalWallet.wtReceipts[id],receipt);assert.equal(finalWallet.points,-40);assert.deepEqual(finalWallet.buNativeBoostState.inventory,{fifty:2,shield:1,letter:0});assert.equal(complete.keys['buGuideLast:0'],'17');
 // Malformed/future/foreign files, including freshly checksummed future state,
 // cannot write or reset any saved tokens, progress, purchases or receipts.
 for(const kind of ['checksum','legacy','future','foreign']){const bad=JSON.parse(JSON.stringify(complete));if(kind==='checksum')bad.keys[W]+=' ';if(kind==='legacy')bad.version=1;if(kind==='foreign')bad.storagePrefix='bu-visual-lab-shared-preview-20261116:';if(kind==='future'){const t=JSON.parse(bad.keys[T]);t.unlocked=55;bad.keys[T]=JSON.stringify(t);delete bad.checksum;bad.checksum=await p.evaluate(x=>BUSharedTestBackup.hash(x),bad);}const before=await state(p);await choose(p,bad);await p.locator('#bu-shared-restore-error').waitFor({state:'visible'});assert.deepEqual((await state(p)).w,before.w);assert.deepEqual((await state(p)).t,before.t);}
 // Confirmed reset changes the iframe synchronously. Do not wait for a
 // navigation signal from this native confirmation; verify the actual save.
 f=await launch(p);await map(f);await touchMapAction(p,f,'#reset-test');await p.waitForFunction(T=>JSON.parse(localStorage.getItem(T)).completed.length===0,T);assert.equal((await state(p)).t.completed.length,0);assert.equal((await parity(p)).balance,963);await restore(p,complete);f=await launch(p);s=await parity(p);assert.equal(s.t.level,54);assert.equal(s.t.completed.length,55);assert.equal(s.balance,963);assert.deepEqual(s.w.wtReceipts,finalWallet.wtReceipts);
 // Full final-level replay must not repay the seal, discoveries, satchel or level.
 for(const hidden of [pack[4].spark,pack[4].extraSparks[0].word])await word(f,hidden);for(const b of pack[4].bonus.split(' '))await word(f,b);for(const[w]of pack[4].words)await word(f,w);await f.locator('#finish[open]').waitFor();assert.equal((await parity(p)).balance,963);assert.deepEqual((await state(p)).w.wtReceipts,finalWallet.wtReceipts);assert((await f.locator('#finish-seal-note').textContent()).includes('previously collected'));await f.locator('#next-level').tap();assert((await f.locator('#wt-map-seal-detail').textContent()).includes('55-level journey is complete'));assert.equal((await state(p)).t.coins,111);
 assert(!await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2));assert(!await f.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2));assert.deepEqual(await p.evaluate(keys=>Object.fromEntries(keys.map(k=>[k,BUPreviewStorageFence.originalKeyValue(k)])),Object.keys(originals)),originals);assert.deepEqual(errors,[]);assertNativeDialogs(p);
 evidence.push({engine,width,height,levelsCompleted:5,bonusWords:60,hiddenDiscoveries:10,old50BackupRestored:true,new55BackupRestored:true,finalReplayNoPayout:true,originalsUnchanged:true,pageErrors:0});console.log('PASS_55_INTEGRATION_BROWSER',engine,width,'old/new V2 restore; 50→51; all five levels; no duplicate payments; original/private scopes intact');
 }catch(e){await p.screenshot({path:`work/word-trails-55-integration/${engine}-${width}-FAIL.png`,timeout:10000}).catch(()=>{});console.error('55_DIAGNOSTIC',engine,width,JSON.stringify(await state(p).then(s=>({coins:s.balance,level:s.t?.level,unlocked:s.t?.unlocked,completed:s.t?.completed.length,progress:s.t?.progress,receipts:Object.keys(s.w.wtReceipts||{}).length,errors})).catch(()=>null)));throw e;}finally{await network.save(`work/word-trails-55-integration/network-${engine}-${width}.json`);await c.close()}
 } }finally{await browser.close()}}fs.writeFileSync(process.env.WT_55_EVIDENCE||'work/word-trails-55-integration/evidence.json',JSON.stringify(evidence,null,2));})().catch(e=>{console.error(e);process.exitCode=1});

/* Explicit Visual Lab TEST tool. No account identity/authentication is implied.
 * Nothing happens on ordinary visits. Never load/apply in LIVE or previews.
 * The existing native wallet, writer lock and save/recovery path own the money.
 */
(function(){'use strict';
const TARGET=45000,RECEIPT='test-dev-topup-45000-v1',ATTEMPT='__developer_topup_45000_v1__',PHRASE='TOP UP TEST TO 45000';
const need=(ok,message)=>{if(!ok)throw Error(message)};
function create(io){
 let prepared=null;
 function state(){
  need(io.allowed(),'Open this tool in the writable, regular Visual Lab TEST game.');
  const s=io.read();need(s&&Number.isSafeInteger(s.wallet?.coins)&&s.wallet.coins>=0&&Array.isArray(s.wallet.earned),'The native TEST wallet could not be verified.');
  return {...s,claimed:s.wallet.earned.includes(RECEIPT),attempted:io.attempt()!==null};
 }
 function inspect(){const s=state();return {balance:s.wallet.coins,delta:Math.max(0,TARGET-s.wallet.coins),claimed:s.claimed,attempted:s.attempted};}
 async function prepare(){
  prepared=null;const s=state();need(!s.claimed&&!s.attempted,'This one-time TEST grant has already been recorded or attempted in this browser.');
  const snapshot=await io.exportSnapshot();await io.validate(snapshot);
  const current=state();need(current.raw===snapshot.keys['bible-unfolded-rewards-v17'],'Your wallet changed while preparing the backup. Download a fresh backup.');
  need(!current.claimed&&!current.attempted,'This one-time TEST grant is no longer available.');
  prepared={raw:current.raw};
  return {snapshot,balance:current.wallet.coins,delta:Math.max(0,TARGET-current.wallet.coins),after:Math.max(TARGET,current.wallet.coins)};
 }
 function commit({confirmation,backupSaved}={}){
  need(prepared&&confirmation===PHRASE&&backupSaved===true,'Save the complete TEST backup and enter the confirmation phrase first.');
  const s=state();need(!s.claimed&&!s.attempted,'This one-time TEST grant has already been recorded or attempted.');
  need(s.wallet.earned.length<20000,'The native reward ledger is full. No grant was attempted.');
  need(s.raw===prepared.raw,'Your wallet changed after the backup. Download a fresh backup before continuing.');
  const delta=Math.max(0,TARGET-s.wallet.coins);
  const intent=JSON.stringify({version:1,receipt:RECEIPT,target:TARGET,before:s.wallet.coins,delta,createdAt:new Date().toISOString()});
  // Write ahead, fail closed. This is only a one-time-attempt marker, NOT a
  // wallet. Its __ key is intentionally outside V2's game-record restore set:
  // restoring a pre-grant snapshot in this browser cannot enable another grant.
  io.reserve(intent);need(io.attempt()===intent,'The one-time marker could not be verified. No grant was requested.');
  prepared=null;
  const next=JSON.parse(JSON.stringify(s.wallet));next.coins+=delta;next.earned.push(RECEIPT);
  need(io.save(next)===true,'The TEST save was not verified. No retry is allowed automatically; keep the backup and recovery records for review.');
  const after=state();need(after.claimed&&after.wallet.coins===next.coins,'The saved TEST grant could not be verified. Keep the backup and recovery records for review.');
  return {ok:true,delta,balance:after.wallet.coins};
 }
 return Object.freeze({inspect,prepare,commit});
}
if(typeof module==='object'&&module.exports){module.exports={create,TARGET,RECEIPT,ATTEMPT,PHRASE};return;}
const w=window,params=new URLSearchParams(location.search);
if(params.get('bu_test_grant')!=='45000'||w.parent!==w)return;
const host=location.hostname.toLowerCase(),local=['localhost','127.0.0.1'].includes(host);
const testPath=/^\/Bible-Unfolded-Visual-Lab(?:\/|$)/.test(location.pathname);
if((!local&&!(host==='basilejoseph325-jpg.github.io'&&testPath))||/^\/Story-Trails(?:\/|$)/.test(location.pathname))return;
if(params.has('bu_shared_wallet_preview')||params.has('bu_import_regular_test')||params.has('standalone')||params.has('qaDate'))return;
const W='bible-unfolded-rewards-v17',PREFIX='bu-visual-lab-shared-standard-v1:';
function allowed(){const f=w.BUPreviewStorageFence;return f?.active&&f.standardMode&&!f.importMode&&f.previewPrefix===PREFIX&&f.scopeKey(W)===PREFIX+W&&f.writerStatus().writable&&f.sharedBackup&&!f.sharedBackup.hasPending()&&typeof economy!=='undefined'&&typeof saveEconomy==='function'&&typeof bu3824RefreshWallet==='function'&&typeof updateWallet==='function';}
const io={allowed,
 read(){bu3824RefreshWallet();const raw=localStorage.getItem(W);need(raw&&JSON.parse(raw).coins===economy.coins,'The native wallet and its saved record disagree.');return {raw,wallet:JSON.parse(raw)};},
 attempt:()=>localStorage.getItem(ATTEMPT),reserve:value=>localStorage.setItem(ATTEMPT,value),
 exportSnapshot:()=>w.BUPreviewStorageFence.makePreviewBackup(),validate:snapshot=>w.BUSharedTestBackup.validate(snapshot),
 save(next){const before=JSON.parse(JSON.stringify(economy));economy=next;try{if(saveEconomy()!==true){economy=before;updateWallet();return false;}updateWallet();w.dispatchEvent(new Event('bu-test-insight-change'));w.dispatchEvent(new Event('bu-platform-rewards-change'));return true;}catch(error){economy=before;updateWallet();throw error;}}
};
function mount(){
 const service=create(io),open=document.createElement('button');open.id='bu-test-grant-open';open.type='button';open.textContent='TEST testing grant';open.style.cssText='position:fixed;bottom:calc(10px + env(safe-area-inset-bottom));right:10px;z-index:12000;border:2px solid #d5b56c;border-radius:12px;background:#092c35;color:#fff1cd;padding:12px;font:700 15px system-ui;max-width:85vw';document.body.append(open);
 open.onclick=()=>{
  let box=document.getElementById('bu-test-grant-dialog');if(box){box.showModal();return;}
  box=document.createElement('dialog');box.id='bu-test-grant-dialog';box.style.cssText='box-sizing:border-box;width:min(94vw,440px);max-height:90dvh;overflow:auto;border:2px solid #d5b56c;border-radius:18px;padding:20px;background:#092c35;color:#fff1cd;font:16px/1.5 system-ui;';
  box.innerHTML='<h2 style="margin:0 0 12px">TEST wallet top-up</h2><p>This optional developer tool brings this browser’s TEST wallet to <strong>45,000 total Insight Tokens</strong>. A higher balance stays higher. Points, progress and purchases stay intact.</p><p>There’s no owner sign-in here. Anyone who deliberately opens this testing link can use it on their own local TEST wallet. It is not a private owner entitlement.</p><p id="bu-test-grant-summary"></p><button type="button" id="bu-test-grant-backup">1. Download complete TEST backup</button><label style="display:block;margin:16px 0"><input type="checkbox" id="bu-test-grant-saved"> I saved the complete TEST backup</label><label for="bu-test-grant-phrase">Type <strong>TOP UP TEST TO 45000</strong></label><input id="bu-test-grant-phrase" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" style="box-sizing:border-box;width:100%;min-height:44px;font:inherit;margin:8px 0"><button type="button" id="bu-test-grant-apply" disabled>2. Apply one-time TEST top-up</button><p id="bu-test-grant-status" role="status" aria-live="polite"></p><p style="font-size:14px"><strong>Before you apply:</strong> Restoring this pre-grant backup later will restore your old, smaller balance, but the one-time grant will remain used. After applying, export a NEW complete TEST backup from Settings. <strong>Do not clear Chrome site data</strong> to retry: doing so could erase locally saved LIVE progress on this same GitHub Pages site.</p><p style="font-size:14px">A one-time attempt is retained through backup restores in this browser. If a save is interrupted, keep the backup and recovery records; this tool won’t silently retry.</p><button type="button" id="bu-test-grant-close">Return to TEST</button>';
  for(const b of box.querySelectorAll('button'))b.style.cssText='box-sizing:border-box;display:block;width:100%;min-height:46px;margin:8px 0;padding:10px;border:1px solid #d5b56c;border-radius:10px;background:#dbc181;color:#092c35;font:700 15px/1.4 system-ui';
  const $=id=>box.querySelector('#bu-test-grant-'+id),status=$('status'),apply=$('apply'),download=$('backup');let reviewed=false,busy=false;
  const update=()=>{apply.disabled=busy||!reviewed||!$('saved').checked||$('phrase').value!==PHRASE;apply.style.opacity=apply.disabled?'.5':'1';};
  function describe(){try{const s=service.inspect();$('summary').textContent=`Current balance: ${s.balance.toLocaleString('en-US')}. One-time addition: ${s.delta.toLocaleString('en-US')}.`;if(s.claimed||s.attempted){download.disabled=true;reviewed=false;status.textContent=s.claimed?'This one-time TEST grant is already recorded. No additional tokens will be added.':'A previous grant attempt is recorded in this browser. No additional grant is allowed, including after an older backup restore. Keep your backup and recovery records if the attempt was interrupted.';}}catch(error){download.disabled=true;status.textContent=error.message+' Close other TEST tabs and reload if needed.';}update();}
  download.onclick=async()=>{busy=true;reviewed=false;download.disabled=true;update();try{const p=await service.prepare(),blob=new Blob([JSON.stringify(p.snapshot,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Bible_Unfolded_TEST_before_45000_topup.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);$('summary').textContent=`${p.balance.toLocaleString('en-US')} + ${p.delta.toLocaleString('en-US')} = ${p.after.toLocaleString('en-US')} Insight Tokens.`;status.textContent='Save the downloaded file (or use your phone’s share menu), then confirm below. No top-up has been applied.';reviewed=true;}catch(error){status.textContent=error.message;}finally{busy=false;download.disabled=false;update();}};
  apply.onclick=()=>{busy=true;update();try{const result=service.commit({confirmation:$('phrase').value,backupSaved:$('saved').checked});status.textContent=`TEST top-up saved: +${result.delta.toLocaleString('en-US')}. Shared wallet: ${result.balance.toLocaleString('en-US')} Insight Tokens. The one-time grant is recorded. Next: export a NEW complete TEST backup from Settings to preserve the credited balance.`;reviewed=false;download.disabled=true;$('saved').disabled=true;$('phrase').disabled=true;}catch(error){status.textContent=error.message;reviewed=false;}finally{busy=false;update();}};
  $('saved').onchange=update;$('phrase').oninput=update;
  $('close').onclick=()=>{box.close();box.remove();open.remove();const url=new URL(location.href);url.searchParams.delete('bu_test_grant');history.replaceState(history.state,'',url);};
  document.body.append(box);describe();box.showModal();
 };
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();

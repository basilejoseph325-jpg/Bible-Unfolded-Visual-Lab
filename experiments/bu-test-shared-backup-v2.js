/* Visual Lab only: coordinated snapshots of the EXISTING shared native wallet
 * and game records. No currency policy, legacy conversion, or LIVE restore. */
(()=>{'use strict';
const FORMAT='BibleUnfoldedSharedInsightTest',SCOPE='bu-visual-lab-shared-standard-v1:';
const W='bible-unfolded-rewards-v17',R=W+'-recovery-v3811',T='bu-visual-lab-wordtrails-shared-preview-v1';
const JOURNAL='__shared_restore_journal_v2__',CHECKPOINT='__shared_restore_checkpoint_v2__',MARKER='__imported_regular_test_v1__',NOTICE='__shared_restore_notice_v2__';
const LIMIT=3000000,MAX_KEYS=3000,OWNERS=['bible-unfolded-wheel-ownership-v3825','bible-unfolded-wheel-ownership-v3825-backup'],WHEELS=['goldwheel','moonwheel','seawheel'];
const plain=o=>!!o&&typeof o==='object'&&!Array.isArray(o)&&Object.getPrototypeOf(o)===Object.prototype;
const need=(ok,message)=>{if(!ok)throw Error(message);};
const integer=n=>Number.isSafeInteger(n)&&n>=0;
const strings=a=>Array.isArray(a)&&a.length<=20000&&a.every(s=>typeof s==='string'&&s.length<=300);
const keyOK=k=>/^(?:bible-unfolded-|story-trails-|bu|chat)/.test(k)&&k.length<=200&&!/^bu-visual-lab-(?:shared-|regular-wallet-copy-)/.test(k);
function safeTree(o){if(!o||typeof o!=='object')return;for(const k of Object.keys(o)){need(!['__proto__','constructor','prototype'].includes(k),'Unsafe object field');safeTree(o[k]);}}
function stable(o){return JSON.stringify(o,(_,v)=>plain(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);}
async function hash(o){const bytes=new TextEncoder().encode(stable(o));return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');}
function rawMap(keys){need(plain(keys)&&Object.keys(keys).length<=MAX_KEYS,'Invalid snapshot records');need(JSON.stringify(keys).length<=LIMIT,'Snapshot exceeds safe size');safeTree(keys);for(const [k,v] of Object.entries(keys))need(keyOK(k)&&(typeof v==='string'||(k===T&&v===null)),'Unknown or invalid game record: '+k);}
function wallet(raw){let w;try{w=JSON.parse(raw);}catch(_){throw Error('Invalid native wallet JSON');}need(plain(w)&&integer(w.coins)&&Number.isFinite(w.points),'Invalid native tokens or Points');safeTree(w);
 for(const k of ['earned','spent','purchases'])if(w[k]!==undefined)need(strings(w[k]),'Invalid wallet '+k);
 if(w.hints!==undefined)need(plain(w.hints),'Invalid hint records');
 if(w.wtReceipts!==undefined){need(plain(w.wtReceipts)&&Object.keys(w.wtReceipts).length<=4000,'Invalid reward ledger');for(const [id,r] of Object.entries(w.wtReceipts)){
  const m=/^trails:l(\d{1,2}):(complete|seal|satchel|discovery:[a-z]{3,12}|hint:[0-6]:[0-6])$/.exec(id);
  need(m&&+m[1]>=1&&+m[1]<=50&&plain(r),'Invalid Trail receipt');
  const kind=m[2],delta=kind==='complete'?4:kind==='seal'?3:kind.startsWith('hint:')?-15:1;
  need(kind!=='seal'||+m[1]%5===0,'Invalid seal receipt');
  need(r.kind==='legacy'?r.delta===0:r.delta===delta&&r.kind===(delta<0?'spend':'credit'),'Invalid receipt amount');
 }}
 if(w.buNativeBoostState!==undefined){const b=w.buNativeBoostState;need(plain(b)&&b.version===1&&plain(b.inventory),'Invalid booster inventory');for(const k of ['fifty','shield','letter'])need(integer(b.inventory[k]),'Invalid booster stock');for(const k of ['stars','granted'])need(integer(b[k]),'Invalid booster rewards');need(strings(b.earnedSet),'Invalid booster award records');}
 if(w.buJamesReturnState!==undefined){const b=w.buJamesReturnState;need(plain(b)&&b.v===1&&strings(b.owned)&&strings(b.achievements),'Invalid Return Challenge records');for(const k of ['balance','pot','lives','totalCorrect','chain','best','insurance'])need(integer(b[k]),'Invalid Return Challenge '+k);}
 return w;
}
function trail(raw){if(raw===null)return null;let t;try{t=JSON.parse(raw);}catch(_){throw Error('Invalid Trail JSON');}need(plain(t),'Invalid Trail state');safeTree(t);const level=n=>integer(n)&&n<50;need(level(t.level)&&level(t.unlocked)&&t.unlocked>=t.level,'Invalid Trail level/unlock');need(Array.isArray(t.completed)&&t.completed.every(level)&&new Set(t.completed).size===t.completed.length,'Invalid completed levels');
 for(const k of ['claimedSparks','boardBible','paidWords','paidBonuses'])if(t[k]!==undefined)need(strings(t[k]),'Invalid Trail '+k);
 if(t.claimedFreeHints!==undefined)need(Array.isArray(t.claimedFreeHints)&&t.claimedFreeHints.every(level),'Invalid free hint record');
 if(t.progress!==null&&t.progress!==undefined){const p=t.progress;need(plain(p)&&p.level===t.level&&strings(p.found)&&strings(p.bonuses)&&Array.isArray(p.hinted)&&p.hinted.every(k=>/^[0-6]:[0-6]$/.test(k)),'Invalid in-progress puzzle');}
 return t;
}
function coordinated(keys){rawMap(keys);need(Object.hasOwn(keys,W)&&Object.hasOwn(keys,R)&&Object.hasOwn(keys,T),'A full wallet, recovery and Trail snapshot is required');const w=wallet(keys[W]);need(keys[R]===keys[W],'Wallet recovery does not match the primary');const t=trail(keys[T]);if(!t)need(Object.values(w.wtReceipts||{}).every(r=>r.kind==='legacy'),'Reward receipts require matching Trail progress');
 const wheels=[...(w.purchases||[])].filter(x=>WHEELS.includes(x)).sort();
 for(const key of OWNERS){need(typeof keys[key]==='string','Missing wheel ownership record');let o;try{o=JSON.parse(keys[key]);}catch(_){throw Error('Invalid ownership JSON');}need(plain(o)&&strings(o.owned)&&o.owned.every(x=>WHEELS.includes(x))&&JSON.stringify([...o.owned].sort())===JSON.stringify(wheels),'Wheel ownership does not match wallet purchases');}
 return w;}
async function validate(data){need(plain(data)&&data.format===FORMAT&&data.version===2&&data.restoreAllowed===true&&data.storagePrefix===SCOPE,'Only matching shared TEST version 2 backups can be restored');need(typeof data.exportedAt==='string'&&Number.isFinite(Date.parse(data.exportedAt)),'Invalid snapshot date');safeTree(data);coordinated(data.keys);const {checksum,...body}=data;need(typeof checksum==='string'&&/^[a-f0-9]{64}$/.test(checksum)&&await hash(body)===checksum,'Backup checksum does not match');return data;}
function summary(keys){const w=wallet(keys[W]),t=trail(keys[T]);return {tokens:w.coins,points:w.points,purchases:(w.purchases||[]).length,completed:t?.completed.length||0,level:t?t.level+1:1,rewards:(w.earned||[]).length+Object.keys(w.wtReceipts||{}).length};}
function create(io){let busy=false;const canRestore=()=>io.writable()||io.recoveryAllowed?.()===true;
 function collect(){const out={};for(const k of io.list())if(keyOK(k)){const v=io.get(k);if(typeof v==='string')out[k]=v;}if(!Object.hasOwn(out,T))out[T]=null;rawMap(out);return out;}
 function apply(keys){for(const k of io.list())if(keyOK(k)&&(!Object.hasOwn(keys,k)||keys[k]===null))io.remove(k);for(const [k,v] of Object.entries(keys)){if(v===null)io.remove(k);else{io.set(k,v);need(io.get(k)===v,'Game record write verification failed');}}}
 function put(k,v){const raw=JSON.stringify(v);io.set(k,raw);need(io.get(k)===raw,'Recovery record could not be verified');}
 async function exportSnapshot(){need(io.writable(),'The TEST wallet is not writable');const keys=collect();const w=wallet(keys[W]);keys[R]=keys[W];const owned=JSON.stringify({version:1,owned:(w.purchases||[]).filter(x=>WHEELS.includes(x)).sort()});for(const key of OWNERS)keys[key]=owned;coordinated(keys);const body={format:FORMAT,version:2,storagePrefix:SCOPE,restoreAllowed:true,exportedAt:new Date().toISOString(),keys};const data={...body,checksum:await hash(body)};need(new TextEncoder().encode(JSON.stringify(data,null,2)).length<=LIMIT,'Snapshot exceeds the safe file size');return data;}
 async function inspect(input){const data=await validate(input);need(canRestore(),'Another page owns the wallet');const current=collect();let view;try{view=summary({...current,[R]:current[W]});}catch(error){need(io.recoveryAllowed?.()===true,error.message);view=null;}return {current:view,backup:summary(data.keys),currentHash:await hash(current),data};}
 async function restore(input,expectedHash){need(!busy&&canRestore(),'A restore is already running or this page is read-only');const canRollback=io.writable();busy=true;let before,journal,staged=false,paused=false;
  try{const data=await validate(input);need(canRestore(),'Wallet ownership changed');io.pause();paused=true;before=collect();need(await hash(before)===expectedHash,'Progress changed after the preview. Reload and review the backup again.');
   const id=crypto.randomUUID();const checkpoint={version:2,scope:SCOPE,id,canRollback,keys:before};checkpoint.checksum=await hash(checkpoint);put(CHECKPOINT,checkpoint);
   journal={version:2,scope:SCOPE,id,canRollback,phase:'apply',before,after:data.keys};journal.checksum=await hash(journal);io.set(MARKER,'restore-pending-v2:'+id);need(io.get(MARKER)==='restore-pending-v2:'+id,'Could not protect restore ownership');staged=true;put(JOURNAL,journal);
   apply(data.keys);io.remove(JOURNAL);need(io.get(JOURNAL)===null,'Restore journal cleanup failed');io.set(MARKER,'1');need(io.get(MARKER)==='1','Restore marker cleanup failed');return {ok:true,reloadRequired:true};
  }catch(error){if(staged&&!canRollback)return {ok:false,recovered:false,reloadRequired:true,error:'Recovery restore was interrupted. Its valid target is retained in the journal. Reload before playing.'};if(staged){try{const rollback={...journal,phase:'rollback'};delete rollback.checksum;rollback.checksum=await hash(rollback);put(JOURNAL,rollback);apply(before);io.remove(JOURNAL);need(io.get(JOURNAL)===null,'Rollback cleanup failed');io.set(MARKER,'1');need(io.get(MARKER)==='1','Rollback marker cleanup failed');return {ok:false,recovered:true,reloadRequired:true,error:error.message};}catch(_){return {ok:false,recovered:false,reloadRequired:true,error:'Restore was interrupted. The recovery journal is retained. Free storage if needed, then reload before playing.'};}}
   return {ok:false,recovered:!!before,reloadRequired:paused,error:error.message};
  }finally{if(!paused)busy=false;}
 }
 async function recoverPending(){
  const raw=io.get(JOURNAL),marker=io.get(MARKER);
  if(raw===null&&!String(marker).startsWith('restore-pending-v2'))return false;
  need(io.ownsLock(),'Exclusive ownership is required for recovery');
  const id=String(marker).slice('restore-pending-v2:'.length);
  try{
   need(raw!==null,'Restore stopped before its journal was saved');
   const j=JSON.parse(raw);safeTree(j);need(plain(j)&&j.version===2&&j.scope===SCOPE&&j.id===id&&typeof j.canRollback==='boolean'&&['apply','rollback'].includes(j.phase)&&(!j.canRollback?j.phase==='apply':true),'Invalid restore journal');
   const {checksum,...body}=j;need(await hash(body)===checksum,'Restore journal checksum failed');rawMap(j.before);if(j.canRollback){wallet(j.before[W]);trail(j.before[T]);}coordinated(j.after);
   apply(j.phase==='rollback'?j.before:j.after);
   io.set(NOTICE,j.phase==='rollback'?'Your interrupted restore was rolled back to its complete recovery checkpoint.':'Your interrupted TEST restore finished. All saved records were restored together.');
  }catch(error){
   // A checksum-verified checkpoint must belong to THIS restore intent. Never
   // silently apply an older journal/checkpoint over newer gameplay.
   let checkpoint;try{checkpoint=JSON.parse(io.get(CHECKPOINT));}catch(_){throw Error('Restore journal and checkpoint cannot be verified; game remains protected');}
   need(plain(checkpoint)&&checkpoint.version===2&&checkpoint.scope===SCOPE&&checkpoint.id===id&&checkpoint.canRollback===true,'No matching recovery checkpoint; game remains protected');
   const {checksum,...body}=checkpoint;need(await hash(body)===checksum,'Recovery checkpoint checksum failed; game remains protected');rawMap(checkpoint.keys);wallet(checkpoint.keys[W]);trail(checkpoint.keys[T]);apply(checkpoint.keys);
   io.set(NOTICE,'Your interrupted restore was rolled back to its complete recovery checkpoint.');
  }
  io.remove(JOURNAL);need(io.get(JOURNAL)===null,'Could not finish restore recovery');io.set(MARKER,'1');need(io.get(MARKER)==='1','Recovery marker cleanup failed');return true;
 }
 function hasPending(){return io.get(JOURNAL)!==null||String(io.get(MARKER)).startsWith('restore-pending-v2');}
 return Object.freeze({exportSnapshot,inspect,restore,recoverPending,hasPending});
}
function closeReview(box){if(!box)return;if(box.open)box.close();box.remove();}
function openImport(service,reload){document.getElementById('bu-shared-restore-error')?.remove();let input=document.getElementById('bu-shared-restore-file');if(!input){input=document.createElement('input');input.id='bu-shared-restore-file';input.type='file';input.accept='.json,application/json';input.style.cssText='display:block;width:100%;max-width:100%;min-height:44px;font:inherit;margin-top:10px';const label=document.createElement('label');label.id='bu-shared-restore-picker';label.textContent='Choose a complete shared TEST backup (.json)';label.append(input);(document.getElementById('bu-shared-restore-recovery')?.parentElement||document.querySelector('.save-transfer')||document.body).append(label);}
 input.value='';input.onchange=async()=>{const f=input.files[0];if(!f)return;try{need(f.size<=LIMIT,'Backup exceeds the safe size limit');const preview=await service.inspect(JSON.parse(await f.text()));closeReview(document.getElementById('bu-shared-restore-review'));const box=document.createElement('dialog');box.id='bu-shared-restore-review';box.style.cssText='width:min(92vw,430px);max-height:88dvh;overflow:auto;background:#092c35;color:#fff0ce;border:2px solid #d9b56b;border-radius:18px;padding:22px;font:16px/1.5 system-ui';
 const heading=document.createElement('h2');heading.textContent='Restore TEST progress?';const detail=document.createElement('p');detail.textContent=preview.current?`Insight Tokens: ${preview.current.tokens} → ${preview.backup.tokens}. Points: ${preview.current.points} → ${preview.backup.points}. Completed Word Trails levels: ${preview.current.completed} → ${preview.backup.completed}. Purchases: ${preview.current.purchases} → ${preview.backup.purchases}. Reward records: ${preview.current.rewards} → ${preview.backup.rewards}.`:`The current TEST state cannot be read. This complete backup has ${preview.backup.tokens} Insight Tokens, ${preview.backup.points} Points, ${preview.backup.completed} completed Word Trails levels, ${preview.backup.purchases} purchases and ${preview.backup.rewards} reward records.`;
 const warning=document.createElement('p');warning.textContent='This replaces your saved TEST game as one complete snapshot. A recovery checkpoint is kept. Your original saves and protected previews stay unchanged.';const status=document.createElement('p');status.setAttribute('role','status');const confirm=document.createElement('button');confirm.id='bu-shared-restore-confirm';confirm.className='gold-button';confirm.textContent='Restore this complete TEST snapshot';const cancel=document.createElement('button');cancel.id='bu-shared-restore-cancel';cancel.style.cssText='display:block;width:100%;min-height:44px;margin-top:10px;border:1px solid #d9b56b;border-radius:10px;background:#092c35;color:#fff0ce;font:inherit';cancel.textContent='Cancel';cancel.onclick=()=>closeReview(box);confirm.onclick=async()=>{confirm.disabled=true;cancel.disabled=true;const result=await service.restore(preview.data,preview.currentHash);if(result.ok){reload();return;}status.textContent=result.error;const again=document.createElement('button');again.className='gold-button';again.style.minHeight='44px';again.textContent=result.reloadRequired?'Reload saved game':'Close';again.onclick=()=>result.reloadRequired?reload():closeReview(box);box.append(again);};box.append(heading,detail,warning,status,confirm,cancel);document.body.append(box);box.showModal();
 }catch(e){document.getElementById('bu-shared-restore-error')?.remove();const error=document.createElement('p');error.id='bu-shared-restore-error';error.setAttribute('role','alert');error.style.cssText='max-width:100%;color:#ffe0a0;overflow-wrap:anywhere';error.textContent='Backup was not restored: '+e.message;(document.getElementById('bu-shared-restore-recovery')?.parentElement||document.querySelector('.save-transfer')||document.body).append(error);}};// Use the browser's real file control. Programmatic picker activation can be
 // rejected after capture handlers on mobile; a direct touch remains reliable.
 input.focus();input.scrollIntoView({block:'nearest'});}
window.BUSharedTestBackup=Object.freeze({create,validate,hash,openImport,format:FORMAT,version:2,keys:Object.freeze({wallet:W,recovery:R,trails:T,journal:JOURNAL,checkpoint:CHECKPOINT,marker:MARKER,notice:NOTICE})});
})();

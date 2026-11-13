/* BIBLE UNFOLDED · Word Trails LIVE migration *candidate* · TEST repository only.
   Not loaded by any game page. Does NOT run migration on page load.
   Next LIVE release needs explicit owner authorization, browser UI consent and a
   verified frozen rollback checkpoint before any code is activated in LIVE. */
(()=>{'use strict';
const TEST='bu-visual-lab-wordtrails-next-v1';
const LIVE='bible-unfolded-word-trails-next-v1';
const KEYS=['completed','sparks','claimedSparks','boardBible','paidWords','paidBonuses','claimedFreeHints'];
const safe=x=>x&&typeof x==='object'&&!Array.isArray(x);
const level=x=>Number.isSafeInteger(x)&&x>=0&&x<30;
function normalize(raw){
  let x;try{x=JSON.parse(raw)}catch(_){return null}
  if(!safe(x)||!level(x.level)||!level(x.unlocked))return null;
  const fields={};
  for(const key of KEYS){
    const arr=x[key]===undefined?[]:x[key];
    if(!Array.isArray(arr)||arr.length>6000)return null;
    for(const v of arr){
      if(typeof v==='number'){if(!level(v))return null}
      else if(typeof v==='string'){if(v.length>100||!/^[a-z0-9_:|.-]+$/i.test(v))return null}
      else return null;
    }
    fields[key]=[...new Set(arr)];
  }
  let progress=null;
  if(x.progress!==undefined&&x.progress!==null){
    const p=x.progress;
    if(!safe(p)||!level(p.level)||!['found','bonuses','hinted'].every(k=>
      p[k]===undefined||(Array.isArray(p[k])&&p[k].length<=120&&
      p[k].every(w=>typeof w==='string'&&w.length<=40&&/^[a-z0-9_:|.-]+$/i.test(w)))))return null;
    const combo=p.combo===undefined?0:p.combo;
    if(!Number.isSafeInteger(combo)||combo<0||combo>1000)return null;
    progress={level:p.level,found:[...new Set(p.found||[])],
      bonuses:[...new Set(p.bonuses||[])],hinted:[...new Set(p.hinted||[])],combo};
  }
  const unlocked=Math.max(x.unlocked,...fields.completed.filter(v=>typeof v==='number').map(v=>Math.min(29,v+1)));
  return {level:x.level,unlocked,coins:60,points:0,...fields,sound:x.sound!==false,progress,
    migration:{version:2,source:'User-approved Word Trails TEST progress',
      temporaryCoinsExcluded:true,temporaryPointsExcluded:true}};
}
function preview(){
 try{
  if(localStorage.getItem(LIVE)!==null)return Object.freeze({available:false,reason:'live-progress-exists'});
  const raw=localStorage.getItem(TEST);
  if(raw===null)return Object.freeze({available:false,reason:'no-test-progress'});
  const proposed=normalize(raw);
  if(!proposed)return Object.freeze({available:false,reason:'invalid-test-progress'});
  return Object.freeze({available:true,source:'TEST',sourceRaw:raw,
    completedCount:proposed.completed.length,unlockedLevels:proposed.unlocked+1,
    tempCoinsExcluded:true,realWalletUntouched:true,realPurchasesUntouched:true,
    requiresExplicitConsent:true});
 }catch(_){return Object.freeze({available:false,reason:'storage-unavailable'})}
}
function acceptExplicitly({approved,sourceRaw}={}){
 if(approved!==true||typeof sourceRaw!=='string')return Object.freeze({ok:false,reason:'consent-required'});
 try{
  if(localStorage.getItem(LIVE)!==null)return Object.freeze({ok:false,reason:'live-progress-exists'});
  const current=localStorage.getItem(TEST);
  if(current===null||current!==sourceRaw)return Object.freeze({ok:false,reason:'test-progress-changed'});
  const safeSave=normalize(current);
  if(!safeSave)return Object.freeze({ok:false,reason:'invalid-test-progress'});
  const body=JSON.stringify(safeSave);
  // Only the LIVE Word Trails progress key is written. No wallet, voice,
  // wheel ownership, Settings, TEST record or global state is modified.
  localStorage.setItem(LIVE,body);
  if(localStorage.getItem(LIVE)!==body)throw Error('save-verification-failed');
  return Object.freeze({ok:true,completedCount:safeSave.completed.length,
    tempCoinsExcluded:true,realWalletUntouched:true});
 }catch(_){return Object.freeze({ok:false,reason:'save-failed'})}
}
window.BUWTConsentMigrationCandidateV1=Object.freeze({
 version:'1.0.0-test-only-not-wired',preview,acceptExplicitly
});
})();

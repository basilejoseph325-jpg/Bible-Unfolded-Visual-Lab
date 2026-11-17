/* Bible Unfolded Visual Lab — proposed shared-currency economy for Word Trails.
 * Not loaded by gameplay. Must pass editorial/budget/mobile QA before rollout.
 * Existing Points, Discovery Stamps, saves, free hints and Journey Seals stay.
 */
(()=>{'use strict';
if(window.BUTestWordTrailsEconomy)return;
const POLICY=Object.freeze({
 levelComplete:4,hiddenBibleDiscovery:1,bonusSatchel:1,
 journeySeal:3,paidLetterHint:15,
 extraBonusWord:0,combo:0,boardBibleWord:0
});
const MAX_LEVEL=55; // Content may grow independently; 50-level budget remains the rollout gate.
function transaction({type,level,word,cell}={}){
 if(!Number.isInteger(level)||level<1||level>MAX_LEVEL)return null;
 const id='trails:l'+level;
 switch(type){
 case 'level':return {id:id+':complete',delta:POLICY.levelComplete,kind:'credit'};
 case 'discovery':
  if(typeof word!=='string'||!/^[A-Z]{3,12}$/.test(word))return null;
  return {id:id+':discovery:'+word.toLowerCase(),delta:POLICY.hiddenBibleDiscovery,kind:'credit'};
 case 'satchel':return {id:id+':satchel',delta:POLICY.bonusSatchel,kind:'credit'};
 case 'seal':
  if(level%5!==0)return null;
  return {id:id+':seal',delta:POLICY.journeySeal,kind:'credit'};
 case 'hint':
  // Actual tile coordinate is part of the once-only purchase receipt.
  if(typeof cell!=='string'||!/^[0-9]{1,2}:[0-9]{1,2}$/.test(cell))return null;
  return {id:id+':hint:'+cell,delta:-POLICY.paidLetterHint,kind:'spend'};
 default:return null;
 }
}
function fullJourneyBudget(levels=MAX_LEVEL,discoveriesPerLevel=2){
 if(!Number.isInteger(levels)||levels<1||levels>MAX_LEVEL||
    !Number.isInteger(discoveriesPerLevel)||discoveriesPerLevel<0||discoveriesPerLevel>3)return null;
 const earned=levels*(POLICY.levelComplete+POLICY.bonusSatchel+
  discoveriesPerLevel*POLICY.hiddenBibleDiscovery)+Math.floor(levels/5)*POLICY.journeySeal;
 return Object.freeze({earned,startingTokens:60,totalPossible:60+earned,
  paidHintsAtFullCollection:Math.floor((60+earned)/POLICY.paidLetterHint)});
}
window.BUTestWordTrailsEconomy=Object.freeze({version:'1.0.0-proposal',policy:POLICY,transaction,fullJourneyBudget});
})();

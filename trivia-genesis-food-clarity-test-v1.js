/* Bible Unfolded · Visual Lab TEST · Genesis 1:29,30 editorial correction.
   Source: NWT 2013 https://www.jw.org/en/library/bible/nwt/books/genesis/1/
   Fix the exact original bank object, not visible-only DOM labels.
   Preserve original question identity for no-repeat award / replay integrity. */
(()=>{'use strict';
if(window.BU_TRIVIA_GENESIS_FOOD_CORRECTION_TEST)return;
const ORIGINAL='Which statement matches the foods assigned in Genesis 1:29, 30?';
const NEW_QUESTION='According to Genesis 1:29, 30, which foods does Jehovah specifically mention for people and for animals?';
const NEW_CHOICES=Object.freeze([
 'For people, only green vegetation; for animals, seed-bearing fruit',
 'For people, seed-bearing plants and fruit trees; for animals and birds, green vegetation',
 'For people, fruit only; for animals, fish and plants',
 'For people and animals alike, meat as their main food'
]);
const NEW_EXPLANATION='Genesis 1:29 mentions seed-bearing plants and trees with seed-bearing fruit as food for humans. Verse 30 specifically mentions green vegetation as food for wild animals, flying creatures, and other living things moving on the earth. The verses tell us what Jehovah provided; they do not say that humans were forbidden to eat other green vegetation. (Genesis 1:29, 30)';
const NEW_HINT='Notice whom Jehovah addresses in verse 29. Then look at the living creatures he names in verse 30. Each verse describes a particular food provision.';
let applied=0;
function correct(item){
 if(!item||item.q!==ORIGINAL&&item.q!==NEW_QUESTION)return false;
 if(item.correct!==1)return false; // Do not risk overwriting a reshuffled/unknown bank.
 // Stable reward identity: native Trivia previously used q.q when researchId
 // was missing. Retaining that exact string prevents duplicate one-time awards.
 if(!item.researchId)item.researchId=ORIGINAL;
 item.q=NEW_QUESTION;
 item.choices=[...NEW_CHOICES];
 item.explanation=NEW_EXPLANATION;
 item.creationFreeHint=NEW_HINT;
 item.ref='Genesis 1:29-30';
 item.sourceUrl='https://www.jw.org/en/library/bible/nwt/books/genesis/1/';
 return true;
}
function apply(){
 try{
  if(typeof BU34_BANK==='undefined'||!Array.isArray(BU34_BANK.genesis))return false;
  const count=BU34_BANK.genesis.filter(x=>x.q===ORIGINAL||x.q===NEW_QUESTION).length;
  if(count!==1){console.warn('[Trivia food TEST] Expected one Genesis entry, found',count);return false}
  for(const entry of BU34_BANK.genesis)if(correct(entry))applied++;
  // If an existing Trivia round has a copied question, bring it into sync.
  if(typeof bu34Quiz!=='undefined'&&Array.isArray(bu34Quiz?.items)){
   let refresh=false;
   bu34Quiz.items.forEach((q,i)=>{
    if(correct(q)&&bu34Quiz.step===i&&!bu34Quiz.answered)refresh=true;
   });
   if(refresh&&typeof bu34Draw==='function')bu34Draw();
  }
  window.BU_TRIVIA_GENESIS_FOOD_CORRECTION_TEST=Object.freeze({
   version:'2026-11-10-genesis-food-clarity-v1',source:'Genesis 1:29, 30 NWT 2013',
   originalIdentity:ORIGINAL,correctIndex:1,appliedToBank:applied>0
  });
  return true;
 }catch(e){console.warn('[Trivia food TEST] Bank patch failed:',e);return false}
}
if(!apply()){
 let count=0;
 const retry=()=>{if(apply()||++count>40)return;setTimeout(retry,200)};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',retry,{once:true});
 else setTimeout(retry,200);
}
})();

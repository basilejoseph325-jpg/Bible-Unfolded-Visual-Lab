/* Genesis Episode 12 — isolated native Story Adventure preview, Visual Lab only.
 * Loads the authored data into the EXISTING interactive wheel engine.
 * Never unlocks a Journey/book tile or rewrites established chapter IDs.
 * Explicit opt-in URL: ?bu_story_preview=genesis_ep12
 * Not a LIVE or owner-accepted release.
 */
(()=>{'use strict';
const BOOK='genesis_ep12';
const PARAM='bu_story_preview';
if(new URLSearchParams(location.search).get(PARAM)!==BOOK)return;
const PACK='story-adventure-content/genesis-episode12-return-to-esau-v1.json';

function status(message,error=false){
 let el=document.getElementById('bu-g12-preview-status');
 if(!el){
  el=document.createElement('div');
  el.id='bu-g12-preview-status';
  el.setAttribute('role','status');
  el.setAttribute('aria-live','polite');
  el.style.cssText='position:fixed;z-index:2147483500;left:8px;right:8px;bottom:8px;margin:auto;max-width:500px;padding:9px 12px;border-radius:12px;background:#173f4d;color:#fff;font:13px/1.35 system-ui;box-shadow:0 3px 16px #0007;text-align:center;pointer-events:none;';
  document.body.appendChild(el);
 }
 el.textContent=message;
 el.style.background=error?'#6b2020':'#173f4d';
 return el;
}
function validate(p){
 if(!p||p.chapterId!==BOOK||p.chapterNumber!==12||p.discoveries?.length!==13)throw Error('Unexpected Genesis 12 content schema');
 for(const [i,d] of p.discoveries.entries()){
  const expected='g12-d'+String(i+1).padStart(2,'0');
  if(d.id!==expected||d.interaction?.type!=='word_connect')throw Error('Invalid discovery '+expected);
  const w=p.words?.[expected];
  if(!w||w.answer!==d.interaction.answer||!/^[A-Z]{4,12}$/.test(w.answer)||!w.clue||!w.hint1||!w.hint2||!w.hint3)throw Error('Incomplete wheel '+expected);
  if(!d.scripture?.every(x=>/^https:\/\/www\.jw\.org\/en\/library\/bible\/nwt\/books\/genesis\/(32|33)\/$/.test(x.url)))throw Error('Unapproved reference '+expected);
 }
}
async function setup(){
 status('TEST ONLY · Loading Genesis Episode 12 into the original Story Adventure wheel…');
 try{
  const response=await fetch(PACK,{cache:'no-store'});
  if(!response.ok)throw Error('Content request failed ('+response.status+')');
  const chapter=await response.json();
  validate(chapter);
  if(typeof BU3857_DATA==='undefined'||typeof BU_HQ_WORDS==='undefined'||typeof BU_GENESIS_IDS==='undefined'||typeof bu3857Open!=='function'||typeof buHQBind!=='function')
   throw Error('Existing Story Adventure engine is unavailable');
  // Critical: native engine owns wheel gestures, points, wallet, chapter save,
  // narration popup, Scripture modal, check/correct/wrong and finale. Do not
  // substitute a separate or fake game engine.
  if(!Object.isExtensible(BU3857_DATA)||!Object.isExtensible(BU_HQ_WORDS)||Object.isFrozen(BU_GENESIS_IDS))
   throw Error('Native Story data registration is locked');
  BU3857_DATA[BOOK]=chapter;
  Object.assign(BU_HQ_WORDS,chapter.words);
  if(!BU_GENESIS_IDS.includes(BOOK))BU_GENESIS_IDS.push(BOOK);

  // Episode 12 inherits Episode 10/11's three *thinking* hints only.
  // The historic wheel binder derives letter aids from level >=3, so
  // override ONLY the preview chapter's derived display (not payment).
  if(!window.__buGenesis12WheelHintGuard){
   const nativeBind=buHQBind;
   buHQBind=function(...args){
    const outcome=nativeBind.apply(this,args);
    if(typeof bu3857State!=='undefined'&&bu3857State?.book===BOOK){
     const d=bu3857Current();
     if(d&&typeof buHQHintLetters!=='undefined'&&typeof buHQUpdate==='function'){
      buHQHintLetters[d.id]=0;
      buHQUpdate();
     }
    }
    return outcome;
   };
   window.__buGenesis12WheelHintGuard=true;
  }

  window.__buGenesis12Preview={chapterId:BOOK,discoveries:chapter.discoveries.length,integrated:true,access:'explicit-url-test-only',artwork:'not-integrated'};
  status('TEST ONLY · Genesis 12 preview · Not released · Artwork pending');
  // Start through the EXISTING engine. Do not alter book/Journey menu locks.
  setTimeout(()=>{
   try{
    bu3857Open(BOOK);
    if(typeof bu3857State==='undefined'||bu3857State?.book!==BOOK)throw Error('Native preview did not open');
   }catch(e){console.error('[Genesis12 preview] opening failed',e);status('Genesis 12 preview failed: '+e.message,true);}
  },60);
 }catch(err){
  console.error('[Genesis12 preview] registration failed',err);
  status('Genesis 12 preview unavailable: '+err.message,true);
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();

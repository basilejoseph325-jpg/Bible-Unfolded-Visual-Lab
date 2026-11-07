/* VISUAL LAB ONLY — Story Adventure post-question discovery scroll V1.
 * Approved existing Daily Discovery V3 scroll and wax; presentation-only.
 * Legacy Genesis/Exodus: #bu3864-modal-layer, only Next Discovery / Complete Chapter.
 * Later episodes: #bu3863-dialog-layer, only Next Discovery.
 * Other story modals (hints, story context, scripture, purchases) untouched.
 * Keep the original DOM buttons and their native onclick handlers intact. */
(()=>{'use strict';
  if(window.BU_STORY_DISCOVERY_SCROLL_V1)return;
  window.BU_STORY_DISCOVERY_SCROLL_V1=true;
  function enhance(layer){
    if(!layer||layer.nodeType!==1||layer.dataset.buStoryDiscoveryV1)return;
    const legacy=layer.id==='bu3864-modal-layer';
    const modern=layer.id==='bu3863-dialog-layer';
    if(!legacy&&!modern)return;
    const card=layer.querySelector(legacy?':scope > .bu3864-modal':':scope > .bu3863-dialog');
    if(!card)return;
    const title=card.querySelector('h2');
    const body=card.querySelector(legacy?'.bu3864-modal-body':'.bu3863-dialog-body');
    const next=card.querySelector(legacy?'.bu3864-modal-actions > .gold-button':'.bu3863-dialog-done');
    const close=card.querySelector(legacy?'.bu3864-modal-close':'.bu3863-close');
    if(!title||!body||!next||!close)return;
    const label=(next.textContent||'').trim();
    // Post-answer only; no general info, previews, paid hints or research.
    if(!/^(?:Next Discovery|Complete Chapter)\b/i.test(label))return;
    // The approved wax seal has its own embossed arrow.
    if(!next.dataset.buStoryWaxV1){
      next.textContent=label.replace(/\s*[→›➜]\s*$/u,'').trim();
      next.dataset.buStoryWaxV1='1';
    }
    layer.classList.add('bu-story-discovery-scroll');
    layer.dataset.buStoryDiscoveryV1='1';
  }
  function inspect(node){
    if(node.nodeType!==1)return;
    if(node.matches?.('#bu3864-modal-layer,#bu3863-dialog-layer'))enhance(node);
    node.querySelectorAll?.('#bu3864-modal-layer,#bu3863-dialog-layer').forEach(enhance);
  }
  function boot(){
    if(!document.body)return;
    const observer=new MutationObserver(records=>{
      for(const record of records){
        for(const node of record.addedNodes)inspect(node);
      }
    });
    observer.observe(document.body,{childList:true,subtree:true});
    inspect(document.body);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
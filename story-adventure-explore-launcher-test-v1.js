/* TEST ONLY — a native-looking route to the separate, playable Story Explorer.
 * Never intercept the original Story Adventure mode or change its saves,
 * navigation, unlocks, chapter wheel or wallet. No overlay is created. */
(function(){
'use strict';
if(window.BUStoryExplorerLaunchV1)return;
window.BUStoryExplorerLaunchV1=true;
function install(){
 if(document.getElementById('bu-story-explorer-entry'))return true;
 var stops=document.getElementById('journey-stops');
 if(!stops||!stops.parentElement)return false;
 if(!document.getElementById('bu-story-explorer-entry-style')){
  var style=document.createElement('style');
  style.id='bu-story-explorer-entry-style';
  style.textContent=
   '#bu-story-explorer-entry{display:block;box-sizing:border-box;margin:8px 0 12px;padding:0;border:1px solid #efd397;border-radius:16px;overflow:hidden;background:#113340;box-shadow:0 5px 15px #0005}'+
   '#bu-story-explorer-entry a{display:flex;align-items:center;min-height:98px;gap:12px;padding:13px;text-decoration:none;color:#fff0d1;background:linear-gradient(90deg,#0c2737e8 1%,#123945aa 100%),url("bible-book-art/16_nehemiah.webp") center/cover no-repeat}'+
   '#bu-story-explorer-entry .bu-explore-copy{flex:1;min-width:0}'+
   '#bu-story-explorer-entry .bu-explore-label{display:block;color:#ffd791;font:900 10px/1.4 system-ui,sans-serif;letter-spacing:.12em}'+
   '#bu-story-explorer-entry .bu-explore-name{display:block;color:#fff0c6;font:700 22px/1.2 Georgia,serif;margin:3px 0;text-shadow:0 2px 4px #000}'+
   '#bu-story-explorer-entry .bu-explore-desc{display:block;color:#f7eccc;font:700 11px/1.3 system-ui,sans-serif}'+
   '#bu-story-explorer-entry .bu-explore-go{flex:0 0 auto;background:linear-gradient(#ffe5a5,#b48849);color:#1b3035;padding:10px 12px;border-radius:10px;font:900 11px/1.1 system-ui,sans-serif;box-shadow:0 2px 6px #0006}'+
   '#bu-story-explorer-entry a:focus-visible{outline:3px solid #ffedb9;outline-offset:-3px}'+
   '@media(max-width:340px){#bu-story-explorer-entry .bu-explore-name{font-size:18px}#bu-story-explorer-entry .bu-explore-go{padding:8px;font-size:10px}}';
  document.head.append(style);
 }
 var card=document.createElement('section');
 card.id='bu-story-explorer-entry';
 card.setAttribute('aria-label','New playable Story Adventure chapter');
 var a=document.createElement('a');
 a.href='experiments/story-adventure-nehemiah-explore-v1.html';
 var words=document.createElement('span');words.className='bu-explore-copy';
 var kicker=document.createElement('span');kicker.className='bu-explore-label';kicker.textContent='NEW · PLAYABLE STORY EXPLORER';
 var title=document.createElement('strong');title.className='bu-explore-name';title.textContent='The Wall Will Stand';
 var desc=document.createElement('span');desc.className='bu-explore-desc';desc.textContent='Explore Nehemiah’s Jerusalem · 3 scenes · meaningful choices';
 words.append(kicker,title,desc);
 var go=document.createElement('span');go.className='bu-explore-go';go.textContent='PLAY ›';
 a.append(words,go);card.append(a);
 stops.parentElement.insertBefore(card,stops);
 return true;
}
function boot(){
 if(install())return;
 var tries=0;
 var observer=new MutationObserver(function(){
  if(install()||++tries>70)observer.disconnect();
 });
 observer.observe(document.body,{childList:true,subtree:true});
 setTimeout(function(){observer.disconnect();},15000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
})();
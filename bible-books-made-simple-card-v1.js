/* Bible Unfolded — independent Bible Books homepage card.
   Additive only: preserves the existing Story Adventure and all wallet/save state. */
(()=>{'use strict';
if(document.getElementById('bu-books-simple-card-script-ready'))return;
const marker=document.createElement('meta');marker.id='bu-books-simple-card-script-ready';document.head.appendChild(marker);
const scriptBase=new URL('.',document.currentScript?.src||document.baseURI);
const destination=new URL('bible-book-guides/index.html',scriptBase).href;
const art=new URL('bible-book-art/01_genesis.webp',scriptBase).href;
function ensureStyle(){
 if(document.getElementById('bu-books-simple-card-style'))return;
 const style=document.createElement('style');style.id='bu-books-simple-card-style';
 style.textContent=[
  '#home #home-books-simple.cinematic-card{text-decoration:none!important;color:inherit!important;cursor:pointer;text-align:left;box-sizing:border-box}',
  '#home #home-books-simple .cinematic-poster{background-image:linear-gradient(180deg,rgba(2,21,28,.03),rgba(2,21,28,.22)),url("'+art+'")!important;background-size:cover!important;background-position:center 46%!important}',
  '#home #home-books-simple .cinematic-card-cta{display:flex;align-items:center;justify-content:center}',
  '#home #home-books-simple:focus-visible{outline:3px solid #ffe3a2!important;outline-offset:3px!important}'
 ].join('\n');
 document.head.appendChild(style);
}
function install(){
 const home=document.getElementById('home');
 const story=home?.querySelector('#home-story');
 const holder=story?.parentElement;
 if(!holder||!holder.classList.contains('cinematic-cards'))return false;
 if(document.getElementById('home-books-simple'))return true;
 ensureStyle();
 const card=document.createElement('a');
 card.id='home-books-simple';card.className='cinematic-card';
 card.href=destination;
 card.setAttribute('aria-label','Open Bible Books Made Simple reading guides');
 card.innerHTML='<span class="cinematic-poster bu-books-simple-poster" aria-hidden="true"><span class="poster-symbol">▤</span></span>'+
  '<span class="cinematic-card-body"><span class="cinematic-card-title">Bible Books Made Simple</span>'+
  '<span class="cinematic-card-desc">Discover the people, events, and promises in every Bible book—one part at a time.</span>'+
  '<span class="cinematic-card-cta">EXPLORE THE BOOKS <span aria-hidden="true">›</span></span></span>';
 story.insertAdjacentElement('afterend',card);
 return true;
}
function start(){
 if(install())return;
 const watcher=new MutationObserver(()=>{if(install())watcher.disconnect()});
 watcher.observe(document.body,{childList:true,subtree:true});
 setTimeout(()=>watcher.disconnect(),15000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
})();
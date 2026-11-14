/* TEST only — the Bible Books home card opens a completely separate full-page
   shelf, never the legacy Story Adventure screen.
   Existing Story Adventure remains reachable by intentional native bypass. */
(()=>{'use strict';
const PATH='bible-book-guides/index.html';
let allowNative=false;
window.addEventListener('click',event=>{
 if(allowNative)return;
 const target=event.target?.closest?.('#home-books');
 if(!target)return;
 event.preventDefault();
 event.stopPropagation();
 event.stopImmediatePropagation();
 window.location.assign(PATH);
},true);
const url=new URL(location.href);
if(url.searchParams.get('bu_native_story')!=='1')return;
url.searchParams.delete('bu_native_story');
history.replaceState(history.state,'',url.pathname+url.search+url.hash);
let tries=0;
function openOriginal(){
 const button=document.getElementById('home-books');
 if(!button){if(++tries<40)setTimeout(openOriginal,250);return}
 allowNative=true;
 try{button.click()}finally{allowNative=false}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(openOriginal,350),{once:true});
else setTimeout(openOriginal,350);
})();
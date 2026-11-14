/* Bible Books Reader V1: switch Genesis card ONLY to its standalone story guide.
 * Installed exclusively by Visual Lab's TEST banner script.
 * Other 65 book cards and Story Adventure remain unchanged during Genesis pilot. */
(()=>{'use strict';
if(location.pathname.includes('/experiments/')||location.pathname.endsWith('/bible-books-guide-v1.html'))return;
document.addEventListener('click',e=>{
 const element=e.target;
 if(!element||typeof element.closest!=='function')return;
 const card=element.closest('#levels #hebrew-books .book-tile');
 if(!card)return;
 const first=document.querySelector('#levels #hebrew-books .book-tile');
 if(card!==first)return;
 e.preventDefault();e.stopImmediatePropagation();
 window.location.assign('bible-books-guide-v1.html?book=genesis');
},true);
})();
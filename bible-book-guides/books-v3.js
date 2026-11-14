/* Bible Unfolded TEST: standalone 66-book shelf and page-based reader.
   NO overlays, shared-game writes or reliance on Story Adventure screens. */
(()=>{'use strict';
const names='Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|1 Samuel|2 Samuel|1 Kings|2 Kings|1 Chronicles|2 Chronicles|Ezra|Nehemiah|Esther|Job|Psalms|Proverbs|Ecclesiastes|Song of Solomon|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|1 Corinthians|2 Corinthians|Galatians|Ephesians|Philippians|Colossians|1 Thessalonians|2 Thessalonians|1 Timothy|2 Timothy|Titus|Philemon|Hebrews|James|1 Peter|2 Peter|1 John|2 John|3 John|Jude|Revelation'.split('|');
const books=names.map((name,i)=>({name,i,slug:name.toLowerCase().replaceAll(' ','_'),image:String(i+1).padStart(2,'0')+'_'+name.toLowerCase().replaceAll(' ','_')+'.webp'}));
const $=id=>document.getElementById(id);
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
function savedPart(){try{const v=Number(localStorage.getItem('buGuideLast:0'));return Number.isInteger(v)&&v>=0&&v<23?v:0}catch(_){return 0}}
function isFinished(){try{return localStorage.getItem('buGuideFinished:0')==='1'}catch(_){return false}}
function image(book){return '../bible-book-art/'+book.image}
function showLibrary(){
 if(!$('hebrew-books')||!$('greek-books'))return;
 books.forEach(book=>{
   const link=el('a','book-card'+(book.i===0?' ready':''));link.href='read.html?book='+book.slug;
   link.style.setProperty('--book-art','url("'+image(book)+'")');
   link.setAttribute('aria-label',book.name+(book.i===0?' — Read the book guide':' — Guide coming soon'));
   const num=el('span','book-number',String(book.i+1));
   const title=el('span','book-name',book.name);
   const desc=book.i===0?(isFinished()?'Finished · Read again':savedPart()>0?'Continue · Part '+(savedPart()+1)+' of 23':'Read guide · 23 parts'):'Guide coming soon';
   link.append(num,title,el('span','book-hint',desc));
   (book.i<39?$('hebrew-books'):$('greek-books')).append(link);
 });
}
async function showReader(){
 const param=new URLSearchParams(location.search).get('book')||'genesis';
 const book=books.find(b=>b.slug===param)||books[0];
 $('book-header').textContent=book.name;$('book-name').textContent=book.name;
 $('book-number').textContent='BOOK '+(book.i+1)+' OF 66';
 $('book-hero').style.setProperty('--read-art','url("'+image(book)+'")');
 document.title=book.name+' | Bible Unfolded TEST';
 const official='https://www.jw.org/en/library/bible/nwt/books/'+book.slug.replaceAll('_','-')+'/1/';
 $('passage-link').href=official;
 if(book.i!==0){
   $('book-subtitle').textContent='Another Bible book to discover';
   $('part-title').textContent='The '+book.name+' guide is being written';
   $('part-body').replaceChildren(el('p','',"We're building this book's guide carefully, so the important events and teachings won't be missed."),el('p','',"You can read the complete Bible book on JW.org while its simplified guide is being prepared."));
   $('passage-link').textContent='Read '+book.name+' on JW.org ↗';return;
 }
 let d;
 try{
   const r=await fetch('genesis-draft.json?v=20261114-page-v3',{cache:'no-store'});
   if(!r.ok)throw Error('Content unavailable');
   d=await r.json();
   if(d.sections?.length!==23)throw Error('Missing guide sections');
   let next=1;for(const s of d.sections){if(s.startChapter!==next||s.endChapter<s.startChapter)throw Error('Out-of-order chapters');next=s.endChapter+1;}
   if(next!==51)throw Error('Incomplete Genesis');
 }catch(error){
   console.warn('Bible Books content:',error);
   $('part-title').textContent="Genesis couldn't open";
   $('part-body').replaceChildren(el('p','',"The guide wasn't available. Return to Books and try again."));
   $('passage-link').textContent='Read Genesis in the Bible on JW.org ↗';return;
 }
 const sections=d.sections,picker=$('chapter-picker');
 const range=s=>'Genesis '+s.startChapter+(s.endChapter>s.startChapter?'–'+s.endChapter:'');
 sections.forEach((s,i)=>{const option=el('option','',(i+1)+'. '+s.title+' ('+range(s)+')');option.value=String(i);picker.append(option)});
 let index=savedPart(),finished=isFinished();
 function save(){try{localStorage.setItem('buGuideLast:0',String(index));localStorage.setItem('buGuideFinished:0',finished?'1':'0')}catch(_){}}
 function render(){
   const s=sections[index];
   $('reading-count').textContent='PART '+(index+1)+' OF '+sections.length;
   $('reading-range').textContent=range(s).toUpperCase();
   $('progress-fill').style.width=(100*(index+1)/sections.length)+'%';
   const bar=$('progress-fill').parentElement;bar.setAttribute('aria-valuemax',String(sections.length));bar.setAttribute('aria-valuenow',String(index+1));
   picker.value=String(index);
   $('part-title').textContent=s.title;
   $('part-body').replaceChildren(...(s.paragraphs||[s.text]).map(p=>el('p','',p)));
   $('part-thought').textContent=s.takeaway||'';
   $('thought-box').hidden=!s.takeaway;
   $('passage-link').href=s.readUrl;
   $('passage-link').textContent='Read '+range(s)+' in the New World Translation ↗';
   $('prev-part').disabled=index===0;
   $('next-part').disabled=index===sections.length-1&&finished;
   $('next-part').textContent=index===sections.length-1?(finished?'Finished ✓':'Finish Genesis ✓'):'Next Part ›';
   $('completion').hidden=!finished;
   save();
 }
 const jump=i=>{index=Math.max(0,Math.min(sections.length-1,i));render();window.scrollTo({top:0,behavior:'auto'})};
 $('prev-part').addEventListener('click',()=>jump(index-1));
 $('next-part').addEventListener('click',()=>{
   if(index===sections.length-1){finished=true;render();$('completion').scrollIntoView({block:'nearest',behavior:'smooth'})}
   else jump(index+1);
 });
 picker.addEventListener('change',()=>jump(Number(picker.value)));
 $('reset-reading').addEventListener('click',()=>{if(!confirm('Start Genesis again from Part 1?'))return;finished=false;jump(0)});
 $('reader-controls').hidden=false;$('reading-actions').hidden=false;$('page-navigation').hidden=false;render();
}
if(document.body.dataset.view==='library')showLibrary();
if(document.body.dataset.view==='reader')showReader();
})();
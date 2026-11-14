/* Bible Unfolded: standalone, no-overlay Bible Books reading library.
   Supports Genesis, Exodus, Leviticus and Numbers in independent storage slots.
   No native game handlers, wallet, scores, audio, or Story Adventure writes. */
(()=>{'use strict';
const names='Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|1 Samuel|2 Samuel|1 Kings|2 Kings|1 Chronicles|2 Chronicles|Ezra|Nehemiah|Esther|Job|Psalms|Proverbs|Ecclesiastes|Song of Solomon|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|1 Corinthians|2 Corinthians|Galatians|Ephesians|Philippians|Colossians|1 Thessalonians|2 Thessalonians|1 Timothy|2 Timothy|Titus|Philemon|Hebrews|James|1 Peter|2 Peter|1 John|2 John|3 John|Jude|Revelation'.split('|');
const books=names.map((name,i)=>({name,i,slug:name.toLowerCase().replaceAll(' ','_'),image:String(i+1).padStart(2,'0')+'_'+name.toLowerCase().replaceAll(' ','_')+'.webp'}));
const guides={
  genesis:{file:'genesis-draft.json',parts:23,chapters:50,subtitle:'From creation to Joseph in Egypt'},
  exodus:{file:'exodus-draft.json',parts:30,chapters:40,subtitle:"From slavery in Egypt to Jehovah's presence in the wilderness"},
  leviticus:{file:'leviticus-draft.json',parts:27,chapters:27,subtitle:"How a freed nation learned to worship Jehovah and care for people"},
  numbers:{file:'numbers-draft.json',parts:36,chapters:36,subtitle:"A nation on the move, a new generation, and the road to the Promised Land"}
};
const $=id=>document.getElementById(id);
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
const image=book=>'../bible-book-art/'+book.image;
const saveKey=(book,kind)=>'buGuide'+kind+':'+book.i;
function savedPart(book){
 try{const n=Number(localStorage.getItem(saveKey(book,'Last')));const max=guides[book.slug]?.parts||0;return Number.isInteger(n)&&n>=0&&n<max?n:0}catch(_){return 0}
}
function isFinished(book){try{return localStorage.getItem(saveKey(book,'Finished'))==='1'}catch(_){return false}}
function showLibrary(){
 const hebrew=$('hebrew-books'),greek=$('greek-books');if(!hebrew||!greek)return;
 books.forEach(book=>{
   const guide=guides[book.slug];
   const link=el('a','book-card'+(guide?' ready':''));
   link.href='read.html?book='+encodeURIComponent(book.slug);
   link.style.setProperty('--book-art','url("'+image(book)+'")');
   link.setAttribute('aria-label',book.name+(guide?' — Read the complete simplified guide':' — Guide being written'));
   const desc=!guide?'Guide coming soon':isFinished(book)?'Finished · Read again':savedPart(book)>0?'Continue · Part '+(savedPart(book)+1)+' of '+guide.parts:'Read guide · '+guide.parts+' parts';
   link.append(el('span','book-number',String(book.i+1)),el('span','book-name',book.name),el('span','book-hint',desc));
   (book.i<39?hebrew:greek).append(link);
 });
}
async function showReader(){
 const param=new URLSearchParams(location.search).get('book')||'genesis';
 const book=books.find(b=>b.slug===param)||books[0];
 const guide=guides[book.slug];
 $('book-header').textContent=book.name;
 $('book-name').textContent=book.name;
 $('book-number').textContent='BOOK '+(book.i+1)+' OF 66';
 $('book-hero').style.setProperty('--read-art','url("'+image(book)+'")');
 $('book-subtitle').textContent=guide?.subtitle||'Another Bible book to discover';
 document.title=book.name+' | Bible Unfolded TEST';
 const official='https://www.jw.org/en/library/bible/nwt/books/'+book.slug.replaceAll('_','-')+'/1/';
 $('passage-link').href=official;
 if(!guide){
   $('part-title').textContent='The '+book.name+' guide is being written';
   $('part-body').replaceChildren(
    el('p','',"We're building this book's guide carefully so the important events, people, and lessons won't be missed."),
    el('p','',"You can read the complete Bible book on JW.org while its simplified guide is being prepared."));
   $('passage-link').textContent='Read '+book.name+' on JW.org ↗';return;
 }
 let data;
 try{
   const response=await fetch(guide.file+'?v=20261114-numbers-36parts-v1',{cache:'no-store'});
   if(!response.ok)throw Error('Reading guide unavailable');
   data=await response.json();
   if(data.book!==book.name||data.chapterCount!==guide.chapters||data.sections?.length!==guide.parts)throw Error('Guide metadata incomplete');
   let next=1;
   for(const s of data.sections){
     if(s.startChapter!==next||s.endChapter<s.startChapter||s.paragraphs?.length<2||!s.takeaway||
        !s.readUrl?.startsWith('https://www.jw.org/en/library/bible/'))throw Error('Guide section failed validation');
     next=s.endChapter+1;
   }
   if(next!==guide.chapters+1)throw Error('Incomplete chapter coverage');
 }catch(error){
   console.warn('Bible Books reader content:',error);
   $('part-title').textContent=book.name+" couldn't open";
   $('part-body').replaceChildren(el('p','',"The reading guide isn't available right now. Return to Books and try again."));
   $('passage-link').textContent='Read '+book.name+' in the Bible on JW.org ↗';return;
 }
 const sections=data.sections,picker=$('chapter-picker');
 const range=s=>book.name+' '+s.startChapter+(s.endChapter>s.startChapter?'–'+s.endChapter:'');
 sections.forEach((s,i)=>{
   const option=el('option','',(i+1)+'. '+s.title+' ('+range(s)+')');
   option.value=String(i);picker.append(option);
 });
 let index=savedPart(book),finished=isFinished(book);
 const save=()=>{try{
   localStorage.setItem(saveKey(book,'Last'),String(index));
   localStorage.setItem(saveKey(book,'Finished'),finished?'1':'0');
 }catch(_){}};
 function render(){
   const s=sections[index];
   $('reading-count').textContent='PART '+(index+1)+' OF '+sections.length;
   $('reading-range').textContent=range(s).toUpperCase();
   $('progress-fill').style.width=(100*(index+1)/sections.length)+'%';
   const bar=$('progress-fill').parentElement;
   bar.setAttribute('aria-valuemax',String(sections.length));
   bar.setAttribute('aria-valuenow',String(index+1));
   bar.setAttribute('aria-label',book.name+' reading position');
   picker.value=String(index);
   $('part-title').textContent=s.title;
   $('part-body').replaceChildren(...s.paragraphs.map(p=>el('p','',p)));
   $('part-thought').textContent=s.takeaway;
   $('thought-box').hidden=!s.takeaway;
   $('passage-link').href=s.readUrl;
   $('passage-link').textContent='Read '+range(s)+' in the New World Translation ↗';
   $('prev-part').disabled=index===0;
   $('next-part').disabled=index===sections.length-1&&finished;
   $('next-part').textContent=index===sections.length-1?(finished?'Finished ✓':'Finish '+book.name+' ✓'):'Next Part ›';
   $('completion').hidden=!finished;
   if(finished){
     $('completion').querySelector('h2').textContent="You finished "+book.name+"! ✨";
     $('completion').querySelector('p').textContent=book.slug==='numbers'?
      "You've followed Israel from Sinai, through the wilderness, to the edge of the Promised Land. Deuteronomy continues with Moses' final messages.":
      book.slug==='leviticus'?
      "You've discovered why Israel's sacrifices, priesthood, cleanness laws, festivals, and Jubilee mattered. Numbers continues the journey in the wilderness.":
      book.slug==='exodus'?
      "From slavery in Egypt to the tabernacle filled with Jehovah's glory—you've followed the whole story. Leviticus continues Israel's journey.":
      "From Eden to Joseph in Egypt, you've followed the whole story. Exodus picks up where Genesis leaves off.";
   }
   $('reset-reading').textContent='↺ Start '+book.name+' over';
   save();
 }
 const jump=i=>{index=Math.max(0,Math.min(sections.length-1,i));render();window.scrollTo({top:0,behavior:'auto'})};
 $('prev-part').addEventListener('click',()=>jump(index-1));
 $('next-part').addEventListener('click',()=>{
   if(index===sections.length-1){finished=true;render();$('completion').scrollIntoView({block:'nearest',behavior:'smooth'})}
   else jump(index+1);
 });
 picker.addEventListener('change',()=>jump(Number(picker.value)));
 $('reset-reading').addEventListener('click',()=>{
   if(!confirm('Start '+book.name+' again from Part 1?'))return;
   finished=false;jump(0);
 });
 $('reader-controls').hidden=false;
 $('reading-actions').hidden=false;
 $('page-navigation').hidden=false;
 render();
}
if(document.body.dataset.view==='library')showLibrary();
if(document.body.dataset.view==='reader')showReader();
})();
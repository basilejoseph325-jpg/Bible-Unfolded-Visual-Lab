#!/usr/bin/env python3
"""TEST-only native Levels menu routing. Safe guarded edit of 11MB index.html."""
from pathlib import Path
import re

path=Path("index.html")
old=path.read_text(encoding="utf-8")
old_tag='<script id="bu-books-direct-entry-v4">'
new_tag='<script id="bu-books-direct-entry-v5">'
if new_tag in old:
    print("Bible Books Levels route v5 already installed")
    raise SystemExit(0)
if old.count(old_tag)!=1 or old.count('<!doctype html>')!=1 or len(old)<7_000_000:
    raise SystemExit("Unexpected TEST native index; aborting rather than editing")
if old.index(old_tag)>old.index("<style>"):
    raise SystemExit("Previous Books handler not in early head")
pattern=re.compile(r'<script id="bu-books-direct-entry-v4">.*?</script>',re.S)
if len(pattern.findall(old))!=1:
    raise SystemExit("Expected exactly one original Books handler")
replacement=r'''<script id="bu-books-direct-entry-v5">
/* TEST: capture actual menu entry "Levels / Browse Bible books" before
   Story Adventure handles the click. The book reader is a separate page.
   Native adventure remains available with bu_native_story=1. */
(()=>{'use strict';
const SHELF='bible-book-guides/index.html';
let nativeOnce=new URLSearchParams(location.search).get('bu_native_story')==='1';
function levelsMenuItem(target){
 if(target.closest('#levels'))return false;
 const element=target.closest(
  '#menu-levels,#menu-levels-btn,#bu-menu-levels,'+
  '[data-action="levels"],[data-screen="levels"],[data-target="levels"],'+
  '[data-route="levels"],[data-page="levels"],[aria-controls="levels"]');
 if(element&&!element.closest('#levels'))return true;
 for(let p=target,n=0;p&&n<7;p=p.parentElement,n++){
  const s=String(p.textContent||'').replace(/\s+/g,' ').trim();
  if(s.length&&s.length<180&&/\bLevels\b/i.test(s)&&
     /\bBrowse Bible books\b/i.test(s))return true;
 }
 return false;
}
window.addEventListener('click',event=>{
 const target=event.target;
 if(!target?.closest)return;
 const home=target.closest('#home-books');
 const levels=!home && levelsMenuItem(target);
 if(!home&&!levels)return;
 if(home&&nativeOnce){nativeOnce=false;return;}
 event.preventDefault();
 event.stopImmediatePropagation();
 event.stopPropagation();
 window.location.assign(SHELF);
},true);
window.BUBibleBooksRouteV5=Object.freeze({installed:true});
})();
</script>'''
new,n=pattern.subn(lambda _:replacement,old,count=1)
if n!=1 or old_tag in new or new.count(new_tag)!=1:
    raise SystemExit("Unexpected replacement; no write")
assert new.index(new_tag)<new.index("<style>")
assert abs(len(new)-len(old))<3000
path.write_text(new,encoding="utf-8")
print("PASS: native Levels menu now opens separate Bible Books shelf")

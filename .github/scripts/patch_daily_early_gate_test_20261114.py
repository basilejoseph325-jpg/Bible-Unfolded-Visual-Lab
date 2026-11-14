#!/usr/bin/env python3
"""One-time TEST-only fix: install Daily click gate in the first HTML HEAD.
The 11MB index cannot safely be loaded/replaced through the contents editor.
Abort if its exact expected head structure has changed.
"""
from pathlib import Path

path = Path("index.html")
html = path.read_text(encoding="utf-8")
marker = '<script id="bu-books-direct-entry-v4">'
first_style = '<style>'
gate_id = 'bu-daily-early-gate-v1'

if gate_id in html:
    if html.index(gate_id) > html.find(first_style):
        raise SystemExit("Existing Daily gate is too late; refusing patch")
    print("Early Daily TEST gate already installed.")
    raise SystemExit(0)

if html.count(marker) != 1 or html.count('<!doctype html>') != 1:
    raise SystemExit("Unexpected TEST index head; refusing to edit")
if html.find(marker) < 0 or html.find(first_style) < 0:
    raise SystemExit("Required native head anchors missing")
if html.find(marker) > html.find(first_style):
    raise SystemExit("Books direct entry moved after styling: refusing edit")
if len(html) < 7_000_000:
    raise SystemExit("Unexpected native index size; refusing edit")

script = r'''<script id="bu-daily-early-gate-v1">
/* Bible Unfolded Visual Lab only: earliest native-head click interception.
   Prevent the legacy 5-question Daily quiz opening during slow JS/cached loads.
   A fast tap opens the NEW 60-discovery illustrated reader exactly once when ready.
   Does not change LIVE, saves, reward points, or any other mode. */
(()=>{'use strict';
if(!location.pathname.startsWith('/Bible-Unfolded-Visual-Lab/') &&
 !['127.0.0.1','localhost'].includes(location.hostname))return;
let queued=false,timer=0,attempts=0;
const card=()=>document.getElementById('bu375-home-cta');
const ready=()=>window.BUDailyInsightV1?.libraryCount?.()===60 &&
 typeof window.BUDailyInsightV1.open==='function';
function feedback(message){
 const el=document.getElementById('bu375-home-status');
 if(el)el.textContent=message;
}
function reset(){
 if(timer){clearInterval(timer);timer=0;}
 queued=false;attempts=0;
 card()?.removeAttribute('aria-busy');
}
function finish(){
 if(!queued)return false;
 const button=card();
 // The user changed modes while loading; never navigate unexpectedly later.
 if(!button||!button.getClientRects().length){reset();return true;}
 if(!ready())return false;
 reset();
 const ok=window.BUDailyInsightV1.open();
 if(ok===false)feedback('Could not open Daily Discovery. Please try again.');
 return true;
}
window.addEventListener('click',event=>{
 if(!event.target?.closest?.('#bu375-home-cta'))return;
 // This listener is attached in the original HTML head, before legacy scripts.
 event.preventDefault();
 event.stopImmediatePropagation();
 event.stopPropagation();
 if(queued)return;
 queued=true;
 if(finish())return;
 card()?.setAttribute('aria-busy','true');
 feedback('Opening your Daily Discovery…');
 timer=setInterval(()=>{
  if(finish())return;
  if(++attempts>=450){
   reset();
   feedback('Daily Discovery could not load. Refresh to try again.');
  }
 },100);
},true);
window.BUDailyEarlyGateV1=Object.freeze({installed:true,queued:()=>queued,ready});
})();
</script>
'''

html = html.replace(first_style, script + first_style, 1)
assert html.index(gate_id) < html.index(first_style)
assert len(html) - len(path.read_text(encoding="utf-8")) < 3100
assert 'bu-books-direct-entry-v4' in html
path.write_text(html, encoding="utf-8")
print("PASS: native head now protects Daily before legacy handlers can load")

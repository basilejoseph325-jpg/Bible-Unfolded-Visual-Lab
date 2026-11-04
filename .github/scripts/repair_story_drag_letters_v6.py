#!/usr/bin/env python3
"""One-time Visual Lab source fix: Story swish on each newly crossed letter.
Never change original/live repo. Hard-fail if exact V5 engine differs."""
from pathlib import Path
import re, json, subprocess

path=Path("bible_unfolded_core_part5.js")
source=path.read_text(encoding="utf-8")
m=re.search(r'(window\.__BU_STAGE41_CORE_PARTS__\[\d+\]\s*=\s*)("(?:\\.|[^"\\])*")',source,re.S)
if not m: raise RuntimeError("Could not locate encoded Stage41 engine")
engine=json.loads(m.group(2))

old="""  gesture=kind?{id:e.pointerId,kind,x:e.clientX,y:e.clientY,moved:false}:null;"""
new="""  gesture=kind?{id:e.pointerId,kind,x:e.clientX,y:e.clientY,moved:false,lastLetter:kind==='letter'?(e.target?.closest?.('#buhq-wheel [data-buhq],#play #wheel .tile')||null):null}:null;"""
if engine.count(old)!=1: raise RuntimeError("Unexpected Story pointerdown source; not modifying")
engine=engine.replace(old,new,1)

old="""  const g=gesture;if(!g||e.pointerId!==g.id||g.moved)return;
  if(Math.hypot(e.clientX-g.x,e.clientY-g.y)>11){
   g.moved=true;
   if(g.kind==='letter'){
    const v=(typeof sfxVolume==='number'?sfxVolume/100:.65);
    window.BUPremiumSFX?.play?.('swish',Math.min(.24,Math.max(0,v)*.34));
    stats.swipes++;
   }
  }"""
new="""  const g=gesture;if(!g||e.pointerId!==g.id)return;
  if(!g.moved&&Math.hypot(e.clientX-g.x,e.clientY-g.y)>11)g.moved=true;
  if(g.kind!=='letter'||!g.moved)return;
  // A swipe is a sequence of letters, not a one-time drag-start event.
  // Use the letter currently under the finger; pointer capture may keep
  // e.target fixed on the starting tile throughout the gesture.
  const under=document.elementFromPoint(e.clientX,e.clientY);
  const letter=under?.closest?.('#buhq-wheel [data-buhq],#play #wheel .tile');
  if(!letter||letter===g.lastLetter)return;
  g.lastLetter=letter;
  const v=(typeof sfxVolume==='number'?sfxVolume/100:.65);
  window.BUPremiumSFX?.play?.('swish',Math.min(.24,Math.max(0,v)*.34));
  stats.swipes++;"""
if engine.count(old)!=1: raise RuntimeError("Unexpected Story pointermove source; not modifying")
engine=engine.replace(old,new,1)
if "Old knock retired, no audio sample" not in engine: raise RuntimeError("Knock deletion guard missing")
path.write_text(source[:m.start(2)]+json.dumps(engine,ensure_ascii=True)+source[m.end(2):],encoding="utf-8")

sfxpath=Path("premium-sfx.js")
sfx=sfxpath.read_text(encoding="utf-8")
needle="const now=Date.now(),threshold=type==='swish'?110:type==='tap'?22:36;"
replacement="const now=Date.now(),threshold=type==='swish'?35:type==='tap'?22:36;"
if sfx.count(needle)!=1: raise RuntimeError("Unexpected shared swish throttle; not modifying")
if "story-audible-soft-tap-v6" not in sfx: raise RuntimeError("Audible tap V6 missing; not modifying")
sfxpath.write_text(sfx.replace(needle,replacement,1),encoding="utf-8")

# Make sure encoded JS remains a valid JS string and has no accidentally malformed structure.
subprocess.run(["node","--check",str(path)],check=True)
subprocess.run(["node","--check",str(sfxpath)],check=True)
print("Story drag-letter cue source patched and both JS files syntax checked")

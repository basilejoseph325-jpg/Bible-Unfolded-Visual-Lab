#!/usr/bin/env python3
"""One-time Visual Lab source repair. No live-game changes; hard-fail if source differs."""
from pathlib import Path
import json, re, subprocess, tempfile

def once(text, old, new, label):
    n = text.count(old)
    if n != 1:
        raise RuntimeError(f"{label}: expected one occurrence; found {n}")
    return text.replace(old, new, 1)

def change_core(path, transform):
    file = Path(path)
    source = file.read_text(encoding="utf-8")
    match = re.search(r'(window\.__BU_STAGE41_CORE_PARTS__\[\d+\]\s*=\s*)("(?:\\.|[^"\\])*")',source,re.S)
    if not match:
        raise RuntimeError(f"Cannot locate JSON-encoded Stage41 engine: {path}")
    code = json.loads(match.group(2))
    updated = transform(code)
    if updated == code:
        raise RuntimeError(f"No source change: {path}")
    file.write_text(source[:match.start(2)] + json.dumps(updated, ensure_ascii=True) + source[match.end(2):],encoding="utf-8")

def update_part3(s):
    return once(s,
        "try{tick();if(buHQPointer!==null&&buHQPath.length>1)swish()}catch(_){}",
        "/* Story word selection has no independent SFX; one dispatcher owns tap/swipe. */",
        "new Story wheel duplicate noises")

gesture = r"""
/* Story Adventure V5: one source-level owner of gestures and entry taps.
 * Stationary letter pointerup: soft velvety tap. Moved letter gesture:
 * one approved shortened swish, never a per-letter knock or tap.
 * Episode and replay entry: one gentle contact, no knock. */
(function buStoryInputSoundsV5(){
 let gesture=null;
 const stats={letterTaps:0,swipes:0,entryTaps:0};
 const kindOf=raw=>{
  const el=raw?.nodeType===1?raw:raw?.parentElement;
  if(!el?.closest)return null;
  if(el.closest('#buhq-wheel [data-buhq],#play #wheel .tile'))return 'letter';
  if(el.closest('#episode-list [data-episode],#episodes .episode-card,#bu3857-replay,#bu3857-next-episode'))return 'entry';
  return null;
 };
 const tap=kind=>{
  window.BUPremiumSFX?.softTap?.(kind==='entry'?'level':'letter');
  if(kind==='entry')stats.entryTaps++;else stats.letterTaps++;
 };
 window.addEventListener('pointerdown',e=>{
  if(e.isPrimary===false)return;
  const kind=kindOf(e.target);
  gesture=kind?{id:e.pointerId,kind,x:e.clientX,y:e.clientY,moved:false}:null;
 },true);
 window.addEventListener('pointermove',e=>{
  const g=gesture;if(!g||e.pointerId!==g.id||g.moved)return;
  if(Math.hypot(e.clientX-g.x,e.clientY-g.y)>11){
   g.moved=true;
   if(g.kind==='letter'){
    const v=(typeof sfxVolume==='number'?sfxVolume/100:.65);
    window.BUPremiumSFX?.play?.('swish',Math.min(.24,Math.max(0,v)*.34));
    stats.swipes++;
   }
  }
 },true);
 window.addEventListener('pointerup',e=>{
  const g=gesture;if(!g||e.pointerId!==g.id)return;
  gesture=null;
  if(!g.moved&&Math.hypot(e.clientX-g.x,e.clientY-g.y)<=11)tap(g.kind);
 },true);
 window.addEventListener('pointercancel',e=>{if(gesture?.id===e.pointerId)gesture=null;},true);
 window.addEventListener('click',e=>{if(e.detail===0){const kind=kindOf(e.target);if(kind)tap(kind);}},true);
 window.BUStoryAudioV5=Object.freeze({version:'story-source-v5',stats});
})();
"""

def update_part5(s):
    s=once(s,
        "selected.push(i);tick();if(fingerPointer!==null&&fingerMoved&&selected.length>1)swish();updateTrace();",
        "selected.push(i);updateTrace();",
        "classic Story wheel duplicate noises")
    s,n=re.subn(r"const FX_PCM=\{tap:'[^']*',","const FX_PCM={",s,count=1)
    if n!=1: raise RuntimeError("Original embedded knock PCM sample missing or changed")
    s=once(s,
        "function playFx(name,level){if(!context||!sfxOn||sfxVolume<=0)return;",
        "function playFx(name,level){if(name==='tap'){/* Old knock retired, no audio sample. Story gesture owns its own cue. */if(!['play','bu3857-screen','episodes'].some(id=>{const root=document.getElementById(id);return root&&!root.hidden&&root.getClientRects().length}))window.BUPremiumSFX?.softTap?.('letter');return;}if(!context||!sfxOn||sfxVolume<=0)return;",
        "native original playFx knock")
    s=once(s,
        "function swish(){playFx('swish',.055)}",
        "function swish(){playFx('swish',.055)}\n"+gesture,
        "single gesture owner")
    return s

change_core("bible_unfolded_core_part3.js",update_part3)
change_core("bible_unfolded_core_part5.js",update_part5)

sfx=Path("premium-sfx.js")
old=sfx.read_text(encoding="utf-8")
start=old.index("/* STORY GESTURE AUDIO GUARD V2")
trails_start=old.index("/* WORD TRAILS: one gentle swish per drag")
trails_end=old.index("/* Soft parchment contact ONLY")
if not (start < trails_start < trails_end):
    raise RuntimeError("Unexpected audio adapter layout")
head=old[:start]
head=once(head,
    "#episodes .episode-row,#episodes .episode-tile')",
    "#episodes .episode-row,#episodes .episode-tile,#episode-list [data-episode],#bu3857-replay,#bu3857-next-episode')",
    "Story entry selectors")
html_media=r"""
/* Shared premium adapter, without overlapping Story audio guards. */
HTMLMediaElement.prototype.play=function(){
 const u=this.src||'';
 if(!u.startsWith('data:audio/wav;base64,'))return nativePlay.apply(this,arguments);
 let type=id[u.length+'|'+u.slice(56,95)];
 if(lastClick?.storyLevel&&Date.now()-lastClick.at<650 &&
    type!=='storyCorrect'&&type!=='back'&&type!=='namePositive'&&type!=='nameWrong')
  return Promise.resolve();
 if(!type)return nativePlay.apply(this,arguments);
 if(lastClick?.answer&&Date.now()-lastClick.at<250 &&
    ['select','navigate','toggle'].includes(type))return Promise.resolve();
 if(type==='toggle'&&lastClick?.undo&&Date.now()-lastClick.at<180)type='undo';
 play(type,Number(this.volume));return Promise.resolve();
};
"""
trails=old[trails_start:trails_end]
new_sfx=head+html_media+trails+"""
/* Only exported soft-contact cue; source engine owns Story events. */
window.BUPremiumSFX=Object.freeze({play,softTap:softContact,version:'2026-11-04-story-source-audio-v5'});
})();
"""
sfx.write_text(new_sfx,encoding="utf-8")

loader=Path("journey-progress-caption.js")
contents=loader.read_text(encoding="utf-8")
contents=once(contents,
    "premium-sfx.js?v=20261104-native-tap-guard-v4",
    "premium-sfx.js?v=20261104-story-source-v5",
    "fresh adapter cache")
contents=re.sub(r"/\* TEST ONLY: isolate Story Adventure legacy knock during chapter entry and word-wheel swipe\. \*/\s*\(\(\)=>\{[^\n]*story-gesture-audio-guard\.js[^\n]*\}\)\(\);\s*","",contents)
if "story-gesture-audio-guard.js" in contents:
    raise RuntimeError("Obsolete layered Story guard still loaded")
loader.write_text(contents,encoding="utf-8")

# Verify transport wrapper, and syntax of the actual assembled 22 MB engine.
parts=[]
for number in range(1,6):
    source=Path(f"bible_unfolded_core_part{number}.js").read_text(encoding="utf-8")
    m=re.search(r'window\.__BU_STAGE41_CORE_PARTS__\[\d+\]\s*=\s*("(?:\\.|[^"\\])*")',source,re.S)
    if not m: raise RuntimeError(f"Cannot decode engine transport part {number}")
    parts.append(json.loads(m.group(1)))
with tempfile.NamedTemporaryFile(mode="w",suffix=".js",encoding="utf-8") as tmp:
    tmp.write("".join(parts))
    tmp.flush()
    subprocess.run(["node","--check",tmp.name],check=True)
for name in ("premium-sfx.js","journey-progress-caption.js","bible_unfolded_core_part3.js","bible_unfolded_core_part5.js"):
    subprocess.run(["node","--check",name],check=True)
assert "const FX_PCM={tap:" not in parts[4]
assert "story-gesture-audio-guard.js" not in contents
assert "buStoryInputSoundsV5" in parts[4]
print("PASS: Original knock PCM deleted; duplicate Story sounds removed; single tap/swipe owner; bundled engine syntax valid.")

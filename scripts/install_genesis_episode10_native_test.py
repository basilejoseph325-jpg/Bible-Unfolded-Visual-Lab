#!/usr/bin/env python3
"""Build an isolated, compatible Genesis Episode 10 on a TEST feature branch.
Only changes the required serialized native parts after exact anchor checks. Never
copies the original engine to LIVE or alters existing chapter ids/saves/rewards.
"""
import json,re
from pathlib import Path

files=[Path(f"bible_unfolded_core_part{i}.js") for i in range(1,6)]
data_file=Path("story-adventure-content/genesis-episode-10-test.json")
ep=json.loads(data_file.read_text(encoding="utf-8"))
if ep.get("chapterId")!="genesis_ep10" or len(ep["discoveries"])!=10:
    raise SystemExit("Expected complete Genesis Episode 10 source data")
if [d["id"] for d in ep["discoveries"]] != [f"g10-d{i:02d}" for i in range(1,11)]:
    raise SystemExit("Discovery ids incomplete or out of order")
if any(len(d["progressiveHints"])!=3 or not d["scripture"][0]["url"].startswith(
    "https://www.jw.org/en/library/bible/nwt/books/genesis/") for d in ep["discoveries"]):
    raise SystemExit("Source or hint contract invalid")
ep["contentStatus"]="playable_test_candidate_pending_phone_and_art_approval"

pieces=[]
for f in files:
    src=f.read_text(encoding="utf-8")
    m=re.search(r'(__BU_STAGE41_CORE_PARTS__\[\d+\] = )(".*")(\s*;)',src,re.S)
    if not m:raise SystemExit(f"Unexpected serialized game part: {f}")
    pieces.append([f,src,m,json.loads(m.group(2))])
if any("genesis_ep10" in p[3] for p in pieces):
    raise SystemExit("Episode 10 is already in the native engine")
def once(old,new):
    matches=[i for i,p in enumerate(pieces) if old in p[3]]
    if len(matches)!=1:
        raise SystemExit(f"Native anchor in {len(matches)} parts, counts={[p[3].count(old) for p in pieces]}: {old[:110]}")
    i=matches[0]
    f,src,m,current=pieces[i]
    pieces[i][3]=current.replace(old,new,1)
    print("PATCH_ANCHOR",f.name,old[:63])

# Extend native lexical data table, preserving the original episode data byte-for-byte.
newdata=json.dumps({"genesis_ep10":ep},ensure_ascii=False,separators=(",",":"))
once("const BU_GENESIS_KEY=", "Object.assign(BU3857_DATA,"+newdata+");\nconst BU_GENESIS_KEY=")
once("const BU_GENESIS_IDS=['genesis_ep07','genesis_ep08','genesis_ep09'];",
     "const BU_GENESIS_IDS=['genesis_ep07','genesis_ep08','genesis_ep09','genesis_ep10'];")
once("['Isaac and Rebekah','Genesis 23–24 · 10 interactive discoveries']);",
     "['Isaac and Rebekah','Genesis 23–24 · 10 interactive discoveries'],['Jacob and Esau','Genesis 25–28 · 10 interactive discoveries']);")
# Native episode-picker cover: existing reusable Genesis book illustration for TEST.
# Scene-specific artwork remains a review item, not a fabricated historical claim.
once("BU_GENESIS_SCENE_ART['g09-d01']];",
     "BU_GENESIS_SCENE_ART['g09-d01'],'bible-book-art/01_genesis.webp'];")
once("!!completedChapters.genesis_ep08];",
     "!!completedChapters.genesis_ep08,!!completedChapters.genesis_ep09];")
once("of 9 episodes available · progress to unlock the next",
     "of 10 episodes available · progress to unlock the next")
once("Genesis adventures: '+done+' of 9 playable episodes complete",
     "Genesis adventures: '+done+' of 10 playable episodes complete")
once("done===9?' · Further Genesis adventures in development'",
     "done===10?' · Further Genesis adventures in development'")
once("bar.style.width=(done/9*100)+'%';",
     "bar.style.width=(done/10*100)+'%';")
once('bar.setAttribute(\'aria-valuemax\',\'9\');',
     'bar.setAttribute(\'aria-valuemax\',\'10\');')
once("Genesis Episodes 7–9 · Abraham, Isaac & Rebekah",
     "Genesis Episodes 7–10 · Abraham, Isaac & Rebekah, Jacob & Esau")
# Avoid ending Genesis Episode 9 prematurely. padStart fixes ep9->10 id.
finish="<9?'Next Genesis Episode →':'Return to Genesis →'"
once(finish,"<10?'Next Genesis Episode →':'Return to Genesis →'")
old="ch.chapterNumber<9?bu3857Open('genesis_ep0'+(ch.chapterNumber+1)):bu3857Exit()"
new="ch.chapterNumber<10?bu3857Open('genesis_ep'+String(ch.chapterNumber+1).padStart(2,'0')):bu3857Exit()"
once(old,new)
joined="".join(p[3] for p in pieces)
if "const BU_GENESIS_IDS=['genesis_ep07','genesis_ep08','genesis_ep09','genesis_ep10']" not in joined:
    raise SystemExit("Genesis id registry wasn't extended")
if joined.count("Object.assign(BU3857_DATA,{\"genesis_ep10\":") != 1:
    raise SystemExit("Episode 10 was not added exactly once")
changed=[]
for f,src,m,body in pieces:
    original=json.loads(m.group(2))
    if body==original:continue
    rebuilt=src[:m.start(2)]+json.dumps(body,ensure_ascii=True)+src[m.end(2):]
    f.write_text(rebuilt,encoding="utf-8")
    changed.append(f.name)
print("PASS: safely appended Genesis 10 to the original Story mode; no prior chapters replaced",changed)

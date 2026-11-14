#!/usr/bin/env python3
"""Build an isolated, compatible Genesis Episode 10 on a TEST feature branch.
Only changes one serialized native game part after exact anchor checks. Never
copies the original engine to LIVE or alters existing chapter ids/saves/rewards.
"""
import json,re
from pathlib import Path

branch_file=Path("bible_unfolded_core_part5.js")
data_file=Path("story-adventure-content/genesis-episode-10-test.json")
src=branch_file.read_text(encoding="utf-8")
ep=json.loads(data_file.read_text(encoding="utf-8"))
if ep.get("chapterId")!="genesis_ep10" or len(ep["discoveries"])!=10:
    raise SystemExit("Expected complete Genesis Episode 10 source data")
if [d["id"] for d in ep["discoveries"]] != [f"g10-d{i:02d}" for i in range(1,11)]:
    raise SystemExit("New discovery ids are incomplete or out of order")
if any(len(d["progressiveHints"])!=3 or not d["scripture"][0]["url"].startswith(
    "https://www.jw.org/en/library/bible/nwt/books/genesis/") for d in ep["discoveries"]):
    raise SystemExit("Source or hint contract invalid")
# Keep it labeled as TEST authored content, not an approved LIVE export.
ep["contentStatus"]="playable_test_candidate_pending_phone_and_art_approval"

m=re.search(r'(__BU_STAGE41_CORE_PARTS__\[\d+\] = )(".*")(\s*;)',src,re.S)
if not m:
    raise SystemExit("Native code part has unexpected serialization")
s=json.loads(m.group(2))
if "genesis_ep10" in s:
    raise SystemExit("Genesis 10 already exists; refusing double install")

def once(old,new):
    global s
    count=s.count(old)
    if count!=1:
        raise SystemExit(f"Expected one native anchor, got {count}: {old[:110]}")
    s=s.replace(old,new,1)

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
if "BU_GENESIS_IDS=['genesis_ep07','genesis_ep08','genesis_ep09','genesis_ep10']" not in s:
    raise SystemExit("Registry wasn't extended")
if s.count("Object.assign(BU3857_DATA,{\"genesis_ep10\":") != 1:
    raise SystemExit("New episode not appended exactly once")
result=src[:m.start(2)] + json.dumps(s,ensure_ascii=True) + src[m.end(2):]
branch_file.write_text(result,encoding="utf-8")
print("PASS: appended Genesis 10 to original Story mode; prior chapter data, saves, and shared game UI preserved")
print("DIAGNOSTIC",{"original_serialized_size":len(src),"new_size":len(result),
                    "new_discoveries":len(ep["discoveries"]),"added_core_chars":len(s)-len(json.loads(m.group(2)))})

#!/usr/bin/env python3
"""Add Genesis 11 to original TEST Story engine without overwriting earlier modes.

Strict replace-once semantics: abort if native code deviates from verified
Episode10 baseline. Install 10 independent 640x360 images, word wheel answers,
the same no-letter 3-hint mechanism, saved completion, and next-chapter links.
TEST ONLY. The original Story-Trails LIVE repository is never written.
"""
from pathlib import Path
import json,re,subprocess

base=Path("story-adventure-content/genesis-episode11-haran-v1.json")
src=json.loads(base.read_text(encoding="utf-8"))
if src.get("chapterId")!="genesis_ep11" or src.get("chapterNumber")!=11:
    raise SystemExit("Wrong Genesis 11 chapter source")
ids=[f"g11-d{i:02d}" for i in range(1,11)]
if [x["id"] for x in src["discoveries"]]!=ids or list(src["words"])!=ids or list(src["artPlan"])!=ids:
    raise SystemExit("Expected exactly ten ordered scene/answer/artwork ids")
for d in src["discoveries"]:
    a=src["words"][d["id"]]
    if not re.fullmatch(r"[A-Z]{4,12}",a["answer"]):raise SystemExit("Invalid wheel letters")
    if len(d["progressiveHints"])!=3 or any(not a.get(k) for k in ("clue","hint1","hint2","hint3","explanation")):
        raise SystemExit("Missing context clue, three hints, or explanation")
    if not d["scripture"][0]["url"].startswith("https://www.jw.org/en/library/bible/nwt/books/genesis/"):
        raise SystemExit("Non-JW Bible source")
    if d["interaction"]["answer"]!=a["answer"]:raise SystemExit("Game word differs from editorial source")
    if not (Path("story-adventure-art/genesis11")/(d["id"]+".webp")).is_file():
        raise SystemExit("Missing approved standalone photo: "+d["id"])
ep={k:v for k,v in src.items() if k not in ("words","artPlan","rules","saveKey")}
ep["contentStatus"]="playable_test_candidate_awaiting_real_phone_review"
ep["illustrationStatus"]="10 separate visually reviewed historical reconstructions"
words={id_:{k:src["words"][id_][k] for k in ("clue","answer","explanation","hint1","hint2","hint3","basis")}
       for id_ in ids}
art={id_:"story-adventure-art/genesis11/"+id_+".webp" for id_ in ids}
alt={id_:src["artPlan"][id_]["alt"]+"; artistic historical reconstruction"
     for id_ in ids}
files=[Path(f"bible_unfolded_core_part{i}.js") for i in range(1,6)]
parts=[]
for f in files:
    raw=f.read_text(encoding="utf-8")
    m=re.search(r'(__BU_STAGE41_CORE_PARTS__\[\d+\] = )(".*")(\s*;)',raw,re.S)
    if not m:raise SystemExit("Serialized native code wrapper changed: "+str(f))
    parts.append({"file":f,"raw":raw,"match":m,"body":json.loads(m.group(2))})
full="".join(p["body"] for p in parts)
if "genesis_ep11" in full or "g11-d01" in full:
    raise SystemExit("Episode 11 already installed or partial revision detected")
if "bible-unfolded-genesis-adventure-v3860" not in full:
    raise SystemExit("Original player save key changed unexpectedly")
if full.count("genesis_ep10")<4:
    raise SystemExit("Prior Genesis Episode10 unexpectedly absent")
def once(old,new):
    owners=[p for p in parts if old in p["body"]]
    if len(owners)!=1 or owners[0]["body"].count(old)!=1:
        raise SystemExit("Native anchor wasn't unique: "+repr(old[:150])+", counts="+str([p["body"].count(old) for p in parts]))
    p=owners[0];p["body"]=p["body"].replace(old,new,1)
    print("PATCH",p["file"].name,repr(old[:95]))
def exact_hits(old,expected_count,new):
    owners=[p for p in parts if old in p["body"]]
    count=sum(p["body"].count(old) for p in owners)
    if count!=expected_count:raise SystemExit("Expected "+str(expected_count)+" occurrences of "+repr(old[:80])+"; got "+str(count))
    for p in owners:p["body"]=p["body"].replace(old,new)

# Data tables: earlier Genesis episodes are never reserialized or changed.
once("const BU_GENESIS_KEY=",
     "Object.assign(BU3857_DATA,"+json.dumps({"genesis_ep11":ep},ensure_ascii=False,separators=(",",":"))+");\nconst BU_GENESIS_KEY=")
once("let buHQPath=[];",
     "/* Genesis 11 word-connect: original wheel engine, not a new mode. */\n"+
     "Object.assign(BU_HQ_WORDS,"+json.dumps(words,ensure_ascii=False,separators=(",",":"))+");\nlet buHQPath=[];")
once("const BU_GENESIS_IDS=['genesis_ep07','genesis_ep08','genesis_ep09','genesis_ep10'];",
     "const BU_GENESIS_IDS=['genesis_ep07','genesis_ep08','genesis_ep09','genesis_ep10','genesis_ep11'];")
once("['Jacob and Esau','Genesis 25–28 · 10 interactive discoveries']);",
     "['Jacob and Esau','Genesis 25–28 · 10 interactive discoveries'],[\"Jacob's Years in Haran\",'Genesis 29–31 · 10 interactive discoveries']);")
once("!!completedChapters.genesis_ep09];",
     "!!completedChapters.genesis_ep09,!!completedChapters.genesis_ep10];")
once("of 10 episodes available · progress to unlock the next",
     "of 11 episodes available · progress to unlock the next")
once("30 new interactive discoveries","50 new interactive discoveries")
once("of 10 playable episodes complete","of 11 playable episodes complete")
once("done===10?' · Further Genesis adventures in development'",
     "done===11?' · Further Genesis adventures in development'")
once("done/10*100","done/11*100")
once("bar.setAttribute('aria-valuemax','10');","bar.setAttribute('aria-valuemax','11');")
once("Genesis Episodes 7–10 · Abraham, Isaac & Rebekah, Jacob & Esau",
     "Genesis Episodes 7–11 · Abraham, Isaac & Rebekah, Jacob & Esau, Jacob in Haran")
once("✦ UNLOCKED · 3 EPISODES","✦ UNLOCKED · 5 EPISODES")
# Precisely one source code album thumbnails array, not the existing Bible Books art.
album_old=",'bible-book-art/01_genesis.webp'];\n const unlocked=ex?"
album_new=",'bible-book-art/01_genesis.webp','story-adventure-art/genesis11/g11-d01.webp'];\n const unlocked=ex?"
once(album_old,album_new)
# Native next chapter routing: original Genesis Episode 10 must reach Episode11.
exact_hits("ch.chapterNumber<10?",2,"ch.chapterNumber<11?")
# Third hint should prompt reasoning, not reveal answer letters.
once("if(s.book==='genesis_ep10'){",
     "if(s.book==='genesis_ep10'||s.book==='genesis_ep11'){")
once("bu3857State.book==='genesis_ep10'?0:",
     "(bu3857State.book==='genesis_ep10'||bu3857State.book==='genesis_ep11')?0:")

art_def=("const BU_EP11_SCENE_ART=Object.freeze("+
         json.dumps(art,ensure_ascii=False,separators=(",",":"))+");\n"+
         "const BU_EP11_SCENE_ALT=Object.freeze("+
         json.dumps(alt,ensure_ascii=False,separators=(",",":"))+");\n")
once("function bu3857Render(){",art_def+"function bu3857Render(){")
once("const sceneSrc=BU3857_SCENE_ART[d.id]||BU_GENESIS_SCENE_ART[d.id]||BU_EP10_SCENE_ART[d.id];",
     "const sceneSrc=BU3857_SCENE_ART[d.id]||BU_GENESIS_SCENE_ART[d.id]||BU_EP10_SCENE_ART[d.id]||BU_EP11_SCENE_ART[d.id];")
once("BU3857_SCENE_ALT[d.id]||BU_GENESIS_SCENE_ALT[d.id]||BU_EP10_SCENE_ALT[d.id]||'Bible story scene'",
     "BU3857_SCENE_ALT[d.id]||BU_GENESIS_SCENE_ALT[d.id]||BU_EP10_SCENE_ALT[d.id]||BU_EP11_SCENE_ALT[d.id]||'Bible story scene'")
# Publish new native parts ONLY after all guarded anchors pass.
changed=[]
for p in parts:
    if p["body"]==json.loads(p["match"].group(2)):continue
    m=p["match"]
    rebuilt=p["raw"][:m.start(2)]+json.dumps(p["body"],ensure_ascii=True)+p["raw"][m.end(2):]
    p["file"].write_text(rebuilt,encoding="utf-8")
    changed.append(p["file"].name)
if set(changed)!={"bible_unfolded_core_part3.js","bible_unfolded_core_part5.js"}:
    raise SystemExit("Unexpected native Story files changed: "+str(changed))

# Enhance the existing HTML hint modal only for the new chapter, plus cache
# version tags for the two updated external JS files. Do not replace TEST HTML.
htmlfile=Path("index.html")
html=htmlfile.read_text(encoding="utf-8")
if not 11000000<len(html)<16000000:raise SystemExit("Unexpected TEST HTML size")
old="const ep10=st.book==='genesis_ep10'&&!!entry;"
new="const ep10=(st.book==='genesis_ep10'||st.book==='genesis_ep11')&&!!entry;"
if html.count(old)!=1:raise SystemExit("Existing Episode10 HTML thinking-hint modal changed")
html=html.replace(old,new,1)
for num in (3,5):
    match=re.compile(r'(<script src="bible_unfolded_core_part'+str(num)+r'\.js)\?v=[^"]+("></script>)')
    if len(match.findall(html))!=1:raise SystemExit("Expected one current native core script version "+str(num))
    html=match.sub(r'\g<1>?v=genesis11-haran-test-v1\g<2>',html,count=1)
assert "genesis_ep11" in html
htmlfile.write_text(html,encoding="utf-8")
print("PASS_GENESIS11_NATIVE_PATCH",changed,"and 1 scoped HTML hint condition + two cache-version tags, 10 real photos")

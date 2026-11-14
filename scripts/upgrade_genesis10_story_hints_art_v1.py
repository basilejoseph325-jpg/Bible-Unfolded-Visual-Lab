#!/usr/bin/env python3
"""Only Episode 10 native Story additions: better three-stage thinking hints,
vivid questions, and real scene-specific artwork. Preserve all 30 previous
Genesis wheel answers, wallet, saves, prizes and other mode behavior.
"""
from pathlib import Path
import re,json

source=json.loads(Path("story-adventure-content/genesis-episode10-wordwheel-test-v1.json").read_text(encoding="utf8"))
src=source["words"]
ids=[f"g10-d{i:02d}" for i in range(1,11)]
if list(src)!=ids or any(not src[k].get("hint3") for k in ids):
    raise SystemExit("Episode 10 source incomplete (10 questions and three hints required)")
files=[Path(f"bible_unfolded_core_part{i}.js") for i in range(1,6)]
parts=[]
for f in files:
    raw=f.read_text(encoding="utf8")
    m=re.search(r'(__BU_STAGE41_CORE_PARTS__\[\d+\] = )(".*")(\s*;)',raw,re.S)
    if not m:raise SystemExit(f"Native serialized wrapper missing: {f}")
    parts.append({"file":f,"raw":raw,"match":m,"body":json.loads(m.group(2))})
def replace_once(before,after):
    owners=[p for p in parts if before in p["body"]]
    if len(owners)!=1 or owners[0]["body"].count(before)!=1:
        raise SystemExit("Expected one unmodified native anchor: "+before[:125])
    p=owners[0];p["body"]=p["body"].replace(before,after,1)
    print("PATCH",p["file"].name,before[:80])

word_anchor="Object.assign(BU_HQ_WORDS,"
word_owners=[p for p in parts if word_anchor in p["body"]]
if len(word_owners)!=1:raise SystemExit("Exactly one Episode 10 word-data patch required")
p=word_owners[0]
body=p["body"]
m=re.search(r'Object\.assign\(BU_HQ_WORDS,(\{.*?\})\);',body,re.S)
if not m:raise SystemExit("Original Episode 10 wheel data structure changed")
existing=json.loads(m.group(1))
if set(existing)!=set(ids):raise SystemExit("Episode 10 wheel entries drift")
original_30_match=body.index("const BU_HQ_WORDS = ")+len("const BU_HQ_WORDS = ")
original_30,_=json.JSONDecoder().raw_decode(body[original_30_match:].lstrip())
if len(original_30)!=30 or any(key.startswith("g10") for key in original_30):
    raise SystemExit("Original Episodes 7-9 answer bank changed")
new={}
for id_ in ids:
    row=src[id_]
    original={'g10-d01':'ISAAC','g10-d02':'TWINS','g10-d03':'HUNTER',
      'g10-d04':'LENTILS','g10-d05':'GERAR','g10-d06':'REHOBOTH',
      'g10-d07':'OATH','g10-d08':'GOATSKINS','g10-d09':'BLESSING','g10-d10':'BETHEL'}
    if existing[id_]['answer']!=original[id_]:
        raise SystemExit('Unexpected initial Episode 10 answer: '+id_)
    new[id_]={k:row[k] for k in ["clue","answer","explanation","hint1","hint2","hint3","basis"]}
serialized=json.dumps(new,ensure_ascii=False,separators=(",",":"))
replace_once(m.group(0),"Object.assign(BU_HQ_WORDS,"+serialized+");")

# User explicitly requests thinking hints instead of selling a second letter
# reveal. This branch applies only to Episode 10. Existing Genesis 7-9
# behavior, previously purchased hints and economy remain untouched.
anchor="if(entry){\n  const max=2+entry.answer.length;"
new_hint="""if(entry){
  if(s.book==='genesis_ep10'){
    const clues=[entry.hint1,entry.hint2,entry.hint3];
    if(level>=3){
      s.feedback='All three story clues are available. The strongest clue: '+entry.hint3;
      bu3857Render();return;
    }
    const cost=level===0?0:level===1?15:25;
    if(cost&&!canSpend(cost,true)){
      s.feedback='Not enough Insight Tokens; none deducted.';
      bu3857Render();return;
    }
    s.hints[d.id]=level+1;
    s.feedback=(cost?'−'+cost+' Insight Tokens · ':'Free hint · ')+clues[level];
    bu3857Save();bu3857Render();return;
  }
  const max=2+entry.answer.length;"""
replace_once(anchor,new_hint)
# Prevent legacy paid-letter reveal setting from generating letters on Episode
# 10, even when old saved levels already exist on a physical test phone.
old="if(BU_HQ_WORDS[bu3857Current()?.id])buHQHintLetters[bu3857Current().id]=Math.max(0,Number(bu3857State.hints[bu3857Current().id]||0)-2);"
new="if(BU_HQ_WORDS[bu3857Current()?.id])buHQHintLetters[bu3857Current().id]=bu3857State.book==='genesis_ep10'?0:Math.max(0,Number(bu3857State.hints[bu3857Current().id]||0)-2);"
replace_once(old,new)

# Story art: first owner-screen report was Discovery 3. The approved single-
# scene photo exists in this TEST branch, not a collage or UI mock-up.
art="story-adventure-art/genesis10/esau-and-jacob.webp"
if not Path(art).exists():raise SystemExit("Actual imported Episode 10 photo missing")
art2="story-adventure-art/genesis10/esau-birthright-stew.webp"
if not Path(art2).exists():raise SystemExit("Second scene photo missing")
alt2="Jacob offering Esau bread and lentil stew near the family tents, historical illustration"
alt="Esau, the hunter, returning near his family’s tents while Jacob remains at camp, historical reconstruction"
hook="const sceneSrc=BU3857_SCENE_ART[d.id]||BU_GENESIS_SCENE_ART[d.id];"
replacement=("const BU_EP10_SCENE_ART=Object.freeze({'g10-d03':'"+art+"','g10-d04':'"+art2+"'});\n"
 "const BU_EP10_SCENE_ALT=Object.freeze({'g10-d03':'"+alt+"','g10-d04':'"+alt2+"'});\n"
 "const sceneSrc=BU3857_SCENE_ART[d.id]||BU_GENESIS_SCENE_ART[d.id]||BU_EP10_SCENE_ART[d.id];")
# Constants must not be redeclared each render? Place before function once,
# not inside bu3857Render.
const_map=("const BU_EP10_SCENE_ART=Object.freeze({'g10-d03':'"+art+"','g10-d04':'"+art2+"'});\n"
 "const BU_EP10_SCENE_ALT=Object.freeze({'g10-d03':'"+alt+"','g10-d04':'"+alt2+"'});\n")
function_anchor="function bu3857Render(){"
replace_once(function_anchor,const_map+function_anchor)
replace_once(hook,"const sceneSrc=BU3857_SCENE_ART[d.id]||BU_GENESIS_SCENE_ART[d.id]||BU_EP10_SCENE_ART[d.id];")
alt_old="BU3857_SCENE_ALT[d.id]||BU_GENESIS_SCENE_ALT[d.id]||'Bible story scene'"
alt_new="BU3857_SCENE_ALT[d.id]||BU_GENESIS_SCENE_ALT[d.id]||BU_EP10_SCENE_ALT[d.id]||'Bible story scene'"
replace_once(alt_old,alt_new)

changed=[]
for p in parts:
    m=p["match"]
    if p["body"]==json.loads(m.group(2)):continue
    rebuilt=p["raw"][:m.start(2)]+json.dumps(p["body"],ensure_ascii=True)+p["raw"][m.end(2):]
    p["file"].write_text(rebuilt,encoding="utf8")
    changed.append(p["file"].name)
if set(changed)!={"bible_unfolded_core_part3.js","bible_unfolded_core_part5.js"}:
    raise SystemExit("Unexpected native part changes: "+repr(changed))
print("PASS_ONLY_EP10_HINTS_QUESTIONS_AND_PHOTO",changed)

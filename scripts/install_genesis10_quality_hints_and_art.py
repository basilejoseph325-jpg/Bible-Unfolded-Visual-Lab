#!/usr/bin/env python3
"""TEST-only native Genesis Episode 10 quality pass.
Preserve Genesis 7-9, original serialized Story save keys, wallet and controls.
Never touch LIVE, historical assets or unrelated Story data.
"""
from pathlib import Path
import json
import re

base=Path("story-adventure-content/genesis-episode10-wordwheel-test-v1.json")
fresh=json.loads(base.read_text(encoding="utf-8"))["words"]
ids=[f"g10-d{i:02d}" for i in range(1,11)]
assert list(fresh)==ids
for i,entry in fresh.items():
    assert re.fullmatch(r"[A-Z]{3,10}",entry["answer"]),i
    for prop in ["clue","explanation","hint1","hint2","hint3","reference"]:
        assert isinstance(entry[prop],str) and len(entry[prop])>15,(i,prop)

arts={
 "g10-d03":("story-adventure-art/genesis10/esau-jacob-brothers.webp",
   "Esau, a hunter returning from the field, with Jacob working near the family tents"),
 "g10-d04":("story-adventure-art/genesis10/esau-birthright-stew.webp",
   "Jacob offers Esau a bowl of lentil stew by the family tents")
}
for _,(photo,_) in arts.items():
    assert Path(photo).exists(),f"Missing approved candidate art: {photo}"
newdata={}
for key,w in fresh.items():
    record={k:w[k] for k in ["clue","answer","explanation","hint1","hint2","hint3","basis"]}
    if key in arts: record.update(art=arts[key][0],alt=arts[key][1])
    newdata[key]=record

files=[Path(f"bible_unfolded_core_part{n}.js") for n in range(1,6)]
parts=[]
for f in files:
    raw=f.read_text(encoding="utf-8")
    m=re.search(r'(__BU_STAGE41_CORE_PARTS__\[\d+\] = )(".*")(\s*;)',raw,re.S)
    assert m,f"Not original native Story part: {f}"
    parts.append(dict(file=f,raw=raw,match=m,body=json.loads(m.group(2))))

def owning(anchor):
    matches=[p for p in parts if anchor in p["body"]]
    assert len(matches)==1,(anchor,len(matches))
    return matches[0]

core=owning('Object.assign(BU_HQ_WORDS,{"g10-d01"')
old=core["body"]
start=old.index('Object.assign(BU_HQ_WORDS,')
recordsStart=start+len('Object.assign(BU_HQ_WORDS,')
oldNew,consumed=json.JSONDecoder().raw_decode(old[recordsStart:])
assert list(oldNew)==ids and len(oldNew)==10
assert all("hint3" not in x for x in oldNew.values()),"Don't apply twice"
end=recordsStart+consumed
assert old[end:end+2]==');'
replacement='Object.assign(BU_HQ_WORDS,'+json.dumps(newdata,ensure_ascii=False,separators=(",",":"))+');'
core["body"]=old[:start]+replacement+old[end+2:]

anchor="const s=bu3857State,d=bu3857Current(),entry=BU_HQ_WORDS[d.id];let level=Number(s.hints[d.id]||0);"
code=core["body"]
assert code.count(anchor)==1
newHint=r'''
 // Only Genesis Episode 10 uses story-thinking hints, not paid auto-letters.
 // Prior Genesis chapters retain their existing hint rules and prices.
 if(s.book==='genesis_ep10'&&entry){
   const hints=[entry.hint1,entry.hint2,entry.hint3];
   if(level>=hints.length){
     s.feedback='You have used all three thinking hints. Read the account, then connect the answer yourself.';
     bu3857Render();return;
   }
   const cost=level===0?0:level===1?15:25;
   if(cost&&!canSpend(cost,true)){
     s.feedback='Not enough Insight Tokens; none deducted.';
     bu3857Render();return;
   }
   s.hints[d.id]=level+1;
   buHQHintLetters[d.id]=0;
   s.feedback=(cost?'−'+cost+' Insight Tokens · ':'Free hint · ')+hints[level];
   bu3857Save();bu3857Render();return;
 }
'''
core["body"]=core["body"].replace(anchor,anchor+newHint,1)
# Without this safeguard the old Genesis hint binder would still reveal the
# first answer letter after a third hint, even though no letters were purchased.
bindOld="buHQHintLetters[bu3857Current().id]=Math.max(0,Number(bu3857State.hints[bu3857Current().id]||0)-2);"
assert core["body"].count(bindOld)==1
bindNew="buHQHintLetters[bu3857Current().id]=bu3857State.book==='genesis_ep10'?0:Math.max(0,Number(bu3857State.hints[bu3857Current().id]||0)-2);"
core["body"]=core["body"].replace(bindOld,bindNew,1)

# The original Story image component already lays out the photo above
# the wheel. Use it without changing the wheel size or styling.
render=owning("const sceneSrc=BU3857_SCENE_ART[d.id]||BU_GENESIS_SCENE_ART[d.id];")
oldSrc="const sceneSrc=BU3857_SCENE_ART[d.id]||BU_GENESIS_SCENE_ART[d.id];"
newSrc="const sceneSrc=BU3857_SCENE_ART[d.id]||BU_GENESIS_SCENE_ART[d.id]||(s.book==='genesis_ep10'?BU_HQ_WORDS[d.id]?.art:null);"
assert render["body"].count(oldSrc)==1
render["body"]=render["body"].replace(oldSrc,newSrc,1)
oldAlt="BU3857_SCENE_ALT[d.id]||BU_GENESIS_SCENE_ALT[d.id]||'Bible story scene'"
newAlt="BU3857_SCENE_ALT[d.id]||BU_GENESIS_SCENE_ALT[d.id]||BU_HQ_WORDS[d.id]?.alt||'Bible story scene'"
assert render["body"].count(oldAlt)==1
render["body"]=render["body"].replace(oldAlt,newAlt,1)

edited=[]
for p in parts:
    if p["body"]==json.loads(p["match"].group(2)):continue
    m=p["match"]
    updated=p["raw"][:m.start(2)]+json.dumps(p["body"],ensure_ascii=True)+p["raw"][m.end(2):]
    p["file"].write_text(updated,encoding="utf-8")
    edited.append(p["file"].name)
assert set(edited)=={"bible_unfolded_core_part3.js","bible_unfolded_core_part5.js"},edited
print("PASS_EP10_NATIVE_QUALITY_PATCH",edited,"10 thoughtful clues, 30 untouched older wheels, no auto-letter hints, 2 original scenes")

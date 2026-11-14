#!/usr/bin/env python3
"""Scoped TEST fix: Discovery 1 was published with no scene image.
Preserve all episode locks, saved progress, rewards and other chapters.
"""
from pathlib import Path
import json,re

photo="story-adventure-art/genesis10/abraham-burial-promise.webp"
assert Path(photo).is_file() and Path(photo).stat().st_size>20000
files=[Path(f"bible_unfolded_core_part{i}.js") for i in range(1,6)]
owners=[]
for f in files:
 raw=f.read_text(encoding="utf-8")
 m=re.search(r'(__BU_STAGE41_CORE_PARTS__\[\d+\] = )(".*")(\s*;)',raw,re.S)
 assert m,f"Native core wrapper missing in {f}"
 body=json.loads(m.group(2))
 if "const BU_EP10_SCENE_ART=Object.freeze(" in body:owners.append((f,raw,m,body))
assert len(owners)==1,[(x[0].name) for x in owners]
file,raw,m,body=owners[0]
startArt="const BU_EP10_SCENE_ART=Object.freeze({"
startAlt="const BU_EP10_SCENE_ALT=Object.freeze({"
assert body.count(startArt)==1 and body.count(startAlt)==1
assert "g10-d01" not in body[body.index(startArt):body.index(startArt)+380], "Discovery 1 already mapped"
assert "g10-d03" in body[body.index(startArt):body.index(startArt)+300]
assert "g10-d04" in body[body.index(startArt):body.index(startArt)+300]
body=body.replace(startArt,startArt+"'g10-d01':'"+photo+"',",1)
body=body.replace(startAlt,startAlt+
 "'g10-d01':'Isaac and Ishmael stand near the burial place of their father Abraham, an artistic reconstruction of Genesis 25:7-11',",1)
assert body.count(photo)==1
assert "function bu3857Render(){" in body
assert "BU_EP10_SCENE_ART[d.id]" in body
rebuilt=raw[:m.start(2)]+json.dumps(body,ensure_ascii=True)+raw[m.end(2):]
file.write_text(rebuilt,encoding="utf-8")
print("PASS_DISCOVERY1_IMAGE_NATIVE",file.name,photo)

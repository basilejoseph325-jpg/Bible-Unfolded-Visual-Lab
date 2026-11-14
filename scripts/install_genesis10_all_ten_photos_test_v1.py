#!/usr/bin/env python3
"""TEST-only native Genesis Episode 10 art completion (10 of 10).
Add exactly seven reviewed scenes to the existing 3-scene image mapping and
bust only Story core part 5's existing HTML URL. Original save, rewards,
episode locks, narrator, wheel, other episodes and LIVE must remain unchanged.
"""
from pathlib import Path
import json,re

new={
'g10-d02':('rebekah-inquires-jehovah.webp',
 'Rebekah expecting twins, troubled as Isaac supports her by their tent; artistic reconstruction'),
'g10-d05':('isaac-stays-gerar.webp',
 'Isaac and Rebekah with their flock and camp near Gerar; artistic reconstruction'),
'g10-d06':('rehoboth-water-found.webp',
 'Servant joyfully cups water at a well after Isaac has found room at Rehoboth; artistic reconstruction'),
'g10-d07':('isaac-abimelech-covenant.webp',
 'Isaac and Abimelech agree to peace near a shared meal; artistic reconstruction'),
'g10-d08':('rebekah-goatskins-jacob.webp',
 'Rebekah places goatskins on Jacob as he prepares to approach his father; artistic reconstruction'),
'g10-d09':('isaac-blessing-jacob.webp',
 'Elderly Isaac places a hand on Jacob while giving him the blessing; artistic reconstruction'),
'g10-d10':('jacob-stairway-dream.webp',
 'Jacob asleep outside, dreaming of a stairway with angels ascending and descending; imagined dream depiction'),
}
assert len(new)==7
prefix="story-adventure-art/genesis10/"
for id,(name,alt) in new.items():
 f=Path(prefix+name)
 buf=f.read_bytes()
 if len(buf)<20000 or len(buf)>100000 or buf[:4]!=b'RIFF' or buf[8:12]!=b'WEBP':
  raise SystemExit('Missing or invalid reviewed WebP: '+str(f))
 if not alt or len(alt)<60:raise SystemExit('Image alt description missing: '+id)

core=Path("bible_unfolded_core_part5.js")
wrapper=core.read_text(encoding="utf8")
match=re.search(r'(__BU_STAGE41_CORE_PARTS__\[\d+\] = )(".*")(\s*;)',wrapper,re.S)
assert match,'Native serialized core wrapper missing'
body=json.loads(match.group(2))
art_anchor='const BU_EP10_SCENE_ART=Object.freeze({'
alt_anchor='const BU_EP10_SCENE_ALT=Object.freeze({'
assert body.count(art_anchor)==1 and body.count(alt_anchor)==1
art_before=body[body.index(art_anchor):body.index('});',body.index(art_anchor))+3]
alt_before=body[body.index(alt_anchor):body.index('});',body.index(alt_anchor))+3]
prior=['g10-d01','g10-d03','g10-d04']
for id in prior:
 assert ("'"+id+"'") in art_before and ("'"+id+"'") in alt_before,'Previously approved photo missing '+id
for id in new:
 assert id not in art_before and id not in alt_before,'Unexpected duplicate scene id '+id
assert 'abraham-burial-promise.webp' in art_before
assert 'esau-and-jacob.webp' in art_before
assert 'esau-birthright-stew.webp' in art_before

# Native map uses JS object literals with quoted keys, so JSON strings are safe.
art_add=','.join(json.dumps(id)+':'+json.dumps(prefix+name) for id,(name,alt) in new.items())+','
alt_add=','.join(json.dumps(id)+':'+json.dumps(alt,ensure_ascii=False) for id,(name,alt) in new.items())+','
after=body.replace(art_anchor,art_anchor+art_add,1).replace(alt_anchor,alt_anchor+alt_add,1)
assert after.replace(art_anchor+art_add,art_anchor,1).replace(alt_anchor+alt_add,alt_anchor,1)==body,'Unexpected native source changes'
for i in range(1,11):
 id=f'g10-d{i:02d}'
 art_span=after[after.index(art_anchor):after.index('});',after.index(art_anchor))+3]
 alt_span=after[after.index(alt_anchor):after.index('});',after.index(alt_anchor))+3]
 assert id in art_span and id in alt_span
assert "bible-unfolded-genesis-adventure-v3860" in after
assert 'BU_EP10_SCENE_ART[d.id]' in after
core.write_text(wrapper[:match.start(2)]+json.dumps(after,ensure_ascii=True)+wrapper[match.end(2):],encoding="utf8")

index=Path('index.html')
html=index.read_text(encoding='utf8')
assert 10_000_000<len(html)<14_000_000
old='<script src="bible_unfolded_core_part5.js?v=gen10-photos-20261114-d01-v1"></script>'
new_tag='<script src="bible_unfolded_core_part5.js?v=gen10-photos-all10-reviewed-20261114-v2"></script>'
assert html.count(old)==1,'Expected original TEST cache key missing'
html_updated=html.replace(old,new_tag,1)
assert html_updated.replace(new_tag,old,1)==html,'Unexpected TEST HTML difference'
assert html_updated.count('<script src="bible_unfolded_core_part3.js?v=gen10-questions-hints-20261114-d01-v1"></script>')==1
index.write_text(html_updated,encoding='utf8')
print('PASS_10_OF_10_SCENES original 3 + reviewed 7, preserved native Story core and all lock/save routines')

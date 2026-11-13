#!/usr/bin/env python3
"""TEST only. Import verified approved scene WebPs; never edit protected LIVE."""
from pathlib import Path
import zipfile,hashlib,json,re
ZIP=Path('BU_Daily_Approved_9_TEST.zip')
OLD='20261112-book-approved-batch2-v11'
NEW='20261113-book-approved-batch3-v12'
SCENES={
 'samaritan':'family-worship-menu-art/v1/topic-23-jesus-illustrations.webp',
 'mustard':'family-worship-menu-art/v1/topic-23-jesus-illustrations.webp',
 'paul-work':'family-worship-menu-art/v1/topic-26-paul-timothy.webp',
 'radio':'scholar-research-assets/witness-history.webp',
 'ezra':'journey-art/05_exile_return.webp',
 'hezekiah-water':'journey-art/04_judges_kings.webp',
 'jeremiah-field':'journey-art/05_exile_return.webp',
 'stars':'family-worship-menu-art/v1/topic-37-jehovah-s-qualities.webp',
 'sparrows':'family-worship-menu-art/v1/topic-37-jehovah-s-qualities.webp'}
assert ZIP.is_file(),'Upload BU_Daily_Approved_10_TEST.zip to TEST repository root'
with zipfile.ZipFile(ZIP) as z:
 data=json.loads(z.read('manifest.json'))
 assert data['scope']=='Bible-Unfolded-Visual-Lab TEST ONLY' and data['version']==NEW
 records={x['id']:x for x in data['items']}
 assert len(records)==9 and set(records)==set(SCENES)
 allowed={f'assets/daily-book/{id}.webp' for id in SCENES}|{'manifest.json','README.txt'}
 assert set(z.namelist())==allowed,'Extra or missing archive content'
 for id in SCENES:
  name=f'assets/daily-book/{id}.webp';raw=z.read(name)
  assert 0<len(raw)<200000 and raw[:4]==b'RIFF' and raw[8:12]==b'WEBP'
  assert hashlib.sha256(raw).hexdigest()==records[id]['sha256']
  dest=Path(name)
  if dest.exists():assert dest.read_bytes()==raw,'Do not overwrite '+name
  else:
   dest.parent.mkdir(parents=True,exist_ok=True)
   dest.write_bytes(raw)
path=Path('daily-discovery-meaningful-test-v1.js');s=path.read_text()
found=re.search(r'const BOOK_SCENES=Object\.freeze\(\{(?P<block>[\s\S]*?)\}\);',s)
assert found,'Book map missing'
block=found.group('block')
for id,old in SCENES.items():
 new=f'assets/daily-book/{id}.webp'
 pat=re.compile(rf"(?m)^(\s*(?:'{re.escape(id)}'|{re.escape(id)})\s*:\s*)'([^']+)'(\s*,?\s*)$")
 hit=list(pat.finditer(block))
 assert len(hit)==1,('Scene ID missing or duplicated',id)
 m=hit[0]
 assert m.group(2) in (old,new),('Scene changed unexpectedly',id,m.group(2))
 block=block[:m.start(2)]+new+block[m.end(2):]
s=s[:found.start('block')]+block+s[found.end('block'):]
found=re.search(r'const BOOK_ORIGINALS=new Set\(\[(?P<ids>.*?)\]\);',s)
assert found,'Original scene provenance missing'
ids=re.findall(r"'([^']+)'",found.group('ids'))
assert ids[:7]==['peter','nile','ruth','early-students','naaman-girl','well','paul-storm'] and len(ids) in (17,26)
for id in SCENES:
 if id not in ids:ids.append(id)
assert len(ids)==26 and len(set(ids))==26 and 'tears' not in ids
s=s[:found.start('ids')]+','.join("'"+id+"'" for id in ids)+s[found.end('ids'):]
path.write_text(s)
p=Path('scripts/qa_daily_book_preview.cjs');s=p.read_text()
old="assert.equal(new Set(allArt.map(r=>r.src)).size,24,'17 approved original images plus remaining thematic art should yield 24 distinct images');"
new="assert.equal(new Set(allArt.map(r=>r.src)).size,27,'26 distinct original illustrations plus one remaining older thematic picture');"
assert old in s or new in s,'QA uniqueness assertion changed'
s=s.replace(old,new)
anchor="      'baruch-scroll':'assets/daily-book/baruch-scroll.webp'"
assert anchor in s,'QA source map changed'
if "'samaritan':'assets/daily-book/samaritan.webp'" not in s:
 s=s.replace(anchor,anchor+',\n'+',\n'.join(f"      '{id}':'assets/daily-book/{id}.webp'" for id in SCENES))
legacy="const thematicIDs=['stars','radio','samaritan','mustard','ezra','paul-work','tears','hezekiah-water','jeremiah-field','sparrows'];"
updated="const thematicIDs=['tears'];"
assert legacy in s or updated in s,'Thematic QA list differs'
s=s.replace(legacy,updated)
p.write_text(s)
# Preserve protected .github/workflows/* files: GitHub Actions push tokens lack workflow permission.
for name in ['visual-lab-test-banner.js','journey-progress-caption.js']:
 p=Path(name);s=p.read_text()
 assert OLD in s or NEW in s,('Version tag missing',name)
 p.write_text(s.replace(OLD,NEW))
p=Path('index.html');s=p.read_text()
old='journey-progress-caption.js?v='+OLD
new='journey-progress-caption.js?v='+NEW
assert s.count(old)==1 or s.count(new)==1,'Unexpected bootstrap'
p.write_text(s.replace(old,new))
p=Path('docs/DAILY_DISCOVERY_REMAINING_10_VISUAL_AUDIT_2026-11-12.md')
if p.exists():
 s=p.read_text();note='\n## Batch-3 approved illustration integration into TEST\nNine topic-matched original scenes installed and SHA-256 verified. David\'s Tears remains thematic. There are 26 unique original image files serving 29 of 30 lessons, plus the retained Tears image (27 distinct image paths). The 30 discovery IDs, lessons, saves and rewards are unchanged. Protected LIVE untouched.\n'
 if note not in s:p.write_text(s+note)
print('PASS: 9 owner-approved scenes, 26 original images, 27 distinct artwork paths, TEST-only cache chain')

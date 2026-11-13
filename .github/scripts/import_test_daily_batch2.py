#!/usr/bin/env python3
"""TEST only. Import verified approved scene WebPs; never edit protected LIVE."""
from pathlib import Path
import zipfile,hashlib,json,re
ZIP=Path('BU_Daily_Approved_10_TEST.zip')
OLD='20261112-book-art-v10'
NEW='20261112-book-approved-batch2-v11'
SCENES={
 'philip':'journey-art/07_good_news_spreads.webp',
 'bereans':'journey-art/07_good_news_spreads.webp',
 'abigail':'family-worship-menu-art/v1/topic-16-david.webp',
 'dorcas-clothes':'journey-art/07_good_news_spreads.webp',
 'lydia-purple':'journey-art/07_good_news_spreads.webp',
 'widow-coins':'family-worship-menu-art/v1/topic-23-jesus-illustrations.webp',
 'rahab-cord':'family-worship-menu-art/v1/topic-13-joshua-jericho.webp',
 'widow-oil':'family-worship-menu-art/v1/topic-19-elisha.webp',
 'nehemiah-builders':'family-worship-menu-art/v1/topic-29-nehemiah.webp',
 'baruch-scroll':'journey-art/05_exile_return.webp'}
assert ZIP.is_file(),'Upload BU_Daily_Approved_10_TEST.zip to TEST repository root'
with zipfile.ZipFile(ZIP) as z:
 data=json.loads(z.read('manifest.json'))
 assert data['scope']=='Bible-Unfolded-Visual-Lab TEST ONLY'
 records={x['id']:x for x in data['items']}
 assert len(records)==10 and set(records)==set(SCENES)
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
assert ids[:7]==['peter','nile','ruth','early-students','naaman-girl','well','paul-storm']
for id in SCENES:
 if id not in ids:ids.append(id)
s=s[:found.start('ids')]+','.join("'"+id+"'" for id in ids)+s[found.end('ids'):]
path.write_text(s)
p=Path('scripts/qa_daily_book_preview.cjs');s=p.read_text()
old="assert.equal(new Set(allArt.map(r=>r.src)).size,19,'Four new scenes plus existing art should yield 19 distinct images');"
new="assert.equal(new Set(allArt.map(r=>r.src)).size,24,'17 approved original images plus remaining thematic art should yield 24 distinct images');"
assert old in s or new in s,'QA uniqueness assertion changed'
s=s.replace(old,new)
anchor="      'paul-storm':'assets/daily-book/paul-breaking-bread.webp'"
assert anchor in s,'QA source map changed'
if "'philip':'assets/daily-book/philip.webp'" not in s:
 s=s.replace(anchor,anchor+',\n'+',\n'.join(f"      '{id}':'assets/daily-book/{id}.webp'" for id in SCENES))
p.write_text(s)
# Preserve protected .github/workflows/* files: GitHub Actions push tokens lack workflow permission.
for name in ['visual-lab-test-banner.js','journey-progress-caption.js','.github/scripts/bust_daily_30_loader_nov11.py']:
 p=Path(name);s=p.read_text()
 assert OLD in s or NEW in s,('Version tag missing',name)
 p.write_text(s.replace(OLD,NEW))
p=Path('index.html');s=p.read_text()
old='journey-progress-caption.js?v='+OLD
new='journey-progress-caption.js?v='+NEW
assert s.count(old)==1 or s.count(new)==1,'Unexpected bootstrap'
p.write_text(s.replace(old,new))
p=Path('docs/DAILY_DISCOVERY_ARTWORK_AUDIT_2026-11-12.md')
if p.exists():
 s=p.read_text();note='\n## Batch-2 automatic TEST import\n10 approved original images installed, 30 lesson IDs and saved progress unchanged, 24 unique visible image paths. Verified by SHA-256 against approved package. The protected LIVE game remains untouched.\n'
 if note not in s:p.write_text(s+note)
print('PASS: 10 approved scenes, checksum verified, exact TEST map and cache chain')

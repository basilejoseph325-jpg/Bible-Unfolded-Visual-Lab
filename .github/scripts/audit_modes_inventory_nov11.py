#!/usr/bin/env python3
"""Read-only game/content audit. Never modify any runtime files."""
from pathlib import Path
import re,json,collections
src=Path('index.html').read_text(errors='replace')
parts=[]
for n in range(1,6):
 p=Path(f'bible_unfolded_core_part{n}.js')
 if not p.exists():continue
 txt=p.read_text(errors='replace')
 hit=re.search(r'__BU_STAGE41_CORE_PARTS__\[\d+\]\s*=\s*("(?:\\.|[^"\\])*");',txt)
 if hit:
  try:parts.append(json.loads(hit.group(1)))
  except Exception as e:print('Failed to decode',n,str(e))
core=''.join(parts)
print('CORE_LENGTH',len(core),'HTML_LENGTH',len(src))
terms=[
 'BU34_BANK','BU34_KEYS','bu34Quiz','CROSS_PACKS','TRAIL_PACKS','TRAIL_PACK',
 'BU3857_DATA','BU3857_BOOK','BU375','bu375Data','BU35_TOPICS',
 'BU35_MODES','BU35_THEMES','BU35_PACKS','WB36','wb36Setup',
 'BU3834_SCHOLAR','BU3834','BU37_GROUPS','BU37','behindName',
 'Behind the Name','BIBLE_BOOKS','FAMILY_WORSHIP','WORD_BUILDER',
 'CROSSWORD','GALLERY','STORY_ADVENTURE'
]
for term in terms:
 for source,label in [(core,'CORE'),(src,'HTML')]:
  hits=list(re.finditer(re.escape(term),source,re.I))
  if not hits:continue
  print('\nTERM',repr(term),'SOURCE',label,'HITS',len(hits))
  for h in hits[:3]:
   at=h.start()
   print(' OFFSET',at,repr(source[max(0,at-160):min(len(source),at+380)]))
# Direct definitions of arrays/objects; concise names only.
patterns=[
 r'\b(?:const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]{3,45})\s*=\s*(?:Object\.freeze\()?(\[|\{)',
 r'\b(?:window\.)?([A-Za-z_$][A-Za-z0-9_$]{3,45})\s*=\s*(?:Object\.freeze\()?(\[|\{)'
]
interesting=re.compile('(?:bank|pack|topic|chapter|episode|story|book|family|trivia|name|cross|quiz|level|discovery|gallery|riddle)',re.I)
found=[]
for pat in patterns:
 for m in re.finditer(pat,core):
  if not interesting.search(m.group(1)):continue
  found.append((m.group(1),m.start(),m.group(2)))
print('\nINTERESTING_DEFINITIONS',len(found))
for name,off,ch in found[:160]:
 print('DEF',name,'AT',off,'DELIM',ch,repr(core[off:off+100]))
# local extra JS levels and content modules
for p in [Path('experiments/word-trails-levels-12-30-v1.js'),Path('daily-discovery-insights-content-test-v1.js')]:
 if p.exists():
  txt=p.read_text(errors='replace')
  print('\nFILE',str(p),'bytes',len(txt))
  for pattern in [r'\b(?:const|let)\s+(\w+)\s*=\s*\[',r'\bid:\s*["\x27]([^"\x27]+)',r'\blevel:\s*\d+']:
   matches=list(re.finditer(pattern,txt))
   print('PATTERN',repr(pattern),'MATCHES',len(matches),'SAMPLES',[m.group(0) for m in matches[:8]])

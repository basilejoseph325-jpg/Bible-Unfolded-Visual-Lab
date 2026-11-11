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

# Focused machine-readable count pass, no code execution or writes.
print('\n=== PRIMARY PACK COUNTS ===')
for variable in ('CROSS_PACKS','TRAIL_PACKS','BU28_REVIEW','BU34_EXTRAS','BU3857_DATA'):
 match=re.search(r'\b(?:const|let|var)\s+'+re.escape(variable)+r'\s*=\s*',core)
 if not match:
  print('BANK_NOT_FOUND',variable);continue
 pos=match.end()
 try:
  data,_=json.JSONDecoder().raw_decode(core[pos:])
  if isinstance(data,list):
   print('PACK',variable,'COUNT',len(data))
   print('PACK_NAMES',[(item.get('title') or item.get('bank'),len(item.get('words',[]))) for item in data[:50] if isinstance(item,dict)])
  elif isinstance(data,dict):
   print('OBJECT_BANK',variable,'COUNT',len(data),'TOPICS',list(data.keys())[:100])
   print('TOPIC_COUNTS',{k:len(v) for k,v in data.items() if isinstance(v,(list,dict))})
 except Exception as e:
  print('BANK_NOT_JSON',variable,str(e)[:150])

print('\n=== OTHER MODE CONTENT ===')
for variable in ('BU35_TOPICS','BU35_STORY','BU384_NAMES','BU385_BIBLE_NAMES','BU34_NAMES','BU386_SECTIONS'):
 m=re.search(r'\b(?:const|let|var)\s+'+re.escape(variable)+r'\s*=\s*',core)
 if not m:print('UNFOUND',variable);continue
 sample=core[m.end():m.end()+20000]
 end=sample.find('\n};')
 if end>=0:sample=sample[:end]
 if sample.startswith('{'):
  # Key:value or key:{ name: ... } names are only approximate where data is not JSON.
  entries=re.findall(r'(?m)^\s*([a-zA-Z][-\w]*)\s*:',sample)
  if not entries:entries=re.findall(r'([a-zA-Z][-\w]*)\s*:\s*\{',sample)
  print('KEYS',variable,'COUNT',len(entries),'SAMPLE',entries[:100])
 elif sample.startswith('['):
  try:
   arr,_=json.JSONDecoder().raw_decode(sample)
   print('ARRAY',variable,len(arr))
  except Exception as e:print('ARRAY_NOT_JSON',variable,str(e)[:90])
 else:print('UNPARSED',variable,repr(sample[:80]))

for story in ('genesis_ep07','genesis_ep08','genesis_ep09','exodus-10'):
 print('STORY_ID',story,core.count(story))

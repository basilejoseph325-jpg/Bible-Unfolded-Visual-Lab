#!/usr/bin/env python3
"""Read-only native wallet inventory. Never modifies index.html or user files."""
from pathlib import Path
import re
s=Path('index.html').read_text(encoding='utf8')
lines=s.splitlines()
print('ROOT lines',len(lines),'bytes',len(s.encode()))
terms = [
 'bible-unfolded-rewards-v17','rewards-v17-recovery','wheel-ownership-v3825',
 'bu3824RefreshWallet','bu3824Save','bu3824MergeEntitlements',
 'const economy','let economy','var economy','economy =',
 'function award','function addCoins','function spend','function purchase',
 'function save','function buy','function earn','function grant',
 'function hint','function reveal',
 'localStorage.setItem(', 'localStorage.getItem(',
]
for term in terms:
 matches=[i for i,line in enumerate(lines) if term.lower() in line.lower()]
 print('\nTERM',repr(term),'count',len(matches))
 for i in matches[:14]:
  print('>',i+1,lines[i][:280].strip())
patt=re.compile(r'(?:function\s+|(?:const|let|var)\s+)(\w*(?:coin|economy|reward|wallet|purchase|hint|shop|spend|credit|save|point)\w*)',re.I)
out=[]
for i,line in enumerate(lines):
 if patt.search(line):out.append((i+1,line[:260].strip()))
print('\nDEFINITIONS',len(out))
for n,line in out[:190]:print('>',n,line)
print('\nKEY CONTEXTS')
for term in ['bible-unfolded-rewards-v17','function bu3824RefreshWallet','bu3824OwnedWheels','function setWheelTheme']:
 ix=[i for i,line in enumerate(lines) if term in line]
 for i in ix[:4]:
  print('CONTEXT',term,'at',i+1)
  for j in range(max(0,i-5),min(len(lines),i+17)):
   print(f'{j+1:05d}: {lines[j][:320]}')

print('\\nHEAD 75 LINES')
for i,line in enumerate(lines[:75]):print(f'{i+1:05d}: {line[:330]}')
print('\\nSCRIPT SOURCES')
sources = re.findall(r'<script[^>]+src=[\\"\\\']([^\\"\\\']+)', s, flags=re.I)
for source in sources[:200]:print('SRC',source)
print('\\nSCAN SOURCE FILES (wallet internals)')
needles=['BUJamesReturnLoopV1','bible-unfolded-rewards-v17','bu3824RefreshWallet','function canSpend','function spendCoins','function earnCoins','function creditCoins']
files=[p for p in Path('.').rglob('*.js') if '.git' not in p.parts and 'node_modules' not in p.parts]
for needle in needles:
 matches=[]
 for p in files:
  try:
   if p.stat().st_size>15_000_000:continue
   c=p.read_text(encoding='utf8')
  except Exception:continue
  if needle in c:
   lns=c.splitlines()
   indices=[i for i,ln in enumerate(lns) if needle in ln]
   matches.append((str(p),len(indices),[(i+1,lns[i][:280]) for i in indices[:5]]))
 print('SOURCE TERM',needle,':',matches[:15])
print('\\nFOCUSED NATIVE SAVE HELP')
for i in range(5920,6000):print(f'{i+1:05d}: {lines[i][:370]}')

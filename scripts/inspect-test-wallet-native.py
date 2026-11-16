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

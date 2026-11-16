#!/usr/bin/env python3
"""Read-only decoder for the existing native Stage41 JavaScript transport.
Never writes or regenerates the core; only prints small wallet excerpts."""
from pathlib import Path
import json,re
parts=[]
for n in range(1,6):
 text=Path(f'bible_unfolded_core_part{n}.js').read_text(encoding='utf8')
 prefix=f'window.__BU_STAGE41_CORE_PARTS__[{n-1}] = '
 pos=text.find(prefix)
 if pos<0:raise RuntimeError(f'Cannot locate core part {n}')
 chunk,_=json.JSONDecoder().raw_decode(text[pos+len(prefix):].lstrip())
 parts.append(chunk)
core=''.join(parts)
print('DECODED_NATIVE_CORE_BYTES',len(core.encode()),'LINES',core.count('\n')+1)
for needle in ['bible-unfolded-rewards-v17','function saveEconomy','function loadEconomy',
 'function bu3824RefreshWallet','function updateWallet','function canSpend',
 'function buyWheel','function setWheelTheme','window.__BU_STAGE41_CORE_PARTS__',
 'economy.coins','economy.earned']:
 found=[x.start() for x in re.finditer(re.escape(needle),core)]
 print('NEEDLE',needle,'COUNT',len(found))
 for p in found[:6]:
  print('NEAR',repr(core[max(0,p-550):p+1150]))
print('CORE INITIAL 800 CHARS',repr(core[:800]))

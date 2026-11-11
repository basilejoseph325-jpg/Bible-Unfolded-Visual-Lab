#!/usr/bin/env python3
"""TEST ONLY: mount isolated Word Builder and lives patches as versioned assets."""
from pathlib import Path
import re

p=Path('index.html')
html=p.read_text(encoding='utf-8')
head=re.search(r'</head\s*>',html,re.I)
assert head and len(re.findall(r'</head\s*>',html,re.I))==1,'expected unique HTML head'
assets=[
 ('bu-wb-score-layout-test-v1','<link id="bu-wb-score-layout-test-v1" rel="stylesheet" href="word-builder-score-layout-test-v1.css?v=20261110-wb-score-fix-v1">'),
 ('bu-james-life-direct-style-v2','<link id="bu-james-life-direct-style-v2" rel="stylesheet" href="james-return-loop-test-v1.css?v=20261110-recover-life-v2">'),
 ('bu-james-life-direct-script-v2','<script id="bu-james-life-direct-script-v2" defer src="james-return-loop-test-v1.js?v=20261110-recover-life-v2"></script>')
]
for id_,tag in assets:
    if f'id="{id_}"' not in html:
        html=re.sub(r'</head\s*>',lambda m:tag+'\n'+m.group(),html,count=1,flags=re.I)

# Some older builds load the Visual Lab banner dynamically rather than as an
# HTML script. Do not presume a tag exists or rewrite unrelated script markup.
pat=re.compile(r'(?P<lead><script\b[^>]*\bsrc\s*=\s*["\'][^"\']*?visual-lab-test-banner\.js)(?:\?[^"\']*)?(?P<tail>["\'])',re.I)
hits=list(pat.finditer(html))
assert len(hits)<=1,'ambiguous Visual Lab loader tags'
if hits:
    html=pat.sub(lambda m:m.group('lead')+'?v=20261110-wb-lives-layout-v2'+m.group('tail'),html,count=1)

for id_,_ in assets:
    assert html.count(f'id="{id_}"')==1,id_
assert 'trivia-stone-uniform-v7.css' in html,'must retain prior Trivia TEST stone fix'
p.write_text(html,encoding='utf-8')
print('TEST page: two stylesheet assets and James lives script installed directly; banner tag found:',bool(hits))

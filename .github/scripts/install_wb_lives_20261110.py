#!/usr/bin/env python3
"""TEST only. Load Word Builder score fix directly and refresh JS loader cache."""
from pathlib import Path
import re

p=Path('index.html')
html=p.read_text(encoding='utf-8')
asset='word-builder-score-layout-test-v1.css?v=20261110-wb-score-fix-v1'
tag='<link id="bu-wb-score-layout-test-v1" rel="stylesheet" href="'+asset+'">'
if 'id="bu-wb-score-layout-test-v1"' not in html:
    assert len(re.findall(r'</head\s*>',html,re.I))==1
    html=re.sub(r'</head\s*>',lambda m:tag+'\n'+m.group(),html,count=1,flags=re.I)

pat=re.compile(r'(?P<lead><script\b[^>]*\bsrc\s*=\s*["\'][^"\']*?visual-lab-test-banner\.js)(?:\?[^"\']*)?(?P<tail>["\'])',re.I)
assert len(pat.findall(html))==1,'expected exactly one Visual Lab loader tag'
html=pat.sub(lambda m:m.group('lead')+'?v=20261110-wb-lives-layout-v2'+m.group('tail'),html,count=1)
assert html.count('id="bu-wb-score-layout-test-v1"')==1
assert 'visual-lab-test-banner.js?v=20261110-wb-lives-layout-v2' in html
p.write_text(html,encoding='utf-8')
print('TEST page updated: Word Builder direct CSS and fresh James lives script loader')

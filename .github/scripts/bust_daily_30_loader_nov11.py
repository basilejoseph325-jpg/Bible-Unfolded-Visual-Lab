#!/usr/bin/env python3
"""Update only the external TEST bootstrap version in the giant HTML page.
The old bootstrap often stayed cached on Samsung Android after catalog changes.
Existing game state and the rest of index.html remain byte-for-byte unchanged.
"""
from pathlib import Path
import re
p=Path("index.html")
html=p.read_text(encoding='utf-8')
pat=re.compile(r'(?P<stem><script\b[^>]*\bsrc\s*=\s*["\x27][^"\x27]*?journey-progress-caption\.js)(?:\?[^"\x27]*)?(?P<end>["\x27])',re.I)
matches=list(pat.finditer(html))
assert len(matches)==1, f"Expected exactly one external Journey/bootstrap script tag; got {len(matches)}"
before=matches[0].group(0)
after=matches[0].group("stem")+"?v=20261111-book-switcher-v7"+matches[0].group("end")
if before==after:
 print("Bootstrap already versioned for Daily 30")
else:
 html=html.replace(before,after,1)
 assert html.replace(after,before,1)==p.read_text(encoding='utf-8'), 'Unexpected source mutation outside the bootstrap'
 p.write_text(html,encoding='utf-8')
 print("TEST only: refreshed Journey -> TEST banner -> Daily content cache chain")
assert html.count(after)==1

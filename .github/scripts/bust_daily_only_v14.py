#!/usr/bin/env python3
"""TEST-only minimal index.html cache update to remove player-facing preview browser.
Never edits LIVE, other modes, player state, or any HTML markup.
"""
from pathlib import Path
import re
p=Path("index.html")
html=p.read_text(encoding="utf-8")
pat=re.compile(r'(?P<stem><script\b[^>]*\bsrc\s*=\s*["\x27][^"\x27]*?journey-progress-caption\.js)(?:\?[^"\x27]*)?(?P<end>["\x27])',re.I)
matches=list(pat.finditer(html))
assert len(matches)==1, f"Expected exactly one Journey bootstrap script, got {len(matches)}"
old=matches[0].group(0)
stem=matches[0].group("stem")
ending=matches[0].group("end")
new=stem+"?v=20261113-daily-only-v14"+ending
assert old==new or "20261113-book-art-first-v13" in old, "Unexpected concurrent Daily bootstrap revision"
assert html.count(old)==1
updated=html.replace(old,new,1)
assert updated.replace(new,old,1)==html, "Unexpected modification beyond one bootstrap tag"
if updated!=html:
    p.write_text(updated,encoding="utf-8")
    print("PASS: TEST original index changed only external journey script version v12 -> v13")
else:
    print("PASS: TEST artwork-first bootstrap already v13")

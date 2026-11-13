#!/usr/bin/env python3
"""Bump only the root TEST bootstrap version so Android receives approved Word Trails source-checked Word Trails discoveries.
Never edit Word Trails gameplay, saved data, LIVE or unrelated index markup.
"""
from pathlib import Path
import re
p=Path("index.html")
html=p.read_text(encoding="utf-8")
pat=re.compile(r'(?P<stem><script\b[^>]*\bsrc\s*=\s*["\x27][^"\x27]*?journey-progress-caption\.js)(?:\?[^"\x27]*)?(?P<end>["\x27])',re.I)
matches=list(pat.finditer(html))
assert len(matches)==1, f"Expected one journey bootstrap tag, got {len(matches)}"
old=matches[0].group(0)
new=matches[0].group("stem")+"?v=20261113-wt-scripture-v17"+matches[0].group("end")
assert old==new or "20261113-wt-audio-owner-v16" in old, "Unexpected previous bootstrap version: "+old
assert html.count(old)==1
updated=html.replace(old,new,1)
assert updated.replace(new,old,1)==html, "Unexpected HTML modification"
if updated!=html:p.write_text(updated,encoding="utf-8")
print("PASS: TEST root loader changed in exactly one script query (v16 -> v17)")

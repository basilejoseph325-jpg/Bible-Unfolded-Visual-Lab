#!/usr/bin/env python3
"""TEST only: change exactly the Word Trails bootstrap query for the reviewed v18 pack.
No changes to HTML markup, saved data, wallet, game logic, or LIVE repo.
"""
from pathlib import Path
import re

p = Path("index.html")
html = p.read_text(encoding="utf-8")
pat = re.compile(r'(?P<stem><script\b[^>]*\bsrc\s*=\s*["\x27][^"\x27]*?journey-progress-caption\.js)\?v=(?P<version>[^"\x27]*)(?P<end>["\x27])', re.I)
matches = list(pat.finditer(html))
assert len(matches) == 1, f"Expected exactly one TEST bootstrap tag, found {len(matches)}"
match = matches[0]
assert match.group("version") in {"20261113-wt-scripture-v17", "20261113-wt-editorial-v18"}, "Unexpected source version: " + match.group("version")
old = match.group(0)
new = match.group("stem") + "?v=20261113-wt-editorial-v18" + match.group("end")
updated = html[:match.start()] + new + html[match.end():]
assert updated.replace(new, old, 1) == html, "HTML changed outside one script query!"
if updated != html:
    p.write_text(updated, encoding="utf-8")
print("PASS: Root TEST loader exactly one v17 -> v18 script query; LIVE untouched")

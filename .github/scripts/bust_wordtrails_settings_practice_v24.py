#!/usr/bin/env python3
"""TEST only: change exactly the Word Trails bootstrap query for the TEST-safe Settings checkpoint practice link v24.
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
assert match.group("version") in {"20261113-wt-audio-v23", "20261113-wt-settings-practice-v24"}, "Unexpected source version: " + match.group("version")
old = match.group(0)
new = match.group("stem") + "?v=20261113-wt-settings-practice-v24" + match.group("end")
updated = html[:match.start()] + new + html[match.end():]
assert updated.replace(new, old, 1) == html, "HTML changed outside one script query!"
if updated != html:
    p.write_text(updated, encoding="utf-8")
print("PASS: Root TEST loader exactly one audio v23 -> Settings practice v24 script query; LIVE untouched")

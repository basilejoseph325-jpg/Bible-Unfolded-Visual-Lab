#!/usr/bin/env python3
"""TEST HTML only: harden Story Adventure part 3/5 cache keys for Android Chrome.
Native Story Episode 10 first illustrated scene was deployed but old unversioned
core files could remain cached; GitHub Pages sends Cache-Control max-age=600.

Don't touch rewards, locks, saved data, any other HTML/gameplay, or LIVE.
"""
from pathlib import Path
import re

file=Path("index.html")
html=file.read_text(encoding="utf8")
if not (11_000_000 <= len(html) <= 14_000_000):
    raise SystemExit("Unexpected TEST native HTML size, refusing unsafe patch")
versions={
  "bible_unfolded_core_part3.js":"gen10-questions-hints-20261114-d01-v1",
  "bible_unfolded_core_part5.js":"gen10-photos-20261114-d01-v1"
}
for name, v in versions.items():
    old=f'<script src="{name}"></script>'
    new=f'<script src="{name}?v={v}"></script>'
    if html.count(old)!=1:
        if html.count(new)==1:
            print("Already cache-versioned: "+name)
            continue
        raise SystemExit("Expected exactly one unversioned native core tag: "+name)
    html=html.replace(old,new,1)
    if html.count(new)!=1:
        raise SystemExit("Cache version missing after edit: "+name)
assert html.count('bible_unfolded_core_part1.js')==1
assert html.count('bible_unfolded_core_part2.js')==1
assert html.count('bible_unfolded_core_part4.js')==1
assert html.count('bu-daily-early-gate-v1')>=1
assert html.count('bible_unfolded_core_part3.js?v=gen10-questions-hints-20261114-d01-v1')==1
assert html.count('bible_unfolded_core_part5.js?v=gen10-photos-20261114-d01-v1')==1
# Strict original Story HTML must keep all original episode/lock processing.
assert 'bu3857Hint=function(){' in html
file.write_text(html,encoding="utf8")
print("PASS_GENESIS10_CHROME_CACHE_KEYS two original native files cache-busted; no game data touched")

#!/usr/bin/env python3
"""TEST only: load uniform Bible Trivia stone paint directly from page HTML."""
from pathlib import Path
import re

p = Path("index.html")
html = p.read_text(encoding="utf-8")
original = html
id_ = "bu-trivia-uniform-v7-css"
tag = ('<link id="' + id_ + '" rel="stylesheet" '
       'href="trivia-stone-uniform-v7.css?v=20261110-stone-stable-v7">')

assert html.lower().count("</head>") == 1, "Cannot safely locate one HTML head closing tag"
if id_ not in html:
    html = re.sub(r"</head\s*>", lambda m: tag + "\n" + m.group(), html,
                  count=1, flags=re.I)

# Force a fresh download of the existing dynamic component loader on Android.
# Changes ONLY its HTML script src if the expected tag is present.
pattern = re.compile(r'(?P<start><script\b[^>]*\bsrc\s*=\s*["\'][^"\']*?journey-progress-caption\.js)(?:\?[^"\']*)?(?P<end>["\'])', re.I)
matches = list(pattern.finditer(html))
assert len(matches) == 1, f"Expected exactly one journey-progress-caption script, found {len(matches)}"
html = pattern.sub(lambda m: (m.group("start") +
                   "?v=20261110-trivia-uniform-v7-" + "7" + m.group("end")), html,
                   count=1)

assert html.count(id_) == 1
assert html.count("trivia-stone-uniform-v7.css") == 1
assert 'journey-progress-caption.js?v=20261110-trivia-uniform-v7-7' in html
p.write_text(html, encoding="utf-8")
print("TEST Trivia uniform v7 HTML installed; changed bytes:", len(html) - len(original))

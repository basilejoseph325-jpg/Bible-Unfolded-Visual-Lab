#!/usr/bin/env python3
"""Root-cause correction for Episode 10's 'Puzzle unavailable' in native TEST.

Genesis Episodes 7-9 render the existing BU_HQ_WORDS word-connect wheel. The
Episode 10 native chapter was registered without those answer entries. Keep
that same engine, save keys, wallet, progress, markup, and older 30 answers.
Patch only the serialized owning core part, with explicit uniqueness guards.
"""
from pathlib import Path
import json
import re

src_file = Path("story-adventure-content/genesis-episode10-wordwheel-test-v1.json")
src = json.loads(src_file.read_text(encoding="utf-8"))
words = src["words"]
expected = [f"g10-d{i:02d}" for i in range(1, 11)]
if list(words) != expected:
    raise SystemExit("Episode 10 answer IDs must be g10-d01 through g10-d10 in order")
for id_, value in words.items():
    if set(value) != {"clue", "answer", "explanation", "hint1", "hint2", "basis", "reference"}:
        raise SystemExit(f"Unexpected source fields: {id_}")
    if not re.fullmatch(r"[A-Z]{3,10}", value["answer"]):
        raise SystemExit(f"Invalid wheel letters: {id_}")
    if not all(isinstance(value[k], str) and len(value[k]) >= 6 for k in
               ("clue", "explanation", "hint1", "hint2", "reference")):
        raise SystemExit(f"Missing spoken clues or hints: {id_}")

files = [Path(f"bible_unfolded_core_part{i}.js") for i in range(1, 6)]
parts = []
for f in files:
    wrapper = f.read_text(encoding="utf-8")
    match = re.search(r'(__BU_STAGE41_CORE_PARTS__\[\d+\] = )(".*")(\s*;)', wrapper, re.S)
    if not match:
        raise SystemExit(f"Unexpected native serialized wrapper: {f.name}")
    parts.append({"file": f, "wrapper": wrapper, "match": match,
                  "body": json.loads(match.group(2))})

anchor = "let buHQPath=[];"
owners = [part for part in parts if anchor in part["body"]]
if len(owners) != 1:
    raise SystemExit(f"Expected exactly one HQ wheel owner, found {len(owners)}")
part = owners[0]
body = part["body"]
if body.count(anchor) != 1 or body.count("const BU_HQ_WORDS = ") != 1:
    raise SystemExit("Existing native word wheel changed; do not patch speculatively")
if "Object.assign(BU_HQ_WORDS,{\"g10-d01\"" in body:
    raise SystemExit("Episode 10 wheel entries already installed; no second injection")
if any(f'"{key}":{{"clue"' in body for key in expected):
    raise SystemExit("Episode 10 word answer already present; refuse duplicate edit")

# Validate older original word answers are still present, and are not rewritten.
start = body.index("const BU_HQ_WORDS = ") + len("const BU_HQ_WORDS = ")
old_words, end = json.JSONDecoder().raw_decode(body[start:].lstrip())
if len(old_words) != 30 or any(k in old_words for k in expected):
    raise SystemExit(f"Original 30-word Story inventory drift: {len(old_words)}")
old_ids = set(old_words)
expected_old = {f"g{ep:02d}-d{i:02d}" for ep in range(7,10) for i in range(1,11)}
if old_ids != expected_old:
    raise SystemExit("Original Genesis Episode 7-9 word ids changed")

new_records = {id_: {k: value[k] for k in
    ("clue", "answer", "explanation", "hint1", "hint2", "basis")}
    for id_, value in words.items()}
insertion = ("/* Genesis Episode 10: maintain original chapter word-connect experience, "
             "no separate game. */\n" +
             "Object.assign(BU_HQ_WORDS," +
             json.dumps(new_records, ensure_ascii=False, separators=(",", ":")) +
             ");\n")
body = body.replace(anchor, insertion + anchor, 1)
assert body.count("Object.assign(BU_HQ_WORDS,") == 1
assert body.index(insertion) < body.index("function buHQWordBoard()")

m = part["match"]
rebuilt = (part["wrapper"][:m.start(2)] +
           json.dumps(body, ensure_ascii=True) +
           part["wrapper"][m.end(2):])
part["file"].write_text(rebuilt, encoding="utf-8")
print("PASS_EP10_WORD_WHEEL_PATCH",part["file"].name,"10 new entries, original 30 unchanged")

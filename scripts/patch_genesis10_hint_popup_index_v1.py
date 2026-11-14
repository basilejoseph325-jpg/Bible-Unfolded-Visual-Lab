#!/usr/bin/env python3
"""Exact, fail-closed HTML patch: chapter 10 needs thinking clues in the 
native hint *popup wrapper* (which overrides the underlying function).
Other modes and Genesis 1–9 must remain byte-for-byte behaviorally unchanged.
"""
from pathlib import Path

file=Path("index.html")
s=file.read_text(encoding="utf8")
if len(s)<9_000_000:
    raise SystemExit("Unexpected full original TEST index size")
needle="bu3857Hint=function(){"
start=s.find(needle)
if start<0 or s.find(needle,start+1)>=0:
    raise SystemExit("Hint wrapper missing or duplicated")
end=s.find(" \n };\n})();\n</script>",start)
if end<0:
    # Prefer bounded section through IIFE end instead of guessing global JS.
    end=s.find("\n };\n})();\n</script>",start)
if end<0 or end-start>3800:raise SystemExit("Hint wrapper boundary changed")
section=s[start:end]
def exactly(before,after):
    global section
    if section.count(before)!=1:
        raise SystemExit(f"Expected exact one native wrapper fragment; found {section.count(before)}: {before[:90]}")
    section=section.replace(before,after,1)

exactly("const max=entry?2+entry.answer.length:3;",
  "const ep10=st.book==='genesis_ep10'&&!!entry;\n  const max=ep10?3:(entry?2+entry.answer.length:3);")
exactly("if(n===2)return entry.hint2||'Consider the details in the passage.';",
  "if(n===2)return entry.hint2||'Consider the details in the passage.';\n    if(ep10&&n===3)return entry.hint3||entry.hint2;")
exactly("return entry?(n===1?15:n===2?20:25):(n===1?15:30);",
  "return ep10?(n===1?15:25):(entry?(n===1?15:n===2?20:25):(n===1?15:30));")
exactly("if(n>=2)lines.push(hintText(n));",
  "if(ep10){if(n>=2)lines.push(hintText(2));if(n>=3)lines.push(hintText(3));}\n   else if(n>=2)lines.push(hintText(n));")
exactly("if(entry&&next>=3)buHQHintLetters[d.id]=next-2;",
  "if(entry&&next>=3&&!ep10)buHQHintLetters[d.id]=next-2;")
s=s[:start]+section+s[end:]
if s.count("const ep10=st.book==='genesis_ep10'&&!!entry;")!=1:
    raise SystemExit("Installed hint popup gate count invalid")
assert s.count(needle)==1
assert "BU_HQ_WORDS[d.id]" in section
assert "bu3857Hint=function(){" in section
file.write_text(s,encoding="utf8")
print("PASS_NATIVE_GENESIS10_POPUP_SCOPED: no paid letter reveals; exactly three meaningful hints")

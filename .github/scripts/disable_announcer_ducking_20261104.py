#!/usr/bin/env python3
"""Remove announcer-triggered soundtrack ducking from packed core part 5.
Keep voice, music switching, user volume, fade control, and SFX untouched."""
from pathlib import Path
import re,json
p=Path("bible_unfolded_core_part5.js")
raw=p.read_text()
m=re.search(r'(__BU_STAGE41_CORE_PARTS__\[\d+\] = )(".*")(;)',raw,re.S)
assert m, "Unexpected packed core format"
src=json.loads(m.group(2))
old1="const goal=bu381Voice.active?0.30:1;"
new1="const goal=1; // Announcer voice no longer lowers background music."
old2="const duckGoal=(canPlay&&bu381Voice.active)?0.32:1;"
new2="const duckGoal=1; // Preserve the user's selected soundtrack level during speech."
for old,new in [(old1,new1),(old2,new2)]:
 assert src.count(old)==1,(old,src.count(old))
 assert new not in src
 src=src.replace(old,new,1)
# The two duck controllers are still intact structurally so fade/music switching
# and audio driver initialization retain their previous behavior. They now target 1.
assert "bu381Voice.duck+= (goal-bu381Voice.duck)*0.24;" in src
assert "const desired=selected?baseVolume*bu3818CurrentDuck:0;" in src
assert "const baseVolume=Math.max(0,Math.min(1,musicVolume/100*.72));" in src
assert "if(!selected&&!player.paused)player.pause();" in src
# Patch original packed JSON text in place to avoid reserializing the 4.5MB
# bundle or changing its encoding, embedded clips, whitespace, or unrelated data.
updated=raw
for old,replacement in [(old1,new1),(old2,new2)]:
 assert updated.count(old)==1,(old,updated.count(old))
 updated=updated.replace(old,replacement,1)
assert len(updated)-len(raw)==sum(len(replacement)-len(old) for old,replacement in [(old1,new1),(old2,new2)])
assert json.loads(re.search(r'(__BU_STAGE41_CORE_PARTS__\[\d+\] = )(".*")(;)',updated,re.S).group(2))==src
p.write_text(updated)
print('PASS: both announcer duck multipliers neutralized; playback and volumes preserved')

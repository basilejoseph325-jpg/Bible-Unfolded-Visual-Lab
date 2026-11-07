# Word Trails NEXT — Progressive Bible Boards, Visual Lab V7

**Status:** Test-only design, 7 November 2026. **Live game untouched. Audio and haptics frozen.**

## Rule agreed
- The first eight approved puzzles keep **5×5 large/chunky tiles**; do not sacrifice legibility for an arbitrary single tile dimension.
- The engine now supports **5×5, 6×6 and 7×7** boards. Choose the *smallest* grid that accommodates the actual words and intersections. Recalculate the tile size for each phone's width and usable viewport height; keep the letter wheel and header clear; no gameplay scrolling.
- Later puzzles may have 7-letter wheels and 6- or 7-letter required words; progressively introduce harder layouts. Do not shrink tiles when the current puzzle still fits with the larger approved ones.
- A good Word Trails level combines enjoyable everyday English words with **multiple actual Scripture-related words visibly required on the crossword**, plus optional hidden glowing-star Bible words. There is no rule that every answer must be religious.
- Required Bible words are distinguished subtly after being solved and listed in the existing gold-star Scripture discovery scroll, with appropriate NWT 2013 verses and **JW.org only** links. Do not expose the unrevealed crossword answers in clue headers.
- **Do not touch the sound design**, levels, audio mix, sliders, or vibration unless expressly requested in the future. Existing victory fanfare remaster is locked during this progression pass.

## Added test levels
9. **Samuel & Saul**, 6×6, 6-letter wheel (`SAMUEL`): Crossword `SAMUEL`, `SAUL`, `MALE`, `SUM`, `MULE`. Board Bible words `SAMUEL` and `SAUL` (1 Samuel 3:4-10; 10:1). Hidden Scripture finds `ELAM` (Genesis 10:22) and `SEA` (Exodus 14:21-22).
10. **Goliath**, 7×7, 7-letter wheel (`GOLIATH`): Crossword `GOLIATH`, `GATH`, `GLOAT`, `TAIL`, `ALTO`, `HALO`. Board Bible words `GOLIATH` and `GATH` (1 Samuel 17:4). Hidden `LOT` (Genesis 13:5-11) and `GOAT` (Leviticus 16:5).
11. **Abraham**, 7×7, 7-letter wheel (`ABRAHAM`): Crossword `ABRAHAM`, `ABRAM`, `HAM`, `ARM`, `RAM`. Bible answers `ABRAHAM`, `ABRAM`, `HAM`, `RAM` (Genesis 17:5; 9:18; 22:13). Hidden `MARAH` (Exodus 15:23-25) and `BAR` (Judges 16:3).

The first eight puzzles are untouched. Across eleven puzzles: **23 hidden Scripture finds plus 8 newly added Bible crossword answers**. Unlocks, prior test coins, completed levels, and star progress are preserved with a compatible localStorage extension.

## Implementation
- `experiments/word-trails-next-v1.js`: per-level size, source-verified answer metadata, validated grid placements, editable Level 9–11 packs, persistence of Bible crossword finds.
- `experiments/word-trails-next-v1.css`: responsive tile geometry per grid size and warm-gold glow for completed Bible crossword answers.
- `experiments/word-trails-next-v1.html`: V7 asset refresh.
- `.github/workflows/qa-word-trails-next-v1.yml`: complete 11-level playthrough, all hidden discoveries, crossword Bible words, coins and replay safeguards, mobile viewport geometry.

## Subsequent content QA
- Test on Samsung Android and Safari/iPhone for tiny screens, especially the 7x7 boards, tap targets and text readability.
- Continue increasing level variety and balancing Bible answer frequency without sacrificing real-world word validity.
- Need fuller bonus dictionary validation and deeper JW.org source review before a live release. Use original art and reusable game-owned assets only.

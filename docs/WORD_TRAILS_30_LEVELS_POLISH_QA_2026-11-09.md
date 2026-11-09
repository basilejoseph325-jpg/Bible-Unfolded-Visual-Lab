# Word Trails NEXT — 30-Level Polish & Content Quality Pass
**Date:** November 9, 2026  
**Branch/site:** Bible-Unfolded-Visual-Lab, TEST ONLY. **LIVE remains protected.**

## Implemented
1. **30-level foundation retained:** 11 original levels + 19 new levels. Larger 6×6 and 7×7 grids remain responsive; original first 11 level definitions are preserved.
2. **Visual progression:** 16 distinct Bible-book landscape assets across levels 12–30; scenic thumbnails on all 30 level-map entries; six five-level chapters with named headers.
3. **Milestone rewards:** Six distinct Journey Seals at levels 5, 10, 15, 20, 25, and 30, shown on the completed-level modal and level map. Existing +60 test coins on these milestones retained. The seal status is derived from the existing completed-level state, avoiding another currency or wallet. Milestone rewards cannot mint twice on replay.
4. **Bible in the actual crossword:** 47 Bible-themed crossword answers across all 30 levels; 61 secret Bible-word discoveries with a JW.org/NWT reference field. Level 12–30 source fields, exact word placement and link format are validated automatically.
5. **Playable bonus words:** Removed every conflicting/redundant authoring entry from the 19 new level banks; now **113 distinct playable entries across those levels** (words can repeat between different levels). Built a runtime priority-safe bonus bank excluding crossword and Bible words. Early level 12 intentionally has two high-quality playable bonuses and a **two-word satchel**; the other new levels have at least three. No fake third word and no repeat bonuses.
6. **No wheel/audio regression:** Ocean Glow, native announcers, swipe/tap sounds, settings and approved wheel sizing are unchanged. Sound levels were not adjusted in this pass.

## Permanent QA gate
Run: `node scripts/word_trails_quality_gate.mjs`. GitHub Actions runs the same gate automatically when puzzle content changes.

Hard failures include: invalid rack / impossible word, out-of-grid answer, crossing letter mismatch, same-direction overlapping crossword answers, disconnected puzzles, duplicate answers, invalid bonus bank, a new-level bonus reserved by a Bible word or crossword answer, missing scenery file, fewer than two biblical crossword answers on levels 12–30, missing/incomplete JW.org/NWT URL and source fields, or scene diversity below the 12-illustration minimum.

**Automated content results:** 30 levels; 19 new; 47 visible Bible answers; 61 hidden Bible discoveries; 113 genuine new-level bonuses; 16 distinct new-level backgrounds; zero blocking structural errors.

**Browser regression results:** All 30 puzzles can be completed; voice preview, sound panel, existing purchased wheel effects, first-level gameplay, bonus satchels, Bible discoveries, six milestone seals, level-map imagery, replay protection, and five phone-size viewport checks passed. Separate 390×705 phone screenshots were reviewed for the win screen and scenic map; the Next Level button remained usable.

## Remaining editorial QA
- **Resolved in TEST (November 9):** Every level 12–30 crossword was re-laid out without changing any answer words. There are now zero unrelated touching-tile pairs in those 19 boards. The automated QA gate now rejects any recurrence on new levels (legacy 1–11 layouts are preserved).
- Legacy levels 1–11 contain a few duplicate/reserved bonus words in their historical source text. The runtime safely de-duplicates and removes reserved bonuses, and the linter reports them without changing the approved first 11 layouts.
- **Source progress, not final human signoff:** all 77 new-level Bible-answer and hidden-discovery entries now pass an exact cited-book/chapter URL match. Wording was corrected for Sarah, Samson, Psalms, Moses' rod, Leah (three levels), and the Hannah discovery, with targeted JW.org/NWT passage checks. This automated check is not proof that each of the 77 wordings has been independently reviewed against its full passage; James/owner editorial signoff remains outstanding.
- **Human device playtesting remains required:** the owner's Samsung Android and James's iPhone Safari, especially longer puzzles, voice playback, 7×7 tile readability and the new reward modal.

## Started: mandatory shared-core integration
- Completed first-pass ownership inventory in `WORD_TRAILS_SHARED_CORE_INTEGRATION_AUDIT_2026-11-09.md`, covering prototype progress, test currency, music/SFX, settings, voice, menu, wallet, wheel ownership and effects.
- Loaded a **read-only** `word-trails-shared-core-boundary-v1.js` in TEST. Its migration preview quarantines TEST coins and explicitly cannot update saves or modify the real wallet. A dedicated automated zero-write check is part of the quality workflow.
- This is the START of integration, not the completed connection to the authoritative live shared core. The pre-live release checklist remains binding.

## Release rule
**NOT APPROVED FOR LIVE.** The mandatory shared-core integration, migration, and rollback checklist in [WORD_TRAILS_PRE_LIVE_SHARED_CORE_RELEASE_GATE.md](WORD_TRAILS_PRE_LIVE_SHARED_CORE_RELEASE_GATE.md) remains binding. Do not promote this prototype to LIVE without explicit owner approval.

## Key files
- `experiments/word-trails-next-v1.js` — puzzle gameplay, runtime bonus bank, scenic chapter map, Journey Seals
- `experiments/word-trails-next-v1.css` — milestone/level-map styles
- `experiments/word-trails-levels-12-30-v1.js` — curated puzzle library
- `scripts/word_trails_quality_gate.mjs` — repeatable puzzle-content linter
- `.github/workflows/qa-word-trails-puzzle-quality.yml` — automatic static QA
- `.github/workflows/qa-word-trails-30-voice.yml` — end-to-end gameplay, rewards, announcers, and mobile regressions
- `.github/workflows/qa-word-trails-visual-polish.yml` — phone-screen screenshot checks

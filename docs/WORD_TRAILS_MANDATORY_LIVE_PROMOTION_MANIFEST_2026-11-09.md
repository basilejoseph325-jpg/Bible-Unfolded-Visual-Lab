# MANDATORY FUTURE LIVE PROMOTION — Word Trails NEXT and all shared integrations
**Owner reaffirmation: November 9, 2026, during this chat.**

## Non-negotiable destination
All approved Word Trails NEXT improvements and shared-core integrations developed in **Bible-Unfolded-Visual-Lab (TEST)** during this chat are intended to be promoted into the existing **Story-Trails (LIVE)** game **after the owner's physical testing, the applicable safety/QA gates, and the owner's explicit authorization for that LIVE promotion**. Do not treat a successful TEST deployment as final delivery. Do not forget the transfer or leave only selected features behind.

## Exact promotion scope — track each item
- New Bible Word Trails NEXT crossword mode, 30 levels, authored Bible discoveries, bonus words, chapter map, and Journey Seals, subject to remaining item-level editorial approval.
- Real Bible Unfolded native menu and navigation host, replacing the standalone imitation menu for published entry and direct links; maintain main homepage and all other native modes.
- Native Settings, shared music/effects and original announcer/voice preferences, while preserving Word Trails' approved per-mode SFX and music behavior.
- Authoritative wallet and purchase-entitlement ownership, purchased/equipped wheel styles including full Ocean Glow trace/mist/glitter and protected previously purchased wheels.
- Shared save/export/import integration with legacy backup compatibility, versioned migration, import preview, rollback, completed puzzles, in-progress board, bonuses, and reward replay protection.
- Android/in-game Back, browser Back, return to homepage, direct link and refresh-resume behavior, one-viewport mobile layout.
- All bug fixes, test corrections, and compatibility improvements made in this chat that materially affect that integrated gameplay. Review the commit range/changed-file diff before promotion so no required dependency is omitted.

## Evidence already produced in TEST (not a LIVE certificate)
- Native menu/settings/voice host, direct links, Back/refresh: QA `42706216915` PASS and later reruns.
- Coordinated version-2 TEST save export/import, legacy format, partial crossword resume, corrupt-file rejection, rollback, no duplicate imports: QA `42705942269` PASS and later reruns.
- Cross-mode homepage/browser smoke for portrait/landscape: QA `42723194432` PASS after recognizing the original Word Builder's nonstandard screen.
- Word Trails game levels, rewards, and wheel checks are tracked by `qa-word-trails-next-v1.yml`, `qa-word-trails-30-voice.yml`, `qa-word-trails-native-wheel-v1.yml`, and `qa-word-trails-puzzle-quality.yml`. Re-run from the final frozen candidate rather than relying on earlier historical runs.
- TEST checkpoint branches: `checkpoint/word-trails-rewards-before-native-menu-20261109` and `checkpoint/pre-wordtrails-save-coordinator-20261109`.

## Still required before final LIVE promotion
1. Verify current TEST published deployment, browser load paths and complete automated release-candidate checks. Audit the **current LIVE** architecture and code diff first; do not copy TEST `index.html` or overwrite the LIVE's approved modes.
2. Create a **restorable, verified LIVE backup/checkpoint** and a frozen TEST release candidate. Define the safe, selective LIVE integration and protect all existing user progress and owner-approved design/audio.
3. Important storage fact: LIVE and Visual Lab both run under `https://basilejoseph325-jpg.github.io/` in different paths; **browser localStorage is shared on the same device**. Do not blindly replace LIVE wallet/ownership/voice keys with test data or convert any Word Trails TEST coins into real Insight Tokens. Carefully migrate ONLY appropriate validated gameplay records, with idempotent replay protection and an explicit user-controlled procedure.
4. Complete the independent scripture/content review for the new levels (77 newer-level entries still awaiting full human editorial signoff) and verify no content changes violate the permanent Headquarters rulebook or James's addendum.
5. Obtain owner's Samsung Android hands-on feedback and James's physical iPhone Safari feedback (sounds, voices, menu, wheel gestures/effects, no scroll, saved level, rewards).
6. Only after explicit owner approval for the specific LIVE release, promote all approved changes together with applicable adapters, validate LIVE deployment and rendered UI, and keep immediate rollback available.

## Instruction to future chats
When the owner says "next", "continue", or "move to live", read this manifest and `BIBLE_UNFOLDED_RULEBOOK_START_HERE.md`, inspect current TEST/LIVE commits, continue the pending release gates, and do not ask the owner to repeat what needs promoting. A prior conversation going read-only does not cancel this requirement.

**LIVE promotion status: PENDING owner physical QA, final compatibility/release checks, and explicit LIVE authorization.** 

## Read-only current LIVE vs TEST core audit (November 9, 2026)
- Verified GitHub blob hashes in Story-Trails LIVE and Bible-Unfolded-Visual-Lab TEST: **all five** `bible_unfolded_core_part1.js` through `bible_unfolded_core_part5.js` are byte-identical as of this inspection. This supports a thin shared-core adapter approach; it does NOT authorize overwriting LIVE core or infer future versions stay identical.
- The two `index.html` files differ (LIVE 11,725,984 bytes; TEST 11,728,969 bytes). **Never replace LIVE index wholesale with TEST index.** Inspect its small approved changes and add only those actually needed for the integrated release.
- TEST-only current entry/integration files include `word-trails-native-shell-v1.js`, `word-trails-next-launcher.js`, `bu-platform-rewards-v1.js`, `bu-platform-saves-v2.js`, `experiments/word-trails-next-v1.{html,js,css}`, `experiments/word-trails-levels-12-30-v1.js`, menu/voice/Settings/audio/wheel adapters, and supporting CSS/assets. The `visual-lab-test-banner.js` TEST identity ribbon and diagnostic/TEST-specific hardcoded behavior are NOT general-purpose LIVE features.
- LIVE currently has older Word Trails styles and scripts (e.g. `word-trails-cinematic.css` and `word-trails-starfield-v3-test.js`), so adding Word Trails NEXT must preserve them unless the owner explicitly approves replacement. Confirm whether the LIVE original Word Trails remains available for any legacy progress or compatibility need.
- This was a **read-only repository hash and file inventory**, NOT a deployed compatibility run, a safe migration dry-run on real user data, or a LIVE release.

## Exact file-dependency checklist before LIVE promotion

**CURRENT STATUS OVERRIDE — November 13/14:** [Read-only file delta recheck](WORD_TRAILS_LIVE_DELTA_RECHECK_2026-11-13.md) updates old November 9 counts: 8 identical, 10 different, 3 absent of 21, homepage SVG is already in LIVE. The next paragraph is a historical snapshot, not current inventory. No LIVE changes or authorization implied.
The newer read-only comparison now has a separate [Word Trails LIVE File Delta Manifest](WORD_TRAILS_LIVE_FILE_DELTA_MANIFEST_2026-11-09.md) with **21 tracked code/adapter dependencies, 20 currently absent from LIVE, one differing adapter**, and the required `assets/ui/word-trails-home-next-crossword-v1.svg` homepage overlay. It distinguishes TEST-only modules that require adaptation from safe asset dependencies. Consult the file before any LIVE copy; revalidate all hashes against the frozen release candidate.

## Additional TEST content work after initial shared-core integration (November 9)
- **Carry the revised 30-level source bank into LIVE with the rest of Word Trails NEXT**, not an older source snapshot: `experiments/word-trails-levels-12-30-v1.js` contains 14 newly diversified Bible clues/explanations at levels 18–26 and 29. Existing answers, board geometry, currency and save structure were kept. Update `experiments/word-trails-next-v1.html` asset versions as part of the controlled LIVE package.
- An added checker in `scripts/word_trails_quality_gate.mjs` now rejects identical educational clues and explanations recycled across newer levels. GitHub Actions quality gate, native-voice/30-level gameplay, Ocean Glow, rewards/menu, and FEEL SFX tests passed on the updated code.
- **November 14 editorial reconciliation:** The [current 77-row Scripture ledger](WORD_TRAILS_12_TO_30_SOURCE_LEDGER_2026-11-09.md) matches the active TEST level module exactly (77/77). Three previously named weak discoveries (DEN, SHE, GLEE) have already been replaced with END, HEM, and AGE; the earlier 'six remaining' statement is stale. The open specifically flagged educational-quality exception is Level 12 SUE. **Every one of the 77 newer-level items still requires independent human NWT/JW.org approval**; source alignment and automated QA are not independent signoff.
- The above source and QA updates are part of mandatory eventual promotion. No LIVE code changes are authorized by this documentation update.

## Physical phone feedback bugs already repaired in TEST — MUST promote
Read [WORD_TRAILS_PHONE_FEEDBACK_FIXES_2026-11-09.md](WORD_TRAILS_PHONE_FEEDBACK_FIXES_2026-11-09.md). The owner's November 9 physical test reported three bugs: browser refresh reopening the game instead of Home, a one-shot Word Trails home-card launch guard blocking Back→reenter, and announcer silence during puzzles despite a completion voice. All three have source-traced TEST corrections and automated regression coverage. **Include these corrections** in the eventual authorized LIVE release; phone verification of the fixes still awaits the owner's retest. Do not silently resurrect the obsolete refresh-to-game expectation.


## Owner's second Samsung voice retest — required for LIVE
The first 2026-11-09 attempted Word Trails voice fix was **not audible on the actual Samsung**, despite passing a stubbed regression. The true native original-recording engine can reject in-puzzle requests during its active-clip / 12-second cooldown; a one-time event was silently lost. The revised TEST announcer **retries the original native voice with bounded/cancelable pending progress**, supports partially completed boards, retains Settings/Off, and prioritizes the original level-completion recording without layering clips. This later audio repair, all associated asset cache-version changes, and real-MP3 regression `qa-word-trails-real-voice.yml` **must accompany the eventual LIVE transfer**. See [full root-cause evidence](WORD_TRAILS_PHONE_FEEDBACK_FIXES_2026-11-09.md). **Do not claim the bug is physically fixed before the owner actually hears it on Samsung and James validates iPhone/Safari.**


## Known noncommercial announcer recordings — mandatory future LIVE release gate (November 14)

- TEST currently loads `experiments/word-trails-original-voice-clips-v1.js` from `experiments/word-trails-next-v1.html`. The 642 KB bundle explicitly identifies its ElevenLabs free-tier recordings as **noncommercial demonstrations**. It must **NOT** be copied, embedded under a new name, or referenced by a monetized LIVE candidate.
- TEST-only protective gate: `scripts/qa_word_trails_commercial_voice_hold_v1.cjs` and CI `.github/workflows/qa-word-trails-commerical-voice-hold-v1.yml`. At TEST review it checks six synthetic release candidate scenarios (five blocked, one allowed without demo clips), including renamed/embedded copies. The controller `experiments/word-trails-announcer-v1.js` can delegate to the original native voice host without the TEST demo bundle. That is a structural fallback observation, **not** a commercial license certification or a physical-device playback test.
- **Before any future LIVE promotion, run the gate on the exact frozen deployable production candidate directory**, not on the entire TEST repository: `node scripts/qa_word_trails_commercial_voice_hold_v1.cjs --candidate-dir /path/to/frozen-live-candidate`. This gate is not presently wired to an automated LIVE deploy (there is no approved LIVE deployment pipeline in this TEST-only change); the release owner must include it in the separate final controlled process.
- Even if this scanner passes, independently establish license provenance and commercial rights **for the original native recordings and any new replacement announcer assets**, and verify the actual bundled bytes. A clean static scan cannot establish commercial permission. If clearance is unavailable, omit or disable uncleared recordings in the candidate, retaining a graceful audio-off/fallback behavior; do not misrepresent the music or voice rights.
- Confirm voice preference `Off`, volume and selected/rotating voices, native in-game announcements and completion audio, other modes, physical Samsung and iPhone/Safari playback, and no unexpected silent failures in a private TEST candidate. Do not alter the native engine's protected voice preferences or user saves to shortcut this.
- **Status:** Licensing approval and physical mobile acceptance still **OPEN**. No original LIVE files or actual player data were changed by this gate.

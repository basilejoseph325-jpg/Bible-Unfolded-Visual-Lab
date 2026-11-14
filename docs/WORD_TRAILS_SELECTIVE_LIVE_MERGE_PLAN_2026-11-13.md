# Bible Unfolded · Word Trails selective LIVE merge plan
**CODE-READ-ONLY review | November 13–14, 2026.** This is a release planning note, not permission to deploy or a test of real player backups.

## Exact repository baseline
- TEST `basilejoseph325-jpg/Bible-Unfolded-Visual-Lab`: `7e24d1d9e42feeaa2f53e044bb2b69688369f7ae`, Word Trails 30 levels after the Level 17 MARAH Numbers 33 editorial correction.
- Protected LIVE `basilejoseph325-jpg/Story-Trails`: `74a96491770ab6aa7229889ce1aa4733e06666d8`. **No LIVE files or player storage were changed.**
- [Complete 21-file source/hash inventory](WORD_TRAILS_LIVE_DELTA_RECHECK_2026-11-13.md): **8 identical, 10 present-but-different, 3 absent in LIVE**. All five large original native-core JS parts are identical.
- **Important: LIVE already contains an earlier 30-level Word Trails NEXT implementation.** This is a future controlled *update*, NOT an initial blank-system install.

## Actual code risks found (not hypothetical)

**1. Separate saves and an active legacy importer.** TEST crossword key: `bu-visual-lab-wordtrails-next-v1`; LIVE: `bible-unfolded-word-trails-next-v1`. TEST `bu-platform-saves-v2.js` (~41.4 KB) deliberately suspends TEST player-facing backup imports, adds protective read-only previews and cross-tab warnings, and excludes protected LIVE crossword data. LIVE's distinct backup handler (~14.9 KB) already supports its production backup import/rollback process. **Never overwrite the LIVE save manager with TEST's.** Both games use different paths under one `github.io` origin, so browser `localStorage` is shared across those paths.

LIVE's `experiments/word-trails-next-v1.html` currently loads `experiments/word-trails-live-migration-v1.js`. That script can automatically initialize a *missing* LIVE crossword save from eligible TEST progress; it sets separate Trail Coins to **60**, points to **0**, and preserves TEST; it does not credit TEST coins to native Insight Tokens. Its condition is not a general user-consent backup restore. Explicitly rehearse empty-LIVE, existing-LIVE, both-tabs, corrupted-data, and restart scenarios before changing it. Preserve paid wheels, global native wallet, completed levels, active boards, and replay reward protection.

**2. Original voice bundle has a licensing gate.** The TEST-only `experiments/word-trails-original-voice-clips-v1.js` (~642 KB) explicitly identifies its ElevenLabs free-tier demo recordings as **noncommercial** and says an eligible paid license is required for commercial release; TEST Settings says final commercial recordings must be regenerated as applicable. It is **absent** from LIVE; don't silently copy its base64 MP3s into a monetized release. The announcer controller itself is already identical in both repos and can use the original native voice host. Playback, rights and fallbacks must be verified separately.

**3. Audio has two potential preference writers.** TEST Feel code defers persistent global music/SFX preference ownership to native Settings and receives a one-way frame sync; LIVE's older Feel and standalone Settings adapters still contain local persistent writes. Do not combine these uncritically. Keep native Settings authoritative when embedded, with no doubled music/effects, while maintaining only intended standalone behavior.

## Ten DIFFERENT files — selective decisions

| File | Decision before any LIVE write |
|---|---|
| `bu-platform-saves-v2.js` | **HOLD**, do not replace; separately design live-safe backup, controlled migration, no wallet inflation and rollback rehearsal |
| `experiments/word-trails-feel-v2.js` | **SELECTIVE MERGE** native Settings/audio ownership only after storage + sound tests |
| `experiments/word-trails-levels-12-30-v1.js` | **CONTENT CANDIDATE**: latest 77-entry NWT source bank, pending independent Bible editorial signoff; retain words, geometry and save identity |
| `experiments/word-trails-main-settings-v1.js` | **SELECTIVE MERGE** native Settings bridge, voice Off, volume; no duplicate owner |
| `experiments/word-trails-next-v1.html` | **SELECTIVE MERGE** relevant verified loader/cache changes only; keep LIVE labels and migration path until reconciled, exclude TEST-only scripts and demo audio |
| `experiments/word-trails-next-v1.js` | **PRESERVE LIVE UI TERMS**: review small copy/logic differences (TEST COINS vs TRAIL COINS, reset, Journey Seal) |
| `experiments/word-trails-unified-menu-v1.js` | **PRESERVE LIVE save key and menu labels**; merge only tested native rewards/settings fixes |
| `journey-progress-caption.js` | **PROTECT LIVE**. Many owner-approved Story Adventure, Daily Discovery and other mode loaders differ. Never replace whole root bootstrap |
| `word-trails-native-shell-v1.js` | **KEEP LIVE**, review version/cache and native launch/back/refresh behavior only |
| `word-trails-next-launcher.js` | **KEEP LIVE labels and click route**, add only individually proven fixes if missing |

**Already identical, do not recopy:** `bu-platform-rewards-v1.js`, `experiments/word-trails-announcer-v1.js`, Feel CSS, Main Settings CSS, Native Wheel CSS/JS, puzzle CSS, Unified Menu CSS. Homepage-card SVG is identical in both. Protect the five existing native core parts and the distinct LIVE root `index.html`.

**Absent in LIVE:** (1) noncommercial voice bundle — **HOLD for rights**; (2) `experiments/word-trails-shared-core-boundary-v1.js` — **TEST-only, assess whether a LIVE-safe boundary is needed**; (3) `visual-lab-test-banner.js` — **EXCLUDE**.

## Mandatory release rehearsal on synthetic profiles (no user data)
1. Freeze candidate and verify genuinely restorable LIVE backup **before** any LIVE code changes. TEST snapshot is not a LIVE rollback.
2. Build an isolated, selective production merge against the *then-current* LIVE head; verify diff excludes other approved modes and production `index.html` wholesale replacement.
3. Exercise **new user**, **existing LIVE crossword only**, **TEST save only**, **both**, **old v1 and v2 backup**, **corrupt/oversize**, **interrupted restore**, **two concurrently open pages**, **paid wheel + wallet**, **partial crossword**, **replay without double rewards**, and **old legacy importer present/absent**. No automatic TEST coin conversion.
4. Verify all 30 levels, Bible discoveries, bonuses, chapter map, Journey Seals, native menu, Back/reentry/refresh, Ocean Glow, SFX/music, native announcer/Off, and all other modes. Preserve saved state.
5. Secure **independent human NWT/JW.org signoff for all 77 newer Bible items**, permitted announcer recordings, real Samsung Android and James iPhone Safari audio/gesture/save approval, final pre-release regression, proven rollback, and **explicit owner authorization** for the exact LIVE promotion.
6. Only then deploy, inspect the public LIVE page and recoverability. **No LIVE promotion authorized now.**

**Verification baseline:** [17-job TEST release regression](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43549796243) and [published source check](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43549865247) both passed on the unchanged application source. This document adds no gameplay code.

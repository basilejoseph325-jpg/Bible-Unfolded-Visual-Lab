# LIVE transfer file manifest — Word Trails NEXT / Visual Lab
**Prepared November 9, 2026 · Read-only LIVE audit, zero LIVE writes**

## Purpose
This is a file-level handoff checklist for the eventual approved promotion. It is **NOT** permission to deploy. The owner’s required sequence remains: source/editorial acceptance → physical Samsung & iPhone checks → explicit LIVE authorization → backed-up selective integration → LIVE browser verification/rollback availability.

The repositories both publish on `https://basilejoseph325-jpg.github.io` under different **paths on the same localStorage origin**. Their game files are separate, but browser native-wallet storage can be shared on the same browser. Never convert TEST coins into real Insight Tokens or overwrite LIVE save/voice/purchase records from a TEST copy.

## Confirmed code facts
- The **five** main `bible_unfolded_core_part1.js` through `part5.js` blob hashes match between TEST and LIVE. Treat them as protected: use thin adapters, not full replacements.
- TEST and LIVE `index.html` differ. **Never replace LIVE index.html wholesale**. Inspect and selectively merge only necessary bootstrap/style/route changes.
- Among 21 tracked Word Trails/adapter files, **20 are not yet in LIVE**; **1 are present but differ**. This is expected before promotion, not a current LIVE failure.
- All existing `bible-book-art/` scene files used by the new puzzle bank already exist in LIVE, based on repository trees; no new Bible-book scenery assets need copying.
- **One necessary Word Trails homepage-card SVG is absent in LIVE:** `assets/ui/word-trails-home-next-crossword-v1.svg`. The actual TEST launcher references it; include it in the eventual release, or the homepage card can lose its overlay artwork.
- Other new Visual Lab-only `assets/ui/` files unrelated to Word Trails are **not part of this transfer**. Do not bulk-copy folders.

## Exact file inventory (hashes reflect this inspection, revalidate at release)
| File | LIVE state | TEST blob prefix | Bytes | Action |
|---|---|---|---:|---|
| `bu-platform-rewards-v1.js` | Absent | `3e04c85aa7bd` | 3869 | Selective native-core adapter / path review required |
| `bu-platform-saves-v2.js` | Absent | `94d5770d6a17` | 14901 | TEST-only / redesign for LIVE; do NOT copy blindly |
| `experiments/word-trails-announcer-v1.js` | Absent | `10e9de0f7560` | 4486 | Candidate dependency; copy only within approved staged release |
| `experiments/word-trails-feel-v2.css` | Absent | `62ce0158988a` | 11556 | Candidate dependency; copy only within approved staged release |
| `experiments/word-trails-feel-v2.js` | Absent | `fe6065da3a66` | 20608 | Candidate dependency; copy only within approved staged release |
| `experiments/word-trails-levels-12-30-v1.js` | Absent | `8b077c0435be` | 25288 | Candidate dependency; copy only within approved staged release |
| `experiments/word-trails-main-settings-v1.css` | Absent | `653d37995cf8` | 5270 | Candidate dependency; copy only within approved staged release |
| `experiments/word-trails-main-settings-v1.js` | Absent | `638df3314938` | 8349 | Selective native-core adapter / path review required |
| `experiments/word-trails-native-wheel-v1.css` | Absent | `b7173618f2c3` | 6124 | Candidate dependency; copy only within approved staged release |
| `experiments/word-trails-native-wheel-v1.js` | Absent | `80f781b4f510` | 8574 | Candidate dependency; copy only within approved staged release |
| `experiments/word-trails-next-v1.css` | Absent | `81a2b4edc769` | 29283 | Candidate dependency; copy only within approved staged release |
| `experiments/word-trails-next-v1.html` | Absent | `407d28172971` | 7253 | Selective native-core adapter / path review required |
| `experiments/word-trails-next-v1.js` | Absent | `68bb3b204aa8` | 43356 | Candidate dependency; copy only within approved staged release |
| `experiments/word-trails-original-voice-clips-v1.js` | Absent | `dc66e4fa5702` | 642542 | Audio rights/usage approval and iOS playback QA required |
| `experiments/word-trails-shared-core-boundary-v1.js` | Absent | `f20933560e16` | 2624 | TEST-only / redesign for LIVE; do NOT copy blindly |
| `experiments/word-trails-unified-menu-v1.css` | Absent | `fea32b5f47d1` | 8228 | Candidate dependency; copy only within approved staged release |
| `experiments/word-trails-unified-menu-v1.js` | Absent | `b08cc6874b03` | 10080 | Selective native-core adapter / path review required |
| `journey-progress-caption.js` | Differs | `4d4808546b3d` | 19195 | Selective native-core adapter / path review required |
| `visual-lab-test-banner.js` | Absent | `18107a2bf957` | 7264 | TEST-only / redesign for LIVE; do NOT copy blindly |
| `word-trails-native-shell-v1.js` | Absent | `9aeb39cbbac2` | 5688 | Selective native-core adapter / path review required |
| `word-trails-next-launcher.js` | Absent | `7b4918e0b17c` | 6214 | Selective native-core adapter / path review required |

## Required native LIVE release-specific work
1. Freeze a TEST release candidate with source hashes and latest passing workflow runs; create a verifiably restorable LIVE rollback snapshot/tag before changing any LIVE source.
2. Selective-review `journey-progress-caption.js`, the native shell, real menu/settings/rewards API, all dependencies and new root bootstrap. Keep LIVE's approved modes, original Word Trails progress and other assets.
3. Create a separate LIVE-safe migration plan for crossword progress and any old Word Trails data; **do not copy the TEST backup importer into LIVE unchanged**. Test rollback, no double awards, no wallet inflation, permanent wheel ownership, saved settings, voice and user-controlled import/export.
4. Test real owned wheel animations including Ocean Glow, approved audio/announcer cues, Safari/Android touch/sizing and both direct-link and normal home-card entry.
5. Resolve outstanding editorial flags in `WORD_TRAILS_12_TO_30_SOURCE_LEDGER_2026-11-09.md` and secure independent approval of the newer discoveries. This file manifest is not editorial signoff.
6. Get explicit owner authorization for the **specific LIVE promotion**, then deploy, verify published root, all modes and assets, and keep rollback available.

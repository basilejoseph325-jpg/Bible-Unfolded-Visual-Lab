# Word Trails NEXT — current TEST vs LIVE shared-core parity & migration audit
**November 13, 2026 · Read-only audit plus TEST-only experimental migration candidate · NO LIVE edits**

## Scope and repository baselines
- TEST `basilejoseph325-jpg/Bible-Unfolded-Visual-Lab` editorial v22 baseline: `491f5b7d0fd405253cd84c06c218eb7f3d7ebe9e` before this audit's additional TEST-only documentation/QA commits.
- LIVE `basilejoseph325-jpg/Story-Trails`: `74a96491770ab6aa7229889ce1aa4733e06666d8`, unchanged during this audit.
- Both repositories publish under `https://basilejoseph325-jpg.github.io/` at **different URL paths, same browser origin**. Thus localStorage is shared per browser/device. Word Trails TEST and LIVE crossword progress currently use different keys, but native wallet, purchases, voices and some audio keys are shared across both paths.
- This audit inspects the **CURRENT LIVE** implementation. LIVE already contains an earlier Word Trails NEXT 30-level package, native host, v2 save coordinator and an automatic progress migration. Do not treat promotion as an initial clean-room install or copy the TEST root/HTML tree wholesale.

## Exact current source comparison (Git blob SHA equality, not assumed by filenames)

| Concern | TEST vs LIVE | Result / action |
| --- | --- | --- |
| Native Bible Unfolded core `bible_unfolded_core_part1.js` through `part5.js` | All five blob SHAs match exactly | **Reuse LIVE**, never overwrite core merely to promote the crossword |
| `bu-platform-rewards-v1.js` | Identical SHA `3e04c85aa7bd…` | Shared wallet/ownership API matches; inspect user-purchased entitlement behavior at final release |
| `experiments/word-trails-native-wheel-v1.js` | Identical SHA `80f781b4f510…` | Static wheel engine matches, but **visual Ocean Glow equivalence on physical phones remains unverified** |
| `experiments/word-trails-announcer-v1.js` | Identical SHA `80690d05dd44…` | Native playback code matches; TEST-only original-voice clip file and differing HTML loading must be inspected; physical audio parity remains unverified |
| `bu-platform-saves-v2.js` | Different: TEST `94d5770d6a17…`; LIVE `ae775f68524d…` | **Intentional schema separation.** TEST crossword key `bu-visual-lab-wordtrails-next-v1`; LIVE key `bible-unfolded-word-trails-next-v1`. Rollback journal keys and WordTrailsNextTEST/LIVE backup formats also differ. **Do not copy TEST coordinator onto LIVE** |
| `experiments/word-trails-next-v1.js` | Different TEST `8d82cc113b10…`; LIVE `e41070a0666d…` | Main game progress keys differ as intended. Existing LIVE records must be preserved |
| `experiments/word-trails-levels-12-30-v1.js` | Different TEST `18b3d5c9c94d…`; LIVE `8b077c0435be…` | TEST has 77-item AI-assisted first-pass editorial v22. LIVE has older content; promote **selectively only after** independent review and release approval |
| `experiments/word-trails-main-settings-v1.js` | Different: TEST `f0d309cf2654…`; LIVE `8d6278c03d6c…` | In native host both delegate to main Settings. LIVE standalone fallback still writes `bu-platform-audio-preferences-v1`, while TEST standalone fallback deliberately keeps its sliders local. Check for duplicate writer and stale preference sync before release |
| `word-trails-native-shell-v1.js` | Different cache/root frame version | Native menu/Settings delegation exists in both; TEST v22 is newer. Must selectively update integration/cache versions, not replace LIVE root |
| `word-trails-next-launcher.js` | Different text/TEST identity | LIVE already advertises 30 levels; preserve LIVE copy and production identity, exclude TEST ribbon and test-only labels |
| `experiments/word-trails-next-v1.html` | Different loading lists | TEST loads the final editorial v22 bank and an extra original-voice clip asset; LIVE loads older bank and automatic migration script. Do not import TEST-only clip diagnostics or page identity blindly |

## Confirmed safety blocker: automatic TEST → LIVE progress import

Existing LIVE `experiments/word-trails-live-migration-v1.js` (pinned Git blob SHA `52d0a564a16a964daf70e156e46e7d7866480c81`) runs immediately when loaded. If the LIVE crossword storage key is absent and a valid TEST crossword key is present on the same browser origin, it silently copies completed levels, paid/claimed bonus ledgers and partial progress into the LIVE key **without consent**.

It does explicitly quarantine currency: imported LIVE crossword state starts at **60 separate Trail Coins, zero puzzle Points**, and does not add TEST coins to real Insight Tokens. It does not write shared wallet, voice or wheel-ownership records. It does **not** overwrite an existing LIVE crossword save, and a repeated run is idempotent in the synthetic fixture. However, the **unconsented state import itself fails the desired user-controlled migration standard**. A user opening LIVE after experimenting in TEST could observe unexpected migrated crossword progress.

The TEST-only read-only audit `scripts/qa_word_trails_live_migration_boundary_20261113.cjs` downloads the exact source from pinned LIVE commit `74a964…`, verifies its Git blob hash and runs it only inside isolated Node VM localStorage fixtures. GitHub Actions run `43521831728` **PASSED**; the audit **CONFIRMED THIS RELEASE BLOCKER**. A passing audit is not approval of the old migration behavior.

## Safe development work started in TEST (not installed in any game page)

- A new unused candidate `experiments/word-trails-live-consent-migration-candidate-v1.js` supplies **read-only preview**, rejects overwrite when LIVE progress already exists, and requires `acceptExplicitly({approved:true,sourceRaw:<unchanged preview source>})` to apply. It copies **only** the LIVE crossword progress key, resets quarantined TEST puzzle currencies, and leaves existing TEST, wallet, wheel purchase and voice records untouched.
- A dedicated synthetic suite `scripts/qa_word_trails_consent_migration_candidate.cjs` covers zero writes on load/preview/refusal, explicit opt-in import, no duplicated import, existing-LIVE protection, changed/corrupt source rejection and storage-write failures. GitHub Actions run `43522124480` **PASSED** on eight synthetic scenarios; this is not a public UI or device acceptance.
- The candidate is **not referenced by** `index.html`, `journey-progress-caption.js`, `visual-lab-test-banner.js`, `word-trails-native-shell-v1.js`, or `experiments/word-trails-next-v1.html`; it is intentionally inert and cannot modify an actual user's data. This is engineering preparation only—not an authorized replacement for the current LIVE script.
- The candidate still requires a native **player-facing confirmation UI**, clear distinction between TEST progress and real Insight Tokens, write-race/rollback review, integration QA and explicit user approval before it can become LIVE behavior.

## Required next gates (all remain blocked)

1. Design and test a genuine native confirmation screen for importing TEST progress only when no LIVE crossword save exists. Show what transfers and what does **not** (real coins, points, purchases, voices, daily streak). An existing LIVE save always wins.
2. Compare native audio ownership and settings sync on the actual home-card route and *standalone/direct URL* route. Eliminate unintended duplicate writers without disrupting Word Trails' approved SFX; verify original announcer clips and Ocean Glow (curved trace, mist, glitter).
3. Verify SAVE v1/v2 import/export and profile state across real LIVE/TEST schema boundaries using **synthetic and consented** fixtures, including partial puzzles and reward-once ledgers. Do not bulk-import entire native TEST wallet/settings backups into LIVE.
4. Run complete 30-level and cross-mode regression in TEST, freeze release candidate and restorable LIVE checkpoint. Physical Samsung Android and James's iPhone Safari QA are still needed, followed by explicit owner authorization for this specific LIVE promotion.

**Status: RELEASE BLOCKED.** Human testing not requested yet. The owner does not need to do anything during this safe TEST audit. Native LIVE game, its existing save keys and source commit remain unchanged.

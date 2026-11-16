# Shared Insight Tokens — truthful TEST preview checkpoint

## Current state — November 16, 2026
- **PR #49 is DRAFT and UNMERGED.** All changes live on `feature/test-shared-insight-wallet-foundation-20261116`; neither public Visual Lab main nor protected LIVE Story-Trails was changed.
- An opt-in preview loader is in this branch's `index.html`. It requires `?bu_shared_wallet_preview=1`. The regular TEST URL without that flag keeps its old behavior.
- The preview now connects the **real native game economy** and regular Word Trails to **one native TEST-only balance**, not two visual counters. Native game earnings and spending are preserved and Word Trails first-time rewards / 15-token paid letter hints use the same native wallet.
- Daily Word Trail Discovery Stamps remain collectible independently and do not mint shared coins. Word Trails' former separate Trail Coins and progress remain preserved and are never imported 1:1 as shared currency.
- Codex's new Levels 51–55 are on independent draft PR #50 and **are not integrated** into #49.

## What is actually loaded in the preview
1. `experiments/bu-test-native-storage-fence-v1.js` is loaded synchronously before the original engine. It remaps the preview's browser storage into a separate namespace (`bu-visual-lab-shared-preview-20261116:`) and is disabled without the opt-in flag. It never writes original LIVE wallet / recovery / ownership / Word Trails keys.
2. `experiments/bu-test-word-trails-economy-v1.js` defines proposed once-only rewards: +4 per first level completion, +1 per hidden Bible discovery, +1 per completed satchel, +3 per five-level Journey Seal; paid letter hints cost 15 tokens.
3. `experiments/bu-test-insight-native-bridge-v2.js` is the **actual native bridge**: parent-owned, active-frame restricted, requires matching saved gameplay proof, uses the native wallet's persistence and receipt ledger, and marks previously completed Word Trails content as legacy (zero new rewards). Recent code additionally rejects a known stale-tab save instead of overwriting a newer record.
4. `experiments/word-trails-next-v1.js`, `experiments/word-trails-next-v1.html`, `word-trails-native-shell-v1.js` and `experiments/word-trails-daily-v1.html` contain conditional preview routing, display and earn/spend integration.
5. `experiments/bu-test-insight-wallet-v1.js` (IndexedDB) and `experiments/bu-test-insight-word-trails-bridge-v1.js` are older **unused foundations**, retained for reference and isolated QA. The playable preview uses native V2 instead.

## Verified checks
- Isolated native-ledger regression `scripts/qa_test_insight_native_bridge_v2.cjs`: native earns/spends, idempotent reward receipts, legacy-completion quarantine, invalid frame and forged delta rejection, zero-funds and write-failure rollback, stale-save detection and untouched raw LIVE wallet/recovery/ownership records.
- `scripts/qa_test_insight_shared_preview_browser_v1.cjs`: browser gameplay in **Chromium and Linux WebKit** emulating 320px and 430px phones; full Level 1, free + paid hint, first-time hidden find, real native earnings and spending, navigation, reload, and LIVE key isolation. See GitHub Actions for the exact latest commit conclusions; browser emulation does not equal a physical phone.
- Other existing code paths are not automatically approved merely because specific wallet tests pass.

## Blockers before public TEST merge
1. Main game `saveEconomy` is synchronous. The current stale-write detection protects against *observed* old values but is **not a full atomic cross-tab guarantee**; independent concurrent-tab safety is outstanding.
2. Complete interruption/retry and backup-export/import recovery checks across the real preview, not only isolated fixtures.
3. The separate experimental James Return Loop and native Boost shops still use their own TEST-only ledgers. Do **not** claim *all* TEST wallets are unified until these are deliberately migrated and tested.
4. Retest Story/Trivia/Rewards integration, audio, wheel skins, bonus satchels, Daily stamps, and 50-level content on Android-sized Chromium and iPhone-style WebKit.
5. Independent phone acceptance: Samsung Android and James' iPhone Safari. Only then consider merging to public Visual Lab TEST. Independent editorial review for new content is separate.
6. Do not merge or deploy LIVE on the strength of isolated QA.

## Avoid confusion
- PR #49 is a candidate. It is **not public TEST or LIVE**.
- PR #50 belongs to Codex; it is a separate unmerged content pack.
- Green wallet-specific CI means only that the checked transactions passed, not that every other game's QA has passed.

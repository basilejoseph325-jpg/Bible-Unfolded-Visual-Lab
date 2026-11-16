# Shared Insight Tokens — truthful TEST preview checkpoint

## Current state — November 16, 2026
- **PR #49 is DRAFT and UNMERGED.** All changes live on `feature/test-shared-insight-wallet-foundation-20261116`; neither public Visual Lab main nor protected LIVE Story-Trails was changed.
- An opt-in preview loader is in this branch's `index.html`. It requires `?bu_shared_wallet_preview=1`. The regular TEST URL without that flag keeps its old behavior.
- The preview now connects the **real native game economy** and regular Word Trails to **one native TEST-only balance**, not two visual counters. Native game earnings and spending are preserved and Word Trails first-time rewards / 15-token paid letter hints use the same native wallet.
- Daily Word Trail Discovery Stamps remain collectible independently and do not mint shared coins. Word Trails' former separate Trail Coins and progress remain preserved and are never imported 1:1 as shared currency.
- James Return Challenge (the active Bible Books gate/rewards extension) has been adapted in this **preview only** to store its purchases, achievements, lives and banked streak rewards in the same native wallet JSON. The original independent TEST balance was not converted or altered.
- Bible Books shelf and reader pages now inherit the opt-in preview flag and storage namespace; previously saved ordinary Bible Books reading positions remain untouched. Full browser journey QA is required before approval.
- Codex Levels 51–55 and Family Worship Clue Relay are separate draft PRs #50 and #51 and are **not integrated** into #49.

## What is actually loaded in the preview
1. `experiments/bu-test-native-storage-fence-v1.js` is loaded synchronously before the original engine. It remaps the preview's browser storage into a separate namespace (`bu-visual-lab-shared-preview-20261116:`) and is disabled without the opt-in flag. It never writes original LIVE wallet / recovery / ownership / Word Trails keys.
2. `experiments/bu-test-word-trails-economy-v1.js` defines proposed once-only rewards: +4 per first level completion, +1 per hidden Bible discovery, +1 per completed satchel, +3 per five-level Journey Seal; paid letter hints cost 15 tokens.
3. `experiments/bu-test-insight-native-bridge-v2.js` is the **actual native bridge**: parent-owned, active-frame restricted, requires matching saved gameplay proof, uses the native wallet's persistence and receipt ledger, and marks previously completed Word Trails content as legacy (zero new rewards). Recent code additionally rejects a known stale-tab save instead of overwriting a newer record.
4. `experiments/word-trails-next-v1.js`, `experiments/word-trails-next-v1.html`, `word-trails-native-shell-v1.js` and `experiments/word-trails-daily-v1.html` contain conditional preview routing, display and earn/spend integration.
5. `james-return-loop-test-v1.js` uses the native wallet's atomic save in preview mode for a Bible Books purchase, Return Challenge bank rewards and ownership. It preserves the old standalone TEST wallet exactly as-is outside preview.
6. `bible-book-guides/index.html` and `bible-book-guides/read.html` load the opt-in storage fence before their reading scripts, so reading position stays isolated. Guarded internal navigation retains the preview flag, and protected LIVE navigation is blocked.
7. `experiments/bu-test-insight-wallet-v1.js` (IndexedDB) and `experiments/bu-test-insight-word-trails-bridge-v1.js` are older **unused foundations**, retained for isolated QA. The playable preview uses native V2 instead.

## Verified checks
- Isolated native-ledger regression `scripts/qa_test_insight_native_bridge_v2.cjs`: native earns/spends, idempotent reward receipts, legacy-completion quarantine, invalid frame and forged delta rejection, zero-funds and write-failure rollback, stale-save detection and untouched raw LIVE wallet/recovery/ownership records.
- `scripts/qa_test_insight_shared_preview_browser_v1.cjs`: browser gameplay in **Chromium and Linux WebKit** emulating 320px and 430px phones; full Level 1, free + paid hint, first-time hidden find, real native earnings and spending, navigation, reload, and LIVE key isolation. See GitHub Actions for the exact latest commit conclusions; browser emulation does not equal a physical phone.
- Interrupted winning-board completion and an already-saved but not-yet-credited level award now recover once on reload, without duplication. Passed Chromium/WebKit at both phone sizes on run `43940237292`.
- Return Challenge's 180-token Bible Books purchase, unaffordable purchase, banked-earnings transfer and Word Trails balance passed Chromium/WebKit at 320px/430px on run `43941424613`.
- Daily Discovery Stamps isolation and Books shelf/reader full navigation are covered by added browser tests; consult exact latest CI head result rather than treating code authoring as a pass.
- **Native mode + exact-price boundary accepted in CI:** run [43976235418](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43976235418) passed *Chromium and Linux WebKit* at 320×568 and 430×932. The test actually solved a Story Adventure word with the game's wheel buttons, answered a native Bible Trivia question, verified saved native earnings, then tested an already-used free-hint level at **14 tokens (blocked)** and **15 tokens (one purchased hint, resulting balance 0)**. Raw LIVE wallet, recovery, prior Word Trails and Bible Books reading data were byte-identical before/after. The test is `scripts/qa_test_insight_native_modes_v1.cjs`; these are emulated phone-sized browsers, **not physical phones**.
- **Real Rewards UI purchase and persistence passed:** GitHub Actions [run 43983096480](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43983096480) exercised the actual native Rewards screen at 320 and 430 phone widths. With 60 Insight Tokens, the Golden Puzzle Wheel (cost 180) was refused without granting ownership; after a protected TEST top-up to exactly 180, the real shop purchase deducted **180 once**, updated the visible Rewards token banner to **0**, made the wheel permanently owned, displayed **0** in Word Trails, and persisted both balance/ownership after reload. The canonical LIVE wallet remained byte-identical. Test: `scripts/qa_test_insight_rewards_ui_v1.cjs`.
- Other existing code paths are not automatically approved merely because specific wallet tests pass.

## Blockers before public TEST merge
1. Main game `saveEconomy` is synchronous. The current stale-write detection protects against *observed* old values but is **not a full atomic cross-tab guarantee**; independent concurrent-tab safety is outstanding.
2. Complete interruption/retry and backup-export/import recovery checks across the real preview, not only isolated fixtures.
3. The separate `native-boost-shop-test-v1.js` experimental Power-Up Shop is **not loaded by the normal index** and still has its own standalone TEST-only inventory/coin trial logic. Do not claim its independent experimental balance is unified. The **active James Return Challenge** now uses the native wallet in preview only; normal public TEST remains unchanged.
4. Verify that the routed Bible Books shelf and reader never write canonical reading progress; verify actual mobile touch, keyboard and reload from those pages.
5. Retest Story/Trivia/Rewards integration, audio, wheel skins, bonus satchels, Daily stamps, and 50-level content on Android-sized Chromium and iPhone-style WebKit.
6. Independent phone acceptance: Samsung Android and James' iPhone Safari. Only then consider merging to public Visual Lab TEST. Independent editorial review for new content is separate.
7. Do not merge or deploy LIVE on the strength of isolated QA.

## Avoid confusion
- PR #49 is a candidate. It is **not public TEST or LIVE**.
- PR #50 belongs to Codex; it is a separate unmerged content pack.
- Green wallet-specific CI means only that the checked transactions passed, not that every other game's QA has passed.

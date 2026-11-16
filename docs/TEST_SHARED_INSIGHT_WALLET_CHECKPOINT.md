# Issue #48 — shared Insight Tokens: isolated TEST preview checkpoint
_Last updated November 16, 2026_

## Truthful status
- Actual **native Visual Lab game wallet** and regular Word Trails now use the same TEST-only native ledger in an **opt-in branch candidate**, URL flag `?bu_shared_wallet_preview=1`.
- Changes are **only on draft PR #49's isolated branch**. No merge; neither public Visual Lab main nor Story-Trails LIVE received this candidate.
- Browser QA ran with local-only Chromium and WebKit, isolated browser profiles and artificial LIVE save sentinels. These are **not** physical Android/Safari acceptance.
- Codex's unrelated Word Trails 51–55 work is independent; no overlap with its content files.

## Authoritative balance
The actual main game's native `economy.coins` and `saveEconomy()` are the ONLY currency authority in the playable candidate. Word Trails uses its parent-owned bridge; this is not a cosmetic display-only counter. Native Points remain separate.

The separate IndexedDB V1 wallet and V1 Word Trails bridge are retained as **unused foundation experiments**; **they are NOT loaded by the playable shared preview**. Do not confuse their standalone 60-token fixture with the native wallet starting balance.

The first script in the branch's `index.html` is `experiments/bu-test-native-storage-fence-v1.js`. It activates only when the explicit query flag is present on the Visual Lab domain or localhost. Every localStorage key used by the opt-in preview—including `bible-unfolded-*`, `story-trails-*`, existing `bu-*` TEST shops/settings and unrelated origin data—is redirected to `bu-visual-lab-shared-preview-20261116:<key>`; `clear()` is forbidden. The initial old Word Trails progress is accessed **only by explicit read-only raw access** for migration. The actual canonical LIVE wallet/recovery/ownership, Word Trails LIVE progress, and older TEST shop/progress keys must remain byte-identical. The **regular Word Trails iframe and Daily iframe** also load their own early storage fences.

## Game-side integration
- `experiments/bu-test-insight-native-bridge-v2.js`: parent-owned fixed price/reward bridge, accepts only active Word Trails iframe and validates saved progress before credits.
- `experiments/word-trails-next-v1.js`: preview-specific progress key `bu-visual-lab-wordtrails-shared-preview-v1`; read-only copy of legacy progress on first load; no legacy coins converted. Displays parent-native balance, pays confirmed hints before reveal, first-time Bible discovery and win credits, refresh/mode sync.
- `word-trails-native-shell-v1.js`: preflights wallet before launch and passes preview flag to iframe and Daily overlay.
- `experiments/word-trails-next-v1.html`: child wallet fence loads before shared Rewards module.
- `experiments/word-trails-daily-v1.html`: preserves sandbox query on refresh; stamp and free-hint mechanics untouched.
- Native core bundle, native story logic, original game, wheel skins, music and announcer engine remain unedited.

## Proposed reward policy (first 50 levels)
| Regular Word Trails activity | Shared Insight Tokens |
|---|---:|
| First-time level win | +4 |
| First-time hidden Bible discovery | +1 |
| First-time full bonus satchel | +1 |
| First-time five-level Journey Seal | +3 |
| Paid letter hint after existing free hint | -15 |
| Individual bonus words, combos, Bible answer tiles | +0 |

For 50 levels with two hidden Bible words and all satchels, up to 380 new shared tokens; no old standalone Trail Coin conversion. Policy allows new levels through 55 when approved but does not add them. Daily Word Trail Discovery Stamps remain independent.

## Tests
- `scripts/qa_test_insight_wallet_v1.cjs` and `scripts/qa_test_insight_native_bridge_v2.cjs` — fixed-price receipts, old completed-progress receipt migration, duplicate refusal, paid hints, failure rollback, and raw LIVE-key sentinels.
- `scripts/qa_test_insight_shared_preview_browser_v1.cjs` — isolated localhost native/Word Trails play, Chromium and WebKit at 320×568 / 430×932; real native award, free + paid Word Trails hint, hidden Scripture word, native balance refresh, navigation, Daily overlay, reload, and raw LIVE wallet / progress / ownership sentinels. Extended CI subsequently passed solving all four Level 1 wheel answers, awarding exactly four tokens for completion, spending five in native game while Word Trails was open, then reloading, in both Chromium and WebKit at both phone sizes. The newest full-sandbox run also checks raw TEST shop/music/legacy Word Trails keys remain byte-identical. Latest run should be confirmed before sign-off.
- Existing Word Trails audio, settings, daily and core regressions also run on draft branch. A passing partial suite is not signoff for all modes.

## Unresolved before merging into public TEST
1. Finish extended full-Level 1 real-browser payout tests and review all relevant CI failures.
2. Verify multi-tab race safety; native localStorage writes are synchronous but **not cross-tab atomic**. Do not claim two-tab safety until actually tested and addressed.
3. Test refresh interrupted midway through a paid hint and failure saving progress; replay must not charge twice.
4. Test native backup export/import and recovery protections on isolated preview (including the storage key fence), and complete mode switching to native Story/Trivia/reward shop.
5. Explicitly decide how to consolidate **separate TEST-only** `james-return-loop-test-v1.js` and `native-boost-shop-test-v1.js` balance systems; they are *not currently part of the same wallet*. Avoid misleading unified-currency labels there.
6. Editorial review, physical Samsung Android and James' iPhone Safari acceptance, and then controlled public TEST deployment.
7. Only after public TEST and recovery checkpoint pass, consider LIVE release. Never directly merge into original Story-Trails LIVE based on these tests alone.

## Safety rule
**Keep draft PR #49 unmerged** until remaining checks pass. Native shared preview lives on an isolated feature branch, not at the published main TEST URL.

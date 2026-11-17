# Regular TEST: shared Insight Tokens candidate

Branch: `feature/test-standard-shared-insight-wallet`.
Base: `6a189eb` on Visual Lab main, after merged PRs #49 and #52.
No merge, publishing, TEST deployment or Story-Trails change is included.

## Cause and correction

The normal URL never activated the proven opt-in native bridge. Word Trails
therefore spent its own old Trail Coins. Inspection also found that the actual
current Rewards loader DOES load the Power-Up Shop, whose separate trial
balance starts at 225; the older wallet handoff's “not loaded” statement is stale.
The active Return Challenge also used a separate balance outside the preview.

Regular TEST now activates the same early storage fence and native V2 bridge
without a preview flag. The existing native `economy.coins` is authoritative;
Points remain separate and may be negative. Word Trails uses the proven receipt
policy and native balance, and never falls back to its old coins if the bridge
cannot authorize a purchase. Return Challenge and Power-Up Shop use the same
native record for both spending and inventory/achievement changes. Prices,
reward amounts, puzzle engines, wheel gestures and audio ownership are retained.
Power-Up Shop's old token mirror/225-token seed is inactive in regular TEST.

Changed loader/frame URL versions prevent cached legacy code from reintroducing
an old balance. The loader order is retained. Books shelf/reader navigation and
Daily refresh stay in the regular scope rather than accidentally entering the
old protected preview. Standalone Daily stores stamps, not spendable currency;
its existing direct-link behavior and explicitly local standalone QA remain.

WebKit exposed a real startup race: the native 80ms daily timer could run
before the asynchronous Web Lock was owned, safely fail its save, then never
retry. The fence now signals writable ownership; the bridge finishes native
entitlement persistence and calls the original date-guarded welcome after that
signal/DOMContentLoaded. Amounts and once-per-day rules are unchanged. The new
browser test deliberately delays lock delivery by one second to regress this.
Gameplay stays covered by the existing lock shield until writes are permitted;
the forced-delay fixture intentionally records refused early-write warnings,
then verifies the correct durable daily grant and no duplicate payout.

## Fresh and existing players

- Stable namespace: `bu-visual-lab-shared-standard-v1:`. One native wallet record
  contains the native balance, Word Trails receipts, `buJamesReturnState`, and
  `buNativeBoostState`. Word Trails' separate record is progress only; its old
  coin field is inert and retained for compatibility.
- A fresh profile uses the native 45-token baseline plus its normal 15-token
  first daily reward: 60 after welcome, shared everywhere. No separate 225/500
  trial grant or 45,000-token bonus is introduced.
- First regular visit copies existing ordinary game records once, under the
  existing exclusive Web Lock, then reloads before allowing gameplay writes.
  Native Points, tokens, purchases, hint receipts, chapters, crossword/Trail
  progress, reading positions, settings, boosters and achievements are retained.
- Old Word Trails coins, Return Challenge trial balance and Power-Up trial
  tokens are NOT added to native tokens. Existing Trail accomplishments are
  quarantined as zero-credit legacy receipts. Old inventories/purchases and
  earned Return Challenge pot remain available.
- Unscoped original records and both existing private preview namespaces remain
  unchanged. The ordinary source copy is a one-time checkpoint, not a live
  synchronization with old TEST/LIVE or an automatic merge of private previews.
  A previous import-preview session cannot select the regular scope.
- Missing Web Locks, a malformed native wallet, quota failure or a partial/colliding
  copy fails closed with a visible explanation. Originals are not reset. Failed
  staged copies roll back their added keys; interrupted copies are never silently
  overwritten. Current HTTPS browsers are required for Web Locks.

## Save transfer and recovery boundary

The existing TEST restore is already paused (`bu-platform-saves-v2.js`, v35).
This candidate does not import that experimental backup implementation into LIVE
or build another restore engine. The existing snapshot exporter is reused with
an explicitly different `BibleUnfoldedSharedInsightTest` format, including wallet
and Word Trails state together, `restoreAllowed: false`. Settings explains this.
The old Import action is blocked before it can replace a wallet without the
matching receipts/progress. Downloading a snapshot is NOT a successful restore.

A reviewed matching shared-state restore remains a release gate. Do not manually
copy a snapshot over canonical keys or roll back just the token record. Before
any approved integration, retain the base commit and original player records.
Code rollback alone is not a merge of later regular-scope progress back into
legacy saves. Neither namespace nor originals should be deleted during review.

## Verification

Results are recorded below only after checks finish. Tests use local HTTP and
disposable profiles; actual user storage and published sites are never opened.
The browser runner includes fresh/legacy profiles in Chromium and Linux WebKit at
320×568 and 430×932, plus actual browser-process shutdown/restart from temporary
disk profiles. Device simulation is not physical Android/iPhone acceptance.

Primary commands:

- `node scripts/qa_standard_test_wallet_fence_v1.cjs`
- `node scripts/qa_standard_test_boost_wallet_v1.cjs`
- `node scripts/qa_test_insight_native_bridge_v2.cjs`
- `node scripts/qa_standard_test_shared_wallet_browser_v1.cjs`
- `node scripts/qa_test_insight_shared_preview_browser_v1.cjs`
- `node scripts/qa_regular_test_wallet_copy_v1.cjs`
- `node scripts/word_trails_quality_gate.mjs`
- `node scripts/word_trails_shared_rewards_integration_test.mjs`
- `node scripts/qa_word_trails_daily_v1.cjs`
- `node scripts/qa_word_trails_native_audio_wheel_owner_v23.cjs`

Browser dependencies: Playwright 1.58.2 (new/shared-wallet tests), Puppeteer Core
(existing audio/Daily regression), Chromium, WebKit and system dependencies.
Serve the checkout on localhost:8894. The two older regressions accept STORY_URL
and BU_WT_NATIVE_PARITY_URL respectively. WT_ENGINES selects the new matrix;
WT_SHOTS=1 captures screenshots; WT_EVIDENCE selects its JSON evidence path.

Final matrix: PENDING.

## Before release

- Independent source/PR review, including migration and atomic booster inventory.
- Matching shared-state restore review; current exports are safety snapshots.
- Physical Samsung Chrome and iPhone Safari: touch/keyboard, suspending/reopening,
  audio, navigation, storage pressure, two-tab handoff and cached-update acceptance.
- Owner approval and recovery checkpoint before any merge/deployment. The optional
  45,000-token tester grant is deliberately absent and belongs to later work.

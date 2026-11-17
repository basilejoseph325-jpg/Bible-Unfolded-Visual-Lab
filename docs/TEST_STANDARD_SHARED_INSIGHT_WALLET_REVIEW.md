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

## Coordinated backup restore (PR #55 review follow-up)

Regular TEST now exports restorable `BibleUnfoldedSharedInsightTest` version 2
snapshots with a SHA-256 checksum. Only matching, complete snapshots are accepted.
The native wallet, recovery copy, Word Trails progress, purchase ownership,
booster stock, Return Challenge state, award receipts and other scoped game saves
are restored together. Legacy v1/non-restorable snapshots and private-preview
backups are rejected before writes. No old Trail Coins are converted or merged.

The existing Settings Import button reviews the file before an explicit confirm.
Cancel and invalid files do not import anything. A fingerprint prevents a stale
review replacing gameplay that changed after the preview. The exclusive writer
pauses while the restore applies; a verified full checkpoint and intent journal
recover interrupted writes before gameplay becomes writable. A damaged journal
can roll back only to its matching verified checkpoint. Unverifiable recovery
stays read-only and offers recovery from a separately supplied valid full backup.
Unknown/corrupt current state is never treated as a safe rollback checkpoint.

The pending migration marker also blocks older cached PR #55 code from playing
against a partially applied restore. Original unscoped saves and private preview
namespaces remain unchanged. Old TEST backup component APIs are preserved, but
cannot intercept normal shared Settings import/export. Their browser fixtures
use the existing localhost-only standalone QA route; published verifiers keep
their real published URL and cannot opt out this way. Normal shared restore is
covered by its own mandatory two-engine CI matrix, not those legacy fixtures.

No experimental backup code is imported into Story-Trails. A code rollback is
not a migration of later shared TEST progress into legacy saves. Retain the base
commit, source records and exports before any owner-approved integration.

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

Final local results:

| Check | Actual result |
| --- | --- |
| Normal URL, fresh + existing profiles, Chromium/WebKit, 320/430 | 8/8 pass |
| Full browser-process close/restart from temporary disk profiles | 4/4 pass |
| Protected shared preview, both engines, 320/430 | 4/4 pass |
| Separate 533/111 copy-preview, both engines, 320/430 | 4/4 pass |
| Standard fence, native bridge, atomic boosters, shared Rewards API | Pass |
| Existing Word Trails 50-level structural quality gate | Pass, unchanged legacy editorial warnings |
| Existing Daily: 320/390/430, touch swipe, stamps, replay, journal, refresh | Pass |
| Existing audio/wheel owner: 320/390, announcers, Ocean Glow, touch Daily round trip | Pass |
| Index inline JavaScript syntax | All 238 parse |

The normal-URL cases genuinely play a Story word, Trivia and People & Names
answers, a Bible Crosswords answer, a Word Trails level/hidden words/satchel,
and real Rewards/booster purchases. They check free/paid hints, the 14/15 price
boundary, duplicate payments, native/child balances, daily rewards, snapshots,
reload/tab reopen, Books/Daily navigation and original-record preservation.
They enumerate 33 Crosswords packs; they do NOT solve all 33 packs. The 50-level
gate validates every board structurally; it is not 50 full mobile playthroughs.
Screenshots of actual mobile gameplay and Rewards were inspected.

Ignored local evidence: `work/standard-wallet/accepted-{chromium,webkit}.json`,
`work/accepted-{chromium,webkit}.log`, `work/accepted-preview-regression.log`,
`work/final-copy-preview-regression.log`, `work/accepted-daily-regression.log`,
`work/accepted-audio-wheel.log`, `work/accepted-quality-50.log`, and screenshots
under `work/standard-wallet/`. Test code and this record are committed; ephemeral
player/browser profiles are not. Early runs exposed and then verified the fixed
WebKit startup race; the deliberately delayed fixtures retain expected refused
pre-lock write warnings, followed by a correct persisted once-only welcome.

### CI distinctions

Do not report the entire PR as green. The initial new matrix run
[44006166857](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/44006166857)
failed BEFORE gameplay because `ubuntu-latest` became Ubuntu 26.04, unsupported
by Playwright 1.58.2 WebKit. This candidate pins its own runner to Ubuntu 24.04.
The existing audio workflow's fixed old cache-tag assertion was made
version-independent without weakening its actual ownership checks. The native
booster regression now funds ONLY its isolated shared-wallet fixture and verifies
shared spending, instead of assuming the retired 225-token trial grant or
byte-identical inventory-less wallet JSON.

### Follow-up checklist and actual evidence

- [x] Read independent review of `9ea596f` (GitHub PR review).
- [x] Scoped seal assertions: 32 cases across regular shared mode and standalone
  QA at 320/430; upgrade 30→31, 35→36, 40→41, 45→46, completed 50, full first
  level payment and final-level replay without duplicate level/seal awards.
- [x] Chromium real CDP touch swipes/taps at 320/390, native hidden-word payment
  and resume; original records unchanged (`work/pr55-real-touch.log`).
- [x] Genesis 13/14 compatible immutable chapter/audio boundaries and actual
  navigation/ending/artwork checks (`work/pr55-g13-r2.log`, `pr55-g14-final.log`).
  Genesis-only exact allowlists remain for Genesis-only releases; cross-mode
  wallet changes use chapter/audio hashes against the current PR base.
- [x] Cross-mode smoke including an actual Books purchase and navigation
  (`work/pr55-crossmode.log`); James/Return Challenge purchase, Trivia, banking,
  insurance, refill, mastery and refresh at 390/832 (`pr55-james-r2.log`).
- [x] Settings practice-link regression at 320/390 (`pr55-settings-practice-final.log`).
- [x] Restore contracts: 14 invalid files, stale review, concurrent calls, all
  11 injected failure points and all 11 crash points, checksum-verified recovery,
  unreadable-state recovery and unscoped/private-preview canaries.
- [ ] Final complete restore browser matrix, 320/430 Chromium and WebKit.
- [ ] Final head CI results and legacy component browser reruns.
- [ ] Physical Samsung Chrome / iPhone Safari acceptance.

Initial follow-up head `3aa00ac`: 55 workflows were triggered. Red checks were
triaged rather than treated as wallet failures: missing historical Git object in
shallow checkout (fixed fetch depth); old launcher/seal-visual raw keys; original
Story comparison to a pre-approved-fix historical checkpoint; James trial funds;
pre-migration Settings snapshot timing; scoped audio write tracing; legacy backup
fixtures exercising the normal shared URL; and published-only cache verifiers.
Later fixes preserve the actual gameplay, purchase, ownership, refresh and
original-save assertions. The standard wallet matrix also exposed a fixture
snapshot taken before the existing 1400ms booster reconciliation; it now waits for
that reconciliation before checking exact unchanged bytes on cancel.

Published-only v32–v35 verifiers target deployed TEST and contain fixed historical
cache-version strings. They cannot verify this unpublished branch. Their red
results are not relabeled as candidate passes; deployment is not performed to
satisfy them. The fourteen-group legacy umbrella inherits its component results.
Review the latest head's actual checks/artifacts: no entire-PR green claim is made.

## Before release

- Independent source/PR review, including migration and atomic booster inventory.
- Independent review of the coordinated v2 restore, checkpoint/journal recovery
  and rejection of partial/legacy files.
- Physical Samsung Chrome and iPhone Safari: touch/keyboard, suspending/reopening,
  audio, navigation, storage pressure, two-tab handoff and cached-update acceptance.
- Owner approval and recovery checkpoint before any merge/deployment. The optional
  45,000-token tester grant is deliberately absent and belongs to later work.

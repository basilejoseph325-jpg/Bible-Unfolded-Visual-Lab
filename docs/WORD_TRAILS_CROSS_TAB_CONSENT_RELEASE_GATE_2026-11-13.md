# Word Trails — Cross-tab progress-transfer safety checkpoint
**November 13, 2026 · TEST ONLY · LIVE unchanged · NOT permission to import real data**

## Root cause and why this gate exists

Word Trails NEXT TEST and the earlier Story-Trails LIVE deployment use different GitHub Pages paths but the same `basilejoseph325-jpg.github.io` **browser origin**. That means they can see the same localStorage keys in the same browser profile. Even if a player agrees to transfer crossword progress, a second open tab may write another save between the preview and the actual transfer.

The prior v1 consent candidate verifies the target LIVE crossword key is absent and the TEST source is unchanged immediately before writing. However, the **check and localStorage.setItem are not one atomic compare-and-swap operation**. A concurrent tab may change the target during that gap. Also, the existing published LIVE `experiments/word-trails-live-migration-v1.js` still performs automatic no-consent imports; it does not participate in a new lock protocol.

## TEST-only cooperative exclusive lock candidate (v2)

New unlinked source:
- `experiments/word-trails-exclusive-consent-boundary-v2.js` uses the **existing v1 validation** via `createForStorage(storage)`, with no duplicated or weakened data-schema rules.
- `acceptWithExclusiveLock({approved:true, sourceRaw})` can act **only after explicit consent**. It requests `navigator.locks.request('bible-unfolded-word-trails-progress-import-exclusive-v2', {mode:'exclusive', ifAvailable:true}, ...)` on a real browser or an injected lock adapter in unit tests.
- It **fails closed** when Web Locks are unavailable, unavailable because another tab holds the lock, or throw an error. It does not try an unsafe fallback lock implemented with localStorage.
- It rechecks both keys **inside** the acquired exclusive lock: existing LIVE progress always wins; the TEST source must be exactly the same raw JSON as the preview. A successful transfer writes **only** the LIVE crossword progress key; no native wallet, Insights, paid wheels, voices, preferences, TEST save, or backup/import keys are written. TEST puzzle coins and points are not converted to real currency.
- A storage verification failure can be ambiguous if the single-key write succeeded but readback failed. The candidate **flags `requiresRecoveryReview`** and does not silently delete that key, protecting any later game saves from being erased.
- The candidate is deliberately **not loaded by** the actual game, test root or published sample consent screen. The earlier sample screen continues to use the injected-memory v1 simulator and makes no actual data transfer.

## Passing QA evidence

1. [Synthetic v2 concurrency & fault QA #43524160773](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43524160773) **SUCCESS**. Ten fixture scenarios: consent denied, locks missing/busy/fail, overlapping import attempts, stale preview, newly existing LIVE save, invalid source, storage-write failure and uncertain readback. Only one synthetic transfer wins. Shared wallets and paid entitlements/voices unchanged.
2. [Native two-tab Chromium Web Locks QA #43524558022](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43524558022) **SUCCESS**. Two separate tabs in ONE fresh isolated browser context open the same-origin TEST test server. Tab A holds an actual native Web Lock, tab B's competing consented transfer returns `another-transfer-in-progress`. Once A releases the lock, only A transfers the synthetic progress; B cannot replay it. Asserted TEST currency is excluded, existing LIVE progress protected, and native wallet, wheel ownership, voice settings and TEST source remain unchanged. No real user browser data was used.
3. Existing consent-screen browser QA remains [#43523462125](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43523462125) **SUCCESS**. The published rehearsal UI at 390×705 and 320×568 uses fake in-memory storage, not this new v2 code.

The first native browser test run #43524331713 failed because the test itself awaited a held-lock browser evaluation before it issued the release command, then closed the page. The corrected runner starts the held request asynchronously *inside* the tab and returns control to the test before releasing it. The rerun #43524558022 passed. **No product/game code was modified to fix the harness.**

## What this does NOT prove

- **Non-participating writers are not serialized by Web Locks.** The LIVE auto-migration script and older running tabs must be updated/retired as part of any future authorized release. This is the key remaining migration-safety blocker.
- A browser without working Web Locks is blocked rather than silently migrating. **iPhone Safari and Samsung Android Web Locks behavior has not been tested on the owner's devices.**
- A verified, user-accessible pre-import native backup, rollback UI, and actual LIVE-compatible v2 save/export/import semantics remain to be built and tested.
- The tested v2 module is an inert candidate, **not** wired to the actual game or user-facing consent page. It cannot alter production wallets or user data without a separately authorized integration.
- The full Word Trails shared-platform release gate (settings, audio, voice, Ocean Glow, no-double-reward, save migration, physical-device play and independent Scripture signoff) remains BLOCKED.

## Next work, before owner phone duty

Audit/restore **single authoritative audio/settings ownership**, original announcer clips, and Ocean Glow full effects. Design controlled replacement of the existing LIVE automatic importer; test real save v1/v2 compatibility, backup and rollback in isolated synthetic contexts; freeze a proposed release candidate **only in TEST** and run full cross-mode regressions. Then physical Samsung/iPhone Safari owner acceptance and explicit LIVE authorization.

**LIVE preserved:** Story-Trails main remains at `74a96491770ab6aa7229889ce1aa4733e06666d8` after this audit. No LIVE changes, no real save migrations, no token conversions.

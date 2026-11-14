# Bible Unfolded TEST — native full-backup transaction v7 checkpoint

**Project date:** November 13, 2026 local (CI completed November 14 UTC). **TEST only; LIVE unchanged.**

## Why this checkpoint exists
The current native TEST v2 backup recovery journal records only previous values. Its automatic recovery can overwrite an update from another browser tab if a restore was interrupted. Separately, an old LIVE Word Trails importer can run without consent or a cooperative lock. The v7 proof below does NOT replace either legacy implementation.

## Implemented (unlinked TEST research candidate)
- `experiments/word-trails-native-full-backup-transaction-v7.js`: not linked in the root game, native Settings, or Word Trails. Merely loading the module accesses no browser storage.
- A caller-injected controlled storage adapter, cooperative Web Locks adapter, and transaction ID supplier are required. The prototype does not automatically access player storage.
- `preview()` checks the exact proposed before/after changes, without modifying progress. It is **not** a real native backup-format validation routine.
- `apply()` requires explicit approval plus separate backup confirmation, obtains an exclusive cooperative Web Lock, rechecks source state, writes an exact before/after journal **before** modifying target keys, verifies every write, and only then records commit.
- Unexpected newer values, missing/busy Web Locks, invalid keys, old v2 journals, partial writes, or uncertain cleanup fail closed or require review. An uncommitted recovery requires explicit approval. A committed restore is never automatically rolled back.
- Proposal excludes the LIVE crossword key and unknown other-app keys. Word Trails TEST coins do not convert into native Insight Tokens.

## Automated evidence
**[GitHub Actions v7 #43534737457 — SUCCESS](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43534737457)** at TEST commit `b8069f02c0db952896b36df996f6a5c899d2df1f`.

1. **15 controlled synthetic-storage scenarios passed**: no-operation script load; read-only preview; required consent/backup; missing/busy locks; exact restore; stale-preview rejection; old journal quarantine; invalid/duplicate/LIVE keys; explicit partial recovery; newer-wallet conflict; committed recovery cleanup; invalid marker; injected quota/write failure; an uncooperative writer.
2. **Real same-origin two-tab Chromium tests passed** at 390×705 and 320×568 emulated mobile viewports. One tab holding the lock blocked the other tab from restoring; after release the consented synthetic transfer completed; a newer wallet update then prevented an unsafe rollback. Fictional owned Ocean Glow, voice preference and prior LIVE crossword data remained unchanged.
3. **[TEST Pages deployment #43534736557 — SUCCESS](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43534736557)**; the actual game does not load the experimental module.

**QA history:** The first combined workflow was invalid due to an unquoted colon in its step name, then corrected. Its first actual browser run passed 390×705 but failed an assumption that a second tab's localStorage write becomes visible immediately. The test was adjusted to wait for exact state propagation; both viewport checks passed afterward. This proves the observed two-tab protocol in those controlled browser runs, not universal synchronization or physical phone compatibility.

## Unresolved blockers
- **Actual game v2 recovery is still unchanged.** It may still replay legacy journals in current TEST gameplay. Installing a standalone v7 script later would not retroactively prevent an old v2 module from running first.
- **A trusted native complete-backup planner and real user interface have NOT been implemented.** A user must be shown reliable saved-checkpoint status, actual backup validation, wheel/Insight Token preservation, and explicit confirmation rather than accepting arbitrary change lists.
- Web Locks only protect participating tabs. Already-open/cached LIVE importer or older native v2 writers may still operate without a lock. Browser cache transition and old-tab strategy require separate engineering and acceptance.
- Shared-origin TEST/LIVE native records, v1 and v2 formats, manual recovery from uncertain writes, physical Samsung and James's iPhone Safari, JW.org/NWT editorial signoff, complete native-game regression, and named reversible LIVE checkpoint remain release gates.

**Owner and James stay OFF DUTY. DO NOT PROMOTE TO LIVE.** Original protected LIVE head independently checked as `74a96491770ab6aa7229889ce1aa4733e06666d8`.

# Word Trails NEXT — coordinated backup, cross-format and rollback gate

**November 13, 2026 · Visual Lab TEST only · LIVE still protected · no real user saves touched**

## Source audit — separate v2 complete backups, not a direct bridge

The original protected LIVE repository already has `bu-platform-saves-v2.js`. TEST also has a v2 coordinator. The implementations share the same architectural principle: the original Bible Unfolded home Settings owns the real complete-game Export / Import UI, native `bible-unfolded-*` and `story-trails-*` keys are in the native backup, and Word Trails has a dedicated extension containing its crossword state and mode-specific audio settings.

**Their formats are intentionally different.** TEST exports `BibleUnfoldedSave` version 2 with `extensions.wordTrailsNext.format = "WordTrailsNextTEST"` and TEST crossword save key `bu-visual-lab-wordtrails-next-v1`. LIVE exports version 2 with `"WordTrailsNextLIVE"` and LIVE crossword key `bible-unfolded-word-trails-next-v1`. Those formats **must not be fed into the other's complete-backup importer**. The test and live pages share a `github.io` browser origin and thus the native wallet is common to both. A player-approved complete-backup restoration *can replace the native wallet by design*, even though it protects permanent paid-wheel ownership. It is **not** the same as consent to transfer only crossword progress.

The existing v2 coordinators have a per-import rollback journal and `recoverPending()` for interrupted writes. They preserve original paid-wheel entitlements by unioning incoming/current wheel ownership, and TEST puzzle coins are never automatically converted into native Insight Tokens. However, this is **not a cross-tab-transaction protocol**: old tabs and the published LIVE automatic migration may write without a cooperating exclusive lock. This remains a release blocker, not something solved by older backup code.

**Verified behavior, read-only, using actual source in isolated fakes:** [QA #43527972235](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43527972235) **SUCCESS**. Test code `scripts/qa_word_trails_backup_v2_crossformat_and_recovery.cjs` loads actual TEST coordinator plus the **exact protected LIVE coordinator** from commit `74a96491770ab6aa7229889ce1aa4733e06666d8`, verifies the LIVE Git blob `ae775f68524dd946866708e0d450c0f45f1bd77f`, and checks **11 synthetic scenarios**: v2 backup/export previews, strict rejection of cross-format backups and invalid wallet/progress, preserved purchased wheels across an explicitly chosen complete restore, currency separation, idempotence, failed-write rollback, and manually simulated crash-journal recovery. Zero actual user data or LIVE repo edits.

## Recovery checkpoint v3 — unlinked crossword-only candidate

New **inert** TEST-only module: `experiments/word-trails-recovery-checkpoint-candidate-v3.js`. It depends on the already-reviewed v1 source validator and v2 cooperative exclusive Web Lock; the module does **not** run a migration, download, or rollback on page load and is not loaded by the real Word Trails game or its public practice screen.

- **Read-only preview and export:** creates an optional private `BibleUnfoldedWordTrailsRecoveryCheckpoint` version 3 object. This contains only the source TEST crossword state, its independently validated, normalized expected LIVE crossword state, and a confirmation that there was no LIVE crossword save beforehand. It **never includes the native wallet, paid-wheel records, other game modes, voices, or Settings**. The exported text contains personal crossword data; users must keep any real checkpoint private.
- **Before any transfer:** requires `approved:true` plus `backupConfirmed:true` with a valid checkpoint. It then calls v2's consented, locked, source-revalidated transfer. Without Web Locks, with a missing/changed source, or when LIVE crossword progress exists, it refuses.
- **Optional rollback:** requires separate explicit rollback permission and the same exclusive lock. It removes only the original imported LIVE crossword key if that key **still equals the exact validated import result**. If the player has continued playing and made progress, it refuses rather than erasing the newer save. A changed TEST source does not itself prevent restoring an unchanged imported LIVE key using a private checkpoint.
- **Failure safety:** missing locks, invalid/oversized/tampered checkpoints, ambiguous readback, write errors and removal errors fail closed. Never automatically delete a possibly valid save if the outcome is uncertain. No native wallet, owned-wheel, voice, music preference, or original TEST source writes.

**Verified source-level tests:** [QA #43527775842](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43527775842) **SUCCESS**, with **18 synthetic v3 checkpoint/recovery scenarios**, plus 8 older v1 consent scenarios and 10 v2 lock/fault scenarios. The new implementation has not been enabled for the actual game.

## What still has to happen before LIVE

1. **User-facing checkpoint export/download and guarded restore integration:** TEST mock confirmation UI currently uses fake memory and has no v3 file-download and recovery button. Do **not** enable a real-data import or recovery option until this is intentionally designed and tested under native Settings with an explicit player action.
2. **Retire or reconcile the current LIVE automatic importer**; it runs without consent and without cooperative Web Locks, so it could recreate an intentionally rolled-back key. Existing running tabs can also write without locks.
3. **Protect existing complete-game backups and natural full-backup warning screens.** A Word Trails-only checkpoint must never act as a replacement for a complete Bible Unfolded backup. Keep v2 TEST and LIVE formats distinct; do not load a TEST complete backup into LIVE.
4. **Cross-tab safety of complete-backup coordinator:** the old v2 journal's rollback is not aware of another tab updating a key after its journal snapshot. Do not declare native whole-game restore concurrency-safe from single-tab synthetic tests alone.
5. **Regressions and human acceptance:** full cross-mode gameplay/rewards/audio, physical Samsung Android and James's iPhone Safari, independent NWT/JW.org Scripture editorial approval, frozen rollback checkpoint, and explicit owner approval remain required before any new LIVE deployment.

**Status:** Backup/recovery **engineering proof in TEST, NOT a released player feature**. No real player progress moved; no TEST coins moved to native Insight Tokens; the original LIVE repository remains unchanged.

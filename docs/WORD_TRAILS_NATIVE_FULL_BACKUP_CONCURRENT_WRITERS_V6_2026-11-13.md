# Word Trails / Native complete-backup lost-update gate — v6

**13 November 2026 — Visual Lab TEST only. Original Story-Trails LIVE protected.**

## Finding: LIVE release remains blocked by two distinct browser-writer hazards

1. A cached/open old LIVE Word Trails auto-importer can recreate crossword progress after a newer, consented transfer is rolled back. Replacing the old script URL or using Web Locks in *new* code does not stop already loaded, non-cooperating JavaScript. This was proven by [v5 two-tab QA](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43531124347).
2. **New v6 finding:** The real TEST native `bu-platform-saves-v2.js` `recoverPending()` uses a v2 journal recording only *previous* values. After an interrupted complete-game backup restore, a second tab may update a wallet/progress key, then a new first tab can execute the real legacy recovery and restore the *earlier* key value, discarding the second tab's newer update. This does not require a Word Trails-only migration. The test reproduces it with synthetic data and the unmodified actual TEST coordinator.

Both require a safe rollout design. The second hazard applies to coordinated native full-game import/recovery, not just crossword progress.

## Implemented: TEST-only inert v6 conflict-aware candidate

New unlinked file: `experiments/word-trails-full-backup-journal-guard-v6.js`. Not imported by any actual game page. No storage reads/writes on source evaluation. This **does not replace or disable** the current v2 coordinator.

- Treats the existing v2 rollback journal as **unsafe for automatic recovery** because it has no expected after-values.
- Models a *proposed, not yet active* v3 journal format `BibleUnfoldedGuardedFullBackupRecovery` with exact `before` and `after` values for each key.
- Read-only inspection compares each current value against the corresponding before/after values; if another tab has written an unexpected value, rejects recovery instead of overwriting it.
- Requires explicit user approval, private-backup confirmation, and an exclusive cooperative Web Lock for an attempted recovery. Missing/busy/failed locks refuse.
- On a clean, explicitly approved synthetic fixture, rewinds only known expected values and removes its v3 journal after verified completion. No unrelated key is touched.
- Invalid/unknown journals, unexpected keys, missing confirmation, changed source, and conflicts fail closed. Ambiguous writes retain a manual-review warning.
- **Limitation:** No Web Lock can protect against already-running old code that does not participate. Equality checks cannot detect an unrelated writer that happens to write exactly the same value. This prototype is not a full transactional protocol and cannot make v2 safe by loading after it.

## Verified automated evidence

[GitHub Actions v6 QA #43532348134 — **SUCCESS**](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43532348134)

New test: `scripts/qa_word_trails_full_backup_journal_guard_v6.cjs`, CI: `.github/workflows/qa-word-trails-full-backup-journal-guard-v6.yml`.

Tests include:
- Reproduce old TEST v2 journal *actually* rewinding a later synthetic native-wallet update after an interrupted restore.
- Candidate rejects v2 legacy journal and performs no writes on inspection.
- Candidate rejects recovery without two confirmations, native Web Locks, or exclusive-lock acquisition.
- Conflict-aware journal refuses overwriting a newer synthetic wallet value while preserving the affected trail and journal.
- Clean or partially already-recovered v3 fixture is restored only with explicit consent, leaving unrelated voice preference unchanged.
- Invalid/key-injection journal rejected, empty journal harmless, module not linked into root/game/Word Trails.

**No real browser storage or user saves accessed, and no changes to LIVE.** TEST head on verification: `4b133e658a0420043f7667cb2a43d34e88972894`; protected LIVE head `74a96491770ab6aa7229889ce1aa4733e06666d8`.

## Next mandatory release engineering work

1. Design a new controlled **native full-backup coordinator** in TEST that writes before/after expectations in a new journal *before applying any changes*, validates state under a lock, and never auto-rewinds legacy journals. A v6 unlinked helper alone is not enough.
2. Make recovery review visible to users and require a saved complete-game backup before an actual restore. Address partial writes, same-value ABA races, off-screen/background tabs and unsupported Safari Web Locks. Old-version v1 imports need a separate strategy; keep existing export/import UI and paid-wheel ownership semantics.
3. Plan an explicit stale-tab and browser-cache phaseout. Current LIVE automatic migration remains consentless, so future TEST-to-LIVE release must retire old importer safely without assuming old already-running code disappears.
4. Continue cross-mode wallet, voice, SFX, wheel purchase/equip, announcer, restart and navigation QA; independent JW.org/NWT editorial signoff and physical Samsung/iPhone Safari testing.
5. Freeze a reversible release manifest and named LIVE recovery checkpoint; require the owner's specific LIVE approval. Never copy TEST data/backups or whole TEST tree to LIVE.

**RELEASE STATUS: BLOCKED. Owner and James off duty.**

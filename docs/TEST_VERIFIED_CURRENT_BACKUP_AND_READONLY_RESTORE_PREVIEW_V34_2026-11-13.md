# Bible Unfolded TEST — verified current-backup file and read-only restore preview v34

**Project date:** November 13, 2026 local, verified via GitHub Actions November 14 UTC.
**Scope:** TEST Visual Lab only; protected original LIVE `basilejoseph325-jpg/Story-Trails` unchanged. No experimental v7 writer is linked to player data.

## Problem and safe next stage

Earlier TEST versions had a native read-only restore planner API (v27), an incomplete-journal quarantine (v30), a player recovery-review and current-progress backup download (v31), a competing-page observation guard (v32), and a cold-start risk assessment for the original LIVE auto-migrator (v33). However, a player had no actual Settings workflow to verify a downloaded current backup against **all current native/TEST saved values**, then inspect what a different complete backup would change *without applying it*.

TEST v34 adds a **collapsed** native Settings details panel, **Preview a TEST backup safely (no restore)**, that leaves existing gameplay, global Settings, audio, Word Trails cards and layout alone.

## Actual UI and APIs

1. The player uses the existing **Export** action to request a current complete TEST backup, then checks Downloads. The browser may block/redirect downloads; a click alone is not proof of durable saving.
2. The player opens the new review panel, presses **Verify downloaded current TEST backup**, and selects the actual JSON file. `verifyCurrentBackupCopy()` runs the existing `nativeData()` format/limits/protected-key checks, then compares **every current native backup key and exact raw value** plus both TEST Word Trails progress and audio preference records against a fresh current `makeBackup()` read. `exportedAt` is intentionally irrelevant. A missing, changed or additional record fails verification. It reports equality *at that instant* only, with no progress write.
3. After successful current-backup verification, **Preview another TEST backup (read only)** prompts for a separate candidate JSON file. The UI checks again that the verified current backup still matches the newest game data. It then calls the **same active `previewRestoreWrites()`** and `protectedNative()` rules previously validated in v27 (wallet/paid-wheel union, TEST currency isolation). It reports total changed save keys, native wallet keys, ownership keys, TEST crossword state and native current vs incoming Insight Tokens/Points as well as current vs incoming TEST crossword coins/completed levels. It never embeds raw save JSON into page HTML and performs no restore.
4. Mixed backups containing the protected original LIVE crossword key are rejected. Invalid file formats, oversized input, unresolved legacy restore journals, and external-writer activity remain blocked. If another page or frame writes a shared native/LIVE key, the verified-current-file approval is cleared and the file must be reselected. Same-tab changed wallets are also caught by re-reading current storage before preview.
5. The v34 review has **two file-selection buttons and zero Apply/Restore actions**. Its `previewRestoreReview()` API returns an explicitly readonly summary (`noWritesPerformed=true`, `restoreDisabled=true`). Review state is in memory only, not localStorage. The review does not authorize real restore, migration, or LIVE promotion.

## Important limitations and release blockers

- This is **not** full-game restore safety: v34 adds no real-data transaction writer, Web Locks integration, consent-to-apply handler or automatic recovery. The separate unlinked `experiments/word-trails-native-full-backup-transaction-v7.js` is still an isolated research prototype.
- **The existing original Settings native import handler is unchanged by v34**. The separate preview panel cannot by itself prevent a player from using the legacy import control; prior v30/v31/v32 import guards remain. This is an important blocker for any claim of fully safe player recovery.
- The current TEST export intentionally **excludes protected LIVE crossword progress**, though other shared native keys exist on the same origin. A verified TEST backup cannot restore the original LIVE crossword save or prove a named browser checkpoint was made.
- Matching two files at one instant does not guarantee the browser has permanently stored them, that other tabs have closed, that a backup contains a known-good pre-crash save, or that another tab will not write after verification. Future actual restoration needs exclusive locking among cooperating writers, conflict detection for non-cooperating writers, and explicit user consent and verified backups.
- The normal gameplay engine can legitimately change saved wallet/Points between file export and verification. Such a changed current value causes verification to fail, which is correct; take and verify a fresh backup if needed.
- Continue protecting LIVE from any code mutation. The v26/v27/v30/v31/v32/v33 safeguards remain active; physical Samsung Android and iPhone Safari QA are still outstanding, as are exact NWT 2013 / JW.org editorial review and a named reversible promotion checkpoint.

## Test evidence

**[v34 native file-backed verification & preview CI #43543898524 — SUCCESS](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43543898524)**. Twelve fake-DOM/localStorage cases using the actual `bu-platform-saves-v2.js` coordinator, plus a real native Settings file-input Chromium test at 390×705 and 320×568. Both locales used fictional new profiles; no actual player storage or LIVE files touched. Real file-picker tests verified current equality, staged candidate preview, wallet/paid-wheel summaries, LIVE-key rejection, and invalidation after another same-origin page writes a newer wallet, with zero JS page errors.

**Full v34 pre-release gate**: `QA Bible Unfolded TEST full pre-release regression v34 (thirteen groups)` at `.github/workflows/qa-test-release-readiness-v25.yml` includes the new verified-file QA along with all prior v26/v27/v30/v31/v32/v33 and game-mode tests. Check Actions run status before claiming complete.

**Public v34 QA**: `.github/workflows/verify-published-verified-backup-preview-v34.yml` waits for public cache-busted v34 bootstrap and uses two fresh isolated browser contexts to run actual published TEST native Settings selected-file review and mock external-wallet-write invalidation. Confirm completion status before claiming success.

**Protected LIVE remains off limits.** User and brother James remain off duty until physical-device acceptance is genuinely ready.
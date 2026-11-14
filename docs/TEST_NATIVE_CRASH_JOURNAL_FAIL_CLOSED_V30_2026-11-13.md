# Bible Unfolded Visual Lab — TEST native crash recovery v30 checkpoint

**Project local date:** November 13, 2026 (GitHub Actions Nov 14 UTC).
**Scope:** TEST (`basilejoseph325-jpg/Bible-Unfolded-Visual-Lab`) only. **Original LIVE (`basilejoseph325-jpg/Story-Trails`) unchanged.**

## Material safety problem discovered

The active TEST native complete-backup coordinator stored v2 rollback journals containing only **previous** values. On a new page load after an interrupted import, `recoverPending()` used to write every previous value back to browser storage without verifying if another open tab had saved something newer. That could silently erase a newer Insight Token wallet, Word Trails TEST progress or other native Story data. Our earlier v26 patch excluded the protected LIVE crossword key, but this broader native-wallet/progress exposure remained.

An actual pinned vulnerable TEST coordinator (Git blob `9d68acacb2d65eaccb050f6e3688cf2bf77892aa`, pinned from commit `476eb6d5cf73f884b763c46b07e10b1a0c789d0f`) was executed **only in fictional Node VM storage** and reproduced silent loss of a newer wallet and TEST puzzle state.

## Active TEST-only fix

Changed `bu-platform-saves-v2.js` (existing native Settings save coordinator):

- **No automatic data rollback from any old incomplete v2 journal on startup.** A previous-only snapshot cannot establish whether another tab made newer writes. Old journals are kept for deliberate manual review, without rewriting wallet, voice, wheel or progress keys. The original native Settings status warns the player that recovery needs review.
- Even an old **generic `COMMITTED='yes'` marker is not enough** to prove the operation finished with the expected values. On a later page load, the old v2 marker and journal are preserved for review rather than automatically cleared. Orphan or malformed metadata likewise blocks new restoration rather than silently disappearing.
- The only same-call rollback allowed after an immediate restore failure checks that the current journal is still the one this call wrote, no commit marker exists, and **every touched user value** still matches either the known before or known after value from this same operation. Unexpected newer wallet or game progress aborts the rollback without touching further user values and keeps the journal.
- An unexpected commit marker during the current operation is only treated as success when the **exact journal and all expected new user values** verify. A conflicting marker/wallet is a stop sign, not a successful import.
- If the native data was committed but metadata cleanup fails, preserve the restored data, the journal, and the manual-review warning. The code does not undo a confirmed import just because cleanup failed.
- Reject any new complete-backup import if either a legacy journal or unresolved commit marker is present. Read-only emergency exports remain possible, excluding the TEST recovery journal and the LIVE crossword key.
- Original native v1 backup handler, paid-wheel entitlement merging, root Settings ownership, TEST currency isolation and other gameplay source files were not replaced. The unlinked v7 before/after journal and Web Locks prototype remains a separate research candidate.

**Important limitation:** This is a **fail-closed containment** measure, not an automated repair of an old interrupted full-game import. The player may need a guided manual-recovery flow before another import. A same-call before/after comparison cannot exclude every same-value/ABA race from a noncooperating tab, and old already-open/cached scripts may still run the previous behavior. This is **not** authorization for LIVE migration.

## QA evidence

**[Dedicated v30 crash recovery #43539586255 — SUCCESS](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43539586255)** at code commit `6b24d694a758d9a75703b85afd3dd5e5b0ccc97c`: **13 fictional-storage tests passed**, after first reproducing the real old source's destructive behavior. Cases cover fresh no-op load, newer native wallet and crossword preserved after crash, protected LIVE progress, malformed journals, old generic completed markers, orphan markers, quota failure during an ongoing import, foreign wallet update during failure, racing generic commit marker, cleanup failure preserving progress, blocked re-import, unchanged read-only emergency export, and blocked orphan-commit import.

**[Full TEST v30 release sweep #43539586157 — SUCCESS](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43539586157)** at the same code commit: **nine regression groups / twelve workflow jobs all passed**. Includes all 30 Word Trails levels and original voice asset coverage; native game modes, menus, audio, Ocean Glow and back/refresh; Trivia stone/answer/sound quality; Family Worship 42 topics/four levels/six-player mobile layout; native TEST save/export/import and practice; isolated v7 transaction and actual two-tab Chromium contention; v26 LIVE crossword exclusion; v27 exact read-only restore-plan parity; and the new v30 old-journal fail-closed gate.

**[Published TEST cold-recovery browser #43539769820 — SUCCESS](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43539769820)** at TEST commit `744ed4ca955bcf4c10de964b79330e384f03f687`: public GitHub Pages chain and actual native root Settings checked in two isolated synthetic browser contexts **390×705 and 320×568**. The public page fetched the versioned v30 save coordinator, excluded LIVE crossword progress from TEST exports, refused a contaminated backup, and kept the read-only restore planner. After an actual page reload seeded with a deliberately unfinished v2 journal and a newer fictional wallet, both runs retained the journal and native recovery warning, protected newer wallet value and owned `seawheel`, and preserved TEST crossword and LIVE sample progress. **Zero page errors**.

The first published-site test incorrectly required the wallet JSON to remain byte-identical across a *normal* game reload. The native game legitimately normalized/awarded new daily Points/Tokens in its fresh browser profile. The corrected test distinguishes nondecreasing newer balances and preserved wheel ownership from a destructive rollback, and separately requires the unfinished journal to remain. Both layouts passed. All tests use fictional browser contexts and do not touch actual user state.

**[TEST Pages deployment #43539769339 — SUCCESS](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43539769339)** at `744ed4ca955bcf4c10de964b79330e384f03f687`. Native source safety changed on TEST only; this final commit changes the public QA test, not the native code.

## Mandatory release blockers / next engineering

1. Provide a trustworthy **player-facing recovery-review, saved-checkpoint and explicit restore consent** workflow. It must avoid asking a player to delete ambiguous old journals without a verified backup. No direct v7 real-data restore is integrated yet.
2. Resolve **already-running, old/cached LIVE and TEST tabs**, especially the consentless original LIVE Word Trails autoimporter that can recreate progress after rollback. Web Locks only coordinate participating tabs, and the updated v30 code cannot modify a tab already running an old script.
3. Integrate/verify a properly validated transactional writer for future TEST imports with the real v27 planner, v7 before/after journal and version transition strategy. Its UI must distinguish backup downloaded vs merely generated, and preserve paid wheels/Insight Tokens.
4. Complete independent NWT 2013/JW.org editorial signoff, physical Samsung Android and James's iPhone Safari audio/menu/back/recovery testing, named reversible LIVE rollback checkpoint, and explicit selective LIVE promotion approval.

**Original LIVE head verified unchanged** at `74a96491770ab6aa7229889ce1aa4733e06666d8`. **User and James remain OFF DUTY. No LIVE promotion.**

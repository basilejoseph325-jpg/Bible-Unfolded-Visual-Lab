# Bible Unfolded — TEST native Settings old import suspended v35

**Project day:** Nov 13, 2026 local / GitHub CI Nov 14 UTC.
**Protection boundary:** Only Visual Lab TEST `basilejoseph325-jpg/Bible-Unfolded-Visual-Lab`. The protected original LIVE `basilejoseph325-jpg/Story-Trails` repo and real browser player storage were not accessed/modified by development or tests.

## Security change

Before v35, the real TEST native Settings `#save-file` path still delegated version-1 backups to the old native importer and executed a synchronous v2 `applyBackup` for newer complete backups. These handlers could write a player's same-origin LIVE native wallet while a cached/old LIVE tab remained active. Earlier v26–v34 guards and previews were useful but did not close this UI route on a healthy TEST page.

**Active TEST v35 code in `bu-platform-saves-v2.js`** closes the ordinary player-facing import route while leaving the original native Settings, Export action, TEST/current-backup file verification and read-only candidate restore preview intact:

- The native `#save-import` button is intercepted in the capture phase. It opens the existing **Preview a TEST backup safely (no restore)** section and displays a clear message that TEST backup RESTORE is temporarily disabled. It no longer calls the old importer through its ordinary click handler.
- The native `#save-file` file input has an early capture-phase `change` handler that calls `preventDefault()` and `stopImmediatePropagation()` before the old native handler or another normal event listener can accept a chosen file. Its `onchange` property also uses the same fail-closed function in case it is invoked directly. It clears the input selection.
- **No backup file is read, parsed, or applied** by this blocked import route. Both v1 and v2 complete backups, malformed files and older mixed TEST/LIVE backups are refused identically, without showing a consent dialog or creating rollback/commit journal records. On a pending v2 journal or observed external wallet writer, the existing recovery/external-page warning still appears.
- Native Export still creates a TEST-only complete backup that excludes protected LIVE crossword progress; v34's player-selected current-file verifier and exact read-only restore preview are still available. Paid wheels are not rewritten by the UI guard.

## Browser and QA evidence

**[TEST v35 UI block test #43544881834 — SUCCESS](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43544881834)**. Ten actual native-coordinator fake-DOM tests (Import click, native v1/v2/malformed/mixed file change, direct onchange, existing wallet/external-writer block, Export and v34 preview unchanged), plus real localhost Chromium 390×705 and 320×568. Both browser profiles reported zero JS errors, no user consent dialogue and zero changes to fictional wallet, crossword or journal values.

**[Published public TEST #43545035779 — SUCCESS](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43545035779)**. The public cache-busted TEST bootstrap loaded `bu-platform-saves-v2.js?v=20261113-native-import-paused-v35`. Fresh Chromium sessions at 390×705 and 320×568 verified the real native Settings Import click and file inputs could not write any seeded fiction wallet/TEST/LIVE crossword/journal data. Export and preview remained available; zero JS errors.

**[Native save compatibility #43544986111 — SUCCESS](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43544986111)**. Existing synthetic low-level v2 journal/rollback/purchased-wheel tests passed, and the user-facing import test now deliberately requires no navigation and no native data mutation. CI static checks were updated from the obsolete instruction to delegate native v1 to requiring capture-phase interception.

**[Full v35 TEST regression #43545152879 — SUCCESS](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43545152879)**: **FOURTEEN groups / SEVENTEEN jobs GREEN** at `7ec881a9fe4e3f5bff13f571468699fbf024481c`. Includes the native v35 Settings import guard, all older v26–v34 backup/recovery guards, all 30 Word Trails levels/20 native voice assets, audio/Ocean Glow, Trivia, Family Worship and native cross-mode/navigation checks. **[Previously affected published TEST v34 preview #43545152678 — SUCCESS](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43545152678)**: both 390×705 and 320×568 layouts passed the current native v35 source while testing the retained v34 read-only preview and external-wallet invalidation, with zero JS errors.

## Important limitations (still no LIVE promotion)

- **This is a TEST Settings UI safety pause, not a global browser write lock.** It does NOT stop old already-running cached pages, other native scripts, direct developer/JavaScript calls to `window.BUPlatformSaves.applyBackup`, or an original LIVE auto-migrator that ignores newer locks. The low-level v2 apply function remains available to internal isolated synthetic QA, and is not approved as a real player-facing restore path.
- The old LIVE crossword migrator can reconstruct a missing LIVE key from TEST progress; this QA deliberately never wrote LIVE. Cross-origin and multi-tab behavior must be managed by an owner-controlled transition plan and verified player backups.
- A matching current downloaded TEST file proves equality at that instant only. It does not prove a durable backup exists or that a prior good checkpoint can be recovered. No user-visible v7 transaction/restore consent button has been enabled.
- To restore safely in the future, integrate a verified complete backup, explicit backup-before-apply, trusted v27 planner, v7 transaction ID + before/after journal and cooperative Web Lock, plus noncooperating-tab conflict handling. Review legacy incomplete journals without auto-rewind. Preserve wheel ownership and isolated TEST currency. Finish physical Samsung Android/James iPhone Safari and JW.org/NWT 2013 editorial checks before a selective LIVE owner-approved deployment.

**User and James remain OFF DUTY. No LIVE migration authorized.**
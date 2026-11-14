# Bible Unfolded TEST — Native recovery review and current-progress backup v31

**Project date:** November 13, 2026 local (GitHub Actions November 14 UTC).
**Repository scope:** `Bible-Unfolded-Visual-Lab` TEST only. Protected original `Story-Trails` LIVE not modified.

## What was finished

An interrupted TEST v2 full-game restore leaves a previous-only recovery journal. Since old cached tabs may have written newer wallet, Story or Word Trails progress, the active TEST v30 coordinator correctly quarantines the journal instead of rewinding it. Previously, this safety warning was only a small status line and the original native v1 file-import path was still callable before the v2 `applyBackup` guard.

**Native Settings v31 in `bu-platform-saves-v2.js`:**
- When the TEST v2 rollback journal or orphaned generic commit marker needs review, native Settings now shows a compact expandable **Review an interrupted TEST backup** section below the original complete-backup status. The original Settings menu remains the only player-facing save interface.
- The section explains that automatic recovery stopped to avoid overwriting newer progress, that TEST/LIVE share browser storage, and that other cached/open tabs are still a concern.
- A single **Download current TEST progress** button invokes the existing native `makeBackup()` + browser download path without touching saved data or the ambiguous recovery journal. It excludes the protected LIVE crossword key. The player is told to verify the file in Downloads. Download request does **not** certify a file was successfully saved, nor reconstruct pre-interruption progress; the current state may already be partly restored.
- There is deliberately **no reset, clear-journal, manual rollback, auto-repair, or apply-backup action** in the recovery panel.
- On a selected backup file, **both `BibleUnfoldedSave` v1 and v2 imports** are now rejected while either legacy recovery journal or commit marker is present, before the original v1 `onchange` handler, v2 import confirmation or any restore writes. Previously, the original v1 import route bypassed the v30 v2-only guard.
- On healthy pages without unresolved recovery metadata, the original native v1 import delegation and native v2 save/export/import behavior remain available.
- A small improvement to normal complete-backup messaging says to check Downloads and does not promise a successfully stored file.
- The freshly opened TEST bootstrap chain was cache-busted: `journey-progress-caption.js` loads the v31 banner, which loads the v31 native coordinator. Old already-open scripts cannot be retroactively changed.

## Exact tests and publicly deployed evidence

**[v31 isolated native Settings QA #43540839062 — SUCCESS](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43540839062):** 6 tests executed the actual active native save coordinator against fictional in-memory browser/DOM fixtures. Verified recovery panel, current-progress download request, no LIVE crossword in exported JSON, no save writes, blocked native v1 and v2 imports without running original handler or confirmation, orphan marker warning, and unchanged native v1 delegation on healthy pages.

**[v31 full TEST release sweep #43540925259 — SUCCESS](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43540925259):** 10 required test groups / **13 individual GitHub Actions jobs all green** at core/test-suite commit `851c58e348e786576cca337413f5b8e9219ae5df`. Includes v31 recovery UI, v30 native crash journal fail-closed guard, v26 LIVE-key isolation, v27 read-only planner, v7 synthetic/two-tab Web Locks proof, original modes and navigation, all 30 crossword levels and 20 voices, native menu/SFX/wheel, and Trivia/Family Worship game and artwork checks.

**[v31 published TEST phone-sized browser QA #43541003312 — SUCCESS](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43541003312):** Real GitHub Pages public TEST page, fictional isolated Chromium profiles at **390×705** and **320×568**. Verified latest loader chain and original Settings controls. Seeded an unfinished TEST journal and newer fictional wallet/TEST crossword, reloaded the actual website, and confirmed recovery review visible with a single non-destructive download action. Using a intercepted download click in the test (no actual file downloaded to the CI runner), verified the real download handler was invoked; both v1 and v2 file-picker import paths were refused without invoking user confirmation. Journal, TEST progress, LIVE crossword sample and newer wallet were preserved. **Zero page JavaScript errors.** Normal daily login awards may increase the fictional wallet balance, so the test verifies no destructive rewind rather than byte-identical wallet JSON.

**[TEST Pages deployment #43540992161 — SUCCESS](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43540992161)** at `8562f38043b1a42f2dc7e5ea8fd398965e595fb2`. Full suite ran against `851c58e...`, and the intervening later commits only updated the published-site QA script/workflow, not native gameplay.

The intermediate v30 published workflow on a v31 source transition was superseded because its expected version strings were stale; the dedicated updated v31 public test passed. Do not treat superseded red transitions as an accepted release gate.

## What remains blocked

- Current player-facing screen is **review + current backup request only**, not an authenticated old-journal recovery or verified post-download checkpoint. There is no trusted real-data v7 recovery UI yet.
- Previously open or cached old TEST/LIVE tabs may execute unsafe native code; old protected LIVE Word Trails auto-importer can still act without consent. The new TEST loader cannot control those sessions. Do not touch LIVE until a specifically authorized, reversible transition is ready.
- Cooperating Web Locks cannot stop a non-cooperating older tab. Save-conflict handling still needs hardening before any LIVE release.
- No completed physical Samsung Android / James iPhone Safari end-to-end acceptance or independent JW.org/NWT editorial signoff for all added puzzles. Freeze named LIVE rollback checkpoint and obtain release approval before selective promotion.

**Owner / James OFF DUTY. No LIVE promotion.**

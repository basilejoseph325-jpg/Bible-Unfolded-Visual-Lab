# Bible Unfolded TEST — same-origin old-page progress-write guard v32

**Project date:** November 13, 2026 local / GitHub Actions November 14 UTC.
**Scope:** TEST (`basilejoseph325-jpg/Bible-Unfolded-Visual-Lab`) only. LIVE (`Story-Trails`) must remain protected.

## Why this was needed

The original LIVE Word Trails script `experiments/word-trails-live-migration-v1.js` has a consentless one-time migration behavior: when the `bible-unfolded-word-trails-next-v1` LIVE progress key is missing, it can read the TEST key `bu-visual-lab-wordtrails-next-v1` and write LIVE crossword progress tagged with `{migration:{version:1,source:'Visual Lab crossword progress'}}`. Already-open/cached LIVE pages can continue running this old code without honoring the newer TEST backup locks or dialogs. Merely fixing new TEST source does not remotely disable old tabs.

Because TEST and LIVE run on the SAME `github.io` origin, modern TEST receives browser `storage` events when OTHER documents on this origin change shared progress. A separate native game iframe may also generate a storage event, so the event alone does **not** prove a particular old tab was involved.

## TEST-only player-facing containment added to `bu-platform-saves-v2.js`

- A passive memory-only `storage` event listener watches protected LIVE crossword progress, the two shared native wallet records, and both paid-wheel ownership keys. It ignores unrelated keys, identical values and unrelated storage areas. **No values or safety flags are written to localStorage by this guard.**
- When a different document changes one of those keys, Settings receives an expandable **Shared progress changed in another open page** review. It explains that this may be ordinary gameplay or another embedded frame, and that an older backup import could overwrite newer values.
- When the changed LIVE crossword record carries the precise old migration marker quoted above, the panel adds an explanation that an older automatic TEST-to-LIVE migration record was **observed**. It does NOT assert the writer's identity or prove the LIVE save is incorrect.
- For the remainder of that TEST page session, both v1 and v2 backup file imports are refused before the old/native handler, user confirmation, or writes. Direct `applyBackup()` and `previewRestoreWrites()` also reject until the page is reopened. Normal gameplay and a read-only TEST backup download are available.
- The review offers **Download current TEST progress** using the existing complete TEST backup exporter. It warns that the download must be verified in Downloads and may itself contain a partly restored state. No reset, merge, repair, recovery-journal clearing or automatic background write is performed.
- If an old interrupted import journal is also present, the existing v31 recovery review and no-import lock remain in place. The two warnings can coexist without mutating saved data.
- New versioned TEST bootstrap URLs refresh the native save coordinator after a new page load: `journey-progress-caption.js` → `visual-lab-test-banner.js` → `bu-platform-saves-v2.js`, version `20261113-external-page-progress-guard-v32`.

## Verified quality gates

**[v32 mock and real two-document CI #43542072500 — SUCCESS](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43542072500).** Twelve fake-DOM/storage scenarios passed. An actual two-page Chromium test on the SAME origin generated the old LIVE migration marker from a second document and observed the real TEST native Settings handler respond on 390×705 and 320×568 viewports. Both backup formats were blocked, the native save UI stayed present, and 0 JavaScript errors occurred.

**[Full v32 pre-release sweep #43542096954 — SUCCESS](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43542096954).** Eleven groups, fourteen jobs green. This preserves v26 LIVE crossword exclusion, v27 readonly import plan, v30 stale-journal quarantine, v31 player recovery UI, v7 two-tab synthetic transaction, original audio/menu/Word Trails 30-level content, Trivia, Family Worship and cross-mode interaction.

**[Published TEST same-origin two-page QA #43542116485 — SUCCESS](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43542116485).** Actual public GitHub Pages loader chain checked, then two isolated browser profiles at 390×705 and 320×568 tested REAL public TEST + second same-origin 404 page, using only synthetic values. Both confirmed the migration was observed and v1/v2 imports were refused, with 0 page errors.

**[TEST Pages deployment #43542116464 — SUCCESS](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43542116464)** at TEST commit `cfdcafd388508969b2723aca693ea99500b408b5`. Original LIVE head independently checked unchanged: `74a96491770ab6aa7229889ce1aa4733e06666d8`.

## Limitations — STILL NOT READY FOR LIVE

- The browser listener cannot block an already-running old script from writing localStorage. It only notices events delivered to the new TEST page, then pauses TEST imports. A same-document script write does not generate a storage event in that document; an event can also be delayed if a tab is suspended.
- It cannot prove that an older LIVE tab is open or that a migration event represents actual data loss. It makes NO changes to LIVE, and avoids attributing a writer from the event.
- The guard is intentionally in-memory for a TEST page session; reopening TEST resets the observed-activity lock. The player must actually close other old tabs; reopening alone cannot guarantee their absence.
- There remains a small race between any validation and a legacy writer's future action. Web Locks coordinate modern participants only; no consent-safe fully integrated v7 player restore transaction is deployed.
- Before any promotion: implement a signed/verified transaction, old-tab transition and recovery protocol; independently verify exact NWT 2013/JW.org content; real Samsung Android + James iPhone Safari testing; protect original LIVE via named rollback checkpoint and explicit owner approval.

**USER AND JAMES OFF DUTY. DO NOT MODIFY LIVE.**

# Bible Unfolded TEST — LIVE crossword backup isolation + native read-only restore plan v26–v27

**Project date:** November 13, 2026 local time (CI UTC November 14).
**Scope:** Visual Lab TEST repository only. Protected Story-Trails LIVE was never modified.

## Material bug discovered in active TEST native complete-backup handling (v26)

TEST and LIVE share the GitHub Pages browser-storage origin. Original TEST native `bu-platform-saves-v2.js` used a broad `bible-unfolded-*` key selector for portable backups. This matched the **protected LIVE crossword save** `bible-unfolded-word-trails-next-v1`. Thus a TEST complete backup could silently contain a LIVE Word Trails save, and importing the TEST file could later replace that LIVE record. This is distinct from TEST coins (which remain isolated) and from old LIVE auto-import code.

The original issue was reproduced with the actual pinned pre-fix TEST coordinator, Git blob `94d5770d6a1745c5af284392dee6019b95ad69d7`, using only in-memory VM localStorage. No real browser/player state was read or changed.

**TEST source protection applied:**
- Explicitly exclude `bible-unfolded-word-trails-next-v1` from the TEST native backup inventory. Exported TEST JSON now includes only eligible native keys and its separate `WordTrailsNextTEST` extension, never the protected LIVE crossword save.
- Reject imports containing the LIVE crossword key before any restore writes begin. An older exported TEST backup that accidentally included it must be replaced by a freshly exported TEST backup rather than imported as-is.
- An interrupted old v2 TEST rollback journal that mentions this LIVE crossword key cannot safely be replayed: without expected after-values, an unknown newer LIVE update may have occurred. Preserve that journal and display a recovery-review message in native Settings instead of silently overwriting the LIVE record.
- Do **not** modify the original LIVE repo, LIVE crossword key, paid wheels, other game screens, original save UI, or native v1 importer for this fix.

**CI evidence:** [v26 isolated regression #43536313589 — SUCCESS](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43536313589). Eleven fake-storage positive/negative cases include original bug reproduction, correct exclusions, protected LIVE-key import rejection, actual native restore retaining LIVE state, wallet/paid wheel union/voice preservation, replay idempotence and mixed-journal quarantine. Existing native TEST save v2 QA, cross-mode tests, and earlier five-job release suite passed after patch.

## New TEST native read-only preview (v27)

Instead of reimplementing complex wallet/wheel merging rules in the proposed v7 transaction, the actual TEST coordinator now offers a new **read-only** method: `window.BUPlatformSaves.previewRestoreWrites(candidate)`.

- Validates a TEST v2 complete backup with the existing trusted `dryRun` and `WordTrailsNextTEST` schema.
- Computes the exact changed native, paid-wheel, Word Trails progress and feel preference keys using the same private `protectedNative` merge used by the original v2 restore. Returns immutable `{key,before,after}` entries, a summary, a count, and an explicit unchanged state.
- **Reads** current localStorage, but does **not write** any value or invoke the import UI. Refuses if a previous v2 restore journal/marker requires recovery review. LIVE crossword and unrelated app keys are excluded.
- This is a necessary planner for a possible future opt-in v7 transaction, not a player-facing recovery feature. The actual original Settings v2 importer is unchanged; the v7 writer is still a separate unlinked TEST prototype.

**CI evidence:** [v27 restore preview QA #43537325956 — SUCCESS](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43537325956). Twelve fake-storage cases confirm that the read-only plan's writes exactly match the current v2 `applyBackup` result; an unlinked v7 transaction produces byte-identical protected native results under explicit synthetic consent, with paid wheels unioned, original LIVE progress unmodified, native negative Points valid, TEST currency isolated, invalid formats rejected, pending old journal blocked and stale previews refused when a newer wallet value appears.

## Published TEST and cross-mode acceptance verification (v28–v29)

- Updated only the TEST loader chain: `journey-progress-caption.js` now fetches a new versioned Visual Lab banner script, and `visual-lab-test-banner.js` fetches a new versioned native save coordinator. This reduces the risk of a newly opened TEST page loading older cached native backup behavior; already-open older scripts can still exist.
- **[Published TEST browser v28 QA #43537873673 — SUCCESS](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43537873673).** CI first verified the actual public GitHub Pages root→journey→banner→native source loader chain with no-cache HTTP checks. Then it opened the real public TEST game in isolated Chromium browser sessions at 390×705 and 320×568 with fictional fresh-storage values. Confirmed the real original Settings save controls, current cache-busted coordinator, LIVE crossword key excluded from exported TEST JSON, rejection of contaminated backup, read-only restore preview, byte-identical synthetic LIVE progress and zero page errors.
- **[Trivia + Family Worship visual/gameplay v29 QA #43538325355 — SUCCESS](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43538325355).** Four approved visual/audio regression suites passed: Trivia photographic stone answer states, correct/wrong audio behavior, original parchment answer modal handlers, and Family Worship’s actual 42-topic/4-difficulty/six-player mobile browser interactions.
- The v29 QA discovery also revealed **stale test expectations**, not a demonstrated game bug: old assertions required a former Trivia stone V5 loader while the TEST game uses approved uniform stone V6; old Family Worship tests expected older V5/V6 art URLs while the game currently selects V7 Cain/Abel revisions. Tests were updated to assert the **current versioned source and approved V6 uniform-stone override** without altering approved gameplay assets or music. Re-running all four succeeded.
- The full pre-release workflow now invokes v26 TEST/LIVE isolation, v27 readonly restore parity, v7 synthetic/two-tab browser contention, all 30 Word Trails puzzles and voices, original native modes, audio/menu/wheel and save/practice, plus v29 Trivia/Family Worship visual QA. Results must be checked for the exact commit before a release decision.

## Release policy / what these checks DO NOT prove

- **Current v2 full-backup journal can still replay a newer native-wallet update** if an interrupted restore and noncooperative tab collide. The v26 fix protects the specific LIVE crossword key; it does not make every native key transactional.
- **Original protected LIVE old Word Trails autoimporter is still consentless** and older open/cached code does not participate in Web Locks. Neither the new read-only planner nor isolated v7 prototype stops it. No LIVE rollout.
- Complete shared-origin native wallet backups can affect LIVE-accessible native tokens on the same browser if a player explicitly imports one in TEST. The original TEST v2 import has a warning. A future user-visible real-data restore must include a reliable saved complete backup, explicit real consent, safe conflict handling and recovery review.
- Automated mobile-sized Chromium browser QA is not real Samsung Android or James's iPhone Safari testing. Independent NWT/JW.org editorial signoff for all new puzzle additions and real device QA remain mandatory. Preserve protected original LIVE, named rollback checkpoint and selective promotion approval.
- Older TEST backups containing a protected LIVE crossword key will be refused; if this is encountered, use fresh export / manual recovery guidance instead of importing unsafely.

**USER / JAMES OFF DUTY.** The next gate is a trusted, player-visible consent/backup flow using the read-only planner with an integrated v7 writer after non-cooperating old-tab transition is settled and the end-to-end UX passes real cross-mode QA.

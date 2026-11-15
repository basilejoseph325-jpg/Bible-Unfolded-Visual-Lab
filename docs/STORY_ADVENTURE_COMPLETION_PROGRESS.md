# Story Adventure completion — resumable checklist

Branch: `codex/story-adventure-completion` · recovery baseline: `bf101f8`.
Gameplay checkpoint: `5625395` · follow-up editorial checkpoint: `40337ce`.
Only Bible-Unfolded-Visual-Lab is in scope. No LIVE edits or deployment.
The attached Headquarters/James rulebook is preserved verbatim in this directory;
current user instructions and newer approved repository standards prevail.
Historical Trivia-only campaign restrictions do not replace this Story mission.

## Completed implementation and evidence

- [x] Read governing rules; preserve original checkout and isolate development branch.
- [x] Inventory all **17 currently playable chapters / 164 discoveries** and all
  current rendering/interaction paths. All 80 later scenes have existing art.
  `STORY_ADVENTURE_CONTENT_INVENTORY.csv` lists every discovery.
- [x] Run the existing Genesis 11 complete-player-path baseline at 390×705 and
  320×568; both passed before implementation.
- [x] Fix Menu Continue switching later Story into the original engine; retain
  the exact current scene/replay. Add confirmed, Story-only Menu Restart.
- [x] Close Story information/reference/hint overlays on navigation, release their
  key handlers, and restore focus when returning to the board.
- [x] Preserve refresh-to-Home; resume checkpoint progress without resetting IDs.
  Normalize malformed steps/hint counters/work data instead of crashing.
- [x] Add verified later-engine recovery copies. Preserve unknown future chapter
  records when writing a known book's checkpoint.
- [x] Make paid hint debits/receipts atomic in the existing wallet, abort on wallet
  save failure, recover purchases after a chapter-save failure, and permit free rereading.
- [x] Preserve all approved price ladders, Points/Token separation, and zero
  discovery reward on reveal. Both engines charge a reveal once per discovery;
  failed wallet writes abort it; a lost chapter record cannot create a new reward.
- [x] Display actual full answers/ordering/matches in all 30 interactive Exodus
  reveals. Mark purchased letters on the actual wheel, preserving themes/sizing.
- [x] Repair obsolete opening-chapter hints and bind hints to answer identity.
  First-use Story help now opens its free clue directly, without an extra tutorial tap.
- [x] Retain both original engines and the existing puzzle variety; replace the
  inappropriate doorway diagram on non-doorway hotspot scenes.
- [x] Restore Genesis 10/11 chapter-specific cinematic finale art using the shared
  approved template and native Replay/Chapters/forward actions.
- [x] Improve **68 fields in 56 discoveries**, including all 30 Exodus final-stage
  clues, one overly revealing second clue, narration, explanations, a Genesis
  flashback and Noah's precise verse range. Full before/after/source ledger preserved.
- [x] Complete every playable discovery at 320×568 and 390×844 through actual DOM
  controls, all 17 endings, hint ladders, incorrect checks and replay safeguards.
- [x] Fix original-wheel wrong-answer retry timing; use the existing gentle wrong
  cue in both engines. Verify wrong-to-correct touch retries without rewards.
- [x] Check browser touch taps/swipes, pointer cancellation, actual wrong words,
  reveal/save failure, recovery, menu navigation and all 30 interactive reveals.
- [x] Check all 30 Exodus paid hint paths and Genesis 11's existing three-contextual-
  hint regression. Repair its profile-isolation fixture without deleting receipts.
- [x] Compare nine non-Story entry routes with immutable baseline; preserve shared
  wallet/scoring, wheel-sizing functions, 11 protected bank declarations, artwork,
  audio and core part 4. Inspect three rendered Chromium screenshots.
- [x] Add reproducible local QA and a read-only candidate CI workflow with no
  deployment step. See `STORY_ADVENTURE_TESTING.md` and the QA results JSON.

## Second completion pass — 2026-11-15

- [x] Finish the **108 previously outstanding discovery reviews**: 67 early
  discoveries and 41 later Genesis discoveries. Each has an individual reason,
  before/after text, official source URLs and source snapshot hashes in
  `STORY_ADVENTURE_DISCOVERY_REVIEW_2026-11-15.json`.
- [x] Revise existing content in 99 of those discoveries; deliberately retain
  existing questions/hints/explanations in nine. These are item decisions, not
  an automated replacement count. Earlier 56 discovery reviews remain preserved.
- [x] Replace the shared generic context narration with **84 individually written
  introductions** across all early chapters, including scene context not addressed
  by the earlier field-level changes. Preserve the approved popup/layout.
- [x] Add eight scene-specific later chapter ending messages within the approved
  completion template; preserve Replay, Chapters and next-episode handlers.
- [x] Correct misleading Cain warning chronology, unsupported field isolation/
  altar motives, Rebekah jewelry ordering, ambiguous speckled-animal question,
  weak verse-only hints, and repetitive early Moses explanations.
- [x] Normalize compound Story Bible references: explicit new books, inherited
  chapters and inherited verse ranges now get the appropriate JW.org destinations.
  Keep the shared Scripture viewer and other modes' callers intact.
- [x] Integration checks confirm all 108 review snapshots, 84 introductions,
  eight ending messages, compound links, focus restoration and reachable finale
  controls at 320×568 and 390×844. This is browser automation, not phone acceptance.

- [x] Re-run all 164 player paths and 17 finales at both 320×568 and 390×844;
  no gameplay-control overflow. Touch/recovery, all 30 Exodus hint ladders,
  Genesis 11 contextual hints at both sizes, and nine-mode baseline parity pass.
- [x] Inspect settled context popup and Genesis 9 ending at 320×568 in Chromium.
  Record both the initial parallel test timeout and the corrected delayed-launch
  fixture in `STORY_ADVENTURE_QA_RESULTS.json`; do not hide failed attempts.

- [x] Verify hosted candidate CI success on `2f7a275`: syntax, reviewed UI,
  all player paths, touch/recovery, both hint suites and non-Story parity.
  [Read-only workflow evidence](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43682848810).
  This final evidence update changes documentation only; no player code or deployment.

## Outstanding acceptance — do not mark release-ready

- [ ] Independent human source/editorial acceptance across all 164 discoveries.
  Assistant review now covers the earlier 56 plus the remaining 108, with separate
  source/readability records. Independent human signoff is still pending; automated
  integration assertions do not supply that acceptance.
- [ ] Physical Samsung Chrome/Samsung Internet and iPhone Safari: input, safe
  areas, larger text, landscape, interruptions, wheel purchases/effects and save
  retention across closing/reopening the browser.
- [ ] Physical audio checks, especially iPhone volume behavior and the preserved
  original Next cue; reduced-motion/accessibility acceptance.
- [ ] Owner acceptance and separately authorized release/promotion. The protected
  original and LIVE remain unchanged. Automated Chromium is not phone acceptance.

## Scope boundary and next resume point

Later Journey stages/books are explicitly planned/locked in this baseline.
They were not unlocked or replaced with filler chapters. The currently playable
set is 11 Genesis episodes (through Jacob in Haran) and 6 Exodus episodes (through
the Red Sea). Do not label this as completion of the whole biblical narrative.

Resume with the physical-device and independent human acceptance gates above.
The 108-item assistant review is complete; do not repeat it or the runtime fixes.
Use both dated editorial ledgers for focused review of any reported concern. Expand planned story coverage only through researched content that
passes the governing editorial/gameplay rules, preserving existing stable progress.

No branch merge, LIVE deployment, or owner physical-device approval is implied
by these checkmarks. Roll back code through Git; never erase player storage.

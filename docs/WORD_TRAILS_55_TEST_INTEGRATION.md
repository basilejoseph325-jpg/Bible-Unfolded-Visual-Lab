# Word Trails 51–55 TEST integration — draft PR #65

This is the separate integration requested in the two latest review comments on
PR #50 (6966819310 and 6966897366). No merge, publication, or LIVE change is
included. PR #50 remains the unchanged isolated content source.

## Provenance and recovery

- TEST base: `624fff4d11ab02dea673a20b67be94ab8915fa75` (includes shared wallet
  #55, Family Worship relay placement #61 and Books #64).
- Reviewed source: `cf20a7c03bf8ba5be5255a6a2317a2d746eee7b7` from PR #50.
- Pushed recovery ref: `checkpoint/test-before-word-trails-51-55-624fff4`.
- Integration branch: `feature/test-word-trails-51-55-integration`.
- Candidate: <https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/pull/65>.

The content bank, metadata and source fixture match PR #50 byte for byte.
The independent boundary gate also compares every out-of-scope tracked file
against the TEST base. Chapters, artwork, original Levels 1–50 content, audio,
wallet owner and reward formulas are preserved.

The checkpoint contains the old **50-level** engine. It is a code recovery point,
not permission to feed Level 55 progress into an older engine. Before any approved
publication, retain coordinated V2 exports; after play, retain the new 55-level
export too. A future rollback requires independent review of a matching full
snapshot and code version. Never restore only the wallet, combine old trail coins,
or point an old clamping engine at new progress. No real-player imports/restores
were performed by this assignment.

## Completed integration

- [x] Register five reviewed levels after 46–50, before Bible discovery derivation.
- [x] Chapter 11: Learning and Serving; seal 55: Ready to Serve.
- [x] Completed old Level 50 unlocks 51 without replay, reset or retroactive reward.
- [x] Fresh players and unfinished Level 50 keep normal locks.
- [x] Dynamic seal totals and final journey copy; 55-level labels and launcher.
- [x] Existing shared wallet, native rewards, hints and anti-duplicate receipts.
- [x] Coordinated V2 accepts indices 0–54 and receipts 1–55, rejecting future
  indices in embedded discoveries, bonus payments and progress as well.
- [x] Keep original namespace, ownership, checksum format, recovery journal,
  stale-review guard, strict amounts/types and old 50-level V2 compatibility.
- [x] Cache revisions load the 55-capable backup validator on all participating
  pages and each link from the root loader through the iframe engine, and the
  new bank before the engine. No navigation behavior changed.
- [x] Independent content, integration, real-host gameplay and backup fixtures.
- [x] Existing tests updated for 55 labels/map/seal counts; their old-level
  gameplay assertions remain. Genesis workflows use their existing cross-mode
  immutable chapter/audio guard for this cross-mode PR.

## Verification record

All browser imports and purchases use disposable, seeded test profiles only.
Automated Linux WebKit is not physical iPhone/Safari testing.

| Check | Actual result |
| --- | --- |
| Original 50-level quality gate | Passed; existing review warnings retained |
| New content: 30 crossword answers, intersections and wheel multisets, 60 bonus words, ten hidden discoveries | Passed |
| Live verse-anchor verification, 39 records / 37 NWT chapter pages | Passed; no content rewritten |
| Scope/content hashes and 55-level registration | Passed |
| Shared native bridge: 51–55 amounts, paid hints, seal and duplicate rejection | Passed |
| Coordinated V2: old 50 / new 55, 23 invalid files, 11 failed-write points, 11 crash points, corrupt journal | Passed |
| Actual Chromium 320/430: all five new levels, all 60 bonuses and ten hidden discoveries per viewport | Passed |
| Chromium: fresh locks, incomplete 50→51, completed-50 migration, free/paid hints, wrong answers, restart, reload, old/new V2 file-picker restoration, purchases, replay/no double payouts | Passed |
| Actual WebKit 320/430 | In progress; final result recorded in PR before handoff |
| Fourteen-group combined regression | Passed on `e6b7a3d`, run 44226308302 (also passed run 44226090973) |
| Shared restore independent WebKit | Passed, run 44224363822 |
| Isolated shared tokens Chromium + WebKit | Passed, run 44224363701 |
| Books wallet/internal reload | Passed, run 44224363719 and 44226151349 |
| Word Trails exclusive audio ownership | Passed, run 44224363589 |
| Existing native Episode 12, Family Worship relay, Daily Trail | Passed respective candidate CI |
| Existing 50-level WebKit native map/layout/resume | Passed, runs 44226903565 and 44224322903 |

The obsolete response-injected PR #50 browser fixture stays in PR #50; it is not
carried into this integrated candidate. Its replacement exercises the actual
registered bank.

The real-host integration test uses genuine normal TEST entry, without intercepted
responses or a protected preview URL. Chromium uses touchscreen taps and a CDP
swipe; WebKit uses touchscreen taps and native pointer swiping. Focus the loaded
iframe before automated touch, matching browser interaction readiness. Existing
private preview and unscoped storage canaries must remain byte-identical.

## Remaining review and release checks

- [ ] Finish final candidate mobile and CI runs, record failures without hiding them.
- [ ] Inspect all five boards and final seal in both engines/sizes.
- [ ] Final ChatGPT content/integration signoff (fresh source-anchor verification
  does not substitute for an editorial approval).
- [ ] Physical Samsung Android Chrome and iPhone Safari: touch/swipe, small-screen
  map controls, app resume, audio, navigation and disposable backup round trip.
- [ ] Owner approval for a separate TEST publication. Nothing is deployed here.

Published-site checks inspect the currently published TEST site, not this local
candidate. They cannot validate unmerged Level 55 code. Keep historical failures
and unrelated baseline regressions separate from candidate-specific failures.

## Historical and unrelated failures investigated

- Older published-site v32/v33/v34/v35 runs 44224322403, 44224322845,
  44224322686 and 44224322799 failed their explicit “not yet deployed” gates.
  No publication was attempted to satisfy them. Their candidate/local equivalents
  passed in the fourteen-group suite.
- Initial Episode 13/14 runs applied their Episode-only file allowlists to this
  Word Trails integration. Their existing cross-mode guard is now selected only
  on this integration branch, retaining immutable Genesis/audio checks and
  all gameplay checks. Other branches retain their original scope selection.
- Initial Story touch-cancel assertion failed; the identical test passed against
  base 624fff4 locally. The later candidate run is tracked separately below.
- The standalone older Family Worship V6 gallery workflow (44224322856)
  failed its immediate Noah-card photo/class assertion. Running its unchanged
  browser script against base 624fff4 reproduced the same failing assertion;
  Family Worship runtime/artwork is byte-identical in this candidate. The
  fourteen-group Family gameplay/visual tests and relay placement tests passed.
  This older gallery fixture failure remains disclosed for independent triage.
- Initial WebKit frame taps preceded focus/readiness. The loaded frame is now
  explicitly focused; actual touchscreen taps pass Level 50 and new-level checks
  without changing runtime controls or substituting programmatic button clicks.

- Linux WebKit 1.58.2 stalls after the test-only **Reset all test progress**
  iframe confirmation, reproduced with an old 50-level fixture too. It does
  clear that fixture's progress, but the automation tap then times out. This
  unrelated QA-only control is not changed. The coordinated restore scenario
  now creates an empty-progress disposable save fixture directly, then uses the
  real restore file picker; it still asserts full 55-level progress and receipt
  recovery. Actual in-game level restart remains tested through its native UI.

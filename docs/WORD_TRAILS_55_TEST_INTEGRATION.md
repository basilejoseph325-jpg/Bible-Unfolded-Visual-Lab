# Word Trails 51–55 TEST integration — draft PR #65

Implements the separate integration requested in PR #50 comments 6966819310 and
6966897366. PR #50 remains unchanged. Nothing is merged or published; LIVE is
untouched. Final approval and physical-device acceptance remain required.

## Provenance and recovery

- TEST base: `624fff4d11ab02dea673a20b67be94ab8915fa75`, including wallet #55,
  Family Worship relay placement #61 and Books #64.
- Approved content source: `cf20a7c03bf8ba5be5255a6a2317a2d746eee7b7` from #50.
- Pushed checkpoint: `checkpoint/test-before-word-trails-51-55-624fff4`.
- Branch: `feature/test-word-trails-51-55-integration`.
- PR: <https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/pull/65>.

The bank, source fixture and original review-only metadata are hash-identical to
#50. The metadata's historical status is retained for provenance; the engine now
registers the content in this candidate. The boundary gate locks every unrelated
tracked file to the TEST base, including original level content, chapters, audio,
artwork, wallet ownership and reward policy.

**The checkpoint contains a 50-level engine. Do not feed it a 55-level save.**
Before any future approved publication, retain full coordinated V2 exports; retain
new 55-level exports after play as well. Any rollback requires independent review
of a matching full snapshot and code version. Never restore only a wallet, merge
old trail coins, or let an older engine clamp newer progress. Only disposable
profiles were imported or reset here.

## Implemented

- [x] Register 51–55 after 46–50, before Bible-discovery derivation.
- [x] Chapter 11 **Learning and Serving**; seal 55 **Ready to Serve**.
- [x] Completed old Level 50 unlocks 51 without replay, reset or retroactive pay.
- [x] Fresh players and unfinished Level 50 retain normal progression locks.
- [x] Dynamic 55-level / 11-seal copy and updated launcher labels.
- [x] Existing native word wheel, hints, shared tokens, rewards and deduplication.
- [x] V2 receipts 1–55 and progress indices 0–54, including embedded discovery,
  bonus, hint and payment indices. Rehashed future/foreign/malformed files fail.
- [x] Preserve V2 namespace, checksum, ownership, strict amounts/types, stale
  review guard, coordinated checkpoint/journal recovery and old-50 compatibility.
- [x] Version every cache link from root loader through iframe engine and every
  participating backup-validator entry point. Shared/chapter navigation is unchanged;
  the scoped native-reset modal lifecycle correction is documented below.
- [x] Preserve old gameplay assertions while updating obsolete 50-level totals.
  Genesis workflows select their existing immutable cross-mode guard only on
  this integration branch; other branches retain their original scope gate.
- [x] Actual host gameplay tests and an independent complete-55 UI restore fixture.
  The obsolete response-injected #50 browser fixture stays in #50.

## Actual verification

Browser imports, purchases and fault injection use isolated synthetic profiles.
Linux Chromium/WebKit automation is not physical Samsung/iPhone testing.

| Check | Result |
| --- | --- |
| Original 50-level quality gate | Passed; existing review warnings retained |
| New 30 answers, crossings, wheel multisets, 60 bonus words and ten hidden discoveries | Passed |
| 39 source records / 37 live NWT chapter pages | Verse-anchor checks passed; reviewed wording unchanged |
| Content hashes, old levels and unrelated-file boundary | Passed |
| Native bridge 51–55 amounts, 15-token paid hints, seal, duplicate rejection | Passed |
| V2 old 50/new 55, 23 invalid files, 11 failed-write points, 11 crash points, corrupt journal | Passed |
| All five new levels in Chromium and WebKit, 320/430 | 20 actual level completions passed; all 60 bonuses, ten hidden discoveries and hints per profile |
| Fresh locks, unfinished 50→51, completed-50 migration | Passed in both engines/sizes |
| Wrong answers, free/paid hints, level restart, reload/resume, reward parity | Passed in both engines/sizes during those playthroughs |
| Actual 55-level V2 export/import, purchases, stock, receipts, partial-level restoration | Passed Chromium/WebKit 320/430 focused fixtures |
| Reset-all followed by real complete-55 restoration | Passed Chromium/WebKit 320/430 focused fixtures |
| Final Level 55 replay after focused restoration | Passed Chromium/WebKit 320/430; no duplicate level, seal, discovery or bonus payments |
| Full fourteen-group regression | Passed on `59a3b65`, run 44350337327; older Noah assertion failure baseline-confirmed in issue #66 |
| Existing 50-level WebKit map/layout/resume | Passed, runs 44226903565 and 44227602407 |
| Story Adventure / Episodes 12–14 / Books / native audio / relay placement / Daily / regular shared wallet | Passed candidate CI; the launcher recovery gate preserves chapter runtime/content/art |
| Complete restore browser: normal/reject/cancel, lost-hint recovery, forced crash, corrupt journal, read-only recovery | Chromium 320/430 and strict WebKit 320/430 passed after the recovery-launch gate; independent WebKit CI 44350358169 passed |
| Visual inspection | All 20 new-level boards and four seal screens inspected; approved design preserved |

The real-host test uses normal TEST entry, without intercepted responses or a
protected preview URL. Chromium swiping uses actual CDP touch; WebKit swiping uses
native pointer input. Both use real touchscreen letter taps. Map actions verify
visibility, enabled state and the actual hit target before native touchscreen
input. The fixtures wait for full root/frame readiness and navigation settling before
interacting with the iframe; earlier runs encountered a disappearing-frame race.

The coordinated-restore crash fixture now stops writes after the wallet and
explicitly reopens the document once. This avoids racing an in-hook reload against
the test's own navigation. Recovery notices, full data equality, cleared journals,
read-only behavior and zero unexpected page errors remain asserted. The recovery algorithm and chapter implementations remain unchanged. The TEST
launcher now waits for wallet ownership before loading Episodes 13/14, so it
does not begin their fetches inside an outgoing recovery document.

## Remaining checks / exact handoff

- [x] Complete focused 55-level restoration/reset/replay in all four browser/viewport profiles.
- [ ] Collect the final refreshed CI results; do not infer that all broader checks are green.
- [x] Trace the recovery JSON error on base and candidate; defer chapter launches
  until the shared wallet is writable. Local strict recovery checks pass both
  WebKit widths; final-head CI remains the authority.
- [x] Baseline-confirm and separately track the older Noah photo/class assertion
  in [issue #66](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/issues/66). The unchanged
  gallery script also failed that assertion on base main; Family runtime/artwork
  is byte-identical here. Full-suite Family gameplay and relay tests passed in
  earlier runs. No assertion was removed or relaxed.
- [ ] ChatGPT content/integration signoff; live verse anchors alone do not replace
  final human editorial approval.
- [ ] Physical Samsung Chrome and iPhone Safari: touch/swipe, 320px dialog scroll,
  audio, app resume, navigation and a disposable backup round trip.
- [ ] Owner approval for a separate TEST publication. Do not merge/deploy here.

Older public-site v32–v35 runs 44224322403, 44224322845, 44224322686 and
44224322799 explicitly failed because expected code was **not yet deployed**.
They inspect the published site, not this candidate. Their local equivalents
passed in the fourteen-group suite. No deployment was attempted to satisfy them.

## PR #65 independent-review continuation

The paused local launcher edit was preserved and completed. The diagnostic
[baseline/after record](WORD_TRAILS_65_RECOVERY_DIAGNOSTICS.json) captures the
same-origin requests, initiators, lifecycle, response headers/status and errors.
On unchanged base 624fff4, Episode 14 fetched after beforeunload while its wallet
was recovering. The next document received HTTP 200 and both chapters remained
playable. The guarded candidate produced zero errors and both chapters' first
discoveries were solved after recovery. No CORS policy or error filter changed.

Native reset testing observes the real confirmation, accepts it, requires the
real touch acknowledgement, verifies rebuilt locks and then refreshes. The refreshed saved progress
must be empty and the entire shared wallet deeply equal to its pre-reset value.
The completed-55 backup must subsequently restore and replay without rewards.
Reward policy is unchanged; the reset handler now defers its native confirmation
until after the activating event and closes its stale map. Request/lifecycle
JSON diagnostics are uploaded with the normal CI screenshots and logs.

The backup compatibility gate restores **95** old-exporter V2 snapshots without
changing raw records: 42 historical writer revisions, all 50 base levels, two
existing fixtures, and a synthetic save generated by playing the unchanged
native Level 50 engine. This covers progress, combo, satchel, paid words/bonuses,
board/hidden discoveries, legacy sparks and hints. No validator was relaxed.

Final CI URLs/results are maintained in the PR description so a documentation
update does not invalidate the tested head SHA. Required runs: 55-level browser
matrix, standard shared wallet, independent WebKit restore, and fourteen-group
release-safety suite. Report the exact latest result; Noah is an intermittent
baseline failure tracked in #66 (the unchanged suite passed on 59a3b65). Physical-device acceptance
and independent approval remain outstanding; no TEST/LIVE merge or deployment.

The final follow-up confines recovery gating to top-level pages. Isolated Genesis
preview iframes keep their independent adapter startup (verified by the unchanged
Episode 14 public/preview test). The post-swipe map test now waits for modal close
and two paint frames and verifies the actual hit target before its native tap;
it retains map-open, reset, wallet equality and completed-55 restoration checks.

Follow-up: WebKit's long playthrough completed all five levels with zero page
errors, then native input held up reload after reset (durable state: level 0,
empty progress, 963 tokens, 86 receipts). Keyboard activation hit the same driver
stall and was not retained as a workaround. The reset handler now defers its
native confirmation until the activating input returns and closes the map first;
Cancel reopens the same map without writing. Real touch and input acknowledgement
remain required before refresh in both the focused and full-playthrough tests.
The independent fixture also tests native Cancel and deep equality of the entire
wallet and Trail. Confirmed reset must close the old map and rebuild it with only
Level 1 enabled, preventing stale pre-reset unlock buttons from remaining usable. Final-head CI results remain in the PR description.

The ea026fe WebKit full playthrough acknowledged its native reset touch but
then timed out polling the closed-map condition. Its screenshot also failed to
complete; saved state remained reset with 963 tokens, 86 receipts and no page
errors. The next test revision explicitly foregrounds the real page and focuses
its native game frame after modal dismissal, recording visibility/focus/map
state. All native-input, lock, wallet, restore and error assertions remain.

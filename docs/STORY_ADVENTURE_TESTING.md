# Story Adventure candidate — repeatable QA

This branch modifies Visual Lab only. It neither deploys nor promotes the game.
Baseline: `bf101f8`. Gameplay checkpoint: `5625395`; retry correction: `baa0f8b`.

## Run locally

Node 24, Python 3 and Chromium/Chrome are required for development tests only.
No player runtime dependencies or internet/CDN requirements were introduced.

```sh
npm install --prefix work --no-audit --no-fund puppeteer-core@25.17.0
python3 -m http.server 8893 --bind 127.0.0.1
```

In another terminal, from the repository root:

```sh
export NODE_PATH="$PWD/work/node_modules"
export CHROME_BIN="$(command -v chromium || command -v google-chrome)"
node scripts/check_story_sources.cjs
STORY_EVIDENCE=work/story-release-evidence.json node scripts/qa_story_adventure_release.cjs
node scripts/qa_story_touch_and_recovery.cjs
node scripts/qa_story_editorial_hints.cjs
node scripts/qa_story_mode_boundaries.cjs
node scripts/qa_genesis11_three_thinking_hints_v1.cjs
```

Use `STORY_URL` to select another **local** server. All tests use synthetic browser
profiles. Never point write-oriented gameplay tests at a real player's session.
`work/` is ignored scratch space. The candidate GitHub workflow uses only read
permissions and a local server; it has no deployment job.

## Coverage and limits

- Full player path: 11 Genesis + 6 Exodus chapters, 164 discoveries at both
  320×568 and 390×844. Actual DOM answer controls, correct solutions, incomplete
  checks, completion, replay protection, all 17 finales and later-engine control
  bounds after layout. The original nine chapters use pointer-event handlers;
  this test is not physical-device or native-touch certification.
- CDP browser touch: original/later wheel taps, later wheel swipe, cancellation,
  incorrect-word rejection and immediate retry in both engines, the gentle wrong
  cue handler, both reveal charges and payment failure rollback,
  saved-progress corruption recovery, malformed checkpoint normalization,
  Menu Continue/Restart, and actual full-solution delivery in all 30 Exodus scenes.
- Editorial hint paths: all 30 Exodus free / 15 / 30 Insight Token ladders,
  immediate delivery, free rereading, unchanged Points, source range and flashback.
- Genesis 10–11 retain three contextual clues at free / 15 / 25 Tokens. No letter
  assistance was introduced in these chapters. The existing Genesis 11 regression
  now uses separate player contexts for each viewport; durable receipts are not
  cleared merely to make a test pass.
- Non-Story boundaries: nine homepage entry routes compared with `bf101f8` using
  intercepted baseline assets on the same local server. This is entry/navigation
  parity, **not** exhaustive gameplay testing of all other modes.
- Static: all five serialized transports, assembled native code and 238 inline
  scripts compile; editorial text is integrated; stable Genesis 11 answers,
  scene files and source package agree. Protected declarations/functions and
  existing artwork/audio remain unchanged as recorded in the preservation file.
- Three Chromium screenshots inspected: Genesis 11 gameplay, its cinematic
  finale, and original Genesis gameplay at 320×568. Physical acceptance is separate.

## Existing checker discrepancies

`visual_lab_all_mode_smoke_test.cjs` still expects Bible Books to show an older
180-token gate. Current baseline opens `bible-book-guides/index.html`. The old
checker failed at that assertion. The new baseline/candidate comparison confirms
that the current reader route is unchanged. No working reader feature was reverted.

An initial Genesis 11 hint test reused one browser storage profile for two
viewports while resetting only a transient hint counter. That conflicts with
intentional durable purchase receipts. The fixture now isolates the profiles;
its unchanged price/no-letter assertions pass at both sizes.

## Release acceptance still required

- Independent Scripture/editorial acceptance for all 164 discoveries. The ledger
  records **68 changed fields in 56 discoveries**, not a claim that every historical
  item received a new exhaustive source/readability audit. Unchanged items remain
  listed in the inventory for continuation. No independent human review is claimed.
- Samsung Chrome/Samsung Internet and iPhone Safari: tap/swipe reliability, all
  purchased wheel effects, browser interruptions, larger system text, landscape,
  safe areas, screen-reader/focus behavior, and persisted progress after closing
  and reopening the browser. Test at least one early and one later chapter.
- Audio on physical phones: wrong/correct cues, existing approved Next sound,
  music switching, volume sliders, mute, and reduced-motion/celebration settings.
- Owner acceptance and a separately authorized release. No LIVE deployment is
  authorized by this branch. Later planned Journey books/stages remain locked;
  completing the currently playable episodes does not complete the entire Bible.

## Recovery and rollback

All existing IDs, canonical save keys, reward keys and prices remain in use.
Later-engine chapters additionally keep a verified `-recovery-v1` copy. New paid
hint levels and reveal/reward receipts share the wallet write with the debit, so
a failed chapter checkpoint cannot cause another charge or turn a reveal into a
fresh discovery reward. Blocked wallet writes abort the paid action.

Revert the scoped branch commits to return code to `bf101f8`; do not reset player
storage. Older code ignores the additive recovery/receipt entries. Do not use
`reset --hard` on a working checkout containing uncommitted player/developer work.

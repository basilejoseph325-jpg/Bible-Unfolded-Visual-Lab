# Daily Word Trail V1 — Visual Lab TEST

**Scope:** A self-contained daily crossword extension. Do not merge into the protected Story-Trails LIVE repository without a separate owner acceptance and selective release review.

## What ships

- Optional **☀ DAILY** link in the existing Word Trails footer, plus a larger entry inside **Your Word Journey** level map.
- One original Word Trails crossword selected each **local calendar date** from its existing 39 vetted levels 12–50. Uses their crossword layout/word rack, Bible-book scenic illustration, published NWT/JW.org Bible word/source material and the existing original images. Different selections on consecutive dates; the 39-board catalogue rotates again after 39 days. This is a rotating curated challenge, not a new hand-authored word list generated daily.
- One-screen mobile play with selected-letter wheel; tap, touch, drag/swipe, ENTER, shuffle, up to **two free letter hints** per day. There is no new point, coin or Insight Token mechanic.
- On completion, **one Discovery Stamp per local date** plus an encouraging Bible thought and original JW.org NWT reference. A missed day never loses an existing stamp. Replaying a completed day earns no extra stamp.
- Separate stamp collection with latest completed dates. One protected daily save key only: `bu-visual-lab-daily-word-trail-v1` (localStorage), format `{version:1,days:{YYYY-MM-DD:{board,solved,hints,completed}}}`. No existing Word Trails save/wallet/announcer/wheel skin is read, migrated or overwritten.
- The experiment is a standalone page `experiments/word-trails-daily-v1.html`. Its **Back** link returns via `../index.html?wt_launch=native`, not a destructive restart.
- On localhost only, `?qaDate=YYYY-MM-DD` and `window.BUWT_DAILY_QA` enable deterministic browser QA. This override/introspection is not enabled on GitHub Pages.

## Validation

- Original `node scripts/word_trails_quality_gate.mjs` validates all 50 Bible crosswords, intersections, Bible sources, scene art, answer-letter racks and boards.
- `node scripts/qa_word_trails_daily_v1.cjs` uses real Chromium at **320×568, 390×844, 430×932**, tests two successive dates, all target answers with letter-wheel taps, two free hints, correct/incorrect input, duplicate-claim prevention on replay, saved-progress recovery after refresh, unchanged sentinel data on unrelated storage keys, no horizontal overflow and normal Word Trails footer entry.
- The dedicated workflow `.github/workflows/qa-word-trails-daily-v1.yml` runs these checks on PRs without publishing or touching LIVE.

## Acceptance still needed

- User checks appearance, wheel feel, touch **swipe** and Back navigation on physical Samsung.
- James checks Safari/iPhone if included in a future LIVE candidate.
- Review whether more distinct curated daily boards, richer original rewards, or integration with the authorized native wallet are actually useful. Do **not** change real Insight Token amounts without express design approval.
- Preserve the existing LIVE Story and Word Trails systems, and do not confuse a successful TEST-only QA with a LIVE release.

A completed TEST daily challenge can be explored without changing original Word Trails progression. No paid hints or streak pressure are used.

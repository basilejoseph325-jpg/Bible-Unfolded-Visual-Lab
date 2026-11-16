# Daily Word Trail V1 — Visual Lab TEST

**Scope:** A self-contained daily crossword extension. Do not merge into the protected Story-Trails LIVE repository without a separate owner acceptance and selective release review.

## What ships

- Optional **☀ DAILY** link in the existing Word Trails footer, plus a larger entry inside **Your Word Journey** level map.
- Daily puzzles originally rotated across 39 vetted levels 12–50. **From local date Nov 16, 2026 forward**, the daily selection rotates a focused subset of **17 existing boards with at least three Scripture-linked answers each**, for more Bible connections. All earlier dates retain their original board selection and previous journal entries. The 39 original boards remain in regular Word Trails; the 17 featured boards repeat after 17 days. Existing level assets, Bible sources, art and word racks are reused; this is not a new hand-authored daily catalog.
- One-screen mobile play with selected-letter wheel; tap, touch, drag/swipe, ENTER, shuffle, up to **two free letter hints** per day. There is no new point, coin or Insight Token mechanic.
- On completion, **one Discovery Stamp per local date** plus an encouraging Bible thought and original JW.org NWT reference. A missed day never loses an existing stamp. Replaying a completed day earns no extra stamp.
- Interactive **Bible Discovery Journal**: tap a collected stamp to reopen the original Bible thought and JW.org reference. Milestones at 3/7/14/30 days are computed from existing completed dates and do not alter the existing reward economy. Bible word clues are available for the daily board without consuming hints. One protected daily save key only: `bu-visual-lab-daily-word-trail-v1` (localStorage), format `{version:1,days:{YYYY-MM-DD:{board,solved,hints,completed}}}`. No existing Word Trails save/wallet/announcer/wheel skin is read, migrated or overwritten.
- The experiment is a standalone page `experiments/word-trails-daily-v1.html`. Its **Back** link returns via `../index.html?wt_launch=native`, not a destructive restart. A manual browser refresh of the Daily page returns to `../index.html` **home**, without clearing daily saves. Localhost `qaDate` browser QA reloads remain on the Daily page so persistence can be tested.
- On localhost only, `?qaDate=YYYY-MM-DD` and `window.BUWT_DAILY_QA` enable deterministic browser QA. This override/introspection is not enabled on GitHub Pages.

## Validation

- Original `node scripts/word_trails_quality_gate.mjs` validates all 50 Bible crosswords, intersections, Bible sources, scene art, answer-letter racks and boards.
- `node scripts/qa_word_trails_daily_v1.cjs` uses real Chromium at **320×568, 390×844, 430×932**, tests two successive feature dates and historical Nov 15 board identity, all target answers with letter-wheel taps and real swipe input, free hints, correct/incorrect input, duplicate-claim prevention on replay, interactive journal/source links, optional clues, historical saved-stamp readability, manual refresh-to-home, saved-progress recovery after QA-only reload, unchanged sentinel data on unrelated storage keys, no horizontal overflow and normal Word Trails footer entry.
- The dedicated workflow `.github/workflows/qa-word-trails-daily-v1.yml` runs these checks on PRs without publishing or touching LIVE.

## Acceptance still needed

- User confirmed improved Samsung wheel responsiveness on TEST Nov 15. **New content rotation, optional clues, Journal, refresh-to-home, and Back navigation** still need Samsung owner acceptance.
- James checks Safari/iPhone if included in a future LIVE candidate.
- Review whether more distinct curated daily boards, richer original rewards, or integration with the authorized native wallet are actually useful. Do **not** change real Insight Token amounts without express design approval.
- Preserve the existing LIVE Story and Word Trails systems, and do not confuse a successful TEST-only QA with a LIVE release.

**TEST-to-LIVE release checkpoint:** Maintain this feature as a named pending release until it is deliberately approved and promoted. Once owner accepts and James checks Safari (if required), verify TEST deployment, Bible wording and links, shared-system boundaries, LIVE-safe build paths, and a rollback checkpoint, then selectively transfer Daily Word Trail to the original protected LIVE game and verify on the published LIVE site. Do not assume TEST main deployment equals LIVE promotion.

A completed TEST daily challenge can be explored without changing original Word Trails progression. No paid hints or streak pressure are used.

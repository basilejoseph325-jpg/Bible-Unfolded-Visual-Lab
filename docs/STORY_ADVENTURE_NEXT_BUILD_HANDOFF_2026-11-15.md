# Story Adventure — NEXT BUILD checkpoint (2026-11-15)

## Governing intent
Owner's primary goal is **new fully playable Bible-book Story Adventure chapters**, not another pass over existing prose. Continue from the latest safe work already saved in draft PR #21. Do not spend a new coding run re-reviewing its 164 previous discoveries or repeating its already passing QA unless a new feature reveals a specific regression. All future content stays behind established progression gates until approved.

## Verified starting point
- Existing playable Story content: 11 Genesis episodes (through Genesis 31 / Jacob departing Haran) and 6 Exodus episodes (through the Red Sea).
- Saved baseline: `codex/story-adventure-completion`, draft PR #21 at commit `3510e5f`; no merge and no LIVE deployment.
- Canonical existing engine and shared state, hints, scoring, wheel sizing, sound, safe-area layout, and other modes must remain intact.

## Work completed in this separate candidate branch
- Added `story-adventure-content/genesis-episode12-return-to-esau-v1.json` — **13 new Genesis 32–33 narrative discoveries and synchronized word-wheel records**, progressive hints (three per item), after-answer explanations, official Scripture URLs, and 13 distinct scene-art briefs/alt text.
- Primary text examined directly: [Genesis 32](https://www.jw.org/en/library/bible/nwt/books/genesis/32/) and [Genesis 33](https://www.jw.org/en/library/bible/nwt/books/genesis/33/). Additional support: [Insight — Jacob](https://www.jw.org/en/library/books/Insight-on-the-Scriptures/Jacob/).
- Added `scripts/qa_genesis12_content_candidate.cjs` as a read-only authoring integrity checker. The same structural rules were checked on the saved GitHub JSON (120/120 checks passed).
- **Not playable yet**: this content file is NOT registered in the existing engine, scene art files do not exist, and no native/browser gameplay, sound or physical-phone QA was performed. Assistant source checking does not constitute independent editorial signoff.
- No existing runtime files, live branches or protected games were edited.

## NEXT PRIORITY: ACTUALLY IMPLEMENT CHAPTER 12
1. Read Headquarters/James standards as carried in PR #21. Verify any newer approvals before changes.
2. Start a new run based on the saved PR #21 development code and include the Genesis 12 content candidate from this branch. Preserve existing source history; do not overwrite PR #21 with an unrelated copy.
3. Read the exact native integration path used for Genesis 10 and 11. **Integrate Episode 12 into the existing approved Story engine**, including its real wheel, selectable letters, touch/swipe, hints and payments, correct/incorrect handling, next scene, save/recovery, chapter conclusion and navigation. Do not build a parallel imitation wheel or a text-only slideshow.
4. Produce/obtain appropriate clean 16:9 single-scene assets for the 13 prompts, using owner-approved assets where available; record any truly missing art without claiming it is complete.
5. Build an **isolated developer preview** accessible for tests, with ALL ordinary chapter and Journey locks unchanged. Do not unlock it publicly.
6. Run candidate integrity checks plus browser-based 320×568, 390×844 tests, wrong/correct answers, three-tier hints, payments once, reload/resume, audio wiring, finale, routes, old 17-chapter regressions, and static/CI checks. Report honestly which tests cannot run.
7. Save source and evidence into a new draft PR linked to PR #21; no main or LIVE merge.
8. Continue into Genesis 34 and later chapters in biblical order, as much as session resources allow. Do **not** equate writing a JSON content draft with implementing a playable chapter.

## Editorial standard for new material
Research first from NWT 2013 and JW.org; warm conversational language, natural contractions, insight-driven questions, plausible help, no artificial praise or filler, no invented feelings or dialogue. Preserve user-approved wheel v3.9.00 and current Stories’ exact price ladders. Human source approval remains an explicit release gate.

## Short end-of-run report required
- **New fully playable chapters built:** integer and IDs (do not count JSON drafts).
- **New content drafts waiting for integration:** separate integer.
- **Real word wheels connected and tested:** integer.
- **Art assets integrated:** integer; missing count.
- **Tests actually run / failed / unrun.**
- **GitHub PR / commit URLs**, next unfinished chapter and any genuine blockers.

Current Genesis 12 candidate: **13 new authored discoveries; zero native-integrated playable chapters yet**.

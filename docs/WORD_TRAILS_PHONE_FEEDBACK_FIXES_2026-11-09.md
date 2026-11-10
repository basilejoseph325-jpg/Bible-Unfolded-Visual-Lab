# Word Trails NEXT — Owner Samsung feedback fixes and reproducible QA
**November 9, 2026 · TEST/Visual Lab only · LIVE Story-Trails untouched**

## Reports from physical first pass
- Main menu, Settings, visual gameplay, block sizes and screen fit looked good.
- Refresh from the Word Trails/Trivia experience should return to Bible Unfolded home; it was reopening Word Trails.
- The native in-game Back arrow exited, but tapping the same homepage Word Trails card again did nothing.
- Original selected announcer was heard on level completion, but not during gameplay.

## Root causes confirmed against actual code
1. The home-card launcher in `word-trails-next-launcher.js` had a closure-scoped `navigating=true` one-shot guard that was **never reset** after its 235 ms delayed native launch. This permanently suppressed a second click until a full page reload. The browser reproduction initially logged `REPRO_CONFIRMED`.
2. A Visual Lab-only native deep-link/refresh handler in `visual-lab-test-banner.js` automatically reopened the Word Trails frame when the URL fragment was `#word-trails`, **including after a browser reload**. This was the wrong behavior for the owner's use case. Native root Trivia already returned home in the simulated browser, so no risky Trivia engine rewrite was needed.
3. Word Trails only requested a phrase on the third/sixth solved crossword word, while the **actual native** announcer controller applies a 45-second ordinary-phrase cooldown. Completing a short 4-word board commonly produced only its final `chapter_complete` message. A narrower, existing native `milestone:true` cadence is a 12-second cooldown with native voice selection, speaker rotation, volume/Off and no-overlap rules unchanged.

## TEST-only corrections
- The home-card navigation guard now resets after its delayed launch attempt. Back followed by a second tap launches the original Word Trails native frame again.
- Browser **Reload** at `#word-trails` clears that fragment and returns to **Home**. Actual in-progress crossword save remains in localStorage, so entering Word Trails again restores the board. Deliberately opened published Word Trails direct links still launch natively using `?wt_launch=native`.
- The crossword now asks for a native original-voice encouragement at two solved words, and optionally later on long boards, using `milestone:true` to avoid the inappropriate 45-second game-time silence. Normal completion voice remains unchanged; actual sound reproduction on owner's Samsung needs confirmation.
- No game economy, purchased themes, Insight Tokens, wheel geometry, board visuals, score calculation or original voice assets were changed.

## Automated browser evidence
- `scripts/word_trails_phone_feedback_repro.cjs`, workflow `qa-word-trails-phone-feedback.yml`: after initial Word Trails entry, actual browser reload returns Home with saved state intact; tap re-enters; in-game Back returns to home; tap re-enters; main Bible Trivia reload returns Home; tapping actual letters to solve ANTIC then TACO emits original-voice gameplay encouragement with `milestone:true`. Run `42732404841` **PASSED**.
- Full native shell/menu and direct URL regression `42732452592` **PASSED**, now explicitly checks refresh→Home and reentry.
- Homepage launcher regression `42732483002` **PASSED**, now checks refresh→Home, saved crossword resume and back→reenter.
- The thirty-level gameplay, original Ocean Glow, shared rewards, coordinated save, and sound effect regressions independently passed after gameplay trigger change (see current Actions runs).
- These are *automated simulated mobile browser* checks, NOT proof that the owner's Samsung Internet or James's physical iPhone Safari behave identically. Their audio and reload acceptance still requires another physical check.

## Mandatory eventual LIVE promotion
Carry **all three owner feedback fixes**, regression tests, and safe native-core integrations over during the explicitly authorized future LIVE transfer, after physical testing and a rollback checkpoint. Do not copy the Visual Lab TEST banner or temporary currency into LIVE. This document is not LIVE release approval.

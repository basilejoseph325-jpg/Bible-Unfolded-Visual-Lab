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


## November 9 second physical retest — midgame announcer still silent; corrected with REAL playback QA
**Owner finding:** After the initial cooldown-trigger adjustment, the real Samsung player still heard no voice during Word Trails puzzles, although ending voice remained audible. The prior test had replaced `window.bu381Play` with a function that always returned `true`; it proved the crossword requested a voice, **not** that the native engine accepted or played it. That regression assertion was insufficient and must not be used alone again.

**Real root-cause reproduction:** New read-only instrumented browser run `scripts/word_trails_real_voice_diagnostic.cjs` calls the true native original `bu381Play` and observes actual `HTMLMediaElement.play()` promise resolution, native voice prefs, and rejected calls. An already-playing original voice or its 12-second milestone cooldown returned `false` on the crossword's next legitimate request. Since the game only requested the line at a single exact `found.size`, the refusal permanently dropped its sole midgame announcement. The code was not a missing recording, a broken voice selection, or a wheel/sound-effect issue.

**Latest TEST correction (LIVE unchanged):**
- `experiments/word-trails-announcer-v1.js`: thin queue/retry adapter calls the **original native** speaker/recording API rather than synthetic TTS or substitute clips. Requests one encouragement for the current active crossword and retries only when the real voice engine is free; retains original cadence, selected speaker, native volume and mute. One accepted midgame announcement per board. Stops retries at completion, level change, pagehide, mode Off, absent native host, and after a bounded lifetime. A resumed partly solved crossword can still trigger the request on the next correct word.
- `experiments/word-trails-next-v1.js`: asks for encouragement on meaningful successful progress, not only at a single second-word condition; explicitly cancels pending progress at completion and level transition, protecting the existing recorded ending voice and saved level/rewards.
- To preserve the familiar prompt level-end "good job" when a recent midgame recording would otherwise cause the normal native cooldown to reject it, the guarded completion path first tries ordinary native playback, then (only when voice is On, volume positive, page visible, and Watch Stories inactive) uses the original native **priority sample path** for the same prerecorded `chapter_complete` recording, never overlapping two announcers. This is a TEST-only, mode-specific audio fallback; it is not a substitute voice engine and must remain covered by actual audio regression tests.
- TEST iframe URL and source script version strings were revised so the corrected adapter is loaded instead of a previously cached copy. No board shape, wheel physics, notes, theme, SFX, scoring, native wallet, or purchased cosmetics changed.

**Evidence:** Automated real-audio regression run `42735981220` passed: the initial native refusal occurred, a later native retry played and resolved the second real MP3 `Audio.play()`, the completion recording then played immediately as the third real audio clip, and mode Off blocked **both** progress and completion attempts. Multiple other 30-level/voice/SFX/Ocean Glow/save checks passed on the updated runtime. Automation uses a simulated Android-size Chrome viewport with permissive autoplay; **the owner's Samsung browser and James's Safari still require physical confirmation**. Record both under the mandatory future LIVE promotion; the first (stubbed) voice test is not proof of the audible behavior.

## GitHub Pages deployment verification checkpoint
The final native recorded-voice fix was verified in **real-audio browser QA run 42736122959**, with successful midgame clip start, immediate recorded completion, and a strict mode-Off check. The full 30-level, effects, puzzle quality, shared rewards, and FEEL regression runs for candidate `318c5e92c2e6` passed. TEST source and browser-cache versions are committed; only **GitHub Pages publication** is a separate gate. An earlier Pages deployment for the documentation SHA remained in progress unusually long, so this document-only TEST commit intentionally triggers one fresh deployment attempt. Do not represent the new site as published until its Actions deploy job succeeds. LIVE remains unchanged.

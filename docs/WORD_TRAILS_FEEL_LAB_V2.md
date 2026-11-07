# Word Trails NEXT — Feel Lab v2
**Scope:** Bible Unfolded **Visual Lab only**, 7 November 2026. The live repo is untouched.

## Goal
Adapt successful *word-puzzle feedback patterns* (not proprietary assets, source code, or recordings), keeping Bible Unfolded calm, original, and fast on mobile.

## Research
- PeopleFun's Wordscapes [Game Overview](https://peoplefun.helpshift.com/hc/en/6-wordscapes/faq/267-game-overview/) confirms the shared letter wheel, intersecting crossword, shuffle and coin-funded hints.
- PeopleFun's [bonus word rules](https://peoplefun.helpshift.com/hc/en/6-wordscapes/faq/273-what-are-bonus-words-why-don-t-some-bonus-words-work-why-are-some-words-not-included-in-your-dictionary/) confirm extra words and single-payment rewards on first play, not infinite replay farming.
- PeopleFun's [currency guidance](https://peoplefun.helpshift.com/hc/en/6-wordscapes/faq/269-what-are-coins-and-how-do-i-use-them/) confirms coins fund power-ups and hints.
- Player discussions of 2026 wheel animation changes: [July recordings/feedback](https://www.reddit.com/r/wordscapes/comments/1v0x3ie/) and [August update](https://www.reddit.com/r/wordscapes/comments/1vktqv6/) show that excessive flashing/animation and gesture lag can worsen the experience. Make motion effects optional and never sacrifice responsiveness.
- Public material can document visible patterns. We **cannot** claim to reproduce Wordscapes' exact current sounds or private timing from its code.

## Implemented in Visual Lab
- **Independent preferences:** music, SFX, visual effects, haptics and individual music/SFX levels. Default on; existing mute is preserved during V1->V2 migration. Preferences stored in a test-only localStorage key.
- **Original synthesized audio cues:** soft touch and trace, mellow error tone, answer chime, distinct coin reward, hint, optional Scripture Spark, satchel reward and completion fanfare. **No copyrighted Wordscapes sound assets.** No knock or thud per letter.
- **Visual microfeedback:** enhanced selected-letter glow, softly lit trace, staggered green tile reveal, progress/board accent, lightweight flying coins to HUD, and a compact streak indicator rather than constantly flashing duplicate congratulatory messages.
- **Bonus satchel:** three unique bonus words fill a three-dot meter, awarding **8 additional test coins once per level**. Replays cannot earn those coins again.
- **Accessibility/performance:** animation preference plus system reduced-motion support, pointer-events:none on decorative layers, no gameplay-page scrolling, no interaction overlay on the wheel.
- **Original Bible identity:** one optional Scripture Spark per puzzle with curated scripture references linking only to JW.org, plus the existing eight-level progression.
- **Audio inspiration is conceptual**—the notes and effects are our original designs, not imitations of commercial audio recordings.

## Current QA
- `.github/workflows/qa-word-trails-next-v1.yml`: all eight levels, completion, swipe input, persistence, 4 phone viewports.
- `.github/workflows/qa-word-trails-feel-v2.yml`: V2 controls, live FX particles, satchel milestone math, replay-safe rewards, reduced-motion behavior, sound preference migration, and mobile layouts.
- Existing `.github/workflows/qa-word-trails-next-launch-v1.yml`: normal test homepage routes directly to NEXT; legacy test remains available for comparison.
- Final approval **requires hands-on listening on a Samsung Android and an iPhone Safari**. Automated tests cannot establish whether the cue volume/texture feels premium.

## Known limitations / next experiments
1. The sound palette needs real listener A/B feedback: loudness balance, number of layers on correct swipe, and whether per-letter contact is too quiet or too busy.
2. Scenery currently repeats across some levels; distinct approved scenic scenes should be introduced gradually, with no collage or accidental mismatched story imagery.
3. Eight levels establish the loop, not production-grade content depth. A larger curated word bank and varied crossword shapes will be needed.
4. Some valid English bonus words are omitted because the test uses a deliberately small curated word list. A dictionary strategy must be agreed before live rollout.
5. Android vibration is not necessarily available in iPhone Safari; haptics are optional and should fail silently.
6. Live migration must preserve old Word Trails saves, actual coins/Insight Tokens, and not affect other Bible Unfolded modes.

## Release rule
**Visual Lab approval first.** Only after user approves sound/visual feel and QA passes on Samsung + iPhone should the module be ported into the live repository in a single reviewable change with a rollback.

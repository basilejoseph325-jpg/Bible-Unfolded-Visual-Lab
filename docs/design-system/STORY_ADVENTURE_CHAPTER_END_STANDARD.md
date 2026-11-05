# BIBLE UNFOLDED — STORY ADVENTURE CHAPTER COMPLETION DESIGN MASTER

**Owner-approved future design decision: November 5, 2026.** Permanent reference for all NEW Story Adventure chapter endings. The approved geometry is the **Genesis Episode 7 V11 completion screen** shown in the owner's 6:52 screenshot; the older Genesis Episode 2 appearance is NOT the master for future chapter-end sizing.

## Required design for new chapters

1. **One reusable completion layout** for every new chapter. Use the Episode 7 V11 screen's hero/artwork size, story-title strip, vertically centered achievement composition, Bible-and-laurel emblem, two long tapered antique-gold title lines (no vertical framing box), atmospheric background, gold progression button, confetti and footer. Maintain one-phone-viewport fit and support long wrapped titles. **Do not create another chapter-specific copy of the layout engine or another set of offset overrides.**
2. **Custom for EVERY ending.** Each chapter gets its own appropriate original Bible-scene artwork (moving cinematic scene when allowed), scene caption, ending-specific background art/atmosphere and chapter-completion title/text, based solely on NWT 2013 and JW.org. Text must remain real, accessible DOM text, not part of baked artwork. Different content, **identical positioning and component style**.
3. **Navigation requirement:** Keep the large gold Next Chapter / Next Episode / Return to Book button according to the chapter's real progression state. BELOW it show TWO equal-width, side-by-side teal-and-gold buttons: **Replay / Play Again** (left) and **Chapters** (right). Both must have real working actions, appropriate destinations, and large touch targets. Preserve saved progress and coins. This paired control was approved as the standard, **but it was not yet implemented for the newer engine at the time of design approval**.
4. **Freeze approved audio.** The user confirmed in the test game that original and later chapter Next-button sounds now match. Preserve `premium-sfx.js`, the sound-cue classification in `bible_unfolded_core_part5.js`, and the non-ducking announcer/music behavior unless specifically instructed otherwise.
5. Do not modify the older chapter endings solely to force uniformity. The owner prefers the **newer Episode 7** geometry as the master for future work. Existing chapters 1–6 remain as they are unless individually requested.
6. Scope implementation in Visual Lab first. Every newly created chapter must instantiate/reuse the **shared** completion component rather than designing another ending from scratch. Check the proper current chapter-specific image/title, Next/Replay/Chapters destinations, narrow screen overflow, audio, and Android/Safari behavior. Obtain approval before promoting each new mode/design to LIVE.

## Versioned references / implementation caution

- Visual Lab: `basilejoseph325-jpg/Bible-Unfolded-Visual-Lab`
- Visual prototype: `story-chapter-complete-v2-test.js`, `story-chapter-complete-v2-test.css` and `story-finale-structural-parity-v11.css`, loaded by `journey-progress-caption.js`.
- The original engine uses `.bu3815-chapter-finale`; newer Genesis/Exodus uses `.bu3863-finale`. **They are still separate engines** in existing chapters. This design standard is a forward-looking rule, not a claim that all chapters already use one shared renderer. Avoid speculative retrofits to approved older chapters.
- Never copy the entire Visual Lab loader over the LIVE loader; preserve approved LIVE-only functionality and cache versions, avoid test banners.
- The final Episode 7 V11 screenshot supplied by the owner is the visual authority. The exact button wording can vary by destination, but Replay and Chapters must sit together.

**Approval scope:** This document locks the future chapter-end standard and authorizes the requested migration of tested Story improvements to LIVE. It does **not** authorize a redesign of unrelated game modes, and does **not** imply any unimplemented Chapters button has already been tested.

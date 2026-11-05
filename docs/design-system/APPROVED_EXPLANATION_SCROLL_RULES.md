# BIBLE UNFOLDED — APPROVED PHOTOREALISTIC EXPLANATION SCROLL MASTER

**Owner approval:** November 4, 2026, after inspecting Daily Discovery's V3 result screenshot (Matthew 5:44 explanation, “Finish Discovery”).  
**Status:** Locked *visual design master* for future answer-ending / explanation screens. **Only Daily Discovery is approved for implementation in the live game.** Other game modes remain unchanged until explicitly approved.

## Mandatory preflight

Before designing, editing, or rolling out any explanation, result, completion, or end-of-round modal, read this file alongside `BIBLE_UNFOLDED_RULEBOOK_START_HERE.md`, the complete Headquarters rulebook, and `docs/design-system/ANSWER_TABLETS_AND_GOLD_ICONS_RULES.md`. **Reuse the approved actual V3 assets and inspect the rendered UI.** Never reconstruct the visual from memory, a low-quality CSS sketch, or a generated image with embedded explanation text.

## Frozen approved visual and implementation reference

- **Master scroll artwork:** `assets/ui/daily-discovery-explanation-scroll-v3.webp` (720 × 1040), Git blob SHA `4e25223d5666397a3a9dc9b446e4262d12fc41a2`. Photographic antiqued parchment, naturally uneven side edges, continuous material under the wooden rollers, warm dark surroundings. No “GAME GUIDE,” no right-edge straight seam, no abrupt overlaid paper panel, and **no secondary baked-in wax seal**.
- **Master Next/Finish control:** `assets/ui/daily-explanation-wax-next-v2.svg`, Git blob SHA `103af90347ddb90bcd23cbe0013563373dbc4fde`. Burgundy embossed wax button, delicate metallic-gold right arrow built into the image. The arrow must not appear a second time as text.
- **Approved stylesheet:** `daily-discovery-explanation-scroll.css`, focusing on the **last V3 override section** for the image, button placement, typography, and spacing.
- **Approved isolated enhancer:** `daily-discovery-explanation-scroll.js`, which identifies **only** Daily Discovery's correct-answer/answer-reveal explanation popup and appends `bu-daily-explanation-scroll` without replacing the underlying dialog, real text, actual Next/Finish button, or event handlers.
- **Loader:** `journey-progress-caption.js` injects the explanation CSS/JS with cache-busting versions. Live and Visual Lab have differing other loader entries (for example TEST banner and audio); **never replace the complete live loader with the test file**.

These are the *approved appearance*, not a universal mandate to show this scroll in any other mode today.

## Visual rules — mandatory for future adaptation

1. A **single integrated physical scroll**, not fake CSS parchment layered over roller photos. Keep the realistic top/bottom roller surfaces, warm light, rough organic side edges, texture and photographic depth.
2. No sharp horizontal cutoffs at roller junctions, no vertical straight seam along right/left, no overlapping rectangular paper layers. Avoid second stamps baked into the background. No decorative “GAME GUIDE” header or other unrelated preprinted wording.
3. Place the dynamic “✓ Correct!” / corresponding answer heading **fully below the upper roller**, centered on parchment. Text is readable old-world italic/serif in dark brown; the heading is restrained dark green. Do **not bake title, Bible answer, explanation or controls into the raster**.
4. All explanation copy remains **real DOM text**, bound to the actual current question, selectable, screen-reader compatible, and unmodified. Long answers scroll **within the parchment text region**; keep the overall gameplay viewport stationary and the navigation control visible.
5. The Next Question / Finish Discovery control is the existing accessible button, visually skinned by the approved dark burgundy wax artwork. The gold arrow is embossed in the art. Position the full seal **on the parchment**, above the lower roller. Avoid second arrows, glow streaks, extra wax patches or seal overlays.
6. Preserve close X, native focus and keyboard behavior, correct/incorrect explanation, progress, rewards, sounds, state, saved data, and click handlers. The improvement changes **presentation only**.
7. Keep scroll transitions short and understated, with reduced-motion support. Keep readable contrast and phone-safe padding (Android and Safari), including smaller heights.
8. No crosses or other inappropriate religious emblems on decorative Bible artwork, as required by the icon rulebook.

## Required validation for future use

- [ ] Review exact approved V3 artwork, wax asset and implementation from GitHub. Check source-vs-output visually, not just syntax.
- [ ] Confirm only the owner's specifically approved mode is affected; **do not apply game-wide automatically**.
- [ ] Inspect short and typical explanations, correct/incorrect heading, Next/Finish behaviors, close, back and restart; ensure no text or button overlaps rollers.
- [ ] Confirm the *actual* text remains readable and scrollable on narrow phones and at larger system text sizes; controls stay visible.
- [ ] Check the extreme-long-explanation case before claiming overflow support is device-verified; this was **not physically tested at time of approval**. CSS `overflow-y:auto` is present, but Android/iPhone long-content testing remains open.
- [ ] Check visual fit on Samsung Chrome and iPhone Safari when available.
- [ ] Do Visual Lab first; obtain explicit owner approval before moving a new mode to live. Record hashes, rollbacks, and actual GitHub Pages result separately from code checks.

## Change control / rollback

Treat this V3 scroll and V2 wax button as the **locked visual baseline**. Preserve the earlier images in history for rollback, but **never silently revert** to V1/V2 appearance. Future improvements must be versioned, inspected on a real phone, approved, and recorded in this file in both repositories. Documentation may be synchronized without any additional game-mode rollout.

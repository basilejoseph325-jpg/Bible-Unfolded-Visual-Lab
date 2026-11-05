# BIBLE UNFOLDED — APPROVED ANSWER TABLET & GOLD ICON DESIGN STANDARD

**Status:** Approved design standard, November 4, 2026.  
**Applies to:** Future answer-box and toolbar-icon design work across game modes, **as a design reference only**.  
**Currently implemented and approved visually:** Daily Discovery in Visual Lab. **Do not apply across modes or promote to live without a specific owner instruction.**

**Mandatory use:** Before changing any answer choices, answer tablets, question-panel treatments, or tool icons, read this file and `BIBLE_UNFOLDED_RULEBOOK_START_HERE.md`. Inspect the CURRENT actual DOM, CSS cascade, loading order, and event handlers. Do not rely on screenshots, remembered selectors, or mockup alone.

## A. Answer tablets — material, shape, and feedback

1. **Carved sandstone, not flat rectangles.** Every answer choice must look physically three-dimensional: warm ivory/sandstone mineral tones, gently mottled grain, individually varied light direction, recessed inner carved lip, layered edge bevels, highlights on upper/left edges, shadow on lower/right edges, and a soft cast shadow that visibly separates the tablet from the blue/teal background.
2. **Subtle individuality.** Vary mineral grain and lighting slightly between the four tablets. **Never** make one choice visibly flatter, a different material, a different size, or a noticeably different brightness tier. Uniform readability and affordance are more important than decorative uniqueness.
3. **Layout discipline.** Maintain the approved four stacked, full-width tablet design, gold-framed A/B/C/D medallions, dark readable answer text, comfortable touch targets, existing responsive sizing, and **no-scroll single-phone-viewport gameplay**. Do not introduce extra vertical padding, clipped answers, horizontal scrolling, or obstructive flourishes.
4. **Correct and incorrect states have priority over sandstone.** Wrong selection: visually clear red stone treatment with a **short red border/glow flash**; correct selection: green stone treatment with a **short green border/glow**. Both states retain the carved material and dimensional shadows. Each valid wrong attempt gets feedback, including the second/third attempt. Persistently missed choices remain visibly marked as gameplay dictates. Maintain distinct outlines and readable text.
5. **Physically responsive press.** On tap, the selected tablet depresses about **2 px**, with restrained shadow contraction. Avoid wobble, bounce, excessive scaling, flashing whole page, or animation that masks which choice was tapped. Respect reduced-motion settings.
6. **Do not break interactions.** Preserve original click handlers, retry behavior, hint elimination, disabled choices, correctness logic, explanation modal, audio feedback, scoring, tokens, saved progress, and browser accessibility. Never style a pseudo-element over the interactive content or intercept taps.
7. **Question-panel companion treatment.** The illustrated question scene remains visible, but darken the image **behind the words** for contrast, keep warm-gold text and a gold double border, and use only a **faint warm-gold outer glow**. It must feel prominent without overpowering the answers.
8. **CSS precedence is mandatory QA.** Explicitly check `:nth-child`, `:nth-of-type`, `:active`, `:disabled`, `.correct`, `.incorrect`, inherited rules, `!important`, and late-loaded styles. General sandstone rules **must not** override red/green status states. Test all four answer positions, long/short copy, and multiple wrong selections.

## B. Antique-gold toolbar icon language

1. **Consistent visual family across modes when individually approved:** elegant, finely drawn antique-gold line art, legible at mobile size, lightly luminous, similar stroke weight, centered directly in existing navy/teal toolbar buttons with thin gold outer borders. Keep the button dimensions and hit targets; do **not** make every button gold.
2. **Bible icon:** a plain open Bible / open book with visible page contours or page lines. **Absolutely no cross** or cruciform religious ornament, including on the cover or pages. Do not substitute emoji glyphs whose appearance differs by phone.
3. **Hint icon:** recognizable antique-gold light bulb, soft radiance, no cartoon emoji rendering.
4. **Reveal icon:** simple antique-gold eye outline (with centered iris); **not a scroll icon**. Maintain its existing reveal action and cost/confirmation behavior.
5. **Other future icons:** apply the same family to reset, undo, shuffle, menu, research, etc. only after checking the mode's meaning and obtaining explicit approval. Icons must remain semantically distinguishable. Do not silently change other modes.
6. **Never nest a second button around the icon.** The November 4 Visual Lab first pass failed because legacy `.bu3918-tools span` CSS styled an SVG `span` wrapper like another button, making an ugly narrow interior capsule. The **approved correction** resets the inner wrapper's border, background, box shadow, size restrictions and padding while leaving the **real outer button** intact. When adding icons elsewhere, inspect ancestor and descendant selector inheritance before introducing spans.
7. **Preserve behavior and accessibility:** keep the actual button node, click event handler, accessible name/title, focus treatment, enabled/disabled state and tooltip. Replace only the *visible icon content*. Do not change status/counter text such as `1/5`.
8. **No cross in promotional renders either.** A mockup is a target to faithfully implement, not evidence that the CSS has matched it. Compare actual phone output side by side with the approved render.

## C. Implementation reference — Daily Discovery (Visual Lab)

These are **historical implementation pointers**, not a license to copy selectors without reinspection:
- `daily-discovery-question-premium.css`: base raised sandstone tablets; wrong/right states; mineral relief.
- `daily-discovery-polish-test.css`: subtle tablet variation, darkened question image, faint gold glow, press state, red/green carved lighting, **corrected full-size gold icon styling**.
- `daily-discovery-gold-icons-test.js`: cross-free inline SVG Bible, bulb and eye; replaces only icon content within existing action buttons.
- `journey-progress-caption.js`: Visual Lab loader and versioned CSS/JS references.
- The gameplay logic and other mode styling remain separate; confirm the current filenames/loaders before editing.

**Approved visual outcome:** No inner capsule around the icon; gold symbols large and centered inside the one original navy button; all four answer tablets uniformly stone-like, with subtle light variation and solid feedback. The original visual render's cross was **rejected** and must never be copied. The corrected cross-free icon is accepted.

## D. Mandatory change checklist (every answer-box/icon modification)

- [ ] Read permanent Headquarters rulebook plus this standard.
- [ ] Determine **exact mode and repository**; Visual Lab is the default test target. No unintended changes to other modes or live.
- [ ] Inspect actual renderer, CSS cascade, loader/cache version, and handlers; identify root cause before changing code.
- [ ] Preserve answer dimensions, no-scroll viewport, icon touch targets, button events and accessible names.
- [ ] Compare visual rendering with approved design and check A/B/C/D, different text lengths, Android Chrome and Safari when feasible.
- [ ] Test normal, pressed, wrong **first and subsequent** attempts, correct, disabled and eliminated states, hints, reveal, explanation, navigation, audio and saved progress.
- [ ] Verify code/syntax, GitHub Actions, Pages deployment, and phone display **separately**. Report anything not actually verified.
- [ ] Request owner visual approval before promoting a test styling change or applying it across game modes.
- [ ] For promotion, transfer **only approved changes**, keep live-specific features, record commit hashes and a rollback point.

## E. Rulebook priority and change control

This file is a **binding visual-design addendum**, subordinate to the project safety/content rules and the permanent Headquarters operational rulebook. Do not weaken existing source-first Bible-content rules (NWT 2013 and JW.org). Updates to these approved visual standards require explicit owner approval. Keep this document versioned in GitHub in **both** `Bible-Unfolded-Visual-Lab` and `Story-Trails`; update both copies when the owner changes the design rules, **without automatically altering live gameplay**.


## F. Metallic artwork refinement — November 4, 2026 (owner-directed prototype)

**New accepted direction, not yet accepted final artwork:** The owner compared the initial simple SVG glyphs with the premium mockup and found the mockup **materially more refined**. The approved direction is therefore **individual transparent image assets with fine engraved details and dimensional metallic gold**, not merely thickened single-color SVG outlines or increased glow. Before using a new icon as the gold standard for other modes, show the actual on-device implementation and obtain owner approval.

- Render **separate individual assets** for Bible, Hint, and Reveal, each with nuanced gold tonal gradations (light cream-gold edges, rich mid-gold faces, darker bronze undercuts), restrained inner highlights, selective shadowing, and controlled soft glow. Keep silhouettes legible at a 38–48 px mobile display size, but avoid cartoon-like thick strokes and uniform yellow outlines.
- **No cross on any Bible artwork**, ever; include no cross, cruciform decoration, religious insignia, or emoji substitution. Bible imagery is an open book with page curves and fine manuscript lines.
- **Preserve existing navy/teal outer action buttons**, gold borders, hit areas, click handlers, titles and aria labels. The SVG asset itself is transparent; no second pill/capsule, nested button background, or image rectangle.
- Keep Daily Discovery styling isolated to Daily Discovery. Only trial the richer artwork in **Visual Lab** until visual owner acceptance; this directive does **not** authorize live changes or a game-wide switch.
- Compare the actual game with the visual reference at native phone scale for metallic highlights, engraving, scale, icon spacing, and quality. Static syntax checks and successful GitHub Pages deployments do **not** prove visual equivalence.
- Trial implementation assets (Visual Lab): `assets/ui/daily-gold-bible-v3.svg`, `daily-gold-hint-v3.svg`, `daily-gold-eye-v3.svg`, rendered by `daily-discovery-gold-icons-test.js`. These are **candidate artwork**, not locked final icon assets, until the owner inspects and approves them.

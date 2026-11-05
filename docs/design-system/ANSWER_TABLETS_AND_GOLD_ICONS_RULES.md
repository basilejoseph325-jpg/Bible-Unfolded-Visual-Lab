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

**Historical context (superseded by the approved V3 artwork in Section G):** The owner compared the initial simple SVG glyphs with the premium mockup and found the mockup **materially more refined**. The approved direction is therefore **individual transparent image assets with fine engraved details and dimensional metallic gold**, not merely thickened single-color SVG outlines or increased glow. Before using a new icon as the gold standard for other modes, show the actual on-device implementation and obtain owner approval.

- Render **separate individual assets** for Bible, Hint, and Reveal, each with nuanced gold tonal gradations (light cream-gold edges, rich mid-gold faces, darker bronze undercuts), restrained inner highlights, selective shadowing, and controlled soft glow. Keep silhouettes legible at a 38–48 px mobile display size, but avoid cartoon-like thick strokes and uniform yellow outlines.
- **No cross on any Bible artwork**, ever; include no cross, cruciform decoration, religious insignia, or emoji substitution. Bible imagery is an open book with page curves and fine manuscript lines.
- **Preserve existing navy/teal outer action buttons**, gold borders, hit areas, click handlers, titles and aria labels. The SVG asset itself is transparent; no second pill/capsule, nested button background, or image rectangle.
- Keep Daily Discovery styling isolated to Daily Discovery. Only trial the richer artwork in **Visual Lab** until visual owner acceptance; this directive does **not** authorize live changes or a game-wide switch.
- Compare the actual game with the visual reference at native phone scale for metallic highlights, engraving, scale, icon spacing, and quality. Static syntax checks and successful GitHub Pages deployments do **not** prove visual equivalence.
- Trial implementation assets (Visual Lab): `assets/ui/daily-gold-bible-v3.svg`, `daily-gold-hint-v3.svg`, `daily-gold-eye-v3.svg`, rendered by `daily-discovery-gold-icons-test.js`. These are **candidate artwork**, not locked final icon assets, until the owner inspects and approves them.


## G. Final approved icon master — owner acceptance November 4, 2026

**Status: OWNER APPROVED.** The owner inspected the actual Visual Lab phone screenshot of the V3 metallic Bible, light bulb and eye (Deep Dive, Genesis 3:15), stated that all three controls work, and authorized promotion of the final visuals to live. **These V3 assets—not the earlier flat outlines, nested-capsule attempt, or the crossed-Bible mockup—are the authoritative visual master for all future game icon artwork.**

### Immutable visual master files (copy/reuse; do not reinvent their look)

- `assets/ui/daily-gold-bible-v3.svg` — cross-free open Bible with curved pages, engraved fine manuscript lines, dimensional gold edges.
- `assets/ui/daily-gold-hint-v3.svg` — detailed gold light bulb with restrained rays, filament, warm highlights and bronze undercuts.
- `assets/ui/daily-gold-eye-v3.svg` — layered metallic-gold eye and dimensional iris.
- Their displayed size, transparent background and drop-shadow treatment are defined in `daily-discovery-polish-test.css` (V3 `.bu-daily-gold-icon > img` styling). The existing outer navy buttons, gold outlines, no nested capsules, and touch targets must remain.

**For new icon functions**, design individually transparent assets in this *same* V3 style: matching gradient stops (cream-gold highlights through rich amber to deep bronze), similar carved detail, contour weight, 64×64 viewBox, restrained glow/shadow, consistent apparent weight and optical scale on a phone. Reuse exact existing master assets for identical functions. Maintain distinct, recognizable symbols for different functions. **No crosses or religious ornaments on Bible/book icons, ever.**

### Non-negotiable reuse and QA process

1. Fetch and examine all **three master SVG files** and their current presentation CSS **before designing or editing icons**. New-chat context summaries alone are not enough.
2. Never swap back to emojis, generic single-color strokes, flat yellow icons, or icons inside inner capsules. Do not adjust the approved three masters casually.
3. Preserve each mode's existing accessible buttons, handlers, functionality, sizes and state. New work is **Visual Lab only until separately approved** for that mode and live promotion.
4. On a real phone, compare all three masters and any new icons side by side in the actual interface; check width, brightness, texture, depth, shadows, readability, spacing and performance.
5. The November 4 V3 artwork is **approved**; do not treat its previously provisional candidate label in section F as current. This section supersedes F's *candidate/not yet accepted* language.
6. If an icon changes after approval, record the new version, owner acceptance and master asset filenames here in **both repositories**; preserve older approved versions for recovery.

**Scope of this approval:** the V3 metallic trio is approved for **Daily Discovery live** and as the **visual standard for future icon creation**. It does **not** direct immediate icon changes in other modes.


## H. Game-wide master icon style approved — November 4, 2026

**Owner approval:** The owner confirmed that the metallic-gold Story Adventure icon upgrade works and looks excellent across most chapters, and explicitly directed that **this exact visual language will be used across every part of Bible Unfolded**. Treat this as a **permanent game-wide DESIGN STANDARD**, not permission to immediately change every mode or the live site.

- Preserve and reuse the original immutable icons `assets/ui/daily-gold-bible-v3.svg`, `daily-gold-hint-v3.svg`, and `daily-gold-eye-v3.svg`, plus the matching Story Adventure collection `assets/ui/story-gold-context-v1.svg`, `story-gold-shuffle-v1.svg`, `story-gold-clear-v1.svg`, `story-gold-check-v1.svg`, `story-gold-restart-v1.svg`, `story-gold-back-v1.svg`, and `story-gold-menu-v1.svg`.
- **Every future game icon** must belong to this exact family: dimensional engraved antique gold, layered cream-to-gold-to-bronze gradients, modest glow and shadow, individually recognizable silhouettes, transparent 64×64 artwork and consistent optical size. Avoid emoji glyphs, flat monochrome replacements, mismatched strokes, artificial extra capsules, or decoration that obscures the functions. No cross on Bible imagery.
- **Functional controls retain their original semantics**: Bible, story/context, hint, shuffle, undo/clear, check, reveal, replay, back, and menu stay distinct. Keep the same real button, label/aria, sound, cost, save behavior and handler; only change presentation.
- **Story Adventure has multiple rendering engines and completion paths.** Inspect all active episode roots and their generated button selectors, including Genesis/Abraham/Isaac/Rebekah and newer story chapters, not just `#play`. A successful icon replacement in one chapter is not proof of full coverage. The November 4 approval includes a report of remaining chapters not yet matched; those exceptions require a scoped Visual Lab correction and verification.
- **Rollout remains staged:** Visual Lab first for each mode or renderer, owner visual approval, then explicitly approved transfer to live. This approval of the artistic standard does not authorize a blanket code migration across modes or changes to story wheels/layout.
- Future new icon assets must be matched against the approved source SVGs and checked visually on a real phone. Version and preserve them in GitHub. This section supersedes any older suggestions that the V3 metallic look is merely optional or a one-mode-only design style.

# Daily Discovery: illustrated-book 30-lesson pilot — November 11, 2026

**Scope:** Visual Lab TEST ONLY. The book design now opens by default in Visual Lab TEST (Nov 12 update below). Previously this was an opt-in prototype using `?daily_book=1&daily_preview=peter&daily_insight=1`; do not modify LIVE unless the owner gives explicit permission after phone QA.

## Why this exists
The owner approved the illustrated reading layout and wanted a manageable art library (around 15–20 pictures, not hundreds). The first three realistic, original locally stored pictures were verified in the current TEST build, and the one-tap Peter/Nile/Ruth preview picker was accepted.

The 30-lesson extension provides a **curated 16-image pilot** without silently inventing 12 new images or labeling existing theme artwork as an exact event. Only the Peter, Nile and Ruth images are new realistic scene-specific reconstructions. **The other 13 images are reused existing Bible Unfolded assets.** They carry the on-page label `Thematic illustration`. They require a visual editorial inspection before any permanent release; some represent general time periods or topics rather than the exact described event.

### Reused image inventory (13)
- `scholar-research-assets/witness-history.webp`
- `journey-art/07_good_news_spreads.webp`
- `journey-art/05_exile_return.webp`
- `journey-art/04_judges_kings.webp`
- `family-worship-menu-art/v1/topic-19-elisha.webp`
- `family-worship-menu-art/v1/topic-37-jehovah-s-qualities.webp`
- `family-worship-menu-art/v1/topic-23-jesus-illustrations.webp`
- `family-worship-menu-art/v1/topic-26-paul-timothy.webp`
- `family-worship-menu-art/v1/topic-30-psalms.webp`
- `family-worship-menu-art/v1/topic-38-jesus-ministry.webp`
- `family-worship-menu-art/v1/topic-16-david.webp`
- `family-worship-menu-art/v1/topic-13-joshua-jericho.webp`
- `family-worship-menu-art/v1/topic-29-nehemiah.webp`

### Original scene images (3)
- `assets/daily-book/peter-fishing.webp` — Peter's fishing setting
- `assets/daily-book/nile-farmland.webp` — Nile farm and waterway
- `assets/daily-book/ruth-harvest.webp` — Ruth's harvest setting

## User-facing behavior
- The TEST-only book view now appears by default from the ordinary Daily Discovery home tile. Use `daily_book=0` for the previous blue-only visual comparison; LIVE does not change.
- The existing blue/gold outer frame, warm illustrated-paper page, accurate source link, Save, Share the Thought, Copy, and daily-read behavior are preserved.
- An unobtrusive `All 30 discoveries` dropdown in the TEST book lets the owner browse every chapter, alongside the Peter/Nile/Ruth quick examples. When selected, the actual lesson ID, scene, caption and preview URL change together without reloading. Browser refresh retains the selected preview from the URL.
- Original saved collection IDs, date order, reader state, native points/tokens/wallet, Word Trails, voices, menus, other modes and LIVE are not changed.
- `Artist’s reconstruction` is displayed only for the three original images. Other reused visuals are clearly `Thematic illustration` and should not be mistaken for photographs of Bible characters/events.
- The images do not validate historical details or make additional factual claims. Biblical content stays grounded in JW.org/NWT.

## QA and next editorial phase
- Automated `.github/workflows/qa-daily-book-preview.yml` includes narrow/portrait/landscape phone checks, all 30 option IDs, all 30 local image URLs and load health, 16 distinct images, narrative swaps, Share/Save, preview URL/refresh, no legacy knock interception and preservation of the original normal reader.
- **Still not complete:** visually inspect all 30 illustrated pages for art-event relevance and any JW-inappropriate details; replace weak/too-general pictures with approximately 12 new original, historically plausible landscape scenes as image generation becomes reliable; Samsung Chrome and James iPhone Safari acceptance; owner approval of selected art and LIVE promotion.
- Do not describe the 13 reused images as newly generated historical photographs or assert 30 original scenes exist.
- Never bulk-load 30 large images into the Daily page. Only render the selected scene and visible Saved images; compress local assets and keep fast-loading mobile performance.

**Rollback:** Restore original `daily-discovery-meaningful-test-v1.js`, `daily-discovery-meaningful-test-v1.css` and the TEST bootstrap cache-version chain from the latest approved predecessor. The original blue reader is preserved independently of this opt-in experiment.

## November 12, 2026 — Chrome/browser handoff and TEST-default correction

The owner reported the preview looked right when opened from the shared link, but an external Chrome opening showed the previous teal-only page. Root cause identified in the implementation: `bookImage()` and chapter-selector handlers required the `daily_book=1` URL parameter. Whether Chrome stripped the parameter in the specific screenshot cannot be proved from the cropped address bar, but the code **would** fall back whenever it was absent. The screenshot confirmed that fallback occurred.

**Correction in TEST only:** The illustrated-book layout, mapped artwork, and in-app 30-lesson selector are now the default when Daily Discovery opens through its ordinary home tile, even from the bare repository Pages URL. The explicitly selected earlier visual treatment remains available with `?daily_book=0`. Preview deep links still work and a selected preview's URL survives refresh.

The top **Today** tab now resets an editorial preview to the real dated discovery, keeping marking-as-read and saved-state semantics accurate. Art provenance remains honest: 3 artist reconstructions and 13 reused thematic assets across the same 30 lessons, not 30 newly photographed Bible scenes.

**QA:** The book workflow now explicitly launches ordinary `index.html` and clicks the actual `#bu375-home-cta` button in a phone-size browser, asserting the parchment styles, art, and all-30 selector show **without any query string**. It also asserts the `daily_book=0` comparison still renders the original teal design. General Daily Discovery acceptance also tests page navigation and saved-state isolation. Physical Android Chrome / iPhone Safari signoff remains separate.

**LIVE:** no changes; promote only after artwork review, device checks and explicit owner authorization.

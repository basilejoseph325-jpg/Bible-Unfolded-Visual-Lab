# Daily Discovery — Optional Illustrated History Book Preview (TEST)
**November 11, 2026 | Status: prototype, owner review pending | LIVE untouched**

## Goal
Make each daily reading feel like opening a beautiful illustrated Bible-history book **without replacing Bible Unfolded's teal/gold visual identity**. A realistic historical scene creates the moment; a carefully textured ivory book page makes reading comfortable. The old approved Daily design remains the default.

## Pilot art (3 original generated scenes)
| Discovery ID | Scene file | Grounding | Provenance |
| --- | --- | --- | --- |
| `peter` | `assets/daily-book/peter-fishing.webp` | Luke 5:1–11 — fishing boats, nets, huge catch | Artist's reconstruction; not an archival photograph or claimed image of Peter |
| `nile` | `assets/daily-book/nile-farmland.webp` | Egypt's Nile agriculture, boat travel, river setting | Interpretive landscape; pyramids and river surroundings are illustrative rather than literal biblical evidence |
| `ruth` | `assets/daily-book/ruth-harvest.webp` | Ruth 2:1–23 — gleaning behind harvesters in Bethlehem | Artist's reconstruction, not a verified historical portrait of Ruth or Boaz |

Primary official source references:
- https://www.jw.org/en/library/bible/nwt/books/luke/5/
- https://www.jw.org/en/library/bible/nwt/books/ruth/2/
- https://www.jw.org/en/library/bible/nwt/books/exodus/2/

Assets optimized as WebP for phone-scale use; do not rename or replace existing game assets. The original same-day schedule, ID `bu-daily-insight-test-v1` saved key, article text, scripture links, read/shared history and all canonical rewards and older daily saves are unmodified.

## View it (owner convenience)
- `?daily_book=1&daily_preview=peter&daily_insight=1`
- `?daily_book=1&daily_preview=nile&daily_insight=1`
- `?daily_book=1&daily_preview=ruth&daily_insight=1`

The explicit `daily_book=1` switch activates the alternate page only when the discovery ID has custom artwork. Normal Daily Discovery and other 27 entries use the previous reader. The preview flags select the displayed lesson without awarding or changing the real day's reward. Saved shelves may use the matching book image during the preview; fallback art remains intact if an asset is unavailable.

## How many images?
For the initial 30 days, aim for **15 carefully researched, diverse scenes** (not 30 or 365). Every scene can be reused later only for a genuinely appropriate setting, far apart in the rotation when feasible. Do **not** randomly recycle scenes of unique Bible people for unrelated events. The three pilot artworks cover 3 specific entries. After the owner approves the design, fill gaps in batches, with a modest long-term bank of 18–24 reusable thematic scenes and occasional genuinely special art for standout stories. Keep art original or properly licensed and label reconstructions as such.

## Design and QA
The opt-in presentation adds a photographic cover framed by a warm book-paper mat, a readable sepia/ivory chapter leaf, gold hairline details and light texture. It is *not* a giant book image that wastes mobile space. Standard navigational tabs, back, menus, sound, Save, Copy, Share, JW.org source, and rewards stay under the same JS handlers.

GitHub workflow `QA Daily illustrated book preview — TEST Only` checks 320×568, 390×705, and 832×384 viewports, all three images and Bible IDs, natural image dimensions, paper color, horizontal fit, saved image association, sharing and preservation of the default unflagged page. Desktop and simulated-phone tests do **not** equal owner Samsung or James iPhone acceptance. No LIVE promotion until owner approval, rollback, and the selective-release QA gate.

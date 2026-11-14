# Word Trails WebKit / Safari engine compatibility QA v9 — TEST only

This run checks an actual Linux WebKit browser engine, which is useful for detecting Safari-engine differences, at 390×705 and 320×568 emulated phone viewports. It is **not** a real iPhone or Safari on iOS and does not replace James's device acceptance.

The test executes the existing fictional-saves checkpoint practice screen and tests its actual file download and saved-backup/consent interaction. It also injects the **real TEST** v2 backup validator, unlinked v7 journal writer and v8 bridge into a separate fresh isolated WebKit browser context with two same-origin tabs and **synthetic** values only.

Required safety: preserve real-browser sentinels for LIVE crossword saves and purchased-wheel/voice preferences; no TEST-to-native coin conversion; no side scroll, no JS page errors; if Web Locks API exists, a held lock must block one tab and re-reviewed approval must commit once; if Web Locks is unavailable, import **must fail closed** with zero changes. No actual player data, LIVE source, gameplay pages or original native Settings controls are modified. The TEST-only bridge is still unlinked from every real player page.

## Verified GitHub Actions evidence

**[v9 WebKit browser-engine workflow #43553193406 — SUCCESS](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43553193406)** on TEST commit `0e9268cf6a40c1f08d7c19f642885a9005cc5d3e`.

- Real Linux Playwright **WebKit**, not Chromium, at **390×705** and **320×568**. Both sizes passed: native `navigator.locks` existed in this engine build; downloadable fictional checkpoint file bytes matched the actual browser download; a separate saved-copy acknowledgment was required before fake transfer; a valid fake import made no real-browser protected-key writes; no sideways overflow or page exceptions.
- Both sizes passed with **two true same-origin WebKit tabs**, real v2 backup validator, v7 Web Lock/journal writer and unlinked v8 bridge: a held Web Lock refused a competing import, and an explicitly approved re-reviewed synthetic transaction succeeded after release. Purchased wheel ownership was preserved, existing LIVE crossword save and voice were byte-identical, and TEST crossword currency remained separate from native Insight Tokens.
- Test uses **fresh private browser contexts and synthetic progress only**. A passing WebKit engine test cannot prove real Safari on iOS, hardware speaker output, device-specific gestures, or a safe LIVE cutover. No real-data import is enabled.

**[v9 actual native gameplay extension #43553444384 — SUCCESS](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43553444384)** on TEST commit `33cbc8dee79bbb6e59f22192792da050726098d0`.

- The workflow re-ran the original four WebKit compatibility checks at both widths and added **actual Bible Unfolded native TEST game** checks at both 390×705 and 320×568. Not a mock game: loaded `index.html`, actual original native Settings and Save/Import controls, actual Word Trails homepage card, real Word Trails crossword iframe and wheel, and verified one TEST-only practice link in native Settings.
- Word Trails' Settings command opened the **root native Settings** rather than another child dialog. The player could exit to Home, tap the Word Trails home card **again** after the guard reset, and refresh from Word Trails back to **Home** without silently reopening the crossword.
- Protected original LIVE crossword progress was unchanged in isolated browser storage. Both runs reported **zero JavaScript page exceptions** and no sideways overflow. Automated browser results do **not** establish subjective voice/SFX quality or a physical iPhone.

**Actual source scope:** workflow and newly added QA scripts only; existing application, crossword code, visual assets, native backup/restore UI, wallet, original LIVE source and other games were **not** edited. No need to introduce extra gameplay code just to make passing tests pass.

## Release decision

**WebKit engine QA PASSED; LIVE promotion still BLOCKED.** This reduces Safari-engine uncertainty, but does not solve the original LIVE auto-importer (non-cooperative, cached old tabs), full player-grade restore/rollback, independent NWT/JW.org human review of all 77 newer Bible entries, appropriate commercial announcer licenses, original LIVE recoverability, owner Samsung Android/James iPhone Safari acceptance, and explicit owner release approval. Neither TEST-only v7/v8 import candidate nor commercial demo voice clips may be silently added to LIVE.


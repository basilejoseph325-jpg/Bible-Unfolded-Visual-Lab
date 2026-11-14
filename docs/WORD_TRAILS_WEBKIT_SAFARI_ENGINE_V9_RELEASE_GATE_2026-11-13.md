# Word Trails WebKit / Safari engine compatibility QA v9 — TEST only

This run checks an actual Linux WebKit browser engine, which is useful for detecting Safari-engine differences, at 390×705 and 320×568 emulated phone viewports. It is **not** a real iPhone or Safari on iOS and does not replace James's device acceptance.

The test executes the existing fictional-saves checkpoint practice screen and tests its actual file download and saved-backup/consent interaction. It also injects the **real TEST** v2 backup validator, unlinked v7 journal writer and v8 bridge into a separate fresh isolated WebKit browser context with two same-origin tabs and **synthetic** values only.

Required safety: preserve real-browser sentinels for LIVE crossword saves and purchased-wheel/voice preferences; no TEST-to-native coin conversion; no side scroll, no JS page errors; if Web Locks API exists, a held lock must block one tab and re-reviewed approval must commit once; if Web Locks is unavailable, import **must fail closed** with zero changes. No actual player data, LIVE source, gameplay pages or original native Settings controls are modified. The TEST-only bridge is still unlinked from every real player page.

**Initial status:** awaiting GitHub Actions engine result. Do not claim WebKit compatibility or phone acceptance before a passing run. Current LIVE auto-import is still an unresolved release blocker even if this test passes.

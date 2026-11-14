# Bible Unfolded Visual Lab — TEST v25 pre-release regression checkpoint

**Date:** November 13, 2026 (local project day; CI timestamps Nov 14 UTC)
**Scope:** TEST GitHub Pages only. **Original Story-Trails LIVE unchanged.**
**Frozen checked TEST commit:** `fe1b69085866f76ff316917ded22159d270cfb87`
**Protected LIVE verified head:** `74a96491770ab6aa7229889ce1aa4733e06666d8`

## Why this gate exists

Owner requires robust playability and saved-progress protection before he and James are asked to test. GitHub Pages deployment success alone is not gameplay acceptance, and a browser QA pass is not the same as physical Samsung Android/iPhone Safari acceptance.

This update changes **TEST-only automated tests and GitHub Actions workflows**, not the actual playable native game, puzzle data, native wallet, paid wheels, voice scripts, or LIVE source.

## Detected and fixed an inaccurate audio regression test

Earlier [Native Shared Menu Host QA #43531275691](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43531275691) incorrectly asserted that the legacy shared audio record `bu-platform-audio-preferences-v1` never changed while toggling a parent native SFX preference and toggling it back. It failed despite correct child SFX propagation.

Investigation instrumented `Storage.prototype.setItem` in isolated Puppeteer browser contexts without changing game code. The writes came exclusively from the **original main Settings owner** in `visual-lab-test-banner.js` (sync save function), with `source:"main"` and a deliberately changing `updated` timestamp. No shared-key writes came from the embedded Word Trails iframe. The sound value toggled off and back on successfully, and the separate Word Trails FEEL save did not change.

A second **test startup race** also existed: the native audio bridge intentionally installs its listeners ~800 ms after window load. Waiting for any preexisting shared-audio key is insufficient, because multiple viewport tests share a browser origin. The corrected test waits for a write issued by the **current page**, then asserts: unchanged settings payload (ignoring timestamp), owner is root rather than child, both native toggles persisted, child state follows root and returns, and no iframe shared-key writes.

**[Corrected standalone native menu test #43533235686 — SUCCESS](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43533235686)**. Previous red tests were test-assertion/startup artifacts, not evidence of a broken game audio feature. No actual game audio source was modified to pass the test.

## New one-command four-part regression gate

Workflow [`.github/workflows/qa-test-release-readiness-v25.yml`](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/blob/main/.github/workflows/qa-test-release-readiness-v25.yml) runs on relevant TEST changes and can be invoked by GitHub workflow dispatch.

**[Entire v25 sweep #43533404715 — ALL FOUR JOBS SUCCESS](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43533404715)** at exact commit above:

1. **Original modes + native Word Trails portrait and landscape:** Original home cards, Bible Books token unlock, original game screen routing, native rewards host, shared Word Trails shell, no duplicate menu, no unexpected navigation and no JavaScript exceptions. Passed.
2. **Native Settings/audio/announcer/Ocean Glow:** corrected main Settings ownership test and native menu/back/refresh, native voice delegation, SFX/music preference propagation and unique Word Trails feel key, curved Ocean Glow trace, halo, swipe mist, touch glitter, entitlement preservation. Browser viewports 390×705, 320×568 and landscape as in relevant test. Passed.
3. **All 30 Word Trails puzzles + 20 voice assets:** calls the existing source-first 30-level and real gameplay browser suite as a reusable GitHub Actions workflow. Logs show `SAVED_30_LEVELS {"completed":30,"claimed":38,"coins":7086,"points":1020}` **inside a synthetic isolated test browser**; six Journey Seals, bonus satchels, scenic backgrounds, replay-no-double-mint and five phone layouts covered. Passed.
4. **Save/export/import and safe practice:** 30 puzzle intersection/bonus/source quality, native rewards and paid-wheel preservation, synthetic v6 full-backup journal race demonstrator, native v2 complete TEST export/import (including deliberate storage-quota failure recovery), and original Settings mock checkpoint practice link on 390×705 and 320×568. Passed. No actual user's save, account or wallet was accessed.

[TEST Pages deployment #43533404821 — SUCCESS](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43533404821).

## Critical distinctions / remaining release blockers

**The four green gates DO NOT authorize Word Trails LIVE promotion.** The following remain true:

- Published LIVE `word-trails-live-migration-v1.js` can silently import crossword progress when TEST and LIVE share an origin, and old/open/cached code can recreate progress after rollback. A new Web Lock or no-op shim does not stop old non-participating tabs. v4 retirement and v5 negative demonstration remain **TEST-only**.
- Complete-game v2 save journal recovery can overwrite a newer concurrent update to a native wallet/progress key. v6 detects this in synthetic tests and proposes a conflict-aware before/after journal, but **the candidate is not loaded into the actual game**. A production-grade new coordinator with player confirmation/recovery review must be engineered and verified separately. Existing v2 retains this rare concurrent restore edge case.
- Independent human Scripture/JW.org/NWT review of all 77 new Bible-linked word entries not complete; editorial first-pass AI source review is not human acceptance.
- Physical Samsung Android and James's iPhone Safari actual sound/vibration/navigation/paid-wheel and restore tests still pending. Desktop Chromium emulated mobile layouts are not equivalent to physical mobile browsers.
- Keep original native wallet/Insight Tokens, purchased Ocean Glow entitlement, original Story Adventure progress, announcers, Settings, TEST-vs-LIVE crossword saves and separate TEST coins protected. No full TEST save import into LIVE. Need explicit owner authorization for a particular release, frozen rollback checkpoint and selective file promotion.

**Owner and James remain OFF DUTY.** Next engineering focus: safe whole-game v3 transaction protocol, old/cached tab transition policy, and real consent/backup UX. Do not request physical phone testing until the relevant player-facing release candidate is stable.

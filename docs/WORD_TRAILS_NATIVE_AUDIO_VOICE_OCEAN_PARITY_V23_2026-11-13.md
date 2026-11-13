# Word Trails NEXT — native Settings, audio and Ocean Glow v23 checkpoint

**November 13, 2026 · TEST only · LIVE original unchanged · No physical phone acceptance implied**

## Actual root cause and single-file integration fix

Word Trails already uses the original native Bible Unfolded menu and Settings while mounted in the root page's iframe (`word-trails-native-shell-v1.js`). The native host copies the root's music, sound-effect, slider and reduced-motion values into the Word Trails frame via `BUWTPolish.setPreference(name, value, {silent:true,persist:false})`; **the root remains the one authority for shared settings**.

One edge case remained: `BUWTPolish.openSettings()`, a publicly callable shortcut on the embedded Word Trails frame, could still open the separate `#wt-feel-settings` dialog, and a direct default `BUWTPolish.setPreference('sfx', ...)` call could write a separate `bu-wt-next-feel-v2` preference value while the native root owned sound. This creates confusing duplicate ownership, even though the approved native menu route already works.

**Minimal TEST change:** `experiments/word-trails-feel-v2.js` now detects an active native parent through `parent.BUWTNativeShell`. When native:
- `BUWTPolish.openSettings()` delegates to **`native.openSettings()`**, showing the actual original root Settings; the Word Trails standalone Sound & Feel dialog does not open.
- Direct default-persist attempts to change shared `music`, `sfx`, `musicVolume`, `sfxVolume`, or `motion` in the embedded frame are rejected and resynchronized from native root controls. This prevents creating a competing saved preference record. The already approved **root-to-child** sync with `{silent:true,persist:false}` remains fully functional.
- Standalone TEST Sound & Feel and in-game one-off `haptics` remain separate mode-specific controls. No music soundtrack, approved SFX synthesis, sound levels, wheel textures, animations, Bible content, puzzles, saves, currency or purchases were intentionally changed.

## Confirmed source parity (current branch vs protected LIVE)

| Item | Source-level finding |
| --- | --- |
| All five original `bible_unfolded_core_part1.js` to `part5.js` | Identical TEST vs LIVE Git blob SHAs at the audit baseline |
| `bu-platform-rewards-v1.js` | Identical blob `3e04c85aa7bd...` |
| `experiments/word-trails-native-wheel-v1.js` | Identical blob `80f781b4f510...` |
| `experiments/word-trails-native-wheel-v1.css` | Identical blob `b7173618f2c382c...` |
| `experiments/word-trails-announcer-v1.js` | Identical blob `80690d05dd44...` |
| `experiments/word-trails-feel-v2.css`, `experiments/word-trails-next-v1.css`, `experiments/word-trails-unified-menu-v1.css` | Identical source/style blobs across TEST and LIVE at baseline |
| `experiments/word-trails-original-voice-clips-v1.js` | Loaded in TEST, absent in LIVE. The embedded native iframe delegates voice playback to the original **parent** `bu381Play` instead of copying this extra clip file; standalone QA can use the TEST-only clips. **Licensing:** current free-tier ElevenLabs clips are NONCOMMERCIAL demos, not cleared for monetized distribution |

**Source-level equivalence is not a claim of physical Samsung/iPhone audible or visual identity.** Both devices need to be checked later by the owner and James. The original 2013 NWT / JW.org only editorial source gate also remains separate.

## Automated browser and deployment evidence

- [Native Settings/SFX/voice/Ocean effects QA #43525783367](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43525783367) **SUCCESS** on isolated local TEST at `390×705` and `320×568`: real native menu/Settings opens; direct child preference writes blocked; sliders propagate root to iframe; local Shadow Audio/FEEL keys untouched by root controls; parent announcer function receives the call; forcing Ocean Glow **visually, without granting a purchase** shows cubic ribbon, matching halo, swipe mist canvas and touch glitter; no horizontal overflow or JS errors.
- [Earlier native shared menu and rewards checks #43525426283](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43525426283) **SUCCESS** and [existing Feel Lab QA #43525426157](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43525426157) **SUCCESS** following the patch.
- [Exact one-query homepage publisher #43525949616](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43525949616) **SUCCESS**. Browser cache chain is `index.html → journey-progress-caption.js?v=20261113-wt-audio-v23 → visual-lab-test-banner.js?v=20261113-wt-audio-v23 → word-trails-native-shell-v1.js?v=shared-audio-20261113-v23 → experiments/word-trails-next-v1.html?v=shared-audio-20261113-v23 → word-trails-feel-v2.js?v=native-settings-owner-20261113-v23`. Crossword clue/source bank remains editorial **v22**, unchanged.
- [Published TEST phone-sized browser QA #43526039220](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43526039220) **SUCCESS**: verified the actual public loader chain and reran BOTH phone viewports against the hosted TEST game, confirming all conditions above.

**QA distinction:** native voice tests here intercept the real parent API entry point; they are not subjective verification of loudness/timbre or Android/iOS real-audio playback. Ocean Glow visual tests programmatically apply its appearance CSS without charging or granting ownership; they verify implementation of the approved SVG curve/mist/glitter, not real-world finger feel, performance, or the purchased-wheel UI flow on physical phones.

## Safeguards and next unfinished release gates

1. The old LIVE automatic TEST-progress importer still exists and is not consent-aware or Web-Lock-aware. A v1 consent prototype, v2 Web Locks collision guard and mock confirmation screen exist **only in TEST**, entirely unlinked from real gameplay; no automatic migration of real savings or records was authorized.
2. Test and LIVE coordinated save coordinators intentionally have different protected schemas and keys. Preserve existing native wallet, owned-wheel recovery, private voice preferences, test saved progress and explicit consent before migrating.
3. Confirm actual end-to-end music playback and original announcer clips, Ocean Glow owned-wheel equip behavior, cross-mode audio when leaving Word Trails, and physical Samsung/iPhone Safari in a staged release.
4. Complete independent Scripture review, rollback checkpoint, frozen release manifest and explicit owner LIVE approval before any promotion.

**Status: TEST engineering checkpoint PASSED; LIVE PROMOTION STILL BLOCKED.** Owner and James are not yet required to perform manual testing.

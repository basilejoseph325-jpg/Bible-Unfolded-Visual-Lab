# Word Trails NEXT — Shared-Core Integration Audit (Phase 1)
**9 November 2026 · Visual Lab ONLY · Live Story-Trails untouched**

## Scope and binding release rule
Word Trails NEXT's crossword engine, authored puzzles, Bible discoveries, level progression, visuals and board-specific interactions may remain mode-owned. The global menu/navigation, sound and voice settings, shared wallet, purchased wheel entitlements/equip, and coordinated persistence must use the existing Bible Unfolded platform. Do not promote until the release gate in `WORD_TRAILS_PRE_LIVE_SHARED_CORE_RELEASE_GATE.md` is complete and the owner approves.

## Actual separate systems inventoried in the running TEST prototype
| Concern | Current owner/file | Test/localStorage keys | Shared-core requirement |
| --- | --- | --- | --- |
| Level/progress/crossword/bonus state | `word-trails-next-v1.js` | `bu-visual-lab-wordtrails-next-v1` | Keep puzzle-specific state but store and migrate through the platform's save coordinator. Avoid earning rewards twice on replay. |
| Game music, synthesized effects, volumes, motion, haptics | `word-trails-feel-v2.js` and `word-trails-next-v1.js` | `bu-wt-next-feel-v2`, test-save `sound` | Route shared preferences and audio engine through authoritative API; preserve Word Trails' approved **specific** cues and mix. |
| Shared-audio copy | `word-trails-main-settings-v1.js` | `bu-platform-audio-preferences-v1` | Remove second writer once authoritative settings service is available; do not reset users' preferences. |
| Native announcers | `word-trails-announcer-v1.js` | `bible-unfolded-private-voice-pref-v381`, `bible-unfolded-voice-pref-recovery-v3813` | Use the authoritative voice selection/preview/playback; retain the existing recordings and user selection. |
| Shared wallet and wheel ownership/selection | `word-trails-unified-menu-v1.js` | `bible-unfolded-rewards-v17`, `bible-unfolded-rewards-v17-recovery-v3811`, `bible-unfolded-wheel-ownership-v3825`, `bible-unfolded-wheel-ownership-v3825-backup` | Current bridge **reads/writes wallet keys directly** when equipping; replace with the existing platform rewards/equip service, with one source of truth and no duplicate purchases. |
| Main menu/navigation | `word-trails-unified-menu-v1.js`, standalone `word-trails-next-v1.html` | Local DOM/dialog and `?wt_nav=` navigation | Embed/reuse actual Bible Unfolded navigation and settings, rather than the current lookalike modal. |
| Wheel effects | `word-trails-native-wheel-v1.js` | Theme classes `gold-wheel`, `moon-wheel`, `sea-wheel` | Call/render the same purchased curved trace, halo, mist and glitter effect as the platform wheel, including Ocean Glow. |

## Root cause and important risks
Word Trails NEXT is a **separate standalone page** under `experiments/` with its own localStorage test state and duplicated menu, settings and reward adapter. The current code's menu writes `equippedWheel` directly to rewards main+backup; this is not proof of shared-core ownership. The page's inline refresh handler also redirects to Visual Lab home on reload rather than resuming the puzzle, which must be reconciled with the real platform navigation behavior. A similar-looking screen is not a shared system.

**Critical migration invariant:** The game's starting 60 TEST coins and all TEST-earned coins (including the six milestone awards) are not real Insight Tokens. Never add them to the live wallet automatically. Preserve live coins, points, purchased wheels, selected theme, voice settings and progress exactly; make any progress import an explicit, validated, versioned and idempotent operation. Do not infer a migration from identical key names across sites: browser localStorage is scoped by origin.

## Phase 1 completed
- Located and read the actual TEST game, menu, settings, audio, announcer, wheel and puzzle source.
- Identified each duplicate owner and the exact current key names.
- Established a read-only inventory/migration-preview boundary; it must never update localStorage or import values.
- Confirmed that changing core systems is a separate integration phase and should not be bundled with puzzle-layout edits or sound tuning.

## Still blocked for release
- [ ] Inspect exact authoritative **live** APIs/DOM/save schema before binding adapters; the giant bundled live index cannot be treated as documented API.
- [ ] Replace TEST menu/settings/audio/reward direct implementations one system at a time, using actual platform functions with browser parity tests.
- [ ] Prepare and dry-run the versioned live-save migration, with rollback and zero double-award proof.
- [ ] Validate phone viewport/no-scroll, all 30 puzzles, Ocean Glow, purchases and voices on simulated Android sizes, then owner's Samsung and James's real iPhone Safari.
- [ ] Freeze rollback checkpoint, run all-mode regression suite and obtain explicit owner LIVE approval.

**Status:** Shared-core integration has STARTED (ownership inventory and protected migration boundary). It is **not connected to the live core yet**. LIVE transfer is BLOCKED.

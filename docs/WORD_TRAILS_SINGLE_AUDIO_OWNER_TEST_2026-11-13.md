# Word Trails NEXT — One authoritative audio settings owner (TEST)
**November 13, 2026 · Bible-Unfolded-Visual-Lab only · LIVE protected**

## Why this matters
Word Trails' standalone fallback had its own mirror key, `bu-platform-audio-preferences-v1`, while the real Bible Unfolded homepage already owns global Music/SFX preferences. The native host was also saving every inbound native toggle into the separate Word Trails `bu-wt-next-feel-v2` key. This meant two extra persistence paths could retain conflicting global settings, even though the visible menus appeared unified.

## Changes implemented
- `experiments/word-trails-main-settings-v1.js` no longer reads or writes `bu-platform-audio-preferences-v1`, nor exposes it as a settings API. Existing localStorage values are **not deleted**, preserving rollback and avoiding data loss.
- `experiments/word-trails-feel-v2.js` accepts `setPreference(name,value,{silent:true,persist:false})` for native-host synchronization. This updates active Word Trails audio engine state in memory and UI without writing the `bu-wt-next-feel-v2` key.
- `word-trails-native-shell-v1.js` uses this read-only synchronization for the actual root native `#settings-dialog`. The standalone TEST fallback retains local settings persistence using its existing `bu-wt-next-feel-v2` key. Per-mode sound samples, levels, progression, native recorded announcer and wheel visuals were not changed.
- `scripts/word_trails_native_shell_integration_test.cjs` now checks both native toggle paths do not create a second persistent audio copy, and standalone QA settings change their isolated FEEL key without mutating the pseudo-global key.
- `experiments/word-trails-next-v1.html`, `word-trails-native-shell-v1.js`, `visual-lab-test-banner.js`, `journey-progress-caption.js` and the TEST-only `index.html` single-script loader query were cache-versioned to `20261113-wt-audio-owner-v16` / `single-audio-owner-20261113`. The root index diff is one external script query only.

## Automated verification
- Native shared menu + Settings + announcer + direct published-link + smartphone-size/landscape browser regression: GitHub Actions run **43485922227 PASS** and nested-loader run **43486162993 PASS**.
- Full FEEL audio/gesture/reward browser test **43485735982 PASS**; shared menu and Rewards UI **43485772049 PASS**; gameplay level checks **43485735968 PASS**.
- Mobile cache publisher **43486220999 PASS**, commits the isolated root loader version change.
- GitHub Pages publication is a separate verification step; use latest deployment run for commit `3a0e3f41f4a6` or newer. Do not interpret previous cancelled runs as gameplay failures.

## Rollback / ownership
- Protected TEST source checkpoint: `checkpoint/pre-wordtrails-single-audio-owner-20261113` (created before changes).
- The authoritative owner for global audio is the parent homepage Settings; Word Trails' mode-specific FEEL audio remains mode-owned. This does **not** by itself establish completion of the entire shared-core architecture.
- LIVE `Story-Trails` not edited. Keep separate TEST currency quarantined, current wheel purchases protected, no double charges, owner approval required before any LIVE promotion.

## Remaining release blockers
- Independent JW.org / NWT review of all 77 newer Word Trails Bible-answer and hidden discovery entries, including six noted low-value candidates.
- Confirm all native shared-core/save and wheel integration gates against a frozen release candidate and LIVE's actual data/schema, without copying TEST `index.html`.
- Physical Samsung Android and James's iPhone Safari retesting, particularly audio, wheel FX, state restoration, Back, refresh, no scroll.
- Restorable LIVE rollback and explicit owner approval before LIVE promotion.

Always read `BIBLE_UNFOLDED_RULEBOOK_START_HERE.md` and the permanent Headquarters / James's source-first content standards before further changes.

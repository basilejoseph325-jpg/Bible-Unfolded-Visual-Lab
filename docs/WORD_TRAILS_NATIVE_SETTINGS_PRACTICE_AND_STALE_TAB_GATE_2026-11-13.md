# Word Trails: native Settings rehearsal entry + stale old-tab safety finding

**2026-11-13 | Visual Lab/TEST only | Original Story-Trails LIVE protected**

## 1. Why the native Settings integration must be limited

The original Bible Unfolded root already owns `#settings-dialog` and `#save-export` / `#save-file` inside the original `.save-transfer` area. `bu-platform-saves-v2.js` extends those existing controls, including the complete Bible Unfolded backup with the native wallet, paid wheels and TEST-specific Word Trails state. The root's `BUWTNativeShell.openSettings()` is the authoritative Settings route even when the crossword iframe is active.

A new actual data-migration button without full cross-tab/save-core approval would be unsafe. We instead added an explicitly labelled **TEST-only practice link** to the native Settings save area. The link opens the already-tested fictional-data recovery practice in a new tab. It does not replace or intercept native Save/Import, create a second Settings modal, inspect browser storage, or migrate real progress.

**TEST-only files:** `word-trails-checkpoint-native-settings-practice-v1.js` (one accessible practice hyperlink inserted beside the native save controls), `visual-lab-test-banner.js` (versioned TEST-only loader), `journey-progress-caption.js` (cache query v24), and safe one-query `index.html` publisher `.github/scripts/bust_wordtrails_settings_practice_v24.py` / `.github/workflows/publish-test-wordtrails-settings-practice-v24.yml`. The separate practice destination remains `experiments/word-trails-checkpoint-rehearsal-v2.html`, using an injected memory Map and entirely fake progress.

No actual Word Trails puzzle, reward, sound, Native Settings, original Bible Unfolded engine, or saved-progress writer was modified for this practice link. LIVE remains untouched.

## 2. Native Settings browser regression, both phone viewport sizes

[Automated native Settings browser run #43530966881](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43530966881) **PASS** at **390×705** and **320×568** in isolated Chromium. It:
- Verifies exactly one new practice link inside the **existing original** `#settings-dialog` `.save-transfer`, plus the intact Export/Import controls;
- Opens the practice link by a direct click, in a separate tab with `noopener noreferrer`, and checks the standalone page is explicitly labeled as using made-up saves;
- Checks that opening the practice page does not change a snapshot of the browser's actual native-wallet, paid-wheel, voice, LIVE or TEST progress keys;
- Enters the actual Word Trails home card, invokes its native Settings shortcut and confirms the same single parent Settings link appears, without opening an independent Word Trails Settings dialog or causing horizontal scrolling or page errors;
- Allows the real crossword to **initialize its own normal TEST save** when played. This is NOT a practice-link save mutation and must not be falsely flagged as a leak. The first run (#43530873403) failed on an overstrict QA assertion that incorrectly forbade ordinary first-play TEST progress creation; that assertion was narrowed and the corrected run passed.

**Published-site verification:** [GitHub Actions #43531396589](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43531396589) **PASS**. The actual public TEST root now serves the versioned `index.html → journey-progress-caption.js?v=20261113-wt-settings-practice-v24 → visual-lab-test-banner.js?v=20261113-wt-settings-practice-v24 → word-trails-checkpoint-native-settings-practice-v1.js` chain. Automated Chromium browser checks at **390×705** and **320×568** opened the real native Settings and separate fake-save practice tab, verified original backup controls and unchanged protected storage; no page exceptions or sideways scrolling. The one-query TEST publisher [#43531334810](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43531334810) **PASS**. This is a browser simulation, NOT physical Samsung/iPhone acceptance.

## 3. Stale already-open LIVE tab: hazard actually reproduced

Read-only pinned LIVE current source: `experiments/word-trails-live-migration-v1.js` at protected commit `74a96491770ab6aa7229889ce1aa4733e06666d8`, blob `52d0a564a16a964daf70e156e46e7d7866480c81`.

**[Two-tab browser negative safety regression #43531124347](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43531124347) PASS (BLOCKER REPRODUCED)** at **390×705** and **320×568** in a fresh isolated browser with synthetic wallet/entitlements and two same-origin tabs:

1. Tab A explicitly approves a fictional v4 consent/checkpoint-backed transfer and safely rolls it back; the crossword LIVE key is correctly absent.
2. A second tab then executes the **old pinned LIVE migration script**, representing an old cached/reloaded tab. Because that script has no user-consent or Web Lock support, it **silently recreates LIVE crossword progress** from the TEST save. This is a serious release blocker.
3. The newer v3 rollback rejects the unexpected legacy format, preserving that state rather than inadvertently deleting unknown progress.
4. In a separate fresh fake tab, the proposed inert shim replacing the old script contents runs and **does not** recreate the save. However, that shim cannot stop a tab that already loaded the old code or a browser caching an old response.
5. TEST progress and original native wallet/Points/Insight Tokens, purchased wheel ownership and voice preferences remain unchanged throughout these synthetic browser tests. **No real user data accessed; no LIVE source modified.**

**Result:** source replacement plus a no-op shim under the old filename helps future/newly fetched pages, but does NOT guarantee safety for all already-running, uncooperative or browser-cached scripts. A Web Lock only protects code that participates in it; the old LIVE script does not.

## 4. Exact remaining blockers and next decisions

- **Cross-tab migration is NOT ready for LIVE.** Require an independently verified strategy for already-running stale LIVE tabs and browser caches. We cannot claim that merely deploying a no-op shim retroactively stops old JS already executing.
- **The current production importer still runs automatically.** Complete a genuine, user-initiated native Settings flow with an actual backed-up checkpoint and explicit consent; do not point the mock practice page at real localStorage.
- **Whole-game v2 backup imports need separate cross-tab handling** because their rollback journal does not serialize other noncooperative writer tabs.
- Preserve separate TEST vs LIVE progress and currencies, existing paid-wheel entitlements (Ocean Glow), announcers, Settings and original game modes.
- Run frozen TEST release manifest, cross-mode regressions, real Samsung/James iPhone Safari physical acceptance, independent JW.org/NWT editorial signoff, restorable LIVE rollback checkpoint; only after that request explicit owner approval for that particular LIVE promotion.

**Status:** native TEST UI rehearsal integration verified locally AND on the published TEST site. LIVE unchanged. Physical owner/James testing is not requested yet. Real-data migration remains blocked.

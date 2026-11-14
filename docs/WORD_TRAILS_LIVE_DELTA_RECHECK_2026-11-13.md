# Word Trails NEXT — LIVE dependency recheck, READ-ONLY
**Project day: November 13, 2026 (GitHub November 14 UTC).** Verified at exact repository heads; this is NOT a LIVE release approval or executable compatibility test.

## Snapshot and core safety
- TEST `basilejoseph325-jpg/Bible-Unfolded-Visual-Lab` main: `42499b9c636cf2a1e168d6e027b7aa059cb78794`.
- Original LIVE `basilejoseph325-jpg/Story-Trails` main: `74a96491770ab6aa7229889ce1aa4733e06666d8`. **LIVE NOT MODIFIED.**
- Both Git repository trees were complete, not truncated. All five `bible_unfolded_core_part1.js`–`part5.js` were **byte-identical** and should remain protected; don't overwrite the native core.
- TEST and LIVE `index.html` differ (TEST `6b881725a763` / 11730165 bytes; LIVE `ce4e1d8e91f6` / 11726679 bytes). **Never copy TEST index.html wholesale.**
- Required homepage-card SVG `assets/ui/word-trails-home-next-crossword-v1.svg` is now present and byte-identical in BOTH repositories (`187ffb5cc483`). November 9 claim of absence is outdated.

## Material inventory correction
The older November 9 delta document recorded 20 of 21 Word Trails dependency files as missing from LIVE. That is no longer true. **At these heads: 8 already identical, 10 present but different, 3 absent.** The table is a byte-hash inventory; it does not prove the current LIVE Word Trails mode is complete or playable.

| Tracked dependency | LIVE relative to TEST | TEST Git SHA / size | LIVE Git SHA / size |
|---|---|---|---|
| `bu-platform-rewards-v1.js` | SAME | `3e04c85aa7bd` · 3869 B | `3e04c85aa7bd` · 3869 B |
| `bu-platform-saves-v2.js` | DIFFERENT | `f0fc5e8bf955` · 41400 B | `ae775f68524d` · 14940 B |
| `experiments/word-trails-announcer-v1.js` | SAME | `80690d05dd44` · 7961 B | `80690d05dd44` · 7961 B |
| `experiments/word-trails-feel-v2.css` | SAME | `62ce0158988a` · 11556 B | `62ce0158988a` · 11556 B |
| `experiments/word-trails-feel-v2.js` | DIFFERENT | `3f6cb21b5799` · 21841 B | `e3290b088d4c` · 20607 B |
| `experiments/word-trails-levels-12-30-v1.js` | DIFFERENT | `105670de74dd` · 35529 B | `8b077c0435be` · 25288 B |
| `experiments/word-trails-main-settings-v1.css` | SAME | `653d37995cf8` · 5270 B | `653d37995cf8` · 5270 B |
| `experiments/word-trails-main-settings-v1.js` | DIFFERENT | `f0d309cf2654` · 7558 B | `8d6278c03d6c` · 8332 B |
| `experiments/word-trails-native-wheel-v1.css` | SAME | `b7173618f2c3` · 6124 B | `b7173618f2c3` · 6124 B |
| `experiments/word-trails-native-wheel-v1.js` | SAME | `80f781b4f510` · 8574 B | `80f781b4f510` · 8574 B |
| `experiments/word-trails-next-v1.css` | SAME | `81a2b4edc769` · 29283 B | `81a2b4edc769` · 29283 B |
| `experiments/word-trails-next-v1.html` | DIFFERENT | `c59551623ce7` · 7448 B | `3ad4ba766ccf` · 7218 B |
| `experiments/word-trails-next-v1.js` | DIFFERENT | `8d82cc113b10` · 43681 B | `e41070a0666d` · 43704 B |
| `experiments/word-trails-original-voice-clips-v1.js` | ABSENT | `dc66e4fa5702` · 642542 B | — |
| `experiments/word-trails-shared-core-boundary-v1.js` | ABSENT | `f20933560e16` · 2624 B | — |
| `experiments/word-trails-unified-menu-v1.css` | SAME | `fea32b5f47d1` · 8228 B | `fea32b5f47d1` · 8228 B |
| `experiments/word-trails-unified-menu-v1.js` | DIFFERENT | `b08cc6874b03` · 10080 B | `8fac92200b50` · 10094 B |
| `journey-progress-caption.js` | DIFFERENT | `31fcbf8ff570` · 19720 B | `3438d26f587a` · 18833 B |
| `visual-lab-test-banner.js` | ABSENT | `55965c6b138e` · 12280 B | — |
| `word-trails-native-shell-v1.js` | DIFFERENT | `7a04311e67ff` · 5730 B | `a08a5511ef80` · 5714 B |
| `word-trails-next-launcher.js` | DIFFERENT | `26188208516f` · 6231 B | `959dd1c9195d` · 6175 B |

## Release consequences — no automatic transfers
1. **10 DIFFERENT files require line-level selective comparisons and ownership decisions, not blind TEST overwrites.** Especially `bu-platform-saves-v2.js`: TEST 41400 bytes vs LIVE 14940 bytes; TEST's user-facing import remains suspended, and the files are not interchangeable by assumption. Also audit source bank, native launcher, shell, menu, audio, settings, and the shared progress caption.
2. Of the 3 ABSENT files: `experiments/word-trails-original-voice-clips-v1.js` may require properly approved assets and phone testing; `experiments/word-trails-shared-core-boundary-v1.js` is TEST-specific and needs a LIVE-safe design decision; `visual-lab-test-banner.js` is a TEST-only identity ribbon and **must NOT be copied into LIVE**.
3. The separate paths share the same GitHub Pages origin, so cross-path browser localStorage can share player records. Never convert TEST coins into LIVE Insight Tokens, overwrite native wallets/purchased wheels/voice preferences, or run an unverified migration.
4. Before authorized promotion: independent human NWT/JW.org content signoff (77 entries), owner Samsung Android and James iPhone Safari testing, all current regressions, restorable LIVE rollback, carefully reviewed file-by-file selective merge, and **explicit owner approval for the specific LIVE release**.
5. Recheck these hashes against the *then-current* frozen candidate and LIVE head. This is not proof of rollback or human approval.

**Evidence:** TEST [17-job regression #43549796243](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43549796243) successful; [published MARAH/EAGLE/HEM source check #43549865247](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43549865247) successful. The [November 9 historical manifest](WORD_TRAILS_LIVE_FILE_DELTA_MANIFEST_2026-11-09.md) remains preserved as history, but its file-state counts are superseded here.

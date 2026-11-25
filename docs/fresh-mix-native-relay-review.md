# Native Fresh Mix Clue Relay — TEST review

Issue #60, base `dd712a60a1562ea268781501605c1b2e1a92ad48`.
Recovery: `checkpoint/test-before-native-relay-20261124` at that exact base.

Native phase, not an iframe: existing Family player/time/topic/style choices, `bu35Game` save, score strip, phase navigation, finish and audio owner remain. The dedicated standalone card stays after Word Builder; no new card/setup. Classic Guided and previously saved phase lists are unchanged. Three clues score 3/2/1 local Family points. Family-judged spoken answers require a second confirmation. Result state prevents duplicate points and is saved before advancing. No new token reward, wallet, audio source or save key.

The original vetted 18-question/54-clue bank and accepted aliases are reused unchanged. Direct topics/collections are matched by explicit question identity; narrow or unsupported topics use visibly labeled wider-Bible questions, with nearby difficulty labeled. At most 18 distinct questions per phase (six people × three rounds); finite-bank exhaustion has a continuation path. The existing Family variety store records recent questions to reduce consecutive-session repeats. No owner profile or backup was imported/reset.

QA commands:
- `BU_RELAY_INTEGRATION=1 node scripts/qa_family_clue_relay_v1.cjs`
- `node scripts/qa_fresh_mix_native_relay_v1.cjs` with Playwright 1.62.1 and local server 8930.

Physical Samsung Chrome/iPhone Safari, software-keyboard behavior and owner playthrough remain manual acceptance. Automated mobile viewport tests do not establish physical-device acceptance. This branch is review-only: no merge, Pages release or LIVE changes.

# Word Trails — Mock checkpoint download and recovery screen

**November 13, 2026 — TEST / Visual Lab only. Actual player saves and LIVE code remain untouched.**

## What is now available to preview

[Standalone published TEST practice screen](https://basilejoseph325-jpg.github.io/Bible-Unfolded-Visual-Lab/experiments/word-trails-checkpoint-rehearsal-v2.html)

The standalone `experiments/word-trails-checkpoint-rehearsal-v2.html` and `word-trails-checkpoint-rehearsal-v2.js` demonstrate the actual proposed player-facing four-step flow:
1. **Preview** a fictional player's completed levels and progress; explicitly distinguish temporary TEST coins from real Insight Tokens and the paid-wheel/voice/main Settings records.
2. **Download** a genuine JSON **sample** `Word_Trails_SAMPLE_Recovery_Checkpoint_v3.json` (generated in-browser from the already-reviewed v3 checkpoint validator). Checkbox says **"I saved the checkpoint"**, and the UI deliberately does **not** falsely claim that offering a browser download proves the file was saved.
3. **Choose** whether to transfer. Both sample checkpoint export and affirmative backup confirmation and transfer acknowledgment are required before applying the v3 protected transition. A player may decline without any write.
4. **Practice recovery** by selecting the JSON file in a file picker. Strict v3 format validation rejects a complete-game backup, malformed or wrong-profile checkpoint, oversized file or changed save. An explicit separate recovery checkbox is required. The v3 Web Lock refuses simultaneous attempts, and rollback deletes **only the exact imported crossword sample**. If another sample tab/player has completed more puzzles afterward, the rollback stops and does **not** erase that new progress.

Additional sample situations: an already-existing LIVE crossword save, damaged TEST progress, and TEST progress changing after preview. Each must refuse a transfer.

## Critical isolation design

- These files are *not loaded by* `index.html`, native shell/bootstrap, Word Trails game frame, or the previous mock menu.
- The new UI controller uses a **Map-backed fake storage adapter only**. It never reads or writes browser `localStorage`. The browser's native `navigator.locks` is only used to coordinate *fictional* save operations in the practice tab.
- The three unlinked TEST-only validation modules v1/v2/v3 are loaded **only into the rehearsal page**, with injected fake storage; the v3 module does not directly access a user wallet.
- The downloadable file contains **fictional crossword progress** and no real wallet or purchases. A future genuine checkpoint would contain private user progress and would need privacy/retention and secure file-handling decisions.
- The real Bible Unfolded Save v2 complete-backup format is different from this crossword-only checkpoint. The UI rejects v2 whole-game backups; it cannot migrate or overwrite the real native wallet. **Never convert TEST coins to Insight Tokens.**
- The original protected Story-Trails repo and LIVE auto-migration script have not been modified. Existing LIVE auto-migration remains a major release blocker because it does not seek user consent or participate in cooperative Web Locks.

## Verified tests (real browser in isolated CI profile)

| Check | Result |
| --- | --- |
| [Local TEST Word Trails checkpoint UI #43528971050](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43528971050) | **SUCCESS** at 390×705 and 320×568 |
| [Published TEST UI #43529104897](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43529104897) | **SUCCESS** at both simulated phone sizes, using the actual GitHub Pages URL |
| Actual sample JSON browser download to file | **Passed**, Chrome created the expected JSON file; content revalidated |
| Select file again for practice rollback | **Passed** |
| Refuse full native backup JSON | **Passed** |
| Separate permission to import and to rollback | **Passed** |
| Stop rollback after any newer completed crossword | **Passed** |
| Sample import and rollback without newer progress | **Passed** |
| Refuse existing LIVE state, corrupted TEST state, stale source | **Passed** |
| Actual browser `localStorage` preservation | **Passed**, full native wallet, purchased wheels, voice, TEST and LIVE save sentinels remained byte-for-byte unchanged |
| Browser page errors and horizontal scrolling | **None detected** at both test sizes |

These are automated Chromium viewport simulations, **not physical Samsung Chrome or iPhone Safari tests**. Do not infer subjective sound quality or touch gestures. The page exists only as a TEST design demonstration.

## Remaining release gates

1. **No real-data integration approved.** The final interface must eventually be integrated into the actual native Bible Unfolded save/Settings workflow, with independently tested checkpoints and native complete backup. This mock does not do that.
2. **Retire or replace the existing LIVE automatic Word Trails importer.** It silently copies TEST progress where LIVE progress is absent and isn't lock-aware. An old/uncooperative game tab can still write into shared browser storage. A lock only works between cooperating tabs.
3. **Cross-tab complete-game backup handling** must be reviewed separately. Existing v2 backup rollback journal is not a cross-tab atomic transaction. Safari Web Locks behavior and its alternative safe fail-closed path still need real-device tests.
4. **Human source/edit approval, complete cross-mode regression, actual audio/SFX/announcer and Ocean Glow purchase/equip acceptance, frozen release candidate and rollback checkpoint**, then physical Samsung and James's iPhone Safari QA, and explicit owner permission to touch LIVE.

**Release status remains BLOCKED.** No owner action required yet; player testing is **not** requested.

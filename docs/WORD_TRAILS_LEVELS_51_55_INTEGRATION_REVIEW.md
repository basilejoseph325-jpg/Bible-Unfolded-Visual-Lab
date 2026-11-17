# Levels 51–55: review-only integration handoff

PR #50 remains an isolated content candidate. This document is a plan, not a
loader or authorization to integrate. No current engine, map, wallet, index,
navigation, audio, reward, or Levels 1–50 file is changed.

## Prepared metadata

experiments/word-trails-levels-51-55-metadata-v1.json supplies:

- Array/save positions 50–54 for public Levels 51–55.
- Chapter 11, **Learning and Serving**, for the existing five-level map grouping.
- Level 55 Journey Seal: existing ✧ symbol, **Ready to Serve**,
  “Fifty-five trails explored.” This follows Level 55's humble-service theme.
- Counts: 30 crossword answers, 29 Bible board discoveries, 10 hidden Bible
  discoveries, and 60 ordinary optional bonus words. THERE is normal wordplay,
  not an invented Bible discovery.

The seal uses the existing symbol/name/detail shape. It adds no image,
currency amount, hint cost, reward formula, or new achievement mechanism.
Names remain candidates for ChatGPT/owner approval.

## Later approved integration sequence

1. Take a recovery checkpoint of the then-current TEST branch. Reconcile with
   PR #49's approved wallet changes; do not copy the old isolated fixture's
   economy implementation into that work.
2. Register this content file after the current 46–50 file and append its five
   entries to the existing level collection. Keep the first 50 data objects,
   IDs, source content and save positions intact.
3. Add chapter 11 and the Level 55 seal to the existing metadata tables using
   this sidecar. The present engine only defines those tables through 50.
4. Preserve locks: a fresh player must start at Level 1; a player still working
   on Level 50 must resume there; an existing completed Level 50 must unlock 51.
   Verify the late-registration/unlock path for save index 49 explicitly. The
   current engine's legacy late-unlock checks stop at 45; this content PR does
   not change them.
5. Verify all approved save/backup/progression bounds accept indices 50–54
   without truncating older ledgers. Keep current purchases, hints, settings,
   completed levels and discovery receipts. Changes to shared files belong in
   that integration review, not this content PR.
6. Use existing reward-once and hint rules. Check the Level 55 milestone once,
   replay it without awarding twice, and verify the next-seal/map wording at
   the new end of the bank. The unchanged completion screen currently says
   “All ten Journey Seals collected!”; update that legacy total/end-of-bank
   message as part of integration. Do not invent another cost or reward.
7. Run the committed source/content and private-fixture browser tests, then
   integration tests for 50→51 and 51→55, locked/fresh profiles, the real shared
   wallet owner, save/export/import compatibility, music/announcers and existing
   modes. Obtain actual Samsung Android/iPhone Safari acceptance before release.

## What the isolated tests prove

The local response-only fixture feeds the new bank through the existing generic
content hook. The engine file stays byte-identical. Real input completes all
five puzzles, both hidden finds and all bonuses; hints, restart, reload/resume,
word receipts, completion and 51→55 progression run in disposable profiles.

The seal layout preview only fills the existing completion DOM from the JSON
metadata after a real Level 55 completion. It is labeled as a metadata preview
in the test evidence. It does **not** prove that the unmodified engine registers
or awards that seal, repairs chapter 11, or unlocks 51 after an old Level 50 save.

## Release gates still open

- ChatGPT/owner approval of content, seal name and chapter title.
- Separate registration/map/unlock/save-bound integration and wallet regression.
- Physical Samsung Android/iPhone Safari, real touch/keyboard/audio acceptance.

No merge, TEST integration or deployment is performed by PR #50.

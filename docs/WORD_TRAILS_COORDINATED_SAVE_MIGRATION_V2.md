# Word Trails NEXT — coordinated saves, TEST backup v2 and LIVE migration boundary
**November 9, 2026 · Visual Lab only · LIVE repository unchanged**

## Ownership: one real game, different gameplay state
- Original Bible Unfolded's native save and Settings controls remain authoritative for existing bible-unfolded-* and story-trails-* keys. Its native v1 backup did not contain the new bu-visual-lab-wordtrails-next-v1 key; that would silently omit the new Word Trails crossword progress.
- TEST extends the SAME native Settings Export Progress and Import Backup controls with bu-platform-saves-v2.js (loaded by visual-lab-test-banner.js on root only). Normal v1 files delegate to the unchanged original native v1 importer, including its warning and reload behavior.
- BibleUnfoldedSave version **2** contains keys (the same native key whitelist as v1), plus extensions.wordTrailsNext: {format:WordTrailsNextTEST, version:1, state:<raw JSON string or null>, feel:<raw JSON string or null>, coinsNeverConvertToInsightTokens:true}.
- Word Trails crossword progress and **quarantined TEST-only coins** remain mode-owned; they are included for portable backup, but NEVER added to Insight Tokens. Shared voices, wheel ownership and selected styles remain the main game's records.

## Versioning, validation and failure safety
1. makeBackup() and dryRun() validate the native key whitelist and Word Trails fields, with size/range/type checks. Older Word Trails partial saves without later optional discovery arrays remain readable; the current game upgrades them during normal load.
2. Import previews current/incoming native wallet amounts and TEST puzzle progress, then requires explicit confirmation. Native v1 backups remain supported.
3. Imported native keys replace matching keys; unmentioned keys are **not deleted**. Permanent wheel ownership is unioned across incoming wallet records and existing independent ownership backups, so existing paid wheels are not lost.
4. Before importing, an exact rollback journal is written under bu-visual-lab-import-rollback-v2. If there is insufficient storage space, import stops before changing progress.
5. Every write is verified; failures roll back. Interrupted imports are restored at next load, and a commit marker distinguishes completed writes.
6. Reimporting identical data is idempotent. TEST coins are never mapped into the native wallet. Native daily attendance can legitimately award new tokens/points after a reload when a backed-up lastDay is older; this is not a TEST-coin transfer.
7. The v2 coordinator is TEST-only. **LIVE's existing v1 importer is not modified and does not currently accept v2 files.**

## LIVE cross-origin migration plan — not yet authorized
**Verified origin:** Both deployed projects use https://basilejoseph325-jpg.github.io/ (Visual Lab at /Bible-Unfolded-Visual-Lab/ and LIVE at /Story-Trails/). They are separate **repository paths on the SAME browser origin**; localStorage is shared across these paths on the same browser/profile. Paths do NOT isolate wallet/voice/wheel saves. A user opening both on one phone may see the same native records. This is why TEST currency uses a deliberately different key and must never be converted to live rewards. If the project later moves to a different origin or domain, export/import is needed across that boundary.

Before a LIVE release, inspect LIVE's current native backup parser, wallet and ownership schema and pre-existing Word Trails progress. On this same browser origin, preserve the already shared native wallet exactly and migrate ONLY the new Word Trails puzzle state after validated consent; on a new origin/browser, use portable backups. An imported complete TEST v2 backup intentionally replaces matching shared native keys on that browser and may therefore affect LIVE local saves; its import UI explicitly warns about this. Create a verified, restorable LIVE checkpoint. Prepare a LIVE-compatible reader for the v2 Word Trails extension that maps only validated crossword and replay-protection state; retain LIVE purchases, native settings and existing saved levels. **Do not convert the starting 60 TEST coins, bonus words or any other TEST rewards into real Insight Tokens.** On synthetic fixtures prove rollback, collision safety, no duplicate grants, and a repeat migration with no extra awards. Require explicit owner approval and physical Samsung/iPhone QA. Independent content review for 77 new-level Scripture entries remains a separate gate.

## Automated evidence — Visual Lab only
- QA coordinated save v2: actual native Settings export and import, legacy v1 compatibility, older Word Trails save schema, invalid-file rejection, real wallet preservation, wheel ownership union, TEST currency quarantine, idempotence, crash/failed-write rollback, cross-reload resume of partial crossword. Passing run 42705942269 (later reruns may supersede).
- QA native shared host: the real menu, native Settings and audio, original announcers, portrait/landscape no-scroll, original Back arrow, browser Back, published direct-link handoff, active refresh and exit. Passing run 42706216915.
- Existing 11-level gameplay and 30-level structural/voice/Ocean Glow QA remain separate. Actual physical Safari and Samsung sound/layout are not yet checked.

**Protected checkpoint:** checkpoint/pre-wordtrails-save-coordinator-20261109. Original LIVE repository basilejoseph325-jpg/Story-Trails remains untouched.

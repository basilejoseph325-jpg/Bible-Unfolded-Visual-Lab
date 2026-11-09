# MANDATORY FUTURE LIVE PROMOTION — Word Trails NEXT and all shared integrations
**Owner reaffirmation: November 9, 2026, during this chat.**

## Non-negotiable destination
All approved Word Trails NEXT improvements and shared-core integrations developed in **Bible-Unfolded-Visual-Lab (TEST)** during this chat are intended to be promoted into the existing **Story-Trails (LIVE)** game **after the owner's physical testing, the applicable safety/QA gates, and the owner's explicit authorization for that LIVE promotion**. Do not treat a successful TEST deployment as final delivery. Do not forget the transfer or leave only selected features behind.

## Exact promotion scope — track each item
- New Bible Word Trails NEXT crossword mode, 30 levels, authored Bible discoveries, bonus words, chapter map, and Journey Seals, subject to remaining item-level editorial approval.
- Real Bible Unfolded native menu and navigation host, replacing the standalone imitation menu for published entry and direct links; maintain main homepage and all other native modes.
- Native Settings, shared music/effects and original announcer/voice preferences, while preserving Word Trails' approved per-mode SFX and music behavior.
- Authoritative wallet and purchase-entitlement ownership, purchased/equipped wheel styles including full Ocean Glow trace/mist/glitter and protected previously purchased wheels.
- Shared save/export/import integration with legacy backup compatibility, versioned migration, import preview, rollback, completed puzzles, in-progress board, bonuses, and reward replay protection.
- Android/in-game Back, browser Back, return to homepage, direct link and refresh-resume behavior, one-viewport mobile layout.
- All bug fixes, test corrections, and compatibility improvements made in this chat that materially affect that integrated gameplay. Review the commit range/changed-file diff before promotion so no required dependency is omitted.

## Evidence already produced in TEST (not a LIVE certificate)
- Native menu/settings/voice host, direct links, Back/refresh: QA `42706216915` PASS and later reruns.
- Coordinated version-2 TEST save export/import, legacy format, partial crossword resume, corrupt-file rejection, rollback, no duplicate imports: QA `42705942269` PASS and later reruns.
- Cross-mode homepage/browser smoke for portrait/landscape: QA `42723194432` PASS after recognizing the original Word Builder's nonstandard screen.
- Word Trails game levels, rewards, and wheel checks are tracked by `qa-word-trails-next-v1.yml`, `qa-word-trails-30-voice.yml`, `qa-word-trails-native-wheel-v1.yml`, and `qa-word-trails-puzzle-quality.yml`. Re-run from the final frozen candidate rather than relying on earlier historical runs.
- TEST checkpoint branches: `checkpoint/word-trails-rewards-before-native-menu-20261109` and `checkpoint/pre-wordtrails-save-coordinator-20261109`.

## Still required before final LIVE promotion
1. Verify current TEST published deployment, browser load paths and complete automated release-candidate checks. Audit the **current LIVE** architecture and code diff first; do not copy TEST `index.html` or overwrite the LIVE's approved modes.
2. Create a **restorable, verified LIVE backup/checkpoint** and a frozen TEST release candidate. Define the safe, selective LIVE integration and protect all existing user progress and owner-approved design/audio.
3. Important storage fact: LIVE and Visual Lab both run under `https://basilejoseph325-jpg.github.io/` in different paths; **browser localStorage is shared on the same device**. Do not blindly replace LIVE wallet/ownership/voice keys with test data or convert any Word Trails TEST coins into real Insight Tokens. Carefully migrate ONLY appropriate validated gameplay records, with idempotent replay protection and an explicit user-controlled procedure.
4. Complete the independent scripture/content review for the new levels (77 newer-level entries still awaiting full human editorial signoff) and verify no content changes violate the permanent Headquarters rulebook or James's addendum.
5. Obtain owner's Samsung Android hands-on feedback and James's physical iPhone Safari feedback (sounds, voices, menu, wheel gestures/effects, no scroll, saved level, rewards).
6. Only after explicit owner approval for the specific LIVE release, promote all approved changes together with applicable adapters, validate LIVE deployment and rendered UI, and keep immediate rollback available.

## Instruction to future chats
When the owner says "next", "continue", or "move to live", read this manifest and `BIBLE_UNFOLDED_RULEBOOK_START_HERE.md`, inspect current TEST/LIVE commits, continue the pending release gates, and do not ask the owner to repeat what needs promoting. A prior conversation going read-only does not cancel this requirement.

**LIVE promotion status: PENDING owner physical QA, final compatibility/release checks, and explicit LIVE authorization.** 

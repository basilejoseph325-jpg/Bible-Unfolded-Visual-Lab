# WORD TRAILS NEXT — MANDATORY PRE-LIVE SHARED CORE RELEASE GATE
**Owner decision: November 9, 2026.** This is a binding release requirement for Bible Unfolded Visual Lab. **DO NOT ship Word Trails NEXT to the live/original game before this gate is satisfied and the owner explicitly approves the live promotion.** Keep original/live code protected.

## Why this exists
The Wordscapes-style Word Trails NEXT prototype was initially built as a standalone test page. Its separate implementation of shared platform systems caused discrepancies: the homepage navigation audio, normal menu, reward ownership/selection, and Ocean Glow visual effects were not fully consistent with the original Bible Unfolded systems. The owner specifically stated that **shared-system integration must be completed before transfer to LIVE** and asked that this requirement be remembered.

## Architectural rule
**Word Trails must be a distinct gameplay module, NOT a self-contained duplicate Bible Unfolded platform.**
- Word Trails may own its crossword engine, puzzle library, clue/discovery logic, word validation, progression and board-specific presentation.
- It MUST reuse or call the authoritative Bible Unfolded **shared core** (directly or through thin, documented adapters) for the normal menu/navigation, settings and persistence, audio/SFX and music preferences, rewards wallet/Insight Tokens, purchased entitlements and equipped wheel cosmetics, and coordinated saves.
- Shared wheel styles must render the **actual purchased experience** including glow, curved ribbon, finger glitter, mist, and selected letter effects—not a substitute flat color. All existing purchases must be recognized; nobody pays twice.
- Preserve mode-specific settings and behavior where appropriate; a shared core does **not** mean identical gameplay or forced global audio cues.
- Avoid two sources of truth for coins, wheel ownership, equip state or settings. Test-only temporary currency must be migrated/reconciled deliberately, without inflating or deleting existing live balances.
- Keep the working mobile no-scroll gameplay layout, approved tile/wheel dimensions, sound design, and Android/iPhone parity. Do not tear apart working gameplay merely for cosmetic code reorganization.

## Required checklist — all must pass before any live copy/promotion
- [ ] Audit Word Trails NEXT standalone/localStorage/menu/audio/rewards/theme/save modules against the live game's authoritative core.
- [ ] Document each reused shared API/adapter, dependencies, key names and ownership. No hidden duplicate reward logic or parallel menus/settings.
- [ ] Connect Word Trails to the real shared menu, navigation, settings, audio/music/SFX engine, rewards and ownership/equip system. Verify **Ocean Glow visual FX parity** and any other owned theme.
- [ ] Define the migration plan for existing live Word Trails progress, acquired rewards/Insight Tokens, unlocked wheels, and test progress. Confirm no lost or duplicated purchases, currency or saves.
- [ ] Complete regression testing across Word Trails levels, bonus word/reward logic, Bible discoveries, wheel gesture interactions, restart/refresh/back navigation, and all other Bible Unfolded modes.
- [ ] Test on the owner's Samsung Android and James's iPhone Safari, including sounds, gestures, performance, locked/unlocked themes, and one-viewport no-scroll fit.
- [ ] Create a verified, restorable pre-deployment LIVE rollback checkpoint and a frozen release-candidate commit/tag with QA report.
- [ ] Owner explicitly approves release to LIVE; perform one controlled promotion with verification and rollback available.

## Important interpretation
Working in **Visual Lab** until this checklist passes is the preferred workflow. The future move to LIVE is **not assumed to be a one-click copy**, because the prototype currently contains standalone adapters and a temporary test save. Building another 50–100 puzzles first is lower priority than establishing the shared architecture, but gameplay development can continue safely in TEST.

## Existing related files
- `BIBLE_UNFOLDED_RULEBOOK_START_HERE.md` — permanent project startup/deployment rules
- `docs/WORD_TRAILS_FEEL_LAB_V2.md` — prototype history and testing
- `experiments/word-trails-next-v1.*` — standalone prototype
- `experiments/word-trails-unified-menu-v1.*` — current menu/rewards adapter (verify against shared core; do **not** assume already fully integrated)
- `experiments/word-trails-native-wheel-v1.*` — ported native wheel visual effects (verify ongoing parity)

**Release status as of November 9, 2026: BLOCKED pending shared-core integration, save migration plan, device QA, and owner approval.**

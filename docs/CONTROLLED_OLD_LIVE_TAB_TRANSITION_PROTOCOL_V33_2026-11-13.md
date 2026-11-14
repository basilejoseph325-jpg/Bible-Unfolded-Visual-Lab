# Bible Unfolded — controlled old-LIVE-tab transition and recovery protocol (TEST v33)

**Scope:** TEST Visual Lab planning and read-only safety features only. Protected original `basilejoseph325-jpg/Story-Trails` LIVE must not be modified or promoted until explicitly approved.

## Observed risk, grounded in the exact protected LIVE code

`Story-Trails/experiments/word-trails-live-migration-v1.js` at protected LIVE commit `74a96491770ab6aa7229889ce1aa4733e06666d8` reads `bu-visual-lab-wordtrails-next-v1` and **can recreate** missing `bible-unfolded-word-trails-next-v1` data without a consent dialog. It copies eligible TEST crossword level/completion data, deliberately resets currencies to 60 LIVE crossword coins and 0 points, and tags the result `migration.version=1, source='Visual Lab crossword progress'`. The script does not edit native Insight Tokens or paid wheel ownership. It only runs while the LIVE crossword save key is absent; it does not overwrite a present LIVE key.

TEST and LIVE share the GitHub Pages browser-storage origin, including `localStorage`. A cached LIVE page can still run this older code even if the current TEST source has newer checks. No currently shipping TEST-only JavaScript can shut down or reliably identify every older LIVE page. Do **not** claim browser storage event detection or Web Locks solve noncooperating scripts.

## TEST safeguards now implemented (v26–v33)

- v26 prevents complete TEST backup exports/imports from including the protected LIVE Word Trails key; contaminated older TEST backups are rejected.
- v27 exposes a **read-only** validated list of exact native restore changes using the current wallet/paid-wheel entitlement rules.
- v30 stops automatic rollback from ambiguous old previous-only native journals, preserving newer wallets/progress and retaining records for review.
- v31 native Settings offers a clear recovery explanation, a current-progress TEST backup download request and a block on both old/new imports when recovery is unresolved. Download is not proof of a saved file.
- v32 conservatively pauses v1 and v2 imports on a new TEST page when a different same-origin document writes sensitive shared keys. This includes events with the recognized old LIVE migration marker, but those events cannot prove the writer's identity.
- v33 additionally **reads** LIVE/TEST crossword state on cold startup, before any external event: when LIVE is absent and TEST looks usable by the exact old migrator, it warns that an old LIVE page could recreate LIVE; when LIVE carries the historic migration marker, it reports that past migration without asserting an old tab remains open. The v33 expandable Settings review offers only current TEST backup export. It does not set LIVE placeholders, alter currencies, remove recovery journals, or perform migration. It refreshes from 'missing LIVE' to 'historical migration' if another page writes LIVE while TEST is open.

## Non-destructive transition plan — NOT executed automatically

**Stage 1 — Evidence.** In an explicit owner-controlled work session, read and report the current protected LIVE and TEST repository SHAs, exact save-key namespaces, current migration source, published TEST loader version, content changes, and known browser backup limitations. Record a named Git checkpoint before any potential LIVE change. Git commits do not back up a player's browser storage.

**Stage 2 — Old-tab transition.** Provide the owner and iPhone tester specific one-time instructions to close every older LIVE and TEST tab, including older Word Trails deep links. Distinguish closing a browser tab from deleting browser storage. Warn that a cached page, suspended tab or game iframe may still interfere until it has truly closed. Do not use a magic localStorage sentinel or blank LIVE save to silence old code; this would mutate real progress and might itself be lost.

**Stage 3 — Separate real browser backups.** Request a verified, user-downloaded TEST current-progress backup, and a separate protected LIVE crossword/native progress checkpoint using a vetted read-only method. The current TEST exporter intentionally excludes the protected LIVE crossword key, and a repository Git checkpoint does not recover browser balances. Verify files actually exist and can be parsed, without storing private player data in public GitHub issues. A v31/v33 current-progress export may contain partly restored progress after an interrupted import; it is not proof of an earlier good state.

**Stage 4 — Fully guarded TEST recovery.** Integrate v27 trusted planner with the isolated v7 before/after transaction only after explicit owner-approved restore UX, portable backup integrity checks, mandatory preview, no current legacy journal, no recently observed competing writer, and a cooperative Web Lock. Validate the wallet/paid wheel union and stable before snapshots again *inside* the lock. Record precise transaction ID and before/after values. An old tab that ignores the lock remains a residual risk: conflict detection must stop, not silently overwrite or auto-rollback.

**Stage 5 — QA / editorial / physical devices.** Verify all 30 crossword levels, global menus/audio, Daily Discovery, Trivia, Family Worship and original modes at released TEST version; real Samsung Android and James's iPhone Safari are required before LIVE, plus independent NWT 2013/JW.org wording and content review. Chromium phone-sized browser tests are helpful but not substitutes.

**Stage 6 — Owner signoff and selective promotion.** Preserve original LIVE via a named reversible commit/checkpoint, obtain explicit owner approval, migrate only validated files and verified content, deploy LIVE deliberately, and verify the actual published LIVE page, audio, browser storage and rollback steps. Never copy raw experimental TEST saves or coins into the native wallet.

## Hard stop conditions

- Old/cached LIVE pages cannot be confidently closed or the owner has not confirmed the transition.
- TEST and LIVE are running on the same origin but no independently verified backup exists for real LIVE crossword progress.
- A previous-only TEST v2 journal or generic commit marker is unresolved.
- A newer wallet, wheel entitlement or LIVE migration write conflicts with the expected snapshot.
- Browser test or real mobile device checks fail; JW.org/NWT editorial review incomplete.
- No explicit owner approval for LIVE promotion.

**Status:** v33 read-only historical risk review exists on TEST. It is **not** an automatic old-tab shutdown, a player migration, a v7 writer deployment, or permission to change LIVE. Owner and James are OFF DUTY until a specific acceptance step is ready.
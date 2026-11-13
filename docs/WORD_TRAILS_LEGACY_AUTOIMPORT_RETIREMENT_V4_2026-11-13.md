# Word Trails — Legacy LIVE automatic-import retirement plan v4

**November 13, 2026 · TEST source/QA ONLY. Original Story-Trails LIVE repository UNCHANGED. This is NOT a release authorization or player-facing migration feature.**

## Root cause confirmed from the actual pinned LIVE implementation

The protected current LIVE checkout `basilejoseph325-jpg/Story-Trails` is pinned at `74a96491770ab6aa7229889ce1aa4733e06666d8`.

- Actual LIVE `experiments/word-trails-next-v1.html`, Git blob `3ad4ba766ccf986a575ea24a2eb6b1dd758cb104`, loads:
  `<script src="word-trails-live-migration-v1.js?v=live-progress-only-20261109" defer></script>`.
- That LIVE `experiments/word-trails-live-migration-v1.js` file, Git blob `52d0a564a16a964daf70e156e46e7d7866480c81`, **automatically creates the LIVE crossword save if it is missing and a valid TEST crossword save is available**, without asking the player first. The two projects have different URL paths but the same `github.io` browser-storage origin.
- The old script correctly **does not award TEST coins/points to the real wallet**, but the silent crossword-progress transfer is still a release-safety problem. It also does not use a cooperative exclusive browser Web Lock. The already-published LIVE source has **not** been edited here.
- The TEST-only rehearsal UI is already safe and uses fictional memory-backed progress, but it is not wired to the real game. Do not confuse successful demo QA with a production user-consent integration.

## TEST-only v4 engineering candidate: a two-part retirement

1. **Replace the old automatic-import script at its existing address with an inert compatibility shim** in the *future authorized release*. The proposed content is currently **only** `experiments/word-trails-legacy-autoimport-retirement-shim-v4.js` in TEST. It does zero storage reads and writes at load. This protects an older HTML page that still references the old script URL *if that older HTML fetches the newly published shim rather than a cached old script*. The shim must eventually replace the LIVE file contents at `experiments/word-trails-live-migration-v1.js`; merely changing fresh HTML is NOT enough.

2. **Replace the single old script tag in the LIVE crossword HTML with ordered, deferred opt-in modules**, in one frozen future release, without touching other crossword markup or answer data:
   - `word-trails-live-consent-migration-candidate-v1.js` — validated progress and source/target recheck;
   - `word-trails-exclusive-consent-boundary-v2.js` — exclusive cooperative browser Web Lock, no unsafe lock fallback;
   - `word-trails-recovery-checkpoint-candidate-v3.js` — crossword-only checkpoint/export, explicit backup acknowledgement, exact-import-only optional rollback;
   - `word-trails-live-migration-consent-gate-v4.js` — **inert script-slot entry point**, exposes APIs for *future native player UI* but performs **zero storage reads or writes on load**.

The new v4 gate is at `experiments/word-trails-live-migration-consent-gate-v4.js` in TEST, **not** referenced by `index.html`, native shell, crossword gameplay, or any mock practice page. The other modules remain TEST-only and unlinked from real gameplay. They must never be activated merely because this source-level gate passed.

## Source-based synthetic audit: PASS

[GitHub Actions workflow run #43530196733](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43530196733) **SUCCESS**, after correcting one initial QA script quotation syntax error in run #43529937113.

`scripts/qa_word_trails_live_auto_import_retirement_v4.cjs` downloads the exact LIVE migration script and LIVE HTML from pinned commit, verifies both Git blob hashes, and reproduces the original automatic import in a Node virtual-machine browser fixture with synthetic localStorage. It constructs an *in-memory* future HTML script-slot modification and proves that replacing the four inserted tags with the old one yields byte-for-byte identical original LIVE HTML. **No LIVE file is written.**

Actual asserted results:

- Existing old LIVE import **does create** a LIVE crossword save silently from TEST when no LIVE crossword state exists (problem reproduced).
- Proposed old-filename compatibility shim performs **0 storage reads and 0 writes** on evaluation.
- Proposed ordered v1/v2/v3/v4 scripts perform **0 storage reads and 0 writes** on evaluation; creation of a gate and preview/export are read-only.
- No import without **both** affirmative user consent and separately confirmed private backup.
- Explicitly consented import writes only the LIVE crossword progress key, and only after acquiring cooperative Web Lock; it does not transfer TEST coins into native Insight Tokens, never writes native wallet, wheel ownership or voice preferences, preserves TEST source and rejects duplicate imports.
- Previously existing LIVE crossword save blocks transfer. A browser with no Web Locks refuses rather than applying an unsafe fallback.
- Optional rollback requires separate approval; refuses to delete newer puzzle progress, deletes only an unchanged imported crossword save after valid checkpoint; never touches rewards, voices or purchases.

**QA distinction:** This proves source behavior in isolated synthetic Node browser fixtures and an exact one-slot HTML proposal, not actual deployed LIVE, physical device behavior, full production Settings UX or complete-game save migration compatibility.

## Gates before even considering an approved LIVE release

- Implement and test a native, accessible **real player consent UI** (a separate screen or native Settings route), including visibly distinguished TEST-versus-LIVE progress, a legitimate private checkpoint-download step and explicit acknowledgement. The existing standalone sample demo **must not** be made live by simply pointing it at real localStorage.
- Confirm all cooperative game entry points and existing complete v2 backup restore handlers honor concurrency and rollback safety. The old v2 coordinated whole-game backup journal is not inherently safe from an unrelated concurrently writing tab.
- **Stale tabs/cache warning:** Already-open LIVE tabs may have loaded and retained old JS; some browsers can cache old scripts or HTML despite source replacement. A shim under the old filename cannot retroactively stop running old code. Plan and validate a safe transition, cache behavior, reload logic, any service-worker coverage, and preservation of ongoing play in a staged TEST rehearsal.
- Prepare frozen release candidate, original LIVE recovery point, source-diff and cross-mode QA; protect native wallet, paid Ocean Glow wheels, progress and all existing game modes. Final Word Trails Scripture independent signoff remains pending.
- Validate real Samsung Android Chrome and James's iPhone Safari, including that unsupported Web Locks fail closed and that full native sound/voices and purchased wheel equip work correctly.
- **Owner explicitly approves that particular LIVE release**. Only then apply a single, controlled set of LIVE file edits and verify the actual published LIVE site and a functional restorable rollback. Don't copy the entire TEST app or temporary TEST audio clips to LIVE.

**Current result: v4 technical retirement candidate VALIDATED IN TEST. LIVE PROMOTION STILL BLOCKED. Owner and James not on duty yet.**

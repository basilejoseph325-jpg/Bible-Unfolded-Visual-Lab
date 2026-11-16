# Issue #48 — TEST shared Insight Tokens: protected implementation checkpoint

## Status (November 16, 2026)
- **Draft PR only**; intentionally NOT loaded into `index.html` or Word Trails.
- Original Story-Trails LIVE and public Visual Lab main are unchanged.
- Separate Codex levels 51–55 assignment is unaffected.
- This branch adds a TEST-only IndexedDB wallet, recovery mirror, reward policy proposal, parent-owned Word Trails bridge, and automated regression tests.

## TEST wallet
- Database: `bu-visual-lab-insight-tokens-idb-v1` (IndexedDB, not production localStorage).
- Starter: 60 TEST tokens; **never** import 1:1 from old standalone Trail Coins.
- Two records, `main` and `recovery`, committed in the same readwrite transaction.
- Versioned `revision`; each earning/purchase has one durable receipt ID.
- Parallel requests serialize through IndexedDB. Wrong receipt payload, insufficient funds, failed writes, or corruption fail closed.
- If one record is damaged, the valid version can recover; if both are corrupt, the wallet must not reset silently.
- Fail-closed guard prevents loading from LIVE Story-Trails path.

## Proposed Word Trails rewards
| Event | Spendable Insight Tokens |
|---|---:|
| First level completion | +4 |
| First hidden Bible discovery | +1 |
| First bonus satchel completion | +1 |
| Five-level Journey Seal | +3 |
| Paid letter hint after existing free hint | -15 |
| Individual bonus word, combo, board Bible answer | 0 |

With 50 levels, 2 hidden Scripture words per level and full satchels:
- 200 from level completion
- 100 from hidden discoveries
- 50 from satchels
- 30 from 10 Journey Seals
- **380 newly earned tokens**; 440 including the initial 60, equivalent to 29 full-price hints with no other spending. Existing Points remain separate.
- Content support reserved through Level 55, but 50-level budget is the first required review.
- Daily Word Trail **Discovery Stamps** remain a distinct collectible, and its 2 free hints are unchanged.

## Proposed bridge
- Module `experiments/bu-test-insight-word-trails-bridge-v1.js` must be loaded **in the native parent only**, after wallet and economy policy are loaded.
- Accepts calls only from the active `#bu-wt-native-game` iframe.
- Child sends event type, level, and specific word or hint cell, **not** token amount.
- Parent validates event against policy, constructs fixed transaction amount and idempotent receipt, then commits.
- UI must reveal a paid letter only on successful result; unavailable or failed wallet cannot reveal it.
- Child should refresh balance from `snapshot()` on return, tab focus, and cross-tab wallet notices, not from its legacy `save.coins` field.

## Must finish BEFORE integration/merge
1. **Native wallet isolation:** The main game's real earn/spend paths currently use production wallet and backup keys. This entire native runtime needs separate TEST-only storage mapping verified before touching any game script. Merely drawing a shared number is not acceptable.
2. Connect the real native HUD, modes, purchases and paid hints to one common balance, not just Word Trails and an overlay.
3. Build a native-verified parent bridge using actual level-completion/discovery state; do not allow a compromised child to mint unlimited arbitrary event IDs.
4. Preserve existing Trail Coins and completed/reward receipts; do not convert old coins, reset saves or duplicate payout on replay/reload.
5. Ensure paid-hint receipt replay reveals its original tile if a browser navigation interrupted completion.
6. Keep Daily Stamp collection, music, wheel skins, Star button, backups, and native menu unchanged.
7. Run same-origin LIVE/TEST isolation checks (wallet, recovery, wheel ownership, progress, backups), read/write failure injection, simultaneous tab purchases, restart/replay and full mode switches.
8. Real 320px/430px Chromium **and WebKit** gameplay, then Samsung Android and James' iPhone Safari; only then request acceptance to integrate into public TEST.
9. No LIVE promotion until independent editorial and shared-system checks pass.

## How to run foundation checks
The GitHub Actions workflow `.github/workflows/qa-test-insight-wallet-v1.yml` installs `fake-indexeddb` and runs `scripts/qa_test_insight_wallet_v1.cjs`. It tests read/write transactions, double-credit, cross-attempt deduplication, insufficient balances, recovery, corruption, storage failure, path isolation, the parent bridge, and 50-level economy budget.

## Do not confuse with deployment
Passing the isolated ledger tests confirms only this foundation, **not** that the native shared wallet is integrated or playable.

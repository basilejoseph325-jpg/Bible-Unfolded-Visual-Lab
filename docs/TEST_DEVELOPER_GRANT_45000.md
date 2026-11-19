# Explicit TEST-only 45,000-token top-up (draft)

This draft does not grant tokens or deploy itself. Review and separate TEST
publication are required before this link works:
`https://basilejoseph325-jpg.github.io/Bible-Unfolded-Visual-Lab/?bu_test_grant=45000`

The static game has no authenticated owner account. This is an explicit developer
tool for the current browser's regular TEST wallet, not a secure owner-only
entitlement. Anyone deliberately using that link can opt in on their local TEST
wallet. Ordinary visits have no grant UI, grant writes, or automatic credit.
LIVE paths, protected previews, frames and read-only wallets are excluded.

## Use after approval

1. Close other TEST tabs; open the testing link in the browser with your progress.
2. Open **TEST testing grant** and download its complete, validated TEST V2 backup.
3. Save the file, check the confirmation box, and type `TOP UP TEST TO 45000`.
4. Apply the one-time top-up, then return to normal TEST.

The addition is `max(0, 45000 - current tokens)`. A higher balance is never reduced.
Points, progress, purchases, inventory and existing receipts are retained. The
existing native wallet, exclusive writer lock and guarded save/recovery functions
remain authoritative; no alternate spendable balance or legacy-coin conversion.

## Repeat and failure protection

- The wallet receives the fixed `test-dev-topup-45000-v1` earned marker with the
  balance in the same native save. It is not a gameplay achievement or bonus gift.
- A TEST-scoped `__developer_topup_45000_v1__` write-ahead attempt marker must be
  verified BEFORE credit. It contains audit metadata, not a spendable wallet.
- Its reserved `__` name is outside the existing V2 game-record restore set.
  Restoring a pre-grant backup in this browser cannot reopen the grant. Post-grant
  backups include the native wallet receipt and block repeats in another profile.
- A changed wallet, lost writer lock, invalid backup or storage failure blocks the
  operation. An interrupted/uncertain save leaves the one-time attempt locked;
  there is no automatic retry or marker-erasing button. Keep the backup and native
  recovery records for review. Existing restore validation is not changed.
- Clearing all site data or using a new profile with a pre-grant backup can reset
  client-side eligibility. No static client-only mechanism can securely enforce
  global owner identity or cross-device quotas. This is TEST tooling only.

## Verification

`qa_test_developer_grant_scope_v1.cjs` protects every existing file from the approved
TEST merge except the exact new script tag and a Genesis CI branch predicate. That predicate
selects its already-approved cross-mode chapter/audio hash guard for this feature
branch; no gameplay assertion is removed. Unit and real-browser tests cover
consent, target arithmetic, once-only behavior, native hints/purchases, preserved
progress, old/new V2 restoration, storage failures and LIVE/preview exclusion.
Chromium/WebKit automation uses isolated synthetic profiles at 320px and 430px.
Physical Samsung Chrome and iPhone Safari acceptance is separate.

The manual `published_sha` QA input checks the exact successful TEST Pages build,
public asset bytes, and normal published gameplay/navigation in synthetic Chrome
profiles. It never imports owner backups or changes the protected LIVE game.

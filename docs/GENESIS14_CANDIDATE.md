# Genesis Episode 14 — approved-art review candidate

Draft PR: [#34](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/pull/34). Branch: `codex/genesis14-candidate`, from TEST `6274e36`. No existing tracked game, loader, reward, audio, mode, artwork or test file is edited. No merge or deployment to TEST or LIVE.

Serve the repository and open **`genesis-episode14-preview.html`**. It loads the actual native game, waits for Episode 13, and installs only the query-guarded Episode 14 adapter. Ordinary `index.html` remains unchanged with thirteen episodes. In the review entry, Episode 14 unlocks after Episode 13; its real ending action enters 14. The Episode 14 ending has native Replay/Chapters and Return to Genesis because Episode 15 isn't built. Reload returns Home, and resume uses the existing Genesis save key. Contextual hints retain free/15/25 Insight Tokens, reveal −25 Points, discovery rewards 45 Points/10 Tokens and chapter bonus 250 Points/60 Tokens, once only.

## Approved scene sequence

The owner's **artwork-integration request and `CODEX_EPISODE14_HANDOFF.md`** supersede the earlier twelve-scene draft. The supplied archive is `Genesis14_Codex_Art_FRESH_v2.zip`. Every discovery was deliberately revised or retained in context; this isn't an image-only remapping. The report-only, separate robe-deception and Potiphar-puzzle slots are replaced by the required scheme, Judah, and empty-pit scenes. The exact NWT passages and [Insight — Joseph](https://www.jw.org/en/library/books/Insight-on-the-Scriptures/Joseph/) were checked; no invented dialogue or motives are presented as Scripture.

The [content package](../story-adventure-content/genesis-episode14-joseph-v1.json) records all narration, puzzles, 36 hints, explanations, Scripture links, former draft answers, item-level source/readability decisions and revised art descriptions. A separate deliberate editorial pass was performed by the same assistant; independent human editorial acceptance remains pending. All twelve images were approved by the owner, not generated or independently approved by Codex.

All files below are exactly the supplied 640×360 WebPs in `story-adventure-art/genesis14/`. [Supplied checksums](GENESIS14_APPROVED_ART_CHECKSUMS.json) are retained verbatim and locked in content QA. The supplied manifest is also installed byte-for-byte, with every approval true. Artistic clothing patterns, poses, appearances and architecture are reconstruction, not additional biblical facts.

| File / discovery | Answer | Approved pictured event | Primary Genesis 37 reference |
|---|---|---|---|
| g14-d01.webp | ROBE | Jacob presents Joseph the long robe | 3–4 |
| g14-d02.webp | SHEAVES | Joseph tells brothers about the first dream (not visualized sheaves) | 5–8 |
| g14-d03.webp | STARS | Joseph second dream: sun, moon and exactly eleven stars | 9–11 |
| g14-d04.webp | DOTHAN | Joseph reaches brothers at the flocks near Dothan | 12–17 |
| g14-d05.webp | SCHEME | Brothers conspire before Joseph approaches | 18–20 |
| g14-d06.webp | REUBEN | Reuben intervenes on behalf of Joseph | 21–22 |
| g14-d07.webp | WATERPIT | Brothers take garment and lower Joseph into dry waterpit | 23–24 |
| g14-d08.webp | CARAVAN | Brothers eat as caravan approaches | 25 |
| g14-d09.webp | JUDAH | Judah proposes selling Joseph to merchants | 26–27 |
| g14-d10.webp | SILVER | Joseph sold for twenty pieces of silver and departing with caravan | 28 |
| g14-d11.webp | EMPTY | Reuben discovers Joseph missing from empty pit | 29–30 |
| g14-d12.webp | GRIEF | Jacob sees Joseph bloodstained robe and grieves | 31–35 |

The finale hero **and** atmosphere use only `g14-d12.webp`, captioned **Jacob grieves for Joseph**. A chapter-scoped decorator assigns this scene in the existing approved completion template; shared finale code is unchanged. If that art is missing or unapproved, it removes any first-discovery substitute and retains a labeled fallback. Genesis 37:36 is a textual transition to Joseph's arrival in Egypt, with no Potiphar puzzle or Egyptian-courtyard illustration.

## Progress and verification

- [x] All twelve revised discoveries, answers, contextual hints, explanations and art assignments match the approved handoff.
- [x] ZIP CRC, all twelve SHA-256 hashes/byte counts and full WebP decoding at 640×360 verified; supplied manifest/checksum record preserved.
- [x] Revised content/source compilation and approved-sequence/checksum checks passed.
- [x] Final revised-art gameplay passed locally: all twelve wheels with actual Chromium touch taps, wrong answers, all 36 hints, exact once-only rewards, save/recovery, resume/restart, refresh, swipe and ending at 320×568 and 430×932. Both ending image slots and all twelve decoded 640×360 scenes passed. Screenshots of gameplay, explanation and finale were inspected. No physical device acceptance claimed.
- [x] Revised-art full Story (201 discoveries, 20 endings at 320×568 and 430×932), unchanged Episode 12/13 suites, Word Trails audio/wheel ownership and mode/audio/save parity passed in [hosted CI on `5facbd2`](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43778248799).
- [x] No-deployment CI is installed and passed on the art revision `5facbd2`; [current PR checks](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/pull/34/checks) are authoritative for later commits.
- [ ] Independent editorial acceptance of revised gameplay and physical Samsung/iPhone acceptance. Chromium is not physical-device testing.
- [ ] Owner review before TEST integration. No merge or deployment authorized.

The earlier draft passed its own native/preservation/full Story checks; those results do **not** certify this newly revised content/artwork. Existing candidate progress retains the same episode/discovery IDs and native save keys, assistance receipts and reward-once IDs. Nothing resets another episode, wallet, entitlement or preference. Earlier preview checkpoints may resume a reassigned scene; Replay/Restart lets a reviewer play the revised order without farming rewards.

Tests: `qa_genesis14_content_candidate.cjs`, `qa_genesis14_native_preview.cjs`, `qa_genesis14_boundaries.cjs`, `qa_genesis14_story_regression.cjs`. Use `puppeteer-core`, Chromium/Chrome, and `STORY_URL` pointing to local `index.html` (default 8899). No-deployment CI also runs unchanged Episode 12/13 and Word Trails audio/wheel ownership suites. Boundary QA requires every baseline file byte-identical (pinned `6274e36` locally, current TEST parent for the synthetic PR merge in CI) and an exact allowlist of new candidate files, including exactly twelve named WebPs. Synthetic missing/unapproved-art fixtures are labeled separately from the actual approved-image run. No user storage or LIVE site is accessed. Rollback: remove the new Episode 14 files/commits; the public loader was never edited.

Local environment note: the first post-install launch received an empty response from the old local HTTP server before gameplay. Restarting that server resolved it; the complete revised-art run and the expanded all-twelve-touch rerun then passed without application changes for that issue. Earlier new-test fixture corrections modeled the native normalization of legacy hints/work and used the actual audio-control ID; those were test-fixture corrections, not game bugs.

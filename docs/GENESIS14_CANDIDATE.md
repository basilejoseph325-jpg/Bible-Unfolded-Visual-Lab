# Genesis Episode 14 — isolated review candidate

Based on Visual Lab TEST `6274e36` (Episode 13 with approved artwork and Word Trails 1–50). Branch: `codex/genesis14-candidate`. No existing tracked game, loader, audio, artwork, tests, save keys, reward logic or other mode files are changed. No merge or deployment is authorized.

Serve the repository and open **`genesis-episode14-preview.html`**. It loads the actual native game in a full-viewport frame, waits for Episode 13 registration, and installs only the query-guarded Episode 14 adapter. Ordinary `index.html` remains unchanged with 13 episodes. In the review entry, Episode 14 requires Episode 13 completion, including direct entry. Episode 13's ending leads to 14; the new ending has native Replay/Chapters and Return to Genesis because Episode 15 is not built. Reload returns Home; resume uses the existing Genesis key. Contextual hints retain free/15/25 Insight Tokens, reveals −25 Points, discoveries 45 Points/10 Tokens and chapter completion 250 Points/60 Tokens, once only.

## Content and artwork checklist

All twelve content items were authored after reading the full [NWT 2013 Genesis 37](https://www.jw.org/en/library/bible/nwt/books/genesis/37/) and relevant sections of [Insight — Joseph](https://www.jw.org/en/library/books/Insight-on-the-Scriptures/Joseph/). Exact prompts, answers, three hints, explanations, reference ranges, retrieval hashes, item-level accuracy/readability notes and detailed historical briefs are in [the content package](../story-adventure-content/genesis-episode14-joseph-v1.json). A separate deliberate editorial pass was performed by the same assistant; this is **not independent human approval**.

Each picture must be **640×360 WebP**, one distinct scene, at `story-adventure-art/genesis14/g14-dNN.webp`. All manifest approvals are false. No images have been generated or approved. No unrelated scene is substituted.

| Discovery | Answer | Exact illustration still needed | NWT Genesis 37 |
|---|---|---|---|
| 01 A Young Shepherd Speaks Up | REPORT | Seventeen-year-old Joseph tending sheep with Bilhah's and Zilpah's sons; no invented misconduct | 1–2 |
| 02 A Family Pulling Apart | HATRED | Jacob giving Joseph a special long robe near the family tents | 3–4 |
| 03 Bundles in a Dream | SHEAVES | Symbolic grain bundles bowing to one upright bundle; no invented count | 5–8 |
| 04 A Second Picture in the Sky | STARS | Symbolic sun, moon and exactly eleven stars bowing toward Joseph | 9–11 |
| 05 The Search Goes Farther | DOTHAN | Joseph receiving directions from the unnamed man in a field near Shechem | 12–17 |
| 06 A Plan to Bring Him Home | REUBEN | Reuben addressing brothers before distant Joseph arrives | 18–22, 26–27, 29–30 |
| 07 An Empty Pit | WATERPIT | Fully clothed Joseph inside a dry waterpit; no fall, injury or nudity | 23–24 |
| 08 Traders on the Road | CARAVAN | Approaching merchants and loaded camels, before the sale | 25–27 |
| 09 A Brother Sold | SILVER | Restrained purchase scene with unminted silver pieces; no celebratory treatment | 28–30 |
| 10 Evidence That Misleads | ROBE | The same special robe folded for sending home, all blood concealed | 31–33 |
| 11 A Father's Sorrow | GRIEF | Jacob in sackcloth near his tents, family trying to comfort him | 34–35 |
| 12 A New Household in Egypt | POTIPHAR | Joseph arriving with merchants at Potiphar's Egyptian household, no throne or later advancement | 36 |

Ending: reuse **discovery 12** for the hero and atmosphere once reviewed. The isolated candidate currently uses the existing completion template with a clearly labeled pending-art note. Public art integration into the shared finale provider is deferred to the later integration review; no shared file is edited here. Do not fabricate an Episode 15 destination.

## Resume checklist and verification

- [x] Twelve new playable wheel discoveries, 36 contextual hints, educational explanations and exact JW.org references.
- [x] Twelve distinct detailed illustration briefs and false-only manifest.
- [x] Native registration, predecessor lock, saves, hint receipts, completion and navigation implemented in isolated adapter.
- [x] Initial native browser run: all twelve puzzles/replays/hints at 320×568 and 430×932 passed; rendered gameplay/explanation/ending screenshots inspected.
- [ ] Final expanded native check: wrong answers for every puzzle and exact chapter bonus.
- [ ] Full Story regression with candidate loaded; earlier Episode 12/13 suites; mode/audio/save parity.
- [ ] Hosted no-deployment CI.
- [ ] Independent content/art review and physical Samsung/iPhone acceptance. Not claimed by Chromium tests.
- [ ] Owner review before TEST integration. Artwork must be supplied and approved separately.

Tests: `qa_genesis14_content_candidate.cjs`, `qa_genesis14_native_preview.cjs`, `qa_genesis14_boundaries.cjs`, `qa_genesis14_story_regression.cjs`. Set `NODE_PATH` to an installation of `puppeteer-core`, `CHROME_BIN` to Chromium/Chrome, and `STORY_URL` to the local `index.html` (default port 8899). The no-deployment workflow also runs the unchanged Episode 12/13 and Word Trails audio/wheel ownership suites. Browser profiles are synthetic; no user storage or LIVE site is accessed. Rollback: remove only the new Episode 14 files/commits; the public loader was never edited.

# Genesis Episode 13 — public TEST integration candidate

Branch: `codex/genesis13-test-integration`, based on TEST `14bdc2b` (Word Trails
31–40 preserved). Only the validated Episode 13 content/logic from PR #28 is reused;
PR #22/#23 and their older Episode 12 files are not merged.

Normal `index.html` loads Episode 13 after the existing Episode 12 registration.
The thirteenth card and direct entry require Episode 12 completion. The real
Episode 12 ending leads to Episode 13. Existing Genesis save keys, puzzle IDs,
rewards and hint prices are retained. Journey progress counts 13 episodes; earlier
Journey locks remain. The original content JSON is byte-identical to PR #28;
its historical preview metadata is overridden by the public integration module.

## Artwork

`story-adventure-art/genesis13/manifest.json` declares all twelve paths,
`g13-d01.webp` through `g13-d12.webp`. Every approval is currently **false** and
no scene image is supplied. An image displays only when its manifest approval is
true and the file loads. Otherwise the labelled placeholder remains. Both ending
hero and atmosphere use the approved Bethel altar image **g13-d09.webp**; no other
scene is substituted. Approval/file-error routing is tested with an explicitly
labelled in-memory QA fixture, not represented as finished artwork.

## Verification

Run a local HTTP server on 8893 and set `NODE_PATH` to the development installation
of `puppeteer-core` (Chrome/Chromium required):

- `node scripts/qa_genesis13_content_candidate.cjs`
- `node scripts/qa_genesis13_public_integration.cjs` — all 12 wheels, hints,
  saves/recovery, replay, touch and ending at 320×568 and 390×844.
- `node scripts/qa_genesis13_integration_boundaries.cjs` — immutable Word Trails,
  native core/audio/wallet/Episode 12 files; source identity; locks; additional
  320×640/430×932 layouts; pending/approved/missing-image routing.
- `node scripts/qa_genesis12_native.cjs` — all 13 earlier puzzles, images and new
  Next route; `qa_genesis11_complete_native_playpath_v1.cjs` — prior chapter flow.
- `node scripts/qa_story_adventure_release.cjs` — 189 existing/new discoveries and
  19 endings; `qa_story_mode_boundaries.cjs` — existing shared navigation.

Story QA count assertions were adjusted for the added chapter. No Word Trails,
Word Trails tests, audio files, coin systems, or native-core transports are edited.
`index.html` changes only the loader cache token; the existing loader content is
preserved with one ordered Story-only append. Workflow checks are read-only.

Release blockers: twelve approved illustrations/ending art; physical Samsung/
iPhone and independent editorial acceptance; owner review and separate merge/
deployment authorization. Automated Chromium is not physical-device acceptance.
No TEST/LIVE deployment or merge is performed by this work.

Local result: every check above passed, including all 189 discoveries/19 endings
at both main phone sizes and 179 protected-file comparisons. The initial full
run's finished-image assertion was corrected to require an explicit Episode 13
placeholder while preserving earlier chapters' image checks. Delayed-content
checks cover an already visible Episode 12 ending and Journey screen. Hosted
run links and final status are recorded in the integration PR's checks/body.

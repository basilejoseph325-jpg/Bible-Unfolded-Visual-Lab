# Genesis Episode 13 — review candidate

Base: Visual Lab TEST `main` at `1bf5e1b`. Branch: `codex/genesis13-completion`.
Reuses the Episode 13 package and adapter from PR #23, without merging PR #22,
its parent branch, or its shared-loader changes. Completed Episode 12 is preserved.

## Play and test

Serve this checkout locally and open **`genesis-episode13-preview.html`**.
Close the normal daily reward if shown; choose Story Adventure → Genesis and the
separate **Episode 13 development preview** card. This is the actual current native
engine in a full-viewport same-origin frame, with an Episode 13-only adapter.
Refreshing returns to Home; the development card resumes the saved chapter.
`index.html` and its ordinary public chapter/Journey locks remain unchanged.

```sh
npm install --prefix work --no-audit --no-fund puppeteer-core@25.17.0
python3 -m http.server 8893 --bind 127.0.0.1
# In another terminal, with Chromium/Chrome installed:
export NODE_PATH="$PWD/work/node_modules"
node --check story-adventure-content/genesis-episode13-native-preview.js
node scripts/qa_genesis13_content_candidate.cjs
STORY_EVIDENCE=work/genesis13-evidence.json node scripts/qa_genesis13_native_preview.cjs
node scripts/qa_genesis13_boundaries.cjs
node scripts/qa_genesis12_native.cjs
```

All browser tests use synthetic profiles. They do not test a physical phone.

## Implemented scope

- Twelve distinct native word wheels across Genesis 34–35, including narration,
  sourced questions, three contextual clues, explanations and Scripture previews.
- Existing free / 15 / 25-token hint ladder and durable purchase receipts; no
  purchased letter reveals. Existing reveal penalty and reward-once behavior.
- Correct twelve-scene progression, completion action, native shared ending,
  Replay, Chapters, Back to Genesis, restart, refresh-to-Home and saved resume.
- Touch completion guard scoped to this episode: a compatibility click from the
  final wheel letter cannot accidentally press the newly opened Next button.
- Twelve specific 640×360 historical illustration briefs and an ending art plan.
  Every visible scene is honestly labelled pending; no unrelated pictures.
- Per-discovery source/readability notes and official-source SHA receipts are in
  the content JSON, alongside the actual prompts, answers and three clues.

## Sources and sensitivity

NWT 2013, official JW.org: Genesis 34 and 35 in full context; Genesis 49:5–7 for
Jacob's later condemnation; Genesis 28:10–19 for the Bethel cross-reference;
NWT footnotes for El-bethel, Ben-oni and Benjamin. Direct text, vocabulary summaries
and applications are distinguished in the item review notes. The assistant made
separate source and spoken-readability passes; independent human signoff is pending.

Responsibility for Dinah's violation stays with Shechem. The story and briefs do
not blame her, invent consent, depict assault, or celebrate deadly retaliation.
The illustration brief does not place Dinah in Jacob's camp before her return
from Shechem's house. The Isaac passage is framed as the chapter's closing record,
not proof that his death preceded every event narrated later in Genesis.

## Shared-file integration deferred for coordinated review

**No shared loader, global gameplay source, native core, wallet/audio system,
Episode 12 file or Word Trails file is edited.** The review entry attaches the
isolated adapter after loading current TEST. To integrate publicly later, coordinate
one loader entry and a gated Episode 13 catalog/Next route after Episode 12; extend
the existing contextual-hint and art registration hooks. Do not apply the older
PR #22 loader or native files. No such shared-file patch is included here.

## Acceptance checklist

- [x] Twelve source/readability reviews and specific illustration briefs.
- [x] Native candidate available through an isolated, working review entry.
- [x] Local automated QA recorded below; hosted workflow verification follows PR creation.
- [ ] Create and review `g13-d01.webp` through `g13-d12.webp`; integrate them and
  the Bethel ending image. **No new scene images currently exist.**
- [ ] Independent human Scripture, writing and sensitivity acceptance.
- [ ] Physical Samsung Chrome/Samsung Internet and iPhone Safari: tap/swipe,
  sound/music/volume, accessibility, larger text, interruptions and browser-close
  persistence. Chromium screenshots/automation do not supply this acceptance.
- [ ] Coordinate public loader/progression integration in a separate review.
- [ ] Owner release acceptance. This branch neither merges nor deploys TEST or LIVE.

Initial failures retained in the work log: the reused draft had two unescaped
apostrophes; touch testing exposed the final-letter compatibility click described
above; the boundary fixture initially sampled Journey wording before its existing
caption enhancer settled. Syntax was corrected, the episode-only click guard was
verified. The pending-art figure also now invokes the existing native fitter
immediately after insertion; layout assertions wait for native reflow. The boundary
fixture waits for the caption update. Final results follow.

## Verified local results

- PASS — adapter and test syntax; native transports plus 238 inline scripts;
  twelve sourced content records, distinct answers, three non-answer hints each,
  synchronized word/explanation fields and twelve specific art briefs.
- PASS — `qa_genesis13_native_preview.cjs`: all twelve discoveries and all twelve
  replays at **320×568 and 390×844**; all hint ladders at free/15/25; correct and
  incorrect answers; real CDP touch tap retries and swipes; no letter reveals;
  once-only scoring/reveals; failed wallet writes; purchase recovery after a failed
  chapter write; refresh-to-Home/resume; Menu Continue/Restart; all ending actions.
- PASS — `qa_genesis13_boundaries.cjs`: 24 additional scene-layout checks at
  **320×640 and 430×932**; ten protected shared/Episode 12 files byte-identical to
  the inspected base; normal entry unregistered; public twelve-episode catalog,
  locks and Journey unchanged; Episode 12 plays with the adapter present.
- PASS — existing `qa_genesis12_native.cjs`: all thirteen Episode 12 discoveries,
  hint prices, resume/replay and thirteen real images at both tested sizes.
- Rendered gameplay, explanation and ending inspected at 320×568 in Chromium.
  No physical Samsung/iPhone test or completed illustration is claimed.

The final local run has no failing checks. The earlier failures and corrections
are described above rather than being represented as passing attempts.

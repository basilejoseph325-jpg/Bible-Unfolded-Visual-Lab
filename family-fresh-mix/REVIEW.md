# Strengthening Friendships — TEST candidate

300 individually written prompts, 50 for each of six activities. These are invitations, not tests of spirituality or quotations from Scripture. No required disclosure, personal ranking, health/finance/marriage questions, comparisons of faith, appearance comments, or penalty for passing. New acquaintances can offer a welcome instead of inventing knowledge of a partner. Children can answer aloud with help or pass.

“Imagine the New World” explicitly labels personal hopes as imagination, not promised details. The future framework follows Psalm 37:11,29; Isaiah 65:21–23; Revelation 21:3,4 (NWT 2013):
- https://www.jw.org/en/library/bible/nwt/books/psalms/37/
- https://www.jw.org/en/library/bible/nwt/books/isaiah/65/
- https://www.jw.org/en/library/bible/nwt/books/revelation/21/

Questions about Noah, David and Ruth refer to their actual Bible accounts (Genesis 6:19–22; 1 Samuel 17:34,35; Ruth 1–4). No character speech, promised timetable, invented historical detail or extra requirement is presented as Scripture. My Story of Faith asks about readers' appreciation without prescribing an answer. Appreciation follows the encouragement of 1 Thessalonians 5:11; no spiritual answer receives points.

## Integration boundaries

Stacked on the separate native Clue Relay candidate. Only Fresh Mix discussion slots are expanded: one social activity at 10/20/30 minutes, two at 45, three at 60. Existing Bible activity slots, reading, player/time/style/topic controls, Classic Guided, dedicated Relay card and completion reward mechanism remain. Every social phase gives each player a turn; each prediction target has one rotating predictor so session lengths remain practical. Prediction correctness earns one local session point, not currency; personal responses and skipped prompts earn none and never qualify for a gameplay completion reward.

Prompt shuffle bags persist through the existing Family variety store. Prompt IDs used this session cannot recur; an unfinished saved prompt is resumed instead of redrawn. Paired activities cycle their partner offset across sessions. No typed personal answers are collected. Only prediction choice indices are kept in the local Family session save. These are shared-device privacy screens, not encrypted secrets: backups/device storage can contain those indices. Leaving, backgrounding and reopening conceal unfinished choices behind a handoff; a finished reveal is intentionally public.

## Acceptance

Automated browser evidence and exact results are in the draft PR/check runs. Physical Samsung/iPhone acceptance and owner prompt review remain required; no physical testing or deployment is claimed. Optional global artwork/audio changes remain deferred.

## Approved independent content refinement

Replaced 145 active prompts: Beyond the Surface 25, Imagine the New World 15, My Story of Faith 35, Find Something in Common 20, Build One Another Up 15, and predictions 35. New invitations cover happy memories, remembered kindness, learning from friends, interests/talents, gentle goals, values, feeling supported, and optional personal spiritual encouragement. Predictions include planning, listening/conversation, learning and encouragement preferences, with equally valid choices. The remaining 155 lighter entry prompts stay in rotation. Still exactly 50 active prompts per category, 300 total; personal responses remain optional and unscored.

No new scriptural quotations, doctrinal claims or promised Paradise details were added. Spiritual questions invite personal appreciation, not disclosure of hardships or a judgment of faith. Existing no-pressure framing and the imagination caveat remain. Revised IDs end in `-r2`; original wording/choices are archived only for already-saved turns and cannot be drawn in new sessions. This preserves the meaning of any private choice saved before refinement.

## Stacked publication plan — only after separate approval

Review/merge #69 first. Prefer preserving its commits with a merge commit. Fetch approved TEST main, merge that main into #70, retarget #70 to main, and verify the resulting diff contains only the social expansion before rerunning current-base checks. If #69 is squash-merged, preserve #70 with a recovery branch and replay only its social commits onto the new TEST main (or merge that main and verify the tree carefully); do not blindly retarget/rebase the whole stack, which could reintroduce or discard parent changes. Verify native Relay, the single dedicated card, wallet/backup protections and social content in the combined tree. Keep both drafts until review; this plan is not permission to merge or deploy.

## Final technical integration review

Owner authorized controlled TEST publication after content signoff at `12ec007`. Recovery branches preserve TEST `dd712a60` and approved #70 `12ec007`. #69 was merged with its history intact as `44e12da2`; #70 was updated with that main and retargeted to main. The combined engine still uses the original `bu35Game`, setup, player/score arrays, round/phase handlers, pause, completion and once-only themed reward. New phases delegate original phases to the prior renderer; social turns do not increment gameplay completion counters. Existing engine, wallet, backup implementation, audio, settings and non-Family mode source files remain byte-identical to the recovery baseline. Approved active/legacy prompt data and compatibility code remain unchanged.

The release test exercises a synthetic mixed sequence through native reading, unscored personal turns, Relay, private predictions, original Trivia (including its answer-explanation dialog) and the native finish screen. It checks score carryover, complete private-session backup restore, preserved purchases/progress/settings, and the pre-existing 140 Points / 35 Insight Token completion reward exactly once across replay. It supports an explicit TEST Pages URL for isolated published acceptance. No owner profile or actual backup is imported. Physical Samsung/iPhone acceptance remains separate.

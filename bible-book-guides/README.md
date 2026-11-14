# Bible Unfolded — Bible Book Guides (isolated workstream)

**Status:** Draft prototype. Not published on TEST or LIVE. This work is on `feature/bible-books-readable-guides` in the Visual Lab repository. Original protected game remains unchanged.

## Product purpose

Give Bible Books a standalone, approachable reading experience. Stop linking a Bible Books tile to a Story Adventure episode. Every one of the 66 books should eventually summarize *every chapter*, without losing key people, events, promises, relationships, or teachings. The guide must be easy to read like a trusted friend—not an academic abstract or a game.

- **Book shelf:** Reuse the existing beautiful 66-card Bible Books collection.
- **Reader:** Clean, mobile-first story sections, clear chapter ranges, Next/Previous navigation, jump-to-section selector, progress position, and links to the NWT on JW.org.
- **Content:** Original paraphrases only, based on NWT 2013 and JW.org / JW Library. No invented quoted dialogue, no outside content sources, and no non-JW religious illustrations.
- **Book structure:** Narrative books by events; law, wisdom, prophecy, and letters by their natural subjects, preserving chapter coverage.
- **Engagement:** Readable, friendly tone, sensible section lengths, and resume reading without coins, lives, puzzles, or forced mechanics.
- **Saved state:** Reader position in a distinct localStorage key; no modifications to existing Story Adventure progression or coin/points code.

## First content draft — Genesis

`genesis-draft.json`: 23 sections covering Genesis 1 through 50 (continuous; each chapter occurs once). This is an editorial draft requiring a chapter-by-chapter accuracy and wording audit before promotion. References are to the NWT Study Bible and *Insight on the Scriptures* on JW.org.

Primary sources:
- https://www.jw.org/en/library/bible/study-bible/books/genesis/
- https://www.jw.org/en/library/books/Insight-on-the-Scriptures/Genesis-Book-of/

## Safe development and integration

1. **No writes to the protected original project, and no writes to the Visual Lab `main` branch from this workstream.** Puzzle work can continue in the other chat.
2. `reader.js` and `reader.css` are new, isolated feature files. `preview.html` is a standalone UI preview. These do not run in the existing game unless deliberately included later.
3. For integration *after reviewing the latest puzzle changes and coordinating merge order*, add `<script defer src="bible-book-guides/reader.js"></script>` to `index.html` **after** the core game scripts. This feature intercepts only `#levels [data-book]` clicks, leaving Story Adventure itself untouched. Update the now-misleading text in the Bible Books intro, collection note, and Journey's “Browse Bible Books” shortcut before promotion.
4. **Important routing dependency:** Story Adventure currently relies on the book grid for Genesis and Exodus access. Before enabling the interception, give Story Adventure its own discoverable direct entry (for example, from Journey). Do not strand existing adventures.
5. Validate mobile Android + iPhone, back navigation, resume, accessibility, reader scroll, and all 66 book tiles. Verify that Story, points, coins, announcers, music and puzzle logic remain unchanged.
6. Test on a preview / dedicated deployment first; merge into TEST only after review, then follow the existing TEST-to-LIVE checkpoint process.

**Do not consider the editorial draft published or verified merely because it is committed.**

# Daily Discovery — visual inspection of final ten thematic scenes (TEST only)
**Review date:** November 12, 2026 (Eastern); workflow timestamp November 13 UTC.

## Evidence and scope
- Inspected the **actual rendered 390 CSS-pixel mobile illustrated-book covers** for all ten IDs, not image filenames alone. The full set was captured by the TEST-only GitHub Actions QA workflow [run 43358547396](https://github.com/basilejoseph325-jpg/Bible-Unfolded-Visual-Lab/actions/runs/43358547396), which completed **successfully**; screenshots were saved to artifact `daily-book-preview-three-scenes` (its historical name was not updated).
- Image mapping source: `daily-discovery-meaningful-test-v1.js`; educational wording and source URLs: `daily-discovery-insights-content-test-v1.js`.
- Mobile book presentation is legible in the rendered screenshot. The ten old thematic illustrations are correctly tagged `Thematic illustration`, but many mismatch the specific lesson and should not be used for the final editorial collection.
- **Decision: 9 replacements advisable, 1 thematic keep; no player-facing game code, saved state, user progress, rewards, LIVE repo, or image mappings altered by this audit.**
- This is an editorial *recommendation*, not owner approval of replacement artwork or proof of physical Samsung/iPhone Safari QA.

| Discovery ID | Source | Actual cover appearance and problem | Decision | Replacement brief |
|---|---|---|---|---|
| `stars` | Isaiah 40:26–31 | Staff-bearing traveler viewing a daytime/sunset valley; no visible stars | **REPLACE** | Distinct clear night sky with many visible stars; avoid invented portrait of Isaiah |
| `radio` | JW.org Broadcasting the Good News, 1924 | Antique globe, lamp and scrolls; no actual broadcasting equipment; scene feels centuries too early | **REPLACE** | Historically plausible modest 1924 WBBR radio studio, period microphone and technician |
| `samaritan` | Luke 10:30–37 | Image depicts a father embracing a returning son (prodigal-son story), NOT a roadside wounded traveler | **REPLACE** | Use previously accidentally generated roadside Good Samaritan candidate after user review: Samaritan treating wounded traveler, donkey nearby |
| `mustard` | Mark 4:30–32 | Same prodigal-son embrace as samaritan; no seed or plant at all | **REPLACE** | Close-up tiny mustard seed with growing mustard plant, or Jesus illustrating the seed in context |
| `ezra` | Nehemiah 8:1–12 | Generic sunset city landscape, no public Scripture reading or explanation | **REPLACE** | Ezra reading Law and Levites explaining to gathered listeners |
| `paul-work` | Acts 18:1–4 | Flame-over-heads Pentecost-style group, with no tentmaking tools or workshop | **REPLACE** | Paul, Aquila and Priscilla working together on tent material in first-century Corinth |
| `tears` | Psalm 56:3–11 | A man visually suggesting David with a harp under a starry twilight sky; appropriate poetic Psalm mood, not a literal tear scene | **KEEP THEMATIC** | Retain with honest Thematic illustration label; literal tear bottles are not required; optional future refinement |
| `hezekiah-water` | 2 Chronicles 32:1–8, 30; 2 Kings 20:20 | Same generic walled-city sunset used for Ezra and Jeremiah; no channels, pool, or water supply | **REPLACE** | Reconstruction of ancient water diversion/channel preparation during siege; avoid modern engineering |
| `jeremiah-field` | Jeremiah 32:1–15 | Same generic Jerusalem city illustration; no deed, witness, land sale or earthenware vessel | **REPLACE** | Jeremiah making a witnessed land purchase in Courtyard of the Guard with seals, deeds, clay jar |
| `sparrows` | Luke 12:6–7 | Same lone staff-carrying sunset traveler as stars, no sparrows, market or coins | **REPLACE** | Five sparrows at a modest period marketplace, tiny coins as context, compassionate lesson |

## Especially important wrong-scene substitutions
1. `samaritan` and `mustard`: both currently display the **prodigal son/father reunion**, which is the wrong illustration for both lesson topics. Their current image is `family-worship-menu-art/v1/topic-23-jesus-illustrations.webp`.
2. `paul-work`: the current image strongly resembles the **Pentecost tongues-of-fire scene** rather than tentmaking; current image `family-worship-menu-art/v1/topic-26-paul-timothy.webp`.
3. `radio`: globe/lantern/scroll study still-life suggests an earlier century and gives no visual explanation of 1924 radio broadcasting.
4. `hezekiah-water`, `ezra`, `jeremiah-field` each reuse `journey-art/05_exile_return.webp` for Ezra and Jeremiah, and `journey-art/04_judges_kings.webp` for Hezekiah; the imagery is a similarly styled generic ancient-city view, not a topic-specific event.
5. `stars` and `sparrows` both reuse `family-worship-menu-art/v1/topic-37-jehovah-s-qualities.webp` showing a traveler at sunset. The concrete subject of each title is missing (stars and sparrows).

## Found existing new candidate for Good Samaritan
An **uninstalled** standalone image originally generated accidentally during attempts to illustrate Rahab shows an injured traveler being cared for by a Samaritan beside a donkey. It is compositionally suitable for Luke 10:30–37 and can be optimized to 960×540 WebP; submit to owner for visual review before promoting into TEST. Do **not** mark this image as already approved or installed.

## Suggested art production order, replacing the most misleading first
**Batch A:** Good Samaritan (reuse existing candidate subject to approval), mustard seed, Paul tentmaking.  
**Batch B:** WBBR radio (reference official 1924 photos and technology), Ezra reading and Levites explaining, Hezekiah waterworks.  
**Batch C:** Jeremiah's field transaction, Isaiah's stars, five sparrows.  
**Keep for now:** Psalm 56/David's tears (thematic harp image).

New scenes must be 16:9, single continuous illustration, appropriate NWT/JW.org historical details, no collage, no crosses/halos, reasonably sized WebP, and preserve the existing owner-approved book theme, Save/Share and lesson IDs. Use the exact topic as rendered on the correct Daily Discovery item; do not reuse a mismatched Bible event. Physical Samsung Android and iPhone Safari acceptance and explicit owner approval are separate LIVE gates.

## Official source cross-check
- [Luke 12:6–7 and study note](https://www.jw.org/en/library/bible/study-bible/books/luke/12/)
- [WBBR first broadcast from JW.org archives](https://www.jw.org/en/library/series/from-our-archives-1/Broadcasting-the-Good-News/)
- [Jeremiah 32:1–15 land purchase](https://www.jw.org/en/library/bible/nwt/books/jeremiah/32/)
- [2 Chronicles 32:1–8,30 waterworks](https://www.jw.org/en/library/bible/nwt/books/2-chronicles/32/)

**Audit output only, Visual Lab TEST. LIVE untouched.**

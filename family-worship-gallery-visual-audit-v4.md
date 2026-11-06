# Family Worship gallery V4 — consolidated visual QA notes (Visual Lab only)

**Scope:** Topic picker inside Family Worship. Frozen exterior V2, all other modes, question logic, and music remain untouched. All Family Worship images are isolated copies under `family-worship-menu-art/v1/`.

## Upper-frame crop corrections requested (18 distinct)
- Bible People & Events — central figure's head missing
- Jesus & His Teachings — Jesus' head cut
- Early Congregation — main figure's head cut
- Abram’s Journey — Abram's head cut
- Gideon — horn cropped
- Ruth & Naomi — standing man's head cut
- David — Goliath's head cut
- Daniel — man's head cut
- Jesus’ Illustrations — Jesus' head cut (also wrong image reuse)
- Jesus’ Miracles — Jesus' head cut
- Paul & Timothy — central head cut (also photo duplicated with Pentecost)
- Jonah — head cut
- Sermon on the Mount — Jesus' head cut
- Pentecost — main man's head cut
- Jehovah’s Qualities — figure's head cut
- Jesus’ Ministry — Jesus' head cut
- Kingdom & Armageddon — Jesus' head cut
- Christian Living — main man's head cut

Top-aligned focal crop implemented in `family-worship-gallery-crop-v4.css`. This helps where source has headroom. If the actual original artwork itself lacks the person's head, a replacement image is required; CSS cannot invent missing pixels.

## Mismatched/duplicated scene replacements — source improvements vs still pending
- **Cain and Abel** — shares Eden's paradise image. Needs a depiction of Cain and Abel.
- **Tower of Babel** — shares Eden's paradise image. Needs city/tower construction.
- **Baby Moses** — shows the Red Sea crossing. Needs infant Moses in a basket by the Nile.
- **Peter & Early Disciples** — initial Lazarus/resurrection duplicate replaced with its own first-century good-news illustration asset (v4). **Needs user visual approval**.
- **Paul & Timothy** — initial Pentecost duplicate replaced with its own Second Timothy-themed image (v4). **Needs user visual approval**.
- **Jesus’ Illustrations** — the parable/illustration scene is retained; **Jesus’ Ministry** now uses a different Messiah-themed image (v4). **Needs user visual approval**.
- **Elijah / Elisha** — identical fiery-chariot illustration. Requires distinct Elisha scene.
- **Samuel** — uses same David/Goliath photo as **David**, additionally found in the duplicate audit.
- **Future Promises / Bible Prophecy** — shares the same photo; consider separate art once priority issues complete.

## User-approved exceptions — don't edit
- **Model Prayer**: current head/crop accepted.
- **Jesus’ Early Life**: current reused photograph and crop accepted.

**Do not replace an incorrect Bible scene with another misleading one.** Replacements must be independently appropriate before promotion. Current V4 patch makes 18 crop adjustments and replaces three duplicate source references, but it does not claim to resolve the incorrect-event art without proper scene-specific images.

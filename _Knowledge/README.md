# _Knowledge — Shared Project Memory

Distilled, durable learning for the Spare-it Site Visit App. Both tools draw from this folder.
Source material: 140+ working documents produced May–Aug 2026, now in `Archive/docs/`.

**Read this folder before starting work. Write to it when you finish work.**

## Contents

| File | Covers | Read it when |
|---|---|---|
| `01_Coordinate_And_Pin_System.md` | Stored-percent vs rendered-pixel model, pan/zoom bounds, 20 root-caused positioning bugs, 13 invariants | Touching pins, floor plans, zoom, pan, or any placement maths |
| `02_Bug_Patterns_And_Fixes.md` | 9 recurring failure patterns, ~28 non-coordinate bugs, hygiene debt, open items | Before fixing any bug — check whether we already caused and solved it |
| `03_Testing_Playbook.md` | Minimal pre-deploy sequence, what automation misses, device matrix, which test assets survive | Before any deploy or test-writing |
| `04_Architecture_And_Storage.md` | As-built architecture, the photo/storage ceiling, decision log with reversals, 22 open gaps | Any storage, backend, export or hosting decision |
| `05_Process_Product_And_Efficiency.md` | Version timeline, team feedback, the internal/VISION split, process anti-patterns | Planning a sprint or wondering why something is the way it is |

## The five hardest-won lessons

1. **No version control caused nearly every other problem** — six competing HTML builds, ten test scripts, ten bug reports. A "fix" is only fixed in the one file its document names; nothing was ever back-ported.
2. **Tests were written, not run.** Two major work packages documented full suites and executed neither.
3. **Documentation outran code roughly 3:1.** Polished decks and Miro boards existed before a working URL did.
4. **A parallel rewrite nobody adopted cost more than the feature it removed.**
5. **One unmade architecture decision stalled the project ~7 weeks** while none of the four real shipping blockers depended on it.

## How to contribute — the workflow

Any chat that does work on either tool ends with a knowledge pass. Four rules:

**1. One file per theme, appended — never a new file per session.**
A finding goes into the matching numbered file above. Do not create `BUG_FIX_SUMMARY_v4.md`. That habit is what produced the archive.

**2. Every entry carries: what happened / root cause / fix / status / date.**
Root cause is the part that has future value. "Fixed the offset" is worthless; "getBoundingClientRect already includes the pan translation, so subtracting pan double-counted it" is the asset.

**3. Contradictions are recorded, not resolved silently.**
If a new finding conflicts with what is written here, say so in place and date both. The archive is full of documents that quietly disagree; that is why nobody trusts any of them.

**4. Status is honest.**
`Fixed` means someone ran it and watched it work. Otherwise it is `Unverified`. Five separate "production ready" declarations preceded basic-flow bugs surfacing in the field.

### End-of-session checklist

- [ ] New bug root-caused? → `02` (or `01` if positional)
- [ ] Architecture or storage decision made or reversed? → `04` decision log
- [ ] Something about testing proved false? → `03`
- [ ] Process friction worth not repeating? → `05`
- [ ] Blocker resolved? → update the tool's own `BLOCKERS.md`, not this folder
- [ ] Nothing to add? Say so explicitly rather than inventing an entry.

## What does NOT belong here

Per-tool status, blockers, roadmaps, and how to run a specific build. Those live in
`Internal-Tool/` and `VISION-Customer-Tool/`. This folder is only for learning that
outlives whichever tool taught it.

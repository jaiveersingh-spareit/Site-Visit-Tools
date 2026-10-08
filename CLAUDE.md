# CLAUDE.md — Site Visit App Project Root

**Routing file. Read the folder-specific `CLAUDE.md` for whichever tool you are working on.**

Two separate products live here. **They do not share code and must not share a chat.**

```
Site Visit Form/
├── Internal-Tool/            ← internal ops tool, near field-ready
├── VISION-Customer-Tool/     ← customer-facing audit tool, early
├── _Knowledge/               ← shared learning, read by both
└── Archive/                  ← everything superseded, reference only
```

## Internal-Tool/

**`INTERNAL_Site_Visit_Tool_v3.html`** — used by Spare-it staff to record a site visit so
operations can plan a **hardware deployment**: scales, gateways, displays, bin codes, QR
labels. Renamed from `Spare-it_site_visit_form_MVP.html` (24 Jun 2026), ruled the canonical
base on 26 Aug.

**Status:** not field-ready, ~1.5 days of work away. Four blockers, none needing a backend
decision. Target: Luxembourg pilot, first week of September.

## VISION-Customer-Tool/

**`VISION_Site_Audit_Tool_v1.html`** — customer-facing. Audits an **existing** site to
identify which bins can carry a QR code, and captures contamination by photographing the
waste streams at each station. **Purely digital — no scales, no hardware.**

**Status:** early. Needs the backend overhaul (Google Sheets + Drive via Apps Script) before
it is useful. Spec in `VISION-Customer-Tool/docs/`.

⚠️ The file is a rename of `site-visit-form-no-zoom.html`, which was a July rewrite of the
*internal* app, parked on 26 Aug. It fits VISION because it has no scale or gateway logic —
but it is a **donor codebase, not a working product**. See its `BLOCKERS.md` item 00.

## _Knowledge/

Distilled from 140+ working documents produced May–Aug 2026. Coordinate system, bug
patterns, testing playbook, architecture decisions, process lessons.

**Read it before starting work. Write to it when you finish.** The contribution workflow is
in `_Knowledge/README.md`.

## Archive/

Superseded builds, the original 140+ documents, old test scripts, decks and screenshots.
Reference only. **Nothing here is authoritative** — fixes were never back-ported between
the six competing builds, so a "Fixed" in an archived document is only fixed in the one
file that document names.

## Rules for working here

1. **One chat per tool.** State which folder you are in at the start. Do not cross over.
2. **No new copies.** No `_v4`, `_FINAL`, `_UPDATED`. Edit in place. Filename-versioning
   is what produced six divergent builds and an unusable document archive.
3. **No new loose documents at the root.** Findings go into `_Knowledge/`; status goes into
   the tool's own `BLOCKERS.md`.
4. **`Fixed` means someone ran it and watched it work.** Otherwise `Unverified`. Five
   separate "production ready" declarations preceded basic bugs surfacing in the field.
5. **There is no version control.** Setting up git is the highest-leverage unclaimed task
   in this project.

*Structure created 27 Aug 2026.*

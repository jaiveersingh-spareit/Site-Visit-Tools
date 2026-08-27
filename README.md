# Site Visit Tools — Spare-it

Two separate products live here. **They do not share code and must not share a chat.**

```
Site-Visit-Tools/
├── Internal-Tool/            ← internal ops tool, near field-ready
├── VISION-Customer-Tool/     ← customer-facing audit tool, early
└── _Knowledge/                ← shared learning, read by both
```

## Internal-Tool/

**`INTERNAL_Site_Visit_Tool_v3.html`** — used by Spare-it staff to record a site visit so
operations can plan a **hardware deployment**: scales, gateways, displays, bin codes, QR
labels.

**Status:** not field-ready, ~1.5 days of work away. Four blockers, none needing a backend
decision — see `Internal-Tool/BLOCKERS.md`. Target: Luxembourg pilot, first week of September.

## VISION-Customer-Tool/

**`VISION_Site_Audit_Tool_v1.html`** — customer-facing. Audits an **existing** site to
identify which bins can carry a QR code, and captures contamination by photographing the
waste streams at each station. **Purely digital — no scales, no hardware.**

**Status:** early. Needs a backend overhaul (Google Sheets + Drive via Apps Script) before
it is useful — see `VISION-Customer-Tool/BLOCKERS.md` and
`VISION-Customer-Tool/docs/Backend_Architecture_Recommendation.md`.

## _Knowledge/

Distilled engineering knowledge: coordinate system, bug patterns, testing playbook,
architecture decisions, process lessons. Read before starting work, write to it when
you finish — workflow in `_Knowledge/README.md`.

## Rules for working here

1. **One chat/branch per tool.** State which folder you're in. Do not cross over.
2. **No new copies.** No `_v4`, `_FINAL`, `_UPDATED`. Edit in place; commit instead.
3. **Findings go into `_Knowledge/`; status goes into the tool's own `BLOCKERS.md`.**
4. **`Fixed` means someone ran it and watched it work.** Otherwise `Unverified`.

*A fuller archive of prior working documents and legacy builds is kept locally,
outside this repository.*

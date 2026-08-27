# CLAUDE.md — INTERNAL Site Visit Tool

## Scope of this folder

This folder is the **internal operations tool** and nothing else. It is used by Spare-it
staff to record a site visit so operations can plan a hardware deployment: scales,
gateways, displays, bin codes, QR labels.

**Do not** touch `../VISION-Customer-Tool/`. That is a separate product with a separate
chat. If a request concerns customer-facing auditing, contamination photography, or the
Google Sheets backend, it belongs there.

Read `../_Knowledge/` before starting. Write findings back to it when you finish
(see `../_Knowledge/README.md`).

## The build

- **File:** `INTERNAL_Site_Visit_Tool_v3.html` (~945KB, ~6,943 lines)
- **Provenance:** renamed from `Spare-it_site_visit_form_MVP.html`, 24 Jun 2026
- **Status:** near field-ready. Four blockers — see `BLOCKERS.md`.
- **Ruled the canonical base** on 26 Aug 2026 over the July `no-zoom` rewrite, which
  dropped HEIC support, partial-ised the export, and never ran its own 22 test cases.

Single-file HTML: inline CSS and JS, no build step, no backend, no framework. Runs
client-side with localStorage + IndexedDB. Works offline.

## What distinguishes it from VISION

| | Internal tool | VISION tool |
|---|---|---|
| Purpose | Plan a hardware deployment | Audit an existing site, digital only |
| Hardware | Scales, gateways, displays | None |
| Output | Bin codes, QR labels, station map | Contamination photos per stream |
| Audience | Spare-it operations | Customer-facing |

If you are adding a feature, ask which column it belongs in before writing code.

## Architecture

- **State:** one object `S = { building, address, hauler, date, auditor, selectedStreams, floors[] }`; floors contain `stations[]`, `gateways[]`, `displays[]`.
- **Accessors:** `gF()` current floor, `gSt()` station, `gGw()` gateway, `gDisplay()` display.
- **Persistence:** `persist()` → localStorage. Photos → IndexedDB (`AuditDB`).
- **Rendering is imperative.** There is no reactivity. After every state change you must call the relevant `render*()` function yourself.
- **Coordinates:** pins stored as 0–100% of the original image; pixels computed at render time. This is the single most bug-prone area in the codebase — read `../_Knowledge/01_Coordinate_And_Pin_System.md` before touching it. Zoom is disabled in place in this build.

## Non-negotiable rules

1. **Call `persist()` after every state mutation.** Forgetting it is the single most repeated bug in this project's history.
2. **Call the render function after every state mutation.** Nothing updates on its own.
3. **Never hardcode pixel positions.** Store 0–100%, compute pixels at render.
4. **Never modify `baseContainerWidth`/`baseContainerHeight` during pan.** It causes a coordinate feedback loop.
5. **Handlers are string-based `onclick` attributes.** A renamed function or element ID fails silently at runtime — grep for every reference before renaming anything. See `../_Knowledge/02_Bug_Patterns_And_Fixes.md`.
6. **`Fixed` means you ran it and watched it work.** Otherwise write `Unverified`.

## Testing

`../_Knowledge/03_Testing_Playbook.md` is authoritative. In short: the automated scripts
verify arithmetic and the presence of code strings; **every field-relevant bug in this
project's history was found manually or on a device.** Do not treat a green automated run
as readiness.

Minimum before any deploy: full workflow on a real phone, against a real floor plan,
with 15+ photos, confirming the export actually arrives.

## Debugging

Console logs are tagged: `[PIN TAP]`, `[RENDER]`, `[SAVE]`, `[HEIC]`, `[VALIDATION]`,
`[PLAN TAP]`, `[ZOOM]`.

## Housekeeping

There is **no version control on this project.** That single fact caused most of the
problems recorded in `../_Knowledge/`. Six competing HTML builds existed; fixes were never
back-ported between them. Do not create `_v4`, `_FINAL`, `_UPDATED` copies. Edit this file
in place. Setting up git is a standing recommendation.

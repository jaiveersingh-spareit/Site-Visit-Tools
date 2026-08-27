# CLAUDE.md — VISION Customer-Facing Site Audit Tool

## Scope of this folder

This folder is the **customer-facing VISION audit tool** and nothing else.

**Purpose:** audit an *existing* site to identify which bins can carry a QR code, and to
capture contamination across a waste setup by photographing the waste streams at each
station.

**Purely digital.** No scales, no gateways, no displays, no physical hardware of any kind.
If a request involves hardware placement or deployment planning, it belongs in
`../Internal-Tool/`, which is a separate product with a separate chat.

Read `../_Knowledge/` before starting. Write findings back to it when you finish
(see `../_Knowledge/README.md`).

## The build

- **File:** `VISION_Site_Audit_Tool_v1.html` (~77KB, ~2,347 lines)
- **Provenance:** renamed from `site-visit-form-no-zoom.html`, 7 Jul 2026
- **Status:** early. Needs a backend overhaul before it is useful. See `BLOCKERS.md`.

### Read this before assuming what the file is

`site-visit-form-no-zoom.html` was **not originally authored as a customer-facing tool.**
It was a July rewrite of the *internal* app with zoom replaced by fit-to-box, and on
26 Aug 2026 it was formally **parked** in favour of the MVP build — it had dropped HEIC
photo support, partial-ised the Excel/ZIP export, left email keys as placeholders, was
never deployed, and its 22 documented test cases were never run.

What makes it the right *starting point* for VISION is what it lacks: code inspection
confirms **no gateway and no scale logic**, and it is photo-centric — which matches the
VISION brief. Its fit-to-box floor plan handling was also judged the better long-term
answer for pin accuracy.

So treat it as a **donor codebase, not a working product.** Expect to remove residual
internal-tool concepts and to re-add what the July rewrite dropped.

## Target architecture

The intended backend is specified in **`docs/Backend_Architecture_Recommendation.md`** —
a Google Apps Script Web App fronting Google Sheets (structured data) and Google Drive
(images), driven by a `?sheetId=` parameter so one generic HTML file serves many clients.

Two things it must deliver that the current build cannot:

1. **Pre-population** — ops fills a sheet with building details, floor plans and existing
   pins before the visit; the app loads them on open.
2. **Photo capacity beyond ~30 per floor/building** — photos upload to Drive and drop out
   of IndexedDB once confirmed, removing the local storage ceiling.

Stay **local-first**: keep local state as the working copy so the tool still works offline,
and sync **per floor on save**, never per action.

## Non-negotiable rules

1. **Pin coordinates stay 0–100%** of the original image, pixels computed at render. Do not change this — it is the one part of the coordinate system that has always worked. Read `../_Knowledge/01_Coordinate_And_Pin_System.md`.
2. **Call `persist()` after every state mutation**, and the matching `render*()` function. Rendering is imperative; nothing updates on its own.
3. **Never hardcode pixel positions.**
4. **Handlers are string-based `onclick` attributes** — a renamed function or ID fails silently. Grep before renaming.
5. **This is customer-facing.** Apply `spare-it-brand-guidelines` to anything a customer sees. Product name is **VISION**.
6. **`Fixed` means you ran it and watched it work.** Otherwise `Unverified`.

## Security note for the backend work

An "Anyone with the link" Apps Script Web App is a public endpoint. Require a shared-secret
token param, validate it server-side, and reject unknown `sheetId`s. Never put credentials
in the HTML — it is shared as a file.

## Housekeeping

There is **no version control on this project**, and that caused most of the failures
recorded in `../_Knowledge/`. Do not create `_v2`, `_FINAL`, `_UPDATED` copies. Edit in
place. Setting up git is a standing recommendation.

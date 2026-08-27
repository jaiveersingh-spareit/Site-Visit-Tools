# BLOCKERS — VISION Customer-Facing Site Audit Tool

**As of 27 Aug 2026.** This tool is earlier-stage than the internal one. The items below
are development blockers, not launch blockers — there is no launch date yet.

## 00 · Confirm the starting point — DECISION NEEDED · first thing

`VISION_Site_Audit_Tool_v1.html` is a rename of `site-visit-form-no-zoom.html`, which was
a July rewrite of the **internal** app, formally parked on 26 Aug. It is photo-centric and
carries no scale or gateway logic, which fits the VISION brief — but it was never designed
as a customer-facing product.

**Decide before writing code:** carry this file forward and strip it, or start fresh and
lift only its fit-to-box floor-plan handling. Deciding late is how the July rewrite cost
six weeks the first time. See `../_Knowledge/05_Process_Product_And_Efficiency.md`.

## 01 · No backend — BLOCKER · the defining problem

The app cannot pre-populate building details or floor plans, and cannot store more than
roughly 30 photos per floor/building before local storage fails.

**Specified fix:** Google Apps Script Web App in front of Sheets + Drive.
Full spec in `docs/Backend_Architecture_Recommendation.md`.

Two POCs gate the decision:

| # | POC | Effort |
|---|---|---|
| 1 | One endpoint that reads a floor's stations from a sheet and writes them back | 1–2 days |
| 2 | Upload one station photo to Drive, retrieve its thumbnail, confirm the `{building}_{floor}_{station}_{type}` naming holds | 1 day |

If both round-trip cleanly, the architecture is confirmed.

**Note:** as of 26 Aug the backend decision (AWS vs Firebase vs Sheets/Apps Script) was
*deliberately parked* org-wide, to be settled by the Luxembourg pilot. The Apps Script
recommendation is a recommendation, not a ruling. Confirm before building on it.

## 02 · Regressions inherited from the July rewrite — HIGH

The donor file dropped or partial-ised working features. Each must be re-added or
consciously declared out of scope for VISION:

- **HEIC photo support** — dropped. iPhone photos are the primary input for a photo-centric tool. Almost certainly must come back.
- **Excel + ZIP export** — partial.
- **Email export** — placeholder keys, never filled.
- **22 documented test cases** — never run.
- **Never deployed** — no live URL has ever existed for this build.

## 03 · Product definition gaps — DECISION NEEDED

Unanswered questions that shape the schema and the UI. From
`../_Knowledge/04_Architecture_And_Storage.md`:

- Can existing VISION building/floor-plan/client data be **queried** rather than rebuilt?
- Auth — reuse Spare-it auth, or add a redundant second system?
- Multi-site / multi-customer permissions model (affects schema, API and auth).
- Relationship to TRACK and ENGAGE — is this a VISION module or standalone?
- Where do photos surface for the operations team?
- Contamination capture — what taxonomy? Photo types are undefined.
- QR-code identification — what does the tool actually output for a bin that qualifies?
- Data retention, audit trail, link expiry, customer-facing report format.

## 04 · Known Apps Script constraints to design around

From `docs/Backend_Architecture_Recommendation.md`:

- **6-minute max per execution** — chunk photo uploads a floor at a time.
- **~1–3s latency per call**, cold starts included — batch by floor, show a sync indicator, never block the UI.
- **CORS** — needs the right deployment settings and a `Content-Type: text/plain` POST trick to avoid preflight. Budget time.
- **Offline** — Apps Script needs connectivity; the local-first queue must hold until back online.
- Use a **Workspace account** (spare-it.com) for the higher quota tier.

## 05 · Inherited coordinate-system risks — MEDIUM

If this build keeps the donor's pin code, it may carry these unresolved items
(`../_Knowledge/01_Coordinate_And_Pin_System.md`):

- A constant 37.7px Y offset, X error exactly 0.
- `displayedWidth` defined three incompatible ways.
- Possible double-application of pan between `renderPins()` and `updateFloorPlanTransform()`.

Verify against *this* file before assuming either presence or absence.

## Rules for this file

Update in place. Mark items `RESOLVED <date> — <how verified>` rather than deleting them.
`Fixed` requires that someone ran it and watched it work.

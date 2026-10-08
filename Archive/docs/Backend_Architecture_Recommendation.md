# Site Visit App — Backend Architecture Recommendation

**Context:** Feasibility check requested in the Jul 9, 2026 "Vision Site Audit: Integration" meeting (Laurent, Romain, Lowell, Jaiveer). Goal: move off local-only storage so the app can (1) pre-populate building info + floor plans + pins, (2) store station photos without crashing, and (3) be shared as a single HTML file. Target: production-ready by end of July, rollout mid-August.

---

## Bottom line

**Feasible, and recommended — but not by calling the Google APIs directly from the browser.** Use a **Google Apps Script Web App as a thin backend** in front of Google Sheets (structured data) and Google Drive (images). The HTML file calls one Apps Script URL via `fetch()`. This is the lowest-effort path that fits the 6-month tactical window and directly solves the IndexedDB crash risk by moving photos off-device.

The alternative — calling the Sheets API and Drive API directly from the HTML — forces client-side OAuth on phones and exposes credentials. Not worth it for a tactical tool.

---

## Why Apps Script instead of direct API calls

| Concern | Direct Sheets/Drive REST API | Apps Script Web App (recommended) |
|---|---|---|
| Auth on phones | Per-user OAuth consent flow, or API key that can't write | None — script runs as the owner; client just hits a URL |
| Credentials in the HTML | Exposed (the file is shared) | None exposed; optional shared-secret token |
| Rate limits | 60 reads/min + 60 writes/min **per user** — tight | Uses `SpreadsheetApp`/`DriveApp`, not the REST per-user quota |
| Multi-tenant | Manual | Pass `?sheetId=...&token=...` per client — matches Romain's template idea |

The relevant Apps Script limits (use a **Workspace account**, i.e. spare-it.com, for the higher tier): UrlFetch ~100k/day (20k consumer), ~6 hr/day script runtime (90 min consumer), and a **6-minute max per execution** — the main constraint, addressed by batching (below).

---

## Proposed data model

**One spreadsheet per client/project**, identified by a `sheetId` URL parameter. The HTML is generic; the sheet defines the client. Tabs:

- **Building** — name, address, hauler, auditor, streams, Drive folder ID.
- **Floors** — floor name/index, floor-plan image (Drive file ID/URL), display dimensions.
- **Stations** — floor ref, station letter, stream, scale size, generated bin code, **pin coordinates stored as 0–100%** (unchanged from the current model — keep this, it survives zoom/pan), notes.
- **Photos** — station ref, photo type, Drive file ID + shareable link.

Keep the current "~15 rows per floor" structure so a whole floor syncs in **one batched write**, not one call per station.

## Images in Drive

- One Drive folder per project (ID stored in the Building tab).
- App sends base64 → Apps Script `DriveApp.createFile()` → returns file ID + link, written to the Photos tab.
- **Naming convention:** `{building}_{floorIdx}_{stationID}_{type}.jpg` (e.g. `AcmeHQ_2_B_station.jpg`). This preserves the current station-ID filename scheme the client already expects.
- **Reading back to the phone:** use Drive thumbnail links (`lh3.googleusercontent.com`) for the in-app previews (fast, small) and full-res link on demand — avoids re-downloading full images into the browser.

## Pre-population flow

Ops team fills the Building/Floors/Stations tabs and drops floor-plan images into the Drive folder ahead of the visit. On open, the app reads the sheet by `sheetId` and renders the pre-loaded building, floor plans, and any existing pins. The auditor then adds/edits stations and photos in the field.

## Sync strategy (also fixes the crash risk)

Stay **local-first**: keep the current localStorage/IndexedDB state as the working copy during the visit so the app still works offline, but **sync per floor on save** rather than per action. Photos upload to Drive and are dropped from IndexedDB once confirmed, keeping local storage small — this removes the ~50-photo ceiling that risks crashes today. On reopen, read the sheet snapshot to support editing previous stations.

---

## Key risks / caveats

- **Latency & cold starts:** each Apps Script call is ~1–3s. Batch by floor; show a sync indicator; never block the UI.
- **Endpoint security:** an "Anyone with the link" Web App is a public endpoint. Require a `token` param (shared secret) and validate it server-side. Reject unknown `sheetId`s.
- **6-min execution limit:** chunk photo uploads (a floor at a time); don't push all photos in one request.
- **Offline:** Apps Script needs connectivity — the local-first queue must hold until the device is back online, then sync.
- **CORS:** Apps Script Web Apps require the right deployment settings and a `Content-Type: text/plain` POST trick to avoid preflight; budget a little time for this.

---

## Recommendation on the four next steps

1. **Sheets as backend** — Feasible via Apps Script. POC: one endpoint that reads a floor's stations and writes them back. *(1–2 days)*
2. **Drive images push/read + naming** — Feasible via `DriveApp`. POC: upload one station photo, retrieve its thumbnail, confirm the `{building}_{floor}_{station}_{type}` convention holds. *(1 day)*
3. **Dedicated Slack channel** — Organizational, do it now (`#site-visit-app`).
4. **Fresh Claude context** — This session is that reset; lead with our own analysis, not raw AI output, per the meeting.

**Suggested POC (hits the "within a few days" ask):** deploy one Apps Script Web App bound to a test sheet + Drive folder; wire two calls into a branch of the current HTML — `loadProject(sheetId)` on open and `syncFloor()` on save (data + one photo). If that round-trips cleanly, the full architecture is confirmed.

---

*Sources: [Google Sheets API usage limits](https://developers.google.com/workspace/sheets/api/limits) · [Apps Script quotas for Google Services](https://developers.google.com/apps-script/guides/services/quotas)*

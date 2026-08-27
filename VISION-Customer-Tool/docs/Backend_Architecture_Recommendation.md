# Backend Architecture Recommendation — VISION Site Audit Tool

*Source: Google Doc `1GTRb4GR-aBxlzpG-SUTKtJfdCEAw5A36Ce1L7-tnPF4`, folded into this project 27 Aug 2026.*
*Context: feasibility check requested in the 9 Jul 2026 "Vision Site Audit: Integration" meeting (Laurent, Romain, Lowell, Jaiveer).*

## Bottom line

Feasible and recommended — but **not** by calling Google APIs directly from the browser.
Use a **Google Apps Script Web App as a thin backend** in front of Google Sheets (structured
data) and Google Drive (images). The HTML calls one Apps Script URL via `fetch()`.

This is the lowest-effort path that fits the tactical window and directly solves the
IndexedDB crash risk by moving photos off-device.

Calling Sheets/Drive REST directly from the HTML forces client-side OAuth on phones and
exposes credentials in a shared file. Not worth it for a tactical tool.

## Why Apps Script instead of direct API calls

- **Auth on phones** — direct REST needs per-user OAuth or a key that cannot write. Apps Script runs as the owner; the client just hits a URL.
- **Credentials** — direct REST exposes them in the shared HTML. Apps Script exposes none (optional shared-secret token).
- **Rate limits** — Sheets REST caps at 60 reads + 60 writes/min per user. Apps Script uses `SpreadsheetApp`/`DriveApp` and is not bound by that per-user quota.
- **Multi-tenant** — pass `?sheetId=...&token=...` per client, matching Romain's template idea.

Apps Script limits (use a Workspace account — spare-it.com — for the higher tier):
UrlFetch ~100k/day (20k consumer), ~6 hr/day runtime (90 min consumer), and a
**6-minute max per execution** — the main constraint, addressed by batching.

## Data model

**One spreadsheet per client/project**, identified by a `sheetId` URL parameter. The HTML
is generic; the sheet defines the client. Tabs:

| Tab | Fields |
|---|---|
| Building | name, address, hauler, auditor, streams, Drive folder ID |
| Floors | floor name/index, floor-plan image (Drive file ID/URL), display dimensions |
| Stations | floor ref, station letter, stream, scale size, generated bin code, pin coords as 0–100%, notes |
| Photos | station ref, photo type, Drive file ID + shareable link |

Keep pin coordinates as 0–100% — unchanged from the current model. It survives zoom/pan.
See `_Knowledge/01_Coordinate_And_Pin_System.md`.

Keep the current ~15-rows-per-floor structure so a whole floor syncs in one batched write,
not one call per station.

## Images in Drive

- One Drive folder per project (ID stored in the Building tab).
- App sends base64 → Apps Script `DriveApp.createFile()` → returns file ID + link, written to the Photos tab.
- **Naming:** `{building}_{floorIdx}_{stationID}_{type}.jpg` (e.g. `AcmeHQ_2_B_station.jpg`), preserving the scheme the client already expects.
- **Reading back:** Drive thumbnail links (`lh3.googleusercontent.com`) for in-app previews, full-res on demand. Avoids re-downloading full images into the browser.

## Pre-population flow

Ops fills the Building/Floors/Stations tabs and drops floor-plan images into the Drive
folder ahead of the visit. On open, the app reads the sheet by `sheetId` and renders the
pre-loaded building, floor plans and existing pins. The auditor adds/edits stations and
photos in the field.

## Sync strategy — also fixes the crash risk

Stay **local-first**: keep localStorage/IndexedDB as the working copy during the visit so
the app still works offline, but **sync per floor on save**, not per action. Photos upload
to Drive and are dropped from IndexedDB once confirmed, keeping local storage small. This
removes the ~50-photo ceiling that risks crashes today. On reopen, read the sheet snapshot
to support editing previous stations.

## Risks and caveats

- **Latency / cold starts** — ~1–3s per call. Batch by floor, show a sync indicator, never block the UI.
- **Endpoint security** — an "Anyone with the link" Web App is a public endpoint. Require a token param and validate server-side. Reject unknown `sheetId`s.
- **6-min execution limit** — chunk photo uploads a floor at a time.
- **Offline** — Apps Script needs connectivity; the local-first queue must hold until back online.
- **CORS** — Apps Script Web Apps need the right deployment settings and a `Content-Type: text/plain` POST trick to avoid preflight. Budget time for this.

## Recommended next steps

| # | Step | Effort |
|---|---|---|
| 1 | **Sheets as backend** — POC: one endpoint that reads a floor's stations and writes them back | 1–2 days |
| 2 | **Drive images push/read + naming** — POC: upload one station photo, retrieve its thumbnail, confirm the naming convention | 1 day |
| 3 | **Dedicated Slack channel** (`#site-visit-app`) — organisational, do now | — |
| 4 | **Fresh Claude context** — lead with our own analysis, not raw AI output | — |

**Suggested POC:** deploy one Apps Script Web App bound to a test sheet + Drive folder;
wire two calls into a branch of the current HTML — `loadProject(sheetId)` on open and
`syncFloor()` on save (data + one photo). If that round-trips cleanly, the architecture
is confirmed.

---
Sources: Google Sheets API usage limits (developers.google.com/workspace/sheets/api/limits) ·
Apps Script quotas (developers.google.com/apps-script/guides/services/quotas)

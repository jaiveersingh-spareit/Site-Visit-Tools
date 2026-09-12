# Photo sync / offline queue tests

Playwright-based tests that exercise the app's photo-sync, station-creation-photo, and
offline-queue logic directly (via `page.evaluate()` calling the app's own functions),
with the Apps Script backend mocked via `page.route()` — no real Drive/Sheet is touched.

## Requirements
- Node.js with Playwright installed (`npm install playwright`), or a Playwright-provided
  Chromium (adjust the `executablePath` in each test file if yours lives elsewhere; unset
  it to let Playwright find its own default install).

## Running
From a terminal, in this folder:

```
python3 -m http.server 8792 &      # serves INTERNAL_Site_Visit_Tool_v3.html at :8792
node test_sync.js                  # photo-sync + eviction + export-resolution (21 checks)
node test_offline_queue.js         # offline photo queue reattachment (13 checks)
```

Both scripts copy/reference `../../INTERNAL_Site_Visit_Tool_v3.html` conceptually — in
practice, copy the current app file to `app.html` next to these scripts before running
(the tests load `http://localhost:8792/app.html`), so you're always testing the actual
current file rather than a stale copy.

Each test prints PASS/FAIL per check and exits non-zero if anything failed — safe to wire
into a pre-push check if that's ever worth automating further.

## What's covered
- `test_sync.js`: photo sync-on-add to Drive + local eviction (existing station and
  station creation paths), offline behavior, network failure and bad-server-response
  handling (local copy always preserved on failure), and export-time resolution of an
  evicted photo back to real bytes via the `getPhoto` backend action (including its
  fallback to the Drive link if that also fails).
- `test_offline_queue.js`: a station photo queued while offline actually reattaches to
  its station on reconnect (this was broken before 12 Sep 2026 — see BLOCKERS.md
  "Offline station photo data loss"), a deleted-station edge case reports honestly
  instead of a false success, an empty-queue automatic reconnect doesn't alert, and the
  pre-existing context-photo queue path is unchanged.

## Not covered
- The actual Excel/zip file generation (`buildAndDownloadExcel()`/
  `exportZipWithFloorPlans()`'s XLSX/JSZip mechanics) — these load their libraries from a
  CDN, which may not be reachable from every test environment. The tests instead exercise the
  logic that changed (`collectAllPhotos()`'s photo resolution) directly, without needing
  those libraries to load.

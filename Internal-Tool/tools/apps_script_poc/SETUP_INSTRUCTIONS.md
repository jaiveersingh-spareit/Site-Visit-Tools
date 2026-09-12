# Apps Script POC — setup steps

> **12 Sep 2026 update:** `Code.gs` now also has a `getPhoto` action (needed so the real app's Excel/zip export can pull real bytes back for a photo that's been synced and evicted locally — see BLOCKERS.md "Backend sync"). If you already deployed before this update: paste the new `Code.gs` over the old one in the script editor, then Deploy > Manage deployments > edit (pencil) your existing deployment > select "New version" > Deploy. This keeps the same `/exec` URL, so nothing in the app needs to change — it just needs the new code live.

Drive is set up: folder **"Site Visit Tool - Apps Script POC"** contains **"Site Visit POC - Test Sheet"**
and a **"Photos"** subfolder. Links:
- Folder: https://drive.google.com/drive/folders/14MNsNp6nW-z4vCUdCzg4dT0bNAEBgaWe
- Sheet: https://docs.google.com/spreadsheets/d/1r_6KLftPwoda6VRBBjAX59V0SESjlFFZk2qPCOz7BP0/edit
- Photos folder ID (for `driveFolderId` in the test client): `1rGm1X_9T_xHCkv_MAiRTzxrRZ8JFPKlO`

The remaining steps need your Google account — Apps Script deployment isn't something I can
do through the Drive API.

## 1. Bind the script to the sheet
1. Open the Sheet link above.
2. Extensions > Apps Script. This opens a script project bound to that sheet.
3. Delete the default empty `Code.gs` content and paste in the contents of `Code.gs` (attached).
4. Save (Ctrl/Cmd+S).

## 2. Create the tabs
1. In the function dropdown at the top of the script editor, select `setupSheet`.
2. Click Run. First run will prompt for authorization — allow it (it's your own script
   acting on your own sheet).
3. Check the Executions log (clock icon) for a "Tabs created/verified" log line — the
   original version of this script used `SpreadsheetApp.getUi().alert()` here, which
   hangs indefinitely when run from the standalone script.google.com editor (no
   active spreadsheet UI session to show the alert in). Fixed to log instead.
4. Check the Sheet — you'll see the four tabs with header rows.

## 3. Set the shared-secret token
1. Open `Code.gs`, edit the `TOKEN_VALUE` constant inside `setToken()` to your real token.
2. Select `setToken` in the function dropdown and click Run.
   (Same UI-hang issue as above ruled out `Browser.inputBox()` — the token is set by
   editing the constant and running the function, not via an interactive prompt.)

## 4. Deploy as a Web App
1. Deploy > New deployment.
2. Click the gear icon next to "Select type" > Web app.
3. Execute as: **Me**. Who has access: **Anyone** (fully public, no Google sign-in
   required). This option is available on the spare-it.com Workspace domain — an
   earlier pass on this doc incorrectly reported it as blocked by domain policy (see
   correction below); it was just not selected/visible at first.
4. Click Deploy, authorize again if prompted.
5. Copy the Web App URL (ends in `/exec`) — this is what the test client calls.

## 5. Run the round-trip test
1. Open `poc_client_test.html` (attached) in a browser — it's a standalone page, doesn't
   touch the production tool.
2. Paste the Web App URL and the token from step 3.
3. (Optional) pick a photo file to test the Drive upload path.
4. Click "Sync Floor" — writes two test stations (+ the photo, if picked) to the Stations
   and Photos tabs.
5. Click "Load Project" — reads that floor's stations back as JSON.
6. Check the Sheet and the Photos Drive folder to confirm the rows/file landed correctly.

If steps 4 and 5 both return clean JSON (no `error` field) and the Sheet/Drive folder show
the expected rows and photo, the round trip is confirmed and we're ready to talk about
wiring `loadProject()`/`syncFloor()` into a real branch of the site visit tool.

## STATUS: round trip confirmed (12 Sep 2026)
Both calls verified end-to-end against the real deployed Web App:
- `syncFloor` → `{"ok":true,"stationsWritten":2,"photo":{"fileId":"...","thumbnailLink":"...","fullLink":"..."}}`
  — two test stations written to the Stations tab, one photo uploaded to the Photos
  Drive folder with a working thumbnail + full-res link.
- `loadProject` → read the same two stations back with matching data.

This confirms the doc's core claim: Sheets read/write + Drive photo upload both work
from an external HTML page through Apps Script, with no client-side OAuth. `floor: null`
in the loadProject response is expected — this test never wrote a Floors-tab row, only
Stations/Photos.

## CORRECTION — earlier claim about domain-restricted auth was wrong
An earlier version of this doc reported that the spare-it.com Workspace domain doesn't
allow a public "Anyone" deployment, based on the option not showing up during initial
testing plus a curl that hit a 302 login redirect under "Anyone within spare-it.com."
That was wrong: a true "Anyone" option (no Google account required) is available on this
domain — it just wasn't selected the first time through. The confirmed round trip below
was run under **Anyone**, fully public, matching the doc's original assumption. No open
auth item to escalate to the team on this point; leaving this note in rather than
deleting it, per the standing rule of not quietly erasing an earlier wrong claim.

## Known rough edges to expect in this POC (by design, not bugs)
- `writeStations_` fully replaces all rows for a given `floorId` on every sync — fine for
  proving the round trip, but a real integration needs per-row merge, not full replace.
- No offline queue yet — a real integration keeps the current local-first behavior and
  queues syncs until back online.
- Apps Script Web Apps can't return real HTTP status codes — the client checks for an
  `error` field in the JSON body instead of the response status.
- The token is a single shared secret for the whole sheet — fine for a POC, not for
  multi-client production use (the doc's plan is one sheet + token per client project).

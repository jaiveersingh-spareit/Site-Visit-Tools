# BLOCKERS — INTERNAL Site Visit Tool

**Updated 27 Aug 2026 (second pass).** Primary source: `READINESS_AND_NEXT_STEPS_2026-08-26.html`
(the most reliable document in the project — the only one that contradicts its own
"production ready" claims). Cross-checked against `../_Knowledge/`.

> **Headline:** not field-ready today; roughly **1.5 days of work away**. The app has a
> working end-to-end capture flow and a built email export. It is not broken — it is
> unfinished in four specific places, and two of them would fail **silently on the day**,
> after the auditor has already done the work.
>
> **None of the four needs a backend decision.**

## Shipping blockers

### 00 · The deploy redirect pointed at a deleted filename — BLOCKER · RESOLVED 27 Aug 2026
**Found 27 Aug, not previously recorded.** `netlify.toml` routed every path to
`Spare-it_site_visit_form_MVP.html`, the pre-24-Jun filename. The file is now
`INTERNAL_Site_Visit_Tool_v3.html`, so the deployed site would have served nothing at
every URL. This would have made blocker 02 look like a hosting problem.
**RESOLVED 27 Aug 2026** — redirect repointed at `INTERNAL_Site_Visit_Tool_v3.html`.
*Verified by reading the file; still needs confirmation against a live URL (blocker 02).*

### 01 · The email key is blanked at build time — BLOCKER · RESOLVED 27 Aug 2026
`netlify.toml` set `SENDGRID_API_KEY = ""` under `[env.production]`. An empty value
**overrides** whatever is set in the hosting dashboard. Export would fail every time and
the auditor would see a generic error after a full day of capture.
**RESOLVED 27 Aug 2026** — the whole `[env]` block is deleted and replaced with a comment
explaining why nothing may be declared there. Both variables now come from the Netlify
dashboard only; `OPERATIONS_EMAIL` already has a `support@spare-it.com` fallback in
`send-export.js`, so removing it from the config is safe.
*Verified by reading `netlify.toml` and `send-export.js`.*

> **Still unverified for 00 and 01:** neither fix has been seen working, because there is
> no live site yet. Both stay `RESOLVED` in code, `Unverified` in the field, until 02 is done.

### 02 · No site has been published — BLOCKER · ~20 min · OPEN
The folder has the deploy config and the serverless function. Version control now exists
(corrected below), but **no Netlify site is connected** and nobody has a URL to hand
Carine. **Everything else is moot until this is done.**
**Fix:** follow the six-step quick start at the top of `NETLIFY_SETUP.md`. The two things
that will bite: **Base directory must be `Internal-Tool`**, or the functions are never
found; and `noreply@spare-it.com` must be a **verified sender in SendGrid**, or every
send returns 403 no matter how correct the key is.
**Then post the URL in channel.**

### 03 · A large visit will exceed the export size limit — HIGH · RESOLVED 27 Aug 2026
Photos compress to ~150KB each; email encoding adds ~a third. The hosted function accepts
~6MB per request — roughly **30 photos**. A multi-floor site goes past that, and the
failure lands at the end of the day when the data is already captured.
**RESOLVED 27 Aug 2026** — three-layer guard:
- The client measures the real payload before sending. Over **5.5MB** it refuses and names
  the per-floor option; over **4.0MB** it warns and asks for confirmation.
- A new **"Email floor by floor"** export sends one request per floor, in order, confirming
  each before the next. A failed floor prompts to continue and is named in the summary;
  data stays on the device so any floor can be retried.
- `send-export.js` rejects a request over 5.5MB with a **413 and an actionable message**,
  instead of a generic 500 after a day of capture.

Context photos ride with the first floor only, so they are never sent twice, and the
subject line carries `Floor N (i of n)` so operations can see if one is missing.

*Verified 27 Aug by running the real threshold code against simulated payloads: a 4-floor /
52-photo visit measures 10.4MB and is blocked; the same visit exported per floor produces
four requests of 2.5–2.7MB, all under the cap, with context photos sent exactly once.
**Not yet run on a phone against a live deployment** — that is the field gate under 02.*

### 04 · Photos sit in browser storage with a hard ceiling — HIGH · covered by 03
Photos are held in local browser storage, capped near 5–10MB. This one bites **mid-visit**
and can lose captured work.
**Pilot fix:** export after each floor — now a one-tap action (see 03).
**Proper fix:** the backend decision, deliberately parked.

> Note: the documents disagree on the photo ceiling — 5–8, 10–15, 15–20 and ~50 photos all
> appear as "the limit" across four documents. Only ~30 (the 6MB request cap) is derived
> from a measured figure. Treat the rest as estimates. See `../_Knowledge/04_Architecture_And_Storage.md`.

## Path to Luxembourg

The app runs **alongside** the PowerPoint workflow, not instead of it. The deck stays the
system of record, so if the app fails nothing is lost and we still learn something.

| When | What | Gate |
|---|---|---|
| Now | **Blocker 02** — connect the Netlify site, set the two dashboard variables, verify the sender in SendGrid | A working URL, posted in channel |
| Same day | Full workflow on a phone against a real floor plan with 15+ photos, both export paths | The export email actually arrives |
| Week of 1 Sep | 20-min walkthrough with Carine and a one-page fallback card | Carine can run it unaided |

**Remaining to field-ready: blocker 02 (~20 min) plus one device test.** 00, 01 and 03 are
fixed in code and await a live site to be verified against.

### 05 · "Add Station/Gateway/Display" placed no pin on first-time creation — BLOCKER · RESOLVED 03 Sep 2026 (code) · UNVERIFIED IN FIELD
**Found 3 Sep 2026** (Jaiveer, testing on the app). Tapping "+ Add Station" (or Gateway /
Display) put the floor plan into pin-placement mode correctly, but tapping the floor plan
image afterward silently did nothing — no pin appeared, no error shown.

**Root cause:** `openAddStation()` / `openAddGateway()` / `openAddDisplay()` set
`stationPositioningMode` / `gatewayPositioningMode` / `displayPositioningMode = true` to
enter pin mode, but never set `positioningStationId` / `positioningGatewayId` /
`positioningDisplayId` (there's no object yet — that's the point of "Add"). `handlePlanTap()`
saw the positioning-mode flag and routed every tap through `handleStationPosition()` /
`handleGatewayPosition()` / `handleDisplayPosition()` — the handlers meant for
**repositioning an existing pin** — whose first line is `if(!...PositioningMode ||
!positioning...Id) return false`. With the id null, each returned `false` immediately,
`confirmPinLocation()` never ran, and the tap was silently dropped. All three "Add" flows
had the identical bug; repositioning an existing pin was unaffected (its start functions do
set the id) and was confirmed working, coordinates included.

**Fix:** `handlePlanTap()`'s three routing checks (around line 4085) now require the
matching id (`stationPositioningMode && positioningStationId`, etc.) before calling the
reposition handlers. Without an id, the tap falls through to the existing "normal pin
placement" branch at the bottom of the function, which already calls
`showTapHighlight()` + `confirmPinLocation()` — and `confirmPinLocation()` already had
correct, untouched logic for `!isRepositioning && stationPositioningMode` (etc.) that opens
the station/gateway/display configuration modal and saves `pendingPinX/Y` onto the new
object once it's created. No new logic was added; first-time creation now goes through the
same normal-pin-placement path repositioning always used.

*Verified by reading the code and by parsing all inline `<script>` blocks with Node
(`new Function(...)`) — no syntax errors. **Not yet tested on a device** — needs someone to
tap "+ Add Station/Gateway/Display" on a phone and confirm a pin actually appears and the
configuration modal opens, per rule 4 (`Fixed` requires watching it work).*

## Second tier — known debt, not shipping blockers

Carried from `../_Knowledge/02_Bug_Patterns_And_Fixes.md` and `04_Architecture_And_Storage.md`:

- **Probable latent regression:** the 8 May "Create New" fix calls `populateLocationDropdown()`, which change 2B deleted on 15 May. Never checked.
- **Station stream type never set** — a real export showed all stations `type: null`.
- **Hygiene debt, none executed:** 100+ `console.log`s, duplicate state objects, 4× positioning duplication, dead `isRepositioning` and `stationCreationBins`. Estimated 6–8h.
- **`VERSION_3_AUDIT` pre-production checklist** — every box unchecked, including two dead modals and two dead functions flagged HIGH for deletion.
- **`DAILY_TEST.html`** — named as the pre-deploy gate in the old CLAUDE.md and TESTING_GUIDE, but it only exists in `Archive/`. Restore it or stop citing it.
- **No multi-tab synchronization** — silent overwrite, unrecoverable.
- **No sync-status visibility** for queued offline photos.
- **Never diagnosed:** "indicator instead of pin" on mobile; "stream size buttons unresponsive" was closed as already-working without a reproduction.
- **Not implemented:** post-creation station name/letter editing, floor-level occupancy, navigation consistency.
- ~~**No source control.**~~ **CORRECTED 27 Aug 2026** — git is initialised with a remote at
  `github.com/jaiveersingh-spareit/Site-Visit-Tools`. Several root files (`CLAUDE.md`,
  `Archive/`, `.env.example`) are still untracked. The docs elsewhere in this project
  still say there is no version control; they are out of date.

## Positioning subsystem — RESOLVED 11 Sep 2026 (code), UNVERIFIED IN FIELD

From `../_Knowledge/01_Coordinate_And_Pin_System.md`, originally logged as:

- A constant 37.7px Y offset (X error exactly 0) — never resolved.
- A 0%-tap-accuracy aspect-ratio transposition with no recorded follow-up.
- ~11.5px of pan at zoom 1.0, where there should be none.
- `displayedWidth` defined three incompatible ways across the code.
- `renderPins()` and `updateFloorPlanTransform()` possibly double-applying pan.

### Root cause (confirmed by direct measurement, not just code reading)

`updateDisplayDimensions()` and `updateFloorPlanTransform()` both sized the floor plan
image **height-first**: `displayHeight = containerHeight; displayWidth = displayHeight *
aspectRatio`. For any image relatively wider than the container's own aspect ratio — the
common case for a portrait floor plan inside this app's tall, narrow container (`75vh`
tall on a phone) — that formula produces a width WIDER than the container. `#plan-img`'s
CSS (`max-width:100%`) then silently clamped the actual rendered width back down, with
no `object-fit` rule to preserve aspect ratio under that clamp — non-uniformly squishing
the image. Every pin and tap calculation used the un-clamped (wrong, wider) width the JS
had computed, while the screen showed the clamped (different, narrower) box. This was
never a subtle rounding error: measured directly (see Testing below), the two boxes
differed enough to put tap coordinates up to 88 percentage points off from where the
screen actually showed the image.

This single mechanism is a better, more direct explanation for the field-reported "pin
placement is difficult/buggy" and "exported map doesn't match the app" than the vaguer
prior theories — and it would have affected the real MFS Luxembourg visit too: its floor
plan images (aspect ≈0.77) are exactly the shape that triggers the clamp on a typical
phone container (aspect ≈0.57–0.60).

### Fix

Added one shared `computeImageFit(containerWidth, containerHeight, aspectRatio)` —
proper `object-fit:contain`-equivalent math that picks whichever axis actually binds and
returns the letterbox offset on the other axis. `updateDisplayDimensions()` and
`updateFloorPlanTransform()` now both call it (removing the "three incompatible
definitions" problem structurally, not just patching each one separately), and
`updateFloorPlanTransform()` now caches `baseContainerWidth` as well as
`baseContainerHeight` (it previously cached only height, which — caught while testing
this exact fix — fed `computeImageFit()` a container width of 0 and briefly sized the
image at 0px). The image is now absolutely positioned within the container using the
computed letterbox offset, and every consumer of image coordinates (`renderPins()`,
`showTapHighlight()`, `handlePlanTap()`) adds or subtracts that same offset. Pan/zoom
were already removed from this app (see code comments); nothing here relies on
horizontal or vertical scrolling of an oversized image anymore, since the image now
always fits fully inside the container.

### Testing (this is the "perform a test as well" part)

Reasoning about this from static code wasn't enough — two earlier read-the-code theories
this session turned out to be wrong. So it was verified with an actual headless-browser
test (Playwright + the real Chromium binary already in this sandbox), loading the real
app file, injecting a floor with a synthetic floor-plan image, and measuring:

1. **Ground truth**: the browser's own `getBoundingClientRect()` on `#plan-img` — the
   real, rendered box, not a JS-computed guess.
2. **Round-trip accuracy**: called `handlePlanTap()` directly at a screen point computed
   as a known fraction of that real box, then compared the resulting stored pin
   percentage against the fraction that was tapped.
3. **Render accuracy**: placed a station at a known x%/y%, rendered it, and measured
   where its pin actually landed on screen (accounting for the CSS
   `translate(-50%,-100%)` anchor) against the expected screen position.

Run across 3 viewport sizes (390×844, 414×896, 768×1024 — phone through tablet) × 2
deliberately extreme image aspect ratios (0.667 portrait, 1.714 landscape) × 4 tap points
per combination, including near-edge taps (10%/90%) where an offset bug bites hardest:

- **Before the fix:** errors up to 88 percentage points (tap and render both wrong,
  consistent with each other but both disagreeing with the real screen).
- **After the fix:** worst error across all 24 test cases was 0.01 percentage points —
  floating-point noise, not a real discrepancy. Render accuracy (pin anchor position)
  matched expected screen position to within 0.01px.

The test script isn't checked into the repo (it depends on a headless-browser setup not
normally available on the field-visit devices) — reproducible from this session's log if
needed again, and worth turning into a proper regression test before the next release if
this positioning code changes again.

**Status: fixed in code, `Unverified` in the field** — the Playwright test proves the
math is now internally consistent with what a browser actually renders; it does not
replace someone opening the real app on a real phone with a real floor plan and confirming
pin placement feels right, per this file's own rule.

## Rules for this file

Update it in place. Mark an item `RESOLVED <date> — <how it was verified>` rather than
deleting it; a blocker that came back once will come back again. `Fixed` requires that
someone ran it and watched it work.

## Field test feedback — MFS Luxembourg, 08 Sep 2026 (Tuesday)

First live field test of the Internal Tool, on-site at MFS Luxembourg (4 rue Albert
Borschette), auditor Carine. Source: Jaiveer's verbal/Slack feedback the same morning,
cross-checked against the actual exports from that visit (`Site_Visit_Data.xlsx`,
`MFS_Luxembourg_site_visit_20260908.xlsx`) and two in-app screenshots of the floor plan.
Evidence below is what the exports and screenshots actually show — not yet a code-level
root cause. Move an item into "Shipping blockers" above once the code is read and a cause
is confirmed.

### CORRECTION — 11 Sep 2026

The "Pins disappeared / moved pins didn't save" entry originally here claimed the export
was missing a pin (an "extra blue pin labeled 1" visible in a screenshot). Re-examined by
zooming into the actual screenshot: that "extra pin" is the yellow **GW1** gateway pin,
sitting almost exactly behind the purple D1 display pin (0.4% apart in X) — it just looks
like a sliver of a different, unaccounted-for pin at a glance. All 7 pins (A, B, C, D, E,
GW1, D1) are present and correct in both exports. **There was no missing pin, and this
item is not confirmed by any evidence** — only the final export was available, not a
before/after snapshot, so nothing shows a pin existing and then vanishing. Leaving this
correction in place rather than deleting the original claim, per this file's own rule
about not quietly erasing a wrong entry.

The `persist()` silent-failure fix (see the "Code dive" section below) is still a
legitimate, independently-worth-having fix — a storage-quota failure should never be
invisible — but it is a plausible explanation for a reported symptom, not a confirmed one.

### Confirmed by the exported data

- **Can't export with pictures.** Both exports read `Photos Exported: 0 photos`, and every
  row's `Photo Filename` column is blank. No photos reached either export — not a
  size-warning path, a total absence. Consistent with (and possibly explains) the
  camera-roll complaint below: if photos never attach client-side, there is nothing to
  export regardless of size.
- **Missing "confidential paper" waste stream.** The `Bins` sheet only offers
  Trash / Paper-Cardboard / Compost / Glass / Recycling. "Confidential paper" only exists
  as a free-text note on station B ("2 Large are confidential paper in metal locked box"),
  never as a selectable stream. This reads as a genuine feature gap (missing stream type),
  not a bug — needs a product decision, not a code fix.

### New issue found via the exports, not originally reported

- **Two export code paths, two schemas.** `Site_Visit_Data.xlsx` and
  `MFS_Luxembourg_site_visit_20260908.xlsx` are exports of the *same* visit but use
  different sheet names and layouts (`Summary`/`Floor Plan Pins`/`Bins` vs. `Building
  Info`/`Bins`/`Field Notes`). The underlying pin/bin data matches between them, but two
  divergent export formats existing for one visit is a data-integrity risk independent of
  the field feedback above.

### Reported, not yet confirmed against data

- **Moved pins on the floor map didn't save / pins disappeared.** No direct evidence
  either way (see the CORRECTION above — the "missing pin" this was originally tied to
  wasn't actually missing). `persist()`'s silent-failure fix and the positioning subsystem
  fix (both below) are plausible contributors if either ever manifested, but neither is
  confirmed as the specific cause of what was reported here.
- **Unclear how to rename a station — RESOLVED 11 Sep 2026 (code).** Turned out to be a
  genuine gap, not ambiguous data: Gateway and Display both already supported renaming
  after creation; Station never did. Fixed by adding an inline rename field. See "Code
  dive" section below.
- **Can't add a photo to a station/gateway/display from the camera roll — RESOLVED 11 Sep
  2026 (code).** `capture="environment"` on the photo inputs forced camera-only. Fixed by
  removing it. See "Code dive" section below.
- **Pin placement on the floor map is difficult / sometimes buggy — RESOLVED 11 Sep 2026
  (code), see "Positioning subsystem" below.** Root cause found and fixed: a real
  coordinate bug, not general flakiness.
- **Exported floor map with bins doesn't match the in-app floor map — RESOLVED 11 Sep 2026
  (code), see "Design decision" and "Positioning subsystem" sections below.**

### Working hypothesis for the code dive

Three of the eight items (disappeared pin, unsaved pin move, and possibly the missing
photos) point at the same place: whatever happens to a pin or attachment between
placement/reposition and the data that export reads from. Worth tracing that save/persist
path first, rather than treating these as eight unrelated bugs.

## Code dive — 11 Sep 2026, in response to MFS Luxembourg feedback

Traced the working hypothesis from the field-test section above (pin/attachment
save-persist path) through the actual code. Four root causes were found and fixed;
three more were diagnosed but deliberately left alone this round. **All four fixes are
code-only — `Unverified` in the field per this file's own rule until someone watches them
work on a phone.**

### Fixed in code today

- **Camera roll photo picker.** `st-photo-input`, `gw-photo-input`, and
  `display-photo-input` all had `capture="environment"` on their `<input type="file">`,
  which forces mobile browsers to open the camera directly and skip the photo-library
  option entirely — exactly the reported symptom. The context-photo inputs never had this
  attribute and were unaffected. **Fix:** removed `capture="environment"` from all three;
  the native file picker now offers camera *and* library, same as context photos.
- **No way to rename a station.** Gateway (`saveGatewayRename()` + modal) and Display
  (`saveDisplay()`, inline field) both already supported renaming after creation. Station
  never did — `st.name` was set once in the creation modal and had no editable field
  anywhere in the station detail view. This was a genuine missing feature, not a
  discoverability problem. **Fix:** added an inline "Station Name" field to the station
  detail screen (`st-name`, mirroring Display's pattern exactly) and a `saveStationName()`
  function that persists and re-renders, wired into `openStation()`.
- **Missing "Confidential Paper" waste stream.** `WASTE_STREAMS` listed 12 streams with no
  confidential-paper option, forcing the free-text-note workaround seen in the MFS export.
  **Fix:** added `'Confidential Paper':'CP'` to `WASTE_STREAMS`.
- **`persist()` silently swallowed every save failure.** `catch(e){}` on the
  `localStorage.setItem` call meant that once storage filled up (base64 station/gateway/
  display photos are the obvious way this happens on a real multi-station visit), *every*
  subsequent pin move, rename, or note edit failed to save with zero feedback — the app
  looked fully functional while nothing after that point was being written. This is the
  single best explanation for "moved pins didn't save" and "pins disappeared": a pin
  placed or repositioned after the quota was hit would exist correctly in memory for the
  rest of the session, render normally, and then vanish the moment the page reloaded or
  was reopened — because it was never actually in `localStorage` to begin with. **Fix:**
  `persist()` now catches the failure, logs it, and shows a persistent red banner telling
  the user storage is full and to export immediately — instead of failing invisibly. This
  doesn't remove the storage ceiling (blocker 04, already tracked above) but it turns a
  silent data-loss bug into a visible, actionable warning.

### Diagnosed, deliberately not touched this round

- **Two export code paths, two schemas** (`doExportExcel()`/`buildAndDownloadExcel()` vs.
  `exportZipWithFloorPlans()`). Real fix is consolidating both onto one shared
  workbook-builder function; that's a refactor, not a one-line change, and risks breaking
  whichever export path isn't being actively tested — deferred rather than rushed.
- **Exported floor map doesn't match the in-app floor map — RESOLVED 11 Sep 2026 (code),
  see "Design decision" section below.** Was diagnosed here as an open question; settled
  and fixed the same day by testing directly against the real MFS Luxembourg export data
  rather than reasoning about it in the abstract.
- **No drag-to-move affordance.** `handlePlanTap()` explicitly ignores taps on an existing
  pin ("pin editing disabled"). Repositioning only works through the dedicated **📍 Move
  Pin** button on the station/gateway/display detail screen — a real, working feature, but
  easy to miss if a user's instinct is to drag the pin directly, which does nothing and
  gives no error. Worth a UX pass (e.g., tapping a pin opens its detail view instead of
  being a dead tap), not a code bug — left alone this round.

### Pathway forward

1. Get all six fixes (the original four, plus the pin-rendering and positioning-subsystem
   fixes below) in front of a phone, on a real floor plan, before the next
   Luxembourg-style visit — mark each `RESOLVED <date>` here once someone's watched it
   work, per this file's rule.
2. Decide the export-schema consolidation (still open, see below) as a design call, then
   fix it in one pass.
3. Re-run this same evidence-vs-feedback method on the next field test: pull the exports,
   diff against what was reported, before opening the code.
4. Consider turning the Playwright positioning test (see "Positioning subsystem" below)
   into a real regression test, so a future change to the coordinate pipeline gets caught
   before it ships, not after the next field visit.

## Design decision — pin rendering (live app vs. export), 11 Sep 2026

Follow-up to the "exported floor map doesn't match in-app floor map" item above. Rather
than reasoning about the CSS and canvas code in the abstract, tested directly: plotted the
real MFS Luxembourg export's stored X%/Y% coordinates (from `Site_Visit_Data.xlsx`,
`Floor Plan Pins` sheet) as plain crosshairs onto both of the visit's floor-plan
screenshots. New reusable tool for this: `Internal-Tool/tools/verify_pins_on_floorplan.py`
— point it at any export + its floor plan image and it overlays the stored pins so a
"doesn't match" complaint can be checked against real coordinates in under a minute,
instead of re-deriving this analysis from scratch each time.

**Finding:** the crosshairs landed exactly on the true pin locations in both screenshots —
dead center in one, and exactly at the tail tip of the teardrop marker in the other. That
tail-tip alignment is not a coincidence: the live CSS (`.plan-pin { transform:
translate(-50%,-100%); }`) is defined so that the stored x%/y% *is* the tail tip, by
design. **The stored coordinate data was never wrong.** The perceived mismatch was two
separate things, now disentangled:

1. **A real, fixable bug (now fixed):** `renderFloorPlanWithPins()` (the export's canvas
   renderer) drew a plain circle centered exactly on the coordinate, while the live app
   draws a bubble sitting above the coordinate with a tail pointing down to it — same
   anchor point, visibly different shape. It also colored displays blue (`#4A90E2`)
   instead of the live app's actual purple (`#9C27B0`, `.pin-bubble.display`) — a second,
   independent mismatch found the same way.
2. **A separate, still-open issue (not touched):** the Positioning subsystem's known
   37.7px Y offset and possible pan double-apply (see that section above) could still
   shift the *live* view during interactive pan/zoom. That's a real bug, but it's about
   the live renderer's screen math, not about the export, and it wasn't reproducible in
   either static screenshot tested here.

**Decision:** don't touch the live app's pin-anchor math (it's already correct, and
"fixing" working code risks the Positioning subsystem's existing fragility) or the
coordinate storage (also already correct). Instead, changed only the export's canvas
drawer to render the same bubble-and-tail shape and the same colors as the live CSS
(`.plan-pin` / `.pin-bubble` / `.pin-tail`, `INTERNAL_Site_Visit_Tool_v3.html` lines
~507-529), so a printed export looks like what the auditor actually saw on the phone.
This is a contained, canvas-only change with no effect on live rendering, storage, or the
export's data content — same bins, same coordinates, same layout, just drawn to match.

**Status: fixed in code, `Unverified` in the field** — needs someone to export a real
multi-pin visit and compare the image against the phone, same rule as everything else in
this file.

---

## Backend sync — station photo storage-crash fix (12 Sep 2026)

**Origin:** field testing hit the storage-full crash risk almost immediately — one
station photo taken on a phone was enough to exhaust `localStorage` and trip the
"Not saved" banner added earlier in this file (see "Silent save failures" above). Root
cause traced further back: `resizeAndSaveImage()` (compression) is only ever called for
the floor plan image; station/gateway/display photos go through `readAsDataURL()`
straight into state at full camera resolution, no compression at all. A one-line
compression fix would only raise the ceiling, not remove it, and a separate architecture
review (`Backend Architecture Recommendation` doc, shared 11 Sep 2026, feasibility check
from the 09 Jul 2026 "Vision Site Audit: Integration" meeting — Laurent, Romain, Lowell,
Jaiveer) had already proposed the real fix: move photos off-device into Google Drive via
an Apps Script backend, with Sheets as the structured-data store.

**POC confirmed (12 Sep 2026):** built and deployed a standalone Apps Script Web App
(`loadProject` GET, `syncFloor` POST) against a test Sheet + Drive folder, round-tripped
via a standalone test client (not the production tool) — two test stations plus one
photo written and read back cleanly. Full setup/history in
`Internal-Tool/tools/apps_script_poc/SETUP_INSTRUCTIONS.md` alongside the deployed
`Code.gs`.

**First production integration (this change), feature-flagged via `SYNC_ENABLED`:**
- On adding a station photo (`processStationPhotoData()`, both the direct-file and
  HEIC/Safari data-URL branches), the photo now syncs to Drive immediately —
  `syncStationPhotoToBackend()` — rather than waiting for any explicit "save" step.
  Chosen over floor-level or save-triggered sync because station photos are the actual
  and immediate cause of the crash; syncing anything less than "on add" leaves the
  same-size payload sitting in local storage in the meantime.
- On confirmed upload, the local base64 copy is evicted — replaced with the Drive
  thumbnail link — which is what actually frees the storage; syncing without eviction
  would not have helped at all.
- On any failure (offline, network error, bad response), the local copy is left exactly
  as it was — no data is ever lost, it just isn't freed until a later successful sync.

**Regression caught before shipping, now fixed:** both export paths
(`buildAndDownloadExcel()`, `exportZipWithFloorPlans()`) read `photo.data` expecting a
real embeddable data URL, via `collectAllPhotos()`. An evicted photo's `data` is now a
Drive link instead — undetected, this would have exported a broken image (or, for the
anchor-`download` photo links, silently failed to download with the right filename,
since the `download` attribute isn't honored across origins the way it is for a `data:`
URL). Fixed by adding a `getPhoto` action to the Apps Script backend (returns the real
bytes as base64) and a `resolvePhotoDataUrl()` step that re-fetches and reconstitutes a
real data URL for any evicted photo before either export runs, falling back to the
Drive link (degraded, not broken) if that re-fetch ever fails. `collectAllPhotos()` and
both export functions are now `async` to support this.

**Known limitations of this first slice (by design, not yet fixed):**
- Only station photos sync; gateway/display photos and the floor plan image are
  untouched (floor plan already goes through `resizeAndSaveImage()` and was never the
  crash driver; gateway/display are one-per-item, much lower volume).
- `collectAllPhotos()` re-fetches every evicted photo's bytes on every export, in
  parallel, with no batching/throttling — fine at POC scale, would need chunking for a
  building with many synced photos (same 6-minute Apps Script execution ceiling the
  original architecture doc flagged for photo uploads).
- No offline queue — if a photo fails to sync while offline, it stays local (safe) but
  there's no automatic retry when connectivity returns; the same gap already exists for
  everything in this app.
- Sync config (`SYNC_URL`/`SYNC_TOKEN`/`SYNC_PHOTOS_FOLDER_ID`) is hardcoded to the POC
  sheet/folder — no per-building configuration yet.

**Status: built, not yet field-tested.** Needs your phone, `SYNC_ENABLED=true`, and a
real station photo add, followed by an export, to confirm both the sync and the
export-resolution fallback work outside the POC test harness.

---

## Missing photo option in station creation (12 Sep 2026)

**Report:** unable to take a photo while creating a station — the "Create Station" modal
(`#modal-station`, where you name the station and pick bins) had no photo field at all.
Confirmed by reading the modal's HTML directly: the photo `<input type="file">` only
existed in the station *detail* view (opened by tapping an already-created station), not
in the creation flow. Not a bug in existing code — the feature genuinely didn't exist yet.

**Fix:** added an optional "Station Photo" field directly to the Create Station modal
(camera-roll/upload button + preview + remove, same HEIC handling as the existing station
detail photo field). The captured photo attaches to the station the moment it's created
(`confirmStationCreation()`) and — consistent with the sync-on-add behavior above — syncs
to Drive and evicts locally the same way any other station photo does. Only wired into
the main modal-based creation flow; the separate tap-to-place-pin-and-instantly-create
path (`createNewStationFromPin()`) and `duplicateStation()` don't go through this modal
and were intentionally left untouched.

**Status: built, not yet field-tested.**

---

## Offline station photo data loss (found + fixed, 12 Sep 2026)

**Found during internal testing** (a Playwright test suite was built to verify the photo
sync work above before pushing — not a field report). While writing a test for the
"add a photo while offline" case, discovered `queueOfflinePhoto()` stored only a
human-readable label (`"Station A"`) for a queued station photo — no `stationId` or
`floorId`. `syncPhotoQueue()` (the function that runs when you tap "Sync Now" or the
device reconnects) only ever actually did something for `type==='context'` entries; for
`type==='station'` entries it just counted them, cleared the entire queue, and told the
user "✅ Synced N photos!" **The station photo itself was never attached to any station —
it was silently discarded.** The app reported success while the data was gone. This
predates today's changes; unrelated to the Apps Script sync work above, but found while
testing it and int the same problem space (photo storage reliability), so fixed
immediately rather than left open.

**Second issue in the same function, same fix:** `syncPhotoQueue()` is also called
automatically by the `online` event listener every time the device regains connectivity
— including when nothing is queued, which is the common case (any wifi/cell handoff).
That path hit `alert('No photos to sync.')` every time, an unnecessary popup on ordinary
reconnects.

**Fix:**
- `queueOfflinePhoto()` now accepts an optional `meta` object (`{stationId, floorId}`),
  captured at the two station-photo call sites in `processStationPhotoData()`.
- `syncPhotoQueue()` rewritten: for a `station` entry, looks up the real station (by
  floorId+stationId, falling back to a full-floors search for any older queued entries
  that predate this fix and have no floorId) and pushes the photo into its `photos[]` —
  then, since we're back online, runs it through `syncStationPhotoToBackend()` for the
  same Drive sync/eviction treatment as any other station photo. If the station (or its
  floor) was deleted while the photo sat queued, it's now reported plainly as "could not
  be attached" rather than falsely claimed as synced. Context-photo handling is
  unchanged. An empty queue is now a silent no-op instead of an alert, fixing the
  reconnect-popup issue too.
- Unknown/future queue entry types are kept in the queue rather than silently dropped,
  so a schema change elsewhere can't quietly start losing data the same way again.

**Verified via automated test** (`Internal-Tool/tools/tests/`, mocked Apps Script
backend, no real Drive/Sheet touched): queued station photo correctly attaches on
reconnect and is then synced/evicted; a deleted-station case reports the miss instead of
a false success; empty-queue reconnect no longer alerts; context-photo path unchanged.
13/13 checks passed, plus a re-run of the 21 checks from the prior sync-feature testing
to confirm no regression there either.

**Status: fixed and tested in an automated harness. Not yet tested on a real device** —
needs someone to actually go offline, add a station photo, reconnect, and confirm it
shows up in the station's photo carousel.

**Not yet addressed (logged for later, not understood well enough yet to act on):**
a second, smaller finding from the same review — `buildAndDownloadExcel()` has no guard
of its own against the `XLSX` library failing to load; it relies on `doExportExcel()`
checking first, but `exportZipWithFloorPlans()`'s "JSZip not loaded" fallback calls
`buildAndDownloadExcel()` directly, bypassing that check. Pre-existing, not caused by
recent changes, low-probability in practice. Needs a closer look before deciding on a fix.

---

## Photo-sync concurrency bugs + offline storage crash (found + fixed, 18 Sep 2026)

Targeted code review of the photo-sync/Drive-upload feature, specifically hunting for
concurrency and high-queue-volume edge cases (prompted by: "what happens when a sync
fails, or too many photos have been queued"). Found real bugs introduced by the earlier
compression/no-eviction redesign (same day) — the local copy is no longer swapped out
after a successful sync, which quietly broke a safety check that used to prevent
duplicate work.

**1. No "already synced" guard.** Before compression, a synced photo's `data` field got
replaced with a Drive link, so re-running the sync function on it naturally no-opped (a
Drive link doesn't match the "still a raw photo" regex). Once the local copy stopped
being evicted, that check could never fire again — `data` is always a real photo now.
Any duplicate call on an already-synced photo (see #2, #3) would silently re-upload it,
creating a duplicate file in Drive.

**2. No in-flight guard.** Three separate triggers can retry the same failed photo — the
45s background retry, the `online` reconnect handler, and the manual "Sync Photos"
button — with nothing stopping them from overlapping. Two concurrent uploads for one
photo meant two Drive files, and whichever response landed last won the final status: a
slow failing duplicate could flip an already-synced photo back to `failed` and re-queue
it for another (also duplicate) retry — a loop that could repeat indefinitely.

**3. `syncPhotoQueue()` not safe to call twice concurrently.** It only reassigned
`S.photoQueue` to the leftovers at the very end, after awaiting compression for each
queued photo sequentially. Calling it again before the first run finished — plausible
right at reconnect, since the `online` listener fires it and the user might also tap
"Sync Photos" — read the same still-queued photos twice and pushed a duplicate copy onto
the station each time. The larger the queue, the longer the first run takes, the wider
this window got — directly the "too many photos queued" case.

**4. Offline queue had no compression at all.** The online-capture compression fix
(same day) only compressed photos once attached to a station; `queueOfflinePhoto()`
still wrote the full-resolution image straight to localStorage. Several photos taken in
a dead zone (a real scenario — basements, mechanical rooms) could still hit the
storage-full crash the online path was just fixed for.

**5. No cap on simultaneous retries.** A large batch of failed photos (e.g. after a long
dead zone) fired one fetch per photo at once with no limit, every 45s — enough to risk
Apps Script's per-user concurrent-execution limit, which just fails the whole burst and
repeats it next cycle without making progress.

**Fixes:**
- `syncStationPhotoToBackend()`: added an explicit `driveFileId` check that short-
  circuits (and self-heals status) for an already-synced photo, and a `syncInFlight`
  flag set for the duration of the upload so a second call for the same photo is a
  no-op instead of a second upload. Now also returns its promise chain instead of being
  purely fire-and-forget, so callers that need to (retry batching) can await it.
- `retryFailedPhotoSyncs()`: batches retries 3 at a time instead of firing all at once.
- `syncPhotoQueue()`: wrapped in a re-entrancy guard (`photoQueueSyncInFlight`) so a
  second call while one is already running is a no-op.
- `queueOfflinePhoto()`: now compresses before writing to localStorage, same as the
  online path. **Trade-off, accepted deliberately:** offline-queued photos upload at
  this compressed quality once reconnected — the original full-resolution bytes are
  never persisted, since keeping them around to preserve quality would reopen the exact
  crash this fix prevents. Online capture is unaffected and still uploads full
  resolution (the original bytes are only ever held in memory, briefly, for that case).

**Also done in the same pass (not a bug fix, requested alongside it):**
- Drive filenames now follow the same station-linked convention the app's own Excel/zip
  export already uses — `{Building}_F{floor}_{StationLetter}_Photo{n}.jpg` — instead of
  the opaque internal station id. Falls back to the old naming if an older client
  doesn't send the new fields. **Requires a manual step to take effect**: paste the
  updated `Code.gs` into the Apps Script editor and create a new deployment version
  (Manage deployments → Edit → New version) — script property changes apply instantly,
  but code changes to the web app itself do not, same as the `getPhoto` action earlier.
- Added a "Photo Upload Queue" modal (📤 button, was previously a blind "Sync Photos"
  action): lists every photo not yet confirmed on Drive — offline-queued and
  attached-but-pending/failed — with a thumbnail, station/floor, live status, and a
  per-photo manual retry button. Updates live while open as sync attempts resolve.
- Re-verified the live Apps Script connection: token accepted, `loadProject`-style GET
  and `getPhoto` both reachable and returning clean expected responses (not auth/network
  failures) — environment is stable as of this check.

**Related, out of scope for this pass (logged, not fixed):** context/building photos
(separate from station photos — not part of the Drive-sync feature at all) are still
stored uncompressed in both `S.contextPhotos` (online) and the offline queue's `context`
entries, carrying the same storage-crash risk this whole effort has been fixing for
station photos. Worth a follow-up if context photos turn out to cause the same crash in
the field.

**Status:** fixed, syntax-checked, and manually traced through every path (fresh
capture, retry, concurrent-retry, offline queue, deleted-station-during-retry). Not
tested on a real device — automated browser testing was attempted again and hit the same
environment walls as before (no root to install Chromium's system libraries in this
sandboxed shell; jsdom hangs fetching external resources). Needs on-device testing:
back-to-back photos online, a stretch offline with several photos then reconnecting, and
a deliberately-broken sync (e.g. wrong token again) to confirm the retry queue and modal
behave as expected without creating duplicate Drive files.

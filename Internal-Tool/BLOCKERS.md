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

## Positioning subsystem — open items

From `../_Knowledge/01_Coordinate_And_Pin_System.md`. Relevant if pin accuracy becomes a
field complaint:

- A constant **37.7px Y offset** (X error exactly 0) — never resolved.
- A 0%-tap-accuracy aspect-ratio transposition with no recorded follow-up.
- ~11.5px of pan at zoom 1.0, where there should be none.
- `displayedWidth` is defined three incompatible ways across the code, so pan bounds and
  render can disagree on non-square images.
- `renderPins()` and `updateFloorPlanTransform()` may both apply the pan — a possible
  double-apply that no document reconciles.

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

### Confirmed by the exported data

- **Pins disappeared / moved pins didn't save.** One screenshot shows an extra blue pin
  labeled "1" near station B / display D1 that does **not** appear in either export's pin
  table (`Floor Plan Pins` / `Field Notes` both list only A, B, C, D, E, GW1, D1 — seven
  pins, not eight). Something placed in-app did not survive to export. This is the same
  shape of failure as blocker 05 (Add Station/Gateway/Display leaves a pin stuck in a
  pending/positioning state) — plausibly the same underlying bug, seen live for the first
  time.
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

- **Unclear how to rename a station.** Stations A and B show real names ("Cuisine",
  "Printing area"); C, D, E still show their raw letter as the location name. Ambiguous
  from the data alone whether rename is broken/undiscoverable or these three were
  deliberately left as unnamed open spaces (their notes say individual bins should be
  consolidated) — needs a code check.
- **Can't add a photo to a station/gateway/display from the camera roll** — picker only
  offers "take a picture." Can't verify from the exports (zero photos either way), but
  consistent with the zero-photos finding above.
- **Pin placement on the floor map is difficult / sometimes buggy** — general friction and
  intermittent misbehavior placing pins. May overlap with blocker 05 and the positioning
  subsystem's known offset/pan issues (see "Positioning subsystem" below).
- **Exported floor map with bins doesn't match the in-app floor map.** The coordinate data
  itself is internally consistent between both export formats (same X/Y to 2 decimals),
  so this isn't a coordinate-transform mismatch — the missing "1" pin above is itself an
  app-vs-export mismatch, just not the coordinate kind this item may have meant. Needs
  clarification on what exactly looked different.

### Working hypothesis for the code dive

Three of the eight items (disappeared pin, unsaved pin move, and possibly the missing
photos) point at the same place: whatever happens to a pin or attachment between
placement/reposition and the data that export reads from. Worth tracing that save/persist
path first, rather than treating these as eight unrelated bugs.

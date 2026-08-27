# BLOCKERS — INTERNAL Site Visit Tool

**As of 27 Aug 2026.** Primary source: `READINESS_AND_NEXT_STEPS_2026-08-26.html`
(the most reliable document in the project — the only one that contradicts its own
"production ready" claims). Cross-checked against `../_Knowledge/`.

> **Headline:** not field-ready today; roughly **1.5 days of work away**. The app has a
> working end-to-end capture flow and a built email export. It is not broken — it is
> unfinished in four specific places, and two of them would fail **silently on the day**,
> after the auditor has already done the work.
>
> **None of the four needs a backend decision.**

## Shipping blockers

### 01 · The email key is blanked at build time — BLOCKER · ~10 min
`netlify.toml` sets `SENDGRID_API_KEY = ""` under `[env.production]`. An empty value
**overrides** whatever is set in the hosting dashboard. Export would fail every time and
the auditor would see a generic error after a full day of capture.
**Fix:** delete the two env lines from the deploy config; set the key in the dashboard only.
*Verified as real against the actual `netlify.toml`.*

### 02 · No evidence the site was ever published — BLOCKER · ~30 min
The folder has the deploy config and the serverless function, but no version control and
no link to a live site. Nobody has a URL to hand Carine. **Everything else is moot until
this is confirmed.**
**Fix:** confirm or create the deployment, then post the URL in channel.

### 03 · A large visit will exceed the export size limit — HIGH · ~half day
Photos compress to ~150KB each; email encoding adds ~a third. The hosted function accepts
~6MB per request — roughly **30 photos**. A multi-floor site goes past that, and the
failure lands at the end of the day when the data is already captured.
**Fix:** export per floor rather than per visit, and warn the auditor at the threshold.

### 04 · Photos sit in browser storage with a hard ceiling — HIGH · covered by 03
Photos are held in local browser storage, capped near 5–10MB. This one bites **mid-visit**
and can lose captured work.
**Pilot fix:** export after each floor, which clears the buffer.
**Proper fix:** the backend decision, deliberately parked.

> Note: the documents disagree on the photo ceiling — 5–8, 10–15, 15–20 and ~50 photos all
> appear as "the limit" across four documents. Only ~30 (the 6MB request cap) is derived
> from a measured figure. Treat the rest as estimates. See `../_Knowledge/04_Architecture_And_Storage.md`.

## Path to Luxembourg

The app runs **alongside** the PowerPoint workflow, not instead of it. The deck stays the
system of record, so if the app fails nothing is lost and we still learn something.

| When | What | Gate |
|---|---|---|
| This week | Blockers 01 + 02, then full workflow on a phone against a real floor plan with 15+ photos | A working URL, posted in channel |
| Week of 1 Sep | Blocker 03, plus a 20-min walkthrough with Carine and a one-page fallback card | Per-floor export working |

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
- **No source control.**

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

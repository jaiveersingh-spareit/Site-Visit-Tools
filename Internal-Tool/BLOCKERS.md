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

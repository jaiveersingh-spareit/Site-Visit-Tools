# Bug Patterns & Fixes — Site Visit App

Scope: the non-coordinate bug/fix history. Pin/zoom/pan coordinate math is covered in a separate
knowledge file; it appears here only where a doc mixes it with other findings.

Every claim below cites the source document it came from. Where documents disagree, the
disagreement is stated rather than resolved.

---

## 1. Recurring failure patterns

These are the bug classes that bit the project more than once. They are all consequences of the
same architecture: one HTML file, imperative DOM updates, `onclick=` string handlers, no build
step, no linter, no module boundaries — so nothing fails at author time and most things fail
silently at runtime.

### 1.1 Handler string references a function name that does not exist

**Shows up as:** a button that does nothing at all. No visible error unless DevTools is open.

**Instances:**
- "Add Bin" button called `addBin()` but the function is named `addSelectedBins()`
  (BUG_FIXES_SUMMARY.md, Bug 2, line 1082 of the form). Blocked adding multiple bins entirely.
- Confirmed again by static analysis in DIAGNOSTIC_REPORT.md ("Bug Fix #2: 'Add Bin' Function Name").

**Why here:** `onclick="addBin()"` is a *string* in HTML. Nothing resolves it until a human taps
it. Renaming a JS function never touches the HTML that calls it.

**Prevention:** DIAGNOSTIC_REPORT.md's approach — static sweep that every `onclick="fn(` name has a
matching `function fn(` definition. BUG_FIXES_SUMMARY.md lists "All function names match their
definitions" as an explicit code-quality gate.

### 1.2 Code references a DOM element ID that does not exist

**Shows up as:** *unrelated* features break. This is the most damaging pattern in the history.

**Instance:** `document.getElementById('inp-employees').value = S.employees||''` at line 1087 —
`inp-employees` exists nowhere in the HTML (BUG_FIX_REPORT.md, Bug #1). The resulting TypeError was
swallowed by a try/catch during init, leaving the app half-initialised. The visible symptom was
the *waste-stream selection modal not opening*, which has no relationship to an employees field
(BUG_FIX_REPORT.md, "Why This Broke the Modal"). Two whole documents — DEBUG_STREAM_MODAL.md and
STREAM_SELECTION_DEBUG.md — were spent auditing the modal path (button → `openStreamSelectHome()` →
`openModal()` → `renderStreamSelector()` → `WASTE_STREAMS`) and found every link correct, because
the fault was elsewhere.

**Second instance, same root:** `clearSession()` iterated a hardcoded ID list including
`inp-employees` and called `.value=''` unguarded, so clearing the session threw
(BUG_FIX_REPORT.md, Bug #2).

**Why here:** HTML and JS are edited independently in one file with no cross-checking, and init is
wrapped in a try/catch that hides the failure.

**Prevention (BUG_FIX_REPORT.md "Prevention Tips"):** null-check or optional-chain every
`getElementById`; never blanket-catch during init; keep an ID inventory when deleting HTML.
The `clearSession()` fix is the pattern to copy:
```js
['inp-building','inp-address','inp-hauler','inp-auditor','inp-contact-notes']
  .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
```

**Corollary — the debugging cost.** Because the symptom was remote from the cause, the team wrote a
console diagnostic script (DEBUG_STREAM_MODAL.md) that probes existence of the modal element, the
button, `openModal`, `renderStreamSelector`, `WASTE_STREAMS`, and `S` before concluding anything.
That script is the reusable asset from this episode, not the fix itself.

### 1.3 Navigation to a screen ID that does not exist

**Shows up as:** blank page.

**Instance:** positioning functions called `showS('s-floor-detail')`; the real screen is `s-floor`
(CODE_LINKAGE_VERIFICATION.md). Five call sites, in two files. Real screens are
`s-home`, `s-floors`, `s-floor`, `s-station`, `s-gateway`, `s-display`.

**Why here:** same as 1.2 — string IDs, no enumeration, `showS()` presumably hides all screens then
fails to find the target, leaving nothing visible.

**Prevention:** enumerate legal screen IDs in one constant and have `showS()` warn on an unknown ID.
CODE_LINKAGE_VERIFICATION.md's method — trace each user path end to end and check every referenced
symbol — is what caught it.

### 1.4 State initialised with the wrong shape in one entry path

**Shows up as:** the feature works when you reach it one way and silently fails the other way.

**Instance:** `openAddStationModal()` set `state.currentPhotosTemp = []` (array) while
`openEditStationModal()` set it to `{ stationPhoto, binPhotos }` (object). `promptPhotoUpload()`
then does `state.currentPhotosTemp.stationPhoto = {...}` — assigning a named property to an array,
so the photo is never stored and photo-required validation fails. Editing a station worked; adding
one did not (ADD_STATION_BUG_REPORT.md).

**Why here:** no schema, no constructor. Each modal opener re-initialises shared temp state by hand.

**Prevention:** one factory (`function newPhotosTemp(){ return {stationPhoto:null, binPhotos:[]}; }`)
called from every entry path. ADD_STATION_BUG_REPORT.md's fix hardcodes the object literal in the
add path, which fixes the instance but leaves the pattern.

**Note:** this bug is reported against `site-visit-form-no-zoom.html`, which uses a `state.` object,
not the `S` object used by the main files. See §5.1 on file divergence.

### 1.5 Two entry paths to the same object, only one of them initialised

**Shows up as:** an empty field or a missing default when the user takes the "other" route.

**Instances (VERSION_3_AUDIT.md, fixes 1 and 2):**
- Gateway labels did not auto-generate via the "+ Add Pin" workflow because `selectGateway()`
  omitted the label-generation logic that `openAddGateway()` had.
- Identical bug for displays: `selectDisplay()` vs `openAddDisplay()`.

**Instance (CODE_FIX_VERIFICATION.md, Fix #4):** `curDisplayId` was never declared alongside
`curFloorId, curStationId, curGatewayId`, so `gDisplay()` could not resolve.

**Why here:** every feature has grown a second "pin-first" entry path next to the original
"list-first" path, and the two are maintained by copy-paste.

**Prevention:** both entry paths must funnel into one creation function. VERSION_3_AUDIT.md's
"Unified Object Type UX" (`positionStationNow()` / `positionGatewayNow()` / `positionDisplayNow()`)
is the direction of travel.

### 1.6 A new object type added to some code paths but not all

**Shows up as:** the third type (Display) half-works — creatable but invisible, or undeletable.

**Instances (CODE_FIX_VERIFICATION.md):** `confirmPinLocation()` handled only stations;
`renderPins()` had no display loop; `deletePin()` had no `type==='display'` branch and never called
`renderDisplays()`. Also noted in CODE_LINKAGE_VERIFICATION.md: `renderFloorDetail()` calls
`renderPins()`, `renderStations()`, `renderGateways()` but **not** `renderDisplays()`.

**Why here:** station/gateway/display logic is triplicated rather than parameterised.

**Prevention:** the same fix CODE_HYGIENE_REPORT.md §4 recommends — one
`startPositioning(type, id)` and one type-driven render loop instead of three near-identical bodies.

### 1.7 A "fix" that loops the user back into the modal they came from

**Shows up as:** button appears dead; actually it re-opens the same modal.

**Instance:** "Create New" in the station-link modal called `pinAddStation()`, which re-checks for
existing stations and re-shows the link modal (BUG_FIXES_SUMMARY.md, Bug 1). Fixed by inlining the
target sequence into the onclick: close both modals, set the next letter, populate the location
dropdown, open `modal-station`.

**Why here:** the "smart" entry function is reused as a plain navigation action; its branching then
fires again.

**Prevention:** separate "decide where to go" from "go there". Note the fix inlined five statements
into an HTML attribute — see §5.2 for the debt that created.

### 1.8 Missing `persist()` / missing re-render after a state change

Called out as a standing pitfall in the project's own CLAUDE.md ("Common Pitfalls": forgetting
`persist()` → data disappears on reload; not calling render functions → DOM does not update).
No document in this set records a specific shipped instance of it, so it is listed here as a
documented hazard rather than an observed bug. The delete-photo functions in BUG_FIXES_SUMMARY.md
were written deliberately against it: gateway/display deletes persist, bin-photo deletes are
explicitly session-only and do not.

### 1.9 The test is wrong, not the app

**Shows up as:** a red test run that triggers a hunt for a bug that does not exist.

**Instance:** first run of the comprehensive suite scored 14/22 (63.6%). TEST_FAILURE_ANALYSIS.md
concluded all 8 failures were test defects: inverted pan-clamp assertions (comparing raw pan instead
of clamped pan), a bounds formula that ignored image aspect ratio, and false-negative string
matching on code presence. Its explicit conclusion: "No code changes needed in application."

**Why it matters:** the same document predicts "High (95%+)" confidence of a 100% rerun but no
document in this set records the rerun result. See §5.

---

## 2. Bug ledger

| Bug | Root cause | Fix | Status | Source doc |
|---|---|---|---|---|
| "Create New" in station-link modal loops back to itself | Button called `pinAddStation()`, which re-runs the existing-station check | onclick inlined: close link modal + pin-type modal, set `new-st-letter` from `getNextAvailableLetter()`, `populateLocationDropdown()`, open `modal-station` | Fixed (code verified statically; user verification listed as pending) | BUG_FIXES_SUMMARY.md; DIAGNOSTIC_REPORT.md |
| "Add Bin" button does nothing | onclick called `addBin()`; function is `addSelectedBins()` | Renamed the call site | Fixed | BUG_FIXES_SUMMARY.md; DIAGNOSTIC_REPORT.md |
| No way to delete a bin / gateway / display photo | Feature never existed | Added `deleteBinPhoto(idx)`, `deleteGatewayPhoto()`, `deleteDisplayPhoto()` plus three delete buttons; all with confirm dialogs; gateway/display persist, bin photos are session-only | Fixed | BUG_FIXES_SUMMARY.md; DIAGNOSTIC_REPORT.md |
| Waste-stream modal never opens | Init threw on `getElementById('inp-employees')` (element absent); error swallowed by try/catch, leaving app half-initialised | Removed the line | Fixed in both `Spare-it_site_visit_form.html` and `Spare-it_site_visit_app.html` | BUG_FIX_REPORT.md |
| `clearSession()` throws | Unguarded `.value=''` over a hardcoded ID list containing the absent `inp-employees` | Dropped the ID and added `if(el)` guard | Fixed in both files | BUG_FIX_REPORT.md |
| Adding a station photo fails; edit path works | `currentPhotosTemp` initialised as `[]` in add path, `{}` in edit path | Initialise as `{stationPhoto:null, binPhotos:[]}` in `openAddStationModal()` | Fix specified; no doc confirms it was applied — ADD_STATION_BUG_REPORT.md offers it as "Option 1 / Option 2" | ADD_STATION_BUG_REPORT.md |
| Blank page when positioning a station/gateway/display | `showS('s-floor-detail')` — screen does not exist | 5 call sites changed to `showS('s-floor')` in both form.html and UPDATED.html | Fixed; testing checklist unchecked | CODE_LINKAGE_VERIFICATION.md |
| `confirmPinLocation()` ignored gateways and displays | Function only ever looked up `gF().stations` | Three explicit branches (lines 2669–2756) | Fixed | CODE_FIX_VERIFICATION.md |
| Displays never drawn on the floor plan | `renderPins()` had no display loop | Display loop added (3141–3146) | Fixed | CODE_FIX_VERIFICATION.md |
| Display pins could not be deleted | `deletePin()` lacked `type==='display'`; no `renderDisplays()` call | Branch + render call added | Fixed | CODE_FIX_VERIFICATION.md |
| `gDisplay()` unusable at startup | `curDisplayId` never declared | Added to the `let curFloorId=...` declaration (line 1459) | Fixed | CODE_FIX_VERIFICATION.md |
| Gateway/display "pin-first" flow lost the tapped coordinates | Intent not carried through `pinAddGateway()` / `pinAddDisplay()` | Coordinates preserved via parameter (3113–3115) | Fixed | CODE_FIX_VERIFICATION.md |
| Gateway/display created with no way to position it | Success modals had no "Position Now" option; no position-prompt modal | Position-prompt modals (1292–1320) + "Position Now" buttons (1231, 1250) | Fixed in the v3 line — then deliberately reversed in the MVP line, see below | CODE_FIX_VERIFICATION.md vs FIXES_APPLIED_MVP.md |
| Gateway/display labels blank when created via "+ Add Pin" | `selectGateway()` / `selectDisplay()` skipped the label init that `openAddGateway()` / `openAddDisplay()` do | Label generation added to both (lines 4173–4217) | Fixed, marked VERIFIED | VERSION_3_AUDIT.md |
| Zoom modal appears when adding a station/gateway/display (MVP) | Custom zoom UI conflicted with the intended native pinch-zoom UX | Zoom bar HTML, zoom modal HTML, ~55 lines of zoom CSS removed; `setZoomLevel()`, `resetFloorPlanZoom()`, `updateZoomDisplay()` neutered; `floorPlanZoom` commented out and its 21 references replaced with the literal `1` | Fixed in `Spare-it_site_visit_form_MVP.html` only | FIXES_APPLIED_MVP.md; CODE_AUDIT_MVP_COMPLETE.md |
| Positioning-confirmation modal after placing a gateway/display pin (MVP) | Extra confirmation step on top of an already-placed pin | `createNewGatewayFromPin()` / `createNewDisplayFromPin()` now create at pin coords, auto-number `GW1..` / `D1..`, skip the modal, return to `s-floor` | Fixed in MVP file | FIXES_APPLIED_MVP.md; CODE_AUDIT_MVP_COMPLETE.md |
| Stream size buttons unresponsive | Reported by testers | No fix — MVP file already had `setStreamSize()` (4779), `renderStationBinsUI()` (4695), `toggleStreamInclusion()` (4757) | Not reproduced; declared "already working" without a test result | FIXES_APPLIED_MVP.md; CODE_AUDIT_MVP_COMPLETE.md |
| "Indicator appears instead of pin" (mobile) | Unknown | None | **Open** — logged as "N/A / need to verify on mobile — may be visual feedback" | FIXES_APPLIED_MVP.md |
| Station auto-lettering assigns duplicates | No uniqueness check | `isLetterUsed()` + alert on collision | Fixed | IMPLEMENTATION_STATUS_ANALYSIS.md (row 3) |
| "Begin Site Visit" button dead on mobile | Single event binding | Four fallback bindings on `btn-start-visit` (click, touchend, plus listeners) | Fixed | IMPLEMENTATION_STATUS_ANALYSIS.md (row 2) |
| Bin/floor subtitle counts stale until reload | Counts computed once, not re-rendered | `renderFloors()` re-invoked after every floor/station/bin mutation | Fixed | IMPLEMENTATION_STATUS_ANALYSIS.md (row 4) |
| Station letter fixed after creation | Letter written once at creation, no edit affordance | Partially addressed later by 2A: field is readonly with a `[✎ Edit]` toggle (`toggleEditStationLetter()`) at *creation* time; still not editable post-creation | **Open** for post-creation editing | IMPLEMENTATION_STATUS_ANALYSIS.md (rows 9, 12); SPARE-IT_APP_UPDATE_SUMMARY.md |
| Occupancy/Employees field at building level, ops want floor level | Design decision | None | **Open** | IMPLEMENTATION_STATUS_ANALYSIS.md (row 8) |
| Inconsistent navigation (back arrow vs "Edit Info") | Accretion | None | **Open — explicitly "Not Fixed"** | IMPLEMENTATION_STATUS_ANALYSIS.md (row 14) |
| Pins moveable after placement? | Drag handlers exist (`handlePinDrag`, `handlePinRelease`) but scope unclear | None | **Unverified** — needs mobile test | IMPLEMENTATION_STATUS_ANALYSIS.md (row 10) |
| Station created without a pin has no way to add one later | Unclear whether the affordance exists | None | **Unverified** | IMPLEMENTATION_STATUS_ANALYSIS.md (row 11) |
| Comprehensive test suite: 8/22 failures | Test-side defects (inverted clamp assertions, aspect-ratio-free bounds formula, brittle string matching) | Rewrote as `CORRECTED_PAN_BOUNDS_TEST_SCRIPT.js` | **Unverified** — corrected suite's actual result is not recorded anywhere in these docs | TEST_FAILURE_ANALYSIS.md |

Team-feedback changes that are not bug fixes but changed behaviour, recorded here because later
bugs depend on them (SPARE-IT_APP_UPDATE_SUMMARY.md, TEAM_FEEDBACK_CHANGES_IMPLEMENTED.md, May 15):
2A auto-generated readonly station letter with an Edit toggle; 2B removal of the Location/Name
dropdown and of `populateLocationDropdown()` and `showCustomLocationInput()`; 2C `addStation()`
drops location validation and the `location` field; 2D bins auto-created for every selected waste
stream at "Medium" scale, with `removeStreamFromBin()` to drop one.

---

## 3. Code hygiene findings

Source: CODE_HYGIENE_REPORT.md (June 10, full 6,127-line audit), VERSION_3_AUDIT.md (June 11),
CODE_AUDIT_MVP_COMPLETE.md (June 23).

| Finding | Detail | Cleaned up? |
|---|---|---|
| 100+ `console.log` statements in production code | Heaviest in the render pipeline (1698, 3500, 3515–3520), init (2160–2216, 11+), form validation (2487–2604, 30+), highlight positioning (3415–3468). Recommendation: an env-gated `debugLog()`. Est. 1.5h | **No.** Still listed as Medium debt. VERSION_3_AUDIT.md reframes the same logging as a *positive* ("Console Logging: Comprehensive ✅") — see §5.3 |
| Duplicate state objects | `baseContainerWidth` / `baseContainerHeight` duplicate `floorPlanDisplayState.containerWidth/Height` (lines 1655–1656, 1669–1678, 1706–1707). Proposed single `floorPlanState` object. Est. 2h, Medium risk | **No** |
| Duplicate positioning setup code | `startStationPositioning()`, `startStationPositioningForNewStation()`, `startGatewayPositioningForNewGateway()`, `startDisplayPositioningForNewDisplay()` — ~21 identical lines each (5389–5420, 5448–5477, 5502–5531). Proposed `startPositioning(type, id)`. Est. 1.5h, ~60 LOC saved | **No** |
| Unused / redundant variables | `isRepositioning` (1644) — redundant with the per-type positioning flags; `stationCreationBins` (1645) — declared, barely used | **No.** Deferred to "next refactoring cycle" |
| Obsolete comment block | Lines 4257–4259: `// ── REMOVED OLD DUPLICATE renderPins FUNCTION ──`, noting the old copy used an incorrect formula and caused pin-movement bugs | Comment retained; the duplicate function itself was removed earlier |
| No coordinate-system documentation | Four coexisting spaces (screen/CSS, image %, image px, container viewport) with no central explainer | Partially — CODE_HYGIENE_REPORT.md itself contains the formula guide, and CLAUDE.md later absorbed it |
| Orphaned modal `modal-position-new-gateway` (HTML 1473–1485) + `startGatewayPositioningForNewGateway()` (5750–5775) | Superseded by `positionGatewayNow()` in `modal-gateway-added`; flagged HIGH priority "remove before production" | **Not confirmed removed.** No later doc records the deletion |
| Orphaned modal `modal-position-new-display` (HTML 1489–1500) + `startDisplayPositioningForNewDisplay()` (5777–5802) | Superseded by `positionDisplayNow()` in `modal-display-added`; flagged HIGH priority | **Not confirmed removed** |
| Placeholder/dead comments around line 4949–4950 | Low priority | **No** |
| Zoom subsystem (MVP line only) | 1 controls bar, 1 modal, ~55 lines CSS, 3 functions, 1 state var, 21 references, 2 init calls | **Yes**, in `Spare-it_site_visit_form_MVP.html`. Audit confirms the 5 surviving "zoom" mentions are comments or test-mode UI only. Not applied to the other HTML files |
| Magic constants worth naming | Coordinate tolerance ±2px (3534, 3578); max pan = half overflow (3042); zoom presets `[1.0,1.25,1.5,1.75]` (3177); base-container cache written once at init and never refreshed (1694) | **No.** The last one was later found to be an actual defect — VERSION_3_AUDIT.md fix 4 added cache invalidation in `setZoomLevel()` and `resetFloorPlanZoom()` |

Hygiene roadmap as written (CODE_HYGIENE_REPORT.md): Phase 1 logging (1–2h), Phase 2 state
consolidation + positioning factory + docs (2–3h), Phase 3 comments and unused vars (1h). Total
6–8h. Nothing in the later docs records any phase being executed.

---

## 4. Contradictions between documents

**4.1 Does the Display feature exist?**
TEAM_FEEDBACK_CHANGES_IMPLEMENTED.md (May 15) declines change 3 because "the Display/Displays
feature does not currently exist in the app". FEATURE_VERIFICATION_ANALYSIS.md (May 8, one week
*earlier*) lists Display Assets as "IMPLEMENTED & WORKING" with five named functions, a
`display-notes` field, `startDisplayPositioning()`, `renderDisplays()`, and Excel export columns.
Most likely explanation: the two docs are describing different HTML files (see §5.1), but neither
says which. Do not trust either statement without checking the specific file.

**4.2 Was the "Create New" fix still valid after May 15?**
BUG_FIXES_SUMMARY.md (May 8) fixes the Create-New loop with an onclick that calls
`populateLocationDropdown()`. SPARE-IT_APP_UPDATE_SUMMARY.md and TEAM_FEEDBACK_CHANGES_IMPLEMENTED.md
(May 15) both state `populateLocationDropdown()` was **removed** as part of change 2B. If the May 8
onclick survived into the May 15 file, it now calls a deleted function — reinstating pattern §1.1 on
top of the fix for §1.7. No document checks this. **Flagged as a probable latent regression.**

**4.3 Console logging: debt or feature?**
CODE_HYGIENE_REPORT.md (June 10) calls 100+ log statements "production code bloat", Medium
priority. VERSION_3_AUDIT.md (June 11) scores "Console Logging: Comprehensive ✅" in its quality
table. Same codebase, one day apart, opposite verdicts.

**4.4 Positioning-confirmation modals: added, then removed.**
CODE_FIX_VERIFICATION.md (June 9) records adding gateway/display position-prompt modals and
"Position Now" buttons as fixes #5–#8. FIXES_APPLIED_MVP.md (June 23) records *removing* the
positioning modal from the gateway and display creation flows as fixes #3–#4. Both are correct
within their own file lineage — this is a product-direction reversal (v3 confirm-then-place vs MVP
place-immediately), not a regression, but a reader comparing the two will see contradictory
"fixed" claims.

**4.5 Dead code: to delete, or to refactor?**
CODE_HYGIENE_REPORT.md (June 10) treats `startGatewayPositioningForNewGateway()` /
`startDisplayPositioningForNewDisplay()` as *live* duplication to be folded into a factory.
VERSION_3_AUDIT.md (June 11) treats the same two functions as *dead code to delete*. Deleting is
correct if the orphaned modals are their only callers; the two docs never reconcile.

**4.6 Doc-level typo worth knowing.** FIXES_APPLIED_MVP.md Fix #3 shows the gateway cleanup as
`mime = false;` where Fix #4 shows `pinMode = false;` for the display path. Almost certainly a
transcription error in the document, but if `mime = false` reached the source it would create a
global and leave `pinMode` stuck true. Verify against the MVP file before trusting either.

---

## 5. Still open / unverified

This is the section that matters. Everything below is either unresolved in the docs or asserted
without evidence.

**5.1 Five divergent copies of the app, no reconciliation record.**
The docs modify, variously: `Spare-it_site_visit_form.html`, `Spare-it_site_visit_app.html`,
`Spare-it_site_visit_form_UPDATED.html`, `Spare-it_site_visit_form_MVP.html`, and
`site-visit-form-no-zoom.html`. BUG_FIX_REPORT.md and CODE_LINKAGE_VERIFICATION.md explicitly apply
the same fix twice, to two files. FIXES_APPLIED_MVP.md applies zoom removal to MVP only.
ADD_STATION_BUG_REPORT.md targets a file using a `state.` object where the others use `S`.
**No document states which file is canonical, or that fixes were back-ported across the set.**
Any fix listed as "Fixed" above should be read as "fixed in the file that doc names".

**5.2 Business logic living inside HTML `onclick` attributes.**
The Create-New fix (BUG_FIXES_SUMMARY.md) put five sequenced statements into a single onclick
string. Same for several modal buttons in CODE_FIX_VERIFICATION.md and CODE_LINKAGE_VERIFICATION.md.
Unlintable, untestable, and the direct cause of patterns §1.1 and §4.2. No doc proposes fixing this.

**5.3 Every hygiene item from June 10 is still open.**
Logging, duplicate state objects, the 4× positioning duplication, `isRepositioning`,
`stationCreationBins`, obsolete comments. 6–8 estimated hours, no evidence of execution.

**5.4 VERSION_3_AUDIT.md's pre-production checklist is entirely unchecked.**
Four dead-code deletions (2 modals, 2 functions), the full device matrix (iPhone Safari, iPhone
Chrome, Android Chrome), export testing, offline queue testing, doc updates, version bump,
production build rename. Every box `[ ]`. The audit nonetheless recommends production deployment
"with completion of the dead code removal checklist above". No later document closes it.

**5.5 Verification is overwhelmingly static, not executed.**
DIAGNOSTIC_REPORT.md is explicit: static code analysis complete, "Confidence Level: 95% (dynamic
testing required for final sign-off)", with five dynamic tests marked ⏳. CODE_FIX_VERIFICATION.md
claims "Confidence: HIGH (100%)" but its method line reads "Automated Code Analysis" — i.e. reading
the source, not running it. CODE_AUDIT_MVP_COMPLETE.md marks gateway and display flows "✅ Verified
working" in the same document that lists mobile testing as a next step. Several of these "verified"
claims are verification that the code *says* the right thing.

**5.6 Test suites with no recorded final result.**
TEST_FAILURE_ANALYSIS.md predicts the corrected suite will pass 20/20 and lists the expected
output verbatim — but no document records an actual corrected run. BUG_FIXES_SUMMARY.md's testing
checklist (all three bugs) is unchecked. TESTING_STREAM_MODAL_FIX.md is a 9-test protocol with every
status left as `✓/✗`. CODE_LINKAGE_VERIFICATION.md's checklist is unchecked. The stream-modal fix in
particular has no evidence of ever being confirmed by a human clicking the button.

**5.7 Bugs never diagnosed.**
- "Indicator instead of pin" on mobile — FIXES_APPLIED_MVP.md, status literally "N/A ... may be
  visual feedback".
- Stream size buttons unresponsive — reported by testers, never reproduced; closed as "already
  working" on the strength of the functions existing.

**5.8 Feedback-tracker items still open (IMPLEMENTATION_STATUS_ANALYSIS.md, June 5).**
Not fixed: UI navigation inconsistency (row 14, "Not Fixed"); station name/letter not editable
post-creation (row 12, "Not Implemented"); occupancy at building rather than floor level (row 8).
Unverified: pin drag on existing pins (row 10); adding a pin to an already-created station (row 11);
export format completeness for pin coordinates, scale sizes and accessories (row 7).
Deferred/backend: shared-drive photo integration, bulk platform upload, location dropdown sourced
from platform data, VISION-vs-VISION+TRACK flow differences, batch-import field coverage.

**5.9 Open questions the docs pose and never answer.**
FEATURE_VERIFICATION_ANALYSIS.md ends with five questions to the team — visit-level vs per-station
observations field; whether photo storage is manual export or backed by Drive; whether exports now
carry all fields for batch import; how a user overrides an auto-assigned station letter; whether all
required fields or only critical ones get a red asterisk. None is answered in any later document
in this set. The same doc flags red-asterisk coverage as "PARTIALLY IMPLEMENTED — need to verify
which fields have asterisks"; IMPLEMENTATION_STATUS_ANALYSIS.md later marks it flatly "Done"
without stating that the gap was closed.

**5.10 The tracker itself was unreliable.**
FEATURE_VERIFICATION_ANALYSIS.md found five features marked "Deferred to V2" that were in fact
shipped and working (contact notes, station notes, gateway rename, display assets, markup floor-plan
upload), moving true completion from a reported 71% to roughly 82%. Status fields in the tracker
were not evidence of code state; code inspection was. Assume the same is true of any status claim
in this knowledge base that is not backed by a cited line number.

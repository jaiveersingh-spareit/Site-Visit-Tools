# Testing Playbook — Site Visit App

Scope: what testing this project actually consisted of, what it caught, what it
missed, and what is worth keeping. Every claim below cites the file it came from.
Where sources disagree, the disagreement is flagged rather than resolved.

---

## 0. Read this first: the testing corpus is larger than the app

There are 11 `.js` test scripts, 5+ `.html` test/diagnostic tools, and roughly 25
testing documents in this folder — for a single-file app. Most of them were
written on **two days** (June 9–10, 2026) and target **one subsystem** (floor-plan
zoom/pan pin coordinates) that was **deleted three weeks later**:

> "ALL ZOOM CODE REMOVED - PRODUCTION READY … 21 replacements made throughout file"
> — `CODE_AUDIT_MVP_COMPLETE.md` (June 23, 2026, on `Spare-it_site_visit_form_MVP.html`)

That single fact should govern how much weight you give the rest of this corpus.
See §7.

---

## 1. What to run before any deploy

The corpus proposes several competing pre-deploy rituals. They range from
"5–10 minutes" (`TESTING_GUIDE.md`) to "~75 minutes"
(`COMPLETE_TESTING_PROTOCOL.md`) to "2–3 hours recommended"
(`TESTING_INSTRUCTIONS_v3.0.md`). The opinionated minimum that reflects what
actually caught bugs:

### Step 1 — Automated hygiene sweep (3 min, desktop Chrome)
Open the deploy file, F12 → Console, paste `BROWSER_CONSOLE_TEST.js`.
This checks library loading (JSZip/SheetJS/heic2any), function existence, modal
wiring, and export functions — the class of check described in
`DIAGNOSTICTESTINGGUIDE.md` ("Option A: Run Console Test Script … 2–3 minutes …
Score should be 100% or near-100%").

`TESTING_GUIDE.md` and `CLAUDE.md` both name `DAILY_TEST.html` as the gate here
("Run DAILY_TEST.html … Verify 100% score"). **Contradiction / broken
reference:** `DAILY_TEST.html` no longer exists at the project root — it is only
in `Archive/DAILY_TEST.html`, a folder `CLAUDE.md` labels "Legacy (Don't Use for
Development)". The documented pre-deploy gate currently points at an archived
file. Restore it or stop citing it.

### Step 2 — Full manual workflow, once, start to finish (15 min)
Follow `TESTING_INSTRUCTIONS_v3.0.md` Test Suite 1 (1.1 → 1.8): start visit →
validate form → upload floor plan → create station / gateway / display →
export. This is the only sequence in the corpus that exercises the app the way
an auditor does. `TESTING_INSTRUCTIONS_v3.0.md` marks five items "Critical Tests
(Must Pass)": indicator/pin alignment, gateway label auto-generation ("GW1"),
display label auto-generation ("D1"), pins visible after zoom, indicator visible
when scrolled — all regressions from v2.5.

### Step 3 — Export integrity (5 min)
Export CSV/Excel/ZIP and open the file. `TESTING_INSTRUCTIONS_v3.0.md` Test 1.8:
"Verify coordinates are present (should show X%, Y% values)". `PHASE_9_TEST_PLAN.md`
adds the empty-state case (TEST 1: no data → alert "No data to export yet.") and
the ZIP folder-structure/metadata.json checks.

### Step 4 — One real phone, full workflow (20 min)
Non-negotiable. Every field-relevant bug in this corpus was found on a phone or
by a human, not by a script (§3). Use the local-server method from
`PRE_TEST_DEPLOYMENT_GUIDE.md`: `python3 -m http.server 8000`, then
`ifconfig | grep "inet "` for the IP, then load over WiFi. Enable remote
inspection (iPhone: Settings → Safari → Advanced → Web Inspector; Android:
`chrome://inspect`) — same instructions in `TESTING_INSTRUCTIONS_v3.0.md`.

### Step 5 — Persistence check (2 min)
Create data, close the browser completely, reopen, verify data survives.
`MOBILE_TESTING_PLAN_JULY_6_7.md` Test 9. `CLAUDE.md` names the matching failure
mode: "Form data disappears on reload → Missing `persist()` call".

**What to skip.** The 27-scenario / 60-minute manual script
(`COMPREHENSIVE_MANUAL_TEST_SCRIPT.js`, documented in `MANUAL_TESTING_GUIDE.md`
and `COMPLETE_TESTING_PROTOCOL.md`) and the pan-bounds suites. They test a
subsystem that no longer exists in the MVP build (`CODE_AUDIT_MVP_COMPLETE.md`).

---

## 2. What automated tests can and cannot catch here

### What they caught
- **Missing functions and unwired handlers.** `DIAGNOSTICTESTINGGUIDE.md`
  verified 6/6 Phase 9 ZIP functions, library loading, and 5/5 updated export
  buttons.
- **Pure-math regressions in the render formula.** `STRESS_TEST_IMPLEMENTATION_SUMMARY.md`
  documents `validateEdgeCases()` checking identity at zoom 1.0, center
  invariance, monotonicity, and symmetry of
  `renderedX = imagePercent * zoomLevel - (zoomLevel - 1) * 50`.
- **Structural code review at scale.** `TESTING_DOCUMENTATION_INDEX.md` claims
  "10/10 Test Cases PASSING, 9/9 critical issues FIXED, 40/40 verification
  checks PASSED" for gateway/display positioning parity.

### What they demonstrably MISSED — and why

| Bug | Source | Why automation missed it |
|---|---|---|
| `state.currentPhotosTemp` initialized as `[]` in `openAddStationModal()` but as `{}` in `openEditStationModal()`; `promptPhotoUpload()` then sets `.stationPhoto` on an array → photo silently not stored, validation fails | `ADD_STATION_BUG_REPORT.md` (July 2) | Runtime type mismatch on a path only reached by *adding* (not editing) a station with a photo. No script ever completed that flow. |
| Reposition "Save Position" updated the on-screen pin but never the station object or localStorage — "Visual Update ≠ Data Save" | `PIN_EDIT_ISSUE_ANALYSIS.md` (July 2) | The console logs all showed ✓. Automation asserted on *logged* state, not on persisted state re-read after reload. |
| All pins rendered **37.7px too high**, identical error at every zoom, X perfect | `BUG_ANALYSIS_Y_OFFSET.md` (June 10) | The suites verified the formula against itself. The doc admits: "the issue is in how the EXPECTED value is being calculated in the verification code, NOT in the actual rendering" — i.e. the oracle was as wrong as the code. |
| Phone and desktop were testing **different floor plan images** (4032×3024 landscape vs 3024×4032 portrait) | `PHONE_TEST_ANALYSIS.md` — "THE IMAGES ARE TRANSPOSED!" | No test asserted on input fixture identity. Every calculation "passed" — for the wrong image. |
| Gateway/Display labels not auto-generating in v2.5 | `TESTING_INSTRUCTIONS_v3.0.md` Tests 1.4/1.5 | Requires a human to look at a field and notice it is empty. |
| Pins taking ~47 seconds to reappear after zoom in v2.5 | `TESTING_INSTRUCTIONS_v3.0.md` Test 1.6 ("No 47-second delay") | Timing/perception bug; no script measured render latency. |

### The structural reason
The headline automated result in this project was produced **without a rendered
page**. `TEST_ANALYSIS_MANUAL_VS_AUTOMATED.md`:

> `"containerSize": {"width": 0, "height": 0}` … 96 tests, 16 passed, 80 failed,
> overallAccuracy 16.67% … "Root cause: Container dimensions not being read
> correctly before test started" … "80 pins failed to render (`PIN_NOT_RENDERED`)"

Meanwhile the same document's **manual** run of the identical scenario passed
cleanly (pin stable at 50.13%, 50.05% from 100% → 150% zoom, container 398×299).
Its verdict: *"Automated test needs debugging (container size issue) …
Recommendation: Deploy current fixes to production."*

**Plainly: in this codebase, automated tests verified arithmetic and code
strings; humans verified behavior.** `FINAL_TEST_REPORT.md` states its own method
outright — "Verification Method: Automated code review + mathematical
verification" — and still concludes "Potential Risks: NONE IDENTIFIED … APPROVED
FOR DEPLOYMENT". It never ran the app.

---

## 3. Device / browser matrix

The required set, per `PRE_TEST_DEPLOYMENT_GUIDE.md`, `MOBILE_TESTING_PLAN_JULY_6_7.md`,
and `TESTING_INSTRUCTIONS_v3.0.md` §Sign-Off:

| Target | Version floor cited | Must-test items | Only-breaks-here |
|---|---|---|---|
| **iPhone Safari** | iOS 17+ (`MOBILE_TESTING_PLAN_JULY_6_7.md`); iOS 16 appears in the bug template of `TESTING_INSTRUCTIONS_v3.0.md` | Touch pin placement; pinch-zoom; scroll/pan; photo capture; close-app-and-reopen persistence | **HEIC photos.** `Development/PHASE4_HEIC_FILE_SUPPORT.md`: "Safari: Native HEIC support (displays directly)" — Safari is the one browser that does *not* exercise the heic2any conversion path, so a conversion bug is invisible here. `TESTING_GUIDE.md`: "'HEIC Support' Fails on Desktop — This is normal." Also the primary target for `Cmd+Shift+R` / "Settings > Safari > Clear History and Website Data" cache staleness (`TESTING_GUIDE.md` Troubleshooting). `TESTING_DOCUMENTATION_INDEX.md` names Safari "(primary target)". |
| **iPhone Chrome** | iOS 17+ | Same flow as Safari; compare UI/performance | Runs on WebKit but **takes the heic2any conversion branch** (`PHASE4_HEIC_FILE_SUPPORT.md`: "Chrome/Firefox/Android: Auto-converts to JPEG"). This is where HEIC conversion actually gets tested on Apple hardware. Also file-opening differs: Files app → "Open in Chrome" (`PHONE_TESTING_QUICK_START.md`). |
| **Android Chrome** | Android 12+ | Full flow; "Check for layout differences … Expected: Responsive, no major layout breaks" (`MOBILE_TESTING_PLAN_JULY_6_7.md` Test 3) | Layout/responsive breaks; remote debugging requires Developer Options + USB Debugging (`PRE_TEST_DEPLOYMENT_GUIDE.md` Step 6). |
| **Desktop Chrome** | — | Console-script suites, export ZIP download, DevTools | Not a proxy for any phone behavior. `PHONE_TEST_ANALYSIS.md` shows desktop and phone container sizes differing (398×448 vs 343×686) enough to change every centering calculation. |
| Firefox | — | Listed only as tertiary in `TESTING_DOCUMENTATION_INDEX.md` "Cross-Browser Testing" | No evidence in this corpus that it was ever tested. |

**Phone-only failure classes to test explicitly**
(`MOBILE_TESTING_PLAN_JULY_6_7.md` Phase 7): network interruption mid-audit
(Test 15), 4MB+ photo compression (Test 16, expect ~50% reduction), 15+ photos /
storage quota (Test 17), and **device orientation change** (Test 18 — "Floor plan
fits to container correctly; Pins don't move"). `CLAUDE.md` corroborates that
orientation change re-enters `updateDisplayDimensions()`.

Known non-failures to not chase (`MOBILE_TESTING_PLAN_JULY_6_7.md` "Known
Constraints"): EmailJS unconfigured, localStorage quota warning at 70%+,
IndexedDB ~50MB ceiling (~15–20 photos).

---

## 4. Edge cases worth re-testing every time

From `EDGE_CASE_STRESS_TEST.md`, `QUICK_TEST_CHECKLIST.md`,
`SYSTEMATIC_STRESS_TEST_PLAN.md`, `PHASE_2_EDGE_CASE_TESTING.md`.

**Still relevant regardless of zoom**
1. **Boundary pins.** Tap at the far left and far right; coordinates must clamp to
   the 2–98% range. Stored values outside 2–98% are a red flag
   (`EDGE_CASE_STRESS_TEST.md` §Red Flags).
2. **Rapid successive taps.** 5+ fast taps at different spots must produce
   distinct coordinates, no frozen UI, no missing modals
   (`QUICK_TEST_CHECKLIST.md` Phase 5).
3. **Reposition then verify by re-opening.** Create at (40,50) → reposition to
   (45,55) → reopen the object → confirm it reads (45,55), ±1%
   (`QUICK_TEST_CHECKLIST.md` Phase 4). Given `PIN_EDIT_ISSUE_ANALYSIS.md`,
   extend this: **reload the page** before believing the value.
4. **Persistence across a full app close.** 3 stations → close browser → reopen →
   all three present at the same positions (`QUICK_TEST_CHECKLIST.md` Phase 7).
5. **NaN / Infinity / zero coordinates** anywhere in console output — always a bug
   (`EDGE_CASE_STRESS_TEST.md`).
6. **Bulk edit isolation.** 5 stations edited sequentially with no
   cross-contamination (`STRESS_TEST_SUMMARY.txt` TC10); concurrent-edit mode
   isolation (TC9); flag lifecycle cleanup so no positioning mode lingers after
   save (TC8).
7. **Per-floor floor-plan isolation.** Upload a different plan to Floor 2, return
   to Floor 1, confirm Floor 1 still shows its own image
   (`MOBILE_TESTING_PLAN_JULY_6_7.md` Test 5 — an actual past bug).
8. **Empty / minimal export.** Export with zero data and with a floor but no
   photos (`PHASE_9_TEST_PLAN.md` TEST 1, TEST 2).

**Only if a zoom build is in play**
9. Monotonicity: pins at 10/30/50/70/90% must keep left-to-right order at every
   zoom level, even when some render outside the container
   (`EDGE_CASE_STRESS_TEST.md` §3).
10. Center invariance: a pin at 50% renders at 50% at every zoom
    (`STRESS_TEST_IMPLEMENTATION_SUMMARY.md`).
11. Cross-zoom creation: a pin placed at (40,40) at 100% and one placed at
    (40,40) at 150% must land on the same image spot
    (`SYSTEMATIC_STRESS_TEST_PLAN.md` TEST SET 3).
12. Pan extremes: drag past each edge; no black space may appear; pan clamps to
    `overflow / 2` (`PHASE_2_EDGE_CASE_TESTING.md` TEST 2,
    `TESTING_RESOURCES_INDEX.md` §Critical Pass Criteria).

**Expected-behavior traps that repeatedly got logged as bugs**
- Rendered coordinates **negative or >100% at zoom > 1.0 are correct**, not a bug
  ("Pin stored at 2% … at zoom 150% renders −22.5%" — `EDGE_CASE_STRESS_TEST.md`).
- Pins **visually shifting** as you zoom is correct; they are locked to image
  content, not screen position (`QUICK_TEST_CHECKLIST.md` Phase 8: "This is NOT a
  bug").

---

## 5. Contradictions to be aware of before trusting any of the above

These are unresolved in the source material. Do not paper over them.

1. **Pan bounds at 100% zoom — three different answers.**
   - `TESTING_RESOURCES_INDEX.md` quick reference: `100%: maxPan = 0 (no panning)`.
   - `PHASE_2_EDGE_CASE_TESTING.md` TEST 1: "No panning at zoom 100% (image fits
     container) … Image cannot be dragged at 100% zoom."
   - `TESTING_SUMMARY.md` and `TEST_FAILURE_ANALYSIS.md`: aspect ratio means
     "**there's ALWAYS overflow, even at 100% zoom**", maxPan = 85.75px.
   - `FINAL_TEST_REPORT.md`: "100% (1.0) | Max Pan X 11.5px | Max Pan Y 0.0px".
   Three incompatible values, all dated June 10, 2026, all reported as passing.

2. **Which image aspect ratio is real.** `TESTING_SUMMARY.md` asserts 3:4 portrait
   (3024×4032) as the fact underpinning its bounds math; `PHONE_TEST_ANALYSIS.md`
   shows desktop used 4:3 landscape (4032×3024) and calls the mismatch "CRITICAL".
   The bounds "proof" therefore rests on a fixture that was not consistent across
   the machines being tested.

3. **Pan implemented or not.** `EDGE_CASE_STRESS_TEST.md` (June 10, 19:37) lists
   under Known Limitations: "**Pan offset currently not implemented** — but not
   part of this iteration." `TESTING_SUMMARY.md` (same day, 20:30) verifies pan
   offset handling as present and fixed at line 3926.

4. **Center invariance vs. worked example.** `EDGE_CASE_STRESS_TEST.md` §2 writes
   a pin at (25, 50) rendering as (18.75, **37.5**) at zoom 1.25 and (12.5, **25**)
   at 1.5 — but the stated formula and `STRESS_TEST_IMPLEMENTATION_SUMMARY.md`
   both require y=50 to render at 50 at every zoom. The example's y-values are
   wrong; the same document elsewhere asserts center invariance.

5. **Which file is the deploy target.** `CLAUDE.md` and
   `TESTING_DOCUMENTATION_INDEX.md`: `Spare-it_site_visit_form_UPDATED.html`.
   `TESTING_GUIDE.md`, `QUICK_TEST_GUIDE.md`, `DIAGNOSTICTESTINGGUIDE.md`:
   `Spare-it_site_visit_form.html`. `MOBILE_TESTING_PLAN_JULY_6_7.md` and
   `PRE_TEST_DEPLOYMENT_GUIDE.md`: `site-visit-form-no-zoom.html`.
   `TESTING_INSTRUCTIONS_v3.0.md`: `Spare-it_site_visit_form_v3.0_PRODUCTION.html`
   — **which does not exist in this folder.** Testing instructions have been
   pointing at a nonexistent binary.

6. **File size of the app under test.** `TESTING_DOCUMENTATION_INDEX.md` says
   "848.4 KB"; the file on disk is ~933 KB. Line numbers cited throughout the
   June 9–10 documents (e.g. `renderPins()` at 3121, `enforcePanBounds()` at 3086,
   `handlePlanTap()` at ~3905) should be treated as stale.

---

## 6. Test asset inventory

### Keep

| File | Why |
|---|---|
| `Archive/DAILY_TEST.html` → **restore to root** | The only interactive, non-expert-facing gate. `TESTING_GUIDE.md` and `CLAUDE.md` both make it the pre-deploy step; it checks hygiene (6), core functionality (5), feature phases (3), mobile touch targets (4). Currently orphaned in `Archive/`. |
| `BROWSER_CONSOLE_TEST.js` | June 10 revision of the May 9 `BROWSER_CONSOLE_TESTS.js`. Library/function/modal existence checks — the cheap, still-valid class of automation (`DIAGNOSTICTESTINGGUIDE.md`). |
| `TESTING_INSTRUCTIONS_v3.0.md` | The only end-to-end, human-runnable workflow script with explicit sign-off checklists per browser. |
| `MOBILE_TESTING_PLAN_JULY_6_7.md` + `PRE_TEST_DEPLOYMENT_GUIDE.md` | The device matrix, the local-server/remote-debug setup, and the only edge cases about photos, storage quota, offline, and orientation. |
| `PHASE_9_TEST_PLAN.md` | Only structured coverage of ZIP export and metadata.json. Export is still a live feature. |
| `BIN_CODE_GENERATION_TEST.html` | Standalone check of `generateBinCode()` logic, independent of the zoom subsystem. |
| `Development/PHASE1_PIN_MOVEMENT_TESTS.md`, `PHASE2_STATION_SELECTION_TESTS.md`, `PHASE4_HEIC_FILE_SUPPORT.md` | Feature-level acceptance criteria for the three v3.0 features `CLAUDE.md` still lists. Phase 2's dedup/link flow and Phase 4's browser-branching logic are not covered anywhere else. |
| `TEST_ANALYSIS_MANUAL_VS_AUTOMATED.md` | Keep as evidence, not as procedure. It is the single most useful document in the corpus for calibrating trust. |

### Superseded — archive or delete

| File | Reason |
|---|---|
| `EXTENSIVE_PAN_BOUNDS_TEST_SCRIPT.js` | `TESTING_SUMMARY.md` marks it "⚠️ Archived — Original test (had bugs)". Its failures were test bugs: inverted clamping logic and a wrong `displayedWidth` formula (`TEST_FAILURE_ANALYSIS.md`). |
| `CORRECTED_PAN_BOUNDS_TEST_SCRIPT.js` | `TESTING_SUMMARY.md`: "Second attempt (86.4% pass) — ⚠️ Reference". Superseded by FINAL. |
| `FINAL_TEST_SCRIPT.js` | Was the designated keeper — `TESTING_SUMMARY.md` marks it "✅ USE THIS" and `COMPLETE_TESTING_PROTOCOL.md` makes it Phase 1. **But** it validates the pan/zoom coordinate system that `CODE_AUDIT_MVP_COMPLETE.md` removed from the MVP build. Keep only if a zoom build is revived; otherwise it tests dead code. |
| `COMPREHENSIVE_MANUAL_TEST_SCRIPT.js` / `MANUAL_TESTING_GUIDE.md` / `COMPLETE_TESTING_PROTOCOL.md` | 27 scenarios, 60 minutes, ~5 of the 7 sessions are pan/zoom/bounds. Salvage Sessions 3 and 7 (repositioning, full workflow) into the §1 sequence and drop the rest. |
| `COMPREHENSIVE_TEST_REPORT_SCRIPT.js`, `ROBUST_TEST_SCRIPT.js`, `SIMPLE_TEST_SCRIPT.js`, `AUTOMATED_VALIDATION_TEST.js` | Four same-day (June 10) variants of the same zoom-validation idea, differing mainly in verbosity. None is designated canonical by any document. `AUTOMATED_VALIDATION_TEST.js` corresponds to the run that produced the 16.67% / container-0×0 result. |
| `BROWSER_CONSOLE_TESTS.js` (plural, May 9) | Older sibling of `BROWSER_CONSOLE_TEST.js`. |
| `IMPLEMENTATION_FIXES.js` | Not a test — a patch script. Do not treat as part of the suite. |
| `DIAGNOSTIC_TOOL.html`, `Archive/DIAGNOSTIC_SUITE.html`, `Archive/Full_System_Diagnostic.html`, `Archive/APP_DIAGNOSTIC.html`, `Archive/Code_Hygiene_Check.html`, `Archive/Diagnostic_Console.html`, `Archive/Landing_Page_Debug.html` | Six overlapping diagnostic dashboards. `DAILY_TEST.html` subsumes them. |
| `TESTING_RESOURCES_INDEX.md`, `TESTING_DOCUMENTATION_INDEX.md`, `TESTING_SUMMARY.md`, `FINAL_TEST_REPORT.md`, `CODE_REVIEW_TEST_REPORT.md`, `STRESS_TEST_*`, `QUICK_TEST_CHECKLIST.md`, `EDGE_CASE_STRESS_TEST.md`, `PHASE_2_EDGE_CASE_TESTING.md`, `SYSTEMATIC_STRESS_TEST_PLAN.md`, `TEST_CASE_WALKTHROUGHS.md`, `TEST_FAILURE_ANALYSIS.md` | Historical record of the zoom era. Valuable as narrative (§7), not as instructions. Note that three of them are *indexes of each other*. |

**Rule going forward:** one automated hygiene script, one interactive dashboard,
one manual workflow doc, one mobile plan. Anything else needs a reason to exist.

---

## 7. Lessons about the testing process itself

**7.1 The most confident report was the least grounded.**
`FINAL_TEST_REPORT.md` — "ALL TESTS PASSED - 100% SUCCESS RATE", "Confidence
Level: 🟢 VERY HIGH", "Potential Risks: NONE IDENTIFIED", "Status: ✅ APPROVED FOR
DEPLOYMENT" — was produced by "Automated code review + mathematical
verification". Its 13 checks were: does this function exist, does this string
appear in the source, does this arithmetic hold. Zero user interactions. Written
the same day the actual automated run scored 16.67% with a 0×0 container
(`TEST_ANALYSIS_MANUAL_VS_AUTOMATED.md`).

**7.2 Tests were repeatedly fixed to match the app, not the other way round.**
`TESTING_SUMMARY.md` narrates it openly: run 1 → 63.6%, "**Tests were buggy, not
the application**"; run 2 → 86.4%, remaining failures labelled "expectation
issue, not code issue" and "false negative, code IS present"; run 3 → "Expected
20/20+ (100%)" after "Updated zoom 100% expectation" and "Simplified code checks
(behavioral verification instead of string search)". A suite adjusted three times
until it agreed with the code no longer constitutes independent evidence. Note
the third run's result is recorded as *expected*, not observed.

**7.3 Passing-score theatre.** Scores are quoted to a decimal (86.4%, 16.67%,
63.6%) across the corpus, and `TESTING_DOCUMENTATION_INDEX.md` reports "Document
Quality Metrics" including "Execution Traces 6/10 — ✅ EXCEEDED" against a 60%
target. Precision was substituting for validity.

**7.4 The oracle was derived from the implementation.**
`BUG_ANALYSIS_Y_OFFSET.md` states it directly — a real 37.7px error, and the
leading hypothesis is that the *verification formula* is wrong rather than the
render. When the expected value comes from the same math as the actual value,
agreement proves nothing.

**7.5 Fixture drift invalidated a week of results.** Desktop and phone were
testing transposed images (`PHONE_TEST_ANALYSIS.md`) while both reported correct
math. Pin fixtures — the exact floor plan file, its dimensions — before trusting
any coordinate result.

**7.6 "Ready for production" was declared at least four times.**
`TESTING_DOCUMENTATION_INDEX.md` (June 9, "GREEN LIGHT"), `FINAL_TEST_REPORT.md`
(June 10, "APPROVED"), `PRODUCTION_READY_v3.0.md` (June 11),
`CODE_AUDIT_MVP_COMPLETE.md` (June 23, "PRODUCTION READY"), `DEPLOYMENT_READY.md`
(July 2). Bugs dated July 2 (`ADD_STATION_BUG_REPORT.md`,
`PIN_EDIT_ISSUE_ANALYSIS.md`) are basic-flow breakages found after all of them.

**7.7 The largest testing investment went into a feature that was deleted.**
Roughly 8 of the 11 test scripts and the majority of the June 9–10 documentation
target zoom/pan coordinate transformation. `CODE_AUDIT_MVP_COMPLETE.md` (June 23)
removed zoom entirely — HTML, CSS, three functions neutralized, 21 state
references replaced. The deepest, most mathematically rigorous testing in the
project validated code that shipped as `1 /* zoom removed */`. Before building a
test suite for a subsystem, confirm the subsystem is a keeper.

**7.8 What actually worked.** Manual, on-device, whole-workflow testing, and the
one honest comparison document. `TEST_ANALYSIS_MANUAL_VS_AUTOMATED.md` — manual
PASSED / automated FAILED, side by side, with the reason — is the format worth
repeating after every test cycle. `Archive/PATTERN_ANALYSIS_AND_LESSONS.md`
reaches the same conclusion from the code side: "Complexity breeds failure",
"Assume Nothing", "Simple > Complex". That applies to the test suite as much as
to the app.

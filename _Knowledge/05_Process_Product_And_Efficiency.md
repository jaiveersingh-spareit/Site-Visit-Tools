# Process, Product Evolution & Working Efficiency

Scope: how this project was run, what shipped when, what the team asked for, and what
the working method cost. Every claim below is attributed to a source file in
`Site Visit Form/`. Where sources contradict each other, both are cited and the
contradiction is named rather than resolved.

---

## 1. Version timeline

Two different version histories exist in this folder and they do not agree. Both are
reproduced.

**Timeline A — `README.md` ("Deployment History"):**

| Date | Version | Changes |
|---|---|---|
| May 8, 2026 | 3.0 | Pin movement, station linking, HEIC support, consolidated testing (`README.md`) |
| May 6, 2026 | 2.5 | iPhone touch fixes, mobile optimization (`README.md`) |
| Earlier | 1.0–2.0 | Core form, photos, floors, export (`README.md`) |

**Timeline B — `CHANGELOG_v3.0.md` ("Version History"):**

| Version | Date | Focus | Status |
|---|---|---|---|
| 3.0 | Jun 11, 2026 | Coordinate system consolidation, bug fixes | Production Ready (`CHANGELOG_v3.0.md`) |
| 2.5 | Jun 6, 2026 | Mobile optimization, touch fixes | Retired (`CHANGELOG_v3.0.md`) |
| 2.0 | May 20, 2026 | Photo upload, export features | Retired (`CHANGELOG_v3.0.md`) |
| 1.0 | May 1, 2026 | Initial release | Retired (`CHANGELOG_v3.0.md`) |

The same version number "3.0" is dated May 8 in `README.md` and June 11 in
`CHANGELOG_v3.0.md`, with different feature content attached to each. `README.md` also
carries "Last Updated: May 8, 2026" while `CLAUDE.md` states "Current Version: 3.0
(May 8, 2026)" — so the stale date propagated into the agent instructions.

**Full sequence reconstructed from dated documents:**

| Date | Event | Source |
|---|---|---|
| May 6, 2026 | UX sprint: pin movement, station-link modal, HEIC support. 3 of 4 phases delivered in ~270 min; Phase 3 (mini-map) deferred | `Development/SPRINT_ITERATION_PROCESS_LOG_MAY_6_2026.md` |
| May 8, 2026 | Phase 9 shipped: JSZip integration, 6 new export functions, 5 export buttons rewired to `doExportZip()` | `PHASE_9_IMPLEMENTATION_COMPLETE.md` |
| May 8, 2026 | `README.md`, `DOCUMENTATION_INDEX.md`, `FEATURE_IMPROVEMENTS_ROADMAP.md` all written same day | file dates; `DOCUMENTATION_INDEX.md` |
| May 13, 2026 | Skills-extraction analysis — proposal to package the project's own process docs as org-wide reusable skills | `SHAREABLE_SKILLS_ANALYSIS.md` |
| May 22, 2026 | Bin data structure refactored from nested to flat; station creation workflows unified so `pinAddStation()` calls `openAddStation()` | `PROJECT_SUMMARY.md` |
| Jun 4, 2026 | Screenshot + Miro documentation programme declared "COMPLETE AND READY FOR DEPLOYMENT" with 17 of 85+ screenshots captured | `PROJECT_COMPLETION_SUMMARY.md`, `SCREENSHOTS_STATUS.md` |
| Jun 11, 2026 | v3.0 changelog: unified coordinate system, zoom cache invalidation, gateway/display label auto-generation, dead-code removal | `CHANGELOG_v3.0.md` |
| Jun 11, 2026 | v3.0 handed to operations for organisational testing | `TEAM_REVIEW_PACKAGE.md` |
| Jun 24, 2026 | `Spare-it_site_visit_form_MVP.html` — 6,943 lines, HEIC supported, email export wired to SendGrid | `READINESS_AND_NEXT_STEPS_2026-08-26.html` |
| Jun 26, 2026 | VISION Audit Platform technical specification — three-tier system (admin portal, customer portal, mobile audit app) | `VISION_AUDIT_PLATFORM_SPEC.md` |
| Jul 2, 2026 | Zoom removal / fit-to-box rewrite executed across "16 structured phases"; ~392 lines removed (−17%) | `WORK_SUMMARY.md` |
| Jul 6, 2026 | Slack thread with Romain, Laurent, Lowell: security, EmailJS limits, Firebase vs AWS, problem-vs-solution reframe | `SLACK_CONVERSATION_ANALYSIS.md` |
| Jul 7, 2026 | `site-visit-form-no-zoom.html` — 2,347 lines; 22 test cases documented, never run; never deployed | `READINESS_AND_NEXT_STEPS_2026-08-26.html`, `WORK_SUMMARY.md` |
| Jul 8, 2026 | Meeting agenda prepared for the AWS-vs-Firebase decision | `MEETING_AGENDA_TOMORROW.md` |
| Jul 10, 2026 | Slack channel / PM setup options drafted; the two-tool split written down explicitly | `Slack_Project_Setup_Options.md` |
| Aug 26, 2026 | Readiness review: not field-ready, ~1.5 days of work away, four named blockers | `READINESS_AND_NEXT_STEPS_2026-08-26.html` |

**What each version actually changed (v3.0, the best-documented release):**

| Change | Before | After | Source |
|---|---|---|---|
| Unified coordinate system | Highlight and pins used different coordinate systems | All objects use image-space positioning; zero visual drift | `CHANGELOG_v3.0.md` |
| Zoom cache invalidation | Cached dimensions went to 0.0 on zoom; pins vanished for 47+ seconds | Cache cleared in `setZoomLevel()` and `resetFloorPlanZoom()` | `CHANGELOG_v3.0.md` |
| Scrolled pin placement | No green indicator when plan scrolled at zoom > 1.0 | Indicator shows and scrolls with the plan | `CHANGELOG_v3.0.md` |
| Gateway/display labels | Did not auto-generate via the "+ Add Pin" path | Auto-generate as GW1/GW2, D1/D2 regardless of entry point | `CHANGELOG_v3.0.md` |
| Dead code removal | Two orphaned modals + two unreferenced functions | Deleted | `CHANGELOG_v3.0.md` |
| Breaking changes | — | None; v2.5 coordinates load unmigrated | `CHANGELOG_v3.0.md` |

---

## 2. What the team actually asked for

**The single verbatim field-feedback quote on record** (`Development/SPRINT_ITERATION_PROCESS_LOG_MAY_6_2026.md`):

> "Once we add a pin on the map and if the station already exists there is no way to map
> the existing station onto the map - i should be able to move the pin that I have place
> incase of a mistake - there should be option to add the pin from either the station edit
> page and from the floor plan section... The station photo does not show up if an heic
> file is uploaded, lets look into the file types and what works best for an android and iphone"

That one message generated four work items (`Development/UX_FLOW_PIN_MANAGEMENT_AND_FILES.md`):
link pin to existing station; drag to move a placed pin; place pins from the station edit
page as well as the floor plan; HEIC support.

**Requests delivered:**

| Request | Origin | Outcome | Source |
|---|---|---|---|
| Link a pin to an existing station instead of duplicating | Field feedback quote | Shipped as Phase 2 station-link modal, 73 lines, 40 min | `Development/SPRINT_ITERATION_PROCESS_LOG_MAY_6_2026.md` |
| Move a pin after a placement mistake | Field feedback quote | Shipped as Phase 1 long-press drag, 128 lines, 50 min | same |
| HEIC photos from iPhone must display | Field feedback quote | Shipped as Phase 4 via `heic2any`, 189 lines, 45 min | same |
| Sync badge overlapping export button on mobile | iOS user testing | Listed as Phase 1.1, 15 min, "🔴 Not started" | `FEATURE_IMPROVEMENTS_ROADMAP.md` |
| Photo upload from gallery, not just camera | iOS user testing | Listed as Phase 3.1, 60 min, "🔴 Not started" | `FEATURE_IMPROVEMENTS_ROADMAP.md` |
| Gateway support (LoRa devices) | Operations: "We need to track gateway positions too" | Shipped; yellow #FFD600 badge, parallel workflow | `EVOLUTION_NARRATIVE.md`, `UX_AUDIT_AND_EVOLUTION.md` |
| Display device support | Operations: "We also need to document display installations" | Shipped; purple #8B5CF6 badge | `EVOLUTION_NARRATIVE.md` |
| "I created the display, but I don't see it on the map" | Operations | Fixed — `renderPins()` had never iterated displays | `EVOLUTION_NARRATIVE.md` |
| Photos must survive the survey, not live in a browser | Lowell Fox (VP Operations) | Still unsolved as of 26 Aug | `SLACK_CONVERSATION_ANALYSIS.md`, `READINESS_AND_NEXT_STEPS_2026-08-26.html` |
| Pre-populated site links so PwC sites don't build buildings from scratch | Lowell Fox | Not built | `SLACK_CONVERSATION_ANALYSIS.md` |

**Still outstanding (as of the latest dated document, 26 Aug 2026):**

- Blocker 01 — the SendGrid key is blanked at build time by the deploy config, overriding
  the hosting dashboard value; export would fail every time, after a full day of capture
  (`READINESS_AND_NEXT_STEPS_2026-08-26.html`). ~10 minutes.
- Blocker 02 — no evidence the site was ever published; no version control, no live URL to
  hand to Carine (`READINESS_AND_NEXT_STEPS_2026-08-26.html`). ~30 minutes.
- Blocker 03 — export exceeds the ~6MB serverless request limit at roughly 30 photos; a
  multi-floor site goes past it (`READINESS_AND_NEXT_STEPS_2026-08-26.html`). ~half day.
- Blocker 04 — photos sit in browser storage capped near 5–10MB; this one loses captured
  work mid-visit (`READINESS_AND_NEXT_STEPS_2026-08-26.html`).
- The backend architecture decision (Apps Script over Sheets, Firebase, or AWS) is
  "deliberately still parked" and is named as "the thing that stalled this project for
  seven weeks" (`READINESS_AND_NEXT_STEPS_2026-08-26.html`).
- Four decisions still owed by the team: lock the Luxembourg date (3 vs 8 September are
  both circulating), confirm 1.5 days of build time, confirm the export recipient inbox,
  confirm Carine's 20-minute briefing slot (`READINESS_AND_NEXT_STEPS_2026-08-26.html`).

---

## 3. Product direction: one tool became two

**Where the split first appears.** The earliest document that treats internal deployment
planning and customer-facing auditing as *separate products* is
`VISION_AUDIT_PLATFORM_SPEC.md` (June 2026), which specifies a three-tier system: an
internal Admin Portal for site setup and audit tracking, an external Customer Portal for
progress and report download, and a mobile Site Audit App. Before that, the tool is
described in single-purpose terms — `PROJECT_SUMMARY.md` (May 22) calls it a form "for
Spare-it operations team to record site visit information **for deployment planning**",
with key users listed as the operations team, auditors and building assessors. No customer
audience appears in any May document.

**The split is stated plainly on 10 July** in `Slack_Project_Setup_Options.md`, which opens
by naming two related tools tracked in one channel:

- **VISION Site Visit App** — "external-facing tool (no-Zoom HTML), part of the VISION
  product line"
- **Site Visit App (Internal)** — "operations tool for populating the admin platform with
  a site's waste setup"

That document proposes `[VISION]` / `[OPS]` / `[BOTH]` tags precisely because one channel
now carries two workstreams (`Slack_Project_Setup_Options.md`).

**Intermediate signals, in order:**

- 6 July — Laurent (CEO/technical) grants permission for a different stack "as long as it's
  treated as a **separate tool** (not integrated into main stack)", "**owned by Ops team**
  (standalone)", "**simple**" (`SLACK_CONVERSATION_ANALYSIS.md`).
- 8 July — the agenda asks Laurent directly: "at what point might this become a VISION
  module vs. staying standalone?" and frames the answer as determining architecture
  (`MEETING_AGENDA_TOMORROW.md`).
- The two HTML builds map onto the two identities: `site-visit-form-no-zoom.html` is the
  VISION-facing build, `Spare-it_site_visit_form_MVP.html` the internal one
  (`Slack_Project_Setup_Options.md`, `READINESS_AND_NEXT_STEPS_2026-08-26.html`).
- The folder structure eventually catches up: `Internal-Tool/INTERNAL_Site_Visit_Tool_v3.html`
  and `VISION-Customer-Tool/VISION_Site_Audit_Tool_v1.html` exist as separate directories,
  each with an empty `docs/` folder (directory listing).

**Note the irony recorded in `READINESS_AND_NEXT_STEPS_2026-08-26.html`:** the build that
became the "external-facing VISION" identity is the one that "traded away features the
field actually needs and never completed its own QA" — dropped HEIC, partial Excel/ZIP
export, placeholder email keys, 22 test cases never run, never deployed. The recommendation
is to take the *internal* MVP forward and park the VISION rewrite.

---

## 4. Working efficiencies learned

**What made iterations fast.**

- *Design before code, on the same day.* The May 6 sprint spent 30 min on analysis and
  45 min on design before writing a line, and evaluated three alternatives per feature.
  Result: 96% on-time, +10 min variance across 270 minutes, and the retro names
  "design-first approach prevented rework" as the top success factor
  (`Development/SPRINT_ITERATION_PROCESS_LOG_MAY_6_2026.md`).
- *Modular, phase-based delivery with explicit deferral.* Phases 1, 2 and 4 shipped;
  Phase 3 (mini-map) was designed and deliberately deferred as effort 4/5 for impact 3/5.
  Deferring one of four items is what kept the other three on schedule
  (`Development/SPRINT_ITERATION_PROCESS_LOG_MAY_6_2026.md`).
- *Explicit effort-vs-impact scoring.* Each phase got a star rating and an ROI call before
  commitment. Phase 2 (2/5 effort, 4/5 impact) was correctly identified as the best trade
  (`Development/SPRINT_ITERATION_PROCESS_LOG_MAY_6_2026.md`).
- *Converging entry points onto one function.* Making `pinAddStation()` call
  `openAddStation()` eliminated a whole class of bugs rather than patching them one by one
  (`PROJECT_SUMMARY.md`). The same move — one `confirmPinLocation()` for all three object
  types — is what made repositioning consistent (`EVOLUTION_NARRATIVE.md`).
- *Library over hand-rolled code.* `heic2any` at 4KB was chosen over writing conversion
  logic; the retro flags this as "made right trade-off decision"
  (`Development/SPRINT_ITERATION_PROCESS_LOG_MAY_6_2026.md`).
- *Reframing solutions back into problems.* Lowell's intervention — "let's separate
  problems from solutions" — converted a stuck three-way technical argument into two agreed
  problem statements (frictionless setup, photo retention) with multiple valid solution
  paths (`SLACK_CONVERSATION_ANALYSIS.md`).

**What wasted time.**

- *Documentation outweighed code by nearly 3:1.* The May 6 sprint produced 460 lines of
  code and 1,260 lines of documentation across six documents
  (`Development/SPRINT_ITERATION_PROCESS_LOG_MAY_6_2026.md`). The retro's own
  recommendation is to "reduce documentation overhead (was 60 min, could be 40)" — but the
  ratio, not the minute count, is the problem.
- *Test plans written but never executed.* The May 6 retro admits "test guides created but
  not yet executed" and reserves 2–3 hours that the record does not show being spent
  (`Development/SPRINT_ITERATION_PROCESS_LOG_MAY_6_2026.md`). The July rewrite repeats it
  exactly: 22 test cases documented, "never run"
  (`WORK_SUMMARY.md`, `READINESS_AND_NEXT_STEPS_2026-08-26.html`).
- *A parallel rewrite that was never adopted.* The zoom-removal work was executed across
  "16 structured phases" with eight documents totalling "53 pages of comprehensive
  reference material" (`WORK_SUMMARY.md`), producing `site-visit-form-no-zoom.html`. Six
  weeks later that build is assessed as "Not deployed", feature-regressed, and to be parked
  (`READINESS_AND_NEXT_STEPS_2026-08-26.html`). Two codebases were then maintained in
  parallel and the fork itself became a decision to re-litigate in August.
- *Re-testing the same surface repeatedly.* The root folder contains, among others,
  `COMPREHENSIVE_MANUAL_TEST_SCRIPT.js`, `COMPREHENSIVE_TEST_REPORT_SCRIPT.js`,
  `EXTENSIVE_PAN_BOUNDS_TEST_SCRIPT.js`, `CORRECTED_PAN_BOUNDS_TEST_SCRIPT.js`,
  `FINAL_TEST_SCRIPT.js`, `ROBUST_TEST_SCRIPT.js`, `SIMPLE_TEST_SCRIPT.js`,
  `AUTOMATED_VALIDATION_TEST.js`, `BROWSER_CONSOLE_TEST.js` and `BROWSER_CONSOLE_TESTS.js`
  — ten test harnesses over the same pin/zoom behaviour, plus
  `TESTING_DOCUMENTATION_INDEX.md` and `TESTING_RESOURCES_INDEX.md`, two indexes of the
  tests (directory listing). Meanwhile `README.md` and `CLAUDE.md` both direct the reader
  to `DAILY_TEST.html`, which is not in the root at all — it is in `Archive/`.
- *Screenshot automation abandoned at 10% and then declared complete.* Playwright
  infrastructure was stood up and captured 9 of a target 85+ screenshots, with the
  recommendation to finish the remaining 76 by hand in 2–3 hours
  (`SCREENSHOTS_STATUS.md`). The same-week `PROJECT_COMPLETION_SUMMARY.md` reports
  "Screenshot Automation ✅ Complete (17+ captured)" and marks the project
  "✅ COMPLETE AND READY FOR DEPLOYMENT". The two numbers (9 vs 17) and the two statuses
  do not reconcile.
- *Seven weeks lost to an unmade architecture decision.* Stated directly: the July
  Apps Script/Firebase/AWS question "was the thing that stalled this project for seven
  weeks" (`READINESS_AND_NEXT_STEPS_2026-08-26.html`). Nothing in the four remaining
  blockers depended on it.
- *Elaborate presentation artefacts ahead of a working deployment.* Six Miro documents
  (`MIRO_BOARD_BLUEPRINT.md`, `MIRO_BOARD_DESIGN_RADIAL.md`,
  `MIRO_BOARD_PROTOTYPE_SEQUENTIAL.md`, `MIRO_INTEGRATION_GUIDE.md`,
  `MIRO_REVIEW_VERIFICATION_CHECKLIST.md`, `MIRO_TIMELINE_ROADMAP_ORGANIZATION.md`), plus
  eleven city-specific `Spare-it_VISION_*_Floor_Plans.pptx` decks, were produced while, two
  months later, "nobody on this thread has a URL to hand Carine"
  (`READINESS_AND_NEXT_STEPS_2026-08-26.html`).
- *Extracting reusable skills from a process whose own outputs were unverified.*
  `SHAREABLE_SKILLS_ANALYSIS.md` proposes packaging the testing framework, sprint workflow
  and design framework as org-wide skills (4–6 hours of extraction), citing the sprint's
  "96% efficiency" — an efficiency figure that measures time-vs-estimate on implementation
  only, in a sprint whose tests were never run.

---

## 5. Anti-patterns in how this project was run

**1. Document sprawl in a flat namespace.** 117 markdown files and 184 entries in the
project root (directory listing), with no subfoldering beyond `Development/`, `Archive/`
and the two late tool folders. Finding the current answer to any question requires reading
several documents and comparing dates.

**2. Multiple overlapping documents about the same thing, none superseding the others.**
Bug-fix reports alone: `BUG_FIXES_SUMMARY.md`, `BUG_FIX_REPORT.md`,
`BUG_FIX_GATEWAY_POSITIONING.md`, `BUG_FIX_POSITIONING_FLOW_CORRECTED.md`,
`BUG_ANALYSIS_Y_OFFSET.md`, `FIX_SUMMARY.md`, `FIXES_APPLIED_SUMMARY.md`,
`FIXES_APPLIED_MVP.md`, `REPOSITIONING_BUG_ANALYSIS.md`, `REPOSITIONING_FIX_SUMMARY.md`
(directory listing). Nothing marks which is current.

**3. Indexes of indexes.** `DOCUMENTATION_INDEX.md`, `TESTING_DOCUMENTATION_INDEX.md`,
`TESTING_RESOURCES_INDEX.md` and `:File Architecture Analysis.md` all exist to navigate
documents that themselves are navigation aids. `DOCUMENTATION_INDEX.md` (May 8) already
describes a folder that does not match the folder as it stands — it lists seven files under
`Development/` and shows an application named `Spare-it_site_visit_form.html`, while the
root now holds six different HTML builds.

**4. Documentation that describes a filesystem which does not exist.** `README.md` and
`CLAUDE.md` both instruct the reader to run `DAILY_TEST.html`; that file is in `Archive/`,
not the root. `README.md`'s folder diagram lists `Code_Hygiene_Check.html`,
`Full_System_Diagnostic.html`, `Landing_Page_Debug.html` and `Progress_Tracker.html` as
root-level legacy files; all four are in `Archive/`. `README.md` also states the main app is
"~2,400 lines" while `CLAUDE.md` says "~4,100 lines" and the readiness review measures
6,943 lines for MVP.html (`READINESS_AND_NEXT_STEPS_2026-08-26.html`).

**5. Duplicated builds with no single source of truth.** Six site-visit HTML files sit in
the root — `Spare-it_site_visit_form.html`, `_MVP.html`, `_UPDATED.html`,
`site visit app v3.html`, `site-visit-form-no-zoom.html`, `site-visit-form-lite.html`,
`site-visit-form.html` — plus more in `Archive/legacy-builds/`. `CLAUDE.md` names
`_UPDATED.html` as the deploy file; the August review names `_MVP.html`
(`READINESS_AND_NEXT_STEPS_2026-08-26.html`). Two files differ by 4,600 lines and both
claim to be the app.

**6. No version control.** "The project folder has the deploy config and the serverless
function, but no version control and no link to a live site"
(`READINESS_AND_NEXT_STEPS_2026-08-26.html`). Every one of the anti-patterns above is
downstream of this: filename-based versioning is what produces six builds, ten test
scripts and ten bug reports.

**7. Declaring completion as a documentation act rather than a verified state.**
`PROJECT_COMPLETION_SUMMARY.md`: "Project Status: ✅ COMPLETE AND READY FOR DEPLOYMENT"
while `SCREENSHOTS_STATUS.md` of the same period records 10% coverage.
`PHASE_9_IMPLEMENTATION_COMPLETE.md`: "Implementation Status: ✅ COMPLETE / Testing Status:
⏳ READY". `CHANGELOG_v3.0.md`: "Version 3.0 is production-ready" with the last four
deployment-checklist boxes unticked. `DEPLOYMENT_READY.md` and `PRODUCTION_READY_v3.0.md`
exist as filenames. In August: "Not field-ready today"
(`READINESS_AND_NEXT_STEPS_2026-08-26.html`).

**8. Tests as artefacts rather than as runs.** Ten test scripts, twelve testing guides, and
in both major work packages the tests were written and not executed
(`Development/SPRINT_ITERATION_PROCESS_LOG_MAY_6_2026.md`,
`READINESS_AND_NEXT_STEPS_2026-08-26.html`).

**9. Self-congratulatory retrospectives.** `EVOLUTION_NARRATIVE.md` closes on "That's how
we build products people trust"; `SLACK_CONVERSATION_ANALYSIS.md` on "You're in good shape";
`PROJECT_COMPLETION_SUMMARY.md` on nine green success criteria. None of these documents
records a cost, a slip, or a thing that did not work. The one document that does —
`READINESS_AND_NEXT_STEPS_2026-08-26.html` — is the only one that produced an actionable
plan, and it opens by contradicting the readiness claims of all the others.

**10. Deliverables aimed at audiences that had not yet asked for anything.** Miro board
designs, a radial layout specification, an evolution narrative, a skills-extraction plan
and eleven city floor-plan decks, produced before a single field auditor had run the tool
end to end (`PROJECT_COMPLETION_SUMMARY.md`, `SHAREABLE_SKILLS_ANALYSIS.md`,
`READINESS_AND_NEXT_STEPS_2026-08-26.html`).

**11. Empty scaffolding.** `Internal-Tool/docs/` and `VISION-Customer-Tool/docs/` are both
empty directories — the reorganisation was started and not carried through (directory
listing).

---

## 6. Outstanding roadmap items carried forward

**Never started, from the earliest roadmap** (`FEATURE_IMPROVEMENTS_ROADMAP.md`, all still
marked "🔴 Not started"; total estimated 495 min):

| # | Item | Est. | Priority |
|---|---|---|---|
| 1.1 | Sync badge overlaps export button on mobile — show only when pending | 15 min | Critical |
| 1.2 | Image rotation controls after upload (context/station/gateway photos) | 30 min | Critical |
| 2.1 | Explicit "Edit Pins" toggle instead of relying on long-press | 45 min | Critical |
| 2.2 | Station creation auto-generates a pin on the floor plan | 60 min | Critical |
| 2.3 | Pin-placement modal shows all stations including newly created | 45 min | Critical |
| 3.1 | Photo upload from gallery/camera roll, not camera only | 60 min | Critical |
| 4.1 | Gateway edit moved to the gateway detail page | 30 min | Important |
| 4.2 | Gateway floor-plan positioning from both directions | 90 min | Important |
| 5.1 | Display functionality parity with gateways | 120 min | Important |

Items 4.2 and 5.1 were subsequently delivered under different names — gateway and display
positioning workflows exist and are documented in `CHANGELOG_v3.0.md` and
`UX_AUDIT_AND_EVOLUTION.md`. The roadmap was never updated to reflect that, which is why it
still reads as nine open criticals.

**Deferred by design:** Phase 3 mini-map on the station edit page — design complete,
implementation deferred at ~60 min, effort 4/5 vs impact 3/5
(`Development/UX_FLOW_PIN_MANAGEMENT_AND_FILES.md`,
`Development/SPRINT_ITERATION_PROCESS_LOG_MAY_6_2026.md`).

**Platform / backend, open:**

- Cloud sync and backup; multi-user support; permission levels; template creation and
  reuse; advanced analytics; real-time collaboration; mobile app wrapper — all listed as
  "Pending/Future Enhancements" (`UX_AUDIT_AND_EVOLUTION.md`). `EVOLUTION_NARRATIVE.md`
  adds AR floor-plan overlays and automated infrastructure mapping as long-term.
- Backend intake: Phase 2 (API endpoint accepting the ZIP, parsing `metadata.json`, moving
  photos to permanent storage, creating records) estimated at 3–4 weeks; Phase 3 (dashboard
  UI, photo gallery with floor-plan overlay, geo-tagging) at 1–2 weeks
  (`R&D_Team_Brief.txt`).
- Six open questions still owed by R&D: ZIP size limit, whether `metadata.json` is stored
  or discarded, pin coordinates as pixels/percentages/lat-long, JPEG vs PNG, upload progress
  UI, and future CV waste classification (`R&D_Team_Brief.txt`).
- Phase 9b/9c: API endpoint accepting the ZIP; then real-time sync replacing ZIP entirely
  (`Phase_9_Implementation_Plan.md`).
- Excel export is still generated separately from the ZIP rather than included in it
  (`Phase_9_Implementation_Plan.md`, "Integration with current Excel export").
- Pre-populated per-site links so client sites do not build buildings from scratch — one of
  Lowell's two named problems, never built (`SLACK_CONVERSATION_ANALYSIS.md`).
- The AWS vs Firebase vs Apps Script decision, explicitly parked pending pilot evidence
  (`MEETING_AGENDA_TOMORROW.md`, `READINESS_AND_NEXT_STEPS_2026-08-26.html`).

**Documentation / testing, open:**

- 76+ of 85 target screenshots uncaptured (`SCREENSHOTS_STATUS.md`).
- The Miro board itself was never built; the design, guide and checklist exist
  (`PROJECT_COMPLETION_SUMMARY.md`).
- Three skills proposed for org-wide extraction, none extracted
  (`SHAREABLE_SKILLS_ANALYSIS.md`).
- Slack channel structure, Canvas, Lists and Workflow Builder setup — options drafted,
  "nothing has been posted to Slack yet" (`Slack_Project_Setup_Options.md`).
- Four team decisions listed above from `READINESS_AND_NEXT_STEPS_2026-08-26.html`.

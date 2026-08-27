# Architecture & Storage — Decisions and Constraints

Scope: architecture, storage, backend and integration decisions for the Spare-it Site Visit
App. Every claim below carries its source filename. Where documents disagree, or a decision
was later reversed, the sequence is shown with dates. Nothing here is inferred beyond what
the cited documents state.

---

## 1. Current architecture as built

**One HTML file, no build step, no backend.**

- The app is a single-file HTML/CSS/JS application executed directly in the browser, with no
  build tool. (`CODE_REVIEW_ARCHITECTURE_OVERVIEW.md`)
- Layering, as documented: presentation (HTML+CSS), business logic (JS), data persistence
  (localStorage + IndexedDB), integration (EmailJS, SheetJS, JSZip).
  (`CODE_REVIEW_ARCHITECTURE_OVERVIEW.md`)
- Rendering is **imperative, not reactive**: state is mutated directly, `persist()` is called,
  then a render function (`renderFloorDetail()`, `renderPins()`) must be called manually. The
  documented risk is "easy to forget a render call → UI out of sync".
  (`CODE_REVIEW_ARCHITECTURE_OVERVIEW.md`; same pattern described in `CLAUDE.md`)
- State access goes through helper getters `gF()`, `gSt()`, `gGw()`, `gDisplay()`.
  (`CODE_REVIEW_ARCHITECTURE_OVERVIEW.md`, `AUDIT_SUMMARY_AND_NEXT_STEPS.md`)

**Line counts differ by file and by date — these are different builds, not contradictions:**

| Build | Lines | Source |
|---|---|---|
| `site-visit-form-no-zoom.html` (2 Jul 2026, after zoom removal) | 1,850 (down from 2,242; −392 lines, −17%) | `DEPLOYMENT_READY.md` |
| The file reviewed in the architecture review (9 Jul 2026) | 2,347 (~540 CSS, ~1,680 HTML, ~230 JS) | `CODE_REVIEW_ARCHITECTURE_OVERVIEW.md` |
| `Spare-it_site_visit_form_UPDATED.html` v3.0 (11 Jun 2026) | ~6,400 | `PRODUCTION_READY_v3.0.md` |
| `MVP.html` (24 Jun 2026) vs `no-zoom.html` (7 Jul 2026) | 6,943 vs 2,347 | `READINESS_AND_NEXT_STEPS_2026-08-26.html` |

The 26 Aug readiness review resolves which is current: **`MVP.html` (24 Jun) is the version to
take forward**; the July `no-zoom` rewrite "traded away features the field actually needs and
never completed its own QA" — HEIC support dropped, Excel/ZIP export partial, email export
placeholder keys never filled, 22 test cases never run.
(`READINESS_AND_NEXT_STEPS_2026-08-26.html`)

**Persistence, as built:**

- `localStorage` holds audit state (building, floors, stations, metadata) —
  measured at ~20–50 KB for the state object alone.
  (`IMPLEMENTATION_SUMMARY.md`)
- `IndexedDB` (database `AuditDB`, version 1) holds three object stores: `audits`,
  `photos` (indexed by `auditId`), `backups`. (`INDEXEDDB_ROBUST_IMPLEMENTATION.md`)
- Photos are compressed on capture via canvas — 85% of original dimensions, JPEG quality
  0.75 — then written to IndexedDB immediately, with a full audit snapshot every 2–3 minutes
  and silent recovery on page load. (`INDEXEDDB_ROBUST_IMPLEMENTATION.md`,
  `IMPLEMENTATION_SUMMARY.md`)
- Pin coordinates are stored as **0–100% of original image dimensions**, deliberately
  zoom- and pan-independent; pixel positions are computed at render time.
  (`PRODUCTION_READY_v3.0.md`, `CLAUDE.md`, `Backend_Architecture_Recommendation.md`
  which explicitly says "keep this, it survives zoom/pan")
- Floor-plan images are stored base64-encoded inside the JSON state — measured at ~2.8 MB
  per floor in a real export, a 5.7 MB export dominated by floor plan images.
  (`EXPORT_REVIEW_2026-07-02.md`)

**No backend exists.** Deployment is a static host with one serverless function for email.
(`NETLIFY_SETUP.md`) There is no database, no auth, no server-side identity.
(`DATA_SECURITY_AND_PERSISTENCE.md`)

**External dependencies** are all CDN-loaded, not bundled: Hammer.js 2.0.8, heic2any 0.0.4,
SheetJS 0.20.2, JSZip 3.10.1, Montserrat via Google Fonts (`CLAUDE.md`); the reviewed build
lists EmailJS, SheetJS, JSZip and fonts (`CODE_REVIEW_ARCHITECTURE_OVERVIEW.md`). If a CDN is
unavailable the app loads without that feature. (`CLAUDE.md`)

---

## 2. The storage ceiling

This is the single hardest constraint in the project, and it was measured, not assumed —
though some of the numbers carried forward are estimates.

**The arithmetic that started it** (`PHOTO_STORAGE_ANALYSIS.md`, 2 Jul 2026):

- Raw smartphone photo: iPhone 3–4 MB, Android 2–3 MB. **Assumed average: 1.5 MB.**
- A 50-bin floor at 2 photos per bin = 100 photos = **150 MB**.
- 50 bins × 1 photo = 75 MB. 25 bins × 1 photo = 37.5 MB.

**Against the ceilings:**

| Store | Stated capacity | Needed (50 bins × 2 photos) | Fits |
|---|---|---|---|
| localStorage | 5–10 MB | 75–150 MB | No — "12–30x too small" |
| IndexedDB | 50+ MB | 75–150 MB | Not without compression |
| In-memory | RAM | 75–150 MB | Yes, but lost on crash |
| Backend (S3) | Unlimited | — | Yes |

`PHOTO_STORAGE_ANALYSIS.md` states the position bluntly: the requirement "zero tolerance for
data loss" combined with "photos in localStorage" is **"mathematically impossible"** — the gap
is 8–30x.

**What compression bought.** Canvas compression at 85% dimensions / 75% quality was measured
in the implementation at **1.5 MB → 650 KB, ~50–57% reduction**, "<1 second per photo".
(`IMPLEMENTATION_SUMMARY.md`, `INDEXEDDB_ROBUST_IMPLEMENTATION.md`) At 650 KB, 50 photos =
32.5 MB, which `PHOTO_STORAGE_ANALYSIS.md` says "fits in 50MB limit".

**But the documents disagree on how many photos actually fit — and the disagreement was never
reconciled:**

- `PHOTO_STORAGE_ANALYSIS.md` (2 Jul): 50 photos at 650 KB fits in 50 MB.
- `IMPLEMENTATION_SUMMARY.md` (2 Jul, same day): compression "handles 15–20 photos per audit
  in a 50MB budget", and the worked storage example shows only "~10 photos × 650KB = 6.5 MB used".
- `EXPORT_ARCHITECTURE.md` (2 Jul) says of localStorage-only storage: "**Limit: ~5–8 photos per
  audit max**".
- `PLATFORM_INTEGRATION_PROPOSAL.md` (7 Jul) states the IndexedDB limit as "~50MB" and calls
  the ceiling a hard limitation.
- `Backend_Architecture_Recommendation.md` (10 Jul) refers to "the ~50-photo ceiling that risks
  crashes today".
- `READINESS_AND_NEXT_STEPS_2026-08-26.html` (26 Aug) revises the per-photo figure downward
  again: "Photos compress to roughly 150KB each" — and says photos sit "in local browser
  storage, capped near 5–10MB", i.e. localStorage, not IndexedDB.

Treat the 15–20 photo figure as the conservative working number and the ~50-photo figure as
the optimistic one. The 26 Aug figure of 150 KB/photo is the only one taken from the deployed
MVP build; the 650 KB figure is from the July `no-zoom` build.

**What actually breaks, and when:**

1. **Mid-visit, silently, on photo capture.** "Photos are held in local browser storage, capped
   near 5–10MB. This one bites mid-visit rather than at the end, and can lose captured work."
   Severity: High. (`READINESS_AND_NEXT_STEPS_2026-08-26.html`, blocker 04)
2. **At end of day, on export.** The Netlify function accepts about **6 MB per request** —
   roughly **30 photos** once base64 encoding adds a third. "A multi-floor site goes past that,
   and the failure lands at the end of the day when the data is already captured." Severity:
   High. (`READINESS_AND_NEXT_STEPS_2026-08-26.html`, blocker 03)
3. **On email.** Most email services cap attachments at 25 MB; with photos a ~15 MB ZIP "fits
   safely" — "Limit: ~10–15 photos per export". (`EXPORT_ARCHITECTURE.md`)
4. **Netlify free-tier function timeout is 26 seconds**; large photo exports may exceed it.
   (`NETLIFY_SETUP.md`)

**Interim mitigation adopted:** export per floor rather than per visit, which also clears the
local buffer; warn the auditor at the threshold. Estimated ~half a day of work. The proper fix
is the backend decision, which is still parked.
(`READINESS_AND_NEXT_STEPS_2026-08-26.html`)

**Measured vs assumed, explicitly:**

| Number | Status |
|---|---|
| localStorage 5–10 MB per domain | Assumed browser limit; consistent across all docs |
| IndexedDB "50+ MB" | Assumed; never measured against a real device quota |
| 1.5 MB average raw photo | Assumed average (`PHOTO_STORAGE_ANALYSIS.md`) |
| 650 KB compressed | Measured in implementation, logged to console (`IMPLEMENTATION_SUMMARY.md`) |
| ~150 KB compressed | Stated for deployed MVP build (`READINESS_AND_NEXT_STEPS_2026-08-26.html`) |
| ~6 MB Netlify request cap → ~30 photos | Stated as platform limit (`READINESS_AND_NEXT_STEPS_2026-08-26.html`) |
| 5.7 MB real export, ~2.8 MB per floor plan | Measured from an actual export (`EXPORT_REVIEW_2026-07-02.md`) |
| Real photos-per-visit count | **Never measured.** The pilot exists to produce it (`READINESS_AND_NEXT_STEPS_2026-08-26.html`) |

A runtime quota monitor was specified — `navigator.storage.estimate()`, warn at 70%, toast at
90%, checked every 5 minutes. (`INDEXEDDB_ROBUST_IMPLEMENTATION.md`; an earlier variant with
80%/95% thresholds appears in `DATA_SECURITY_AND_PERSISTENCE.md`)

---

## 3. Decision log

| Decision | Options considered | What was chosen | Why | Date / doc |
|---|---|---|---|---|
| Where photos live | (A) IndexedDB, (B) in-memory + IndexedDB backup, (C) backend upload to S3 | **B — in-memory during session, IndexedDB backup** | Zero data loss via 30s/2-3min backup, fast during audit, no backend needed, 3–4 hrs to implement, upgradeable later | 2 Jul 2026 · `PHOTO_STORAGE_ANALYSIS.md` |
| Photo compression | Full quality vs. compressed | **Compress: 85% dimensions, 75% JPEG quality** | Only way to fit a real audit inside IndexedDB; "no visible quality loss for operations team" | 2 Jul 2026 · `INDEXEDDB_ROBUST_IMPLEMENTATION.md`, `IMPLEMENTATION_SUMMARY.md` |
| Persistence strategy | (1) localStorage backup + checksum, (2) IndexedDB backup, (3) encrypted ZIP on floor complete | **Hybrid of 1 + 3, with 2 as emergency backup** | Multiple copies, integrity verifiable, floor lockable once complete | 2 Jul 2026 · `DATA_SECURITY_AND_PERSISTENCE.md` |
| Pin coordinate storage | Pixel positions vs. percentage of original image | **0–100% of original image dimensions** | Survives zoom, pan, scroll, orientation change and reload; verified across zoom 1.0–1.75 and floor plans from 597×317 to 2653×1225 px | 11 Jun 2026 · `PRODUCTION_READY_v3.0.md`; retained in `Backend_Architecture_Recommendation.md` |
| Zoom/pan on floor plans | Keep Hammer.js pinch/pan vs. fit-to-box | **Removed zoom; fit-to-box** (`aspect-ratio: 4/3`, `max-height: 500px`, `background-size: contain`) — 392 lines deleted | Coordinate-transformation complexity was the largest bug source | 2 Jul 2026 · `DEPLOYMENT_READY.md` — **later effectively reversed**: the no-zoom rewrite was parked and `MVP.html` (zoom disabled in place) chosen as the base, 26 Aug 2026 · `READINESS_AND_NEXT_STEPS_2026-08-26.html` |
| Export format | Photos in ZIP vs. references only; CSV vs. Excel vs. JSON | **CSV + Excel (SheetJS) + photos + floor plans, packaged as ZIP (JSZip)** with folder structure `/photos/floor1/stationA/` and naming `audit_{id}_Floor{n}_{station}_{type}_{date}.jpg` | Operations-ready, one file, no backend | 2 Jul 2026 · `EXPORT_ARCHITECTURE.md`, `EXPORT_IMPLEMENTATION_PLAN.md`, `IMPLEMENTATION_SUMMARY.md` |
| Export delivery — first pick | EmailJS (client-side) | **EmailJS**, `EMAIL_CONFIG` with PUBLIC_KEY / SERVICE_ID / TEMPLATE_ID, to `support@spare-it.com`; download-only fallback if unconfigured | 30 minutes of work, zero backend | 2 Jul 2026 · `EXPORT_IMPLEMENTATION_PLAN.md`, `TWO_OPTIONS_PROPOSAL.md` |
| Export delivery — revised | EmailJS vs. Netlify Function + SendGrid | **Netlify Function + SendGrid** (`netlify/functions/send-export.js`), free tier 100 emails/day, API key as a Netlify environment variable | Moves the credential server-side; SendGrid dashboard gives delivery visibility | 24 Jun 2026 · `NETLIFY_SETUP.md` (file dates: `netlify.toml`, `.env.example` both 24 Jun) |
| Hosting | Git-connected Netlify vs. drag-and-drop | **Netlify**, `publish = "."`, functions in `netlify/functions`, catch-all redirect to `Spare-it_site_visit_form_MVP.html` | Static host + one serverless function is all the app needs | 24 Jun 2026 · `NETLIFY_SETUP.md`, `netlify.toml` |
| Ship email export now, or wait for platform sync | Option 1 email export (30 min) vs. Option 2 platform integration (6–7 days) | **Option 1 first, decide on Option 2 after ~2 weeks of feedback** | Ships this week, zero backend change, gathers real usage before investing | 7 Jul 2026 · `TWO_OPTIONS_PROPOSAL.md` |
| Backend: AWS vs. Firebase | Firebase (Romain's suggestion) vs. AWS S3 + Lambda (existing stack) | **Not decided.** The analysis argues AWS on grounds of operational continuity and avoiding lock-in, but explicitly defers: "that's a decision for Laurent and the team" | Firebase wins initial setup (1–2 days vs 5–7); AWS wins long-term integration, uses the stack Spare-it already runs, single control plane, cheaper at scale (~$5–10/mo vs ~$15–30/mo for 500 photos/month) | 8 Jul 2026 · `CRITICAL_ANALYSIS_AWS_VS_FIREBASE.md` |
| Backend: Google Sheets as data store | Path 1 client-side OAuth; Path 2 Apps Script; Path 3 hybrid local-first + Sheets sync; Path 4 Google Forms | **Path 3 (hybrid) recommended** — IndexedDB stays source of truth, sync to Sheets every 5 min via Apps Script | Offline-first preserved, ops get visibility in a familiar tool, batching sidesteps rate limits, clean bridge to Vision later, no lock-in | 9 Jul 2026 · `GOOGLE_SHEETS_INTEGRATION_ANALYSIS.md` |
| Backend: how to talk to Google | Direct Sheets/Drive REST API from browser vs. Apps Script Web App | **Apps Script Web App as a thin backend** — one URL, `fetch()`, one spreadsheet per client keyed by `?sheetId=`, images in Drive | No client-side OAuth on phones, no credentials in a shared HTML file, avoids the 60 reads + 60 writes/min per-user REST quota; Workspace tier gives ~100k UrlFetch/day and ~6 hr/day runtime | 10 Jul 2026 · `Backend_Architecture_Recommendation.md` |
| Platform (Vision) integration | Manual ZIP export vs. three new API endpoints | **Proposed, not built**: `POST /api/audit/upload-photo`, `POST /api/audit/save`, `GET /api/audit/{id}/sync-status`; 6–7 days total | Unlimited photo storage, real-time ops visibility, no manual export | 7 Jul 2026 · `PLATFORM_INTEGRATION_PROPOSAL.md` |
| Long-term platform stack | — | **Specified, not built**: React/Vue PWA, Node+Express or Python+FastAPI, PostgreSQL 14+, Redis, Bull/RabbitMQ, S3 + CloudFront, SendGrid, JWT, AWS (EC2/ECS/Lambda, RDS) | Three-tier system: Admin Portal, Customer Portal, Site Audit App | 25–26 Jun 2026 · `VISION_AUDIT_PLATFORM_SPEC.md` |
| Whether to settle the backend now | Decide in July vs. decide after a pilot | **Deliberately parked** — "It was the thing that stalled this project for seven weeks. Nothing above depends on it, and the pilot is what should settle it." | The pilot produces the two missing numbers: photos per real visit, and whether email export handles them | 26 Aug 2026 · `READINESS_AND_NEXT_STEPS_2026-08-26.html` |

---

## 4. Rejected options and why

Do not relitigate these without new evidence.

- **Photos in localStorage.** Rejected on arithmetic: 5–10 MB against 75–150 MB of real photos,
  an 8–30x gap; "mathematically impossible" alongside a zero-data-loss requirement.
  (`PHOTO_STORAGE_ANALYSIS.md`)
- **Photos in memory only.** Rejected: capacity is fine, but data is lost on crash.
  (`PHOTO_STORAGE_ANALYSIS.md`)
- **Backend photo upload as the MVP answer.** Rejected *for the MVP* only: 3–5 days of work,
  $50–200/month, requires infrastructure that did not exist. Still the recommended endpoint
  for production. (`PHOTO_STORAGE_ANALYSIS.md`, `EXPORT_ARCHITECTURE.md`)
- **Calling the Google Sheets / Drive REST APIs directly from the browser.** Rejected: forces
  per-user OAuth consent on phones or an API key that cannot write; exposes credentials in a
  file that is deliberately shared; hits a 60 reads/min + 60 writes/min per-user quota.
  "Not worth it for a tactical tool." (`Backend_Architecture_Recommendation.md`)
- **Google Forms as the collection endpoint (Path 4).** Rejected beyond proof-of-concept:
  rigid, photos can only be links, and **no offline support** — which breaks the core
  requirement. (`GOOGLE_SHEETS_INTEGRATION_ANALYSIS.md`)
- **Client-side OAuth against Sheets (Path 1).** Rejected: API key exposure on the client,
  50 req/min ceiling, concurrency with no locking, and hard to migrate to Vision later.
  (`GOOGLE_SHEETS_INTEGRATION_ANALYSIS.md`)
- **Firebase — argued against, never formally rejected.** The critique: it introduces a second
  vendor and a second control plane when Spare-it already runs AWS; "simple for initial setup
  ≠ simple for 18 months of operations"; and if the tool ever integrates with the admin
  platform, ops end up managing two databases. The document is explicit that the choice was
  left to Laurent and the team. (`CRITICAL_ANALYSIS_AWS_VS_FIREBASE.md`)
- **The July `no-zoom` rewrite as the shipping build.** Rejected 26 Aug: dropped HEIC support,
  partial Excel/ZIP export, email keys never filled, 22 test cases never run, never deployed.
  Kept, not deleted — "its fit-to-box floor plan is the better long-term answer if pin accuracy
  becomes a field complaint. It is not the answer for September."
  (`READINESS_AND_NEXT_STEPS_2026-08-26.html`)
- **Reactive framework (React/Vue) for the current app.** Not adopted: impact of the imperative
  pattern judged "Low (team is aware, working well)"; revisit only if complexity grows.
  (`CODE_REVIEW_ARCHITECTURE_OVERVIEW.md`)
- **TypeScript, unit tests, module split.** All deferred as LOW/MEDIUM priority post-launch
  items; the single file "works now, not forever".
  (`CODE_REVIEW_ARCHITECTURE_OVERVIEW.md`)

---

## 5. Known architectural gaps

Carried forward and unresolved.

**The ten gaps raised for the July architecture meeting** (`ARCHITECTURAL_GAPS_TO_CONSIDER.md`,
8 Jul 2026). None is recorded as answered anywhere in the corpus:

1. **Existing Spare-it data assets** — does VISION already hold buildings, addresses, client
   info, floor plans? If PwC's 10 sites are already there, no new API is needed.
2. **Existing auth / user management** — does VISION already have OAuth, JWT, roles? If so,
   Firebase adds auth redundantly.
3. **Existing storage infrastructure** — if Spare-it is AWS-first and already uses S3, why
   introduce Google Cloud?
4. **Relationship to TRACK / ENGAGE** — is this a VISION module or a standalone tool? "That
   affects architecture."
5. **Existing operations workflows** — where should photos appear for Lowell's team? Building
   a new Firebase UI may duplicate an existing dashboard.
6. **Offline sync strategy** — once data syncs, where does it live: VISION DB, Firebase, both?
   What is the single source of truth, and how are offline/online edit conflicts resolved?
7. **Multi-site, multi-customer** — customer-level access control, per-site permissions,
   whether photos are private per customer. Affects schema, API permissions and auth model.
8. **Data lifecycle and compliance** — retention period, audit trail of who captured what and
   when, whether photos feed reporting.
9. **Integration with existing waste stream definitions** — are streams defined in VISION and
   should they pre-populate the form and tag photos?
10. **Operational handoff** — who receives the data, how it transitions to the deployment
    workflow, where deployment tracking happens.

The document's own summary of what is missing: *"How does this site visit app fit into
Spare-it's broader product architecture?"* — and it argues the technology choice only becomes
obvious once (a) VISION-module-vs-standalone, (b) reuse of existing infrastructure, and
(c) where ops consume the data are settled.

**Additional unresolved gaps from other documents:**

11. **The backend decision itself.** AWS vs. Firebase vs. Sheets/Apps Script remains open by
    design as of 26 Aug 2026. (`READINESS_AND_NEXT_STEPS_2026-08-26.html`)
12. **No source control.** "The project folder has the deploy config and the serverless
    function, but no version control and no link to a live site."
    (`READINESS_AND_NEXT_STEPS_2026-08-26.html`)
13. **Deployment unverified.** Nobody on the thread has a URL. "Everything else is moot until
    this is confirmed." (`READINESS_AND_NEXT_STEPS_2026-08-26.html`, blocker 02)
14. **Monolithic single-file structure** — rated a Medium-impact risk for testing and
    maintenance; mitigation deferred. (`CODE_REVIEW_ARCHITECTURE_OVERVIEW.md`)
15. **No automated tests.** Test coverage rated 2/5; manual testing only.
    (`CODE_REVIEW_ARCHITECTURE_OVERVIEW.md`)
16. **No sync-status visibility.** Offline photos queue but the user cannot see sync state.
    (`CODE_REVIEW_ARCHITECTURE_OVERVIEW.md`)
17. **No multi-tab synchronization.** Editing in two tabs can overwrite data with no recovery.
    (`DATA_SECURITY_AND_PERSISTENCE.md`)
18. **Base64 photos are not files.** They are embedded strings in the state object; they cannot
    be batch-imported into a system, have no folder structure, and require manual linking by
    ops. Marked-up floor plans are not exported at all in that build.
    (`:File Architecture Analysis.md`)
19. **Unanswered R&D intake questions**: ZIP size limit, JPEG vs PNG, whether `metadata.json`
    is stored in the database or only parsed, photo retention after processing, pixel vs.
    percentage pin coordinates, and whether filenames should be standardised to
    `{building_id}_{floor}_{type}_{datetime}.jpg`. (`:File Architecture Analysis.md`)
20. **Unanswered export-design questions**: bin ID naming scheme, whether a station with three
    streams produces three rows or one row with stream columns, whether floor plans belong in
    the ZIP, and photo type taxonomy. (`EXPORT_IMPLEMENTATION_PLAN.md`)
21. **Station stream type never set.** A real export showed all stations with `type: null` —
    no stream assigned. (`EXPORT_REVIEW_2026-07-02.md`)
22. **Open platform decisions never closed** in `VISION_AUDIT_PLATFORM_SPEC.md`: audit-link
    expiry policy, auditor authentication method (token-only vs OTP vs account vs SSO), email
    service (SendGrid vs SES vs Mailgun), report format (PDF vs JSON vs HTML), how audit data
    reaches the waste assessment tool (webhook vs polling vs manual vs shared DB), launch
    strategy, and monitoring stack. Every one is marked `[DECISION]` with a recommendation and
    an owner, and the approval checkboxes (PM, R&D Lead, Security Lead, Ops Lead) are all
    unchecked.

---

## 6. Security and data-handling notes

Primarily from `DATA_SECURITY_AND_PERSISTENCE.md` (2 Jul 2026), with additions noted.

**Where data lives, and what that exposes.** Audit state — including building name and address
— sits in `localStorage` in plaintext, unencrypted. Photos live in
`state.audit.floors[].stations[].photos[]`, in memory only in the state as originally written.

**Data-loss risk register** (`DATA_SECURITY_AND_PERSISTENCE.md`):

| Scenario | Likelihood | Impact | Recoverable |
|---|---|---|---|
| Browser cache clear | HIGH | Complete data loss | No |
| localStorage quota exceeded | MEDIUM | Newest audit lost | No |
| Browser crash | MEDIUM | Unsaved photos lost | Partial |
| Tab conflict (two tabs editing) | MEDIUM | Data overwrite | No |
| Network loss + browser close | LOW | Photo queue lost | No |
| Session timeout | LOW | Manual re-entry | Partial |

**Data-exposure risk register** (`DATA_SECURITY_AND_PERSISTENCE.md`):

| Scenario | Likelihood | Exposure | Severity |
|---|---|---|---|
| Local browser inspection | HIGH | Building address, photos | MEDIUM |
| Malware / XSS | LOW | All audit data | HIGH |
| Shared device | MEDIUM | Anyone with device access | MEDIUM |
| Unencrypted localStorage | HIGH | Plaintext in browser storage | MEDIUM |

**What exists today:** real-time `saveState()` on every state change; timestamped audit IDs
(`audit-${Date.now()}`); floor plans and pin coordinates persisted; console confirmation on
save. **What is missing:** encryption of sensitive data, backup/recovery mechanism, data
versioning, quota monitoring, multi-tab synchronisation, password protection on export.
(`DATA_SECURITY_AND_PERSISTENCE.md`)

**Integrity mechanism.** A 32-bit rolling `generateChecksum()` is used to detect corruption on
photos and audit snapshots, and `verifyAuditIntegrity()` validates required fields, floor
structure and that every station has `pinX`/`pinY`. This is a corruption check, **not** a
security control — it is unkeyed and offers no tamper resistance despite
`DATA_SECURITY_AND_PERSISTENCE.md` describing it as "detect tampering".
(`INDEXEDDB_ROBUST_IMPLEMENTATION.md`)

**Phased security plan** (`DATA_SECURITY_AND_PERSISTENCE.md`):

- *MVP:* floor backup on completion, confirm dialog before completing a floor, quota check on
  each save, data validation before export, read-only completed floors.
- *Phase 2:* IndexedDB backup, encrypt sensitive fields (building address, photos), data
  versioning, multi-tab sync, recovery UI.
- *Phase 3:* backend backup service, encrypted cloud storage, data expiration policies, audit
  logs, SOC2 compliance if needed.

Assessed risk level with the MVP protections in place: **MEDIUM → LOW**, with data-loss
prevention "95% covered".

**Five questions the document asks and never answers:** should completed floors be truly
read-only; are audit logs required for compliance; how much re-entry is acceptable after a
loss; should photos be encrypted before storage; is multiple auditors on one shared device a
concern.

**Credential handling — the live defect.** `netlify.toml` sets `SENDGRID_API_KEY = ""` under
`[env.production]`. That empty value overrides whatever is configured in the Netlify dashboard,
so export would fail every time, showing the auditor a generic error after a full day of
capture. The fix is to delete the two env lines and set the key in the dashboard only —
~10 minutes. (`READINESS_AND_NEXT_STEPS_2026-08-26.html` blocker 01, confirmed against
`netlify.toml`) `NETLIFY_SETUP.md` gives the correct handling: never commit the key, keep
`.env` in `.gitignore`, set the variable in the dashboard, redeploy after changing it.

**Related credential note.** `CODE_REVIEW_ARCHITECTURE_OVERVIEW.md` flags EmailJS placeholder
credentials in the source as "a security anti-pattern", rated Low impact because those keys are
publishable; it recommends environment variables for production. The move to a Netlify Function
+ SendGrid keeps the genuinely secret key server-side.

**Security controls planned for a backend, not yet in place:** HTTPS in transit, S3 encryption
at rest, API-token access control, photo URLs expiring after 7 days, and an access audit trail.
(`PLATFORM_INTEGRATION_PROPOSAL.md`) If the Apps Script route is taken, an "Anyone with the
link" Web App is a public endpoint and must validate a shared-secret `token` parameter
server-side and reject unknown `sheetId`s. (`Backend_Architecture_Recommendation.md`)

**Security posture rating of the current build:** 3/5 — "no major issues, localStorage is
unencrypted (acceptable for MVP)". (`CODE_REVIEW_ARCHITECTURE_OVERVIEW.md`)

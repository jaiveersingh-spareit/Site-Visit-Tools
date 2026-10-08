# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Repository Overview

**Spare-it Site Visit Form** is a mobile-first single-file web application (~4,100 lines) for recording building site visit data during waste management operations. The form runs entirely client-side (no backend), uses localStorage for persistence, and supports offline operation.

**Current Version:** 3.0 (May 8, 2026)  
**Deploy File:** `Spare-it_site_visit_form_UPDATED.html`  
**Test Suite:** `DAILY_TEST.html`

---

## Architecture & Code Organization

### Single-File Application Structure

The entire application is one HTML file with inline CSS and JavaScript. The structure is:

```
Lines 1–19:        DOCTYPE, meta tags, external libraries (Hammer.js, heic2any, SheetJS)
Lines 20–680:      CSS (brand tokens, layouts, modals, pins, responsive design)
Lines 681–1,635:   HTML body (screens, modals, forms, floor plan containers)
Lines 1,636–4,100: JavaScript (state management, event handlers, UI rendering, business logic)
```

### Code Organization Patterns

**State Management** (Lines 1636–1679)
- Central state object `S = { building, address, hauler, date, auditor, selectedStreams, floors[] }`
- Floor plans stored as nested objects: `S.floors[].stations[]`, `S.floors[].gateways[]`, `S.floors[].displays[]`
- Zoom/pan state separate from data: `floorPlanZoom`, `baseContainerWidth`, `baseContainerHeight`
- Read via helpers: `gF()` (get current floor), `gSt()` (get station), `gGw()` (get gateway), `gDisplay()` (get display)
- Persist via `persist()` which calls `localStorage.setItem()`

**Key State Caching Patterns**
- `baseContainerWidth` and `baseContainerHeight` cached during `updateDisplayDimensions()` to prevent feedback loops during zoom/pan
- `floorPlanDisplayState` maintains rendered dimensions separately from scroll position
- This separation is **critical** to avoid coordinate transformation bugs (see "Coordinate Transformation" below)

**Modular Functions by Domain**
- **Navigation:** `showS(screenId)`, `openModal(id)`, `closeModal(id)`
- **Floor Plan & Pins:** `handlePlanUpload()`, `togglePinMode()`, `handlePlanTap()`, `renderPins()`, `confirmPinLocation()`
- **Stations/Gateways/Displays:** `addStation()`, `saveStation()`, `deleteFloor()`, etc.
- **Photos:** `handleContextPhotoUpload()`, `handleHeicFile()`, `processPhotoFile()`, `queueOfflinePhoto()`, `syncPhotoQueue()`
- **UI Rendering:** `renderFloorDetail()`, `renderStreamsDisplay()`, `renderFloors()` (called after every state change)
- **Validation:** `startVisit()` includes form field validation and modal error display

### Critical Architectural Decisions

1. **No Dedicated Rendering Framework** — UI updates are imperative (direct DOM manipulation). Always re-render after state changes using `renderFloorDetail()`, `renderPins()`, etc.

2. **Touch Gesture Handling** — Hammer.js manages pinch/pan/tap on floor plans. Separate flag `floorPlanGestureActive` prevents tap events from firing during pan/pinch sequences.

3. **Offline + Sync Queue** — Photos selected offline are queued in `S.photoQueue[]` and synced when network returns. Check `updateSyncStatus()` before allowing submission.

4. **Station Deduplication** — When a pin is placed, `showStationLinkModal()` checks for existing stations and offers to link instead of creating duplicates.

5. **HEIC Auto-Conversion** — iPhone photos uploaded in HEIC format auto-convert to JPEG via `heic2any` library before processing.

---

## Coordinate Transformation: The Core Complexity

**Problem:** Pins placed on zoomed/panned floor plans must store coordinates that survive zoom/pan changes and remain accurate on reload.

**Solution:** Two-layer coordinate system:
- **Stored Coordinates (0–100%):** Pin position as percentage of original image dimensions (stored in data)
- **Rendered Coordinates (pixels):** Calculated at render time based on current zoom/pan/scroll state

### How It Works

1. **On Pin Placement** (`handlePlanTap()` → `confirmPinLocation()`):
   - Get tap position in viewport pixels
   - Calculate percentage of current **displayed** image dimensions
   - Store as 0–100% (independent of zoom/pan)

2. **On Render** (`renderPins()`):
   - Retrieve stored 0–100% coordinates
   - Calculate pixel position: `pixelX = (percentX / 100) * currentImageWidth`
   - Apply zoom scaling, scroll offset, centering
   - Position pin absolutely in DOM

3. **Caching Prevents Feedback Loops**:
   - `baseContainerWidth` and `baseContainerHeight` cached at floor load
   - Used in `updateDisplayDimensions()` to avoid recalculation during pan
   - Prevents image size from inflating due to pan overflow

### Edge Cases & Validation

See `validatePinPlacementEdgeCases()` for logic. Key cases:
- **Zoom > 1.0:** Rendered coordinates can exceed 100% (image extends beyond container) — **EXPECTED**
- **Zoom = 1.0:** Rendered should always equal stored (0–100% range)
- **Scroll:** Coordinates recalculated based on current scroll position
- **Orientation Change:** `updateDisplayDimensions()` recalculates all dimensions

**Test via:** `DAILY_TEST.html` runs `validateEdgeCases()` checking coordinate consistency across zoom levels.

---

## How to Modify the Code

### Adding a New Feature

1. **Define state** in object `S` (line 1637)
2. **Add HTML** (lines 681–1,635) — modals, form fields, buttons
3. **Write handlers** — functions that mutate `S`, then call render functions
4. **Call `persist()`** after state changes to save to localStorage
5. **Render immediately** — call `renderFloorDetail()`, `renderPins()`, etc. to reflect changes
6. **Test** — run `DAILY_TEST.html` to verify no console errors

### Example: Adding a new field to a station

```javascript
// 1. Extend S.floors[].stations[].newField = ''
// 2. Add HTML input to modal-station-edit
// 3. Write handler:
function saveStation() {
  const st = gSt();
  st.newField = document.getElementById('inp-new-field').value;
  persist();
  renderFloorDetail(); // Re-render to show changes
}
```

### Editing Pins/Coordinates

**Never hardcode pixel positions.** Always:
- Store as 0–100% (relative to original image)
- Calculate pixels at render time using current zoom/pan state
- Use `updateDisplayDimensions()` to refresh cached dimensions after scroll

### Common Pitfalls

1. **Forgetting `persist()`** — Data disappears on page reload
2. **Hardcoding pixel positions** — Breaks on zoom/pan/orientation change
3. **Not calling render functions** — DOM doesn't update after state changes
4. **Modifying `baseContainerWidth` during pan** — Causes coordinate feedback loops
5. **Assuming viewport = image size** — They differ at zoom levels > 1.0

---

## Testing & Verification

### Before Each Deployment

1. **Run DAILY_TEST.html**
   - Set test date (optional)
   - Click "Run All Tests"
   - Verify 100% score
   - All four categories should pass: Hygiene, Functionality, Features, Mobile

2. **Manual Test Checklist** (from README.md):
   - [ ] Run DAILY_TEST.html — 100% score
   - [ ] Test on iPhone Safari
   - [ ] Test on iPhone Chrome
   - [ ] Test on Android Chrome
   - [ ] Complete full workflow (start to finish)
   - [ ] Check console for errors (F12)
   - [ ] Verify offline functionality (turn off WiFi)
   - [ ] Screenshot test results

### Test Tool

**DAILY_TEST.html** automatically checks:
- No JavaScript console errors
- All buttons have click handlers
- All modals exist and link correctly
- localStorage working
- HEIC photo support (iPhone)
- Pin movement (long-press, drag)
- Station selection modal
- Touch target sizes (48px minimum)
- Viewport configuration

### Development Testing

- **Desktop:** `python3 -m http.server 8000` → `http://localhost:8000/Spare-it_site_visit_form_UPDATED.html`
- **iPhone via local server:** Get Mac IP (`ifconfig | grep "inet "`) → `http://[IP]:8000/Spare-it_site_visit_form_UPDATED.html`
- **Console debugging:** Open DevTools (F12), check "Console" tab for tagged logs like `[PIN TAP]`, `[RENDER]`, `[SAVE]`

---

## Important Files

### Core Application
- **Spare-it_site_visit_form_UPDATED.html** — The main app (deploy this)
- **DAILY_TEST.html** — Test suite (run before deployment)

### Documentation (Reference Only)
- **README.md** — Operations team overview, deployment history
- **TESTING_GUIDE.md** — How to use DAILY_TEST.html
- **Development/** folder — Detailed phase logs, UX design notes, test procedures for each feature
  - `UX_FLOW_PIN_MANAGEMENT_AND_FILES.md` — Design for pin movement, station deduplication, HEIC support
  - `Phase1_PIN_Movement_Tests.md` — Test procedures for drag-to-move pins
  - `Phase2_Station_Modal_Tests.md` — Test procedures for linking existing stations
  - `Phase4_HEIC_File_Support.md` — Test procedures for iPhone photo support
  - `SPRINT_ITERATION_PROCESS_LOG.md` — Metrics, time tracking, implementation notes

### Legacy (Don't Use for Development)
- **Archive/** folder — Old debug files, reference only
- **Spare-it_TESTING_VERSION.html** — Alternate test version (use UPDATED version instead)

---

## Key Functions Reference

### State & Persistence
- `gF()` — Get current floor object
- `gSt()` — Get current station
- `gGw()` — Get current gateway
- `gDisplay()` — Get current display
- `persist()` — Save state to localStorage
- `uid()` — Generate unique ID

### Navigation & UI
- `showS(screenId)` — Switch to screen
- `openModal(id)` — Open modal dialog
- `closeModal(id)` — Close modal
- `goFloors()` — Navigate to floors list

### Floor Plans & Pins
- `handlePlanUpload(e)` — User uploads floor plan image
- `togglePinMode()` — Enter pin placement mode
- `handlePlanTap(e)` — User taps on floor plan (if in pin mode)
- `confirmPinLocation()` — User confirms pin placement
- `renderPins()` — Redraw all pins at correct positions
- `repositionPin()` — User drags existing pin to new location
- `updateDisplayDimensions()` — Recalculate zoom/pan dimensions (call on orientation change or floor load)

### Photos
- `handleContextPhotoUpload(e)` — User selects photo from camera/file
- `handleHeicFile(file, inputElement)` — Auto-convert HEIC to JPEG
- `processPhotoFile(file)` — Validate and process photo
- `queueOfflinePhoto(type, location, dataUrl, description)` — Queue photo if offline
- `syncPhotoQueue()` — Upload queued photos when online

### Stations/Gateways/Displays
- `addStation()` — Create new station at pin location
- `saveStation()` — Update station details
- `deleteFloor()` — Remove floor and all contents
- `showStationLinkModal(stations)` — Offer to link pin to existing station

### Validation & Helpers
- `startVisit()` — Validate form before submission
- `getStreamCode(streamName)` — Map stream to letter code (e.g., "Cardboard" → "C")
- `getNextAvailableLetter()` — Assign station letter (A, B, C...)
- `generateBinCode(stationLetter, streamName, scaleSize)` — Create bin identifier
- `validatePinPlacementEdgeCases(pinX, pinY, currentZoom)` — Check coordinate consistency

---

## Debugging Tips

### Console Logs Are Tagged

Look for patterns in browser console (F12):
- `[PIN TAP]` — Pin placement events
- `[RENDER]` — UI rendering
- `[SAVE]` — Data persistence
- `[HEIC]` — iPhone photo conversion
- `[VALIDATION]` — Form validation
- `[PLAN TAP]` — Floor plan tap detection
- `[ZOOM]` — Zoom/pan state changes

### Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Modal not found: X" | HTML modal element missing | Check lines 681–1,635 for modal ID mismatch |
| Pins appear in wrong location after zoom | Coordinate calculation error | Check `renderPins()` zoom scaling math |
| Form data disappears on reload | Missing `persist()` call | Add `persist()` after state mutation |
| Buttons don't respond on iPhone | Event handler not attached | Check button has `onclick` attribute |
| HEIC photo won't convert | Browser/network issue | User may need to try again or use JPEG |
| Tap doesn't place pin | `pinMode` flag is false | User must click "Add Pin" button first |

### Test Mode

Uncomment or enable test mode variables at top of JavaScript to:
- Log all coordinate transformations
- Record tap positions during testing
- Validate zoom/pan consistency across all zoom levels

See `toggleTestMode()` function.

---

## Release Checklist

Before committing changes:

- [ ] No console errors — Run DAILY_TEST.html
- [ ] All tests pass at 100%
- [ ] Manual walkthrough of modified feature
- [ ] Tested on iPhone (Safari and Chrome)
- [ ] Tested on Android Chrome
- [ ] Offline sync works (photos queue and sync)
- [ ] No hardcoded pixel coordinates
- [ ] State changes call `persist()`
- [ ] UI updates call render functions
- [ ] Update version number in README.md if major changes
- [ ] Screenshot test results for records

---

## External Libraries & Dependencies

| Library | Purpose | CDN URL |
|---------|---------|---------|
| **Hammer.js 2.0.8** | Touch gesture detection (pinch, pan, tap) | cdnjs.cloudflare.com/ajax/libs/hammer.js/2.0.8 |
| **heic2any 0.0.4** | HEIC (iPhone photo) to JPEG conversion | cdn.jsdelivr.net/npm/heic2any@0.0.4 |
| **SheetJS (XLSX) 0.20.2** | Export data to Excel/CSV | cdn.sheetjs.com/xlsx-0.20.2 |
| **JSZip 3.10.1** | Create ZIP archives | cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1 |
| **Montserrat Font** | Brand typography | fonts.googleapis.com |

All libraries loaded via CDN (not bundled). If CDN is unavailable, app loads without that feature.

---

## Performance Notes

- Single HTML file keeps load time minimal (<2MB compressed)
- No server backend eliminates latency
- localStorage limits ~5–10MB per domain (sufficient for 50+ floor plans with photos)
- Photo sync queues to localStorage, synced when online (users can work offline indefinitely)
- Rendering is imperative (not reactive) — updates are fast but require explicit `render*()` calls

---

## Version History

| Version | Date | Key Changes |
|---------|------|-------------|
| 3.0 | May 8, 2026 | Pin movement, station linking, HEIC support, consolidated testing |
| 2.5 | May 6, 2026 | iPhone touch fixes, mobile optimization |
| 1.0–2.0 | Earlier | Core form, photos, floors, export |

---

## Questions or Issues

- **Testing problems:** See TESTING_GUIDE.md or run DAILY_TEST.html
- **Feature design:** See UX_Flow_PIN_MANAGEMENT_AND_FILES.md in Development/
- **Detailed test procedures:** See Phase*.md files in Development/
- **Process notes:** See SPRINT_ITERATION_PROCESS_LOG.md in Development/
- **Bugs:** Run DAILY_TEST.html, screenshot results, include browser console output

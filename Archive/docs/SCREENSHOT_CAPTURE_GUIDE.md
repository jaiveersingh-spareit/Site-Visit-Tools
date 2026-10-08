# Screenshot Capture Guide - Spare-it Site Visit Form

## Quick Start

This guide provides step-by-step instructions to capture all 85+ screenshots for the Miro board.

**Required:**
- HTML file: `Spare-it_site_visit_form_UPDATED.html`
- Browser: Chrome, Firefox, Safari, or Edge
- Tool: Browser Developer Tools (F12) or built-in screenshot tool
- Viewport: Set to **430px width × 900px height** (mobile)

---

## SECTION 1: HOME SCREEN (S1) - 4 Screenshots

### 1.1 S1_empty-state.png
**Action:** Open the HTML file in browser, do not fill any fields
**Expected State:** Fresh home screen with all fields empty
**Filename:** `S1_empty-state.png`

### 1.2 S1_form-filled.png
**Action:** Fill in all fields:
- Building Name: "Downtown Office Complex"
- Address: "123 Main Street, City, State 12345"
- Hauler: "GreenWaste Solutions"
- Date: "2025-06-03"
- Auditor Name: "John Smith"

**Expected State:** All form fields populated, "Begin Site Visit" button visible
**Filename:** `S1_form-filled.png`

### 1.3 S1_streams-selector-modal.png
**Action:** Click "Select Waste Streams" button
**Expected State:** Modal window showing waste stream checkboxes
**Filename:** `S1_streams-selector-modal.png`

### 1.4 S1_validation-errors.png
**Action:** Click "Begin Site Visit" without filling required fields
**Expected State:** Validation error messages displayed
**Filename:** `S1_validation-errors.png`

---

## SECTION 2: FLOORS LIST (S2) - 4 Screenshots

### 2.1 S2_empty-state.png
**Action:** Fill S1 form, select streams, click "Begin Site Visit"
**Expected State:** Floors list screen with no floors created
**Filename:** `S2_empty-state.png`

### 2.2 S2_with-floors.png
**Action:** Click "+ Add Floor" button, enter "Floor 1" or "1", create the floor
**Expected State:** Floors list showing 1-3 floor cards with summary stats
**Filename:** `S2_with-floors.png`

### 2.3 S2_floor-card-detail.png
**Action:** Hover over or focus on a floor card
**Expected State:** Single floor card clearly visible showing number, stations, bins, gateways count
**Filename:** `S2_floor-card-detail.png`

### 2.4 S2_add-floor-modal.png
**Action:** Click "+ Add Floor" button
**Expected State:** Modal window with "Floor Number/Label" input field
**Filename:** `S2_add-floor-modal.png`

---

## SECTION 3: FLOOR DETAIL (S3) - 11 Screenshots

### 3.1 S3_no-floorplan.png
**Action:** Click on a floor to enter floor detail (no floor plan uploaded yet)
**Expected State:** Floor detail screen with empty floor plan area and three lists below
**Filename:** `S3_no-floorplan.png`

### 3.2 S3_with-floorplan.png
**Action:** Upload a floor plan image (any JPG/PNG image)
**Expected State:** Floor plan displayed in the main area
**Filename:** `S3_with-floorplan.png`

### 3.3 S3_complete-lists.png
**Action:** After creating stations, gateways, and displays
**Expected State:** All three list sections visible (Stations, Gateways, Displays)
**Filename:** `S3_complete-lists.png`

### 3.4 S3_station-positioned.png
**Action:** Create a station and position it on the floor plan
**Expected State:** Station card showing "📌 Positioned" status
**Filename:** `S3_station-positioned.png`

### 3.5 S3_station-not-positioned.png
**Action:** Create a station but do not position it
**Expected State:** Station card showing "⚠️ Not positioned" status
**Filename:** `S3_station-not-positioned.png`

### 3.6 S3_gateway-in-list.png
**Action:** Create a gateway via "+ Add" or "Add Pin" workflow
**Expected State:** Gateway card visible in Gateways section with yellow badge
**Filename:** `S3_gateway-in-list.png`

### 3.7 S3_display-in-list.png
**Action:** Create a display via "+ Add" or "Add Pin" workflow
**Expected State:** Display card visible in Displays section with purple badge
**Filename:** `S3_display-in-list.png`

### 3.8 S3_floor-with-all-pins.png
**Action:** Create multiple stations, gateways, and displays; position all on floor plan
**Expected State:** Floor plan showing green (S), yellow (G), and purple (D) pins
**Filename:** `S3_floor-with-all-pins.png`

### 3.9 S3_pin-mode-active.png
**Action:** Click "📍 Add Pin" button on floor detail
**Expected State:** "Add Pin" button changes appearance/shows "Placing..." state
**Filename:** `S3_pin-mode-active.png`

### 3.10 S3_green-highlight.png
**Action:** In pin placement mode, tap on the floor plan
**Expected State:** Green circular highlight at tap location
**Filename:** `S3_green-highlight.png`

### 3.11 S3_edit-mode-dragging.png
**Action:** Long-press on an existing pin on the floor plan
**Expected State:** Pin enters edit mode, showing drag handle or reposition cursor
**Filename:** `S3_edit-mode-dragging.png`

---

## SECTION 4: STATION DETAIL (S4) - 7 Screenshots

### 4.1 S4_complete-view.png
**Action:** Click on a station card to open station detail
**Expected State:** Full station detail view with all fields visible
**Filename:** `S4_complete-view.png`

### 4.2 S4_with-photo.png
**Action:** Upload a photo to the station
**Expected State:** Station detail with photo preview displayed
**Filename:** `S4_with-photo.png`

### 4.3 S4_without-photo.png
**Action:** Station detail without a photo
**Expected State:** Photo area showing upload placeholder or empty state
**Filename:** `S4_without-photo.png`

### 4.4 S4_positioned-state.png
**Action:** Station that has been positioned on floor plan
**Expected State:** Position button visible, station shows positioned status
**Filename:** `S4_positioned-state.png`

### 4.5 S4_not-positioned-state.png
**Action:** Newly created station before positioning
**Expected State:** Position button visible, station shows "⚠️ Not positioned"
**Filename:** `S4_not-positioned-state.png`

### 4.6 S4_bins-modal.png
**Action:** Click "Add Bins" or edit bins section
**Expected State:** Modal showing waste stream checkboxes for bins
**Filename:** `S4_bins-modal.png`

### 4.7 S4_edit-bin-modal.png
**Action:** Click edit on a bin item
**Expected State:** Modal showing bin label, stream, accessories, quantity inputs
**Filename:** `S4_edit-bin-modal.png`

---

## SECTION 5: GATEWAY DETAIL (S5) - 5 Screenshots

### 5.1 S5_complete-view.png
**Action:** Click on a gateway card to open gateway detail
**Expected State:** Full gateway detail with label (showing edit ✎), location, coverage notes
**Filename:** `S5_complete-view.png`

### 5.2 S5_with-photo.png
**Action:** Gateway detail with uploaded photo
**Expected State:** Photo preview visible
**Filename:** `S5_with-photo.png`

### 5.3 S5_without-photo.png
**Action:** Gateway detail without photo
**Expected State:** Photo upload placeholder
**Filename:** `S5_without-photo.png`

### 5.4 S5_positioned.png
**Action:** Gateway that has been positioned
**Expected State:** Position button visible, positioned status
**Filename:** `S5_positioned.png`

### 5.5 S5_rename-modal.png
**Action:** Click edit button (✎) next to gateway label
**Expected State:** Modal with text input for renaming gateway
**Filename:** `S5_rename-modal.png`

---

## SECTION 6: DISPLAY DETAIL (S6) - 4 Screenshots

### 6.1 S6_complete-view.png
**Action:** Click on a display card to open display detail
**Expected State:** Full display detail with label, location, notes
**Filename:** `S6_complete-view.png`

### 6.2 S6_with-photo.png
**Action:** Display detail with uploaded photo
**Expected State:** Photo preview visible
**Filename:** `S6_with-photo.png`

### 6.3 S6_without-photo.png
**Action:** Display detail without photo
**Expected State:** Photo upload placeholder
**Filename:** `S6_without-photo.png`

### 6.4 S6_positioned.png
**Action:** Display that has been positioned
**Expected State:** Position button visible, positioned status
**Filename:** `S6_positioned.png`

---

## SECTION 7: MODALS - 25+ Screenshots

### Creation Modals

#### Modal_station_initial.png
Click "+ Add Station" button, capture the modal in initial state

#### Modal_station_filled.png
Fill station modal with data: "Station A", "Main entrance area"

#### Modal_station_error.png
Try to submit station modal without label to show validation error

#### Modal_gateway_initial.png
Click "+ Add Gateway" button, capture initial modal

#### Modal_gateway_filled.png
Fill gateway modal with data: "GW-01", "North corner coverage"

#### Modal_display_initial.png
Click "+ Add Display" button

#### Modal_display_filled.png
Fill display with data: "Main Display", "Reception area"

### Pin Placement Modals

#### Modal_object-type_full.png
Pin placement workflow - modal showing 3 buttons (Station, Gateway, Display)

#### Modal_object-type_station-highlighted.png
Same modal with Station button highlighted/selected

#### Modal_object-type_gateway-highlighted.png
Same modal with Gateway button highlighted

#### Modal_object-type_display-highlighted.png
Same modal with Display button highlighted

#### Modal_location-confirmed_station.png
Location confirmation modal for station showing letter "A"

#### Modal_location-confirmed_gateway.png
Location confirmation modal for gateway showing label

#### Modal_location-confirmed_display.png
Location confirmation modal for display showing label

### Success Modals

#### Modal_success_station.png
Success modal after creating station (shows checkmark, letter A)

#### Modal_success_gateway.png
Success modal for gateway (shows checkmark, label, yellow text)

#### Modal_success_display.png
Success modal for display (shows checkmark, label, purple text)

### Utility Modals

#### Modal_link-station.png
Modal showing list of unpinned stations when using "Add Pin" workflow

#### Modal_bin-select.png
Waste stream selection for station

#### Modal_edit-bin.png
Bin editing modal with label, stream, accessories, quantity

#### Modal_export.png
CSV export modal showing download options

---

## SECTION 8: WORKFLOW SEQUENCES - 20+ Screenshots

### Workflow 1: Add Pin → New Station (7 steps)

1. **Workflow1_step1_floor-detail.png** - Floor detail initial state
2. **Workflow1_step2_add-pin-active.png** - Click "Add Pin", button changes state
3. **Workflow1_step3_green-highlight.png** - Tap on floor plan, green highlight appears
4. **Workflow1_step4_object-type-modal.png** - Modal showing object type options
5. **Workflow1_step5_station-modal.png** - Station creation modal
6. **Workflow1_step6_success-modal.png** - Success confirmation
7. **Workflow1_step7_final-result.png** - Station appears in list and on floor plan

### Workflow 2: Add Station → Position (7 steps)

1. **Workflow2_step1_add-button.png** - "+ Add Station" button highlighted
2. **Workflow2_step2_form.png** - Station form modal open
3. **Workflow2_step3_success.png** - Station created, success modal
4. **Workflow2_step4_not-positioned.png** - Station in list showing "⚠️ Not positioned"
5. **Workflow2_step5_floor-plan.png** - Click Position button, floor plan appears
6. **Workflow2_step6_confirm.png** - Location confirmation modal
7. **Workflow2_step7_final.png** - Station now shows "📌 Positioned"

### Workflow 3: Add Gateway → Position (7 steps)
[Same as Workflow 2 but for gateways with yellow badges]

### Workflow 4: Add Display → Position (7 steps)
[Same as Workflow 2 but for displays with purple badges]

---

## SECTION 9: FEATURE DEMONSTRATIONS - 10+ Screenshots

### Colors & Styling

**Feature_colors-legend.png**
Screenshot showing color coding:
- Green (#34A853) station badges
- Yellow (#FFD600) gateway badges  
- Purple (#8B5CF6) display badges
- Blue (#2563EB) position buttons
- Red (#EE4547) delete buttons

### Position States

**Feature_not-positioned.png** - Showing "⚠️ Not positioned" indicator

**Feature_positioned.png** - Showing "📌 Positioned" indicator

**Feature_all-pins-on-map.png** - Floor plan with all three pin types visible

### Photo Capture

**Feature_photo-station.png** - Station with photo
**Feature_photo-gateway.png** - Gateway with photo
**Feature_photo-display.png** - Display with photo

### Edit Modes

**Feature_edit-station.png** - Editable station fields
**Feature_edit-gateway.png** - Editable gateway fields
**Feature_edit-display.png** - Editable display fields
**Feature_pin-edit-mode.png** - Long-press pin edit mode on floor plan

---

## SECTION 10: ERROR STATES - 8 Screenshots

**Error_validation_empty-building.png** - Missing building name error

**Error_validation_empty-label-[type].png** - Missing label for station/gateway/display

**Error_validation_missing-streams.png** - No waste streams selected

**Empty_floors.png** - No floors created yet

**Empty_stations.png** - Floor with no stations

**Empty_gateways.png** - Floor with no gateways

**Empty_displays.png** - Floor with no displays

**Empty_floor-plan.png** - Floor detail without floor plan uploaded

---

## SECTION 11: BEFORE/AFTER COMPARISONS - 8 Screenshots

### Phase 2: Unified Workflows
- **Compare_Phase2_before.png** - Two separate entry points (if different)
- **Compare_Phase2_after.png** - Unified workflow

### Phase 4: Display Pin Visibility
- **Compare_Phase4_before.png** - Display not rendering on floor plan
- **Compare_Phase4_after.png** - Display correctly visible

### Phase 5: Data Persistence
- **Compare_Phase5_before.png** - Objects disappearing
- **Compare_Phase5_after.png** - All objects persist

### Phase 7: UI Polish
- **Compare_Phase7_before.png** - Position button missing
- **Compare_Phase7_after.png** - Position button visible

---

## Capture Instructions

### Setup
1. Set browser viewport to **430px width × 900px height**
2. Create folder structure: `/screenshots/screens/`, `/modals/`, etc.
3. Use consistent naming from this guide

### Best Practices
- Capture with populated data (not empty states where possible)
- Use consistent background/lighting
- Show both full view and detail views
- Capture workflow steps in sequence
- Include visual indicators (badges, buttons, highlights)

### Tools
- **Built-in:** Print to PDF, then screenshot (Chrome: Cmd+Shift+P → Print)
- **Extensions:** Full Page Screen Capture, Screenshot Path, etc.
- **Code:** Selenium/Puppeteer screenshot automation (see script provided)

### Format
- PNG format (lossless)
- Name exactly as specified
- Save to appropriate subdirectory
- Total: ~85 images

---

## Summary

| Section | Count | Total |
|---------|-------|-------|
| Main Screens (S1-S6) | 30 | 30 |
| Modals | 25 | 55 |
| Workflows | 20 | 75 |
| Features | 10 | 85 |
| Errors | 8 | 93 |
| Comparisons | 8 | 101 |

**Total Screenshot Target: 85-100 images**

---

## Next Steps

1. ✅ Follow this guide step-by-step
2. ✅ Capture each screenshot as specified
3. ✅ Organize by folder
4. ✅ Upload to Miro board
5. ✅ Create frames and descriptions
6. ✅ Set up interactive elements
7. ✅ Share with team for review

---

**Questions or Issues?**
Refer to UX_AUDIT_AND_EVOLUTION.md for detailed screen descriptions and workflows.


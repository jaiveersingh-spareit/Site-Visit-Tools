# Screenshot Capture Checklist for Miro Board

This document outlines exactly what screenshots need to be captured to fully document the UX platform visually.

---

## SECTION 1: MAIN SCREENS (S1-S6)

### **S1: Home Screen**
- [ ] Full screen view with empty state
- [ ] With building info filled in
- [ ] Waste streams selector modal open
- [ ] Before "Begin Site Visit" (shows validation)

**Screenshot Locations:**
- S1_empty-state.png
- S1_form-filled.png
- S1_streams-selector-modal.png
- S1_validation-errors.png

---

### **S2: Floors List**
- [ ] Empty floors list (initial state)
- [ ] With 2-3 floors created
- [ ] Floor card hover/interaction state
- [ ] Floor creation modal open
- [ ] Modal filled with floor number

**Screenshot Locations:**
- S2_empty-state.png
- S2_with-floors.png
- S2_floor-card-detail.png
- S2_add-floor-modal.png

---

### **S3: Floor Detail (Core Screen)**
- [ ] Floor detail without floor plan
- [ ] Floor detail with floor plan uploaded
- [ ] Shows all three lists: Stations, Gateways, Displays
- [ ] Station with "📌 Positioned" status
- [ ] Station with "⚠️ Not positioned" status
- [ ] Gateway in list
- [ ] Display in list
- [ ] Floor plan with pins visible (S, G, D pins)
- [ ] Pin placement mode active (Add Pin button pressed)
- [ ] Pin placement mode showing green tap highlight
- [ ] Edit mode active (long-press on pin, showing drag-to-reposition)

**Screenshot Locations:**
- S3_no-floorplan.png
- S3_with-floorplan.png
- S3_complete-lists.png
- S3_station-positioned.png
- S3_station-not-positioned.png
- S3_gateway-in-list.png
- S3_display-in-list.png
- S3_floor-with-all-pins.png
- S3_pin-mode-active.png
- S3_green-highlight.png
- S3_edit-mode-dragging.png

---

### **S4: Station Detail**
- [ ] Station detail with full info
- [ ] Station label and location
- [ ] Waste streams section
- [ ] Bins list with items
- [ ] Station photo (with and without photo)
- [ ] Position button (blue, positioned state)
- [ ] Position button (blue, not positioned state)
- [ ] Delete button
- [ ] Modal for adding bins open
- [ ] Modal for editing bin open

**Screenshot Locations:**
- S4_complete-view.png
- S4_with-photo.png
- S4_without-photo.png
- S4_positioned-state.png
- S4_not-positioned-state.png
- S4_bins-modal.png
- S4_edit-bin-modal.png

---

### **S5: Gateway Detail**
- [ ] Gateway detail with full info
- [ ] Gateway label (showing edit button ✎)
- [ ] Location and coverage notes
- [ ] Gateway photo
- [ ] Position button
- [ ] Delete button
- [ ] Gateway rename modal open

**Screenshot Locations:**
- S5_complete-view.png
- S5_with-photo.png
- S5_without-photo.png
- S5_positioned.png
- S5_rename-modal.png

---

### **S6: Display Detail**
- [ ] Display detail with full info
- [ ] Display label (editable)
- [ ] Location and notes
- [ ] Display photo
- [ ] Position button (blue)
- [ ] Delete button

**Screenshot Locations:**
- S6_complete-view.png
- S6_with-photo.png
- S6_without-photo.png
- S6_positioned.png

---

## SECTION 2: MODAL WORKFLOWS

### **Pin Creation Modals**

#### **modal-station (Create Station)**
- [ ] Initial state (auto-filled label, empty location)
- [ ] Filled with data
- [ ] With validation error (empty label)

**Screenshots:**
- Modal_station_initial.png
- Modal_station_filled.png
- Modal_station_error.png

#### **modal-gateway (Create Gateway)**
- [ ] Initial state
- [ ] Filled with data

**Screenshots:**
- Modal_gateway_initial.png
- Modal_gateway_filled.png

#### **modal-display (Create Display)**
- [ ] Initial state
- [ ] Filled with data

**Screenshots:**
- Modal_display_initial.png
- Modal_display_filled.png

---

### **Pin Placement Modals**

#### **modal-pin-type (Object Type Selection)**
- [ ] Three buttons visible: Station, Gateway, Display
- [ ] Station button highlighted
- [ ] Gateway button highlighted
- [ ] Display button highlighted
- [ ] With green tap highlight visible in background

**Screenshots:**
- Modal_object-type_full.png
- Modal_object-type_station-highlighted.png
- Modal_object-type_gateway-highlighted.png
- Modal_object-type_display-highlighted.png

#### **modal-pin-location-confirmed (Location Confirmation)**
- [ ] For station (showing letter A)
- [ ] For gateway (showing label GW1)
- [ ] For display (showing label D1)
- [ ] "Yes, looks great" button
- [ ] "No, reposition" button

**Screenshots:**
- Modal_location-confirmed_station.png
- Modal_location-confirmed_gateway.png
- Modal_location-confirmed_display.png

---

### **Success Modals**

#### **modal-station-created**
- [ ] Shows check mark
- [ ] Shows station letter (A)
- [ ] Action buttons

**Screenshots:**
- Modal_success_station.png

#### **modal-gateway-added**
- [ ] Shows check mark
- [ ] Shows gateway label (GW1)
- [ ] Yellow text (brand color)
- [ ] Continue button

**Screenshots:**
- Modal_success_gateway.png

#### **modal-display-added**
- [ ] Shows check mark
- [ ] Shows display label (D1)
- [ ] Purple text (brand color)
- [ ] Continue button

**Screenshots:**
- Modal_success_display.png

---

### **Utility Modals**

#### **modal-object-type (Add Pin flow)**
- [ ] Floor plan visible in background
- [ ] Green tap highlight visible
- [ ] Three object type buttons
- [ ] Back button

**Screenshots:**
- Modal_object-type_full-view.png

#### **modal-link-station**
- [ ] List of unpinned stations
- [ ] Station items clickable
- [ ] Cancel button
- [ ] Create New button

**Screenshots:**
- Modal_link-station.png

#### **modal-bin-select**
- [ ] Checkboxes for waste streams
- [ ] Stream names visible
- [ ] Save button

**Screenshots:**
- Modal_bin-select.png

#### **modal-edit-bin**
- [ ] Bin label input
- [ ] Stream dropdown
- [ ] Accessories checkboxes
- [ ] Quantity input
- [ ] Save changes button

**Screenshots:**
- Modal_edit-bin.png

#### **modal-export**
- [ ] Export options
- [ ] CSV download button
- [ ] Cancel button

**Screenshots:**
- Modal_export.png

---

## SECTION 3: WORKFLOWS & STATE TRANSITIONS

### **Workflow 1: Add Pin → New Station**
- [ ] Before: Floor detail with floor plan
- [ ] User taps "Add Pin"
- [ ] Pin mode active (button shows "📍 Placing...")
- [ ] User taps location (green highlight)
- [ ] modal-object-type appears
- [ ] User clicks "Station"
- [ ] modal-station appears
- [ ] User fills and submits
- [ ] modal-station-created appears
- [ ] After: Station appears in list and on floor plan

**Screenshots (sequence):**
- Workflow1_step1_floor-detail.png
- Workflow1_step2_add-pin-active.png
- Workflow1_step3_green-highlight.png
- Workflow1_step4_object-type-modal.png
- Workflow1_step5_station-modal.png
- Workflow1_step6_success-modal.png
- Workflow1_step7_final-result.png

### **Workflow 2: Add Station → Position**
- [ ] "+ Add Station" button clicked
- [ ] modal-station appears
- [ ] Station created
- [ ] modal-station-created shows
- [ ] Station appears in list (⚠️ Not positioned)
- [ ] User clicks position button
- [ ] Floor plan with pin mode
- [ ] Green highlight
- [ ] Confirm location modal
- [ ] Final confirmation modal
- [ ] Result: Station positioned (📌 Positioned)

**Screenshots (sequence):**
- Workflow2_step1_add-button.png
- Workflow2_step2_form.png
- Workflow2_step3_success.png
- Workflow2_step4_not-positioned.png
- Workflow2_step5_floor-plan.png
- Workflow2_step6_confirm.png
- Workflow2_step7_final.png

### **Workflow 3: Add Gateway → Position**
[Similar to Workflow 2 but for gateway]

**Screenshots (sequence):**
- Workflow3_step[1-7]_[description].png

### **Workflow 4: Add Display → Position**
[Similar to Workflow 2 but for display]

**Screenshots (sequence):**
- Workflow4_step[1-7]_[description].png

---

## SECTION 4: FEATURE DEMONSTRATIONS

### **Color Coding**
- [ ] Green station badge (#34A853)
- [ ] Yellow gateway badge (#FFD600)
- [ ] Purple display badge (#8B5CF6)
- [ ] Blue position button (#2563EB)
- [ ] Red delete button (#EE4547)

**Screenshots:**
- Feature_colors_legend.png

### **Position States**
- [ ] ⚠️ Not positioned (unpinned object)
- [ ] 📌 Positioned (pinned object)
- [ ] Pin on floor plan (all three types)

**Screenshots:**
- Feature_not-positioned.png
- Feature_positioned.png
- Feature_all-pins-on-map.png

### **Photo Capture**
- [ ] Photo input button
- [ ] Photo preview
- [ ] With photo (all three types)
- [ ] Without photo (all three types)

**Screenshots:**
- Feature_photo-station.png
- Feature_photo-gateway.png
- Feature_photo-display.png

### **Edit Modes**
- [ ] Station detail (editable location, notes)
- [ ] Gateway detail (editable label, location, notes)
- [ ] Display detail (editable label, location, notes)
- [ ] Pin edit mode on floor plan

**Screenshots:**
- Feature_edit-station.png
- Feature_edit-gateway.png
- Feature_edit-display.png
- Feature_pin-edit-mode.png

---

## SECTION 5: ERROR STATES & EDGE CASES

### **Validation Errors**
- [ ] Empty building name (validation modal)
- [ ] Empty station label (validation modal)
- [ ] Empty gateway label (validation modal)
- [ ] Empty display label (validation modal)
- [ ] Missing waste streams (validation modal)

**Screenshots:**
- Error_validation_empty-building.png
- Error_validation_empty-label-[type].png
- Error_validation_missing-streams.png

### **Empty States**
- [ ] No floors created
- [ ] No stations on floor
- [ ] No gateways on floor
- [ ] No displays on floor
- [ ] No floor plan uploaded

**Screenshots:**
- Empty_floors.png
- Empty_stations.png
- Empty_gateways.png
- Empty_displays.png
- Empty_floor-plan.png

### **Edge Cases**
- [ ] Many objects on one floor (performance test)
- [ ] Small screen size (mobile responsiveness)
- [ ] Offline mode (if applicable)
- [ ] Long text entries (text overflow)

**Screenshots:**
- Edge_many-objects.png
- Edge_mobile-view.png
- Edge_long-text.png

---

## SECTION 6: COMPARISON SHOTS (Before/After per Phase)

### **Phase 2: Unified Workflows**
- [ ] Before: Two separate entry points (different UX)
- [ ] After: Unified workflow from both entry points

**Screenshots:**
- Compare_Phase2_before_separate-workflows.png
- Compare_Phase2_after_unified.png

### **Phase 4: Display Pin Visibility**
- [ ] Before: Display not visible on floor plan
- [ ] After: Display visible on floor plan

**Screenshots:**
- Compare_Phase4_before_no-display.png
- Compare_Phase4_after_display-visible.png

### **Phase 5: Data Persistence**
- [ ] Before: Display disappears when adding pin
- [ ] After: Display remains visible

**Screenshots:**
- Compare_Phase5_before_disappearing.png
- Compare_Phase5_after_persistent.png

### **Phase 7: UI Polish**
- [ ] Before: Position button invisible (missing btn-blue)
- [ ] After: Position button visible (with btn-blue)

**Screenshots:**
- Compare_Phase7_before_missing-button.png
- Compare_Phase7_after_visible-button.png

---

## TOTAL SCREENSHOT COUNT: ~85 images

**Organized By:**
- Screens: 20 images
- Modals: 30 images
- Workflows: 28 images
- Features: 12 images
- Errors: 8 images
- Comparisons: 8 images

---

## CAPTURE INSTRUCTIONS

### **Setup**
1. Use a consistent mobile viewport (430px width to match app design)
2. Use consistent lighting/background
3. Use a naming convention: `[Section]_[Screen/Modal]_[State].png`
4. Organize in folders: `/screenshots/screens/`, `/screenshots/modals/`, etc.

### **Best Practices**
- Capture with data populated (not empty states where possible)
- Show both full view and zoomed details
- Capture in sequential order for workflow screenshots
- Include pointer/cursor if showing interactions
- Use annotations/arrows for emphasis

### **Format**
- PNG format (lossless)
- 1080px width (2x the app width for clarity)
- Consistent file naming
- Include brief alt-text for accessibility

---

## MIRO BOARD INTEGRATION

**For each screenshot:**
1. Insert as image on Miro board
2. Add frame label (screen/modal name)
3. Add description/context below
4. Link to relevant workflow
5. Add comment anchor for team feedback

**Interactive elements:**
- Create hotspots on screenshots for navigation
- Link workflow screenshots in sequence
- Connect modals to their trigger screens
- Reference back to evolution timeline


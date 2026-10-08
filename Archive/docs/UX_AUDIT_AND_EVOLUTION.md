# Spare-it Site Visit Form · UX Audit & Evolution

## Executive Summary
The Spare-it Site Visit Form is a mobile-first web application designed for operational teams to conduct on-site surveys, documenting waste management infrastructure, streams, scales, bins, gateways (LoRa devices), and display devices on a floor-by-floor basis. The application supports photo capture, data export, and precise spatial positioning of equipment on floor plans.

---

## PART 1: APPLICATION STRUCTURE

### 1.1 SCREENS (S1-S6)

#### **S1: Home Screen (s-home)**
- **Purpose:** Initial entry point, building/project setup
- **Key Elements:**
  - Building name input
  - Address input
  - Hauler selection
  - Date field
  - Auditor name
  - Contact notes
  - Waste streams selector (modal-driven)
  - Action: "Begin Site Visit" button
- **Data Collected:**
  - Building info
  - Selected waste streams (with scale availability)
  - Context photos (before visit)
- **Navigation:** → S2 (Floors List)

#### **S2: Floors List (s-floors)**
- **Purpose:** Manage multiple floors within the building
- **Key Elements:**
  - Floor list with summary stats (stations, bins, gateways)
  - "+ Add Floor" button
  - Floor cards showing number/label
- **Interactions:**
  - Click floor → S3 (Floor Detail)
  - Add floor modal (modal-floor)
- **Navigation:** ← S1 (Home) | → S3 (Floor Detail)

#### **S3: Floor Detail (s-floor)**
- **Purpose:** Core workspace for a single floor
- **Key Elements:**
  - Floor plan with pinned objects (stations, gateways, displays)
  - "📍 Add Pin" button
  - Upload/replace floor plan button
  - Marked-up floor plan section (optional)
  - Three list sections:
    1. Stations (with letter badges, bin counts)
    2. Gateways (with label badges, location)
    3. Displays (with label badges, location)
  - Bottom bar with floor delete option
- **Interactions:**
  - Click station card → S4 (Station Detail)
  - Click gateway card → S5 (Gateway Detail)
  - Click display card → S6 (Display Detail)
  - Click "Add Pin" → Pin placement workflow
  - Click floor plan pin → Opens corresponding detail view
- **Pin Management:**
  - Long-press pin → Edit mode (drag to reposition)
  - Shows position status for each object
- **Navigation:** ← S2 (Floors) | → S4/S5/S6 (Details)

#### **S4: Station Detail (s-station)**
- **Purpose:** Configure a waste management station
- **Key Elements:**
  - Station letter and floor info header
  - Station label (readonly)
  - Location description
  - Waste streams assigned to station
  - Bin/scale configuration (modal-driven)
  - Bins & Accessories list
  - Station photo
  - "📍 Position" button (blue)
  - "🗑 Delete" button
- **Workflows:**
  - Add bins (modal-bin-select)
  - Edit bin details (modal-edit-bin)
  - Reposition on floor plan (positioning workflow)
  - Upload photo
- **Navigation:** ← S3 (Floor Detail) | → Positioning Workflow

#### **S5: Gateway Detail (s-gateway)**
- **Purpose:** Configure a LoRa gateway device
- **Key Elements:**
  - Gateway label and floor info header
  - Gateway label with edit button (✎)
  - Location description
  - Coverage/Notes
  - Gateway photo
  - "📍 Position" button (blue)
  - "🗑 Delete" button
- **Workflows:**
  - Rename gateway
  - Reposition on floor plan
  - Upload photo
  - Save location/coverage notes
- **Navigation:** ← S3 (Floor Detail) | → Positioning Workflow

#### **S6: Display Detail (s-display)**
- **Purpose:** Configure a display/signage device
- **Key Elements:**
  - Display label and floor info header
  - Display label input (editable)
  - Location description
  - Notes/Details
  - Display photo
  - "📍 Position" button (blue)
  - "🗑 Delete" button
- **Workflows:**
  - Edit display label
  - Reposition on floor plan
  - Upload photo
  - Save location/notes
- **Navigation:** ← S3 (Floor Detail) | → Positioning Workflow

---

### 1.2 MODALS & INTERACTION FLOWS

#### **Core Modals**

| Modal ID | Purpose | Trigger | Key Elements |
|----------|---------|---------|--------------|
| modal-stream-select | Select waste streams | Home screen | Checkboxes per stream, scale size options |
| modal-floor | Create new floor | Floor list | Floor number/label input |
| modal-object-type | Choose object to create | Add Pin workflow | 3 buttons: Station, Gateway, Display |
| modal-station | Create new station | Pin workflow or "+ Add Station" | Station label (auto), location input |
| modal-gateway | Create new gateway | Pin workflow or "+ Add Gateway" | Gateway label (auto), location input |
| modal-display | Create new display | Pin workflow or "+ Add Display" | Display label (auto), location input |
| modal-pin-type | Confirm pin location | First step of positioning | Shows location, asks to confirm or reposition |
| modal-pin-location-confirmed | Final confirmation | Second step of repositioning | "Yes, looks great" / "No, reposition" |
| modal-station-created | Success confirmation | After station creation | Shows station letter, action buttons |
| modal-gateway-added | Success confirmation | After gateway creation | Shows gateway label, "Continue" button |
| modal-display-added | Success confirmation | After display creation | Shows display label, "Continue" button |
| modal-link-station | Link existing unpinned station | "Add Pin" workflow, station creation | List of unpinned stations |
| modal-bin-select | Select waste streams for station | Station detail | Checkboxes per stream |
| modal-edit-bin | Edit bin configuration | Station detail | Label, stream, accessories, quantity |
| modal-position-new-station | Prompt to position new station | After creating station | "Position now" / "Position later" |
| modal-export | Export data | Floor detail | CSV export options |
| modal-validation | Show missing required fields | Before export | Error messages |

#### **Pin Placement Workflow**

**Path 1: Add Pin → New Station**
1. User taps "Add Pin" on floor plan
2. Taps location on floor image
3. **modal-pin-type** appears (location confirmation)
4. User chooses "📍 Station"
5. User can either:
   - **New station:** modal-station opens → fill form → modal-station-created → position prompt
   - **Existing station:** modal-link-station shows unpinned stations → select → pin location
6. Station appears on floor plan with pin
7. User returns to floor detail

**Path 2: Add Station → Position → Pin**
1. User clicks "+ Add Station" button
2. **modal-station** opens → fill form → gateway created (unpinned)
3. **modal-station-created** shows success
4. User sees "⚠️ Not positioned" status
5. User clicks "Position" button on station detail
6. Floor plan appears with pin placement mode
7. User taps location
8. **modal-pin-type** appears (confirm location)
9. **modal-pin-location-confirmed** appears (final confirmation)
10. User clicks "Yes, looks great"
11. Station positioned, appears on floor plan

**Path 3: Add Gateway → Position → Pin**
1. User clicks "+ Add Gateway" button
2. **modal-gateway** opens → fill form → gateway created (unpinned)
3. **modal-gateway-added** shows success
4. User clicks "Position" button on gateway detail
5. Floor plan appears with pin placement mode
6. User taps location
7. **modal-pin-type** appears (confirm location)
8. **modal-pin-location-confirmed** appears (final confirmation)
9. User clicks "Yes, looks great"
10. Gateway positioned, appears on floor plan

**Path 4: Add Display → Position → Pin**
1. User clicks "+ Add Display" button
2. **modal-display** opens → fill form → display created (unpinned)
3. **modal-display-added** shows success
4. User clicks "Position" button on display detail
5. Floor plan appears with pin placement mode
6. User taps location
7. **modal-pin-type** appears (confirm location)
8. **modal-pin-location-confirmed** appears (final confirmation)
9. User clicks "Yes, looks great"
10. Display positioned, appears on floor plan

---

## PART 2: EVOLUTION TIMELINE & FEEDBACK

### Phase 1: Initial Concept (Session Start)
**Goal:** Create a mobile site visit form for recording waste management infrastructure

**Initial Requirements:**
- Record stations (waste bin groups) on floor plans
- Capture photos
- Support multiple floors
- Export data to CSV

**Initial Design Decision:**
- Two separate workflows: "+ Add Station" button and "Add Pin" on floor plan
- Manual position entry with "Position" button later

### Phase 2: Pin Placement UX Issues (Session #1-3)

#### Feedback #1: Inconsistent Workflows
**Issue:** The "+ Add Station" button and "Add Pin" button had completely different UX flows
- "+ Add Station" required manual form entry, then a separate positioning step
- "Add Pin" had unclear flow for positioning

**Resolution:**
- Unified both workflows to use a two-step process:
  1. **Location confirmation modal** to verify tapped position
  2. **Object type selection or details form**
  3. **Final confirmation** before pin appears
- Added visual feedback when pin is placed

**Impact:** Consistent UX across both entry points

#### Feedback #2: Double Counting in Workflows
**Issue:** Users could create stations through multiple paths, causing confusion about positioning state

**Resolution:**
- Simplified workflow to always show "Position" button for unpinned objects
- Clear visual indicator (⚠️) for unpinned objects
- Auto-prompt to position after station creation

**Impact:** Clearer mental model of object states

### Phase 3: Expanding to Gateways & Displays (Session #4-6)

#### Feedback #3: Need Gateway Support
**Issue:** LoRa gateways needed same treatment as stations

**Implementation:**
- Created parallel workflow for gateways
- Added gateway list to floor detail
- Yellow badge color (#FFD600) for visual distinction
- Same positioning workflow as stations

**Result:** Gateways integrated alongside stations

#### Feedback #4: Need Display Device Support
**Issue:** Display devices (signage, monitors) also need positioning and management

**Implementation:**
- Created display workflow (Path 4 above)
- Purple color (#8B5CF6) for display badges
- Added missing --purple CSS variable
- Displays render on floor plan via renderPins()

**Result:** Three object types now supported equally

### Phase 4: Pin Rendering & Visibility Issues (Session #7-8)

#### Feedback #5: Displays Not Appearing on Floor Plan
**Issue:** After creating displays, pins didn't render on the floor plan

**Root Cause:** renderPins() function only rendered stations and gateways, not displays

**Resolution:**
- Added display loop to renderPins()
- Ensured displays.forEach() iterates properly
- Display pins now render with correct styling

**Impact:** Displays fully visible on floor plans

#### Feedback #6: Green Marker Remains After Positioning
**Issue:** After placing a pin, the green tap highlight remained on screen

**Root Cause:** clearTapHighlight() not called in exit workflows

**Resolution:**
- Added clearTapHighlight() to exitPinMode()
- Ensures highlighting cleared in all scenarios

**Impact:** Clean visual state after positioning

### Phase 5: Data Persistence Issues (Session #9-10)

#### Feedback #7: Display/Gateway Disappear When Adding Pins
**Issue:** When creating a display/gateway, then trying to add a pin for a station, the display/gateway disappeared from the floor plan

**Root Causes Identified:**
1. **renderFloorDetail() unconditionally called exitPinMode()** → cleared all pins from view
2. **togglePinMode() didn't re-render pins** → newly created objects not visible
3. **addGateway() lacked validation** → potential silent failures

**Resolutions:**
1. Modified renderFloorDetail() to conditionally exit pin mode
   ```javascript
   const shouldExitPinMode = !stationPositioningMode && !gatewayPositioningMode && !displayPositioningMode;
   if(shouldExitPinMode) exitPinMode();
   ```

2. Added renderPins() to togglePinMode()
   ```javascript
   function togglePinMode(){
     if(pinMode){ exitPinMode(); return; }
     pinMode = true;
     renderPins();  // Re-render all pins
     // ...
   }
   ```

3. Enhanced addGateway() with validation
   ```javascript
   if(!label){ alert('Gateway label cannot be empty.'); return; }
   if(!f.gateways) f.gateways = [];
   ```

**Impact:** All objects now persist throughout workflow

### Phase 6: Repositioning Workflow Alignment (Session #11-12)

#### Feedback #8: Repositioning Inconsistencies
**Issue:** Repositioning flows for gateways/displays weren't aligned with stations

**Missing Elements:**
- Location confirmation modal for gateways/displays
- Final verification before saving repositioned pins
- No clear visual feedback during repositioning

**Resolutions:**
1. Updated handleGatewayPosition() and handleDisplayPosition() to show modal-pin-type
2. Made confirmPinLocation() handle all three object types:
   ```javascript
   if(stationPositioningMode && positioningStationId) { /* station logic */ }
   else if(gatewayPositioningMode && positioningGatewayId) { /* gateway logic */ }
   else if(displayPositioningMode && positioningDisplayId) { /* display logic */ }
   ```
3. Added proper isRepositioning flag detection:
   ```javascript
   isRepositioning = (gw && gw.x !== null && gw.y !== null);
   ```

**Impact:** Consistent repositioning experience across all object types

### Phase 7: UI Polish (Session #13)

#### Feedback #9: Visual Design Issues
**Issue:** Position buttons not visible; display badges invisible

**Root Causes:**
1. Missing .btn-blue CSS class for Position buttons
2. Missing --purple CSS variable for display colors

**Resolutions:**
1. Added .btn-blue CSS class (#2563EB)
   ```css
   .btn-blue { background: #2563EB; color: #fff; }
   ```

2. Added --purple to CSS :root
   ```css
   --purple: #8B5CF6;
   ```

**Impact:** Full visual design implemented and functional

---

## PART 3: CURRENT ARCHITECTURE

### 3.1 Data Model
```javascript
{
  building: string,
  address: string,
  hauler: string,
  date: string,
  auditor: string,
  contactNotes: string,
  selectedStreams: array[{stream, scales}],
  contextPhotos: array[{dataUrl, name}],
  customLocations: array,
  photoQueue: array,
  floors: array[{
    id: string,
    number: string,
    occupancy: string,
    planDataUrl: string,
    planName: string,
    markupDataUrl: string (optional),
    markupName: string (optional),
    stations: array[{
      id, letter, location, notes, photoDataUrl, photoName,
      x (position %), y (position %),
      bins: array[{id, label, stream, accessories, quantity}]
    }],
    gateways: array[{
      id, label, location, notes, photoDataUrl, photoName,
      x (position %), y (position %)
    }],
    displays: array[{
      id, label, location, notes, photoDataUrl, photoName,
      x (position %), y (position %)
    }]
  }]
}
```

### 3.2 Key Functions by Category

**State Management:**
- gF() - get current floor
- gSt() - get current station
- gGw() - get current gateway
- gDisplay() - get current display
- persist() - save to localStorage
- showS(screen) - show screen

**Rendering:**
- renderFloorDetail() - main floor view
- renderPins() - floor plan pins (stations, gateways, displays)
- renderStations() - station list
- renderGateways() - gateway list
- renderDisplays() - display list

**Pin Positioning:**
- togglePinMode() - enter/exit pin placement mode
- handlePlanTap() - handle user tap on floor plan
- confirmPinLocation() - confirm pin location (unified handler)
- startStationPositioning() - prepare station for repositioning
- startGatewayPositioning() - prepare gateway for repositioning
- startDisplayPositioning() - prepare display for repositioning
- handleStationPosition() - process station pin tap
- handleGatewayPosition() - process gateway pin tap
- handleDisplayPosition() - process display pin tap

**Object Creation:**
- addStation() - create new station
- addGateway() - create new gateway
- addDisplay() - create new display

**Object Management:**
- openStation(id) - view station details
- openGateway(id) - view gateway details
- openDisplay(id) - view display details
- deleteStation() - remove station
- deleteGateway() - remove gateway
- deleteDisplay() - remove display
- saveStation() / saveGateway() / saveDisplay() - persist changes

**Modal Interactions:**
- openModal(id) - show modal
- closeModal(id) - hide modal
- pinAddStation() - start new station from pin workflow
- pinAddGateway() - start new gateway from pin workflow
- pinAddDisplay() - start new display from pin workflow

**Utilities:**
- uid() - generate unique ID
- clearTapHighlight() - remove visual pin placement indicator
- exitPinMode() - exit pin placement mode with full cleanup
- renderFloorDetail() - setup floor with conditional pin mode exit

### 3.3 CSS Color System

| Variable | Color | Usage |
|----------|-------|-------|
| --green | #34A853 | Primary, station badges, buttons |
| --yellow | #FFD600 | Gateway badges, secondary actions |
| --purple | #8B5CF6 | Display badges, display branding |
| --dark | #2A2A2A | Text, headers, primary content |
| --danger | #EE4547 | Delete buttons, warnings |
| --bg | #F5F5F5 | Page background |
| --card | #FFFFFF | Card backgrounds |
| --border | #E0E0E0 | Input borders, dividers |
| --muted | #757575 | Secondary text, captions |

### 3.4 Button Styles

| Class | Color | Purpose |
|-------|-------|---------|
| .btn-primary | Green | Main actions (Begin, Save, Continue) |
| .btn-yellow | Yellow | Secondary actions, special emphasis |
| .btn-blue | Blue #2563EB | Position buttons (new in Phase 7) |
| .btn-danger | Red | Delete, destructive actions |
| .btn-ghost | Gray | Cancel, secondary options |
| .btn-outline | Green border | Alternative primary |
| .btn-gw-outline | Yellow border | Gateway-specific actions |

---

## PART 4: CURRENT FEATURE COMPLETENESS

### ✅ Implemented
- [x] Multi-floor support
- [x] Station creation and management
- [x] Gateway device support
- [x] Display device support
- [x] Floor plan upload and pinning
- [x] Photo capture for all objects
- [x] Position management (initial and repositioning)
- [x] Data persistence to localStorage
- [x] CSV export functionality
- [x] Modal-based workflows
- [x] List views for all object types
- [x] Detail views for all object types
- [x] Bin/stream configuration for stations
- [x] Location and notes fields
- [x] Visual indicators for positioning state
- [x] Success confirmations after creation
- [x] Edit mode for repositioning on floor plan

### 🔄 Pending/Future Enhancements
- [ ] Cloud sync/backup
- [ ] Multi-user support
- [ ] Permission levels
- [ ] Template creation/reuse
- [ ] Advanced analytics
- [ ] Offline mode improvements
- [ ] Real-time collaboration
- [ ] Mobile app wrapper

---

## PART 5: KEY LEARNINGS & DESIGN DECISIONS

### 1. **Unified Workflows Over Separate Paths**
**Learning:** Having two ways to create/position objects (button + map) created confusion.
**Decision:** Unified to consistent two-step workflow with confirmation modals.
**Result:** Cleaner mental model, easier to learn.

### 2. **Position as State, Not Property**
**Learning:** Initially treated positioning as optional. Users needed to understand state.
**Decision:** Made positioning explicit with visual indicators (⚠️ Not positioned vs 📌 Positioned).
**Result:** Clear understanding of what still needs to be done.

### 3. **Color Coding for Object Types**
**Learning:** Users needed quick visual identification of different equipment types.
**Decision:** Station=Green, Gateway=Yellow, Display=Purple (brand-aligned).
**Result:** Instant visual differentiation across all views.

### 4. **Modal-Driven Workflows Over In-Place Editing**
**Learning:** Complex workflows need clear state boundaries.
**Decision:** Use modals for creation, positioning, and confirmation.
**Result:** Clear step-by-step progression, no hidden state.

### 5. **Data Persistence Over Re-rendering**
**Learning:** Objects disappearing due to render logic was confusing.
**Decision:** Preserve objects throughout workflow, conditional render exits.
**Result:** Objects remain visible and editable in any order.

---

## PART 6: READY FOR MIRO BOARD

This audit is structured for conversion to a Miro board with the following recommended layout:

1. **Left Column:** Evolution Timeline (12-month sprint view)
2. **Top Row:** Current Architecture & Data Model
3. **Center:** Screen Flows & Wireframes
4. **Right Column:** Modal Interactions & Decision Trees
5. **Bottom:** Feature Matrix & Completeness

Would you like me to proceed with:
1. Creating detailed wireframes/screenshots of each screen?
2. Generating the Miro board layout?
3. Adding any additional documentation (user flows, accessibility notes, etc.)?


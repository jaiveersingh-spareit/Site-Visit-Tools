# 🔍 Detailed Code Hygiene Checklist - Site Visit Form

**Last Updated:** May 6, 2026  
**Purpose:** Systematic verification of all buttons, fields, and functionality across all pages

---

## 📄 Page 1: Landing Page (s-home)

### Form Fields Verification
- [ ] **inp-building** - Text input, Building Name (REQUIRED)
  - Label present: Yes
  - Accessible in startVisit(): Yes
  - Validation check: Building name required
  
- [ ] **inp-address** - Text input, Building Address
  - Label present: Yes
  - Optional field: Yes
  - Saved correctly: Yes

- [ ] **inp-hauler** - Text input, Hauler Name
  - Label present: Yes
  - Optional field: Yes
  - Saved correctly: Yes

- [ ] **inp-date** - Date input (REQUIRED)
  - Label present: Yes with red asterisk
  - Default value set on load: Yes (today's date)
  - Validation check: Date required
  - Accessible in startVisit(): Yes

- [ ] **inp-auditor** - Text input, Auditor Name (REQUIRED)
  - Label present: Yes with asterisk
  - Validation check: Auditor name required
  - Accessible in startVisit(): Yes

- [ ] **inp-contact-notes** - Textarea, Contact Notes
  - Label present: Yes
  - Optional field: Yes
  - Min height: 80px
  - Placeholder text: Yes

### Buttons Verification

#### 1. ⚙️ Select Waste Streams Button
- [ ] ID: None (triggered by onclick)
- [ ] Handler: `openStreamSelectHome()`
- [ ] Function exists: Yes, defined at line ~1139
- [ ] Opens modal: Yes, `modal-stream-select`
- [ ] Visual indication: Shows selected streams below
- [ ] Expected behavior: Opens modal to select waste streams, stays on landing page

#### 2. 📷 Take Photo Button
- [ ] ID: `add-context-photo-btn`
- [ ] Handler: `promptContextPhotoUpload()`
- [ ] Function exists: Yes, defined at line ~1262
- [ ] Opens: Camera input (id="context-photo-camera")
- [ ] File input: Yes, accept="image/*", capture="environment"
- [ ] Expected behavior: Opens device camera

#### 3. 🖼️ Choose File Button
- [ ] ID: None (inline button)
- [ ] Handler: `promptContextPhotoFile()`
- [ ] Function exists: Yes, defined at line ~1267
- [ ] Opens: File picker input (id="context-photo-file")
- [ ] File input: Yes, accept="image/*"
- [ ] Expected behavior: Opens file picker

#### 4. Begin Site Visit Button (PRIMARY ACTION)
- [ ] ID: `btn-start-visit`
- [ ] Handler: Event listeners (click + touchend)
- [ ] Attached at: Lines 1004-1013
- [ ] Calls: `startVisit()`
- [ ] Validation: Yes, checks required fields
- [ ] Shows validation modal: Yes, `modal-validation`
- [ ] On success: Calls `persist()` then `goFloors()`
- [ ] Expected behavior: 
  - If fields missing → Show modal with errors
  - If complete → Save and navigate to floors page

#### 5. 🔄 Sync Photos Button
- [ ] ID: `sync-now-btn`
- [ ] Handler: `syncPhotoQueue()`
- [ ] Display: Hidden by default
- [ ] Visibility condition: Only when photoQueue has pending items
- [ ] Expected behavior: Syncs offline queued photos

#### 6. Resume Session Button (if session exists)
- [ ] ID: None
- [ ] Handler: `resumeSession()`
- [ ] Display: Hidden by default
- [ ] Shows when: Saved session detected (S.building exists)
- [ ] Expected behavior: Restores previous session and goes to floors

### Modal Verification

#### Stream Selection Modal (modal-stream-select)
- [ ] ID: `modal-stream-select`
- [ ] Trigger button: Select Waste Streams
- [ ] Contains: Checkboxes for each waste stream
- [ ] Confirm button: Calls `confirmStreamSelection()`
- [ ] Cancel button: Closes modal
- [ ] Expected behavior:
  - Opens with list of waste streams
  - User checks desired streams
  - Confirms selection → updates display, stays on page
  - Streams are saved to S.selectedStreams

#### Context Photos Display
- [ ] ID: `context-photos-list`
- [ ] Renders: Uploaded photos with delete buttons
- [ ] Delete function: `removeContextPhoto(index)`
- [ ] Max photos: 5
- [ ] Expected behavior: Shows thumbnails of added context photos

#### Validation Modal (modal-validation)
- [ ] ID: `modal-validation`
- [ ] Trigger: `openModal('modal-validation')` from startVisit()
- [ ] Content: `validation-errors-list` (dynamically populated)
- [ ] Shows: List of missing required fields with icons
- [ ] Button: "Got it, let me fix these" → closes modal
- [ ] Expected behavior: Displays what needs to be filled before proceeding

### Function Calls - Landing Page
- [ ] `startVisit()` - Main validation and navigation
- [ ] `openStreamSelectHome()` - Opens stream selector
- [ ] `promptContextPhotoUpload()` - Opens camera
- [ ] `promptContextPhotoFile()` - Opens file picker
- [ ] `handleContextPhotoUpload()` - Processes uploaded photo
- [ ] `removeContextPhoto()` - Removes a photo
- [ ] `renderContextPhotos()` - Displays photos
- [ ] `persist()` - Saves to localStorage
- [ ] `goFloors()` - Navigates to floors page

---

## 📊 Page 2: Floors List (s-floors)

### Display Elements
- [ ] Streams display: `streams-display` div
- [ ] Floor list: `floor-list` div
- [ ] Both render correctly from S data

### Buttons
- [ ] ✎ Edit Streams - Calls `editStreamSelection()`
- [ ] ＋ Add Floor - Opens `modal-floor`
- [ ] Export button (bottom bar) - Opens `modal-export`
- [ ] Edit Info button (bottom bar) - Goes back to `s-home`

### Modals on this page
- [ ] modal-floor (add new floor)
- [ ] modal-export (export data)
- [ ] Floor plan upload
- [ ] Station/Gateway creation

---

## 🏢 Page 3: Floor Detail (s-floor)

### Floor Plan Display
- [ ] ID: `plan-img`
- [ ] Upload area functional: Yes
- [ ] Drag/drop support: Yes
- [ ] Pin placement: Yes, with station/gateway modes

### Buttons
- [ ] Add Station - Opens station modal
- [ ] Add Gateway - Opens gateway modal
- [ ] Pin Mode toggle - Enables/disables pin placement
- [ ] Edit Floor - Opens edit modal

### Station/Gateway Lists
- [ ] Render correctly: Yes
- [ ] Delete buttons functional: Yes
- [ ] Click to edit: Yes

---

## 🎯 Page 4: Station Detail (s-station)

### Form Fields
- [ ] Station name input: Functional
- [ ] Location dropdown: Has default + custom options
- [ ] Bin selection: Works correctly

### Buttons
- [ ] Add Bin - Opens bin modal
- [ ] Edit Station - Updates name/location
- [ ] Delete - Removes station
- [ ] Pin Mode - Allows repositioning

---

## ⚠️ Page 5: Gateway Detail (s-gateway)

### Fields
- [ ] Gateway name: Editable
- [ ] Gateway description: Optional

### Buttons
- [ ] Edit - Opens edit modal
- [ ] Delete - Removes gateway
- [ ] Pin Mode - Repositions pin

---

## ✅ Universal Checks (All Pages)

### Navigation
- [ ] Back button (← arrow) present: All main screens
- [ ] Back button functional: Uses `showS('s-home')`
- [ ] Screen switching: Works smoothly
- [ ] Scroll to top on navigation: Yes, `window.scrollTo(0,0)`

### Modal System
- [ ] Modal overlay (modal-overlay class): Yes
- [ ] Click outside closes: Yes
- [ ] Modal handle (drag indicator): Yes
- [ ] Smooth animation: `slideUp` animation defined

### Data Persistence
- [ ] localStorage key: `'spare_site_v3'`
- [ ] `persist()` function: Called after all changes
- [ ] Auto-restore on load: Yes, in init() function
- [ ] Data structure: S object properly initialized

### Offline Support
- [ ] Online/offline listeners: Lines 979-980
- [ ] isOffline variable: Tracks connectivity
- [ ] Photo queue: S.photoQueue array
- [ ] Sync status display: Badge + button

### Accessibility
- [ ] Form labels: All inputs have labels
- [ ] Required field indicators: Red asterisks (*)
- [ ] Placeholder text: Helpful examples
- [ ] Button text: Clear CTAs

---

## 🧪 Testing Scenarios

### Scenario 1: Complete a Site Visit (Happy Path)
```
1. Fill in: Building Name, Date, Auditor Name
2. Select: Waste Streams (via modal)
3. Add: Context photos (optional)
4. Click: Begin Site Visit
   → Should navigate to s-floors
   → Header should show building info
   → Streams should be displayed
```

### Scenario 2: Incomplete Form Submission
```
1. Click: Begin Site Visit (missing fields)
   → Should show validation modal
   → Lists missing: Building Name, Date, Auditor Name, Streams
2. Click: "Got it, let me fix these"
   → Modal closes, stay on landing page
3. Fill in one field
4. Click: Begin Site Visit again
   → Still shows what's missing
```

### Scenario 3: Context Photos
```
1. Click: 📷 Take Photo → Opens camera
2. Take photo → Should save to S.contextPhotos
3. Photo displays below with thumbnail
4. Click: X button → Photo removed
5. Max 5 photos → Button disables
```

### Scenario 4: Stream Selection
```
1. Click: ⚙️ Select Waste Streams
   → Opens modal with checkboxes
2. Check: Recycling, Compost, Waste
3. Click: Confirm Selection
   → Modal closes, stays on landing page
   → Display shows selected streams
```

---

## 📋 Known Issues to Check

- [ ] Begin Site Visit button now uses validation modal (not alert)
- [ ] Stream selection doesn't auto-navigate (fixed)
- [ ] Context photos on landing page (moved from floors)
- [ ] Camera input support for mobile
- [ ] File picker compatibility across devices

---

## 🎯 Success Criteria

✅ **All buttons have handlers**
✅ **All form fields have IDs and labels**
✅ **All onclick handlers reference defined functions**
✅ **All modals have proper triggers and close buttons**
✅ **Navigation works between all screens**
✅ **Data persists to localStorage**
✅ **Validation shows on-page (modal, not alert)**
✅ **Mobile buttons work (click + touchend)**
✅ **No console errors on page load**
✅ **All required fields are validated**

---

## 🔧 How to Test

1. **Open the main HTML file** in a browser
2. **Open browser DevTools** (F12) → Console tab
3. **Check for errors** - should be none
4. **Test each scenario** above
5. **Use Code_Hygiene_Check.html** to verify structure
6. **Test on mobile device** for responsive behavior

---

Generated: May 6, 2026

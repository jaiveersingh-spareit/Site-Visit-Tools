# 🧪 TESTING EXECUTION CHECKLIST - May 6, 2026

**Purpose:** Step-by-step guide to test Phase 4, 1, and 2 in recommended order  
**Goal:** Achieve stable environment ready for operations team

---

## PHASE 4: HEIC FILE SUPPORT (iPhone Photos)
**Estimated Time:** 15 minutes  
**Primary Testing Device:** iPhone (Safari preferred first)

### Pre-Test Checklist
- [ ] iPhone charged and connected to internet
- [ ] Form loaded on iPhone Safari
- [ ] Have at least 1 HEIC photo (any iPhone camera photo)
- [ ] Browser DevTools console ready (if testing on desktop)
- [ ] Clear browser cache if needed

### Test 4.1: iPhone Safari HEIC Upload (CRITICAL)

**Device:** iPhone + Safari  
**Photo Type:** HEIC (native iPhone photo)

**Steps:**
1. Open form in Safari on iPhone
2. Navigate to building context photos section (first page)
3. Click "📷 Take Photo" button
4. Select a HEIC photo from camera roll
5. Wait for upload to complete
6. **Verify:** Photo displays in preview area

**Expected Results:**
- [ ] Photo selected without error
- [ ] Photo displays immediately (no blank image)
- [ ] Can see photo clearly in preview
- [ ] Photo saved and visible on return to page
- [ ] No browser errors

**If FAILED:**
```
Issue: Photo doesn't display
→ Check: Is it actually HEIC? (check file name)
→ Try: Different HEIC photo
→ Try: Safari on Mac if available
```

**If PASSED:**
✅ Phase 4 is working for Safari  
→ Proceed to 4.2

---

### Test 4.2: iPhone Chrome HEIC Upload

**Device:** iPhone + Chrome  
**Photo Type:** HEIC (same photo as 4.1)

**Steps:**
1. Close Safari, open Chrome on same iPhone
2. Load form again
3. Go to building context photos
4. Click "📷 Take Photo"
5. Upload same HEIC photo
6. **Verify:** Photo auto-converts and displays

**Expected Results:**
- [ ] File selected
- [ ] heic2any library converts automatically (1-2 seconds)
- [ ] Photo displays after conversion
- [ ] No error messages
- [ ] Console shows: `[PHOTO] HEIC converted to JPEG`

**If FAILED:**
```
Issue: "HEIC not supported" message
→ Check: Internet connection (heic2any loads from CDN)
→ Try: Hard refresh (Cmd+Shift+R on iPhone Safari)
→ Try: Different browser if available

Issue: Photo uploads but doesn't display
→ Check: Console for errors
→ Try: Different HEIC file
→ Try: Different browser
```

**If PASSED:**
✅ Phase 4 is working for Chrome  
→ **Phase 4 Complete** ✅

---

## PHASE 1: PIN MOVEMENT (Edit & Move Pins)
**Estimated Time:** 30 minutes  
**Primary Testing Device:** Desktop (easier for long-press testing)

### Pre-Test Checklist
- [ ] Form loaded on desktop (Chrome or Firefox)
- [ ] Have a floor with a floor plan image
- [ ] Have at least 1 station with a pin placed
- [ ] Browser DevTools open (F12)
- [ ] Console tab visible

### Test 1.1: Long-Press Pin Detection

**Device:** Desktop (Chrome/Firefox)  
**Scenario:** Pin in normal mode → Edit mode

**Steps:**
1. Open floor detail page with floor plan
2. Find a station pin on the map
3. **Long-press (click and hold for 0.5 seconds)** on the pin
4. Wait for visual feedback
5. **Verify:** Pin highlights and delete button appears

**Expected Results:**
- [ ] Pin color changes (becomes blue)
- [ ] Pin gets brighter/highlighted
- [ ] Red delete button (✕) appears below pin
- [ ] Console shows: `[PIN] Entering edit mode for: station [id]`
- [ ] No JavaScript errors in console

**If FAILED:**
```
Issue: Long-press not detected
→ Try: Hold mouse button longer (full 0.5s)
→ Try: Clear browser cache (Ctrl+Shift+Delete)
→ Try: Different browser
→ Check: Console for errors

Issue: Visual feedback missing
→ Try: Hard refresh (Ctrl+Shift+R)
→ Check: CSS loaded (should see edit-mode styles)
→ Check: F12 → Elements → .plan-pin has edit-mode class
```

**If PASSED:**
✅ Edit mode activation working  
→ Proceed to 1.2

---

### Test 1.2: Drag Pin to New Location

**Device:** Desktop  
**Scenario:** Pin in edit mode → Drag to different spot

**Steps:**
1. Have pin in edit mode (from Test 1.1)
2. **Drag the pin** to a new location on the floor plan
3. Watch pin position update in real-time
4. **Release** the mouse button
5. Verify pin stays in new location

**Expected Results:**
- [ ] Pin follows mouse cursor while dragging
- [ ] Position updates in real-time (smooth movement)
- [ ] Pin doesn't jump around (stable drag)
- [ ] After release, pin stays at new position
- [ ] Edit mode exits automatically
- [ ] Console shows: `[PIN] Station moved to X Y`

**If FAILED:**
```
Issue: Pin doesn't follow cursor
→ Check: Are you in edit mode? (should be highlighted)
→ Try: Drag more slowly
→ Try: Drag larger distance
→ Check: Console for drag handler errors

Issue: Pin jumps around
→ Try: Refresh page (might be rendering issue)
→ Check: No other listeners interfering
→ Try: Different browser
```

**If PASSED:**
✅ Drag movement working  
→ Proceed to 1.3

---

### Test 1.3: Delete Pin Button

**Device:** Desktop  
**Scenario:** Pin in edit mode → Click delete button

**Steps:**
1. Long-press a pin to enter edit mode (Test 1.1 steps)
2. Click the red **delete button (✕)** below the pin
3. Confirm in dialog: "Delete this pin?"
4. **Verify:** Pin disappears from map

**Expected Results:**
- [ ] Confirmation dialog appears: "Delete this pin?"
- [ ] Click "OK" in dialog
- [ ] Pin immediately disappears from map
- [ ] Station still exists in list (but no pin on map)
- [ ] Console shows: `[PIN] Deleted station [id]`
- [ ] Page refresh confirms deletion persisted

**If FAILED:**
```
Issue: Delete button not visible
→ Try: Long-press longer (full 0.5s)
→ Try: Hard refresh page

Issue: Delete dialog doesn't appear
→ Try: Different browser
→ Check: Console for errors

Issue: Pin still visible after delete
→ Check: Did you confirm dialog?
→ Refresh page to verify (should be gone)
```

**If PASSED:**
✅ Delete functionality working  
→ Proceed to 1.4

---

### Test 1.4: Position Persistence (Reload Test)

**Device:** Desktop  
**Scenario:** Move pin → Reload page → Verify position saved

**Steps:**
1. Move a pin to a new location (Test 1.2)
2. **Refresh the page** (F5)
3. Navigate back to same floor
4. **Verify:** Pin is still at new location

**Expected Results:**
- [ ] After refresh, pin still at new position
- [ ] Position matches exactly where you left it
- [ ] No loss of data
- [ ] localStorage persisted the change

**If FAILED:**
```
Issue: Pin back at original position
→ Check: Did you actually move it? (verify Test 1.2 worked)
→ Check: Browser localStorage enabled
→ Check: Not in private/incognito mode
→ Try: Different browser
```

**If PASSED:**
✅ Position persistence working  
→ Proceed to 1.5

---

### Test 1.5: Mobile Touch Testing (Bonus)

**Device:** Mobile/Tablet (iOS or Android)  
**Scenario:** Tap-and-hold pin to move it

**Steps:**
1. Open form on mobile device
2. Open floor with pins
3. **Tap-and-hold** (long-press) a pin for 0.5 seconds
4. **Drag finger** to new location
5. **Release** touch
6. Verify pin moved

**Expected Results:**
- [ ] Long-press detected on touch
- [ ] Edit mode activates visually
- [ ] Finger drag follows pin
- [ ] Release saves position
- [ ] Works smoothly without lag

**If SKIPPED (no mobile available):**
⏸️ Skip this test (can test later)

**If PASSED:**
✅ Mobile touch working  
→ **Phase 1 Complete** ✅

---

## PHASE 2: STATION SELECTION MODAL
**Estimated Time:** 20 minutes  
**Primary Testing Device:** Desktop (easier modal interaction)

### Pre-Test Checklist
- [ ] Have a floor with 2+ stations that already have pins
- [ ] Floor plan image loaded
- [ ] "📍 Add Pin" button visible and working
- [ ] Browser console open

### Test 2.1: Existing Station Modal Appears

**Device:** Desktop  
**Scenario:** Place new pin when stations already exist

**Setup:**
1. Open floor with 2+ existing stations (each with a pin)
2. Click "📍 Add Pin" button
3. Click on floor plan at a new location (not on existing pin)
4. Choose "📍 Station" from the type modal

**Expected Results:**
- [ ] "Station Already on Floor?" modal appears
- [ ] Lists all existing stations (A, B, C, etc.)
- [ ] Shows station letter (colored badge)
- [ ] Shows station name and location
- [ ] Console shows: `[PIN] Linked existing station...` (when selecting)

**If FAILED:**
```
Issue: Modal doesn't appear, goes to Create Station instead
→ Reason: No existing stations with pins found
→ Fix: Make sure stations have pins (x/y coordinates set)
→ Fix: Check floor has multiple pinned stations

Issue: Modal appears but empty/missing stations
→ Check: Are stations actually on this floor?
→ Check: Do they have pins? (check if x/y != null)
```

**If PASSED:**
✅ Modal detection working  
→ Proceed to 2.2

---

### Test 2.2: Link Existing Station to Pin

**Device:** Desktop  
**Scenario:** Modal visible → Select existing station → Pin placed

**Steps:**
1. Have station selection modal open (Test 2.1)
2. Click on one of the existing stations in the list
3. **Verify:** Modal closes and pin appears at click location
4. **Verify:** Selected station shows in list

**Expected Results:**
- [ ] Clicking a station in list selects it
- [ ] Modal closes automatically
- [ ] Pin appears exactly where you clicked
- [ ] Station detail shows updated location
- [ ] Console shows: `[PIN] Linked existing station X to pin at Y Z`
- [ ] No duplicate station created

**If FAILED:**
```
Issue: Station not linkable
→ Try: Different station from list
→ Check: Station is valid (has name, letter)
→ Try: Refresh and try again

Issue: Pin not appearing
→ Check: Did you click on floor plan before selecting?
→ Try: Different location on floor
```

**If PASSED:**
✅ Linking working  
→ Proceed to 2.3

---

### Test 2.3: Create New Option Still Works

**Device:** Desktop  
**Scenario:** Modal open → Click "Create New" button

**Steps:**
1. Have station selection modal open
2. Click "Create New" button
3. **Verify:** Goes to new station creation modal
4. Fill in: Letter, Name, Location
5. Create station

**Expected Results:**
- [ ] "Create New" button visible in modal
- [ ] Clicking opens station creation modal
- [ ] Can fill in station details
- [ ] New station created at pin location
- [ ] Station appears in list for next pin

**If FAILED:**
```
Issue: Create New button missing
→ Try: Scroll modal to see button
→ Refresh and try again

Issue: Doesn't go to creation modal
→ Try: Different browser
→ Check: Console for errors
```

**If PASSED:**
✅ New station creation still works  
→ Proceed to 2.4

---

### Test 2.4: No Modal on First Pin (No Existing Stations)

**Device:** Desktop  
**Scenario:** New floor, no existing stations → Place pin

**Setup:**
1. Create a new floor (or use one with no stations)
2. Click "📍 Add Pin"
3. Click on floor plan
4. Choose "📍 Station"

**Expected Results:**
- [ ] Station selection modal does NOT appear
- [ ] Goes straight to "Add Station" creation modal
- [ ] Can fill in details immediately
- [ ] No extra steps

**If FAILED:**
```
Issue: Modal appears when it shouldn't
→ Reason: Floor might have stations you didn't notice
→ Check: Station list on left side
```

**If PASSED:**
✅ First-pin flow correct  
→ **Phase 2 Complete** ✅

---

## SUMMARY & NEXT STEPS

### Test Results

**Phase 4 (HEIC Support):**
- [ ] Safari HEIC upload: PASS / FAIL
- [ ] Chrome HEIC upload: PASS / FAIL
- [ ] Overall: ✅ PASS / ❌ FAIL

**Phase 1 (Pin Movement):**
- [ ] Long-press detection: PASS / FAIL
- [ ] Drag to move: PASS / FAIL
- [ ] Delete button: PASS / FAIL
- [ ] Position persistence: PASS / FAIL
- [ ] Mobile touch (optional): PASS / FAIL / SKIP
- [ ] Overall: ✅ PASS / ❌ FAIL

**Phase 2 (Station Selection):**
- [ ] Modal appears for existing stations: PASS / FAIL
- [ ] Link existing station: PASS / FAIL
- [ ] Create new station option: PASS / FAIL
- [ ] No modal on first pin: PASS / FAIL
- [ ] Overall: ✅ PASS / ❌ FAIL

### Issues Found

**Critical Issues (Must Fix):**
```
Issue #1: [Description]
Steps to Reproduce: [Steps]
Expected: [What should happen]
Actual: [What happened]
Severity: CRITICAL
```

**Non-Critical Issues (Nice to Fix):**
```
Issue #1: [Description]
```

### Approval to Deploy

- [ ] **Phase 4 PASS** - Ready for operations
- [ ] **Phase 1 PASS** - Ready for operations
- [ ] **Phase 2 PASS** - Ready for operations
- [ ] **No Critical Issues** - Stable environment confirmed

**Status:** ⏳ TESTING IN PROGRESS

---

## Quick Reference: Console Commands

If you need to debug, run these in browser console:

```javascript
// Check button exists
document.getElementById('btn-start-visit')

// Check modal exists
document.getElementById('modal-validation')

// Test pin movement manually
// 1. Find a pin
document.querySelector('.plan-pin')

// 2. Check station data
S.floors[0].stations

// 3. Check context photos
S.contextPhotos

// 4. Force re-render
renderPins()
```

---

**Ready to begin testing?**

Start with **Test 4.1** (iPhone HEIC) - take ~15 minutes.  
Then move to **Test 1.1** (Pin Movement) - take ~30 minutes.  
Finally **Test 2.1** (Station Modal) - take ~20 minutes.

Total time: ~65 minutes to validate all 3 phases.

---

**Status:** READY FOR TESTING  
**Date:** May 6, 2026

Good luck! 🚀

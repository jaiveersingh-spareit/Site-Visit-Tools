# Mobile Testing Plan - July 6-7, 2026

## Pre-Test Setup (Friday, July 5)

### 1. Deploy to Local Server
```bash
cd /Users/jaiveersingh/Documents/Claude/Projects/Site Visit Form/
python3 -m http.server 8000
# App available at: http://localhost:8000/site-visit-form-no-zoom.html
```

### 2. Get Local IP Address
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
# Copy the IP (e.g., 192.168.1.100)
# URL: http://192.168.1.100:8000/site-visit-form-no-zoom.html
```

### 3. Test Device Setup
- [ ] iPhone (iOS 17+) - Safari & Chrome
- [ ] Android phone (Android 12+) - Chrome
- [ ] Network: Connect all devices to same WiFi
- [ ] Clear browser cache/storage on each device before testing
- [ ] Open DevTools on desktop for console monitoring

---

## Test Scenario: Complete Site Audit

**Building:** Test Building (test data)
**Floors:** 2
**Stations per floor:** 2-3
**Photos per station:** 2 (context + bin)
**Total photos:** ~10

---

## Monday, July 6: Phase 1 - Mobile Basics

### Test 1: iPhone Safari (iOS 17)
- [ ] Open app URL in Safari
- [ ] Load homepage - verify UI renders
- [ ] Check console (DevTools via Mac: Develop → [device] → page)
- [ ] Fill form: Building name, address, auditor, waste streams
- [ ] Start audit → Verify transition to floors screen
- [ ] **Expected:** Smooth, no console errors

### Test 2: iPhone Chrome (iOS 17)
- [ ] Open app URL in Chrome
- [ ] Repeat Test 1 flow
- [ ] Compare UI/performance vs Safari
- [ ] **Expected:** Same functionality as Safari

### Test 3: Android Chrome (Android 12+)
- [ ] Open app URL in Chrome
- [ ] Repeat Test 1 flow
- [ ] Check for layout differences
- [ ] **Expected:** Responsive, no major layout breaks

**Checkpoint:** All three browsers load without errors ✓

---

## Monday, July 6: Phase 2 - Floor Plan Upload

### Test 4: Floor Plan Upload (iPhone Safari)
- [ ] Select Floor 1
- [ ] Tap "Upload Floor Plan"
- [ ] Take photo of floor diagram or use test image
- [ ] Verify: Image displays in fit-to-box container
- [ ] **Console checks:**
  - `[UPLOAD]` logs
  - `[COMPRESS]` logs showing size reduction
  - `[IDB] Photo saved` logs
- [ ] **Expected:** Image loads, no distortion, compressed

### Test 5: Floor Plan on Floor 2 (iPhone Safari)
- [ ] Complete Floor 1 → Next Floor
- [ ] Select Floor 2
- [ ] Upload different floor plan
- [ ] **Verify:** Floor 2 shows NEW image (not Floor 1's image)
- [ ] Go back to Floor 1 → original image still there
- [ ] **Expected:** Images isolated per floor (confirms bug fix)

**Checkpoint:** Floor plans upload and isolate correctly ✓

---

## Monday, July 6: Phase 3 - Station & Photo Capture

### Test 6: Station Creation (iPhone Safari)
- [ ] Floor 1 - Tap "Add Station"
- [ ] Fill: Station name (e.g., "Kitchen")
- [ ] Tap camera icon for photo
- [ ] Take/upload photo
- [ ] **Console checks:**
  - `[COMPRESS]` showing compression
  - `[IDB] Photo saved` (instant backup)
  - `[PHOTO] Backed up to IndexedDB`
- [ ] **Photo size verification:**
  - Compress log shows: e.g., "2.5 MB → 1.2 MB (52% reduction)"
  - **Expected:** ~50% size reduction

### Test 7: Bin Photos (iPhone Safari)
- [ ] Add 2-3 bin photos to same station
- [ ] Verify each photo shows checkmark/confirmation
- [ ] **Expected:** All photos compress and back up

### Test 8: Multiple Stations (iPhone Safari)
- [ ] Create 2-3 more stations on Floor 1
- [ ] Each with 2 photos
- [ ] Total: 6-8 photos on Floor 1
- [ ] **Console:** Watch for `[IDB]` save logs for each photo
- [ ] **Performance:** Should feel responsive, no lag
- [ ] **Expected:** Smooth photo capture experience

**Checkpoint:** Photos capture, compress, and backup successfully ✓

---

## Monday, July 6: Phase 4 - Data Persistence

### Test 9: Close and Reopen App (iPhone Safari)
- [ ] After adding 6-8 photos to Floor 1:
- [ ] Close Safari completely (swipe up)
- [ ] Wait 5 seconds
- [ ] Reopen Safari
- [ ] Navigate back to Floor 1
- [ ] **Verify:**
  - All stations still there
  - All photos restored
  - **Console:** Should show `[IDB] Recovered X photos` logs
- [ ] **Expected:** All data and photos recovered silently

### Test 10: Browser Cache Clear (iPhone Safari)
- [ ] Settings → Safari → Clear History and Website Data
- [ ] Reopen app
- [ ] **Verify:** Application still works (localStorage persists)
- [ ] **Expected:** State recovered from localStorage

**Checkpoint:** Data persists across close/reopen ✓

---

## Monday, July 6: Phase 5 - Export (Desktop for Now)

### Test 11: Download Export (Desktop Chrome)
- [ ] Complete audit on desktop (3-4 photos total)
- [ ] Navigate to Review screen
- [ ] Click "📥 Download" button
- [ ] **Verify:**
  - ZIP downloads successfully
  - File size: ~15-30 MB (for 3-4 photos)
  - Filename: `audit_[id]_[date].zip`
- [ ] **Extract and verify contents:**
  - [ ] CSV file with pre-populated data
  - [ ] Excel file with formatted data
  - [ ] `/photos/floor1/` subfolder structure
  - [ ] `/floorplans/` folder with floor images
- [ ] **Check CSV headers:**
  - Building name, address, floors, auditor, date
  - Column: Building Name, Floor, Station, Pin X %, Pin Y %, Stream, Bin ID, Photo References
- [ ] **Check Excel:**
  - Same headers formatted
  - Column widths set properly
- [ ] **Expected:** ZIP properly structured, all files included

**Checkpoint:** Export creates correct ZIP structure ✓

---

## Tuesday, July 7: Phase 6 - Full Mobile Workflow

### Test 12: Complete Mobile Audit (iPhone Safari)
- [ ] Full workflow start to finish:
  1. Home screen → fill form
  2. Add 2 floors
  3. Floor 1: Upload plan + create 3 stations with 2 photos each
  4. Floor 2: Upload plan + create 2 stations with 2 photos each
  5. Navigate to Review
  6. Verify summary shows all data
- [ ] **Photos total:** ~10 photos
- [ ] **Console:** Should show clean logs, no errors
- [ ] **Expected:** Complete flow works smoothly

### Test 13: IndexedDB Storage Verification (iPhone Safari)
- [ ] After complete audit:
- [ ] Open DevTools (remote debugging)
- [ ] Check Application → Local Storage
  - [ ] `auditState` has building info
  - [ ] Size: ~20-50 KB (audit data)
- [ ] Check Application → IndexedDB → AuditDB
  - [ ] `photos` table has ~10 photos
  - [ ] Total: ~8-12 MB for photos
  - [ ] `backups` table has 3-5 backup snapshots
- [ ] **Expected:** All data properly stored in IndexedDB

### Test 14: Export on Mobile (iPhone Safari)
- [ ] From Review screen
- [ ] Tap "📥 Download"
- [ ] **Verify:**
  - Page shows "📥 Preparing export..."
  - Wait 2-3 seconds
  - Toast: "✓ Downloaded: X MB"
  - ZIP file appears in Downloads
- [ ] **Files app:**
  - Open ZIP in Files app
  - Verify structure:
    - CSV present
    - Excel present
    - /photos/ folder with subfolders
    - /floorplans/ folder
- [ ] **Expected:** Mobile export works, ZIP complete

**Checkpoint:** Full mobile workflow functions ✓

---

## Tuesday, July 7: Phase 7 - Edge Cases & Performance

### Test 15: Network Interruption
- [ ] Turn off WiFi during audit
- [ ] Add photos while offline
- [ ] Turn WiFi back on
- [ ] **Verify:**
  - Photos still in memory
  - Export still works
  - **Console:** Should show periodic backup happening
- [ ] **Expected:** Offline resilience confirmed

### Test 16: Large Photo Test
- [ ] Capture high-res photo (4MB+)
- [ ] **Verify:**
  - Compresses to 1-2 MB
  - Displays correctly
  - No lag during compression
- [ ] **Expected:** Handles large photos gracefully

### Test 17: Many Photos (10+)
- [ ] Add 15+ photos across floors
- [ ] Monitor app responsiveness
- [ ] Check storage quota
- [ ] **Console:** Look for quota warnings
- [ ] **Expected:** Handles volume well

### Test 18: Device Orientation Change
- [ ] Rotate phone during audit
- [ ] Place pin on floor plan
- [ ] Rotate again
- [ ] **Verify:**
  - Floor plan fits to container correctly
  - Pins don't move
  - No console errors
- [ ] **Expected:** Orientation changes handled

**Checkpoint:** Edge cases handled ✓

---

## Test Results Document

Create file: `MOBILE_TEST_RESULTS_JULY_6_7.md`

### For Each Test:
- [ ] Device
- [ ] Browser
- [ ] Status: PASS / FAIL / WARN
- [ ] Console errors (if any)
- [ ] Performance notes
- [ ] Screenshots (if failed)

### Summary Template:
```
iPhone Safari:   [✓ PASS] All tests passed
iPhone Chrome:   [✓ PASS] All tests passed
Android Chrome:  [✓ PASS] All tests passed

Phase 1 (Basics):        [✓ PASS] 3/3 tests
Phase 2 (Floor Plans):   [✓ PASS] 2/2 tests
Phase 3 (Photos):        [✓ PASS] 3/3 tests
Phase 4 (Persistence):   [✓ PASS] 2/2 tests
Phase 5 (Export):        [✓ PASS] 1/1 tests
Phase 6 (Full Workflow): [✓ PASS] 3/3 tests
Phase 7 (Edge Cases):    [✓ PASS] 4/4 tests

TOTAL: 18/18 PASS ✓

Issues Found: None
Ready for Production: YES
```

---

## Known Constraints (Not Failures)

- ⚠️ EmailJS not configured yet (expected) - Download works
- ⚠️ localStorage quota warning at 70%+ (working as designed)
- ⚠️ IndexedDB ~50MB limit (handles 15-20 photos comfortably)

---

## Deployment Readiness Checklist

After all tests PASS:
- [ ] No console errors on any device
- [ ] All IndexedDB functions working
- [ ] Photo compression functioning (50%+ reduction)
- [ ] Export creates proper ZIP with all files
- [ ] Data persists across close/reopen
- [ ] Mobile UI responsive on all devices
- [ ] Offline functionality confirmed
- [ ] Performance acceptable (no lag/freezing)

**Next Steps After Passing:**
1. Get EmailJS credentials
2. Update EMAIL_CONFIG
3. Test email sending (Monday July 13)
4. Full production deployment
5. Operations team rollout

---

## Support Contacts During Testing

**Issues?**
- Check console first (DevTools)
- Screenshot console errors
- Note exact device/browser/step
- Create issue report in project


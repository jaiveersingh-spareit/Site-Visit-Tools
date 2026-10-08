# PHASE 9 TEST PLAN — ZIP Export with Photo Storage Structure

## Implementation Status
✅ **COMPLETE** — All functions implemented and integrated
- JSZip library added (line 16)
- 6 functions added to script section (lines 3372-3540)
- Export buttons updated (5 locations) to call `doExportZip()`
- Button text changed from "Export" to "Export ZIP"

---

## Test Scenarios

### TEST 1: Empty Site Visit (Edge Case)
**Objective:** Verify error handling when minimal data exists

**Steps:**
1. Open the app fresh (no buildings created)
2. Tap any "Export ZIP" button
3. **Expected Result:** Alert: "No data to export yet."

**Status:** ⏳ Pending

---

### TEST 2: Building with No Photos (Minimal Data)
**Objective:** Verify ZIP structure with building/floors but no photos

**Setup:**
1. Create building: "Test Building A"
2. Select Stream: "Specialty Tech"
3. Add Floor: "Floor 1"
4. Do NOT add any photos
5. Tap "Export ZIP"

**Expected Results:**
- ZIP downloads: `Test Building A_2026-05-08_XX-XX-XX.zip`
- Extract and verify structure:
  ```
  Site Visits/
    Test Building A/
      Floor 1/
      metadata.json
  ```
- metadata.json contains:
  - export_info with timestamp
  - building_name: "Test Building A"
  - stream_type: "Specialty Tech"
  - total_photos: 0
  - floor_count: 1

**Status:** ⏳ Pending

---

### TEST 3: Context Photos Only
**Objective:** Verify context photo capture and naming

**Setup:**
1. Create building: "Context Test"
2. Add context photos (take 2-3 photos from camera)
3. Do NOT add floor, station, gateway, or display photos
4. Tap "Export ZIP"

**Expected Results:**
- ZIP filename format: `Context Test_YYYY-MM-DD_HH-MM-SS.zip`
- Extract structure:
  ```
  Site Visits/
    Context Test/
      metadata.json
  ```
- Files found: `context_photo_1.jpg`, `context_photo_2.jpg`, etc. in root or metadata reference
- metadata.json shows `photos_captured: { context: 3, ... }`

**Status:** ⏳ Pending

---

### TEST 4: Station Photos (Full Floor)
**Objective:** Verify station photo naming and organization

**Setup:**
1. Create building: "Station Test"
2. Add Floor 1
3. Add 3 stations with photos each (6+ total photos)
4. Tap "Export ZIP"

**Expected Results:**
- Folder structure:
  ```
  Site Visits/
    Station Test/
      Floor 1/
        station_1_photo_1.jpg
        station_1_photo_2.jpg
        station_2_photo_1.jpg
        ...
  ```
- Photos named with station number prefix (e.g., `station_1_*`)
- metadata.json includes station count and photo breakdown

**Status:** ⏳ Pending

---

### TEST 5: Gateway & Display Photos (with Floor Number in Name)
**Objective:** Verify gateway/display naming includes floor number

**Setup:**
1. Create building: "Gateway Test"
2. Add Floor 1 with gateway photo
3. Add Floor 2 with display photo
4. Tap "Export ZIP"

**Expected Results:**
- Folder structure shows floor-specific folders:
  ```
  Site Visits/
    Gateway Test/
      Floor 1/
        gateway_floor1_photo_1.jpg
      Floor 2/
        display_floor2_photo_1.jpg
  ```
- Gateway photo filename includes "floor1"
- Display photo filename includes "floor2"
- metadata.json separates photos by floor

**Status:** ⏳ Pending

---

### TEST 6: Floor Plan Markup Export
**Objective:** Verify marked-up floor plan is captured as image

**Setup:**
1. Create building: "Markup Test"
2. Add Floor 1
3. Draw markup on floor plan (use drawing tools)
4. Tap "Export ZIP"

**Expected Results:**
- Folder structure:
  ```
  Site Visits/
    Markup Test/
      Floor 1/
        floor_plan_marked_up.png
  ```
- File is actual PNG (not base64), viewable in image viewer
- Drawing markup is visible in exported image

**Status:** ⏳ Pending

---

### TEST 7: Comprehensive Multi-Floor Test
**Objective:** Verify full feature set with realistic data

**Setup:**
1. Create building: "Comprehensive Test"
2. Select Stream: "Standard Service"
3. Add Floor 1:
   - 2 context photos
   - 2 stations with 2 photos each
   - 1 gateway photo
   - Floor plan with markup
4. Add Floor 2:
   - 1 context photo
   - 1 station with 1 photo
   - 1 display photo
   - Floor plan (no markup)
5. Tap "Export ZIP"

**Expected Results:**
- ZIP filename: `Comprehensive Test_YYYY-MM-DD_HH-MM-SS.zip`
- Complete folder structure:
  ```
  Site Visits/
    Comprehensive Test/
      Floor 1/
        context_photo_1.jpg
        context_photo_2.jpg
        station_1_photo_1.jpg
        station_1_photo_2.jpg
        station_2_photo_1.jpg
        station_2_photo_2.jpg
        gateway_floor1_photo_1.jpg
        floor_plan_marked_up.png
      Floor 2/
        context_photo_1.jpg
        station_1_photo_1.jpg
        display_floor2_photo_1.jpg
        floor_plan.png
      metadata.json
  ```
- metadata.json includes all statistics:
  - building_name: "Comprehensive Test"
  - stream_type: "Standard Service"
  - total_photos: 10
  - photo_breakdown by type
  - floor_count: 2
  - photo_count_per_floor

**Status:** ⏳ Pending

---

### TEST 8: ZIP Integrity & Extraction
**Objective:** Verify ZIP file is valid and extractable

**Steps:**
1. Complete TEST 7
2. Download the ZIP file
3. Attempt to extract using system archive utility
4. Verify all files extract without errors
5. Verify file sizes are > 0 bytes
6. Verify all photos are actual image files (not corrupted base64)

**Expected Results:**
- ZIP extracts without errors
- All files present with correct sizes
- Images can be opened and viewed
- No corrupted files

**Status:** ⏳ Pending

---

### TEST 9: Metadata.json Validation
**Objective:** Verify metadata structure and accuracy

**Setup:**
1. Complete TEST 7
2. Extract ZIP and open `metadata.json` in text editor

**Expected Contents:**
```json
{
  "export_info": {
    "exported_at": "2026-05-08T XX:XX:XXZ",
    "app_version": "2.0"
  },
  "building": {
    "name": "Comprehensive Test",
    "stream_type": "Standard Service",
    "floor_count": 2,
    "total_photos": 10
  },
  "photos": {
    "by_type": {
      "context": 3,
      "station": 5,
      "gateway": 1,
      "display": 1,
      "floor_plan": 2
    },
    "by_floor": {
      "1": { "context": 2, "station": 4, "gateway": 1, "floor_plan": 1 },
      "2": { "context": 1, "station": 1, "display": 1, "floor_plan": 1 }
    }
  },
  "file_structure": {
    "base": "Site Visits/[BuildingName]/",
    "per_floor": "Floor [#]/[PhotoFiles]"
  }
}
```

**Verification:**
- All counts match actual exported photos
- Timestamps are valid ISO 8601 format
- Floor breakdowns sum to total_photos

**Status:** ⏳ Pending

---

### TEST 10: Performance Test (Large Dataset)
**Objective:** Verify app handles 15+ photos without lag or errors

**Setup:**
1. Create building: "Performance Test"
2. Add Floor 1
3. Add 5 stations with 3 photos each (15 photos)
4. Add 2 context photos
5. Tap "Export ZIP"

**Expected Results:**
- ZIP creation completes in < 5 seconds
- No UI freezing
- No console errors
- ZIP file generated successfully with all 17 photos
- File size reasonable (< 50MB for typical JPEG photos)

**Status:** ⏳ Pending

---

## Code Verification Checklist

- [ ] JSZip library loads without errors
- [ ] dataUrlToBlob() converts base64 correctly
- [ ] getTimestamp() generates proper YYYY-MM-DD_HH-MM-SS format
- [ ] collectPhotosForZip() extracts all 5 photo types
- [ ] generateMetadataJson() creates valid JSON
- [ ] buildAndDownloadZip() creates proper folder structure
- [ ] doExportZip() validates data before export
- [ ] Export button calls doExportZip() (not openModal)
- [ ] Button text shows "Export ZIP" (not "Export")

---

## Testing Instructions for User

1. **Open the app:** `/Users/jaiveersingh/Documents/Claude/Projects/Site Visit Form/Spare-it_site_visit_form.html`
2. **Browser Console:** Keep developer tools open (F12 → Console tab) to catch any errors
3. **Run Tests:** Execute tests 1-10 in order
4. **Log Results:** Record any failures or unexpected behavior
5. **Download ZIP:** Save the downloaded ZIP files to a test folder
6. **Extract & Verify:** Use system archive tool to extract and inspect

---

## Known Limitations & Assumptions

- Base64 photos in localStorage may be large; consider performance implications
- ZIP creation happens client-side; very large datasets (100+ photos) may cause slowdowns
- Browser must support JSZip and Blob APIs (all modern browsers support this)
- File download behavior depends on browser settings and OS

---

## Sign-Off

- **Feature Status:** ✅ Implementation Complete
- **Ready for Testing:** YES
- **Estimated Test Time:** 30-45 minutes (all 10 tests)
- **Blockers:** None identified

---

**Created:** 2026-05-08  
**Last Updated:** 2026-05-08  
**Version:** Phase 9 Final

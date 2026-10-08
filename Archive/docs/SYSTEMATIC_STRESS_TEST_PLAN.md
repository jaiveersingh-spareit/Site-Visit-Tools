# Systematic Stress Test Plan - Pin Coordinate Stability

**Objective:** Run comprehensive tests to identify any coordinate drift or bugs when zooming and panning across all zoom levels.

**Test Start Time:** 2026-06-10 (Session)  
**Status:** EXECUTING

---

## Test Scenarios

### TEST SET 1: Single Pin - Multi-Zoom Cycle
**Hypothesis:** A pin created at 100% should maintain exact coordinates across zoom cycles.

**Steps:**
1. At 100% zoom: Create pin at CENTER (50%, 50%)
2. Record coordinates at 100%
3. Zoom to 125% → Record coordinates
4. Zoom to 150% → Record coordinates
5. Zoom to 175% → Record coordinates
6. Zoom back to 100% → Verify coordinates match original

**Expected Result:** 
- All coordinate readings = (50.00%, 50.00%)
- No drift across zoom levels
- Perfect return to original position

**Pass Criteria:** All coordinates match within ±0.1%

---

### TEST SET 2: Multiple Pins at Different Locations
**Hypothesis:** Multiple pins should maintain their relative positions regardless of zoom.

**Pins to create:**
- Pin 1: TOP_LEFT (10%, 10%)
- Pin 2: CENTER (50%, 50%)
- Pin 3: BOTTOM_RIGHT (90%, 90%)

**For each pin:**
- Create at 100% zoom
- Test zoom cycle: 100% → 125% → 150% → 175% → 100%
- Verify coordinates remain stable

**Expected Result:** All pins maintain exact coordinates across all zoom levels

---

### TEST SET 3: Cross-Zoom Pin Creation
**Hypothesis:** Pins created at different zoom levels should end up at the same location when viewed at 100%.

**Steps:**
1. Create Pin A at 100% zoom at (40%, 40%)
2. Record its location at 100%
3. Zoom to 150% → Create Pin B at (40%, 40%)
4. Zoom back to 100%
5. Compare Pin A and Pin B positions (should be identical)

**Expected Result:** Both pins appear at exact same location on image

---

### TEST SET 4: Pan + Zoom Combination
**Hypothesis:** Panning at different zoom levels shouldn't affect pin coordinates.

**Steps:**
1. Create pin at 150% zoom
2. Pan the image left/right/up/down
3. Verify pin stays at same image location
4. Zoom to different levels while panned
5. Verify pin coordinate stability

**Expected Result:** Pin coordinates unchanged by pan operation

---

### TEST SET 5: Rapid Zoom Changes
**Hypothesis:** Rapidly switching between zoom levels shouldn't cause coordinate errors.

**Steps:**
1. Create pin at 100%
2. Rapidly cycle: 100% → 150% → 100% → 175% → 100% (repeat 5x)
3. Record coordinates at each level
4. Check for any divergence

**Expected Result:** Coordinates consistent across rapid changes

---

### TEST SET 6: Pin Edit After Zoom
**Hypothesis:** Editing (repositioning) a pin at a different zoom level should work correctly.

**Steps:**
1. Create pin at 100% zoom at (30%, 30%)
2. Zoom to 150%
3. Move pin to (70%, 70%)
4. Zoom back to 100%
5. Verify pin is now at (70%, 70%)
6. Zoom back to 150%
7. Verify pin still at (70%, 70%)

**Expected Result:** Pin successfully repositioned and coordinates stable

---

## Data Collection Template

```
TEST: [Name]
TIMESTAMP: [Date/Time]
ZOOM_LEVEL: [%]
EXPECTED_COORDS: [X%,Y%]
ACTUAL_COORDS: [X%,Y%]
ERROR: [±X pixels]
STATUS: [PASS/FAIL]
NOTES: [Any observations]
```

---

## Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Coordinate Accuracy | ±2px (at 100% zoom) | TBD |
| Zoom Stability | 0.00px drift | TBD |
| Cross-Zoom Consistency | All zooms match | TBD |
| Multi-Pin Stability | All pins stable | TBD |
| Pan Independence | No coordinate change | TBD |
| Edit Persistence | Changes persist | TBD |
| Rapid Zoom Stability | No accumulated error | TBD |

---

## Bugs to Look For

1. **Coordinate Drift:** Pins moving slightly each zoom cycle
2. **Pan Offset Error:** Pan affecting static pin coordinates
3. **Zoom Asymmetry:** Different behavior going to higher vs. lower zoom
4. **Container Size Changes:** Incorrect dimension calculations
5. **Rounding Errors:** Accumulated floating-point errors
6. **Transform Conflicts:** CSS transforms interfering with calculations
7. **State Inconsistency:** Pan or zoom state not updating correctly
8. **Centering Offset Errors:** Incorrect centering when image is zoomed

---

## Execution Log

Will be populated as tests run...

**Tests Executed:** 0/7  
**Tests Passed:** 0  
**Tests Failed:** 0  
**Overall Accuracy:** [Pending]

---

## Current Status

🔵 **READY TO EXECUTE TESTS**

Available test framework functions:
- `recordCoordinateTest(testName, zoomLevel, imagePercent)` - Records test data
- `window.testData` - Stores all test results
- Pin creation via UI with test mode enabled

Next action: Begin TEST SET 1 - Single Pin Multi-Zoom Cycle

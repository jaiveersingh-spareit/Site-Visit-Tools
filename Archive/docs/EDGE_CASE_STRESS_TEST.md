# Edge Case Stress Test for Pin Coordinate System

## Overview
This document guides you through comprehensive stress testing of the pin placement and zoom coordinate transformation system. **The key principle: pins should visually shift when you change zoom levels** (this is correct behavior, not a bug).

---

## How the Coordinate System Works

### Formula
```
renderedX = storedX * zoomLevel - (zoomLevel - 1) * 50
```

### What This Means
- **Stored coordinates** are percentages of the original image (0-100%)
- **Rendered coordinates** are where the pin appears on your screen at the current zoom
- When you zoom, the image gets larger AND shifts its position (due to flexbox centering)
- Therefore, pins WILL move visually when you zoom (but they're still locked to the image content)

### Example
```
Pin placed at 40% of image width:
- At zoom 100%:  rendered = 40 * 1.0 - (1.0 - 1) * 50 = 40%
- At zoom 150%:  rendered = 40 * 1.5 - (1.5 - 1) * 50 = 60 - 25 = 35%
- At zoom 175%:  rendered = 40 * 1.75 - (1.75 - 1) * 50 = 70 - 37.5 = 32.5%
```

The pin moves from 40% → 35% → 32.5% as you zoom because the centered image shifts.

---

## Test Categories

### 1. BOUNDARY EDGE CASES

**Setup:**
- Create a floor with image
- Place pins at boundary positions

**Test Cases:**

#### 1.1: Minimum Position (2%)
```
Steps:
1. At zoom 100%, tap very close to left edge (should snap to 2%)
2. Note the stored coordinate
3. Zoom to 150%, 175%
4. Verify pin visually stays locked to image edge (rendered ≠ 2% but locked to image)
5. Zoom back to 100%
Expected: Pin should be back at exact same visual location as step 1
```

#### 1.2: Maximum Position (98%)
```
Steps:
1. At zoom 100%, tap very close to right edge (should snap to 98%)
2. Note the stored coordinate
3. Zoom to 150%, 175%
4. Verify pin visually stays locked to image edge
5. Zoom back to 100%
Expected: Pin should be back at exact same visual location as step 1
```

#### 1.3: Center Position (50%)
```
Steps:
1. At zoom 100%, tap exact center (should be ~50%)
2. Note the coordinate
3. Zoom through all levels (1.0, 1.25, 1.5, 1.75)
Expected: Pin should stay visually at center at all zoom levels
```

---

### 2. COORDINATE CONSISTENCY ACROSS ZOOM LEVELS

**Setup:**
- Place 3 pins at different positions: 25%, 50%, 75%
- One pin at each position

**Test Case: Zoom Consistency**
```
Steps:
1. Place Station A at 25% (verify: x=25, y=50)
2. At zoom 100%, verify visual position
3. Zoom to 125%:
   - Check console: "stored(25, 50) → rendered(18.75, 37.5) at zoom 1.25"
   - Verify pin visually moved left (lower rendered X%)
4. Zoom to 150%:
   - Check console: should show rendered(12.5, 25) at zoom 1.5
5. Zoom to 175%:
   - Check console: should show rendered(6.25, 12.5) at zoom 1.75
6. Zoom back to 100%
Expected: Pin should return to exact original position at step 2
```

**Verification in Console:**
- Open browser DevTools (F12)
- Look for `[RENDER PINS]` logs showing formula calculations
- Verify the formula: `storedX * zoomLevel - (zoomLevel - 1) * 50`

---

### 3. MONOTONICITY TEST (Order Preservation)

**Setup:**
- Place 5 pins at: 10%, 30%, 50%, 70%, 90%

**Test Case: Ordering at Different Zooms**
```
Steps:
1. At zoom 100%, verify pins from left to right are in order: 10, 30, 50, 70, 90
2. Zoom to 150%
3. Check rendered coordinates in console (should be: -15, -5, 50, 105, 125)
4. Verify visually: leftmost pin is still leftmost, rightmost is rightmost
5. Even though some are outside container, order is preserved

Expected: Pins should stay in same relative order at all zoom levels
```

---

### 4. REPOSITIONING WORKFLOW TEST

**Setup:**
- Create a station with a pin at position (45, 60)

**Test Case: Edit Position Without Changing Coordinates**
```
Steps:
1. Station A created and positioned at (45, 60)
2. Open Station A details
3. Click "Reposition" button
4. WITHOUT zooming, tap a NEW location (e.g., 55, 65)
5. Confirm new location
6. Re-open Station A
Expected: Coordinates should be (55, 65) [or close, allowing for tap accuracy]
         Original (45, 60) should not appear anywhere
```

**Test Case: Reposition After Zoom**
```
Steps:
1. Station A at zoom 100%, positioned at (40, 50)
2. Zoom to 150%
3. Click "Reposition"
4. Tap new location (e.g., 45, 55)
5. Confirm new location
6. Zoom back to 100%
Expected: Coordinates should be (45, 55)
         Pin visually locked to new image location at all zooms
```

---

### 5. RAPID SUCCESSIVE TAPS

**Setup:**
- Create a floor

**Test Case: Multiple Quick Placements**
```
Steps:
1. Enable test mode (toggle button)
2. Tap to place station A (rapid tap)
3. Confirm location
4. Immediately tap to place station B
5. Confirm location
6. Check console logs for any errors
7. Export test data

Expected: Both stations should have valid, distinct coordinates
         No overlap or coordinate corruption
```

---

### 6. ZOOM MODAL INTERACTION

**Setup:**
- Create a floor

**Test Case: Zoom While In Positioning Mode**
```
Steps:
1. Click "Add Station"
2. Zoom to 150%
3. Tap to place pin
4. Verify modal appears asking "Are you happy with the pin location?"
5. Close modal
6. Tap again at same visual location
Expected: Second tap should work normally (modal appears again)
         No frozen UI
```

---

### 7. IMAGE RENDERING ACCURACY

**Test Case: Verify Pin Display Formula**
```
Steps:
1. Place Station A at x=30, y=60
2. Open browser DevTools → Console
3. Toggle test mode
4. Look for logs: "[RENDER PINS] Station A - RENDERING:"
5. Verify formula calculation:
   - Formula: 30 * zoom - (zoom - 1) * 50
   - At zoom 1.0:   30 * 1.0 - 0 = 30% ✓
   - At zoom 1.25:  30 * 1.25 - 12.5 = 25% (pin moves left)
   - At zoom 1.5:   30 * 1.5 - 25 = 20% (moves more left)

Expected: Formula calculations in console match expected math
```

---

### 8. DATA EXPORT CONSISTENCY

**Test Case: Coordinates in Export File**
```
Steps:
1. Create 3 stations at (20, 30), (50, 50), (80, 70)
2. Export to JSON/Excel
3. Verify exported coordinates match stored values
4. Close and reopen app (load from localStorage)
5. Verify pins load at exact same positions

Expected: No drift, no rounding errors, exact match
```

---

## Automated Validation (Run in Console)

When you enable test mode, the system runs automated validation. You'll see in the console:

```
════════════════════════════════════════════════════════════════════════════════
🧪 EDGE CASE STRESS TEST - COORDINATE TRANSFORMATION VALIDATION
════════════════════════════════════════════════════════════════════════════════
✓ Boundary edges - All positions valid
✓ Zoom consistency - Works at all levels
✓ Monotonicity - Order preserved
✓ Center invariance - Center always at 50%
...
✅ ALL TESTS PASSED
════════════════════════════════════════════════════════════════════════════════
```

---

## Red Flags (Things That Indicate Bugs)

❌ **STORED coordinates outside 2-98% range** (after clamping)
```
Example: Stored coordinate is -5% or 105%
Action: Check clamping logic in handlePlanTap line 3614-3615
```

⚠️ **RENDERED coordinates outside 0-100% at higher zoom** - THIS IS EXPECTED!
```
Example: At zoom 1.5, stored 2% renders as -10%
Why: Image extends beyond container, centering offset pushes pins outside visible area
This is CORRECT - pins are mathematically positioned on the image
```

❌ **Same image position renders differently at same zoom**
```
Example: Station A at (50, 50) renders at (45, 45) on first load, (50, 50) on reload
Action: Check renderPins formula - may have rounding errors
```

❌ **Pins out of order after zoom**
```
Example: At zoom 100%, Station A is left of B. At zoom 150%, Station B is left of A.
Action: Check formula - should maintain monotonic ordering
```

❌ **Pin moves when toggling test mode**
```
Example: Pin at x=45% before, x=48% after test mode toggle
Action: Test mode should only log, not modify display
```

❌ **Coordinate changes after reposition without tapping**
```
Example: Station A at (50, 50) → edit modal → cancel → now shows (50, 51)
Action: Repositioning should only update when confirmed
```

---

## Test Data Checklist

Run through this checklist for completeness:

- [ ] Placed pins at all 4 zoom levels
- [ ] Verified pins at zoom 1.0 render correctly (should equal stored)
- [ ] Verified center (50%) stays at center at all zooms
- [ ] Repositioned at least one pin across zoom levels
- [ ] Exported and verified coordinate data in JSON
- [ ] Rapid-tapped multiple times (no freezing)
- [ ] Zoomed while positioning modal was open
- [ ] Checked console for formula validation results
- [ ] Tested boundary positions (2%, 98%)
- [ ] Verified pins stay in same order at all zooms
- [ ] Exported data and re-opened to verify persistence

---

## Expected vs Actual Behavior

### Position at 40% - Zoom 100% vs 150%

**Expected Behavior (CORRECT):**
```
Zoom 100%: Pin rendered at 40% (left side) on screen
Zoom 150%: Pin rendered at 35% (moves more left) on screen
           BUT: pin is still visually locked to 40% of the IMAGE CONTENT
           The image itself shifted, so pin position on screen changed

Visual result: Looking at the floor plan, the pin stays on the same physical spot
              But its position as percentage of screen changes because image shifted
```

### Position at 2% (Edge Case) - Why Rendered Goes Negative

**This is EXPECTED behavior:**
```
Pin stored at 2% (very left edge):
- Zoom 100%:  rendered = 2 * 1.0 - 0 = 2% (visible on left edge) ✓
- Zoom 150%:  rendered = 2 * 1.5 - 25 = -22.5% (OFF the left edge)
  
Why negative?
- At zoom 150%, image is 514px wide in 343px container
- Center offset = -85.5px (image extends left)
- Pin at 2% of image = 60px from left of image
- In container: -85.5 + 60 = -25.5px (OFF LEFT EDGE)
- As percent: -25.5 / 343 = -7.4% (negative = outside visible area)

This is CORRECT! The pin is mathematically positioned at 2% of the image,
but when zoomed, that spot is outside the visible container area.
The pin is still "locked" to the image correctly.
```

**Visual result:** Pin visually stays on same image location, but appears clipped/hidden at edge

**Actual Bug (INCORRECT):**
```
Zoom 100%: Pin rendered at 40%
Zoom 150%: Pin rendered at 40% (WRONG - pin should move with image shift)
           OR: Pin rendered at 60% (WRONG - moved in opposite direction)

Visual result: Pin visually disconnected from image, floats around
```

---

## Console Logging Checklist

When testing, check DevTools console for these log patterns:

```javascript
[PLAN TAP] Coordinate calculation (using cached dimensions):
[PLAN TAP] COORDINATE TRANSFORMATION DEBUG:
[PLAN TAP] Pin placed at: {x: X.XX%, y: Y.YY%, ...}
[RENDER PINS] Station A - RENDERING:
  stored: {x: X.XX%, y: Y.YY%}
  rendered: {x: R.RR%, y: R.RR%} at zoom Z
  formula: X.XX * Z - (Z - 1) * 50 = R.RR
[CONFIRM PIN] Pin placement edge case validation:
  ✓ Coordinate range valid
  ✓ Cross-zoom consistency: Valid at all zoom levels
  ✓ ALL VALIDATIONS PASSED
```

---

## Known Limitations

1. **Visual shift on zoom is expected** - pins move on screen but stay locked to image
2. **Rapid taps may occasionally miss** - typical for touch interfaces, not a bug
3. **Precise edge positioning (0-2%, 98-100%) is clamped to 2-98%** - by design for safety
4. **Pan offset currently not implemented** - but not part of this iteration

---

## Next Steps if Issues Found

1. **Enable test mode** - captures tap coordinates to JSON
2. **Export test data** - JSON file with tap history and coordinates
3. **Share console logs** - copy from DevTools, paste in error report
4. **Include device info** - "iOS Safari" or "Android Chrome", screen size

Good testing! 🧪

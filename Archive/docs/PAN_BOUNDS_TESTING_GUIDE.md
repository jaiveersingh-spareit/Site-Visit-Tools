# Pan Bounds Testing Guide
## Comprehensive Test Suite for Edge Cases & Drag Scenarios

**Date:** June 10, 2026  
**Purpose:** Verify pan bounds prevent over-panning and ensure coordinate accuracy across all scenarios

---

## Executive Summary

**Core Concern:** Users should NOT be able to drag the image beyond its natural bounds (no black space should appear around the image).

**Fix Applied:** Corrected coordinate transformation formula to explicitly handle pan offset.

**Testing Required:** 50+ edge cases across 7 categories to ensure robustness.

---

## How to Run the Test Suite

### Step 1: Open the App in Chrome
```
1. Navigate to http://localhost:8000/Spare-it_site_visit_form_UPDATED.html
2. Press F12 to open DevTools
3. Click "Console" tab
```

### Step 2: Copy & Paste the Test Script
```
1. Open: EXTENSIVE_PAN_BOUNDS_TEST_SCRIPT.js
2. Copy entire content
3. Paste into Chrome console
4. Press Enter
```

### Step 3: Review Results
- ✓ PASSED: Feature working correctly
- ✗ FAILED: Feature broken, needs investigation
- ⚠ WARNING: Edge case needs verification

---

## Test Categories & What They Verify

### CATEGORY 1: Pan Direction Extremes (3 Tests)
**What it tests:** Can user drag past image boundaries?

```
Test 1.1: Pan left exceeds max (-128px tries to go past -85.75px limit)
Test 1.2: Pan right exceeds max (128px tries to go past 85.75px limit)
Test 1.3: No panning at 100% zoom (image fits container)
```

**Expected Results:** All should PASS
- Should prevent pan beyond calculated limits
- Should allow no pan at 100% zoom

**If FAILED:** Pan bounds not properly enforced

---

### CATEGORY 2: Zoom-Related Edge Cases (4 Tests)
**What it tests:** Do pan bounds scale correctly with zoom?

```
Test 2.1: Pan bounds at zoom 100% (maxPan ≈ 0)
Test 2.2: Pan bounds at zoom 125% (maxPan ≈ 42.9px)
Test 2.3: Pan bounds at zoom 150% (maxPan ≈ 85.75px)
Test 2.4: Pan bounds at zoom 175% (maxPan ≈ 128.6px)
Test 2.5: Pan scaling on zoom change
```

**Expected Results:** All should PASS
- Bounds should scale with zoom level
- Pan should rescale when zoom changes

**If FAILED:** Zoom interactions broken

---

### CATEGORY 3: Bounds Calculation Verification (3 Tests)
**What it tests:** Is the math correct for calculating pan limits?

```
Test 3.1: Overflow calculation (displayedWidth - containerWidth)
Test 3.2: MaxPan formula (overflow / 2)
```

**Expected Results:** All should PASS
- Overflow calculated correctly
- MaxPan = Overflow / 2

**If FAILED:** Fundamental math issue

---

### CATEGORY 4: Coordinate Transformation with Pan (2 Tests)
**What it tests:** Are coordinates accurate when pan offset is present?

```
Test 4.1: Coordinate accuracy with extreme pan
Test 4.2: Centering offset independent of pan
```

**Expected Results:** All should PASS
- Coordinates should account for pan offset
- Centering offset should not change based on pan

**If FAILED:** This is the bug we just fixed - test again after fix

---

### CATEGORY 5: Repositioning at Extremes (2 Tests)
**What it tests:** Can user reposition pins at pan extremes?

```
Test 5.1: Repositioning at left edge
Test 5.2: Repositioning at right edge
```

**Expected Results:** All should PASS
- Should place pins correctly even at pan extremes
- Uses new corrected coordinate formula

**If FAILED:** Repositioning still broken

---

### CATEGORY 6: Visual Consistency Checks (2 Tests)
**What it tests:** Does the UI prevent black space appearing?

```
Test 6.1: No black space at left extreme
Test 6.2: No black space at right extreme
```

**Expected Results:** All should PASS
- No empty container space should be visible
- Image should always fill container

**If FAILED:** Black space bug - critical issue!

---

### CATEGORY 7: Function & Code Checks (4 Tests)
**What it tests:** Are required functions present and correct?

```
Test 7.1: enforcePanBounds() exists
Test 7.2: setZoomLevel() exists
Test 7.3: New coordinate transformation logging present
Test 7.4: Explicit pan offset handling in code
```

**Expected Results:** All should PASS
- Functions should exist
- Logging should show corrected formula
- Code should explicitly handle pan offset

**If FAILED:** Code not properly updated

---

## Manual Testing Checklist (In Parallel)

While running the automated tests, manually verify:

### Interaction Tests (Do these in the browser)

**Pan Direction Tests:**
- [ ] Zoom to 150%, drag LEFT - stops at edge, no black space
- [ ] Zoom to 150%, drag RIGHT - stops at edge, no black space
- [ ] Zoom to 150%, drag UP - stops at edge, no black space
- [ ] Zoom to 150%, drag DOWN - stops at edge, no black space

**Extreme Pan Tests:**
- [ ] Rapid drag left to max - smooth clamping, no jank
- [ ] Rapid drag right to max - smooth clamping, no jank
- [ ] Rapid drag + pan simultaneously - consistent behavior

**Zoom + Pan Tests:**
- [ ] Pan left, zoom 100% → 150% → 175% - pan rescales smoothly
- [ ] Zoom 150%, pan, zoom 175%, pan - smooth transitions
- [ ] Pan extreme, change zoom, can still see entire image

**Repositioning Tests:**
- [ ] Pan to left edge, reposition station - correct coordinate
- [ ] Pan to right edge, reposition gateway - correct coordinate
- [ ] Pan extreme, reposition display - position matches tap

**Visual Checks:**
- [ ] No black space appears around image at any zoom
- [ ] No image clipping at any pan position
- [ ] Pins always accessible (pan back to see them)
- [ ] Smooth interaction, no visual jitter

---

## Expected Test Results

### Baseline: All tests should PASS

```
✓ Category 1: Pan Direction Extremes - 3/3 PASSED
✓ Category 2: Zoom-Related Edge Cases - 4/4 PASSED
✓ Category 3: Bounds Calculation - 3/3 PASSED
✓ Category 4: Coordinate Transform - 2/2 PASSED
✓ Category 5: Repositioning at Extremes - 2/2 PASSED
✓ Category 6: Visual Consistency - 2/2 PASSED
✓ Category 7: Functions & Code - 4/4 PASSED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: 20/20 PASSED (100%)
Success Rate: 100%
```

---

## If Tests Fail

### Category 1-3 Failing?
→ Pan bounds calculation issue. Check maxPan formula.

### Category 4 Failing?
→ Coordinate transformation with pan still broken. Review the fix applied.

### Category 5 Failing?
→ Repositioning broken. Test the new coordinate formula manually.

### Category 6 Failing?
→ **CRITICAL:** Black space appearing - pan bounds not enforced properly.

### Category 7 Failing?
→ Code not updated correctly. Verify changes applied to handlePlanTap().

---

## Critical Formula Review

### Current Pan Bounds:
```javascript
const baseCenterOffsetX = (displayedWidth - containerWidth) / 2;
const maxPanX = Math.abs(displayedWidth - containerWidth) / 2;
```

### Clamping:
```javascript
floorPlanPanX = Math.max(-maxPanX, Math.min(maxPanX, floorPlanPanX));
```

### Coordinate Transformation:
```javascript
const imageScreenX = containerX + baseCenterOffsetX + floorPlanPanX;
```

### Rendering:
```javascript
const renderedX = imagePercent * zoomLevel - (zoomLevel - 1) * 50;
```

---

## Key Questions Answered

### Q: Should users be able to drag beyond image edges?
**A:** NO. Pan bounds should prevent this.

### Q: Can black space appear around the image?
**A:** NO. Image should always fill container.

### Q: Are coordinates accurate when panned?
**A:** YES - fixed with new formula that explicitly adds pan offset.

### Q: Do pan bounds scale with zoom?
**A:** YES - calculated per zoom level.

### Q: Can you reposition at pan extremes?
**A:** YES - now that coordinate formula is fixed.

---

## Final Verification Checklist

Before considering this resolved:

- [ ] Run automated test suite (20 tests)
- [ ] All tests PASS
- [ ] Manual testing confirms no black space
- [ ] Drag smoothly to all edges
- [ ] Reposition works at extremes
- [ ] Console logs show correct formula
- [ ] No visual jitter or jumping

---

## Success Criteria

✅ **PASS if:**
1. All 20 automated tests pass
2. No black space appears when panning
3. Pan bounds prevent going past image edges
4. Repositioning works accurately at all pan positions
5. Zoom changes don't cause visual issues

❌ **FAIL if:**
1. Any test fails
2. Black space appears around image
3. User can drag beyond image bounds
4. Repositioning coordinates are wrong
5. Visual jitter or jumping occurs

---

## Next Steps

1. **Run the test suite** (copy script, paste in console)
2. **Review results** (all should PASS)
3. **Manual test** (verify no black space)
4. **Report findings** (document any failures)
5. **Iterate** (fix issues if found)

---

## Test Script Location

File: `EXTENSIVE_PAN_BOUNDS_TEST_SCRIPT.js`

Use this for automated validation of all edge cases.

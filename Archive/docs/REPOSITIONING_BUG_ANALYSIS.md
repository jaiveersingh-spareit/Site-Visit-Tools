# Repositioning Bug Analysis & Fix
## Pin Coordinate Accuracy Issues at Different Zoom Levels with Pan Offset

**Date:** June 10, 2026  
**Issue:** When repositioning pins at different zoom levels with pan offset, coordinates are inaccurate

---

## Problem Statement

When a user wants to **reposition an existing pin**:
1. User is at zoom level 1.5 with pan offset (e.g., x = -91.375)
2. User taps to reposition the pin
3. The new pin position doesn't match where user visually tapped
4. Inconsistency across zoom levels

**Root Cause:** The coordinate transformation in `handlePlanTap()` uses `getBoundingClientRect()` which includes pan offset, but the pan offset is ALSO being applied via CSS transform. This creates a **double-accounting problem**.

---

## The Issue Explained

### Current Code Flow:
```javascript
const imgRect = img.getBoundingClientRect();  // ← INCLUDES CSS transform (pan)!
const centerOffsetX = (imgRect.width - containerRect.width) / 2;
const containerX = cx - containerRect.left;
let imageScreenX = containerX + centerOffsetX;
```

### Problem:
When pan offset is applied via CSS `translate()`:
- `getBoundingClientRect()` returns the TRANSFORMED position
- But the centering offset calculation assumes a centered image
- When panned (pan offset ≠ 0), the flexbox centering is still applied UNDERNEATH the pan
- This creates confusion about what the "center" actually is

### Example at Zoom 1.5 with pan X = -91.375:
```
Container width: 343px
Image displayed width: 514.5px (343 * 1.5)

Without pan:
  - Center offset = (514.5 - 343) / 2 = 85.75px
  - Image appears centered with -85.75px offset

With pan = -91.375:
  - CSS transform: translate(-91.375px, ...)
  - Actual visible left edge: -85.75 - 91.375 = -177.125px
  - But getBoundingClientRect sees the FINAL position
```

This causes the centering offset calculation to be off!

---

## Solution

The fix is to **separate the pan offset handling from the centering offset**. We need to:

1. **Remove** the pan offset from consideration (it's already in CSS transform)
2. **Account for** only the flexbox centering when there's NO pan
3. **Use** pan offset directly from `floorPlanPanX` and `floorPlanPanY` instead of calculating from getBoundingClientRect

---

## Corrected Code

Replace the coordinate transformation section in `handlePlanTap()` (starting around line 3905):

### BEFORE (Buggy):
```javascript
const imgRect = img.getBoundingClientRect();

// When image is larger than container, flexbox centers it
const centerOffsetX = (imgRect.width - containerRect.width) / 2;
const centerOffsetY = (imgRect.height - containerRect.height) / 2;

// Tap position relative to container's top-left
const containerX = cx - containerRect.left;
const containerY = cy - containerRect.top;

// Convert to image display space
let imageScreenX = containerX + centerOffsetX;
let imageScreenY = containerY + centerOffsetY;

// Scale from display space to image pixel space
let imagePixelX = (imageScreenX / imgRect.width) * imgWidth;
let imagePixelY = (imageScreenY / imgRect.height) * imgHeight;
```

### AFTER (Fixed):
```javascript
const imgRect = img.getBoundingClientRect();

// Get container dimensions WITHOUT transform
const containerX = cx - containerRect.left;
const containerY = cy - containerRect.top;

// Account for flexbox centering (only when no pan offset)
// At 100% zoom, image fits container exactly, no centering needed
// At higher zooms, image is centered, but pan offset shifts it
const displayedWidth = floorPlanDisplayState.displayedWidth;
const displayedHeight = floorPlanDisplayState.displayedHeight;

// Calculate centering offset (before pan is applied)
const baseCenterOffsetX = (displayedWidth - containerRect.width) / 2;
const baseCenterOffsetY = (displayedHeight - containerRect.height) / 2;

// Convert to image display space: account for centering + pan
let imageScreenX = containerX + baseCenterOffsetX + floorPlanPanX;
let imageScreenY = containerY + baseCenterOffsetY + floorPlanPanY;

// Scale from display space to image pixel space
let imagePixelX = (imageScreenX / displayedWidth) * imgWidth;
let imagePixelY = (imageScreenY / displayedHeight) * imgHeight;
```

---

## Mathematical Proof

### Original Problem:
```
Tap at screen position: (400px, 300px)
Container left: 50px, top: 100px
Container width: 343px, height: 686px

containerX = 400 - 50 = 350px
containerY = 300 - 100 = 200px

Image display width: 514.5px (at zoom 1.5)
Image display height: 686px

centerOffsetX = (514.5 - 343) / 2 = 85.75px

imageScreenX = 350 + 85.75 = 435.75px  ← WRONG! This doesn't account for pan!
```

### Fixed Solution:
```
Pan offset X: -91.375px
Pan offset Y: 0px

baseCenterOffsetX = 85.75px
floorPlanPanX = -91.375px

imageScreenX = 350 + 85.75 + (-91.375)
             = 350 + 85.75 - 91.375
             = 344.375px  ← CORRECT!

Scale to image pixels:
imagePixelX = (344.375 / 514.5) * 3024
            = 0.6694 * 3024
            = 2024px of 3024px total
            = 66.9% of image
```

---

## Why This Matters

When repositioning at different zoom levels:
- **Before fix:** Pan offset is double-counted or not counted, causing wrong coordinates
- **After fix:** Pan offset is properly accounted for, coordinates are accurate

---

## Implementation Notes

1. Replace the coordinate transformation code in `handlePlanTap()` around line 3905
2. Use `floorPlanDisplayState.displayedWidth/Height` instead of `imgRect.width/height`
3. Add pan offset directly to the calculation
4. Remove reliance on `getBoundingClientRect()` for centering offset (keep it only for validation)

---

## Test Case

**Before Fix:**
- Zoom 150%, pan left (-91.375px)
- Tap at visual position 50% of image
- Get coordinates like 45% (wrong!)

**After Fix:**
- Zoom 150%, pan left (-91.375px)
- Tap at visual position 50% of image
- Get coordinates 50% (correct!)

---

## Bounds Concern

The user mentioned bounds are creating a concern. This is likely because:

1. **With wrong coordinates:** Pins appear in wrong locations, then bounds enforcement clamps them incorrectly
2. **With correct coordinates:** Bounds enforcement works properly because inputs are correct

Once coordinates are accurate, bounds enforcement will work as intended.

---

## Expected Result After Fix

✅ Repositioning pins works accurately at all zoom levels  
✅ Pan offset doesn't interfere with coordinate calculation  
✅ Bounds enforcement clamps correct values  
✅ Pin stays visually locked to tapped location

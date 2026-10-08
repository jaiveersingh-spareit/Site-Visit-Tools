# Phase 2: Edge Case Testing & Pan/Drag Fixes

## Overview
After the pan bounds fix, we'll systematically test all edge cases from the testing guide, one by one. This ensures no breakages and builds confidence in the coordinate system.

---

## Recent Fixes Applied

### Pan Bounds Constraint (Fixed)
**Issue:** When dragging a zoomed image, pan could exceed bounds, causing stations to go off-screen
**Solution:** 
- Proper aspect ratio handling in overflow calculation
- Better pan constraint enforcement
- Logging to debug pan issues
- Enforcement after zoom changes

**What Changed:**
- `enforcePanBounds()` function added
- Pan constraint now uses actual image dimensions
- Logging shows when bounds are applied
- Zoom changes trigger pan re-constraint

**To Test:** Drag to edge at different zoom levels - should snap back to bounds

---

## Test Plan - One by One

### ⚠️ PREREQUISITES
Before testing, ensure:
- [ ] Server is running
- [ ] File has latest changes (pan bounds fix)
- [ ] Test mode is enabled
- [ ] Browser console is open (F12)
- [ ] Each test starts fresh (reload page between tests if data persists)

---

## TEST 1: Pan Bounds at Zoom 100%

**Expected Behavior:** No panning at zoom 100% (image fits container)

```
1. Create a floor with image
2. Add 2-3 stations at different positions
3. Try to drag the image left/right/up/down
4. Console should show: "floorPlanZoom > 1" check skips pan
Expected: Image doesn't move, stays centered
Check for:
   ✓ No pan applied at zoom 1.0
   ✓ Stations visible in original positions
   ✓ No hidden stations
```

**Pass Criteria:**
- Image cannot be dragged at 100% zoom
- All stations remain visible and in place
- Console shows no pan events logged

---

## TEST 2: Pan Bounds at Zoom 150%

**Expected Behavior:** Drag limits prevent viewing empty space

```
1. Zoom to 150%
2. View changes - image larger, centered
3. Try to drag FAR to the left (beyond bounds)
4. Console should log: "[PAN] Bounds constraint applied"
Expected: Drag snaps back to limit
Check for:
   ✓ Pan requested: e.g., -200px
   ✓ Pan clamped: e.g., -99.5px (the bound)
   ✓ Clipping message in console
```

**Pass Criteria:**
- Can drag to edges but not beyond
- Console shows bounds constraint logs
- Pan values never exceed maxBounds
- Stations remain visible (not clipped off)

---

## TEST 3: Pan Proportional Scaling on Zoom Change

**Expected Behavior:** When zoom changes, pan adjusts proportionally to keep view centered

```
1. Zoom to 150%, pan to the right (e.g., pan.x = +50px)
2. Change zoom to 100%
   - Pan should scale down proportionally
   - View should stay roughly centered
3. Change zoom to 175%
   - Pan should scale up again
   - View centered again
Check console for:
   "[ZOOM] Changing zoom level: from X to Y, panBefore/After"
```

**Pass Criteria:**
- Pan scales proportionally: pan *= zoomRatio
- After zoom change, pan is re-constrained
- View doesn't jump unexpectedly
- Stations stay visible throughout zoom change

---

## TEST 4: Stations Don't Get Hidden During Pan

**Expected Behavior:** All placed stations remain visible at all pan/zoom states

```
1. Create 4 stations across the image:
   - A: Left side (15%)
   - B: Top (20%)
   - C: Right side (85%)
   - D: Bottom (80%)
2. Zoom to 175%
3. Pan aggressively to each edge
4. At each position, verify ALL stations visible or partially visible
Check for:
   ✗ NOT: Any station completely hidden (off-screen)
   ✓ YES: Stations at edges may be clipped, but never missing
```

**Pass Criteria:**
- No stations completely disappear
- Stations at edges may be partially clipped (expected)
- Can pan back to center and see all stations again
- No "ghost" behavior where station appears then disappears

---

## TEST 5: Coordinate Accuracy While Panning

**Expected Behavior:** Tap coordinates correct even with pan offset active

```
1. Zoom to 150%
2. Pan to offset position (e.g., pan.x = -75px)
3. Tap to place new station
4. Console shows:
   - Screen coordinates (tap position)
   - imgRect includes pan offset (getBoundingClientRect)
   - Calculated pin coordinates (should be 2-98%)
5. Confirm location
6. Station appears at correct visual location
Check:
   ✓ Console: "[PLAN TAP] Coordinate calculation includes panOffset"
   ✓ Pin placed correctly despite pan
```

**Pass Criteria:**
- Tap coordinates account for pan offset
- Placed pin is at correct visual spot
- Console shows coordinate transformation with pan included
- No offset error in pin placement

---

## TEST 6: Pan After Placing Station (Doesn't Move Pin)

**Expected Behavior:** Once pin is placed and confirmed, panning doesn't move it

```
1. Place Station A at position (45, 60) at zoom 100%
2. Zoom to 150%
3. Pan the image around while station is visible
4. Station A should move with image (stays locked to image content)
5. Check Station A coordinates in data:
   - Still stored as (45, 60)
   - Rendered position changes with zoom/pan
Check:
   ✓ Stored coords don't change
   ✓ Pin visually stays on image
   ✓ Console: Station A RENDERING shows formula correctly
```

**Pass Criteria:**
- Station coordinates unchanged
- Pin visually tracks image movement (via transform)
- Rendered percentages account for zoom/pan
- No "drift" where pin moves relative to image

---

## TEST 7: Pan + Zoom Combination

**Expected Behavior:** Dragging and zooming together work smoothly

```
1. Place Station A at (50, 50)
2. Zoom to 125%, pan left
3. While panned, zoom to 150%
   - Pan should scale with zoom ratio
   - Pan should re-constrain to new bounds
4. While panned, zoom back to 100%
   - Pan resets to 0
   - Station centered again
Check console:
   "[ZOOM] Changing zoom: pan scales and re-constrains"
   "[PAN BOUNDS] Enforced after zoom"
```

**Pass Criteria:**
- No jumpy/glitchy behavior
- Pan scales smoothly with zoom
- Bounds enforced after each zoom
- Station remains visible (or predictably moves off-screen)

---

## TEST 8: Extreme Pan Attempts

**Expected Behavior:** Bounds prevent extreme over-panning

```
1. Zoom to 175% (maximum zoom)
2. Attempt to drag FAR beyond limits:
   - Drag all the way left until reaching limit
   - Drag all the way right until reaching limit
   - Drag up/down to limits
3. Try rapid/aggressive swiping
Check:
   ✓ Each pan attempt clamps to bounds
   ✓ Console shows multiple constraint logs
   ✓ Never goes beyond maxBounds
```

**Pass Criteria:**
- Pan never exceeds bounds regardless of drag force
- Rapid dragging handled correctly
- No rubber-banding or jitter
- Station visibility maintained

---

## TEST 9: Multiple Zoom-Pan Cycles

**Expected Behavior:** Repeated zoom/pan cycles don't degrade accuracy

```
Cycle 1:
  1. Place Station A at (30, 40)
  2. Zoom 125%, pan, zoom back
  3. Check Station A still at (30, 40)

Cycle 2:
  1. Zoom 150%, pan aggressively
  2. Place Station B
  3. Zoom 100%
  4. Zoom 175%, check both stations visible

Cycle 3:
  1. Pan-zoom-pan-zoom sequences
  2. After 5+ cycles, verify:
     - All stations at original coordinates
     - No accumulation of error
     - Rendering formula still correct
```

**Pass Criteria:**
- No coordinate drift after multiple cycles
- Stored coordinates remain stable
- Rendered positions update correctly each time
- No precision loss from repeated transforms

---

## TEST 10: Pan Bounds at Different Container Sizes

**Expected Behavior:** Pan bounds adapt to container/screen size

```
On Desktop (Wide):
  1. Zoom 150%, note max pan bounds
  2. Pan to limits
  3. Verify bounds match wide container

On Mobile (if available):
  1. Same zoom, different aspect ratio
  2. Pan bounds should differ (narrower container)
  3. Verify no over-panning

Check formula:
  maxPanX = |displayedWidth - containerWidth| / 2
```

**Pass Criteria:**
- Pan bounds scale with container size
- No hard-coded values assumed
- Works on different screen sizes
- Bounds calculated dynamically each time

---

## TEST 11: Edge Station Visibility

**Expected Behavior:** Stations near edges can be accessed even when zoomed

```
1. Place stations at edge positions:
   - Left: 3% (near minimum)
   - Right: 97% (near maximum)
   - Top: 3%
   - Bottom: 97%
2. Zoom to 175%
3. Pan to view each edge station
4. Verify:
   - Can see/reach left station by panning left
   - Can see/reach right station by panning right
   - etc.
Check:
   ✓ Rendered position = imagePercent * zoom - (zoom-1)*50
   ✓ At 3%: rendered = 3 * 1.75 - 37.5 = -31.5% (off left edge, but reachable by pan)
```

**Pass Criteria:**
- Edge stations not permanently hidden
- Can navigate to all edge stations via pan
- Stations stay on image (not disconnected)

---

## TEST 12: Pan Bounds Enforcement Logging

**Expected Behavior:** Console logs show when bounds are applied

```
1. Zoom to 150%
2. Drag left aggressively
3. Console should show:
   [PAN] Bounds constraint applied: {
     requested: {x: -150.5, y: 0},
     clamped: {x: -99.5, y: 0},
     maxBounds: {x: 99.5, y: 111.9},
     overflow: {x: 199, y: ...},
     zoom: 1.5
   }
4. Each over-pan attempt logged
```

**Pass Criteria:**
- Logs appear when bounds exceeded
- Shows requested vs clamped values
- Max bounds values are correct
- Zoom level logged for context

---

## Summary Checklist

After completing all 12 tests:

- [ ] TEST 1: Pan disabled at 100%
- [ ] TEST 2: Pan bounds enforced at higher zoom
- [ ] TEST 3: Pan scales on zoom change
- [ ] TEST 4: Stations don't get hidden
- [ ] TEST 5: Tap coordinates account for pan
- [ ] TEST 6: Pin doesn't move during pan
- [ ] TEST 7: Pan + zoom combination smooth
- [ ] TEST 8: Extreme pan attempts bounded
- [ ] TEST 9: Multiple cycles preserve accuracy
- [ ] TEST 10: Pan bounds adapt to container size
- [ ] TEST 11: Edge stations accessible
- [ ] TEST 12: Bounds enforcement logged

**Final Status:**
- [ ] All tests passed ✅
- [ ] Some issues found (describe below):

---

## Issues Found During Testing

If you find issues, document them here:

```
Issue #1:
  Description: 
  Reproduction steps:
  Expected vs Actual:
  Console logs:

Issue #2:
  ...
```

---

## Console Log Key Terms

Watch for these in the console to understand what's happening:

| Log Pattern | Meaning |
|---|---|
| `[PAN] Bounds constraint applied` | Pan exceeded limit, was clamped |
| `[ZOOM] Changing zoom level` | Zoom changed, pan scaled |
| `[PAN BOUNDS] Enforced after zoom` | Pan re-constrained after zoom |
| `[PLAN TAP] Coordinate transformation` | Tap being captured with current pan/zoom |
| `[RENDER PINS]` | Station rendering with formula |

---

## Next Steps After Testing

1. **All 12 tests pass?** ✅ Move to "Confidence Testing" phase
2. **Some tests fail?** Document issues and work through them
3. **New bugs found?** Add to this document and test again

---

## Notes

- Each test can be run independently (restart with fresh data if needed)
- Tests can be combined (e.g., run 4+5+6 together)
- Focus on whether stations remain visible and accurate
- Watch console logs for unexpected behavior

Good luck! 🧪

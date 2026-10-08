# Quick Stress Test Checklist

Use this while testing. Check off each item as you complete it.

---

## Phase 1: Automated Validation (5 minutes)

- [ ] **Enable test mode** 
  - Click toggle button
  - Check console for validation report
  - Expected: "✅ ALL TESTS PASSED"

**If any test fails:**
- Note which test failed
- Screenshot the error
- Don't continue until this is fixed

---

## Phase 2: Boundary Testing (10 minutes)

### Left Edge (2%)
- [ ] Tap near far left of image
- [ ] Confirm location
- [ ] Zoom to 150%
- [ ] **Verify:** Pin still at left edge (visually locked)
- [ ] Zoom back to 100%
- [ ] **Verify:** Pin back at original visual position

### Right Edge (98%)
- [ ] Tap near far right of image
- [ ] Confirm location
- [ ] Zoom to 150%
- [ ] **Verify:** Pin still at right edge (visually locked)
- [ ] Zoom back to 100%
- [ ] **Verify:** Pin back at original visual position

### Center (50%)
- [ ] Tap exact center of image
- [ ] Confirm location
- [ ] Zoom through all levels (1.25, 1.5, 1.75, back to 1.0)
- [ ] **Verify:** Pin stays visually in center at ALL zoom levels

---

## Phase 3: Zoom Consistency (10 minutes)

### Create 3 Test Pins
- [ ] Station A: Left side (25% x)
- [ ] Station B: Center (50% x)
- [ ] Station C: Right side (75% x)

### Verify Ordering at Each Zoom
- [ ] At zoom 1.0: A is left, B is center, C is right
- [ ] At zoom 1.25: Same order (even if some render outside container)
- [ ] At zoom 1.5: Same order
- [ ] At zoom 1.75: Same order

**Fail condition:** If order changes (e.g., C becomes leftmost)

---

## Phase 4: Repositioning Workflow (10 minutes)

### Simple Reposition
- [ ] Create Station A at position (40, 50)
- [ ] Open Station A
- [ ] Click "Reposition"
- [ ] Tap new position (45, 55)
- [ ] Confirm new location
- [ ] Open Station A again
- [ ] **Verify:** Coordinates now show (45, 55) [±1% is OK]

### Reposition After Zoom
- [ ] Create Station B at zoom 100%, position (30, 60)
- [ ] Zoom to 150%
- [ ] Click "Reposition" on Station B
- [ ] Tap new position (35, 65)
- [ ] Confirm
- [ ] Zoom back to 100%
- [ ] **Verify:** Station B at (35, 65), not (30, 60)

---

## Phase 5: Rapid Tapping (5 minutes)

- [ ] Enable test mode
- [ ] Tap 5+ times rapidly on different spots
- [ ] Confirm each location
- [ ] **Verify:** All stations created with distinct coordinates
- [ ] **Verify:** No "frozen UI" or missing modals
- [ ] Export test data to JSON
- [ ] Check JSON for valid coordinates

---

## Phase 6: Console Log Verification (5 minutes)

Open DevTools (F12) → Console tab

### Check for these log patterns:
- [ ] `[RENDER PINS] Station X - RENDERING:`
  - Verify formula shows calculation
  - E.g., `formula: "45.23 * 1.5 - (1.5 - 1) * 50 = 29.04"`

- [ ] `[PLAN TAP] Pin placed at:`
  - Should show x and y between 2-98%

- [ ] `PIN PLACEMENT EDGE CASE VALIDATION:`
  - Should show "✓" checks, not "❌" errors

### Check for these red flags:
- [ ] ❌ NaN or Infinity in coordinates
- [ ] ❌ Stored coordinates outside 2-98% (should be clamped)
- [ ] ❌ Rendered coordinates negative/outside at zoom 1.0 (at zoom > 1.0, OK to be outside)
- [ ] ❌ Formula calculation errors
- [ ] ⚠️ EXPECTED: Rendered coordinates can be negative or > 100% at higher zoom levels (this is correct! image extends beyond container)

---

## Phase 7: Data Persistence (5 minutes)

- [ ] Create 3 stations at different positions
- [ ] Export to JSON
- [ ] Close browser/app completely
- [ ] Reopen app
- [ ] **Verify:** All 3 stations still there at same positions
- [ ] Zoom and verify pins still locked to same spots

---

## Phase 8: Visual Shift Explanation (2 minutes)

**Test the visual shift behavior:**

1. Create Station at 40% x-position at zoom 100%
2. **Observe:** Station is 40% from left edge
3. Zoom to 150%
4. **Expected:** Station moves LEFT (appears at ~35% of screen)
   - This is CORRECT - image shifted due to centering
5. Zoom back to 100%
6. **Verify:** Station back at 40% position

**This is NOT a bug** - pins are locked to image content, not screen position.

---

## Final Checklist

- [ ] All automated tests passed
- [ ] All 4 zoom levels tested
- [ ] Boundary positions verified
- [ ] Repositioning works without corruption
- [ ] No NaN/Infinity/negative coordinates
- [ ] Pins maintain order at all zooms
- [ ] Console logs show correct formula calculations
- [ ] Data persists after app reload
- [ ] No UI freezes or missing modals
- [ ] Understand why pins move visually on zoom

---

## If You Find a Bug

**Document it:**
1. What did you do?
2. What did you expect?
3. What actually happened?
4. Screenshot / console log
5. Your device and browser
6. Zoom level when it occurred

**Export test data:**
- Click "Export" in test overlay
- Share the JSON file

---

## Estimated Total Time

- **Full stress test:** ~50 minutes
- **Quick test:** ~20 minutes (just phase 1, 2, 3)

---

## Success Criteria

✅ All automated validations pass
✅ Pins stay visually locked to image when zooming
✅ Coordinates in 2-98% range at all times
✅ No NaN/Infinity errors
✅ Pins maintain left-to-right order at all zooms
✅ Data persists after reload
✅ No UI freezes

---

**Ready to test?** Start with Phase 1 (enable test mode) and check the console! 🧪

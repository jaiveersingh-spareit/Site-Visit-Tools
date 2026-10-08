# Pin Coordinate Formula - Complete Explanation

## The Formula

```javascript
renderedX = storedX * zoomLevel - (zoomLevel - 1) * 50
```

Where:
- `storedX` = image percentage (0-100%, stored as 2-98% in practice)
- `zoomLevel` = current zoom (1.0, 1.25, 1.5, 1.75)
- `renderedX` = screen position percentage

---

## Why This Formula?

### The Problem
When an image is zoomed in a centered container, the image moves. A pin that's locked to the image needs to move with it, but in a way that keeps it visually connected to the same spot on the image content.

### Container Layout
```
Container: 343px wide
Image natural: 3024px wide
Display zoom: 1.0 × 343 = 343px
              1.5 × 343 = 514.5px
```

When image is **larger** than container, flexbox centers it:
- Image left edge position = -(imageWidth - containerWidth) / 2
- At zoom 1.5: -(514.5 - 343) / 2 = -85.75px (image extends to left)

---

## Derivation

### Step 1: Pin Position in Image Pixels
A pin at 40% of the image:
```
imagePixels = storedPercent% × imageNaturalWidth
            = 40% × 3024px
            = 1209.6px
```

### Step 2: Pin Position in Displayed Image
At zoom 1.5, image is displayed as 514.5px wide:
```
displayedPixels = imagePixels × (displayedWidth / imageNaturalWidth)
                = 1209.6 × (514.5 / 3024)
                = 205.8px from left of displayed image
```

### Step 3: Account for Centering Offset
Displayed image is centered with offset:
```
offset = -(displayedWidth - containerWidth) / 2
       = -(514.5 - 343) / 2
       = -85.75px
```

Position in container:
```
containerPixels = offset + displayedPixels
                = -85.75 + 205.8
                = 120.05px
```

### Step 4: Convert to Percentage
```
renderedPercent = containerPixels / containerWidth × 100
                = 120.05 / 343 × 100
                = 35%
```

### Step 5: Algebraic Simplification
Instead of calculating all those steps, we can use the formula:
```
containerPercent = (imagePercent × (containerWidth × zoom) - ((containerWidth × zoom) - containerWidth) / 2) / containerWidth
                 = imagePercent × zoom - ((zoom - 1) / 2) × 100
                 = imagePercent × zoom - (zoom - 1) × 50
```

**Verification:**
```
40 × 1.5 - (1.5 - 1) × 50 = 60 - 25 = 35% ✓
```

---

## Formula Properties

### Property 1: Identity at Zoom 1.0
```
At zoom 1.0: rendered = stored × 1.0 - (1.0 - 1) × 50
                      = stored × 1.0 - 0
                      = stored ✓
```
Example: Pin at 40% renders at 40% when not zoomed

### Property 2: Center Invariance
```
Pin at 50% (center):
At any zoom Z: rendered = 50 × Z - (Z - 1) × 50
                        = 50Z - 50Z + 50
                        = 50 ✓
```
The center always stays in the center!

### Property 3: Monotonicity
```
If storedX₁ < storedX₂, then renderedX₁ < renderedX₂
Because: renderedX = storedX × Z - (Z-1)×50
         The first term (storedX × Z) is linear with storedX
         The second term is constant
         Therefore ordering is preserved
```

### Property 4: Symmetry
```
Point 30% is 20% left of center (50% - 30% = 20%)
Point 70% is 20% right of center (70% - 50% = 20%)

At zoom 1.5:
30%: 30×1.5 - 25 = 45 - 25 = 20% (20% left of 50%) ✓
70%: 70×1.5 - 25 = 105 - 25 = 80% (30% right of 50%) ✓
```

---

## Expected Behavior at Different Zooms

### Zoom 1.0 (100%)
```
Stored: 40%
Rendered: 40 × 1.0 - 0 = 40%
Visual: Pin visible on screen at 40% from left
```

### Zoom 1.25 (125%)
```
Stored: 40%
Rendered: 40 × 1.25 - 12.5 = 50 - 12.5 = 37.5%
Visual: Pin moves left (from 40% to 37.5%) because image shifted
        But pin is still on same image location
```

### Zoom 1.5 (150%)
```
Stored: 40%
Rendered: 40 × 1.5 - 25 = 60 - 25 = 35%
Visual: Pin moves further left (centered image extends beyond edges)
        But pin is still visually locked to image content
```

### Zoom 1.75 (175%)
```
Stored: 40%
Rendered: 40 × 1.75 - 37.5 = 70 - 37.5 = 32.5%
Visual: Pin moves even more left
        Still locked to image content
```

---

## Edge Cases

### Edge Case 1: Minimum Position (2%)
```
At zoom 1.0: 2 × 1.0 - 0 = 2% (visible at left edge)
At zoom 1.5: 2 × 1.5 - 25 = 3 - 25 = -22% (OFF left edge!)
```
**This is CORRECT.** The pin is at 2% of the image, but when zoomed, that spot is outside the visible container. The pin would be cut off/clipped.

### Edge Case 2: Maximum Position (98%)
```
At zoom 1.0: 98 × 1.0 - 0 = 98% (visible at right edge)
At zoom 1.5: 98 × 1.5 - 25 = 147 - 25 = 122% (OFF right edge!)
```
**This is CORRECT.** Pin is at 98% of image, zoomed beyond container bounds.

### Edge Case 3: Center (50%)
```
At zoom 1.0: 50% ✓
At zoom 1.25: 50% ✓
At zoom 1.5: 50% ✓
At zoom 1.75: 50% ✓
```
**Always 50% - perfect!**

---

## Validation Criteria

### ✅ VALID (No Bugs)
```
✓ At zoom 1.0:
  - All pins in 0-100% range
  - rendered ≈ stored (within rounding)

✓ At zoom > 1.0:
  - Pins far from center may be outside 0-100% range
  - This is EXPECTED and CORRECT
  - Represents parts of image outside visible container

✓ At any zoom:
  - Center (50%) always renders at 50%
  - Order preserved (left pins stay left)
  - Distance from center preserved
```

### ❌ INVALID (Bugs)
```
✗ Stored coordinates outside 2-98% range
  - Should be clamped

✗ At zoom 1.0:
  - Rendered coordinates outside 0-100%
  - Should equal stored

✗ Formula produces different values at same zoom
  - Indicates rounding error or corruption

✗ Pin order changes at different zoom levels
  - Violates monotonicity
  - Indicates formula error
```

---

## Test Validation Logic

### Test 1: Zoom 1.0 Identity
```javascript
for (let x = 2; x <= 98; x += 10) {
  rendered = formula(x, 1.0);
  assert(rendered ≈ x, "At zoom 1, rendered should equal stored");
}
```

### Test 2: Center Invariance
```javascript
for (let zoom of [1.0, 1.25, 1.5, 1.75]) {
  rendered = formula(50, zoom);
  assert(rendered === 50, "Center always at 50%");
}
```

### Test 3: Boundary Behavior at Higher Zooms
```javascript
// These are EXPECTED to be outside 0-100%:
formula(2, 1.5);   // -22% (off left edge) ✓
formula(98, 1.5);  // 122% (off right edge) ✓

// These are ALWAYS in 0-100%:
formula(2, 1.0);   // 2%
formula(98, 1.0);  // 98%
```

---

## Common Misconceptions

### ❌ "Pin coordinates shouldn't go outside 0-100%"
**Wrong.** At zoom > 1.0, this is expected. The image extends beyond the visible container.

### ❌ "If pin moves when zooming, it's a bug"
**Wrong.** Pins SHOULD move when zooming (image shifts due to centering). This is correct.

### ❌ "Rendered coordinates should always equal stored"
**Wrong.** Only true at zoom 1.0. At higher zooms, rendered ≠ stored due to centering offset.

### ✅ "At zoom 1.0, rendered should equal stored"
**Correct!** This is how to verify the formula at base zoom level.

### ✅ "Pin should stay visually locked to image when zooming"
**Correct!** This is the entire point of the formula.

### ✅ "Negative rendered % means pin is off-screen"
**Correct!** This represents image areas that extend beyond the container.

---

## Mathematical Proof of Correctness

Given:
- Container width: W
- Zoom level: Z
- Pin image percentage: P

Rendered percentage:
```
R = P × Z - (Z - 1) × 50
```

Property check:

**1. Identity at Z=1:**
```
R = P × 1 - (1 - 1) × 50 = P ✓
```

**2. Center (P=50) always at 50%:**
```
R = 50 × Z - (Z - 1) × 50
  = 50Z - 50Z + 50
  = 50 ✓
```

**3. Symmetry (P=50±X renders as R=50±X×Z):**
```
For P = 50-X:
R = (50-X)×Z - (Z-1)×50
  = 50Z - XZ - 50Z + 50
  = 50 - XZ

For P = 50+X:
R = (50+X)×Z - (Z-1)×50
  = 50Z + XZ - 50Z + 50
  = 50 + XZ

Distances from center:
(50) - (50 - XZ) = XZ
(50 + XZ) - (50) = XZ
Both equal ✓
```

---

## Conclusion

The formula is **mathematically correct and proven**. When you see rendered coordinates outside 0-100% at higher zoom levels, that's **expected and correct** behavior - it means the pin is visually located on a part of the image that extends beyond the visible container when zoomed.

For debugging or verification, always check:
1. **At zoom 1.0:** rendered ≈ stored (within rounding)
2. **At all zooms:** center stays at 50%
3. **At all zooms:** order preserved (monotonic)
4. **At all zooms:** distances from center preserved (symmetric)

✅ If these pass, the system is working correctly!

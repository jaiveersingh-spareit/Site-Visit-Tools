# Y-Coordinate Bug Analysis

## Bug Summary
**Pins are positioned 37.7px too HIGH on the screen** across all zoom levels.

## Evidence
- **At 100% Zoom**: All 5 pins show Y-error of 37.74px
- **At 125% Zoom**: All 5 pins show Y-error of 37.62px
- **Pattern**: Identical error for all image coordinates (not zoom-dependent)
- **X-Coordinate**: PERFECT (0.00px error)
- **Y-Coordinate**: SYSTEMATIC OFFSET (37.7px error)

## Root Cause
The 37.7px offset suggests one of:
1. **CSS Margin/Padding**: The floor screen has `paddingTop: 16px` but that doesn't account for 37px
2. **Hardcoded Offset**: There may be a hardcoded Y offset in the pin positioning
3. **Container Position Calculation**: The way `getBoundingClientRect()` is being used vs how pins are absolutely positioned

##Key Finding
Looking at renderPins() code (lines 3527-3528):
```javascript
const screenY = -centerOffsetY + displayedY - floorPlanPanY;
```

When:
- centerOffsetY ≈ 0
- displayedY = image fraction * displayed height
- floorPlanPanY = 0 (no panning)

This should work... but the EXPECTED value being calculated in verification showed 186.9 at 100% for center pin, when it should be ~149.

## Hypothesis
The issue is in how the EXPECTED value is being calculated in the verification code, NOT in the actual rendering. The pins might actually be correct, but our formula for "expected" is wrong.

OR: There's an invisible UI element (like a sticky header) that's 37px tall that we need to account for.

## Next Action
Compare the actual tap handler coordinate conversion (`handlePlanTap`) with the pin rendering to see if they're using the same formula.

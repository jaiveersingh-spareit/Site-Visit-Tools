# Pan/Drag Edge Cases Inventory
## Comprehensive Analysis of Bounds and Pan Offset Scenarios

**Date:** June 10, 2026  
**Purpose:** Identify all edge cases and potential issues with pan bounds

---

## Edge Case Categories

### CATEGORY 1: Pan Direction Extremes

#### 1.1 Pan Left (Negative X Offset)
- **Description:** User drags image to the right, moving left edge into view
- **Expected:** Pan stops when left edge of image reaches left edge of container
- **Current Behavior:** Needs verification
- **Max Pan:** -(overflow / 2)
- **Issue Concern:** Can user drag past left edge? Can black space appear?

#### 1.2 Pan Right (Positive X Offset)
- **Description:** User drags image to the left, moving right edge into view
- **Expected:** Pan stops when right edge of image reaches right edge of container
- **Current Behavior:** Needs verification
- **Max Pan:** +(overflow / 2)
- **Issue Concern:** Can user drag past right edge? Can black space appear?

#### 1.3 Pan Up (Negative Y Offset)
- **Description:** User drags image downward, moving top edge into view
- **Expected:** Pan stops when top edge reaches top edge of container
- **Current Behavior:** Needs verification
- **Max Pan:** -(overflow / 2)
- **Issue Concern:** Can user see empty space above image?

#### 1.4 Pan Down (Positive Y Offset)
- **Description:** User drags image upward, moving bottom edge into view
- **Expected:** Pan stops when bottom edge reaches bottom edge of container
- **Current Behavior:** Needs verification
- **Max Pan:** +(overflow / 2)
- **Issue Concern:** Can user see empty space below image?

---

### CATEGORY 2: Zoom-Related Edge Cases

#### 2.1 Pan at 100% Zoom
- **Scenario:** No panning should be allowed (image fits container)
- **Expected:** maxPanX = 0, maxPanY = 0 (based on aspect ratio)
- **Current:** Minimal panning (11.5px X at 100%)
- **Issue:** Why is any panning allowed at 100%?

#### 2.2 Pan at Maximum Zoom (175%)
- **Scenario:** User at extreme zoom, pans to edges
- **Expected:** Image content should NOT go off-screen
- **Current:** Allows significant panning (129.1px X)
- **Issue:** Does extremes meet requirements?

#### 2.3 Zoom Change While Panned
- **Scenario:** User pans left, then zooms from 150% to 100%
- **Expected:** Pan resets or scales down gracefully
- **Current:** Pan scales proportionally
- **Issue:** Does final position make sense? Can empty space appear?

#### 2.4 Zoom Change Mid-Drag
- **Scenario:** User dragging image while zoom changes
- **Expected:** Pan recalculated immediately
- **Current:** enforcePanBounds() called after zoom
- **Issue:** Smooth transition or glitch?

---

### CATEGORY 3: Bounds Calculation Scenarios

#### 3.1 Overflow Calculation at Different Zooms
```
Zoom 100%:   overflow = 343 - 343 = 0      (maxPan = 0)
Zoom 125%:   overflow = 428.75 - 343 = 85.75  (maxPan = 42.9)
Zoom 150%:   overflow = 514.5 - 343 = 171.5   (maxPan = 85.75)
Zoom 175%:   overflow = 600.25 - 343 = 257.25 (maxPan = 128.6)
```
**Issue:** Are these maxPan values preventing over-panning?

#### 3.2 Non-Square Image Aspects
- **16:9 image:** Different overflow on X vs Y
- **4:3 image:** Different proportions
- **Square image:** Same overflow on X and Y
- **Portrait image (3:4):** Y might be constrained by height
- **Landscape image (16:9):** Y might be unconstrained
- **Issue:** Do all aspects handle bounds correctly?

#### 3.3 Container Size Variations
- **Small container (mobile):** Pan bounds need scaling
- **Large container (desktop):** Pan bounds more generous
- **Issue:** Are calculations responsive?

---

### CATEGORY 4: Rapid/Aggressive Interaction Scenarios

#### 4.1 Rapid Dragging
- **Scenario:** Quick swipes in multiple directions
- **Expected:** Bounds enforced on every event
- **Current:** enforcePanBounds() called each pan
- **Issue:** Performance? Jank?

#### 4.2 Flinging/Momentum (if supported)
- **Scenario:** Fast drag with momentum scrolling
- **Expected:** Bounds respected even with momentum
- **Current:** No momentum handling visible
- **Issue:** Does framework handle this?

#### 4.3 Multi-finger Drag (if supported)
- **Scenario:** Two-finger drag for panning
- **Expected:** Same bounds applied
- **Current:** Hammer.js handles this
- **Issue:** Consistent behavior?

#### 4.4 Rapid Zoom Changes + Pan
- **Scenario:** User zooms while also panning
- **Expected:** Pan re-constrained for new zoom
- **Current:** enforcePanBounds() called
- **Issue:** Smooth or glitchy?

---

### CATEGORY 5: Repositioning-Specific Edge Cases

#### 5.1 Reposition at Pan Extremes
- **Scenario:** Pan to left edge, then reposition
- **Expected:** New pin positioned accurately
- **Current:** Fixed with new formula
- **Issue:** Verified working?

#### 5.2 Reposition Across Pan Transitions
- **Scenario:** Pan left, reposition, pan right, reposition
- **Expected:** Each reposition accurate
- **Current:** Fixed formula should handle it
- **Issue:** Needs testing

#### 5.3 Reposition When Panned to Edge
- **Scenario:** Pan all the way left, tap near edge
- **Expected:** Pin positioned at correct edge percentage
- **Current:** Should be fixed
- **Issue:** Edge coordinates accurate?

---

### CATEGORY 6: Coordinate Transformation Edge Cases

#### 6.1 Tap at Container Corner
- **Scenario:** Tap at top-left corner of visible container
- **Expected:** Coordinates map to image corner (with pan consideration)
- **Current:** Multiple transforms applied
- **Issue:** Accurate at corners?

#### 6.2 Tap at Image Edge (Off-Screen)
- **Scenario:** Attempt to tap beyond visible image (off-screen area)
- **Expected:** Should not place pin off-image
- **Current:** Clamped to 2-98%
- **Issue:** Clamping prevents off-image pins?

#### 6.3 Tap While Panning Actively
- **Scenario:** Tap during mid-drag gesture
- **Expected:** Tap coordinates use current pan offset
- **Current:** getBoundingClientRect() includes pan
- **Issue:** Correct handling?

#### 6.4 Extreme Pan + Extreme Tap
- **Scenario:** Pan to extreme (-128px), tap at extreme location
- **Expected:** Coordinate transformation handles extreme case
- **Current:** Needs verification
- **Issue:** Math holds up at extremes?

---

### CATEGORY 7: Visual Consistency

#### 7.1 Black Space Appearing
- **Scenario:** Any condition where empty container shows around image
- **Expected:** Should NEVER happen
- **Current:** Pan bounds should prevent
- **Issue:** Does it actually prevent?

#### 7.2 Image Clipping
- **Scenario:** Image content cut off at edges
- **Expected:** Image extends beyond container (that's normal)
- **Current:** Zoom allows viewing all content
- **Issue:** Can you view entire image without gaps?

#### 7.3 Pins Disappearing
- **Scenario:** Pin goes off-screen when pan/zoom changes
- **Expected:** Should be accessible by panning back
- **Current:** Pin coordinates stay locked
- **Issue:** Can you always navigate back to see all pins?

#### 7.4 Visual Jitter
- **Scenario:** Image position jumps during pan bounds enforcement
- **Expected:** Smooth clamping
- **Current:** enforcePanBounds() might cause jumps
- **Issue:** Noticeable jank?

---

### CATEGORY 8: Browser/Device Edge Cases

#### 8.1 Different Screen Sizes
- **Mobile (360px):** Very tight bounds
- **Tablet (768px):** Medium bounds
- **Desktop (1920px):** Large bounds
- **Issue:** Bounds proportional to screen size?

#### 8.2 Different DPI/Scale
- **Low DPI (72 PPI):** Larger perceived pan
- **High DPI (326 PPI):** Smaller perceived pan
- **Issue:** Bounds account for device pixel ratio?

#### 8.3 Landscape vs Portrait Orientation
- **Portrait:** Container 343px wide
- **Landscape:** Container wider
- **Issue:** Pan bounds adjust for orientation change?

#### 8.4 Different Input Methods
- **Touch (iOS):** Hammer.js
- **Mouse (Desktop):** Hammer.js
- **Trackpad:** Hammer.js
- **Issue:** Consistent behavior across input methods?

---

## Summary of Concerns

### Critical Issues to Test:
1. ⚠️ Can user drag image PAST the edges (black space appears)?
2. ⚠️ Are pan bounds correctly preventing over-panning?
3. ⚠️ Does repositioning work accurately at all pan extremes?
4. ⚠️ Are pins always accessible (can pan back to see them)?
5. ⚠️ Is visual jitter present during bounds enforcement?

### Mathematical Verification Needed:
- Bounds calculation formula at all zoom levels
- Coordinate transformation with extreme pan values
- Image dimensions vs container dimensions at different aspect ratios

### Behavioral Verification Needed:
- Pan smoothness and responsiveness
- Zoom transitions with active panning
- Repositioning accuracy across all conditions

---

## Recommended Test Priority

**HIGHEST PRIORITY (Critical):**
1. Pan beyond image edges (black space test)
2. Coordinate accuracy at pan extremes
3. Repositioning at pan extremes

**HIGH PRIORITY (Important):**
4. Pan smoothness and jitter
5. Zoom + pan interactions
6. Pin accessibility after pan/zoom

**MEDIUM PRIORITY (Nice to Have):**
7. Different device sizes
8. Orientation changes
9. Visual feedback improvements

---

## Mathematical Formula Review

### Current Pan Bounds:
```javascript
maxPanX = Math.abs(overflowX) / 2;
maxPanY = Math.abs(overflowY) / 2;

// This allows panning by half the overflow
// Symmetric: can pan equally left/right or up/down
```

### Question: Is this formula correct for preventing edge over-panning?

Consider zoom 150% with X-axis:
```
Container: 343px
Image displayed: 514.5px
Overflow: 171.5px
Max pan: 85.75px

If we pan left by -85.75px:
  Left edge of image: -85.75px (at container left edge) ✓
  
If user tries to pan left by -100px:
  Gets clamped to -85.75px ✓
  
If user tries to pan left by -200px:
  Gets clamped to -85.75px ✓

So formula DOES prevent over-panning... but does it prevent BLACK SPACE?
```

---

## Key Question to Answer

**Does the current pan bounds formula actually prevent the container from showing empty space?**

If user pans to max (-85.75px):
- Left edge of 514.5px image appears at left edge of 343px container
- Image extends 514.5 - 343 = 171.5px beyond right edge
- Right edge of image is off-screen (not visible)
- Container shows image from left to right, no empty space

**Verdict:** Formula DOES prevent black space IF pan limits are enforced.

**But:** What if pan limits are NOT enforced or a bug allows pan past the limit?

# Phone Test Data Analysis
## Critical Finding: Different Image on Phone

**Date:** June 10, 2026  
**Platform:** iOS  
**Status:** ⚠️ CRITICAL MISMATCH DETECTED

---

## The Problem: Different Image on Phone!

### Desktop Image
```
Width: 4032px
Height: 3024px
Aspect Ratio: 1.333 (4:3 LANDSCAPE)
```

### Phone Image
```
Width: 3024px
Height: 4032px
Aspect Ratio: 0.75 (3:4 PORTRAIT)
```

**THE IMAGES ARE TRANSPOSED!**

The desktop and phone are using **completely different floor plan images**!

---

## Phone Test Data

### Tap History
```
Tap 1: x=43.33%, y=48.77% @ zoom 1.5
Tap 2: x=48.10%, y=15.60% @ zoom 1.0
```

### Current State on Phone
```
Zoom: 1.5
Pan offset: x=-132, y=102

Display dimensions:
  Container: 343×686px
  Image natural: 3024×4032px (PORTRAIT!)
  Aspect ratio: 0.75
  displayedWidth: 771.75px
  displayedHeight: 1029px
```

---

## Analysis: Is Phone Data Correct?

### Calculation Verification

At zoom 1.5 with 3:4 portrait:
```
displayedHeight = containerHeight * zoom
              = 686 * 1.5
              = 1029px ✓ CORRECT

displayedWidth = displayedHeight * aspectRatio
              = 1029 * 0.75
              = 771.75px ✓ CORRECT
```

**The math is correct for the portrait image!**

---

## The Real Issue: Which Image is Correct?

### Question 1: What's the actual floor plan image?
- **Desktop tested:** 4032×3024 (landscape 4:3)
- **Phone tested:** 3024×4032 (portrait 3:4)
- **Which one is the actual floor plan?**

### Question 2: Are the taps accurate?
On phone with portrait image:
- Tap 1 at 43.33%, 48.77% (near center, middle height)
- Tap 2 at 48.10%, 15.60% (center, near top)

Do the green circles appear at these locations? If not, the issue is elsewhere.

### Question 3: Is pan working?
Phone pan offset: x=-132, y=102
- X: Panned 132px LEFT
- Y: Panned 102px DOWN

Is the pan limiting working? Can you pan beyond these values?

---

## Possible Issues on Phone

### Issue 1: Different Floor Plan Image
If the phone is using a different floor plan than expected, all calculations change. The code will work correctly, but for the wrong image.

**Check:** What floor plan image is uploaded on the phone?

### Issue 2: Touch/Tap Coordinate Mapping
Phone touch events might not be mapping correctly to screen coordinates. Mobile devices handle touch differently than mouse events.

**Check:** Are the coordinates being captured correctly?

### Issue 3: Container Dimensions on Phone
The phone container (343×686) is much smaller than desktop (398×448). This affects centering and panning.

**Check:** Is the app responsive? Does the layout scale properly on phone?

### Issue 4: CSS Transform Rendering
Phone browsers might render CSS transforms differently. The pan offset might not be applied correctly.

**Check:** Does the image move when you drag?

---

## What You Should Test

### Test 1: Verify Floor Plan Image
```javascript
const img = document.getElementById('plan-img');
console.log('Phone Image:', {
  src: img.src,
  naturalWidth: img.naturalWidth,
  naturalHeight: img.naturalHeight,
  aspectRatio: img.naturalWidth / img.naturalHeight
});
```

**Expected:** Should match what you see in test data (3024×4032, ratio 0.75)

### Test 2: Tap Accuracy
1. Tap at **center** (50%, 50%) at **zoom 1.0**
2. Note where green circle appears
3. Is it at 50%, 50%? Or offset?

### Test 3: Pan Limits
1. Zoom to **150%**
2. Try to drag **past the left edge**
3. Does it stop? Or keep dragging?

### Test 4: Visual Dragging
1. Put your finger on the image
2. Drag it around
3. Is the movement smooth?
4. Does it feel responsive?

---

## Expected Behavior on Phone (Portrait 3:4)

### Pan Bounds at 150% Zoom
```
Container: 343×686
Display: 771.75×1029
Overflow X: 771.75 - 343 = 428.75px
Overflow Y: 1029 - 686 = 343px
Max pan X: 428.75 / 2 = 214.375px
Max pan Y: 343 / 2 = 171.5px
```

Your actual pan:
```
Pan X: -132 (within limits ✓)
Pan Y: 102 (within limits ✓)
```

**Pan is within bounds!**

---

## Critical Questions

### Q1: What's the issue you're experiencing?
- Green circle in wrong location?
- Dragging doesn't work?
- Zooming doesn't work?
- Can't place pins?
- Other?

### Q2: Does it work on desktop but not phone?
- If YES: Could be phone-specific (touch events, DPI, screen size)
- If NO: Systematic issue

### Q3: At which zoom level did it fail?
- 100%?
- 150%?
- All?

### Q4: When you dragged, what happened?
- Image moved smoothly?
- Jittery?
- Didn't move?
- Moved too much?

---

## Next Steps

1. **Clarify the issue** - What specifically is broken?
2. **Verify image dimensions** - Is it really 3:4 portrait?
3. **Test tap accuracy** - Place a pin at 50%, 50%
4. **Test pan limits** - Drag past edge and see if it stops
5. **Test zoom** - Does zoom work?
6. **Check responsive design** - Does layout scale properly?

---

## Summary

The **code is mathematically correct** for both:
- Desktop: 4:3 landscape (4032×3024)
- Phone: 3:4 portrait (3024×4032)

But **they're different images**! This suggests:
1. Different floor plans uploaded to each
2. Or a responsive image issue
3. Or the test was on different floors

Once you clarify **what's not working**, I can target the specific fix needed.

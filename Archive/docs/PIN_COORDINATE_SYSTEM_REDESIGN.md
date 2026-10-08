# Pin Coordinate System Redesign
## Fix for Zoom/Pan/Pin Movement Issues

**Date:** June 10, 2026  
**Priority:** CRITICAL  
**Status:** Implementation Plan

---

## The Core Problem

**Current System (BROKEN):**
1. User taps on screen
2. App converts tap to image coordinates
3. Stores pin in **current screen space**
4. When zoom changes, screen space changes
5. Pin position breaks! ❌

**Correct System (PROPOSED):**
1. User taps on screen
2. App converts tap to **image percentage (0-100%)**
3. Stores pin as **permanent image coordinates**
4. When zoom/pan changes, recalculate screen position
5. Pin always at same visual location ✅

---

## Three-Tier Coordinate System

### Tier 1: Image Space (SOURCE OF TRUTH)
```javascript
pin = {
  x: 45.5,    // 0-100% of image width
  y: 52.3,    // 0-100% of image height
  type: 'station'
}
```
**NEVER CHANGES.** This is the permanent location on the floor plan.

### Tier 2: Displayed Space (FOR CALCULATIONS)
```javascript
// Based on zoom + pan
displayedWidth = containerHeight * zoom * aspectRatio
displayedHeight = containerHeight * zoom

// Pin in displayed space
displayedX = (pin.x / 100) * displayedWidth
displayedY = (pin.y / 100) * displayedHeight
```
**INTERMEDIATE.** Used for calculations only.

### Tier 3: Screen Space (FOR RENDERING)
```javascript
// Apply pan offset to get final screen position
screenX = displayedX - panX + centering offsetX
screenY = displayedY - panY + centering offsetY

// Render at screen coordinates
pin.style.left = screenX + 'px'
pin.style.top = screenY + 'px'
```
**TEMPORARY.** Changes with zoom/pan, recalculated every frame.

---

## Implementation Steps

### Step 1: Capture Pin Coordinates (When Tapping)

```javascript
function handlePlanTap(e) {
  if (!pinMode) return;

  // 1. Get tap position in screen space
  const screenX = e.clientX;
  const screenY = e.clientY;

  // 2. Convert to container-relative
  const container = document.getElementById('plan-container');
  const containerRect = container.getBoundingClientRect();
  const containerX = screenX - containerRect.left;
  const containerY = screenY - containerRect.top;

  // 3. GET CACHED DIMENSIONS (CRITICAL!)
  const { displayedWidth, displayedHeight } = floorPlanDisplayState;
  const { containerWidth, containerHeight } = floorPlanDisplayState;
  
  // 4. Account for centering offset
  const centerOffsetX = (displayedWidth - containerWidth) / 2;
  const centerOffsetY = (displayedHeight - containerHeight) / 2;

  // 5. Account for pan offset
  const panX = floorPlanPanX;
  const panY = floorPlanPanY;

  // 6. Convert to image displayed space
  const displayedX = containerX + centerOffsetX + panX;
  const displayedY = containerY + centerOffsetY + panY;

  // 7. CONVERT TO IMAGE PERCENTAGE (SOURCE OF TRUTH!)
  const imagePercentX = (displayedX / displayedWidth) * 100;
  const imagePercentY = (displayedY / displayedHeight) * 100;

  // 8. Clamp to valid range
  const pinnedX = Math.max(2, Math.min(98, imagePercentX));
  const pinnedY = Math.max(2, Math.min(98, imagePercentY));

  // 9. STORE AS PERCENTAGE
  const pin = {
    x: pinnedX,        // ← THIS IS THE SOURCE OF TRUTH
    y: pinnedY,        // ← ALWAYS STORED AS PERCENTAGE
    type: pendingPinType,
    timestamp: Date.now()
  };

  // Show green circle at tap location (using STORED percentages)
  showGreenCircle(pinnedX, pinnedY);
}
```

### Step 2: Render Pins (Anytime Zoom/Pan Changes)

```javascript
function renderPins() {
  const stations = S.floors[currentFloor].stations || [];
  
  stations.forEach(pin => {
    // Pin stores: { x: 45.5, y: 52.3, ... }
    // These are IMAGE PERCENTAGES (0-100%)
    
    // 1. Get current display dimensions
    const { displayedWidth, displayedHeight } = floorPlanDisplayState;
    const { containerWidth, containerHeight } = floorPlanDisplayState;
    
    // 2. Calculate centering offset
    const centerOffsetX = (displayedWidth - containerWidth) / 2;
    const centerOffsetY = (displayedHeight - containerHeight) / 2;
    
    // 3. Convert from image percentage to displayed space
    const displayedX = (pin.x / 100) * displayedWidth;
    const displayedY = (pin.y / 100) * displayedHeight;
    
    // 4. Apply pan offset to get final screen position
    const screenX = displayedX - centerOffsetX - floorPlanPanX;
    const screenY = displayedY - centerOffsetY - floorPlanPanY;
    
    // 5. Render pin at screen position
    const pinElement = document.getElementById(`pin-${pin.id}`);
    pinElement.style.left = screenX + 'px';
    pinElement.style.top = screenY + 'px';
    
    // 6. Log for debugging
    console.log('[RENDER PIN]', {
      stored: { x: pin.x, y: pin.y },           // ← IMAGE PERCENTAGE
      displayed: { x: displayedX, y: displayedY },  // ← DISPLAY SPACE
      screen: { x: screenX, y: screenY },       // ← SCREEN POSITION
      zoom: floorPlanZoom,
      pan: { x: floorPlanPanX, y: floorPlanPanY }
    });
  });
}

// Call this whenever zoom or pan changes
function onZoomChange(newZoom) {
  floorPlanZoom = newZoom;
  enforcePanBounds();
  renderPins();  // ← REDRAW ALL PINS
}

function onPanChange(deltaX, deltaY) {
  floorPlanPanX += deltaX;
  floorPlanPanY += deltaY;
  enforcePanBounds();
  renderPins();  // ← REDRAW ALL PINS
}
```

### Step 3: Green Circle (During Placement)

```javascript
function showGreenCircle(imagePercentX, imagePercentY) {
  // Remove old circle
  const oldCircle = document.getElementById('position-indicator');
  if (oldCircle) oldCircle.remove();

  // Calculate screen position based on CURRENT zoom/pan
  const { displayedWidth, displayedHeight } = floorPlanDisplayState;
  const { containerWidth, containerHeight } = floorPlanDisplayState;
  
  const centerOffsetX = (displayedWidth - containerWidth) / 2;
  const centerOffsetY = (displayedHeight - containerHeight) / 2;
  
  const displayedX = (imagePercentX / 100) * displayedWidth;
  const displayedY = (imagePercentY / 100) * displayedHeight;
  
  const screenX = displayedX - centerOffsetX - floorPlanPanX;
  const screenY = displayedY - centerOffsetY - floorPlanPanY;

  // Create green circle
  const circle = document.createElement('div');
  circle.id = 'position-indicator';
  circle.style.cssText = `
    position: absolute;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: rgba(52, 168, 83, 0.3);
    border: 3px solid rgb(52, 168, 83);
    left: ${screenX}px;
    top: ${screenY}px;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 1000;
  `;
  
  document.getElementById('plan-container').appendChild(circle);
  
  console.log('[GREEN CIRCLE]', {
    imagePercent: { x: imagePercentX, y: imagePercentY },
    screenPos: { x: screenX, y: screenY },
    zoom: floorPlanZoom
  });
}
```

### Step 4: Handle Zoom Changes

```javascript
function setZoomLevel(newZoom) {
  const oldZoom = floorPlanZoom;
  floorPlanZoom = newZoom;

  // Scale pan proportionally
  const zoomRatio = newZoom / oldZoom;
  floorPlanPanX *= zoomRatio;
  floorPlanPanY *= zoomRatio;

  // Enforce bounds for new zoom level
  enforcePanBounds();

  // CRITICAL: Recalculate display dimensions for new zoom
  updateDisplayDimensions();

  // CRITICAL: Redraw all pins at new positions
  renderPins();

  console.log('[ZOOM CHANGE]', {
    from: oldZoom,
    to: newZoom,
    panAfter: { x: floorPlanPanX, y: floorPlanPanY }
  });
}
```

### Step 5: Handle Pan Changes

```javascript
function handlePanGesture(deltaX, deltaY) {
  floorPlanPanX += deltaX;
  floorPlanPanY += deltaY;

  // Clamp to bounds
  enforcePanBounds();

  // CRITICAL: Redraw pins at new pan position
  renderPins();

  console.log('[PAN GESTURE]', {
    delta: { x: deltaX, y: deltaY },
    panAfter: { x: floorPlanPanX, y: floorPlanPanY }
  });
}
```

---

## Critical Insights

### 1. NEVER Store Screen Coordinates
```javascript
// ❌ WRONG - screen coordinates change with zoom/pan
pin.screenX = 245;
pin.screenY = 128;

// ✅ RIGHT - image percentages are permanent
pin.imagePercentX = 45.5;
pin.imagePercentY = 52.3;
```

### 2. Always Recalculate on Zoom/Pan Change
```javascript
// ❌ WRONG - try to update position
pin.style.left = oldScreenX + panDelta;

// ✅ RIGHT - recalculate from image percentage
const newScreenX = (pin.imagePercentX / 100) * displayedWidth - centerOffset - pan;
pin.style.left = newScreenX + 'px';
```

### 3. Display Dimensions Must Be Cached
```javascript
// ❌ WRONG - calculate on each render
const displayedWidth = ... calculate ...

// ✅ RIGHT - use cached value
const { displayedWidth } = floorPlanDisplayState;
```

### 4. Update Cache When Zoom Changes
```javascript
// ❌ WRONG - stale cache
renderPins();  // Uses old displayedWidth!

// ✅ RIGHT - update cache first
updateDisplayDimensions();  // Calculate new dimensions
renderPins();  // Use fresh cache
```

---

## Data Structure

### Pin Storage (IMAGE SPACE)
```javascript
S.floors[floorIndex].stations = [
  {
    id: 'st-001',
    x: 45.50,        // ← IMAGE PERCENTAGE (0-100)
    y: 52.30,        // ← IMAGE PERCENTAGE (0-100)
    type: 'station',
    name: 'Front Desk',
    timestamp: 1781125269728
  },
  {
    id: 'st-002',
    x: 68.55,        // ← IMAGE PERCENTAGE
    y: 44.61,        // ← IMAGE PERCENTAGE
    type: 'station',
    name: 'IT Room'
  }
];
```

**These percentages NEVER CHANGE.** They're permanent locations on the floor plan.

---

## Testing Checklist

### ✓ At Zoom 100%
- [ ] Tap pin location
- [ ] Green circle appears at tap
- [ ] Create pin
- [ ] Pin stored correctly
- [ ] Pin visible on map

### ✓ At Zoom 150%
- [ ] Green circle appears at tap (not offset left)
- [ ] Green circle visible (not lost)
- [ ] Create pin
- [ ] When zoom back to 100%, pin at same visual location
- [ ] Pan around, pin stays in place

### ✓ At Zoom 175%
- [ ] Same tests as 150%
- [ ] Pan limits work
- [ ] Multiple pins render correctly
- [ ] No pins moving unexpectedly

### ✓ Pan + Zoom Combination
- [ ] Pan at 100%, zoom to 150%
- [ ] Pan at 150%, zoom to 175%
- [ ] Zoom back down
- [ ] Pins stay at correct positions
- [ ] No accumulation of errors

---

## Key Files to Modify

1. **handlePlanTap()** - Change to store IMAGE PERCENTAGE
2. **renderPins()** - Change to render from IMAGE PERCENTAGE
3. **showGreenCircle()** - Use IMAGE PERCENTAGE for positioning
4. **setZoomLevel()** - Call renderPins() after zoom
5. **handlePanGesture()** - Call renderPins() after pan
6. **updateDisplayDimensions()** - Call before renderPins()

---

## Summary

**The Fix:** Store pins as **image percentages (0-100%)**, not screen coordinates.

**On Every Zoom/Pan Change:** 
1. Update display dimensions
2. Recalculate all pin screen positions
3. Redraw pins

**Result:** Pins stay at the same visual location regardless of zoom/pan! ✅

---

## Implementation Difficulty

**Complexity:** Medium (5-6 functions to modify)  
**Risk:** Low (changes are isolated to pin handling)  
**Testing:** Comprehensive (multiple zoom/pan scenarios)  
**Expected Outcome:** Pins remain stable across all zoom/pan combinations

This is the correct architectural approach for a zoom/pan system with fixed objects.

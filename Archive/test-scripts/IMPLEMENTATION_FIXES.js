// ═══════════════════════════════════════════════════════════════════════════════
// PIN COORDINATE SYSTEM REDESIGN - IMPLEMENTATION CODE
// Replace/update functions in Spare-it_site_visit_form_UPDATED.html
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * FIX #1: showGreenCircle - Position using image percentages
 * Replace the existing showGreenCircle function with this version
 */
function showGreenCircle(imagePercentX, imagePercentY) {
  console.log('[GREEN CIRCLE] Creating circle at image percent:', {x: imagePercentX, y: imagePercentY});

  // Remove old circle
  const oldCircle = document.getElementById('position-indicator');
  if (oldCircle) oldCircle.remove();

  // Get cached display dimensions
  const { displayedWidth, displayedHeight, containerWidth, containerHeight } = floorPlanDisplayState;

  // Calculate centering offset
  const centerOffsetX = (displayedWidth - containerWidth) / 2;
  const centerOffsetY = (displayedHeight - containerHeight) / 2;

  // Convert from image percentage to displayed space
  const displayedX = (imagePercentX / 100) * displayedWidth;
  const displayedY = (imagePercentY / 100) * displayedHeight;

  // Apply pan and centering to get final screen position
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
    background: rgba(52, 168, 83, 0.5);
    border: 3px solid rgb(52, 168, 83);
    left: ${screenX}px;
    top: ${screenY}px;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 1000;
    box-shadow: rgba(52, 168, 83, 0.6) 0px 0px 12px;
  `;

  const container = document.getElementById('plan-container');
  if (container) {
    container.appendChild(circle);
    console.log('[GREEN CIRCLE] Circle positioned at:', {
      imagePercent: {x: imagePercentX.toFixed(2), y: imagePercentY.toFixed(2)},
      displayed: {x: displayedX.toFixed(1), y: displayedY.toFixed(1)},
      screen: {x: screenX.toFixed(1), y: screenY.toFixed(1)},
      zoom: floorPlanZoom,
      pan: {x: floorPlanPanX.toFixed(1), y: floorPlanPanY.toFixed(1)}
    });
  }
}

/**
 * FIX #2: renderPins - Recalculate all pin screen positions
 * This function should be called whenever zoom or pan changes
 */
function renderPins() {
  console.log('[RENDER PINS] Starting render at zoom', floorPlanZoom.toFixed(2));

  if (!S.floors || !S.floors[currentFloor]) {
    console.log('[RENDER PINS] No floor data, skipping render');
    return;
  }

  const floor = S.floors[currentFloor];
  const stations = floor.stations || [];
  const gateways = floor.gateways || [];
  const displays = floor.displays || [];

  // Get cached display dimensions
  const { displayedWidth, displayedHeight, containerWidth, containerHeight } = floorPlanDisplayState;

  // Calculate centering offset
  const centerOffsetX = (displayedWidth - containerWidth) / 2;
  const centerOffsetY = (displayedHeight - containerHeight) / 2;

  console.log('[RENDER PINS] Display state:', {
    displayedWidth: displayedWidth.toFixed(1),
    displayedHeight: displayedHeight.toFixed(1),
    centerOffset: {x: centerOffsetX.toFixed(1), y: centerOffsetY.toFixed(1)},
    pan: {x: floorPlanPanX.toFixed(1), y: floorPlanPanY.toFixed(1)},
    zoom: floorPlanZoom.toFixed(2)
  });

  // Render all objects
  const allObjects = [
    ...stations.map(s => ({...s, type: 'station', element: document.getElementById(`pin-st-${s.id}`)})),
    ...gateways.map(g => ({...g, type: 'gateway', element: document.getElementById(`pin-gw-${g.id}`)})),
    ...displays.map(d => ({...d, type: 'display', element: document.getElementById(`pin-ds-${d.id}`)}))
  ];

  allObjects.forEach(pin => {
    if (!pin.element) {
      console.log(`[RENDER PINS] Element not found for ${pin.type}-${pin.id}`);
      return;
    }

    // Get image percentage coordinates (stored as SOURCE OF TRUTH)
    const imagePercentX = pin.x;
    const imagePercentY = pin.y;

    // Convert from image percentage to displayed space
    const displayedX = (imagePercentX / 100) * displayedWidth;
    const displayedY = (imagePercentY / 100) * displayedHeight;

    // Apply pan and centering to get final screen position
    const screenX = displayedX - centerOffsetX - floorPlanPanX;
    const screenY = displayedY - centerOffsetY - floorPlanPanY;

    // Update pin position in DOM
    pin.element.style.left = screenX + 'px';
    pin.element.style.top = screenY + 'px';

    console.log(`[RENDER PINS] ${pin.type.toUpperCase()} ${pin.id}:`, {
      stored: {x: imagePercentX.toFixed(2), y: imagePercentY.toFixed(2)},
      displayed: {x: displayedX.toFixed(1), y: displayedY.toFixed(1)},
      screen: {x: screenX.toFixed(1), y: screenY.toFixed(1)}
    });
  });

  console.log('[RENDER PINS] Render complete');
}

/**
 * FIX #3: Update setZoomLevel to recalculate display dimensions and render pins
 * This ensures all pins stay in correct visual positions after zoom
 */
// Add this to the existing setZoomLevel function BEFORE the existing code
function setZoomLevelFixed(level) {
  // Set zoom to specific preset level (100%, 125%, 150%, 175%)
  const oldZoom = floorPlanZoom;
  const newZoom = Math.max(1, Math.min(1.75, level));

  if (newZoom === oldZoom) return; // No change

  console.log('[ZOOM] Changing zoom level:', {from: oldZoom, to: newZoom, panBefore: {x: floorPlanPanX.toFixed(1), y: floorPlanPanY.toFixed(1)}});

  // Scale pan proportionally to maintain view center when zoom changes
  if (oldZoom > 0) {
    const zoomRatio = newZoom / oldZoom;
    floorPlanPanX *= zoomRatio;
    floorPlanPanY *= zoomRatio;
  }

  // ── CRITICAL: Apply new zoom ──
  floorPlanZoom = newZoom;

  if (newZoom === 1) {
    // At 100% zoom, reset pan
    floorPlanPanX = 0;
    floorPlanPanY = 0;
  } else {
    // At other zooms, enforce bounds
    enforcePanBounds();
  }

  // ── CRITICAL: Update display dimensions for new zoom ──
  console.log('[ZOOM] Updating display dimensions for new zoom level');
  updateDisplayDimensions();

  // ── CRITICAL: Redraw all pins at new positions ──
  console.log('[ZOOM] Rendering pins at new positions');
  renderPins();

  console.log('[ZOOM] Zoom level set:', {zoom: floorPlanZoom, panAfter: {x: floorPlanPanX.toFixed(1), y: floorPlanPanY.toFixed(1)}});
}

/**
 * FIX #4: Update pan handler to recalculate pin positions
 * This ensures pins stay in correct visual positions when panning
 * Find the pan handler in the Hammer.js setup and add this call
 */
// In the pan event handler, add this line:
// renderPins();  // ← ADD THIS LINE after pan is updated and bounds are enforced

/**
 * FIX #5: Ensure handlePlanTap stores image percentages
 * The current implementation already does this (lines 3949-3950)
 * But make sure showGreenCircle is called AFTER storing the percentage
 */
// In handlePlanTap, after storing pendingPinX and pendingPinY:
// showGreenCircle(pendingPinX, pendingPinY);  // ← USE THE NEW FUNCTION

/**
 * FIX #6: Add validation to ensure display dimensions are fresh
 */
function validateDisplayDimensions() {
  const now = Date.now();
  const cacheAge = now - floorPlanDisplayState.lastUpdated;

  // If cache is older than 500ms or not set, update it
  if (cacheAge > 500 || !floorPlanDisplayState.displayedWidth) {
    console.log('[VALIDATE] Display dimensions are stale, updating');
    updateDisplayDimensions();
    return true;
  }

  console.log('[VALIDATE] Display dimensions are fresh (age:', cacheAge, 'ms)');
  return false;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUMMARY OF CHANGES
// ═══════════════════════════════════════════════════════════════════════════════

/*
CHANGE #1: showGreenCircle function
  - BEFORE: Used screen coordinates, didn't account for pan properly
  - AFTER: Uses image percentages, calculates screen position dynamically
  - IMPACT: Green circle appears at correct location

CHANGE #2: renderPins function (NEW)
  - BEFORE: Pins only positioned when created, not updated on zoom/pan
  - AFTER: All pins recalculated whenever zoom/pan changes
  - IMPACT: Pins stay in correct visual position

CHANGE #3: setZoomLevel function
  - BEFORE: Didn't redraw pins after zoom change
  - AFTER: Calls renderPins() after updating zoom
  - IMPACT: Pins appear at correct position after zoom

CHANGE #4: Pan handler
  - BEFORE: Didn't redraw pins after pan
  - AFTER: Calls renderPins() after pan offset updated
  - IMPACT: Pins stay visible and correctly positioned while panning

CHANGE #5: handlePlanTap function
  - BEFORE: Green circle positioned incorrectly
  - AFTER: Uses new showGreenCircle function
  - IMPACT: Green circle at tap location

CHANGE #6: Display dimension validation
  - BEFORE: Cache might become stale
  - AFTER: Validate cache age before rendering
  - IMPACT: Consistent accurate calculations
*/

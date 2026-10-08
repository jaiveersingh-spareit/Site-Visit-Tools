// ═══════════════════════════════════════════════════════════════════════════════
// AUTOMATED VALIDATION TEST SUITE
// Tests the PIN COORDINATE SYSTEM REDESIGN implementation
// ═══════════════════════════════════════════════════════════════════════════════

console.clear();
console.log('\n' + '═'.repeat(90));
console.log('AUTOMATED VALIDATION TEST SUITE - PIN COORDINATE SYSTEM REDESIGN');
console.log('═'.repeat(90) + '\n');

const testResults = {
  timestamp: new Date().toISOString(),
  tests: [],
  summary: {total: 0, passed: 0, failed: 0},
  issues: []
};

function recordTest(name, passed, details = {}) {
  testResults.tests.push({name, passed, details});
  testResults.summary.total++;
  passed ? testResults.summary.passed++ : testResults.summary.failed++;

  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${name}`);
  if (Object.keys(details).length > 0) {
    console.log('   ', JSON.stringify(details));
  }
}

function recordIssue(severity, description, details = {}) {
  testResults.issues.push({severity, description, details, timestamp: new Date().toISOString()});
  console.log(`⚠️  [${severity}] ${description}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST GROUP 1: FUNCTION EXISTENCE
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n█ TEST GROUP 1: FUNCTION EXISTENCE\n');

recordTest(
  'showTapHighlight function exists',
  typeof showTapHighlight === 'function',
  {type: typeof showTapHighlight}
);

recordTest(
  'renderPins function exists',
  typeof renderPins === 'function',
  {type: typeof renderPins}
);

recordTest(
  'validateDisplayDimensions function exists',
  typeof validateDisplayDimensions === 'function',
  {type: typeof validateDisplayDimensions}
);

recordTest(
  'setZoomLevel function exists',
  typeof setZoomLevel === 'function',
  {type: typeof setZoomLevel}
);

recordTest(
  'enforcePanBounds function exists',
  typeof enforcePanBounds === 'function',
  {type: typeof enforcePanBounds}
);

// ─────────────────────────────────────────────────────────────────────────────
// TEST GROUP 2: DISPLAY DIMENSIONS STATE
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n█ TEST GROUP 2: DISPLAY DIMENSIONS STATE\n');

recordTest(
  'floorPlanDisplayState exists',
  typeof floorPlanDisplayState === 'object',
  {properties: Object.keys(floorPlanDisplayState || {})}
);

recordTest(
  'displayedWidth is defined',
  floorPlanDisplayState && typeof floorPlanDisplayState.displayedWidth === 'number',
  {value: floorPlanDisplayState?.displayedWidth}
);

recordTest(
  'displayedHeight is defined',
  floorPlanDisplayState && typeof floorPlanDisplayState.displayedHeight === 'number',
  {value: floorPlanDisplayState?.displayedHeight}
);

recordTest(
  'containerWidth is defined',
  floorPlanDisplayState && typeof floorPlanDisplayState.containerWidth === 'number',
  {value: floorPlanDisplayState?.containerWidth}
);

recordTest(
  'containerHeight is defined',
  floorPlanDisplayState && typeof floorPlanDisplayState.containerHeight === 'number',
  {value: floorPlanDisplayState?.containerHeight}
);

// ─────────────────────────────────────────────────────────────────────────────
// TEST GROUP 3: PAN/ZOOM STATE
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n█ TEST GROUP 3: PAN/ZOOM STATE\n');

recordTest(
  'floorPlanZoom is a number',
  typeof floorPlanZoom === 'number',
  {value: floorPlanZoom}
);

recordTest(
  'floorPlanPanX is a number',
  typeof floorPlanPanX === 'number',
  {value: floorPlanPanX}
);

recordTest(
  'floorPlanPanY is a number',
  typeof floorPlanPanY === 'number',
  {value: floorPlanPanY}
);

// ─────────────────────────────────────────────────────────────────────────────
// TEST GROUP 4: PIN DATA STRUCTURE
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n█ TEST GROUP 4: PIN DATA STRUCTURE\n');

const hasData = S && S.floors && S.floors[currentFloor];
recordTest(
  'Floor data exists',
  hasData,
  {floor: currentFloor, hasFloors: !!S?.floors}
);

if (hasData) {
  const floor = S.floors[currentFloor];
  const stations = floor.stations || [];
  const gateways = floor.gateways || [];
  const displays = floor.displays || [];

  recordTest(
    'Stations array exists',
    Array.isArray(stations),
    {count: stations.length}
  );

  recordTest(
    'Gateways array exists',
    Array.isArray(gateways),
    {count: gateways.length}
  );

  recordTest(
    'Displays array exists',
    Array.isArray(displays),
    {count: displays.length}
  );

  // Check pin data structure
  const allPins = [...stations, ...gateways, ...displays];
  if (allPins.length > 0) {
    const firstPin = allPins[0];
    const hasX = typeof firstPin.x === 'number';
    const hasY = typeof firstPin.y === 'number';

    recordTest(
      'Pin x coordinate is number (image percentage)',
      hasX,
      {value: firstPin.x, type: typeof firstPin.x}
    );

    recordTest(
      'Pin y coordinate is number (image percentage)',
      hasY,
      {value: firstPin.y, type: typeof firstPin.y}
    );

    if (hasX && hasY) {
      const xInRange = firstPin.x >= 0 && firstPin.x <= 100;
      const yInRange = firstPin.y >= 0 && firstPin.y <= 100;

      recordTest(
        'Pin x is within image percentage range (0-100)',
        xInRange,
        {value: firstPin.x}
      );

      recordTest(
        'Pin y is within image percentage range (0-100)',
        yInRange,
        {value: firstPin.y}
      );

      if (!xInRange || !yInRange) {
        recordIssue('CRITICAL', 'Pin coordinates out of valid range', {x: firstPin.x, y: firstPin.y});
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST GROUP 5: GREEN CIRCLE POSITIONING
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n█ TEST GROUP 5: GREEN CIRCLE POSITIONING\n');

// Test green circle positioning at different zoom levels
const zoomLevels = [1.0, 1.25, 1.5, 1.75];
const testImagePercentX = 45.5;
const testImagePercentY = 52.3;

zoomLevels.forEach(zoom => {
  // Update zoom level
  const oldZoom = floorPlanZoom;
  floorPlanZoom = zoom;
  updateDisplayDimensions();

  // Test showTapHighlight function
  console.log(`   Testing at zoom ${(zoom * 100).toFixed(0)}%`);

  try {
    // Call showTapHighlight
    showTapHighlight(testImagePercentX, testImagePercentY);

    // Check if highlight element was created
    const highlight = document.querySelector('.tap-highlight');
    const exists = !!highlight;

    recordTest(
      `Green circle visible at zoom ${(zoom * 100).toFixed(0)}%`,
      exists,
      {zoom, imagePercent: {x: testImagePercentX, y: testImagePercentY}}
    );

    if (exists) {
      const left = highlight.style.left;
      const top = highlight.style.top;

      // Verify it's in pixel units, not percentage
      const usesPixels = left.endsWith('px') && top.endsWith('px');
      recordTest(
        `Green circle uses pixel positioning at zoom ${(zoom * 100).toFixed(0)}%`,
        usesPixels,
        {left, top}
      );

      if (!usesPixels) {
        recordIssue('CRITICAL', `Green circle not using pixel positioning at zoom ${zoom}x`, {left, top});
      }
    } else {
      recordIssue('CRITICAL', `Green circle not created at zoom ${zoom}x`);
    }

    // Clean up
    highlight?.remove();

  } catch (e) {
    recordTest(
      `Green circle at zoom ${(zoom * 100).toFixed(0)}% (exception)`,
      false,
      {error: e.message}
    );
    recordIssue('ERROR', `Exception during green circle test at zoom ${zoom}x`, {error: e.message});
  }

  floorPlanZoom = oldZoom;
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST GROUP 6: RENDER PINS FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n█ TEST GROUP 6: RENDER PINS FUNCTION\n');

try {
  // Call renderPins
  console.log('   Calling renderPins()...');
  renderPins();

  recordTest(
    'renderPins() executes without error',
    true,
    {}
  );
} catch (e) {
  recordTest(
    'renderPins() executes without error',
    false,
    {error: e.message}
  );
  recordIssue('ERROR', 'renderPins() threw exception', {error: e.message});
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST GROUP 7: ZOOM LEVEL VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n█ TEST GROUP 7: ZOOM LEVEL VALIDATION\n');

const validZooms = [1.0, 1.25, 1.5, 1.75];
const isValidZoom = validZooms.includes(floorPlanZoom);

recordTest(
  'Current zoom level is valid (1.0, 1.25, 1.5, or 1.75)',
  isValidZoom,
  {current: floorPlanZoom, valid: validZooms}
);

// ─────────────────────────────────────────────────────────────────────────────
// TEST GROUP 8: PAN BOUNDS VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n█ TEST GROUP 8: PAN BOUNDS VALIDATION\n');

const { displayedWidth, displayedHeight, containerWidth, containerHeight } = floorPlanDisplayState;
const overflowX = displayedWidth - containerWidth;
const overflowY = displayedHeight - containerHeight;
const maxPanX = Math.abs(overflowX) / 2;
const maxPanY = Math.abs(overflowY) / 2;

const panXValid = Math.abs(floorPlanPanX) <= maxPanX + 1; // +1 for floating point tolerance
const panYValid = Math.abs(floorPlanPanY) <= maxPanY + 1;

recordTest(
  'Pan X within bounds',
  panXValid,
  {panX: floorPlanPanX.toFixed(1), maxPanX: maxPanX.toFixed(1)}
);

recordTest(
  'Pan Y within bounds',
  panYValid,
  {panY: floorPlanPanY.toFixed(1), maxPanY: maxPanY.toFixed(1)}
);

if (!panXValid || !panYValid) {
  recordIssue('WARNING', 'Pan offset outside expected bounds', {
    panX: floorPlanPanX,
    maxPanX,
    panY: floorPlanPanY,
    maxPanY
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// FINAL SUMMARY
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n' + '═'.repeat(90));
console.log('TEST SUMMARY');
console.log('═'.repeat(90) + '\n');

console.log(`📊 Results:`);
console.log(`   Total: ${testResults.summary.total}`);
console.log(`   ✅ Passed: ${testResults.summary.passed}`);
console.log(`   ❌ Failed: ${testResults.summary.failed}`);
console.log(`   ⚠️  Issues: ${testResults.issues.length}`);

if (testResults.summary.failed === 0) {
  console.log(`\n✅ ALL TESTS PASSED!\n`);
} else {
  console.log(`\n⚠️  ${testResults.summary.failed} TEST(S) FAILED\n`);
}

if (testResults.issues.length > 0) {
  console.log(`Issues Found:\n`);
  testResults.issues.forEach(issue => {
    console.log(`   [${issue.severity}] ${issue.description}`);
  });
  console.log();
}

console.log('═'.repeat(90) + '\n');

testResults;

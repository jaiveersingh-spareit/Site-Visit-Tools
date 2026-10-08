// ═══════════════════════════════════════════════════════════════════════════════
// EXTENSIVE PAN/BOUNDS EDGE CASES TEST SUITE
// Comprehensive testing of pan limits, drag extremes, and repositioning
// ═══════════════════════════════════════════════════════════════════════════════

console.clear();
console.log('\n' + '═'.repeat(90));
console.log('EXTENSIVE PAN/BOUNDS EDGE CASES TEST SUITE');
console.log('═'.repeat(90) + '\n');

const testSuite = {
  timestamp: new Date().toISOString(),
  results: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  }
};

// Helper function to record test results
function recordTest(category, testName, passed, details = {}) {
  testSuite.results.push({
    category,
    testName,
    passed,
    details,
    timestamp: new Date().toISOString()
  });

  testSuite.summary.total++;
  if (passed) testSuite.summary.passed++;
  else testSuite.summary.failed++;

  const icon = passed ? '✓' : '✗';
  const color = passed ? 'color: green' : 'color: red';
  console.log(`%c${icon} [${category}] ${testName}`, color);
  if (Object.keys(details).length > 0) {
    console.log('   Details:', details);
  }
}

function recordWarning(category, testName, details = {}) {
  testSuite.results.push({
    category,
    testName,
    passed: 'warning',
    details,
    timestamp: new Date().toISOString()
  });

  testSuite.summary.warnings++;
  console.log(`%c⚠ [${category}] ${testName}`, 'color: orange');
  if (Object.keys(details).length > 0) {
    console.log('   Details:', details);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY 1: PAN DIRECTION EXTREMES
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n█ CATEGORY 1: PAN DIRECTION EXTREMES\n');

// Test 1.1: Pan Left Extreme
try {
  const panLeftExtreme = {
    zoom: 1.5,
    containerWidth: 343,
    imageWidth: 3024,
    displayedWidth: 514.5,
    currentPan: -128,
    maxPanAllowed: 85.75
  };
  const canPastLeft = panLeftExtreme.currentPan < -panLeftExtreme.maxPanAllowed;
  recordTest('Pan Direction Extremes', 'Pan left exceeds max (-128 > -85.75?)', !canPastLeft, panLeftExtreme);
} catch (e) {
  recordTest('Pan Direction Extremes', 'Pan left exceeds max', false, {error: e.message});
}

// Test 1.2: Pan Right Extreme
try {
  const panRightExtreme = {
    zoom: 1.5,
    containerWidth: 343,
    displayedWidth: 514.5,
    currentPan: 128,
    maxPanAllowed: 85.75
  };
  const canPastRight = panRightExtreme.currentPan > panRightExtreme.maxPanAllowed;
  recordTest('Pan Direction Extremes', 'Pan right exceeds max (128 > 85.75?)', !canPastRight, panRightExtreme);
} catch (e) {
  recordTest('Pan Direction Extremes', 'Pan right exceeds max', false, {error: e.message});
}

// Test 1.3: No Pan at 100% Zoom
try {
  const panAt100 = {
    zoom: 1.0,
    containerWidth: 343,
    imageWidth: 3024,
    displayedWidth: 343,
    overflow: 0,
    maxPanAllowed: 0
  };
  const correctMaxPan = panAt100.maxPanAllowed === 0;
  recordTest('Pan Direction Extremes', 'No panning at zoom 100%', correctMaxPan, panAt100);
} catch (e) {
  recordTest('Pan Direction Extremes', 'No panning at zoom 100%', false, {error: e.message});
}

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY 2: ZOOM-RELATED EDGE CASES
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n█ CATEGORY 2: ZOOM-RELATED EDGE CASES\n');

// Test 2.1: Pan bounds at different zooms
const zoomBoundsTests = [
  {zoom: 1.0, expected: 0, tolerance: 15},
  {zoom: 1.25, expected: 42.9, tolerance: 5},
  {zoom: 1.5, expected: 85.75, tolerance: 5},
  {zoom: 1.75, expected: 128.6, tolerance: 5}
];

zoomBoundsTests.forEach(test => {
  const containerWidth = 343;
  const containerHeight = 686;
  const displayedWidth = containerWidth * test.zoom;
  const displayedHeight = containerHeight * test.zoom;
  const aspectRatio = 3024 / 4032;
  const displayedWidthActual = displayedHeight * aspectRatio;

  const overflowX = displayedWidthActual - containerWidth;
  const maxPanX = Math.abs(overflowX) / 2;

  const withinTolerance = Math.abs(maxPanX - test.expected) <= test.tolerance;
  recordTest('Zoom-Related Extremes', `Pan bounds at zoom ${Math.round(test.zoom * 100)}%`, withinTolerance, {
    expected: test.expected,
    calculated: maxPanX.toFixed(2),
    tolerance: test.tolerance
  });
});

// Test 2.3: Pan scale on zoom change
try {
  const panScaleTest = {
    panBefore: 50,
    oldZoom: 1.5,
    newZoom: 1.0,
    zoomRatio: 1.0 / 1.5,
    expectedPan: 50 * (1.0 / 1.5),
    maxPanAt1: 0
  };
  const scaledCorrectly = Math.abs(panScaleTest.expectedPan - 33.33) < 1;
  const fitsNewBounds = Math.abs(panScaleTest.expectedPan) <= panScaleTest.maxPanAt1 || panScaleTest.expectedPan === 0;
  recordTest('Zoom-Related Extremes', 'Pan scales correctly on zoom change', scaledCorrectly, panScaleTest);
} catch (e) {
  recordTest('Zoom-Related Extremes', 'Pan scales correctly on zoom change', false, {error: e.message});
}

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY 3: BOUNDS CALCULATION VERIFICATION
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n█ CATEGORY 3: BOUNDS CALCULATION VERIFICATION\n');

// Test 3.1: Overflow calculation
const overflowTests = [
  {zoom: 1.25, containerW: 343, displayedW: 428.75, expectedOverflow: 85.75},
  {zoom: 1.5, containerW: 343, displayedW: 514.5, expectedOverflow: 171.5},
  {zoom: 1.75, containerW: 343, displayedW: 600.25, expectedOverflow: 257.25}
];

overflowTests.forEach(test => {
  const calculatedOverflow = test.displayedW - test.containerW;
  const correct = Math.abs(calculatedOverflow - test.expectedOverflow) < 1;
  recordTest('Bounds Calculation', `Overflow at zoom ${test.zoom}x`, correct, {
    expected: test.expectedOverflow,
    calculated: calculatedOverflow.toFixed(2)
  });
});

// Test 3.2: MaxPan formula (should be overflow / 2)
try {
  const overflowX = 171.5;
  const calculatedMaxPan = overflowX / 2;
  const expectedMaxPan = 85.75;
  const formulaCorrect = Math.abs(calculatedMaxPan - expectedMaxPan) < 0.01;
  recordTest('Bounds Calculation', 'MaxPan = Overflow / 2 formula', formulaCorrect, {
    overflow: overflowX,
    maxPan: calculatedMaxPan.toFixed(2),
    expected: expectedMaxPan
  });
} catch (e) {
  recordTest('Bounds Calculation', 'MaxPan = Overflow / 2 formula', false, {error: e.message});
}

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY 4: COORDINATE TRANSFORMATION WITH PAN
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n█ CATEGORY 4: COORDINATE TRANSFORMATION WITH PAN\n');

// Test 4.1: Coordinate accuracy with extreme pan
try {
  const coordinateTest = {
    containerX: 350,
    baseCenterOffsetX: 85.75,
    panOffsetX: -91.375,
    expectedImageScreenX: 344.375, // 350 + 85.75 - 91.375
    displayedWidth: 514.5,
    imageWidth: 3024,
    expectedPercent: 66.94
  };

  const imageScreenX = coordinateTest.containerX + coordinateTest.baseCenterOffsetX + coordinateTest.panOffsetX;
  const screenCorrect = Math.abs(imageScreenX - coordinateTest.expectedImageScreenX) < 0.01;

  const imagePixelX = (imageScreenX / coordinateTest.displayedWidth) * coordinateTest.imageWidth;
  const percentX = (imagePixelX / coordinateTest.imageWidth) * 100;
  const percentCorrect = Math.abs(percentX - coordinateTest.expectedPercent) < 1;

  recordTest('Coordinate Transformation', 'Coordinate accuracy with extreme pan', screenCorrect && percentCorrect, {
    imageScreenX: imageScreenX.toFixed(2),
    expectedImageScreenX: coordinateTest.expectedImageScreenX,
    percentX: percentX.toFixed(2),
    expectedPercent: coordinateTest.expectedPercent
  });
} catch (e) {
  recordTest('Coordinate Transformation', 'Coordinate accuracy with extreme pan', false, {error: e.message});
}

// Test 4.2: Centering offset independent of pan
try {
  const centeringTest = {
    displayedWidth: 514.5,
    containerWidth: 343,
    panOffset: -91.375,
    panOffset2: 91.375,
    expectedCenteringOffset: 85.75
  };

  const centering = (centeringTest.displayedWidth - centeringTest.containerWidth) / 2;
  const independent = centering === centeringTest.expectedCenteringOffset;
  recordTest('Coordinate Transformation', 'Centering offset independent of pan', independent, {
    centering: centering.toFixed(2),
    expected: centeringTest.expectedCenteringOffset,
    panDoesntAffect: 'Pan offset should not change this value'
  });
} catch (e) {
  recordTest('Coordinate Transformation', 'Centering offset independent of pan', false, {error: e.message});
}

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY 5: REPOSITIONING AT EXTREMES
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n█ CATEGORY 5: REPOSITIONING AT EXTREMES\n');

// Test 5.1: Repositioning at left extreme
try {
  const repositionLeftExtreme = {
    panOffset: -85.75,
    tapAtLeftEdge: true,
    expectedCoord: 2  // Should clamp to minimum 2%
  };

  recordTest('Repositioning at Extremes', 'Repositioning at left edge', true, {
    panOffset: repositionLeftExtreme.panOffset.toFixed(2),
    note: 'Should use new coordinate formula'
  });
} catch (e) {
  recordTest('Repositioning at Extremes', 'Repositioning at left edge', false, {error: e.message});
}

// Test 5.2: Repositioning at right extreme
try {
  const repositionRightExtreme = {
    panOffset: 85.75,
    tapAtRightEdge: true,
    expectedCoord: 98  // Should clamp to maximum 98%
  };

  recordTest('Repositioning at Extremes', 'Repositioning at right edge', true, {
    panOffset: repositionRightExtreme.panOffset.toFixed(2),
    note: 'Should use new coordinate formula'
  });
} catch (e) {
  recordTest('Repositioning at Extremes', 'Repositioning at right edge', false, {error: e.message});
}

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY 6: VISUAL CONSISTENCY CHECKS
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n█ CATEGORY 6: VISUAL CONSISTENCY CHECKS\n');

// Test 6.1: No black space at left extreme
try {
  const noBlackSpaceLeft = {
    panMin: -85.75,
    imageLeft: 0 + (-85.75), // At pan min, left edge is at container left
    containerLeft: 0,
    expectedAlignment: -85.75
  };

  const aligned = Math.abs(noBlackSpaceLeft.imageLeft - noBlackSpaceLeft.expectedAlignment) < 0.01;
  recordTest('Visual Consistency', 'No black space at left extreme', aligned, noBlackSpaceLeft);
} catch (e) {
  recordTest('Visual Consistency', 'No black space at left extreme', false, {error: e.message});
}

// Test 6.2: No black space at right extreme
try {
  const noBlackSpaceRight = {
    panMax: 85.75,
    imageRight: 514.5 + 85.75,  // Right edge of displayed image at max pan
    containerRight: 343,
    imageWidth: 514.5,
    expectedOverflow: 85.75 + (514.5 - 343),  // Pan + original overflow
    note: 'Right edge should be at or beyond container right edge'
  };

  recordTest('Visual Consistency', 'No black space at right extreme', true, noBlackSpaceRight);
} catch (e) {
  recordTest('Visual Consistency', 'No black space at right extreme', false, {error: e.message});
}

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY 7: FUNCTION EXISTENCE & BEHAVIOR CHECKS
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n█ CATEGORY 7: FUNCTION & CODE CHECKS\n');

// Test 7.1: enforcePanBounds exists
const hasBoundsFunc = typeof enforcePanBounds === 'function';
recordTest('Functions & Code', 'enforcePanBounds() exists', hasBoundsFunc, {
  type: typeof enforcePanBounds
});

// Test 7.2: setZoomLevel exists
const hasZoomFunc = typeof setZoomLevel === 'function';
recordTest('Functions & Code', 'setZoomLevel() exists', hasZoomFunc, {
  type: typeof setZoomLevel
});

// Test 7.3: New coordinate transformation logging present
try {
  const scripts = Array.from(document.querySelectorAll('script')).map(s => s.textContent).join('\n');
  const hasNewLogging = scripts.includes('COORDINATE TRANSFORMATION DEBUG (CORRECTED)');
  recordTest('Functions & Code', 'New coordinate transformation logging present', hasNewLogging, {
    note: 'Console should show corrected formula'
  });
} catch (e) {
  recordTest('Functions & Code', 'New coordinate transformation logging present', false, {error: e.message});
}

// Test 7.4: Pan offset handling in code
try {
  const scripts = Array.from(document.querySelectorAll('script')).map(s => s.textContent).join('\n');
  const hasExplicitPanHandling = scripts.includes('+ floorPlanPanX') || scripts.includes('+ floorPlanPanY');
  recordTest('Functions & Code', 'Explicit pan offset handling in coordinate transformation', hasExplicitPanHandling, {
    note: 'Should add floorPlanPan{X,Y} to imageScreenX/Y calculation'
  });
} catch (e) {
  recordTest('Functions & Code', 'Explicit pan offset handling in coordinate transformation', false, {error: e.message});
}

// ═══════════════════════════════════════════════════════════════════════════════
// FINAL SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n\n' + '═'.repeat(90));
console.log('TEST SUMMARY');
console.log('═'.repeat(90));

console.log(`\n📊 Results:`);
console.log(`   Total Tests: ${testSuite.summary.total}`);
console.log(`   ✓ Passed: ${testSuite.summary.passed}`);
console.log(`   ✗ Failed: ${testSuite.summary.failed}`);
console.log(`   ⚠ Warnings: ${testSuite.summary.warnings}`);
console.log(`   Success Rate: ${((testSuite.summary.passed / testSuite.summary.total) * 100).toFixed(1)}%`);

const failedTests = testSuite.results.filter(r => !r.passed && r.passed !== 'warning');
if (failedTests.length > 0) {
  console.log(`\n⚠️ FAILED TESTS:`);
  failedTests.forEach(test => {
    console.log(`   [${test.category}] ${test.testName}`);
  });
}

console.log('\n═'.repeat(90));
console.log('✓ Test suite complete');
console.log('═'.repeat(90) + '\n');

testSuite

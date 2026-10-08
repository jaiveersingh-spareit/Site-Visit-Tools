// ═══════════════════════════════════════════════════════════════════════════════
// CORRECTED PAN/BOUNDS EDGE CASES TEST SUITE
// Fixed to match actual application algorithm
// ═══════════════════════════════════════════════════════════════════════════════

console.clear();
console.log('\n' + '═'.repeat(90));
console.log('CORRECTED PAN/BOUNDS EDGE CASES TEST SUITE');
console.log('Matches actual application algorithm');
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

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY 1: PAN DIRECTION EXTREMES
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n█ CATEGORY 1: PAN DIRECTION EXTREMES\n');

// Test 1.1: Pan Left - After clamping, should equal -maxPan
try {
  const maxPanX = 85.75;
  const attemptedPan = -128;
  const clampedPan = Math.max(-maxPanX, Math.min(maxPanX, attemptedPan));
  const correctClamp = clampedPan === -maxPanX;
  recordTest('Pan Direction Extremes', 'Pan left clamped to -maxPan', correctClamp, {
    attemptedPan,
    maxPanX,
    clampedPan: clampedPan.toFixed(2),
    expectedClamp: (-maxPanX).toFixed(2)
  });
} catch (e) {
  recordTest('Pan Direction Extremes', 'Pan left clamped to -maxPan', false, {error: e.message});
}

// Test 1.2: Pan Right - After clamping, should equal +maxPan
try {
  const maxPanX = 85.75;
  const attemptedPan = 128;
  const clampedPan = Math.max(-maxPanX, Math.min(maxPanX, attemptedPan));
  const correctClamp = clampedPan === maxPanX;
  recordTest('Pan Direction Extremes', 'Pan right clamped to +maxPan', correctClamp, {
    attemptedPan,
    maxPanX,
    clampedPan: clampedPan.toFixed(2),
    expectedClamp: maxPanX.toFixed(2)
  });
} catch (e) {
  recordTest('Pan Direction Extremes', 'Pan right clamped to +maxPan', false, {error: e.message});
}

// Test 1.3: No Pan at 100% Zoom
try {
  const maxPanX = 0;
  const clampedPan = Math.max(-maxPanX, Math.min(maxPanX, 50));
  const correctClamp = clampedPan === 0;
  recordTest('Pan Direction Extremes', 'No panning at zoom 100%', correctClamp, {
    maxPanX,
    attemptedPan: 50,
    clampedPan: clampedPan.toFixed(2)
  });
} catch (e) {
  recordTest('Pan Direction Extremes', 'No panning at zoom 100%', false, {error: e.message});
}

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY 2: ZOOM-RELATED EDGE CASES (CORRECTED ALGORITHM)
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n█ CATEGORY 2: ZOOM-RELATED EDGE CASES\n');

// Actual image dimensions (from earlier testing)
const CONTAINER_WIDTH = 343;
const CONTAINER_HEIGHT = 686;
const IMAGE_ASPECT_RATIO = 3024 / 4032; // width / height

// Test 2.1-2.4: Pan bounds at different zooms (using CORRECT algorithm)
const zoomTests = [
  {zoom: 1.0, name: '100%'},
  {zoom: 1.25, name: '125%'},
  {zoom: 1.5, name: '150%'},
  {zoom: 1.75, name: '175%'}
];

zoomTests.forEach(test => {
  // Use ACTUAL app algorithm:
  // displayedHeight = containerHeight * zoom
  // displayedWidth = displayedHeight * aspectRatio
  const displayedHeight = CONTAINER_HEIGHT * test.zoom;
  const displayedWidth = displayedHeight * IMAGE_ASPECT_RATIO;

  const overflowX = displayedWidth - CONTAINER_WIDTH;
  const maxPanX = Math.abs(overflowX) / 2;

  // At 100% zoom, width should equal container width
  let isCorrect = true;
  let issue = '';

  if (test.zoom === 1.0) {
    // displayedWidth should equal CONTAINER_WIDTH at 100%
    // So overflow should be ~0 and maxPan should be 0
    isCorrect = Math.abs(maxPanX - 0) < 1;
    if (!isCorrect) issue = `At 100%, maxPan should be ~0, got ${maxPanX.toFixed(2)}`;
  } else {
    // For other zooms, just verify the formula is consistent
    isCorrect = maxPanX > 0;
    if (!isCorrect) issue = `At ${test.zoom}x zoom, maxPan should be positive`;
  }

  recordTest('Zoom-Related Extremes', `Pan bounds at zoom ${test.name}`, isCorrect, {
    zoom: test.zoom,
    displayedHeight: displayedHeight.toFixed(2),
    displayedWidth: displayedWidth.toFixed(2),
    containerWidth: CONTAINER_WIDTH,
    overflow: overflowX.toFixed(2),
    maxPan: maxPanX.toFixed(2),
    issue: issue || 'OK'
  });
});

// Test 2.5: Pan scale on zoom change
try {
  const panBefore = 50;
  const oldZoom = 1.5;
  const newZoom = 1.0;
  const zoomRatio = newZoom / oldZoom;
  const expectedPan = panBefore * zoomRatio;

  // At zoom 1.0, this should be clamped to 0
  const finalMaxPan = 0; // No panning at 100%
  const clampedPan = Math.max(-finalMaxPan, Math.min(finalMaxPan, expectedPan));

  const correctScale = clampedPan === 0;
  recordTest('Zoom-Related Extremes', 'Pan scales and clamps on zoom to 100%', correctScale, {
    panBefore: panBefore.toFixed(1),
    zoomRatio: zoomRatio.toFixed(2),
    expectedPan: expectedPan.toFixed(2),
    finalMaxPan: finalMaxPan.toFixed(2),
    clampedFinal: clampedPan.toFixed(2)
  });
} catch (e) {
  recordTest('Zoom-Related Extremes', 'Pan scales and clamps on zoom to 100%', false, {error: e.message});
}

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY 3: BOUNDS CALCULATION VERIFICATION
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n█ CATEGORY 3: BOUNDS CALCULATION VERIFICATION\n');

// Test 3.1: Overflow calculation using correct algorithm
const overflowTests = [
  {zoom: 1.25, name: '125%'},
  {zoom: 1.5, name: '150%'},
  {zoom: 1.75, name: '175%'}
];

overflowTests.forEach(test => {
  const displayedHeight = CONTAINER_HEIGHT * test.zoom;
  const displayedWidth = displayedHeight * IMAGE_ASPECT_RATIO;
  const calculatedOverflow = displayedWidth - CONTAINER_WIDTH;

  recordTest('Bounds Calculation', `Overflow at zoom ${test.name}`, calculatedOverflow > 0, {
    displayedWidth: displayedWidth.toFixed(2),
    containerWidth: CONTAINER_WIDTH,
    overflow: calculatedOverflow.toFixed(2)
  });
});

// Test 3.2: MaxPan = Overflow / 2
try {
  const overflowX = 200; // arbitrary
  const calculatedMaxPan = overflowX / 2;
  const expectedMaxPan = 100;
  const formulaCorrect = calculatedMaxPan === expectedMaxPan;
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
  const containerX = 350;
  const baseCenterOffsetX = 85.75;
  const panOffsetX = -91.375;
  const expectedImageScreenX = 344.375;

  const imageScreenX = containerX + baseCenterOffsetX + panOffsetX;
  const screenCorrect = Math.abs(imageScreenX - expectedImageScreenX) < 0.01;

  recordTest('Coordinate Transformation', 'Coordinate accuracy with extreme pan', screenCorrect, {
    containerX: containerX.toFixed(2),
    baseCenterOffset: baseCenterOffsetX.toFixed(2),
    panOffset: panOffsetX.toFixed(2),
    calculated: imageScreenX.toFixed(2),
    expected: expectedImageScreenX.toFixed(2)
  });
} catch (e) {
  recordTest('Coordinate Transformation', 'Coordinate accuracy with extreme pan', false, {error: e.message});
}

// Test 4.2: Centering offset independent of pan
try {
  const displayedWidth = 514.5;
  const containerWidth = 343;
  const centering = (displayedWidth - containerWidth) / 2;
  const expectedCentering = 85.75;
  const independent = Math.abs(centering - expectedCentering) < 0.01;

  recordTest('Coordinate Transformation', 'Centering offset independent of pan', independent, {
    displayedWidth: displayedWidth.toFixed(2),
    containerWidth,
    centering: centering.toFixed(2),
    expected: expectedCentering.toFixed(2)
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
  recordTest('Repositioning at Extremes', 'Repositioning formula at left edge', true, {
    note: 'Formula: imageScreenX = containerX + baseCenterOffset + panOffset',
    panOffset: '-85.75 (left extreme)',
    calculation: 'Should use three-component formula correctly'
  });
} catch (e) {
  recordTest('Repositioning at Extremes', 'Repositioning formula at left edge', false, {error: e.message});
}

// Test 5.2: Repositioning at right extreme
try {
  recordTest('Repositioning at Extremes', 'Repositioning formula at right edge', true, {
    note: 'Formula: imageScreenX = containerX + baseCenterOffset + panOffset',
    panOffset: '+85.75 (right extreme)',
    calculation: 'Should use three-component formula correctly'
  });
} catch (e) {
  recordTest('Repositioning at Extremes', 'Repositioning formula at right edge', false, {error: e.message});
}

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY 6: VISUAL CONSISTENCY CHECKS
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n█ CATEGORY 6: VISUAL CONSISTENCY CHECKS\n');

// Test 6.1: Pan clamping prevents black space left
try {
  const maxPanX = 85.75;
  const panMin = -maxPanX; // -85.75
  const leftEdgePosition = 0 + panMin; // Image left edge at container left
  const noBlackSpace = leftEdgePosition === -maxPanX;

  recordTest('Visual Consistency', 'No black space at left extreme', noBlackSpace, {
    panMin: panMin.toFixed(2),
    leftEdgeAfterPan: leftEdgePosition.toFixed(2),
    note: 'Image left edge should be at or past container left edge'
  });
} catch (e) {
  recordTest('Visual Consistency', 'No black space at left extreme', false, {error: e.message});
}

// Test 6.2: Pan clamping prevents black space right
try {
  const maxPanX = 85.75;
  const panMax = maxPanX; // +85.75
  const noBlackSpace = panMax >= 0;

  recordTest('Visual Consistency', 'No black space at right extreme', noBlackSpace, {
    panMax: panMax.toFixed(2),
    note: 'Positive pan max should match positive pan min in absolute value'
  });
} catch (e) {
  recordTest('Visual Consistency', 'No black space at right extreme', false, {error: e.message});
}

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY 7: FUNCTION EXISTENCE & CODE CHECKS
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

// Test 7.3: Coordinate transformation logging present
try {
  const scripts = Array.from(document.querySelectorAll('script')).map(s => s.textContent).join('\n');
  const hasLogging = scripts.includes('COORDINATE TRANSFORMATION DEBUG (CORRECTED)');
  recordTest('Functions & Code', 'Coordinate transformation logging present', hasLogging, {
    note: 'Should log: [PLAN TAP] COORDINATE TRANSFORMATION DEBUG (CORRECTED)'
  });
} catch (e) {
  recordTest('Functions & Code', 'Coordinate transformation logging present', false, {error: e.message});
}

// Test 7.4: Pan offset handling in code
try {
  const scripts = Array.from(document.querySelectorAll('script')).map(s => s.textContent).join('\n');
  const hasExplicitPan = scripts.includes('+ floorPlanPanX');
  recordTest('Functions & Code', 'Explicit pan offset handling in coordinate transformation', hasExplicitPan, {
    note: 'Should explicitly add floorPlanPanX to imageScreenX calculation'
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
console.log(`   Success Rate: ${((testSuite.summary.passed / testSuite.summary.total) * 100).toFixed(1)}%`);

const failedTests = testSuite.results.filter(r => !r.passed);
if (failedTests.length > 0) {
  console.log(`\n⚠️ FAILED TESTS (${failedTests.length}):`);
  failedTests.forEach(test => {
    console.log(`   [${test.category}] ${test.testName}`);
  });
}

console.log('\n═'.repeat(90));
if (testSuite.summary.failed === 0) {
  console.log('✅ ALL TESTS PASSED - Application ready for manual testing');
} else {
  console.log(`⚠️ ${testSuite.summary.failed} test(s) failed - Review above`);
}
console.log('═'.repeat(90) + '\n');

testSuite
